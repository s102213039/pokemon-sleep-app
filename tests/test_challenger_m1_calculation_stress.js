/**
 * =========================================================================
 * Challenger M1-1: Calculation Engine Adversarial Stress Test Suite
 * =========================================================================
 * Empirically stress-tests js/modules/wiki/wiki_skill_ladder.js under:
 * 1. Extreme subskill configurations (all speed, all skill, none).
 * 2. Extreme nature combinations (Speed, Skill, None).
 * 3. Boundary intervals (clamp at 600s, fast <= 1800s, slow >= 5000s).
 * 4. Edge-case and malformed inputs (null, undefined, missing fields, 0%, 100%).
 * 5. Baseline parity checks against pokedex_calc.js across all 241 released Pokemon.
 * 6. Adversarial malformed string and non-finite value probes.
 * =========================================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

function loadSandboxedEnvironment() {
  const ladderCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder.js'), 'utf8');
  const ladderDataCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_data.js'), 'utf8');
  const pokedexCalcCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_calc.js'), 'utf8');
  const pokedexDetailCtrlCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/pokedex/pokedex_detail_ctrl.js'), 'utf8');

  const sandbox = {
    window: {},
    document: { getElementById: () => null, querySelectorAll: () => [] },
    refreshSkillCoordinateLadder: () => {},
    updateSkillLadderActiveFilterBadge: () => {},
    getBerryBaseEnergy: () => 30,
    calculateSingleBerryEnergy: () => 100,
    POKEDEX_MODAL_NATURES: [
      { name: 'NONE', buffType: 'none', debuffType: 'none' },
      { name: 'SPEED', buffType: 'speed', debuffType: 'none' },
      { name: 'SKILL', buffType: 'skill', debuffType: 'none' }
    ],
    Math,
    String,
    parseFloat,
    parseInt,
    isNaN,
    Number,
    Object,
    Map,
    Array
  };
  sandbox.window = sandbox;
  sandbox.pokedexModalState = {
    level: 60,
    nature: 'NONE',
    subskills: [],
    ribbon: 0,
    skillLevel: 1,
    ingSlots: [0, 0, 0]
  };

  vm.createContext(sandbox);
  const bootstrapScript = [
    pokedexDetailCtrlCode,
    pokedexCalcCode,
    ladderDataCode,
    ladderCode,
    'this.WikiMethods = {',
    '  getPokemonSkillLadderProcs,',
    '  parseIntervalToSec,',
    '  toggleSkillLadderSubskill,',
    '  toggleSkillLadderNatureFilter,',
    '  resetSkillLadderFilters,',
    '  getSkillLadderNature,',
    '  isExcludedSkill,',
    '  getSkillTracks,',
    '  calculatePokedexIngredientFormulas,',
    '  POKEMON_SKILLS_BASELINE_DATA',
    '};'
  ].join('\n');

  vm.runInContext(bootstrapScript, sandbox);
  return sandbox.WikiMethods;
}

function runAdversarialStressSuite() {
  const methods = loadSandboxedEnvironment();
  const {
    getPokemonSkillLadderProcs,
    parseIntervalToSec,
    toggleSkillLadderSubskill,
    toggleSkillLadderNatureFilter,
    resetSkillLadderFilters,
    getSkillLadderNature,
    isExcludedSkill,
    calculatePokedexIngredientFormulas
  } = methods;

  const dataJsonPath = path.join(WORKSPACE_ROOT, 'data/data.json');
  const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

  const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    vulnerabilities: []
  };

  function assertCondition(desc, passed, detail) {
    results.totalTests++;
    if (passed) {
      results.passed++;
      console.log('  [PASS] ' + desc);
    } else {
      results.failed++;
      console.log('  [FAIL] ' + desc + (detail ? ' -- ' + detail : ''));
      results.vulnerabilities.push({ desc, detail });
    }
  }

  console.log('=== Suite 1: Subskill Permutations & Cap Stress ===');
  resetSkillLadderFilters();

  const golduck = dataJson.find(p => p.name_cn === '哥達鴨');
  assertCondition('Golduck exists in dataset for subskill baseline testing', !!golduck);

  // Baseline
  const baseRes = getPokemonSkillLadderProcs(golduck);
  assertCondition('Baseline Golduck procs is valid finite number', Number.isFinite(baseRes.procs) && baseRes.procs > 0);
  assertCondition('Baseline Golduck helps12h is 32.01', Math.abs(baseRes.helps12h - 32.01) < 0.02);

  // Speed M only (14%)
  toggleSkillLadderSubskill('SPEED_M');
  const speedMRes = getPokemonSkillLadderProcs(golduck);
  assertCondition('Speed M reduces effective interval from 2999 to 2579', speedMRes.effectiveIntervalSec === 2579);
  assertCondition('Speed M increases helps12h to 37.22', Math.abs(speedMRes.helps12h - 37.22) < 0.02);

  // Speed M + Speed S (21% total, within 35% cap)
  toggleSkillLadderSubskill('SPEED_S');
  const speedMSRes = getPokemonSkillLadderProcs(golduck);
  assertCondition('Speed M + S reduces effective interval to 2369', speedMSRes.effectiveIntervalSec === 2369);
  assertCondition('Speed M + S increases helps12h to 40.52', Math.abs(speedMSRes.helps12h - 40.52) < 0.02);

  // Skill M (36%) + Skill S (18%) -> 54% rate bonus
  toggleSkillLadderSubskill('SKILL_M');
  toggleSkillLadderSubskill('SKILL_S');
  const fullSubRes = getPokemonSkillLadderProcs(golduck);
  assertCondition('Full subskills rate is 0.125 * 1.54 = 0.1925', Math.abs(fullSubRes.finalSkillRate - 0.1925) < 0.0001);
  assertCondition('Full subskills procs is 40.52 * 0.1925 = 7.801', Math.abs(fullSubRes.procs - 7.801) < 0.02);

  console.log('=== Suite 2: Nature Toggling & Exclusivity ===');
  resetSkillLadderFilters();
  assertCondition('Nature defaults to NONE after reset', getSkillLadderNature() === 'NONE');

  toggleSkillLadderNatureFilter('SPEED');
  assertCondition('Nature toggled to SPEED', getSkillLadderNature() === 'SPEED');

  toggleSkillLadderNatureFilter('SKILL');
  assertCondition('Nature switches to SKILL and clears SPEED', getSkillLadderNature() === 'SKILL');

  toggleSkillLadderNatureFilter('SKILL');
  assertCondition('Nature untoggled returns to NONE', getSkillLadderNature() === 'NONE');

  console.log('=== Suite 3: Boundary Intervals & 600s Clamping ===');
  resetSkillLadderFilters();
  toggleSkillLadderSubskill('SPEED_M');
  toggleSkillLadderSubskill('SPEED_S');
  toggleSkillLadderNatureFilter('SPEED');

  const boundaryPkm600 = { interval: 600, skill_rate: 0.05 };
  const res600 = getPokemonSkillLadderProcs(boundaryPkm600);
  assertCondition('Interval 600s boosted clamps to 600s', res600.effectiveIntervalSec === 600);
  assertCondition('Interval 600s idealInterval is 270s', res600.idealIntervalSec === 270);
  assertCondition('Interval 600s helps12h is 160.0', Math.abs(res600.helps12h - 160.0) < 0.001);

  const boundaryPkm100 = { interval: 100, skill_rate: 0.05 };
  const res100 = getPokemonSkillLadderProcs(boundaryPkm100);
  assertCondition('Interval 100s clamps to 600s', res100.effectiveIntervalSec === 600);

  const boundaryPkmNeg = { interval: -1000, skill_rate: 0.05 };
  const resNeg = getPokemonSkillLadderProcs(boundaryPkmNeg);
  assertCondition('Negative interval clamps to 600s', resNeg.effectiveIntervalSec === 600);

  const boundarySlow = { interval: 5000, skill_rate: 0.05 };
  const resSlow = getPokemonSkillLadderProcs(boundarySlow);
  assertCondition('Slow interval (5000s) calculates cleanly without underflow', resSlow.effectiveIntervalSec > 0 && resSlow.helps12h > 0);

  console.log('=== Suite 4: Numeric / Decimal String / Boundary Rates ===');
  resetSkillLadderFilters();

  const caseDec = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: 0.042 });
  const caseStrPct = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: '4.20%' });
  const caseStrDec = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: '0.042' });
  assertCondition('Decimal 0.042 vs Percent 4.20% produce identical procs', Math.abs(caseDec.procs - caseStrPct.procs) < 0.0001);
  assertCondition('String decimal 0.042 vs Percent 4.20% produce identical procs', Math.abs(caseDec.procs - caseStrDec.procs) < 0.0001);

  const caseZero = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: 0 });
  assertCondition('0% skill_rate falls back to safe positive rate (0.03)', caseZero.baseSkillRate === 0.03);

  const case100 = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: 1 });
  assertCondition('100% (1.0) skill_rate produces procs equal to helps12h', Math.abs(case100.procs - case100.helps12h) < 0.0001);

  const caseNullPkm = getPokemonSkillLadderProcs(null);
  assertCondition('null input returns null safely without throwing', caseNullPkm === null);

  const caseUndefPkm = getPokemonSkillLadderProcs(undefined);
  assertCondition('undefined input returns null safely without throwing', caseUndefPkm === null);

  const caseEmptyPkm = getPokemonSkillLadderProcs({});
  assertCondition('Empty object falls back to safe interval and rate', Number.isFinite(caseEmptyPkm.procs) && caseEmptyPkm.procs > 0);

  console.log('=== Suite 5: Baseline Parity across All 241 Pokemon ===');
  resetSkillLadderFilters();
  let parityMatches = 0;
  let parityCount = 0;

  dataJson.forEach(pkm => {
    if (!pkm.main_skill || isExcludedSkill(pkm.main_skill)) return;
    const ladderRes = getPokemonSkillLadderProcs(pkm);
    if (!ladderRes) return;

    const pokedexRes = calculatePokedexIngredientFormulas({
      pkm,
      level: 60,
      nature: 'NONE',
      subskills: [],
      ribbon: 0,
      skillLevel: 1
    });

    if (pokedexRes) {
      parityCount++;
      const intervalOk = ladderRes.effectiveIntervalSec === pokedexRes.effectiveIntervalSec;
      const helpsOk = Math.abs(ladderRes.helps12h - pokedexRes.dailyHelps) < 0.001;
      const procsOk = Math.abs(ladderRes.procs - pokedexRes.dailyTriggers) < 0.001;
      if (intervalOk && helpsOk && procsOk) {
        parityMatches++;
      }
    }
  });

  assertCondition('Baseline parity matches 241 / 241 Pokemon exactly with pokedex_calc.js', parityMatches === 241 && parityCount === 241, 'Matched: ' + parityMatches + '/' + parityCount);

  console.log('=== Suite 6: Adversarial Defect Probes (Defensive Robustness) ===');

  // Probe A: Malformed colon strings
  const malformedColonRes = getPokemonSkillLadderProcs({ interval: 'invalid:colon', skill_rate: 0.05 });
  const isMalformedColonHandled = Number.isFinite(malformedColonRes.effectiveIntervalSec) && Number.isFinite(malformedColonRes.procs);
  assertCondition(
    'Defensive check: Malformed colon string "invalid:colon" must not produce NaN',
    isMalformedColonHandled,
    'Observed effectiveIntervalSec: ' + malformedColonRes.effectiveIntervalSec + ', procs: ' + malformedColonRes.procs
  );

  const malformed3ColonRes = getPokemonSkillLadderProcs({ interval: 'aa:bb:cc', skill_rate: 0.05 });
  const isMalformed3ColonHandled = Number.isFinite(malformed3ColonRes.effectiveIntervalSec) && Number.isFinite(malformed3ColonRes.procs);
  assertCondition(
    'Defensive check: Malformed 3-part string "aa:bb:cc" must not produce NaN',
    isMalformed3ColonHandled,
    'Observed effectiveIntervalSec: ' + malformed3ColonRes.effectiveIntervalSec + ', procs: ' + malformed3ColonRes.procs
  );

  // Probe B: Infinity skill rate
  const infinityRateRes = getPokemonSkillLadderProcs({ interval: 3600, skill_rate: Infinity });
  const isInfinityRateHandled = Number.isFinite(infinityRateRes.finalSkillRate) && Number.isFinite(infinityRateRes.procs);
  assertCondition(
    'Defensive check: skill_rate Infinity must not propagate to procs or cause renderer infinite loop',
    isInfinityRateHandled,
    'Observed finalSkillRate: ' + infinityRateRes.finalSkillRate + ', procs: ' + infinityRateRes.procs
  );

  console.log('======================================================');
  console.log('Adversarial Test Summary: ' + results.passed + ' Passed, ' + results.failed + ' Failed (Total ' + results.totalTests + ')');
  console.log('Vulnerabilities Discovered: ' + results.vulnerabilities.length);
  console.log('======================================================');

  return results;
}

if (require.main === module) {
  const res = runAdversarialStressSuite();
  if (res.failed > 0) {
    console.log('[CHALLENGER VERDICT]: Vulnerabilities empirically confirmed. Exit code 1.');
    process.exit(1);
  } else {
    console.log('[CHALLENGER VERDICT]: All tests passed. Exit code 0.');
    process.exit(0);
  }
}

module.exports = { runAdversarialStressSuite };
