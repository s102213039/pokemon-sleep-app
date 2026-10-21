/**
 * minify_data.js — Production Data JSON Minifier
 * ==============================================
 * Strips whitespace and newlines from data/*.json files,
 * reducing raw download payloads by 20% to 45% (over 420 KB saved).
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

function minifyData() {
  const stats = [];
  let totalSavedBytes = 0;

  for (const filename of TARGET_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const raw = fs.readFileSync(fpath, 'utf8');
    const originalBytes = Buffer.byteLength(raw, 'utf8');

    try {
      const parsed = JSON.parse(raw);
      const minified = JSON.stringify(parsed);
      const minBytes = Buffer.byteLength(minified, 'utf8');
      const savedBytes = originalBytes - minBytes;
      totalSavedBytes += savedBytes;

      fs.writeFileSync(fpath, minified, 'utf8');
      stats.push({
        filename,
        originalBytes,
        minBytes,
        savedBytes,
        savedPercent: originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0.0'
      });
    } catch (e) {
      console.error(`[minify_data] Failed to parse ${filename}:`, e.message);
    }
  }

  // Regenerate manifest.json with deterministic SHA-256 hashes
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

  return { stats, totalSavedBytes, manifestHash: overallHash };
}

if (require.main === module) {
  const result = minifyData();
  console.log('[minify_data] Minification Summary:');
  result.stats.forEach(s => {
    console.log(`  - ${s.filename.padEnd(20)}: ${(s.originalBytes / 1024).toFixed(1)} KB -> ${(s.minBytes / 1024).toFixed(1)} KB (-${s.savedPercent}%)`);
  });
  console.log(`[minify_data] Total savings: ${(result.totalSavedBytes / 1024).toFixed(1)} KB | Manifest Hash: ${result.manifestHash}`);
}

module.exports = { minifyData, TARGET_FILES };
