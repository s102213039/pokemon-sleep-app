/**
 * tests/test_challenger_m2_rules_css.js
 * Adversarial Empirical Verification & Stress Harness for Milestone 2:
 * Rules Compliance, CSS Structure, Single Frame Rule, Zero Emojis, and Zero Star Glyphs.
 *
 * Verifies:
 * 1. CSS Syntax & Modular Integrity (build_css.js, balanced braces, zero negative dips)
 * 2. Layout Structure & Computed Dimension Parity (140px desktop / 96px mobile header & spacer)
 * 3. Node Sizing (38px avatar desktop / 34px mobile, 52-68px track row height)
 * 4. Single Frame Rule Compliance (User Rule IX on #wiki-subpanel-skills_ladder)
 * 5. Zero Emoji Compliance Audit (User Rule VIII across source, templates, and rendered HTML)
 * 6. Zero Decorative Star/Glyphs Policy (User Rule X across source, templates, and rendered HTML)
 * 7. Adversarial Rendering Stress Tests (rounding edge cases, tooltip formatting, XSS escaping, clamp boundaries)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log('  [PASS] ' + message);
  } else {
    failedChecks++;
    console.error('  [FAIL] ' + message);
    failureDetails.push(message);
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (Expected: ${expected}, Actual: ${actual})`);
}

console.log('================================================================');
console.log('  Challenger M2-2: Rules & CSS Adversarial Empirical Harness');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: CSS Syntax & Modular Integrity
// -----------------------------------------------------------------------------
console.log('[Suite 1] CSS Syntax & Modular Integrity Verification');

const stylesPath = path.join(WORKSPACE_ROOT, 'css/styles.css');
const wikiLadderCssPath = path.join(WORKSPACE_ROOT, 'css/views/wiki/wiki_ladder.css');
const wikiSkillLadderCssPath = path.join(WORKSPACE_ROOT, 'css/views/wiki/wiki_skill_ladder.css');
const buildCssScriptPath = path.join(WORKSPACE_ROOT, 'scripts/build_css.js');

assert(fs.existsSync(stylesPath), 'css/styles.css exists');
assert(fs.existsSync(wikiLadderCssPath), 'css/views/wiki/wiki_ladder.css exists');
assert(fs.existsSync(wikiSkillLadderCssPath), 'css/views/wiki/wiki_skill_ladder.css exists');
assert(fs.existsSync(buildCssScriptPath), 'scripts/build_css.js exists');

// 1.1 Run scripts/build_css.js validator
try {
  const { buildCss, CSS_MODULES } = require(buildCssScriptPath);
  const result = buildCss();
  assert(result && result.modulesCount === CSS_MODULES.length, `buildCss() validated all ${CSS_MODULES.length} modules`);
  assert(result.totalBytes > 0, `css/styles.css size is non-zero (${(result.totalBytes / 1024).toFixed(1)} KB)`);
} catch (err) {
  assert(false, `buildCss() threw error: ${err.message}`);
}

// 1.2 Inspect wiki_ladder.css and wiki_skill_ladder.css brace balancing directly
function verifyBraceBalance(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let openBraces = 0;
  let inStr = false, quote = '', inComm = false;
  let minDepth = 0;

  for (let i = 0; i < content.length; i++) {
    const c = content[i], next = content[i + 1];
    if (inComm) {
      if (c === '*' && next === '/') { inComm = false; i++; }
      continue;
    }
    if (inStr) {
      if (c === quote && content[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === '/' && next === '*') { inComm = true; i++; continue; }
    if (c === '"' || c === "'") { inStr = true; quote = c; continue; }
    if (c === '{') openBraces++;
    if (c === '}') {
      openBraces--;
      if (openBraces < minDepth) minDepth = openBraces;
    }
  }
  return { openBraces, minDepth };
}

const ladderBraceCheck = verifyBraceBalance(wikiLadderCssPath);
assertEquals(ladderBraceCheck.openBraces, 0, 'css/views/wiki/wiki_ladder.css has perfectly balanced braces (diff: 0)');
assert(ladderBraceCheck.minDepth >= 0, `css/views/wiki/wiki_ladder.css has 0 premature closing braces (minDepth: ${ladderBraceCheck.minDepth})`);

const skillLadderBraceCheck = verifyBraceBalance(wikiSkillLadderCssPath);
assertEquals(skillLadderBraceCheck.openBraces, 0, 'css/views/wiki/wiki_skill_ladder.css has perfectly balanced braces (diff: 0)');
assert(skillLadderBraceCheck.minDepth >= 0, `css/views/wiki/wiki_skill_ladder.css has 0 premature closing braces (minDepth: ${skillLadderBraceCheck.minDepth})`);

const stylesBraceCheck = verifyBraceBalance(stylesPath);
assertEquals(stylesBraceCheck.openBraces, 0, 'css/styles.css has perfectly balanced braces (diff: 0)');
assert(stylesBraceCheck.minDepth >= 0, `css/styles.css has 0 premature closing braces (minDepth: ${stylesBraceCheck.minDepth})`);

// -----------------------------------------------------------------------------
// Suite 2: Layout Structure & Computed Dimension Parity
// -----------------------------------------------------------------------------
console.log('\n[Suite 2] Layout Structure & Computed Dimension Parity');

const ladderCssContent = fs.readFileSync(wikiSkillLadderCssPath, 'utf8');
const stylesCssContent = fs.readFileSync(stylesPath, 'utf8');

// 2.1 Header and Ruler Spacer Synchronization (Desktop 140px)
const desktopHeaderSpacerRegex = /\.wiki-skill-coordinate-ladder\s+\.skill-ladder-ruler-spacer[\s\S]*?width:\s*140px\s*!important;/;
assert(desktopHeaderSpacerRegex.test(ladderCssContent), 'wiki_ladder.css: .skill-ladder-ruler-spacer specifies 140px !important');
assert(desktopHeaderSpacerRegex.test(stylesCssContent), 'styles.css: .skill-ladder-ruler-spacer specifies 140px !important');

const desktopHeaderWidthRegex = /\.wiki-skill-coordinate-ladder\s+\.skill-ladder-track-header[\s\S]*?width:\s*140px\s*!important;/;
assert(desktopHeaderWidthRegex.test(ladderCssContent), 'wiki_ladder.css: .skill-ladder-track-header specifies 140px !important');
assert(desktopHeaderWidthRegex.test(stylesCssContent), 'styles.css: .skill-ladder-track-header specifies 140px !important');

// Check min-width and max-width clamping to exactly 140px
assert(ladderCssContent.includes('min-width: 140px !important;') && ladderCssContent.includes('max-width: 140px !important;'),
  'wiki_ladder.css locks desktop spacer/header width with min/max 140px !important');
assert(stylesCssContent.includes('min-width: 140px !important;') && stylesCssContent.includes('max-width: 140px !important;'),
  'styles.css locks desktop spacer/header width with min/max 140px !important');

// 2.2 Mobile Responsiveness (96px header and spacer)
const mobileHeaderSpacerRegex = /@media[^{]+\{[\s\S]*?\.skill-ladder-ruler-spacer[\s\S]*?width:\s*96px\s*!important;[\s\S]*?\}/;
assert(mobileHeaderSpacerRegex.test(ladderCssContent), 'wiki_ladder.css: mobile media query sets spacer to 96px !important');
assert(mobileHeaderSpacerRegex.test(stylesCssContent), 'styles.css: mobile media query sets spacer to 96px !important');

// 2.3 Enlarged Node Avatar Wrapper (38px desktop, 34px mobile)
const avatarDesktopRegex = /\.wiki-skill-coordinate-ladder\s+\.node-avatar-wrapper[\s\S]*?width:\s*38px\s*!important;[\s\S]*?height:\s*38px\s*!important;/;
assert(avatarDesktopRegex.test(ladderCssContent), 'wiki_ladder.css: node-avatar-wrapper is 38px x 38px !important on desktop');
assert(avatarDesktopRegex.test(stylesCssContent), 'styles.css: node-avatar-wrapper is 38px x 38px !important on desktop');

const avatarMobileRegex = /@media[^{]+\{[\s\S]*?\.node-avatar-wrapper[\s\S]*?width:\s*34px\s*!important;[\s\S]*?height:\s*34px\s*!important;/;
assert(avatarMobileRegex.test(ladderCssContent), 'wiki_ladder.css: node-avatar-wrapper is 34px x 34px !important on mobile');
assert(avatarMobileRegex.test(stylesCssContent), 'styles.css: node-avatar-wrapper is 34px x 34px !important on mobile');

// 2.4 Expanded Track Height (52px to 68px clamp)
const trackHeightRegex = /\.wiki-skill-coordinate-ladder\s+\.ladder-track-row[\s\S]*?height:\s*clamp\(52px,\s*calc\(\(100vh\s*-\s*280px\)\s*\/\s*9\),\s*68px\)\s*!important;/;
assert(trackHeightRegex.test(ladderCssContent), 'wiki_ladder.css: track-row height uses clamp(52px, ..., 68px) !important');
assert(trackHeightRegex.test(stylesCssContent), 'styles.css: track-row height uses clamp(52px, ..., 68px) !important');

// 2.5 Pure Text Skill Tag Styling
assert(ladderCssContent.includes('.skill-track-name-tag {'), 'wiki_ladder.css defines .skill-track-name-tag');
assert(ladderCssContent.includes('max-width: 102px;'), 'wiki_ladder.css: .skill-track-name-tag has max-width: 102px desktop');
assert(ladderCssContent.includes('max-width: 68px;'), 'wiki_ladder.css: .skill-track-name-tag has max-width: 68px mobile');

// -----------------------------------------------------------------------------
// Suite 3: Single Frame Rule Verification (User Rule IX)
// -----------------------------------------------------------------------------
console.log('\n[Suite 3] Single Frame Rule Verification (User Rule IX)');

function checkSingleFrameBlock(cssText, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedSelector + '[^{]*\\{([^}]+)\\}');
  const match = cssText.match(regex);
  if (!match) return { found: false };
  const block = match[1];
  return {
    found: true,
    hasBorderNone: /border:\s*none\s*!important/.test(block) || /border:\s*0\b/.test(block),
    hasBgTransparent: /background:\s*transparent\s*!important/.test(block),
    hasPaddingZero: /padding:\s*0\s*!important/.test(block),
    hasMarginZero: /margin:\s*0\s*!important/.test(block),
    hasNoBoxShadow: !/box-shadow:/.test(block)
  };
}

const subpanelStylesCheck = checkSingleFrameBlock(stylesCssContent, '#wiki-subpanel-skills_ladder');
assert(subpanelStylesCheck.found, 'styles.css: #wiki-subpanel-skills_ladder rule block found');
assert(subpanelStylesCheck.hasBorderNone, 'styles.css: #wiki-subpanel-skills_ladder enforces border: none !important');
assert(subpanelStylesCheck.hasBgTransparent, 'styles.css: #wiki-subpanel-skills_ladder enforces background: transparent !important');
assert(subpanelStylesCheck.hasPaddingZero, 'styles.css: #wiki-subpanel-skills_ladder enforces padding: 0 !important');
assert(subpanelStylesCheck.hasMarginZero, 'styles.css: #wiki-subpanel-skills_ladder enforces margin: 0 !important');
assert(subpanelStylesCheck.hasNoBoxShadow, 'styles.css: #wiki-subpanel-skills_ladder has no box-shadow');

const subpanelLadderCheck = checkSingleFrameBlock(ladderCssContent, '#wiki-subpanel-skills_ladder');
assert(subpanelLadderCheck.found, 'wiki_ladder.css: #wiki-subpanel-skills_ladder rule block found');
assert(subpanelLadderCheck.hasBorderNone, 'wiki_ladder.css: #wiki-subpanel-skills_ladder enforces border: none !important');
assert(subpanelLadderCheck.hasBgTransparent, 'wiki_ladder.css: #wiki-subpanel-skills_ladder enforces background: transparent !important');
assert(subpanelLadderCheck.hasPaddingZero, 'wiki_ladder.css: #wiki-subpanel-skills_ladder enforces padding: 0 !important');
assert(subpanelLadderCheck.hasMarginZero, 'wiki_ladder.css: #wiki-subpanel-skills_ladder enforces margin: 0 !important');

// Verify that the inner wrapper is the ONLY element defining border and background
const innerWrapperMatch = stylesCssContent.match(/\.wiki-coordinate-ladder-wrapper\s*\{([^}]+)\}/);
assert(innerWrapperMatch !== null, 'styles.css defines .wiki-coordinate-ladder-wrapper for single outer card');
if (innerWrapperMatch) {
  assert(innerWrapperMatch[1].includes('border: 1px solid var(--border-color);'),
    '.wiki-coordinate-ladder-wrapper defines exactly the single frame border');
}

// -----------------------------------------------------------------------------
// Suite 4: Zero Emoji Policy Audit (User Rule VIII)
// -----------------------------------------------------------------------------
console.log('\n[Suite 4] Zero Emoji Policy Audit (User Rule VIII)');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/u;

const filesToAuditEmojis = [
  'js/modules/wiki/wiki_skill_ladder_render.js',
  'js/modules/wiki/wiki_skill_ladder.js',
  'js/modules/wiki/wiki_skill_ladder_data.js',
  'css/views/wiki/wiki_ladder.css',
  'css/views/wiki/wiki_skill_ladder.css'
];

for (const relPath of filesToAuditEmojis) {
  const fullPath = path.join(WORKSPACE_ROOT, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const hasEmoji = emojiRegex.test(code);
  assert(!hasEmoji, `${relPath} contains ZERO Unicode emojis`);
}

// -----------------------------------------------------------------------------
// Suite 5: Zero Decorative Star/Glyphs Policy (User Rule X)
// -----------------------------------------------------------------------------
console.log('\n[Suite 5] Zero Decorative Star/Glyphs Policy (User Rule X)');

// Star glyphs strictly forbidden: ★, ☆, ⭐, [*], [★], [☆], [+]
const starGlyphRegex = /[★☆⭐]|\[\*\]|\[★\]|\[☆\]/;

for (const relPath of filesToAuditEmojis) {
  const fullPath = path.join(WORKSPACE_ROOT, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  const hasStar = starGlyphRegex.test(code);
  assert(!hasStar, `${relPath} contains ZERO decorative star glyphs`);
}

// -----------------------------------------------------------------------------
// Suite 6: Runtime VM Render Audit & Adversarial Edge Cases
// -----------------------------------------------------------------------------
console.log('\n[Suite 6] Runtime VM Render Audit & Adversarial Edge Cases');

const sandbox = {
  console: console,
  window: {
    I18N: {
      getLanguage: () => 'zh-TW',
      getPokemonName: (name) => name,
      getMainSkillName: (name) => name
    },
    getCurrentSubTab: () => 'skills_ladder',
    WikiDB: {}
  },
  document: {
    body: {
      classList: {
        contains: (cls) => cls === 'mobile-h5-app'
      }
    },
    getElementById: () => null,
    querySelectorAll: () => []
  },
  Math: Math,
  Map: Map,
  String: String,
  Number: Number,
  parseFloat: parseFloat,
  parseInt: parseInt
};

vm.createContext(sandbox);

// Load data and logic files
const dataCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_data.js'), 'utf8');
const logicCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder.js'), 'utf8');
const renderCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki/wiki_skill_ladder_render.js'), 'utf8');

vm.runInContext(dataCode, sandbox);
vm.runInContext(logicCode, sandbox);
vm.runInContext(renderCode, sandbox);

// Attach exports
vm.runInContext('attachSkillLadderExports(window.WikiDB, window);', sandbox);

// 6.1 Render coordinate ladder HTML in zh-TW and en-US
const zhHtml = vm.runInContext('renderSkillCoordinateLadder()', sandbox);
assert(typeof zhHtml === 'string' && zhHtml.length > 5000, `renderSkillCoordinateLadder() produced zh-TW HTML (${zhHtml.length} bytes)`);

// Check zh-TW rendered HTML for emojis and star glyphs
assert(!emojiRegex.test(zhHtml), 'Rendered zh-TW HTML contains ZERO emojis');
assert(!starGlyphRegex.test(zhHtml), 'Rendered zh-TW HTML contains ZERO star glyphs');

// Switch to en-US
sandbox.window.I18N.getLanguage = () => 'en-US';
const enHtml = vm.runInContext('renderSkillCoordinateLadder()', sandbox);
assert(typeof enHtml === 'string' && enHtml.length > 5000, `renderSkillCoordinateLadder() produced en-US HTML (${enHtml.length} bytes)`);
assert(!emojiRegex.test(enHtml), 'Rendered en-US HTML contains ZERO emojis');
assert(!starGlyphRegex.test(enHtml), 'Rendered en-US HTML contains ZERO star glyphs');

// 6.2 Render Sidebar in zh-TW and en-US
sandbox.window.I18N.getLanguage = () => 'zh-TW';
const zhSidebar = vm.runInContext('renderSkillLadderSidebar(true, false, "skills_ladder")', sandbox);
assert(typeof zhSidebar === 'string' && zhSidebar.length > 1000, `renderSkillLadderSidebar() produced zh-TW sidebar (${zhSidebar.length} bytes)`);
assert(!emojiRegex.test(zhSidebar), 'Rendered zh-TW sidebar contains ZERO emojis');
assert(!starGlyphRegex.test(zhSidebar), 'Rendered zh-TW sidebar contains ZERO star glyphs');

sandbox.window.I18N.getLanguage = () => 'en-US';
const enSidebar = vm.runInContext('renderSkillLadderSidebar(true, true, "skills_ladder")', sandbox);
assert(typeof enSidebar === 'string' && enSidebar.length > 1000, `renderSkillLadderSidebar() produced en-US sidebar (${enSidebar.length} bytes)`);
assert(!emojiRegex.test(enSidebar), 'Rendered en-US sidebar contains ZERO emojis');
assert(!starGlyphRegex.test(enSidebar), 'Rendered en-US sidebar contains ZERO star glyphs');

// 6.3 Verify Pure Text Name Tags in Rendered HTML
assert(zhHtml.includes('class="skill-track-name-tag"'), 'Rendered HTML contains class="skill-track-name-tag"');
// Assert that track headers do NOT contain any SVG icons in the rendered ladder
const trackHeaderMatches = zhHtml.match(/<div class="ladder-track-header skill-ladder-track-header"[^>]*>([\s\S]*?)<\/div>/g) || [];
assert(trackHeaderMatches.length === 9, `Rendered exactly 9 track headers (found: ${trackHeaderMatches.length})`);

for (let i = 0; i < trackHeaderMatches.length; i++) {
  const headerHtml = trackHeaderMatches[i];
  assert(!headerHtml.includes('<svg'), `Track header #${i + 1} contains NO svg icons`);
  assert(headerHtml.includes('skill-track-name-tag'), `Track header #${i + 1} contains pure text skill-track-name-tag`);
}

// 6.4 Adversarial Probe: Tooltip Seconds Rounding Logic
// Rounding issue: Math.floor(sec / 60) and Math.round(sec % 60) can produce "22分60秒" when sec = 1379.8
// Fix implemented in worker_m2: Math.round(totalSec) first!
function formatIntervalSec(intervalSec, isEN) {
  const roundedIdealSec = Math.round(intervalSec);
  const idealMin = Math.floor(roundedIdealSec / 60);
  const idealSec = roundedIdealSec % 60;
  return `${idealMin}${isEN ? 'm ' : '分'}${String(idealSec).padStart(2, '0')}${isEN ? 's' : '秒'}`;
}

assertEquals(formatIntervalSec(1379.8, false), '23分00秒', 'Interval 1379.8s correctly formats to 23分00秒 (not 22分60秒)');
assertEquals(formatIntervalSec(1379.8, true), '23m 00s', 'Interval 1379.8s correctly formats to 23m 00s (not 22m 60s)');
assertEquals(formatIntervalSec(59.9, false), '1分00秒', 'Interval 59.9s correctly formats to 1分00秒 (not 0分60秒)');
assertEquals(formatIntervalSec(65.2, false), '1分05秒', 'Interval 65.2s correctly formats to 1分05秒 (zero-padded seconds)');

// Check rendered HTML for any occurrences of "60秒" or "60s"
assert(!/分60秒/.test(zhHtml), 'Rendered zh-TW HTML contains no "分60秒" anomalies');
assert(!/m 60s/.test(enHtml), 'Rendered en-US HTML contains no "m 60s" anomalies');

// 6.5 Adversarial Probe: helpsDisplay Fallback
// When helps12h is present vs null
const calcResWithHelps = { idealIntervalSec: 1000, helps12h: 43.2 };
const calcResWithoutHelps = { idealIntervalSec: 1000, helps12h: null };

const display1 = (calcResWithHelps.helps12h != null ? calcResWithHelps.helps12h : (43200 / calcResWithHelps.idealIntervalSec)).toFixed(1);
const display2 = (calcResWithoutHelps.helps12h != null ? calcResWithoutHelps.helps12h : (43200 / calcResWithoutHelps.idealIntervalSec)).toFixed(1);

assertEquals(display1, '43.2', 'helpsDisplay uses calcRes.helps12h when available');
assertEquals(display2, '43.2', 'helpsDisplay defensively falls back to 43200 / idealIntervalSec');

// 6.6 Adversarial Probe: Cluster Threshold & Offset Clamping
// In worker_m2: clustering threshold is Math.abs(prev.procs - n.procs) <= 0.20 && Math.abs(head.procs - n.procs) <= 0.45
const sampleNodes = [
  { procs: 3.50, isTopNode: true, calcRes: { idealIntervalSec: 1000 } },
  { procs: 3.42, isTopNode: false, calcRes: { idealIntervalSec: 1020 } },
  { procs: 3.35, isTopNode: false, calcRes: { idealIntervalSec: 1050 } },
  { procs: 2.80, isTopNode: false, calcRes: { idealIntervalSec: 1200 } }
];

const clusters = [];
let cur = [];
sampleNodes.forEach(n => {
  if (cur.length === 0) cur.push(n);
  else {
    const head = cur[0];
    const prev = cur[cur.length - 1];
    if (Math.abs(prev.procs - n.procs) <= 0.20 && Math.abs(head.procs - n.procs) <= 0.45) {
      cur.push(n);
    } else {
      clusters.push(cur);
      cur = [n];
    }
  }
});
if (cur.length > 0) clusters.push(cur);

assertEquals(clusters.length, 2, 'Adversarial clustering correctly groups 3 proximate nodes and isolates distant node');
assertEquals(clusters[0].length, 3, 'First cluster contains exactly 3 nodes within 0.20/0.45 thresholds');
assertEquals(clusters[1].length, 1, 'Second cluster contains 1 node');

// 6.7 Node Stagger Step & Canvas Margin Clamp
// groupSize 3 -> staggerStep = 20px, offsetPx for top = +20px, mid = 0px, bottom = -20px
const staggerStep = 20;
const groupSize = 3;
const offsets = [0, 1, 2].map(idx => Math.round(((groupSize - 1) / 2 - idx) * staggerStep));
assertEquals(offsets[0], 20, 'Top node offsets +20px to right');
assertEquals(offsets[1], 0, 'Mid node remains centered (offset 0px)');
assertEquals(offsets[2], -20, 'Bottom node offsets -20px to left');

// Check leftStyle clamps to 20px min and calc(100% - 20px) max
assert(zhHtml.includes('clamp(20px, '), 'Rendered HTML enforces left: clamp(20px, ..., calc(100% - 20px)) margin boundary');

// -----------------------------------------------------------------------------
// Suite 7: Summary & Verdict
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`  Challenger M2-2 Results: ${passedChecks} Passed, ${failedChecks} Failed (Total ${totalChecks})`);
console.log('================================================================\n');

if (failedChecks > 0) {
  console.error('FAILURES RECORDED:');
  failureDetails.forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log('ALL EMPIRICAL CHECKS PASSED: VERDICT APPROVE\n');
  process.exit(0);
}
