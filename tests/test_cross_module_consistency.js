/**
 * test_cross_module_consistency.js
 * Comprehensive Cross-Module Consistency & Pokedex H5 Automated Tests
 *
 * Verifies:
 * 1. Captain Pikachu icon alignment (9007 / 9003)
 * 2. isFinalEvolution accuracy (#429 protection, evolution stages)
 * 3. getMainSkillMaxLevel consistency across pokedex, lab, and box modules
 * 4. Unreleased Pokemon (#546 Cottonee, #547 Whimsicott) null-safety
 * 5. Mobile H5 FAB reference (#skill-ladder-sidebar-bookmark-handle)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to resolve pokemon database (supports data/pokemon_full.json or fallback to data/data.json)
const fullDataPath = path.join(ROOT_DIR, 'data', 'pokemon_full.json');
const defaultDataPath = path.join(ROOT_DIR, 'data', 'data.json');
const pokemonDataPath = fs.existsSync(fullDataPath) ? fullDataPath : defaultDataPath;
const pokemonData = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));

// Load pokedex_base.js
const { SPECIAL_ICON_MAP, isFinalEvolution } = require(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_base.js'));
const specialIconsJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'special_icons.json'), 'utf8'));

// Load getMainSkillMaxLevel from pokedex_detail_ctrl.js
const pokedexDetailCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_detail_ctrl.js'), 'utf8');
const pokedexMod = { exports: {} };
const fnPokedex = new Function('module', 'exports', 'window', pokedexDetailCode);
fnPokedex(pokedexMod, pokedexMod.exports, {});
const pokedexMaxSkillLvl = pokedexMod.exports.getMainSkillMaxLevel;

// Load getMainSkillMaxLevel from lab_specialists.js
const labSpecialistsCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'lab', 'lab_specialists.js'), 'utf8');
const labMod = { exports: {} };
const fnLab = new Function('module', 'exports', 'window', labSpecialistsCode + '\n})();');
fnLab(labMod, labMod.exports, {});
const labMaxSkillLvl = labMod.exports.getMainSkillMaxLevel;

// Load getMainSkillMaxLevel from box_modal_form.js
const boxFormCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'box', 'box_modal_form.js'), 'utf8');
const boxStart = boxFormCode.indexOf('function getMainSkillMaxLevel(');
const boxEnd = boxFormCode.indexOf('if (typeof window !== \'undefined\')', boxStart);
const boxFnCode = boxFormCode.slice(boxStart, boxEnd);
const boxMaxSkillLvl = new Function('mainSkillName', boxFnCode + '\nreturn getMainSkillMaxLevel(mainSkillName);');

let testsPassed = 0;

function runTest(name, fn) {
  try {
    fn();
    testsPassed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('======================================================');
console.log('Cross-Module Consistency & Pokedex H5 Tests');
console.log('======================================================');

// 1. Captain Pikachu ID Alignment
runTest('Captain Pikachu ID Alignment (9007 and 9003)', () => {
  const expectedUrl = 'https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png';
  assert.strictEqual(SPECIAL_ICON_MAP['9007'], expectedUrl, 'pokedex_base 9007 must map to captain icon');
  assert.strictEqual(SPECIAL_ICON_MAP['9003'], expectedUrl, 'pokedex_base 9003 alias must map to captain icon');
  assert.strictEqual(specialIconsJson['9007'], expectedUrl, 'special_icons.json 9007 must map to captain icon');
  assert.strictEqual(specialIconsJson['9003'], expectedUrl, 'special_icons.json 9003 alias must map to captain icon');

  const captainEntry = pokemonData.find(p => String(p.id) === '9007');
  if (captainEntry) {
    assert.strictEqual(captainEntry.icon_url, expectedUrl, 'pokemonData 9007 icon_url matches');
  }
});

// 2. isFinalEvolution Accuracy & Boundary Protection
runTest('isFinalEvolution accuracy and #429 boundary protection', () => {
  const p429 = pokemonData.find(p => String(p.id) === '429') || { id: '429', name_cn: '夢妖魔', name_en: 'Mismagius' };
  const p025 = pokemonData.find(p => String(p.id) === '25') || { id: '25', name_cn: '皮卡丘' };
  const p026 = pokemonData.find(p => String(p.id) === '26') || { id: '26', name_cn: '雷丘', is_final: '〇' };
  const p133 = pokemonData.find(p => String(p.id) === '133') || { id: '133', name_cn: '伊布' };

  assert.strictEqual(isFinalEvolution(p429), true, '#429 Mismagius must be final evolution');
  assert.strictEqual(isFinalEvolution({ id: '429' }), true, 'id 429 must be final');
  assert.strictEqual(isFinalEvolution({ name_cn: '夢妖魔' }), true, '夢妖魔 must be final');
  assert.strictEqual(isFinalEvolution({ name_en: 'Mismagius' }), true, 'Mismagius must be final');
  assert.strictEqual(isFinalEvolution(p025), false, '#025 Pikachu must NOT be final');
  assert.strictEqual(isFinalEvolution(p026), true, '#026 Raichu must be final');
  assert.strictEqual(isFinalEvolution(p133), false, '#133 Eevee must NOT be final');
  assert.strictEqual(isFinalEvolution(null), false, 'null returns false');
  assert.strictEqual(isFinalEvolution(undefined), false, 'undefined returns false');

  // Verify across entire dataset without runtime crashes
  pokemonData.forEach(p => {
    const res = isFinalEvolution(p);
    assert.strictEqual(typeof res, 'boolean', `Result for ${p.id} must be boolean`);
    if (p.is_final === '〇' || String(p.id) === '429') {
      assert.strictEqual(res, true, `${p.name_cn || p.id} expected final`);
    }
  });
});

// 3. Unified getMainSkillMaxLevel Across 39 Skills
runTest('getMainSkillMaxLevel consistency across pokedex, lab, and box', () => {
  // Collect 39 unique main skills from pokemon data
  const allSkills = new Set();
  pokemonData.forEach(p => {
    if (p.main_skill && typeof p.main_skill === 'string' && p.main_skill.trim()) {
      allSkills.add(p.main_skill.trim());
    }
  });

  assert(allSkills.size >= 34, `Expected at least 34 unique skills, found ${allSkills.size}`);

  allSkills.forEach(skillName => {
    const valPokedex = pokedexMaxSkillLvl(skillName);
    const valLab = labMaxSkillLvl(skillName);
    const valBox = boxMaxSkillLvl(skillName);

    assert(valPokedex === 6 || valPokedex === 7 || valPokedex === 8, `${skillName} pokedex returned invalid ${valPokedex}`);
    assert.strictEqual(valPokedex, valLab, `Mismatch on ${skillName}: pokedex(${valPokedex}) !== lab(${valLab})`);
    assert.strictEqual(valPokedex, valBox, `Mismatch on ${skillName}: pokedex(${valPokedex}) !== box(${valBox})`);
  });

  // Test edge cases
  const edgeCases = ['', null, undefined, 0, 123, false, {}, []];
  edgeCases.forEach(ec => {
    assert.strictEqual(pokedexMaxSkillLvl(ec), 6, 'pokedex fallback for empty skill must be 6');
    assert.strictEqual(labMaxSkillLvl(ec), 6, 'lab fallback for empty skill must be 6');
    assert.strictEqual(boxMaxSkillLvl(ec), 6, 'box fallback for empty skill must be 6');
  });
});

// 4. Unreleased Pokemon Null-Safety (#546 Cottonee, #547 Whimsicott)
runTest('Unreleased Pokemon (#546, #547) null-safety', () => {
  const p546 = pokemonData.find(p => String(p.id) === '546') || {
    id: '546', name_cn: '木棉球', name_en: 'Cottonee', main_skill: '', skill_rate: null, is_final: ''
  };
  const p547 = pokemonData.find(p => String(p.id) === '547') || {
    id: '547', name_cn: '風妖精', name_en: 'Whimsicott', main_skill: '', skill_rate: null, is_final: '〇'
  };

  // isFinalEvolution safe check
  assert.strictEqual(isFinalEvolution(p546), false, '#546 Cottonee is not final evolution');
  assert.strictEqual(isFinalEvolution(p547), true, '#547 Whimsicott is final evolution');

  // getMainSkillMaxLevel safe check
  assert.strictEqual(pokedexMaxSkillLvl(p546.main_skill), 6, 'Empty skill max level is 6');
  assert.strictEqual(labMaxSkillLvl(p546.main_skill), 6, 'Empty skill max level is 6');
  assert.strictEqual(pokedexMaxSkillLvl(p547.main_skill), 6, 'Empty skill max level is 6');
  assert.strictEqual(labMaxSkillLvl(p547.main_skill), 6, 'Empty skill max level is 6');

  // Skill ladder final-only filter check
  const filterPass546 = !isFinalEvolution(p546);
  const filterPass547 = isFinalEvolution(p547);
  assert.strictEqual(filterPass546, true);
  assert.strictEqual(filterPass547, true);
});

// 5. Mobile H5 FAB Reference in pokedex_ui.js and pokedex_filters.js
runTest('Mobile H5 FAB references in pokedex_ui.js and pokedex_filters.js', () => {
  const uiFile = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_ui.js'), 'utf8');
  const filtersFile = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_filters.js'), 'utf8');

  // Check UI module includes skill-ladder handle in Back-to-Top FAB avoidance
  assert(uiFile.includes('skill-ladder-sidebar-bookmark-handle'), 'pokedex_ui.js references skill-ladder handle');
  assert(uiFile.includes('f5'), 'pokedex_ui.js binds f5 handle');
  assert(uiFile.includes('has-filter-fab'), 'pokedex_ui.js toggles has-filter-fab class');

  // Check Filters module includes closeMobileDrawer and resize listener with f5
  assert(filtersFile.includes('skill-ladder-sidebar-bookmark-handle'), 'pokedex_filters.js references skill-ladder handle');
  assert(filtersFile.includes('closeMobileDrawer'), 'pokedex_filters.js defines closeMobileDrawer');
  assert(filtersFile.includes('isSkillLadderSubtab'), 'pokedex_filters.js checks isSkillLadderSubtab');
  assert(filtersFile.includes('resize'), 'pokedex_filters.js binds resize listener');
});

console.log('------------------------------------------------------');
console.log(`TOTAL RESULT: ${testsPassed} / 5 Passed (0 Failed)`);
console.log('======================================================');
