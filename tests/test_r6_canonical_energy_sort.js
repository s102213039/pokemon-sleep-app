/**
 * tests/test_r6_canonical_energy_sort.js
 * Centralized Canonical Ingredient & Berry Energy-Ascending Sort Verification Suite (R6)
 * =====================================================================================
 * Covers:
 *   1. GAME_CONFIG.CANONICAL_INGREDIENTS integrity, immutability & multi-language/alias lookup
 *   2. GAME_CONFIG.CANONICAL_BERRIES integrity, tie-break preservation & alias resolution
 *   3. Pokedex (js/modules/app.js) berry & ingredient filter DOM order (with & without GAME_CONFIG)
 *   4. Recipes (js/modules/recipes.js) picker & pantry DOM order + descending filler preservation
 *   5. Box (js/modules/box.js) berry & ingredient filter DOM order (with & without GAME_CONFIG/PokemonApp)
 *   6. Lab (js/modules/appraisal.js) picker chips, Greengrass select, rerollGreengrassBerries, & alias filter fix
 *   7. Wiki (js/modules/wiki.js) Values Board order & i18n entity alias coverage
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAME_CONFIG = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
const DATA_JSON = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'data.json'), 'utf8'));
const RECIPES_JSON_TEXT = fs.readFileSync(path.join(ROOT_DIR, 'data', 'recipes.json'), 'utf8');
const RECIPES_JSON = JSON.parse(RECIPES_JSON_TEXT);

const EXPECTED_ING_IDS = [
  'apple', 'milk', 'soybeans', 'honey', 'sausage',
  'ginger', 'tomato', 'snackablenuts', 'egg', 'oil',
  'potato', 'herb', 'corn', 'cacao', 'coffee',
  'glossyavocado', 'mushroom', 'leek', 'pumpkin', 'tail'
];

const EXPECTED_ING_NAMES = [
  '特選蘋果', '哞哞鮮奶', '萌綠大豆', '甜甜蜜', '豆製肉',
  '暖暖薑', '好眠番茄', '一口堅果', '特選蛋', '純粹油',
  '窩心洋芋', '火辣香草', '萌綠玉米', '放鬆可可', '醒腦咖啡豆',
  '嫩亮酪梨', '品鮮蘑菇', '粗枝大蔥', '沉甸甸南瓜', '美味尾巴'
];

const EXPECTED_BERRY_IDS = [
  'pamtre', 'lum', 'grepa', 'bluk', 'pecha', 'mago',
  'leppa', 'cheri', 'persim', 'figy', 'sitrus', 'durin',
  'oran', 'wiki', 'chesto', 'rawst', 'belue', 'yache'
];

const EXPECTED_BERRY_NAMES_CANONICAL = [
  '椰木果', '木子果', '異奇果', '檬果', '桃桃果', '芒念果',
  '蘋野果', '櫻子果', '柿仔果', '勿花果', '文柚果', '榴石果',
  '橙橙果', '芭拉果', '零餘果', '生薑果', '靛莓果', '巧可果'
];

const EXPECTED_BERRY_NAMES_POKEDEX = [
  '椰木果', '芭亞果', '異奇果', '檬果', '桃桃果', '芒念果',
  '蘋野果', '櫻子果', '柿仔果', '勿花果', '文柚果', '墨莓果',
  '橙橙果', '芭拉果', '零餘果', '生薑果', '靛莓果', '巧可果'
];

let total = 0;
let passed = 0;

function check(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function checkAsync(name, fn) {
  total++;
  try {
    await fn();
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

function makeMockElement(id = '') {
  const classes = new Set();
  const attrs = Object.create(null);
  return {
    id,
    value: '',
    min: '',
    max: '',
    step: '',
    checked: false,
    placeholder: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: { setProperty() {}, removeProperty() {}, display: '', opacity: '', pointerEvents: '', visibility: '' },
    listeners: {},
    classList: {
      add(...cls) { cls.forEach(c => classes.add(c)); },
      remove(...cls) { cls.forEach(c => classes.delete(c)); },
      toggle(c, force) {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c); else classes.add(c);
        } else if (force) classes.add(c);
        else classes.delete(c);
        return classes.has(c);
      },
      contains(c) { return classes.has(c); }
    },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return attrs[k] !== undefined ? attrs[k] : null; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    removeEventListener() {},
    querySelector(sel) {
      if (sel && sel.startsWith('#') && this.innerHTML) {
        const targetId = sel.slice(1);
        const m = this.innerHTML.match(new RegExp(`id="${targetId}"[^>]*>([\\s\\S]*?)</div>`));
        if (m) {
          const sub = makeMockElement(targetId);
          sub.innerHTML = m[1];
          return sub;
        }
      }
      return null;
    },
    querySelectorAll() { return []; },
    closest() { return null; },
    appendChild() {},
    dispatchEvent() { return true; },
    getBoundingClientRect() { return { right: 300, left: 0, top: 0, bottom: 500 }; }
  };
}

function extractAttrs(html, attrName) {
  const re = new RegExp(`\\b${attrName}="([^"]+)"`, 'g');
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    out.push(m[1]);
  }
  return out;
}

console.log('======================================================');
console.log('R6 Centralized Ingredient & Berry Energy-Asc Sort Suite');
console.log('======================================================');

// 1. GAME_CONFIG Canonical Ingredients
check('Test 1: GAME_CONFIG.CANONICAL_INGREDIENTS frozen, 20 items (90..342), & alias resolution', () => {
  const ings = GAME_CONFIG.CANONICAL_INGREDIENTS;
  assert(Object.isFrozen(ings), 'CANONICAL_INGREDIENTS must be frozen');
  assert.strictEqual(ings.length, 20, 'Expected 20 canonical ingredients');
  assert.deepStrictEqual(ings.map(i => i.id), EXPECTED_ING_IDS);
  assert.deepStrictEqual(ings.map(i => i.name), EXPECTED_ING_NAMES);
  for (let i = 0; i < ings.length; i++) {
    assert(Object.isFrozen(ings[i]), `Ingredient entry ${ings[i].id} must be frozen`);
    assert(Object.isFrozen(ings[i].aliases), `Ingredient aliases ${ings[i].id} must be frozen`);
    if (i > 0) assert(ings[i].energy >= ings[i - 1].energy, 'Energies must be non-decreasing');
  }
  assert.strictEqual(ings[0].energy, 90);
  assert.strictEqual(ings[19].energy, 342);

  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('特選蘋果'), 90);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('特选苹果'), 90);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('Fancy Apple'), 90);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('apple'), 90);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('nuts'), 112);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('snackablenuts'), 112);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('純粹鮮奶'), 98);
  assert.strictEqual(GAME_CONFIG.getIngredientBaseEnergy('unknown_xyz'), null);

  assert.strictEqual(GAME_CONFIG.resolveIngredientCanonicalId('nuts'), 'snackablenuts');
  assert.strictEqual(GAME_CONFIG.resolveIngredientCanonicalId('一口坚果'), 'snackablenuts');
  assert.strictEqual(GAME_CONFIG.resolveIngredientCanonicalId('純粹鮮奶'), 'milk');

  const input = ['美味尾巴', 'unknown_ing', '特選蘋果', 'nuts', '純粹鮮奶'];
  const inputCopy = input.slice();
  const sorted = GAME_CONFIG.sortIngredientsByEnergyAsc(input);
  assert.deepStrictEqual(input, inputCopy, 'sortIngredientsByEnergyAsc must not mutate input array');
  assert.deepStrictEqual(sorted, ['特選蘋果', '純粹鮮奶', 'nuts', '美味尾巴', 'unknown_ing']);
});

// 2. GAME_CONFIG Canonical Berries
check('Test 2: GAME_CONFIG.CANONICAL_BERRIES frozen, 18 items (24..35), tie-break & alias resolution', () => {
  const berries = GAME_CONFIG.CANONICAL_BERRIES;
  assert(Object.isFrozen(berries), 'CANONICAL_BERRIES must be frozen');
  assert.strictEqual(berries.length, 18, 'Expected 18 canonical berries');
  assert.deepStrictEqual(berries.map(b => b.id), EXPECTED_BERRY_IDS);
  assert.deepStrictEqual(berries.map(b => b.name), EXPECTED_BERRY_NAMES_CANONICAL);
  for (let i = 0; i < berries.length; i++) {
    assert(Object.isFrozen(berries[i]), `Berry entry ${berries[i].id} must be frozen`);
    assert(Object.isFrozen(berries[i].aliases), `Berry aliases ${berries[i].id} must be frozen`);
    if (i > 0) assert(berries[i].energy >= berries[i - 1].energy, 'Berry energies must be non-decreasing');
  }
  assert.strictEqual(berries[0].energy, 24);
  assert.strictEqual(berries[17].energy, 35);

  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('墨莓果'), 'durin');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('榴石果'), 'durin');
  assert.strictEqual(GAME_CONFIG.getBerryBaseEnergy('墨莓果'), 30);
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('芭亞果'), 'lum');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('木子果'), 'lum');
  assert.strictEqual(GAME_CONFIG.getBerryBaseEnergy('芭亞果'), 24);
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('藍異果'), 'pamtre');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('芒芒果'), 'mago');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('超能力'), 'mago');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('超能'), 'mago');
  assert.strictEqual(GAME_CONFIG.resolveBerryCanonicalId('Pamtre'), 'pamtre');

  // Tie-break order preservation even from reversed inputs
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['木子果', '椰木果']), ['椰木果', '木子果']);
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['桃桃果', '芒念果', '檬果']), ['檬果', '桃桃果', '芒念果']);
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['櫻子果', '蘋野果']), ['蘋野果', '櫻子果']);
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['墨莓果', '文柚果']), ['文柚果', '墨莓果']);
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['芭拉果', '橙橙果']), ['橙橙果', '芭拉果']);
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(['生薑果', '零餘果']), ['零餘果', '生薑果']);

  const pokedexStyleReversed = EXPECTED_BERRY_NAMES_POKEDEX.slice().reverse();
  assert.deepStrictEqual(GAME_CONFIG.sortBerriesByEnergyAsc(pokedexStyleReversed), EXPECTED_BERRY_NAMES_POKEDEX);
});

// 3. Pokedex (app.js) with and without GAME_CONFIG
(async function main() {
  for (const withGameConfig of [true, false]) {
    await checkAsync(`Test 3 (${withGameConfig ? 'with' : 'without'} GAME_CONFIG): Pokedex #berry-filter-tags & #ingredient-pkm-filter-tags order`, async () => {
      const appCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'app.js'), 'utf8');
      const berryTagsEl = makeMockElement('berry-filter-tags');
      const ingTagsEl = makeMockElement('ingredient-pkm-filter-tags');
      const skillTagsEl = makeMockElement('skill-filter-tags');
      const typeTagsEl = makeMockElement('type-filter-tags');
      const specTagsEl = makeMockElement('specialty-filter-tags');
      const contentEl = makeMockElement('content-area');
      const els = {
        'tab-pokemon': makeMockElement('tab-pokemon'),
        'tab-recipes': makeMockElement('tab-recipes'),
        'panel-pokemon': makeMockElement('panel-pokemon'),
        'panel-recipes': makeMockElement('panel-recipes'),
        'berry-filter-tags': berryTagsEl,
        'ingredient-pkm-filter-tags': ingTagsEl,
        'skill-filter-tags': skillTagsEl,
        'type-filter-tags': typeTagsEl,
        'specialty-filter-tags': specTagsEl,
        'content-area': contentEl,
        'pokemon-count-badge': makeMockElement('pokemon-count-badge')
      };

      const domLoadedListeners = [];
      const sandbox = {
        innerWidth: 1200,
        scrollY: 0,
        location: { hash: '#pokemon', pathname: '/' },
        localStorage: { getItem: () => null, setItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        addEventListener: () => {},
        globalThis: null,
        document: {
          readyState: 'complete',
          body: { style: {}, classList: { add() {}, remove() {}, contains: () => false }, appendChild() {} },
          documentElement: { setAttribute() {}, removeAttribute() {} },
          addEventListener: (ev, fn) => { if (ev === 'DOMContentLoaded') domLoadedListeners.push(fn); },
          getElementById: (id) => els[id] || null,
          querySelectorAll: () => [],
          querySelector: () => null,
          createElement: () => makeMockElement()
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        fetch: () => Promise.resolve({
          ok: true,
          json: () => Promise.resolve(DATA_JSON),
          text: () => Promise.resolve(JSON.stringify(DATA_JSON))
        }),
        CustomEvent: function (type, init) { this.type = type; this.detail = init ? init.detail : null; },
        dispatchEvent: () => true,
        setTimeout,
        clearTimeout,
        setInterval: () => 0,
        clearInterval: () => {},
        console
      };
      if (withGameConfig) {
        sandbox.GAME_CONFIG = GAME_CONFIG;
      }
      sandbox.window = sandbox;
      sandbox.globalThis = sandbox;
      vm.createContext(sandbox);
      vm.runInContext(appCode, sandbox);
      domLoadedListeners.forEach(fn => fn());

      await new Promise(r => setTimeout(r, 80));

      const renderedBerries = extractAttrs(berryTagsEl.innerHTML, 'data-berry');
      const renderedIngs = extractAttrs(ingTagsEl.innerHTML, 'data-ing');
      assert.deepStrictEqual(renderedBerries, EXPECTED_BERRY_NAMES_POKEDEX, 'Pokedex #berry-filter-tags must be in canonical energy-asc order');
      assert.deepStrictEqual(renderedIngs, EXPECTED_ING_NAMES, 'Pokedex #ingredient-pkm-filter-tags must be in canonical energy-asc order');
    });
  }

  // 4. Recipes (recipes.js) with and without GAME_CONFIG
  for (const withGameConfig of [true, false]) {
    await checkAsync(`Test 4 (${withGameConfig ? 'with' : 'without'} GAME_CONFIG): Recipes pickers & pantry order + descending filler`, async () => {
      const recipesCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'recipes.js'), 'utf8');
      const ingPickerEl = makeMockElement('ingredient-picker-tags');
      const exIngPickerEl = makeMockElement('excluded-ingredient-picker-tags');
      const pantryGridEl = makeMockElement('pantry-items-grid');
      const els = {
        'ingredient-picker-tags': ingPickerEl,
        'excluded-ingredient-picker-tags': exIngPickerEl,
        'pantry-items-grid': pantryGridEl,
        'category-filter-tags': makeMockElement('category-filter-tags'),
        'recipe-content-area': makeMockElement('recipe-content-area'),
        'recipe-count-badge': makeMockElement('recipe-count-badge')
      };

      const sidebarScrollable = makeMockElement('sidebar-scrollable');
      sidebarScrollable.prepend = () => {};
      sidebarScrollable.insertBefore = () => {};
      const sandbox = {
        window: { innerWidth: 1200, localStorage: { getItem: () => null, setItem: () => {} } },
        globalThis: null,
        document: {
          readyState: 'complete',
          addEventListener: () => {},
          getElementById: (id) => els[id] || null,
          querySelector: (sel) => (sel === '#recipe-filter-sidebar .sidebar-scrollable-content' ? sidebarScrollable : null),
          querySelectorAll: () => [],
          createElement: () => makeMockElement()
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        fetch: () => Promise.resolve({
          ok: true,
          text: () => Promise.resolve(RECIPES_JSON_TEXT),
          json: () => Promise.resolve(RECIPES_JSON)
        }),
        CustomEvent: function (type, init) { this.type = type; this.detail = init ? init.detail : null; },
        dispatchEvent: () => true,
        setTimeout,
        clearTimeout,
        setInterval: () => 0,
        clearInterval: () => {},
        console
      };
      if (withGameConfig) {
        sandbox.window.GAME_CONFIG = GAME_CONFIG;
        sandbox.GAME_CONFIG = GAME_CONFIG;
      }
      sandbox.window.window = sandbox.window;
      sandbox.window.document = sandbox.document;
      sandbox.window.localStorage = sandbox.localStorage;
      sandbox.window.CustomEvent = sandbox.CustomEvent;
      sandbox.window.dispatchEvent = sandbox.dispatchEvent;
      sandbox.globalThis = sandbox;
      vm.createContext(sandbox);
      vm.runInContext(recipesCode, sandbox);

      await new Promise(r => setTimeout(r, 60));

      const pickerIngs = extractAttrs(ingPickerEl.innerHTML, 'data-name');
      const exPickerIngs = extractAttrs(exIngPickerEl.innerHTML, 'data-name');
      const pantryIngs = extractAttrs(pantryGridEl.innerHTML, 'data-ing');
      // Each pantry row has 4 elements with data-ing; deduplicate preserving order
      const uniquePantryIngs = Array.from(new Set(pantryIngs));

      assert.deepStrictEqual(pickerIngs, EXPECTED_ING_NAMES, 'Recipes #ingredient-picker-tags must be energy-asc');
      assert.deepStrictEqual(exPickerIngs, EXPECTED_ING_NAMES, 'Recipes #excluded-ingredient-picker-tags must be energy-asc');
      assert.deepStrictEqual(uniquePantryIngs, EXPECTED_ING_NAMES, 'Recipes #pantry-items-grid must be energy-asc');

      const fillers = sandbox.window.RecipesApp.getRecommendedFillers(RECIPES_JSON[0], RECIPES_JSON[0].pot_size + 5, false);
      assert.strictEqual(fillers.recommendations[0].name, '美味尾巴', 'Filler recommendations must still prioritize highest energy (Slowpoke Tail) first');
    });
  }

  // 5. Box (box.js) with and without GAME_CONFIG / PokemonApp
  for (const scenario of [
    { label: 'with GAME_CONFIG & PokemonApp', withGC: true, withApp: true },
    { label: 'standalone without GAME_CONFIG or PokemonApp', withGC: false, withApp: false }
  ]) {
    check(`Test 5 (${scenario.label}): Box #box-berry-filter-tags & #box-ingredient-pkm-filter-tags order`, () => {
      const boxCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'box.js'), 'utf8');
      const boxBerryEl = makeMockElement('box-berry-filter-tags');
      const boxIngEl = makeMockElement('box-ingredient-pkm-filter-tags');
      const els = {
        'box-berry-filter-tags': boxBerryEl,
        'box-ingredient-pkm-filter-tags': boxIngEl,
        'box-specialty-filter-tags': makeMockElement('box-specialty-filter-tags'),
        'box-skill-filter-tags': makeMockElement('box-skill-filter-tags'),
        'box-quick-filter-tags': makeMockElement('box-quick-filter-tags'),
        'box-content-area': makeMockElement('box-content-area')
      };

      const sandbox = {
        window: {
          innerWidth: 1200,
          allPokemons: DATA_JSON,
          localStorage: { getItem: () => null, setItem: () => {} },
          addEventListener: () => {}
        },
        globalThis: null,
        document: {
          readyState: 'complete',
          body: { style: {}, classList: { add() {}, remove() {}, contains: () => false } },
          addEventListener: () => {},
          getElementById: (id) => els[id] || null,
          querySelectorAll: () => [],
          querySelector: () => null,
          createElement: () => makeMockElement()
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        console
      };
      if (scenario.withGC) {
        sandbox.window.GAME_CONFIG = GAME_CONFIG;
        sandbox.GAME_CONFIG = GAME_CONFIG;
      }
      if (scenario.withApp) {
        // Deliberately pass discovery-ordered ingredients to verify Box still sorts them
        const discoveryIngs = [
          { name: '美味尾巴', icon: '' },
          { name: '特選蘋果', icon: '' },
          { name: '窩心洋芋', icon: '' }
        ];
        sandbox.window.PokemonApp = {
          getAllData: () => DATA_JSON,
          uniqueIngredients: discoveryIngs
        };
      }
      sandbox.window.window = sandbox.window;
      sandbox.window.document = sandbox.document;
      sandbox.globalThis = sandbox;
      vm.createContext(sandbox);
      vm.runInContext(boxCode, sandbox);

      sandbox.window.initUserBox(DATA_JSON);

      const renderedBoxBerries = extractAttrs(boxBerryEl.innerHTML, 'data-berry');
      assert.deepStrictEqual(renderedBoxBerries, EXPECTED_BERRY_NAMES_POKEDEX, 'Box #box-berry-filter-tags must be in canonical energy-asc order');

      const renderedBoxIngs = extractAttrs(boxIngEl.innerHTML, 'data-ing');
      if (scenario.withApp) {
        assert.deepStrictEqual(renderedBoxIngs, ['特選蘋果', '窩心洋芋', '美味尾巴'], 'Box must re-sort PokemonApp.uniqueIngredients by energy asc');
      } else {
        assert.deepStrictEqual(renderedBoxIngs, EXPECTED_ING_NAMES, 'Box #box-ingredient-pkm-filter-tags must be in canonical energy-asc order');
      }
    });
  }

  // 6. Lab (appraisal.js) pickers, Greengrass select, rerollGreengrassBerries, & alias filter fix
  check('Test 6: Lab pickers, Greengrass select, rerollGreengrassBerries & berry alias filter fix', () => {
    const appraisalCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'appraisal.js'), 'utf8');
    const pokedexBase = require(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_base.js'));
    const pickerModalEl = makeMockElement('modal-lab-picker');
    const labContainerEl = makeMockElement('appraisal-lab-container');
    const els = {
      'modal-lab-picker': pickerModalEl,
      'appraisal-lab-container': labContainerEl
    };
    const grassMon = DATA_JSON.find(p => p.type === '草') || { id: '1', name_cn: '妙蛙種子', type: '草', specialty: '食材', interval: '01:13:20', ingredients: [{ name: '甜甜蜜' }] };
    const fireMon = DATA_JSON.find(p => p.type === '火') || { id: '4', name_cn: '小火龍', type: '火', specialty: '食材', interval: '00:58:20', ingredients: [{ name: '豆製肉' }] };
    const mockBox = [
      { uid: 'u_grass', pokemonId: grassMon.id, name: grassMon.name_cn, level: 30, ing1: '甜甜蜜', ing2: '甜甜蜜', ing3: '甜甜蜜', subskills: [] },
      { uid: 'u_fire', pokemonId: fireMon.id, name: fireMon.name_cn, level: 30, ing1: '豆製肉', ing2: '豆製肉', ing3: '豆製肉', subskills: [] }
    ];

    const lsStore = Object.create(null);
    const mockLocalStorage = {
      getItem: (k) => (lsStore[k] !== undefined ? lsStore[k] : null),
      setItem: (k, v) => { lsStore[k] = String(v); }
    };
    const sandbox = {
      window: {
        GAME_CONFIG,
        innerWidth: 1200,
        allPokemons: DATA_JSON,
        getPokemonBerry: pokedexBase.getPokemonBerry,
        UserBox: { getUserBox: () => mockBox, getFilteredBox: () => mockBox },
        __RECIPES_CACHE__: RECIPES_JSON,
        localStorage: mockLocalStorage
      },
      globalThis: null,
      document: {
        readyState: 'complete',
        body: { style: {}, classList: { add() {}, remove() {}, contains: () => false }, appendChild() {} },
        addEventListener: () => {},
        getElementById: (id) => els[id] || null,
        querySelectorAll: () => [],
        querySelector: () => null,
        createElement: () => makeMockElement()
      },
      localStorage: mockLocalStorage,
      console
    };
    sandbox.window.window = sandbox.window;
    sandbox.window.document = sandbox.document;
    sandbox.GAME_CONFIG = GAME_CONFIG;
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(appraisalCode, sandbox);

    const Lab = sandbox.window.AppraisalLab;

    // Recipe picker chips
    Lab.openPicker({ type: 'recipe' });
    const recipeIngChips = extractAttrs(pickerModalEl.innerHTML, 'data-recipe-ing');
    assert.deepStrictEqual(recipeIngChips, ['all', ...EXPECTED_ING_NAMES], 'Lab recipe picker ing chips must be canonical energy-asc');

    // Team picker chips
    Lab.openPicker({ type: 'team', slotIndex: 0 });
    const teamBerryChips = extractAttrs(pickerModalEl.innerHTML, 'data-berry');
    const teamIngChips = extractAttrs(pickerModalEl.innerHTML, 'data-ing');
    assert.deepStrictEqual(teamBerryChips, ['all', ...EXPECTED_BERRY_NAMES_CANONICAL], 'Lab team picker berry chips must be canonical energy-asc');
    assert.deepStrictEqual(teamIngChips, ['all', ...EXPECTED_ING_NAMES], 'Lab team picker ing chips must be canonical energy-asc');

    // Alias-safe berry filtering: clicking '榴石果' must match Grass Pokemon whose getPokemonBerry returns '墨莓果'
    const berryChipHandlers = [];
    const mockBerryScroll = {
      querySelectorAll: () => [{
        getAttribute: (k) => (k === 'data-berry' ? '榴石果' : null),
        classList: { toggle() {} },
        addEventListener: (ev, fn) => { if (ev === 'click') berryChipHandlers.push(fn); }
      }]
    };
    const mockItemsList = makeMockElement('lab-picker-items-list');
    pickerModalEl.querySelector = (sel) => {
      if (sel === '#lab-picker-berry-scroll') return mockBerryScroll;
      if (sel === '#lab-picker-items-list') return mockItemsList;
      return null;
    };
    Lab.openPicker({ type: 'team', slotIndex: 0 });
    assert(berryChipHandlers.length === 1, 'Expected click handler bound to Durin berry chip');
    berryChipHandlers[0]();
    const filteredUids = extractAttrs(mockItemsList.innerHTML, 'data-uid');
    assert(filteredUids.includes('u_grass'), 'Filtering by 榴石果 must match Grass Pokemon returning 墨莓果');
    assert(!filteredUids.includes('u_fire'), 'Filtering by 榴石果 must exclude Fire Pokemon');

    // Greengrass select options & rerollGreengrassBerries canonical set
    Lab.renderLab(labContainerEl);
    const selectMatch = labContainerEl.innerHTML.match(/<select class="lab-select lab-berry-select"[\s\S]*?<\/select>/);
    assert(selectMatch, 'Greengrass berry select must render');
    const optionValues = extractAttrs(selectMatch[0], 'value');
    assert.deepStrictEqual(optionValues, EXPECTED_BERRY_NAMES_CANONICAL, 'Greengrass select options must be canonical 18 berries in energy-asc order');

    const canonicalSet = new Set(EXPECTED_BERRY_NAMES_CANONICAL);
    const forbiddenNames = ['藍橘果', '利歐果', '金枕果', '勿忘果', '番荔果', '芭亞果', '墨莓果'];
    for (let i = 0; i < 20; i++) {
      Lab.rerollGreengrassBerries(false);
      const rolled = JSON.parse(lsStore['pksleep_lab_greengrass_berries'] || '[]');
      assert(Array.isArray(rolled) && rolled.length === 3 && new Set(rolled).size === 3);
      rolled.forEach(b => {
        assert(canonicalSet.has(b), `Rolled berry "${b}" must be in canonical 18-berry set`);
        assert(!forbiddenNames.includes(b), `Rolled berry "${b}" must not be legacy broken/alias name`);
      });
    }
  });

  // 7. Wiki (wiki.js) Values Board order + i18n BERRY_NAMES alias coverage
  check('Test 7: Wiki Values Board order & i18n BERRY_NAMES aliases (墨莓果 / 芭亞果)', () => {
    const wikiCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki.js'), 'utf8');
    const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
    const wikiPanel = makeMockElement('panel-wiki');
    const els = { 'panel-wiki': wikiPanel };

    const sandbox = {
      window: { GAME_CONFIG, innerWidth: 1200, localStorage: { getItem: () => null, setItem: () => {} } },
      globalThis: null,
      document: {
        readyState: 'complete',
        documentElement: { setAttribute: () => {} },
        addEventListener: () => {},
        getElementById: (id) => els[id] || null,
        querySelectorAll: () => [],
        createElement: () => makeMockElement()
      },
      localStorage: { getItem: () => null, setItem: () => {} },
      PokemonApp: { getAllData: () => DATA_JSON },
      console
    };
    sandbox.window.window = sandbox.window;
    sandbox.window.document = sandbox.document;
    sandbox.GAME_CONFIG = GAME_CONFIG;
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(i18nCode, sandbox);
    vm.runInContext(wikiCode, sandbox);

    // Check i18n EN berry names for 墨莓果 & 芭亞果
    sandbox.window.I18N.setLanguage('en-US');
    assert.strictEqual(sandbox.window.I18N.getBerryName('墨莓果'), 'Durin Berry');
    assert.strictEqual(sandbox.window.I18N.getBerryName('芭亞果'), 'Lum Berry');

    // Check Wiki Values Board berry & ingredient grids
    sandbox.window.I18N.setLanguage('zh-TW');
    sandbox.window.WikiDB.renderWikiLayout(wikiPanel);
    const berryGridMatch = wikiPanel.innerHTML.match(/<div id="values-berry-grid"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/);
    assert(berryGridMatch, '#values-berry-grid must render');
    const wikiBerryAlts = extractAttrs(berryGridMatch[1], 'alt');
    assert.deepStrictEqual(wikiBerryAlts, EXPECTED_BERRY_NAMES_CANONICAL, 'Wiki #values-berry-grid must be canonical energy-asc');

    const ingGridMatch = wikiPanel.innerHTML.match(/<div class="values-compact-grid values-ing-grid">([\s\S]*?)<\/div>\s*<\/div>/);
    assert(ingGridMatch, '.values-ing-grid must render');
    const wikiIngAlts = extractAttrs(ingGridMatch[1], 'alt');
    assert.deepStrictEqual(wikiIngAlts, EXPECTED_ING_NAMES, 'Wiki .values-ing-grid must be canonical energy-asc');
  });

  console.log(`\n[Result] Passed ${passed}/${total} R6 canonical energy sort checks.`);
})();
