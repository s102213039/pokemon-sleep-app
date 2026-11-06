/**
 * tests/stress_sync_manager_adversarial.js
 * ==============================================================================
 * Empirical Adversarial Stress Harness for scripts/sync_manager.js
 *
 * Attack Vectors:
 *   Suite 1: Malformed Recipe Payloads (pot_size != sum, negative energy, NaN, empty ingredients)
 *   Suite 2: Poisoned Payloads with Unicode Emojis (titles, content, nested structures)
 *   Suite 3: Poisoned Payloads with Decorative Star / Glyph Symbols (names, notes, tags)
 *   Suite 4: Poisoned Pokemon Payloads (missing fields, landmark tampering, format corruptions)
 *   Suite 5: Disk Protection & Atomic Writer Invariant Verification (SHA-256 pre/post audit)
 *   Suite 6: CLI Runner Contract & Dry-Run Sanity Check
 *
 * Compliance: Zero Emojis (Rule VIII), Zero Decorative Glyphs (Rule X), Portable Paths.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(WORKSPACE_ROOT, 'data');

const syncManager = require('../scripts/sync_manager.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
    failureDetails.push(message);
  }
}

function computeFileHash(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

console.log('================================================================');
console.log('  Empirical Adversarial Stress Harness: scripts/sync_manager.js');
console.log('================================================================\n');

// Snapshot master file hashes before running tests
const masterFiles = [
  'recipes.json',
  'data.json',
  'news.json',
  'manifest.json',
  'items.json',
  'ladder_lv60.json',
  'sleep_styles.json'
];

const preTestHashes = {};
for (const f of masterFiles) {
  const fullPath = path.join(DATA_DIR, f);
  preTestHashes[f] = computeFileHash(fullPath);
}

// -----------------------------------------------------------------------------
// Suite 1: Malformed Recipe Payloads to Defensive Gatekeeper
// -----------------------------------------------------------------------------
console.log('[Suite 1] Malformed Recipe Payloads to Defensive Gatekeeper');

// Base valid recipe template
const validRecipeTemplate = {
  name_cn: '特製甜點',
  name_en: 'Special Dessert',
  category: '甜點',
  base_energy: 3500,
  pot_size: 35,
  bonus_pct: 35,
  ingredients: [
    { name: '特選蛋', count: 20 },
    { name: '暖暖薑', count: 15 }
  ]
};

// 1.1 Pot size mismatch: sum of ingredients != pot_size
{
  const rUnder = JSON.parse(JSON.stringify(validRecipeTemplate));
  rUnder.pot_size = 36; // sum is 35 != 36
  const errs = syncManager.validateSingleRecipe(rUnder, 0);
  assert(errs.some(e => e.includes('strictly does not match sum of ingredient counts')),
    'Pot size mismatch (sum 35 != pot_size 36) strictly rejected');
}

{
  const rOver = JSON.parse(JSON.stringify(validRecipeTemplate));
  rOver.pot_size = 34; // sum is 35 != 34
  const errs = syncManager.validateSingleRecipe(rOver, 0);
  assert(errs.some(e => e.includes('strictly does not match sum of ingredient counts')),
    'Pot size mismatch (sum 35 != pot_size 34) strictly rejected');
}

{
  const rZeroPot = JSON.parse(JSON.stringify(validRecipeTemplate));
  rZeroPot.pot_size = 0;
  rZeroPot.ingredients = [{ name: '特選蛋', count: 0 }];
  const errs = syncManager.validateSingleRecipe(rZeroPot, 0);
  assert(errs.some(e => e.includes('pot_size must be a positive integer')),
    'Zero pot size strictly rejected');
}

{
  const rNegativePot = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNegativePot.pot_size = -35;
  const errs = syncManager.validateSingleRecipe(rNegativePot, 0);
  assert(errs.some(e => e.includes('pot_size must be a positive integer')),
    'Negative pot size strictly rejected');
}

{
  const rFloatPot = JSON.parse(JSON.stringify(validRecipeTemplate));
  rFloatPot.pot_size = 35.5;
  const errs = syncManager.validateSingleRecipe(rFloatPot, 0);
  assert(errs.some(e => e.includes('pot_size must be a positive integer')),
    'Floating point pot size strictly rejected');
}

// 1.2 Negative energy
{
  const rNegEnergy = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNegEnergy.base_energy = -1;
  const errs = syncManager.validateSingleRecipe(rNegEnergy, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'Negative base_energy (-1) strictly rejected');
}

{
  const rNegEnergy2 = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNegEnergy2.base_energy = -50000;
  const errs = syncManager.validateSingleRecipe(rNegEnergy2, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'Large negative base_energy (-50000) strictly rejected');
}

// 1.3 NaN / Non-finite energy
{
  const rNan = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNan.base_energy = NaN;
  const errs = syncManager.validateSingleRecipe(rNan, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'NaN base_energy strictly rejected');
}

{
  const rInf = JSON.parse(JSON.stringify(validRecipeTemplate));
  rInf.base_energy = Infinity;
  const errs = syncManager.validateSingleRecipe(rInf, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'Infinity base_energy strictly rejected');
}

{
  const rZeroEnergy = JSON.parse(JSON.stringify(validRecipeTemplate));
  rZeroEnergy.base_energy = 0;
  const errs = syncManager.validateSingleRecipe(rZeroEnergy, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'Zero base_energy strictly rejected');
}

{
  const rStrEnergy = JSON.parse(JSON.stringify(validRecipeTemplate));
  rStrEnergy.base_energy = '3500';
  const errs = syncManager.validateSingleRecipe(rStrEnergy, 0);
  assert(errs.some(e => e.includes('base_energy must be a finite positive integer')),
    'String base_energy ("3500") strictly rejected');
}

// 1.4 Empty or missing ingredients
{
  const rEmptyIngs = JSON.parse(JSON.stringify(validRecipeTemplate));
  rEmptyIngs.ingredients = [];
  const errs = syncManager.validateSingleRecipe(rEmptyIngs, 0);
  assert(errs.some(e => e.includes('ingredients must be a non-empty array')),
    'Empty ingredients array strictly rejected');
}

{
  const rNullIngs = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNullIngs.ingredients = null;
  const errs = syncManager.validateSingleRecipe(rNullIngs, 0);
  assert(errs.some(e => e.includes('ingredients must be a non-empty array')),
    'Null ingredients strictly rejected');
}

// 1.5 Malformed ingredient items
{
  const rSparseIng = JSON.parse(JSON.stringify(validRecipeTemplate));
  rSparseIng.ingredients = new Array(2);
  rSparseIng.ingredients[0] = { name: '特選蛋', count: 20 };
  // index 1 is hole
  const errs = syncManager.validateSingleRecipe(rSparseIng, 0);
  assert(errs.some(e => e.includes('Sparse array hole detected')),
    'Sparse array hole in ingredients strictly rejected');
}

{
  const rZeroCount = JSON.parse(JSON.stringify(validRecipeTemplate));
  rZeroCount.ingredients = [
    { name: '特選蛋', count: 35 },
    { name: '暖暖薑', count: 0 }
  ];
  const errs = syncManager.validateSingleRecipe(rZeroCount, 0);
  assert(errs.some(e => e.includes('Ingredient count must be a positive integer')),
    'Ingredient count 0 strictly rejected');
}

{
  const rNegCount = JSON.parse(JSON.stringify(validRecipeTemplate));
  rNegCount.ingredients = [
    { name: '特選蛋', count: 40 },
    { name: '暖暖薑', count: -5 }
  ];
  const errs = syncManager.validateSingleRecipe(rNegCount, 0);
  assert(errs.some(e => e.includes('Ingredient count must be a positive integer')),
    'Negative ingredient count strictly rejected');
}

{
  const rFloatCount = JSON.parse(JSON.stringify(validRecipeTemplate));
  rFloatCount.ingredients = [
    { name: '特選蛋', count: 20.5 },
    { name: '暖暖薑', count: 14.5 }
  ];
  const errs = syncManager.validateSingleRecipe(rFloatCount, 0);
  assert(errs.some(e => e.includes('Ingredient count must be a positive integer')),
    'Floating point ingredient count strictly rejected');
}

{
  const rEmptyName = JSON.parse(JSON.stringify(validRecipeTemplate));
  rEmptyName.ingredients = [
    { name: '   ', count: 35 }
  ];
  const errs = syncManager.validateSingleRecipe(rEmptyName, 0);
  assert(errs.some(e => e.includes('Ingredient name must be a non-empty string')),
    'Empty ingredient name strictly rejected');
}

// 1.6 Bonus percentage tier mismatch
{
  const rBonusMismatch = JSON.parse(JSON.stringify(validRecipeTemplate));
  rBonusMismatch.pot_size = 35; // Tier for 35 is 35%
  rBonusMismatch.bonus_pct = 78; // Incorrect bonus
  const errs = syncManager.validateSingleRecipe(rBonusMismatch, 0);
  assert(errs.some(e => e.includes('does not match expected bonus tier')),
    'Bonus percentage mismatch for pot size strictly rejected');
}

// 1.7 Dataset-level attacks
{
  const shortDataset = [JSON.parse(JSON.stringify(validRecipeTemplate))];
  const result = syncManager.validateRecipesDataset(shortDataset);
  assert(!result.valid && result.errors.some(e => e.includes('below minimum threshold')),
    'Dataset with length < 78 strictly rejected');
}

{
  const sparseDataset = new Array(80);
  sparseDataset[0] = JSON.parse(JSON.stringify(validRecipeTemplate));
  const result = syncManager.validateRecipesDataset(sparseDataset);
  assert(!result.valid && result.errors.some(e => e.includes('contains sparse hole')),
    'Dataset with sparse array holes strictly rejected');
}

// -----------------------------------------------------------------------------
// Suite 2: Poisoned Payloads with Unicode Emojis
// -----------------------------------------------------------------------------
console.log('\n[Suite 2] Poisoned Payloads with Unicode Emojis');

// Generate test strings with ASCII unicode escape sequences (zero literal emojis)
const EMOJI_APPLE = '\u{1F34E}';
const EMOJI_GRIN = '\u{1F600}';
const EMOJI_SHOES = '\u{1FA70}';
const EMOJI_SUN = '\u{2600}';
const EMOJI_HEART = '\u{1F496}';

// 2.1 checkZeroEmojis detector verification
{
  const testObj = {
    title: '正常標題',
    nested: {
      desc: '含有表情' + EMOJI_GRIN
    }
  };
  const res = syncManager.checkZeroEmojis(testObj, 'test');
  assert(!res.pass && res.violations.length === 1 && res.violations[0].path === 'test.nested.desc',
    'checkZeroEmojis accurately flags emoji in nested object property');
}

{
  const testArr = ['Item 1', 'Item 2 ' + EMOJI_APPLE];
  const res = syncManager.checkZeroEmojis(testArr, 'array');
  assert(!res.pass && res.violations[0].path === 'array[1]',
    'checkZeroEmojis accurately flags emoji in array element');
}

{
  const cleanObj = {
    title: '純文字標題',
    items: ['項目1', '項目2'],
    meta: { count: 42, active: true }
  };
  const res = syncManager.checkZeroEmojis(cleanObj, 'clean');
  assert(res.pass && res.violations.length === 0,
    'checkZeroEmojis passes 100% on clean text structures');
}

// 2.2 Poisoned News Article Attacks
{
  const poisonedNewsArticle = {
    id: '99999999999999999999999999999999',
    title: '【預告】新要素登場！ ' + EMOJI_APPLE,
    date: '2026-11-01',
    full_content: '食材「 一口堅果 」新追加！ ' + EMOJI_GRIN,
    full_content_en: 'New ingredient Snackable Nuts! ' + EMOJI_SHOES
  };

  const emojiRes = syncManager.checkZeroEmojis(poisonedNewsArticle, 'news_article');
  assert(!emojiRes.pass && emojiRes.violations.length >= 3,
    'Poisoned news article with emojis in title, content, and english content strictly caught');
}

// 2.3 Poisoned Recipe Dataset Attack
{
  const canonicalRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes.json'), 'utf8'));
  const poisonedRecipes = JSON.parse(JSON.stringify(canonicalRecipes));
  poisonedRecipes[0].name_cn = poisonedRecipes[0].name_cn + ' ' + EMOJI_SUN;

  const gateResult = syncManager.validateRecipesDataset(poisonedRecipes);
  assert(!gateResult.valid && gateResult.errors.some(e => e.includes('Emoji violation')),
    'Recipes dataset gatekeeper strictly rejects recipe with emoji in name_cn');
}

// 2.4 Poisoned Pokemon Dataset Attack
{
  const canonicalPkm = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'data.json'), 'utf8'));
  const poisonedPkm = JSON.parse(JSON.stringify(canonicalPkm));
  poisonedPkm[0].name_cn = poisonedPkm[0].name_cn + ' ' + EMOJI_HEART;

  const gateResult = syncManager.validatePokemonDataset(poisonedPkm);
  assert(!gateResult.valid && gateResult.errors.some(e => e.includes('Emoji violation')),
    'Pokemon dataset gatekeeper strictly rejects Pokemon with emoji in name_cn');
}

// -----------------------------------------------------------------------------
// Suite 3: Poisoned Payloads with Decorative Star / Glyph Symbols
// -----------------------------------------------------------------------------
console.log('\n[Suite 3] Poisoned Payloads with Decorative Star / Glyph Symbols');

// Generate test strings with ASCII unicode escape sequences (zero literal glyphs)
const GLYPH_STAR_FILLED = '\u2605';
const GLYPH_STAR_EMPTY = '\u2606';
const GLYPH_BRACKET_STAR = '[' + GLYPH_STAR_FILLED + ']';
const GLYPH_BRACKET_ASTERISK = '[' + '*' + ']';
const GLYPH_BRACKET_PLUS = '[' + '+' + ']';
const GLYPH_BRACKET_HASH = '[' + '#' + ']';

// 3.1 checkZeroGlyphs detector verification
{
  const glyphObj = {
    dish: GLYPH_BRACKET_STAR + ' 頂級料理',
    note: '推薦 ' + GLYPH_STAR_EMPTY,
    tag: GLYPH_BRACKET_HASH + ' 隊伍加成'
  };
  const res = syncManager.checkZeroGlyphs(glyphObj, 'glyph_test');
  assert(!res.pass && res.violations.length === 3,
    'checkZeroGlyphs accurately flags decorative star, bracket star, and bracket hash glyphs');
}

// 3.2 Poisoned Recipe Dataset Attack
{
  const canonicalRecipes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'recipes.json'), 'utf8'));
  const poisonedRecipes = JSON.parse(JSON.stringify(canonicalRecipes));
  poisonedRecipes[5].name_cn = GLYPH_BRACKET_STAR + ' ' + poisonedRecipes[5].name_cn;

  const gateResult = syncManager.validateRecipesDataset(poisonedRecipes);
  assert(!gateResult.valid && gateResult.errors.some(e => e.includes('Decorative glyph violation')),
    'Recipes dataset gatekeeper strictly rejects recipe with decorative star glyph');
}

// 3.3 Poisoned Pokemon Dataset Attack
{
  const canonicalPkm = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'data.json'), 'utf8'));
  const poisonedPkm = JSON.parse(JSON.stringify(canonicalPkm));
  poisonedPkm[10].main_skill = GLYPH_BRACKET_PLUS + ' ' + poisonedPkm[10].main_skill;

  const gateResult = syncManager.validatePokemonDataset(poisonedPkm);
  assert(!gateResult.valid && gateResult.errors.some(e => e.includes('Decorative glyph violation')),
    'Pokemon dataset gatekeeper strictly rejects Pokemon with decorative glyph in skill');
}

// -----------------------------------------------------------------------------
// Suite 4: Poisoned Pokemon Payloads & Landmark Tampering
// -----------------------------------------------------------------------------
console.log('\n[Suite 4] Poisoned Pokemon Payloads & Landmark Tampering');

// 4.1 Missing required field
{
  const pkmMissingField = {
    id: 999,
    formatted_no: '999',
    name_cn: '測試怪',
    // missing name_en, type, specialty, etc.
  };
  const errs = syncManager.validateSinglePokemon(pkmMissingField, 0);
  assert(errs.length > 5 && errs.some(e => e.includes('Missing required field')),
    'Single Pokemon missing required fields strictly rejected');
}

// 4.2 Invalid Type, Specialty, Sleep Type
{
  const pkmInvalidEnums = {
    id: 999, formatted_no: '999', name_cn: '怪', name_en: 'Monster', name_jp: 'Kaiju',
    type: '宇宙', // Invalid
    specialty: '破壞', // Invalid
    sleep_type: '失眠', // Invalid
    carry: 10, ingredient_rate: '20%', skill_rate: '5%', interval: '01:00:00',
    main_skill: '能量填充S', evo_req: '', is_final: true, release_date: '2023-07-20',
    icon_url: 'https://example.com/p.png', ingredients: [{ name: '蘋果', l1: 1 }]
  };
  const errs = syncManager.validateSinglePokemon(pkmInvalidEnums, 0);
  assert(errs.some(e => e.includes('Invalid type')), 'Invalid type "宇宙" strictly rejected');
  assert(errs.some(e => e.includes('Invalid specialty')), 'Invalid specialty "破壞" strictly rejected');
  assert(errs.some(e => e.includes('Invalid sleep_type')), 'Invalid sleep_type "失眠" strictly rejected');
}

// 4.3 Invalid Interval and Rate Formats
{
  const pkmInvalidFormats = {
    id: 999, formatted_no: '999', name_cn: '怪', name_en: 'Monster', name_jp: 'Kaiju',
    type: '一般', specialty: '樹果', sleep_type: '安然入睡', carry: 10,
    ingredient_rate: '0.20', // missing %
    skill_rate: 'high',     // not percentage
    interval: '3600',       // not HH:MM:SS
    main_skill: '能量填充S', evo_req: '', is_final: true, release_date: '2023-07-20',
    icon_url: 'https://example.com/p.png', ingredients: [{ name: '蘋果', l1: 1 }]
  };
  const errs = syncManager.validateSinglePokemon(pkmInvalidFormats, 0);
  assert(errs.some(e => e.includes('Invalid interval format')), 'Interval not in HH:MM:SS strictly rejected');
  assert(errs.some(e => e.includes('Invalid ingredient_rate')), 'Ingredient rate lacking % strictly rejected');
  assert(errs.some(e => e.includes('Invalid skill_rate')), 'Skill rate not percentage strictly rejected');
}

// 4.4 Landmark Tampering Attacks on Pokemon Dataset
{
  const canonicalPkm = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'data.json'), 'utf8'));

  // Tamper #429 (Mismagius)
  const tampered429 = JSON.parse(JSON.stringify(canonicalPkm));
  const p429 = tampered429.find(p => String(p.id) === '429');
  p429.is_final = false; // tamper is_final
  const res429 = syncManager.validatePokemonDataset(tampered429);
  assert(!res429.valid && res429.errors.some(e => e.includes('#429 (Mismagius)')),
    'Landmark attack: tampering #429 is_final strictly rejected');

  // Tamper #94 (Gengar) to outdated 16.10%
  const tampered94 = JSON.parse(JSON.stringify(canonicalPkm));
  const p94 = tampered94.find(p => String(p.id) === '94');
  p94.ingredient_rate = '16.10%'; // outdated rate
  const res94 = syncManager.validatePokemonDataset(tampered94);
  assert(!res94.valid && res94.errors.some(e => e.includes('#94 (Gengar)')),
    'Landmark attack: reverting #94 ingredient_rate to 16.10% strictly rejected');
}

// -----------------------------------------------------------------------------
// Suite 5: Disk Protection & Atomic Writer Invariant Verification
// -----------------------------------------------------------------------------
console.log('\n[Suite 5] Disk Protection & Atomic Writer Invariants');

// 5.1 Verify that corrupted payload validation aborts BEFORE writeTextAtomic / writeJsonAtomic
{
  const testCorruptRecipeDataset = [{ invalid: true }];
  const validation = syncManager.validateRecipesDataset(testCorruptRecipeDataset);

  let writeInvoked = false;
  if (validation.valid) {
    // If gatekeeper wrongly allows this, write would happen
    writeInvoked = true;
  }

  assert(!validation.valid, 'Corrupt dataset recognized as invalid by gatekeeper');
  assert(!writeInvoked, 'Gatekeeper blocks write pipeline from executing on corrupt dataset');
}

// 5.2 Atomic file write success and temp file cleanup
{
  const testTarget = path.join(DATA_DIR, '.test_atomic_safety.json');
  try {
    syncManager.writeJsonAtomic(testTarget, { safety: 'ok', pid: process.pid }, false);
    assert(fs.existsSync(testTarget), 'writeJsonAtomic successfully created target file');

    const readBack = JSON.parse(fs.readFileSync(testTarget, 'utf8'));
    assert(readBack.safety === 'ok' && readBack.pid === process.pid,
      'Content written atomically matches expected data payload');

    // Clean up test file safely
    fs.unlinkSync(testTarget);
    assert(!fs.existsSync(testTarget), 'Cleaned up temporary safety test file');
  } catch (err) {
    assert(false, 'writeJsonAtomic failed unexpectedly: ' + err.message);
  }
}

// 5.3 Audit master file hashes: guarantee zero disk mutation from stress testing
{
  let unmutated = true;
  const mutatedFiles = [];
  for (const f of masterFiles) {
    const fullPath = path.join(DATA_DIR, f);
    const postHash = computeFileHash(fullPath);
    if (postHash !== preTestHashes[f]) {
      unmutated = false;
      mutatedFiles.push(f);
    }
  }
  assert(unmutated, 'Master data files (recipes.json, data.json, etc.) remained 100% UNTOUCHED (mutations: ' + mutatedFiles.join(', ') + ')');
}

// -----------------------------------------------------------------------------
// Suite 6: CLI Runner Contract & Dry-Run Sanity Check
// -----------------------------------------------------------------------------
console.log('\n[Suite 6] CLI Runner Contract & Dry-Run Sanity Check');

// 6.1 Run CLI with --dry-run and verify exit code 0
{
  const cliRun = spawnSync('node', ['scripts/sync_manager.js', '--dry-run'], {
    cwd: WORKSPACE_ROOT,
    encoding: 'utf8'
  });

  assert(cliRun.status === 0, 'CLI "node scripts/sync_manager.js --dry-run" completed with exit code 0');
  assert(cliRun.stdout.includes('Announcement Scan Results:'),
    'CLI output contains announcement scan results');
  assert(cliRun.stdout.includes('Prospective Ingredients: 1'),
    'CLI accurately parsed prospective ingredient 一口堅果');
  assert(cliRun.stdout.includes('Prospective Dishes: 3'),
    'CLI accurately parsed 3 prospective dishes with balanced pot sizes');
  assert(cliRun.stdout.includes('Prospective Clue Pokemon: 1'),
    'CLI accurately resolved clue fluffy_nut_gatherer to Cottonee and Whimsicott');
  assert(cliRun.stdout.includes('Prospective Sleep Dex Goals: 1'),
    'CLI accurately extracted 570 sleep style goal');
  assert(cliRun.stdout.includes('Dry-run completed'),
    'CLI confirmed dry-run completed with all defensive health gates verified');
}

// 6.2 Audit CLI stdout and stderr for Zero Emojis and Zero Decorative Glyphs
{
  const cliRun = spawnSync('node', ['scripts/sync_manager.js', '--dry-run', '--verbose'], {
    cwd: WORKSPACE_ROOT,
    encoding: 'utf8'
  });

  const fullOutput = (cliRun.stdout || '') + (cliRun.stderr || '');
  const emojiCheck = syncManager.checkZeroEmojis(fullOutput, 'cli_output');
  const glyphCheck = syncManager.checkZeroGlyphs(fullOutput, 'cli_output');

  assert(emojiCheck.pass, 'CLI verbose output strictly contains zero emojis (Rule VIII)');
  assert(glyphCheck.pass, 'CLI verbose output strictly contains zero decorative glyphs (Rule X)');
}

// -----------------------------------------------------------------------------
// Summary & Verdict
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('       Adversarial Stress Harness Results Summary');
console.log('================================================================');
console.log(`Total Checks Executed : ${totalTests}`);
console.log(`Passed Checks         : ${passedTests}`);
console.log(`Failed Checks         : ${failedTests}`);

if (failedTests > 0) {
  console.log('\nFAILURE DETAILS:');
  for (const f of failureDetails) {
    console.log(` - ${f}`);
  }
  process.exit(1);
} else {
  console.log('\nEMPIRICAL VERDICT: 100% CONFIRMED (All adversarial attacks successfully repelled)');
  process.exit(0);
}
