/**
 * adversarial_bundle_ptr_stress.js
 * =========================================================================
 * Empirical Challenger Adversarial Test Suite for Pull-to-Refresh
 * Tests across:
 *   1. js/modules/pokedex/pokedex_ui.js (Source module)
 *   2. js/modules/app.js (Master bundle)
 *   3. js/modules/app.min.js (Minified production bundle)
 *
 * Covers 6 Key Edge Cases:
 *   - EC1: Scrolled container with rapid touchstart/touchmove/touchend
 *   - EC2: TextNode touch targets inside buttons, guides, chips
 *   - EC3: Upward swipes (deltaY < 0) followed by downward swipes without lift
 *   - EC4: Rapid tab switches during active touch drag
 *   - EC5: Modal opening during active touch drag
 *   - EC6: System touchcancel interruption
 *
 * Rules: Zero Emojis, Zero Decorative Glyphs, Anti-Hardcoded Root Resolution.
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

function createIsolatedTestHarness(sourcePath, isMinified = false) {
  const listeners = {};

  class MockNode {
    constructor(nodeType, nodeName) {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.parentNode = null;
      this.parentElement = null;
    }
  }

  class MockTextNode extends MockNode {
    constructor(text) {
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
      this.scrollHeight = 1000;
      this.offsetHeight = 500;
      this.children = [];
      this.offsetParent = {};
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

    removeAttribute(key) {
      delete this[key];
    }

    getAttribute(key) {
      return this[key] || null;
    }

    addEventListener(evt, fn) {
      // element-level listener mock
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

  let reloadTriggered = false;
  let reloadCallCount = 0;

  const mockWindow = {
    pageYOffset: 0,
    innerHeight: 800,
    innerWidth: 400,
    location: {
      reload() {
        reloadTriggered = true;
        reloadCallCount++;
      },
      href: 'http://localhost/',
      hash: ''
    },
    getComputedStyle(el) {
      if (el && el.style && el.style.display === 'none') {
        return { display: 'none', position: 'static' };
      }
      return { display: 'block', position: 'static' };
    },
    isAnyOverlayOpen() {
      return false;
    },
    addEventListener(evt, fn) {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    },
    scrollTo() {},
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    localStorage: {
      getItem() { return null; },
      setItem() {},
      removeItem() {}
    }
  };

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
    querySelector(selector) {
      return docBody.querySelector(selector);
    },
    querySelectorAll(selector) {
      return docBody.querySelectorAll(selector);
    },
    addEventListener(evt, fn) {
      listeners[evt] = listeners[evt] || [];
      listeners[evt].push(fn);
    }
  };

  const origAppend = docBody.appendChild.bind(docBody);
  docBody.appendChild = function(child) {
    if (child && child.id) {
      elementsById[child.id] = child;
    }
    return origAppend(child);
  };

  const code = fs.readFileSync(sourcePath, 'utf8');

  let initPtrSnippet = '';
  if (!isMinified) {
    const initPtrStart = code.indexOf('function initPullToRefresh()');
    const closingMarker = 'PokemonApp.initPullToRefresh = initPullToRefresh;\n    }';
    const closingIdx = code.indexOf(closingMarker, initPtrStart);
    if (initPtrStart === -1 || closingIdx === -1) {
      throw new Error(`Failed to locate initPullToRefresh in ${sourcePath}`);
    }
    const initPtrEnd = closingIdx + closingMarker.length;
    initPtrSnippet = code.slice(initPtrStart, initPtrEnd) + '\nreturn { initPullToRefresh };';
  }

  const sandbox = {
    document: mockDocument,
    window: mockWindow,
    localStorage: mockWindow.localStorage,
    setTimeout: (fn) => fn(),
    clearTimeout: () => {},
    console,
    PokemonApp: {},
    module: { exports: {} }
  };

  if (!isMinified) {
    const script = new vm.Script(`(function() { ${initPtrSnippet} })()`);
    const exportsObj = script.runInNewContext(sandbox);
    exportsObj.initPullToRefresh();
  } else {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    // Execute DOMContentLoaded which invokes initPullToRefresh()
    if (listeners['DOMContentLoaded']) {
      listeners['DOMContentLoaded'].forEach(fn => fn());
    }
  }

  const ptrEl = elementsById['pull-to-refresh-indicator'];

  function touchStart(target, clientX, clientY, touches = null) {
    const evt = {
      target,
      touches: touches || [{ clientX, clientY }],
      cancelable: true,
      preventDefault: () => {}
    };
    listeners.touchstart.forEach(fn => fn(evt));
  }

  function touchMove(target, clientX, clientY, touches = null) {
    const evt = {
      target,
      touches: touches || [{ clientX, clientY }],
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
    listeners.touchcancel.forEach(fn => fn(evt));
  }

  return {
    docBody,
    docElement,
    elementsById,
    ptrEl,
    mockWindow,
    MockElement,
    MockTextNode,
    touchStart,
    touchMove,
    touchEnd,
    touchCancel,
    isReloadTriggered: () => reloadTriggered,
    getReloadCallCount: () => reloadCallCount,
    resetReload: () => { reloadTriggered = false; reloadCallCount = 0; },
    cancelPullToRefresh: () => {
      if (typeof sandbox.window.cancelPullToRefresh === 'function') {
        sandbox.window.cancelPullToRefresh();
      }
    }
  };
}

// -----------------------------------------------------------------------------
// Test Definition Suite
// -----------------------------------------------------------------------------

function runEdgeCaseSuite(artifactName, sourcePath, isMinified = false) {
  const tests = [];
  function test(name, fn) {
    tests.push({ name: `[${artifactName}] ${name}`, fn });
  }

  // EC1: Scrolled Container with Rapid Touchstart/Touchmove/Touchend
  test('EC1.1: Scrolled ancestor container suppresses touchstart and stays inactive', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const scrollContainer = new env.MockElement('DIV', 'panel-box', 'view-panel');
    scrollContainer.scrollTop = 50;
    const item = new env.MockElement('DIV', '', 'box-card');
    scrollContainer.appendChild(item);
    env.docBody.appendChild(scrollContainer);

    env.touchStart(item, 100, 100);
    env.touchMove(item, 100, 200);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('Reload should not trigger when ancestor scrollTop > 0');
    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator should not be active when container is scrolled');
    }
  });

  test('EC1.2: Subpixel ancestor scrollTop (0.5px) suppresses PTR activation', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const container = new env.MockElement('DIV', 'scroll-wrap');
    container.scrollTop = 0.5;
    const child = new env.MockElement('SPAN');
    container.appendChild(child);
    env.docBody.appendChild(container);

    env.touchStart(child, 100, 100);
    env.touchMove(child, 100, 250);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('Reload should not trigger with subpixel scrollTop');
  });

  test('EC1.3: Active pull immediately aborted when container scrolls during move', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const container = new env.MockElement('DIV', 'scroll-wrap');
    container.scrollTop = 0;
    const child = new env.MockElement('DIV');
    container.appendChild(child);
    env.docBody.appendChild(container);

    env.touchStart(child, 100, 100);
    env.touchMove(child, 100, 140); // 40px pull down -> active
    if (env.ptrEl && !env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator should be active during 40px pull down at top');
    }

    container.scrollTop = 25; // Momentum scroll starts
    env.touchMove(child, 100, 180); // Next touchmove detects scrollTop > 0

    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must be deactivated immediately when scrollTop > 0');
    }
    env.touchEnd();
    if (env.isReloadTriggered()) throw new Error('Reload should not trigger after abort');
  });

  test('EC1.4: Rapid touchstart on scrolled container resets tracking and indicator', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const topContainer = new env.MockElement('DIV');
    env.docBody.appendChild(topContainer);

    env.touchStart(topContainer, 100, 100);
    env.touchMove(topContainer, 100, 150); // In progress pull

    const scrolledContainer = new env.MockElement('DIV');
    scrolledContainer.scrollTop = 80;
    env.docBody.appendChild(scrolledContainer);

    env.touchStart(scrolledContainer, 100, 100); // Rapid second touchstart on scrolled container
    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator should be hidden on new touchstart on scrolled element');
    }
    env.touchMove(scrolledContainer, 100, 250);
    env.touchEnd();
    if (env.isReloadTriggered()) throw new Error('Reload should not trigger on scrolled element');
  });

  // EC2: TextNode Touch Targets Inside Buttons, Guides, Chips
  test('EC2.1: TextNode inside #box-dropzone is excluded from PTR', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const dropzone = new env.MockElement('DIV', 'box-dropzone');
    const label = new env.MockElement('SPAN');
    const textNode = new env.MockTextNode('Drop screenshots here');
    label.appendChild(textNode);
    dropzone.appendChild(label);
    env.docBody.appendChild(dropzone);

    env.touchStart(textNode, 100, 100);
    env.touchMove(textNode, 100, 250);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('TextNode in dropzone should not trigger reload');
  });

  test('EC2.2: TextNode inside #box-screenshot-guide-card is excluded from PTR', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const guideCard = new env.MockElement('DIV', 'box-screenshot-guide-card');
    const btn = new env.MockElement('BUTTON');
    const textNode = new env.MockTextNode('How to take screenshots');
    btn.appendChild(textNode);
    guideCard.appendChild(btn);
    env.docBody.appendChild(guideCard);

    env.touchStart(textNode, 100, 100);
    env.touchMove(textNode, 100, 250);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('TextNode in guide card should not trigger reload');
  });

  test('EC2.3: TextNode inside .box-top-banner and .controls-container is excluded', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const banner = new env.MockElement('DIV', '', 'box-top-banner');
    const textNode = new env.MockTextNode('Sync status banner');
    banner.appendChild(textNode);
    env.docBody.appendChild(banner);

    env.touchStart(textNode, 100, 100);
    env.touchMove(textNode, 100, 250);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('TextNode in banner should not trigger reload');
  });

  test('EC2.4: Orphaned TextNode without parentElement does not throw TypeError', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const orphanText = new env.MockTextNode('floating');

    // Must not crash
    env.touchStart(orphanText, 100, 100);
    env.touchMove(orphanText, 100, 150);
    env.touchEnd();
  });

  // EC3: Upward Swipes (deltaY < 0) Followed by Downward Swipes Without Lift
  test('EC3.1: Upward swipe (deltaY < -4) permanently locks gesture, downward swipe ignored', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 200);
    env.touchMove(panel, 100, 195); // deltaY = -5px < -4px (upward swipe)
    env.touchMove(panel, 100, 350); // deltaY = +150px (downward pull without lifting finger)
    env.touchEnd();

    if (env.isReloadTriggered()) {
      throw new Error('Direction reversal without finger lift must not trigger reload');
    }
    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must remain inactive after upward lock');
    }
  });

  test('EC3.2: Pull down +30px then swipe up -10px cancels tracking for rest of gesture', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 200);
    env.touchMove(panel, 100, 230); // deltaY = +30px (pull)
    env.touchMove(panel, 100, 190); // deltaY = -10px < -4px (reversal)
    env.touchMove(panel, 100, 380); // deltaY = +180px (massive pull)
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('Reversal should permanently prevent reload');
  });

  test('EC3.3: Horizontal drift (|deltaX| > deltaY) permanently cancels tracking', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 100);
    env.touchMove(panel, 160, 140); // deltaX = 60, deltaY = 40 -> |deltaX| > deltaY
    env.touchMove(panel, 160, 300); // Downward pull after drift
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('Lateral drift should not trigger reload');
  });

  // EC4: Rapid Tab Switches During Active Touch Drag
  test('EC4.1: Switching tab via cancelPullToRefresh resets UI and prevents reload on touchend', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const boxPanel = new env.MockElement('DIV', 'panel-box');
    env.docBody.appendChild(boxPanel);

    env.touchStart(boxPanel, 100, 100);
    env.touchMove(boxPanel, 100, 200); // 100px pull down -> active UI

    env.cancelPullToRefresh(); // Tab switch hook

    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must be cleared when cancelPullToRefresh is called');
    }
    env.touchEnd();
    if (env.isReloadTriggered()) throw new Error('Reload should not trigger after tab switch');
  });

  test('EC4.2: Target element hidden by tab router prevents reload even without manual cancel hook', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const boxPanel = new env.MockElement('DIV', 'panel-box');
    env.docBody.appendChild(boxPanel);

    env.touchStart(boxPanel, 100, 100);
    env.touchMove(boxPanel, 100, 220); // 120px pull down -> eligible for reload

    // Router hides panel without calling cancelPullToRefresh
    boxPanel.style.display = 'none';

    env.touchEnd();
    if (env.isReloadTriggered()) {
      throw new Error('Reload must be aborted when active touch target is hidden (isTargetVisible false)');
    }
  });

  test('EC4.3: Rapid 20-iteration tab switch stress does not leave orphaned state', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV', 'panel-box');
    env.docBody.appendChild(panel);

    for (let i = 0; i < 20; i++) {
      env.touchStart(panel, 100, 100);
      env.touchMove(panel, 100, 150);
      env.cancelPullToRefresh();
      env.touchEnd();
    }
    if (env.isReloadTriggered()) throw new Error('Stress cycle should never trigger reload');
    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator should remain clean');
    }
  });

  // EC5: Modal Opening During Active Touch Drag
  test('EC5.1: Modal opening during active pull terminates tracking on next touchmove', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 100);
    env.touchMove(panel, 100, 160); // Active pull

    env.docBody.classList.add('modal-open');
    env.touchMove(panel, 100, 220); // Touchmove while modal open

    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must be reset when modal opens during drag');
    }
    env.touchEnd();
    if (env.isReloadTriggered()) throw new Error('Reload should not trigger when modal opens');
  });

  test('EC5.2: Modal opening during active pull aborts reload on direct touchend without move', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 100);
    env.touchMove(panel, 100, 220); // > 64px pull

    env.docBody.classList.add('overlay-open');
    env.touchEnd(); // Direct release

    if (env.isReloadTriggered()) throw new Error('Touchend must abort reload when overlay-open is active');
  });

  test('EC5.3: Touchstart while modal is active rejects tracking', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const modal = new env.MockElement('DIV', 'pokedex-detail-modal');
    modal.style.display = 'flex';
    env.docBody.appendChild(modal);

    env.touchStart(modal, 100, 100);
    env.touchMove(modal, 100, 250);
    env.touchEnd();

    if (env.isReloadTriggered()) throw new Error('Touchstart inside open modal must never trigger reload');
  });

  // EC6: System touchcancel Interruption
  test('EC6.1: System touchcancel immediately hides indicator and resets state', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 100);
    env.touchMove(panel, 100, 180); // Pull 80px

    if (env.ptrEl && !env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator should be active');
    }

    env.touchCancel(); // System gesture interruption

    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must be deactivated on touchcancel');
    }
    env.touchEnd();
    if (env.isReloadTriggered()) throw new Error('Subsequent touchend must not trigger reload');
  });

  test('EC6.2: 50 iterations of alternating touchstart/touchmove/touchcancel stress', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV');
    env.docBody.appendChild(panel);

    for (let i = 0; i < 50; i++) {
      env.touchStart(panel, 100, 100);
      env.touchMove(panel, 100, 160 + (i % 30));
      env.touchCancel();
    }
    if (env.isReloadTriggered()) throw new Error('Stress touchcancel cycle triggered reload');
    if (env.ptrEl && env.ptrEl.classList.contains('ptr-active')) {
      throw new Error('Indicator must be clean after stress cycles');
    }
  });

  // Legitimate Positive Control: Ensure Valid Pull Works Cleanly
  test('POS.1: Legitimate pull > 64px from top triggers reload exactly once', () => {
    const env = createIsolatedTestHarness(sourcePath, isMinified);
    const panel = new env.MockElement('DIV', 'panel-pokemon');
    env.docBody.appendChild(panel);

    env.touchStart(panel, 100, 100);
    env.touchMove(panel, 100, 220); // deltaY = 120px > 86.9px (currentPull > 64px)
    env.touchEnd();

    if (!env.isReloadTriggered()) throw new Error('Legitimate pull at top must trigger reload');
    if (env.getReloadCallCount() !== 1) {
      throw new Error(`Expected exactly 1 reload, got ${env.getReloadCallCount()}`);
    }
  });

  return tests;
}

// -----------------------------------------------------------------------------
// Runner
// -----------------------------------------------------------------------------

function runAllSuites() {
  const artifacts = [
    { name: 'pokedex_ui.js (Source)', path: path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_ui.js'), isMin: false },
    { name: 'app.js (Master Bundle)', path: path.join(WORKSPACE_ROOT, 'js/modules/app.js'), isMin: false },
    { name: 'app.min.js (Prod Bundle)', path: path.join(WORKSPACE_ROOT, 'js/modules/app.min.js'), isMin: true }
  ];

  let totalCount = 0;
  let passCount = 0;
  let failCount = 0;
  const failureList = [];

  console.log('================================================================');
  console.log('   Adversarial Bundle PTR Stress Suite (Empirical Challenger)   ');
  console.log('================================================================\n');

  for (const art of artifacts) {
    console.log(`--- Testing Artifact: ${art.name} ---`);
    const tests = runEdgeCaseSuite(art.name, art.path, art.isMin);
    for (const t of tests) {
      totalCount++;
      try {
        t.fn();
        passCount++;
        console.log(`  [PASS] ${t.name}`);
      } catch (err) {
        failCount++;
        failureList.push({ name: t.name, error: err.message });
        console.error(`  [FAIL] ${t.name}`);
        console.error(`         ${err.message}`);
      }
    }
    console.log('');
  }

  console.log('----------------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passCount} / ${totalCount} Passed (${failCount} Failed)`);
  console.log('----------------------------------------------------------------\n');

  if (failCount > 0) {
    console.error('Failure Details:');
    failureList.forEach(f => console.error(` - ${f.name}: ${f.error}`));
    return false;
  }
  return true;
}

if (require.main === module) {
  const success = runAllSuites();
  process.exit(success ? 0 : 1);
}

module.exports = { runAllSuites, runEdgeCaseSuite };
