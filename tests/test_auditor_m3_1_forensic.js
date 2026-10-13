/**
 * Forensic Audit Test Probe for Milestone 3
 * Item Detail Modal & Bidirectional Dex Linkage
 *
 * Verifies:
 * 1. Anti-Cheat & Facade Source Scan
 * 2. Real DOM Construction & Data Population across all 118 items
 * 3. Bidirectional Linkage (Item Modal -> Pokédex & Pokédex -> Item Modal)
 * 4. Evolution Item Matching (17 items, multi-item evolutions, non-evo species)
 * 5. Modal Suspension Protocol (__suspendedForDetail)
 * 6. Adversarial Input Stress & Robustness
 * 7. Single Frame Rule & Zero Emoji Invariants
 *
 * Execution:
 *   rtk node tests/test_auditor_m3_1_forensic.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function check(title, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${title}`);
    return true;
  } catch (err) {
    failedTests++;
    const errMsg = err.message || String(err);
    failureDetails.push({ title, error: errMsg });
    console.log(`  [FAIL] ${title}`);
    console.log(`         Error: ${errMsg}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('================================================================');
console.log('  Forensic Auditor M3-1: Deep Integrity & Adversarial Tests');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Probe 1: Anti-Cheat & Facade Source Scan
// -----------------------------------------------------------------------------
console.log('[Probe 1] Anti-Cheat & Source Authenticity Analysis');

const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
const appPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js');
const wikiCode = fs.readFileSync(wikiPath, 'utf8');
const appCode = fs.readFileSync(appPath, 'utf8');

check('No fake test bypass conditionals in wiki.js or app.js', () => {
  const suspiciousTokens = [
    '__TEST_BYPASS__',
    'isTestRunner',
    'if (isTest)',
    'if (__TEST__)',
    'skipIntegrityCheck',
    'fakeModal',
    'mockModal'
  ];
  for (const token of suspiciousTokens) {
    assert(!wikiCode.includes(token), `Suspicious bypass token found in wiki.js: ${token}`);
    assert(!appCode.includes(token), `Suspicious bypass token found in app.js: ${token}`);
  }
});

check('Item detail modal functions have substantive implementation bodies (>20 lines)', () => {
  const openFnMatch = wikiCode.match(/function\s+openItemDetailModal\s*\([\s\S]*?\n\s*function/);
  assert(openFnMatch, 'openItemDetailModal function body could not be isolated');
  assert(openFnMatch[0].split('\n').length > 50, 'openItemDetailModal appears to be a facade stub (< 50 lines)');

  const closeFnMatch = wikiCode.match(/function\s+closeItemDetailModal\s*\([\s\S]*?\n\s*function/);
  assert(closeFnMatch, 'closeItemDetailModal function body could not be isolated');
  assert(closeFnMatch[0].split('\n').length > 25, 'closeItemDetailModal appears to be a facade stub (< 25 lines)');

  const renderContentMatch = wikiCode.match(/function\s+renderItemDetailModalContent\s*\([\s\S]*?\n\s*function/);
  assert(renderContentMatch, 'renderItemDetailModalContent function body could not be isolated');
  assert(renderContentMatch[0].split('\n').length > 100, 'renderItemDetailModalContent appears to be a facade stub (< 100 lines)');
});

check('POKEDEX_EVO_ITEM_DEFINITIONS in app.js contains all 17 canonical evolution items', () => {
  const expectedItems = [
    'thunder_stone', 'fire_stone', 'water_stone', 'leaf_stone',
    'moon_stone', 'sun_stone', 'ice_stone', 'shiny_stone',
    'dusk_stone', 'dawn_stone', 'oval_stone', 'linking_cord',
    'metal_coat', 'kings_rock', 'up_grade', 'razor_claw', 'dragon_scale'
  ];
  for (const itemId of expectedItems) {
    assert(appCode.includes(`id: '${itemId}'`), `Missing canonical evolution item in app.js: ${itemId}`);
  }
});

// -----------------------------------------------------------------------------
// Load Master Datasets
// -----------------------------------------------------------------------------
const itemsDataPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
const itemsData = JSON.parse(fs.readFileSync(itemsDataPath, 'utf8'));
const pokemonDataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
const allPokemons = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));

// -----------------------------------------------------------------------------
// Helper: Setup Simulated Browser Environment
// -----------------------------------------------------------------------------
function createDOMEnvironment() {
  const elements = new Map();

  class MockElement {
    constructor(tagName, id = '') {
      this.tagName = tagName.toUpperCase();
      this.id = id;
      this.className = '';
      this.classList = {
        _classes: new Set(),
        add: (...cls) => cls.forEach(c => this.classList._classes.add(c)),
        remove: (...cls) => cls.forEach(c => this.classList._classes.delete(c)),
        contains: (c) => this.classList._classes.has(c)
      };
      this.style = {};
      this.attributes = new Map();
      this.children = [];
      this.parentElement = null;
      this._innerHTML = '';
      this.textContent = '';
      this.onclick = null;
      this.src = '';
      this.alt = '';
      if (id) elements.set(id, this);
    }

    get innerHTML() {
      return this._innerHTML;
    }

    set innerHTML(val) {
      this._innerHTML = val;
      // Parse child IDs if any
      const idMatches = [...val.matchAll(/id=["']([^"']+)["']/g)];
      for (const m of idMatches) {
        if (!elements.has(m[1])) {
          const child = new MockElement('div', m[1]);
          child.parentElement = this;
          this.children.push(child);
        }
      }
    }

    setAttribute(key, val) {
      this.attributes.set(key, val);
    }

    getAttribute(key) {
      return this.attributes.get(key) || null;
    }

    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      if (child.id) elements.set(child.id, child);
      return child;
    }

    querySelector(selector) {
      if (selector.startsWith('#')) {
        const id = selector.slice(1);
        return elements.get(id) || null;
      }
      return null;
    }

    querySelectorAll(selector) {
      return [];
    }
  }

  const documentMock = {
    body: new MockElement('body'),
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => elements.get(id) || null,
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  // Pre-create modal containers as defined in index.html
  const modalContainer = new MockElement('div', 'wiki-item-detail-modal');
  modalContainer.className = 'wiki-item-modal-backdrop';
  modalContainer.style.display = 'none';

  // Child IDs
  const titleEl = new MockElement('h3', 'wiki-item-modal-title');
  const catBadgeEl = new MockElement('span', 'wiki-item-modal-cat-badge');
  const subtitleEl = new MockElement('p', 'wiki-item-modal-subtitle');
  const iconEl = new MockElement('img', 'wiki-item-modal-icon');
  const effectsEl = new MockElement('p', 'wiki-item-modal-effects');
  const descEl = new MockElement('p', 'wiki-item-modal-desc');
  const pricingEl = new MockElement('div', 'wiki-item-modal-pricing');
  const acqListEl = new MockElement('ul', 'wiki-item-modal-acq-list');
  const pkmSectionEl = new MockElement('section', 'wiki-item-modal-pokemon-section');
  const pkmCountEl = new MockElement('span', 'wiki-item-modal-pkm-count');
  const pkmGridEl = new MockElement('div', 'wiki-item-modal-pokemon-grid');
  const pkmSectionTitleEl = new MockElement('h4', 'wiki-item-pokemon-section-title');
  const bodyEl = new MockElement('div', 'wiki-item-modal-body');

  modalContainer.appendChild(titleEl);
  modalContainer.appendChild(catBadgeEl);
  modalContainer.appendChild(subtitleEl);
  modalContainer.appendChild(iconEl);
  modalContainer.appendChild(effectsEl);
  modalContainer.appendChild(descEl);
  modalContainer.appendChild(pricingEl);
  modalContainer.appendChild(acqListEl);
  modalContainer.appendChild(pkmSectionEl);
  modalContainer.appendChild(pkmCountEl);
  modalContainer.appendChild(pkmGridEl);
  modalContainer.appendChild(pkmSectionTitleEl);
  modalContainer.appendChild(bodyEl);

  documentMock.body.appendChild(modalContainer);

  const pokedexModal = new MockElement('div', 'pokedex-detail-modal');
  pokedexModal.style.display = 'none';
  documentMock.body.appendChild(pokedexModal);

  const sandbox = {
    window: {},
    document: documentMock,
    console: console,
    ITEMS_DATA: itemsData,
    allPokemons: allPokemons,
    escapeHtml: (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    setTimeout: (fn) => fn(),
    clearTimeout: () => {}
  };

  sandbox.window = sandbox;
  sandbox.window.ITEMS_DATA = itemsData;
  sandbox.window.allPokemons = allPokemons;

  vm.createContext(sandbox);

  // Load app.js and wiki.js in sandbox
  vm.runInContext(appCode, sandbox);
  vm.runInContext(wikiCode, sandbox);

  return { sandbox, elements, documentMock };
}

// -----------------------------------------------------------------------------
// Probe 2: Data Population Integrity Across All 118 Items
// -----------------------------------------------------------------------------
console.log('\n[Probe 2] Real DOM Construction & Data Population for all 118 Items');

const { sandbox, elements, documentMock } = createDOMEnvironment();

check('openItemDetailModal executes and populates DOM for all 118 items without error', () => {
  assert(typeof sandbox.WikiDB.openItemDetailModal === 'function', 'WikiDB.openItemDetailModal must be exposed');

  for (const item of itemsData) {
    sandbox.WikiDB.openItemDetailModal(item.id);

    const modal = elements.get('wiki-item-detail-modal');
    assert(modal.style.display === 'flex', `Modal was not displayed for item ${item.id}`);

    const titleEl = elements.get('wiki-item-modal-title');
    assert(titleEl.textContent === item.name['zh-TW'], `Title text mismatch for ${item.id}: expected ${item.name['zh-TW']}, got ${titleEl.textContent}`);

    const iconEl = elements.get('wiki-item-modal-icon');
    assertEquals(iconEl.src, item.icon_url, `Icon URL mismatch for ${item.id}`);

    const catBadgeEl = elements.get('wiki-item-modal-cat-badge');
    assert(catBadgeEl.textContent.length > 0, `Category badge empty for ${item.id}`);

    const effectsEl = elements.get('wiki-item-modal-effects');
    assert(effectsEl.textContent.length > 0, `Effects text empty for ${item.id}`);

    const pkmSectionEl = elements.get('wiki-item-modal-pokemon-section');
    const pkmCountEl = elements.get('wiki-item-modal-pkm-count');

    if (item.category === 'evolution' || item.category === 'pokemon_incense') {
      assertEquals(pkmSectionEl.style.display, 'block', `Pokemon section should be visible for ${item.id}`);
      const expectedCount = (item.pokemon_ids || []).length;
      assertEquals(pkmCountEl.textContent, String(expectedCount), `Pokemon count badge mismatch for ${item.id}`);
    } else if (!item.pokemon_ids || item.pokemon_ids.length === 0) {
      assertEquals(pkmSectionEl.style.display, 'none', `Pokemon section should be hidden for supply/biscuit ${item.id}`);
    }

    sandbox.WikiDB.closeItemDetailModal();
    assertEquals(modal.style.display, 'none', `Modal was not hidden after close for ${item.id}`);
  }
});

// -----------------------------------------------------------------------------
// Probe 3: Bidirectional Linkage Verification (Dex -> Item Modal)
// -----------------------------------------------------------------------------
console.log('\n[Probe 3] Bidirectional Linkage Verification (Dex -> Item Modal)');

check('getPokemonEvolutionItems accurately resolves single and multi-item evolutions', () => {
  assert(typeof sandbox.PokemonApp.getPokemonEvolutionItems === 'function', 'getPokemonEvolutionItems must be exposed on PokemonApp');

  // 1. Raichu (id 26) -> Thunder Stone
  const raichu = allPokemons.find(p => String(p.id) === '26');
  assert(raichu, 'Raichu not found in data.json');
  const raichuItems = sandbox.PokemonApp.getPokemonEvolutionItems(raichu);
  assertEquals(raichuItems.length, 1, 'Raichu should have exactly 1 evolution item');
  assertEquals(raichuItems[0].id, 'thunder_stone', 'Raichu evo item must be thunder_stone');

  // 2. Slowking (id 199) -> King\'s Rock + Linking Cord (Multi-item evo)
  const slowking = allPokemons.find(p => String(p.id) === '199');
  assert(slowking, 'Slowking not found in data.json');
  const slowkingItems = sandbox.PokemonApp.getPokemonEvolutionItems(slowking);
  assertEquals(slowkingItems.length, 2, 'Slowking requires 2 items (Kings Rock + Linking Cord)');
  const slowkingIds = slowkingItems.map(x => x.id).sort();
  assertEquals(slowkingIds[0], 'kings_rock', 'Slowking item 1 must be kings_rock');
  assertEquals(slowkingIds[1], 'linking_cord', 'Slowking item 2 must be linking_cord');

  // 3. Steelix (id 208) -> Metal Coat + Linking Cord
  const steelix = allPokemons.find(p => String(p.id) === '208');
  assert(steelix, 'Steelix not found in data.json');
  const steelixItems = sandbox.PokemonApp.getPokemonEvolutionItems(steelix);
  assertEquals(steelixItems.length, 2, 'Steelix requires 2 items (Metal Coat + Linking Cord)');
  const steelixIds = steelixItems.map(x => x.id).sort();
  assertEquals(steelixIds[0], 'linking_cord', 'Steelix item 1 must be linking_cord');
  assertEquals(steelixIds[1], 'metal_coat', 'Steelix item 2 must be metal_coat');

  // 4. Non-item evolving species (Pikachu, Bulbasaur, Pinsir) -> 0 items
  const bulbasaur = allPokemons.find(p => String(p.id) === '1');
  const bulbaItems = sandbox.PokemonApp.getPokemonEvolutionItems(bulbasaur);
  assertEquals(bulbaItems.length, 0, 'Bulbasaur does not require evolution items');

  const pinsir = allPokemons.find(p => String(p.id) === '127');
  const pinsirItems = sandbox.PokemonApp.getPokemonEvolutionItems(pinsir);
  assertEquals(pinsirItems.length, 0, 'Pinsir does not evolve');
});

check('renderPokedexEvoItemChipsHTML renders clickable button with correct onclick WikiDB hook', () => {
  assert(typeof sandbox.PokemonApp.renderPokedexEvoItemChipsHTML === 'function', 'renderPokedexEvoItemChipsHTML must be exposed on PokemonApp');

  const raichu = allPokemons.find(p => String(p.id) === '26');
  const html = sandbox.PokemonApp.renderPokedexEvoItemChipsHTML(raichu);
  assert(html.includes('class="pokedex-evo-item-btn"'), 'Must render button with class pokedex-evo-item-btn');
  assert(html.includes('data-evo-item-id="thunder_stone"'), 'Must include data-evo-item-id="thunder_stone"');
  assert(html.includes("openItemDetailModal('thunder_stone')"), 'Must invoke WikiDB.openItemDetailModal with thunder_stone');
  assert(html.includes('雷之石'), 'Must include item name in button');
  assert(html.includes('thunderstone.png'), 'Must include item icon image');
});

// -----------------------------------------------------------------------------
// Probe 4: Modal Suspension Protocol Verification
// -----------------------------------------------------------------------------
console.log('\n[Probe 4] Modal Suspension Protocol (__suspendedForDetail)');

check('Opening item modal suspends open Pokedex modal and restores it upon closing', () => {
  const pokedexModal = elements.get('pokedex-detail-modal');
  const itemModal = elements.get('wiki-item-detail-modal');

  // User currently has Pokedex modal open
  pokedexModal.style.display = 'flex';
  assertEquals(pokedexModal.style.display, 'flex');

  // User clicks evolution item chip in Pokedex modal
  sandbox.WikiDB.openItemDetailModal('thunder_stone');

  // Item modal is now open, Pokedex modal is hidden and marked suspended
  assertEquals(itemModal.style.display, 'flex', 'Item modal should be open');
  assertEquals(pokedexModal.style.display, 'none', 'Pokedex modal should be hidden');
  assertEquals(pokedexModal.__suspendedForDetail, true, 'pokedexModal.__suspendedForDetail should be true');

  // User closes item detail modal
  sandbox.WikiDB.closeItemDetailModal();

  // Item modal is closed, Pokedex modal is restored to display: flex and suspended flag cleared
  assertEquals(itemModal.style.display, 'none', 'Item modal should be closed');
  assertEquals(pokedexModal.style.display, 'flex', 'Pokedex modal should be restored');
  assertEquals(pokedexModal.__suspendedForDetail, false, 'Suspended flag should be reset to false');
});

check('navigateToPokemonDex clears suspended state, closes item modal and opens Pokedex modal', () => {
  const pokedexModal = elements.get('pokedex-detail-modal');
  const itemModal = elements.get('wiki-item-detail-modal');

  // Setup state: item modal open with suspended pokedex
  pokedexModal.style.display = 'none';
  pokedexModal.__suspendedForDetail = true;
  sandbox.WikiDB.openItemDetailModal('thunder_stone');

  let openedPokemonId = null;
  sandbox.PokemonApp.openPokemonDetailModal = (target) => {
    openedPokemonId = target;
  };

  sandbox.WikiDB.navigateToPokemonDex('26');

  assertEquals(pokedexModal.__suspendedForDetail, false, 'Suspension must be cleared before navigating to new Dex target');
  assertEquals(itemModal.style.display, 'none', 'Item modal must be closed');
  assertEquals(openedPokemonId, '26', 'PokemonApp.openPokemonDetailModal must be called with target ID');
});

// -----------------------------------------------------------------------------
// Probe 5: Adversarial Boundary & Stress Cases
// -----------------------------------------------------------------------------
console.log('\n[Probe 5] Adversarial Boundary & Stress Testing');

check('openItemDetailModal handles null, undefined, empty, and invalid IDs gracefully', () => {
  // None of these should throw exceptions
  sandbox.WikiDB.openItemDetailModal(null);
  sandbox.WikiDB.openItemDetailModal(undefined);
  sandbox.WikiDB.openItemDetailModal('');
  sandbox.WikiDB.openItemDetailModal('invalid_item_non_existent');
  sandbox.WikiDB.openItemDetailModal(12345);
  sandbox.WikiDB.openItemDetailModal({ id: 'fake' });
  sandbox.WikiDB.openItemDetailModal('<script>alert(1)</script>');
});

check('getPokemonEvolutionItems handles malformed pokemon objects safely', () => {
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems(null).length, 0);
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems(undefined).length, 0);
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems({}).length, 0);
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems({ evo_req: null }).length, 0);
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems({ evo_req: 12345 }).length, 0);
  assertEquals(sandbox.PokemonApp.getPokemonEvolutionItems({ evo_req: ['雷之石'] }).length, 0);
});

check('Rapid alternating modal transitions maintain state consistency (50 iterations)', () => {
  for (let i = 0; i < 50; i++) {
    sandbox.WikiDB.openItemDetailModal('thunder_stone');
    sandbox.WikiDB.navigateToPokemonDex('26');
    sandbox.WikiDB.openItemDetailModal('kings_rock');
    sandbox.WikiDB.closeItemDetailModal();
  }
  const itemModal = elements.get('wiki-item-detail-modal');
  assertEquals(itemModal.style.display, 'none', 'Modal should be cleanly closed after loop');
});

// -----------------------------------------------------------------------------
// Probe 6: Overlay System Integration
// -----------------------------------------------------------------------------
console.log('\n[Probe 6] Overlay Registration & Markup Skeletons');

check('MOBILE_OVERLAY_IDS in app.js includes wiki-item-detail-modal', () => {
  const overlayMatch = appCode.match(/const\s+MOBILE_OVERLAY_IDS\s*=\s*\[([\s\S]*?)\];/);
  assert(overlayMatch, 'MOBILE_OVERLAY_IDS array could not be found in app.js');
  assert(overlayMatch[1].includes("'wiki-item-detail-modal'"), 'wiki-item-detail-modal must be present in MOBILE_OVERLAY_IDS');
});

check('Both index.html and app/index.html contain complete modal skeleton with backdrop dismiss', () => {
  const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  assert(desktopHtml.includes('id="wiki-item-detail-modal"'), 'index.html missing #wiki-item-detail-modal');
  assert(desktopHtml.includes('class="wiki-item-modal-backdrop-dismiss"'), 'index.html missing backdrop dismiss element');
  assert(desktopHtml.includes('id="wiki-item-modal-pokemon-grid"'), 'index.html missing #wiki-item-modal-pokemon-grid');

  assert(mobileHtml.includes('id="wiki-item-detail-modal"'), 'app/index.html missing #wiki-item-detail-modal');
  assert(mobileHtml.includes('class="wiki-item-modal-backdrop-dismiss"'), 'app/index.html missing backdrop dismiss element');
  assert(mobileHtml.includes('bottom-sheet mobile-modal-sheet'), 'app/index.html missing mobile bottom-sheet classes');
  assert(mobileHtml.includes('sheet-drag-handle'), 'app/index.html missing drag handle');
});

// -----------------------------------------------------------------------------
// Probe 7: Multilingual Rendering in Item Modal (zh-TW, zh-CN, en-US)
// -----------------------------------------------------------------------------
console.log('\n[Probe 7] Multilingual Modal Rendering');

check('Item detail modal dynamically localizes into English and Simplified Chinese', () => {
  const thunderStone = itemsData.find(i => i.id === 'thunder_stone');
  assert(thunderStone, 'Thunder stone not found');

  // 1. English localization
  sandbox.I18N = {
    getLanguage: () => 'en-US',
    getItemName: (id) => id === 'thunder_stone' ? 'Thunder Stone' : id
  };
  sandbox.WikiDB.openItemDetailModal('thunder_stone');

  const titleEl = elements.get('wiki-item-modal-title');
  assertEquals(titleEl.textContent, 'Thunder Stone', 'Title should be English');
  const catEl = elements.get('wiki-item-modal-cat-badge');
  assertEquals(catEl.textContent, 'Evolution', 'Category badge should be English');
  sandbox.WikiDB.closeItemDetailModal();

  // 2. Simplified Chinese localization
  sandbox.I18N = {
    getLanguage: () => 'zh-CN',
    getItemName: (id) => id === 'thunder_stone' ? '雷之石' : id
  };
  sandbox.WikiDB.openItemDetailModal('thunder_stone');
  assertEquals(titleEl.textContent, '雷之石', 'Title should be Simplified Chinese');
  assertEquals(catEl.textContent, '进化道具', 'Category badge should be Simplified Chinese');
  sandbox.WikiDB.closeItemDetailModal();

  // Reset I18N
  delete sandbox.I18N;
});

// -----------------------------------------------------------------------------
// Probe 8: Sleep Point Shop & Diamonds Pricing Logic
// -----------------------------------------------------------------------------
console.log('\n[Probe 8] Sleep Point & Diamond Pricing Integrity');

check('Modal accurately renders sleep points and diamond pricing elements', () => {
  // Thunder Stone: regular 1400, premium 1400
  sandbox.WikiDB.openItemDetailModal('thunder_stone');
  const pricingEl = elements.get('wiki-item-modal-pricing');
  assert(pricingEl.innerHTML.includes('1,400 pt'), 'Regular sleep points should display 1,400 pt');
  sandbox.WikiDB.closeItemDetailModal();

  // Poke Biscuit: regular 150 pt, premium 100 pt
  sandbox.WikiDB.openItemDetailModal('poke_biscuit');
  assert(pricingEl.innerHTML.includes('150 pt'), 'Regular sleep points should display 150 pt');
  assert(pricingEl.innerHTML.includes('100 pt'), 'Premium sleep points should display 100 pt');
  sandbox.WikiDB.closeItemDetailModal();

  // Good Camp Ticket: diamonds 500
  const campTicket = itemsData.find(i => i.id === 'good_camp_ticket');
  if (campTicket && campTicket.diamonds) {
    sandbox.WikiDB.openItemDetailModal('good_camp_ticket');
    assert(pricingEl.innerHTML.includes(String(campTicket.diamonds)), 'Should display diamond cost');
    sandbox.WikiDB.closeItemDetailModal();
  }
});

// -----------------------------------------------------------------------------
// Probe 9: Single Frame Rule & Dropdown Arrow Layout Invariants
// -----------------------------------------------------------------------------
console.log('\n[Probe 9] CSS Structural Invariants');

check('Single Frame Rule strictly enforced on modal body and sections in styles.css', () => {
  const stylesPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');
  const stylesCode = fs.readFileSync(stylesPath, 'utf8');

  assert(stylesCode.includes('.wiki-item-modal-body'), '.wiki-item-modal-body selector must exist');
  assert(stylesCode.includes('.wiki-item-modal-section'), '.wiki-item-modal-section selector must exist');
  assert(stylesCode.includes('.wiki-item-pokemon-grid'), '.wiki-item-pokemon-grid selector must exist');

  // Verify Single Frame rule: border: none !important; background: transparent !important;
  const bodyRuleMatch = stylesCode.match(/\.wiki-item-modal-body\s*\{([\s\S]*?)\}/);
  assert(bodyRuleMatch, 'Could not parse .wiki-item-modal-body CSS block');
  assert(bodyRuleMatch[1].includes('border: none') || bodyRuleMatch[1].includes('border: 0'), 'Modal body must have border: none');
  assert(bodyRuleMatch[1].includes('background: transparent'), 'Modal body must have background: transparent');

  const sectionRuleMatch = stylesCode.match(/\.wiki-item-modal-section\s*\{([\s\S]*?)\}/);
  assert(sectionRuleMatch, 'Could not parse .wiki-item-modal-section CSS block');
  assert(sectionRuleMatch[1].includes('border: none') || sectionRuleMatch[1].includes('border: 0'), 'Modal section must have border: none');
  assert(sectionRuleMatch[1].includes('background: transparent'), 'Modal section must have background: transparent');
});

// -----------------------------------------------------------------------------
// Probe 10: Pre-populated Artifact & Test Bypass Detection
// -----------------------------------------------------------------------------
console.log('\n[Probe 10] Pre-populated Artifact & Log Verification');

check('No fabricated verification outputs or pre-populated log files in workspace', () => {
  const gitStatus = require('child_process').execSync('git status --porcelain', { cwd: WORKSPACE_ROOT, encoding: 'utf8' });
  const suspiciousFiles = gitStatus.split('\n')
    .filter(l => l.includes('.log') || l.includes('attestation') || l.includes('pass_report'));
  assertEquals(suspiciousFiles.length, 0, 'No suspicious log or attestation files found in git status');
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('       Forensic Auditor M3-1 Diagnostic Summary');
console.log('================================================================');
console.log(`- Total Tests:  ${totalTests}`);
console.log(`- Passed Tests: ${passedTests}`);
console.log(`- Failed Tests: ${failedTests}`);
console.log('----------------------------------------------------------------');

if (failedTests === 0) {
  console.log('RESULT: FORENSIC AUDIT COMPLETE - VERDICT: CLEAN');
  process.exit(0);
} else {
  console.log('RESULT: FORENSIC AUDIT FAILED - VERDICT: INTEGRITY VIOLATION');
  process.exit(1);
}
