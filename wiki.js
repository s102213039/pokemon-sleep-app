/**
 * =========================================================
 * 📚 Pokémon Sleep 數據百科與知識庫 (Wiki & Strategy Guide)
 * 實體化 Google 試算表圖表與官方最新拆包數據 (v2.7.0)
 * =========================================================
 */

(function () {
  'use strict';

  // --- 1. 主技能完整數值資料庫 (Main Skills Lv.1 ~ Lv.8) ---
  const MAIN_SKILLS_DATA = [
    {
      id: "charge_energy_s_fixed",
      name: "能量填充S (固定值)",
      icon: "⚡",
      category: "energy",
      catName: "能量系",
      desc: "增加卡比獸的能量（固定數值）。",
      maxLevel: 7,
      values: [400, 569, 785, 1083, 1496, 2066, 3002],
      unit: " 能量"
    },
    {
      id: "charge_energy_s_range",
      name: "能量填充S (隨機/變動值)",
      icon: "🎲",
      category: "energy",
      catName: "能量系",
      desc: "隨機增加卡比獸能量（在最小~最大區間浮動）。",
      maxLevel: 7,
      ranges: [
        { min: 200, max: 800 },
        { min: 285, max: 1138 },
        { min: 393, max: 1570 },
        { min: 542, max: 2166 },
        { min: 748, max: 2992 },
        { min: 1033, max: 4132 },
        { min: 1501, max: 6004 }
      ],
      specialNote: "🎲 浮動機制：每次發動隨機給予區間內能量",
      unit: " 能量"
    },
    {
      id: "charge_energy_m",
      name: "能量填充M (固定值)",
      icon: "🔥",
      category: "energy",
      catName: "能量系",
      desc: "大量增加卡比獸的能量（固定數值）。",
      maxLevel: 7,
      values: [880, 1251, 1726, 2383, 3290, 4546, 6409],
      unit: " 能量"
    },
    {
      id: "charge_stock_s",
      name: "蓄力 (能量填充S)",
      icon: "🔋",
      category: "energy",
      catName: "能量系 (複合)",
      desc: "發動蓄積或噴放。依蓄積次數（0~10次）暴增能量，最高達 82,386 能量！",
      maxLevel: 7,
      hasStackMatrix: true,
      matrix: [
        { stacks: 0, vals: [600, 853, 1177, 1625, 2243, 3099, 4502] },
        { stacks: 1, vals: [1020, 1450, 2001, 2763, 3813, 5268, 7653] },
        { stacks: 2, vals: [1500, 2132, 2943, 4063, 5607, 7747, 11255] },
        { stacks: 3, vals: [2040, 2900, 4002, 5526, 7626, 10536, 15307] },
        { stacks: 4, vals: [2640, 3753, 5179, 7151, 9869, 13635, 19809] },
        { stacks: 5, vals: [3300, 4691, 6474, 8939, 12336, 17044, 24761] },
        { stacks: 6, vals: [4020, 5715, 7886, 10889, 15028, 20763, 30163] },
        { stacks: 7, vals: [4920, 6995, 9652, 13327, 18393, 25412, 36916] },
        { stacks: 8, vals: [6180, 8786, 12124, 16740, 23103, 31920, 46370] },
        { stacks: 9, vals: [7980, 11345, 15655, 21615, 29832, 41217, 59876] },
        { stacks: 10, vals: [10980, 15610, 21540, 29740, 41047, 56712, 82386] }
      ],
      unit: " 能量"
    },
    {
      id: "nightmare_m",
      name: "夢魘 (能量填充M)",
      icon: "🌑",
      category: "special",
      catName: "神獸/特殊",
      desc: "達克萊伊專屬招式。卡比獸能量超大幅增加，但非惡屬性隊友活力下降。",
      maxLevel: 6,
      values: [2640, 3753, 5178, 7149, 9870, 13638],
      penaltyNote: "⚠️ 副作用：非惡屬性隊友全員活力 -12",
      unit: " 能量"
    },
    {
      id: "ingredient_magnet_s",
      name: "食材獲取S",
      icon: "🥗",
      category: "ingredient",
      catName: "食材與料理",
      desc: "隨機獲得已解鎖的食材。",
      maxLevel: 7,
      values: [6, 8, 11, 14, 17, 21, 24],
      unit: " 個食材"
    },
    {
      id: "cooking_power_up_s",
      name: "料理強化S (擴充鍋子容量)",
      icon: "🍲",
      category: "ingredient",
      catName: "食材與料理",
      desc: "增加下次烹調時鍋子容量上限，效果持續到料理大成功或換營地。",
      maxLevel: 7,
      values: [7, 10, 12, 17, 22, 27, 31],
      unit: " 個容量"
    },
    {
      id: "tasty_chance_s",
      name: "料理成功S (漂亮成功率提升)",
      icon: "✨",
      category: "ingredient",
      catName: "食材與料理",
      desc: "料理漂亮成功（大成功）機率提升，可持續疊加直到大成功為止。",
      maxLevel: 6,
      values: [4, 5, 6, 7, 8, 10],
      specialNote: "✨ 機率累加：大成功時發動雙倍/三倍能量，成功後機率重設",
      unit: "%"
    },
    {
      id: "helper_boost_s",
      name: "幫手支援S",
      icon: "🤝",
      category: "special",
      catName: "神獸/特殊",
      desc: "隨機 1 隻隊友立刻完成多次幫忙產出。",
      maxLevel: 7,
      values: [5, 6, 7, 8, 9, 10, 11],
      unit: " 次幫忙"
    },
    {
      id: "helper_boost_type",
      name: "幫手加速 (屬性) (神獸專屬)",
      icon: "⚡",
      category: "special",
      catName: "神獸/特殊",
      desc: "雷公/炎帝/水君專屬。隊伍同屬寶可夢立刻幫忙，同屬不同種類越多越強！",
      maxLevel: 6,
      hasTypeKindsMatrix: true,
      matrix: [
        { kinds: "0 種類", vals: [2, 3, 3, 4, 4, 5] },
        { kinds: "1 種類", vals: [2, 3, 3, 4, 4, 5] },
        { kinds: "2 種類", vals: [2, 3, 3, 4, 5, 6] },
        { kinds: "3 種類", vals: [3, 4, 5, 6, 7, 8] },
        { kinds: "4 種類", vals: [4, 5, 6, 7, 8, 9] },
        { kinds: "5 種類", vals: [6, 7, 8, 9, 10, 11] }
      ],
      unit: " 次幫忙"
    },
    {
      id: "berry_burst",
      name: "樹果遽增",
      icon: "🫐",
      category: "special",
      catName: "神獸/特殊",
      desc: "帕路奇亞專屬招式。獲得自身產出的樹果，並額外獲得隊友撿來的樹果。",
      maxLevel: 6,
      hasDualValues: true,
      selfShort: "自",
      teamShort: "他",
      selfValues: [11, 14, 21, 24, 27, 30],
      teamValues: [1, 2, 2, 3, 4, 5],
      unit: " 個"
    },
    {
      id: "disguise_berry_burst",
      name: "畫皮 (樹果遽增)",
      icon: "🎭",
      category: "special",
      catName: "神獸/特殊",
      desc: "謎擬Ｑ專屬招式。獲得自身與隊友的樹果。大成功時獲得 3 倍樹果。",
      maxLevel: 6,
      hasDualValues: true,
      selfShort: "自",
      teamShort: "他",
      selfValues: [8, 10, 15, 17, 19, 21],
      teamValues: [1, 2, 2, 3, 4, 5],
      specialNote: "✨ 機率觸發：大成功時獲得 3 倍樹果（至下次睡眠研究前不重複發動）",
      unit: " 個"
    },
    {
      id: "dream_shard_magnet_s_fixed",
      name: "夢之碎片獲取S (固定值)",
      icon: "💎",
      category: "shards",
      catName: "夢碎系",
      desc: "獲得夢之碎片（固定數量）。最高支援至 Lv.8！",
      maxLevel: 8,
      values: [240, 340, 480, 670, 920, 1260, 1800, 2500],
      unit: " 碎片"
    },
    {
      id: "dream_shard_magnet_s_range",
      name: "夢之碎片獲取S (隨機/變動值)",
      icon: "🎰",
      category: "shards",
      catName: "夢碎系",
      desc: "隨機獲得夢之碎片（在最小~最大區間浮動）。最高支援至 Lv.8！",
      maxLevel: 8,
      ranges: [
        { min: 120, max: 480 },
        { min: 170, max: 680 },
        { min: 240, max: 960 },
        { min: 335, max: 1340 },
        { min: 460, max: 1840 },
        { min: 630, max: 2520 },
        { min: 900, max: 3600 },
        { min: 1150, max: 4600 }
      ],
      specialNote: "🎲 浮動機制：每次發動隨機給予區間內碎片",
      unit: " 碎片"
    },
    {
      id: "charge_energy_self_s",
      name: "活力充填S",
      icon: "🔋",
      category: "energy_heal",
      catName: "活力系",
      desc: "讓自身回復活力。",
      maxLevel: 6,
      values: [12, 16, 21, 26, 33, 43],
      unit: " 點活力"
    },
    {
      id: "energizing_cheer_s",
      name: "活力療癒S",
      icon: "💚",
      category: "energy_heal",
      catName: "活力系",
      desc: "隨機讓隊伍中的 1 隻隊友回復活力。",
      maxLevel: 6,
      values: [14, 17, 22, 28, 38, 50],
      unit: " 點活力"
    },
    {
      id: "energy_for_everyone_s",
      name: "活力全體療癒S",
      icon: "💖",
      category: "energy_heal",
      catName: "活力系 (補師)",
      desc: "讓全體隊友回復活力（主力補師核心招式）。",
      maxLevel: 6,
      values: [5, 7, 9, 11, 15, 18],
      unit: " 點活力"
    },
    {
      id: "moonlight",
      name: "月光 (活力填充S)",
      icon: "🌙",
      category: "energy_heal",
      catName: "活力系 (伊布專屬)",
      desc: "月亮伊布 (#197) 專屬。自己回復活力；大成功時額外隨機讓 1 隻隊友回復活力。",
      maxLevel: 6,
      hasMoonlightChips: true,
      selfValues: [12, 16, 21, 26, 33, 43],
      teamValues: [6, 7, 10, 13, 17, 22],
      specialNote: "✨ 機率觸發：大成功（漂亮成功）時額外隨機讓 1 隻隊友回復活力",
      unit: " 點"
    },
    {
      id: "lunar_prayer",
      name: "新月祈禱 (活力全體療癒S)",
      icon: "🌠",
      category: "energy_heal",
      catName: "活力系 (神獸專屬)",
      desc: "克雷色利亞 (#488) 專屬。全隊回復活力，並額外獲得隊友撿來的樹果。",
      maxLevel: 6,
      hasLunarPrayerMatrix: true,
      healValues: [3, 4, 5, 7, 9, 11],
      berryRange: ["5~16", "9~22", "13~28", "17~34", "21~37", "25~41"],
      specialNote: "🔮 額外樹果：依隊伍中超能屬性隊友種類數（1~5 種）加成獲取",
      berryMatrix: [
        { kinds: "1 種類", vals: ["5+1", "9+1", "13+1", "17+1", "21+1", "25+1"] },
        { kinds: "2 種類", vals: ["7+1", "12+1", "17+1", "19+2", "24+2", "29+2"] },
        { kinds: "3 種類", vals: ["9+1", "15+1", "18+2", "25+2", "27+3", "30+4"] },
        { kinds: "4 種類", vals: ["12+1", "16+2", "20+3", "28+3", "28+5", "31+6"] },
        { kinds: "5 種類", vals: ["14+2", "19+3", "24+4", "29+5", "30+7", "32+9"] }
      ],
      unit: " 點活力"
    },
    {
      id: "transform",
      name: "變身 (技能複製)",
      icon: "🧬",
      category: "special",
      catName: "特殊機制",
      desc: "百變怪專屬。隨機複製隊伍中 1 隻隊友的主技能發動。",
      maxLevel: 7,
      unit: "比照複製招式等級"
    },
    {
      id: "mimic",
      name: "模仿 (技能複製)",
      icon: "🎪",
      category: "special",
      catName: "特殊機制",
      desc: "魔牆人偶專屬。隨機複製隊伍中 1 隻隊友的主技能發動。",
      maxLevel: 7,
      unit: "比照複製招式等級"
    },
    {
      id: "metronome",
      name: "揮指",
      icon: "☝️",
      category: "special",
      catName: "特殊機制",
      desc: "波克比家族等專屬。從全主技能庫中隨機抽選 1 種發動。",
      maxLevel: 7,
      unit: "Lv.1~7 隨機發動"
    }
  ];

  // --- 2. 副技能完整階級與數值資料庫 (Sub-Skills Data) ---
  const SUB_SKILLS_DATA = [
    {
      category: "採集型",
      s: { name: "持有上限提升 S", color: "white", val: "+6 個" },
      m: { name: "持有上限提升 M", color: "blue", val: "+12 個" },
      l: { name: "持有上限提升 L", color: "blue", val: "+18 個", status: "open" },
      desc: "該寶可夢可持有的樹果或材料上限提升 6 / 12 / 18 個"
    },
    {
      category: "採集型",
      s: { name: "幫忙速度 S", color: "white", val: "-7%" },
      m: { name: "幫忙速度 M", color: "blue", val: "-14%" },
      l: { name: "幫忙速度 L", color: "blue", val: "-21%", status: "unreleased" },
      desc: "該寶可夢提供幫助所需要的時間減少 7 / 14 / 21 % (※ 副技能幫速合計上限 35%)"
    },
    {
      category: "採集型",
      s: { name: "技能機率提升 S", color: "white", val: "+18%" },
      m: { name: "技能機率提升 M", color: "blue", val: "+36%" },
      l: { name: "技能機率提升 L", color: "blue", val: "+54%", status: "unreleased" },
      desc: "該寶可夢主技能發動機率提升 18 / 36 / 54 %"
    },
    {
      category: "採集型",
      s: { name: "食材機率提升 S", color: "white", val: "+18%" },
      m: { name: "食材機率提升 M", color: "blue", val: "+36%" },
      l: { name: "食材機率提升 L", color: "blue", val: "+54%", status: "unreleased" },
      desc: "該寶可夢發現食材的機率提升 18 / 36 / 54 %"
    },
    {
      category: "採集型",
      s: { name: "樹果數量 S", color: "gold", val: "+1 個" },
      m: { name: "樹果數量 M", color: "gold", val: "+2 個", status: "unreleased" },
      l: { name: "樹果數量 L", color: "gold", val: "+3 個", status: "unreleased" },
      desc: "該寶可夢每次找到樹果的數量提升 1 / 2 / 3 個"
    },
    {
      category: "技能型",
      s: { name: "技能等級提升 S", color: "blue", val: "+1 級" },
      m: { name: "技能等級提升 M", color: "gold", val: "+2 級" },
      l: { name: "技能等級提升 L", color: "gold", val: "+3 級", status: "unreleased" },
      desc: "該寶可夢主技能等級提升 1 / 2 / 3 級 (省下主技能金種子)"
    },
    {
      category: "採集型 (全隊)",
      s: { name: "-", color: "", val: "" },
      m: { name: "幫手獎勵", color: "gold", val: "全隊 -5%" },
      l: { name: "-", color: "", val: "" },
      desc: "寶可夢團隊提供幫助的時間減少 5 % (全隊最多疊加 5 隻 = 25%)"
    },
    {
      category: "恢復型 (全隊)",
      s: { name: "-", color: "", val: "" },
      m: { name: "活力恢復獎勵", color: "gold", val: "全隊 1.12x" },
      l: { name: "-", color: "", val: "" },
      desc: "寶可夢團隊從睡眠中恢復的能量提高 1.12 倍 (可彌補活力下降性格隊友)"
    },
    {
      category: "獎勵型",
      s: { name: "-", color: "", val: "" },
      m: { name: "夢之碎片獎勵", color: "gold", val: "+6%" },
      l: { name: "-", color: "", val: "" },
      desc: "睡眠後該寶可夢獲得夢之碎片的數量提高 6 % (活動日/幸運薰香可大量收穫)"
    },
    {
      category: "獎勵型",
      s: { name: "-", color: "", val: "" },
      m: { name: "研究 EXP 獎勵", color: "gold", val: "+6%" },
      l: { name: "-", color: "", val: "" },
      desc: "睡眠後玩家獲得的研究 EXP 提高 6 % (加快提升研究等級)"
    },
    {
      category: "獎勵型 (全隊)",
      s: { name: "-", color: "", val: "" },
      m: { name: "睡眠 EXP 獎勵", color: "gold", val: "+14%" },
      l: { name: "-", color: "", val: "" },
      desc: "睡眠後寶可夢團隊獲得的 EXP 提高 14 % (大幅加速全隊養成成長)"
    }
  ];

  // 主技能機率矩陣速查表 (Image 4)
  const TRIGGER_CHANCE_MATRIX = [
    { combo: "STM (+36%) + STS (+18%) + 性格▲▲ (x1.2)", multiplier: 1.848, grade: "SSS (發動極限)", desc: "1.54 × 1.2" },
    { combo: "STM (+36%) + 性格▲▲ (x1.2)", multiplier: 1.632, grade: "SS (優秀極限)", desc: "1.36 × 1.2" },
    { combo: "STM (+36%) + STS (+18%)", multiplier: 1.530, grade: "S (雙副技無性格)", desc: "1.54 × 1.0" },
    { combo: "STS (+18%) + 性格▲▲ (x1.2)", multiplier: 1.416, grade: "A (單副技+性格)", desc: "1.18 × 1.2" },
    { combo: "STM (+36%)", multiplier: 1.360, grade: "A (單STM無性格)", desc: "1.36 × 1.0" },
    { combo: "STM (+36%) + STS (+18%) + 性格▼▼ (x0.8)", multiplier: 1.232, grade: "B (雙副技補回性格)", desc: "1.54 × 0.8" },
    { combo: "性格▲▲ (x1.2)", multiplier: 1.200, grade: "B (純性格無副技)", desc: "1.00 × 1.2" },
    { combo: "STS (+18%)", multiplier: 1.180, grade: "B (純STS無性格)", desc: "1.18 × 1.0" },
    { combo: "STM (+36%) + 性格▼▼ (x0.8)", multiplier: 1.088, grade: "C (STM抵銷性格下修)", desc: "1.36 × 0.8" },
    { combo: "無任何加成/修正 (Baseline)", multiplier: 1.000, grade: "基準線 (1.00x)", desc: "1.00 × 1.0" },
    { combo: "STS (+18%) + 性格▼▼ (x0.8)", multiplier: 0.944, grade: "D (微幅受阻)", desc: "1.18 × 0.8" },
    { combo: "性格▼▼ (x0.8)", multiplier: 0.800, grade: "E (嚴重削弱)", desc: "1.00 × 0.8" }
  ];

  // 性格五維倍率表
  const NATURES_EFFECT_DATA = [
    { stat: "幫忙速度", up: "▲▲ 1.10 倍 (時間 ÷1.10)", down: "▼▼ 0.90 倍 (時間 ×1.10)", desc: "影響所有樹果、食材與技能判定頻率" },
    { stat: "活力回復量", up: "▲▲ 1.20 倍", down: "▼▼ 0.88 倍 (v1.3.0 修正)", desc: "影響睡眠與隊伍補師補血量" },
    { stat: "食材發現率", up: "▲▲ 1.20 倍", down: "▼▼ 0.80 倍", desc: "每次幫忙時判定為食材的機率" },
    { stat: "主技能機率", up: "▲▲ 1.20 倍", down: "▼▼ 0.80 倍", desc: "每次幫忙時判定發動主技能的機率" },
    { stat: "EXP 獲得量", up: "▲▲ 1.18 倍 (5顆糖多賺1顆)", down: "▼▼ 0.82 倍 (5顆糖被吃1顆)", desc: "影響糖果升級與睡眠結算經驗值" }
  ];

  // --- 3. 培育與評級指南資料庫 (Image 2) ---
  const RATINGS_GUIDE_DATA = {
    berry: {
      title: "🍊 樹果寵 【樹果 2 個、食材 1 個】",
      desc: "以高頻率產出大量樹果累積卡比獸能量為最高目標。",
      subskills: [
        { grade: "Ⓢ", name: "樹果數量S", detail: "樹果數量+1，能量直接翻倍（容易滿包需常收取）" },
        { grade: "Ⓐ", name: "幫手獎勵", detail: "全隊 -5% 幫忙時間（5隻疊加 25%）" },
        { grade: "Ⓐ", name: "幫忙速度M", detail: "自己 -14% 幫忙時間" },
        { grade: "Ⓑ", name: "幫忙速度S", detail: "自己 -7% 幫忙時間（可用銀種子升階為 M 升至 Ⓐ）" }
      ],
      natures: [
        { grade: "Ⓢ", name: "幫忙速度 ▲▲", detail: "全方位提升樹果產出速度" },
        { grade: "Ⓐ", name: "食材發現率 ▼▼", detail: "食材率降低，變相提高樹果產出機率（加分項）" },
        { grade: "Ⓑ", name: "主技能機率 ▲▲ / ▼▼", detail: "技能對樹果寵非首要，發動機率高低影響不大" }
      ]
    },
    ingredient: {
      title: "🥩 食材寵 【樹果 1 個、食材 2 個】",
      desc: "以穩定供給高階食譜所需的高價值食材為核心職責。",
      subskills: [
        { grade: "Ⓢ", name: "食材機率提升M", detail: "+36% 食材機率，食材寵畢業核心" },
        { grade: "Ⓐ", name: "幫手獎勵", detail: "全隊 -5% 幫忙時間" },
        { grade: "Ⓐ", name: "食材機率提升S", detail: "+18% 食材機率（可用銀種子升階為 M 升至 Ⓢ）" },
        { grade: "Ⓐ", name: "幫忙速度M", detail: "自己 -14% 幫忙時間" },
        { grade: "Ⓑ", name: "幫忙速度S", detail: "自己 -7% 幫忙時間" },
        { grade: "Ⓑ", name: "持有上限提升 M/L", detail: "防止睡覺滿包停止產出食材" },
        { grade: "Ⓑ", name: "樹果數量S + 持有上限", detail: "需搭配持有上限擴充，並保持頻繁收取" }
      ],
      natures: [
        { grade: "Ⓢ", name: "食材發現率 ▲▲", detail: "食材產出量大幅提升" },
        { grade: "Ⓐ", name: "幫忙速度 ▲▲", detail: "提高整體幫忙與食材判定頻率" },
        { grade: "Ⓑ", name: "主技能機率 ▲▲ / ▼▼", detail: "若有自補/料理強化可加分，其餘技能影響不大" }
      ]
    },
    skill: {
      title: "⚡ 技能寵 【樹果 1 個、食材 1 個】",
      desc: "以高頻率觸發核心主技能（全體補血、神獸加速、高額能量、料理擴鍋）為核心職責。",
      subskills: [
        { grade: "Ⓢ", name: "技能機率提升M", detail: "+36% 技能發動機率，技能寵畢業核心" },
        { grade: "Ⓐ", name: "幫手獎勵", detail: "全隊 -5% 幫忙時間" },
        { grade: "Ⓐ", name: "幫忙速度M", detail: "自己 -14% 幫忙時間" },
        { grade: "Ⓐ", name: "技能機率提升S", detail: "+18% 技能發動機率（可用銀種子升階為 M 升至 Ⓢ）" },
        { grade: "Ⓑ", name: "樹果數量S + 持有上限", detail: "補足基本能量產出，需常收取" },
        { grade: "Ⓑ", name: "技能等級提升M", detail: "主技能等級+2，節省金種子珍貴資源" },
        { grade: "Ⓒ", name: "技能等級提升S", detail: "主技能等級+1（可用銀種子升階）" }
      ],
      natures: [
        { grade: "Ⓢ", name: "主技能發動機率 ▲▲", detail: "技能寵靈魂性格，觸發次數最大化" },
        { grade: "Ⓐ", name: "幫忙速度 ▲▲", detail: "提高幫忙判定頻率" },
        { grade: "Ⓐ", name: "食材發現率 ▼▼", detail: "降低食材掉落，無副作用（技能寵只看技能與速度）" }
      ]
    }
  };

  // 睡眠天數成長基準表 (Image 2)
  const SLEEP_DAYS_BASELINE = [
    { level: 10, totalExp: 1600, days: 16, note: "解鎖第一個副技能，新手初期門檻" },
    { level: 25, totalExp: 8700, days: 87, note: "解鎖第二個副技能，中階關鍵戰力" },
    { level: 30, totalExp: 12000, days: 120, note: "解鎖第二種食材，前期核心目標（約 2~4 個月）" },
    { level: 50, totalExp: 30000, days: 300, note: "解鎖第三個副技能，後期主力培育（約 5~10 個月）" },
    { level: 60, totalExp: 51500, days: 515, note: "解鎖第三種食材，頂級完全體" }
  ];

  // --- 4. Lv.60 各食材日產量天梯榜資料庫 (Image 3) ---
  const LV60_INGREDIENTS_LADDER = [
    {
      id: "tail",
      name: "粗擺尾巴",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png",
      maxDaily: 20,
      tiers: [
        { name: "呆呆獸 / 呆殼獸 / 呆呆王", count: "14~18 顆/天", rate: 85, note: "尾巴唯一專屬來源，解鎖後亦可透過食材獲取S隨機抽得" }
      ]
    },
    {
      id: "apple",
      name: "特選蘋果",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png",
      maxDaily: 110,
      tiers: [
        { name: "大甲 (凱羅斯)", count: "100~108 顆/天", rate: 95, note: "AAA 蘋果最高產量霸主" },
        { name: "魔牆人偶", count: "78~84 顆/天", rate: 75, note: "高產量蘋果供給手" },
        { name: "信使鳥", count: "70~76 顆/天", rate: 70, note: "飛行系高產手" },
        { name: "皮卡丘 / 雷丘", count: "50~56 顆/天", rate: 50, note: "樹果型兼顧蘋果" }
      ]
    },
    {
      id: "ginger",
      name: "暖暖薑",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png",
      maxDaily: 100,
      tiers: [
        { name: "班基拉斯 (老班)", count: "92~98 顆/天", rate: 95, note: "暖暖薑第一巨頭" },
        { name: "袋獸 (袋龍)", count: "80~86 顆/天", rate: 82, note: "單段強勢薑手" },
        { name: "噴火龍", count: "72~78 顆/天", rate: 75, note: "AAA 薑爆發產出" },
        { name: "皮可西 / 胖可丁", count: "40~46 顆/天", rate: 45, note: "副產物" }
      ]
    },
    {
      id: "milk",
      name: "哞哞鮮奶",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png",
      maxDaily: 105,
      tiers: [
        { name: "水箭龜", count: "96~104 顆/天", rate: 98, note: "牛奶絕對王者，甜點/咖哩核心主力" },
        { name: "仙子伊布", count: "58~64 顆/天", rate: 60, note: "補師兼顧牛奶" },
        { name: "大奶罐 (預備)", count: "52~58 顆/天", rate: 55, note: "牛奶專屬" },
        { name: "雷伊布 / 太陽伊布", count: "40~46 顆/天", rate: 42, note: "副產物" }
      ]
    },
    {
      id: "honey",
      name: "甜甜蜜",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/honey.png",
      maxDaily: 100,
      tiers: [
        { name: "妙蛙花", count: "90~98 顆/天", rate: 95, note: "甜蜜蜜天花板，甜點咖哩必備" },
        { name: "大針蜂", count: "78~84 顆/天", rate: 80, note: "高速蜂蜜產出" },
        { name: "蝶結萌虻", count: "70~76 顆/天", rate: 72, note: "蟲系高產蜂蜜" },
        { name: "巴大蝶", count: "48~54 顆/天", rate: 50, note: "樹果型兼顧蜂蜜" }
      ]
    },
    {
      id: "sausage",
      name: "豆香香腸",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/beansausage.png",
      maxDaily: 95,
      tiers: [
        { name: "噴火龍", count: "88~94 顆/天", rate: 95, note: "香腸天花板霸主" },
        { name: "黑魯加", count: "62~68 顆/天", rate: 70, note: "惡系香腸手" },
        { name: "風速狗", count: "50~56 顆/天", rate: 55, note: "火系技能兼顧" }
      ]
    },
    {
      id: "soybeans",
      name: "幼芽大豆",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png",
      maxDaily: 95,
      tiers: [
        { name: "隆隆岩", count: "86~92 顆/天", rate: 94, note: "大豆產量絕對天花板" },
        { name: "多多冰 (雙倍多多冰)", count: "70~76 顆/天", rate: 75, note: "冰系大豆高產手" },
        { name: "三地鼠", count: "60~66 顆/天", rate: 65, note: "地面系大豆手" },
        { name: "班基拉斯", count: "48~54 顆/天", rate: 52, note: "副產物" }
      ]
    },
    {
      id: "tomato",
      name: "熟透番茄",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png",
      maxDaily: 90,
      tiers: [
        { name: "大食花", count: "82~88 顆/天", rate: 95, note: "番茄第一把交椅" },
        { name: "魔牆人偶", count: "68~74 顆/天", rate: 80, note: "番茄高產手" },
        { name: "胡說樹", count: "50~56 顆/天", rate: 60, note: "副產物" }
      ]
    },
    {
      id: "corn",
      name: "甜甜玉米",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png",
      maxDaily: 90,
      tiers: [
        { name: "穿著熊", count: "80~86 顆/天", rate: 95, note: "玉米頂級霸主，格鬥島核心" },
        { name: "快龍", count: "68~74 顆/天", rate: 82, note: "龍系高產玉米" },
        { name: "向日花怪", count: "58~64 顆/天", rate: 70, note: "草系玉米手" }
      ]
    },
    {
      id: "egg",
      name: "純白蛋",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png",
      maxDaily: 90,
      tiers: [
        { name: "信使鳥", count: "80~86 顆/天", rate: 95, note: "純白蛋第一產出巨頭" },
        { name: "吉利蛋 / 幸福蛋", count: "68~75 顆/天", rate: 82, note: "高耐力產蛋專家" },
        { name: "波克基斯", count: "50~56 顆/天", rate: 60, note: "技能型兼顧蛋" },
        { name: "阿柏怪", count: "38~44 顆/天", rate: 45, note: "副產物" }
      ]
    },
    {
      id: "potato",
      name: "鬆脆馬鈴薯",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/softpotato.png",
      maxDaily: 85,
      tiers: [
        { name: "大食花", count: "78~84 顆/天", rate: 95, note: "馬鈴薯頂級供給手" },
        { name: "隆隆岩", count: "70~76 顆/天", rate: 85, note: "岩石高產馬鈴薯" },
        { name: "魔牆人偶", count: "58~64 顆/天", rate: 72, note: "副產物" },
        { name: "袋獸", count: "48~54 顆/天", rate: 60, note: "副產物" }
      ]
    },
    {
      id: "mushroom",
      name: "烤蘑菇",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png",
      maxDaily: 75,
      tiers: [
        { name: "耿鬼", count: "66~72 顆/天", rate: 95, note: "蘑菇唯一超高速王者" },
        { name: "沼王", count: "52~58 顆/天", rate: 75, note: "水系蘑菇主力" },
        { name: "霸王花", count: "44~50 顆/天", rate: 62, note: "副產物" }
      ]
    },
    {
      id: "oil",
      name: "純油",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/pureoil.png",
      maxDaily: 80,
      tiers: [
        { name: "毒骷蛙", count: "72~78 顆/天", rate: 95, note: "純油天花板" },
        { name: "大甲", count: "62~68 顆/天", rate: 82, note: "副產物高產手" },
        { name: "海三地鼠", count: "52~58 顆/天", rate: 70, note: "水系純油手" },
        { name: "百變怪", count: "40~46 顆/天", rate: 55, note: "副產物" }
      ]
    },
    {
      id: "coffee",
      name: "猛烈咖啡",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png",
      maxDaily: 80,
      tiers: [
        { name: "巴布土撥", count: "70~76 顆/天", rate: 95, note: "咖啡第一把交椅，高階提神料理必備" },
        { name: "呆火鱷 (骨紋一族)", count: "60~66 顆/天", rate: 82, note: "火系咖啡高產手" },
        { name: "強石怪 (岩石系)", count: "50~56 顆/天", rate: 68, note: "副產物" }
      ]
    },
    {
      id: "cacao",
      name: "堅硬可可",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png",
      maxDaily: 75,
      tiers: [
        { name: "水箭龜", count: "66~72 顆/天", rate: 95, note: "可可頂級霸主" },
        { name: "阿勃梭魯 (災獸)", count: "58~64 顆/天", rate: 85, note: "惡系可可高產手" },
        { name: "仙子伊布 / 雷伊布", count: "36~42 顆/天", rate: 50, note: "副產物" }
      ]
    },
    {
      id: "leek",
      name: "美味洋蔥 (大蔥)",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/largeleek.png",
      maxDaily: 70,
      tiers: [
        { name: "三地鼠", count: "60~66 顆/天", rate: 95, note: "大蔥第一產量手" },
        { name: "百變怪", count: "48~54 顆/天", rate: 78, note: "大蔥副產專員" },
        { name: "大蔥鴨", count: "42~48 顆/天", rate: 68, note: "原廠大蔥手" }
      ]
    },
    {
      id: "herb",
      name: "活力香草",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png",
      maxDaily: 75,
      tiers: [
        { name: "黑魯加", count: "66~72 顆/天", rate: 95, note: "香草第一產量巨頭" },
        { name: "耿鬼", count: "56~62 顆/天", rate: 82, note: "香草副產高產手" },
        { name: "快龍", count: "48~54 顆/天", rate: 70, note: "龍系高產副產物" }
      ]
    },
    {
      id: "pumpkin",
      name: "特選南瓜",
      icon: "https://www.serebii.net/pokemonsleep/ingredients/specialpumpkin.png",
      maxDaily: 60,
      tiers: [
        { name: "南瓜精 / 南瓜怪人", count: "52~58 顆/天", rate: 95, note: "南瓜唯一專屬來源，萬聖節料理主力" }
      ]
    }
  ];

  // --- 核心互動控制函數 ---

  // 1. 切換子分頁 (skills / subskills / ratings / ingredients)
  function switchWikiSubTab(targetTab) {
    if (!targetTab) return;

    const allSubtabBtns = document.querySelectorAll('.wiki-subtab-btn');
    allSubtabBtns.forEach(b => {
      if (b.getAttribute('data-subtab') === targetTab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const allSubpanels = document.querySelectorAll('.wiki-subpanel');
    allSubpanels.forEach(p => {
      p.classList.remove('active');
      p.style.setProperty('display', 'none', 'important');
    });

    const activePanel = document.getElementById(`wiki-subpanel-${targetTab}`);
    if (activePanel) {
      activePanel.classList.add('active');
      activePanel.style.setProperty('display', 'block', 'important');
    }
  }

  // 2. 篩選技能類型 (all / energy / energy_heal / ingredient / special / shards)
  function filterWikiSkills(category) {
    if (!category) return;

    const allPills = document.querySelectorAll('[data-skill-cat]');
    allPills.forEach(b => {
      if (b.getAttribute('data-skill-cat') === category) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const allCards = document.querySelectorAll('.wiki-skill-card');
    allCards.forEach(card => {
      const cardCat = card.getAttribute('data-category');
      if (category === 'all' || cardCat === category) {
        card.style.setProperty('display', 'flex', 'important');
      } else {
        card.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // 3. 篩選食材天梯 (all / tail / apple / ...)
  function filterWikiIngredients(ingId) {
    if (!ingId) return;

    const allPills = document.querySelectorAll('[data-ing-filter]');
    allPills.forEach(b => {
      if (b.getAttribute('data-ing-filter') === ingId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const allLadderCards = document.querySelectorAll('.ladder-card');
    allLadderCards.forEach(card => {
      const cardIng = card.getAttribute('data-ladder-ing');
      if (ingId === 'all' || cardIng === ingId) {
        card.style.setProperty('display', 'block', 'important');
      } else {
        card.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // 4. 切換蓄力次數 (0 ~ 10)
  function switchChargeStock(stackNum) {
    stackNum = parseInt(stackNum, 10) || 0;
    const chips = document.querySelectorAll('[data-stack-target]');
    chips.forEach(c => {
      if (parseInt(c.getAttribute('data-stack-target'), 10) === stackNum) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const chargeSkill = MAIN_SKILLS_DATA.find(s => s.id === 'charge_stock_s');
    const dynamicContainer = document.getElementById('charge-stock-dynamic-levels');
    if (chargeSkill && dynamicContainer && chargeSkill.matrix && chargeSkill.matrix[stackNum]) {
      const vals = chargeSkill.matrix[stackNum].vals;
      dynamicContainer.innerHTML = vals.map((v, i) => `
        <div class="skill-level-chip ${stackNum === 10 ? 'highlight-gold' : 'highlight-blue'}">
          <span class="level-tag">Lv.${i + 1}</span>
          <span class="level-val">${v.toLocaleString()} 能量</span>
        </div>
      `).join('');
    }
  }

  // 5. 切換幫手加速同屬種類數 (0 ~ 5)
  function switchHelperBoost(kindNum) {
    kindNum = parseInt(kindNum, 10) || 0;
    const chips = document.querySelectorAll('[data-boost-kind]');
    chips.forEach(c => {
      if (parseInt(c.getAttribute('data-boost-kind'), 10) === kindNum) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    const boostSkill = MAIN_SKILLS_DATA.find(s => s.id === 'helper_boost_type');
    const dynamicContainer = document.getElementById('helper-boost-dynamic-levels');
    if (boostSkill && dynamicContainer && boostSkill.matrix && boostSkill.matrix[kindNum]) {
      const vals = boostSkill.matrix[kindNum].vals;
      dynamicContainer.innerHTML = vals.map((v, i) => `
        <div class="skill-level-chip highlight-blue">
          <span class="level-tag">Lv.${i + 1}</span>
          <span class="level-val">${v} 次幫忙</span>
        </div>
      `).join('');
    }
  }

  // 6. 展開/收合詳細對照表
  function toggleDetailTable(targetId) {
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      const isHidden = targetEl.style.display === 'none' || targetEl.style.display === '' || window.getComputedStyle(targetEl).display === 'none';
      targetEl.style.setProperty('display', isHidden ? 'block' : 'none', 'important');
    }
  }

  // 7. 主技能發動機率計算機重新計算
  function recalcTriggerChance() {
    const subskillSelect = document.getElementById('calc-subskill-select');
    const natureSelect   = document.getElementById('calc-nature-select');
    const resultVal      = document.getElementById('calc-result-val');
    const resultBadge    = document.getElementById('calc-result-badge');

    if (!subskillSelect || !natureSelect || !resultVal || !resultBadge) return;

    const subskillBonus = parseFloat(subskillSelect.value) || 0;
    const natureMult    = parseFloat(natureSelect.value) || 1.0;
    const totalMult     = (1 + subskillBonus) * natureMult;

    resultVal.textContent = totalMult.toFixed(3) + ' 倍';

    let grade = 'A (良好)';
    let gradeCls = 'grade-a';

    if (totalMult >= 1.8) {
      grade = 'SSS (頂級發動極限)';
      gradeCls = 'grade-sss';
    } else if (totalMult >= 1.6) {
      grade = 'SS (優秀極限)';
      gradeCls = 'grade-ss';
    } else if (totalMult >= 1.5) {
      grade = 'S (雙副技極高)';
      gradeCls = 'grade-s';
    } else if (totalMult >= 1.35) {
      grade = 'A (單STM無性格)';
      gradeCls = 'grade-a';
    } else if (totalMult >= 1.15) {
      grade = 'B (微幅加成)';
      gradeCls = 'grade-b';
    } else if (totalMult >= 1.0) {
      grade = 'C (基準線附近)';
      gradeCls = 'grade-c';
    } else if (totalMult >= 0.9) {
      grade = 'D (受性格下修影響)';
      gradeCls = 'grade-d';
    } else {
      grade = 'E (嚴重受阻)';
      gradeCls = 'grade-e';
    }

    resultBadge.className = `calc-result-badge ${gradeCls}`;
    resultBadge.textContent = grade;
  }

  // 8. 升級睡眠天數計算機重新計算
  function recalcSleepDays() {
    const curLvInput    = document.getElementById('calc-sleep-cur-lv');
    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    const expSubskill   = document.getElementById('calc-sleep-exp-subskill');
    const incense       = document.getElementById('calc-sleep-incense');
    const natureSelect  = document.getElementById('calc-sleep-nature-select');
    const daysResult    = document.getElementById('calc-sleep-days-result');
    const expResult     = document.getElementById('calc-sleep-exp-result');

    if (!curLvInput || !targetLvInput || !daysResult || !expResult) return;

    const cumulativeExp = [
      0, 54, 153, 297, 486, 720, 999, 1323, 1692, 2106,
      2565, 3069, 3618, 4212, 4851, 5535, 6264, 7038, 7857, 8721,
      9630, 10584, 11583, 12627, 13716, 14850, 16029, 17253, 18522, 19836,
      21195, 22599, 24048, 25542, 27081, 28665, 30294, 31968, 33687, 35451,
      37260, 39114, 41013, 42957, 44946, 46980, 49059, 51183, 53352, 55566,
      57825, 60129, 62478, 64872, 67311, 69795, 72324, 74898, 77517, 80181
    ];

    let cur = parseInt(curLvInput.value, 10) || 1;
    let target = parseInt(targetLvInput.value, 10) || 30;

    if (cur < 1) cur = 1;
    if (cur > 59) cur = 59;
    if (target <= cur) target = cur + 1;
    if (target > 60) target = 60;

    const baseExpNeeded = (cumulativeExp[target - 1] || 80000) - (cumulativeExp[cur - 1] || 0);

    let dailyExp = 100;
    if (expSubskill && expSubskill.checked) dailyExp *= 1.14;
    if (incense && incense.checked) dailyExp *= 2.0;
    const natureFactor = parseFloat(natureSelect ? natureSelect.value : 1.0) || 1.0;
    dailyExp *= natureFactor;

    const daysNeeded = Math.ceil(baseExpNeeded / dailyExp);

    daysResult.textContent = daysNeeded.toLocaleString() + ' 天';
    expResult.textContent = `約需 ${baseExpNeeded.toLocaleString()} EXP (每日約 ${Math.round(dailyExp)} EXP)`;
  }

  // --- 綁定直接節點事件 (Direct DOM Event Listeners) ---
  function bindAllEvents() {
    // 1. 綁定二級子分頁切換按鈕
    document.querySelectorAll('.wiki-subtab-btn').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const tab = this.getAttribute('data-subtab');
        switchWikiSubTab(tab);
      };
    });

    // 2. 綁定技能類型篩選按鈕
    document.querySelectorAll('[data-skill-cat]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const cat = this.getAttribute('data-skill-cat');
        filterWikiSkills(cat);
      };
    });

    // 3. 綁定食材天梯篩選按鈕
    document.querySelectorAll('[data-ing-filter]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const ing = this.getAttribute('data-ing-filter');
        filterWikiIngredients(ing);
      };
    });

    // 4. 綁定蓄力次數快速切換按鈕
    document.querySelectorAll('[data-stack-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-stack-target'), 10) || 0;
        switchChargeStock(num);
      };
    });

    // 5. 綁定幫手加速種類快速切換按鈕
    document.querySelectorAll('[data-boost-kind]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const num = parseInt(this.getAttribute('data-boost-kind'), 10) || 0;
        switchHelperBoost(num);
      };
    });

    // 6. 綁定展開/收合詳細對照表
    document.querySelectorAll('[data-toggle-target]').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const targetId = this.getAttribute('data-toggle-target');
        toggleDetailTable(targetId);
      };
    });

    // 7. 綁定主技能發動機率計算機表單
    const subskillSelect = document.getElementById('calc-subskill-select');
    if (subskillSelect) {
      subskillSelect.onchange = recalcTriggerChance;
      subskillSelect.addEventListener('change', recalcTriggerChance);
    }

    const natureSelect = document.getElementById('calc-nature-select');
    if (natureSelect) {
      natureSelect.onchange = recalcTriggerChance;
      natureSelect.addEventListener('change', recalcTriggerChance);
    }

    // 8. 綁定睡眠天數升級計算器表單
    const curLvInput = document.getElementById('calc-sleep-cur-lv');
    if (curLvInput) {
      curLvInput.oninput = recalcSleepDays;
      curLvInput.onchange = recalcSleepDays;
    }

    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    if (targetLvInput) {
      targetLvInput.oninput = recalcSleepDays;
      targetLvInput.onchange = recalcSleepDays;
    }

    const expSubskill = document.getElementById('calc-sleep-exp-subskill');
    if (expSubskill) {
      expSubskill.onchange = recalcSleepDays;
    }

    const incense = document.getElementById('calc-sleep-incense');
    if (incense) {
      incense.onchange = recalcSleepDays;
    }

    const sleepNatureSelect = document.getElementById('calc-sleep-nature-select');
    if (sleepNatureSelect) {
      sleepNatureSelect.onchange = recalcSleepDays;
    }
  }

  // --- 全域事件委託備援 (Global Event Delegation Fallback) ---
  let isDelegationBound = false;
  function bindGlobalDelegationFallback() {
    if (isDelegationBound) return;
    isDelegationBound = true;

    document.addEventListener('click', (e) => {
      const subtabBtn = e.target.closest('.wiki-subtab-btn');
      if (subtabBtn) {
        switchWikiSubTab(subtabBtn.getAttribute('data-subtab'));
        return;
      }

      const skillPillBtn = e.target.closest('[data-skill-cat]');
      if (skillPillBtn) {
        filterWikiSkills(skillPillBtn.getAttribute('data-skill-cat'));
        return;
      }

      const ingPillBtn = e.target.closest('[data-ing-filter]');
      if (ingPillBtn) {
        filterWikiIngredients(ingPillBtn.getAttribute('data-ing-filter'));
        return;
      }

      const stackChipBtn = e.target.closest('[data-stack-target]');
      if (stackChipBtn) {
        switchChargeStock(parseInt(stackChipBtn.getAttribute('data-stack-target'), 10) || 0);
        return;
      }

      const boostKindBtn = e.target.closest('[data-boost-kind]');
      if (boostKindBtn) {
        switchHelperBoost(parseInt(boostKindBtn.getAttribute('data-boost-kind'), 10) || 0);
        return;
      }

      const toggleBtn = e.target.closest('[data-toggle-target]');
      if (toggleBtn) {
        toggleDetailTable(toggleBtn.getAttribute('data-toggle-target'));
        return;
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target && (e.target.id === 'calc-subskill-select' || e.target.id === 'calc-nature-select')) {
        recalcTriggerChance();
      }
      if (e.target && (e.target.id === 'calc-sleep-exp-subskill' || e.target.id === 'calc-sleep-incense' || e.target.id === 'calc-sleep-nature-select')) {
        recalcSleepDays();
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.id === 'calc-sleep-cur-lv' || e.target.id === 'calc-sleep-target-lv')) {
        recalcSleepDays();
      }
    });
  }

  // --- 初始化 Wiki 模組 ---
  function initWikiModule() {
    const wikiContainer = document.getElementById('panel-wiki');
    if (!wikiContainer) return;

    if (!wikiContainer.querySelector('.wiki-main-container')) {
      renderWikiLayout(wikiContainer);
    }

    bindAllEvents();
    bindGlobalDelegationFallback();

    recalcTriggerChance();
    recalcSleepDays();
  }

  // 渲染副技能標籤
  function renderSkillBadge(skill) {
    if (!skill || !skill.name || skill.name === '-') return '<span class="text-muted">-</span>';
    const cls = skill.color ? `skill-badge-${skill.color}` : '';
    const statusNote = skill.status === 'unreleased' ? ' <span class="badge-unreleased">(未開放)</span>' : '';
    return `<span class="wiki-skill-badge ${cls}">${skill.name}${statusNote} <span class="skill-badge-val">${skill.val}</span></span>`;
  }

  // 渲染專長評級卡片
  function renderRatingCard(data) {
    return `
      <div class="wiki-card wiki-rating-card">
        <div class="wiki-card-header">
          <h3 class="wiki-card-title">${data.title}</h3>
        </div>
        <p class="wiki-card-desc">${data.desc}</p>
        
        <div class="rating-subsections">
          <div class="rating-col">
            <h4 class="rating-col-title">👑 副技能推薦梯度</h4>
            <div class="rating-list">
              ${data.subskills.map(s => `
                <div class="rating-item">
                  <span class="rating-tier-tag tier-${s.grade.toLowerCase()}">${s.grade}</span>
                  <div class="rating-item-content">
                    <span class="rating-item-name font-bold text-white">${s.name}</span>
                    <span class="rating-item-detail text-secondary">${s.detail}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="rating-col">
            <h4 class="rating-col-title">🧬 性格推薦梯度</h4>
            <div class="rating-list">
              ${data.natures.map(n => `
                <div class="rating-item">
                  <span class="rating-tier-tag tier-${n.grade.toLowerCase()}">${n.grade}</span>
                  <div class="rating-item-content">
                    <span class="rating-item-name font-bold text-white">${n.name}</span>
                    <span class="rating-item-detail text-secondary">${n.detail}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染食材天梯榜卡片
  function renderIngredientLadders(ladders) {
    return ladders.map(ing => `
      <div class="ladder-card" data-ladder-ing="${ing.id}">
        <div class="ladder-header">
          <div class="ladder-title-group">
            <img src="${ing.icon}" class="ladder-icon" alt="${ing.name}">
            <h4 class="ladder-name">${ing.name}</h4>
          </div>
          <span class="ladder-max-badge">最高日產 ~ ${ing.maxDaily} 顆</span>
        </div>

        <div class="ladder-tiers-list">
          ${ing.tiers.map(t => `
            <div class="ladder-tier-row">
              <div class="ladder-tier-info">
                <span class="ladder-pkm-name font-bold">${t.name}</span>
                <span class="ladder-count text-accent font-bold">${t.count}</span>
              </div>
              <div class="ladder-progress-bar">
                <div class="ladder-progress-fill" style="width: ${t.rate}%"></div>
              </div>
              <div class="ladder-note text-muted">${t.note}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // 渲染技能卡片 (精簡緊湊設計，蓄力與屬性加速採用互動式切換)
  function renderSkillsCards(skills) {
    return skills.map(skill => {
      let valuesHtml = '';

      if (skill.hasStackMatrix) {
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">🎯 蓄力次數切換：</span>
              <div class="stack-chips-group" id="charge-stack-chips">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
                  <button type="button" class="stack-chip-btn ${s === 10 ? 'active' : ''}" data-stack-target="${s}" onclick="window.WikiDB.switchStack(${s})">${s}次</button>
                `).join('')}
              </div>
            </div>

            <!-- 即時動態等級卡片 (預設為 10次蓄力) -->
            <div id="charge-stock-dynamic-levels" class="skill-levels-grid" style="margin-top: 8px;">
              ${skill.matrix[10].vals.map((v, i) => `
                <div class="skill-level-chip highlight-gold">
                  <span class="level-tag">Lv.${i + 1}</span>
                  <span class="level-val">${v.toLocaleString()} 能量</span>
                </div>
              `).join('')}
            </div>

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="charge-matrix-table" onclick="window.WikiDB.toggleDetail('charge-matrix-table')">
                📊 展開 / 收合完整 0~10 次蓄力數值表
              </button>
            </div>

            <div id="charge-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>蓄力次數</th>
                    ${[1, 2, 3, 4, 5, 6, 7].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.stacks === 10 ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.stacks} 次</td>
                      ${m.vals.map(v => `<td>${v.toLocaleString()}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasTypeKindsMatrix) {
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">⚡ 同屬性種類數：</span>
              <div class="stack-chips-group" id="helper-boost-chips">
                ${[0, 1, 2, 3, 4, 5].map(k => `
                  <button type="button" class="stack-chip-btn ${k === 5 ? 'active' : ''}" data-boost-kind="${k}" onclick="window.WikiDB.switchBoost(${k})">${k}種類</button>
                `).join('')}
              </div>
            </div>

            <!-- 即時動態等級卡片 (預設為 5種類) -->
            <div id="helper-boost-dynamic-levels" class="skill-levels-grid" style="margin-top: 8px;">
              ${skill.matrix[5].vals.map((v, i) => `
                <div class="skill-level-chip highlight-blue">
                  <span class="level-tag">Lv.${i + 1}</span>
                  <span class="level-val">${v} 次幫忙</span>
                </div>
              `).join('')}
            </div>

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="helper-boost-table" onclick="window.WikiDB.toggleDetail('helper-boost-table')">
                📊 展開 / 收合完整 0~5 種類對照表
              </button>
            </div>

            <div id="helper-boost-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>同屬種類</th>
                    ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.kinds === '5 種類' ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.kinds}</td>
                      ${m.vals.map(v => `<td>${v} 次</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasMoonlightChips) {
        valuesHtml = `
          <div class="skill-levels-grid">
            ${skill.selfValues.map((v, i) => `
              <div class="skill-level-chip">
                <span class="level-tag">Lv.${i + 1}</span>
                <span class="level-val">自 ${v} · 他+${skill.teamValues[i]}${skill.unit}</span>
              </div>
            `).join('')}
          </div>
          ${skill.specialNote ? `<div class="skill-special-note">${skill.specialNote}</div>` : ''}
        `;
      } else if (skill.hasLunarPrayerMatrix) {
        valuesHtml = `
          <div class="skill-levels-grid">
            ${skill.healValues.map((v, i) => `
              <div class="skill-level-chip">
                <span class="level-tag">Lv.${i + 1}</span>
                <span class="level-val">全隊 ${v}點 · 樹果 ${skill.berryRange[i]}</span>
              </div>
            `).join('')}
          </div>
          ${skill.specialNote ? `<div class="skill-special-note">${skill.specialNote}</div>` : ''}

          <!-- 展開完整 1~5 種類超能力隊友樹果對照表按鈕 -->
          <div style="margin-top: 8px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="lunar-prayer-table" onclick="window.WikiDB.toggleDetail('lunar-prayer-table')">
              📊 展開 / 收合完整 1~5 種類超能隊友樹果表
            </button>
          </div>

          <div id="lunar-prayer-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th>超能種類</th>
                  ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${skill.berryMatrix.map((m, idx) => `
                  <tr class="${idx === 4 ? 'row-highlight' : ''}">
                    <td class="font-bold text-accent">${m.kinds}</td>
                    ${m.vals.map(v => `<td>${v} 顆</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (skill.hasDualValues) {
        const selfShort = skill.selfShort || '自';
        const teamShort = skill.teamShort || '他';
        valuesHtml = `
          <div class="skill-levels-grid">
            ${skill.selfValues.map((v, i) => `
              <div class="skill-level-chip">
                <span class="level-tag">Lv.${i + 1}</span>
                <span class="level-val">${selfShort} ${v} + ${teamShort} ${skill.teamValues[i]}${skill.unit}</span>
              </div>
            `).join('')}
          </div>
          ${skill.specialNote ? `<div class="skill-special-note">${skill.specialNote}</div>` : ''}
        `;
      } else if (skill.ranges) {
        valuesHtml = `
          <div class="skill-levels-grid">
            ${skill.ranges.map((r, i) => `
              <div class="skill-level-chip">
                <span class="level-tag">Lv.${i + 1}</span>
                <span class="level-val">${r.min.toLocaleString()}~${r.max.toLocaleString()}${skill.unit}</span>
              </div>
            `).join('')}
          </div>
          ${skill.specialNote ? `<div class="skill-special-note">${skill.specialNote}</div>` : ''}
        `;
      } else if (skill.values) {
        valuesHtml = `
          <div class="skill-levels-grid">
            ${skill.values.map((v, i) => `
              <div class="skill-level-chip">
                <span class="level-tag">Lv.${i + 1}</span>
                <span class="level-val">${typeof v === 'number' ? v.toLocaleString() : v}${skill.unit}</span>
              </div>
            `).join('')}
          </div>
          ${skill.specialNote ? `<div class="skill-special-note">${skill.specialNote}</div>` : ''}
        `;
      } else {
        valuesHtml = `<div class="skill-level-chip"><span class="level-val">${skill.unit}</span></div>`;
      }

      return `
        <div class="wiki-skill-card" data-category="${skill.category}">
          <div class="skill-card-top">
            <div class="skill-icon-name">
              <span class="skill-main-icon">${skill.icon}</span>
              <div>
                <h4 class="skill-name-text">${skill.name}</h4>
                <span class="skill-cat-tag cat-${skill.category}">${skill.catName}</span>
              </div>
            </div>
            <span class="skill-max-lv-badge">上限 Lv.${skill.maxLevel}</span>
          </div>

          <p class="skill-desc-text">${skill.desc}</p>
          ${skill.penaltyNote ? `<div class="skill-penalty-banner">${skill.penaltyNote}</div>` : ''}

          <div class="skill-values-container">
            ${valuesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // 渲染 Wiki 主佈局與 4 大子分頁
  function renderWikiLayout(container) {
    container.innerHTML = `
      <div class="wiki-main-container">
        <!-- Wiki 頂部橫幅與子分頁切換 -->
        <div class="wiki-header-card">
          <div class="wiki-title-group">
            <h2 class="wiki-main-title">📚 數據百科與攻略知識庫</h2>
            <p class="wiki-subtitle">包含官方最新主技能 Lv.1~8 全數值矩陣、副技能與性格發動率計算機、三大專長評級榜及 Lv.60 食材天梯</p>
          </div>

          <!-- 二級子分頁導航 (Sub-tabs) -->
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn active" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">⚡ 主技能數值庫</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">🧩 副技能與性格指南</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">🎓 培育與評級指南</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">🥗 Lv.60 食材天梯榜</button>
          </div>
        </div>

        <!-- 子分頁 1：⚡ 主技能數值庫 (Main Skills) -->
        <div id="wiki-subpanel-skills" class="wiki-subpanel active">
          <div class="wiki-control-bar">
            <div class="wiki-filter-pills">
              <span class="wiki-pill-label">技能類型：</span>
              <button type="button" class="wiki-pill-btn active" data-skill-cat="all" onclick="window.WikiDB.filterSkills('all')">全部技能 (${MAIN_SKILLS_DATA.length})</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="energy" onclick="window.WikiDB.filterSkills('energy')">⚡ 能量系</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="energy_heal" onclick="window.WikiDB.filterSkills('energy_heal')">💖 活力系</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="ingredient" onclick="window.WikiDB.filterSkills('ingredient')">🥗 食材與料理</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="special" onclick="window.WikiDB.filterSkills('special')">👑 神獸與特殊專屬</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="shards" onclick="window.WikiDB.filterSkills('shards')">💎 夢之碎片</button>
            </div>
          </div>

          <div id="wiki-skills-grid" class="wiki-skills-grid">
            ${renderSkillsCards(MAIN_SKILLS_DATA)}
          </div>
        </div>

        <!-- 子分頁 2：🧩 副技能與性格指南 (Sub-Skills & Natures) -->
        <div id="wiki-subpanel-subskills" class="wiki-subpanel">
          <!-- 互動式主技能發動機率計算機 (Image 4 實體化) -->
          <div class="wiki-card wiki-calc-card">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🧮</span>
              <h3 class="wiki-card-title">主技能發動機率計算機（副技能 × 性格乘算矩陣）</h3>
            </div>
            <p class="wiki-card-desc">依據遊戲底層乘法公式：<code>(1 + 副技能提升%) × 性格倍率</code> 即時計算您的寶可夢發動率加成。</p>
            
            <div class="calc-inputs-row">
              <div class="calc-input-group">
                <label class="calc-label" for="calc-subskill-select">副技能組合：</label>
                <select id="calc-subskill-select" class="calc-select" onchange="window.WikiDB.recalcTriggerChance()">
                  <option value="0">無技能機率副技能 (0%)</option>
                  <option value="0.18">技能機率提升 S (+18%)</option>
                  <option value="0.36">技能機率提升 M (+36%)</option>
                  <option value="0.54" selected>STM (+36%) + STS (+18%) 雙發動 (+54%)</option>
                </select>
              </div>

              <div class="calc-input-group">
                <label class="calc-label" for="calc-nature-select">性格主技能機率：</label>
                <select id="calc-nature-select" class="calc-select" onchange="window.WikiDB.recalcTriggerChance()">
                  <option value="1.2" selected>▲▲ 技能機率上升 (x 1.20)</option>
                  <option value="1.0">無修正 / 其它性格 (x 1.00)</option>
                  <option value="0.8">▼▼ 技能機率下降 (x 0.80)</option>
                </select>
              </div>

              <div class="calc-result-box">
                <div class="calc-result-label">綜合發動機率倍率</div>
                <div id="calc-result-val" class="calc-result-val">1.848 倍</div>
                <div id="calc-result-badge" class="calc-result-badge grade-sss">SSS (頂級發動極限)</div>
              </div>
            </div>

            <!-- 速查對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 18px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>加成與修正組合</th>
                    <th>綜合倍率</th>
                    <th>評級</th>
                    <th>計算算式</th>
                  </tr>
                </thead>
                <tbody>
                  ${TRIGGER_CHANCE_MATRIX.map(row => `
                    <tr>
                      <td class="font-bold text-white">${row.combo}</td>
                      <td class="text-accent font-bold">${row.multiplier.toFixed(3)} 倍</td>
                      <td><span class="wiki-tier-badge tier-${row.grade[0].toLowerCase()}">${row.grade}</span></td>
                      <td class="text-muted">${row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 副技能完整階級與數值說明表格 (Image 5 & 1 實體化) -->
          <div class="wiki-card" style="margin-top: 24px;">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">📋</span>
              <h3 class="wiki-card-title">副技能階級與數值完整一覽表</h3>
            </div>
            <div class="wiki-rule-banner">
              ⚠️ <strong>重要規則</strong>：副技能幫忙速度（幫手獎勵 5% + 幫速M 14% + 幫速S 7%）<strong>合計上限為 35%</strong>。
            </div>
            <div class="wiki-table-wrapper">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>專長分類</th>
                    <th>階級 1 (S)</th>
                    <th>階級 2 (M)</th>
                    <th>階級 3 (L)</th>
                    <th>詳細效果說明</th>
                  </tr>
                </thead>
                <tbody>
                  ${SUB_SKILLS_DATA.map(row => `
                    <tr>
                      <td class="font-bold">${row.category}</td>
                      <td>${renderSkillBadge(row.s)}</td>
                      <td>${renderSkillBadge(row.m)}</td>
                      <td>${renderSkillBadge(row.l)}</td>
                      <td class="text-secondary">${row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 性格五維加成倍率表 (Image 2 實體化) -->
          <div class="wiki-card" style="margin-top: 24px;">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🧬</span>
              <h3 class="wiki-card-title">性格五維屬性增減倍率表</h3>
            </div>
            <div class="wiki-table-wrapper">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>屬性項目</th>
                    <th>▲▲ 增加性格 (上升效果)</th>
                    <th>▼▼ 下降性格 (下降效果)</th>
                    <th>影響機制說明</th>
                  </tr>
                </thead>
                <tbody>
                  ${NATURES_EFFECT_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-white">${row.stat}</td>
                      <td class="text-success font-bold">${row.up}</td>
                      <td class="text-danger font-bold">${row.down}</td>
                      <td class="text-secondary">${row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 3：🎓 培育與評級指南 (Ratings & Growth) -->
        <div id="wiki-subpanel-ratings" class="wiki-subpanel">
          <!-- 培育週期與核心思維 -->
          <div class="wiki-card">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🎯</span>
              <h3 class="wiki-card-title">新手與進階養成核心週期指引</h3>
            </div>
            <div class="wiki-strategy-grid">
              <div class="strategy-item">
                <div class="strategy-badge">前期目標</div>
                <div class="strategy-title">優先放置在 Lv.30</div>
                <div class="strategy-desc">先看性格與 Lv.10 & Lv.25 副技能，無課/微課約養成 2~4 個月即可解鎖第 2 種食材，成為中流砥柱。</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">後期投資</div>
                <div class="strategy-title">慎選投入 Lv.50~60</div>
                <div class="strategy-desc">確認副技能與性格皆達 Ⓢ/Ⓐ 畢業級再投入大量糖果與金種子（約需 5~10 個月養成時間）。</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">活力核心</div>
                <div class="strategy-title">優先養成一隻主力補師</div>
                <div class="strategy-desc">全體活力維持在 80% 以上可享受 2.2x~2.5x 幫忙速度！建議先練：胖可丁、仙子伊布、沙奈朵或巴布土撥。</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">種子機制</div>
                <div class="strategy-title">主技能與副技能種子規則</div>
                <div class="strategy-desc">每次進化主技能+1、持有上限+5。副技能不能同時存在相同名稱技能（如已有S與M，則S無法再升階為M）。</div>
              </div>
            </div>
          </div>

          <!-- 三大專長畢業評級榜 (Image 2 實體化) -->
          <div class="wiki-ratings-container" style="margin-top: 24px;">
            ${renderRatingCard(RATINGS_GUIDE_DATA.berry)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.ingredient)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.skill)}
          </div>

          <!-- 睡眠天數升級試算器 (Image 2 實體化) -->
          <div class="wiki-card wiki-calc-card" style="margin-top: 24px;">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🌙</span>
              <h3 class="wiki-card-title">寶可夢睡眠升級天數計算器</h3>
            </div>
            <p class="wiki-card-desc">依據每日睡滿 100 分（100 EXP 基礎），計算從目前等級升至目標等級所需睡眠天數與經驗值。</p>
            
            <div class="calc-inputs-row">
              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-cur-lv">目前等級：</label>
                <input type="number" id="calc-sleep-cur-lv" class="calc-input-num" value="1" min="1" max="59" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-target-lv">目標等級：</label>
                <input type="number" id="calc-sleep-target-lv" class="calc-input-num" value="30" min="2" max="60" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label">加成條件：</label>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 4px;">
                  <label><input type="checkbox" id="calc-sleep-exp-subskill" onchange="window.WikiDB.recalcSleepDays()"> 睡眠EXP獎勵 (+14%)</label>
                  <label><input type="checkbox" id="calc-sleep-incense" onchange="window.WikiDB.recalcSleepDays()"> 成長薰香 (2x)</label>
                  <select id="calc-sleep-nature-select" class="calc-select" style="width: auto; padding: 4px 8px;" onchange="window.WikiDB.recalcSleepDays()">
                    <option value="1.0">性格無 EXP 修正</option>
                    <option value="1.18">性格 EXP ▲▲ (+18%)</option>
                    <option value="0.82">性格 EXP ▼▼ (-18%)</option>
                  </select>
                </div>
              </div>

              <div class="calc-result-box">
                <div class="calc-result-label">預估所需睡眠天數</div>
                <div id="calc-sleep-days-result" class="calc-result-val">120 天</div>
                <div id="calc-sleep-exp-result" class="calc-result-badge">約需 12,000 EXP</div>
              </div>
            </div>

            <!-- 基準天數對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 18px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>目標等級</th>
                    <th>累計所需 EXP</th>
                    <th>無加成睡眠天數 (每天100EXP)</th>
                    <th>里程碑意義</th>
                  </tr>
                </thead>
                <tbody>
                  ${SLEEP_DAYS_BASELINE.map(row => `
                    <tr>
                      <td class="font-bold text-accent">Lv. ${row.level}</td>
                      <td class="font-bold">${row.totalExp.toLocaleString()} EXP</td>
                      <td class="text-success font-bold">${row.days} 天 (搭配活動約 ${Math.ceil(row.days / 2)} 天)</td>
                      <td class="text-secondary">${row.note}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 4：🥗 Lv.60 食材天梯榜 (Lv.60 Ingredients Ladder) -->
        <div id="wiki-subpanel-ingredients" class="wiki-subpanel">
          <div class="wiki-card">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🥗</span>
              <h3 class="wiki-card-title">Lv.60 各食材單日產量天梯榜（無補正基準）</h3>
            </div>
            <p class="wiki-card-desc">依據 @SwabluPksl 與 RaenonX 實測統計，展示各寶可夢在 Lv.60 滿等、無副技能與性格修正下的基礎單日產量排行榜。</p>

            <!-- 食材快速篩選 Pills -->
            <div class="wiki-filter-pills" style="margin: 16px 0 20px;">
              <span class="wiki-pill-label">選擇食材：</span>
              <button type="button" class="wiki-pill-btn active" data-ing-filter="all" onclick="window.WikiDB.filterIngredients('all')">全部食材 (${LV60_INGREDIENTS_LADDER.length})</button>
              ${LV60_INGREDIENTS_LADDER.map(ing => `
                <button type="button" class="wiki-pill-btn" data-ing-filter="${ing.id}" onclick="window.WikiDB.filterIngredients('${ing.id}')">
                  <img src="${ing.icon}" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;">${ing.name}
                </button>
              `).join('')}
            </div>

            <!-- 食材天梯卡片清單 -->
            <div id="wiki-ingredient-ladder-grid" class="wiki-ladder-grid">
              ${renderIngredientLadders(LV60_INGREDIENTS_LADDER)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 導出全局命名空間與公共函數 (支援 window.WikiDB 及 window 全域名稱)
  const WikiDBExport = {
    MAIN_SKILLS_DATA,
    SUB_SKILLS_DATA,
    TRIGGER_CHANCE_MATRIX,
    NATURES_EFFECT_DATA,
    RATINGS_GUIDE_DATA,
    SLEEP_DAYS_BASELINE,
    LV60_INGREDIENTS_LADDER,
    init: initWikiModule,
    renderWikiLayout: renderWikiLayout,
    switchSubTab: switchWikiSubTab,
    filterSkills: filterWikiSkills,
    filterIngredients: filterWikiIngredients,
    switchStack: switchChargeStock,
    switchBoost: switchHelperBoost,
    toggleDetail: toggleDetailTable,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays
  };

  window.WikiDB = WikiDBExport;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  window.switchWikiSubTab = switchWikiSubTab;
  window.filterWikiSkills = filterWikiSkills;
  window.filterWikiIngredients = filterWikiIngredients;
  window.switchChargeStock = switchChargeStock;
  window.switchHelperBoost = switchHelperBoost;
  window.toggleDetailTable = toggleDetailTable;
  window.recalcTriggerChance = recalcTriggerChance;
  window.recalcSleepDays = recalcSleepDays;

  // 當 DOM 準備完成時自動初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWikiModule);
  } else {
    initWikiModule();
  }

})();
