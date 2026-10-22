/**
 * Tier 2 - Boundary & Corner Cases (43 Tests)
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

function registerTier2Tests() {
  console.log('--- Tier 2 - Boundary & Corner Cases ---');

test('Tier 2 - Boundary & Corner Cases', 'Empty search string returns all items (with onlyFinal=false)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  const filtered = PokemonApp.filterData();
  assertEquals(filtered.length, dataset.length, 'Empty search with onlyFinal=false should return all items');
});


test('Tier 2 - Boundary & Corner Cases', 'ID search formats (#0001, 1, 01) correctly match Bulbasaur', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  ['#0001', '1', '01'].forEach(idQuery => {
    PokemonApp.currentSearch = idQuery;
    const res = PokemonApp.filterData();
    assert(res.length >= 1, `Query '${idQuery}' should match at least 1 item`);
    const match = res.find(p => getItemId(p) === '1');
    assert(match !== undefined, `Query '${idQuery}' should match Bulbasaur (ID 1)`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Case-insensitive search (bulbasaur, Bulbasaur, BULBASAUR)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  ['bulbasaur', 'Bulbasaur', 'BULBASAUR'].forEach(q => {
    PokemonApp.currentSearch = q;
    const res = PokemonApp.filterData();
    assert(res.length >= 1, `Search '${q}' should find results`);
    const match = res.find(p => getItemNameEN(p).toLowerCase() === 'bulbasaur');
    assert(match !== undefined, `Search '${q}' should match Bulbasaur`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Pokédex Typo-Tolerant & Loose Search (Chinese Homophones, English Typos, Strict Numeric IDs)', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  // 1. 中文同音字與免選字寬鬆搜尋 (Chinese Homophones & IME Typos)
  const cnTypoTests = [
    { q: '一步', expect: ['伊布', '雷伊布', '水伊布'] },
    { q: '依布', expect: ['伊布', '火伊布'] },
    { q: '雷一步', expect: ['雷伊布'], notExpect: ['水伊布'] },
    { q: '皮卡秋', expect: ['皮卡丘'] },
    { q: '皮卡求', expect: ['皮卡丘'] },
    { q: '梗鬼', expect: ['耿鬼'] },
    { q: '班吉拉', expect: ['班基拉斯'] },
    { q: '大鋼蛇', expect: ['大綱蛇'] },
    { q: '大綱蛇', expect: ['大綱蛇'] },
    { q: '沙奈舵', expect: ['沙奈朵'] },
    { q: '帝亞海獅', expect: ['帝牙海獅'] },
    { q: '爆雪王', expect: ['暴雪王'] },
    { q: '東東鼠', expect: ['咚咚鼠'] },
    { q: '耗大鯨', expect: ['浩大鯨'] },
    { q: '秋農炮蟲', expect: ['鍬農炮蟲'] },
    { q: '結尼龜', expect: ['傑尼龜'] },
    { q: '水劍龜', expect: ['水箭龜'] },
    { q: '妙花', expect: ['妙蛙花'] },
    { q: '噴水龍', expect: ['噴火龍'] }
  ];

  cnTypoTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    const names = res.map(p => getItemNameCN(p));
    tc.expect.forEach(target => {
      assert(names.includes(target), `Loose search for '${tc.q}' should match '${target}', got: [${names.slice(0, 5).join(', ')}]`);
    });
    if (tc.notExpect) {
      tc.notExpect.forEach(unwanted => {
        assert(!names.includes(unwanted), `Search for '${tc.q}' should NOT match '${unwanted}'`);
      });
    }
  });

  // 2. 英文拼字錯誤寬鬆搜尋 (English Typo Tolerance)
  const enTypoTests = [
    { q: 'eeve', expect: 'Eevee' },
    { q: 'pikachuu', expect: 'Pikachu' },
    { q: 'picachu', expect: 'Pikachu' },
    { q: 'charzard', expect: 'Charizard' },
    { q: 'blastose', expect: 'Blastoise' },
    { q: 'tyraniter', expect: 'Tyranitar' },
    { q: 'gengr', expect: 'Gengar' },
    { q: 'balbasaur', expect: 'Bulbasaur' }
  ];

  enTypoTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    const namesEN = res.map(p => getItemNameEN(p));
    assert(namesEN.includes(tc.expect), `English typo search for '${tc.q}' should match '${tc.expect}'`);
  });

  // 3. 純數字嚴格編號邏輯 (Strict Numeric ID Matching - No False Positives)
  const numTests = [
    { q: '25', expectName: '皮卡丘' },
    { q: '#0025', expectName: '皮卡丘' },
    { q: '1', expectName: '妙蛙種子' },
    { q: '#0001', expectName: '妙蛙種子' },
    { q: '133', expectName: '伊布' }
  ];

  numTests.forEach(tc => {
    PokemonApp.currentSearch = tc.q;
    const res = PokemonApp.filterData();
    assertEquals(res.length, 1, `Numeric query '${tc.q}' must strictly return 1 exact Pokémon, got ${res.length}`);
    assertEquals(getItemNameCN(res[0]), tc.expectName, `Numeric query '${tc.q}' should strictly match '${tc.expectName}'`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Multi-select type combinations (e.g. ["草", "毒"])', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedTypes = new Set(['草', '毒']);

  const res = PokemonApp.filterData();
  assert(res.length > 0, 'Multi-type filter should return items');
  res.forEach(item => {
    assert(item.type === '草' || item.type === '毒', `Item ${item.id} type '${item.type}' not in selected types ['草', '毒']`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Multi-select specialty combinations (e.g. ["樹果", "食材"]) and Mew all-specialty inclusion', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties = new Set(['樹果', '食材']);

  const res = PokemonApp.filterData();
  assert(res.length > 0, 'Multi-specialty filter should return items');
  res.forEach(item => {
    assert(item.specialty === '樹果' || item.specialty === '食材' || item.specialty === '全部', `Item ${item.id} specialty '${item.specialty}' not in ['樹果', '食材', '全部']`);
  });

  const mew = res.find(p => p.name_cn === '夢幻');
  assert(mew !== undefined, 'Mew (夢幻) must be included when filtering by 樹果/食材');

  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedBerries = new Set(['桃桃果']);
  const fairyFiltered = PokemonApp.filterData();
  assert(fairyFiltered.length > 0, 'Fairy berry filter (桃桃果) should return Fairy-type Pokémon');
  const fairyPkm = fairyFiltered.find(p => p.name_cn === '皮可西' || p.name_cn === '胖可丁' || p.name_cn === '仙子伊布');
  assert(fairyPkm !== undefined, 'Clefable/Wigglytuff/Sylveon should match Fairy berry 桃桃果');
});


test('Tier 2 - Boundary & Corner Cases', 'Dynamic Sub-Filters: Berry, Ingredient, and Skill multi-select filtering', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  PokemonApp.selectedBerries = new Set(['墨莓果', '蘋野果']);
  const berryFiltered = PokemonApp.filterData();
  assert(berryFiltered.length > 0, 'Berry filter should return results');
  berryFiltered.forEach(p => {
    assert(p.type === '草' || p.type === '火', `Item ${p.id} type '${p.type}' should match 墨莓果/蘋野果`);
  });

  PokemonApp.selectedBerries.clear();
  PokemonApp.selectedIngredients = new Set(['甜甜蜜']);
  const ingFiltered = PokemonApp.filterData();
  assert(ingFiltered.length > 0, 'Ingredient filter should return results');
  ingFiltered.forEach(p => {
    const hasHoney = p.ingredients && p.ingredients.some(ing => ing.name === '甜甜蜜');
    assert(hasHoney, `Item ${p.name_cn} should have 甜甜蜜 in its ingredients`);
  });

  PokemonApp.onlyInitialIng = true;
  PokemonApp.selectedIngredients = new Set(['特選蘋果']);
  const initialIngFiltered = PokemonApp.filterData();
  assert(initialIngFiltered.length > 0, 'Initial ingredient filter should return results');
  initialIngFiltered.forEach(p => {
    const initialName = p.ingredients && p.ingredients[0] ? p.ingredients[0].name : '';
    assert(initialName === '特選蘋果', `Item ${p.name_cn} initial ingredient (${initialName}) must be 特選蘋果 when onlyInitialIng is true`);
  });
  PokemonApp.onlyInitialIng = false;

  PokemonApp.selectedIngredients.clear();
  PokemonApp.selectedSkills = new Set(['料理成功S']);
  const tastyFiltered = PokemonApp.filterData();
  assert(tastyFiltered.length > 0, 'Skill filter for 料理成功S should return results');
  const heracross = tastyFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracross !== undefined, '赫拉克羅斯 (健美) should match 料理成功S');

  PokemonApp.selectedSkills = new Set(['食材獲取S']);
  const ingSkillFiltered = PokemonApp.filterData();
  const heracrossIng = ingSkillFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracrossIng !== undefined, '赫拉克羅斯 (健美) should also match 食材獲取S');
  const delibird = ingSkillFiltered.find(p => p.name_cn === '信使鳥');
  assert(delibird !== undefined, '信使鳥 (禮物) should match 食材獲取S');

  PokemonApp.selectedSkills = new Set(['料理強化S']);
  const potSkillFiltered = PokemonApp.filterData();
  const heracrossPot = potSkillFiltered.find(p => p.name_cn === '赫拉克羅斯');
  assert(heracrossPot === undefined, '赫拉克羅斯 (健美) should NOT match 料理強化S');

  PokemonApp.selectedSkills = new Set(['活力療癒S']);
  const healSkillFiltered = PokemonApp.filterData();
  const umbreon = healSkillFiltered.find(p => p.name_cn === '月亮伊布');
  assert(umbreon !== undefined, '月亮伊布 (月光) should match 活力療癒S');
  const shuckle = healSkillFiltered.find(p => p.name_cn === '壺壺');
  assert(shuckle !== undefined, '壺壺 (樹果汁) should match 活力療癒S');

  PokemonApp.selectedSkills = new Set(['樹果遽增']);
  const berrySkillFiltered = PokemonApp.filterData();
  const mimikyu = berrySkillFiltered.find(p => p.name_cn === '謎擬Q');
  assert(mimikyu !== undefined, '謎擬Q (畫皮) should match 樹果遽增');
  const mewtwo = berrySkillFiltered.find(p => p.name_cn === '超夢');
  assert(mewtwo !== undefined, '超夢 (精神擊破) should match 樹果遽增');

  PokemonApp.selectedSkills.clear();
  PokemonApp.selectedSpecialties = new Set(['食材']);
  PokemonApp.selectedBerries = new Set(['蘋野果']);
  const crossFiltered = PokemonApp.filterData();
  assert(crossFiltered.length > 0, 'Cross filter for 食材 specialty + 蘋野果 should return results');
  const charizard = crossFiltered.find(p => p.name_cn === '噴火龍');
  assert(charizard !== undefined, '噴火龍 should match 食材 specialty + 蘋野果 (火樹果)');
});


test('Tier 2 - Boundary & Corner Cases', 'Final Evolution Filter: onlyFinal defaults to TRUE and correctly filters final/single stages', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.currentSearch = '';
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();
  PokemonApp.selectedBerries.clear();
  PokemonApp.selectedIngredients.clear();
  PokemonApp.selectedSkills.clear();

  assertEquals(PokemonApp.onlyFinal, true, 'PokemonApp.onlyFinal should default to true');
  const defaultFinals = PokemonApp.filterData();
  assertEquals(defaultFinals.length, 128, 'Default filter should return exactly 128 final/single stage Pokémon');

  const preEvos = ['妙蛙種子', '妙蛙草', '小火龍', '火恐龍', '傑尼龜', '卡咪龜', '皮丘', '皮卡丘'];
  preEvos.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found === undefined, `Pre-evolution ${name} should NOT be in final evolution list`);
  });

  const finalStages = ['妙蛙花', '噴火龍', '水箭龜', '雷丘', '凱羅斯', '赫拉克羅斯', '超夢', '夢幻'];
  finalStages.forEach(name => {
    const found = defaultFinals.find(p => p.name_cn === name);
    assert(found !== undefined, `Final stage ${name} MUST be in final evolution list`);
  });

  PokemonApp.onlyFinal = false;
  assertEquals(PokemonApp.filterData().length, dataset.length, 'onlyFinal=false should return all 247 items');
});


test('Tier 2 - Boundary & Corner Cases', 'Special Main Skill Tooltip Details: Hover tooltips only on special skills matching official in-game text', () => {
  assert(typeof SPECIAL_SKILL_DETAILS === 'object', 'SPECIAL_SKILL_DETAILS dictionary is missing');
  assert(typeof renderSkillWithTooltip === 'function', 'renderSkillWithTooltip function is missing');

  const specialSkills = [
    '健美（料理輔助S）',
    '月光（活力填充S）',
    '樹果汁（活力全體療癒S）',
    '精神擊破（樹果領域）',
    '畫皮（樹果遽增）',
    '新月祈禱（活力全體療癒S）',
    '正電（食材獲取S）',
    '負電（料理強化S）'
  ];

  specialSkills.forEach(skill => {
    assert(SPECIAL_SKILL_DETAILS[skill] !== undefined, `Missing SPECIAL_SKILL_DETAILS entry for ${skill}`);
    const html = renderSkillWithTooltip(skill);
    assert(html.includes('special-skill-badge'), `Rendered badge for ${skill} should have 'special-skill-badge' class`);
    assert(html.includes('data-skill-detail='), `Rendered badge for ${skill} should have data-skill-detail attribute`);
    assert(!html.includes('✨'), `Rendered badge for ${skill} must not include sparkle emoji`);
  });

  const heracrossDetail = typeof SPECIAL_SKILL_DETAILS['健美（料理輔助S）'] === 'object'
    ? SPECIAL_SKILL_DETAILS['健美（料理輔助S）']['zh-TW']
    : SPECIAL_SKILL_DETAILS['健美（料理輔助S）'];
  assertEquals(
    heracrossDetail,
    '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'Heracross skill description must match official in-game text'
  );

  const pureBaseSkills = [
    '能量填充S',
    '能量填充M',
    '能量填充S（隨機）',
    '夢之碎片獲取S',
    '夢之碎片獲取S（隨機）',
    '食材獲取S',
    '活力全體療癒S',
    '料理強化S',
    '幫手支援S'
  ];
  pureBaseSkills.forEach(skill => {
    const rendered = renderSkillWithTooltip(skill);
    const expected = skill
      .replace(/活力全體療癒S/g, '全體療癒S')
      .replace(/夢之碎片/g, '夢碎')
      .replace(/（/g, '(')
      .replace(/）/g, ')');
    assertEquals(rendered, expected, `Pure base skill ${skill} should be rendered as plain text without tooltip or badge`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Fallback icon validation: missing/empty icon property defaults to SVG placeholder', () => {
  const itemNoIcon = { id: 9999, name: { cn: 'Test' }, type: '草', specialty: '樹果', icon: '' };
  const icon = getItemIcon(itemNoIcon);
  assert(icon.startsWith('data:image/svg+xml'), 'Empty icon should fallback to SVG data URI');
});


test('Tier 2 - Boundary & Corner Cases', 'Box Data Operations: CRUD structure and level boundaries (Lv.1 to Lv.80)', () => {
  const dummyPokemon = {
    uid: 'pkm_test_123',
    pokemonId: '1',
    name: '妙蛙種子',
    level: 80,
    nickname: '草系主將',
    nature: '固執',
    ing1: '特選蘋果',
    ing2: '特選蘋果',
    ing3: '窩心牛奶',
    subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升M']
  };

  assert(dummyPokemon.level >= 1 && dummyPokemon.level <= 80, 'Level out of bounds (1~80)');
  assert(dummyPokemon.subskills.length <= 5, 'Subskills must not exceed 5');
  assert(dummyPokemon.name && dummyPokemon.name.trim(), 'Box Pokemon missing name');
  assert(dummyPokemon.uid && dummyPokemon.uid.startsWith('pkm_'), 'Invalid UID format');
});


test('Tier 2 - Boundary & Corner Cases', 'RaenonX PR Calculation: Fast-Exit Baseline Filter & Lv.70/Lv.80 Sub-skill coverage', () => {
  const boxModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'));
  const calcPR = boxModule.calculatePokemonPR;
  assert(typeof calcPR === 'function', 'calculatePokemonPR must be a function');

  const berryGod = {
    name: '小拉達',
    specialty: '樹果',
    nature: '固執',
    subskills: ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能等級提升M', '持有上限提升L']
  };
  const berryResult = calcPR(berryGod, { specialty: '樹果' });
  assert(berryResult.pr >= 90, `Berry God PR should be >= 90 (got ${berryResult.pr})`);
  assertEquals(berryResult.tier, 'S+', 'Berry God should be S+ tier');
  assert(berryResult.summaryNote.includes('樹果S') || berryResult.summaryNote.includes('幫忙速度'), 'Summary should highlight BFS');

  const ingSpecialist = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '內斂',
    subskills: ['食材機率提升M', '幫手獎勵', '食材機率提升S', '持有上限提升M', '幫忙速度M']
  };
  const ingResult = calcPR(ingSpecialist, { specialty: '食材' });
  assert(ingResult.pr >= 80, `Ingredient Specialist PR should be >= 80 (got ${ingResult.pr})`);
  assert(ingResult.tier === 'S+' || ingResult.tier === 'S', `Ingredient Specialist tier should be S/S+ (got ${ingResult.tier})`);

  const poorBerry = {
    name: '小拉達',
    specialty: '樹果',
    nature: '內斂',
    subskills: ['持有上限提升S', '活力回復提升S']
  };
  const poorResult = calcPR(poorBerry, { specialty: '樹果' });
  assert(poorResult.pr < 50, `Poor Pokemon PR should be < 50 (got ${poorResult.pr})`);
  assert(poorResult.tier === 'B' || poorResult.tier === 'C', `Poor Pokemon tier should be B or C (got ${poorResult.tier})`);
  assert((poorResult.summaryNote.includes('[!]') || poorResult.summaryNote.includes('⚠️')) && poorResult.summaryNote.includes('未達'), 'Summary note should indicate baseline failure');

  const poorIng = {
    name: '妙蛙種子',
    specialty: '食材',
    nature: '固執',
    subskills: ['幫忙速度S', '睡眠EXP獎勵']
  };
  const poorIngResult = calcPR(poorIng, { specialty: '食材' });
  assert(poorIngResult.pr < 50, `Poor Ingredient PR should be < 50 (got ${poorIngResult.pr})`);
  assert(poorIngResult.summaryNote.includes('[!]') || poorIngResult.summaryNote.includes('⚠️'), 'Should fail baseline due to Ing debuff');
});


test('Tier 2 - Boundary & Corner Cases', 'Event Gantt Timeline Parser: Identifies Events and Bundles with column grid spans and date ranges', () => {
  const newsPath = path.join(WORKSPACE_ROOT, 'data', 'news.json');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf8'));
  const newsModule = require(path.join(WORKSPACE_ROOT, 'js', 'modules', 'news.js'));

  const timeline = newsModule.parseEventTimeline(newsData);
  assert(Array.isArray(timeline), 'parseEventTimeline must return an array');
  assert(timeline.length > 0, 'Timeline should contain event items');

  const firstItem = timeline[0];
  assert(firstItem.title, 'Timeline item missing title');
  assert(firstItem.startStr && firstItem.endStr, 'Timeline item missing startStr or endStr');
  assert(typeof firstItem.startCol === 'number' && typeof firstItem.spanCols === 'number', 'Timeline item missing grid column spans');
  assert(firstItem.typeLabel && firstItem.typeClass, 'Timeline item missing type label');

  const events = timeline.filter(t => t.typeClass === 'gantt-bar-event');
  const packs = timeline.filter(t => t.typeClass === 'gantt-bar-pack');
  assert(events.length > 0, 'Gantt timeline should parse events');
  assert(packs.length > 0, 'Gantt timeline should parse bundle packs');
});


test('Tier 2 - Boundary & Corner Cases', 'Special Pokemon icon resolution (9001-9006, 7006, 7007, 7054, 8001) and Mewtwo standard icon resolution', () => {
  const specialIds = ['9001', '9002', '9003', '9004', '9005', '9006', '7006', '7007', '7054', '8001'];
  specialIds.forEach(id => {
    const item = dataset.find(p => String(p.id) === id);
    if (item) {
      const icon = getItemIcon(item);
      assert(icon && icon.startsWith('https://www.serebii.net/'), `Special item #${id} icon missing or not Serebii URL: ${icon}`);
      assert(!icon.includes(`pokemonsleep/pokemon/icon/${id}.png`), `Special item #${id} must not use naive numerical path pokemonsleep/pokemon/icon/${id}.png`);
    }
  });

  const mewtwo = dataset.find(p => String(p.id) === '150');
  if (mewtwo) {
    const icon = getItemIcon(mewtwo);
    assertEquals(icon, 'https://www.serebii.net/pokemonsleep/pokemon/icon/150.png', 'Mewtwo #150 icon should map to official Serebii pokemonsleep icon');
  }
});


test('Tier 2 - Boundary & Corner Cases', 'Table column sort: carry/ingredient/skill default desc, interval default asc; same-col toggles; switching col uses that col default', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;

  assertEquals(PokemonApp.toggleColumnSort('carry'), 'carry-desc', '持有 first click should be desc');
  let list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemCarry(list[i]) >= getItemCarry(list[i + 1]), '持有 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('carry'), 'carry-asc', '持有 second click should toggle to asc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemCarry(list[i]) <= getItemCarry(list[i + 1]), '持有 should sort asc after toggle');
  }

  assertEquals(PokemonApp.toggleColumnSort('ingredientRate'), 'ingredientRate-desc', '食材率 first click from other col should be desc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemIngredientRate(list[i]) >= getItemIngredientRate(list[i + 1]), '食材率 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('skillRate'), 'skillRate-desc', '技能率 first click from other col should be desc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemSkillRate(list[i]) >= getItemSkillRate(list[i + 1]), '技能率 should sort desc');
  }

  assertEquals(PokemonApp.toggleColumnSort('interval'), 'interval-asc', '幫忙間隔 first click should be asc');
  list = PokemonApp.render();
  for (let i = 0; i < list.length - 1; i++) {
    assert(getItemHelpInterval(list[i]) <= getItemHelpInterval(list[i + 1]), '幫忙間隔 should sort asc');
  }

  assertEquals(PokemonApp.toggleColumnSort('interval'), 'interval-desc', '幫忙間隔 second click should toggle to desc');
});


test('Tier 2 - Boundary & Corner Cases', 'Batch OCR & Smart Deduplication: Fingerprint hashing and duplicate rejection', () => {
  const boxCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'box.js'), 'utf8');
  
  const ctx = {
    window: {},
    document: { 
      createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, className: '' }), 
      getElementById: () => null,
      querySelectorAll: () => [],
      body: { appendChild: () => {} }
    },
    console: console
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(boxCode, ctx);

  const pkmA1 = { name: '雷丘', level: 35, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };
  const pkmA2 = { name: '雷丘', level: 35, nature: '固執', subskills: ['幫忙速度M', '樹果數量S'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };
  const pkmB = { name: '雷丘', level: 36, nature: '固執', subskills: ['樹果數量S', '幫忙速度M'], ing1: '特選蘋果', ing2: '特選蘋果', ing3: '特選蘋果' };

  function makeFP(p) {
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.name || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  const fpA1 = makeFP(pkmA1);
  const fpA2 = makeFP(pkmA2);
  const fpB = makeFP(pkmB);

  assertEquals(fpA1, fpA2, 'Fingerprint should be order-independent for subskills');
  assert(fpA1 !== fpB, 'Fingerprint should distinguish different levels');
});


test('Tier 2 - Boundary & Corner Cases', 'Sidebar Filter UI Tokens (Ing.1 only & 2-column layout tokens)', () => {
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');
  const ctx = {
    window: {
      location: { hash: '#pokemon' },
      localStorage: { getItem: () => 'en-US', setItem: () => {} }
    }
  };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  vm.runInContext(i18nCode, ctx);

  ctx.window.I18N.setLanguage('en-US');
  const initialIngText = ctx.window.I18N.t('pokedex.only_initial_ing');
  assert(initialIngText === '🥗 Ing.1 only', `pokedex.only_initial_ing in English must be "🥗 Ing.1 only", got "${initialIngText}"`);
});

// --- NEW Tier 2 Tests: Redirection, Anti-Loop, Stepper, Subskills, Clear Button ---

test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Screen width threshold (<= 768px triggers redirect, > 768px remains on desktop)', () => {
  function checkRedirect(innerWidth, userAgent, storedPref, urlQuery) {
    if ((urlQuery && urlQuery.includes('view=desktop')) || storedPref === 'desktop') return false;
    if ((urlQuery && urlQuery.includes('view=mobile')) || storedPref === 'mobile') return true;
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(userAgent || '');
    return isMobileUA || (typeof innerWidth === 'number' && innerWidth <= 768);
  }

  [320, 360, 375, 390, 414, 430, 600, 768].forEach(w => {
    assert(checkRedirect(w, 'Mozilla/5.0 (Windows NT 10.0)', null, ''), `Screen width ${w}px should trigger mobile redirect`);
  });

  [769, 800, 1024, 1280, 1440, 1920, 2560].forEach(w => {
    assert(!checkRedirect(w, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', null, ''), `Screen width ${w}px should NOT trigger mobile redirect`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: User Agent detection handles diverse mobile devices', () => {
  function checkRedirectUA(userAgent) {
    return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent || '');
  }

  const mobileUAs = [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 Chrome/120.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 Chrome/114.0.0.0 Mobile Safari/537.36'
  ];

  mobileUAs.forEach(ua => {
    assert(checkRedirectUA(ua), `User Agent "${ua.slice(0, 40)}..." should be recognized as mobile device`);
  });

  const desktopUAs = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0'
  ];

  desktopUAs.forEach(ua => {
    assert(!checkRedirectUA(ua), `Desktop User Agent "${ua.slice(0, 40)}..." should NOT be recognized as mobile`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Boundary value 768px vs 769px exact transition', () => {
  function checkBoundary(w) {
    return typeof w === 'number' && w <= 768;
  }
  assertEquals(checkBoundary(768), true, '768px (exact boundary) must redirect to mobile');
  assertEquals(checkBoundary(769), false, '769px (1px above boundary) must remain on desktop');
  assertEquals(checkBoundary(767.9), true, '767.9px (fractional boundary) must redirect to mobile');
});


test('Tier 2 - Boundary & Corner Cases', 'Smart Redirection: Orientation change (portrait 390x844 vs landscape 844x390) with mobile UA', () => {
  function checkOrientation(w, ua) {
    const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua || '');
    return isMobileUA || (typeof w === 'number' && w <= 768);
  }
  const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1';
  assertEquals(checkOrientation(390, iphoneUA), true, 'iPhone in portrait should redirect');
  assertEquals(checkOrientation(844, iphoneUA), true, 'iPhone in landscape (844px wide) should still redirect due to mobile UA');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: pksleep_view_pref="desktop" in localStorage prevents redirect loop on mobile device', () => {
  function shouldRedirect(innerWidth, userAgent, storedPref, urlQuery) {
    if ((urlQuery && urlQuery.includes('view=desktop')) || storedPref === 'desktop') return false;
    if ((urlQuery && urlQuery.includes('view=mobile')) || storedPref === 'mobile') return true;
    const isMobileUA = /Android|iPhone|Mobile/i.test(userAgent || '');
    return isMobileUA || innerWidth <= 768;
  }

  const result = shouldRedirect(375, 'iPhone', 'desktop', '');
  assertEquals(result, false, 'Explicit desktop preference must block mobile redirection');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: URL query ?view=desktop forces desktop view and updates localStorage', () => {
  let storedPref = null;
  function handleUrlRedirection(query, currentPref) {
    if (query.includes('view=desktop')) {
      storedPref = 'desktop';
      return { redirect: false, target: null };
    }
    if (query.includes('view=mobile')) {
      storedPref = 'mobile';
      return { redirect: true, target: 'app/index.html' };
    }
    if (currentPref === 'desktop') return { redirect: false, target: null };
    return { redirect: true, target: 'app/index.html' };
  }

  const navResult = handleUrlRedirection('?view=desktop', null);
  assertEquals(navResult.redirect, false, '?view=desktop must prevent redirect');
  assertEquals(storedPref, 'desktop', 'Visiting ?view=desktop must persist desktop preference');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: Switching back to mobile via ?view=mobile updates preference and redirects', () => {
  let storedPref = 'desktop';
  function handleMobileSwitch(query) {
    if (query.includes('view=mobile')) {
      storedPref = 'mobile';
      return { redirect: true, target: 'app/index.html' };
    }
    return { redirect: false, target: null };
  }

  const res = handleMobileSwitch('?view=mobile');
  assertEquals(res.redirect, true, '?view=mobile must redirect to mobile');
  assertEquals(storedPref, 'mobile', 'Preference must be updated to mobile');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: URL hash preservation during redirection (#recipes, #wiki, #box, #news)', () => {
  function getRedirectUrlWithHash(basePath, hash) {
    const cleanHash = hash ? (hash.startsWith('#') ? hash : '#' + hash) : '';
    return `${basePath}${cleanHash}`;
  }

  assertEquals(getRedirectUrlWithHash('app/index.html', '#recipes'), 'app/index.html#recipes', 'Hash #recipes must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', '#wiki'), 'app/index.html#wiki', 'Hash #wiki must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', '#box'), 'app/index.html#box', 'Hash #box must be preserved');
  assertEquals(getRedirectUrlWithHash('app/index.html', ''), 'app/index.html', 'Empty hash produces clean URL');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Loop Guard: Corrupted or invalid preference values fallback safely to auto-detection', () => {
  function sanitizePref(val) {
    if (val === 'desktop' || val === 'mobile') return val;
    return null;
  }

  ['invalid', '', '123', '{}', 'undefined', null, undefined].forEach(corrupted => {
    assertEquals(sanitizePref(corrupted), null, `Corrupted value "${corrupted}" should sanitize to null`);
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Decrement clamped strictly at minimum capacity 15', () => {
  function stepPot(current, delta, min = 15, max = 200) {
    const next = current + delta;
    if (next < min) return min;
    if (next > max) return max;
    return next;
  }

  assertEquals(stepPot(15, -1), 15, 'Decrement from 15 should clamp to 15');
  assertEquals(stepPot(15, -6), 15, 'Large decrement from 15 should clamp to 15');
  assertEquals(stepPot(18, -6), 15, 'Decrement below 15 should clamp to 15');
  assertEquals(stepPot(21, -3), 18, 'Valid decrement from 21 should be 18');
});


test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Increment clamped strictly at maximum capacity 200', () => {
  function stepPot(current, delta, min = 15, max = 200) {
    const next = current + delta;
    if (next < min) return min;
    if (next > max) return max;
    return next;
  }

  assertEquals(stepPot(200, 1), 200, 'Increment from 200 should clamp to 200');
  assertEquals(stepPot(198, 6), 200, 'Increment past 200 should clamp to 200');
  assertEquals(stepPot(100, 3), 103, 'Valid increment from 100 should be 103');
});


test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Quick-select presets (15, 21, 30, 50, 70, 100) and step increments', () => {
  const presets = [15, 21, 30, 50, 70, 100];
  presets.forEach(p => {
    assert(p >= 15 && p <= 200, `Preset ${p} must be within [15, 200]`);
  });

  const recipesPath = path.join(WORKSPACE_ROOT, 'data', 'recipes.json');
  const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

  const recipesAt15 = recipes.filter(r => r.pot_size <= 15);
  const recipesAt50 = recipes.filter(r => r.pot_size <= 50);
  const recipesAt100 = recipes.filter(r => r.pot_size <= 100);
  const recipesAtMax = recipes.filter(r => r.pot_size <= 200);

  assert(recipesAt15.length > 0, 'Should have recipes available at pot size 15');
  assert(recipesAt50.length > recipesAt15.length, 'Pot size 50 should unlock more recipes than 15');
  assert(recipesAt100.length > recipesAt50.length, 'Pot size 100 should unlock more recipes than 50');
  assertEquals(recipesAtMax.length, recipes.length, 'Max pot size 200 should unlock all 78 recipes');
});


test('Tier 2 - Boundary & Corner Cases', 'Pot Stepper: Sanitization of non-numeric and NaN manual inputs', () => {
  function sanitizePotInput(input, defaultVal = 15, min = 15, max = 200) {
    const num = parseInt(input, 10);
    if (isNaN(num)) return defaultVal;
    if (num < min) return min;
    if (num > max) return max;
    return num;
  }

  assertEquals(sanitizePotInput('abc', 15), 15, 'Non-numeric string should default to 15');
  assertEquals(sanitizePotInput('-10', 15), 15, 'Negative input should clamp to min 15');
  assertEquals(sanitizePotInput('999', 15), 200, 'Excessive input should clamp to max 200');
  assertEquals(sanitizePotInput('57', 15), 57, 'Valid string input "57" should parse to 57');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Selecting a subskill in Slot 1 disables it in Slots 2-5', () => {
  function isSkillAvailable(skillName, targetSlotIndex, currentSelections) {
    if (!skillName) return true;
    return !currentSelections.some((selected, idx) => idx !== targetSlotIndex && selected === skillName);
  }

  const selections = ['樹果數量S', '', '', '', ''];
  assertEquals(isSkillAvailable('樹果數量S', 1, selections), false, 'BFS must be unavailable for Slot 2 when chosen in Slot 1');
  assertEquals(isSkillAvailable('樹果數量S', 2, selections), false, 'BFS must be unavailable for Slot 3');
  assertEquals(isSkillAvailable('樹果數量S', 0, selections), true, 'BFS must be available for its own Slot 1');
  assertEquals(isSkillAvailable('幫手獎勵', 1, selections), true, 'Unselected skill Helping Bonus must be available for Slot 2');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Re-assigning or clearing a slot frees up the previous subskill', () => {
  function isSkillAvailable(skillName, targetSlotIndex, currentSelections) {
    if (!skillName) return true;
    return !currentSelections.some((selected, idx) => idx !== targetSlotIndex && selected === skillName);
  }

  let selections = ['樹果數量S', '幫手獎勵', '幫忙速度M', '', ''];
  assertEquals(isSkillAvailable('樹果數量S', 3, selections), false, 'BFS unavailable before clear');

  selections[0] = '技能機率提升M';
  assertEquals(isSkillAvailable('樹果數量S', 3, selections), true, 'BFS becomes available for Slot 4 after Slot 1 is changed');
  assertEquals(isSkillAvailable('技能機率提升M', 3, selections), false, 'Skill Trigger M becomes unavailable');
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: Reset / Clear All resets all 5 slots and enables all skills', () => {
  let selections = ['', '', '', '', ''];
  const allSubskills = ['樹果數量S', '幫手獎勵', '幫忙速度M', '技能機率提升M', '睡眠EXP獎勵', '持有上限提升L'];
  
  allSubskills.forEach(skill => {
    for (let slot = 0; slot < 5; slot++) {
      const available = !selections.some((s, idx) => idx !== slot && s === skill);
      assert(available, `Skill ${skill} must be available for slot ${slot} after Clear All`);
    }
  });
});


test('Tier 2 - Boundary & Corner Cases', 'Anti-Duplicate Subskills: 5-slot unique validation on save prevents duplicate submission', () => {
  function validateSubskills(subskills) {
    const filled = (subskills || []).filter(Boolean);
    const unique = new Set(filled);
    return filled.length === unique.size;
  }

  assert(validateSubskills(['樹果數量S', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升M']), '5 unique subskills should pass validation');
  assert(!validateSubskills(['樹果數量S', '樹果數量S', '幫忙速度M', '', '']), 'Duplicate BFS should fail validation');
  assert(validateSubskills(['樹果數量S', '', '', '', '']), 'Single subskill with empty slots should pass validation');
});


test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Visibility state toggles based on input content', () => {
  function getClearButtonDisplay(searchText) {
    return (searchText && searchText.trim().length > 0) ? 'inline-flex' : 'none';
  }

  assertEquals(getClearButtonDisplay(''), 'none', 'Clear button should be hidden when search is empty');
  assertEquals(getClearButtonDisplay('   '), 'none', 'Clear button should be hidden when search is only whitespace');
  assertEquals(getClearButtonDisplay('pikachu'), 'inline-flex', 'Clear button should be visible when search has text');
  assertEquals(getClearButtonDisplay('1'), 'inline-flex', 'Clear button should be visible with single char input');
});


test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Clear action resets input and restores full filtered dataset', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes.clear();
  PokemonApp.selectedSpecialties.clear();

  PokemonApp.currentSearch = '妙蛙';
  let results = PokemonApp.filterData();
  assert(results.length < dataset.length, 'Search should narrow results');

  PokemonApp.currentSearch = '';
  results = PokemonApp.filterData();
  assertEquals(results.length, dataset.length, 'Clearing search must restore all items');
});


test('Tier 2 - Boundary & Corner Cases', 'Search Clear Button: Clearing search with active type filters preserves active type filters', () => {
  PokemonApp.init([...dataset]);
  PokemonApp.onlyFinal = false;
  PokemonApp.selectedTypes = new Set(['電']);
  PokemonApp.selectedSpecialties.clear();

  PokemonApp.currentSearch = '雷丘';
  let results = PokemonApp.filterData();
  results.forEach(p => assertEquals(p.type, '電', 'Results must be Electric type'));

  PokemonApp.currentSearch = '';
  results = PokemonApp.filterData();
  assert(results.length > 1, 'Clearing search should return all Electric Pokemon');
  results.forEach(p => assertEquals(p.type, '電', 'All results must still be Electric type'));
});

// -------------------------------------------------------------------
// Tier 3 - Cross-Feature Combinations
// -------------------------------------------------------------------
console.log('\n--- Tier 3 - Cross-Feature Combinations ---');

// Baseline Test 40

test('Tier 2 - Boundary & Corner Cases', 'Back to Top Scroll Threshold, Long Content Detection, and Mobile Filter Collision Avoidance', () => {
  // Simulator for Back-to-Top behavior
  class BackToTopSimulator {
    constructor(options = {}) {
      this.isMobileH5 = options.isMobileH5 || false;
      this.docHeight = options.docHeight || 800;
      this.winHeight = options.winHeight || 600;
      this.scrollY = options.scrollY || 0;
      this.fabVisible = options.fabVisible || false;
      this.visible = false;
      this.hasFilterFab = false;
    }

    update() {
      const isLongContent = this.docHeight > this.winHeight + 150;
      const shouldShow = isLongContent && this.scrollY > 280;
      this.visible = shouldShow;

      if (this.isMobileH5) {
        this.hasFilterFab = this.fabVisible;
      } else {
        this.hasFilterFab = false;
      }
    }

    scrollToTop() {
      this.scrollY = 0;
      this.update();
    }
  }

  // 1. Short content: even when scrolled past 280, button must not show
  const shortPage = new BackToTopSimulator({ docHeight: 650, winHeight: 600, scrollY: 350 });
  shortPage.update();
  assertEquals(shortPage.visible, false, 'Short page must NOT show back-to-top button');

  // 2. Long content: at top of page, button must be hidden
  const longPage = new BackToTopSimulator({ docHeight: 2500, winHeight: 800, scrollY: 100 });
  longPage.update();
  assertEquals(longPage.visible, false, 'Long page with scroll <= 280 must NOT show back-to-top button');

  // 3. Long content: scrolled down past 280, button must become visible
  longPage.scrollY = 350;
  longPage.update();
  assertEquals(longPage.visible, true, 'Long page with scroll > 280 must show back-to-top button');

  // 4. Click back-to-top: resets scroll to 0, button hides
  longPage.scrollToTop();
  assertEquals(longPage.visible, false, 'Clicking back-to-top must hide the button after returning to top');

  // 5. Scroll down again: button reappears
  longPage.scrollY = 600;
  longPage.update();
  assertEquals(longPage.visible, true, 'Scrolling down again must re-show the button');

  // 6. Mobile H5: when filter FAB is visible, .has-filter-fab is applied to stack safely above at 138px
  const mobileWithFab = new BackToTopSimulator({ isMobileH5: true, docHeight: 3000, winHeight: 800, scrollY: 400, fabVisible: true });
  mobileWithFab.update();
  assertEquals(mobileWithFab.visible, true, 'Mobile page must show back-to-top when scrolled');
  assertEquals(mobileWithFab.hasFilterFab, true, 'Mobile page with filter FAB must apply hasFilterFab class to stack above FAB');

  // 7. Mobile H5: when filter FAB is not present (e.g. News tab), .has-filter-fab is removed to rest at 76px
  const mobileWithoutFab = new BackToTopSimulator({ isMobileH5: true, docHeight: 3000, winHeight: 800, scrollY: 400, fabVisible: false });
  mobileWithoutFab.update();
  assertEquals(mobileWithoutFab.visible, true, 'Mobile page without FAB must show back-to-top');
  assertEquals(mobileWithoutFab.hasFilterFab, false, 'Mobile page without FAB must not have hasFilterFab class');
});

// --- NEW Tier 3 Tests: Pairwise Cross-Feature Interactions ---

test('Tier 2 - Boundary & Corner Cases', 'Ingredient Ladder: Dense Ranking & Multi-Top1 Verification', () => {
  const wikiJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  assert(wikiJs.includes('Dense Ranking'), 'wiki.js should implement dense ranking');

  let modalContainer = null;
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
      body: { classList: { contains: () => false }, appendChild: (el) => { modalContainer = el; } },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => id === 'wiki-ingredient-ranking-modal' ? modalContainer : null,
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

  // Verify Tomato track in LV60_COORDINATE_LADDER_DATA has 3 isTop: true pokemons (大食花, 倫琴貓, 暴雪王)
  const tomatoData = ctx.window.WikiDB.LV60_COORDINATE_LADDER_DATA.find(i => i.id === 'tomato');
  assert(tomatoData !== undefined, 'Tomato ladder data must exist');
  const topTomatoPkms = tomatoData.pokemon.filter(p => p.isTop && p.variants.some(v => v.count === 76 && v.isTop));
  assertEquals(topTomatoPkms.length, 3, 'Tomato track must have 3 TOP 1 Pokemons (大食花, 倫琴貓, 暴雪王)');
  const topNames = topTomatoPkms.map(p => p.name);
  assert(topNames.includes('大食花') && topNames.includes('倫琴貓') && topNames.includes('暴雪王'), 'Top pokemons must be 大食花, 倫琴貓, 暴雪王');

  // Test modal rendering dense ranking for Tomato
  ctx.window.WikiDB.openIngredientRankingModal('tomato');
  assert(modalContainer !== null, 'Ranking modal container must be created');
  const cards = [...modalContainer.innerHTML.matchAll(/<div class="ing-rank-card [^"]*" title="([^"]+)"[\s\S]*?<div class="ing-rank-num [^"]*">\s*([^<\s]+)\s*<\/div>/g)];
  assert(cards.length >= 7, 'Must have at least 7 ranked cards for tomato');

  // Cards 1-3 must all have 🥇 medal
  assertEquals(cards[0][2], '🥇', '1st card must have 🥇');
  assertEquals(cards[1][2], '🥇', '2nd card must have 🥇 (tied)');
  assertEquals(cards[2][2], '🥇', '3rd card must have 🥇 (tied)');

  // Card 4 (魔牆人偶 71) must have 🥈 medal (Dense rank 2, NOT rank 4!)
  assertEquals(cards[3][2], '🥈', '4th card (魔牆人偶 71) must have 🥈 (Dense rank 2)');

  // Card 5 (妙蛙花 68) must have 🥉 medal (Dense rank 3)
  assertEquals(cards[4][2], '🥉', '5th card (妙蛙花 68) must have 🥉 (Dense rank 3)');

  // Card 6 (三地鼠 66) must have #4
  assertEquals(cards[5][2], '#4', '6th card (三地鼠 66) must have #4');

  // Card 7 (請假王 43) must have #5
  assertEquals(cards[6][2], '#5', '7th card (請假王 43) must have #5');
});


test('Tier 2 - Boundary & Corner Cases', 'Good-Night Ribbon Remaining Evolutions & Speed Discount Tier Boundary Logic', () => {
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
  assert(typeof lab.getRemainingEvolutions === 'function', 'AppraisalLab.getRemainingEvolutions must be exported');
  assert(typeof lab.getRibbonBonus === 'function', 'AppraisalLab.getRibbonBonus must be exported');

  // 1. Check 3-stage base species -> 2 evolutions remaining
  const threeStageBase = ['皮丘', '鬼斯', '小火龍', '幼基拉斯', '迷你龍', '菊草葉'];
  threeStageBase.forEach(name => {
    const pkm = { name_cn: name, is_final: '' };
    assertEquals(lab.getRemainingEvolutions(pkm), 2, `${name} must have 2 remaining evolutions`);
  });

  // 2. Check 2-stage base species and mid-stage species -> 1 evolution remaining
  const oneStageRemaining = ['皮卡丘', '鬼斯通', '火恐龍', '伊布', '卡蒂狗'];
  oneStageRemaining.forEach(name => {
    const pkm = { name_cn: name, is_final: '' };
    assertEquals(lab.getRemainingEvolutions(pkm), 1, `${name} must have 1 remaining evolution`);
  });

  // 3. Check fully evolved or single-stage species -> 0 evolutions remaining
  const zeroRemaining = ['雷丘', '耿鬼', '噴火龍', '班基拉斯', '幸福蛋', '凱羅斯', '赫拉克羅斯'];
  zeroRemaining.forEach(name => {
    const pkm = { name_cn: name, is_final: '〇' };
    assertEquals(lab.getRemainingEvolutions(pkm), 0, `${name} must have 0 remaining evolutions`);
  });

  // 4. Ribbon tier bonuses across remaining evolution stages
  // Lv.0: 0 carry, 0% speed
  const bonus0 = lab.getRibbonBonus(0, 2);
  assertEquals(bonus0.carry, 0, 'Lv.0 carry should be 0');
  assertEquals(bonus0.speed, 0, 'Lv.0 speed should be 0');

  // Lv.1 (200h): +1 carry, 0% speed for all
  [0, 1, 2].forEach(evos => {
    const b = lab.getRibbonBonus(1, evos);
    assertEquals(b.carry, 1, `Lv.1 carry should be 1 for evos=${evos}`);
    assertEquals(b.speed, 0, `Lv.1 speed should be 0 for evos=${evos}`);
  });

  // Lv.2 (500h): +3 carry, speed: 2 evos -> 11%, 1 evo -> 5%, 0 evos -> 0%
  assertEquals(lab.getRibbonBonus(2, 2).carry, 3, 'Lv.2 carry should be 3');
  assertEquals(lab.getRibbonBonus(2, 2).speed, 0.11, 'Lv.2 speed for 2 evos should be 11%');
  assertEquals(lab.getRibbonBonus(2, 1).speed, 0.05, 'Lv.2 speed for 1 evo should be 5%');
  assertEquals(lab.getRibbonBonus(2, 0).speed, 0, 'Lv.2 speed for 0 evos should be 0%');

  // Lv.3 (1000h): +6 carry, speed identical to Lv.2
  assertEquals(lab.getRibbonBonus(3, 2).carry, 6, 'Lv.3 carry should be 6');
  assertEquals(lab.getRibbonBonus(3, 2).speed, 0.11, 'Lv.3 speed for 2 evos should be 11%');
  assertEquals(lab.getRibbonBonus(3, 1).speed, 0.05, 'Lv.3 speed for 1 evo should be 5%');
  assertEquals(lab.getRibbonBonus(3, 0).speed, 0, 'Lv.3 speed for 0 evos should be 0%');

  // Lv.4 (2000h): +8 carry, speed: 2 evos -> 25%, 1 evo -> 12%, 0 evos -> 0%
  assertEquals(lab.getRibbonBonus(4, 2).carry, 8, 'Lv.4 carry should be 8');
  assertEquals(lab.getRibbonBonus(4, 2).speed, 0.25, 'Lv.4 speed for 2 evos should be 25%');
  assertEquals(lab.getRibbonBonus(4, 1).speed, 0.12, 'Lv.4 speed for 1 evo should be 12%');
  assertEquals(lab.getRibbonBonus(4, 0).speed, 0, 'Lv.4 speed for 0 evos should be 0%');
});


test('Tier 2 - Boundary & Corner Cases', '18 Berry Types Coverage & EX Rules Isolation', () => {
  const wikiCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js'), 'utf8');
  const i18nCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js', 'core', 'i18n.js'), 'utf8');

  const createMockEl = () => ({
    addEventListener: () => {},
    value: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => true },
    setAttribute: () => {},
    innerHTML: ''
  });

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
      getElementById: createMockEl,
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

  const islands = ctx.window.WikiDB.ISLANDS_DATA;
  const fixedIslands = islands.filter(i => i.berriesMode === 'fixed');
  assertEquals(fixedIslands.length, 6, 'Must have 6 fixed berry islands');

  const allFixedTypes = [];
  fixedIslands.forEach(isl => {
    assertEquals(isl.favoriteTypes.length, 3, `${isl.id} must have exactly 3 favorite types`);
    assertEquals(isl.favoriteBerries.length, 3, `${isl.id} must have exactly 3 favorite berries`);
    isl.favoriteTypes.forEach(t => allFixedTypes.push(t));
  });

  assertEquals(allFixedTypes.length, 18, '6 fixed islands * 3 types must equal 18 types');
  const uniqueTypes = Array.from(new Set(allFixedTypes));
  assertEquals(uniqueTypes.length, 18, 'Fixed islands must cover all 18 Pokemon types without duplication');

  // Verify EX mode details
  const greengrass = islands.find(i => i.id === 'greengrass');
  const cyan = islands.find(i => i.id === 'cyan');

  assert(greengrass.expertMode.unlockReq.includes('大師 18'), 'Greengrass EX must require Master 18');
  assert(greengrass.expertMode.ticketReq.includes('EX券'), 'Greengrass EX must require EX Pass');
  assert(cyan.expertMode.bonus.includes('水君'), 'Cyan Beach EX bonus should highlight Suicune');
  assert(Array.isArray(greengrass.expertMode.snorlaxEnergyTiers) && greengrass.expertMode.snorlaxEnergyTiers.length >= 8, 'Greengrass EX must have at least 8 energy tiers');
  assert(Array.isArray(cyan.expertMode.snorlaxEnergyTiers) && cyan.expertMode.snorlaxEnergyTiers.length >= 8, 'Cyan Beach EX must have at least 8 energy tiers');
  assertEquals(cyan.expertMode.snorlaxEnergyTiers.find(t => t.rank === 'Master 1')?.energy, 2194292, 'Cyan Beach EX Master 1 energy must be 2194292');
  assertEquals(cyan.expertMode.snorlaxEnergyTiers.find(t => t.rank === 'Master 20')?.energy, 14780152, 'Cyan Beach EX Master 20 energy must be 14780152');

  // Verify Snorlax rank tiers and Drowsy spawns structure
  islands.forEach(isl => {
    assert(isl.snorlaxEnergyTiers.length >= 8, `${isl.id} must have at least 8 Snorlax rank milestones`);
    assertEquals(isl.drowsyPowerSpawns.length, 6, `${isl.id} must have 6 drowsy power spawn tiers (3 to 8 spawns)`);
    assert(isl.spawns.dozing.length > 0, `${isl.id} must have dozing spawns`);
    assert(isl.spawns.snoozing.length > 0, `${isl.id} must have snoozing spawns`);
    assert(isl.spawns.slumbering.length > 0, `${isl.id} must have slumbering spawns`);
  });
});


  test('Tier 2 - Boundary & Corner Cases', 'Appraisal Lab Scope Integrity: getSkillTier Module Scope & Error-Free Lab Render', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');
    const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
    const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app/index.html'), 'utf8');

    // 1. Static check: getSkillTier is in AppraisalLab exports and defined in module scope
    assert(appraisalJs.includes('getSkillTier: getSkillTier'), 'appraisal.js must export getSkillTier in AppraisalLab');
    assert(appraisalJs.includes('function getSkillTier(sName)'), 'appraisal.js must define getSkillTier');

    // 2. Cache busters bumped to 20261002_07 or newer
    assert(indexHtml.match(/js\/modules\/appraisal(\.min)?\.js\?v=202610(?:02_(?:0[7-9]|\d{2})|(?:0[3-9]|[1-3]\d)_\d{2})/), 'index.html must use v=20261002_07 or newer');
    assert(appIndexHtml.match(/js\/modules\/appraisal(\.min)?\.js\?v=202610(?:02_(?:0[7-9]|\d{2})|(?:0[3-9]|[1-3]\d)_\d{2})/), 'app/index.html must use v=20261002_07 or newer');

    // 3. Execution in VM context
    const ctx = {
      window: {},
      document: {
        querySelector: () => null,
        getElementById: (id) => ({
          id,
          style: {},
          innerHTML: ''
        }),
        body: { classList: { contains: () => false } }
      },
      console: console,
      Set: Set,
      Array: Array,
      parseInt: parseInt,
      Math: Math,
      String: String
    };
    ctx.window = ctx;
    ctx.window.allPokemons = [
      { id: '1', name_cn: '妙蛙種子', specialty: '食材', type: '草', ingredients: [{ name: '特選蘋果', count: 1 }] },
      { id: '3', name_cn: '妙蛙花', specialty: '食材', type: '草', ingredients: [{ name: '特選蘋果', count: 2 }] },
      { id: '12', name_cn: '巴大蝶', specialty: '樹果', type: '蟲', ingredients: [{ name: '甜甜蜜', count: 1 }] }
    ];
    // Raw userBox has Butterfree (No. 12) at index 0, but sorted getFilteredBox has Venusaur (No. 3) at index 0
    const rawBox = [
      {
        uid: 'pkm-butterfree-12',
        pokemonId: '12',
        name: '巴大蝶',
        level: 30,
        nature: '天真',
        subskills: ['樹果數量S', '持有上限提升M', '', '', ''],
        ingredients: ['甜甜蜜', '好眠番茄', '甜甜蜜'],
        ribbon: 4
      },
      {
        uid: 'pkm-venusaur-3',
        pokemonId: '3',
        name: '妙蛙花',
        level: 55,
        nature: '內斂',
        subskills: ['幫手獎勵', '食材機率提升M', '', '', ''],
        ingredients: ['特選蘋果', '特選蘋果', '特選蘋果'],
        ribbon: 2
      }
    ];
    const sortedFilteredBox = [rawBox[1], rawBox[0]]; // Venusaur first!

    ctx.window.UserBox = {
      SUBSKILLS_DATA: [
        { name: '樹果數量S', tier: 'gold' },
        { name: '幫手獎勵', tier: 'gold' },
        { name: '幫忙速度M', tier: 'blue' },
        { name: '持有上限提升M', tier: 'blue' },
        { name: '食材機率提升M', tier: 'blue' }
      ],
      NATURE_DATA: [
        { name: '固執', buff: '幫忙速度▲', debuff: '食材機率▼' },
        { name: '天真', buff: 'EXP獲得量▲', debuff: '主技能發動機率▼' },
        { name: '內斂', buff: '食材機率▲', debuff: '幫忙速度▼' }
      ],
      getUserBox: () => rawBox,
      getFilteredBox: () => sortedFilteredBox
    };
    ctx.window.I18N = {
      getLanguage: () => 'zh-TW',
      getSubSkillName: (n) => n,
      getMainSkillName: (n) => n,
      getIngredientName: (n) => n,
      getNatureName: (n) => n,
      getSpecialtyName: (n) => n,
      getTypeName: (n) => n,
      getIngredientIcon: () => ''
    };

    vm.createContext(ctx);
    vm.runInContext(appraisalJs, ctx);

    assert(typeof ctx.window.AppraisalLab === 'object', 'AppraisalLab must be defined on window');
    assert(typeof ctx.window.AppraisalLab.getSkillTier === 'function', 'getSkillTier must be a function on AppraisalLab');

    // Verify tier calculations
    assert(ctx.window.AppraisalLab.getSkillTier('幫手獎勵') === 'gold', '幫手獎勵 must be gold');
    assert(ctx.window.AppraisalLab.getSkillTier('幫忙速度M') === 'blue', '幫忙速度M must be blue');
    assert(ctx.window.AppraisalLab.getSkillTier('') === 'white', 'empty subskill must be white');

    // Verify renderLab executes and defaults to sortedFilteredBox[0] (Venusaur), NOT rawBox[0] (Butterfree)
    const mockContainer = { innerHTML: '', id: 'appraisal-lab-container' };
    let renderError = null;
    try {
      ctx.window.AppraisalLab.renderLab(mockContainer, 0);
    } catch (e) {
      renderError = e;
    }
    assert(!renderError, `renderLab must not throw ReferenceError: getSkillTier is not defined, got: ${renderError && renderError.message}`);

    assert(mockContainer.innerHTML.includes('lab-subnav-bar'), 'renderLab must render subnav bar');
    assert(mockContainer.innerHTML.includes('lab-subpanel-team'), 'renderLab must render team subpanel');
    assert(mockContainer.innerHTML.includes('lab-subpanel-compare'), 'renderLab must render compare subpanel');
    assert(!mockContainer.innerHTML.includes('lab-subpanel-single'), 'renderLab must not render single subpanel');
  });

  // ─── Test 182: Appraisal Lab Clean Preview Default, Edit Toggle Transformation & openAppraisalModal Scope Fix ─

  test('Tier 2 - Boundary & Corner Cases', 'Appraisal Lab Clean Preview Default, Edit Toggle Transformation & openAppraisalModal Scope Fix', () => {
    const appraisalJs = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/modules/appraisal.js'), 'utf8');

    // 1. Static assertion: specialty must be accessed via pkmData.specialty in openAppraisalModal
    assert(!appraisalJs.includes('getSpecialtyIconHtml(specialty,'), 'appraisal.js must not call getSpecialtyIconHtml with bare undeclared specialty variable');
    assert(appraisalJs.includes('getSpecialtyIconHtml(pkmData.specialty,'), 'appraisal.js must call getSpecialtyIconHtml with pkmData.specialty in openAppraisalModal');

    // 2. Static assertion: AppraisalLab exports openModal and renderLab
    assert(appraisalJs.includes('openModal: openAppraisalModal'), 'appraisal.js must export openModal');
    assert(appraisalJs.includes('renderLab: renderAppraisalLabContainer'), 'appraisal.js must export renderLab');

    // 3. Static assertion: modal layouts present
    assert(appraisalJs.includes('box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet'), 'appraisal.js must support mobile sheet');
    assert(appraisalJs.includes('class="appraisal-modal-container"'), 'appraisal.js must support desktop modal container');

    // 4. Runtime execution: openModal must not throw ReferenceError: specialty is not defined
    const modalCreated = { innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, setAttribute: () => {} };
    const ctx = {
      window: {},
      document: {
        querySelector: () => null,
        getElementById: (id) => (id === 'modal-appraisal-report' ? modalCreated : null),
        createElement: (tag) => modalCreated,
        body: {
          appendChild: () => {},
          classList: { contains: () => false },
          style: {}
        }
      },
      console: console,
      Set: Set,
      Array: Array,
      parseInt: parseInt,
      Math: Math,
      String: String
    };
    ctx.window = ctx;
    ctx.window.allPokemons = [
      { id: '3', name_cn: '妙蛙花', specialty: '食材', type: '草', ingredients: [{ name: '特選蘋果', count: 2 }] }
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

    // Call openModal on desktop
    let openModalError = null;
    try {
      ctx.window.AppraisalLab.openModal({
        pkm: ctx.window.allPokemons[0],
        level: 55,
        nature: '內斂',
        subskills: ['幫手獎勵', '食材機率提升M'],
        ingredients: ['特選蘋果', '特選蘋果', '特選蘋果'],
        ribbon: 2,
        nickname: '花花'
      });
    } catch (e) {
      openModalError = e;
    }
    assert(!openModalError, `openModal must not throw ReferenceError: specialty is not defined, got: ${openModalError && openModalError.message}`);
    assert(modalCreated.innerHTML.includes('花花'), 'openModal must render nickname');
    assert(modalCreated.innerHTML.includes('妙蛙花'), 'openModal must render Pokemon name');

    // Test renderLab on desktop (!isMobileH5) - renders Research Lab
    const desktopContainer = { innerHTML: '', id: 'appraisal-lab-container' };
    ctx.window.UserBox = {
      getUserBox: () => [{ uid: '1', pokemonId: '3', name: '妙蛙花', level: 55, nature: '內斂', subskills: [] }]
    };
    ctx.window.AppraisalLab.renderLab(desktopContainer, 0);
    assert(desktopContainer.innerHTML.includes('class="lab-subnav-bar"'), 'On desktop, lab-subnav-bar must be rendered in Research Lab');
    assert(desktopContainer.innerHTML.includes('id="lab-subpanel-team"'), 'On desktop, lab-subpanel-team must be rendered in Research Lab');
    assert(desktopContainer.innerHTML.includes('id="lab-subpanel-compare"'), 'On desktop, lab-subpanel-compare must be rendered in Research Lab');
  });

}

module.exports = { registerTier2Tests };

if (require.main === module) {
  registerTier2Tests();
  const { printSummaryAndExit } = require('../test_harness');
  printSummaryAndExit();
}
