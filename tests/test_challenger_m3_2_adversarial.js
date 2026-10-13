/**
 * tests/test_challenger_m3_2_adversarial.js
 * Empirical Stress Harness and Adversarial Challenge Suite for Milestone 3:
 * Item Detail Modal Lifecycle, Modal Suspension Protocol (__suspendedForDetail),
 * Rapid Switching, Memory Leak Prevention, Single Frame Rule, 4 Themes, and Mobile H5 Sheet.
 *
 * Execution:
 *   rtk node tests/test_challenger_m3_2_adversarial.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log('  [PASS] ' + message);
  } else {
    failedChecks++;
    console.error('  [FAIL] ' + message);
    failureDetails.push(message);
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)})`);
}

console.log('================================================================');
console.log('  Challenger M3-2: Empirical Stress Harness & Adversarial Probes');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Setup: Load Source Files & Master Data
// -----------------------------------------------------------------------------
const itemsJsonPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
const pokemonDataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
const desktopHtmlPath = path.join(WORKSPACE_ROOT, 'index.html');
const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
const appJsPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js');
const wikiJsPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
const stylesCssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');

assert(fs.existsSync(itemsJsonPath), 'data/items.json exists');
assert(fs.existsSync(pokemonDataPath), 'data/data.json exists');
assert(fs.existsSync(desktopHtmlPath), 'index.html exists');
assert(fs.existsSync(mobileHtmlPath), 'app/index.html exists');
assert(fs.existsSync(appJsPath), 'js/modules/app.js exists');
assert(fs.existsSync(wikiJsPath), 'js/modules/wiki.js exists');
assert(fs.existsSync(stylesCssPath), 'css/styles.css exists');

const rawItemsData = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const rawPokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));
const desktopHtml = fs.readFileSync(desktopHtmlPath, 'utf8');
const mobileHtml = fs.readFileSync(mobileHtmlPath, 'utf8');
const appJsCode = fs.readFileSync(appJsPath, 'utf8');
const wikiJsCode = fs.readFileSync(wikiJsPath, 'utf8');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

// -----------------------------------------------------------------------------
// Mock Browser Environment Builder
// -----------------------------------------------------------------------------
function buildBrowserEnvironment(options = {}) {
  const isMobile = !!options.isMobile;
  const domElements = new Map();
  const documentListeners = new Map();

  function createMockElement(id, tagName = 'div', className = '') {
    const el = {
      id: id || '',
      tagName: tagName.toUpperCase(),
      className: className,
      classList: {
        _classes: new Set(className ? className.split(' ').filter(Boolean) : []),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); },
        toggle(c, force) {
          if (force === true) this._classes.add(c);
          else if (force === false) this._classes.delete(c);
          else {
            if (this._classes.has(c)) this._classes.delete(c);
            else this._classes.add(c);
          }
        }
      },
      style: {},
      attributes: {},
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k] || null; },
      textContent: '',
      _innerHTML: '',
      get innerHTML() { return this._innerHTML; },
      set innerHTML(val) {
        this._innerHTML = String(val);
        // Simple inner element parser for querySelector
        this._parseInnerElements(val);
      },
      children: [],
      parentElement: null,
      appendChild(child) {
        if (!child) return;
        child.parentElement = this;
        this.children.push(child);
        if (child.id) domElements.set(child.id, child);
        return child;
      },
      removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) {
          this.children.splice(idx, 1);
          child.parentElement = null;
          if (child.id) domElements.delete(child.id);
        }
        return child;
      },
      querySelector(selector) {
        if (!selector) return null;
        if (selector.startsWith('#')) {
          const targetId = selector.slice(1);
          return this._findChildById(targetId);
        }
        if (selector.startsWith('.')) {
          const targetClass = selector.slice(1);
          return this._findChildByClass(targetClass);
        }
        return null;
      },
      querySelectorAll(selector) {
        const results = [];
        this._collectChildren(results, selector);
        return results;
      },
      _findChildById(id) {
        for (const child of this.children) {
          if (child.id === id) return child;
          const found = child._findChildById(id);
          if (found) return found;
        }
        return null;
      },
      _findChildByClass(cls) {
        for (const child of this.children) {
          if (child.classList && child.classList.contains(cls)) return child;
          const found = child._findChildByClass(cls);
          if (found) return found;
        }
        return null;
      },
      _collectChildren(out, selector) {
        for (const child of this.children) {
          if (selector.startsWith('.') && child.classList && child.classList.contains(selector.slice(1))) {
            out.push(child);
          } else if (selector.startsWith('#') && child.id === selector.slice(1)) {
            out.push(child);
          }
          child._collectChildren(out, selector);
        }
      },
      _parseInnerElements(html) {
        // Fast mock parser extracting id="..." elements
        const idMatches = html.matchAll(/id=["']([^"']+)["']/g);
        for (const m of idMatches) {
          const childId = m[1];
          let childEl = this._findChildById(childId);
          if (!childEl) {
            childEl = createMockElement(childId, 'div');
            this.appendChild(childEl);
          }
        }
      }
    };
    if (id) domElements.set(id, el);
    return el;
  }

  const bodyEl = createMockElement('body', 'body', isMobile ? 'mobile-h5-app' : '');
  bodyEl.style = { overflow: '' };

  const pokedexModalEl = createMockElement('pokedex-detail-modal', 'div', 'pokedex-modal-backdrop');
  pokedexModalEl.style = { display: 'none' };
  pokedexModalEl.__suspendedForDetail = false;
  bodyEl.appendChild(pokedexModalEl);

  const itemModalEl = createMockElement('wiki-item-detail-modal', 'div', 'wiki-item-modal-backdrop');
  itemModalEl.style = { display: 'none' };

  // Populate inner elements for item modal
  const iconEl = createMockElement('wiki-item-modal-icon', 'img');
  const titleEl = createMockElement('wiki-item-modal-title', 'h3');
  const catBadgeEl = createMockElement('wiki-item-modal-cat-badge', 'span', 'wiki-item-category-badge');
  const subtitleEl = createMockElement('wiki-item-modal-subtitle', 'p');
  const effectsEl = createMockElement('wiki-item-modal-effects', 'p');
  const descEl = createMockElement('wiki-item-modal-desc', 'p');
  const pricingEl = createMockElement('wiki-item-modal-pricing', 'div');
  const acqListEl = createMockElement('wiki-item-modal-acq-list', 'ul');
  const pkmSectionEl = createMockElement('wiki-item-modal-pokemon-section', 'section');
  const pkmGridEl = createMockElement('wiki-item-modal-pokemon-grid', 'div');
  const pkmCountEl = createMockElement('wiki-item-modal-pkm-count', 'span');
  const pkmTitleEl = createMockElement('wiki-item-pokemon-section-title', 'h4');
  const modalBodyEl = createMockElement('wiki-item-modal-body', 'div', 'box-modal-body');

  itemModalEl.appendChild(modalBodyEl);
  itemModalEl.appendChild(iconEl);
  itemModalEl.appendChild(titleEl);
  itemModalEl.appendChild(catBadgeEl);
  itemModalEl.appendChild(subtitleEl);
  itemModalEl.appendChild(effectsEl);
  itemModalEl.appendChild(descEl);
  itemModalEl.appendChild(pricingEl);
  itemModalEl.appendChild(acqListEl);
  itemModalEl.appendChild(pkmSectionEl);
  itemModalEl.appendChild(pkmGridEl);
  itemModalEl.appendChild(pkmCountEl);
  itemModalEl.appendChild(pkmTitleEl);

  bodyEl.appendChild(itemModalEl);

  const mockDocument = {
    body: bodyEl,
    getElementById(id) { return domElements.get(id) || null; },
    querySelector(sel) { return bodyEl.querySelector(sel); },
    querySelectorAll(sel) { return bodyEl.querySelectorAll(sel); },
    createElement(tag) { return createMockElement(null, tag); },
    addEventListener(type, handler) {
      if (!documentListeners.has(type)) documentListeners.set(type, new Set());
      documentListeners.get(type).add(handler);
    },
    removeEventListener(type, handler) {
      if (documentListeners.has(type)) {
        documentListeners.get(type).delete(handler);
      }
    },
    _getListenerCount(type) {
      return documentListeners.has(type) ? documentListeners.get(type).size : 0;
    },
    _dispatch(type, event) {
      if (documentListeners.has(type)) {
        for (const handler of Array.from(documentListeners.get(type))) {
          handler(event);
        }
      }
    }
  };

  const sandbox = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    window: {},
    document: mockDocument,
    localStorage: {
      _d: {},
      getItem(k) { return this._d[k] || null; },
      setItem(k, v) { this._d[k] = String(v); },
      removeItem(k) { delete this._d[k]; }
    },
    escapeHtml(str) {
      return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {}
  };

  sandbox.window = sandbox;
  sandbox.window.document = mockDocument;
  sandbox.window.ITEMS_DATA = rawItemsData;
  sandbox.window.allPokemons = rawPokemonData;
  sandbox.window.PokemonApp = {
    allPokemons: rawPokemonData,
    lastOpenedPokemonId: null,
    openPokemonDetailModal(pkmIdOrObj) {
      this.lastOpenedPokemonId = (pkmIdOrObj && typeof pkmIdOrObj === 'object') ? pkmIdOrObj.id : pkmIdOrObj;
      pokedexModalEl.style.display = 'flex';
      bodyEl.classList.add('pokedex-modal-open');
    }
  };

  sandbox.window.I18N = {
    _lang: 'zh-TW',
    getLanguage() { return this._lang; },
    setLanguage(l) { this._lang = l; },
    t(k, def) { return def; },
    getItemName(id) {
      const it = rawItemsData.find(x => x.id === id);
      return it ? (it.name[this._lang] || it.name['zh-TW']) : '';
    }
  };

  vm.createContext(sandbox);

  // Evaluate wiki.js inside sandbox
  try {
    vm.runInContext(wikiJsCode, sandbox);
  } catch (err) {
    console.error('Failed to evaluate wiki.js in sandbox:', err);
  }

  // Evaluate evolution item helpers from app.js into sandbox
  try {
    const evoBlockMatch = appJsCode.match(/\/\/ Canonical evolution items definitions[\s\S]*?function renderPokedexEvoItemChipsHTML[\s\S]*?\n\}/);
    if (evoBlockMatch) {
      vm.runInContext(evoBlockMatch[0], sandbox);
    }
  } catch (err) {
    console.error('Failed to evaluate evo helpers in sandbox:', err);
  }

  return { sandbox, mockDocument, domElements };
}

// =============================================================================
// Probe 1: Modal Lifecycle & Robustness under Adverse Inputs
// =============================================================================
console.log('[Probe 1] Modal Lifecycle & Robustness under Adverse Inputs');

const { sandbox: env1, mockDocument: doc1, domElements: dom1 } = buildBrowserEnvironment();
const wiki1 = env1.window.WikiDB;
const modal1 = dom1.get('wiki-item-detail-modal');

assert(wiki1 && typeof wiki1.openItemDetailModal === 'function', 'WikiDB.openItemDetailModal is a callable function');
assert(wiki1 && typeof wiki1.closeItemDetailModal === 'function', 'WikiDB.closeItemDetailModal is a callable function');

// 1.1 Non-existent item ID
wiki1.openItemDetailModal('non_existent_item_id_9999');
assert(modal1.style.display !== 'flex', 'openItemDetailModal with non-existent ID does not open modal');

// 1.2 Falsy / Null / Undefined inputs
wiki1.openItemDetailModal(null);
assert(modal1.style.display !== 'flex', 'openItemDetailModal(null) does not throw or open modal');

wiki1.openItemDetailModal(undefined);
assert(modal1.style.display !== 'flex', 'openItemDetailModal(undefined) does not throw or open modal');

wiki1.openItemDetailModal('');
assert(modal1.style.display !== 'flex', 'openItemDetailModal("") does not throw or open modal');

// 1.3 Malformed / Injection strings
wiki1.openItemDetailModal('<script>alert("xss")</script>');
assert(modal1.style.display !== 'flex', 'openItemDetailModal with XSS payload does not crash');

wiki1.openItemDetailModal('__proto__');
assert(modal1.style.display !== 'flex', 'openItemDetailModal("__proto__") does not pollute prototype or crash');

// 1.4 Close without prior open
wiki1.closeItemDetailModal();
assert(modal1.style.display !== 'flex', 'closeItemDetailModal() without open is safe no-op');

// 1.5 Success Open and Close
wiki1.openItemDetailModal('thunder_stone');
assert(modal1.style.display === 'flex', 'openItemDetailModal("thunder_stone") successfully opens modal');
assert(doc1.body.classList.contains('item-modal-open'), 'body has class "item-modal-open" when open');
assert(doc1.body.classList.contains('modal-open'), 'body has class "modal-open" when open');
assert(doc1.body.style.overflow === 'hidden', 'body style.overflow set to "hidden" when open');

wiki1.closeItemDetailModal();
assert(modal1.style.display === 'none', 'closeItemDetailModal() resets display to "none"');
assert(!doc1.body.classList.contains('item-modal-open'), 'body class "item-modal-open" removed after close');
assert(!doc1.body.classList.contains('modal-open'), 'body class "modal-open" removed after close');
assert(doc1.body.style.overflow === '', 'body style.overflow restored to empty after close');

// Double close
wiki1.closeItemDetailModal();
assert(modal1.style.display === 'none', 'Double closeItemDetailModal() remains safely closed');

// =============================================================================
// Probe 2: Full Catalog Coverage & Modal Content Generation (All 118 Items)
// =============================================================================
console.log('\n[Probe 2] Full Catalog Coverage & Modal Content Generation (All 118 Items)');

let catalogOpenSuccess = 0;
let catalogCloseSuccess = 0;
let catalogBadgeVerified = 0;
let catalogPricingVerified = 0;
let catalogPkmSectionVerified = 0;

for (const item of rawItemsData) {
  wiki1.openItemDetailModal(item.id);
  if (modal1.style.display === 'flex') catalogOpenSuccess++;

  const titleEl = dom1.get('wiki-item-modal-title');
  const catBadgeEl = dom1.get('wiki-item-modal-cat-badge');
  const pkmSectionEl = dom1.get('wiki-item-modal-pokemon-section');
  const pricingEl = dom1.get('wiki-item-modal-pricing');

  if (titleEl && titleEl.textContent && catBadgeEl && catBadgeEl.className.includes(item.category)) {
    catalogBadgeVerified++;
  }

  if (pricingEl && pricingEl.innerHTML.length > 0) {
    catalogPricingVerified++;
  }

  const expectPkmSection = item.category === 'evolution' || item.category === 'pokemon_incense' || (Array.isArray(item.pokemon_ids) && item.pokemon_ids.length > 0);
  if (expectPkmSection) {
    if (pkmSectionEl && pkmSectionEl.style.display === 'block') {
      catalogPkmSectionVerified++;
    }
  } else {
    if (pkmSectionEl && pkmSectionEl.style.display === 'none') {
      catalogPkmSectionVerified++;
    }
  }

  wiki1.closeItemDetailModal();
  if (modal1.style.display === 'none') catalogCloseSuccess++;
}

assertEquals(catalogOpenSuccess, 118, 'All 118 canonical items open successfully');
assertEquals(catalogCloseSuccess, 118, 'All 118 canonical items close cleanly');
assertEquals(catalogBadgeVerified, 118, 'All 118 items render matching category badges & titles');
assertEquals(catalogPricingVerified, 118, 'All 118 items render structured sleep points pricing pills');
assertEquals(catalogPkmSectionVerified, 118, 'All 118 items correctly toggle Pokemon section visibility');

// =============================================================================
// Probe 3: Event Listeners, Backdrop Dismiss & Memory Leak Prevention
// =============================================================================
console.log('\n[Probe 3] Event Listeners, Backdrop Dismiss & Memory Leak Prevention');

// 3.1 Escape Key Dismissal
wiki1.openItemDetailModal('linking_cord');
assertEquals(doc1._getListenerCount('keydown'), 1, 'Exactly 1 keydown listener attached on modal open');

// Press random key (e.g. Tab)
doc1._dispatch('keydown', { key: 'Tab' });
assert(modal1.style.display === 'flex', 'Modal remains open when pressing non-Escape key');

// Press Escape key
doc1._dispatch('keydown', { key: 'Escape' });
assert(modal1.style.display === 'none', 'Modal closes immediately upon pressing Escape key');
assertEquals(doc1._getListenerCount('keydown'), 0, 'keydown listener cleanly detached after Escape dismiss');

// 3.2 Rapid-Switching Stress Harness (Leak Prevention)
for (let i = 0; i < 100; i++) {
  const item = rawItemsData[i % rawItemsData.length];
  wiki1.openItemDetailModal(item.id);
}
assertEquals(doc1._getListenerCount('keydown'), 1, 'Stress test: 100 consecutive modal opens never leak keydown listeners');

// Close and verify listener is 0
wiki1.closeItemDetailModal();
assertEquals(doc1._getListenerCount('keydown'), 0, 'Keydown listener count returns to 0 after closing rapid-switched modal');

// 3.3 HTML Backdrop & Close Button Wireup Audit
assert(desktopHtml.includes('class="wiki-item-modal-backdrop-dismiss" onclick="window.WikiDB.closeItemDetailModal()"'),
  'Desktop index.html binds backdrop dismiss to window.WikiDB.closeItemDetailModal()');
assert(desktopHtml.includes('class="box-modal-close wiki-item-modal-close-btn" onclick="window.WikiDB.closeItemDetailModal()"'),
  'Desktop index.html binds close button to window.WikiDB.closeItemDetailModal()');

assert(mobileHtml.includes('class="wiki-item-modal-backdrop-dismiss" onclick="window.WikiDB.closeItemDetailModal()"'),
  'Mobile app/index.html binds backdrop dismiss to window.WikiDB.closeItemDetailModal()');
assert(mobileHtml.includes('class="box-modal-close wiki-item-modal-close-btn" onclick="window.WikiDB.closeItemDetailModal()"'),
  'Mobile app/index.html binds close button to window.WikiDB.closeItemDetailModal()');

// 3.4 Fallback Dynamic Element Lifecycle
const { sandbox: envOrphan, mockDocument: docOrphan } = buildBrowserEnvironment();
// Intentionally remove the pre-seeded modal to test lazy DOM creation
docOrphan.body.removeChild(docOrphan.getElementById('wiki-item-detail-modal'));
assert(!docOrphan.getElementById('wiki-item-detail-modal'), 'Modal element is absent before open');

// Open item -> should lazy create
envOrphan.window.WikiDB.openItemDetailModal('fire_stone');
const lazyModal = docOrphan.getElementById('wiki-item-detail-modal');
assert(lazyModal !== null, 'WikiDB.openItemDetailModal lazily creates modal DOM node when missing');
assertEquals(lazyModal.style.display, 'flex', 'Lazily created modal is displayed flex');

// Open another item -> should REUSE existing lazy modal without creating duplicate elements
const initialChildCount = docOrphan.body.children.length;
envOrphan.window.WikiDB.openItemDetailModal('water_stone');
assertEquals(docOrphan.body.children.length, initialChildCount, 'Consecutive modal opens reuse same element (no orphan duplicates)');
envOrphan.window.WikiDB.closeItemDetailModal();
assertEquals(lazyModal.style.display, 'none', 'Lazily created modal closes properly');

// =============================================================================
// Probe 4: Modal Suspension Protocol (__suspendedForDetail)
// =============================================================================
console.log('\n[Probe 4] Modal Suspension Protocol (__suspendedForDetail)');

const { sandbox: envSusp, mockDocument: docSusp, domElements: domSusp } = buildBrowserEnvironment();
const wikiSusp = envSusp.window.WikiDB;
const pokedexModal = domSusp.get('pokedex-detail-modal');
const itemModalSusp = domSusp.get('wiki-item-detail-modal');

// 4.1 Dex -> Item Modal Suspension Flow
// User is viewing Pokedex modal
pokedexModal.style.display = 'flex';
docSusp.body.classList.add('pokedex-modal-open');
pokedexModal.__suspendedForDetail = false;

// User clicks evolution item chip (e.g. Thunder Stone)
wikiSusp.openItemDetailModal('thunder_stone');

assert(pokedexModal.style.display === 'none', 'Active Pokedex modal is hidden when item modal opens');
assert(pokedexModal.__suspendedForDetail === true, 'Pokedex modal is tagged with __suspendedForDetail = true');
assert(itemModalSusp.style.display === 'flex', 'Item modal is displayed flex');
assert(docSusp.body.classList.contains('item-modal-open'), 'Body carries item-modal-open class');

// 4.2 Item Modal Dismissal -> Dex Restoration
wikiSusp.closeItemDetailModal();

assert(itemModalSusp.style.display === 'none', 'Item modal is closed (display: none)');
assert(pokedexModal.style.display === 'flex', 'Suspended Pokedex modal is automatically restored to display: flex');
assert(pokedexModal.__suspendedForDetail === false, '__suspendedForDetail flag is reset to false');
assert(docSusp.body.classList.contains('pokedex-modal-open'), 'Body preserves pokedex-modal-open class');

// 4.3 Item Modal Dismissal WITHOUT Prior Dex Open
pokedexModal.style.display = 'none';
pokedexModal.__suspendedForDetail = false;
docSusp.body.classList.remove('pokedex-modal-open');

wikiSusp.openItemDetailModal('leaf_stone');
assert(itemModalSusp.style.display === 'flex', 'Item modal opens directly from wiki');
assert(pokedexModal.__suspendedForDetail === false, 'Pokedex modal is NOT marked suspended when it was not open');

wikiSusp.closeItemDetailModal();
assert(itemModalSusp.style.display === 'none', 'Item modal closes directly');
assert(pokedexModal.style.display === 'none', 'Pokedex modal remains closed');
assert(!docSusp.body.classList.contains('pokedex-modal-open'), 'Body does NOT gain pokedex-modal-open class');
assert(!docSusp.body.classList.contains('item-modal-open'), 'Body cleans up item-modal-open class');
assertEquals(docSusp.body.style.overflow, '', 'Body style.overflow is completely unlocked');

// 4.4 Item -> Dex Forward Navigation (navigateToPokemonDex)
wikiSusp.openItemDetailModal('thunder_stone');
assert(wikiSusp.navigateToPokemonDex, 'WikiDB.navigateToPokemonDex is defined');

// Click Raichu (id: '26') in item modal
wikiSusp.navigateToPokemonDex('26');
assert(itemModalSusp.style.display === 'none', 'Item modal is dismissed when navigating to Pokemon Dex');
assertEquals(envSusp.window.PokemonApp.lastOpenedPokemonId, '26', 'PokemonApp.openPokemonDetailModal called with target Pokemon ID');
assert(pokedexModal.style.display === 'flex', 'Pokedex modal opens for selected Pokemon');
assert(pokedexModal.__suspendedForDetail === false, '__suspendedForDetail is false upon forward navigation');

// =============================================================================
// Probe 5: Bidirectional Linkage Integrity (Pokedex Evolution Chips)
// =============================================================================
console.log('\n[Probe 5] Bidirectional Linkage Integrity (Pokedex Evolution Chips)');

const evoDefsMatch = appJsCode.match(/const\s+POKEDEX_EVO_ITEM_DEFINITIONS\s*=\s*(\[[\s\S]*?\]);/);
assert(evoDefsMatch !== null, 'app.js defines POKEDEX_EVO_ITEM_DEFINITIONS');

const sandboxEvo = { window: {} };
vm.createContext(sandboxEvo);
const evoDefs = vm.runInContext(evoDefsMatch[1], sandboxEvo);
assertEquals(evoDefs.length, 17, 'POKEDEX_EVO_ITEM_DEFINITIONS contains exactly 17 canonical evolution items');

for (const def of evoDefs) {
  const masterItem = rawItemsData.find(x => x.id === def.id);
  assert(masterItem !== undefined, `Evolution item definition [${def.id}] exists in data/items.json`);
}

// 5.2 Single Evolution Item Detection & HTML Chip Generation
const getPokemonEvolutionItems = env1.getPokemonEvolutionItems;
const renderPokedexEvoItemChipsHTML = env1.renderPokedexEvoItemChipsHTML;

assert(typeof getPokemonEvolutionItems === 'function', 'getPokemonEvolutionItems is defined');
assert(typeof renderPokedexEvoItemChipsHTML === 'function', 'renderPokedexEvoItemChipsHTML is defined');

// Raichu requires Thunder Stone
const raichu = { id: 26, name_cn: '雷丘', evo_req: '雷之石' };
const raichuEvoItems = getPokemonEvolutionItems(raichu);
assertEquals(raichuEvoItems.length, 1, 'Raichu matches exactly 1 evolution item');
assertEquals(raichuEvoItems[0].id, 'thunder_stone', 'Raichu matches thunder_stone');

const raichuHtml = renderPokedexEvoItemChipsHTML(raichu);
assert(raichuHtml.includes('class="pokedex-evo-item-btn"'), 'Raichu renders pokedex-evo-item-btn');
assert(raichuHtml.includes('data-evo-item-id="thunder_stone"'), 'Raichu chip carries data-evo-item-id="thunder_stone"');
assert(raichuHtml.includes("openItemDetailModal('thunder_stone')"), 'Raichu chip calls openItemDetailModal with thunder_stone');

// 5.3 Dual Evolution Item Detection (Slowking & Steelix)
const slowking = { id: 199, name_cn: '呆呆王', evo_req: '王者之證 + 聯繫繩' };
const slowkingEvoItems = getPokemonEvolutionItems(slowking);
assertEquals(slowkingEvoItems.length, 2, 'Slowking matches 2 evolution items (王者之證 + 聯繫繩)');
const slowkingIds = slowkingEvoItems.map(x => x.id).sort();
assertEquals(slowkingIds[0], 'kings_rock', 'Slowking includes kings_rock');
assertEquals(slowkingIds[1], 'linking_cord', 'Slowking includes linking_cord');

const slowkingHtml = renderPokedexEvoItemChipsHTML(slowking);
assert(slowkingHtml.includes("openItemDetailModal('kings_rock')"), 'Slowking chip links to kings_rock');
assert(slowkingHtml.includes("openItemDetailModal('linking_cord')"), 'Slowking chip links to linking_cord');

// Steelix requires Metal Coat + Linking Cord
const steelix = { id: 208, name_cn: '大鋼蛇', evo_req: '金屬膜 + 聯繫繩' };
const steelixEvoItems = getPokemonEvolutionItems(steelix);
assertEquals(steelixEvoItems.length, 2, 'Steelix matches 2 evolution items (金屬膜 + 聯繫繩)');

// 5.4 Non-Item Evolution Species
const charizard = { id: 6, name_cn: '噴火龍', evo_req: 'Lv.36' };
const charizardEvoItems = getPokemonEvolutionItems(charizard);
assertEquals(charizardEvoItems.length, 0, 'Charizard (level evo) has 0 evolution items');
assertEquals(renderPokedexEvoItemChipsHTML(charizard), '', 'Charizard renders empty evo chips HTML');

const unevolved = { id: 1, name_cn: '妙蛙種子', evo_req: '' };
assertEquals(getPokemonEvolutionItems(unevolved).length, 0, 'Base Pokemon has 0 evolution items');
assertEquals(renderPokedexEvoItemChipsHTML(unevolved), '', 'Base Pokemon renders empty evo chips HTML');

// 5.5 Pokedex Header Wiring in app.js
assert(appJsCode.includes('${renderPokedexEvoItemChipsHTML(pkm)}'),
  'app.js injects renderPokedexEvoItemChipsHTML into pokedex header');
assert(appJsCode.includes('<div class="pokedex-header-name-row">'),
  'app.js defines pokedex-header-name-row container');

// 5.6 Multilingual Tooltip Rendering
env1.window.I18N.setLanguage('en-US');
const raichuHtmlEn = renderPokedexEvoItemChipsHTML(raichu);
assert(raichuHtmlEn.includes('Evolution Item:'), 'English mode renders English tooltip for evolution chip');

env1.window.I18N.setLanguage('zh-TW');
const raichuHtmlTw = renderPokedexEvoItemChipsHTML(raichu);
assert(raichuHtmlTw.includes('進化道具：'), 'Traditional Chinese mode renders Chinese tooltip for evolution chip');

// =============================================================================
// Probe 6: CSS Single Frame Rule Invariants (User Rule IX)
// =============================================================================
console.log('\n[Probe 6] CSS Single Frame Rule Invariants (User Rule IX)');

// Modal dialog carries outer frame
assert(stylesCss.includes('.wiki-item-modal-dialog'), 'styles.css defines .wiki-item-modal-dialog');
assert(stylesCss.includes('border: 1px solid var(--border-color'), 'Modal dialog carries single frame border');

// Modal Body has no duplicate outer border
const bodyRuleMatch = stylesCss.match(/\.wiki-item-modal-body\s*\{([\s\S]*?)\}/);
assert(bodyRuleMatch !== null, 'styles.css defines .wiki-item-modal-body');
assert(bodyRuleMatch[1].includes('border: none !important'), '.wiki-item-modal-body declares border: none !important');
assert(bodyRuleMatch[1].includes('background: transparent !important'), '.wiki-item-modal-body declares background: transparent !important');

// Modal Sections have no duplicate outer borders or padding
const sectionRuleMatch = stylesCss.match(/\.wiki-item-modal-section\s*\{([\s\S]*?)\}/);
assert(sectionRuleMatch !== null, 'styles.css defines .wiki-item-modal-section');
assert(sectionRuleMatch[1].includes('border: none !important'), '.wiki-item-modal-section declares border: none !important');
assert(sectionRuleMatch[1].includes('background: transparent !important'), '.wiki-item-modal-section declares background: transparent !important');
assert(sectionRuleMatch[1].includes('padding: 0 !important'), '.wiki-item-modal-section declares padding: 0 !important');

// Pricing Grid has no outer duplicate frame
const priceGridMatch = stylesCss.match(/\.wiki-item-pricing-grid\s*\{([\s\S]*?)\}/);
assert(priceGridMatch !== null, 'styles.css defines .wiki-item-pricing-grid');
assert(priceGridMatch[1].includes('border: none !important'), '.wiki-item-pricing-grid declares border: none !important');
assert(priceGridMatch[1].includes('background: transparent !important'), '.wiki-item-pricing-grid declares background: transparent !important');

// Acquisition list has no outer duplicate frame
const acqListMatch = stylesCss.match(/\.wiki-item-acq-list\s*\{([\s\S]*?)\}/);
assert(acqListMatch !== null, 'styles.css defines .wiki-item-acq-list');
assert(acqListMatch[1].includes('border: none !important'), '.wiki-item-acq-list declares border: none !important');
assert(acqListMatch[1].includes('background: transparent !important'), '.wiki-item-acq-list declares background: transparent !important');

// Associated Pokemon Grid has no outer duplicate frame
const pkmGridMatch = stylesCss.match(/\.wiki-item-pokemon-grid\s*\{([\s\S]*?)\}/);
assert(pkmGridMatch !== null, 'styles.css defines .wiki-item-pokemon-grid');
assert(pkmGridMatch[1].includes('border: none !important'), '.wiki-item-pokemon-grid declares border: none !important');
assert(pkmGridMatch[1].includes('background: transparent !important'), '.wiki-item-pokemon-grid declares background: transparent !important');

// Leaf items carry single semantic borders
assert(stylesCss.includes('.wiki-item-price-pill {\n  background: var(--bg-card-inner);\n  border: 1px solid var(--border-color);'),
  'Leaf price pill carries single semantic border');
assert(stylesCss.includes('.wiki-item-acq-item {\n  background: var(--bg-card-inner);\n  border: 1px solid var(--border-color);'),
  'Leaf acquisition item carries single semantic border');
assert(stylesCss.includes('.wiki-item-pkm-card {\n  background: var(--bg-card-inner);\n  border: 1px solid var(--border-color);'),
  'Leaf Pokemon card carries single semantic border');

// =============================================================================
// Probe 7: 4 Themes & Mobile H5 Viewport Constraints
// =============================================================================
console.log('\n[Probe 7] 4 Themes & Mobile H5 Viewport Constraints');

// 7.1 Themes: Midnight, Onyx, Dawn, Emerald
assert(stylesCss.includes('[data-theme="dawn"] .pokedex-evo-item-btn'), 'styles.css defines Dawn theme for evo item button');
assert(stylesCss.includes('[data-theme="emerald"] .pokedex-evo-item-btn'), 'styles.css defines Emerald theme for evo item button');
assert(stylesCss.includes('[data-theme="onyx"] .pokedex-evo-item-btn'), 'styles.css defines Onyx theme for evo item button');

assert(stylesCss.includes('[data-theme="dawn"] .wiki-item-modal-dialog'), 'styles.css overrides Dawn theme for item modal dialog');
assert(stylesCss.includes('[data-theme="emerald"] .wiki-item-modal-dialog'), 'styles.css overrides Emerald theme for item modal dialog');
assert(stylesCss.includes('background: #ffffff !important;'), 'Dawn and Emerald dialogs have white background');
assert(stylesCss.includes('[data-theme="dawn"] .wiki-item-price-pill'), 'Dawn theme styles item price pills');
assert(stylesCss.includes('[data-theme="emerald"] .wiki-item-price-pill'), 'Emerald theme styles item price pills');

// 7.2 Mobile H5 Bottom Sheet Adaptations
const mobileSheetMatch = stylesCss.match(/\.mobile-h5-app\s+#wiki-item-detail-modal\s+\.wiki-item-modal-dialog\.mobile-modal-sheet\s*\{([\s\S]*?)\}/);
assert(mobileSheetMatch !== null, 'styles.css defines mobile bottom sheet rule for item modal');
const sheetCss = mobileSheetMatch[1];

assert(sheetCss.includes('position: fixed !important'), 'Mobile sheet is position: fixed !important');
assert(sheetCss.includes('bottom: 0 !important'), 'Mobile sheet is pinned to bottom: 0 !important');
assert(sheetCss.includes('width: 100% !important'), 'Mobile sheet spans width: 100% !important');
assert(sheetCss.includes('border-top-left-radius: 20px !important'), 'Mobile sheet has 20px top-left rounded corner');
assert(sheetCss.includes('border-top-right-radius: 20px !important'), 'Mobile sheet has 20px top-right rounded corner');
assert(sheetCss.includes('border-bottom-left-radius: 0 !important'), 'Mobile sheet has 0 bottom-left radius');
assert(sheetCss.includes('border-bottom-right-radius: 0 !important'), 'Mobile sheet has 0 bottom-right radius');
assert(sheetCss.includes('border-left: none !important'), 'Mobile sheet eliminates left border');
assert(sheetCss.includes('border-right: none !important'), 'Mobile sheet eliminates right border');
assert(sheetCss.includes('border-bottom: none !important'), 'Mobile sheet eliminates bottom border');
assert(sheetCss.includes('max-height: 88vh !important') || sheetCss.includes('max-height: 88dvh !important'),
  'Mobile sheet bounds maximum height within viewport');

// Drag handle markup present in mobile HTML
assert(mobileHtml.includes('<div class="sheet-drag-handle"></div>'),
  'Mobile app/index.html includes sheet-drag-handle element');

// Overlay Registry integration
assert(appJsCode.includes("'wiki-item-detail-modal'") && appJsCode.includes('MOBILE_OVERLAY_IDS'),
  'wiki-item-detail-modal is registered in MOBILE_OVERLAY_IDS');

// Overlay exit animations
assert(stylesCss.includes('#wiki-item-detail-modal.overlay-closing'), 'styles.css defines backdrop closing animation');
assert(stylesCss.includes('.mobile-h5-app .overlay-closing .wiki-item-modal-dialog.mobile-modal-sheet'),
  'styles.css defines mobile sheet closing animation overlaySheetOut');

// =============================================================================
// Probe 8: Zero Emoji Policy Audit (User Rule VIII)
// =============================================================================
console.log('\n[Probe 8] Zero Emoji Policy Audit (User Rule VIII)');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function auditEmoji(content, label) {
  const match = content.match(emojiRegex);
  assert(!match, `${label} contains zero emojis (found: ${match ? match[0] : 'none'})`);
}

auditEmoji(JSON.stringify(rawItemsData), 'data/items.json');
auditEmoji(desktopHtml.slice(desktopHtml.indexOf('id="wiki-item-detail-modal"'), desktopHtml.indexOf('id="wiki-item-detail-modal"') + 2000),
  'index.html item detail modal markup');
auditEmoji(mobileHtml.slice(mobileHtml.indexOf('id="wiki-item-detail-modal"'), mobileHtml.indexOf('id="wiki-item-detail-modal"') + 2000),
  'app/index.html mobile modal markup');

const wikiModalCode = wikiJsCode.slice(wikiJsCode.indexOf('// --- 道具詳細資訊彈窗與雙向圖鑑跳轉模組'), wikiJsCode.indexOf('// 渲染 Wiki 主佈局與 5 大子分頁'));
auditEmoji(wikiModalCode, 'js/modules/wiki.js modal lifecycle code');

const appEvoCode = appJsCode.slice(appJsCode.indexOf('// Canonical evolution items definitions'), appJsCode.indexOf('function renderPokedexEvoGuardBadgeHTML'));
auditEmoji(appEvoCode, 'js/modules/app.js evo chips code');

const modalCssCode = stylesCss.slice(stylesCss.indexOf('/* ==========================================================================\n   Milestone 3: Item Detail Modal'));
auditEmoji(modalCssCode, 'css/styles.css Milestone 3 CSS code');

// =============================================================================
// Summary and Diagnostic Output
// =============================================================================
console.log('\n================================================================');
console.log('         Challenger M3-2 Empirical Results Summary');
console.log('================================================================');
console.log(`- Total Invariants Tested: ${totalChecks}`);
console.log(`- Passed Checks:           ${passedChecks}`);
console.log(`- Failed Checks:           ${failedChecks}`);
console.log('----------------------------------------------------------------');

if (failedChecks === 0) {
  console.log('CHALLENGER VERDICT: APPROVE');
  console.log('All Milestone 3 empirical invariants, modal lifecycle hooks,');
  console.log('suspension protocols, memory leak protections, single frame rules,');
  console.log('theme tokens, and zero emoji constraints are 100% compliant.\n');
  process.exit(0);
} else {
  console.error('CHALLENGER VERDICT: REQUEST_CHANGES');
  console.error('The following invariants failed verification:');
  for (const detail of failureDetails) {
    console.error('  - ' + detail);
  }
  process.exit(1);
}
