/**
 * build_i18n.js — Modular I18N Engine Bundler
 * ===========================================
 * Compiles modular JS files from js/core/i18n/ into js/core/i18n.js.
 * Zero external dependencies. Fast compilation (< 5ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const I18N_DIR = path.join(ROOT_DIR, 'js', 'core', 'i18n');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'core', 'i18n.js');

const I18N_MODULES = [
  'i18n_header.js',
  'i18n_dict_zh_tw.js',
  'i18n_dict_zh_cn.js',
  'i18n_dict_en_us.js',
  'i18n_entities.js',
  'i18n_t2s.js',
  'i18n_core.js'
];

function buildI18n() {
  const chunks = [];
  for (const mod of I18N_MODULES) {
    const modPath = path.join(I18N_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_i18n] Missing module: ${modPath}`);
    }
    chunks.push(fs.readFileSync(modPath, 'utf8'));
  }

  const bundledJs = chunks.join('');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: I18N_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildI18n();
  const elapsed = Date.now() - startTime;
  console.log(`[build_i18n] Successfully built ${result.modulesCount} modules into js/core/i18n.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildI18n, I18N_MODULES };
