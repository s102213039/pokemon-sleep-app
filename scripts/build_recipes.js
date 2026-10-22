/**
 * build_recipes.js — Modular Recipes Module Bundler
 * ==================================================
 * Compiles modular JS files from js/modules/recipes/ into js/modules/recipes.js.
 * Zero external dependencies. Fast compilation (< 5ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RECIPES_DIR = path.join(ROOT_DIR, 'js', 'modules', 'recipes');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'recipes.js');

const RECIPES_MODULES = [
  'recipes_state.js',
  'recipes_render.js'
];

function buildRecipes() {
  const chunks = [];
  for (const mod of RECIPES_MODULES) {
    const modPath = path.join(RECIPES_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_recipes] Missing module: ${modPath}`);
    }
    chunks.push(fs.readFileSync(modPath, 'utf8'));
  }

  const bundledJs = chunks.join('');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: RECIPES_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildRecipes();
  const elapsed = Date.now() - startTime;
  console.log(`[build_recipes] Successfully built ${result.modulesCount} modules into js/modules/recipes.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildRecipes, RECIPES_MODULES };
