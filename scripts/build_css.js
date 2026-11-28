/**
 * build_css.js - Modular CSS Bundler & Validator for Pokemon Sleep SPA
 * ===================================================================
 * Validates individual module brace balance (0 negative dips, 0 unclosed)
 * and deterministically concatenates all CSS_MODULES into css/styles.css.
 *
 * Zero external dependencies. Fast execution.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT_DIR, 'css');
const OUTPUT_FILE = path.join(CSS_DIR, 'styles.css');

// Exact runtime cascade order across 75 semantic CSS modules
const CSS_MODULES = [
  'tokens.css',
  'tokens_inverted.css',
  'base.css',
  'components/search_controls.css',
  'views/pokedex_sidebar.css',
  'views/pokedex_cards.css',
  'views/pokedex_table.css',
  'views/pokedex_filters.css',
  'views/recipes_cards.css',
  'components/custom_select.css',
  'mobile/responsive_panels.css',
  'views/news/news_cards.css',
  'views/news/news_calendar.css',
  'views/box/box_cards.css',
  'views/box/box_editor.css',
  'views/box/box_subskills.css',
  'views/box/box_guides_pr.css',
  'views/wiki/wiki_intro.css',
  'views/wiki/wiki_tables.css',
  'views/wiki/wiki_strategies.css',
  'views/wiki/wiki_ladder.css',
  'views/wiki/wiki_ladder_nodes.css',
  'views/wiki/wiki_skill_ladder.css',
  'views/wiki/wiki_ladder_sidebar.css',
  'views/wiki/wiki_values_grid.css',
  'views/lab/lab_appraisal_cards.css',
  'views/lab/lab_appraisal_radar.css',
  'views/lab/lab_appraisal_edit.css',
  'views/lab/lab_team_nav.css',
  'views/lab/lab_team.css',
  'views/lab/lab_recipe_picker.css',
  'views/lab/lab_compare.css',
  'views/lab/lab_pokemon_picker.css',
  'views/box/box_batch_ocr.css',
  'views/box/box_cloud_auth.css',
  'components/modals/settings_modal.css',
  'components/modals/settings_h5.css',
  'components/diagnostics.css',
  'mobile/h5_pokedex_viewport.css',
  'mobile/h5_fab_drawer.css',
  'mobile/h5_pull_to_refresh.css',
  'mobile/recipes_h5.css',
  'mobile/dock_nav.css',
  'mobile/wiki_subpanels.css',
  'mobile/wiki_ladder_h5.css',
  'mobile/wiki_values_camps_h5.css',
  'mobile/news_h5.css',
  'views/news/news_timeline.css',
  'components/modals/ing_rank_modal.css',
  'mobile/box_list.css',
  'mobile/box_fab_themes.css',
  'mobile/box_edit.css',
  'mobile/box_sheet_controls.css',
  'components/back_to_top.css',
  'views/wiki/wiki_camps.css',
  'views/wiki/wiki_camps_spawns.css',
  'views/wiki/wiki_ladder_meals.css',
  'views/wiki/wiki_ladder_passing.css',
  'mobile/wiki_ladder_meals_h5.css',
  'components/modals/pokedex_modal_hero.css',
  'components/modals/pokedex_modal_slots.css',
  'components/modals/pokedex_modal_formulas.css',
  'components/modals/pokedex_modal_themes.css',
  'components/modals/pokedex_modal_light.css',
  'mobile/responsive_modals.css',
  'mobile/modal_pokedex_sheet.css',
  'mobile/modal_overrides.css',
  'views/wiki/wiki_items.css',
  'components/item_categories.css',
  'mobile/items.css',
  'components/modals/wiki_item_modal.css',
  'views/lab/lab_growth.css',
  'views/box/box_quick_filters.css',
  'views/recipes_pantry.css',
  'views/wiki/wiki_ladder_overrides.css'
];

function validateBraceBalance(cssText, label) {
  let openBraces = 0;
  let minDepth = 0;
  let inStr = false;
  let quote = '';
  let inComm = false;

  for (let i = 0; i < cssText.length; i++) {
    const c = cssText[i];
    const next = cssText[i + 1];

    if (inComm) {
      if (c === '*' && next === '/') {
        inComm = false;
        i++;
      }
      continue;
    }
    if (inStr) {
      if (c === quote && cssText[i - 1] !== '\\') {
        inStr = false;
      }
      continue;
    }
    if (c === '/' && next === '*') {
      inComm = true;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inStr = true;
      quote = c;
      continue;
    }
    if (c === '{') {
      openBraces++;
    } else if (c === '}') {
      openBraces--;
      if (openBraces < minDepth) minDepth = openBraces;
      if (openBraces < 0) {
        const line = cssText.slice(0, i).split('\n').length;
        throw new Error(`[build_css] CSS Syntax Error in ${label}: Premature closing brace at char ${i} (line ${line})`);
      }
    }
  }

  if (openBraces !== 0 || minDepth !== 0) {
    throw new Error(`[build_css] CSS Syntax Error in ${label}: Unclosed braces (diff: ${openBraces}, minDepth: ${minDepth})`);
  }
}

function buildCss() {
  const chunks = [];

  for (const mod of CSS_MODULES) {
    const modPath = path.join(CSS_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_css] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    validateBraceBalance(content, `css/${mod}`);
    chunks.push(content.replace(/(?:\r?\n)+$/, ''));
  }

  const bundledCss = chunks.join('\n') + '\n';
  validateBraceBalance(bundledCss, 'css/styles.css');

  const existing = fs.existsSync(OUTPUT_FILE) ? fs.readFileSync(OUTPUT_FILE, 'utf8') : null;
  if (existing !== bundledCss) {
    fs.writeFileSync(OUTPUT_FILE, bundledCss, 'utf8');
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
  console.log(`[build_css] Successfully validated & bundled ${result.modulesCount} modules into css/styles.css (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildCss, CSS_MODULES };
