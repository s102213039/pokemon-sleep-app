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

  // --- 2. 副技能完整階級與數值資料庫 (Sub-Skills Data - 僅列出官方已開放副技能) ---
  const SUB_SKILLS_DATA = [
    {
      category: "持有上限",
      skills: [
        { name: "持有上限提升 S", color: "white", val: "+6 個" },
        { name: "持有上限提升 M", color: "blue", val: "+12 個" },
        { name: "持有上限提升 L", color: "blue", val: "+18 個" }
      ],
      desc: "可持有的樹果與食材上限提升 +6 / +12 / +18 個（避免睡眠溢出）"
    },
    {
      category: "幫忙速度",
      skills: [
        { name: "幫忙速度 S", color: "white", val: "-7%" },
        { name: "幫忙速度 M", color: "blue", val: "-14%" }
      ],
      desc: "提供幫助所需的時間減少 7% / 14%（副技能幫速合計上限 35%）"
    },
    {
      category: "技能機率",
      skills: [
        { name: "技能機率提升 S", color: "white", val: "+18%" },
        { name: "技能機率提升 M", color: "blue", val: "+36%" }
      ],
      desc: "主技能發動機率提升 18% / 36%（技能型寶可夢核心畢業副技）"
    },
    {
      category: "食材機率",
      skills: [
        { name: "食材機率提升 S", color: "white", val: "+18%" },
        { name: "食材機率提升 M", color: "blue", val: "+36%" }
      ],
      desc: "發現食材的機率提升 18% / 36%（食材型寶可夢核心畢業副技）"
    },
    {
      category: "樹果數量",
      skills: [
        { name: "樹果數量 S", color: "gold", val: "+1 個" }
      ],
      desc: "每次找到樹果的數量 +1 個（樹果型寶可夢最強 T0 核心）"
    },
    {
      category: "技能等級",
      skills: [
        { name: "技能等級提升 S", color: "blue", val: "+1 級" },
        { name: "技能等級提升 M", color: "gold", val: "+2 級" }
      ],
      desc: "主技能等級提升 1 / 2 級（省下主技能金種子珍貴資源）"
    },
    {
      category: "全隊幫忙",
      skills: [
        { name: "幫手獎勵", color: "gold", val: "全隊 -5%" }
      ],
      desc: "全隊提供幫助時間減少 5%（隊伍最多疊加 5 隻 = 25%）"
    },
    {
      category: "全隊活力",
      skills: [
        { name: "活力恢復獎勵", color: "gold", val: "全隊 1.12x" }
      ],
      desc: "全隊睡眠活力恢復量提高 1.12 倍（可彌補性格活力下降隊友）"
    },
    {
      category: "全隊經驗",
      skills: [
        { name: "睡眠 EXP 獎勵", color: "gold", val: "全隊 +14%" }
      ],
      desc: "全隊睡眠結算獲得 EXP 提高 14%（大幅加速全隊成長）"
    },
    {
      category: "研究經驗",
      skills: [
        { name: "研究 EXP 獎勵", color: "gold", val: "個人 +6%" }
      ],
      desc: "玩家睡眠結算獲得的研究 EXP 提高 6%（加快研究等級升級）"
    },
    {
      category: "夢之碎片",
      skills: [
        { name: "夢之碎片獎勵", color: "gold", val: "個人 +6%" }
      ],
      desc: "睡眠結算獲得夢之碎片數量提高 6%（可與幸運薰香疊加）"
    }
  ];

  // 主技能機率矩陣速查表 (副技能 × 性格全排列)
  const TRIGGER_CHANCE_MATRIX = [
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" },
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.54 × 1.20",
      multiplier: 1.848,
      grade: "SSS (頂級極限)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.36 × 1.20",
      multiplier: 1.632,
      grade: "SS (優秀極限)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" },
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.54 × 1.00",
      multiplier: 1.530,
      grade: "S (雙副技無性格)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.18 × 1.20",
      multiplier: 1.416,
      grade: "A (單副技+性格)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.36 × 1.00",
      multiplier: 1.360,
      grade: "A (單STM無性格)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" },
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.54 × 0.80",
      multiplier: 1.232,
      grade: "B (雙副技補回性格)"
    },
    {
      subskills: [],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.00 × 1.20",
      multiplier: 1.200,
      grade: "B (純性格無副技)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.18 × 1.00",
      multiplier: 1.180,
      grade: "B (純STS無性格)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.36 × 0.80",
      multiplier: 1.088,
      grade: "C (STM抵銷性格下修)"
    },
    {
      subskills: [],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.00 × 1.00",
      multiplier: 1.000,
      grade: "基準線 (1.00x)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.18 × 0.80",
      multiplier: 0.944,
      grade: "D (微幅受阻)"
    },
    {
      subskills: [],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.00 × 0.80",
      multiplier: 0.800,
      grade: "E (嚴重削弱)"
    }
  ];

  // 性格五維倍率表 (包含官方最新數值與下降懲罰減輕修正)
  const NATURES_EFFECT_DATA = [
    { stat: "幫忙速度", up: "▲▲ +10% (間隔 ÷1.10 = 0.909x)", down: "▼▼ -7.5% (間隔 ×1.075 = 0.925x)", desc: "影響所有樹果、食材與技能判定頻率（官方已將下降懲罰調輕至 -7.5%）" },
    { stat: "活力回復量", up: "▲▲ +20% (1.20 倍)", down: "▼▼ -12% (0.88 倍)", desc: "影響睡眠與隊伍補師回復量（Ver 1.0.13 已將下降懲罰調輕至 -12%）" },
    { stat: "食材發現率", up: "▲▲ +20% (1.20 倍)", down: "▼▼ -20% (0.80 倍)", desc: "每次幫忙時判定獲得食材的機率" },
    { stat: "主技能機率", up: "▲▲ +20% (1.20 倍)", down: "▼▼ -20% (0.80 倍)", desc: "每次幫忙時判定觸發主技能的機率" },
    { stat: "EXP 獲得量", up: "▲▲ +18% (1.18 倍)", down: "▼▼ -18% (0.82 倍)", desc: "影響睡眠結算與糖果升級經驗值（5 顆糖多/少約 1 顆）" }
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

  // --- 4. 樹果與食材基礎能量資料庫 (Image 1 實體化 - Berry & Ingredient Values) ---
  const BERRY_VALUES_DATA = [
    { id: 'pamtre', name: '椰木果', type: '飛行', energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
    { id: 'lum',    name: '木子果', type: '蟲',   energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
    { id: 'grepa',  name: '異奇果', type: '電',   energy: 25, icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
    { id: 'bluk',   name: '檬果',   type: '幽靈', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
    { id: 'pecha',  name: '桃桃果', type: '妖精', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' },
    { id: 'mago',   name: '芒念果', type: '超能', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
    { id: 'leppa',  name: '蘋野果', type: '火',   energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
    { id: 'cheri',  name: '櫻子果', type: '格鬥', energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
    { id: 'persim', name: '柿仔果', type: '一般', energy: 28, icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
    { id: 'figy',   name: '勿花果', type: '地面', energy: 29, icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
    { id: 'sitrus', name: '文柚果', type: '岩石', energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
    { id: 'durin',  name: '榴石果', type: '草',   energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
    { id: 'oran',   name: '橙橙果', type: '水',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
    { id: 'wiki',   name: '芭拉果', type: '惡',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
    { id: 'chesto', name: '零餘果', type: '毒',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png' },
    { id: 'rawst',  name: '生薑果', type: '冰',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
    { id: 'belue',  name: '靛莓果', type: '鋼',   energy: 33, icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
    { id: 'yache',  name: '巧可果', type: '龍',   energy: 35, icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' }
  ];

  const INGREDIENT_VALUES_DATA = [
    { id: "apple", name: "特選蘋果", enName: "Fancy Apple", energy: 90, icon: "https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png" },
    { id: "milk", name: "哞哞鮮奶", enName: "Moomoo Milk", energy: 98, icon: "https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png" },
    { id: "soybeans", name: "萌綠大豆", enName: "Greengrass Soybeans", energy: 100, icon: "https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png" },
    { id: "honey", name: "甜甜蜜", enName: "Honey", energy: 101, icon: "https://www.serebii.net/pokemonsleep/ingredients/honey.png" },
    { id: "sausage", name: "豆製肉", enName: "Bean Sausage", energy: 103, icon: "https://www.serebii.net/pokemonsleep/ingredients/beansausage.png" },
    { id: "ginger", name: "暖暖薑", enName: "Warming Ginger", energy: 109, icon: "https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png" },
    { id: "tomato", name: "好眠番茄", enName: "Snoozy Tomato", energy: 110, icon: "https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png" },
    { id: "egg", name: "特選蛋", enName: "Fancy Egg", energy: 115, icon: "https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png" },
    { id: "oil", name: "純粹油", enName: "Pure Oil", energy: 121, icon: "https://www.serebii.net/pokemonsleep/ingredients/pureoil.png" },
    { id: "potato", name: "窩心洋芋", enName: "Soft Potato", energy: 124, icon: "https://www.serebii.net/pokemonsleep/ingredients/softpotato.png" },
    { id: "herb", name: "火辣香草", enName: "Fiery Herb", energy: 130, icon: "https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png" },
    { id: "corn", name: "萌綠玉米", enName: "Greengrass Corn", energy: 140, icon: "https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png" },
    { id: "cacao", name: "放鬆可可", enName: "Soothing Cacao", energy: 151, icon: "https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png" },
    { id: "coffee", name: "醒腦咖啡豆", enName: "Rousing Coffee", energy: 153, icon: "https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png" },
    { id: "glossyavocado", name: "嫩亮酪梨", enName: "Glossy Avocado", energy: 162, icon: "https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png" },
    { id: "mushroom", name: "品鮮蘑菇", enName: "Tasty Mushroom", energy: 167, icon: "https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png" },
    { id: "leek", name: "粗枝大蔥", enName: "Large Leek", energy: 185, icon: "https://www.serebii.net/pokemonsleep/ingredients/largeleek.png" },
    { id: "pumpkin", name: "沉甸甸南瓜", enName: "Plump Pumpkin", energy: 250, icon: "https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png" },
    { id: "tail", name: "美味尾巴", enName: "Slowpoke Tail", energy: 342, icon: "https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png" }
  ];

  // --- 5. Lv.60 視覺橫向天梯座標圖資料庫 (Image 2 實體化 - Coordinate Ladder Data) ---
  const LV60_COORDINATE_LADDER_DATA = [
    {
        "id": "apple",
        "name": "特選蘋果",
        "energy": 90,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png",
        "pokemon": [
            {
                "name": "骨紋巨聲鱷",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "AAA",
                "count": 91,
                "note": "👑 TOP 1 AAA 特選蘋果 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 91,
                        "note": "👑 TOP 1 AAA 特選蘋果 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 49,
                        "note": "AAC 雙特選蘋果 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 單特選蘋果 混產"
                    }
                ]
            },
            {
                "name": "阿勃梭魯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "ABB",
                "count": 86,
                "note": "ABB 特選蘋果 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 86,
                        "note": "ABB 特選蘋果 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 43,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "凱羅斯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                "recipe": "ABB",
                "count": 68,
                "note": "ABB 特選蘋果 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 68,
                        "note": "ABB 特選蘋果 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 34,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "信使鳥",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                "recipe": "ABB",
                "count": 68,
                "note": "ABB 特選蘋果 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 68,
                        "note": "ABB 特選蘋果 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 34,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "水君",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/245.png",
                "recipe": "AAA",
                "count": 47,
                "note": "AAA 特選蘋果 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 47,
                        "note": "AAA 特選蘋果 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 25,
                        "note": "AAC 雙特選蘋果 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單特選蘋果 混產"
                    }
                ]
            },
            {
                "name": "拉達",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/020.png",
                "recipe": "AAA",
                "count": 40,
                "note": "AAA 特選蘋果 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 40,
                        "note": "AAA 特選蘋果 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 雙特選蘋果 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單特選蘋果 混產"
                    }
                ]
            },
            {
                "name": "哥達鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/055.png",
                "recipe": "ABB",
                "count": 39,
                "note": "ABB 特選蘋果 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 39,
                        "note": "ABB 特選蘋果 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "milk",
        "name": "哞哞鮮奶",
        "energy": 98,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png",
        "pokemon": [
            {
                "name": "水箭龜",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                "recipe": "AAA",
                "count": 93,
                "note": "👑 TOP 1 AAA 哞哞鮮奶 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 93,
                        "note": "👑 TOP 1 AAA 哞哞鮮奶 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 50,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            },
            {
                "name": "魔幻假面喵",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                "recipe": "ABB",
                "count": 69,
                "note": "ABB 哞哞鮮奶 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 69,
                        "note": "ABB 哞哞鮮奶 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 34,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849.png",
                "recipe": "AAA",
                "count": 40,
                "note": "AAA 哞哞鮮奶 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 40,
                        "note": "AAA 哞哞鮮奶 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            },
            {
                "name": "月亮伊布",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/197.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 哞哞鮮奶 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 哞哞鮮奶 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            },
            {
                "name": "冰伊布",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/471.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 哞哞鮮奶 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 哞哞鮮奶 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            },
            {
                "name": "水伊布",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/134.png",
                "recipe": "AAA",
                "count": 36,
                "note": "AAA 哞哞鮮奶 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 36,
                        "note": "AAA 哞哞鮮奶 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            },
            {
                "name": "葉伊布",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/470.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 哞哞鮮奶 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 哞哞鮮奶 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 雙哞哞鮮奶 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單哞哞鮮奶 混產"
                    }
                ]
            }
        ]
    },
    {
        "id": "soybeans",
        "name": "萌綠大豆",
        "energy": 100,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png",
        "pokemon": [
            {
                "name": "老翁龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                "recipe": "AAA",
                "count": 99,
                "note": "👑 TOP 1 AAA 萌綠大豆 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 99,
                        "note": "👑 TOP 1 AAA 萌綠大豆 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 53,
                        "note": "AAC 雙萌綠大豆 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 單萌綠大豆 混產"
                    }
                ]
            },
            {
                "name": "隆隆岩",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                "recipe": "AAA",
                "count": 95,
                "note": "AAA 萌綠大豆 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 95,
                        "note": "AAA 萌綠大豆 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 51,
                        "note": "AAC 雙萌綠大豆 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 24,
                        "note": "ABB 單萌綠大豆 混產"
                    }
                ]
            },
            {
                "name": "南瓜怪人",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "ABB",
                "count": 91,
                "note": "ABB 萌綠大豆 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 91,
                        "note": "ABB 萌綠大豆 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 46,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "班基拉斯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                "recipe": "ABB",
                "count": 84,
                "note": "ABB 萌綠大豆 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 84,
                        "note": "ABB 萌綠大豆 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 42,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "狂歡浪舞鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                "recipe": "AAA",
                "count": 78,
                "note": "AAA 萌綠大豆 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 78,
                        "note": "AAA 萌綠大豆 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 42,
                        "note": "AAC 雙萌綠大豆 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 單萌綠大豆 混產"
                    }
                ]
            },
            {
                "name": "沙漠蜻蜓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "AAC",
                "count": 50,
                "note": "AAC 萌綠大豆 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 50,
                        "note": "AAC 萌綠大豆 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "波士可多拉",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "AAC",
                "count": 48,
                "note": "AAC 萌綠大豆 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 48,
                        "note": "AAC 萌綠大豆 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "honey",
        "name": "甜甜蜜",
        "energy": 101,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/honey.png",
        "pokemon": [
            {
                "name": "妙蛙花",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                "recipe": "AAA",
                "count": 90,
                "note": "👑 TOP 1 AAA 甜甜蜜 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 90,
                        "note": "👑 TOP 1 AAA 甜甜蜜 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 49,
                        "note": "AAC 雙甜甜蜜 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 22,
                        "note": "ABB 單甜甜蜜 混產"
                    }
                ]
            },
            {
                "name": "凱羅斯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                "recipe": "AAA",
                "count": 73,
                "note": "AAA 甜甜蜜 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 73,
                        "note": "AAA 甜甜蜜 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 39,
                        "note": "AAC 雙甜甜蜜 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 18,
                        "note": "ABB 單甜甜蜜 混產"
                    }
                ]
            },
            {
                "name": "蝶結萌虻",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                "recipe": "AAA",
                "count": 66,
                "note": "AAA 甜甜蜜 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 66,
                        "note": "AAA 甜甜蜜 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 36,
                        "note": "AAC 雙甜甜蜜 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單甜甜蜜 混產"
                    }
                ]
            },
            {
                "name": "鍬農炮蟲",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "AAC",
                "count": 52,
                "note": "AAC 甜甜蜜 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 52,
                        "note": "AAC 甜甜蜜 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "請假王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                "recipe": "ABB",
                "count": 49,
                "note": "ABB 甜甜蜜 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 49,
                        "note": "ABB 甜甜蜜 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "吉利蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/113.png",
                "recipe": "AAC",
                "count": 46,
                "note": "AAC 甜甜蜜 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 46,
                        "note": "AAC 甜甜蜜 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "幸福蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "AAC",
                "count": 46,
                "note": "AAC 甜甜蜜 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 46,
                        "note": "AAC 甜甜蜜 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "sausage",
        "name": "豆製肉",
        "energy": 103,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/beansausage.png",
        "pokemon": [
            {
                "name": "波士可多拉",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "AAA",
                "count": 96,
                "note": "👑 TOP 1 AAA 豆製肉 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 96,
                        "note": "👑 TOP 1 AAA 豆製肉 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 52,
                        "note": "AAC 雙豆製肉 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 24,
                        "note": "ABB 單豆製肉 混產"
                    }
                ]
            },
            {
                "name": "穿著熊",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "ABB",
                "count": 89,
                "note": "ABB 豆製肉 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 89,
                        "note": "ABB 豆製肉 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 44,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "大蔥鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "ABB",
                "count": 81,
                "note": "ABB 豆製肉 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 81,
                        "note": "ABB 豆製肉 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 40,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "噴火龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "AAA",
                "count": 76,
                "note": "AAA 豆製肉 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 76,
                        "note": "AAA 豆製肉 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 雙豆製肉 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 單豆製肉 混產"
                    }
                ]
            },
            {
                "name": "毒骷蛙",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/454.png",
                "recipe": "ABB",
                "count": 72,
                "note": "ABB 豆製肉 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 72,
                        "note": "ABB 豆製肉 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 36,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "浩大鯨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "ABB",
                "count": 71,
                "note": "ABB 豆製肉 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 71,
                        "note": "ABB 豆製肉 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 36,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "骨紋巨聲鱷",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "ABB",
                "count": 65,
                "note": "ABB 豆製肉 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 65,
                        "note": "ABB 豆製肉 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "ginger",
        "name": "暖暖薑",
        "energy": 109,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png",
        "pokemon": [
            {
                "name": "班基拉斯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                "recipe": "AAA",
                "count": 90,
                "note": "👑 TOP 1 AAA 暖暖薑 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 90,
                        "note": "👑 TOP 1 AAA 暖暖薑 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 49,
                        "note": "AAC 雙暖暖薑 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 22,
                        "note": "ABB 單暖暖薑 混產"
                    }
                ]
            },
            {
                "name": "袋獸",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/115.png",
                "recipe": "AAA",
                "count": 75,
                "note": "AAA 暖暖薑 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 75,
                        "note": "AAA 暖暖薑 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 40,
                        "note": "AAC 雙暖暖薑 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 單暖暖薑 混產"
                    }
                ]
            },
            {
                "name": "花療環環",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                "recipe": "ABB",
                "count": 61,
                "note": "ABB 暖暖薑 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 61,
                        "note": "ABB 暖暖薑 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 30,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "噴火龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "ABB",
                "count": 60,
                "note": "ABB 暖暖薑 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 60,
                        "note": "ABB 暖暖薑 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 30,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "大蔥鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "AAC",
                "count": 46,
                "note": "AAC 暖暖薑 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 46,
                        "note": "AAC 暖暖薑 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "克雷色利亞",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                "recipe": "AAA",
                "count": 40,
                "note": "AAA 暖暖薑 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 40,
                        "note": "AAA 暖暖薑 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 雙暖暖薑 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單暖暖薑 混產"
                    }
                ]
            },
            {
                "name": "嘎啦嘎啦",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/105.png",
                "recipe": "AAA",
                "count": 38,
                "note": "AAA 暖暖薑 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 38,
                        "note": "AAA 暖暖薑 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 雙暖暖薑 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單暖暖薑 混產"
                    }
                ]
            }
        ]
    },
    {
        "id": "tomato",
        "name": "好眠番茄",
        "energy": 110,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png",
        "pokemon": [
            {
                "name": "暴雪王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "AAA",
                "count": 85,
                "note": "👑 TOP 1 AAA 好眠番茄 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 85,
                        "note": "👑 TOP 1 AAA 好眠番茄 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 46,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 21,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            },
            {
                "name": "大食花",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                "recipe": "AAA",
                "count": 79,
                "note": "AAA 好眠番茄 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 79,
                        "note": "AAA 好眠番茄 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            },
            {
                "name": "魔牆人偶",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                "recipe": "AAA",
                "count": 73,
                "note": "AAA 好眠番茄 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 73,
                        "note": "AAA 好眠番茄 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 39,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 18,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            },
            {
                "name": "妙蛙花",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                "recipe": "ABB",
                "count": 71,
                "note": "ABB 好眠番茄 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 71,
                        "note": "ABB 好眠番茄 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 36,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "AAA",
                "count": 68,
                "note": "AAA 好眠番茄 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 68,
                        "note": "AAA 好眠番茄 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            },
            {
                "name": "三地鼠",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                "recipe": "AAA",
                "count": 64,
                "note": "AAA 好眠番茄 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 64,
                        "note": "AAA 好眠番茄 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            },
            {
                "name": "請假王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                "recipe": "AAA",
                "count": 57,
                "note": "AAA 好眠番茄 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 57,
                        "note": "AAA 好眠番茄 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 31,
                        "note": "AAC 雙好眠番茄 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 單好眠番茄 混產"
                    }
                ]
            }
        ]
    },
    {
        "id": "egg",
        "name": "特選蛋",
        "energy": 115,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png",
        "pokemon": [
            {
                "name": "幸福蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "AAA",
                "count": 81,
                "note": "👑 TOP 1 AAA 特選蛋 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 81,
                        "note": "👑 TOP 1 AAA 特選蛋 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 44,
                        "note": "AAC 雙特選蛋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 單特選蛋 混產"
                    }
                ]
            },
            {
                "name": "吉利蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/113.png",
                "recipe": "AAA",
                "count": 80,
                "note": "AAA 特選蛋 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 80,
                        "note": "AAA 特選蛋 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 雙特選蛋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 單特選蛋 混產"
                    }
                ]
            },
            {
                "name": "暴雪王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "ABB",
                "count": 66,
                "note": "ABB 特選蛋 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 66,
                        "note": "ABB 特選蛋 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 33,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "信使鳥",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                "recipe": "AAA",
                "count": 64,
                "note": "AAA 特選蛋 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 64,
                        "note": "AAA 特選蛋 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙特選蛋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單特選蛋 混產"
                    }
                ]
            },
            {
                "name": "穿著熊",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "AAC",
                "count": 50,
                "note": "AAC 特選蛋 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 50,
                        "note": "AAC 特選蛋 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "七夕青鳥",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/334.png",
                "recipe": "AAA",
                "count": 44,
                "note": "AAA 特選蛋 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 44,
                        "note": "AAA 特選蛋 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 雙特選蛋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單特選蛋 混產"
                    }
                ]
            },
            {
                "name": "阿柏怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/024.png",
                "recipe": "ABB",
                "count": 32,
                "note": "ABB 特選蛋 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 32,
                        "note": "ABB 特選蛋 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "oil",
        "name": "純粹油",
        "energy": 121,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/pureoil.png",
        "pokemon": [
            {
                "name": "毒骷蛙",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/454.png",
                "recipe": "AAA",
                "count": 77,
                "note": "👑 TOP 1 AAA 純粹油 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 77,
                        "note": "👑 TOP 1 AAA 純粹油 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 42,
                        "note": "AAC 雙純粹油 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 單純粹油 混產"
                    }
                ]
            },
            {
                "name": "大嘴娃",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                "recipe": "AAA",
                "count": 69,
                "note": "AAA 純粹油 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 69,
                        "note": "AAA 純粹油 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 雙純粹油 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 單純粹油 混產"
                    }
                ]
            },
            {
                "name": "百變怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "AAA",
                "count": 68,
                "note": "AAA 純粹油 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 68,
                        "note": "AAA 純粹油 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 雙純粹油 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 單純粹油 混產"
                    }
                ]
            },
            {
                "name": "古月鳥",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/845.png",
                "recipe": "AAA",
                "count": 56,
                "note": "AAA 純粹油 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 56,
                        "note": "AAA 純粹油 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 30,
                        "note": "AAC 雙純粹油 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 單純粹油 混產"
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "ABB",
                "count": 53,
                "note": "ABB 純粹油 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 53,
                        "note": "ABB 純粹油 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "快龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "AAC",
                "count": 51,
                "note": "AAC 純粹油 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 51,
                        "note": "AAC 純粹油 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "蝶結萌虻",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                "recipe": "ABB",
                "count": 47,
                "note": "ABB 純粹油 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 47,
                        "note": "ABB 純粹油 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "potato",
        "name": "窩心洋芋",
        "energy": 124,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/softpotato.png",
        "pokemon": [
            {
                "name": "烏波",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/194.png",
                "recipe": "ABB",
                "count": 78,
                "note": "👑 TOP 1 ABB 窩心洋芋 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 78,
                        "note": "👑 TOP 1 ABB 窩心洋芋 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "ABC",
                        "count": 39,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "沼王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                "recipe": "ABB",
                "count": 73,
                "note": "ABB 窩心洋芋 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 73,
                        "note": "ABB 窩心洋芋 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 36,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "浩大鯨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "AAA",
                "count": 71,
                "note": "AAA 窩心洋芋 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 71,
                        "note": "AAA 窩心洋芋 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙窩心洋芋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 18,
                        "note": "ABB 單窩心洋芋 混產"
                    }
                ]
            },
            {
                "name": "隆隆岩",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                "recipe": "ABB",
                "count": 68,
                "note": "ABB 窩心洋芋 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 68,
                        "note": "ABB 窩心洋芋 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 34,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "魔幻假面喵",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                "recipe": "AAA",
                "count": 64,
                "note": "AAA 窩心洋芋 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 64,
                        "note": "AAA 窩心洋芋 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙窩心洋芋 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單窩心洋芋 混產"
                    }
                ]
            },
            {
                "name": "吉利蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/113.png",
                "recipe": "ABB",
                "count": 63,
                "note": "ABB 窩心洋芋 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 63,
                        "note": "ABB 窩心洋芋 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "幸福蛋",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "ABB",
                "count": 63,
                "note": "ABB 窩心洋芋 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 63,
                        "note": "ABB 窩心洋芋 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "herb",
        "name": "火辣香草",
        "energy": 130,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png",
        "pokemon": [
            {
                "name": "快龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "AAA",
                "count": 89,
                "note": "👑 TOP 1 AAA 火辣香草 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 89,
                        "note": "👑 TOP 1 AAA 火辣香草 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 48,
                        "note": "AAC 雙火辣香草 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 22,
                        "note": "ABB 單火辣香草 混產"
                    }
                ]
            },
            {
                "name": "沙漠蜻蜓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "ABB",
                "count": 62,
                "note": "ABB 火辣香草 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 62,
                        "note": "ABB 火辣香草 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 31,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "耿鬼",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                "recipe": "AAA",
                "count": 54,
                "note": "AAA 火辣香草 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 54,
                        "note": "AAA 火辣香草 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 29,
                        "note": "AAC 雙火辣香草 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 單火辣香草 混產"
                    }
                ]
            },
            {
                "name": "黑魯加",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/229.png",
                "recipe": "AAA",
                "count": 34,
                "note": "AAA 火辣香草 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 34,
                        "note": "AAA 火辣香草 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "噴火龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "AAC",
                "count": 32,
                "note": "AAC 火辣香草 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 火辣香草 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "骨紋巨聲鱷",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "AAC",
                "count": 32,
                "note": "AAC 火辣香草 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 火辣香草 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "摔角鷹人",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/701.png",
                "recipe": "AAA",
                "count": 26,
                "note": "AAA 火辣香草 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 26,
                        "note": "AAA 火辣香草 兼顧",
                        "isTop": false
                    }
                ]
            }
        ]
    },
    {
        "id": "corn",
        "name": "萌綠玉米",
        "energy": 140,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png",
        "pokemon": [
            {
                "name": "穿著熊",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "AAA",
                "count": 77,
                "note": "👑 TOP 1 AAA 萌綠玉米 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 77,
                        "note": "👑 TOP 1 AAA 萌綠玉米 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 42,
                        "note": "AAC 雙萌綠玉米 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 單萌綠玉米 混產"
                    }
                ]
            },
            {
                "name": "快龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "ABB",
                "count": 70,
                "note": "ABB 萌綠玉米 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 70,
                        "note": "ABB 萌綠玉米 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 35,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "花療環環",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                "recipe": "AAA",
                "count": 56,
                "note": "AAA 萌綠玉米 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 56,
                        "note": "AAA 萌綠玉米 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 30,
                        "note": "AAC 雙萌綠玉米 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 單萌綠玉米 混產"
                    }
                ]
            },
            {
                "name": "大嘴娃",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                "recipe": "ABB",
                "count": 49,
                "note": "ABB 萌綠玉米 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 49,
                        "note": "ABB 萌綠玉米 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "土王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 萌綠玉米 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 萌綠玉米 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "穿山王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                "recipe": "ABB",
                "count": 26,
                "note": "ABB 萌綠玉米 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 26,
                        "note": "ABB 萌綠玉米 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "巨沼怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/260.png",
                "recipe": "AAA",
                "count": 25,
                "note": "AAA 萌綠玉米 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 25,
                        "note": "AAA 萌綠玉米 兼顧",
                        "isTop": false
                    }
                ]
            }
        ]
    },
    {
        "id": "cacao",
        "name": "放鬆可可",
        "energy": 151,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png",
        "pokemon": [
            {
                "name": "土王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                "recipe": "AAA",
                "count": 70,
                "note": "👑 TOP 1 AAA 放鬆可可 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 70,
                        "note": "👑 TOP 1 AAA 放鬆可可 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙放鬆可可 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 18,
                        "note": "ABB 單放鬆可可 混產"
                    }
                ]
            },
            {
                "name": "阿勃梭魯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "AAA",
                "count": 60,
                "note": "AAA 放鬆可可 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 60,
                        "note": "AAA 放鬆可可 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 雙放鬆可可 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 15,
                        "note": "ABB 單放鬆可可 混產"
                    }
                ]
            },
            {
                "name": "水箭龜",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                "recipe": "ABB",
                "count": 53,
                "note": "ABB 放鬆可可 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 53,
                        "note": "ABB 放鬆可可 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "呆殼獸",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                "recipe": "AAA",
                "count": 33,
                "note": "AAA 放鬆可可 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 33,
                        "note": "AAA 放鬆可可 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "大竺葵",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/154.png",
                "recipe": "AAA",
                "count": 30,
                "note": "AAA 放鬆可可 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 30,
                        "note": "AAA 放鬆可可 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "伊布（萬聖節）",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                "recipe": "ABB",
                "count": 29,
                "note": "ABB 放鬆可可 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 29,
                        "note": "ABB 放鬆可可 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "克雷色利亞",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                "recipe": "ABB",
                "count": 29,
                "note": "ABB 放鬆可可 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 29,
                        "note": "ABB 放鬆可可 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "coffee",
        "name": "醒腦咖啡豆",
        "energy": 153,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png",
        "pokemon": [
            {
                "name": "鍬農炮蟲",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "AAA",
                "count": 66,
                "note": "👑 TOP 1 AAA 醒腦咖啡豆 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 66,
                        "note": "👑 TOP 1 AAA 醒腦咖啡豆 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 36,
                        "note": "AAC 雙醒腦咖啡豆 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單醒腦咖啡豆 混產"
                    }
                ]
            },
            {
                "name": "土王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                "recipe": "ABB",
                "count": 55,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 55,
                        "note": "ABB 醒腦咖啡豆 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "波士可多拉",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "ABB",
                "count": 55,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 55,
                        "note": "ABB 醒腦咖啡豆 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "壺壺",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/213.png",
                "recipe": "ABB",
                "count": 25,
                "note": "ABB 醒腦咖啡豆 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 醒腦咖啡豆 兼顧",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "烏鴉頭頭",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/430.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 醒腦咖啡豆 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 醒腦咖啡豆 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "AAC",
                "count": 24,
                "note": "AAC 醒腦咖啡豆 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 醒腦咖啡豆 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "正電拍拍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/311.png",
                "recipe": "AAA",
                "count": 17,
                "note": "AAA 醒腦咖啡豆 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 17,
                        "note": "AAA 醒腦咖啡豆 兼顧",
                        "isTop": false
                    }
                ]
            }
        ]
    },
    {
        "id": "glossyavocado",
        "name": "嫩亮酪梨",
        "energy": 162,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png",
        "pokemon": [
            {
                "name": "沙漠蜻蜓",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "AAA",
                "count": 38,
                "note": "👑 TOP 1 AAA 嫩亮酪梨 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 38,
                        "note": "👑 TOP 1 AAA 嫩亮酪梨 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 雙嫩亮酪梨 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單嫩亮酪梨 混產"
                    }
                ]
            },
            {
                "name": "老翁龍",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 嫩亮酪梨 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 嫩亮酪梨 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 嫩亮酪梨 兼顧"
                    }
                ]
            },
            {
                "name": "岩殿居蟹",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/558.png",
                "recipe": "AAA",
                "count": 26,
                "note": "AAA 嫩亮酪梨 主力產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 26,
                        "note": "AAA 嫩亮酪梨 主力產出",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "超音波幼蟲",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/329.png",
                "recipe": "AAA",
                "count": 25,
                "note": "AAA 嫩亮酪梨 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 25,
                        "note": "AAA 嫩亮酪梨 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "大顎蟻",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/328.png",
                "recipe": "AAA",
                "count": 18,
                "note": "AAA 嫩亮酪梨 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 18,
                        "note": "AAA 嫩亮酪梨 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "石居蟹",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/557.png",
                "recipe": "AAA",
                "count": 14,
                "note": "AAA 嫩亮酪梨 解鎖",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 14,
                        "note": "AAA 嫩亮酪梨 解鎖",
                        "isTop": false
                    }
                ]
            }
        ]
    },
    {
        "id": "mushroom",
        "name": "品鮮蘑菇",
        "energy": 167,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png",
        "pokemon": [
            {
                "name": "烏波",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/194.png",
                "recipe": "AAA",
                "count": 68,
                "note": "👑 TOP 1 AAA 品鮮蘑菇 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 68,
                        "note": "👑 TOP 1 AAA 品鮮蘑菇 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 雙品鮮蘑菇 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 單品鮮蘑菇 混產"
                    }
                ]
            },
            {
                "name": "花岩怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "AAA",
                "count": 67,
                "note": "AAA 品鮮蘑菇 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 67,
                        "note": "AAA 品鮮蘑菇 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 36,
                        "note": "AAC 雙品鮮蘑菇 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 單品鮮蘑菇 混產"
                    }
                ]
            },
            {
                "name": "沼王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                "recipe": "AAA",
                "count": 64,
                "note": "AAA 品鮮蘑菇 專精產出",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 64,
                        "note": "AAA 品鮮蘑菇 專精產出",
                        "isTop": false
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙品鮮蘑菇 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 單品鮮蘑菇 混產"
                    }
                ]
            },
            {
                "name": "鍬農炮蟲",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "ABB",
                "count": 52,
                "note": "ABB 品鮮蘑菇 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 52,
                        "note": "ABB 品鮮蘑菇 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "耿鬼",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                "recipe": "ABB",
                "count": 39,
                "note": "ABB 品鮮蘑菇 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 39,
                        "note": "ABB 品鮮蘑菇 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "阿勃梭魯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "AAC",
                "count": 30,
                "note": "AAC 品鮮蘑菇 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 30,
                        "note": "AAC 品鮮蘑菇 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "暴雪王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "AAC",
                "count": 30,
                "note": "AAC 品鮮蘑菇 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 30,
                        "note": "AAC 品鮮蘑菇 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "leek",
        "name": "粗枝大蔥",
        "energy": 185,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/largeleek.png",
        "pokemon": [
            {
                "name": "大蔥鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "AAA",
                "count": 54,
                "note": "👑 TOP 1 AAA 粗枝大蔥 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 54,
                        "note": "👑 TOP 1 AAA 粗枝大蔥 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 29,
                        "note": "AAC 雙粗枝大蔥 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 單粗枝大蔥 混產"
                    }
                ]
            },
            {
                "name": "百變怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "ABB",
                "count": 39,
                "note": "ABB 粗枝大蔥 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 39,
                        "note": "ABB 粗枝大蔥 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "狂歡浪舞鴨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                "recipe": "ABB",
                "count": 34,
                "note": "ABB 粗枝大蔥 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 34,
                        "note": "ABB 粗枝大蔥 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "三地鼠",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                "recipe": "ABB",
                "count": 32,
                "note": "ABB 粗枝大蔥 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 32,
                        "note": "ABB 粗枝大蔥 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "花岩怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "AAC",
                "count": 29,
                "note": "AAC 粗枝大蔥 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 29,
                        "note": "AAC 粗枝大蔥 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "大食花",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                "recipe": "AAC",
                "count": 23,
                "note": "AAC 粗枝大蔥 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 23,
                        "note": "AAC 粗枝大蔥 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "魔牆人偶",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                "recipe": "AAC",
                "count": 21,
                "note": "AAC 粗枝大蔥 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 粗枝大蔥 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "pumpkin",
        "name": "沉甸甸南瓜",
        "energy": 250,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png",
        "pokemon": [
            {
                "name": "南瓜怪人",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAA",
                "count": 44,
                "note": "👑 TOP 1 AAA 沉甸甸南瓜 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 44,
                        "note": "👑 TOP 1 AAA 沉甸甸南瓜 產量之王",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 雙沉甸甸南瓜 二階解鎖"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    }
                ]
            },
            {
                "name": "花岩怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "ABB",
                "count": 38,
                "note": "ABB 沉甸甸南瓜 主力產出",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 38,
                        "note": "ABB 沉甸甸南瓜 主力產出",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（萬聖節）",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                "recipe": "AAA",
                "count": 20,
                "note": "AAA 沉甸甸南瓜 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 20,
                        "note": "AAA 沉甸甸南瓜 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "浩大鯨",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "AAC",
                "count": 20,
                "note": "AAC 沉甸甸南瓜 解鎖",
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 沉甸甸南瓜 解鎖",
                        "isTop": false
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "穿山王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                "recipe": "AAA",
                "count": 18,
                "note": "AAA 沉甸甸南瓜 兼顧",
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 18,
                        "note": "AAA 沉甸甸南瓜 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "拉帝亞斯",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/380.png",
                "recipe": "ABB",
                "count": 8,
                "note": "ABB 沉甸甸南瓜 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 沉甸甸南瓜 兼顧",
                        "isTop": false
                    }
                ]
            }
        ]
    },
    {
        "id": "tail",
        "name": "美味尾巴",
        "energy": 342,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png",
        "pokemon": [
            {
                "name": "百變怪",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "AAC",
                "count": 15,
                "note": "👑 TOP 1 AAC 美味尾巴 產量之王",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "👑 TOP 1 AAC 美味尾巴 產量之王",
                        "isTop": true
                    }
                ]
            },
            {
                "name": "呆殼獸",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                "recipe": "ABB",
                "count": 14,
                "note": "ABB 美味尾巴 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 美味尾巴 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "呆呆王",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/199.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 美味尾巴 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 美味尾巴 兼顧",
                        "isTop": false
                    }
                ]
            },
            {
                "name": "呆呆獸",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/079.png",
                "recipe": "ABB",
                "count": 11,
                "note": "ABB 美味尾巴 兼顧",
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 美味尾巴 兼顧",
                        "isTop": false
                    }
                ]
            }
        ]
    }
];

  // 舊版清單資料 (提供切換至列表檢視時使用)
  const LV60_INGREDIENTS_LADDER = LV60_COORDINATE_LADDER_DATA.map(d => ({
    id: d.id,
    name: d.name,
    icon: d.icon,
    maxDaily: d.pokemon[0] ? d.pokemon[0].count : 100,
    tiers: d.pokemon.map(p => ({
      name: p.name + ` (${p.recipe})`,
      count: p.count + " 顆/天",
      rate: Math.min(Math.round((p.count / (d.isSpecialScale ? 20 : 105)) * 100), 100),
      note: p.note
    }))
  }));

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

    const allLadderCards = document.querySelectorAll('.ladder-card, .ladder-track-row');
    allLadderCards.forEach(card => {
      const cardIng = card.getAttribute('data-ladder-ing');
      if (ingId === 'all' || cardIng === ingId) {
        card.style.setProperty('display', card.classList.contains('ladder-track-row') ? 'flex' : 'block', 'important');
      } else {
        card.style.setProperty('display', 'none', 'important');
      }
    });
  }

  // 3.0 食材天梯榜即時副技能補正開關 (食材機率提升M + 幫忙速度M)
  let isLadderIngM = false;
  let isLadderSpeedM = false;

  function getLadderMultiplier() {
    let mult = 1.0;
    if (isLadderIngM) mult *= 1.36;
    if (isLadderSpeedM) mult *= (1.0 / 0.86); // -14% 間隔 = 約 1.16279 倍
    return mult;
  }

  function toggleLadderIngM(checked) {
    isLadderIngM = !!checked;
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedM(checked) {
    isLadderSpeedM = !!checked;
    refreshCoordinateLadder();
  }

  function refreshCoordinateLadder() {
    const container = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (container) {
      container.innerHTML = renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA);
    }
  }

  // 3.1 切換天梯圖呈現模式 (coordinate: 橫向視覺天梯座標圖 / list: 卡片清單列表)
  function switchLadderView(mode) {
    const coordContainer = document.getElementById('wiki-ingredient-ladder-coordinate');
    const gridContainer = document.getElementById('wiki-ingredient-ladder-grid');
    const modeBtns = document.querySelectorAll('.ladder-mode-btn');

    modeBtns.forEach(btn => {
      if (btn.getAttribute('data-ladder-view') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (mode === 'coordinate') {
      if (coordContainer) coordContainer.style.setProperty('display', 'block', 'important');
      if (gridContainer) gridContainer.style.setProperty('display', 'none', 'important');
    } else {
      if (coordContainer) coordContainer.style.setProperty('display', 'none', 'important');
      if (gridContainer) gridContainer.style.setProperty('display', 'grid', 'important');
    }
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

  // 5.1 樹果能量動態等級 (Lv.1 ~ Lv.70)、島嶼加成 (0% ~ 85%) 與 順果 2x 計算
  let currentBerryLevel = 1;
  let currentIslandBonus = 0;
  let isFavoriteBerry2x = false;

  function calcBerryEnergy(base, lv, islandBonus, isFav) {
    const baseAtLv = Math.round(Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1)));
    const islandFactor = 1 + ((parseInt(islandBonus, 10) || 0) / 100);
    const favFactor = isFav ? 2 : 1;
    return Math.round(baseAtLv * islandFactor * favFactor);
  }

  function updateBerryLevel(val) {
    currentBerryLevel = Math.min(Math.max(parseInt(val, 10) || 1, 1), 70);
    const displayEl = document.getElementById('berry-level-display');
    if (displayEl) displayEl.textContent = `Lv. ${currentBerryLevel}`;
    const sliderEl = document.getElementById('berry-level-slider');
    if (sliderEl && parseInt(sliderEl.value, 10) !== currentBerryLevel) {
      sliderEl.value = currentBerryLevel;
    }
    refreshBerryNodes();
  }

  function updateBerryIsland(val) {
    currentIslandBonus = Math.min(Math.max(parseInt(val, 10) || 0, 0), 85);
    const displayEl = document.getElementById('berry-island-display');
    if (displayEl) displayEl.textContent = `+${currentIslandBonus}%`;
    const sliderEl = document.getElementById('berry-island-slider');
    if (sliderEl && parseInt(sliderEl.value, 10) !== currentIslandBonus) {
      sliderEl.value = currentIslandBonus;
    }
    refreshBerryNodes();
  }

  function toggleBerryFavorite(checked) {
    isFavoriteBerry2x = !!checked;
    refreshBerryNodes();
  }

  function refreshBerryNodes() {
    const grid = document.getElementById('values-berry-grid');
    if (!grid) return;
    grid.innerHTML = BERRY_VALUES_DATA.map(b => {
      const energy = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, isFavoriteBerry2x);
      const bonusStr = currentIslandBonus > 0 ? ` +${currentIslandBonus}%島嶼` : '';
      const favStr = isFavoriteBerry2x ? ' 順果2x' : '';
      return `
        <div class="value-compact-node" title="${b.name} (${b.type}屬性) - Lv.${currentBerryLevel}${bonusStr}${favStr} 能量 ${energy}">
          <img src="${b.icon}" class="value-compact-icon" alt="${b.name}">
          <span class="value-compact-energy berry-val">${energy}</span>
        </div>
      `;
    }).join('');
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

      const ladderViewBtn = e.target.closest('[data-ladder-view]');
      if (ladderViewBtn) {
        switchLadderView(ladderViewBtn.getAttribute('data-ladder-view'));
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
      if (e.target && e.target.id === 'berry-favorite-toggle') {
        toggleBerryFavorite(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-ing-m-toggle') {
        toggleLadderIngM(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-speed-m-toggle') {
        toggleLadderSpeedM(e.target.checked);
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target && (e.target.id === 'calc-sleep-cur-lv' || e.target.id === 'calc-sleep-target-lv')) {
        recalcSleepDays();
      }
      if (e.target && e.target.id === 'berry-level-slider') {
        updateBerryLevel(e.target.value);
      }
      if (e.target && e.target.id === 'berry-island-slider') {
        updateBerryIsland(e.target.value);
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
    refreshCoordinateLadder();
    refreshBerryNodes();
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

  // 渲染橫向視覺座標天梯圖 (支援多型態並列節點、同組跨度連接線、極簡圖示、含即時副技能補正)
  function renderCoordinateLadder(ladderData) {
    const mult = getLadderMultiplier();
    
    // 依據是否開啟副技能加成動態調整刻度上限
    let ticks = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    let minVal = 10;
    let maxVal = 105;

    if (isLadderIngM && isLadderSpeedM) {
      ticks = [10, 30, 60, 90, 120, 150, 180];
      maxVal = 175;
    } else if (isLadderIngM) {
      ticks = [10, 30, 50, 70, 90, 110, 130, 150];
      maxVal = 148;
    } else if (isLadderSpeedM) {
      ticks = [10, 25, 50, 75, 100, 125];
      maxVal = 125;
    }

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return ((clamped - minVal) / (maxVal - minVal) * 100).toFixed(2);
    }

    const boostLabel = (isLadderIngM && isLadderSpeedM) 
      ? ' (含 食材M + 幫速M 補正)' 
      : (isLadderIngM ? ' (含 食材M 補正)' : (isLadderSpeedM ? ' (含 幫速M 補正)' : ''));

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder" onmouseover="window.WikiDB.handleLadderGroupHover(event)" onmouseout="window.WikiDB.handleLadderGroupHoverOut(event)">
          <!-- 頂部刻度標尺 -->
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer"></div>
            <div class="ladder-ruler-scale">
              ${ticks.map(t => `
                <div class="ladder-ruler-tick" style="left: ${getPosPct(t)}%;">
                  <span class="tick-label">${t}</span>
                  <div class="tick-line"></div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 各食材軌道 (19種食材完整一覽) -->
          ${ladderData.map(ing => `
            <div class="ladder-track-row" data-ladder-ing="${ing.id}">
              <div class="ladder-track-header" title="${ing.name} (基礎能量 ${ing.energy})">
                <img src="${ing.icon}" class="ladder-ing-icon" alt="${ing.name}">
              </div>

              <div class="ladder-track-canvas">
                <div class="ladder-grid-lines">
                  ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                </div>

                <div class="ladder-track-line"></div>

                <!-- 跨度連接線容器 (同一寶可夢多型態間的落差跨度線) -->
                <div class="ladder-spans-container">
                  ${ing.pokemon.map(p => {
                    const variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
                    if (variants.length < 2) return '';
                    const scaledCounts = variants.map(v => Math.round(v.count * mult));
                    const minCount = Math.min(...scaledCounts);
                    const maxCount = Math.max(...scaledCounts);
                    const minPct = parseFloat(getPosPct(minCount));
                    const maxPct = parseFloat(getPosPct(maxCount));
                    const widthPct = Math.max(maxPct - minPct, 1.2).toFixed(2);
                    return `
                      <div class="ladder-pkm-span-line" 
                           data-pkm-group="${p.name}" 
                           style="left: ${minPct}%; width: ${widthPct}%;"
                           title="${p.name} 配方跨度：${minCount} ~ ${maxCount} 顆/天">
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- 寶可夢型態節點容器 (Nodes Container) -->
                <div class="ladder-nodes-container">
                  ${ing.pokemon.flatMap((p, pIdx) => {
                    const variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
                    return variants.map((v, vIdx) => {
                      const scaledCount = Math.round(v.count * mult);
                      const isTopNode = v.isTop || (p.isTop && v.recipe === p.recipe);
                      const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                      return `
                        <div class="ladder-node ${isTopNode ? 'node-top1' : ''} recipe-${v.recipe.toLowerCase()}" 
                             data-pkm-group="${p.name}"
                             data-pkm="${p.name}" 
                             data-recipe="${v.recipe}"
                             style="left: ${getPosPct(scaledCount)}%; z-index: ${zIndex};">
                          <div class="node-recipe-tag recipe-tag-${v.recipe.toLowerCase()}">${v.recipe}</div>
                          <div class="node-avatar-wrapper">
                            <img src="${p.icon}" class="node-avatar-img" alt="${p.name}">
                            ${isTopNode ? '<span class="node-crown">👑</span>' : ''}
                          </div>
                          <div class="node-count-badge">${scaledCount}</div>
                          
                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">${isTopNode ? '👑 產量 TOP 1 ' : ''}${p.name} (${v.recipe})</div>
                            <div class="tooltip-detail">食材組合：<span class="text-accent font-bold">${v.recipe}</span></div>
                            <div class="tooltip-detail">預估日產：<span class="text-success font-bold">${scaledCount} 顆/天</span>${boostLabel}</div>
                            <div class="tooltip-note">${v.note || ''}</div>
                          </div>
                        </div>
                      `;
                    });
                  }).join('')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染樹果與食材基礎能量看板 (極簡無名無滾輪 18 格全展開版 + 等級滑桿、島嶼加成與順果 2x 開關)
  function renderValuesBoard() {
    return `
      <div class="values-horizontal-container">
        <!-- 區塊 1：樹果基礎能量庫 (Lv.1 ~ Lv.70 + 島嶼加成 0~85% 動態試算) -->
        <div class="values-horizontal-section">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge berry-badge">🫐 樹果能量庫</span>
              <span class="values-section-sub">基礎能量 (Lv.1: 24 ➔ 35)</span>
            </div>

            <!-- 等級滑桿、島嶼加成與順果 2x 控制器 -->
            <div class="berry-calc-controls">
              <!-- 寶可夢等級滑桿 (1 ~ 70) -->
              <div class="berry-control-group">
                <label for="berry-level-slider" class="berry-control-label">
                  等級：<span id="berry-level-display" class="berry-level-tag">Lv. ${currentBerryLevel}</span>
                </label>
                <input type="range" id="berry-level-slider" min="1" max="70" value="${currentBerryLevel}" step="1" class="berry-slider" oninput="window.WikiDB.updateBerryLevel(this.value)">
              </div>

              <!-- 島嶼加成滑桿 (0% ~ 85%) -->
              <div class="berry-control-group">
                <label for="berry-island-slider" class="berry-control-label">
                  島嶼加成：<span id="berry-island-display" class="berry-island-tag">+${currentIslandBonus}%</span>
                </label>
                <input type="range" id="berry-island-slider" min="0" max="85" value="${currentIslandBonus}" step="5" class="berry-slider island-slider" oninput="window.WikiDB.updateBerryIsland(this.value)">
              </div>

              <!-- 順果 2x 開關 -->
              <div class="berry-control-group">
                <label class="berry-switch-label" title="卡比獸喜愛樹果 (順果) 能量翻倍 (2x)">
                  <input type="checkbox" id="berry-favorite-toggle" ${isFavoriteBerry2x ? 'checked' : ''} onchange="window.WikiDB.toggleBerryFavorite(this.checked)">
                  <span class="berry-switch-slider"></span>
                  <span class="berry-switch-text">🎯 順果 2x</span>
                </label>
              </div>
            </div>
          </div>

          <div id="values-berry-grid" class="values-compact-grid values-berry-grid">
            ${BERRY_VALUES_DATA.map(b => {
              const energy = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, isFavoriteBerry2x);
              const bonusStr = currentIslandBonus > 0 ? ` +${currentIslandBonus}%島嶼` : '';
              const favStr = isFavoriteBerry2x ? ' 順果2x' : '';
              return `
                <div class="value-compact-node" title="${b.name} (${b.type}屬性) - Lv.${currentBerryLevel}${bonusStr}${favStr} 能量 ${energy}">
                  <img src="${b.icon}" class="value-compact-icon" alt="${b.name}">
                  <span class="value-compact-energy berry-val">${energy}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 區塊 2：食材基礎能量庫 (90 ~ 342) -->
        <div class="values-horizontal-section">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge ing-badge">🍲 食材基礎能量庫</span>
              <span class="values-section-sub">基礎能量 90 ➔ 342 (料理關鍵基礎分)</span>
            </div>
          </div>

          <div class="values-compact-grid values-ing-grid">
            ${INGREDIENT_VALUES_DATA.map(ing => `
              <div class="value-compact-node ${ing.id === 'tail' ? 'value-tail-highlight' : ''}" title="${ing.name} - 基礎能量 ${ing.energy}">
                <img src="${ing.icon}" class="value-compact-icon" alt="${ing.name}">
                <span class="value-compact-energy ing-val">${ing.energy}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染食材天梯榜卡片 (舊版清單檢視)
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

          <!-- 展開完整 1~5 種類超能力隊友樹果對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="lunar-prayer-table" onclick="window.WikiDB.toggleDetail('lunar-prayer-table')">
              📊 展開 / 收合 1~5 種類超能樹果表
            </button>
          </div>

          <div id="lunar-prayer-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
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
        `;
      } else {
        valuesHtml = `<div class="skill-level-chip"><span class="level-val">${skill.unit}</span></div>`;
      }

      return `
        <div class="wiki-skill-card" data-category="${skill.category}">
          <div class="skill-card-top">
            <div class="skill-title-badges">
              <h4 class="skill-name-text">${skill.name}</h4>
              <span class="skill-cat-tag cat-${skill.category}">${skill.catName}</span>
            </div>
            <span class="skill-max-lv-badge">上限 Lv.${skill.maxLevel}</span>
          </div>

          <p class="skill-desc-text">
            ${skill.desc}
            ${skill.specialNote ? `<span class="skill-note-inline">${skill.specialNote}</span>` : ''}
            ${skill.penaltyNote ? `<span class="skill-penalty-inline">${skill.penaltyNote}</span>` : ''}
          </p>

          <div class="skill-values-container">
            ${valuesHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // 渲染 Wiki 主佈局與 5 大子分頁 (精簡二級選單列)
  function renderWikiLayout(container) {
    container.innerHTML = `
      <div class="wiki-main-container">
        <!-- 二級子分頁導航 (Sub-tabs) - 精簡無大標題橫幅 -->
        <div class="wiki-subnav-bar">
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn active" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">⚡ 主技能數值庫</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">🧩 副技能與性格指南</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">🎓 培育與評級指南</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">🥗 Lv.60 食材天梯榜</button>
            <button type="button" class="wiki-subtab-btn" data-subtab="values" onclick="window.WikiDB.switchSubTab('values')">🫐 樹果與食材能量</button>
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
          <!-- 主技能發動機率矩陣速查表 -->
          <div class="wiki-card">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🧮</span>
              <h3 class="wiki-card-title">主技能發動機率矩陣對照表（副技能 × 性格乘算）</h3>
            </div>
            <p class="wiki-card-desc">依據遊戲底層乘法公式：<code>(1 + 副技能提升%) × 性格倍率 = 最終發動總倍率</code>，展示所有組合狀況的計算過程與最終總倍率速查。</p>

            <!-- 速查對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 14px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>副技能組合</th>
                    <th>性格主技能機率</th>
                    <th>乘算計算式</th>
                    <th>最終綜合總倍率</th>
                    <th>發動強度評級</th>
                  </tr>
                </thead>
                <tbody>
                  ${TRIGGER_CHANCE_MATRIX.map(row => `
                    <tr>
                      <td style="vertical-align: middle;">
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                          ${row.subskills && row.subskills.length > 0 
                            ? row.subskills.map(s => `<span class="wiki-skill-badge skill-badge-${s.color}">${s.name}</span>`).join('') 
                            : '<span class="text-muted" style="font-size: 12px; font-weight: 500;">無技能機率副技能</span>'}
                        </div>
                      </td>
                      <td style="vertical-align: middle;">
                        ${row.natureBadge === 'up' 
                          ? '<span style="color: #34d399; font-weight: 700; font-size: 12.5px;">▲▲ 技能機率上升</span>' 
                          : (row.natureBadge === 'down' 
                            ? '<span style="color: #f87171; font-weight: 700; font-size: 12.5px;">▼▼ 技能機率下降</span>' 
                            : '<span class="text-secondary" style="font-size: 12.5px;">無修正 / 其它性格</span>')}
                      </td>
                      <td style="vertical-align: middle;"><code style="background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; color: #93c5fd;">${row.calc}</code></td>
                      <td style="vertical-align: middle;">
                        <span class="text-accent font-bold" style="font-size: 13.5px;">${row.multiplier.toFixed(3)} 倍</span>
                        <span style="font-size: 11px; margin-left: 4px; font-weight: 600; color: ${row.multiplier >= 1 ? '#34d399' : '#f87171'};">
                          (${row.multiplier >= 1 ? '+' : ''}${((row.multiplier - 1) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td style="vertical-align: middle;"><span class="wiki-tier-badge tier-${row.grade[0].toLowerCase()}">${row.grade}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 副技能完整階級與數值說明表格 (僅已開放副技能) -->
          <div class="wiki-card" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">📋</span>
              <h3 class="wiki-card-title">副技能階級與數值完整一覽表（已開放副技能）</h3>
            </div>
            <div class="wiki-rule-banner">
              ⚠️ <strong>重要規則</strong>：副技能幫忙速度（幫手獎勵 5% + 幫速M 14% + 幫速S 7%）<strong>合計上限為 35%</strong>。
            </div>
            <div class="wiki-table-wrapper">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="min-width: 90px;">專長分類</th>
                    <th style="min-width: 220px;">已開放階級與技能標籤</th>
                    <th>詳細效果說明</th>
                  </tr>
                </thead>
                <tbody>
                  ${SUB_SKILLS_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-accent">${row.category}</td>
                      <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                          ${row.skills.map(s => renderSkillBadge(s)).join('')}
                        </div>
                      </td>
                      <td class="text-secondary">${row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 性格五維加成倍率表 (官方最新補正) -->
          <div class="wiki-card" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🧬</span>
              <h3 class="wiki-card-title">性格五維屬性增減倍率表（官方最新補正）</h3>
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
            <div class="wiki-card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="wiki-card-icon">🥗</span>
                <h3 class="wiki-card-title" style="margin: 0;">Lv.60 各食材單日產量天梯榜</h3>
              </div>

              <!-- 水平正右側控制列：[ 視覺天梯圖 | 卡片清單 ] + [ 食材機率M ] + [ 幫速M ] -->
              <div class="ladder-header-controls">
                <div class="ladder-mode-btns" style="margin: 0;">
                  <button type="button" class="ladder-mode-btn active" data-ladder-view="coordinate" onclick="window.WikiDB.switchLadderView('coordinate')">📈 視覺天梯圖</button>
                  <button type="button" class="ladder-mode-btn" data-ladder-view="list" onclick="window.WikiDB.switchLadderView('list')">📋 卡片清單</button>
                </div>

                <label class="ladder-switch-label" title="食材發現機率提升M (+36%)">
                  <input type="checkbox" id="ladder-ing-m-toggle" ${isLadderIngM ? 'checked' : ''} onchange="window.WikiDB.toggleLadderIngM(this.checked)">
                  <span class="ladder-switch-slider"></span>
                  <span class="ladder-switch-text ing-m-text">🥩 食材機率M (+36%)</span>
                </label>

                <label class="ladder-switch-label" title="幫忙速度M (-14% 間隔時間，約 +16.3% 幫忙次數)">
                  <input type="checkbox" id="ladder-speed-m-toggle" ${isLadderSpeedM ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSpeedM(this.checked)">
                  <span class="ladder-switch-slider"></span>
                  <span class="ladder-switch-text speed-m-text">⚡ 幫速M (+16.3%)</span>
                </label>
              </div>
            </div>

            <!-- 橫向視覺天梯座標圖 (預設顯示) -->
            <div id="wiki-ingredient-ladder-coordinate" style="margin-top: 8px;">
              ${renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA)}
            </div>

            <!-- 食材天梯卡片清單 (列表檢視，預設隱藏) -->
            <div id="wiki-ingredient-ladder-grid" class="wiki-ladder-grid" style="display: none; margin-top: 8px;">
              ${renderIngredientLadders(LV60_INGREDIENTS_LADDER)}
            </div>
          </div>
        </div>

        <!-- 子分頁 5：🫐 樹果與食材基礎能量 (Image 1 實體化 - Berry & Ingredient Values) -->
        <div id="wiki-subpanel-values" class="wiki-subpanel">
          <div class="wiki-card">
            <div class="wiki-card-header">
              <span class="wiki-card-icon">🫐</span>
              <h3 class="wiki-card-title">樹果與食材基礎能量一覽表（BERRY & INGREDIENT VALUES）</h3>
            </div>
            <p class="wiki-card-desc">依據官方遊戲底層能量設定，完整展示 18 種屬性樹果基礎能量（24~35）與 19 種料理食材基礎能量（90~342）。</p>

            <div style="margin-top: 20px;">
              ${renderValuesBoard()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function handleLadderGroupHover(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const row = target.closest('.ladder-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.add('group-hover-active'));
  }

  function handleLadderGroupHoverOut(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const row = target.closest('.ladder-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.remove('group-hover-active'));
  }

  // 導出全局命名空間與公共函數 (支援 window.WikiDB 及 window 全域名稱)
  const WikiDBExport = {
    MAIN_SKILLS_DATA,
    SUB_SKILLS_DATA,
    TRIGGER_CHANCE_MATRIX,
    NATURES_EFFECT_DATA,
    RATINGS_GUIDE_DATA,
    SLEEP_DAYS_BASELINE,
    BERRY_VALUES_DATA,
    INGREDIENT_VALUES_DATA,
    LV60_COORDINATE_LADDER_DATA,
    LV60_INGREDIENTS_LADDER,
    init: initWikiModule,
    renderWikiLayout: renderWikiLayout,
    switchSubTab: switchWikiSubTab,
    switchLadderView: switchLadderView,
    filterSkills: filterWikiSkills,
    filterIngredients: filterWikiIngredients,
    switchStack: switchChargeStock,
    switchBoost: switchHelperBoost,
    toggleDetail: toggleDetailTable,
    updateBerryLevel: updateBerryLevel,
    updateBerryIsland: updateBerryIsland,
    toggleBerryFavorite: toggleBerryFavorite,
    toggleLadderIngM: toggleLadderIngM,
    toggleLadderSpeedM: toggleLadderSpeedM,
    refreshCoordinateLadder: refreshCoordinateLadder,
    handleLadderGroupHover: handleLadderGroupHover,
    handleLadderGroupHoverOut: handleLadderGroupHoverOut,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays
  };

  window.WikiDB = WikiDBExport;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  window.switchWikiSubTab = switchWikiSubTab;
  window.switchLadderView = switchLadderView;
  window.filterWikiSkills = filterWikiSkills;
  window.filterWikiIngredients = filterWikiIngredients;
  window.switchChargeStock = switchChargeStock;
  window.switchHelperBoost = switchHelperBoost;
  window.toggleDetailTable = toggleDetailTable;
  window.updateBerryLevel = updateBerryLevel;
  window.updateBerryIsland = updateBerryIsland;
  window.toggleBerryFavorite = toggleBerryFavorite;
  window.toggleLadderIngM = toggleLadderIngM;
  window.toggleLadderSpeedM = toggleLadderSpeedM;
  window.refreshCoordinateLadder = refreshCoordinateLadder;
  window.handleLadderGroupHover = handleLadderGroupHover;
  window.handleLadderGroupHoverOut = handleLadderGroupHoverOut;
  window.recalcTriggerChance = recalcTriggerChance;
  window.recalcSleepDays = recalcSleepDays;

  // 當 DOM 準備完成時自動初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWikiModule);
  } else {
    initWikiModule();
  }

})();
