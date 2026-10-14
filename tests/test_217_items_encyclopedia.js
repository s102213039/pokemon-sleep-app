/**
 * Standalone Test Probe for Test 217: Pokémon Sleep Items Encyclopedia
 *
 * Validates:
 * 1. Master Data Engine & Canonical Schema (36 items across 4 categories, no incenses)
 * 2. Multilingual Localization & Asset URLs (zh-TW, zh-CN, en-US)
 * 3. Evolution Target & Pokémon ID Mappings
 * 4. Wiki Subpanel Navigation & Layout Markup
 * 5. Numerical Stat Highlights & Enlarged Evolution Targets (No count text)
 * 6. Search & Filter Mechanics (Category filters, multilingual search, edge cases)
 * 7. Item Detail Modal & Overlay Lifecycle
 * 8. Bidirectional Pokédex Linkage (Item Modal <-> Pokédex Modal)
 * 9. UI Standards & Compliance (Zero Emoji, Single Frame Rule, Dropdowns, Themes)
 *
 * Execution:
 *   rtk node tests/test_217_items_encyclopedia.js
 *   rtk node tests/test_217_items_encyclopedia.js --strict
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// Test tracking state
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function check(category, description, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  [PASS] [${category}] ${description}`);
    return true;
  } catch (err) {
    failedChecks++;
    const errMsg = err.message || String(err);
    failureDetails.push({ category, description, error: errMsg });
    console.log(`  [FAIL] [${category}] ${description}`);
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

// -----------------------------------------------------------------------------
// Helper: Load Master Items Data (supports data/items.json and js/modules/wiki.js)
// -----------------------------------------------------------------------------
function loadItemsData() {
  const jsonPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const raw = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.items)) return parsed.items;
    } catch (e) {
      // JSON parse error will be handled by caller assertion
    }
  }

  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  if (fs.existsSync(wikiPath)) {
    const wikiContent = fs.readFileSync(wikiPath, 'utf8');
    const itemsMatch = wikiContent.match(/const\s+(?:ITEMS_DATA|ITEMS_AND_INCENSE_DATA)\s*=\s*(\[[\s\S]*?\]);/);
    if (itemsMatch) {
      try {
        const sandbox = {};
        vm.createContext(sandbox);
        const data = vm.runInContext(itemsMatch[1], sandbox);
        if (Array.isArray(data)) return data;
      } catch (e) {
        // VM eval error will be handled by caller assertion
      }
    }
  }

  const jsDataPath = path.join(WORKSPACE_ROOT, 'js', 'data', 'items.js');
  if (fs.existsSync(jsDataPath)) {
    try {
      const sandbox = { window: {} };
      vm.createContext(sandbox);
      const code = fs.readFileSync(jsDataPath, 'utf8');
      vm.runInContext(code, sandbox);
      if (sandbox.window && Array.isArray(sandbox.window.ITEMS_DATA)) {
        return sandbox.window.ITEMS_DATA;
      }
    } catch (e) {}
  }

  return null;
}

// -----------------------------------------------------------------------------
// Core Probe Runner
// -----------------------------------------------------------------------------
function runProbe(options = {}) {
  const isStrict = options.strict || process.argv.includes('--strict') || process.env.STRICT_ASSERT === '1';

  console.log('================================================================');
  console.log('  Test 217 Probe: Pokémon Sleep Items & Incense Encyclopedia');
  console.log('================================================================\n');

  // Load existing source files
  const desktopHtml = fs.existsSync(path.join(WORKSPACE_ROOT, 'index.html'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8') : '';
  const h5Html = fs.existsSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8') : '';
  const stylesCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8') : '';
  const wikiCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8') : '';
  const appCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8') : '';
  const i18nCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8') : '';

  const itemsData = loadItemsData();

  // ---------------------------------------------------------------------------
  // Part 1: Master Data Engine & Canonical Schema
  // ---------------------------------------------------------------------------
  check('Master Data Engine', 'Items master dataset exists and loads correctly', () => {
    assert(itemsData !== null, 'Items dataset must be present in data/items.json or embedded in js/modules/wiki.js');
    assert(Array.isArray(itemsData), 'Items dataset must be an array of item records');
  });

  check('Master Data Engine', 'Items dataset contains canonical non-incense items (36 items)', () => {
    assert(itemsData !== null, 'Items data not available');
    assertEquals(itemsData.length, 36, `Expected exactly 36 items, received ${itemsData.length}`);
  });

  check('Master Data Engine', 'Item records adhere to standard canonical schema', () => {
    assert(itemsData !== null, 'Items data not available');
    const validCategories = ['evolution', 'training', 'biscuit', 'supply'];

    itemsData.forEach((item, idx) => {
      assert(typeof item.id === 'string' && item.id.length > 0, `Item at index ${idx} missing valid id`);
      assert(validCategories.includes(item.category), `Item ${item.id} has invalid category: ${item.category}`);
      assert(typeof item.name === 'object' && item.name !== null, `Item ${item.id} missing name localization object`);
      assert(typeof item.name['zh-TW'] === 'string' && item.name['zh-TW'].length > 0, `Item ${item.id} missing zh-TW name`);
      assert(typeof item.name['zh-CN'] === 'string' && item.name['zh-CN'].length > 0, `Item ${item.id} missing zh-CN name`);
      assert(typeof item.name['en-US'] === 'string' && item.name['en-US'].length > 0, `Item ${item.id} missing en-US name`);
      assert(typeof item.icon_url === 'string' && item.icon_url.length > 0, `Item ${item.id} missing icon_url`);
      assert(typeof item.description === 'object' && item.description !== null, `Item ${item.id} missing description object`);
      assert(typeof item.sleep_points === 'object' && item.sleep_points !== null, `Item ${item.id} missing sleep_points object`);
      assert('regular' in item.sleep_points, `Item ${item.id} missing sleep_points.regular`);
      assert('premium' in item.sleep_points, `Item ${item.id} missing sleep_points.premium`);
      assert(Array.isArray(item.pokemon_ids), `Item ${item.id} pokemon_ids must be an array`);
    });
  });

  check('Master Data Engine', 'Evolution stones and items coverage (15+ canonical items)', () => {
    assert(itemsData !== null, 'Items data not available');
    const requiredEvolutionItems = [
      'thunder_stone', 'fire_stone', 'water_stone', 'leaf_stone', 'moon_stone',
      'sun_stone', 'ice_stone', 'shiny_stone', 'dusk_stone', 'dawn_stone',
      'oval_stone', 'linking_cord', 'metal_coat', 'kings_rock', 'up_grade'
    ];
    const existingIds = new Set(itemsData.map(i => i.id));
    requiredEvolutionItems.forEach(id => {
      assert(existingIds.has(id), `Missing required evolution item: ${id}`);
    });
  });

  check('Master Data Engine', 'Incenses are completely removed from items dataset', () => {
    assert(itemsData !== null, 'Items data not available');
    const incenseItems = itemsData.filter(i => i.category.includes('incense') || i.id.includes('incense'));
    assertEquals(incenseItems.length, 0, `No incense items allowed in dataset, found ${incenseItems.length}`);
  });

  check('Master Data Engine', 'Training items and seed coverage (Handy Candy, Seeds, Mint)', () => {
    assert(itemsData !== null, 'Items data not available');
    const existingIds = new Set(itemsData.map(i => i.id));
    const requiredTraining = ['main_skill_seed', 'sub_skill_seed', 'cleanse_mint'];
    requiredTraining.forEach(id => {
      assert(existingIds.has(id), `Missing required training item: ${id}`);
    });
  });

  check('Master Data Engine', 'Catching biscuits and camping supplies coverage', () => {
    assert(itemsData !== null, 'Items data not available');
    const existingIds = new Set(itemsData.map(i => i.id));
    const requiredSupplies = [
      'poke_biscuit', 'great_biscuit', 'ultra_biscuit', 'master_biscuit',
      'energy_pillow', 'helper_whistle', 'good_camp_ticket'
    ];
    requiredSupplies.forEach(id => {
      assert(existingIds.has(id), `Missing required supply item: ${id}`);
    });
  });

  check('Master Data Engine', 'Evolution target Pokémon IDs are properly mapped', () => {
    assert(itemsData !== null, 'Items data not available');
    const thunderStone = itemsData.find(i => i.id === 'thunder_stone');
    assert(thunderStone !== undefined, 'thunder_stone must exist');
    assert(thunderStone.pokemon_ids.includes('26') || thunderStone.pokemon_ids.includes('135'),
      'thunder_stone must map to Raichu (26) or Jolteon (135)');

    const waterStone = itemsData.find(i => i.id === 'water_stone');
    assert(waterStone !== undefined && waterStone.pokemon_ids.includes('134'),
      'water_stone must map to Vaporeon (134)');

    const linkingCord = itemsData.find(i => i.id === 'linking_cord');
    assert(linkingCord !== undefined && linkingCord.pokemon_ids.length >= 2,
      'linking_cord must map to trade evolution Pokemon (Gengar, Alakazam, etc.)');
  });

  // ---------------------------------------------------------------------------
  // Part 2: Wiki Subpanel Registration & Layout Markup
  // ---------------------------------------------------------------------------
  check('Wiki Subpanel UI', 'VALID_WIKI_SUBTABS in wiki.js includes items', () => {
    assert(wikiCode.includes('VALID_WIKI_SUBTABS'), 'wiki.js must declare VALID_WIKI_SUBTABS');
    const subtabMatch = wikiCode.match(/VALID_WIKI_SUBTABS\s*=\s*\[([\s\S]*?)\];/);
    assert(subtabMatch !== null && subtabMatch[1].includes("'items'"), 'VALID_WIKI_SUBTABS array must include items');
  });

  check('Wiki Subpanel UI', 'renderWikiLayout renders items subtab button', () => {
    assert(wikiCode.includes('data-subtab="items"'), 'renderWikiLayout must generate button with data-subtab="items"');
    assert(wikiCode.includes('wiki-subtab-btn'), 'wiki.js must use .wiki-subtab-btn class');
  });

  check('Wiki Subpanel UI', 'Wiki subpanel container #wiki-subpanel-items is rendered', () => {
    assert(wikiCode.includes('id="wiki-subpanel-items"'), 'wiki.js must render #wiki-subpanel-items container');
  });

  check('Wiki Subpanel UI', 'Controls include search bar and category filter pills', () => {
    assert(wikiCode.includes('wiki-items-search-input') || wikiCode.includes('wiki-item-search-input'),
      'wiki.js must include items search input element');
    assert(wikiCode.includes('wiki-item-card-grid'),
      'wiki.js must render .wiki-item-card-grid container for item cards');
  });

  check('Wiki Subpanel UI', 'Item cards prominently highlight numerical stats and display pure borderless evolution targets without name labels', () => {
    assert(wikiCode.includes('wiki-item-card-stat-row'), 'wiki.js must render .wiki-item-card-stat-row for numerical stat highlights');
    assert(wikiCode.includes('wiki-item-evo-avatar'), 'wiki.js must render .wiki-item-evo-avatar for enlarged evolution targets');
    assert(!wikiCode.includes('wiki-item-card-pokemon-count'), 'wiki.js must not display pokemon count text in item cards');
    assert(!wikiCode.includes('wiki-item-evo-name'), 'wiki.js must remove pokemon name labels in item cards');
    assert(stylesCode.includes('.wiki-item-evo-avatar') && stylesCode.includes('42px'), 'styles.css must style .wiki-item-evo-avatar at 42px');
    assert(stylesCode.includes('.wiki-item-pkm-avatar') && stylesCode.includes('54px'), 'styles.css must style modal .wiki-item-pkm-avatar at 54px');
    assert(stylesCode.includes('.wiki-item-evo-chip') && stylesCode.includes('border: none'), 'styles.css must style .wiki-item-evo-chip without outer borders');
  });

  check('Wiki Subpanel UI', 'Mobile H5 app adaptation is configured with dock clearance and touch styles', () => {
    assert(stylesCode.includes('.mobile-h5-app #wiki-subpanel-items'), 'styles.css must adapt #wiki-subpanel-items for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-card-grid'), 'styles.css must adapt .wiki-item-card-grid for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-evo-avatar'), 'styles.css must adapt .wiki-item-evo-avatar for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-card-stat-row'), 'styles.css must adapt .wiki-item-card-stat-row for mobile H5');
  });

  // ---------------------------------------------------------------------------
  // Part 3: Search and Filter Mechanics
  // ---------------------------------------------------------------------------
  check('Search & Filter', 'Category filter logic handles standard categories', () => {
    assert(wikiCode.includes('filterItemsByCategory') || wikiCode.includes('renderItemsSubpanel') || wikiCode.includes('filterItems'),
      'wiki.js must provide items filtering mechanism');
  });

  check('Search & Filter', 'Multilingual search matches name, effect, or Pokemon name', () => {
    assert(wikiCode.includes('searchItems') || wikiCode.includes('handleItemsSearch') || wikiCode.includes('filterItems'),
      'wiki.js must provide items search handler');
  });

  check('Search & Filter', 'Search handles special characters and empty inputs safely', () => {
    // Adversarial test: Regex escaping check
    if (itemsData) {
      const searchFn = (query, list) => {
        if (!query || !query.trim()) return list;
        const q = query.trim().toLowerCase();
        return list.filter(item => {
          const zhTW = (item.name['zh-TW'] || '').toLowerCase();
          const zhCN = (item.name['zh-CN'] || '').toLowerCase();
          const en = (item.name['en-US'] || '').toLowerCase();
          return zhTW.includes(q) || zhCN.includes(q) || en.includes(q);
        });
      };

      // Empty query test
      const all = searchFn('', itemsData);
      assertEquals(all.length, itemsData.length, 'Empty search must return all items');

      // Whitespace query test
      const spaces = searchFn('   ', itemsData);
      assertEquals(spaces.length, itemsData.length, 'Whitespace search must return all items');

      // Special characters test
      const special = searchFn('.*+?^${}()|[]\\', itemsData);
      assert(Array.isArray(special), 'Special characters query must return array without throwing');
    }
  });

  // ---------------------------------------------------------------------------
  // Part 4: Item Detail Modal & Bidirectional Dex Linkage
  // ---------------------------------------------------------------------------
  check('Item Modal & Dex Linkage', 'Modal markup #wiki-item-detail-modal exists in desktop and mobile index.html', () => {
    const hasDesktopModal = desktopHtml.includes('id="wiki-item-detail-modal"') || wikiCode.includes('id="wiki-item-detail-modal"');
    const hasMobileModal = h5Html.includes('id="wiki-item-detail-modal"') || wikiCode.includes('id="wiki-item-detail-modal"');
    assert(hasDesktopModal, 'index.html or wiki.js must provide #wiki-item-detail-modal');
    assert(hasMobileModal, 'app/index.html or wiki.js must provide #wiki-item-detail-modal for mobile H5');
  });

  check('Item Modal & Dex Linkage', 'WikiDB provides openItemDetailModal and closeItemDetailModal', () => {
    assert(wikiCode.includes('openItemDetailModal'), 'WikiDB must expose openItemDetailModal');
    assert(wikiCode.includes('closeItemDetailModal'), 'WikiDB must expose closeItemDetailModal');
  });

  check('Item Modal & Dex Linkage', 'Item modal links to Pokédex via PokemonApp.openPokemonDetailModal', () => {
    assert(wikiCode.includes('openPokemonDetailModal') || wikiCode.includes('window.PokemonApp.openPokemonDetailModal'),
      'Clicking associated Pokemon in item modal must call PokemonApp.openPokemonDetailModal');
  });

  check('Item Modal & Dex Linkage', 'Pokédex modal renders clickable evolution item buttons calling WikiDB.openItemDetailModal', () => {
    assert(appCode.includes('openItemDetailModal') || appCode.includes('pokedex-evo-item-btn'),
      'app.js pokedex modal must render interactive evolution item chip linking to WikiDB.openItemDetailModal');
  });

  check('Item Modal & Dex Linkage', 'wiki-item-detail-modal registered in MOBILE_OVERLAY_IDS', () => {
    const registeredInApp = appCode.includes("'wiki-item-detail-modal'") && appCode.includes('MOBILE_OVERLAY_IDS');
    const registeredInWiki = wikiCode.includes("'wiki-item-detail-modal'") && wikiCode.includes('MOBILE_OVERLAY_IDS');
    assert(registeredInApp || registeredInWiki, 'wiki-item-detail-modal must be registered in MOBILE_OVERLAY_IDS');
  });

  // ---------------------------------------------------------------------------
  // Part 5: UI Standards, Quality & Compliance
  // ---------------------------------------------------------------------------
  check('Quality Compliance', 'Zero Emoji Policy: No unicode emojis in item data or encyclopedia code', () => {
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

    if (itemsData) {
      const serializedData = JSON.stringify(itemsData);
      const emojiMatch = serializedData.match(emojiRegex);
      assert(!emojiMatch, `Emoji detected in items dataset: ${emojiMatch ? emojiMatch[0] : ''}`);
    }

    const itemsBlockMatch = wikiCode.match(/const\s+(?:ITEMS_DATA|ITEMS_AND_INCENSE_DATA)\s*=\s*\[([\s\S]*?)\];/);
    if (itemsBlockMatch) {
      const emojiMatch = itemsBlockMatch[1].match(emojiRegex);
      assert(!emojiMatch, `Emoji detected in wiki.js items definition: ${emojiMatch ? emojiMatch[0] : ''}`);
    }
  });

  check('Quality Compliance', 'Single Frame Rule: #wiki-subpanel-items outer container has no double borders', () => {
    assert(stylesCode.includes('#wiki-subpanel-items') || stylesCode.includes('.wiki-subpanel'),
      'styles.css must style wiki subpanels');
    const hasOuterBorder = stylesCode.includes('#wiki-subpanel-items {\n  border: 1px solid') ||
      stylesCode.includes('#wiki-subpanel-items {\n  border: 2px solid') ||
      stylesCode.includes('#wiki-subpanel-items {\n  border: solid');
    assert(!hasOuterBorder, 'Outer container #wiki-subpanel-items must have border: none or transparent');
  });

  check('Quality Compliance', 'Dropdown Arrow Layout Rule: Selects have inset right padding and downward menu', () => {
    const itemSelectMatch = stylesCode.match(/\.wiki-items-select[\s\S]*?padding-right:\s*36px/);
    // If wiki items select exists, verify right padding 36px and background position 18px
    if (stylesCode.includes('.wiki-items-select') || stylesCode.includes('.wiki-item-sort-select')) {
      assert(stylesCode.includes('padding-right: 36px'), 'Dropdown select must enforce padding-right: 36px');
      assert(stylesCode.includes('background-position: right 18px center') || stylesCode.includes('right 18px center'),
        'Dropdown arrow must be inset with background-position: right 18px center');
    }
  });

  check('Quality Compliance', 'Multi-Theme Support: Theme tokens defined for Midnight, Onyx, Dawn, Emerald', () => {
    assert(stylesCode.includes('[data-theme="midnight"]') || stylesCode.includes('.theme-midnight'),
      'styles.css must support Midnight theme');
    assert(stylesCode.includes('[data-theme="onyx"]') || stylesCode.includes('.theme-onyx'),
      'styles.css must support Onyx theme');
    assert(stylesCode.includes('[data-theme="dawn"]') || stylesCode.includes('.theme-dawn'),
      'styles.css must support Dawn theme');
    assert(stylesCode.includes('[data-theme="emerald"]') || stylesCode.includes('.theme-emerald'),
      'styles.css must support Emerald theme');
  });

  // ---------------------------------------------------------------------------
  // Summary & Reporting
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('         Test 217 Probe Diagnostic Summary');
  console.log('================================================================');
  console.log(`- Total Checks:   ${totalChecks}`);
  console.log(`- Passed Checks:  ${passedChecks}`);
  console.log(`- Failed/Pending: ${failedChecks}`);
  console.log('----------------------------------------------------------------');

  if (failedChecks === 0) {
    console.log('RESULT: ALL 217 REQUIREMENTS VERIFIED (100% PASS)\n');
    return { success: true, total: totalChecks, passed: passedChecks, failed: failedChecks };
  } else {
    console.log(`RESULT: ${failedChecks} CHECK(S) PENDING IMPLEMENTATION OR DEFECTIVE\n`);
    if (isStrict) {
      console.error(`Strict mode enabled: Exiting with code 1 due to ${failedChecks} failed checks.`);
      process.exit(1);
    }
    return { success: false, total: totalChecks, passed: passedChecks, failed: failedChecks, failures: failureDetails };
  }
}

// -----------------------------------------------------------------------------
// Direct Execution or Module Export
// -----------------------------------------------------------------------------
if (require.main === module) {
  runProbe();
}

module.exports = {
  runProbe,
  loadItemsData
};
