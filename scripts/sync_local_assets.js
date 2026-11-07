/**
 * scripts/sync_local_assets.js
 * Local asset mirror and synchronization worker for Pokemon Sleep app.
 *
 * Scans core data and module files for external Serebii asset URLs,
 * maps them to local assets/ directories, and downloads them with concurrency 15.
 * Handles fallback assets for known 404s and ensures all mapped files exist (>200 bytes).
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const TARGET_FILES = [
  'data/data.json',
  'data/recipes.json',
  'js/data/items.js',
  'js/core/i18n.js',
  'js/modules/app.js',
  'js/modules/wiki.js',
  'js/modules/box.js',
  'js/modules/appraisal.js',
  'js/modules/wiki/wiki_camps_island.js'
];

// Fallback sources for known 404s
const URL_FALLBACKS = {
  'https://www.serebii.net/pokemonsleep/pokemon/icon/546.png': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/546.png',
  'https://www.serebii.net/pokemonsleep/pokemon/icon/547.png': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/547.png'
};

function collectSerebiiUrls() {
  const urls = new Set();

  for (const relPath of TARGET_FILES) {
    const fullPath = path.join(ROOT_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`File not found: ${relPath}`);
      continue;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    // Unescape backslash-escaped single quotes
    content = content.replace(/\\'/g, "'");

    const serebiiRegex = /https:\/\/www\.serebii\.net\/[^\s"<>`]+?\.(?:png|jpg|jpeg|webp)/g;
    let match;
    while ((match = serebiiRegex.exec(content)) !== null) {
      let u = match[0].replace(/[;,]+$/, '');
      // Ignore template literals like ${p.formatted_no}.png
      if (u.includes('${')) continue;
      urls.add(u);
    }
  }

  // Check POKEMON_SPRITE_FALLBACK in wiki_camps_island.js
  const islandPath = path.join(ROOT_DIR, 'js/modules/wiki/wiki_camps_island.js');
  if (fs.existsSync(islandPath)) {
    const islandJs = fs.readFileSync(islandPath, 'utf8');
    const fallbackMatch = islandJs.match(/const POKEMON_SPRITE_FALLBACK = \{([\s\S]*?)\};/);
    if (fallbackMatch) {
      const lines = fallbackMatch[1].split('\n');
      for (const l of lines) {
        const m = l.match(/:\s*["']([^"']+)["']/);
        if (m) {
          urls.add(`https://www.serebii.net/pokemonsleep/pokemon/icon/${m[1]}.png`);
        }
      }
    }
  }

  // Check data.json for any formatted_no icons
  const dataPath = path.join(ROOT_DIR, 'data/data.json');
  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    for (const p of data) {
      if (p.icon_url && p.icon_url.startsWith('https://www.serebii.net/')) {
        urls.add(p.icon_url);
      } else if (p.formatted_no) {
        urls.add(`https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`);
      }
    }
  }

  return urls;
}

function mapUrlToLocalPaths(urlStr) {
  const u = new URL(urlStr);
  const p = u.pathname;

  // 1) /pokemonsleep/pokemon/icon/<fn> -> assets/pokemon/icon/<fn>
  if (p.startsWith('/pokemonsleep/pokemon/icon/')) {
    const fn = path.basename(p);
    return [path.join('assets/pokemon/icon', fn)];
  }

  // 2) /pokemonsleep/items/<fn> -> assets/items/<fn.replace(/'/g, '')> (and if has ', save to both)
  if (p.startsWith('/pokemonsleep/items/')) {
    const fn = path.basename(p);
    const cleanFn = fn.replace(/'/g, '');
    const res = [path.join('assets/items', cleanFn)];
    if (fn.includes("'")) {
      res.push(path.join('assets/items', fn));
    }
    return res;
  }

  // 3) /itemdex/sprites/<fn> -> assets/items/<fn.replace(/'/g, '')>
  if (p.startsWith('/itemdex/sprites/')) {
    const fn = path.basename(p);
    const cleanFn = fn.replace(/'/g, '');
    return [path.join('assets/items', cleanFn)];
  }

  // 4) /pokemonsleep/locations/<name>.jpg -> assets/islands/original/<name>-location.jpg
  if (p.startsWith('/pokemonsleep/locations/')) {
    const name = path.basename(p, path.extname(p));
    return [path.join('assets/islands/original', `${name}-location.jpg`)];
  }

  // 5) /pokemonsleep/berries/<fn> -> assets/berries/<fn>
  if (p.startsWith('/pokemonsleep/berries/')) {
    const fn = path.basename(p);
    return [path.join('assets/berries', fn)];
  }

  // 6) /pokemonsleep/ingredients/<fn> -> assets/ingredients/<fn>
  if (p.startsWith('/pokemonsleep/ingredients/')) {
    const fn = path.basename(p);
    return [path.join('assets/ingredients', fn)];
  }

  // 7) /pokemonsleep/meals/<fn> -> assets/meals/<fn>
  if (p.startsWith('/pokemonsleep/meals/')) {
    const fn = path.basename(p);
    const res = [path.join('assets/meals', fn)];
    if (fn.includes("'")) {
      res.push(path.join('assets/meals', fn.replace(/'/g, '')));
    }
    return res;
  }

  // 8) /pokemonsleep/star.png -> assets/star.png
  if (p === '/pokemonsleep/star.png') {
    return ['assets/star.png'];
  }

  return [];
}

async function fetchBufferWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });
      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return Buffer.from(arrayBuf);
      }
      if (res.status === 404) {
        return null; // Not found, return null immediately
      }
      if (attempt === maxRetries) {
        console.warn(`HTTP ${res.status} for ${url} after ${maxRetries} attempts`);
        return null;
      }
    } catch (err) {
      if (attempt === maxRetries) {
        console.warn(`Fetch error for ${url}: ${err.message}`);
        return null;
      }
    }
    // Exponential backoff
    await new Promise(r => setTimeout(r, attempt * 500));
  }
  return null;
}

async function main() {
  console.log('Collecting Serebii URLs from codebase...');
  const urls = collectSerebiiUrls();
  console.log(`Found ${urls.size} unique URLs.`);

  // Ensure target directories exist
  const requiredDirs = [
    'assets/items',
    'assets/berries',
    'assets/ingredients',
    'assets/meals',
    'assets/pokemon/icon',
    'assets/islands/original'
  ];
  for (const d of requiredDirs) {
    const fullDir = path.join(ROOT_DIR, d);
    if (!fs.existsSync(fullDir)) {
      fs.mkdirSync(fullDir, { recursive: true });
    }
  }

  // Build task list
  const tasks = [];
  const allMappedFiles = new Set();

  for (const u of urls) {
    const localPaths = mapUrlToLocalPaths(u);
    if (!localPaths || localPaths.length === 0) {
      console.warn(`Unmapped URL: ${u}`);
      continue;
    }

    localPaths.forEach(lp => allMappedFiles.add(lp));

    // Check if all local files for this URL already exist and > 200 bytes
    const needsDownload = localPaths.some(lp => {
      const full = path.join(ROOT_DIR, lp);
      if (!fs.existsSync(full)) return true;
      const stat = fs.statSync(full);
      return stat.size <= 200;
    });

    if (needsDownload) {
      tasks.push({ url: u, localPaths });
    }
  }

  console.log(`Total mapped files: ${allMappedFiles.size}`);
  console.log(`Downloads needed: ${tasks.length} / ${urls.size}`);

  // Download with concurrency 15
  const CONCURRENCY = 15;
  let taskIdx = 0;
  let downloadedCount = 0;
  let failedTasks = [];

  async function worker() {
    while (taskIdx < tasks.length) {
      const current = tasks[taskIdx++];
      let buf = await fetchBufferWithRetry(current.url);

      // Check fallback URL if 404
      if (!buf && URL_FALLBACKS[current.url]) {
        console.log(`Attempting fallback for ${current.url} -> ${URL_FALLBACKS[current.url]}`);
        buf = await fetchBufferWithRetry(URL_FALLBACKS[current.url]);
      }

      if (buf && buf.length > 200) {
        for (const lp of current.localPaths) {
          const full = path.join(ROOT_DIR, lp);
          fs.writeFileSync(full, buf);
        }
        downloadedCount++;
      } else {
        failedTasks.push(current);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker());
  }
  await Promise.all(workers);

  console.log(`Download phase finished. Downloaded: ${downloadedCount}, Failed/404: ${failedTasks.length}`);

  // Ensure king's rock double-copy
  const kingsRockClean = path.join(ROOT_DIR, 'assets/items/kingsrock.png');
  const kingsRockQuote = path.join(ROOT_DIR, "assets/items/king'srock.png");
  if (fs.existsSync(kingsRockClean) && !fs.existsSync(kingsRockQuote)) {
    fs.copyFileSync(kingsRockClean, kingsRockQuote);
  } else if (fs.existsSync(kingsRockQuote) && !fs.existsSync(kingsRockClean)) {
    fs.copyFileSync(kingsRockQuote, kingsRockClean);
  }

  // Ensure quote meal double-copies
  const quoteMeals = [
    ["assets/meals/jigglypuff'sfruityflan.png", "assets/meals/jigglypuffsfruityflan.png"],
    ["assets/meals/neroli'srestorativetea.png", "assets/meals/nerolisrestorativetea.png"]
  ];
  for (const [p1, p2] of quoteMeals) {
    const f1 = path.join(ROOT_DIR, p1);
    const f2 = path.join(ROOT_DIR, p2);
    if (fs.existsSync(f1) && !fs.existsSync(f2)) {
      fs.copyFileSync(f1, f2);
    } else if (fs.existsSync(f2) && !fs.existsSync(f1)) {
      fs.copyFileSync(f2, f1);
    }
  }

  // Verify all mapped files
  console.log('Verifying all mapped local files...');
  let invalidFiles = [];
  for (const lp of allMappedFiles) {
    const full = path.join(ROOT_DIR, lp);
    if (!fs.existsSync(full)) {
      invalidFiles.push({ path: lp, error: 'File does not exist' });
    } else {
      const s = fs.statSync(full);
      if (s.size <= 200) {
        invalidFiles.push({ path: lp, error: `File too small: ${s.size} bytes` });
      }
    }
  }

  if (invalidFiles.length > 0) {
    console.error(`Verification FAILED! ${invalidFiles.length} files invalid:`);
    for (const inv of invalidFiles) {
      console.error(`  - ${inv.path}: ${inv.error}`);
    }
    process.exit(1);
  }

  console.log(`Verification PASSED! All ${allMappedFiles.size} mapped files exist and are > 200 bytes.`);

  // Report counts per directory
  console.log('\nAsset Directory Summary:');
  for (const d of requiredDirs) {
    const fullDir = path.join(ROOT_DIR, d);
    const files = fs.readdirSync(fullDir).filter(f => !f.startsWith('.'));
    console.log(`  - ${d}: ${files.length} files`);
  }
  if (fs.existsSync(path.join(ROOT_DIR, 'assets/star.png'))) {
    console.log('  - assets/star.png: exists');
  }
}

main().catch(err => {
  console.error('Fatal error in sync_local_assets:', err);
  process.exit(1);
});
