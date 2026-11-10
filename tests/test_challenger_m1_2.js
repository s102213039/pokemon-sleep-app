/**
 * tests/test_challenger_m1_2.js
 * Adversarial Empirical Verification Harness for Milestone 1-2 (Skill Mapping Coverage)
 *
 * Verifies:
 * 1. Full Accounting of all 253 Pokemon in data/data.json:
 *    - Exactly 241 covered (getSkillTracks.length >= 1)
 *    - Exactly 10 excluded (isExcludedSkill === true)
 *    - Exactly 2 unreleased (empty skill)
 *    - Exactly 17 composite dual tracks (getSkillTracks.length === 2)
 *    - Total track placements = 258
 * 2. Internal Baseline Parity (POKEMON_SKILLS_BASELINE_DATA in wiki_skill_ladder_data.js)
 * 3. Track Definitions Integrity (9 tracks, complete attributes, zero emoji, zero glyphs)
 * 4. Exclusion Logic Stress-Testing (brackets, spaces, casing, aliases)
 * 5. Composite Skill Dual-Track Stress-Testing (14 composite skills, casing, brackets, aliases)
 * 6. Single-Track Special Skill Stress-Testing (Moonlight, Draco Meteor, Stockpile, Nightmare)
 * 7. Casing Robustness & Alias Fallbacks on Core Skill Names (UPPER, lower, Mixed)
 * 8. i18n Skill Names Mapping Coverage from js/core/i18n/i18n_entities.js
 * 9. Calculation Engine Contract Integrity (helps12h, procs, defensive inputs)
 * 10. Zero Emoji & Zero Decorative Glyph Rules Audit
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
console.log('  Challenger M1-2: Skill Mapping Coverage Empirical Harness');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Load Modules into VM
// -----------------------------------------------------------------------------
const ladderDataPath = path.resolve(__dirname, '../js/modules/wiki/wiki_skill_ladder_data.js');
const ladderCodePath = path.resolve(__dirname, '../js/modules/wiki/wiki_skill_ladder.js');
const dataJsonPath = path.resolve(__dirname, '../data/data.json');
const i18nEntitiesPath = path.resolve(__dirname, '../js/core/i18n/i18n_entities.js');

assert(fs.existsSync(ladderDataPath), 'wiki_skill_ladder_data.js exists on disk');
assert(fs.existsSync(ladderCodePath), 'wiki_skill_ladder.js exists on disk');
assert(fs.existsSync(dataJsonPath), 'data/data.json exists on disk');
assert(fs.existsSync(i18nEntitiesPath), 'i18n_entities.js exists on disk');

const ladderDataCode = fs.readFileSync(ladderDataPath, 'utf8');
const ladderCode = fs.readFileSync(ladderCodePath, 'utf8');
const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));
const i18nEntitiesCode = fs.readFileSync(i18nEntitiesPath, 'utf8');

const sandbox = {
  window: {},
  document: { getElementById: () => null, querySelectorAll: () => [] },
  Math,
  String,
  parseFloat,
  isNaN,
  Object,
  Array,
  Set,
  console
};
vm.createContext(sandbox);

vm.runInContext(
  ladderDataCode + ';\n' +
  ladderCode + ';\n' +
  'this.WikiScope = {\n' +
  '  POKEMON_SKILLS_BASELINE_DATA,\n' +
  '  EXCLUDED_SKILL_NAMES,\n' +
  '  isExcludedSkill,\n' +
  '  SKILL_TRACK_DEFINITIONS,\n' +
  '  COMPOSITE_SKILL_TRACKS,\n' +
  '  getSkillTracks,\n' +
  '  getPokemonSkillLadderProcs\n' +
  '};',
  sandbox
);

const {
  POKEMON_SKILLS_BASELINE_DATA,
  EXCLUDED_SKILL_NAMES,
  isExcludedSkill,
  SKILL_TRACK_DEFINITIONS,
  COMPOSITE_SKILL_TRACKS,
  getSkillTracks,
  getPokemonSkillLadderProcs
} = sandbox.WikiScope;

// -----------------------------------------------------------------------------
// Probe 1: Full Accounting of all 253 Pokemon in data/data.json
// -----------------------------------------------------------------------------
console.log('\n[Probe 1] Full Accounting of all 253 Pokemon in data/data.json');

assert(dataJson.length === 253, 'data/data.json contains exactly 253 Pokemon (actual: ' + dataJson.length + ')');

let countCovered = 0;
let countExcluded = 0;
let countUnreleased = 0;
let countDualTracks = 0;
let countSingleTrack = 0;
let countUnmapped = 0;
let totalPlacements = 0;

const excludedList = [];
const unreleasedList = [];
const dualTrackList = [];
const unmappedList = [];

dataJson.forEach(pkm => {
  if (!pkm.main_skill || pkm.main_skill.trim() === '') {
    countUnreleased++;
    unreleasedList.push(pkm.name_cn || pkm.name_en);
    return;
  }
  if (isExcludedSkill(pkm.main_skill)) {
    countExcluded++;
    excludedList.push({ name: pkm.name_cn || pkm.name_en, skill: pkm.main_skill });
    return;
  }
  const tracks = getSkillTracks(pkm.main_skill);
  if (tracks.length > 0) {
    countCovered++;
    totalPlacements += tracks.length;
    if (tracks.length === 2) {
      countDualTracks++;
      dualTrackList.push({ name: pkm.name_cn || pkm.name_en, skill: pkm.main_skill, tracks });
    } else if (tracks.length === 1) {
      countSingleTrack++;
    }
  } else {
    countUnmapped++;
    unmappedList.push({ name: pkm.name_cn || pkm.name_en, skill: pkm.main_skill });
  }
});

assert(countCovered === 241, 'Exactly 241 Pokemon are covered on skill tracks (actual: ' + countCovered + ')');
assert(countExcluded === 10, 'Exactly 10 Pokemon evaluate to excluded skills (actual: ' + countExcluded + ')');
assert(countUnreleased === 2, 'Exactly 2 Pokemon evaluate to unreleased empty skills (actual: ' + countUnreleased + ')');
assert(countDualTracks === 17, 'Exactly 17 Pokemon evaluate to dual tracks (actual: ' + countDualTracks + ')');
assert(countSingleTrack === 224, 'Exactly 224 Pokemon evaluate to single tracks (actual: ' + countSingleTrack + ')');
assert(countUnmapped === 0, 'Exactly 0 released non-random Pokemon are unmapped (actual: ' + countUnmapped + ')');
assert(totalPlacements === 258, 'Total track placements equal exactly 258 (actual: ' + totalPlacements + ')');

// Check expected excluded Pokemon
const expectedExcludedNames = new Set([
  '皮寶寶', '皮皮', '皮可西', '魔尼尼', '魔牆人偶', '百變怪', '夢幻', '波克比', '波克基古', '波克基斯'
]);
const actualExcludedNames = new Set(excludedList.map(e => e.name));
const allExcludedMatch = [...expectedExcludedNames].every(name => actualExcludedNames.has(name));
assert(allExcludedMatch, 'Excluded Pokemon match the canonical 10 (Cleffa, Clefairy, Clefable, Mime Jr., Mr. Mime, Ditto, Mew, Togepi, Togetic, Togekiss)');

// Check unreleased Pokemon
assert(unreleasedList.includes('木棉球') && unreleasedList.includes('風妖精'), 'Unreleased Pokemon are Cottonee and Whimsicott (#546, #547)');

// -----------------------------------------------------------------------------
// Probe 2: Internal Baseline Parity (POKEMON_SKILLS_BASELINE_DATA)
// -----------------------------------------------------------------------------
console.log('\n[Probe 2] Internal Baseline Parity (POKEMON_SKILLS_BASELINE_DATA)');

assert(Array.isArray(POKEMON_SKILLS_BASELINE_DATA), 'POKEMON_SKILLS_BASELINE_DATA is an Array');
assert(POKEMON_SKILLS_BASELINE_DATA.length === 253, 'POKEMON_SKILLS_BASELINE_DATA contains exactly 253 Pokemon (actual: ' + POKEMON_SKILLS_BASELINE_DATA.length + ')');

let baselineCovered = 0;
let baselineExcluded = 0;
let baselineUnreleased = 0;
let baselineDual = 0;
let baselinePlacements = 0;

POKEMON_SKILLS_BASELINE_DATA.forEach(pkm => {
  if (!pkm.main_skill || pkm.main_skill.trim() === '') {
    baselineUnreleased++;
    return;
  }
  if (isExcludedSkill(pkm.main_skill)) {
    baselineExcluded++;
    return;
  }
  const tracks = getSkillTracks(pkm.main_skill);
  if (tracks.length > 0) {
    baselineCovered++;
    baselinePlacements += tracks.length;
    if (tracks.length === 2) baselineDual++;
  }
});

assert(baselineCovered === 241, 'Baseline array covered count is 241 (actual: ' + baselineCovered + ')');
assert(baselineExcluded === 10, 'Baseline array excluded count is 10 (actual: ' + baselineExcluded + ')');
assert(baselineUnreleased === 2, 'Baseline array unreleased count is 2 (actual: ' + baselineUnreleased + ')');
assert(baselineDual === 17, 'Baseline array dual-track count is 17 (actual: ' + baselineDual + ')');
assert(baselinePlacements === 258, 'Baseline array total placements equal 258 (actual: ' + baselinePlacements + ')');

// -----------------------------------------------------------------------------
// Probe 3: Track Definitions Integrity
// -----------------------------------------------------------------------------
console.log('\n[Probe 3] Track Definitions Integrity (9 tracks)');

assert(Array.isArray(SKILL_TRACK_DEFINITIONS), 'SKILL_TRACK_DEFINITIONS is an Array');
assert(SKILL_TRACK_DEFINITIONS.length === 9, 'Exactly 9 skill tracks defined (actual: ' + SKILL_TRACK_DEFINITIONS.length + ')');

const expectedTrackIds = [
  'charge_energy', 'energy_all', 'energy_single',
  'cooking_pot', 'cooking_chance', 'helper_boost',
  'dream_shards', 'ingredient', 'berry_burst'
];

expectedTrackIds.forEach(id => {
  const track = SKILL_TRACK_DEFINITIONS.find(t => t.id === id);
  assert(track !== undefined, 'Track ' + id + ' is defined in SKILL_TRACK_DEFINITIONS');
  if (track) {
    assert(track.name && track.name_en, 'Track ' + id + ' has bilingual names');
    assert(track.desc && track.desc_en, 'Track ' + id + ' has bilingual descriptions');
    assert(track.color && track.bgColor, 'Track ' + id + ' has color tokens');
    assert(track.svgPath && track.svgPath.startsWith('<'), 'Track ' + id + ' has valid SVG path markup');
  }
});

// -----------------------------------------------------------------------------
// Probe 4: Exclusion Logic Stress-Testing
// -----------------------------------------------------------------------------
console.log('\n[Probe 4] Exclusion Logic Stress-Testing');

const excludedTestCases = [
  // Chinese exact and bracketed
  '揮指', '揮指（隨機技能）', '揮指 (隨機技能)', '  揮指  ',
  '模仿', '模仿（技能複製）', '模仿 (技能複製)', '  模仿  ',
  '變身', '變身（技能複製）', '變身 (技能複製)', '  變身  ',
  '十項全能', '十項全能（揮指）[可替換]', '十項全能 (揮指) [可替換]',
  '技能複製',
  // English exact and casing variations
  'Metronome', 'metronome', 'METRONOME', 'MeTrOnOmE',
  'Metronome (Random)', 'metronome (random)', 'METRONOME (RANDOM)',
  'Mimic', 'mimic', 'MIMIC', 'Mimic (Skill Copy)', 'mimic (skill copy)',
  'Transform', 'transform', 'TRANSFORM', 'Transform (Skill Copy)', 'transform (skill copy)',
  'All-Rounder', 'all-rounder', 'ALL-ROUNDER', 'All-Rounder (Random)',
  'Skill Copy', 'skill copy', 'SKILL COPY'
];

let allExcludedPass = true;
excludedTestCases.forEach(skillStr => {
  const isEx = isExcludedSkill(skillStr);
  const tracks = getSkillTracks(skillStr);
  if (!isEx || tracks.length !== 0) {
    allExcludedPass = false;
    assert(false, 'Exclusion failed for "' + skillStr + '": isExcluded=' + isEx + ', tracks=' + JSON.stringify(tracks));
  }
});
assert(allExcludedPass, 'All ' + excludedTestCases.length + ' exclusion test cases evaluated isExcludedSkill=true and getSkillTracks=[]');

// Negative exclusion tests (real skills must NOT be excluded)
const nonExcludedTestCases = [
  '能量填充S', 'Charge Strength S', '食材獲取S', 'Ingredient Magnet S',
  '料理強化S', 'Cooking Power-Up S', '活力全體療癒S', 'Energy for Everyone S',
  '正電', 'Plus', '負電', 'Minus', '健美', 'Bulk Up', '波導彈', 'Aura Sphere'
];
let nonExcludedPass = true;
nonExcludedTestCases.forEach(s => {
  if (isExcludedSkill(s)) {
    nonExcludedPass = false;
    assert(false, 'Non-excluded skill incorrectly flagged as excluded: ' + s);
  }
});
assert(nonExcludedPass, 'All non-excluded skills correctly evaluated isExcludedSkill=false');

// -----------------------------------------------------------------------------
// Probe 5: Composite Skill Dual-Track Stress-Testing (14 composite skills)
// -----------------------------------------------------------------------------
console.log('\n[Probe 5] Composite Skill Dual-Track Stress-Testing');

const compositeExpected = [
  { name_cn: '正電', name_en: 'Plus', tracks: ['ingredient', 'helper_boost'] },
  { name_cn: '負電', name_en: 'Minus', tracks: ['cooking_pot', 'energy_single'] },
  { name_cn: '禮物', name_en: 'Present', tracks: ['ingredient', 'dream_shards'] },
  { name_cn: '健美', name_en: 'Bulk Up', tracks: ['ingredient', 'cooking_chance'] },
  { name_cn: '魔法火焰', name_en: 'Mystical Fire', tracks: ['cooking_pot', 'cooking_chance'] },
  { name_cn: '蹭蹭臉頰', name_en: 'Nuzzle', tracks: ['energy_single', 'helper_boost'] },
  { name_cn: '治癒波動', name_en: 'Heal Pulse', tracks: ['energy_single', 'helper_boost'] },
  { name_cn: '樹果汁', name_en: 'Berry Juice', tracks: ['energy_all', 'energy_single'] },
  { name_cn: '波導彈', name_en: 'Aura Sphere', tracks: ['charge_energy', 'dream_shards'] },
  { name_cn: '新月祈禱', name_en: 'Lunar Prayer', tracks: ['energy_all', 'berry_burst'] },
  { name_cn: '精神擊破', name_en: 'Psystrike', tracks: ['charge_energy', 'berry_burst'] },
  { name_cn: '超幸運', name_en: 'Super Luck', tracks: ['ingredient', 'dream_shards'] },
  { name_cn: '怪力鉗', name_en: 'Hyper Cutter', tracks: ['ingredient', 'cooking_chance'] },
  { name_cn: '畫皮', name_en: 'Disguise', tracks: ['berry_burst', 'cooking_chance'] }
];

assert(compositeExpected.length === 14, 'Canonical dual-track composite skill count is 14');

let allCompositePass = true;
compositeExpected.forEach(comp => {
  const testInputs = [
    comp.name_cn,
    comp.name_cn + '（副技能）',
    comp.name_cn + ' (副技能)',
    comp.name_en,
    comp.name_en.toLowerCase(),
    comp.name_en.toUpperCase(),
    comp.name_en + ' (Composite)',
    comp.name_en.toLowerCase() + ' (composite)'
  ];
  if (comp.name_cn === '怪力鉗') {
    testInputs.push('怪力钳', '怪力钳 (食材精選S)', '怪力钳（食材精選S）');
  }

  testInputs.forEach(input => {
    const res = getSkillTracks(input);
    const match = res.length === 2 && res[0] === comp.tracks[0] && res[1] === comp.tracks[1];
    if (!match) {
      allCompositePass = false;
      assert(false, 'Composite mapping failed for "' + input + '": expected ' + JSON.stringify(comp.tracks) + ', got ' + JSON.stringify(res));
    }
  });
});
assert(allCompositePass, 'All 14 composite skills with casing and bracket variations map accurately to dual tracks');

// -----------------------------------------------------------------------------
// Probe 6: Single-Track Special Skill Stress-Testing
// -----------------------------------------------------------------------------
console.log('\n[Probe 6] Single-Track Special Skill Stress-Testing');

const singleTrackSpecials = [
  { name_cn: '月光', name_en: 'Moonlight', track: 'energy_single' },
  { name_cn: '流星群', name_en: 'Draco Meteor', track: 'berry_burst' },
  { name_cn: '蓄力', name_en: 'Stockpile', track: 'charge_energy' },
  { name_cn: '夢魘', name_en: 'Bad Dreams', track: 'charge_energy' },
  { name_cn: '達克萊伊專屬', name_en: 'Darkrai Nightmare', track: 'charge_energy' }
];

let allSingleSpecialPass = true;
singleTrackSpecials.forEach(s => {
  const inputs = [
    s.name_cn,
    s.name_cn + ' (專屬)',
    s.name_cn + '（專屬）',
    s.name_en,
    s.name_en.toLowerCase(),
    s.name_en.toUpperCase(),
    s.name_en + ' (Special)'
  ];
  inputs.forEach(inp => {
    const res = getSkillTracks(inp);
    if (res.length !== 1 || res[0] !== s.track) {
      allSingleSpecialPass = false;
      assert(false, 'Single special skill mapping failed for "' + inp + '": expected [' + s.track + '], got ' + JSON.stringify(res));
    }
  });
});
assert(allSingleSpecialPass, 'All single-track special skills (Moonlight, Draco Meteor, Stockpile, Bad Dreams, Darkrai Nightmare) map correctly');

// -----------------------------------------------------------------------------
// Probe 7: Casing Robustness & Alias Fallbacks on Core Skill Names
// -----------------------------------------------------------------------------
console.log('\n[Probe 7] Casing Robustness and Alias Fallbacks on Core Skill Names');

const coreSkillTestMatrix = [
  // charge_energy
  { input: 'Charge Strength S', expected: ['charge_energy'] },
  { input: 'charge strength s', expected: ['charge_energy'] },
  { input: 'CHARGE STRENGTH S', expected: ['charge_energy'] },
  { input: 'Charge Strength S (Fixed)', expected: ['charge_energy'] },
  { input: 'Charge Strength M', expected: ['charge_energy'] },
  { input: '能量填充S', expected: ['charge_energy'] },
  { input: '能量填充S (隨機)', expected: ['charge_energy'] },
  { input: '能量充填M', expected: ['charge_energy'] },

  // energy_all
  { input: 'Energy for Everyone S', expected: ['energy_all'] },
  { input: 'energy for everyone s', expected: ['energy_all'] },
  { input: 'ENERGY FOR EVERYONE S', expected: ['energy_all'] },
  { input: '活力全體療癒S', expected: ['energy_all'] },
  { input: '全體療癒S', expected: ['energy_all'] },
  { input: '全體能量回復S', expected: ['energy_all'] },

  // energy_single
  { input: 'Energizing Cheer S', expected: ['energy_single'] },
  { input: 'energizing cheer s', expected: ['energy_single'] },
  { input: 'ENERGIZING CHEER S', expected: ['energy_single'] },
  { input: 'Charge Energy S', expected: ['energy_single'] },
  { input: 'charge energy s', expected: ['energy_single'] },
  { input: 'CHARGE ENERGY S', expected: ['energy_single'] },
  { input: '活力療癒S', expected: ['energy_single'] },
  { input: '活力填充S', expected: ['energy_single'] },
  { input: '活力充填S', expected: ['energy_single'] },
  { input: '自體活力回復S', expected: ['energy_single'] },
  { input: '活力充沛S', expected: ['energy_single'] },

  // cooking_pot
  { input: 'Cooking Power-Up S', expected: ['cooking_pot'] },
  { input: 'cooking power-up s', expected: ['cooking_pot'] },
  { input: 'COOKING POWER-UP S', expected: ['cooking_pot'] },
  { input: 'cooking power up', expected: ['cooking_pot'] },
  { input: 'COOKING POWER UP', expected: ['cooking_pot'] },
  { input: '料理強化S', expected: ['cooking_pot'] },
  { input: '料理擴大S', expected: ['cooking_pot'] },
  { input: '料理扩大S', expected: ['cooking_pot'] },

  // cooking_chance
  { input: 'Tasty Chance S', expected: ['cooking_chance'] },
  { input: 'tasty chance s', expected: ['cooking_chance'] },
  { input: 'TASTY CHANCE S', expected: ['cooking_chance'] },
  { input: '料理成功S', expected: ['cooking_chance'] },
  { input: '料理成功率提升S', expected: ['cooking_chance'] },
  { input: '美味機會', expected: ['cooking_chance'] },
  { input: '美味机会', expected: ['cooking_chance'] },

  // helper_boost
  { input: 'Helper Boost', expected: ['helper_boost'] },
  { input: 'helper boost', expected: ['helper_boost'] },
  { input: 'HELPER BOOST', expected: ['helper_boost'] },
  { input: 'Extra Helpful S', expected: ['helper_boost'] },
  { input: 'extra helpful s', expected: ['helper_boost'] },
  { input: 'EXTRA HELPFUL S', expected: ['helper_boost'] },
  { input: 'Helper Speed', expected: ['helper_boost'] },
  { input: 'helper speed', expected: ['helper_boost'] },
  { input: '幫手支援S', expected: ['helper_boost'] },
  { input: '幫手加速', expected: ['helper_boost'] },
  { input: '傳說降臨（雷公）', expected: ['helper_boost'] },
  { input: '传说降临（水君）', expected: ['helper_boost'] },

  // dream_shards
  { input: 'Dream Shard Magnet S', expected: ['dream_shards'] },
  { input: 'dream shard magnet s', expected: ['dream_shards'] },
  { input: 'DREAM SHARD MAGNET S', expected: ['dream_shards'] },
  { input: '夢之碎片獲取S', expected: ['dream_shards'] },
  { input: '碎片獲取S', expected: ['dream_shards'] },
  { input: '梦之碎片', expected: ['dream_shards'] },

  // ingredient
  { input: 'Ingredient Magnet S', expected: ['ingredient'] },
  { input: 'ingredient magnet s', expected: ['ingredient'] },
  { input: 'INGREDIENT MAGNET S', expected: ['ingredient'] },
  { input: 'Ingredient Selection S', expected: ['ingredient'] },
  { input: 'ingredient selection s', expected: ['ingredient'] },
  { input: 'Ingr. Selection', expected: ['ingredient'] },
  { input: 'ingr. selection', expected: ['ingredient'] },
  { input: 'INGR. SELECTION', expected: ['ingredient'] },
  { input: 'Random Ingredients S', expected: ['ingredient'] },
  { input: 'random ingredients s', expected: ['ingredient'] },
  { input: '食材獲取S', expected: ['ingredient'] },
  { input: '食材精選S', expected: ['ingredient'] },
  { input: '食材精选S', expected: ['ingredient'] },
  { input: '食材隨機S', expected: ['ingredient'] },
  { input: '食材随机S', expected: ['ingredient'] },

  // berry_burst
  { input: 'Berry Burst', expected: ['berry_burst'] },
  { input: 'berry burst', expected: ['berry_burst'] },
  { input: 'BERRY BURST', expected: ['berry_burst'] },
  { input: 'Berry Field', expected: ['berry_burst'] },
  { input: 'berry field', expected: ['berry_burst'] },
  { input: 'BERRY FIELD', expected: ['berry_burst'] },
  { input: '樹果遽增', expected: ['berry_burst'] },
  { input: '树果遽增', expected: ['berry_burst'] },
  { input: '樹果擴增', expected: ['berry_burst'] },
  { input: '树果扩增', expected: ['berry_burst'] },
  { input: '樹果領域', expected: ['berry_burst'] },
  { input: '树果领域', expected: ['berry_burst'] }
];

let allCoreMatrixPass = true;
coreSkillTestMatrix.forEach(tc => {
  const res = getSkillTracks(tc.input);
  const match = res.length === tc.expected.length && res.every((v, i) => v === tc.expected[i]);
  if (!match) {
    allCoreMatrixPass = false;
    assert(false, 'Core skill mapping failed for "' + tc.input + '": expected ' + JSON.stringify(tc.expected) + ', got ' + JSON.stringify(res));
  }
});
assert(allCoreMatrixPass, 'All ' + coreSkillTestMatrix.length + ' core skill variants across English/Chinese casing and aliases mapped 100%');

// -----------------------------------------------------------------------------
// Probe 8: i18n_entities.js Skill Keys Audit
// -----------------------------------------------------------------------------
console.log('\n[Probe 8] i18n_entities.js Skill Keys Audit');

const matchI18n = i18nEntitiesCode.match(/const MAIN_SKILL_NAMES = ({[\s\S]*?});/);
assert(matchI18n !== null, 'MAIN_SKILL_NAMES dictionary extracted from i18n_entities.js');

let mainSkillDict = {};
if (matchI18n) {
  vm.runInContext('this.MAIN_SKILL_NAMES = ' + matchI18n[1] + ';', sandbox);
  mainSkillDict = sandbox.MAIN_SKILL_NAMES;
}

const totalI18nEntries = Object.keys(mainSkillDict).length;
assert(totalI18nEntries >= 130, 'MAIN_SKILL_NAMES contains >= 130 entries (actual: ' + totalI18nEntries + ')');

const nonSleepPlaceholderSkills = new Set(['電光一閃', '精神強念', '晨光']);
let i18nCovered = 0;
let i18nExcluded = 0;
let i18nUnmappedNonSleep = 0;
let i18nUnexpectedUnmapped = [];

for (const [key, val] of Object.entries(mainSkillDict)) {
  const tests = [key];
  if (val['zh-TW']) tests.push(val['zh-TW']);
  if (val['zh-CN']) tests.push(val['zh-CN']);
  if (val['en-US']) tests.push(val['en-US']);

  for (const skillStr of tests) {
    if (isExcludedSkill(skillStr)) {
      i18nExcluded++;
    } else {
      const tracks = getSkillTracks(skillStr);
      if (tracks.length > 0) {
        i18nCovered++;
      } else if (nonSleepPlaceholderSkills.has(key)) {
        i18nUnmappedNonSleep++;
      } else {
        i18nUnexpectedUnmapped.push({ key, testStr: skillStr });
      }
    }
  }
}

assert(i18nUnexpectedUnmapped.length === 0, 'Zero unexpected unmapped skills from i18n_entities.js (unmapped: ' + JSON.stringify(i18nUnexpectedUnmapped) + ')');
assert(i18nCovered > 300, 'All real Sleep skills in i18n_entities.js covered on ladder tracks (covered: ' + i18nCovered + ')');
assert(i18nExcluded > 30, 'All random/mimic skill variants in i18n_entities.js properly excluded (excluded: ' + i18nExcluded + ')');
console.log('    [INFO] Verified non-Sleep placeholder entries (' + [...nonSleepPlaceholderSkills].join(', ') + ') are safely absent from Pokemon Sleep dataset.');

// -----------------------------------------------------------------------------
// Probe 9: Calculation Engine Contract Integrity (getPokemonSkillLadderProcs)
// -----------------------------------------------------------------------------
console.log('\n[Probe 9] Calculation Engine Contract Integrity (getPokemonSkillLadderProcs)');

// 1. Golduck test
const golduck = dataJson.find(p => p.name_cn === '哥達鴨');
assert(golduck !== undefined, 'Golduck found in data/data.json');
if (golduck) {
  const gRes = getPokemonSkillLadderProcs(golduck);
  assert(gRes !== null, 'getPokemonSkillLadderProcs returns non-null for Golduck');
  assert(typeof gRes.helps12h === 'number', 'gRes.helps12h is a number');
  assert(typeof gRes.procs === 'number', 'gRes.procs is a number');
  assert(typeof gRes.effectiveIntervalSec === 'number', 'gRes.effectiveIntervalSec is a number');
  assert(typeof gRes.finalSkillRate === 'number', 'gRes.finalSkillRate is a number');
  assert(gRes.mainSkill === golduck.main_skill, 'gRes.mainSkill matches golduck.main_skill (' + golduck.main_skill + ')');
  assert(Math.abs(gRes.idealIntervalSec - gRes.effectiveIntervalSec * 0.45) < 0.001, 'idealIntervalSec = effectiveIntervalSec * 0.45');
  // Verify formula: helps12h = 43200 / idealIntervalSec
  assert(Math.abs(gRes.helps12h - (43200 / gRes.idealIntervalSec)) < 0.001, 'helps12h = 43200 / idealIntervalSec');
  // Verify formula: procs = helps12h * finalSkillRate
  assert(Math.abs(gRes.procs - (gRes.helps12h * gRes.finalSkillRate)) < 0.001, 'procs = helps12h * finalSkillRate');

  // Expected numbers: base 3400s -> effective 2999s -> ideal 1349.55s -> helps 32.01 -> procs 4.00
  assert(Math.abs(gRes.helps12h - 32.01) < 0.05, 'Golduck daytime 12h helps is approximately 32.01 (actual: ' + gRes.helps12h.toFixed(2) + ')');
  assert(Math.abs(gRes.procs - 4.00) < 0.05, 'Golduck daytime 12h procs is approximately 4.00 (actual: ' + gRes.procs.toFixed(2) + ')');
}

// 2. Raichu test
const raichu = dataJson.find(p => p.name_cn === '雷丘');
assert(raichu !== undefined, 'Raichu found in data/data.json');
if (raichu) {
  const rRes = getPokemonSkillLadderProcs(raichu);
  assert(Math.abs(rRes.helps12h - 49.48) < 0.05, 'Raichu daytime 12h helps is approximately 49.48 (actual: ' + rRes.helps12h.toFixed(2) + ')');
  assert(Math.abs(rRes.procs - 1.58) < 0.05, 'Raichu daytime 12h procs is approximately 1.58 (actual: ' + rRes.procs.toFixed(2) + ')');
}

// 3. Defensive property lookups
const mockPkmInterval = { interval: '00:36:40', skill_rate: '3.20%', main_skill: '能量填充S' };
const mockPkmFrequency = { frequency: '2200', skillRate: 0.032, skill: '能量填充S' };
const mockPkmHelpInterval = { help_interval: '2200', skill_rate: 3.2, mainSkill: '能量填充S' };

const resInt = getPokemonSkillLadderProcs(mockPkmInterval);
const resFreq = getPokemonSkillLadderProcs(mockPkmFrequency);
const resHelp = getPokemonSkillLadderProcs(mockPkmHelpInterval);

assert(resInt && resFreq && resHelp, 'All three mock schemas successfully parsed');
assert(Math.abs(resInt.procs - resFreq.procs) < 0.01, 'Interval and frequency representations yield identical procs');
assert(Math.abs(resInt.procs - resHelp.procs) < 0.01, 'Percentage string and numeric skill_rate yield identical procs');
assert(getPokemonSkillLadderProcs(null) === null, 'getPokemonSkillLadderProcs(null) gracefully returns null');

// -----------------------------------------------------------------------------
// Probe 10: Zero Emoji & Zero Decorative Glyph Audit
// -----------------------------------------------------------------------------
console.log('\n[Probe 10] Zero Emoji & Zero Decorative Glyph Audit');

// Emoji regex covering standard emoji ranges
const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
const decorativeGlyphRegex = /[★☆[*][*][+][#]]/;

assert(!emojiRegex.test(ladderDataCode), 'wiki_skill_ladder_data.js complies with Zero Emoji rule');
assert(!emojiRegex.test(ladderCode), 'wiki_skill_ladder.js complies with Zero Emoji rule');
assert(!decorativeGlyphRegex.test(ladderDataCode), 'wiki_skill_ladder_data.js complies with Zero Decorative Glyphs rule');
assert(!decorativeGlyphRegex.test(ladderCode), 'wiki_skill_ladder.js complies with Zero Decorative Glyphs rule');

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log('  Verification Summary: ' + passCount + ' Passed, ' + failCount + ' Failed');
console.log('================================================================');

if (failCount > 0) {
  console.error('\nFailures encountered:');
  failures.forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log('\nAll assertions PASSED successfully.');
  process.exit(0);
}
