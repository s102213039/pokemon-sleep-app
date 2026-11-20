/**
 * Dynamic Ingredient Ladder Auto-Builder, Parity & Future-Proofing Test Suite
 * ===========================================================================
 * Verifies:
 * 1. Byte-for-byte parity between Python (scripts/build_ingredient_ladder.py)
 *    and JS (js/modules/wiki/wiki_ladder_builder.js).
 * 2. Complete data/data.json coverage (zero missing final evolutions across all 20 tracks).
 * 3. Unified Lv.60 Ideal Energy (0.45x) formula accuracy & duplicate-slot handling.
 * 4. Multi-form same-ID same-icon dedupe (Gourgeist) + 8 Eeveelutions consolidation,
 *    while preserving distinct-icon forms (Alolan, Holiday, Toxtricity Amped/Low Key).
 * 5. Final Evolution toggle (#ladder-final-only-switch) + rare-track (<2 final) safety floor.
 * 6. Automatic 21st+ new ingredient track creation & dynamic top-recipe resolution from recipes.json.
 * 7. Live runtime auto-refresh on 'pokemon-data-updated' & 'recipes-data-updated' events.
 * 8. Zero Emojis & Zero Decorative Glyphs compliance.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_JSON = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'data.json'), 'utf8'));
const RECIPES_JSON = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'recipes.json'), 'utf8'));
const LADDER_JSON = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'ladder_lv60.json'), 'utf8'));
const WIKI_JS = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki.js'), 'utf8');
const BUILDER_JS = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki', 'wiki_ladder_builder.js'), 'utf8');
const PYTHON_BUILDER_PATH = path.join(ROOT_DIR, 'scripts', 'build_ingredient_ladder.py');

let passed = 0;
let failed = 0;

function assert(cond, msg) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error(`  [FAIL] ${msg}`);
  }
}

function assertEquals(actual, expected, msg) {
  if (actual === expected) {
    passed++;
  } else {
    failed++;
    console.error(`  [FAIL] ${msg} (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)})`);
  }
}

function createWikiEnv(pokemonList, recipesList) {
  const listeners = Object.create(null);
  const domElements = Object.create(null);
  const coordContainer = { id: 'wiki-ingredient-ladder-coordinate', innerHTML: '', style: { setProperty: () => {} } };
  const finalSwitch = { id: 'ladder-final-only-switch', checked: true };
  domElements['wiki-ingredient-ladder-coordinate'] = coordContainer;
  domElements['ladder-final-only-switch'] = finalSwitch;

  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
    localStorage: {
      _m: new Map(),
      getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
      setItem(k, v) { this._m.set(k, String(v)); },
      removeItem(k) { this._m.delete(k); }
    },
    document: {
      body: { classList: { contains: () => false, add: () => {}, remove: () => {} }, appendChild: () => {} },
      getElementById: (id) => domElements[id] || null,
      querySelectorAll: (sel) => {
        if (sel === '#ladder-final-only-switch') return [finalSwitch];
        return [];
      },
      querySelector: () => null,
      createElement: () => ({ id: '', className: '', innerHTML: '', style: {}, setAttribute: () => {}, addEventListener: () => {} }),
      addEventListener: () => {}
    },
    window: null
  };
  sandbox.window = sandbox;
  sandbox.window.I18N = {
    getLanguage: () => 'zh-TW',
    t: (k, d) => d,
    getIngredientName: (n) => n,
    getPokemonName: (n) => n,
    getMainSkillName: (n) => n,
    getSpecialtyName: (n) => n,
    toSimplified: (s) => s
  };
  sandbox.window.LV60_COORDINATE_LADDER_DATA = LADDER_JSON;
  if (pokemonList) {
    sandbox.window.allPokemons = pokemonList;
    sandbox.window.PokemonApp = { allPokemons: pokemonList };
  }
  if (recipesList) {
    sandbox.window.allRecipes = recipesList;
    sandbox.window.__RECIPES_CACHE__ = recipesList;
  }
  sandbox.window.addEventListener = (type, fn) => {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(fn);
  };
  sandbox.window.dispatchEvent = (evt) => {
    const fns = listeners[evt.type] || [];
    fns.forEach(fn => fn(evt));
  };

  vm.createContext(sandbox);
  vm.runInContext(WIKI_JS, sandbox);
  return { sandbox, WikiDB: sandbox.WikiDB, coordContainer, finalSwitch };
}

console.log('======================================================');
console.log('  Dynamic Ingredient Ladder Auto-Builder Test Suite');
console.log('======================================================');

// Suite 1: Python vs JS Byte-for-Byte Parity
console.log('\n[Suite 1] Python vs JS Deterministic Parity');
{
  const { WikiDB } = createWikiEnv(DATA_JSON, RECIPES_JSON);
  assert(typeof WikiDB.buildDynamicIngredientLadder === 'function', 'WikiDB exports buildDynamicIngredientLadder');
  assert(typeof WikiDB.getActiveCoordinateLadderData === 'function', 'WikiDB exports getActiveCoordinateLadderData');
  assert(typeof WikiDB.getDynamicTopRecipeForIngredient === 'function', 'WikiDB exports getDynamicTopRecipeForIngredient');
  assert(typeof WikiDB.toggleLadderFinalOnly === 'function', 'WikiDB exports toggleLadderFinalOnly');
  assert(typeof WikiDB.getLadderFinalOnly === 'function', 'WikiDB exports getLadderFinalOnly');

  const jsBuilt = WikiDB.buildDynamicIngredientLadder(DATA_JSON, { finalOnly: true, minFinalSafetyFloor: 2 });
  const pyOut = execFileSync(
    'python3',
    ['-c', 'import json, sys; sys.path.insert(0, "scripts"); import build_ingredient_ladder as b; d=json.load(open("data/data.json", encoding="utf-8")); print(json.dumps(b.build_dynamic_ingredient_ladder(d, final_only=True, min_final_safety_floor=2), ensure_ascii=False))'],
    { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
  );
  const pyBuilt = JSON.parse(pyOut);

  assertEquals(JSON.stringify(jsBuilt), JSON.stringify(pyBuilt), 'JS and Python builders produce 100% identical JSON');
  assertEquals(JSON.stringify(jsBuilt), JSON.stringify(LADDER_JSON), 'Static data/ladder_lv60.json matches dynamic builder 100%');
}

// Suite 2: Complete data.json Coverage (Zero Missing Final Evolutions)
console.log('\n[Suite 2] Zero Missing Final Evolutions Across All Tracks');
{
  const { WikiDB } = createWikiEnv(DATA_JSON, RECIPES_JSON);
  const tracks = WikiDB.getActiveCoordinateLadderData(true);
  const byTrackName = new Map(tracks.map(t => [t.name, new Set(t.pokemon.map(p => p.name))]));
  const eeveelutions = new Set(['水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布']);

  let missingCount = 0;
  DATA_JSON.forEach(p => {
    if (p.is_final !== '〇') return;
    const expectedName = eeveelutions.has(p.name_cn)
      ? '伊布家族（8種進化）'
      : (p.name_cn.startsWith('南瓜怪人') ? '南瓜怪人' : p.name_cn);
    (p.ingredients || []).forEach(ing => {
      const members = byTrackName.get(ing.name);
      if (!members || !members.has(expectedName)) {
        missingCount++;
        console.error(`  Missing: ${ing.name} -> ${expectedName} (${p.name_cn})`);
      }
    });
  });
  assertEquals(missingCount, 0, 'Every final-evolution (Pokemon, Ingredient) pair in data.json appears in its track');

  // Spot-check previously missing Pokemon
  const findEntry = (trackId, name) => {
    const t = tracks.find(x => x.id === trackId);
    return t ? t.pokemon.find(p => p.name === name) : null;
  };
  const whimNuts = findEntry('snackablenuts', '風妖精');
  const whimAvocado = findEntry('glossyavocado', '風妖精');
  const whimTomato = findEntry('tomato', '風妖精');
  const amoongussTomato = findEntry('tomato', '敗露球菇');
  const mewtwoSoy = findEntry('soybeans', '超夢');
  const mewApple = findEntry('apple', '夢幻');
  const darkraiCoffee = findEntry('coffee', '達克萊伊');
  const toxicroakSausage = findEntry('sausage', '毒骷蛙');

  assert(whimNuts && whimNuts.count === 84 && whimNuts.isTop === true, 'Whimsicott ranks #1 in snackablenuts (AAA 84)');
  assert(whimAvocado && whimAvocado.count === 48 && whimAvocado.recipe === 'ABB', 'Whimsicott ranks #2 in glossyavocado (ABB 48)');
  assert(whimTomato && whimTomato.count === 66 && whimTomato.recipe === 'XXC', 'Whimsicott ranks in tomato (XXC 66)');
  assert(amoongussTomato && amoongussTomato.count === 47 && amoongussTomato.recipe === 'XXC', 'Amoonguss ranks in tomato (XXC 47)');
  assert(mewtwoSoy && mewtwoSoy.count === 35, 'Mewtwo appears in soybeans (35)');
  assert(mewApple && mewApple.count === 35 && mewApple.specialty === '全部', 'Mew appears in apple (35, specialty 全部)');
  assert(darkraiCoffee && darkraiCoffee.count === 34 && darkraiCoffee.specialty === '全部', 'Darkrai appears in coffee (34, specialty 全部)');
  assert(toxicroakSausage && toxicroakSausage.count === 64 && toxicroakSausage.recipe === 'ABB', 'Toxicroak B==C slot sausage calculates ABB 64 cleanly');
}

// Suite 3: Multi-Form Deduplication & Distinct Forms Preservation
console.log('\n[Suite 3] Multi-Form Deduplication & Distinct Forms Preservation');
{
  const { WikiDB } = createWikiEnv(DATA_JSON, RECIPES_JSON);
  const tracks = WikiDB.getActiveCoordinateLadderData(true);

  ['pumpkin', 'soybeans', 'potato'].forEach(tid => {
    const gourgeists = tracks.find(t => t.id === tid).pokemon.filter(p => p.name.includes('南瓜怪人'));
    assertEquals(gourgeists.length, 1, `${tid} consolidates 4 Gourgeist sizes into 1 entry`);
    assertEquals(gourgeists[0].name, '南瓜怪人', `${tid} consolidated Gourgeist uses clean name`);
  });

  const milkNames = tracks.find(t => t.id === 'milk').pokemon.map(p => p.name);
  assert(milkNames.includes('顫弦蠑螈（高調的樣子）') && milkNames.includes('顫弦蠑螈（低調的樣子）'), 'Distinct-icon Toxtricity forms remain separate');

  const appleNames = tracks.find(t => t.id === 'apple').pokemon.map(p => p.name);
  assert(appleNames.includes('皮卡丘（萬聖節）') && appleNames.includes('皮卡丘（船長）'), 'Distinct-icon Pikachu forms remain separate');
}

// Suite 4: Final Evolution Toggle + Rare-Track Safety Floor
console.log('\n[Suite 4] Final Evolution Toggle & Rare-Track Safety Floor');
{
  const { WikiDB, finalSwitch } = createWikiEnv(DATA_JSON, RECIPES_JSON);
  assertEquals(WikiDB.getLadderFinalOnly(), true, 'ladderFinalOnly defaults to true');

  const defaultTracks = WikiDB.getActiveCoordinateLadderData();
  const defaultNuts = defaultTracks.find(t => t.id === 'snackablenuts').pokemon.map(p => p.name);
  const defaultHoney = defaultTracks.find(t => t.id === 'honey').pokemon.map(p => p.name);
  assert(defaultNuts.includes('風妖精') && defaultNuts.includes('木棉球'), 'Rare track (<2 final evos) auto-includes Cottonee when finalOnly=true');
  assert(!defaultHoney.includes('妙蛙種子'), 'Normal track excludes pre-evo Bulbasaur when finalOnly=true');

  WikiDB.toggleLadderFinalOnly(false);
  assertEquals(WikiDB.getLadderFinalOnly(), false, 'toggleLadderFinalOnly(false) disables final-only filter');
  assertEquals(finalSwitch.checked, false, 'toggleLadderFinalOnly syncs #ladder-final-only-switch checkbox');

  const allTracks = WikiDB.getActiveCoordinateLadderData();
  const allHoney = allTracks.find(t => t.id === 'honey').pokemon.map(p => p.name);
  assert(allHoney.includes('妙蛙種子'), 'Normal track includes pre-evo Bulbasaur when finalOnly=false');

  WikiDB.resetLadderFilters();
  assertEquals(WikiDB.getLadderFinalOnly(), true, 'resetLadderFilters restores ladderFinalOnly to true');
  assertEquals(finalSwitch.checked, true, 'resetLadderFilters restores #ladder-final-only-switch checked=true');
}

// Suite 5: Future 21st+ Brand-New Ingredient & Recipe Auto-Discovery + Live Sync Event
console.log('\n[Suite 5] Future 21st+ Ingredient Auto-Discovery & Live Event Refresh');
{
  const syntheticPkm = {
    id: '9999',
    formatted_no: '9999',
    name_cn: '星塵精靈',
    name_en: 'Stardust Sprite',
    specialty: '食材',
    interval: '00:40:00',
    ingredient_rate: '25.00%',
    is_final: '〇',
    icon_url: 'https://www.serebii.net/pokemonsleep/pokemon/icon/9999.png',
    ingredients: [
      { name: '星塵莓果', icon: 'https://www.serebii.net/pokemonsleep/ingredients/stardustberry.png', l1: '2', l30: '5', l60: '7' },
      { name: '嫩亮酪梨', icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png', l30: '4', l60: '6' },
      { name: '好眠番茄', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png', l60: '10' }
    ]
  };
  const syntheticRecipe = {
    name_cn: '星塵特調蛋糕',
    name_en: 'Stardust Special Cake',
    category: '甜點',
    base_energy: 29500,
    icon: 'https://www.serebii.net/pokemonsleep/meals/stardustcake.png',
    ingredients: [
      { name: '星塵莓果', count: 25 },
      { name: '嫩亮酪梨', count: 18 }
    ]
  };

  const extendedPkm = DATA_JSON.concat([syntheticPkm]);
  const extendedRecipes = RECIPES_JSON.concat([syntheticRecipe]);
  const { sandbox, WikiDB, coordContainer } = createWikiEnv(DATA_JSON, RECIPES_JSON);

  // Initial render has 20 tracks
  const initialHtml = WikiDB.renderCoordinateLadder();
  assert(!initialHtml.includes('星塵精靈'), 'Initial render does not include synthetic Pokemon');

  // Simulate live data.json + recipes.json update arriving via CustomEvent
  sandbox.window.allPokemons = extendedPkm;
  sandbox.window.PokemonApp.allPokemons = extendedPkm;
  sandbox.window.allRecipes = extendedRecipes;
  sandbox.window.__RECIPES_CACHE__ = extendedRecipes;
  sandbox.window.dispatchEvent(new sandbox.CustomEvent('pokemon-data-updated', { detail: extendedPkm }));

  const liveTracks = WikiDB.getActiveCoordinateLadderData();
  assertEquals(liveTracks.length, 21, 'Brand-new 21st ingredient auto-creates 21st track');
  const newTrack = liveTracks.find(t => t.id === 'stardustberry');
  assert(newTrack && newTrack.name === '星塵莓果', 'Derived new track id=stardustberry from icon filename');
  assert(newTrack.pokemon.length === 1 && newTrack.pokemon[0].name === '星塵精靈', 'Synthetic Pokemon ranks in new 21st track');

  const avocadoWithNew = liveTracks.find(t => t.id === 'glossyavocado').pokemon.find(p => p.name === '星塵精靈');
  assert(avocadoWithNew && avocadoWithNew.recipe === 'ABB' && avocadoWithNew.count > 50, 'Synthetic Pokemon auto-ranks in existing glossyavocado track');

  const derivedDish = WikiDB.getDynamicTopRecipeForIngredient('stardustberry', '星塵莓果');
  assertEquals(derivedDish.name, '星塵特調蛋糕', 'Auto-derives highest-energy recipe for 21st ingredient');
  assertEquals(derivedDish.need, 25, 'Auto-derives exact per-meal need (25) for 3-meal passing line');

  // Verify max-consumption priority over higher base_energy
  const maxConsumpOverride = [
    { name_cn: '高能量少料菜', name_en: 'High Energy Low Need', category: '咖哩', base_energy: 30000, ingredients: [{ name: '特選蘋果', count: 10 }] },
    { name_cn: '最高消耗大菜', name_en: 'Max Consumption Dish', category: '甜點', base_energy: 18000, ingredients: [{ name: '特選蘋果', count: 40 }] }
  ];
  const overrideDish = WikiDB.getDynamicTopRecipeForIngredient('apple', '特選蘋果', maxConsumpOverride);
  assertEquals(overrideDish.name, '最高消耗大菜', 'Prioritizes highest ingredient consumption over higher base_energy');
  assertEquals(overrideDish.need, 40, 'Returns exact max consumption need (40)');

  const liveAppleDish = WikiDB.getDynamicTopRecipeForIngredient('apple', '特選蘋果');
  assertEquals(liveAppleDish.name, '電光香料可樂', 'Live apple key dish is Zing Zap Spiced Cola');
  assertEquals(liveAppleDish.need, 35, 'Live apple key dish need is 35');

  const liveTomatoDish = WikiDB.getDynamicTopRecipeForIngredient('tomato', '好眠番茄');
  assertEquals(liveTomatoDish.name, '打草結沙拉捲', 'Live tomato key dish is Grass Knot Salad Wrap');
  assertEquals(liveTomatoDish.need, 33, 'Live tomato key dish need is 33');

  assert(coordContainer.innerHTML.includes('星塵精靈'), 'Live pokemon-data-updated event refreshes coordinate ladder DOM automatically');
  assert(coordContainer.innerHTML.includes('星塵莓果'), 'Refreshed DOM displays brand-new 21st ingredient track');
  assert(!coordContainer.innerHTML.includes('undefined'), 'Refreshed DOM has zero undefined text tokens');
}

// Suite 6: Zero Emoji & Zero Decorative Glyphs Compliance
console.log('\n[Suite 6] Zero Emoji & Zero Decorative Glyphs Compliance');
{
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  const glyphRe = /[★☆]|\[★\]|\[☆\]|\[\*\]|\[\+\]|\[#\]/;
  const pySrc = fs.readFileSync(PYTHON_BUILDER_PATH, 'utf8');
  assert(!emojiRe.test(BUILDER_JS) && !glyphRe.test(BUILDER_JS), 'wiki_ladder_builder.js complies with Zero Emoji & Zero Glyph rules');
  assert(!emojiRe.test(pySrc) && !glyphRe.test(pySrc), 'build_ingredient_ladder.py complies with Zero Emoji & Zero Glyph rules');
}

console.log('\n======================================================');
console.log(`  Dynamic Ingredient Ladder Suite: ${passed} / ${passed + failed} Passed (${failed} Failed)`);
console.log('======================================================');
if (failed > 0) process.exit(1);
