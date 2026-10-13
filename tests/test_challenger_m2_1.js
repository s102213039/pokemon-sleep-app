/**
 * tests/test_challenger_m2_1.js
 * Empirical Stress Harness and Adversarial Challenge Suite for Milestone 2:
 * Wiki Subpanel UI, Category Filter Pills, Multilingual Search, and Pokemon Family Linkage.
 *
 * Checks:
 * 1. Category Filter Cardinality & Invariants across all 7 pills
 * 2. Search Robustness & Edge Cases (Regex characters, empty/whitespace, multi-token)
 * 3. Case Insensitivity & Multilingual Resilience (zh-TW, zh-CN, en-US, ja-JP)
 * 4. Associated Pokemon Resolution & Family Linkage (e.g. Pikachu -> Thunder Stone & Pichu Incense)
 * 5. Concurrent Category Gating & Search Filter Interaction
 * 6. UI Lifecycle Handlers (filterItemsByCategory, handleItemsSearch, clearItemsSearch, resetItemsFilters)
 * 7. Single Frame Rule, Dropdown Arrow Layout, and Zero Emoji Policy Audit
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
  assert(actual === expected, `${message} (Expected: ${expected}, Actual: ${actual})`);
}

console.log('================================================================');
console.log('  Challenger M2-1: Empirical Stress Harness & Adversarial Probes');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Setup: Load Data and Build Realistic Browser VM Context
// -----------------------------------------------------------------------------
const itemsJsonPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
const pokemonDataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
const itemsJsPath = path.join(WORKSPACE_ROOT, 'js', 'data', 'items.js');
const i18nJsPath = path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js');
const wikiJsPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
const stylesCssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');

assert(fs.existsSync(itemsJsonPath), 'data/items.json exists');
assert(fs.existsSync(pokemonDataPath), 'data/data.json exists');
assert(fs.existsSync(itemsJsPath), 'js/data/items.js exists');
assert(fs.existsSync(i18nJsPath), 'js/core/i18n.js exists');
assert(fs.existsSync(wikiJsPath), 'js/modules/wiki.js exists');

const rawItemsData = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const rawPokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));
const itemsJsCode = fs.readFileSync(itemsJsPath, 'utf8');
const i18nJsCode = fs.readFileSync(i18nJsPath, 'utf8');
const wikiJsCode = fs.readFileSync(wikiJsPath, 'utf8');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

// Build Mock DOM and Context
function buildTestEnvironment(initialCategory = 'all', initialQuery = '') {
  const domElements = new Map();

  function createMockElement(id, tagName = 'div', className = '') {
    const el = {
      id: id,
      tagName: tagName.toUpperCase(),
      className: className,
      classList: {
        _classes: new Set(className ? className.split(' ') : []),
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
      innerHTML: '',
      value: '',
      focus() {}
    };
    if (id) domElements.set(id, el);
    return el;
  }

  // Pre-seed known elements
  const gridEl = createMockElement('wiki-items-card-grid', 'div', 'wiki-item-card-grid');
  const emptyEl = createMockElement('wiki-items-empty-state', 'div', 'wiki-items-empty-state');
  const badgeEl = createMockElement('wiki-items-count-badge', 'span', 'wiki-items-count-badge');
  const inputEl = createMockElement('wiki-items-search-input', 'input', 'wiki-items-search-input');
  const clearEl = createMockElement('wiki-items-search-clear', 'button', 'wiki-items-search-clear');
  const searchBoxEl = createMockElement(null, 'div', 'wiki-items-search-box');

  const pillButtons = [
    'all', 'evolution', 'pokemon_incense', 'functional_incense', 'training', 'biscuit', 'supply'
  ].map(cat => {
    const btn = createMockElement(null, 'button', `wiki-pill-btn ${cat === initialCategory ? 'active' : ''}`);
    btn.setAttribute('data-category', cat);
    return btn;
  });

  const mockStorage = {
    _data: { pksleep_wiki_items_category: initialCategory },
    getItem(k) { return this._data[k] !== undefined ? this._data[k] : null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  };

  const sandbox = {
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    localStorage: mockStorage,
    window: {
      localStorage: mockStorage,
      ITEMS_DATA: rawItemsData,
      allPokemons: rawPokemonData,
      I18N: {
        getLanguage: () => 'zh-TW',
        t: (k, fb) => fb || k
      },
      updateSearchInputHighlight: () => {},
      __DATA_BASE_PATH__: ''
    },
    document: {
      readyState: 'complete',
      body: {
        classList: {
          contains: () => false
        }
      },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => domElements.get(id) || null,
      querySelector: (selector) => {
        if (selector === '.wiki-items-search-box') return searchBoxEl;
        return null;
      },
      querySelectorAll: (selector) => {
        if (selector.includes('.wiki-pill-btn') || selector.includes('.wiki-items-category-pills')) {
          return pillButtons;
        }
        return [];
      },
      addEventListener: () => {}
    }
  };

  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;

  vm.createContext(sandbox);
  vm.runInContext(itemsJsCode, sandbox);
  vm.runInContext(i18nJsCode, sandbox);
  vm.runInContext(wikiJsCode, sandbox);

  return {
    sandbox,
    WikiDB: sandbox.window.WikiDB,
    elements: { gridEl, emptyEl, badgeEl, inputEl, clearEl, searchBoxEl, pillButtons },
    storage: mockStorage
  };
}

const { WikiDB, elements, storage, sandbox } = buildTestEnvironment();

// =============================================================================
// TEST SUITE 1: Category Filter Cardinality & Exact Breakdown Across 7 Pills
// =============================================================================
console.log('\n[Suite 1] Category Filter Cardinality & Exact Breakdown Across 7 Pills');

const EXPECTED_CATEGORY_COUNTS = {
  all: 118,
  evolution: 17,
  pokemon_incense: 76,
  functional_incense: 6,
  training: 9,
  biscuit: 4,
  supply: 6
};

// 1.1 Invariant: Total items in 'all'
const allItems = WikiDB.filterItems('all', '');
assertEquals(allItems.length, EXPECTED_CATEGORY_COUNTS.all, 'Category [all] returns exactly 118 items');

// 1.2 Each individual category count
Object.entries(EXPECTED_CATEGORY_COUNTS).forEach(([cat, expectedCount]) => {
  if (cat === 'all') return;
  const filtered = WikiDB.filterItems(cat, '');
  assertEquals(filtered.length, expectedCount, `Category [${cat}] returns exactly ${expectedCount} items`);
  // Verify all returned items actually belong to this category
  const mismatch = filtered.filter(i => i.category !== cat);
  assertEquals(mismatch.length, 0, `All items returned in [${cat}] strictly have category="${cat}"`);
});

// 1.3 Exact Partition Check: Sum of all 6 individual categories equals 118 with 0 duplicates
const individualCategories = ['evolution', 'pokemon_incense', 'functional_incense', 'training', 'biscuit', 'supply'];
const seenIds = new Set();
let totalPartitionCount = 0;

individualCategories.forEach(cat => {
  const itemsInCat = WikiDB.filterItems(cat, '');
  totalPartitionCount += itemsInCat.length;
  itemsInCat.forEach(item => {
    assert(!seenIds.has(item.id), `Item id="${item.id}" appears in only one category`);
    seenIds.add(item.id);
  });
});

assertEquals(totalPartitionCount, 118, 'Sum of all 6 distinct categories equals 118');
assertEquals(seenIds.size, 118, 'Union of all categories covers all 118 unique items');

// 1.4 Rendered Subpanel Pill Buttons & Badges Markup Verification
const subpanelHtml = WikiDB.renderItemsSubpanel();
assert(typeof subpanelHtml === 'string' && subpanelHtml.length > 500, 'renderItemsSubpanel returns valid HTML');

individualCategories.concat(['all']).forEach(cat => {
  const count = EXPECTED_CATEGORY_COUNTS[cat];
  const expectedPillSnippet = `data-category="${cat}"`;
  const expectedCountSnippet = `(${count})</span>`;
  assert(subpanelHtml.includes(expectedPillSnippet), `Subpanel contains pill button with data-category="${cat}"`);
  assert(subpanelHtml.includes(expectedCountSnippet), `Subpanel pill displays correct count badge (${count})`);
});

// 1.5 Category Switching & Storage Persistence
individualCategories.forEach(cat => {
  WikiDB.filterItemsByCategory(cat);
  assertEquals(WikiDB.getItemsCategory(), cat, `filterItemsByCategory('${cat}') updates currentItemsCategory`);
  assertEquals(storage.getItem('pksleep_wiki_items_category'), cat, `Selected category '${cat}' persists to localStorage`);
});

// 1.6 Invalid Category Resilience
WikiDB.filterItemsByCategory('non_existent_category_xyz');
assertEquals(WikiDB.getItemsCategory(), 'all', 'Invalid category string safely falls back to "all"');
WikiDB.filterItemsByCategory(null);
assertEquals(WikiDB.getItemsCategory(), 'all', 'null category safely falls back to "all"');
WikiDB.filterItemsByCategory(undefined);
assertEquals(WikiDB.getItemsCategory(), 'all', 'undefined category safely falls back to "all"');

// Reset to 'all'
WikiDB.filterItemsByCategory('all');

// =============================================================================
// TEST SUITE 2: Adversarial Search Edge Cases & Special Characters
// =============================================================================
console.log('\n[Suite 2] Adversarial Search Edge Cases & Special Characters');

// 2.1 Empty & Whitespace Queries
const emptyQueries = ['', '   ', '\t', '\n', '  \t  \n  ', null, undefined];
emptyQueries.forEach((q, idx) => {
  let res;
  try {
    res = WikiDB.filterItems('all', q);
  } catch (e) {
    res = null;
  }
  assert(Array.isArray(res), `Empty query variant #${idx} (${JSON.stringify(q)}) executes without error`);
  assertEquals(res ? res.length : -1, 118, `Empty query variant #${idx} returns all 118 items`);
});

// 2.2 Regex Metacharacters and Dangerous Patterns
const adversarialRegexInputs = [
  '[', ']', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '\\', '.',
  '.*', '.+', '.*+?^${}()|[]\\',
  '(?=.*)', '(\\d+)', '[a-z]+', '(?<=a)',
  '(((', ')))', '[[[', ']]]', '***', '+++', '???',
  '\\c', '\\x00', '\\uFFFF',
  'a{1000}', 'a*b*c*d*',
  '^.*$'
];

adversarialRegexInputs.forEach(regexInput => {
  let res;
  let threw = false;
  try {
    res = WikiDB.filterItems('all', regexInput);
  } catch (e) {
    threw = true;
    console.error('Error on regex query:', regexInput, e);
  }
  assert(!threw && Array.isArray(res), `Adversarial regex query "${regexInput}" handled safely without exception`);
});

// 2.3 Substring Match against Literal Characters in Data
// "(" exists in acquisition strings: e.g. "一般睡眠點數交換所 (1,400pt)"
const parenRes = WikiDB.filterItems('all', '(');
assert(parenRes.length > 0, `Query "(" safely matches items containing literal "(" in acquisition or description`);
const commaRes = WikiDB.filterItems('all', ',');
assert(commaRes.length > 0, `Query "," safely matches items containing numbers like "1,400pt"`);
const bracketRes = WikiDB.filterItems('all', ']');
assert(Array.isArray(bracketRes), `Query "]" executes safely`);

// 2.4 Multi-token Queries with Varied Whitespace
const multiToken1 = WikiDB.filterItems('all', '雷之石 進化');
assert(multiToken1.length >= 1, 'Multi-token query "雷之石 進化" returns Thunder Stone');
assert(multiToken1.some(i => i.id === 'thunder_stone'), 'Thunder Stone is matched');

const multiTokenWhitespace = WikiDB.filterItems('all', '   雷之石     進化   \t');
assertEquals(multiTokenWhitespace.length, multiToken1.length, 'Excessive leading/trailing/inner whitespace matches identical set');

// 2.5 Multi-token Non-Intersecting Query (Negative Test)
const impossibleMultiToken = WikiDB.filterItems('all', '雷之石 寶可沙布蕾');
assertEquals(impossibleMultiToken.length, 0, 'Mutually exclusive tokens "雷之石 寶可沙布蕾" returns 0 items');

// 2.6 Non-matching Query
const bogusRes = WikiDB.filterItems('all', 'xyz999_non_existent_token_123');
assertEquals(bogusRes.length, 0, 'Non-existent token returns 0 items');

// =============================================================================
// TEST SUITE 3: Case Insensitivity & Multilingual Resolution
// =============================================================================
console.log('\n[Suite 3] Case Insensitivity & Multilingual Resolution');

// 3.1 English Case Insensitivity
const queryThunderLower = WikiDB.filterItems('all', 'thunder stone');
const queryThunderUpper = WikiDB.filterItems('all', 'THUNDER STONE');
const queryThunderMixed = WikiDB.filterItems('all', 'ThUnDeR StOnE');

assertEquals(queryThunderLower.length, 1, 'Search "thunder stone" returns 1 item');
assertEquals(queryThunderUpper.length, 1, 'Search "THUNDER STONE" returns 1 item');
assertEquals(queryThunderMixed.length, 1, 'Search "ThUnDeR StOnE" returns 1 item');
assertEquals(queryThunderLower[0].id, 'thunder_stone', 'Resolved item is thunder_stone');
assertEquals(queryThunderUpper[0].id, 'thunder_stone', 'Resolved item is thunder_stone');
assertEquals(queryThunderMixed[0].id, 'thunder_stone', 'Resolved item is thunder_stone');

// 3.2 Biscuit Search across cases
const queryBiscuitLower = WikiDB.filterItems('all', 'biscuit');
const queryBiscuitUpper = WikiDB.filterItems('all', 'BISCUIT');
assertEquals(queryBiscuitLower.length, 4, 'Search "biscuit" matches all 4 biscuit items');
assertEquals(queryBiscuitUpper.length, 4, 'Search "BISCUIT" matches all 4 biscuit items');

// 3.3 Traditional Chinese vs. Simplified Chinese Item Name Search
const queryTwStone = WikiDB.filterItems('all', '雷之石');
const queryCnStone = WikiDB.filterItems('all', '雷之石');
assertEquals(queryTwStone.length, 1, 'Traditional Chinese "雷之石" matches Thunder Stone');
assertEquals(queryCnStone.length, 1, 'Simplified Chinese "雷之石" matches Thunder Stone');

const queryTwCord = WikiDB.filterItems('all', '聯繫繩');
const queryCnCord = WikiDB.filterItems('all', '联系绳');
assertEquals(queryTwCord.length, 1, 'Traditional Chinese "聯繫繩" matches Linking Cord');
assertEquals(queryCnCord.length, 1, 'Simplified Chinese "联系绳" matches Linking Cord');
assertEquals(queryTwCord[0].id, 'linking_cord', 'Item ID is linking_cord');
assertEquals(queryCnCord[0].id, 'linking_cord', 'Item ID is linking_cord');

// 3.4 Chinese Effect & Description Keyword Search
const queryTwEvoEffect = WikiDB.filterItems('evolution', '進化的道具');
const queryCnEvoEffect = WikiDB.filterItems('evolution', '进化的道具');
assert(queryTwEvoEffect.length >= 10, 'Traditional Chinese effect "進化的道具" matches evolution stones');
assert(queryCnEvoEffect.length >= 10, 'Simplified Chinese effect "进化的道具" matches evolution stones');

// =============================================================================
// TEST SUITE 4: Associated Pokemon Resolution & Family Linkage
// =============================================================================
console.log('\n[Suite 4] Associated Pokemon Resolution & Family Linkage');

// 4.1 Search "皮卡丘" (Pikachu - Traditional Chinese)
const pkmPikachuTw = WikiDB.filterItems('all', '皮卡丘');
assert(pkmPikachuTw.length >= 2, `Search "皮卡丘" returns at least 2 items (actual: ${pkmPikachuTw.length})`);
const pikachuIds = pkmPikachuTw.map(i => i.id);
assert(pikachuIds.includes('thunder_stone'), 'Search "皮卡丘" returns Thunder Stone (thunder_stone)');
assert(pikachuIds.includes('incense_pichu'), 'Search "皮卡丘" returns Pichu Incense (incense_pichu)');

// 4.2 Search "Pikachu" (English)
const pkmPikachuEn = WikiDB.filterItems('all', 'Pikachu');
assert(pkmPikachuEn.length >= 2, `Search "Pikachu" returns at least 2 items (actual: ${pkmPikachuEn.length})`);
assert(pkmPikachuEn.some(i => i.id === 'thunder_stone'), 'Search "Pikachu" returns Thunder Stone');
assert(pkmPikachuEn.some(i => i.id === 'incense_pichu'), 'Search "Pikachu" returns Pichu Incense');

// 4.3 Search "ピカチュウ" (Japanese)
const pkmPikachuJp = WikiDB.filterItems('all', 'ピカチュウ');
assert(pkmPikachuJp.length >= 2, `Search "ピカチュウ" returns at least 2 items (actual: ${pkmPikachuJp.length})`);
assert(pkmPikachuJp.some(i => i.id === 'thunder_stone'), 'Search "ピカチュウ" returns Thunder Stone');
assert(pkmPikachuJp.some(i => i.id === 'incense_pichu'), 'Search "ピカチュウ" returns Pichu Incense');

// 4.4 Search "伊布" (Eevee #133)
const pkmEeveeTw = WikiDB.filterItems('all', '伊布');
const eeveeIds = pkmEeveeTw.map(i => i.id);
assert(eeveeIds.includes('thunder_stone'), 'Eevee search matches Thunder Stone');
assert(eeveeIds.includes('fire_stone'), 'Eevee search matches Fire Stone');
assert(eeveeIds.includes('water_stone'), 'Eevee search matches Water Stone');
assert(eeveeIds.includes('leaf_stone'), 'Eevee search matches Leaf Stone');
assert(eeveeIds.includes('ice_stone'), 'Eevee search matches Ice Stone');
assert(eeveeIds.includes('incense_eevee'), 'Eevee search matches Eevee Incense');

// 4.5 Search "耿鬼" (Gengar #94) & "鬼斯" (Gastly #92)
const pkmGengar = WikiDB.filterItems('all', '耿鬼');
const gengarIds = pkmGengar.map(i => i.id);
assert(gengarIds.includes('linking_cord'), 'Gengar search matches Linking Cord (linking_cord)');

const pkmGastly = WikiDB.filterItems('all', '鬼斯');
const gastlyIds = pkmGastly.map(i => i.id);
assert(gastlyIds.includes('incense_gastly'), 'Gastly search matches Gastly Incense (incense_gastly)');

// 4.6 Search "大岩蛇" (Onix #95)
const pkmOnix = WikiDB.filterItems('all', '大岩蛇');
const onixIds = pkmOnix.map(i => i.id);
assert(onixIds.includes('metal_coat'), 'Onix search matches Metal Coat (metal_coat)');
assert(onixIds.includes('linking_cord'), 'Onix search matches Linking Cord (linking_cord)');

// 4.7 Standalone Species Incenses (Direct species name lookup)
const bulbaRes = WikiDB.filterItems('all', '妙蛙種子');
assert(bulbaRes.some(i => i.id === 'incense_bulbasaur'), 'Search "妙蛙種子" returns Bulbasaur Incense');

const charmanderRes = WikiDB.filterItems('all', '小火龍');
assert(charmanderRes.some(i => i.id === 'incense_charmander'), 'Search "小火龍" returns Charmander Incense');

const squirtleRes = WikiDB.filterItems('all', '傑尼龜');
assert(squirtleRes.some(i => i.id === 'incense_squirtle'), 'Search "傑尼龜" returns Squirtle Incense');

// =============================================================================
// TEST SUITE 5: Concurrent Category Gating & Keyword Search Interaction
// =============================================================================
console.log('\n[Suite 5] Concurrent Category Gating & Keyword Search Interaction');

// 5.1 Category 'evolution' AND Query '皮卡丘'
const evoPikachu = WikiDB.filterItems('evolution', '皮卡丘');
assertEquals(evoPikachu.length, 1, 'Category [evolution] + "皮卡丘" returns exactly 1 item (Thunder Stone)');
assertEquals(evoPikachu[0].id, 'thunder_stone', 'Matched item is thunder_stone');

// 5.2 Category 'pokemon_incense' AND Query '皮卡丘'
const incensePikachu = WikiDB.filterItems('pokemon_incense', '皮卡丘');
assertEquals(incensePikachu.length, 1, 'Category [pokemon_incense] + "皮卡丘" returns exactly 1 item (Pichu Incense)');
assertEquals(incensePikachu[0].id, 'incense_pichu', 'Matched item is incense_pichu');

// 5.3 Category 'biscuit' AND Query '皮卡丘'
const biscuitPikachu = WikiDB.filterItems('biscuit', '皮卡丘');
assertEquals(biscuitPikachu.length, 0, 'Category [biscuit] + "皮卡丘" returns 0 items');

// 5.4 Category 'training' AND Query '種子'
// Matches main_skill_seed, sub_skill_seed, and cleanse_mint (via acquisition: 限定花之種子挑戰活動)
const trainingSeed = WikiDB.filterItems('training', '種子');
assertEquals(trainingSeed.length, 3, 'Category [training] + "種子" returns 3 items (Seeds & Cleanse Mint)');
const seedIds = trainingSeed.map(i => i.id);
assert(seedIds.includes('main_skill_seed'), 'Matches main_skill_seed');
assert(seedIds.includes('sub_skill_seed'), 'Matches sub_skill_seed');
assert(seedIds.includes('cleanse_mint'), 'Matches cleanse_mint via acquisition event seed mission');

// =============================================================================
// TEST SUITE 6: UI Control Handlers & State Reconciler
// =============================================================================
console.log('\n[Suite 6] UI Control Handlers & State Reconciler');

// 6.1 handleItemsSearch updates query and reconciles DOM
WikiDB.filterItemsByCategory('all');
elements.inputEl.value = '雷之石';
WikiDB.handleItemsSearch('雷之石');
assertEquals(WikiDB.getItemsSearchQuery(), '雷之石', 'handleItemsSearch updates search query state');
assertEquals(elements.badgeEl.textContent, '1 / 118', 'Badge text updated to "1 / 118"');
assert(elements.gridEl.innerHTML.includes('data-item-id="thunder_stone"'), 'Card grid contains thunder_stone');
assertEquals(elements.emptyEl.style.display, 'none', 'Empty state is hidden when items exist');
assertEquals(elements.clearEl.style.display, 'flex', 'Clear button is visible when query is present');

// 6.2 Search with 0 results displays empty state
elements.inputEl.value = 'no_such_item_exists_xyz';
WikiDB.handleItemsSearch('no_such_item_exists_xyz');
assertEquals(elements.badgeEl.textContent, '0 / 118', 'Badge text updated to "0 / 118"');
assertEquals(elements.gridEl.innerHTML, '', 'Card grid is empty');
assertEquals(elements.emptyEl.style.display, 'block', 'Empty state is displayed');

// 6.3 clearItemsSearch resets query and restores category items
WikiDB.clearItemsSearch();
assertEquals(WikiDB.getItemsSearchQuery(), '', 'clearItemsSearch resets query to empty string');
assertEquals(elements.badgeEl.textContent, '118 / 118', 'Badge text restored to "118 / 118"');
assertEquals(elements.clearEl.style.display, 'none', 'Clear button hidden after clear');
assertEquals(elements.emptyEl.style.display, 'none', 'Empty state hidden after clear');

// 6.4 resetItemsFilters resets category to 'all' and query to empty
WikiDB.filterItemsByCategory('evolution');
elements.inputEl.value = '月之石';
WikiDB.handleItemsSearch('月之石');
assertEquals(elements.badgeEl.textContent, '1 / 118', 'Filtered to 1 Moon Stone in evolution category');

WikiDB.resetItemsFilters();
assertEquals(WikiDB.getItemsCategory(), 'all', 'resetItemsFilters resets category to "all"');
assertEquals(WikiDB.getItemsSearchQuery(), '', 'resetItemsFilters resets query to ""');
assertEquals(elements.badgeEl.textContent, '118 / 118', 'Badge text restored to "118 / 118"');

// 6.5 Safe Stubs for Milestone 3 Decoupling
assert(typeof WikiDB.openItemDetailModal === 'function', 'WikiDB.openItemDetailModal is an exposed function');
assert(typeof WikiDB.closeItemDetailModal === 'function', 'WikiDB.closeItemDetailModal is an exposed function');

// Invoke stubs - must execute smoothly without error
let stubThrew = false;
try {
  WikiDB.openItemDetailModal('thunder_stone');
  WikiDB.closeItemDetailModal();
} catch (e) {
  stubThrew = true;
}
assert(!stubThrew, 'Item modal stubs execute cleanly without unhandled exceptions');

// =============================================================================
// TEST SUITE 7: Layout Rules & Zero Emoji Compliance Audit
// =============================================================================
console.log('\n[Suite 7] Layout Rules & Zero Emoji Compliance Audit');

// 7.1 Single Frame Rule (User Rule IX)
const subpanelCssMatch = stylesCss.match(/#wiki-subpanel-items\s*\{([^}]+)\}/);
assert(subpanelCssMatch !== null, '#wiki-subpanel-items rule exists in styles.css');
if (subpanelCssMatch) {
  const rules = subpanelCssMatch[1];
  assert(rules.includes('border: none') || rules.includes('border: 0'), '#wiki-subpanel-items has border: none (Single Frame Rule)');
  assert(rules.includes('background: transparent'), '#wiki-subpanel-items has background: transparent');
  assert(rules.includes('padding: 0'), '#wiki-subpanel-items has padding: 0');
}

// 7.2 Dropdown Arrow Layout Rule (User Rule VI)
const selectRulesMatch = stylesCss.match(/\.wiki-items-select[^{]*\{([^}]+)\}/);
if (selectRulesMatch) {
  const rules = selectRulesMatch[1];
  assert(rules.includes('36px') && (rules.includes('padding-right: 36px') || rules.includes('padding: 0 36px')), '.wiki-items-select has 36px right padding');
  assert(rules.includes('background-position: right 18px center'), '.wiki-items-select has background-position: right 18px center');
}

// 7.3 Multi-Theme Support (Midnight, Onyx, Dawn, Emerald)
assert(stylesCss.includes('.wiki-item-cat-badge') || stylesCss.includes('.wiki-item-cat-evolution'), 'Category badge CSS classes defined');
assert(stylesCss.includes('[data-theme="onyx"]') && stylesCss.includes('.wiki-item-cat-badge'), 'Onyx theme category badge styles defined');
assert(stylesCss.includes('[data-theme="dawn"]') && stylesCss.includes('.wiki-item-cat-badge'), 'Dawn theme category badge styles defined');
assert(stylesCss.includes('[data-theme="emerald"]') && stylesCss.includes('.wiki-item-cat-badge'), 'Emerald theme category badge styles defined');

// 7.4 Zero Emoji Policy Audit across all Milestone 2 code and data
const STRICT_EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F2FF}\u{2300}-\u{23FF}\u{2B50}]/u;

const serializedItems = JSON.stringify(rawItemsData);
assert(!STRICT_EMOJI_REGEX.test(serializedItems), 'Zero Emoji: items.json contains 0 emojis');

const wikiM2Section = wikiJsCode.slice(wikiJsCode.indexOf('// --- 道具與薰香百科模組'), wikiJsCode.indexOf('// 渲染 Wiki 主佈局與 5 大子分頁'));
assert(!STRICT_EMOJI_REGEX.test(wikiM2Section), 'Zero Emoji: wiki.js Items Encyclopedia implementation contains 0 emojis');

const m2CssSnippet = stylesCss.slice(stylesCss.indexOf('/* ==========================================================================\n   道具與薰香百科子分頁 (Wiki Items & Incense Subpanel)'));
assert(!STRICT_EMOJI_REGEX.test(m2CssSnippet), 'Zero Emoji: styles.css Items Encyclopedia rules contain 0 emojis');

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n================================================================');
console.log('         Challenger M2-1 Stress Test Diagnostic Summary');
console.log('================================================================');
console.log(`- Total Checks:   ${totalChecks}`);
console.log(`- Passed Checks:  ${passedChecks}`);
console.log(`- Failed Checks:  ${failedChecks}`);
console.log('----------------------------------------------------------------');

if (failedChecks === 0) {
  console.log('RESULT: ALL EMPIRICAL CHALLENGES PASSED (VERDICT: APPROVE)');
  process.exit(0);
} else {
  console.error(`RESULT: ${failedChecks} CHECK(S) FAILED (VERDICT: REQUEST_CHANGES)`);
  failureDetails.forEach((fail, idx) => console.error(`  ${idx + 1}. ${fail}`));
  process.exit(1);
}
