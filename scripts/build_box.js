/**
 * build_box.js — Modular Pokemon Box JS Bundler
 * =============================================
 * Compiles modular JS files from js/modules/box/
 * (box_filter.js, box_storage.js, box_modal.js, box_ocr.js, box_main.js)
 * into js/modules/box.js.
 * 
 * Zero external dependencies. Fast compilation (< 10ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BOX_DIR = path.join(ROOT_DIR, 'js', 'modules', 'box');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'box.js');

const BOX_MODULES = [
  'box_filter.js',
  'box_storage.js',
  'box_modal.js',
  'box_ocr.js',
  'box_main.js'
];

function buildBox() {
  const chunks = [];
  for (const mod of BOX_MODULES) {
    const modPath = path.join(BOX_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_box] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    chunks.push(content);
  }

  const bundledJs = chunks.join('\n');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: BOX_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildBox();
  const elapsed = Date.now() - startTime;
  console.log(`[build_box] Successfully built ${result.modulesCount} modules into js/modules/box.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildBox, BOX_MODULES };
