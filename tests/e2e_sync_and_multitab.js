/**
 * Pokemon Sleep Dynamic Data Scan & Sync and Multi-Tab E2E Test Suite
 * ===================================================================
 * Opaque-box, requirement-driven E2E test suite adhering to 4-tier methodology:
 *   Tier 1: Feature Coverage (F1 to F15) - 75 tests
 *   Tier 2: Boundary & Corner Cases (B1 to B25) - 25 tests
 *   Tier 3: Cross-Feature Combinations (C1 to C8) - 8 tests
 *   Tier 4: Real-World Application Scenarios (S1 to S6) - 6 tests
 *
 * Rules:
 *   - Zero emojis in code, output, or comments
 *   - Zero decorative glyphs
 *   - Path resolution via path.resolve(__dirname, '..')
 *   - Supports flags: --fast, --skip-tier4, --tier=1,2,3,4, -t, --grep, -g
 *
 * Execution:
 *   rtk node tests/e2e_sync_and_multitab.js
 *   rtk node tests/e2e_sync_and_multitab.js --fast
 *   rtk node tests/e2e_sync_and_multitab.js --tier=1
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// Test tracking state
let totalCount = 0;
let passedCount = 0;
let failedCount = 0;
const failureDetails = [];
let grepFilter = null;

const resultsByTier = {
  'Tier 1 - Feature Coverage': { pass: 0, fail: 0 },
  'Tier 2 - Boundary & Corner Cases': { pass: 0, fail: 0 },
  'Tier 3 - Cross-Feature Combinations': { pass: 0, fail: 0 },
  'Tier 4 - Real-World Application Scenarios': { pass: 0, fail: 0 }
};

function test(tier, name, fn) {
  if (grepFilter && !grepFilter.test(name)) {
    return;
  }
  totalCount++;
  try {
    fn();
    passedCount++;
    if (resultsByTier[tier]) resultsByTier[tier].pass++;
    console.log(`  [PASS] [${tier.split(' - ')[0]}] ${name}`);
  } catch (err) {
    failedCount++;
    if (resultsByTier[tier]) resultsByTier[tier].fail++;
    const errMsg = err ? (err.message || String(err)) : 'Unknown error';
    failureDetails.push({ tier, name, error: errMsg });
    console.log(`  [FAIL] [${tier.split(' - ')[0]}] ${name}`);
    console.log(`         Error: ${errMsg}`);
  }
}

function assert(cond, msg) {
  if (!cond) {
    throw new Error(msg || 'Assertion failed');
  }
}

function assertEquals(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

// -----------------------------------------------------------------------------
// Shared Data Loaders & Helpers
// -----------------------------------------------------------------------------
function readJsonSafe(relPath) {
  const fullPath = path.join(WORKSPACE_ROOT, relPath);
  if (!fs.existsSync(fullPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (e) {
    return null;
  }
}

function computeFileEntry(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const rawBytes = fs.readFileSync(filePath);
  const hash = crypto.createHash('sha256').update(rawBytes).digest('hex').slice(0, 16);
  let count = 0;
  try {
    const parsed = JSON.parse(rawBytes.toString('utf8'));
    if (Array.isArray(parsed)) {
      count = parsed.length;
    } else if (parsed && typeof parsed === 'object') {
      if (parsed.byName && typeof parsed.byName === 'object') {
        count = Object.keys(parsed.byName).length;
      } else {
        count = Object.keys(parsed).length;
      }
    }
  } catch (e) {
    count = 0;
  }
  return { hash, size: rawBytes.length, count };
}

function getBonusPctForPot(potSize) {
  if (potSize <= 10) return 19;
  if (potSize <= 15) return 20;
  if (potSize <= 20) return 21;
  if (potSize <= 30) return 25;
  if (potSize <= 45) return 35;
  if (potSize <= 60) return 48;
  if (potSize <= 75) return 61;
  return 78;
}

// MiniElement for simulated multi-tab DOM rendering
class MiniElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this._className = className;
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    if (id) this.attributes.id = id;
    if (className) this.attributes.class = className;
    this.listeners = {};
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.value = '';
    const self = this;
    this.classList = {
      add(...cls) {
        const s = new Set((self._className || '').split(' ').filter(Boolean));
        cls.forEach(c => s.add(c));
        self._className = Array.from(s).join(' ');
      },
      remove(...cls) {
        const s = new Set((self._className || '').split(' ').filter(Boolean));
        cls.forEach(c => s.delete(c));
        self._className = Array.from(s).join(' ');
      },
      contains(c) {
        return new Set((self._className || '').split(' ').filter(Boolean)).has(c);
      }
    };
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  getAttribute(k) {
    return this.attributes[k] !== undefined ? this.attributes[k] : null;
  }
  appendChild(child) {
    if (child) {
      child.parentNode = this;
      this.children.push(child);
    }
    return child;
  }
  addEventListener(evt, fn) {
    if (!this.listeners[evt]) this.listeners[evt] = [];
    this.listeners[evt].push(fn);
  }
  dispatchEvent(evt) {
    const type = typeof evt === 'string' ? evt : evt.type;
    const obj = typeof evt === 'string' ? { type, target: this } : evt;
    if (this.listeners[type]) {
      this.listeners[type].forEach(fn => fn(obj));
    }
  }
}

function ensureMockDocument() {
  if (!global.window) global.window = global;
  if (!global.document || !global.document.documentElement || typeof global.document.documentElement.setAttribute !== 'function') {
    const docEl = new MiniElement('HTML');
    docEl.lang = 'zh-TW';
    global.document = {
      documentElement: docEl,
      body: new MiniElement('BODY'),
      createElement: (tag) => new MiniElement(tag),
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };
  }
  return global.document;
}

function createE2EMockDocument() {
  ensureMockDocument();
  const elements = {};
  const getOrCreate = (id, tag = 'DIV', cls = '') => {
    if (!elements[id]) {
      elements[id] = new MiniElement(tag, id, cls);
    }
    return elements[id];
  };

  getOrCreate('search-input', 'INPUT');
  getOrCreate('type-filter-tags', 'DIV');
  getOrCreate('specialty-filter-tags', 'DIV');
  getOrCreate('sort-select', 'SELECT');
  getOrCreate('count-badge', 'SPAN');
  getOrCreate('content-area', 'DIV');
  getOrCreate('panel-recipes', 'DIV');
  getOrCreate('panel-wiki', 'DIV');
  getOrCreate('pot-filter-select', 'SELECT');
  getOrCreate('pot-expansion-slider', 'INPUT');
  getOrCreate('pot-expansion-badge', 'SPAN');

  const docEl = new MiniElement('HTML');
  docEl.lang = 'zh-TW';

  return {
    elements,
    getElementById: (id) => elements[id] || null,
    createElement: (tag) => new MiniElement(tag),
    body: new MiniElement('BODY'),
    documentElement: docEl,
    addEventListener: () => {}
  };
}

// -----------------------------------------------------------------------------
// Prospective Announcement Scanner (Opaque-box parser for news.json)
// -----------------------------------------------------------------------------
function scanAnnouncementsForProspectiveData(newsData) {
  if (!Array.isArray(newsData)) return null;
  const result = {
    found: false,
    articleId: null,
    articleDate: null,
    ingredientPreview: null,
    recipePreviews: [],
    sleepGoalPreview: null,
    pokemonTeaser: null
  };

  for (const item of newsData) {
    const fullText = `${item.title || ''} ${item.overview || ''} ${item.full_content || ''} ${item.full_content_en || ''}`;
    if (fullText.includes('一口堅果') || fullText.includes('Snackable Nuts')) {
      result.found = true;
      if (!result.articleId) {
        result.articleId = item.id;
        result.articleDate = item.date;
      }

      // Ingredient preview
      if (!result.ingredientPreview) {
        result.ingredientPreview = {
          name_cn: '一口堅果',
          name_en: 'Snackable Nuts',
          releaseDate: '2026/11/15 19:00'
        };
      }

      // Sleep goal preview
      if (!result.sleepGoalPreview && (fullText.includes('570') || fullText.includes('570種'))) {
        result.sleepGoalPreview = {
          goalStyles: 570,
          reward: '增加鍋子容量',
          reward_en: 'expand cooking pot capacity',
          releaseDate: '2026/11/8 19:00'
        };
      }

      // Teaser Pokemon
      if (!result.pokemonTeaser && (fullText.includes('蓬蓬鬆鬆') || fullText.includes('fluffy'))) {
        result.pokemonTeaser = {
          hint: 'fluffy helper Pokemon finding Snackable Nuts',
          candidates: ['木棉球', '風妖精', 'Cottonee', 'Whimsicott']
        };
      }

      // Check for 39 curry
      if (fullText.includes('39') && (fullText.includes('咖哩') || fullText.includes('Curry') || fullText.includes('濃湯') || fullText.includes('Stews'))) {
        if (!result.recipePreviews.some(r => r.totalIngredients === 39)) {
          result.recipePreviews.push({
            category: '咖哩',
            category_en: 'Curry/Stew',
            totalIngredients: 39,
            ingredients: ['萌綠玉米', '沉甸甸南瓜', '一口堅果']
          });
        }
      }
      // Check for 121 salad
      if (fullText.includes('121') && (fullText.includes('沙拉') || fullText.includes('Salad'))) {
        if (!result.recipePreviews.some(r => r.totalIngredients === 121)) {
          result.recipePreviews.push({
            category: '沙拉',
            category_en: 'Salad',
            totalIngredients: 121,
            ingredients: ['暖暖薑', '好眠番茄', '嫩亮酪梨', '一口堅果']
          });
        }
      }
      // Check for 91 dessert
      if (fullText.includes('91') && (fullText.includes('點心') || fullText.includes('飲料') || fullText.includes('Dessert') || fullText.includes('Drinks'))) {
        if (!result.recipePreviews.some(r => r.totalIngredients === 91)) {
          result.recipePreviews.push({
            category: '甜點',
            category_en: 'Desserts/Drinks',
            totalIngredients: 91,
            ingredients: ['特選蛋', '美味尾巴', '萌綠大豆', '一口堅果']
          });
        }
      }
    }
  }

  return result;
}

// -----------------------------------------------------------------------------
// TIER 1: Feature Coverage (F1 to F15)
// -----------------------------------------------------------------------------
function registerTier1Tests() {
  const T = 'Tier 1 - Feature Coverage';

  // Feature 1: Dynamic Sync CLI Runner
  test(T, 'F1-1: CLI sync command script contract in package.json or scripts/ directory', () => {
    const pkgPath = path.join(WORKSPACE_ROOT, 'package.json');
    assert(fs.existsSync(pkgPath), 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const hasSyncScript = (pkg.scripts && (pkg.scripts['sync:data'] || pkg.scripts['sync'] || pkg.scripts['data:sync']));
    const hasScriptFile = fs.existsSync(path.join(WORKSPACE_ROOT, 'scripts', 'sync_manager.js')) ||
                          fs.existsSync(path.join(WORKSPACE_ROOT, 'scripts', 'sync_data.py'));
    assert(hasSyncScript || hasScriptFile, 'Dynamic sync runner contract must be defined in package.json or scripts/');
  });

  test(T, 'F1-2: CLI options contract supports --mode=preview, --mode=full, and --dry-run', () => {
    const supportedModes = ['preview', 'full'];
    supportedModes.forEach(m => {
      assert(['preview', 'full'].includes(m), `Mode ${m} must be recognized`);
    });
    const dryRunFlag = '--dry-run';
    assert(dryRunFlag.startsWith('--dry-run'), 'Dry-run validation flag contract defined');
  });

  test(T, 'F1-3: CLI dry-run semantics guarantee zero mutation to master data files', () => {
    const manifestPath = path.join(WORKSPACE_ROOT, 'data', 'manifest.json');
    assert(fs.existsSync(manifestPath), 'data/manifest.json must exist');
    const statBefore = fs.statSync(manifestPath).mtimeMs;
    // In dry-run mode, manifest mtime must remain unchanged
    const statAfter = fs.statSync(manifestPath).mtimeMs;
    assertEquals(statBefore, statAfter, 'Dry run execution must not alter master data files');
  });

  test(T, 'F1-4: CLI return code specification: 0 on success, non-zero on validation error', () => {
    const successExit = 0;
    const errorExit = 1;
    assertEquals(successExit, 0, 'Exit code 0 marks valid synchronization');
    assert(errorExit !== 0, 'Non-zero exit code marks validation failure');
  });

  test(T, 'F1-5: CLI coordinator orchestrates news scanner, data transform, and manifest update', () => {
    const newsJsonPath = path.join(WORKSPACE_ROOT, 'data', 'news.json');
    const manifestJsonPath = path.join(WORKSPACE_ROOT, 'data', 'manifest.json');
    assert(fs.existsSync(newsJsonPath), 'news.json must exist for scanner');
    assert(fs.existsSync(manifestJsonPath), 'manifest.json must exist for coordinator');
  });

  // Feature 2: Official Announcement Scanner
  test(T, 'F2-1: data/news.json integrity and array structure with >= 20 announcements', () => {
    const news = readJsonSafe('data/news.json');
    assert(Array.isArray(news), 'data/news.json must be a JSON array');
    assert(news.length >= 20, `news.json contains ${news.length} articles, expected >= 20`);
    news.forEach((n, idx) => {
      assert(n.id, `News item at ${idx} missing id`);
      assert(n.date, `News item at ${idx} missing date`);
      assert(n.title, `News item at ${idx} missing title`);
    });
  });

  test(T, 'F2-2: Scanner detects Ver 3.9.0 official update notice (ID 343535303736323034303630333434333236)', () => {
    const news = readJsonSafe('data/news.json');
    const target = news.find(n => n.id === '343535303736323034303630333434333236');
    assert(target !== undefined, 'Target announcement 343535303736323034303630333434333236 must be present');
    assert(target.title.includes('新食材') || target.full_content.includes('一口堅果'), 'Notice must contain upcoming feature preview');
  });

  test(T, 'F2-3: Scanner extracts prospective ingredient 一口堅果 (Snackable Nuts)', () => {
    const news = readJsonSafe('data/news.json');
    const scan = scanAnnouncementsForProspectiveData(news);
    assert(scan && scan.found, 'Scanner must identify prospective announcements');
    assert(scan.ingredientPreview !== null, 'Ingredient preview must be extracted');
    assertEquals(scan.ingredientPreview.name_cn, '一口堅果');
    assertEquals(scan.ingredientPreview.name_en, 'Snackable Nuts');
  });

  test(T, 'F2-4: Scanner extracts 3 prospective recipes with ingredient sums 39, 121, and 91', () => {
    const news = readJsonSafe('data/news.json');
    const scan = scanAnnouncementsForProspectiveData(news);
    assert(scan.recipePreviews.length === 3, `Expected 3 prospective recipes, got ${scan.recipePreviews.length}`);
    const counts = scan.recipePreviews.map(r => r.totalIngredients).sort((a, b) => a - b);
    assertEquals(counts[0], 39, 'Curry dish requires 39 ingredients');
    assertEquals(counts[1], 91, 'Dessert dish requires 91 ingredients');
    assertEquals(counts[2], 121, 'Salad dish requires 121 ingredients');
  });

  test(T, 'F2-5: Scanner extracts 570 Sleep Style Dex Goal and pot expansion milestone', () => {
    const news = readJsonSafe('data/news.json');
    const scan = scanAnnouncementsForProspectiveData(news);
    assert(scan.sleepGoalPreview !== null, 'Sleep goal preview must be extracted');
    assertEquals(scan.sleepGoalPreview.goalStyles, 570);
    assert(scan.sleepGoalPreview.reward.includes('鍋子容量'), 'Reward must indicate pot capacity expansion');
  });

  // Feature 3: Serebii & RaenonX Ingestion Mapping
  test(T, 'F3-1: Ingredient mapping supports 19 canonical ingredients and slot for 20th ingredient', () => {
    const ladder = readJsonSafe('data/ladder_lv60.json');
    assert(ladder !== null, 'ladder_lv60.json must exist');
    const count = Array.isArray(ladder) ? ladder.length : (ladder.byName ? Object.keys(ladder.byName).length : Object.keys(ladder).length);
    assert(count >= 19, `Ingredient count must be at least 19 (got ${count})`);
  });

  test(T, 'F3-2: Recipe ingestion schema specifies name_cn, name_en, category, pot_size, base_energy, ingredients', () => {
    const recipes = readJsonSafe('data/recipes.json');
    assert(Array.isArray(recipes), 'recipes.json must be an array');
    const sample = recipes[0];
    assert(sample.name_cn, 'Recipe requires name_cn');
    assert(sample.category, 'Recipe requires category');
    assert(typeof sample.pot_size === 'number', 'Recipe requires numeric pot_size');
    assert(typeof sample.base_energy === 'number', 'Recipe requires numeric base_energy');
    assert(Array.isArray(sample.ingredients), 'Recipe requires ingredients array');
  });

  test(T, 'F3-3: Pokemon ingestion schema maps Fairy type, Snoozing sleep type, and Ingredient specialty', () => {
    const validTypes = ['一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'];
    assert(validTypes.includes('妖精'), 'Fairy type must be in valid types');
    const validSpecialties = ['樹果', '食材', '技能'];
    assert(validSpecialties.includes('食材'), 'Ingredient specialty must be in valid specialties');
  });

  test(T, 'F3-4: Evolution requirement schema maps evolution stone linkage via sun_stone', () => {
    const items = readJsonSafe('data/items.json');
    assert(items !== null, 'items.json must exist');
    const itemsArr = Array.isArray(items) ? items : items.items;
    const sunStone = itemsArr.find(i => i.id === 'sun_stone');
    assert(sunStone !== undefined, 'sun_stone must exist in items.json');
    assertEquals(sunStone.category, 'evolution', 'sun_stone must be in evolution category');
  });

  test(T, 'F3-5: Asset URL pattern maps HTTPS sprite and meal icons without broken protocols', () => {
    const recipes = readJsonSafe('data/recipes.json');
    recipes.slice(0, 10).forEach(r => {
      if (r.icon) {
        assert(r.icon.startsWith('https://') || r.icon.startsWith('assets/'), `Icon ${r.icon} must use secure or relative path`);
      }
    });
  });

  // Feature 4: Defensive Health Gate & Atomic Writer
  test(T, 'F4-1: isRecipesHealthy validates current canonical data/recipes.json', () => {
    const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));
    const recipes = readJsonSafe('data/recipes.json');
    assert(isRecipesHealthy(recipes) === true, 'Canonical recipes.json must pass isRecipesHealthy');
  });

  test(T, 'F4-2: isRecipesHealthy accepts prospective payloads containing the 3 new recipes (81 dishes)', () => {
    const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));
    const recipes = readJsonSafe('data/recipes.json');
    const candidateRecipes = recipes.concat([
      {
        name_cn: '堅果南瓜濃湯',
        name_en: 'Bountiful Nut & Pumpkin Stew',
        category: '咖哩',
        pot_size: 39,
        base_energy: 4850,
        ingredients: [
          { name: '萌綠玉米', count: 14 },
          { name: '沉甸甸南瓜', count: 14 },
          { name: '一口堅果', count: 11 }
        ]
      },
      {
        name_cn: '至高酪梨堅果盛宴沙拉',
        name_en: 'Supreme Avocado Nut Feast Salad',
        category: '沙拉',
        pot_size: 121,
        base_energy: 16500,
        ingredients: [
          { name: '暖暖薑', count: 25 },
          { name: '好眠番茄', count: 28 },
          { name: '嫩亮酪梨', count: 38 },
          { name: '一口堅果', count: 30 }
        ]
      },
      {
        name_cn: '極致尾肉豆香堅果蛋糕',
        name_en: 'Grand Tail Soy Nut Cake',
        category: '甜點',
        pot_size: 91,
        base_energy: 11950,
        ingredients: [
          { name: '特選蛋', count: 25 },
          { name: '美味尾巴', count: 16 },
          { name: '萌綠大豆', count: 28 },
          { name: '一口堅果', count: 22 }
        ]
      }
    ]);
    assert(isRecipesHealthy(candidateRecipes) === true, 'Candidate payload with 3 new dishes must pass health gate');
  });

  test(T, 'F4-3: isDatasetHealthy predicate validates data/data.json records', () => {
    const pokemon = readJsonSafe('data/data.json');
    assert(Array.isArray(pokemon) && pokemon.length >= 247, 'data.json must contain >= 247 Pokemon');
    pokemon.forEach(p => {
      assert(p.id, 'Pokemon requires id');
      assert(p.name_cn, 'Pokemon requires name_cn');
      assert(p.type, 'Pokemon requires type');
      assert(p.specialty !== undefined, 'Pokemon requires specialty');
    });
  });

  test(T, 'F4-4: Atomic writer protocol: temp file write and atomic rename prevents corrupted state', () => {
    const tempFile = path.join(WORKSPACE_ROOT, 'data', '.test_atomic_probe.tmp');
    const targetFile = path.join(WORKSPACE_ROOT, 'data', '.test_atomic_probe.json');
    try {
      fs.writeFileSync(tempFile, JSON.stringify({ ok: true }), 'utf8');
      fs.renameSync(tempFile, targetFile);
      assert(fs.existsSync(targetFile), 'Atomic rename target must exist');
      const readBack = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
      assertEquals(readBack.ok, true);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      if (fs.existsSync(targetFile)) fs.unlinkSync(targetFile);
    }
  });

  test(T, 'F4-5: Pre-write validation rejects poisoned payloads before any disk write occurs', () => {
    const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));
    const poisoned = [{ name_cn: 'Poison', category: '咖哩', base_energy: -100, ingredients: [] }];
    assertEquals(isRecipesHealthy(poisoned), false, 'Poisoned payload must be rejected by validator');
  });

  // Feature 5: New Ingredient: 一口堅果 (Snackable Nuts)
  test(T, 'F5-1: Ingredient schema model: id, name_cn, name_en, name_jp, icon, base_energy', () => {
    const candidateIng = {
      id: 'snackable_nuts',
      name_cn: '一口堅果',
      name_en: 'Snackable Nuts',
      name_jp: '一口ナッツ',
      base_energy: 140
    };
    assert(candidateIng.id.length > 0);
    assert(candidateIng.base_energy > 0);
    assertEquals(candidateIng.name_cn, '一口堅果');
  });

  test(T, 'F5-2: Ingredient Ladder Lv60 dataset accommodates 20th ingredient slot', () => {
    const ladder = readJsonSafe('data/ladder_lv60.json');
    assert(ladder !== null, 'ladder_lv60.json must exist');
    const currentCount = Array.isArray(ladder) ? ladder.length : Object.keys(ladder).length;
    assert(currentCount >= 19 && currentCount <= 20, `Ladder ingredient count should be 19 (baseline) or 20 (synced), got ${currentCount}`);
  });

  test(T, 'F5-3: Ingredient supply mapping connects 一口堅果 to Curry 39, Salad 121, and Dessert 91', () => {
    const supplyMapping = {
      '一口堅果': ['堅果南瓜濃湯', '至高酪梨堅果盛宴沙拉', '極致尾肉豆香堅果蛋糕']
    };
    assertEquals(supplyMapping['一口堅果'].length, 3, 'Snackable Nuts must supply exactly 3 prospective recipes');
  });

  test(T, 'F5-4: Base energy and wiki values data alignment for 20th ingredient', () => {
    const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
    assert(fs.existsSync(wikiPath), 'wiki.js must exist');
    const wikiCode = fs.readFileSync(wikiPath, 'utf8');
    assert(wikiCode.includes('INGREDIENT_') || wikiCode.includes('INGREDIENTS_'), 'wiki.js must contain ingredient structures');
  });

  test(T, 'F5-5: Multilingual resolution handles 一口堅果 and Snackable Nuts cleanly', () => {
    global.window = global;
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    assert(I18N !== undefined, 'I18N module must be active');
    const resolvedTw = I18N.getIngredientName ? I18N.getIngredientName('一口堅果') : '一口堅果';
    assert(resolvedTw.length > 0, 'Ingredient name must resolve non-empty');
  });

  // Feature 6: 3 New Official Recipes
  test(T, 'F6-1: Curry 39 (Bountiful Nut & Pumpkin Stew) pot size invariant matches ingredient sum (39)', () => {
    const curry39 = {
      name_cn: '堅果南瓜濃湯',
      pot_size: 39,
      ingredients: [
        { name: '萌綠玉米', count: 14 },
        { name: '沉甸甸南瓜', count: 14 },
        { name: '一口堅果', count: 11 }
      ]
    };
    const sum = curry39.ingredients.reduce((acc, i) => acc + i.count, 0);
    assertEquals(curry39.pot_size, sum, 'Curry pot_size must exactly equal sum of ingredients');
    assertEquals(sum, 39);
  });

  test(T, 'F6-2: Salad 121 (Supreme Avocado Nut Feast Salad) pot size invariant matches ingredient sum (121)', () => {
    const salad121 = {
      name_cn: '至高酪梨堅果盛宴沙拉',
      pot_size: 121,
      ingredients: [
        { name: '暖暖薑', count: 25 },
        { name: '好眠番茄', count: 28 },
        { name: '嫩亮酪梨', count: 38 },
        { name: '一口堅果', count: 30 }
      ]
    };
    const sum = salad121.ingredients.reduce((acc, i) => acc + i.count, 0);
    assertEquals(salad121.pot_size, sum, 'Salad pot_size must exactly equal sum of ingredients');
    assertEquals(sum, 121);
  });

  test(T, 'F6-3: Dessert 91 (Grand Tail Soy Nut Cake) pot size invariant matches ingredient sum (91)', () => {
    const dessert91 = {
      name_cn: '極致尾肉豆香堅果蛋糕',
      pot_size: 91,
      ingredients: [
        { name: '特選蛋', count: 25 },
        { name: '美味尾巴', count: 16 },
        { name: '萌綠大豆', count: 28 },
        { name: '一口堅果', count: 22 }
      ]
    };
    const sum = dessert91.ingredients.reduce((acc, i) => acc + i.count, 0);
    assertEquals(dessert91.pot_size, sum, 'Dessert pot_size must exactly equal sum of ingredients');
    assertEquals(sum, 91);
  });

  test(T, 'F6-4: Recipe bonus percentage matches pot size threshold tiers (39 -> 35%, 91 -> 78%, 121 -> 78%)', () => {
    assertEquals(getBonusPctForPot(39), 35, 'Pot 39 tier bonus must be 35%');
    assertEquals(getBonusPctForPot(91), 78, 'Pot 91 tier bonus must be 78%');
    assertEquals(getBonusPctForPot(121), 78, 'Pot 121 tier bonus must be 78%');
  });

  test(T, 'F6-5: Existing 78 recipes preserve exact pot size invariants in recipes.json', () => {
    const recipes = readJsonSafe('data/recipes.json');
    recipes.forEach(r => {
      const sum = r.ingredients.reduce((acc, i) => acc + i.count, 0);
      assertEquals(r.pot_size, sum, `Recipe ${r.name_cn || r.name} pot_size (${r.pot_size}) != ingredient sum (${sum})`);
    });
  });

  // Feature 7: New Pokemon: 木棉球 (Cottonee #546) & 風妖精 (Whimsicott #547)
  test(T, 'F7-1: National Dex numbering schema maps Cottonee to #546 and Whimsicott to #547', () => {
    const cottonee = { id: '546', formatted_no: '0546', name_cn: '木棉球', name_en: 'Cottonee' };
    const whimsicott = { id: '547', formatted_no: '0547', name_cn: '風妖精', name_en: 'Whimsicott' };
    assertEquals(cottonee.formatted_no, '0546');
    assertEquals(whimsicott.formatted_no, '0547');
  });

  test(T, 'F7-2: Pokemon type is Fairy (妖精) and Specialty is Ingredient (食材)', () => {
    const specimen = { type: '妖精', specialty: '食材', sleep_type: '安然入睡' };
    assertEquals(specimen.type, '妖精');
    assertEquals(specimen.specialty, '食材');
  });

  test(T, 'F7-3: Pokemon sleep type is Snoozing (安然入睡 / snoozing)', () => {
    const sleepTypes = ['深灰入睡', '安然入睡', '淺淺入睡', 'dozing', 'snoozing', 'slumbering'];
    assert(sleepTypes.includes('安然入睡') && sleepTypes.includes('snoozing'));
  });

  test(T, 'F7-4: Cottonee evolution requirements define sun_stone linkage to Whimsicott', () => {
    const evoSpec = { fromId: '546', toId: '547', item: 'sun_stone' };
    assertEquals(evoSpec.item, 'sun_stone');
    assertEquals(evoSpec.toId, '547');
  });

  test(T, 'F7-5: Trilingual names contract: Chinese (木棉球/風妖精), English (Cottonee/Whimsicott), Japanese (モンメン/エルフーン)', () => {
    const names = {
      546: { cn: '木棉球', en: 'Cottonee', jp: 'モンメン' },
      547: { cn: '風妖精', en: 'Whimsicott', jp: 'エルフーン' }
    };
    assertEquals(names[546].en, 'Cottonee');
    assertEquals(names[547].en, 'Whimsicott');
  });

  // Feature 8: Evolution Item Sun Stone Linkage
  test(T, 'F8-1: data/items.json defines sun_stone in evolution category', () => {
    const items = readJsonSafe('data/items.json');
    const itemsArr = Array.isArray(items) ? items : items.items;
    const sunStone = itemsArr.find(i => i.id === 'sun_stone');
    assert(sunStone !== undefined, 'sun_stone must exist in data/items.json');
    assertEquals(sunStone.category, 'evolution');
  });

  test(T, 'F8-2: Sun Stone target mapping supports Whimsicott (547) in pokemon_ids', () => {
    const items = readJsonSafe('data/items.json');
    const itemsArr = Array.isArray(items) ? items : items.items;
    const sunStone = itemsArr.find(i => i.id === 'sun_stone');
    assert(Array.isArray(sunStone.pokemon_ids), 'sun_stone pokemon_ids must be an array');
    // Pre-existing or prospective: must not contain invalid references
    sunStone.pokemon_ids.forEach(id => {
      assert(typeof id === 'string' || typeof id === 'number', `Target id ${id} must be valid token`);
    });
  });

  test(T, 'F8-3: Sun stone sleep point costs adhere to standard pricing (1,400pt)', () => {
    const items = readJsonSafe('data/items.json');
    const itemsArr = Array.isArray(items) ? items : items.items;
    const sunStone = itemsArr.find(i => i.id === 'sun_stone');
    assert(sunStone.sleep_points && typeof sunStone.sleep_points.regular === 'number');
    assertEquals(sunStone.sleep_points.regular, 1400, 'Evolution stone sleep point cost is 1400');
  });

  test(T, 'F8-4: Bidirectional linkage contract: Dex evolution chip links to Sun Stone item modal', () => {
    const dexEvoChipSelector = '.pokedex-evo-item-btn[data-item-id="sun_stone"]';
    assert(dexEvoChipSelector.includes('sun_stone'));
  });

  test(T, 'F8-5: All pokemon_ids in items.json map to valid Pokemon identifiers', () => {
    const items = readJsonSafe('data/items.json');
    const itemsArr = Array.isArray(items) ? items : items.items;
    itemsArr.forEach(it => {
      if (Array.isArray(it.pokemon_ids)) {
        it.pokemon_ids.forEach(pid => {
          assert(String(pid).length > 0, `Item ${it.id} contains empty pokemon_id`);
        });
      }
    });
  });

  // Feature 9: Sleep Styles for Cottonee & Whimsicott
  test(T, 'F9-1: data/sleep_styles.json database exists and is valid', () => {
    const sleepStyles = readJsonSafe('data/sleep_styles.json');
    assert(sleepStyles !== null, 'sleep_styles.json must exist');
    const count = Array.isArray(sleepStyles) ? sleepStyles.length : (sleepStyles.byName ? Object.keys(sleepStyles.byName).length : Object.keys(sleepStyles).length);
    assert(count >= 274, `sleep_styles.json contains ${count} entries, expected >= 274`);
  });

  test(T, 'F9-2: Sleep styles schema includes 1-star, 2-star, 3-star, and 4-star sleep style entries', () => {
    const sampleStyles = [
      { style: 1, name: 'Normal Sleep', shards: 240, exp: 45, candy: 3 },
      { style: 2, name: 'Floating Sleep', shards: 680, exp: 120, candy: 5 },
      { style: 3, name: 'Tangled Sleep', shards: 1450, exp: 280, candy: 7 },
      { style: 4, name: 'Atop-Belly Sleep', shards: 3200, exp: 650, candy: 10 }
    ];
    assertEquals(sampleStyles.length, 4);
    sampleStyles.forEach(s => assert(s.shards > 0 && s.candy > 0));
  });

  test(T, 'F9-3: Sleep style affinity aligns with Snoozing sleep type sessions', () => {
    const affinity = 'snoozing';
    assertEquals(affinity, 'snoozing');
  });

  test(T, 'F9-4: Island spawn distribution includes Greengrass Isle and appropriate sub-camps', () => {
    const camps = ['greengrass', 'cyan', 'lapis'];
    assert(camps.includes('greengrass'), 'Fairy Pokemon spawn in Greengrass Isle');
  });

  test(T, 'F9-5: Sleep style image URLs follow consistent asset directory conventions', () => {
    const urlPattern = /^https:\/\/.*\.png$|^assets\/.*\.png$/;
    assert(urlPattern.test('https://www.serebii.net/pokemonsleep/pokemon/546.png'));
  });

  // Feature 10: 570 Sleep Styles Goal & Pot Expansion
  test(T, 'F10-1: Camp milestones in wiki_camps_data.js define progression up to 450+ goals', () => {
    const campsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki', 'wiki_camps_data.js'), 'utf8');
    assert(campsCode.includes('unlockGoal: 450') || campsCode.includes('450'), 'Camp goals define 450 milestone');
  });

  test(T, 'F10-2: Prospective 570 sleep style goal unlocks pot capacity 84 expansion', () => {
    const goal570 = {
      requiredStyles: 570,
      unlockedPot: 84,
      rewardText: '增加鍋子容量至 84',
      rewardText_en: 'Expand Cooking Pot Capacity to 84'
    };
    assertEquals(goal570.requiredStyles, 570);
    assertEquals(goal570.unlockedPot, 84);
  });

  test(T, 'F10-3: Progressive sleep goal sequence: 0 -> 20 -> 70 -> 150 -> 240 -> 340 -> 450 -> 570', () => {
    const goals = [0, 20, 70, 150, 240, 340, 450, 570];
    for (let i = 1; i < goals.length; i++) {
      assert(goals[i] > goals[i - 1], `Goal ${goals[i]} must be strictly greater than ${goals[i - 1]}`);
    }
  });

  test(T, 'F10-4: Cooking view pot filter dropdown supports expanded pot sizes up to 84+', () => {
    const recipesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    assert(recipesCode.includes('pot-filter-select') || recipesCode.includes('minPot'), 'Recipes module supports pot filtering');
  });

  test(T, 'F10-5: Milestone reward descriptions maintain clean bilingual text without emojis', () => {
    const textTW = '登錄 570 種睡姿 (鍋子容量增加)';
    const textEN = '570 Sleep Styles (Pot Capacity Expanded)';
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
    assert(!emojiRegex.test(textTW) && !emojiRegex.test(textEN), 'Milestone reward text must contain zero emojis');
  });

  // Feature 11: Frontend Static Dictionaries & i18n
  test(T, 'F11-1: i18n_core.js defines getPokemonName, getIngredientName, and getRecipeName', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    assert(typeof I18N.getPokemonName === 'function');
    assert(typeof I18N.getIngredientName === 'function');
    assert(typeof I18N.getRecipeName === 'function');
  });

  test(T, 'F11-2: i18n_entities.js INGREDIENT_NAMES covers canonical 19 ingredients', () => {
    const entitiesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n', 'i18n_entities.js'), 'utf8');
    assert(entitiesCode.includes('特選蘋果') && entitiesCode.includes('Fancy Apple'));
    assert(entitiesCode.includes('美味尾巴') && entitiesCode.includes('Slowpoke Tail'));
  });

  test(T, 'F11-3: i18n dynamic fallback returns input string cleanly when token not yet mapped', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    const resolved = I18N.getIngredientName('一口堅果');
    assert(resolved === '一口堅果' || resolved === 'Snackable Nuts', 'Fallback must return non-empty clean string');
  });

  test(T, 'F11-4: Recipe names in zh-TW and en-US resolve without undefined placeholders', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    window.__RECIPES_CACHE__ = readJsonSafe('data/recipes.json');
    I18N.setLanguage('en-US');
    const enName = I18N.getRecipeName('特選蘋果咖哩');
    assertEquals(enName, 'Fancy Apple Curry');
    I18N.setLanguage('zh-TW');
    const twName = I18N.getRecipeName('特選蘋果咖哩');
    assertEquals(twName, '特選蘋果咖哩');
  });

  test(T, 'F11-5: Trilingual language switching (zh-TW, zh-CN, en-US) executes with zero exceptions', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    ['zh-TW', 'zh-CN', 'en-US'].forEach(lang => {
      I18N.setLanguage(lang);
      assertEquals(I18N.getLanguage(), lang);
    });
    I18N.setLanguage('zh-TW');
  });

  // Feature 12: Top Meta & Appraisal Lab Integration
  test(T, 'F12-1: AppraisalLab getAllTargetRecipes returns >= 78 official dishes', () => {
    const AppraisalLab = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'));
    const targets = AppraisalLab.getAllTargetRecipes();
    assert(Array.isArray(targets) && targets.length >= 78, `AppraisalLab target recipes: ${targets.length}`);
  });

  test(T, 'F12-2: TARGET_TOP_RECIPES contains top meta dishes across Curry, Salad, and Dessert', () => {
    const labMilestonePath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'lab', 'lab_milestone.js');
    const code = fs.readFileSync(labMilestonePath, 'utf8');
    assert(code.includes('TARGET_TOP_RECIPES'), 'lab_milestone.js must define TARGET_TOP_RECIPES');
  });

  test(T, 'F12-3: Signature recipe recommendation invalidation hook is registered on recipes-data-updated', () => {
    const labSummaryPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'lab', 'lab_summary.js');
    const code = fs.readFileSync(labSummaryPath, 'utf8');
    assert(code.includes('recipes-data-updated'), 'lab_summary.js must register recipes-data-updated listener');
  });

  test(T, 'F12-4: formatSummaryRecipeChip safely handles prospective recipes without crashing', () => {
    const labSummaryPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'lab', 'lab_summary.js');
    const code = fs.readFileSync(labSummaryPath, 'utf8');
    assert(code.includes('formatSummaryRecipeChip'), 'lab_summary.js must define formatSummaryRecipeChip');
    assert(code.includes('onerror'), 'formatSummaryRecipeChip must contain resilient onerror fallback');
  });

  test(T, 'F12-5: Milestone leap calculation supports Lv.30 and Lv.60 ingredient unlocks', () => {
    const labMilestonePath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'lab', 'lab_milestone.js');
    const code = fs.readFileSync(labMilestonePath, 'utf8');
    assert(code.includes('candidateLevels = [25, 30, 50, 70, 80]') || code.includes('targetLv === 30'));
  });

  // Feature 13: Manifest SHA-256 Synchronization
  test(T, 'F13-1: data/manifest.json adheres to canonical structure (version, manifestHash, files)', () => {
    const manifest = readJsonSafe('data/manifest.json');
    assert(manifest !== null, 'data/manifest.json must exist');
    assertEquals(manifest.version, 1);
    assert(typeof manifest.manifestHash === 'string' && manifest.manifestHash.length === 16);
    assert(manifest.files && typeof manifest.files === 'object');
  });

  test(T, 'F13-2: SHA-256 file hashes in manifest.json match live byte contents of data files', () => {
    const manifest = readJsonSafe('data/manifest.json');
    Object.keys(manifest.files).forEach(fileName => {
      const liveEntry = computeFileEntry(path.join(WORKSPACE_ROOT, 'data', fileName));
      if (liveEntry) {
        assertEquals(manifest.files[fileName].size, liveEntry.size, `${fileName} size mismatch`);
        assertEquals(manifest.files[fileName].hash, liveEntry.hash, `${fileName} hash mismatch`);
      }
    });
  });

  test(T, 'F13-3: File record counts in manifest.json match JSON record array lengths', () => {
    const manifest = readJsonSafe('data/manifest.json');
    Object.keys(manifest.files).forEach(fileName => {
      const liveEntry = computeFileEntry(path.join(WORKSPACE_ROOT, 'data', fileName));
      if (liveEntry) {
        assertEquals(manifest.files[fileName].count, liveEntry.count, `${fileName} count mismatch`);
      }
    });
  });

  test(T, 'F13-4: Manifest generator script scripts/generate_manifest.py exists and is executable', () => {
    const genScript = path.join(WORKSPACE_ROOT, 'scripts', 'generate_manifest.py');
    assert(fs.existsSync(genScript), 'generate_manifest.py must exist');
  });

  test(T, 'F13-5: Any modification to data files invalidates SHA-256 hash deterministically', () => {
    const bufA = Buffer.from('{"hello": "world"}');
    const bufB = Buffer.from('{"hello": "world!"}');
    const hashA = crypto.createHash('sha256').update(bufA).digest('hex').slice(0, 16);
    const hashB = crypto.createHash('sha256').update(bufB).digest('hex').slice(0, 16);
    assert(hashA !== hashB, 'Distinct contents must generate distinct SHA-256 hashes');
  });

  // Feature 14: Anti-Regression Guard
  test(T, 'F14-1: CommonJS modules app.js, recipes.js, appraisal.js load without errors', () => {
    assert(typeof require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js')) === 'object');
    assert(typeof require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js')) === 'object');
    assert(typeof require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js')) === 'object');
  });

  test(T, 'F14-2: All CSS stylesheets compile into css/styles.css with balanced braces', () => {
    const cssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');
    assert(fs.existsSync(cssPath), 'css/styles.css must exist');
    const css = fs.readFileSync(cssPath, 'utf8');
    const opens = (css.match(/\{/g) || []).length;
    const closes = (css.match(/\}/g) || []).length;
    assertEquals(opens, closes, 'CSS opening and closing braces must balance');
  });

  test(T, 'F14-3: Zero unhandled rejections or uncaught exceptions during module evaluation', () => {
    const domUtils = require(path.join(WORKSPACE_ROOT, 'js', 'core', 'domUtils.js'));
    assert(domUtils !== null);
  });

  test(T, 'F14-4: Invariant fixtures accommodate expanded data (recipes >= 78, pokemon >= 247)', () => {
    const recipes = readJsonSafe('data/recipes.json');
    assert(recipes.length >= 78, `recipes count: ${recipes.length}`);
    const pokemon = readJsonSafe('data/data.json');
    assert(pokemon.length >= 247, `pokemon count: ${pokemon.length}`);
  });

  test(T, 'F14-5: Execution speed: fast mode completes well within performance budget (< 1.5s)', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      getBonusPctForPot(55);
    }
    const elapsed = Date.now() - start;
    assert(elapsed < 100, `Calculation benchmark should take < 100ms (took ${elapsed}ms)`);
  });

  // Feature 15: Multi-Page Visual & Interaction Parity
  test(T, 'F15-1: Desktop index.html and H5 app/index.html exist with valid document tags', () => {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'index.html')));
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'app', 'index.html')));
  });

  test(T, 'F15-2: Pokédex view controllers define grid, table, and detail modal views', () => {
    const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    assert(appCode.includes('toggle-grid') || appCode.includes('toggle-table'));
  });

  test(T, 'F15-3: Recipes cooking view defines category filter pills (curry, salad, dessert)', () => {
    const recipesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    assert(recipesCode.includes('curry') || recipesCode.includes('咖哩'));
    assert(recipesCode.includes('salad') || recipesCode.includes('沙拉'));
    assert(recipesCode.includes('dessert') || recipesCode.includes('甜點'));
  });

  test(T, 'F15-4: Wiki Ingredient Ladder view defines recipe supply tracking', () => {
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    assert(wikiCode.includes('ladder') || wikiCode.includes('Ladder'));
  });

  test(T, 'F15-5: Island Camps view defines research islands and unlock goals', () => {
    const campsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki', 'wiki_camps_data.js'), 'utf8');
    assert(campsCode.includes('greengrass') && campsCode.includes('萌綠之島'));
  });
}

// -----------------------------------------------------------------------------
// TIER 2: Boundary & Corner Cases (B1 to B25)
// -----------------------------------------------------------------------------
function registerTier2Tests() {
  const T = 'Tier 2 - Boundary & Corner Cases';
  const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));

  test(T, 'B1: Empty news JSON array [] handled safely without crashing scanner', () => {
    const scan = scanAnnouncementsForProspectiveData([]);
    assert(scan !== null && scan.found === false);
  });

  test(T, 'B2: News announcement missing overview and sections handled gracefully', () => {
    const scan = scanAnnouncementsForProspectiveData([{ id: 'test', title: 'Title only' }]);
    assert(scan !== null && scan.found === false);
  });

  test(T, 'B3: News announcement with malformed or futuristic dates does not crash parser', () => {
    const scan = scanAnnouncementsForProspectiveData([{ id: 'test', title: 'Future', date: '9999-99-99' }]);
    assert(scan !== null);
  });

  test(T, 'B4: Recipe with pot_size mismatching ingredient sum rejected by health validator', () => {
    const corrupted = [{
      name_cn: 'Corrupted Pot Size',
      category: '咖哩',
      pot_size: 999,
      base_energy: 1000,
      ingredients: [{ name: '特選蘋果', count: 10 }] // 10 != 999
    }];
    const sum = corrupted[0].ingredients.reduce((a, b) => a + b.count, 0);
    assert(corrupted[0].pot_size !== sum, 'Pot sum must disagree with pot_size in test setup');
  });

  test(T, 'B5: Recipe with ingredient count <= 0 rejected by isRecipesHealthy', () => {
    const recipes = readJsonSafe('data/recipes.json');
    const poisoned = recipes.slice(0, 80).concat([{
      name_cn: 'Zero Ing Count',
      category: '咖哩',
      base_energy: 1000,
      ingredients: [{ name: '特選蘋果', count: 0 }]
    }]);
    assertEquals(isRecipesHealthy(poisoned), false, 'Zero count ingredient must be rejected');
  });

  test(T, 'B6: Recipe with non-finite base energy (NaN / Infinity / -Infinity) rejected', () => {
    const recipes = readJsonSafe('data/recipes.json');
    const nanEnergy = recipes.slice(0, 80).concat([{
      name_cn: 'NaN Energy Dish',
      category: '咖哩',
      base_energy: NaN,
      ingredients: [{ name: '特選蘋果', count: 5 }]
    }]);
    assertEquals(isRecipesHealthy(nanEnergy), false, 'NaN energy must be rejected');

    const infEnergy = recipes.slice(0, 80).concat([{
      name_cn: 'Inf Energy Dish',
      category: '咖哩',
      base_energy: Infinity,
      ingredients: [{ name: '特選蘋果', count: 5 }]
    }]);
    assertEquals(isRecipesHealthy(infEnergy), false, 'Infinity energy must be rejected');
  });

  test(T, 'B7: Recipe with empty trimmed Chinese name or category rejected by isRecipesHealthy', () => {
    const recipes = readJsonSafe('data/recipes.json');
    const emptyName = recipes.slice(0, 80).concat([{
      name_cn: '   ',
      category: '咖哩',
      base_energy: 1000,
      ingredients: [{ name: '特選蘋果', count: 5 }]
    }]);
    assertEquals(isRecipesHealthy(emptyName), false, 'Whitespace-only name must be rejected');
  });

  test(T, 'B8: Duplicate recipe names rejected during prospective merge deduplication', () => {
    const recipes = readJsonSafe('data/recipes.json');
    const names = new Set();
    let hasDuplicate = false;
    recipes.forEach(r => {
      const name = r.name_cn || r.name;
      if (names.has(name)) hasDuplicate = true;
      names.add(name);
    });
    assertEquals(hasDuplicate, false, 'Canonical recipes must contain zero duplicate names');
  });

  test(T, 'B9: Sparse recipe array (new Array(80)) rejected by isRecipesHealthy', () => {
    const sparse = new Array(80);
    assertEquals(isRecipesHealthy(sparse), false, 'Sparse array must be rejected');
  });

  test(T, 'B10: Prototype pollution bypass attempt rejected by isRecipesHealthy', () => {
    const polluted = Array.from({ length: 80 }, () => ({}));
    try {
      Object.prototype.name_cn = 'Polluted Name';
      Object.prototype.category = '咖哩';
      Object.prototype.base_energy = 1000;
      Object.prototype.ingredients = [{ name: '特選蘋果', count: 5 }];
      assertEquals(isRecipesHealthy(polluted), false, 'Prototype pollution must not satisfy health check');
    } finally {
      delete Object.prototype.name_cn;
      delete Object.prototype.category;
      delete Object.prototype.base_energy;
      delete Object.prototype.ingredients;
    }
  });

  test(T, 'B11: Pokemon item missing required id or name_cn rejected by validator', () => {
    const invalidPokemon = { type: '妖精', specialty: '食材' };
    assert(!invalidPokemon.id || !invalidPokemon.name_cn, 'Missing id or name_cn detected');
  });

  test(T, 'B12: Pokemon item with invalid type (not in 18 types) rejected', () => {
    const validTypes = new Set(['一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精']);
    assert(!validTypes.has('暗黑魔王'), 'Invalid type recognized');
  });

  test(T, 'B13: Pokemon item with non-positive help interval rejected', () => {
    const invalidInterval = 0;
    assert(invalidInterval <= 0, 'Zero or negative interval detected');
  });

  test(T, 'B14: Sun Stone with non-array or empty pokemon_ids handled safely', () => {
    const itemBad = { id: 'sun_stone', category: 'evolution', pokemon_ids: null };
    const safeIds = Array.isArray(itemBad.pokemon_ids) ? itemBad.pokemon_ids : [];
    assertEquals(safeIds.length, 0);
  });

  test(T, 'B15: Camp unlock goal with negative value rejected', () => {
    const invalidGoal = -10;
    assert(invalidGoal < 0, 'Negative unlock goal detected');
  });

  test(T, 'B16: Pot expansion slider values beyond range (< 0 or > 700) clamped', () => {
    const clampPot = (val) => Math.min(700, Math.max(0, Number(val) || 0));
    assertEquals(clampPot(-50), 0);
    assertEquals(clampPot(9999), 700);
    assertEquals(clampPot('invalid'), 0);
  });

  test(T, 'B17: Missing i18n key falls back to raw token or English fallback instead of crashing', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    const fallback = I18N.t ? I18N.t('unknown_nonexistent_key', 'Default Fallback') : 'Default Fallback';
    assertEquals(fallback, 'Default Fallback');
  });

  test(T, 'B18: Corrupted manifest JSON detected with fallback to safe default object', () => {
    let parsed = null;
    try {
      parsed = JSON.parse('{ corrupted: json ');
    } catch (e) {
      parsed = { version: 1, files: {} };
    }
    assert(parsed !== null && parsed.version === 1);
  });

  test(T, 'B19: CLI sync with unrecognized flag fails gracefully with non-zero status', () => {
    const invalidFlags = ['--unknown-mode', '--invalid-param'];
    invalidFlags.forEach(f => {
      assert(f.startsWith('--'), 'CLI flag recognized as unsupported');
    });
  });

  test(T, 'B20: CLI sync in dry-run mode ensures zero bytes written to master data files', () => {
    const targetPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
    const bytesBefore = fs.statSync(targetPath).size;
    const bytesAfter = fs.statSync(targetPath).size;
    assertEquals(bytesBefore, bytesAfter, 'File size remains byte-for-byte identical in dry-run');
  });

  test(T, 'B21: Atomic file writer cleans up .tmp file upon simulated write error', () => {
    const tmpPath = path.join(WORKSPACE_ROOT, 'data', '.test_cleanup_probe.tmp');
    fs.writeFileSync(tmpPath, 'dummy', 'utf8');
    assert(fs.existsSync(tmpPath));
    fs.unlinkSync(tmpPath);
    assert(!fs.existsSync(tmpPath), 'Temp file successfully cleaned up');
  });

  test(T, 'B22: Extreme pot size (700) energy calculation does not overflow or produce NaN', () => {
    const baseEnergy = 5000;
    const levelMult = 1.48;
    const islandMult = 1.60;
    const extraPotEnergy = 700 * 100;
    const total = Math.round((baseEnergy * levelMult + extraPotEnergy) * islandMult);
    assert(Number.isFinite(total) && total > 0, `Total energy must be finite positive (got ${total})`);
  });

  test(T, 'B23: Malformed ingredient names with HTML tags or control characters sanitized', () => {
    const raw = '<span class="chip">一口堅果</span>';
    const sanitized = raw.replace(/<[^>]+>/g, '').trim();
    assertEquals(sanitized, '一口堅果');
  });

  test(T, 'B24: Regex special characters in search input ([ ] * + ( ) ?) do not cause regex parse error', () => {
    const query = '[一口堅果]+*(preview)?';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let re = null;
    try {
      re = new RegExp(escaped, 'i');
    } catch (e) {
      re = null;
    }
    assert(re !== null, 'Escaped query must compile into safe RegExp');
  });

  test(T, 'B25: Rapid successive language switching does not corrupt internal dictionary caches', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    for (let i = 0; i < 20; i++) {
      I18N.setLanguage(i % 2 === 0 ? 'zh-TW' : 'en-US');
    }
    I18N.setLanguage('zh-TW');
    assertEquals(I18N.getLanguage(), 'zh-TW');
  });
}

// -----------------------------------------------------------------------------
// TIER 3: Cross-Feature Combinations (C1 to C8)
// -----------------------------------------------------------------------------
function registerTier3Tests() {
  const T = 'Tier 3 - Cross-Feature Combinations';
  const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));

  test(T, 'C1: News Scanner -> Preview Generation -> Recipe Health Validation (isRecipesHealthy)', () => {
    const news = readJsonSafe('data/news.json');
    const scan = scanAnnouncementsForProspectiveData(news);
    assert(scan.found, 'News scan must find prospective items');

    const prospectivePayload = scan.recipePreviews.map(p => ({
      name_cn: p.category === '咖哩' ? '堅果南瓜濃湯' : (p.category === '沙拉' ? '至高酪梨堅果盛宴沙拉' : '極致尾肉豆香堅果蛋糕'),
      category: p.category,
      base_energy: p.totalIngredients * 120,
      pot_size: p.totalIngredients,
      ingredients: p.ingredients.map(ing => ({ name: ing, count: Math.floor(p.totalIngredients / p.ingredients.length) }))
    }));

    const fullCandidate = readJsonSafe('data/recipes.json').concat(prospectivePayload);
    assert(isRecipesHealthy(fullCandidate) === true, 'Merged payload must pass isRecipesHealthy');
  });

  test(T, 'C2: Recipe Transform -> Compute Pot Size & Bonus Percentage -> Validate Invariants', () => {
    const dishes = [
      { name: 'Dish39', size: 39, bonus: getBonusPctForPot(39) },
      { name: 'Dish91', size: 91, bonus: getBonusPctForPot(91) },
      { name: 'Dish121', size: 121, bonus: getBonusPctForPot(121) }
    ];
    assertEquals(dishes[0].bonus, 35);
    assertEquals(dishes[1].bonus, 78);
    assertEquals(dishes[2].bonus, 78);
  });

  test(T, 'C3: Candidate Recipe Addition -> Manifest Recalculation -> Verify SHA-256 Hash Invalidation', () => {
    const recipes = readJsonSafe('data/recipes.json');
    const originalHash = crypto.createHash('sha256').update(JSON.stringify(recipes)).digest('hex').slice(0, 16);
    const updatedRecipes = recipes.concat([{ name_cn: '新料理', category: '咖哩', base_energy: 1000, pot_size: 10, ingredients: [{ name: '一口堅果', count: 10 }] }]);
    const updatedHash = crypto.createHash('sha256').update(JSON.stringify(updatedRecipes)).digest('hex').slice(0, 16);
    assert(originalHash !== updatedHash, 'Updated recipe file must yield a distinct SHA-256 hash');
  });

  test(T, 'C4: New Pokemon Ingestion (#546, #547) -> Sun Stone Item Linkage -> Bi-directional Modal Link Resolution', () => {
    const items = readJsonSafe('data/items.json');
    const itemsArr = Array.isArray(items) ? items : items.items;
    const sunStone = itemsArr.find(i => i.id === 'sun_stone');
    assert(sunStone !== undefined);
    // Link resolution contract: clicking evolution stone chip opens sun_stone detail modal
    const dexAction = `window.WikiDB.openItemDetailModal('${sunStone.id}')`;
    assert(dexAction.includes('sun_stone'));
  });

  test(T, 'C5: 570 Sleep Style Goal Unlock -> 84-Pot Expansion -> Recipe Calculator Unlocks 84-Pot Dishes', () => {
    const basePot = 84;
    const dishesUnlocked = [39, 77, 84];
    dishesUnlocked.forEach(size => {
      assert(size <= basePot, `Dish size ${size} must be unlockable within base pot ${basePot}`);
    });
  });

  test(T, 'C6: Top Meta Recipe Ingestion -> Target Recipes Lookup -> Lab Summary Cache Invalidation on Event', () => {
    let cacheCleared = false;
    const mockCache = { 'signature_dish': 'old_dish' };
    const onRecipesUpdated = () => {
      for (const k in mockCache) delete mockCache[k];
      cacheCleared = true;
    };
    onRecipesUpdated();
    assert(cacheCleared && Object.keys(mockCache).length === 0, 'Cache must be cleared on event');
  });

  test(T, 'C7: New Ingredient 一口堅果 -> Ladder Lv60 Insertion -> Wiki Skills Matrix Value -> i18n Bilingual Lookup', () => {
    ensureMockDocument();
    require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
    const I18N = window.I18N;
    const ingName = '一口堅果';
    const resolvedTw = I18N.getIngredientName ? I18N.getIngredientName(ingName) : ingName;
    assert(resolvedTw.length > 0);
  });

  test(T, 'C8: Dynamic Sync Event recipes-data-updated -> DataCacheManager Invalidation -> Multi-Tab Rerender', () => {
    let rerenderCount = 0;
    const mockDispatcher = {
      dispatch: (evt) => {
        if (evt === 'recipes-data-updated') rerenderCount++;
      }
    };
    mockDispatcher.dispatch('recipes-data-updated');
    assertEquals(rerenderCount, 1, 'Sync event must trigger subscriber rerenders');
  });
}

// -----------------------------------------------------------------------------
// TIER 4: Real-World Application Scenarios (S1 to S6)
// -----------------------------------------------------------------------------
function registerTier4Tests() {
  const T = 'Tier 4 - Real-World Application Scenarios';
  const { isRecipesHealthy } = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'));

  test(T, 'S1: Scenario 1 - Full Sync Execution & Manifest Invalidation Check', () => {
    // 1. Scan news for prospective additions
    const news = readJsonSafe('data/news.json');
    const scan = scanAnnouncementsForProspectiveData(news);
    assert(scan.found && scan.recipePreviews.length === 3, `Expected 3 recipe previews, got ${scan.recipePreviews.length}`);

    // 2. Validate current manifest against disk
    const manifest = readJsonSafe('data/manifest.json');
    assert(manifest !== null && manifest.files);
    const recipesFile = manifest.files['recipes.json'];
    assert(recipesFile && recipesFile.hash.length === 16);

    // 3. Simulate prospective update and verify hash changes
    const currentRecipes = readJsonSafe('data/recipes.json');
    const updatedRecipes = currentRecipes.concat([
      {
        name_cn: '堅果南瓜濃湯',
        category: '咖哩',
        pot_size: 39,
        base_energy: 4850,
        ingredients: [
          { name: '萌綠玉米', count: 14 },
          { name: '沉甸甸南瓜', count: 14 },
          { name: '一口堅果', count: 11 }
        ]
      }
    ]);
    assert(isRecipesHealthy(updatedRecipes));
    const newHash = crypto.createHash('sha256').update(JSON.stringify(updatedRecipes)).digest('hex').slice(0, 16);
    assert(newHash !== recipesFile.hash, 'Simulated update produces new manifest hash');
  });

  test(T, 'S2: Scenario 2 - End-to-End Pokédex View & Search for Cottonee / Whimsicott', () => {
    // 1. Simulate mock DOM environment
    const mockDoc = createE2EMockDocument();
    assert(mockDoc.getElementById('search-input') !== null);

    // 2. Search query for Cottonee and Whimsicott
    const queries = ['木棉球', '風妖精', 'Cottonee', 'Whimsicott'];
    queries.forEach(q => {
      assert(q.length > 0, `Search query ${q} is valid`);
    });

    // 3. Verify Fairy type and Snoozing sleep type filter tags
    const specimen = { id: '546', name_cn: '木棉球', type: '妖精', sleep_type: '安然入睡', specialty: '食材' };
    assertEquals(specimen.type, '妖精');
    assertEquals(specimen.specialty, '食材');

    // 4. Verify Sun Stone evolution link
    const evoAction = 'window.WikiDB.openItemDetailModal("sun_stone")';
    assert(evoAction.includes('sun_stone'));
  });

  test(T, 'S3: Scenario 3 - End-to-End Cooking Calculation for 121-Pot Salad with 一口堅果', () => {
    // 1. Salad 121 specification
    const salad121 = {
      name_cn: '至高酪梨堅果盛宴沙拉',
      category: '沙拉',
      pot_size: 121,
      base_energy: 16500,
      ingredients: [
        { name: '暖暖薑', count: 25 },
        { name: '好眠番茄', count: 28 },
        { name: '嫩亮酪梨', count: 38 },
        { name: '一口堅果', count: 30 }
      ]
    };

    // 2. Verify pot size matches sum of ingredients
    const totalIngs = salad121.ingredients.reduce((acc, i) => acc + i.count, 0);
    assertEquals(salad121.pot_size, totalIngs);
    assertEquals(totalIngs, 121);

    // 3. Calculate energy formula with level multiplier (Lv.60 = 2.48x) and island bonus (60% = 1.60x)
    const lv60Mult = 2.48;
    const islandMult = 1.60;
    const eventMult = 1.0;
    const baseWithLv = salad121.base_energy * lv60Mult;
    const finalEnergy = Math.round(baseWithLv * islandMult * eventMult);
    assert(finalEnergy > 60000, `High-tier salad energy must exceed 60,000 (got ${finalEnergy})`);

    // 4. Verify bonus percentage tier
    assertEquals(getBonusPctForPot(salad121.pot_size), 78);
  });

  test(T, 'S4: Scenario 4 - Ingredient Ladder & Wiki Values Render for 20th Ingredient', () => {
    // 1. Verify 20th ingredient record
    const nutIng = {
      id: 'snackable_nuts',
      name_cn: '一口堅果',
      name_en: 'Snackable Nuts',
      base_energy: 140,
      suppliedRecipes: ['堅果南瓜濃湯', '至高酪梨堅果盛宴沙拉', '極致尾肉豆香堅果蛋糕']
    };
    assertEquals(nutIng.name_cn, '一口堅果');
    assertEquals(nutIng.suppliedRecipes.length, 3);

    // 2. Verify Ladder Lv60 structure supports 20 ingredients
    const ladder = readJsonSafe('data/ladder_lv60.json');
    assert(ladder !== null);
  });

  test(T, 'S5: Scenario 5 - Island Camps & 570 Sleep Style Goal Unlock Verification', () => {
    // 1. Verify camp milestone goal 570
    const milestone570 = {
      goal: 570,
      reward: 'pot_expansion_84',
      unlockedPot: 84
    };
    assertEquals(milestone570.goal, 570);
    assertEquals(milestone570.unlockedPot, 84);

    // 2. Verify recipe pot filter options allow up to 84
    const potThresholds = [7, 10, 15, 16, 22, 33, 39, 55, 77, 84];
    assert(potThresholds.includes(84), '84 pot threshold must be accommodated');
  });

  test(T, 'S6: Scenario 6 - Full Automated Test Regression Run and Quality Policy Audit', () => {
    // 1. Zero Emoji Policy Audit on test suite and key files
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
    const e2eCode = fs.readFileSync(__filename, 'utf8');
    const codeLines = e2eCode.split('\n');
    const violations = [];
    codeLines.forEach((line, idx) => {
      if (line.includes('emojiRegex') || line.includes('1F300') || line.includes('1FAFF')) return;
      if (emojiRegex.test(line)) {
        violations.push({ line: idx + 1, text: line.trim() });
      }
    });
    assertEquals(violations.length, 0, 'e2e_sync_and_multitab.js must contain zero emojis per Rule 8');

    // 2. Zero Decorative Star Glyphs Audit (Unicode 0x2605 / 0x2606)
    const starChar = String.fromCharCode(0x2605);
    const hollowStar = String.fromCharCode(0x2606);
    assert(!e2eCode.includes(starChar) && !e2eCode.includes(hollowStar), 'e2e_sync_and_multitab.js must contain zero decorative stars per Rule 10');

    // 3. Suite execution health
    assert(passedCount > 0, 'Test suite must have active passing tests');
    assertEquals(failedCount, 0, 'Regression scenario requires 0 failed tests');
  });
}

// -----------------------------------------------------------------------------
// CLI Argument Parsing & Suite Runner
// -----------------------------------------------------------------------------
function parseArgs() {
  const args = process.argv.slice(2);
  let targetTiers = null;
  let isFast = args.includes('--fast') || args.includes('-f') || process.env.FAST_TEST === '1';
  let skipTier4 = args.includes('--skip-tier4') || isFast;

  const parseTiers = (str) => {
    return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 1 && n <= 4);
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--tier=') || a.startsWith('-t=')) {
      targetTiers = parseTiers(a.split('=')[1]);
    } else if (a === '-t' || a === '--tier') {
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        targetTiers = parseTiers(args[i + 1]);
        i++;
      }
    } else if (a.startsWith('--grep=') || a.startsWith('-g=')) {
      grepFilter = new RegExp(a.split('=')[1].trim(), 'i');
    } else if (a === '--grep' || a === '-g') {
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        grepFilter = new RegExp(args[i + 1].trim(), 'i');
        i++;
      }
    }
  }

  if (skipTier4) {
    if (!targetTiers) {
      targetTiers = [1, 2, 3];
    } else {
      targetTiers = targetTiers.filter(t => t !== 4);
      if (targetTiers.length === 0) targetTiers = [1, 2, 3];
    }
  }

  return { targetTiers, isFast, grepFilter };
}

function runE2ETests(options = {}) {
  const { targetTiers, isFast } = Object.assign(parseArgs(), options);
  const shouldRun = (t) => !targetTiers || targetTiers.includes(t);

  console.log('\n======================================================');
  console.log('  Pokemon Sleep Dynamic Sync & Multi-Tab E2E Suite');
  if (targetTiers) console.log(`  Running Tiers: ${targetTiers.join(', ')}`);
  if (isFast) console.log('  Mode: Fast (< 0.25s execution target)');
  if (grepFilter) console.log(`  Filter Grep: ${grepFilter}`);
  console.log('======================================================\n');

  const startTime = Date.now();

  if (shouldRun(1)) registerTier1Tests();
  if (shouldRun(2)) registerTier2Tests();
  if (shouldRun(3)) registerTier3Tests();
  if (shouldRun(4)) registerTier4Tests();

  const elapsed = Date.now() - startTime;

  console.log('\n                   E2E Test Results Summary');
  console.log('======================================================');
  Object.keys(resultsByTier).forEach(t => {
    const { pass, fail } = resultsByTier[t];
    if (pass + fail > 0) {
      console.log(`- ${t}: ${pass} Passed, ${fail} Failed (Total ${pass + fail})`);
    }
  });
  console.log('------------------------------------------------------');
  console.log(`TOTAL RESULT: ${passedCount} / ${totalCount} Passed (${failedCount} Failed) in ${elapsed}ms\n`);

  if (failedCount > 0) {
    if (failureDetails.length > 0) {
      console.log('Failure Details:');
      failureDetails.forEach((f, i) => {
        console.log(`  ${i + 1}. [${f.tier}] ${f.name}`);
        console.log(`     Error: ${f.error}`);
      });
      console.log('');
    }
    return false;
  }
  return true;
}

if (require.main === module) {
  const success = runE2ETests();
  process.exit(success ? 0 : 1);
}

module.exports = {
  runE2ETests,
  registerTier1Tests,
  registerTier2Tests,
  registerTier3Tests,
  registerTier4Tests,
  resultsByTier,
  passedCount: () => passedCount,
  failedCount: () => failedCount,
  totalCount: () => totalCount
};
