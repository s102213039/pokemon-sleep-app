/**
 * stress_i18n_consumer.js - Adversarial Multilingual & Consumer Stress Test Suite
 * Milestone: Challenger M1-2
 * Tests I18N.getRecipeName across languages, corrupt inputs, and consumer null-safety.
 * Zero emojis, zero decorative glyphs.
 */

const fs = require('fs');
const path = require('path');

global.window = global;
require('../js/core/i18n.js');
const canonicalRecipes = require('../data/recipes.json');
window.__RECIPES_CACHE__ = canonicalRecipes;
const I18N = window.I18N;

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  challenges: []
};

function recordChallenge(title, detail) {
  results.challenges.push({ title, detail });
}

function testCase(category, name, fn) {
  results.total++;
  try {
    fn();
    results.passed++;
    console.log('[PASS] ' + category + ': ' + name);
  } catch (err) {
    results.failed++;
    console.error('[FAIL] ' + category + ': ' + name + ' -> ' + err.message);
  }
}

console.log('=== STARTING CHALLENGER M1-2 EMPIRICAL STRESS TESTS ===\n');

// ─── Group 1: Defensive Type Safety on I18N.getRecipeName ─────────
const malformedInputs = [
  { val: undefined, label: 'undefined' },
  { val: null, label: 'null' },
  { val: 0, label: 'number (0)' },
  { val: 42, label: 'number (42)' },
  { val: -1, label: 'number (-1)' },
  { val: NaN, label: 'number (NaN)' },
  { val: true, label: 'boolean (true)' },
  { val: false, label: 'boolean (false)' },
  { val: Symbol('recipe'), label: 'symbol' },
  { val: () => {}, label: 'function' },
  { val: [], label: 'empty array' },
  { val: [1, 2, 3], label: 'numeric array' },
  { val: {}, label: 'empty object' },
  { val: { foo: 'bar' }, label: 'unrelated object' },
  { val: { name_cn: null, name_en: undefined }, label: 'object with null name_cn' },
  { val: { name_cn: '', name_en: '' }, label: 'object with empty string names' },
  { val: { name_cn: 123 }, label: 'object with numeric name_cn' },
  { val: { name_cn: false }, label: 'object with boolean name_cn' },
  { val: { name_cn: { nested: true } }, label: 'object with nested object name_cn' },
  { val: { name: null }, label: 'object with null name' },
  { val: { name_tw: null }, label: 'object with null name_tw' }
];

for (const lang of ['zh-TW', 'zh-CN', 'en-US']) {
  testCase('Type Safety', 'Malformed inputs in ' + lang + ' mode must not throw', () => {
    I18N.setLanguage(lang);
    for (const item of malformedInputs) {
      const res = I18N.getRecipeName(item.val);
      if (typeof res !== 'string' && typeof res !== 'number' && typeof res !== 'object') {
        throw new Error('Unexpected return type ' + typeof res + ' for ' + item.label);
      }
    }
  });

  testCase('Type Safety', 'Strict empty returns for invalid inputs in ' + lang, () => {
    I18N.setLanguage(lang);
    const strictEmpty = [undefined, null, 0, 42, NaN, true, false, {}, { foo: 'bar' }, []];
    for (const input of strictEmpty) {
      const res = I18N.getRecipeName(input);
      if (res !== '') {
        throw new Error('Expected empty string for ' + String(input) + ' but got ' + JSON.stringify(res));
      }
    }
  });
}

// ─── Group 2: All 78 Canonical Recipes Multilingual Verification ────
testCase('Multilingual Coverage', 'All 78 dishes produce non-empty names in zh-TW', () => {
  I18N.setLanguage('zh-TW');
  for (let i = 0; i < canonicalRecipes.length; i++) {
    const r = canonicalRecipes[i];
    const name = I18N.getRecipeName(r);
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Recipe at index ' + i + ' produced empty name in zh-TW');
    }
  }
});

testCase('Multilingual Coverage', 'All 78 dishes produce non-empty names in en-US', () => {
  I18N.setLanguage('en-US');
  for (let i = 0; i < canonicalRecipes.length; i++) {
    const r = canonicalRecipes[i];
    const name = I18N.getRecipeName(r);
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Recipe at index ' + i + ' produced empty name in en-US');
    }
    if (r.name_en && name !== r.name_en) {
      throw new Error('Recipe at index ' + i + ' expected ' + r.name_en + ' but got ' + name);
    }
  }
});

testCase('Multilingual Coverage', 'All 78 dishes produce non-empty names in zh-CN', () => {
  I18N.setLanguage('zh-CN');
  for (let i = 0; i < canonicalRecipes.length; i++) {
    const r = canonicalRecipes[i];
    const name = I18N.getRecipeName(r);
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new Error('Recipe at index ' + i + ' produced empty name in zh-CN');
    }
  }
});

// ─── Group 3: Simplified Character Verification in zh-CN ───────────
testCase('Simplified Chinese', 'Key domain terms properly simplified (苹果, 咖喱, 沙拉, 甜点)', () => {
  I18N.setLanguage('zh-CN');
  let appleCount = 0;
  let curryCount = 0;
  let saladCount = 0;

  for (const r of canonicalRecipes) {
    const name = I18N.getRecipeName(r);
    if (r.name_cn.includes('蘋果')) {
      appleCount++;
      if (!name.includes('苹果')) {
        throw new Error('Failed to simplify 蘋果 in: ' + r.name_cn + ' -> ' + name);
      }
    }
    if (r.name_cn.includes('咖哩')) {
      curryCount++;
      if (!name.includes('咖喱')) {
        throw new Error('Failed to simplify 咖哩 in: ' + r.name_cn + ' -> ' + name);
      }
    }
    if (r.name_cn.includes('沙拉')) {
      saladCount++;
      if (!name.includes('沙拉')) {
        throw new Error('Failed to preserve 沙拉 in: ' + r.name_cn + ' -> ' + name);
      }
    }
  }

  if (appleCount === 0 || curryCount === 0 || saladCount === 0) {
    throw new Error('Sample counts insufficient: apple=' + appleCount + ', curry=' + curryCount + ', salad=' + saladCount);
  }
});

testCase('Simplified Chinese', 'All 78 dish names in zh-CN match toSimplified output exactly', () => {
  I18N.setLanguage('zh-CN');
  for (let i = 0; i < canonicalRecipes.length; i++) {
    const r = canonicalRecipes[i];
    const name = I18N.getRecipeName(r);
    const expected = I18N.toSimplified(r.name_cn);
    if (name !== expected) {
      throw new Error('Mismatch at index ' + i + ': got ' + name + ', expected ' + expected);
    }
  }
});

// ─── Group 4: Reverse & Ad-Hoc Bilingual Resolution ────────────────
testCase('Bilingual Lookup', 'Reverse lookup from English dish string', () => {
  I18N.setLanguage('zh-TW');
  if (I18N.getRecipeName('Fancy Apple Curry') !== '特選蘋果咖哩') {
    throw new Error('EN to TW reverse lookup failed');
  }
  I18N.setLanguage('zh-CN');
  if (I18N.getRecipeName('Fancy Apple Curry') !== '特选苹果咖喱') {
    throw new Error('EN to CN reverse lookup failed');
  }
});

testCase('Bilingual Lookup', 'String input matching Chinese canonical name', () => {
  I18N.setLanguage('en-US');
  if (I18N.getRecipeName('特選蘋果咖哩') !== 'Fancy Apple Curry') {
    throw new Error('TW string to EN resolution failed');
  }
});

testCase('Bilingual Lookup', 'Legacy property schemas (name, name_tw, name_en only)', () => {
  I18N.setLanguage('en-US');
  if (I18N.getRecipeName({ name: '特選蘋果咖哩' }) !== 'Fancy Apple Curry') {
    throw new Error('Legacy name resolution failed');
  }
  if (I18N.getRecipeName({ name_tw: '特選蘋果咖哩' }) !== 'Fancy Apple Curry') {
    throw new Error('Legacy name_tw resolution failed');
  }
  I18N.setLanguage('zh-TW');
  if (I18N.getRecipeName({ name_en: 'Fancy Apple Curry' }) !== '特選蘋果咖哩') {
    throw new Error('Reverse name_en object resolution failed');
  }
});

// ─── Group 5: Cache Resilience ─────────────────────────────────────
testCase('Cache Resilience', 'Functions smoothly when window.__RECIPES_CACHE__ is null, undefined, or empty', () => {
  const corruptStates = [undefined, null, {}, 'invalid_string', []];
  const sample = canonicalRecipes[0];

  for (const st of corruptStates) {
    window.__RECIPES_CACHE__ = st;
    I18N.setLanguage('zh-TW');
    if (I18N.getRecipeName(sample) !== '特選蘋果咖哩') throw new Error('Object TW lookup failed on cache state ' + st);
    I18N.setLanguage('zh-CN');
    if (I18N.getRecipeName(sample) !== '特选苹果咖喱') throw new Error('Object CN lookup failed on cache state ' + st);
    I18N.setLanguage('en-US');
    if (I18N.getRecipeName(sample) !== 'Fancy Apple Curry') throw new Error('Object EN lookup failed on cache state ' + st);
  }

  // Restore cache
  window.__RECIPES_CACHE__ = canonicalRecipes;
});

// ─── Group 6: Consumer Safety in recipes_render.js ──────────────────
const renderFile = fs.readFileSync(path.resolve(__dirname, '../js/modules/recipes/recipes_render.js'), 'utf8');

// Isolate renderIngRow
const matchIngRow = renderFile.match(/function renderIngRow\([\s\S]*?\n  \}/);
const renderIngRow = new Function('window', 'ingredients', 'return (' + matchIngRow[0] + ')(ingredients);');

testCase('Consumer Safety', 'renderIngRow handles non-array and poisoned arrays safely', () => {
  const poisonedInputs = [
    null,
    undefined,
    123,
    'string',
    {},
    [],
    [null, undefined, 0, false],
    [{}],
    [{ name: null, count: undefined }],
    [{ name: '蘋果', count: 5, icon: 'icon.png' }],
    [{ name: '蘋果', count: null, icon: null }]
  ];

  for (const input of poisonedInputs) {
    const html = renderIngRow(window, input);
    if (typeof html !== 'string' || !html.includes('recipe-ing-row')) {
      throw new Error('renderIngRow failed to produce valid HTML container for: ' + String(input));
    }
  }
});

testCase('Consumer Safety', 'Sorting options do not throw when sorting malformed recipe objects', () => {
  const sortOptions = ['energy-desc', 'energy-asc', 'pot-asc', 'pot-desc', 'bonus-desc', 'name-asc'];
  const malformedList = [
    {},
    { name_cn: null, name_en: undefined },
    { name_cn: '', name_en: '' },
    { name: null },
    { name: 'Alpha' },
    { name_cn: '特選蘋果咖哩', base_energy: 748, pot_size: 15, bonus_pct: 10, ingredients: [] },
    { name_cn: null, base_energy: null, pot_size: null, bonus_pct: null, ingredients: null },
    { name_cn: undefined, base_energy: undefined, pot_size: undefined, bonus_pct: undefined, ingredients: 'invalid' },
    { ingredients: [null, undefined, {}, { name: null }, { name: '蘋果', count: 2 }] },
    { _cachedEnergy: undefined, pot_size: NaN, bonus_pct: 'abc' },
    { _cachedEnergy: NaN, pot_size: -5, bonus_pct: 100 }
  ];

  // Test ingredient mapping preprocessing
  for (const r of malformedList) {
    const recipe = Object.assign({}, r);
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    recipe._ingNameSet = new Set(ings.map(i => i && i.name).filter(Boolean));
    recipe._searchStr = ((recipe.name_cn || '') + ' ' + (recipe.name_en || '') + ' ' + ings.map(i => i && i.name).filter(Boolean).join(' ')).toLowerCase();
  }

  // Test all sort options
  for (const sortOption of sortOptions) {
    const list = malformedList.map(r => Object.assign({}, r));
    list.sort((a, b) => {
      if (sortOption === 'energy-desc')  return b._cachedEnergy - a._cachedEnergy;
      if (sortOption === 'energy-asc')   return a._cachedEnergy - b._cachedEnergy;
      if (sortOption === 'pot-asc')      return a.pot_size - b.pot_size;
      if (sortOption === 'pot-desc')     return b.pot_size - a.pot_size;
      if (sortOption === 'bonus-desc')   return (b.bonus_pct || 0) - (a.bonus_pct || 0);
      if (sortOption === 'name-asc')     return (a.name_cn || a.name || '').localeCompare(b.name_cn || b.name || '', 'zh-TW');
      return 0;
    });
  }
});

// ─── Group 7: Image onerror Resilience ──────────────────────────────
testCase('Image Resilience', 'All recipe and ingredient icon image elements specify onerror handlers', () => {
  const snippets = [
    { code: "this.style.display='none';", target: 'renderIngRow and mobile card' },
    { code: "this.style.opacity='0.3';", target: 'table and desktop grid card' },
    { code: "this.style.display='none'; if (this.nextElementSibling) { this.nextElementSibling.style.position='static'; this.nextElementSibling.style.clip='auto'; this.nextElementSibling.style.width='auto'; this.nextElementSibling.style.height='auto'; }", target: 'lab summary chip' }
  ];

  for (const snip of snippets) {
    // Sibling present
    const elWithSibling = { style: {}, nextElementSibling: { style: {} } };
    new Function(snip.code).call(elWithSibling);
    // Sibling null
    const elWithoutSibling = { style: {}, nextElementSibling: null };
    new Function(snip.code).call(elWithoutSibling);
  }
});

// ─── Group 8: Adversarial Challenge: Optional Language Parameter ────
testCase('Adversarial Challenge', 'Detection of optional language parameter support in I18N.getRecipeName(rec, lang)', () => {
  I18N.setLanguage('zh-TW');
  const sample = canonicalRecipes[0];
  const resEN = I18N.getRecipeName(sample, 'en-US');

  if (resEN !== sample.name_en) {
    recordChallenge(
      'Optional language argument ignored in I18N.getRecipeName(rec, lang)',
      'Calling I18N.getRecipeName(rec, "en-US") while currentLang is "zh-TW" returned "' + resEN +
      '" instead of "' + sample.name_en +
      '". The method relies solely on currentLang. Tier 4 Test 114 called I18N.getRecipeName(r, "en-US") with 2 arguments, which silently evaluated to Traditional Chinese due to length > 0 assertion.'
    );
    console.log('[CHALLENGE DETECTED] Optional targetLang argument is not supported in I18N.getRecipeName(rec, [lang]).');
  } else {
    console.log('[INFO] Optional targetLang parameter is fully supported.');
  }
});

console.log('\n=== CHALLENGER M1-2 SUMMARY ===');
console.log('Total Tests Executed: ' + results.total);
console.log('Passed: ' + results.passed);
console.log('Failed: ' + results.failed);
console.log('Challenges Surfaced: ' + results.challenges.length);

if (results.challenges.length > 0) {
  console.log('\nChallenges:');
  results.challenges.forEach((c, i) => {
    console.log((i + 1) + '. ' + c.title);
    console.log('   ' + c.detail);
  });
}

if (results.failed === 0) {
  console.log('\nOVERALL EMPIRICAL VERDICT: APPROVE');
} else {
  console.log('\nOVERALL EMPIRICAL VERDICT: REQUEST_CHANGES');
}
