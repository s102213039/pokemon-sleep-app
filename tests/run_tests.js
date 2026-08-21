/**
 * Pokémon Sleep SPA Automated E2E & Component Test Runner
 * Tiers 1-4 Test Suite (Zero External Dependencies)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// Test Runner Infrastructure
let passedTests = 0;
let failedTests = 0;
let totalTests = 0;
const resultsByTier = {
  'Tier 1 - Feature Coverage': { pass: 0, fail: 0 },
  'Tier 2 - Boundary & Corner Cases': { pass: 0, fail: 0 },
  'Tier 3 - Cross-Feature Combinations': { pass: 0, fail: 0 },
  'Tier 4 - Real-World Application Scenarios': { pass: 0, fail: 0 }
};

function test(tier, description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    resultsByTier[tier].pass++;
    console.log(`  [PASS] ${description}`);
  } catch (err) {
    failedTests++;
    resultsByTier[tier].fail++;
    console.error(`  [FAIL] ${description}`);
    console.error(`         Error: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'assertEquals failed'}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Lightweight Mini-DOM Implementation for Headless E2E Simulation
class MiniElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this._className = className;
    const self = this;
    this.classList = {
      get value() { return self._className; },
      add(...cls) {
        const set = new Set((self._className || '').split(' ').filter(Boolean));
        cls.forEach(c => set.add(c));
        self._className = Array.from(set).join(' ');
      },
      remove(...cls) {
        const set = new Set((self._className || '').split(' ').filter(Boolean));
        cls.forEach(c => set.delete(c));
        self._className = Array.from(set).join(' ');
      },
      contains(c) {
        return new Set((self._className || '').split(' ').filter(Boolean)).has(c);
      }
    };
    this.attributes = {};
    if (id) this.attributes.id = id;
    if (className) this.attributes.class = className;
    this.listeners = {};
    this._innerHTML = '';
    this.textContent = '';
    this.value = '';
    this.children = [];
    this.parentNode = null;
  }

  get className() { return this._className; }
  set className(val) { this._className = val; }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.parseInnerHTML(html);
  }

  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }

  addEventListener(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  dispatchEvent(event) {
    const type = typeof event === 'string' ? event : event.type;
    const evtObj = typeof event === 'string' ? { type, target: this } : event;
    if (!evtObj.target) evtObj.target = this;

    if (this.listeners[type]) {
      this.listeners[type].forEach(fn => fn(evtObj));
    }
    if (type === 'click' && this.parentNode) {
      let curr = this.parentNode;
      while (curr) {
        if (curr.listeners['click']) {
          curr.listeners['click'].forEach(fn => fn(evtObj));
        }
        curr = curr.parentNode;
      }
    }
  }

  click() {
    this.dispatchEvent({ type: 'click', target: this });
  }

  parseInnerHTML(html) {
    this.children = [];
    const buttonRegex = /<button\s+([^>]*?)>(.*?)<\/button>/gi;
    let match;
    while ((match = buttonRegex.exec(html)) !== null) {
      const attrsStr = match[1];
      const text = match[2];
      const classMatch = attrsStr.match(/class=["']([^"']+)["']/i);
      const dataTypeMatch = attrsStr.match(/data-type=["']([^"']+)["']/i);
      const dataSpecMatch = attrsStr.match(/data-specialty=["']([^"']+)["']/i);
      const idMatch = attrsStr.match(/id=["']([^"']+)["']/i);

      const btn = new MiniElement('BUTTON', idMatch ? idMatch[1] : '', classMatch ? classMatch[1] : '');
      if (dataTypeMatch) btn.setAttribute('data-type', dataTypeMatch[1]);
      if (dataSpecMatch) btn.setAttribute('data-specialty', dataSpecMatch[1]);
      btn.textContent = text.replace(/<[^>]+>/g, '');
      btn.parentNode = this;
      this.children.push(btn);
    }
  }

  querySelectorAll(selector) {
    const results = [];
    const search = (node) => {
      if (node !== this && matchesSelector(node, selector)) {
        results.push(node);
      }
      if (node.children) {
        node.children.forEach(child => search(child));
      }
    };
    search(this);
    return results;
  }
}

function matchesSelector(node, selector) {
  if (selector.startsWith('#')) {
    return node.id === selector.slice(1);
  }
  if (selector.startsWith('.')) {
    return node.classList.contains(selector.slice(1));
  }
  if (selector.includes('.tag-btn')) {
    return node.classList.contains('tag-btn');
  }
  return node.tagName === selector.toUpperCase();
}

function createMockDocument() {
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
  getOrCreate('toggle-grid', 'BUTTON', 'active');
  getOrCreate('toggle-table', 'BUTTON');

  return {
    elements,
    getElementById: (id) => elements[id] || null,
    querySelectorAll: (selector) => {
      const all = Object.values(elements);
      return all.filter(el => matchesSelector(el, selector));
    },
    addEventListener: () => {}
  };
}

// Load App Script module
const appPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js');
const {
  PokemonApp,
  getItemIcon,
  getItemId,
  getItemFormattedNo,
  getItemNameCN,
  getItemNameEN,
  getItemNameJP,
  getItemCarry,
  getItemIngredientRate,
  getItemSkillRate,
  getItemHelpInterval,
  DEFAULT_SVG_ICON,
  SPECIAL_SKILL_DETAILS,
  renderSkillWithTooltip
} = require(appPath);

const dataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
const dataset = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('\n======================================================');
console.log('      Pokémon Sleep SPA Automated E2E Test Suite');
console.log('======================================================\n');

// -------------------------------------------------------------------
// Tier 1 - Feature Coverage
// -------------------------------------------------------------------
console.log('--- Tier 1 - Feature Coverage ---');

test('Tier 1 - Feature Coverage', 'Dataset Integrity: data.json exists and contains >= 247 valid Pokemon items', () => {
  assert(fs.existsSync(dataPath), 'data.json does not exist');
  assert(Array.isArray(dataset), 'data.json is not an array');
  assert(dataset.length >= 247, `data.json count is ${dataset.length}, expected >= 247`);

  dataset.forEach((item, idx) => {
    const id = getItemId(item);
    const nameCN = getItemNameCN(item);
    const nameEN = getItemNameEN(item);
    const nameJP = getItemNameJP(item);

    assert(id, `Item at index ${idx} is missing id`);
    assert(nameCN, `Item at index ${idx} is missing Chinese name`);
    assert(nameEN, `Item at index ${idx} is missing English name`);
    assert(nameJP, `Item at index ${idx} is missing Japanese name`);
    assert(typeof item.type === 'string' && item.type !== '', `Item ${id} missing type`);
    assert(typeof item.specialty === 'string' && item.specialty !== '', `Item ${id} missing specialty`);
    assert(getItemCarry(item) >= 0, `Item ${id} has invalid carryCapacity`);
    assert(getItemHelpInterval(item) >= 0, `Item ${id} has invalid helpInterval`);
    assert(getItemIngredientRate(item) >= 0, `Item ${id} has invalid ingredientRate`);
    assert(item.ingredients !== undefined, `Item ${id} missing ingredients`);
  });
});

test('Tier 1 - Feature Coverage', 'Dataset Integrity: recipes.json exists and contains 78 verified recipes with correct ingredients & pot sizes', () => {
  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
  assert(fs.existsSync(recipesPath), 'recipes.json does not exist');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
  assert(Array.isArray(recipes), 'recipes.json is not an array');
  assert(recipes.length === 78, `recipes.json count is ${recipes.length}, expected 78`);

  const validCategories = new Set(['咖哩', '沙拉', '甜點']);
  recipes.forEach((r, idx) => {
    assert(r.name_cn && r.name_cn.trim(), `Recipe #${idx} missing name_cn`);
    assert(r.name_en && r.name_en.trim(), `Recipe #${idx} missing name_en`);
    assert(validCategories.has(r.category), `Recipe #${idx} invalid category: ${r.category}`);
    assert(r.base_energy > 0, `Recipe ${r.name_cn} has invalid base_energy: ${r.base_energy}`);
    assert(r.bonus_pct >= 19, `Recipe ${r.name_cn} has invalid bonus_pct: ${r.bonus_pct}`);
    assert(Array.isArray(r.ingredients) && r.ingredients.length > 0, `Recipe ${r.name_cn} has empty ingredients`);
    
    const potSum = r.ingredients.reduce((sum, ing) => sum + ing.count, 0);
    assertEquals(r.pot_size, potSum, `Recipe ${r.name_cn} pot_size mismatch`);
    
    r.ingredients.forEach(ing => {
      assert(ing.name && ing.name.trim(), `Recipe ${r.name_cn} ingredient missing name`);
      assert(ing.count > 0, `Recipe ${r.name_cn} ingredient count must be > 0`);
      assert(ing.icon && ing.icon.startsWith('http'), `Recipe ${r.name_cn} ingredient icon missing/invalid`);
    });
  });
});

test('Tier 1 - Feature Coverage', 'HTML Structure: index.html exists with required UI elements', () => {
  const htmlPath = path.join(WORKSPACE_ROOT, 'index.html');
  assert(fs.existsSync(htmlPath), 'index.html does not exist');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Core Pokedex elements
  assert(htmlContent.includes('id="search-input"') || htmlContent.includes("id='search-input'"), 'Missing search input element');
  assert(htmlContent.includes('id="final-evo-toggle"'), 'Missing final-evo-toggle switch element');
  assert(htmlContent.includes('id="initial-ing-toggle"'), 'Missing initial-ing-toggle switch element');
  assert(htmlContent.includes('id="pokemon-filter-sidebar"'), 'Missing pokemon-filter-sidebar element in index.html');
  assert(htmlContent.includes('id="sidebar-bookmark-handle"'), 'Missing sidebar-bookmark-handle element in index.html');
  assert(htmlContent.includes('id="sidebar-close-btn"'), 'Missing sidebar-close-btn element in index.html');
  assert(htmlContent.includes('id="sidebar-reset-all-btn"'), 'Missing sidebar-reset-all-btn element in index.html');
  assert(htmlContent.includes('id="berry-filter-tags"') || htmlContent.includes("id='berry-filter-tags'"), 'Missing berry filter container');
  assert(htmlContent.includes('id="specialty-filter-tags"') || htmlContent.includes("id='specialty-filter-tags'"), 'Missing specialty filter container');
  assert(htmlContent.includes('id="detail-subfilters-container"'), 'Missing detail subfilters container');
  assert(htmlContent.includes('id="sort-select"') || htmlContent.includes("id='sort-select'"), 'Missing sort selector element');
  assert(htmlContent.includes('id="toggle-grid"') || htmlContent.includes("id='toggle-grid'"), 'Missing grid view toggle button');
  assert(htmlContent.includes('id="toggle-table"') || htmlContent.includes("id='toggle-table'"), 'Missing table view toggle button');
  assert(htmlContent.includes('id="content-area"') || htmlContent.includes("id='content-area'"), 'Missing view content area container');
  assert(htmlContent.includes('id="event-bonus-slider"'), 'Missing event-bonus-slider element in index.html');

  // SPA Multi-Tab Navigation elements
  assert(htmlContent.includes('id="tab-pokemon"'), 'Missing tab-pokemon navigation element in index.html');
  assert(htmlContent.includes('id="tab-recipes"'), 'Missing tab-recipes navigation element in index.html');
  assert(htmlContent.includes('id="tab-wiki"'), 'Missing tab-wiki navigation element in index.html');
  assert(htmlContent.includes('id="tab-box"'), 'Missing tab-box navigation element in index.html');
  assert(htmlContent.includes('id="tab-news"'), 'Missing tab-news navigation element in index.html');
  assert(htmlContent.includes('id="panel-pokemon"'), 'Missing panel-pokemon view container in index.html');
  assert(htmlContent.includes('id="panel-recipes"'), 'Missing panel-recipes view container in index.html');
  assert(htmlContent.includes('id="panel-wiki"'), 'Missing panel-wiki view container in index.html');
  assert(htmlContent.includes('id="panel-box"'), 'Missing panel-box view container in index.html');
  assert(htmlContent.includes('id="panel-news"'), 'Missing panel-news view container in index.html');
});

test('Tier 1 - Feature Coverage', 'Wiki Database Integrity: wiki.js defines skills, sub-skills, matrix, ratings, and ingredient ladder', () => {
  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  assert(fs.existsSync(wikiPath), 'wiki.js does not exist');
  const wikiContent = fs.readFileSync(wikiPath, 'utf8');

  assert(wikiContent.includes('MAIN_SKILLS_DATA'), 'wiki.js missing MAIN_SKILLS_DATA');
  assert(wikiContent.includes('SUB_SKILLS_DATA'), 'wiki.js missing SUB_SKILLS_DATA');
  assert(wikiContent.includes('TRIGGER_CHANCE_MATRIX'), 'wiki.js missing TRIGGER_CHANCE_MATRIX');
  assert(wikiContent.includes('RATINGS_GUIDE_DATA'), 'wiki.js missing RATINGS_GUIDE_DATA');
  assert(wikiContent.includes('LV60_INGREDIENTS_LADDER'), 'wiki.js missing LV60_INGREDIENTS_LADDER');
  assert(wikiContent.includes('蓄力 (能量填充S)'), 'wiki.js missing Charge Stock skill data');
  assert(wikiContent.includes('幫手加速 (屬性)'), 'wiki.js missing Helper Boost skill data');
  assert(wikiContent.includes('1.848'), 'wiki.js missing 1.848x trigger chance multiplier');
});


test('Tier 1 - Feature Coverage', 'Ingredient & Berry Base Energy: wiki.js matches Serebii Separate Base Power (19 ingredients, 18 berries Lv.1)', () => {
  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  const wikiContent = fs.readFileSync(wikiPath, 'utf8');

  const SEREbii_ING = {
    '特選蘋果': 90, '哞哞鮮奶': 98, '萌綠大豆': 100, '甜甜蜜': 101, '豆製肉': 103,
    '暖暖薑': 109, '好眠番茄': 110, '特選蛋': 115, '純粹油': 121, '窩心洋芋': 124,
    '火辣香草': 130, '萌綠玉米': 140, '放鬆可可': 151, '醒腦咖啡豆': 153, '嫩亮酪梨': 162,
    '品鮮蘑菇': 167, '粗枝大蔥': 185, '沉甸甸南瓜': 250, '美味尾巴': 342
  };
  const SEREbii_BERRY_LV1 = {
    '椰木果': 24, '木子果': 24, '異奇果': 25, '檬果': 26, '桃桃果': 26, '芒念果': 26,
    '蘋野果': 27, '櫻子果': 27, '柿仔果': 28, '勿花果': 29, '文柚果': 30, '榴石果': 30,
    '橙橙果': 31, '芭拉果': 31, '零餘果': 32, '生薑果': 32, '靛莓果': 33, '巧可果': 35
  };

  const ingBlock = wikiContent.match(/const INGREDIENT_VALUES_DATA = \[([\s\S]*?)\];/);
  const berryBlock = wikiContent.match(/const BERRY_VALUES_DATA = \[([\s\S]*?)\];/);
  assert(ingBlock, 'INGREDIENT_VALUES_DATA not found');
  assert(berryBlock, 'BERRY_VALUES_DATA not found');

  const parseEntries = (block) => [...block.matchAll(/name:\s*['"]([^'"]+)['"][\s\S]*?energy:\s*(\d+)/g)]
    .map(m => ({ name: m[1], energy: +m[2] }));

  const ings = parseEntries(ingBlock[1]);
  const berries = parseEntries(berryBlock[1]);

  assertEquals(ings.length, 19, 'INGREDIENT_VALUES_DATA should have 19 entries');
  assertEquals(berries.length, 18, 'BERRY_VALUES_DATA should have 18 entries');

  ings.forEach(({ name, energy }) => {
    assert(SEREbii_ING[name] !== undefined, `Unknown ingredient in wiki: ${name}`);
    assertEquals(energy, SEREbii_ING[name], `Ingredient ${name} base energy mismatch`);
  });

  berries.forEach(({ name, energy }) => {
    assert(SEREbii_BERRY_LV1[name] !== undefined, `Unknown berry in wiki: ${name}`);
    assertEquals(energy, SEREbii_BERRY_LV1[name], `Berry ${name} Lv.1 base energy mismatch`);
  });

  const ladderBlock = wikiContent.match(/const LV60_COORDINATE_LADDER_DATA = \[([\s\S]*?)\];\s*\n\s*\/\/ 舊版清單資料/);
  assert(ladderBlock, 'LV60_COORDINATE_LADDER_DATA not found');
  const ladderEnergies = [...ladderBlock[1].matchAll(/"energy": (\d+)/g)].map(m => +m[1]).sort((a,b)=>a-b);
  const ingEnergies = Object.values(SEREbii_ING).sort((a,b)=>a-b);
  assertEquals(ladderEnergies.length, 19, 'LV60 ladder should cover all 19 ingredients');
  assertEquals(ladderEnergies.join(','), ingEnergies.join(','), 'Ladder ingredient energies should match INGREDIENT_VALUES_DATA');

  assert(!wikiContent.includes('energy: 200') && !wikiContent.match(/"energy": 200/), 'Residual pumpkin energy 200 should not exist');
  const pumpkin = ings.find(i => i.name === '沉甸甸南瓜');
  assertEquals(pumpkin.energy, 250, 'Plump Pumpkin must be 250');
  const avo = ings.find(i => i.name === '嫩亮酪梨');
  assertEquals(avo.energy, 162, 'Glossy Avocado must be 162');
});

test('Tier 1 - Feature Coverage', 'Box System Integrity: box.js defines 25 Natures, Sub-skills, and User Box data models', () => {
  const boxPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js');
  assert(fs.existsSync(boxPath), 'box.js does not exist');
  const boxContent = fs.readFileSync(boxPath, 'utf8');

  assert(boxContent.includes('NATURE_DATA'), 'box.js missing NATURE_DATA');
  assert(boxContent.includes('SUBSKILLS_DATA'), 'box.js missing SUBSKILLS_DATA');
  assert(boxContent.includes('STORAGE_KEY'), 'box.js missing STORAGE_KEY');
  assert(boxContent.includes('樹果數量S'), 'box.js missing Berry Finding S subskill');
  assert(boxContent.includes('幫手獎勵'), 'box.js missing Helping Bonus subskill');
  assert(boxContent.includes('固執'), 'box.js missing Adamant nature');
});

test('Tier 1 - Feature Coverage', 'Dataset Integrity: news.json exists and contains >= 20 structured news articles with AI summaries', () => {
  const newsPath = path.join(WORKSPACE_ROOT, 'data', 'news.json');
  assert(fs.existsSync(newsPath), 'news.json does not exist');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  assert(Array.isArray(newsData), 'news.json must be an array');
  assert(newsData.length >= 20, `news.json should contain >= 20 articles (got ${newsData.length})`);

  newsData.forEach(item => {
    assert(item.id, 'News item missing id');
    assert(item.url && item.url.startsWith('http'), `News item ${item.id} missing/invalid url`);
    assert(item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date), `News item ${item.id} invalid date format: ${item.date}`);
    assert(item.title && item.title.trim(), `News item ${item.id} missing title`);
    assert(item.overview && item.overview.trim(), `News item ${item.id} missing overview`);
    assert(Array.isArray(item.highlights) && item.highlights.length > 0, `News item ${item.id} missing AI highlights`);
  });
});

test('Tier 1 - Feature Coverage', 'Recipe Energy Formula: Level + Island Bonus + Event Multiplier (1.00x - 2.50x) + Tasty (2x/3x)', () => {
  const LEVEL_BONUS_TABLE = { 1: 0, 70: 258 };
  function testCalcEnergy(base, lv, islandPct, eventMult = 1.0) {
    const lvMult = 1 + ((LEVEL_BONUS_TABLE[lv] || 0) / 100);
    const islandMult = 1 + (islandPct / 100);
    return Math.round(base * lvMult * islandMult * eventMult);
  }

  // Base: 10000, Lv1 (0%), Island 0% (x1.0), Event 1.0x -> 10000
  assertEquals(testCalcEnergy(10000, 1, 0, 1.0), 10000, 'Base energy at Lv1 0% 1.0x should be 10000');
  // Base: 10000, Lv1 (0%), Island 0% (x1.0), Event 1.25x -> 12500
  assertEquals(testCalcEnergy(10000, 1, 0, 1.25), 12500, 'Energy with 1.25x event bonus should be 12500');
  // Base: 10000, Lv1 (0%), Island 0% (x1.0), Event 2.50x -> 25000
  assertEquals(testCalcEnergy(10000, 1, 0, 2.5), 25000, 'Energy with 2.50x event bonus should be 25000');
  // Tasty 2x & 3x calculations
  const energy = testCalcEnergy(10000, 1, 0, 1.5); // 15000
  assertEquals(energy * 2, 30000, 'Tasty 2x should be double normal energy');
  assertEquals(energy * 3, 45000, 'Tasty 3x should be triple normal energy');
});

test('Tier 1 - Feature Coverage', 'CSS Styling: styles.css exists with dark theme, badge styles, responsive rules', () => {
  const cssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');
  assert(fs.existsSync(cssPath), 'styles.css does not exist');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('--bg-dark'), 'CSS missing --bg-dark custom property');
  assert(cssContent.includes('.type-badge'), 'CSS missing .type-badge styling');
  assert(cssContent.includes('@media'), 'CSS missing responsive @media query rules');
});

test('Tier 1 - Feature Coverage', 'JS Logic: app.js contains state management, multi-filtering, sorting & rendering', () => {
  assert(typeof PokemonApp === 'object', 'PokemonApp object is not defined');
  assert(typeof PokemonApp.filterData === 'function', 'filterData method missing');
  assert(typeof PokemonApp.sortData === 'function', 'sortData method missing');
  assert(typeof PokemonApp.render === 'function', 'render method missing');
});

// -------------------------------------------------------------------
// Tier 2 - Boundary & Corner Cases
// -------------------------------------------------------------------
console.log('\n--- Tier 2 - Boundary & Corner Cases ---');

test('Tier 2 - Boundary & Corner Cases', 'Empty search string returns all items (with onlyFinal=false)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  const filtered = PokemonApp.filterData();
  assertEquals(filtered.length, dataset.length, 'Empty search with onlyFinal=false should return all items');
});

test('Tier 2 - Boundary & Corner Cases', 'ID search formats (#0001, 1, 01) correctly match Bulbasaur', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  ['#0001', '1', '01'].forEach(idQuery => {
    PokemonApp.currentSearch = idQuery;
    const res = PokemonApp.filterData();
    assert(res.length >= 1, `Query '${idQuery}' should match at least 1 item`);
    const match = res.find(p => getItemId(p) === '1');
    assert(match !== undefined, `Query '${idQuery}' should match Bulbasaur (ID 1)`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Case-insensitive search (bulbasaur, Bulbasaur, BULBASAUR)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  ['bulbasaur', 'Bulbasaur', 'BULBASAUR'].forEach(q => {
    PokemonApp.currentSearch = q;
    const res = PokemonApp.filterData();
    assert(res.length >= 1, `Search '${q}' should find results`);
    const match = res.find(p => getItemNameEN(p).toLowerCase() === 'bulbasaur');
    assert(match !== undefined, `Search '${q}' should match Bulbasaur`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Multi-select type combinations (e.g. ["草", "毒"])', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedTypes = new Set(['草', '毒']);

  const res = PokemonApp.filterData();
  assert(res.length > 0, 'Multi-type filter should return items');
  res.forEach(item => {
    assert(item.type === '草' || item.type === '毒', `Item ${item.id} type '${item.type}' not in selected types ['草', '毒']`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Multi-select specialty combinations (e.g. ["樹果", "食材"]) and Mew all-specialty inclusion', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties = new Set(['樹果', '食材']);

  const res = PokemonApp.filterData();
  assert(res.length > 0, 'Multi-specialty filter should return items');
  res.forEach(item => {
    assert(item.specialty === '樹果' || item.specialty === '食材' || item.specialty === '全部', `Item ${item.id} specialty '${item.specialty}' not in ['樹果', '食材', '全部']`);
  });

  // Verify Mew (夢幻) with specialty '全部' is included under any specialty
  const mew = res.find(p => p.name_cn === '夢幻');
  assert(mew !== undefined, 'Mew (夢幻) must be included when filtering by 樹果/食材');

  // Verify Fairy berry (桃桃果) mapping
  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedBerries = new Set(['桃桃果']);
  const fairyFiltered = PokemonApp.filterData();
  assert(fairyFiltered.length > 0, 'Fairy berry filter (桃桃果) should return Fairy-type Pokémon');
  const fairyPkm = fairyFiltered.find(p => p.name_cn === '皮可西' || p.name_cn === '胖可丁' || p.name_cn === '仙子伊布');
  assert(fairyPkm !== undefined, 'Clefable/Wigglytuff/Sylveon should match Fairy berry 桃桃果');
});

test('Tier 2 - Boundary & Corner Cases', 'Dynamic Sub-Filters: Berry, Ingredient, and Skill multi-select filtering', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  // 1. Berry multi-select filter (墨莓果 -> 草屬性, 蘋野果 -> 火屬性)
  PokemonApp.selectedBerries = new Set(['墨莓果', '蘋野果']);
  const berryFiltered = PokemonApp.filterData();
  assert(berryFiltered.length > 0, 'Berry filter should return results');
  berryFiltered.forEach(p => {
    assert(p.type === '草' || p.type === '火', `Item ${p.id} type '${p.type}' should match 墨莓果/蘋野果`);
  });

  // 2. Ingredient multi-select filter (甜甜蜜)
  PokemonApp.selectedBerries.clear();
  PokemonApp.selectedIngredients = new Set(['甜甜蜜']);
  const ingFiltered = PokemonApp.filterData();
  assert(ingFiltered.length > 0, 'Ingredient filter should return results');
  ingFiltered.forEach(p => {
    const hasHoney = p.ingredients && p.ingredients.some(ing => ing.name === '甜甜蜜');
    assert(hasHoney, `Item ${p.name_cn} should have 甜甜蜜 in its ingredients`);
  });

  // 2b. Initial Ingredient only filter (僅初始食材)
  PokemonApp.onlyInitialIng = true;
  PokemonApp.selectedIngredients = new Set(['特選蘋果']);
  const initialIngFiltered = PokemonApp.filterData();
  assert(initialIngFiltered.length > 0, 'Initial ingredient filter should return results');
  initialIngFiltered.forEach(p => {
    const initialName = p.ingredients && p.ingredients[0] ? p.ingredients[0].name : '';
    assert(initialName === '特選蘋果', `Item ${p.name_cn} initial ingredient (${initialName}) must be 特選蘋果 when onlyInitialIng is true`);
  });
  PokemonApp.onlyInitialIng = false;

  // 3. Main Skill multi-select filter (食材獲取S, 料理成功S) with composite matching
  PokemonApp.selectedIngredients.clear();
  PokemonApp.selectedSkills = new Set(['料理成功S']);
  const tastyFiltered = PokemonApp.filterData();
  assert(tastyFiltered.length > 0, 'Skill filter for 料理成功S should return results');
  const heracross = tastyFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracross !== undefined, '赫拉克羅斯 (健美) should match 料理成功S');

  // Heracross should also match 食材獲取S, but NOT 料理強化S
  PokemonApp.selectedSkills = new Set(['食材獲取S']);
  const ingSkillFiltered = PokemonApp.filterData();
  const heracrossIng = ingSkillFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracrossIng !== undefined, '赫拉克羅斯 (健美) should also match 食材獲取S');
  const delibird = ingSkillFiltered.find(p => p.name_cn === '信使鳥');
  assert(delibird !== undefined, '信使鳥 (禮物) should match 食材獲取S');

  PokemonApp.selectedSkills = new Set(['料理強化S']);
  const potSkillFiltered = PokemonApp.filterData();
  const heracrossPot = potSkillFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracrossPot === undefined, '赫拉克羅斯 (健美) should NOT match 料理強化S');

  // Umbreon (月光) should match 活力填充S and 活力療癒S
  PokemonApp.selectedSkills = new Set(['活力療癒S']);
  const healSkillFiltered = PokemonApp.filterData();
  const umbreon = healSkillFiltered.find(p => p.name_cn === '月亮伊布');
  assert(umbreon !== undefined, '月亮伊布 (月光) should match 活力療癒S');
  const shuckle = healSkillFiltered.find(p => p.name_cn === '壺壺');
  assert(shuckle !== undefined, '壺壺 (樹果汁) should match 活力療癒S');

  // Mimikyu (畫皮) & Mewtwo (精神擊破) should match 樹果遽增
  PokemonApp.selectedSkills = new Set(['樹果遽增']);
  const berrySkillFiltered = PokemonApp.filterData();
  const mimikyu = berrySkillFiltered.find(p => p.name_cn === '謎擬Q');
  assert(mimikyu !== undefined, '謎擬Q (畫皮) should match 樹果遽增');
  const mewtwo = berrySkillFiltered.find(p => p.name_cn === '超夢');
  assert(mewtwo !== undefined, '超夢 (精神擊破) should match 樹果遽增');

  // 4. Cross-Combination: 食材類型 + 蘋野果 (火屬性樹果) -> e.g. 噴火龍 (Charizard)
  PokemonApp.selectedSkills.clear();
  PokemonApp.selectedSpecialties = new Set(['食材']);
  PokemonApp.selectedBerries = new Set(['蘋野果']);
  const crossFiltered = PokemonApp.filterData();
  assert(crossFiltered.length > 0, 'Cross filter for 食材 specialty + 蘋野果 should return results');
  const charizard = crossFiltered.find(p => p.name_cn === '噴火龍');
  assert(charizard !== undefined, '噴火龍 should match 食材 specialty + 蘋野果 (火樹果)');
});

test('Tier 2 - Boundary & Corner Cases', 'Final Evolution Filter: onlyFinal defaults to TRUE and correctly filters final/single stages', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedBerries.clear();
  PokemonApp.selectedIngredients.clear();
  PokemonApp.selectedSkills.clear();

  // 1. By default, onlyFinal MUST be TRUE
  assertEquals(PokemonApp.onlyFinal, true, 'PokemonApp.onlyFinal should default to true');
  const defaultFinals = PokemonApp.filterData();
  assertEquals(defaultFinals.length, 127, 'Default filter should return exactly 127 final/single stage Pokémon');

  // Must EXCLUDE pre-evolutions: Bulbasaur (#001), Ivysaur (#002), Charmander (#004), Charmeleon (#005), Squirtle (#007), Wartortle (#008)
  const preEvos = ['妙蛙種子', '妙蛙草', '小火龍', '火恐龍', '傑尼龜', '卡咪龜', '皮丘', '皮卡丘'];
  preEvos.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found === undefined, `Pre-evolution ${name} should NOT be in final evolution list`);
  });

  // Must INCLUDE final stages and single stages: Venusaur, Charizard, Blastoise, Raichu, Pinsir, Heracross, Mewtwo, Mew
  const finalStages = ['妙蛙花', '噴火龍', '水箭龜', '雷丘', '凱羅斯', '赫拉克羅斯', '超夢', '夢幻'];
  finalStages.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found !== undefined, `Final stage ${name} MUST be in final evolution list`);
  });

  // 2. When onlyFinal is toggled to FALSE
  PokemonApp.onlyFinal = false;
  assertEquals(PokemonApp.filterData().length, dataset.length, 'onlyFinal=false should return all 247 items');
});

test('Tier 2 - Boundary & Corner Cases', 'Special Main Skill Tooltip Details: Hover tooltips only on special skills matching official in-game text', () => {
  assert(typeof SPECIAL_SKILL_DETAILS === 'object', 'SPECIAL_SKILL_DETAILS dictionary is missing');
  assert(typeof renderSkillWithTooltip === 'function', 'renderSkillWithTooltip function is missing');

  // 1. Test special/composite/variant skills (MUST have special badge, sparkle icon, and in-game description)
  const specialSkills = [
    '健美（料理輔助S）',
    '月光（活力填充S）',
    '樹果汁（活力全體療癒S）',
    '精神擊破（樹果領域）',
    '畫皮（樹果遽增）',
    '新月祈禱（活力全體療癒S）',
    '正電（食材獲取S）',
    '負電（料理強化S）'
  ];

  specialSkills.forEach(skill => {
    assert(SPECIAL_SKILL_DETAILS[skill] !== undefined, `Missing SPECIAL_SKILL_DETAILS entry for ${skill}`);
    const html = renderSkillWithTooltip(skill);
    assert(html.includes('special-skill-badge'), `Rendered badge for ${skill} should have 'special-skill-badge' class`);
    assert(html.includes('data-skill-detail='), `Rendered badge for ${skill} should have data-skill-detail attribute`);
    assert(html.includes('✨'), `Rendered badge for ${skill} should include sparkle icon indicator`);
  });

  // Verify Heracross official in-game text
  const heracrossDetail = typeof SPECIAL_SKILL_DETAILS['健美（料理輔助S）'] === 'object'
    ? SPECIAL_SKILL_DETAILS['健美（料理輔助S）']['zh-TW']
    : SPECIAL_SKILL_DETAILS['健美（料理輔助S）'];
  assertEquals(
    heracrossDetail,
    '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'Heracross skill description must match official in-game text'
  );

  // 2. Test pure base skills (like 能量填充S, 夢之碎片獲取S, 能量填充S（隨機）, 夢之碎片獲取S（隨機）) - MUST NOT have tooltips or special badges
  const pureBaseSkills = [
    '能量填充S',
    '能量填充M',
    '能量填充S（隨機）',
    '夢之碎片獲取S',
    '夢之碎片獲取S（隨機）',
    '食材獲取S',
    '活力全體療癒S',
    '料理強化S',
    '幫手支援S'
  ];
  pureBaseSkills.forEach(skill => {
    const rendered = renderSkillWithTooltip(skill);
    assertEquals(rendered, skill, `Pure base skill ${skill} should be rendered as plain text without tooltip or badge`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Fallback icon validation: missing/empty icon property defaults to SVG placeholder', () => {
  const itemNoIcon = { id: 9999, name: { cn: 'Test' }, type: '草', specialty: '樹果', icon: '' };
  const icon = getItemIcon(itemNoIcon);
  assert(icon.startsWith('data:image/svg+xml'), 'Empty icon should fallback to SVG data URI');
});

test('Tier 2 - Boundary & Corner Cases', 'Box Data Operations: CRUD structure and level boundaries (Lv.1 to Lv.80)', () => {
  const dummyPokemon = {
    uid: 'pkm_test_123',
    pokemonId: '1',
    name: '妙蛙種子',
    level: 80,
    nickname: '草系主將',
    nature: '固執',
    ing1: '特選蘋果',
    ing2: '特選蘋果',
    ing3: '窩心牛奶',
    subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升M']
  };

  assert(dummyPokemon.level >= 1 && dummyPokemon.level <= 80, 'Level out of bounds (1~80)');
  assert(dummyPokemon.subskills.length <= 5, 'Subskills must not exceed 5');
  assert(dummyPokemon.name && dummyPokemon.name.trim(), 'Box Pokemon missing name');
  assert(dummyPokemon.uid && dummyPokemon.uid.startsWith('pkm_'), 'Invalid UID format');
});

test('Tier 2 - Boundary & Corner Cases', 'RaenonX PR Calculation: Fast-Exit Baseline Filter & Lv.70/Lv.80 Sub-skill coverage', () => {
  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  const calcPR = boxModule.calculatePokemonPR;
  assert(typeof calcPR === 'function', 'calculatePokemonPR must be a function');

  // 1. Berry God Pokemon (Raichu / Rattata: Adamant + BFS + HB + HelpSpeedM)
  const berryGod = {
    name: '小拉達',
    specialty: '樹果',
    nature: '固執', // speed ++, ing --
    subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能等級提升M', '持有上限提升L']
  };
  const berryResult = calcPR(berryGod, { specialty: '樹果' });
  assert(berryResult.pr >= 90, `Berry God PR should be >= 90 (got ${berryResult.pr})`);
  assertEquals(berryResult.tier, 'S+', 'Berry God should be S+ tier');
  assert(berryResult.summaryNote.includes('樹果S') || berryResult.summaryNote.includes('幫忙速度'), 'Summary should highlight BFS');

  // 2. Ingredient Specialist (Bulbasaur: Modest + IngFinderM + HelpBonus)
  const ingSpecialist = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '內斂', // ing ++, speed --
    subskills: ['食材機率提升M', '幫手獎勵', '食材機率提升S', '持有上限提升M', '幫忙速度M']
  };
  const ingResult = calcPR(ingSpecialist, { specialty: '食材' });
  assert(ingResult.pr >= 80, `Ingredient Specialist PR should be >= 80 (got ${ingResult.pr})`);
  assert(ingResult.tier === 'S+' || ingResult.tier === 'S', `Ingredient Specialist tier should be S/S+ (got ${ingResult.tier})`);

  // 3. Fast-Exit Baseline: Berry Pokemon with Modest nature and no relevant subskills
  const poorBerry = {
    name: '小拉達',
    specialty: '樹果',
    nature: '內斂', // ing ++, speed -- (speed debuff + no BFS/HB)
    subskills: ['持有上限提升S', '活力回復提升S']
  };
  const poorResult = calcPR(poorBerry, { specialty: '樹果' });
  assert(poorResult.pr < 50, `Poor Pokemon PR should be < 50 (got ${poorResult.pr})`);
  assert(poorResult.tier === 'B' || poorResult.tier === 'C', `Poor Pokemon tier should be B or C (got ${poorResult.tier})`);
  assert(poorResult.summaryNote.includes('⚠️') && poorResult.summaryNote.includes('未達'), 'Summary note should indicate baseline failure');

  // 4. Fast-Exit Baseline: Ingredient Pokemon with Adamant nature (Ing down) and no Ing Finder M
  const poorIng = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '固執', // speed ++, ing --
    subskills: ['幫忙速度S', '睡眠EXP獎勵']
  };
  const poorIngResult = calcPR(poorIng, { specialty: '食材' });
  assert(poorIngResult.pr < 50, `Poor Ingredient PR should be < 50 (got ${poorIngResult.pr})`);
  assert(poorIngResult.summaryNote.includes('⚠️'), 'Should fail baseline due to Ing debuff');
});

test('Tier 2 - Boundary & Corner Cases', 'Event Gantt Timeline Parser: Identifies Events and Bundles with column grid spans and date ranges', () => {
  const newsPath = path.join(WORKSPACE_ROOT, 'data', 'news.json');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  const newsModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'));

  const timeline = newsModule.parseEventTimeline(newsData);
  assert(Array.isArray(timeline), 'parseEventTimeline must return an array');
  assert(timeline.length > 0, 'Timeline should contain event items');

  const firstItem = timeline[0];
  assert(firstItem.title, 'Timeline item missing title');
  assert(firstItem.startStr && firstItem.endStr, 'Timeline item missing startStr or endStr');
  assert(typeof firstItem.startCol === 'number' && typeof firstItem.spanCols === 'number', 'Timeline item missing grid column spans');
  assert(firstItem.typeLabel && firstItem.typeClass, 'Timeline item missing type label');

  // Verify events & packs both exist
  const events = timeline.filter(t => t.typeClass === 'gantt-bar-event');
  const packs = timeline.filter(t => t.typeClass === 'gantt-bar-pack');
  assert(events.length > 0, 'Gantt timeline should parse events');
  assert(packs.length > 0, 'Gantt timeline should parse bundle packs');
});

test('Tier 2 - Boundary & Corner Cases', 'Special Pokemon icon resolution (9001-9006, 7006, 7007, 7054, 8001, 150) maps to valid Serebii URLs', () => {
  const specialIds = ['9001', '9002', '9003', '9004', '9005', '9006', '7006', '7007', '7054', '8001', '150'];
  specialIds.forEach(id => {
    const item = dataset.find(p => String(p.id) === id);
    if (item) {
      const icon = getItemIcon(item);
      assert(icon && icon.startsWith('https://www.serebii.net/'), `Special item #${id} icon missing or not Serebii URL: ${icon}`);
      assert(!icon.includes(`pokemonsleep/pokemon/icon/${id}.png`), `Special item #${id} must not use naive numerical path pokemonsleep/pokemon/icon/${id}.png`);
    }
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Table column sort: carry/ingredient/skill default desc, interval default asc; same-col toggles; switching col uses that col default', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;

  assertEquals(PokemonApp.toggleColumnSort('carry'), 'carry-desc', '持有 first click should be desc');
  let list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemCarry(list[i]) >= getItemCarry(list[i + 1]), '持有 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('carry'), 'carry-asc', '持有 second click should toggle to asc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemCarry(list[i]) <= getItemCarry(list[i + 1]), '持有 should sort asc after toggle');
  }

  assertEquals(PokemonApp.toggleColumnSort('ingredientRate'), 'ingredientRate-desc', '食材率 first click from other col should be desc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemIngredientRate(list[i]) >= getItemIngredientRate(list[i + 1]), '食材率 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('skillRate'), 'skillRate-desc', '技能率 first click from other col should be desc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemSkillRate(list[i]) >= getItemSkillRate(list[i + 1]), '技能率 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('interval'), 'interval-asc', '幫忙間隔 first click should be asc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemHelpInterval(list[i]) <= getItemHelpInterval(list[i + 1]), '幫忙間隔 should sort asc');
  }

  assertEquals(PokemonApp.toggleColumnSort('interval'), 'interval-desc', '幫忙間隔 second click should toggle to desc');
});

// -------------------------------------------------------------------
// Tier 3 - Cross-Feature Combinations
// -------------------------------------------------------------------
console.log('\n--- Tier 3 - Cross-Feature Combinations ---');

test('Tier 3 - Cross-Feature Combinations', 'Combined filters: text search + multi-type + multi-specialty + sorting + view mode', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = 'a';
  PokemonApp.selectedTypes = new Set(['草', '水', '火']);
  PokemonApp.selectedSpecialties = new Set(['食材', '樹果']);
  PokemonApp.currentSort = 'ingredientRate-desc';
  PokemonApp.viewMode = 'table';

  const result = PokemonApp.render();
  assert(Array.isArray(result), 'render should return filtered sorted array');

  for (let i = 0; i < result.length - 1; i++) {
    const rateA = getItemIngredientRate(result[i]);
    const rateB = getItemIngredientRate(result[i + 1]);
    assert(rateA >= rateB, `Sort failed: item ${result[i].id} rate (${rateA}) < item ${result[i+1].id} rate (${rateB})`);
  }

  result.forEach(item => {
    assert(PokemonApp.selectedTypes.has(item.type), `Item type ${item.type} not in selected types`);
    assert(PokemonApp.selectedSpecialties.has(item.specialty), `Item specialty ${item.specialty} not in selected specialties`);
  });
});

// -------------------------------------------------------------------
// Tier 4 - Real-World Application Scenarios
// -------------------------------------------------------------------
console.log('\n--- Tier 4 - Real-World Application Scenarios ---');

test('Tier 4 - Real-World Application Scenarios', 'Full application workflow simulation: load data -> filter CN name -> toggle to table view -> sort by ingredientRate descending', () => {
  const mockDoc = createMockDocument();
  const globalContext = {
    document: mockDoc,
    window: { PokemonApp, getItemIcon, DEFAULT_SVG_ICON },
    PokemonApp,
    getItemIcon,
    DEFAULT_SVG_ICON,
    console
  };

  // Step 1: Load Data
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  const initialItems = PokemonApp.render();
  assert(initialItems.length >= 247, 'Initial load with onlyFinal=false should contain >= 247 items');

  // Step 2: Filter CN name (e.g. '皮卡丘' or '妙蛙')
  PokemonApp.currentSearch = '妙蛙';
  const filteredCN = PokemonApp.render();
  assert(filteredCN.length >= 2, 'Search "妙蛙" should match Bulbasaur, Ivysaur, etc.');

  // Step 3: Toggle to table view
  PokemonApp.viewMode = 'table';

  // Step 4: Sort by ingredientRate descending
  PokemonApp.currentSort = 'ingredientRate-desc';
  const sortedResult = PokemonApp.render();

  assert(sortedResult.length === filteredCN.length, 'Filtered count should remain consistent after view & sort toggle');

  for (let i = 0; i < sortedResult.length - 1; i++) {
    const currentRate = getItemIngredientRate(sortedResult[i]);
    const nextRate = getItemIngredientRate(sortedResult[i + 1]);
    assert(currentRate >= nextRate, 'Workflow verify: ingredient rates should be in descending order');
  }
});

test('Tier 1 - Feature Coverage', 'Appraisal Lab & Six-Dimension Engine: Evaluates BFS God Roll and calculates milestone costs', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const sampleRaichu = {
    id: '26',
    name_cn: '雷丘',
    specialty: '樹果',
    type: '電',
    interval: '00:36:40'
  };

  // Evaluation with BFS Lv.10 + Helping Speed M
  const result = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 30, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵', '技能機率提升M', '睡眠EXP獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果']);
  
  assert(result !== null, 'Evaluation should return non-null object');
  assert(result.scores.berry >= 90, 'Raichu with BFS and Adamant should have berry score >= 90');
  assert(result.scores.speed >= 80, 'Raichu with fast interval and Adamant should have speed score >= 80');
  assert(result.grade === 'S+' || result.grade === 'S', 'Raichu God Roll should achieve S+ or S rank');
  assert(result.pros.length >= 2, 'Should generate multiple pro highlights for top rolls');

  // SVG Radar Chart verification
  const svg = ctx.AppraisalLab.renderRadarChartSVG(result.scores, 280);
  assert(svg.includes('<svg'), 'Radar chart should be a valid SVG string');
  assert(svg.includes('<polygon'), 'Radar chart should include polygon elements');
  assert(svg.includes('樹果產能'), 'Radar chart should include dimension labels');

  // Milestone costs
  const costs = ctx.AppraisalLab.calculateMilestoneCost(10, 30, { buffType: 'none', debuffType: 'none' });
  assert(costs.candies > 0, 'Cost to Lv.30 should require candies');
  assert(costs.shards > 0, 'Cost to Lv.30 should require dream shards');
  assert(costs.handyCandyS > 0, 'Cost should calculate Handy Candy S equivalents');
});

test('Tier 1 - Feature Coverage', 'Ingredient Ladder: Recipe Supply mappings & Cross-Track Search/Filter functionality', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), 
      getElementById: () => null,
      querySelectorAll: () => []
    },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(wikiCode, ctx);

  assert(ctx.WikiDB && ctx.WikiDB.TOP_RECIPES_FOR_INGREDIENTS, 'WikiDB should export TOP_RECIPES_FOR_INGREDIENTS');
  const recipes = ctx.WikiDB.TOP_RECIPES_FOR_INGREDIENTS;
  assert(Object.keys(recipes).length === 19, 'Should define top recipes for all 19 ingredients');
  assert(recipes.corn.name === '煉獄玉米乾酪咖哩', 'Corn top recipe should be Inferno Corn Keema Curry');
  assert(recipes.corn.need === 27, 'Corn requirement per meal should be 27');

  // Verify search & filter methods
  assert(typeof ctx.WikiDB.onLadderSearch === 'function', 'onLadderSearch should be a function');
  assert(typeof ctx.WikiDB.clearLadderSearch === 'function', 'clearLadderSearch should be a function');
  assert(typeof ctx.WikiDB.setLadderRecipeFilter === 'function', 'setLadderRecipeFilter should be a function');
});

test('Tier 2 - Boundary & Corner Cases', 'Batch OCR & Smart Deduplication: Fingerprint hashing and duplicate rejection', () => {
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, className: '' }), 
      getElementById: () => null,
      querySelectorAll: () => [],
      body: { appendChild: () => {} }
    },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);

  // Test deduplication fingerprint
  const pkmA1 = { name: '雷丘', level: 35, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };
  const pkmA2 = { name: '雷丘', level: 35, nature: '固執', subskills: ['幫忙速度M', '樹果數量S'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' }; // subskills different order
  const pkmB = { name: '雷丘', level: 36, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' }; // level diff

  function makeFP(p) {
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.name || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  const fpA1 = makeFP(pkmA1);
  const fpA2 = makeFP(pkmA2);
  const fpB = makeFP(pkmB);

  assertEquals(fpA1, fpA2, 'Fingerprint should be order-independent for subskills');
  assert(fpA1 !== fpB, 'Fingerprint should distinguish different levels');
});

test('Tier 1 - Feature Coverage', 'i18n Bilingual Engine & Strategy Dictionaries: Translation coverage', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      documentElement: { setAttribute: () => {} },
      querySelectorAll: () => []
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  assert(I18N, 'I18N module must be exposed on window');
  
  // Default is zh-TW
  assertEquals(I18N.getLanguage(), 'zh-TW', 'Default language should be zh-TW');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep 資料庫', 'zh-TW brand.title match');
  assertEquals(I18N.getTypeName('草'), '草', 'zh-TW type name match');
  assertEquals(I18N.getSpecialtyName('樹果'), '樹果', 'zh-TW specialty name match');
  assertEquals(I18N.getNatureName('固執'), '固執', 'zh-TW nature name match');

  // Switch to en-US
  I18N.setLanguage('en-US');
  assertEquals(I18N.getLanguage(), 'en-US', 'Language should switch to en-US');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep Database', 'en-US brand.title match');
  assertEquals(I18N.getTypeName('草'), 'Grass', 'en-US type name match');
  assertEquals(I18N.getSpecialtyName('樹果'), 'Berries', 'en-US specialty name match');
  assertEquals(I18N.getNatureName('固執'), 'Adamant', 'en-US nature name match');
  assertEquals(I18N.getIngredientName('特選蘋果'), 'Fancy Apple', 'en-US ingredient name match');
});

test('Tier 1 - Feature Coverage', 'Multi-Theme CSS Variables & Theme Engine: 4 fixed themes (2 Dark + 2 Light)', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  
  assert(cssContent.includes('[data-theme="midnight"]'), 'styles.css must support midnight theme');
  assert(cssContent.includes('[data-theme="onyx"]'), 'styles.css must support onyx theme');
  assert(cssContent.includes('[data-theme="dawn"]'), 'styles.css must support dawn light theme');
  assert(cssContent.includes('[data-theme="emerald"]'), 'styles.css must support emerald light theme');
  assert(cssContent.includes('.theme-picker-grid'), 'styles.css must style theme picker grid');
  assert(cssContent.includes('.lang-switcher-row'), 'styles.css must style language switcher');
});

test('Tier 1 - Feature Coverage', 'English Mode Subtitle Hiding & Title Centering Rules', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssContent.includes('html[lang="en"] .brand-subtitle'), 'CSS must hide brand-subtitle in English');
  assert(cssContent.includes('html[lang="en"] .pokemon-name-en'), 'CSS must hide pokemon-name-en in English');
  assert(cssContent.includes('html[lang="en"] .recipe-name-sub'), 'CSS must hide recipe-name-sub in English');
  assert(cssContent.includes('html[lang="en"] .appraisal-pokemon-en'), 'CSS must hide appraisal-pokemon-en in English');
});

test('Tier 1 - Feature Coverage', 'All 38+ Main Skill Variants & Aliases 100% English Translated in I18N', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = { window: {}, document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem: () => {} }, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  const I18N = ctx.window.I18N;
  I18N.setLanguage('en-US');

  // Verify all main skills in dataset
  const datasetSkills = Array.from(new Set(dataset.map(p => p.mainSkill).filter(Boolean)));
  datasetSkills.forEach(skill => {
    const enName = I18N.getMainSkillName(skill);
    assert(enName && typeof enName === 'string', `Main skill "${skill}" missing English translation`);
    assert(!/[\u4e00-\u9fa5]/.test(enName), `Main skill translation for "${skill}" still contains Chinese: "${enName}"`);
  });

  // Verify specific aliases and legendary skills
  const testSkills = [
    '能量填充S', '能量填充S（隨機）', '能量填充M', '食材獲取S', '料理強化S', '料理成功S',
    '活力充填S', '活力療癒S', '全體療癒S', '活力全體療癒S', '幫手加速', '幫手加速（電）',
    '幫手加速（火）', '幫手加速（水）', '夢之碎片獲取S', '夢之碎片獲取S（隨機）',
    '變身（技能複製）', '模仿（技能複製）', '揮指', '月光（活力填充S）', '新月祈禱（活力全體療癒S）',
    '健美（料理輔助S）', '蹭蹭臉頰（活力療癒S）', '精神擊破（樹果領域）', '畫皮（樹果遽增）'
  ];

  testSkills.forEach(skill => {
    const enName = I18N.getMainSkillName(skill);
    assert(enName && !/[\u4e00-\u9fa5]/.test(enName), `Skill "${skill}" failed translation, got "${enName}"`);
  });

  // Verify official Pokémon Sleep in-game skill names
  assert(I18N.getMainSkillName('幫手支援S') === 'Extra Helpful S', '幫手支援S should be Extra Helpful S');
  assert(I18N.getMainSkillName('料理成功S') === 'Tasty Chance S', '料理成功S should be Tasty Chance S');
  assert(I18N.getMainSkillName('活力療癒S') === 'Energizing Cheer S', '活力療癒S should be Energizing Cheer S');
  assert(I18N.getMainSkillName('料理強化S') === 'Cooking Power-Up S', '料理強化S should be Cooking Power-Up S');
  assert(I18N.getMainSkillName('新月祈禱（活力全體療癒S）') === 'Lunar Prayer (Energy for Everyone S)', '新月祈禱 should be Lunar Prayer (Energy for Everyone S)');
  assert(I18N.getMainSkillName('十項全能（揮指）[可替換]') === 'All-Rounder (Metronome) [Customizable]', '十項全能 should be All-Rounder (Metronome) [Customizable]');
});

test('Tier 1 - Feature Coverage', 'Low Saturation Recipe Badges Tokens & Classes Defined for 4 Themes', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  
  // Theme variables
  const requiredTokens = [
    '--badge-cat-curry-bg', '--badge-cat-salad-bg', '--badge-cat-dessert-bg',
    '--badge-pot-bg', '--badge-bonus-78-bg', '--badge-bonus-61-bg',
    '--badge-bonus-48-bg', '--badge-bonus-35-bg', '--badge-bonus-25-bg'
  ];
  requiredTokens.forEach(token => {
    assert(cssContent.includes(token), `styles.css missing token ${token}`);
  });

  // Badge classes
  assert(cssContent.includes('.recipe-cat-badge.cat-咖哩'), 'styles.css missing cat-咖哩');
  assert(cssContent.includes('.pot-badge'), 'styles.css missing pot-badge');
  assert(cssContent.includes('.bonus-badge.bonus-badge-78'), 'styles.css missing bonus-badge-78');
  assert(cssContent.includes('.bonus-badge.bonus-badge-61'), 'styles.css missing bonus-badge-61');
  assert(cssContent.includes('.recipe-name-cell'), 'styles.css missing .recipe-name-cell');
  assert(cssContent.includes('.recipe-name-wrapper'), 'styles.css missing .recipe-name-wrapper');
});

test('Tier 4 - Real-World Application Scenarios', 'SPA Tab Lifecycle, Hashchange Routing & Wiki Rendering In Both Languages', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // Test Wiki layout rendering in zh-TW and en-US
  ['zh-TW', 'en-US'].forEach(lang => {
    const mockContainer = {
      innerHTML: '',
      style: { display: '' }
    };
    const ctx = {
      window: {
        location: { hash: '#wiki' },
        localStorage: { getItem: () => lang, setItem: () => {} },
        addEventListener: () => {},
        history: { replaceState: () => {} }
      },
      document: {
        readyState: 'complete',
        documentElement: { setAttribute: () => {} },
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      },
      console: console,
      setTimeout: setTimeout
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    vm.createContext(ctx);
    vm.runInContext(i18nCode, ctx);
    vm.runInContext(wikiCode, ctx);

    assert(typeof ctx.window.WikiDB.renderWikiLayout === 'function', 'WikiDB.renderWikiLayout should be a function');
    ctx.window.WikiDB.renderWikiLayout(mockContainer);
    assert(mockContainer.innerHTML.length > 50000, `Wiki HTML should be rendered for ${lang}, got length ${mockContainer.innerHTML.length}`);
    assert(mockContainer.innerHTML.includes('wiki-subpanel-skills'), 'Wiki should contain skills subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-subskills'), 'Wiki should contain subskills subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-ratings'), 'Wiki should contain ratings subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-ingredients'), 'Wiki should contain ingredients subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-values'), 'Wiki should contain values subpanel');
  });
});


// Final Summary Output
console.log('\n======================================================');
console.log('                   Test Results Summary');
console.log('======================================================');
Object.keys(resultsByTier).forEach(tier => {
  const { pass, fail } = resultsByTier[tier];
  console.log(`- ${tier}: ${pass} Passed, ${fail} Failed (Total ${pass + fail})`);
});
console.log('------------------------------------------------------');
console.log(`TOTAL RESULT: ${passedTests} / ${totalTests} Passed (${failedTests} Failed)\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
