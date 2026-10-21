/**
 * format_data.js — Developer Data JSON Pretty-Printer
 * ====================================================
 * Formats data/*.json files with clean 2-space indentation
 * for human/AI inspection, editing, and granular git diffs.
 * Automatically updates SHA-256 hashes in data/manifest.json.
 * 
 * Zero external dependencies. Fast execution (< 50ms).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const MANIFEST_PATH = path.join(DATA_DIR, 'manifest.json');

const TARGET_FILES = [
  'data.json',
  'recipes.json',
  'news.json',
  'sleep_styles.json',
  'items.json',
  'special_icons.json',
  'ladder_lv60.json'
];

function formatData() {
  const stats = [];

  for (const filename of TARGET_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const raw = fs.readFileSync(fpath, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      const formatted = JSON.stringify(parsed, null, 2) + '\n';
      fs.writeFileSync(fpath, formatted, 'utf8');
      stats.push({ filename, lines: formatted.split('\n').length });
    } catch (e) {
      console.error(`[format_data] Failed to format ${filename}:`, e.message);
    }
  }

  // Update manifest.json
  const filesMeta = {};
  const combinedHashes = [];

  for (const filename of TARGET_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const rawBytes = fs.readFileSync(fpath);
    const hash = crypto.createHash('sha256').update(rawBytes).digest('hex').slice(0, 16);
    let count = 0;
    try {
      const parsed = JSON.parse(rawBytes.toString('utf8'));
      if (Array.isArray(parsed)) count = parsed.length;
      else if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.byName && typeof parsed.byName === 'object') count = Object.keys(parsed.byName).length;
        else count = Object.keys(parsed).length;
      }
    } catch (e) {}

    filesMeta[filename] = { hash, size: rawBytes.length, count };
    combinedHashes.push(`${filename}:${hash}`);
  }

  const overallHash = crypto.createHash('sha256').update(combinedHashes.join('|')).digest('hex').slice(0, 16);

  let existingManifest = null;
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
    } catch (e) {}
  }

  const updatedAt = (existingManifest && existingManifest.manifestHash === overallHash)
    ? existingManifest.updatedAt
    : new Date().toISOString();

  const manifest = {
    version: 1,
    manifestHash: overallHash,
    updatedAt,
    files: filesMeta
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return { stats, manifestHash: overallHash };
}

if (require.main === module) {
  const result = formatData();
  console.log('[format_data] Formatted all data files:');
  result.stats.forEach(s => console.log(`  - ${s.filename.padEnd(20)}: ${s.lines} lines`));
  console.log(`[format_data] Manifest Hash: ${result.manifestHash}`);
}

module.exports = { formatData, TARGET_FILES };
