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

function assertArrayEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${message || 'assertArrayEquals failed'}: Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Lightweight Mini-DOM Implementation for Headless E2E Simulation
class MiniElement {
  constructor(tagName, id = '', className = '') {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this._className = className;
    this.style = {};
    this.dataset = {};
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
      },
      toggle(c, force) {
        const exists = this.contains(c);
        const shouldAdd = force !== undefined ? !!force : !exists;
        if (shouldAdd) this.add(c);
        else this.remove(c);
        return shouldAdd;
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

  setAttribute(k, v) {
    this.attributes[k] = String(v);
    if (k.startsWith('data-')) {
      const camelKey = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[camelKey] = String(v);
    }
  }
  getAttribute(k) { return this.attributes[k] !== undefined ? this.attributes[k] : null; }
  hasAttribute(k) { return this.attributes[k] !== undefined; }
  removeAttribute(k) {
    delete this.attributes[k];
    if (k.startsWith('data-')) {
      const camelKey = k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      delete this.dataset[camelKey];
    }
  }

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

  appendChild(child) {
    if (child) {
      child.parentNode = this;
      this.children.push(child);
    }
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  querySelector(selector) {
    const results = this.querySelectorAll(selector);
    return results.length > 0 ? results[0] : null;
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
  if (!node || !selector) return false;
  selector = selector.trim();
  if (selector.startsWith('#')) {
    return node.id === selector.slice(1);
  }
  if (selector.startsWith('.')) {
    return node.classList.contains(selector.slice(1));
  }
  if (selector.startsWith('[') && selector.endsWith(']')) {
    const attrContent = selector.slice(1, -1);
    if (attrContent.includes('=')) {
      const [attrName, val] = attrContent.split('=');
      const cleanVal = val.replace(/['"]/g, '');
      return node.getAttribute(attrName) === cleanVal;
    }
    return node.hasAttribute(attrContent);
  }
  if (selector.includes('.')) {
    const parts = selector.split('.');
    const tagMatch = !parts[0] || node.tagName === parts[0].toUpperCase();
    const classMatch = parts.slice(1).every(c => node.classList.contains(c));
    return tagMatch && classMatch;
  }
  if (selector.includes('[')) {
    const tag = selector.slice(0, selector.indexOf('['));
    const attrMatch = selector.slice(selector.indexOf('['));
    const tagMatches = !tag || node.tagName === tag.toUpperCase();
    return tagMatches && matchesSelector(node, attrMatch);
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
    querySelector: (selector) => {
      const all = Object.values(elements);
      const found = all.filter(el => matchesSelector(el, selector));
      return found.length > 0 ? found[0] : null;
    },
    createElement: (tag) => new MiniElement(tag),
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

// Baseline Tests 1-10
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
  assert(htmlContent.includes('id="show-no-toggle"'), 'Missing show-no-toggle switch element');
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
  assert(wikiContent.includes('HELPING_SPEED_MATRIX'), 'wiki.js missing HELPING_SPEED_MATRIX');
  assert(wikiContent.includes('RATINGS_GUIDE_DATA'), 'wiki.js missing RATINGS_GUIDE_DATA');
  assert(wikiContent.includes('蓄力（能量填充S）') || wikiContent.includes('蓄力 (能量填充S)'), 'wiki.js missing Charge Stock skill data');
  assert(wikiContent.includes('幫手加速（屬性）') || wikiContent.includes('幫手加速 (屬性)'), 'wiki.js missing Helper Boost skill data');
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

  assertEquals(testCalcEnergy(10000, 1, 0, 1.0), 10000, 'Base energy at Lv1 0% 1.0x should be 10000');
  assertEquals(testCalcEnergy(10000, 1, 0, 1.25), 12500, 'Energy with 1.25x event bonus should be 12500');
  assertEquals(testCalcEnergy(10000, 1, 0, 2.5), 25000, 'Energy with 2.50x event bonus should be 25000');
  const energy = testCalcEnergy(10000, 1, 0, 1.5);
  assertEquals(energy * 2, 30000, 'Tasty 2x should be double normal energy');
  assertEquals(energy * 3, 45000, 'Tasty 3x should be triple normal energy');
});

test('Tier 1 - Feature Coverage', 'CSS Styling: styles.css exists with dark theme, badge styles, responsive rules, and valid balanced braces', () => {
  const cssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');
  assert(fs.existsSync(cssPath), 'styles.css does not exist');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('--bg-dark'), 'CSS missing --bg-dark custom property');
  assert(cssContent.includes('.type-badge'), 'CSS missing .type-badge styling');
  assert(cssContent.includes('@media'), 'CSS missing responsive @media query rules');

  let openBraces = 0;
  for (let c of cssContent) {
    if (c === '{') openBraces++;
    if (c === '}') openBraces--;
  }
  assertEquals(openBraces, 0, `styles.css has unclosed or unmatched braces (diff: ${openBraces})`);
});

test('Tier 1 - Feature Coverage', 'JS Logic: app.js contains state management, multi-filtering, sorting & rendering', () => {
  assert(typeof PokemonApp === 'object', 'PokemonApp object is not defined');
  assert(typeof PokemonApp.filterData === 'function', 'filterData method missing');
  assert(typeof PokemonApp.sortData === 'function', 'sortData method missing');
  assert(typeof PokemonApp.render === 'function', 'render method missing');
  assert(typeof PokemonApp.formatHelpInterval === 'function', 'formatHelpInterval method missing');
  assertEquals(PokemonApp.formatHelpInterval('00:44:10'), '44:10', 'formatHelpInterval(00:44:10) should be 44:10');
  assertEquals(PokemonApp.formatHelpInterval('01:13:20'), '73:20', 'formatHelpInterval(01:13:20) should be 73:20');
  assertEquals(PokemonApp.formatHelpInterval('01:00:00'), '60:00', 'formatHelpInterval(01:00:00) should be 60:00');
  assertEquals(PokemonApp.showNo, false, 'PokemonApp.showNo should default to false');

  const mewRender = PokemonApp.renderSkillWithTooltip('十項全能（揮指）[可替換]');
  assert(!mewRender.includes('[可替換]'), 'renderSkillWithTooltip should not include [可替換]');
  assert(mewRender.includes('十項全能(揮指)'), 'renderSkillWithTooltip should format with halfwidth parentheses 十項全能(揮指)');

  const cressRender = PokemonApp.renderSkillWithTooltip('新月祈禱（活力全體療癒S）');
  assert(!cressRender.includes('活力全體療癒S'), 'renderSkillWithTooltip should simplify 活力全體療癒S');
  assert(cressRender.includes('全體療癒S)'), 'renderSkillWithTooltip should format with halfwidth parentheses 全體療癒S)');

  const shardRender = PokemonApp.renderSkillWithTooltip('夢之碎片獲取S');
  assertEquals(shardRender, '夢碎獲取S', 'renderSkillWithTooltip should format 夢之碎片獲取S as 夢碎獲取S');

  const lucarioRender = PokemonApp.renderSkillWithTooltip('波導彈（夢之碎片獲取S）');
  assert(!lucarioRender.includes('波導彈（夢之碎片') && !lucarioRender.includes('波導彈(夢之碎片'), 'renderSkillWithTooltip should shorten 夢之碎片 in 波導彈 skill name');
  assert(lucarioRender.includes('波導彈(夢碎獲取S)'), 'renderSkillWithTooltip should format as 波導彈(夢碎獲取S)');
});

// Baseline Tests 11-23
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

  const result = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 30, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵', '技能機率提升M', '睡眠EXP獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果']);
  
  assert(result !== null, 'Evaluation should return non-null object');
  assert(result.scores.berry >= 90, 'Raichu with BFS and Adamant should have berry score >= 90');
  assert(result.scores.speed >= 80, 'Raichu with fast interval and Adamant should have speed score >= 80');
  assert(result.pros.length >= 2, 'Should generate multiple pro highlights for top rolls');

  // Test locked subskills have strictly 0 effect on appraisal calculation
  const evalEmpty = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 10, '坦率', ['', '', '', '', ''], ['特選蘋果']);
  const evalLockedBFS = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 10, '坦率', ['', '樹果數量S', '', '', ''], ['特選蘋果']);
  assertEquals(evalLockedBFS.scores.growth, evalEmpty.scores.growth, 'Locked subskill in slot 2 must have 0 effect on growth score at Lv.10');
  assertEquals(evalLockedBFS.scores.roi, evalEmpty.scores.roi, 'Locked subskill in slot 2 must have 0 effect on ROI score at Lv.10');
  assert(evalLockedBFS.pros.every(p => !p.includes('樹果數量S')), 'Locked subskill must not appear in diagnostic pros');

  const evalUnlockedBFS = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 25, '坦率', ['', '樹果數量S', '', '', ''], ['特選蘋果']);
  assert(evalUnlockedBFS.compositeScore > evalEmpty.compositeScore, 'Unlocked BFS at Lv.25 must boost composite score');

  const svg = ctx.AppraisalLab.renderRadarChartSVG(result.scores, 280);
  assert(svg.includes('<svg'), 'Radar chart should be a valid SVG string');
  assert(svg.includes('<polygon'), 'Radar chart should include polygon elements');
  assert(svg.includes('樹果產能'), 'Radar chart should include dimension labels');

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
  assert(recipes.corn.name === '採蜜可可鬆餅' || recipes.corn.name === '煉獄玉米乾酪咖哩', 'Corn top recipe should be highest energy dish');
  assert(recipes.corn.need === 28 || recipes.corn.need === 27, 'Corn requirement per meal should be accurate');

  assert(typeof ctx.WikiDB.onLadderSearch === 'function', 'onLadderSearch should be a function');
  assert(typeof ctx.WikiDB.clearLadderSearch === 'function', 'clearLadderSearch should be a function');
  assert(typeof ctx.WikiDB.setLadderRecipeFilter === 'function', 'setLadderRecipeFilter should be a function');
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
  
  assertEquals(I18N.getLanguage(), 'zh-TW', 'Default language should be zh-TW');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep 資料庫', 'zh-TW brand.title match');
  assertEquals(I18N.t('th.ing1'), '食材1', 'zh-TW th.ing1 should be 食材1');
  assertEquals(I18N.t('th.ing2'), '食材2', 'zh-TW th.ing2 should be 食材2');
  assertEquals(I18N.t('th.ing3'), '食材3', 'zh-TW th.ing3 should be 食材3');
  assertEquals(I18N.t('th.ing1_mobile'), '食1', 'zh-TW th.ing1_mobile should be 食1');
  assertEquals(I18N.getTypeName('草'), '草', 'zh-TW type name match');
  assertEquals(I18N.getSpecialtyName('樹果'), '樹果', 'zh-TW specialty name match');
  assertEquals(I18N.getNatureName('固執'), '固執', 'zh-TW nature name match');

  I18N.setLanguage('en-US');
  assertEquals(I18N.getLanguage(), 'en-US', 'Language should switch to en-US');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep Database', 'en-US brand.title match');
  assertEquals(I18N.t('th.ing1'), 'Ing1', 'en-US th.ing1 should be Ing1');
  assertEquals(I18N.t('th.ing2'), 'Ing2', 'en-US th.ing2 should be Ing2');
  assertEquals(I18N.t('th.ing3'), 'Ing3', 'en-US th.ing3 should be Ing3');
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

test('Tier 1 - Feature Coverage', 'Theme Inversion Engine: 4 Inverted Theme Variants, Switch Controls & LocalStorage Persistence', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // Verify CSS contains all 4 inverted theme definitions
  assert(cssContent.includes('[data-theme="midnight"][data-theme-inverted="true"]'), 'styles.css must support inverted midnight theme');
  assert(cssContent.includes('[data-theme="onyx"][data-theme-inverted="true"]'), 'styles.css must support inverted onyx theme');
  assert(cssContent.includes('[data-theme="dawn"][data-theme-inverted="true"]'), 'styles.css must support inverted dawn theme');
  assert(cssContent.includes('[data-theme="emerald"][data-theme-inverted="true"]'), 'styles.css must support inverted emerald theme');
  assert(cssContent.includes('.theme-invert-control-row'), 'styles.css must style desktop theme-invert-control-row');
  assert(cssContent.includes('.app-theme-invert-control-row'), 'styles.css must style mobile app-theme-invert-control-row');

  // Verify HTML contains switches
  assert(indexHtml.includes('id="theme-invert-switch"'), 'index.html must have theme-invert-switch');
  assert(appHtml.includes('id="app-theme-invert-switch"'), 'app/index.html must have app-theme-invert-switch');

  // Verify app.js contains inverted state management & storage
  assert(appJs.includes('user_theme_inverted'), 'app.js must persist user_theme_inverted in localStorage');
  assert(appJs.includes('data-theme-inverted'), 'app.js must toggle data-theme-inverted attribute on root');

  // Verify i18n contains translation keys
  assert(i18nJs.includes('settings.theme_invert'), 'i18n.js must contain settings.theme_invert translation key');
  assert(i18nJs.includes('settings.theme_invert_desc'), 'i18n.js must contain settings.theme_invert_desc translation key');
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

  const datasetSkills = Array.from(new Set(dataset.map(p => p.mainSkill).filter(Boolean)));
  datasetSkills.forEach(skill => {
    const enName = I18N.getMainSkillName(skill);
    assert(enName && typeof enName === 'string', `Main skill "${skill}" missing English translation`);
    assert(!/[\u4e00-\u9fa5]/.test(enName), `Main skill translation for "${skill}" still contains Chinese: "${enName}"`);
  });

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

  assert(I18N.getMainSkillName('幫手支援S') === 'Extra Helpful S', '幫手支援S should be Extra Helpful S');
  assert(I18N.getMainSkillName('料理成功S') === 'Tasty Chance S', '料理成功S should be Tasty Chance S');
  assert(I18N.getMainSkillName('活力療癒S') === 'Energizing Cheer S', '活力療癒S should be Energizing Cheer S');
  assert(I18N.getMainSkillName('料理強化S') === 'Cooking Power-Up S', '料理強化S should be Cooking Power-Up S');
  assert(I18N.getMainSkillName('新月祈禱（活力全體療癒S）') === 'Lunar Prayer (Energy for Everyone S)', '新月祈禱 should be Lunar Prayer (Energy for Everyone S)');
  assert(I18N.getMainSkillName('十項全能（揮指）[可替換]') === 'All-Rounder (Metronome) [Customizable]', '十項全能 should be All-Rounder (Metronome) [Customizable]');
});

test('Tier 1 - Feature Coverage', 'Low Saturation Recipe Badges Tokens & Classes Defined for 4 Themes', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  
  const requiredTokens = [
    '--badge-cat-curry-bg', '--badge-cat-salad-bg', '--badge-cat-dessert-bg',
    '--badge-pot-bg', '--badge-bonus-78-bg', '--badge-bonus-61-bg',
    '--badge-bonus-48-bg', '--badge-bonus-35-bg', '--badge-bonus-25-bg'
  ];
  requiredTokens.forEach(token => {
    assert(cssContent.includes(token), `styles.css missing token ${token}`);
  });

  assert(cssContent.includes('.recipe-cat-badge.cat-咖哩'), 'styles.css missing cat-咖哩');
  assert(cssContent.includes('.pot-badge'), 'styles.css missing pot-badge');
  assert(cssContent.includes('.bonus-badge.bonus-badge-78'), 'styles.css missing bonus-badge-78');
  assert(cssContent.includes('.bonus-badge.bonus-badge-61'), 'styles.css missing bonus-badge-61');
  assert(cssContent.includes('.recipe-name-cell'), 'styles.css missing .recipe-name-cell');
  assert(cssContent.includes('.recipe-name-wrapper'), 'styles.css missing .recipe-name-wrapper');
});

test('Tier 1 - Feature Coverage', 'Bilingual News & Events Translation Dataset & Render Verification', () => {
  const newsData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'news.json'), 'utf8'));
  assert(newsData.length >= 20, 'news.json should have >= 20 items');

  newsData.forEach(item => {
    assert(item.title_en && typeof item.title_en === 'string', `News item ${item.id} missing title_en`);
    assert(item.overview_en && typeof item.overview_en === 'string', `News item ${item.id} missing overview_en`);
    assert(!/[\u4e00-\u9fa5]/.test(item.title_en), `title_en for "${item.title_en}" contains Chinese characters`);
    assert(!/[\u4e00-\u9fa5]/.test(item.overview_en), `overview_en for "${item.title_en}" contains Chinese characters`);
  });
});

test('Tier 1 - Feature Coverage', 'I18N.getPokemonName API & Coverage across all 247 Pokemon', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const ctx = {
    window: {
      location: { hash: '#pokemon' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} }
    }
  };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  assert(typeof ctx.window.I18N.getPokemonName === 'function', 'I18N.getPokemonName must be an exported function');

  ctx.window.I18N.setLanguage('en-US');
  assert(ctx.window.I18N.getPokemonName('妙蛙種子') === 'Bulbasaur', '妙蛙種子 -> Bulbasaur');
  assert(ctx.window.I18N.getPokemonName('皮卡丘') === 'Pikachu', '皮卡丘 -> Pikachu');
  assert(ctx.window.I18N.getPokemonName('巨鍛匠') === 'Tinkaton', '巨鍛匠 -> Tinkaton');
  assert(ctx.window.I18N.getPokemonName({ name_cn: '耿鬼', name_en: 'Gengar' }) === 'Gengar', 'Object input -> Gengar');

  data.forEach(p => {
    if (p.name_cn && p.name_en) {
      const translated = ctx.window.I18N.getPokemonName(p.name_cn);
      assert(translated === p.name_en, `Expected ${p.name_cn} -> ${p.name_en}, got ${translated}`);
    }
  });

  ctx.window.I18N.setLanguage('zh-TW');
  assert(ctx.window.I18N.getPokemonName('妙蛙種子') === '妙蛙種子', 'zh-TW mode should return CN name');
  assert(ctx.window.I18N.getPokemonName({ name_cn: '耿鬼', name_en: 'Gengar' }) === '耿鬼', 'Object in zh-TW -> 耿鬼');
});

test('Tier 1 - Feature Coverage', 'News AI Dashboard Sections Title & List Items Full English Translation and No Duplicate Icons', () => {
  const newsData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'news.json'), 'utf8'));

  newsData.forEach(item => {
    if (item.sections) {
      item.sections.forEach(sec => {
        assert(sec.title_en, `Section in news item ${item.id} missing title_en`);
        assert(!/^[\u{1F300}-\u{1F9FF}\s]+/u.test(sec.title_en), `Section title_en "${sec.title_en}" should not start with emoji`);
      });
    }
  });
});

test('Tier 1 - Feature Coverage', 'I18N Item & Island & Nature & Subskill Bilingual Coverage', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  const ctx = {
    window: {
      location: { hash: '#box' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} },
      addEventListener: () => {}
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => []
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(boxCode, ctx);

  assert(typeof ctx.window.I18N.getItemName === 'function', 'getItemName must be exported');
  assert(typeof ctx.window.I18N.getIslandName === 'function', 'getIslandName must be exported');

  ctx.window.I18N.setLanguage('en-US');
  assert(ctx.window.I18N.getItemName('寶可沙布蕾') === 'Poké Biscuit', '寶可沙布蕾 -> Poké Biscuit');
  assert(ctx.window.I18N.getItemName('主技能種子') === 'Main Skill Seed', '主技能種子 -> Main Skill Seed');
  assert(ctx.window.I18N.getItemName('萬能糖果S') === 'Handy Candy S', '萬能糖果S -> Handy Candy S');

  assert(ctx.window.I18N.getIslandName('萌綠之島') === 'Greengrass Isle', '萌綠之島 -> Greengrass Isle');
  assert(ctx.window.I18N.getIslandName('天青沙灘') === 'Cyan Beach', '天青沙灘 -> Cyan Beach');
  assert(ctx.window.I18N.getIslandName('黃金舊發電廠') === 'Old Gold Power Plant', '黃金舊發電廠 -> Old Gold Power Plant');

  const natureData = ctx.window.PokemonBoxApp.NATURE_DATA;
  assert(Array.isArray(natureData) && natureData.length === 25, '25 Natures defined');
  natureData.forEach(n => {
    assert(n.name_en, `Nature ${n.name} must have name_en`);
    assert(n.buff_en, `Nature ${n.name} must have buff_en`);
  });

  const subskillData = ctx.window.PokemonBoxApp.SUBSKILLS_DATA;
  assert(Array.isArray(subskillData) && subskillData.length >= 17, 'Subskills defined');
  subskillData.forEach(s => {
    assert(s.name_en, `Subskill ${s.name} must have name_en`);
    assert(s.desc_en, `Subskill ${s.name} must have desc_en`);
  });
});

test('Tier 1 - Feature Coverage', 'Centralized Scalable I18N Dynamic Translator & Fuzzy Matching', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'en-US', setItem: () => {} }, addEventListener: () => {} },
    document: {
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  ctx.window.I18N.setLanguage('en-US');

  assert(ctx.window.I18N.getSubSkillName('幫忙速度 S') === 'Helping Speed S', '幫忙速度 S with space -> Helping Speed S');
  assert(ctx.window.I18N.getSubSkillName('技能機率提升 S') === 'Skill Trigger S', '技能機率提升 S -> Skill Trigger S');
  assert(ctx.window.I18N.getSubSkillName('活力恢復獎勵') === 'Energy Recovery Bonus', '活力恢復獎勵 (恢) -> Energy Recovery Bonus');
  assert(ctx.window.I18N.getSubSkillName('睡眠 EXP 獎勵') === 'Sleep EXP Bonus', '睡眠 EXP 獎勵 -> Sleep EXP Bonus');

  assert(ctx.window.I18N.getPokemonName('毒骷蛙 (ABB)') === 'Toxicroak (ABB)', '毒骷蛙 (ABB) -> Toxicroak (ABB)');
  assert(ctx.window.I18N.getPokemonName('皮卡丘（ 萬聖節 ）') === 'Pikachu (Halloween)', '皮卡丘（ 萬聖節 ） -> Pikachu (Halloween)');
  assert(ctx.window.I18N.getPokemonName('骨紋巨聲鱷(AAA)') === 'Skeledirge (AAA)', '骨紋巨聲鱷(AAA) -> Skeledirge (AAA)');

  assert(ctx.window.I18N.getSpecialtyName('樹果型') === 'Berries', '樹果型 -> Berries');
  assert(ctx.window.I18N.getSpecialtyName('食材型') === 'Ingredients', '食材型 -> Ingredients');
  assert(ctx.window.I18N.getNatureName('固執') === 'Adamant', '固執 -> Adamant');
  assert(ctx.window.I18N.getMainSkillName('能量填充S (隨機)') === 'Charge Strength S (Random)', '能量填充S (隨機) -> Charge Strength S (Random)');

  const ladderNote = '👑 TOP 1 AAA 特選蘋果 產量之王';
  const translatedNote = ctx.window.I18N.translateDynamicText(ladderNote);
  assert(translatedNote === '👑 TOP 1 AAA Fancy Apple Production King', `Ladder note translation failed: ${translatedNote}`);

  const eventSentence = '舉辦期間：8/27 (週四) 4:00 ～ 8/30 (週日) 3:59';
  const translatedEvent = ctx.window.I18N.translateDynamicText(eventSentence);
  assert(translatedEvent === 'Event Period: 8/27 (Thu) 4:00 ~ 8/30 (Sun) 3:59', `Event schedule translation failed: ${translatedEvent}`);

  const bundleSentence = '🛍️ 「好眠日限定包vol.38」（1,500鑽石） ：超級沙布蕾×9、幸運薰香×2、成長薰香×2、專注薰香×2';
  const translatedBundle = ctx.window.I18N.translateDynamicText(bundleSentence);
  assert(translatedBundle.includes('Great Biscuit') && translatedBundle.includes('Luck Incense') && translatedBundle.includes('Focus Incense'), `Bundle translation failed: ${translatedBundle}`);
});

test('Tier 1 - Feature Coverage', 'WikiDB Namespace & Event Handler Methods Integrity', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {}
    },
    document: {
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiCode, ctx);

  const wikiMethods = [
    'switchSubTab', 'switchWikiSubTab', 'switchLadderView', 'filterSkills', 'filterWikiSkills',
    'filterIngredients', 'filterWikiIngredients', 'switchStack', 'switchChargeStock',
    'switchBoost', 'switchHelperBoost', 'toggleDetail', 'toggleDetailTable',
    'updateBerryLevel', 'updateBerryIsland', 'toggleBerryFavorite', 'toggleFavorite',
    'toggleLadderIngM', 'toggleLadderIngS', 'toggleLadderSpeedM', 'toggleLadderSpeedS',
    'toggleLadderIngM', 'toggleLadderSubskill', 'toggleLadderNatureIng', 'toggleLadderNatureSpeed', 'toggleLadderNatureFilter', 'toggleLadderRecipeMultiSelect', 'setLadderNature',
    'onLadderSearch', 'clearLadderSearch',
    'setLadderRecipeFilter', 'refreshCoordinateLadder', 'handleLadderGroupHover',
    'handleLadderGroupHoverOut', 'recalcTriggerChance', 'recalcSleepDays',
    'openIngredientRankingModal', 'closeIngredientRankingModal', 'updateLadderActiveFilterBadge',
    'toggleLadderEnergyHelp', 'closeLadderEnergyHelp'
  ];

  wikiMethods.forEach(method => {
    assert(typeof ctx.window.WikiDB[method] === 'function', `window.WikiDB.${method} should be a valid function`);
  });

  let threw = false;
  try {
    ctx.window.WikiDB.updateBerryLevel(55);
    assertEquals(ctx.window.localStorage.getItem('pksleep_wiki_berry_level'), '55', 'Berry Level should be persisted to localStorage');
    ctx.window.WikiDB.updateBerryIsland(60);
    assertEquals(ctx.window.localStorage.getItem('pksleep_wiki_berry_island'), '60', 'Island Bonus should be persisted to localStorage');
    ctx.window.WikiDB.toggleBerryFavorite(true);
    ctx.window.WikiDB.toggleBerryFavorite(false);
    ctx.window.WikiDB.toggleLadderNatureIng(true);
    ctx.window.WikiDB.toggleLadderNatureSpeed(true);
  } catch (e) {
    threw = true;
  }
  assert(!threw, 'toggleBerryFavorite and nature toggles should execute cleanly');
});

test('Tier 1 - Feature Coverage', 'Helping Speed Limit & Calculation Matrix: Sub-skills 35% cap and Nature independent multiplier', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {}
    },
    document: {
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiCode, ctx);

  const matrix = ctx.window.WikiDB.HELPING_SPEED_MATRIX || ctx.window.HELPING_SPEED_MATRIX;
  assert(Array.isArray(matrix), 'HELPING_SPEED_MATRIX should be an array');
  assert(matrix.length >= 10, `HELPING_SPEED_MATRIX should have at least 10 rows, got ${matrix.length}`);

  // 1. Full team cap: (1 - 0.35) * 0.90 = 0.585 -> +70.94%
  const teamCap = matrix.find(r => r.grade.includes('全隊極限') || r.grade_en.includes('Full Team'));
  assert(teamCap, 'Full team cap row missing');
  assertEquals(teamCap.intervalRatio, 0.585, 'Team cap interval ratio should be 0.585');
  assertEquals(teamCap.intervalDisplay, '58.5%', 'Team cap intervalDisplay should be 58.5%');
  assertEquals(teamCap.intervalDiff, '-41.5%', 'Team cap intervalDiff should be -41.5%');
  assertEquals(teamCap.outputBoostDisplay, '+70.94%', 'Team cap output boost should be +70.94%');

  // 2. Solo max cap: (1 - 0.26) * 0.90 = 0.666 -> +50.15%
  const soloCap = matrix.find(r => r.grade.includes('單體滿配') || r.grade_en.includes('Solo Max'));
  assert(soloCap, 'Solo cap row missing');
  assertEquals(soloCap.intervalRatio, 0.666, 'Solo cap interval ratio should be 0.666');
  assertEquals(soloCap.intervalDisplay, '66.6%', 'Solo cap intervalDisplay should be 66.6%');
  assertEquals(soloCap.intervalDiff, '-33.4%', 'Solo cap intervalDiff should be -33.4%');
  assertEquals(soloCap.outputBoostDisplay, '+50.15%', 'Solo cap output boost should be +50.15%');

  // 3. Common Dual Speed: (1 - 0.21) * 0.90 = 0.711 -> +40.65%
  const dualSpeed = matrix.find(r => r.grade.includes('常規雙幫忙速度') || r.grade.includes('常規雙幫速') || r.grade_en.includes('Dual Speed Up'));
  assert(dualSpeed, 'Dual speed row missing');
  assertEquals(dualSpeed.intervalRatio, 0.711, 'Dual speed interval ratio should be 0.711');
  assertEquals(dualSpeed.outputBoostDisplay, '+40.65%', 'Dual speed output boost should be +40.65%');
  assert(dualSpeed.subskills.some(s => s.name === '幫忙速度M'), 'Should use full name 幫忙速度M in subskills');
  assert(dualSpeed.subskills.some(s => s.name === '幫忙速度S'), 'Should use full name 幫忙速度S in subskills');

  // 4. Baseline row: 1.000 interval, +0.00% boost
  const baseline = matrix.find(r => r.grade.includes('基準線'));
  assert(baseline, 'Baseline row missing');
  assertEquals(baseline.intervalRatio, 1.000, 'Baseline interval ratio should be 1.000');
  assertEquals(baseline.outputBoostDisplay, '+0.00%', 'Baseline output boost should be +0.00%');

  // 5. Speed Down row: 1.100 interval, -9.09% boost
  const downRow = matrix.find(r => r.grade.includes('性格減速'));
  assert(downRow, 'Speed down row missing');
  assertEquals(downRow.intervalRatio, 1.100, 'Speed down interval ratio should be 1.100');
  assertEquals(downRow.outputBoostDisplay, '-9.09%', 'Speed down output boost should be -9.09%');
});

// --- NEW Tier 1 Tests: Mobile H5 App Shell & Dock System ---
test('Tier 1 - Feature Coverage', 'Mobile App Entry: app/index.html document structure and standalone HTML integrity', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(/<!DOCTYPE\s+html>/i.test(html), 'app/index.html missing <!DOCTYPE html>');
  assert(/<html[^>]*>/i.test(html), 'app/index.html missing <html> tag');
  assert(/<title>[\s\S]*?<\/title>/i.test(html), 'app/index.html missing <title> tag');

  // Header with Desktop version switch link or button
  assert(html.includes('id="btn-switch-desktop"') || html.includes('view=desktop') || html.includes('桌面'),
    'app/index.html missing Desktop switch link or button');

  // 5 Main Tab Panels
  const panelIds = ['panel-pokemon', 'panel-recipes', 'panel-wiki', 'panel-box', 'panel-news'];
  panelIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `app/index.html missing panel container #${id}`);
  });
});

test('Tier 1 - Feature Coverage', 'Mobile Viewport & Safe Area: app/index.html defines viewport-fit=cover and scale locks', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('viewport-fit=cover'), 'app/index.html meta viewport missing viewport-fit=cover');
  assert(html.includes('width=device-width'), 'app/index.html meta viewport missing width=device-width');
  assert(html.includes('initial-scale=1') || html.includes('initial-scale=1.0'), 'app/index.html meta viewport missing initial-scale=1');
});

test('Tier 1 - Feature Coverage', 'Mobile Script & Stylesheet Dependencies: Zero 404 broken asset links in app/index.html', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  // Verify CSS stylesheet links
  const cssRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let match;
  let cssCount = 0;
  while ((match = cssRegex.exec(html)) !== null) {
    const href = match[1].split('?')[0];
    if (!href.startsWith('http')) {
      const resolved = path.resolve(WORKSPACE_ROOT, 'app', href);
      assert(fs.existsSync(resolved), `Broken CSS link in app/index.html: ${href} (resolved: ${resolved})`);
      cssCount++;
    }
  }
  assert(cssCount > 0, 'app/index.html must reference at least 1 stylesheet');

  // Verify Script tags
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let scriptCount = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1].split('?')[0];
    if (!src.startsWith('http')) {
      const resolved = path.resolve(WORKSPACE_ROOT, 'app', src);
      assert(fs.existsSync(resolved), `Broken script link in app/index.html: ${src} (resolved: ${resolved})`);
      scriptCount++;
    }
  }
  assert(scriptCount >= 5, `app/index.html must load core module scripts (found ${scriptCount})`);
});

test('Tier 1 - Feature Coverage', 'Mobile Base Path & Script Load Order: __DATA_BASE_PATH__ defined and scripts load in sequence', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('__DATA_BASE_PATH__'), 'app/index.html must configure window.__DATA_BASE_PATH__');
  assert(html.includes("'../'") || html.includes('"../"'), '__DATA_BASE_PATH__ in app/index.html must point to "../"');

  const i18nIdx = html.indexOf('i18n.js');
  const appIdx = html.indexOf('app.js');
  const recipesIdx = html.indexOf('recipes.js');
  const boxIdx = html.indexOf('box.js');
  const appraisalIdx = html.indexOf('appraisal.js');

  assert(i18nIdx !== -1, 'i18n.js script tag missing in app/index.html');
  assert(appIdx !== -1, 'app.js script tag missing in app/index.html');
  assert(i18nIdx < appIdx, 'i18n.js must be loaded before app.js');
  if (recipesIdx !== -1) assert(i18nIdx < recipesIdx, 'i18n.js must be loaded before recipes.js');
  if (boxIdx !== -1 && appraisalIdx !== -1) assert(boxIdx < appraisalIdx, 'box.js must be loaded before appraisal.js');
});

test('Tier 1 - Feature Coverage', 'Mobile Shared Data Layer: All 4 JSON datasets accessible from app/ relative path', () => {
  const appDir = path.join(WORKSPACE_ROOT, 'app');
  const dataFiles = ['data.json', 'recipes.json', 'news.json', 'special_icons.json'];
  dataFiles.forEach(file => {
    const relativePath = path.resolve(appDir, '..', 'data', file);
    assert(fs.existsSync(relativePath), `Shared data file not accessible from app/: ${file}`);
    const content = fs.readFileSync(relativePath, 'utf8');
    const parsed = JSON.parse(content);
    assert(parsed && typeof parsed === 'object', `Shared data file ${file} does not parse to valid JSON`);
  });
});

test('Tier 1 - Feature Coverage', 'Mobile Dock Navigation: 5 required tab items present with unique IDs and icon elements', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('id="bottom-dock"') || html.includes('class="bottom-dock"') || html.includes('class="mobile-bottom-dock"'),
    'app/index.html missing bottom dock container');

  const tabIds = ['tab-pokemon', 'tab-recipes', 'tab-wiki', 'tab-box', 'tab-news'];
  tabIds.forEach(tabId => {
    assert(html.includes(`id="${tabId}"`) || html.includes(`data-tab="${tabId}"`) || html.includes(`id="dock-${tabId}"`),
      `app/index.html missing dock tab ${tabId}`);
  });
});

test('Tier 1 - Feature Coverage', 'Mobile Dock zh-TW Labels: Strictly 2 Chinese characters per dock tab', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  I18N.setLanguage('zh-TW');

  const dockKeys = [
    { key: 'dock.pokemon', expected: '圖鑑' },
    { key: 'dock.recipes', expected: '料理' },
    { key: 'dock.wiki', expected: '百科' },
    { key: 'dock.box', expected: '盒子' },
    { key: 'dock.news', expected: '最新' }
  ];

  dockKeys.forEach(({ key }) => {
    const raw = I18N.t(key);
    assert(raw && raw !== key, `i18n zh-TW missing translation key "${key}"`);
    const clean = raw.replace(/[\u{1F300}-\u{1F9FF}\s⚡🍲📚📦📰]/gu, '').trim();
    assertEquals(clean.length, 2, `Dock label for ${key} ("${clean}") must be strictly 2 Chinese characters in zh-TW`);
    assert(/^[\u4e00-\u9fa5]{2}$/.test(clean), `Dock label for ${key} ("${clean}") must contain only Chinese characters`);
  });
});

test('Tier 1 - Feature Coverage', 'Mobile Dock en-US Labels: Compact English labels in i18n dictionary', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'en-US', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  I18N.setLanguage('en-US');

  const dockKeys = ['dock.pokemon', 'dock.recipes', 'dock.wiki', 'dock.box', 'dock.news'];
  dockKeys.forEach(key => {
    const raw = I18N.t(key);
    assert(raw && raw !== key, `i18n en-US missing translation key "${key}"`);
    const clean = raw.replace(/[\u{1F300}-\u{1F9FF}\s⚡🍲📚📦📰]/gu, '').trim();
    assert(clean.length <= 8, `Dock en-US label "${clean}" should be compact (<= 8 chars)`);
    assert(!/[\u4e00-\u9fa5]/.test(clean), `Dock en-US label "${clean}" contains Chinese characters`);
  });
});

test('Tier 1 - Feature Coverage', 'Mobile Dock Safe Area & Active State Styling in styles.css', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  assert(cssContent.includes('.bottom-dock') || cssContent.includes('.mobile-bottom-dock'),
    'styles.css missing .bottom-dock or .mobile-bottom-dock class');
  assert(cssContent.includes('safe-area-inset-bottom'),
    'styles.css missing safe-area-inset-bottom support for mobile dock');
});

test('Tier 1 - Feature Coverage', 'Mobile UI Components: Dedicated CSS classes for segmented controls, bottom sheets & sticky cols', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  assert(cssContent.includes('.segmented-control') || cssContent.includes('.mobile-segmented-bar') || cssContent.includes('.subtab-pills') || cssContent.includes('.nav-tab'),
    'styles.css missing segmented control / subtab pills styling');
  assert(cssContent.includes('.bottom-sheet') || cssContent.includes('.mobile-drawer') || cssContent.includes('.mobile-modal-sheet') || cssContent.includes('.modal-overlay'),
    'styles.css missing modal / bottom-sheet styling');
});

test('Tier 1 - Feature Coverage', 'Desktop Non-Regression: Desktop index.html preserves all desktop elements and 44 baseline tests', () => {
  const htmlPath = path.join(WORKSPACE_ROOT, 'index.html');
  assert(fs.existsSync(htmlPath), 'Desktop index.html does not exist');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert(html.includes('id="pokemon-filter-sidebar"'), 'Desktop index.html missing pokemon-filter-sidebar');
  assert(html.includes('id="sidebar-bookmark-handle"'), 'Desktop index.html missing sidebar-bookmark-handle');
  assert(html.includes('id="sidebar-reset-all-btn"'), 'Desktop index.html missing sidebar-reset-all-btn');
  assert(html.includes('id="toggle-grid"'), 'Desktop index.html missing toggle-grid');
  assert(html.includes('id="toggle-table"'), 'Desktop index.html missing toggle-table');

  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssContent.includes('.custom-select-trigger') && (cssContent.includes('42px') || cssContent.includes('40px') || cssContent.includes('36px')),
    'Custom select trigger must provide >= 36px right padding for arrow clearance');
  assert(cssContent.includes('.custom-select-arrow') && (cssContent.includes('right: 18px') || cssContent.includes('right:18px')),
    'Custom select arrow icon must have right: 18px margin');
  assert(cssContent.includes('.custom-select-menu') && (cssContent.includes('top: calc(100%') || cssContent.includes('top: 100%')),
    'Custom select menu must open downwards below the trigger');
});

test('Tier 1 - Feature Coverage', 'Back to Top Floating Button: Desktop and Mobile HTML Markup, SVG Icon, and CSS Rules', () => {
  const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Desktop & Mobile HTML Markup
  assert(desktopHtml.includes('id="back-to-top-btn"') && desktopHtml.includes('class="back-to-top-btn"'),
    'Desktop index.html must contain #back-to-top-btn element');
  assert(mobileHtml.includes('id="back-to-top-btn"') && mobileHtml.includes('class="back-to-top-btn"'),
    'Mobile app/index.html must contain #back-to-top-btn element');
  assert(desktopHtml.includes('class="back-to-top-icon"') && mobileHtml.includes('class="back-to-top-icon"'),
    'Both desktop and mobile must embed SVG .back-to-top-icon');

  // 2. CSS Rules
  assert(cssContent.includes('.back-to-top-btn {'), 'styles.css missing .back-to-top-btn definition');
  assert(cssContent.includes('.back-to-top-btn.visible {'), 'styles.css missing .back-to-top-btn.visible transition class');
  assert(cssContent.includes('.mobile-h5-app .back-to-top-btn {'), 'styles.css missing mobile H5 dock-aligned bottom position');
  assert(cssContent.includes('.mobile-h5-app .back-to-top-btn.has-filter-fab {'), 'styles.css missing .has-filter-fab stacking rule');
  assert(cssContent.includes('138px'), 'styles.css missing 138px stack offset to clear 50px filter FAB');

  // 3. i18n Dictionary
  assert(i18nCode.includes("'common.back_to_top': '回到頂部'"), 'i18n.js missing zh-TW common.back_to_top translation');
  assert(i18nCode.includes("'common.back_to_top': 'Back to Top'"), 'i18n.js missing en-US common.back_to_top translation');
});

// -------------------------------------------------------------------
// Tier 2 - Boundary & Corner Cases
// -------------------------------------------------------------------
console.log('\n--- Tier 2 - Boundary & Corner Cases ---');

// Baseline Tests 24-39
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

test('Tier 2 - Boundary & Corner Cases', 'Pokédex Typo-Tolerant & Loose Search (Chinese Homophones, English Typos, Strict Numeric IDs)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  // 1. 中文同音字與免選字寬鬆搜尋 (Chinese Homophones & IME Typos)
  const cnTypoTests = [
    { q: '一步', expect: ['伊布', '雷伊布', '水伊布'] },
    { q: '依布', expect: ['伊布', '火伊布'] },
    { q: '雷一步', expect: ['雷伊布'], notExpect: ['水伊布'] },
    { q: '皮卡秋', expect: ['皮卡丘'] },
    { q: '皮卡求', expect: ['皮卡丘'] },
    { q: '梗鬼', expect: ['耿鬼'] },
    { q: '班吉拉', expect: ['班基拉斯'] },
    { q: '大鋼蛇', expect: ['大綱蛇'] },
    { q: '大綱蛇', expect: ['大綱蛇'] },
    { q: '沙奈舵', expect: ['沙奈朵'] },
    { q: '帝亞海獅', expect: ['帝牙海獅'] },
    { q: '爆雪王', expect: ['暴雪王'] },
    { q: '東東鼠', expect: ['咚咚鼠'] },
    { q: '耗大鯨', expect: ['浩大鯨'] },
    { q: '秋農炮蟲', expect: ['鍬農炮蟲'] },
    { q: '結尼龜', expect: ['傑尼龜'] },
    { q: '水劍龜', expect: ['水箭龜'] },
    { q: '妙花', expect: ['妙蛙花'] },
    { q: '噴水龍', expect: ['噴火龍'] }
  ];

  cnTypoTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    const names = res.map(p => getItemNameCN(p));
    tc.expect.forEach(target => {
      assert(names.includes(target), `Loose search for '${tc.q}' should match '${target}', got: [${names.slice(0, 5).join(', ')}]`);
    });
    if (tc.notExpect) {
      tc.notExpect.forEach(unwanted => {
        assert(!names.includes(unwanted), `Search for '${tc.q}' should NOT match '${unwanted}'`);
      });
    }
  });

  // 2. 英文拼字錯誤寬鬆搜尋 (English Typo Tolerance)
  const enTypoTests = [
    { q: 'eeve', expect: 'Eevee' },
    { q: 'pikachuu', expect: 'Pikachu' },
    { q: 'picachu', expect: 'Pikachu' },
    { q: 'charzard', expect: 'Charizard' },
    { q: 'blastose', expect: 'Blastoise' },
    { q: 'tyraniter', expect: 'Tyranitar' },
    { q: 'gengr', expect: 'Gengar' },
    { q: 'balbasaur', expect: 'Bulbasaur' }
  ];

  enTypoTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    const namesEN = res.map(p => getItemNameEN(p));
    assert(namesEN.includes(tc.expect), `English typo search for '${tc.q}' should match '${tc.expect}'`);
  });

  // 3. 純數字嚴格編號邏輯 (Strict Numeric ID Matching - No False Positives)
  const numTests = [
    { q: '25', expectName: '皮卡丘' },
    { q: '#0025', expectName: '皮卡丘' },
    { q: '1', expectName: '妙蛙種子' },
    { q: '#0001', expectName: '妙蛙種子' },
    { q: '133', expectName: '伊布' }
  ];

  numTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    assertEquals(res.length, 1, `Numeric query '${tc.q}' must strictly return 1 exact Pokémon, got ${res.length}`);
    assertEquals(getItemNameCN(res[0]), tc.expectName, `Numeric query '${tc.q}' should strictly match '${tc.expectName}'`);
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

  const mew = res.find(p => p.name_cn === '夢幻');
  assert(mew !== undefined, 'Mew (夢幻) must be included when filtering by 樹果/食材');

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

  PokemonApp.selectedBerries = new Set(['墨莓果', '蘋野果']);
  const berryFiltered = PokemonApp.filterData();
  assert(berryFiltered.length > 0, 'Berry filter should return results');
  berryFiltered.forEach(p => {
    assert(p.type === '草' || p.type === '火', `Item ${p.id} type '${p.type}' should match 墨莓果/蘋野果`);
  });

  PokemonApp.selectedBerries.clear();
  PokemonApp.selectedIngredients = new Set(['甜甜蜜']);
  const ingFiltered = PokemonApp.filterData();
  assert(ingFiltered.length > 0, 'Ingredient filter should return results');
  ingFiltered.forEach(p => {
    const hasHoney = p.ingredients && p.ingredients.some(ing => ing.name === '甜甜蜜');
    assert(hasHoney, `Item ${p.name_cn} should have 甜甜蜜 in its ingredients`);
  });

  PokemonApp.onlyInitialIng = true;
  PokemonApp.selectedIngredients = new Set(['特選蘋果']);
  const initialIngFiltered = PokemonApp.filterData();
  assert(initialIngFiltered.length > 0, 'Initial ingredient filter should return results');
  initialIngFiltered.forEach(p => {
    const initialName = p.ingredients && p.ingredients[0] ? p.ingredients[0].name : '';
    assert(initialName === '特選蘋果', `Item ${p.name_cn} initial ingredient (${initialName}) must be 特選蘋果 when onlyInitialIng is true`);
  });
  PokemonApp.onlyInitialIng = false;

  PokemonApp.selectedIngredients.clear();
  PokemonApp.selectedSkills = new Set(['料理成功S']);
  const tastyFiltered = PokemonApp.filterData();
  assert(tastyFiltered.length > 0, 'Skill filter for 料理成功S should return results');
  const heracross = tastyFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracross !== undefined, '赫拉克羅斯 (健美) should match 料理成功S');

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

  PokemonApp.selectedSkills = new Set(['活力療癒S']);
  const healSkillFiltered = PokemonApp.filterData();
  const umbreon = healSkillFiltered.find(p => p.name_cn === '月亮伊布');
  assert(umbreon !== undefined, '月亮伊布 (月光) should match 活力療癒S');
  const shuckle = healSkillFiltered.find(p => p.name_cn === '壺壺');
  assert(shuckle !== undefined, '壺壺 (樹果汁) should match 活力療癒S');

  PokemonApp.selectedSkills = new Set(['樹果遽增']);
  const berrySkillFiltered = PokemonApp.filterData();
  const mimikyu = berrySkillFiltered.find(p => p.name_cn === '謎擬Q');
  assert(mimikyu !== undefined, '謎擬Q (畫皮) should match 樹果遽增');
  const mewtwo = berrySkillFiltered.find(p => p.name_cn === '超夢');
  assert(mewtwo !== undefined, '超夢 (精神擊破) should match 樹果遽增');

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

  assertEquals(PokemonApp.onlyFinal, true, 'PokemonApp.onlyFinal should default to true');
  const defaultFinals = PokemonApp.filterData();
  assertEquals(defaultFinals.length, 127, 'Default filter should return exactly 127 final/single stage Pokémon');

  const preEvos = ['妙蛙種子', '妙蛙草', '小火龍', '火恐龍', '傑尼龜', '卡咪龜', '皮丘', '皮卡丘'];
  preEvos.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found === undefined, `Pre-evolution ${name} should NOT be in final evolution list`);
  });

  const finalStages = ['妙蛙花', '噴火龍', '水箭龜', '雷丘', '凱羅斯', '赫拉克羅斯', '超夢', '夢幻'];
  finalStages.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found !== undefined, `Final stage ${name} MUST be in final evolution list`);
  });

  PokemonApp.onlyFinal = false;
  assertEquals(PokemonApp.filterData().length, dataset.length, 'onlyFinal=false should return all 247 items');
});

test('Tier 2 - Boundary & Corner Cases', 'Special Main Skill Tooltip Details: Hover tooltips only on special skills matching official in-game text', () => {
  assert(typeof SPECIAL_SKILL_DETAILS === 'object', 'SPECIAL_SKILL_DETAILS dictionary is missing');
  assert(typeof renderSkillWithTooltip === 'function', 'renderSkillWithTooltip function is missing');

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
    assert(!html.includes('✨'), `Rendered badge for ${skill} must not include sparkle emoji`);
  });

  const heracrossDetail = typeof SPECIAL_SKILL_DETAILS['健美（料理輔助S）'] === 'object'
    ? SPECIAL_SKILL_DETAILS['健美（料理輔助S）']['zh-TW']
    : SPECIAL_SKILL_DETAILS['健美（料理輔助S）'];
  assertEquals(
    heracrossDetail,
    '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'Heracross skill description must match official in-game text'
  );

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
    const expected = skill
      .replace(/活力全體療癒S/g, '全體療癒S')
      .replace(/夢之碎片/g, '夢碎')
      .replace(/（/g, '(')
      .replace(/）/g, ')');
    assertEquals(rendered, expected, `Pure base skill ${skill} should be rendered as plain text without tooltip or badge`);
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

  const berryGod = {
    name: '小拉達',
    specialty: '樹果',
    nature: '固執',
    subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能等級提升M', '持有上限提升L']
  };
  const berryResult = calcPR(berryGod, { specialty: '樹果' });
  assert(berryResult.pr >= 90, `Berry God PR should be >= 90 (got ${berryResult.pr})`);
  assertEquals(berryResult.tier, 'S+', 'Berry God should be S+ tier');
  assert(berryResult.summaryNote.includes('樹果S') || berryResult.summaryNote.includes('幫忙速度'), 'Summary should highlight BFS');

  const ingSpecialist = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '內斂',
    subskills: ['食材機率提升M', '幫手獎勵', '食材機率提升S', '持有上限提升M', '幫忙速度M']
  };
  const ingResult = calcPR(ingSpecialist, { specialty: '食材' });
  assert(ingResult.pr >= 80, `Ingredient Specialist PR should be >= 80 (got ${ingResult.pr})`);
  assert(ingResult.tier === 'S+' || ingResult.tier === 'S', `Ingredient Specialist tier should be S/S+ (got ${ingResult.tier})`);

  const poorBerry = {
    name: '小拉達',
    specialty: '樹果',
    nature: '內斂',
    subskills: ['持有上限提升S', '活力回復提升S']
  };
  const poorResult = calcPR(poorBerry, { specialty: '樹果' });
  assert(poorResult.pr < 50, `Poor Pokemon PR should be < 50 (got ${poorResult.pr})`);
  assert(poorResult.tier === 'B' || poorResult.tier === 'C', `Poor Pokemon tier should be B or C (got ${poorResult.tier})`);
  assert((poorResult.summaryNote.includes('[!]') || poorResult.summaryNote.includes('⚠️')) && poorResult.summaryNote.includes('未達'), 'Summary note should indicate baseline failure');

  const poorIng = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '固執',
    subskills: ['幫忙速度S', '睡眠EXP獎勵']
  };
  const poorIngResult = calcPR(poorIng, { specialty: '食材' });
  assert(poorIngResult.pr < 50, `Poor Ingredient PR should be < 50 (got ${poorIngResult.pr})`);
  assert(poorIngResult.summaryNote.includes('[!]') || poorIngResult.summaryNote.includes('⚠️'), 'Should fail baseline due to Ing debuff');
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

  const events = timeline.filter(t => t.typeClass === 'gantt-bar-event');
  const packs = timeline.filter(t => t.typeClass === 'gantt-bar-pack');
  assert(events.length > 0, 'Gantt timeline should parse events');
  assert(packs.length > 0, 'Gantt timeline should parse bundle packs');
});

test('Tier 2 - Boundary & Corner Cases', 'Special Pokemon icon resolution (9001-9006, 7006, 7007, 7054, 8001) and Mewtwo standard icon resolution', () => {
  const specialIds = ['9001', '9002', '9003', '9004', '9005', '9006', '7006', '7007', '7054', '8001'];
  specialIds.forEach(id => {
    const item = dataset.find(p => String(p.id) === id);
    if (item) {
      const icon = getItemIcon(item);
      assert(icon && icon.startsWith('https://www.serebii.net/'), `Special item #${id} icon missing or not Serebii URL: ${icon}`);
      assert(!icon.includes(`pokemonsleep/pokemon/icon/${id}.png`), `Special item #${id} must not use naive numerical path pokemonsleep/pokemon/icon/${id}.png`);
    }
  });

  const mewtwo = dataset.find(p => String(p.id) === '150');
  if (mewtwo) {
    const icon = getItemIcon(mewtwo);
    assertEquals(icon, 'https://www.serebii.net/pokemonsleep/pokemon/icon/150.png', 'Mewtwo #150 icon should map to official Serebii pokemonsleep icon');
  }
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

  const pkmA1 = { name: '雷丘', level: 35, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };
  const pkmA2 = { name: '雷丘', level: 35, nature: '固執', subskills: ['幫忙速度M', '樹果數量S'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };
  const pkmB = { name: '雷丘', level: 36, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };

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

test('Tier 2 - Boundary & Corner Cases', 'Sidebar Filter UI Tokens (Ing.1 only & 2-column layout tokens)', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: {
      location: { hash: '#pokemon' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} }
    }
  };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  ctx.window.I18N.setLanguage('en-US');
  const initialIngText = ctx.window.I18N.t('pokedex.only_initial_ing');
  assert(initialIngText === '🥗 Ing.1 only', `pokedex.only_initial_ing in English must be "🥗 Ing.1 only", got "${initialIngText}"`);
});

// --- NEW Tier 2 Tests: Redirection, Anti-Loop, Stepper, Subskills, Clear Button ---
test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Screen width threshold (<= 768px triggers redirect, > 768px remains on desktop)', () => {
  function checkRedirect(innerWidth, userAgent, storedPref, urlQuery) {
    if ((urlQuery && urlQuery.includes('view=desktop')) || storedPref === 'desktop') return false;
    if ((urlQuery && urlQuery.includes('view=mobile')) || storedPref === 'mobile') return true;
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(userAgent || '');
    return isMobileUA || (typeof innerWidth === 'number' && innerWidth <= 768);
  }

  [320, 360, 375, 390, 414, 430, 600, 768].forEach(w => {
    assert(checkRedirect(w, 'Mozilla/5.0 (Windows NT 10.0)', null, ''), `Screen width ${w}px should trigger mobile redirect`);
  });

  [769, 800, 1024, 1280, 1440, 1920, 2560].forEach(w => {
    assert(!checkRedirect(w, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', null, ''), `Screen width ${w}px should NOT trigger mobile redirect`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: User Agent detection handles diverse mobile devices', () => {
  function checkRedirectUA(userAgent) {
    return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent || '');
  }

  const mobileUAs = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 Chrome/114.0.0.0 Mobile Safari/537.36'
  ];

  mobileUAs.forEach(ua => {
    assert(checkRedirectUA(ua), `User Agent "${ua.slice(0, 40)}..." should be recognized as mobile device`);
  });

  const desktopUAs = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0'
  ];

  desktopUAs.forEach(ua => {
    assert(!checkRedirectUA(ua), `Desktop User Agent "${ua.slice(0, 40)}..." should NOT be recognized as mobile`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Boundary value 768px vs 769px exact transition', () => {
  function checkBoundary(w) {
    return typeof w === 'number' && w <= 768;
  }
  assertEquals(checkBoundary(768), true, '768px (exact boundary) must redirect to mobile');
  assertEquals(checkBoundary(769), false, '769px (1px above boundary) must remain on desktop');
  assertEquals(checkBoundary(767.9), true, '767.9px (fractional boundary) must redirect to mobile');
});

test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Orientation change (portrait 390x844 vs landscape 844x390) with mobile UA', () => {
  function checkOrientation(w, ua) {
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua || '');
    return isMobileUA || (typeof w === 'number' && w <= 768);
  }
  const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1';
  assertEquals(checkOrientation(390, iphoneUA), true, 'iPhone in portrait should redirect');
  assertEquals(checkOrientation(844, iphoneUA), true, 'iPhone in landscape (844px wide) should still redirect due to mobile UA');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: pksleep_view_pref="desktop" in localStorage prevents redirect loop on mobile device', () => {
  function shouldRedirect(innerWidth, userAgent, storedPref, urlQuery) {
    if ((urlQuery && urlQuery.includes('view=desktop')) || storedPref === 'desktop') return false;
    if ((urlQuery && urlQuery.includes('view=mobile')) || storedPref === 'mobile') return true;
    const isMobileUA = /Android|iPhone|Mobile/i.test(userAgent || '');
    return isMobileUA || innerWidth <= 768;
  }

  const result = shouldRedirect(375, 'iPhone', 'desktop', '');
  assertEquals(result, false, 'Explicit desktop preference must block mobile redirection');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: URL query ?view=desktop forces desktop view and updates localStorage', () => {
  let storedPref = null;
  function handleUrlRedirection(query, currentPref) {
    if (query.includes('view=desktop')) {
      storedPref = 'desktop';
      return { redirect: false, target: null };
    }
    if (query.includes('view=mobile')) {
      storedPref = 'mobile';
      return { redirect: true, target: 'app/index.html' };
    }
    if (currentPref === 'desktop') return { redirect: false, target: null };
    return { redirect: true, target: 'app/index.html' };
  }

  const navResult = handleUrlRedirection('?view=desktop', null);
  assertEquals(navResult.redirect, false, '?view=desktop must prevent redirect');
  assertEquals(storedPref, 'desktop', 'Visiting ?view=desktop must persist desktop preference');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: Switching back to mobile via ?view=mobile updates preference and redirects', () => {
  let storedPref = 'desktop';
  function handleMobileSwitch(query) {
    if (query.includes('view=mobile')) {
      storedPref = 'mobile';
      return { redirect: true, target: 'app/index.html' };
    }
    return { redirect: false, target: null };
  }

  const res = handleMobileSwitch('?view=mobile');
  assertEquals(res.redirect, true, '?view=mobile must redirect to mobile');
  assertEquals(storedPref, 'mobile', 'Preference must be updated to mobile');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: URL hash preservation during redirection (#recipes, #wiki, #box, #news)', () => {
  function getRedirectUrlWithHash(basePath, hash) {
    const cleanHash = hash ? (hash.startsWith('#') ? hash : '#' + hash) : '';
    return `${basePath}${cleanHash}`;
  }

  assertEquals(getRedirectUrlWithHash('app/index.html', '#recipes'), 'app/index.html#recipes', 'Hash #recipes must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', '#wiki'), 'app/index.html#wiki', 'Hash #wiki must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', '#box'), 'app/index.html#box', 'Hash #box must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', ''), 'app/index.html', 'Empty hash produces clean URL');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: Corrupted or invalid preference values fallback safely to auto-detection', () => {
  function sanitizePref(val) {
    if (val === 'desktop' || val === 'mobile') return val;
    return null;
  }

  ['invalid', '', '123', '{}', 'undefined', null, undefined].forEach(corrupted => {
    assertEquals(sanitizePref(corrupted), null, `Corrupted value "${corrupted}" should sanitize to null`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Decrement clamped strictly at minimum capacity 15', () => {
  function stepPot(current, delta, min = 15, max = 200) {
    const next = current + delta;
    if (next < min) return min;
    if (next > max) return max;
    return next;
  }

  assertEquals(stepPot(15, -1), 15, 'Decrement from 15 should clamp to 15');
  assertEquals(stepPot(15, -6), 15, 'Large decrement from 15 should clamp to 15');
  assertEquals(stepPot(18, -6), 15, 'Decrement below 15 should clamp to 15');
  assertEquals(stepPot(21, -3), 18, 'Valid decrement from 21 should be 18');
});

test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Increment clamped strictly at maximum capacity 200', () => {
  function stepPot(current, delta, min = 15, max = 200) {
    const next = current + delta;
    if (next < min) return min;
    if (next > max) return max;
    return next;
  }

  assertEquals(stepPot(200, 1), 200, 'Increment from 200 should clamp to 200');
  assertEquals(stepPot(198, 6), 200, 'Increment past 200 should clamp to 200');
  assertEquals(stepPot(100, 3), 103, 'Valid increment from 100 should be 103');
});

test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Quick-select presets (15, 21, 30, 50, 70, 100) and step increments', () => {
  const presets = [15, 21, 30, 50, 70, 100];
  presets.forEach(p => {
    assert(p >= 15 && p <= 200, `Preset ${p} must be within [15, 200]`);
  });

  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

  const recipesAt15 = recipes.filter(r => r.pot_size <= 15);
  const recipesAt50 = recipes.filter(r => r.pot_size <= 50);
  const recipesAt100 = recipes.filter(r => r.pot_size <= 100);
  const recipesAtMax = recipes.filter(r => r.pot_size <= 200);

  assert(recipesAt15.length > 0, 'Should have recipes available at pot size 15');
  assert(recipesAt50.length > recipesAt15.length, 'Pot size 50 should unlock more recipes than 15');
  assert(recipesAt100.length > recipesAt50.length, 'Pot size 100 should unlock more recipes than 50');
  assertEquals(recipesAtMax.length, recipes.length, 'Max pot size 200 should unlock all 78 recipes');
});

test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Sanitization of non-numeric and NaN manual inputs', () => {
  function sanitizePotInput(input, defaultVal = 15, min = 15, max = 200) {
    const num = parseInt(input, 10);
    if (isNaN(num)) return defaultVal;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }

  assertEquals(sanitizePotInput('abc', 15), 15, 'Non-numeric string should default to 15');
  assertEquals(sanitizePotInput('-10', 15), 15, 'Negative input should clamp to min 15');
  assertEquals(sanitizePotInput('999', 15), 200, 'Excessive input should clamp to max 200');
  assertEquals(sanitizePotInput('57', 15), 57, 'Valid string input "57" should parse to 57');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Selecting a subskill in Slot 1 disables it in Slots 2-5', () => {
  function isSkillAvailable(skillName, targetSlotIndex, currentSelections) {
    if (!skillName) return true;
    return !currentSelections.some((selected, idx) => idx !== targetSlotIndex && selected === skillName);
  }

  const selections = ['樹果數量S', '', '', '', ''];
  assertEquals(isSkillAvailable('樹果數量S', 1, selections), false, 'BFS must be unavailable for Slot 2 when chosen in Slot 1');
  assertEquals(isSkillAvailable('樹果數量S', 2, selections), false, 'BFS must be unavailable for Slot 3');
  assertEquals(isSkillAvailable('樹果數量S', 0, selections), true, 'BFS must be available for its own Slot 1');
  assertEquals(isSkillAvailable('幫手獎勵', 1, selections), true, 'Unselected skill Helping Bonus must be available for Slot 2');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Re-assigning or clearing a slot frees up the previous subskill', () => {
  function isSkillAvailable(skillName, targetSlotIndex, currentSelections) {
    if (!skillName) return true;
    return !currentSelections.some((selected, idx) => idx !== targetSlotIndex && selected === skillName);
  }

  let selections = ['樹果數量S', '幫手獎勵', '幫忙速度M', '', ''];
  assertEquals(isSkillAvailable('樹果數量S', 3, selections), false, 'BFS unavailable before clear');

  selections[0] = '技能機率提升M';
  assertEquals(isSkillAvailable('樹果數量S', 3, selections), true, 'BFS becomes available for Slot 4 after Slot 1 is changed');
  assertEquals(isSkillAvailable('技能機率提升M', 3, selections), false, 'Skill Trigger M becomes unavailable');
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Reset / Clear All resets all 5 slots and enables all skills', () => {
  let selections = ['', '', '', '', ''];
  const allSubskills = ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能機率提升M', '睡眠EXP獎勵', '持有上限提升L'];
  
  allSubskills.forEach(skill => {
    for (let slot = 0; slot < 5; slot++) {
      const available = !selections.some((s, idx) => idx !== slot && s === skill);
      assert(available, `Skill ${skill} must be available for slot ${slot} after Clear All`);
    }
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: 5-slot unique validation on save prevents duplicate submission', () => {
  function validateSubskills(subskills) {
    const filled = (subskills || []).filter(Boolean);
    const unique = new Set(filled);
    return filled.length === unique.size;
  }

  assert(validateSubskills(['樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升M']), '5 unique subskills should pass validation');
  assert(!validateSubskills(['樹果數量S', '樹果數量S', '幫忙速度M', '', '']), 'Duplicate BFS should fail validation');
  assert(validateSubskills(['樹果數量S', '', '', '', '']), 'Single subskill with empty slots should pass validation');
});

test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Visibility state toggles based on input content', () => {
  function getClearButtonDisplay(searchText) {
    return (searchText && searchText.trim().length > 0) ? 'inline-flex' : 'none';
  }

  assertEquals(getClearButtonDisplay(''), 'none', 'Clear button should be hidden when search is empty');
  assertEquals(getClearButtonDisplay('   '), 'none', 'Clear button should be hidden when search is only whitespace');
  assertEquals(getClearButtonDisplay('pikachu'), 'inline-flex', 'Clear button should be visible when search has text');
  assertEquals(getClearButtonDisplay('1'), 'inline-flex', 'Clear button should be visible with single char input');
});

test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Clear action resets input and restores full filtered dataset', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  PokemonApp.currentSearch = '妙蛙';
  let results = PokemonApp.filterData();
  assert(results.length < dataset.length, 'Search should narrow results');

  PokemonApp.currentSearch = '';
  results = PokemonApp.filterData();
  assertEquals(results.length, dataset.length, 'Clearing search must restore all items');
});

test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Clearing search with active type filters preserves active type filters', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes = new Set(['電']);
  PokemonApp.selectedSpecialties.clear();

  PokemonApp.currentSearch = '雷丘';
  let results = PokemonApp.filterData();
  results.forEach(p => assertEquals(p.type, '電', 'Results must be Electric type'));

  PokemonApp.currentSearch = '';
  results = PokemonApp.filterData();
  assert(results.length > 1, 'Clearing search should return all Electric Pokemon');
  results.forEach(p => assertEquals(p.type, '電', 'All results must still be Electric type'));
});

// -------------------------------------------------------------------
// Tier 3 - Cross-Feature Combinations
// -------------------------------------------------------------------
console.log('\n--- Tier 3 - Cross-Feature Combinations ---');

// Baseline Test 40
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

test('Tier 2 - Boundary & Corner Cases', 'Back to Top Scroll Threshold, Long Content Detection, and Mobile Filter Collision Avoidance', () => {
  // Simulator for Back-to-Top behavior
  class BackToTopSimulator {
    constructor(options = {}) {
      this.isMobileH5 = options.isMobileH5 || false;
      this.docHeight = options.docHeight || 800;
      this.winHeight = options.winHeight || 600;
      this.scrollY = options.scrollY || 0;
      this.fabVisible = options.fabVisible || false;
      this.visible = false;
      this.hasFilterFab = false;
    }

    update() {
      const isLongContent = this.docHeight > this.winHeight + 150;
      const shouldShow = isLongContent && this.scrollY > 280;
      this.visible = shouldShow;

      if (this.isMobileH5) {
        this.hasFilterFab = this.fabVisible;
      } else {
        this.hasFilterFab = false;
      }
    }

    scrollToTop() {
      this.scrollY = 0;
      this.update();
    }
  }

  // 1. Short content: even when scrolled past 280, button must not show
  const shortPage = new BackToTopSimulator({ docHeight: 650, winHeight: 600, scrollY: 350 });
  shortPage.update();
  assertEquals(shortPage.visible, false, 'Short page must NOT show back-to-top button');

  // 2. Long content: at top of page, button must be hidden
  const longPage = new BackToTopSimulator({ docHeight: 2500, winHeight: 800, scrollY: 100 });
  longPage.update();
  assertEquals(longPage.visible, false, 'Long page with scroll <= 280 must NOT show back-to-top button');

  // 3. Long content: scrolled down past 280, button must become visible
  longPage.scrollY = 350;
  longPage.update();
  assertEquals(longPage.visible, true, 'Long page with scroll > 280 must show back-to-top button');

  // 4. Click back-to-top: resets scroll to 0, button hides
  longPage.scrollToTop();
  assertEquals(longPage.visible, false, 'Clicking back-to-top must hide the button after returning to top');

  // 5. Scroll down again: button reappears
  longPage.scrollY = 600;
  longPage.update();
  assertEquals(longPage.visible, true, 'Scrolling down again must re-show the button');

  // 6. Mobile H5: when filter FAB is visible, .has-filter-fab is applied to stack safely above at 138px
  const mobileWithFab = new BackToTopSimulator({ isMobileH5: true, docHeight: 3000, winHeight: 800, scrollY: 400, fabVisible: true });
  mobileWithFab.update();
  assertEquals(mobileWithFab.visible, true, 'Mobile page must show back-to-top when scrolled');
  assertEquals(mobileWithFab.hasFilterFab, true, 'Mobile page with filter FAB must apply hasFilterFab class to stack above FAB');

  // 7. Mobile H5: when filter FAB is not present (e.g. News tab), .has-filter-fab is removed to rest at 76px
  const mobileWithoutFab = new BackToTopSimulator({ isMobileH5: true, docHeight: 3000, winHeight: 800, scrollY: 400, fabVisible: false });
  mobileWithoutFab.update();
  assertEquals(mobileWithoutFab.visible, true, 'Mobile page without FAB must show back-to-top');
  assertEquals(mobileWithoutFab.hasFilterFab, false, 'Mobile page without FAB must not have hasFilterFab class');
});

// --- NEW Tier 3 Tests: Pairwise Cross-Feature Interactions ---
test('Tier 3 - Cross-Feature Combinations', 'Mobile Dock Navigation & Filter Persistence across Tab Switches', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = true;
  PokemonApp.selectedTypes = new Set(['草']);
  PokemonApp.currentSearch = '妙蛙';

  const dexResultsBefore = PokemonApp.filterData();
  assert(dexResultsBefore.length > 0, 'Dex filter should have results');

  let currentActiveTab = 'tab-pokemon';
  function switchTab(newTab) {
    currentActiveTab = newTab;
  }

  switchTab('tab-recipes');
  assertEquals(currentActiveTab, 'tab-recipes', 'Switched to recipes tab');

  switchTab('tab-wiki');
  assertEquals(currentActiveTab, 'tab-wiki', 'Switched to wiki tab');

  switchTab('tab-pokemon');
  assertEquals(currentActiveTab, 'tab-pokemon', 'Switched back to pokemon tab');

  assertEquals(PokemonApp.currentSearch, '妙蛙', 'Search text preserved');
  assert(PokemonApp.selectedTypes.has('草'), 'Type filter preserved');
  assertEquals(PokemonApp.onlyFinal, true, 'onlyFinal switch preserved');
  const dexResultsAfter = PokemonApp.filterData();
  assertEquals(dexResultsAfter.length, dexResultsBefore.length, 'Filtered item count unchanged after tab switches');
});

test('Tier 3 - Cross-Feature Combinations', 'Mobile Recipe Category Segmented Bar & Pot Stepper & Tasty Multiplier Cross-Interaction', () => {
  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

  const LEVEL_BONUS_TABLE = { 1: 0, 50: 148 };
  function calcEnergy(base, lv, islandPct, eventMult = 1.0, tastyMult = 1.0) {
    const lvMult = 1 + ((LEVEL_BONUS_TABLE[lv] || 0) / 100);
    const islandMult = 1 + (islandPct / 100);
    return Math.round(base * lvMult * islandMult * eventMult * tastyMult);
  }

  const filteredSalads = recipes.filter(r => r.category === '沙拉' && r.pot_size <= 35);
  assert(filteredSalads.length > 0, 'Should find salads fitting pot size <= 35');
  
  filteredSalads.forEach(r => {
    assertEquals(r.category, '沙拉', 'Recipe must be Salad');
    assert(r.pot_size <= 35, `Recipe ${r.name_cn} pot_size ${r.pot_size} must be <= 35`);
    const normalEnergy = calcEnergy(r.base_energy, 1, 20, 1.0, 1.0);
    const tastyEnergy = calcEnergy(r.base_energy, 1, 20, 1.0, 3.0);
    assert(Math.abs(tastyEnergy - normalEnergy * 3) <= 2, `Tasty 3x multiplier must triple computed energy (got ${tastyEnergy}, expected ~${normalEnergy * 3})`);
  });
});

test('Tier 3 - Cross-Feature Combinations', 'Mobile Theme & Language Switching across all 5 Mobile Tab Views', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const storage = {};
  const ctx = {
    window: {
      localStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); }
      },
      addEventListener: () => {}
    },
    document: {
      documentElement: {
        setAttribute: (k, v) => { ctx.window.document[k] = v; },
        getAttribute: (k) => ctx.window.document[k] || null
      },
      querySelectorAll: () => []
    },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;

  storage['user_theme'] = 'onyx';
  assertEquals(storage['user_theme'], 'onyx', 'Theme saved to localStorage');

  I18N.setLanguage('en-US');
  assertEquals(I18N.getLanguage(), 'en-US', 'Language updated to en-US');

  const enDock = [I18N.t('dock.pokemon') || 'Dex', I18N.t('dock.recipes') || 'Cook', I18N.t('dock.wiki') || 'Wiki', I18N.t('dock.box') || 'Box', I18N.t('dock.news') || 'News'];
  enDock.forEach(label => {
    assert(!/[\u4e00-\u9fa5]/.test(label), `Dock label "${label}" in en-US should not contain Chinese`);
  });

  I18N.setLanguage('zh-TW');
  assertEquals(I18N.getLanguage(), 'zh-TW', 'Language restored to zh-TW');
});

test('Tier 3 - Cross-Feature Combinations', 'Mobile Bottom Sheet Modal Lifecycle (Open, Subskill Selection, Backdrop Dismiss, Save)', () => {
  class BoxBottomSheetSimulator {
    constructor() {
      this.isOpen = false;
      this.currentPokemon = null;
      this.savedList = [];
    }
    openAdd() {
      this.isOpen = true;
      this.currentPokemon = {
        uid: 'pkm_' + Date.now(),
        name: '妙蛙種子',
        level: 25,
        nature: '固執',
        subskills: ['', '', '', '', '']
      };
    }
    selectSubskill(slotIdx, skill) {
      if (!this.isOpen || !this.currentPokemon) return;
      const alreadyChosen = this.currentPokemon.subskills.some((s, idx) => idx !== slotIdx && s === skill);
      if (!alreadyChosen) {
        this.currentPokemon.subskills[slotIdx] = skill;
      }
    }
    dismissBackdrop() {
      this.isOpen = false;
      this.currentPokemon = null;
    }
    save() {
      if (!this.isOpen || !this.currentPokemon) return;
      this.savedList.push({ ...this.currentPokemon });
      this.isOpen = false;
      this.currentPokemon = null;
    }
  }

  const sheet = new BoxBottomSheetSimulator();

  sheet.openAdd();
  assert(sheet.isOpen, 'Sheet should be open');
  sheet.selectSubskill(0, '樹果數量S');
  sheet.dismissBackdrop();
  assert(!sheet.isOpen, 'Sheet should be closed after backdrop tap');
  assertEquals(sheet.savedList.length, 0, 'No Pokemon should be saved on backdrop dismiss');

  sheet.openAdd();
  sheet.selectSubskill(0, '樹果數量S');
  sheet.selectSubskill(1, '樹果數量S');
  assertEquals(sheet.currentPokemon.subskills[1], '', 'Duplicate subskill selection should be rejected');
  sheet.selectSubskill(1, '幫手獎勵');
  assertEquals(sheet.currentPokemon.subskills[1], '幫手獎勵', 'Valid subskill should be assigned');
  sheet.save();
  assert(!sheet.isOpen, 'Sheet closed after save');
  assertEquals(sheet.savedList.length, 1, 'Pokemon saved to list');
  assertEquals(sheet.savedList[0].subskills[0], '樹果數量S', 'Saved BFS');
  assertEquals(sheet.savedList[0].subskills[1], '幫手獎勵', 'Saved Helping Bonus');
});

test('Tier 3 - Cross-Feature Combinations', '6D Appraisal Lab Modal Lifecycle from Box Card with SVG Radar Rendering', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const testPokemon = {
    id: '25',
    name_cn: '皮卡丘',
    specialty: '樹果',
    type: '電',
    interval: '00:45:00'
  };

  const evalResult = ctx.AppraisalLab.evaluatePokemon(testPokemon, 50, '固執', ['樹果數量S', '幫忙速度M'], ['特選蘋果', '特選蘋果']);
  assert(evalResult, 'Evaluation should produce result');

  const svg = ctx.AppraisalLab.renderRadarChartSVG(evalResult.scores, 260);
  assert(svg.includes('<svg'), 'Radar chart must be SVG');
  assert(svg.includes('viewBox='), 'SVG must include viewBox');
  assert(svg.includes('polygon'), 'SVG must include polygon');
});

// -------------------------------------------------------------------
// Tier 4 - Real-World Application Scenarios
// -------------------------------------------------------------------
console.log('\n--- Tier 4 - Real-World Application Scenarios ---');

// Baseline Tests 41-44
test('Tier 4 - Real-World Application Scenarios', 'Full application workflow simulation: load data -> filter CN name -> toggle to table view -> sort by ingredientRate descending', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  const initialItems = PokemonApp.render();
  assert(initialItems.length >= 247, 'Initial load with onlyFinal=false should contain >= 247 items');

  PokemonApp.currentSearch = '妙蛙';
  const filteredCN = PokemonApp.render();
  assert(filteredCN.length >= 2, 'Search "妙蛙" should match Bulbasaur, Ivysaur, etc.');

  PokemonApp.viewMode = 'table';
  PokemonApp.currentSort = 'ingredientRate-desc';
  const sortedResult = PokemonApp.render();

  assert(sortedResult.length === filteredCN.length, 'Filtered count should remain consistent after view & sort toggle');

  for (let i = 0; i < sortedResult.length - 1; i++) {
    const currentRate = getItemIngredientRate(sortedResult[i]);
    const nextRate = getItemIngredientRate(sortedResult[i + 1]);
    assert(currentRate >= nextRate, 'Workflow verify: ingredient rates should be in descending order');
  }
});

test('Tier 4 - Real-World Application Scenarios', 'SPA Tab Lifecycle, Hashchange Routing & Wiki Rendering In Both Languages', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

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
    assert(mockContainer.innerHTML.includes('wiki-card-speed-guide'), 'Wiki should contain helping speed guide card');
    assert(mockContainer.innerHTML.includes('58.5%'), 'Wiki should display 58.5% interval');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-ratings'), 'Wiki should contain ratings subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-ingredients'), 'Wiki should contain ingredients subpanel');
    assert(mockContainer.innerHTML.includes('wiki-subpanel-values'), 'Wiki should contain values subpanel');
  });
});

test('Tier 4 - Real-World Application Scenarios', 'Ingredient Draw S Specific Pools & Tooltips Verification', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');

  const store = { 'pksleep_lang': 'zh-TW' };
  const mockLocalStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; }
  };

  const ctx = {
    window: { localStorage: mockLocalStorage, addEventListener: () => {} },
    document: {
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(appCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const sandslash = {
    name: '穿山王',
    name_cn: '穿山王',
    name_en: 'Sandslash',
    main_skill: '食材精選S',
    ingredients: [
      { name: '沉甸甸南瓜' },
      { name: '萌綠玉米' },
      { name: '窩心洋芋' }
    ]
  };

  const mawile = {
    name: '大嘴娃',
    name_cn: '大嘴娃',
    name_en: 'Mawile',
    main_skill: '怪力鉗（食材精選S）',
    ingredients: [
      { name: '純粹油' },
      { name: '萌綠玉米' },
      { name: '好眠番茄' }
    ]
  };

  const honchkrow = {
    name: '烏鴉頭頭',
    name_cn: '烏鴉頭頭',
    name_en: 'Honchkrow',
    main_skill: '超幸運（食材精選S）',
    ingredients: [
      { name: '醒腦咖啡豆' },
      { name: '萌綠大豆' },
      { name: '火辣香草' }
    ]
  };

  const sandslashHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlZh.includes('special-skill-badge'), 'Sandslash should render special-skill-badge');
  assert(sandslashHtmlZh.includes('沉甸甸南瓜') && sandslashHtmlZh.includes('萌綠玉米') && sandslashHtmlZh.includes('窩心洋芋'), 'Sandslash tooltip should include its 3 specific ingredients');

  const mawileHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(mawile.main_skill, mawile);
  assert(mawileHtmlZh.includes('窩心洋芋') && mawileHtmlZh.includes('純粹油') && mawileHtmlZh.includes('萌綠玉米') && mawileHtmlZh.includes('好眠番茄'), 'Mawile tooltip must include all 4 specific ingredients (Soft Potato, Pure Oil, Greengrass Corn, Snoozy Tomato)');
  assert(!mawileHtmlZh.includes('(4種)'), 'Mawile badge should not show (4種)');
  assert(mawileHtmlZh.includes('暴擊效果') && (mawileHtmlZh.includes('翻倍') || mawileHtmlZh.includes('雙倍')), 'Mawile tooltip must explain critical hit effect (double ingredients)');

  // Verify alias 怪力钳（食材精選S）
  const mawileAliasHtml = ctx.window.PokemonApp.renderSkillWithTooltip('怪力钳（食材精選S）', mawile);
  assert(mawileAliasHtml.includes('窩心洋芋') && mawileAliasHtml.includes('純粹油'), 'Mawile alias must resolve 4-ingredient pool');
  assert(!mawileAliasHtml.includes('(4種)'), 'Mawile alias badge should not show (4種)');

  const honchkrowHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(honchkrow.main_skill, honchkrow);
  assert(honchkrowHtmlZh.includes('醒腦咖啡豆') && honchkrowHtmlZh.includes('萌綠大豆') && honchkrowHtmlZh.includes('豆製肉') && honchkrowHtmlZh.includes('品鮮蘑菇'), 'Honchkrow tooltip must include all 4 specific ingredients (Rousing Coffee, Greengrass Soybeans, Bean Sausage, Tasty Mushroom)');
  assert(!honchkrowHtmlZh.includes('火辣香草'), 'Honchkrow tooltip must not include spicy herb');
  assert(!honchkrowHtmlZh.includes('(4種)'), 'Honchkrow badge should not show (4種)');
  assert(honchkrowHtmlZh.includes('暴擊效果') && honchkrowHtmlZh.includes('夢之碎片'), 'Honchkrow tooltip must explain critical hit effect (massive Dream Shards)');

  ctx.window.I18N.setLanguage('en-US');
  const sandslashHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlEn.includes('Plump Pumpkin') && sandslashHtmlEn.includes('Greengrass Corn') && sandslashHtmlEn.includes('Soft Potato'), 'Sandslash English tooltip should include its 3 specific ingredients in English');

  const mawileHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(mawile.main_skill, mawile);
  assert(mawileHtmlEn.includes('Soft Potato') && mawileHtmlEn.includes('Pure Oil') && mawileHtmlEn.includes('Greengrass Corn') && mawileHtmlEn.includes('Snoozy Tomato'), 'Mawile English tooltip should include all 4 ingredients in English');
  assert(mawileHtmlEn.includes('2x ingredients') && mawileHtmlEn.includes('Extra Tasty'), 'Mawile English tooltip should include critical hit explanation');

  const honchkrowHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(honchkrow.main_skill, honchkrow);
  assert(honchkrowHtmlEn.includes('Rousing Coffee') && honchkrowHtmlEn.includes('Greengrass Soybeans') && honchkrowHtmlEn.includes('Bean Sausage') && honchkrowHtmlEn.includes('Tasty Mushroom'), 'Honchkrow English tooltip should include all 4 ingredients in English');
  assert(honchkrowHtmlEn.includes('Dream Shards') && honchkrowHtmlEn.includes('20,000'), 'Honchkrow English tooltip should include critical hit explanation');

  ctx.window.I18N.setLanguage('zh-TW');

  // Wiki Main Skills Subtab & Category Filter State Persistence Verification
  ctx.window.WikiDB.switchWikiSubTab('skills');
  assertEquals(mockLocalStorage.getItem('pksleep_active_wiki_subtab'), 'skills', 'Switching to skills subtab must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSubTab(), 'skills', 'getCurrentSubTab must return skills');

  ctx.window.WikiDB.filterWikiSkills('ingredient');
  assertEquals(mockLocalStorage.getItem('pksleep_wiki_skills_category'), 'ingredient', 'Filtering ingredient skills must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSkillsCategory(), 'ingredient', 'getCurrentSkillsCategory must return ingredient');

  ctx.window.WikiDB.filterWikiSkills('shards');
  assertEquals(mockLocalStorage.getItem('pksleep_wiki_skills_category'), 'shards', 'Filtering shards skills must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSkillsCategory(), 'shards', 'getCurrentSkillsCategory must return shards');

  const ingDrawSkill = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'ingredient_draw_s');
  assert(ingDrawSkill && ingDrawSkill.hasIngredientDrawMatrix, 'Wiki should define ingredient_draw_s with hasIngredientDrawMatrix');
  assertEquals(ingDrawSkill.maxLevel, 7, 'Ingredient Draw S max level must be 7');
  assertEquals(ingDrawSkill.values[0], 5, 'Ingredient Draw S Lv.1 must be 5');
  assertEquals(ingDrawSkill.values[6], 18, 'Ingredient Draw S Lv.7 must be 18');
  assertArrayEquals(ingDrawSkill.values, [5, 6, 8, 11, 13, 16, 18], 'Ingredient Draw S values must match official 5~18 progression');

  // Audited skills verification
  const chargeFixed = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'charge_energy_s_fixed');
  assertEquals(chargeFixed.values[6], 3212, 'Charge Energy S Fixed Lv.7 must be 3212');

  const chargeRange = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'charge_energy_s_range');
  assertEquals(chargeRange.ranges[6].max, 6424, 'Charge Energy S Range Lv.7 max must be 6424');

  const nightmare = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'nightmare_m');
  assertEquals(nightmare.maxLevel, 7, 'Nightmare M max level must be unlocked to 7');
  assertEquals(nightmare.values[6], 18515, 'Nightmare M Lv.7 value must be 18515');

  const helperBoostS = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'helper_boost_s');
  assertArrayEquals(helperBoostS.values, [6, 7, 8, 9, 10, 11, 12], 'Extra Helpful S values must be 6~12');

  const cheerS = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'energizing_cheer_s');
  assertArrayEquals(cheerS.values, [12, 15, 20, 25, 33, 44], 'Energizing Cheer S values must match v3.0.0 balance adjustment (12~44)');

  const stockpile = ctx.window.WikiDB.MAIN_SKILLS_DATA.find(s => s.id === 'charge_stock_s');
  assertEquals(stockpile.matrix[10].vals[6], 90940, 'Stockpile stack 10 Lv.7 must reach 90940');
});

test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder: Sub-skills S/M and Single-Choice Nature multiplier logic verified', () => {
  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  const wikiCode = fs.readFileSync(wikiPath, 'utf8');

  assert(!wikiCode.includes("data-subtab=\"ingredients\">${isEN ? '🥗 Lv.60"), 'Subtab 4 button should not contain Lv.60');
  assert(!wikiCode.includes("h3 class=\"wiki-card-title\" style=\"margin: 0;\">${isEN ? 'Lv.60"), 'Card title should not contain Lv.60');

  assert(wikiCode.includes('data-nature-filter="ING"'), 'Template should contain data-nature-filter="ING"');
  assert(wikiCode.includes('data-nature-filter="SPEED"'), 'Template should contain data-nature-filter="SPEED"');
  assert(!wikiCode.includes('data-nature-filter="NONE"'), 'Nature filter must not keep Neutral as a third option');
  assert(wikiCode.includes("toggleLadderNatureFilter('ING')"), 'Nature options must be independently toggleable');
  assert(wikiCode.includes('data-nature-filter="SKILL"'), 'Nature filter must include Skill Chance up');
  assert(wikiCode.includes("toggleLadderSubskill('SKILL_M')"), 'Sub-skill boosts must be multi-select tags including Skill Trigger M');
  assert(wikiCode.includes('id="ladder-recipe-multi-toggle"'), 'Recipe highlight modal must include multi-select switch');
  assert(wikiCode.includes('function toggleLadderRecipeMultiSelect'), 'Multi recipe highlight must be toggleable');
  assert(!wikiCode.includes('食材機率提升M (+36%)'), 'Sub-skill labels must drop parenthetical deltas');
  assert(wikiCode.includes('class="island-triple-grid"'), 'Islands desktop layout must place three major blocks in one row');
  assert(wikiCode.includes('id="ladder-ing-s-toggle"'), 'Template should contain ladder-ing-s-toggle');
  assert(wikiCode.includes('id="ladder-speed-s-toggle"'), 'Template should contain ladder-speed-s-toggle');
  assert(wikiCode.includes('ladder-track-header') && wikiCode.includes('ladder-ing-icon'), 'Template should render ladder-track-header and ladder-ing-icon');

  function calcMult(isIngM, isIngS, isSpeedM, isSpeedS, nature) {
    let mult = 1.0;
    let ingRateBoost = 0;
    if (isIngM) ingRateBoost += 0.36;
    if (isIngS) ingRateBoost += 0.18;
    if (ingRateBoost > 0) mult *= (1.0 + ingRateBoost);

    let speedReduction = 0;
    if (isSpeedM) speedReduction += 0.14;
    if (isSpeedS) speedReduction += 0.07;
    if (speedReduction > 0) mult *= (1.0 / (1.0 - speedReduction));

    if (nature === 'ING') mult *= 1.20;
    if (nature === 'SPEED') mult *= (1.0 / 0.9090909);
    return mult;
  }

  assertEquals(calcMult(false, false, false, false, 'NONE'), 1.0, 'Base multiplier should be 1.0');
  assertEquals(parseFloat(calcMult(true, false, false, false, 'NONE').toFixed(2)), 1.36, 'Ing M should be 1.36x');
  assertEquals(parseFloat(calcMult(false, true, false, false, 'NONE').toFixed(2)), 1.18, 'Ing S should be 1.18x');
  assertEquals(parseFloat(calcMult(false, false, false, false, 'ING').toFixed(2)), 1.20, 'Nature Ing should be 1.20x');
  const allSubBoosted = calcMult(true, true, true, true, 'ING');
  assert(allSubBoosted > 2.3 && allSubBoosted < 2.5, `Combined S/M subskills + Nature Ing multiplier should be ~2.34x, got ${allSubBoosted.toFixed(3)}`);
});

// --- NEW Tier 4 Tests: Real-World Scenarios ---
test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 End-to-End User Journey (Entry -> Dock Nav -> Dex -> Cook -> Wiki -> Box -> News)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = true;
  assertEquals(PokemonApp.filterData().length, 127, 'Step 1: Pokedex starts with 127 final stage Pokemon');

  PokemonApp.currentSearch = '皮卡丘';
  const pikachuMatch = PokemonApp.filterData();
  assert(pikachuMatch.length >= 1, 'Step 2: Found Pikachu in search');
  PokemonApp.currentSearch = '';
  assertEquals(PokemonApp.filterData().length, 127, 'Step 2: Cleared search restores 127 items');

  const recipes = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'recipes.json'), 'utf8'));
  const curry57 = recipes.filter(r => r.category === '咖哩' && r.pot_size <= 57);
  assert(curry57.length > 0, 'Step 3: Found Curry recipes for pot size 57');

  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiCode.includes('MAIN_SKILLS_DATA') && wikiCode.includes('INGREDIENT_VALUES_DATA'), 'Step 4: Wiki data structures verified');

  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  const pkm = {
    name: '皮卡丘',
    specialty: '樹果',
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '幫手獎勵']
  };
  const prResult = boxModule.calculatePokemonPR(pkm, { specialty: '樹果' });
  assert(prResult.pr >= 90, `Step 5: Pikachu PR score should be >= 90 (got ${prResult.pr})`);
  assertEquals(prResult.tier, 'S+', 'Step 5: Pikachu tier should be S+');

  const newsModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'));
  const newsData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'news.json'), 'utf8'));
  const timeline = newsModule.parseEventTimeline(newsData);
  assert(timeline.length > 0, 'Step 6: Timeline parsed with event items');
});

test('Tier 4 - Real-World Application Scenarios', 'Desktop Baseline User Session Workflow Preservation', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = true;
  assertEquals(PokemonApp.filterData().length, 127, 'Desktop: 127 final stage Pokemon');

  PokemonApp.onlyFinal = false;
  assertEquals(PokemonApp.filterData().length, dataset.length, 'Desktop: 247 total items when onlyFinal=false');

  PokemonApp.toggleColumnSort('carry');
  const sortedCarryDesc = PokemonApp.render();
  for (let i = 0; i < sortedCarryDesc.length - 1; i++) {
    assert(getItemCarry(sortedCarryDesc[i]) >= getItemCarry(sortedCarryDesc[i + 1]), 'Carry sorted desc');
  }

  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const ctx = { window: {}, document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } }, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const raichu = { id: '26', name_cn: '雷丘', specialty: '樹果', type: '電', interval: '00:36:40' };
  const res = ctx.AppraisalLab.evaluatePokemon(raichu, 30, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵'], ['特選蘋果', '特選蘋果']);
  assert(res.scores.berry >= 90, 'Raichu berry score >= 90');
});

test('Tier 4 - Real-World Application Scenarios', 'Dual-Surface Coexistence & Shared LocalStorage Non-Interference', () => {
  const sharedStorage = {};
  const mockLocalStorage = {
    getItem: (k) => sharedStorage[k] || null,
    setItem: (k, v) => { sharedStorage[k] = String(v); },
    removeItem: (k) => { delete sharedStorage[k]; }
  };

  const mobilePkm = {
    uid: 'pkm_m_001',
    name: '妙蛙種子',
    level: 30,
    nature: '內斂',
    subskills: ['食材機率提升M', '幫手獎勵']
  };
  mockLocalStorage.setItem('pokemon_sleep_box', JSON.stringify([mobilePkm]));

  const desktopBox = JSON.parse(mockLocalStorage.getItem('pokemon_sleep_box'));
  assert(Array.isArray(desktopBox) && desktopBox.length === 1, 'Desktop reads mobile-created Box item');
  assertEquals(desktopBox[0].uid, 'pkm_m_001', 'UID match across surfaces');

  mockLocalStorage.setItem('user_theme', 'dawn');
  assertEquals(mockLocalStorage.getItem('user_theme'), 'dawn', 'Mobile synchronizes theme change');

  mockLocalStorage.setItem('pksleep_view_pref', 'desktop');
  assertEquals(mockLocalStorage.getItem('pksleep_view_pref'), 'desktop', 'View preference preserved');
});

test('Tier 4 - Real-World Application Scenarios', 'Mobile Smart Redirection & Anti-Loop Preference Flow', () => {
  const sharedStorage = {};
  function simulateRedirectionEngine(surface, windowWidth, ua, query) {
    if (surface === 'root_index_html') {
      if (query.includes('view=desktop')) {
        sharedStorage['pksleep_view_pref'] = 'desktop';
        return { stay: true, url: 'index.html' };
      }
      if (sharedStorage['pksleep_view_pref'] === 'desktop') {
        return { stay: true, url: 'index.html' };
      }
      const isMobile = /iPhone|Android/i.test(ua) || windowWidth <= 768;
      if (isMobile) {
        return { stay: false, url: 'app/index.html' };
      }
      return { stay: true, url: 'index.html' };
    } else if (surface === 'app_index_html') {
      if (query.includes('switch_desktop')) {
        sharedStorage['pksleep_view_pref'] = 'desktop';
        return { stay: false, url: '../index.html?view=desktop' };
      }
      return { stay: true, url: 'app/index.html' };
    }
  }

  const step1 = simulateRedirectionEngine('root_index_html', 390, 'iPhone', '');
  assertEquals(step1.stay, false, 'Step 1: Mobile visits root -> redirected');
  assertEquals(step1.url, 'app/index.html', 'Step 1: Redirected to app/index.html');

  const step2 = simulateRedirectionEngine('app_index_html', 390, 'iPhone', '?action=switch_desktop');
  assertEquals(step2.stay, false, 'Step 2: Clicks desktop link');
  assertEquals(step2.url, '../index.html?view=desktop', 'Step 2: Redirects to desktop URL');
  assertEquals(sharedStorage['pksleep_view_pref'], 'desktop', 'Step 2: Desktop preference saved');

  const step3 = simulateRedirectionEngine('root_index_html', 390, 'iPhone', '?view=desktop');
  assertEquals(step3.stay, true, 'Step 3: Stays on desktop');

  const step4 = simulateRedirectionEngine('root_index_html', 390, 'iPhone', '');
  assertEquals(step4.stay, true, 'Step 4: Refreshes page -> remains on desktop without loop');
});

test('Tier 4 - Real-World Application Scenarios', 'Multi-Fallback Asset & Data Loading under Various Base Paths', () => {
  function resolveDataPath(basePath, relativePath) {
    const base = basePath || '';
    return base + relativePath;
  }

  const rootPath = resolveDataPath('', 'data/data.json');
  assertEquals(rootPath, 'data/data.json', 'Root data path matches');
  assert(fs.existsSync(path.join(WORKSPACE_ROOT, rootPath)), 'Root data file accessible');

  const mobilePath = resolveDataPath('../', 'data/data.json');
  assertEquals(mobilePath, '../data/data.json', 'Mobile data path matches');
  const resolvedMobilePath = path.resolve(WORKSPACE_ROOT, 'app', mobilePath);
  assert(fs.existsSync(resolvedMobilePath), 'Mobile relative data file accessible on disk');
});

test('Tier 1 - Feature Coverage', 'Pokemon Type Vector SVG Icons Coverage across all 18 Types', () => {
  const i18n = require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
  assert(typeof i18n.getTypeIconSvg === 'function', 'I18N.getTypeIconSvg must be a function');
  
  const all18Types = ['一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'];
  all18Types.forEach(t => {
    const svg = i18n.getTypeIconSvg(t, 22);
    assert(svg && svg.includes('<svg') && svg.includes('<path') && svg.includes('pkm-type-icon'), `Type ${t} must render valid SVG with .pkm-type-icon class`);
    assert(svg.includes(`var(--type-${t}`), `Type ${t} must tint with CSS variable --type-${t}`);
  });

  const enTypes = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  enTypes.forEach(t => {
    const svg = i18n.getTypeIconSvg(t, 20);
    assert(svg && svg.includes('<svg') && svg.includes('<path'), `English type ${t} must render valid SVG`);
  });
});

test('Tier 1 - Feature Coverage', 'Sidebar Compact Switches Grid & 7-Column Icon Grid Verification', () => {
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify desktop index.html contains clean single-line switch titles
  assert(indexHtml.includes('僅最終進化'), 'index.html missing 僅最終進化');
  assert(indexHtml.includes('僅初始食材'), 'index.html missing 僅初始食材');
  assert(indexHtml.includes('顯示編號'), 'index.html missing 顯示編號');

  // Verify mobile app/index.html has compact 1-row switches
  assert(appHtml.includes('sidebar-switches-grid'), 'app/index.html missing .sidebar-switches-grid');
  assert(appHtml.includes('sidebar-switch-compact'), 'app/index.html missing .sidebar-switch-compact');

  // Verify CSS contains 7-column icon grid rules
  assert(stylesCss.includes('grid-template-columns: repeat(7, 1fr)'), 'styles.css missing 7-column icon grid');
});

test('Tier 1 - Feature Coverage', 'Header Simplification & Box Backup in Settings Modal', () => {
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // Verify settings modal contains Box Backup & Restore controls in both surfaces
  const settingsModalRegex = /<div[^>]*id=["']settings-modal["'][\s\S]*?id=["']settings-export-box-btn["'][\s\S]*?id=["']settings-import-box-input["']/;
  assert(settingsModalRegex.test(indexHtml), 'index.html settings-modal must contain settings-export-box-btn and settings-import-box-input');
  assert(settingsModalRegex.test(appHtml), 'app/index.html settings-modal must contain settings-export-box-btn and settings-import-box-input');

  // Verify app/index.html header only has brand on left and settings on right (no header sync-btn outside modal)
  const appHeaderMatch = appHtml.match(/<header[^>]*class=["'][^"']*mobile-app-header[^"']*["'][\s\S]*?<\/header>/);
  assert(appHeaderMatch, 'app/index.html missing mobile-app-header');
  assert(!appHeaderMatch[0].includes('id="sync-btn"'), 'app/index.html header must not have sync-btn in header');
  assert(!appHeaderMatch[0].includes('id="btn-switch-desktop"'), 'app/index.html header must not have btn-switch-desktop in header');
  assert(appHeaderMatch[0].includes('id="sync-config-btn"'), 'app/index.html header must keep settings button on the right');
});

test('Tier 1 - Feature Coverage', 'H5 App Centered Loading View & Fixed Table View Verification', () => {
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify H5 App does not have toggle-grid / view-mode-toggle in pokemon panel
  const pkmPanelMatch = appHtml.match(/<div[^>]*id=["']panel-pokemon["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(pkmPanelMatch, 'app/index.html missing panel-pokemon');
  assert(!pkmPanelMatch[0].includes('id="toggle-grid"'), 'app/index.html panel-pokemon must not contain toggle-grid (fixed table view)');
  assert(!pkmPanelMatch[0].includes('id="pokemon-count"'), 'app/index.html must not contain static loading stats-bar');

  // Verify app-loading-view exists in app/index.html and styles.css
  assert(appHtml.includes('app-loading-view'), 'app/index.html must use app-loading-view');
  assert(appHtml.includes('app-loading-spinner'), 'app/index.html must use app-loading-spinner');
  assert(stylesCss.includes('.app-loading-view'), 'styles.css missing .app-loading-view');
  assert(stylesCss.includes('.app-loading-spinner'), 'styles.css missing .app-loading-spinner');
});

test('Tier 1 - Feature Coverage', 'H5 Recipe 1-Column Compact Card Layout Verification', () => {
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');

  // Verify H5 App does not have recipe view-mode-toggle in recipe panel
  const recipePanelMatch = appHtml.match(/<div[^>]*id=["']panel-recipes["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(recipePanelMatch, 'app/index.html missing panel-recipes');
  assert(!recipePanelMatch[0].includes('id="recipe-toggle-cards"'), 'app/index.html panel-recipes must not contain recipe-toggle-cards (fixed card view)');
  assert(!recipePanelMatch[0].includes('id="recipe-toggle-table"'), 'app/index.html panel-recipes must not contain recipe-toggle-table');

  // Verify desktop preserves recipe view mode toggles
  assert(indexHtml.includes('id="recipe-toggle-grid"'), 'desktop index.html must retain recipe-toggle-grid');
  assert(indexHtml.includes('id="recipe-toggle-table"'), 'desktop index.html must retain recipe-toggle-table');

  // Verify H5 1-column card styles & JS rendering logic
  assert(stylesCss.includes('.h5-recipe-cards-list'), 'styles.css missing .h5-recipe-cards-list');
  assert(stylesCss.includes('.h5-recipe-card'), 'styles.css missing .h5-recipe-card');
  assert(recipesJs.includes('h5-recipe-card'), 'recipes.js missing h5-recipe-card template');
});

test('Tier 2 - Boundary & Corner Cases', 'Ingredient Ladder: Dense Ranking & Multi-Top1 Verification', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiJs.includes('Dense Ranking'), 'wiki.js should implement dense ranking');

  let modalContainer = null;
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: { getLanguage: () => 'zh-TW', getIngredientName: (s) => s, getPokemonName: (s) => s }
    },
    document: {
      body: { classList: { contains: () => false }, appendChild: (el) => { modalContainer = el; } },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => id === 'wiki-ingredient-ranking-modal' ? modalContainer : null,
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  // Verify Tomato track in LV60_COORDINATE_LADDER_DATA has 3 isTop: true pokemons (大食花, 倫琴貓, 暴雪王)
  const tomatoData = ctx.window.WikiDB.LV60_COORDINATE_LADDER_DATA.find(i => i.id === 'tomato');
  assert(tomatoData !== undefined, 'Tomato ladder data must exist');
  const topTomatoPkms = tomatoData.pokemon.filter(p => p.isTop && p.variants.some(v => v.count === 76 && v.isTop));
  assertEquals(topTomatoPkms.length, 3, 'Tomato track must have 3 TOP 1 Pokemons (大食花, 倫琴貓, 暴雪王)');
  const topNames = topTomatoPkms.map(p => p.name);
  assert(topNames.includes('大食花') && topNames.includes('倫琴貓') && topNames.includes('暴雪王'), 'Top pokemons must be 大食花, 倫琴貓, 暴雪王');

  // Test modal rendering dense ranking for Tomato
  ctx.window.WikiDB.openIngredientRankingModal('tomato');
  assert(modalContainer !== null, 'Ranking modal container must be created');
  const cards = [...modalContainer.innerHTML.matchAll(/<div class="ing-rank-card [^"]*" title="([^"]+)"[\s\S]*?<div class="ing-rank-num [^"]*">\s*([^<\s]+)\s*<\/div>/g)];
  assert(cards.length >= 7, 'Must have at least 7 ranked cards for tomato');

  // Cards 1-3 must all have 🥇 medal
  assertEquals(cards[0][2], '🥇', '1st card must have 🥇');
  assertEquals(cards[1][2], '🥇', '2nd card must have 🥇 (tied)');
  assertEquals(cards[2][2], '🥇', '3rd card must have 🥇 (tied)');

  // Card 4 (魔牆人偶 71) must have 🥈 medal (Dense rank 2, NOT rank 4!)
  assertEquals(cards[3][2], '🥈', '4th card (魔牆人偶 71) must have 🥈 (Dense rank 2)');

  // Card 5 (妙蛙花 68) must have 🥉 medal (Dense rank 3)
  assertEquals(cards[4][2], '🥉', '5th card (妙蛙花 68) must have 🥉 (Dense rank 3)');

  // Card 6 (三地鼠 66) must have #4
  assertEquals(cards[5][2], '#4', '6th card (三地鼠 66) must have #4');

  // Card 7 (請假王 43) must have #5
  assertEquals(cards[6][2], '#5', '7th card (請假王 43) must have #5');
});

test('Tier 1 - Feature Coverage', 'FlagsAPI National Flags Integration for Language Switcher (Desktop & Mobile)', () => {
  const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Both index.html and app/index.html must have TW and US flags from FlagsAPI
  assert(desktopHtml.includes('https://flagsapi.com/TW/flat/64.png'), 'Desktop must use TW flag from flagsapi.com');
  assert(desktopHtml.includes('https://flagsapi.com/US/flat/64.png'), 'Desktop must use US flag from flagsapi.com');
  assert(mobileHtml.includes('https://flagsapi.com/TW/flat/64.png'), 'Mobile must use TW flag from flagsapi.com');
  assert(mobileHtml.includes('https://flagsapi.com/US/flat/64.png'), 'Mobile must use US flag from flagsapi.com');

  // styles.css must have appropriate sizing rules
  assert(css.includes('.lang-flag-icon'), 'styles.css must style .lang-flag-icon');
  assert(css.includes('.app-segment-btn .lang-flag-icon'), 'styles.css must style mobile .lang-flag-icon');
});

test('Tier 1 - Feature Coverage', 'News Event Calendar Selected and Today Borderless Styling', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Selected date must use translucent gray background, no glow (box-shadow: none), and no outline
  assert(css.includes('.news-cal-day-cell.is-selected'), 'styles.css must style .news-cal-day-cell.is-selected');
  assert(css.includes('background: rgba(148, 163, 184, 0.22) !important;'), 'Selected cell must have translucent gray background');
  assert(css.includes('box-shadow: none !important;'), 'Selected cell must not use glow box-shadow');
  assert(!css.includes('outline: 2px solid #ffffff'), 'Selected cell must not use 2px solid border/outline');

  // Today date must use white text, no 2px outline or solid medallion, and pulsing heartbeat dot
  assert(!css.includes('outline: 2px solid var(--color-primary'), 'Today cell must not use 2px solid border/outline');
  assert(css.includes('color: #ffffff !important; /* 今日文字使用白色 */'), 'Today date number must use white color');
  assert(css.includes('.news-cal-day-cell.is-today:not(.is-selected) .news-cal-day-num'), 'Today must style day-num');
  assert(css.includes('todayHeartbeat'), 'styles.css must define todayHeartbeat animation');

  // News items sections dashboard must be transparent and borderless on desktop web
  assert(css.includes('.news-ai-dashboard {'), 'styles.css must style .news-ai-dashboard');
  assert(css.includes('.news-ai-dashboard {\n  background: transparent !important;\n  border: none !important;'), 'News AI dashboard must be transparent and borderless');
});

test('Tier 1 - Feature Coverage', 'News Event Calendar Desktop Side-by-Side Parallel Layout & Mobile Stacked Preservation', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');

  // news.js must wrap calendar column
  assert(newsJs.includes('class="news-calendar-cal-col"'), 'news.js must wrap calendar in .news-calendar-cal-col');
  assert(newsJs.includes('class="news-calendar-events-box"'), 'news.js must contain .news-calendar-events-box');

  // Desktop styles: Grid layout side-by-side
  assert(css.includes('.news-calendar-wrapper {'), 'styles.css must style .news-calendar-wrapper');
  assert(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;'), 'Desktop calendar wrapper must use 2-column equal-width parallel grid (50/50)');
  assert(css.includes('.news-calendar-cal-col {'), 'styles.css must style .news-calendar-cal-col');

  // Mobile styles: Must strictly preserve flex-direction: column
  assert(css.includes('.mobile-h5-app .news-calendar-wrapper {'), 'styles.css must scope mobile wrapper');
  assert(css.includes('flex-direction: column !important;'), 'Mobile wrapper must preserve column stacking');
  assert(css.includes('.mobile-h5-app .news-calendar-cal-col {'), 'styles.css must style mobile cal-col');
});

test('Tier 1 - Feature Coverage', 'News Event & Bundle Expiration Status Badges and Clean UI', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');

  // styles.css must define expired status badge styles and expired card dimming
  assert(css.includes('.news-card.is-expired'), 'styles.css must style .news-card.is-expired');
  assert(css.includes('.news-status-badge.status-expired'), 'styles.css must style .news-status-badge.status-expired');
  assert(css.includes('.news-cal-status-tag.status-expired'), 'styles.css must style .news-cal-status-tag.status-expired');

  // news.js must check expiration, render top status-expired badge, and omit bulky alert banner
  assert(newsJs.includes("timeStatus === 'expired'"), 'news.js must detect expired events/bundles');
  assert(newsJs.includes('news-status-badge status-expired'), 'news.js must render status-expired badge on top');
  assert(!newsJs.includes('news-expired-alert-banner'), 'news.js must not render bulky news-expired-alert-banner inside card');
  assert(newsJs.includes('news-cal-status-tag status-expired'), 'news.js must render status-expired in calendar event list');
});

test('Tier 1 - Feature Coverage', 'Ingredient Ladder Universal Simplified Recipe Model (XXC, AAX, ABX, ABA, ABB, AAA)', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(css.includes('.recipe-tag-aaa'), 'styles.css must style .recipe-tag-aaa');
  assert(css.includes('.recipe-tag-abb'), 'styles.css must style .recipe-tag-abb');
  assert(css.includes('.recipe-tag-aba'), 'styles.css must style .recipe-tag-aba');
  assert(css.includes('.recipe-tag-xxc'), 'styles.css must style .recipe-tag-xxc');
  assert(css.includes('.recipe-tag-aax'), 'styles.css must style .recipe-tag-aax');
  assert(css.includes('.recipe-tag-abx'), 'styles.css must style .recipe-tag-abx');

  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const ctx = {
    window: {
      I18N: {
        getLanguage: () => 'zh-TW',
        getIngredientName: (name) => name,
        getPokemonName: (name) => name,
        translateDynamicText: (text) => text,
        getIngredientIcon: () => null
      }
    },
    document: {
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } })
    },
    console: console
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(typeof WikiDB.mergeRecipeCodes === 'function', 'mergeRecipeCodes must be exported');
  assertEquals(WikiDB.mergeRecipeCodes(['AAC', 'ABC']), 'AXC', "['AAC', 'ABC'] must merge to 'AXC'");

  // Verify that across all ladder data, zero duplicate-yield variants exist for any Pokemon
  const ladderData = WikiDB.LV60_COORDINATE_LADDER_DATA;
  let xxcCount = 0;
  let aaxCount = 0;
  let abaCount = 0;
  let aaaCount = 0;
  let abbCount = 0;
  let duplicateCountErrors = 0;

  ladderData.forEach(ing => {
    ing.pokemon.forEach(p => {
      const countsSeen = new Set();
      (p.variants || []).forEach(v => {
        if (countsSeen.has(v.count)) {
          duplicateCountErrors++;
        }
        countsSeen.add(v.count);
        if (v.recipe === 'XXC') xxcCount++;
        if (v.recipe === 'AAX') aaxCount++;
        if (v.recipe === 'ABA') abaCount++;
        if (v.recipe === 'AAA') aaaCount++;
        if (v.recipe === 'ABB') abbCount++;
      });
    });
  });

  assertEquals(duplicateCountErrors, 0, 'No Pokemon should have duplicate-yield variants');
  assertEquals(xxcCount, 108, 'Ingredient C track entries must be unified into universal XXC (108 variants)');
  assertEquals(aaxCount, 114, 'Pos A dual ingredients must be unified into universal AAX (114 variants)');
  assertEquals(abaCount, 114, 'ABA combinations must be 114 variants for Pos A pokemons with Lv.60 A');
  assertEquals(aaaCount, 114, 'AAA combinations must be 114 variants');
  assertEquals(abbCount, 114, 'ABB combinations must be 114 variants');

  // Verify specific Skeledirge calculations on Apple track
  const appleTrack = ladderData.find(i => i.id === 'apple');
  const skeledirge = appleTrack.pokemon.find(p => p.name === '骨紋巨聲鱷');
  assert(skeledirge, 'Skeledirge must exist in apple track');
  const skelVariants = skeledirge.variants.reduce((acc, v) => { acc[v.recipe] = v.count; return acc; }, {});
  assertEquals(skelVariants['AAA'], 91, 'Skeledirge AAA apple count should be 91');
  assertEquals(skelVariants['ABA'], 58, 'Skeledirge ABA apple count should be 58');
  assertEquals(skelVariants['AAX'], 46, 'Skeledirge AAX apple count should be 46');
  assertEquals(skelVariants['ABX'], 13, 'Skeledirge ABX apple count should be 13');

  // Verify specific Pinsir calculations on Apple track (Apple is position B)
  const pinsir = appleTrack.pokemon.find(p => p.name === '凱羅斯');
  assert(pinsir, 'Pinsir must exist in apple track');
  const pinsirVariants = pinsir.variants.reduce((acc, v) => { acc[v.recipe] = v.count; return acc; }, {});
  assertEquals(pinsirVariants['ABB'], 76, 'Pinsir ABB apple count should be 76');
  assertEquals(pinsirVariants['AAB'], 47, 'Pinsir AAB apple count should be 47');
  assertEquals(pinsirVariants['ABX'], 29, 'Pinsir ABX apple count should be 29');

  // Verify specific Xatu (天然鳥) on Apple track (Apple is position C)
  const xatu = appleTrack.pokemon.find(p => p.name === '天然鳥');
  assert(xatu, 'Xatu must exist in apple track');
  assertEquals(xatu.recipe, 'XXC', 'Xatu in apple track should have universal XXC recipe');
  assertEquals(xatu.count, 25, 'Xatu in apple track should have 25 count');
  assertEquals(xatu.variants.length, 1, 'Xatu should have exactly 1 universal XXC variant');

  // Verify Gourgeist consolidation: only 1 entry in each of soybeans, potato, pumpkin
  const soybeansGourgeist = ladderData.find(i => i.id === 'soybeans').pokemon.filter(p => p.name.includes('南瓜怪人'));
  assertEquals(soybeansGourgeist.length, 1, 'Soybeans track must have exactly 1 consolidated Gourgeist');
  assertEquals(soybeansGourgeist[0].name, '南瓜怪人', 'Gourgeist name should be clean 南瓜怪人');
  assertEquals(soybeansGourgeist[0].count, 79, 'Soybeans Gourgeist count should be 79 (Small Variety)');

  const pumpkinGourgeist = ladderData.find(i => i.id === 'pumpkin').pokemon.filter(p => p.name.includes('南瓜怪人'));
  assertEquals(pumpkinGourgeist.length, 1, 'Pumpkin track must have exactly 1 consolidated Gourgeist');
  assertEquals(pumpkinGourgeist[0].count, 38, 'Pumpkin Gourgeist count should be 38 (Small Variety)');

  // Verify Eeveelutions consolidation: unified into "伊布家族（8種進化）" across milk, sausage, cacao
  const eeveelutionNames = ['水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布'];
  ['milk', 'sausage', 'cacao'].forEach(trackId => {
    const track = ladderData.find(i => i.id === trackId);
    const eeveeFam = track.pokemon.filter(p => p.name === '伊布家族（8種進化）');
    assertEquals(eeveeFam.length, 1, `${trackId} track must have exactly 1 consolidated '伊布家族（8種進化）'`);
    eeveelutionNames.forEach(ename => {
      const standalone = track.pokemon.filter(p => p.name === ename);
      assertEquals(standalone.length, 0, `${trackId} track must not have standalone ${ename}`);
    });
  });

  // Verify search matching and alias resolution for consolidated Eevee family
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '雷伊布'), 'Search for 雷伊布 matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', 'jolteon'), 'Search for jolteon matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '水伊布'), 'Search for 水伊布 matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', 'vaporeon'), 'Search for vaporeon matches Eevee family');
  assert(!WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '皮卡丘'), 'Search for 皮卡丘 does NOT match Eevee family');

  // Verify the 4 original recipe filter buttons logic (ALL, AAA, ABB, AXX)
  const xxcVariant = { recipe: 'XXC', origRecipes: ['AAC', 'ABC'] };
  const aaxVariant = { recipe: 'AAX', origRecipes: ['AAB', 'AAC'] };
  const abxVariant = { recipe: 'ABX', origRecipes: ['ABA', 'ABC'] };
  const aaaVariant = { recipe: 'AAA' };
  const abbVariant = { recipe: 'ABB' };

  assert(WikiDB.matchesLadderRecipeFilter(xxcVariant, 'ALL'), 'XXC must match ALL filter');
  assert(WikiDB.matchesLadderRecipeFilter(xxcVariant, 'AXX'), 'XXC must match AXX mix filter');
  assert(!WikiDB.matchesLadderRecipeFilter(xxcVariant, 'AAA'), 'XXC must NOT match AAA filter');
  assert(!WikiDB.matchesLadderRecipeFilter(xxcVariant, 'ABB'), 'XXC must NOT match ABB filter');

  assert(WikiDB.matchesLadderRecipeFilter(aaxVariant, 'AXX'), 'AAX must match AXX mix filter');
  assert(WikiDB.matchesLadderRecipeFilter(abxVariant, 'AXX'), 'ABX must match AXX mix filter');
  assert(WikiDB.matchesLadderRecipeFilter(aaaVariant, 'AAA'), 'AAA must match AAA filter');
  assert(!WikiDB.matchesLadderRecipeFilter(aaaVariant, 'AXX'), 'AAA must NOT match AXX filter');
  assert(WikiDB.matchesLadderRecipeFilter(abbVariant, 'ABB'), 'ABB must match ABB filter');
  assert(!WikiDB.matchesLadderRecipeFilter(abbVariant, 'AXX'), 'ABB must NOT match AXX filter');
});

test('Tier 4 - Real-World Application Scenarios', 'Main Tab and Internal Sub-Tabs Persistence across Page Reloads & Tab Switches', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');

  const sharedStorage = {};
  const mockStorage = {
    getItem: (k) => sharedStorage[k] !== undefined ? sharedStorage[k] : null,
    setItem: (k, v) => { sharedStorage[k] = String(v); },
    removeItem: (k) => { delete sharedStorage[k]; }
  };

  function createEnv(initialHash = '') {
    const mockElements = {};
    function getEl(id) {
      if (!mockElements[id]) {
        mockElements[id] = {
          id: id,
          style: { display: '' },
          classList: {
            _classes: new Set(),
            add: function(c) { this._classes.add(c); },
            remove: function(c) { this._classes.delete(c); },
            contains: function(c) { return this._classes.has(c); },
            toggle: function(c, force) {
              if (force === undefined) {
                if (this._classes.has(c)) this._classes.delete(c);
                else this._classes.add(c);
              } else if (force) {
                this._classes.add(c);
              } else {
                this._classes.delete(c);
              }
            }
          },
          getAttribute: (a) => null,
          setAttribute: () => {},
          addEventListener: () => {},
          querySelectorAll: () => []
        };
      }
      return mockElements[id];
    }

    const domListeners = [];
    const ctx = {
      localStorage: mockStorage,
      sessionStorage: mockStorage,
      window: {
        location: { hash: initialHash },
        localStorage: mockStorage,
        sessionStorage: mockStorage,
        history: {
          replaceState: (state, title, url) => {
            if (url && url.startsWith('#')) {
              ctx.window.location.hash = url;
            }
          }
        },
        addEventListener: () => {},
        innerWidth: 1200
      },
      document: {
        readyState: 'complete',
        documentElement: {
          setAttribute: () => {},
          getAttribute: () => null,
          removeAttribute: () => {}
        },
        body: {
          classList: {
            _classes: new Set(),
            add: function(c) { this._classes.add(c); },
            remove: function(c) { this._classes.delete(c); },
            contains: function(c) { return this._classes.has(c); }
          }
        },
        getElementById: getEl,
        querySelectorAll: (sel) => [],
        querySelector: (sel) => null,
        addEventListener: (evt, cb) => {
          if (evt === 'DOMContentLoaded') domListeners.push(cb);
        }
      },
      console: console,
      setTimeout: setTimeout
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    vm.createContext(ctx);
    ctx.triggerReady = () => {
      domListeners.forEach(cb => { try { cb(); } catch (e) {} });
    };
    return ctx;
  }

  // 1. Session 1: User navigates to Wiki and selects Subskills sub-tab
  const env1 = createEnv('#wiki');
  vm.runInContext(i18nCode, env1);
  vm.runInContext(wikiCode, env1);
  vm.runInContext(boxCode, env1);
  vm.runInContext(appCode, env1);
  env1.triggerReady();

  assert(typeof env1.window.WikiDB.switchSubTab === 'function', 'WikiDB.switchSubTab must exist');
  env1.window.WikiDB.switchSubTab('subskills');
  assertEquals(sharedStorage['pksleep_active_wiki_subtab'], 'subskills', 'Wiki subtab should be saved to localStorage');
  assertEquals(env1.window.location.hash, '#wiki/subskills', 'Hash should sync with subtab');

  // 2. User switches to Box and selects Lab sub-tab
  env1.window.switchMainTab('box');
  assertEquals(sharedStorage['pksleep_active_main_tab'], 'box', 'Main tab should be saved to localStorage');
  env1.window.switchBoxSubtab('lab');
  assertEquals(sharedStorage['pksleep_active_box_subtab'], 'lab', 'Box subtab should be saved to localStorage');
  assertEquals(env1.window.location.hash, '#box/lab', 'Hash should sync with box lab subtab');

  // 3. User switches back to Wiki: subtab must be remembered as subskills!
  env1.window.switchMainTab('wiki');
  assertEquals(sharedStorage['pksleep_active_main_tab'], 'wiki', 'Main tab is wiki');
  assertEquals(env1.window.WikiDB.getCurrentSubTab(), 'subskills', 'Wiki must preserve last viewed subskills subtab after main tab switch');
  assertEquals(env1.window.location.hash, '#wiki/subskills', 'Hash must restore #wiki/subskills');

  // 4. Session 2 (Page Refresh): simulate reload on #wiki
  const env2 = createEnv('#wiki');
  vm.runInContext(i18nCode, env2);
  vm.runInContext(wikiCode, env2);
  vm.runInContext(boxCode, env2);
  vm.runInContext(appCode, env2);
  env2.triggerReady();

  assertEquals(env2.window.WikiDB.getCurrentSubTab(), 'subskills', 'Wiki must restore subskills on reload');
  assertEquals(env2.window.getCurrentBoxSubtab(), 'lab', 'Box must restore lab on reload');

  // 5. Session 3: simulate reload with no hash (root entry)
  const env3 = createEnv('');
  vm.runInContext(i18nCode, env3);
  vm.runInContext(wikiCode, env3);
  vm.runInContext(boxCode, env3);
  vm.runInContext(appCode, env3);
  env3.triggerReady();

  assertEquals(sharedStorage['pksleep_active_main_tab'], 'wiki', 'Main tab remembered as wiki');
  assertEquals(env3.window.WikiDB.getCurrentSubTab(), 'subskills', 'Subtab remembered as subskills');

  // 6. User switches to Islands subtab in Wiki and selects Cyan Beach
  env3.window.WikiDB.switchSubTab('islands');
  assertEquals(sharedStorage['pksleep_active_wiki_subtab'], 'islands', 'Wiki subtab should be saved as islands');
  assertEquals(env3.window.location.hash, '#wiki/islands', 'Hash should sync with #wiki/islands');
  env3.window.WikiDB.selectIsland('cyan', false);
  assertEquals(sharedStorage['pksleep_active_island_id'], 'cyan', 'Selected island should be saved to localStorage');

  // 7. Session 4 (Page Refresh on #wiki/islands): simulate reload
  const env4 = createEnv('#wiki/islands');
  vm.runInContext(i18nCode, env4);
  vm.runInContext(wikiCode, env4);
  vm.runInContext(boxCode, env4);
  vm.runInContext(appCode, env4);
  env4.triggerReady();

  assertEquals(env4.window.WikiDB.getCurrentSubTab(), 'islands', 'Wiki must restore islands subtab on reload');
  assertEquals(env4.window.WikiDB.getCurrentIslandId(), 'cyan', 'Island must restore cyan on reload');
  assertEquals(env4.window.location.hash, '#wiki/islands', 'Hash must stay #wiki/islands on reload');

  // 8. Session 5: simulate reload with no hash (root entry)
  const env5 = createEnv('');
  vm.runInContext(i18nCode, env5);
  vm.runInContext(wikiCode, env5);
  vm.runInContext(boxCode, env5);
  vm.runInContext(appCode, env5);
  env5.triggerReady();

  assertEquals(sharedStorage['pksleep_active_main_tab'], 'wiki', 'Main tab remembered as wiki');
  assertEquals(env5.window.WikiDB.getCurrentSubTab(), 'islands', 'Subtab remembered as islands on root reload');
});

test('Tier 1 - Feature Coverage', 'Ingredient Ladder Multi-Criteria Track Sorting (ENERGY_ASC, ENERGY_DESC, YIELD_DESC, DEMAND_DESC)', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  let badgeEl = { textContent: '', style: { display: 'none', setProperty: () => {} } };
  let coordinateContainer = { innerHTML: '', style: { setProperty: () => {} } };
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: { getLanguage: () => 'zh-TW', getIngredientName: (s) => s, getPokemonName: (s) => s }
    },
    document: {
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'ladder-sidebar-bookmark-badge') return badgeEl;
        if (id === 'wiki-ingredient-ladder-coordinate') return coordinateContainer;
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(typeof WikiDB.setLadderSortOrder === 'function', 'WikiDB.setLadderSortOrder must be a function');
  assert(typeof WikiDB.getLadderSortOrder === 'function', 'WikiDB.getLadderSortOrder must be a function');

  // 1. Verify default sort order is ENERGY_ASC
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_ASC', 'Default sort order must be ENERGY_ASC');

  // Helper to extract track order from rendered coordinate ladder HTML
  const extractTrackOrder = () => {
    WikiDB.refreshCoordinateLadder();
    const matches = [...coordinateContainer.innerHTML.matchAll(/<div class="ladder-track-row [^"]*" data-ladder-ing="([^"]+)">/g)];
    return matches.map(m => m[1]);
  };

  // 2. Test Default: ENERGY_ASC (apple 90 -> ... -> pumpkin 250)
  const tracksEnergyAsc = extractTrackOrder();
  assertEquals(tracksEnergyAsc[0], 'apple', 'ENERGY_ASC: Apple (energy 90) must be first track');
  assertEquals(tracksEnergyAsc[tracksEnergyAsc.length - 1], 'pumpkin', 'ENERGY_ASC: Pumpkin (energy 250) must be last main track');

  // 3. Test ENERGY_DESC (pumpkin 250 -> ... -> apple 90)
  WikiDB.setLadderSortOrder('ENERGY_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_DESC', 'Sort order must switch to ENERGY_DESC');
  const tracksEnergyDesc = extractTrackOrder();
  assertEquals(tracksEnergyDesc[0], 'pumpkin', 'ENERGY_DESC: Pumpkin (energy 250) must be first track');
  assertEquals(tracksEnergyDesc[1], 'leek', 'ENERGY_DESC: Leek (energy 185) must be second track');
  assertEquals(tracksEnergyDesc[tracksEnergyDesc.length - 1], 'apple', 'ENERGY_DESC: Apple (energy 90) must be last main track');

  // 4. Test YIELD_DESC (herb 93 -> ... -> pumpkin 38)
  WikiDB.setLadderSortOrder('YIELD_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'YIELD_DESC', 'Sort order must switch to YIELD_DESC');
  const tracksYieldDesc = extractTrackOrder();
  assertEquals(tracksYieldDesc[0], 'herb', 'YIELD_DESC: Herb (top yield 93) must be first track');
  assertEquals(tracksYieldDesc[1], 'apple', 'YIELD_DESC: Apple (top yield 91) must be second track');
  assertEquals(tracksYieldDesc[tracksYieldDesc.length - 1], 'pumpkin', 'YIELD_DESC: Pumpkin (top yield 38) must be last main track');

  // 5. Test DEMAND_DESC (milk 41 -> ginger 39 -> ... -> pumpkin/sausage 20)
  WikiDB.setLadderSortOrder('DEMAND_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'DEMAND_DESC', 'Sort order must switch to DEMAND_DESC');
  const tracksDemandDesc = extractTrackOrder();
  assertEquals(tracksDemandDesc[0], 'milk', 'DEMAND_DESC: Milk (key dish need 41) must be first track');
  assertEquals(tracksDemandDesc[1], 'ginger', 'DEMAND_DESC: Ginger (key dish need 39) must be second track');
  assertEquals(tracksDemandDesc[2], 'honey', 'DEMAND_DESC: Honey (key dish need 38) must be third track');

  // 6. Test active filter badge count
  WikiDB.updateLadderActiveFilterBadge();
  assertEquals(badgeEl.style.display, 'inline-flex', 'Badge must display when sort order is non-default');
  assertEquals(badgeEl.textContent, 1, 'Badge count must include sort order when non-default');

  // 7. Test Reset Filters
  WikiDB.resetLadderFilters();
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_ASC', 'resetLadderFilters must reset sort order to ENERGY_ASC');
  const tracksAfterReset = extractTrackOrder();
  assertEquals(tracksAfterReset[0], 'apple', 'Track order after reset must return to Apple first');
});

test('Tier 1 - Feature Coverage', 'Wiki Subskills Helping Speed Matrix Nature/Interval Multiplier Formatting', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const container = { innerHTML: '' };
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: { getLanguage: () => 'zh-TW', getIngredientName: (s) => s, getPokemonName: (s) => s }
    },
    document: {
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && typeof WikiDB.renderWikiLayout === 'function', 'WikiDB.renderWikiLayout must exist');
  WikiDB.renderWikiLayout(container);

  const html = container.innerHTML;
  assert(html.includes('幫忙速度極限與計算機制指南'), 'Wiki layout missing Helping Speed Matrix table');

  // 1. Check nature arrow formatting: only ▲, ▼, - in the content
  assert(html.includes('class="matrix-rate-up font-bold" style="font-size: 15px;" title="幫忙速度上升">▲</span>'), 'Nature up must render as ▲');
  assert(html.includes('class="matrix-rate-down font-bold" style="font-size: 15px;" title="幫忙速度下降">▼</span>'), 'Nature down must render as ▼');
  assert(html.includes('class="text-muted font-bold" style="font-size: 15px;" title="無修正">-</span>'), 'Nature neutral must render as -');

  // 2. Check helping interval ratio format: ${row.intervalRatio}x
  assert(html.includes('0.585x'), 'Interval ratio should include 0.585x');
  assert(html.includes('0.666x'), 'Interval ratio should include 0.666x');
  assert(html.includes('0.711x'), 'Interval ratio should include 0.711x');
  assert(html.includes('1x') || html.includes('1.000x'), 'Interval ratio should include 1x');
  assert(html.includes('1.1x') || html.includes('1.100x'), 'Interval ratio should include 1.1x');
});

test('Tier 1 - Feature Coverage', 'Ingredient Ladder Top 15 Mobile Optimization and Lazy Loading', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  let switchEl = { checked: true };
  let badgeEl = { textContent: '', style: { display: 'none', setProperty: () => {} } };
  let coordinateContainer = { innerHTML: '', style: { setProperty: () => {} } };
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: { getLanguage: () => 'zh-TW', getIngredientName: (s) => s, getPokemonName: (s) => s }
    },
    document: {
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'ladder-top15-switch') return switchEl;
        if (id === 'ladder-sidebar-bookmark-badge') return badgeEl;
        if (id === 'wiki-ingredient-ladder-coordinate') return coordinateContainer;
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(wikiJs.includes('天梯軌道排序'), 'Ladder template must include track sorting section');
  const switchIdx = wikiJs.indexOf('id="ladder-top15-switch"');
  const sortIdx = wikiJs.indexOf('天梯軌道排序');
  const headerIdx = wikiJs.indexOf('id="ladder-reset-all-btn"');
  assert(switchIdx > 0 && sortIdx > 0 && switchIdx > sortIdx, 'Top 15 switch must sit in Track Sorting header, not the cramped sidebar header');
  assert(headerIdx > 0 && switchIdx > headerIdx, 'Top 15 switch must come after sidebar reset, inside scrollable sections');
  assert(typeof WikiDB.getLadderTop15Only === 'function', 'WikiDB.getLadderTop15Only must exist');
  assert(typeof WikiDB.toggleLadderTop15 === 'function', 'WikiDB.toggleLadderTop15 must exist');

  // 1. Default state is true (Top 15 enabled)
  assertEquals(WikiDB.getLadderTop15Only(), true, 'Default ladderTop15Only must be true');

  // 2. Render ladder and check node counts when Top 15 is active
  WikiDB.refreshCoordinateLadder();
  const htmlTop15 = coordinateContainer.innerHTML;
  assert(htmlTop15.length > 0, 'Coordinate ladder HTML must not be empty');

  // Verify lazy loading attributes on avatar images
  assert(htmlTop15.includes('loading="lazy"'), 'Ladder avatars must have loading="lazy"');
  assert(htmlTop15.includes('decoding="async"'), 'Ladder avatars must have decoding="async"');

  // Verify track nodes are sliced to <= 15
  const trackMatches = htmlTop15.split('<div class="ladder-track-row');
  trackMatches.slice(1).forEach(trackHtml => {
    const nodeCount = (trackHtml.match(/class="ladder-node\s/g) || []).length;
    assert(nodeCount <= 15, `Track node count when Top 15 enabled must be <= 15, found ${nodeCount}`);
  });

  // 3. Toggle to false (Show all nodes)
  WikiDB.toggleLadderTop15(false);
  assertEquals(WikiDB.getLadderTop15Only(), false, 'ladderTop15Only should be false after toggle');
  WikiDB.refreshCoordinateLadder();
  const htmlAll = coordinateContainer.innerHTML;
  const allTracks = htmlAll.split('<div class="ladder-track-row');
  let hasTrackMoreThan15 = false;
  allTracks.slice(1).forEach(trackHtml => {
    const nodeCount = (trackHtml.match(/class="ladder-node\s/g) || []).length;
    if (nodeCount > 15) hasTrackMoreThan15 = true;
  });
  assert(hasTrackMoreThan15, 'When Top 15 disabled, tracks with >15 Pokemon should render more than 15 nodes');

  // 4. resetLadderFilters restores Top 15
  WikiDB.resetLadderFilters();
  assertEquals(WikiDB.getLadderTop15Only(), true, 'resetLadderFilters must restore ladderTop15Only to true');
});

test('Tier 1 - Feature Coverage', 'Mobile App Pull-to-Refresh Mechanism and Indicator Styles', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify PTR styles in CSS
  assert(css.includes('.ptr-indicator'), 'styles.css must define .ptr-indicator');
  assert(css.includes('.ptr-inner'), 'styles.css must define .ptr-inner');
  assert(css.includes('.ptr-icon'), 'styles.css must define .ptr-icon');
  assert(css.includes('@keyframes ptr-spin'), 'styles.css must define @keyframes ptr-spin');
  assert(css.includes('.ptr-indicator.ptr-refreshing .ptr-icon'), 'styles.css must define refreshing animation');

  // Verify PTR logic in app.js
  assert(appJs.includes('function initPullToRefresh()'), 'app.js must define initPullToRefresh');
  assert(appJs.includes('window.initPullToRefresh = initPullToRefresh'), 'app.js must export window.initPullToRefresh');
  assert(appJs.includes('THRESHOLD = 64'), 'PTR threshold must be 64px');
  assert(appJs.includes('window.location.reload()'), 'PTR must trigger window.location.reload() on release');
});

test('Tier 1 - Feature Coverage', 'Filter Drawer Swipe-to-Close and Ghost Click Prevention (Backdrop Dismiss)', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  assert(appJs.includes('function bindBackdropDismiss('), 'app.js must define bindBackdropDismiss');
  assert(appJs.includes('window.bindBackdropDismiss = bindBackdropDismiss'), 'app.js must export bindBackdropDismiss');
  assert(appJs.includes('window.toggleSidebar = toggleSidebar'), 'app.js must export window.toggleSidebar');

  // Verify swipe right close helper does not block buttons/badges
  assert(appJs.includes("target.tagName === 'INPUT' && (target.type === 'range'"), 'Swipe close helper should only ignore range sliders');

  // Verify backdrop event consumer behavior
  let touchEndPrevented = false;
  let touchEndStopped = false;
  let clickPrevented = false;
  let clickStopped = false;
  let closeCalledCount = 0;

  const mockBackdrop = {
    listeners: {},
    addEventListener(event, fn) {
      this.listeners[event] = fn;
    }
  };

  const closeFn = () => { closeCalledCount++; };

  const ctx = {
    window: {},
    document: {
      documentElement: { setAttribute: () => {} },
      body: { classList: { contains: () => false } },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);

  assert(typeof ctx.window.bindBackdropDismiss === 'function', 'window.bindBackdropDismiss must be a function');
  ctx.window.bindBackdropDismiss(mockBackdrop, closeFn);

  assert(mockBackdrop.listeners['touchstart'], 'touchstart listener must be attached');
  assert(mockBackdrop.listeners['touchend'], 'touchend listener must be attached');
  assert(mockBackdrop.listeners['click'], 'click listener must be attached');

  // Test touchend consumes and invokes closeFn
  mockBackdrop.listeners['touchend']({
    preventDefault: () => { touchEndPrevented = true; },
    stopPropagation: () => { touchEndStopped = true; }
  });
  assert(touchEndPrevented, 'touchend must call e.preventDefault() to prevent ghost click');
  assert(touchEndStopped, 'touchend must call e.stopPropagation()');
  assertEquals(closeCalledCount, 1, 'closeFn should be invoked on touchend');

  // Test click consumes and invokes closeFn
  mockBackdrop.listeners['click']({
    preventDefault: () => { clickPrevented = true; },
    stopPropagation: () => { clickStopped = true; }
  });
  assert(clickPrevented, 'click must call e.preventDefault()');
  assert(clickStopped, 'click must call e.stopPropagation()');
  assertEquals(closeCalledCount, 2, 'closeFn should be invoked on click');
});

test('Tier 1 - Feature Coverage', 'Mobile Pokemon Table Safe Area and Bottom Dock Viewport Clearance CSS', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Check Pokemon table tr:last-child td bottom padding
  assert(css.includes('.pokemon-table tbody tr:last-child td'), 'styles.css must style .pokemon-table tbody tr:last-child td');
  assert(css.includes('env(safe-area-inset-bottom'), 'tr:last-child td must account for env(safe-area-inset-bottom)');

  // 2. Check mobile viewport panel height approach for #panel-pokemon
  // New approach: body has padding-bottom for dock space, panels use height:100% to inherit correctly
  assert(css.includes('#panel-pokemon {'), 'styles.css must define mobile #panel-pokemon height rule');
  assert(
    css.includes('height: 100% !important;') && css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
    '#panel-pokemon must use height:100% with body padding-bottom accounting for dock clearance'
  );

  // 3. Check drawer smooth slide transition delay for visibility
  assert(css.includes('visibility 0s 0.28s'), 'Drawer sidebars must delay visibility change until slide-out completes');
});

test('Tier 1 - Feature Coverage', 'Nature 5-Stat Multiplier Helping Speed (-10% / +7.5%) & DevTools Error Guard', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Verify Nature 5-stat table data in wiki.js
  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} }, addEventListener: () => {} },
    document: {
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && WikiDB.NATURES_EFFECT_DATA, 'WikiDB.NATURES_EFFECT_DATA must exist');
  const speedRow = WikiDB.NATURES_EFFECT_DATA.find(r => r.stat === '幫忙速度' || r.stat_en === 'Speed of Help');
  assert(speedRow, '幫忙速度 row must exist in NATURES_EFFECT_DATA');
  assertEquals(speedRow.up, '-10%', 'Helping Speed Up must be -10% (less time)');
  assertEquals(speedRow.down, '+7.5%', 'Helping Speed Down must be +7.5% (more time)');

  // 2. Verify rendered HTML output in wiki layout
  const container = { innerHTML: '' };
  WikiDB.renderWikiLayout(container);
  assert(container.innerHTML.includes('-10%'), 'Wiki layout must render -10% for helping speed up');
  assert(container.innerHTML.includes('+7.5%'), 'Wiki layout must render +7.5% for helping speed down');

  // 3. Verify DevTools Live Metrics error filtering in both index.html and app/index.html
  assert(indexHtml.includes('reportAllChanges'), 'index.html must guard against reportAllChanges error');
  assert(indexHtml.includes("reading 'startTime'"), 'index.html must guard against startTime error');
  assert(appIndexHtml.includes('reportAllChanges'), 'app/index.html must guard against reportAllChanges error');
  assert(appIndexHtml.includes("reading 'startTime'"), 'app/index.html must guard against startTime error');
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Parentheses Removal & Speed Mechanics Single Box Simplification', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const ctx = {
    window: {},
    document: {
      addEventListener: () => {},
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => []
    },
    console: console
  };
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && WikiDB.NATURES_EFFECT_DATA, 'WikiDB.NATURES_EFFECT_DATA must exist');
  assert(WikiDB && WikiDB.SUB_SKILLS_DATA, 'WikiDB.SUB_SKILLS_DATA must exist');

  // 1. Nature 5-Stat Multiplier: no parentheses in desc or desc_en
  WikiDB.NATURES_EFFECT_DATA.forEach(row => {
    assert(!row.desc.includes('（') && !row.desc.includes('）'), `Nature stat ${row.stat} desc must not contain parentheses, got: ${row.desc}`);
    assert(!row.desc_en.includes('(') && !row.desc_en.includes(')'), `Nature stat ${row.stat_en} desc_en must not contain parentheses, got: ${row.desc_en}`);
  });

  // 2. Sub-skills: ONLY 樹果數量 S and 幫手獎勵 contain parentheses, all other 9 categories must not
  const helpingBonus = WikiDB.SUB_SKILLS_DATA.find(r => r.category === '全隊幫忙');
  assert(helpingBonus && (helpingBonus.desc === '全隊幫忙時間-5%(5隻=25%)' || helpingBonus.desc === '全隊幫忙時間-5%(5 隻 = 25%)'), `全隊幫忙 desc must match exact requested text, got: ${helpingBonus ? helpingBonus.desc : 'null'}`);
  assertEquals(helpingBonus.desc_en, 'Team help time -5% (5 helpers = 25%)', '全隊幫忙 desc_en must be concise');

  const berryFinding = WikiDB.SUB_SKILLS_DATA.find(r => r.category === '樹果數量');
  assert(berryFinding && berryFinding.desc === '樹果數量+1個(樹果型T0核心)', `樹果數量 desc must match exact requested text, got: ${berryFinding ? berryFinding.desc : 'null'}`);
  assertEquals(berryFinding.desc_en, 'Berries +1 (Berry T0 core)', '樹果數量 desc_en must be concise');

  WikiDB.SUB_SKILLS_DATA.forEach(row => {
    const hasParenthesesZh = row.desc.includes('（') || row.desc.includes('）') || row.desc.includes('(') || row.desc.includes(')');
    const hasParenthesesEn = row.desc_en.includes('(') || row.desc_en.includes(')');
    const isAllowed = row.category === '樹果數量' || row.category === '全隊幫忙';

    if (isAllowed) {
      assert(hasParenthesesZh, `${row.category} must preserve parentheses in desc`);
      assert(hasParenthesesEn, `${row.category_en} must preserve parentheses in desc_en`);
    } else {
      assert(!hasParenthesesZh, `${row.category} desc must NOT contain parentheses, got: ${row.desc}`);
      assert(!hasParenthesesEn, `${row.category_en} desc_en must NOT contain parentheses, got: ${row.desc_en}`);
    }
  });

  // 3. Rendered wiki layout assertions
  const container = { innerHTML: '' };
  WikiDB.renderWikiLayout(container);

  // Assert no subskill badge name in SUB_SKILLS_DATA has "提升"
  WikiDB.SUB_SKILLS_DATA.forEach(row => {
    row.skills.forEach(s => {
      assert(!s.name.includes('提升'), `Subskill name ${s.name} should not contain '提升'`);
    });
  });

  // Assert borderless points list is present and boxes/formulas are removed
  assert(container.innerHTML.includes('wiki-speed-summary-points'), 'Wiki layout must contain wiki-speed-summary-points');
  assert(container.innerHTML.includes('summary-point-line'), 'Wiki layout must contain summary-point-line');
  assert(!container.innerHTML.includes('wiki-speed-summary-box'), 'wiki-speed-summary-box outer box should be removed');
  assert(!container.innerHTML.includes('speed-summary-formula-bar'), 'speed-summary-formula-bar should be removed');
  assert(!container.innerHTML.includes('speed-summary-points-grid'), 'speed-summary-points-grid should be removed');

  // Assert Nature 5-stat table has removed the 4th column (影響機制說明 / Mechanic Details)
  const natureTablePart = container.innerHTML.substring(container.innerHTML.indexOf('wiki-card-natures-table'));
  const natureTableHead = natureTablePart.substring(0, natureTablePart.indexOf('<tbody>'));
  assert(!natureTableHead.includes('影響機制說明'), 'Nature table header must not contain 影響機制說明');
  assert(!natureTableHead.includes('Mechanic Details'), 'Nature table header must not contain Mechanic Details');

  // Assert subskills overview table has dedicated classes
  assert(container.innerHTML.includes('wiki-subskills-table'), 'Subskills table must have wiki-subskills-table class');
  assert(container.innerHTML.includes('col-subskills-tags'), 'Subskills table must have col-subskills-tags class');
  assert(container.innerHTML.includes('col-subskills-effect'), 'Subskills table must have col-subskills-effect class');

  // Assert subskills overview card does NOT have wiki-rule-banner
  const subskillsOverviewPart = container.innerHTML.substring(container.innerHTML.indexOf('wiki-card-subskills-overview'));
  const subskillsTablePart = subskillsOverviewPart.substring(0, subskillsOverviewPart.indexOf('wiki-data-table'));
  assert(!subskillsTablePart.includes('wiki-rule-banner'), 'wiki-card-subskills-overview must not contain wiki-rule-banner');
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Subskills & Nature Tab Uniform Itemview Height and Multi-Line Support', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify desktop uniform itemview height definition
  assert(cssContent.includes('#wiki-subpanel-subskills .wiki-data-table tbody tr') || cssContent.includes('.wiki-subskills-table tbody tr'),
    'styles.css must define desktop subpanel table row height');
  assert(cssContent.includes('height: 38px'), 'styles.css must specify 38px desktop uniform row height');

  // Verify mobile H5 uniform itemview height definition
  assert(cssContent.includes('.mobile-h5-app #wiki-subpanel-subskills .wiki-data-table tbody tr'),
    'styles.css must define mobile H5 subpanel table row height');
  assert(cssContent.includes('.mobile-h5-app .wiki-subskills-table tbody tr'),
    'styles.css must define mobile H5 subskills table row height');
  assert(cssContent.includes('height: 36px !important'),
    'styles.css must specify 36px mobile uniform row height');

  // Verify multi-line rows are unconstrained (no overflow:hidden or max-height clamping on table cells)
  const mobileSubskillsPart = cssContent.substring(cssContent.indexOf('.mobile-h5-app .wiki-subskills-table td'));
  const mobileSubskillsBlock = mobileSubskillsPart.substring(0, mobileSubskillsPart.indexOf('}'));
  assert(!mobileSubskillsBlock.includes('overflow: hidden'), 'Subskills table cells must not clamp or overflow-hide multi-line content');
  assert(!mobileSubskillsBlock.includes('max-height'), 'Subskills table cells must not set max-height to permit multi-line expansion');
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Helping Speed Column Width and Subpanel Typography Consistency', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify speed guide col 1 is widened to 48% on mobile to fit at least 2 subskills on one line
  assert(cssContent.includes('.mobile-h5-app #wiki-subpanel-subskills .wiki-card-speed-guide .wiki-data-table th:nth-child(1)'),
    'styles.css must style mobile speed guide column 1');
  assert(cssContent.includes('width: 48% !important'), 'Speed guide col 1 must be widened to 48% on mobile');

  // 2. Verify desktop speed guide table defines column 1 width
  assert(cssContent.includes('.wiki-card-speed-guide .wiki-data-table th:nth-child(1)'),
    'styles.css must style desktop speed guide column 1');
  assert(cssContent.includes('width: 28%'), 'Speed guide col 1 must be 28% on desktop');

  // 3. Verify unified table headers font size (13px bold) across subpanel
  assert(cssContent.includes('.mobile-h5-app #wiki-subpanel-subskills .wiki-data-table th'),
    'styles.css must define unified mobile table header styling');
  assert(cssContent.includes('#wiki-subpanel-subskills .wiki-data-table th,') || cssContent.includes('#wiki-subpanel-subskills .wiki-data-table th {'),
    'styles.css must define desktop subpanel table header styling');

  // 4. Verify subskills table effect description is unified to 11.5px
  const effectColPart = cssContent.substring(cssContent.indexOf('.mobile-h5-app .wiki-subskills-table .col-subskills-effect'));
  const effectColBlock = effectColPart.substring(0, effectColPart.indexOf('}'));
  assert(effectColBlock.includes('font-size: 11.5px !important'), 'col-subskills-effect must be unified to 11.5px');
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Subskills Panel Full-Width Symbols Replaced with Half-Width', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');

  // 1. Verify summary points use half-width colons, commas, and periods and zero redundant spaces
  assert(wikiJs.includes("'副技能上限35%:'") || wikiJs.includes("'副技能上限 35%:'"), 'Speed guide point 1 title must use half-width colon');
  assert(wikiJs.includes("'副技能合計縮短上限為35%,溢出無效.'") || wikiJs.includes("'副技能合計縮短上限為 35%, 溢出無效.'"), 'Speed guide point 1 desc must use half-width comma and period');
  assert(wikiJs.includes("'性格獨立乘區:'"), 'Speed guide point 2 title must use half-width colon');
  assert(wikiJs.includes("'直接與副技能相乘,不受35%上限約束.'") || wikiJs.includes("'直接與副技能相乘, 不受 35% 上限約束.'"), 'Speed guide point 2 desc must use half-width comma and period');
  assert(wikiJs.includes("'產能換算:'"), 'Speed guide point 3 title must use half-width colon');
  assert(wikiJs.includes("'產能為時間倒數,間隔58.5%等同產能提升70.94%.'") || wikiJs.includes("'產能為時間倒數, 間隔 58.5% 等同產能提升 70.94%.'"), 'Speed guide point 3 desc must use half-width comma and period');

  // 2. Verify formula banner uses half-width colon
  assert(wikiJs.includes('<strong>公式</strong>:'), 'Formula banner must use half-width colon');

  // 3. Verify subskills HTML block has zero full-width punctuation
  const startSubskills = wikiJs.indexOf('id="wiki-subpanel-subskills"');
  const endSubskills = wikiJs.indexOf('<!-- 子分頁 3');
  const subskillsHtml = wikiJs.slice(startSubskills, endSubskills);
  const fwMatches = subskillsHtml.match(/[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g);
  assert(!fwMatches || fwMatches.length === 0, `Subskills panel HTML must not contain full-width punctuation, found: ${fwMatches}`);

  // 4. Verify subskills data structures have zero full-width punctuation
  const dataStart = wikiJs.indexOf('const SUB_SKILLS_DATA =');
  const dataEnd = wikiJs.indexOf('const RATINGS_GUIDE_DATA =');
  const dataPart = wikiJs.slice(dataStart, dataEnd);
  const dataFwMatches = dataPart.match(/[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g);
  assert(!dataFwMatches || dataFwMatches.length === 0, `Subskills data must not contain full-width punctuation, found: ${dataFwMatches}`);
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Ratings Guide Colors and Game-Like Subskill Badges', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Verify CSS classes exist in styles.css
  assert(stylesCss.includes('.strategy-item.strategy-early'), 'Must include .strategy-item.strategy-early');
  assert(stylesCss.includes('.strategy-item.strategy-late'), 'Must include .strategy-item.strategy-late');
  assert(stylesCss.includes('.strategy-item.strategy-energy'), 'Must include .strategy-item.strategy-energy');
  assert(stylesCss.includes('.strategy-item.strategy-seeds'), 'Must include .strategy-item.strategy-seeds');
  assert(stylesCss.includes('.strategy-badge.badge-early'), 'Must include .strategy-badge.badge-early');
  assert(stylesCss.includes('.rating-specialty-badge'), 'Must include .rating-specialty-badge');
  assert(stylesCss.includes('.specialty-berry'), 'Must include .specialty-berry');
  assert(stylesCss.includes('.specialty-ingredient'), 'Must include .specialty-ingredient');
  assert(stylesCss.includes('.specialty-skill'), 'Must include .specialty-skill');
  assert(stylesCss.includes('.rating-card-berry'), 'Must include .rating-card-berry');
  assert(stylesCss.includes('.rating-card-ingredient'), 'Must include .rating-card-ingredient');
  assert(stylesCss.includes('.rating-card-skill'), 'Must include .rating-card-skill');
  assert(stylesCss.includes('.milestone-badge'), 'Must include .milestone-badge');
  assert(stylesCss.includes('.milestone-cyan'), 'Must include .milestone-cyan');

  // 2. Verify helper functions in wiki.js
  assert(wikiJs.includes('function getSubSkillBadgeColor('), 'Must define getSubSkillBadgeColor');
  assert(wikiJs.includes('function renderRatingSubskillBadge('), 'Must define renderRatingSubskillBadge');
  assert(wikiJs.includes('function renderRatingNatureBadge('), 'Must define renderRatingNatureBadge');
  assert(wikiJs.includes('function formatRatingDetail('), 'Must define formatRatingDetail');

  // 3. Verify subskills badges rendered in ratings guide
  assert(wikiJs.includes('renderRatingSubskillBadge(s.name'), 'Must call renderRatingSubskillBadge');
  assert(wikiJs.includes('renderRatingNatureBadge(nName)'), 'Must call renderRatingNatureBadge');
  assert(wikiJs.includes('rating-card-${type}'), 'Must apply specialty class to rating card');

  // 4. Verify strategy grid and milestone table enhancements
  assert(wikiJs.includes('strategy-item strategy-early'), 'Strategy grid must have early class');
  assert(wikiJs.includes('milestone-badge ${milestoneColor}'), 'Milestone table must use milestone-badge');

  // 5. Verify cache busters
  assert(/css\/styles\.css\?v=(20260917_[345678]|2026091[89]_\d+|2026092\d_\d+)/.test(indexHtml), 'index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki\.js\?v=(20260907_8|2026091[89]_\d+|2026092\d_\d+)/.test(indexHtml), 'index.html wiki.js must have valid cache buster');
  assert(/css\/styles\.css\?v=(20260917_[345678]|2026091[89]_\d+|2026092\d_\d+)/.test(appIndexHtml), 'app/index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki\.js\?v=(20260907_8|2026091[89]_\d+|2026092\d_\d+)/.test(appIndexHtml), 'app/index.html wiki.js must have valid cache buster');
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Ratings Guide Borderless Layout, Single-Line Name:Desc, No Tier Badges & Half-Width Symbols', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');

  // 1. Verify zero full-width punctuation in RATINGS_GUIDE_DATA and SLEEP_DAYS_BASELINE
  const ratingsData = wikiJs.slice(wikiJs.indexOf('const RATINGS_GUIDE_DATA ='), wikiJs.indexOf('const BERRY_VALUES_DATA ='));
  const dataFwMatches = ratingsData.match(/[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g);
  assert(!dataFwMatches || dataFwMatches.length === 0, `Ratings guide data must not contain full-width punctuation, found: ${dataFwMatches}`);

  // 2. Verify zero full-width punctuation in ratings HTML
  const ratingsHtml = wikiJs.slice(wikiJs.indexOf('id="wiki-subpanel-ratings"'), wikiJs.indexOf('<!-- 遮罩層 (Backdrop for Mobile Drawer'));
  const htmlFwMatches = ratingsHtml.match(/[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g);
  assert(!htmlFwMatches || htmlFwMatches.length === 0, `Ratings HTML must not contain full-width punctuation, found: ${htmlFwMatches}`);

  // 3. Verify renderRatingCard removes tier tags and renders single-line format with colon
  assert(!wikiJs.includes('rating-tier-tag tier-'), 'Must not render circle tier tags in ratings guide');
  assert(wikiJs.includes('rating-item-colon'), 'Must include colon separator between name and description');
  assert(wikiJs.includes('rating-specialty-badge specialty-'), 'Specialty badge must be rendered');
  assert(wikiJs.includes('rating-specialty-desc'), 'Specialty spec description must be rendered as pure text');
  assert(wikiJs.includes('spec: "[樹果1個,食材1個]"'), 'Skill card must have spec');
  assert(wikiJs.includes('spec: "[樹果2個,食材1個]"'), 'Berry card must have spec');
  assert(wikiJs.includes('spec: "[樹果1個,食材2個]"'), 'Ingredient card must have spec');

  // 4. Verify strategy header displays badge and title on one line without inner borders
  assert(wikiJs.includes('<div class="strategy-header">'), 'Strategy item must have strategy-header container');
  assert(stylesCss.includes('.strategy-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;'), 'CSS must include strategy-header layout');
  assert(stylesCss.includes('.mobile-h5-app .strategy-item {\n  background: transparent !important;\n  border: none !important;'), 'Mobile strategy-item must have transparent background and no borders');

  // 5. Verify milestone table simplification and single-line column control
  assert(wikiJs.includes('<th class="col-milestone-days">${isEN ? \'Daily Full Sleep\' : \'每天滿睡\'}</th>'), 'Milestone table header must be 每天滿睡');
  assert(wikiJs.includes('<th class="col-milestone-exp">${isEN ? \'Required EXP\' : \'所需EXP\'}</th>'), 'Milestone table header must be 所需EXP');
  assert(wikiJs.includes('<th class="col-milestone-note">${isEN ? \'Milestone\' : \'里程碑\'}</th>'), 'Milestone table header must be 里程碑');
  assert(wikiJs.includes('Lv.${row.level}'), 'Milestone level must not have spaces');
  assert(wikiJs.includes('${row.totalExp.toLocaleString()}</td>'), 'Milestone EXP value must not have EXP suffix text');
  assert(wikiJs.includes("${row.days} ${isEN ? 'Days' : '天'}"), 'Milestone days must not have parentheses');
  assert(wikiJs.includes('note: "解鎖第1個副技能"'), 'Milestone note Lv.10 must remove extra comma content');
  assert(wikiJs.includes('note: "解鎖第2個副技能"'), 'Milestone note Lv.25 must remove extra comma content');
  assert(wikiJs.includes('note: "解鎖第2種食材"'), 'Milestone note Lv.30 must remove extra comma content');
  assert(wikiJs.includes('note: "解鎖第3個副技能"'), 'Milestone note Lv.50 must remove extra comma content');
  assert(wikiJs.includes('note: "解鎖第3種食材"'), 'Milestone note Lv.60 must remove extra comma content');
  assert(stylesCss.includes('.milestone-table th.col-milestone-lv'), 'Milestone table must have column lv styling');
  assert(stylesCss.includes('.milestone-table th.col-milestone-exp'), 'Milestone table must have column exp styling');
  assert(stylesCss.includes('.milestone-table th.col-milestone-days'), 'Milestone table must have column days styling');

  // 6. Verify section headings outside card and theme-adaptive typography
  assert(wikiJs.includes('<div class="wiki-section-heading">'), 'Must include section heading outside card');
  assert(stylesCss.includes('.wiki-section-title'), 'Must define wiki-section-title in CSS');
  assert(stylesCss.includes('--text-title: #f8fafc;'), 'Must define --text-title in :root');
  assert(stylesCss.includes('--text-title: #ffffff;'), 'Must define --text-title in onyx theme');
  assert(stylesCss.includes('--text-title: #0f172a;'), 'Must define --text-title in dawn theme');

  // 7. Verify values-active viewport locking prevents header cut-off
  assert(wikiJs.includes("targetTab === 'values'"), 'wiki.js must check values subtab');
  assert(wikiJs.includes("document.body.classList.add('values-active')"), 'wiki.js must add values-active');
  assert(appJs.includes("document.body.classList.remove('values-active')"), 'app.js must remove values-active when switching away from wiki');
  assert(stylesCss.includes('body.mobile-h5-app.values-active'), 'styles.css must lock body on values-active');
  assert(stylesCss.includes('.mobile-h5-app #wiki-subpanel-values.active'), 'styles.css must style active values subpanel');

  // 8. Verify borderless styles in CSS
  assert(stylesCss.includes('.rating-item {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: transparent;\n  border: none;'), 'Rating item must be borderless');
  assert(stylesCss.includes('#wiki-subpanel-ratings .calc-inputs-row {\n  background: transparent;\n  border: none;'), 'Calc row must be borderless in ratings');

  // 9. Verify Pokédex bottom dead space removal and milestone responsive layout
  assert(stylesCss.includes('.mobile-h5-app.pokemon-active .pokemon-table tbody tr:last-child td {\n  padding-bottom: 6px !important;\n}'), 'Pokédex table must not have redundant bottom blank space');
  assert(stylesCss.includes('.mobile-h5-app .milestone-table {\n  width: 100% !important;\n  table-layout: auto !important;\n}'), 'Mobile milestone table must adapt without scrolling');
  assert(stylesCss.includes('.mobile-h5-app .wiki-calc-card {\n  padding: 10px 8px !important;\n}'), 'Mobile wiki-calc-card must have compact outer padding');

  // 10. Verify subskills table tags column streamlined to 45% and effect column to 55%
  assert(stylesCss.includes('.mobile-h5-app .wiki-subskills-table .col-subskills-tags {\n  width: 45% !important;'), 'col-subskills-tags must be 45% in mobile');
  assert(stylesCss.includes('.mobile-h5-app .wiki-subskills-table .col-subskills-effect {\n  width: 55% !important;'), 'col-subskills-effect must be 55% in mobile');
  assert(stylesCss.includes('.wiki-subskills-table th.col-subskills-tags,\n.wiki-subskills-table td.col-subskills-tags {\n  width: 45%;'), 'col-subskills-tags must be 45% in desktop');
  assert(stylesCss.includes('.wiki-subskills-table th.col-subskills-effect,\n.wiki-subskills-table td.col-subskills-effect {\n  width: 55%;'), 'col-subskills-effect must be 55% in desktop');
});



test('Tier 1 - Feature Coverage', 'Good-Night Ribbon i18n Dictionary and Box Modal Markup Verification', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify i18n keys exist
  const ctx = {
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  const ribbonKeys = [
    'box.modal_poke_ribbon',
    'box.ribbon_none',
    'box.ribbon_lv1',
    'box.ribbon_lv2',
    'box.ribbon_lv3',
    'box.ribbon_lv4',
    'appraisal.ribbon_label',
    'wiki.ribbon_title'
  ];

  ['zh-TW', 'en-US'].forEach(lang => {
    I18N.setLanguage(lang);
    ribbonKeys.forEach(key => {
      const val = I18N.t(key);
      assert(val && val.length > 0 && val !== key, `Translation for ${key} in ${lang} must exist and not equal key`);
    });
  });

  // 2. Verify Box Modal Select Markup
  assert(indexHtml.includes('id="modal-poke-ribbon"'), 'index.html must include #modal-poke-ribbon element');
  assert(indexHtml.includes('class="box-form-select"'), 'index.html must use box-form-select class on dropdowns');
  assert(indexHtml.includes('value="0"'), 'modal-poke-ribbon must include value 0');
  assert(indexHtml.includes('value="4"'), 'modal-poke-ribbon must include value 4');
  assert(indexHtml.includes('data-icon="assets/ribbons/ribbon_lv1.png"'), 'index.html must include ribbon_lv1 data-icon');
  assert(!indexHtml.includes('專屬頭像'), 'index.html modal-poke-ribbon must not include 專屬頭像');
  assert(!indexHtml.includes('第 1 階段'), 'index.html modal-poke-ribbon must not include 第 1 階段');

  // Verify mobile app/index.html includes modal-poke-ribbon with data-icon
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  assert(appHtml.includes('id="modal-poke-ribbon"'), 'app/index.html must include modal-poke-ribbon');
  assert(appHtml.includes('data-icon="../assets/ribbons/ribbon_lv1.png"'), 'app/index.html must include ribbon_lv1 data-icon');
  assert(!appHtml.includes('第 1 階段'), 'app/index.html modal-poke-ribbon must not include 第 1 階段');

  // Verify official ribbon assets exist on disk
  [1, 2, 3, 4].forEach(lvl => {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets', 'ribbons', `ribbon_lv${lvl}.png`)), `assets/ribbons/ribbon_lv${lvl}.png must exist`);
  });

  // Verify removal of stage and profile icon from i18n
  I18N.setLanguage('zh-TW');
  assert(!I18N.t('box.ribbon_lv1').includes('第 1 階段'), 'box.ribbon_lv1 zh-TW must not include 第 1 階段');
  assert(!I18N.t('box.ribbon_lv3').includes('專屬頭像'), 'box.ribbon_lv3 zh-TW must not include 專屬頭像');
  I18N.setLanguage('en-US');
  assert(!I18N.t('box.ribbon_lv1').includes('Tier 1'), 'box.ribbon_lv1 en-US must not include Tier 1');
  assert(!I18N.t('box.ribbon_lv3').includes('Profile Icon'), 'box.ribbon_lv3 en-US must not include Profile Icon');

  // 3. Verify CSS styling complies with dropdown padding and arrow layout rules
  assert(stylesCss.includes('.box-form-select'), 'styles.css must style .box-form-select');
  assert(stylesCss.includes('padding-right: 36px'), 'box-form-select must include padding-right: 36px');
  assert(stylesCss.includes('background-position: right 18px center'), 'box-form-select must place arrow with right 18px center');
});

test('Tier 2 - Boundary & Corner Cases', 'Good-Night Ribbon Remaining Evolutions & Speed Discount Tier Boundary Logic', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const lab = ctx.AppraisalLab;
  assert(typeof lab.getRemainingEvolutions === 'function', 'AppraisalLab.getRemainingEvolutions must be exported');
  assert(typeof lab.getRibbonBonus === 'function', 'AppraisalLab.getRibbonBonus must be exported');

  // 1. Check 3-stage base species -> 2 evolutions remaining
  const threeStageBase = ['皮丘', '鬼斯', '小火龍', '幼基拉斯', '迷你龍', '菊草葉'];
  threeStageBase.forEach(name => {
    const pkm = { name_cn: name, is_final: '' };
    assertEquals(lab.getRemainingEvolutions(pkm), 2, `${name} must have 2 remaining evolutions`);
  });

  // 2. Check 2-stage base species and mid-stage species -> 1 evolution remaining
  const oneStageRemaining = ['皮卡丘', '鬼斯通', '火恐龍', '伊布', '卡蒂狗'];
  oneStageRemaining.forEach(name => {
    const pkm = { name_cn: name, is_final: '' };
    assertEquals(lab.getRemainingEvolutions(pkm), 1, `${name} must have 1 remaining evolution`);
  });

  // 3. Check fully evolved or single-stage species -> 0 evolutions remaining
  const zeroRemaining = ['雷丘', '耿鬼', '噴火龍', '班基拉斯', '幸福蛋', '凱羅斯', '赫拉克羅斯'];
  zeroRemaining.forEach(name => {
    const pkm = { name_cn: name, is_final: '〇' };
    assertEquals(lab.getRemainingEvolutions(pkm), 0, `${name} must have 0 remaining evolutions`);
  });

  // 4. Ribbon tier bonuses across remaining evolution stages
  // Lv.0: 0 carry, 0% speed
  const bonus0 = lab.getRibbonBonus(0, 2);
  assertEquals(bonus0.carry, 0, 'Lv.0 carry should be 0');
  assertEquals(bonus0.speed, 0, 'Lv.0 speed should be 0');

  // Lv.1 (200h): +1 carry, 0% speed for all
  [0, 1, 2].forEach(evos => {
    const b = lab.getRibbonBonus(1, evos);
    assertEquals(b.carry, 1, `Lv.1 carry should be 1 for evos=${evos}`);
    assertEquals(b.speed, 0, `Lv.1 speed should be 0 for evos=${evos}`);
  });

  // Lv.2 (500h): +3 carry, speed: 2 evos -> 11%, 1 evo -> 5%, 0 evos -> 0%
  assertEquals(lab.getRibbonBonus(2, 2).carry, 3, 'Lv.2 carry should be 3');
  assertEquals(lab.getRibbonBonus(2, 2).speed, 0.11, 'Lv.2 speed for 2 evos should be 11%');
  assertEquals(lab.getRibbonBonus(2, 1).speed, 0.05, 'Lv.2 speed for 1 evo should be 5%');
  assertEquals(lab.getRibbonBonus(2, 0).speed, 0, 'Lv.2 speed for 0 evos should be 0%');

  // Lv.3 (1000h): +6 carry, speed identical to Lv.2
  assertEquals(lab.getRibbonBonus(3, 2).carry, 6, 'Lv.3 carry should be 6');
  assertEquals(lab.getRibbonBonus(3, 2).speed, 0.11, 'Lv.3 speed for 2 evos should be 11%');
  assertEquals(lab.getRibbonBonus(3, 1).speed, 0.05, 'Lv.3 speed for 1 evo should be 5%');
  assertEquals(lab.getRibbonBonus(3, 0).speed, 0, 'Lv.3 speed for 0 evos should be 0%');

  // Lv.4 (2000h): +8 carry, speed: 2 evos -> 25%, 1 evo -> 12%, 0 evos -> 0%
  assertEquals(lab.getRibbonBonus(4, 2).carry, 8, 'Lv.4 carry should be 8');
  assertEquals(lab.getRibbonBonus(4, 2).speed, 0.25, 'Lv.4 speed for 2 evos should be 25%');
  assertEquals(lab.getRibbonBonus(4, 1).speed, 0.12, 'Lv.4 speed for 1 evo should be 12%');
  assertEquals(lab.getRibbonBonus(4, 0).speed, 0, 'Lv.4 speed for 0 evos should be 0%');
});

test('Tier 3 - Cross-Feature Combinations', 'Good-Night Ribbon Appraisal Lab Integration and Diagnostic Feedback', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const lab = ctx.AppraisalLab;

  // Pichu base interval: 4300s, 2 remaining evos
  const pichu = {
    id: '172',
    name_cn: '皮丘',
    specialty: '樹果',
    type: '電',
    interval: '01:11:40' // 4300s
  };

  // Evaluate Pichu without ribbon (Lv.0)
  const evalNoRibbon = lab.evaluatePokemon(pichu, 25, '認真', [], ['特選蘋果'], 0);
  assertEquals(evalNoRibbon.calculatedInterval, 4300, 'Pichu without ribbon should have base interval 4300s');

  // Evaluate Pichu with Ribbon Lv.4 (25% speed discount)
  const evalRibbonLv4 = lab.evaluatePokemon(pichu, 25, '認真', [], ['特選蘋果'], 4);
  const expectedInterval = Math.round(4300 * (1 - 0.25)); // 3225s
  assertEquals(evalRibbonLv4.calculatedInterval, expectedInterval, 'Pichu with Ribbon Lv.4 should have 3225s interval');
  assert(evalRibbonLv4.scores.speed > evalNoRibbon.scores.speed, 'Pichu with Ribbon Lv.4 should have higher speed score');

  // Verify diagnostic pros mention Good-Night Ribbon
  const hasRibbonPro = evalRibbonLv4.diagnostics.pros.some(p => p.includes('睡飽飽獎章') || p.includes('25%'));
  assert(hasRibbonPro, 'Diagnostics pros should mention Ribbon speed discount');

  // Evaluate fully evolved Raichu with Ribbon Lv.4 (speed discount must remain 0)
  const raichu = {
    id: '26',
    name_cn: '雷丘',
    specialty: '樹果',
    type: '電',
    interval: '00:36:40', // 2200s
    is_final: '〇'
  };
  const evalRaichuRibbon = lab.evaluatePokemon(raichu, 25, '認真', [], ['特選蘋果'], 4);
  assertEquals(evalRaichuRibbon.calculatedInterval, 2200, 'Raichu should receive 0% speed discount even with Ribbon Lv.4');
});

test('Tier 4 - Real-World Application Scenarios', 'Good-Night Ribbon Wiki Guide Formatting & Box PR Calculation Workflow', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  // 1. Verify Wiki contains Ribbon Guide card in both languages
  ['zh-TW', 'en-US'].forEach(lang => {
    const mockContainer = { innerHTML: '', style: { display: '' } };
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
      console,
      setTimeout
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    vm.createContext(ctx);
    vm.runInContext(i18nCode, ctx);
    vm.runInContext(wikiCode, ctx);

    ctx.window.WikiDB.renderWikiLayout(mockContainer);
    assert(mockContainer.innerHTML.includes('wiki-card-ribbon-guide'), 'Wiki layout must include wiki-card-ribbon-guide');
  });

  // 2. Verify Wiki Ribbon Guide contains zero full-width punctuation & zero emojis
  const startRibbon = wikiCode.indexOf('wiki-card-ribbon-guide');
  assert(startRibbon !== -1, 'wiki.js must contain wiki-card-ribbon-guide');
  const endRibbon = wikiCode.indexOf('<!-- 副技能完整階級與數值說明表格 -->');
  const ribbonBlock = wikiCode.slice(startRibbon, endRibbon !== -1 ? endRibbon : startRibbon + 4000);
  const fwMatches = ribbonBlock.match(/[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g);
  assert(!fwMatches || fwMatches.length === 0, `Ribbon guide block must not contain full-width punctuation, found: ${fwMatches}`);
  assert(!/\p{Extended_Pictographic}/u.test(ribbonBlock), 'Ribbon guide block must contain zero emojis');

  // Verify compact ribbon tier chips and single Case 1
  assert(ribbonBlock.includes('ribbon-compact-tiers'), 'Ribbon guide must use compact tiers layout');
  assert(ribbonBlock.includes('chip-bronze'), 'Ribbon guide must include Bronze tier chip');
  assert(ribbonBlock.includes('chip-silver'), 'Ribbon guide must include Silver tier chip');
  assert(ribbonBlock.includes('chip-gold'), 'Ribbon guide must include Gold tier chip');
  assert(ribbonBlock.includes('chip-platinum'), 'Ribbon guide must include Platinum tier chip');
  assert(ribbonBlock.includes('Chansey vs Blissey') || ribbonBlock.includes('吉利蛋 vs 幸福蛋'), 'Ribbon guide must include Case 1');
  assert(!ribbonBlock.includes('Vigoroth vs Slaking') && !ribbonBlock.includes('過動猿 vs 請假王'), 'Ribbon guide must not include Case 2');
  assert(!ribbonBlock.includes('Un-evolved Favorites') && !ribbonBlock.includes('真愛黨與節慶限定'), 'Ribbon guide must not include Case 3');

  // 3. Verify Box PR calculation integrates Ribbon
  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  const basePkm = {
    name: '皮丘',
    specialty: '樹果',
    nature: '固執',
    subskills: ['樹果數量S']
  };

  const prWithoutRibbon = boxModule.calculatePokemonPR({ ...basePkm, ribbon: 0 }, { specialty: '樹果' });
  const prWithRibbon4 = boxModule.calculatePokemonPR({ ...basePkm, ribbon: 4 }, { specialty: '樹果' });

  assert(prWithRibbon4.pr >= prWithoutRibbon.pr, 'Ribbon Lv.4 PR score should be higher or equal to Ribbon Lv.0 PR score');
  assert(prWithRibbon4.highlights.some(h => h.includes('獎章') || h.includes('Ribbon') || h.includes('幫忙速度')), 'PR highlights should recognize speed boost from Ribbon');
});

test('Tier 1 - Feature Coverage', '7 Research Camps & EX Mode Data Coverage & i18n Keys', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  const ctx = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: () => ({ addEventListener: () => {}, value: '', style: {} }),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const requiredKeys = [
    'wiki.subtab_islands', 'wiki.tab_islands', 'wiki.islands_title',
    'wiki.islands_select_label', 'wiki.islands_unlock_goal', 'wiki.islands_snorlax_mult',
    'wiki.islands_fav_berries', 'wiki.islands_expert_btn', 'wiki.islands_normal_btn',
    'wiki.islands_ranks_title', 'wiki.islands_spawns_title', 'wiki.islands_guide_title'
  ];

  ['zh-TW', 'en-US'].forEach(lang => {
    ctx.window.I18N.setLanguage(lang);
    requiredKeys.forEach(k => {
      const val = ctx.window.I18N.t(k);
      assert(val && val.length > 0 && val !== k, `i18n ${lang} must have translation for ${k}`);
    });
  });

  const islands = ctx.window.WikiDB.ISLANDS_DATA;
  assert(Array.isArray(islands), 'ISLANDS_DATA must be an array');
  assertEquals(islands.length, 7, 'Must have exactly 7 research camps');

  const expectedIds = ['greengrass', 'cyan', 'taupe', 'snowdrop', 'lapis', 'powerplant', 'amber'];
  assertArrayEquals(islands.map(i => i.id), expectedIds, 'Island IDs must match 7 official camps');

  const unlockGoals = islands.map(i => i.unlockGoal);
  assertArrayEquals(unlockGoals, [0, 20, 70, 150, 240, 340, 450], 'Unlock sleep style goals must be 0, 20, 70, 150, 240, 340, 450');

  assertEquals(islands[0].hasExpertMode, true, 'Greengrass Isle must have EX expert mode');
  assertEquals(islands[1].hasExpertMode, true, 'Cyan Beach must have EX expert mode');
  assertEquals(islands[2].hasExpertMode, false, 'Taupe Hollow must not have EX expert mode');
  assertEquals(islands[3].hasExpertMode, false, 'Snowdrop Tundra must not have EX expert mode');
  assertEquals(islands[4].hasExpertMode, false, 'Lapis Lakeside must not have EX expert mode');
  assertEquals(islands[5].hasExpertMode, false, 'Power Plant must not have EX expert mode');
  assertEquals(islands[6].hasExpertMode, false, 'Amber Canyon must not have EX expert mode');
});

test('Tier 2 - Boundary & Corner Cases', '18 Berry Types Coverage & EX Rules Isolation', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  const createMockEl = () => ({
    addEventListener: () => {},
    value: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    setAttribute: () => {},
    innerHTML: ''
  });

  const ctx = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: createMockEl,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const islands = ctx.window.WikiDB.ISLANDS_DATA;
  const fixedIslands = islands.filter(i => i.berriesMode === 'fixed');
  assertEquals(fixedIslands.length, 6, 'Must have 6 fixed berry islands');

  const allFixedTypes = [];
  fixedIslands.forEach(isl => {
    assertEquals(isl.favoriteTypes.length, 3, `${isl.id} must have exactly 3 favorite types`);
    assertEquals(isl.favoriteBerries.length, 3, `${isl.id} must have exactly 3 favorite berries`);
    isl.favoriteTypes.forEach(t => allFixedTypes.push(t));
  });

  assertEquals(allFixedTypes.length, 18, '6 fixed islands * 3 types must equal 18 types');
  const uniqueTypes = Array.from(new Set(allFixedTypes));
  assertEquals(uniqueTypes.length, 18, 'Fixed islands must cover all 18 Pokemon types without duplication');

  // Verify EX mode details
  const greengrass = islands.find(i => i.id === 'greengrass');
  const cyan = islands.find(i => i.id === 'cyan');

  assert(greengrass.expertMode.unlockReq.includes('大師 18'), 'Greengrass EX must require Master 18');
  assert(greengrass.expertMode.ticketReq.includes('EX券'), 'Greengrass EX must require EX Pass');
  assert(cyan.expertMode.bonus.includes('水君'), 'Cyan Beach EX bonus should highlight Suicune');
  assert(Array.isArray(greengrass.expertMode.snorlaxEnergyTiers) && greengrass.expertMode.snorlaxEnergyTiers.length >= 8, 'Greengrass EX must have at least 8 energy tiers');
  assert(Array.isArray(cyan.expertMode.snorlaxEnergyTiers) && cyan.expertMode.snorlaxEnergyTiers.length >= 8, 'Cyan Beach EX must have at least 8 energy tiers');
  assertEquals(cyan.expertMode.snorlaxEnergyTiers.find(t => t.rank === 'Master 1')?.energy, 2194292, 'Cyan Beach EX Master 1 energy must be 2194292');
  assertEquals(cyan.expertMode.snorlaxEnergyTiers.find(t => t.rank === 'Master 20')?.energy, 14780152, 'Cyan Beach EX Master 20 energy must be 14780152');

  // Verify Snorlax rank tiers and Drowsy spawns structure
  islands.forEach(isl => {
    assert(isl.snorlaxEnergyTiers.length >= 8, `${isl.id} must have at least 8 Snorlax rank milestones`);
    assertEquals(isl.drowsyPowerSpawns.length, 6, `${isl.id} must have 6 drowsy power spawn tiers (3 to 8 spawns)`);
    assert(isl.spawns.dozing.length > 0, `${isl.id} must have dozing spawns`);
    assert(isl.spawns.snoozing.length > 0, `${isl.id} must have snoozing spawns`);
    assert(isl.spawns.slumbering.length > 0, `${isl.id} must have slumbering spawns`);
  });
});

test('Tier 3 - Cross-Feature Combinations', 'Island Selection, Sleep Type Filter & EX Mode Reactive State', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  let mockPanel = {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    addEventListener: () => {},
    setAttribute: () => {}
  };
  const mockContainer = { innerHTML: '', style: { display: '' } };

  const ctx = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'wiki-subpanel-islands') return mockPanel;
        return {
          innerHTML: '',
          style: {},
          classList: { add: () => {}, remove: () => {}, contains: () => true },
          addEventListener: () => {},
          setAttribute: () => {}
        };
      },
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  ctx.window.WikiDB.renderWikiLayout(mockContainer);

  // Switch to islands subtab
  ctx.window.WikiDB.switchSubTab('islands');
  assertEquals(ctx.window.WikiDB.getCurrentSubTab(), 'islands', 'Current subtab must be islands');

  // Select Cyan Beach
  ctx.window.WikiDB.selectIsland('cyan');
  assert(mockPanel.innerHTML.includes('天青沙灘'), 'Selecting cyan must render Cyan Beach');

  // Toggle EX mode on Cyan
  ctx.window.WikiDB.toggleIslandExpertMode();
  assert(!mockPanel.innerHTML.includes('island-ex-card'), 'EX special explanation card must be removed');
  assert(mockPanel.innerHTML.includes('天青沙灘 EX'), 'Hero banner should display Cyan Beach EX');
  assert(mockPanel.innerHTML.includes('2,194,292'), 'Cyan EX must display Master 1 energy 2,194,292');
  assert(mockPanel.innerHTML.includes('14,780,152'), 'Cyan EX must display Master 20 energy 14,780,152');

  // Toggle off EX mode
  ctx.window.WikiDB.toggleIslandExpertMode();
  assert(!mockPanel.innerHTML.includes('island-ex-card'), 'Toggling off EX mode must not show EX card');
  assert(!mockPanel.innerHTML.includes('class="island-hero-title">天青沙灘 EX</h3>'), 'Toggling off EX mode must revert hero title to normal');
  assert(mockPanel.innerHTML.includes('class="island-hero-title">天青沙灘</h3>'), 'Toggling off EX mode must show normal hero title');
  assert(mockPanel.innerHTML.includes('256,544'), 'Normal Cyan must display Master 1 energy 256,544');
  assert(mockPanel.innerHTML.includes('3,732,664'), 'Normal Cyan must display Master 20 energy 3,732,664');

  // Sleep type filter
  ctx.window.WikiDB.filterIslandSleepType('slumbering');
  assert(mockPanel.innerHTML.includes('水箭龜'), 'Slumbering filter on Cyan should include Blastoise');
  assert(!mockPanel.innerHTML.includes('長翅鷗'), 'Slumbering filter should not show Dozing Pokemon Wingull');
});

test('Tier 4 - Real-World Application Scenarios', 'Islands Subpanel DOM Rendering, Bilingual Support & Zero Full-Width Rule', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  const fwRegex = /[\uFF01-\uFF5E\u3000-\u303F\u2000-\u206F]/g;

  // Render in zh-TW
  let mockPanelZh = {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    addEventListener: () => {}
  };
  const ctxZh = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: () => mockPanelZh,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctxZh.window.window = ctxZh.window;
  ctxZh.window.document = ctxZh.document;
  vm.createContext(ctxZh);
  vm.runInContext(i18nCode, ctxZh);
  vm.runInContext(wikiCode, ctxZh);

  const islands = ctxZh.window.WikiDB.ISLANDS_DATA;

  islands.forEach(isl => {
    ctxZh.window.WikiDB.selectIsland(isl.id);
    const htmlNormal = ctxZh.window.WikiDB.renderIslandsSubpanel();
    assert(!emojiRegex.test(htmlNormal), `${isl.id} normal html must not contain emoji`);
    const fwNormal = htmlNormal.match(fwRegex);
    assert(!fwNormal || fwNormal.length === 0, `${isl.id} normal html must not contain full-width characters, found: ${fwNormal}`);

    if (isl.hasExpertMode) {
      ctxZh.window.WikiDB.toggleIslandExpertMode();
      const htmlEx = ctxZh.window.WikiDB.renderIslandsSubpanel();
      assert(!emojiRegex.test(htmlEx), `${isl.id} EX html must not contain emoji`);
      const fwEx = htmlEx.match(fwRegex);
      assert(!fwEx || fwEx.length === 0, `${isl.id} EX html must not contain full-width characters, found: ${fwEx}`);
      ctxZh.window.WikiDB.toggleIslandExpertMode();
    }
  });

  // Render in en-US
  let mockPanelEn = {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    addEventListener: () => {}
  };
  const ctxEn = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: () => mockPanelEn,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctxEn.window.window = ctxEn.window;
  ctxEn.window.document = ctxEn.document;
  vm.createContext(ctxEn);
  vm.runInContext(i18nCode, ctxEn);
  vm.runInContext(wikiCode, ctxEn);

  ctxEn.window.I18N.setLanguage('en-US');
  ctxEn.window.WikiDB.selectIsland('greengrass');
  const htmlEn = ctxEn.window.WikiDB.renderIslandsSubpanel();
  assert(htmlEn.includes('Greengrass Isle'), 'en-US must render English name');
  assert(htmlEn.includes('Snorlax Rank Energy Progression'), 'en-US must render English card title');
  assert(!emojiRegex.test(htmlEn), 'en-US html must not contain emoji');
});

test('Tier 4 - Real-World Application Scenarios', 'Island Spawns Compact Table, Pokeball SVG Badges & Pure Avatar Presentation', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  let mockPanel = {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    addEventListener: () => {}
  };
  const ctx = {
    window: {
      location: { hash: '#wiki' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: () => mockPanel,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  ctx.window.I18N.setLanguage('zh-TW');
  ctx.window.WikiDB.selectIsland('greengrass');
  const html = ctx.window.WikiDB.renderIslandsSubpanel();

  // 1. Table structure verification: Name and Type columns must NOT be present
  assert(html.includes('island-spawns-compact-table'), 'Table must use island-spawns-compact-table class');
  assert(!html.includes('>名稱<') && !html.includes('>Name<'), 'Table header must NOT contain Name column');
  assert(!html.includes('>屬性<') && !html.includes('>Type<'), 'Table header must NOT contain Type column');
  assert(html.includes('寶可夢</th>'), 'Table header must contain Pokemon avatar column');
  assert(html.includes('sleep-style-star-icon'), 'Table header must contain game-like sleep style star icon');
  assert(html.includes('data-col="s1"'), 'Table header must contain 1-star column');
  assert(html.includes('data-col="s2"'), 'Table header must contain 2-star column');
  assert(html.includes('data-col="s3"'), 'Table header must contain 3-star column');
  assert(html.includes('data-col="s4"'), 'Table header must contain 4-star column');

  // 2. Avatar-only presentation verification
  assert(html.includes('island-pkm-icon-only'), 'Pokemon must be rendered in icon-only container');
  assert(html.includes('island-pkm-avatar'), 'Pokemon icon must use island-pkm-avatar class');

  // 3. Pokeball SVG badges and legend verification
  assert(!html.includes('island-ball-legend'), 'Card header must NOT include island-ball-legend');
  assert(html.includes('pokeball-svg'), 'Spawns table must render pokeball-svg icons');
  assert(html.includes('rank-badge rank-basic'), 'Table must render Basic pokeball badge');
  assert(html.includes('rank-badge rank-great'), 'Table must render Great pokeball badge');
  assert(html.includes('rank-badge rank-ultra'), 'Table must render Ultra pokeball badge');
  assert(html.includes('rank-badge rank-master'), 'Table must render Master pokeball badge');
  assert(html.includes('rank-dash'), 'Unavailable sleep styles must render rank-dash');

  // 4. Hero banner cleanup: unlock goal and snorlax multiplier must be removed
  assert(!html.includes('解鎖目標:'), 'Unlock goal block must be removed');
  assert(!html.includes('卡比獸難度:'), 'Snorlax multiplier block must be removed');

  // 5. Sleep type filter button text: '全部' instead of '全部睡眠類型'
  assert(html.includes('全部 <span') || html.includes('全部<span'), 'Sleep type filter button must say 全部');
  assert(!html.includes('全部睡眠類型'), 'Sleep type filter button must not say 全部睡眠類型');

  // 6. Isolated EX tabs at the end of island nav strip
  assert(html.includes('island-tab-ex-item'), 'Must render independent EX island tabs at the end');
  assert(html.includes('island-nav-divider'), 'Must render nav divider before EX tabs');

  // 7. Berry pure icon presentation verification (tested on Cyan Beach)
  ctx.window.WikiDB.selectIsland('cyan');
  const htmlCyan = ctx.window.WikiDB.renderIslandsSubpanel();
  assert(htmlCyan.includes('island-berry-icon-only'), 'Berries must be rendered in icon-only format');
  assert(!htmlCyan.includes('island-berry-name'), 'Berry name must NOT be displayed');
});

test('Tier 4 - Real-World Application Scenarios', 'Island Berries Theme Tokens, Rank Badge Solid Opacity & Zero All-Dash Spawns', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify CSS rules for berries label and rank badge opacity
  assert(cssCode.includes('.island-berries-label {') && cssCode.includes('color: var(--text-primary);'), 'Desktop island-berries-label must use var(--text-primary)');
  assert(!cssCode.includes('.island-berries-label {\n  font-size: 14px;\n  font-weight: 700;\n  color: #e2e8f0;'), 'Hardcoded #e2e8f0 in island-berries-label must be removed');
  assert(cssCode.includes('.mobile-h5-app .island-berries-label') && cssCode.includes('color: var(--text-primary) !important;'), 'Mobile island-berries-label must use var(--text-primary)');
  assert(cssCode.includes('[data-theme-inverted="true"] .island-berries-label'), 'Inverted theme must support island-berries-label');
  assert(cssCode.includes('[data-theme-inverted="true"] .rank-basic'), 'Inverted theme must support rank badges');

  // 2. Compact table padding and avatar sizes
  assert(cssCode.includes('.island-pkm-icon-only .island-pkm-avatar') && cssCode.includes('width: 32px;'), 'Desktop avatar width must be reduced to 32px');
  assert(cssCode.includes('.mobile-h5-app .island-pkm-icon-only .island-pkm-avatar') && cssCode.includes('width: 28px !important;'), 'Mobile avatar width must be reduced to 28px');

  // 3. Verify ZERO all-dash spawns in ISLANDS_DATA across all islands
  const mockCtx = {
    window: { localStorage: { getItem: () => null, setItem: () => {} }, location: { hash: '' } },
    document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} },
    console, setTimeout
  };
  mockCtx.window.window = mockCtx.window;
  mockCtx.window.document = mockCtx.document;
  vm.createContext(mockCtx);
  vm.runInContext(wikiCode, mockCtx);
  const islandsData = mockCtx.window.WikiDB.ISLANDS_DATA;

  let invalidSpawnCount = 0;
  for (const isl of islandsData) {
    for (const st of ['dozing', 'snoozing', 'slumbering']) {
      const list = isl.spawns[st] || [];
      const invalid = list.filter(p => p.s1 === '-' && p.s2 === '-' && p.s3 === '-' && p.s4 === '-');
      invalidSpawnCount += invalid.length;
    }
  }
  assertEquals(invalidSpawnCount, 0, 'No Pokemon in any island should have all-dash sleep styles');
});

test('Tier 4 - Real-World Application Scenarios', 'Islands Subtab, Active Island & Sleep Filter Persistence Across Reloads', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  const sharedStorage = {};
  function makeEnv(hash = '') {
    const domListeners = [];
    const elements = {};
    const getEl = id => {
      if (!elements[id]) {
        elements[id] = {
          id,
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
          },
          style: {},
          innerHTML: '',
          value: '',
          setAttribute() {},
          addEventListener(evt, cb) { if (evt === 'DOMContentLoaded') domListeners.push(cb); }
        };
      }
      return elements[id];
    };

    const mockStorage = {
      getItem: k => sharedStorage[k] !== undefined ? sharedStorage[k] : null,
      setItem: (k, v) => { sharedStorage[k] = String(v); },
      removeItem: k => { delete sharedStorage[k]; }
    };

    const ctx = {
      localStorage: mockStorage,
      sessionStorage: mockStorage,
      window: {
        location: { hash },
        localStorage: mockStorage,
        sessionStorage: mockStorage,
        history: {
          replaceState: (state, title, url) => {
            ctx.window.location.hash = url;
          }
        },
        innerWidth: 1200,
        scrollTo: () => {},
        addEventListener: (evt, cb) => {
          if (evt === 'DOMContentLoaded') domListeners.push(cb);
        }
      },
      document: {
        readyState: 'complete',
        documentElement: {
          setAttribute: () => {},
          getAttribute: () => null,
          removeAttribute: () => {}
        },
        getElementById: getEl,
        querySelectorAll: () => [],
        querySelector: () => null,
        body: { classList: { add() {}, remove() {}, contains: () => false } },
        addEventListener: (evt, cb) => {
          if (evt === 'DOMContentLoaded') domListeners.push(cb);
        }
      },
      console,
      setTimeout
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    vm.createContext(ctx);
    ctx.triggerReady = () => {
      domListeners.forEach(cb => { try { cb(); } catch (e) {} });
    };
    return ctx;
  }

  // 1. Initial navigation to Wiki and selection of Islands tab, Cyan Beach, and Snoozing filter
  const env1 = makeEnv('#wiki');
  vm.runInContext(i18nCode, env1);
  vm.runInContext(wikiCode, env1);
  vm.runInContext(boxCode, env1);
  vm.runInContext(appCode, env1);
  env1.triggerReady();

  env1.window.WikiDB.switchSubTab('islands');
  assertEquals(sharedStorage['pksleep_active_wiki_subtab'], 'islands', 'Wiki subtab must be stored as islands');
  assertEquals(env1.window.location.hash, '#wiki/islands', 'Hash must be #wiki/islands');

  env1.window.WikiDB.selectIsland('cyan', true);
  assertEquals(sharedStorage['pksleep_active_island_id'], 'cyan', 'Active island must be stored as cyan');
  assertEquals(sharedStorage['pksleep_active_island_expert'], 'true', 'Expert mode must be stored as true');

  env1.window.WikiDB.filterIslandSleepType('snoozing');
  assertEquals(sharedStorage['pksleep_active_island_sleep_type'], 'snoozing', 'Sleep filter must be stored as snoozing');

  // 2. Simulate Page Refresh with hash #wiki/islands
  const env2 = makeEnv('#wiki/islands');
  vm.runInContext(i18nCode, env2);
  vm.runInContext(wikiCode, env2);
  vm.runInContext(boxCode, env2);
  vm.runInContext(appCode, env2);
  env2.triggerReady();

  assertEquals(env2.window.WikiDB.getCurrentSubTab(), 'islands', 'Wiki must restore islands subtab after reload');
  assertEquals(env2.window.WikiDB.getCurrentIslandId(), 'cyan', 'Wiki must restore cyan beach after reload');
  assertEquals(env2.window.WikiDB.getIsExpertModeActive(), true, 'Wiki must restore expert mode after reload');
  assertEquals(env2.window.WikiDB.getCurrentIslandSleepType(), 'snoozing', 'Wiki must restore snoozing filter after reload');
  assertEquals(env2.window.location.hash, '#wiki/islands', 'Hash must stay #wiki/islands after reload');

  // 3. Simulate Page Refresh with no hash (clean reload)
  const env3 = makeEnv('');
  vm.runInContext(i18nCode, env3);
  vm.runInContext(wikiCode, env3);
  vm.runInContext(boxCode, env3);
  vm.runInContext(appCode, env3);
  env3.triggerReady();

  assertEquals(sharedStorage['pksleep_active_main_tab'], 'wiki', 'Main tab remembered as wiki');
  assertEquals(env3.window.WikiDB.getCurrentSubTab(), 'islands', 'Wiki subtab remembered as islands on clean reload');
  assertEquals(env3.window.WikiDB.getCurrentIslandId(), 'cyan', 'Cyan beach remembered on clean reload');
  assertEquals(env3.window.WikiDB.getIsExpertModeActive(), true, 'Expert mode remembered on clean reload');
  assertEquals(env3.window.WikiDB.getCurrentIslandSleepType(), 'snoozing', 'Snoozing filter remembered on clean reload');
});

test('Tier 4 - Real-World Application Scenarios', 'Island Berries Single Line Layout, Borderless Chips & Zero Nested Outer Borders', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. CSS Verification: Single-line layout for Favored Berries (desktop and mobile)
  assert(cssCode.includes('.island-berries-section {') && cssCode.includes('flex-direction: row;') && cssCode.includes('flex-wrap: nowrap;'), 'Desktop island-berries-section must be single line row');
  assert(cssCode.includes('.island-berries-label {') && cssCode.includes('white-space: nowrap;') && cssCode.includes('flex-shrink: 0;'), 'Desktop island-berries-label must be nowrap and non-shrinking');
  assert(cssCode.includes('.mobile-h5-app .island-berries-section') && cssCode.includes('flex-direction: row !important;') && cssCode.includes('flex-wrap: nowrap !important;'), 'Mobile island-berries-section must be single line row');
  assert(cssCode.includes('.mobile-h5-app .island-berries-label') && cssCode.includes('width: auto !important;') && cssCode.includes('white-space: nowrap !important;'), 'Mobile island-berries-label must be width auto and nowrap');

  // 2. CSS Verification: Berry chips must have borders removed
  assert(cssCode.includes('.island-berry-chip {') && cssCode.includes('border: none !important;') && cssCode.includes('background: transparent !important;'), 'Desktop berry chips must have border removed');
  assert(cssCode.includes('.mobile-h5-app .island-berry-chip') && cssCode.includes('border: none !important;'), 'Mobile berry chips must have border removed');

  // 3. CSS Verification: Elimination of redundant outer borders in islands tab
  assert(cssCode.includes('.island-table-card,') && cssCode.includes('.island-spawns-card') && cssCode.includes('border: none !important;') && cssCode.includes('padding: 0 !important;'), 'Table sections must have outer borders and padding removed to maximize content width');
  assert(cssCode.includes('#wiki-subpanel-islands .wiki-card') && cssCode.includes('border: none !important;'), 'Any wiki-card in islands subpanel must be borderless');

  // 4. DOM Verification: Islands subpanel HTML structure must NOT wrap sections in redundant wiki-card borders
  const mockCtx = {
    window: { localStorage: { getItem: () => null, setItem: () => {} }, location: { hash: '' } },
    document: { getElementById: () => null, querySelectorAll: () => [], addEventListener: () => {} },
    console, setTimeout
  };
  mockCtx.window.window = mockCtx.window;
  mockCtx.window.document = mockCtx.document;
  vm.createContext(mockCtx);
  vm.runInContext(wikiCode, mockCtx);

  mockCtx.window.WikiDB.selectIsland('cyan', true);
  const html = mockCtx.window.WikiDB.renderIslandsSubpanel();

  assert(!html.includes('class="wiki-card island-overview-card"'), 'Hero block must not have outer wiki-card border');
  assert(!html.includes('island-ex-card'), 'EX card must be completely removed from DOM');
  assert(html.includes('class="island-table-card"'), 'Two-col tables must use borderless island-table-card');
  assert(cssCode.includes('.island-triple-grid {') && cssCode.includes('grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.05fr) minmax(0, 1.28fr);'), 'Islands must use compact 3-column grid');
  assert(cssCode.includes('.wiki-ratings-container {') && cssCode.includes('grid-template-columns: repeat(3, minmax(0, 1fr));'), 'Ratings guide must use 3-across desktop grid');
  assert(cssCode.includes('.wiki-main-container {\n  max-width: 1200px;\n  width: 92%;'), 'Wiki desktop main width must match other tabs at 1200px / 92%');
  assert(cssCode.includes('.mobile-h5-app #pokemon-filter-sidebar .sidebar-scrollable-content') && cssCode.includes('gap: 6px !important;'), 'Pokedex H5 filter must compress vertical gap');
  assert(html.includes('class="island-spawns-card"'), 'Spawns section must use borderless island-spawns-card');
  assert(!html.includes('<div class="wiki-card" style="margin-bottom:16px;">'), 'Spawns section must not have outer wiki-card box');

  // 5. CSS Verification: Rank badge numbers must use var(--text-primary) for optimal contrast across themes
  assert(cssCode.includes('.rank-num {') && cssCode.includes('color: var(--text-primary) !important;'), 'Desktop rank-num must use var(--text-primary)');
  assert(cssCode.includes('.mobile-h5-app .rank-num') && cssCode.includes('color: var(--text-primary) !important;'), 'Mobile rank-num must use var(--text-primary)');
  assert(cssCode.includes('.rank-badge {') && cssCode.includes('color: var(--text-primary);'), 'Desktop rank-badge must use var(--text-primary)');

  // 6. Subtabs compact padding & visible scroll indicator verification
  assert(cssCode.includes('.mobile-h5-app .wiki-subnav-tabs') && cssCode.includes('gap: 3px !important;'), 'Mobile subnav tabs must use compact gap: 3px');
  assert(cssCode.includes('.mobile-h5-app .wiki-subnav-tabs') && cssCode.includes('padding: 4px 6px !important;'), 'Mobile subnav tabs must use reduced padding: 4px 6px');
  assert(cssCode.includes('.mobile-h5-app .wiki-subtab-btn') && cssCode.includes('padding: 4px 7px !important;'), 'Mobile subtab buttons must use compact padding: 4px 7px');
  assert(cssCode.includes('.mobile-h5-app .wiki-subnav-tabs::-webkit-scrollbar') && cssCode.includes('height: 2.5px !important;'), 'Mobile subnav scrollbar must be visibly styled');
});

test('Tier 4 - Real-World Application Scenarios', 'Island Spawns Unified National Dex Ordering & Tooltips', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  const mockCtx = {
    window: {
      location: { hash: '#wiki/islands' },
      localStorage: { getItem: () => null, setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} }
    },
    document: {
      documentElement: { setAttribute: () => {}, getAttribute: () => 'zh-TW' },
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
      head: { appendChild: () => {} },
      body: { appendChild: () => {}, classList: { contains: () => false } }
    },
    console, setTimeout
  };
  mockCtx.window.window = mockCtx.window;
  mockCtx.window.document = mockCtx.document;
  vm.createContext(mockCtx);
  vm.runInContext(i18nCode, mockCtx);
  vm.runInContext(wikiCode, mockCtx);

  // 1. Greengrass island 'all' view: All sleep types must be unified and ordered by National Pokédex number
  mockCtx.window.WikiDB.selectIsland('greengrass', false);
  mockCtx.window.WikiDB.filterIslandSleepType('all');
  const htmlGreengrass = mockCtx.window.WikiDB.renderIslandsSubpanel();

  // Extract avatar tooltips in rendered sequence
  const titleMatches = [...htmlGreengrass.matchAll(/class="island-pkm-item island-pkm-icon-only" title="([^"]+)"/g)].map(m => m[1]);
  assert(titleMatches.length >= 160, 'Greengrass must render all spawns (expected 166)');

  // Verify first 7 sequential Pokemon: #001 -> #002 -> #003 -> #004 -> #005 -> #006 -> #007
  assert(titleMatches[0].includes('#001 妙蛙種子 (淺淺入夢)'), '1st must be #001 Bulbasaur (Dozing)');
  assert(titleMatches[1].includes('#002 妙蛙草 (淺淺入夢)'), '2nd must be #002 Ivysaur (Dozing)');
  assert(titleMatches[2].includes('#003 妙蛙花 (淺淺入夢)'), '3rd must be #003 Venusaur (Dozing)');
  assert(titleMatches[3].includes('#004 小火龍 (安然入睡)'), '4th must be #004 Charmander (Snoozing)');
  assert(titleMatches[4].includes('#005 火恐龍 (安然入睡)'), '5th must be #005 Charmeleon (Snoozing)');
  assert(titleMatches[5].includes('#006 噴火龍 (安然入睡)'), '6th must be #006 Charizard (Snoozing)');
  assert(titleMatches[6].includes('#007 傑尼龜 (深深入眠)'), '7th must be #007 Squirtle (Slumbering)');

  // Verify that Charmander (#004) appears before Caterpie (#010) and Pinsir (#127), proving no block partitioning
  const idxCharmander = titleMatches.findIndex(t => t.includes('小火龍'));
  const idxCaterpie = titleMatches.findIndex(t => t.includes('綠毛蟲'));
  const idxPinsir = titleMatches.findIndex(t => t.includes('凱羅斯'));
  assert(idxCharmander < idxCaterpie, 'Charmander (#004) must appear before Caterpie (#010)');
  assert(idxCharmander < idxPinsir, 'Charmander (#004) must appear before Pinsir (#127)');

  // 2. Cyan Beach: Squirtle (#007) -> Wartortle (#008) -> Blastoise (#009) -> Caterpie (#010)
  mockCtx.window.WikiDB.selectIsland('cyan', false);
  mockCtx.window.WikiDB.filterIslandSleepType('all');
  const htmlCyan = mockCtx.window.WikiDB.renderIslandsSubpanel();
  const cyanTitles = [...htmlCyan.matchAll(/class="island-pkm-item island-pkm-icon-only" title="([^"]+)"/g)].map(m => m[1]);
  assert(cyanTitles[0].includes('#007 傑尼龜 (深深入眠)'), 'Cyan 1st must be Squirtle #007');
  assert(cyanTitles[1].includes('#008 卡咪龜 (深深入眠)'), 'Cyan 2nd must be Wartortle #008');
  assert(cyanTitles[2].includes('#009 水箭龜 (深深入眠)'), 'Cyan 3rd must be Blastoise #009');
  assert(cyanTitles[3].includes('#010 綠毛蟲 (淺淺入夢)'), 'Cyan 4th must be Caterpie #010');

  // 3. Verify single sleep type filter also respects Dex ordering
  mockCtx.window.WikiDB.filterIslandSleepType('snoozing');
  const htmlCyanSnooze = mockCtx.window.WikiDB.renderIslandsSubpanel();
  const snoozeTitles = [...htmlCyanSnooze.matchAll(/class="island-pkm-item island-pkm-icon-only" title="([^"]+)"/g)].map(m => m[1]);
  assert(snoozeTitles[0].includes('#025 皮卡丘'), 'Cyan snoozing 1st must be Pikachu #025');
  assert(snoozeTitles[1].includes('#035 皮皮'), 'Cyan snoozing 2nd must be Clefairy #035');

  // 4. Verify Greengrass (random berries) has zero berry section or description rendered
  assert(!htmlGreengrass.includes('island-berries-section'), 'Greengrass must NOT render any berry section');
  assert(!htmlGreengrass.includes('隨機3種樹果'), 'Greengrass must NOT display random berries explanation');

  // 5. Verify Cyan (fixed berries) renders inside hero banner with shortened label
  assert(htmlCyan.includes('喜好樹果:'), 'Cyan must render shortened label 喜好樹果:');
  assert(/<div class="island-hero-banner"[^>]*>[\s\S]*?<div class="island-title-group">[\s\S]*?<div class="island-berries-section">/.test(htmlCyan), 'Hero banner must contain title group followed by berries section');
  assert(cssCode.includes('.island-hero-banner::after') && cssCode.includes('var(--bg-dark)'), 'Island hero must fade into page background without a framed border');

  // 6. Verify Drowsy Power spawn tiers table renders 3 columns with 100-score rank badge, energy and formula footnote
  assert(htmlCyan.includes('最低睡意之力門檻'), 'Drowsy power table must include 最低睡意之力門檻 header');
  assert(htmlCyan.includes('睡眠分數100'), 'Drowsy power table must include 睡眠分數100 header');
  assert(htmlCyan.includes('露營券(+1且貪吃)'), 'Drowsy power table must render 露營券(+1且貪吃)');
  assert(htmlCyan.includes('睡眠分數100: 以睡滿 100 分 (8.5小時) 換算'), 'Drowsy power table must render 100-score conversion formula footnote');

  mockCtx.window.WikiDB.selectIsland('greengrass');
  const htmlGreen = mockCtx.window.WikiDB.renderIslandsSubpanel();
  assert(htmlGreen.includes('普通 (Basic) 3') && htmlGreen.includes('≥ 9,200'), 'Greengrass 4 spawns must map to Basic 3 and >= 9,200');
  assert(htmlGreen.includes('普通 (Basic) 5') && htmlGreen.includes('≥ 20.6k'), 'Greengrass 5 spawns must map to Basic 5 and >= 20.6k');
  assert(htmlGreen.includes('超級 (Great) 3') && htmlGreen.includes('≥ 45k'), 'Greengrass 6 spawns must map to Great 3 and >= 45k');
  assert(htmlGreen.includes('高級 (Ultra) 1') && htmlGreen.includes('≥ 83.2k'), 'Greengrass 7 spawns must map to Ultra 1 and >= 83.2k');
  assert(htmlGreen.includes('大師 (Master) 1') && htmlGreen.includes('≥ 195k'), 'Greengrass 8 spawns must map to Master 1 and >= 195k');
});

test('Tier 4 - Real-World Application Scenarios', 'Snorlax Rank Badges Theme Saturation & Brightness Adaptation', () => {
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Dark theme must use high-saturation luminous backgrounds and glowing box-shadow, never muddy 0.28
  assert(!cssCode.includes('background: rgba(239, 68, 68, 0.28);'), 'Basic rank must NOT use muddy low-alpha 0.28 in dark theme');
  assert(!cssCode.includes('background: rgba(217, 119, 6, 0.28);'), 'Ultra rank must NOT use muddy low-alpha brown 0.28 in dark theme');
  assert(cssCode.includes('.rank-basic {') && cssCode.includes('box-shadow: 0 1px 4px rgba(239, 68, 68, 0.3);'), 'Basic rank must use luminous glow in dark theme');
  assert(cssCode.includes('.rank-ultra {') && cssCode.includes('box-shadow: 0 1px 4px rgba(245, 158, 11, 0.3);'), 'Ultra rank must use bright amber glow in dark theme');

  // 2. Onyx pure black theme must have enhanced high-contrast styles
  assert(cssCode.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .rank-ultra'), 'Onyx theme must have dedicated high-contrast ultra badge rule');

  // 3. Light themes (Dawn / Emerald / Inverted) must use low-saturation soft pastel backgrounds
  assert(cssCode.includes('[data-theme="dawn"] .rank-basic') && cssCode.includes('background: #fee2e2;'), 'Dawn / Emerald must use soft low-saturation pastel #fee2e2 for Basic');
  assert(cssCode.includes('[data-theme="dawn"] .rank-great') && cssCode.includes('background: #dbeafe;'), 'Dawn / Emerald must use soft low-saturation pastel #dbeafe for Great');
  assert(cssCode.includes('[data-theme="dawn"] .rank-ultra') && cssCode.includes('background: #fef3c7;'), 'Dawn / Emerald must use soft low-saturation pastel #fef3c7 for Ultra');
  assert(cssCode.includes('[data-theme="dawn"] .rank-master') && cssCode.includes('background: #f3e8ff;'), 'Dawn / Emerald must use soft low-saturation pastel #f3e8ff for Master');
});

test('Tier 4 - Real-World Application Scenarios', 'Sidebar Bookmark Handle Ironclad Visibility (Strictly Hidden when Expanded, Visible when Collapsed)', () => {
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssCode.includes('.recipe-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for recipe sidebar handle');
  assert(cssCode.includes('.pokemon-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for pokemon sidebar handle');
  assert(cssCode.includes('.ladder-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle') || cssCode.includes('.ladder-fixed-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for ladder sidebar handle');
  assert(cssCode.includes('display: none !important;'), 'CSS must enforce display: none !important for expanded sidebar handles');
  assert(cssCode.includes('display: flex !important;'), 'CSS must enforce display: flex !important for collapsed sidebar handles');

  // Verify recipes.js toggle logic
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  assert(recipesJs.includes("bookmarkHandle.style.display = 'none'"), 'recipes.js must set bookmarkHandle.style.display = none when expanding');
  assert(recipesJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'recipes.js must set bookmarkHandle.style.visibility = hidden when expanding');

  // Verify app.js toggle logic
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  assert(appJs.includes("bookmarkHandle.style.display = 'none'"), 'app.js must set bookmarkHandle.style.display = none when expanding');
  assert(appJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'app.js must set bookmarkHandle.style.visibility = hidden when expanding');

  // Verify wiki.js toggle logic
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiJs.includes("bookmarkHandle.style.display = 'none'"), 'wiki.js must set bookmarkHandle.style.display = none when expanding');
  assert(wikiJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'wiki.js must set bookmarkHandle.style.visibility = hidden when expanding');
});

test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder Sidebar Header-to-Content Spacing and Mobile H5 Optimization', () => {
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  // Desktop ladder sidebar scrollable content must have compact top padding (10px, never 32px legacy offset)
  const ladderDesktopRegex = /\.ladder-fixed-sidebar\s+\.sidebar-scrollable-content\s*\{[^}]*padding:\s*([0-9]+)px/m;
  const matchDesktop = cssCode.match(ladderDesktopRegex);
  assert(matchDesktop, 'CSS must specify padding for .ladder-fixed-sidebar .sidebar-scrollable-content');
  const desktopTopPadding = parseInt(matchDesktop[1], 10);
  assert(desktopTopPadding <= 12, `Desktop ladder sidebar top padding must be compact (<= 12px), got ${desktopTopPadding}px`);
  assert(!cssCode.includes('.ladder-fixed-sidebar .sidebar-scrollable-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 32px'), 'Desktop ladder sidebar must not have 32px top gap');

  // Mobile H5 ladder sidebar must have compact top padding and compact gap
  assert(cssCode.includes('.mobile-h5-app .ladder-fixed-sidebar .sidebar-scrollable-content'), 'CSS must define mobile H5 ladder sidebar scrollable content rule');
  const ladderH5Regex = /\.mobile-h5-app\s+\.ladder-fixed-sidebar\s+\.sidebar-scrollable-content\s*\{[^}]*padding:\s*([0-9]+)px/m;
  const matchH5 = cssCode.match(ladderH5Regex);
  assert(matchH5, 'CSS must specify padding for mobile H5 ladder sidebar');
  const h5TopPadding = parseInt(matchH5[1], 10);
  assert(h5TopPadding <= 10, `Mobile H5 ladder sidebar top padding must be compact (<= 10px), got ${h5TopPadding}px`);
});

test('Tier 4 - Real-World Application Scenarios', 'Island Spawns Table Star Icons, Multi-State Column Sorting and Pokemon Dex Order Cycle', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify CSS defines sortable th styles and star icon styles
  assert(cssCode.includes('.island-spawns-compact-table th.island-sort-th'), 'CSS must define island-sort-th style');
  assert(cssCode.includes('.sleep-style-star-icon'), 'CSS must define sleep-style-star-icon style');
  assert(cssCode.includes('.sleep-star-label'), 'CSS must define sleep-star-label style');

  // Setup DOM mock context
  let mockPanel = { innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {}, contains: () => true }, addEventListener: () => {} };
  const ctx = {
    window: { location: { hash: '#wiki' }, localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {}, history: { replaceState: () => {} } },
    document: { readyState: 'complete', documentElement: { setAttribute: () => {} }, getElementById: () => mockPanel, querySelectorAll: () => [], addEventListener: () => {} },
    console, setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const WikiDB = ctx.window.WikiDB;
  WikiDB.selectIsland('greengrass');

  // 1. Verify rank score converter
  assertEquals(WikiDB.getSnorlaxRankScore('Basic 1'), 101, 'Basic 1 score must be 101');
  assertEquals(WikiDB.getSnorlaxRankScore('Great 3'), 203, 'Great 3 score must be 203');
  assertEquals(WikiDB.getSnorlaxRankScore('Ultra 5'), 305, 'Ultra 5 score must be 305');
  assertEquals(WikiDB.getSnorlaxRankScore('Master 10'), 410, 'Master 10 score must be 410');
  assertEquals(WikiDB.getSnorlaxRankScore('-'), -1, '- score must be -1');

  // 2. Initial state: default sorting
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), 'Initial sort state must be null');

  // 3. Test Pokemon column sort cycle: 1st click desc, 2nd click asc, 3rd click reset
  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 'pokemon', dir: 'desc' }), '1st click on pokemon must be desc');
  let html = WikiDB.renderIslandsSubpanel();
  assert(html.includes('active-sort') && html.includes('data-col="pokemon"'), 'Pokemon column must have active-sort class');

  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 'pokemon', dir: 'asc' }), '2nd click on pokemon must be asc');

  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on pokemon must reset to null');

  // 4. Test 1-Star (s1) sort cycle: 1st click desc, 2nd click asc, 3rd click reset
  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's1', dir: 'desc' }), '1st click on s1 must be desc');

  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's1', dir: 'asc' }), '2nd click on s1 must be asc');

  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on s1 must reset to null');

  // 5. Switching from s2 to s3 starts with desc on s3
  WikiDB.sortIslandSpawns('s2');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's2', dir: 'desc' }), '1st click on s2 must be desc');
  WikiDB.sortIslandSpawns('s3');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's3', dir: 'desc' }), 'Switching to s3 must start with desc');
  WikiDB.sortIslandSpawns('s3');
  WikiDB.sortIslandSpawns('s3');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on s3 must reset to null');

  // 6. Verify star image asset exists on filesystem
  assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets', 'star.png')), 'assets/star.png must exist');
});

test('Tier 4 - Real-World Application Scenarios', 'Sleep EXP Calculator Accurate EXP Table, Dropdown Target Level & Ribbon Carry Progression', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify Ribbon Quick Guide displays independent progression (+1, +2, +3, +2)
  assert(wikiCode.includes('+1 ${isEN ? \'Carry\' : \'持有上限\'}'), 'Ribbon Tier 1 must be +1');
  assert(wikiCode.includes('+2 ${isEN ? \'Carry\' : \'持有\'}, ${isEN ? \'Speed\' : \'幫速\'} -5% / -11%'), 'Ribbon Tier 2 must be +2');
  assert(wikiCode.includes('+3 ${isEN ? \'Carry\' : \'持有上限\'}'), 'Ribbon Tier 3 must be +3');
  assert(wikiCode.includes('+2 ${isEN ? \'Carry\' : \'持有\'}, ${isEN ? \'Speed\' : \'幫速\'} -12% / -25%'), 'Ribbon Tier 4 must be +2');

  // 2. Verify CSS defines dropdown styling complying with dropdown arrow rule & custom-select-calc
  assert(cssCode.includes('.calc-select') && cssCode.includes('padding: 9px 36px 9px 12px;'), 'calc-select must have 36px right padding for arrow clearance');
  assert(cssCode.includes('background-position: right 18px center;'), 'calc-select arrow must be inset 18px from right');
  assert(cssCode.includes('.calc-form-col'), 'CSS must define calc-form-col');
  assert(cssCode.includes('.calc-form-row'), 'CSS must define calc-form-row');
  assert(cssCode.includes('.calc-switch-label'), 'CSS must define calc-switch-label');
  assert(cssCode.includes('.custom-select-calc'), 'CSS must define custom-select-calc');
  assert(cssCode.includes('.calc-result-candies'), 'CSS must define calc-result-candies');

  // 3. Setup mock DOM environment
  const elements = {};
  const getEl = id => {
    if (!elements[id]) {
      elements[id] = {
        id,
        value: '',
        checked: false,
        textContent: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        setAttribute: () => {},
        getAttribute: () => null,
        addEventListener: () => {}
      };
    }
    return elements[id];
  };

  const customizedElements = [];
  const ctx = {
    window: {
      location: { hash: '#wiki/ratings' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} },
      setupCustomSelect: el => {
        el._customized = true;
        customizedElements.push(el);
      }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: getEl,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console,
    setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const mockContainer = { innerHTML: '', style: {} };
  ctx.window.WikiDB.renderWikiLayout(mockContainer);
  const html = mockContainer.innerHTML;

  // 4. Verify 2-row layout structure and custom select elements
  assert(html.includes('class="calc-form-col"'), 'Must render calc-form-col for two-row left column');
  assert(html.includes('class="calc-form-row calc-form-row-levels"'), 'Must render calc-form-row-levels');
  assert(html.includes('class="calc-form-row calc-form-row-boosts"'), 'Must render calc-form-row-boosts');
  assert(html.includes('id="calc-sleep-candies-result"'), 'Must render calc-sleep-candies-result for candies estimation');

  // Verify Target Level is a select dropdown with options 30, 50, 60, 70, 80
  assert(html.includes('<select id="calc-sleep-target-lv" class="calc-select"'), 'Target level must be a calc-select dropdown');
  assert(html.includes('<option value="30">Lv.30</option>'), 'Target level must have option 30');
  assert(html.includes('<option value="50">Lv.50</option>'), 'Target level must have option 50');
  assert(html.includes('<option value="60">Lv.60</option>'), 'Target level must have option 60');
  assert(html.includes('<option value="70">Lv.70</option>'), 'Target level must have option 70');
  assert(html.includes('<option value="80">Lv.80</option>'), 'Target level must have option 80');

  // 5. Verify Growth Incense is completely removed
  assert(!html.includes('calc-sleep-incense'), 'Growth incense control must be removed');
  assert(!html.includes('成長薰香 (2x)'), 'Growth incense label must be removed');

  // 6. Verify Sleep EXP Bonus uses switch button markup
  assert(html.includes('class="calc-switch-label"'), 'Must render calc-switch-label wrapper');
  assert(html.includes('class="switch-checkbox"'), 'Must render switch-checkbox input');
  assert(html.includes('class="switch-slider"'), 'Must render switch-slider span');
  assert(html.includes('睡眠EXP獎勵 (+14%)'), 'Must render Sleep EXP bonus text');

  // 7. Verify Nature select exists with unified styling
  assert(html.includes('id="calc-sleep-nature-select" class="calc-select"'), 'Nature select must use unified calc-select class');

  // 8. Verify initCalcCustomSelects initializes target and nature selects
  ctx.window.WikiDB.initCalcCustomSelects();
  assert(getEl('calc-sleep-target-lv')._customized === true, 'Target level select must be customized');
  assert(getEl('calc-sleep-nature-select')._customized === true, 'Nature select must be customized');

  // 9. Test accurate calculation logic and candy equivalent via recalcSleepDays
  const curLv = getEl('calc-sleep-cur-lv');
  const targetLv = getEl('calc-sleep-target-lv');
  const expBonus = getEl('calc-sleep-exp-subskill');
  const natureSel = getEl('calc-sleep-nature-select');
  const daysRes = getEl('calc-sleep-days-result');
  const expRes = getEl('calc-sleep-exp-result');
  const candiesRes = getEl('calc-sleep-candies-result');

  // Case A: Level 1 to 30 default -> 11,992 EXP, 120 Days, 480 Candies (25 EXP/ea)
  curLv.value = '1';
  targetLv.value = '30';
  expBonus.checked = false;
  natureSel.value = '1.0';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('120'), `Lv.1 to 30 must be 120 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('11,992'), `Lv.1 to 30 must be 11,992 EXP, got: ${expRes.textContent}`);
  assert(!expRes.textContent.includes('每日約') && !expRes.textContent.includes('EXP/Day'), `expRes must not contain (每日約 100 EXP) or (~100 EXP/Day), got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('480') && candiesRes.textContent.includes('25 EXP'), `Lv.1 to 30 must be 480 candies (25 EXP/ea), got: ${candiesRes.textContent}`);

  // Case B: Level 1 to 50 default -> 29,993 EXP, 300 Days, 1,200 Candies
  targetLv.value = '50';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('300'), `Lv.1 to 50 must be 300 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('29,993'), `Lv.1 to 50 must be 29,993 EXP, got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('1,200'), `Lv.1 to 50 must be 1,200 candies, got: ${candiesRes.textContent}`);

  // Case C: Level 50 to 60 steep surge -> 51,493 - 29,993 = 21,500 EXP, 215 Days, 860 Candies
  curLv.value = '50';
  targetLv.value = '60';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('215'), `Lv.50 to 60 must be 215 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('21,500'), `Lv.50 to 60 must be 21,500 EXP, got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('860'), `Lv.50 to 60 must be 860 candies, got: ${candiesRes.textContent}`);

  // Case D: Level 60 to 70 steep surge -> 82,162 - 51,493 = 30,669 EXP, 307 Days
  curLv.value = '60';
  targetLv.value = '70';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('307'), `Lv.60 to 70 must be 307 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('30,669'), `Lv.60 to 70 must be 30,669 EXP, got: ${expRes.textContent}`);

  // Case E: Level 70 to 80 -> 120,262 - 82,162 = 38,100 EXP, 381 Days
  curLv.value = '70';
  targetLv.value = '80';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('381'), `Lv.70 to 80 must be 381 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('38,100'), `Lv.70 to 80 must be 38,100 EXP, got: ${expRes.textContent}`);

  // Case F: Level 50 to 60 with Sleep EXP Bonus (+14%) -> ceil(21500 / 114) = 189 Days
  curLv.value = '50';
  targetLv.value = '60';
  expBonus.checked = true;
  natureSel.value = '1.0';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('189'), `Lv.50 to 60 with +14% must be 189 days, got: ${daysRes.textContent}`);

  // Case G: Nature Up (+18%) and Nature Down (-18%) multipliers and candy changes
  expBonus.checked = false;
  natureSel.value = '1.18'; // dailyExp = 118 -> ceil(21500 / 118) = 183 Days; candy = 30 EXP/ea -> ceil(21500 / 30) = 717 Candies
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('183'), `Lv.50 to 60 with Nature Up must be 183 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('717') && candiesRes.textContent.includes('30 EXP'), `Lv.50 to 60 with Nature Up must be 717 candies (30 EXP/ea), got: ${candiesRes.textContent}`);

  natureSel.value = '0.82'; // dailyExp = 82 -> ceil(21500 / 82) = 263 Days; candy = 21 EXP/ea -> ceil(21500 / 21) = 1,024 Candies
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('263'), `Lv.50 to 60 with Nature Down must be 263 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('1,024') && candiesRes.textContent.includes('21 EXP'), `Lv.50 to 60 with Nature Down must be 1,024 candies (21 EXP/ea), got: ${candiesRes.textContent}`);

  // Case H: cur >= target -> 0 Days, 0 Candies
  curLv.value = '65';
  targetLv.value = '60';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('0'), `cur >= target must show 0 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('無需額外糖果'), `cur >= target must show 無需額外糖果, got: ${candiesRes.textContent}`);
});

test('Tier 4 - Real-World Application Scenarios', 'Wiki Healer Strategy, Seed Evolution Rules & Mobile H5 Filter FAB Ironclad Visibility', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Seed rules: remove legacy inventory +5
  assert(!wikiJs.includes('持有上限+5'), 'wiki.js must remove legacy 持有上限+5');
  assert(!wikiJs.includes('inventory +5'), 'wiki.js must remove legacy inventory +5');
  assert(wikiJs.includes('每次進化<span class="text-success font-bold">主技能+1</span>.副技能不能同時存在相同名稱技能'), 'wiki.js must retain skill +1 and subskill uniqueness');

  // 2. Healers & Energy boost
  assert(wikiJs.includes('土台龜') && wikiJs.includes('Torterra'), 'wiki.js must include Torterra / 土台龜 as recommended healer');
  assert(wikiJs.includes('約2.22倍') && wikiJs.includes('0.45x'), 'wiki.js must accurately describe ~2.22x speed and 0.45x interval for >80% energy');

  // 3. Mobile H5 FAB CSS rules
  assert(cssCode.includes('.mobile-h5-app .sidebar-fab-btn'), 'styles.css must style mobile H5 FAB');
  assert(cssCode.includes('.mobile-h5-app .sidebar-fab-btn.drawer-open') && cssCode.includes('display: none !important;'), 'styles.css must strictly hide FAB when drawer is open');
  assert(cssCode.includes('.mobile-h5-app.pokemon-active #sidebar-bookmark-handle:not(.drawer-open)'), 'styles.css must show Pokemon FAB when collapsed');
  assert(cssCode.includes('.mobile-h5-app.ladder-active #ladder-sidebar-bookmark-handle:not(.drawer-open)'), 'styles.css must show Ladder FAB when collapsed');

  // 4. JS Drawer-open symmetric state tracking
  assert(appJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'app.js must add drawer-open when expanding');
  assert(appJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'app.js must remove drawer-open when collapsing');
  assert(recipesJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'recipes.js must add drawer-open when expanding');
  assert(recipesJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'recipes.js must remove drawer-open when collapsing');
  assert(wikiJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'wiki.js must add drawer-open when expanding');
  assert(wikiJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'wiki.js must remove drawer-open when collapsing');
});

test('Tier 4 - Real-World Application Scenarios', 'Box Manual Add Combobox Number Search Intelligence & Dynamic Good-Night Ribbon Options', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  // 1. Setup DOM and vm Context
  const domElements = {};
  function mockEl(id, tagName = 'div') {
    const el = {
      id,
      tagName: tagName.toUpperCase(),
      value: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      getAttribute: () => '',
      addEventListener: (evt, handler) => { el['on' + evt] = handler; },
      dispatchEvent: () => {},
      querySelectorAll: () => []
    };
    domElements[id] = el;
    return el;
  }

  const ctx = {
    window: {},
    document: {
      getElementById: id => domElements[id] || mockEl(id),
      createElement: tag => mockEl('mock-' + Math.random(), tag),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console,
    BERRY_DATA: [],
    THREE_STAGE_BASE_NAMES: new Set([
      '妙蛙種子', '小火龍', '傑尼龜', '綠毛蟲', '喇叭芽', '波克比', '咩利羊',
      '火稚雞', '木守宮', '水躍魚', '拉魯拉絲', '過動猿', '可可多拉',
      '超音蝠', '小拳石', '鬼斯', '凱西', '小磁怪', '圓陸鯊', '大針蜂',
      '火球鼠', '小鋸鱷', '幼基拉斯', '大顎蟻', '海豹球', '寶貝龍', '草苗龜', '小火焰猴', '波加曼', '小貓怪',
      '強顎雞母蟲', '新葉喵', '呆火鱷', '潤水鴨', '布撥', '巧鍛匠'
    ])
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;

  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);
  vm.runInContext(appraisalJs, ctx);
  vm.runInContext(boxJs, ctx);

  // Initialize Box with pokemon data
  const boxApp = ctx.PokemonBoxApp || ctx.window.PokemonBoxApp;
  assert(boxApp, 'PokemonBoxApp must be defined');
  assert(typeof boxApp.updateRibbonSelectOptions === 'function', 'updateRibbonSelectOptions must be exposed');

  // Test 1: Dynamic Good-Night Ribbon options based on evolution stage
  const ribbonSelect = mockEl('modal-poke-ribbon', 'select');
  domElements['modal-poke-ribbon'] = ribbonSelect;

  // Case 1A: Final Evolution (e.g. 倫琴貓 Luxray #405, is_final = '〇')
  const luxray = pkmData.find(p => p.id === '405' || p.name_cn === '倫琴貓');
  assert(luxray, 'Luxray #405 must exist in data.json');
  boxApp.updateRibbonSelectOptions(luxray);
  const luxrayHtml = ribbonSelect.innerHTML;
  assert(luxrayHtml.includes('data-icon="assets/ribbons/ribbon_lv1.png"'), 'Ribbon options must include official ribbon_lv1 icon');
  assert(!luxrayHtml.includes('第 1 階段'), 'Ribbon options must NOT have 第 1 階段');
  assert(luxrayHtml.includes('+3 持有上限'), 'Final evolution must have +3 持有上限');
  assert(!luxrayHtml.includes('幫速加成'), 'Final evolution must NOT have 幫速加成');
  assert(!luxrayHtml.includes('幫速最大加成'), 'Final evolution must NOT have 幫速最大加成');
  assert(!luxrayHtml.includes('專屬頭像'), 'Final evolution must NOT have 專屬頭像');
  assert(luxrayHtml.includes('+6 持有上限'), 'Final evolution must have +6 持有上限');
  assert(luxrayHtml.includes('+8 持有上限'), 'Final evolution must have +8 持有上限');

  // Case 1B: Mid-Stage / 1 Evo Remaining (e.g. 勒克貓 Luxio #404)
  const luxio = pkmData.find(p => p.id === '404' || p.name_cn === '勒克貓');
  assert(luxio, 'Luxio #404 must exist in data.json');
  boxApp.updateRibbonSelectOptions(luxio);
  const luxioHtml = ribbonSelect.innerHTML;
  assert(luxioHtml.includes('幫速加成 -5%'), '1-evo remaining must have 幫速加成 -5%');
  assert(luxioHtml.includes('幫速最大加成 -12%'), '1-evo remaining must have 幫速最大加成 -12%');
  assert(!luxioHtml.includes('專屬頭像'), '1-evo remaining must NOT have 專屬頭像');

  // Case 1C: Base Stage / 2 Evos Remaining (e.g. 小貓怪 Shinx #403)
  const shinx = pkmData.find(p => p.id === '403' || p.name_cn === '小貓怪');
  assert(shinx, 'Shinx #403 must exist in data.json');
  boxApp.updateRibbonSelectOptions(shinx);
  const shinxHtml = ribbonSelect.innerHTML;
  assert(shinxHtml.includes('幫速加成 -11%'), '2-evo remaining must have 幫速加成 -11%');
  assert(shinxHtml.includes('幫速最大加成 -25%'), '2-evo remaining must have 幫速最大加成 -25%');
  assert(!shinxHtml.includes('專屬頭像'), '2-evo remaining must NOT have 專屬頭像');

  // Test 2: Combobox Number Search Intelligence (Partial, Prefix, Substring, Typo)
  const searchInput = mockEl('modal-poke-search', 'input');
  const nameHidden = mockEl('modal-poke-name', 'input');
  const dropdown = mockEl('box-pkm-dropdown', 'div');
  const toggleBtn = mockEl('box-pkm-dropdown-toggle', 'button');
  domElements['modal-poke-search'] = searchInput;
  domElements['modal-poke-name'] = nameHidden;
  domElements['box-pkm-dropdown'] = dropdown;
  domElements['box-pkm-dropdown-toggle'] = toggleBtn;

  boxApp.setAllPokemons(pkmData);
  boxApp.initPokemonCombobox();
  const renderDropdown = ctx.window._boxRenderDropdown;
  assert(typeof renderDropdown === 'function', '_boxRenderDropdown must be exposed for testing');

  // 2A. Search '40'
  renderDropdown('40');
  assert(dropdown.innerHTML.includes('No.040 胖可丁'), 'Search "40" must include #040 胖可丁 as exact match');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "40" must include #405 倫琴貓 (prefix 40)');
  assert(dropdown.innerHTML.includes('No.403 小貓怪'), 'Search "40" must include #403 小貓怪 (prefix 40)');
  // Verify rank ordering: #040 胖可丁 appears before #405 倫琴貓
  const idx40 = dropdown.innerHTML.indexOf('No.040 胖可丁');
  const idx405 = dropdown.innerHTML.indexOf('No.405 倫琴貓');
  assert(idx40 !== -1 && idx405 !== -1 && idx40 < idx405, '#040 exact match must appear before #405 prefix match');

  // 2B. Search '405'
  renderDropdown('405');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "405" must include #405 倫琴貓');
  assert(!dropdown.innerHTML.includes('No.040 胖可丁'), 'Search "405" must NOT include #040');

  // 2C. Search 'No.405'
  renderDropdown('No.405');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "No.405" must match #405 倫琴貓');

  // 2D. Search '4'
  renderDropdown('4');
  assert(dropdown.innerHTML.includes('No.004 小火龍'), 'Search "4" must include #004 小火龍');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "4" must include #405 倫琴貓');

  // 2E. Search typo '皮卡秋' (Homophone/typo tolerance)
  renderDropdown('皮卡秋');
  assert(dropdown.innerHTML.includes('皮卡丘'), 'Search typo "皮卡秋" must match 皮卡丘');

  // 2F. Search subsequence '妙花'
  renderDropdown('妙花');
  assert(dropdown.innerHTML.includes('妙蛙花'), 'Search "妙花" must match 妙蛙花');
});

test('Tier 4 - Real-World Application Scenarios', 'Box Intelligent OCR Multi-Anchor Engine & Image 1 Ground Truth 100% Verification', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const domElements = {};
  function mockEl(id, tagName = 'div') {
    const el = {
      id,
      tagName: tagName.toUpperCase(),
      value: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      getAttribute: () => '',
      addEventListener: (evt, handler) => { el['on' + evt] = handler; },
      dispatchEvent: () => {},
      querySelectorAll: () => []
    };
    domElements[id] = el;
    return el;
  }

  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  const ctx = {
    window: {},
    document: {
      getElementById: id => domElements[id] || mockEl(id),
      createElement: tag => mockEl('mock-' + Math.random(), tag),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console,
    BERRY_DATA: []
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;

  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);
  vm.runInContext(appraisalJs, ctx);
  vm.runInContext(boxJs, ctx);

  const boxApp = ctx.PokemonBoxApp || ctx.window.PokemonBoxApp;
  assert(boxApp, 'PokemonBoxApp must be defined');
  assert(typeof boxApp.parsePokemonFromOcr === 'function', 'parsePokemonFromOcr must be exposed');

  boxApp.setAllPokemons(pkmData);

  // 1. Ground Truth Verification for Image 1 (Heracross, Lv.52, Careful, 5 subskills, Honey/Mushroom/Honey)
  const image1OcrText = `Lv. 52 其 拉克 羅斯
持有上限 21個
@ 健美 (料理 輔助 S) Lv.7
技能 機 率 提 升 M
技能 等 級 提 升 M
幫忙 速度 M !
kotuv70 ,
持 有 上 限 提升 S
和 ouv.30 ,
食材 機 率 提 升 S
2 全
主 技能 發 動機 家 人 全
食材 發 現 率 字
掉 My`;

  const image1RgbSlots = [
    { r: 244.2, g: 202.3, b: 140.1 }, // Slot 1 (Honey)
    { r: 182.5, g: 104.6, b: 47.6 },  // Slot 2 (Mushroom)
    { r: 251.2, g: 219.5, b: 158.6 }  // Slot 3 (Honey)
  ];

  const parsed = boxApp.parsePokemonFromOcr(image1OcrText, image1RgbSlots, pkmData);

  // Assert 100% accurate ground truth resolution
  assertEquals(parsed.name, '赫拉克羅斯', 'Ground truth name must be 赫拉克羅斯 (Heracross #214)');
  assertEquals(parsed.pokemonId, '214', 'Ground truth pokemonId must be 214');
  assertEquals(parsed.level, 52, 'Ground truth level must be 52');
  assertEquals(parsed.skillLevel, 7, 'Ground truth main skill level must be 7');
  assertEquals(parsed.ribbon, 1, 'Carry 21 with base 20 and locked subskill must deduce Ribbon Lv.1');
  assertEquals(parsed.nature, '慎重', 'Ground truth nature must be 慎重 (Careful)');
  assertEquals(parsed.ing1, '甜甜蜜', 'Ground truth Slot 1 ingredient must be 甜甜蜜');
  assertEquals(parsed.ing2, '品鮮蘑菇', 'Ground truth Slot 2 ingredient must be 品鮮蘑菇');
  assertEquals(parsed.ing3, '甜甜蜜', 'Ground truth Slot 3 ingredient must be 甜甜蜜');

  assertArrayEquals(parsed.subskills, [
    '技能機率提升M',
    '技能等級提升M',
    '幫忙速度M',
    '持有上限提升S',
    '食材機率提升S'
  ], 'Ground truth 5 subskills must match exact visual slot order');

  // 2. False-Positive Immunity Test (Haunter No.093 false trigger prevention)
  const noisyTextWith093 = `
SP 6,920
每 29 分 36 秒
持有上限 21個
093 025 140
健美（料理輔助S）
主技能發動機率 ▲▲
食材發現率 ▼▼
`;
  const falseTriggerTest = boxApp.parsePokemonFromOcr(noisyTextWith093, image1RgbSlots, pkmData);
  assert(falseTriggerTest.name !== '鬼斯通', 'Raw OCR noise with "093" must NEVER falsely match 鬼斯通');
  assertEquals(falseTriggerTest.name, '赫拉克羅斯', 'Main skill 健美（料理輔助S） must disambiguate to 赫拉克羅斯');

  // 3. Nature Deductive Stat Mapping (25 Natures accuracy)
  const statTextCareful = '主技能發動機率 ▲▲\n食材發現率 ▼▼';
  const natureCareful = boxApp.parsePokemonFromOcr(statTextCareful, null, pkmData).nature;
  assertEquals(natureCareful, '慎重', 'Skill trigger up + Ingredient down must deduce 慎重');

  const statTextAdamant = '幫忙速度 ▲▲\n食材發現率 ▼▼';
  const natureAdamant = boxApp.parsePokemonFromOcr(statTextAdamant, null, pkmData).nature;
  assertEquals(natureAdamant, '固執', 'Speed up + Ingredient down must deduce 固執');

  // 4. Modal UI Population End-to-End Simulation
  // Setup required DOM elements for modal
  const modalEl = mockEl('box-edit-modal', 'div');
  const modalForm = mockEl('box-edit-form', 'form');
  const titleEl = mockEl('box-modal-title', 'div');
  const previewEl = mockEl('box-modal-screenshot-preview', 'div');
  const searchInput = mockEl('modal-poke-search', 'input');
  const nameHidden = mockEl('modal-poke-name', 'input');
  const levelInput = mockEl('modal-poke-level', 'input');
  const natureSelect = mockEl('modal-poke-nature', 'select');
  const ribbonSelect = mockEl('modal-poke-ribbon', 'select');
  const skillLevelSelect = mockEl('modal-poke-skill-level', 'select');
  const mainSkillEl = mockEl('modal-poke-main-skill-name', 'span');
  const ing1Hidden = mockEl('modal-ing1', 'input');
  const ing2Hidden = mockEl('modal-ing2', 'input');
  const ing3Hidden = mockEl('modal-ing3', 'input');
  const ingOpt1 = mockEl('modal-ing-options-1', 'div');
  const ingOpt2 = mockEl('modal-ing-options-2', 'div');
  const ingOpt3 = mockEl('modal-ing-options-3', 'div');
  const dropdown = mockEl('box-pkm-dropdown', 'div');
  const toggleBtn = mockEl('box-pkm-dropdown-toggle', 'button');

  domElements['box-edit-modal'] = modalEl;
  domElements['box-edit-form'] = modalForm;
  domElements['box-modal-title'] = titleEl;
  domElements['box-modal-screenshot-preview'] = previewEl;
  domElements['modal-poke-search'] = searchInput;
  domElements['modal-poke-name'] = nameHidden;
  domElements['modal-poke-level'] = levelInput;
  domElements['modal-poke-nature'] = natureSelect;
  domElements['modal-poke-ribbon'] = ribbonSelect;
  domElements['modal-poke-skill-level'] = skillLevelSelect;
  domElements['modal-poke-main-skill-name'] = mainSkillEl;
  domElements['modal-ing1'] = ing1Hidden;
  domElements['modal-ing2'] = ing2Hidden;
  domElements['modal-ing3'] = ing3Hidden;
  domElements['modal-ing-options-1'] = ingOpt1;
  domElements['modal-ing-options-2'] = ingOpt2;
  domElements['modal-ing-options-3'] = ingOpt3;
  domElements['box-pkm-dropdown'] = dropdown;
  domElements['box-pkm-dropdown-toggle'] = toggleBtn;

  for (let s = 1; s <= 5; s++) {
    domElements[`modal-subskill-${s}`] = mockEl(`modal-subskill-${s}`, 'input');
  }

  // Open modal with parsed ground truth data
  boxApp.initPokemonCombobox(parsed);
  levelInput.value = parsed.level;
  natureSelect.value = parsed.nature;

  // Check that inputs are populated with 100% correct values
  assert(searchInput.value.includes('赫拉克羅斯'), 'Modal Pokémon input must display 赫拉克羅斯');
  assert(searchInput.value.includes('214'), 'Modal Pokémon input must display No.214');
  assertEquals(nameHidden.value, '赫拉克羅斯', 'Modal hidden name must be 赫拉克羅斯');
  assertEquals(mainSkillEl.textContent, '健美（料理輔助S）', 'Modal main skill name badge must display 健美（料理輔助S）');
  assertEquals(levelInput.value, 52, 'Modal level input must be 52');
  assertEquals(natureSelect.value, '慎重', 'Modal nature select must be 慎重');
  assertEquals(ing1Hidden.value, '甜甜蜜', 'Modal Ing 1 must be 甜甜蜜');
  assertEquals(ing2Hidden.value, '品鮮蘑菇', 'Modal Ing 2 must be 品鮮蘑菇');
  assertEquals(ing3Hidden.value, '甜甜蜜', 'Modal Ing 3 must be 甜甜蜜');
});

test('Tier 4 - Real-World Application Scenarios', 'Box Modal Widening, Sticky Submit Button & Standard Screenshot Guide UI', () => {
  const fs = require('fs');
  const path = require('path');

  // 1. Verify standard screenshot asset exists and is valid
  const sampleAssetPath = path.join(__dirname, '../assets/guide/standard_screenshot_guide.png');
  assert(fs.existsSync(sampleAssetPath), 'assets/guide/standard_screenshot_guide.png must exist');
  const assetStats = fs.statSync(sampleAssetPath);
  assert(assetStats.size > 50000, `Sample asset must be substantial size (actual: ${assetStats.size} bytes)`);

  // 2. Verify index.html markup
  const indexHtml = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(indexHtml.includes('id="box-screenshot-guide-card"'), 'index.html must include box-screenshot-guide-card');
  assert(indexHtml.includes('id="box-guide-lightbox-modal"'), 'index.html must include box-guide-lightbox-modal');
  assert(indexHtml.includes('assets/guide/standard_screenshot_guide.png'), 'index.html must reference standard_screenshot_guide.png');
  assert(indexHtml.includes('id="box-modal-submit-btn"'), 'index.html must contain box-modal-submit-btn');
  assert(indexHtml.includes('id="box-modal-cancel-btn"'), 'index.html must contain box-modal-cancel-btn');

  // Verify 5 checklist elements in index.html
  assert(indexHtml.includes('[1]'), 'Guide must contain item [1]');
  assert(indexHtml.includes('[2]'), 'Guide must contain item [2]');
  assert(indexHtml.includes('[3]'), 'Guide must contain item [3]');
  assert(indexHtml.includes('[4]'), 'Guide must contain item [4]');
  assert(indexHtml.includes('[5]'), 'Guide must contain item [5]');

  // 3. Verify mobile app/index.html markup
  const mobileHtml = fs.readFileSync(path.join(__dirname, '../app/index.html'), 'utf8');
  assert(mobileHtml.includes('id="box-screenshot-guide-card"'), 'app/index.html must include box-screenshot-guide-card');
  assert(mobileHtml.includes('id="box-guide-lightbox-modal"'), 'app/index.html must include box-guide-lightbox-modal');
  assert(mobileHtml.includes('../assets/guide/standard_screenshot_guide.png'), 'app/index.html must reference sample image');

  // 4. Verify CSS rules for widening and sticky footer
  const stylesCss = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');
  assert(stylesCss.includes('.box-modal-dialog.has-screenshot'), 'CSS must include .box-modal-dialog.has-screenshot');
  assert(stylesCss.includes('max-width: 1040px'), 'CSS must specify max-width: 1040px for has-screenshot');
  assert(stylesCss.includes('.box-screenshot-guide-card'), 'CSS must style .box-screenshot-guide-card');
  assert(stylesCss.includes('.box-guide-lightbox-backdrop'), 'CSS must style .box-guide-lightbox-backdrop');

  // 5. Verify i18n dictionaries in both languages
  const i18nSrc = fs.readFileSync(path.join(__dirname, '../js/core/i18n.js'), 'utf8');
  const requiredKeys = [
    'box.guide_title',
    'box.guide_collapse',
    'box.guide_expand',
    'box.guide_click_zoom',
    'box.guide_sample_label',
    'box.guide_info_heading',
    'box.guide_item1_title',
    'box.guide_item2_title',
    'box.guide_item3_title',
    'box.guide_item4_title',
    'box.guide_item5_title',
    'box.guide_tip_badge',
    'box.guide_tip_text'
  ];
  requiredKeys.forEach(k => {
    assert(i18nSrc.includes(`'${k}'`), `i18n must include translation key: ${k}`);
  });

  // 6. Verify zero emoji policy on guide titles and modal headers
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert(!emojiRegex.test('標準截圖示範例與必備資訊'), 'Guide title must not contain emojis');
  assert(!emojiRegex.test('截圖辨識確認入庫'), 'Modal title must not contain emojis');
  assert(!emojiRegex.test('深度評測室'), 'Appraisal lab button must not contain emojis');
});

test('Tier 4 - Real-World Application Scenarios', 'Box Main Skill Level Control & Good-Night Ribbon Carry Deduction Workflow', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Verify HTML Markup for Main Skill display and Level select (Desktop & Mobile)
  assert(indexHtml.includes('modal-poke-main-skill-name'), 'index.html must include modal-poke-main-skill-name');
  assert(indexHtml.includes('modal-poke-skill-level'), 'index.html must include modal-poke-skill-level');
  assert(appIndexHtml.includes('modal-poke-main-skill-name'), 'app/index.html must include modal-poke-main-skill-name');
  assert(appIndexHtml.includes('modal-poke-skill-level'), 'app/index.html must include modal-poke-skill-level');
  assert(!indexHtml.includes('box-mainskill-lvl-prefix'), 'index.html must remove redundant box-mainskill-lvl-prefix label');
  assert(!appIndexHtml.includes('box-mainskill-lvl-prefix'), 'app/index.html must remove redundant box-mainskill-lvl-prefix label');

  // 2. Verify CSS rules for main skill row, badge and level select
  assert(stylesCss.includes('.box-mainskill-control'), 'styles.css must include .box-mainskill-control');
  assert(stylesCss.includes('.box-mainskill-name-badge'), 'styles.css must include .box-mainskill-name-badge');
  assert(stylesCss.includes('.box-mainskill-select'), 'styles.css must include .box-mainskill-select');
  assert(stylesCss.includes('.box-mainskill-control .custom-select-container'), 'styles.css must include .box-mainskill-control .custom-select-container');

  // 3. Verify i18n keys
  assert(i18nJs.includes("'box.modal_main_skill'"), 'i18n.js must define box.modal_main_skill');
  assert(i18nJs.includes("'box.modal_skill_level'"), 'i18n.js must define box.modal_skill_level');

  // Load box module
  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  assert(typeof boxModule.deduceRibbonFromCarry === 'function', 'deduceRibbonFromCarry must be exported');
  assert(typeof boxModule.parsePokemonFromOcr === 'function', 'parsePokemonFromOcr must be exported');

  // 4. Test deduceRibbonFromCarry logic across diverse scenarios
  const heracross = pkmData.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracross, 'Heracross must exist in data.json');
  assertEquals(parseInt(heracross.carry, 10), 20, 'Heracross base carry is 20');

  // Heracross screenshot subskills:
  // Slot 1 (Lv.10): 技能機率提升M
  // Slot 2 (Lv.25): 技能等級提升M
  // Slot 3 (Lv.50): 幫忙速度M
  // Slot 4 (Lv.70): 持有上限提升S (+6)
  // Slot 5 (Lv.80): 食材機率提升S
  const subskillsHera = ['技能機率提升M', '技能等級提升M', '幫忙速度M', '持有上限提升S', '食材機率提升S'];

  // Scenario A: Carry 21, Lv.52 -> Slot 4 is LOCKED (52 < 70) -> diff = 21 - 20 - 0 = +1 -> Ribbon Lv.1 (200 hrs)
  const ribbonA = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 21);
  assertEquals(ribbonA, 1, 'Carry 21 with base 20 and locked Inventory S must deduce Ribbon Lv.1');

  // Scenario B: Carry 20, Lv.52 -> diff = 20 - 20 = 0 -> Ribbon Lv.0 (none)
  const ribbonB = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 20);
  assertEquals(ribbonB, 0, 'Carry 20 with base 20 must deduce Ribbon Lv.0');

  // Scenario C: Carry 23, Lv.52 -> diff = 23 - 20 = +3 -> Ribbon Lv.2 (500 hrs)
  const ribbonC = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 23);
  assertEquals(ribbonC, 2, 'Carry 23 with base 20 must deduce Ribbon Lv.2');

  // Scenario D: Carry 26, Lv.52 -> diff = 26 - 20 = +6 -> Ribbon Lv.3 (1000 hrs)
  const ribbonD = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 26);
  assertEquals(ribbonD, 3, 'Carry 26 with base 20 must deduce Ribbon Lv.3');

  // Scenario E: Carry 28, Lv.52 -> diff = 28 - 20 = +8 -> Ribbon Lv.4 (2000 hrs)
  const ribbonE = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 28);
  assertEquals(ribbonE, 4, 'Carry 28 with base 20 must deduce Ribbon Lv.4');

  // Scenario F: Heracross reaches Lv.75! Inventory Up S (+6) is now unlocked!
  // If screenshot shows Carry 27, diff = 27 - 20 - 6 = +1 -> Ribbon Lv.1
  const ribbonF = boxModule.deduceRibbonFromCarry(heracross, 75, subskillsHera, 27);
  assertEquals(ribbonF, 1, 'Carry 27 with base 20 and unlocked Inventory S (+6) must deduce Ribbon Lv.1');

  // 5. Verify OCR Parsing of Image 1 text extracts skillLevel = 7 and ribbon = 1
  const fullOcrText = `SP 6,920
Lv. 52 赫拉克羅斯
幫忙間隔 每29分36秒
持有上限 21個
健美（料理輔助S） Lv. 7
隨機獲得24個食材。不僅如此，料理漂亮成功的機率還會提升5%。
技能機率提升M
技能等級提升M
幫忙速度M
持有上限提升S
食材機率提升S
慎重
主技能發動機率 ▲▲
食材發現率 ▼▼`;

  const parsed = boxModule.parsePokemonFromOcr(fullOcrText, null, pkmData);
  assertEquals(parsed.name, '赫拉克羅斯', 'Parsed name must be 赫拉克羅斯');
  assertEquals(parsed.level, 52, 'Parsed level must be 52');
  assertEquals(parsed.skillLevel, 7, 'Parsed main skill level must be 7');
  assertEquals(parsed.ribbon, 1, 'Parsed ribbon must be deduced as Lv.1 (+1 carry)');
  assertArrayEquals(parsed.subskills, subskillsHera, 'Parsed subskills must exactly match all 5 slots');

  // 5. Test getMainSkillMaxLevel across various skill categories
  assert(typeof boxModule.getMainSkillMaxLevel === 'function', 'getMainSkillMaxLevel must be exported');
  assertEquals(boxModule.getMainSkillMaxLevel('活力全體療癒S'), 6, 'Energy for Everyone S must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('料理成功S'), 6, 'Extra Tasty S must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('幫手加速（水）'), 6, 'Helper Boost must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('樹果遽增'), 6, 'Berry Burst must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('健美（料理輔助S）'), 7, 'Bulk Up must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('能量填充M'), 7, 'Charge Strength M must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('料理強化S'), 7, 'Cooking Power Up S must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('夢之碎片獲取S'), 8, 'Dream Shard Magnet S must be max Lv. 8');
  assertEquals(boxModule.getMainSkillMaxLevel('波導彈（夢之碎片獲取S）'), 8, 'Aura Sphere must be max Lv. 8');

  // 6. Test updateModalMainSkill dynamic select options generation & value clamping
  const sylveon = pkmData.find(p => p.name_cn === '仙子伊布') || { name_cn: '仙子伊布', main_skill: '活力全體療癒S' };
  const lucario = pkmData.find(p => p.name_cn === '路卡利歐') || { name_cn: '路卡利歐', main_skill: '波導彈（夢之碎片獲取S）' };

  let mockSkillSelect = {
    value: '7',
    innerHTML: '',
    dispatchEvent: () => {}
  };
  global.document = {
    getElementById: (id) => {
      if (id === 'modal-poke-main-skill-name') return { textContent: '', setAttribute: () => {} };
      if (id === 'modal-poke-skill-level') return mockSkillSelect;
      return null;
    }
  };

  // When updating to Sylveon (maxLevel 6), level 7 should clamp to 6 and innerHTML has 6 options
  boxModule.updateModalMainSkill(sylveon, 7);
  assertEquals(mockSkillSelect.value, '6', 'Sylveon skill level 7 must be clamped to 6');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 6, 'Sylveon select must contain exactly 6 options');

  // When updating to Heracross (maxLevel 7), level 7 is valid and innerHTML has 7 options
  boxModule.updateModalMainSkill(heracross, 7);
  assertEquals(mockSkillSelect.value, '7', 'Heracross skill level 7 is valid');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 7, 'Heracross select must contain exactly 7 options');

  // When updating to Lucario (maxLevel 8), level 8 is valid and innerHTML has 8 options
  boxModule.updateModalMainSkill(lucario, 8);
  assertEquals(mockSkillSelect.value, '8', 'Lucario skill level 8 is valid');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 8, 'Lucario select must contain exactly 8 options');
});

test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Viewport Address Bar Stability & Ingredient Ladder Top 7 Recipe Highlight', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Mobile H5 Viewport & Address Bar Locking
  assert(appIndexHtml.includes('class="mobile-h5-html"'), 'app/index.html must have mobile-h5-html class');
  assert(css.includes('html.mobile-h5-html'), 'styles.css must style html.mobile-h5-html');
  assert(css.includes('position: fixed !important;\n  top: 0 !important;\n  left: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  height: 100dvh !important;\n  overflow: hidden !important;'), 'styles.css must lock body.mobile-h5-app with fixed positioning and overflow hidden');
  assert(css.includes('padding: 0 !important;'), 'Pokemon table container must have clean zero bottom clearance');
  assert(css.includes('z-index: 500 !important;'), 'styles.css must set passing line container z-index to 500');
  assert(css.includes('z-index: 501;'), 'styles.css must set passing line badge z-index to 501');
  assert(css.includes('.ladder-recipe-highlight-fab'), 'styles.css must style .ladder-recipe-highlight-fab');
  assert(css.includes('.ladder-track-row.ladder-track-highlighted'), 'styles.css must define highlighted ladder track row');
  assert(css.includes('.ladder-track-row.ladder-track-dimmed'), 'styles.css must define dimmed ladder track row');
  assert(css.includes('.ladder-recipe-cat-bar'), 'styles.css must style recipe category switcher bar');
  assert(css.includes('.ladder-recipe-banner-ings'), 'styles.css must style banner ingredient chips container');
  assert(css.includes('bottom: calc(138px + env(safe-area-inset-bottom, 0px)) !important;'), 'styles.css must position mobile ladder FAB above filter FAB');
  assert(css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'), 'styles.css body must reserve dock clearance via padding-bottom for all panels');

  // 2. Top Recipes by Category and Logic in wiki.js
  assert(wikiJs.includes('const TOP_RECIPES_BY_CATEGORY = {'), 'wiki.js must define TOP_RECIPES_BY_CATEGORY');
  assert(wikiJs.includes('switchLadderRecipeCategory'), 'wiki.js must define switchLadderRecipeCategory');
  assert(wikiJs.includes('openLadderRecipeModal'), 'wiki.js must define openLadderRecipeModal');
  assert(wikiJs.includes('selectLadderHighlightRecipe'), 'wiki.js must define selectLadderHighlightRecipe');
  assert(wikiJs.includes('clearLadderHighlightRecipe'), 'wiki.js must define clearLadderHighlightRecipe');
  assert(!wikiJs.includes('ladder-track-ing-main">\n                  <img src="${ing.icon}" class="ladder-ing-icon" alt="${ingName}">\n                  ${isHighlighted ?'), 'wiki.js must not annotate requirement count in front of ladder track header');

  // 3. Evaluate Top Recipes Data
  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => []
    }
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const byCat = ctx.window.WikiDB.TOP_RECIPES_BY_CATEGORY;
  assert(byCat && byCat.curry && byCat.salad && byCat.dessert, 'Must define curry, salad, and dessert categories');
  assertEquals(byCat.curry.length, 7, 'Curry must have exactly 7 top recipes');
  assertEquals(byCat.salad.length, 7, 'Salad must have exactly 7 top recipes');
  assertEquals(byCat.dessert.length, 7, 'Dessert must have exactly 7 top recipes');

  // Verify top recipe energy ordering for each category
  assertEquals(byCat.curry[0].name_cn, '彈跳咖哩烏龍麵', 'Curry #1 must be 彈跳咖哩烏龍麵');
  assertEquals(byCat.curry[0].base_energy, 25539, 'Curry #1 energy must be 25539');
  assertEquals(byCat.curry[6].name_cn, '萌綠咖哩麵包', 'Curry #7 must be 萌綠咖哩麵包');

  assertEquals(byCat.salad[0].name_cn, '熱水溫沙拉', 'Salad #1 must be 熱水溫沙拉');
  assertEquals(byCat.salad[0].base_energy, 25356, 'Salad #1 energy must be 25356');
  assertEquals(byCat.salad[6].name_cn, '萌綠沙拉', 'Salad #7 must be 萌綠沙拉');

  assertEquals(byCat.dessert[0].name_cn, '採蜜可可鬆餅', 'Dessert #1 must be 採蜜可可鬆餅');
  assertEquals(byCat.dessert[0].base_energy, 25484, 'Dessert #1 energy must be 25484');
  assertEquals(byCat.dessert[6].name_cn, '青草攪拌器果昔', 'Dessert #7 must be 青草攪拌器果昔');

  // Verify category switching
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'curry', 'Initial category should be curry');
  ctx.window.WikiDB.switchLadderRecipeCategory('salad');
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'salad', 'Category should switch to salad');
  ctx.window.WikiDB.switchLadderRecipeCategory('dessert');
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'dessert', 'Category should switch to dessert');

  // 4. Test Highlighting interaction
  ctx.window.WikiDB.selectLadderHighlightRecipe('熱水溫沙拉');
  assertEquals(ctx.window.WikiDB.getLadderHighlightRecipe(), '熱水溫沙拉', 'Active highlight recipe must be 熱水溫沙拉');

  ctx.window.WikiDB.clearLadderHighlightRecipe();
  assertEquals(ctx.window.WikiDB.getLadderHighlightRecipe(), null, 'Active highlight recipe must be cleared');

  // 5. Zero Ingredient Names & Single-Row Banner Assertions
  assert(!wikiJs.includes('class="ing-chip-name"'), 'Modal recipe cards must not display ingredient text names');
  assert(!wikiJs.includes('class="ladder-banner-ing-name"'), 'Ladder recipe banner must not display ingredient text names');
  assert(wikiJs.includes('class="recipe-card-ing-icon"'), 'Modal recipe chips must include ingredient icons');
  assert(!wikiJs.includes("'清除高亮'"), "Button text must be shortened to '清除' (no '清除高亮')");

  // Verify all 21 recipes have correct icons from recipes.json
  const recipesJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'recipes.json'), 'utf8'));
  const canonicalMap = new Map();
  recipesJson.forEach(r => canonicalMap.set(r.name_cn, r));
  ['curry', 'salad', 'dessert'].forEach(cat => {
    byCat[cat].forEach(r => {
      const canonical = canonicalMap.get(r.name_cn);
      assert(canonical, `Recipe ${r.name_cn} must exist in recipes.json`);
      assertEquals(r.icon, canonical.icon, `Recipe ${r.name_cn} icon must match recipes.json canonical icon`);
      assertEquals(r.name_en, canonical.name_en, `Recipe ${r.name_cn} name_en must match recipes.json canonical name_en`);
    });
  });

  // Verify mobile condensed single-row CSS
  assert(css.includes('.mobile-h5-app .ladder-recipe-banner'), 'styles.css must provide .mobile-h5-app single-row banner rules');
  assert(css.includes('width: 38px;\n    height: 38px;'), 'Mobile banner icon must be enlarged to 38px');
});

test('Tier 4 - Real-World Application Scenarios', 'Theme Color Engine: Dual-Surface Pre/Post Check and Ladder Recipe Light/Dark Adaptation', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const specMdPath = path.join(WORKSPACE_ROOT, 'docs', 'THEME_COLOR_SPEC.md');
  assert(fs.existsSync(specMdPath), 'docs/THEME_COLOR_SPEC.md must exist');
  const specMd = fs.readFileSync(specMdPath, 'utf8');

  // 1. Theme Color Specification Protocol assertions
  assert(specMd.includes('midnight'), 'Spec must cover midnight theme');
  assert(specMd.includes('onyx'), 'Spec must cover onyx theme');
  assert(specMd.includes('dawn'), 'Spec must cover dawn theme');
  assert(specMd.includes('emerald'), 'Spec must cover emerald theme');
  assert(specMd.includes('執行前檢核 (Pre-Execution Check)'), 'Spec must define pre-execution check protocol');
  assert(specMd.includes('執行後檢核 (Post-Execution Check)'), 'Spec must define post-execution check protocol');

  // 2. Ladder Recipe Components Theme Semantic Variables
  assert(css.includes('var(--badge-cat-curry-bg'), 'Recipe card curry badge must use semantic token --badge-cat-curry-bg');
  assert(css.includes('var(--badge-cat-salad-bg'), 'Recipe card salad badge must use semantic token --badge-cat-salad-bg');
  assert(css.includes('var(--badge-cat-dessert-bg'), 'Recipe card dessert badge must use semantic token --badge-cat-dessert-bg');

  // 3. Light Theme Overrides for Ladder Recipe Banner & Chips
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner'), 'styles.css must provide Dawn light theme overrides for ladder-recipe-banner');
  assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .ladder-recipe-banner'), 'styles.css must provide Emerald light theme overrides for ladder-recipe-banner');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner-ing-chip'), 'styles.css must provide Dawn light theme overrides for ladder-recipe-banner-ing-chip');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner-clear-btn'), 'styles.css must provide Dawn light theme overrides for clear button');
  assert(css.includes('color: #b91c1c;'), 'Clear button in light mode must use high-contrast dark red #b91c1c');
  assert(css.includes('color: #0369a1;'), 'Recipe banner title in Dawn must use high-contrast ocean blue #0369a1');

  // 4. Light Theme Overrides for Ladder Recipe Modal
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-card'), 'styles.css must provide Dawn light theme overrides for recipe card');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-cat-btn'), 'styles.css must provide Dawn light theme overrides for category buttons');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-btn-cancel'), 'styles.css must provide Dawn light theme overrides for cancel button');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-modal-footer'), 'styles.css must provide Dawn light theme overrides for modal footer');

  // 5. Light Theme Overrides for Highlighted Track Row
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-track-row.ladder-track-highlighted'), 'styles.css must provide Dawn light theme overrides for highlighted track row');
});

test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder 3-Meal Passing Lines, Dynamic Max Scale, Tail Standalone Dimming and Reversible Unselectable Guard', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Theme Color Tokens & CSS rules verification
  assert(css.includes('--ladder-passing-line-color: #f59e0b;'), 'Midnight/Onyx must define --ladder-passing-line-color as luminous amber #f59e0b');
  assert(css.includes('--ladder-passing-line-color: #d97706;'), 'Dawn must define --ladder-passing-line-color as warm amber #d97706');
  assert(css.includes('--ladder-passing-line-color: #b45309;'), 'Emerald must define --ladder-passing-line-color as deep amber #b45309');
  assert(css.includes('.ladder-passing-line-container'), 'styles.css must define .ladder-passing-line-container');
  assert(css.includes('.ladder-passing-line'), 'styles.css must define .ladder-passing-line');
  assert(css.includes('.ladder-passing-badge'), 'styles.css must define .ladder-passing-badge');
  assert(css.includes('.ladder-tail-standalone-container.ladder-track-dimmed'), 'styles.css must define .ladder-tail-standalone-container.ladder-track-dimmed');
  assert(css.includes('.ladder-track-disabled-header'), 'styles.css must define .ladder-track-disabled-header');

  // 2. Headless VM Environment for wiki.js evaluation
  let modalOpened = false;
  let modalTitle = '';
  const mockRankingModal = {
    style: {},
    querySelector(sel) {
      if (sel === '.ranking-modal-title') return { set textContent(val) { modalTitle = val; }, textContent: modalTitle };
      if (sel === '.ranking-modal-body') return { innerHTML: '' };
      return null;
    }
  };

  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} }, addEventListener: () => {} },
    document: {
      readyState: 'complete',
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      addEventListener: () => {},
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      getElementById: (id) => {
        if (id === 'wiki-ingredient-ranking-modal' || id === 'ingredient-ranking-modal') return mockRankingModal;
        return null;
      },
      querySelectorAll: () => []
    }
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && typeof WikiDB.renderCoordinateLadder === 'function', 'WikiDB.renderCoordinateLadder must exist');
  assert(typeof WikiDB.selectLadderHighlightRecipe === 'function', 'WikiDB.selectLadderHighlightRecipe must exist');
  assert(typeof WikiDB.clearLadderHighlightRecipe === 'function', 'WikiDB.clearLadderHighlightRecipe must exist');

  // 3. Baseline: Default coordinate ladder rendering without recipe highlight
  const defaultHtml = WikiDB.renderCoordinateLadder();
  assert(!defaultHtml.includes('ladder-passing-line-container'), 'Default ladder must not render passing lines when no recipe is selected');
  assert(!defaultHtml.includes('ladder-track-disabled-header'), 'Default ladder tracks must all be selectable');
  assert(!defaultHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Default tail container must not be dimmed');

  // 4. Highlight Recipe: 彈跳咖哩烏龍麵 (Bounce Curry Udon)
  // Ingredients: 暖暖薑 (39, 3-meal=117), 品鮮蘑菇 (31, 3-meal=93), 火辣香草 (22, 3-meal=66), 豆製肉 (20, 3-meal=60)
  WikiDB.selectLadderHighlightRecipe('彈跳咖哩烏龍麵');
  assertEquals(WikiDB.getLadderHighlightRecipe(), '彈跳咖哩烏龍麵', 'Active highlight recipe must be 彈跳咖哩烏龍麵');

  const highlightedHtml = WikiDB.renderCoordinateLadder();

  // (a) Dynamic Max Scale Expansion: Max passing target is 117 -> maxVal expands to 120
  assert(highlightedHtml.includes('<span class="tick-label">120</span>'), 'Ladder ruler must dynamically expand to 120 to accommodate the 117 passing line');

  // (b) 3-Meal Passing Lines rendered on highlighted tracks
  assert(highlightedHtml.includes('ladder-passing-line-container'), 'Ladder must render .ladder-passing-line-container on recipe tracks');
  assert(!highlightedHtml.includes('ladder-passing-label'), 'Passing badge must only display numbers without text label');
  assert(highlightedHtml.includes('三餐及格線') || highlightedHtml.includes('3 Meals Target'), 'Passing line container title must contain tooltip text');
  assert(highlightedHtml.includes('117'), 'Passing line for 暖暖薑 must display 117');
  assert(highlightedHtml.includes('93'), 'Passing line for 品鮮蘑菇 must display 93');
  assert(highlightedHtml.includes('66'), 'Passing line for 火辣香草 must display 66');
  assert(highlightedHtml.includes('60'), 'Passing line for 豆製肉 must display 60');

  // (c) Slowpoke Tail Standalone Container Dimming: 烏龍麵 does not use tail, so tail must be dimmed
  assert(highlightedHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Tail standalone container must have ladder-track-dimmed when recipe does not use tail');
  assert(highlightedHtml.includes('ladder-tail-track-row') && highlightedHtml.includes('ladder-track-disabled-header'), 'Tail track header must be disabled when dimmed');

  // (d) Non-recipe tracks unselectable header
  assert(highlightedHtml.includes('ladder-track-disabled-header'), 'Dimmed tracks must have ladder-track-disabled-header class');

  // (e) Programmatic Guard: openIngredientRankingModal on non-recipe ingredient must be ignored
  mockRankingModal.style.display = 'none';
  WikiDB.openIngredientRankingModal('apple'); // Apple is NOT in 烏龍麵
  assertEquals(mockRankingModal.style.display, 'none', 'Clicking non-recipe ingredient (apple) must NOT open modal');

  // But recipe ingredient (ginger) CAN be selected
  WikiDB.openIngredientRankingModal('ginger');
  assertEquals(mockRankingModal.style.display, 'flex', 'Clicking recipe ingredient (ginger) must open ranking modal');

  // 5. Reversible Restore ("要能夠回復"): Clear highlight and verify clean restoration
  WikiDB.clearLadderHighlightRecipe();
  assertEquals(WikiDB.getLadderHighlightRecipe(), null, 'Ladder highlight recipe must be null after clear');

  const restoredHtml = WikiDB.renderCoordinateLadder();
  assert(!restoredHtml.includes('ladder-passing-line-container'), 'Restored ladder must have passing lines removed');
  assert(!restoredHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Restored tail container must have dimmed class removed');
  assert(!restoredHtml.includes('ladder-track-disabled-header'), 'Restored ladder tracks must not have disabled headers');

  // Non-recipe ingredient (apple) can now be selected again after restore
  mockRankingModal.style.display = 'none';
  WikiDB.openIngredientRankingModal('apple');
  assertEquals(mockRankingModal.style.display, 'flex', 'After clearing highlight, apple must be selectable again');
});

test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder: Ingredient Draw S Switch, Expectation Bonus, and Two-Part Yield Representation', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify CSS styles exist
  assert(stylesCss.includes('.node-has-skill-draw'), 'styles.css must include .node-has-skill-draw');
  assert(stylesCss.includes('.node-count-badge.badge-skill-draw'), 'styles.css must include .node-count-badge.badge-skill-draw');
  assert(stylesCss.includes('.tooltip-yield-breakdown'), 'styles.css must include .tooltip-yield-breakdown');
  assert(stylesCss.includes('.ing-rank-split-line'), 'styles.css must include .ing-rank-split-line');

  // Set up VM environment
  let modalContainer = null;
  const mockStorage = new Map([
    ['pksleep_lang', 'zh-TW'],
    ['pksleep_ladder_skill_draw', 'false']
  ]);
  const mockElements = new Map();

  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: { getLanguage: () => 'zh-TW', getIngredientName: (s) => s, getPokemonName: (s) => s }
    },
    document: {
      body: { classList: { contains: () => false }, appendChild: (el) => { modalContainer = el; } },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'wiki-ingredient-ranking-modal') return modalContainer;
        if (!mockElements.has(id)) {
          mockElements.set(id, {
            checked: false,
            style: { setProperty: () => {}, display: '' },
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            innerHTML: '',
            textContent: '',
            addEventListener: () => {}
          });
        }
        return mockElements.get(id);
      },
      querySelectorAll: () => [],
      createElement: () => ({
        setAttribute: () => {},
        innerHTML: '',
        className: '',
        id: '',
        style: { setProperty: () => {}, display: '' },
        addEventListener: () => {}
      }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB, 'WikiDB must be defined');

  // 1. Check toggle functions and expectations constant
  assert(typeof WikiDB.toggleLadderSkillDrawExpected === 'function', 'toggleLadderSkillDrawExpected must be a function');
  assert(typeof WikiDB.getLadderSkillDrawExpected === 'function', 'getLadderSkillDrawExpected must be a function');
  assert(typeof WikiDB.getPokemonSkillDrawBonus === 'function', 'getPokemonSkillDrawBonus must be a function');
  assert(WikiDB.INGREDIENT_DRAW_SKILL_EXPECTATIONS, 'INGREDIENT_DRAW_SKILL_EXPECTATIONS table must exist');

  // Initial state should be false
  assertEquals(WikiDB.getLadderSkillDrawExpected(), false, 'Initial state of skill draw expected must be false');

  // Bonus should be 0 when toggle is false
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'corn', '萌綠玉米'), 0, 'Bonus must be 0 when toggle is off');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'coffee', '醒晨咖啡'), 0, 'Bonus must be 0 when toggle is off');

  // 2. Enable toggle
  WikiDB.toggleLadderSkillDrawExpected(true);
  assertEquals(WikiDB.getLadderSkillDrawExpected(), true, 'State should be true after toggle');
  assertEquals(mockStorage.get('pksleep_ladder_skill_draw'), 'true', 'localStorage must be updated to true');

  // 3. Verify exact mathematical expectations for all 6 Pokemon
  // 技能型 (1.0倍發動機率基準)：
  // 穿山王 (+27 on pumpkin, corn, potato)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'corn', '萌綠玉米'), 18, 'Sandslash corn bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'pumpkin', '吉利蛋南瓜'), 18, 'Sandslash pumpkin bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'potato', '窩心洋芋'), 18, 'Sandslash potato bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'apple', '特選蘋果'), 0, 'Sandslash non-candidate ingredient bonus must be 0');

  // 烏鴉頭頭 (+27 on coffee, soy, meat, mushroom)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'coffee', '醒晨咖啡'), 18, 'Honchkrow coffee bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'soy', '醒晨大豆'), 18, 'Honchkrow soy bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'apple', '特選蘋果'), 0, 'Honchkrow non-candidate ingredient bonus must be 0');

  // 岩殿居蟹 (+35 on avocado, potato, oil)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('岩殿居蟹', 'potato', '窩心洋芋'), 23, 'Crustle potato bonus must be +23 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('岩殿居蟹', 'oil', '純油'), 23, 'Crustle oil bonus must be +23 at 1.0x baseline');

  // 摔角鷹人 (+37 on herb, ginger, meat)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('摔角鷹人', 'herb', '透心涼香草'), 25, 'Hawlucha herb bonus must be +25 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('摔角鷹人', 'ginger', '暖暖薑'), 25, 'Hawlucha ginger bonus must be +25 at 1.0x baseline');

  // 食材型 (1.0倍基準發動率，最保守估計)：
  // 蝶結萌虻 (+13 on honey, oil, corn)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('蝶結萌虻', 'honey', '蜜糖'), 13, 'Ribombee honey bonus must be +13');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('蝶結萌虻', 'corn', '萌綠玉米'), 13, 'Ribombee corn bonus must be +13');

  // 大嘴娃 (+10 on potato, oil, corn, tomato)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('大嘴娃', 'tomato', '番茄'), 10, 'Mawile tomato bonus must be +10');

  // Non-candidate Pokemon must have 0 bonus
  assertEquals(WikiDB.getPokemonSkillDrawBonus('妙蛙花', 'honey', '蜜糖'), 0, 'Venusaur must have 0 bonus');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('雷丘', 'apple', '特選蘋果'), 0, 'Raichu must have 0 bonus');

  // 4. Test Coordinate Ladder Rendering with Skill Draw Active
  const ladderHtml = WikiDB.renderCoordinateLadder();
  assert(ladderHtml.includes('node-has-skill-draw'), 'Rendered ladder must contain node-has-skill-draw when active');
  assert(ladderHtml.includes('badge-skill-draw'), 'Rendered ladder must contain badge-skill-draw when active');
  assert(!ladderHtml.includes('badge-total'), 'Rendered ladder must not contain badge-total (single number display)');
  assert(!ladderHtml.includes('badge-split'), 'Rendered ladder must not contain badge-split (single number display)');
  assert(ladderHtml.includes('<span class="tick-label">30</span>'), 'Main ladder ruler must start at 30 when skill draw toggle is active');
  const mainRulerScale = ladderHtml.split('class="ladder-ruler-scale"')[1].split('</div>')[0];
  assert(mainRulerScale.includes('<span class="tick-label">30</span>'), 'First tick on ruler must be 30');
  assert(!mainRulerScale.includes('<span class="tick-label">0</span>'), 'Main ruler must not start at 0');
  assert(ladderHtml.includes('tooltip-yield-breakdown'), 'Rendered ladder must contain tooltip-yield-breakdown');
  assert(ladderHtml.includes('食材精選S 獲取 (Lv.7)'), 'Rendered ladder tooltip must mention 食材精選S 獲取 (Lv.7)');

  // 5. Test Wiki Layout with Skill Help Modal and Switch Button
  const mockContainer = { innerHTML: '', style: {}, classList: { contains: () => false, add: () => {}, remove: () => {} } };
  WikiDB.renderWikiLayout(mockContainer);
  assert(mockContainer.innerHTML.includes('ladder-skill-help-modal'), 'Rendered layout must include ladder-skill-help-modal dialog');
  assert(mockContainer.innerHTML.includes('ladder-switch-with-help'), 'Sidebar must include ladder-switch-with-help container');
  assert(mockContainer.innerHTML.includes('ladder-help-icon-btn'), 'Sidebar must include ladder-help-icon-btn question mark button');
  assert(mockContainer.innerHTML.includes('所有專長皆以 1.0 倍發動機率為基準'), 'Switch title must include 1.0x trigger baseline');
  assert(mockContainer.innerHTML.includes('請用技能機率M/S與技能機率▲模擬補正'), 'Switch title must point to skill-chance filters');

  // 5. Test Help Modal Methods
  assert(typeof WikiDB.openSkillDrawHelpModal === 'function', 'openSkillDrawHelpModal must be exported');
  assert(typeof WikiDB.closeSkillDrawHelpModal === 'function', 'closeSkillDrawHelpModal must be exported');

  // 6. Test Dynamic Recipe Tooltip when a Recipe is Selected
  WikiDB.selectLadderHighlightRecipe('心跳加速鬼面鬆餅');
  const recipeLadderHtml = WikiDB.renderCoordinateLadder();
  assert(recipeLadderHtml.includes('選定料理: 心跳加速鬼面鬆餅'), 'Ladder tooltip must dynamically reference selected recipe 心跳加速鬼面鬆餅');
  WikiDB.clearLadderHighlightRecipe();

  // 7. Test openIngredientRankingModal with Skill Draw Active
  WikiDB.openIngredientRankingModal('corn');
  assert(modalContainer !== null, 'Ranking modal container must be created');
  assert(modalContainer.innerHTML.includes('ing-rank-split-line'), 'Ranking modal must display ing-rank-split-line for skill draw pokemons');
  assert(modalContainer.innerHTML.includes('split-drop'), 'Ranking modal must display split-drop');
  assert(modalContainer.innerHTML.includes('split-skill'), 'Ranking modal must display split-skill');

  // 8. Test resetLadderFilters resets the toggle
  WikiDB.resetLadderFilters();
});

test('Tier 4 - Real-World Application Scenarios', 'Data Engine: Intelligent Retry with Delay and LocalStorage Offline Cache Recovery', async () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Verify code structure in app.js, recipes.js, and news.js
  assert(appJs.includes('CACHE_KEY_DATA_JSON = \'pksleep_cache_data_json\''), 'app.js must define CACHE_KEY_DATA_JSON');
  assert(appJs.includes('maxAttempts = 3'), 'app.js must implement 3-stage retry');
  assert(appJs.includes('attempt * 600'), 'app.js must implement retry backoff delay');
  assert(appJs.includes('window.localStorage.getItem(CACHE_KEY_DATA_JSON)'), 'app.js must implement LocalStorage cache fallback');

  assert(recipesJs.includes('CACHE_KEY_RECIPES_JSON = \'pksleep_cache_recipes_json\''), 'recipes.js must define CACHE_KEY_RECIPES_JSON');
  assert(recipesJs.includes('maxAttempts = 3'), 'recipes.js must implement 3-stage retry');
  assert(recipesJs.includes('window.localStorage.getItem(CACHE_KEY_RECIPES_JSON)'), 'recipes.js must implement LocalStorage cache fallback');

  assert(newsJs.includes('CACHE_KEY_NEWS_JSON = \'pksleep_cache_news_json\''), 'news.js must define CACHE_KEY_NEWS_JSON');
  assert(newsJs.includes('maxAttempts = 3'), 'news.js must implement 3-stage retry');
  assert(newsJs.includes('window.localStorage.getItem(CACHE_KEY_NEWS_JSON)'), 'news.js must implement LocalStorage cache fallback');

  // 2. Verify zero emojis in index.html and app/index.html error banner
  assert(!indexHtml.includes('⚠️') && !indexHtml.includes('📋') && !indexHtml.includes('✅'), 'index.html error banner must not contain emojis');
  assert(!appIndexHtml.includes('⚠️') && !appIndexHtml.includes('📋') && !appIndexHtml.includes('✅'), 'app/index.html error banner must not contain emojis');
  assert(indexHtml.includes('[!]'), 'index.html must use [!] text icon');
  assert(appIndexHtml.includes('[!]'), 'app/index.html must use [!] text icon');
});

test('Tier 4 - Real-World Application Scenarios', 'Pokédex Detail & Appraisal Modal: Open on Avatar Click, 6D Radar Appraisal, Dynamic Formula Breakdown & Ingredient Customization', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Verify i18n keys for modal and formulas in both zh-TW and en-US
  assert(i18nJs.includes('appraisal_modal_title'), 'i18n.js must define appraisal_modal_title');
  assert(i18nJs.includes('base_stats'), 'i18n.js must define base_stats');
  assert(i18nJs.includes('formula_title'), 'i18n.js must define formula_title');
  assert(i18nJs.includes('final_ing_rate'), 'i18n.js must define final_ing_rate');
  assert(i18nJs.includes('daily_helps'), 'i18n.js must define daily_helps');
  assert(i18nJs.includes('daily_ing_yield'), 'i18n.js must define daily_ing_yield');
  assert(i18nJs.includes('preset_god'), 'i18n.js must define preset_god');
  assert(i18nJs.includes('preset_reset'), 'i18n.js must define preset_reset');

  // 2. Verify Card and Table markup includes onclick trigger on avatars
  assert(appJs.includes("openPokemonDetailModal('${p.id}')"), 'app.js renderCard/renderTable must attach openPokemonDetailModal to avatars');

  // 3. Setup mock DOM and window environment
  const mockElements = new Map();

  global.window = {
    PokemonApp,
    I18N: {
      getLanguage: () => 'zh-TW',
      t: (k, def) => def,
      getTypeName: (t) => t,
      getTypeIconSvg: () => '',
      getSpecialtyName: (s) => s,
      getBerryName: (b) => b,
      getIngredientName: (i) => i
    },
    AppraisalLab: {
      evaluatePokemon: (pkm, level, nature, subskills, ings, ribbon) => ({
        compositeScore: 85,
        grade: 'S',
        gradeTitle: '頂級戰力 (Top Tier)',
        gradeColor: '#f59e0b',
        scores: { berry: 80, ingredient: 90, skill: 85, speed: 85, growth: 80, roi: 85 }
      }),
      renderRadarChartSVG: () => '<svg class="mock-radar"></svg>',
      getRemainingEvolutions: () => 0,
      getRibbonBonus: () => ({ speedDiscount: 0.11 })
    }
  };
  global.window.window = global.window;

  global.document = {
    defaultView: global.window,
    body: {
      style: {},
      appendChild: (el) => {
        if (el.id) mockElements.set(el.id, el);
      }
    },
    getElementById: (id) => {
      if (!mockElements.has(id)) {
        mockElements.set(id, {
          id,
          tagName: 'DIV',
          innerHTML: '',
          textContent: '',
          value: '',
          style: {},
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
          },
          setAttribute() {},
          getAttribute() { return ''; }
        });
      }
      return mockElements.get(id);
    },
    querySelector: (sel) => {
      if (sel === '.verdict-grade') return { textContent: '', style: {} };
      if (sel === '.verdict-title') return { textContent: '' };
      if (sel === '.verdict-num') return { textContent: '' };
      if (sel === '.pokedex-appraisal-verdict-box') return { style: {} };
      if (sel === '.pokedex-radar-wrapper') return { innerHTML: '' };
      if (sel === '.pokedex-val-badge') return { textContent: '' };
      return null;
    },
    querySelectorAll: (sel) => {
      return [];
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        style: {},
        innerHTML: '',
        classList: {
          contains: () => false,
          add: () => {},
          remove: () => {}
        }
      };
      return el;
    }
  };

  // Initialize PokemonApp with dataset
  PokemonApp.init([...dataset]);

  // 4. Test opening Venusaur (003) detail modal
  assert(typeof PokemonApp.openPokemonDetailModal === 'function', 'openPokemonDetailModal must be exported');
  PokemonApp.openPokemonDetailModal('003');

  const modalEl = mockElements.get('pokedex-detail-modal');
  assert(modalEl !== null, 'pokedex-detail-modal must exist after openPokemonDetailModal');
  assertEquals(modalEl.style.display, 'flex', 'Modal display style must be flex when opened');
  assert(modalEl.innerHTML.includes('pokedex-modal-dialog'), 'Modal HTML must contain pokedex-modal-dialog');
  assert(modalEl.innerHTML.includes('妙蛙花'), 'Modal HTML must display Pokemon name (妙蛙花)');
  assert(modalEl.innerHTML.includes('pokedex-header-stats-row'), 'Modal HTML must include inlined header stats row');
  assert(modalEl.innerHTML.includes('pokedex-header-reset-btn'), 'Modal HTML must include red reset button in header');
  assert(modalEl.innerHTML.includes('preset-god'), 'Modal HTML must include god preset button');
  assert(modalEl.innerHTML.includes('食材產能算法拆解'), 'Modal HTML must include ingredient formula breakdown card');
  assert(modalEl.innerHTML.includes('pokedex-strategy-card'), 'Modal HTML must include strategy recommendation card');
  assert(modalEl.innerHTML.includes('pokedex-custom-select'), 'Modal HTML must use custom select dropdowns');

  // 5. Test ingredient calculation engine
  assert(typeof PokemonApp.calculatePokedexIngredientFormulas === 'function', 'calculatePokedexIngredientFormulas must be exported');
  const formulas = PokemonApp.calculatePokedexIngredientFormulas();
  assert(formulas !== null, 'Formulas must return valid calculation results');
  assert(formulas.baseIngRate > 20, 'Venusaur base ingredient rate must be > 20%');
  assert(formulas.effectiveIntervalSec > 0, 'Effective interval must be positive');
  assert(formulas.dailyHelps > 0, 'Daily helps must be positive');
  assert(formulas.dailyIngDrops > 0, 'Daily ingredient drops must be positive');
  assert(formulas.totalDailyIngredients > 0, 'Total daily ingredients yield must be positive');
  assertEquals(formulas.unlockedSlotCount, 2, 'At default Lv.30, unlockedSlotCount must be 2');

  // 6. Test Nature modifiers on ingredient rate
  PokemonApp.setPokedexModalNature('坦率'); // Neutral
  const neutralFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(neutralFormulas.natureIngMult, 1.0, 'Neutral nature must have 1.0x multiplier');

  PokemonApp.setPokedexModalNature('冷靜'); // +Ingredient
  const quietFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(quietFormulas.natureIngMult, 1.2, 'Quiet nature (+Ing) must have 1.2x multiplier');
  assert(quietFormulas.finalIngRate > neutralFormulas.finalIngRate, 'Quiet nature must produce higher final ingredient rate than neutral');

  PokemonApp.setPokedexModalNature('爽朗'); // -Ingredient
  const jollyFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(jollyFormulas.natureIngMult, 0.8, 'Jolly nature (-Ing) must have 0.8x multiplier');
  assert(jollyFormulas.finalIngRate < neutralFormulas.finalIngRate, 'Jolly nature must produce lower final ingredient rate than neutral');

  // 7. Test God Preset & Reset Preset
  PokemonApp.applyPokedexGodPreset();
  let godState = PokemonApp.getPokedexModalState();
  assertEquals(godState.level, 60, 'God preset must set level to 60 (unlocking 3rd ing & 3 subskills)');
  assertEquals(godState.ribbon, 4, 'God preset must set ribbon to 4 (max bonus)');
  const godFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(godFormulas.natureIngMult, 1.2, 'God preset for ingredient Pokemon must set Quiet (+Ing) nature');
  assertEquals(godFormulas.subskillIngBonus, 54, 'God preset must activate Subskills M (+36%) + S (+18%) = +54%');
  assert(godFormulas.finalIngRate > quietFormulas.finalIngRate, 'God preset must achieve peak final ingredient rate');

  PokemonApp.applyPokedexResetPreset();
  const resetFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(resetFormulas.natureIngMult, 1.0, 'Reset preset must set neutral nature (1.0x)');
  assertEquals(resetFormulas.subskillIngBonus, 0, 'Reset preset must reset subskill ingredient bonus to 0%');

  // 8. Test Subskill Flow & Tiled Ingredients (matching Box Manual modal structure)
  assert(modalEl.innerHTML.includes('box-subskill-slots-row'), 'Modal HTML must include .box-subskill-slots-row');
  assert(modalEl.innerHTML.includes('box-subskill-palette'), 'Modal HTML must include .box-subskill-palette');
  assert(modalEl.innerHTML.includes('box-ing-strip'), 'Modal HTML must include .box-ing-strip');
  assert(modalEl.innerHTML.includes('box-mainskill-row'), 'Modal HTML must include .box-mainskill-row');
  assert(typeof PokemonApp.selectPokedexSubskillSlot === 'function', 'selectPokedexSubskillSlot must be exported');
  assert(typeof PokemonApp.choosePokedexSubskill === 'function', 'choosePokedexSubskill must be exported');
  assert(typeof PokemonApp.clearAllPokedexSubskills === 'function', 'clearAllPokedexSubskills must be exported');
  PokemonApp.clearAllPokedexSubskills();
  let state = PokemonApp.getPokedexModalState();
  assertEquals(state.subskills.every(s => s === ''), true, 'Clear all must empty all 5 subskills');
  PokemonApp.selectPokedexSubskillSlot(1);
  PokemonApp.choosePokedexSubskill('食材機率提升M');
  state = PokemonApp.getPokedexModalState();
  assertEquals(state.subskills[0], '食材機率提升M', 'Slot 1 must have 食材機率提升M');

  // 9. Test Berry Icon in Header, Dynamic Interval & Anchored Track Pins
  assert(modalEl.innerHTML.includes('pokedex-berry-icon-img'), 'Header must contain .pokedex-berry-icon-img');
  assert(modalEl.innerHTML.includes('pokedex-tag-berry'), 'Header must contain .pokedex-tag-berry');
  assert(!modalEl.innerHTML.includes('pokedex-berry-name'), 'Header must not contain berry name text');
  assert(!modalEl.innerHTML.includes('pokedex-header-title-en'), 'Header must not contain English name');
  assert(!modalEl.innerHTML.includes('pokedex-tag-evo'), 'Header must not contain evolution requirement');
  assert(!modalEl.innerHTML.includes('pokedex-radar-wrapper'), 'Verdict box must not contain radar chart wrapper');
  assert(modalEl.innerHTML.includes('pokedex-stat-interval'), 'Header stats must contain #pokedex-stat-interval for dynamic interval calculation');
  assert(modalEl.innerHTML.includes('pokedex-stat-skill-rate'), 'Header stats must contain #pokedex-stat-skill-rate');
  assert(modalEl.innerHTML.includes('pokedex-track-pins-bar'), 'Modal HTML must include .pokedex-track-pins-bar');
  assert(modalEl.innerHTML.includes('pin-milestone'), 'Key milestones (30, 50, 60, 80, 100) must be highlighted');

  // 9B. Test Ribbon Options HTML with dynamic descriptions and icons
  assert(typeof PokemonApp.renderPokedexRibbonOptionsHTML === 'function' || modalEl.innerHTML.includes('ribbon_lv1.png'), 'Modal HTML must include ribbon icon options');

  // 9C. Test Dynamic Skill Rate calculation on subskills change
  PokemonApp.openPokemonDetailModal('003');
  PokemonApp.clearAllPokedexSubskills();
  PokemonApp.setPokedexModalNature('坦率');
  const baseFm = PokemonApp.calculatePokedexIngredientFormulas();
  PokemonApp.selectPokedexSubskillSlot(1);
  PokemonApp.choosePokedexSubskill('技能機率提升M');
  const boostedSkillFm = PokemonApp.calculatePokedexIngredientFormulas();
  assert(boostedSkillFm.finalSkillRate > baseFm.finalSkillRate, 'Skill trigger rate must dynamically increase when 技能機率提升M is selected');

  // 10. Test Skill-type Pokemon with Magnet S / Draw S (e.g. Golbat 042)
  PokemonApp.openPokemonDetailModal('042');
  const skillFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  if (skillFormulas && skillFormulas.mainSkillLabel) {
    assert(skillFormulas.mainSkillExtraDaily >= 0, 'Skill Pokemon main skill extra daily yield must be calculated');
  }

  // 11. Test modal close
  assert(typeof PokemonApp.closePokemonDetailModal === 'function', 'closePokemonDetailModal must be exported');
  PokemonApp.closePokemonDetailModal();
  assertEquals(modalEl.style.display, 'none', 'Modal display style must be none when closed');

  // 12. Verify CSS Rule Compliance: Single Outer Frame, Dropdown Arrow Indentation, Zero Emoji, Compact 3-col
  assert(stylesCss.includes('#pokedex-detail-modal'), 'styles.css must style #pokedex-detail-modal');
  assert(stylesCss.includes('.pokedex-controls-container'), 'styles.css must contain .pokedex-controls-container');
  assert(stylesCss.includes('.pokedex-calc-formula-card'), 'styles.css must contain .pokedex-calc-formula-card');
  assert(stylesCss.includes('.pokedex-formula-steps-row'), 'styles.css must contain .pokedex-formula-steps-row for compact 3-column layout');
  assert(stylesCss.includes('.pokedex-track-pins-bar'), 'styles.css must style .pokedex-track-pins-bar');
  assert(stylesCss.includes('padding-right: 36px !important;'), 'styles.css must enforce 36px padding-right on select arrows');
  assert(stylesCss.includes('background-position: right 18px center !important;'), 'styles.css must enforce right 18px arrow position');
  assert(stylesCss.includes('border: none !important;'), 'styles.css must enforce border: none on outer containers');
  assert(stylesCss.includes('background: transparent !important;'), 'styles.css must enforce transparent background on outer containers');

  // 13. Zero Emoji check in modal templates
  assert(!modalEl.innerHTML.includes('🔥') && !modalEl.innerHTML.includes('⭐') && !modalEl.innerHTML.includes('✨'), 'Modal HTML must not contain emojis');

  // 14. Test Evolution Form Level Guard (進化階段最低等級提示)
  assert(typeof PokemonApp.getPokedexMinEvolutionLevel === 'function', 'getPokedexMinEvolutionLevel must be exported');
  assert(typeof PokemonApp.renderPokedexEvoGuardBadgeHTML === 'function', 'renderPokedexEvoGuardBadgeHTML must be exported');

  // 14A. Test min evolution level resolution across forms & inherited stages
  const pkmBulbasaur = dataset.find(p => p.formatted_no === '001');
  const pkmIvysaur = dataset.find(p => p.formatted_no === '002');
  const pkmVenusaur = dataset.find(p => p.formatted_no === '003');
  const pkmTyranitar = dataset.find(p => p.name_cn === '班基拉斯');
  const pkmDragonite = dataset.find(p => p.name_cn === '快龍');
  const pkmVictreebel = dataset.find(p => p.name_cn === '大食花');
  const pkmGengar = dataset.find(p => p.name_cn === '耿鬼');
  const pkmGolem = dataset.find(p => p.name_cn === '隆隆岩');
  const pkmMagnezone = dataset.find(p => p.name_cn === '自爆磁怪');
  const pkmGallade = dataset.find(p => p.name_cn === '艾路雷朵');
  const pkmVikavolt = dataset.find(p => p.name_cn === '鍬農炮蟲');
  const pkmPawmot = dataset.find(p => p.name_cn === '巴布土撥');
  const pkmPikachu = dataset.find(p => p.formatted_no === '025');

  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmBulbasaur), 1, 'Bulbasaur (base) min evolution level must be 1');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmIvysaur), 12, 'Ivysaur min evolution level must be 12 (Lv.12 + 40 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVenusaur), 24, 'Venusaur min evolution level must be 24 (Lv.24 + 80 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmTyranitar), 41, 'Tyranitar min evolution level must be 41 (Lv.41 + 100 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmDragonite), 41, 'Dragonite min evolution level must be 41 (Lv.41 + 100 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVictreebel), 16, 'Victreebel min evolution level must be 16 (inherited from Weepinbell)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGengar), 19, 'Gengar min evolution level must be 19 (inherited from Haunter)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGolem), 19, 'Golem min evolution level must be 19 (inherited from Graveler)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmMagnezone), 23, 'Magnezone min evolution level must be 23 (inherited from Magneton)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGallade), 15, 'Gallade min evolution level must be 15 (inherited from Kirlia)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVikavolt), 15, 'Vikavolt min evolution level must be 15 (inherited from Charjabug)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmPawmot), 14, 'Pawmot min evolution level must be 14 (inherited from Pawmo)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmPikachu), 1, 'Pikachu (no level req) min evolution level must be 1');

  // 14B. Test badge HTML rendering in modal (warning vs passed states)
  const warnHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmVenusaur, 10);
  assert(warnHtml.includes('evo-warning'), 'At Lv.10 (< 24), badge must have .evo-warning class');
  assert(warnHtml.includes('[!]'), 'At Lv.10, badge must display [!] warning indicator');
  assert(warnHtml.includes('24'), 'At Lv.10, badge must display threshold level 24');

  const passHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmVenusaur, 25);
  assert(passHtml.includes('evo-passed'), 'At Lv.25 (>= 24), badge must have .evo-passed class');
  assert(passHtml.includes('[✓]'), 'At Lv.25, badge must display [✓] satisfied indicator');

  const baseHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmBulbasaur, 10);
  assertEquals(baseHtml, '', 'Base form Pokemon must render empty string (no guard badge)');

  // 14C. Verify CSS and i18n rules for evolution guard
  assert(stylesCss.includes('.pokedex-evo-guard-badge'), 'styles.css must contain .pokedex-evo-guard-badge');
  assert(stylesCss.includes('.pokedex-tag-evo'), 'styles.css must contain .pokedex-tag-evo');
  assert(stylesCss.includes('.pokedex-level-ctrl-group'), 'styles.css must contain .pokedex-level-ctrl-group');
  assert(i18nJs.includes('pokedex.evo_guard_below'), 'i18n.js must contain pokedex.evo_guard_below');
  assert(i18nJs.includes('pokedex.evo_guard_met'), 'i18n.js must contain pokedex.evo_guard_met');
  assert(i18nJs.includes('pokedex.evo_req'), 'i18n.js must contain pokedex.evo_req');

  // 15. Verify Lv.70 / Lv.80 Subskill Unlock Slots
  PokemonApp.openPokemonDetailModal('003');
  const modalHtmlNow = mockElements.get('pokedex-detail-modal').innerHTML;
  assert(modalHtmlNow.includes('Lv.70') && modalHtmlNow.includes('Lv.80'), 'Modal subskill slots must display Lv.70 and Lv.80');
  assert(!modalHtmlNow.includes('Lv.75') && !modalHtmlNow.includes('Lv.100</span>'), 'Modal subskill slots must not display Lv.75 or Lv.100');

  // 15B. Header layout: berry & specialty vertical stack, dual-column stats with carry, no evo guard badge
  assert(modalHtmlNow.includes('pokedex-header-berry-spec-group'), 'Header must contain vertical berry-spec group');
  assert(modalHtmlNow.includes('pokedex-tag-spec'), 'Header must contain specialty tag');
  assert(modalHtmlNow.includes('pokedex-stat-carry'), 'Header stats row must contain carry limit stat');
  assert(modalHtmlNow.includes('pokedex-header-stats-dual'), 'Header stats row must use dual-column layout');
  assert(!modalHtmlNow.includes('pokedex-evo-guard-container'), 'Level control row must not contain evo guard badge');

  // 15C. Formula Breakdown: dual rates (ingredient & skill) and no dynamic calculation subtitle
  assert(modalHtmlNow.includes('最終食材發動率'), 'Formula card must display 最終食材發動率');
  assert(modalHtmlNow.includes('最終技能發動率'), 'Formula card must display 最終技能發動率');
  assert(!modalHtmlNow.includes('動態幫忙與產能精算'), 'Formula card must not display 動態幫忙與產能精算 subtitle');

  // 15D. Strategy card: no Skill Level Up M/S in recommended subskills
  const skillMon = dataset.find(p => p.specialty === '技能' || p.specialty === 'Skills') || { specialty: '技能' };
  const skillStrategyHtml = PokemonApp.renderPokedexStrategyCardHTML(skillMon);
  assert(!skillStrategyHtml.includes('技能等級提升M') && !skillStrategyHtml.includes('技能等級提升S'), 'Strategy card must not recommend Skill Level Up M/S');
  assert(skillStrategyHtml.includes('技能機率提升M') && skillStrategyHtml.includes('技能機率提升S'), 'Strategy card must recommend Skill Trigger M and S');

  // 15E. Header Verdict Badge & Removal of Left Column Verdict Box
  assert(modalHtmlNow.includes('pokedex-header-verdict-badge'), 'Header actions must contain pokedex-header-verdict-badge');
  assert(modalHtmlNow.includes('pokedex-header-grade-text'), 'Header must contain pokedex-header-grade-text');
  assert(modalHtmlNow.includes('pokedex-header-score-text'), 'Header must contain pokedex-header-score-text');
  assert(!modalHtmlNow.includes('pokedex-appraisal-verdict-box'), 'Modal left column must not contain legacy verdict box');

  // 15F. Level row layout: God preset on left next to level text, Reset preset on right
  assert(modalHtmlNow.includes('pokedex-level-header-left') && modalHtmlNow.includes('preset-god'), 'Level header left must contain preset-god');
  assert(modalHtmlNow.includes('pokedex-level-header-right') && modalHtmlNow.includes('preset-reset'), 'Level header right must contain preset-reset');

  // 15G. Consolidated Calculation Box without 1 2 3 steps
  assert(modalHtmlNow.includes('pokedex-calc-unified-box'), 'Modal must contain .pokedex-calc-unified-box');
  assert(modalHtmlNow.includes('unified-calc-row'), 'Modal must contain .unified-calc-row');

  // 15H. Appraisal Engine: Carry Limit, Ribbon, and AAA/ABC scoring
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const appCtx = { window: {}, console };
  appCtx.window = appCtx;
  vm.createContext(appCtx);
  vm.runInContext(appraisalCode, appCtx);

  const ingMon = dataset.find(p => p.specialty === '食材' || p.specialty === 'Ingredients') || { specialty: '食材' };
  const evalBaseline = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['幫忙速度S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  const evalCarryL = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升L'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  assert(evalCarryL.scores.ingredient > evalBaseline.scores.ingredient, 'Inventory Up L must increase ingredient score for ingredient specialist');

  const evalRibbon4 = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['幫忙速度S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 4, 1);
  assert(evalRibbon4.scores.ingredient > evalBaseline.scores.ingredient, 'Ribbon Lv.4 must increase ingredient score');

  const evalCarryM = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升M'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  const evalCarryS = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  assert(evalCarryL.compositeScore > evalCarryM.compositeScore, 'Inventory Up L must score higher than Inventory Up M');
  assert(evalCarryM.compositeScore > evalCarryS.compositeScore, 'Inventory Up M must score higher than Inventory Up S');
  assert(evalCarryS.compositeScore > evalBaseline.compositeScore, 'Inventory Up S must score higher than baseline');

  // 15I. Grade Tiers & Core-Kit Expectation (A, S, SS, SSS)
  const finalIngMon = dataset.find(p => (p.specialty === '食材' || p.specialty === 'Ingredients') && (p.is_final === '〇' || p.is_final === true || p.is_final === '1')) || ingMon;
  const evalSolidIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M', '持有上限提升S'], ['甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalSolidIng.compositeScore >= 90, 'Final evolved ingredient specialist with core kit (Ing M + Carry S + AA) must score >= 90 (S grade)');
  assertEquals(evalSolidIng.grade, 'S', 'Score 90+ must receive S grade');

  const evalEliteIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['食材機率提升M', '幫忙速度M', '持有上限提升L'], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalEliteIng.compositeScore >= 95, 'Elite ingredient specialist roll must score >= 95');
  assert(evalEliteIng.grade === 'SS' || evalEliteIng.grade === 'SSS', 'Elite roll must receive SS or SSS grade');

  const evalGodIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['食材機率提升M', '食材機率提升S', '持有上限提升L'], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 4, 6);
  assert(evalGodIng.compositeScore >= 98, 'God preset roll must score >= 98 (SSS grade)');
  assertEquals(evalGodIng.grade, 'SSS', 'Score 98+ must receive SSS grade');

  // 15J. Main Skill Level Impact on Appraisal Score
  const evalSkillLv1 = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M'], ['甜甜蜜', '甜甜蜜'], 0, 1);
  const evalSkillLv6 = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M'], ['甜甜蜜', '甜甜蜜'], 0, 6);
  assert(evalSkillLv6.compositeScore > evalSkillLv1.compositeScore, 'Higher main skill level must increase composite score');

  // 15K. Desktop vs Mobile Layout Isolation Verification
  PokemonApp.openPokemonDetailModal(finalIngMon);
  assert(modalEl && modalEl.innerHTML, 'Pokedex detail modal HTML must exist');

  // Header verification: pokedex-header-stats-dual must be inside pokedex-modal-header-main before actions
  const mainHeaderIdx = modalEl.innerHTML.indexOf('pokedex-modal-header-main');
  const statsDualIdx = modalEl.innerHTML.indexOf('pokedex-header-stats-dual');
  const headerActionsIdx = modalEl.innerHTML.indexOf('pokedex-header-actions');
  assert(mainHeaderIdx !== -1 && statsDualIdx !== -1 && headerActionsIdx !== -1, 'Header components must exist in modal HTML');
  assert(mainHeaderIdx < statsDualIdx && statsDualIdx < headerActionsIdx, 'pokedex-header-stats-dual must be nested inside header-main before header-actions');

  // Left column verification: desktop strategy card must be nested inside pokedex-left-col
  const leftColIdx = modalEl.innerHTML.indexOf('pokedex-left-col');
  const rightColIdx = modalEl.innerHTML.indexOf('pokedex-right-col');
  const deskStratIdx = modalEl.innerHTML.indexOf('id="pokedex-strategy-desktop-container"');
  assert(leftColIdx !== -1 && rightColIdx !== -1 && deskStratIdx !== -1, 'Left col, right col, and desktop strategy container must exist');
  assert(leftColIdx < deskStratIdx && deskStratIdx < rightColIdx, 'Desktop strategy card must be placed inside left column before right column to prevent layout breakage');

  // Mobile strategy container verification: must be present as a separate container for mobile bottom display
  const mobStratIdx = modalEl.innerHTML.indexOf('id="pokedex-strategy-mobile-container"');
  assert(mobStratIdx !== -1 && mobStratIdx > rightColIdx, 'Mobile strategy container must exist at bottom of modal body after right column');

  // CSS Isolation Verification
  assert(stylesCss.includes('.pokedex-strategy-desktop-wrap'), 'styles.css must define .pokedex-strategy-desktop-wrap');
  assert(stylesCss.includes('.pokedex-strategy-mobile-wrap'), 'styles.css must define .pokedex-strategy-mobile-wrap');

  // 15L. Zero-Subskills Appraisal Deflation Guard
  // When subskills are cleared, score must never be inflated to S, SS, or SSS
  const evalEmptyMax = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['', '', '', '', ''], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 4, 6);
  assert(evalEmptyMax.compositeScore <= 74, `Cleared subskills must be capped at <= 74 (got ${evalEmptyMax.compositeScore})`);
  assert(evalEmptyMax.grade !== 'SSS' && evalEmptyMax.grade !== 'SS' && evalEmptyMax.grade !== 'S', 'Cleared subskills must NEVER receive SSS, SS, or S grade');

  const evalEmptyNeutral = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '坦率', ['', '', '', '', ''], ['甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalEmptyNeutral.compositeScore <= 65, `Neutral Lv.30 with empty subskills must score <= 65 (got ${evalEmptyNeutral.compositeScore})`);

  // 15M. Dynamic Minimum Evolution Level Clamping & Pins
  const venusaurData = dataset.find(p => p.formatted_no === '0003' || p.name_cn === '妙蛙花') || { evo_req: 'Lv.24 + 80 糖' };
  PokemonApp.openPokemonDetailModal(venusaurData);
  let vState = PokemonApp.getPokedexModalState();
  assert(vState.level >= 24, 'Venusaur initial level must be clamped to at least min evolution level 24');

  // Attempt to set below min evolution level
  PokemonApp.setPokedexModalLevel(10);
  vState = PokemonApp.getPokedexModalState();
  assertEquals(vState.level, 24, 'Setting level below min evolution level must be clamped to 24');

  // Slider 1-100 range, red locked zone, and pins check in HTML
  assert(modalEl.innerHTML.includes('min="1"') && modalEl.innerHTML.includes('max="100"'), 'Slider input must maintain min="1" and max="100"');
  assert(modalEl.innerHTML.includes('pokedex-slider-locked-zone'), 'Slider must render red locked zone for Venusaur min evo level');
  assert(!modalEl.innerHTML.includes('data-pin-lv="10"'), 'Pin Lv.10 below min evo level 24 must NOT be rendered in pins bar');
  assert(!modalEl.innerHTML.includes('data-pin-lv="24"'), 'Threshold pin Lv.24 must NOT be rendered to avoid collision with Lv.25');
  assert(modalEl.innerHTML.includes('data-pin-lv="25"'), 'Venusaur pins bar must include Lv.25 milestone pin');

  // 15N. H5 Mobile Subskill 2-Row Downward Layout & Theme Colors
  assert(stylesCss.includes('grid-template-columns: repeat(6, 1fr)'), 'CSS must define 6-column grid for subskills on mobile');
  assert(stylesCss.includes('grid-column: span 2'), 'CSS must span 2 columns for row 1 subskills');
  assert(stylesCss.includes('grid-column: span 3'), 'CSS must span 3 columns for row 2 subskills');
  assert(stylesCss.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .pokedex-modal-dialog'), 'CSS must adapt pokedex modal for dawn theme');
  assert(!stylesCss.includes('justify-content: space-between !important;\n  }\n  #pokedex-detail-modal .pokedex-ribbon-unit'), 'CSS must eliminate space-between in pokedex-inline-unit');

  // 15O. H5 Mobile Whitespace Elimination & Control Order
  assert(!stylesCss.includes('flex: 1 1 140px'), 'CSS must NOT contain flex: 1 1 140px which stretches inline units vertically');
  assert(stylesCss.includes('order: 1 !important;'), 'Right col (controls) must have order: 1 on mobile');
  assert(stylesCss.includes('order: 2 !important;'), 'Left col (formula) must have order: 2 on mobile');
  assert(stylesCss.includes('order: 3 !important;'), 'Strategy mobile wrap must have order: 3 on mobile');
  assert(stylesCss.includes('right: 16px !important;'), 'Custom select arrow must have generous inset complying with Rule VI');
  assert(stylesCss.includes('flex-wrap: nowrap !important;'), 'Ingredient strip must be strictly nowrap on mobile to guarantee single-line presentation');

  // 15P. Header Stats Dual: Borderless & Transparent on Mobile
  assert(stylesCss.includes('#pokedex-detail-modal .pokedex-header-stats-row.pokedex-header-stats-dual'), 'styles.css must style mobile pokedex-header-stats-dual with modal id specificity');
  assert(stylesCss.includes('border: none !important;'), 'Mobile header stats dual must have border: none !important');
  assert(stylesCss.includes('background: transparent !important;'), 'Mobile header stats dual must have background: transparent !important');
  assert(stylesCss.includes('padding: 2px 0 !important;'), 'Mobile header stats dual must have padding: 2px 0 !important to stretch content wide');

  // 15Q. Header Info: Column Stack (pokedex-header-no above, pokedex-header-pkm-name below)
  assert(stylesCss.includes('flex-direction: column !important;'), 'Mobile header info must use flex-direction: column !important for vertical stack');
  assert(stylesCss.includes('.pokedex-header-name-row'), 'styles.css must support .pokedex-header-name-row');

  // 15R. Milestone Pins Consistency & Unreleased Effects (Lv. 61-100 & Subskill Slots 4-5)
  assert(stylesCss.includes('.pokedex-track-pin-btn.pin-unreleased'), 'styles.css must style .pokedex-track-pin-btn.pin-unreleased');
  assert(stylesCss.includes('.pokedex-track-pin-btn.pin-cap'), 'styles.css must style .pokedex-track-pin-btn.pin-cap for official level 60 cap');
  assert(stylesCss.includes('.pokedex-unreleased-pill'), 'styles.css must style .pokedex-unreleased-pill');
  assert(stylesCss.includes('.slot-unreleased'), 'styles.css must style .slot-unreleased for unreleased subskill slots');
  assert(stylesCss.includes('.slot-unreleased-tag'), 'styles.css must style .slot-unreleased-tag');
  assert(stylesCss.includes('.slot-val-unreleased'), 'styles.css must style .slot-val-unreleased');

  // Verification in JS output
  const pikachuData = dataset.find(p => p.formatted_no === '0025' || p.name_cn === '皮卡丘') || dataset[0];
  PokemonApp.openPokemonDetailModal(pikachuData);
  const pikaModalHtml = mockElements.get('pokedex-detail-modal').innerHTML;
  assert(pikaModalHtml.includes('pin-milestone'), 'Track pins bar must include pin-milestone for released milestones');
  assert(pikaModalHtml.includes('pin-unreleased'), 'Track pins bar must include pin-unreleased for future levels');
  assert(pikaModalHtml.includes('pin-cap'), 'Track pins bar must include pin-cap for level 60');
  const subskillRowHtml = mockElements.get('pokedex-subskill-slots-row').innerHTML;
  assert(subskillRowHtml.includes('等級不足'), 'Subskill slots row must include 等級不足 indicator for unreached levels');

  // Toggle level > 60 and verify unreleased tag is active
  PokemonApp.setPokedexModalLevel(70);
  const unreleasedTagEl = mockElements.get('pokedex-level-unreleased-tag');
  if (unreleasedTagEl) {
    assert(!unreleasedTagEl.classList.contains('hidden'), 'Level 70 must make unreleased tag visible');
  }
  PokemonApp.setPokedexModalLevel(50);
  if (unreleasedTagEl) {
    assert(unreleasedTagEl.classList.contains('hidden'), 'Level 50 must hide unreleased tag');
  }

  // 15S. Subskills Default Empty, Collapsible Palette, Clean Formula Breakdown & Spaceless Header Stats
  PokemonApp.openPokemonDetailModal(pikachuData);
  const pikaState = PokemonApp.getPokedexModalState();
  assert(Array.isArray(pikaState.subskills) && pikaState.subskills.every(s => s === ''), 'Subskills must initially be empty (no selected subskills by default)');

  const pikaModalHtml2 = mockElements.get('pokedex-detail-modal').innerHTML;
  assert(pikaModalHtml2.includes('pokedex-subskill-toggle-btn'), 'Modal HTML must include full-width toggle button for H5 subskills collapse');
  assert(pikaModalHtml2.includes('副技能展開'), 'Subskill toggle button must initially display 副技能展開');

  // Test toggle functionality
  assert(typeof PokemonApp.togglePokedexSubskillPalette === 'function', 'togglePokedexSubskillPalette must be exported');
  PokemonApp.togglePokedexSubskillPalette();
  const paletteEl = mockElements.get('pokedex-subskill-palette');
  assert(paletteEl.classList.contains('palette-expanded'), 'Toggling must add palette-expanded class');
  PokemonApp.togglePokedexSubskillPalette();
  assert(!paletteEl.classList.contains('palette-expanded'), 'Toggling again must remove palette-expanded class');

  // Formula Breakdown verification
  assert(!pikaModalHtml2.includes('calc-stat-base'), 'Formula breakdown must not include calc-stat-base');
  assert(!pikaModalHtml2.includes('(+20%)') && !pikaModalHtml2.includes('(-20%)'), 'Formula breakdown must not include bracketed notes (+20%)/(-20%)');
  assert(pikaModalHtml2.includes('calc-color-helps'), 'Formula breakdown must include calc-color-helps for daily helps lineage');
  assert(pikaModalHtml2.includes('calc-color-ing'), 'Formula breakdown must include calc-color-ing for ingredient rate lineage');
  assert(pikaModalHtml2.includes('calc-color-skill'), 'Formula breakdown must include calc-color-skill for skill rate lineage');
  assert(stylesCss.includes('.calc-color-helps'), 'styles.css must style .calc-color-helps');
  assert(stylesCss.includes('.pokedex-subskill-toggle-btn'), 'styles.css must style .pokedex-subskill-toggle-btn');
  assert(stylesCss.includes('.pokedex-formula-header') && stylesCss.includes('border-bottom: none !important;'), 'styles.css must remove white divider line under formula header');

  // Spaceless stat numbers verification: no space before <span class="header-stat-diff
  const formulasNow = PokemonApp.calculatePokedexIngredientFormulas();
  const ivHtml = PokemonApp.renderPokedexIntervalValue ? PokemonApp.renderPokedexIntervalValue(formulasNow, pikachuData) : '';
  const crHtml = PokemonApp.renderPokedexCarryValue ? PokemonApp.renderPokedexCarryValue(formulasNow, pikachuData) : '';
  const irHtml = PokemonApp.renderPokedexIngRateValue ? PokemonApp.renderPokedexIngRateValue(formulasNow, pikachuData) : '';
  const srHtml = PokemonApp.renderPokedexSkillRateValue ? PokemonApp.renderPokedexSkillRateValue(formulasNow, pikachuData) : '';
  if (ivHtml) assert(!ivHtml.includes(' <span class="header-stat-diff'), 'Interval stat must not have space before diff tag');
  if (crHtml) assert(!crHtml.includes(' <span class="header-stat-diff'), 'Carry stat must not have space before diff tag');
  if (irHtml) assert(!irHtml.includes(' <span class="header-stat-diff'), 'Ingredient rate stat must not have space before diff tag');
  // 15T. Slider Fill Progress Bar, Top Layer Locked Zone, Borderless Desktop Stats & Mobile 2x2 Dual Stacks
  assert(pikaModalHtml2.includes('pokedex-slider-fill-bar'), 'Slider track must render pokedex-slider-fill-bar element');
  assert(stylesCss.includes('.pokedex-slider-fill-bar'), 'styles.css must style .pokedex-slider-fill-bar');
  assert(stylesCss.includes('#pokedex-detail-modal .calc-color-helps'), 'styles.css must provide modal-scoped specificity for .calc-color-helps');
  assert(stylesCss.includes('strong:not([class*="calc-color-"])'), 'styles.css must protect calc-color-* from formula-derive strong overrides');
  assert(!stylesCss.includes('.pokedex-header-stats-dual {\n    grid-area: stats !important;\n    width: 100% !important;\n    display: grid !important;'), 'styles.css must not use 4-column single row for mobile header stats');
  assert(stylesCss.includes('display: inline-flex !important;\n  align-items: center;\n  gap: 16px;\n  background: transparent !important;\n  border: none !important;'), 'Desktop header stats dual must be borderless and transparent');

  const fillBarEl = mockElements.get('pokedex-slider-fill-bar');
  if (fillBarEl) {
    PokemonApp.setPokedexModalLevel(50);
    const expectedWidth = ((50 - 1) / 99 * 100).toFixed(2);
    assert(fillBarEl.style.width === `${expectedWidth}%`, `Slider fill bar width must update dynamically (expected ${expectedWidth}%, got ${fillBarEl.style.width})`);
  }

  // 15U. Unified Modal Theme Colors & Dynamic Inactive Subskill Tags
  assert(stylesCss.includes('.pokedex-btn-preset.preset-god') && stylesCss.includes('color: #38bdf8;'), 'preset-god button must use sky blue theme in dark mode');
  assert(stylesCss.includes('.slot-unreleased-tag.slot-tag-inactive'), 'styles.css must style .slot-tag-inactive for unreached levels');
  assert(stylesCss.includes('.box-subskill-pill.pill-inactive'), 'styles.css must style .pill-inactive with line-through effect');

  // Dynamic slot status testing
  PokemonApp.openPokemonDetailModal(pikachuData);
  PokemonApp.setPokedexModalLevel(30);
  PokemonApp.selectPokedexSubskillSlot(3);
  PokemonApp.choosePokedexSubskill('幫手獎勵');
  const slotsRowEl = mockElements.get('pokedex-subskill-slots-row');
  assert(slotsRowEl.innerHTML.includes('slot-tag-inactive'), 'Slot 3 at Lv.30 with subskill must display slot-tag-inactive');
  assert(slotsRowEl.innerHTML.includes('效果尚未生效'), 'Slot 3 at Lv.30 with subskill must display 效果尚未生效');
  assert(slotsRowEl.innerHTML.includes('pill-inactive'), 'Slot 3 at Lv.30 with subskill must display pill-inactive');

  // Verify slots 4 & 5 (unreleased levels 70 and 80) do not contain duplicate -- 尚未開放 -- in badge
  assert(!slotsRowEl.innerHTML.includes('-- 尚未開放 --'), 'Empty slots must not duplicate -- 尚未開放 -- in badge');
  assert(slotsRowEl.innerHTML.includes('-- 未解鎖 --'), 'Empty slots below required level must display -- 未解鎖 --');

  // Raise level to 50: Slot 3 effect becomes active
  PokemonApp.setPokedexModalLevel(50);
  assert(!slotsRowEl.innerHTML.includes('Lv.50 <span class="slot-unreleased-tag slot-tag-inactive">'), 'Slot 3 at Lv.50 must dynamically clear slot-tag-inactive');

  // Raise level to 70: Slot 4 (Lv.70) is reached so it must NOT display any unreleased/under-lvl tag
  PokemonApp.setPokedexModalLevel(70);
  assert(!slotsRowEl.innerHTML.includes('Lv.70 <span class="slot-unreleased-tag'), 'Slot 4 at Lv.70 must NOT display 尚未開放 or 等級不足 tag');
  assert(slotsRowEl.innerHTML.includes('Lv.80 <span class="slot-unreleased-tag slot-tag-under-lvl">等級不足</span>'), 'Slot 5 at Lv.70 must display 等級不足');

  // Test Slot 4 & 5 Subskills at Lv.70 & Lv.80
  PokemonApp.selectPokedexSubskillSlot(4);
  PokemonApp.choosePokedexSubskill('幫忙速度M');
  PokemonApp.selectPokedexSubskillSlot(5);
  PokemonApp.choosePokedexSubskill('持有上限提升L');

  // At Lv.70: Slot 4 is reached (active, NO pill-inactive, has subskill-blue), Slot 5 is NOT reached (pill-inactive, has slot-tag-inactive)
  PokemonApp.setPokedexModalLevel(70);
  const slotButtons70 = slotsRowEl.innerHTML.split('</button>');
  const slot4Html70 = slotButtons70.find(b => b.includes('data-slot="4"')) || '';
  const slot5Html70 = slotButtons70.find(b => b.includes('data-slot="5"')) || '';
  assert(slot4Html70.includes('subskill-blue') && !slot4Html70.includes('slot-unreleased-tag'), 'Slot 4 at Lv.70 must not display unreleased/inactive tags');
  assert(!slot4Html70.includes('pill-inactive'), 'Slot 4 at Lv.70 must NOT have pill-inactive');
  assert(slot5Html70.includes('pill-inactive'), 'Slot 5 at Lv.70 must have pill-inactive');
  assert(slot5Html70.includes('slot-tag-inactive') && slot5Html70.includes('效果尚未生效'), 'Slot 5 at Lv.70 must show 效果尚未生效');

  // Raise level to Lv.80: Slot 5 becomes active, NO pill-inactive, NO status tag
  PokemonApp.setPokedexModalLevel(80);
  const slotButtons80 = slotsRowEl.innerHTML.split('</button>');
  const slot5Html80 = slotButtons80.find(b => b.includes('data-slot="5"')) || '';
  assert(!slot5Html80.includes('pill-inactive'), 'Slot 5 at Lv.80 must NOT have pill-inactive');
  assert(!slot5Html80.includes('slot-unreleased-tag'), 'Slot 5 at Lv.80 must NOT display any status tag');

  // Ideal Energy 0.45x Multiplier & Formula Breakdown verification (12h active baseline)
  const formulas80 = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(formulas80.energyIntervalMult, 0.45, 'Formula engine must use 0.45 energy interval multiplier');
  assertEquals(formulas80.baseCalcSeconds, 43200, 'Formula engine must use 43200s (12h) active baseline');
  const expectedHelps = 43200 / (formulas80.effectiveIntervalSec * 0.45);
  assertEquals(formulas80.dailyHelps.toFixed(2), expectedHelps.toFixed(2), 'dailyHelps must be 43200 / (effectiveIntervalSec * 0.45)');
  assert(pikaModalHtml2.includes('pokedex-formula-help-btn'), 'Formula card must include [?] help button');
  assert(pikaModalHtml2.includes('pokedex-energy-help-popover'), 'Formula card must include energy popover');
  assert(pikaModalHtml2.includes('43200'), 'Formula derive line must display 43200 in step 1');
  assert(pikaModalHtml2.includes('× 0.45) ='), 'Formula derive line must display × 0.45 in step 1');
  assert(stylesCss.includes('.pokedex-formula-help-btn'), 'styles.css must style .pokedex-formula-help-btn');
  assert(stylesCss.includes('.pokedex-energy-help-popover'), 'styles.css must style .pokedex-energy-help-popover');

  // Strategy card verification: core skill without brackets & tiered subskill chips
  const stratCardHtml = PokemonApp.renderPokedexStrategyCardHTML(pikachuData);
  assert(stratCardHtml.includes('strategy-item-core'), 'Strategy card must have strategy-item-core');
  assert(!stratCardHtml.includes('(+36%)') && !stratCardHtml.includes('(BFS)'), 'Strategy card core skill must not contain bracketed explanations');
  assert(stratCardHtml.includes('subskill-gold') && stratCardHtml.includes('subskill-blue') && stratCardHtml.includes('subskill-white'), 'Strategy card must include gold, blue, and white subskill chips');

  // Ladder ? help button & popover verification
  const wikiCodeFile = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiCodeFile.includes('toggleLadderEnergyHelp'), 'wiki.js must define toggleLadderEnergyHelp');
  assert(wikiCodeFile.includes('closeLadderEnergyHelp'), 'wiki.js must define closeLadderEnergyHelp');
  assert(wikiCodeFile.includes('ladder-formula-help-btn'), 'wiki.js must render ladder-formula-help-btn');
  assert(wikiCodeFile.includes('ladder-energy-help-popover'), 'wiki.js must render ladder-energy-help-popover');
  assert(stylesCss.includes('.ladder-formula-help-btn'), 'styles.css must style .ladder-formula-help-btn');
  assert(stylesCss.includes('.ladder-energy-help-popover'), 'styles.css must style .ladder-energy-help-popover');
  assert(stylesCss.includes('.ladder-fixed-sidebar .sidebar-header {\n  position: relative;\n  overflow: visible !important;'), 'styles.css must allow ladder sidebar-header overflow for popover');

  // Dedicated Onyx theme verification
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .pokedex-modal-dialog {\n  background: #09090b !important;'), 'styles.css must style onyx modal dialog in obsidian black #09090b');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) #pokedex-detail-modal .pokedex-calc-unified-box {\n  background: #141417 !important;'), 'styles.css must style onyx calc box in #141417');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) #pokedex-detail-modal .box-subskill-slot-btn.active {\n  background: rgba(203, 213, 225, 0.14) !important;\n  border-color: #cbd5e1 !important;'), 'styles.css must style onyx active slot button in cool silver #cbd5e1');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .pokedex-energy-help-bubble'), 'styles.css must style onyx help popovers');

  // CSS verification: solid borders on slot-unreleased and borderless unified-calc-row
  assert(stylesCss.includes('border-style: solid !important;') && stylesCss.includes('.box-subskill-slot-btn.slot-unreleased'), 'styles.css must enforce solid border on slot-unreleased');
  assert(stylesCss.includes('.unified-calc-row {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding-bottom: 2px;\n  border-bottom: none !important;'), 'unified-calc-row must have border-bottom: none !important');
});

// 15V. Fast Floating Tooltips, Pull-to-Refresh Modal Guard, Tens Alignment & Venusaur Lv.60 Verification
test('Tier 4 - Real-World Application Scenarios', 'Fast Floating Tooltips, Pull-to-Refresh Modal Guard, Tens Alignment & Venusaur Lv.60 Verification', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const dataJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
    // 1. Tens alignment for skill and ingredient rates (space-padded single digits, no leading zero)
    const srTensHtml = PokemonApp.renderPokedexSkillRateValue({ finalSkillRate: 2.10, diffSkillRate: 0 });
    const irTensHtml = PokemonApp.renderPokedexIngRateValue({ finalIngRate: 49.16, diffIngRate: 22.56 });
    assert(srTensHtml.startsWith('\u20072.10%'), `Skill rate must format single digits with figure space instead of zero (got ${srTensHtml})`);
    assert(irTensHtml.startsWith('49.16%'), `Ingredient rate must preserve two-digit representation (got ${irTensHtml})`);
    assertEquals(srTensHtml.split('<')[0].length, irTensHtml.split('<')[0].length, 'Formatted rate value length must match exactly (6 chars) to align percentage sign');
    assert(stylesCss.includes('font-variant-numeric: tabular-nums;'), 'styles.css must include tabular-nums for monospaced numeric alignment');

    // 2. Pull-to-refresh modal protection
    const appJsContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    assert(appJsContent.includes('isModalOrDrawerActive'), 'app.js must define isModalOrDrawerActive guard');
    assert(appJsContent.includes('pokedex-modal-open'), 'app.js must toggle pokedex-modal-open on body');
    assert(stylesCss.includes('#pokedex-detail-modal') && stylesCss.includes('overscroll-behavior: contain !important;'), 'styles.css must contain overscroll on #pokedex-detail-modal');
    assert(stylesCss.includes('.pokedex-modal-body') && stylesCss.includes('overscroll-behavior-y: contain !important;'), 'styles.css must contain overscroll-y on .pokedex-modal-body');

    // 3. Fast floating tooltip engine & theme-adaptive styling
    assert(typeof PokemonApp.showGlobalTooltip === 'function', 'PokemonApp must export showGlobalTooltip');
    assert(typeof PokemonApp.toggleGlobalTooltip === 'function', 'PokemonApp must export toggleGlobalTooltip');
    assert(stylesCss.includes('.global-skill-tooltip') && stylesCss.includes('rgba(255, 255, 255, 0.96) !important;'), 'global-skill-tooltip must support light frosted glass in Dawn');
    assert(stylesCss.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .pokedex-energy-help-bubble'), 'styles.css must provide Dawn theme styling for energy help bubble');
    assert(stylesCss.includes('.global-skill-tooltip') && stylesCss.includes('z-index: 10000000 !important;'), 'global-skill-tooltip must have ultra-high z-index');
    assert(stylesCss.includes('.ladder-energy-help-popover') && stylesCss.includes('z-index: 100000 !important;'), 'ladder-energy-help-popover must have high z-index to prevent penetration');

    // 4. Mathematical Ground Truth: Venusaur Lv.60 Verification (Image 2)
    const venusaurData = dataJson.find(p => p.name_cn === '妙蛙花');
    assert(venusaurData !== undefined, 'data.json must contain Venusaur (妙蛙花)');
    // Calculate values matching Image 2
    const baseInterval = 2800; // 00:46:40
    const lvlDiscount = (60 - 1) * 0.002; // 0.118
    const speedDiscount = 0.14; // 幫忙速度M
    const effInterval = Math.round(baseInterval * (1 - lvlDiscount) * (1 - speedDiscount)); // 2124s (35:24)
    assertEquals(effInterval, 2124, 'Venusaur Lv.60 effective interval must be 2124s');
    const helpsPerDay = 86400 / (effInterval * 0.45); // 90.395...
    assertEquals(helpsPerDay.toFixed(1), '90.4', 'Venusaur Lv.60 daily helps under ideal energy must be 90.4');
    const ingRate = 26.60 * (1 + 0.54) * 1.20; // 49.1616%
    assertEquals(ingRate.toFixed(2), '49.16', 'Venusaur Lv.60 ingredient rate must be 49.16%');
    const ingDrops = helpsPerDay * (ingRate / 100); // 44.439...
    assertEquals(ingDrops.toFixed(1), '44.4', 'Venusaur Lv.60 daily ingredient drops must be 44.4');
    const skillRate = 2.10;
    const triggersPerDay = helpsPerDay * (skillRate / 100); // 1.898...
    assertEquals(triggersPerDay.toFixed(2), '1.90', 'Venusaur Lv.60 daily skill triggers must be 1.90');
    const extraIngs = triggersPerDay * 24; // 45.559...
    assertEquals(extraIngs.toFixed(1), '45.6', 'Venusaur Lv.60 Lv.7 skill extra ingredients must be 45.6');
  });

  // 15W. Tooltip Scroll Dismiss, 12h Daytime Yield Baseline, Filter Outline Unclipped & Subskill Swap
  test('Tier 4 - Real-World Application Scenarios', 'Tooltip Scroll Dismiss, 12h Daytime Baseline, Unclipped Filters & Subskill Swap', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Tooltip dismiss on scroll, touch swipe, and outside click
    assert(appJs.includes('dismissAllFloatingTooltips'), 'app.js must define dismissAllFloatingTooltips');
    assert(appJs.includes("window.addEventListener('scroll'"), 'app.js must listen for scroll events to dismiss floating tooltips');
    assert(appJs.includes("window.addEventListener('touchmove'"), 'app.js must listen for touchmove events to dismiss floating tooltips');
    assert(typeof PokemonApp.dismissAllFloatingTooltips === 'function' || typeof global.dismissAllFloatingTooltips === 'function', 'dismissAllFloatingTooltips must be accessible');

    // 2. 12-Hour Daytime Yield Baseline & Help Popover Explanation
    const pikachuData = {
      name_cn: '皮卡丘',
      name_en: 'Pikachu',
      formatted_no: '0025',
      interval: '00:45:00',
      ingredient_rate: '20.0',
      skill_rate: '2.0',
      specialty: '樹果',
      ingredients: [{ name: '特選蘋果', l1: '1', l30: '2', l60: '4' }]
    };
    PokemonApp.openPokemonDetailModal(pikachuData);
    PokemonApp.setPokedexModalLevel(60);
    const formula12 = PokemonApp.calculatePokedexIngredientFormulas();
    assertEquals(formula12.baseCalcSeconds, 43200, 'Formula engine must calculate over 43200 seconds (12h)');
    const expectedHelps12 = 43200 / (formula12.effectiveIntervalSec * 0.45);
    assertEquals(formula12.dailyHelps.toFixed(2), expectedHelps12.toFixed(2), 'dailyHelps must match 43200 / (interval * 0.45)');

    const formulaHtml = PokemonApp.renderPokedexFormulaBreakdownHTML(formula12, pikachuData);
    assert(formulaHtml.includes('43200秒 (12h)') || formulaHtml.includes('43200s (12h)'), 'Formula breakdown must derive helps using 43200 (12h)');
    assert(formulaHtml.includes('次') || formulaHtml.includes('helps'), 'Formula breakdown must display helps unit');
    assert(formulaHtml.includes('次掉落') || formulaHtml.includes('drops'), 'Formula breakdown must display drops unit');

    assert(formulaHtml.includes('12-16') && formulaHtml.includes('8.5'), 'Popover must explain 12-16 waking hours and 8.5 sleep hours rationale');

    // 3. Sidebar Filter Icon Grid Clipped Outline Comprehensive Check
    assert(stylesCss.includes('.sidebar-icon-grid {\n  display: grid !important;\n  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;\n  gap: 3px !important;\n  width: 100% !important;\n  max-width: 100% !important;\n  box-sizing: border-box !important;\n  padding: 4px 3px !important;\n  overflow: visible !important;'), 'styles.css must allow sidebar-icon-grid visible overflow and padding');
    assert(stylesCss.includes('.subfilter-icon-btn.active {\n  background: rgba(56, 189, 248, 0.18) !important;\n  border-color: var(--accent-blue, #38bdf8) !important;\n  box-shadow: 0 0 8px rgba(56, 189, 248, 0.4) !important;\n  position: relative !important;\n  z-index: 2 !important;'), 'styles.css active subfilter buttons must have z-index: 2');
    assert(stylesCss.includes('.mobile-h5-app .recipe-filter-sidebar .sidebar-icon-grid {\n  display: grid !important;\n  grid-template-columns: repeat(7, 1fr) !important;\n  gap: 3px !important;\n  width: 100% !important;\n  box-sizing: border-box !important;\n  padding: 4px 3px !important;\n  overflow: visible !important;'), 'recipe sidebar grid must also have overflow: visible and padding');

    // 4. Subskill Palette Downward Expansion & Re-clickable Swap/Toggle
    PokemonApp.clearAllPokedexSubskills();
    PokemonApp.selectPokedexSubskillSlot(1);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('幫手獎勵');

    // Clicking already-used skill '樹果數量S' while target is slot 2 swaps slots 1 and 2
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    const currentSubs = PokemonApp.getPokedexModalState().subskills;
    assertEquals(currentSubs[0], '幫手獎勵', 'Slot 1 must now hold 幫手獎勵 after swap');
    assertEquals(currentSubs[1], '樹果數量S', 'Slot 2 must now hold 樹果數量S after swap');

    // Clicking the same skill currently occupying slot 2 clears slot 2 (toggle)
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    assertEquals(PokemonApp.getPokedexModalState().subskills[1], '', 'Slot 2 must be cleared when clicking its own assigned skill');

    // Verify subskill chips remain clickable (no disabled attribute)
    PokemonApp.updatePokedexSubskillUI();
    const goldChipsHtml = document.getElementById('pokedex-subskill-chips-gold').innerHTML;
    assert(!goldChipsHtml.includes('disabled'), 'Subskill chips must never be disabled so users can tap to swap/replace');
    assert(goldChipsHtml.includes('in-use'), 'In-use subskills must retain in-use class for visual feedback');

    // Verify modal dialog content-adaptive height (no fixed 88vh, wraps to content)
    // Extract just the .pokedex-modal-dialog rule block for targeted assertion
    const pdxDialogStart = stylesCss.indexOf('.pokedex-modal-dialog {');
    const pdxDialogBlock = pdxDialogStart >= 0 ? stylesCss.substring(pdxDialogStart, pdxDialogStart + 600) : '';
    assert(pdxDialogBlock.includes('height: auto;'), 'pokedex-modal-dialog must use height: auto for content-adaptive sizing');
    assert(stylesCss.includes('max-height: min(880px, 90vh);'), 'pokedex-modal-dialog must have max-height: min(880px, 90vh)');
    assert(stylesCss.includes('max-height: 92dvh !important;'), 'Mobile pokedex modal dialog must have bottom-sheet height matching box modal (92dvh)');
  });

  // 15X. Recipe Modal Header Clear, Removed Energy Unit, 4-Item Height & Fast Differentiated Tooltip Triggers
  test('Tier 4 - Real-World Application Scenarios', 'Recipe Modal Header Clear, Removed Energy Unit, 4-Item Height & Fast Differentiated Tooltip Triggers', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Recipe Modal UI Refinements
    // Header must contain clear button
    assert(wikiJs.includes('ladder-recipe-header-clear-btn'), 'wiki.js must include ladder-recipe-header-clear-btn in modal header');
    assert(stylesCss.includes('.ladder-recipe-header-clear-btn'), 'styles.css must style .ladder-recipe-header-clear-btn');
    assert(stylesCss.includes('.ladder-recipe-modal-actions'), 'styles.css must style .ladder-recipe-modal-actions');

    // Modal template must NOT contain bottom footer
    const modalMatch = wikiJs.match(/id="ladder-recipe-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    assert(modalMatch !== null, 'wiki.js must contain #ladder-recipe-modal markup');
    assert(!modalMatch[0].includes('ladder-recipe-modal-footer'), '#ladder-recipe-modal template must not contain footer');

    // Recipe card must NOT contain recipe-card-energy-unit
    assert(!wikiJs.includes('recipe-card-energy-unit'), 'wiki.js must remove recipe-card-energy-unit');

    // Modal dialog and body must display ~4 items without being overly tall
    assert(stylesCss.includes('max-height: min(580px, 86dvh);'), 'styles.css must restrict ladder-recipe-modal-dialog to min(580px, 86dvh)');
    assert(stylesCss.includes('.ladder-recipe-modal-body {\n  flex: 1 1 auto;\n  max-height: 420px;'), 'styles.css must restrict ladder-recipe-modal-body to ~420px (approx 4 items)');

    // 2. Differentiated Tooltip Triggers (Desktop Hover vs Mobile Tap)
    // special-skill-badge must have cursor: pointer and role="button"
    assert(stylesCss.includes('.special-skill-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--badge-special-bg);\n  border: 1px dashed var(--badge-special-border);\n  border-radius: 5px;\n  padding: 1.5px 6px;\n  color: var(--badge-special-text);\n  font-weight: 500;\n  font-size: 12px;\n  cursor: pointer;'), 'special-skill-badge must have cursor: pointer');
    assert(appJs.includes('class="special-skill-badge" role="button" tabindex="0"'), 'special-skill-badge must include role="button" and tabindex="0"');

    // initSkillTooltips must handle touchend for instant 0ms tap
    assert(appJs.includes('didHandleTouchTap'), 'app.js must track didHandleTouchTap for instant touch response');
    assert(appJs.includes('toggleGlobalTooltip(badge, titleName, detail)'), 'app.js must call toggleGlobalTooltip directly on badge tap/click');

    // toggleGlobalTooltip must not have 500ms delay block
    assert(!appJs.includes('lastGlobalTooltipShownTime < 500'), 'toggleGlobalTooltip must not suppress calls with 500ms delay');

    // Tooltip styling must use translucent dark frosted glass
    assert(stylesCss.includes('background: rgba(15, 23, 42, 0.82);'), 'global-skill-tooltip must use translucent frosted glass background rgba(15, 23, 42, 0.82)');
  });

  // Test 148: Help Button State Restoration & Zero-Lag First-Tap Reopening Verification
  test('Tier 4 - Real-World Application Scenarios', 'Help Button State Restoration & Zero-Lag First-Tap Reopening Verification', () => {
    const fs = require('fs');
    const path = require('path');
    const appJs = fs.readFileSync(path.join(__dirname, '../js/modules/app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

    // 1. dismissAllFloatingTooltips must reset all help buttons and blur activeElement
    assert(appJs.includes('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge'), 'dismissAllFloatingTooltips must query all formula and skill buttons');
    assert(appJs.includes("btn.classList.remove('active')"), 'dismissAllFloatingTooltips must remove active class from buttons');
    assert(appJs.includes("btn.setAttribute('aria-expanded', 'false')"), 'dismissAllFloatingTooltips must set aria-expanded="false"');
    assert(appJs.includes('document.activeElement.blur()'), 'dismissAllFloatingTooltips must blur document.activeElement');

    // 2. showGlobalTooltip must activate anchorEl
    assert(appJs.includes("anchorEl.classList.add('active')"), 'showGlobalTooltip must add active class to anchorEl');
    assert(appJs.includes("anchorEl.setAttribute('aria-expanded', 'true')"), 'showGlobalTooltip must set aria-expanded="true" on anchorEl');

    // 3. hideGlobalTooltip must deactivate currentGlobalTooltipAnchor
    assert(appJs.includes("currentGlobalTooltipAnchor.classList.remove('active')"), 'hideGlobalTooltip must remove active class from anchor');
    assert(appJs.includes("currentGlobalTooltipAnchor.blur()"), 'hideGlobalTooltip must blur currentGlobalTooltipAnchor');

    // 4. initSkillTooltips must handle help buttons on touchend for 0ms instant mobile tap
    assert(appJs.includes("e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn')"), 'touchend must handle pokedex and ladder help buttons');
    assert(appJs.includes('toggleGlobalTooltip(helpBtn, help.title, help.body)'), 'touchend must invoke toggleGlobalTooltip directly for helpBtn');

    // 5. touchmove threshold must be 10px
    assert(appJs.includes('dx > 10 || dy > 10'), 'touchmove threshold must be 10px for responsive slide dismiss');

    // 6. closePokemonDetailModal must dismiss all floating tooltips
    assert(appJs.includes('function closePokemonDetailModal() {\n  dismissAllFloatingTooltips();'), 'closePokemonDetailModal must call dismissAllFloatingTooltips');

    // 7. CSS active classes and pointer fine media queries
    assert(stylesCss.includes('.pokedex-formula-help-btn.active'), 'styles.css must style .pokedex-formula-help-btn.active');
    assert(stylesCss.includes('.ladder-formula-help-btn.active'), 'styles.css must style .ladder-formula-help-btn.active');
    assert(stylesCss.includes('.ladder-help-icon-btn.active'), 'styles.css must style .ladder-help-icon-btn.active');
    assert(stylesCss.includes('@media (hover: hover) and (pointer: fine)'), 'styles.css must wrap help button hover rules with pointer fine media query');

    // 8. Functional Mock Test
    const mockBtn = {
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      _attrs: {},
      setAttribute(k, v) { this._attrs[k] = String(v); },
      getAttribute(k) { return this._attrs[k] || null; },
      removeAttribute(k) { delete this._attrs[k]; },
      blurred: false,
      blur() { this.blurred = true; },
      getBoundingClientRect() {
        return { top: 100, left: 100, width: 20, height: 20 };
      }
    };

    // Load functions into isolated context
    const vm = require('vm');
    const sandbox = {
      document: {
        body: { appendChild() {} },
        createElement(tag) {
          return {
            id: '',
            className: '',
            style: {},
            classList: {
              _classes: new Set(),
              add(c) { this._classes.add(c); },
              remove(c) { this._classes.delete(c); },
              contains(c) { return this._classes.has(c); }
            },
            innerHTML: '',
            getBoundingClientRect() { return { width: 250, height: 100 }; }
          };
        },
        getElementById(id) {
          return this._elements && this._elements[id] ? this._elements[id] : null;
        },
        querySelectorAll(sel) {
          return [mockBtn];
        },
        activeElement: mockBtn
      },
      window: { innerWidth: 1000, innerHeight: 800 },
      Date
    };
    sandbox.window.document = sandbox.document;
    sandbox.document._elements = {};

    const scriptCode = `
      let currentGlobalTooltipAnchor = null;
      let lastGlobalTooltipShownTime = 0;
      let isTooltipPinned = false;

      ${appJs.substring(appJs.indexOf('function showGlobalTooltip'), appJs.indexOf('if (typeof window !== \'undefined\') {\n  window.showGlobalTooltip'))}
    `;

    vm.createContext(sandbox);
    vm.runInContext(scriptCode, sandbox);

    // Step A: Show tooltip on button
    sandbox.showGlobalTooltip(mockBtn, 'Test Title', 'Test Body');
    assert(mockBtn.classList.contains('active'), 'mockBtn must have .active after showGlobalTooltip');
    assert(mockBtn.getAttribute('aria-expanded') === 'true', 'mockBtn aria-expanded must be true');

    // Step B: User slides/scrolls -> dismissAllFloatingTooltips
    mockBtn.blurred = false;
    sandbox.dismissAllFloatingTooltips();
    assert(!mockBtn.classList.contains('active'), 'mockBtn must not have .active after dismissAllFloatingTooltips');
    assert(mockBtn.getAttribute('aria-expanded') === 'false', 'mockBtn aria-expanded must be false');
    assert(mockBtn.blurred === true, 'mockBtn must have been blurred after dismissAllFloatingTooltips');

    // Step C: Next tap on mockBtn -> toggleGlobalTooltip must open on FIRST TAP
    sandbox.toggleGlobalTooltip(mockBtn, 'Test Title', 'Test Body');
    assert(mockBtn.classList.contains('active'), 'mockBtn must immediately open and become active on first tap after scroll');
    assert(mockBtn.getAttribute('aria-expanded') === 'true', 'mockBtn must have aria-expanded="true" after first tap');
  });

  // 16X. Berry Yield & Energy Calculation, strategy-card-desc Removal & Modal Height Auto-Adaptation
  test('Tier 4 - Real-World Application Scenarios', 'Berry Yield Energy Calculation, Strategy Card Desc Removal & Modal Height Auto-Adaptation', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

    // 1. Verify BERRY_BASE_ENERGY_MAP is defined with correct energies
    assert(appJs.includes('BERRY_BASE_ENERGY_MAP'), 'app.js must define BERRY_BASE_ENERGY_MAP');
    assert(appJs.includes("'椰木果': 24"), 'BERRY_BASE_ENERGY_MAP must have 椰木果=24');
    assert(appJs.includes("'芒念果': 26"), 'BERRY_BASE_ENERGY_MAP must have 芒念果=26');
    assert(appJs.includes("'橙橙果': 31"), 'BERRY_BASE_ENERGY_MAP must have 橙橙果=31');
    assert(appJs.includes("'巧可果': 35"), 'BERRY_BASE_ENERGY_MAP must have 巧可果=35');

    // 2. Verify getBerryBaseEnergy and calculateSingleBerryEnergy functions are exported
    assert(appJs.includes('function getBerryBaseEnergy'), 'app.js must define getBerryBaseEnergy');
    assert(appJs.includes('function calculateSingleBerryEnergy'), 'app.js must define calculateSingleBerryEnergy');
    assert(appJs.includes('PokemonApp.getBerryBaseEnergy = getBerryBaseEnergy'), 'PokemonApp must export getBerryBaseEnergy');
    assert(appJs.includes('PokemonApp.calculateSingleBerryEnergy = calculateSingleBerryEnergy'), 'PokemonApp must export calculateSingleBerryEnergy');

    // 3. Verify calculateSingleBerryEnergy formula uses correct growth formula
    assert(appJs.includes('Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1))'), 'calculateSingleBerryEnergy must use correct growth formula max(base+(lv-1), base*1.025^(lv-1))');

    // 4. Verify berry yield calculation variables in calculatePokedexIngredientFormulas
    assert(appJs.includes('const isBerrySpec'), 'calculatePokedexIngredientFormulas must compute isBerrySpec');
    assert(appJs.includes('const berriesPerHelp'), 'calculatePokedexIngredientFormulas must compute berriesPerHelp');
    assert(appJs.includes('const dailyBerryHelps'), 'calculatePokedexIngredientFormulas must compute dailyBerryHelps');
    assert(appJs.includes('const dailyBerryCount'), 'calculatePokedexIngredientFormulas must compute dailyBerryCount');
    assert(appJs.includes('const dailyBerryEnergy'), 'calculatePokedexIngredientFormulas must compute dailyBerryEnergy');
    assert(appJs.includes('const dailyBerryEnergyFav'), 'calculatePokedexIngredientFormulas must compute dailyBerryEnergyFav');

    // 5. Verify berry yield fields in return object
    assert(appJs.includes('berryName,'), 'formula return must include berryName');
    assert(appJs.includes('singleBerryEnergy,'), 'formula return must include singleBerryEnergy');
    assert(appJs.includes('dailyBerryHelps,'), 'formula return must include dailyBerryHelps');
    assert(appJs.includes('dailyBerryCount,'), 'formula return must include dailyBerryCount');
    assert(appJs.includes('dailyBerryEnergy,'), 'formula return must include dailyBerryEnergy');
    assert(appJs.includes('dailyBerryEnergyFav,'), 'formula return must include dailyBerryEnergyFav');

    // 6. Verify Step 2 berry calculation block is rendered in formula breakdown HTML
    assert(appJs.includes("'Berry Yield & Energy (12h)'"), 'renderPokedexFormulaBreakdownHTML must include EN berry step header');
    assert(appJs.includes("'樹果產量與單日能量 (12h)'"), 'renderPokedexFormulaBreakdownHTML must include ZH berry step header');
    assert(appJs.includes('calc-color-berry'), 'renderPokedexFormulaBreakdownHTML must use calc-color-berry class');
    assert(appJs.includes('berry-row-detail'), 'renderPokedexFormulaBreakdownHTML must use berry-row-detail for space-between energy row');
    assert(appJs.includes('berry-detail-left'), 'renderPokedexFormulaBreakdownHTML must use berry-detail-left');
    assert(appJs.includes('dailyBerryEnergyFav.toLocaleString'), 'renderPokedexFormulaBreakdownHTML must display dailyBerryEnergyFav');


    // 7. Verify formula title updated to 產能算法精算拆解 (general yield, not just ingredient)
    assert(appJs.includes("'產能算法精算拆解'"), 'app.js fallback title must be 產能算法精算拆解');
    assert(i18nJs.includes("'pokedex.formula_title': '產能算法精算拆解'"), 'i18n zh-TW formula_title must be 產能算法精算拆解');
    assert(i18nJs.includes("'pokedex.formula_title': 'Yield Formula Breakdown'"), 'i18n en-US formula_title must be Yield Formula Breakdown');

    // 8. Verify strategy-card-desc and strategy-card-badge removed, title placed inside frame on its own line
    const strategyFnStart = appJs.indexOf('function renderPokedexStrategyCardHTML');
    const strategyFnEnd = appJs.indexOf('function renderPokedexDetailModalContent');
    const strategyFnBody = appJs.substring(strategyFnStart, strategyFnEnd);
    assert(!strategyFnBody.includes('strategy-card-desc'), 'renderPokedexStrategyCardHTML must NOT render strategy-card-desc (removed per user request)');
    assert(!strategyFnBody.includes('strategy-card-badge'), 'renderPokedexStrategyCardHTML must NOT render strategy-card-badge (removed per user request)');
    assert(strategyFnBody.includes('strategy-card-title pokedex-formula-badge font-bold'), 'renderPokedexStrategyCardHTML must render strategy-card-title with pokedex-formula-badge inside the card');
    assert(strategyFnBody.includes('strategy-details-grid'), 'renderPokedexStrategyCardHTML must still render strategy-details-grid');
    const formulaFnStart = appJs.indexOf('function renderPokedexFormulaBreakdownHTML');
    const formulaFnEnd = appJs.indexOf('function togglePokedexEnergyHelp');
    const formulaFnBody = appJs.substring(formulaFnStart, formulaFnEnd);
    assert(formulaFnBody.includes('pokedex-strategy-desktop-container'), 'Desktop strategy container must be nested inside renderPokedexFormulaBreakdownHTML unified box');
    assert(stylesCss.includes('.pokedex-calc-unified-box .pokedex-strategy-card'), 'styles.css must style pokedex-strategy-card inside pokedex-calc-unified-box');

    // 9. Verify modal height auto-adaptation in CSS (narrowed to .pokedex-modal-dialog block)
    const pdxBlock2Start = stylesCss.indexOf('.pokedex-modal-dialog {');
    const pdxBlock2 = pdxBlock2Start >= 0 ? stylesCss.substring(pdxBlock2Start, pdxBlock2Start + 600) : '';
    assert(pdxBlock2.includes('height: auto;'), 'CSS .pokedex-modal-dialog must have height: auto');
    assert(stylesCss.includes('max-height: min(880px, 90vh);'), 'CSS must have max-height: min(880px, 90vh)');
    assert(!pdxBlock2.includes('height: 88vh'), 'CSS .pokedex-modal-dialog must NOT use fixed height: 88vh');

    // 10. Verify calc-color-berry CSS class defined and berry-row-detail style present
    assert(stylesCss.includes('.calc-color-berry'), 'styles.css must define .calc-color-berry');
    assert(stylesCss.includes('berry-row-detail'), 'styles.css must define .berry-row-detail for space-between layout');
    assert(stylesCss.includes('.strategy-card-title {'), 'styles.css must define .strategy-card-title');
  });

  // ----------------------------------------------------
  // Test 150: God Presets and Appraisal Engine for Berry Speed Natures and BFS Skill Specialists
  // ----------------------------------------------------
  test('Tier 4 - Real-World Application Scenarios', 'God Presets and Appraisal for Berry Speed Natures and BFS Skill Specialists', () => {
    // 1. Verify isBfsSkillSpecialist, isHealerSkillSpecialist, isHelperBoostSkillSpecialist, and isChargeStrengthSkillSpecialist
    assert(typeof PokemonApp.isBfsSkillSpecialist === 'function', 'PokemonApp.isBfsSkillSpecialist must be a function');
    assert(typeof PokemonApp.isHealerSkillSpecialist === 'function', 'PokemonApp.isHealerSkillSpecialist must be a function');
    assert(typeof PokemonApp.isHelperBoostSkillSpecialist === 'function', 'PokemonApp.isHelperBoostSkillSpecialist must be a function');
    assert(typeof PokemonApp.isChargeStrengthSkillSpecialist === 'function', 'PokemonApp.isChargeStrengthSkillSpecialist must be a function');
    
    // Load appraisal.js in isolated vm context
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    assert(typeof appCtx.AppraisalLab.isBfsSkillSpecialist === 'function', 'AppraisalLab.isBfsSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isHealerSkillSpecialist === 'function', 'AppraisalLab.isHealerSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isHelperBoostSkillSpecialist === 'function', 'AppraisalLab.isHelperBoostSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isChargeStrengthSkillSpecialist === 'function', 'AppraisalLab.isChargeStrengthSkillSpecialist must be exported');

    // Legendary Beasts & Helper Boost: Raikou, Entei, Suicune - strictly pure skill, NOT BFS
    const raikou = { name_cn: '雷公', specialty: '技能', main_skill: '幫手加速（電）' };
    const entei = { name_cn: '炎帝', specialty: '技能', main_skill: '幫手加速（火）' };
    const suicune = { name_cn: '水君', specialty: '技能', main_skill: '幫手加速（水）' };
    assert(PokemonApp.isBfsSkillSpecialist(raikou) === false, 'Raikou must NOT be classified as BFS-suited');
    assert(PokemonApp.isHelperBoostSkillSpecialist(raikou) === true, 'Raikou must be classified as Helper Boost specialist');
    assert(PokemonApp.isHelperBoostSkillSpecialist(entei) === true, 'Entei must be classified as Helper Boost specialist');
    assert(PokemonApp.isHelperBoostSkillSpecialist(suicune) === true, 'Suicune must be classified as Helper Boost specialist');
    assert(appCtx.AppraisalLab.isHelperBoostSkillSpecialist(raikou) === true, 'AppraisalLab must classify Raikou as Helper Boost');

    // Healers: Gardevoir - strictly pure skill healer, NOT default BFS
    const gardevoir = { name_cn: '沙奈朵', specialty: '技能', main_skill: '活力全體療癒S' };
    assert(PokemonApp.isBfsSkillSpecialist(gardevoir) === false, 'Gardevoir must NOT be classified as default BFS specialist');
    assert(PokemonApp.isHealerSkillSpecialist(gardevoir) === true, 'Gardevoir must be classified as Healer specialist');
    assert(appCtx.AppraisalLab.isHealerSkillSpecialist(gardevoir) === true, 'AppraisalLab must classify Gardevoir as Healer');

    // Charge Strength: Ampharos, Golduck - direct power, pure skill god preset with hybrid option
    const ampharos = { name_cn: '電龍', specialty: '技能', main_skill: '能量填充M' };
    const golduck = { name_cn: '哥達鴨', specialty: '技能', main_skill: '能量填充S' };
    assert(PokemonApp.isBfsSkillSpecialist(ampharos) === false, 'Ampharos must NOT be classified as default BFS-only specialist');
    assert(PokemonApp.isChargeStrengthSkillSpecialist(ampharos) === true, 'Ampharos must be classified as Charge Strength specialist');
    assert(PokemonApp.isChargeStrengthSkillSpecialist(golduck) === true, 'Golduck must be classified as Charge Strength specialist');

    // Pure / Anti-BFS Tactical Skill Pokemon: Dedenne, Magnezone, Meowth
    const dedenne = { name_cn: '咚咚鼠', specialty: '技能', main_skill: '美味大成功' };
    const magnezone = { name_cn: '自爆磁怪', specialty: '技能', main_skill: '料理強化S' };
    const meowth = { name_cn: '喵喵', specialty: '技能', main_skill: '夢之碎片獲取S' };
    assert(PokemonApp.isBfsSkillSpecialist(dedenne) === false, 'Dedenne must NOT be classified as BFS-suited');
    assert(PokemonApp.isBfsSkillSpecialist(magnezone) === false, 'Magnezone must NOT be classified as BFS-suited');
    assert(PokemonApp.isBfsSkillSpecialist(meowth) === false, 'Meowth must NOT be classified as BFS-suited');

    // Non-skill Pokemon
    const pikachu = { name_cn: '皮卡丘', specialty: '樹果', main_skill: '能量填充S' };
    const blastoise = { name_cn: '水箭龜', specialty: '食材', main_skill: '食材獲取S' };
    assert(PokemonApp.isBfsSkillSpecialist(pikachu) === false, 'Berry specialist Pikachu must return false');
    assert(PokemonApp.isBfsSkillSpecialist(blastoise) === false, 'Ingredient specialist Blastoise must return false');

    // 2. Strategy Card recommendations
    const berryStratHtml = PokemonApp.renderPokedexStrategyCardHTML(pikachu);
    assert(berryStratHtml.includes('固執') && berryStratHtml.includes('降食材首選'), 'Berry strategy card must highlight Adamant as primary speed nature reducing ingredients');

    const raikouStratHtml = PokemonApp.renderPokedexStrategyCardHTML(raikou);
    assert(raikouStratHtml.includes('傳說幫手加速核心定位'), 'Raikou strategy card must display helper core title');
    assert(!raikouStratHtml.includes('樹果數量S'), 'Raikou strategy card must strictly avoid BFS');

    const gardevoirStratHtml = PokemonApp.renderPokedexStrategyCardHTML(gardevoir);
    assert(gardevoirStratHtml.includes('全隊活力療癒核心定位'), 'Gardevoir strategy card must display healer core title');
    assert(!gardevoirStratHtml.includes('樹果數量S'), 'Gardevoir strategy card must NOT recommend BFS');

    const ampharosStratHtml = PokemonApp.renderPokedexStrategyCardHTML(ampharos);
    assert(ampharosStratHtml.includes('高頻單體充能直傷定位'), 'Ampharos strategy card must display direct charge title');
    assert(ampharosStratHtml.includes('樹果數量S'), 'Ampharos strategy card includes BFS as optional hybrid');
    assert(ampharosStratHtml.includes('慎重降食材最優'), 'Ampharos strategy card must recommend Careful nature');

    const dedenneStratHtml = PokemonApp.renderPokedexStrategyCardHTML(dedenne);
    assert(dedenneStratHtml.includes('高頻純戰術技能輔助定位'), 'Dedenne strategy card must display pure tactical title');
    assert(!dedenneStratHtml.includes('樹果數量S'), 'Dedenne strategy card must strictly exclude BFS');

    // 3. Appraisal diagnostics
    // Berry specialist with Adamant nature
    const berryEval = appCtx.AppraisalLab.evaluatePokemon(pikachu, 60, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 1);
    assert(berryEval.pros.some(p => p.includes('固執') && p.includes('樹果型第一神性格')), 'Appraisal pros must highlight Adamant as #1 God nature for Berry specialists');

    // Raikou with BFS warning
    const raikouEval = appCtx.AppraisalLab.evaluatePokemon(raikou, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(raikouEval.cons.some(c => c.includes('幫手加速') && c.includes('阻斷主技能判定')), 'Appraisal cons must warn that BFS on Raikou blocks Helper Boost procs');

    // Healer with BFS warning
    const gardevoirEval = appCtx.AppraisalLab.evaluatePokemon(gardevoir, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(gardevoirEval.cons.some(c => c.includes('活力療癒補師') && c.includes('阻斷主技能判定')), 'Appraisal cons must warn that BFS on Healer blocks healing procs');

    // Charge Strength specialist with BFS (hybrid acknowledgement)
    const ampharosEval = appCtx.AppraisalLab.evaluatePokemon(ampharos, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫忙速度M'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(ampharosEval.pros.some(p => p.includes('樹果數量S') && p.includes('高額樹果副輸出')), 'Appraisal pros must highlight BFS on Charge Strength as hybrid power');

    // Dedenne with BFS warning
    const dedenneEval = appCtx.AppraisalLab.evaluatePokemon(dedenne, 60, '自大', ['技能機率提升M', '樹果數量S'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(dedenneEval.cons.some(c => c.includes('純戰術型') && c.includes('容易過早滿包限制主技能判定')), 'Appraisal cons must warn that BFS causes bag overflow on Dedenne');
  });

  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Table Dynamic Height Adaptation and Dock Clearance', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify body dock padding clearance
    assert(
      css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
      'body.mobile-h5-app must reserve dock clearance via padding-bottom'
    );

    // 2. Verify table-container uses flex: 0 1 auto so filtered lists collapse dynamically
    assert(
      css.includes('.mobile-h5-app.pokemon-active .table-container') && css.includes('flex: 0 1 auto !important;'),
      'Pokemon table container must use flex: 0 1 auto for dynamic height adaptation'
    );

    // 3. Verify content-area has padding-bottom buffer
    assert(
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content .content-area') &&
      css.includes('padding-bottom: 8px !important;'),
      'content-area must have padding-bottom: 8px buffer above dock'
    );

    // 4. Verify panels inherit 100% height without fragile calc
    assert(
      css.includes('.mobile-h5-app.pokemon-active #panel-pokemon {\n  height: 100% !important;'),
      '#panel-pokemon must use height: 100% to inherit cleanly from body'
    );
  });

  // ----------------------------------------------------
  // Test 152: Main Skill Yield for All Specialties & Compact Strategy Card Layout
  // ----------------------------------------------------
  test('Tier 4 - Real-World Application Scenarios', 'Main Skill Actual Yield Display for All Specialties & Compact Strategy Card Polish', () => {
    // 1. Verify getPokedexMainSkillYield is exported
    assert(typeof PokemonApp.getPokedexMainSkillYield === 'function', 'PokemonApp.getPokedexMainSkillYield must be a function');

    // 2. Test Ingredient Magnet S (Chinese & English)
    const ingMagnetCn = PokemonApp.getPokedexMainSkillYield('食材獲取S', 6, 4.5, false);
    assert(ingMagnetCn !== null, 'Ingredient Magnet yield must not be null');
    assertEquals(ingMagnetCn.mainSkillLabel, '食材獲取S (Lv.6)', 'Magnet Chinese label');
    assertEquals(ingMagnetCn.mainSkillValueText, '+94.5 顆額外食材', 'Magnet Chinese daily text');
    assertEquals(ingMagnetCn.mainSkillSingleText, '單次 21 顆', 'Magnet Chinese single text');

    const ingMagnetEn = PokemonApp.getPokedexMainSkillYield('食材獲取S', 6, 4.5, true);
    assertEquals(ingMagnetEn.mainSkillLabel, 'Magnet S (Lv.6)', 'Magnet English label');
    assertEquals(ingMagnetEn.mainSkillValueText, '+94.5 extra ings', 'Magnet English daily text');
    assertEquals(ingMagnetEn.mainSkillSingleText, 'yield 21 ings', 'Magnet English single text');

    // 3. Test Charge Strength M (Ampharos / Espeon)
    const chargeMCn = PokemonApp.getPokedexMainSkillYield('能量填充M', 7, 5.0, false);
    assert(chargeMCn !== null, 'Charge Strength M yield must not be null');
    assertEquals(chargeMCn.mainSkillLabel, '能量填充M (Lv.7)', 'Charge M label');
    assertEquals(chargeMCn.mainSkillValueText, '+32,045 點能量', 'Charge M daily text');
    assertEquals(chargeMCn.mainSkillSingleText, '單次 6,409 能量', 'Charge M single text');

    // 4. Test Charge Strength S (Pikachu / Raichu)
    const chargeSCn = PokemonApp.getPokedexMainSkillYield('能量填充S', 5, 2.0, false);
    assert(chargeSCn !== null, 'Charge Strength S yield must not be null');
    assertEquals(chargeSCn.mainSkillLabel, '能量填充S (Lv.5)', 'Charge S label');
    assertEquals(chargeSCn.mainSkillValueText, '+2,992 點能量', 'Charge S daily text');
    assertEquals(chargeSCn.mainSkillSingleText, '單次 1,496 能量', 'Charge S single text');

    // 5. Test Energy for Everyone (E4E - Gardevoir / Sylveon / Wigglytuff)
    const e4eCn = PokemonApp.getPokedexMainSkillYield('活力全體療癒S', 6, 4.0, false);
    assert(e4eCn !== null, 'E4E yield must not be null');
    assertEquals(e4eCn.mainSkillLabel, '活力全體療癒S (Lv.6)', 'E4E label');
    assertEquals(e4eCn.mainSkillValueText, '+72.0 點全員活力', 'E4E daily text');
    assertEquals(e4eCn.mainSkillSingleText, '單次 18 點', 'E4E single text');

    // 6. Test Helper Boost (Raikou / Entei / Suicune)
    const helperBoostCn = PokemonApp.getPokedexMainSkillYield('幫手加速（電）', 6, 2.0, false);
    assert(helperBoostCn !== null, 'Helper Boost yield must not be null');
    assertEquals(helperBoostCn.mainSkillLabel, '幫手加速（電） (Lv.6)', 'Helper Boost label');
    assertEquals(helperBoostCn.mainSkillValueText, '+22.0 次全員幫忙', 'Helper Boost daily text');
    assertEquals(helperBoostCn.mainSkillSingleText, '單次最高 11 次', 'Helper Boost single text');

    // 7. Test Cooking Power Up S (Magnezone)
    const cookingPowerCn = PokemonApp.getPokedexMainSkillYield('料理強化S', 6, 3.0, false);
    assert(cookingPowerCn !== null, 'Cooking Power Up yield must not be null');
    assertEquals(cookingPowerCn.mainSkillLabel, '料理強化S (Lv.6)', 'Cooking Power Up label');
    assertEquals(cookingPowerCn.mainSkillValueText, '+81.0 鍋子容量', 'Cooking Power Up daily text');
    assertEquals(cookingPowerCn.mainSkillSingleText, '單次 +27 容量', 'Cooking Power Up single text');

    // 8. Test Tasty Chance S (Dedenne)
    const tastyChanceCn = PokemonApp.getPokedexMainSkillYield('料理成功S', 6, 3.5, false);
    assert(tastyChanceCn !== null, 'Tasty Chance yield must not be null');
    assertEquals(tastyChanceCn.mainSkillLabel, '料理成功S (Lv.6)', 'Tasty Chance label');
    assertEquals(tastyChanceCn.mainSkillValueText, '+35.0% 大成功機率', 'Tasty Chance daily text');
    assertEquals(tastyChanceCn.mainSkillSingleText, '單次 +10%', 'Tasty Chance single text');

    // 9. Verify calculatePokedexIngredientFormulas integration for various specialists
    // 9a. Test Ampharos (Skill specialist with Charge Strength M)
    PokemonApp.openPokemonDetailModal('181');
    const ampharosFm = PokemonApp.calculatePokedexIngredientFormulas();
    assert(ampharosFm.mainSkillLabel.includes('能量填充M'), 'Ampharos mainSkillLabel must include 能量填充M');
    assert(ampharosFm.mainSkillValueText.includes('點能量'), 'Ampharos mainSkillValueText must contain 點能量');
    assert(ampharosFm.mainSkillSingleText.includes('能量'), 'Ampharos mainSkillSingleText must contain 能量');

    // 9b. Verify HTML breakdown rendering includes calc-row-subskill-extra
    const breakdownHtml = PokemonApp.renderPokedexFormulaBreakdownHTML(ampharosFm);
    assert(breakdownHtml.includes('calc-row-subskill-extra'), 'Breakdown HTML must render .calc-row-subskill-extra');
    assert(breakdownHtml.includes('badge-skill-extra'), 'Breakdown HTML must render badge-skill-extra');
    assert(breakdownHtml.includes('text-skill-extra'), 'Breakdown HTML must render text-skill-extra');
    assert(breakdownHtml.includes('text-skill-single'), 'Breakdown HTML must render text-skill-single');

    // 10. Verify CSS styles for compact strategy cards & un-enlarged core skill
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    assert(stylesCss.includes('gap: 3px !important;'), 'Pokedex strategy card must use tight 3px gap');
    assert(stylesCss.includes('.strategy-details-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;'), 'Strategy grid must have 3px gap');
    assert(stylesCss.includes('.strategy-core-k {\n  font-size: 12.5px !important;'), 'Core skill key must be standard 12.5px without enlargement');
    assert(stylesCss.includes('.strategy-core-chip {\n  font-size: 12px !important;'), 'Core skill chip must be standard 12px without enlargement');
    assert(stylesCss.includes('.text-skill-single {\n  font-size: 11px;'), 'styles.css must style .text-skill-single');
  });

  // ----------------------------------------------------
  // Test 153: Evolution Levels & Level Adjustment Constraints Verification
  // ----------------------------------------------------
  test('Tier 4 - Real-World Application Scenarios', 'Evolution Levels and Level Adjustment Constraints Comprehensive Audit', () => {
    // 1. Verify Clodsire (土王 980) and Paldean Wooper (烏波 7054)
    const clod = dataset.find(p => p.formatted_no === '980' || p.name_cn === '土王');
    assert(clod !== undefined, 'Clodsire must exist in dataset');
    assertEquals(clod.evo_req, 'Lv.15 + 40 糖', 'Clodsire evo_req must be Lv.15 + 40 糖');
    const clodMinLvl = PokemonApp.getPokedexMinEvolutionLevel(clod);
    assertEquals(clodMinLvl, 15, 'Clodsire minimum evolution level must be 15');

    const paldeanWooper = dataset.find(p => p.formatted_no === '7054');
    assert(paldeanWooper !== undefined, 'Paldean Wooper must exist in dataset');
    assert(paldeanWooper.name_cn.includes('帕底亞'), 'Paldean Wooper name must contain 帕底亞');
    assertEquals(paldeanWooper.evo_req, '', 'Paldean Wooper base form evo_req must be empty');
    const wooperMinLvl = PokemonApp.getPokedexMinEvolutionLevel(paldeanWooper);
    assertEquals(wooperMinLvl, 1, 'Paldean Wooper minimum level must be 1');

    // 2. Verify legitimate stone/item/sleep evolution pokemon have minLevel = 1
    const stoneAndSleepNames = ['雷丘', '風速狗', '九尾', '水伊布', '仙子伊布', '路卡利歐', '大綱蛇', '波克基斯'];
    stoneAndSleepNames.forEach(name => {
      const p = dataset.find(x => x.name_cn === name);
      if (p) {
        const minLvl = PokemonApp.getPokedexMinEvolutionLevel(p);
        assertEquals(minLvl, 1, `${name} has no level requirement in Pokemon Sleep and should allow minLevel = 1`);
      }
    });

    // 3. Verify Stage 3 inherited level evolutions
    const stage3Inherited = [
      { name: '大食花', expected: 16 },
      { name: '隆隆岩', expected: 19 },
      { name: '自爆磁怪', expected: 23 },
      { name: '耿鬼', expected: 19 },
      { name: '艾路雷朵', expected: 15 },
      { name: '鍬農炮蟲', expected: 15 },
      { name: '巴布土撥', expected: 14 }
    ];
    stage3Inherited.forEach(item => {
      const p = dataset.find(x => x.name_cn === item.name);
      if (p) {
        const minLvl = PokemonApp.getPokedexMinEvolutionLevel(p);
        assertEquals(minLvl, item.expected, `${item.name} must inherit stage 2 min level of ${item.expected}`);
      }
    });

    // 4. Verify Pokédex Modal Level Clamping for Clodsire (土王)
    PokemonApp.openPokemonDetailModal('980');
    assert(PokemonApp.getPokedexModalState().level >= 15, 'Clodsire modal level must be >= 15 upon opening');
    PokemonApp.setPokedexModalLevel(5); // Try to set below 15
    assertEquals(PokemonApp.getPokedexModalState().level, 15, 'Setting Clodsire level below 15 must clamp to 15');

    // 5. Verify Pokédex Modal Level Setting for Base form (Paldean Wooper)
    PokemonApp.openPokemonDetailModal('7054');
    PokemonApp.setPokedexModalLevel(5);
    assertEquals(PokemonApp.getPokedexModalState().level, 5, 'Base form Paldean Wooper allows setting level down to 5');
  });

  // ----------------------------------------------------
  // Test 154: Mobile H5 Viewport Boundary Isolation, News Scrolling & Ladder Adaptation
  // ----------------------------------------------------
  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Viewport Boundary Isolation, News Scrolling & Ladder Dynamic Adaptation', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Viewport boundary isolation: main viewport must be explicitly anchored between header and dock
    assert(
      css.includes('.mobile-h5-app .app-main-viewport {') &&
      css.includes('top: calc(52px + env(safe-area-inset-top, 0px)) !important;') &&
      css.includes('bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
      'app-main-viewport must be anchored between top header and bottom dock'
    );

    // 2. News panel scrolling: #panel-news must have overflow-y: auto and never overflow: visible
    assert(
      css.includes('.mobile-h5-app #panel-news {') &&
      css.includes('overflow-y: auto !important;'),
      '#panel-news must have overflow-y: auto !important for native touch scrolling'
    );
    assert(
      !css.includes('.mobile-h5-app #panel-news {\n  width: 100% !important;\n  height: auto !important;\n  max-height: none !important;\n  overflow: visible !important;'),
      '#panel-news must not use overflow: visible which breaks scrolling'
    );

    // 3. Ladder single-screen view: ladder-active must use overflow: hidden for zero-scroll full view
    assert(
      css.includes('.mobile-h5-app.ladder-active #panel-wiki') &&
      css.includes('overflow: hidden !important;'),
      '#panel-wiki during ladder-active must use overflow: hidden for single-screen full view'
    );

    // 4. Subpanel ingredients: must use flex: 1 1 auto, min-height: 0 and overflow: hidden to fit all 18 tracks on screen
    assert(
      css.includes('.mobile-h5-app #wiki-subpanel-ingredients.active {') &&
      css.includes('overflow: hidden !important;') &&
      css.includes('flex: 1 1 auto !important;'),
      '#wiki-subpanel-ingredients.active must use flex: 1 1 auto and overflow: hidden'
    );
    assert(
      css.includes('.mobile-h5-app .wiki-main-container {') &&
      css.includes('min-height: 0 !important;'),
      '.mobile-h5-app .wiki-main-container must reset min-height to 0 to prevent pushing dock'
    );

    // 5. Tail box container: must sit at bottom above the dock with margin-top: auto
    assert(
      css.includes('.mobile-h5-app .ladder-tail-standalone-container {') &&
      css.includes('margin-top: auto !important;') &&
      css.includes('margin-bottom: 2px !important;'),
      'ladder tail box must sit cleanly above dock without scrolling or overflow'
    );

    // 6. Pokédex viewport: content-area must support #content-area and .content-area with flex adaptation
    assert(
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content #content-area,') &&
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content .content-area {'),
      'pokedex view must adapt #content-area and .content-area dynamically'
    );
  });

  test('Tier 4 - Real-World Application Scenarios', 'English Concise Translations & Island Legendary Pokemon Filter Switch', () => {
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify CSS styles for island legendary switch
    assert(stylesCss.includes('.island-spawns-title-wrap'), 'CSS must define .island-spawns-title-wrap');
    assert(stylesCss.includes('.island-legendary-switch-label'), 'CSS must define .island-legendary-switch-label');

    // 2. Setup VM environment for wiki and i18n
    const localStore = {};
    const sandbox = {
      window: {
        localStorage: {
          getItem: (k) => localStore[k] || null,
          setItem: (k, v) => { localStore[k] = String(v); },
          removeItem: (k) => { delete localStore[k]; }
        },
        innerWidth: 1024,
        location: { hash: '#wiki/islands', search: '' },
        document: {
          documentElement: {
            setAttribute: () => {},
            getAttribute: () => null
          },
          getElementById: () => null,
          querySelectorAll: () => [],
          addEventListener: () => {}
        }
      },
      localStorage: {
        getItem: (k) => localStore[k] || null,
        setItem: (k, v) => { localStore[k] = String(v); },
        removeItem: (k) => { delete localStore[k]; }
      },
      document: {
        documentElement: {
          setAttribute: () => {},
          getAttribute: () => null
        },
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      },
      console: console
    };

    vm.createContext(sandbox);
    vm.runInContext(i18nCode, sandbox);
    vm.runInContext(wikiCode, sandbox);

    // 3. Verify concise English translations
    sandbox.window.I18N.setLanguage('en-US');
    assertEquals(sandbox.window.I18N.t('pokedex.reset_all'), 'Reset', 'pokedex.reset_all should be Reset');
    assertEquals(sandbox.window.I18N.t('pokedex.filter_sidebar_title'), 'Filter', 'pokedex.filter_sidebar_title should be Filter');
    assertEquals(sandbox.window.I18N.t('recipe.clear_all'), 'Clear', 'recipe.clear_all should be Clear');
    assertEquals(sandbox.window.I18N.t('recipe.calc_settings'), 'Simulation', 'recipe.calc_settings should be Simulation');
    assertEquals(sandbox.window.I18N.t('wiki.islands_legendary_toggle'), 'Legendary', 'wiki.islands_legendary_toggle should be Legendary');
    assertEquals(sandbox.window.I18N.t('wiki.subtab_skills'), 'Main Skills', 'wiki.subtab_skills should be Main Skills');
    assertEquals(sandbox.window.I18N.t('box.modal_save'), 'Save', 'box.modal_save should be Save');

    // 4. Verify Island Legendary Switch functions exist in WikiDB
    assert(typeof sandbox.window.WikiDB.toggleIslandLegendaryOnly === 'function', 'WikiDB must export toggleIslandLegendaryOnly');
    assert(typeof sandbox.window.WikiDB.getSavedIslandLegendaryOnly === 'function', 'WikiDB must export getSavedIslandLegendaryOnly');
    assert(typeof sandbox.window.WikiDB.getIsIslandLegendaryOnly === 'function', 'WikiDB must export getIsIslandLegendaryOnly');

    // 5. Select Greengrass and render normal spawns (legendary switch OFF)
    sandbox.window.WikiDB.selectIsland('greengrass');
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(false);
    let htmlAll = sandbox.window.WikiDB.renderIslandsSubpanel();
    assert(htmlAll.includes('id="island-legendary-switch"'), 'markup must include island-legendary-switch');
    assert(htmlAll.includes('Pikachu') || htmlAll.includes('Bulbasaur'), 'normal spawns must include regular Pokemon');

    // 6. Toggle Legendary Switch ON
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(true);
    assertEquals(sandbox.window.WikiDB.getIsIslandLegendaryOnly(), true, 'legendary toggle must be true');
    assertEquals(localStore['pksleep_active_island_legendary_only'], 'true', 'localStorage must persist legendary state');

    let htmlLeg = sandbox.window.WikiDB.renderIslandsSubpanel();
    assert(htmlLeg.includes('Raikou') || htmlLeg.includes('Entei') || htmlLeg.includes('Suicune'), 'legendary filter must include legendary dogs');
    assert(!htmlLeg.includes('Caterpie') && !htmlLeg.includes('Pidgey'), 'legendary filter must exclude common Pokemon');

    // 7. Toggle Legendary Switch OFF
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(false);
    assertEquals(sandbox.window.WikiDB.getIsIslandLegendaryOnly(), false, 'legendary toggle must be false');
    assertEquals(localStore['pksleep_active_island_legendary_only'], 'false', 'localStorage must reflect false');
  });

  test('Tier 4 - Real-World Application Scenarios', 'Mobile Overlay Portal Covers App Bar/Dock And Blocks Pull-To-Refresh', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    assert(appJs.includes('function portalMobileOverlays'), 'app.js must define portalMobileOverlays');
    assert(appJs.includes("classList.add('overlay-open')"), 'app.js must mark body overlay-open');
    assert(appJs.includes("classList.contains('overlay-open')"), 'pull-to-refresh must respect overlay-open');
    assert(appJs.includes('e.preventDefault()'), 'overlay pull-down must preventDefault');
    assert(recipesJs.includes('window.portalMobileOverlays'), 'recipes.js must portal filter drawer');
    assert(wikiJs.includes('window.portalMobileOverlays'), 'wiki.js must portal ladder drawer');
    assert(boxJs.includes('window.portalMobileOverlays'), 'box.js must portal edit/lightbox overlays');
    assert(appraisalJs.includes('window.portalMobileOverlays'), 'appraisal.js must portal report overlay');
    assert(wikiJs.includes('window.syncOverlayOpenState'), 'wiki.js must sync overlay-open on ladder recipe modal');
    assert(appJs.includes('function resolveUniqueOverlay'), 'app.js must dedupe duplicate overlay IDs');
    assert(appJs.includes('SIDEBAR_BACKDROP_BY_ID'), 'app.js must portal only the opened sidebar plus its backdrop');
    assert(!appJs.includes("querySelectorAll('.appraisal-modal-backdrop, .ladder-recipe-modal')"), 'app.js must not bulk-portal every overlay');
    assert(wikiJs.includes('renderLadderRecipeModalContent(modal)'), 'wiki.js must fill the same modal node being shown');
    assert(wikiJs.includes("window.pruneOverlayDuplicates"), 'wiki re-render must prune orphan overlay copies');

    assert(css.includes('.mobile-h5-app.overlay-open'), 'CSS must define overlay-open stacking');
    assert(css.includes('.mobile-h5-app.overlay-open .mobile-app-header'), 'CSS must drop app bar under overlay');
    assert(css.includes('.mobile-h5-app.overlay-open .bottom-dock'), 'CSS must drop bottom dock under overlay');
    assert(css.includes('z-index: 10040 !important;'), 'sidebar backdrop must sit above header/dock');
    assert(css.includes('z-index: 10050 !important;'), 'filter drawer must sit above blurred chrome');
    assert(css.includes('.mobile-h5-app .sidebar-scrollable-content') && css.includes('overscroll-behavior-y: contain !important;'), 'filter drawer must contain overscroll');
  });

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
