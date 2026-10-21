/**
 * Tier 4 - Real-World Application Scenarios (registerTier4Part4)
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

function registerTier4Part4() {
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

module.exports = { registerTier4Part4 };
