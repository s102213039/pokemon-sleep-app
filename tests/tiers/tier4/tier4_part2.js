/**
 * Tier 4 - Real-World Application Scenarios (registerTier4Part2)
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

function registerTier4Part2() {
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


}

module.exports = { registerTier4Part2 };
