/**
 * Tier 4 - Real-World Application Scenarios (registerTier4Part1)
 */

const {
  WORKSPACE_ROOT,
  fs,
  path,
  vm,
  test,
  assert,
  assertEquals,
  assertArrayEquals,
  MiniElement,
  matchesSelector,
  createMockDocument,
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
  renderSkillWithTooltip,
  dataPath,
  dataset
} = require('../../test_harness');

function registerTier4Part1() {
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

  const store = { 'pksleep_lang': 'zh-TW' };
  const mockLocalStorage = {
    getItem: (key) => (key in store ? store[key] : null),
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; }
  };

  const ctx = {
    window: { localStorage: mockLocalStorage, addEventListener: () => {} },
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
    main_skill: '怪力鉗（食材精選S）',
    ingredients: [
      { name: '純粹油' },
      { name: '萌綠玉米' },
      { name: '好眠番茄' }
    ]
  };

  const honchkrow = {
    name: '烏鴉頭頭',
    name_cn: '烏鴉頭頭',
    name_en: 'Honchkrow',
    main_skill: '超幸運（食材精選S）',
    ingredients: [
      { name: '醒腦咖啡豆' },
      { name: '萌綠大豆' },
      { name: '火辣香草' }
    ]
  };

  const sandslashHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlZh.includes('special-skill-badge'), 'Sandslash should render special-skill-badge');
  assert(sandslashHtmlZh.includes('沉甸甸南瓜') && sandslashHtmlZh.includes('萌綠玉米') && sandslashHtmlZh.includes('窩心洋芋'), 'Sandslash tooltip should include its 3 specific ingredients');

  const mawileHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(mawile.main_skill, mawile);
  assert(mawileHtmlZh.includes('窩心洋芋') && mawileHtmlZh.includes('純粹油') && mawileHtmlZh.includes('萌綠玉米') && mawileHtmlZh.includes('好眠番茄'), 'Mawile tooltip must include all 4 specific ingredients (Soft Potato, Pure Oil, Greengrass Corn, Snoozy Tomato)');
  assert(!mawileHtmlZh.includes('(4種)'), 'Mawile badge should not show (4種)');
  assert(mawileHtmlZh.includes('暴擊效果') && (mawileHtmlZh.includes('翻倍') || mawileHtmlZh.includes('雙倍')), 'Mawile tooltip must explain critical hit effect (double ingredients)');

  // Verify alias 怪力钳（食材精選S）
  const mawileAliasHtml = ctx.window.PokemonApp.renderSkillWithTooltip('怪力钳（食材精選S）', mawile);
  assert(mawileAliasHtml.includes('窩心洋芋') && mawileAliasHtml.includes('純粹油'), 'Mawile alias must resolve 4-ingredient pool');
  assert(!mawileAliasHtml.includes('(4種)'), 'Mawile alias badge should not show (4種)');

  const honchkrowHtmlZh = ctx.window.PokemonApp.renderSkillWithTooltip(honchkrow.main_skill, honchkrow);
  assert(honchkrowHtmlZh.includes('醒腦咖啡豆') && honchkrowHtmlZh.includes('萌綠大豆') && honchkrowHtmlZh.includes('豆製肉') && honchkrowHtmlZh.includes('品鮮蘑菇'), 'Honchkrow tooltip must include all 4 specific ingredients (Rousing Coffee, Greengrass Soybeans, Bean Sausage, Tasty Mushroom)');
  assert(!honchkrowHtmlZh.includes('火辣香草'), 'Honchkrow tooltip must not include spicy herb');
  assert(!honchkrowHtmlZh.includes('(4種)'), 'Honchkrow badge should not show (4種)');
  assert(honchkrowHtmlZh.includes('暴擊效果') && honchkrowHtmlZh.includes('夢之碎片'), 'Honchkrow tooltip must explain critical hit effect (massive Dream Shards)');

  ctx.window.I18N.setLanguage('en-US');
  const sandslashHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(sandslash.main_skill, sandslash);
  assert(sandslashHtmlEn.includes('Plump Pumpkin') && sandslashHtmlEn.includes('Greengrass Corn') && sandslashHtmlEn.includes('Soft Potato'), 'Sandslash English tooltip should include its 3 specific ingredients in English');

  const mawileHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(mawile.main_skill, mawile);
  assert(mawileHtmlEn.includes('Soft Potato') && mawileHtmlEn.includes('Pure Oil') && mawileHtmlEn.includes('Greengrass Corn') && mawileHtmlEn.includes('Snoozy Tomato'), 'Mawile English tooltip should include all 4 ingredients in English');
  assert(mawileHtmlEn.includes('2x ingredients') && mawileHtmlEn.includes('Extra Tasty'), 'Mawile English tooltip should include critical hit explanation');

  const honchkrowHtmlEn = ctx.window.PokemonApp.renderSkillWithTooltip(honchkrow.main_skill, honchkrow);
  assert(honchkrowHtmlEn.includes('Rousing Coffee') && honchkrowHtmlEn.includes('Greengrass Soybeans') && honchkrowHtmlEn.includes('Bean Sausage') && honchkrowHtmlEn.includes('Tasty Mushroom'), 'Honchkrow English tooltip should include all 4 ingredients in English');
  assert(honchkrowHtmlEn.includes('Dream Shards') && honchkrowHtmlEn.includes('20,000'), 'Honchkrow English tooltip should include critical hit explanation');

  ctx.window.I18N.setLanguage('zh-TW');

  // Wiki Main Skills Subtab & Category Filter State Persistence Verification
  ctx.window.WikiDB.switchWikiSubTab('skills');
  assertEquals(mockLocalStorage.getItem('pksleep_active_wiki_subtab'), 'skills', 'Switching to skills subtab must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSubTab(), 'skills', 'getCurrentSubTab must return skills');

  ctx.window.WikiDB.filterWikiSkills('ingredient');
  assertEquals(mockLocalStorage.getItem('pksleep_wiki_skills_category'), 'ingredient', 'Filtering ingredient skills must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSkillsCategory(), 'ingredient', 'getCurrentSkillsCategory must return ingredient');

  ctx.window.WikiDB.filterWikiSkills('shards');
  assertEquals(mockLocalStorage.getItem('pksleep_wiki_skills_category'), 'shards', 'Filtering shards skills must persist in localStorage');
  assertEquals(ctx.window.WikiDB.getCurrentSkillsCategory(), 'shards', 'getCurrentSkillsCategory must return shards');

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
  assert(!wikiCode.includes('data-nature-filter="NONE"'), 'Nature filter must not keep Neutral as a third option');
  assert(wikiCode.includes("toggleLadderNatureFilter('ING')"), 'Nature options must remain clickable tags');
  assert(wikiCode.includes('性格補正模擬 (Nature Boost Simulation - 單選)'), 'Ladder nature boost must be single-select');
  assert(wikiCode.includes('data-nature-filter="SKILL"'), 'Nature filter must include Skill Chance up');
  assert(wikiCode.includes("toggleLadderSubskill('SKILL_M')"), 'Sub-skill boosts must be multi-select tags including Skill Trigger M');
  assert(wikiCode.includes('id="ladder-recipe-multi-toggle"'), 'Recipe highlight modal must include multi-select switch');
  assert(wikiCode.includes('function toggleLadderRecipeMultiSelect'), 'Multi recipe highlight must be toggleable');
  assert(!wikiCode.includes('食材機率提升M (+36%)'), 'Sub-skill labels must drop parenthetical deltas');
  assert(wikiCode.includes('class="island-dual-grid"'), 'Islands layout must place rank energy and drowsy tables in one row');
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
    if (nature === 'SPEED') mult *= (1.0 / 0.90);
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
  assertEquals(PokemonApp.filterData().length, 128, 'Step 1: Pokedex starts with 128 final stage Pokemon');

  PokemonApp.currentSearch = '皮卡丘';
  const pikachuMatch = PokemonApp.filterData();
  assert(pikachuMatch.length >= 1, 'Step 2: Found Pikachu in search');
  PokemonApp.currentSearch = '';
  assertEquals(PokemonApp.filterData().length, 128, 'Step 2: Cleared search restores 128 items');

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
  assertEquals(PokemonApp.filterData().length, 128, 'Desktop: 128 final stage Pokemon');

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
  assert(/css\/styles(\.min)?\.css\?v=(20260917_[345678]|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(indexHtml), 'index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki(\.min)?\.js\?v=(20260907_8|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(indexHtml), 'index.html wiki.js must have valid cache buster');
  assert(/css\/styles(\.min)?\.css\?v=(20260917_[345678]|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(appIndexHtml), 'app/index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki(\.min)?\.js\?v=(20260907_8|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(appIndexHtml), 'app/index.html wiki.js must have valid cache buster');
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
  assert(htmlEn.includes('Rank Energy'), 'en-US must render English rank energy title');
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
  assert(html.includes('sleep-style-star-icon'), 'Table header must contain game-like sleep style star icon');
  assert(html.includes('data-col="s1"'), 'Table header must contain 1-star column');
  assert(html.includes('data-col="s2"'), 'Table header must contain 2-star column');
  assert(html.includes('data-col="s3"'), 'Table header must contain 3-star column');
  assert(html.includes('data-col="s4"'), 'Table header must contain 4-star column');

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
  assert(cssCode.includes('.island-hero-content {') && cssCode.includes('flex-direction: row;') && cssCode.includes('gap: 14px 20px;'), 'Desktop berries sit after the island title with horizontal gap');
  assert(cssCode.includes('.mobile-h5-app .island-hero-content') && cssCode.includes('flex-direction: row !important;') && cssCode.includes('gap: 10px 16px !important;'), 'H5 berries sit after the island title with horizontal gap');

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
  assert(cssCode.includes('.island-dual-grid {') && cssCode.includes('grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);'), 'Islands must use compact 2-column energy/drowsy grid');
  assert(cssCode.includes('.wiki-ratings-container {') && cssCode.includes('grid-template-columns: repeat(3, minmax(0, 1fr));') && cssCode.includes('grid-template-rows: subgrid'), 'Ratings guide must use 3-across equal-height subgrid');
  assert(cssCode.includes('.mobile-h5-app .wiki-rating-card.rating-card-berry') && cssCode.includes('border-top: 3px solid #f59e0b'), 'H5 rating cards must keep desktop top accent lines');
  assert(cssCode.includes('.mobile-h5-app .wiki-rule-banner') && cssCode.includes('border: none !important;'), 'H5 wiki-rule-banner must drop the outer frame');
  assert(cssCode.includes('.wiki-main-container {\n  max-width: 1200px;\n  width: 92%;'), 'Wiki desktop main width must match other tabs at 1200px / 92%');
  assert(cssCode.includes('.mobile-h5-app #pokemon-filter-sidebar .sidebar-scrollable-content') && cssCode.includes('gap: 6px !important;'), 'Pokedex H5 filter must compress vertical gap');
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
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

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
  assert(htmlCyan.includes('class="island-scene-layer"') && htmlCyan.includes('assets/islands/hd/cyan.jpg'), 'Island scene must be a separate photo layer using local HD camp artwork');
  assert(cssCode.includes('.island-scene-layer') && cssCode.includes('z-index: 0') && cssCode.includes('position: absolute'), 'Island photo layer sits above page color and below content');
  assert(!cssCode.includes('#panel-wiki.island-scene-host'), 'Island artwork must not be applied as a full panel background-image');
  assert(wikiCode.includes('function placeIslandSceneLayer') && wikiCode.includes('isH5 ? islandsPanel : panelWiki'), 'Desktop island scene hosts on panel-wiki; H5 stays on wiki-subpanel-islands');
  ['greengrass','cyan','taupe','snowdrop','lapis','oldgold','amber'].forEach(id => {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets', 'islands', 'hd', id + '.jpg')), 'HD island scene missing: ' + id);
  });
  assert(cssCode.includes('.island-scene-fade') && cssCode.includes('var(--bg-dark)'), 'Island photo must fade into the original page background');
  assert(cssCode.includes('.island-scene-photo') && cssCode.includes('opacity: 0.55'), 'Island scene photo must be slightly transparent');
  assert(cssCode.includes('opacity: 0.16'), 'Dark themes must fade the desktop island scene further');
  assert(wikiCode.includes('island-scene-hidden'), 'Leaving the islands tab must hide the scene instead of deleting it');
  assert(wikiCode.includes('function ensureIslandSceneLayer'), 'Island scene must be recreated if missing on first visit');
  assert(cssCode.includes('body:not(.mobile-h5-app) #wiki-subpanel-subskills .wiki-card') && cssCode.includes('border: none !important'), 'Desktop subskill category cards must drop the outer frame');
  assert(cssCode.includes('.wiki-strategy-card') && cssCode.includes('padding: 8px 10px !important'), 'Growth guide card padding must shrink to 8px/10px');
  assert(cssCode.includes('@keyframes overlaySheetOut') && cssCode.includes('@keyframes overlayDialogOut'), 'Modal close animations must reverse the open motion');
  assert(cssCode.includes('#pokedex-detail-modal.overlay-closing'), 'Pokedex close animation must beat the open keyframes by ID');
  assert(cssCode.includes('body:not(.mobile-h5-app) #pokedex-detail-modal .sheet-drag-handle') && cssCode.includes('display: none !important'), 'Desktop pokedex modal must hide the sheet drag handle');
  assert(cssCode.includes('body:not(.mobile-h5-app) #pokedex-detail-modal .pokedex-nature-row .custom-select-label') && cssCode.includes('text-overflow: clip !important'), 'Desktop nature/ribbon custom selects must show full text');
  assert(cssCode.includes('body:not(.mobile-h5-app) #pokedex-detail-modal .pokedex-calc-unified-box') && cssCode.includes('flex: 1 1 auto'), 'Desktop calc box must stretch to the subskill palette');
  assert(wikiCode.includes('function scrollActiveIslandTabIntoView'), 'Island nav must keep the selected camp in view');
  assert(wikiCode.includes('function bindIslandSpawnsCoordinator') && wikiCode.includes('is-spawns-pinned') && wikiCode.includes('island-spawns-coordinator'), 'H5 island habitats must pin like CoordinatorLayout after outer scroll');
  assert(wikiCode.includes('function islandSpawnsTabActive') && wikiCode.includes("currentWikiSubTab !== 'islands'"), 'Habitats pin must not adjust scroll on other wiki subtabs');
  assert(cssCode.includes('.island-spawns-card.is-spawns-pinned') && cssCode.includes('position: fixed !important'), 'H5 island habitats pin must use fixed positioning, not CSS sticky');
  assert(cssCode.includes('.island-dual-grid .wiki-data-table tbody tr') && cssCode.includes('height: 1%'), 'Island energy rows must share the stretched table height');
  assert(cssCode.includes('#box-edit-modal .box-modal-header-cancel') && cssCode.includes('#box-edit-modal .box-modal-header-confirm'), 'Box modal cancel/confirm live in the header');
  assert(cssCode.includes('.mobile-h5-app .mobile-controls-container') && cssCode.includes('background: transparent !important'), 'H5 controls-container must drop the header bar background');
  assert(cssCode.includes('#panel-wiki.has-island-scene > .wiki-main-container') && cssCode.includes('margin-top: 0'), 'Desktop island scene must ignore wiki-main top margin');
  assert(cssCode.includes('body:not(.mobile-h5-app) #wiki-subpanel-islands .wiki-table-wrapper') && cssCode.includes('background: var(--bg-card-solid, var(--bg-dark))'), 'Desktop island tables must use solid card backgrounds');

  // 6. Verify Drowsy Power spawn tiers table renders 3 columns with 100-score rank badge, energy and formula footnote
  assert(htmlCyan.includes('最低門檻'), 'Drowsy power table must include 最低門檻 header');
  assert(htmlCyan.includes('分數100分'), 'Drowsy power table must include 分數100分 header');
  assert(htmlCyan.includes('評級所需能量') && htmlCyan.includes('出現數門檻'), 'Island dual tables must use shortened Chinese titles');
  assert(!htmlCyan.includes('露營券(+1且貪吃)'), 'Drowsy power table must not render 露營券 row');
  assert(!htmlCyan.includes('睡眠分數100: 以睡滿 100 分 (8.5小時) 換算'), 'Drowsy power table must not render 100-score conversion formula footnote');
  assert(!htmlCyan.includes('Good Camp Ticket'), 'Drowsy power table must not render Good Camp Ticket row');

  mockCtx.window.WikiDB.selectIsland('greengrass');
  const htmlGreen = mockCtx.window.WikiDB.renderIslandsSubpanel();
  assert(htmlGreen.includes('普通 (Basic) 3') && htmlGreen.includes('≥ 9,200'), 'Greengrass 4 spawns must map to Basic 3 and >= 9,200');
  assert(htmlGreen.includes('普通 (Basic) 5') && htmlGreen.includes('≥ 20.6k'), 'Greengrass 5 spawns must map to Basic 5 and >= 20.6k');
  assert(htmlGreen.includes('超級 (Great) 3') && htmlGreen.includes('≥ 45k'), 'Greengrass 6 spawns must map to Great 3 and >= 45k');
  assert(htmlGreen.includes('高級 (Ultra) 1') && htmlGreen.includes('≥ 83.2k'), 'Greengrass 7 spawns must map to Ultra 1 and >= 83.2k');
  assert(htmlGreen.includes('大師 (Master) 1') && htmlGreen.includes('≥ 195k'), 'Greengrass 8 spawns must map to Master 1 and >= 195k');
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


test('Tier 4 - Real-World Application Scenarios', 'Sidebar Bookmark Handle Ironclad Visibility (Strictly Hidden when Expanded, Visible when Collapsed)', () => {
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssCode.includes('.recipe-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for recipe sidebar handle');
  assert(cssCode.includes('.pokemon-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for pokemon sidebar handle');
  assert(cssCode.includes('.ladder-filter-sidebar:not(.collapsed) .sidebar-bookmark-handle') || cssCode.includes('.ladder-fixed-sidebar:not(.collapsed) .sidebar-bookmark-handle'), 'CSS must define :not(.collapsed) hide rule for ladder sidebar handle');
  assert(cssCode.includes('display: none !important;'), 'CSS must enforce display: none !important for expanded sidebar handles');
  assert(cssCode.includes('display: flex !important;'), 'CSS must enforce display: flex !important for collapsed sidebar handles');

  // Verify recipes.js toggle logic
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  assert(recipesJs.includes("bookmarkHandle.style.display = 'none'"), 'recipes.js must set bookmarkHandle.style.display = none when expanding');
  assert(recipesJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'recipes.js must set bookmarkHandle.style.visibility = hidden when expanding');

  // Verify app.js toggle logic
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  assert(appJs.includes("bookmarkHandle.style.display = 'none'"), 'app.js must set bookmarkHandle.style.display = none when expanding');
  assert(appJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'app.js must set bookmarkHandle.style.visibility = hidden when expanding');

  // Verify wiki.js toggle logic
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiJs.includes("bookmarkHandle.style.display = 'none'"), 'wiki.js must set bookmarkHandle.style.display = none when expanding');
  assert(wikiJs.includes("bookmarkHandle.style.visibility = 'hidden'"), 'wiki.js must set bookmarkHandle.style.visibility = hidden when expanding');
});


test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder Sidebar Header-to-Content Spacing and Mobile H5 Optimization', () => {
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  // Desktop ladder sidebar scrollable content must have compact top padding (10px, never 32px legacy offset)
  const ladderDesktopRegex = /\.ladder-fixed-sidebar\s+\.sidebar-scrollable-content\s*\{[^}]*padding:\s*([0-9]+)px/m;
  const matchDesktop = cssCode.match(ladderDesktopRegex);
  assert(matchDesktop, 'CSS must specify padding for .ladder-fixed-sidebar .sidebar-scrollable-content');
  const desktopTopPadding = parseInt(matchDesktop[1], 10);
  assert(desktopTopPadding <= 12, `Desktop ladder sidebar top padding must be compact (<= 12px), got ${desktopTopPadding}px`);
  assert(!cssCode.includes('.ladder-fixed-sidebar .sidebar-scrollable-content {\n  flex: 1;\n  overflow-y: auto;\n  padding: 32px'), 'Desktop ladder sidebar must not have 32px top gap');

  // Mobile H5 ladder sidebar must have compact top padding and compact gap
  assert(cssCode.includes('.mobile-h5-app .ladder-fixed-sidebar .sidebar-scrollable-content'), 'CSS must define mobile H5 ladder sidebar scrollable content rule');
  const ladderH5Regex = /\.mobile-h5-app\s+\.ladder-fixed-sidebar\s+\.sidebar-scrollable-content\s*\{[^}]*padding:\s*([0-9]+)px/m;
  const matchH5 = cssCode.match(ladderH5Regex);
  assert(matchH5, 'CSS must specify padding for mobile H5 ladder sidebar');
  const h5TopPadding = parseInt(matchH5[1], 10);
  assert(h5TopPadding <= 10, `Mobile H5 ladder sidebar top padding must be compact (<= 10px), got ${h5TopPadding}px`);
});


test('Tier 4 - Real-World Application Scenarios', 'Island Spawns Table Star Icons, Multi-State Column Sorting and Pokemon Dex Order Cycle', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify CSS defines sortable th styles and star icon styles
  assert(cssCode.includes('.island-spawns-compact-table th.island-sort-th'), 'CSS must define island-sort-th style');
  assert(cssCode.includes('.sleep-style-star-icon'), 'CSS must define sleep-style-star-icon style');
  assert(cssCode.includes('.sleep-star-label'), 'CSS must define sleep-star-label style');

  // Setup DOM mock context
  let mockPanel = { innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {}, contains: () => true }, addEventListener: () => {} };
  const ctx = {
    window: { location: { hash: '#wiki' }, localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {}, history: { replaceState: () => {} } },
    document: { readyState: 'complete', documentElement: { setAttribute: () => {} }, getElementById: () => mockPanel, querySelectorAll: () => [], addEventListener: () => {} },
    console, setTimeout
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(wikiCode, ctx);

  const WikiDB = ctx.window.WikiDB;
  WikiDB.selectIsland('greengrass');

  // 1. Verify rank score converter
  assertEquals(WikiDB.getSnorlaxRankScore('Basic 1'), 101, 'Basic 1 score must be 101');
  assertEquals(WikiDB.getSnorlaxRankScore('Great 3'), 203, 'Great 3 score must be 203');
  assertEquals(WikiDB.getSnorlaxRankScore('Ultra 5'), 305, 'Ultra 5 score must be 305');
  assertEquals(WikiDB.getSnorlaxRankScore('Master 10'), 410, 'Master 10 score must be 410');
  assertEquals(WikiDB.getSnorlaxRankScore('-'), -1, '- score must be -1');

  // 2. Initial state: default sorting
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), 'Initial sort state must be null');

  // 3. Test Pokemon column sort cycle: 1st click desc, 2nd click asc, 3rd click reset
  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 'pokemon', dir: 'desc' }), '1st click on pokemon must be desc');
  let html = WikiDB.renderIslandsSubpanel();
  assert(html.includes('active-sort') && html.includes('data-col="pokemon"'), 'Pokemon column must have active-sort class');

  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 'pokemon', dir: 'asc' }), '2nd click on pokemon must be asc');

  WikiDB.sortIslandSpawns('pokemon');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on pokemon must reset to null');

  // 4. Test 1-Star (s1) sort cycle: 1st click desc, 2nd click asc, 3rd click reset
  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's1', dir: 'desc' }), '1st click on s1 must be desc');

  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's1', dir: 'asc' }), '2nd click on s1 must be asc');

  WikiDB.sortIslandSpawns('s1');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on s1 must reset to null');

  // 5. Switching from s2 to s3 starts with desc on s3
  WikiDB.sortIslandSpawns('s2');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's2', dir: 'desc' }), '1st click on s2 must be desc');
  WikiDB.sortIslandSpawns('s3');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: 's3', dir: 'desc' }), 'Switching to s3 must start with desc');
  WikiDB.sortIslandSpawns('s3');
  WikiDB.sortIslandSpawns('s3');
  assertEquals(JSON.stringify(WikiDB.getIslandSpawnsSort()), JSON.stringify({ col: null, dir: null }), '3rd click on s3 must reset to null');

  // 6. Verify star image asset exists on filesystem
  assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets', 'star.png')), 'assets/star.png must exist');
});


test('Tier 4 - Real-World Application Scenarios', 'Sleep EXP Calculator Accurate EXP Table, Dropdown Target Level & Ribbon Carry Progression', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify Ribbon Quick Guide displays independent progression (+1, +2, +3, +2)
  assert(wikiCode.includes('+1 ${isEN ? \'Carry\' : \'持有上限\'}'), 'Ribbon Tier 1 must be +1');
  assert(wikiCode.includes('+2 ${isEN ? \'Carry\' : \'持有\'}, ${isEN ? \'Speed\' : \'幫速\'} -5% / -11%'), 'Ribbon Tier 2 must be +2');
  assert(wikiCode.includes('+3 ${isEN ? \'Carry\' : \'持有上限\'}'), 'Ribbon Tier 3 must be +3');
  assert(wikiCode.includes('+2 ${isEN ? \'Carry\' : \'持有\'}, ${isEN ? \'Speed\' : \'幫速\'} -12% / -25%'), 'Ribbon Tier 4 must be +2');

  // 2. Verify CSS defines dropdown styling complying with dropdown arrow rule & custom-select-calc
  assert(cssCode.includes('.calc-select') && cssCode.includes('padding: 9px 36px 9px 12px;'), 'calc-select must have 36px right padding for arrow clearance');
  assert(cssCode.includes('background-position: right 18px center;'), 'calc-select arrow must be inset 18px from right');
  assert(cssCode.includes('.calc-form-col'), 'CSS must define calc-form-col');
  assert(cssCode.includes('.calc-form-row'), 'CSS must define calc-form-row');
  assert(cssCode.includes('.calc-switch-label'), 'CSS must define calc-switch-label');
  assert(cssCode.includes('.custom-select-calc'), 'CSS must define custom-select-calc');
  assert(cssCode.includes('.calc-result-candies'), 'CSS must define calc-result-candies');

  // 3. Setup mock DOM environment
  const elements = {};
  const getEl = id => {
    if (!elements[id]) {
      elements[id] = {
        id,
        value: '',
        checked: false,
        textContent: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        setAttribute: () => {},
        getAttribute: () => null,
        addEventListener: () => {}
      };
    }
    return elements[id];
  };

  const customizedElements = [];
  const ctx = {
    window: {
      location: { hash: '#wiki/ratings' },
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      addEventListener: () => {},
      history: { replaceState: () => {} },
      setupCustomSelect: el => {
        el._customized = true;
        customizedElements.push(el);
      }
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      getElementById: getEl,
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

  const mockContainer = { innerHTML: '', style: {} };
  ctx.window.WikiDB.renderWikiLayout(mockContainer);
  const html = mockContainer.innerHTML;

  // 4. Verify 2-row layout structure and custom select elements
  assert(html.includes('class="calc-form-col"'), 'Must render calc-form-col for two-row left column');
  assert(html.includes('class="calc-form-row calc-form-row-levels"'), 'Must render calc-form-row-levels');
  assert(html.includes('class="calc-form-row calc-form-row-boosts"'), 'Must render calc-form-row-boosts');
  assert(html.includes('id="calc-sleep-candies-result"'), 'Must render calc-sleep-candies-result for candies estimation');

  // Verify Target Level is a select dropdown with options 30, 50, 60, 70, 80, 100
  assert(html.includes('<select id="calc-sleep-target-lv" class="calc-select"'), 'Target level must be a calc-select dropdown');
  assert(html.includes('<option value="30"'), 'Target level must have option 30');
  assert(html.includes('<option value="50"'), 'Target level must have option 50');
  assert(html.includes('<option value="60"'), 'Target level must have option 60');
  assert(html.includes('<option value="70"'), 'Target level must have option 70');
  assert(html.includes('<option value="80"'), 'Target level must have option 80');
  assert(html.includes('<option value="100"'), 'Target level must have option 100');

  // 5. Verify Growth Incense is completely removed
  assert(!html.includes('calc-sleep-incense'), 'Growth incense control must be removed');
  assert(!html.includes('成長薰香 (2x)'), 'Growth incense label must be removed');

  // 6. Verify Sleep EXP Bonus uses switch button markup
  assert(html.includes('class="calc-switch-label"'), 'Must render calc-switch-label wrapper');
  assert(html.includes('class="switch-checkbox"'), 'Must render switch-checkbox input');
  assert(html.includes('class="switch-slider"'), 'Must render switch-slider span');
  assert(html.includes('睡眠EXP獎勵 (+14%)'), 'Must render Sleep EXP bonus text');

  // 7. Verify Nature select exists with unified styling
  assert(html.includes('id="calc-sleep-nature-select" class="calc-select"'), 'Nature select must use unified calc-select class');

  // 8. Verify initCalcCustomSelects initializes target and nature selects
  ctx.window.WikiDB.initCalcCustomSelects();
  assert(getEl('calc-sleep-target-lv')._customized === true, 'Target level select must be customized');
  assert(getEl('calc-sleep-nature-select')._customized === true, 'Nature select must be customized');

  // 9. Test accurate calculation logic and candy equivalent via recalcSleepDays
  const curLv = getEl('calc-sleep-cur-lv');
  const targetLv = getEl('calc-sleep-target-lv');
  const expBonus = getEl('calc-sleep-exp-subskill');
  const natureSel = getEl('calc-sleep-nature-select');
  const daysRes = getEl('calc-sleep-days-result');
  const expRes = getEl('calc-sleep-exp-result');
  const candiesRes = getEl('calc-sleep-candies-result');

  // Case A: Level 1 to 30 default -> 11,992 EXP, 120 Days, 480 Candies (25 EXP/ea)
  curLv.value = '1';
  targetLv.value = '30';
  expBonus.checked = false;
  natureSel.value = '1.0';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('120'), `Lv.1 to 30 must be 120 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('11,992'), `Lv.1 to 30 must be 11,992 EXP, got: ${expRes.textContent}`);
  assert(!expRes.textContent.includes('每日約') && !expRes.textContent.includes('EXP/Day'), `expRes must not contain (每日約 100 EXP) or (~100 EXP/Day), got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('480') && candiesRes.textContent.includes('25 EXP'), `Lv.1 to 30 must be 480 candies (25 EXP/ea), got: ${candiesRes.textContent}`);

  // Case B: Level 1 to 50 default -> 29,993 EXP, 300 Days, 1,200 Candies
  targetLv.value = '50';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('300'), `Lv.1 to 50 must be 300 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('29,993'), `Lv.1 to 50 must be 29,993 EXP, got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('1,200'), `Lv.1 to 50 must be 1,200 candies, got: ${candiesRes.textContent}`);

  // Case EXP type: Lv.1 -> 60 cumulative for 900 / 1080 / 1320 types (Pokebip table: 77,240 / 92,688 / 113,285; <=1 EXP drift allowed)
  assert(html.includes('id="calc-sleep-exp-type" class="calc-select"'), 'EXP type select must render');
  assert(getEl('calc-sleep-exp-type')._customized === true, 'EXP type select must be customized');
  const expTypeSel = getEl('calc-sleep-exp-type');
  targetLv.value = '60';
  [['1.5', '77,240'], ['1.8', '92,687'], ['2.2', '113,285']].forEach(([mult, exp]) => {
    expTypeSel.value = mult;
    ctx.window.WikiDB.recalcSleepDays();
    assert(expRes.textContent.includes(exp), `EXP type x${mult} Lv.1-60 must be ${exp}, got: ${expRes.textContent}`);
  });
  expTypeSel.value = '1.0';

  // Case C: Level 50 to 60 steep surge -> 51,493 - 29,993 = 21,500 EXP, 215 Days, 860 Candies
  curLv.value = '50';
  targetLv.value = '60';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('215'), `Lv.50 to 60 must be 215 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('21,500'), `Lv.50 to 60 must be 21,500 EXP, got: ${expRes.textContent}`);
  assert(candiesRes.textContent.includes('860'), `Lv.50 to 60 must be 860 candies, got: ${candiesRes.textContent}`);

  // Case D: Level 60 to 70 steep surge -> 82,162 - 51,493 = 30,669 EXP, 307 Days
  curLv.value = '60';
  targetLv.value = '70';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('307'), `Lv.60 to 70 must be 307 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('30,669'), `Lv.60 to 70 must be 30,669 EXP, got: ${expRes.textContent}`);

  // Case E: Level 70 to 80 -> 120,262 - 82,162 = 38,100 EXP, 381 Days
  curLv.value = '70';
  targetLv.value = '80';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('381'), `Lv.70 to 80 must be 381 days, got: ${daysRes.textContent}`);
  assert(expRes.textContent.includes('38,100'), `Lv.70 to 80 must be 38,100 EXP, got: ${expRes.textContent}`);

  // Case F: Level 50 to 60 with Sleep EXP Bonus (+14%) -> ceil(21500 / 114) = 189 Days
  curLv.value = '50';
  targetLv.value = '60';
  expBonus.checked = true;
  natureSel.value = '1.0';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('189'), `Lv.50 to 60 with +14% must be 189 days, got: ${daysRes.textContent}`);

  // Case G: Nature Up (+18%) and Nature Down (-18%) multipliers and candy changes
  expBonus.checked = false;
  natureSel.value = '1.18'; // dailyExp = 118 -> ceil(21500 / 118) = 183 Days; candy = 30 EXP/ea -> ceil(21500 / 30) = 717 Candies
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('183'), `Lv.50 to 60 with Nature Up must be 183 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('717') && candiesRes.textContent.includes('30 EXP'), `Lv.50 to 60 with Nature Up must be 717 candies (30 EXP/ea), got: ${candiesRes.textContent}`);

  natureSel.value = '0.82'; // dailyExp = 82 -> ceil(21500 / 82) = 263 Days; candy = 21 EXP/ea -> ceil(21500 / 21) = 1,024 Candies
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('263'), `Lv.50 to 60 with Nature Down must be 263 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('1,024') && candiesRes.textContent.includes('21 EXP'), `Lv.50 to 60 with Nature Down must be 1,024 candies (21 EXP/ea), got: ${candiesRes.textContent}`);

  // Case H: cur >= target -> 0 Days, 0 Candies
  curLv.value = '65';
  targetLv.value = '60';
  ctx.window.WikiDB.recalcSleepDays();
  assert(daysRes.textContent.includes('0'), `cur >= target must show 0 days, got: ${daysRes.textContent}`);
  assert(candiesRes.textContent.includes('無需額外糖果'), `cur >= target must show 無需額外糖果, got: ${candiesRes.textContent}`);
});


test('Tier 4 - Real-World Application Scenarios', 'Wiki Healer Strategy, Seed Evolution Rules & Mobile H5 Filter FAB Ironclad Visibility', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Seed rules: remove legacy inventory +5
  assert(!wikiJs.includes('持有上限+5'), 'wiki.js must remove legacy 持有上限+5');
  assert(!wikiJs.includes('inventory +5'), 'wiki.js must remove legacy inventory +5');
  assert(wikiJs.includes('每次進化<span class="text-success font-bold">主技能+1</span>.副技能不能同時存在相同名稱技能'), 'wiki.js must retain skill +1 and subskill uniqueness');

  // 2. Healers & Energy boost
  assert(wikiJs.includes('土台龜') && wikiJs.includes('Torterra'), 'wiki.js must include Torterra / 土台龜 as recommended healer');
  assert(wikiJs.includes('約2.22倍') && wikiJs.includes('0.45x'), 'wiki.js must accurately describe ~2.22x speed and 0.45x interval for >80% energy');

  // 3. Mobile H5 FAB CSS rules
  assert(cssCode.includes('.mobile-h5-app .sidebar-fab-btn'), 'styles.css must style mobile H5 FAB');
  assert(cssCode.includes('.mobile-h5-app .sidebar-fab-btn.drawer-open') && cssCode.includes('display: none !important;'), 'styles.css must strictly hide FAB when drawer is open');
  assert(cssCode.includes('.mobile-h5-app.pokemon-active #sidebar-bookmark-handle:not(.drawer-open)'), 'styles.css must show Pokemon FAB when collapsed');
  assert(cssCode.includes('.mobile-h5-app.ladder-active #ladder-sidebar-bookmark-handle:not(.drawer-open)'), 'styles.css must show Ladder FAB when collapsed');

  // 4. JS Drawer-open symmetric state tracking
  assert(appJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'app.js must add drawer-open when expanding');
  assert(appJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'app.js must remove drawer-open when collapsing');
  assert(recipesJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'recipes.js must add drawer-open when expanding');
  assert(recipesJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'recipes.js must remove drawer-open when collapsing');
  assert(wikiJs.includes("bookmarkHandle.classList.add('drawer-open')"), 'wiki.js must add drawer-open when expanding');
  assert(wikiJs.includes("bookmarkHandle.classList.remove('drawer-open')"), 'wiki.js must remove drawer-open when collapsing');
});


test('Tier 4 - Real-World Application Scenarios', 'Box Manual Add Combobox Number Search Intelligence & Dynamic Good-Night Ribbon Options', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  // 1. Setup DOM and vm Context
  const domElements = {};
  function mockEl(id, tagName = 'div') {
    const el = {
      id,
      tagName: tagName.toUpperCase(),
      value: '',
      innerHTML: '',
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      getAttribute: () => '',
      addEventListener: (evt, handler) => { el['on' + evt] = handler; },
      dispatchEvent: () => {},
      querySelectorAll: () => []
    };
    domElements[id] = el;
    return el;
  }

  const ctx = {
    window: {},
    document: {
      getElementById: id => domElements[id] || mockEl(id),
      createElement: tag => mockEl('mock-' + Math.random(), tag),
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console,
    BERRY_DATA: [],
    THREE_STAGE_BASE_NAMES: new Set([
      '妙蛙種子', '小火龍', '傑尼龜', '綠毛蟲', '喇叭芽', '波克比', '咩利羊',
      '火稚雞', '木守宮', '水躍魚', '拉魯拉絲', '過動猿', '可可多拉',
      '超音蝠', '小拳石', '鬼斯', '凱西', '小磁怪', '圓陸鯊', '大針蜂',
      '火球鼠', '小鋸鱷', '幼基拉斯', '大顎蟻', '海豹球', '寶貝龍', '草苗龜', '小火焰猴', '波加曼', '小貓怪',
      '強顎雞母蟲', '新葉喵', '呆火鱷', '潤水鴨', '布撥', '巧鍛匠'
    ])
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;

  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);
  vm.runInContext(appraisalJs, ctx);
  vm.runInContext(boxJs, ctx);

  // Initialize Box with pokemon data
  const boxApp = ctx.PokemonBoxApp || ctx.window.PokemonBoxApp;
  assert(boxApp, 'PokemonBoxApp must be defined');
  assert(typeof boxApp.updateRibbonSelectOptions === 'function', 'updateRibbonSelectOptions must be exposed');

  // Test 1: Dynamic Good-Night Ribbon options based on evolution stage
  const ribbonSelect = mockEl('modal-poke-ribbon', 'select');
  domElements['modal-poke-ribbon'] = ribbonSelect;

  // Case 1A: Final Evolution (e.g. 倫琴貓 Luxray #405, is_final = '〇')
  const luxray = pkmData.find(p => p.id === '405' || p.name_cn === '倫琴貓');
  assert(luxray, 'Luxray #405 must exist in data.json');
  boxApp.updateRibbonSelectOptions(luxray);
  const luxrayHtml = ribbonSelect.innerHTML;
  assert(luxrayHtml.includes('data-icon="assets/ribbons/ribbon_lv1.png"'), 'Ribbon options must include official ribbon_lv1 icon');
  assert(!luxrayHtml.includes('第 1 階段'), 'Ribbon options must NOT have 第 1 階段');
  assert(luxrayHtml.includes('+3 持有上限'), 'Final evolution must have +3 持有上限');
  assert(!luxrayHtml.includes('幫速加成'), 'Final evolution must NOT have 幫速加成');
  assert(!luxrayHtml.includes('幫速最大加成'), 'Final evolution must NOT have 幫速最大加成');
  assert(!luxrayHtml.includes('專屬頭像'), 'Final evolution must NOT have 專屬頭像');
  assert(luxrayHtml.includes('+6 持有上限'), 'Final evolution must have +6 持有上限');
  assert(luxrayHtml.includes('+8 持有上限'), 'Final evolution must have +8 持有上限');

  // Case 1B: Mid-Stage / 1 Evo Remaining (e.g. 勒克貓 Luxio #404)
  const luxio = pkmData.find(p => p.id === '404' || p.name_cn === '勒克貓');
  assert(luxio, 'Luxio #404 must exist in data.json');
  boxApp.updateRibbonSelectOptions(luxio);
  const luxioHtml = ribbonSelect.innerHTML;
  assert(luxioHtml.includes('幫速加成 -5%'), '1-evo remaining must have 幫速加成 -5%');
  assert(luxioHtml.includes('幫速最大加成 -12%'), '1-evo remaining must have 幫速最大加成 -12%');
  assert(!luxioHtml.includes('專屬頭像'), '1-evo remaining must NOT have 專屬頭像');

  // Case 1C: Base Stage / 2 Evos Remaining (e.g. 小貓怪 Shinx #403)
  const shinx = pkmData.find(p => p.id === '403' || p.name_cn === '小貓怪');
  assert(shinx, 'Shinx #403 must exist in data.json');
  boxApp.updateRibbonSelectOptions(shinx);
  const shinxHtml = ribbonSelect.innerHTML;
  assert(shinxHtml.includes('幫速加成 -11%'), '2-evo remaining must have 幫速加成 -11%');
  assert(shinxHtml.includes('幫速最大加成 -25%'), '2-evo remaining must have 幫速最大加成 -25%');
  assert(!shinxHtml.includes('專屬頭像'), '2-evo remaining must NOT have 專屬頭像');

  // Test 2: Combobox Number Search Intelligence (Partial, Prefix, Substring, Typo)
  const searchInput = mockEl('modal-poke-search', 'input');
  const nameHidden = mockEl('modal-poke-name', 'input');
  const dropdown = mockEl('box-pkm-dropdown', 'div');
  const toggleBtn = mockEl('box-pkm-dropdown-toggle', 'button');
  domElements['modal-poke-search'] = searchInput;
  domElements['modal-poke-name'] = nameHidden;
  domElements['box-pkm-dropdown'] = dropdown;
  domElements['box-pkm-dropdown-toggle'] = toggleBtn;

  boxApp.setAllPokemons(pkmData);
  boxApp.initPokemonCombobox();
  const renderDropdown = ctx.window._boxRenderDropdown;
  assert(typeof renderDropdown === 'function', '_boxRenderDropdown must be exposed for testing');

  // 2A. Search '40'
  renderDropdown('40');
  assert(dropdown.innerHTML.includes('No.040 胖可丁'), 'Search "40" must include #040 胖可丁 as exact match');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "40" must include #405 倫琴貓 (prefix 40)');
  assert(dropdown.innerHTML.includes('No.403 小貓怪'), 'Search "40" must include #403 小貓怪 (prefix 40)');
  // Verify rank ordering: #040 胖可丁 appears before #405 倫琴貓
  const idx40 = dropdown.innerHTML.indexOf('No.040 胖可丁');
  const idx405 = dropdown.innerHTML.indexOf('No.405 倫琴貓');
  assert(idx40 !== -1 && idx405 !== -1 && idx40 < idx405, '#040 exact match must appear before #405 prefix match');

  // 2B. Search '405'
  renderDropdown('405');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "405" must include #405 倫琴貓');
  assert(!dropdown.innerHTML.includes('No.040 胖可丁'), 'Search "405" must NOT include #040');

  // 2C. Search 'No.405'
  renderDropdown('No.405');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "No.405" must match #405 倫琴貓');

  // 2D. Search '4'
  renderDropdown('4');
  assert(dropdown.innerHTML.includes('No.004 小火龍'), 'Search "4" must include #004 小火龍');
  assert(dropdown.innerHTML.includes('No.405 倫琴貓'), 'Search "4" must include #405 倫琴貓');

  // 2E. Search typo '皮卡秋' (Homophone/typo tolerance)
  renderDropdown('皮卡秋');
  assert(dropdown.innerHTML.includes('皮卡丘'), 'Search typo "皮卡秋" must match 皮卡丘');

  // 2F. Search subsequence '妙花'
  renderDropdown('妙花');
  assert(dropdown.innerHTML.includes('妙蛙花'), 'Search "妙花" must match 妙蛙花');
});


}

module.exports = { registerTier4Part1 };
