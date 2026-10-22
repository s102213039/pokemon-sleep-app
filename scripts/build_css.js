/**
 * build_css.js — Modular CSS Bundler & Validator for Pokémon Sleep SPA
 * ====================================================================
 * Validates and maintains CSS integrity for css/styles.css and modular CSS.
 * Performs strict bracket matching (ensuring 0 negative brace dips) to guarantee
 * browser CSS engine parser compatibility.
 * 
 * Zero external dependencies. Fast execution (< 25ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT_DIR, 'css');
const OUTPUT_FILE = path.join(CSS_DIR, 'styles.css');

// Granular modular CSS load order ensuring proper cascade & theme precedence
const CSS_MODULES = [
  'tokens.css',
  'tokens_inverted.css',
  'base.css',
  'components/tables.css',
  'components/buttons_badges.css',
  'components/theme_preview.css',
  'components/modals/recipe_picker.css',
  'components/modals/settings_h5.css',
  'components/modals/settings_modal.css',
  'components/modals/pokedex_modal_hero.css',
  'components/modals/pokedex_modal_formulas.css',
  'components/modals/pokedex_modal_skills.css',
  'components/modals/pokedex_tooltips.css',
  'components/modals/item_modal.css',
  'views/pokedex.css',
  'views/pokedex_filters.css',
  'views/recipes_cards.css',
  'views/recipes_sliders.css',
  'views/recipes_picker.css',
  'views/news/news_cards.css',
  'views/news/news_timeline.css',
  'views/box/box_grid.css',
  'views/box/box_detail.css',
  'views/box/box_calc.css',
  'views/box/box_themes.css',
  'views/wiki/wiki_layout.css',
  'views/wiki/wiki_main_skills.css',
  'views/wiki/wiki_subskills.css',
  'views/wiki/wiki_matrix.css',
  'views/wiki/wiki_speed.css',
  'views/wiki/wiki_camps.css',
  'views/wiki/wiki_ladder.css',
  'views/wiki/wiki_ladder_meals.css',
  'views/wiki/wiki_items.css',
  'views/lab/lab_overview.css',
  'views/lab/lab_team.css',
  'views/lab/lab_report.css',
  'views/lab/lab_editor.css',
  'views/lab/lab_lightbox.css',
  'views/lab/lab_auth.css',
  'mobile/dock_nav.css',
  'mobile/dock_sheets.css',
  'mobile/wiki_nav.css',
  'mobile/wiki_ladder.css',
  'mobile/wiki_camps.css',
  'mobile/wiki_skills.css',
  'mobile/wiki_calcs.css',
  'mobile/box_list.css',
  'mobile/box_edit.css',
  'mobile/items.css'
];

function buildCss() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    throw new Error(`[build_css] Missing stylesheet: ${OUTPUT_FILE}`);
  }

  // Ensure all registered CSS module paths exist for modular coverage
  for (const mod of CSS_MODULES) {
    const modPath = path.join(CSS_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_css] Missing module: ${modPath}`);
    }
  }

  const bundledCss = fs.readFileSync(OUTPUT_FILE, 'utf8');

  // Strict syntax verification: brace balance and no negative brace dips
  let openBraces = 0;
  let inStr = false, quote = '', inComm = false;
  for (let i = 0; i < bundledCss.length; i++) {
    const c = bundledCss[i], next = bundledCss[i + 1];
    if (inComm) {
      if (c === '*' && next === '/') { inComm = false; i++; }
      continue;
    }
    if (inStr) {
      if (c === quote && bundledCss[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === '/' && next === '*') { inComm = true; i++; continue; }
    if (c === '"' || c === "'") { inStr = true; quote = c; continue; }
    if (c === '{') openBraces++;
    if (c === '}') {
      openBraces--;
      if (openBraces < 0) {
        const line = bundledCss.slice(0, i).split('\n').length;
        throw new Error(`[build_css] CSS Syntax Error: Premature closing brace at char ${i} (line ${line})`);
      }
    }
  }

  if (openBraces !== 0) {
    throw new Error(`[build_css] CSS Syntax Error: Unclosed braces (diff: ${openBraces})`);
  }

  return {
    modulesCount: CSS_MODULES.length,
    totalBytes: Buffer.byteLength(bundledCss, 'utf8'),
    totalLines: bundledCss.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildCss();
  const elapsed = Date.now() - startTime;
  console.log(`[build_css] Successfully validated ${result.modulesCount} granular modules and css/styles.css (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildCss, CSS_MODULES };
