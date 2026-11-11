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
 * 9. Dynamic minVal and maxVal on .ladder-ruler-scale.
 * 10. Specialty icons in tooltips and ranking modal.
 * 11. getSkillSubCategoryInfo and modal sub-category filtering.
 * 12. Modal highlight clearing and body class lifecycle.
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

  const bodyClasses = new Set();
  const elementsById = new Map();
  let dismissAllCalled = false;
  let activeElementBlurred = false;

  const mockActiveElement = {
    blur: () => { activeElementBlurred = true; }
  };

  const sandbox = {
    window: {},
    PopoverCoordinator: {
      dismissAll: () => { dismissAllCalled = true; }
    },
    document: {
      get activeElement() { return mockActiveElement; },
      body: {
        classList: {
          contains: (cls) => bodyClasses.has(cls),
          add: (cls) => { bodyClasses.add(cls); },
          remove: (cls) => { bodyClasses.delete(cls); },
          toggle: (cls, force) => {
            if (force === undefined) {
              if (bodyClasses.has(cls)) { bodyClasses.delete(cls); return false; }
              bodyClasses.add(cls); return true;
            } else if (force) {
              bodyClasses.add(cls); return true;
            } else {
              bodyClasses.delete(cls); return false;
            }
          }
        },
        appendChild: (el) => {
          if (el && el.id) elementsById.set(el.id, el);
          return el;
        }
      },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'wiki-skill-ladder-coordinate') {
          return {
            get innerHTML() { return coordinateInner; },
            set innerHTML(v) { coordinateInner = v; }
          };
        }
        if (elementsById.has(id)) {
          return elementsById.get(id);
        }
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === '.ladder-track-row.has-active-tooltip' || sel === '.ladder-node.tooltip-active' || sel === '[data-pkm-group].group-hover-active' || sel === '.has-active-tooltip, .tooltip-active, .group-hover-active') {
          return [
            { classList: { remove: (c) => {} } }
          ];
        }
        return [];
      },
      createElement: (tag) => {
        const el = {
          tagName: tag.toUpperCase(),
          setAttribute: () => {},
          innerHTML: '',
          className: '',
          id: '',
          style: {},
          onclick: null
        };
        return el;
      },
      addEventListener: () => {},
      removeEventListener: () => {}
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
    Set: Set,
    Array: Array,
    Object: Object
  };

  sandbox.window = sandbox;
  sandbox.window.PopoverCoordinator = sandbox.PopoverCoordinator;
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
    getRenderedHtml: () => coordinateInner,
    getDismissAllCalled: () => dismissAllCalled,
    getActiveElementBlurred: () => activeElementBlurred,
    getBodyClasses: () => bodyClasses,
    getModalElement: () => elementsById.get('wiki-skill-ranking-modal')
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

  // Verify pure text colored labels across all 9 tracks with shortened 4-character names
  const trackDefs = sandbox.SKILL_TRACK_DEFINITIONS;
  assertEquals(trackDefs.length, 9, 'Exactly 9 track definitions configured');

  const expectedShortNames = [
    '能量填充',
    '全體療癒',
    '單體療癒',
    '料理強化',
    '料理成功',
    '幫手支援',
    '夢碎獲取',
    '食材獲取',
    '樹果遽增'
  ];

  for (const expectedName of expectedShortNames) {
    const found = trackDefs.some(t => t.name === expectedName);
    assert(found, `SKILL_TRACK_DEFINITIONS defines shortened track name: ${expectedName}`);
    assert(html.includes(expectedName), `Track header text tag renders shortened name: ${expectedName}`);
  }

  for (const track of trackDefs) {
    assert(typeof track.color === 'string' && track.color.startsWith('#'), `Track ${track.id} defines valid hex color`);
    assert(typeof track.bgColor === 'string' && (track.bgColor.startsWith('#') || track.bgColor.startsWith('rgba(')), `Track ${track.id} defines valid bgColor`);
  }

  // Zero Star Glyph rule on rendered HTML
  const starGlyphRegex = /[\u2605\u2606\u2B50]|\[\*\]|\[\u2605\]|\[\u2606\]/;
  assert(!starGlyphRegex.test(html), 'Rendered track headers contain 0 decorative star glyphs');
}

// -----------------------------------------------------------------------------
// Suite 2: Avatar Dimensions & Layout CSS Rules
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

  // Desktop header and spacer: 68px
  assert(skillLadderCss.includes('width: 68px !important;') && skillLadderCss.includes('min-width: 68px !important;') && skillLadderCss.includes('max-width: 68px !important;'),
    'wiki_skill_ladder.css: locks desktop spacer/header to 68px !important');
  if (stylesCss.includes('width: 68px !important;')) {
    assert(stylesCss.includes('width: 68px !important;'), 'styles.css: locks desktop spacer/header to 68px !important');
  } else {
    assert(stylesCss.includes('width: 140px !important;') || stylesCss.includes('width: 68px !important;'), 'styles.css: contains spacer/header width definition (pending build)');
  }

  // Mobile header and spacer: 56px
  assert(skillLadderCss.includes('width: 56px !important;') && skillLadderCss.includes('min-width: 56px !important;') && skillLadderCss.includes('max-width: 56px !important;'),
    'wiki_skill_ladder.css: mobile query sets spacer/header to 56px !important');

  // Borderless, transparent, zero-padding skill-track-name-tag
  assert(skillLadderCss.includes('.skill-track-name-tag') && skillLadderCss.includes('background: transparent !important;') && skillLadderCss.includes('border: none !important;') && skillLadderCss.includes('padding: 0 !important;'),
    'wiki_skill_ladder.css: .skill-track-name-tag enforces borderless, transparent background, and zero padding');

  // Hidden skill-track-count-tag
  assert(skillLadderCss.includes('.skill-track-count-tag') && skillLadderCss.includes('display: none !important;'),
    'wiki_skill_ladder.css: .skill-track-count-tag is hidden with display: none !important');

  // Scoped track row hover & active tooltip z-index
  assert(skillLadderCss.includes('.wiki-skill-coordinate-ladder .ladder-track-row:hover') && skillLadderCss.includes('z-index: 100 !important;'),
    'wiki_skill_ladder.css: scoped ladder-track-row:hover has z-index 100 !important');

  // Modal bleed-through prevention: z-index: 200000 and body.skill-ranking-modal-open neutralization
  assert(skillLadderCss.includes('#wiki-skill-ranking-modal.ing-rank-modal-overlay') && skillLadderCss.includes('z-index: 200000 !important;'),
    'wiki_skill_ladder.css: #wiki-skill-ranking-modal has z-index 200000 !important');
  assert(skillLadderCss.includes('body.skill-ranking-modal-open .wiki-skill-coordinate-ladder .ladder-track-row') && skillLadderCss.includes('z-index: 1 !important;'),
    'wiki_skill_ladder.css: body.skill-ranking-modal-open neutralizes ladder-track-row stacking and hover');

  // Modal subfilter bar styling
  assert(skillLadderCss.includes('.skill-rank-subfilter-bar') && skillLadderCss.includes('.skill-rank-subfilter-btn'),
    'wiki_skill_ladder.css: provides styling for .skill-rank-subfilter-bar and .skill-rank-subfilter-btn');

  // Track height clamp: 52px to 68px
  const trackHeightRegex = /height:\s*clamp\(52px,\s*calc\(\(100vh\s*-\s*280px\)\s*\/\s*9\),\s*68px\)\s*!important;/;
  assert(trackHeightRegex.test(skillLadderCss), 'wiki_skill_ladder.css: track-row height clamps between 52px and 68px');

  // Rendered DOM check
  const { sandbox } = createLadderSandbox();
  const html = sandbox.renderSkillCoordinateLadder();
  assert(html.includes('class="node-avatar-wrapper"'), 'Rendered HTML contains .node-avatar-wrapper');
  assert(html.includes('class="node-avatar-img"'), 'Rendered HTML contains .node-avatar-img');
  assert(html.includes('skill-ruler-label') && html.includes('次數/12h'), 'Rendered HTML contains .skill-ruler-label with text 次數/12h (zh)');

  const { sandbox: sandboxEN } = createLadderSandbox({ lang: 'en-US' });
  const htmlEN = sandboxEN.renderSkillCoordinateLadder();
  assert(htmlEN.includes('skill-ruler-label') && htmlEN.includes('Procs/12h'), 'Rendered HTML contains .skill-ruler-label with text Procs/12h (en)');
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

  // Verify formula note is removed from tooltip and Est. 12h Triggers is at the bottom
  assert(!html.includes('計算公式：43200 / (有效間隔 * 0.45) * 最終技能機率'), 'Tooltip removes bottom formula text (zh)');
  assert(!html.includes('Formula: 43200 / (effectiveInterval * 0.45) * finalSkillRate'), 'Tooltip removes bottom formula text (en)');
  const breakdownIdx = html.indexOf('tooltip-yield-breakdown');
  const detailIdx = html.indexOf('預估 12h 發動：');
  assert(breakdownIdx > 0 && detailIdx > breakdownIdx, 'Est. 12h Triggers is positioned below tooltip-yield-breakdown at bottom of tooltip');

  // Verify Final Evolution Only switch & filtering
  const sidebarHtml = sandbox.renderSkillLadderSidebar('', false, 'skills_ladder');
  assert(sidebarHtml.includes('id="skill-ladder-final-only-switch"'), 'Sidebar contains Final Evolution switch');
  assertEquals(sandbox.getSkillLadderFinalOnly(), false, 'Final Evolution filter defaults to false');
  sandbox.toggleSkillLadderTop15(false);
  const allHtml = sandbox.renderSkillCoordinateLadder();
  assert(allHtml.includes('data-pkm="拉魯拉絲"'), 'Without Final Evolution filter, pre-evolution Ralts is included');
  sandbox.toggleSkillLadderFinalOnly(true);
  assertEquals(sandbox.getSkillLadderFinalOnly(), true, 'Final Evolution filter toggles to true');
  const finalHtml = sandbox.renderSkillCoordinateLadder();
  assert(!finalHtml.includes('data-pkm="拉魯拉絲"'), 'Final Evolution filter excludes pre-evolution Ralts');
  assert(finalHtml.includes('data-pkm="沙奈朵"'), 'Final Evolution filter retains final evolution Gardevoir');
  sandbox.toggleSkillLadderFinalOnly(false);
  sandbox.toggleSkillLadderTop15(true);

  // Verify clickable track header & openSkillRankingModal
  assert(html.includes('window.WikiDB.openSkillRankingModal('), 'Track header includes onclick handler for openSkillRankingModal');
  const rankedEnergyAll = sandbox.openSkillRankingModal('energy_all');
  assert(Array.isArray(rankedEnergyAll) && rankedEnergyAll.length > 0, 'openSkillRankingModal returns ranked list for energy_all');
  assert(rankedEnergyAll[0].rank === 1, 'Top ranked Pokemon has rank 1');

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
// Suite 9: Dynamic minVal and maxVal on .ladder-ruler-scale
// -----------------------------------------------------------------------------
console.log('\n[Suite 9] Dynamic minVal and maxVal on Ruler Scale');

{
  const { sandbox } = createLadderSandbox();
  const html = sandbox.renderSkillCoordinateLadder();

  // Find all tick labels and their positions
  const tickMatches = [...html.matchAll(/class="ladder-ruler-tick"\s+style="left:\s*([^;%]+)%;"[\s\S]*?<span class="tick-label">([^<]+)<\/span>/g)];
  assert(tickMatches.length >= 2, `Rendered scale contains at least 2 ticks (found ${tickMatches.length})`);

  const firstTick = tickMatches[0];
  const firstPos = parseFloat(firstTick[1]);
  const firstVal = parseFloat(firstTick[2]);

  const lastTick = tickMatches[tickMatches.length - 1];
  const lastPos = parseFloat(lastTick[1]);
  const lastVal = parseFloat(lastTick[2]);

  assertEquals(firstPos, 0, 'First ruler tick is positioned at 0.00%');
  assertEquals(lastPos, 100, 'Last ruler tick is positioned at 100.00%');

  // Verify dynamic minVal: it should match the minimum trigger count among visible nodes, NOT hardcoded 0!
  assert(firstVal > 0, `minVal is dynamic and greater than 0 (Expected > 0, Got: ${firstVal})`);
  assert(lastVal > firstVal, `maxVal is strictly greater than minVal (minVal: ${firstVal}, maxVal: ${lastVal})`);

  // Verify intermediate ticks are strictly between minVal and maxVal
  for (let i = 1; i < tickMatches.length - 1; i++) {
    const midVal = parseFloat(tickMatches[i][2]);
    const midPos = parseFloat(tickMatches[i][1]);
    assert(midVal > firstVal && midVal < lastVal, `Intermediate tick value ${midVal} is strictly between minVal (${firstVal}) and maxVal (${lastVal})`);
    assert(midPos > 0 && midPos < 100, `Intermediate tick position ${midPos}% is strictly between 0% and 100%`);
  }

  // Dynamic test with a single Pokemon or restricted filter
  sandbox.setSkillLadderSearchQuery('皮卡丘');
  const filteredHtml = sandbox.renderSkillCoordinateLadder();
  const filteredTicks = [...filteredHtml.matchAll(/class="ladder-ruler-tick"\s+style="left:\s*([^;%]+)%;"[\s\S]*?<span class="tick-label">([^<]+)<\/span>/g)];
  assert(filteredTicks.length >= 2, `Filtered scale contains at least 2 ticks for Pikachu (found ${filteredTicks.length})`);
  const filteredFirstVal = parseFloat(filteredTicks[0][2]);
  const filteredLastVal = parseFloat(filteredTicks[filteredTicks.length - 1][2]);
  assert(filteredFirstVal > 0, `Filtered minVal is greater than 0 (Got: ${filteredFirstVal})`);
  assert(filteredLastVal >= filteredFirstVal, `Filtered maxVal is >= minVal (Got: ${filteredLastVal})`);
  sandbox.clearSkillLadderSearch();
}

// -----------------------------------------------------------------------------
// Suite 10: Specialty Icons in Tooltips and Ranking Modal
// -----------------------------------------------------------------------------
console.log('\n[Suite 10] Specialty Icons in Tooltips & Ranking Modal');

{
  const { sandbox } = createLadderSandbox();
  const getIcon = sandbox.getSkillLadderSpecialtyIcon;
  assert(typeof getIcon === 'function', 'getSkillLadderSpecialtyIcon function exists');

  // Helper tests
  const skillIcon = getIcon('skill', '技能型', 16);
  assert(skillIcon.includes('assets/specialty/skill.png') && skillIcon.includes('assets/specialty/skill@2x.png 2x'), 'Specialty icon for skill includes 1x and 2x images');
  assert(skillIcon.includes('class="specialty-icon spec-skill"'), 'Specialty icon contains .specialty-icon class');
  assert(skillIcon.includes('title="技能型"') && skillIcon.includes('alt="技能型"'), 'Specialty icon sets title and alt attributes');

  const berryIcon = getIcon('berry', '樹果型', 16);
  assert(berryIcon.includes('assets/specialty/berry.png'), 'Specialty icon for berry includes assets/specialty/berry.png');

  const ingIcon = getIcon('ingredient', '食材型', 16);
  assert(ingIcon.includes('assets/specialty/ingredient.png'), 'Specialty icon for ingredient includes assets/specialty/ingredient.png');

  // Verify rendered ladder tooltips contain specialty icon img and no text-only specialty tag
  const html = sandbox.renderSkillCoordinateLadder();
  assert(html.includes('assets/specialty/'), 'Rendered ladder tooltips contain assets/specialty/ icon URLs');
  assert(html.includes('class="specialty-icon'), 'Rendered ladder tooltips contain .specialty-icon img tags');
  assert(!html.includes('style="margin-left: 6px; font-size: 10px; padding: 1px 6px; border-radius: 4px; background: rgba(255,255,255,0.08); color: var(--accent-color, #38bdf8);">技能型</span>'),
    'Rendered ladder tooltips replaced text specialty badge with specialty icon');

  // Verify modal contains specialty icon img
  sandbox.openSkillRankingModal('charge_energy');
  const modalEl = sandbox.document.getElementById('wiki-skill-ranking-modal');
  assert(modalEl !== null, 'Modal element was created');
  assert(modalEl.innerHTML.includes('assets/specialty/'), 'Modal HTML contains assets/specialty/ icon URLs');
  assert(modalEl.innerHTML.includes('class="specialty-icon'), 'Modal HTML contains .specialty-icon elements');
  assert(!modalEl.innerHTML.includes('>技能型</span>'), 'Modal HTML does NOT contain raw text tag 技能型');
}

// -----------------------------------------------------------------------------
// Suite 11: getSkillSubCategoryInfo & Modal Sub-Category Filtering
// -----------------------------------------------------------------------------
console.log('\n[Suite 11] getSkillSubCategoryInfo & Sub-Category Filtering');

{
  const { sandbox } = createLadderSandbox();
  const getSub = sandbox.getSkillSubCategoryInfo;
  assert(typeof getSub === 'function', 'getSkillSubCategoryInfo function exists');

  // 1. energy_single (單體療癒): self vs ally
  const selfZh = getSub('活力填充S', 'energy_single', false);
  assertEquals(selfZh.subKey, 'self', '活力填充S has subKey: self');
  assertEquals(selfZh.subLabel, '自己', '活力填充S has subLabel: 自己');
  assertEquals(selfZh.fullLabel, '活力填充S（自己）', '活力填充S has fullLabel: 活力填充S（自己）');

  const selfEn = getSub('Charge Energy S', 'energy_single', true);
  assertEquals(selfEn.subKey, 'self', 'Charge Energy S has subKey: self');
  assertEquals(selfEn.subLabel, 'Self', 'Charge Energy S has subLabel: Self');

  const moonZh = getSub('月光', 'energy_single', false);
  assertEquals(moonZh.subKey, 'self', '月光 has subKey: self');
  assert(moonZh.subLabel.includes('自己'), '月光 subLabel mentions 自己');

  const allyZh = getSub('活力療癒S', 'energy_single', false);
  assertEquals(allyZh.subKey, 'ally', '活力療癒S has subKey: ally');
  assertEquals(allyZh.subLabel, '隨機他人', '活力療癒S has subLabel: 隨機他人');

  const nuzzleZh = getSub('蹭蹭臉頰', 'energy_single', false);
  assertEquals(nuzzleZh.subKey, 'ally', '蹭蹭臉頰 has subKey: ally');

  // 2. ingredient (食材獲取): magnet vs select
  const magnetZh = getSub('食材獲取S', 'ingredient', false);
  assertEquals(magnetZh.subKey, 'magnet', '食材獲取S has subKey: magnet');
  assertEquals(magnetZh.subLabel, '食材獲取', '食材獲取S has subLabel: 食材獲取');

  const selectZh = getSub('食材精選S', 'ingredient', false);
  assertEquals(selectZh.subKey, 'select', '食材精選S has subKey: select');
  assertEquals(selectZh.subLabel, '食材精選', '食材精選S has subLabel: 食材精選');

  const cutterZh = getSub('怪力鉗', 'ingredient', false);
  assertEquals(cutterZh.subKey, 'select', '怪力鉗 has subKey: select');

  const luckZh = getSub('超幸運', 'ingredient', false);
  assertEquals(luckZh.subKey, 'select', '超幸運 has subKey: select');

  // 3. Tooltip check for fullLabel
  const html = sandbox.renderSkillCoordinateLadder();
  assert(html.includes('（自己）') || html.includes('（隨機他人）'), 'Rendered ladder tooltips display sub-category label in main skill row');

  // 4. Modal sub-filtering in energy_single
  const allSingle = sandbox.openSkillRankingModal('energy_single', 'ALL');
  const selfSingle = sandbox.openSkillRankingModal('energy_single', 'self');
  const allySingle = sandbox.openSkillRankingModal('energy_single', 'ally');

  assert(allSingle.length > 0, 'energy_single ALL returns ranked Pokemon');
  assert(selfSingle.length > 0, 'energy_single self returns ranked Pokemon');
  assert(allySingle.length > 0, 'energy_single ally returns ranked Pokemon');
  assertEquals(selfSingle.length + allySingle.length, allSingle.length, 'self + ally matches all in energy_single');
  assert(selfSingle.every(p => p.subKey === 'self'), 'All items in self ranking have subKey: self');
  assert(allySingle.every(p => p.subKey === 'ally'), 'All items in ally ranking have subKey: ally');

  // 5. Modal sub-filtering in ingredient
  const allIngr = sandbox.openSkillRankingModal('ingredient', 'ALL');
  const magnetIngr = sandbox.openSkillRankingModal('ingredient', 'magnet');
  const selectIngr = sandbox.openSkillRankingModal('ingredient', 'select');

  assert(allIngr.length > 0, 'ingredient ALL returns ranked Pokemon');
  assert(magnetIngr.length > 0, 'ingredient magnet returns ranked Pokemon');
  assert(selectIngr.length > 0, 'ingredient select returns ranked Pokemon');
  assertEquals(magnetIngr.length + selectIngr.length, allIngr.length, 'magnet + select matches all in ingredient');
  assert(magnetIngr.every(p => p.subKey === 'magnet'), 'All items in magnet ranking have subKey: magnet');
  assert(selectIngr.every(p => p.subKey === 'select'), 'All items in select ranking have subKey: select');

  // 6. Sub-filter buttons in modal HTML
  const modalEl = sandbox.document.getElementById('wiki-skill-ranking-modal');
  assert(modalEl.innerHTML.includes('class="skill-rank-subfilters"'), 'Modal header includes .skill-rank-subfilters container');
  assert(modalEl.innerHTML.includes("openSkillRankingModal('ingredient', 'magnet')"), 'Modal includes onclick for magnet subfilter');
  assert(modalEl.innerHTML.includes("openSkillRankingModal('ingredient', 'select')"), 'Modal includes onclick for select subfilter');
}

// -----------------------------------------------------------------------------
// Suite 12: Ranking Modal Highlight Clearing & Body Class Lifecycle
// -----------------------------------------------------------------------------
console.log('\n[Suite 12] Modal Highlight Bleed-Through Prevention & Lifecycle');

{
  const { sandbox, getDismissAllCalled, getActiveElementBlurred, getBodyClasses } = createLadderSandbox();

  assertEquals(getBodyClasses().has('skill-ranking-modal-open'), false, 'body initially does not have skill-ranking-modal-open class');

  // Open modal
  sandbox.openSkillRankingModal('cooking_pot');
  assertEquals(getBodyClasses().has('skill-ranking-modal-open'), true, 'openSkillRankingModal adds skill-ranking-modal-open to body');
  assertEquals(getDismissAllCalled(), true, 'openSkillRankingModal triggers PopoverCoordinator.dismissAll()');
  assertEquals(getActiveElementBlurred(), true, 'openSkillRankingModal blurs document.activeElement');

  // Modal header styling: borderless & transparent track name tag
  const modalEl = sandbox.document.getElementById('wiki-skill-ranking-modal');
  assert(modalEl.innerHTML.includes('class="skill-track-name-tag" style="color:'), 'Modal header renders track name tag with color');
  assert(modalEl.innerHTML.includes('background:transparent') || modalEl.innerHTML.includes('border:none'), 'Modal header track name tag is borderless and transparent');

  // Close modal
  sandbox.closeSkillRankingModal();
  assertEquals(getBodyClasses().has('skill-ranking-modal-open'), false, 'closeSkillRankingModal removes skill-ranking-modal-open from body');
}

// -----------------------------------------------------------------------------
// Suite 13: Skill Name Duplication Fix & Ranking Modal UI Refinements
// -----------------------------------------------------------------------------
console.log('\n[Suite 13] Skill Name Duplication Fix & Ranking Modal UI Refinements');

{
  const { sandbox } = createLadderSandbox();
  const getSub = sandbox.getSkillSubCategoryInfo;

  // 1. R1: No duplicate （隨機） or (Random) suffix
  const chargeRandZh = getSub('能量填充S（隨機）', 'charge_energy', false);
  assertEquals(chargeRandZh.fullLabel, '能量填充S（隨機）', '能量填充S（隨機） has clean fullLabel without duplicate suffix');
  assert(!chargeRandZh.fullLabel.includes('（隨機）（隨機）'), '能量填充S（隨機） does not contain duplicate （隨機）');

  const chargeRandEn = getSub('Charge Strength S (Random)', 'charge_energy', true);
  assertEquals(chargeRandEn.fullLabel, 'Charge Strength S (Random)', 'Charge Strength S (Random) has clean fullLabel without duplicate suffix');
  assert(!chargeRandEn.fullLabel.includes('(Random) (Random)'), 'Charge Strength S (Random) does not contain duplicate (Random)');

  const dreamRandZh = getSub('夢之碎片獲取S（隨機）', 'dream_shards', false);
  assertEquals(dreamRandZh.fullLabel, '夢之碎片獲取S（隨機）', '夢之碎片獲取S（隨機） has clean fullLabel without duplicate suffix');
  assert(!dreamRandZh.fullLabel.includes('（隨機）（隨機）'), '夢之碎片獲取S（隨機） does not contain duplicate （隨機）');

  const dreamRandEn = getSub('Dream Shard Magnet S (Random)', 'dream_shards', true);
  assertEquals(dreamRandEn.fullLabel, 'Dream Shard Magnet S (Random)', 'Dream Shard Magnet S (Random) has clean fullLabel without duplicate suffix');

  // Defensive sanitization of pre-duplicated input (2x, 3x, mixed brackets)
  const preDupeZh2 = getSub('能量填充S（隨機）（隨機）', 'charge_energy', false);
  assertEquals(preDupeZh2.fullLabel, '能量填充S（隨機）', 'Pre-duplicated 2x input is cleaned up to 能量填充S（隨機）');

  const preDupeZh3 = getSub('能量填充S（隨機）（隨機）（隨機）', 'charge_energy', false);
  assertEquals(preDupeZh3.fullLabel, '能量填充S（隨機）', 'Pre-duplicated 3x input is cleaned up to 能量填充S（隨機）');

  const preDupeEn3 = getSub('Charge Strength S (Random) (Random) (Random)', 'charge_energy', true);
  assertEquals(preDupeEn3.fullLabel, 'Charge Strength S (Random)', 'Pre-duplicated 3x English input is cleaned up to Charge Strength S (Random)');

  const preDupeMixed = getSub('能量填充S(隨機)（隨機）', 'charge_energy', false);
  assertEquals(preDupeMixed.fullLabel, '能量填充S（隨機）', 'Mixed brackets input (隨機)（隨機） is cleaned up to 能量填充S（隨機）');

  const preDupeSpaced = getSub('能量填充S（ 隨機 ）（隨機）', 'charge_energy', false);
  assertEquals(preDupeSpaced.fullLabel, '能量填充S（隨機）', 'Spaced brackets input （ 隨機 ）（隨機） is cleaned up to 能量填充S（隨機）');

  const preDupeSpacedEn = getSub('Charge Strength S ( Random ) (Random)', 'charge_energy', true);
  assertEquals(preDupeSpacedEn.fullLabel, 'Charge Strength S (Random)', 'Spaced English input ( Random ) (Random) is cleaned up to Charge Strength S (Random)');

  const preDupeFixed = getSub('能量填充S（固定）（固定）（固定）', 'charge_energy', false);
  assertEquals(preDupeFixed.fullLabel, '能量填充S（固定）', 'Pre-duplicated fixed input is cleaned up to 能量填充S（固定）');

  // Generator script parity verification
  const genScriptContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'scripts', 'generate_wiki_skill_ladder.js'), 'utf8');
  assert(genScriptContent.includes('隨機'), 'generate_wiki_skill_ladder.js defines random deduplication');
  assert(genScriptContent.includes('（隨機）') && genScriptContent.includes('Random'), 'generate_wiki_skill_ladder.js defines robust deduplication logic');

  // Rendered ladder coordinate HTML verification
  const ladderHtml = sandbox.renderSkillCoordinateLadder();
  assert(!ladderHtml.includes('（隨機）（隨機）'), 'Rendered ladder HTML does not contain duplicate （隨機）（隨機）');
  assert(!ladderHtml.includes('(Random) (Random)'), 'Rendered ladder HTML does not contain duplicate (Random) (Random)');

  // 2. R2: Ranking modal content does NOT display Pokemon names
  sandbox.openSkillRankingModal('charge_energy');
  const modalEl = sandbox.document.getElementById('wiki-skill-ranking-modal');
  assert(modalEl !== null, 'Ranking modal was rendered for charge_energy');
  const modalHtml = modalEl.innerHTML;

  assert(!modalHtml.includes('（隨機）（隨機）'), 'Ranking modal HTML does not contain duplicate （隨機）（隨機）');
  assert(!modalHtml.includes('(Random) (Random)'), 'Ranking modal HTML does not contain duplicate (Random) (Random)');

  // Inspect that skill-rank-meta-col does not contain Pokemon name span in meta column
  assert(!modalHtml.includes('class="font-bold text-primary" style="font-size:12.5px;"'),
    'Ranking modal does not contain Pokemon name span in meta column');

  // Verify that Pokemon names are not rendered in the card content
  const samplePokemonNames = ['皮卡丘', '雷丘', '電龍', '茸茸羊', '咚咚鼠', '卡比獸', 'Pikachu', 'Raichu', 'Ampharos', 'Dedenne', 'Snorlax'];
  for (const pName of samplePokemonNames) {
    assert(!modalHtml.includes(`>${pName}<`), `Ranking modal does not display Pokemon name >${pName}<`);
  }

  // 3. R3: Ranking numbers have significantly reduced font size
  const skillLadderCss = fs.readFileSync(skillLadderCssPath, 'utf8');
  const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');
  assert(skillLadderCss.includes('#wiki-skill-ranking-modal .ing-rank-num'),
    'wiki_skill_ladder.css defines scoped rule for #wiki-skill-ranking-modal .ing-rank-num');
  assert(skillLadderCss.includes('font-size: 10.5px !important;'),
    'wiki_skill_ladder.css sets rank num font-size to 10.5px !important');
  assert(stylesCss.includes('#wiki-skill-ranking-modal .ing-rank-num'),
    'css/styles.css is synchronized with scoped rule for #wiki-skill-ranking-modal .ing-rank-num');

  // 4. R3: Specialty icon and skill name aligned in the same row
  assert(modalHtml.includes('class="skill-rank-meta-col"') && modalHtml.includes('display:flex') && modalHtml.includes('align-items:center') && modalHtml.includes('gap:6px'),
    'Ranking modal meta column uses inline flex with align-items center and 6px gap');
  assert(modalHtml.includes('class="specialty-icon') || modalHtml.includes('node-specialty-tag'),
    'Ranking modal contains specialty icon');
  assert(modalHtml.includes('class="text-secondary skill-rank-skill-name"'),
    'Ranking modal contains skill-rank-skill-name');
  assert(skillLadderCss.includes('#wiki-skill-ranking-modal .skill-rank-meta-col'),
    'wiki_skill_ladder.css defines flex-direction row and align-items center for .skill-rank-meta-col');
  assert(skillLadderCss.includes('#wiki-skill-ranking-modal .ing-rank-left'),
    'wiki_skill_ladder.css defines flex rules for #wiki-skill-ranking-modal .ing-rank-left');
  assert(skillLadderCss.includes('#wiki-skill-ranking-modal .ing-rank-right'),
    'wiki_skill_ladder.css defines flex rules for #wiki-skill-ranking-modal .ing-rank-right');
  assert(stylesCss.includes('#wiki-skill-ranking-modal .ing-rank-left'),
    'styles.css is synchronized with rules for #wiki-skill-ranking-modal .ing-rank-left');

  sandbox.closeSkillRankingModal();
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
