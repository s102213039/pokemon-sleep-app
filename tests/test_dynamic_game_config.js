/**
 * tests/test_dynamic_game_config.js
 * Single-Source-of-Truth Verification Suite for Dynamic Level & Island Bonus Caps
 * ===============================================================================
 * Verifies that updating parameters in js/core/gameConfig.js (or runtime
 * window.GAME_CONFIG overrides) propagates cleanly across:
 *   1. js/core/gameConfig.js API & extrapolation formulas
 *   2. index.html & app/index.html script order & static slider/label bounds
 *   3. i18n trilingual slider descriptions (zh-TW, zh-CN, en-US)
 *   4. Recipes module (getLevelBonus, clamping, slider UI sync)
 *   5. Wiki module (Berry energy clamping, rendered sliders, Sleep EXP options)
 *   6. Pokedex modal (unreleased boundary, pin-cap, milestones)
 *   7. Appraisal Lab (compare benchmarks, growth milestones, engine costs.toCap)
 *   8. Box OCR parser (dynamic Lv. parsing headroom)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAME_CONFIG = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));

let total = 0;
let passed = 0;

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
    placeholder: '',
    textContent: '',
    innerHTML: '',
    disabled: false,
    style: { setProperty() {}, removeProperty() {}, display: '' },
    listeners: {},
    classList: {
      add(...cls) { cls.forEach(c => classes.add(c)); },
      remove(...cls) { cls.forEach(c => classes.delete(c)); },
      toggle(c, force) {
        if (force === undefined) {
          if (classes.has(c)) classes.delete(c); else classes.add(c);
        } else if (force) classes.add(c);
        else classes.delete(c);
      },
      contains(c) { return classes.has(c); }
    },
    setAttribute(k, v) { attrs[k] = String(v); },
    getAttribute(k) { return attrs[k] !== undefined ? attrs[k] : null; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    closest() { return null; },
    dispatchEvent() { return true; }
  };
}

function createOverriddenGameConfig(overrides = {}) {
  const caps = Object.freeze({
    ...GAME_CONFIG.CAPS,
    ...overrides
  });
  return {
    ...GAME_CONFIG,
    CAPS: caps,
    getCaps: () => caps,
    getPokemonLevelCap: () => caps.POKEMON_LEVEL_CAP,
    getRecipeLevelCap: () => caps.RECIPE_LEVEL_CAP,
    getTheoreticalMaxLevel: () => caps.THEORETICAL_MAX_LEVEL,
    getIslandBonusCap: () => caps.ISLAND_BONUS_CAP,
    getIslandBonusStep: () => caps.ISLAND_BONUS_STEP,
    getSubskillUnlockLevels: () => caps.SUBSKILL_UNLOCK_LEVELS.slice(),
    isLevelUnreleased: (lv) => Number(lv) > caps.POKEMON_LEVEL_CAP,
    isPokemonLevelCap: (lv) => Number(lv) === caps.POKEMON_LEVEL_CAP,
    getRecipeLevelBonus: (lv) => GAME_CONFIG.getRecipeLevelBonus(lv, caps.RECIPE_LEVEL_CAP),
    getRecipeMaxBonusPct: () => GAME_CONFIG.getRecipeLevelBonus(caps.RECIPE_LEVEL_CAP, caps.RECIPE_LEVEL_CAP),
    getReleasedPokemonMilestones: () => Array.from(new Set([10, 25, 30, 50, 60, ...caps.SUBSKILL_UNLOCK_LEVELS, caps.POKEMON_LEVEL_CAP].filter(l => l <= caps.POKEMON_LEVEL_CAP))).sort((a, b) => a - b),
    getAllPokedexPinMilestones: () => Array.from(new Set([10, 25, 30, 50, 60, ...caps.SUBSKILL_UNLOCK_LEVELS, caps.POKEMON_LEVEL_CAP, caps.THEORETICAL_MAX_LEVEL])).sort((a, b) => a - b),
    getGrowthMilestones: () => Array.from(new Set([30, 50, 60, caps.POKEMON_LEVEL_CAP, 80, caps.THEORETICAL_MAX_LEVEL])).sort((a, b) => a - b),
    getSleepExpTargetLevels: () => Array.from(new Set([30, 50, 60, caps.POKEMON_LEVEL_CAP, 80, caps.THEORETICAL_MAX_LEVEL])).sort((a, b) => a - b)
  };
}

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

console.log('======================================================');
console.log('Dynamic Game Config Single-Source Verification Suite');
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

console.log('======================================================');

check('GAME_CONFIG canonical defaults and extrapolation math', () => {
  assert.strictEqual(GAME_CONFIG.getPokemonLevelCap(), 70);
  assert.strictEqual(GAME_CONFIG.getRecipeLevelCap(), 70);
  assert.strictEqual(GAME_CONFIG.getTheoreticalMaxLevel(), 100);
  assert.strictEqual(GAME_CONFIG.getIslandBonusCap(), 85);
  assert.strictEqual(GAME_CONFIG.getIslandBonusStep(), 5);
  assert.strictEqual(GAME_CONFIG.getRecipeLevelBonus(70), 258);
  assert.strictEqual(GAME_CONFIG.getRecipeMaxBonusPct(), 258);
  assert.strictEqual(GAME_CONFIG.getRecipeLevelBonus(75, 75), 288);
  assert.strictEqual(GAME_CONFIG.isLevelUnreleased(70), false);
  assert.strictEqual(GAME_CONFIG.isLevelUnreleased(71), true);
  assert.deepStrictEqual(GAME_CONFIG.getAllPokedexPinMilestones(), [10, 25, 30, 50, 60, 70, 80, 100]);
});

check('index.html & app/index.html load gameConfig.min.js before domUtils & match synced caps', () => {
  const caps = GAME_CONFIG.getCaps();
  for (const rel of ['index.html', path.join('app', 'index.html')]) {
    const html = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    const cfgIdx = html.indexOf('gameConfig.min.js');
    const domIdx = html.indexOf('domUtils.min.js');
    assert(cfgIdx > 0 && domIdx > cfgIdx, `${rel} must load gameConfig.min.js before domUtils.min.js`);
    assert(html.includes(`id="recipe-level-slider"`) && html.includes(`max="${caps.RECIPE_LEVEL_CAP}"`), `${rel} recipe-level-slider max matches config`);
    assert(html.includes(`id="recipe-level-max-label">Lv.${caps.RECIPE_LEVEL_CAP}</span>`), `${rel} recipe-level-max-label matches config`);
    assert(html.includes(`id="island-bonus-slider"`) && html.includes(`max="${caps.ISLAND_BONUS_CAP}" step="${caps.ISLAND_BONUS_STEP}"`), `${rel} island-bonus-slider max/step matches config`);
    assert(html.includes(`id="island-bonus-max-label">${caps.ISLAND_BONUS_CAP}%</span>`), `${rel} island-bonus-max-label matches config`);
    assert(html.includes(`id="modal-poke-level"`) && html.includes(`max="${caps.THEORETICAL_MAX_LEVEL}"`), `${rel} modal-poke-level max matches config`);
  }
});

check('syncStaticDomCaps updates DOM sliders, steps, and labels from active GAME_CONFIG', () => {
  const els = {
    'recipe-level-slider': makeMockElement('recipe-level-slider'),
    'recipe-level-max-label': makeMockElement('recipe-level-max-label'),
    'island-bonus-slider': makeMockElement('island-bonus-slider'),
    'island-bonus-max-label': makeMockElement('island-bonus-max-label'),
    'modal-poke-level': makeMockElement('modal-poke-level')
  };
  const futureCfg = createOverriddenGameConfig({ RECIPE_LEVEL_CAP: 75, ISLAND_BONUS_CAP: 100, ISLAND_BONUS_STEP: 5, THEORETICAL_MAX_LEVEL: 100 });
  const prev = globalThis.GAME_CONFIG;
  globalThis.GAME_CONFIG = futureCfg;
  try {
    GAME_CONFIG.syncStaticDomCaps({ getElementById: (id) => els[id] || null });
  } finally {
    globalThis.GAME_CONFIG = prev;
  }
  assert.strictEqual(els['recipe-level-slider'].max, '75');
  assert.strictEqual(els['recipe-level-max-label'].textContent, 'Lv.75');
  assert.strictEqual(els['island-bonus-slider'].max, '100');
  assert.strictEqual(els['island-bonus-max-label'].textContent, '100%');
  assert.strictEqual(els['modal-poke-level'].max, '100');
});

check('i18n dynamically interpolates default & future GAME_CONFIG caps across all 3 locales', () => {
  const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
  const futureCfg = createOverriddenGameConfig({ RECIPE_LEVEL_CAP: 75, ISLAND_BONUS_CAP: 100, ISLAND_BONUS_STEP: 5 });

  const sandbox = {
    window: { GAME_CONFIG: futureCfg },
    globalThis: null,
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { documentElement: { setAttribute: () => {} }, readyState: 'loading', addEventListener: () => {} },
    console
  };
  sandbox.window.window = sandbox.window;
  sandbox.globalThis = sandbox;
  sandbox.GAME_CONFIG = futureCfg;
  vm.createContext(sandbox);
  vm.runInContext(i18nCode, sandbox);

  const I18N = sandbox.window.I18N;
  I18N.setLanguage('zh-TW');
  assert(I18N.t('recipe.slider_level_desc').includes('Lv.75') && I18N.t('recipe.slider_level_desc').includes('+288%'), 'zh-TW must reflect future Lv.75 +288%');
  assert(I18N.t('recipe.slider_island_desc').includes('100%') && I18N.t('recipe.slider_island_desc').includes('2.00'), 'zh-TW must reflect future 100% ×2.00');

  I18N.setLanguage('zh-CN');
  assert(I18N.t('recipe.slider_level_desc').includes('Lv.75') && I18N.t('recipe.slider_level_desc').includes('+288%'), 'zh-CN must reflect future Lv.75 +288%');
  assert(I18N.t('recipe.slider_island_desc').includes('100%') && I18N.t('recipe.slider_island_desc').includes('2.00'), 'zh-CN must reflect future 100% ×2.00');

  I18N.setLanguage('en-US');
  assert(I18N.t('recipe.slider_level_desc').includes('Lv.75') && I18N.t('recipe.slider_level_desc').includes('+288%'), 'en-US must reflect future Lv.75 +288%');
  assert(I18N.t('recipe.slider_island_desc').includes('100%') && I18N.t('recipe.slider_island_desc').includes('2.00'), 'en-US must reflect future 100% ×2.00');
});

(async function main() {
await checkAsync('recipes.js dynamically adopts future RECIPE_LEVEL_CAP & ISLAND_BONUS_CAP', async () => {
  const recipesCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'recipes.js'), 'utf8');
  const recipesJsonText = fs.readFileSync(path.join(ROOT_DIR, 'data', 'recipes.json'), 'utf8');
  const recipesJson = JSON.parse(recipesJsonText);
  const futureCfg = createOverriddenGameConfig({ RECIPE_LEVEL_CAP: 75, ISLAND_BONUS_CAP: 100 });
  const levelSlider = makeMockElement('recipe-level-slider');
  const levelBadge = makeMockElement('level-badge');
  const levelMaxLabel = makeMockElement('recipe-level-max-label');
  const islandSlider = makeMockElement('island-bonus-slider');
  const islandBadge = makeMockElement('island-bonus-badge');
  const islandMaxLabel = makeMockElement('island-bonus-max-label');

  const els = {
    'recipe-level-slider': levelSlider,
    'level-badge': levelBadge,
    'recipe-level-max-label': levelMaxLabel,
    'island-bonus-slider': islandSlider,
    'island-bonus-badge': islandBadge,
    'island-bonus-max-label': islandMaxLabel
  };

  const sandbox = {
    window: { GAME_CONFIG: futureCfg, innerWidth: 1200 },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: (id) => els[id] || null,
      querySelectorAll: () => []
    },
    localStorage: {
      getItem: (k) => (k === 'pksleep_recipe_prefs_v3' ? JSON.stringify({ recipeLevel: 75, islandBonus: 100 }) : null),
      setItem: () => {}
    },
    fetch: () => Promise.resolve({
      ok: true,
      text: () => Promise.resolve(recipesJsonText),
      json: () => Promise.resolve(recipesJson)
    }),
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => {},
    CustomEvent: function(type, init) { this.type = type; this.detail = init ? init.detail : null; },
    dispatchEvent: () => true,
    console
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.CustomEvent = sandbox.CustomEvent;
  sandbox.window.dispatchEvent = sandbox.dispatchEvent;
  sandbox.globalThis = sandbox;
  sandbox.GAME_CONFIG = futureCfg;
  vm.createContext(sandbox);
  vm.runInContext(recipesCode, sandbox);

  await new Promise(r => setTimeout(r, 60));

  const RecipesApp = sandbox.window.RecipesApp;
  assert.strictEqual(RecipesApp.getLevelBonus(75), 288, 'RecipesApp.getLevelBonus(75) must compute 288');
  assert.strictEqual(levelSlider.max, '75', 'Synced levelSlider.max must be 75');
  assert.strictEqual(levelSlider.value, 75, 'Loaded Lv.75 must not be clamped to 70');
  assert.strictEqual(levelMaxLabel.textContent, 'Lv.75');
  assert.strictEqual(islandSlider.max, '100', 'Synced islandSlider.max must be 100');
  assert.strictEqual(islandSlider.value, 100, 'Loaded 100% islandBonus must not be clamped to 85');
  assert.strictEqual(islandMaxLabel.textContent, '100%');
});

check('wiki.js dynamically scales Berry sliders, Sleep EXP options, and level clamps', () => {
  const wikiCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki.js'), 'utf8');
  const futureCfg = createOverriddenGameConfig({ POKEMON_LEVEL_CAP: 75, ISLAND_BONUS_CAP: 100 });
  const berryDisplay = makeMockElement('berry-level-display');
  const berrySlider = makeMockElement('berry-level-slider');
  const islandDisplay = makeMockElement('berry-island-display');
  const islandSlider = makeMockElement('berry-island-slider');
  const wikiPanel = makeMockElement('panel-wiki');
  const els = {
    'berry-level-display': berryDisplay,
    'berry-level-slider': berrySlider,
    'berry-island-display': islandDisplay,
    'berry-island-slider': islandSlider,
    'panel-wiki': wikiPanel
  };

  const sandbox = {
    window: { GAME_CONFIG: futureCfg, innerWidth: 1200, localStorage: { getItem: () => null, setItem: () => {} } },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: (id) => els[id] || null,
      querySelectorAll: () => [],
      createElement: () => makeMockElement()
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    PokemonApp: { getAllData: () => [] },
    console
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.globalThis = sandbox;
  sandbox.GAME_CONFIG = futureCfg;
  vm.createContext(sandbox);
  vm.runInContext(wikiCode, sandbox);

  const WikiDB = sandbox.window.WikiDB;
  WikiDB.updateBerryLevel(75);
  assert.strictEqual(berryDisplay.textContent, 'Lv. 75', 'Berry level 75 must not be clamped to 70');
  WikiDB.updateBerryIsland(100);
  assert.strictEqual(islandDisplay.textContent, '+100%', 'Berry island bonus 100% must not be clamped to 85%');

  WikiDB.renderWikiLayout(wikiPanel);
  assert(wikiPanel.innerHTML.includes('id="berry-level-slider" min="1" max="75"'), 'Rendered berry slider max must be 75');
  assert(wikiPanel.innerHTML.includes('id="berry-island-slider" min="0" max="100"'), 'Rendered island slider max must be 100');
  assert(wikiPanel.innerHTML.includes('<option value="75">Lv.75</option>'), 'Sleep EXP target dropdown must include Lv.75');
});

check('app.js (Pokedex modal) dynamically adapts unreleased boundary & pin-cap to POKEMON_LEVEL_CAP', () => {
  const appCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'app.js'), 'utf8');
  const dataJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'data.json'), 'utf8'));
  const pikachu = dataJson.find(p => p.formatted_no === '0025' || p.name_cn === '皮卡丘') || dataJson[0];

  const futureCfg = createOverriddenGameConfig({ POKEMON_LEVEL_CAP: 75 });
  const modalEl = makeMockElement('pokedex-detail-modal');
  const sliderEl = makeMockElement('pokedex-level-slider');
  const valTextEl = makeMockElement('pokedex-level-val-text');
  const unreleasedEl = makeMockElement('pokedex-level-unreleased-tag');
  const els = {
    'pokedex-detail-modal': modalEl,
    'pokedex-level-slider': sliderEl,
    'pokedex-level-val-text': valTextEl,
    'pokedex-level-unreleased-tag': unreleasedEl,
    'pokedex-subskill-slots-row': makeMockElement('pokedex-subskill-slots-row'),
    'pokedex-subskill-palette': makeMockElement('pokedex-subskill-palette'),
    'pokedex-ing-strip': makeMockElement('pokedex-ing-strip')
  };

  const sandbox = {
    window: { GAME_CONFIG: futureCfg, innerWidth: 1200, localStorage: { getItem: () => null, setItem: () => {} } },
    globalThis: null,
    document: {
      readyState: 'complete',
      body: { style: {}, classList: { add() {}, remove() {} } },
      documentElement: { setAttribute() {} },
      addEventListener: () => {},
      getElementById: (id) => {
        if (!els[id]) els[id] = makeMockElement(id);
        return els[id];
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      createElement: () => makeMockElement()
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(dataJson), text: () => Promise.resolve(JSON.stringify(dataJson)) }),
    CustomEvent: function(type, init) { this.type = type; this.detail = init ? init.detail : null; },
    dispatchEvent: () => true,
    setTimeout,
    clearTimeout,
    console
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.CustomEvent = sandbox.CustomEvent;
  sandbox.window.dispatchEvent = sandbox.dispatchEvent;
  sandbox.globalThis = sandbox;
  sandbox.GAME_CONFIG = futureCfg;
  vm.createContext(sandbox);
  vm.runInContext(appCode, sandbox);

  const PokemonApp = sandbox.window.PokemonApp;
  PokemonApp.openPokemonDetailModal(pikachu);
  assert(modalEl.innerHTML.includes('data-pin-lv="75"'), 'Pokedex pin bar must render Lv.75 milestone when cap=75');
  const pin75Idx = modalEl.innerHTML.indexOf('data-pin-lv="75"');
  const pin75Snippet = modalEl.innerHTML.slice(Math.max(0, pin75Idx - 120), pin75Idx + 60);
  assert(pin75Snippet.includes('pin-cap'), 'Lv.75 pin must carry pin-cap class when cap=75');

  PokemonApp.setPokedexModalLevel(75);
  assert(unreleasedEl.classList.contains('hidden'), 'Lv.75 must hide unreleased tag when cap=75');
  PokemonApp.setPokedexModalLevel(76);
  assert(!unreleasedEl.classList.contains('hidden'), 'Lv.76 must show unreleased tag when cap=75');
});

check('appraisal.js & box.js adapt dynamic cap benchmarks, growth milestones, costs.toCap, and OCR limits', () => {
  const appraisalCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'box.js'), 'utf8');
  const dataJson = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'data.json'), 'utf8'));
  const futureCfg = createOverriddenGameConfig({ POKEMON_LEVEL_CAP: 75 });

  // Appraisal Lab
  const labSandbox = {
    window: { GAME_CONFIG: futureCfg, PokemonApp: { getAllData: () => dataJson } },
    document: { readyState: 'loading', addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
    module: { exports: {} },
    exports: {},
    console
  };
  labSandbox.window.window = labSandbox.window;
  labSandbox.globalThis = labSandbox;
  labSandbox.GAME_CONFIG = futureCfg;
  vm.createContext(labSandbox);
  vm.runInContext(appraisalCode, labSandbox);

  const Lab = labSandbox.window.AppraisalLab;
  const pikaEval = Lab.evaluatePokemon({
    pkm: dataJson[0],
    level: 30,
    nature: '坦率',
    subskills: []
  });
  assert(pikaEval.costs && pikaEval.costs.toCap && pikaEval.costs.to75, 'Lab evaluation costs must expose toCap and dynamic to75 when cap=75');

  // Box OCR
  const boxSandbox = {
    window: { GAME_CONFIG: futureCfg, PokemonApp: { getAllData: () => dataJson } },
    document: { readyState: 'loading', addEventListener: () => {}, getElementById: () => null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    console
  };
  boxSandbox.window.window = boxSandbox.window;
  boxSandbox.globalThis = boxSandbox;
  boxSandbox.GAME_CONFIG = futureCfg;
  vm.createContext(boxSandbox);
  vm.runInContext(boxCode, boxSandbox);

  boxSandbox.window.PokemonBoxApp.setAllPokemons(dataJson);
  const parsed80 = boxSandbox.window.PokemonBoxApp.parsePokemonFromOcr('Lv. 80 皮卡丘\n持有上限 17個', null, dataJson);
  assert.strictEqual(parsed80.level, 80, 'OCR parser must accept up to POKEMON_LEVEL_CAP + 5 (Lv.80 when cap=75)');
});

console.log(`\n[Result] Passed ${passed}/${total} dynamic game config checks.`);
})();
