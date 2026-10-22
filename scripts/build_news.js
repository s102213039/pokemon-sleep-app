/**
 * build_news.js — Modular News Module Bundler
 * ===========================================
 * Compiles modular JS files from js/modules/news/ into js/modules/news.js.
 * Zero external dependencies. Fast compilation (< 5ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const NEWS_DIR = path.join(ROOT_DIR, 'js', 'modules', 'news');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'news.js');

const NEWS_MODULES = [
  'news_timeline.js',
  'news_render.js'
];

function buildNews() {
  const chunks = [];
  for (const mod of NEWS_MODULES) {
    const modPath = path.join(NEWS_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_news] Missing module: ${modPath}`);
    }
    chunks.push(fs.readFileSync(modPath, 'utf8'));
  }

  const bundledJs = chunks.join('');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: NEWS_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildNews();
  const elapsed = Date.now() - startTime;
  console.log(`[build_news] Successfully built ${result.modulesCount} modules into js/modules/news.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildNews, NEWS_MODULES };
