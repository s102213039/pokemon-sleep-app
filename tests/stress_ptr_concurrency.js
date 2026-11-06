/**
 * stress_ptr_concurrency.js — Cross-Module & Concurrency Stress Test Suite
 * =========================================================================
 * Empirically tests Pull-to-Refresh behavior across:
 * 1. Tab switching during active touch drag (Box -> Recipes -> Lab)
 * 2. Modal / overlay opening during active touch drag
 * 3. Rapid successive touchstarts without matching touchend
 * 4. Double-trigger reload prevention (isRefreshing state machine lock)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

function createIsolatedPtrEnvironment(customCode = null) {
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
      this.offsetParent = {};
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
      return { display: el.style.display || 'block' };
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
    ptrEl,
    MockElement,
    touchStart,
    touchMove,
    touchEnd,
    touchCancel,
    getReloadCallCount: () => reloadCallCount,
    setOverlayOpenFn: (fn) => { overlayOpenFn = fn; }
  };
}

function getConcurrencyTestDefinitions(customSourceCode = null) {
  return [
  // ------------------------------------------------------------------------
  // Suite 1: Tab switching while dragging
  // ------------------------------------------------------------------------
  {
    name: 'Tab Switching: Tapping dock-item while dragging in Box tab must clean up PTR indicator and not orphan UI',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
      const boxTable = new env.MockElement('DIV', '', 'table-container');
      panelBox.appendChild(boxTable);
      env.docBody.appendChild(panelBox);

      const dockItem = new env.MockElement('BUTTON', 'dock-item-recipes', 'dock-item');
      env.docBody.appendChild(dockItem);

      // Start drag in Box tab (pull 50px)
      env.touchStart(boxTable, 100, 100);
      env.touchMove(boxTable, 100, 150);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Precondition failed: PTR indicator should be active during 50px drag');
      }

      // User taps dock-item to navigate to Recipes tab
      env.touchStart(dockItem, 100, 500);

      // Touch lifts
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator remained active (orphaned) after tapping dock item to switch tabs');
      }
      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect reproduced: reload was triggered after switching tabs');
      }
    }
  },
  {
    name: 'Tab Switching: Programmatic tab switch (Box -> Recipes) during pull must not trigger reload on touchend',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
      const boxTable = new env.MockElement('DIV', '', 'table-container');
      panelBox.appendChild(boxTable);
      env.docBody.appendChild(panelBox);

      const panelRecipes = new env.MockElement('DIV', 'panel-recipes', 'view-panel');
      panelRecipes.style.display = 'none';
      env.docBody.appendChild(panelRecipes);

      // Drag in Box tab beyond threshold (> 64px)
      env.touchStart(boxTable, 100, 100);
      env.touchMove(boxTable, 100, 220); // deltaY = 120px

      // Programmatic tab switch: hide Box, show Recipes
      panelBox.style.display = 'none';
      panelRecipes.style.display = 'block';

      // Finger lifts on the new tab
      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect reproduced: reload was triggered after programmatically switching tabs');
      }
    }
  },
  {
    name: 'Tab Switching: Subtab switch (Box List -> Lab) during pull must not orphan indicator',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const panelBox = new env.MockElement('DIV', 'panel-box', 'view-panel');
      const subpanelList = new env.MockElement('DIV', 'box-subpanel-list', 'box-subpanel');
      const subnavItem = new env.MockElement('BUTTON', 'subnav-lab', 'box-subnav-item');
      panelBox.appendChild(subpanelList);
      panelBox.appendChild(subnavItem);
      env.docBody.appendChild(panelBox);

      env.touchStart(subpanelList, 100, 100);
      env.touchMove(subpanelList, 100, 140);

      // User touches Lab subtab button
      env.touchStart(subnavItem, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator remained active after subtab transition to Lab');
      }
    }
  },

  // ------------------------------------------------------------------------
  // Suite 2: Modal opening while dragging
  // ------------------------------------------------------------------------
  {
    name: 'Modal Opening: Moving touch after modal opens must cancel tracking and reset UI',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(table);

      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 140);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Precondition failed: PTR indicator should be active');
      }

      // Modal opens
      env.docBody.classList.add('overlay-open');

      // Next touchmove detects modal
      env.touchMove(table, 100, 145);

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator did not deactivate when moving touch after modal opened');
      }

      env.touchEnd();
      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect reproduced: reload triggered while modal open');
      }
    }
  },
  {
    name: 'Modal Opening: Touching modal overlay during active pull must immediately clear PTR indicator',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'view', 'table-container');
      const modal = new env.MockElement('DIV', 'pokedex-detail-modal', 'modal-overlay');
      modal.style.display = 'none';
      env.docBody.appendChild(table);
      env.docBody.appendChild(modal);

      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 150);

      // Modal opens
      modal.style.display = 'flex';
      env.docBody.classList.add('modal-open');

      // Touchstart arrives on modal
      env.touchStart(modal, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator remained active when touch arrived on open modal');
      }
    }
  },
  {
    name: 'Modal Opening: Direct touchend after modal opens without intervening touchmove must not trigger reload',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(table);

      // Pulled past reload threshold (> 64px)
      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 220); // deltaY = 120px

      // Modal opens without another touchmove
      env.docBody.classList.add('overlay-open');

      // Finger lifts
      env.touchEnd();

      if (env.getReloadCallCount() > 0) {
        throw new Error('Defect reproduced: reload triggered on touchend despite active modal overlay');
      }
    }
  },

  // ------------------------------------------------------------------------
  // Suite 3: Rapid multiple touchstarts without touchend
  // ------------------------------------------------------------------------
  {
    name: 'Rapid Touchstart: Successive touchstart on scrolled container must reset pull state and hide indicator',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const tableTop = new env.MockElement('DIV', 'table-top', 'table-container');
      const tableScrolled = new env.MockElement('DIV', 'table-scrolled', 'table-container');
      tableScrolled.scrollTop = 100;
      env.docBody.appendChild(tableTop);
      env.docBody.appendChild(tableScrolled);

      // Touch 1 pulls
      env.touchStart(tableTop, 100, 100);
      env.touchMove(tableTop, 100, 140);

      // Touch 2 arrives on scrolled container without touchend
      env.touchStart(tableScrolled, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator remained active after second touchstart on scrolled container');
      }
    }
  },
  {
    name: 'Rapid Touchstart: Successive touchstart on excluded control must reset pull state and hide indicator',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'table', 'table-container');
      const banner = new env.MockElement('DIV', 'box-banner', 'box-top-banner');
      env.docBody.appendChild(table);
      env.docBody.appendChild(banner);

      // Touch 1 pulls
      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 140);

      // Touch 2 arrives on excluded control without touchend
      env.touchStart(banner, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('Defect reproduced: PTR indicator remained active after second touchstart on excluded control');
      }
    }
  },

  // ------------------------------------------------------------------------
  // Suite 4: Double-trigger reload prevention (isRefreshing guard)
  // ------------------------------------------------------------------------
  {
    name: 'Double-Trigger Prevention: Multiple rapid touchend events trigger reload exactly once',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'table', 'table-container');
      env.docBody.appendChild(table);

      // Pull past threshold
      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 220); // deltaY = 120px

      // Rapidly fire multiple touchend calls
      for (let i = 0; i < 5; i++) {
        env.touchEnd();
      }

      if (env.getReloadCallCount() !== 1) {
        throw new Error(`Expected exactly 1 reload, but got ${env.getReloadCallCount()}`);
      }
      if (!env.ptrEl.classList.contains('ptr-refreshing')) {
        throw new Error('Expected ptr-refreshing class on indicator');
      }
    }
  },
  {
    name: 'Double-Trigger Prevention: Subsequent touchstart and touchmove during refreshing state are rejected',
    execute: () => {
      const env = createIsolatedPtrEnvironment(customSourceCode);
      const table = new env.MockElement('DIV', 'table', 'table-container');
      env.docBody.appendChild(table);

      // Pull and trigger reload
      env.touchStart(table, 100, 100);
      env.touchMove(table, 100, 220);
      env.touchEnd();

      if (env.getReloadCallCount() !== 1) {
        throw new Error('Precondition failed: reload should have triggered once');
      }

      // Attempt new gestures during refresh
      for (let i = 0; i < 3; i++) {
        env.touchStart(table, 100, 100);
        env.touchMove(table, 100, 250);
        env.touchEnd();
      }

      if (env.getReloadCallCount() !== 1) {
        throw new Error(`Double-trigger guard failed: reload called ${env.getReloadCallCount()} times`);
      }
    }
  }
];
}

function runConcurrencyTests(options = {}) {
  const { sourceCode = null, throwOnFail = false } = options;
  const defs = getConcurrencyTestDefinitions(sourceCode);
  const results = [];

  console.log('\n======================================================');
  console.log('   Cross-Module & Concurrency Stress Verification');
  console.log('======================================================\n');

  for (const t of defs) {
    try {
      t.execute();
      results.push({ name: t.name, pass: true });
      console.log(`  [PASS] ${t.name}`);
    } catch (err) {
      results.push({ name: t.name, pass: false, error: err.message });
      console.log(`  [FAIL] ${t.name}`);
      console.log(`         ${err.message}`);
      if (throwOnFail) throw err;
    }
  }

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass).length;

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passed} / ${results.length} Passed (${failed} Failed)\n`);

  if (failed > 0) {
    console.log('Failure Summary:');
    results.filter(r => !r.pass).forEach(f => {
      console.log(` - ${f.name}: ${f.error}`);
    });
  }

  return { passed, failed, total: results.length, results };
}

function registerPtrConcurrencyTests(tier = 'Tier 3 - Cross-Feature Combinations') {
  const harness = require('./test_harness');
  const defs = getConcurrencyTestDefinitions();
  for (const t of defs) {
    harness.test(tier, t.name, () => {
      t.execute();
    });
  }
}

if (require.main === module) {
  const result = runConcurrencyTests();
  process.exit(result.failed > 0 ? 1 : 0);
}

module.exports = {
  createIsolatedPtrEnvironment,
  getConcurrencyTestDefinitions,
  runConcurrencyTests,
  registerPtrConcurrencyTests
};
