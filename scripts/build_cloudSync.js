/**
 * build_cloudSync.js — Modular CloudSync Engine Bundler
 * ====================================================
 * Compiles modular JS files from js/core/cloudSync/ into js/core/cloudSync.js.
 * Zero external dependencies. Fast compilation (< 5ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CS_DIR = path.join(ROOT_DIR, 'js', 'core', 'cloudSync');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'core', 'cloudSync.js');

const CLOUDSYNC_MODULES = [
  'cloudSync_data.js',
  'cloudSync_ui.js'
];

function buildCloudSync() {
  const chunks = [];
  for (const mod of CLOUDSYNC_MODULES) {
    const modPath = path.join(CS_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_cloudSync] Missing module: ${modPath}`);
    }
    chunks.push(fs.readFileSync(modPath, 'utf8'));
  }

  const bundledJs = chunks.join('');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: CLOUDSYNC_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildCloudSync();
  const elapsed = Date.now() - startTime;
  console.log(`[build_cloudSync] Successfully built ${result.modulesCount} modules into js/core/cloudSync.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildCloudSync, CLOUDSYNC_MODULES };
