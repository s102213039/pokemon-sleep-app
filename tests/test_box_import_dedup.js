/**
 * test_box_import_dedup.js
 * Test suite for Box Import, Deduplication, Upgrade Logic, Modal Non-blocking, and I18N.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const BOX_DIR = path.join(ROOT_DIR, 'js', 'modules', 'box');
const I18N = require('../js/core/i18n.js');

let passedTests = 0;

function runTest(desc, fn) {
  try {
    fn();
    passedTests++;
    console.log(`[PASS] ${desc}`);
  } catch (err) {
    console.error(`[FAIL] ${desc}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Verify zero active alert, confirm, prompt in js/modules/box/*.js
runTest('Zero active alert, confirm, prompt calls in js/modules/box/*.js', () => {
  const files = fs.readdirSync(BOX_DIR).filter(f => f.endsWith('.js'));
  assert(files.length > 0, 'Must find JS files in js/modules/box');

  files.forEach(file => {
    const filePath = path.join(BOX_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const forbiddenRegex = /\b(alert|confirm|prompt)\s*\(/g;
    const matches = cleanContent.match(forbiddenRegex);
    assert(!matches || matches.length === 0, `Found forbidden active calls in ${file}: ${matches ? matches.join(', ') : ''}`);
  });
});

// Setup environment and load box modules into sandbox
const BOX_MODULES = [
  'box_filter.js', 'box_storage_crud.js', 'box_render.js', 'box_modal_form.js',
  'box_modal_conflict.js', 'box_ocr_canvas.js', 'box_ocr_parse.js', 'box_main.js'
];
const concatenatedCode = BOX_MODULES.map(m => fs.readFileSync(path.join(BOX_DIR, m), 'utf8')).join('\n');

const sandbox = {
  window: {},
  document: {
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => {}, querySelectorAll: () => [], appendChild: () => {} }),
    body: { appendChild: () => {}, classList: { add: () => {}, remove: () => {} } }
  },
  console, setTimeout, clearTimeout, Date, Math, parseInt, Number, String, Array, Object, Set, JSON, Boolean
};
sandbox.window = sandbox;
sandbox.window.I18N = I18N;
vm.createContext(sandbox);
vm.runInContext(concatenatedCode, sandbox);

const UserBox = sandbox.window.UserBox;
assert(typeof UserBox === 'object', 'UserBox must be exposed on window');
const { upsertImportedPokemonToBox, _tBox, getMainSkillMaxLevel } = UserBox;
assert(typeof upsertImportedPokemonToBox === 'function', 'upsertImportedPokemonToBox must be a function');
assert(typeof _tBox === 'function', '_tBox must be a function');
assert(typeof getMainSkillMaxLevel === 'function', 'getMainSkillMaxLevel must be a function');

// 2. upsertImportedPokemonToBox skips exact duplicates (status: 'skipped')
runTest('upsertImportedPokemonToBox skips exact duplicates', () => {
  const userBox = [{
    uid: 'pkm_test_01', name: '皮卡丘', pokemonId: '25', level: 30, skillLevel: 2,
    nature: '固執', subskills: ['幫手獎勵', '樹果數量S'], ing1: '特選蘋果', ing2: '純粹油', nickname: '皮神', ribbon: 2
  }];
  const incomingExact = {
    name: '皮卡丘', pokemonId: '25', level: 30, skillLevel: 2, nature: '固執',
    subskills: ['幫手獎勵', '樹果數量S'], ing1: '特選蘋果', ing2: '純粹油'
  };
  const res = upsertImportedPokemonToBox(incomingExact, userBox);
  assert.strictEqual(res.status, 'skipped', 'Exact duplicate must return status skipped');
  assert.strictEqual(userBox.length, 1, 'Box length should remain 1');
  assert.strictEqual(res.entry.uid, 'pkm_test_01', 'Should return the existing entry');

  // Also skip if incoming has lower level
  const incomingLower = {
    name: '皮卡丘', pokemonId: '25', level: 25, skillLevel: 1, nature: '固執',
    subskills: ['幫手獎勵'], ing1: '特選蘋果'
  };
  const resLower = upsertImportedPokemonToBox(incomingLower, userBox);
  assert.strictEqual(resLower.status, 'skipped', 'Lower level duplicate must return status skipped');
});

// 3. upsertImportedPokemonToBox upgrades when incoming has higher level or skillLevel
runTest('upsertImportedPokemonToBox upgrades existing Pokemon and preserves custom nickname and ribbon', () => {
  const userBox = [{
    uid: 'pkm_test_02', name: '噴火龍', pokemonId: '6', level: 35, skillLevel: 2,
    nature: '內斂', subskills: ['食材機率提升M'], ing1: '暖暖醬菜', nickname: '噴火老將', ribbon: 3
  }];

  const incomingUpgrade = {
    name: '噴火龍', pokemonId: '6', level: 55, skillLevel: 4, nature: '內斂',
    subskills: ['食材機率提升M', '幫手獎勵'], ing1: '暖暖醬菜', ing2: '特選薑', nickname: '', ribbon: 1
  };

  const res = upsertImportedPokemonToBox(incomingUpgrade, userBox);
  assert.strictEqual(res.status, 'upgraded', 'Higher level entry must return status upgraded');
  assert.strictEqual(userBox.length, 1, 'Box length should remain 1');
  assert.strictEqual(userBox[0].level, 55, 'Level must be upgraded to 55');
  assert.strictEqual(userBox[0].skillLevel, 4, 'Skill level must be upgraded to 4');
  assert.strictEqual(userBox[0].nickname, '噴火老將', 'Existing custom nickname must be preserved');
  assert.strictEqual(userBox[0].ribbon, 3, 'Higher existing ribbon must be preserved');
  assert.strictEqual(userBox[0].ing2, '特選薑', 'New unlocked ingredient slot must be populated');
  assert.deepStrictEqual(userBox[0].subskills, ['食材機率提升M', '幫手獎勵'], 'Subskills must be updated');
  assert(userBox[0].updatedAt, 'updatedAt timestamp must be set');
});

// 4. upsertImportedPokemonToBox adds new non-conflicting Pokemon (status: 'added')
runTest('upsertImportedPokemonToBox adds new non-conflicting Pokemon', () => {
  const userBox = [{
    uid: 'pkm_test_03', name: '卡比獸', pokemonId: '143', level: 50, nature: '淘氣'
  }];
  const incomingNew = {
    name: '耿鬼', pokemonId: '94', level: 40, skillLevel: 2, nature: '膽小',
    subskills: ['幫手支援S'], ing1: '幽靈菇'
  };

  const res = upsertImportedPokemonToBox(incomingNew, userBox);
  assert.strictEqual(res.status, 'added', 'New Pokemon must return status added');
  assert.strictEqual(userBox.length, 2, 'Box length must increase to 2');
  assert(res.entry.uid, 'New entry must have a unique uid');
  assert(res.entry.createdAt || res.entry.addedAt, 'New entry must have a timestamp');
});

// 5. _tBox properly outputs zh-TW, zh-CN (Simplified Chinese), and en-US strings
runTest('_tBox properly outputs zh-TW, zh-CN, and en-US strings', () => {
  let currentLang = 'zh-TW';
  I18N.getLanguage = () => currentLang;

  const twText = '寶可夢倉庫確認';
  const enText = 'Confirm Pokemon Box';

  // zh-TW
  currentLang = 'zh-TW';
  assert.strictEqual(_tBox(twText, enText), '寶可夢倉庫確認', 'Must return Traditional Chinese in zh-TW');

  // zh-CN
  currentLang = 'zh-CN';
  assert.strictEqual(_tBox(twText, enText), '宝可梦仓库确认', 'Must return Simplified Chinese in zh-CN');

  // en-US
  currentLang = 'en-US';
  assert.strictEqual(_tBox(twText, enText), 'Confirm Pokemon Box', 'Must return English in en-US');
});

// 6. Authoritative getMainSkillMaxLevel check
runTest('getMainSkillMaxLevel returns correct max skill levels', () => {
  assert.strictEqual(getMainSkillMaxLevel(''), 6, 'Empty string must return 6');
  assert.strictEqual(getMainSkillMaxLevel(null), 6, 'Null must return 6');
  assert.strictEqual(getMainSkillMaxLevel('能量填充M'), 7, 'Charge Strength M must return 7');
  assert.strictEqual(getMainSkillMaxLevel('夢之碎片獲取S'), 8, 'Dream Shard Magnet S must return 8');
  assert.strictEqual(getMainSkillMaxLevel('料理強化S'), 7, 'Cooking Power-Up S must return 7');
  assert.strictEqual(getMainSkillMaxLevel('幫手加速（水）'), 6, 'Helper Boost must return 6');
  assert.strictEqual(getMainSkillMaxLevel('樹果遽增'), 6, 'Berry Burst must return 6');
  assert.strictEqual(getMainSkillMaxLevel('技能複製'), 7, 'Skill Copy must return 7');
  assert.strictEqual(getMainSkillMaxLevel('十項全能'), 7, 'All-Rounder must return 7');
});

console.log(`\nAll ${passedTests} tests passed successfully.`);
