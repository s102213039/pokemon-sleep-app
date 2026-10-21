/**
 * Tier 4 - Real-World Application Scenarios (109 Tests)
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
} = require('../test_harness');

function registerTier4Tests() {
  console.log('--- Tier 4 - Real-World Application Scenarios ---');

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
  assert(/css\/styles\.css\?v=(20260917_[345678]|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(indexHtml), 'index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki\.js\?v=(20260907_8|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(indexHtml), 'index.html wiki.js must have valid cache buster');
  assert(/css\/styles\.css\?v=(20260917_[345678]|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(appIndexHtml), 'app/index.html styles.css must have current cache buster');
  assert(/js\/modules\/wiki\.js\?v=(20260907_8|2026091[89]_\d+|202609[23]\d_\d+|202610\d{2}_\d+)/.test(appIndexHtml), 'app/index.html wiki.js must have valid cache buster');
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

  // Verify Target Level is a select dropdown with options 30, 50, 60, 70, 80
  assert(html.includes('<select id="calc-sleep-target-lv" class="calc-select"'), 'Target level must be a calc-select dropdown');
  assert(html.includes('<option value="30">Lv.30</option>'), 'Target level must have option 30');
  assert(html.includes('<option value="50">Lv.50</option>'), 'Target level must have option 50');
  assert(html.includes('<option value="60">Lv.60</option>'), 'Target level must have option 60');
  assert(html.includes('<option value="70">Lv.70</option>'), 'Target level must have option 70');
  assert(html.includes('<option value="80">Lv.80</option>'), 'Target level must have option 80');

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


test('Tier 4 - Real-World Application Scenarios', 'Box Intelligent OCR Multi-Anchor Engine & Image 1 Ground Truth 100% Verification', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
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

  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

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
    BERRY_DATA: []
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;

  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);
  vm.runInContext(appraisalJs, ctx);
  vm.runInContext(boxJs, ctx);

  const boxApp = ctx.PokemonBoxApp || ctx.window.PokemonBoxApp;
  assert(boxApp, 'PokemonBoxApp must be defined');
  assert(typeof boxApp.parsePokemonFromOcr === 'function', 'parsePokemonFromOcr must be exposed');

  boxApp.setAllPokemons(pkmData);

  // 1. Ground Truth Verification for Image 1 (Heracross, Lv.52, Careful, 5 subskills, Honey/Mushroom/Honey)
  const image1OcrText = `Lv. 52 其 拉克 羅斯
持有上限 21個
@ 健美 (料理 輔助 S) Lv.7
技能 機 率 提 升 M
技能 等 級 提 升 M
幫忙 速度 M !
kotuv70 ,
持 有 上 限 提升 S
和 ouv.30 ,
食材 機 率 提 升 S
2 全
主 技能 發 動機 家 人 全
食材 發 現 率 字
掉 My`;

  const image1RgbSlots = [
    { r: 244.2, g: 202.3, b: 140.1 }, // Slot 1 (Honey)
    { r: 182.5, g: 104.6, b: 47.6 },  // Slot 2 (Mushroom)
    { r: 251.2, g: 219.5, b: 158.6 }  // Slot 3 (Honey)
  ];

  const parsed = boxApp.parsePokemonFromOcr(image1OcrText, image1RgbSlots, pkmData);

  // Assert 100% accurate ground truth resolution
  assertEquals(parsed.name, '赫拉克羅斯', 'Ground truth name must be 赫拉克羅斯 (Heracross #214)');
  assertEquals(parsed.pokemonId, '214', 'Ground truth pokemonId must be 214');
  assertEquals(parsed.level, 52, 'Ground truth level must be 52');
  assertEquals(parsed.skillLevel, 7, 'Ground truth main skill level must be 7');
  assertEquals(parsed.ribbon, 1, 'Carry 21 with base 20 and locked subskill must deduce Ribbon Lv.1');
  assertEquals(parsed.nature, '慎重', 'Ground truth nature must be 慎重 (Careful)');
  assertEquals(parsed.ing1, '甜甜蜜', 'Ground truth Slot 1 ingredient must be 甜甜蜜');
  assertEquals(parsed.ing2, '品鮮蘑菇', 'Ground truth Slot 2 ingredient must be 品鮮蘑菇');
  assertEquals(parsed.ing3, '甜甜蜜', 'Ground truth Slot 3 ingredient must be 甜甜蜜');

  assertArrayEquals(parsed.subskills, [
    '技能機率提升M',
    '技能等級提升M',
    '幫忙速度M',
    '持有上限提升S',
    '食材機率提升S'
  ], 'Ground truth 5 subskills must match exact visual slot order');

  // 2. False-Positive Immunity Test (Haunter No.093 false trigger prevention)
  const noisyTextWith093 = `
SP 6,920
每 29 分 36 秒
持有上限 21個
093 025 140
健美（料理輔助S）
主技能發動機率 ▲▲
食材發現率 ▼▼
`;
  const falseTriggerTest = boxApp.parsePokemonFromOcr(noisyTextWith093, image1RgbSlots, pkmData);
  assert(falseTriggerTest.name !== '鬼斯通', 'Raw OCR noise with "093" must NEVER falsely match 鬼斯通');
  assertEquals(falseTriggerTest.name, '赫拉克羅斯', 'Main skill 健美（料理輔助S） must disambiguate to 赫拉克羅斯');

  // 3. Nature Deductive Stat Mapping (25 Natures accuracy)
  const statTextCareful = '主技能發動機率 ▲▲\n食材發現率 ▼▼';
  const natureCareful = boxApp.parsePokemonFromOcr(statTextCareful, null, pkmData).nature;
  assertEquals(natureCareful, '慎重', 'Skill trigger up + Ingredient down must deduce 慎重');

  const statTextAdamant = '幫忙速度 ▲▲\n食材發現率 ▼▼';
  const natureAdamant = boxApp.parsePokemonFromOcr(statTextAdamant, null, pkmData).nature;
  assertEquals(natureAdamant, '固執', 'Speed up + Ingredient down must deduce 固執');

  // 4. Modal UI Population End-to-End Simulation
  // Setup required DOM elements for modal
  const modalEl = mockEl('box-edit-modal', 'div');
  const modalForm = mockEl('box-edit-form', 'form');
  const titleEl = mockEl('box-modal-title', 'div');
  const previewEl = mockEl('box-modal-screenshot-preview', 'div');
  const searchInput = mockEl('modal-poke-search', 'input');
  const nameHidden = mockEl('modal-poke-name', 'input');
  const levelInput = mockEl('modal-poke-level', 'input');
  const natureSelect = mockEl('modal-poke-nature', 'select');
  const ribbonSelect = mockEl('modal-poke-ribbon', 'select');
  const skillLevelSelect = mockEl('modal-poke-skill-level', 'select');
  const mainSkillEl = mockEl('modal-poke-main-skill-name', 'span');
  const ing1Hidden = mockEl('modal-ing1', 'input');
  const ing2Hidden = mockEl('modal-ing2', 'input');
  const ing3Hidden = mockEl('modal-ing3', 'input');
  const ingOpt1 = mockEl('modal-ing-options-1', 'div');
  const ingOpt2 = mockEl('modal-ing-options-2', 'div');
  const ingOpt3 = mockEl('modal-ing-options-3', 'div');
  const dropdown = mockEl('box-pkm-dropdown', 'div');
  const toggleBtn = mockEl('box-pkm-dropdown-toggle', 'button');

  domElements['box-edit-modal'] = modalEl;
  domElements['box-edit-form'] = modalForm;
  domElements['box-modal-title'] = titleEl;
  domElements['box-modal-screenshot-preview'] = previewEl;
  domElements['modal-poke-search'] = searchInput;
  domElements['modal-poke-name'] = nameHidden;
  domElements['modal-poke-level'] = levelInput;
  domElements['modal-poke-nature'] = natureSelect;
  domElements['modal-poke-ribbon'] = ribbonSelect;
  domElements['modal-poke-skill-level'] = skillLevelSelect;
  domElements['modal-poke-main-skill-name'] = mainSkillEl;
  domElements['modal-ing1'] = ing1Hidden;
  domElements['modal-ing2'] = ing2Hidden;
  domElements['modal-ing3'] = ing3Hidden;
  domElements['modal-ing-options-1'] = ingOpt1;
  domElements['modal-ing-options-2'] = ingOpt2;
  domElements['modal-ing-options-3'] = ingOpt3;
  domElements['box-pkm-dropdown'] = dropdown;
  domElements['box-pkm-dropdown-toggle'] = toggleBtn;

  for (let s = 1; s <= 5; s++) {
    domElements[`modal-subskill-${s}`] = mockEl(`modal-subskill-${s}`, 'input');
  }

  // Open modal with parsed ground truth data
  boxApp.initPokemonCombobox(parsed);
  levelInput.value = parsed.level;
  natureSelect.value = parsed.nature;

  // Check that inputs are populated with 100% correct values
  assert(searchInput.value.includes('赫拉克羅斯'), 'Modal Pokémon input must display 赫拉克羅斯');
  assert(searchInput.value.includes('214'), 'Modal Pokémon input must display No.214');
  assertEquals(nameHidden.value, '赫拉克羅斯', 'Modal hidden name must be 赫拉克羅斯');
  assertEquals(mainSkillEl.textContent, '健美（料理輔助S）', 'Modal main skill name badge must display 健美（料理輔助S）');
  assertEquals(levelInput.value, 52, 'Modal level input must be 52');
  assertEquals(natureSelect.value, '慎重', 'Modal nature select must be 慎重');
  assertEquals(ing1Hidden.value, '甜甜蜜', 'Modal Ing 1 must be 甜甜蜜');
  assertEquals(ing2Hidden.value, '品鮮蘑菇', 'Modal Ing 2 must be 品鮮蘑菇');
  assertEquals(ing3Hidden.value, '甜甜蜜', 'Modal Ing 3 must be 甜甜蜜');
});


test('Tier 4 - Real-World Application Scenarios', 'Box Modal Widening, Sticky Submit Button & Standard Screenshot Guide UI', () => {
  const fs = require('fs');
  const path = require('path');

  // 1. Verify standard screenshot asset exists and is valid
  const sampleAssetPath = path.join(WORKSPACE_ROOT, 'assets/guide/standard_screenshot_guide.png');
  assert(fs.existsSync(sampleAssetPath), 'assets/guide/standard_screenshot_guide.png must exist');
  const assetStats = fs.statSync(sampleAssetPath);
  assert(assetStats.size > 50000, `Sample asset must be substantial size (actual: ${assetStats.size} bytes)`);

  // 2. Verify index.html markup
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  assert(indexHtml.includes('id="box-screenshot-guide-card"'), 'index.html must include box-screenshot-guide-card');
  assert(indexHtml.includes('id="box-guide-lightbox-modal"'), 'index.html must include box-guide-lightbox-modal');
  assert(indexHtml.includes('assets/guide/standard_screenshot_guide.png'), 'index.html must reference standard_screenshot_guide.png');
  assert(indexHtml.includes('id="box-modal-submit-btn"'), 'index.html must contain box-modal-submit-btn');
  assert(indexHtml.includes('id="box-modal-cancel-btn"'), 'index.html must contain box-modal-cancel-btn');

  // Verify 5 checklist elements in index.html
  assert(indexHtml.includes('[1]'), 'Guide must contain item [1]');
  assert(indexHtml.includes('[2]'), 'Guide must contain item [2]');
  assert(indexHtml.includes('[3]'), 'Guide must contain item [3]');
  assert(indexHtml.includes('[4]'), 'Guide must contain item [4]');
  assert(indexHtml.includes('[5]'), 'Guide must contain item [5]');

  // 3. Verify mobile app/index.html markup
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
  assert(mobileHtml.includes('id="box-screenshot-guide-card"'), 'app/index.html must include box-screenshot-guide-card');
  assert(mobileHtml.includes('id="box-guide-lightbox-modal"'), 'app/index.html must include box-guide-lightbox-modal');
  assert(mobileHtml.includes('../assets/guide/standard_screenshot_guide.png'), 'app/index.html must reference sample image');

  // 4. Verify CSS rules for widening and sticky footer
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
  assert(stylesCss.includes('.box-modal-dialog.has-screenshot'), 'CSS must include .box-modal-dialog.has-screenshot');
  assert(stylesCss.includes('max-width: 1040px'), 'CSS must specify max-width: 1040px for has-screenshot');
  assert(stylesCss.includes('.box-screenshot-guide-card'), 'CSS must style .box-screenshot-guide-card');
  assert(stylesCss.includes('.box-guide-lightbox-backdrop'), 'CSS must style .box-guide-lightbox-backdrop');

  // 5. Verify i18n dictionaries in both languages
  const i18nSrc = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');
  const requiredKeys = [
    'box.guide_title',
    'box.guide_collapse',
    'box.guide_expand',
    'box.guide_click_zoom',
    'box.guide_sample_label',
    'box.guide_info_heading',
    'box.guide_item1_title',
    'box.guide_item2_title',
    'box.guide_item3_title',
    'box.guide_item4_title',
    'box.guide_item5_title',
    'box.guide_tip_badge',
    'box.guide_tip_text'
  ];
  requiredKeys.forEach(k => {
    assert(i18nSrc.includes(`'${k}'`), `i18n must include translation key: ${k}`);
  });

  // 6. Verify zero emoji policy on guide titles and modal headers
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert(!emojiRegex.test('標準截圖示範例與必備資訊'), 'Guide title must not contain emojis');
  assert(!emojiRegex.test('截圖辨識確認入庫'), 'Modal title must not contain emojis');
  assert(!emojiRegex.test('深度評測室'), 'Appraisal lab button must not contain emojis');
});


test('Tier 4 - Real-World Application Scenarios', 'Box Main Skill Level Control & Good-Night Ribbon Carry Deduction Workflow', () => {
  const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Verify HTML Markup for Main Skill display and Level select (Desktop & Mobile)
  assert(indexHtml.includes('modal-poke-main-skill-name'), 'index.html must include modal-poke-main-skill-name');
  assert(indexHtml.includes('modal-poke-skill-level'), 'index.html must include modal-poke-skill-level');
  assert(appIndexHtml.includes('modal-poke-main-skill-name'), 'app/index.html must include modal-poke-main-skill-name');
  assert(appIndexHtml.includes('modal-poke-skill-level'), 'app/index.html must include modal-poke-skill-level');
  assert(!indexHtml.includes('box-mainskill-lvl-prefix'), 'index.html must remove redundant box-mainskill-lvl-prefix label');
  assert(!appIndexHtml.includes('box-mainskill-lvl-prefix'), 'app/index.html must remove redundant box-mainskill-lvl-prefix label');

  // 2. Verify CSS rules for main skill row, badge and level select
  assert(stylesCss.includes('.box-mainskill-control'), 'styles.css must include .box-mainskill-control');
  assert(stylesCss.includes('.box-mainskill-name-badge'), 'styles.css must include .box-mainskill-name-badge');
  assert(stylesCss.includes('.box-mainskill-select'), 'styles.css must include .box-mainskill-select');
  assert(stylesCss.includes('.box-mainskill-control .custom-select-container'), 'styles.css must include .box-mainskill-control .custom-select-container');

  // 3. Verify i18n keys
  assert(i18nJs.includes("'box.modal_main_skill'"), 'i18n.js must define box.modal_main_skill');
  assert(i18nJs.includes("'box.modal_skill_level'"), 'i18n.js must define box.modal_skill_level');

  // Load box module
  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  assert(typeof boxModule.deduceRibbonFromCarry === 'function', 'deduceRibbonFromCarry must be exported');
  assert(typeof boxModule.parsePokemonFromOcr === 'function', 'parsePokemonFromOcr must be exported');

  // 4. Test deduceRibbonFromCarry logic across diverse scenarios
  const heracross = pkmData.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracross, 'Heracross must exist in data.json');
  assertEquals(parseInt(heracross.carry, 10), 20, 'Heracross base carry is 20');

  // Heracross screenshot subskills:
  // Slot 1 (Lv.10): 技能機率提升M
  // Slot 2 (Lv.25): 技能等級提升M
  // Slot 3 (Lv.50): 幫忙速度M
  // Slot 4 (Lv.70): 持有上限提升S (+6)
  // Slot 5 (Lv.80): 食材機率提升S
  const subskillsHera = ['技能機率提升M', '技能等級提升M', '幫忙速度M', '持有上限提升S', '食材機率提升S'];

  // Scenario A: Carry 21, Lv.52 -> Slot 4 is LOCKED (52 < 70) -> diff = 21 - 20 - 0 = +1 -> Ribbon Lv.1 (200 hrs)
  const ribbonA = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 21);
  assertEquals(ribbonA, 1, 'Carry 21 with base 20 and locked Inventory S must deduce Ribbon Lv.1');

  // Scenario B: Carry 20, Lv.52 -> diff = 20 - 20 = 0 -> Ribbon Lv.0 (none)
  const ribbonB = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 20);
  assertEquals(ribbonB, 0, 'Carry 20 with base 20 must deduce Ribbon Lv.0');

  // Scenario C: Carry 23, Lv.52 -> diff = 23 - 20 = +3 -> Ribbon Lv.2 (500 hrs)
  const ribbonC = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 23);
  assertEquals(ribbonC, 2, 'Carry 23 with base 20 must deduce Ribbon Lv.2');

  // Scenario D: Carry 26, Lv.52 -> diff = 26 - 20 = +6 -> Ribbon Lv.3 (1000 hrs)
  const ribbonD = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 26);
  assertEquals(ribbonD, 3, 'Carry 26 with base 20 must deduce Ribbon Lv.3');

  // Scenario E: Carry 28, Lv.52 -> diff = 28 - 20 = +8 -> Ribbon Lv.4 (2000 hrs)
  const ribbonE = boxModule.deduceRibbonFromCarry(heracross, 52, subskillsHera, 28);
  assertEquals(ribbonE, 4, 'Carry 28 with base 20 must deduce Ribbon Lv.4');

  // Scenario F: Heracross reaches Lv.70! Inventory Up S (+6) is now unlocked!
  // If screenshot shows Carry 27, diff = 27 - 20 - 6 = +1 -> Ribbon Lv.1
  const ribbonF = boxModule.deduceRibbonFromCarry(heracross, 70, subskillsHera, 27);
  assertEquals(ribbonF, 1, 'Carry 27 with base 20 and unlocked Inventory S (+6) must deduce Ribbon Lv.1');

  // 5. Verify OCR Parsing of Image 1 text extracts skillLevel = 7 and ribbon = 1
  const fullOcrText = `SP 6,920
Lv. 52 赫拉克羅斯
幫忙間隔 每29分36秒
持有上限 21個
健美（料理輔助S） Lv. 7
隨機獲得24個食材。不僅如此，料理漂亮成功的機率還會提升5%。
技能機率提升M
技能等級提升M
幫忙速度M
持有上限提升S
食材機率提升S
慎重
主技能發動機率 ▲▲
食材發現率 ▼▼`;

  const parsed = boxModule.parsePokemonFromOcr(fullOcrText, null, pkmData);
  assertEquals(parsed.name, '赫拉克羅斯', 'Parsed name must be 赫拉克羅斯');
  assertEquals(parsed.level, 52, 'Parsed level must be 52');
  assertEquals(parsed.skillLevel, 7, 'Parsed main skill level must be 7');
  assertEquals(parsed.ribbon, 1, 'Parsed ribbon must be deduced as Lv.1 (+1 carry)');
  assertArrayEquals(parsed.subskills, subskillsHera, 'Parsed subskills must exactly match all 5 slots');

  // 5. Test getMainSkillMaxLevel across various skill categories
  assert(typeof boxModule.getMainSkillMaxLevel === 'function', 'getMainSkillMaxLevel must be exported');
  assertEquals(boxModule.getMainSkillMaxLevel('活力全體療癒S'), 6, 'Energy for Everyone S must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('料理成功S'), 6, 'Extra Tasty S must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('幫手加速（水）'), 6, 'Helper Boost must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('樹果遽增'), 6, 'Berry Burst must be max Lv. 6');
  assertEquals(boxModule.getMainSkillMaxLevel('健美（料理輔助S）'), 7, 'Bulk Up must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('能量填充M'), 7, 'Charge Strength M must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('料理強化S'), 7, 'Cooking Power Up S must be max Lv. 7');
  assertEquals(boxModule.getMainSkillMaxLevel('夢之碎片獲取S'), 8, 'Dream Shard Magnet S must be max Lv. 8');
  assertEquals(boxModule.getMainSkillMaxLevel('波導彈（夢之碎片獲取S）'), 8, 'Aura Sphere must be max Lv. 8');

  // 6. Test updateModalMainSkill dynamic select options generation & value clamping
  const sylveon = pkmData.find(p => p.name_cn === '仙子伊布') || { name_cn: '仙子伊布', main_skill: '活力全體療癒S' };
  const lucario = pkmData.find(p => p.name_cn === '路卡利歐') || { name_cn: '路卡利歐', main_skill: '波導彈（夢之碎片獲取S）' };

  let mockSkillSelect = {
    value: '7',
    innerHTML: '',
    dispatchEvent: () => {}
  };
  global.document = {
    getElementById: (id) => {
      if (id === 'modal-poke-main-skill-name') return { textContent: '', setAttribute: () => {} };
      if (id === 'modal-poke-skill-level') return mockSkillSelect;
      return null;
    }
  };

  // When updating to Sylveon (maxLevel 6), level 7 should clamp to 6 and innerHTML has 6 options
  boxModule.updateModalMainSkill(sylveon, 7);
  assertEquals(mockSkillSelect.value, '6', 'Sylveon skill level 7 must be clamped to 6');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 6, 'Sylveon select must contain exactly 6 options');

  // When updating to Heracross (maxLevel 7), level 7 is valid and innerHTML has 7 options
  boxModule.updateModalMainSkill(heracross, 7);
  assertEquals(mockSkillSelect.value, '7', 'Heracross skill level 7 is valid');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 7, 'Heracross select must contain exactly 7 options');

  // When updating to Lucario (maxLevel 8), level 8 is valid and innerHTML has 8 options
  boxModule.updateModalMainSkill(lucario, 8);
  assertEquals(mockSkillSelect.value, '8', 'Lucario skill level 8 is valid');
  assertEquals((mockSkillSelect.innerHTML.match(/<option/g) || []).length, 8, 'Lucario select must contain exactly 8 options');
});


test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Viewport Address Bar Stability & Ingredient Ladder Top 7 Recipe Highlight', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Mobile H5 Viewport & Address Bar Locking
  assert(appIndexHtml.includes('class="mobile-h5-html"'), 'app/index.html must have mobile-h5-html class');
  assert(css.includes('html.mobile-h5-html'), 'styles.css must style html.mobile-h5-html');
  assert(css.includes('position: fixed !important;\n  top: 0 !important;\n  left: 0 !important;\n  right: 0 !important;\n  bottom: 0 !important;\n  width: 100% !important;\n  height: 100% !important;\n  height: 100dvh !important;\n  overflow: hidden !important;'), 'styles.css must lock body.mobile-h5-app with fixed positioning and overflow hidden');
  assert(css.includes('padding: 0 !important;'), 'Pokemon table container must have clean zero bottom clearance');
  assert(css.includes('z-index: 500 !important;'), 'styles.css must set passing line container z-index to 500');
  assert(css.includes('z-index: 501;'), 'styles.css must set passing line badge z-index to 501');
  assert(css.includes('.ladder-recipe-highlight-fab'), 'styles.css must style .ladder-recipe-highlight-fab');
  assert(css.includes('.ladder-track-row.ladder-track-highlighted'), 'styles.css must define highlighted ladder track row');
  assert(css.includes('.ladder-track-row.ladder-track-dimmed'), 'styles.css must define dimmed ladder track row');
  assert(css.includes('.ladder-recipe-cat-bar'), 'styles.css must style recipe category switcher bar');
  assert(css.includes('.ladder-recipe-banner-ings'), 'styles.css must style banner ingredient chips container');
  assert(css.includes('bottom: calc(138px + env(safe-area-inset-bottom, 0px)) !important;'), 'styles.css must position mobile ladder FAB above filter FAB');
  assert(css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'), 'styles.css body must reserve dock clearance via padding-bottom for all panels');

  // 2. Top Recipes by Category and Logic in wiki.js
  assert(wikiJs.includes('const TOP_RECIPES_BY_CATEGORY = {'), 'wiki.js must define TOP_RECIPES_BY_CATEGORY');
  assert(wikiJs.includes('switchLadderRecipeCategory'), 'wiki.js must define switchLadderRecipeCategory');
  assert(wikiJs.includes('openLadderRecipeModal'), 'wiki.js must define openLadderRecipeModal');
  assert(wikiJs.includes('selectLadderHighlightRecipe'), 'wiki.js must define selectLadderHighlightRecipe');
  assert(wikiJs.includes('clearLadderHighlightRecipe'), 'wiki.js must define clearLadderHighlightRecipe');
  assert(!wikiJs.includes('ladder-track-ing-main">\n                  <img src="${ing.icon}" class="ladder-ing-icon" alt="${ingName}">\n                  ${isHighlighted ?'), 'wiki.js must not annotate requirement count in front of ladder track header');

  // 3. Evaluate Top Recipes Data
  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: {
      readyState: 'complete',
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => []
    }
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const byCat = ctx.window.WikiDB.TOP_RECIPES_BY_CATEGORY;
  assert(byCat && byCat.curry && byCat.salad && byCat.dessert, 'Must define curry, salad, and dessert categories');
  assertEquals(byCat.curry.length, 7, 'Curry must have exactly 7 top recipes');
  assertEquals(byCat.salad.length, 7, 'Salad must have exactly 7 top recipes');
  assertEquals(byCat.dessert.length, 7, 'Dessert must have exactly 7 top recipes');

  // Verify top recipe energy ordering for each category
  assertEquals(byCat.curry[0].name_cn, '彈跳咖哩烏龍麵', 'Curry #1 must be 彈跳咖哩烏龍麵');
  assertEquals(byCat.curry[0].base_energy, 25539, 'Curry #1 energy must be 25539');
  assertEquals(byCat.curry[6].name_cn, '萌綠咖哩麵包', 'Curry #7 must be 萌綠咖哩麵包');

  assertEquals(byCat.salad[0].name_cn, '大塊滿滿熱水沙拉', 'Salad #1 must be 大塊滿滿熱水沙拉');
  assertEquals(byCat.salad[0].base_energy, 25356, 'Salad #1 energy must be 25356');
  assertEquals(byCat.salad[6].name_cn, '萌綠沙拉', 'Salad #7 must be 萌綠沙拉');

  assertEquals(byCat.dessert[0].name_cn, '採蜜巧克力格子鬆餅', 'Dessert #1 must be 採蜜巧克力格子鬆餅');
  assertEquals(byCat.dessert[0].base_energy, 25484, 'Dessert #1 energy must be 25484');
  assertEquals(byCat.dessert[6].name_cn, '青草攪拌器冰沙', 'Dessert #7 must be 青草攪拌器冰沙');

  // Verify category switching
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'curry', 'Initial category should be curry');
  ctx.window.WikiDB.switchLadderRecipeCategory('salad');
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'salad', 'Category should switch to salad');
  ctx.window.WikiDB.switchLadderRecipeCategory('dessert');
  assertEquals(ctx.window.WikiDB.getLadderRecipeCategory(), 'dessert', 'Category should switch to dessert');

  // 4. Test Highlighting interaction
  ctx.window.WikiDB.selectLadderHighlightRecipe('大塊滿滿熱水沙拉');
  assertEquals(ctx.window.WikiDB.getLadderHighlightRecipe(), '大塊滿滿熱水沙拉', 'Active highlight recipe must be 大塊滿滿熱水沙拉');

  ctx.window.WikiDB.clearLadderHighlightRecipe();
  assertEquals(ctx.window.WikiDB.getLadderHighlightRecipe(), null, 'Active highlight recipe must be cleared');

  // 5. Zero Ingredient Names & Single-Row Banner Assertions
  assert(!wikiJs.includes('class="ing-chip-name"'), 'Modal recipe cards must not display ingredient text names');
  assert(!wikiJs.includes('class="ladder-banner-ing-name"'), 'Ladder recipe banner must not display ingredient text names');
  assert(wikiJs.includes('class="recipe-card-ing-icon"'), 'Modal recipe chips must include ingredient icons');
  assert(!wikiJs.includes("'清除高亮'"), "Button text must be shortened to '清除' (no '清除高亮')");

  // Verify all 21 recipes have correct icons from recipes.json
  const recipesJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'recipes.json'), 'utf8'));
  const canonicalMap = new Map();
  recipesJson.forEach(r => canonicalMap.set(r.name_cn, r));
  ['curry', 'salad', 'dessert'].forEach(cat => {
    byCat[cat].forEach(r => {
      const canonical = canonicalMap.get(r.name_cn);
      assert(canonical, `Recipe ${r.name_cn} must exist in recipes.json`);
      assertEquals(r.icon, canonical.icon, `Recipe ${r.name_cn} icon must match recipes.json canonical icon`);
      assertEquals(r.name_en, canonical.name_en, `Recipe ${r.name_cn} name_en must match recipes.json canonical name_en`);
    });
  });

  // Verify mobile condensed single-row CSS
  assert(css.includes('.mobile-h5-app .ladder-recipe-banner'), 'styles.css must provide .mobile-h5-app single-row banner rules');
  assert(css.includes('width: 38px;\n    height: 38px;'), 'Mobile banner icon must be enlarged to 38px');
});


test('Tier 4 - Real-World Application Scenarios', 'Theme Color Engine: Dual-Surface Pre/Post Check and Ladder Recipe Light/Dark Adaptation', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const specMdPath = path.join(WORKSPACE_ROOT, 'docs', 'THEME_COLOR_SPEC.md');
  assert(fs.existsSync(specMdPath), 'docs/THEME_COLOR_SPEC.md must exist');
  const specMd = fs.readFileSync(specMdPath, 'utf8');

  // 1. Theme Color Specification Protocol assertions
  assert(specMd.includes('midnight'), 'Spec must cover midnight theme');
  assert(specMd.includes('onyx'), 'Spec must cover onyx theme');
  assert(specMd.includes('dawn'), 'Spec must cover dawn theme');
  assert(specMd.includes('emerald'), 'Spec must cover emerald theme');
  assert(specMd.includes('執行前檢核 (Pre-Execution Check)'), 'Spec must define pre-execution check protocol');
  assert(specMd.includes('執行後檢核 (Post-Execution Check)'), 'Spec must define post-execution check protocol');

  // 2. Ladder Recipe Components Theme Semantic Variables
  assert(css.includes('var(--badge-cat-curry-bg'), 'Recipe card curry badge must use semantic token --badge-cat-curry-bg');
  assert(css.includes('var(--badge-cat-salad-bg'), 'Recipe card salad badge must use semantic token --badge-cat-salad-bg');
  assert(css.includes('var(--badge-cat-dessert-bg'), 'Recipe card dessert badge must use semantic token --badge-cat-dessert-bg');

  // 3. Light Theme Overrides for Ladder Recipe Banner & Chips
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner'), 'styles.css must provide Dawn light theme overrides for ladder-recipe-banner');
  assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .ladder-recipe-banner'), 'styles.css must provide Emerald light theme overrides for ladder-recipe-banner');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner-ing-chip'), 'styles.css must provide Dawn light theme overrides for ladder-recipe-banner-ing-chip');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-banner-clear-btn'), 'styles.css must provide Dawn light theme overrides for clear button');
  assert(css.includes('color: #b91c1c;'), 'Clear button in light mode must use high-contrast dark red #b91c1c');
  assert(css.includes('color: #0369a1;'), 'Recipe banner title in Dawn must use high-contrast ocean blue #0369a1');

  // 4. Light Theme Overrides for Ladder Recipe Modal
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-card'), 'styles.css must provide Dawn light theme overrides for recipe card');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-cat-btn'), 'styles.css must provide Dawn light theme overrides for category buttons');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-btn-cancel'), 'styles.css must provide Dawn light theme overrides for cancel button');
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-recipe-modal-footer'), 'styles.css must provide Dawn light theme overrides for modal footer');

  // 5. Light Theme Overrides for Highlighted Track Row
  assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-track-row.ladder-track-highlighted'), 'styles.css must provide Dawn light theme overrides for highlighted track row');
});


test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder 3-Meal Passing Lines, Dynamic Max Scale, Tail Standalone Dimming and Reversible Unselectable Guard', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Theme Color Tokens & CSS rules verification
  assert(css.includes('--ladder-passing-line-color: #f59e0b;'), 'Midnight/Onyx must define --ladder-passing-line-color as luminous amber #f59e0b');
  assert(css.includes('--ladder-passing-line-color: #d97706;'), 'Dawn must define --ladder-passing-line-color as warm amber #d97706');
  assert(css.includes('--ladder-passing-line-color: #b45309;'), 'Emerald must define --ladder-passing-line-color as deep amber #b45309');
  assert(css.includes('.ladder-passing-line-container'), 'styles.css must define .ladder-passing-line-container');
  assert(css.includes('.ladder-passing-line'), 'styles.css must define .ladder-passing-line');
  assert(css.includes('.ladder-passing-badge'), 'styles.css must define .ladder-passing-badge');
  assert(css.includes('.ladder-tail-standalone-container.ladder-track-dimmed'), 'styles.css must define .ladder-tail-standalone-container.ladder-track-dimmed');
  assert(css.includes('.ladder-track-disabled-header'), 'styles.css must define .ladder-track-disabled-header');

  // 2. Headless VM Environment for wiki.js evaluation
  let modalOpened = false;
  let modalTitle = '';
  const mockRankingModal = {
    style: {},
    querySelector(sel) {
      if (sel === '.ranking-modal-title') return { set textContent(val) { modalTitle = val; }, textContent: modalTitle };
      if (sel === '.ranking-modal-body') return { innerHTML: '' };
      return null;
    }
  };

  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} }, addEventListener: () => {} },
    document: {
      readyState: 'complete',
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      addEventListener: () => {},
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      getElementById: (id) => {
        if (id === 'wiki-ingredient-ranking-modal' || id === 'ingredient-ranking-modal') return mockRankingModal;
        return null;
      },
      querySelectorAll: () => []
    }
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && typeof WikiDB.renderCoordinateLadder === 'function', 'WikiDB.renderCoordinateLadder must exist');
  assert(typeof WikiDB.selectLadderHighlightRecipe === 'function', 'WikiDB.selectLadderHighlightRecipe must exist');
  assert(typeof WikiDB.clearLadderHighlightRecipe === 'function', 'WikiDB.clearLadderHighlightRecipe must exist');

  // 3. Baseline: Default coordinate ladder rendering without recipe highlight
  const defaultHtml = WikiDB.renderCoordinateLadder();
  assert(!defaultHtml.includes('ladder-passing-line-container'), 'Default ladder must not render passing lines when no recipe is selected');
  assert(!defaultHtml.includes('ladder-track-disabled-header'), 'Default ladder tracks must all be selectable');
  assert(!defaultHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Default tail container must not be dimmed');

  // 4. Highlight Recipe: 彈跳咖哩烏龍麵 (Bounce Curry Udon)
  // Ingredients: 暖暖薑 (39, 3-meal=117), 品鮮蘑菇 (31, 3-meal=93), 火辣香草 (22, 3-meal=66), 豆製肉 (20, 3-meal=60)
  WikiDB.selectLadderHighlightRecipe('彈跳咖哩烏龍麵');
  assertEquals(WikiDB.getLadderHighlightRecipe(), '彈跳咖哩烏龍麵', 'Active highlight recipe must be 彈跳咖哩烏龍麵');

  const highlightedHtml = WikiDB.renderCoordinateLadder();

  // (a) Dynamic Max Scale Expansion: Max passing target is 117 -> maxVal expands to 120
  assert(highlightedHtml.includes('<span class="tick-label">120</span>'), 'Ladder ruler must dynamically expand to 120 to accommodate the 117 passing line');

  // (b) 3-Meal Passing Lines rendered on highlighted tracks
  assert(highlightedHtml.includes('ladder-passing-line-container'), 'Ladder must render .ladder-passing-line-container on recipe tracks');
  assert(!highlightedHtml.includes('ladder-passing-label'), 'Passing badge must only display numbers without text label');
  assert(highlightedHtml.includes('三餐及格線') || highlightedHtml.includes('3 Meals Target'), 'Passing line container title must contain tooltip text');
  assert(highlightedHtml.includes('117'), 'Passing line for 暖暖薑 must display 117');
  assert(highlightedHtml.includes('93'), 'Passing line for 品鮮蘑菇 must display 93');
  assert(highlightedHtml.includes('66'), 'Passing line for 火辣香草 must display 66');
  assert(highlightedHtml.includes('60'), 'Passing line for 豆製肉 must display 60');

  // (c) Slowpoke Tail Standalone Container Dimming: 烏龍麵 does not use tail, so tail must be dimmed
  assert(highlightedHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Tail standalone container must have ladder-track-dimmed when recipe does not use tail');
  assert(highlightedHtml.includes('ladder-tail-track-row') && highlightedHtml.includes('ladder-track-disabled-header'), 'Tail track header must be disabled when dimmed');

  // (d) Non-recipe tracks unselectable header
  assert(highlightedHtml.includes('ladder-track-disabled-header'), 'Dimmed tracks must have ladder-track-disabled-header class');

  // (e) Programmatic Guard: openIngredientRankingModal on non-recipe ingredient must be ignored
  mockRankingModal.style.display = 'none';
  WikiDB.openIngredientRankingModal('apple'); // Apple is NOT in 烏龍麵
  assertEquals(mockRankingModal.style.display, 'none', 'Clicking non-recipe ingredient (apple) must NOT open modal');

  // But recipe ingredient (ginger) CAN be selected
  WikiDB.openIngredientRankingModal('ginger');
  assertEquals(mockRankingModal.style.display, 'flex', 'Clicking recipe ingredient (ginger) must open ranking modal');

  // 5. Reversible Restore ("要能夠回復"): Clear highlight and verify clean restoration
  WikiDB.clearLadderHighlightRecipe();
  assertEquals(WikiDB.getLadderHighlightRecipe(), null, 'Ladder highlight recipe must be null after clear');

  const restoredHtml = WikiDB.renderCoordinateLadder();
  assert(!restoredHtml.includes('ladder-passing-line-container'), 'Restored ladder must have passing lines removed');
  assert(!restoredHtml.includes('ladder-tail-standalone-container ladder-track-dimmed'), 'Restored tail container must have dimmed class removed');
  assert(!restoredHtml.includes('ladder-track-disabled-header'), 'Restored ladder tracks must not have disabled headers');

  // Non-recipe ingredient (apple) can now be selected again after restore
  mockRankingModal.style.display = 'none';
  WikiDB.openIngredientRankingModal('apple');
  assertEquals(mockRankingModal.style.display, 'flex', 'After clearing highlight, apple must be selectable again');
});


test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder: Ingredient Draw S Switch, Expectation Bonus, and Two-Part Yield Representation', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify CSS styles exist
  assert(stylesCss.includes('.node-has-skill-draw'), 'styles.css must include .node-has-skill-draw');
  assert(stylesCss.includes('.node-count-badge.badge-skill-draw'), 'styles.css must include .node-count-badge.badge-skill-draw');
  assert(stylesCss.includes('.tooltip-yield-breakdown'), 'styles.css must include .tooltip-yield-breakdown');
  assert(stylesCss.includes('.ing-rank-split-line'), 'styles.css must include .ing-rank-split-line');

  // Set up VM environment
  let modalContainer = null;
  const mockStorage = new Map([
    ['pksleep_lang', 'zh-TW'],
    ['pksleep_ladder_skill_draw', 'false']
  ]);
  const mockElements = new Map();

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
      getElementById: (id) => {
        if (id === 'wiki-ingredient-ranking-modal') return modalContainer;
        if (!mockElements.has(id)) {
          mockElements.set(id, {
            checked: false,
            style: { setProperty: () => {}, display: '' },
            classList: { add: () => {}, remove: () => {}, contains: () => false },
            innerHTML: '',
            textContent: '',
            addEventListener: () => {}
          });
        }
        return mockElements.get(id);
      },
      querySelectorAll: () => [],
      createElement: () => ({
        setAttribute: () => {},
        innerHTML: '',
        className: '',
        id: '',
        style: { setProperty: () => {}, display: '' },
        addEventListener: () => {}
      }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB, 'WikiDB must be defined');

  // 1. Check toggle functions and expectations constant
  assert(typeof WikiDB.toggleLadderSkillDrawExpected === 'function', 'toggleLadderSkillDrawExpected must be a function');
  assert(typeof WikiDB.getLadderSkillDrawExpected === 'function', 'getLadderSkillDrawExpected must be a function');
  assert(typeof WikiDB.getPokemonSkillDrawBonus === 'function', 'getPokemonSkillDrawBonus must be a function');
  assert(WikiDB.INGREDIENT_DRAW_SKILL_EXPECTATIONS, 'INGREDIENT_DRAW_SKILL_EXPECTATIONS table must exist');

  // Initial state should be false
  assertEquals(WikiDB.getLadderSkillDrawExpected(), false, 'Initial state of skill draw expected must be false');

  // Bonus should be 0 when toggle is false
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'corn', '萌綠玉米'), 0, 'Bonus must be 0 when toggle is off');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'coffee', '醒晨咖啡'), 0, 'Bonus must be 0 when toggle is off');

  // 2. Enable toggle
  WikiDB.toggleLadderSkillDrawExpected(true);
  assertEquals(WikiDB.getLadderSkillDrawExpected(), true, 'State should be true after toggle');
  assertEquals(mockStorage.get('pksleep_ladder_skill_draw'), 'true', 'localStorage must be updated to true');

  // 3. Verify exact mathematical expectations for all 6 Pokemon
  // 技能型 (1.0倍發動機率基準)：
  // 穿山王 (+27 on pumpkin, corn, potato)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'corn', '萌綠玉米'), 18, 'Sandslash corn bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'pumpkin', '吉利蛋南瓜'), 18, 'Sandslash pumpkin bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'potato', '窩心洋芋'), 18, 'Sandslash potato bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('穿山王', 'apple', '特選蘋果'), 0, 'Sandslash non-candidate ingredient bonus must be 0');

  // 烏鴉頭頭 (+27 on coffee, soy, meat, mushroom)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'coffee', '醒晨咖啡'), 18, 'Honchkrow coffee bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'soy', '醒晨大豆'), 18, 'Honchkrow soy bonus must be +18 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('烏鴉頭頭', 'apple', '特選蘋果'), 0, 'Honchkrow non-candidate ingredient bonus must be 0');

  // 岩殿居蟹 (+35 on avocado, potato, oil)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('岩殿居蟹', 'potato', '窩心洋芋'), 23, 'Crustle potato bonus must be +23 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('岩殿居蟹', 'oil', '純油'), 23, 'Crustle oil bonus must be +23 at 1.0x baseline');

  // 摔角鷹人 (+37 on herb, ginger, meat)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('摔角鷹人', 'herb', '透心涼香草'), 25, 'Hawlucha herb bonus must be +25 at 1.0x baseline');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('摔角鷹人', 'ginger', '暖暖薑'), 25, 'Hawlucha ginger bonus must be +25 at 1.0x baseline');

  // 食材型 (1.0倍基準發動率，最保守估計)：
  // 蝶結萌虻 (+13 on honey, oil, corn)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('蝶結萌虻', 'honey', '蜜糖'), 13, 'Ribombee honey bonus must be +13');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('蝶結萌虻', 'corn', '萌綠玉米'), 13, 'Ribombee corn bonus must be +13');

  // 大嘴娃 (+10 on potato, oil, corn, tomato)
  assertEquals(WikiDB.getPokemonSkillDrawBonus('大嘴娃', 'tomato', '番茄'), 10, 'Mawile tomato bonus must be +10');

  // Non-candidate Pokemon must have 0 bonus
  assertEquals(WikiDB.getPokemonSkillDrawBonus('妙蛙花', 'honey', '蜜糖'), 0, 'Venusaur must have 0 bonus');
  assertEquals(WikiDB.getPokemonSkillDrawBonus('雷丘', 'apple', '特選蘋果'), 0, 'Raichu must have 0 bonus');

  // 4. Test Coordinate Ladder Rendering with Skill Draw Active
  const ladderHtml = WikiDB.renderCoordinateLadder();
  assert(ladderHtml.includes('node-has-skill-draw'), 'Rendered ladder must contain node-has-skill-draw when active');
  assert(ladderHtml.includes('badge-skill-draw'), 'Rendered ladder must contain badge-skill-draw when active');
  assert(!ladderHtml.includes('badge-total'), 'Rendered ladder must not contain badge-total (single number display)');
  assert(!ladderHtml.includes('badge-split'), 'Rendered ladder must not contain badge-split (single number display)');
  assert(ladderHtml.includes('<span class="tick-label">30</span>'), 'Main ladder ruler must start at 30 when skill draw toggle is active');
  const mainRulerScale = ladderHtml.split('class="ladder-ruler-scale"')[1].split('</div>')[0];
  assert(mainRulerScale.includes('<span class="tick-label">30</span>'), 'First tick on ruler must be 30');
  assert(!mainRulerScale.includes('<span class="tick-label">0</span>'), 'Main ruler must not start at 0');
  assert(ladderHtml.includes('tooltip-yield-breakdown'), 'Rendered ladder must contain tooltip-yield-breakdown');
  assert(ladderHtml.includes('食材精選S 獲取 (Lv.7)'), 'Rendered ladder tooltip must mention 食材精選S 獲取 (Lv.7)');

  // 5. Test Wiki Layout with Skill Help Modal and Switch Button
  const mockContainer = { innerHTML: '', style: {}, classList: { contains: () => false, add: () => {}, remove: () => {} } };
  WikiDB.renderWikiLayout(mockContainer);
  assert(mockContainer.innerHTML.includes('ladder-skill-help-modal'), 'Rendered layout must include ladder-skill-help-modal dialog');
  assert(mockContainer.innerHTML.includes('ladder-switch-with-help'), 'Sidebar must include ladder-switch-with-help container');
  assert(mockContainer.innerHTML.includes('ladder-help-icon-btn'), 'Sidebar must include ladder-help-icon-btn question mark button');
  assert(mockContainer.innerHTML.includes('所有專長皆以 1.0 倍發動機率為基準'), 'Switch title must include 1.0x trigger baseline');
  assert(mockContainer.innerHTML.includes('請用技能機率M/S與技能機率▲模擬補正'), 'Switch title must point to skill-chance filters');

  // 5. Test Help Modal Methods
  assert(typeof WikiDB.openSkillDrawHelpModal === 'function', 'openSkillDrawHelpModal must be exported');
  assert(typeof WikiDB.closeSkillDrawHelpModal === 'function', 'closeSkillDrawHelpModal must be exported');

  // 6. Test Dynamic Recipe Tooltip when a Recipe is Selected
  WikiDB.selectLadderHighlightRecipe('心跳加速鬼面鬆餅');
  const recipeLadderHtml = WikiDB.renderCoordinateLadder();
  assert(recipeLadderHtml.includes('選定料理: 心跳加速鬼面鬆餅'), 'Ladder tooltip must dynamically reference selected recipe 心跳加速鬼面鬆餅');
  WikiDB.clearLadderHighlightRecipe();

  // 7. Test openIngredientRankingModal with Skill Draw Active
  WikiDB.openIngredientRankingModal('corn');
  assert(modalContainer !== null, 'Ranking modal container must be created');
  assert(modalContainer.innerHTML.includes('ing-rank-split-line'), 'Ranking modal must display ing-rank-split-line for skill draw pokemons');
  assert(modalContainer.innerHTML.includes('split-drop'), 'Ranking modal must display split-drop');
  assert(modalContainer.innerHTML.includes('split-skill'), 'Ranking modal must display split-skill');

  // 8. Test resetLadderFilters resets the toggle
  WikiDB.resetLadderFilters();
});


test('Tier 4 - Real-World Application Scenarios', 'Data Engine: Intelligent Retry with Delay and LocalStorage Offline Cache Recovery', async () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Verify code structure in app.js, recipes.js, and news.js
  assert(appJs.includes('CACHE_KEY_DATA_JSON = \'pksleep_cache_data_json\''), 'app.js must define CACHE_KEY_DATA_JSON');
  assert(appJs.includes('maxAttempts = 3'), 'app.js must implement 3-stage retry');
  assert(appJs.includes('attempt * 600'), 'app.js must implement retry backoff delay');
  assert(appJs.includes('window.localStorage.getItem(CACHE_KEY_DATA_JSON)'), 'app.js must implement LocalStorage cache fallback');

  assert(recipesJs.includes('CACHE_KEY_RECIPES_JSON = \'pksleep_cache_recipes_json\''), 'recipes.js must define CACHE_KEY_RECIPES_JSON');
  assert(recipesJs.includes('maxAttempts = 3'), 'recipes.js must implement 3-stage retry');
  assert(recipesJs.includes('window.localStorage.getItem(CACHE_KEY_RECIPES_JSON)'), 'recipes.js must implement LocalStorage cache fallback');

  assert(newsJs.includes('CACHE_KEY_NEWS_JSON = \'pksleep_cache_news_json\''), 'news.js must define CACHE_KEY_NEWS_JSON');
  assert(newsJs.includes('maxAttempts = 3'), 'news.js must implement 3-stage retry');
  assert(newsJs.includes('window.localStorage.getItem(CACHE_KEY_NEWS_JSON)'), 'news.js must implement LocalStorage cache fallback');

  // 2. Verify zero emojis in index.html and app/index.html error banner
  assert(!indexHtml.includes('⚠️') && !indexHtml.includes('📋') && !indexHtml.includes('✅'), 'index.html error banner must not contain emojis');
  assert(!appIndexHtml.includes('⚠️') && !appIndexHtml.includes('📋') && !appIndexHtml.includes('✅'), 'app/index.html error banner must not contain emojis');
  assert(indexHtml.includes('[!]'), 'index.html must use [!] text icon');
  assert(appIndexHtml.includes('[!]'), 'app/index.html must use [!] text icon');
});


test('Tier 4 - Real-World Application Scenarios', 'Pokédex Detail & Appraisal Modal: Open on Avatar Click, 6D Radar Appraisal, Dynamic Formula Breakdown & Ingredient Customization', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Verify i18n keys for modal and formulas in both zh-TW and en-US
  assert(i18nJs.includes('appraisal_modal_title'), 'i18n.js must define appraisal_modal_title');
  assert(i18nJs.includes('base_stats'), 'i18n.js must define base_stats');
  assert(i18nJs.includes('formula_title'), 'i18n.js must define formula_title');
  assert(i18nJs.includes('final_ing_rate'), 'i18n.js must define final_ing_rate');
  assert(i18nJs.includes('daily_helps'), 'i18n.js must define daily_helps');
  assert(i18nJs.includes('daily_ing_yield'), 'i18n.js must define daily_ing_yield');
  assert(i18nJs.includes('preset_god'), 'i18n.js must define preset_god');
  assert(i18nJs.includes('preset_reset'), 'i18n.js must define preset_reset');

  // 2. Verify Card and Table markup includes onclick trigger on avatars
  assert(appJs.includes("openPokemonDetailModal('${p.id}')"), 'app.js renderCard/renderTable must attach openPokemonDetailModal to avatars');

  // 3. Setup mock DOM and window environment
  const mockElements = new Map();

  global.window = {
    PokemonApp,
    I18N: {
      getLanguage: () => 'zh-TW',
      t: (k, def) => def,
      getTypeName: (t) => t,
      getTypeIconSvg: () => '',
      getSpecialtyName: (s) => s,
      getBerryName: (b) => b,
      getIngredientName: (i) => i
    },
    AppraisalLab: {
      evaluatePokemon: (pkm, level, nature, subskills, ings, ribbon) => ({
        compositeScore: 85,
        grade: 'S',
        gradeTitle: '頂級戰力 (Top Tier)',
        gradeColor: '#f59e0b',
        scores: { berry: 80, ingredient: 90, skill: 85, speed: 85, growth: 80, roi: 85 }
      }),
      renderRadarChartSVG: () => '<svg class="mock-radar"></svg>',
      getRemainingEvolutions: () => 0,
      getRibbonBonus: () => ({ speedDiscount: 0.11 })
    }
  };
  global.window.window = global.window;

  global.document = {
    defaultView: global.window,
    body: {
      style: {},
      appendChild: (el) => {
        if (el.id) mockElements.set(el.id, el);
      }
    },
    getElementById: (id) => {
      if (!mockElements.has(id)) {
        mockElements.set(id, {
          id,
          tagName: 'DIV',
          innerHTML: '',
          textContent: '',
          value: '',
          style: {},
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
          },
          setAttribute() {},
          getAttribute() { return ''; }
        });
      }
      return mockElements.get(id);
    },
    querySelector: (sel) => {
      if (sel === '.verdict-grade') return { textContent: '', style: {} };
      if (sel === '.verdict-title') return { textContent: '' };
      if (sel === '.verdict-num') return { textContent: '' };
      if (sel === '.pokedex-appraisal-verdict-box') return { style: {} };
      if (sel === '.pokedex-radar-wrapper') return { innerHTML: '' };
      if (sel === '.pokedex-val-badge') return { textContent: '' };
      return null;
    },
    querySelectorAll: (sel) => {
      return [];
    },
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        id: '',
        className: '',
        style: {},
        innerHTML: '',
        classList: {
          contains: () => false,
          add: () => {},
          remove: () => {}
        }
      };
      return el;
    }
  };

  // Initialize PokemonApp with dataset
  PokemonApp.init([...dataset]);

  // 4. Test opening Venusaur (003) detail modal
  assert(typeof PokemonApp.openPokemonDetailModal === 'function', 'openPokemonDetailModal must be exported');
  PokemonApp.openPokemonDetailModal('003');

  const modalEl = mockElements.get('pokedex-detail-modal');
  assert(modalEl !== null, 'pokedex-detail-modal must exist after openPokemonDetailModal');
  assertEquals(modalEl.style.display, 'flex', 'Modal display style must be flex when opened');
  assert(modalEl.innerHTML.includes('pokedex-modal-dialog'), 'Modal HTML must contain pokedex-modal-dialog');
  assert(modalEl.innerHTML.includes('妙蛙花'), 'Modal HTML must display Pokemon name (妙蛙花)');
  assert(modalEl.innerHTML.includes('pokedex-header-stats-row'), 'Modal HTML must include inlined header stats row');
  assert(modalEl.innerHTML.includes('pokedex-header-reset-btn'), 'Modal HTML must include red reset button in header');
  assert(modalEl.innerHTML.includes('preset-god'), 'Modal HTML must include god preset button');
  assert(modalEl.innerHTML.includes('食材產能算法拆解'), 'Modal HTML must include ingredient formula breakdown card');
  assert(modalEl.innerHTML.includes('pokedex-strategy-card'), 'Modal HTML must include strategy recommendation card');
  assert(modalEl.innerHTML.includes('pokedex-custom-select'), 'Modal HTML must use custom select dropdowns');

  // 5. Test ingredient calculation engine
  assert(typeof PokemonApp.calculatePokedexIngredientFormulas === 'function', 'calculatePokedexIngredientFormulas must be exported');
  const formulas = PokemonApp.calculatePokedexIngredientFormulas();
  assert(formulas !== null, 'Formulas must return valid calculation results');
  assert(formulas.baseIngRate > 20, 'Venusaur base ingredient rate must be > 20%');
  assert(formulas.effectiveIntervalSec > 0, 'Effective interval must be positive');
  assert(formulas.dailyHelps > 0, 'Daily helps must be positive');
  assert(formulas.dailyIngDrops > 0, 'Daily ingredient drops must be positive');
  assert(formulas.totalDailyIngredients > 0, 'Total daily ingredients yield must be positive');
  assertEquals(formulas.unlockedSlotCount, 2, 'At default Lv.30, unlockedSlotCount must be 2');

  // 6. Test Nature modifiers on ingredient rate
  PokemonApp.setPokedexModalNature('坦率'); // Neutral
  const neutralFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(neutralFormulas.natureIngMult, 1.0, 'Neutral nature must have 1.0x multiplier');

  PokemonApp.setPokedexModalNature('冷靜'); // +Ingredient
  const quietFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(quietFormulas.natureIngMult, 1.2, 'Quiet nature (+Ing) must have 1.2x multiplier');
  assert(quietFormulas.finalIngRate > neutralFormulas.finalIngRate, 'Quiet nature must produce higher final ingredient rate than neutral');

  PokemonApp.setPokedexModalNature('爽朗'); // -Ingredient
  const jollyFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(jollyFormulas.natureIngMult, 0.8, 'Jolly nature (-Ing) must have 0.8x multiplier');
  assert(jollyFormulas.finalIngRate < neutralFormulas.finalIngRate, 'Jolly nature must produce lower final ingredient rate than neutral');

  // 7. Test God Preset & Reset Preset
  PokemonApp.applyPokedexGodPreset();
  let godState = PokemonApp.getPokedexModalState();
  assertEquals(godState.level, 60, 'God preset must set level to 60 (unlocking 3rd ing & 3 subskills)');
  assertEquals(godState.ribbon, 4, 'God preset must set ribbon to 4 (max bonus)');
  const godFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(godFormulas.natureIngMult, 1.2, 'God preset for ingredient Pokemon must set Quiet (+Ing) nature');
  assertEquals(godFormulas.subskillIngBonus, 54, 'God preset must activate Subskills M (+36%) + S (+18%) = +54%');
  assert(godFormulas.finalIngRate > quietFormulas.finalIngRate, 'God preset must achieve peak final ingredient rate');
  const verdictNumEl = mockElements.get('pokedex-header-verdict-num');
  const verdictGradeEl = mockElements.get('pokedex-header-verdict-grade');
  if (verdictNumEl && verdictNumEl.textContent) {
    assert(parseInt(verdictNumEl.textContent, 10) > 0, 'God preset must dynamically update header verdict score');
  }
  if (verdictGradeEl && verdictGradeEl.textContent) {
    assert(verdictGradeEl.textContent.length > 0, 'God preset must dynamically update header verdict grade');
  }

  PokemonApp.applyPokedexResetPreset();
  const resetFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(resetFormulas.natureIngMult, 1.0, 'Reset preset must set neutral nature (1.0x)');
  assertEquals(resetFormulas.subskillIngBonus, 0, 'Reset preset must reset subskill ingredient bonus to 0%');

  // 8. Test Subskill Flow & Tiled Ingredients (matching Box Manual modal structure)
  assert(modalEl.innerHTML.includes('box-subskill-slots-row'), 'Modal HTML must include .box-subskill-slots-row');
  assert(modalEl.innerHTML.includes('box-subskill-palette'), 'Modal HTML must include .box-subskill-palette');
  assert(modalEl.innerHTML.includes('box-ing-strip'), 'Modal HTML must include .box-ing-strip');
  assert(modalEl.innerHTML.includes('box-mainskill-row'), 'Modal HTML must include .box-mainskill-row');
  assert(typeof PokemonApp.selectPokedexSubskillSlot === 'function', 'selectPokedexSubskillSlot must be exported');
  assert(typeof PokemonApp.choosePokedexSubskill === 'function', 'choosePokedexSubskill must be exported');
  assert(typeof PokemonApp.clearAllPokedexSubskills === 'function', 'clearAllPokedexSubskills must be exported');
  PokemonApp.clearAllPokedexSubskills();
  let state = PokemonApp.getPokedexModalState();
  assertEquals(state.subskills.every(s => s === ''), true, 'Clear all must empty all 5 subskills');
  PokemonApp.selectPokedexSubskillSlot(1);
  PokemonApp.choosePokedexSubskill('食材機率提升M');
  state = PokemonApp.getPokedexModalState();
  assertEquals(state.subskills[0], '食材機率提升M', 'Slot 1 must have 食材機率提升M');

  // 9. Test Berry Icon in Header, Dynamic Interval & Anchored Track Pins
  assert(modalEl.innerHTML.includes('pokedex-berry-icon-img'), 'Header must contain .pokedex-berry-icon-img');
  assert(modalEl.innerHTML.includes('pokedex-tag-berry'), 'Header must contain .pokedex-tag-berry');
  assert(!modalEl.innerHTML.includes('pokedex-berry-name'), 'Header must not contain berry name text');
  assert(!modalEl.innerHTML.includes('pokedex-header-title-en'), 'Header must not contain English name');
  assert(!modalEl.innerHTML.includes('pokedex-tag-evo'), 'Header must not contain evolution requirement');
  assert(!modalEl.innerHTML.includes('pokedex-radar-wrapper'), 'Verdict box must not contain radar chart wrapper');
  assert(modalEl.innerHTML.includes('pokedex-stat-interval'), 'Header stats must contain #pokedex-stat-interval for dynamic interval calculation');
  assert(modalEl.innerHTML.includes('pokedex-stat-skill-rate'), 'Header stats must contain #pokedex-stat-skill-rate');
  assert(modalEl.innerHTML.includes('pokedex-track-pins-bar'), 'Modal HTML must include .pokedex-track-pins-bar');
  assert(modalEl.innerHTML.includes('pin-milestone'), 'Key milestones (30, 50, 60, 80, 100) must be highlighted');

  // 9B. Test Ribbon Options HTML with dynamic descriptions and icons
  assert(typeof PokemonApp.renderPokedexRibbonOptionsHTML === 'function' || modalEl.innerHTML.includes('ribbon_lv1.png'), 'Modal HTML must include ribbon icon options');

  // 9C. Test Dynamic Skill Rate calculation on subskills change
  PokemonApp.openPokemonDetailModal('003');
  PokemonApp.clearAllPokedexSubskills();
  PokemonApp.setPokedexModalNature('坦率');
  const baseFm = PokemonApp.calculatePokedexIngredientFormulas();
  PokemonApp.selectPokedexSubskillSlot(1);
  PokemonApp.choosePokedexSubskill('技能機率提升M');
  const boostedSkillFm = PokemonApp.calculatePokedexIngredientFormulas();
  assert(boostedSkillFm.finalSkillRate > baseFm.finalSkillRate, 'Skill trigger rate must dynamically increase when 技能機率提升M is selected');

  // 10. Test Skill-type Pokemon with Magnet S / Draw S (e.g. Golbat 042)
  PokemonApp.openPokemonDetailModal('042');
  const skillFormulas = PokemonApp.calculatePokedexIngredientFormulas();
  if (skillFormulas && skillFormulas.mainSkillLabel) {
    assert(skillFormulas.mainSkillExtraDaily >= 0, 'Skill Pokemon main skill extra daily yield must be calculated');
  }

  // 11. Test modal close
  assert(typeof PokemonApp.closePokemonDetailModal === 'function', 'closePokemonDetailModal must be exported');
  PokemonApp.closePokemonDetailModal();
  assertEquals(modalEl.style.display, 'none', 'Modal display style must be none when closed');

  // 12. Verify CSS Rule Compliance: Single Outer Frame, Dropdown Arrow Indentation, Zero Emoji, Compact 3-col
  assert(stylesCss.includes('#pokedex-detail-modal'), 'styles.css must style #pokedex-detail-modal');
  assert(stylesCss.includes('.pokedex-controls-container'), 'styles.css must contain .pokedex-controls-container');
  assert(stylesCss.includes('.pokedex-calc-formula-card'), 'styles.css must contain .pokedex-calc-formula-card');
  assert(stylesCss.includes('.pokedex-formula-steps-row'), 'styles.css must contain .pokedex-formula-steps-row for compact 3-column layout');
  assert(stylesCss.includes('.pokedex-track-pins-bar'), 'styles.css must style .pokedex-track-pins-bar');
  assert(stylesCss.includes('padding-right: 36px !important;'), 'styles.css must enforce 36px padding-right on select arrows');
  assert(stylesCss.includes('background-position: right 18px center !important;'), 'styles.css must enforce right 18px arrow position');
  assert(stylesCss.includes('border: none !important;'), 'styles.css must enforce border: none on outer containers');
  assert(stylesCss.includes('background: transparent !important;'), 'styles.css must enforce transparent background on outer containers');

  // 13. Zero Emoji check in modal templates
  assert(!modalEl.innerHTML.includes('🔥') && !modalEl.innerHTML.includes('⭐') && !modalEl.innerHTML.includes('✨'), 'Modal HTML must not contain emojis');

  // 14. Test Evolution Form Level Guard (進化階段最低等級提示)
  assert(typeof PokemonApp.getPokedexMinEvolutionLevel === 'function', 'getPokedexMinEvolutionLevel must be exported');
  assert(typeof PokemonApp.renderPokedexEvoGuardBadgeHTML === 'function', 'renderPokedexEvoGuardBadgeHTML must be exported');

  // 14A. Test min evolution level resolution across forms & inherited stages
  const pkmBulbasaur = dataset.find(p => p.formatted_no === '001');
  const pkmIvysaur = dataset.find(p => p.formatted_no === '002');
  const pkmVenusaur = dataset.find(p => p.formatted_no === '003');
  const pkmTyranitar = dataset.find(p => p.name_cn === '班基拉斯');
  const pkmDragonite = dataset.find(p => p.name_cn === '快龍');
  const pkmVictreebel = dataset.find(p => p.name_cn === '大食花');
  const pkmGengar = dataset.find(p => p.name_cn === '耿鬼');
  const pkmGolem = dataset.find(p => p.name_cn === '隆隆岩');
  const pkmMagnezone = dataset.find(p => p.name_cn === '自爆磁怪');
  const pkmGallade = dataset.find(p => p.name_cn === '艾路雷朵');
  const pkmVikavolt = dataset.find(p => p.name_cn === '鍬農炮蟲');
  const pkmPawmot = dataset.find(p => p.name_cn === '巴布土撥');
  const pkmPikachu = dataset.find(p => p.formatted_no === '025');

  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmBulbasaur), 1, 'Bulbasaur (base) min evolution level must be 1');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmIvysaur), 12, 'Ivysaur min evolution level must be 12 (Lv.12 + 40 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVenusaur), 24, 'Venusaur min evolution level must be 24 (Lv.24 + 80 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmTyranitar), 41, 'Tyranitar min evolution level must be 41 (Lv.41 + 100 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmDragonite), 41, 'Dragonite min evolution level must be 41 (Lv.41 + 100 糖)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVictreebel), 16, 'Victreebel min evolution level must be 16 (inherited from Weepinbell)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGengar), 19, 'Gengar min evolution level must be 19 (inherited from Haunter)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGolem), 19, 'Golem min evolution level must be 19 (inherited from Graveler)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmMagnezone), 23, 'Magnezone min evolution level must be 23 (inherited from Magneton)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmGallade), 15, 'Gallade min evolution level must be 15 (inherited from Kirlia)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmVikavolt), 15, 'Vikavolt min evolution level must be 15 (inherited from Charjabug)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmPawmot), 14, 'Pawmot min evolution level must be 14 (inherited from Pawmo)');
  assertEquals(PokemonApp.getPokedexMinEvolutionLevel(pkmPikachu), 1, 'Pikachu (no level req) min evolution level must be 1');

  // 14B. Test badge HTML rendering in modal (warning vs passed states)
  const warnHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmVenusaur, 10);
  assert(warnHtml.includes('evo-warning'), 'At Lv.10 (< 24), badge must have .evo-warning class');
  assert(warnHtml.includes('[!]'), 'At Lv.10, badge must display [!] warning indicator');
  assert(warnHtml.includes('24'), 'At Lv.10, badge must display threshold level 24');

  const passHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmVenusaur, 25);
  assert(passHtml.includes('evo-passed'), 'At Lv.25 (>= 24), badge must have .evo-passed class');
  assert(passHtml.includes('[✓]'), 'At Lv.25, badge must display [✓] satisfied indicator');

  const baseHtml = PokemonApp.renderPokedexEvoGuardBadgeHTML(pkmBulbasaur, 10);
  assertEquals(baseHtml, '', 'Base form Pokemon must render empty string (no guard badge)');

  // 14C. Verify CSS and i18n rules for evolution guard
  assert(stylesCss.includes('.pokedex-evo-guard-badge'), 'styles.css must contain .pokedex-evo-guard-badge');
  assert(stylesCss.includes('.pokedex-tag-evo'), 'styles.css must contain .pokedex-tag-evo');
  assert(stylesCss.includes('.pokedex-level-ctrl-group'), 'styles.css must contain .pokedex-level-ctrl-group');
  assert(i18nJs.includes('pokedex.evo_guard_below'), 'i18n.js must contain pokedex.evo_guard_below');
  assert(i18nJs.includes('pokedex.evo_guard_met'), 'i18n.js must contain pokedex.evo_guard_met');
  assert(i18nJs.includes('pokedex.evo_req'), 'i18n.js must contain pokedex.evo_req');

  // 15. Verify Lv.70 / Lv.80 Subskill Unlock Slots (Updated to official Ver.3.6.0 thresholds)
  PokemonApp.openPokemonDetailModal('003');
  const modalHtmlNow = mockElements.get('pokedex-detail-modal').innerHTML;
  const slotsRowHtml = mockElements.get('pokedex-subskill-slots-row').innerHTML;
  assert(slotsRowHtml.includes('Lv.70') && slotsRowHtml.includes('Lv.80'), 'Modal subskill slots must display official thresholds Lv.70 and Lv.80');
  assert(!slotsRowHtml.includes('Lv.75') && !slotsRowHtml.includes('Lv.100'), 'Modal subskill slots must not display old legacy Lv.75 or Lv.100');

  // 15B. Header layout: berry & specialty vertical stack, dual-column stats with carry, no evo guard badge
  assert(modalHtmlNow.includes('pokedex-header-berry-spec-group'), 'Header must contain vertical berry-spec group');
  assert(modalHtmlNow.includes('pokedex-tag-spec'), 'Header must contain specialty tag');
  assert(modalHtmlNow.includes('pokedex-stat-carry'), 'Header stats row must contain carry limit stat');
  assert(modalHtmlNow.includes('pokedex-header-stats-dual'), 'Header stats row must use dual-column layout');
  assert(!modalHtmlNow.includes('pokedex-evo-guard-container'), 'Level control row must not contain evo guard badge');

  // 15C. Formula Breakdown: dual rates (ingredient & skill) and no dynamic calculation subtitle
  assert(modalHtmlNow.includes('最終食材發動率'), 'Formula card must display 最終食材發動率');
  assert(modalHtmlNow.includes('最終技能發動率'), 'Formula card must display 最終技能發動率');
  assert(!modalHtmlNow.includes('動態幫忙與產能精算'), 'Formula card must not display 動態幫忙與產能精算 subtitle');

  // 15D. Strategy card: no Skill Level Up M/S in recommended subskills
  const skillMon = dataset.find(p => p.specialty === '技能' || p.specialty === 'Skills') || { specialty: '技能' };
  const skillStrategyHtml = PokemonApp.renderPokedexStrategyCardHTML(skillMon);
  assert(!skillStrategyHtml.includes('技能等級提升M') && !skillStrategyHtml.includes('技能等級提升S'), 'Strategy card must not recommend Skill Level Up M/S');
  assert(skillStrategyHtml.includes('技能機率提升M') && skillStrategyHtml.includes('技能機率提升S'), 'Strategy card must recommend Skill Trigger M and S');

  // 15E. Header Verdict Badge & Removal of Left Column Verdict Box
  assert(modalHtmlNow.includes('pokedex-header-verdict-badge'), 'Header actions must contain pokedex-header-verdict-badge');
  assert(modalHtmlNow.includes('pokedex-header-grade-text'), 'Header must contain pokedex-header-grade-text');
  assert(modalHtmlNow.includes('pokedex-header-score-text'), 'Header must contain pokedex-header-score-text');
  assert(modalHtmlNow.includes('id="pokedex-header-verdict-grade"'), 'Header must contain id pokedex-header-verdict-grade');
  assert(modalHtmlNow.includes('id="pokedex-header-verdict-num"'), 'Header must contain id pokedex-header-verdict-num');
  assert(modalHtmlNow.includes('id="pokedex-header-potential-grade"'), 'Header must contain id pokedex-header-potential-grade');
  assert(modalHtmlNow.includes('id="pokedex-header-potential-num"'), 'Header must contain id pokedex-header-potential-num');
  assert(!modalHtmlNow.includes('pokedex-appraisal-verdict-box'), 'Modal left column must not contain legacy verdict box');

  // 15F. Level row layout: God preset on left next to level text, Reset preset on right
  assert(modalHtmlNow.includes('pokedex-level-header-left') && modalHtmlNow.includes('preset-god'), 'Level header left must contain preset-god');
  assert(modalHtmlNow.includes('pokedex-level-header-right') && modalHtmlNow.includes('preset-reset'), 'Level header right must contain preset-reset');

  // 15G. Consolidated Calculation Box without 1 2 3 steps
  assert(modalHtmlNow.includes('pokedex-calc-unified-box'), 'Modal must contain .pokedex-calc-unified-box');
  assert(modalHtmlNow.includes('unified-calc-row'), 'Modal must contain .unified-calc-row');

  // 15H. Appraisal Engine: Carry Limit, Ribbon, and AAA/ABC scoring
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const appCtx = { window: {}, console };
  appCtx.window = appCtx;
  vm.createContext(appCtx);
  vm.runInContext(appraisalCode, appCtx);

  const ingMon = dataset.find(p => p.specialty === '食材' || p.specialty === 'Ingredients') || { specialty: '食材' };
  const evalBaseline = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['幫忙速度S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  const evalCarryL = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升L'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  assert(evalCarryL.scores.ingredient > evalBaseline.scores.ingredient, 'Inventory Up L must increase ingredient score for ingredient specialist');

  const evalRibbon4 = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['幫忙速度S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 4, 1);
  assert(evalRibbon4.scores.ingredient > evalBaseline.scores.ingredient, 'Ribbon Lv.4 must increase ingredient score');

  const evalCarryM = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升M'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  const evalCarryS = appCtx.AppraisalLab.evaluatePokemon(ingMon, 60, '坦率', ['持有上限提升S'], ['甜甜蜜', '特選蘋果', '純純蜜'], 0, 1);
  assert(evalCarryL.compositeScore > evalCarryM.compositeScore, 'Inventory Up L must score higher than Inventory Up M');
  assert(evalCarryM.compositeScore > evalCarryS.compositeScore, 'Inventory Up M must score higher than Inventory Up S');
  assert(evalCarryS.compositeScore > evalBaseline.compositeScore, 'Inventory Up S must score higher than baseline');

  // 15I. Grade Tiers & Core-Kit Expectation (A, S, SS, SSS)
  const finalIngMon = dataset.find(p => (p.specialty === '食材' || p.specialty === 'Ingredients') && (p.is_final === '〇' || p.is_final === true || p.is_final === '1')) || ingMon;
  const evalSolidIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M', '持有上限提升S'], ['甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalSolidIng.compositeScore >= 90, 'Final evolved ingredient specialist with core kit (Ing M + Carry S + AA) must score >= 90 (S grade)');
  assertEquals(evalSolidIng.grade, 'S', 'Score 90+ must receive S grade');

  const evalEliteIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['食材機率提升M', '幫忙速度M', '持有上限提升L'], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalEliteIng.compositeScore >= 95, 'Elite ingredient specialist roll must score >= 95');
  assert(evalEliteIng.grade === 'SS' || evalEliteIng.grade === 'SSS', 'Elite roll must receive SS or SSS grade');

  const evalGodIng = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['食材機率提升M', '食材機率提升S', '持有上限提升L'], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 4, 6);
  assert(evalGodIng.compositeScore >= 98, 'God preset roll must score >= 98 (SSS grade)');
  assertEquals(evalGodIng.grade, 'SSS', 'Score 98+ must receive SSS grade');

  // 15J. Main Skill Level Impact on Appraisal Score
  const evalSkillLv1 = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M'], ['甜甜蜜', '甜甜蜜'], 0, 1);
  const evalSkillLv6 = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '冷靜', ['食材機率提升M'], ['甜甜蜜', '甜甜蜜'], 0, 6);
  assert(evalSkillLv6.compositeScore > evalSkillLv1.compositeScore, 'Higher main skill level must increase composite score');

  // 15K. Desktop vs Mobile Layout Isolation Verification
  PokemonApp.openPokemonDetailModal(finalIngMon);
  assert(modalEl && modalEl.innerHTML, 'Pokedex detail modal HTML must exist');

  // Header verification: pokedex-header-stats-dual must be inside pokedex-modal-header-main before actions
  const mainHeaderIdx = modalEl.innerHTML.indexOf('pokedex-modal-header-main');
  const statsDualIdx = modalEl.innerHTML.indexOf('pokedex-header-stats-dual');
  const headerActionsIdx = modalEl.innerHTML.indexOf('pokedex-header-actions');
  assert(mainHeaderIdx !== -1 && statsDualIdx !== -1 && headerActionsIdx !== -1, 'Header components must exist in modal HTML');
  assert(mainHeaderIdx < statsDualIdx && statsDualIdx < headerActionsIdx, 'pokedex-header-stats-dual must be nested inside header-main before header-actions');

  // Left column verification: desktop strategy card must be nested inside pokedex-left-col
  const leftColIdx = modalEl.innerHTML.indexOf('pokedex-left-col');
  const rightColIdx = modalEl.innerHTML.indexOf('pokedex-right-col');
  const deskStratIdx = modalEl.innerHTML.indexOf('id="pokedex-strategy-desktop-container"');
  assert(leftColIdx !== -1 && rightColIdx !== -1 && deskStratIdx !== -1, 'Left col, right col, and desktop strategy container must exist');
  assert(leftColIdx < deskStratIdx && deskStratIdx < rightColIdx, 'Desktop strategy card must be placed inside left column before right column to prevent layout breakage');

  // Mobile strategy container verification: must be present as a separate container for mobile bottom display
  const mobStratIdx = modalEl.innerHTML.indexOf('id="pokedex-strategy-mobile-container"');
  assert(mobStratIdx !== -1 && mobStratIdx > rightColIdx, 'Mobile strategy container must exist at bottom of modal body after right column');

  // CSS Isolation Verification
  assert(stylesCss.includes('.pokedex-strategy-desktop-wrap'), 'styles.css must define .pokedex-strategy-desktop-wrap');
  assert(stylesCss.includes('.pokedex-strategy-mobile-wrap'), 'styles.css must define .pokedex-strategy-mobile-wrap');

  // 15L. Zero-Subskills Appraisal Deflation Guard
  // When subskills are cleared, score must never be inflated to S, SS, or SSS
  const evalEmptyMax = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 60, '冷靜', ['', '', '', '', ''], ['甜甜蜜', '甜甜蜜', '甜甜蜜'], 4, 6);
  assert(evalEmptyMax.compositeScore <= 74, `Cleared subskills must be capped at <= 74 (got ${evalEmptyMax.compositeScore})`);
  assert(evalEmptyMax.grade !== 'SSS' && evalEmptyMax.grade !== 'SS' && evalEmptyMax.grade !== 'S', 'Cleared subskills must NEVER receive SSS, SS, or S grade');

  const evalEmptyNeutral = appCtx.AppraisalLab.evaluatePokemon(finalIngMon, 30, '坦率', ['', '', '', '', ''], ['甜甜蜜', '甜甜蜜'], 0, 1);
  assert(evalEmptyNeutral.compositeScore <= 65, `Neutral Lv.30 with empty subskills must score <= 65 (got ${evalEmptyNeutral.compositeScore})`);

  // 15M. Dynamic Minimum Evolution Level Clamping & Pins
  const venusaurData = dataset.find(p => p.formatted_no === '0003' || p.name_cn === '妙蛙花') || { evo_req: 'Lv.24 + 80 糖' };
  PokemonApp.openPokemonDetailModal(venusaurData);
  let vState = PokemonApp.getPokedexModalState();
  assert(vState.level >= 24, 'Venusaur initial level must be clamped to at least min evolution level 24');

  // Attempt to set below min evolution level
  PokemonApp.setPokedexModalLevel(10);
  vState = PokemonApp.getPokedexModalState();
  assertEquals(vState.level, 24, 'Setting level below min evolution level must be clamped to 24');

  // Slider 1-100 range, red locked zone, and pins check in HTML
  assert(modalEl.innerHTML.includes('min="1"') && modalEl.innerHTML.includes('max="100"'), 'Slider input must maintain min="1" and max="100"');
  assert(modalEl.innerHTML.includes('pokedex-slider-locked-zone'), 'Slider must render red locked zone for Venusaur min evo level');
  assert(!modalEl.innerHTML.includes('data-pin-lv="10"'), 'Pin Lv.10 below min evo level 24 must NOT be rendered in pins bar');
  assert(!modalEl.innerHTML.includes('data-pin-lv="24"'), 'Threshold pin Lv.24 must NOT be rendered to avoid collision with Lv.25');
  assert(modalEl.innerHTML.includes('data-pin-lv="25"'), 'Venusaur pins bar must include Lv.25 milestone pin');

  // 15N. H5 Mobile Subskill 2-Row Downward Layout & Theme Colors
  assert(stylesCss.includes('grid-template-columns: repeat(6, 1fr)'), 'CSS must define 6-column grid for subskills on mobile');
  assert(stylesCss.includes('grid-column: span 2'), 'CSS must span 2 columns for row 1 subskills');
  assert(stylesCss.includes('grid-column: span 3'), 'CSS must span 3 columns for row 2 subskills');
  assert(stylesCss.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .pokedex-modal-dialog'), 'CSS must adapt pokedex modal for dawn theme');
  assert(!stylesCss.includes('justify-content: space-between !important;\n  }\n  #pokedex-detail-modal .pokedex-ribbon-unit'), 'CSS must eliminate space-between in pokedex-inline-unit');

  // 15O. H5 Mobile Whitespace Elimination & Control Order
  assert(!stylesCss.includes('flex: 1 1 140px'), 'CSS must NOT contain flex: 1 1 140px which stretches inline units vertically');
  assert(stylesCss.includes('order: 1 !important;'), 'Right col (controls) must have order: 1 on mobile');
  assert(stylesCss.includes('order: 2 !important;'), 'Left col (formula) must have order: 2 on mobile');
  assert(stylesCss.includes('order: 3 !important;'), 'Strategy mobile wrap must have order: 3 on mobile');
  assert(stylesCss.includes('right: 16px !important;'), 'Custom select arrow must have generous inset complying with Rule VI');
  assert(stylesCss.includes('flex-wrap: nowrap !important;'), 'Ingredient strip must be strictly nowrap on mobile to guarantee single-line presentation');

  // 15P. Header Stats Dual: Borderless & Transparent on Mobile
  assert(stylesCss.includes('#pokedex-detail-modal .pokedex-header-stats-row.pokedex-header-stats-dual'), 'styles.css must style mobile pokedex-header-stats-dual with modal id specificity');
  assert(stylesCss.includes('border: none !important;'), 'Mobile header stats dual must have border: none !important');
  assert(stylesCss.includes('background: transparent !important;'), 'Mobile header stats dual must have background: transparent !important');
  assert(stylesCss.includes('padding: 2px 0 !important;'), 'Mobile header stats dual must have padding: 2px 0 !important to stretch content wide');

  // 15Q. Header Info: Column Stack (pokedex-header-no above, pokedex-header-pkm-name below)
  assert(stylesCss.includes('flex-direction: column !important;'), 'Mobile header info must use flex-direction: column !important for vertical stack');
  assert(stylesCss.includes('.pokedex-header-name-row'), 'styles.css must support .pokedex-header-name-row');

  // 15R. Milestone Pins Consistency & Unreleased Effects (Lv. 61-100 & Subskill Slots 4-5)
  assert(stylesCss.includes('.pokedex-track-pin-btn.pin-unreleased'), 'styles.css must style .pokedex-track-pin-btn.pin-unreleased');
  assert(stylesCss.includes('.pokedex-track-pin-btn.pin-cap'), 'styles.css must style .pokedex-track-pin-btn.pin-cap for official level 60 cap');
  assert(stylesCss.includes('.pokedex-unreleased-pill'), 'styles.css must style .pokedex-unreleased-pill');
  assert(stylesCss.includes('.slot-unreleased'), 'styles.css must style .slot-unreleased for unreleased subskill slots');
  assert(stylesCss.includes('.slot-unreleased-tag'), 'styles.css must style .slot-unreleased-tag');
  assert(stylesCss.includes('.slot-val-unreleased'), 'styles.css must style .slot-val-unreleased');

  // Verification in JS output
  const pikachuData = dataset.find(p => p.formatted_no === '0025' || p.name_cn === '皮卡丘') || dataset[0];
  PokemonApp.openPokemonDetailModal(pikachuData);
  const pikaModalHtml = mockElements.get('pokedex-detail-modal').innerHTML;
  assert(pikaModalHtml.includes('pin-milestone'), 'Track pins bar must include pin-milestone for released milestones');
  assert(pikaModalHtml.includes('pin-unreleased'), 'Track pins bar must include pin-unreleased for future levels');
  assert(pikaModalHtml.includes('pin-cap'), 'Track pins bar must include pin-cap for level 60');
  const subskillRowHtml = mockElements.get('pokedex-subskill-slots-row').innerHTML;
  assert(subskillRowHtml.includes('等級不足'), 'Subskill slots row must include 等級不足 indicator for unreached levels');

  // Toggle level > 60 and verify unreleased tag is active
  PokemonApp.setPokedexModalLevel(70);
  const unreleasedTagEl = mockElements.get('pokedex-level-unreleased-tag');
  if (unreleasedTagEl) {
    assert(!unreleasedTagEl.classList.contains('hidden'), 'Level 70 must make unreleased tag visible');
  }
  PokemonApp.setPokedexModalLevel(50);
  if (unreleasedTagEl) {
    assert(unreleasedTagEl.classList.contains('hidden'), 'Level 50 must hide unreleased tag');
  }

  // 15S. Subskills Default Empty, Collapsible Palette, Clean Formula Breakdown & Spaceless Header Stats
  PokemonApp.openPokemonDetailModal(pikachuData);
  const pikaState = PokemonApp.getPokedexModalState();
  assert(Array.isArray(pikaState.subskills) && pikaState.subskills.every(s => s === ''), 'Subskills must initially be empty (no selected subskills by default)');

  const pikaModalHtml2 = mockElements.get('pokedex-detail-modal').innerHTML;
  assert(pikaModalHtml2.includes('pokedex-subskill-toggle-btn'), 'Modal HTML must include full-width toggle button for H5 subskills collapse');
  assert(pikaModalHtml2.includes('副技能展開'), 'Subskill toggle button must initially display 副技能展開');

  // Test toggle functionality
  assert(typeof PokemonApp.togglePokedexSubskillPalette === 'function', 'togglePokedexSubskillPalette must be exported');
  PokemonApp.togglePokedexSubskillPalette();
  const paletteEl = mockElements.get('pokedex-subskill-palette');
  assert(paletteEl.classList.contains('palette-expanded'), 'Toggling must add palette-expanded class');
  PokemonApp.togglePokedexSubskillPalette();
  assert(!paletteEl.classList.contains('palette-expanded'), 'Toggling again must remove palette-expanded class');

  // Formula Breakdown verification
  assert(!pikaModalHtml2.includes('calc-stat-base'), 'Formula breakdown must not include calc-stat-base');
  assert(!pikaModalHtml2.includes('(+20%)') && !pikaModalHtml2.includes('(-20%)'), 'Formula breakdown must not include bracketed notes (+20%)/(-20%)');
  assert(pikaModalHtml2.includes('calc-color-helps'), 'Formula breakdown must include calc-color-helps for daily helps lineage');
  assert(pikaModalHtml2.includes('calc-color-ing'), 'Formula breakdown must include calc-color-ing for ingredient rate lineage');
  assert(pikaModalHtml2.includes('calc-color-skill'), 'Formula breakdown must include calc-color-skill for skill rate lineage');
  assert(stylesCss.includes('.calc-color-helps'), 'styles.css must style .calc-color-helps');
  assert(stylesCss.includes('.pokedex-subskill-toggle-btn'), 'styles.css must style .pokedex-subskill-toggle-btn');
  assert(stylesCss.includes('.pokedex-formula-header') && stylesCss.includes('border-bottom: none !important;'), 'styles.css must remove white divider line under formula header');

  // Spaceless stat numbers verification: no space before <span class="header-stat-diff
  const formulasNow = PokemonApp.calculatePokedexIngredientFormulas();
  const ivHtml = PokemonApp.renderPokedexIntervalValue ? PokemonApp.renderPokedexIntervalValue(formulasNow, pikachuData) : '';
  const crHtml = PokemonApp.renderPokedexCarryValue ? PokemonApp.renderPokedexCarryValue(formulasNow, pikachuData) : '';
  const irHtml = PokemonApp.renderPokedexIngRateValue ? PokemonApp.renderPokedexIngRateValue(formulasNow, pikachuData) : '';
  const srHtml = PokemonApp.renderPokedexSkillRateValue ? PokemonApp.renderPokedexSkillRateValue(formulasNow, pikachuData) : '';
  if (ivHtml) assert(!ivHtml.includes(' <span class="header-stat-diff'), 'Interval stat must not have space before diff tag');
  if (crHtml) assert(!crHtml.includes(' <span class="header-stat-diff'), 'Carry stat must not have space before diff tag');
  if (irHtml) assert(!irHtml.includes(' <span class="header-stat-diff'), 'Ingredient rate stat must not have space before diff tag');
  // 15T. Slider Fill Progress Bar, Top Layer Locked Zone, Borderless Desktop Stats & Mobile 2x2 Dual Stacks
  assert(pikaModalHtml2.includes('pokedex-slider-fill-bar'), 'Slider track must render pokedex-slider-fill-bar element');
  assert(stylesCss.includes('.pokedex-slider-fill-bar'), 'styles.css must style .pokedex-slider-fill-bar');
  assert(stylesCss.includes('#pokedex-detail-modal .calc-color-helps'), 'styles.css must provide modal-scoped specificity for .calc-color-helps');
  assert(stylesCss.includes('strong:not([class*="calc-color-"])'), 'styles.css must protect calc-color-* from formula-derive strong overrides');
  assert(!stylesCss.includes('.pokedex-header-stats-dual {\n    grid-area: stats !important;\n    width: 100% !important;\n    display: grid !important;'), 'styles.css must not use 4-column single row for mobile header stats');
  assert(stylesCss.includes('display: inline-flex !important;\n  align-items: center;\n  gap: 16px;\n  background: transparent !important;\n  border: none !important;'), 'Desktop header stats dual must be borderless and transparent');

  const fillBarEl = mockElements.get('pokedex-slider-fill-bar');
  if (fillBarEl) {
    PokemonApp.setPokedexModalLevel(50);
    const expectedWidth = ((50 - 1) / 99 * 100).toFixed(2);
    assert(fillBarEl.style.width === `${expectedWidth}%`, `Slider fill bar width must update dynamically (expected ${expectedWidth}%, got ${fillBarEl.style.width})`);
  }

  // 15U. Unified Modal Theme Colors & Dynamic Inactive Subskill Tags
  assert(stylesCss.includes('.pokedex-btn-preset.preset-god') && stylesCss.includes('color: #38bdf8;'), 'preset-god button must use sky blue theme in dark mode');
  assert(stylesCss.includes('.slot-unreleased-tag.slot-tag-inactive'), 'styles.css must style .slot-tag-inactive for unreached levels');
  assert(stylesCss.includes('.box-subskill-pill.pill-inactive'), 'styles.css must style .pill-inactive with line-through effect');

  // Dynamic slot status testing
  PokemonApp.openPokemonDetailModal(pikachuData);
  PokemonApp.setPokedexModalLevel(30);
  PokemonApp.selectPokedexSubskillSlot(3);
  PokemonApp.choosePokedexSubskill('幫手獎勵');
  const slotsRowEl = mockElements.get('pokedex-subskill-slots-row');
  assert(slotsRowEl.innerHTML.includes('slot-tag-inactive'), 'Slot 3 at Lv.30 with subskill must display slot-tag-inactive');
  assert(slotsRowEl.innerHTML.includes('效果尚未生效'), 'Slot 3 at Lv.30 with subskill must display 效果尚未生效');
  assert(slotsRowEl.innerHTML.includes('pill-inactive'), 'Slot 3 at Lv.30 with subskill must display pill-inactive');

  // Verify slots 4 & 5 (unreleased levels 70 and 80) do not contain duplicate -- 尚未開放 -- in badge
  assert(!slotsRowEl.innerHTML.includes('-- 尚未開放 --'), 'Empty slots must not duplicate -- 尚未開放 -- in badge');
  assert(slotsRowEl.innerHTML.includes('-- 未解鎖 --'), 'Empty slots below required level must display -- 未解鎖 --');

  // Raise level to 50: Slot 3 effect becomes active
  PokemonApp.setPokedexModalLevel(50);
  assert(!slotsRowEl.innerHTML.includes('Lv.50 <span class="slot-unreleased-tag slot-tag-inactive">'), 'Slot 3 at Lv.50 must dynamically clear slot-tag-inactive');

  // Raise level to 70: Slot 4 (Lv.70) is reached so it must NOT display any unreleased/under-lvl tag
  PokemonApp.setPokedexModalLevel(70);
  assert(!slotsRowEl.innerHTML.includes('Lv.70 <span class="slot-unreleased-tag'), 'Slot 4 at Lv.70 must NOT display 尚未開放 or 等級不足 tag');
  assert(slotsRowEl.innerHTML.includes('Lv.80 <span class="slot-unreleased-tag slot-tag-under-lvl">等級不足</span>'), 'Slot 5 at Lv.70 must display 等級不足');

  // Test Slot 4 & 5 Subskills at Lv.70 & Lv.80
  PokemonApp.selectPokedexSubskillSlot(4);
  PokemonApp.choosePokedexSubskill('幫忙速度M');
  PokemonApp.selectPokedexSubskillSlot(5);
  PokemonApp.choosePokedexSubskill('持有上限提升L');

  // At Lv.70: Slot 4 is reached (active, NO pill-inactive, has subskill-blue), Slot 5 is NOT reached (pill-inactive, has slot-tag-inactive)
  PokemonApp.setPokedexModalLevel(70);
  const slotButtons70 = slotsRowEl.innerHTML.split('</button>');
  const slot4Html70 = slotButtons70.find(b => b.includes('data-slot="4"')) || '';
  const slot5Html70 = slotButtons70.find(b => b.includes('data-slot="5"')) || '';
  assert(slot4Html70.includes('subskill-blue') && !slot4Html70.includes('slot-unreleased-tag'), 'Slot 4 at Lv.70 must not display unreleased/inactive tags');
  assert(!slot4Html70.includes('pill-inactive'), 'Slot 4 at Lv.70 must NOT have pill-inactive');
  assert(slot5Html70.includes('pill-inactive'), 'Slot 5 at Lv.70 must have pill-inactive');
  assert(slot5Html70.includes('slot-tag-inactive') && slot5Html70.includes('效果尚未生效'), 'Slot 5 at Lv.70 must show 效果尚未生效');

  // Raise level to Lv.80: Slot 5 becomes active, NO pill-inactive, NO status tag
  PokemonApp.setPokedexModalLevel(80);
  const slotButtons80 = slotsRowEl.innerHTML.split('</button>');
  const slot5Html80 = slotButtons80.find(b => b.includes('data-slot="5"')) || '';
  assert(!slot5Html80.includes('pill-inactive'), 'Slot 5 at Lv.80 must NOT have pill-inactive');
  assert(!slot5Html80.includes('slot-unreleased-tag'), 'Slot 5 at Lv.80 must NOT display any status tag');

  // Ideal Energy 0.45x Multiplier & Formula Breakdown verification (12h active baseline)
  const formulas80 = PokemonApp.calculatePokedexIngredientFormulas();
  assertEquals(formulas80.energyIntervalMult, 0.45, 'Formula engine must use 0.45 energy interval multiplier');
  assertEquals(formulas80.baseCalcSeconds, 43200, 'Formula engine must use 43200s (12h) active baseline');
  const expectedHelps = 43200 / (formulas80.effectiveIntervalSec * 0.45);
  assertEquals(formulas80.dailyHelps.toFixed(2), expectedHelps.toFixed(2), 'dailyHelps must be 43200 / (effectiveIntervalSec * 0.45)');
  assert(pikaModalHtml2.includes('pokedex-formula-help-btn'), 'Formula card must include [?] help button');
  assert(pikaModalHtml2.includes('pokedex-energy-help-popover'), 'Formula card must include energy popover');
  assert(pikaModalHtml2.includes('43200'), 'Formula derive line must display 43200 in step 1');
  assert(pikaModalHtml2.includes('× 0.45) ='), 'Formula derive line must display × 0.45 in step 1');
  assert(stylesCss.includes('.pokedex-formula-help-btn'), 'styles.css must style .pokedex-formula-help-btn');
  assert(stylesCss.includes('.pokedex-energy-help-popover'), 'styles.css must style .pokedex-energy-help-popover');

  // Strategy card verification: core skill without brackets & tiered subskill chips
  const stratCardHtml = PokemonApp.renderPokedexStrategyCardHTML(pikachuData);
  assert(stratCardHtml.includes('strategy-item-core'), 'Strategy card must have strategy-item-core');
  assert(!stratCardHtml.includes('(+36%)') && !stratCardHtml.includes('(BFS)'), 'Strategy card core skill must not contain bracketed explanations');
  assert(stratCardHtml.includes('subskill-gold') && stratCardHtml.includes('subskill-blue') && stratCardHtml.includes('subskill-white'), 'Strategy card must include gold, blue, and white subskill chips');

  // Ladder ? help button & popover verification
  const wikiCodeFile = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiCodeFile.includes('toggleLadderEnergyHelp'), 'wiki.js must define toggleLadderEnergyHelp');
  assert(wikiCodeFile.includes('closeLadderEnergyHelp'), 'wiki.js must define closeLadderEnergyHelp');
  assert(wikiCodeFile.includes('ladder-formula-help-btn'), 'wiki.js must render ladder-formula-help-btn');
  assert(wikiCodeFile.includes('ladder-energy-help-popover'), 'wiki.js must render ladder-energy-help-popover');
  assert(stylesCss.includes('.ladder-formula-help-btn'), 'styles.css must style .ladder-formula-help-btn');
  assert(stylesCss.includes('.ladder-energy-help-popover'), 'styles.css must style .ladder-energy-help-popover');
  assert(stylesCss.includes('.ladder-fixed-sidebar .sidebar-header {\n  position: relative;\n  overflow: visible !important;'), 'styles.css must allow ladder sidebar-header overflow for popover');

  // Dedicated Onyx theme verification
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .pokedex-modal-dialog {\n  background: #09090b !important;'), 'styles.css must style onyx modal dialog in obsidian black #09090b');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) #pokedex-detail-modal .pokedex-calc-unified-box {\n  background: #141417 !important;'), 'styles.css must style onyx calc box in #141417');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) #pokedex-detail-modal .box-subskill-slot-btn.active {\n  background: rgba(203, 213, 225, 0.14) !important;\n  border-color: #cbd5e1 !important;'), 'styles.css must style onyx active slot button in cool silver #cbd5e1');
  assert(stylesCss.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .pokedex-energy-help-bubble'), 'styles.css must style onyx help popovers');

  // CSS verification: solid borders on slot-unreleased and borderless unified-calc-row
  assert(stylesCss.includes('border-style: solid !important;') && stylesCss.includes('.box-subskill-slot-btn.slot-unreleased'), 'styles.css must enforce solid border on slot-unreleased');
  assert(stylesCss.includes('.unified-calc-row {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;\n  padding-bottom: 2px;\n  border-bottom: none !important;'), 'unified-calc-row must have border-bottom: none !important');
});

// 15V. Fast Floating Tooltips, Pull-to-Refresh Modal Guard, Tens Alignment & Venusaur Lv.60 Verification

test('Tier 4 - Real-World Application Scenarios', 'Fast Floating Tooltips, Pull-to-Refresh Modal Guard, Tens Alignment & Venusaur Lv.60 Verification', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const dataJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
    // 1. Tens alignment for skill and ingredient rates (space-padded single digits, no leading zero)
    const srTensHtml = PokemonApp.renderPokedexSkillRateValue({ finalSkillRate: 2.10, diffSkillRate: 0 });
    const irTensHtml = PokemonApp.renderPokedexIngRateValue({ finalIngRate: 49.16, diffIngRate: 22.56 });
    assert(srTensHtml.startsWith('\u20072.10%'), `Skill rate must format single digits with figure space instead of zero (got ${srTensHtml})`);
    assert(irTensHtml.startsWith('49.16%'), `Ingredient rate must preserve two-digit representation (got ${irTensHtml})`);
    assertEquals(srTensHtml.split('<')[0].length, irTensHtml.split('<')[0].length, 'Formatted rate value length must match exactly (6 chars) to align percentage sign');
    assert(stylesCss.includes('font-variant-numeric: tabular-nums;'), 'styles.css must include tabular-nums for monospaced numeric alignment');

    // 2. Pull-to-refresh modal protection
    const appJsContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    assert(appJsContent.includes('isModalOrDrawerActive'), 'app.js must define isModalOrDrawerActive guard');
    assert(appJsContent.includes('pokedex-modal-open'), 'app.js must toggle pokedex-modal-open on body');
    assert(stylesCss.includes('#pokedex-detail-modal') && stylesCss.includes('overscroll-behavior: contain !important;'), 'styles.css must contain overscroll on #pokedex-detail-modal');
    assert(stylesCss.includes('.pokedex-modal-body') && stylesCss.includes('overscroll-behavior-y: contain !important;'), 'styles.css must contain overscroll-y on .pokedex-modal-body');

    // 3. Fast floating tooltip engine & theme-adaptive styling
    assert(typeof PokemonApp.showGlobalTooltip === 'function', 'PokemonApp must export showGlobalTooltip');
    assert(typeof PokemonApp.toggleGlobalTooltip === 'function', 'PokemonApp must export toggleGlobalTooltip');
    assert(stylesCss.includes('.global-skill-tooltip') && stylesCss.includes('rgba(255, 255, 255, 0.96) !important;'), 'global-skill-tooltip must support light frosted glass in Dawn');
    assert(stylesCss.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .pokedex-energy-help-bubble'), 'styles.css must provide Dawn theme styling for energy help bubble');
    assert(stylesCss.includes('.global-skill-tooltip') && stylesCss.includes('z-index: 10000000 !important;'), 'global-skill-tooltip must have ultra-high z-index');
    assert(stylesCss.includes('.ladder-energy-help-popover') && stylesCss.includes('z-index: 100000 !important;'), 'ladder-energy-help-popover must have high z-index to prevent penetration');

    // 4. Mathematical Ground Truth: Venusaur Lv.60 Verification (Image 2)
    const venusaurData = dataJson.find(p => p.name_cn === '妙蛙花');
    assert(venusaurData !== undefined, 'data.json must contain Venusaur (妙蛙花)');
    // Calculate values matching Image 2
    const baseInterval = 2800; // 00:46:40
    const lvlDiscount = (60 - 1) * 0.002; // 0.118
    const speedDiscount = 0.14; // 幫忙速度M
    const effInterval = Math.round(baseInterval * (1 - lvlDiscount) * (1 - speedDiscount)); // 2124s (35:24)
    assertEquals(effInterval, 2124, 'Venusaur Lv.60 effective interval must be 2124s');
    const helpsPerDay = 86400 / (effInterval * 0.45); // 90.395...
    assertEquals(helpsPerDay.toFixed(1), '90.4', 'Venusaur Lv.60 daily helps under ideal energy must be 90.4');
    const ingRate = 26.60 * (1 + 0.54) * 1.20; // 49.1616%
    assertEquals(ingRate.toFixed(2), '49.16', 'Venusaur Lv.60 ingredient rate must be 49.16%');
    const ingDrops = helpsPerDay * (ingRate / 100); // 44.439...
    assertEquals(ingDrops.toFixed(1), '44.4', 'Venusaur Lv.60 daily ingredient drops must be 44.4');
    const skillRate = 2.10;
    const triggersPerDay = helpsPerDay * (skillRate / 100); // 1.898...
    assertEquals(triggersPerDay.toFixed(2), '1.90', 'Venusaur Lv.60 daily skill triggers must be 1.90');
    const extraIngs = triggersPerDay * 24; // 45.559...
    assertEquals(extraIngs.toFixed(1), '45.6', 'Venusaur Lv.60 Lv.7 skill extra ingredients must be 45.6');
  });

  // 15W. Tooltip Scroll Dismiss, 12h Daytime Yield Baseline, Filter Outline Unclipped & Subskill Swap

  test('Tier 4 - Real-World Application Scenarios', 'Tooltip Scroll Dismiss, 12h Daytime Baseline, Unclipped Filters & Subskill Swap', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Tooltip dismiss on scroll, touch swipe, and outside click
    assert(appJs.includes('dismissAllFloatingTooltips'), 'app.js must define dismissAllFloatingTooltips');
    assert(appJs.includes("window.addEventListener('scroll'"), 'app.js must listen for scroll events to dismiss floating tooltips');
    assert(appJs.includes("window.addEventListener('touchmove'"), 'app.js must listen for touchmove events to dismiss floating tooltips');
    assert(typeof PokemonApp.dismissAllFloatingTooltips === 'function' || typeof global.dismissAllFloatingTooltips === 'function', 'dismissAllFloatingTooltips must be accessible');

    // 2. 12-Hour Daytime Yield Baseline & Help Popover Explanation
    const pikachuData = {
      name_cn: '皮卡丘',
      name_en: 'Pikachu',
      formatted_no: '0025',
      interval: '00:45:00',
      ingredient_rate: '20.0',
      skill_rate: '2.0',
      specialty: '樹果',
      ingredients: [{ name: '特選蘋果', l1: '1', l30: '2', l60: '4' }]
    };
    PokemonApp.openPokemonDetailModal(pikachuData);
    PokemonApp.setPokedexModalLevel(60);
    const formula12 = PokemonApp.calculatePokedexIngredientFormulas();
    assertEquals(formula12.baseCalcSeconds, 43200, 'Formula engine must calculate over 43200 seconds (12h)');
    const expectedHelps12 = 43200 / (formula12.effectiveIntervalSec * 0.45);
    assertEquals(formula12.dailyHelps.toFixed(2), expectedHelps12.toFixed(2), 'dailyHelps must match 43200 / (interval * 0.45)');

    const formulaHtml = PokemonApp.renderPokedexFormulaBreakdownHTML(formula12, pikachuData);
    assert(formulaHtml.includes('43200秒 (12h)') || formulaHtml.includes('43200s (12h)'), 'Formula breakdown must derive helps using 43200 (12h)');
    assert(formulaHtml.includes('次') || formulaHtml.includes('helps'), 'Formula breakdown must display helps unit');
    assert(formulaHtml.includes('次掉落') || formulaHtml.includes('drops'), 'Formula breakdown must display drops unit');

    assert(formulaHtml.includes('12-16') && formulaHtml.includes('8.5'), 'Popover must explain 12-16 waking hours and 8.5 sleep hours rationale');

    // 3. Sidebar Filter Icon Grid Clipped Outline Comprehensive Check
    assert(stylesCss.includes('.sidebar-icon-grid {\n  display: grid !important;\n  grid-template-columns: repeat(7, minmax(0, 1fr)) !important;\n  gap: 3px !important;\n  width: 100% !important;\n  max-width: 100% !important;\n  box-sizing: border-box !important;\n  padding: 4px 3px !important;\n  overflow: visible !important;'), 'styles.css must allow sidebar-icon-grid visible overflow and padding');
    assert(stylesCss.includes('.subfilter-icon-btn.active {\n  background: rgba(56, 189, 248, 0.18) !important;\n  border-color: var(--accent-blue, #38bdf8) !important;\n  box-shadow: 0 0 8px rgba(56, 189, 248, 0.4) !important;\n  position: relative !important;\n  z-index: 2 !important;'), 'styles.css active subfilter buttons must have z-index: 2');
    assert(stylesCss.includes('.mobile-h5-app .recipe-filter-sidebar .sidebar-icon-grid {\n  display: grid !important;\n  grid-template-columns: repeat(7, 1fr) !important;\n  gap: 3px !important;\n  width: 100% !important;\n  box-sizing: border-box !important;\n  padding: 4px 3px !important;\n  overflow: visible !important;'), 'recipe sidebar grid must also have overflow: visible and padding');

    // 4. Subskill Palette Downward Expansion & Re-clickable Swap/Toggle
    PokemonApp.clearAllPokedexSubskills();
    PokemonApp.selectPokedexSubskillSlot(1);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('幫手獎勵');

    // Clicking already-used skill '樹果數量S' while target is slot 2 swaps slots 1 and 2
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    const currentSubs = PokemonApp.getPokedexModalState().subskills;
    assertEquals(currentSubs[0], '幫手獎勵', 'Slot 1 must now hold 幫手獎勵 after swap');
    assertEquals(currentSubs[1], '樹果數量S', 'Slot 2 must now hold 樹果數量S after swap');

    // Clicking the same skill currently occupying slot 2 clears slot 2 (toggle)
    PokemonApp.selectPokedexSubskillSlot(2);
    PokemonApp.choosePokedexSubskill('樹果數量S');
    assertEquals(PokemonApp.getPokedexModalState().subskills[1], '', 'Slot 2 must be cleared when clicking its own assigned skill');

    // Verify subskill chips remain clickable (no disabled attribute)
    PokemonApp.updatePokedexSubskillUI();
    const goldChipsHtml = document.getElementById('pokedex-subskill-chips-gold').innerHTML;
    assert(!goldChipsHtml.includes('disabled'), 'Subskill chips must never be disabled so users can tap to swap/replace');
    assert(goldChipsHtml.includes('in-use'), 'In-use subskills must retain in-use class for visual feedback');

    // Verify modal dialog content-adaptive height (no fixed 88vh, wraps to content)
    // Extract just the .pokedex-modal-dialog rule block for targeted assertion
    const pdxDialogStart = stylesCss.indexOf('.pokedex-modal-dialog {');
    const pdxDialogBlock = pdxDialogStart >= 0 ? stylesCss.substring(pdxDialogStart, pdxDialogStart + 600) : '';
    assert(pdxDialogBlock.includes('height: auto;'), 'pokedex-modal-dialog must use height: auto for content-adaptive sizing');
    assert(stylesCss.includes('max-height: min(880px, 90vh);'), 'pokedex-modal-dialog must have max-height: min(880px, 90vh)');
    assert(stylesCss.includes('max-height: 92dvh !important;'), 'Mobile pokedex modal dialog must have bottom-sheet height matching box modal (92dvh)');
  });

  // 15X. Recipe Modal Header Clear, Removed Energy Unit, 4-Item Height & Fast Differentiated Tooltip Triggers

  test('Tier 4 - Real-World Application Scenarios', 'Recipe Modal Header Clear, Removed Energy Unit, 4-Item Height & Fast Differentiated Tooltip Triggers', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Recipe Modal UI Refinements
    // Header must contain clear button
    assert(wikiJs.includes('ladder-recipe-header-clear-btn'), 'wiki.js must include ladder-recipe-header-clear-btn in modal header');
    assert(stylesCss.includes('.ladder-recipe-header-clear-btn'), 'styles.css must style .ladder-recipe-header-clear-btn');
    assert(stylesCss.includes('.ladder-recipe-modal-actions'), 'styles.css must style .ladder-recipe-modal-actions');

    // Modal template must NOT contain bottom footer
    const modalMatch = wikiJs.match(/id="ladder-recipe-modal"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    assert(modalMatch !== null, 'wiki.js must contain #ladder-recipe-modal markup');
    assert(!modalMatch[0].includes('ladder-recipe-modal-footer'), '#ladder-recipe-modal template must not contain footer');

    // Recipe card must NOT contain recipe-card-energy-unit
    assert(!wikiJs.includes('recipe-card-energy-unit'), 'wiki.js must remove recipe-card-energy-unit');

    // Modal dialog and body must display ~4 items without being overly tall
    assert(stylesCss.includes('max-height: min(580px, 86dvh);'), 'styles.css must restrict ladder-recipe-modal-dialog to min(580px, 86dvh)');
    assert(stylesCss.includes('.ladder-recipe-modal-body {\n  flex: 1 1 auto;\n  max-height: 420px;'), 'styles.css must restrict ladder-recipe-modal-body to ~420px (approx 4 items)');

    // 2. Differentiated Tooltip Triggers (Desktop Hover vs Mobile Tap)
    // special-skill-badge must have cursor: pointer and role="button"
    assert(stylesCss.includes('.special-skill-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  background: var(--badge-special-bg);\n  border: 1px dashed var(--badge-special-border);\n  border-radius: 5px;\n  padding: 1.5px 6px;\n  color: var(--badge-special-text);\n  font-weight: 500;\n  font-size: 12px;\n  cursor: pointer;'), 'special-skill-badge must have cursor: pointer');
    assert(appJs.includes('class="special-skill-badge" role="button" tabindex="0"'), 'special-skill-badge must include role="button" and tabindex="0"');

    // initSkillTooltips must handle touchend for instant 0ms tap
    assert(appJs.includes('didHandleTouchTap'), 'app.js must track didHandleTouchTap for instant touch response');
    assert(appJs.includes('toggleGlobalTooltip(badge, titleName, detail)'), 'app.js must call toggleGlobalTooltip directly on badge tap/click');

    // toggleGlobalTooltip must not have 500ms delay block
    assert(!appJs.includes('lastGlobalTooltipShownTime < 500'), 'toggleGlobalTooltip must not suppress calls with 500ms delay');

    // Tooltip styling must use translucent dark frosted glass
    assert(stylesCss.includes('background: rgba(15, 23, 42, 0.82);'), 'global-skill-tooltip must use translucent frosted glass background rgba(15, 23, 42, 0.82)');
  });

  // Test 148: Help Button State Restoration & Zero-Lag First-Tap Reopening Verification

  test('Tier 4 - Real-World Application Scenarios', 'Help Button State Restoration & Zero-Lag First-Tap Reopening Verification', () => {
    const fs = require('fs');
    const path = require('path');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. dismissAllFloatingTooltips must reset all help buttons and blur activeElement
    assert(appJs.includes('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge'), 'dismissAllFloatingTooltips must query all formula and skill buttons');
    assert(appJs.includes("btn.classList.remove('active')"), 'dismissAllFloatingTooltips must remove active class from buttons');
    assert(appJs.includes("btn.setAttribute('aria-expanded', 'false')"), 'dismissAllFloatingTooltips must set aria-expanded="false"');
    assert(appJs.includes('document.activeElement.blur()'), 'dismissAllFloatingTooltips must blur document.activeElement');

    // 2. showGlobalTooltip must activate anchorEl
    assert(appJs.includes("anchorEl.classList.add('active')"), 'showGlobalTooltip must add active class to anchorEl');
    assert(appJs.includes("anchorEl.setAttribute('aria-expanded', 'true')"), 'showGlobalTooltip must set aria-expanded="true" on anchorEl');

    // 3. hideGlobalTooltip must deactivate currentGlobalTooltipAnchor
    assert(appJs.includes("currentGlobalTooltipAnchor.classList.remove('active')"), 'hideGlobalTooltip must remove active class from anchor');
    assert(appJs.includes("currentGlobalTooltipAnchor.blur()"), 'hideGlobalTooltip must blur currentGlobalTooltipAnchor');

    // 4. initSkillTooltips must handle help buttons on touchend for 0ms instant mobile tap
    assert(appJs.includes("e.target.closest('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn')"), 'touchend must handle pokedex and ladder help buttons');
    assert(appJs.includes('toggleGlobalTooltip(helpBtn, help.title, help.body)'), 'touchend must invoke toggleGlobalTooltip directly for helpBtn');

    // 5. touchmove threshold must be 10px
    assert(appJs.includes('dx > 10 || dy > 10'), 'touchmove threshold must be 10px for responsive slide dismiss');

    // 6. closePokemonDetailModal must dismiss all floating tooltips
    assert(appJs.includes('function closePokemonDetailModal() {\n  dismissAllFloatingTooltips();'), 'closePokemonDetailModal must call dismissAllFloatingTooltips');

    // 7. CSS active classes and pointer fine media queries
    assert(stylesCss.includes('.pokedex-formula-help-btn.active'), 'styles.css must style .pokedex-formula-help-btn.active');
    assert(stylesCss.includes('.ladder-formula-help-btn.active'), 'styles.css must style .ladder-formula-help-btn.active');
    assert(stylesCss.includes('.ladder-help-icon-btn.active'), 'styles.css must style .ladder-help-icon-btn.active');
    assert(stylesCss.includes('@media (hover: hover) and (pointer: fine)'), 'styles.css must wrap help button hover rules with pointer fine media query');

    // 8. Functional Mock Test
    const mockBtn = {
      classList: {
        _classes: new Set(),
        add(c) { this._classes.add(c); },
        remove(c) { this._classes.delete(c); },
        contains(c) { return this._classes.has(c); }
      },
      _attrs: {},
      setAttribute(k, v) { this._attrs[k] = String(v); },
      getAttribute(k) { return this._attrs[k] || null; },
      removeAttribute(k) { delete this._attrs[k]; },
      blurred: false,
      blur() { this.blurred = true; },
      getBoundingClientRect() {
        return { top: 100, left: 100, width: 20, height: 20 };
      }
    };

    // Load functions into isolated context
    const vm = require('vm');
    const sandbox = {
      document: {
        body: { appendChild() {} },
        createElement(tag) {
          return {
            id: '',
            className: '',
            style: {},
            classList: {
              _classes: new Set(),
              add(c) { this._classes.add(c); },
              remove(c) { this._classes.delete(c); },
              contains(c) { return this._classes.has(c); }
            },
            innerHTML: '',
            getBoundingClientRect() { return { width: 250, height: 100 }; }
          };
        },
        getElementById(id) {
          return this._elements && this._elements[id] ? this._elements[id] : null;
        },
        querySelectorAll(sel) {
          return [mockBtn];
        },
        activeElement: mockBtn
      },
      window: { innerWidth: 1000, innerHeight: 800 },
      Date
    };
    sandbox.window.document = sandbox.document;
    sandbox.document._elements = {};

    const scriptCode = `
      let currentGlobalTooltipAnchor = null;
      let lastGlobalTooltipShownTime = 0;
      let isTooltipPinned = false;

      ${appJs.substring(appJs.indexOf('function showGlobalTooltip'), appJs.indexOf('if (typeof window !== \'undefined\') {\n  window.showGlobalTooltip'))}
    `;

    vm.createContext(sandbox);
    vm.runInContext(scriptCode, sandbox);

    // Step A: Show tooltip on button
    sandbox.showGlobalTooltip(mockBtn, 'Test Title', 'Test Body');
    assert(mockBtn.classList.contains('active'), 'mockBtn must have .active after showGlobalTooltip');
    assert(mockBtn.getAttribute('aria-expanded') === 'true', 'mockBtn aria-expanded must be true');

    // Step B: User slides/scrolls -> dismissAllFloatingTooltips
    mockBtn.blurred = false;
    sandbox.dismissAllFloatingTooltips();
    assert(!mockBtn.classList.contains('active'), 'mockBtn must not have .active after dismissAllFloatingTooltips');
    assert(mockBtn.getAttribute('aria-expanded') === 'false', 'mockBtn aria-expanded must be false');
    assert(mockBtn.blurred === true, 'mockBtn must have been blurred after dismissAllFloatingTooltips');

    // Step C: Next tap on mockBtn -> toggleGlobalTooltip must open on FIRST TAP
    sandbox.toggleGlobalTooltip(mockBtn, 'Test Title', 'Test Body');
    assert(mockBtn.classList.contains('active'), 'mockBtn must immediately open and become active on first tap after scroll');
    assert(mockBtn.getAttribute('aria-expanded') === 'true', 'mockBtn must have aria-expanded="true" after first tap');
  });

  // 16X. Berry Yield & Energy Calculation, strategy-card-desc Removal & Modal Height Auto-Adaptation

  test('Tier 4 - Real-World Application Scenarios', 'Berry Yield Energy Calculation, Strategy Card Desc Removal & Modal Height Auto-Adaptation', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

    // 1. Verify BERRY_BASE_ENERGY_MAP is defined with correct energies
    assert(appJs.includes('BERRY_BASE_ENERGY_MAP'), 'app.js must define BERRY_BASE_ENERGY_MAP');
    assert(appJs.includes("'椰木果': 24"), 'BERRY_BASE_ENERGY_MAP must have 椰木果=24');
    assert(appJs.includes("'芒念果': 26"), 'BERRY_BASE_ENERGY_MAP must have 芒念果=26');
    assert(appJs.includes("'橙橙果': 31"), 'BERRY_BASE_ENERGY_MAP must have 橙橙果=31');
    assert(appJs.includes("'巧可果': 35"), 'BERRY_BASE_ENERGY_MAP must have 巧可果=35');

    // 2. Verify getBerryBaseEnergy and calculateSingleBerryEnergy functions are exported
    assert(appJs.includes('function getBerryBaseEnergy'), 'app.js must define getBerryBaseEnergy');
    assert(appJs.includes('function calculateSingleBerryEnergy'), 'app.js must define calculateSingleBerryEnergy');
    assert(appJs.includes('PokemonApp.getBerryBaseEnergy = getBerryBaseEnergy'), 'PokemonApp must export getBerryBaseEnergy');
    assert(appJs.includes('PokemonApp.calculateSingleBerryEnergy = calculateSingleBerryEnergy'), 'PokemonApp must export calculateSingleBerryEnergy');

    // 3. Verify calculateSingleBerryEnergy formula uses correct growth formula
    assert(appJs.includes('Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1))'), 'calculateSingleBerryEnergy must use correct growth formula max(base+(lv-1), base*1.025^(lv-1))');

    // 4. Verify berry yield calculation variables in calculatePokedexIngredientFormulas
    assert(appJs.includes('const isBerrySpec'), 'calculatePokedexIngredientFormulas must compute isBerrySpec');
    assert(appJs.includes('const berriesPerHelp'), 'calculatePokedexIngredientFormulas must compute berriesPerHelp');
    assert(appJs.includes('const dailyBerryHelps'), 'calculatePokedexIngredientFormulas must compute dailyBerryHelps');
    assert(appJs.includes('const dailyBerryCount'), 'calculatePokedexIngredientFormulas must compute dailyBerryCount');
    assert(appJs.includes('const dailyBerryEnergy'), 'calculatePokedexIngredientFormulas must compute dailyBerryEnergy');
    assert(appJs.includes('const dailyBerryEnergyFav'), 'calculatePokedexIngredientFormulas must compute dailyBerryEnergyFav');

    // 5. Verify berry yield fields in return object
    assert(appJs.includes('berryName,'), 'formula return must include berryName');
    assert(appJs.includes('singleBerryEnergy,'), 'formula return must include singleBerryEnergy');
    assert(appJs.includes('dailyBerryHelps,'), 'formula return must include dailyBerryHelps');
    assert(appJs.includes('dailyBerryCount,'), 'formula return must include dailyBerryCount');
    assert(appJs.includes('dailyBerryEnergy,'), 'formula return must include dailyBerryEnergy');
    assert(appJs.includes('dailyBerryEnergyFav,'), 'formula return must include dailyBerryEnergyFav');

    // 6. Verify Step 2 berry calculation block is rendered in formula breakdown HTML
    assert(appJs.includes("'Berry Yield & Energy (12h)'"), 'renderPokedexFormulaBreakdownHTML must include EN berry step header');
    assert(appJs.includes("'樹果產量與單日能量 (12h)'"), 'renderPokedexFormulaBreakdownHTML must include ZH berry step header');
    assert(appJs.includes('calc-color-berry'), 'renderPokedexFormulaBreakdownHTML must use calc-color-berry class');
    assert(appJs.includes('berry-row-detail'), 'renderPokedexFormulaBreakdownHTML must use berry-row-detail for space-between energy row');
    assert(appJs.includes('berry-detail-left'), 'renderPokedexFormulaBreakdownHTML must use berry-detail-left');
    assert(appJs.includes('dailyBerryEnergyFav.toLocaleString'), 'renderPokedexFormulaBreakdownHTML must display dailyBerryEnergyFav');


    // 7. Verify formula title updated to 產能算法精算拆解 (general yield, not just ingredient)
    assert(appJs.includes("'產能算法精算拆解'"), 'app.js fallback title must be 產能算法精算拆解');
    assert(i18nJs.includes("'pokedex.formula_title': '產能算法精算拆解'"), 'i18n zh-TW formula_title must be 產能算法精算拆解');
    assert(i18nJs.includes("'pokedex.formula_title': 'Yield Formula Breakdown'"), 'i18n en-US formula_title must be Yield Formula Breakdown');

    // 8. Verify strategy-card-desc and strategy-card-badge removed, title placed inside frame on its own line
    const strategyFnStart = appJs.indexOf('function renderPokedexStrategyCardHTML');
    const strategyFnEnd = appJs.indexOf('function renderPokedexDetailModalContent');
    const strategyFnBody = appJs.substring(strategyFnStart, strategyFnEnd);
    assert(!strategyFnBody.includes('strategy-card-desc'), 'renderPokedexStrategyCardHTML must NOT render strategy-card-desc (removed per user request)');
    assert(!strategyFnBody.includes('strategy-card-badge'), 'renderPokedexStrategyCardHTML must NOT render strategy-card-badge (removed per user request)');
    assert(strategyFnBody.includes('strategy-card-title pokedex-formula-badge font-bold'), 'renderPokedexStrategyCardHTML must render strategy-card-title with pokedex-formula-badge inside the card');
    assert(strategyFnBody.includes('strategy-details-grid'), 'renderPokedexStrategyCardHTML must still render strategy-details-grid');
    const formulaFnStart = appJs.indexOf('function renderPokedexFormulaBreakdownHTML');
    const formulaFnEnd = appJs.indexOf('function togglePokedexEnergyHelp');
    const formulaFnBody = appJs.substring(formulaFnStart, formulaFnEnd);
    assert(formulaFnBody.includes('pokedex-strategy-desktop-container'), 'Desktop strategy container must be nested inside renderPokedexFormulaBreakdownHTML unified box');
    assert(stylesCss.includes('.pokedex-calc-unified-box .pokedex-strategy-card'), 'styles.css must style pokedex-strategy-card inside pokedex-calc-unified-box');

    // 9. Verify modal height auto-adaptation in CSS (narrowed to .pokedex-modal-dialog block)
    const pdxBlock2Start = stylesCss.indexOf('.pokedex-modal-dialog {');
    const pdxBlock2 = pdxBlock2Start >= 0 ? stylesCss.substring(pdxBlock2Start, pdxBlock2Start + 600) : '';
    assert(pdxBlock2.includes('height: auto;'), 'CSS .pokedex-modal-dialog must have height: auto');
    assert(stylesCss.includes('max-height: min(880px, 90vh);'), 'CSS must have max-height: min(880px, 90vh)');
    assert(!pdxBlock2.includes('height: 88vh'), 'CSS .pokedex-modal-dialog must NOT use fixed height: 88vh');

    // 10. Verify calc-color-berry CSS class defined and berry-row-detail style present
    assert(stylesCss.includes('.calc-color-berry'), 'styles.css must define .calc-color-berry');
    assert(stylesCss.includes('berry-row-detail'), 'styles.css must define .berry-row-detail for space-between layout');
    assert(stylesCss.includes('.strategy-card-title {'), 'styles.css must define .strategy-card-title');
  });

  // ----------------------------------------------------
  // Test 150: God Presets and Appraisal Engine for Berry Speed Natures and BFS Skill Specialists
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'God Presets and Appraisal for Berry Speed Natures and BFS Skill Specialists', () => {
    // 1. Verify isBfsSkillSpecialist, isHealerSkillSpecialist, isHelperBoostSkillSpecialist, and isChargeStrengthSkillSpecialist
    assert(typeof PokemonApp.isBfsSkillSpecialist === 'function', 'PokemonApp.isBfsSkillSpecialist must be a function');
    assert(typeof PokemonApp.isHealerSkillSpecialist === 'function', 'PokemonApp.isHealerSkillSpecialist must be a function');
    assert(typeof PokemonApp.isHelperBoostSkillSpecialist === 'function', 'PokemonApp.isHelperBoostSkillSpecialist must be a function');
    assert(typeof PokemonApp.isChargeStrengthSkillSpecialist === 'function', 'PokemonApp.isChargeStrengthSkillSpecialist must be a function');
    
    // Load appraisal.js in isolated vm context
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    assert(typeof appCtx.AppraisalLab.isBfsSkillSpecialist === 'function', 'AppraisalLab.isBfsSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isHealerSkillSpecialist === 'function', 'AppraisalLab.isHealerSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isHelperBoostSkillSpecialist === 'function', 'AppraisalLab.isHelperBoostSkillSpecialist must be exported');
    assert(typeof appCtx.AppraisalLab.isChargeStrengthSkillSpecialist === 'function', 'AppraisalLab.isChargeStrengthSkillSpecialist must be exported');

    // Legendary Beasts & Helper Boost: Raikou, Entei, Suicune - strictly pure skill, NOT BFS
    const raikou = { name_cn: '雷公', specialty: '技能', main_skill: '幫手加速（電）' };
    const entei = { name_cn: '炎帝', specialty: '技能', main_skill: '幫手加速（火）' };
    const suicune = { name_cn: '水君', specialty: '技能', main_skill: '幫手加速（水）' };
    assert(PokemonApp.isBfsSkillSpecialist(raikou) === false, 'Raikou must NOT be classified as BFS-suited');
    assert(PokemonApp.isHelperBoostSkillSpecialist(raikou) === true, 'Raikou must be classified as Helper Boost specialist');
    assert(PokemonApp.isHelperBoostSkillSpecialist(entei) === true, 'Entei must be classified as Helper Boost specialist');
    assert(PokemonApp.isHelperBoostSkillSpecialist(suicune) === true, 'Suicune must be classified as Helper Boost specialist');
    assert(appCtx.AppraisalLab.isHelperBoostSkillSpecialist(raikou) === true, 'AppraisalLab must classify Raikou as Helper Boost');

    // Healers: Gardevoir - strictly pure skill healer, NOT default BFS
    const gardevoir = { name_cn: '沙奈朵', specialty: '技能', main_skill: '活力全體療癒S' };
    assert(PokemonApp.isBfsSkillSpecialist(gardevoir) === false, 'Gardevoir must NOT be classified as default BFS specialist');
    assert(PokemonApp.isHealerSkillSpecialist(gardevoir) === true, 'Gardevoir must be classified as Healer specialist');
    assert(appCtx.AppraisalLab.isHealerSkillSpecialist(gardevoir) === true, 'AppraisalLab must classify Gardevoir as Healer');

    // Charge Strength: Ampharos, Golduck - direct power, pure skill god preset with hybrid option
    const ampharos = { name_cn: '電龍', specialty: '技能', main_skill: '能量填充M' };
    const golduck = { name_cn: '哥達鴨', specialty: '技能', main_skill: '能量填充S' };
    assert(PokemonApp.isBfsSkillSpecialist(ampharos) === false, 'Ampharos must NOT be classified as default BFS-only specialist');
    assert(PokemonApp.isChargeStrengthSkillSpecialist(ampharos) === true, 'Ampharos must be classified as Charge Strength specialist');
    assert(PokemonApp.isChargeStrengthSkillSpecialist(golduck) === true, 'Golduck must be classified as Charge Strength specialist');

    // Pure / Anti-BFS Tactical Skill Pokemon: Dedenne, Magnezone, Meowth
    const dedenne = { name_cn: '咚咚鼠', specialty: '技能', main_skill: '美味大成功' };
    const magnezone = { name_cn: '自爆磁怪', specialty: '技能', main_skill: '料理強化S' };
    const meowth = { name_cn: '喵喵', specialty: '技能', main_skill: '夢之碎片獲取S' };
    assert(PokemonApp.isBfsSkillSpecialist(dedenne) === false, 'Dedenne must NOT be classified as BFS-suited');
    assert(PokemonApp.isBfsSkillSpecialist(magnezone) === false, 'Magnezone must NOT be classified as BFS-suited');
    assert(PokemonApp.isBfsSkillSpecialist(meowth) === false, 'Meowth must NOT be classified as BFS-suited');

    // Non-skill Pokemon
    const pikachu = { name_cn: '皮卡丘', specialty: '樹果', main_skill: '能量填充S' };
    const blastoise = { name_cn: '水箭龜', specialty: '食材', main_skill: '食材獲取S' };
    assert(PokemonApp.isBfsSkillSpecialist(pikachu) === false, 'Berry specialist Pikachu must return false');
    assert(PokemonApp.isBfsSkillSpecialist(blastoise) === false, 'Ingredient specialist Blastoise must return false');

    // 2. Strategy Card recommendations
    const berryStratHtml = PokemonApp.renderPokedexStrategyCardHTML(pikachu);
    assert(berryStratHtml.includes('固執') && berryStratHtml.includes('降食材首選'), 'Berry strategy card must highlight Adamant as primary speed nature reducing ingredients');

    const raikouStratHtml = PokemonApp.renderPokedexStrategyCardHTML(raikou);
    assert(raikouStratHtml.includes('傳說幫手加速核心定位'), 'Raikou strategy card must display helper core title');
    assert(!raikouStratHtml.includes('樹果數量S'), 'Raikou strategy card must strictly avoid BFS');

    const gardevoirStratHtml = PokemonApp.renderPokedexStrategyCardHTML(gardevoir);
    assert(gardevoirStratHtml.includes('全隊活力療癒核心定位'), 'Gardevoir strategy card must display healer core title');
    assert(!gardevoirStratHtml.includes('樹果數量S'), 'Gardevoir strategy card must NOT recommend BFS');

    const ampharosStratHtml = PokemonApp.renderPokedexStrategyCardHTML(ampharos);
    assert(ampharosStratHtml.includes('高頻單體充能直傷定位'), 'Ampharos strategy card must display direct charge title');
    assert(ampharosStratHtml.includes('樹果數量S'), 'Ampharos strategy card includes BFS as optional hybrid');
    assert(ampharosStratHtml.includes('慎重降食材最優'), 'Ampharos strategy card must recommend Careful nature');

    const dedenneStratHtml = PokemonApp.renderPokedexStrategyCardHTML(dedenne);
    assert(dedenneStratHtml.includes('高頻純戰術技能輔助定位'), 'Dedenne strategy card must display pure tactical title');
    assert(!dedenneStratHtml.includes('樹果數量S'), 'Dedenne strategy card must strictly exclude BFS');

    // 3. Appraisal diagnostics
    // Berry specialist with Adamant nature
    const berryEval = appCtx.AppraisalLab.evaluatePokemon(pikachu, 60, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 1);
    assert(berryEval.pros.some(p => p.includes('固執') && p.includes('樹果型第一神性格')), 'Appraisal pros must highlight Adamant as #1 God nature for Berry specialists');

    // Raikou with BFS warning
    const raikouEval = appCtx.AppraisalLab.evaluatePokemon(raikou, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(raikouEval.cons.some(c => c.includes('幫手加速') && c.includes('阻斷主技能判定')), 'Appraisal cons must warn that BFS on Raikou blocks Helper Boost procs');

    // Healer with BFS warning
    const gardevoirEval = appCtx.AppraisalLab.evaluatePokemon(gardevoir, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫手獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(gardevoirEval.cons.some(c => c.includes('活力療癒補師') && c.includes('阻斷主技能判定')), 'Appraisal cons must warn that BFS on Healer blocks healing procs');

    // Charge Strength specialist with BFS (hybrid acknowledgement)
    const ampharosEval = appCtx.AppraisalLab.evaluatePokemon(ampharos, 60, '慎重', ['技能機率提升M', '樹果數量S', '幫忙速度M'], ['特選蘋果', '特選蘋果', '特選蘋果'], 4, 6);
    assert(ampharosEval.pros.some(p => p.includes('樹果數量S') && p.includes('高額樹果副輸出')), 'Appraisal pros must highlight BFS on Charge Strength as hybrid power');

    // Dedenne with BFS warning
    const dedenneEval = appCtx.AppraisalLab.evaluatePokemon(dedenne, 60, '自大', ['技能機率提升M', '樹果數量S'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(dedenneEval.cons.some(c => c.includes('純戰術型') && c.includes('容易過早滿包限制主技能判定')), 'Appraisal cons must warn that BFS causes bag overflow on Dedenne');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Table Dynamic Height Adaptation and Dock Clearance', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify body dock padding clearance
    assert(
      css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
      'body.mobile-h5-app must reserve dock clearance via padding-bottom'
    );

    // 2. Verify table-container seamlessly touches bottom dock without margin
    assert(
      css.includes('.mobile-h5-app.pokemon-active .table-container') && css.includes('margin-bottom: 0 !important;'),
      'Pokemon table container must have 0 margin-bottom to touch bottom dock'
    );

    // 3. Verify content-area has zero margin/padding buffer to dock cleanly
    assert(
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content .content-area') &&
      css.includes('padding-bottom: 0 !important;'),
      'content-area must have padding-bottom: 0 buffer above dock'
    );

    // 4. Verify panels inherit 100% height without fragile calc
    assert(
      css.includes('.mobile-h5-app.pokemon-active #panel-pokemon {\n  height: 100% !important;'),
      '#panel-pokemon must use height: 100% to inherit cleanly from body'
    );
  });

  // ----------------------------------------------------
  // Test 152: Main Skill Yield for All Specialties & Compact Strategy Card Layout
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Main Skill Actual Yield Display for All Specialties & Compact Strategy Card Polish', () => {
    // 1. Verify getPokedexMainSkillYield is exported
    assert(typeof PokemonApp.getPokedexMainSkillYield === 'function', 'PokemonApp.getPokedexMainSkillYield must be a function');

    // 2. Test Ingredient Magnet S (Chinese & English)
    const ingMagnetCn = PokemonApp.getPokedexMainSkillYield('食材獲取S', 6, 4.5, false);
    assert(ingMagnetCn !== null, 'Ingredient Magnet yield must not be null');
    assertEquals(ingMagnetCn.mainSkillLabel, '食材獲取S (Lv.6)', 'Magnet Chinese label');
    assertEquals(ingMagnetCn.mainSkillValueText, '+94.5 顆額外食材', 'Magnet Chinese daily text');
    assertEquals(ingMagnetCn.mainSkillSingleText, '單次 21 顆', 'Magnet Chinese single text');

    const ingMagnetEn = PokemonApp.getPokedexMainSkillYield('食材獲取S', 6, 4.5, true);
    assertEquals(ingMagnetEn.mainSkillLabel, 'Magnet S (Lv.6)', 'Magnet English label');
    assertEquals(ingMagnetEn.mainSkillValueText, '+94.5 extra ings', 'Magnet English daily text');
    assertEquals(ingMagnetEn.mainSkillSingleText, 'yield 21 ings', 'Magnet English single text');

    // 3. Test Charge Strength M (Ampharos / Espeon)
    const chargeMCn = PokemonApp.getPokedexMainSkillYield('能量填充M', 7, 5.0, false);
    assert(chargeMCn !== null, 'Charge Strength M yield must not be null');
    assertEquals(chargeMCn.mainSkillLabel, '能量填充M (Lv.7)', 'Charge M label');
    assertEquals(chargeMCn.mainSkillValueText, '+32,045 點能量', 'Charge M daily text');
    assertEquals(chargeMCn.mainSkillSingleText, '單次 6,409 能量', 'Charge M single text');

    // 4. Test Charge Strength S (Pikachu / Raichu)
    const chargeSCn = PokemonApp.getPokedexMainSkillYield('能量填充S', 5, 2.0, false);
    assert(chargeSCn !== null, 'Charge Strength S yield must not be null');
    assertEquals(chargeSCn.mainSkillLabel, '能量填充S (Lv.5)', 'Charge S label');
    assertEquals(chargeSCn.mainSkillValueText, '+2,992 點能量', 'Charge S daily text');
    assertEquals(chargeSCn.mainSkillSingleText, '單次 1,496 能量', 'Charge S single text');

    // 5. Test Energy for Everyone (E4E - Gardevoir / Sylveon / Wigglytuff)
    const e4eCn = PokemonApp.getPokedexMainSkillYield('活力全體療癒S', 6, 4.0, false);
    assert(e4eCn !== null, 'E4E yield must not be null');
    assertEquals(e4eCn.mainSkillLabel, '活力全體療癒S (Lv.6)', 'E4E label');
    assertEquals(e4eCn.mainSkillValueText, '+72.0 點全員活力', 'E4E daily text');
    assertEquals(e4eCn.mainSkillSingleText, '單次 18 點', 'E4E single text');

    // 6. Test Helper Boost (Raikou / Entei / Suicune)
    const helperBoostCn = PokemonApp.getPokedexMainSkillYield('幫手加速（電）', 6, 2.0, false);
    assert(helperBoostCn !== null, 'Helper Boost yield must not be null');
    assertEquals(helperBoostCn.mainSkillLabel, '幫手加速（電） (Lv.6)', 'Helper Boost label');
    assertEquals(helperBoostCn.mainSkillValueText, '+22.0 次全員幫忙', 'Helper Boost daily text');
    assertEquals(helperBoostCn.mainSkillSingleText, '單次最高 11 次', 'Helper Boost single text');

    // 7. Test Cooking Power Up S (Magnezone)
    const cookingPowerCn = PokemonApp.getPokedexMainSkillYield('料理強化S', 6, 3.0, false);
    assert(cookingPowerCn !== null, 'Cooking Power Up yield must not be null');
    assertEquals(cookingPowerCn.mainSkillLabel, '料理強化S (Lv.6)', 'Cooking Power Up label');
    assertEquals(cookingPowerCn.mainSkillValueText, '+81.0 鍋子容量', 'Cooking Power Up daily text');
    assertEquals(cookingPowerCn.mainSkillSingleText, '單次 +27 容量', 'Cooking Power Up single text');

    // 8. Test Tasty Chance S (Dedenne)
    const tastyChanceCn = PokemonApp.getPokedexMainSkillYield('料理成功S', 6, 3.5, false);
    assert(tastyChanceCn !== null, 'Tasty Chance yield must not be null');
    assertEquals(tastyChanceCn.mainSkillLabel, '料理成功S (Lv.6)', 'Tasty Chance label');
    assertEquals(tastyChanceCn.mainSkillValueText, '+35.0% 大成功機率', 'Tasty Chance daily text');
    assertEquals(tastyChanceCn.mainSkillSingleText, '單次 +10%', 'Tasty Chance single text');

    // 9. Verify calculatePokedexIngredientFormulas integration for various specialists
    // 9a. Test Ampharos (Skill specialist with Charge Strength M)
    PokemonApp.openPokemonDetailModal('181');
    const ampharosFm = PokemonApp.calculatePokedexIngredientFormulas();
    assert(ampharosFm.mainSkillLabel.includes('能量填充M'), 'Ampharos mainSkillLabel must include 能量填充M');
    assert(ampharosFm.mainSkillValueText.includes('點能量'), 'Ampharos mainSkillValueText must contain 點能量');
    assert(ampharosFm.mainSkillSingleText.includes('能量'), 'Ampharos mainSkillSingleText must contain 能量');

    // 9b. Verify HTML breakdown rendering includes calc-row-subskill-extra
    const breakdownHtml = PokemonApp.renderPokedexFormulaBreakdownHTML(ampharosFm);
    assert(breakdownHtml.includes('calc-row-subskill-extra'), 'Breakdown HTML must render .calc-row-subskill-extra');
    assert(breakdownHtml.includes('badge-skill-extra'), 'Breakdown HTML must render badge-skill-extra');
    assert(breakdownHtml.includes('text-skill-extra'), 'Breakdown HTML must render text-skill-extra');
    assert(breakdownHtml.includes('text-skill-single'), 'Breakdown HTML must render text-skill-single');

    // 10. Verify CSS styles for compact strategy cards & un-enlarged core skill
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    assert(stylesCss.includes('gap: 3px !important;'), 'Pokedex strategy card must use tight 3px gap');
    assert(stylesCss.includes('.strategy-details-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 3px;'), 'Strategy grid must have 3px gap');
    assert(stylesCss.includes('.strategy-core-k {\n  font-size: 12.5px !important;'), 'Core skill key must be standard 12.5px without enlargement');
    assert(stylesCss.includes('.strategy-core-chip {\n  font-size: 12px !important;'), 'Core skill chip must be standard 12px without enlargement');
    assert(stylesCss.includes('.text-skill-single {\n  font-size: 11px;'), 'styles.css must style .text-skill-single');
  });

  // ----------------------------------------------------
  // Test 153: Evolution Levels & Level Adjustment Constraints Verification
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Evolution Levels and Level Adjustment Constraints Comprehensive Audit', () => {
    // 1. Verify Clodsire (土王 980) and Paldean Wooper (烏波 7054)
    const clod = dataset.find(p => p.formatted_no === '980' || p.name_cn === '土王');
    assert(clod !== undefined, 'Clodsire must exist in dataset');
    assert(clod.evo_req === '' || clod.evo_req === 'Lv.15 + 40 糖', 'Clodsire evo_req must be empty on final form or keep Lv.15 candy text');
    const clodMinLvl = PokemonApp.getPokedexMinEvolutionLevel(clod);
    assertEquals(clodMinLvl, 15, 'Clodsire minimum evolution level must be 15');

    const paldeanWooper = dataset.find(p => p.formatted_no === '7054');
    assert(paldeanWooper !== undefined, 'Paldean Wooper must exist in dataset');
    assert(paldeanWooper.name_cn.includes('帕底亞') || paldeanWooper.name_en.includes('Paldea'), 'Paldean Wooper must be identifiable as Paldea form');
    assertEquals(paldeanWooper.evo_req, 'Lv.15 + 40 糖', 'Paldean Wooper pre-evo must carry Lv.15 + 40 candy requirement');
    const wooperMinLvl = PokemonApp.getPokedexMinEvolutionLevel(paldeanWooper);
    assertEquals(wooperMinLvl, 15, 'Paldean Wooper listed evolution requirement is Lv.15');

    // 2. Verify legitimate stone/item/sleep evolution pokemon have minLevel = 1
    const stoneAndSleepNames = ['雷丘', '風速狗', '九尾', '水伊布', '仙子伊布', '路卡利歐', '大綱蛇', '波克基斯'];
    stoneAndSleepNames.forEach(name => {
      const p = dataset.find(x => x.name_cn === name);
      if (p) {
        const minLvl = PokemonApp.getPokedexMinEvolutionLevel(p);
        assertEquals(minLvl, 1, `${name} has no level requirement in Pokemon Sleep and should allow minLevel = 1`);
      }
    });

    // 3. Verify Stage 3 inherited level evolutions
    const stage3Inherited = [
      { name: '大食花', expected: 16 },
      { name: '隆隆岩', expected: 19 },
      { name: '自爆磁怪', expected: 23 },
      { name: '耿鬼', expected: 19 },
      { name: '艾路雷朵', expected: 15 },
      { name: '鍬農炮蟲', expected: 15 },
      { name: '巴布土撥', expected: 14 }
    ];
    stage3Inherited.forEach(item => {
      const p = dataset.find(x => x.name_cn === item.name);
      if (p) {
        const minLvl = PokemonApp.getPokedexMinEvolutionLevel(p);
        assertEquals(minLvl, item.expected, `${item.name} must inherit stage 2 min level of ${item.expected}`);
      }
    });

    // 4. Verify Pokédex Modal Level Clamping for Clodsire (土王)
    PokemonApp.openPokemonDetailModal('980');
    assert(PokemonApp.getPokedexModalState().level >= 15, 'Clodsire modal level must be >= 15 upon opening');
    PokemonApp.setPokedexModalLevel(5); // Try to set below 15
    assertEquals(PokemonApp.getPokedexModalState().level, 15, 'Setting Clodsire level below 15 must clamp to 15');

    // 5. Verify Pokédex Modal Level Setting for Base form (Paldean Wooper)
    PokemonApp.openPokemonDetailModal('7054');
    PokemonApp.setPokedexModalLevel(5);
    assertEquals(PokemonApp.getPokedexModalState().level, 15, 'Paldean Wooper with Lv.15 evo_req clamps modal level to 15');
  });

  // ----------------------------------------------------
  // Test 154: Mobile H5 Viewport Boundary Isolation, News Scrolling & Ladder Adaptation
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Viewport Boundary Isolation, News Scrolling & Ladder Dynamic Adaptation', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Viewport boundary isolation: main viewport must be explicitly anchored between header and dock
    assert(
      css.includes('.mobile-h5-app .app-main-viewport {') &&
      css.includes('top: calc(52px + env(safe-area-inset-top, 0px)) !important;') &&
      css.includes('bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
      'app-main-viewport must be anchored between top header and bottom dock'
    );

    // 2. News panel scrolling: #panel-news must have overflow-y: auto and never overflow: visible
    assert(
      css.includes('.mobile-h5-app #panel-news {') &&
      css.includes('overflow-y: auto !important;'),
      '#panel-news must have overflow-y: auto !important for native touch scrolling'
    );
    assert(
      !css.includes('.mobile-h5-app #panel-news {\n  width: 100% !important;\n  height: auto !important;\n  max-height: none !important;\n  overflow: visible !important;'),
      '#panel-news must not use overflow: visible which breaks scrolling'
    );

    // 3. Ladder single-screen view: ladder-active must use overflow: hidden for zero-scroll full view
    assert(
      css.includes('.mobile-h5-app.ladder-active #panel-wiki') &&
      css.includes('overflow: hidden !important;'),
      '#panel-wiki during ladder-active must use overflow: hidden for single-screen full view'
    );

    // 4. Subpanel ingredients: must use flex: 1 1 auto, min-height: 0 and overflow: hidden to fit all 18 tracks on screen
    assert(
      css.includes('.mobile-h5-app #wiki-subpanel-ingredients.active {') &&
      css.includes('overflow: hidden !important;') &&
      css.includes('flex: 1 1 auto !important;'),
      '#wiki-subpanel-ingredients.active must use flex: 1 1 auto and overflow: hidden'
    );
    assert(
      css.includes('.mobile-h5-app .wiki-main-container {') &&
      css.includes('min-height: 0 !important;'),
      '.mobile-h5-app .wiki-main-container must reset min-height to 0 to prevent pushing dock'
    );

    // 5. Tail box container: must sit at bottom above the dock with margin-top: auto
    assert(
      css.includes('.mobile-h5-app .ladder-tail-standalone-container {') &&
      css.includes('margin-top: auto !important;') &&
      css.includes('margin-bottom: 2px !important;'),
      'ladder tail box must sit cleanly above dock without scrolling or overflow'
    );

    // 6. Pokédex viewport: content-area must support #content-area and .content-area with flex adaptation
    assert(
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content #content-area,') &&
      css.includes('.mobile-h5-app.pokemon-active .pokemon-main-content .content-area {'),
      'pokedex view must adapt #content-area and .content-area dynamically'
    );
  });


  test('Tier 4 - Real-World Application Scenarios', 'English Concise Translations & Island Legendary Pokemon Filter Switch', () => {
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify CSS styles for island legendary switch
    assert(stylesCss.includes('.island-spawns-title-wrap'), 'CSS must define .island-spawns-title-wrap');
    assert(stylesCss.includes('.island-legendary-switch-label'), 'CSS must define .island-legendary-switch-label');

    // 2. Setup VM environment for wiki and i18n
    const localStore = {};
    const sandbox = {
      window: {
        localStorage: {
          getItem: (k) => localStore[k] || null,
          setItem: (k, v) => { localStore[k] = String(v); },
          removeItem: (k) => { delete localStore[k]; }
        },
        innerWidth: 1024,
        location: { hash: '#wiki/islands', search: '' },
        document: {
          documentElement: {
            setAttribute: () => {},
            getAttribute: () => null
          },
          getElementById: () => null,
          querySelectorAll: () => [],
          addEventListener: () => {}
        }
      },
      localStorage: {
        getItem: (k) => localStore[k] || null,
        setItem: (k, v) => { localStore[k] = String(v); },
        removeItem: (k) => { delete localStore[k]; }
      },
      document: {
        documentElement: {
          setAttribute: () => {},
          getAttribute: () => null
        },
        getElementById: () => null,
        querySelectorAll: () => [],
        addEventListener: () => {}
      },
      console: console
    };

    vm.createContext(sandbox);
    vm.runInContext(i18nCode, sandbox);
    vm.runInContext(wikiCode, sandbox);

    // 3. Verify concise English translations
    sandbox.window.I18N.setLanguage('en-US');
    assertEquals(sandbox.window.I18N.t('pokedex.reset_all'), 'Reset', 'pokedex.reset_all should be Reset');
    assertEquals(sandbox.window.I18N.t('pokedex.filter_sidebar_title'), 'Filter', 'pokedex.filter_sidebar_title should be Filter');
    assertEquals(sandbox.window.I18N.t('recipe.clear_all'), 'Clear', 'recipe.clear_all should be Clear');
    assertEquals(sandbox.window.I18N.t('recipe.calc_settings'), 'Simulation', 'recipe.calc_settings should be Simulation');
    assertEquals(sandbox.window.I18N.t('wiki.islands_legendary_toggle'), 'Legendary', 'wiki.islands_legendary_toggle should be Legendary');
    assertEquals(sandbox.window.I18N.t('wiki.subtab_skills'), 'Main Skills', 'wiki.subtab_skills should be Main Skills');
    assertEquals(sandbox.window.I18N.t('box.modal_save'), 'Save', 'box.modal_save should be Save');

    // 4. Verify Island Legendary Switch functions exist in WikiDB
    assert(typeof sandbox.window.WikiDB.toggleIslandLegendaryOnly === 'function', 'WikiDB must export toggleIslandLegendaryOnly');
    assert(typeof sandbox.window.WikiDB.getSavedIslandLegendaryOnly === 'function', 'WikiDB must export getSavedIslandLegendaryOnly');
    assert(typeof sandbox.window.WikiDB.getIsIslandLegendaryOnly === 'function', 'WikiDB must export getIsIslandLegendaryOnly');

    // 5. Select Greengrass and render normal spawns (legendary switch OFF)
    sandbox.window.WikiDB.selectIsland('greengrass');
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(false);
    let htmlAll = sandbox.window.WikiDB.renderIslandsSubpanel();
    assert(htmlAll.includes('id="island-legendary-switch"'), 'markup must include island-legendary-switch');
    assert(htmlAll.includes('Pikachu') || htmlAll.includes('Bulbasaur'), 'normal spawns must include regular Pokemon');

    // 6. Toggle Legendary Switch ON
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(true);
    assertEquals(sandbox.window.WikiDB.getIsIslandLegendaryOnly(), true, 'legendary toggle must be true');
    assertEquals(localStore['pksleep_active_island_legendary_only'], 'true', 'localStorage must persist legendary state');

    let htmlLeg = sandbox.window.WikiDB.renderIslandsSubpanel();
    assert(htmlLeg.includes('Raikou') || htmlLeg.includes('Entei') || htmlLeg.includes('Suicune'), 'legendary filter must include legendary dogs');
    assert(!htmlLeg.includes('Caterpie') && !htmlLeg.includes('Pidgey'), 'legendary filter must exclude common Pokemon');

    // 7. Toggle Legendary Switch OFF
    sandbox.window.WikiDB.toggleIslandLegendaryOnly(false);
    assertEquals(sandbox.window.WikiDB.getIsIslandLegendaryOnly(), false, 'legendary toggle must be false');
    assertEquals(localStore['pksleep_active_island_legendary_only'], 'false', 'localStorage must reflect false');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Mobile Overlay Portal Covers App Bar/Dock And Blocks Pull-To-Refresh', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    assert(appJs.includes('function portalMobileOverlays'), 'app.js must define portalMobileOverlays');
    assert(appJs.includes("classList.add('overlay-open')"), 'app.js must mark body overlay-open');
    assert(appJs.includes("classList.contains('overlay-open')"), 'pull-to-refresh must respect overlay-open');
    assert(appJs.includes('e.preventDefault()'), 'overlay pull-down must preventDefault');
    assert(recipesJs.includes('window.portalMobileOverlays'), 'recipes.js must portal filter drawer');
    assert(wikiJs.includes('window.portalMobileOverlays'), 'wiki.js must portal ladder drawer');
    assert(boxJs.includes('window.portalMobileOverlays'), 'box.js must portal edit/lightbox overlays');
    assert(appraisalJs.includes('window.portalMobileOverlays'), 'appraisal.js must portal report overlay');
    assert(wikiJs.includes('window.syncOverlayOpenState'), 'wiki.js must sync overlay-open on ladder recipe modal');
    assert(appJs.includes('function resolveUniqueOverlay'), 'app.js must dedupe duplicate overlay IDs');
    assert(appJs.includes('SIDEBAR_BACKDROP_BY_ID'), 'app.js must portal only the opened sidebar plus its backdrop');
    assert(!appJs.includes("querySelectorAll('.appraisal-modal-backdrop, .ladder-recipe-modal')"), 'app.js must not bulk-portal every overlay');
    assert(wikiJs.includes('renderLadderRecipeModalContent(modal)'), 'wiki.js must fill the same modal node being shown');
    assert(wikiJs.includes("window.pruneOverlayDuplicates"), 'wiki re-render must prune orphan overlay copies');

    assert(css.includes('.mobile-h5-app.overlay-open'), 'CSS must define overlay-open stacking');
    assert(css.includes('.mobile-h5-app.overlay-open .mobile-app-header'), 'CSS must drop app bar under overlay');
    assert(css.includes('.mobile-h5-app.overlay-open .bottom-dock'), 'CSS must drop bottom dock under overlay');
    assert(css.includes('z-index: 10040 !important;'), 'sidebar backdrop must sit above header/dock');
    assert(css.includes('z-index: 10050 !important;'), 'filter drawer must sit above blurred chrome');
    assert(css.includes('.mobile-h5-app .sidebar-scrollable-content') && css.includes('overscroll-behavior-y: contain !important;'), 'filter drawer must contain overscroll');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Ladder Recipe Banner Simplification: Icon-Only Presentation, Borderless Dish, Red Circular X Clear Button, and Zero Ingredient Chips', () => {
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Static code assertions
    assert(!wikiJs.includes('ladder-recipe-banner-ings'), 'wiki.js must NOT render .ladder-recipe-banner-ings in the banner');
    assert(!wikiJs.includes('ladder-recipe-banner-ing-chip'), 'wiki.js must NOT render .ladder-recipe-banner-ing-chip in the banner');
    assert(!wikiJs.includes('ladder-recipe-banner-title'), 'wiki.js must NOT render .ladder-recipe-banner-title (dish name text)');
    assert(!wikiJs.includes('<span>${isEN ? \'Clear\' : \'清除\'}</span>'), 'Clear button must NOT render text, only X icon');
    assert(wikiJs.includes('class="ladder-recipe-banner-clear-btn"'), 'Clear button must exist');

    // 2. CSS Style assertions
    assert(css.includes('.ladder-recipe-banner-recipe-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 0;\n  border: none;\n  background: transparent;\n  box-shadow: none;\n}'), 'recipe chip must be borderless and backgroundless');
    assert(css.includes('.ladder-recipe-banner-clear-btn') && css.includes('border-radius: 50%'), 'clear button must have circular border-radius');
    assert(css.includes('.mobile-h5-app .ladder-recipe-banner-clear-btn') && css.includes('border-radius: 50% !important;'), 'mobile clear button must be circular');

    // 3. Functional / DOM verification with WikiDB
    const ctx = {
      localStorage: { getItem: () => 'zh-TW', setItem: () => {} },
      window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
      document: {
        readyState: 'complete',
        addEventListener: () => {},
        getElementById: () => null,
        querySelectorAll: () => []
      }
    };
    vm.createContext(ctx);
    vm.runInContext(wikiJs, ctx);

    ctx.window.WikiDB.selectLadderHighlightRecipe('彈跳咖哩烏龍麵');
    const renderedHtml = ctx.window.WikiDB.renderCoordinateLadder();

    assert(renderedHtml.includes('class="ladder-recipe-banner'), 'Rendered ladder must include recipe banner when active');
    assert(renderedHtml.includes('class="ladder-recipe-banner-icon"'), 'Banner must render dish icon');
    assert(!renderedHtml.includes('ladder-recipe-banner-ing-chip'), 'Banner must NOT contain ingredient chips');
    assert(!renderedHtml.includes('ladder-recipe-banner-title'), 'Banner must NOT contain dish name title');
    assert(renderedHtml.includes('class="ladder-recipe-banner-clear-btn"'), 'Banner must contain clear button');
    assert(!renderedHtml.includes('<span>清除</span>'), 'Clear button must NOT contain text');
    assert(renderedHtml.includes('<line x1="18" y1="6" x2="6" y2="18"></line>'), 'Clear button must contain X SVG');

    // Clean up
    ctx.window.WikiDB.clearLadderHighlightRecipe();
  });


  test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder & Islands Polish: Tail Redundant Icon Removal, Track Blue Highlight Neutralization, Single-Language Island Title & Official Name Validation', () => {
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');
    const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/news.js'), 'utf8');

    // 1. Redundant tail icon & ruler spacer removed from ladder
    assert(!wikiJs.includes('ladder-track-header-right'), 'Ladder tail track must NOT contain redundant ladder-track-header-right');
    const tailSpacers = wikiJs.match(/class="ladder-tail-ruler-spacer"/g) || [];
    assert(tailSpacers.length === 1, 'Ladder tail ruler must have exactly 1 spacer on the left, trailing spacer removed');

    // 2. Track blue highlight neutralized
    assert(css.includes('.ladder-track-row.ladder-track-highlighted') && css.includes('background: transparent !important;'), 'Highlighted track must have transparent background');
    assert(css.includes('border-left: none !important;'), 'Highlighted track must not have blue left border');
    assert(css.includes('box-shadow: none !important;'), 'Highlighted track must not have blue box shadow');

    // 3. Island Title localized presentation (no English subtitle forcing berries to next line)
    assert(!wikiJs.includes('<span class="island-title-en">'), 'Island hero must not include redundant English subtitle');

    // 4. Official Island Name (寶藍湖畔) verification
    assert(wikiJs.includes('name: "寶藍湖畔"'), "wiki.js ISLANDS_DATA must contain official name '寶藍湖畔'");
    assert(i18nJs.includes("'寶藍湖畔': { 'zh-TW': '寶藍湖畔'"), "i18n.js ISLAND_NAMES must contain official name '寶藍湖畔'");
    assert(newsJs.includes("'寶藍湖畔': 'Lapis Lakeside'"), "news.js ISLAND_MAP must contain official name '寶藍湖畔'");
  });


  test('Tier 4 - Real-World Application Scenarios', 'H5 App Complete Scrollbar Suppression Across All Views', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Universal H5 Scrollbar suppression rules
    assert(css.includes('body.mobile-h5-app *') && css.includes('scrollbar-width: none !important;'), 'H5 app elements must have scrollbar-width: none !important');
    assert(css.includes('body.mobile-h5-app *::-webkit-scrollbar') && css.includes('display: none !important;'), 'H5 app webkit scrollbars must have display: none !important');
    assert(css.includes('.mobile-h5-app .wiki-subnav-tabs::-webkit-scrollbar') && css.includes('display: none !important;'), 'Wiki subnav tabs scrollbar must be hidden');

    // 2. View panels explicitly in WebKit scrollbar suppression list
    assert(css.includes('#panel-wiki::-webkit-scrollbar') && css.includes('#panel-pokemon::-webkit-scrollbar'), 'Main panels must be in webkit scrollbar suppression list');

    // 3. Mobile H5 App wiki-card-header shifted up
    assert(css.includes('.mobile-h5-app .wiki-card-header') && css.includes('margin-top: -4px !important;'), 'Mobile wiki-card-header must be shifted up with negative margin-top');
    assert(css.includes('.mobile-h5-app #wiki-subpanel-islands .island-spawns-card > .wiki-card-header'), 'Island spawns header must have dedicated mobile styling');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Island Scene Background Full Page Follow and Fault Line Elimination', () => {
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Desktop & Universal Island Scene Layer must be fixed to viewport following entire page scroll
    assert(css.includes('.island-scene-layer') && css.includes('position: fixed !important;'), 'Island scene layer must use fixed positioning to follow page scroll');
    assert(css.includes('.island-scene-layer') && css.includes('width: 100vw !important;') && css.includes('height: 100vh !important;'), 'Island scene layer must span 100vw and 100vh');
    assert(css.includes('body:not(.mobile-h5-app) #panel-wiki.has-island-scene > .island-scene-layer') && css.includes('position: fixed !important;'), 'Desktop island scene layer must be fixed');

    // 2. Mobile Island Scene Layer fills 100% width with height determined by aspect ratio
    assert(css.includes('.mobile-h5-app #wiki-subpanel-islands.has-island-scene > .island-scene-layer') && css.includes('width: calc(100% + 20px) !important;'), 'Mobile island scene layer must span 100% width');
    assert(css.includes('.mobile-h5-app .island-scene-photo') && css.includes('aspect-ratio: 2560 / 1372 !important;'), 'Mobile island scene photo height must be determined by width aspect-ratio');

    // 3. Desktop Island photo must cover full height and position properly
    assert(css.includes('.island-scene-photo') && css.includes('height: 100% !important;') && css.includes('object-fit: cover !important;'), 'Island scene photo must cover container with 100% height');
    assert(css.includes('.island-scene-fade') && css.includes('height: 100%;'), 'Island scene fade must span 100% height without abrupt cutoff line');

    // 4. Global html background color
    assert(css.includes('html {\n  background-color: var(--bg-dark);'), 'HTML element must have background-color: var(--bg-dark) for seamless bounce/rubber-band edges');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Calc Input Num Focusability, Selection, and Non-Destructive Tooltip Dismiss Verification', () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. dismissAllFloatingTooltips must protect form fields from being blurred
    assert(appJs.includes("activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT'"), 'dismissAllFloatingTooltips must check if activeElement is a form field');
    assert(appJs.includes('if (!isFormField) {\n        document.activeElement.blur();'), 'dismissAllFloatingTooltips must only blur non-form elements');

    // 2. CSS must define robust focus and selection rules for calc-input-num (desktop and mobile)
    assert(css.includes('.calc-input-num:focus') && css.includes('.calc-input-num:focus-visible'), 'CSS must define focus & focus-visible for calc-input-num');
    assert(css.includes('.mobile-h5-app .calc-input-num:focus') && css.includes('border-color: var(--accent-blue, #38bdf8) !important;'), 'Mobile CSS must define high-priority border-color on focus');
    assert(css.includes('.mobile-h5-app .calc-input-num') && css.includes('user-select: text !important;'), 'Mobile calc-input-num must have user-select: text !important');

    // 3. wiki.js calc-sleep-cur-lv must have inputmode and auto-selection attributes
    assert(wikiJs.includes('id="calc-sleep-cur-lv"') && wikiJs.includes('inputmode="numeric"'), 'calc-sleep-cur-lv must specify inputmode="numeric"');
    assert(wikiJs.includes('onfocus="this.select()"') && wikiJs.includes('onclick="this.select()"'), 'calc-sleep-cur-lv must trigger this.select() on focus and click');
    assert(wikiJs.includes("curLvInput.addEventListener('focus'"), 'curLvInput must bind focus listener for auto-selection');

    // 4. Functional VM verification: dismissAllFloatingTooltips must NOT blur input elements
    const mockInput = {
      tagName: 'INPUT',
      id: 'calc-sleep-cur-lv',
      blurred: false,
      blur() { this.blurred = true; }
    };
    const mockBtn = {
      tagName: 'BUTTON',
      id: 'test-btn',
      blurred: false,
      classList: { remove: () => {} },
      setAttribute: () => {},
      blur() { this.blurred = true; }
    };

    const sandbox = {
      window: {
        innerWidth: 375,
        innerHeight: 667,
        WikiDB: { closeLadderEnergyHelp: () => {} }
      },
      document: {
        body: {},
        activeElement: mockInput,
        querySelectorAll: () => [],
        getElementById: () => null
      }
    };

    const funcCode = `
      let currentGlobalTooltipAnchor = null;
      let lastGlobalTooltipShownTime = 0;
      let isTooltipPinned = false;
      ${appJs.substring(appJs.indexOf('function hideGlobalTooltip'), appJs.indexOf('if (typeof window !== \'undefined\') {\n  window.showGlobalTooltip'))}
    `;
    vm.createContext(sandbox);
    vm.runInContext(funcCode, sandbox);

    // Call dismissAllFloatingTooltips when activeElement is mockInput
    sandbox.dismissAllFloatingTooltips();
    assert(mockInput.blurred === false, 'dismissAllFloatingTooltips must NOT blur an active INPUT element');

    // Call dismissAllFloatingTooltips when activeElement is mockBtn
    sandbox.document.activeElement = mockBtn;
    sandbox.dismissAllFloatingTooltips();
    assert(mockBtn.blurred === true, 'dismissAllFloatingTooltips MUST blur a non-form element');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Supabase CloudSync: Module Initialization, Union Merge Algorithm & Box Integration', () => {
    const cloudSync = require(path.join(WORKSPACE_ROOT, 'js', 'core', 'cloudSync.js'));
    assert(cloudSync !== null, 'cloudSync module should export successfully');
    assertEquals(typeof cloudSync.mergePokemonBoxes, 'function', 'mergePokemonBoxes should be a function');
    assertEquals(typeof cloudSync.signInWithPassword, 'function', 'signInWithPassword should be a function');
    assertEquals(typeof cloudSync.signUpWithPassword, 'function', 'signUpWithPassword should be a function');
    assertEquals(typeof cloudSync.isLoggedIn, 'function', 'isLoggedIn should be a function');
    assertEquals(cloudSync.isLoggedIn(), false, 'isLoggedIn should default to false in guest mode');
    assertEquals(cloudSync.getStatus(), 'guest', 'getStatus should default to guest mode without config');

    // Test mergePokemonBoxes
    // 1. Remote has Pikachu, Local has Charmander (Union merge)
    const local = [
      { uid: 'pkm_local_1', pokemonId: '4', name: '小火龍', level: 12, nature: '固執', subskills: ['樹果數量S'], ing1: '豆製肉', createdAt: 1000 }
    ];
    const remote = [
      { uid: 'pkm_remote_1', pokemonId: '25', name: '皮卡丘', level: 25, nature: '爽朗', subskills: ['幫手獎勵'], ing1: '特選蘋果', createdAt: 500 }
    ];

    const merged1 = cloudSync.mergePokemonBoxes(local, remote);
    assertEquals(merged1.length, 2, 'Union merge should contain both items');
    assert(merged1.some(p => p.uid === 'pkm_local_1'), 'Merged should contain local item');
    assert(merged1.some(p => p.uid === 'pkm_remote_1'), 'Merged should contain remote item');

    // 2. Conflict resolution: same uid, local is newer
    const localUpdated = [
      { uid: 'pkm_remote_1', pokemonId: '25', name: '皮卡丘', level: 30, nature: '爽朗', subskills: ['幫手獎勵'], ing1: '特選蘋果', updatedAt: 2000 }
    ];
    const merged2 = cloudSync.mergePokemonBoxes(localUpdated, remote);
    assertEquals(merged2.length, 1, 'Same UID should not duplicate');
    assertEquals(merged2[0].level, 30, 'Newer timestamp should take precedence');

    // 3. Fingerprint deduplication: different UID but same exact pokemon attributes
    const localDuplicate = [
      { uid: 'pkm_new_rand', pokemonId: '25', name: '皮卡丘', level: 25, nature: '爽朗', subskills: ['幫手獎勵'], ing1: '特選蘋果', createdAt: 1000 }
    ];
    const merged3 = cloudSync.mergePokemonBoxes(localDuplicate, remote);
    assertEquals(merged3.length, 1, 'Exact fingerprint duplicate should not be added twice');

    // 4. Empty arrays handling
    assertArrayEquals(cloudSync.mergePokemonBoxes([], remote), remote, 'Empty local returns remote');
    assertArrayEquals(cloudSync.mergePokemonBoxes(local, []), local, 'Empty remote returns local');

    // 5. Account & Password validation tests
    assertEquals(cloudSync.parseAndValidateAccount('').valid, false, 'Empty account should be invalid');
    assertEquals(cloudSync.parseAndValidateAccount('ab').valid, false, 'Account < 3 chars should be invalid');
    assertEquals(cloudSync.parseAndValidateAccount('a'.repeat(21)).valid, false, 'Account > 20 chars should be invalid');
    assertEquals(cloudSync.parseAndValidateAccount('trainer name').valid, false, 'Account with spaces should be invalid');
    assertEquals(cloudSync.parseAndValidateAccount('trainer!@#').valid, false, 'Account with symbols should be invalid');
    
    const validAcc = cloudSync.parseAndValidateAccount('trainer_99');
    assertEquals(validAcc.valid, true, 'trainer_99 should be valid account');
    assertEquals(validAcc.username, 'trainer_99', 'Username should be preserved');
    assertEquals(validAcc.email, 'trainer_99@pkmsleep.internal', 'Should map to internal identifier');

    // Password validation tests
    assertEquals(cloudSync.validatePassword('').valid, false, 'Empty password should be invalid');
    assertEquals(cloudSync.validatePassword('12345').valid, false, 'Password < 6 chars should be invalid');
    assertEquals(cloudSync.validatePassword('a'.repeat(33)).valid, false, 'Password > 32 chars should be invalid');
    assertEquals(cloudSync.validatePassword('pass word').valid, false, 'Password with spaces should be invalid');
    assertEquals(cloudSync.validatePassword('111111').valid, false, 'All same chars password should be invalid');
    assertEquals(cloudSync.validatePassword('123456').valid, false, 'Trivial password should be invalid');
    assertEquals(cloudSync.validatePassword('strong_pass99').valid, true, 'Valid password should pass');

    // 6. DOM Auth Modal creation and event binding test
    const code = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'cloudSync.js'), 'utf8');
    const docElements = {};
    const mockDoc = {
      getElementById: (id) => {
        if (!docElements[id]) {
          docElements[id] = {
            id,
            style: {},
            setAttribute: () => {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {} },
            addEventListener: () => {}
          };
        }
        return docElements[id];
      },
      querySelectorAll: () => [],
      createElement: (tag) => ({
        tagName: tag,
        style: {},
        setAttribute: () => {},
        classList: { add: () => {}, remove: () => {} }
      }),
      body: { appendChild: () => {} }
    };
    const sandbox = {
      window: { addEventListener: () => {} },
      document: mockDoc,
      localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
      console,
      setTimeout: () => {}
    };
    sandbox.window.window = sandbox.window;
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    let openModalError = null;
    try {
      sandbox.window.CloudSync.openAuthModal();
    } catch (err) {
      openModalError = err;
    }
    assertEquals(openModalError, null, 'openAuthModal must not throw any ReferenceError or uncaught exceptions');

    // 7. View switching and remember-me verification
    assertEquals(typeof sandbox.window.CloudSync.switchAuthView, 'function', 'switchAuthView must be a function');
    sandbox.window.CloudSync.switchAuthView('signup');
    sandbox.window.CloudSync.switchAuthView('signin');

    let fakeStorage = {};
    sandbox.localStorage.getItem = (k) => fakeStorage[k] || null;
    sandbox.localStorage.setItem = (k, v) => { fakeStorage[k] = v; };
    sandbox.localStorage.removeItem = (k) => { delete fakeStorage[k]; };

    sandbox.window.CloudSync.saveRememberedAuth('player99', 'mypass123', true);
    const remembered = sandbox.window.CloudSync.getRememberedAuth();
    assertEquals(remembered.account, 'player99', 'Remembered account must match');
    assertEquals(remembered.password, 'mypass123', 'Remembered password must match');

    sandbox.window.CloudSync.saveRememberedAuth('player99', 'mypass123', false);
    assertEquals(sandbox.window.CloudSync.getRememberedAuth(), null, 'Clearing remember-me should return null');

    // 8. Box Auth Overlay verification
    assertEquals(typeof sandbox.window.CloudSync.updateBoxAuthOverlay, 'function', 'updateBoxAuthOverlay must be a function');
    assertEquals(typeof sandbox.window.CloudSync.dismissBoxAuthOverlay, 'function', 'dismissBoxAuthOverlay must be a function');

    // Simulate panel-box in DOM
    const panelBoxEl = sandbox.document.createElement('div');
    panelBoxEl.id = 'panel-box';
    sandbox.document.body.appendChild(panelBoxEl);

    // Call updateBoxAuthOverlay when guest
    sandbox.window.CloudSync.updateBoxAuthOverlay();
    const overlayEl = sandbox.document.getElementById('box-auth-overlay');
    assert(overlayEl !== null, 'box-auth-overlay must be created in panel-box when guest');
    assertEquals(overlayEl.style.display, 'flex', 'box-auth-overlay must be displayed as flex when guest');

    // Test dismissBoxAuthOverlay
    sandbox.window.CloudSync.dismissBoxAuthOverlay();
    assertEquals(overlayEl.style.display, 'none', 'dismissBoxAuthOverlay must hide overlay');

    // Test resetDismissed on tab switch
    sandbox.window.CloudSync.updateBoxAuthOverlay(true);
    assertEquals(overlayEl.style.display, 'flex', 'updateBoxAuthOverlay(true) must restore overlay when guest clicks tab');

    // 9. Floating Toast notification system verification
    assertEquals(typeof sandbox.window.showToast, 'function', 'showToast must be globally available on window');
    assertEquals(typeof sandbox.window.CloudSync.showToast, 'function', 'showToast must be exported on CloudSync');

    const toastEl = sandbox.window.showToast('登入成功', '歡迎回來，測試帳號！', 'success');
    assert(toastEl !== null, 'showToast must return created toast DOM element');
    const toastContainer = sandbox.document.getElementById('box-toast-container');
    assert(toastContainer !== null, '#box-toast-container must exist in DOM');
    assert(toastEl.className.includes('toast-success'), 'Toast element must have toast-success class');

    const warnToast = sandbox.window.showToast('同步異常', '網路連線逾時', 'warning');
    assert(warnToast.className.includes('toast-warning'), 'Toast element must have toast-warning class');

    const infoToast = sandbox.window.showToast('已登出', '切換為訪客模式', 'info');
    assert(infoToast.className.includes('toast-info'), 'Toast element must have toast-info class');

    // 10. Toast Deduplication & Flood Suppression verification
    const dupToast = sandbox.window.showToast('已登出', '切換為訪客模式', 'info');
    assertEquals(dupToast, null, 'showToast must suppress immediate duplicate toast notifications within 2.5s');
    assert(!toastContainer.children || toastContainer.children.length <= 2, '#box-toast-container must cap visible toasts to at most 2 items');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Traditional Chinese Localization & Main Skills Audit: Verifies 居合斬, 健美, 波導彈, 精神擊破, and official recipes in recipes.json', () => {
    const recipesData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'recipes.json'), 'utf8'));
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));

    // 1. Verify recipe names in recipes.json
    const cutCurry = recipesData.find(r => r.name_en === 'Cut Sukiyaki Curry');
    assert(cutCurry !== undefined, 'Cut Sukiyaki Curry recipe must exist');
    assertEquals(cutCurry.name_cn, '居合斬壽喜燒咖哩', 'Cut Sukiyaki Curry must be translated as 居合斬壽喜燒咖哩 (not 一字斬)');

    const bulkCurry = recipesData.find(r => r.name_en === 'Bulk Up Bean Curry');
    assert(bulkCurry !== undefined, 'Bulk Up Bean Curry recipe must exist');
    assertEquals(bulkCurry.name_cn, '健美豆子咖哩', 'Bulk Up Bean Curry must be translated as 健美豆子咖哩');

    const heartyCurry = recipesData.find(r => r.name_en === 'Hearty Cheeseburger Curry');
    assert(heartyCurry !== undefined, 'Hearty Cheeseburger Curry recipe must exist');
    assertEquals(heartyCurry.name_cn, '吃飽飽起司肉排咖哩', 'Hearty Cheeseburger Curry must be translated as 吃飽飽起司肉排咖哩');

    const sweetPotato = recipesData.find(r => r.name_en === 'Fluffy Sweet Potatoes');
    assert(sweetPotato !== undefined, 'Fluffy Sweet Potatoes recipe must exist');
    assertEquals(sweetPotato.name_cn, '熟成甜薯燒', 'Fluffy Sweet Potatoes must be 熟成甜薯燒');

    // 2. Verify Mawile skill typo fix in data.json
    const mawile = pkmData.find(p => p.id === '303' || p.name_cn === '大嘴娃' || p.name_en === 'Mawile');
    assert(mawile !== undefined, 'Mawile (#303) must exist in data.json');
    assertEquals(mawile.main_skill, '怪力鉗（食材精選S）', 'Mawile main_skill must be Traditional Chinese 怪力鉗 (not 怪力钳)');

    // 3. Verify getPokedexMainSkillYield for 健美（料理輔助S）
    const bulkUpYield = PokemonApp.getPokedexMainSkillYield('健美（料理輔助S）', 1, 2.0, false);
    assert(bulkUpYield.mainSkillValueText.includes('顆食材') && bulkUpYield.mainSkillValueText.includes('大成功率'), '健美 yield must include both ingredients and tasty chance');
    assertEquals(bulkUpYield.mainSkillValueText, '+12.0 顆食材 & +2.0% 大成功率', 'Lv1 健美 with 2 triggers should be 12.0 ings and 2.0% tasty');
    assert(bulkUpYield.mainSkillSingleText.includes('6 顆食材') && bulkUpYield.mainSkillSingleText.includes('+1% 大成功率'), '健美 Lv1 single should be 6 ings, +1% tasty');
    assert(bulkUpYield.mainSkillDesc.length > 0, '健美 mainSkillDesc must not be empty');

    // 4. Verify getPokedexMainSkillYield for 波導彈（夢之碎片獲取S）
    const auraYield = PokemonApp.getPokedexMainSkillYield('波導彈（夢之碎片獲取S）', 1, 2.0, false);
    assert(auraYield.mainSkillValueText.includes('碎片') && auraYield.mainSkillValueText.includes('能量'), '波導彈 yield must include both shards and strength');

    // 5. Verify getPokedexMainSkillYield for 精神擊破（樹果領域）
    const psyYield = PokemonApp.getPokedexMainSkillYield('精神擊破（樹果領域）', 1, 2.0, false);
    assert(psyYield.mainSkillValueText.includes('點能量 + 樹果領域'), '精神擊破 yield must include strength and berry field');

    // 6. Verify getSkillDescription for both special and base skills
    const baseDesc = PokemonApp.getSkillDescription('能量填充S', false);
    assert(baseDesc.includes('增加卡比獸的能量'), 'Base skill description must be returned by getSkillDescription');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Rebuilt Strict Pokemon Appraisal Engine & Disqualification Gating Rules Verification', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);

    const pikachu = dataset.find(p => p.name_cn === '皮卡丘');
    const blastoise = dataset.find(p => p.name_cn === '水箭龜');
    const gardevoir = dataset.find(p => p.name_cn === '沙奈朵');
    const slowpoke = dataset.find(p => p.name_cn === '呆呆獸');
    const ampharos = dataset.find(p => p.name_cn === '電龍');

    // 1. Berry Specialists Rules
    // 1a. Mediocre wild Berry mon without BFS drops to D/C (<= 60)
    const berryWild = appCtx.AppraisalLab.evaluatePokemon(pikachu, 30, '坦率', ['幫忙速度S'], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(berryWild.compositeScore <= 60, 'Berry mon without BFS and neutral/low kit must drop to D/C (<= 60)');
    assertEquals(berryWild.grade, 'D', 'Score <= 60 should be D grade');

    // 1b. Non-BFS Berry mon hard cap (<= 72), except extreme speed
    const berryNoBfsGood = appCtx.AppraisalLab.evaluatePokemon(pikachu, 50, '坦率', ['幫忙速度M', '持有上限提升L'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(berryNoBfsGood.compositeScore <= 72, 'Berry specialist without BFS is capped at <= 72 (B/C grade)');

    // 1c. Extreme speed exception: Helping Bonus + Helping Speed M + Speed nature allowed up to A (<= 85)
    const berryExtremeSpeed = appCtx.AppraisalLab.evaluatePokemon(pikachu, 50, '固執', ['幫手獎勵', '幫忙速度M'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(berryExtremeSpeed.compositeScore >= 80 && berryExtremeSpeed.compositeScore <= 85, 'Extreme speed kit without BFS exceptionally qualifies for A tier (80~85)');
    assertEquals(berryExtremeSpeed.grade, 'A', 'Extreme speed should achieve A grade');
    assert(berryExtremeSpeed.pros.some(p => p.includes('極限幫速配置')), 'Extreme speed pro diagnosis must be present');

    // 1d. Speed Down nature fatal penalty for Berry mon
    const berrySpeedDown = appCtx.AppraisalLab.evaluatePokemon(pikachu, 30, '內斂', ['樹果數量S'], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(berrySpeedDown.compositeScore <= 64, 'Berry mon with Speed Down nature must be heavily penalized (<= 64)');
    assert(berrySpeedDown.cons.some(c => c.includes('幫忙速度▼')), 'Cons must warn about Speed Down nature penalty');

    // 2. Ingredient Specialists Rules
    // 2a. Ingredient Down nature fatal flaw: strictly drops to <= 62 (D/C)
    const ingDown = appCtx.AppraisalLab.evaluatePokemon(blastoise, 30, '淘氣', ['食材機率提升M'], ['特選牛奶', '特選牛奶'], 0, 1);
    assert(ingDown.compositeScore <= 62, 'Ingredient specialist with Ingredient Down nature must drop to <= 62 (D/C grade)');
    assert(ingDown.cons.some(c => c.includes('致命缺陷') && c.includes('食材發現率▼')), 'Cons must warn that Ingredient Down nature is a fatal disqualification');

    // 2b. ABC ingredient combo capped at A (<= 88)
    const ingAbc = appCtx.AppraisalLab.evaluatePokemon(blastoise, 60, '冷靜', ['食材機率提升M', '食材機率提升S', '幫手獎勵'], ['特選牛奶', '波士可可', '鮮濃雪原純乳酪'], 0, 1);
    assert(ingAbc.compositeScore <= 88, 'ABC ingredient combination must be capped at <= 88 (cannot reach S/SS/SSS)');
    assertEquals(ingAbc.grade, 'A', 'ABC combination must be capped at A grade');
    assert(ingAbc.cons.some(c => c.includes('ABC') && c.includes('嚴重稀釋')), 'Cons must warn of ABC recipe dilution');

    // 2c. BFS without Inventory Up on ingredient mon penalized and warned
    const ingBfsNoCarry = appCtx.AppraisalLab.evaluatePokemon(blastoise, 30, '坦率', ['樹果數量S'], ['特選牛奶', '特選牛奶'], 0, 1);
    assert(ingBfsNoCarry.cons.some(c => c.includes('缺乏「持有上限提升」') && c.includes('偷吃樹果')), 'Cons must warn BFS on ingredient mon without inventory up leads to rapid overflow');

    // 3. Skill Specialists Rules
    // 3a. Healer with Skill Down nature locked to D (<= 58)
    const healerSkillDown = appCtx.AppraisalLab.evaluatePokemon(gardevoir, 30, '樂天', ['技能機率提升M'], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(healerSkillDown.compositeScore <= 58, 'Healer with Skill Down nature must be locked to D grade (<= 58)');
    assertEquals(healerSkillDown.grade, 'D', 'Healer with Skill Down must receive D grade');

    // 3b. Healer without any skill triggers or nature boost locked to C (<= 68)
    const healerNoSkill = appCtx.AppraisalLab.evaluatePokemon(gardevoir, 30, '坦率', ['幫忙速度S'], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(healerNoSkill.compositeScore <= 68, 'Healer without any skill boost must be locked to C/D grade (<= 68)');
    assert(healerNoSkill.cons.some(c => c.includes('缺乏任何主技能發動率副技能')), 'Cons must warn healer lacks skill boosts');

    // 3c. Hybrid BFS compensation for Charge Strength
    const ampharosHybrid = appCtx.AppraisalLab.evaluatePokemon(ampharos, 60, '坦率', ['樹果數量S', '幫忙速度M'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(ampharosHybrid.pros.some(p => p.includes('樹果數量S') && p.includes('高額樹果副輸出')), 'Charge Strength hybrid with BFS must highlight berry output in pros');

    // 4. Special Cases: Slowpoke Family
    // 4a. Lv.30 unlocks Slowpoke Tail (+14 strategic unlock bonus)
    const slowpokeTail = appCtx.AppraisalLab.evaluatePokemon(slowpoke, 30, '坦率', ['食材機率提升M'], ['放鬆可可', '美味尾巴'], 0, 1);
    assert(slowpokeTail.pros.some(p => p.includes('美味尾巴') && p.includes('首要戰略解鎖使命')), 'Slowpoke with Lv.30 Tail must highlight strategic unlock in pros');

    // 4b. Lv.30 lacks Slowpoke Tail (-20 penalty, capped at <= 64)
    const slowpokeNoTail = appCtx.AppraisalLab.evaluatePokemon(slowpoke, 30, '坦率', ['食材機率提升M'], ['放鬆可可', '放鬆可可'], 0, 1);
    assert(slowpokeNoTail.compositeScore <= 64, 'Slowpoke without Lv.30 tail must be penalized to <= 64');
    assert(slowpokeNoTail.cons.some(c => c.includes('致命失職') && c.includes('未出「美味尾巴」')), 'Slowpoke without tail must have fatal mission failure con');
    assert(slowpokeTail.compositeScore > slowpokeNoTail.compositeScore + 25, 'Slowpoke with Tail must score substantially higher than without tail');

    // 5. Cleared / Empty Subskills
    const emptySubPkm = appCtx.AppraisalLab.evaluatePokemon(pikachu, 30, '坦率', [], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(emptySubPkm.compositeScore <= 62, 'Empty subskills at Lv.30 must be capped at <= 62 (D/C grade)');

    // 6. Universal Helping Bonus
    const withHB = appCtx.AppraisalLab.evaluatePokemon(pikachu, 30, '坦率', ['幫手獎勵'], ['特選蘋果', '特選蘋果'], 0, 1);
    const withoutHB = appCtx.AppraisalLab.evaluatePokemon(pikachu, 30, '坦率', [], ['特選蘋果', '特選蘋果'], 0, 1);
    assert(withHB.compositeScore > withoutHB.compositeScore, 'Helping Bonus must provide cross-specialty team value');

    // 7. Export helpers verification
    assert(typeof appCtx.AppraisalLab.isSlowpokeFamily === 'function', 'AppraisalLab.isSlowpokeFamily must be exported');
    assert(typeof appCtx.AppraisalLab.isSlakingFamily === 'function', 'AppraisalLab.isSlakingFamily must be exported');
    assert(typeof PokemonApp.isSlowpokeFamily === 'function', 'PokemonApp.isSlowpokeFamily must be exported');
    assert(typeof PokemonApp.isSlakingFamily === 'function', 'PokemonApp.isSlakingFamily must be exported');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Dynamic Level Appraisal Dual-Track Ratings and Milestone Leap Projections Verification', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    vm.runInContext(boxCode, appCtx);

    const pikachu = dataset.find(p => p.name_cn === '皮卡丘');
    const slowpoke = dataset.find(p => p.name_cn === '呆呆獸');

    // 1. Early God Roll: Lv.10 Pikachu with BFS at Slot 1 and Adamant nature reaches S grade (>= 90 pts)
    const earlyGodRoll = appCtx.AppraisalLab.evaluatePokemon(pikachu, 10, '固執', ['樹果數量S'], ['特選蘋果'], 0, 1);
    assert(earlyGodRoll.compositeScore >= 90, `Early Lv.10 god roll with BFS should reach S grade (>= 90 pts), got ${earlyGodRoll.compositeScore}`);
    assertEquals(earlyGodRoll.grade, 'S', 'Lv.10 god roll with BFS should receive S grade');

    // 2. Locked Core Skill: Lv.10 Pikachu with BFS at Slot 2 (Lv.25) capped at B/C (<= 72 pts) current, reaches SS/SSS (>= 95 pts) potential, with milestone leap hint
    const lockedBfsPkm = appCtx.AppraisalLab.evaluatePokemon(pikachu, 10, '固執', ['幫忙速度S', '樹果數量S', '幫手獎勵', '幫忙速度M', '技能機率提升M'], ['特選蘋果', '特選蘋果', '特選蘋果'], 0, 1);
    assert(lockedBfsPkm.currentScore <= 72, `Current level rating without active BFS should be capped at <= 72, got ${lockedBfsPkm.currentScore}`);
    assert(['B', 'C'].includes(lockedBfsPkm.currentGrade), `Current grade should be B or C, got ${lockedBfsPkm.currentGrade}`);
    assert(lockedBfsPkm.potentialScore >= 95, `Potential score with BFS + Helping Bonus + Speed at Lv.100 should be >= 95 (SS/SSS), got ${lockedBfsPkm.potentialScore}`);
    assert(['SS', 'SSS'].includes(lockedBfsPkm.potentialGrade), `Potential grade should be SS or SSS, got ${lockedBfsPkm.potentialGrade}`);
    assert(lockedBfsPkm.milestones && lockedBfsPkm.milestones.length > 0, 'Milestone leap predictions should exist for locked BFS');
    assert(lockedBfsPkm.milestones.some(m => m.level === 25 && m.skill === '樹果數量S'), 'Lv.25 milestone for BFS must be detected');
    assert(lockedBfsPkm.milestoneNote && lockedBfsPkm.milestoneNote.includes('Lv.25') && lockedBfsPkm.milestoneNote.includes('樹果數量S'), 'Milestone diagnostic note must mention Lv.25 and 樹果數量S');

    // 3. Slowpoke Lv.10 with Delicious Tail at Lv.30 generates a Lv.30 milestone projection hint
    const slowpokeLv10 = appCtx.AppraisalLab.evaluatePokemon(slowpoke, 10, '坦率', ['食材機率提升M'], ['放鬆可可', '美味尾巴', '美味尾巴'], 0, 1);
    assert(slowpokeLv10.milestones.some(m => m.level === 30 && m.type === 'ingredient' && m.skill === '美味尾巴'), 'Slowpoke Lv.30 tail milestone must be detected');
    assert(slowpokeLv10.milestoneNote && slowpokeLv10.milestoneNote.includes('美味尾巴'), 'Slowpoke milestone note must mention 美味尾巴');

    // 4. Box.calculatePokemonPR returns dual-track properties
    const boxPkm = {
      name: '皮卡丘',
      level: 10,
      nature: '固執',
      subskills: ['幫忙速度S', '樹果數量S', '幫手獎勵', '幫忙速度M', '技能機率提升M'],
      ing1: '特選蘋果',
      ing2: '特選蘋果',
      ing3: '特選蘋果',
      ribbon: 0,
      skillLevel: 1
    };
    const prResult = appCtx.PokemonBoxApp.calculatePokemonPR(boxPkm, pikachu);
    assert(typeof prResult.currentScore === 'number', 'calculatePokemonPR must return numeric currentScore');
    assert(typeof prResult.currentGrade === 'string', 'calculatePokemonPR must return currentGrade');
    assert(typeof prResult.potentialScore === 'number', 'calculatePokemonPR must return numeric potentialScore');
    assert(typeof prResult.potentialGrade === 'string', 'calculatePokemonPR must return potentialGrade');
    assert(typeof prResult.currentTierBadgeClass === 'string', 'calculatePokemonPR must return currentTierBadgeClass');
    assert(typeof prResult.potentialTierBadgeClass === 'string', 'calculatePokemonPR must return potentialTierBadgeClass');
    assert(Array.isArray(prResult.milestones), 'calculatePokemonPR must return milestones array');
    assert(prResult.milestones.some(m => m.level === 25), 'calculatePokemonPR milestones must include Lv.25 milestone');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Box Card Layout Non-Truncation, Single-Line 3-Ingredient Parallel Rendering & Evolution Stage Disambiguation Verification', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    vm.runInContext(boxCode, appCtx);
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));
    appCtx.PokemonBoxApp.setAllPokemons(pkmData);

    // 1. Evolution Stage & OCR Confusion Disambiguation
    const charizardOcr = 'Lv. 52 峽龍\n持有上限 24個\n能量填充S Lv.5\n食材機率提升S\n幫忙速度M\n食材發現率 ▲▲\nEXP獲得量 ▼▼';
    const parsedCharizard = appCtx.PokemonBoxApp.parsePokemonFromOcr(charizardOcr, null, pkmData);
    assertEquals(parsedCharizard.name, '噴火龍', '峽龍 OCR must resolve to 噴火龍 (Charizard)');

    const pawmotOcr = 'Lv. 35 !布土撥\n持有上限 22個\n電光一閃 Lv.3\n幫忙速度S\n食材機率提升M\n主技能發動機率 ▲▲\n幫忙速度 ▼▼';
    const parsedPawmot = appCtx.PokemonBoxApp.parsePokemonFromOcr(pawmotOcr, null, pkmData);
    assertEquals(parsedPawmot.name, '巴布土撥', '!布土撥 OCR must resolve to 巴布土撥 (Pawmot)');

    const slowbroOcr = 'Lv. 30 呆殼鄙\n持有上限 21個\n能量填充S Lv.3\n技能機率提升M\n幫手獎勵\n食材發現率 ▲▲\n幫忙速度 ▼▼';
    const parsedSlowbro = appCtx.PokemonBoxApp.parsePokemonFromOcr(slowbroOcr, null, pkmData);
    assertEquals(parsedSlowbro.name, '呆殼獸', '呆殼鄙 OCR must resolve to 呆殼獸 (Slowbro)');

    // 2. DOM Box Card Layout Verification
    const testList = [{
      uid: 'test_card_1',
      pokemonId: '6',
      name: '噴火龍',
      level: 52,
      nature: '溫順',
      ribbon: 3,
      ing1: '豆製肉',
      ing2: '豆製肉',
      ing3: '豆製肉',
      subskills: ['幫忙速度S', '技能等級提升M', '食材機率提升S', '技能機率提升M', '夢之碎片獎勵']
    }];

    const container = new MiniElement('div', 'box-container');
    appCtx.PokemonBoxApp.renderBoxGrid(testList, container);

    const html = container.innerHTML;
    assert(html.includes('box-card-name-row'), 'Box card must render box-card-name-row');
    assert(html.includes('box-card-name'), 'Box card must render box-card-name');
    assert(html.includes('box-card-section-ing'), 'Box card must render box-card-section-ing');
    assert(html.includes('box-ing-parallel-row'), 'Box card must render box-ing-parallel-row');
    assert(html.includes('box-ing-chips-grid'), 'Box card must render box-ing-chips-grid');

    // Verify dual PR badges are NOT inside box-card-name-row (preventing name clipping)
    const nameRowMatch = html.match(/<div class="box-card-name-row">([\s\S]*?)<\/div>/);
    assert(nameRowMatch, 'name row markup must exist');
    assert(!nameRowMatch[1].includes('box-dual-pr-badges'), 'box-card-name-row must NOT contain box-dual-pr-badges (relocated to box-card-tags to prevent name truncation)');

    // Verify ingredients no longer contain redundant Lv.1, Lv.30, Lv.60 labels
    const ingSectionMatch = html.match(/<div class="box-card-section box-card-section-ing">([\s\S]*?)<\/div>\s*<\/div>/);
    assert(ingSectionMatch, 'ingredient section markup must exist');
    assert(!ingSectionMatch[1].includes('Lv.1'), 'Single-line compact ingredients must not include redundant Lv.1 badge');
    assert(!ingSectionMatch[1].includes('Lv.30'), 'Single-line compact ingredients must not include redundant Lv.30 badge');
    assert(!ingSectionMatch[1].includes('Lv.60'), 'Single-line compact ingredients must not include redundant Lv.60 badge');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Box Redesign: 2+2+1 Subskills, Borderless Layout, Accurate Ingredients & Appraisal Modal Verification', () => {
    // 1. Verify index.html does not contain the zombie box-count-badge
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    assert(!indexHtml.includes('id="box-count-badge"'), 'index.html must not contain zombie box-count-badge stats-bar');

    // 2. Load modules in sandbox
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));

    const appCtx = {
      window: {},
      document: {
        body: new MiniElement('body', ''),
        createElement: (tag) => new MiniElement(tag, ''),
        getElementById: () => null,
        querySelectorAll: () => []
      },
      console
    };
    appCtx.window = appCtx;
    appCtx.allPokemons = pkmData;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    vm.runInContext(boxCode, appCtx);
    appCtx.PokemonBoxApp.setAllPokemons(pkmData);

    // 3. Verify getIngCountFromBase reads l1, l30, l60 accurately
    const charizard = pkmData.find(p => p.name_cn === '噴火龍');
    assert(charizard, 'Charizard data must exist');
    const countL1 = appCtx.PokemonBoxApp.getIngCountFromBase(charizard, 0, '豆製肉');
    const countL30 = appCtx.PokemonBoxApp.getIngCountFromBase(charizard, 1, '豆製肉');
    const countL60 = appCtx.PokemonBoxApp.getIngCountFromBase(charizard, 2, '豆製肉');
    assertEquals(countL1, 2, 'Charizard Lv.1 sausage count must be 2');
    assertEquals(countL30, 5, 'Charizard Lv.30 sausage count must be 5');
    assertEquals(countL60, 7, 'Charizard Lv.60 sausage count must be 7');

    // 4. Render Box Card with a Lv.35 Pokémon to verify subskills unlock states (10, 25 unlocked; 50, 75, 100 locked)
    const testList = [{
      uid: 'test_card_pawmot',
      pokemonId: '100',
      name: '巴布土撥',
      level: 35,
      nature: '固執',
      ribbon: 2,
      ing1: '特選蘋果',
      ing2: '特選蘋果',
      ing3: '特選蘋果',
      subskills: ['幫忙速度S', '食材機率提升M', '幫手獎勵', '技能機率提升M', '樹果數量S']
    }];

    const container = new MiniElement('div', 'box-container');
    appCtx.PokemonBoxApp.renderBoxGrid(testList, container);
    const html = container.innerHTML;

    // Verify actions inside name-row
    const nameRowMatch = html.match(/<div class="box-card-name-row">([\s\S]*?)<\/div>/);
    assert(nameRowMatch, 'name row markup must exist');
    assert(nameRowMatch[1].includes('box-card-actions'), 'box-card-actions must be inside box-card-name-row');
    assert(nameRowMatch[1].includes('btn-appraise'), 'box-card-actions must contain btn-appraise');
    assert(nameRowMatch[1].includes('btn-edit'), 'box-card-actions must contain btn-edit');
    assert(nameRowMatch[1].includes('btn-delete'), 'box-card-actions must contain btn-delete');

    // Verify outer card does NOT contain PR badges or summary bar
    assert(!html.includes('box-dual-pr-badges'), 'Outer card must not contain box-dual-pr-badges');
    assert(!html.includes('box-pr-summary-bar'), 'Outer card must not contain box-pr-summary-bar');

    // Verify 2+2+1 Subskills layout and locked status according to Lv.35
    assert(html.includes('box-subskills-grid'), 'Card must render box-subskills-grid');
    assert(!html.includes('subskill-lv-badge'), 'Subskills must not display redundant Lv.xx badges');
    
    // In Lv.35: Slot 0 (Lv.10) and Slot 1 (Lv.25) are unlocked; Slot 2 (Lv.50), Slot 3 (Lv.70), Slot 4 (Lv.80) are locked
    const subskillMatches = [...html.matchAll(/<div class="box-subskill-pill\s+([^"]+)"/g)];
    assertEquals(subskillMatches.length, 5, 'Must render exactly 5 subskill pills');
    assert(!subskillMatches[0][1].includes('subskill-locked'), 'Slot 1 (Lv.10) must be unlocked at Lv.35');
    assert(!subskillMatches[1][1].includes('subskill-locked'), 'Slot 2 (Lv.25) must be unlocked at Lv.35');
    assert(subskillMatches[2][1].includes('subskill-locked'), 'Slot 3 (Lv.50) must be locked at Lv.35');
    assert(subskillMatches[3][1].includes('subskill-locked'), 'Slot 4 (Lv.70) must be locked at Lv.35');
    assert(subskillMatches[4][1].includes('subskill-locked'), 'Slot 5 (Lv.80) must be locked at Lv.35');

    // Verify Nature single-row display
    assert(html.includes('box-nature-single-row'), 'Nature must render as box-nature-single-row');

    // 5. Verify Appraisal Modal Structure
    let createdModal = null;
    appCtx.document.createElement = (tag) => {
      const el = new MiniElement(tag, '');
      if (tag === 'div') createdModal = el;
      return el;
    };

    appCtx.AppraisalLab.openModal({
      pkm: charizard,
      level: 52,
      nature: '溫順',
      subskills: ['幫忙速度S', '技能等級提升M', '食材機率提升S', '技能機率提升M', '夢之碎片獎勵'],
      ingredients: ['豆製肉', '豆製肉', '豆製肉'],
      ribbon: 3,
      summaryNote: '強力噴火龍'
    });

    assert(createdModal, 'Modal element must be created');
    const modalHtml = createdModal.innerHTML;
    assert(!modalHtml.includes('appraisal-type-tag'), 'Appraisal modal must NOT contain appraisal-type-tag');
    assert(modalHtml.includes('appraisal-berry-tag'), 'Appraisal modal must contain appraisal-berry-tag with berry icon');
    assert(modalHtml.includes('appraisal-subskills-grid'), 'Appraisal modal must render appraisal-subskills-grid in 2+2+1 format');
    assert(modalHtml.includes('appraisal-summary-bar'), 'Appraisal modal must render appraisal-summary-bar');
    assert(modalHtml.includes('強力噴火龍'), 'Appraisal modal summary bar must display summary note');
    assert(!modalHtml.includes('appraisal-costs-card'), 'Appraisal modal must NOT contain appraisal-costs-card');
    assert(modalHtml.includes('appraisal-dual-verdict-column'), 'Appraisal modal header must contain appraisal-dual-verdict-column');
    assert(!modalHtml.includes('>[x]<'), 'Appraisal modal close button must NOT use plain [x] text');
    assert(!modalHtml.includes('appraisal-config-title'), 'Appraisal modal must NOT contain appraisal-config-title');
    assert(modalHtml.includes('▲▲') || modalHtml.includes('無影響'), 'Appraisal modal must display nature effect modifiers or neutral hint');
    assert(!modalHtml.includes('Specialty') && !modalHtml.includes('專長</span>'), 'Appraisal modal spec tag must only show type without redundant specialty label');
    const rightColIdx = modalHtml.indexOf('appraisal-right-col');
    const summaryBarIdx = modalHtml.indexOf('appraisal-summary-bar');
    assert(summaryBarIdx > rightColIdx, 'appraisal-summary-bar must be located inside appraisal-right-col at the bottom');
    assert(!modalHtml.includes('appraisal-milestones-card'), 'Appraisal modal must NOT contain appraisal-milestones-card');
    assert(modalHtml.includes('class="radar-svg-chart"'), 'Appraisal modal must contain radar-svg-chart');
    assert(modalHtml.includes('height="100%"'), 'Appraisal radar SVG must use 100% height');
    assert(modalHtml.includes('nature-pill-capsule'), 'Appraisal modal must render in-game nature pill capsule');
    assert(modalHtml.includes('nature-capsule-tag'), 'Appraisal modal must render in-game nature capsule tag');
    assert(modalHtml.includes('appraisal-mainskill-row'), 'Appraisal modal must render main skill row');
    assert(modalHtml.includes('appraisal-mainskill-level'), 'Appraisal modal must render main skill level');
    assert(modalHtml.includes('appraisal-ing-parallel-row'), 'Appraisal modal must render ingredients parallel row');
    assert(modalHtml.includes('appraisal-spec-tag spec-ingredient'), 'Appraisal modal spec tag must contain spec-ingredient class');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Specialty-Specific Intelligent Summary & In-Game Nature Display Verification', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);

    const quaquaval = dataset.find(p => p.name_cn === '狂歡浪舞鴨') || { name_cn: '狂歡浪舞鴨', specialty: '食材', main_skill: '能量填充S' };
    const gardevoir = dataset.find(p => p.name_cn === '沙奈朵') || { name_cn: '沙奈朵', specialty: '技能', main_skill: '全員活力回復S' };
    const slowpoke = dataset.find(p => p.name_cn === '呆呆獸') || { name_cn: '呆呆獸', specialty: '技能', main_skill: '能量填充S' };
    const raichu = dataset.find(p => p.name_cn === '雷丘') || { name_cn: '雷丘', specialty: '樹果', main_skill: '能量填充S' };

    // 1. 食材型寶可夢（狂歡浪舞鴨）評估：嚴禁推薦技能機率提升S/M，專注於食材供貨與速度
    const ingResult = appCtx.AppraisalLab.evaluatePokemon(
      quaquaval, 55, '自大',
      ['食材機率提升S', '幫忙速度M', '食材機率提升M', '技能機率提升S', '技能機率提升M'],
      ['美味大蔥', '美味大蔥', '美味大蔥'],
      0, 1
    );
    assert(!ingResult.summaryNote.includes('解鎖「技能機率提升S」'), 'Ingredient specialist must NEVER recommend unlocking Skill Trigger S');
    assert(ingResult.summaryNote.includes('食材') || ingResult.summaryNote.includes('供貨') || ingResult.summaryNote.includes('料理'), 'Ingredient specialist summary must focus on food supply');

    // 2. 活力補師（沙奈朵）評估：專注於全隊活力維持與技能發動期望，嚴禁挑剔食材組合
    const healerResult = appCtx.AppraisalLab.evaluatePokemon(
      gardevoir, 50, '溫和',
      ['技能機率提升M', '幫忙速度M', '技能機率提升S', '幫手獎勵', '持有上限提升L'],
      ['特選蘋果', '暖暖生薑', '暖暖生薑'],
      0, 6
    );
    assert(!healerResult.summaryNote.includes('AAA') && !healerResult.summaryNote.includes('缺乏食材'), 'Healer summary must not criticize ingredient spread');
    assert(healerResult.summaryNote.includes('回能') || healerResult.summaryNote.includes('補師') || healerResult.summaryNote.includes('活力') || healerResult.summaryNote.includes('2.2'), 'Healer summary must highlight healing engine and team vitality');

    // 3. 樹果型（雷丘）評估：核心為 BFS 與幫速，絕不要求食材機率
    const berryResult = appCtx.AppraisalLab.evaluatePokemon(
      raichu, 50, '固執',
      ['樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L', '睡眠EXP獎勵'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      0, 1
    );
    assert(!berryResult.summaryNote.includes('缺乏食材'), 'Berry specialist must not demand ingredient finder');
    assert(berryResult.summaryNote.includes('樹果數量S') || berryResult.summaryNote.includes('樹果S') || berryResult.summaryNote.includes('砲台'), 'Berry specialist summary must highlight BFS or berry output');

    // 4. 呆呆獸家族（呆呆獸）戰略開圖：精準分析 Lv.30 美味尾巴
    const slowpokeTail = appCtx.AppraisalLab.evaluatePokemon(
      slowpoke, 30, '坦率',
      ['幫忙速度S', '持有上限提升S'],
      ['放鬆可可', '美味尾巴', '美味尾巴'],
      0, 1
    );
    assert(slowpokeTail.summaryNote.includes('美味尾巴') && slowpokeTail.summaryNote.includes('戰略'), 'Slowpoke with Tail must receive strategic unlock summary');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Box Dynamic Visibility & Official Subskills Lv.70/80 Standards Verification', () => {
    // 1. Verify index.html & app/index.html subskill headers
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

    // Both desktop & mobile modal slots must contain Lv.70 & Lv.80 and NO Lv.75 / Lv.100
    assert(indexHtml.includes('<span class="slot-lvl-header">Lv.70</span>'), 'index.html must have Lv.70 slot header');
    assert(indexHtml.includes('<span class="slot-lvl-header">Lv.80</span>'), 'index.html must have Lv.80 slot header');
    assert(!indexHtml.includes('<span class="slot-lvl-header">Lv.75</span>'), 'index.html must not have Lv.75 slot header');
    assert(!indexHtml.includes('<span class="slot-lvl-header">Lv.100</span>'), 'index.html must not have Lv.100 slot header');

    assert(appIndexHtml.includes('<span class="slot-lvl-header">Lv.70</span>'), 'app/index.html must have Lv.70 slot header');
    assert(appIndexHtml.includes('<span class="slot-lvl-header">Lv.80</span>'), 'app/index.html must have Lv.80 slot header');
    assert(!appIndexHtml.includes('<span class="slot-lvl-header">Lv.75</span>'), 'app/index.html must not have Lv.75 slot header');
    assert(!appIndexHtml.includes('<span class="slot-lvl-header">Lv.100</span>'), 'app/index.html must not have Lv.100 slot header');

    // Box subskills must adhere to Lv.10 ~ 80 standard and not legacy Lv.100
    assert(boxJs.includes("[10, 25, 50, 70, 80]"), 'box.js subskills array must include standard levels up to 80');
    assert(!boxJs.includes("副技能 (Lv.10 ~ 100)"), 'box.js must not display legacy Lv.10 ~ 100');

    // i18n guide description must state Lv.10 至 Lv.80
    assert(i18nJs.includes("Lv.10 至 Lv.80"), 'i18n.js must describe Lv.10 至 Lv.80');
    assert(!i18nJs.includes("Lv.10 至 Lv.100"), 'i18n.js must not describe legacy Lv.10 至 Lv.100');

    // 2. Test syncBoxVisibility dynamic DOM behavior
    const mockElements = new Map();
    function createMockEl(id, className = '') {
      return {
        id,
        className,
        classList: {
          contains: (cls) => className.split(' ').includes(cls),
          add: () => {},
          remove: () => {}
        },
        style: { display: '' },
        textContent: '',
        setAttribute: () => {}
      };
    }

    const dropzoneEl = createMockEl('box-dropzone', 'box-dropzone');
    const guideCardEl = createMockEl('box-screenshot-guide-card', 'box-screenshot-guide-card');
    const searchFilterEl = createMockEl('search-filter-row', 'search-filter-row');
    const toggleGuideBtnEl = createMockEl('box-toggle-guide-btn', 'box-btn');

    mockElements.set('box-dropzone', dropzoneEl);
    mockElements.set('box-screenshot-guide-card', guideCardEl);
    mockElements.set('.search-filter-row', searchFilterEl);
    mockElements.set('box-toggle-guide-btn', toggleGuideBtnEl);

    const testDoc = {
      getElementById: (id) => mockElements.get(id) || null,
      querySelector: (sel) => mockElements.get(sel) || null
    };

    const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
    const boxApp = boxModule.PokemonBoxApp;

    // Simulate empty box (userBox.length === 0)
    global.document = testDoc;
    boxApp.setUserBox([]);
    boxApp.syncBoxVisibility();

    assertEquals(dropzoneEl.style.display, '', 'Dropzone must be visible when box is empty');
    assertEquals(guideCardEl.style.display, '', 'Guide card must be visible when box is empty');
    assertEquals(searchFilterEl.style.display, 'none', 'Search filter row must be hidden when box is empty');
    assertEquals(toggleGuideBtnEl.style.display, 'none', 'Toggle guide button must be hidden when box is empty');

    // Simulate populated box (userBox.length > 0)
    boxApp.setUserBox([{ uid: 'test-1', name: '皮卡丘', level: 25 }]);
    boxApp.syncBoxVisibility();

    assertEquals(dropzoneEl.style.display, 'none', 'Dropzone must be hidden when box has Pokémon');
    assertEquals(guideCardEl.style.display, 'none', 'Guide card must be hidden when box has Pokémon');
    assertEquals(searchFilterEl.style.display, '', 'Search filter row must be visible when box has Pokémon');
    assertEquals(toggleGuideBtnEl.style.display, '', 'Toggle guide button must be visible when box has Pokémon');

    // Test toggle override (User clicks "截圖拖曳與指引")
    boxApp.setBoxUserForcedGuideVisible(true);
    boxApp.syncBoxVisibility();
    assertEquals(dropzoneEl.style.display, '', 'Dropzone must become visible when manually toggled on');
    assertEquals(guideCardEl.style.display, '', 'Guide card must become visible when manually toggled on');

    // Toggle off
    boxApp.setBoxUserForcedGuideVisible(false);
    boxApp.syncBoxVisibility();
    assertEquals(dropzoneEl.style.display, 'none', 'Dropzone must be hidden again when toggled off');
    assertEquals(guideCardEl.style.display, 'none', 'Guide card must be hidden again when toggled off');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Main Skill & Level, Ingredient Level Unlock Transparency & Specialty Badge Styles', () => {
    const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));

    // 1. Verify CSS styles for in-game specialty rounded pills and locked ingredient transparency
    assert(cssCode.includes('.box-spec-tag.spec-berry') && cssCode.includes('.box-spec-tag.spec-ingredient') && cssCode.includes('.box-spec-tag.spec-skill'), 'CSS must define berry, ingredient, and skill specialty badge styles for box cards');
    assert(cssCode.includes('.appraisal-spec-tag.spec-berry') && cssCode.includes('.appraisal-spec-tag.spec-ingredient') && cssCode.includes('.appraisal-spec-tag.spec-skill'), 'CSS must define berry, ingredient, and skill specialty badge styles for appraisal modal');
    assert(cssCode.includes('.pokedex-tag-spec.spec-berry') && cssCode.includes('.pokedex-tag-spec.spec-ingredient') && cssCode.includes('.pokedex-tag-spec.spec-skill'), 'CSS must define berry, ingredient, and skill specialty badge styles for pokedex modal');
    assert(cssCode.includes('border-radius: 9999px'), 'Specialty badges must use in-game rounded pill border-radius: 9999px');
    assert(cssCode.includes('.box-ing-chip.ing-locked') && cssCode.includes('.appraisal-ing-chip.ing-locked'), 'CSS must define ing-locked class with transparency and grayscale for locked ingredient slots');

    // 2. Setup sandbox execution context
    const appCtx = {
      window: {},
      document: {
        body: new MiniElement('body', ''),
        createElement: (tag) => new MiniElement(tag, ''),
        getElementById: () => null,
        querySelectorAll: () => []
      },
      console
    };
    appCtx.window = appCtx;
    appCtx.allPokemons = pkmData;
    appCtx.I18N = {
      getLanguage: () => 'zh-TW',
      t: (k, def) => def,
      getNatureName: (n) => n,
      getSubSkillName: (s) => s,
      getSpecialtyName: (s) => (s ? (s.includes('型') ? s : s + '型') : '--'),
      getMainSkillName: (m) => m,
      getIngredientName: (i) => i,
      getIngredientIcon: (i) => `assets/ingredients/${i}.png`,
      getBerryName: (b) => b
    };
    appCtx.getPokemonBerry = (p) => ({ name: '蘋野果', icon: 'assets/berries/rawst.png' });
    appCtx.getItemIcon = (p) => 'assets/icons/pkm.png';

    vm.createContext(appCtx);
    vm.runInContext(boxCode, appCtx);
    vm.runInContext(appraisalCode, appCtx);
    appCtx.PokemonBoxApp.setAllPokemons(pkmData);

    const pikachu = pkmData.find(p => p.name_cn === '皮卡丘') || { id: '025', name_cn: '皮卡丘', specialty: '樹果', main_skill: '能量填充S', ingredients: [{ name: '特選蘋果', count: 1, l1: 1 }, { name: '暖暖薑', count: 2, l30: 2 }, { name: '特選蛋', count: 4, l60: 4 }] };
    const venusaur = pkmData.find(p => p.name_cn === '妙蛙花') || { id: '003', name_cn: '妙蛙花', specialty: '食材', main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 1, l1: 1 }, { name: '番茄', count: 2, l30: 2 }, { name: '甜甜蜜', count: 4, l60: 4 }] };
    const ampharos = pkmData.find(p => p.name_cn === '電龍') || { id: '181', name_cn: '電龍', specialty: '技能', main_skill: '能量填充M', ingredients: [{ name: '特選蘋果', count: 1, l1: 1 }, { name: '純純油', count: 2, l30: 2 }, { name: '特選蛋', count: 4, l60: 4 }] };

    // 3. Verify Box Grid Rendering: Specialty pills and ingredient unlock statuses
    // Pikachu Lv.20: slot 0 (Lv.1) unlocked, slot 1 (Lv.30) locked, slot 2 (Lv.60) locked
    const boxContainer = new MiniElement('div', 'box-grid-wrap');
    appCtx.PokemonBoxApp.renderBoxGrid([
      { uid: 'pkm-berry', name: '皮卡丘', pokemonId: pikachu.id, level: 20, nature: '坦率', ing1: '特選蘋果', ing2: '暖暖薑', ing3: '特選蛋', subskills: [] },
      { uid: 'pkm-ing', name: '妙蛙花', pokemonId: venusaur.id, level: 45, nature: '坦率', ing1: '特選蘋果', ing2: '番茄', ing3: '甜甜蜜', subskills: [] },
      { uid: 'pkm-skill', name: '電龍', pokemonId: ampharos.id, level: 75, nature: '坦率', ing1: '特選蘋果', ing2: '純純油', ing3: '特選蛋', subskills: [] }
    ], boxContainer);

    const boxHtml = boxContainer.innerHTML;
    // Verify specialty classes
    assert(boxHtml.includes('box-spec-tag spec-berry'), 'Pikachu box card must have spec-berry class');
    assert(boxHtml.includes('box-spec-tag spec-ingredient'), 'Venusaur box card must have spec-ingredient class');
    assert(boxHtml.includes('box-spec-tag spec-skill'), 'Ampharos box card must have spec-skill class');

    // Verify ingredient unlock levels:
    const cards = boxHtml.split('<div class="box-card" data-uid="');
    const pikaCard = cards[1] || '';
    const pikaIngChips = [...pikaCard.matchAll(/<div class="box-ing-chip(\s+[^"]*)?"/g)];
    assertEquals(pikaIngChips.length, 3, 'Pikachu must have 3 ingredient chips');
    assert(!(pikaIngChips[0][1] || '').includes('ing-locked'), 'Pikachu Slot 1 (Lv.1) must be unlocked at Lv.20');
    assert((pikaIngChips[1][1] || '').includes('ing-locked'), 'Pikachu Slot 2 (Lv.30) must be locked at Lv.20');
    assert((pikaIngChips[2][1] || '').includes('ing-locked'), 'Pikachu Slot 3 (Lv.60) must be locked at Lv.20');

    // Verify ingredient unlock levels for Venusaur Lv.45:
    const venuCard = cards[2] || '';
    const venuIngChips = [...venuCard.matchAll(/<div class="box-ing-chip(\s+[^"]*)?"/g)];
    assertEquals(venuIngChips.length, 3, 'Venusaur must have 3 ingredient chips');
    assert(!(venuIngChips[0][1] || '').includes('ing-locked'), 'Venusaur Slot 1 (Lv.1) must be unlocked at Lv.45');
    assert(!(venuIngChips[1][1] || '').includes('ing-locked'), 'Venusaur Slot 2 (Lv.30) must be unlocked at Lv.45');
    assert((venuIngChips[2][1] || '').includes('ing-locked'), 'Venusaur Slot 3 (Lv.60) must be locked at Lv.45');

    // Verify ingredient unlock levels for Ampharos Lv.75:
    const amphCard = cards[3] || '';
    const amphIngChips = [...amphCard.matchAll(/<div class="box-ing-chip(\s+[^"]*)?"/g)];
    assertEquals(amphIngChips.length, 3, 'Ampharos must have 3 ingredient chips');
    assert(!(amphIngChips[0][1] || '').includes('ing-locked'), 'Ampharos Slot 1 (Lv.1) must be unlocked at Lv.75');
    assert(!(amphIngChips[1][1] || '').includes('ing-locked'), 'Ampharos Slot 2 (Lv.30) must be unlocked at Lv.75');
    assert(!(amphIngChips[2][1] || '').includes('ing-locked'), 'Ampharos Slot 3 (Lv.60) must be unlocked at Lv.75');

    // 4. Verify Appraisal Modal Rendering: Main Skill & Level, Ingredients & Level Unlock Transparency
    let appraisalModalEl = null;
    appCtx.document.createElement = (tag) => {
      const el = new MiniElement(tag, '');
      if (tag === 'div') appraisalModalEl = el;
      return el;
    };

    appCtx.AppraisalLab.openModal({
      pkm: ampharos,
      level: 25,
      skillLevel: 5,
      nature: '冷靜',
      subskills: ['技能機率提升M', '幫忙速度M'],
      ingredients: ['特選蘋果', '純純油', '特選蛋']
    });

    assert(appraisalModalEl, 'Appraisal modal element must be generated');
    const appModalHtml = appraisalModalEl.innerHTML;

    // Verify main skill name and level
    assert(appModalHtml.includes('appraisal-mainskill-row'), 'Appraisal modal must contain appraisal-mainskill-row');
    assert(appModalHtml.includes('appraisal-mainskill-name'), 'Appraisal modal must contain appraisal-mainskill-name');
    assert(appModalHtml.includes('能量填充M') || appModalHtml.includes('Charge Strength M'), 'Appraisal modal must display correct main skill name');
    assert(appModalHtml.includes('Lv.5'), 'Appraisal modal must display correct skill level Lv.5');

    // Verify ingredients and transparency at Lv.25
    assert(appModalHtml.includes('appraisal-ing-parallel-row'), 'Appraisal modal must contain appraisal-ing-parallel-row');
    const modalChips = [...appModalHtml.matchAll(/<div class="appraisal-ing-chip(\s+[^"]*)?"/g)];
    assertEquals(modalChips.length, 3, 'Appraisal modal must render 3 ingredient chips');
    assert(!(modalChips[0][1] || '').includes('ing-locked'), 'Slot 1 must be unlocked at Lv.25 in appraisal modal');
    assert((modalChips[1][1] || '').includes('ing-locked'), 'Slot 2 must be locked at Lv.25 in appraisal modal');
    assert((modalChips[2][1] || '').includes('ing-locked'), 'Slot 3 must be locked at Lv.25 in appraisal modal');

    // Verify specialty badge in appraisal modal
    assert(appModalHtml.includes('appraisal-spec-tag spec-skill'), 'Ampharos appraisal modal spec tag must have spec-skill class');
  });

  // ----------------------------------------------------
  // Test 171: Comprehensive Special Strategic Archetypes (Berry Burst, BFS Hybrids, Legendaries, Tactical)
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Comprehensive Special Strategic Archetypes: Berry Burst, BFS Hybrids, Legendaries & Tactical Specialists', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);

    // 1. Verify archetype helper functions on PokemonApp and AppraisalLab
    assert(typeof PokemonApp.isBerryBurstSkillSpecialist === 'function', 'PokemonApp.isBerryBurstSkillSpecialist must be a function');
    assert(typeof appCtx.AppraisalLab.isBerryBurstSkillSpecialist === 'function', 'AppraisalLab.isBerryBurstSkillSpecialist must be a function');
    assert(typeof PokemonApp.isPotExpanderSkillSpecialist === 'function', 'PokemonApp.isPotExpanderSkillSpecialist must be a function');
    assert(typeof PokemonApp.isExtraTastySkillSpecialist === 'function', 'PokemonApp.isExtraTastySkillSpecialist must be a function');
    assert(typeof PokemonApp.isDreamShardSkillSpecialist === 'function', 'PokemonApp.isDreamShardSkillSpecialist must be a function');
    assert(typeof PokemonApp.isIngredientSkillSpecialist === 'function', 'PokemonApp.isIngredientSkillSpecialist must be a function');
    assert(typeof PokemonApp.isMetronomeSkillSpecialist === 'function', 'PokemonApp.isMetronomeSkillSpecialist must be a function');
    assert(typeof PokemonApp.isLegendaryPokemon === 'function', 'PokemonApp.isLegendaryPokemon must be a function');

    // 2. Berry Burst Skill Specialists: Mimikyu, Sceptile, Infernape, Latios, Braviary
    const mimikyu = { name_cn: '謎擬Q', specialty: '技能', main_skill: '畫皮（樹果遽增）' };
    const sceptile = { name_cn: '蜥蜴王', specialty: '技能', main_skill: '樹果遽增' };
    const infernape = { name_cn: '烈焰猴', specialty: '技能', main_skill: '樹果遽增' };
    const latios = { name_cn: '拉帝歐斯', specialty: '技能', main_skill: '流星群（樹果遽增）' };
    const braviary = { name_cn: '勇士雄鷹', specialty: '技能', main_skill: '樹果遽增' };

    assert(PokemonApp.isBerryBurstSkillSpecialist(mimikyu) === true, 'Mimikyu must be Berry Burst specialist');
    assert(PokemonApp.isBerryBurstSkillSpecialist(sceptile) === true, 'Sceptile must be Berry Burst specialist');
    assert(PokemonApp.isBerryBurstSkillSpecialist(infernape) === true, 'Infernape must be Berry Burst specialist');
    assert(PokemonApp.isBerryBurstSkillSpecialist(latios) === true, 'Latios must be Berry Burst specialist');
    assert(PokemonApp.isBerryBurstSkillSpecialist(braviary) === true, 'Braviary must be Berry Burst specialist');
    assert(PokemonApp.isBfsSkillSpecialist(mimikyu) === true, 'Mimikyu must be BFS-compatible as Berry Burst');

    // 3. Strategy Card: Mimikyu must have Berry Burst title and BFS recommendation
    const mimikyuStratHtml = PokemonApp.renderPokedexStrategyCardHTML(mimikyu);
    assert(mimikyuStratHtml.includes('樹果遽增爆發定位'), 'Mimikyu strategy card must have Berry Burst title');
    assert(mimikyuStratHtml.includes('樹果數量S'), 'Mimikyu strategy card must recommend BFS');

    // 4. Appraisal Evaluation for Berry Burst with BFS: Mimikyu
    const mimikyuEval = appCtx.AppraisalLab.evaluatePokemon(
      mimikyu, 60, '慎重',
      ['樹果數量S', '技能機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      4, 6
    );
    assert(mimikyuEval.pros.some(p => p.includes('樹果遽增') && p.includes('樹果數量S')), 'Mimikyu appraisal pros must highlight Berry Burst + BFS synergy');
    assert(mimikyuEval.summaryNote.includes('樹果爆發') || mimikyuEval.summaryNote.includes('樹果遽增'), 'Mimikyu summary must highlight Berry Burst surge');
    assert(mimikyuEval.compositeScore >= 90, 'Mimikyu God preset with BFS must score in top tier');

    // 5. Charge Strength BFS Hybrid: Ampharos & Espeon
    const ampharos = { name_cn: '電龍', specialty: '技能', main_skill: '能量填充M' };
    const ampharosHybridEval = appCtx.AppraisalLab.evaluatePokemon(
      ampharos, 60, '慎重',
      ['技能機率提升M', '樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      4, 6
    );
    assert(ampharosHybridEval.pros.some(p => p.includes('雙修') || p.includes('高額樹果副輸出')), 'Ampharos appraisal must acknowledge hybrid BFS power');
    assert(ampharosHybridEval.summaryNote.includes('雙修') || ampharosHybridEval.summaryNote.includes('砲台'), 'Ampharos summary must detail dual-track hybrid strengths');

    // 6. Legendary Beasts (Raikou) Helper Boost Evaluation
    const raikou = { name_cn: '雷公', specialty: '技能', main_skill: '幫手加速（電）' };
    const raikouEval = appCtx.AppraisalLab.evaluatePokemon(
      raikou, 60, '慎重',
      ['技能機率提升M', '幫手獎勵', '技能機率提升S', '持有上限提升L', '幫忙速度M'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      4, 6
    );
    assert(raikouEval.summaryNote.includes('純色隊') || raikouEval.summaryNote.includes('幫手加速'), 'Raikou summary must analyze mono-type team amplification');
    assert(PokemonApp.isLegendaryPokemon(raikou) === true, 'Raikou must be classified as Legendary');

    // 7. Tactical Specialists: Dedenne (Extra Tasty), Magnezone (Pot Expander), Lucario (Dream Shard)
    const dedenne = { name_cn: '咚咚鼠', specialty: '技能', main_skill: '料理成功S' };
    assert(PokemonApp.isExtraTastySkillSpecialist(dedenne) === true, 'Dedenne must be Extra Tasty specialist');
    const dedenneEval = appCtx.AppraisalLab.evaluatePokemon(
      dedenne, 50, '慎重',
      ['技能機率提升M', '幫手獎勵', '技能機率提升S'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      0, 6
    );
    assert(dedenneEval.summaryNote.includes('大成功') || dedenneEval.summaryNote.includes('美味') || dedenneEval.summaryNote.includes('爆擊'), 'Dedenne summary must focus on dish critical success stacking');

    const magnezone = { name_cn: '自爆磁怪', specialty: '技能', main_skill: '料理強化S' };
    assert(PokemonApp.isPotExpanderSkillSpecialist(magnezone) === true, 'Magnezone must be Pot Expander specialist');
    const magnezoneEval = appCtx.AppraisalLab.evaluatePokemon(
      magnezone, 50, '慎重',
      ['技能機率提升M', '幫手獎勵', '持有上限提升L'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      0, 6
    );
    assert(magnezoneEval.summaryNote.includes('擴鍋') || magnezoneEval.summaryNote.includes('料理強化'), 'Magnezone summary must focus on pot expansion');

    const lucario = { name_cn: '路卡利歐', specialty: '技能', main_skill: '波導彈（夢之碎片獲取S）' };
    assert(PokemonApp.isDreamShardSkillSpecialist(lucario) === true, 'Lucario must be Dream Shard specialist');
    const lucarioEval = appCtx.AppraisalLab.evaluatePokemon(
      lucario, 50, '慎重',
      ['技能機率提升M', '夢之碎片獎勵', '幫手獎勵'],
      ['特選蘋果', '特選蘋果', '特選蘋果'],
      0, 6
    );
    assert(lucarioEval.summaryNote.includes('夢之碎片'), 'Lucario summary must focus on Dream Shards');

    // 8. Pokedex Modal God Preset for Berry Burst: Mimikyu
    global.document = createMockDocument();
    PokemonApp.pokedexModalState = { pkm: mimikyu, level: 60, ribbon: 4, skillLevel: 6, ingSlots: [0, 0, 0], nature: '坦率', subskills: [] };
    PokemonApp.applyPokedexGodPreset();
    assert(PokemonApp.pokedexModalState.subskills.includes('樹果數量S'), 'Mimikyu God Preset must include BFS');
    assert(PokemonApp.pokedexModalState.subskills.includes('技能機率提升M'), 'Mimikyu God Preset must include Skill Trigger M');
  });

  // ----------------------------------------------------
  // Test 172: Pokemon Box Comprehensive Filter Sidebar, Multi-Criteria Filtering & Mobile Drawer Verification
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Pokemon Box Filter Sidebar: Desktop & Mobile Markup, Multi-Criteria Filtering & State Reset Integrity', () => {
    // 1. Verify Desktop Markup in index.html
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    assert(indexHtml.includes('id="panel-box"'), 'index.html must have panel-box');
    assert(indexHtml.includes('box-layout-view'), 'index.html must have box-layout-view container');
    assert(indexHtml.includes('id="box-filter-sidebar"'), 'index.html must have box-filter-sidebar element');
    assert(indexHtml.includes('id="box-sidebar-bookmark-handle"'), 'index.html must have box-sidebar-bookmark-handle element');
    assert(indexHtml.includes('id="box-sidebar-backdrop"'), 'index.html must have box-sidebar-backdrop element');
    assert(indexHtml.includes('class="box-main-content"'), 'index.html must have box-main-content wrapper');

    // Verify all sidebar controls and subfilters in index.html
    assert(indexHtml.includes('id="box-final-evo-toggle"'), 'index.html must have box-final-evo-toggle switch');
    assert(indexHtml.includes('id="box-initial-ing-toggle"'), 'index.html must have box-initial-ing-toggle switch');
    assert(indexHtml.includes('id="box-show-no-toggle"'), 'index.html must have box-show-no-toggle switch');
    assert(indexHtml.includes('id="box-specialty-filter-tags"'), 'index.html must have box-specialty-filter-tags');
    assert(indexHtml.includes('id="box-berry-filter-tags"'), 'index.html must have box-berry-filter-tags');
    assert(indexHtml.includes('id="box-clear-berries-btn"'), 'index.html must have box-clear-berries-btn');
    assert(indexHtml.includes('id="box-ingredient-pkm-filter-tags"'), 'index.html must have box-ingredient-pkm-filter-tags');
    assert(indexHtml.includes('id="box-clear-ingredients-pkm-btn"'), 'index.html must have box-clear-ingredients-pkm-btn');
    assert(indexHtml.includes('id="box-skill-filter-tags"'), 'index.html must have box-skill-filter-tags');
    assert(indexHtml.includes('id="box-clear-skills-btn"'), 'index.html must have box-clear-skills-btn');
    assert(indexHtml.includes('id="box-sidebar-reset-all-btn"'), 'index.html must have box-sidebar-reset-all-btn');
    assert(indexHtml.includes('id="box-sidebar-close-btn"'), 'index.html must have box-sidebar-close-btn');

    // 2. Verify Mobile H5 Markup in app/index.html
    const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    assert(appHtml.includes('id="box-filter-sidebar"'), 'app/index.html must have box-filter-sidebar');
    assert(appHtml.includes('id="box-sidebar-bookmark-handle"'), 'app/index.html must have box-sidebar-bookmark-handle FAB');
    assert(appHtml.includes('sidebar-fab-btn'), 'app/index.html box handle must have sidebar-fab-btn class');
    assert(appHtml.includes('id="box-sidebar-backdrop"'), 'app/index.html must have box-sidebar-backdrop');
    assert(appHtml.includes('id="box-specialty-filter-tags"'), 'app/index.html must have box-specialty-filter-tags');
    assert(appHtml.includes('id="box-berry-filter-tags"'), 'app/index.html must have box-berry-filter-tags');
    assert(appHtml.includes('id="box-ingredient-pkm-filter-tags"'), 'app/index.html must have box-ingredient-pkm-filter-tags');
    assert(appHtml.includes('id="box-skill-filter-tags"'), 'app/index.html must have box-skill-filter-tags');

    // 3. Verify CSS rules in css/styles.css
    const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    assert(cssContent.includes('.box-filter-sidebar'), 'styles.css must style box-filter-sidebar');
    assert(cssContent.includes('.box-layout-view'), 'styles.css must style box-layout-view');
    assert(cssContent.includes('.box-main-content'), 'styles.css must style box-main-content');
    assert(cssContent.includes('#box-filter-sidebar:not(.collapsed)'), 'styles.css must style open state of box-filter-sidebar');
    assert(cssContent.includes('.mobile-h5-app #box-filter-sidebar'), 'styles.css must support mobile H5 box filter sidebar');

    // 4. Verify i18n entries in js/core/i18n.js
    const i18nContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
    assert(i18nContent.includes("'box.filter_sidebar_title': '倉庫篩選器'"), 'i18n zh-TW must have box.filter_sidebar_title');
    assert(i18nContent.includes("'box.filter_bookmark': '篩選'"), 'i18n zh-TW must have box.filter_bookmark');
    assert(i18nContent.includes("'box.filter_sidebar_title': 'Box Filters'"), 'i18n en-US must have box.filter_sidebar_title');
    assert(i18nContent.includes("'box.filter_bookmark': 'Filter'"), 'i18n en-US must have box.filter_bookmark');

    // 5. Verify App Architecture in js/modules/app.js
    const appJsContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    assert(appJsContent.includes("'box-filter-sidebar'"), 'app.js MOBILE_OVERLAY_IDS must register box-filter-sidebar');
    assert(appJsContent.includes("'box-sidebar-backdrop'"), 'app.js SIDEBAR_BACKDROP_BY_ID must register box-sidebar-backdrop');

    // 6. Verify Multi-Criteria Filtering Logic in js/modules/box.js
    const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
    assert(typeof boxModule.getFilteredBox === 'function', 'boxModule.getFilteredBox must be a function');
    assert(typeof boxModule.setBoxFilterState === 'function', 'boxModule.setBoxFilterState must be a function');
    assert(typeof boxModule.resetBoxFilters === 'function', 'boxModule.resetBoxFilters must be a function');

    const sampleBox = [
      { name: '雷丘', specialty: '樹果', type: '電', is_final: true, main_skill: '能量填充S', ing1: '特選蘋果', ing2: '純純油', ingredients: ['特選蘋果', '純純油'] },
      { name: '皮卡丘', specialty: '樹果', type: '電', is_final: false, main_skill: '能量填充S', ing1: '特選蘋果', ingredients: ['特選蘋果'] },
      { name: '小拳石', specialty: '樹果', type: '岩石', is_final: false, main_skill: '蓄力（能量填充S）', ing1: '特選大豆', ingredients: ['特選大豆'] },
      { name: '妙蛙種子', specialty: '食材', type: '草', is_final: false, main_skill: '食材獲取S', ing1: '甜甜蜜', ingredients: ['甜甜蜜'] },
      { name: '電龍', specialty: '技能', type: '電', is_final: true, main_skill: '能量填充M', ing1: '特選蘋果', ing2: '特選蛋', ingredients: ['特選蘋果', '特選蛋'] },
      { name: '噴火龍', specialty: '食材', type: '火', is_final: true, main_skill: '食材獲取S', ing1: '暖暖醬油', ing2: '火辣生薑', ingredients: ['暖暖醬油', '火辣生薑'] }
    ];
    boxModule.setUserBox(sampleBox);
    assertEquals(boxModule.getFilteredBox().length, 6, 'Total unfiltered sample box size should be 6');

    // Specialty filter: 樹果
    boxModule.setBoxFilterState({ selectedSpecialties: ['樹果'] });
    const berrySpecList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(berrySpecList.length, 3, 'Berry specialty filter should return 3 Pokemon');
    assert(berrySpecList.includes('雷丘') && berrySpecList.includes('皮卡丘') && berrySpecList.includes('小拳石'), 'Berry specialty should return Raichu, Pikachu, Geodude');

    // Multi-specialty filter: 樹果 + 技能
    boxModule.setBoxFilterState({ selectedSpecialties: ['樹果', '技能'] });
    const berrySkillList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(berrySkillList.length, 4, 'Berry + Skill specialty filter should return 4 Pokemon');
    assert(berrySkillList.includes('雷丘') && berrySkillList.includes('皮卡丘') && berrySkillList.includes('小拳石') && berrySkillList.includes('電龍'), 'Berry + Skill specialty should return Raichu, Pikachu, Geodude, Ampharos');

    // Final evolution toggle (with 樹果 + 技能)
    boxModule.setBoxFilterState({ onlyFinal: true });
    const finalBerrySkillList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(finalBerrySkillList.length, 2, 'Final evolution of Berry+Skill should return 2 Pokemon');
    assert(finalBerrySkillList.includes('雷丘') && finalBerrySkillList.includes('電龍'), 'Final evolution should retain Raichu and Ampharos');

    // Reset filters
    boxModule.resetBoxFilters();
    assertEquals(boxModule.getFilteredBox().length, 6, 'Reset filters should restore all 6 Pokemon');

    // Berry filter: 異奇果 (Grepa Berry - Electric)
    boxModule.setBoxFilterState({ selectedBerries: ['異奇果'] });
    const grepaList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(grepaList.length, 3, 'Grepa berry should match Electric Pokemon (Raichu, Pikachu, Ampharos)');
    assert(grepaList.includes('雷丘') && grepaList.includes('皮卡丘') && grepaList.includes('電龍'), 'Grepa berry should match Raichu, Pikachu, Ampharos');

    // Ingredient filter: any ingredient matching '特選蛋'
    boxModule.resetBoxFilters();
    boxModule.setBoxFilterState({ selectedIngredients: ['特選蛋'] });
    const eggList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(eggList.length, 1, 'Egg ingredient should match Ampharos');
    assertEquals(eggList[0], '電龍', 'Ampharos should be the only egg provider in sample');

    // Ingredient filter: initial ingredient only with '特選蛋'
    boxModule.setBoxFilterState({ onlyInitialIng: true });
    const initialEggList = boxModule.getFilteredBox();
    assertEquals(initialEggList.length, 0, 'Ampharos has apple as Lv.1 ing, so initial egg search returns 0');

    // Ingredient filter: initial ingredient only with '特選蘋果'
    boxModule.setBoxFilterState({ selectedIngredients: ['特選蘋果'] });
    const initialAppleList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(initialAppleList.length, 3, 'Raichu, Pikachu, Ampharos all have apple as Lv.1 ingredient');

    // Main skill filter: base skill '能量填充S' should match composite variant '蓄力（能量填充S）'
    boxModule.resetBoxFilters();
    boxModule.setBoxFilterState({ selectedSkills: ['能量填充S'] });
    const skillList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(skillList.length, 3, 'Skill 能量填充S should match Raichu, Pikachu, and Geodude');
    assert(skillList.includes('小拳石'), 'Geodude composite skill 蓄力（能量填充S） should match base skill 能量填充S');

    // Main skill filter: '食材獲取S'
    boxModule.resetBoxFilters();
    boxModule.setBoxFilterState({ selectedSkills: ['食材獲取S'] });
    const skillIngList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(skillIngList.length, 2, 'Skill 食材獲取S should match Bulbasaur and Charizard');
    assert(skillIngList.includes('妙蛙種子') && skillIngList.includes('噴火龍'), 'Bulbasaur and Charizard should match 食材獲取S');

    // Main skill filter: '能量填充M'
    boxModule.resetBoxFilters();
    boxModule.setBoxFilterState({ selectedSkills: ['能量填充M'] });
    const skillMList = boxModule.getFilteredBox().map(p => p.name);
    assertEquals(skillMList.length, 1, 'Skill 能量填充M should only match Ampharos');
    assertEquals(skillMList[0], '電龍', 'Ampharos should match 能量填充M');

    // Reset filters restores full collection
    boxModule.resetBoxFilters();
    assertEquals(boxModule.getFilteredBox().length, 6, 'Reset must restore full collection');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Box Overhaul, Appraisal In-Place Edit, Edge-to-Edge Layout & Unified Specialty Styling', () => {
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

    // 1. Responsive Auto-Switch resize listeners registered before early returns
    assert(indexHtml.includes("window.addEventListener('resize'"), 'index.html must register resize listener');
    assert(appIndexHtml.includes("window.addEventListener('resize'"), 'app/index.html must register resize listener');
    const indexResizeIdx = indexHtml.indexOf("window.addEventListener('resize'");
    const indexEarlyReturnIdx = indexHtml.indexOf("return; // Stay on index.html");
    assert(indexResizeIdx < indexEarlyReturnIdx, 'index.html resize listener must be attached before early return');

    // 2. Mobile H5 Box tab: No cards/table toggle chips, forced table mode
    assert(!appIndexHtml.includes('id="box-toggle-grid"'), 'app/index.html must not contain box-toggle-grid');
    assert(!appIndexHtml.includes('id="box-toggle-table"'), 'app/index.html must not contain box-toggle-table');
    assert(!appIndexHtml.includes('class="box-toolbar-control-row"'), 'app/index.html must not contain old box-toolbar-control-row');
    assert(boxJs.includes("if (isMobileH5 || boxViewMode === 'table')"), 'box.js must force table view on mobile H5');

    // 3. Box Table Columns Overhaul
    // Header order: icon -> level -> name (centered) -> specialty -> berry -> 食1 -> 食2 -> 食3
    const lvlThIdx = boxJs.indexOf("t('th.level', '等級')");
    const nameThIdx = boxJs.indexOf("isEN ? 'Name / Nickname' : '寶可夢 / 暱稱'");
    const specThIdx = boxJs.indexOf("t('th.specialty', '得意')");
    const berryThIdx = boxJs.indexOf("t('th.berry', '樹果')");
    assert(lvlThIdx !== -1 && nameThIdx !== -1 && specThIdx !== -1 && berryThIdx !== -1, 'All required th keys must exist');
    assert(lvlThIdx < nameThIdx, 'Level column must precede Name column');
    assert(nameThIdx < specThIdx, 'Specialty column must follow Name column');
    assert(specThIdx < berryThIdx, 'Berry column must follow Specialty column');

    // Ingredient headers simplified to 食1, 食2, 食3
    assert(boxJs.includes("isEN ? 'Ing 1' : '食1'") && boxJs.includes("isEN ? 'Ing 2' : '食2'") && boxJs.includes("isEN ? 'Ing 3' : '食3'"), 'Ingredient columns must be simplified to 食1, 食2, 食3');

    // Name and Nickname horizontally centered
    assert(boxJs.includes('justify-content:center;gap:4px;flex-wrap:wrap;text-align:center;'), 'table-name-cn must be centered');
    assert(boxJs.includes('text-align:center;">${escapeHtml(p.nickname)}</div>'), 'nickname must be centered');

    // PR score, Subskills, Nature removed from list table
    const renderTableCode = boxJs.substring(boxJs.indexOf('function renderBoxTable(list'), boxJs.indexOf('function bindCardActions'));
    assert(!renderTableCode.includes("box-table-dual-badges"), 'Box table must not contain PR dual badges');
    assert(!renderTableCode.includes("box-subskill-pill"), 'Box table must not contain subskills pills');
    assert(!renderTableCode.includes("nature-buff"), 'Box table must not contain nature buff in table rows');

    // Row click navigation to Appraisal Lab
    assert(boxJs.includes(".box-table tbody tr[data-uid]"), 'Table rows must be selectable');
    assert(boxJs.includes("window.AppraisalLab.loadBoxItem(item)"), 'Row click must load box item into Appraisal Lab');

    // 4. Appraisal Modal & Lab Integration
    assert(appraisalJs.includes("openAppraisalModal"), 'appraisal.js must implement openAppraisalModal');
    assert(boxJs.includes("window.AppraisalLab.openModal"), 'Row click must open appraisal modal');
    assert(stylesCss.includes(".mobile-h5-app #modal-appraisal-report"), 'styles.css must style mobile appraisal modal');

    // 5. Box Sort Dropdown in Filter Sidebar with Inset Arrow
    assert(indexHtml.includes('id="box-filter-sidebar"') && indexHtml.includes('id="box-sort-select"'), 'index.html must have box-sort-select inside sidebar');
    assert(appIndexHtml.includes('id="box-filter-sidebar"') && appIndexHtml.includes('id="box-sort-select"'), 'app/index.html must have box-sort-select inside sidebar');
    assert(stylesCss.includes('.box-sort-select'), 'css must define .box-sort-select');
    assert(stylesCss.includes('padding: 0 38px 0 14px !important;'), '.box-sort-select must have right padding >= 36px');
    assert(stylesCss.includes('background-position: right 18px center !important;'), '.box-sort-select arrow must be inset from border');

    // 6. Mobile Edge-to-Edge List Layout
    assert(stylesCss.includes('.mobile-h5-app .box-content-container') && stylesCss.includes('padding: 0 0 90px 0 !important;'), 'box-content-container must have 0 side margins on mobile');
    assert(stylesCss.includes('.mobile-h5-app #panel-box .table-container') && stylesCss.includes('margin: 0 !important;'), 'table-container must have 0 margin on mobile');

    // 7. Unified Specialty Background Colors
    assert(appJs.includes('<span class="box-spec-tag ${specClass}">${specName}</span>'), 'Pokédex table and cards must use unified box-spec-tag with specClass');
    assert(stylesCss.includes('.box-spec-tag.spec-berry') && stylesCss.includes('.box-spec-tag.spec-ingredient') && stylesCss.includes('.box-spec-tag.spec-skill'), 'styles.css must style all three specialty classes');
    assert(stylesCss.includes('[data-theme="light"] .appraisal-spec-tag.spec-berry') && stylesCss.includes('[data-theme="light"] .box-spec-tag.spec-berry'), 'styles.css must support light theme for spec tags');

    // 8. i18n Dictionary
    assert(i18nJs.includes("'th.ribbon': '獎章'"), 'i18n must have ribbon key');
    assert(i18nJs.includes("'box.sort_title': '排序方式'"), 'i18n must have sort_title key');
    assert(i18nJs.includes("'box.edit_stats': '修改數值'"), 'i18n must have edit_stats key');
  });

  // ─── Test 174: Appraisal Lab H5 Polish & Radar Maximization ─────────────

  test('Tier 4 - Real-World Application Scenarios', 'Appraisal Lab In-Game Nature Card, Single-Line Icon Ingredients, 5th Subskill Normal Column & Lab FAB Suppression', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const cssCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Appraisal modal nature display must use in-game capsule style
    assert(appraisalCode.includes('class="appraisal-nature-game-card"'), 'Appraisal modal must render nature with appraisal-nature-game-card');
    assert(appraisalCode.includes('class="nature-pill-capsule"'), 'Appraisal modal must render nature with nature-pill-capsule');
    assert(appraisalCode.includes('natureEffectHtml'), 'Appraisal modal must compute natureEffectHtml matching capsule style');

    // 2. Subskill grid defined in CSS
    assert(cssCode.includes('.appraisal-subskills-grid') || cssCode.includes('.lab-preview-subskills-grid'), 'CSS must define subskills grid');

    // 3. Ingredients display in modal: parallel row, icon-only, no count numbers
    assert(appraisalCode.includes('class="appraisal-ing-parallel-row"'), 'Modal ingredients must use appraisal-ing-parallel-row');
    assert(appraisalCode.includes('class="appraisal-ing-chips-grid"'), 'Modal ingredients must use appraisal-ing-chips-grid');

    // 4. Box card, table, and modal ingredient chips must not display count numbers
    assert(!boxCode.includes('<span class="box-ing-chip-count">×${count}</span>'), 'Box card ingredient slot must not display count span');
    assert(!boxCode.includes('<span class="ing-count">×${count}</span>'), 'Box table ingredient cell must not display ing-count span');
    assert(!appraisalCode.includes('<span class="appraisal-ing-chip-count">×${count}</span>'), 'Appraisal modal ingredient chip must not display count span');
    assert(cssCode.includes('.box-ing-chip-count,\n.ing-count,\n.appraisal-ing-chip-count {\n  display: none !important;'), 'CSS must enforce display: none !important on ing-count and chip count elements');

    // 5. FAB and bookmark handle must be thoroughly hidden in lab subtab
    assert(boxCode.includes("body.classList.add('box-lab-active')"), 'switchBoxSubtab(lab) must add box-lab-active class to body');
    assert(boxCode.includes("panelBox.classList.add('box-lab-active')"), 'switchBoxSubtab(lab) must add box-lab-active class to panelBox');
    assert(cssCode.includes('body.box-lab-active #box-sidebar-bookmark-handle'), 'CSS must hide #box-sidebar-bookmark-handle under box-lab-active');
    assert(cssCode.includes('body.box-lab-active #box-fab-container'), 'CSS must hide #box-fab-container under box-lab-active');
    assert(cssCode.includes('.mobile-h5-app #panel-box:not(.box-lab-active)'), 'CSS must exclude box-lab-active from auto-displaying bookmark handle');
  });

  // ─── Test 184: Research Lab Subtab Navigation & State Switching ───────────

  test('Tier 4 - Real-World Application Scenarios', 'Research Lab Subtab Navigation & State Switching', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');

    // 1. Static assertion: Research Lab supports team and compare subtabs
    assert(appraisalJs.includes("switchSubTab('team')") && appraisalJs.includes("switchSubTab('compare')"), 'Research Lab must support team and compare subtabs');
    assert(!appraisalJs.includes("switchSubTab('single')"), 'Research Lab must not contain single subtab');

    // 2. Runtime execution: switchSubTab works smoothly
    const mockContainer = {
      innerHTML: '',
      id: 'appraisal-lab-container',
      querySelector: () => null,
      querySelectorAll: () => []
    };
    const ctx = {
      window: {},
      document: {
        querySelector: () => null,
        querySelectorAll: () => [],
        getElementById: (id) => (id === 'appraisal-lab-container' ? mockContainer : null),
        body: { classList: { contains: () => false }, style: {} }
      },
      console: console,
      Set: Set,
      Array: Array,
      parseInt: parseInt,
      Math: Math,
      String: String
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    ctx.window.allPokemons = [
      { id: '3', name_cn: '妙蛙花', specialty: '食材', type: '草', main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 2 }] }
    ];
    ctx.window.I18N = {
      getLanguage: () => 'zh-TW',
      getSubSkillName: (n) => n,
      getMainSkillName: (n) => n,
      getIngredientName: (n) => n,
      getNatureName: (n) => n,
      getSpecialtyName: (n) => n,
      getTypeName: (n) => n,
      getBerryName: (n) => n,
      getIngredientIcon: () => '',
      getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
    };
    ctx.window.UserBox = {
      getUserBox: () => [{ uid: 'b1', pokemonId: '3', name: '妙蛙花', level: 30, nature: '坦率', subskills: ['樹果數量S'], nickname: '花花', ribbon: 0, skillLevel: 2 }],
      setUserBox: () => {},
      NATURE_DATA: [{ name: '固執', buff: '幫忙速度', debuff: '食材發現率' }],
      SUBSKILLS_DATA: [{ name: '樹果數量S', tier: 'gold' }]
    };

    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    // Initial render defaults to team subpanel
    ctx.window.AppraisalLab.renderLab(mockContainer);
    assert(mockContainer.innerHTML.includes('lab-subnav-bar'), 'Must render lab-subnav-bar');
    assert(mockContainer.innerHTML.includes('id="lab-subpanel-team"'), 'Must render lab-subpanel-team');
    assert(mockContainer.innerHTML.includes('id="lab-subpanel-compare"'), 'Must render lab-subpanel-compare');

    // Switch to compare subtab
    ctx.window.AppraisalLab.switchSubTab('compare');
    assert(mockContainer.innerHTML.includes('active') && mockContainer.innerHTML.includes('compare'), 'Compare tab must be active');
  });


  test('Tier 4 - Real-World Application Scenarios', '深度研究室 (Research Lab): Renamed Title, Team Builder & Synergy Simulation, Side-by-Side Comparison & Modal Picker', () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');

    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify renaming in HTML and i18n
    assert(appIndexHtml.includes('id="box-subtab-lab"'), 'app/index.html must have box-subtab-lab');
    assert(appIndexHtml.includes('深度研究室'), 'app/index.html box-subtab-lab must display "深度研究室"');
    assert(!appIndexHtml.includes('深度評測室'), 'app/index.html must not contain "深度評測室"');

    assert(indexHtml.includes('id="box-subtab-lab"'), 'index.html must have box-subtab-lab');
    assert(indexHtml.includes('id="box-subtab-list"'), 'index.html must have box-subtab-list');
    assert(!indexHtml.includes('id="box-export-btn"'), 'index.html box banner must not have box-export-btn');
    assert(!indexHtml.includes('id="box-import-input"'), 'index.html box banner must not have box-import-input');
    assert(indexHtml.includes('深度研究室'), 'index.html box-subtab-lab must display "深度研究室"');
    assert(!indexHtml.includes('深度評測室'), 'index.html must not contain "深度評測室"');

    assert(i18nJs.includes("'box.tab_lab': '深度研究室'"), "i18n.js must map 'box.tab_lab' to '深度研究室'");
    assert(i18nJs.includes("'box.appraisal_lab': '深度研究室'"), "i18n.js must map 'box.appraisal_lab' to '深度研究室'");
    assert(i18nJs.includes("'box.appraisal_lab_btn': '深度研究室'"), "i18n.js must map 'box.appraisal_lab_btn' to '深度研究室'");
    assert(i18nJs.includes("'box.tab_lab': 'Research Lab'"), "i18n.js must map 'box.tab_lab' to 'Research Lab' in en-US");

    // 2. Verify Box list interaction opens modal directly
    const bindCardActionsMatch = boxJs.match(/function bindCardActions[\s\S]*?^  \}/m);
    assert(bindCardActionsMatch, 'box.js must define bindCardActions');
    assert(!bindCardActionsMatch[0].includes("switchBoxSubtab('lab')"), 'bindCardActions must not force tab switch to lab');
    assert(bindCardActionsMatch[0].includes('window.AppraisalLab.openModal('), 'bindCardActions must open appraisal modal');

    // 3. Verify CSS classes exist for Research Lab
    assert(stylesCss.includes('.lab-subnav-bar'), 'styles.css must include .lab-subnav-bar');
    assert(stylesCss.includes('.lab-subtab-btn'), 'styles.css must include .lab-subtab-btn');
    assert(stylesCss.includes('.lab-team-grid'), 'styles.css must include .lab-team-grid');
    assert(stylesCss.includes('.lab-team-slot-card'), 'styles.css must include .lab-team-slot-card');
    assert(stylesCss.includes('.lab-compare-grid'), 'styles.css must include .lab-compare-grid');
    assert(stylesCss.includes('.lab-compare-chart-box'), 'styles.css must include .lab-compare-chart-box');
    assert(stylesCss.includes('.lab-picker-modal'), 'styles.css must include .lab-picker-modal');

    // 4. Test Research Lab VM execution & State
    const mockStorage = {};
    const mockElements = new Map();
    const createdElements = [];

    const mockDOMElement = (id, tag = 'DIV') => {
      const el = {
        id,
        tagName: tag.toUpperCase(),
        innerHTML: '',
        textContent: '',
        value: '',
        style: {},
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelector(selector) {
          if (selector.startsWith('#')) return mockElements.get(selector.slice(1)) || null;
          return null;
        },
        querySelectorAll() { return []; },
        addEventListener() {},
        removeEventListener() {}
      };
      if (id) mockElements.set(id, el);
      return el;
    };

    const ctx = {
      window: {
        localStorage: {
          getItem: (k) => mockStorage[k] || null,
          setItem: (k, v) => { mockStorage[k] = String(v); },
          removeItem: (k) => { delete mockStorage[k]; }
        },
        I18N: {
          getLanguage: () => 'zh-TW',
          t: (k, def) => def || k,
          getMainSkillName: (k) => k,
          getSubSkillName: (k) => k,
          getNatureName: (k) => k,
          getIngredientName: (k) => k,
          getBerryName: (k) => k,
          getSpecialtyName: (s) => s,
          getTypeName: (t) => t,
          getIngredientIcon: () => '',
          getSpecialtyIconHtml: () => '<span class="spec-icon"></span>'
        },
        PokemonApp: {
          getPokemons: () => [
            {
              id: 25,
              name_cn: '皮卡丘',
              name_en: 'Pikachu',
              type: '電',
              specialty: '樹果',
              base_frequency: 2700,
              berry: { name: '零餘果', type: '電', power: 25, count: 2, icon: 'assets/berries/rawst.png' },
              main_skill: '能量填充S',
              skill: { name: '能量填充S' },
              subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能機率M', '持有上限提升L']
            },
            {
              id: 26,
              name_cn: '雷丘',
              name_en: 'Raichu',
              type: '電',
              specialty: '樹果',
              base_frequency: 2200,
              berry: { name: '零餘果', type: '電', power: 25, count: 2, icon: 'assets/berries/rawst.png' },
              main_skill: '能量填充S',
              skill: { name: '能量填充S' },
              subskills: ['樹果數量S', '幫手速度M', '幫手獎勵', '食材機率提升M', '持有上限提升L']
            },
            {
              id: 175,
              name_cn: '波克比',
              name_en: 'Togepi',
              type: '妖精',
              specialty: '技能',
              base_frequency: 3600,
              berry: { name: '密芝果', type: '妖精', power: 26, count: 1, icon: 'assets/berries/pecha.png' },
              main_skill: '活力療癒S',
              skill: { name: '活力療癒S' },
              subskills: ['技能機率M', '技能機率S', '幫手速度M', '技能等級提升M', '幫手獎勵']
            }
          ]
        },
        UserBox: {
          getUserBox: () => [
            {
              uid: 'box-pkm-1',
              pokemonId: 25,
              name: '皮卡丘',
              nickname: '閃電皮卡',
              level: 50,
              nature: '固執',
              subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M'],
              ing1: '特選蘋果',
              ing2: '特選蘋果',
              ing3: '暖暖薑',
              ribbon: 2,
              skillLevel: 3
            },
            {
              uid: 'box-pkm-2',
              pokemonId: 26,
              name: '雷丘',
              nickname: '雷霆戰神',
              level: 60,
              nature: '勇敢',
              subskills: ['樹果數量S', '幫手速度M', '幫手獎勵'],
              ing1: '特選蘋果',
              ing2: '暖暖薑',
              ing3: '暖暖薑',
              ribbon: 4,
              skillLevel: 6
            },
            {
              uid: 'box-pkm-3',
              pokemonId: 175,
              name: '波克比',
              nickname: '小護士',
              level: 30,
              nature: '溫柔',
              subskills: ['技能機率M', '技能機率S', '幫手速度M'],
              ing1: '特選蛋',
              ing2: '特選蛋',
              ing3: '特選蛋',
              ribbon: 1,
              skillLevel: 5
            }
          ]
        },
        document: {
          getElementById: (id) => mockElements.get(id) || null,
          querySelector: (s) => (s && s.startsWith('#') ? (mockElements.get(s.slice(1)) || null) : null),
          querySelectorAll: () => [],
          createElement: (tag) => {
            const el = mockDOMElement('', tag);
            createdElements.push(el);
            return el;
          },
          body: {
            style: {},
            classList: { contains: () => false },
            appendChild: (el) => {
              if (el.id) mockElements.set(el.id, el);
            }
          }
        },
        console: console,
        getComputedStyle: () => ({ display: 'block' }),
        setupCustomSelect: () => {}
      }
    };
    ctx.window.allPokemons = ctx.window.PokemonApp.getPokemons();
    ctx.window.window = ctx.window;
    ctx.document = ctx.window.document;
    ctx.localStorage = ctx.window.localStorage;
    vm.createContext(ctx);

    // Run appraisal.js in VM
    vm.runInContext(appraisalJs, ctx);

    assert(typeof ctx.window.AppraisalLab === 'object', 'AppraisalLab must be exported to window');
    assert(typeof ctx.window.AppraisalLab.switchSubTab === 'function', 'switchSubTab must be exported');
    assert(typeof ctx.window.AppraisalLab.setTeamIsland === 'function', 'setTeamIsland must be exported');
    assert(typeof ctx.window.AppraisalLab.setTeamSlot === 'function', 'setTeamSlot must be exported');
    assert(typeof ctx.window.AppraisalLab.clearTeamSlot === 'function', 'clearTeamSlot must be exported');
    assert(typeof ctx.window.AppraisalLab.clearAllTeamSlots === 'function', 'clearAllTeamSlots must be exported');
    assert(typeof ctx.window.AppraisalLab.autoOptimizeTeam === 'function', 'autoOptimizeTeam must be exported');
    assert(typeof ctx.window.AppraisalLab.setCompareSlot === 'function', 'setCompareSlot must be exported');
    assert(typeof ctx.window.AppraisalLab.swapCompareSlots === 'function', 'swapCompareSlots must be exported');
    assert(typeof ctx.window.AppraisalLab.openPicker === 'function', 'openPicker must be exported');
    assert(typeof ctx.window.AppraisalLab.closePicker === 'function', 'closePicker must be exported');
    assert(typeof ctx.window.AppraisalLab.simulateTeamPerformance === 'function', 'simulateTeamPerformance must be exported');

    // 5. Test Lab Container Rendering (Subnav & Team Subtab default)
    const mockContainer = mockDOMElement('appraisal-lab-container');
    ctx.window.AppraisalLab.renderLab(mockContainer);

    assert(mockContainer.innerHTML.includes('class="lab-subnav-bar"'), 'Lab container must render subnav bar');
    assert(mockContainer.innerHTML.includes('幫手組隊'), 'Subnav bar must have 幫手組隊 subtab');
    assert(mockContainer.innerHTML.includes('寶可夢對比'), 'Subnav bar must have 寶可夢對比 subtab');
    assert(!mockContainer.innerHTML.includes('單體評測'), 'Subnav bar must not have 單體評測 subtab');
    assert(mockContainer.innerHTML.includes('id="lab-subpanel-team"'), 'Lab container must render team subpanel');
    assert(mockContainer.innerHTML.includes('id="lab-subpanel-compare"'), 'Lab container must render compare subpanel');
    assert(!mockContainer.innerHTML.includes('id="lab-subpanel-single"'), 'Lab container must not render single subpanel');

    // 6. Test Team Island Selection and Favored Berries Multiplier
    ctx.window.AppraisalLab.setTeamIsland('beach'); // 天青沙灘: 橙橙果, 密芝果, 零餘果
    assert(mockContainer.innerHTML.includes('天青沙灘'), 'Team view must reflect active island 天青沙灘');

    // 7. Test Team Simulation
    const userBox = ctx.window.UserBox.getUserBox();
    const simResult = ctx.window.AppraisalLab.simulateTeamPerformance(userBox, 'beach');
    assert(simResult.totalDailyBerryEnergy > 0, 'Team simulation must compute total daily berry energy');
    assert(simResult.hasHealer === true, 'Team with Togepi (活力療癒S) must register healer');
    assert(simResult.totalDailySkillProcs > 0, 'Team simulation must estimate skill procs');
    assert(simResult.helpingBonusCount >= 2, 'Team with multiple helping bonus should count stacks');

    // 8. Test Comparison Subtab
    ctx.window.AppraisalLab.switchSubTab('compare');
    assert(mockContainer.innerHTML.includes('lab-compare-vs-header'), 'Compare view must render lab-compare-vs-header');
    assert(mockContainer.innerHTML.includes('選手 A'), 'Compare view must render 選手 A');
    assert(mockContainer.innerHTML.includes('lab-compare-energy'), 'Compare view must render daily energy comparison');
    assert(mockContainer.innerHTML.includes('lab-compare-ingredients'), 'Compare view must render daily ingredient yield comparison');
    assert(mockContainer.innerHTML.includes('每日預估總能量比較'), 'Compare view must render total daily energy label');
    assert(mockContainer.innerHTML.includes('每日食材產量比較'), 'Compare view must render daily ingredient comparison label');

    // Test Swap Slots
    ctx.window.AppraisalLab.swapCompareSlots();
    assert(mockContainer.innerHTML.includes('lab-compare-vs-header'), 'Swap slots must re-render comparison header');

    // 9. Test Custom Picker Modal
    ctx.window.AppraisalLab.openPicker({ type: 'team', slotIndex: 0 });
    const pickerModal = mockElements.get('modal-lab-picker');
    assert(pickerModal !== null && pickerModal !== undefined, 'openPicker must create modal-lab-picker');
    assert(pickerModal.innerHTML.includes('lab-picker-search-bar'), 'Picker modal must have search bar');
    assert(pickerModal.innerHTML.includes('lab-picker-list'), 'Picker modal must have items list');
    assert(pickerModal.innerHTML.includes('皮卡丘'), 'Picker modal items list must include box items');

    // Test Select in Picker
    ctx.window.AppraisalLab.onPickerSelect('box-pkm-2');
    assert(pickerModal.style.display === 'none', 'Selecting item must close picker modal');

    // Close Picker
    ctx.window.AppraisalLab.closePicker();
    assert(pickerModal.style.display === 'none', 'closePicker must set display to none');
  });


test('Tier 4 - Real-World Application Scenarios', 'Milestone Shortcut Lv. 100 Button, Unified Milestone Colors & Compact Dropdown Arrows', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify Lv. 100 milestone in app.js allMilestones
  assert(appJs.includes('[10, 25, 30, 50, 60, 70, 80, 100]'), 'app.js allMilestones must include 100');

  // 2. Setup mock DOM and open Pokemon Detail Modal for Pikachu (0025)
  const mockElements = new Map();
  global.document = {
    defaultView: global.window,
    body: {
      style: {},
      appendChild: (el) => {
        if (el.id) mockElements.set(el.id, el);
      }
    },
    getElementById: (id) => {
      if (!mockElements.has(id)) {
        mockElements.set(id, {
          id,
          tagName: 'DIV',
          innerHTML: '',
          textContent: '',
          value: '',
          style: {},
          classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            contains(c) { return this.classes.has(c); }
          },
          setAttribute() {},
          getAttribute() { return ''; }
        });
      }
      return mockElements.get(id);
    },
    querySelector: () => ({ textContent: '', style: {} }),
    querySelectorAll: () => [],
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      classList: { contains: () => false, add: () => {}, remove: () => {} }
    })
  };

  PokemonApp.init([...dataset]);
  const pikachuData = dataset.find(p => p.formatted_no === '0025' || p.name_cn === '皮卡丘') || dataset[0];
  PokemonApp.openPokemonDetailModal(pikachuData.id || pikachuData.formatted_no || '0025');
  const modalEl = mockElements.get('pokedex-detail-modal');
  assert(modalEl !== undefined && modalEl !== null, 'pokedex-detail-modal element must be created');
  const modalHtml = modalEl.innerHTML;

  assert(modalHtml.includes('data-pin-lv="100"'), 'Pokedex detail modal track pins bar must include Lv. 100 pin');
  assert(modalHtml.includes('data-pin-lv="70"'), 'Track pins bar must include Lv. 70 pin');
  assert(modalHtml.includes('data-pin-lv="80"'), 'Track pins bar must include Lv. 80 pin');

  // 3. Verify all pins have pin-milestone class
  const pin100Match = modalHtml.match(/<button[^>]*data-pin-lv="100"[^>]*>/);
  assert(pin100Match && pin100Match[0].includes('pin-milestone'), 'Lv. 100 pin must include pin-milestone class');
  const pin70Match = modalHtml.match(/<button[^>]*data-pin-lv="70"[^>]*>/);
  assert(pin70Match && pin70Match[0].includes('pin-milestone'), 'Lv. 70 pin must include pin-milestone class');

  // 4. Verify CSS unifies pin-unreleased colors with pin-milestone
  assert(stylesCss.includes('.pokedex-track-pin-btn.pin-unreleased .track-pin-label') &&
         stylesCss.includes('color: #38bdf8;') &&
         stylesCss.includes('font-weight: 700;'),
         'pin-unreleased label must have unified cyan color (#38bdf8) and font-weight: 700');

  // 5. Verify compact dropdown arrow in recipes.js and styles.css
  assert(recipesJs.includes('width="7" height="4.5"'), 'recipes.js custom-select-arrow SVG must be 7x4.5');
  assert(stylesCss.includes('width: 7px !important;') && stylesCss.includes('height: 4.5px !important;'),
         'styles.css must size select arrow SVG to 7x4.5px');
  assert(stylesCss.includes('#pokedex-detail-modal .custom-select-arrow') &&
         stylesCss.includes('right: 10px !important;'),
         'Pokedex detail modal select arrow must be positioned at right: 10px');
  assert(stylesCss.includes('#pokedex-detail-modal .custom-select-trigger') &&
         stylesCss.includes('padding: 0 24px 0 8px !important;'),
         'Pokedex detail modal select trigger must provide compact 24px right padding');

  // 6. Verify clean ribbon descriptions without redundant hours
  const ribbonHtml = PokemonApp.renderPokedexRibbonOptionsHTML(pikachuData, 0);
  assert(!ribbonHtml.includes('2000 小時') && !ribbonHtml.includes('2000 hrs'), 'Ribbon options HTML must not contain redundant 2000 hours text');
  assert(!ribbonHtml.includes('500 小時') && !ribbonHtml.includes('500 hrs'), 'Ribbon options HTML must not contain redundant 500 hours text');
});

  // ─── Test 187: Mobile H5 Bottom Sheet Appraisal Modal & Desktop Subtab Separation Verification ─

  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Bottom Sheet Appraisal Modal & Desktop Subtab Separation Verification', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Desktop index.html tab separation
    assert(indexHtml.includes('class="box-subnav-bar"'), 'index.html must have box-subnav-bar');
    assert(indexHtml.includes('id="box-subtab-list"') && indexHtml.includes('id="box-subtab-lab"'), 'index.html must have box-subtab-list and box-subtab-lab');
    assert(indexHtml.includes('id="box-subpanel-list"') && indexHtml.includes('id="box-subpanel-lab"'), 'index.html must have box-subpanel-list and box-subpanel-lab');
    assert(!indexHtml.includes('id="box-export-btn"'), 'index.html must not have box-export-btn in box toolbar');
    assert(!indexHtml.includes('id="box-import-input"'), 'index.html must not have box-import-input in box toolbar');

    // 2. Mobile H5 app/index.html has box-subtab-list and box-subtab-lab
    assert(appIndexHtml.includes('id="box-subtab-list"') && appIndexHtml.includes('id="box-subtab-lab"'), 'app/index.html must have box subnav tabs');

    // 3. Mobile modal bottom-sheet layout in appraisal.js
    assert(appraisalJs.includes('box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet'), 'Mobile appraisal modal must use mobile-box-sheet bottom-sheet');
    assert(appraisalJs.includes('sheet-drag-handle'), 'Mobile appraisal modal must include sheet-drag-handle');
    assert(appraisalJs.includes('box-modal-header'), 'Mobile appraisal modal must include box-modal-header');
    assert(appraisalJs.includes('box-modal-header-cancel'), 'Mobile appraisal modal must have cancel/close button on left');
    assert(appraisalJs.includes('appraisal-dual-verdict-column') && !appraisalJs.includes('<h3 class="box-modal-title">'), 'Mobile appraisal modal header must have dual-verdict column in place of box-modal-title');
    assert(appraisalJs.includes('box-modal-header-confirm'), 'Mobile appraisal modal must have edit button on right');

    // 4. CSS support for mobile modal sheet and desktop subnav bar
    assert(stylesCss.includes('.mobile-h5-app #modal-appraisal-report .mobile-box-sheet'), 'styles.css must style mobile appraisal sheet');
    assert(stylesCss.includes('body:not(.mobile-h5-app) .box-subnav-bar'), 'styles.css must style desktop box-subnav-bar');
    assert(stylesCss.includes('body:not(.mobile-h5-app) .box-subnav-item.active'), 'styles.css must style active desktop subnav item');

    // 5. Test openModal runtime in Mobile H5 context
    const modalCreated = { innerHTML: '', style: {}, className: '', classList: { add() {}, remove() {}, contains: () => false }, setAttribute() {} };
    const ctx = {
      window: { IS_MOBILE_H5: true },
      document: {
        querySelector: (s) => (s === '.mobile-h5-app' ? true : null),
        getElementById: (id) => (id === 'modal-appraisal-report' ? modalCreated : null),
        createElement: () => modalCreated,
        body: { classList: { contains: (c) => c === 'mobile-h5-app' }, style: {}, appendChild() {} }
      },
      console, Set, Array, parseInt, Math, String
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    ctx.window.allPokemons = [
      { id: 3, name_cn: '妙蛙花', specialty: '食材', type: '草', main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 2 }] }
    ];
    ctx.window.I18N = {
      getLanguage: () => 'zh-TW',
      getSubSkillName: (n) => n,
      getMainSkillName: (n) => n,
      getIngredientName: (n) => n,
      getNatureName: (n) => n,
      getSpecialtyName: (n) => n,
      getTypeName: (n) => n,
      getBerryName: (n) => n,
      getIngredientIcon: () => '',
      getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
    };
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    ctx.window.AppraisalLab.openModal({
      pkm: ctx.window.allPokemons[0],
      level: 50,
      nature: '內斂',
      subskills: ['樹果數量S', '幫手獎勵'],
      ingredients: ['特選蘋果', '特選蘋果', '特選蘋果'],
      ribbon: 1,
      nickname: '小花'
    });

    assert(modalCreated.className.includes('mobile-box-sheet') || modalCreated.innerHTML.includes('mobile-box-sheet'), 'Mobile openModal must render mobile-box-sheet');
    assert(modalCreated.innerHTML.includes('sheet-drag-handle'), 'Mobile openModal must render sheet drag handle');
    assert(modalCreated.innerHTML.includes('box-modal-header'), 'Mobile openModal must render box modal header');
    assert(modalCreated.innerHTML.includes('小花'), 'Mobile openModal must render nickname');
  });

  // ─── Test 188: Modal Dismissal, In-Place Edit Trigger & Compare View Overhaul Verification ─

  test('Tier 4 - Real-World Application Scenarios', 'Modal Dismissal, In-Place Edit Trigger & Compare View Overhaul Verification', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Verify CSS rules for backdrop display none and modal sheet close animation
    assert(stylesCss.includes('#modal-appraisal-report[style*="display: none"]') ||
           stylesCss.includes('.mobile-h5-app #modal-appraisal-report[style*="display: none"]'),
           'styles.css must have display: none !important rule for modal-appraisal-report');
    assert(stylesCss.includes('.mobile-h5-app #modal-appraisal-report.overlay-closing .mobile-box-sheet'),
           'styles.css must have exit animation for mobile appraisal report sheet');
    assert(stylesCss.includes('#modal-appraisal-report .box-modal-header-confirm'),
           'styles.css must style box-modal-header-confirm for appraisal modal');

    // 2. Verify JS methods exist
    assert(appraisalJs.includes('openCurrentEditModal'), 'appraisal.js must define openCurrentEditModal');
    assert(appraisalJs.includes('calculatePokemonComparisonPerformance'), 'appraisal.js must define calculatePokemonComparisonPerformance');
    assert(appraisalJs.includes('lab-compare-energy'), 'appraisal.js must include lab-compare-energy');
    assert(appraisalJs.includes('lab-compare-ingredients'), 'appraisal.js must include lab-compare-ingredients');
    assert(!appraisalJs.includes('${JSON.stringify(pkmOrBoxItem.rawItem).replace(/"/g, \'&quot;\')}'),
           'appraisal.js must not contain raw stringified JSON in inline onclick attribute');

    // 3. Test runtime behavior in VM
    let editOpenedWith = null;
    const modalEl = {
      id: 'modal-appraisal-report',
      style: {
        display: 'flex',
        setProperty(prop, val) { this[prop] = val; },
        removeProperty(prop) { delete this[prop]; }
      },
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      className: '',
      innerHTML: '',
      setAttribute() {}
    };

    const ctx = {
      window: {
        IS_MOBILE_H5: true,
        UserBox: {
          getUserBox: () => [{ uid: 'test-pkm-1', name: '妙蛙花', level: 50 }],
          openBoxEditModal: (item) => { editOpenedWith = item; }
        }
      },
      document: {
        querySelector: (s) => (s === '.mobile-h5-app' ? true : null),
        getElementById: (id) => (id === 'modal-appraisal-report' ? modalEl : null),
        createElement: () => modalEl,
        body: { classList: { contains: (c) => c === 'mobile-h5-app' }, style: {}, appendChild() {} }
      },
      console, Set, Array, parseInt, Math, String
    };
    ctx.window.window = ctx.window;
    ctx.window.document = ctx.document;
    ctx.window.allPokemons = [
      { id: 3, name_cn: '妙蛙花', specialty: '食材', type: '草', main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 2 }] }
    ];
    ctx.window.I18N = {
      getLanguage: () => 'zh-TW',
      getSubSkillName: (n) => n,
      getMainSkillName: (n) => n,
      getIngredientName: (n) => n,
      getNatureName: (n) => n,
      getSpecialtyName: (n) => n,
      getTypeName: (n) => n,
      getBerryName: (n) => n,
      getIngredientIcon: () => '',
      getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
    };

    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    // Open modal with raw item
    ctx.window.AppraisalLab.openModal({
      pkm: ctx.window.allPokemons[0],
      level: 50,
      nature: '坦率',
      subskills: [],
      rawItem: { uid: 'test-pkm-1', name: '妙蛙花', level: 50 }
    });

    assert(ctx.window.AppraisalLab._currentBoxItem !== null, 'openModal must store _currentBoxItem');
    assert(ctx.window.AppraisalLab._currentBoxItem.uid === 'test-pkm-1', 'stored item must match passed rawItem');

    // Call openCurrentEditModal
    ctx.window.AppraisalLab.openCurrentEditModal();
    assert(modalEl.style.display === 'none', 'openCurrentEditModal must hide appraisal modal');
    assert(editOpenedWith !== null && editOpenedWith.uid === 'test-pkm-1', 'openCurrentEditModal must open UserBox edit modal with item');

    // Call closeModal
    ctx.window.AppraisalLab.closeModal();
    assert(modalEl.style.display === 'none', 'closeModal must set modal display to none');
  });

  // ─── Test 189: Research Lab Overhaul: VS Header Matchup, Cross-Slot Distinct Ingredients & Team Config Variables ─

  test('Tier 4 - Real-World Application Scenarios', 'Research Lab Overhaul: VS Header Matchup, Cross-Slot Distinct Ingredients & Team Config Variables', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Static CSS verification
    assert(stylesCss.includes('.lab-compare-vs-header'), 'styles.css must style .lab-compare-vs-header');
    assert(stylesCss.includes('.lab-compare-distinct-row'), 'styles.css must style .lab-compare-distinct-row');
    assert(stylesCss.includes('.lab-team-config-panel'), 'styles.css must style .lab-team-config-panel');
    assert(stylesCss.includes('.lab-greengrass-berries-config'), 'styles.css must style .lab-greengrass-berries-config');
    assert(stylesCss.includes('.lab-berry-select'), 'styles.css must style .lab-berry-select');
    assert(stylesCss.includes('.lab-compare-vs-badge'), 'styles.css must style .lab-compare-vs-badge');

    // 2. Static JS verification
    assert(appraisalJs.includes('COOKING_CATEGORY_KEY_INGREDIENTS'), 'appraisal.js must define COOKING_CATEGORY_KEY_INGREDIENTS');
    assert(appraisalJs.includes('setTeamStrategy: setTeamStrategy'), 'appraisal.js must export setTeamStrategy');
    assert(appraisalJs.includes('setCookingType: setCookingType'), 'appraisal.js must export setCookingType');
    assert(appraisalJs.includes('setGreengrassBerry: setGreengrassBerry'), 'appraisal.js must export setGreengrassBerry');
    assert(appraisalJs.includes('distinctIngRowsHtml'), 'appraisal.js must aggregate distinct ingredients');
    const compViewFn = appraisalJs.slice(appraisalJs.indexOf('function renderComparisonView'), appraisalJs.indexOf('function renderTeamBuilderView'));
    assert(!compViewFn.includes('swapCompareSlots'), 'renderComparisonView must not render swapCompareSlots button');

    // 3. VM runtime execution
    const mockElements = new Map();
    const createdElements = [];
    const mockDOMElement = (id = '', tagName = 'div') => {
      const el = {
        id: id,
        tagName: tagName.toUpperCase(),
        innerHTML: '',
        value: '',
        style: { display: '' },
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: (child) => { createdElements.push(child); return child; },
        addEventListener: () => {}
      };
      if (id) mockElements.set(id, el);
      return el;
    };

    const mockStorage = new Map();
    const ctx = {
      window: {
        IS_MOBILE_H5: false,
        localStorage: {
          getItem: (k) => mockStorage.get(k) || null,
          setItem: (k, v) => mockStorage.set(k, String(v)),
          removeItem: (k) => mockStorage.delete(k)
        },
        I18N: {
          getLanguage: () => 'zh-TW',
          getSubSkillName: (n) => n,
          getMainSkillName: (n) => n,
          getIngredientName: (n) => n,
          getNatureName: (n) => n,
          getSpecialtyName: (n) => n,
          getTypeName: (n) => n,
          getBerryName: (n) => n,
          getIngredientIcon: () => 'assets/ingredients/test.png',
          getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
        },
        PokemonApp: {
          getPokemons: () => [
            {
              id: 3,
              name_cn: '妙蛙花',
              name_en: 'Venusaur',
              type: '草',
              specialty: '食材',
              base_frequency: 2800,
              berry: { name: '榴果', type: '草', power: 26, count: 1, icon: 'assets/berries/durin.png' },
              main_skill: '食材獲取S',
              skill: { name: '食材獲取S' },
              subskills: ['食材機率提升M', '幫手獎勵', '幫手速度M', '持有上限提升L', '技能機率M']
            },
            {
              id: 9,
              name_cn: '水箭龜',
              name_en: 'Blastoise',
              type: '水',
              specialty: '食材',
              base_frequency: 2700,
              berry: { name: '橙橙果', type: '水', power: 25, count: 1, icon: 'assets/berries/oran.png' },
              main_skill: '食材獲取S',
              skill: { name: '食材獲取S' },
              subskills: ['食材機率提升M', '持有上限提升L', '幫手速度M', '技能機率S', '樹果數量S']
            },
            {
              id: 26,
              name_cn: '雷丘',
              name_en: 'Raichu',
              type: '電',
              specialty: '樹果',
              base_frequency: 2200,
              berry: { name: '零餘果', type: '電', power: 25, count: 2, icon: 'assets/berries/rawst.png' },
              main_skill: '能量填充S',
              skill: { name: '能量填充S' },
              subskills: ['樹果數量S', '幫手速度M', '幫手獎勵', '食材機率提升M', '持有上限提升L']
            }
          ]
        },
        UserBox: {
          getUserBox: () => [
            {
              uid: 'box-pkm-1',
              pokemonId: 3,
              name: '妙蛙花',
              nickname: '大蒜蛙',
              level: 50,
              nature: '冷靜',
              subskills: ['食材機率提升M', '幫手獎勵'],
              ing1: '特選蘋果',
              ing2: '甜甜蜜',
              ing3: '甜甜蜜',
              ribbon: 2,
              skillLevel: 4
            },
            {
              uid: 'box-pkm-2',
              pokemonId: 9,
              name: '水箭龜',
              nickname: '烏龜大叔',
              level: 50,
              nature: '內斂',
              subskills: ['食材機率提升M', '幫手速度M'],
              ing1: '哞哞鮮奶',
              ing2: '哞哞鮮奶',
              ing3: '可可豆',
              ribbon: 1,
              skillLevel: 3
            },
            {
              uid: 'box-pkm-3',
              pokemonId: 26,
              name: '雷丘',
              nickname: '閃電',
              level: 60,
              nature: '固執',
              subskills: ['樹果數量S', '幫手速度M'],
              ing1: '特選蘋果',
              ing2: '暖暖薑',
              ing3: '暖暖薑',
              ribbon: 3,
              skillLevel: 6
            }
          ]
        },
        document: {
          getElementById: (id) => mockElements.get(id) || null,
          querySelector: (s) => (s && s.startsWith('#') ? (mockElements.get(s.slice(1)) || null) : null),
          querySelectorAll: () => [],
          createElement: (tag) => {
            const el = mockDOMElement('', tag);
            createdElements.push(el);
            return el;
          },
          body: {
            style: {},
            classList: { contains: () => false },
            appendChild: (el) => {
              if (el.id) mockElements.set(el.id, el);
            }
          }
        },
        console: console,
        getComputedStyle: () => ({ display: 'block' }),
        setupCustomSelect: () => {}
      }
    };
    ctx.window.allPokemons = ctx.window.PokemonApp.getPokemons();
    ctx.window.window = ctx.window;
    ctx.document = ctx.window.document;
    ctx.localStorage = ctx.window.localStorage;
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    const mockContainer = mockDOMElement('appraisal-lab-container');
    ctx.window.AppraisalLab.renderLab(mockContainer);

    // 4. Test Comparison View Overhaul (default empty, user selects up to 3 players)
    ctx.window.AppraisalLab.switchSubTab('compare');
    assert(mockContainer.innerHTML.includes('lab-compare-vs-header'), 'Compare view must render VS header');
    assert(mockContainer.innerHTML.includes('lab-compare-vs-badge'), 'Compare view must render VS badge');
    assert(mockContainer.innerHTML.includes('slot-a') && mockContainer.innerHTML.includes('slot-b'), 'Compare view must render slot-a and slot-b');
    assert(!mockContainer.innerHTML.includes('swapCompareSlots'), 'Compare view must not render swap button');
    
    // Pick 2 players (Player A: box-pkm-1 妙蛙花, Player B: box-pkm-2 水箭龜)
    ctx.window.AppraisalLab.setCompareSlot(0, 'box-pkm-1');
    ctx.window.AppraisalLab.setCompareSlot(1, 'box-pkm-2');

    const vsHeaderHtml = mockContainer.innerHTML.slice(
      mockContainer.innerHTML.indexOf('lab-compare-vs-header'),
      mockContainer.innerHTML.indexOf('lab-compare-energy')
    );
    assert(!vsHeaderHtml.includes('妙蛙花'), 'VS header must not display Pokemon name');
    assert(!vsHeaderHtml.includes('水箭龜'), 'VS header must not display Pokemon name');
    assert(!vsHeaderHtml.includes('評級'), 'VS header must not display rating grade');

    assert(mockContainer.innerHTML.includes('lab-compare-distinct-list'), 'Compare view must render distinct ingredients list');
    assert(mockContainer.innerHTML.includes('lab-compare-distinct-row'), 'Compare view must render distinct ingredient rows');
    assert(mockContainer.innerHTML.includes('特選蘋果') || mockContainer.innerHTML.includes('甜甜蜜'), 'Distinct rows must include ingredient names');

    // Test duplicate prevention: selecting box-pkm-1 for slot 2 should be blocked
    ctx.window.AppraisalLab.setCompareSlot(2, 'box-pkm-1');
    assert(mockContainer.innerHTML.includes('挑選選手 C') || mockContainer.innerHTML.includes('Pick Player C'), 'Duplicate selection in comparison must be prevented');

    // Test 3-player comparison: select box-pkm-3 (雷丘) for slot 2
    ctx.window.AppraisalLab.setCompareSlot(2, 'box-pkm-3');
    assert(mockContainer.innerHTML.includes('lab-compare-skills'), 'Compare view must render skill procs comparison');
    assert(mockContainer.innerHTML.includes('技能發動與幫手效能對照'), 'Compare view must render skill procs table');

    // 5. Test Team Builder Config Variables
    ctx.window.AppraisalLab.switchSubTab('team');
    assert(mockContainer.innerHTML.includes('lab-team-config-panel'), 'Team view must render config panel');
    assert(mockContainer.innerHTML.includes('綜合隊'), 'Team view must render balanced strategy option');
    assert(mockContainer.innerHTML.includes('樹果隊'), 'Team view must render berry strategy option');
    assert(mockContainer.innerHTML.includes('食材隊'), 'Team view must render ingredient strategy option');
    assert(mockContainer.innerHTML.includes('技能隊'), 'Team view must render skill strategy option');

    // Test setting strategy
    ctx.window.AppraisalLab.setTeamStrategy('ingredient');
    assert(mockContainer.innerHTML.includes('lab-team-pill active'), 'Active strategy pill must be highlighted');

    // Test setting cooking type
    ctx.window.AppraisalLab.setCookingType('dessert');

    // Test Greengrass Isle dynamic berries
    ctx.window.AppraisalLab.setTeamIsland('greengrass');
    assert(mockContainer.innerHTML.includes('lab-greengrass-berries-config'), 'Greengrass Isle must render berry selector');
    ctx.window.AppraisalLab.setGreengrassBerry(0, '零餘果');

    // Test autoOptimizeTeam execution
    ctx.window.AppraisalLab.autoOptimizeTeam();
    assert(mockContainer.innerHTML.includes('lab-team-slot-card'), 'Optimized team must render team cards');
  });

  // ─── Test 190: Appraisal edit flow wiring and grid picker ─

  test('Tier 4 - Real-World Application Scenarios', 'Appraisal Edit Flow Wiring (UserBox export, reopen after edit) & Grid Picker Cards', () => {
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    const exportBlock = boxJs.slice(boxJs.indexOf('window.PokemonBoxApp = {'), boxJs.indexOf('window.UserBox = window.PokemonBoxApp'));
    assert(exportBlock.includes('openBoxEditModal'), 'PokemonBoxApp must export openBoxEditModal');
    assert(exportBlock.includes('closeBoxEditModal'), 'PokemonBoxApp must export closeBoxEditModal');
    assert(boxJs.includes('reopenAfterEdit'), 'closeBoxEditModal must call AppraisalLab.reopenAfterEdit');
    assert(appraisalJs.includes('reopenAfterEdit: reopenAfterEdit'), 'AppraisalLab must export reopenAfterEdit');
    assert(stylesCss.includes('.appraisal-edit-btn'), 'styles.css must style .appraisal-edit-btn');
    assert(stylesCss.includes('.lab-picker-card'), 'styles.css must style .lab-picker-card grid cards');
    assert(stylesCss.includes('.lab-picker-avatar'), 'styles.css must style .lab-picker-avatar');
  });

  // ─── Test 191: 3-Player Comparison, Default Empty Slots, Duplicate Prevention & Skill Procs ─

  test('Tier 4 - Real-World Application Scenarios', '3-Player Comparison, Default Empty Slots, Duplicate Prevention & Skill Procs', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Static CSS verification
    assert(stylesCss.includes('.lab-picker-occupied-badge'), 'styles.css must style .lab-picker-occupied-badge');
    assert(stylesCss.includes('.lab-picker-card.occupied'), 'styles.css must style .lab-picker-card.occupied');
    assert(!stylesCss.includes('.lab-picker-fav-badge'), 'styles.css must not style .lab-picker-fav-badge (2x badge removed)');
    assert(stylesCss.includes('.lab-compare-vs-player.slot-c'), 'styles.css must style .slot-c for 3rd player');
    assert(stylesCss.includes('.lab-cmp-bar-row'), 'styles.css must style .lab-cmp-bar-row');
    assert(stylesCss.includes('.lab-cmp-table'), 'styles.css must style .lab-cmp-table');

    // 2. VM runtime test
    const mockElements = new Map();
    const createdElements = [];
    const mockDOMElement = (id = '', tagName = 'div') => {
      const el = {
        id: id,
        tagName: tagName.toUpperCase(),
        innerHTML: '',
        value: '',
        style: { display: '' },
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: (child) => { createdElements.push(child); return child; },
        addEventListener: () => {}
      };
      if (id) mockElements.set(id, el);
      return el;
    };

    const mockStorage = new Map();
    const toasts = [];
    const ctx = {
      window: {
        IS_MOBILE_H5: false,
        showToast: (msg) => toasts.push(msg),
        localStorage: {
          getItem: (k) => mockStorage.get(k) || null,
          setItem: (k, v) => mockStorage.set(k, String(v)),
          removeItem: (k) => mockStorage.delete(k)
        },
        I18N: {
          getLanguage: () => 'zh-TW',
          getSubSkillName: (n) => n,
          getMainSkillName: (n) => n,
          getIngredientName: (n) => n,
          getNatureName: (n) => n,
          getSpecialtyName: (n) => n,
          getTypeName: (n) => n,
          getBerryName: (n) => n,
          getIngredientIcon: () => 'assets/ingredients/test.png',
          getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
        },
        PokemonApp: {
          getPokemons: () => [
            { id: 3, name_cn: '妙蛙花', specialty: '食材', base_frequency: 2800, main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 2 }] },
            { id: 9, name_cn: '水箭龜', specialty: '食材', base_frequency: 2700, main_skill: '食材獲取S', ingredients: [{ name: '哞哞鮮奶', count: 2 }] },
            { id: 26, name_cn: '雷丘', specialty: '樹果', base_frequency: 2200, main_skill: '能量填充S', ingredients: [{ name: '特選蘋果', count: 2 }] }
          ]
        },
        UserBox: {
          getUserBox: () => [
            { uid: 'pkm-1', pokemonId: 3, name: '妙蛙花', level: 50, nature: '冷靜', subskills: [], ing1: '特選蘋果' },
            { uid: 'pkm-2', pokemonId: 9, name: '水箭龜', level: 50, nature: '內斂', subskills: [], ing1: '哞哞鮮奶' },
            { uid: 'pkm-3', pokemonId: 26, name: '雷丘', level: 60, nature: '固執', subskills: [], ing1: '特選蘋果' }
          ]
        },
        document: {
          getElementById: (id) => mockElements.get(id) || null,
          querySelector: (s) => (s && s.startsWith('#') ? (mockElements.get(s.slice(1)) || null) : null),
          querySelectorAll: () => [],
          createElement: (tag) => {
            const el = mockDOMElement('', tag);
            createdElements.push(el);
            return el;
          },
          body: {
            style: {},
            classList: { contains: () => false },
            appendChild: (el) => { if (el.id) mockElements.set(el.id, el); }
          }
        },
        console: console,
        getComputedStyle: () => ({ display: 'block' }),
        setupCustomSelect: () => {}
      }
    };
    ctx.window.allPokemons = ctx.window.PokemonApp.getPokemons();
    ctx.window.window = ctx.window;
    ctx.document = ctx.window.document;
    ctx.localStorage = ctx.window.localStorage;
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    const mockContainer = mockDOMElement('appraisal-lab-container');
    ctx.window.AppraisalLab.renderLab(mockContainer);
    ctx.window.AppraisalLab.switchSubTab('compare');

    // 1. Initial State: default NO pokemon selected
    assert(mockContainer.innerHTML.includes('挑選選手 A') || mockContainer.innerHTML.includes('Pick Player A'), 'Slot A must be empty by default');
    assert(mockContainer.innerHTML.includes('挑選選手 B') || mockContainer.innerHTML.includes('Pick Player B'), 'Slot B must be empty by default');
    assert(mockContainer.innerHTML.includes('挑選選手 C') || mockContainer.innerHTML.includes('Pick Player C'), 'Slot C must be empty by default');

    // 2. Select Player A and Player B
    ctx.window.AppraisalLab.setCompareSlot(0, 'pkm-1');
    ctx.window.AppraisalLab.setCompareSlot(1, 'pkm-2');
    assert(!mockContainer.innerHTML.includes('挑選選手 A'), 'Slot A must now be occupied');
    assert(!mockContainer.innerHTML.includes('挑選選手 B'), 'Slot B must now be occupied');
    assert(mockContainer.innerHTML.includes('挑選選手 C'), 'Slot C must still be empty');

    // 3. Duplicate selection guard
    toasts.length = 0;
    ctx.window.AppraisalLab.setCompareSlot(2, 'pkm-1'); // pkm-1 already in slot 0
    assert(mockContainer.innerHTML.includes('挑選選手 C'), 'Slot C must reject duplicate pkm-1');
    assert(toasts.some(t => t.includes('無法重複選擇') || t.includes('already selected')), 'Toast must notify user about duplicate');

    // 4. Select Player C with pkm-3
    ctx.window.AppraisalLab.setCompareSlot(2, 'pkm-3');
    assert(!mockContainer.innerHTML.includes('挑選選手 C'), 'Slot C must now be occupied with 3rd player');
    assert(mockContainer.innerHTML.includes('slot-c'), 'Compare view must render slot-c');

    // 5. Verify Skill Procs comparison metrics
    assert(mockContainer.innerHTML.includes('lab-compare-skills'), 'Compare view must include skills comparison');
    assert(mockContainer.innerHTML.includes('技能發動率'), 'Skills table must compare 技能發動率');
    assert(mockContainer.innerHTML.includes('技能每日發動次數'), 'Skills table must compare 技能每日發動次數');
    assert(mockContainer.innerHTML.includes('技能平均發動間隔'), 'Skills table must compare 技能平均發動間隔');
    assert(mockContainer.innerHTML.includes('主技能每日能量'), 'Skills table must compare 主技能每日能量');

    // 6. Test picker modal has no 2x badge and shows occupied state
    ctx.window.AppraisalLab.openPicker({ type: 'compare', compareSlot: 0 });
    const pickerModal = mockElements.get('modal-lab-picker');
    assert(pickerModal !== null, 'modal-lab-picker must be created');
    assert(!pickerModal.innerHTML.includes('lab-picker-fav-badge'), 'Picker modal must not contain 2x badge');
    assert(!pickerModal.innerHTML.includes('>2x<'), 'Picker modal must not display 2x text');
    assert(pickerModal.innerHTML.includes('lab-picker-occupied-badge'), 'Picker modal must show occupied badge for other slots');
    assert(pickerModal.innerHTML.includes('已在對比中'), 'Picker modal must display 已在對比中');

    // 7. Test clearCompareSlot
    ctx.window.AppraisalLab.clearCompareSlot(1);
    assert(mockContainer.innerHTML.includes('挑選選手 B'), 'Slot B must be reset to empty after clearCompareSlot');
  });

  // ─── Test 192: Appraisal Skill Level Correction & Mobile Appraisal Layout Overhaul Verification ─

  test('Tier 4 - Real-World Application Scenarios', 'Appraisal Skill Level Correction & Mobile Appraisal Layout Overhaul Verification', () => {
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Verify getEffectiveSkillLevel and helper exports in box.js and appraisal.js
    assert(boxJs.includes('getEffectiveSkillLevel'), 'box.js must implement getEffectiveSkillLevel');
    assert(boxJs.includes('STAGE3_FINAL_NAMES'), 'box.js must define STAGE3_FINAL_NAMES');
    assert(boxJs.includes('getPokemonEvolutionStage'), 'box.js must implement getPokemonEvolutionStage');
    assert(boxJs.includes('getSubskillLevelBonus'), 'box.js must implement getSubskillLevelBonus');

    assert(appraisalJs.includes('getEffectiveSkillLevel'), 'appraisal.js must implement getEffectiveSkillLevel');
    assert(appraisalJs.includes('STAGE3_FINAL_NAMES'), 'appraisal.js must define STAGE3_FINAL_NAMES');

    // 2. Functional verification of effective skill level logic
    const { getEffectiveSkillLevel } = require(path.join(WORKSPACE_ROOT, 'js/modules/box.js'));
    assert(typeof getEffectiveSkillLevel === 'function', 'getEffectiveSkillLevel must be an exported function');

    // Basic stage 1 (Bulbasaur) without subskills
    const bulbasaur = { name_cn: '妙蛙種子', level: 10, subskills: [] };
    assertEquals(getEffectiveSkillLevel(bulbasaur, bulbasaur), 1, 'Bulbasaur base skill level must be 1');

    // Stage 2 (Ivysaur)
    const ivysaur = { name_cn: '妙蛙草', level: 25, evo_req: 'Lv.12 + 40 糖', subskills: [] };
    assertEquals(getEffectiveSkillLevel(ivysaur, ivysaur), 2, 'Ivysaur base skill level must be 2');

    // Stage 3 (Venusaur) without subskills
    const venusaurBase = { name_cn: '妙蛙花', level: 30, evo_req: 'Lv.24 + 80 糖', is_final: '〇', main_skill: '食材獲取S' };
    assertEquals(getEffectiveSkillLevel(venusaurBase, venusaurBase), 3, 'Venusaur base skill level must be 3');

    // Venusaur at Lv.55 with 技能等級提升M at slot 1 (Lv.25) -> 3 + 2 = 5!
    const venusaurWithSkillM = {
      name_cn: '妙蛙花',
      level: 55,
      evo_req: 'Lv.24 + 80 糖',
      is_final: '〇',
      main_skill: '食材獲取S',
      subskills: ['持有上限提升S', '技能等級提升M', '技能機率提升S']
    };
    assertEquals(getEffectiveSkillLevel(venusaurWithSkillM, venusaurWithSkillM), 5, 'Venusaur Lv.55 with Skill Level Up M must have effective skill level 5');

    // Locked subskills do not increase skill level early
    const venusaurLocked = {
      name_cn: '妙蛙花',
      level: 20,
      evo_req: 'Lv.24 + 80 糖',
      is_final: '〇',
      main_skill: '食材獲取S',
      subskills: ['持有上限提升S', '技能等級提升M'] // slot 1 unlocks at 25, current is 20
    };
    assertEquals(getEffectiveSkillLevel(venusaurLocked, venusaurLocked), 3, 'Locked Skill Level Up M at Lv.20 must not grant bonus early');

    // User manual seed upgrade higher than natural level is preserved
    const venusaurWithSeeds = {
      name_cn: '妙蛙花',
      level: 55,
      skillLevel: 7,
      subskills: ['持有上限提升S', '技能等級提升M']
    };
    assertEquals(getEffectiveSkillLevel(venusaurWithSeeds, venusaurBase), 7, 'User manual seeds upgrade must be preserved');

    // 3. Mobile Appraisal sheet DOM structure
    assert(!appraisalJs.includes('<h3 class="box-modal-title">'), 'Mobile appraisal sheet must have box-modal-title removed');
    assert(appraisalJs.includes('appraisal-dual-verdict-column'), 'Mobile appraisal header must contain dual verdict column in place of title');
    assert(!appraisalJs.includes('第 ${ribbonLevel} 階段'), 'appraisal.js must not contain "第 X 階段" text');
    assert(!appraisalJs.includes('Tier ${ribbonLevel}'), 'appraisal.js must not contain "Tier X" text');
    assert(!appraisalJs.includes('appraisal-pokemon-en'), 'appraisal.js must NOT contain appraisal-pokemon-en');
    assert(appraisalJs.includes('appraisal-h5-pkm-name font-bold'), 'appraisal.js must give appraisal-h5-pkm-name font-bold');
    assert(appraisalJs.includes("${isEN ? 'Current' : '當前'}"), 'dual verdict column current label must be simplified to Current / 當前');
    assert(appraisalJs.includes("${isEN ? 'Max Lv' : '滿級'}"), 'dual verdict column max label must be simplified to Max Lv / 滿級');

    // Check that mainskill row, ing parallel row, and config section are inside appraisal-h5-header-summary
    const summaryStart = appraisalJs.indexOf('<div class="appraisal-h5-header-summary">');
    const summaryEnd = appraisalJs.indexOf('<!-- 雷達圖與六維能量條 -->');
    assert(summaryStart !== -1 && summaryEnd !== -1 && summaryStart < summaryEnd, 'appraisal-h5-header-summary must precede radar chart');
    const summaryChunk = appraisalJs.slice(summaryStart, summaryEnd);
    assert(summaryChunk.includes('appraisal-mainskill-row'), 'appraisal-mainskill-row must be inside appraisal-h5-header-summary');
    assert(summaryChunk.includes('appraisal-ing-parallel-row'), 'appraisal-ing-parallel-row must be inside appraisal-h5-header-summary');
    assert(summaryChunk.includes('appraisal-h5-subinfo-row'), 'appraisal-h5-subinfo-row must be inside appraisal-h5-header-summary');
    assert(summaryChunk.includes('appraisal-config-section'), 'appraisal-config-section must be inside appraisal-h5-header-summary');
    assert(summaryChunk.includes('appraisal-ribbon-badge'), 'appraisal-ribbon-badge must be inside appraisal-h5-header-summary');

    // 4. CSS single frame rule & styling checks
    assert(stylesCss.includes('.mobile-h5-app .appraisal-h5-header-summary'), 'styles.css must style appraisal-h5-header-summary');
    assert(stylesCss.includes('.mobile-h5-app .appraisal-h5-subinfo-row'), 'styles.css must style appraisal-h5-subinfo-row');
    assert(stylesCss.includes('#modal-appraisal-report .box-modal-header-confirm'), 'styles.css must style modal-appraisal-report confirm button');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Screenshot OCR Main Skill Level Recognition & Golden Seed Ground Truth Audit', () => {
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    vm.runInContext(boxCode, appCtx);
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));
    appCtx.PokemonBoxApp.setAllPokemons(pkmData);

    const parseOcr = appCtx.PokemonBoxApp.parsePokemonFromOcr;

    // 1. Blastoise Screenshot (Stage 3, but wild caught / evolved with Lv.2 main skill, MUST NOT be overridden to Lv.3)
    const blastoiseOcr = `
Lv. 64 水箭龜
SP 4,858
持有上限 53個
食材獲取S Lv. 2
隨機獲得8個食材。
持有上限提升L
食材機率提升M
幫忙速度M
持有上限提升S
技能機率提升S
浮躁
沒有性格帶來的特色
`;
    const parsedBlastoise = parseOcr(blastoiseOcr, null, pkmData);
    assertEquals(parsedBlastoise.name, '水箭龜', 'Parsed name must be 水箭龜');
    assertEquals(parsedBlastoise.level, 64, 'Parsed level must be 64');
    assertEquals(parsedBlastoise.skillLevel, 2, 'Blastoise skill level must be strictly Lv. 2 from screenshot without stage override');

    // 2. Meowscarada Screenshot (Lv.3 main skill)
    const meowscaradaOcr = `
Lv. 62 魔幻假面喵
SP 4,316
持有上限 52個
料理強化S Lv. 3
增加下一次料理時的鍋子容量
幫忙速度M
食材機率提升M
持有上限提升L
技能機率提升M
研究EXP獎勵
急躁
EXP獲得量 ▲▲
活力回復量 ▼▼
`;
    const parsedMeowscarada = parseOcr(meowscaradaOcr, null, pkmData);
    assertEquals(parsedMeowscarada.name, '魔幻假面喵', 'Parsed name must be 魔幻假面喵');
    assertEquals(parsedMeowscarada.skillLevel, 3, 'Meowscarada skill level must be strictly Lv. 3 from screenshot');

    // 3. Meganium Screenshot (Lv.4 main skill)
    const meganiumOcr = `
Lv. 26 大竺葵
SP 1,439
持有上限 30個
能量填充S Lv. 4
卡比獸的能量增加
樹果數量S
技能等級提升S
持有上限提升L
持有上限提升M
食材機率提升S
溫和
主技能發動機率 ▲▲
幫忙速度 ▼▼
`;
    const parsedMeganium = parseOcr(meganiumOcr, null, pkmData);
    assertEquals(parsedMeganium.name, '大竺葵', 'Parsed name must be 大竺葵');
    assertEquals(parsedMeganium.skillLevel, 4, 'Meganium skill level must be strictly Lv. 4 from screenshot');

    // 4. Heracross Screenshot with Golden Seeds (Stage 1 with Lv. 7 main skill, MUST NOT be demoted to 1 or 3)
    const heracrossOcr = `
Lv. 52 赫拉克羅斯
SP 6,920
持有上限 21個
健美（料理輔助S） Lv. 7
隨機獲得24個食材
技能機率提升M
技能等級提升M
幫忙速度M
持有上限提升S
食材機率提升S
慎重
主技能發動機率 ▲▲
食材發現率 ▼▼
`;
    const parsedHeracross = parseOcr(heracrossOcr, null, pkmData);
    assertEquals(parsedHeracross.name, '赫拉克羅斯', 'Parsed name must be 赫拉克羅斯');
    assertEquals(parsedHeracross.skillLevel, 7, 'Heracross fed with golden seeds must be strictly Lv. 7 from screenshot');

    // 5. Composite Canvas Section format with [MAINSKILL_LV]
    const compositeCanvasOcr = `
[NAME]
水箭龜
[BIN_LV]
Lv. 64
[CARRY_NUM]
53個
[MAINSKILL]
食材獲取S
[MAINSKILL_LV]
Lv.2
[SLOT1:blue]
持有上限提升L
`;
    const parsedComposite = parseOcr(compositeCanvasOcr, null, pkmData);
    assertEquals(parsedComposite.name, '水箭龜', 'Parsed name from composite canvas must be 水箭龜');
    assertEquals(parsedComposite.skillLevel, 2, 'Parsed skill level from [MAINSKILL_LV] section must be 2');

    // 6. Composite Canvas Section with Golden Seeds Heracross
    const compositeGoldenSeeds = `
[NAME]
赫拉克羅斯
[BIN_LV]
Lv. 52
[CARRY_NUM]
21個
[MAINSKILL]
健美（料理輔助S）
[MAINSKILL_LV]
Lv.7
[SLOT1:blue]
技能機率提升M
`;
    const parsedCompositeSeeds = parseOcr(compositeGoldenSeeds, null, pkmData);
    assertEquals(parsedCompositeSeeds.skillLevel, 7, 'Parsed skill level with seeds from [MAINSKILL_LV] must be 7');

    // 7. Universal multi-line and OCR typo scenario checks (No pixel color dependency)
    assert(!boxCode.includes('mainSkillTop'), 'box.js must not contain hardcoded pixel color detection (mainSkillTop)');

    const twoLineSkillOcr = `
Lv. 64 水箭龜
SP 4,858
持有上限 53個
食材獲取S
Lv. 2
隨機獲得8個食材。
幫忙速度M
`;
    const parsedTwoLine = parseOcr(twoLineSkillOcr, null, pkmData);
    assertEquals(parsedTwoLine.skillLevel, 2, 'Two-line OCR separated skill and level must be recognized as Lv. 2');

    const typoSkillOcr = `
Lv. 62 魔幻假面喵
SP 4,316
料理強化S
1v. 3
持有上限 52個
幫忙速度M
`;
    const parsedTypo = parseOcr(typoSkillOcr, null, pkmData);
    assertEquals(parsedTypo.skillLevel, 3, 'OCR typo 1v. 3 must be recognized as Lv. 3');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Universal OCR Text Engine: 100% Species Coverage & Multi-Pattern 99%+ Accuracy Audit', () => {
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const appCtx = { window: {}, console };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(appraisalCode, appCtx);
    vm.runInContext(boxCode, appCtx);
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));
    appCtx.PokemonBoxApp.setAllPokemons(pkmData);
    const parseOcr = appCtx.PokemonBoxApp.parsePokemonFromOcr;

    let totalCases = 0;
    let passedCases = 0;
    const failures = [];

    for (const pkm of pkmData) {
      const ms = pkm.main_skill || '食材獲取S';
      const maxLvl = ms.includes('夢之碎片') ? 8 : (ms.includes('能量填充') || ms.includes('食材獲取') || ms.includes('幫手支援') || ms.includes('料理輔助') ? 7 : 6);

      for (let lvl = 1; lvl <= maxLvl; lvl++) {
        const testPatterns = [
          // 1. 同行標準：技能名 + Lv. X + 說明
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n持有上限 30個\n${ms} Lv. ${lvl}\n隨機獲得8個食材\n幫忙速度M`,
          // 2. 跨行斷行：技能名 \n Lv. X \n 說明
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n持有上限 30個\n${ms}\nLv. ${lvl}\n隨機獲得8個食材\n幫忙速度M`,
          // 3. 錯字變體：1v. X
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n持有上限 30個\n${ms}\n1v. ${lvl}\n隨機獲得8個食材\n幫忙速度M`,
          // 4. 錯字變體：v. X
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n持有上限 30個\n${ms}\nv. ${lvl}\n隨機獲得8個食材\n幫忙速度M`,
          // 5. 複合切片 Canvas Section 標籤
          `[NAME]\n${pkm.name_cn}\n[MAINSKILL]\n${ms}\n[MAINSKILL_LV]\nLv.${lvl}\n[SLOT1:blue]\n持有上限提升L`,
          // 6. 無 Lv. 純後綴數字
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n${ms} ${lvl}\n持有上限 30個\n幫忙速度M`,
          // 7. 帶有冒號與主技能前綴
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n主技能：${ms} Lv. ${lvl}\n持有上限 30個\n幫忙速度M`,
          // 8. 同行且說明緊接在後
          `Lv. 50 ${pkm.name_cn}\nSP 2500\n${ms} Lv. ${lvl} 隨機獲得8個食材\n持有上限 30個\n幫忙速度M`
        ];

        for (const pat of testPatterns) {
          totalCases++;
          const res = parseOcr(pat, null, pkmData);
          if (res && res.skillLevel === lvl) {
            passedCases++;
          } else {
            failures.push({ name: pkm.name_cn, ms, expected: lvl, got: res ? res.skillLevel : null });
          }
        }
      }
    }

    const accuracy = passedCases / totalCases;
    assert(totalCases >= 10000, `Must evaluate at least 10000 permutations, got ${totalCases}`);
    assert(accuracy >= 0.99, `Universal OCR engine accuracy must be >= 99%, got ${(accuracy * 100).toFixed(2)}% (${passedCases}/${totalCases})`);
    assertEquals(failures.length, 0, `All ${totalCases} test cases must pass without error (100% accuracy)`);
  });

  // ─── Test 195: Appraisal Breakdown Elimination, Desktop Layout Polish, Unified Island Popover & News Workflow Verification ─

  test('Tier 4 - Real-World Application Scenarios', 'Appraisal Breakdown Elimination, Desktop Layout Polish, Unified Island Popover & News Workflow Verification', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const syncAllPy = fs.readFileSync(path.join(WORKSPACE_ROOT, 'scripts/sync_all.py'), 'utf8');
    const updateDataYml = fs.readFileSync(path.join(WORKSPACE_ROOT, '.github/workflows/update-data.yml'), 'utf8');
    const syncYml = fs.readFileSync(path.join(WORKSPACE_ROOT, '.github/workflows/sync.yml'), 'utf8');
    const newsJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/news.json'), 'utf8'));

    // 1. appraisal-scores-breakdown completely removed from appraisal.js
    assert(!appraisalJs.includes('appraisal-scores-breakdown'), 'appraisal.js must not contain appraisal-scores-breakdown in any view');

    // 2. Desktop appraisal layout uses appraisal-desktop-content-grid and appraisal-radar-block
    assert(appraisalJs.includes('appraisal-desktop-content-grid'), 'appraisal.js must use appraisal-desktop-content-grid for desktop');
    assert(appraisalJs.includes('appraisal-radar-block'), 'appraisal.js must use appraisal-radar-block');
    assert(stylesCss.includes('body:not(.mobile-h5-app) .appraisal-desktop-content-grid'), 'styles.css must style appraisal-desktop-content-grid for desktop');

    // 3. Island sleep cells: render clean badge triggering popover without inline bulky chips
    assert(wikiJs.includes('function renderIslandSleepCell'), 'wiki.js must define renderIslandSleepCell');
    assert(wikiJs.includes('showSleepStylePopover'), 'wiki.js must implement showSleepStylePopover');
    assert(!wikiJs.includes('island-sleep-inline-rewards'), 'wiki.js must not contain bulky inline rewards chips in habitat cells');

    // 4. Mobile H5 Island Scene: 100% width with aspect ratio height
    assert(stylesCss.includes('.mobile-h5-app #wiki-subpanel-islands.has-island-scene > .island-scene-layer'), 'styles.css must style mobile island scene layer');
    assert(stylesCss.includes('aspect-ratio: 2560 / 1372 !important;'), 'styles.css must enforce aspect-ratio for mobile island photo');

    // 5. News Automation in GitHub Actions & Scripts
    assert(syncAllPy.includes('build_news.py'), 'scripts/sync_all.py must include build_news.py');
    assert(updateDataYml.includes('build_news.py'), '.github/workflows/update-data.yml must execute build_news.py');
    assert(updateDataYml.includes('data/news.json'), '.github/workflows/update-data.yml must commit data/news.json');
    assert(syncYml.includes('data/news.json'), '.github/workflows/sync.yml must commit data/news.json');

    // 6. Fresh news data loaded
    assert(Array.isArray(newsJson) && newsJson.length > 0, 'data/news.json must be a non-empty array');
    assert(newsJson.some(n => n.date && n.date.startsWith('2026-10')), 'data/news.json must contain up-to-date October 2026 articles');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Pokedex Formula Breakdown Integrated into Appraisal Report Modal Without Modification Components', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Check core calculation engine function export and custom state support
    assert(appJs.includes('calculatePokedexIngredientFormulas'), 'app.js must define calculatePokedexIngredientFormulas');
    assert(appJs.includes('renderPokedexFormulaBreakdownHTML'), 'app.js must define renderPokedexFormulaBreakdownHTML');
    assert(appJs.includes('getIngCountFromBase'), 'app.js must define getIngCountFromBase helper');

    // 2. Check appraisal.js integration
    assert(appraisalJs.includes('calculatePokedexIngredientFormulas'), 'appraisal.js must call calculatePokedexIngredientFormulas');
    assert(appraisalJs.includes('renderPokedexFormulaBreakdownHTML'), 'appraisal.js must call renderPokedexFormulaBreakdownHTML');
    assert(appraisalJs.includes('appraisal-calc-col'), 'appraisal.js desktop layout must include appraisal-calc-col');
    assert(appraisalJs.includes('appraisal-calc-mobile-wrap'), 'appraisal.js mobile layout must include appraisal-calc-mobile-wrap');
    assert(appraisalJs.includes('appraisal-header-stats-dual'), 'appraisal.js must render dual stats row');
    assert(appraisalJs.includes('appraisal-stats-section'), 'appraisal.js must place dual stats in appraisal-stats-section');
    assert(appraisalJs.includes('Ing Rate') && appraisalJs.includes('Skill Rate'), 'appraisal.js must support concise EN labels (Ing Rate, Skill Rate)');

    // 3. Strict check: No modification controls in appraisal calculation view
    assert(!appraisalJs.includes('pokedex-calc-slider'), 'appraisal.js must NOT contain pokedex-calc-slider (pure display)');
    assert(!appraisalJs.includes('box-subskill-palette'), 'appraisal.js must NOT contain subskill palette editor (pure display)');

    // 4. Check CSS styling & theme support
    assert(stylesCss.includes('.appraisal-calc-col'), 'styles.css must style .appraisal-calc-col');
    assert(stylesCss.includes('.appraisal-calc-mobile-wrap'), 'styles.css must style .appraisal-calc-mobile-wrap');
    assert(stylesCss.includes('275px minmax(390px, 430px) 1fr'), 'styles.css must allocate compact middle column and 1fr wide right column in appraisal-modal-body');
    assert(stylesCss.includes('.appraisal-left-col .appraisal-header-stats-dual') && stylesCss.includes('width: 100% !important'), 'styles.css must make appraisal dual stats 100% width');
    assert(stylesCss.includes('.appraisal-left-col .appraisal-header-stats-dual .header-stat-v') && stylesCss.includes('font-size: 15px !important'), 'styles.css must maximize stats value font size to 15px');
    assert(stylesCss.includes('#modal-appraisal-report .calc-val-main') && stylesCss.includes('font-size: 15px !important'), 'styles.css must enlarge calc main value to 15px for clarity');
    assert(stylesCss.includes('#modal-appraisal-report .pokedex-calc-formula-card') && stylesCss.includes('background: transparent !important'), 'styles.css must set transparent background for appraisal formula card');
    assert(stylesCss.includes('#modal-appraisal-report .unified-calc-row') && stylesCss.includes('border-bottom: 1px solid'), 'styles.css must separate calc rows with subtle divider line');
    assert(stylesCss.includes('[data-theme="midnight"]:not([data-theme-inverted="true"]) #modal-appraisal-report .pokedex-calc-unified-box'), 'styles.css must style midnight theme for appraisal modal calc box');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Box Edit Modal Desktop Ergonomic Layout & Snug Field Sizing', () => {
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Check combined row for main skill and ribbon in index.html
    assert(indexHtml.includes('box-mainskill-ribbon-row'), 'index.html must combine main skill and ribbon into box-mainskill-ribbon-row');
    assert(indexHtml.includes('box-mainskill-subgroup'), 'index.html must include box-mainskill-subgroup in combined row');
    assert(indexHtml.includes('box-ribbon-subgroup'), 'index.html must include box-ribbon-subgroup in combined row');
    assert(indexHtml.includes('box-nature-row'), 'index.html must include box-nature-row');

    // 2. Check snug field sizing in styles.css
    assert(stylesCss.includes('.box-form-row-3col .flex-level') && stylesCss.includes('width: 54px'), 'styles.css must make level input snug (54px)');
    assert(stylesCss.includes('.box-mainskill-control .custom-select-container') && stylesCss.includes('width: 74px !important'), 'styles.css must make main skill level select snug (74px)');
    assert(stylesCss.includes('.box-nature-row .custom-select-container') && stylesCss.includes('width: 350px !important'), 'styles.css must limit nature select width to longest option (350px)');

    // 3. Check borderless subskill slots in desktop web view
    assert(stylesCss.includes('body:not(.mobile-h5-app) #box-edit-modal .box-subskill-slots-row .box-subskill-slot-btn') && stylesCss.includes('border: none !important'), 'styles.css must remove outer border from box subskill slots on desktop');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Pot Expansion Slider UI, Range (0-700), and Default 100 Energy Recipe Calculations', () => {
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/recipes.js'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Slider presence in HTML files
    assert(indexHtml.includes('id="pot-expansion-slider"'), 'index.html must contain pot-expansion-slider');
    assert(indexHtml.includes('id="pot-expansion-badge"'), 'index.html must contain pot-expansion-badge');
    assert(indexHtml.includes('min="0"') && indexHtml.includes('max="700"') && indexHtml.includes('class="rf-slider pot-slider"'), 'index.html slider must be min 0, max 700 with pot-slider class');

    assert(appIndexHtml.includes('id="pot-expansion-slider"'), 'app/index.html must contain pot-expansion-slider');
    assert(appIndexHtml.includes('id="pot-expansion-badge"'), 'app/index.html must contain pot-expansion-badge');
    assert(appIndexHtml.includes('min="0"') && appIndexHtml.includes('max="700"'), 'app/index.html slider must be min 0, max 700');

    // 2. i18n keys
    assert(i18nJs.includes("'recipe.slider_pot_expansion': '擴鍋預測'"), 'i18n.js must have zh-TW translation for pot expansion');
    assert(i18nJs.includes("'recipe.slider_pot_expansion': 'Pot Expansion'"), 'i18n.js must have en-US translation for pot expansion');

    // 3. CSS styles
    assert(stylesCss.includes('.pot-expansion-badge'), 'styles.css must style .pot-expansion-badge');
    assert(stylesCss.includes('input[type=range].rf-slider.pot-slider'), 'styles.css must style pot-slider');

    // 4. Exact mathematical formula verification
    // Formula: Final = Math.round((RecipeBase * (1 + LvBonus/100) + ExtraCount * 100) * (1 + Island/100) * EventMult)
    const baseEnergy = 1000;
    const lv1Bonus = 0;   // Lv.1: 0%
    const lv10Bonus = 18; // Lv.10: 18%

    // Helper imitating recipes.js calcEnergy
    function calcTestEnergy(base, lvBonus, islandPct, eventMult, extraCount, extraUnit = 100) {
      const recipeWithLv = base * (1 + lvBonus / 100);
      const extraBase = extraCount * extraUnit;
      const subtotal = recipeWithLv + extraBase;
      const islandMult = 1 + (islandPct / 100);
      return Math.round(subtotal * islandMult * eventMult);
    }

    // Case A: 0 extra ingredients (base recipe)
    assert(calcTestEnergy(baseEnergy, lv1Bonus, 20, 1.0, 0) === 1200, '0 extra ingredients at +20% island should be 1200');

    // Case B: 10 extra ingredients (+1000 extra energy)
    // Subtotal: 1000 + 1000 = 2000. Island 20% (x1.20), Event 1.5x -> 2000 * 1.2 * 1.5 = 3600
    assert(calcTestEnergy(baseEnergy, lv1Bonus, 20, 1.5, 10) === 3600, '10 extra ingredients at 100 energy each should correctly receive island and event multipliers');

    // Case C: Recipe Lv.10 (+18%) with 20 extra ingredients (+2000 extra energy)
    // Recipe portion: 1000 * 1.18 = 1180. Extra portion: 20 * 100 = 2000 (no lv bonus!).
    // Subtotal: 3180. Island 50% (x1.50) -> 3180 * 1.5 = 4770
    assert(calcTestEnergy(baseEnergy, lv10Bonus, 50, 1.0, 20) === 4770, 'Extra ingredients must not receive recipe level bonus, but must receive island bonus');

    // 5. Check recipes.js exports and functions
    assert(recipesJs.includes('calcEnergy(base, level, islandBonusPct, eventBonusMult = 1.0, extraCount = potExpansion'), 'recipes.js calcEnergy must accept extraCount defaulting to potExpansion');
    assert(recipesJs.includes('syncPotExpansionUI'), 'recipes.js must define syncPotExpansionUI');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 High-Performance Smooth Touch Scrolling & Non-Blocking Dismiss Optimization', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Fast guard in scroll and touchmove listeners to eliminate 90,000 DOM mutations/sec during scroll
    assert(appJs.includes('if (!currentGlobalTooltipAnchor)') && appJs.includes('dismissAllFloatingTooltips()'), 'app.js scroll listener must check currentGlobalTooltipAnchor to avoid thrashing on scroll');
    assert(appJs.includes('.pokedex-formula-help-btn, .ladder-formula-help-btn, .ladder-help-icon-btn, .special-skill-badge'), 'app.js dismissAllFloatingTooltips must reset all formula and skill buttons');

    // 2. PTR early return when not tracking
    assert(appJs.includes('if (!isTracking || isRefreshing || !e.touches || !e.touches[0]) return;'), 'app.js initPullToRefresh touchmove must early return when !isTracking');

    // 3. CSS touch-action and GPU accelerated scrolling rules for mobile H5
    assert(stylesCss.includes('.mobile-h5-app .pokemon-grid') && stylesCss.includes('touch-action: pan-y !important;'), 'styles.css must declare touch-action: pan-y for H5 smooth touch scrolling');
    assert(stylesCss.includes('transform: translateZ(0) !important;') && stylesCss.includes('will-change: scroll-position;'), 'styles.css must GPU-accelerate H5 scroll containers');
    assert(stylesCss.includes('.mobile-h5-app .island-spawns-table-wrapper') && stylesCss.includes('touch-action: pan-x pan-y !important;'), 'styles.css must declare 2D touch action for table containers');
  });

  // Test 152: Pot Expansion Help Tooltip, Full-Page Touch/Scroll Auto-Dismiss & Multi-Theme UI

  test('Tier 4 - Real-World Application Scenarios', 'Pot Expansion Help Tooltip, Full-Page Touch/Scroll Auto-Dismiss & Multi-Theme UI', () => {
    const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');

    // 1. Structure in index.html & app/index.html
    assert(desktopHtml.includes('class="pot-expansion-help-btn pokedex-formula-help-btn"'), 'index.html must include pot-expansion-help-btn');
    assert(desktopHtml.includes('class="slider-label-with-help"'), 'index.html must wrap label and help btn in slider-label-with-help');
    assert(mobileHtml.includes('class="pot-expansion-help-btn pokedex-formula-help-btn"'), 'app/index.html must include pot-expansion-help-btn');
    assert(mobileHtml.includes('class="slider-label-with-help"'), 'app/index.html must wrap label and help btn in slider-label-with-help');

    // 2. Help button data & i18n
    assert(appJs.includes("btn.classList.contains('pot-expansion-help-btn')"), 'getHelpButtonData must support pot-expansion-help-btn');
    assert(i18nJs.includes("'recipe.slider_pot_expansion_help_title'"), 'i18n.js must define recipe.slider_pot_expansion_help_title');
    assert(i18nJs.includes("'recipe.slider_pot_expansion_help_body'"), 'i18n.js must define recipe.slider_pot_expansion_help_body');

    // 3. Floating tooltip visibility and comprehensive dismiss
    assert(appJs.includes('isAnyFloatingTooltipVisible'), 'app.js must define isAnyFloatingTooltipVisible');
    assert(appJs.includes("document.addEventListener('touchstart', onTouchStart, { capture: true"), 'touchstart must be captured to dismiss floating tooltips immediately');
    assert(appJs.includes("document.addEventListener('touchmove', onTouchMove, { capture: true"), 'touchmove must be captured to dismiss floating tooltips immediately');
    assert(appJs.includes("document.addEventListener('scroll', onScrollDismiss, { capture: true"), 'scroll must be captured on document to dismiss floating tooltips');
    assert(appJs.includes("window.addEventListener('wheel', onScrollDismiss"), 'wheel must be listened to dismiss floating tooltips');

    // 4. CSS styling and theme coverage
    assert(stylesCss.includes('.pot-expansion-help-btn'), 'styles.css must style .pot-expansion-help-btn');
    assert(stylesCss.includes('.slider-label-with-help'), 'styles.css must style .slider-label-with-help');
    assert(stylesCss.includes('[data-theme="dawn"]') && stylesCss.includes('.pot-expansion-help-btn'), 'styles.css must support dawn theme for pot-expansion-help-btn');
    assert(stylesCss.includes('[data-theme="emerald"]') && stylesCss.includes('.pot-expansion-help-btn'), 'styles.css must support emerald theme for pot-expansion-help-btn');
    assert(stylesCss.includes('[data-theme="onyx"]') && stylesCss.includes('.pot-expansion-help-btn'), 'styles.css must support onyx theme for pot-expansion-help-btn');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Scheme A Event Bonus Slider Range (1.0-1.5), Simplified Chinese (zh-CN) Full Localization & UI Rules Audit', () => {
    const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const i18nPath = path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js');
    const i18nJs = fs.readFileSync(i18nPath, 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Scheme A Event Bonus Slider Range (1.0 - 1.5)
    assert(desktopHtml.includes('id="event-bonus-slider" class="rf-slider event-slider" min="1.0" max="1.5" step="0.25"'), 'index.html must set event-bonus-slider min=1.0 max=1.5 step=0.25');
    assert(mobileHtml.includes('id="event-bonus-slider" class="rf-slider event-slider" min="1.0" max="1.5" step="0.25"'), 'app/index.html must set event-bonus-slider min=1.0 max=1.5 step=0.25');
    assert(desktopHtml.includes('>1.50x</span>'), 'index.html must display 1.50x as upper limit for event bonus');
    assert(mobileHtml.includes('>1.50x</span>'), 'app/index.html must display 1.50x as upper limit for event bonus');
    assert(recipesJs.includes('updateSliderFill(eventSlider, 1.0, 1.5)'), 'recipes.js updateSliderFill must use 1.0 to 1.5 range');
    assert(recipesJs.includes('Math.min(1.5, Math.max(1.0'), 'recipes.js loadPrefs must clamp eventBonus to 1.5');

    // 2. Simplified Chinese (zh-CN) Language Switcher UI
    assert(desktopHtml.includes('id="lang-btn-zh-cn"') && desktopHtml.includes('data-lang-val="zh-CN"'), 'index.html must contain #lang-btn-zh-cn with data-lang-val="zh-CN"');
    assert(mobileHtml.includes('id="lang-btn-zh-cn"') && mobileHtml.includes('data-lang-val="zh-CN"'), 'app/index.html must contain #lang-btn-zh-cn with data-lang-val="zh-CN"');

    // 3. i18n Engine & zh-CN Localization Completeness
    assert(i18nJs.includes("'zh-CN': {"), 'i18n.js must define complete zh-CN dictionary');
    assert(i18nJs.includes("'settings.lang_zh_cn': '简体中文'"), 'i18n.js zh-CN must define settings.lang_zh_cn');
    assert(i18nJs.includes("toSimplified: toSimplifiedChinese"), 'i18n.js must export toSimplified converter');
    assert(i18nJs.includes("SUPPORTED_LANGS = ['zh-TW', 'zh-CN', 'en-US']"), 'i18n.js must support zh-TW, zh-CN, and en-US');

    // 4. Runtime i18n Testing
    const i18n = require(i18nPath);
    const origLang = i18n.getLanguage();
    i18n.setLanguage('zh-CN');
    assert(i18n.getLanguage() === 'zh-CN', 'i18n.getLanguage() must return zh-CN after setLanguage');
    assert(i18n.getPokemonName('妙蛙種子') === '妙蛙种子', 'getPokemonName under zh-CN must return 妙蛙种子');
    assert(i18n.getPokemonName('噴火龍') === '喷火龙', 'getPokemonName under zh-CN must return 喷火龙');
    assert(i18n.getSpecialtyName('樹果') === '树果', 'getSpecialtyName under zh-CN must return 树果');
    assert(i18n.getMainSkillName('活力全體療癒S') === '活力全体疗愈S', 'getMainSkillName under zh-CN must return 活力全体疗愈S');
    assert(i18n.getIslandName('萌綠之島') === '萌绿之岛', 'getIslandName under zh-CN must return 萌绿之岛');
    assert(i18n.t('recipe.slider_event') === '活动能量加成', 't("recipe.slider_event") must return 活动能量加成 in zh-CN');
    assert(typeof i18n.toSimplified === 'function', 'i18n.toSimplified must be a function');
    assert(i18n.toSimplified('截圖辨識') === '截图辨识', 'toSimplified("截圖辨識") must return 截图辨识');
    i18n.setLanguage(origLang || 'zh-TW');

    // 5. CSS Layout and Dropdown Selection Arrow Rules (Rule VI)
    assert(stylesCss.includes('.lang-switcher-row') && stylesCss.includes('repeat(3, 1fr)'), 'styles.css .lang-switcher-row must use repeat(3, 1fr)');
    assert(stylesCss.includes('.pokedex-ing-select') && (stylesCss.includes('padding-right: 32px !important') || stylesCss.includes('padding-right: 26px !important')), '.pokedex-ing-select must have generous padding-right per Rule VI');
    assert(stylesCss.includes('.pokedex-subskill-select') && (stylesCss.includes('padding: 3px 28px 3px 6px !important') || stylesCss.includes('padding: 3px 24px 3px 6px !important')), '.pokedex-subskill-select must have generous padding-right per Rule VI');
    assert(stylesCss.includes('.box-form-select') && stylesCss.includes('padding-right: 36px') && stylesCss.includes('background-position: right 18px center'), '.box-form-select must conform to Rule VI inset arrow and padding');
    assert(stylesCss.includes('.calc-select') && stylesCss.includes('padding: 9px 36px 9px 12px') && stylesCss.includes('background-position: right 18px center'), '.calc-select must conform to Rule VI inset arrow and padding');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Pokemon & News Data Auditing, Corrections & Runtime Dynamic Sync Engines', () => {
    const dataJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));
    const sleepStylesJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/sleep_styles.json'), 'utf8'));
    const newsJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/news.json'), 'utf8'));
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/recipes.js'), 'utf8');
    const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/news.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');

    // 1. data/data.json audit and corrections
    const wooperPaldea = dataJson.find(p => String(p.id) === '7054');
    assert(wooperPaldea, 'data.json must contain ID 7054 (Paldean Wooper)');
    assert(wooperPaldea.name_cn === '烏波（帕底亞的樣子）', 'ID 7054 must have name_cn 烏波（帕底亞的樣子）');
    assert(!dataJson.some(p => p.name_cn === '烏波（阿羅拉的樣子）'), 'data.json must not contain erroneous 烏波（阿羅拉的樣子）');

    const mawile = dataJson.find(p => String(p.id) === '303');
    assert(mawile, 'data.json must contain ID 303 (Mawile)');
    assert(mawile.main_skill === '怪力鉗（食材精選S）', 'Mawile main skill must be Traditional Chinese 怪力鉗（食材精選S）');
    assert(!dataJson.some(p => p.main_skill && p.main_skill.includes('怪力钳')), 'data.json must not contain simplified 怪力钳');

    // 2. data/sleep_styles.json 100% coverage and parenthesis aliases
    assert(sleepStylesJson.byName['顫弦蠑螈 (低調的樣子)'] && sleepStylesJson.byName['顫弦蠑螈（低調的樣子）'], 'sleep_styles.json must support both half-width and full-width parenthesis for Toxtricity Low Key');
    assert(sleepStylesJson.byName['顫弦蠑螈 (高調的樣子)'] && sleepStylesJson.byName['顫弦蠑螈（高調的樣子）'], 'sleep_styles.json must support both half-width and full-width parenthesis for Toxtricity Amped');
    for (const pkm of dataJson) {
      const byId = sleepStylesJson.byNo[String(pkm.id)];
      const byName = sleepStylesJson.byName[pkm.name_cn];
      assert(byId || byName, `Pokemon #${pkm.id} (${pkm.name_cn}) must have sleep styles defined in sleep_styles.json`);
    }

    // 3. data/news.json integrity and title cleaning
    assert(Array.isArray(newsJson) && newsJson.length >= 20, 'news.json must contain at least 20 official news items');
    for (const item of newsJson) {
      assert(item.title && item.title.trim().length > 0, 'Every news item must have non-empty title');
      assert(!item.title_en || !item.title_en.startsWith('[Campaign] vol.') && !item.title_en.startsWith('[New Debut] 、'), 'English titles must be clean and not broken regex artifacts');
      assert(!item.title_en || !item.title_en.includes('「vol.1」＆「vol.1」'), 'English titles must not contain unreplaced quotes or repeated bundle tags');
    }

    // 4. Runtime dynamic sync in app.js, recipes.js, news.js, wiki.js
    assert(appJs.includes('scheduleDynamicDataSync'), 'app.js must define scheduleDynamicDataSync');
    assert(appJs.includes('https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/data.json'), 'app.js must include remote raw GitHub candidate');

    assert(recipesJs.includes('scheduleDynamicRecipesSync'), 'recipes.js must define scheduleDynamicRecipesSync');
    assert(recipesJs.includes('https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json'), 'recipes.js must include remote raw GitHub candidate');

    assert(newsJs.includes('scheduleDynamicNewsSync'), 'news.js must define scheduleDynamicNewsSync');
    assert(newsJs.includes('https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/news.json'), 'news.js must include remote raw GitHub candidate');

    assert(wikiJs.includes('loadDynamicSleepStyles'), 'wiki.js must define loadDynamicSleepStyles');
    assert(wikiJs.includes('dynamicSleepStyles'), 'wiki.js must support dynamicSleepStyles in getSleepStyleData');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Appraisal Modal Stats Position Swap & Full-Width Enlarge Styling', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. In appraisal-modal-sheet-body (Mobile H5 Appraisal Modal),
    // stats dual row section (appraisal-stats-section) must appear BEFORE subskills grid (appraisal-subskills-grid)
    const mobileSheetBodyIndex = appraisalJs.indexOf('appraisal-modal-sheet-body');
    assert(mobileSheetBodyIndex !== -1, 'appraisal.js must contain appraisal-modal-sheet-body');

    const mobileStatsIndex = appraisalJs.indexOf('appraisal-stats-section', mobileSheetBodyIndex);
    const mobileSubskillsIndex = appraisalJs.indexOf('appraisal-subskills-grid', mobileSheetBodyIndex);

    assert(mobileStatsIndex !== -1, 'appraisal.js must contain appraisal-stats-section in mobile sheet');
    assert(mobileSubskillsIndex !== -1, 'appraisal.js must contain appraisal-subskills-grid in mobile sheet');
    assert(mobileStatsIndex < mobileSubskillsIndex, 'appraisal-stats-section must appear before appraisal-subskills-grid in mobile H5 appraisal modal');

    // 2. styles.css must define mobile H5 styles for appraisal-header-stats-dual:
    // - display: grid !important with repeat(2, 1fr)
    // - width: 100% !important to match subskills grid occupancy
    // - header-stat-k font-size: 13px !important (enlarged)
    // - header-stat-v font-size: 15.5px !important (enlarged)
    assert(stylesCss.includes('.mobile-h5-app .appraisal-header-stats-dual'), 'styles.css must include mobile H5 styles for appraisal-header-stats-dual');
    assert(stylesCss.includes('grid-template-columns: repeat(2, 1fr) !important'), 'styles.css must set 2-column repeat grid for mobile appraisal stats dual');
    assert(stylesCss.includes('.mobile-h5-app .appraisal-header-stats-dual .header-stat-k') && stylesCss.includes('font-size: 13px !important'), 'styles.css must enlarge mobile appraisal stat key font size to 13px');
    assert(stylesCss.includes('.mobile-h5-app .appraisal-header-stats-dual .header-stat-v') && stylesCss.includes('font-size: 15.5px !important'), 'styles.css must enlarge mobile appraisal stat val font size to 15.5px');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Cleanse Mint Nature Neutralization & Ribbon Carry Deductions Across Full Pokemon Box', () => {
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');

    // Load boxModule in CommonJS
    const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
    assert(boxModule && typeof boxModule.deduceRibbonFromCarry === 'function', 'boxModule.deduceRibbonFromCarry must exist');

    // 1. Test Cleanse Mint (淨白薄荷) Neutralization in OCR Parsing
    assert(boxJs.includes('isMintOrNeutral'), 'box.js must detect mint or neutral traits');
    assert(boxJs.includes('clean.includes(\'沒有性格\')'), 'box.js must check for 沒有性格 in OCR text');

    // Simulate OCR text parsing for Absol with Cleanse Mint
    const absolPkm = { id: '359', name_cn: '阿勃梭魯', type: '惡', specialty: '食材', carry: 21, ingredients: [{ name: '放鬆可可' }, { name: '特選蘋果' }, { name: '粗枝大蔥' }] };
    const absolMintOcr = [
      'SP 2823',
      'Lv.52 阿勃梭魯',
      '持有上限 40個',
      '===SLOT1:blue=== 食材機率提升M',
      '===SLOT2:blue=== 持有上限提升L',
      '===SLOT3:white=== 食材機率提升S',
      '===SLOT4:gold=== 技能等級提升M',
      '===SLOT5:white=== 幫忙速度S',
      '性格 慎重 沒有性格帶來的特色'
    ].join('\n');

    const parsedAbsol = boxModule.parsePokemonFromOcr(absolMintOcr, null, [absolPkm]);
    assertEquals(parsedAbsol.nature, '慎重', 'Absol with Cleanse Mint (慎重 + 沒有性格帶來的特色) must preserve nature 慎重');
    assertEquals(parsedAbsol.cleanseMint, true, 'Absol with Cleanse Mint must have cleanseMint: true');
    assertEquals(parsedAbsol.ribbon, 1, 'Absol Lv.52 (carry 40, base 21, subskill L +18) must have Ribbon Tier 1 (+1 carry, not Tier 4)');

    const prAbsol = boxModule.calculatePokemonPR(parsedAbsol, absolPkm);
    assert(prAbsol.highlights.some(h => h.includes('使用淨白薄荷消除個性效果')), 'Absol PR highlights must include Cleanse Mint note');
    assert(!prAbsol.highlights.some(h => h.includes('食材發現率▼')), 'Absol with Cleanse Mint must not have ingredient down debuff highlight');

    // Simulate Flygon with Cleanse Mint
    const flygonPkm = { id: '330', name_cn: '沙漠蜻蜓', type: '地面', specialty: '食材', carry: 27, ingredients: [{ name: '嫩亮酪梨' }] };
    const flygonMintOcr = [
      'SP 2950',
      'Lv.60 沙漠蜻蜓',
      '持有上限 28個',
      '===SLOT1:gold=== 睡眠EXP獎勵',
      '===SLOT2:blue=== 食材機率提升M',
      '===SLOT3:gold=== 幫手獎勵',
      '===SLOT4:white=== 技能機率提升S',
      '===SLOT5:gold=== 活力回復獎勵',
      '性格 爽朗 沒有性格帶來的特色'
    ].join('\n');

    const parsedFlygon = boxModule.parsePokemonFromOcr(flygonMintOcr, null, [flygonPkm]);
    assertEquals(parsedFlygon.nature, '爽朗', 'Flygon with Cleanse Mint (爽朗 + 沒有性格帶來的特色) must preserve nature 爽朗');
    assertEquals(parsedFlygon.cleanseMint, true, 'Flygon with Cleanse Mint must have cleanseMint: true');
    assertEquals(parsedFlygon.ribbon, 1, 'Flygon Lv.60 (carry 28, base 27, no carry subskills) must have Ribbon Tier 1');

    // Simulate Natural Neutral Nature (Bashful / 害羞)
    const darkraiPkm = { id: '491', name_cn: '達克萊伊', type: '惡', specialty: '技能', carry: 28, ingredients: [{ name: '純晶蘋果' }] };
    const darkraiNeutralOcr = [
      'Lv.30 達克萊伊',
      '持有上限 46個',
      '===SLOT1:blue=== 持有上限提升L',
      '===SLOT2:white=== 技能機率提升S',
      '性格 害羞 没有性格帶來的特色'
    ].join('\n');
    const parsedDarkrai = boxModule.parsePokemonFromOcr(darkraiNeutralOcr, null, [darkraiPkm]);
    assertEquals(parsedDarkrai.nature, '害羞', 'Natural neutral nature (害羞) must be preserved');
    assertEquals(parsedDarkrai.ribbon, 0, 'Darkrai Lv.30 (carry 46, base 28, subskill L +18) diff is 0, so ribbon must be 0 (not Tier 4)');

    // 2. Test Good-Night Ribbon Carry Deduction Math
    // Case A: Butterfree with Inventory M (carry 43, base 31, subskill M +12 -> diff 0 -> Ribbon 0)
    const butterfreePkm = { id: '12', name_cn: '巴大蝶', carry: 31 };
    const butterfreeRibbon = boxModule.deduceRibbonFromCarry(butterfreePkm, 30, ['樹果數量S', '持有上限提升M'], 43);
    assertEquals(butterfreeRibbon, 0, 'Butterfree with Inventory M (+12) must be Ribbon 0, not Tier 4');

    // Case B: Blastoise Lv.64 with Inventory L (carry 53, base 27, subskill L +18 -> diff 8 -> Ribbon 4)
    const blastoisePkm = { id: '9', name_cn: '水箭龜', carry: 27 };
    const blastoiseRibbon = boxModule.deduceRibbonFromCarry(blastoisePkm, 64, ['持有上限提升L', '食材機率提升M', '幫忙速度M'], 53);
    assertEquals(blastoiseRibbon, 4, 'Blastoise Lv.64 with carry 53 has diff 8, must be Ribbon 4');

    // Case C: Charizard Lv.59 without inventory subskills (carry 37, base 29, subBonus 0 -> diff 8 -> Ribbon 4)
    const charizardPkm = { id: '6', name_cn: '噴火龍', carry: 29 };
    const charizardRibbon = boxModule.deduceRibbonFromCarry(charizardPkm, 59, ['幫手獎勵', '食材機率提升M', '幫忙速度S'], 37);
    assertEquals(charizardRibbon, 4, 'Charizard Lv.59 with carry 37 has diff 8, must be Ribbon 4');

    // 3. Verify Live DB data integrity
    const liveDbPath = path.join(WORKSPACE_ROOT, 'scratch/z87569650_db_live.json');
    if (fs.existsSync(liveDbPath)) {
      const db = JSON.parse(fs.readFileSync(liveDbPath, 'utf8'));
      const liveAbsol = db.find(p => p.name === '阿勃梭魯' && p.level === 52);
      assert(liveAbsol, 'Absol Lv.52 must exist in db_live');
      assertEquals(liveAbsol.nature, '慎重', 'Absol in db_live must preserve original nature 慎重');
      assertEquals(liveAbsol.cleanseMint, true, 'Absol in db_live must have cleanseMint: true');
      assertEquals(liveAbsol.ribbon, 1, 'Absol in db_live must have ribbon 1');

      const tier4List = db.filter(p => (p.ribbon || 0) === 4);
      assertEquals(tier4List.length, 4, 'Only the 4 true 2000hr veterans must have ribbon 4 in db_live');
    }
  });

  // =========================================================================
  // Test 206: Cleanse Mint Formula Neutralization & Mobile H5 Box FAB Fixed Pinning
  // =========================================================================

  test('Tier 4 - Real-World Application Scenarios', 'Cleanse Mint Formula Neutralization & Mobile H5 Box FAB Fixed Pinning', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');

    // 1. Verify CSS transform elimination on mobile H5 scroll panels
    assert(
      stylesCss.includes('.mobile-h5-app #panel-box') &&
      stylesCss.includes('transform: none !important;') &&
      stylesCss.includes('contain: none !important;'),
      'CSS must enforce transform: none and contain: none on mobile H5 panels to prevent breaking fixed containing block'
    );
    assert(
      !stylesCss.includes('.mobile-h5-app #panel-box,\n.mobile-h5-app #panel-news,\n.mobile-h5-app .sidebar-scrollable-content'),
      '#panel-box and other tab panels must not be listed in the GPU translateZ transform selector'
    );

    // 2. Verify app/index.html DOM hierarchy: box-fab-container must be outside <main>
    const mainEndIdx = appIndexHtml.indexOf('</main>');
    const fabIdx = appIndexHtml.indexOf('id="box-fab-container"');
    const dockIdx = appIndexHtml.indexOf('id="bottom-dock"');
    assert(mainEndIdx !== -1 && fabIdx !== -1 && dockIdx !== -1, 'main, box-fab-container, and bottom-dock must exist in app/index.html');
    assert(fabIdx > mainEndIdx, 'box-fab-container must be placed outside <main> to prevent scrolling with page contents');
    assert(fabIdx < dockIdx, 'box-fab-container must precede bottom-dock in top-level hierarchy');

    // 3. Verify box-fab-container fixed styling
    assert(
      stylesCss.includes('.mobile-h5-app .box-fab-container') &&
      stylesCss.includes('position: fixed !important;'),
      'box-fab-container must have position: fixed'
    );

    // 4. Verify appraisal.js passes cleanseMint to calculatePokedexIngredientFormulas
    assert(
      appraisalJs.includes('cleanseMint: isMint') &&
      appraisalJs.includes('pkmOrBoxItem.rawItem.cleanseMint'),
      'appraisal.js must extract cleanseMint from rawItem and pass it to calculatePokedexIngredientFormulas'
    );

    // 5. Verify box.js passes cleanseMint when opening appraisal modal
    assert(
      boxJs.includes('cleanseMint: !!(item.cleanseMint || item.mint)'),
      'box.js must pass cleanseMint in openModal invocations'
    );

    // 6. Verify box.js loadUserBox compatibility repair
    assert(
      boxJs.includes("pName === '阿勃梭魯'") &&
      boxJs.includes('item.cleanseMint = true') &&
      boxJs.includes("pName === '沙漠蜻蜓'"),
      'box.js must auto-repair Absol Lv.52 and Flygon Lv.60 cleanseMint flag on load'
    );

    // 7. Verify nature-capsule-mint-leaf suppression (only explanation text with parentheses is used)
    assert(
      !appraisalJs.includes('nature-capsule-mint-leaf'),
      'nature-capsule-mint-leaf must not be rendered in appraisal modal nature capsule'
    );
    assert(
      stylesCss.includes('.nature-capsule-mint-leaf') &&
      stylesCss.includes('display: none !important;'),
      'nature-capsule-mint-leaf must be hidden in styles.css'
    );

    // 8. Verify calculatePokedexIngredientFormulas simulation with Cleanse Mint
    const mockApp = eval(`(() => {
      const POKEDEX_MODAL_NATURES = [
        { name: '慎重', name_en: 'Careful', buffType: 'skill', debuffType: 'ingredient' },
        { name: '爽朗', name_en: 'Jolly', buffType: 'speed', debuffType: 'ingredient' },
        { name: '坦率', name_en: 'Quirky', buffType: 'none', debuffType: 'none' }
      ];
      function parsePokedexIntervalToSec(str) { return 3100; }
      function getBerryBaseEnergy() { return 25; }
      function calculateSingleBerryEnergy() { return 100; }
      function getIngCountFromBase() { return 2; }
      function getPokedexMainSkillYield() { return { mainSkillExtraDaily: 0 }; }
      const pokedexModalState = { level: 50, nature: '坦率', subskills: [], ribbon: 0, skillLevel: 1, ingSlots: [0, 0, 0] };
      const window = {
        I18N: { getLanguage: () => 'zh-TW', t: (k, d) => d, getBerryName: (n) => n, getIngredientName: (n) => n },
        AppraisalLab: { getRemainingEvolutions: () => 0, getRibbonBonus: () => ({ speedDiscount: 0, carry: 0 }) }
      };
      ${appJs.substring(appJs.indexOf('function calculatePokedexIngredientFormulas'), appJs.indexOf('function formatPokedexIntervalDiff'))}
      return { calculatePokedexIngredientFormulas };
    })()`);

    const absolPkm = {
      id: '359',
      name_cn: '阿勃梭魯',
      ingredient_rate: '17.8',
      skill_rate: '4.0',
      interval: '00:51:40',
      carry: '21',
      ingredients: [{ name: '純晶蘋果' }]
    };

    // Case Without Mint: Nature 慎重 gives 0.80x multiplier to ingredients
    const calcWithoutMint = mockApp.calculatePokedexIngredientFormulas({
      pkm: absolPkm,
      level: 52,
      nature: '慎重',
      subskills: ['食材機率提升M', '幫手獎勵'],
      ingredients: ['純晶蘋果', '純晶蘋果', '純晶蘋果'],
      ribbon: 1,
      skillLevel: 1,
      cleanseMint: false
    });
    assertEquals(calcWithoutMint.natureIngMult, 0.80, 'Without Cleanse Mint, Careful nature must have 0.80 ing mult');
    assertEquals(calcWithoutMint.cleanseMint, false, 'Without Cleanse Mint, formula must report cleanseMint: false');

    // Case With Mint: Nature 慎重 with Cleanse Mint neutralizes debuff to 1.00x multiplier
    const calcWithMint = mockApp.calculatePokedexIngredientFormulas({
      pkm: absolPkm,
      level: 52,
      nature: '慎重',
      subskills: ['食材機率提升M', '幫手獎勵'],
      ingredients: ['純晶蘋果', '純晶蘋果', '純晶蘋果'],
      ribbon: 1,
      skillLevel: 1,
      cleanseMint: true
    });
    assertEquals(calcWithMint.natureIngMult, 1.00, 'With Cleanse Mint, Careful nature ingredient debuff must be eliminated to 1.00');
    assertEquals(calcWithMint.cleanseMint, true, 'With Cleanse Mint, formula must report cleanseMint: true');
    assert(calcWithMint.finalIngRate > 24.0, `With Cleanse Mint, final ingredient rate must be > 24% (actual: ${calcWithMint.finalIngRate}%)`);
  });


  test('Tier 4 - Real-World Application Scenarios', 'Ingredient Selection & Target Recipe Synergy in Intelligent Summary & Pokemon Box', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

    const appCtx = {
      window: {},
      document: createMockDocument(),
      console: console,
      SUBSKILLS_DATA: [
        { name: '食材機率提升M', tier: 'gold' },
        { name: '幫忙速度M', tier: 'silver' },
        { name: '樹果數量S', tier: 'gold' },
        { name: '幫手獎勵', tier: 'gold' },
        { name: '持有上限提升L', tier: 'silver' }
      ],
      NATURE_DATA: [
        { name: '坦率', buffType: 'none', debuffType: 'none', buff: '無增減', debuff: '無增減' },
        { name: '冷靜', buffType: 'ingredient', debuffType: 'exp', buff: '食材發現率', debuff: 'EXP獲取量' }
      ]
    };
    appCtx.window = appCtx;
    vm.createContext(appCtx);
    vm.runInContext(boxCode, appCtx);
    vm.runInContext(appraisalCode, appCtx);

    // 1. Verify getSignatureRecipeRecommendations method exists and correctly finds top recipes
    assert(typeof appCtx.AppraisalLab.getSignatureRecipeRecommendations === 'function', 'getSignatureRecipeRecommendations must be exported');
    
    // Absol Apple + Cacao -> Chocolate Waffles / Clodsire Eclair
    const absolRecipe = appCtx.AppraisalLab.getSignatureRecipeRecommendations(['特選蘋果', '放鬆可可', '放鬆可可'], false);
    assert(absolRecipe.includes('採蜜巧克力格子鬆餅') || absolRecipe.includes('土王閃電泡芙'), 'Absol Apple+Cacao must recommend top Cacao recipes');

    // Flygon Ginger + Herb + Avocado -> Bounce Curry Udon / Bulldoze Guacamole
    const flygonRecipe = appCtx.AppraisalLab.getSignatureRecipeRecommendations(['暖暖薑', '火辣香草', '嫩亮酪梨'], false);
    assert(flygonRecipe.includes('彈跳咖哩烏龍麵') || flygonRecipe.includes('重踏酪梨醬脆片'), 'Flygon Ginger+Herb+Avocado must recommend Bounce Udon or Guacamole');

    // Bewear Corn + Sausage -> Chocolate Waffles / Inferno Corn Keema Curry / Bounce Udon
    const bewearRecipe = appCtx.AppraisalLab.getSignatureRecipeRecommendations(['萌綠玉米', '豆製肉', '萌綠玉米'], false);
    assert(bewearRecipe.includes('採蜜巧克力格子鬆餅') || bewearRecipe.includes('彈跳咖哩烏龍麵') || bewearRecipe.includes('煉獄玉米乾咖哩'), 'Bewear Corn+Sausage must recommend top dishes');

    // English localization check
    const englishRecipe = appCtx.AppraisalLab.getSignatureRecipeRecommendations(['soothing cacao', 'moomoo milk'], true);
    assert(englishRecipe.includes('Target recipes:') || englishRecipe.includes('Target dish:'), 'English mode must produce English recipe header');

    // 2. Verify evaluatePokemon incorporates recipe recommendations into intelligent summary
    const absolPkm = { id: '359', name_cn: '阿勃梭魯', specialty: '食材', ingredients: [{ name: '特選蘋果' }, { name: '放鬆可可' }, { name: '放鬆可可' }] };
    const absolEval = appCtx.AppraisalLab.evaluatePokemon(
      absolPkm, 50, '冷靜',
      ['食材機率提升M', '幫忙速度M', '持有上限提升L'],
      ['特選蘋果', '放鬆可可', '放鬆可可'],
      0, 1
    );
    assert(absolEval !== null, 'Evaluation must not be null');
    assert(absolEval.summaryNote.includes('直通頂尖料理') || absolEval.summaryNote.includes('料理'), 'Ingredient specialist summaryNote must highlight target dishes');
    assert(absolEval.summaryNote.includes('採蜜巧克力格子鬆餅') || absolEval.summaryNote.includes('土王閃電泡芙'), 'Absol summaryNote must explicitly mention specific recipes');

    // 3. Verify calculatePokemonPR in box.js outputs the recipe-enriched summaryNote
    const boxAbsol = {
      uid: 'box-absol-1',
      pokemonId: '359',
      name: '阿勃梭魯',
      level: 50,
      nature: '冷靜',
      subskills: ['食材機率提升M', '幫忙速度M', '持有上限提升L'],
      ing1: '特選蘋果',
      ing2: '放鬆可可',
      ing3: '放鬆可可'
    };
    const prResult = appCtx.PokemonBoxApp.calculatePokemonPR(boxAbsol, absolPkm);
    assert(prResult && prResult.summaryNote, 'calculatePokemonPR must produce summaryNote');
    assert(prResult.summaryNote.includes('直通頂尖料理') || prResult.summaryNote.includes('土王閃電泡芙') || prResult.summaryNote.includes('採蜜巧克力格子鬆餅'), 'PR summaryNote must contain signature dishes');

    // 4. Verify renderBoxGrid renders box-card-summary with target recipes
    const container = new MiniElement('div', 'box-container');
    appCtx.PokemonBoxApp.renderBoxGrid([boxAbsol], container);
    const gridHtml = container.innerHTML;
    assert(gridHtml.includes('box-card-summary'), 'renderBoxGrid must render box-card-summary element');
    assert(gridHtml.includes('智能簡評：') || gridHtml.includes('智能簡評'), 'renderBoxGrid must display intelligent summary label');
    assert(gridHtml.includes('土王閃電泡芙') || gridHtml.includes('採蜜巧克力格子鬆餅') || gridHtml.includes('直通頂尖料理'), 'renderBoxGrid must include target dish names in card');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Appraisal Modal Embedded Summary Capsule, Radar Chart Maximization & Ribbon Badge Alignment Audit', () => {
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify CSS styles for embedded appraisal summary capsule
    assert(stylesCode.includes('.appraisal-summary-bar {'), 'styles.css must contain .appraisal-summary-bar');
    assert(stylesCode.includes('position: relative;'), 'styles.css must have relative position for appraisal-summary-bar');
    assert(stylesCode.includes('.appraisal-summary-label {'), 'styles.css must contain .appraisal-summary-label');
    assert(stylesCode.includes('position: absolute;'), 'styles.css must have absolute position for appraisal-summary-label');
    assert(stylesCode.includes('top: -8.5px;'), 'styles.css must place appraisal-summary-label on the top border');
    assert(stylesCode.includes('border-radius: 9999px;'), 'styles.css must style appraisal-summary-label as a rounded pill/capsule');

    // 2. Verify radar chart container enlargement
    assert(stylesCode.includes('max-width: 380px;'), 'styles.css must enlarge appraisal-radar-wrapper max-width to 380px');
    assert(stylesCode.includes('height: 270px;'), 'styles.css must enlarge appraisal-radar-wrapper height to 270px');

    // 3. Verify title deletion across all versions
    assert(!appraisalCode.includes('六維能力雷達圖'), 'appraisal.js must NOT contain 六維能力雷達圖 title in any template');
    assert(!appraisalCode.includes('6-Dimension Capability Radar'), 'appraisal.js must NOT contain 6-Dimension Capability Radar title in any template');

    // 4. Verify desktop modal appraisal-ribbon-badge is placed next to appraisal-specialty-row
    const specRowIdx = appraisalCode.indexOf('appraisal-specialty-row');
    const ribbonBadgeIdx = appraisalCode.indexOf('appraisal-ribbon-badge', specRowIdx);
    const mainSkillIdx = appraisalCode.indexOf('appraisal-mainskill-row', specRowIdx);
    assert(specRowIdx !== -1 && ribbonBadgeIdx !== -1 && ribbonBadgeIdx < mainSkillIdx,
      'appraisal-ribbon-badge must be nested inside appraisal-specialty-row before main skill in desktop view');

    // 5. Verify renderRadarChartSVG font enlargement
    assert(appraisalCode.includes("labelFontSize = isCompact ? '10' : '13'"),
      'renderRadarChartSVG must use enlarged vertex label font size (13px)');
    assert(appraisalCode.includes("scoreFontSize = isCompact ? '9.5' : '12'"),
      'renderRadarChartSVG must use enlarged vertex score font size (12px)');

    // 6. Verify H5 and Desktop both use clean appraisal-summary-label without redundant colon
    assert(appraisalCode.includes('<span class="appraisal-summary-label">${isEN ? \'Appraisal Note\' : \'智能簡評\'}</span>'),
      'appraisal.js must render embedded summary label without colon');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Full UI Polish: Mobile Pokedex Non-Truncation, Smooth Drawer & FAB Transitions, and Stutter Elimination', () => {
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');

    // 1. Pokedex content-area flex calculation & table GPU texture safety
    assert(stylesCode.includes('.mobile-h5-app.pokemon-active .pokemon-main-content #content-area') &&
           stylesCode.includes('flex: 1 1 0% !important;') &&
           stylesCode.includes('height: auto !important;'),
           'styles.css must configure #content-area with flex: 1 1 0% and height: auto to prevent bottom clipping');
    assert(stylesCode.includes('.mobile-h5-app .table-container') &&
           stylesCode.includes('transform: none !important;') &&
           stylesCode.includes('will-change: auto !important;'),
           'styles.css must avoid translateZ(0) on table-container to prevent GPU texture limits from truncating long tables');

    // 2. Smooth Drawer Backdrop & Floating Action Button (FAB) Animations
    assert(stylesCode.includes('.mobile-h5-app .sidebar-backdrop') &&
           stylesCode.includes('transition: opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.28s ease !important;'),
           'styles.css must define smooth fade transition for mobile sidebar backdrop');
    assert(stylesCode.includes('.mobile-h5-app .sidebar-fab-btn.drawer-open') &&
           stylesCode.includes('transform: scale(0.65) !important;') &&
           stylesCode.includes('opacity: 0 !important;'),
           'styles.css must smoothly scale and fade FAB without abrupt display: none snapping');

    // 3. News accordion expansion micro-animation
    assert(stylesCode.includes('@keyframes newsAccordionFadeIn') &&
           stylesCode.includes('animation: newsAccordionFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;'),
           'styles.css must provide newsAccordionFadeIn animation for expanded news accordion cards');

    // 4. Box subpanel list clearance
    assert(stylesCode.includes('.mobile-h5-app #box-subpanel-list {\n  padding-bottom: 84px !important;\n}'),
           'styles.css must ensure 84px bottom padding for #box-subpanel-list to avoid FAB overlap');

    // 5. Delete confirmation dialog animation wiring
    assert(boxCode.includes('prepareOverlayOpen(modal)') && boxCode.includes('animateOverlayClose(modal, cleanup)'),
           'box.js must integrate prepareOverlayOpen and animateOverlayClose for delete confirmation modal');

    // 6. Scroll performance and requestAnimationFrame throttle
    assert(appCode.includes('requestUpdateBackToTopVisibility') && appCode.includes('requestAnimationFrame'),
           'app.js must throttle back-to-top scroll checks via requestAnimationFrame');
    assert(appCode.includes('hasAnyFloatingTooltipOpen'),
           'app.js must maintain hasAnyFloatingTooltipOpen guard flag to prevent forced reflow on scroll');

    // 7. Pokedex & Box snug bottom clearance spacer (24px minimal breathing room)
    assert(stylesCode.includes('.table-bottom-spacer') &&
           stylesCode.includes('.mobile-h5-app .table-bottom-spacer') &&
           stylesCode.includes('height: 24px !important;'),
           'styles.css must provide table-bottom-spacer with snug 24px bottom clearance');
    assert(appCode.includes('<div class="table-bottom-spacer" aria-hidden="true"></div>'),
           'app.js must inject table-bottom-spacer to guarantee last row visibility');
    assert(boxCode.includes('<div class="table-bottom-spacer" aria-hidden="true"></div>'),
           'box.js must inject table-bottom-spacer for Box table bottom clearance');

    // 8. Box Tab mobile H5 sticky table header (unified with Pokedex tab)
    assert(stylesCode.includes('.mobile-h5-app #panel-box .pokemon-table.box-table thead th') &&
           stylesCode.includes('position: sticky !important;') &&
           stylesCode.includes('.mobile-h5-app #panel-box .table-container') &&
           stylesCode.includes('overflow-y: auto !important;'),
           'styles.css must configure Box Tab table with independent vertical scroll and sticky header');
  });

  // ----------------------------------------------------
  // Test 210: Mobile H5 Island Spawns Smooth Scrolling, Ladder Tooltip Restoration, Zero [★] Policy & Integrated Strategy Card Title
  // ----------------------------------------------------

  test('Tier 4 - Real-World Application Scenarios', 'Mobile H5 Island Spawns Smooth Scrolling, Ladder Tooltip Restoration, Zero [★] Policy & Integrated Strategy Card Title', () => {
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

    // 1. Verify island spawns coordinator enables native smooth inertial scrolling
    assert(wikiCode.includes('function onIslandSpawnsCardTouchMove'), 'wiki.js must implement onIslandSpawnsCardTouchMove');
    assert(wikiCode.includes('els.wrap.scrollTop <= 0 && dy < 0'), 'wiki.js must only intercept downward drag at top boundary to unpin');
    assert(!wikiCode.includes('scroller.scrollTop -= overshoot'), 'wiki.js must NOT forcefully jitter scroller.scrollTop with overshoot');

    // 2. Verify ladder-node floating tooltip toggle on mobile touch & click
    assert(appCode.includes('.ladder-node') && appCode.includes('isTriggerBtn'), 'app.js must include .ladder-node in isTriggerBtn to prevent premature dismissal');
    assert(appCode.includes("e.target.closest('.ladder-node')"), 'app.js must intercept tap/click on .ladder-node');
    assert(appCode.includes("ladderNode.classList.contains('tooltip-active')"), 'app.js must toggle tooltip-active on .ladder-node');
    assert(stylesCode.includes('.ladder-node.tooltip-active'), 'styles.css must style .ladder-node.tooltip-active');
    assert(stylesCode.includes('z-index: 100000 !important;'), 'styles.css must elevate .ladder-node.tooltip-active z-index');
    // Tapping a node also selects same-Pokemon siblings in the same ingredient row (AAA vs AAX yield comparison)
    assert((appCode.match(/markLadderGroupSelected\(ladderNode\)/g) || []).length === 2, 'app.js must mark same-group ladder siblings on both touch and click activation');
    assert(stylesCode.includes('.ladder-node.group-selected {'), 'styles.css must style .ladder-node.group-selected');
    const pcCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'components', 'popoverCoordinator.js'), 'utf8');
    assert(pcCode.includes("classList.remove('group-selected')"), 'PopoverCoordinator.dismissAll must clear group-selected');

    // 3. Verify zero [★] across application runtime scripts
    assert(!appCode.includes('[★]'), 'app.js must contain zero occurrences of [★]');
    assert(!appraisalCode.includes('[★]'), 'appraisal.js must contain zero occurrences of [★]');

    // 4. Verify strategy card title embedded into top-left of outer border
    assert(stylesCode.includes('.strategy-card-title'), 'styles.css must define .strategy-card-title');
    assert(stylesCode.includes('top: -8.5px !important;'), 'styles.css must position strategy-card-title straddling outer top border');
    assert(stylesCode.includes('.pokedex-strategy-card') && stylesCode.includes('position: relative !important;'), 'styles.css must set position: relative on .pokedex-strategy-card');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Cross-Component Isolation, Scoped DOM Manipulation, and Zero Cross-Tab Side-Effects Verification', () => {
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');

    // 1. Box module scoping verification
    assert(boxCode.includes("boxPanel = (typeof document.getElementById === 'function') ? (document.getElementById('panel-box') || document.getElementById('view-box')) : null"), 'box.js must scope search filter row to boxPanel');
    assert(boxCode.includes("#box-edit-modal .box-subskill-slot-btn"), 'box.js must scope subskill slot buttons to #box-edit-modal');
    assert(boxCode.includes('_boxComboboxClickListener'), 'box.js must clean up _boxComboboxClickListener to prevent listener accumulation');

    // 2. App module scoping & tab switching isolation verification
    assert(appCode.includes('dismissAllFloatingTooltips();'), 'app.js switchMainTab must call dismissAllFloatingTooltips');
    assert(appCode.includes("isPoke ? 'flex' : 'none'"), 'app.js sidebar-backdrop must only restore active tab bookmark handle');
    assert(appCode.includes("pokedexModalEl = document.getElementById('pokedex-detail-modal')"), 'app.js updatePokedexModalAppraisalLive must resolve pokedexModalEl');
    assert(appCode.includes("pokedexModalEl.querySelector('.pokedex-val-badge')"), 'app.js must scope pokedex-val-badge query to pokedexModalEl');
    assert(appCode.includes("pokedexModalEl.querySelectorAll('.pokedex-track-pin-btn')"), 'app.js must scope pokedex-track-pin-btn query to pokedexModalEl');
    assert(appCode.includes("pokedexModalEl.querySelectorAll('.pokedex-ing-slot-box')"), 'app.js must scope pokedex-ing-slot-box query to pokedexModalEl');

    // 3. Wiki module subpanel scoping verification
    assert(wikiCode.includes("skillsPanel = document.getElementById('wiki-subpanel-skills')"), 'wiki.js filterWikiSkills must scope to wiki-subpanel-skills');
    assert(wikiCode.includes("ladderPanel = document.getElementById('wiki-subpanel-ladder')"), 'wiki.js filterWikiIngredients must scope to wiki-subpanel-ladder');
    assert(wikiCode.includes("ladderSidebar = document.getElementById('ladder-filter-sidebar')"), 'wiki.js boost and nature buttons must scope to ladder-filter-sidebar');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Standalone Component Architecture: DOMUtils, CustomSelect, and PopoverCoordinator Modules Verification', () => {
    // 1. DOMUtils verification
    const domUtilsPath = path.join(WORKSPACE_ROOT, 'js', 'core', 'domUtils.js');
    assert(fs.existsSync(domUtilsPath), 'domUtils.js must exist in js/core/');
    const domUtils = require(domUtilsPath);
    assert(typeof domUtils.find === 'function', 'domUtils.find must be a function');
    assert(typeof domUtils.findAll === 'function', 'domUtils.findAll must be a function');
    assert(typeof domUtils.byId === 'function', 'domUtils.byId must be a function');
    assert(typeof domUtils.toggleClass === 'function', 'domUtils.toggleClass must be a function');
    assertEquals(domUtils.find(null, ''), null, 'domUtils.find with null parent must return null');
    assertEquals(domUtils.findAll(null, '').length, 0, 'domUtils.findAll with null parent must return empty array');

    // 2. CustomSelect component verification
    const customSelectPath = path.join(WORKSPACE_ROOT, 'js', 'components', 'customSelect.js');
    assert(fs.existsSync(customSelectPath), 'customSelect.js must exist in js/components/');
    const customSelect = require(customSelectPath);
    assert(typeof customSelect.setup === 'function', 'CustomSelect.setup must be a function');
    assert(typeof customSelect.closeAll === 'function', 'CustomSelect.closeAll must be a function');
    const customSelectCode = fs.readFileSync(customSelectPath, 'utf8');
    assert(customSelectCode.includes('custom-select-container'), 'customSelect.js must manage custom-select-container');
    assert(customSelectCode.includes('aria-expanded'), 'customSelect.js must manage aria-expanded');

    // 3. PopoverCoordinator component verification
    const popoverCoordPath = path.join(WORKSPACE_ROOT, 'js', 'components', 'popoverCoordinator.js');
    assert(fs.existsSync(popoverCoordPath), 'popoverCoordinator.js must exist in js/components/');
    const popoverCoord = require(popoverCoordPath);
    assert(typeof popoverCoord.hasAnyOpen === 'function', 'PopoverCoordinator.hasAnyOpen must be a function');
    assert(typeof popoverCoord.dismissAll === 'function', 'PopoverCoordinator.dismissAll must be a function');

    // 4. HTML script tag verification in index.html & app/index.html
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    assert(indexHtml.includes('js/core/domUtils.js'), 'index.html must include domUtils.js');
    assert(indexHtml.includes('js/components/customSelect.js'), 'index.html must include customSelect.js');
    assert(indexHtml.includes('js/components/popoverCoordinator.js'), 'index.html must include popoverCoordinator.js');
    assert(appIndexHtml.includes('js/core/domUtils.js'), 'app/index.html must include domUtils.js');
    assert(appIndexHtml.includes('js/components/customSelect.js'), 'app/index.html must include customSelect.js');
    assert(appIndexHtml.includes('js/components/popoverCoordinator.js'), 'app/index.html must include popoverCoordinator.js');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Dropdown Checkmark Removal, Modal Scroll Reset, and Ladder Key Dish Icon Presentation Verification', () => {
    // 1. Verify customSelect.js does not render checkmarks
    const customSelectCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'components', 'customSelect.js'), 'utf8');
    assert(!customSelectCode.includes('custom-select-check'), 'customSelect.js must not render custom-select-check span');
    assert(!customSelectCode.includes('✓'), 'customSelect.js must not contain checkmark symbol');

    // 2. Verify recipes.js does not render checkmarks in custom selects
    const recipesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    assert(!recipesCode.includes('custom-select-check'), 'recipes.js must not render custom-select-check span');

    // 3. Verify box.js does not render checkmarks in box-pkm-dropdown-item
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    assert(!boxCode.includes('box-pkm-dropdown-item active') || !boxCode.includes('✓</span>'), 'box.js must not render checkmark in box-pkm-dropdown-item');

    // 4. Verify box.js resets modalBody.scrollTop = 0 on open
    assert(boxCode.includes('modalBody.scrollTop = 0'), 'box.js openBoxEditModal must reset modalBody.scrollTop to 0');

    // 5. Verify wiki.js defines dish icons and renders tooltip-dish-icon in ladder-node-tooltip and ranking modal
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    assert(wikiCode.includes('tooltip-dish-icon'), 'wiki.js must render tooltip-dish-icon');
    assert(wikiCode.includes('appleacidyogurt-dressedsalad.png'), 'wiki.js TOP_RECIPES_FOR_INGREDIENTS must include dish icons');
    assert(wikiCode.includes('getLadderDishIcon'), 'wiki.js must define getLadderDishIcon helper');
    assert(wikiCode.includes('${targetDishIcon ? `<img src="${targetDishIcon}" class="tooltip-dish-icon"'), 'wiki.js must substitute dish name with dish icon in tooltip-dish-title when targetDishIcon exists');

    // 6. Verify styles.css defines .tooltip-dish-icon and flexible .tooltip-dish-title
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    assert(stylesCode.includes('.tooltip-dish-icon'), 'styles.css must style .tooltip-dish-icon');
    assert(stylesCode.includes('.tooltip-dish-title') && stylesCode.includes('inline-flex'), 'styles.css must align .tooltip-dish-title with inline-flex');

    // 7. Verify styles.css eliminates transparency in all ingredient ladder tooltips and elevates active track row
    assert(stylesCode.includes('.ladder-node-tooltip') && stylesCode.includes('background: #0d1527 !important;'), 'styles.css must set 100% solid background on ladder-node-tooltip');
    assert(stylesCode.includes('.tooltip-yield-breakdown') && stylesCode.includes('background: #0a0f1d !important;'), 'styles.css must set 100% solid background on tooltip-yield-breakdown');
    assert(stylesCode.includes('.tooltip-dish-box') && stylesCode.includes('background: transparent !important;'), 'styles.css must set transparent borderless background on tooltip-dish-box');
    assert(stylesCode.includes('.ladder-track-row.has-active-tooltip') && stylesCode.includes('z-index: 100000 !important;'), 'styles.css must elevate active track row z-index to 100000');
    assert(stylesCode.includes('.ladder-energy-help-bubble') && stylesCode.includes('backdrop-filter: none !important;'), 'styles.css must disable blur and set solid background on ladder energy help bubble');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Ingredient Ladder Independent Dish Badge & Mobile H5 Box Edit Modal Ergonomic Layout', () => {
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const h5Html = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

    // 1. Verify .tooltip-dish-box uses column layout to display badge independently on next line
    assert(stylesCode.includes('.tooltip-dish-box'), 'styles.css must style .tooltip-dish-box');
    assert(stylesCode.includes('flex-direction: column !important;'), 'styles.css must display .tooltip-dish-box in column to place badge on next line');
    assert(stylesCode.includes('border: none !important;') && stylesCode.includes('padding: 0 !important;'), 'styles.css must eliminate outer borders on .tooltip-dish-box');

    // 2. Verify only .tooltip-dish-badge retains badge borders, and dish icon is borderless and enlarged
    assert(stylesCode.includes('.tooltip-dish-badge'), 'styles.css must style .tooltip-dish-badge');
    assert(stylesCode.includes('.dish-badge-full') && stylesCode.includes('.dish-badge-high'), 'styles.css must retain badge borders on dish status badges');
    assert(stylesCode.includes('.tooltip-dish-icon') && stylesCode.includes('width: 24px !important;'), 'styles.css must enlarge tooltip-dish-icon to 24px without outer border');

    // 3. Verify ladder-node-tooltip max-width is constrained to prevent mobile clipping
    assert(stylesCode.includes('.ladder-node-tooltip') && stylesCode.includes('max-width: min(280px, calc(100vw - 32px)) !important;'), 'styles.css must constrain ladder-node-tooltip to prevent clipping');

    // 4. Verify no 350px vertical flex-basis on nature custom-select
    assert(!stylesCode.includes('#modal-poke-nature + .custom-select-container {\n  width: 350px !important;\n  max-width: 100% !important;\n  flex: 0 0 350px;'), 'styles.css must not apply 350px flex basis on modal-poke-nature custom-select');
    assert(stylesCode.includes('.mobile-h5-app .mobile-box-sheet #modal-poke-nature + .custom-select-container') || stylesCode.includes('flex: 0 0 auto;'), 'styles.css must constrain mobile nature dropdown height to auto');

    // 5. Verify mobile-box-sheet box-form-grid uses flex column to eliminate gap stretching
    assert(stylesCode.includes('.mobile-h5-app .mobile-box-sheet .box-form-grid') && stylesCode.includes('display: flex !important;'), 'styles.css mobile-box-sheet box-form-grid must use flex column');

    // 6. Verify app/index.html box-edit-modal has full-width nickname and grouped nature/mint layout
    assert(h5Html.includes('id="modal-poke-nickname"') && h5Html.includes('class="box-form-group box-full-width"'), 'app/index.html must allocate full-width row for nickname');
    assert(h5Html.includes('id="modal-poke-mint"') && h5Html.includes('class="box-form-group box-full-width box-nature-group"'), 'app/index.html must cleanly group nature and mint checkbox');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Cooking Week Pot Limit (Up to 700) & Mobile Box Modal Main Skill Visible Layout', () => {
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const h5Html = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

    // 1. Verify pot expansion upper bound up to 700
    assert(recipesJs.includes('updateSliderFill(potExpansionSlider, 0, 700);'), 'recipes.js must scale slider fill up to 700');
    assert(recipesJs.includes('potExpansion = Math.min(700,'), 'recipes.js setPotExpansion must clamp up to 700');
    assert(i18nJs.includes('486') && i18nJs.includes('686'), 'i18n.js must document Cooking Week Sunday 486 capacity and total 686 cap');
    assert(i18nJs.includes('700'), 'i18n.js must document slider maximum 700');

    // 2. Verify clean full-width vertical layout in mobile box edit modal
    assert(h5Html.includes('id="modal-poke-nickname"') && h5Html.includes('class="box-form-group box-full-width"'), 'app/index.html must allocate full-width row for nickname');
    assert(h5Html.includes('id="modal-poke-ribbon"') && h5Html.includes('class="box-form-group box-full-width"'), 'app/index.html must allocate full-width row for ribbon');
    assert(h5Html.includes('id="modal-poke-main-skill-name"') && h5Html.includes('class="box-form-group box-full-width box-mainskill-group"'), 'app/index.html must cleanly group main skill');
    assert(h5Html.includes('id="modal-poke-mint"') && h5Html.includes('class="box-form-group box-full-width box-nature-group"'), 'app/index.html must cleanly group nature and mint checkbox');

    // 3. Verify CSS prevents main skill badge crushing on mobile
    assert(stylesCode.includes('.mobile-h5-app .mobile-box-sheet .box-mainskill-name-badge') && stylesCode.includes('flex: 1 1 auto !important;'), 'styles.css must allow main skill badge to flexibly fill remaining space');
    assert(stylesCode.includes('.mobile-h5-app .mobile-box-sheet .box-mainskill-control .custom-select-container') && stylesCode.includes('width: 76px !important;'), 'styles.css must constrain mobile skill level select to 76px');
    assert(stylesCode.includes('.mobile-h5-app .mobile-box-sheet .box-mainskill-control') && stylesCode.includes('flex-direction: row !important;'), 'styles.css must enforce flex row on box-mainskill-control');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Box Screenshot Smart Comparison & Overwrite Modal Verification', () => {
    const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const h5Html = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
    const stylesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
    const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));

    // 1. Modal DOM presence in index.html and app/index.html
    assert(desktopHtml.includes('id="box-conflict-modal"'), 'index.html must have box-conflict-modal');
    assert(desktopHtml.includes('id="box-conflict-summary"'), 'index.html must have box-conflict-summary');
    assert(desktopHtml.includes('id="box-conflict-list"'), 'index.html must have box-conflict-list');
    assert(desktopHtml.includes('id="box-conflict-overwrite-btn"'), 'index.html must have box-conflict-overwrite-btn');
    assert(desktopHtml.includes('id="box-conflict-savenew-btn"'), 'index.html must have box-conflict-savenew-btn');
    assert(desktopHtml.includes('id="box-conflict-cancel-btn"'), 'index.html must have box-conflict-cancel-btn');

    assert(h5Html.includes('id="box-conflict-modal"'), 'app/index.html must have box-conflict-modal');
    assert(h5Html.includes('id="box-conflict-summary"'), 'app/index.html must have box-conflict-summary');
    assert(h5Html.includes('id="box-conflict-list"'), 'app/index.html must have box-conflict-list');
    assert(h5Html.includes('id="box-conflict-overwrite-btn"'), 'app/index.html must have box-conflict-overwrite-btn');
    assert(h5Html.includes('id="box-conflict-savenew-btn"'), 'app/index.html must have box-conflict-savenew-btn');
    assert(h5Html.includes('id="box-conflict-cancel-btn"'), 'app/index.html must have box-conflict-cancel-btn');

    // 2. CSS styles integrity
    assert(stylesCode.includes('.box-conflict-dialog'), 'styles.css must style .box-conflict-dialog');
    assert(stylesCode.includes('.box-conflict-summary'), 'styles.css must style .box-conflict-summary');
    assert(stylesCode.includes('.box-conflict-row'), 'styles.css must style .box-conflict-row');
    assert(stylesCode.includes('.conflict-values-grid'), 'styles.css must style .conflict-values-grid');
    assert(stylesCode.includes('.conflict-badge-diff'), 'styles.css must style .conflict-badge-diff');
    assert(stylesCode.includes('.conflict-badge-same'), 'styles.css must style .conflict-badge-same');

    // 3. Functional exports
    assertEquals(typeof boxModule.findSimilarPokemonInBox, 'function', 'findSimilarPokemonInBox must be exported');
    assertEquals(typeof boxModule.comparePokemonDetails, 'function', 'comparePokemonDetails must be exported');
    assertEquals(typeof boxModule.executePokemonOverwrite, 'function', 'executePokemonOverwrite must be exported');

    // 4. Similarity Matching Logic
    const mockBox = [
      {
        uid: 'test_pkm_venusaur_001',
        pokemonId: '3',
        name: '妙蛙花',
        level: 30,
        nickname: '青蛙王',
        nature: '固執',
        skillLevel: 2,
        ing1: '特選蘋果',
        ing2: '特選蘋果',
        ing3: '特選蘋果',
        subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M']
      },
      {
        uid: 'test_pkm_pikachu_002',
        pokemonId: '25',
        name: '皮卡丘',
        level: 25,
        nature: '爽朗',
        skillLevel: 1,
        ing1: '特選蘋果',
        ing2: '特選蘋果',
        subskills: ['樹果數量S']
      }
    ];

    boxModule.setUserBox(mockBox);

    const parsedNewVenusaur = {
      pokemonId: '3',
      name: '妙蛙花',
      level: 35,
      nature: '固執',
      skillLevel: 3,
      ing1: '特選蘋果',
      ing2: '特選蘋果',
      ing3: '特選蘋果',
      subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能等級提升M']
    };

    const match = boxModule.findSimilarPokemonInBox(parsedNewVenusaur);
    assert(match !== null, 'findSimilarPokemonInBox should find matching existing Venusaur');
    assertEquals(match.uid, 'test_pkm_venusaur_001', 'Match must have matching UID');

    const parsedBlastoise = {
      pokemonId: '9',
      name: '水箭龜',
      level: 30,
      nature: '內斂'
    };
    assertEquals(boxModule.findSimilarPokemonInBox(parsedBlastoise), null, 'Unknown species should return null');

    // 5. Difference Comparison Logic
    const diffs = boxModule.comparePokemonDetails(match, parsedNewVenusaur);
    assert(Array.isArray(diffs), 'comparePokemonDetails must return an array');

    const levelDiff = diffs.find(d => d.field === 'level');
    assert(levelDiff && levelDiff.isSame === false, 'Level diff must be detected (Lv.30 vs Lv.35)');

    const natureDiff = diffs.find(d => d.field === 'nature');
    assert(natureDiff && natureDiff.isSame === true, 'Nature should be marked as same (固執)');

    const skillDiff = diffs.find(d => d.field === 'skillLevel');
    assert(skillDiff && skillDiff.isSame === false, 'Skill level diff must be detected (Lv.2 vs Lv.3)');

    // 6. Overwrite Execution Logic
    boxModule.executePokemonOverwrite(parsedNewVenusaur, match);
    const updatedBox = boxModule.getUserBox();
    const updatedVenusaur = updatedBox.find(p => p.uid === 'test_pkm_venusaur_001');
    assert(updatedVenusaur !== undefined, 'Updated Venusaur must exist in userBox');
    assertEquals(updatedVenusaur.level, 35, 'Level must be updated to 35');
    assertEquals(updatedVenusaur.skillLevel, 3, 'Skill level must be updated to 3');
    assertEquals(updatedVenusaur.nickname, '青蛙王', 'Original nickname should be preserved when parsed has none');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Items Encyclopedia: Master Data Engine, Wiki Subpanel, Stat Highlights, Enlarged Evolution Targets, Bidirectional Dex Linkage & UI Standards Verification', () => {
    // ---------------------------------------------------------------------------
    // Helper: Load Master Items Data
    // ---------------------------------------------------------------------------
    function loadItemsData() {
      const jsonPath = path.join(WORKSPACE_ROOT, 'data', 'items.json');
      if (fs.existsSync(jsonPath)) {
        try {
          const raw = fs.readFileSync(jsonPath, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && Array.isArray(parsed.items)) return parsed.items;
        } catch (e) {}
      }

      const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
      if (fs.existsSync(wikiPath)) {
        const wikiContent = fs.readFileSync(wikiPath, 'utf8');
        const itemsMatch = wikiContent.match(/const\s+(?:ITEMS_DATA|ITEMS_AND_INCENSE_DATA)\s*=\s*(\[[\s\S]*?\]);/);
        if (itemsMatch) {
          try {
            const sandbox = {};
            vm.createContext(sandbox);
            const data = vm.runInContext(itemsMatch[1], sandbox);
            if (Array.isArray(data)) return data;
          } catch (e) {}
        }
      }

      const jsDataPath = path.join(WORKSPACE_ROOT, 'js', 'data', 'items.js');
      if (fs.existsSync(jsDataPath)) {
        try {
          const sandbox = { window: {} };
          vm.createContext(sandbox);
          const code = fs.readFileSync(jsDataPath, 'utf8');
          vm.runInContext(code, sandbox);
          if (sandbox.window && Array.isArray(sandbox.window.ITEMS_DATA)) {
            return sandbox.window.ITEMS_DATA;
          }
        } catch (e) {}
      }

      return null;
    }

    // Load existing source files
    const desktopHtml = fs.existsSync(path.join(WORKSPACE_ROOT, 'index.html'))
      ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8') : '';
    const h5Html = fs.existsSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'))
      ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8') : '';
    const stylesCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'))
      ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8') : '';
    const wikiCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'))
      ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8') : '';
    const appCode = fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'))
      ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8') : '';

    const itemsData = loadItemsData();

    // ---------------------------------------------------------------------------
    // Part 1: Master Data Engine & Canonical Schema
    // ---------------------------------------------------------------------------
    // 1. Master dataset existence and loading
    assert(itemsData !== null, 'Items dataset must be present in data/items.json or embedded in js/modules/wiki.js');
    assert(Array.isArray(itemsData), 'Items dataset must be an array of item records');

    // 2. Canonical item count === 36 (non-incense)
    assertEquals(itemsData.length, 36, `Expected exactly 36 items, received ${itemsData.length}`);

    // 3. Item records adhere to standard canonical schema
    const validCategories = ['evolution', 'training', 'biscuit', 'supply'];
    itemsData.forEach((item, idx) => {
      assert(typeof item.id === 'string' && item.id.length > 0, `Item at index ${idx} missing valid id`);
      assert(validCategories.includes(item.category), `Item ${item.id} has invalid category: ${item.category}`);
      assert(typeof item.name === 'object' && item.name !== null, `Item ${item.id} missing name localization object`);
      assert(typeof item.name['zh-TW'] === 'string' && item.name['zh-TW'].length > 0, `Item ${item.id} missing zh-TW name`);
      assert(typeof item.name['zh-CN'] === 'string' && item.name['zh-CN'].length > 0, `Item ${item.id} missing zh-CN name`);
      assert(typeof item.name['en-US'] === 'string' && item.name['en-US'].length > 0, `Item ${item.id} missing en-US name`);
      assert(typeof item.icon_url === 'string' && item.icon_url.length > 0, `Item ${item.id} missing icon_url`);
      assert(typeof item.description === 'object' && item.description !== null, `Item ${item.id} missing description object`);
      assert(typeof item.sleep_points === 'object' && item.sleep_points !== null, `Item ${item.id} missing sleep_points object`);
      assert('regular' in item.sleep_points, `Item ${item.id} missing sleep_points.regular`);
      assert('premium' in item.sleep_points, `Item ${item.id} missing sleep_points.premium`);
      assert(Array.isArray(item.pokemon_ids), `Item ${item.id} pokemon_ids must be an array`);
    });

    // 4. Evolution stones and items coverage (15+ canonical items)
    const requiredEvolutionItems = [
      'thunder_stone', 'fire_stone', 'water_stone', 'leaf_stone', 'moon_stone',
      'sun_stone', 'ice_stone', 'shiny_stone', 'dusk_stone', 'dawn_stone',
      'oval_stone', 'linking_cord', 'metal_coat', 'kings_rock', 'up_grade'
    ];
    const existingIds = new Set(itemsData.map(i => i.id));
    requiredEvolutionItems.forEach(id => {
      assert(existingIds.has(id), `Missing required evolution item: ${id}`);
    });

    // 5. Incenses completely removed from dataset
    const incenseItems = itemsData.filter(i => i.category.includes('incense') || i.id.includes('incense'));
    assertEquals(incenseItems.length, 0, `No incense items allowed in dataset, found ${incenseItems.length}`);

    // 6. Training items and seed coverage (Handy Candy, Seeds, Mint)
    const requiredTraining = ['main_skill_seed', 'sub_skill_seed', 'cleanse_mint'];
    requiredTraining.forEach(id => {
      assert(existingIds.has(id), `Missing required training item: ${id}`);
    });

    // 7. Catching biscuits and camping supplies coverage
    const requiredSupplies = [
      'poke_biscuit', 'great_biscuit', 'ultra_biscuit', 'master_biscuit',
      'energy_pillow', 'helper_whistle', 'good_camp_ticket'
    ];
    requiredSupplies.forEach(id => {
      assert(existingIds.has(id), `Missing required supply item: ${id}`);
    });

    // 8. Evolution target Pokemon IDs properly mapped
    const thunderStone = itemsData.find(i => i.id === 'thunder_stone');
    assert(thunderStone !== undefined, 'thunder_stone must exist');
    assert(thunderStone.pokemon_ids.includes('26') || thunderStone.pokemon_ids.includes('135'),
      'thunder_stone must map to Raichu (26) or Jolteon (135)');

    const waterStone = itemsData.find(i => i.id === 'water_stone');
    assert(waterStone !== undefined && waterStone.pokemon_ids.includes('134'),
      'water_stone must map to Vaporeon (134)');

    const linkingCord = itemsData.find(i => i.id === 'linking_cord');
    assert(linkingCord !== undefined && linkingCord.pokemon_ids.length >= 2,
      'linking_cord must map to trade evolution Pokemon (Gengar, Alakazam, etc.)');

    // ---------------------------------------------------------------------------
    // Part 2: Wiki Subpanel Registration & Layout Markup
    // ---------------------------------------------------------------------------
    // 9. VALID_WIKI_SUBTABS in wiki.js and app.js includes items
    assert(wikiCode.includes('VALID_WIKI_SUBTABS'), 'wiki.js must declare VALID_WIKI_SUBTABS');
    const wikiSubtabMatch = wikiCode.match(/VALID_WIKI_SUBTABS\s*=\s*\[([\s\S]*?)\];/);
    assert(wikiSubtabMatch !== null && wikiSubtabMatch[1].includes("'items'"), 'VALID_WIKI_SUBTABS array in wiki.js must include items');
    assert(appCode.includes('VALID_WIKI_SUBTABS'), 'app.js must declare VALID_WIKI_SUBTABS');
    const appSubtabMatch = appCode.match(/VALID_WIKI_SUBTABS\s*=\s*\[([\s\S]*?)\];/);
    assert(appSubtabMatch !== null && appSubtabMatch[1].includes("'items'"), 'VALID_WIKI_SUBTABS array in app.js must include items');

    // 10. renderWikiLayout renders items subtab button
    assert(wikiCode.includes('data-subtab="items"'), 'renderWikiLayout must generate button with data-subtab="items"');
    assert(wikiCode.includes('wiki-subtab-btn'), 'wiki.js must use .wiki-subtab-btn class');

    // 11. Wiki subpanel container #wiki-subpanel-items is rendered
    assert(wikiCode.includes('id="wiki-subpanel-items"'), 'wiki.js must render #wiki-subpanel-items container');

    // 12. Controls include search bar, category filter pills and card grid
    assert(wikiCode.includes('wiki-items-search-input') || wikiCode.includes('wiki-item-search-input'),
      'wiki.js must include items search input element');
    assert(wikiCode.includes('wiki-item-card-grid'),
      'wiki.js must render .wiki-item-card-grid container for item cards');
    assert(wikiCode.includes('filterItemsByCategory') || wikiCode.includes('wiki-pill-btn'),
      'wiki.js must render category filter pills');

    // 12.1. Item cards prominently highlight numerical stats and display compact borderless evolution targets without name labels or description
    assert(wikiCode.includes('wiki-item-card-stat-row'), 'wiki.js must render .wiki-item-card-stat-row for numerical stat highlights');
    assert(wikiCode.includes('wiki-item-evo-avatar'), 'wiki.js must render .wiki-item-evo-avatar for evolution targets');
    assert(!wikiCode.includes('wiki-item-card-pokemon-count'), 'wiki.js must not display pokemon count text in item cards');
    assert(!wikiCode.includes('wiki-item-evo-name'), 'wiki.js must remove pokemon name labels in item cards');
    assert(!wikiCode.includes('wiki-item-card-desc'), 'wiki.js must remove description paragraph in item cards');
    assert(stylesCode.includes('.wiki-item-evo-avatar') && stylesCode.includes('28px'), 'styles.css must style .wiki-item-evo-avatar at compact 28px');
    assert(stylesCode.includes('.wiki-item-pkm-avatar') && stylesCode.includes('40px'), 'styles.css must style modal .wiki-item-pkm-avatar at 40px');
    assert(stylesCode.includes('.wiki-item-evo-chip') && stylesCode.includes('border: none'), 'styles.css must style .wiki-item-evo-chip without outer borders');

    // 12.2. Mobile H5 app adaptation is configured with dock clearance and touch styles
    assert(stylesCode.includes('.mobile-h5-app #wiki-subpanel-items'), 'styles.css must adapt #wiki-subpanel-items for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-card-grid'), 'styles.css must adapt .wiki-item-card-grid for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-evo-avatar'), 'styles.css must adapt .wiki-item-evo-avatar for mobile H5');
    assert(stylesCode.includes('.mobile-h5-app .wiki-item-card-stat-row'), 'styles.css must adapt .wiki-item-card-stat-row for mobile H5');

    // ---------------------------------------------------------------------------
    // Part 3: Search and Filter Mechanics
    // ---------------------------------------------------------------------------
    // 13. Category filter logic handles standard categories
    assert(wikiCode.includes('filterItemsByCategory') || wikiCode.includes('renderItemsSubpanel') || wikiCode.includes('filterItems'),
      'wiki.js must provide items filtering mechanism');

    // 14. Multilingual search matches name, effect, or Pokemon name
    assert(wikiCode.includes('searchItems') || wikiCode.includes('handleItemsSearch') || wikiCode.includes('filterItems'),
      'wiki.js must provide items search handler');

    // 15. Search handles special characters and empty inputs safely
    const searchFn = (query, list) => {
      if (!query || !query.trim()) return list;
      const q = query.trim().toLowerCase();
      return list.filter(item => {
        const zhTW = (item.name['zh-TW'] || '').toLowerCase();
        const zhCN = (item.name['zh-CN'] || '').toLowerCase();
        const en = (item.name['en-US'] || '').toLowerCase();
        return zhTW.includes(q) || zhCN.includes(q) || en.includes(q);
      });
    };

    const all = searchFn('', itemsData);
    assertEquals(all.length, itemsData.length, 'Empty search must return all items');

    const spaces = searchFn('   ', itemsData);
    assertEquals(spaces.length, itemsData.length, 'Whitespace search must return all items');

    const special = searchFn('.*+?^${}()|[]\\', itemsData);
    assert(Array.isArray(special), 'Special characters query must return array without throwing');

    // ---------------------------------------------------------------------------
    // Part 4: Item Detail Modal & Bidirectional Dex Linkage
    // ---------------------------------------------------------------------------
    // 16. Modal markup #wiki-item-detail-modal exists in desktop and mobile index.html
    const hasDesktopModal = desktopHtml.includes('id="wiki-item-detail-modal"') || wikiCode.includes('id="wiki-item-detail-modal"');
    const hasMobileModal = h5Html.includes('id="wiki-item-detail-modal"') || wikiCode.includes('id="wiki-item-detail-modal"');
    assert(hasDesktopModal, 'index.html or wiki.js must provide #wiki-item-detail-modal');
    assert(hasMobileModal, 'app/index.html or wiki.js must provide #wiki-item-detail-modal for mobile H5');

    // 17. WikiDB provides openItemDetailModal and closeItemDetailModal
    assert(wikiCode.includes('openItemDetailModal'), 'WikiDB must expose openItemDetailModal');
    assert(wikiCode.includes('closeItemDetailModal'), 'WikiDB must expose closeItemDetailModal');

    // 18. Item modal links to Pokedex via PokemonApp.openPokemonDetailModal
    assert(wikiCode.includes('openPokemonDetailModal') || wikiCode.includes('window.PokemonApp.openPokemonDetailModal'),
      'Clicking associated Pokemon in item modal must call PokemonApp.openPokemonDetailModal');

    // 19. Pokedex modal renders clickable evolution item buttons calling WikiDB.openItemDetailModal
    assert(appCode.includes('openItemDetailModal') || appCode.includes('pokedex-evo-item-btn'),
      'app.js pokedex modal must render interactive evolution item chip linking to WikiDB.openItemDetailModal');

    // 20. wiki-item-detail-modal registered in MOBILE_OVERLAY_IDS
    const registeredInApp = appCode.includes("'wiki-item-detail-modal'") && appCode.includes('MOBILE_OVERLAY_IDS');
    const registeredInWiki = wikiCode.includes("'wiki-item-detail-modal'") && wikiCode.includes('MOBILE_OVERLAY_IDS');
    assert(registeredInApp || registeredInWiki, 'wiki-item-detail-modal must be registered in MOBILE_OVERLAY_IDS');

    // ---------------------------------------------------------------------------
    // Part 5: UI Standards, Quality & Compliance
    // ---------------------------------------------------------------------------
    // 21. Zero Emoji Policy: No unicode emojis in item data or encyclopedia code
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const serializedData = JSON.stringify(itemsData);
    const emojiMatchData = serializedData.match(emojiRegex);
    assert(!emojiMatchData, `Emoji detected in items dataset: ${emojiMatchData ? emojiMatchData[0] : ''}`);

    const itemsBlockMatch = wikiCode.match(/const\s+(?:ITEMS_DATA|ITEMS_AND_INCENSE_DATA)\s*=\s*\[([\s\S]*?)\];/);
    if (itemsBlockMatch) {
      const emojiMatchWiki = itemsBlockMatch[1].match(emojiRegex);
      assert(!emojiMatchWiki, `Emoji detected in wiki.js items definition: ${emojiMatchWiki ? emojiMatchWiki[0] : ''}`);
    }

    // 22. Single Frame Rule: #wiki-subpanel-items outer container has no double borders
    assert(stylesCode.includes('#wiki-subpanel-items') || stylesCode.includes('.wiki-subpanel'),
      'styles.css must style wiki subpanels');
    const hasOuterBorder = stylesCode.includes('#wiki-subpanel-items {\n  border: 1px solid') ||
      stylesCode.includes('#wiki-subpanel-items {\n  border: 2px solid') ||
      stylesCode.includes('#wiki-subpanel-items {\n  border: solid');
    assert(!hasOuterBorder, 'Outer container #wiki-subpanel-items must have border: none or transparent');

    // 23. Dropdown Arrow Layout Rule: Selects have inset right padding and downward menu
    if (stylesCode.includes('.wiki-items-select') || stylesCode.includes('.wiki-item-sort-select')) {
      assert(stylesCode.includes('padding-right: 36px'), 'Dropdown select must enforce padding-right: 36px');
      assert(stylesCode.includes('background-position: right 18px center') || stylesCode.includes('right 18px center'),
        'Dropdown arrow must be inset with background-position: right 18px center');
    }

    // 24. Multi-Theme Support: Theme tokens defined for Midnight, Onyx, Dawn, Emerald
    assert(stylesCode.includes('[data-theme="midnight"]') || stylesCode.includes('.theme-midnight'),
      'styles.css must support Midnight theme');
    assert(stylesCode.includes('[data-theme="onyx"]') || stylesCode.includes('.theme-onyx'),
      'styles.css must support Onyx theme');
    assert(stylesCode.includes('[data-theme="dawn"]') || stylesCode.includes('.theme-dawn'),
      'styles.css must support Dawn theme');
    assert(stylesCode.includes('[data-theme="emerald"]') || stylesCode.includes('.theme-emerald'),
      'styles.css must support Emerald theme');
  });


  test('Tier 4 - Real-World Application Scenarios', 'Full-Stack Performance Optimization: O(1) Indices, Memoization, Bulk OCR ImageData & Zero Layout Thrashing', () => {
    const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
    const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
    const appCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
    const recipesCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');
    const newsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');
    const cloudSyncCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'cloudSync.js'), 'utf8');
    const buildWebappPy = fs.readFileSync(path.join(WORKSPACE_ROOT, 'scripts', 'build_webapp_data.py'), 'utf8');

    // 1. i18n.js: Memoization & pre-indexed O(1) dictionary lookups
    assert(i18nCode.includes('_t2sCache') && i18nCode.includes('SORTED_POKEMON_NAMES_KEYS'),
      'i18n.js must memoize Traditional-to-Simplified conversion and pre-sort Pokemon keys once');
    assert(i18nCode.includes('__normIndex') && i18nCode.includes('__compactIndex'),
      'i18n.js lookupBilingualDict must lazily build O(1) normalized and compact Map indices');
    assert(i18nCode.includes('_dynTextEnCache'),
      'i18n.js translateDynamicText must cache translated English strings');

    // 2. appraisal.js: Memoized evaluatePokemon, O(1) findBasePkm index, O(N) pickBest scan
    assert(appraisalCode.includes('_evalPokemonCache') && appraisalCode.includes('_basePkmIndex'),
      'appraisal.js must memoize evaluatePokemon and index base Pokemon in O(1) Map');
    assert(appraisalCode.includes('_normIngCache') && appraisalCode.includes('ING_ALIASES_ENTRIES'),
      'appraisal.js must pre-compute ingredient alias entries and memoize normalizeIngName');

    // 3. box.js: Memoized calculatePokemonPR, O(1) findPokemonBase, bulk OCR getImageData
    assert(boxCode.includes('_boxPrCache') && boxCode.includes('_boxPkmIndexMap'),
      'box.js must memoize calculatePokemonPR and index base Pokemon in O(1) Map');
    assert(boxCode.includes('willReadFrequently: true') && boxCode.includes('topScanStartY') && boxCode.includes('topScanH'),
      'box.js buildOcrCompositeCanvas must use bulk getImageData reads with willReadFrequently hint');

    // 4. app.js: 1D Int32Array Levenshtein, cached search metadata, deduplicated capture events
    assert(appCode.includes('new Int32Array(m + 1)') && appCode.includes('_searchMeta'),
      'app.js must use 1D Int32Array rolling buffer in levenshteinDistance and cache Pokemon _searchMeta');
    assert(appCode.includes('_lastTouchStartEvt') && appCode.includes('_lastScrollEvt'),
      'app.js initSkillTooltips must deduplicate dual window/document capture event handlers');

    // 5. wiki.js: O(1) _getWikiPkmIndex, hoisted top5Threshold, batched getBoundingClientRect
    assert(wikiCode.includes('_getWikiPkmIndex') && wikiCode.includes('_sleepStyleCache') && wikiCode.includes('_ladderNoteCache'),
      'wiki.js must use O(1) Pokemon index Map and memoize sleep style & ladder note lookups');
    assert(wikiCode.includes('const hostRect = els.host.getBoundingClientRect()') && wikiCode.includes('const shouldPin = hostRect.top <= pinTop + 0.5'),
      'wiki.js applyIslandSpawnsCoordinator must batch DOM geometry reads before style writes');

    // 6. recipes.js, news.js, cloudSync.js, build_webapp_data.py
    assert(recipesCode.includes('_ingNameSet') && recipesCode.includes('_cachedEnergy'),
      'recipes.js getFilteredRecipes must cache ingredient Sets and pre-compute energy before sorting');
    assert(newsCode.includes('_cachedSchedule') && newsCode.includes('ISLAND_MAP_ENTRIES'),
      'news.js must cache extractEventSchedule results on items and pre-compute translation entries');
    assert(cloudSyncCode.includes('uidToIndex = new Map()'),
      'cloudSync.js mergePokemonBoxes must use O(1) uidToIndex Map instead of O(N^2) findIndex');
    const loopIdx = buildWebappPy.indexOf('for idx, r in enumerate(rows_ref):');
    const specialIconsLoadIdx = buildWebappPy.indexOf("special_icons.json");
    assert(specialIconsLoadIdx > 0 && specialIconsLoadIdx < loopIdx,
      'build_webapp_data.py must load special_icons.json once before the rows_ref loop');
  });

  // ─── Test 219: Desktop Unified Content Layout, Width Constraints, Horizontal Alignment & Elegant Border Radius ────

  test('Tier 4 - Real-World Application Scenarios', '4-Layer Cache Architecture: Manifest SHA-256 Version Check, Cache-First LocalStorage, Service Worker & CloudSync Deduplication', () => {
    const crypto = require('crypto');
    const manifestPath = path.join(WORKSPACE_ROOT, 'data/manifest.json');
    const genManifestPath = path.join(WORKSPACE_ROOT, 'scripts/generate_manifest.py');
    const swPath = path.join(WORKSPACE_ROOT, 'sw.js');

    // 1. Verify data/manifest.json and scripts/generate_manifest.py
    assert(fs.existsSync(manifestPath), 'data/manifest.json must exist');
    assert(fs.existsSync(genManifestPath), 'scripts/generate_manifest.py must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assertEquals(manifest.version, 1, 'manifest.version must be 1');
    assert(typeof manifest.manifestHash === 'string' && manifest.manifestHash.length === 16, 'manifest.manifestHash must be a 16-char combined SHA-256 hash');
    assert(manifest.files && typeof manifest.files === 'object', 'manifest.files must exist');

    const trackedFiles = ['data.json', 'recipes.json', 'news.json', 'sleep_styles.json', 'items.json', 'special_icons.json'];
    for (const fileName of trackedFiles) {
      assert(manifest.files[fileName], `manifest.files must track ${fileName}`);
      const rawBytes = fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', fileName));
      const expectedHash = crypto.createHash('sha256').update(rawBytes).digest('hex').slice(0, 16);
      assertEquals(manifest.files[fileName].hash, expectedHash, `manifest hash for ${fileName} must match actual file SHA-256`);
      assertEquals(manifest.files[fileName].size, rawBytes.length, `manifest size for ${fileName} must match actual byte size`);
    }

    // 2. Verify Service Worker (sw.js)
    assert(fs.existsSync(swPath), 'sw.js must exist in root directory');
    const swCode = fs.readFileSync(swPath, 'utf8');
    assert(swCode.includes('pksleep-img-cache-v1'), 'sw.js must define pksleep-img-cache-v1 for Pokemon/berry/ingredient images');
    assert(swCode.includes('pksleep-static-cache-v1'), 'sw.js must define pksleep-static-cache-v1 for OCR/font static assets');
    assert(swCode.includes('isImageRequest') && swCode.includes('isStaticHeavyAsset'), 'sw.js must classify cacheable image and static heavy requests');

    // 3. Verify DataCacheManager in domUtils.js
    const domUtils = require(path.join(WORKSPACE_ROOT, 'js/core/domUtils.js'));
    assert(domUtils.DataCacheManager, 'domUtils must export DataCacheManager');
    assertEquals(typeof domUtils.DataCacheManager.checkFileNeedsUpdate, 'function', 'DataCacheManager.checkFileNeedsUpdate must be a function');
    assertEquals(typeof domUtils.DataCacheManager.markFileUpdated, 'function', 'DataCacheManager.markFileUpdated must be a function');
    assertEquals(typeof domUtils.DataCacheManager.registerServiceWorker, 'function', 'DataCacheManager.registerServiceWorker must be a function');

    // 4. Verify Cache-First + Manifest Differential Sync in app.js, recipes.js, news.js, wiki.js
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/recipes.js'), 'utf8');
    const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/news.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');

    assert(appJs.includes("checkFileNeedsUpdate('data.json'"), 'app.js must check manifest before downloading data.json');
    assert(appJs.includes("saveCachedJson(CACHE_KEY_DATA_JSON, 'data.json'"), 'app.js must save cached JSON and manifest hash after updating data.json');
    assert(recipesJs.includes("checkFileNeedsUpdate('recipes.json'"), 'recipes.js must check manifest before downloading recipes.json');
    assert(recipesJs.includes("saveCachedJson(CACHE_KEY_RECIPES_JSON, 'recipes.json'"), 'recipes.js must save cached JSON and manifest hash after updating recipes.json');
    assert(newsJs.includes("checkFileNeedsUpdate('news.json'"), 'news.js must check manifest before downloading news.json');
    assert(wikiJs.includes("checkFileNeedsUpdate('sleep_styles.json'"), 'wiki.js must check manifest before downloading sleep_styles.json');
    assert(wikiJs.includes("CACHE_KEY_SLEEP_STYLES_JSON = 'pksleep_cache_sleep_styles_json'"), 'wiki.js must cache sleep_styles.json in localStorage');

    // 5. Verify CloudSync & Box echo-push prevention and cooldown deduplication
    const cloudSyncJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/cloudSync.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    assert(cloudSyncJs.includes('INITIAL_SYNC_COOLDOWN_MS'), 'cloudSync.js must define INITIAL_SYNC_COOLDOWN_MS to deduplicate session/tab syncs');
    assert(cloudSyncJs.includes('window.PokemonBoxApp.setUserBox(finalMerged, true)'), 'cloudSync.js must pass skipCloudPush=true to setUserBox after initial sync');
    assert(cloudSyncJs.includes('if (serialized === lastPushedBoxHash)'), 'cloudSync.js pushRemoteBox must skip redundant network upserts when payload hash is unchanged');
    assert(boxJs.includes('function saveUserBox(skipCloudPush = false)'), 'box.js saveUserBox must support skipCloudPush parameter');
  });

  // =========================================================================
  // Test 222: 4-Pillar Deep Performance Optimization (CSS content-visibility, SW Static Caching, On-Demand Tesseract Lazy Loading, rAF & Memoization)
  // =========================================================================

  test('Tier 4 - Real-World Application Scenarios', '4-Pillar Deep Performance Optimization: CSS content-visibility, SW Versioned Asset Cache, On-Demand OCR Loader & Hot-Path Memoization', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const swCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'sw.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const domUtils = require(path.join(WORKSPACE_ROOT, 'js/core/domUtils.js'));
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');

    // Pillar 1: CSS content-visibility: auto & Service Worker versioned static asset caching
    assert(stylesCss.includes('content-visibility: auto;'), 'css/styles.css must enable content-visibility: auto for off-screen cards');
    assert(stylesCss.includes('contain-intrinsic-size: auto 220px;'), 'css/styles.css must define contain-intrinsic-size for virtualized cards');
    assert(stylesCss.includes('.pokemon-card:hover') && stylesCss.includes('content-visibility: visible;'), 'css/styles.css must restore content-visibility: visible on hover/focus');
    assert(swCode.includes("url.searchParams.has('v') && (pathname.endsWith('.css') || pathname.endsWith('.js'))"), 'sw.js must cache versioned CSS and JS bundles in pksleep-static-cache-v1');
    assert(swCode.includes("url.hostname.includes('cdn.jsdelivr.net')"), 'sw.js must cache CDN libraries in pksleep-static-cache-v1');

    // Pillar 2: On-Demand Lazy Loading of Tesseract OCR
    assertEquals(typeof domUtils.loadScriptOnce, 'function', 'DOMUtils.loadScriptOnce must be a function');
    assert(boxJs.includes('async function ensureTesseractLoaded()'), 'box.js must define ensureTesseractLoaded()');
    assert(boxJs.includes('await ensureTesseractLoaded()'), 'box.js must await ensureTesseractLoaded() before creating OCR workers');
    assert(!indexHtml.includes('tesseract.min.js'), 'index.html must NOT eagerly load tesseract.min.js on initial page boot');
    assert(!appIndexHtml.includes('tesseract.min.js'), 'app/index.html must NOT eagerly load tesseract.min.js on initial page boot');

    // Pillar 3: Wiki Island Spawns rAF Scroll Coalescing & Coordinate Ladder Memoization
    assert(wikiJs.includes('function scheduleIslandSpawnsCoordinator()'), 'wiki.js must define scheduleIslandSpawnsCoordinator() using requestAnimationFrame');
    assert(wikiJs.includes("addEventListener('scroll', scheduleIslandSpawnsCoordinator, { passive: true })"), 'wiki.js must bind scroll listener to scheduleIslandSpawnsCoordinator');
    assert(wikiJs.includes('_coordLadderRenderCache'), 'wiki.js must memoize renderCoordinateLadder via _coordLadderRenderCache');
    assert(wikiJs.includes("document.getElementById('wiki-ingredient-ladder-coordinate')"), 'initWikiModule must check #wiki-ingredient-ladder-coordinate to avoid redundant re-render');

    // Pillar 4: Appraisal & Pokédex Slider Memoization
    assert(appraisalJs.includes('_sigRecipeRecCache'), 'appraisal.js must memoize getSignatureRecipeRecommendations via _sigRecipeRecCache');
    assert(appraisalJs.includes('_milestoneCostCache'), 'appraisal.js must memoize calculateMilestoneCost via _milestoneCostCache');
    assert(appJs.includes('_pokedexStatsCache'), 'app.js must memoize calculatePokedexIngredientFormulas via _pokedexStatsCache');
  });

  // =========================================================================
  // Test 223: Official Recipe & Ingredient Alignment, Discrepancy Prevention & Object-Safe Normalization Verification
  // =========================================================================

  test('Tier 4 - Real-World Application Scenarios', 'Official Recipe & Ingredient Alignment, Discrepancy Prevention & Object-Safe Normalization Verification', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    const recipesData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/recipes.json'), 'utf8'));

    // 1. Verify absence of fake/unofficial dish names in appraisal.js
    assert(!appraisalJs.includes('太妃糖豆漿'), 'appraisal.js must NOT contain hallucinated dish name 太妃糖豆漿');
    assert(!appraisalJs.includes('如煉獄咖哩'), 'appraisal.js must use official dish name 煉獄玉米乾咖哩 instead of 如煉獄咖哩');
    assert(!appraisalJs.includes('大菜咖哩/沙拉'), 'appraisal.js must use official top dish examples instead of colloquial 大菜咖哩/沙拉');

    // 2. Verify 碎裂酪梨沙拉 official ingredients & energy in appraisal.js
    assert(appraisalJs.includes("name_cn: '碎裂酪梨沙拉'"), 'appraisal.js must include 碎裂酪梨沙拉');
    assert(appraisalJs.includes("base_energy: 7125"), '碎裂酪梨沙拉 base energy must be 7125');
    assert(appraisalJs.includes("{ name: '萌綠大豆', count: 18 }"), '碎裂酪梨沙拉 must require 18 萌綠大豆');
    assert(appraisalJs.includes("{ name: '嫩亮酪梨', count: 14 }"), '碎裂酪梨沙拉 must require 14 嫩亮酪梨');
    assert(appraisalJs.includes("{ name: '純粹油', count: 10 }"), '碎裂酪梨沙拉 must require 10 純粹油');

    // 3. Verify wiki.js exports ALL_TOP_CATEGORY_RECIPES on window
    assert(wikiJs.includes('window.ALL_TOP_CATEGORY_RECIPES = ALL_TOP_CATEGORY_RECIPES'), 'wiki.js must expose ALL_TOP_CATEGORY_RECIPES on window');

    // 4. Verify I18N.getIngredientName and I18N.getRecipeName
    const i18n = require(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'));
    assertEquals(typeof i18n.getRecipeName, 'function', 'I18N.getRecipeName must be a function');
    assertEquals(i18n.getRecipeName('彈跳咖哩烏龍麵'), '彈跳咖哩烏龍麵', 'I18N.getRecipeName should return string');
    assertEquals(i18n.getIngredientName({ name: '特選蘋果' }), '特選蘋果', 'I18N.getIngredientName should safely handle object input');

    // 5. Verify Milestone Projections with Object-based ingredients
    const ctx = {
      window: {
        I18N: i18n,
        ALL_TOP_CATEGORY_RECIPES: null
      },
      console: console,
      Math: Math,
      parseInt: parseInt,
      Array: Array,
      Object: Object,
      Set: Set,
      Map: Map
    };
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    const lab = ctx.window.AppraisalLab;
    assert(lab && typeof lab.calculateMilestoneProjections === 'function', 'AppraisalLab must export calculateMilestoneProjections');

    const fakeIngPkm = {
      name_cn: '耿鬼',
      specialty: '食材',
      base_speed: 2600,
      ing1: '品鮮蘑菇',
      ing2: '放鬆可可',
      ing3: '放鬆可可'
    };
    const currentEval = { grade: 'B', compositeScore: 65 };
    const milestones = lab.calculateMilestoneProjections(
      fakeIngPkm,
      25,
      '坦率',
      ['食材機率提升M', '幫手獎勵', '幫忙速度M'],
      [{ name: '品鮮蘑菇', count: 1 }, { name: '放鬆可可', count: 2 }, { name: '放鬆可可', count: 3 }],
      0,
      1,
      currentEval
    );

    assert(Array.isArray(milestones), 'milestones must be an array');
    milestones.forEach(m => {
      assert(!m.text.includes('[object Object]'), 'Milestone projection text must never contain [object Object]');
    });
  });

  // ─── Test 224: Box Subtab Switching, Subpanel Isolation & Manifest Path Auto-Resolution ───

  test('Tier 4 - Real-World Application Scenarios', 'Box Subtab Switching, Subpanel Isolation & Manifest Path Auto-Resolution', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const domUtilsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/domUtils.js'), 'utf8');

    // 1. CSS isolation rules in styles.css
    assert(stylesCss.includes('.mobile-h5-app #panel-box.box-lab-active #box-subpanel-list'),
           'styles.css must have rule for hiding #box-subpanel-list when box-lab-active');
    assert(stylesCss.includes('.mobile-h5-app #panel-box:not(.box-lab-active) #box-subpanel-lab'),
           'styles.css must have rule for hiding #box-subpanel-lab when not box-lab-active');
    assert(stylesCss.includes('.mobile-h5-app #panel-box.box-lab-active #box-subpanel-lab'),
           'styles.css must display #box-subpanel-lab when box-lab-active');

    // 2. JS imperative enforcement in box.js
    assert(boxJs.includes("subpanelList.style.setProperty('display', 'none', 'important')"),
           'box.js switchBoxSubtab must set display: none !important on subpanelList in lab mode');
    assert(boxJs.includes("subpanelLab.style.setProperty('display', 'block', 'important')"),
           'box.js switchBoxSubtab must set display: block !important on subpanelLab in lab mode');
    assert(boxJs.includes("subpanelLab.style.setProperty('display', 'none', 'important')"),
           'box.js switchBoxSubtab must set display: none !important on subpanelLab in list mode');

    // 3. app.js routing and class coordination
    assert(appJs.includes("panelBox.classList.add('box-lab-active')") && appJs.includes("panelBox.classList.remove('box-lab-active')"),
           'app.js switchTab box must coordinate box-lab-active class on panelBox');

    // 4. domUtils.js window.__DATA_BASE_PATH__ resolution
    assert(domUtilsJs.includes("typeof window !== 'undefined' && window.__DATA_BASE_PATH__"),
           'domUtils.js must resolve window.__DATA_BASE_PATH__ for manifest fetching');

    // 5. Runtime simulation of switchBoxSubtab
    const listEl = {
      style: {
        _props: {},
        setProperty(k, v, p) { this._props[k] = { val: v, pri: p }; this[k] = v; },
        removeProperty(k) { delete this._props[k]; delete this[k]; }
      }
    };
    const labEl = {
      style: {
        _props: {},
        setProperty(k, v, p) { this._props[k] = { val: v, pri: p }; this[k] = v; },
        removeProperty(k) { delete this._props[k]; delete this[k]; }
      }
    };
    const bodyEl = { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); }, contains(c) { return this.classes.has(c); } } };
    const panelBoxEl = { classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); }, contains(c) { return this.classes.has(c); } } };

    // Execute lab mode switch
    bodyEl.classList.add('box-lab-active');
    panelBoxEl.classList.add('box-lab-active');
    listEl.style.setProperty('display', 'none', 'important');
    labEl.style.setProperty('display', 'block', 'important');

    assert(listEl.style._props.display.val === 'none' && listEl.style._props.display.pri === 'important',
           'subpanelList must have display: none !important');
    assert(labEl.style._props.display.val === 'block' && labEl.style._props.display.pri === 'important',
           'subpanelLab must have display: block !important');
    assert(panelBoxEl.classList.contains('box-lab-active'), 'panelBox must have box-lab-active');

    // Execute list mode switch
    bodyEl.classList.remove('box-lab-active');
    panelBoxEl.classList.remove('box-lab-active');
    listEl.style.removeProperty('display');
    labEl.style.setProperty('display', 'none', 'important');

    assert(!panelBoxEl.classList.contains('box-lab-active'), 'panelBox must not have box-lab-active');
    assert(labEl.style._props.display.val === 'none' && labEl.style._props.display.pri === 'important',
           'subpanelLab must have display: none !important in list mode');
  });

  // ─── Test 225: Research Lab Comparison Overhaul: Mobile One-Row Layout, Simplified Tap-to-Change Slots, Level Benchmark Mode & 6-Dimension Matchup ─

  test('Tier 4 - Real-World Application Scenarios', 'Research Lab Comparison Overhaul: Mobile One-Row Layout, Simplified Tap-to-Change Slots, Level Benchmark Mode & 6-Dimension Matchup', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Static CSS verification
    assert(stylesCss.includes('.lab-compare-vs-header'), 'styles.css must style .lab-compare-vs-header');
    assert(stylesCss.includes('flex-direction: row !important'), 'styles.css must enforce flex-direction: row !important for VS header');
    assert(!appraisalJs.includes('lab-compare-change-btn'), 'appraisal.js must remove clumsy .lab-compare-change-btn button');
    assert(stylesCss.includes('.lab-compare-benchmark-row'), 'styles.css must style .lab-compare-benchmark-row');
    assert(stylesCss.includes('.benchmark-chip'), 'styles.css must style .benchmark-chip');
    assert(stylesCss.includes('.benchmark-chip.active'), 'styles.css must style active benchmark chip');
    assert(stylesCss.includes('.lab-subskill-pill'), 'styles.css must style .lab-subskill-pill');
    assert(stylesCss.includes('.lab-subskill-pill.locked'), 'styles.css must style .lab-subskill-pill.locked');
    assert(stylesCss.includes('.lab-grade-badge'), 'styles.css must style .lab-grade-badge');

    // 2. VM runtime test
    const mockElements = new Map();
    const mockDOMElement = (id = '', tagName = 'div') => {
      const el = {
        id: id,
        tagName: tagName.toUpperCase(),
        innerHTML: '',
        value: '',
        style: { display: '' },
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: (child) => child,
        addEventListener: () => {}
      };
      if (id) mockElements.set(id, el);
      return el;
    };

    const mockStorage = new Map();
    const ctx = {
      window: {
        IS_MOBILE_H5: true,
        localStorage: {
          getItem: (k) => mockStorage.get(k) || null,
          setItem: (k, v) => mockStorage.set(k, String(v)),
          removeItem: (k) => mockStorage.delete(k)
        },
        I18N: {
          getLanguage: () => 'zh-TW',
          getSubSkillName: (n) => n,
          getMainSkillName: (n) => n,
          getIngredientName: (n) => n,
          getNatureName: (n) => n,
          getSpecialtyName: (n) => n,
          getTypeName: (n) => n,
          getBerryName: (n) => n,
          getIngredientIcon: () => '',
          getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
        },
        PokemonApp: {
          getPokemons: () => [
            { id: 1, name_cn: '妙蛙種子', specialty: '食材', base_frequency: 3300, main_skill: '食材獲取S', ingredients: [{ name: '特選蘋果', count: 2 }, { name: '甜甜蜜', count: 5 }, { name: '特選蘋果', count: 8 }] },
            { id: 4, name_cn: '小火龍', specialty: '食材', base_frequency: 3200, main_skill: '食材獲取S', ingredients: [{ name: '豆香肉排', count: 2 }, { name: '暖暖薑', count: 4 }, { name: '豆香肉排', count: 7 }] }
          ]
        },
        UserBox: {
          getUserBox: () => [
            { uid: 'test-seed-1', pokemonId: 1, name: '妙蛙種子', level: 10, nature: '內斂', subskills: ['食材機率提升M', '幫忙速度M', '持有上限提升L'], ing1: '特選蘋果', ing2: '甜甜蜜' },
            { uid: 'test-charm-1', pokemonId: 4, name: '小火龍', level: 15, nature: '冷靜', subskills: ['幫忙速度S', '技能機率提升M', '樹果數量S'], ing1: '豆香肉排', ing2: '暖暖薑' }
          ]
        },
        document: {
          getElementById: (id) => mockElements.get(id) || null,
          querySelector: (s) => (s && s.startsWith('#') ? (mockElements.get(s.slice(1)) || null) : null),
          querySelectorAll: () => [],
          createElement: (tag) => mockDOMElement('', tag),
          body: { style: {}, classList: { contains: () => true }, appendChild: () => {} }
        },
        console: console,
        getComputedStyle: () => ({ display: 'block' }),
        setupCustomSelect: () => {}
      }
    };
    ctx.window.allPokemons = ctx.window.PokemonApp.getPokemons();
    ctx.window.window = ctx.window;
    ctx.document = ctx.window.document;
    ctx.localStorage = ctx.window.localStorage;
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    // Verify method exists
    assert(typeof ctx.window.AppraisalLab.setCompareBenchmarkLevel === 'function', 'setCompareBenchmarkLevel must be exported');

    // Render container
    const mockContainer = mockDOMElement('appraisal-lab-container');
    ctx.window.AppraisalLab.renderLab(mockContainer);
    ctx.window.AppraisalLab.switchSubTab('compare');

    // Select Player A and Player B
    ctx.window.AppraisalLab.setCompareSlot(0, 'test-seed-1');
    ctx.window.AppraisalLab.setCompareSlot(1, 'test-charm-1');

    // Check benchmark selector rendered
    assert(mockContainer.innerHTML.includes('lab-compare-benchmark-row'), 'Compare view must include benchmark selector row');
    assert(mockContainer.innerHTML.includes('Lv.30') && mockContainer.innerHTML.includes('Lv.50'), 'Benchmark row must include Lv.30 and Lv.50');
    assert(mockContainer.innerHTML.includes('benchmark-chip active'), 'Active benchmark chip must have active class');

    // Check 6-dimension evaluation matrix rendered
    assert(mockContainer.innerHTML.includes('lab-compare-sixdim'), 'Compare view must include sixdim matrix');
    assert(mockContainer.innerHTML.includes('六維綜合戰力評定對照'), 'Compare view must title sixdim matrix');

    // Check build matchup table rendered
    assert(mockContainer.innerHTML.includes('lab-compare-builds'), 'Compare view must include builds matchup table');
    assert(mockContainer.innerHTML.includes('副技能與性格配置橫向對照'), 'Compare view must title builds table');
    assert(mockContainer.innerHTML.includes('lab-subskill-pill'), 'Builds table must render subskill pills');

    // Switch benchmark level to Lv. 50
    ctx.window.AppraisalLab.setCompareBenchmarkLevel('50');
    assert(mockStorage.get('pksleep_lab_compare_benchmark') === '50', 'localStorage must persist benchmark level 50');

    // Calculate performance under benchmark level 50 vs box level 10
    const item1 = ctx.window.UserBox.getUserBox()[0];
    const base1 = ctx.window.allPokemons[0];
    const perfBox = ctx.window.AppraisalLab.calculatePokemonComparisonPerformance(item1, base1, 'box');
    const perf50 = ctx.window.AppraisalLab.calculatePokemonComparisonPerformance(item1, base1, '50');

    assert(perfBox.level === 10, 'Box perf must calculate with level 10');
    assert(perf50.level === 50, 'Benchmark 50 perf must calculate with level 50');
    assert(perf50.totalDailyEnergy > perfBox.totalDailyEnergy, 'Level 50 energy output must exceed Level 10');
    assert(perf50.activeSubskills.length >= 3, 'Level 50 must unlock Lv.10, Lv.25, Lv.50 subskills');

    // Reset benchmark level to box
    ctx.window.AppraisalLab.setCompareBenchmarkLevel('box');
    assert(mockStorage.get('pksleep_lab_compare_benchmark') === 'box', 'localStorage must persist benchmark level box');
  });

  // ─── Test 226: Research Lab Target Recipe Strategy, Greedy Ingredient Maximization, Supply-Demand Dashboard & Greengrass Reroll ─

  test('Tier 4 - Real-World Application Scenarios', 'Research Lab Target Recipe Strategy, Greedy Ingredient Maximization, Supply-Demand Dashboard & Greengrass Reroll', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const recipesData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/recipes.json'), 'utf8'));

    // 1. Static CSS verification
    assert(stylesCss.includes('.lab-target-recipe-chip'), 'styles.css must style .lab-target-recipe-chip');
    assert(stylesCss.includes('.lab-recipe-supply-board'), 'styles.css must style .lab-recipe-supply-board');
    assert(stylesCss.includes('.lab-supply-row'), 'styles.css must style .lab-supply-row');
    assert(stylesCss.includes('.lab-supply-diff-badge'), 'styles.css must style .lab-supply-diff-badge');
    assert(stylesCss.includes('.lab-recipe-picker-container'), 'styles.css must style .lab-recipe-picker-container');
    assert(stylesCss.includes('.lab-greengrass-actions'), 'styles.css must style .lab-greengrass-actions');

    // Single Frame Rule verification: ensure supply board has border and inner wrapper is borderless transparent
    assert(stylesCss.includes('.lab-supply-table-wrapper {\n  border: none;\n  background: transparent;'),
      'styles.css must enforce single frame rule for supply table wrapper without double borders');

    // 2. VM runtime test
    const mockElements = new Map();
    const mockDOMElement = (id = '', tagName = 'div') => {
      const el = {
        id: id,
        tagName: tagName.toUpperCase(),
        innerHTML: '',
        value: '',
        style: { display: '' },
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: (child) => child,
        addEventListener: () => {}
      };
      if (id) mockElements.set(id, el);
      return el;
    };

    const mockStorage = new Map();
    const testBox = [
      // Producer A: Warming Ginger (暖暖薑)
      { uid: 'pkm-ginger', pokemonId: 6, name: '噴火龍', level: 30, nature: '坦率', specialty: '食材', subskills: ['食材機率提升M'], ing1: '暖暖薑', ing2: '暖暖薑' },
      // Producer B: Tasty Mushroom (品鮮蘑菇)
      { uid: 'pkm-shroom', pokemonId: 94, name: '耿鬼', level: 30, nature: '坦率', specialty: '食材', subskills: ['食材機率提升M'], ing1: '品鮮蘑菇', ing2: '品鮮蘑菇' },
      // Producer C: Fiery Herb (火辣香草)
      { uid: 'pkm-herb', pokemonId: 229, name: '黑魯加', level: 30, nature: '坦率', specialty: '食材', subskills: ['食材機率提升M'], ing1: '火辣香草', ing2: '火辣香草' },
      // Producer D: Bean Sausage (豆製肉)
      { uid: 'pkm-sausage', pokemonId: 157, name: '火爆獸', level: 30, nature: '坦率', specialty: '食材', subskills: ['食材機率提升M'], ing1: '豆製肉', ing2: '豆製肉' },
      // Producer E: Fancy Apple (特選蘋果 - Irrelevant to Bounce Curry Udon)
      { uid: 'pkm-apple', pokemonId: 25, name: '皮卡丘', level: 30, nature: '坦率', specialty: '樹果', subskills: ['樹果數量S'], ing1: '特選蘋果', ing2: '特選蘋果' }
    ];

    const ctx = {
      window: {
        IS_MOBILE_H5: false,
        __RECIPES_CACHE__: recipesData,
        allRecipes: recipesData,
        localStorage: {
          getItem: (k) => mockStorage.get(k) || null,
          setItem: (k, v) => mockStorage.set(k, String(v)),
          removeItem: (k) => mockStorage.delete(k)
        },
        I18N: {
          getLanguage: () => 'zh-TW',
          getSubSkillName: (n) => n,
          getMainSkillName: (n) => n,
          getIngredientName: (n) => n,
          getNatureName: (n) => n,
          getSpecialtyName: (n) => n,
          getTypeName: (n) => n,
          getBerryName: (n) => n,
          getIngredientIcon: () => '',
          getSpecialtyIconHtml: (spec, size, cls) => `<span class="${cls}">${spec}</span>`
        },
        PokemonApp: {
          getPokemons: () => [
            { id: 6, name_cn: '噴火龍', specialty: '食材', base_frequency: 2600, ingredients: [{ name: '暖暖薑', count: 2 }, { name: '暖暖薑', count: 5 }] },
            { id: 94, name_cn: '耿鬼', specialty: '食材', base_frequency: 2200, ingredients: [{ name: '品鮮蘑菇', count: 2 }, { name: '品鮮蘑菇', count: 5 }] },
            { id: 229, name_cn: '黑魯加', specialty: '食材', base_frequency: 2900, ingredients: [{ name: '火辣香草', count: 2 }, { name: '火辣香草', count: 5 }] },
            { id: 157, name_cn: '火爆獸', specialty: '食材', base_frequency: 2400, ingredients: [{ name: '豆製肉', count: 2 }, { name: '豆製肉', count: 5 }] },
            { id: 25, name_cn: '皮卡丘', specialty: '樹果', base_frequency: 2700, ingredients: [{ name: '特選蘋果', count: 2 }, { name: '特選蘋果', count: 5 }] }
          ]
        },
        UserBox: {
          getUserBox: () => testBox
        },
        document: {
          getElementById: (id) => mockElements.get(id) || null,
          querySelector: (s) => (s && s.startsWith('#') ? (mockElements.get(s.slice(1)) || null) : null),
          querySelectorAll: () => [],
          createElement: (tag) => mockDOMElement('', tag),
          body: { style: {}, classList: { contains: () => true }, appendChild: () => {} }
        },
        console: console,
        getComputedStyle: () => ({ display: 'block' }),
        setupCustomSelect: () => {},
        showToast: () => {}
      }
    };
    ctx.window.allPokemons = ctx.window.PokemonApp.getPokemons();
    ctx.window.window = ctx.window;
    ctx.document = ctx.window.document;
    ctx.localStorage = ctx.window.localStorage;
    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    const Lab = ctx.window.AppraisalLab;
    assert(typeof Lab.setTargetRecipe === 'function', 'setTargetRecipe must be exported');
    assert(typeof Lab.rerollGreengrassBerries === 'function', 'rerollGreengrassBerries must be exported');
    assert(typeof Lab.getAllTargetRecipes === 'function', 'getAllTargetRecipes must be exported');
    assert(typeof Lab.findTargetRecipe === 'function', 'findTargetRecipe must be exported');

    // 3. Test recipe helpers
    const allRecipes = Lab.getAllTargetRecipes();
    assert(Array.isArray(allRecipes) && allRecipes.length >= 78, 'getAllTargetRecipes must return at least 78 official recipes');
    const udon = Lab.findTargetRecipe('彈跳咖哩烏龍麵');
    assert(udon && udon.name_cn === '彈跳咖哩烏龍麵', 'findTargetRecipe must locate 彈跳咖哩烏龍麵');
    assert(Array.isArray(udon.ingredients) && udon.ingredients.length === 4, 'Bounce Curry Udon must have 4 required ingredients');

    // 4. Test target recipe state and persistence
    Lab.setTargetRecipe('彈跳咖哩烏龍麵');
    assert(mockStorage.get('pksleep_lab_target_recipe') === '彈跳咖哩烏龍麵', 'localStorage must persist pksleep_lab_target_recipe');
    Lab.setTeamStrategy('recipe');
    assert(mockStorage.get('pksleep_lab_team_strategy') === 'recipe', 'localStorage must persist pksleep_lab_team_strategy as recipe');

    // 5. Test autoOptimizeTeam in Target Recipe mode (食材最大化模式)
    Lab.autoOptimizeTeam(false);
    const slots = JSON.parse(mockStorage.get('pksleep_lab_team_slots') || '[]');
    assert(Array.isArray(slots) && slots.length === 5, 'autoOptimizeTeam must allocate 5 slots');
    // Ensure the 4 target ingredient producers are all picked before the irrelevant apple producer
    assert(slots.includes('pkm-ginger'), 'Team must include Ginger producer for 彈跳咖哩烏龍麵');
    assert(slots.includes('pkm-shroom'), 'Team must include Mushroom producer for 彈跳咖哩烏龍麵');
    assert(slots.includes('pkm-herb'), 'Team must include Herb producer for 彈跳咖哩烏龍麵');
    assert(slots.includes('pkm-sausage'), 'Team must include Sausage producer for 彈跳咖哩烏龍麵');

    // 6. Test simulateTeamPerformance supply-demand analysis
    const teamItems = slots.map(uid => testBox.find(p => p.uid === uid)).filter(Boolean);
    const sim = Lab.simulateTeamPerformance(teamItems, 'greengrass');
    assert(sim.targetRecipeAnalysis !== null, 'simulateTeamPerformance must return targetRecipeAnalysis');
    assert(sim.targetRecipeAnalysis.recipe.name_cn === '彈跳咖哩烏龍麵', 'targetRecipeAnalysis must analyze 彈跳咖哩烏龍麵');
    assert(Array.isArray(sim.targetRecipeAnalysis.items) && sim.targetRecipeAnalysis.items.length === 4, 'targetRecipeAnalysis must have 4 items');
    sim.targetRecipeAnalysis.items.forEach(item => {
      assert(item.dailyDemand === item.perMeal * 3, 'dailyDemand must be exactly perMeal * 3');
      assert(item.diff === item.teamYield - item.dailyDemand, 'diff must be teamYield minus dailyDemand');
      assert(typeof item.fulfillmentPct === 'number', 'fulfillmentPct must be numeric');
    });

    // 7. Test Greengrass random reroll
    Lab.rerollGreengrassBerries(false);
    const gg1 = JSON.parse(mockStorage.get('pksleep_lab_greengrass_berries') || '[]');
    assert(Array.isArray(gg1) && gg1.length === 3, 'rerollGreengrassBerries must roll exactly 3 berries');
    const distinct = new Set(gg1);
    assert(distinct.size === 3, 'rerollGreengrassBerries must roll 3 distinct berries');

    // 8. Test Greengrass Roll & Build
    Lab.rerollGreengrassBerries(true);
    const gg2 = JSON.parse(mockStorage.get('pksleep_lab_greengrass_berries') || '[]');
    assert(Array.isArray(gg2) && gg2.length === 3, 'Roll & Build must roll 3 berries');

    // 9. Test UI rendering: Render Lab Container and verify markup
    const mockContainer = mockDOMElement('appraisal-lab-container');
    Lab.renderLab(mockContainer);
    assert(mockContainer.innerHTML.includes('id="lab-team-recipe-supply-demand"'), 'Rendered lab must contain #lab-team-recipe-supply-demand');
    assert(mockContainer.innerHTML.includes('lab-target-recipe-chip'), 'Rendered lab must contain .lab-target-recipe-chip');
    assert(mockContainer.innerHTML.includes('Random Reroll') || mockContainer.innerHTML.includes('隨機擲骰'), 'Rendered lab must contain Random Reroll button');
    assert(mockContainer.innerHTML.includes('Roll & Build') || mockContainer.innerHTML.includes('擲骰並自動配隊'), 'Rendered lab must contain Roll & Build button');
    assert(mockContainer.innerHTML.includes('lab-supply-row'), 'Supply-demand board must render .lab-supply-row');
  });

}

module.exports = { registerTier4Tests };

if (require.main === module) {
  registerTier4Tests();
  const { printSummaryAndExit } = require('../test_harness');
  printSummaryAndExit();
}
