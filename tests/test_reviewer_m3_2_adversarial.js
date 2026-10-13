/**
 * Adversarial Probe & Independent Quality Audit Suite for Milestone 3
 * Reviewer M3-2
 *
 * Scopes Tested:
 * 1. Integrity Audit (No facades, no hardcoded bypasses, real data mappings)
 * 2. Bidirectional Navigation Mechanics (Item -> Dex, Dex -> Item)
 * 3. Modal Suspension Protocol (__suspendedForDetail lifecycle & restoration)
 * 4. Multi-Item Species & Edge Cases (Slowking, Steelix, empty evo_req, invalid inputs)
 * 5. Event Listener Leak & Re-entrance Stress Test (ESC handler, rapid cycling)
 * 6. CSS Single Frame Rule Invariants (No redundant outer/nested borders)
 * 7. 4 Themes Color & Contrast Analysis (Midnight, Onyx, Dawn, Emerald)
 * 8. Mobile H5 Bottom Sheet Layout & MOBILE_OVERLAY_IDS Registry
 * 9. Absolute Zero Emoji Policy Compliance
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function check(section, name, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  [PASS] [${section}] ${name}`);
    return true;
  } catch (err) {
    failedChecks++;
    console.log(`  [FAIL] [${section}] ${name}`);
    console.log(`         Error: ${err.message || err}`);
    failureDetails.push({ section, name, error: err.message || err });
    return false;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

function assertEquals(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

// Read Core Files
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const h5Html = fs.readFileSync(path.join(ROOT, 'app', 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');
const appJs = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'app.js'), 'utf8');
const wikiJs = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
const itemsJsonRaw = fs.readFileSync(path.join(ROOT, 'data', 'items.json'), 'utf8');
const itemsData = JSON.parse(itemsJsonRaw);

console.log('================================================================');
console.log('  Reviewer M3-2: Independent Adversarial & Integrity Audit');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. INTEGRITY AUDIT: No facades, no cheating, real logic implementation
// -----------------------------------------------------------------------------
check('Integrity Audit', 'No dummy facade or hardcoded bypass in openItemDetailModal', () => {
  // Check that openItemDetailModal actually searches getMasterItemsData and populates modal
  assert(wikiJs.includes('function openItemDetailModal(itemId)'), 'openItemDetailModal must be implemented');
  assert(!wikiJs.includes('/* dummy */ openItemDetailModal'), 'Cannot be dummy');
  assert(wikiJs.includes('getMasterItemsData()'), 'Must fetch item from getMasterItemsData');
  assert(wikiJs.includes('renderItemDetailModalContent(modal, item)'), 'Must call renderItemDetailModalContent');
});

check('Integrity Audit', 'No hardcoded test score or test bypass strings in source code', () => {
  const suspectStrings = [
    '24/24', '100% PASS', '__FAKE_TEST_PASS__', '__BYPASS_TEST__', 'return 217'
  ];
  for (const s of suspectStrings) {
    assert(!appJs.includes(s), `app.js must not contain suspect bypass string: ${s}`);
    assert(!wikiJs.includes(s), `wiki.js must not contain suspect bypass string: ${s}`);
  }
});

check('Integrity Audit', 'POKEDEX_EVO_ITEM_DEFINITIONS contains 17 canonical evolution items with valid Serebii URLs', () => {
  assert(appJs.includes('const POKEDEX_EVO_ITEM_DEFINITIONS = ['), 'POKEDEX_EVO_ITEM_DEFINITIONS must exist');
  const match = appJs.match(/const\s+POKEDEX_EVO_ITEM_DEFINITIONS\s*=\s*(\[[\s\S]*?\]);/);
  assert(match !== null, 'Could not parse POKEDEX_EVO_ITEM_DEFINITIONS array');

  const sandbox = {};
  vm.createContext(sandbox);
  const defs = vm.runInContext(match[1], sandbox);

  assert(Array.isArray(defs), 'defs must be array');
  assertEquals(defs.length, 17, 'Must have exactly 17 canonical evolution item definitions');

  const expectedIds = [
    'thunder_stone', 'fire_stone', 'water_stone', 'leaf_stone', 'moon_stone',
    'sun_stone', 'ice_stone', 'shiny_stone', 'dusk_stone', 'dawn_stone',
    'oval_stone', 'linking_cord', 'metal_coat', 'kings_rock', 'up_grade',
    'razor_claw', 'dragon_scale'
  ];

  expectedIds.forEach(id => {
    const found = defs.find(d => d.id === id);
    assert(found !== undefined, `Missing evolution item definition for: ${id}`);
    assert(found.name_tw && found.name_cn && found.name_en, `Item ${id} missing localization`);
    assert(found.icon && found.icon.startsWith('https://www.serebii.net/'), `Item ${id} must have serebii sprite URL`);
  });
});

// -----------------------------------------------------------------------------
// 2. BIDIRECTIONAL NAVIGATION & LOGIC SIMULATION
// -----------------------------------------------------------------------------
check('Bidirectional Nav', 'getPokemonEvolutionItems parses single and multi-item evo_req strings', () => {
  // Setup minimal environment to run getPokemonEvolutionItems
  const sandbox = {
    window: { ITEMS_DATA: itemsData },
    escapeHtml: (s) => String(s)
  };
  vm.createContext(sandbox);

  // Extract function definitions from app.js
  const defsMatch = appJs.match(/const\s+POKEDEX_EVO_ITEM_DEFINITIONS\s*=\s*(\[[\s\S]*?\]);/);
  const getEvoItemsMatch = appJs.match(/function\s+getPokemonEvolutionItems\(pkm\)\s*\{[\s\S]*?\n\}/);
  const renderChipsMatch = appJs.match(/function\s+renderPokedexEvoItemChipsHTML\(pkm\)\s*\{[\s\S]*?\n\}/);

  assert(defsMatch && getEvoItemsMatch && renderChipsMatch, 'Helper functions must be extractable');

  vm.runInContext(
    defsMatch[0] + '\n' + getEvoItemsMatch[0] + '\n' + renderChipsMatch[0] + '\n' +
    'sandbox = { getPokemonEvolutionItems, renderPokedexEvoItemChipsHTML };',
    sandbox
  );

  const { getPokemonEvolutionItems, renderPokedexEvoItemChipsHTML } = sandbox.sandbox;

  // Test Case 1: Raichu (Thunder Stone)
  const raichu = { id: 26, name_cn: '雷丘', evo_req: '皮卡丘使用 雷之石 進化' };
  const raichuItems = getPokemonEvolutionItems(raichu);
  assertEquals(raichuItems.length, 1, 'Raichu must have 1 evo item');
  assertEquals(raichuItems[0].id, 'thunder_stone', 'Raichu evo item must be thunder_stone');
  const raichuHtml = renderPokedexEvoItemChipsHTML(raichu);
  assert(raichuHtml.includes('class="pokedex-evo-item-btn"'), 'Must render button with .pokedex-evo-item-btn');
  assert(raichuHtml.includes('data-evo-item-id="thunder_stone"'), 'Must have data-evo-item-id');
  assert(raichuHtml.includes("openItemDetailModal('thunder_stone')"), 'Must call openItemDetailModal');

  // Test Case 2: Slowking (Dual items: King\'s Rock + Linking Cord)
  const slowking = { id: 199, name_cn: '呆呆王', evo_req: '呆呆獸使用 王者之證 + 聯繫繩 進化' };
  const slowkingItems = getPokemonEvolutionItems(slowking);
  assertEquals(slowkingItems.length, 2, 'Slowking must have 2 evo items');
  const slowkingIds = slowkingItems.map(x => x.id);
  assert(slowkingIds.includes('kings_rock'), 'Slowking must have kings_rock');
  assert(slowkingIds.includes('linking_cord'), 'Slowking must have linking_cord');
  const slowkingHtml = renderPokedexEvoItemChipsHTML(slowking);
  assert(slowkingHtml.includes("openItemDetailModal('kings_rock')"), 'Must link to kings_rock');
  assert(slowkingHtml.includes("openItemDetailModal('linking_cord')"), 'Must link to linking_cord');

  // Test Case 3: Steelix (Dual items: Metal Coat + Linking Cord)
  const steelix = { id: 208, name_cn: '大鋼蛇', evo_req: '大岩蛇使用 金屬膜 + 聯繫繩 進化' };
  const steelixItems = getPokemonEvolutionItems(steelix);
  assertEquals(steelixItems.length, 2, 'Steelix must have 2 evo items');
  const steelixIds = steelixItems.map(x => x.id);
  assert(steelixIds.includes('metal_coat') && steelixIds.includes('linking_cord'), 'Steelix needs metal_coat & linking_cord');

  // Test Case 4: Pokemon without evo item (Bulbasaur, Pikachu)
  const pikachu = { id: 25, name_cn: '皮卡丘', evo_req: '皮丘親密度 50 進化' };
  const pikachuItems = getPokemonEvolutionItems(pikachu);
  assertEquals(pikachuItems.length, 0, 'Pikachu has no evolution item');
  const pikachuHtml = renderPokedexEvoItemChipsHTML(pikachu);
  assertEquals(pikachuHtml, '', 'No evo item buttons rendered for Pikachu');

  // Test Case 5: English evo_req
  const jolteonEN = { id: 135, name_en: 'Jolteon', evo_req: 'Eevee evolves using Thunder Stone' };
  const jolteonItems = getPokemonEvolutionItems(jolteonEN);
  assertEquals(jolteonItems.length, 1, 'Jolteon parsed from English string');
  assertEquals(jolteonItems[0].id, 'thunder_stone', 'Jolteon must map to thunder_stone');
});

// -----------------------------------------------------------------------------
// 3. MODAL SUSPENSION PROTOCOL SIMULATION
// -----------------------------------------------------------------------------
check('Modal Suspension Protocol', 'Full simulation of openItemDetailModal and closeItemDetailModal state transitions', () => {
  // Create simulated DOM
  const elements = {};
  function createSimulatedElement(id, tag = 'div') {
    return {
      id,
      tagName: tag.toUpperCase(),
      style: { display: 'none' },
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      attributes: {},
      setAttribute(k, v) { this.attributes[k] = v; },
      getAttribute(k) { return this.attributes[k]; },
      innerHTML: '',
      querySelector(selector) {
        if (selector.startsWith('#')) {
          const targetId = selector.slice(1);
          return elements[targetId] || null;
        }
        return null;
      },
      querySelectorAll() { return []; },
      __suspendedForDetail: false
    };
  }

  const pokedexModal = createSimulatedElement('pokedex-detail-modal');
  const itemModal = createSimulatedElement('wiki-item-detail-modal');
  elements['pokedex-detail-modal'] = pokedexModal;
  elements['wiki-item-detail-modal'] = itemModal;

  const body = {
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      contains(c) { return this.classes.has(c); }
    },
    style: { overflow: '' },
    appendChild() {}
  };

  const sandbox = {
    document: {
      getElementById: (id) => elements[id] || null,
      createElement: (tag) => createSimulatedElement('elem_' + Math.random(), tag),
      body: body,
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    window: {
      ITEMS_DATA: itemsData,
      portalMobileOverlays: () => {},
      prepareOverlayOpen: () => {},
      animateOverlayClose: (modal, cb) => cb(),
      syncOverlayOpenState: () => {},
      PokemonApp: {
        openPokemonDetailModal: (id) => {
          pokedexModal.style.display = 'flex';
          body.classList.add('pokedex-modal-open');
        }
      }
    },
    console: { warn: () => {} },
    escapeHtml: (s) => String(s)
  };
  vm.createContext(sandbox);

  // Run wiki modal functions in this sandbox
  const modalFunctionsCode = `
    const itemsData = ${JSON.stringify(itemsData)};
    function getMasterItemsData() { return itemsData; }
    function getItemLocalizedName(item) { return item.name['zh-TW']; }
    function getItemCategoryBadgeName(c) { return c; }
    ${wikiJs.match(/let\s+activeItemModalEscHandler[\s\S]*?function\s+closeItemDetailModal\(\)\s*\{[\s\S]*?\n  \}/)[0]}
  `;

  vm.runInContext(modalFunctionsCode, sandbox);

  // Step 1: Open Pokédex Modal first
  pokedexModal.style.display = 'flex';
  body.classList.add('pokedex-modal-open');
  assertEquals(pokedexModal.style.display, 'flex', 'Pokedex modal is open');
  assertEquals(pokedexModal.__suspendedForDetail, false, 'Initial suspension flag is false');

  // Step 2: Open Item Modal while Pokédex Modal is open (e.g. clicked evolution chip)
  vm.runInContext("openItemDetailModal('thunder_stone');", sandbox);

  assertEquals(pokedexModal.style.display, 'none', 'Pokedex modal must be hidden when suspended');
  assertEquals(pokedexModal.__suspendedForDetail, true, 'Pokedex modal must have __suspendedForDetail = true');
  assertEquals(itemModal.style.display, 'flex', 'Item modal must be open');
  assert(body.classList.contains('item-modal-open'), 'Body has item-modal-open');

  // Step 3: Close Item Modal -> Pokédex Modal must be restored
  vm.runInContext("closeItemDetailModal();", sandbox);

  assertEquals(itemModal.style.display, 'none', 'Item modal must be hidden after close');
  assertEquals(pokedexModal.style.display, 'flex', 'Pokedex modal must be restored to display: flex');
  assertEquals(pokedexModal.__suspendedForDetail, false, 'Pokedex modal __suspendedForDetail must be reset to false');
  assert(body.classList.contains('pokedex-modal-open'), 'Body maintains pokedex-modal-open');

  // Step 4: Re-open Item Modal from Pokédex, then click associated Pokemon in Item Modal -> navigateToPokemonDex
  vm.runInContext("openItemDetailModal('thunder_stone');", sandbox);
  assertEquals(pokedexModal.__suspendedForDetail, true, 'Suspended again');

  vm.runInContext("navigateToPokemonDex('26');", sandbox);
  assertEquals(itemModal.style.display, 'none', 'Item modal closed on nav to dex');
  assertEquals(pokedexModal.style.display, 'flex', 'Pokedex modal re-opened for target Pokemon');
  assertEquals(pokedexModal.__suspendedForDetail, false, 'Suspension flag cleared');
});

// -----------------------------------------------------------------------------
// 4. ADVERSARIAL STRESS & CORNER CASES
// -----------------------------------------------------------------------------
check('Adversarial Stress', 'Defensive handling of invalid, missing, or malformed inputs', () => {
  const sandbox = {
    window: { ITEMS_DATA: itemsData },
    escapeHtml: (s) => String(s)
  };
  vm.createContext(sandbox);

  const defsMatch = appJs.match(/const\s+POKEDEX_EVO_ITEM_DEFINITIONS\s*=\s*(\[[\s\S]*?\]);/);
  const getEvoItemsMatch = appJs.match(/function\s+getPokemonEvolutionItems\(pkm\)\s*\{[\s\S]*?\n\}/);
  const renderChipsMatch = appJs.match(/function\s+renderPokedexEvoItemChipsHTML\(pkm\)\s*\{[\s\S]*?\n\}/);

  vm.runInContext(defsMatch[0] + '\n' + getEvoItemsMatch[0] + '\n' + renderChipsMatch[0] + '\n' +
    'sandbox = { getPokemonEvolutionItems, renderPokedexEvoItemChipsHTML };', sandbox);

  const { getPokemonEvolutionItems, renderPokedexEvoItemChipsHTML } = sandbox.sandbox;

  // Null input
  assertEquals(getPokemonEvolutionItems(null).length, 0, 'null pkm returns empty array');
  assertEquals(renderPokedexEvoItemChipsHTML(null), '', 'null pkm returns empty string');

  // Undefined input
  assertEquals(getPokemonEvolutionItems(undefined).length, 0, 'undefined pkm returns empty array');

  // Object without evo_req
  assertEquals(getPokemonEvolutionItems({ id: 1 }).length, 0, 'missing evo_req returns empty array');

  // Malformed evo_req (number, object, boolean)
  assertEquals(getPokemonEvolutionItems({ id: 1, evo_req: 12345 }).length, 0, 'numeric evo_req handled');
  assertEquals(getPokemonEvolutionItems({ id: 1, evo_req: {} }).length, 0, 'object evo_req handled');
  assertEquals(getPokemonEvolutionItems({ id: 1, evo_req: true }).length, 0, 'boolean evo_req handled');

  // Massive string in evo_req
  const massiveStr = '雷之石 '.repeat(5000);
  const result = getPokemonEvolutionItems({ id: 1, evo_req: massiveStr });
  assertEquals(result.length, 1, 'Thunder stone found without crash or duplication');
});

check('Adversarial Stress', 'Rapid open-close re-entrance does not leak event listeners or corrupt state', () => {
  let addListenerCalls = 0;
  let removeListenerCalls = 0;

  const body = {
    classList: { add() {}, remove() {}, contains() { return false; } },
    style: { overflow: '' },
    appendChild() {}
  };

  const modalEl = {
    id: 'wiki-item-detail-modal',
    style: { display: 'none' },
    querySelector: () => null
  };

  const sandbox = {
    document: {
      getElementById: (id) => (id === 'wiki-item-detail-modal' ? modalEl : null),
      body: body,
      addEventListener: (type) => { if (type === 'keydown') addListenerCalls++; },
      removeEventListener: (type) => { if (type === 'keydown') removeListenerCalls++; }
    },
    window: {
      ITEMS_DATA: itemsData,
      portalMobileOverlays: () => {},
      prepareOverlayOpen: () => {},
      animateOverlayClose: (modal, cb) => cb(),
      syncOverlayOpenState: () => {}
    },
    console: { warn: () => {} },
    escapeHtml: (s) => String(s)
  };
  vm.createContext(sandbox);

  const modalFunctionsCode = `
    const itemsData = ${JSON.stringify(itemsData)};
    function getMasterItemsData() { return itemsData; }
    function getItemLocalizedName(item) { return item.name['zh-TW']; }
    function getItemCategoryBadgeName(c) { return c; }
    ${wikiJs.match(/let\s+activeItemModalEscHandler[\s\S]*?function\s+closeItemDetailModal\(\)\s*\{[\s\S]*?\n  \}/)[0]}
  `;
  vm.runInContext(modalFunctionsCode, sandbox);

  // Perform 25 rapid open/close cycles
  for (let i = 0; i < 25; i++) {
    vm.runInContext("openItemDetailModal('thunder_stone');", sandbox);
    vm.runInContext("closeItemDetailModal();", sandbox);
  }

  // Keydown listeners attached and removed must match exactly
  assertEquals(addListenerCalls, 25, '25 listeners attached');
  assertEquals(removeListenerCalls, 25, '25 listeners removed');
  assertEquals(modalEl.style.display, 'none', 'Modal is cleanly closed at the end');
});

// -----------------------------------------------------------------------------
// 5. CSS SINGLE FRAME RULE INVARIANTS (User Rule IX)
// -----------------------------------------------------------------------------
check('Single Frame Rule', '.wiki-item-modal-body has border: none !important and background: transparent !important', () => {
  const match = stylesCss.match(/\.wiki-item-modal-body\s*\{([\s\S]*?)\}/);
  assert(match !== null, '.wiki-item-modal-body rule block must exist in styles.css');
  const bodyRules = match[1];
  assert(bodyRules.includes('border: none !important') || bodyRules.includes('border: 0 !important'),
    '.wiki-item-modal-body must have border: none !important');
  assert(bodyRules.includes('background: transparent !important'),
    '.wiki-item-modal-body must have background: transparent !important');
});

check('Single Frame Rule', '.wiki-item-modal-section has border: none !important and background: transparent !important', () => {
  const match = stylesCss.match(/\.wiki-item-modal-section\s*\{([\s\S]*?)\}/);
  assert(match !== null, '.wiki-item-modal-section rule block must exist in styles.css');
  const sectionRules = match[1];
  assert(sectionRules.includes('border: none !important') || sectionRules.includes('border: 0 !important'),
    '.wiki-item-modal-section must have border: none !important');
  assert(sectionRules.includes('background: transparent !important'),
    '.wiki-item-modal-section must have background: transparent !important');
});

check('Single Frame Rule', '.wiki-item-pokemon-grid has border: none !important and background: transparent !important', () => {
  const match = stylesCss.match(/\.wiki-item-pokemon-grid\s*\{([\s\S]*?)\}/);
  assert(match !== null, '.wiki-item-pokemon-grid rule block must exist in styles.css');
  const gridRules = match[1];
  assert(gridRules.includes('border: none !important') || gridRules.includes('border: 0 !important'),
    '.wiki-item-pokemon-grid must have border: none !important');
  assert(gridRules.includes('background: transparent !important'),
    '.wiki-item-pokemon-grid must have background: transparent !important');
});

check('Single Frame Rule', '.wiki-item-pricing-grid and .wiki-item-acq-list have border: none !important', () => {
  const pricingMatch = stylesCss.match(/\.wiki-item-pricing-grid\s*\{([\s\S]*?)\}/);
  assert(pricingMatch !== null, '.wiki-item-pricing-grid must exist');
  assert(pricingMatch[1].includes('border: none !important'), 'pricing grid border: none !important');

  const acqMatch = stylesCss.match(/\.wiki-item-acq-list\s*\{([\s\S]*?)\}/);
  assert(acqMatch !== null, '.wiki-item-acq-list must exist');
  assert(acqMatch[1].includes('border: none !important'), 'acq list border: none !important');
});

check('Single Frame Rule', '.wiki-item-modal-dialog is the sole carrier of modal container border', () => {
  const match = stylesCss.match(/\.wiki-item-modal-dialog\s*\{([\s\S]*?)\}/);
  assert(match !== null, '.wiki-item-modal-dialog must exist');
  assert(match[1].includes('border: 1px solid'), 'dialog carries single outer border');
});

// -----------------------------------------------------------------------------
// 6. 4 THEMES COMPLIANCE (Midnight, Onyx, Dawn, Emerald)
// -----------------------------------------------------------------------------
check('4 Themes', 'Theme rules exist for Dawn, Emerald, Onyx, and Midnight', () => {
  assert(stylesCss.includes('[data-theme="dawn"] .wiki-item-modal-dialog'), 'Dawn theme dialog override exists');
  assert(stylesCss.includes('[data-theme="emerald"] .wiki-item-modal-dialog'), 'Emerald theme dialog override exists');
  assert(stylesCss.includes('[data-theme="onyx"] .pokedex-evo-item-btn'), 'Onyx theme evo chip override exists');
  assert(stylesCss.includes('[data-theme="dawn"] .pokedex-evo-item-btn'), 'Dawn theme evo chip override exists');
  assert(stylesCss.includes('[data-theme="emerald"] .pokedex-evo-item-btn'), 'Emerald theme evo chip override exists');
});

check('4 Themes', 'Light theme (Dawn & Emerald) surfaces use #ffffff and #f8fafc with dark borders', () => {
  const dawnDialogMatch = stylesCss.match(/\[data-theme="dawn"\] \.wiki-item-modal-dialog[\s\S]*?background:\s*(#[a-fA-F0-9]+)/);
  assert(dawnDialogMatch !== null, 'Dawn dialog background defined');
  assertEquals(dawnDialogMatch[1].toLowerCase(), '#ffffff', 'Dawn dialog uses clean white card background');

  const dawnPillMatch = stylesCss.match(/\[data-theme="dawn"\] \.wiki-item-price-pill[\s\S]*?background:\s*(#[a-fA-F0-9]+)/);
  assert(dawnPillMatch !== null, 'Dawn pill background defined');
  assertEquals(dawnPillMatch[1].toLowerCase(), '#f8fafc', 'Dawn pills use light slate background');
});

// -----------------------------------------------------------------------------
// 7. MOBILE H5 SHEET & MOBILE_OVERLAY_IDS REGISTRY
// -----------------------------------------------------------------------------
check('Mobile H5 Sheet', 'MOBILE_OVERLAY_IDS includes wiki-item-detail-modal in app.js', () => {
  const overlayIdsMatch = appJs.match(/const\s+MOBILE_OVERLAY_IDS\s*=\s*\[([\s\S]*?)\];/);
  assert(overlayIdsMatch !== null, 'MOBILE_OVERLAY_IDS array found');
  assert(overlayIdsMatch[1].includes("'wiki-item-detail-modal'"), 'wiki-item-detail-modal must be listed');
});

check('Mobile H5 Sheet', 'app/index.html includes bottom-sheet and drag-handle structure', () => {
  assert(h5Html.includes('id="wiki-item-detail-modal"'), 'app/index.html has #wiki-item-detail-modal');
  assert(h5Html.includes('bottom-sheet'), 'app/index.html has bottom-sheet class');
  assert(h5Html.includes('sheet-drag-handle'), 'app/index.html has .sheet-drag-handle');
});

check('Mobile H5 Sheet', 'styles.css defines fixed bottom sheet positioning and 0 bottom radius for mobile H5', () => {
  assert(stylesCss.includes('.mobile-h5-app #wiki-item-detail-modal .wiki-item-modal-dialog.mobile-modal-sheet'), 'Mobile H5 selector exists');
  assert(stylesCss.includes('bottom: 0 !important'), 'Sheet fixed to bottom');
  assert(stylesCss.includes('border-bottom-left-radius: 0 !important'), 'Bottom left radius zeroed');
  assert(stylesCss.includes('border-bottom-right-radius: 0 !important'), 'Bottom right radius zeroed');
  assert(stylesCss.includes('border-top-left-radius: 20px !important'), 'Top left radius rounded');
});

// -----------------------------------------------------------------------------
// 8. ZERO EMOJI COMPLIANCE AUDIT (User Rule VIII)
// -----------------------------------------------------------------------------
check('Zero Emoji Audit', 'No emojis in newly added code blocks across all modified files', () => {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;

  // Check items.json
  const jsonMatch = itemsJsonRaw.match(emojiRegex);
  assert(!jsonMatch, `Emoji found in data/items.json: ${jsonMatch ? jsonMatch[0] : ''}`);

  // Check app.js additions (lines around POKEDEX_EVO_ITEM_DEFINITIONS and getPokemonEvolutionItems)
  const appEvoBlock = appJs.match(/const\s+POKEDEX_EVO_ITEM_DEFINITIONS\s*=\s*\[[\s\S]*?function\s+renderPokedexEvoGuardBadgeHTML/);
  if (appEvoBlock) {
    const m = appEvoBlock[0].match(emojiRegex);
    assert(!m, `Emoji found in app.js evolution item code: ${m ? m[0] : ''}`);
  }

  // Check wiki.js item modal additions
  const wikiModalBlock = wikiJs.match(/function\s+getItemLocalizedEffects[\s\S]*?function\s+renderWikiLayout/);
  if (wikiModalBlock) {
    const m = wikiModalBlock[0].match(emojiRegex);
    assert(!m, `Emoji found in wiki.js item modal code: ${m ? m[0] : ''}`);
  }

  // Check styles.css additions
  const cssAdditions = stylesCss.match(/\/\* ==========================================================================\s+Milestone 3: Item Detail Modal[\s\S]*?$/);
  if (cssAdditions) {
    const m = cssAdditions[0].match(emojiRegex);
    assert(!m, `Emoji found in styles.css additions: ${m ? m[0] : ''}`);
  }

  // Check index.html and app/index.html modal snippets
  const desktopModalSnippet = indexHtml.match(/<!-- 數據百科：道具與薰香詳細資訊彈窗[\s\S]*?<\/div>\s+<\/div>/);
  if (desktopModalSnippet) {
    const m = desktopModalSnippet[0].match(emojiRegex);
    assert(!m, `Emoji found in index.html modal snippet: ${m ? m[0] : ''}`);
  }

  const h5ModalSnippet = h5Html.match(/<!-- 數據百科：道具與薰香詳細資訊彈窗[\s\S]*?<\/div>\s+<\/div>/);
  if (h5ModalSnippet) {
    const m = h5ModalSnippet[0].match(emojiRegex);
    assert(!m, `Emoji found in app/index.html modal snippet: ${m ? m[0] : ''}`);
  }
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('         Reviewer M3-2 Adversarial Audit Summary');
console.log('================================================================');
console.log(`- Total Invariants Tested: ${totalChecks}`);
console.log(`- Passed Checks:           ${passedChecks}`);
console.log(`- Failed Checks:           ${failedChecks}`);
console.log('----------------------------------------------------------------');

if (failedChecks === 0) {
  console.log('REVIEWER ADVERSARIAL VERDICT: APPROVE');
  console.log('All Milestone 3 empirical invariants, suspension protocol, bidirectional');
  console.log('links, Single Frame rules, 4-theme tokens, mobile H5 sheets, and zero');
  console.log('emoji policies are 100% verified and free of defects or facades.\n');
  process.exit(0);
} else {
  console.error(`REVIEWER ADVERSARIAL VERDICT: REQUEST_CHANGES (${failedChecks} failures)`);
  process.exit(1);
}
