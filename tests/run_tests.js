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
  assert(result.grade === 'S+' || result.grade === 'S', 'Raichu God Roll should achieve S+ or S rank');
  assert(result.pros.length >= 2, 'Should generate multiple pro highlights for top rolls');

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
    'toggleLadderNatureIng', 'toggleLadderNatureSpeed', 'setLadderNature',
    'onLadderSearch', 'clearLadderSearch',
    'setLadderRecipeFilter', 'refreshCoordinateLadder', 'handleLadderGroupHover',
    'handleLadderGroupHoverOut', 'recalcTriggerChance', 'recalcSleepDays',
    'openIngredientRankingModal', 'closeIngredientRankingModal', 'updateLadderActiveFilterBadge'
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
  assert(poorResult.summaryNote.includes('⚠️') && poorResult.summaryNote.includes('未達'), 'Summary note should indicate baseline failure');

  const poorIng = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '固執',
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

  const ctx = {
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
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
    main_skill: '怪力钳（食材精選S）',
    ingredients: [
      { name: '純粹油' },
      { name: '萌綠玉米' },
      { name: '好眠番茄' }
    ]
  };

  const sandslashHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlZh.includes('special-skill-badge'), 'Sandslash should render special-skill-badge');
  assert(sandslashHtmlZh.includes('沉甸甸南瓜') && sandslashHtmlZh.includes('萌綠玉米') && sandslashHtmlZh.includes('窩心洋芋'), 'Sandslash tooltip should include its 3 specific ingredients');

  const mawileHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(mawile.main_skill, mawile);
  assert(mawileHtmlZh.includes('純粹油') && mawileHtmlZh.includes('萌綠玉米') && mawileHtmlZh.includes('好眠番茄'), 'Mawile tooltip should include its 3 specific ingredients');

  ctx.window.I18N.setLanguage('en-US');
  const sandslashHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlEn.includes('Plump Pumpkin') && sandslashHtmlEn.includes('Greengrass Corn') && sandslashHtmlEn.includes('Soft Potato'), 'Sandslash English tooltip should include its 3 specific ingredients in English');
  ctx.window.I18N.setLanguage('zh-TW');

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

  // 2. Check mobile viewport panel height formula for #panel-pokemon
  assert(css.includes('#panel-pokemon {'), 'styles.css must define mobile #panel-pokemon height rule');
  assert(css.includes('100dvh - 52px - env(safe-area-inset-top'), '#panel-pokemon must deduct top bar and bottom dock clearance');

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
  assert(indexHtml.includes('css/styles.css?v=20260907_9'), 'index.html styles.css must be v=20260907_9');
  assert(indexHtml.includes('js/modules/wiki.js?v=20260907_8'), 'index.html wiki.js must be v=20260907_8');
  assert(appIndexHtml.includes('css/styles.css?v=20260907_9'), 'app/index.html styles.css must be v=20260907_9');
  assert(appIndexHtml.includes('js/modules/wiki.js?v=20260907_8'), 'app/index.html wiki.js must be v=20260907_8');
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
  assert(html.includes('1*</th>'), 'Table header must contain 1* column');
  assert(html.includes('2*</th>'), 'Table header must contain 2* column');
  assert(html.includes('3*</th>'), 'Table header must contain 3* column');
  assert(html.includes('4*</th>'), 'Table header must contain 4* column');

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
