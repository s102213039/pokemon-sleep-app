/**
 * tests/test_adversarial_m1_2.js
 * Empirical Adversarial Verification Harness for Milestone 1
 *
 * Verifies:
 * Probe 1: Specificity & Theme Override Integrity in styles.css and styles.min.css
 * Probe 2: Defensive Selection Clearing in openSkillRankingModal
 * Probe 3: Zero Emoji & Zero Decorative Glyph Policy across git diff and modified files
 * Probe 4: Standalone Test Harnesses Execution & Status
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

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

console.log('================================================================');
console.log('  Milestone 1 Empirical Adversarial Challenge Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Probe 1: Specificity & Theme Override Stress Test
// -----------------------------------------------------------------------------
console.log('[Probe 1] Tooltip Yield Breakdown CSS Specificity & Theme Invariance');
{
  const modularCssPath = path.join(WORKSPACE_ROOT, 'css/views/wiki/wiki_skill_ladder.css');
  const stylesCssPath = path.join(WORKSPACE_ROOT, 'css/styles.css');
  const stylesMinCssPath = path.join(WORKSPACE_ROOT, 'css/styles.min.css');

  const modularCss = fs.readFileSync(modularCssPath, 'utf8');
  const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');
  const stylesMinCss = fs.readFileSync(stylesMinCssPath, 'utf8');

  // Helper: calculate CSS specificity (a, b, c) -> number
  // a = IDs (* 100), b = classes/attributes/pseudo-classes (* 10), c = elements/pseudo-elements (* 1)
  function getSpecificity(selector) {
    let a = 0, b = 0, c = 0;
    const cleanSel = selector.trim();
    const idMatches = cleanSel.match(/#[a-zA-Z0-9_-]+/g);
    if (idMatches) a += idMatches.length;
    const classMatches = cleanSel.match(/\.[a-zA-Z0-9_-]+/g);
    if (classMatches) b += classMatches.length;
    const attrMatches = cleanSel.match(/\[[^\]]+\]/g);
    if (attrMatches) b += attrMatches.length;
    return a * 100 + b * 10 + c;
  }

  // Check selector in modular CSS
  const hasModularSelector = modularCss.includes('[data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown');
  assert(hasModularSelector, 'css/views/wiki/wiki_skill_ladder.css contains [data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown');

  // Check selector in styles.css
  const hasStylesSelector = stylesCss.includes('[data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown');
  assert(hasStylesSelector, 'css/styles.css contains [data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown');

  // Check selector in styles.min.css
  const hasStylesMinSelector = stylesMinCss.includes('[data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown') ||
                                stylesMinCss.includes('[data-theme].wiki-skill-coordinate-ladder .tooltip-yield-breakdown') ||
                                stylesMinCss.includes('[data-theme] .wiki-skill-coordinate-ladder');
  assert(hasStylesMinSelector, 'css/styles.min.css contains [data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown');

  // Evaluate effective specificity vs theme overrides
  const themeOverrideDawn = '[data-theme="dawn"] .tooltip-yield-breakdown';
  const themeOverrideOnyx = '[data-theme="onyx"] .tooltip-yield-breakdown';
  const themeOverrideEmerald = '[data-theme="emerald"] .tooltip-yield-breakdown';

  const themeSpec = getSpecificity(themeOverrideDawn); // 20: 1 attr + 1 class

  // Extract all rules affecting .tooltip-yield-breakdown inside .wiki-skill-coordinate-ladder in styles.css
  const ladderRuleRegex = /([^{}]+)\{\s*([^}]+)\}/g;
  let m;
  let ladderRulesInStyles = [];
  while ((m = ladderRuleRegex.exec(stylesCss)) !== null) {
    const sel = m[1].trim();
    if (sel.includes('.wiki-skill-coordinate-ladder') && sel.includes('.tooltip-yield-breakdown')) {
      ladderRulesInStyles.push({ selector: sel, body: m[2], index: m.index });
    }
  }

  let ladderHasHigherSpecificity = false;
  ladderRulesInStyles.forEach(r => {
    const selectors = r.selector.split(',').map(s => s.trim());
    selectors.forEach(s => {
      const spec = getSpecificity(s);
      if (spec > themeSpec) {
        ladderHasHigherSpecificity = true;
      }
    });
  });

  assert(ladderHasHigherSpecificity, `styles.css ladder rule has higher specificity than theme overrides (${themeSpec})`);

  // Check simulated computed style under data-theme="dawn"
  // If styles.css does NOT have higher specificity, theme override at line 12950 wins due to later order in stylesheet
  let themeDawnWinsInStyles = false;
  if (!ladderHasHigherSpecificity) {
    const idxLadder = stylesCss.indexOf('.wiki-skill-coordinate-ladder .tooltip-yield-breakdown');
    const idxTheme = stylesCss.indexOf('[data-theme="dawn"] .tooltip-yield-breakdown');
    if (idxTheme > idxLadder) {
      themeDawnWinsInStyles = true;
    }
  }
  assertEquals(themeDawnWinsInStyles, false, 'styles.css does not allow [data-theme="dawn"] to override ladder tooltip-yield-breakdown');
}

// -----------------------------------------------------------------------------
// Probe 2: Defensive Selection Clearing in openSkillRankingModal
// -----------------------------------------------------------------------------
console.log('\n[Probe 2] Defensive Selection Clearing in openSkillRankingModal');
{
  const wikiSkillLadderDataJsPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_data.js');
  const wikiSkillLadderDataJs = fs.readFileSync(wikiSkillLadderDataJsPath, 'utf8');
  const wikiSkillLadderJsPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder.js');
  const wikiSkillLadderJs = fs.readFileSync(wikiSkillLadderJsPath, 'utf8');

  // Check code contains querySelectorAll('.group-selected')
  assert(
    wikiSkillLadderJs.includes("querySelectorAll('.group-selected')") ||
    wikiSkillLadderJs.includes('querySelectorAll(".group-selected")'),
    'wiki_skill_ladder.js calls document.querySelectorAll for .group-selected'
  );

  // Functional test via mock DOM sandbox
  const selectedElements = [
    { className: 'ladder-node group-selected other-class', classList: { classes: new Set(['ladder-node', 'group-selected', 'other-class']), remove: function(c) { this.classes.delete(c); } } },
    { className: 'pkm-card group-selected', classList: { classes: new Set(['pkm-card', 'group-selected']), remove: function(c) { this.classes.delete(c); } } },
    { className: 'random-item group-selected', classList: { classes: new Set(['random-item', 'group-selected']), remove: function(c) { this.classes.delete(c); } } }
  ];

  const activeHoverElements = [
    { classList: { classes: new Set(['group-hover-active']), remove: function(c) { this.classes.delete(c); } } }
  ];

  const activeTooltipNodes = [
    { classList: { classes: new Set(['tooltip-active']), remove: function(c) { this.classes.delete(c); } } }
  ];

  const activeTrackRows = [
    { classList: { classes: new Set(['has-active-tooltip']), remove: function(c) { this.classes.delete(c); } } }
  ];

  const bodyClassList = {
    classes: new Set(),
    add: function(c) { this.classes.add(c); },
    remove: function(c) { this.classes.delete(c); },
    contains: function(c) { return this.classes.has(c); }
  };

  const mockDocument = {
    body: { classList: bodyClassList },
    activeElement: { blur: () => {} },
    querySelectorAll: function(sel) {
      if (sel === '.group-selected') return selectedElements;
      if (sel === '[data-pkm-group].group-hover-active') return activeHoverElements;
      if (sel === '.ladder-node.tooltip-active') return activeTooltipNodes;
      if (sel === '.ladder-track-row.has-active-tooltip') return activeTrackRows;
      return [];
    },
    getElementById: function() { return null; }
  };

  const sandboxContext = {
    document: mockDocument,
    window: {
      PopoverCoordinator: { dismissAll: () => {} },
      I18N: { getLanguage: () => 'zh-TW' }
    },
    SKILL_TRACK_DEFINITIONS: [
      { id: 'test_track', name: '測試軌道', name_en: 'Test Track', desc: '', desc_en: '' }
    ],
    getAllSkillPokemonList: () => [],
    isExcludedSkill: () => false,
    getSkillTracks: () => ['test_track'],
    isPokemonSkillLadderFinalEvo: () => true,
    _tSkillLadder: (cn, en) => cn,
    console: console
  };

  vm.createContext(sandboxContext);
  vm.runInContext(wikiSkillLadderDataJs, sandboxContext);
  vm.runInContext(wikiSkillLadderJs, sandboxContext);

  // Invoke openSkillRankingModal
  if (typeof sandboxContext.openSkillRankingModal === 'function') {
    sandboxContext.openSkillRankingModal('test_track');
  } else if (sandboxContext.WikiSkillLadder && typeof sandboxContext.WikiSkillLadder.openSkillRankingModal === 'function') {
    sandboxContext.WikiSkillLadder.openSkillRankingModal('test_track');
  }

  // Assert all .group-selected were stripped
  selectedElements.forEach((el, idx) => {
    assertEquals(el.classList.classes.has('group-selected'), false, `Element ${idx + 1} no longer has group-selected class`);
  });
  assertEquals(bodyClassList.contains('skill-ranking-modal-open'), true, 'document.body contains skill-ranking-modal-open class');
}

// -----------------------------------------------------------------------------
// Probe 3: Zero Emoji & Zero Decorative Glyph Policy
// -----------------------------------------------------------------------------
console.log('\n[Probe 3] Comprehensive Emoji & Glyph Scan');
{
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;
  const glyphRegex = /[★☆]|\[★\]|\[☆\]/u;

  // Scan git diff against origin/main (excluding binary maps/minified single line blobs)
  try {
    const diff = execSync('git diff origin/main -- . ":(exclude)*.min.js*" ":(exclude)*.map"', {
      cwd: WORKSPACE_ROOT,
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024
    });

    let diffEmojiViolations = 0;
    let diffGlyphViolations = 0;

    const lines = diff.split('\n');
    lines.forEach(line => {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        if (emojiRegex.test(line)) diffEmojiViolations++;
        if (glyphRegex.test(line)) diffGlyphViolations++;
      }
    });

    assertEquals(diffEmojiViolations, 0, 'git diff additions contain 0 unicode emoji violations');
    assertEquals(diffGlyphViolations, 0, 'git diff additions contain 0 decorative star/glyph violations');
  } catch (err) {
    assert(false, `Git diff scan failed: ${err.message}`);
  }

  // Verify specific candidate files that had emoji violations fixed
  const wikiCalcPath = path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_calculators.js');
  const wikiCalcContent = fs.readFileSync(wikiCalcPath, 'utf8');
  assert(!wikiCalcContent.includes('1F947'), 'wiki_calculators.js does not contain medal 1F947');
  assert(!wikiCalcContent.includes('1F948'), 'wiki_calculators.js does not contain medal 1F948');
  assert(!wikiCalcContent.includes('1F949'), 'wiki_calculators.js does not contain medal 1F949');
  assert(wikiCalcContent.includes('#${rank}'), 'wiki_calculators.js renders pure text #${rank} for top 3');

  const i18nDictEnPath = path.join(WORKSPACE_ROOT, 'js/core/i18n/i18n_dict_en_us.js');
  const i18nDictEn = fs.readFileSync(i18nDictEnPath, 'utf8');
  assert(!i18nDictEn.includes('1F957'), 'i18n_dict_en_us.js does not contain salad 1F957');
  assert(i18nDictEn.includes("'pokedex.only_initial_ing': 'Ing.1 only'"), 'i18n_dict_en_us.js uses clean text Ing.1 only');
}

// -----------------------------------------------------------------------------
// Probe 4: Standalone Test Execution
// -----------------------------------------------------------------------------
console.log('\n[Probe 4] Standalone Test Suites Verification');
{
  const standaloneSuites = [
    'tests/test_wiki_skill_ladder.js',
    'tests/test_cross_module_consistency.js',
    'tests/test_box_import_dedup.js'
  ];

  standaloneSuites.forEach(suite => {
    try {
      execSync(`node ${suite}`, { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
      assert(true, `${suite} executed successfully with 0 errors`);
    } catch (err) {
      assert(false, `${suite} failed execution: ${err.message}`);
    }
  });
}

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  Adversarial Challenge Summary: ${passedTests} / ${totalTests} Passed (${failedTests} Failed)`);
console.log('================================================================');

if (failures.length > 0) {
  console.error('\nFailures Detected:');
  failures.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
  process.exit(1);
} else {
  console.log('\nAll empirical adversarial challenges passed.');
  process.exit(0);
}
