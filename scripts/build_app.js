/**
 * build_app.js — Modular PokemonApp JS Bundler
 * ============================================
 * Compiles modular JS files from js/modules/pokedex/
 * (pokedex_core.js, pokedex_render.js, pokedex_formulas.js, pokedex_modal.js)
 * into js/modules/app.js.
 * 
 * Zero external dependencies. Fast compilation (< 10ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const POKEDEX_DIR = path.join(ROOT_DIR, 'js', 'modules', 'pokedex');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'app.js');

const POKEDEX_MODULES = [
  'pokedex_base.js',
  'pokedex_skills.js',
  'pokedex_search.js',
  'pokedex_overlay.js',
  'pokedex_nav.js',
  'pokedex_filters.js',
  'pokedex_ui.js',
  'pokedex_detail_ctrl.js',
  'pokedex_calc.js',
  'pokedex_modal.js'
];

function buildApp() {
  const chunks = [];
  for (const mod of POKEDEX_MODULES) {
    const modPath = path.join(POKEDEX_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_app] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    chunks.push(content);
  }

  const bundledJs = chunks.join('\n');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: POKEDEX_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildApp();
  const elapsed = Date.now() - startTime;
  console.log(`[build_app] Successfully built ${result.modulesCount} modules into js/modules/app.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildApp, POKEDEX_MODULES };
