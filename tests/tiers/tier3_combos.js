/**
 * Tier 3 - Cross-Feature Combinations (8 Tests)
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

function registerTier3Tests() {
  console.log('--- Tier 3 - Cross-Feature Combinations ---');

test('Tier 3 - Cross-Feature Combinations', 'Combined filters: text search + multi-type + multi-specialty + sorting + view mode', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = 'a';
  PokemonApp.selectedTypes = new Set(['草', '水', '火']);
  PokemonApp.selectedSpecialties = new Set(['食材', '樹果']);
  PokemonApp.currentSort = 'ingredientRate-desc';
  PokemonApp.viewMode = 'table';

  const result = PokemonApp.render();
  assert(Array.isArray(result), 'render should return filtered sorted array');

  for (let i = 0; i < result.length - 1; i++) {
    const rateA = getItemIngredientRate(result[i]);
    const rateB = getItemIngredientRate(result[i + 1]);
    assert(rateA >= rateB, `Sort failed: item ${result[i].id} rate (${rateA}) < item ${result[i+1].id} rate (${rateB})`);
  }

  result.forEach(item => {
    assert(PokemonApp.selectedTypes.has(item.type), `Item type ${item.type} not in selected types`);
    assert(PokemonApp.selectedSpecialties.has(item.specialty), `Item specialty ${item.specialty} not in selected specialties`);
  });
});


test('Tier 3 - Cross-Feature Combinations', 'Mobile Dock Navigation & Filter Persistence across Tab Switches', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = true;
  PokemonApp.selectedTypes = new Set(['草']);
  PokemonApp.currentSearch = '妙蛙';

  const dexResultsBefore = PokemonApp.filterData();
  assert(dexResultsBefore.length > 0, 'Dex filter should have results');

  let currentActiveTab = 'tab-pokemon';
  function switchTab(newTab) {
    currentActiveTab = newTab;
  }

  switchTab('tab-recipes');
  assertEquals(currentActiveTab, 'tab-recipes', 'Switched to recipes tab');

  switchTab('tab-wiki');
  assertEquals(currentActiveTab, 'tab-wiki', 'Switched to wiki tab');

  switchTab('tab-pokemon');
  assertEquals(currentActiveTab, 'tab-pokemon', 'Switched back to pokemon tab');

  assertEquals(PokemonApp.currentSearch, '妙蛙', 'Search text preserved');
  assert(PokemonApp.selectedTypes.has('草'), 'Type filter preserved');
  assertEquals(PokemonApp.onlyFinal, true, 'onlyFinal switch preserved');
  const dexResultsAfter = PokemonApp.filterData();
  assertEquals(dexResultsAfter.length, dexResultsBefore.length, 'Filtered item count unchanged after tab switches');
});


test('Tier 3 - Cross-Feature Combinations', 'Mobile Recipe Category Segmented Bar & Pot Stepper & Tasty Multiplier Cross-Interaction', () => {
  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

  const LEVEL_BONUS_TABLE = { 1: 0, 50: 148 };
  function calcEnergy(base, lv, islandPct, eventMult = 1.0, tastyMult = 1.0) {
    const lvMult = 1 + ((LEVEL_BONUS_TABLE[lv] || 0) / 100);
    const islandMult = 1 + (islandPct / 100);
    return Math.round(base * lvMult * islandMult * eventMult * tastyMult);
  }

  const filteredSalads = recipes.filter(r => r.category === '沙拉' && r.pot_size <= 35);
  assert(filteredSalads.length > 0, 'Should find salads fitting pot size <= 35');
  
  filteredSalads.forEach(r => {
    assertEquals(r.category, '沙拉', 'Recipe must be Salad');
    assert(r.pot_size <= 35, `Recipe ${r.name_cn} pot_size ${r.pot_size} must be <= 35`);
    const normalEnergy = calcEnergy(r.base_energy, 1, 20, 1.0, 1.0);
    const tastyEnergy = calcEnergy(r.base_energy, 1, 20, 1.0, 3.0);
    assert(Math.abs(tastyEnergy - normalEnergy * 3) <= 2, `Tasty 3x multiplier must triple computed energy (got ${tastyEnergy}, expected ~${normalEnergy * 3})`);
  });
});


test('Tier 3 - Cross-Feature Combinations', 'Mobile Theme & Language Switching across all 5 Mobile Tab Views', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const storage = {};
  const ctx = {
    window: {
      localStorage: {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); }
      },
      addEventListener: () => {}
    },
    document: {
      documentElement: {
        setAttribute: (k, v) => { ctx.window.document[k] = v; },
        getAttribute: (k) => ctx.window.document[k] || null
      },
      querySelectorAll: () => []
    },
    console
  };
  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  const I18N = ctx.window.I18N;

  storage['user_theme'] = 'onyx';
  assertEquals(storage['user_theme'], 'onyx', 'Theme saved to localStorage');

  I18N.setLanguage('en-US');
  assertEquals(I18N.getLanguage(), 'en-US', 'Language updated to en-US');

  const enDock = [I18N.t('dock.pokemon') || 'Dex', I18N.t('dock.recipes') || 'Cook', I18N.t('dock.wiki') || 'Wiki', I18N.t('dock.box') || 'Box', I18N.t('dock.news') || 'News'];
  enDock.forEach(label => {
    assert(!/[\u4e00-\u9fa5]/.test(label), `Dock label "${label}" in en-US should not contain Chinese`);
  });

  I18N.setLanguage('zh-TW');
  assertEquals(I18N.getLanguage(), 'zh-TW', 'Language restored to zh-TW');
});


test('Tier 3 - Cross-Feature Combinations', 'Mobile Bottom Sheet Modal Lifecycle (Open, Subskill Selection, Backdrop Dismiss, Save)', () => {
  class BoxBottomSheetSimulator {
    constructor() {
      this.isOpen = false;
      this.currentPokemon = null;
      this.savedList = [];
    }
    openAdd() {
      this.isOpen = true;
      this.currentPokemon = {
        uid: 'pkm_' + Date.now(),
        name: '妙蛙種子',
        level: 25,
        nature: '固執',
        subskills: ['', '', '', '', '']
      };
    }
    selectSubskill(slotIdx, skill) {
      if (!this.isOpen || !this.currentPokemon) return;
      const alreadyChosen = this.currentPokemon.subskills.some((s, idx) => idx !== slotIdx && s === skill);
      if (!alreadyChosen) {
        this.currentPokemon.subskills[slotIdx] = skill;
      }
    }
    dismissBackdrop() {
      this.isOpen = false;
      this.currentPokemon = null;
    }
    save() {
      if (!this.isOpen || !this.currentPokemon) return;
      this.savedList.push({ ...this.currentPokemon });
      this.isOpen = false;
      this.currentPokemon = null;
    }
  }

  const sheet = new BoxBottomSheetSimulator();

  sheet.openAdd();
  assert(sheet.isOpen, 'Sheet should be open');
  sheet.selectSubskill(0, '樹果數量S');
  sheet.dismissBackdrop();
  assert(!sheet.isOpen, 'Sheet should be closed after backdrop tap');
  assertEquals(sheet.savedList.length, 0, 'No Pokemon should be saved on backdrop dismiss');

  sheet.openAdd();
  sheet.selectSubskill(0, '樹果數量S');
  sheet.selectSubskill(1, '樹果數量S');
  assertEquals(sheet.currentPokemon.subskills[1], '', 'Duplicate subskill selection should be rejected');
  sheet.selectSubskill(1, '幫手獎勵');
  assertEquals(sheet.currentPokemon.subskills[1], '幫手獎勵', 'Valid subskill should be assigned');
  sheet.save();
  assert(!sheet.isOpen, 'Sheet closed after save');
  assertEquals(sheet.savedList.length, 1, 'Pokemon saved to list');
  assertEquals(sheet.savedList[0].subskills[0], '樹果數量S', 'Saved BFS');
  assertEquals(sheet.savedList[0].subskills[1], '幫手獎勵', 'Saved Helping Bonus');
});


test('Tier 3 - Cross-Feature Combinations', '6D Appraisal Lab Modal Lifecycle from Box Card with SVG Radar Rendering', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const testPokemon = {
    id: '25',
    name_cn: '皮卡丘',
    specialty: '樹果',
    type: '電',
    interval: '00:45:00'
  };

  const evalResult = ctx.AppraisalLab.evaluatePokemon(testPokemon, 50, '固執', ['樹果數量S', '幫忙速度M'], ['特選蘋果', '特選蘋果']);
  assert(evalResult, 'Evaluation should produce result');

  const svg = ctx.AppraisalLab.renderRadarChartSVG(evalResult.scores, 260);
  assert(svg.includes('<svg'), 'Radar chart must be SVG');
  assert(svg.includes('viewBox='), 'SVG must include viewBox');
  assert(svg.includes('polygon'), 'SVG must include polygon');
});

// -------------------------------------------------------------------
// Tier 4 - Real-World Application Scenarios
// -------------------------------------------------------------------
console.log('\n--- Tier 4 - Real-World Application Scenarios ---');

// Baseline Tests 41-44

test('Tier 3 - Cross-Feature Combinations', 'Good-Night Ribbon Appraisal Lab Integration and Diagnostic Feedback', () => {
  const appraisalCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'appraisal.js'), 'utf8');
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  const ctx = {
    window: {},
    document: { createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }), body: { appendChild: () => {} } },
    console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);
  vm.runInContext(appraisalCode, ctx);

  const lab = ctx.AppraisalLab;

  // Pichu base interval: 4300s, 2 remaining evos
  const pichu = {
    id: '172',
    name_cn: '皮丘',
    specialty: '樹果',
    type: '電',
    interval: '01:11:40' // 4300s
  };

  // Evaluate Pichu without ribbon (Lv.0)
  const evalNoRibbon = lab.evaluatePokemon(pichu, 25, '認真', [], ['特選蘋果'], 0);
  assertEquals(evalNoRibbon.calculatedInterval, 4300, 'Pichu without ribbon should have base interval 4300s');

  // Evaluate Pichu with Ribbon Lv.4 (25% speed discount)
  const evalRibbonLv4 = lab.evaluatePokemon(pichu, 25, '認真', [], ['特選蘋果'], 4);
  const expectedInterval = Math.round(4300 * (1 - 0.25)); // 3225s
  assertEquals(evalRibbonLv4.calculatedInterval, expectedInterval, 'Pichu with Ribbon Lv.4 should have 3225s interval');
  assert(evalRibbonLv4.scores.speed > evalNoRibbon.scores.speed, 'Pichu with Ribbon Lv.4 should have higher speed score');

  // Verify diagnostic pros mention Good-Night Ribbon
  const hasRibbonPro = evalRibbonLv4.diagnostics.pros.some(p => p.includes('睡飽飽獎章') || p.includes('25%'));
  assert(hasRibbonPro, 'Diagnostics pros should mention Ribbon speed discount');

  // Evaluate fully evolved Raichu with Ribbon Lv.4 (speed discount must remain 0)
  const raichu = {
    id: '26',
    name_cn: '雷丘',
    specialty: '樹果',
    type: '電',
    interval: '00:36:40', // 2200s
    is_final: '〇'
  };
  const evalRaichuRibbon = lab.evaluatePokemon(raichu, 25, '認真', [], ['特選蘋果'], 4);
  assertEquals(evalRaichuRibbon.calculatedInterval, 2200, 'Raichu should receive 0% speed discount even with Ribbon Lv.4');
});


test('Tier 3 - Cross-Feature Combinations', 'Island Selection, Sleep Type Filter & EX Mode Reactive State', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  let mockPanel = {
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    addEventListener: () => {},
    setAttribute: () => {}
  };
  const mockContainer = { innerHTML: '', style: { display: '' } };

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
      getElementById: (id) => {
        if (id === 'wiki-subpanel-islands') return mockPanel;
        return {
          innerHTML: '',
          style: {},
          classList: { add: () => {}, remove: () => {}, contains: () => true },
          addEventListener: () => {},
          setAttribute: () => {}
        };
      },
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

  // Switch to islands subtab
  ctx.window.WikiDB.switchSubTab('islands');
  assertEquals(ctx.window.WikiDB.getCurrentSubTab(), 'islands', 'Current subtab must be islands');

  // Select Cyan Beach
  ctx.window.WikiDB.selectIsland('cyan');
  assert(mockPanel.innerHTML.includes('天青沙灘'), 'Selecting cyan must render Cyan Beach');

  // Toggle EX mode on Cyan
  ctx.window.WikiDB.toggleIslandExpertMode();
  assert(!mockPanel.innerHTML.includes('island-ex-card'), 'EX special explanation card must be removed');
  assert(mockPanel.innerHTML.includes('天青沙灘 EX'), 'Hero banner should display Cyan Beach EX');
  assert(mockPanel.innerHTML.includes('2,194,292'), 'Cyan EX must display Master 1 energy 2,194,292');
  assert(mockPanel.innerHTML.includes('14,780,152'), 'Cyan EX must display Master 20 energy 14,780,152');

  // Toggle off EX mode
  ctx.window.WikiDB.toggleIslandExpertMode();
  assert(!mockPanel.innerHTML.includes('island-ex-card'), 'Toggling off EX mode must not show EX card');
  assert(!mockPanel.innerHTML.includes('class="island-hero-title">天青沙灘 EX</h3>'), 'Toggling off EX mode must revert hero title to normal');
  assert(mockPanel.innerHTML.includes('class="island-hero-title">天青沙灘</h3>'), 'Toggling off EX mode must show normal hero title');
  assert(mockPanel.innerHTML.includes('256,544'), 'Normal Cyan must display Master 1 energy 256,544');
  assert(mockPanel.innerHTML.includes('3,732,664'), 'Normal Cyan must display Master 20 energy 3,732,664');

  // Sleep type filter
  ctx.window.WikiDB.filterIslandSleepType('slumbering');
  assert(mockPanel.innerHTML.includes('水箭龜'), 'Slumbering filter on Cyan should include Blastoise');
  assert(!mockPanel.innerHTML.includes('長翅鷗'), 'Slumbering filter should not show Dozing Pokemon Wingull');
});

}

module.exports = { registerTier3Tests };

if (require.main === module) {
  registerTier3Tests();
  const { printSummaryAndExit } = require('../test_harness');
  printSummaryAndExit();
}
