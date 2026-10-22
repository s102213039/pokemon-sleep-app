/* --- 樹果基礎能量對照表與單顆能量成長公式 --- */
const BERRY_BASE_ENERGY_MAP = {
  // 飛行: 椰木果 / Pamtre (24)
  '椰木果': 24, 'Pamtre': 24, 'pamtre': 24,
  // 蟲: 木子果 / 芭亞果 / Lum (24)
  '木子果': 24, '芭亞果': 24, 'Lum': 24, 'lum': 24,
  // 電: 異奇果 / Grepa (25)
  '異奇果': 25, 'Grepa': 25, 'grepa': 25,
  // 幽靈: 檬果 / Bluk (26)
  '檬果': 26, 'Bluk': 26, 'bluk': 26,
  // 妖精: 桃桃果 / Pecha (26)
  '桃桃果': 26, 'Pecha': 26, 'pecha': 26,
  // 超能力: 芒念果 / Mago (26)
  '芒念果': 26, 'Mago': 26, 'mago': 26,
  // 火: 蘋野果 / Leppa (27)
  '蘋野果': 27, 'Leppa': 27, 'leppa': 27,
  // 格鬥: 櫻子果 / Cheri (27)
  '櫻子果': 27, 'Cheri': 27, 'cheri': 27,
  // 一般: 柿仔果 / Persim (28)
  '柿仔果': 28, 'Persim': 28, 'persim': 28,
  // 地面: 勿花果 / Figy (29)
  '勿花果': 29, 'Figy': 29, 'figy': 29,
  // 岩石: 文柚果 / Sitrus (30)
  '文柚果': 30, 'Sitrus': 30, 'sitrus': 30,
  // 草: 榴石果 / 墨莓果 / Durin (30)
  '榴石果': 30, '墨莓果': 30, 'Durin': 30, 'durin': 30,
  // 水: 橙橙果 / Oran (31)
  '橙橙果': 31, 'Oran': 31, 'oran': 31,
  // 惡: 芭拉果 / 威嘻果 / Wiki (31)
  '芭拉果': 31, '威嘻果': 31, 'Wiki': 31, 'wiki': 31,
  // 毒: 零餘果 / Chesto (32)
  '零餘果': 32, 'Chesto': 32, 'chesto': 32,
  // 冰: 生薑果 / 羅子果 / Rawst (32)
  '生薑果': 32, '羅子果': 32, 'Rawst': 32, 'rawst': 32,
  // 鋼: 靛莓果 / 刺角果 / Belue (33)
  '靛莓果': 33, '刺角果': 33, 'Belue': 33, 'belue': 33,
  // 龍: 巧可果 / 亞雪果 / Yache (35)
  '巧可果': 35, '亞雪果': 35, 'Yache': 35, 'yache': 35
};

function getBerryBaseEnergy(nameOrType) {
  if (!nameOrType) return 26;
  if (BERRY_BASE_ENERGY_MAP[nameOrType]) return BERRY_BASE_ENERGY_MAP[nameOrType];
  const bName = TYPE_TO_BERRY[nameOrType];
  if (bName && BERRY_BASE_ENERGY_MAP[bName]) return BERRY_BASE_ENERGY_MAP[bName];
  return 26;
}

function calculateSingleBerryEnergy(baseEnergy, level) {
  const lv = Math.max(1, parseInt(level, 10) || 1);
  const base = Math.max(20, parseInt(baseEnergy, 10) || 26);
  return Math.round(Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1)));
}

if (typeof window !== 'undefined') {
  window.getBerryBaseEnergy = getBerryBaseEnergy;
  window.calculateSingleBerryEnergy = calculateSingleBerryEnergy;
}

/* ─── 基礎主技能與複合/專屬技能映射系統 ─────────── */
const BASE_SKILLS = [
  { key: '食材獲取S', label: '食材獲取S', label_en: 'Ingr. Mag. S' },
  { key: '食材精選S', label: '食材精選S', label_en: 'Ingr. Select S' },
  { key: '活力全體療癒S', label: '全體療癒S', label_en: 'Energy All S' },
  { key: '活力療癒S', label: '活力療癒S', label_en: 'Energy Cheer S' },
  { key: '活力填充S', label: '活力填充S', label_en: 'Charge Ene. S' },
  { key: '能量填充M', label: '能量填充M', label_en: 'Charge Str. M' },
  { key: '能量填充S', label: '能量填充S', label_en: 'Charge Str. S' },
  { key: '料理強化S', label: '料理強化S', label_en: 'Cook Power S' },
  { key: '料理成功S', label: '料理成功S', label_en: 'Tasty Chance S' },
  { key: '幫手支援S', label: '幫手支援S', label_en: 'Extra Help S' },
  { key: '幫手加速', label: '幫手加速', label_en: 'Helper Boost' },
  { key: '樹果遽增', label: '樹果遽增', label_en: 'Berry Burst' },
  { key: '夢之碎片獲取S', label: '夢碎獲取S', label_en: 'Dream Shard S' },
  { key: '揮指', label: '揮指', label_en: 'Metronome' },
  { key: '技能複製', label: '技能複製', label_en: 'Skill Copy' }
];

const COMPOSITE_SKILL_MAP = {
  // === 真正複合主技能 (True Composite Skills) ===
  // 健美：料理成功S (大成功機率提升) + 食材獲取S (隨機獲得食材) (赫拉克羅斯)
  '健美（料理輔助S）': ['料理成功S', '食材獲取S'],
  
  // 月光：活力填充S (自身活力) + 大成功時活力療癒S (隊友活力) (月亮伊布)
  '月光（活力填充S）': ['活力填充S', '活力療癒S'],
  
  // 樹果汁：活力全體療癒S (全員活力) + 樹果汁道具活力療癒S (單隻活力) (壺壺)
  '樹果汁（活力全體療癒S）': ['活力全體療癒S', '活力療癒S'],
  
  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  // 食材獲取系列
  '正電（食材獲取S）': ['食材獲取S'],
  '禮物（食材獲取S）': ['食材獲取S'],
  
  // 料理強化系列
  '負電（料理強化S）': ['料理強化S'],
  
  // 食材精選系列
  '超幸運（食材精選S）': ['食材精選S'],
  '超幸運 (食材精選S)': ['食材精選S'],
  '怪力鉗（食材精選S）': ['食材精選S'],
  '怪力鉗 (食材精選S)': ['食材精選S'],
  '怪力钳（食材精選S）': ['食材精選S'],
  '怪力钳 (食材精選S)': ['食材精選S'],
  
  // 活力療癒系列
  '新月祈禱（活力全體療癒S）': ['活力全體療癒S'],
  '治癒波動（活力療癒S）': ['活力療癒S'],
  '蹭蹭臉頰（活力療癒S）': ['活力療癒S'],
  
  // 能量填充系列
  '蓄力（能量填充S）': ['能量填充S'],
  '能量填充S（隨機）': ['能量填充S'],
  '夢魘（能量填充M）': ['能量填充M'],
  
  // 樹果遽增系列
  '精神擊破（樹果領域）': ['樹果遽增'],
  '流星群（樹果遽增）': ['樹果遽增'],
  '畫皮（樹果遽增）': ['樹果遽增'],
  '樹果遽增?': ['樹果遽增'],
  
  // 夢之碎片系列
  '波導彈（夢之碎片獲取S）': ['夢之碎片獲取S'],
  '夢之碎片獲取S（隨機）': ['夢之碎片獲取S'],
  
  // 幫手加速系列
  '幫手加速（電）': ['幫手加速'],
  '幫手加速（火）': ['幫手加速'],
  '幫手加速（水）': ['幫手加速'],
  
  // 揮指 / 技能複製系列
  '十項全能（揮指）[可替換]': ['揮指'],
  '模仿（技能複製）': ['技能複製'],
  '變身（技能複製）': ['技能複製']
};

/* ─── 特殊主技能官方詳細說明字典 (Special Main Skill Official In-Game Descriptions) ─ */
const SPECIAL_SKILL_DETAILS = {
  // === 真正複合主技能 (True Composite Skills) ===
  '健美（料理輔助S）': {
    'zh-TW': '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'en-US': 'Gets a variety of ingredients, and slightly raises the Extra Tasty rate of the next dish cooked.'
  },
  '健美 (料理輔助S)': {
    'zh-TW': '隨機獲得多個食材，並提升下次料理漂亮成功（大成功）的機率。',
    'en-US': 'Gets a variety of ingredients, and slightly raises the Extra Tasty rate of the next dish cooked.'
  },
  '月光（活力充填S）': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光 (活力充填S)': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光（活力填充S）': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '月光 (活力填充S)': {
    'zh-TW': '讓自己回復活力（12~43點）；若發生「漂亮成功」時，額外隨機讓隊伍中的 1 隻寶可夢回復活力（6~22點）。',
    'en-US': 'Restores energy to self (12~43 pts). On Extra Tasty triggers, also restores energy to a random teammate (6~22 pts).'
  },
  '樹果汁（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點），同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates (5~18 pts), with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },
  '樹果汁 (活力全體療癒S)': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點），同時有機會額外獲得可讓單隻寶可夢回復 20 活力的「樹果汁」道具（最多持有 5 個）。',
    'en-US': 'Restores energy to all teammates (5~18 pts), with a chance to obtain Berry Juice items (restores 20 energy, max 5).'
  },

  // === 專屬命名與變體主技能 (Named Variant Skills) ===
  '正電（食材獲取S）': {
    'zh-TW': '隨機獲得食材（5~18個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得 6~14 個食材。',
    'en-US': 'Randomly obtains 5~18 ingredients. Obtains +6~14 bonus ingredients if teammates have Plus or Minus skills.'
  },
  '正電 (食材獲取S)': {
    'zh-TW': '隨機獲得食材（5~18個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，則發動時額外獲得 6~14 個食材。',
    'en-US': 'Randomly obtains 5~18 ingredients. Obtains +6~14 bonus ingredients if teammates have Plus or Minus skills.'
  },
  '負電（料理強化S）': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（5~24個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力（8~35點）。',
    'en-US': 'Expands cooking pot size (+5~24). If teammates have Plus or Minus, also restores 8~35 energy to a random teammate.'
  },
  '負電 (料理強化S)': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（5~24個）；若隊伍中還有 1 隻以上主技能是「正電」或「負電」的寶可夢，發動時額外隨機讓隊伍中 1 隻寶可夢回復活力（8~35點）。',
    'en-US': 'Expands cooking pot size (+5~24). If teammates have Plus or Minus, also restores 8~35 energy to a random teammate.'
  },
  '禮物（食材獲取S）': {
    'zh-TW': '隨機獲得食材（4~17個）；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。',
    'en-US': 'Randomly obtains 4~17 ingredients, and occasionally grants 4 candies for a random team member.'
  },
  '禮物 (食材獲取S)': {
    'zh-TW': '隨機獲得食材（4~17個）；有時除了食材之外，還會額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。',
    'en-US': 'Randomly obtains 4~17 ingredients, and occasionally grants 4 candies for a random team member.'
  },
  '食材精選S': {
    'zh-TW': '從發動寶可夢專屬的特定食材候選池中，隨機獲得其中 1 種食材（單一食材獲取量為 5~18 個）。',
    'en-US': 'Gets 1 ingredient type exclusively from this Pokémon\'s specific candidate pool (5~18 of a single ingredient).'
  },
  '超幸運（食材精選S）': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '超幸運 (食材精選S)': {
    'zh-TW': '從特定食材 (咖啡豆、大豆、豆肉、蘑菇) 中隨機獲得 1 種食材 (5~18個); 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Coffee, Soybean, Sausage, Mushroom; 5~18 items); rarely crits for massive Dream Shards instead (up to 20,000).'
  },
  '怪力鉗（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力鉗 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳（食材精選S）': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '怪力钳 (食材精選S)': {
    'zh-TW': '從特定食材 (洋芋、純油、玉米、番茄) 中隨機獲得 1 種食材 (5~18個); 若發生「漂亮成功 (大成功/暴擊)」時獲得 2 倍食材 (最高達 36 個)。',
    'en-US': 'Gets 1 ingredient type from specific ingredients (Potato, Oil, Corn, Tomato; 5~18 items); crits on Extra Tasty to award 2x ingredients (up to 36).'
  },
  '新月祈禱（活力全體療癒S）': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（3~11點），並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates (3~11 pts) and gathers berries from them (more berries with more Psychic types).'
  },
  '新月祈禱 (活力全體療癒S)': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（3~11點），並額外獲得隊伍中所有寶可夢撿來的樹果（超能力屬性隊員越多，樹果數量越多）。',
    'en-US': 'Restores energy to all teammates (3~11 pts) and gathers berries from them (more berries with more Psychic types).'
  },
  '治癒波動（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力（6~22點），並讓牠們立刻完成 1~4 次幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates (6~22 pts) and instantly performs 1~4 helps (more helps if Latios is on team).'
  },
  '治癒波動 (活力療癒S)': {
    'zh-TW': '隨機讓隊伍中的 2 隻寶可夢回復活力（6~22點），並讓牠們立刻完成 1~4 次幫忙（若隊伍中有拉帝歐斯，立即幫忙次數增加）。',
    'en-US': 'Restores energy to 2 teammates (6~22 pts) and instantly performs 1~4 helps (more helps if Latios is on team).'
  },
  '蹭蹭臉頰（活力療癒S）': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力（9~35點）；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate (9~35 pts); when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蹭蹭臉頰 (活力療癒S)': {
    'zh-TW': '隨機讓隊伍中的 1 隻寶可夢回復活力（9~35點）；幸運時該寶可夢還會獲得「主技能發動獎勵」，可額外多發動 1 次主技能。',
    'en-US': 'Restores energy to a teammate (9~35 pts); when lucky, grants a bonus main skill trigger to that Pokémon.'
  },
  '蓄力（能量填充S）': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '蓄力 (能量填充S)': {
    'zh-TW': '隨機發動「蓄積」或「噴放」；連續蓄積次數越多，噴放時為卡比獸增加的能量就越多（最高達 90,940 能量）。',
    'en-US': 'Stockpiles or spits energy; more consecutive stockpiles result in greater Snorlax Strength gained (up to 90,940).'
  },
  '夢魘（能量填充M）': {
    'zh-TW': '固定增加大量卡比獸能量（2,640~18,515能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (2,640~18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '夢魘 (能量填充M)': {
    'zh-TW': '固定增加大量卡比獸能量（2,640~18,515能量）；發動時會降低隊伍中「惡屬性以外」寶可夢的活力 12 點。',
    'en-US': 'Significantly increases Snorlax Strength (2,640~18,515), but reduces energy of non-Dark type teammates by 12.'
  },
  '精神擊破（樹果領域）': {
    'zh-TW': '增加卡比獸能量（2,640~13,638點），並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength (2,640~13,638) and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '精神擊破 (樹果領域)': {
    'zh-TW': '增加卡比獸能量（2,640~13,638點），並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。',
    'en-US': 'Increases Strength (2,640~13,638) and deploys a Berry Field, boosting energy gained from Mago Berries.'
  },
  '流星群（樹果遽增）': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（12~48顆，龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (12~48 berries; scales with Dragon types, increased if Latias is in party).'
  },
  '流星群 (樹果遽增)': {
    'zh-TW': '獲得自己以及隊伍中寶可夢撿來的樹果（12~48顆，龍屬性隊員越多數量越多；若隊伍中有拉帝亞斯數量進一步增加）。',
    'en-US': 'Gathers berries from self and teammates (12~48 berries; scales with Dragon types, increased if Latias is in party).'
  },
  '畫皮（樹果遽增）': {
    'zh-TW': '獲得一定數量的樹果（8~21顆），並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得 3 倍樹果。',
    'en-US': 'Gathers berries from self and teammates (8~21 berries); rarely triggers Extra Tasty for 3x berries.'
  },
  '畫皮 (樹果遽增)': {
    'zh-TW': '獲得一定數量的樹果（8~21顆），並額外獲得隊伍中寶可夢撿來的樹果；少數情況下會發生「漂亮成功」獲得 3 倍樹果。',
    'en-US': 'Gathers berries from self and teammates (8~21 berries); rarely triggers Extra Tasty for 3x berries.'
  },
  '樹果遽增?': {
    'zh-TW': '揮舞巨錘爆發產出自身大量樹果。',
    'en-US': 'Swings a massive hammer to burst a large amount of own berries.'
  },
  '波導彈（夢之碎片獲取S）': {
    'zh-TW': '獲得夢之碎片（240~2,500個），並同時增加卡比獸能量（200~2,042點）。',
    'en-US': 'Gathers 240~2,500 Dream Shards while simultaneously increasing Snorlax Strength by 200~2,042.'
  },
  '波導彈 (夢之碎片獲取S)': {
    'zh-TW': '獲得夢之碎片（240~2,500個），並同時增加卡比獸能量（200~2,042點）。',
    'en-US': 'Gathers 240~2,500 Dream Shards while simultaneously increasing Snorlax Strength by 200~2,042.'
  },
  '幫手加速（電）': {
    'zh-TW': '立即獲得隊伍中所有電屬性幫手寶可夢數次幫忙產出（隊伍中電屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Electric helpers on the team (scales with number of distinct Electric species).'
  },
  '幫手加速 (電)': {
    'zh-TW': '立即獲得隊伍中所有電屬性幫手寶可夢數次幫忙產出（隊伍中電屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Electric helpers on the team (scales with number of distinct Electric species).'
  },
  '幫手加速（火）': {
    'zh-TW': '立即獲得隊伍中所有火屬性幫手寶可夢數次幫忙產出（隊伍中火屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Fire helpers on the team (scales with number of distinct Fire species).'
  },
  '幫手加速 (火)': {
    'zh-TW': '立即獲得隊伍中所有火屬性幫手寶可夢數次幫忙產出（隊伍中火屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Fire helpers on the team (scales with number of distinct Fire species).'
  },
  '幫手加速（水）': {
    'zh-TW': '立即獲得隊伍中所有水屬性幫手寶可夢數次幫忙產出（隊伍中水屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Water helpers on the team (scales with number of distinct Water species).'
  },
  '幫手加速 (水)': {
    'zh-TW': '立即獲得隊伍中所有水屬性幫手寶可夢數次幫忙產出（隊伍中水屬性寶可夢種類越多，幫忙次數越多）。',
    'en-US': 'Instantly gathers helps from all Water helpers on the team (scales with number of distinct Water species).'
  },
  '十項全能（揮指）[可替換]': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '十項全能 (揮指) [可替換]': {
    'zh-TW': '發動設置的主技能效果，並額外獲得隊伍中 1 隻寶可夢的糖果；可使用「靈感種子」自由切換學習到的主技能。',
    'en-US': 'Triggers equipped main skill and grants candy for a teammate; customizable via Inspiration Seeds.'
  },
  '模仿（技能複製）': {
    'zh-TW': '隨機複製並發動隊伍中 1 隻隊友的主技能。',
    'en-US': 'Copies and triggers the main skill used by a random teammate.'
  },
  '模仿 (技能複製)': {
    'zh-TW': '隨機複製並發動隊伍中 1 隻隊友的主技能。',
    'en-US': 'Copies and triggers the main skill used by a random teammate.'
  },
  '變身（技能複製）': {
    'zh-TW': '變身為隊友並隨機複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  },
  '變身 (技能複製)': {
    'zh-TW': '變身為隊友並隨機複製其技能產出與幫忙效果。',
    'en-US': 'Transforms into a teammate, copying its skill and helping effects.'
  }
};

// === 標準基礎主技能說明 (Standard Base Skills) ===
const BASE_SKILL_DETAILS = {
  '能量填充S': {
    'zh-TW': '增加卡比獸的能量（固定數值 400~3,212 點）。',
    'en-US': 'Adds a fixed amount of Snorlax Strength (400~3,212 pts).'
  },
  '能量填充S（隨機）': {
    'zh-TW': '隨機增加卡比獸能量（在最小 200 ~ 最大 6,424 區間浮動）。',
    'en-US': 'Adds random Snorlax Strength within a range (200~6,424 pts).'
  },
  '能量填充S (隨機)': {
    'zh-TW': '隨機增加卡比獸能量（在最小 200 ~ 最大 6,424 區間浮動）。',
    'en-US': 'Adds random Snorlax Strength within a range (200~6,424 pts).'
  },
  '能量填充M': {
    'zh-TW': '大量增加卡比獸的能量（固定數值 880~6,409 點）。',
    'en-US': 'Adds a large fixed amount of Snorlax Strength (880~6,409 pts).'
  },
  '食材獲取S': {
    'zh-TW': '隨機獲得已解鎖的食材（全圖鑑已解鎖食材隨機抽選 6~24 個）。',
    'en-US': 'Gets a random assortment of all unlocked ingredients (6~24 ingredients).'
  },
  '料理強化S': {
    'zh-TW': '擴大下次料理時鍋子的容量上限（7~31個，最高累計至 200 個）。',
    'en-US': 'Expands pot capacity for next meal (+7~31, stacks up to 200 max).'
  },
  '料理成功S': {
    'zh-TW': '提升下次料理漂亮成功（大成功）機率（+4%~10%，最高累計至 70%，大成功後重設）。',
    'en-US': 'Raises Extra Tasty rate (+4%~10%, stacks up to 70% until Extra Tasty triggers).'
  },
  '活力充填S': {
    'zh-TW': '讓自身回復活力（12~43點）。',
    'en-US': 'Restores energy to self (12~43 pts).'
  },
  '活力填充S': {
    'zh-TW': '讓自身回復活力（12~43點）。',
    'en-US': 'Restores energy to self (12~43 pts).'
  },
  '活力療癒S': {
    'zh-TW': '隨機讓隊伍中的 1 隻隊友回復活力（12~44點，大幅優先鎖定當前活力最低的隊友）。',
    'en-US': 'Restores 12~44 energy to 1 random teammate (strongly favors lowest energy teammate).'
  },
  '活力全體療癒S': {
    'zh-TW': '讓幫手隊伍的所有寶可夢回復活力（5~18點）。',
    'en-US': 'Restores energy to all teammates (5~18 pts).'
  },
  '幫手支援S': {
    'zh-TW': '隨機讓隊伍中的 1 隻隊友立刻完成 6~12 次幫忙。',
    'en-US': 'Instantly gets 6~12 helps from a random teammate.'
  },
  '幫手加速': {
    'zh-TW': '隊伍中同屬性寶可夢立刻完成數次幫忙（同屬性不同種類越多越強，最高 11 次）。',
    'en-US': 'All same-type allies instantly perform helps (scales with unique species, up to 11 helps).'
  },
  '樹果遽增': {
    'zh-TW': '獲得自身產出的樹果（11~30顆），並額外獲得隊友撿來的樹果（1~5顆）。',
    'en-US': 'Gathers extra berries from user (11~30) and allies (1~5).'
  },
  '夢之碎片獲取S': {
    'zh-TW': '獲得夢之碎片（固定數值 240~2,500 個）。',
    'en-US': 'Obtains a fixed amount of Dream Shards (240~2,500 shards).'
  },
  '夢之碎片獲取S（隨機）': {
    'zh-TW': '隨機獲得夢之碎片（在最小 120 ~ 最大 4,600 區間浮動）。',
    'en-US': 'Obtains random Dream Shards within a range (120~4,600 shards).'
  },
  '夢之碎片獲取S (隨機)': {
    'zh-TW': '隨機獲得夢之碎片（在最小 120 ~ 最大 4,600 區間浮動）。',
    'en-US': 'Obtains random Dream Shards within a range (120~4,600 shards).'
  },
  '揮指': {
    'zh-TW': '從主技能庫中隨機抽選 1 種發動。',
    'en-US': 'Randomly triggers a main skill from the game\'s pool.'
  }
};

function getSkillDescription(skillName, isEN) {
  if (!skillName) return '';
  const s = skillName;
  const raw = SPECIAL_SKILL_DETAILS[s] ||
              SPECIAL_SKILL_DETAILS[s.replace(/\(/g, '（').replace(/\)/g, '）')] ||
              SPECIAL_SKILL_DETAILS[s.replace(/（/g, '(').replace(/）/g, ')')] ||
              BASE_SKILL_DETAILS[s] ||
              BASE_SKILL_DETAILS[s.replace(/\(/g, '（').replace(/\)/g, '）')] ||
              BASE_SKILL_DETAILS[s.replace(/（/g, '(').replace(/）/g, ')')];
  if (!raw) return '';
  return typeof raw === 'object' ? (raw[isEN ? 'en-US' : 'zh-TW'] || raw['zh-TW']) : raw;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function shortenSkillName(name) {
  if (!name) return '';
  return name
    .replace(/\bIngredient\b/g, 'Ingr.')
    .replace(/\bIngredients\b/g, 'Ingr.')
    .replace(/\bStrength\b/g, 'Str.')
    .replace(/\bEveryone\b/g, 'All')
    .replace(/\bElectric\b/g, 'Elec.')
    .replace(/\[Customizable\]/g, '[Custom]');
}

function formatSkillNameHtml(displayName, isEN) {
  if (!displayName) return '';
  // 移除 [可替換] / [Customizable] / [Custom]，並將所有全形 （） 統一轉為半形 ()
  // 簡短化：活力全體療癒S -> 全體療癒S，夢之碎片 -> 夢碎
  let cleaned = displayName
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/\(Energy for Everyone S\)/gi, '(Energy All S)')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  if (!isEN) {
    return `<span class="skill-single-line">${escapeHtml(cleaned)}</span>`;
  }

  // 縮短英文主技能名稱（例如 Ingredient -> Ingr., Strength -> Str., Everyone -> All 等）
  const shortName = shortenSkillName(cleaned);

  // 1. 如果有括號或括弧拆為兩行
  const parenMatch = shortName.match(/^(.+?)\s*([(\[].+[)\]])$/);
  if (parenMatch) {
    const mainPart = parenMatch[1].trim();
    const subPart = parenMatch[2].trim();
    return `<span class="skill-line-1">${escapeHtml(mainPart)}</span><span class="skill-line-2">${escapeHtml(subPart)}</span>`;
  }

  // 2. 標準主技能單行完整展示
  return `<span class="skill-single-line">${escapeHtml(shortName)}</span>`;
}

const SUPER_LUCK_INGS = [
  { name: '醒腦咖啡豆', name_en: 'Rousing Coffee', icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
  { name: '萌綠大豆', name_en: 'Greengrass Soybeans', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
  { name: '豆製肉', name_en: 'Bean Sausage', icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
  { name: '品鮮蘑菇', name_en: 'Tasty Mushroom', icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' }
];

const HYPER_CUTTER_INGS = [
  { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
  { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
  { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
  { name: '好眠番茄', name_en: 'Snoozy Tomato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' }
];

function renderSkillWithTooltip(skillName, pkm) {
  if (!skillName) return '--';
  const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
  const displayName = (typeof window !== 'undefined' && window.I18N) ? window.I18N.getMainSkillName(skillName) : skillName;
  const rawDetail = SPECIAL_SKILL_DETAILS[skillName] || 
                    SPECIAL_SKILL_DETAILS[skillName.replace(/\(/g, '（').replace(/\)/g, '）')] ||
                    SPECIAL_SKILL_DETAILS[skillName.replace(/（/g, '(').replace(/）/g, ')')];
  let detail = rawDetail ? (typeof rawDetail === 'object' ? (rawDetail[isEN ? 'en-US' : 'zh-TW'] || rawDetail['zh-TW']) : rawDetail) : '';

  let plainTitle = detail;
  // 針對特定寶可夢的「食材精選S」系列，精簡直接顯示該寶可夢專屬食材池（單行純圖標，無冗長換行）
  if (skillName && skillName.includes('食材精選')) {
    let targetIngs = [];
    const isSuperLuck = skillName.includes('超幸運');
    const isHyperCutter = skillName.includes('怪力');

    if (isSuperLuck) {
      targetIngs = SUPER_LUCK_INGS;
    } else if (isHyperCutter) {
      targetIngs = HYPER_CUTTER_INGS;
    } else if (pkm && pkm.ingredients && pkm.ingredients.length > 0) {
      const seen = new Set();
      pkm.ingredients.forEach(ig => {
        if (ig.name && !seen.has(ig.name)) {
          seen.add(ig.name);
          targetIngs.push(ig);
        }
      });
    }

    if (targetIngs.length > 0) {
      const separator = isEN ? '<span class="skill-tooltip-sep">, </span>' : '<span class="skill-tooltip-sep">、</span>';
      const ingIconsHtml = targetIngs.map(ig => {
        const ingName = (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name;
        const icon = ig.icon || (typeof window !== 'undefined' && window.I18N && window.I18N.getIngredientIcon(ig.name)) || '';
        return icon ? `<img src="${icon}" class="skill-tooltip-inline-ing" alt="${ingName}" title="${ingName}">` : '';
      }).filter(Boolean).join(separator);

      const ingNamesPlain = targetIngs.map(ig => (typeof window !== 'undefined' && window.I18N) ? (window.I18N.getIngredientName(ig.name) || ig.name) : ig.name).join(isEN ? ', ' : '、');

      const prefix = isEN ? 'Draws: ' : '可精選食材: ';
      if (isSuperLuck) {
        const critText = isEN 
          ? 'Crit effect: Rarely crits for massive Dream Shards instead of ingredients (up to 20,000 shards)!' 
          : '暴擊效果: 少數情況下暴擊獲得大量夢之碎片代替食材 (暴擊時最高達 20,000 碎片)!';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = isEN 
          ? `Draws: ${ingNamesPlain}. ${critText}` 
          : `可精選食材: ${ingNamesPlain}. ${critText}`;
      } else if (isHyperCutter) {
        const critText = isEN 
          ? 'Crit effect: Extra Tasty crits to grant 2x ingredients (up to 36 items)!' 
          : '暴擊效果: 漂亮成功 (大成功/暴擊) 時食材產出翻倍 (2 倍, 最高達 36 個)!';
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span><div style="font-size:11.5px;color:var(--accent-color,#f59e0b);margin-top:3px;line-height:1.35;font-weight:500;">${critText}</div>`;
        plainTitle = isEN 
          ? `Draws: ${ingNamesPlain}. ${critText}` 
          : `可精選食材: ${ingNamesPlain}. ${critText}`;
      } else {
        detail = `<span class="skill-tooltip-inline-wrap">${prefix}<span class="skill-tooltip-icons-group">${ingIconsHtml}</span></span>`;
        plainTitle = isEN ? `Draws: ${ingNamesPlain}` : `可精選食材: ${ingNamesPlain}`;
      }
    }
  }
  
  const contentHtml = formatSkillNameHtml(displayName, isEN);
  const cleanSkillKey = (skillName || '')
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();

  // 僅針對特殊/變體/複合主技能展示標籤與詳細說明，純基礎主技能（如能量填充S）保持純文字不展示說明
  if (detail) {
    return `<span class="special-skill-badge" role="button" tabindex="0" data-skill="${escapeHtml(cleanSkillKey)}" data-skill-detail="${escapeHtml(detail)}" title="${escapeHtml(plainTitle || detail)}"><span class="skill-name-text">${contentHtml}</span></span>`;
  }
  if (isEN) {
    return `<span class="main-skill-text">${contentHtml}</span>`;
  }
  let cleaned = displayName
    .replace(/\s*[\[\(](可替換|Customizable|Custom)[\]\)]/gi, '')
    .replace(/活力全體療癒S/g, '全體療癒S')
    .replace(/夢之碎片/g, '夢碎')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();
  return escapeHtml(cleaned);
}

function matchesSkill(pokemonSkill, targetBaseSkill) {
  if (!pokemonSkill) return false;
  if (pokemonSkill === targetBaseSkill) return true;
  const mapped = COMPOSITE_SKILL_MAP[pokemonSkill];
  if (mapped && mapped.includes(targetBaseSkill)) return true;
  return false;
}

/* ─── 智慧寬鬆搜尋引擎 (Phonetic Pinyin / Subsequence / Typo-tolerant Fuzzy Search) ─── */
const PINYIN_TABLE = [
  ['a', '啊阿'],
  ['ai', '艾愛矮哀埃礙癌呆'],
  ['an', '安暗按案岸'],
  ['ang', '昂'],
  ['ao', '奧熬襖傲敖'],
  ['ba', '巴拔把吧霸八罷扒靶疤爸叭'],
  ['bai', '白百擺敗拜柏'],
  ['ban', '班般搬板版半伴辦'],
  ['bang', '幫榜膀棒邦'],
  ['bao', '包寶保報爆暴抱飽胞薄豹寶寶'],
  ['bei', '北被備背貝悲杯倍碑輩'],
  ['ben', '本奔苯笨'],
  ['beng', '崩蹦繃'],
  ['bi', '比必皮閉壁幣避碧筆鼻彼畢匕'],
  ['bian', '邊變編扁遍便辯變'],
  ['biao', '標表飆鏢'],
  ['bie', '別鱉憋'],
  ['bin', '賓濱彬冰'],
  ['bing', '冰兵並病柄餅'],
  ['bo', '波播撥伯薄泊勃駁脖渤'],
  ['bu', '布不步部補捕怖埠哺簿'],
  ['cai', '才采彩菜裁財材'],
  ['cao', '草操槽曹'],
  ['chan', '產單纏禪顫懺'],
  ['chang', '長常場唱廠昌暢倡嘗'],
  ['chao', '超潮朝炒巢抄'],
  ['chen', '陳晨沉趁辰臣'],
  ['cheng', '城成承程盛稱撐誠呈懲'],
  ['chong', '蟲重沖充崇寵'],
  ['chou', '愁抽臭仇醜籌綢'],
  ['chu', '初出除處觸楚儲畜廚'],
  ['chuan', '穿船川傳串喘'],
  ['chui', '吹垂槌'],
  ['chun', '春純春唇蠢'],
  ['ci', '刺次磁詞慈此辭賜雌瓷'],
  ['cong', '蔥從聰叢匆'],
  ['cui', '翠催脆摧'],
  ['cun', '村存寸'],
  ['cuo', '錯措撮'],
  ['da', '大達搭答打塔'],
  ['dai', '呆帶待袋代貸戴怠逮'],
  ['dan', '蛋單但擔淡丹彈膽誕'],
  ['dang', '當擋黨盪蕩檔'],
  ['dao', '刀導島倒道盜稻到'],
  ['de', '德得的地'],
  ['deng', '燈等登鄧鄧'],
  ['di', '低地第底弟帝敵笛遞滴蒂提'],
  ['dian', '電點店顛典甸墊殿典顛'],
  ['diao', '雕吊釣掉調雕'],
  ['die', '蝶跌疊碟爹諜'],
  ['ding', '丁定頂訂盯釘鼎'],
  ['dong', '咚東冬動洞棟凍懂動'],
  ['dou', '豆都斗逗兜陡'],
  ['du', '嘟讀度獨毒都杜肚渡督堵睹'],
  ['duan', '段短斷鍛緞'],
  ['dui', '隊對堆'],
  ['dun', '盾頓噸頓敦鈍蹲'],
  ['duo', '朵舵多墮躲惰奪剁哆墮'],
  ['e', '顎惡額鵝俄餓鵝俄厄鱷'],
  ['en', '恩'],
  ['er', '爾耳兒二而貳餌'],
  ['fa', '發法伐罰乏'],
  ['fan', '反犯范凡繁泛翻煩販'],
  ['fang', '方房防放訪芳仿仿'],
  ['fei', '飛非肥費廢菲匪沸'],
  ['fen', '分份紛粉奮憤糞忿酚'],
  ['feng', '風峰封豐瘋鋒奉逢鳳蜂'],
  ['fu', '福負服副復富父婦符扶伏浮幅輔覆腐蝠'],
  ['ga', '嘎咖尬噶'],
  ['gai', '該改概蓋鈣'],
  ['gan', '乾甘敢趕感竿肝幹'],
  ['gang', '鋼綱岡崗剛港扛缸釭'],
  ['gao', '高告搞稿膏羔'],
  ['ge', '哥格各歌割閣隔個革葛戈'],
  ['geng', '耿梗更耕庚'],
  ['gong', '公工共功攻宮供恭拱貢弓'],
  ['gou', '勾狗購溝夠構鉤構'],
  ['gu', '古骨谷孤鼓故固古顧姑咕辜'],
  ['gua', '瓜掛刮寡'],
  ['guai', '怪拐乖'],
  ['guan', '關管觀官館冠罐貫慣'],
  ['guang', '光廣逛'],
  ['gui', '鬼龜規貴歸軌桂跪硅櫃瑰'],
  ['guo', '果過國郭鍋裹果'],
  ['ha', '哈蛤'],
  ['hai', '海害孩還骸'],
  ['han', '含漢韓汗喊寒涵旱撼'],
  ['hao', '浩耗好好號豪毫壕濠'],
  ['he', '河合何和盒赫褐鶴核荷喝賀涸'],
  ['hei', '黑嘿'],
  ['hong', '紅轟烘弘虹宏鴻洪'],
  ['hou', '猴侯喉厚後吼猴'],
  ['hu', '壺湖呼護互弧胡虎忽蝴乎核琥'],
  ['hua', '花華滑化話畫劃'],
  ['huan', '歡環緩換幻患還煥荒喚'],
  ['huang', '黃皇晃慌荒謊煌簧皇'],
  ['hui', '灰揮回會毀繪慧恢輝惠悔晦徽'],
  ['hun', '魂混昏婚葷'],
  ['huo', '火夥伙獲惑活或貨霍獲火焰'],
  ['ji', '基吉擊機雞積極集計記季技既際濟寂祭幾己寄繼紀擠脊棘姬緝嫉畸稽飢肌'],
  ['jia', '加假甲家夾佳駕架稼價嘉枷夾'],
  ['jian', '箭劍健件見間建鑑漸剪檢減堅尖兼監煎揀艱'],
  ['jiang', '匠江將姜獎講降醬僵殭薑僵'],
  ['jiao', '交角焦郊腳覺校叫教膠矯澆狡繳'],
  ['jie', '傑結截節接街階介借解姐捷潔竭藉'],
  ['jin', '金今進近僅斤緊勁錦巾禁晉筋浸'],
  ['jing', '精經晶驚井景警鏡競境京敬淨靜睛莖荊鯨'],
  ['jiu', '九酒久救舊就究糾救韭糾'],
  ['ju', '巨劇具聚局居橘懼拒矩沮據桔駒拘舉鋸菊'],
  ['juan', '卷圈捐倦絹眷'],
  ['jue', '決絕覺掘爵嚼訣'],
  ['jun', '君軍均菌俊郡駿鈞'],
  ['ka', '卡咖咯佧喀卡'],
  ['kai', '凱開慨楷鎧'],
  ['kan', '看砍刊勘坎檻'],
  ['kang', '康抗慷炕糠'],
  ['ke', '可克客刻科課顆渴殼柯瞌苛顆克'],
  ['kong', '恐空孔控'],
  ['kou', '口扣寇叩'],
  ['ku', '苦哭庫酷窟骷'],
  ['kua', '跨夸垮誇'],
  ['kuai', '快筷塊會膾'],
  ['kuan', '寬款'],
  ['kuang', '況狂曠框礦筐'],
  ['kui', '虧愧奎葵魁饋匱'],
  ['kun', '困昆捆坤'],
  ['kuo', '闊擴括廓'],
  ['la', '拉辣蠟喇落拉啦落臘'],
  ['lai', '萊來賴萊賴賚'],
  ['lan', '藍蘭覽懶爛欄籃攬藍覽纜'],
  ['lang', '狼浪郎朗廊莨'],
  ['lao', '老勞落牢撈酪姥'],
  ['le', '勒樂了肋'],
  ['lei', '雷磊累蕾擂類淚羸'],
  ['li', '利力立例麗李離理歷莉裡厘黎粒璃哩笠靂栗勵歷'],
  ['lian', '連聯練臉鍊憐鏈蓮聯鐮廉'],
  ['liang', '亮量輛良涼樑梁兩糧'],
  ['liao', '療料瞭僚廖撩寥燎'],
  ['lie', '烈列裂劣獵咧'],
  ['lin', '林臨鱗林麟淋吝嶙磷'],
  ['ling', '令另領零鈴靈凌玲齡陵菱令'],
  ['liu', '六流留柳溜瘤硫餾榴'],
  ['long', '龍隆籠聾弄隴瓏瀧籠'],
  ['lou', '樓漏陋摟簍'],
  ['lu', '路陸錄鹿露魯盧爐魯碌路蘆賂鲁'],
  ['lun', '輪論倫崙輪輪倫'],
  ['luo', '羅洛落絡螺裸邏落'],
  ['lv', '綠律旅率屢鋁履濾綠'],
  ['ma', '嗎媽馬麻碼瑪罵麻瑪'],
  ['mai', '買賣邁麥脈埋'],
  ['man', '滿慢曼漫瞞蠻蔓饅'],
  ['mang', '芒忙盲莽茫'],
  ['mao', '貓毛矛帽茂冒貌錨毛'],
  ['me', '麼'],
  ['mei', '沒每妹美枚妹梅媒眉魅昧'],
  ['men', '門們悶捫'],
  ['meng', '夢蒙猛萌盟懵濛朦虻'],
  ['mi', '迷咪米密蜜祕祕咪秘謎'],
  ['mian', '面免綿棉緬免眠免面'],
  ['miao', '妙秒苗描喵瞄渺眇苗'],
  ['min', '敏民敏皿憫憫'],
  ['ming', '明名命鳴冥銘'],
  ['mo', '魔磨摸模膜末莫墨默漠陌抹歿沫模'],
  ['mou', '謀某牟眸'],
  ['mu', '木目母墓幕幕睦穆募牧'],
  ['na', '拿那納娜哪鈉鈉'],
  ['nai', '奈耐奶奶乃奈奈'],
  ['nan', '南難男喃'],
  ['nao', '腦鬧惱鬧'],
  ['ne', '呢哪'],
  ['nei', '內餒'],
  ['nen', '嫩'],
  ['neng', '能'],
  ['ni', '泥你擬逆匿尼泥倪旎膩'],
  ['nian', '年念黏碾念'],
  ['niao', '鳥尿蔦'],
  ['nie', '聶捏涅鎳'],
  ['ning', '寧凝檸擰嚀'],
  ['niu', '牛扭紐鈕狃'],
  ['nong', '農濃弄農儂'],
  ['nu', '怒奴努弩'],
  ['nv', '女奴'],
  ['nuan', '暖'],
  ['nuo', '挪諾懦糯'],
  ['ou', '歐偶嘔歐鷗藕'],
  ['pa', '怕爬趴啪耙'],
  ['pai', '拍排牌派拍'],
  ['pan', '盤判盼叛潘畔'],
  ['pang', '胖旁膀磅仿'],
  ['pao', '炮跑泡袍砲'],
  ['pei', '配陪培培佩沛賠呸'],
  ['pen', '噴盆盼判噴'],
  ['peng', '朋碰澎彭蓬膨棚棚'],
  ['pi', '皮批披疲匹屁痞霹匹皮'],
  ['pian', '片篇便偏片'],
  ['piao', '票漂飄嫖瓢飄'],
  ['pin', '品貧拼頻貧'],
  ['ping', '平瓶評屏萍憑萍'],
  ['po', '破婆魄頗迫坡珀破'],
  ['pou', '剖'],
  ['pu', '普撲鋪僕蒲埔瀑葡鋪譜'],
  ['qi', '七奇旗起其期氣器妻齊汽漆欺戚騎乞歧泣琪'],
  ['qian', '前千牽遷千鉛潛錢乾淺欠簽'],
  ['qiang', '強槍牆腔強搶薔鏘彊'],
  ['qiao', '巧橋悄敲巧雀殼俏殼鍬僑鞘巧'],
  ['qie', '切茄且妾怯'],
  ['qin', '琴親勤禽侵琴寢欽芹琴'],
  ['qing', '青晴清情輕傾頃慶請蜻清'],
  ['qiu', '丘秋求球仇囚鰍酋蚯鍬'],
  ['qu', '去區取曲趣屈趨驅蛆軀'],
  ['quan', '全拳泉權券勸犬圈拳'],
  ['que', '確卻雀缺瘸雀鵲'],
  ['qun', '群裙群'],
  ['ran', '然燃染然'],
  ['rang', '讓嚷壤讓'],
  ['rao', '繞擾饒'],
  ['re', '熱惹'],
  ['ren', '人人認任忍刃仁韌任'],
  ['ri', '日'],
  ['rong', '蓉絨榮容融溶茸蠑榕戎'],
  ['rou', '肉柔揉揉'],
  ['ru', '如入汝乳儒辱褥'],
  ['ruan', '軟阮'],
  ['rui', '瑞銳蕊芮'],
  ['run', '潤閏潤'],
  ['ruo', '弱若若'],
  ['sa', '撒薩灑'],
  ['sai', '賽塞腮塞'],
  ['san', '三散散傘參'],
  ['sang', '桑喪嗓'],
  ['se', '色色澀瑟嗇'],
  ['sen', '森森'],
  ['seng', '僧'],
  ['sha', '沙殺砂紗傻廈煞鯊沙'],
  ['shan', '山珊扇善單閃衫珊膳煽訕'],
  ['shang', '上商傷賞尚裳晌'],
  ['shao', '少燒稍哨勺紹燒'],
  ['she', '蛇射設捨舌奢社涉攝捨'],
  ['shen', '身深神什甚申伸審滲慎腎神'],
  ['sheng', '聲生升勝繩聖盛牲笙省聖'],
  ['shi', '食石時十實識始使市是事示視式室試世勢士獅師詩失施濕拾蝕矢誓屎飾史逝釋'],
  ['shou', '手首守受授壽瘦獸獸'],
  ['shu', '鼠屬署書樹數術輸叔殊熟暑舒束述蜀梳贖梳'],
  ['shua', '刷耍'],
  ['shuai', '摔率帥衰'],
  ['shuan', '栓拴栓'],
  ['shuang', '雙霜爽雙'],
  ['shui', '水睡稅水'],
  ['shun', '順瞬吮'],
  ['shuo', '說爍朔碩'],
  ['si', '斯思絲司私死四寺似肆撕飼斯'],
  ['song', '松送宋誦聳鬆頌'],
  ['sou', '搜艘嗽颼'],
  ['su', '速素宿塑俗肅蘇訴溯縮訴速'],
  ['suan', '算酸蒜'],
  ['sui', '隨歲碎遂隧隨穗'],
  ['sun', '孫損筍筍'],
  ['suo', '所鎖索梭縮瑣娑梭'],
  ['ta', '他她它踏塔塌獺塔獺'],
  ['tai', '太泰胎台苔態抬臺泰'],
  ['tan', '談探坦炭攤灘潭壇貪檀痰'],
  ['tang', '堂唐糖湯躺燙趟堂塘搪'],
  ['tao', '桃逃淘陶套討濤討桃'],
  ['te', '特忒'],
  ['teng', '騰疼藤謄'],
  ['ti', '體題踢提替涕剃惕梯啼蹄蒂'],
  ['tian', '天田甜添填田舔恬天'],
  ['tiao', '條跳挑調挑'],
  ['tie', '鐵貼帖鐵'],
  ['ting', '聽庭停廳挺廷蜓婷霆'],
  ['tong', '同童通痛銅桐桶統彤筒瞳同'],
  ['tou', '頭投偷透頭'],
  ['tu', '土圖兔途吐突徒塗凸土'],
  ['tuan', '團團揣'],
  ['tui', '推退腿褪'],
  ['tun', '吞屯臀囤吞'],
  ['tuo', '托脫妥駝鴕唾托拖托陀陀'],
  ['wa', '蛙娃哇挖瓦窪媧襪蛙'],
  ['wai', '外歪'],
  ['wan', '萬玩完晚碗彎宛挽腕頑蔓萬'],
  ['wang', '王望往網亡妄忘旺網王'],
  ['wei', '尾為位微危味未微委衛唯偉圍違唯維畏胃緯偽威'],
  ['wen', '文問聞紋溫穩吻蚊紊玟紋'],
  ['weng', '翁甕嗡'],
  ['wo', '我窩握臥窩握渦'],
  ['wu', '無五物舞物屋武午舞誤悟伍污霧烏巫侮鳥務'],
  ['xi', '西希西夕析吸息洗細喜稀戲繫息惜隙吸蟋膝席稀習蜥'],
  ['xia', '夏下峽蝦瞎嚇俠匣轄'],
  ['xian', '仙先線現限鮮險顯縣掀閑閒咸弦銜餡纖腺憲仙'],
  ['xiang', '相象向像想鄉香響享降箱祥翔巷鑲項'],
  ['xiao', '小消笑效校銷囂嘯霄宵蕭硝曉梟小'],
  ['xie', '些寫謝鞋協邪血寫洩屑斜歇諧謝蟹'],
  ['xin', '新心辛信新薪芯馨欣信'],
  ['xing', '行性形星幸型醒興杏腥杏幸'],
  ['xiong', '胸雄熊兇兄兇熊雄'],
  ['xiu', '休秀修袖羞臭宿鏽'],
  ['xu', '許需須序虛續緒蓄敘徐婿徐'],
  ['xuan', '玄選旋宣懸炫旋眩絃選'],
  ['xue', '雪穴學靴血削學雪'],
  ['xun', '尋訓訊迅循旬熏詢尋'],
  ['ya', '牙押崖涯雅牙啞壓芽鴨訝蚜亞雅鴉'],
  ['yan', '炎焰眼岩言顏研演驗厭演宴嚴煙艷鹽延沿雁燕鹽眼岩'],
  ['yang', '樣羊楊洋揚漾仰養氧陽央秧樣'],
  ['yao', '要腰搖藥咬遙耀妖窯謠搖曜鑰'],
  ['ye', '葉頁夜野也業爺液冶咽夜葉'],
  ['yi', '伊依一衣醫異易意義益譯億役抑翼議疑怡姨乙亦屹移儀宜遺倚矣抑藝裔蟻蜴'],
  ['yin', '音陰引印隱銀因飲引音殷吟寅蔭'],
  ['ying', '影應英映硬嬰鷹迎盈熒螢櫻贏營穎鷹嬰'],
  ['yo', '喲'],
  ['yong', '勇泳永用湧詠蛹擁庸臃湧勇'],
  ['you', '幼友有由右遊又油優誘幽悠郵尤游'],
  ['yu', '魚雨語玉育遇魚羽於預域余宇郁域娛遇羽鬱魚禦語怨'],
  ['yuan', '螈原圓源園員遠院願元援淵袁冤緣員猿螈'],
  ['yue', '月岳越躍悅約樂閱鑰躍月'],
  ['yun', '運雲勻允暈韻孕運勻員'],
  ['za', '雜砸咋'],
  ['zai', '在再載災仔栽哉'],
  ['zan', '讚暫贊簪'],
  ['zang', '髒藏葬'],
  ['zao', '早造藻燥噪糟棗造'],
  ['ze', '則責擇澤嘖'],
  ['zei', '賊'],
  ['zen', '怎'],
  ['zeng', '增贈憎'],
  ['zha', '炸扎查榨閘詐眨'],
  ['zhai', '宅摘窄債寨齋'],
  ['zhan', '顫站戰佔斬展沾粘詹盞戰氈顫'],
  ['zhang', '張章丈掌長障帳脹彰'],
  ['zhao', '沼照找爪兆趙召沼招罩肇'],
  ['zhe', '這著遮折者蜇哲蔗者著'],
  ['zhen', '真陣針震鎮診枕針甄震'],
  ['zheng', '正爭整政證征蒸掙睜正'],
  ['zhi', '智隻指枝支知製直值質執治志制至址紙植殖脂蜘織稚炙'],
  ['zhong', '種中鐘重終眾忠腫衷踵種'],
  ['zhou', '周洲舟咒晝宙粥皺軸咒'],
  ['zhu', '竹主著住助注珠株諸祝豬煮逐燭築著竺'],
  ['zhua', '抓爪'],
  ['zhuai', '拽'],
  ['zhuan', '專轉傳磚撰賺轉'],
  ['zhuang', '壯裝撞莊狀妝幢壯'],
  ['zhui', '追錐墜綴贅'],
  ['zhun', '準准'],
  ['zhuo', '著捉桌卓濁酌琢灼啄著'],
  ['zi', '子紫字自姿咨資仔滋諮姊子'],
  ['zong', '總棕宗縱縱鬃縱'],
  ['zou', '走奏揍走'],
  ['zu', '組族足阻租卒祖足詛'],
  ['zuan', '鑽纂'],
  ['zui', '嘴最罪醉嘴'],
  ['zun', '尊遵'],
  ['zuo', '做作坐座左昨佐琢']
];

const CHAR_TO_PINYIN = {};
for (let i = 0; i < PINYIN_TABLE.length; i++) {
  const py = PINYIN_TABLE[i][0];
  const chars = PINYIN_TABLE[i][1];
  for (let j = 0; j < chars.length; j++) {
    CHAR_TO_PINYIN[chars[j]] = py;
  }
}
