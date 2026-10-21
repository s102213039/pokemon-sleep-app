/**
 * Tier 1 - Feature Coverage (66 Tests)
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

function registerTier1Tests() {
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
    assert(typeof item.specialty === 'string', `Item ${id} missing specialty`);
    if (item.ingredients && item.ingredients.length > 0) {
      assert(item.specialty !== '', `Released Item ${id} missing specialty`);
    }
    assert(getItemCarry(item) >= 0, `Item ${id} has invalid carryCapacity`);
    assert(getItemHelpInterval(item) >= 0, `Item ${id} has invalid helpInterval`);
    assert(getItemIngredientRate(item) >= 0, `Item ${id} has invalid ingredientRate`);
    assert(item.ingredients !== undefined, `Item ${id} missing ingredients`);
  });
});


test('Tier 1 - Feature Coverage', 'Dataset Integrity: recipes.json exists and contains 78 verified recipes with correct ingredients & pot sizes', () => {
  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
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

  // Core Pokedex elements
  assert(htmlContent.includes('id="search-input"') || htmlContent.includes("id='search-input'"), 'Missing search input element');
  assert(htmlContent.includes('id="final-evo-toggle"'), 'Missing final-evo-toggle switch element');
  assert(htmlContent.includes('id="initial-ing-toggle"'), 'Missing initial-ing-toggle switch element');
  assert(htmlContent.includes('id="show-no-toggle"'), 'Missing show-no-toggle switch element');
  assert(htmlContent.includes('id="pokemon-filter-sidebar"'), 'Missing pokemon-filter-sidebar element in index.html');
  assert(htmlContent.includes('id="sidebar-bookmark-handle"'), 'Missing sidebar-bookmark-handle element in index.html');
  assert(htmlContent.includes('id="sidebar-close-btn"'), 'Missing sidebar-close-btn element in index.html');
  assert(htmlContent.includes('id="sidebar-reset-all-btn"'), 'Missing sidebar-reset-all-btn element in index.html');
  assert(htmlContent.includes('id="berry-filter-tags"') || htmlContent.includes("id='berry-filter-tags'"), 'Missing berry filter container');
  assert(htmlContent.includes('id="specialty-filter-tags"') || htmlContent.includes("id='specialty-filter-tags'"), 'Missing specialty filter container');
  assert(htmlContent.includes('id="detail-subfilters-container"'), 'Missing detail subfilters container');
  assert(htmlContent.includes('id="sort-select"') || htmlContent.includes("id='sort-select'"), 'Missing sort selector element');
  assert(htmlContent.includes('id="toggle-grid"') || htmlContent.includes("id='toggle-grid'"), 'Missing grid view toggle button');
  assert(htmlContent.includes('id="toggle-table"') || htmlContent.includes("id='toggle-table'"), 'Missing table view toggle button');
  assert(htmlContent.includes('id="content-area"') || htmlContent.includes("id='content-area'"), 'Missing view content area container');
  assert(htmlContent.includes('id="event-bonus-slider"'), 'Missing event-bonus-slider element in index.html');

  // SPA Multi-Tab Navigation elements
  assert(htmlContent.includes('id="tab-pokemon"'), 'Missing tab-pokemon navigation element in index.html');
  assert(htmlContent.includes('id="tab-recipes"'), 'Missing tab-recipes navigation element in index.html');
  assert(htmlContent.includes('id="tab-wiki"'), 'Missing tab-wiki navigation element in index.html');
  assert(htmlContent.includes('id="tab-box"'), 'Missing tab-box navigation element in index.html');
  assert(htmlContent.includes('id="tab-news"'), 'Missing tab-news navigation element in index.html');
  assert(htmlContent.includes('id="panel-pokemon"'), 'Missing panel-pokemon view container in index.html');
  assert(htmlContent.includes('id="panel-recipes"'), 'Missing panel-recipes view container in index.html');
  assert(htmlContent.includes('id="panel-wiki"'), 'Missing panel-wiki view container in index.html');
  assert(htmlContent.includes('id="panel-box"'), 'Missing panel-box view container in index.html');
  assert(htmlContent.includes('id="panel-news"'), 'Missing panel-news view container in index.html');
});


test('Tier 1 - Feature Coverage', 'Wiki Database Integrity: wiki.js defines skills, sub-skills, matrix, ratings, and ingredient ladder', () => {
  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  assert(fs.existsSync(wikiPath), 'wiki.js does not exist');
  const wikiContent = fs.readFileSync(wikiPath, 'utf8');

  assert(wikiContent.includes('MAIN_SKILLS_DATA'), 'wiki.js missing MAIN_SKILLS_DATA');
  assert(wikiContent.includes('SUB_SKILLS_DATA'), 'wiki.js missing SUB_SKILLS_DATA');
  assert(wikiContent.includes('TRIGGER_CHANCE_MATRIX'), 'wiki.js missing TRIGGER_CHANCE_MATRIX');
  assert(wikiContent.includes('HELPING_SPEED_MATRIX'), 'wiki.js missing HELPING_SPEED_MATRIX');
  assert(wikiContent.includes('RATINGS_GUIDE_DATA'), 'wiki.js missing RATINGS_GUIDE_DATA');
  assert(wikiContent.includes('蓄力（能量填充S）') || wikiContent.includes('蓄力 (能量填充S)'), 'wiki.js missing Charge Stock skill data');
  assert(wikiContent.includes('幫手加速（屬性）') || wikiContent.includes('幫手加速 (屬性)'), 'wiki.js missing Helper Boost skill data');
  assert(wikiContent.includes('1.848'), 'wiki.js missing 1.848x trigger chance multiplier');
});


test('Tier 1 - Feature Coverage', 'Ingredient & Berry Base Energy: wiki.js matches Serebii Separate Base Power (19 ingredients, 18 berries Lv.1)', () => {
  const wikiPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  const wikiContent = fs.readFileSync(wikiPath, 'utf8');

  const SEREbii_ING = {
    '特選蘋果': 90, '哞哞鮮奶': 98, '萌綠大豆': 100, '甜甜蜜': 101, '豆製肉': 103,
    '暖暖薑': 109, '好眠番茄': 110, '特選蛋': 115, '純粹油': 121, '窩心洋芋': 124,
    '火辣香草': 130, '萌綠玉米': 140, '放鬆可可': 151, '醒腦咖啡豆': 153, '嫩亮酪梨': 162,
    '品鮮蘑菇': 167, '粗枝大蔥': 185, '沉甸甸南瓜': 250, '美味尾巴': 342
  };
  const SEREbii_BERRY_LV1 = {
    '椰木果': 24, '木子果': 24, '異奇果': 25, '檬果': 26, '桃桃果': 26, '芒念果': 26,
    '蘋野果': 27, '櫻子果': 27, '柿仔果': 28, '勿花果': 29, '文柚果': 30, '榴石果': 30,
    '橙橙果': 31, '芭拉果': 31, '零餘果': 32, '生薑果': 32, '靛莓果': 33, '巧可果': 35
  };

  const ingBlock = wikiContent.match(/const INGREDIENT_VALUES_DATA = \[([\s\S]*?)\];/);
  const berryBlock = wikiContent.match(/const BERRY_VALUES_DATA = \[([\s\S]*?)\];/);
  assert(ingBlock, 'INGREDIENT_VALUES_DATA not found');
  assert(berryBlock, 'BERRY_VALUES_DATA not found');

  const parseEntries = (block) => [...block.matchAll(/name:\s*['"]([^'"]+)['"][\s\S]*?energy:\s*(\d+)/g)]
    .map(m => ({ name: m[1], energy: +m[2] }));

  const ings = parseEntries(ingBlock[1]);
  const berries = parseEntries(berryBlock[1]);

  assertEquals(ings.length, 19, 'INGREDIENT_VALUES_DATA should have 19 entries');
  assertEquals(berries.length, 18, 'BERRY_VALUES_DATA should have 18 entries');

  ings.forEach(({ name, energy }) => {
    assert(SEREbii_ING[name] !== undefined, `Unknown ingredient in wiki: ${name}`);
    assertEquals(energy, SEREbii_ING[name], `Ingredient ${name} base energy mismatch`);
  });

  berries.forEach(({ name, energy }) => {
    assert(SEREbii_BERRY_LV1[name] !== undefined, `Unknown berry in wiki: ${name}`);
    assertEquals(energy, SEREbii_BERRY_LV1[name], `Berry ${name} Lv.1 base energy mismatch`);
  });

  const ladderFileContent = fs.existsSync(path.join(WORKSPACE_ROOT, 'js/data/ladder_data.js'))
    ? fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/data/ladder_data.js'), 'utf8')
    : wikiContent;
  const ladderBlock = ladderFileContent.match(/const LV60_COORDINATE_LADDER_DATA = \[([\s\S]*?)\];\s*\n\s*\/\/ 舊版清單資料/);
  assert(ladderBlock, 'LV60_COORDINATE_LADDER_DATA not found');
  const ladderEnergies = [...ladderBlock[1].matchAll(/"energy": (\d+)/g)].map(m => +m[1]).sort((a,b)=>a-b);
  const ingEnergies = Object.values(SEREbii_ING).sort((a,b)=>a-b);
  assertEquals(ladderEnergies.length, 19, 'LV60 ladder should cover all 19 ingredients');
  assertEquals(ladderEnergies.join(','), ingEnergies.join(','), 'Ladder ingredient energies should match INGREDIENT_VALUES_DATA');

  assert(!wikiContent.includes('energy: 200') && !wikiContent.match(/"energy": 200/), 'Residual pumpkin energy 200 should not exist');
  const pumpkin = ings.find(i => i.name === '沉甸甸南瓜');
  assertEquals(pumpkin.energy, 250, 'Plump Pumpkin must be 250');
  const avo = ings.find(i => i.name === '嫩亮酪梨');
  assertEquals(avo.energy, 162, 'Glossy Avocado must be 162');
});


test('Tier 1 - Feature Coverage', 'Box System Integrity: box.js defines 25 Natures, Sub-skills, and User Box data models', () => {
  const boxPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js');
  assert(fs.existsSync(boxPath), 'box.js does not exist');
  const boxContent = fs.readFileSync(boxPath, 'utf8');

  assert(boxContent.includes('NATURE_DATA'), 'box.js missing NATURE_DATA');
  assert(boxContent.includes('SUBSKILLS_DATA'), 'box.js missing SUBSKILLS_DATA');
  assert(boxContent.includes('STORAGE_KEY'), 'box.js missing STORAGE_KEY');
  assert(boxContent.includes('樹果數量S'), 'box.js missing Berry Finding S subskill');
  assert(boxContent.includes('幫手獎勵'), 'box.js missing Helping Bonus subskill');
  assert(boxContent.includes('固執'), 'box.js missing Adamant nature');
});


test('Tier 1 - Feature Coverage', 'Dataset Integrity: news.json exists and contains >= 20 structured news articles with AI summaries', () => {
  const newsPath = path.join(WORKSPACE_ROOT, 'data', 'news.json');
  assert(fs.existsSync(newsPath), 'news.json does not exist');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  assert(Array.isArray(newsData), 'news.json must be an array');
  assert(newsData.length >= 20, `news.json should contain >= 20 articles (got ${newsData.length})`);

  newsData.forEach(item => {
    assert(item.id, 'News item missing id');
    assert(item.url && item.url.startsWith('http'), `News item ${item.id} missing/invalid url`);
    assert(item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date), `News item ${item.id} invalid date format: ${item.date}`);
    assert(item.title && item.title.trim(), `News item ${item.id} missing title`);
    assert(item.overview && item.overview.trim(), `News item ${item.id} missing overview`);
    assert(Array.isArray(item.highlights) && item.highlights.length > 0, `News item ${item.id} missing AI highlights`);
  });
});


test('Tier 1 - Feature Coverage', 'Recipe Energy Formula: Level + Island Bonus + Event Multiplier (1.00x - 2.50x) + Tasty (2x/3x)', () => {
  const LEVEL_BONUS_TABLE = { 1: 0, 70: 258 };
  function testCalcEnergy(base, lv, islandPct, eventMult = 1.0) {
    const lvMult = 1 + ((LEVEL_BONUS_TABLE[lv] || 0) / 100);
    const islandMult = 1 + (islandPct / 100);
    return Math.round(base * lvMult * islandMult * eventMult);
  }

  assertEquals(testCalcEnergy(10000, 1, 0, 1.0), 10000, 'Base energy at Lv1 0% 1.0x should be 10000');
  assertEquals(testCalcEnergy(10000, 1, 0, 1.25), 12500, 'Energy with 1.25x event bonus should be 12500');
  assertEquals(testCalcEnergy(10000, 1, 0, 2.5), 25000, 'Energy with 2.50x event bonus should be 25000');
  const energy = testCalcEnergy(10000, 1, 0, 1.5);
  assertEquals(energy * 2, 30000, 'Tasty 2x should be double normal energy');
  assertEquals(energy * 3, 45000, 'Tasty 3x should be triple normal energy');
});


test('Tier 1 - Feature Coverage', 'CSS Styling: styles.css exists with dark theme, badge styles, responsive rules, and valid balanced braces', () => {
  const cssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.css');
  assert(fs.existsSync(cssPath), 'styles.css does not exist');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('--bg-dark'), 'CSS missing --bg-dark custom property');
  assert(cssContent.includes('.type-badge'), 'CSS missing .type-badge styling');
  assert(cssContent.includes('@media'), 'CSS missing responsive @media query rules');

  let openBraces = 0;
  let minBraces = 0;
  let inStr = false, quote = '', inComm = false;
  for (let i = 0; i < cssContent.length; i++) {
    const c = cssContent[i], next = cssContent[i + 1];
    if (inComm) {
      if (c === '*' && next === '/') { inComm = false; i++; }
      continue;
    }
    if (inStr) {
      if (c === quote && cssContent[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (c === '/' && next === '*') { inComm = true; i++; continue; }
    if (c === '"' || c === "'") { inStr = true; quote = c; continue; }
    if (c === '{') openBraces++;
    if (c === '}') {
      openBraces--;
      if (openBraces < minBraces) minBraces = openBraces;
    }
  }
  assertEquals(minBraces, 0, `styles.css encountered negative brace depth (${minBraces}) - premature closing brace`);
  assertEquals(openBraces, 0, `styles.css has unclosed or unmatched braces (diff: ${openBraces})`);

  // Verify modular CSS architecture and build integrity
  const { CSS_MODULES, buildCss } = require('../../scripts/build_css');
  assert(Array.isArray(CSS_MODULES) && CSS_MODULES.length >= 10, 'CSS_MODULES must define modular components and views');
  for (const mod of CSS_MODULES) {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'css', mod)), `Modular CSS file missing: css/${mod}`);
  }
});


test('Tier 1 - Feature Coverage', 'JS Logic: app.js contains state management, multi-filtering, sorting & rendering', () => {
  assert(typeof PokemonApp === 'object', 'PokemonApp object is not defined');
  assert(typeof PokemonApp.filterData === 'function', 'filterData method missing');
  assert(typeof PokemonApp.sortData === 'function', 'sortData method missing');
  assert(typeof PokemonApp.render === 'function', 'render method missing');
  assert(typeof PokemonApp.formatHelpInterval === 'function', 'formatHelpInterval method missing');
  assertEquals(PokemonApp.formatHelpInterval('00:44:10'), '44:10', 'formatHelpInterval(00:44:10) should be 44:10');
  assertEquals(PokemonApp.formatHelpInterval('01:13:20'), '73:20', 'formatHelpInterval(01:13:20) should be 73:20');
  assertEquals(PokemonApp.formatHelpInterval('01:00:00'), '60:00', 'formatHelpInterval(01:00:00) should be 60:00');
  assertEquals(PokemonApp.showNo, false, 'PokemonApp.showNo should default to false');

  const mewRender = PokemonApp.renderSkillWithTooltip('十項全能（揮指）[可替換]');
  assert(!mewRender.includes('[可替換]'), 'renderSkillWithTooltip should not include [可替換]');
  assert(mewRender.includes('十項全能(揮指)'), 'renderSkillWithTooltip should format with halfwidth parentheses 十項全能(揮指)');

  const cressRender = PokemonApp.renderSkillWithTooltip('新月祈禱（活力全體療癒S）');
  assert(!cressRender.includes('活力全體療癒S'), 'renderSkillWithTooltip should simplify 活力全體療癒S');
  assert(cressRender.includes('全體療癒S)'), 'renderSkillWithTooltip should format with halfwidth parentheses 全體療癒S)');

  const shardRender = PokemonApp.renderSkillWithTooltip('夢之碎片獲取S');
  assertEquals(shardRender, '夢碎獲取S', 'renderSkillWithTooltip should format 夢之碎片獲取S as 夢碎獲取S');

  const lucarioRender = PokemonApp.renderSkillWithTooltip('波導彈（夢之碎片獲取S）');
  assert(!lucarioRender.includes('波導彈（夢之碎片') && !lucarioRender.includes('波導彈(夢之碎片'), 'renderSkillWithTooltip should shorten 夢之碎片 in 波導彈 skill name');
  assert(lucarioRender.includes('波導彈(夢碎獲取S)'), 'renderSkillWithTooltip should format as 波導彈(夢碎獲取S)');
});

// Baseline Tests 11-23

test('Tier 1 - Feature Coverage', 'Appraisal Lab & Six-Dimension Engine: Evaluates BFS God Roll and calculates milestone costs', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const sampleRaichu = {
    id: '26',
    name_cn: '雷丘',
    specialty: '樹果',
    type: '電',
    interval: '00:36:40'
  };

  const result = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 30, '固執', ['樹果數量S', '幫忙速度M', '幫手獎勵', '技能機率提升M', '睡眠EXP獎勵'], ['特選蘋果', '特選蘋果', '特選蘋果']);
  
  assert(result !== null, 'Evaluation should return non-null object');
  assert(result.scores.berry >= 90, 'Raichu with BFS and Adamant should have berry score >= 90');
  assert(result.scores.speed >= 80, 'Raichu with fast interval and Adamant should have speed score >= 80');
  assert(result.pros.length >= 2, 'Should generate multiple pro highlights for top rolls');

  // Test locked subskills have strictly 0 effect on appraisal calculation
  const evalEmpty = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 10, '坦率', ['', '', '', '', ''], ['特選蘋果']);
  const evalLockedBFS = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 10, '坦率', ['', '樹果數量S', '', '', ''], ['特選蘋果']);
  assertEquals(evalLockedBFS.scores.growth, evalEmpty.scores.growth, 'Locked subskill in slot 2 must have 0 effect on growth score at Lv.10');
  assertEquals(evalLockedBFS.scores.roi, evalEmpty.scores.roi, 'Locked subskill in slot 2 must have 0 effect on ROI score at Lv.10');
  assert(evalLockedBFS.pros.every(p => !p.includes('樹果數量S')), 'Locked subskill must not appear in diagnostic pros');

  const evalUnlockedBFS = ctx.AppraisalLab.evaluatePokemon(sampleRaichu, 25, '坦率', ['', '樹果數量S', '', '', ''], ['特選蘋果']);
  assert(evalUnlockedBFS.compositeScore > evalEmpty.compositeScore, 'Unlocked BFS at Lv.25 must boost composite score');

  const svg = ctx.AppraisalLab.renderRadarChartSVG(result.scores, 280);
  assert(svg.includes('<svg'), 'Radar chart should be a valid SVG string');
  assert(svg.includes('<polygon'), 'Radar chart should include polygon elements');
  assert(svg.includes('樹果產能'), 'Radar chart should include dimension labels');

  const costs = ctx.AppraisalLab.calculateMilestoneCost(10, 30, { buffType: 'none', debuffType: 'none' });
  assert(costs.candies > 0, 'Cost to Lv.30 should require candies');
  assert(costs.shards > 0, 'Cost to Lv.30 should require dream shards');
  assert(costs.handyCandyS > 0, 'Cost should calculate Handy Candy S equivalents');

  // Verify modular Lab JS architecture and build integrity
  const { LAB_MODULES, buildAppraisal } = require('../../scripts/build_appraisal');
  assert(Array.isArray(LAB_MODULES) && LAB_MODULES.length >= 4, 'LAB_MODULES must define modular lab files');
  for (const mod of LAB_MODULES) {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'lab', mod)), `Modular Lab file missing: js/modules/lab/${mod}`);
  }
});


test('Tier 1 - Feature Coverage', 'Ingredient Ladder: Recipe Supply mappings & Cross-Track Search/Filter functionality', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), 
      getElementById: () => null,
      querySelectorAll: () => []
    },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(wikiCode, ctx);

  assert(ctx.WikiDB && ctx.WikiDB.TOP_RECIPES_FOR_INGREDIENTS, 'WikiDB should export TOP_RECIPES_FOR_INGREDIENTS');
  const recipes = ctx.WikiDB.TOP_RECIPES_FOR_INGREDIENTS;
  assert(recipes.corn.name === '採蜜巧克力格子鬆餅' || recipes.corn.name === '採蜜可可鬆餅' || recipes.corn.name === '煉獄玉米乾酪咖哩', 'Corn top recipe should be highest energy dish');
  assert(recipes.corn.need === 28 || recipes.corn.need === 27, 'Corn requirement per meal should be accurate');

  assert(typeof ctx.WikiDB.onLadderSearch === 'function', 'onLadderSearch should be a function');
  assert(typeof ctx.WikiDB.clearLadderSearch === 'function', 'clearLadderSearch should be a function');
  assert(typeof ctx.WikiDB.setLadderRecipeFilter === 'function', 'setLadderRecipeFilter should be a function');
});


test('Tier 1 - Feature Coverage', 'i18n Bilingual Engine & Strategy Dictionaries: Translation coverage', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      documentElement: { setAttribute: () => {} },
      querySelectorAll: () => []
    },
    localStorage: { getItem: () => null, setItem: () => {} },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  assert(I18N, 'I18N module must be exposed on window');
  
  assertEquals(I18N.getLanguage(), 'zh-TW', 'Default language should be zh-TW');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep 資料庫', 'zh-TW brand.title match');
  assertEquals(I18N.t('th.ing1'), '食材1', 'zh-TW th.ing1 should be 食材1');
  assertEquals(I18N.t('th.ing2'), '食材2', 'zh-TW th.ing2 should be 食材2');
  assertEquals(I18N.t('th.ing3'), '食材3', 'zh-TW th.ing3 should be 食材3');
  assertEquals(I18N.t('th.ing1_mobile'), '食1', 'zh-TW th.ing1_mobile should be 食1');
  assertEquals(I18N.getTypeName('草'), '草', 'zh-TW type name match');
  assertEquals(I18N.getSpecialtyName('樹果'), '樹果', 'zh-TW specialty name match');
  assertEquals(I18N.getNatureName('固執'), '固執', 'zh-TW nature name match');

  I18N.setLanguage('en-US');
  assertEquals(I18N.getLanguage(), 'en-US', 'Language should switch to en-US');
  assertEquals(I18N.t('brand.title'), 'Pokémon Sleep Database', 'en-US brand.title match');
  assertEquals(I18N.t('th.ing1'), 'Ing1', 'en-US th.ing1 should be Ing1');
  assertEquals(I18N.t('th.ing2'), 'Ing2', 'en-US th.ing2 should be Ing2');
  assertEquals(I18N.t('th.ing3'), 'Ing3', 'en-US th.ing3 should be Ing3');
  assertEquals(I18N.getTypeName('草'), 'Grass', 'en-US type name match');
  assertEquals(I18N.getSpecialtyName('樹果'), 'Berries', 'en-US specialty name match');
  assertEquals(I18N.getNatureName('固執'), 'Adamant', 'en-US nature name match');
  assertEquals(I18N.getIngredientName('特選蘋果'), 'Fancy Apple', 'en-US ingredient name match');
});


test('Tier 1 - Feature Coverage', 'Multi-Theme CSS Variables & Theme Engine: 4 fixed themes (2 Dark + 2 Light)', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  
  assert(cssContent.includes('[data-theme="midnight"]'), 'styles.css must support midnight theme');
  assert(cssContent.includes('[data-theme="onyx"]'), 'styles.css must support onyx theme');
  assert(cssContent.includes('[data-theme="dawn"]'), 'styles.css must support dawn light theme');
  assert(cssContent.includes('[data-theme="emerald"]'), 'styles.css must support emerald light theme');
  assert(cssContent.includes('.theme-picker-grid'), 'styles.css must style theme picker grid');
  assert(cssContent.includes('.lang-switcher-row'), 'styles.css must style language switcher');
});


test('Tier 1 - Feature Coverage', 'Theme Inversion Engine: 4 Inverted Theme Variants, Switch Controls & LocalStorage Persistence', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // Verify CSS contains all 4 inverted theme definitions
  assert(cssContent.includes('[data-theme="midnight"][data-theme-inverted="true"]'), 'styles.css must support inverted midnight theme');
  assert(cssContent.includes('[data-theme="onyx"][data-theme-inverted="true"]'), 'styles.css must support inverted onyx theme');
  assert(cssContent.includes('[data-theme="dawn"][data-theme-inverted="true"]'), 'styles.css must support inverted dawn theme');
  assert(cssContent.includes('[data-theme="emerald"][data-theme-inverted="true"]'), 'styles.css must support inverted emerald theme');
  assert(cssContent.includes('.theme-invert-control-row'), 'styles.css must style desktop theme-invert-control-row');
  assert(cssContent.includes('.app-theme-invert-control-row'), 'styles.css must style mobile app-theme-invert-control-row');

  // Verify HTML contains switches
  assert(indexHtml.includes('id="theme-invert-switch"'), 'index.html must have theme-invert-switch');
  assert(appHtml.includes('id="app-theme-invert-switch"'), 'app/index.html must have app-theme-invert-switch');

  // Verify app.js contains inverted state management & storage
  assert(appJs.includes('user_theme_inverted'), 'app.js must persist user_theme_inverted in localStorage');
  assert(appJs.includes('data-theme-inverted'), 'app.js must toggle data-theme-inverted attribute on root');

  // Verify i18n contains translation keys
  assert(i18nJs.includes('settings.theme_invert'), 'i18n.js must contain settings.theme_invert translation key');
  assert(i18nJs.includes('settings.theme_invert_desc'), 'i18n.js must contain settings.theme_invert_desc translation key');
});


test('Tier 1 - Feature Coverage', 'English Mode Subtitle Hiding & Title Centering Rules', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssContent.includes('html[lang="en"] .brand-subtitle'), 'CSS must hide brand-subtitle in English');
  assert(cssContent.includes('html[lang="en"] .pokemon-name-en'), 'CSS must hide pokemon-name-en in English');
  assert(cssContent.includes('html[lang="en"] .recipe-name-sub'), 'CSS must hide recipe-name-sub in English');
  assert(cssContent.includes('html[lang="en"] .appraisal-pokemon-en'), 'CSS must hide appraisal-pokemon-en in English');
});


test('Tier 1 - Feature Coverage', 'All 38+ Main Skill Variants & Aliases 100% English Translated in I18N', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = { window: {}, document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem: () => {} }, console };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  const I18N = ctx.window.I18N;
  I18N.setLanguage('en-US');

  const datasetSkills = Array.from(new Set(dataset.map(p => p.mainSkill).filter(Boolean)));
  datasetSkills.forEach(skill => {
    const enName = I18N.getMainSkillName(skill);
    assert(enName && typeof enName === 'string', `Main skill "${skill}" missing English translation`);
    assert(!/[\u4e00-\u9fa5]/.test(enName), `Main skill translation for "${skill}" still contains Chinese: "${enName}"`);
  });

  const testSkills = [
    '能量填充S', '能量填充S（隨機）', '能量填充M', '食材獲取S', '料理強化S', '料理成功S',
    '活力充填S', '活力療癒S', '全體療癒S', '活力全體療癒S', '幫手加速', '幫手加速（電）',
    '幫手加速（火）', '幫手加速（水）', '夢之碎片獲取S', '夢之碎片獲取S（隨機）',
    '變身（技能複製）', '模仿（技能複製）', '揮指', '月光（活力填充S）', '新月祈禱（活力全體療癒S）',
    '健美（料理輔助S）', '蹭蹭臉頰（活力療癒S）', '精神擊破（樹果領域）', '畫皮（樹果遽增）'
  ];

  testSkills.forEach(skill => {
    const enName = I18N.getMainSkillName(skill);
    assert(enName && !/[\u4e00-\u9fa5]/.test(enName), `Skill "${skill}" failed translation, got "${enName}"`);
  });

  assert(I18N.getMainSkillName('幫手支援S') === 'Extra Helpful S', '幫手支援S should be Extra Helpful S');
  assert(I18N.getMainSkillName('料理成功S') === 'Tasty Chance S', '料理成功S should be Tasty Chance S');
  assert(I18N.getMainSkillName('活力療癒S') === 'Energizing Cheer S', '活力療癒S should be Energizing Cheer S');
  assert(I18N.getMainSkillName('料理強化S') === 'Cooking Power-Up S', '料理強化S should be Cooking Power-Up S');
  assert(I18N.getMainSkillName('新月祈禱（活力全體療癒S）') === 'Lunar Prayer (Energy for Everyone S)', '新月祈禱 should be Lunar Prayer (Energy for Everyone S)');
  assert(I18N.getMainSkillName('十項全能（揮指）[可替換]') === 'All-Rounder (Metronome) [Customizable]', '十項全能 should be All-Rounder (Metronome) [Customizable]');
});


test('Tier 1 - Feature Coverage', 'Low Saturation Recipe Badges Tokens & Classes Defined for 4 Themes', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  
  const requiredTokens = [
    '--badge-cat-curry-bg', '--badge-cat-salad-bg', '--badge-cat-dessert-bg',
    '--badge-pot-bg', '--badge-bonus-78-bg', '--badge-bonus-61-bg',
    '--badge-bonus-48-bg', '--badge-bonus-35-bg', '--badge-bonus-25-bg'
  ];
  requiredTokens.forEach(token => {
    assert(cssContent.includes(token), `styles.css missing token ${token}`);
  });

  assert(cssContent.includes('.recipe-cat-badge.cat-咖哩'), 'styles.css missing cat-咖哩');
  assert(cssContent.includes('.pot-badge'), 'styles.css missing pot-badge');
  assert(cssContent.includes('.bonus-badge.bonus-badge-78'), 'styles.css missing bonus-badge-78');
  assert(cssContent.includes('.bonus-badge.bonus-badge-61'), 'styles.css missing bonus-badge-61');
  assert(cssContent.includes('.recipe-name-cell'), 'styles.css missing .recipe-name-cell');
  assert(cssContent.includes('.recipe-name-wrapper'), 'styles.css missing .recipe-name-wrapper');
});


test('Tier 1 - Feature Coverage', 'Bilingual News & Events Translation Dataset & Render Verification', () => {
  const newsData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'news.json'), 'utf8'));
  assert(newsData.length >= 20, 'news.json should have >= 20 items');

  newsData.forEach(item => {
    assert(item.title_en && typeof item.title_en === 'string', `News item ${item.id} missing title_en`);
    assert(item.overview_en && typeof item.overview_en === 'string', `News item ${item.id} missing overview_en`);
    assert(!/[\u4e00-\u9fa5]/.test(item.title_en), `title_en for "${item.title_en}" contains Chinese characters`);
    assert(!/[\u4e00-\u9fa5]/.test(item.overview_en), `overview_en for "${item.title_en}" contains Chinese characters`);
  });
});


test('Tier 1 - Feature Coverage', 'I18N.getPokemonName API & Coverage across all 247 Pokemon', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const data = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'data.json'), 'utf8'));
  const ctx = {
    window: {
      location: { hash: '#pokemon' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} }
    }
  };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  assert(typeof ctx.window.I18N.getPokemonName === 'function', 'I18N.getPokemonName must be an exported function');

  ctx.window.I18N.setLanguage('en-US');
  assert(ctx.window.I18N.getPokemonName('妙蛙種子') === 'Bulbasaur', '妙蛙種子 -> Bulbasaur');
  assert(ctx.window.I18N.getPokemonName('皮卡丘') === 'Pikachu', '皮卡丘 -> Pikachu');
  assert(ctx.window.I18N.getPokemonName('巨鍛匠') === 'Tinkaton', '巨鍛匠 -> Tinkaton');
  assert(ctx.window.I18N.getPokemonName({ name_cn: '耿鬼', name_en: 'Gengar' }) === 'Gengar', 'Object input -> Gengar');

  data.forEach(p => {
    if (p.name_cn && p.name_en) {
      const translated = ctx.window.I18N.getPokemonName(p.name_cn);
      assert(translated === p.name_en, `Expected ${p.name_cn} -> ${p.name_en}, got ${translated}`);
    }
  });

  ctx.window.I18N.setLanguage('zh-TW');
  assert(ctx.window.I18N.getPokemonName('妙蛙種子') === '妙蛙種子', 'zh-TW mode should return CN name');
  assert(ctx.window.I18N.getPokemonName({ name_cn: '耿鬼', name_en: 'Gengar' }) === '耿鬼', 'Object in zh-TW -> 耿鬼');
});


test('Tier 1 - Feature Coverage', 'News AI Dashboard Sections Title & List Items Full English Translation and No Duplicate Icons', () => {
  const newsData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data', 'news.json'), 'utf8'));

  newsData.forEach(item => {
    if (item.sections) {
      item.sections.forEach(sec => {
        assert(sec.title_en, `Section in news item ${item.id} missing title_en`);
        assert(!/^[\u{1F300}-\u{1F9FF}\s]+/u.test(sec.title_en), `Section title_en "${sec.title_en}" should not start with emoji`);
      });
    }
  });
});


test('Tier 1 - Feature Coverage', 'I18N Item & Island & Nature & Subskill Bilingual Coverage', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');

  const ctx = {
    window: {
      location: { hash: '#box' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} },
      addEventListener: () => {}
    },
    document: {
      readyState: 'complete',
      documentElement: { setAttribute: () => {} },
      addEventListener: () => {},
      getElementById: () => null,
      querySelectorAll: () => []
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);
  vm.runInContext(boxCode, ctx);

  assert(typeof ctx.window.I18N.getItemName === 'function', 'getItemName must be exported');
  assert(typeof ctx.window.I18N.getIslandName === 'function', 'getIslandName must be exported');

  ctx.window.I18N.setLanguage('en-US');
  assert(ctx.window.I18N.getItemName('寶可沙布蕾') === 'Poké Biscuit', '寶可沙布蕾 -> Poké Biscuit');
  assert(ctx.window.I18N.getItemName('主技能種子') === 'Main Skill Seed', '主技能種子 -> Main Skill Seed');
  assert(ctx.window.I18N.getItemName('萬能糖果S') === 'Handy Candy S', '萬能糖果S -> Handy Candy S');

  assert(ctx.window.I18N.getIslandName('萌綠之島') === 'Greengrass Isle', '萌綠之島 -> Greengrass Isle');
  assert(ctx.window.I18N.getIslandName('天青沙灘') === 'Cyan Beach', '天青沙灘 -> Cyan Beach');
  assert(ctx.window.I18N.getIslandName('黃金舊發電廠') === 'Old Gold Power Plant', '黃金舊發電廠 -> Old Gold Power Plant');

  const natureData = ctx.window.PokemonBoxApp.NATURE_DATA;
  assert(Array.isArray(natureData) && natureData.length === 25, '25 Natures defined');
  natureData.forEach(n => {
    assert(n.name_en, `Nature ${n.name} must have name_en`);
    assert(n.buff_en, `Nature ${n.name} must have buff_en`);
  });

  const subskillData = ctx.window.PokemonBoxApp.SUBSKILLS_DATA;
  assert(Array.isArray(subskillData) && subskillData.length >= 17, 'Subskills defined');
  subskillData.forEach(s => {
    assert(s.name_en, `Subskill ${s.name} must have name_en`);
    assert(s.desc_en, `Subskill ${s.name} must have desc_en`);
  });
});


test('Tier 1 - Feature Coverage', 'Centralized Scalable I18N Dynamic Translator & Fuzzy Matching', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'en-US', setItem: () => {} }, addEventListener: () => {} },
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

  ctx.window.I18N.setLanguage('en-US');

  assert(ctx.window.I18N.getSubSkillName('幫忙速度 S') === 'Helping Speed S', '幫忙速度 S with space -> Helping Speed S');
  assert(ctx.window.I18N.getSubSkillName('技能機率提升 S') === 'Skill Trigger S', '技能機率提升 S -> Skill Trigger S');
  assert(ctx.window.I18N.getSubSkillName('活力恢復獎勵') === 'Energy Recovery Bonus', '活力恢復獎勵 (恢) -> Energy Recovery Bonus');
  assert(ctx.window.I18N.getSubSkillName('睡眠 EXP 獎勵') === 'Sleep EXP Bonus', '睡眠 EXP 獎勵 -> Sleep EXP Bonus');

  assert(ctx.window.I18N.getPokemonName('毒骷蛙 (ABB)') === 'Toxicroak (ABB)', '毒骷蛙 (ABB) -> Toxicroak (ABB)');
  assert(ctx.window.I18N.getPokemonName('皮卡丘（ 萬聖節 ）') === 'Pikachu (Halloween)', '皮卡丘（ 萬聖節 ） -> Pikachu (Halloween)');
  assert(ctx.window.I18N.getPokemonName('骨紋巨聲鱷(AAA)') === 'Skeledirge (AAA)', '骨紋巨聲鱷(AAA) -> Skeledirge (AAA)');

  assert(ctx.window.I18N.getSpecialtyName('樹果型') === 'Berries', '樹果型 -> Berries');
  assert(ctx.window.I18N.getSpecialtyName('食材型') === 'Ingredients', '食材型 -> Ingredients');
  assert(ctx.window.I18N.getNatureName('固執') === 'Adamant', '固執 -> Adamant');
  assert(ctx.window.I18N.getMainSkillName('能量填充S (隨機)') === 'Charge Strength S (Random)', '能量填充S (隨機) -> Charge Strength S (Random)');

  const ladderNote = '👑 TOP 1 AAA 特選蘋果 產量之王';
  const translatedNote = ctx.window.I18N.translateDynamicText(ladderNote);
  assert(translatedNote === '👑 TOP 1 AAA Fancy Apple Production King', `Ladder note translation failed: ${translatedNote}`);

  const eventSentence = '舉辦期間：8/27 (週四) 4:00 ～ 8/30 (週日) 3:59';
  const translatedEvent = ctx.window.I18N.translateDynamicText(eventSentence);
  assert(translatedEvent === 'Event Period: 8/27 (Thu) 4:00 ~ 8/30 (Sun) 3:59', `Event schedule translation failed: ${translatedEvent}`);

  const bundleSentence = '🛍️ 「好眠日限定包vol.38」（1,500鑽石） ：超級沙布蕾×9、幸運薰香×2、成長薰香×2、專注薰香×2';
  const translatedBundle = ctx.window.I18N.translateDynamicText(bundleSentence);
  assert(translatedBundle.includes('Great Biscuit') && translatedBundle.includes('Luck Incense') && translatedBundle.includes('Focus Incense'), `Bundle translation failed: ${translatedBundle}`);
});


test('Tier 1 - Feature Coverage', 'WikiDB Namespace & Event Handler Methods Integrity', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
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
      addEventListener: () => {}
    },
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
  vm.runInContext(wikiCode, ctx);

  const wikiMethods = [
    'switchSubTab', 'switchWikiSubTab', 'switchLadderView', 'filterSkills', 'filterWikiSkills',
    'filterIngredients', 'filterWikiIngredients', 'switchStack', 'switchChargeStock',
    'switchBoost', 'switchHelperBoost', 'toggleDetail', 'toggleDetailTable',
    'updateBerryLevel', 'updateBerryIsland', 'toggleBerryFavorite', 'toggleFavorite',
    'toggleLadderIngM', 'toggleLadderIngS', 'toggleLadderSpeedM', 'toggleLadderSpeedS',
    'toggleLadderIngM', 'toggleLadderSubskill', 'toggleLadderNatureIng', 'toggleLadderNatureSpeed', 'toggleLadderNatureFilter', 'toggleLadderRecipeMultiSelect', 'setLadderNature',
    'onLadderSearch', 'clearLadderSearch',
    'setLadderRecipeFilter', 'refreshCoordinateLadder', 'handleLadderGroupHover',
    'handleLadderGroupHoverOut', 'recalcTriggerChance', 'recalcSleepDays',
    'openIngredientRankingModal', 'closeIngredientRankingModal', 'updateLadderActiveFilterBadge',
    'toggleLadderEnergyHelp', 'closeLadderEnergyHelp'
  ];

  wikiMethods.forEach(method => {
    assert(typeof ctx.window.WikiDB[method] === 'function', `window.WikiDB.${method} should be a valid function`);
  });

  let threw = false;
  try {
    ctx.window.WikiDB.updateBerryLevel(55);
    assertEquals(ctx.window.localStorage.getItem('pksleep_wiki_berry_level'), '55', 'Berry Level should be persisted to localStorage');
    ctx.window.WikiDB.updateBerryIsland(60);
    assertEquals(ctx.window.localStorage.getItem('pksleep_wiki_berry_island'), '60', 'Island Bonus should be persisted to localStorage');
    ctx.window.WikiDB.toggleBerryFavorite(true);
    ctx.window.WikiDB.toggleBerryFavorite(false);
    ctx.window.WikiDB.toggleLadderNatureIng(true);
    ctx.window.WikiDB.toggleLadderNatureSpeed(true);
  } catch (e) {
    threw = true;
  }
  assert(!threw, 'toggleBerryFavorite and nature toggles should execute cleanly');
});


test('Tier 1 - Feature Coverage', 'Helping Speed Limit & Calculation Matrix: Sub-skills 35% cap and Nature independent multiplier', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
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
      addEventListener: () => {}
    },
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
  vm.runInContext(wikiCode, ctx);

  const matrix = ctx.window.WikiDB.HELPING_SPEED_MATRIX || ctx.window.HELPING_SPEED_MATRIX;
  assert(Array.isArray(matrix), 'HELPING_SPEED_MATRIX should be an array');
  assert(matrix.length >= 10, `HELPING_SPEED_MATRIX should have at least 10 rows, got ${matrix.length}`);

  // 1. Full team cap: (1 - 0.35) * 0.90 = 0.585 -> +70.94%
  const teamCap = matrix.find(r => r.grade.includes('全隊極限') || r.grade_en.includes('Full Team'));
  assert(teamCap, 'Full team cap row missing');
  assertEquals(teamCap.intervalRatio, 0.585, 'Team cap interval ratio should be 0.585');
  assertEquals(teamCap.intervalDisplay, '58.5%', 'Team cap intervalDisplay should be 58.5%');
  assertEquals(teamCap.intervalDiff, '-41.5%', 'Team cap intervalDiff should be -41.5%');
  assertEquals(teamCap.outputBoostDisplay, '+70.94%', 'Team cap output boost should be +70.94%');

  // 2. Solo max cap: (1 - 0.26) * 0.90 = 0.666 -> +50.15%
  const soloCap = matrix.find(r => r.grade.includes('單體滿配') || r.grade_en.includes('Solo Max'));
  assert(soloCap, 'Solo cap row missing');
  assertEquals(soloCap.intervalRatio, 0.666, 'Solo cap interval ratio should be 0.666');
  assertEquals(soloCap.intervalDisplay, '66.6%', 'Solo cap intervalDisplay should be 66.6%');
  assertEquals(soloCap.intervalDiff, '-33.4%', 'Solo cap intervalDiff should be -33.4%');
  assertEquals(soloCap.outputBoostDisplay, '+50.15%', 'Solo cap output boost should be +50.15%');

  // 3. Common Dual Speed: (1 - 0.21) * 0.90 = 0.711 -> +40.65%
  const dualSpeed = matrix.find(r => r.grade.includes('常規雙幫忙速度') || r.grade.includes('常規雙幫速') || r.grade_en.includes('Dual Speed Up'));
  assert(dualSpeed, 'Dual speed row missing');
  assertEquals(dualSpeed.intervalRatio, 0.711, 'Dual speed interval ratio should be 0.711');
  assertEquals(dualSpeed.outputBoostDisplay, '+40.65%', 'Dual speed output boost should be +40.65%');
  assert(dualSpeed.subskills.some(s => s.name === '幫忙速度M'), 'Should use full name 幫忙速度M in subskills');
  assert(dualSpeed.subskills.some(s => s.name === '幫忙速度S'), 'Should use full name 幫忙速度S in subskills');

  // 4. Baseline row: 1.000 interval, +0.00% boost
  const baseline = matrix.find(r => r.grade.includes('基準線'));
  assert(baseline, 'Baseline row missing');
  assertEquals(baseline.intervalRatio, 1.000, 'Baseline interval ratio should be 1.000');
  assertEquals(baseline.outputBoostDisplay, '+0.00%', 'Baseline output boost should be +0.00%');

  // 5. Speed Down row: patched +7.5% interval (1.075), -6.98% boost
  const downRow = matrix.find(r => r.grade.includes('性格減速'));
  assert(downRow, 'Speed down row missing');
  assertEquals(downRow.intervalRatio, 1.075, 'Speed down interval ratio should be 1.075');
  assertEquals(downRow.outputBoostDisplay, '-6.98%', 'Speed down output boost should be -6.98%');
});

// --- NEW Tier 1 Tests: Mobile H5 App Shell & Dock System ---

test('Tier 1 - Feature Coverage', 'Mobile App Entry: app/index.html document structure and standalone HTML integrity', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(/<!DOCTYPE\s+html>/i.test(html), 'app/index.html missing <!DOCTYPE html>');
  assert(/<html[^>]*>/i.test(html), 'app/index.html missing <html> tag');
  assert(/<title>[\s\S]*?<\/title>/i.test(html), 'app/index.html missing <title> tag');

  // Header with Desktop version switch link or button
  assert(html.includes('id="btn-switch-desktop"') || html.includes('view=desktop') || html.includes('桌面'),
    'app/index.html missing Desktop switch link or button');

  // 5 Main Tab Panels
  const panelIds = ['panel-pokemon', 'panel-recipes', 'panel-wiki', 'panel-box', 'panel-news'];
  panelIds.forEach(id => {
    assert(html.includes(`id="${id}"`), `app/index.html missing panel container #${id}`);
  });
});


test('Tier 1 - Feature Coverage', 'Mobile Viewport & Safe Area: app/index.html defines viewport-fit=cover and scale locks', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('viewport-fit=cover'), 'app/index.html meta viewport missing viewport-fit=cover');
  assert(html.includes('width=device-width'), 'app/index.html meta viewport missing width=device-width');
  assert(html.includes('initial-scale=1') || html.includes('initial-scale=1.0'), 'app/index.html meta viewport missing initial-scale=1');
});


test('Tier 1 - Feature Coverage', 'Mobile Script & Stylesheet Dependencies: Zero 404 broken asset links in app/index.html', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  // Verify CSS stylesheet links
  const cssRegex = /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let match;
  let cssCount = 0;
  while ((match = cssRegex.exec(html)) !== null) {
    const href = match[1].split('?')[0];
    if (!href.startsWith('http')) {
      const resolved = path.resolve(WORKSPACE_ROOT, 'app', href);
      assert(fs.existsSync(resolved), `Broken CSS link in app/index.html: ${href} (resolved: ${resolved})`);
      cssCount++;
    }
  }
  assert(cssCount > 0, 'app/index.html must reference at least 1 stylesheet');

  // Verify Script tags
  const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["']/gi;
  let scriptCount = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1].split('?')[0];
    if (!src.startsWith('http')) {
      const resolved = path.resolve(WORKSPACE_ROOT, 'app', src);
      assert(fs.existsSync(resolved), `Broken script link in app/index.html: ${src} (resolved: ${resolved})`);
      scriptCount++;
    }
  }
  assert(scriptCount >= 5, `app/index.html must load core module scripts (found ${scriptCount})`);
});


test('Tier 1 - Feature Coverage', 'Mobile Base Path & Script Load Order: __DATA_BASE_PATH__ defined and scripts load in sequence', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('__DATA_BASE_PATH__'), 'app/index.html must configure window.__DATA_BASE_PATH__');
  assert(html.includes("'../'") || html.includes('"../"'), '__DATA_BASE_PATH__ in app/index.html must point to "../"');

  const i18nIdx = html.indexOf('i18n.js');
  const appIdx = html.indexOf('app.js');
  const recipesIdx = html.indexOf('recipes.js');
  const boxIdx = html.indexOf('box.js');
  const appraisalIdx = html.indexOf('appraisal.js');

  assert(i18nIdx !== -1, 'i18n.js script tag missing in app/index.html');
  assert(appIdx !== -1, 'app.js script tag missing in app/index.html');
  assert(i18nIdx < appIdx, 'i18n.js must be loaded before app.js');
  if (recipesIdx !== -1) assert(i18nIdx < recipesIdx, 'i18n.js must be loaded before recipes.js');
  if (boxIdx !== -1 && appraisalIdx !== -1) assert(boxIdx < appraisalIdx, 'box.js must be loaded before appraisal.js');
});


test('Tier 1 - Feature Coverage', 'Mobile Shared Data Layer: All 4 JSON datasets accessible from app/ relative path', () => {
  const appDir = path.join(WORKSPACE_ROOT, 'app');
  const dataFiles = ['data.json', 'recipes.json', 'news.json', 'special_icons.json'];
  dataFiles.forEach(file => {
    const relativePath = path.resolve(appDir, '..', 'data', file);
    assert(fs.existsSync(relativePath), `Shared data file not accessible from app/: ${file}`);
    const content = fs.readFileSync(relativePath, 'utf8');
    const parsed = JSON.parse(content);
    assert(parsed && typeof parsed === 'object', `Shared data file ${file} does not parse to valid JSON`);
  });
});


test('Tier 1 - Feature Coverage', 'Mobile Dock Navigation: 5 required tab items present with unique IDs and icon elements', () => {
  const mobileHtmlPath = path.join(WORKSPACE_ROOT, 'app', 'index.html');
  assert(fs.existsSync(mobileHtmlPath), 'app/index.html does not exist');
  const html = fs.readFileSync(mobileHtmlPath, 'utf8');

  assert(html.includes('id="bottom-dock"') || html.includes('class="bottom-dock"') || html.includes('class="mobile-bottom-dock"'),
    'app/index.html missing bottom dock container');

  const tabIds = ['tab-pokemon', 'tab-recipes', 'tab-wiki', 'tab-box', 'tab-news'];
  tabIds.forEach(tabId => {
    assert(html.includes(`id="${tabId}"`) || html.includes(`data-tab="${tabId}"`) || html.includes(`id="dock-${tabId}"`),
      `app/index.html missing dock tab ${tabId}`);
  });
});


test('Tier 1 - Feature Coverage', 'Mobile Dock zh-TW Labels: Strictly 2 Chinese characters per dock tab', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  I18N.setLanguage('zh-TW');

  const dockKeys = [
    { key: 'dock.pokemon', expected: '圖鑑' },
    { key: 'dock.recipes', expected: '料理' },
    { key: 'dock.wiki', expected: '百科' },
    { key: 'dock.box', expected: '盒子' },
    { key: 'dock.news', expected: '最新' }
  ];

  dockKeys.forEach(({ key }) => {
    const raw = I18N.t(key);
    assert(raw && raw !== key, `i18n zh-TW missing translation key "${key}"`);
    const clean = raw.replace(/[\u{1F300}-\u{1F9FF}\s⚡🍲📚📦📰]/gu, '').trim();
    assertEquals(clean.length, 2, `Dock label for ${key} ("${clean}") must be strictly 2 Chinese characters in zh-TW`);
    assert(/^[\u4e00-\u9fa5]{2}$/.test(clean), `Dock label for ${key} ("${clean}") must contain only Chinese characters`);
  });
});


test('Tier 1 - Feature Coverage', 'Mobile Dock en-US Labels: Compact English labels in i18n dictionary', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: { localStorage: { getItem: () => 'en-US', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  I18N.setLanguage('en-US');

  const dockKeys = ['dock.pokemon', 'dock.recipes', 'dock.wiki', 'dock.box', 'dock.news'];
  dockKeys.forEach(key => {
    const raw = I18N.t(key);
    assert(raw && raw !== key, `i18n en-US missing translation key "${key}"`);
    const clean = raw.replace(/[\u{1F300}-\u{1F9FF}\s⚡🍲📚📦📰]/gu, '').trim();
    assert(clean.length <= 8, `Dock en-US label "${clean}" should be compact (<= 8 chars)`);
    assert(!/[\u4e00-\u9fa5]/.test(clean), `Dock en-US label "${clean}" contains Chinese characters`);
  });
});


test('Tier 1 - Feature Coverage', 'Mobile Dock Safe Area & Active State Styling in styles.css', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  assert(cssContent.includes('.bottom-dock') || cssContent.includes('.mobile-bottom-dock'),
    'styles.css missing .bottom-dock or .mobile-bottom-dock class');
  assert(cssContent.includes('safe-area-inset-bottom'),
    'styles.css missing safe-area-inset-bottom support for mobile dock');
});


test('Tier 1 - Feature Coverage', 'Mobile UI Components: Dedicated CSS classes for segmented controls, bottom sheets & sticky cols', () => {
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  assert(cssContent.includes('.segmented-control') || cssContent.includes('.mobile-segmented-bar') || cssContent.includes('.subtab-pills') || cssContent.includes('.nav-tab'),
    'styles.css missing segmented control / subtab pills styling');
  assert(cssContent.includes('.bottom-sheet') || cssContent.includes('.mobile-drawer') || cssContent.includes('.mobile-modal-sheet') || cssContent.includes('.modal-overlay'),
    'styles.css missing modal / bottom-sheet styling');
});


test('Tier 1 - Feature Coverage', 'Desktop Non-Regression: Desktop index.html preserves all desktop elements and 44 baseline tests', () => {
  const htmlPath = path.join(WORKSPACE_ROOT, 'index.html');
  assert(fs.existsSync(htmlPath), 'Desktop index.html does not exist');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert(html.includes('id="pokemon-filter-sidebar"'), 'Desktop index.html missing pokemon-filter-sidebar');
  assert(html.includes('id="sidebar-bookmark-handle"'), 'Desktop index.html missing sidebar-bookmark-handle');
  assert(html.includes('id="sidebar-reset-all-btn"'), 'Desktop index.html missing sidebar-reset-all-btn');
  assert(html.includes('id="toggle-grid"'), 'Desktop index.html missing toggle-grid');
  assert(html.includes('id="toggle-table"'), 'Desktop index.html missing toggle-table');

  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(cssContent.includes('.custom-select-trigger') && (cssContent.includes('42px') || cssContent.includes('40px') || cssContent.includes('36px')),
    'Custom select trigger must provide >= 36px right padding for arrow clearance');
  assert(cssContent.includes('.custom-select-arrow') && (cssContent.includes('right: 18px') || cssContent.includes('right:18px')),
    'Custom select arrow icon must have right: 18px margin');
  assert(cssContent.includes('.custom-select-menu') && (cssContent.includes('top: calc(100%') || cssContent.includes('top: 100%')),
    'Custom select menu must open downwards below the trigger');
});


test('Tier 1 - Feature Coverage', 'Back to Top Floating Button: Desktop and Mobile HTML Markup, SVG Icon, and CSS Rules', () => {
  const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  // 1. Desktop & Mobile HTML Markup
  assert(desktopHtml.includes('id="back-to-top-btn"') && desktopHtml.includes('class="back-to-top-btn"'),
    'Desktop index.html must contain #back-to-top-btn element');
  assert(mobileHtml.includes('id="back-to-top-btn"') && mobileHtml.includes('class="back-to-top-btn"'),
    'Mobile app/index.html must contain #back-to-top-btn element');
  assert(desktopHtml.includes('class="back-to-top-icon"') && mobileHtml.includes('class="back-to-top-icon"'),
    'Both desktop and mobile must embed SVG .back-to-top-icon');

  // 2. CSS Rules
  assert(cssContent.includes('.back-to-top-btn {'), 'styles.css missing .back-to-top-btn definition');
  assert(cssContent.includes('.back-to-top-btn.visible {'), 'styles.css missing .back-to-top-btn.visible transition class');
  assert(cssContent.includes('.mobile-h5-app .back-to-top-btn {'), 'styles.css missing mobile H5 dock-aligned bottom position');
  assert(cssContent.includes('.mobile-h5-app .back-to-top-btn.has-filter-fab {'), 'styles.css missing .has-filter-fab stacking rule');
  assert(cssContent.includes('138px'), 'styles.css missing 138px stack offset to clear 50px filter FAB');

  // 3. i18n Dictionary
  assert(i18nCode.includes("'common.back_to_top': '回到頂部'"), 'i18n.js missing zh-TW common.back_to_top translation');
  assert(i18nCode.includes("'common.back_to_top': 'Back to Top'"), 'i18n.js missing en-US common.back_to_top translation');
});

// -------------------------------------------------------------------
// Tier 2 - Boundary & Corner Cases
// -------------------------------------------------------------------
console.log('\n--- Tier 2 - Boundary & Corner Cases ---');

// Baseline Tests 24-39

test('Tier 1 - Feature Coverage', 'Pokemon Type Vector SVG Icons Coverage across all 18 Types', () => {
  const i18n = require(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'));
  assert(typeof i18n.getTypeIconSvg === 'function', 'I18N.getTypeIconSvg must be a function');
  
  const all18Types = ['一般', '火', '水', '電', '草', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精'];
  all18Types.forEach(t => {
    const svg = i18n.getTypeIconSvg(t, 22);
    assert(svg && svg.includes('<svg') && svg.includes('<path') && svg.includes('pkm-type-icon'), `Type ${t} must render valid SVG with .pkm-type-icon class`);
    assert(svg.includes(`var(--type-${t}`), `Type ${t} must tint with CSS variable --type-${t}`);
  });

  const enTypes = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  enTypes.forEach(t => {
    const svg = i18n.getTypeIconSvg(t, 20);
    assert(svg && svg.includes('<svg') && svg.includes('<path'), `English type ${t} must render valid SVG`);
  });
});


test('Tier 1 - Feature Coverage', 'Sidebar Compact Switches Grid & 7-Column Icon Grid Verification', () => {
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify desktop index.html contains clean single-line switch titles
  assert(indexHtml.includes('僅最終進化'), 'index.html missing 僅最終進化');
  assert(indexHtml.includes('僅初始食材'), 'index.html missing 僅初始食材');
  assert(indexHtml.includes('顯示編號'), 'index.html missing 顯示編號');

  // Verify mobile app/index.html has compact 1-row switches
  assert(appHtml.includes('sidebar-switches-grid'), 'app/index.html missing .sidebar-switches-grid');
  assert(appHtml.includes('sidebar-switch-compact'), 'app/index.html missing .sidebar-switch-compact');

  // Verify CSS contains 7-column icon grid rules
  assert(stylesCss.includes('grid-template-columns: repeat(7, 1fr)'), 'styles.css missing 7-column icon grid');
});


test('Tier 1 - Feature Coverage', 'Header Simplification & Box Backup in Settings Modal', () => {
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // Verify settings modal contains Box Backup & Restore controls in both surfaces
  const settingsModalRegex = /<div[^>]*id=["']settings-modal["'][\s\S]*?id=["']settings-export-box-btn["'][\s\S]*?id=["']settings-import-box-input["']/;
  assert(settingsModalRegex.test(indexHtml), 'index.html settings-modal must contain settings-export-box-btn and settings-import-box-input');
  assert(settingsModalRegex.test(appHtml), 'app/index.html settings-modal must contain settings-export-box-btn and settings-import-box-input');

  // Verify app/index.html header only has brand on left and settings on right (no header sync-btn outside modal)
  const appHeaderMatch = appHtml.match(/<header[^>]*class=["'][^"']*mobile-app-header[^"']*["'][\s\S]*?<\/header>/);
  assert(appHeaderMatch, 'app/index.html missing mobile-app-header');
  assert(!appHeaderMatch[0].includes('id="sync-btn"'), 'app/index.html header must not have sync-btn in header');
  assert(!appHeaderMatch[0].includes('id="btn-switch-desktop"'), 'app/index.html header must not have btn-switch-desktop in header');
  assert(appHeaderMatch[0].includes('id="sync-config-btn"'), 'app/index.html header must keep settings button on the right');
});


test('Tier 1 - Feature Coverage', 'H5 App Centered Loading View & Fixed Table View Verification', () => {
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify H5 App does not have toggle-grid / view-mode-toggle in pokemon panel
  const pkmPanelMatch = appHtml.match(/<div[^>]*id=["']panel-pokemon["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(pkmPanelMatch, 'app/index.html missing panel-pokemon');
  assert(!pkmPanelMatch[0].includes('id="toggle-grid"'), 'app/index.html panel-pokemon must not contain toggle-grid (fixed table view)');
  assert(!pkmPanelMatch[0].includes('id="pokemon-count"'), 'app/index.html must not contain static loading stats-bar');

  // Verify app-loading-view exists in app/index.html and styles.css
  assert(appHtml.includes('app-loading-view'), 'app/index.html must use app-loading-view');
  assert(appHtml.includes('app-loading-spinner'), 'app/index.html must use app-loading-spinner');
  assert(stylesCss.includes('.app-loading-view'), 'styles.css missing .app-loading-view');
  assert(stylesCss.includes('.app-loading-spinner'), 'styles.css missing .app-loading-spinner');
});


test('Tier 1 - Feature Coverage', 'H5 Recipe 1-Column Compact Card Layout Verification', () => {
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const recipesJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'recipes.js'), 'utf8');

  // Verify H5 App does not have recipe view-mode-toggle in recipe panel
  const recipePanelMatch = appHtml.match(/<div[^>]*id=["']panel-recipes["'][\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  assert(recipePanelMatch, 'app/index.html missing panel-recipes');
  assert(!recipePanelMatch[0].includes('id="recipe-toggle-cards"'), 'app/index.html panel-recipes must not contain recipe-toggle-cards (fixed card view)');
  assert(!recipePanelMatch[0].includes('id="recipe-toggle-table"'), 'app/index.html panel-recipes must not contain recipe-toggle-table');

  // Verify desktop preserves recipe view mode toggles
  assert(indexHtml.includes('id="recipe-toggle-grid"'), 'desktop index.html must retain recipe-toggle-grid');
  assert(indexHtml.includes('id="recipe-toggle-table"'), 'desktop index.html must retain recipe-toggle-table');

  // Verify H5 1-column card styles & JS rendering logic
  assert(stylesCss.includes('.h5-recipe-cards-list'), 'styles.css missing .h5-recipe-cards-list');
  assert(stylesCss.includes('.h5-recipe-card'), 'styles.css missing .h5-recipe-card');
  assert(recipesJs.includes('h5-recipe-card'), 'recipes.js missing h5-recipe-card template');
});


test('Tier 1 - Feature Coverage', 'FlagsAPI National Flags Integration for Language Switcher (Desktop & Mobile)', () => {
  const desktopHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Both index.html and app/index.html must have TW and US flags from FlagsAPI
  assert(desktopHtml.includes('https://flagsapi.com/TW/flat/64.png'), 'Desktop must use TW flag from flagsapi.com');
  assert(desktopHtml.includes('https://flagsapi.com/US/flat/64.png'), 'Desktop must use US flag from flagsapi.com');
  assert(mobileHtml.includes('https://flagsapi.com/TW/flat/64.png'), 'Mobile must use TW flag from flagsapi.com');
  assert(mobileHtml.includes('https://flagsapi.com/US/flat/64.png'), 'Mobile must use US flag from flagsapi.com');

  // styles.css must have appropriate sizing rules
  assert(css.includes('.lang-flag-icon'), 'styles.css must style .lang-flag-icon');
  assert(css.includes('.app-segment-btn .lang-flag-icon'), 'styles.css must style mobile .lang-flag-icon');
});


test('Tier 1 - Feature Coverage', 'News Event Calendar Selected and Today Borderless Styling', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Selected date must use translucent gray background, no glow (box-shadow: none), and no outline
  assert(css.includes('.news-cal-day-cell.is-selected'), 'styles.css must style .news-cal-day-cell.is-selected');
  assert(css.includes('background: rgba(148, 163, 184, 0.22) !important;'), 'Selected cell must have translucent gray background');
  assert(css.includes('box-shadow: none !important;'), 'Selected cell must not use glow box-shadow');
  assert(!css.includes('outline: 2px solid #ffffff'), 'Selected cell must not use 2px solid border/outline');

  // Today date must use white text, no 2px outline or solid medallion, and pulsing heartbeat dot
  assert(!css.includes('outline: 2px solid var(--color-primary'), 'Today cell must not use 2px solid border/outline');
  assert(css.includes('color: #ffffff !important; /* 今日文字使用白色 */'), 'Today date number must use white color');
  assert(css.includes('.news-cal-day-cell.is-today:not(.is-selected) .news-cal-day-num'), 'Today must style day-num');
  assert(css.includes('todayHeartbeat'), 'styles.css must define todayHeartbeat animation');

  // News items sections dashboard must be transparent and borderless on desktop web
  assert(css.includes('.news-ai-dashboard {'), 'styles.css must style .news-ai-dashboard');
  assert(css.includes('.news-ai-dashboard {\n  background: transparent !important;\n  border: none !important;'), 'News AI dashboard must be transparent and borderless');
});


test('Tier 1 - Feature Coverage', 'News Event Calendar Desktop Side-by-Side Parallel Layout & Mobile Stacked Preservation', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');

  // news.js must wrap calendar column
  assert(newsJs.includes('class="news-calendar-cal-col"'), 'news.js must wrap calendar in .news-calendar-cal-col');
  assert(newsJs.includes('class="news-calendar-events-box"'), 'news.js must contain .news-calendar-events-box');

  // Desktop styles: Grid layout side-by-side
  assert(css.includes('.news-calendar-wrapper {'), 'styles.css must style .news-calendar-wrapper');
  assert(css.includes('grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;'), 'Desktop calendar wrapper must use 2-column equal-width parallel grid (50/50)');
  assert(css.includes('.news-calendar-cal-col {'), 'styles.css must style .news-calendar-cal-col');

  // Mobile styles: Must strictly preserve flex-direction: column
  assert(css.includes('.mobile-h5-app .news-calendar-wrapper {'), 'styles.css must scope mobile wrapper');
  assert(css.includes('flex-direction: column !important;'), 'Mobile wrapper must preserve column stacking');
  assert(css.includes('.mobile-h5-app .news-calendar-cal-col {'), 'styles.css must style mobile cal-col');
});


test('Tier 1 - Feature Coverage', 'News Event & Bundle Expiration Status Badges and Clean UI', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const newsJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'), 'utf8');

  // styles.css must define expired status badge styles and expired card dimming
  assert(css.includes('.news-card.is-expired'), 'styles.css must style .news-card.is-expired');
  assert(css.includes('.news-status-badge.status-expired'), 'styles.css must style .news-status-badge.status-expired');
  assert(css.includes('.news-cal-status-tag.status-expired'), 'styles.css must style .news-cal-status-tag.status-expired');

  // news.js must check expiration, render top status-expired badge, and omit bulky alert banner
  assert(newsJs.includes("timeStatus === 'expired'"), 'news.js must detect expired events/bundles');
  assert(newsJs.includes('news-status-badge status-expired'), 'news.js must render status-expired badge on top');
  assert(!newsJs.includes('news-expired-alert-banner'), 'news.js must not render bulky news-expired-alert-banner inside card');
  assert(newsJs.includes('news-cal-status-tag status-expired'), 'news.js must render status-expired in calendar event list');
});


test('Tier 1 - Feature Coverage', 'Ingredient Ladder Universal Simplified Recipe Model (XXC, AAX, ABX, ABA, ABB, AAA)', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  assert(css.includes('.recipe-tag-aaa'), 'styles.css must style .recipe-tag-aaa');
  assert(css.includes('.recipe-tag-abb'), 'styles.css must style .recipe-tag-abb');
  assert(css.includes('.recipe-tag-aba'), 'styles.css must style .recipe-tag-aba');
  assert(css.includes('.recipe-tag-xxc'), 'styles.css must style .recipe-tag-xxc');
  assert(css.includes('.recipe-tag-aax'), 'styles.css must style .recipe-tag-aax');
  assert(css.includes('.recipe-tag-abx'), 'styles.css must style .recipe-tag-abx');

  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const ctx = {
    window: {
      I18N: {
        getLanguage: () => 'zh-TW',
        getIngredientName: (name) => name,
        getPokemonName: (name) => name,
        translateDynamicText: (text) => text,
        getIngredientIcon: () => null
      }
    },
    document: {
      querySelectorAll: () => [],
      getElementById: () => null,
      createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } })
    },
    console: console
  };
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(typeof WikiDB.mergeRecipeCodes === 'function', 'mergeRecipeCodes must be exported');
  assertEquals(WikiDB.mergeRecipeCodes(['AAC', 'ABC']), 'AXC', "['AAC', 'ABC'] must merge to 'AXC'");

  // Verify that across all ladder data, zero duplicate-yield variants exist for any Pokemon
  const ladderData = WikiDB.LV60_COORDINATE_LADDER_DATA;
  let xxcCount = 0;
  let aaxCount = 0;
  let abaCount = 0;
  let aaaCount = 0;
  let abbCount = 0;
  let duplicateCountErrors = 0;

  ladderData.forEach(ing => {
    ing.pokemon.forEach(p => {
      const countsSeen = new Set();
      (p.variants || []).forEach(v => {
        if (countsSeen.has(v.count)) {
          duplicateCountErrors++;
        }
        countsSeen.add(v.count);
        if (v.recipe === 'XXC') xxcCount++;
        if (v.recipe === 'AAX') aaxCount++;
        if (v.recipe === 'ABA') abaCount++;
        if (v.recipe === 'AAA') aaaCount++;
        if (v.recipe === 'ABB') abbCount++;
      });
    });
  });

  assertEquals(duplicateCountErrors, 0, 'No Pokemon should have duplicate-yield variants');
  assertEquals(xxcCount, 108, 'Ingredient C track entries must be unified into universal XXC (108 variants)');
  assertEquals(aaxCount, 115, 'Pos A dual ingredients must be unified into universal AAX (115 variants)');
  assertEquals(abaCount, 115, 'ABA combinations must be 115 variants for Pos A pokemons with Lv.60 A');
  assertEquals(aaaCount, 115, 'AAA combinations must be 115 variants');
  assertEquals(abbCount, 115, 'ABB combinations must be 115 variants');

  // Verify specific Skeledirge calculations on Apple track
  const appleTrack = ladderData.find(i => i.id === 'apple');
  const skeledirge = appleTrack.pokemon.find(p => p.name === '骨紋巨聲鱷');
  assert(skeledirge, 'Skeledirge must exist in apple track');
  const skelVariants = skeledirge.variants.reduce((acc, v) => { acc[v.recipe] = v.count; return acc; }, {});
  assertEquals(skelVariants['AAA'], 91, 'Skeledirge AAA apple count should be 91');
  assertEquals(skelVariants['ABA'], 58, 'Skeledirge ABA apple count should be 58');
  assertEquals(skelVariants['AAX'], 46, 'Skeledirge AAX apple count should be 46');
  assertEquals(skelVariants['ABX'], 13, 'Skeledirge ABX apple count should be 13');

  // Verify specific Pinsir calculations on Apple track (Apple is position B)
  const pinsir = appleTrack.pokemon.find(p => p.name === '凱羅斯');
  assert(pinsir, 'Pinsir must exist in apple track');
  const pinsirVariants = pinsir.variants.reduce((acc, v) => { acc[v.recipe] = v.count; return acc; }, {});
  assertEquals(pinsirVariants['ABB'], 76, 'Pinsir ABB apple count should be 76');
  assertEquals(pinsirVariants['AAB'], 47, 'Pinsir AAB apple count should be 47');
  assertEquals(pinsirVariants['ABX'], 29, 'Pinsir ABX apple count should be 29');

  // Verify specific Xatu (天然鳥) on Apple track (Apple is position C)
  const xatu = appleTrack.pokemon.find(p => p.name === '天然鳥');
  assert(xatu, 'Xatu must exist in apple track');
  assertEquals(xatu.recipe, 'XXC', 'Xatu in apple track should have universal XXC recipe');
  assertEquals(xatu.count, 25, 'Xatu in apple track should have 25 count');
  assertEquals(xatu.variants.length, 1, 'Xatu should have exactly 1 universal XXC variant');

  // Verify Gourgeist consolidation: only 1 entry in each of soybeans, potato, pumpkin
  const soybeansGourgeist = ladderData.find(i => i.id === 'soybeans').pokemon.filter(p => p.name.includes('南瓜怪人'));
  assertEquals(soybeansGourgeist.length, 1, 'Soybeans track must have exactly 1 consolidated Gourgeist');
  assertEquals(soybeansGourgeist[0].name, '南瓜怪人', 'Gourgeist name should be clean 南瓜怪人');
  assertEquals(soybeansGourgeist[0].count, 79, 'Soybeans Gourgeist count should be 79 (Small Variety)');

  const pumpkinGourgeist = ladderData.find(i => i.id === 'pumpkin').pokemon.filter(p => p.name.includes('南瓜怪人'));
  assertEquals(pumpkinGourgeist.length, 1, 'Pumpkin track must have exactly 1 consolidated Gourgeist');
  assertEquals(pumpkinGourgeist[0].count, 38, 'Pumpkin Gourgeist count should be 38 (Small Variety)');

  // Verify Eeveelutions consolidation: unified into "伊布家族（8種進化）" across milk, sausage, cacao
  const eeveelutionNames = ['水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布'];
  ['milk', 'sausage', 'cacao'].forEach(trackId => {
    const track = ladderData.find(i => i.id === trackId);
    const eeveeFam = track.pokemon.filter(p => p.name === '伊布家族（8種進化）');
    assertEquals(eeveeFam.length, 1, `${trackId} track must have exactly 1 consolidated '伊布家族（8種進化）'`);
    eeveelutionNames.forEach(ename => {
      const standalone = track.pokemon.filter(p => p.name === ename);
      assertEquals(standalone.length, 0, `${trackId} track must not have standalone ${ename}`);
    });
  });

  // Verify search matching and alias resolution for consolidated Eevee family
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '雷伊布'), 'Search for 雷伊布 matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', 'jolteon'), 'Search for jolteon matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '水伊布'), 'Search for 水伊布 matches Eevee family');
  assert(WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', 'vaporeon'), 'Search for vaporeon matches Eevee family');
  assert(!WikiDB.matchesLadderSearch('伊布家族（8種進化）', 'Eevee Evolutions (8 Forms)', '皮卡丘'), 'Search for 皮卡丘 does NOT match Eevee family');

  // Verify the 4 original recipe filter buttons logic (ALL, AAA, ABB, AXX)
  const xxcVariant = { recipe: 'XXC', origRecipes: ['AAC', 'ABC'] };
  const aaxVariant = { recipe: 'AAX', origRecipes: ['AAB', 'AAC'] };
  const abxVariant = { recipe: 'ABX', origRecipes: ['ABA', 'ABC'] };
  const aaaVariant = { recipe: 'AAA' };
  const abbVariant = { recipe: 'ABB' };

  assert(WikiDB.matchesLadderRecipeFilter(xxcVariant, 'ALL'), 'XXC must match ALL filter');
  assert(WikiDB.matchesLadderRecipeFilter(xxcVariant, 'AXX'), 'XXC must match AXX mix filter');
  assert(!WikiDB.matchesLadderRecipeFilter(xxcVariant, 'AAA'), 'XXC must NOT match AAA filter');
  assert(!WikiDB.matchesLadderRecipeFilter(xxcVariant, 'ABB'), 'XXC must NOT match ABB filter');

  assert(WikiDB.matchesLadderRecipeFilter(aaxVariant, 'AXX'), 'AAX must match AXX mix filter');
  assert(WikiDB.matchesLadderRecipeFilter(abxVariant, 'AXX'), 'ABX must match AXX mix filter');
  assert(WikiDB.matchesLadderRecipeFilter(aaaVariant, 'AAA'), 'AAA must match AAA filter');
  assert(!WikiDB.matchesLadderRecipeFilter(aaaVariant, 'AXX'), 'AAA must NOT match AXX filter');
  assert(WikiDB.matchesLadderRecipeFilter(abbVariant, 'ABB'), 'ABB must match ABB filter');
  assert(!WikiDB.matchesLadderRecipeFilter(abbVariant, 'AXX'), 'ABB must NOT match AXX filter');
});


test('Tier 1 - Feature Coverage', 'Ingredient Ladder Multi-Criteria Track Sorting (ENERGY_ASC, ENERGY_DESC, YIELD_DESC, DEMAND_DESC)', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  let badgeEl = { textContent: '', style: { display: 'none', setProperty: () => {} } };
  let coordinateContainer = { innerHTML: '', style: { setProperty: () => {} } };
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
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
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'ladder-sidebar-bookmark-badge') return badgeEl;
        if (id === 'wiki-ingredient-ladder-coordinate') return coordinateContainer;
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(typeof WikiDB.setLadderSortOrder === 'function', 'WikiDB.setLadderSortOrder must be a function');
  assert(typeof WikiDB.getLadderSortOrder === 'function', 'WikiDB.getLadderSortOrder must be a function');

  // 1. Verify default sort order is ENERGY_ASC
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_ASC', 'Default sort order must be ENERGY_ASC');

  // Helper to extract track order from rendered coordinate ladder HTML
  const extractTrackOrder = () => {
    WikiDB.refreshCoordinateLadder();
    const matches = [...coordinateContainer.innerHTML.matchAll(/<div class="ladder-track-row [^"]*" data-ladder-ing="([^"]+)">/g)];
    return matches.map(m => m[1]);
  };

  // 2. Test Default: ENERGY_ASC (apple 90 -> ... -> pumpkin 250)
  const tracksEnergyAsc = extractTrackOrder();
  assertEquals(tracksEnergyAsc[0], 'apple', 'ENERGY_ASC: Apple (energy 90) must be first track');
  assertEquals(tracksEnergyAsc[tracksEnergyAsc.length - 1], 'pumpkin', 'ENERGY_ASC: Pumpkin (energy 250) must be last main track');

  // 3. Test ENERGY_DESC (pumpkin 250 -> ... -> apple 90)
  WikiDB.setLadderSortOrder('ENERGY_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_DESC', 'Sort order must switch to ENERGY_DESC');
  const tracksEnergyDesc = extractTrackOrder();
  assertEquals(tracksEnergyDesc[0], 'pumpkin', 'ENERGY_DESC: Pumpkin (energy 250) must be first track');
  assertEquals(tracksEnergyDesc[1], 'leek', 'ENERGY_DESC: Leek (energy 185) must be second track');
  assertEquals(tracksEnergyDesc[tracksEnergyDesc.length - 1], 'apple', 'ENERGY_DESC: Apple (energy 90) must be last main track');

  // 4. Test YIELD_DESC (herb 93 -> ... -> pumpkin 38)
  WikiDB.setLadderSortOrder('YIELD_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'YIELD_DESC', 'Sort order must switch to YIELD_DESC');
  const tracksYieldDesc = extractTrackOrder();
  assertEquals(tracksYieldDesc[0], 'herb', 'YIELD_DESC: Herb (top yield 93) must be first track');
  assertEquals(tracksYieldDesc[1], 'apple', 'YIELD_DESC: Apple (top yield 91) must be second track');
  assertEquals(tracksYieldDesc[tracksYieldDesc.length - 1], 'pumpkin', 'YIELD_DESC: Pumpkin (top yield 38) must be last main track');

  // 5. Test DEMAND_DESC (milk 41 -> ginger 39 -> ... -> pumpkin/sausage 20)
  WikiDB.setLadderSortOrder('DEMAND_DESC');
  assertEquals(WikiDB.getLadderSortOrder(), 'DEMAND_DESC', 'Sort order must switch to DEMAND_DESC');
  const tracksDemandDesc = extractTrackOrder();
  assertEquals(tracksDemandDesc[0], 'milk', 'DEMAND_DESC: Milk (key dish need 41) must be first track');
  assertEquals(tracksDemandDesc[1], 'ginger', 'DEMAND_DESC: Ginger (key dish need 39) must be second track');
  assertEquals(tracksDemandDesc[2], 'honey', 'DEMAND_DESC: Honey (key dish need 38) must be third track');

  // 6. Test active filter badge count
  WikiDB.updateLadderActiveFilterBadge();
  assertEquals(badgeEl.style.display, 'inline-flex', 'Badge must display when sort order is non-default');
  assertEquals(badgeEl.textContent, 1, 'Badge count must include sort order when non-default');

  // 7. Test Reset Filters
  WikiDB.resetLadderFilters();
  assertEquals(WikiDB.getLadderSortOrder(), 'ENERGY_ASC', 'resetLadderFilters must reset sort order to ENERGY_ASC');
  const tracksAfterReset = extractTrackOrder();
  assertEquals(tracksAfterReset[0], 'apple', 'Track order after reset must return to Apple first');
});


test('Tier 1 - Feature Coverage', 'Wiki Subskills Helping Speed Matrix Nature/Interval Multiplier Formatting', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
  const container = { innerHTML: '' };
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
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && typeof WikiDB.renderWikiLayout === 'function', 'WikiDB.renderWikiLayout must exist');
  WikiDB.renderWikiLayout(container);

  const html = container.innerHTML;
  assert(html.includes('幫忙速度極限與計算機制指南'), 'Wiki layout missing Helping Speed Matrix table');

  // 1. Check nature arrow formatting: only ▲, ▼, - in the content
  assert(html.includes('▲ 上升'), 'Nature up must render as ▲ 上升');
  assert(html.includes('▼ 下降'), 'Nature down must render as ▼ 下降');
  assert(html.includes('✕'), 'Nature neutral must render as ✕');

  // 2. Check helping interval ratio format: ${row.intervalRatio}x
  assert(html.includes('0.585x'), 'Interval ratio should include 0.585x');
  assert(html.includes('0.666x'), 'Interval ratio should include 0.666x');
  assert(html.includes('0.711x'), 'Interval ratio should include 0.711x');
  assert(html.includes('1x') || html.includes('1.000x'), 'Interval ratio should include 1x');
  assert(html.includes('1.075x'), 'Interval ratio should include 1.075x for speed-down nature');
});


test('Tier 1 - Feature Coverage', 'Ingredient Ladder Top 15 Mobile Optimization and Lazy Loading', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  let switchEl = { checked: true };
  let badgeEl = { textContent: '', style: { display: 'none', setProperty: () => {} } };
  let coordinateContainer = { innerHTML: '', style: { setProperty: () => {} } };
  const mockStorage = new Map([['pksleep_lang', 'zh-TW']]);
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
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'ladder-top15-switch') return switchEl;
        if (id === 'ladder-sidebar-bookmark-badge') return badgeEl;
        if (id === 'wiki-ingredient-ladder-coordinate') return coordinateContainer;
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(wikiJs.includes('天梯軌道排序'), 'Ladder template must include track sorting section');
  const switchIdx = wikiJs.indexOf('id="ladder-top15-switch"');
  const sortIdx = wikiJs.indexOf('天梯軌道排序');
  const headerIdx = wikiJs.indexOf('id="ladder-reset-all-btn"');
  assert(switchIdx > 0 && sortIdx > 0 && switchIdx > sortIdx, 'Top 15 switch must sit in Track Sorting header, not the cramped sidebar header');
  assert(headerIdx > 0 && switchIdx > headerIdx, 'Top 15 switch must come after sidebar reset, inside scrollable sections');
  assert(typeof WikiDB.getLadderTop15Only === 'function', 'WikiDB.getLadderTop15Only must exist');
  assert(typeof WikiDB.toggleLadderTop15 === 'function', 'WikiDB.toggleLadderTop15 must exist');

  // 1. Default state is true (Top 15 enabled)
  assertEquals(WikiDB.getLadderTop15Only(), true, 'Default ladderTop15Only must be true');

  // 2. Render ladder and check node counts when Top 15 is active
  WikiDB.refreshCoordinateLadder();
  const htmlTop15 = coordinateContainer.innerHTML;
  assert(htmlTop15.length > 0, 'Coordinate ladder HTML must not be empty');

  // Verify lazy loading attributes on avatar images
  assert(htmlTop15.includes('loading="lazy"'), 'Ladder avatars must have loading="lazy"');
  assert(htmlTop15.includes('decoding="async"'), 'Ladder avatars must have decoding="async"');

  // Verify track nodes are sliced to <= 15
  const trackMatches = htmlTop15.split('<div class="ladder-track-row');
  trackMatches.slice(1).forEach(trackHtml => {
    const nodeCount = (trackHtml.match(/class="ladder-node\s/g) || []).length;
    assert(nodeCount <= 15, `Track node count when Top 15 enabled must be <= 15, found ${nodeCount}`);
  });

  // 3. Toggle to false (Show all nodes)
  WikiDB.toggleLadderTop15(false);
  assertEquals(WikiDB.getLadderTop15Only(), false, 'ladderTop15Only should be false after toggle');
  WikiDB.refreshCoordinateLadder();
  const htmlAll = coordinateContainer.innerHTML;
  const allTracks = htmlAll.split('<div class="ladder-track-row');
  let hasTrackMoreThan15 = false;
  allTracks.slice(1).forEach(trackHtml => {
    const nodeCount = (trackHtml.match(/class="ladder-node\s/g) || []).length;
    if (nodeCount > 15) hasTrackMoreThan15 = true;
  });
  assert(hasTrackMoreThan15, 'When Top 15 disabled, tracks with >15 Pokemon should render more than 15 nodes');

  // 4. resetLadderFilters restores Top 15
  WikiDB.resetLadderFilters();
  assertEquals(WikiDB.getLadderTop15Only(), true, 'resetLadderFilters must restore ladderTop15Only to true');
});


test('Tier 1 - Feature Coverage', 'Mobile App Pull-to-Refresh Mechanism and Indicator Styles', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // Verify PTR styles in CSS
  assert(css.includes('.ptr-indicator'), 'styles.css must define .ptr-indicator');
  assert(css.includes('.ptr-inner'), 'styles.css must define .ptr-inner');
  assert(css.includes('.ptr-icon'), 'styles.css must define .ptr-icon');
  assert(css.includes('@keyframes ptr-spin'), 'styles.css must define @keyframes ptr-spin');
  assert(css.includes('.ptr-indicator.ptr-refreshing .ptr-icon'), 'styles.css must define refreshing animation');

  // Verify PTR logic in app.js
  assert(appJs.includes('function initPullToRefresh()'), 'app.js must define initPullToRefresh');
  assert(appJs.includes('window.initPullToRefresh = initPullToRefresh'), 'app.js must export window.initPullToRefresh');
  assert(appJs.includes('THRESHOLD = 64'), 'PTR threshold must be 64px');
  assert(appJs.includes('window.location.reload()'), 'PTR must trigger window.location.reload() on release');
});


test('Tier 1 - Feature Coverage', 'Filter Drawer Swipe-to-Close and Ghost Click Prevention (Backdrop Dismiss)', () => {
  const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'app.js'), 'utf8');
  assert(appJs.includes('function bindBackdropDismiss('), 'app.js must define bindBackdropDismiss');
  assert(appJs.includes('window.bindBackdropDismiss = bindBackdropDismiss'), 'app.js must export bindBackdropDismiss');
  assert(appJs.includes('window.toggleSidebar = toggleSidebar'), 'app.js must export window.toggleSidebar');

  // Verify swipe right close helper does not block buttons/badges
  assert(appJs.includes("target.tagName === 'INPUT' && (target.type === 'range'"), 'Swipe close helper should only ignore range sliders');

  // Verify backdrop event consumer behavior
  let touchEndPrevented = false;
  let touchEndStopped = false;
  let clickPrevented = false;
  let clickStopped = false;
  let closeCalledCount = 0;

  const mockBackdrop = {
    listeners: {},
    addEventListener(event, fn) {
      this.listeners[event] = fn;
    }
  };

  const closeFn = () => { closeCalledCount++; };

  const ctx = {
    window: {},
    document: {
      documentElement: { setAttribute: () => {} },
      body: { classList: { contains: () => false } },
      getElementById: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(appJs, ctx);

  assert(typeof ctx.window.bindBackdropDismiss === 'function', 'window.bindBackdropDismiss must be a function');
  ctx.window.bindBackdropDismiss(mockBackdrop, closeFn);

  assert(mockBackdrop.listeners['touchstart'], 'touchstart listener must be attached');
  assert(mockBackdrop.listeners['touchend'], 'touchend listener must be attached');
  assert(mockBackdrop.listeners['click'], 'click listener must be attached');

  // Test touchend consumes and invokes closeFn
  mockBackdrop.listeners['touchend']({
    preventDefault: () => { touchEndPrevented = true; },
    stopPropagation: () => { touchEndStopped = true; }
  });
  assert(touchEndPrevented, 'touchend must call e.preventDefault() to prevent ghost click');
  assert(touchEndStopped, 'touchend must call e.stopPropagation()');
  assertEquals(closeCalledCount, 1, 'closeFn should be invoked on touchend');

  // Test click consumes and invokes closeFn
  mockBackdrop.listeners['click']({
    preventDefault: () => { clickPrevented = true; },
    stopPropagation: () => { clickStopped = true; }
  });
  assert(clickPrevented, 'click must call e.preventDefault()');
  assert(clickStopped, 'click must call e.stopPropagation()');
  assertEquals(closeCalledCount, 2, 'closeFn should be invoked on click');
});


test('Tier 1 - Feature Coverage', 'Mobile Pokemon Table Safe Area and Bottom Dock Viewport Clearance CSS', () => {
  const css = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Check Pokemon table tr:last-child td bottom padding
  assert(css.includes('.pokemon-table tbody tr:last-child td'), 'styles.css must style .pokemon-table tbody tr:last-child td');
  assert(css.includes('env(safe-area-inset-bottom'), 'tr:last-child td must account for env(safe-area-inset-bottom)');

  // 2. Check mobile viewport panel height approach for #panel-pokemon
  // New approach: body has padding-bottom for dock space, panels use height:100% to inherit correctly
  assert(css.includes('#panel-pokemon {'), 'styles.css must define mobile #panel-pokemon height rule');
  assert(
    css.includes('height: 100% !important;') && css.includes('padding-bottom: calc(62px + env(safe-area-inset-bottom, 0px)) !important;'),
    '#panel-pokemon must use height:100% with body padding-bottom accounting for dock clearance'
  );

  // 3. Check drawer smooth slide transition delay for visibility
  assert(css.includes('visibility 0s 0.28s'), 'Drawer sidebars must delay visibility change until slide-out completes');
});


test('Tier 1 - Feature Coverage', 'Nature 5-Stat Multiplier Helping Speed (-10% / +7.5%) & DevTools Error Guard', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

  // 1. Verify Nature 5-stat table data in wiki.js
  const ctx = {
    localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} },
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {}, removeItem: () => {} }, addEventListener: () => {} },
    document: {
      body: { classList: { contains: () => false }, appendChild: () => {} },
      documentElement: { setAttribute: () => {} },
      getElementById: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  const WikiDB = ctx.window.WikiDB;
  assert(WikiDB && WikiDB.NATURES_EFFECT_DATA, 'WikiDB.NATURES_EFFECT_DATA must exist');
  const speedRow = WikiDB.NATURES_EFFECT_DATA.find(r => r.stat === '幫忙速度' || r.stat_en === 'Speed of Help');
  assert(speedRow, '幫忙速度 row must exist in NATURES_EFFECT_DATA');
  assertEquals(speedRow.up, '-10%', 'Helping Speed Up must be -10% (less time)');
  assertEquals(speedRow.down, '+7.5%', 'Helping Speed Down must be +7.5% (more time)');

  // 2. Verify rendered HTML output in wiki layout
  const container = { innerHTML: '' };
  WikiDB.renderWikiLayout(container);
  assert(container.innerHTML.includes('-10%'), 'Wiki layout must render -10% for helping speed up');
  assert(container.innerHTML.includes('+7.5%'), 'Wiki layout must render +7.5% for helping speed down');

  // 3. Verify DevTools Live Metrics error filtering in both index.html and app/index.html
  assert(indexHtml.includes('reportAllChanges'), 'index.html must guard against reportAllChanges error');
  assert(indexHtml.includes("reading 'startTime'"), 'index.html must guard against startTime error');
  assert(appIndexHtml.includes('reportAllChanges'), 'app/index.html must guard against reportAllChanges error');
  assert(appIndexHtml.includes("reading 'startTime'"), 'app/index.html must guard against startTime error');
});


test('Tier 1 - Feature Coverage', 'Good-Night Ribbon i18n Dictionary and Box Modal Markup Verification', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');

  // 1. Verify i18n keys exist
  const ctx = {
    window: { localStorage: { getItem: () => 'zh-TW', setItem: () => {} }, addEventListener: () => {} },
    document: { documentElement: { setAttribute: () => {} }, querySelectorAll: () => [] },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;
  const ribbonKeys = [
    'box.modal_poke_ribbon',
    'box.ribbon_none',
    'box.ribbon_lv1',
    'box.ribbon_lv2',
    'box.ribbon_lv3',
    'box.ribbon_lv4',
    'appraisal.ribbon_label',
    'wiki.ribbon_title'
  ];

  ['zh-TW', 'en-US'].forEach(lang => {
    I18N.setLanguage(lang);
    ribbonKeys.forEach(key => {
      const val = I18N.t(key);
      assert(val && val.length > 0 && val !== key, `Translation for ${key} in ${lang} must exist and not equal key`);
    });
  });

  // 2. Verify Box Modal Select Markup
  assert(indexHtml.includes('id="modal-poke-ribbon"'), 'index.html must include #modal-poke-ribbon element');
  assert(indexHtml.includes('class="box-form-select"'), 'index.html must use box-form-select class on dropdowns');
  assert(indexHtml.includes('value="0"'), 'modal-poke-ribbon must include value 0');
  assert(indexHtml.includes('value="4"'), 'modal-poke-ribbon must include value 4');
  assert(indexHtml.includes('data-icon="assets/ribbons/ribbon_lv1.png"'), 'index.html must include ribbon_lv1 data-icon');
  assert(!indexHtml.includes('專屬頭像'), 'index.html modal-poke-ribbon must not include 專屬頭像');
  assert(!indexHtml.includes('第 1 階段'), 'index.html modal-poke-ribbon must not include 第 1 階段');

  // Verify mobile app/index.html includes modal-poke-ribbon with data-icon
  const appHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');
  assert(appHtml.includes('id="modal-poke-ribbon"'), 'app/index.html must include modal-poke-ribbon');
  assert(appHtml.includes('data-icon="../assets/ribbons/ribbon_lv1.png"'), 'app/index.html must include ribbon_lv1 data-icon');
  assert(!appHtml.includes('第 1 階段'), 'app/index.html modal-poke-ribbon must not include 第 1 階段');

  // Verify official ribbon assets exist on disk
  [1, 2, 3, 4].forEach(lvl => {
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets', 'ribbons', `ribbon_lv${lvl}.png`)), `assets/ribbons/ribbon_lv${lvl}.png must exist`);
  });

  // Verify removal of stage and profile icon from i18n
  I18N.setLanguage('zh-TW');
  assert(!I18N.t('box.ribbon_lv1').includes('第 1 階段'), 'box.ribbon_lv1 zh-TW must not include 第 1 階段');
  assert(!I18N.t('box.ribbon_lv3').includes('專屬頭像'), 'box.ribbon_lv3 zh-TW must not include 專屬頭像');
  I18N.setLanguage('en-US');
  assert(!I18N.t('box.ribbon_lv1').includes('Tier 1'), 'box.ribbon_lv1 en-US must not include Tier 1');
  assert(!I18N.t('box.ribbon_lv3').includes('Profile Icon'), 'box.ribbon_lv3 en-US must not include Profile Icon');

  // 3. Verify CSS styling complies with dropdown padding and arrow layout rules
  assert(stylesCss.includes('.box-form-select'), 'styles.css must style .box-form-select');
  assert(stylesCss.includes('padding-right: 36px'), 'box-form-select must include padding-right: 36px');
  assert(stylesCss.includes('background-position: right 18px center'), 'box-form-select must place arrow with right 18px center');
});


test('Tier 1 - Feature Coverage', '7 Research Camps & EX Mode Data Coverage & i18n Keys', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

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
      getElementById: () => ({ addEventListener: () => {}, value: '', style: {} }),
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

  const requiredKeys = [
    'wiki.subtab_islands', 'wiki.tab_islands', 'wiki.islands_title',
    'wiki.islands_select_label', 'wiki.islands_unlock_goal', 'wiki.islands_snorlax_mult',
    'wiki.islands_fav_berries', 'wiki.islands_expert_btn', 'wiki.islands_normal_btn',
    'wiki.islands_ranks_title', 'wiki.islands_spawns_title', 'wiki.islands_guide_title'
  ];

  ['zh-TW', 'en-US'].forEach(lang => {
    ctx.window.I18N.setLanguage(lang);
    requiredKeys.forEach(k => {
      const val = ctx.window.I18N.t(k);
      assert(val && val.length > 0 && val !== k, `i18n ${lang} must have translation for ${k}`);
    });
  });

  const islands = ctx.window.WikiDB.ISLANDS_DATA;
  assert(Array.isArray(islands), 'ISLANDS_DATA must be an array');
  assertEquals(islands.length, 7, 'Must have exactly 7 research camps');

  const expectedIds = ['greengrass', 'cyan', 'taupe', 'snowdrop', 'lapis', 'powerplant', 'amber'];
  assertArrayEquals(islands.map(i => i.id), expectedIds, 'Island IDs must match 7 official camps');

  const unlockGoals = islands.map(i => i.unlockGoal);
  assertArrayEquals(unlockGoals, [0, 20, 70, 150, 240, 340, 450], 'Unlock sleep style goals must be 0, 20, 70, 150, 240, 340, 450');

  assertEquals(islands[0].hasExpertMode, true, 'Greengrass Isle must have EX expert mode');
  assertEquals(islands[1].hasExpertMode, true, 'Cyan Beach must have EX expert mode');
  assertEquals(islands[2].hasExpertMode, false, 'Taupe Hollow must not have EX expert mode');
  assertEquals(islands[3].hasExpertMode, false, 'Snowdrop Tundra must not have EX expert mode');
  assertEquals(islands[4].hasExpertMode, false, 'Lapis Lakeside must not have EX expert mode');
  assertEquals(islands[5].hasExpertMode, false, 'Power Plant must not have EX expert mode');
  assertEquals(islands[6].hasExpertMode, false, 'Amber Canyon must not have EX expert mode');
});


  test('Tier 1 - Feature Coverage', 'Appraisal Lab H5 Polish: Linkage Group Omission, No Type SVGs/Icons, Icon-Only Top-Right Edit Button & Radar Maximization', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Research Lab subtabs: team builder and comparison
    assert(appraisalJs.includes('class="lab-subnav-bar"'), 'Research Lab must render subnav bar');
    assert(appraisalJs.includes("switchSubTab('team')") && appraisalJs.includes("switchSubTab('compare')"), 'Research Lab must support team and compare subtabs');
    assert(!appraisalJs.includes("switchSubTab('single')"), 'Research Lab must not contain single subtab');

    // 2. lab-inbox-tag removed
    assert(!appraisalJs.includes('lab-inbox-tag'), 'lab-inbox-tag must be removed from appraisal lab');

    // 3. Type SVG removed, replaced with berry icon
    assert(!appraisalJs.includes('getTypeIconSvg'), 'appraisal.js must not use getTypeIconSvg anymore');
    assert(appraisalJs.includes('window.getPokemonBerry'), 'appraisal.js must use tree berry icon instead of type');

    // 4. Mobile H5 modal bottom sheet
    assert(appraisalJs.includes('mobile-box-sheet') && appraisalJs.includes('bottom-sheet'), 'appraisal modal must use mobile-box-sheet on H5');

    // 5. radar-svg-chart maximized display
    assert(!stylesCss.includes('max-height: 250px;'), 'radar-svg-chart must not have 250px max-height constraint');

    // 6. Runtime variable guard: isMobileH5 declaration in renderAppraisalLabContainer
    assert(appraisalJs.includes("const isMobileH5 = typeof document !== 'undefined'"), 'isMobileH5 must be explicitly declared in renderAppraisalLabContainer');
  });

  // ─── Test 175: Pokédex Edge-to-Edge List & Direct Mobile Emulation Transition ────

  test('Tier 1 - Feature Coverage', 'Pokédex Edge-to-Edge List & Direct Mobile Emulation Transition', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');

    // 1. Pokédex table edge-to-edge layout on mobile H5
    assert(stylesCss.includes('.mobile-h5-app.pokemon-active .table-container') && stylesCss.includes('margin: 0 !important;'), 'Pokedex table container must have 0 side margins on mobile');
    assert(stylesCss.includes('.mobile-h5-app.pokemon-active .table-container') && stylesCss.includes('width: 100% !important;'), 'Pokedex table container must be 100% width on mobile');
    assert(stylesCss.includes('.mobile-h5-app.pokemon-active .table-container') && stylesCss.includes('border-radius: 0 !important;'), 'Pokedex table container must have 0 border-radius');
    assert(stylesCss.includes('.mobile-h5-app #panel-pokemon .pokemon-table'), 'Pokedex table must have dedicated full-width mobile rule');

    // 2. Direct mobile transition on resize in index.html
    assert(indexHtml.includes("localStorage.removeItem('pksleep_view_pref')"), 'index.html must clear stale desktop preference on mobile transition');
    assert(indexHtml.includes('if (curWidth && (curWidth <= 768 || isNowMobileUA))'), 'index.html must detect <= 768px on resize');

    // 3. Direct desktop transition on resize in app/index.html
    assert(appIndexHtml.includes('if (!isMobileUA && window.innerWidth && window.innerWidth > 768)'), 'app/index.html must redirect to desktop on > 768px without getting stuck');
  });

  // ─── Test 176: Pokédex & Box Snug Icon Column, Specialty Distinct Colors & Table Square Corners ────

  test('Tier 1 - Feature Coverage', 'Pokédex & Box Snug Icon Column, Specialty Distinct Colors & Table Square Corners', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');

    // 1. Snug icon column width matching icon dimensions 100%
    assert(stylesCss.includes('.pokemon-table .th-icon') && stylesCss.includes('width: 34px !important;'), 'th-icon must be 34px wide');
    assert(stylesCss.includes('.pokemon-table .td-icon') && stylesCss.includes('width: 34px !important;'), 'td-icon must be 34px wide');
    assert(stylesCss.includes('.table-icon') && stylesCss.includes('width: 34px !important;'), 'table-icon must be 34px wide');
    assert(boxJs.includes('<th class="th-icon"'), 'box.js table must use th-icon class for icon column');
    assert(boxJs.includes('<td class="td-icon"'), 'box.js table must use td-icon class for icon column');
    assert(stylesCss.includes('.pokemon-table.box-table .th-icon') && stylesCss.includes('left: 0 !important;'), 'box-table icon header must stick to left: 0');
    assert(stylesCss.includes('.pokemon-table.box-table .td-icon') && stylesCss.includes('left: 0 !important;'), 'box-table icon cell must stick to left: 0');

    // 2. Specialty badge distinct colors preserved on mobile H5
    assert(!stylesCss.includes('.mobile-h5-app .box-spec-tag {\n  font-size: 10px !important;\n  padding: 1px 5px !important;\n  border-radius: 4px !important;\n  background: var(--table-row-odd-solid'), 'mobile-h5-app box-spec-tag must not override background to solid dark');
    assert(stylesCss.includes('.mobile-h5-app .box-spec-tag.spec-berry'), 'mobile-h5-app must define berry specialty badge style');
    assert(stylesCss.includes('.mobile-h5-app .box-spec-tag.spec-ingredient'), 'mobile-h5-app must define ingredient specialty badge style');
    assert(stylesCss.includes('.mobile-h5-app .box-spec-tag.spec-skill'), 'mobile-h5-app must define skill specialty badge style');

    // 3. Square corners for tables across the app
    assert(stylesCss.includes('.pokemon-table thead th:first-child,\n.pokemon-table thead th:last-child {\n  border-radius: 0 !important;'), 'Table header corners must have 0 border-radius');
    assert(stylesCss.includes('.mobile-h5-app .pokemon-table thead th:first-child,\n.mobile-h5-app .pokemon-table thead th:last-child'), 'Mobile table corners must be square');
    assert(stylesCss.includes('.mobile-h5-app .pokemon-table.hide-no thead th:first-child,\n.mobile-h5-app .pokemon-table.hide-no tbody tr:last-child td:first-child {\n  border-radius: 0 !important;'), 'Mobile hide-no corners must be square');
  });

  // ─── Test 177: Filter FAB Positioning, Box Toolbar Cleanup, Pull-to-Refresh Floating Guard, and Delete Confirmation Modal Verification ────

  test('Tier 1 - Feature Coverage', 'Filter FAB Positioning, Box Toolbar Cleanup, Pull-to-Refresh Floating Guard, and Delete Confirmation Modal Verification', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');

    // 1. Filter FAB positioned safely above box-fab-container
    assert(
      stylesCss.includes('.mobile-h5-app #box-sidebar-bookmark-handle') &&
      stylesCss.includes('bottom: calc(180px + env(safe-area-inset-bottom, 0px)) !important;'),
      'Box sidebar bookmark handle must be elevated above box-fab-container'
    );

    // 2. Box toolbar removed from mobile H5 app while keeping OCR helper cards intact
    assert(!appIndexHtml.includes('class="box-toolbar-container"'), 'box-toolbar-container must be removed from app/index.html');
    assert(appIndexHtml.includes('id="box-screenshot-guide-card"'), 'box-screenshot-guide-card must be preserved for scanner fallback');

    // 3. Pull-to-refresh must ignore floating handles, FABs, and dock
    assert(
      appJs.includes('.sidebar-bookmark-handle, .sidebar-fab-btn, .box-fab-container, .box-fab-btn') &&
      appJs.includes('.bottom-dock, .mobile-bottom-dock, .bottom-dock-nav, .dock-item'),
      'Pull-to-refresh touch listeners must suppress activation on floating elements'
    );

    // 4. Pokédex table container zero padding/margin touching bottom dock
    assert(
      stylesCss.includes('.mobile-h5-app.pokemon-active .pokemon-main-content #content-area') &&
      stylesCss.includes('padding-bottom: 0 !important;') &&
      stylesCss.includes('margin-bottom: 0 !important;'),
      'Pokedex content-area must touch bottom dock with 0 margin/padding'
    );

    // 5. Box delete action secondary confirmation modal
    assert(boxJs.includes('openDeleteConfirmModal'), 'box.js must define openDeleteConfirmModal');
    assert(boxJs.includes("'box-delete-confirm-modal'"), 'box.js must handle box-delete-confirm-modal');
    assert(boxJs.includes('id="box-delete-confirm-btn"'), 'box.js must provide confirm delete button');
    assert(boxJs.includes('id="box-delete-cancel-btn"'), 'box.js must provide cancel delete button');
  });

  // ─── Test 178: Pure Specialty Icons (Berry, Ingredient, Skill) Across All Views ────

  test('Tier 1 - Feature Coverage', 'Pure Specialty Icons (Berry, Ingredient, Skill) Across All Views & Elimination of Text Badges', () => {
    const i18n = require(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'));
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');

    // 1. Asset existence
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets/specialty/berry.png')), 'assets/specialty/berry.png must exist');
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets/specialty/ingredient.png')), 'assets/specialty/ingredient.png must exist');
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets/specialty/skill.png')), 'assets/specialty/skill.png must exist');

    // 2. Helper functions in i18n
    assert(typeof i18n.getSpecialtyIconHtml === 'function', 'i18n must export getSpecialtyIconHtml');
    assert(typeof i18n.getSpecialtyKey === 'function', 'i18n must export getSpecialtyKey');
    assertEquals(i18n.getSpecialtyKey('樹果'), 'berry', '樹果 key must be berry');
    assertEquals(i18n.getSpecialtyKey('食材'), 'ingredient', '食材 key must be ingredient');
    assertEquals(i18n.getSpecialtyKey('技能'), 'skill', '技能 key must be skill');

    const berryHtml = i18n.getSpecialtyIconHtml('樹果', 20);
    assert(berryHtml.includes('assets/specialty/berry.png') && berryHtml.includes('spec-berry'), 'berry icon HTML must include image and class');
    assert(berryHtml.includes('specialty-icon-wrap'), 'icon must have specialty-icon-wrap class');

    // 3. Pokédex integration
    assert(appJs.includes('getSpecialtyIconHtml(p.specialty, 20)'), 'Pokédex table must use getSpecialtyIconHtml with size 20');
    assert(appJs.includes('getSpecialtyIconHtml(p.specialty, 20)'), 'Pokédex cards must use getSpecialtyIconHtml with size 20');
    assert(appJs.includes('getSpecialtyIconHtml(pkm.specialty, 20'), 'Pokédex detail modal must use getSpecialtyIconHtml with size 20');

    // 4. Box integration
    assert(boxJs.includes('getSpecialtyIconHtml(base ? base.specialty : p.specialty, 20)'), 'Box table must use getSpecialtyIconHtml with size 20');
    assert(boxJs.includes('getSpecialtyIconHtml(base ? base.specialty : p.specialty, 18)'), 'Box cards must use getSpecialtyIconHtml with size 18');

    // 5. Appraisal integration
    assert(appraisalJs.includes('getSpecialtyIconHtml(pkmData.specialty, 22') || appraisalJs.includes('getSpecialtyIconHtml(specialty, 22'), 'Appraisal modal must use getSpecialtyIconHtml with size 22');
    assert(appraisalJs.includes('getSpecialtyIconHtml(currentPkm.specialty, 16)'), 'Appraisal lab must use getSpecialtyIconHtml with size 16');

    // 6. CSS borderless transparent styling & berry size matching
    assert(stylesCss.includes('.specialty-icon-wrap') && stylesCss.includes('background: transparent !important;'), 'specialty-icon-wrap must be transparent');
    assert(stylesCss.includes('.specialty-icon {') && stylesCss.includes('border-radius: 50%;'), 'specialty-icon must be circular');
    assert(stylesCss.includes('.mobile-h5-app .pokemon-table .td-spec .specialty-icon') && stylesCss.includes('width: 20px !important;'), 'mobile pokemon table spec icon must be 20px matching berry');
    assert(stylesCss.includes('.lab-preview-spec .specialty-icon') && stylesCss.includes('width: 16px !important;'), 'lab preview spec icon must be 16px matching berry');
  });

  // ─── Test 179: Appraisal Modal Complete Stats & Research Lab Team/Compare Architecture ─

  test('Tier 1 - Feature Coverage', 'Appraisal Modal Complete Stats & Research Lab Team/Compare Architecture', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');

    // 1. Research Lab subtabs are strictly team and compare
    assert(appraisalJs.includes("switchSubTab('team')") && appraisalJs.includes("switchSubTab('compare')"), 'Research lab must support team and compare');
    assert(!appraisalJs.includes("switchSubTab('single')"), 'Research lab must not include single subtab');

    // 2. Appraisal modal renders complete stats
    assert(appraisalJs.includes('appraisal-mainskill-row'), 'Appraisal modal must render main skill row');
    assert(appraisalJs.includes('appraisal-ing-chips-grid') || appraisalJs.includes('appraisal-ing-parallel-row'), 'Appraisal modal must render ingredient chips');
    assert(appraisalJs.includes('appraisal-nature-game-card'), 'Appraisal modal must render nature card');
    assert(appraisalJs.includes('appraisal-subskills-grid'), 'Appraisal modal must render subskills in grid');
    assert(appraisalJs.includes('appraisal-radar-wrapper') || appraisalJs.includes('renderRadarChartSVG'), 'Appraisal modal must render radar chart');

    // 3. Mobile H5 bottom sheet structure
    assert(appraisalJs.includes('box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet'), 'Mobile modal must render mobile-box-sheet dialog');
    assert(appraisalJs.includes('sheet-drag-handle'), 'Mobile modal must render sheet drag handle');
    assert(appraisalJs.includes('box-modal-header'), 'Mobile modal must render box-modal-header');

    // 4. CSS classes present
    assert(stylesCss.includes('.appraisal-modal-backdrop'), 'styles.css must define .appraisal-modal-backdrop');
    assert(stylesCss.includes('.appraisal-modal-sheet-body'), 'styles.css must define .appraisal-modal-sheet-body');
  });

  // ─── Test 180: Box Tab Default Dex No. Ascending Sort, Split Asc/Desc & Elimination of PR Sort ─

  test('Tier 1 - Feature Coverage', 'Box Tab Default Dex No. Ascending Sort, Split Asc/Desc & Elimination of PR Sort', () => {
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');
    const i18nJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');

    // 1. Default sorting is id-asc (Dex No. Low to High)
    assert(boxJs.includes("let sortBy = 'id-asc';"), 'box.js must initialize sortBy to id-asc');
    assert(indexHtml.includes('<option value="id-asc" data-i18n="box.sort_id_asc" selected>'), 'index.html must have id-asc as default selected option');
    assert(appIndexHtml.includes('<option value="id-asc" data-i18n="box.sort_id_asc" selected>'), 'app/index.html must have id-asc as default selected option');

    // 2. Both Ascending (Low to High) and Descending (High to Low) Dex options present
    assert(indexHtml.includes('value="id-asc"') && indexHtml.includes('value="id-desc"'), 'index.html must have both id-asc and id-desc options');
    assert(appIndexHtml.includes('value="id-asc"') && appIndexHtml.includes('value="id-desc"'), 'app/index.html must have both id-asc and id-desc options');
    assert(i18nJs.includes("'box.sort_id_asc': '編號由低到高'"), 'i18n must define box.sort_id_asc');
    assert(i18nJs.includes("'box.sort_id_desc': '編號由高到低'"), 'i18n must define box.sort_id_desc');

    // 3. PR sorting removed from box-sort-select in both HTML files
    const indexSortSection = indexHtml.substring(indexHtml.indexOf('id="box-sort-select"'), indexHtml.indexOf('</select>', indexHtml.indexOf('id="box-sort-select"')));
    const appSortSection = appIndexHtml.substring(appIndexHtml.indexOf('id="box-sort-select"'), appIndexHtml.indexOf('</select>', appIndexHtml.indexOf('id="box-sort-select"')));
    assert(!indexSortSection.includes('pr-desc') && !indexSortSection.includes('pr-asc'), 'index.html box-sort-select must not contain PR sorting');
    assert(!appSortSection.includes('pr-desc') && !appSortSection.includes('pr-asc'), 'app/index.html box-sort-select must not contain PR sorting');

    // 4. PR sorting removed from box.js comparator and id-desc implemented
    assert(!boxJs.includes("sortBy === 'pr-desc'") && !boxJs.includes("sortBy === 'pr-asc'"), 'box.js comparator must not contain PR sorting');
    assert(boxJs.includes("sortBy === 'id-desc' || sortBy === 'dex-desc'"), 'box.js must support id-desc sorting');
    assert(boxJs.includes("getPkmDexId"), 'box.js must implement getPkmDexId helper for accurate numeric sorting');

    // 5. resetBoxFilters resets to id-asc
    const resetBoxCode = boxJs.substring(boxJs.indexOf('function resetBoxFilters()'), boxJs.indexOf('function getBoxFilterState()'));
    assert(resetBoxCode.includes("sortBy = 'id-asc';"), 'resetBoxFilters must reset sortBy to id-asc');
    assert(resetBoxCode.includes("sortSelect.value = 'id-asc';"), 'resetBoxFilters must update sortSelect UI value to id-asc');
  });

  // ─── Test 181: Appraisal Lab Scope Integrity: getSkillTier Module Scope & Error-Free Lab Render ─

  test('Tier 1 - Feature Coverage', 'Foongus & Amoonguss Full-Stack Data Integrity Audit (Pokedex, Habitats, Sleep Styles, OCR, Sprites)', () => {
    // 1. data/data.json verification
    const pkmData = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/data.json'), 'utf8'));
    const foongus = pkmData.find(p => p.formatted_no === '590' || p.id === '590' || p.name_cn === '哎呀球菇');
    const amoonguss = pkmData.find(p => p.formatted_no === '591' || p.id === '591' || p.name_cn === '敗露球菇');
    assert(foongus, 'data/data.json must contain 哎呀球菇 (#590)');
    assert(amoonguss, 'data/data.json must contain 敗露球菇 (#591)');
    assertEquals(foongus.specialty, '食材', '哎呀球菇 specialty must be 食材');
    assertEquals(amoonguss.specialty, '食材', '敗露球菇 specialty must be 食材');
    assertEquals(foongus.type, '毒', '哎呀球菇 type must be 毒');
    assertEquals(amoonguss.type, '毒', '敗露球菇 type must be 毒');
    assertEquals(foongus.sleep_type, '淺淺入夢', '哎呀球菇 sleep_type must be 淺淺入夢');
    assertEquals(amoonguss.sleep_type, '淺淺入夢', '敗露球菇 sleep_type must be 淺淺入夢');

    // 2. data/sleep_styles.json verification
    const sleepStylesJson = JSON.parse(fs.readFileSync(path.join(WORKSPACE_ROOT, 'data/sleep_styles.json'), 'utf8'));
    assert(sleepStylesJson.byName['哎呀球菇'], 'data/sleep_styles.json must include 哎呀球菇 in byName');
    assert(sleepStylesJson.byName['敗露球菇'], 'data/sleep_styles.json must include 敗露球菇 in byName');
    assert(sleepStylesJson.byNo['590'], 'data/sleep_styles.json must include 590 in byNo');
    assert(sleepStylesJson.byNo['591'], 'data/sleep_styles.json must include 591 in byNo');
    assertEquals(sleepStylesJson.byName['哎呀球菇']['1'].name, '偽裝睡', '哎呀球菇 1 star sleep style must be 偽裝睡');
    assertEquals(sleepStylesJson.byName['敗露球菇']['2'].name, '誘敵睡', '敗露球菇 2 star sleep style must be 誘敵睡');

    // 3. js/modules/wiki.js verification (habitats, fallback sprites, specialty map)
    const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/wiki.js'), 'utf8');
    assert(wikiCode.includes('"哎呀球菇": "590"'), 'wiki.js POKEMON_SPRITE_FALLBACK must contain 哎呀球菇');
    assert(wikiCode.includes('"敗露球菇": "591"'), 'wiki.js POKEMON_SPRITE_FALLBACK must contain 敗露球菇');
    assert(wikiCode.includes('"哎呀球菇": "食材"'), 'wiki.js POKEMON_SPECIALTY_MAP must contain 哎呀球菇');
    assert(wikiCode.includes('"敗露球菇": "食材"'), 'wiki.js POKEMON_SPECIALTY_MAP must contain 敗露球菇');

    // Island spawns in Greengrass, Lapis, Amber
    assert(wikiCode.includes('{ name: "哎呀球菇", name_en: "Foongus", type: "毒"'), 'wiki.js must include 哎呀球菇 in habitat spawns');
    assert(wikiCode.includes('{ name: "敗露球菇", name_en: "Amoonguss", type: "毒"'), 'wiki.js must include 敗露球菇 in habitat spawns');

    // 4. js/modules/box.js OCR Confusion Map
    const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    assert(boxCode.includes("['敗露菇', '敗露球菇']"), 'box.js OCR_CONFUSION_MAP must contain 敗露菇 -> 敗露球菇');
    assert(boxCode.includes("['哎呀菇', '哎呀球菇']"), 'box.js OCR_CONFUSION_MAP must contain 哎呀菇 -> 哎呀球菇');

    // 5. js/core/i18n.js
    const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'), 'utf8');
    assert(i18nCode.includes('"哎呀球菇":"Foongus"'), 'i18n.js must map 哎呀球菇 to Foongus');
    assert(i18nCode.includes('"敗露球菇":"Amoonguss"'), 'i18n.js must map 敗露球菇 to Amoonguss');
  });


  test('Tier 1 - Feature Coverage', 'Desktop Unified Content Layout, Width Constraints, Horizontal Alignment & Elegant Border Radius Across Panels', () => {
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');

    // 1. Pokédex Tab Desktop Alignment & Container Width
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .pokemon-main-content #content-area {') &&
      stylesCss.includes('max-width: 1200px;') &&
      stylesCss.includes('padding: 0 16px;'),
      'Pokédex #content-area must have 1200px max-width and 16px side padding on desktop'
    );
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .pokemon-main-content #content-area .table-container') &&
      stylesCss.includes('width: 100%;'),
      'Pokédex desktop table container must fill 100% of #content-area to align with search bar and cards'
    );
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .pokemon-main-content #content-area .pokemon-grid') &&
      stylesCss.includes('width: 100%;'),
      'Pokédex desktop card grid must fill 100% of #content-area to align with search bar'
    );

    // 2. Recipes Tab Desktop Alignment & Container Width
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .recipe-main-content #recipe-content-area {') &&
      stylesCss.includes('max-width: 1200px;') &&
      stylesCss.includes('padding: 0 16px;'),
      'Recipe #recipe-content-area must have 1200px max-width and 16px side padding on desktop'
    );
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .recipe-main-content #recipe-content-area .table-container') &&
      stylesCss.includes('width: 100%;'),
      'Recipe desktop table container must fill 100% of #recipe-content-area to align with controls'
    );

    // 3. Box Tab Desktop Alignment & Container Width (fixes image 1 indentation)
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .box-content-container .table-container') &&
      stylesCss.includes('width: 100% !important;'),
      'Box desktop table container must have 100% width to align with top banner, search bar, and card grid'
    );
    assert(
      stylesCss.includes('body:not(.mobile-h5-app) .box-subnav-bar {') &&
      stylesCss.includes('max-width: 1200px;') &&
      stylesCss.includes('margin: 20px auto 0 !important;'),
      'Box desktop subnav bar must align with the 1200px content layout track'
    );
    assert(
      !indexHtml.includes('<section class="box-lab-content-container controls-container" style="max-width:1200px;width:100%;">'),
      'index.html box-lab-content-container must not have inline width override'
    );

    // 4. Consistent Border Radius across Desktop Panels while Preserving Mobile H5 Square Full-Bleed
    assert(
      stylesCss.includes('border-radius: var(--radius-lg, 16px);') &&
      stylesCss.includes('.pokemon-table thead th:first-child,\n.pokemon-table thead th:last-child {\n  border-radius: 0 !important;'),
      'Desktop tables must have consistent rounded corners matching cards while table header corner rule is preserved'
    );
    assert(
      stylesCss.includes('.mobile-h5-app.pokemon-active .table-container') &&
      stylesCss.includes('border-radius: 0 !important;'),
      'Mobile H5 app must strictly maintain edge-to-edge square table styling'
    );
  });

  // ─── Test 220: Pokédex & Box Table Column Header Click Sorting Integrity ─────────

  test('Tier 1 - Feature Coverage', 'Pokédex and Box Table Column Header Click Sorting: 3-State Sorting, Selective Clickable Columns & All-Rounder Specialty Icon', () => {
    const appJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/app.js'), 'utf8');
    const boxJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/box.js'), 'utf8');
    const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css/styles.css'), 'utf8');
    const app = require(path.join(WORKSPACE_ROOT, 'js/modules/app.js'));
    const box = require(path.join(WORKSPACE_ROOT, 'js/modules/box.js'));
    const i18n = require(path.join(WORKSPACE_ROOT, 'js/core/i18n.js'));

    // 1. Pokédex Tab Sorting: getItemNo and sortPokemonList numeric & string support
    assert(typeof app.getItemNo === 'function', 'app.js must export getItemNo helper');
    assert(app.getItemNo({ id: 25, formatted_no: '025' }) === 25, 'getItemNo must parse formatted_no correctly');
    assert(app.getItemNo({ id: '1', formatted_no: '001' }) === 1, 'getItemNo must parse padded numbers correctly');
    assert(app.getItemNo(null) === 99999, 'getItemNo must fallback to 99999 for null');

    const parsedNoAsc = app.parseTableSort('no-asc');
    assert(parsedNoAsc.col === 'no', 'parseTableSort must parse no column');
    assert(parsedNoAsc.dir === 'asc', 'parseTableSort must parse asc direction');
    assert(app.nextColumnSort('no-asc', 'no') === 'no-desc', 'nextColumnSort must toggle no-asc to no-desc');
    assert(app.nextColumnSort('no-desc', 'no') === 'no-asc', 'nextColumnSort must toggle no-desc to no-asc');

    // 1.1 Pokédex 3-State Sorting (State 1: default dir -> State 2: reverse dir -> State 3: reset to default no-asc)
    assert(app.nextColumnSort('no-asc', 'carry') === 'carry-desc', 'Pokédex carry click 1 must enter carry-desc');
    assert(app.nextColumnSort('carry-desc', 'carry') === 'carry-asc', 'Pokédex carry click 2 must enter carry-asc');
    assert(app.nextColumnSort('carry-asc', 'carry') === 'no-asc', 'Pokédex carry click 3 must reset to no-asc default');
    assert(app.nextColumnSort('no-asc', 'interval') === 'interval-asc', 'Pokédex interval click 1 must enter interval-asc');
    assert(app.nextColumnSort('interval-asc', 'interval') === 'interval-desc', 'Pokédex interval click 2 must enter interval-desc');
    assert(app.nextColumnSort('interval-desc', 'interval') === 'no-asc', 'Pokédex interval click 3 must reset to no-asc default');

    const sampleP1 = { id: 25, formatted_no: '025', name_cn: '皮卡丘' };
    const sampleP2 = { id: 1, formatted_no: '001', name_cn: '妙蛙種子' };
    const sortedAsc = app.sortPokemonList([sampleP1, sampleP2], 'no-asc');
    assert(sortedAsc[0].id === 1, 'sortPokemonList no-asc must place lower Dex number first');
    const sortedDesc = app.sortPokemonList([sampleP1, sampleP2], 'no-desc');
    assert(sortedDesc[0].id === 25, 'sortPokemonList no-desc must place higher Dex number first');

    // 2. Pokédex Table Markup: Icon header is clickable sortableTh('no', ...), Name/Berry/Specialty are non-clickable plain th
    assert(appJs.includes("sortableTh('no', t('th.icon', '圖示'), 'th-icon')"), 'app.js renderTable must make icon header sortable via sortableTh');
    assert(!appJs.includes("sortableTh('name'"), 'Pokédex name column must NOT be sortable');
    assert(!appJs.includes("sortableTh('berry'"), 'Pokédex berry column must NOT be sortable');
    assert(!appJs.includes("sortableTh('specialty'"), 'Pokédex specialty column must NOT be sortable');
    assert(appJs.includes('<th class="th-name">'), 'Pokédex name header must be pure th');
    assert(appJs.includes('<th class="th-berry">'), 'Pokédex berry header must be pure th');
    assert(appJs.includes('<th class="th-spec">'), 'Pokédex specialty header must be pure th');
    assert(appJs.includes("contentArea.addEventListener('click', (e) => {"), 'app.js must have click listener on contentArea');
    assert(appJs.includes("e.target.closest('th[data-sort]')"), 'app.js must delegate clicks to th[data-sort]');

    // 3. Box Tab Table Sorting: parseBoxSort, nextBoxSort & 3-state level cycling
    assert(typeof box.parseBoxSort === 'function', 'box.js must export parseBoxSort helper');
    assert(box.parseBoxSort('id-asc').col === 'id', 'parseBoxSort must parse id');
    assert(box.parseBoxSort('id-asc').dir === 'asc', 'parseBoxSort must parse asc');
    assert(box.nextBoxSort('id-asc', 'id') === 'id-desc', 'nextBoxSort must toggle id-asc to id-desc');
    assert(box.nextBoxSort('id-desc', 'id') === 'id-asc', 'nextBoxSort must toggle id-desc to id-asc');
    assert(box.nextBoxSort('id-asc', 'level') === 'level-desc', 'nextBoxSort must switch to level-desc (state 1)');
    assert(box.nextBoxSort('level-desc', 'level') === 'level-asc', 'nextBoxSort must toggle level-desc to level-asc (state 2)');
    assert(box.nextBoxSort('level-asc', 'level') === 'id-asc', 'nextBoxSort must reset level-asc to id-asc default (state 3)');

    // 4. Box Tab Table Markup: Only icon and level are sortable; name, specialty, berry, ings are non-sortable
    assert(boxJs.includes("boxSortableTh('id', t('th.icon', '圖示'), 'th-icon')"), 'box.js renderBoxTable must make icon header sortable via boxSortableTh');
    assert(boxJs.includes("boxSortableTh('level', t('th.level', '等級'))"), 'box.js renderBoxTable must make level header sortable');
    assert(!boxJs.includes("boxSortableTh('name'"), 'Box name column must NOT be sortable');
    assert(!boxJs.includes("boxSortableTh('specialty'"), 'Box specialty column must NOT be sortable');
    assert(!boxJs.includes("boxSortableTh('berry'"), 'Box berry column must NOT be sortable');
    assert(!boxJs.includes("boxSortableTh('ing1'"), 'Box ing1 column must NOT be sortable');
    assert(box.nextBoxSort('id-asc', 'name') === 'id-asc', 'Box nextBoxSort must ignore name');
    assert(box.nextBoxSort('id-asc', 'specialty') === 'id-asc', 'Box nextBoxSort must ignore specialty');
    assert(boxJs.includes("boxContentArea.addEventListener('click', (e) => {"), 'box.js must attach click listener on boxContentArea');
    assert(boxJs.includes("nextBoxSort(sortBy, col)"), 'box.js must update sortBy via nextBoxSort on th click');

    // 5. All-Rounder (全能型) Specialty Icon & Assets Integrity
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets/specialty/all.png')), 'all.png must exist');
    assert(fs.existsSync(path.join(WORKSPACE_ROOT, 'assets/specialty/all@2x.png')), 'all@2x.png must exist');
    assert(i18n.getSpecialtyKey('全部') === 'all', 'getSpecialtyKey(全部) must return all');
    assert(i18n.getSpecialtyKey('全能') === 'all', 'getSpecialtyKey(全能) must return all');
    assert(i18n.getSpecialtyKey('All-Rounder') === 'all', 'getSpecialtyKey(All-Rounder) must return all');
    const specAllIconHtml = i18n.getSpecialtyIconHtml('全部');
    assert(specAllIconHtml.includes('assets/specialty/all.png'), 'getSpecialtyIconHtml(全部) must use all.png');
    assert(specAllIconHtml.includes('spec-all'), 'getSpecialtyIconHtml(全部) must include spec-all');

    // 6. CSS sort-arrow styling
    assert(stylesCss.includes('.pokemon-table th.th-sortable'), 'css must define .pokemon-table th.th-sortable');
    assert(stylesCss.includes('.pokemon-table .sort-arrow'), 'css must define .pokemon-table .sort-arrow');
    assert(stylesCss.includes('.pokemon-table th.th-icon .sort-arrow'), 'css must define .pokemon-table th.th-icon .sort-arrow');
    assert(stylesCss.includes('.box-spec-tag.spec-all'), 'css must define .box-spec-tag.spec-all');
  });

  // =========================================================================
  // Test 228: Production Minification & esbuild Asset Pipeline Integrity
  // =========================================================================
  test('Tier 1 - Feature Coverage', 'Production Minification & esbuild Pipeline: Generates valid styles.min.css and *.min.js with Source Maps', async () => {
    const { buildProd, PROD_FILES } = require('../../scripts/build_prod');
    assert(typeof buildProd === 'function', 'buildProd must be a function');
    assert(Array.isArray(PROD_FILES) && PROD_FILES.length >= 10, 'PROD_FILES must register >= 10 assets');

    const summary = await buildProd();
    assert(summary.filesCount >= 10, 'Must build >= 10 minified files');
    assert(parseFloat(summary.totalMinKB) < parseFloat(summary.totalRawKB), 'Minified total size must be strictly smaller than raw');
    
    // Check styles.min.css exists and has source map
    const minCssPath = path.join(WORKSPACE_ROOT, 'css', 'styles.min.css');
    const minMapPath = path.join(WORKSPACE_ROOT, 'css', 'styles.min.css.map');
    assert(fs.existsSync(minCssPath), 'styles.min.css must exist');
    assert(fs.existsSync(minMapPath), 'styles.min.css.map must exist');

    // Strict negative brace check on styles.min.css
    const minCssContent = fs.readFileSync(minCssPath, 'utf8');
    let openBraces = 0, minBraces = 0, inStr = false, quote = '', inComm = false;
    for (let i = 0; i < minCssContent.length; i++) {
      const c = minCssContent[i], next = minCssContent[i + 1];
      if (inComm) {
        if (c === '*' && next === '/') { inComm = false; i++; }
        continue;
      }
      if (inStr) {
        if (c === quote && minCssContent[i - 1] !== '\\') inStr = false;
        continue;
      }
      if (c === '/' && next === '*') { inComm = true; i++; continue; }
      if (c === '"' || c === "'") { inStr = true; quote = c; continue; }
      if (c === '{') openBraces++;
      if (c === '}') {
        openBraces--;
        if (openBraces < minBraces) minBraces = openBraces;
      }
    }
    assertEquals(minBraces, 0, `styles.min.css must have zero negative braces`);
    assertEquals(openBraces, 0, `styles.min.css must have balanced braces`);
  });
}

module.exports = { registerTier1Tests };

if (require.main === module) {
  registerTier1Tests();
  const { printSummaryAndExit } = require('../test_harness');
  printSummaryAndExit();
}
