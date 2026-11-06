/**
 * tests/adversarial_challenger_m2_4.js
 * =========================================================================
 * Comprehensive empirical stress-test harness by Challenger M2-4.
 * Tests:
 * 1. Rapid tab switching while pulling: Box List -> Lab -> Recipes -> Wiki
 * 2. Touchend with modal open (isModalOrDrawerActive())
 * 3. Ancestor container display: none detection at multiple tree depths (isTargetVisible)
 * 4. Rapid consecutive touchstarts across conflicting panels
 * 5. Detached DOM elements during active drag
 * 6. High-frequency multi-gesture chaos fuzzing
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

function createChallengerPtrEnvironment(options = {}) {
  const listeners = {
    touchstart: [],
    touchmove: [],
    touchend: [],
    touchcancel: []
  };

  class MockElement {
    constructor(tagName, id = '', className = '') {
      this.nodeType = 1;
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this._className = className;
      this.style = {};
      this.scrollTop = 0;
      this._offsetParent = {};
      this.parentNode = null;
      this.parentElement = null;
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

    get offsetParent() {
      // If any ancestor has display === 'none', offsetParent is null
      let curr = this;
      while (curr) {
        if (curr.style && curr.style.display === 'none') return null;
        curr = curr.parentElement;
      }
      return this._offsetParent;
    }
    set offsetParent(val) {
      this._offsetParent = val;
    }

    get className() { return this._className; }
    set className(val) { this._className = val; }

    appendChild(child) {
      if (child) {
        child.parentNode = this;
        child.parentElement = this;
        this.children.push(child);
      }
      return child;
    }

    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) {
        this.children.splice(idx, 1);
        child.parentNode = null;
        child.parentElement = null;
      }
      return child;
    }

    getAttribute(key) {
      if (key === 'id') return this.id;
      if (key === 'class') return this.className;
      if (key === 'style') {
        return Object.entries(this.style || {}).map(([k, v]) => `${k}:${v}`).join(';');
      }
      return this[key] !== undefined ? this[key] : null;
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
        if (matches(child, selector)) return child;
        const found = child.querySelector(selector);
        if (found) return found;
      }
      return null;
    }

    querySelectorAll(selector) {
      const results = [];
      for (const child of this.children) {
        if (matches(child, selector)) results.push(child);
        const sub = child.querySelectorAll(selector);
        sub.forEach(el => results.push(el));
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

  function matchesSingle(el, sel) {
    sel = sel.trim();
    if (!sel) return false;
    
    // Check :not(...) pseudo-classes
    const notRegex = /:not\(([^)]+)\)/g;
    const notMatches = [];
    let m;
    while ((m = notRegex.exec(sel)) !== null) {
      notMatches.push(m[1].trim());
    }
    for (const inner of notMatches) {
      if (matchesSingle(el, inner)) {
        return false;
      }
    }
    let baseSel = sel.replace(notRegex, '').trim();

    // Attribute selectors like [style*="display: none"]
    const attrRegex = /\[style\*=["']?([^"']+)["']?\]/;
    const attrMatch = baseSel.match(attrRegex);
    if (attrMatch) {
      const sub = attrMatch[1];
      const styleStr = (el.getAttribute('style') || el.style.cssText || '') + (el.style.display ? `display: ${el.style.display}; display:${el.style.display};` : '');
      if (!styleStr.includes(sub)) return false;
      baseSel = baseSel.replace(attrRegex, '').trim();
    }

    if (!baseSel) return true;

    if (baseSel.startsWith('#')) return el.id === baseSel.slice(1);
    if (baseSel.startsWith('.')) return el.classList.contains(baseSel.slice(1));
    if (baseSel.includes('.')) {
      const parts = baseSel.split('.');
      const tagMatch = !parts[0] || el.tagName === parts[0].toUpperCase();
      const classMatch = parts.slice(1).every(c => el.classList.contains(c));
      return tagMatch && classMatch;
    }
    return el.tagName === baseSel.toUpperCase();
  }

  function matches(el, selectorList) {
    if (!el || !selectorList) return false;
    const selectors = selectorList.split(',').map(s => s.trim()).filter(Boolean);
    return selectors.some(s => matchesSingle(el, s));
  }

  const elementsById = {};
  const docBody = new MockElement('BODY', 'body');
  const docElement = new MockElement('HTML', 'html');
  docElement.appendChild(docBody);

  let reloadCallCount = 0;

  const mockDocument = {
    body: docBody,
    documentElement: docElement,
    getElementById(id) {
      return elementsById[id] || null;
    },
    createElement(tag) {
      return new MockElement(tag);
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
        reloadCallCount++;
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

  const rawCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_ui.js'), 'utf8');
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

  function touchStart(target, clientX, clientY) {
    const evt = {
      target,
      touches: [{ clientX, clientY }],
      cancelable: true,
      preventDefault: () => {}
    };
    listeners.touchstart.forEach(fn => fn(evt));
  }

  function touchMove(target, clientX, clientY) {
    const evt = {
      target,
      touches: [{ clientX, clientY }],
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
    ptrEl,
    MockElement,
    elementsById,
    touchStart,
    touchMove,
    touchEnd,
    touchCancel,
    cancelPullToRefresh: sandbox.window.cancelPullToRefresh,
    getReloadCallCount: () => reloadCallCount,
    setOverlayOpenFn: (fn) => { overlayOpenFn = fn; },
    getComputedStyle: mockWindow.getComputedStyle
  };
}

const tests = [
  // =========================================================================
  // Challenge Group 1: 4-Way Rapid Tab Switching Pipeline
  // =========================================================================
  {
    name: 'Rapid 4-Way Tab Switch: Box List -> Lab -> Recipes -> Wiki during active pull',
    run: () => {
      const env = createChallengerPtrEnvironment();
      
      const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
      const boxSubList = new env.MockElement('DIV', 'box-subpanel-list', 'box-subpanel');
      const boxSubLab = new env.MockElement('DIV', 'box-subpanel-lab', 'box-subpanel');
      const panelRecipes = new env.MockElement('DIV', 'panel-recipes', 'view-panel');
      const panelWiki = new env.MockElement('DIV', 'panel-wiki', 'view-panel');

      panelBox.appendChild(boxSubList);
      panelBox.appendChild(boxSubLab);
      env.docBody.appendChild(panelBox);
      env.docBody.appendChild(panelRecipes);
      env.docBody.appendChild(panelWiki);

      panelRecipes.style.display = 'none';
      panelWiki.style.display = 'none';
      boxSubLab.style.display = 'none';

      // Step 1: User pulls in Box List (60px)
      env.touchStart(boxSubList, 100, 100);
      env.touchMove(boxSubList, 100, 160);
      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Indicator should be active in Box List pull');
      }

      // Step 2: Switch to Box Lab (via cancelPullToRefresh hook in nav)
      env.cancelPullToRefresh();
      boxSubList.style.display = 'none';
      boxSubLab.style.display = 'block';
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Indicator should be cleared after switching to Lab subpanel');
      }

      // Step 3: Start pull in Lab, then programmatic tab switch to Recipes
      env.touchStart(boxSubLab, 100, 100);
      env.touchMove(boxSubLab, 100, 220); // Delta 120px > threshold
      
      // Nav switches to Recipes without waiting for touchend
      env.cancelPullToRefresh();
      panelBox.style.display = 'none';
      panelRecipes.style.display = 'block';

      // Step 4: Rapidly switch to Wiki
      panelRecipes.style.display = 'none';
      panelWiki.style.display = 'block';

      // Touchend fires on old dragged target
      env.touchEnd();

      if (env.getReloadCallCount() !== 0) {
        throw new Error('Defect: Reload triggered across 4-way tab switch pipeline');
      }
      if (env.ptrEl.classList.contains('ptr-active') || env.ptrEl.classList.contains('ptr-refreshing')) {
        throw new Error('Defect: Indicator left active/refreshing after tab switch');
      }
    }
  },

  {
    name: 'Rapid Tab Switch without cancel hook: Ancestor display none blocks reload on touchend',
    run: () => {
      const env = createChallengerPtrEnvironment();

      const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
      const boxCard = new env.MockElement('DIV', 'box-card-1', 'box-card');
      panelBox.appendChild(boxCard);
      env.docBody.appendChild(panelBox);

      // Start drag beyond threshold (> 64px)
      env.touchStart(boxCard, 100, 100);
      env.touchMove(boxCard, 100, 230); // deltaY = 130px

      // External router hides panelBox without calling window.cancelPullToRefresh()
      panelBox.style.display = 'none';

      // Touchend fires
      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Touchend triggered reload even though target container was hidden (display: none)');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect: Indicator remained active when touchend fired on hidden container');
      }
    }
  },

  // =========================================================================
  // Challenge Group 2: Modal Openings during Active Pull
  // =========================================================================
  {
    name: 'Modal Opening: Overlay class added to body suppresses touchend reload',
    run: () => {
      const modalClasses = [
        'overlay-open',
        'modal-open',
        'pokedex-modal-open'
      ];

      for (const cls of modalClasses) {
        const env = createChallengerPtrEnvironment();
        const content = new env.MockElement('DIV', 'content', 'table-container');
        env.docBody.appendChild(content);

        env.touchStart(content, 100, 100);
        env.touchMove(content, 100, 240); // deltaY = 140px > threshold

        // Modal opens
        env.docBody.classList.add(cls);

        env.touchEnd();

        if (env.getReloadCallCount() > 0) {
          throw new Error(`Defect: Reload triggered with body class "${cls}" active`);
        }
        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error(`Defect: Indicator orphaned with body class "${cls}" active`);
        }
      }
    }
  },

  {
    name: 'Modal Opening: Active modal DOM elements suppress touchend reload',
    run: () => {
      const modalSelectors = [
        { id: 'settings-modal', cls: 'settings-modal' },
        { id: 'box-edit-modal', cls: 'box-edit-modal' },
        { id: 'ladder-recipe-modal', cls: 'ladder-recipe-modal' },
        { id: 'box-guide-lightbox-modal', cls: 'box-guide-lightbox-modal' }
      ];

      for (const m of modalSelectors) {
        const env = createChallengerPtrEnvironment();
        const content = new env.MockElement('DIV', 'content', 'table-container');
        const modalEl = new env.MockElement('DIV', m.id, m.cls);
        env.docBody.appendChild(content);
        env.docBody.appendChild(modalEl);

        env.touchStart(content, 100, 100);
        env.touchMove(content, 100, 240);

        // Modal appears (displayed and not hidden)
        modalEl.style.display = 'block';

        env.touchEnd();

        if (env.getReloadCallCount() > 0) {
          throw new Error(`Defect: Reload triggered with active modal #${m.id}`);
        }
      }
    }
  },

  {
    name: 'Modal Opening: window.isAnyOverlayOpen() true suppresses touchend reload',
    run: () => {
      const env = createChallengerPtrEnvironment();
      const content = new env.MockElement('DIV', 'content', 'table-container');
      env.docBody.appendChild(content);

      env.touchStart(content, 100, 100);
      env.touchMove(content, 100, 240);

      env.setOverlayOpenFn(() => true);

      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Reload triggered when window.isAnyOverlayOpen() is true');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect: Indicator orphaned when window.isAnyOverlayOpen() is true');
      }
    }
  },

  {
    name: 'Modal Opening: Uncollapsed filter sidebars suppress touchend reload',
    run: () => {
      const sidebarIds = [
        'pokemon-filter-sidebar',
        'recipe-filter-sidebar',
        'ladder-filter-sidebar'
      ];

      for (const sId of sidebarIds) {
        const env = createChallengerPtrEnvironment();
        const content = new env.MockElement('DIV', 'content', 'table-container');
        const sidebar = new env.MockElement('DIV', sId, 'filter-sidebar');
        // Uncollapsed (does not have .collapsed class)
        env.docBody.appendChild(content);
        env.docBody.appendChild(sidebar);

        env.touchStart(content, 100, 100);
        env.touchMove(content, 100, 240);

        env.touchEnd();

        if (env.getReloadCallCount() > 0) {
          throw new Error(`Defect: Reload triggered when #${sId} was uncollapsed`);
        }
      }
    }
  },

  // =========================================================================
  // Challenge Group 3: Deep Ancestor Visibility & Detachment
  // =========================================================================
  {
    name: 'Deep Ancestor: 10-level nested hierarchy with display: none at level 7 suppresses reload',
    run: () => {
      const env = createChallengerPtrEnvironment();
      
      let parent = env.docBody;
      const levels = [];
      for (let i = 0; i < 10; i++) {
        const node = new env.MockElement('DIV', `level-${i}`, 'nest-node');
        parent.appendChild(node);
        levels.push(node);
        parent = node;
      }
      const leaf = new env.MockElement('SPAN', 'leaf-node', 'leaf');
      parent.appendChild(leaf);

      // Start drag at leaf
      env.touchStart(leaf, 100, 100);
      env.touchMove(leaf, 100, 240);

      // Hide level 7
      levels[7].style.display = 'none';

      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Reload triggered when level 7 ancestor was display: none');
      }
    }
  },

  {
    name: 'Deep Ancestor: offsetParent null on non-fixed leaf suppresses reload',
    run: () => {
      const env = createChallengerPtrEnvironment();
      const container = new env.MockElement('DIV', 'cont', 'container');
      const item = new env.MockElement('DIV', 'item', 'item');
      container.appendChild(item);
      env.docBody.appendChild(container);

      env.touchStart(item, 100, 100);
      env.touchMove(item, 100, 240);

      // Force offsetParent = null (e.g. browser collapsed/hidden)
      item.offsetParent = null;

      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Reload triggered when target element had offsetParent === null');
      }
    }
  },

  // =========================================================================
  // Challenge Group 4: Rapid Consecutive Touchstarts Across Conflicting Panels
  // =========================================================================
  {
    name: 'Rapid Touchstarts: Collisions between Top and Scrolled containers reset cleanly',
    run: () => {
      const env = createChallengerPtrEnvironment();
      const topPanel = new env.MockElement('DIV', 'panel-top', 'view-panel');
      const scrolledPanel = new env.MockElement('DIV', 'panel-scrolled', 'view-panel');
      scrolledPanel.scrollTop = 250;
      env.docBody.appendChild(topPanel);
      env.docBody.appendChild(scrolledPanel);

      // 50 rapid alternating touchstarts without touchend
      for (let i = 0; i < 50; i++) {
        env.touchStart(topPanel, 100, 100);
        env.touchMove(topPanel, 100, 130);
        env.touchStart(scrolledPanel, 100, 100);
        env.touchMove(scrolledPanel, 100, 150);
      }

      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Reload triggered after collision loop');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect: Indicator orphaned after collision loop');
      }
    }
  },

  {
    name: 'Rapid Touchstarts: Alternating between control element and valid container resets cleanly',
    run: () => {
      const env = createChallengerPtrEnvironment();
      const validContainer = new env.MockElement('DIV', 'box-grid', 'box-cards-grid');
      const excludedBtn = new env.MockElement('BUTTON', 'box-fab-btn', 'box-fab-btn');
      env.docBody.appendChild(validContainer);
      env.docBody.appendChild(excludedBtn);

      for (let i = 0; i < 20; i++) {
        env.touchStart(validContainer, 100, 100);
        env.touchMove(validContainer, 100, 140);
        env.touchStart(excludedBtn, 100, 100);
        env.touchMove(excludedBtn, 100, 140);
      }

      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect: Reload triggered during control button collision loop');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect: Indicator orphaned after control button collision loop');
      }
    }
  },

  // =========================================================================
  // Challenge Group 5: Legitimate PTR in Visible Container Works Properly
  // =========================================================================
  {
    name: 'Legitimate PTR: Clean pull-down (> 64px) at scrollTop === 0 triggers exactly one reload',
    run: () => {
      const env = createChallengerPtrEnvironment();
      const container = new env.MockElement('DIV', 'box-list', 'box-cards-grid');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 220); // deltaY = 120px

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Expected ptr-active class during drag');
      }

      env.touchEnd();

      if (env.getReloadCallCount() !== 1) {
        throw new Error(`Expected exactly 1 reload for legitimate PTR, got ${env.getReloadCallCount()}`);
      }
      if (!env.ptrEl.classList.contains('ptr-refreshing')) {
        throw new Error('Expected ptr-refreshing class on indicator');
      }
    }
  }
];

function runAll() {
  console.log('\n======================================================');
  console.log('   Challenger M2-4 Adversarial Tab & Visibility Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      t.run();
      console.log(`  [PASS] ${t.name}`);
      passed++;
    } catch (err) {
      console.log(`  [FAIL] ${t.name}`);
      console.log(`         ${err.message}`);
      failed++;
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passed} / ${tests.length} Passed (${failed} Failed)\n`);

  return { passed, failed, total: tests.length };
}

if (require.main === module) {
  const res = runAll();
  process.exit(res.failed > 0 ? 1 : 0);
}

module.exports = {
  createChallengerPtrEnvironment,
  tests,
  runAll
};
