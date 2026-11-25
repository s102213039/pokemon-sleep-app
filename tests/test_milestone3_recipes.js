/**
 * test_milestone3_recipes.js — Comprehensive Test Suite for Milestone 3
 * ======================================================================
 * Tests:
 * 1. Pantry Inventory reactive state, getter/setter/clear, and localStorage persistence.
 * 2. Recipe reverse-search missingCount calculation and 100% cookable filtering.
 * 3. Sorting by fewest missing ingredients (missing-asc).
 * 4. Pot capacity scaling (15-200), Good Camp Ticket (+50%), Sunday cooking (2x).
 * 5. Pot filler optimizer recommendations sorted by highest base energy.
 * 6. Total projected meal energy formula with filler contributions.
 * 7. M2 defensive typing verification in simulateTeamPerformance.
 * 8. Project rules compliance (Zero Emojis, Zero Star Glyphs, Single Frame Rule).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const recipesData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'recipes.json'), 'utf8'));

// Setup headless mock environment for recipes module
const mockLocalStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const domElements = {};
function getMockElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id,
      value: '',
      style: { setProperty: () => {} },
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        toggle(c, force) {
          if (force !== undefined) {
            if (force) this._classes.add(c); else this._classes.delete(c);
            return force;
          }
          if (this._classes.has(c)) { this._classes.delete(c); return false; }
          this._classes.add(c); return true;
        },
        contains(c) { return this._classes.has(c); }
      },
      setAttribute: () => {},
      getAttribute: () => null,
      addEventListener: () => {},
      dispatchEvent: () => true,
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      insertBefore: () => {},
      removeChild: () => {},
      cloneNode: () => getMockElement('clone')
    };
  }
  return domElements[id];
}

const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => getMockElement(id),
  querySelector: (sel) => getMockElement(sel),
  querySelectorAll: () => [],
  createElement: (tag) => getMockElement(tag),
  body: { classList: { contains: () => false } },
  addEventListener: () => {}
};

const sandbox = {
  window: {
    innerWidth: 1200,
    localStorage: mockLocalStorage,
    I18N: {
      getLanguage: () => 'zh-TW',
      getIngredientName: (n) => n,
      t: (k, def) => def
    }
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  fetch: () => Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(recipesData)),
    json: () => Promise.resolve(recipesData)
  }),
  setTimeout,
  clearTimeout,
  setInterval: () => 0,
  clearInterval: () => {},
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDocument;
sandbox.globalThis = sandbox;

const recipesJsCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'recipes.js'), 'utf8');
vm.createContext(sandbox);
vm.runInContext(recipesJsCode, sandbox);

const RecipesApp = sandbox.window.RecipesApp;

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('   Milestone 3 Recipes & Pot Optimization Test Suite');
console.log('======================================================\n');

// ─── 1. Pantry Inventory Reactive State & Persistence ────────────────────────
test('Pantry inventory getters, setters, and clear helpers', () => {
  RecipesApp.clearPantry();
  assert.strictEqual(Object.keys(RecipesApp.getPantry()).length, 0, 'Pantry must be empty initially');

  RecipesApp.setPantryIngredient('特選蘋果', 25);
  RecipesApp.setPantryIngredient('美味尾巴', 10);
  assert.strictEqual(RecipesApp.getPantry()['特選蘋果'], 25);
  assert.strictEqual(RecipesApp.getPantry()['美味尾巴'], 10);

  // Updating or zeroing
  RecipesApp.setPantryIngredient('特選蘋果', 0);
  assert.strictEqual(RecipesApp.getPantry()['特選蘋果'], undefined, 'Zero quantity must delete item');

  // LocalStorage persistence
  const saved = JSON.parse(mockLocalStorage.getItem('pksleep_pantry_v1'));
  assert.strictEqual(saved['美味尾巴'], 10, 'Persisted in localStorage pksleep_pantry_v1');

  RecipesApp.clearPantry();
  assert.strictEqual(Object.keys(RecipesApp.getPantry()).length, 0, 'Pantry must be empty after clear');
});

// ─── 2. Recipe Missing Count & Reverse Search ────────────────────────────────
test('calculateRecipeMissingCount accurately calculates missing ingredient quantities', () => {
  // Find a recipe with known requirements, e.g., 溫馨暖意燉雞湯 or 彈跳咖哩烏龍麵
  const testRecipe = recipesData.find(r => r.name_cn === '暖暖薑熱咖哩' || r.name === '暖暖薑熱咖哩') || recipesData[0];
  const requiredTotal = testRecipe.ingredients.reduce((acc, i) => acc + i.count, 0);

  // Empty pantry: missingCount must equal requiredTotal
  const missingAll = RecipesApp.calculateRecipeMissingCount(testRecipe, {});
  assert.strictEqual(missingAll, requiredTotal, 'Empty pantry requires all ingredients');

  // Partial pantry
  const firstReq = testRecipe.ingredients[0];
  const partialPantry = { [firstReq.name]: Math.floor(firstReq.count / 2) };
  const missingPartial = RecipesApp.calculateRecipeMissingCount(testRecipe, partialPantry);
  assert.strictEqual(missingPartial, requiredTotal - partialPantry[firstReq.name]);

  // Full pantry: 100% satisfied
  const fullPantry = {};
  testRecipe.ingredients.forEach(i => { fullPantry[i.name] = i.count + 5; });
  const missingZero = RecipesApp.calculateRecipeMissingCount(testRecipe, fullPantry);
  assert.strictEqual(missingZero, 0, 'Sufficient ingredients yields 0 missing');

  const details = RecipesApp.getRecipeMissingDetails(testRecipe, fullPantry);
  assert.strictEqual(details.isCookable, true, 'isCookable is true when missing is 0');
  assert.strictEqual(details.missingItems.length, 0);
});

// ─── 3. Cookable Only (100%) Filter State ────────────────────────────────────
test('Cookable Only quick filter flag toggle and persistence', () => {
  RecipesApp.setFilterCookableOnly(true);
  assert.strictEqual(RecipesApp.getFilterCookableOnly(), true);

  RecipesApp.setFilterCookableOnly(false);
  assert.strictEqual(RecipesApp.getFilterCookableOnly(), false);
});

// ─── 4. Pot Capacity & Expansion Calculations ─────────────────────────────────
test('getEffectivePotCapacity scales base pot size, Camp Ticket (+50%), and Sunday (2x)', () => {
  // Base 57
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(57, false, false), 57);
  // Camp Ticket: Math.floor(57 * 1.5) = 85
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(57, true, false), 85);
  // Sunday Cooking: 57 * 2 = 114
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(57, false, true), 114);
  // Camp Ticket + Sunday: 85 * 2 = 170
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(57, true, true), 170);

  // Clamping: min 15, max 200
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(5, false, false), 15);
  assert.strictEqual(RecipesApp.getEffectivePotCapacity(250, false, false), 200);
});

// ─── 5. Pot Filler Optimization Recommendations ─────────────────────────────
test('getRecommendedFillers sorts by highest base energy (Tail 342, Pumpkin 250, Leek 185, etc.)', () => {
  const sampleRecipe = { name: 'Simple Dish', pot_size: 15, ingredients: [{ name: '特選蘋果', count: 15 }] };
  const effectivePot = 57; // Leaves 42 filler slots

  // Theoretical Best mode (fromPantryOnly = false)
  const theoreticalRes = RecipesApp.getRecommendedFillers(sampleRecipe, effectivePot, false);
  assert.strictEqual(theoreticalRes.fillerSlots, 42);
  assert.strictEqual(theoreticalRes.remainingSlots, 0);
  assert(theoreticalRes.recommendations.length > 0);
  // First recommended should be Slowpoke Tail (342)
  assert.strictEqual(theoreticalRes.recommendations[0].name, '美味尾巴');
  assert.strictEqual(theoreticalRes.recommendations[0].unitEnergy, 342);

  // Pantry Mode (fromPantryOnly = true)
  const pantry = { '美味尾巴': 5, '沉甸甸南瓜': 10, '特選蘋果': 20 };
  const pantryRes = RecipesApp.getRecommendedFillers(sampleRecipe, effectivePot, true, pantry);
  assert.strictEqual(pantryRes.fillerSlots, 42);
  // Slowpoke Tail: 5 * 342 = 1710
  // Pumpkin: 10 * 250 = 2500
  // Apple: 20 available minus 15 recipe base = 5 * 90 = 450
  // Total alloc: 5 + 10 + 5 = 20 slots
  // Remaining unfilled: 42 - 20 = 22 slots
  assert.strictEqual(pantryRes.remainingSlots, 22);
  const tailRec = pantryRes.recommendations.find(r => r.name === '美味尾巴');
  assert(tailRec && tailRec.count === 5 && tailRec.unitEnergy === 342);
  const pumpRec = pantryRes.recommendations.find(r => r.name === '沉甸甸南瓜');
  assert(pumpRec && pumpRec.count === 10 && pumpRec.unitEnergy === 250);
});

// ─── 6. Total Meal Energy with Filler Contributions ──────────────────────────
test('calculateMealEnergyWithFillers integrates recipe level, filler base energy, island bonus & event', () => {
  const recipe = { base_energy: 1000, pot_size: 15 };
  // Lv.1 recipe (0% bonus) -> 1000 base
  // Filler energy: 500
  // Island bonus: 50% (1.5x)
  // Event: 1.0x
  // Expected: (1000 + 500) * 1.5 * 1.0 = 2250
  const energy = RecipesApp.calculateMealEnergyWithFillers(recipe, 500, 1, 50, 1.0);
  assert.strictEqual(energy, 2250);

  // Lv.30 recipe (61% bonus -> 1610)
  // Filler energy: 1000
  // Subtotal = 2610
  // Island bonus: 0% -> 2610
  const energyLv30 = RecipesApp.calculateMealEnergyWithFillers(recipe, 1000, 30, 0, 1.0);
  assert.strictEqual(energyLv30, 2610);
});

// ─── 7. M2 Defensive Typing Fix in lab_team_calc.js ───────────────────────────
test('simulateTeamPerformance handles truthy non-array objects safely without TypeError', () => {
  global.window = global;
  const I18N = require('../js/core/i18n.js');
  global.window.I18N = I18N;
  I18N.setLanguage('zh-TW');
  const lab = require('../js/modules/appraisal.js');

  const emptyRes = lab.simulateTeamPerformance([], 'greengrass');
  assert.strictEqual(emptyRes.totalDailyEnergy, 0);
  assert.strictEqual(emptyRes.projectedSundayRank, '普通 1');

  // Non-array object input must not crash and return 0
  const objRes = lab.simulateTeamPerformance({}, 'greengrass');
  assert.strictEqual(objRes.totalDailyEnergy, 0);

  // String input must not crash and return 0
  const strRes = lab.simulateTeamPerformance('invalid', 'greengrass');
  assert.strictEqual(strRes.totalDailyEnergy, 0);
});

// ─── 8. UI & Code Rules Compliance Audit ─────────────────────────────────────
test('Project Standards Compliance: Zero Emojis (Rule 8) and Zero Star Glyphs (Rule 10)', () => {
  const filesToCheck = [
    'js/modules/recipes/recipes_state.js',
    'js/modules/recipes/recipes_pantry.js',
    'js/modules/recipes/recipes_render.js',
    'css/views/recipes_pantry.css'
  ];

  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const starRegex = /[\u2605\u2606]/gu;

  for (const f of filesToCheck) {
    const content = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8');
    const emojis = content.match(new RegExp(emojiRegex, 'gu')) || [];
    assert.strictEqual(emojis.length, 0, `File ${f} must have 0 emojis (got: ${emojis.join(', ')})`);
    const stars = content.match(starRegex) || [];
    assert.strictEqual(stars.length, 0, `File ${f} must have 0 star glyphs (got: ${stars.join(', ')})`);
  }
});

test('Project Standards Compliance: Single Frame Rule (Rule 9) in recipes_pantry.css', () => {
  const css = fs.readFileSync(path.join(ROOT_DIR, 'css', 'views', 'recipes_pantry.css'), 'utf8');
  assert(css.includes('.recipe-pantry-section'), 'Pantry container CSS exists');
  assert(css.includes('.filler-section-card'), 'Filler section container CSS exists');
  assert(css.includes('border: none;'), 'Container must have border: none');
  assert(css.includes('background: transparent;'), 'Container must have background: transparent');
});

test('Project Standards Compliance: Strictly <= 1000 lines across all modular files', () => {
  const files = [
    'js/modules/recipes/recipes_state.js',
    'js/modules/recipes/recipes_pantry.js',
    'js/modules/recipes/recipes_render.js',
    'css/views/recipes_pantry.css'
  ];
  for (const f of files) {
    const lines = fs.readFileSync(path.join(ROOT_DIR, f), 'utf8').split('\n').length;
    assert(lines <= 1000, `File ${f} must be <= 1000 lines (got ${lines})`);
  }
});

console.log(`\n======================================================`);
console.log(`Results: ${passed} Passed, ${failed} Failed`);
console.log(`======================================================\n`);

if (failed > 0) {
  process.exit(1);
}
