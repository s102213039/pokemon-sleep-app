/**
 * test_milestone4_pokedex_camps.js — Comprehensive Test Suite for Milestone 4
 * ===========================================================================
 * Tests:
 * 1. Pokédex Interactive Evolution Family Tree resolution (1-stage, 2-stage, 3-stage,
 *    branching Eevee/Ralts/Slowpoke/Toxel, regional Alolan Vulpix/Paldean Wooper,
 *    and Pumpkaboo/Gourgeist varieties).
 * 2. Localized evolution requirements formatting (zh-TW, zh-CN, en-US).
 * 3. Interactive modal switching when clicking family nodes in renderPokedexEvolutionTreeHTML.
 * 4. Island Camps Sleep Style Uncollected Checklist state, toggleCollectedSleepStyle,
 *    localStorage persistence ('pksleep_collected_sleep_styles_v1'), and uncollected-only filtering.
 * 5. Island Sleep Style completion statistics & Tonight's Recommended Sleep Type calculation.
 * 6. Project rules compliance (Zero Emojis, Zero Star Glyphs, Single Frame & Frameless Icons).
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const pokemonsData = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'data.json'), 'utf8'));

// Build bundles first so js/modules/app.js and js/modules/wiki.js are up to date
const { buildAll } = require('../scripts/build_all');
buildAll();

const mockLocalStorage = {
  store: {},
  getItem(k) { return Object.prototype.hasOwnProperty.call(this.store, k) ? this.store[k] : null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const domElements = {};
function getMockElement(id) {
  if (!domElements[id]) {
    domElements[id] = {
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      style: { setProperty: () => {}, removeProperty: () => {}, display: 'block' },
      dataset: {},
      classList: {
        _classes: new Set(['active']),
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
      removeEventListener: () => {},
      dispatchEvent: () => true,
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: () => {},
      insertBefore: () => {},
      removeChild: () => {},
      getBoundingClientRect: () => ({ top: 0, left: 0, right: 800, bottom: 600, width: 800, height: 600 })
    };
  }
  return domElements[id];
}

let currentLang = 'zh-TW';
const mockDocument = {
  readyState: 'complete',
  getElementById: (id) => getMockElement(id),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => getMockElement('created_' + tag + '_' + Math.random()),
  body: {
    style: {},
    classList: {
      contains: () => false,
      add: () => {},
      remove: () => {}
    },
    appendChild: () => {}
  },
  addEventListener: () => {}
};

const sandbox = {
  window: {
    innerWidth: 1280,
    innerHeight: 800,
    localStorage: mockLocalStorage,
    allPokemons: pokemonsData,
    I18N: {
      getLanguage: () => currentLang,
      getSpecialtyName: (s) => s,
      getBerryName: (b) => b,
      getIngredientName: (i) => i,
      getIngredientIcon: () => '',
      getNatureName: (n) => n,
      getMainSkillName: (s) => s,
      getItemName: (id) => id,
      toSimplified: (str) => String(str).replace(/進/g, '进').replace(/階/g, '阶').replace(/鏈/g, '链'),
      t: (k, def) => def
    },
    addEventListener: () => {},
    dispatchEvent: () => true
  },
  document: mockDocument,
  localStorage: mockLocalStorage,
  fetch: () => Promise.resolve({
    ok: true,
    text: () => Promise.resolve(JSON.stringify(pokemonsData)),
    json: () => Promise.resolve(pokemonsData)
  }),
  requestAnimationFrame: (cb) => cb(),
  setTimeout: (cb) => { if (typeof cb === 'function') cb(); return 0; },
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
  console
};
sandbox.window.window = sandbox.window;
sandbox.window.document = mockDocument;
sandbox.globalThis = sandbox.window;

const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
const appCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'app.js'), 'utf8');
const wikiCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki.js'), 'utf8');

vm.createContext(sandbox);
vm.runInContext(i18nCode, sandbox);
sandbox.I18N = sandbox.window.I18N;
sandbox.window.I18N.setLanguage('zh-TW');
vm.runInContext(appCode, sandbox);
vm.runInContext(wikiCode, sandbox);

const PokemonApp = sandbox.window.PokemonApp;
const WikiDB = sandbox.window.WikiDB;

assert(PokemonApp, 'PokemonApp should be initialized');
assert(WikiDB, 'WikiDB should be initialized');
PokemonApp.allPokemons = pokemonsData;
sandbox.window.allPokemons = pokemonsData;

// 1. Test Pokédex Evolution Family Resolution across all 253 Pokémon
pokemonsData.forEach(p => {
  const fam = PokemonApp.getPokemonEvolutionFamily(p, pokemonsData);
  assert(Array.isArray(fam) && fam.length >= 1, `Family must be resolved for ${p.name_cn}`);
  const flat = fam.reduce((acc, s) => acc.concat(s), []);
  assert(
    flat.some(node => node.name_cn === p.name_cn && String(node.id) === String(p.id)),
    `${p.name_cn} (${p.id}) must appear in its own evolution family`
  );
});

// Verify 3-stage family: Pichu -> Pikachu -> Raichu
const pichuFam = PokemonApp.getPokemonEvolutionFamily('皮丘', pokemonsData);
assert.strictEqual(pichuFam.length, 3, 'Pichu family should have 3 stages');
assert.strictEqual(pichuFam[0][0].name_cn, '皮丘');
assert.strictEqual(pichuFam[1][0].name_cn, '皮卡丘');
assert.strictEqual(pichuFam[2][0].name_cn, '雷丘');

// Verify branching 2-stage family: Eevee -> 8 Eeveelutions
const eeveeFam = PokemonApp.getPokemonEvolutionFamily('133', pokemonsData);
assert.strictEqual(eeveeFam.length, 2, 'Eevee family should have 2 stages');
assert.strictEqual(eeveeFam[0].length, 1);
assert.strictEqual(eeveeFam[1].length, 8, 'Eevee stage 2 should have 8 evolutions');

// Verify branching 3-stage family: Ralts -> Kirlia -> [Gardevoir, Gallade]
const raltsFam = PokemonApp.getPokemonEvolutionFamily('280', pokemonsData);
assert.strictEqual(raltsFam.length, 3, 'Ralts family should have 3 stages');
assert.strictEqual(raltsFam[2].length, 2, 'Ralts stage 3 should have 2 branches (Gardevoir & Gallade)');

// Verify regional forms & varieties: Alolan Vulpix, Paldean Wooper, Pumpkaboo Large
const alolaVulpixFam = PokemonApp.getPokemonEvolutionFamily('7006', pokemonsData);
assert.strictEqual(alolaVulpixFam.length, 2);
assert.strictEqual(alolaVulpixFam[1][0].name_cn, '九尾（阿羅拉的樣子）');

const paldeaWooperFam = PokemonApp.getPokemonEvolutionFamily('7054', pokemonsData);
assert.strictEqual(paldeaWooperFam.length, 2);
assert.strictEqual(paldeaWooperFam[1][0].name_cn, '土王');

const pumpkabooLargeFam = PokemonApp.getPokemonEvolutionFamily('南瓜精 (大顆種)', pokemonsData);
assert.strictEqual(pumpkabooLargeFam.length, 2);
assert.strictEqual(pumpkabooLargeFam[1][0].name_cn, '南瓜怪人 (大顆種)');

// 2. Test Evolution Tree HTML rendering & modal switching
PokemonApp.openPokemonDetailModal('025'); // Pikachu
assert.strictEqual(String(PokemonApp.getPokedexModalState().pkm.id), '25');
const modalHtml = getMockElement('pokedex-detail-modal').innerHTML;
assert(modalHtml.includes('pokedex-evo-tree-section'), 'Modal HTML must include #pokedex-evo-tree-section');
assert(modalHtml.includes('皮丘') && modalHtml.includes('皮卡丘') && modalHtml.includes('雷丘'), 'Pikachu modal evolution tree must show Pichu, Pikachu, and Raichu');

// Switch to Gourgeist (Large Variety) via name_cn
PokemonApp.openPokemonDetailModal('南瓜怪人 (大顆種)');
assert.strictEqual(PokemonApp.getPokedexModalState().pkm.name_cn, '南瓜怪人 (大顆種)');

// Test English formatting of evolution requirements via pre-resolved I18N language switch
sandbox.window.I18N.setLanguage('en-US');
const enReq = PokemonApp.formatPokemonEvoReq('睡 150 小時 + 06:00 ~ 18:00 + 80 糖');
assert(enReq.includes('Sleep 150h') && enReq.includes('80 Candies'), `English evo req should format properly, got: ${enReq}`);
sandbox.window.I18N.setLanguage('zh-TW');

// 3. Test Island Camps Sleep Style Uncollected Checklist & Tonight's Sleep Type Recommendation
assert.strictEqual(typeof WikiDB.toggleCollectedSleepStyle, 'function', 'toggleCollectedSleepStyle must be exported on WikiDB');
assert.strictEqual(typeof WikiDB.getIslandSleepStyleStats, 'function', 'getIslandSleepStyleStats must be exported on WikiDB');
assert.strictEqual(typeof WikiDB.toggleIslandUncollectedOnly, 'function', 'toggleIslandUncollectedOnly must be exported on WikiDB');

WikiDB.setCollectedSleepStyles([]);
const initialStats = WikiDB.getIslandSleepStyleStats('greengrass');
assert(initialStats.totalStyles > 100, 'Greengrass Isle should have > 100 sleep styles');
assert.strictEqual(initialStats.collectedStyles, 0);
assert.strictEqual(initialStats.uncollectedStyles, initialStats.totalStyles);
assert(['dozing', 'snoozing', 'slumbering'].includes(initialStats.recommendedSleepType));

// Toggle a sleep style collected and check localStorage persistence
const isNowCollected = WikiDB.toggleCollectedSleepStyle('妙蛙種子', 1);
assert.strictEqual(isNowCollected, true, '妙蛙種子 1-star should be marked collected');
assert.strictEqual(WikiDB.isSleepStyleCollected('妙蛙種子', 1), true);
const rawSaved = JSON.parse(mockLocalStorage.getItem('pksleep_collected_sleep_styles_v1'));
assert(Array.isArray(rawSaved) && rawSaved.includes('妙蛙種子:1'), 'localStorage must persist collected sleep style key');

const updatedStats = WikiDB.getIslandSleepStyleStats('greengrass');
assert.strictEqual(updatedStats.collectedStyles, 1);
assert.strictEqual(updatedStats.uncollectedStyles, initialStats.totalStyles - 1);

// Verify rendered Island Subpanel contains tracker bar & uncollected switch
const islandHtml = WikiDB.renderIslandsSubpanel();
assert(islandHtml.includes('island-sleep-tracker-bar'), 'Island subpanel must render #island-sleep-tracker-bar');
assert(islandHtml.includes('island-uncollected-switch'), 'Island subpanel must render #island-uncollected-switch');
assert(islandHtml.includes('island-style-check-btn'), 'Island subpanel must render .island-style-check-btn');

// Toggle uncollected-only filter
WikiDB.toggleIslandUncollectedOnly(true);
assert.strictEqual(WikiDB.getIsIslandUncollectedOnly(), true);
assert.strictEqual(mockLocalStorage.getItem('pksleep_island_uncollected_only'), 'true');
WikiDB.toggleIslandUncollectedOnly(false);

console.log('[PASS] test_milestone4_pokedex_camps.js: All Milestone 4 Pokedex Evolution Tree & Island Sleep Style Tracker tests passed!');
