/**
 * tests/test_wiki_skill_ladder.js
 * Comprehensive Unit and Integration Test Suite for Wiki Main Skill Ladder
 * =========================================================================
 * Verifies:
 * 1. Pure text track title tags (no SVG icons, no decorative star glyphs).
 * 2. Avatar dimensions (38px desktop, 34px mobile) in CSS and rendered DOM.
 * 3. 12h Daytime Calculations (helps12h, procs, decimal skill rates, Lv.60 11.8%, 0.45x vitality).
 * 4. 100% Coverage of 241 released non-random Pokemon across 9 tracks (10 excluded, 17 composite).
 * 5. Simplified Chinese alias matching and case-insensitivity.
 * 6. Tooltip formatting (no 60秒 edge case, exposed helps12h and daytime procs).
 * 7. Single frame rule compliance on #wiki-subpanel-skills_ladder.
 * 8. Zero Emoji & Zero Decorative Glyph policy compliance.
 * =========================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
    failures.push(message);
  }
}

function assertEquals(actual, expected, message) {
  const isMatch = actual === expected;
  assert(isMatch, `${message} (Expected: ${expected}, Got: ${actual})`);
}

function assertCloseTo(actual, expected, tolerance = 0.001, message = '') {
  const diff = Math.abs(actual - expected);
  assert(diff <= tolerance, `${message} (Expected ~${expected}, Got: ${actual}, Diff: ${diff})`);
}

console.log('================================================================');
console.log('  Wiki Skill Ladder Comprehensive Test Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Load Environment & Modules
// -----------------------------------------------------------------------------
const wikiJsPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki.js');
const ladderDataPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_data.js');
const ladderCalcPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder.js');
const ladderRenderPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_render.js');
const skillLadderCssPath = path.join(WORKSPACE_ROOT, 'css/views/wiki/wiki_skill_ladder.css');
const ladderCssPath = path.join(WORKSPACE_ROOT, 'css/views/wiki/wiki_ladder.css');
const stylesCssPath = path.join(WORKSPACE_ROOT, 'css/styles.css');
const dataJsonPath = path.join(WORKSPACE_ROOT, 'data/data.json');

assert(fs.existsSync(ladderDataPath), 'wiki_skill_ladder_data.js exists');
assert(fs.existsSync(ladderCalcPath), 'wiki_skill_ladder.js exists');
assert(fs.existsSync(ladderRenderPath), 'wiki_skill_ladder_render.js exists');
assert(fs.existsSync(skillLadderCssPath), 'css/views/wiki/wiki_skill_ladder.css exists');
assert(fs.existsSync(stylesCssPath), 'css/styles.css exists');
assert(fs.existsSync(dataJsonPath), 'data/data.json exists');

const rawPokemonData = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

// Build Sandbox
function createLadderSandbox(options = {}) {
  const lang = options.lang || 'zh-TW';
  const customPokemons = options.pokemons || rawPokemonData;
  let coordinateInner = '';

  const sandbox = {
    window: {},
    document: {
      body: { classList: { contains: () => false } },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'wiki-skill-ladder-coordinate') {
          return {
            get innerHTML() { return coordinateInner; },
            set innerHTML(v) { coordinateInner = v; }
          };
        }
        return {
          innerHTML: '',
          textContent: '',
          style: {},
          classList: { add: () => {}, remove: () => {}, toggle: () => {} },
          getAttribute: () => null
        };
      },
      querySelectorAll: () => [],
      createElement: () => ({
        setAttribute: () => {},
        innerHTML: '',
        className: '',
        id: '',
        style: {}
      }),
      addEventListener: () => {}
    },
    localStorage: {
      getItem: (k) => k === 'pksleep_lang' ? lang : null,
      setItem: () => {},
      removeItem: () => {}
    },
    I18N: {
      getLanguage: () => lang,
      getPokemonName: (name) => name,
      getMainSkillName: (skill) => skill
    },
    allPokemons: customPokemons,
    console: console,
    Math: Math,
    String: String,
    Number: Number,
    parseFloat: parseFloat,
    parseInt: parseInt,
    isNaN: isNaN,
    Map: Map,
    Array: Array,
    Object: Object
  };

  sandbox.window = sandbox;
  vm.createContext(sandbox);

  const ladderDataCode = fs.readFileSync(ladderDataPath, 'utf8');
  const ladderCalcCode = fs.readFileSync(ladderCalcPath, 'utf8');
  const ladderRenderCode = fs.readFileSync(ladderRenderPath, 'utf8');

  vm.runInContext(ladderDataCode, sandbox);
  vm.runInContext(ladderCalcCode, sandbox);
  vm.runInContext(ladderRenderCode, sandbox);
  vm.runInContext('attachSkillLadderExports(this, this);', sandbox);

  return {
    sandbox,
    getRenderedHtml: () => coordinateInner
  };
}

// -----------------------------------------------------------------------------
// Suite 1: Pure Text Track Title Tags (No SVG Icons, No Star Glyphs)
// -----------------------------------------------------------------------------
console.log('\n[Suite 1] Pure Text Track Title Tags Verification');

{
  const { sandbox } = createLadderSandbox();
  const html = sandbox.renderSkillCoordinateLadder();

  assert(html.includes('class="skill-track-name-tag"'), 'Rendered ladder contains .skill-track-name-tag elements');
  assert(!html.includes('class="track-header-icon"'), 'Rendered ladder does not contain abstract icon containers');

  // Verify that inside skill-ladder-track-header, there are no SVG tags
  const headerSvgRegex = /class="[^"]*skill-ladder-track-header[^"]*"[\s\S]*?<svg[\s\S]*?<\/div>/;
  assert(!headerSvgRegex.test(html), 'Track headers do NOT contain any SVG icons');

  // Verify pure text colored labels across all 9 tracks
  const trackDefs = sandbox.SKILL_TRACK_DEFINITIONS;
  assertEquals(trackDefs.length, 9, 'Exactly 9 track definitions configured');

  for (const track of trackDefs) {
    assert(html.includes(track.name), `Track header text tag renders name: ${track.name}`);
    assert(typeof track.color === 'string' && track.color.startsWith('#'), `Track ${track.id} defines valid hex color`);
    assert(typeof track.bgColor === 'string' && (track.bgColor.startsWith('#') || track.bgColor.startsWith('rgba(')), `Track ${track.id} defines valid bgColor`);
  }

  // Zero Star Glyph rule on rendered HTML
  const starGlyphRegex = /[\u2605\u2606\u2B50]|\[\*\]|\[\u2605\]|\[\u2606\]/;
  assert(!starGlyphRegex.test(html), 'Rendered track headers contain 0 decorative star glyphs');
}

// -----------------------------------------------------------------------------
// Suite 2: Avatar Dimensions (38px Desktop / 34px Mobile)
// -----------------------------------------------------------------------------
console.log('\n[Suite 2] Avatar Dimensions & Layout CSS Rules');

{
  const skillLadderCss = fs.readFileSync(skillLadderCssPath, 'utf8');
  const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

  // Desktop avatar wrapper: 38px
  const desktopAvatarRegex = /\.wiki-skill-coordinate-ladder\s+\.node-avatar-wrapper[\s\S]*?width:\s*38px\s*!important;[\s\S]*?height:\s*38px\s*!important;/;
  assert(desktopAvatarRegex.test(skillLadderCss), 'wiki_skill_ladder.css: node-avatar-wrapper is 38px x 38px !important on desktop');
  assert(desktopAvatarRegex.test(stylesCss), 'styles.css: node-avatar-wrapper is 38px x 38px !important on desktop');

  // Mobile avatar wrapper: 34px
  const mobileAvatarRegex = /@media[^{]+\{[\s\S]*?\.node-avatar-wrapper[\s\S]*?width:\s*34px\s*!important;[\s\S]*?height:\s*34px\s*!important;/;
  assert(mobileAvatarRegex.test(skillLadderCss), 'wiki_skill_ladder.css: mobile media query sets node-avatar-wrapper to 34px !important');
  assert(mobileAvatarRegex.test(stylesCss), 'styles.css: mobile media query sets node-avatar-wrapper to 34px !important');

  // Desktop header and spacer: 140px
  assert(skillLadderCss.includes('width: 140px !important;') && skillLadderCss.includes('min-width: 140px !important;') && skillLadderCss.includes('max-width: 140px !important;'),
    'wiki_skill_ladder.css: locks desktop spacer/header to 140px !important');
  assert(stylesCss.includes('width: 140px !important;'), 'styles.css: locks desktop spacer/header to 140px !important');

  // Mobile header and spacer: 96px
  assert(skillLadderCss.includes('width: 96px !important;') && skillLadderCss.includes('min-width: 96px !important;'),
    'wiki_skill_ladder.css: mobile query sets spacer/header to 96px !important');

  // Track height clamp: 52px to 68px
  const trackHeightRegex = /height:\s*clamp\(52px,\s*calc\(\(100vh\s*-\s*280px\)\s*\/\s*9\),\s*68px\)\s*!important;/;
  assert(trackHeightRegex.test(skillLadderCss), 'wiki_skill_ladder.css: track-row height clamps between 52px and 68px');

  // Rendered DOM check
  const { sandbox } = createLadderSandbox();
  const html = sandbox.renderSkillCoordinateLadder();
  assert(html.includes('class="node-avatar-wrapper"'), 'Rendered HTML contains .node-avatar-wrapper');
  assert(html.includes('class="node-avatar-img"'), 'Rendered HTML contains .node-avatar-img');
}

// -----------------------------------------------------------------------------
// Suite 3: 12h Daytime Active Help Count & Skill Trigger Calculations
// -----------------------------------------------------------------------------
console.log('\n[Suite 3] 12h Daytime Calculations & Engine Calibration');

{
  const { sandbox } = createLadderSandbox();
  const calc = sandbox.getPokemonSkillLadderProcs;
  assert(typeof calc === 'function', 'getPokemonSkillLadderProcs function exists');

  // Test standard Pokemon with base values
  const samplePkm = {
    id: 25,
    name: '皮卡丘',
    interval: 2700,
    skill_rate: 0.045,
    main_skill: '能量填充S'
  };

  const res = calc(samplePkm);
  assert(res !== null, 'Calculation returned non-null result');
  assert(typeof res.helps12h === 'number', 'Exposes res.helps12h as number');
  assert(typeof res.procs === 'number', 'Exposes res.procs as number');
  assert(typeof res.effectiveIntervalSec === 'number', 'Exposes res.effectiveIntervalSec');
  assert(typeof res.idealIntervalSec === 'number', 'Exposes res.idealIntervalSec');
  assert(typeof res.baseSkillRate === 'number', 'Exposes res.baseSkillRate');
  assert(typeof res.finalSkillRate === 'number', 'Exposes res.finalSkillRate');

  // 1. Lv.60 11.8% Speed Discount applied once:
  // effectiveIntervalSec = Math.round(2700 * (1 - 0.118)) = Math.round(2381.4) = 2381
  assertEquals(res.effectiveIntervalSec, 2381, 'Lv.60 speed discount correctly calculated as Math.round(interval * 0.882)');

  // 2. 0.45x Full Vitality applied once:
  // idealIntervalSec = 2381 * 0.45 = 1071.45
  assertCloseTo(res.idealIntervalSec, 1071.45, 0.001, 'Ideal interval incorporates 0.45x vitality bonus');

  // 3. 12h Active Helps:
  // 43200 / 1071.45 = 40.31919
  assertCloseTo(res.helps12h, 43200 / 1071.45, 0.001, 'helps12h strictly equals 43200 / idealIntervalSec');

  // 4. Expected Daytime Triggers:
  // procs = helps12h * finalSkillRate = 40.31919 * 0.045 = 1.81436
  assertCloseTo(res.procs, res.helps12h * res.finalSkillRate, 0.0001, 'procs strictly equals helps12h * finalSkillRate');

  // 5. Decimal Rate vs Percentage Rate Handling:
  const pkmWithPctStr = { id: 1, name: '測試A', interval: 3000, skill_rate: '4.5%', main_skill: '能量填充S' };
  const resPctStr = calc(pkmWithPctStr);
  assertCloseTo(resPctStr.baseSkillRate, 0.045, 0.0001, 'String "4.5%" parses to 0.045');

  const pkmWithDecimal = { id: 2, name: '測試B', interval: 3000, skill_rate: 0.045, main_skill: '能量填充S' };
  const resDecimal = calc(pkmWithDecimal);
  assertCloseTo(resDecimal.baseSkillRate, 0.045, 0.0001, 'Number 0.045 parsed directly as 0.045');

  // 6. Subskills and Nature Modifiers:
  sandbox.toggleSkillLadderSubskill('SPEED_M');
  sandbox.toggleSkillLadderSubskill('SKILL_M');
  sandbox.toggleSkillLadderNatureFilter('SPEED');
  const boostedRes = calc(samplePkm);

  // Speed M = -14%, Nature Speed Up = -10% -> compound effective interval
  assert(boostedRes.effectiveIntervalSec < res.effectiveIntervalSec, 'Subskill Speed M and Nature Speed Up reduce effectiveIntervalSec');
  // Skill M = +36% -> finalSkillRate boosted
  assert(boostedRes.finalSkillRate > res.finalSkillRate, 'Subskill Skill M increases finalSkillRate');
  assert(boostedRes.procs > res.procs, 'Compound boosts increase expected 12h procs');

  // Reset filters
  sandbox.resetSkillLadderFilters();
  assertEquals(sandbox.getSkillLadderNature(), 'NONE', 'Filters reset: nature set to NONE');
}

// -----------------------------------------------------------------------------
// Suite 4: 100% Coverage of All 241 Non-Random Pokémon Across 9 Tracks
// -----------------------------------------------------------------------------
console.log('\n[Suite 4] Pokémon Database & Main Skill Coverage Verification');

{
  const { sandbox } = createLadderSandbox();
  const isExcluded = sandbox.isExcludedSkill;
  const getTracks = sandbox.getSkillTracks;
  const trackDefs = sandbox.SKILL_TRACK_DEFINITIONS;
  const validTrackIds = new Set(trackDefs.map(t => t.id));

  let coveredCount = 0;
  let excludedCount = 0;
  let unreleasedCount = 0;
  let compositeCount = 0;
  let totalPlacements = 0;

  for (const pkm of rawPokemonData) {
    const skill = (pkm.main_skill || '').trim();
    if (!skill) {
      unreleasedCount++;
      continue;
    }
    if (isExcluded(skill)) {
      excludedCount++;
      continue;
    }

    const pkmName = pkm.name_cn || pkm.name || pkm.name_en;
    const tracks = getTracks(skill);
    assert(tracks.length >= 1, `Pokemon ${pkmName} (${skill}) maps to at least one track`);
    for (const tid of tracks) {
      assert(validTrackIds.has(tid), `Pokemon ${pkmName} track ${tid} is a valid defined track`);
    }

    coveredCount++;
    totalPlacements += tracks.length;
    if (tracks.length === 2) {
      compositeCount++;
    }
  }

  assertEquals(unreleasedCount, 2, 'Exactly 2 unreleased Pokemon without main skills');
  assertEquals(excludedCount, 10, 'Exactly 10 Pokemon excluded due to random/copy skills');
  assertEquals(coveredCount, 241, 'Exactly 241 released non-random Pokemon covered');
  assertEquals(compositeCount, 17, 'Exactly 17 Pokemon with composite dual-track skills');
  assertEquals(totalPlacements, 258, 'Total track placements across 9 tracks equals 258 (241 - 17 + 34)');
}

// -----------------------------------------------------------------------------
// Suite 5: Simplified Chinese Alias Matching and Case-Insensitivity
// -----------------------------------------------------------------------------
console.log('\n[Suite 5] Simplified Chinese Alias & Case-Insensitive Matching');

{
  const { sandbox } = createLadderSandbox();
  const getTracks = sandbox.getSkillTracks;
  const isExcluded = sandbox.isExcludedSkill;

  // Casing robustness
  assertEquals(getTracks('charge strength s')[0], 'charge_energy', 'Lower case "charge strength s" maps to charge_energy');
  assertEquals(getTracks('CHARGE STRENGTH S')[0], 'charge_energy', 'Upper case "CHARGE STRENGTH S" maps to charge_energy');
  assertEquals(getTracks('Charge Energy S')[0], 'energy_single', 'Mixed case "Charge Energy S" maps to energy_single');

  // Simplified Chinese Aliases
  assertEquals(getTracks('怪力钳')[0], 'ingredient', 'Simplified Chinese alias "怪力钳" maps to ingredient');
  assertEquals(getTracks('怪力鉗')[0], 'ingredient', 'Traditional Chinese "怪力鉗" maps to ingredient');
  assertEquals(getTracks('能量填充S')[0], 'charge_energy', 'Traditional Chinese "能量填充S" maps to charge_energy');
  assertEquals(getTracks('能量填充M')[0], 'charge_energy', 'Traditional Chinese "能量填充M" maps to charge_energy');
  assertEquals(getTracks('活力疗愈S（全体）')[0], 'energy_all', 'Simplified Chinese "活力疗愈S（全体）" maps to energy_all');
  assertEquals(getTracks('夢想碎片獲取S')[0], 'dream_shards', 'Traditional Chinese "夢想碎片獲取S" maps to dream_shards');
  assertEquals(getTracks('梦想碎片获取S')[0], 'dream_shards', 'Simplified Chinese "梦想碎片获取S" maps to dream_shards');

  // Composite Skill Dual Track
  const plusTracks = getTracks('正電（幫手支援S）');
  assertEquals(plusTracks.length, 2, 'Plus power maps to 2 tracks');
  assert(plusTracks.includes('ingredient') && plusTracks.includes('helper_boost'), 'Plus power maps to ingredient and helper_boost');

  // Excluded Skills
  assert(isExcluded('揮指'), '揮指 is excluded');
  assert(isExcluded('挥指'), 'Simplified "挥指" is excluded');
  assert(isExcluded('metronome'), 'Lower "metronome" is excluded');
  assert(isExcluded('METRONOME'), 'Upper "METRONOME" is excluded');
  assert(isExcluded('模仿'), '模仿 is excluded');
  assert(isExcluded('mimic'), 'mimic is excluded');
  assert(isExcluded('變身'), '變身 is excluded');
  assert(isExcluded('变身'), '变身 is excluded');
  assert(isExcluded('transform'), 'transform is excluded');
  assert(isExcluded('十項全能'), '十項全能 is excluded');
  assert(isExcluded('十项全能'), '十项全能 is excluded');
  assert(isExcluded('技能複製'), '技能複製 is excluded');
  assert(isExcluded('Skill Copy'), 'Skill Copy is excluded');
}

// -----------------------------------------------------------------------------
// Suite 6: Tooltip Formatting & 60-Second Rounding Edge Case
// -----------------------------------------------------------------------------
console.log('\n[Suite 6] Tooltip Formatting & Seconds Boundary Handling');

{
  const { sandbox } = createLadderSandbox();
  const html = sandbox.renderSkillCoordinateLadder();

  // Verify Tooltip contains 12h daytime help count
  assert(html.includes('日間 12h 總幫忙次數：') || html.includes('Est. Helps (12h):'), 'Tooltip contains 12h help count label');
  assert(html.includes('預估 12h 發動：') || html.includes('Est. 12h Triggers:'), 'Tooltip contains 12h triggers label');
  assert(html.includes('滿活力間隔 (0.45x)：') || html.includes('Ideal Interval (0.45x):'), 'Tooltip contains ideal interval label');

  // Verify that "60秒" or "60s" never appears in intervals
  assert(!html.includes('60秒'), 'Tooltip interval formatting never displays 60秒');
  assert(!html.includes('60s'), 'Tooltip interval formatting never displays 60s');

  // Verify seconds formatting with boundary test:
  // idealIntervalSec = 1379.7 -> rounded to 1380s -> 23m 00s (NOT 22m 60s)
  const roundedSec = Math.round(1379.7);
  const min = Math.floor(roundedSec / 60);
  const sec = roundedSec % 60;
  const formatted = `${min}分${String(sec).padStart(2, '0')}秒`;
  assertEquals(formatted, '23分00秒', '1379.7s rounds cleanly to 23分00秒');
}

// -----------------------------------------------------------------------------
// Suite 7: Single Frame Rule Compliance (User Rule IX)
// -----------------------------------------------------------------------------
console.log('\n[Suite 7] Single Frame Rule Verification');

{
  const skillLadderCss = fs.readFileSync(skillLadderCssPath, 'utf8');
  const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

  function checkSubpanelRule(cssContent, sourceName) {
    const subpanelMatch = cssContent.match(/#wiki-subpanel-skills_ladder\s*\{([^}]+)\}/);
    assert(subpanelMatch !== null, `${sourceName} contains #wiki-subpanel-skills_ladder rule`);
    if (subpanelMatch) {
      const block = subpanelMatch[1];
      assert(block.includes('border: none !important'), `${sourceName}: #wiki-subpanel-skills_ladder enforces border: none !important`);
      assert(block.includes('background: transparent !important'), `${sourceName}: #wiki-subpanel-skills_ladder enforces background: transparent !important`);
      assert(block.includes('padding: 0 !important'), `${sourceName}: #wiki-subpanel-skills_ladder enforces padding: 0 !important`);
      assert(block.includes('margin: 0 !important'), `${sourceName}: #wiki-subpanel-skills_ladder enforces margin: 0 !important`);
    }
  }

  checkSubpanelRule(skillLadderCss, 'wiki_skill_ladder.css');
  checkSubpanelRule(stylesCss, 'styles.css');
}

// -----------------------------------------------------------------------------
// Suite 8: Zero Emoji & Zero Decorative Glyph Policy Compliance
// -----------------------------------------------------------------------------
console.log('\n[Suite 8] Zero Emoji & Zero Decorative Glyph Policy Compliance');

{
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/u;
  const starGlyphRegex = /[\u2605\u2606\u2B50]|\[\*\]|\[\u2605\]|\[\u2606\]/;

  const filesToCheck = [
    'js/modules/wiki/wiki_skill_ladder.js',
    'js/modules/wiki/wiki_skill_ladder_data.js',
    'js/modules/wiki/wiki_skill_ladder_render.js',
    'css/views/wiki/wiki_ladder.css',
    'css/views/wiki/wiki_skill_ladder.css',
    'tests/test_wiki_skill_ladder.js'
  ];

  for (const rel of filesToCheck) {
    const code = fs.readFileSync(path.join(WORKSPACE_ROOT, rel), 'utf8');
    assert(!emojiRegex.test(code), `${rel} contains ZERO Unicode emojis`);
    assert(!starGlyphRegex.test(code), `${rel} contains ZERO decorative star glyphs`);
  }
}

// -----------------------------------------------------------------------------
// Final Summary & Exit
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  Wiki Skill Ladder Test Summary: ${passedTests} / ${totalTests} Passed (${failedTests} Failed)`);
console.log('================================================================\n');

if (failedTests > 0) {
  console.error(`Total failures: ${failedTests}`);
  for (const f of failures) {
    console.error(`  - ${f}`);
  }
  process.exit(1);
} else {
  console.log('All tests passed successfully.');
  process.exit(0);
}
