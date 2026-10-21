/**
 * build_appraisal.js — Modular Appraisal & Research Lab JS Bundler
 * ================================================================
 * Compiles modular JS files from js/modules/lab/
 * (lab_core.js, lab_team.js, lab_compare.js, lab_main.js)
 * into js/modules/appraisal.js.
 * 
 * Zero external dependencies. Fast compilation (< 10ms).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const LAB_DIR = path.join(ROOT_DIR, 'js', 'modules', 'lab');
const OUTPUT_FILE = path.join(ROOT_DIR, 'js', 'modules', 'appraisal.js');

const LAB_MODULES = [
  'lab_core.js',
  'lab_team.js',
  'lab_compare.js',
  'lab_main.js'
];

function buildAppraisal() {
  const chunks = [];
  for (const mod of LAB_MODULES) {
    const modPath = path.join(LAB_DIR, mod);
    if (!fs.existsSync(modPath)) {
      throw new Error(`[build_appraisal] Missing module: ${modPath}`);
    }
    const content = fs.readFileSync(modPath, 'utf8');
    chunks.push(content);
  }

  const bundledJs = chunks.join('\n');
  fs.writeFileSync(OUTPUT_FILE, bundledJs, 'utf8');
  return {
    modulesCount: LAB_MODULES.length,
    totalBytes: Buffer.byteLength(bundledJs, 'utf8'),
    totalLines: bundledJs.split('\n').length
  };
}

if (require.main === module) {
  const startTime = Date.now();
  const result = buildAppraisal();
  const elapsed = Date.now() - startTime;
  console.log(`[build_appraisal] Successfully built ${result.modulesCount} modules into js/modules/appraisal.js (${result.totalLines} lines, ${(result.totalBytes / 1024).toFixed(1)} KB) in ${elapsed}ms`);
}

module.exports = { buildAppraisal, LAB_MODULES };
