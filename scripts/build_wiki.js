/**
 * build_wiki.js — Modular Wiki JS Bundler
 * =======================================
 * Compiles modular JS files from js/modules/wiki/
 * (wiki_skills.js, wiki_ladder.js, wiki_camps.js, wiki_render.js, wiki_items.js, wiki_main.js)
 * into js/modules/wiki.js.
 * 
 * Zero external dependencies. Fast compilation (< 10ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const WIKI_DIR = path.join(ROOT_DIR, 'js', 'modules', 'wiki');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'wiki.js');

const WIKI_MODULES = [
  'wiki_skills_data.js',
  'wiki_skills_matrix.js',
  'wiki_ladder_recipes.js',
  'wiki_ladder_modal.js',
  'wiki_ladder_filter.js',
  'wiki_calculators.js',
  'wiki_sleep_styles.js',
  'wiki_camps_data.js',
  'wiki_camps_island.js',
  'wiki_camps_render.js',
  'wiki_render_ratings.js',
  'wiki_render_ladder.js',
  'wiki_render_skills.js',
  'wiki_items.js',
  'wiki_main.js'
];

function buildWiki() {
  const chunks = [];
  for (const mod of WIKI_MODULES) {
    const modPath = path.join(WIKI_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_wiki] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    chunks.push(content);
  }

  const bundledJs = chunks.join('\n');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: WIKI_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildWiki();
  const elapsed = Date.now() - startTime;
  console.log(`[build_wiki] Successfully built ${result.modulesCount} modules into js/modules/wiki.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildWiki, WIKI_MODULES };
