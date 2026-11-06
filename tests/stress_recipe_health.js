/**
 * stress_recipe_health.js - Empirical Adversarial Stress Test Suite
 * Stress-tests isRecipesHealthy in js/modules/recipes.js against adversarial payloads,
 * extreme boundary conditions, type corruptions, and sparse arrays.
 */

const { isRecipesHealthy } = require('../js/modules/recipes.js');
const canonicalRecipes = require('../data/recipes.json');

const results = {
  total: 0,
  expectedPassPassed: 0,
  expectedPassFailed: 0,
  expectedRejectRejected: 0,
  vulnerabilitiesFound: 0,
  findings: []
};

function recordFinding(category, title, severity, detail) {
  results.findings.push({ category, title, severity, detail });
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function runAdversarialTest(category, name, payload, expectedHealthy, description) {
  results.total++;
  let actualHealthy = null;
  let threwException = false;
  let exceptionMessage = null;

  try {
    actualHealthy = isRecipesHealthy(payload);
  } catch (err) {
    threwException = true;
    exceptionMessage = err.message;
  }

  if (threwException) {
    console.log('[EXCEPTION] ' + category + ' - ' + name + ': threw ' + exceptionMessage);
    recordFinding(category, name, 'HIGH', 'Threw uncaught exception: ' + exceptionMessage);
    return;
  }

  if (expectedHealthy) {
    if (actualHealthy === true) {
      results.expectedPassPassed++;
      console.log('[PASS] ' + category + ' - ' + name);
    } else {
      results.expectedPassFailed++;
      console.log('[FAIL] ' + category + ' - ' + name + ' (Expected HEALTHY, got UNHEALTHY)');
      recordFinding(category, name, 'MEDIUM', 'False rejection of valid variation: ' + description);
    }
  } else {
    // Expected to be rejected (unhealthy)
    if (actualHealthy === false) {
      results.expectedRejectRejected++;
      console.log('[PASS] ' + category + ' - ' + name);
    } else {
      results.vulnerabilitiesFound++;
      console.log('[VULNERABILITY] ' + category + ' - ' + name + ' (Expected REJECTED, but PASSED as healthy!)');
      recordFinding(category, name, 'CRITICAL', 'Poisoned payload improperly accepted: ' + description);
    }
  }
}

console.log('=== STARTING EMPIRICAL ADVERSARIAL STRESS TESTING ===\n');

// Group 1: Baseline and Valid Variations
runAdversarialTest('Baseline', 'Canonical data/recipes.json', canonicalRecipes, true, 'Official dataset must be healthy');

const legacyRecipes = canonicalRecipes.map(r => ({
  name: r.name_cn,
  category: r.category,
  energy: r.base_energy,
  ingredients: r.ingredients
}));
runAdversarialTest('Baseline', 'Legacy schema (name + energy)', legacyRecipes, true, 'Legacy external feed schema must be healthy');

const dualRecipes = canonicalRecipes.map(r => ({
  name_cn: r.name_cn,
  name: r.name_cn,
  category: r.category,
  base_energy: r.base_energy,
  energy: r.base_energy,
  ingredients: r.ingredients
}));
runAdversarialTest('Baseline', 'Dual schema (canonical + legacy fields)', dualRecipes, true, 'Dual field schema must be healthy');

const expandedRecipes = canonicalRecipes.concat(canonicalRecipes.slice(0, 22)); // 100 recipes
runAdversarialTest('Baseline', 'Expanded dataset (100 recipes)', expandedRecipes, true, 'Datasets >= 78 recipes must be healthy');

// Group 2: Boundary Counts
runAdversarialTest('Boundary', 'Empty array (0 items)', [], false, 'Empty array must be rejected');
runAdversarialTest('Boundary', 'Single recipe (1 item)', canonicalRecipes.slice(0, 1), false, 'Array < 78 must be rejected');
runAdversarialTest('Boundary', '77 recipes (boundary - 1)', canonicalRecipes.slice(0, 77), false, '77 items must be rejected');
runAdversarialTest('Boundary', '78 recipes (boundary exact)', canonicalRecipes.slice(0, 78), true, '78 items must pass');
runAdversarialTest('Boundary', '79 recipes (boundary + 1)', canonicalRecipes.concat([canonicalRecipes[0]]), true, '79 items must pass');
runAdversarialTest('Boundary', '1000 recipes (large payload)', Array(1000).fill(canonicalRecipes[0]), true, 'Large valid array must pass');

// Group 3: Malformed Top-level Data Types
runAdversarialTest('Type Safety', 'null payload', null, false, 'null must be rejected');
runAdversarialTest('Type Safety', 'undefined payload', undefined, false, 'undefined must be rejected');
runAdversarialTest('Type Safety', 'Number payload (123)', 123, false, 'Number must be rejected');
runAdversarialTest('Type Safety', 'String payload ("invalid")', "invalid", false, 'String must be rejected');
runAdversarialTest('Type Safety', 'Boolean payload (true)', true, false, 'Boolean must be rejected');
runAdversarialTest('Type Safety', 'Plain object without array ({})', {}, false, 'Plain object must be rejected');
runAdversarialTest('Type Safety', 'Array-like object ({ length: 80 })', { length: 80 }, false, 'Array-like object must be rejected');
runAdversarialTest('Type Safety', 'Function payload', function() {}, false, 'Function must be rejected');

// Group 4: Sparse Array Exploits (Holes in Arrays)
const fullySparse = new Array(80);
runAdversarialTest('Sparse Array', '80 empty slots (new Array(80))', fullySparse, false, 'Array of empty slots must be rejected');

const partialSparseHoleAtEnd = canonicalRecipes.slice(0, 77);
partialSparseHoleAtEnd.length = 80; // slots 77, 78, 79 are holes
runAdversarialTest('Sparse Array', 'Holes at end of array (77 items + 3 holes)', partialSparseHoleAtEnd, false, 'Array with holes at end must be rejected');

const partialSparseHoleInMiddle = canonicalRecipes.slice(0, 77);
partialSparseHoleInMiddle[78] = canonicalRecipes[0]; // slot 77 is hole, length 79
runAdversarialTest('Sparse Array', 'Hole in middle of array (index 77 is hole)', partialSparseHoleInMiddle, false, 'Array with hole in middle must be rejected');

// Group 5: Extreme and Poisoned Energy Numbers
const energyZero = clone(canonicalRecipes);
energyZero[0].base_energy = 0;
runAdversarialTest('Energy', 'base_energy is 0', energyZero, false, 'Zero energy must be rejected');

const energyNegative = clone(canonicalRecipes);
energyNegative[0].base_energy = -1;
runAdversarialTest('Energy', 'base_energy is -1', energyNegative, false, 'Negative energy must be rejected');

const energyNaN = clone(canonicalRecipes);
energyNaN[0].base_energy = NaN;
runAdversarialTest('Energy', 'base_energy is NaN', energyNaN, false, 'NaN energy must be rejected');

const energyInfinity = clone(canonicalRecipes);
energyInfinity[0].base_energy = Infinity;
runAdversarialTest('Energy', 'base_energy is Infinity', energyInfinity, false, 'Infinity energy must be rejected');

const energyNegInfinity = clone(canonicalRecipes);
energyNegInfinity[0].base_energy = -Infinity;
runAdversarialTest('Energy', 'base_energy is -Infinity', energyNegInfinity, false, '-Infinity energy must be rejected');

const energyString = clone(canonicalRecipes);
energyString[0].base_energy = "748";
runAdversarialTest('Energy', 'base_energy is string number ("748")', energyString, false, 'String energy must be rejected');

const energyNull = clone(canonicalRecipes);
energyNull[0].base_energy = null;
runAdversarialTest('Energy', 'base_energy is null', energyNull, false, 'null energy must be rejected');

const energyBigInt = clone(canonicalRecipes);
energyBigInt[0].base_energy = 748n;
runAdversarialTest('Energy', 'base_energy is BigInt (748n)', energyBigInt, false, 'BigInt energy must be rejected');

const energyDecimal = clone(canonicalRecipes);
energyDecimal[0].base_energy = 748.5;
runAdversarialTest('Energy', 'base_energy is decimal float (748.5)', energyDecimal, true, 'Decimal float energy handling check');

// Group 6: Missing and Malformed Recipe Identity (name_cn, name, category)
const missingName = clone(canonicalRecipes);
delete missingName[0].name_cn;
delete missingName[0].name;
runAdversarialTest('Recipe Identity', 'Missing both name_cn and name', missingName, false, 'Missing names must be rejected');

const emptyName = clone(canonicalRecipes);
emptyName[0].name_cn = "";
delete emptyName[0].name;
runAdversarialTest('Recipe Identity', 'Empty string name_cn ("")', emptyName, false, 'Empty name_cn must be rejected');

const whitespaceName = clone(canonicalRecipes);
whitespaceName[0].name_cn = "   ";
delete whitespaceName[0].name;
runAdversarialTest('Recipe Identity', 'Whitespace-only name_cn ("   ")', whitespaceName, false, 'Whitespace name_cn must be rejected');

const nonStringName = clone(canonicalRecipes);
nonStringName[0].name_cn = 12345;
delete nonStringName[0].name;
runAdversarialTest('Recipe Identity', 'Number name_cn (12345)', nonStringName, false, 'Number name_cn must be rejected');

const missingCategory = clone(canonicalRecipes);
delete missingCategory[0].category;
runAdversarialTest('Recipe Identity', 'Missing category', missingCategory, false, 'Missing category must be rejected');

const emptyCategory = clone(canonicalRecipes);
emptyCategory[0].category = "";
runAdversarialTest('Recipe Identity', 'Empty string category ("")', emptyCategory, false, 'Empty category must be rejected');

const whitespaceCategory = clone(canonicalRecipes);
whitespaceCategory[0].category = "   ";
runAdversarialTest('Recipe Identity', 'Whitespace-only category ("   ")', whitespaceCategory, false, 'Whitespace category must be rejected');

const nonStringCategory = clone(canonicalRecipes);
nonStringCategory[0].category = true;
runAdversarialTest('Recipe Identity', 'Boolean category (true)', nonStringCategory, false, 'Boolean category must be rejected');

// Group 7: Ingredients Array Integrity
const missingIngredients = clone(canonicalRecipes);
delete missingIngredients[0].ingredients;
runAdversarialTest('Ingredients Structure', 'Missing ingredients property', missingIngredients, false, 'Missing ingredients must be rejected');

const nullIngredients = clone(canonicalRecipes);
nullIngredients[0].ingredients = null;
runAdversarialTest('Ingredients Structure', 'null ingredients property', nullIngredients, false, 'null ingredients must be rejected');

const nonArrayIngredients = clone(canonicalRecipes);
nonArrayIngredients[0].ingredients = { count: 5 };
runAdversarialTest('Ingredients Structure', 'Object ingredients property', nonArrayIngredients, false, 'Object ingredients must be rejected');

const emptyIngredients = clone(canonicalRecipes);
emptyIngredients[0].ingredients = [];
runAdversarialTest('Ingredients Structure', 'Empty ingredients array ([])', emptyIngredients, false, 'Empty ingredients array must be rejected');

const sparseIngredients = clone(canonicalRecipes);
sparseIngredients[0].ingredients = new Array(3);
runAdversarialTest('Ingredients Structure', 'Sparse ingredients array (new Array(3))', sparseIngredients, false, 'Sparse ingredients array must be rejected');

const emptyObjIngredient = clone(canonicalRecipes);
emptyObjIngredient[0].ingredients = [{}];
runAdversarialTest('Ingredients Content', 'Empty ingredient object ([{}])', emptyObjIngredient, false, 'Empty ingredient object must be rejected');

const nullIngredientElem = clone(canonicalRecipes);
nullIngredientElem[0].ingredients = [null];
runAdversarialTest('Ingredients Content', 'null ingredient element ([null])', nullIngredientElem, false, 'null ingredient element must be rejected');

const negativeIngCount = clone(canonicalRecipes);
negativeIngCount[0].ingredients[0].count = -5;
runAdversarialTest('Ingredients Content', 'Negative ingredient count (-5)', negativeIngCount, false, 'Negative count must be rejected');

const zeroIngCount = clone(canonicalRecipes);
zeroIngCount[0].ingredients[0].count = 0;
runAdversarialTest('Ingredients Content', 'Zero ingredient count (0)', zeroIngCount, false, 'Zero count must be rejected');

const nanIngCount = clone(canonicalRecipes);
nanIngCount[0].ingredients[0].count = NaN;
runAdversarialTest('Ingredients Content', 'NaN ingredient count', nanIngCount, false, 'NaN count must be rejected');

const infIngCount = clone(canonicalRecipes);
infIngCount[0].ingredients[0].count = Infinity;
runAdversarialTest('Ingredients Content', 'Infinity ingredient count', infIngCount, false, 'Infinity count must be rejected');

const stringIngCount = clone(canonicalRecipes);
stringIngCount[0].ingredients[0].count = "5";
runAdversarialTest('Ingredients Content', 'String ingredient count ("5")', stringIngCount, false, 'String count must be rejected');

const whitespaceIngName = clone(canonicalRecipes);
whitespaceIngName[0].ingredients[0].name = "   ";
runAdversarialTest('Ingredients Content', 'Whitespace ingredient name ("   ")', whitespaceIngName, false, 'Whitespace ingredient name must be rejected');

const numericIngName = clone(canonicalRecipes);
numericIngName[0].ingredients[0].name = 999;
runAdversarialTest('Ingredients Content', 'Numeric ingredient name (999)', numericIngName, false, 'Numeric ingredient name must be rejected');

const symbolIngName = clone(canonicalRecipes);
symbolIngName[0].ingredients[0].name = Symbol('poison');
runAdversarialTest('Ingredients Content', 'Symbol ingredient name', symbolIngName, false, 'Symbol ingredient name must be rejected');

const functionIngName = clone(canonicalRecipes);
functionIngName[0].ingredients[0].name = function() {};
runAdversarialTest('Ingredients Content', 'Function ingredient name', functionIngName, false, 'Function ingredient name must be rejected');

// Group 8: Circular References & Throwing Getters
const circularObj = clone(canonicalRecipes);
circularObj[0].self = circularObj[0];
runAdversarialTest('Complex Structures', 'Circular reference on recipe object', circularObj, true, 'Safe circular reference on recipe object');

const throwingGetter = clone(canonicalRecipes);
Object.defineProperty(throwingGetter[0], 'base_energy', {
  get() { throw new Error('Explosive getter in base_energy'); }
});
runAdversarialTest('Complex Structures', 'Throwing getter on recipe property', throwingGetter, false, 'Throwing getter must result in false or be safely handled');

// Group 9: Prototype Pollution Dependency
const emptyObjectsArray = Array.from({ length: 80 }, () => ({}));
Object.prototype.name_cn = 'Polluted';
Object.prototype.category = 'curry';
Object.prototype.base_energy = 500;
Object.prototype.ingredients = [{ name: 'Apple', count: 1 }];

runAdversarialTest('Prototype Pollution', 'Array of 80 empty objects with polluted Object.prototype', emptyObjectsArray, false, 'Empty objects relying on polluted prototype must be rejected');

delete Object.prototype.name_cn;
delete Object.prototype.category;
delete Object.prototype.base_energy;
delete Object.prototype.ingredients;

// Summary
console.log('\n=== EMPIRICAL STRESS TEST RESULTS ===');
console.log('Total Tests Executed: ' + results.total);
console.log('Valid Inputs Passed: ' + results.expectedPassPassed);
console.log('Valid Inputs Failed: ' + results.expectedPassFailed);
console.log('Invalid Payloads Correctly Rejected: ' + results.expectedRejectRejected);
console.log('Vulnerabilities Found (Poisoned Payloads Accepted): ' + results.vulnerabilitiesFound);

console.log('\n=== VULNERABILITY SUMMARY ===');
results.findings.forEach((f, idx) => {
  console.log((idx + 1) + '. [' + f.severity + '] ' + f.category + ': ' + f.title);
  console.log('   Detail: ' + f.detail);
});

if (results.vulnerabilitiesFound > 0) {
  console.log('\nOVERALL VERDICT: REQUEST_CHANGES');
} else {
  console.log('\nOVERALL VERDICT: APPROVE');
}
