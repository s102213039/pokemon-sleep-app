/**
 * tests/test_challenger_m2_3.js
 * Empirical Challenger M2-3 Adversarial Stress Harness:
 * Target Normalization, TextNodes, touchcancel Interruption, and Legitimate Reload.
 *
 * Focus:
 * 1. Deeply nested TextNodes (10+ levels) inside dropzone, guide card, and excluded selectors
 * 2. TextNodes with edge-case contents (empty string, whitespace, unicode) and detached nodes
 * 3. touchcancel interruptions at all phases: deadzone, active drag, and past threshold
 * 4. Rapid repeated touchcancel events and post-interruption gesture recovery
 * 5. Preservation of legitimate pull-to-refresh reload on content areas and text nodes at top
 * 6. Concurrency guards, line budget (<=1000 lines), and zero-emoji compliance
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log('  [PASS] ' + message);
  } else {
    failCount++;
    console.error('  [FAIL] ' + message);
    failures.push(message);
  }
}

function createTestEnvironment(customCode = null) {
  const listeners = {
    touchstart: [],
    touchmove: [],
    touchend: [],
    touchcancel: []
  };

  class MockNode {
    constructor(nodeType, nodeName) {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.parentNode = null;
      this.parentElement = null;
    }
  }

  class MockTextNode extends MockNode {
    constructor(text = '') {
      super(3, '#text');
      this.textContent = text;
      this.data = text;
    }
  }

  class MockElement extends MockNode {
    constructor(tagName, id = '', className = '') {
      super(1, tagName.toUpperCase());
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this._className = className;
      this.style = {};
      this.scrollTop = 0;
      this.offsetParent = {};
      this.children = [];
      const self = this;
      this.classList = {
        add(...cls) {
          const set = new Set((self._className || '').split(' ').filter(Boolean));
          cls.forEach(c => set.add(c));
          self._className = Array.from(set).join(' ');
        },
        remove(...cls) {
          const set = new Set((self._className || '').split(' ').filter(Boolean));
          cls.forEach(c => set.delete(c));
          self._className = Array.from(set).join(' ');
        },
        contains(c) {
          return new Set((self._className || '').split(' ').filter(Boolean)).has(c);
        }
      };
    }

    get className() { return this._className; }
    set className(val) { this._className = val; }

    appendChild(child) {
      if (child) {
        child.parentNode = this;
        child.parentElement = (this.nodeType === 1) ? this : null;
        this.children.push(child);
      }
      return child;
    }

    setAttribute(key, val) {
      if (key === 'id') this.id = String(val);
      if (key === 'class') this.className = String(val);
      this[key] = val;
    }

    querySelector(selector) {
      if (selector === '.ptr-icon') {
        if (!this._iconEl) this._iconEl = new MockElement('svg', '', 'ptr-icon');
        return this._iconEl;
      }
      for (const child of this.children) {
        if (child.nodeType === 1) {
          if (matches(child, selector)) return child;
          const found = child.querySelector(selector);
          if (found) return found;
        }
      }
      return null;
    }

    querySelectorAll(selector) {
      const results = [];
      for (const child of this.children) {
        if (child.nodeType === 1) {
          if (matches(child, selector)) results.push(child);
          const sub = child.querySelectorAll(selector);
          sub.forEach(el => results.push(el));
        }
      }
      return results;
    }

    closest(selectorList) {
      const selectors = selectorList.split(',').map(s => s.trim());
      let curr = this;
      while (curr && curr.nodeType === 1) {
        for (const sel of selectors) {
          if (matches(curr, sel)) return curr;
        }
        curr = curr.parentElement;
      }
      return null;
    }
  }

  function matches(el, selector) {
    if (!el || !selector) return false;
    selector = selector.trim();
    if (selector.startsWith('#')) return el.id === selector.slice(1);
    if (selector.startsWith('.')) return el.classList.contains(selector.slice(1));
    if (selector.includes('.')) {
      const parts = selector.split('.');
      const tagMatch = !parts[0] || el.tagName === parts[0].toUpperCase();
      const classMatch = parts.slice(1).every(c => el.classList.contains(c));
      return tagMatch && classMatch;
    }
    return el.tagName === selector.toUpperCase();
  }

  const elementsById = {};
  const docBody = new MockElement('BODY', 'body');
  const docElement = new MockElement('HTML', 'html');

  let reloadCount = 0;

  const mockDocument = {
    body: docBody,
    documentElement: docElement,
    getElementById(id) {
      return elementsById[id] || null;
    },
    createElement(tag) {
      return new MockElement(tag);
    },
    createTextNode(text) {
      return new MockTextNode(text);
    },
    querySelectorAll(selector) {
      return docBody.querySelectorAll(selector);
    },
    querySelector(selector) {
      return docBody.querySelector(selector);
    },
    addEventListener(evt, fn) {
      if (listeners[evt]) listeners[evt].push(fn);
    }
  };

  const origAppend = docBody.appendChild.bind(docBody);
  docBody.appendChild = function(child) {
    if (child && child.id) {
      elementsById[child.id] = child;
    }
    return origAppend(child);
  };

  let overlayOpenFn = () => false;

  const mockWindow = {
    pageYOffset: 0,
    location: {
      reload() {
        reloadCount++;
      },
      href: 'http://localhost/'
    },
    getComputedStyle(el) {
      return {
        display: (el && el.style && el.style.display) ? el.style.display : 'block',
        position: (el && el.style && el.style.position) ? el.style.position : 'static'
      };
    },
    isAnyOverlayOpen() {
      return overlayOpenFn();
    }
  };

  const rawCode = customCode || fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_ui.js'), 'utf8');
  const initPtrStart = rawCode.indexOf('function initPullToRefresh()');
  const closingMarker = 'PokemonApp.initPullToRefresh = initPullToRefresh;\n    }';
  const closingIdx = rawCode.indexOf(closingMarker, initPtrStart);
  if (initPtrStart === -1 || closingIdx === -1) {
    throw new Error('Failed to locate initPullToRefresh() in pokedex_ui.js');
  }
  const initPtrEnd = closingIdx + closingMarker.length;
  const initPtrSnippet = rawCode.slice(initPtrStart, initPtrEnd) + '\nreturn { initPullToRefresh };';

  const sandbox = {
    document: mockDocument,
    window: mockWindow,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    PokemonApp: {},
    console
  };

  const script = new vm.Script(`(function() { ${initPtrSnippet} })()`);
  const exportsObj = script.runInNewContext(sandbox);
  exportsObj.initPullToRefresh();

  const ptrEl = elementsById['pull-to-refresh-indicator'];

  function touchStart(target, clientX, clientY, extraTouches = []) {
    const touches = [{ clientX, clientY }, ...extraTouches];
    const evt = {
      target,
      touches,
      cancelable: true,
      preventDefault: () => {}
    };
    listeners.touchstart.forEach(fn => fn(evt));
  }

  function touchMove(target, clientX, clientY, extraTouches = []) {
    const touches = [{ clientX, clientY }, ...extraTouches];
    const evt = {
      target,
      touches,
      cancelable: true,
      preventDefault: () => {}
    };
    listeners.touchmove.forEach(fn => fn(evt));
  }

  function touchEnd() {
    const evt = {
      touches: [],
      cancelable: true,
      preventDefault: () => {}
    };
    listeners.touchend.forEach(fn => fn(evt));
  }

  function touchCancel() {
    const evt = {
      touches: [],
      cancelable: true,
      preventDefault: () => {}
    };
    (listeners.touchcancel || []).forEach(fn => fn(evt));
  }

  return {
    docBody,
    docElement,
    mockDocument,
    mockWindow,
    ptrEl,
    MockElement,
    MockTextNode,
    touchStart,
    touchMove,
    touchEnd,
    touchCancel,
    hasTouchCancelListener: () => (listeners.touchcancel && listeners.touchcancel.length > 0),
    getReloadCount: () => reloadCount,
    resetReloadCount: () => { reloadCount = 0; },
    setOverlayOpenFn: (fn) => { overlayOpenFn = fn; },
    cancelPullToRefresh: sandbox.window.cancelPullToRefresh
  };
}

console.log('================================================================');
console.log('  Challenger M2-3: Empirical Adversarial Verification Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Group 1: Deeply Nested TextNodes & Excluded Controls
// -----------------------------------------------------------------------------
console.log('[Group 1] Deeply Nested TextNodes & Excluded Controls Normalization');

// 1.1 10-level deep TextNode inside #box-screenshot-guide-card
{
  const env = createTestEnvironment();
  const guideCard = new env.MockElement('DIV', 'box-screenshot-guide-card', 'box-screenshot-guide-card');
  let currentParent = guideCard;
  for (let i = 0; i < 9; i++) {
    const child = new env.MockElement('DIV', `guide-level-${i}`, `guide-level-class-${i}`);
    currentParent.appendChild(child);
    currentParent = child;
  }
  const textNode = env.mockDocument.createTextNode('Deeply nested OCR guide step description');
  currentParent.appendChild(textNode);
  env.docBody.appendChild(guideCard);

  env.touchStart(textNode, 100, 100);
  env.touchMove(textNode, 100, 220); // 120px pull
  env.touchEnd();

  assert(!env.ptrEl.classList.contains('ptr-active'), '10-level deep TextNode in guide card must not activate PTR UI');
  assert(env.getReloadCount() === 0, '10-level deep TextNode in guide card must not trigger reload');
}

// 1.2 10-level deep TextNode inside #box-dropzone
{
  const env = createTestEnvironment();
  const dropzone = new env.MockElement('DIV', 'box-dropzone', 'box-dropzone');
  let currentParent = dropzone;
  for (let i = 0; i < 9; i++) {
    const child = new env.MockElement('SPAN', `drop-level-${i}`, `drop-level-class-${i}`);
    currentParent.appendChild(child);
    currentParent = child;
  }
  const textNode = env.mockDocument.createTextNode('Drop your Pokemon screenshot file here');
  currentParent.appendChild(textNode);
  env.docBody.appendChild(dropzone);

  env.touchStart(textNode, 100, 100);
  env.touchMove(textNode, 100, 220);
  env.touchEnd();

  assert(!env.ptrEl.classList.contains('ptr-active'), '10-level deep TextNode in dropzone must not activate PTR UI');
  assert(env.getReloadCount() === 0, '10-level deep TextNode in dropzone must not trigger reload');
}

// 1.3 TextNodes inside various PTR_EXCLUDE_SELECTORS controls
{
  const excludedSelectors = [
    { tag: 'BUTTON', id: 'box-fab', cls: 'box-fab-btn', label: 'FAB Button' },
    { tag: 'DIV', id: 'app-header', cls: 'app-header', label: 'App Header' },
    { tag: 'NAV', id: 'bottom-dock', cls: 'dock-item', label: 'Bottom Dock Item' },
    { tag: 'DIV', id: 'box-top-banner', cls: 'box-top-banner', label: 'Box Top Banner' },
    { tag: 'DIV', id: 'controls-container', cls: 'controls-container', label: 'Controls Container' },
    { tag: 'DIV', id: 'search-filter-row', cls: 'search-filter-row', label: 'Search Filter Row' },
    { tag: 'DIV', id: 'pokedex-detail-modal', cls: 'pokedex-modal-body', label: 'Modal Body' }
  ];

  excludedSelectors.forEach(item => {
    const env = createTestEnvironment();
    const ctrl = new env.MockElement(item.tag, item.id, item.cls);
    const span = new env.MockElement('SPAN', '', 'label');
    const textNode = env.mockDocument.createTextNode(`Text inside ${item.label}`);
    span.appendChild(textNode);
    ctrl.appendChild(span);
    env.docBody.appendChild(ctrl);

    env.touchStart(textNode, 100, 100);
    env.touchMove(textNode, 100, 250); // 150px pull
    env.touchEnd();

    assert(!env.ptrEl.classList.contains('ptr-active'), `TextNode in ${item.label} (${item.cls}) must not activate PTR UI`);
    assert(env.getReloadCount() === 0, `TextNode in ${item.label} (${item.cls}) must not trigger reload`);
  });
}

// 1.4 Empty and whitespace-only TextNodes
{
  const env = createTestEnvironment();
  const dropzone = new env.MockElement('DIV', 'box-dropzone', 'box-dropzone');
  const emptyText = env.mockDocument.createTextNode('');
  const whitespaceText = env.mockDocument.createTextNode('   \n\t   ');
  dropzone.appendChild(emptyText);
  dropzone.appendChild(whitespaceText);
  env.docBody.appendChild(dropzone);

  // Touch empty text
  env.touchStart(emptyText, 100, 100);
  env.touchMove(emptyText, 100, 220);
  env.touchEnd();
  assert(env.getReloadCount() === 0, 'Empty TextNode in dropzone must not trigger reload');

  // Touch whitespace text
  env.touchStart(whitespaceText, 100, 100);
  env.touchMove(whitespaceText, 100, 220);
  env.touchEnd();
  assert(env.getReloadCount() === 0, 'Whitespace TextNode in dropzone must not trigger reload');
}

// 1.5 Detached TextNode (parentElement is null)
{
  const env = createTestEnvironment();
  const detachedText = env.mockDocument.createTextNode('Detached text without parent');

  let errorThrown = false;
  try {
    env.touchStart(detachedText, 100, 100);
    env.touchMove(detachedText, 100, 220);
    env.touchEnd();
  } catch (err) {
    errorThrown = true;
  }

  assert(!errorThrown, 'Detached TextNode (null parent) must not cause runtime crash');
  assert(env.getReloadCount() === 0, 'Detached TextNode must not trigger reload');
}

// 1.6 TextNode inside scrolled container (scrollTop > 0)
{
  const env = createTestEnvironment();
  const table = new env.MockElement('DIV', 'box-table', 'table-container');
  table.scrollTop = 80;
  const row = new env.MockElement('DIV', '', 'pokemon-row');
  const span = new env.MockElement('SPAN', '', 'pokemon-name');
  const textNode = env.mockDocument.createTextNode('Pikachu Lv.50');
  span.appendChild(textNode);
  row.appendChild(span);
  table.appendChild(row);
  env.docBody.appendChild(table);

  env.touchStart(textNode, 100, 100);
  env.touchMove(textNode, 100, 250);
  env.touchEnd();

  assert(!env.ptrEl.classList.contains('ptr-active'), 'TextNode inside scrolled container (scrollTop > 0) must not activate PTR UI');
  assert(env.getReloadCount() === 0, 'TextNode inside scrolled container (scrollTop > 0) must not trigger reload');
}

// -----------------------------------------------------------------------------
// Group 2: touchcancel Lifecycle & Interruption Probes
// -----------------------------------------------------------------------------
console.log('\n[Group 2] touchcancel Lifecycle & Interruption Probes');

// 2.1 touchcancel during deadzone (deltaY = 6px < 12px)
{
  const env = createTestEnvironment();
  const container = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(container);

  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 106); // 6px pull < 12px deadzone

  assert(!env.ptrEl.classList.contains('ptr-active'), 'UI is inactive during deadzone');

  // Interruption occurs
  env.touchCancel();

  // Subsequent move and end
  env.touchMove(container, 100, 250);
  env.touchEnd();

  assert(!env.ptrEl.classList.contains('ptr-active'), 'touchcancel in deadzone must abort tracking');
  assert(env.getReloadCount() === 0, 'touchcancel in deadzone must prevent subsequent reload');
}

// 2.2 touchcancel during active drag (deltaY = 35px, 12 <= deltaY < 64)
{
  const env = createTestEnvironment();
  const container = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(container);

  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 135); // 35px pull -> engages UI

  assert(env.ptrEl.classList.contains('ptr-active'), 'Precondition: UI must be active during 35px drag');

  // System interrupts
  env.touchCancel();

  assert(!env.ptrEl.classList.contains('ptr-active'), 'touchcancel during active drag must immediately deactivate PTR UI');
  assert(env.ptrEl.style.opacity === '0', 'touchcancel must reset PTR opacity to 0');

  // Touchend arrives after cancel
  env.touchEnd();
  assert(env.getReloadCount() === 0, 'touchcancel must prevent touchend from triggering reload');
}

// 2.3 touchcancel past reload threshold (deltaY = 120px, currentPull >= 64px)
{
  const env = createTestEnvironment();
  const container = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(container);

  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 220); // 120px pull -> exceeds threshold

  assert(env.ptrEl.classList.contains('ptr-active'), 'Precondition: PTR UI active past threshold');

  // System interrupts before finger lifted
  env.touchCancel();

  assert(!env.ptrEl.classList.contains('ptr-active'), 'touchcancel past threshold must reset PTR UI immediately');

  // Finger lifts
  env.touchEnd();
  assert(env.getReloadCount() === 0, 'touchcancel past threshold must cancel reload completely');
}

// 2.4 Burst of multiple rapid touchcancel events
{
  const env = createTestEnvironment();
  const container = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(container);

  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 150);

  let noException = true;
  try {
    for (let i = 0; i < 10; i++) {
      env.touchCancel();
    }
  } catch (err) {
    noException = false;
  }

  assert(noException, 'Burst of 10 consecutive touchcancel events must execute cleanly without error');
  assert(!env.ptrEl.classList.contains('ptr-active'), 'PTR UI remains inactive after multiple touchcancel events');
}

// 2.5 Gesture recovery after touchcancel
{
  const env = createTestEnvironment();
  const container = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(container);

  // Gesture 1: Interrupted
  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 150);
  env.touchCancel();
  assert(env.getReloadCount() === 0, 'First gesture was cancelled');

  // Gesture 2: Fresh legitimate pull
  env.touchStart(container, 100, 100);
  env.touchMove(container, 100, 220); // 120px pull -> exceeds threshold
  env.touchEnd();

  assert(env.getReloadCount() === 1, 'Legitimate pull immediately following touchcancel must reload reliably');
}

// -----------------------------------------------------------------------------
// Group 3: Preserved Legitimate Pull-to-Refresh Functionality
// -----------------------------------------------------------------------------
console.log('\n[Group 3] Preserved Legitimate Pull-to-Refresh Functionality');

// 3.1 Legitimate pull on #panel-box at top (scrollTop === 0)
{
  const env = createTestEnvironment();
  const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(panelBox);

  env.touchStart(panelBox, 100, 100);
  env.touchMove(panelBox, 100, 220); // 120px pull
  env.touchEnd();

  assert(env.getReloadCount() === 1, 'Legitimate pull on #panel-box at top must trigger reload');
}

// 3.2 Legitimate pull on #panel-pokemon at top
{
  const env = createTestEnvironment();
  const panelPokemon = new env.MockElement('DIV', 'panel-pokemon', 'view-panel');
  env.docBody.appendChild(panelPokemon);

  env.touchStart(panelPokemon, 100, 100);
  env.touchMove(panelPokemon, 100, 220);
  env.touchEnd();

  assert(env.getReloadCount() === 1, 'Legitimate pull on #panel-pokemon at top must trigger reload');
}

// 3.3 Legitimate pull on #panel-recipes at top
{
  const env = createTestEnvironment();
  const panelRecipes = new env.MockElement('DIV', 'panel-recipes', 'view-panel');
  env.docBody.appendChild(panelRecipes);

  env.touchStart(panelRecipes, 100, 100);
  env.touchMove(panelRecipes, 100, 220);
  env.touchEnd();

  assert(env.getReloadCount() === 1, 'Legitimate pull on #panel-recipes at top must trigger reload');
}

// 3.4 Legitimate pull initiated on child TextNode inside valid content area
{
  const env = createTestEnvironment();
  const panel = new env.MockElement('DIV', 'panel-box', 'view-panel');
  const card = new env.MockElement('DIV', 'box-card-1', 'box-card');
  const title = new env.MockElement('H4', '', 'card-title');
  const textNode = env.mockDocument.createTextNode('Raichu BFS Berry Finder');
  title.appendChild(textNode);
  card.appendChild(title);
  panel.appendChild(card);
  env.docBody.appendChild(panel);

  // User pulls down touching the text of a pokemon card at top of box
  env.touchStart(textNode, 100, 100);
  env.touchMove(textNode, 100, 220);
  env.touchEnd();

  assert(env.getReloadCount() === 1, 'Legitimate pull on TextNode inside content area at top must trigger reload');
}

// 3.5 Insufficient pull (< threshold 64px) on valid content area springs back without reload
{
  const env = createTestEnvironment();
  const panel = new env.MockElement('DIV', 'panel-box', 'view-panel');
  env.docBody.appendChild(panel);

  env.touchStart(panel, 100, 100);
  env.touchMove(panel, 100, 140); // 40px displacement -> currentPull ~ 34px < 64px
  env.touchEnd();

  assert(env.getReloadCount() === 0, 'Partial pull below 64px on content area must not trigger reload');
  assert(!env.ptrEl.classList.contains('ptr-active'), 'Partial pull springs back and removes ptr-active class');
}

// -----------------------------------------------------------------------------
// Group 4: Code Quality, Constraints & Invariants Audit
// -----------------------------------------------------------------------------
console.log('\n[Group 4] Code Quality, Constraints & Invariants Audit');

const pokedexUiPath = path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_ui.js');
const pokedexUiCode = fs.readFileSync(pokedexUiPath, 'utf8');

// 4.1 Line budget check (<= 1000 lines)
const lineCount = pokedexUiCode.split('\n').length;
assert(lineCount <= 1000, `js/modules/pokedex/pokedex_ui.js line count (${lineCount}) is within <= 1000 lines budget`);

// 4.2 Zero Emoji Audit (User Rule VIII)
// Check against emoji regex pattern
const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const containsEmoji = emojiRegex.test(pokedexUiCode);
assert(!containsEmoji, 'js/modules/pokedex/pokedex_ui.js strictly obeys Zero Emoji Policy');

// 4.3 Zero Decorative Glyph Audit (User Rule X)
const glyphRegex = /\[\u2605\]|\[\u2606\]|\u2605|\u2606|\[\*\]/;
const containsGlyph = glyphRegex.test(pokedexUiCode);
assert(!containsGlyph, 'js/modules/pokedex/pokedex_ui.js strictly obeys Zero Decorative Star/Glyph Policy');

// 4.4 Invariant Required Tokens Check
const requiredTokens = [
  'function initPullToRefresh()',
  'window.initPullToRefresh = initPullToRefresh;',
  'PokemonApp.initPullToRefresh = initPullToRefresh;',
  'const PULL_THRESHOLD = 64;',
  'window.location.reload();',
  'if (!isTracking || isRefreshing || !e.touches || !e.touches[0]) return;',
  'document.addEventListener(\'touchcancel\''
];

requiredTokens.forEach(token => {
  assert(pokedexUiCode.includes(token), `Required invariant token preserved: "${token}"`);
});

// -----------------------------------------------------------------------------
// Final Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`TOTAL RESULT: ${passCount} / ${passCount + failCount} Passed (${failCount} Failed)`);
console.log('================================================================\n');

if (failCount > 0) {
  console.error('Failure Details:');
  failures.forEach(f => console.error(' - ' + f));
  process.exit(1);
} else {
  console.log('All empirical challenger M2-3 stress tests PASSED successfully.');
  process.exit(0);
}
