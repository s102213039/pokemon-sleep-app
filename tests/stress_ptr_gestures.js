/**
 * stress_ptr_gestures.js — Synthetic Touch Event Test Suite for Pull-to-Refresh Gestures
 * ======================================================================================
 * Tests PTR behavior invariants without browser overhead:
 * 1. Up-down swipe reversal gesture immunity (direction lock: isTracking must be permanently cancelled)
 * 2. Drag deadzone suppression (< 12px displacement must not engage PTR UI)
 * 3. Box tab controls exclusion immunity (#box-screenshot-guide-card, #box-dropzone, .box-top-banner, .controls-container, .box-subnav-bar)
 * 4. Legitimate pull-down at top exceeding threshold (> 64px) triggers reload
 * 5. Mid-list scroll immunity (target or ancestor scrollTop > 0 suppresses PTR)
 * 6. Lateral / diagonal swipe rejection (|deltaX| > deltaY suppresses PTR)
 * 7. Active overlay / modal suppression (overlay-open suppresses PTR)
 *
 * Fast execution: < 20ms in Node.js VM.
 * Supports both standalone execution and integration into test tiers (Tier 2 / Tier 4).
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

/**
 * Creates an isolated mock DOM environment and initializes Pull-to-Refresh
 * @param {string} [customPokedexUiCode] Optional patched code for simulation
 */
function createMockPtrEnvironment(customPokedexUiCode = null) {
  const listeners = {
    touchstart: [],
    touchmove: [],
    touchend: []
  };

  class MockElement {
    constructor(tagName, id = '', className = '') {
      this.nodeType = 1;
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this._className = className;
      this.style = {};
      this.scrollTop = 0;
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
      return [];
    },
    querySelector(selector) {
      return null;
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

  const mockWindow = {
    pageYOffset: 0,
    location: {
      reload() {
        reloadTriggered = true;
      },
      href: 'http://localhost/'
    },
    getComputedStyle(el) {
      return { display: 'block' };
    },
    isAnyOverlayOpen() {
      return false;
    }
  };

  const rawCode = customPokedexUiCode || fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_ui.js'), 'utf8');
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

  return {
    docBody,
    ptrEl,
    MockElement,
    touchStart,
    touchMove,
    touchEnd,
    isReloadTriggered: () => reloadTriggered
  };
}

/**
 * Returns test definitions as an array of { name, execute }
 * @param {string} [customSourceCode]
 */
function getPtrGestureTestDefinitions(customSourceCode = null) {
  return [
    {
      name: 'PTR Gesture: Up-down swipe reversal must cancel tracking and not trigger reload',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        env.docBody.appendChild(table);

        // User touches at top (Y=200)
        env.touchStart(table, 100, 200);

        // User swipes UP 50px to read content below (deltaY = -50)
        env.touchMove(table, 100, 150);

        // User reverses swipe DOWN 90px (from start 200, current Y=290, deltaY = +90)
        env.touchMove(table, 100, 290);

        // Invariant: ptr-active must remain false because upward swipe permanently cancelled tracking
        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR indicator became active after an upward swipe was reversed downward');
        }

        // Finger lifts
        env.touchEnd();

        // Invariant: reload must not be triggered
        if (env.isReloadTriggered()) {
          throw new Error('window.location.reload was triggered after upward swipe reversed downward');
        }
        if (env.ptrEl.classList.contains('ptr-refreshing')) {
          throw new Error('ptr-refreshing class was applied after upward swipe reversed downward');
        }
      }
    },
    {
      name: 'PTR Gesture: Pull under deadzone (12px) must not engage PTR UI',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        env.docBody.appendChild(table);

        env.touchStart(table, 100, 200);

        // Micro-drag 8px downward (< 12px deadzone)
        env.touchMove(table, 100, 208);

        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR UI engaged on 8px pull (under 12px deadzone)');
        }

        // Micro-drag 11px downward (< 12px deadzone)
        env.touchMove(table, 100, 211);

        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR UI engaged on 11px pull (under 12px deadzone)');
        }

        env.touchEnd();

        if (env.isReloadTriggered()) {
          throw new Error('window.location.reload was triggered on micro-drag under deadzone');
        }
      }
    },
    {
      name: 'PTR Gesture: Touching Box tab controls must never activate PTR or trigger reload',
      execute: () => {
        const boxControls = [
          { id: 'box-screenshot-guide-card', cls: 'box-screenshot-guide-card' },
          { id: 'box-dropzone', cls: 'box-dropzone' },
          { id: 'box-top-banner', cls: 'box-top-banner' },
          { id: 'box-controls', cls: 'controls-container' },
          { id: 'box-subnav', cls: 'box-subnav-bar' },
          { id: 'box-filter-row', cls: 'search-filter-row' }
        ];

        for (const ctrl of boxControls) {
          const env = createMockPtrEnvironment(customSourceCode);
          const ctrlEl = new env.MockElement('DIV', ctrl.id, ctrl.cls);
          const childBtn = new env.MockElement('BUTTON', '', 'btn-inner');
          ctrlEl.appendChild(childBtn);
          env.docBody.appendChild(ctrlEl);

          // Touch on child inside control, pull down 100px
          env.touchStart(childBtn, 100, 200);
          env.touchMove(childBtn, 100, 300);

          if (env.ptrEl.classList.contains('ptr-active')) {
            throw new Error(`PTR indicator activated when dragging on Box control: ${ctrl.id} (.${ctrl.cls})`);
          }

          env.touchEnd();

          if (env.isReloadTriggered()) {
            throw new Error(`window.location.reload triggered when releasing on Box control: ${ctrl.id}`);
          }
        }
      }
    },
    {
      name: 'PTR Gesture: Legitimate pull-down exceeding threshold (> 64px) at top triggers reload',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        env.docBody.appendChild(table);

        env.touchStart(table, 100, 100);

        // Pull down 30px (> 12px deadzone)
        env.touchMove(table, 100, 130);

        if (!env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR UI failed to engage on legitimate 30px pull');
        }

        // Pull down 100px (> 64px threshold)
        env.touchMove(table, 100, 200);

        if (!env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR UI lost active state on 100px pull');
        }

        env.touchEnd();

        if (!env.isReloadTriggered()) {
          throw new Error('window.location.reload was NOT triggered on legitimate 100px pull-down');
        }
        if (!env.ptrEl.classList.contains('ptr-refreshing')) {
          throw new Error('ptr-refreshing class was NOT applied on legitimate 100px pull-down');
        }
      }
    },
    {
      name: 'PTR Gesture: Pull-down when container scrollTop > 0 must suppress PTR',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        table.scrollTop = 120; // Scrolled down
        env.docBody.appendChild(table);

        env.touchStart(table, 100, 200);
        env.touchMove(table, 100, 300); // 100px pull

        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR engaged when container scrollTop was 120px');
        }

        env.touchEnd();

        if (env.isReloadTriggered()) {
          throw new Error('window.location.reload triggered when container scrollTop was 120px');
        }
      }
    },
    {
      name: 'PTR Gesture: Horizontal / diagonal swipe (|deltaX| > deltaY) must suppress PTR',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        env.docBody.appendChild(table);

        env.touchStart(table, 100, 200);

        // Diagonal swipe: deltaX = 80px, deltaY = 40px (|deltaX| > deltaY)
        env.touchMove(table, 180, 240);

        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR engaged on diagonal swipe where |deltaX| > deltaY');
        }

        env.touchEnd();

        if (env.isReloadTriggered()) {
          throw new Error('window.location.reload triggered on diagonal swipe');
        }
      }
    },
    {
      name: 'PTR Gesture: Active modal or drawer (overlay-open) must suppress PTR',
      execute: () => {
        const env = createMockPtrEnvironment(customSourceCode);
        env.docBody.classList.add('overlay-open');
        const table = new env.MockElement('DIV', 'table-view', 'table-container');
        env.docBody.appendChild(table);

        env.touchStart(table, 100, 200);
        env.touchMove(table, 100, 300); // 100px pull

        if (env.ptrEl.classList.contains('ptr-active')) {
          throw new Error('PTR engaged while document.body had overlay-open class');
        }

        env.touchEnd();

        if (env.isReloadTriggered()) {
          throw new Error('window.location.reload triggered while overlay was open');
        }
      }
    }
  ];
}

/**
 * Runs all tests and prints standalone CLI report
 */
function runPtrGestureTests(options = {}) {
  const { sourceCode = null, throwOnFail = false } = options;
  const defs = getPtrGestureTestDefinitions(sourceCode);
  const results = [];

  console.log('\n======================================================');
  console.log('      Pull-to-Refresh Synthetic Gesture Verification');
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

  const passCount = results.filter(r => r.pass).length;
  const failCount = results.filter(r => !r.pass).length;

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passCount} / ${results.length} Passed (${failCount} Failed)\n`);

  return { passCount, failCount, total: results.length, results };
}

/**
 * Registers PTR gesture tests into the project's test harness
 * @param {string} [tier] Target tier name
 */
function registerPtrGestureTests(tier = 'Tier 2 - Boundary & Corner Cases') {
  const harness = require('./test_harness');
  const defs = getPtrGestureTestDefinitions();
  for (const t of defs) {
    harness.test(tier, t.name, () => {
      t.execute();
    });
  }
}

if (require.main === module) {
  const res = runPtrGestureTests({ throwOnFail: false });
  process.exit(res.failCount > 0 ? 1 : 0);
}

module.exports = {
  createMockPtrEnvironment,
  getPtrGestureTestDefinitions,
  runPtrGestureTests,
  registerPtrGestureTests
};
