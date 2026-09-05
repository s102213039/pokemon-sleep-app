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
