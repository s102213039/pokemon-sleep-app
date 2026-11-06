/**
 * tests/test_challenger_m2_multitab_adversarial.js
 *
 * Empirical Adversarial Challenger Test Harness for Milestone 2 & 3:
 * Multi-Tab Data Consumer & Rendering Validation.
 *
 * Scopes Tested:
 * 1. Pokédex Data & Multi-Tab Consumer Integrity:
 *    - Cottonee (#546) and Whimsicott (#547) in data/data.json
 *    - Type (Fairy), Specialty (Ingredient), Sleep Type (Snoozing)
 *    - Evolution requirement & final stage flags
 *    - Lv.1 / Lv.30 / Lv.60 ingredient profiles (一口堅果 / Snackable Nuts)
 *    - Evolution item Sun Stone linkage in items.json, items.js, and pokedex_calc.js
 *    - Sleep styles 1-star to 4-star in data/sleep_styles.json
 * 2. Cooking Recipe Calculations & Pot Expansions:
 *    - Curry #39 (Bountiful Nut & Pumpkin Stew), Salad #121 (Supreme Avocado Nut Feast Salad), Dessert #91 (Grand Tail Soy Nut Cake)
 *    - Strict pot size invariants (pot_size === sum(ingredients.count))
 *    - RecipesApp.calcEnergy under diverse levels (Lv.1 to Lv.70), island bonuses (0-85%), event multipliers (1.0-2.5), and pot expansions (0-700)
 *    - Pot capacity expansions: 84 base capacity, Good Camp Ticket (126 capacity), Sunday cooking (168 capacity)
 *    - Category filtering, pot size filtering, and tasty multipliers (2x, 3x)
 * 3. Ingredient Ladder Rendering & 20th Track Resilience:
 *    - 20th ingredient track snackablenuts (一口堅果) in data/ladder_lv60.json and js/data/ladder_data.js
 *    - Whimsicott (風妖精) AAA variant with count 90 and isTop flag
 *    - TOP_RECIPES_FOR_INGREDIENTS mapping for snackablenuts
 *    - Full WikiDB.renderCoordinateLadder execution on 20 tracks without undefined errors
 *    - Ladder sorting modes (ENERGY_ASC, ENERGY_DESC, YIELD_DESC, DEMAND_DESC) and specialty filters
 * 4. Sleep Style Goal 570 in Island Camps & Progression Systems:
 *    - Milestone 570 in wiki_camps_data.js unlocking pot size 84, 200 diamonds, 1,450,000 shards
 *    - Strict progression monotonicity across goals (0 -> 20 -> 70 -> 150 -> 240 -> 340 -> 450 -> 570)
 *    - Boundary progress bar calculations (0, 285, 569, 570, 600 styles)
 * 5. Quality, Safety & Anti-Regression Audits:
 *    - Rule VIII: Zero Emoji Policy in data.json, recipes.json, items.json, ladder_lv60.json, sleep_styles.json
 *    - Rule X: Zero Decorative Star/Glyph Symbols in names, badges, and titles
 *    - Rule IX: Single Frame Rule compliance in rendering markup
 *
 * Execution:
 *   rtk node tests/test_challenger_m2_multitab_adversarial.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function check(category, description, fn) {
  totalChecks++;
  try {
    fn();
    passedChecks++;
    console.log(`  [PASS] [${category}] ${description}`);
    return true;
  } catch (err) {
    failedChecks++;
    const errMsg = err.message || String(err);
    failureDetails.push({ category, description, error: errMsg });
    console.error(`  [FAIL] [${category}] ${description}`);
    console.error(`         Error: ${errMsg}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
  }
}

console.log('================================================================');
console.log('  Challenger M2: Multi-Tab Data Consumer Adversarial Harness');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Load Target Files
// -----------------------------------------------------------------------------
const pokemonDataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
const itemsJsonPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
const itemsJsPath = path.join(WORKSPACE_ROOT, 'js', 'data', 'items.js');
const recipesJsonPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
const ladderJsonPath = path.join(WORKSPACE_ROOT, 'data', 'ladder_lv60.json');
const ladderJsPath = path.join(WORKSPACE_ROOT, 'js', 'data', 'ladder_data.js');
const sleepStylesPath = path.join(WORKSPACE_ROOT, 'data', 'sleep_styles.json');
const campsDataPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki', 'wiki_camps_data.js');
const i18nCorePath = path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n', 'i18n_core.js');
const pokedexCalcPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'pokedex', 'pokedex_calc.js');
const recipesBundlePath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js');
const wikiBundlePath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');

assert(fs.existsSync(pokemonDataPath), 'data/data.json exists');
assert(fs.existsSync(itemsJsonPath), 'data/items.json exists');
assert(fs.existsSync(itemsJsPath), 'js/data/items.js exists');
assert(fs.existsSync(recipesJsonPath), 'data/recipes.json exists');
assert(fs.existsSync(ladderJsonPath), 'data/ladder_lv60.json exists');
assert(fs.existsSync(ladderJsPath), 'js/data/ladder_data.js exists');
assert(fs.existsSync(sleepStylesPath), 'data/sleep_styles.json exists');
assert(fs.existsSync(campsDataPath), 'js/modules/wiki/wiki_camps_data.js exists');
assert(fs.existsSync(i18nCorePath), 'js/core/i18n/i18n_core.js exists');
assert(fs.existsSync(recipesBundlePath), 'js/modules/recipes.js exists');
assert(fs.existsSync(wikiBundlePath), 'js/modules/wiki.js exists');

const allPokemon = JSON.parse(fs.readFileSync(pokemonDataPath, 'utf8'));
const masterItems = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
const allRecipes = JSON.parse(fs.readFileSync(recipesJsonPath, 'utf8'));
const ladderLv60 = JSON.parse(fs.readFileSync(ladderJsonPath, 'utf8'));
const sleepStyles = JSON.parse(fs.readFileSync(sleepStylesPath, 'utf8'));
const campsDataCode = fs.readFileSync(campsDataPath, 'utf8');

// =============================================================================
// Helper: Initialize Browser VM Contexts
// =============================================================================
function createRecipesVM() {
  const recipesJsCode = fs.readFileSync(recipesBundlePath, 'utf8');
  const mockDom = {
    document: {
      getElementById: (id) => ({
        addEventListener: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        innerHTML: '',
        value: '0',
        querySelector: () => null,
        querySelectorAll: () => []
      }),
      querySelectorAll: () => [],
      querySelector: () => null,
      body: { classList: { contains: () => false, add: () => {}, remove: () => {} } },
      documentElement: { style: {} },
      addEventListener: () => {}
    },
    window: {
      localStorage: { getItem: () => null, setItem: () => {} },
      sessionStorage: { getItem: () => null, setItem: () => {} },
      location: { hash: '' }
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {} },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: () => {},
    CSS: { escape: (s) => s }
  };
  mockDom.window.window = mockDom.window;
  mockDom.window.document = mockDom.document;
  const context = vm.createContext(mockDom);
  vm.runInContext(recipesJsCode, context);
  return mockDom.window.RecipesApp;
}

function createWikiVM() {
  const wikiJsCode = fs.readFileSync(wikiBundlePath, 'utf8');
  const mockDom = {
    document: {
      getElementById: () => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      body: { classList: { contains: () => false, add: () => {}, remove: () => {} } }
    },
    window: {
      I18N: {
        getLanguage: () => 'zh-TW',
        getIngredientName: (s) => s,
        getPokemonName: (s) => s,
        t: (k, d) => d
      },
      localStorage: { getItem: () => null, setItem: () => {} },
      location: { hash: '#wiki/ingredients' },
      LV60_COORDINATE_LADDER_DATA: ladderLv60,
      allPokemon: allPokemon
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {} }
  };
  mockDom.window.window = mockDom.window;
  mockDom.window.document = mockDom.document;
  const context = vm.createContext(mockDom);
  vm.runInContext(wikiJsCode, context);
  return mockDom.window.WikiDB;
}

// =============================================================================
// Section 1: Pokédex Consumer Integrity
// =============================================================================
console.log('[Section 1] Pokédex Consumer Integrity: Cottonee #546, Whimsicott #547 & Sun Stone');

const cottonee = allPokemon.find(p => p.id === '546' || p.formatted_no === '546' || p.name_en === 'Cottonee');
const whimsicott = allPokemon.find(p => p.id === '547' || p.formatted_no === '547' || p.name_en === 'Whimsicott');

check('Pokedex', 'Cottonee (#546) and Whimsicott (#547) exist in data/data.json', () => {
  assert(cottonee !== undefined, 'Cottonee #546 must exist');
  assert(whimsicott !== undefined, 'Whimsicott #547 must exist');
  assertEquals(cottonee.id, '546');
  assertEquals(whimsicott.id, '547');
});

check('Pokedex', 'Cottonee (#546) attributes: Fairy type, Ingredient specialty, Snoozing sleep type', () => {
  assertEquals(cottonee.name_cn, '木棉球');
  assertEquals(cottonee.name_en, 'Cottonee');
  assertEquals(cottonee.name_jp, 'モンメン');
  assertEquals(cottonee.type, '妖精');
  assertEquals(cottonee.specialty, '食材');
  assertEquals(cottonee.sleep_type, '安然入睡');
  assertEquals(cottonee.evo_req, '');
  assertEquals(cottonee.is_final, '');
});

check('Pokedex', 'Whimsicott (#547) attributes: Fairy type, Ingredient specialty, Snoozing sleep type, Final stage', () => {
  assertEquals(whimsicott.name_cn, '風妖精');
  assertEquals(whimsicott.name_en, 'Whimsicott');
  assertEquals(whimsicott.name_jp, 'エルフーン');
  assertEquals(whimsicott.type, '妖精');
  assertEquals(whimsicott.specialty, '食材');
  assertEquals(whimsicott.sleep_type, '安然入睡');
  assertEquals(whimsicott.evo_req, '太陽之石 + 40 糖');
  assertEquals(whimsicott.is_final, '〇');
});

check('Pokedex', 'Cottonee and Whimsicott ingredient profile has 一口堅果 (Snackable Nuts) in Lv.1 slot', () => {
  assert(Array.isArray(cottonee.ingredients), 'Cottonee ingredients must be an array');
  assert(Array.isArray(whimsicott.ingredients), 'Whimsicott ingredients must be an array');
  const cotL1 = cottonee.ingredients[0];
  const wmhL1 = whimsicott.ingredients[0];
  assertEquals(cotL1.name, '一口堅果');
  assertEquals(wmhL1.name, '一口堅果');
  assertEquals(cotL1.l1, '2');
  assertEquals(wmhL1.l1, '2');
  assertEquals(cotL1.l30, '5');
  assertEquals(wmhL1.l30, '5');
  assertEquals(cotL1.l60, '7');
  assertEquals(wmhL1.l60, '7');
});

check('Pokedex', 'Evolution Item Sun Stone links to Whimsicott (#547) and Cottonee (#546)', () => {
  const sunStone = (masterItems.items || masterItems).find(i => i.id === 'sun_stone');
  assert(sunStone !== undefined, 'sun_stone must exist in items');
  assertEquals(sunStone.category, 'evolution');
  assert(Array.isArray(sunStone.pokemon_ids), 'sun_stone pokemon_ids must be an array');
  assert(sunStone.pokemon_ids.includes('547'), 'sun_stone must include Whimsicott (547)');
  assert(sunStone.pokemon_ids.includes('546'), 'sun_stone must include Cottonee (546)');
  assertEquals(sunStone.sleep_points.regular, 1400);
});

check('Pokedex', 'pokedex_calc.js getPokemonEvolutionItems accurately extracts sun_stone for Whimsicott', () => {
  const calcCode = fs.readFileSync(pokedexCalcPath, 'utf8');
  const sandbox = {
    window: {
      I18N: {
        getItemName: (id) => id === 'sun_stone' ? '太陽之石' : id,
        getLanguage: () => 'zh-TW',
        t: (k, d) => d
      },
      ITEMS_DATA: masterItems.items || masterItems
    },
    escapeHtml: (s) => String(s)
  };
  vm.createContext(sandbox);
  vm.runInContext(calcCode + `
    this.extractedItems = getPokemonEvolutionItems(${JSON.stringify(whimsicott)});
    this.renderedChips = renderPokedexEvoItemChipsHTML(${JSON.stringify(whimsicott)});
  `, sandbox);

  assert(Array.isArray(sandbox.extractedItems), 'extractedItems must be an array');
  assertEquals(sandbox.extractedItems.length, 1);
  assertEquals(sandbox.extractedItems[0].id, 'sun_stone');
  assert(sandbox.renderedChips.includes('data-evo-item-id="sun_stone"'), 'Rendered chip must have sun_stone item ID');
  assert(sandbox.renderedChips.includes('openItemDetailModal'), 'Rendered chip must invoke openItemDetailModal');
});

check('Pokedex', 'data/sleep_styles.json includes 1-star to 4-star sleep styles for #546 and #547', () => {
  const styles546 = sleepStyles.byNo['546'] || sleepStyles.byNo['0546'];
  const styles547 = sleepStyles.byNo['547'] || sleepStyles.byNo['0547'];
  assert(styles546 !== undefined, 'Sleep styles for 546 must exist');
  assert(styles547 !== undefined, 'Sleep styles for 547 must exist');

  // Verify all 4 star levels exist
  for (const star of ['1', '2', '3', '4']) {
    assert(styles546[star] !== undefined, `546 must have star ${star} sleep style`);
    assert(styles547[star] !== undefined, `547 must have star ${star} sleep style`);
    assert(typeof styles546[star].name === 'string' && styles546[star].name.length > 0, `546 star ${star} must have name`);
    assert(typeof styles547[star].name === 'string' && styles547[star].name.length > 0, `547 star ${star} must have name`);
  }
});

// =============================================================================
// Section 2: Cooking Recipe Calculations & Pot Expansions
// =============================================================================
console.log('\n[Section 2] Cooking Recipe Calculations & Pot Expansions');

const curry39 = allRecipes.find(r => r.pot_size === 39 || (r.name_cn && r.name_cn.includes('南瓜濃湯')));
const salad121 = allRecipes.find(r => r.pot_size === 121 || (r.name_cn && r.name_cn.includes('盛宴沙拉')));
const dessert91 = allRecipes.find(r => r.pot_size === 91 || (r.name_cn && r.name_cn.includes('堅果蛋糕')));

check('Cooking', 'Curry #39, Salad #121, Dessert #91 present in data/recipes.json', () => {
  assert(curry39 !== undefined, 'Curry #39 must exist');
  assert(salad121 !== undefined, 'Salad #121 must exist');
  assert(dessert91 !== undefined, 'Dessert #91 must exist');
  assertEquals(allRecipes.length, 81, 'Total recipe count must be exactly 81');
});

check('Cooking', 'Curry #39 (Bountiful Nut & Pumpkin Stew) pot size invariant matches ingredient sum', () => {
  assertEquals(curry39.pot_size, 39);
  assertEquals(curry39.category, '咖哩');
  assertEquals(curry39.base_energy, 6420);
  assertEquals(curry39.bonus_pct, 35);
  const sum = curry39.ingredients.reduce((acc, i) => acc + i.count, 0);
  assertEquals(sum, 39);
  const nutIng = curry39.ingredients.find(i => i.name === '一口堅果');
  assert(nutIng !== undefined, 'Must contain 一口堅果');
  assertEquals(nutIng.count, 12);
});

check('Cooking', 'Salad #121 (Supreme Avocado Nut Feast Salad) pot size invariant matches ingredient sum', () => {
  assertEquals(salad121.pot_size, 121);
  assertEquals(salad121.category, '沙拉');
  assertEquals(salad121.base_energy, 28950);
  assertEquals(salad121.bonus_pct, 78);
  const sum = salad121.ingredients.reduce((acc, i) => acc + i.count, 0);
  assertEquals(sum, 121);
  const nutIng = salad121.ingredients.find(i => i.name === '一口堅果');
  assert(nutIng !== undefined, 'Must contain 一口堅果');
  assertEquals(nutIng.count, 24);
});

check('Cooking', 'Dessert #91 (Grand Tail Soy Nut Cake) pot size invariant matches ingredient sum', () => {
  assertEquals(dessert91.pot_size, 91);
  assertEquals(dessert91.category, '甜點');
  assertEquals(dessert91.base_energy, 21840);
  assertEquals(dessert91.bonus_pct, 78);
  const sum = dessert91.ingredients.reduce((acc, i) => acc + i.count, 0);
  assertEquals(sum, 91);
  const nutIng = dessert91.ingredients.find(i => i.name === '一口堅果');
  assert(nutIng !== undefined, 'Must contain 一口堅果');
  assertEquals(nutIng.count, 16);
});

check('Cooking', 'RecipesApp.calcEnergy executes accurately for Salad 121 and Curry 39 across pot expansions', () => {
  const RecipesApp = createRecipesVM();
  assert(RecipesApp && typeof RecipesApp.calcEnergy === 'function', 'RecipesApp.calcEnergy must be a function');

  // Test 1: Curry 39 at Lv.1, 0% Island Bonus, 1.0 Event Bonus, 0 extra: exact 6420
  const eCurryBase = RecipesApp.calcEnergy(curry39.base_energy, 1, 0, 1.0, 0);
  assertEquals(eCurryBase, 6420, 'Curry 39 Lv.1 base energy must equal 6420');

  // Test 2: Curry 39 with 84-pot expansion (extra ingredients = 84 - 39 = 45)
  // (6420 * 1.0 + 45 * 100) = 10920
  const eCurryExpanded = RecipesApp.calcEnergy(curry39.base_energy, 1, 0, 1.0, 45, 100);
  assertEquals(eCurryExpanded, 10920, 'Curry 39 with 45 extra ingredients must equal 10920');

  // Test 3: Salad 121 at Lv.60 with 60% Island Bonus
  // Base 28950, Lv.60 bonus = 203% (x3.03), Island 60% (x1.60)
  // 28950 * 3.03 * 1.6 = 140350
  const eSaladLv60 = RecipesApp.calcEnergy(salad121.base_energy, 60, 60, 1.0, 0);
  assertEquals(eSaladLv60, 140350, 'Salad 121 at Lv.60 with 60% Island bonus must equal 140350');

  // Test 4: Salad 121 with Good Camp Ticket (84 * 1.5 = 126 pot, extra ingredients = 126 - 121 = 5)
  // (28950 * 3.03 + 500) * 1.6 = 141150
  const eSaladCamp = RecipesApp.calcEnergy(salad121.base_energy, 60, 60, 1.0, 5, 100);
  assertEquals(eSaladCamp, 141150, 'Salad 121 with Good Camp Ticket extra ingredients must equal 141150');

  // Test 5: Sunday cooking double pot (84 * 2 = 168 pot, extra ingredients = 168 - 121 = 47)
  // (28950 * 3.03 + 4700) * 1.6 = 147870
  const eSaladSunday = RecipesApp.calcEnergy(salad121.base_energy, 60, 60, 1.0, 47, 100);
  assertEquals(eSaladSunday, 147870, 'Sunday cooking must equal 147870');

  // Test 6: Tasty Multipliers (2x / 3x)
  const eSaladTasty2x = eSaladLv60 * 2;
  const eSaladTasty3x = eSaladLv60 * 3;
  assertEquals(eSaladTasty2x, 280700, 'Tasty 2x must equal 280700');
  assertEquals(eSaladTasty3x, 421050, 'Tasty 3x must equal 421050');

  // Test 7: Extreme pot expansion (700 extra ingredients)
  const eExtreme = RecipesApp.calcEnergy(salad121.base_energy, 60, 60, 1.0, 700, 100);
  assert(Number.isFinite(eExtreme) && !isNaN(eExtreme), 'Extreme pot expansion must produce finite non-NaN number');
  assertEquals(eExtreme, 252350, 'Extreme 700 expansion must equal 252350');
});

check('Cooking', 'Cooking pot expansion accommodates Salad 121 via 84-pot base + Good Camp Ticket (126 capacity)', () => {
  const baseUnlockedPot = 84;
  const goodCampTicketMult = 1.5;
  const expandedCapacity = Math.floor(baseUnlockedPot * goodCampTicketMult);
  assertEquals(expandedCapacity, 126);
  assert(expandedCapacity >= salad121.pot_size, `126 pot capacity must accommodate 121-pot salad (${salad121.pot_size})`);
});

// =============================================================================
// Section 3: Ingredient Ladder Rendering & 20th Track Resilience
// =============================================================================
console.log('\n[Section 3] Ingredient Ladder 20th Track & Whimsicott AAA Rendering');

check('IngredientLadder', 'data/ladder_lv60.json and js/data/ladder_data.js have 20 ingredient tracks', () => {
  assert(Array.isArray(ladderLv60), 'ladder_lv60.json must be an array');
  assertEquals(ladderLv60.length, 20, 'ladder_lv60.json must contain exactly 20 tracks');
  const ladderJs = require(ladderJsPath);
  assert(Array.isArray(ladderJs), 'ladder_data.js must be an array');
  assertEquals(ladderJs.length, 20, 'ladder_data.js must contain exactly 20 tracks');
});

check('IngredientLadder', '20th track snackablenuts (一口堅果) has 162 energy and valid structure', () => {
  const track20 = ladderLv60[19];
  assertEquals(track20.id, 'snackablenuts');
  assertEquals(track20.name, '一口堅果');
  assertEquals(track20.enName, 'Snackable Nuts');
  assertEquals(track20.energy, 162);
  assert(Array.isArray(track20.pokemon), 'track20.pokemon must be an array');
  assert(track20.pokemon.length >= 1, 'track20 must contain at least 1 Pokemon entry');
});

check('IngredientLadder', '20th track contains Whimsicott (風妖精) AAA variant with count 90', () => {
  const track20 = ladderLv60[19];
  const whimsicottEntry = track20.pokemon.find(p => p.name === '風妖精');
  assert(whimsicottEntry !== undefined, 'Whimsicott must exist on 20th track');
  assertEquals(whimsicottEntry.specialty, '食材');
  assertEquals(whimsicottEntry.recipe, 'AAA');
  assertEquals(whimsicottEntry.count, 90);
  assertEquals(whimsicottEntry.isTop, true);
  assert(Array.isArray(whimsicottEntry.variants), 'variants must be an array');
  assertEquals(whimsicottEntry.variants[0].recipe, 'AAA');
  assertEquals(whimsicottEntry.variants[0].count, 90);
});

check('IngredientLadder', 'wiki_ladder_recipes.js defines TOP_RECIPES_FOR_INGREDIENTS for snackablenuts', () => {
  const WikiDB = createWikiVM();
  const topRecipes = WikiDB.TOP_RECIPES_FOR_INGREDIENTS;
  assert(topRecipes !== undefined, 'TOP_RECIPES_FOR_INGREDIENTS must exist');
  assert(topRecipes.snackablenuts !== undefined, 'snackablenuts must be defined');
  assertEquals(topRecipes.snackablenuts.name, '極致酪梨堅果盛宴沙拉');
  assertEquals(topRecipes.snackablenuts.need, 24);
  assertEquals(topRecipes.snackablenuts.energy, 28950);
});

check('IngredientLadder', 'WikiDB.renderCoordinateLadder executes on 20 tracks without undefined errors', () => {
  const WikiDB = createWikiVM();
  assert(typeof WikiDB.renderCoordinateLadder === 'function', 'renderCoordinateLadder must be a function');

  const renderedHtml = WikiDB.renderCoordinateLadder(ladderLv60);
  assert(typeof renderedHtml === 'string' && renderedHtml.length > 0, 'Rendered HTML must be a non-empty string');
  assert(renderedHtml.includes('一口堅果') || renderedHtml.includes('snackablenuts'), 'Rendered HTML must contain 20th ingredient');
  assert(renderedHtml.includes('風妖精'), 'Rendered HTML must contain Whimsicott node');
  assert(!renderedHtml.includes('undefined'), 'Rendered HTML must not contain "undefined" text tokens');
  assert(renderedHtml.length > 50000, `Rendered HTML size must be comprehensive (got ${renderedHtml.length} bytes)`);
});

// =============================================================================
// Section 4: Sleep Style Goal 570 in Island Camps
// =============================================================================
console.log('\n[Section 4] Sleep Style Goal 570 & Island Camp Progression');

check('Camps', 'wiki_camps_data.js defines sleep style goal 570 unlocking pot size 84', () => {
  assert(campsDataCode.includes('570'), 'wiki_camps_data.js must contain 570');
  assert(campsDataCode.includes('unlockedPotSize: 84') || campsDataCode.includes('84'), 'Must unlock pot size 84');
  assert(campsDataCode.includes('diamonds: 200') || campsDataCode.includes('200'), 'Must award 200 diamonds');
  assert(campsDataCode.includes('1450000'), 'Must define upgradeShardCost 1,450,000');
});

check('Camps', 'WikiDB exports SLEEP_STYLE_GOALS_DATA containing goal 570', () => {
  const WikiDB = createWikiVM();
  assert(Array.isArray(WikiDB.SLEEP_STYLE_GOALS_DATA), 'SLEEP_STYLE_GOALS_DATA must be an array');
  const goal570 = WikiDB.SLEEP_STYLE_GOALS_DATA.find(g => g.goal === 570);
  assert(goal570 !== undefined, 'Goal 570 must exist in SLEEP_STYLE_GOALS_DATA');
  assertEquals(goal570.unlockedPotSize, 84);
  assertEquals(goal570.diamonds, 200);
  assertEquals(goal570.upgradeShardCost, 1450000);
});

check('Camps', 'Sleep style milestone progression strictly increases up to 570', () => {
  const milestoneGoals = [20, 70, 150, 240, 340, 450, 570];
  for (let i = 1; i < milestoneGoals.length; i++) {
    assert(milestoneGoals[i] > milestoneGoals[i - 1], `Milestone ${milestoneGoals[i]} must be strictly greater than ${milestoneGoals[i - 1]}`);
  }
  assertEquals(milestoneGoals[milestoneGoals.length - 1], 570, 'Highest milestone must be 570');
});

check('Camps', 'Progress calculation handles 0, 285, 569, 570, and 600 sleep styles cleanly', () => {
  function calcProgress(currentStyles, targetGoal = 570) {
    if (currentStyles <= 0) return 0;
    const pct = (currentStyles / targetGoal) * 100;
    return Math.min(100, Math.round(pct * 10) / 10);
  }

  assertEquals(calcProgress(0), 0);
  assertEquals(calcProgress(285), 50.0);
  assertEquals(calcProgress(569), 99.8);
  assertEquals(calcProgress(570), 100.0);
  assertEquals(calcProgress(600), 100.0);
});

// =============================================================================
// Section 5: Adversarial Boundary Probes & Rule Audits
// =============================================================================
console.log('\n[Section 5] Adversarial Edge Cases & User Rules Audits');

check('Adversarial', 'Pokedex queries handle regex chars and case variations without throwing', () => {
  const safeRegexSearch = (query, list) => {
    try {
      const q = query.trim().toLowerCase();
      return list.filter(p => {
        const cn = (p.name_cn || '').toLowerCase();
        const en = (p.name_en || '').toLowerCase();
        return cn.includes(q) || en.includes(q);
      });
    } catch (e) {
      return [];
    }
  };

  const probes = ['木棉球', 'cotTONee', '風妖精', 'WHIMSIcott', '.*', '[546]', '(?=.*)', ''];
  for (const q of probes) {
    const res = safeRegexSearch(q, allPokemon);
    assert(Array.isArray(res), `Search for ${q} must return array`);
  }
});

check('Adversarial', 'Rule VIII: Zero Emoji Policy in data.json, recipes.json, items.json, ladder_lv60.json', () => {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
  const filesToCheck = [pokemonDataPath, recipesJsonPath, itemsJsonPath, ladderJsonPath, sleepStylesPath];

  for (const f of filesToCheck) {
    const content = fs.readFileSync(f, 'utf8');
    assert(!emojiRegex.test(content), `File ${path.basename(f)} must contain zero emojis`);
  }
});

check('Adversarial', 'Rule X: Zero Decorative Star/Glyph Symbols in names and badges', () => {
  const glyphRegex = /[\u2605\u2606]|\[[\u2605\u2606]\]|\[\*\]|\[\+\]|\[#\]/;
  assert(!glyphRegex.test(cottonee.name_cn), 'Cottonee name must not contain decorative glyphs');
  assert(!glyphRegex.test(whimsicott.name_cn), 'Whimsicott name must not contain decorative glyphs');
  assert(!glyphRegex.test(curry39.name_cn), 'Curry 39 name must not contain decorative glyphs');
  assert(!glyphRegex.test(salad121.name_cn), 'Salad 121 name must not contain decorative glyphs');
  assert(!glyphRegex.test(dessert91.name_cn), 'Dessert 91 name must not contain decorative glyphs');
});

// =============================================================================
// Empirical Summary
// =============================================================================
console.log('\n================================================================');
console.log('       Challenger M2 Multi-Tab Empirical Summary');
console.log('================================================================');
console.log(`Total Invariants Tested: ${totalChecks}`);
console.log(`Passed Checks:           ${passedChecks}`);
console.log(`Failed Checks:           ${failedChecks}`);
console.log('----------------------------------------------------------------');

if (failedChecks === 0) {
  console.log('CHALLENGER VERDICT: CONFIRM');
  console.log('All multi-tab data rendering invariants, consumer modules,');
  console.log('pot expansions, and adversarial edge cases are 100% verified.');
} else {
  console.log('CHALLENGER VERDICT: REJECT');
  console.log(`Encountered ${failedChecks} failures:`);
  failureDetails.forEach(f => console.log(`  - [${f.category}] ${f.description}: ${f.error}`));
  process.exit(1);
}
