/**
 * build_css.js — Modular CSS Bundler for Pokémon Sleep SPA
 * ========================================================
 * Compiles granular modular CSS files from css/tokens.css, css/base.css,
 * css/components/, css/views/, and css/mobile/ into css/styles.css.
 * 
 * Zero external dependencies. Fast compilation (< 20ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CSS_DIR = path.join(ROOT_DIR, 'css');
const OUTPUT_FILE = path.join(CSS_DIR, 'styles.css');

// Granular modular CSS load order ensuring proper cascade & theme precedence
const CSS_MODULES = [
  'tokens.css',
  'base.css',
  'components/tables.css',
  'components/buttons_badges.css',
  'components/modals/settings_modal.css',
  'components/modals/pokedex_modal.css',
  'components/modals/item_modal.css',
  'views/pokedex.css',
  'views/news.css',
  'views/box.css',
  'views/wiki/wiki_base.css',
  'views/wiki/wiki_camps_ladder.css',
  'views/wiki/wiki_items.css',
  'views/lab.css',
  'mobile/dock.css',
  'mobile/wiki.css',
  'mobile/box.css',
  'mobile/items.css'
];

function buildCss() {
  const chunks = [];
  for (const mod of CSS_MODULES) {
    const modPath = path.join(CSS_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_css] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    chunks.push(content);
  }

  // Update composite legacy files for backwards compatibility
  const modalsContent = [
    fs.readFileSync(path.join(CSS_DIR, 'components/modals/settings_modal.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'components/modals/pokedex_modal.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'components/modals/item_modal.css'), 'utf8')
  ].join('\n');
  fs.writeFileSync(path.join(CSS_DIR, 'components/modals.css'), modalsContent, 'utf8');

  const wikiViewsContent = [
    fs.readFileSync(path.join(CSS_DIR, 'views/wiki/wiki_base.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'views/wiki/wiki_camps_ladder.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'views/wiki/wiki_items.css'), 'utf8')
  ].join('\n');
  fs.writeFileSync(path.join(CSS_DIR, 'views/wiki.css'), wikiViewsContent, 'utf8');

  const mobileContent = [
    fs.readFileSync(path.join(CSS_DIR, 'mobile/dock.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'mobile/wiki.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'mobile/box.css'), 'utf8'),
    fs.readFileSync(path.join(CSS_DIR, 'mobile/items.css'), 'utf8')
  ].join('\n');
  fs.writeFileSync(path.join(CSS_DIR, 'mobile-h5.css'), mobileContent, 'utf8');

  const bundledCss = chunks.join('\n');
  fs.writeFileSync(OUTPUT_FILE, bundledCss, 'utf8');
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
  console.log(`[build_css] Successfully built ${result.modulesCount} granular modules into css/styles.css (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildCss, CSS_MODULES };
