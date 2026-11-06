/**
 * adversarial_ptr_stress.js — Empirical Challenger Stress Suite for Pull-to-Refresh Gestures
 * ============================================================================================
 * Adversarially probes gesture edge cases:
 * 1. Rapid zig-zag and micro-direction changes (-3px, -5px, +10px, lateral drifts)
 * 2. Near-boundary displacements (11.9px, 12.0px, 12.1px, 63.9px, 64.0px, 86.8px, 86.9px)
 * 3. Subpixel scrollOffsets (0.1px, 0.5px, 1.0px on target, ancestors, and window)
 * 4. Nested Box controls:
 *    - SVG / Path elements inside dropzone
 *    - Child text nodes (nodeType === 3) inside guide card and dropzone
 * 5. Touch interruption and lifecycle:
 *    - touchcancel event handling
 *    - Rapid touchstart without touchend
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

function createChallengerMockEnvironment() {
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
    createTextNode(text) {
      return new MockTextNode(text);
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
    isReloadTriggered: () => reloadTriggered
  };
}

const tests = [
  // -------------------------------------------------------------
  // Group 1: Rapid zig-zag and micro-direction changes
  // -------------------------------------------------------------
  {
    name: 'Zig-zag: Upward micro-step (-3px) then downward pull (+100px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      // Start at 200
      env.touchStart(container, 100, 200);
      // Move up 3px (Y=197, deltaY=-3, deltaX=0)
      env.touchMove(container, 100, 197);
      // Move down 100px relative to start (Y=300, deltaY=+100)
      env.touchMove(container, 100, 300);
      env.touchEnd();

      // Check whether tracking was cancelled by the -3px upward move
      // Note: Math.abs(0) > -3 is true, so deltaY=-3 cancels tracking
      if (env.isReloadTriggered()) {
        throw new Error('Reload was triggered even after initial upward movement (-3px)');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR remained active despite initial upward movement');
      }
    }
  },
  {
    name: 'Zig-zag: Downward pull (+30px), then upward micro-reversal (-5px), then pull (+100px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 200);
      // Move down 30px (Y=230) -> engages PTR
      env.touchMove(container, 100, 230);
      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR failed to engage on 30px pull');
      }

      // Micro-reversal upwards: Y=225 (relative to start deltaY is +25px)
      env.touchMove(container, 100, 225);
      // Pull down strongly: Y=310 (deltaY = +110px)
      env.touchMove(container, 100, 310);
      env.touchEnd();

      // Legitimate pull exceeded threshold, should reload
      if (!env.isReloadTriggered()) {
        throw new Error('Reload should have triggered because deltaY remained positive (+25px, +110px)');
      }
    }
  },
  {
    name: 'Zig-zag: Downward pull (+30px), then severe upward swipe (Y=190, deltaY=-10px), then down (+100px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 200);
      env.touchMove(container, 100, 230); // deltaY = +30
      env.touchMove(container, 100, 190); // deltaY = -10 (swiped up past start)
      env.touchMove(container, 100, 300); // deltaY = +100
      env.touchEnd();

      if (env.isReloadTriggered()) {
        throw new Error('Reload was triggered after swiping up past start');
      }
      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR remained active after swiping up past start');
      }
    }
  },
  {
    name: 'Zig-zag: Lateral drift (|deltaX| > deltaY) at 46 degrees (X=146, Y=145 from 100,100)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      // deltaX = 46, deltaY = 45 -> |deltaX| > deltaY
      env.touchMove(container, 146, 145);
      // subsequent pure downward move to (146, 250)
      env.touchMove(container, 146, 250);
      env.touchEnd();

      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered after lateral diagonal swipe exceeded 45 degrees');
      }
    }
  },

  // -------------------------------------------------------------
  // Group 2: Near-boundary displacements
  // -------------------------------------------------------------
  {
    name: 'Boundary: 11.9px pull must remain inactive (under 12px deadzone)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 111.9);

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR became active at 11.9px pull (should be inactive below 12px)');
      }
      env.touchEnd();
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered at 11.9px');
      }
    }
  },
  {
    name: 'Boundary: 12.0px pull enters deadzone transition (active UI engaged, no reload)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 112.0);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR UI should engage at exactly 12.0px pull');
      }
      env.touchEnd();
      if (env.isReloadTriggered()) {
        throw new Error('Reload should not trigger at 12.0px pull');
      }
    }
  },
  {
    name: 'Boundary: 12.1px pull engages active UI, no reload',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 112.1);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR UI should engage at 12.1px pull');
      }
      env.touchEnd();
      if (env.isReloadTriggered()) {
        throw new Error('Reload should not trigger at 12.1px pull');
      }
    }
  },
  {
    name: 'Boundary: 63.9px displacement produces active UI but no reload (damped pull ~50px < 64px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 163.9);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR UI should be active at 63.9px displacement');
      }
      env.touchEnd();
      if (env.isReloadTriggered()) {
        throw new Error('Reload should not trigger at 63.9px displacement');
      }
    }
  },
  {
    name: 'Boundary: 64.0px displacement produces active UI but no reload (damped pull ~50px < 64px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 164.0);

      if (!env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR UI should be active at 64.0px displacement');
      }
      env.touchEnd();
      if (env.isReloadTriggered()) {
        throw new Error('Reload should not trigger at 64.0px displacement');
      }
    }
  },
  {
    name: 'Boundary: 86.8px displacement is just below reload threshold (currentPull = 63.98px < 64px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 186.8);
      env.touchEnd();

      if (env.isReloadTriggered()) {
        throw new Error('Reload should not trigger at 86.8px displacement (currentPull < 64px)');
      }
    }
  },
  {
    name: 'Boundary: 86.9px displacement crosses reload threshold (currentPull = 64.04px >= 64px)',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 186.9);
      env.touchEnd();

      if (!env.isReloadTriggered()) {
        throw new Error('Reload should trigger at 86.9px displacement (currentPull >= 64px)');
      }
    }
  },

  // -------------------------------------------------------------
  // Group 3: Subpixel scrollOffsets (0.1px, 0.5px, 1.0px)
  // -------------------------------------------------------------
  {
    name: 'Subpixel: Ancestor container scrollTop = 0.1px must suppress PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const outer = new env.MockElement('DIV', 'panel-pokemon', 'view-panel');
      outer.scrollTop = 0.1;
      const inner = new env.MockElement('DIV', '', 'inner-card');
      outer.appendChild(inner);
      env.docBody.appendChild(outer);

      env.touchStart(inner, 100, 100);
      env.touchMove(inner, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR engaged despite ancestor scrollTop = 0.1px');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered despite ancestor scrollTop = 0.1px');
      }
    }
  },
  {
    name: 'Subpixel: Ancestor container scrollTop = 0.5px must suppress PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const outer = new env.MockElement('DIV', 'panel-pokemon', 'view-panel');
      outer.scrollTop = 0.5;
      const inner = new env.MockElement('DIV', '', 'inner-card');
      outer.appendChild(inner);
      env.docBody.appendChild(outer);

      env.touchStart(inner, 100, 100);
      env.touchMove(inner, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR engaged despite ancestor scrollTop = 0.5px');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered despite ancestor scrollTop = 0.5px');
      }
    }
  },
  {
    name: 'Subpixel: window.pageYOffset = 0.1px must suppress PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      env.mockWindow.pageYOffset = 0.1;
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR engaged despite window.pageYOffset = 0.1px');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered despite window.pageYOffset = 0.1px');
      }
    }
  },
  {
    name: 'Subpixel: document.documentElement.scrollTop = 0.5px must suppress PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      env.docElement.scrollTop = 0.5;
      const container = new env.MockElement('DIV', 'view', 'table-container');
      env.docBody.appendChild(container);

      env.touchStart(container, 100, 100);
      env.touchMove(container, 100, 200);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR engaged despite documentElement.scrollTop = 0.5px');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered despite documentElement.scrollTop = 0.5px');
      }
    }
  },

  // -------------------------------------------------------------
  // Group 4: Nested Box controls (SVG inside dropzone, child text nodes)
  // -------------------------------------------------------------
  {
    name: 'Nested Control: SVG and Path element inside #box-dropzone must never activate PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const dropzone = new env.MockElement('DIV', 'box-dropzone', 'box-dropzone');
      const svg = new env.MockElement('SVG', '', 'dropzone-icon');
      const pathEl = new env.MockElement('PATH', '', 'icon-path');
      svg.appendChild(pathEl);
      dropzone.appendChild(svg);
      env.docBody.appendChild(dropzone);

      // Touch initiated on path element inside SVG inside dropzone
      env.touchStart(pathEl, 100, 100);
      env.touchMove(pathEl, 100, 250); // 150px pull
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR activated when touching <path> inside #box-dropzone');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered when touching <path> inside #box-dropzone');
      }
    }
  },
  {
    name: 'Nested Control: Child Text Node inside #box-screenshot-guide-card must never activate PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const guideCard = new env.MockElement('DIV', 'box-screenshot-guide-card', 'box-screenshot-guide-card');
      const heading = new env.MockElement('H3', '', 'guide-title');
      const textNode = env.mockDocument.createTextNode('How to import Pokemon screenshots');
      heading.appendChild(textNode);
      guideCard.appendChild(heading);
      env.docBody.appendChild(guideCard);

      // Touch initiated on Text Node (nodeType === 3)
      env.touchStart(textNode, 100, 100);
      env.touchMove(textNode, 100, 250); // 150px pull
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR activated when touching child Text Node of #box-screenshot-guide-card');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered when touching child Text Node of #box-screenshot-guide-card');
      }
    }
  },
  {
    name: 'Nested Control: Child Text Node inside #box-dropzone label must never activate PTR',
    fn: () => {
      const env = createChallengerMockEnvironment();
      const dropzone = new env.MockElement('DIV', 'box-dropzone', 'box-dropzone');
      const label = new env.MockElement('SPAN', '', 'dropzone-text');
      const textNode = env.mockDocument.createTextNode('Drag & drop screenshots here');
      label.appendChild(textNode);
      dropzone.appendChild(label);
      env.docBody.appendChild(dropzone);

      // Touch initiated on Text Node (nodeType === 3)
      env.touchStart(textNode, 100, 100);
      env.touchMove(textNode, 100, 250);
      env.touchEnd();

      if (env.ptrEl.classList.contains('ptr-active')) {
        throw new Error('PTR activated when touching child Text Node of #box-dropzone');
      }
      if (env.isReloadTriggered()) {
        throw new Error('Reload triggered when touching child Text Node of #box-dropzone');
      }
    }
  },

  // -------------------------------------------------------------
  // Group 5: Touch cancellation and lifecycle resilience
  // -------------------------------------------------------------
  {
    name: 'Lifecycle: System touchcancel listener must be registered to avoid stuck UI',
    fn: () => {
      const env = createChallengerMockEnvironment();
      if (!env.hasTouchCancelListener()) {
        throw new Error('document touchcancel event listener is missing from pokedex_ui.js');
      }
    }
  }
];

function runAdversarialPtrTests() {
  console.log('\n======================================================');
  console.log('   Challenger Adversarial PTR Stress Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const t of tests) {
    try {
      t.fn();
      passed++;
      console.log(`  [PASS] ${t.name}`);
    } catch (err) {
      failed++;
      failures.push({ name: t.name, message: err.message });
      console.log(`  [FAIL] ${t.name}`);
      console.log(`         Error: ${err.message}`);
    }
  }

  console.log('\n------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passed} / ${tests.length} Passed (${failed} Failed)\n`);

  if (failures.length > 0) {
    console.log('Failure Summary:');
    failures.forEach(f => {
      console.log(` - ${f.name}: ${f.message}`);
    });
    return { passed, failed, total: tests.length, failures, success: false };
  } else {
    return { passed, failed, total: tests.length, failures, success: true };
  }
}

function registerAdversarialPtrTests(tier = 'Tier 2 - Boundary & Corner Cases') {
  const harness = require('./test_harness');
  for (const t of tests) {
    harness.test(tier, t.name, () => {
      t.fn();
    });
  }
}

if (require.main === module) {
  const res = runAdversarialPtrTests();
  process.exit(res.success ? 0 : 1);
}

module.exports = {
  createChallengerMockEnvironment,
  getAdversarialPtrTestDefinitions: () => tests,
  runAdversarialPtrTests,
  registerAdversarialPtrTests
};

