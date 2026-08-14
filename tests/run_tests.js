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
const appPath = path.join(WORKSPACE_ROOT, 'app.js');
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
  getItemHelpInterval,
  DEFAULT_SVG_ICON
} = require(appPath);

const dataPath = path.join(WORKSPACE_ROOT, 'data.json');
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
  const recipesPath = path.join(WORKSPACE_ROOT, 'recipes.json');
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

  assert(htmlContent.includes('id="search-input"') || htmlContent.includes("id='search-input'"), 'Missing search input element');
  assert(htmlContent.includes('id="type-filter-tags"') || htmlContent.includes("id='type-filter-tags'"), 'Missing type filter container');
  assert(htmlContent.includes('id="specialty-filter-tags"') || htmlContent.includes("id='specialty-filter-tags'"), 'Missing specialty filter container');
  assert(htmlContent.includes('id="sort-select"') || htmlContent.includes("id='sort-select'"), 'Missing sort selector element');
  assert(htmlContent.includes('id="toggle-grid"') || htmlContent.includes("id='toggle-grid'"), 'Missing grid view toggle button');
  assert(htmlContent.includes('id="toggle-table"') || htmlContent.includes("id='toggle-table'"), 'Missing table view toggle button');
  assert(htmlContent.includes('id="content-area"') || htmlContent.includes("id='content-area'"), 'Missing view content area container');
});

test('Tier 1 - Feature Coverage', 'CSS Styling: styles.css exists with dark theme, badge styles, responsive rules', () => {
  const cssPath = path.join(WORKSPACE_ROOT, 'styles.css');
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

test('Tier 2 - Boundary & Corner Cases', 'Empty search string returns all items', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  const filtered = PokemonApp.filterData();
  assertEquals(filtered.length, dataset.length, 'Empty search should return all items');
});

test('Tier 2 - Boundary & Corner Cases', 'ID search formats (#0001, 1, 01) correctly match Bulbasaur', () => {
  PokemonApp.init([...dataset]);
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

test('Tier 2 - Boundary & Corner Cases', 'Multi-select specialty combinations (e.g. ["樹果", "食材"])', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties = new Set(['樹果', '食材']);

  const res = PokemonApp.filterData();
  assert(res.length > 0, 'Multi-specialty filter should return items');
  res.forEach(item => {
    assert(item.specialty === '樹果' || item.specialty === '食材', `Item ${item.id} specialty '${item.specialty}' not in ['樹果', '食材']`);
  });
});

test('Tier 2 - Boundary & Corner Cases', 'Fallback icon validation: missing/empty icon property defaults to SVG placeholder', () => {
  const itemNoIcon = { id: 9999, name: { cn: 'Test' }, type: '草', specialty: '樹果', icon: '' };
  const icon = getItemIcon(itemNoIcon);
  assert(icon.startsWith('data:image/svg+xml'), 'Empty icon should fallback to SVG data URI');
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
  const initialItems = PokemonApp.render();
  assert(initialItems.length >= 247, 'Initial load should contain >= 247 items');

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
