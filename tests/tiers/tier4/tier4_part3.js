/**
 * Tier 4 - Real-World Application Scenarios (registerTier4Part3)
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

function registerTier4Part3() {
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

}

module.exports = { registerTier4Part3 };
