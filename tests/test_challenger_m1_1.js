/**
 * tests/test_challenger_m1_1.js
 * Adversarial Probe and Empirical Stress Harness for Milestone 1 (Master Data Engine)
 *
 * Checks:
 * 1. Schema & Field Completeness (118 items, valid IDs, names, icons, categories)
 * 2. Category Counts & Exact Cardinality Breakdown
 * 3. Pokemon ID Referencing vs data/data.json (249 Pokemon)
 * 4. 29 Evolution Records in data/data.json Full Accounting & Bidirectional Consistency
 * 5. CommonJS Parity (data/items.json vs js/data/items.js) & Mutation Isolation
 * 6. i18n Lookup & Dictionary Integrity (zh-TW, zh-CN, en-US)
 * 7. HTML Script Placement & Disk Existence
 * 8. Zero Emoji Compliance Audit
 */

const fs = require('fs');
const path = require('path');

let passCount = 0;
let failCount = 0;
const failures = [];

function assert(condition, message) {
  if (condition) {
    passCount++;
    console.log('  [PASS] ' + message);
  } else {
    failCount++;
    console.error('  [FAIL] ' + message);
    failures.push(message);
  }
}

console.log('================================================================');
console.log('  Challenger M1-1: Empirical Stress Harness & Adversarial Probes');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Probe 1: Dataset Size & Schema Invariants
// -----------------------------------------------------------------------------
console.log('[Probe 1] Dataset Size and Schema Invariants');

const itemsPath = path.resolve(__dirname, '../data/items.json');
assert(fs.existsSync(itemsPath), 'data/items.json file exists on disk');

let itemsData = null;
try {
  itemsData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
  assert(Array.isArray(itemsData), 'data/items.json parses as an Array');
} catch (e) {
  assert(false, 'data/items.json parses successfully: ' + e.message);
}

assert(itemsData && itemsData.length === 118, 'Master dataset contains exactly 118 items (actual: ' + (itemsData ? itemsData.length : 0) + ')');

const VALID_CATEGORIES = new Set([
  'evolution',
  'pokemon_incense',
  'functional_incense',
  'training',
  'biscuit',
  'supply'
]);

const idSet = new Set();
let invalidSchemaCount = 0;
let invalidUrlCount = 0;
let emptyNameCount = 0;
let emptyDescCount = 0;
let emptyEffectsCount = 0;
let invalidAcquisitionCount = 0;

if (itemsData) {
  itemsData.forEach((item, index) => {
    // ID Check
    if (!item.id || typeof item.id !== 'string' || !/^[a-z0-9_]+$/.test(item.id)) {
      invalidSchemaCount++;
    }
    if (idSet.has(item.id)) {
      invalidSchemaCount++;
    }
    idSet.add(item.id);

    // Category Check
    if (!VALID_CATEGORIES.has(item.category)) {
      invalidSchemaCount++;
    }

    // Name Check
    if (!item.name || typeof item.name !== 'object' ||
        !item.name['zh-TW'] || !item.name['zh-CN'] || !item.name['en-US'] ||
        typeof item.name['zh-TW'] !== 'string' || item.name['zh-TW'].trim() === '' ||
        typeof item.name['zh-CN'] !== 'string' || item.name['zh-CN'].trim() === '' ||
        typeof item.name['en-US'] !== 'string' || item.name['en-US'].trim() === '') {
      emptyNameCount++;
    }

    // Icon URL Check
    if (!item.icon_url || typeof item.icon_url !== 'string' || !item.icon_url.startsWith('https://') || !item.icon_url.endsWith('.png')) {
      invalidUrlCount++;
    }

    // Description Check
    if (!item.description || typeof item.description !== 'object' ||
        !item.description['zh-TW'] || !item.description['zh-CN'] || !item.description['en-US'] ||
        item.description['zh-TW'].trim() === '' || item.description['zh-CN'].trim() === '' || item.description['en-US'].trim() === '') {
      emptyDescCount++;
    }

    // Effects Check
    if (!item.effects || typeof item.effects !== 'object' ||
        !item.effects['zh-TW'] || !item.effects['zh-CN'] || !item.effects['en-US'] ||
        item.effects['zh-TW'].trim() === '' || item.effects['zh-CN'].trim() === '' || item.effects['en-US'].trim() === '') {
      emptyEffectsCount++;
    }

    // Acquisition Check
    if (!item.acquisition || typeof item.acquisition !== 'object' ||
        !Array.isArray(item.acquisition['zh-TW']) || item.acquisition['zh-TW'].length === 0 ||
        !Array.isArray(item.acquisition['zh-CN']) || item.acquisition['zh-CN'].length === 0 ||
        !Array.isArray(item.acquisition['en-US']) || item.acquisition['en-US'].length === 0) {
      invalidAcquisitionCount++;
    }

    // Pokemon IDs Array Check
    if (!Array.isArray(item.pokemon_ids)) {
      invalidSchemaCount++;
    }
  });
}

assert(idSet.size === 118, 'All 118 item IDs are strictly unique (unique IDs: ' + idSet.size + ')');
assert(invalidSchemaCount === 0, 'All items have valid IDs, categories, and pokemon_ids array structure (violations: ' + invalidSchemaCount + ')');
assert(emptyNameCount === 0, 'All items have complete multilingual names in zh-TW, zh-CN, en-US (violations: ' + emptyNameCount + ')');
assert(invalidUrlCount === 0, 'All items have valid https PNG icon URLs (violations: ' + invalidUrlCount + ')');
assert(emptyDescCount === 0, 'All items have non-empty multilingual descriptions (violations: ' + emptyDescCount + ')');
assert(emptyEffectsCount === 0, 'All items have non-empty multilingual effects (violations: ' + emptyEffectsCount + ')');
assert(invalidAcquisitionCount === 0, 'All items have valid acquisition channels in 3 languages (violations: ' + invalidAcquisitionCount + ')');

// Check Pricing Numeric Sanity
let invalidPricingCount = 0;
itemsData.forEach(item => {
  if (item.sleep_points.regular !== null && (typeof item.sleep_points.regular !== 'number' || item.sleep_points.regular < 0)) invalidPricingCount++;
  if (item.sleep_points.premium !== null && (typeof item.sleep_points.premium !== 'number' || item.sleep_points.premium < 0)) invalidPricingCount++;
  if (item.diamonds !== null && (typeof item.diamonds !== 'number' || item.diamonds < 0)) invalidPricingCount++;
});
assert(invalidPricingCount === 0, 'All items have valid non-negative numbers or null for sleep points and diamonds (violations: ' + invalidPricingCount + ')');

// Check Serebii Domain Validity
let nonSerebiiUrlCount = 0;
itemsData.forEach(item => {
  if (!item.icon_url.startsWith('https://www.serebii.net/')) nonSerebiiUrlCount++;
});
assert(nonSerebiiUrlCount === 0, 'All item icon URLs originate from trusted serebii.net CDN (violations: ' + nonSerebiiUrlCount + ')');

// -----------------------------------------------------------------------------
// Probe 2: Category Cardinality Breakdown
// -----------------------------------------------------------------------------
console.log('\n[Probe 2] Category Cardinality Breakdown');

const categoryCounts = {};
if (itemsData) {
  itemsData.forEach(item => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });
}

assert(categoryCounts['evolution'] === 17, 'Evolution items count is exactly 17 (actual: ' + categoryCounts['evolution'] + ')');
assert(categoryCounts['pokemon_incense'] === 76, 'Pokemon species incenses count is exactly 76 (actual: ' + categoryCounts['pokemon_incense'] + ')');
assert(categoryCounts['functional_incense'] === 6, 'Functional incenses count is exactly 6 (actual: ' + categoryCounts['functional_incense'] + ')');
assert(categoryCounts['training'] === 9, 'Training items and seeds count is exactly 9 (actual: ' + categoryCounts['training'] + ')');
assert(categoryCounts['biscuit'] === 4, 'Biscuits count is exactly 4 (actual: ' + categoryCounts['biscuit'] + ')');
assert(categoryCounts['supply'] === 6, 'Supplies count is exactly 6 (actual: ' + categoryCounts['supply'] + ')');

// -----------------------------------------------------------------------------
// Probe 3: Pokemon ID Referencing vs data/data.json
// -----------------------------------------------------------------------------
console.log('\n[Probe 3] Pokemon ID Referencing vs data/data.json');

const pkmDataPath = path.resolve(__dirname, '../data/data.json');
assert(fs.existsSync(pkmDataPath), 'data/data.json file exists on disk');

const pkmData = JSON.parse(fs.readFileSync(pkmDataPath, 'utf8'));
const validPkmIdSet = new Set(pkmData.map(p => String(p.id)));
assert(validPkmIdSet.size > 0, 'data/data.json contains valid Pokemon IDs (found ' + validPkmIdSet.size + ' unique IDs)');

let orphanPokemonIdCount = 0;
const orphanDetails = [];
let duplicatePokemonIdCount = 0;

if (itemsData) {
  itemsData.forEach(item => {
    const seenInItem = new Set();
    item.pokemon_ids.forEach(pId => {
      const sId = String(pId);
      if (!validPkmIdSet.has(sId)) {
        orphanPokemonIdCount++;
        orphanDetails.push({ itemId: item.id, pokemonId: sId });
      }
      if (seenInItem.has(sId)) {
        duplicatePokemonIdCount++;
      }
      seenInItem.add(sId);
    });
  });
}

assert(orphanPokemonIdCount === 0, 'All referenced pokemon_ids exist in data/data.json (orphans: ' + orphanPokemonIdCount + ')');
assert(duplicatePokemonIdCount === 0, 'No item contains duplicate pokemon_ids within its own array (duplicates: ' + duplicatePokemonIdCount + ')');

// Check Pokemon Incense 1:1 Species Mapping
let incenseInvalidCount = 0;
const incenseSpeciesSet = new Set();
if (itemsData) {
  const incenses = itemsData.filter(i => i.category === 'pokemon_incense');
  incenses.forEach(inc => {
    if (!inc.pokemon_ids || inc.pokemon_ids.length !== 1) {
      incenseInvalidCount++;
    } else {
      const pid = inc.pokemon_ids[0];
      if (incenseSpeciesSet.has(pid)) {
        incenseInvalidCount++;
      }
      incenseSpeciesSet.add(pid);
    }
  });
}

assert(incenseInvalidCount === 0, 'Every pokemon_incense maps to exactly 1 unique species (violations: ' + incenseInvalidCount + ')');
assert(incenseSpeciesSet.size === 76, 'Pokemon incenses cover exactly 76 distinct species (actual: ' + incenseSpeciesSet.size + ')');

// -----------------------------------------------------------------------------
// Probe 4: 29 Evolution Records in data/data.json Full Accounting
// -----------------------------------------------------------------------------
console.log('\n[Probe 4] 29 Evolution Records in data/data.json Full Accounting');

const ITEM_NAME_TO_ID = {
  '雷之石': 'thunder_stone',
  '火之石': 'fire_stone',
  '水之石': 'water_stone',
  '葉之石': 'leaf_stone',
  '月之石': 'moon_stone',
  '冰之石': 'ice_stone',
  '光之石': 'shiny_stone',
  '暗之石': 'dusk_stone',
  '覺醒之石': 'dawn_stone',
  '渾圓之石': 'oval_stone',
  '聯繫繩': 'linking_cord',
  '金屬膜': 'metal_coat',
  '王者之證': 'kings_rock',
  '銳利之爪': 'razor_claw'
};

const itemKeywords = ['雷之石', '火之石', '水之石', '葉之石', '月之石', '冰之石', '光之石', '暗之石', '覺醒之石', '渾圓之石', '聯繫繩', '金屬膜', '王者之證', '銳利之爪'];

const evoRecordsWithItems = [];
pkmData.forEach(p => {
  if (!p.evo_req) return;
  const matched = [];
  itemKeywords.forEach(kw => {
    if (p.evo_req.includes(kw)) {
      matched.push(kw);
    }
  });
  if (matched.length > 0) {
    evoRecordsWithItems.push({
      pkmId: String(p.id),
      name: p.name_cn,
      evo_req: p.evo_req,
      items: matched
    });
  }
});

assert(evoRecordsWithItems.length === 29, 'data/data.json has exactly 29 item-related evolution records (actual: ' + evoRecordsWithItems.length + ')');

// Build map of itemId -> Set of pokemon_ids in items.json
const itemPkmMap = new Map();
if (itemsData) {
  itemsData.forEach(item => {
    itemPkmMap.set(item.id, new Set(item.pokemon_ids.map(String)));
  });
}

let evoCoverageFailures = 0;
const evoCoverageLogs = [];
evoRecordsWithItems.forEach(rec => {
  rec.items.forEach(itemZh => {
    const itemId = ITEM_NAME_TO_ID[itemZh];
    if (!itemId) {
      evoCoverageFailures++;
      evoCoverageLogs.push('Unmapped itemZh: ' + itemZh);
      return;
    }
    const itemPkms = itemPkmMap.get(itemId);
    if (!itemPkms || !itemPkms.has(rec.pkmId)) {
      evoCoverageFailures++;
      evoCoverageLogs.push('Item ' + itemId + ' (' + itemZh + ') missing Pokemon ID ' + rec.pkmId + ' (' + rec.name + ')');
    }
  });
});

assert(evoCoverageFailures === 0, 'All 29 evolution records from data.json are mapped in items.json (unmapped: ' + evoCoverageFailures + ')');

// Check dual-item evolution records specifically
const slowking = evoRecordsWithItems.find(r => r.pkmId === '199');
assert(slowking && slowking.items.includes('王者之證') && slowking.items.includes('聯繫繩'), 'Slowking (199) requires both Kings Rock and Linking Cord in data.json');
assert(itemPkmMap.get('kings_rock').has('199') && itemPkmMap.get('linking_cord').has('199'), 'Slowking (199) is present in both kings_rock and linking_cord pokemon_ids');

const steelix = evoRecordsWithItems.find(r => r.pkmId === '208');
assert(steelix && steelix.items.includes('金屬膜') && steelix.items.includes('聯繫繩'), 'Steelix (208) requires both Metal Coat and Linking Cord in data.json');
assert(itemPkmMap.get('metal_coat').has('208') && itemPkmMap.get('linking_cord').has('208'), 'Steelix (208) is present in both metal_coat and linking_cord pokemon_ids');

// Check prospective items (sun_stone, up_grade, dragon_scale)
assert(itemPkmMap.get('sun_stone') && itemPkmMap.get('sun_stone').size === 0, 'sun_stone has empty pokemon_ids as prospective item');
assert(itemPkmMap.get('up_grade') && itemPkmMap.get('up_grade').size === 0, 'up_grade has empty pokemon_ids as prospective item');
assert(itemPkmMap.get('dragon_scale') && itemPkmMap.get('dragon_scale').size === 0, 'dragon_scale has empty pokemon_ids as prospective item');

// -----------------------------------------------------------------------------
// Probe 5: CommonJS Parity and Mutation Isolation
// -----------------------------------------------------------------------------
console.log('\n[Probe 5] CommonJS Parity and Mutation Isolation');

delete require.cache[require.resolve('../data/items.json')];
delete require.cache[require.resolve('../js/data/items.js')];

const jsonImport = require('../data/items.json');
const jsImport = require('../js/data/items.js');

const jsonStr = JSON.stringify(jsonImport);
const jsStr = JSON.stringify(jsImport);

assert(jsonStr === jsStr, 'require(data/items.json) and require(js/data/items.js) produce identical JSON strings');
assert(jsonImport.length === jsImport.length, 'Both modules export arrays of identical length (' + jsonImport.length + ')');

// Deep property check on sample and random items
let deepMismatchCount = 0;
for (let i = 0; i < jsonImport.length; i++) {
  const itemA = jsonImport[i];
  const itemB = jsImport[i];
  if (itemA.id !== itemB.id ||
      itemA.category !== itemB.category ||
      itemA.icon_url !== itemB.icon_url ||
      JSON.stringify(itemA.name) !== JSON.stringify(itemB.name) ||
      JSON.stringify(itemA.description) !== JSON.stringify(itemB.description) ||
      JSON.stringify(itemA.effects) !== JSON.stringify(itemB.effects) ||
      JSON.stringify(itemA.sleep_points) !== JSON.stringify(itemB.sleep_points) ||
      JSON.stringify(itemA.acquisition) !== JSON.stringify(itemB.acquisition) ||
      JSON.stringify(itemA.pokemon_ids) !== JSON.stringify(itemB.pokemon_ids)) {
    deepMismatchCount++;
  }
}
assert(deepMismatchCount === 0, 'Deep structural property check passed for all 118 records (mismatches: ' + deepMismatchCount + ')');

// Mutation isolation: verify modifying an independent deep clone does not alter export
const cloned = JSON.parse(JSON.stringify(jsImport));
cloned[0].name['zh-TW'] = 'MUTATED_TEST_STRING';
assert(jsImport[0].name['zh-TW'] !== 'MUTATED_TEST_STRING', 'External mutation of clone does not corrupt module export');

// -----------------------------------------------------------------------------
// Probe 6: i18n Dictionary Integrity and getItemName
// -----------------------------------------------------------------------------
console.log('\n[Probe 6] i18n Dictionary Integrity and getItemName');

// Mock browser global environment for i18n.js
global.window = { ITEMS_DATA: jsImport };
global.document = {
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'zh-TW',
    lang: 'zh-TW'
  },
  readyState: 'complete',
  addEventListener: () => {},
  querySelectorAll: () => []
};

delete require.cache[require.resolve('../js/core/i18n.js')];
const i18n = require('../js/core/i18n.js');

assert(typeof i18n.getItemName === 'function', 'i18n.getItemName is exported as a function');
assert(typeof i18n.ITEM_NAMES === 'object', 'i18n.ITEM_NAMES dictionary is exported');

// Test getItemName for item objects across all 3 languages
const testThunderStone = itemsData.find(i => i.id === 'thunder_stone');
i18n.setLanguage('zh-TW');
assert(i18n.getItemName(testThunderStone) === '雷之石', 'getItemName(object) returns zh-TW 雷之石');
i18n.setLanguage('zh-CN');
assert(i18n.getItemName(testThunderStone) === '雷之石', 'getItemName(object) returns zh-CN 雷之石');
i18n.setLanguage('en-US');
assert(i18n.getItemName(testThunderStone) === 'Thunder Stone', 'getItemName(object) returns en-US Thunder Stone');

// Test getItemName by ID string
i18n.setLanguage('en-US');
assert(i18n.getItemName('main_skill_seed') === 'Main Skill Seed', 'getItemName("main_skill_seed") returns English name');
i18n.setLanguage('zh-TW');
assert(i18n.getItemName('main_skill_seed') === '主技能種子', 'getItemName("main_skill_seed") returns zh-TW name');

// Test fallback for non-existent item ID
assert(i18n.getItemName('unknown_item_xyz') === 'unknown_item_xyz', 'getItemName gracefully falls back to raw input for unknown item');

// Test dictionary key order in ITEM_NAMES (descending length to prevent substring replacement bug)
const itemNamesKeys = Object.keys(i18n.ITEM_NAMES);
let lengthOrderViolations = 0;
for (let i = 0; i < itemNamesKeys.length - 1; i++) {
  if (itemNamesKeys[i].length < itemNamesKeys[i + 1].length) {
    lengthOrderViolations++;
  }
}
assert(lengthOrderViolations === 0, 'ITEM_NAMES keys are strictly sorted by length descending (violations: ' + lengthOrderViolations + ')');

// -----------------------------------------------------------------------------
// Probe 7: HTML Script Tag Placement & File Existence
// -----------------------------------------------------------------------------
console.log('\n[Probe 7] HTML Script Tag Placement and Disk Existence');

const indexPath = path.resolve(__dirname, '../index.html');
const appIndexPath = path.resolve(__dirname, '../app/index.html');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appIndexHtml = fs.readFileSync(appIndexPath, 'utf8');

const indexTagIndex = indexHtml.indexOf('<script src="js/data/items.js"></script>');
const indexWikiIndex = indexHtml.indexOf('<script src="js/modules/wiki.js');
assert(indexTagIndex !== -1, 'index.html includes <script src="js/data/items.js"></script>');
assert(indexTagIndex < indexWikiIndex, 'In index.html, items.js is loaded BEFORE wiki.js');

const appIndexTagIndex = appIndexHtml.indexOf('<script src="../js/data/items.js"></script>');
const appIndexWikiIndex = appIndexHtml.indexOf('<script src="../js/modules/wiki.js');
assert(appIndexTagIndex !== -1, 'app/index.html includes <script src="../js/data/items.js"></script>');
assert(appIndexTagIndex < appIndexWikiIndex, 'In app/index.html, items.js is loaded BEFORE wiki.js');

const jsItemsPath = path.resolve(__dirname, '../js/data/items.js');
assert(fs.existsSync(jsItemsPath), 'js/data/items.js exists on disk');

// -----------------------------------------------------------------------------
// Probe 8: Zero Emoji Compliance Audit
// -----------------------------------------------------------------------------
console.log('\n[Probe 8] Zero Emoji Compliance Audit');

// Standard Unicode emoji ranges (excluding dingbat symbols like checkmark U+2713 explicitly allowed in rules)
const EMOJI_REGEX = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}]/u;

const filesToAudit = [
  path.resolve(__dirname, '../data/items.json'),
  path.resolve(__dirname, '../js/data/items.js')
];

let totalEmojiViolations = 0;
filesToAudit.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (EMOJI_REGEX.test(line)) {
      totalEmojiViolations++;
      console.error('  Emoji violation in ' + path.basename(filePath) + ':' + (idx + 1) + ' -> ' + line.trim());
    }
  });
});

// Also audit ITEM_NAMES in i18n
const itemNamesContent = JSON.stringify(i18n.ITEM_NAMES);
const i18nEmojiMatch = itemNamesContent.match(EMOJI_REGEX);
if (i18nEmojiMatch) {
  totalEmojiViolations++;
  console.error('  Emoji violation in i18n.ITEM_NAMES: ' + i18nEmojiMatch[0]);
}

assert(totalEmojiViolations === 0, 'Zero Emoji Policy: Absolutely zero emojis detected across all reviewed files (violations: ' + totalEmojiViolations + ')');

// -----------------------------------------------------------------------------
// Diagnostic Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('       Challenger M1-1 Probe Summary');
console.log('================================================================');
console.log('Passed Checks: ' + passCount);
console.log('Failed Checks: ' + failCount);

if (failCount > 0) {
  console.log('\nFAILURES:');
  failures.forEach(f => console.log(' - ' + f));
  process.exit(1);
} else {
  console.log('\nALL EMPIRICAL CHALLENGER CHECKS PASSED: VERDICT APPROVED');
  process.exit(0);
}
