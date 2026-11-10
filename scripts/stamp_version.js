/**
 * stamp_version.js - Automatic cache-busting version stamper
 * ===========================================================
 * Computes a content hash over all production bundles (*.min.js / *.min.css).
 * When the content changed since the last stamp, a new version string
 * (YYYYMMDD_HHMM, UTC) is generated and written into:
 *   - index.html and app/index.html  (?v=... on every asset)
 *   - sw.js                          (STATIC_CACHE_NAME -> old static cache purged on activate)
 *   - js/core/domUtils.js            (CACHE_SCHEMA_VERSION is intentionally NOT touched: data cache is manifest-driven)
 * When content did not change, the existing version is kept (idempotent).
 *
 * State file: scripts/.build_stamp.json  { hash, version }
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(__dirname, '.build_stamp.json');

function listBundles() {
  const { PROD_FILES } = require('./build_prod.js');
  return PROD_FILES.map(f => path.join(ROOT_DIR, f.dest));
}

function computeHash(files) {
  const h = crypto.createHash('sha256');
  files.slice().sort().forEach(f => {
    h.update(path.relative(ROOT_DIR, f));
    h.update(fs.readFileSync(f));
  });
  return h.digest('hex');
}

function makeVersion() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}_${p(d.getUTCHours())}${p(d.getUTCMinutes())}`;
}

function replaceInFile(rel, regex, replacement) {
  const abs = path.join(ROOT_DIR, rel);
  if (!fs.existsSync(abs)) return false;
  const src = fs.readFileSync(abs, 'utf8');
  const out = src.replace(regex, replacement);
  if (out !== src) fs.writeFileSync(abs, out, 'utf8');
  return out !== src;
}

function applyVersion(version) {
  replaceInFile('index.html', /(\.min\.(?:js|css))\?v=[0-9A-Za-z_]+/g, `$1?v=${version}`);
  replaceInFile('app/index.html', /(\.min\.(?:js|css))\?v=[0-9A-Za-z_]+/g, `$1?v=${version}`);
  replaceInFile('sw.js', /pksleep-static-v[0-9A-Za-z_]+/g, `pksleep-static-v${version}`);
}

function stamp() {
  const files = listBundles();
  const hash = computeHash(files);
  let state = {};
  try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {}

  if (state.hash === hash && state.version) {
    applyVersion(state.version);
    return { changed: false, version: state.version };
  }
  const version = makeVersion();
  applyVersion(version);
  fs.writeFileSync(STATE_FILE, JSON.stringify({ hash, version }, null, 2) + '\n', 'utf8');
  return { changed: true, version };
}

if (require.main === module) {
  const r = stamp();
  console.log(`[stamp_version] ${r.changed ? 'New' : 'Unchanged'} version: ${r.version}`);
}

module.exports = { stamp };
