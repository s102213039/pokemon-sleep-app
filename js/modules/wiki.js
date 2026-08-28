/**
 * =========================================================
 * 📚 Pokémon Sleep 數據百科與知識庫 (Wiki & Strategy Guide)
 * 實體化 Google 試算表圖表與官方最新拆包數據 (v2.7.0)
 * =========================================================
 */

(function () {
  'use strict';

  // --- 0. 食材精選S 專屬寶可夢與食材池對照表 (Ingredient Draw Specific Pools) ---
  const INGREDIENT_DRAW_POKEMONS = [
    {
      id: 28,
      name: '穿山王',
      name_en: 'Sandslash',
      family: '穿山鼠 / 穿山王',
      family_en: 'Sandshrew / Sandslash',
      skill: '食材精選S',
      skill_en: 'Ingr. Select S',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/028.png',
      ingredients: [
        { name: '沉甸甸南瓜', name_en: 'Plump Pumpkin', icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png' },
        { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
        { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' }
      ],
      extraEffect: '精準產出南瓜、玉米與洋芋',
      extraEffect_en: 'Guaranteed Pumpkin, Corn, or Potato'
    },
    {
      id: 430,
      name: '烏鴉頭頭',
      name_en: 'Honchkrow',
      family: '黑暗鴉 / 烏鴉頭頭',
      family_en: 'Murkrow / Honchkrow',
      skill: '超幸運（食材精選S）',
      skill_en: 'Super Luck (Ingr. Select S)',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/430.png',
      ingredients: [
        { name: '醒腦咖啡豆', name_en: 'Rousing Coffee', icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
        { name: '萌綠大豆', name_en: 'Greengrass Soybeans', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
        { name: '火辣香草', name_en: 'Fiery Herb', icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' }
      ],
      extraEffect: '機率獲得大量夢之碎片',
      extraEffect_en: 'Chance to grant massive Dream Shards'
    },
    {
      id: 303,
      name: '大嘴娃',
      name_en: 'Mawile',
      family: '大嘴娃',
      family_en: 'Mawile',
      skill: '怪力钳（食材精選S）',
      skill_en: 'Hyper Cutter (Ingr. Select S)',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/303.png',
      ingredients: [
        { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
        { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
        { name: '好眠番茄', name_en: 'Snoozy Tomato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' }
      ],
      extraEffect: '機率額外獲得更多食材',
      extraEffect_en: 'Chance to gain bonus ingredient quantity'
    },
    {
      id: 558,
      name: '岩殿居蟹',
      name_en: 'Crustle',
      family: '石居蟹 / 岩殿居蟹',
      family_en: 'Dwebble / Crustle',
      skill: '食材精選S',
      skill_en: 'Ingr. Select S',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/558.png',
      ingredients: [
        { name: '嫩亮酪梨', name_en: 'Glossy Avocado', icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png' },
        { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
        { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' }
      ],
      extraEffect: '精準產出酪梨、洋芋與純油',
      extraEffect_en: 'Guaranteed Avocado, Potato, or Oil'
    },
    {
      id: 701,
      name: '摔角鷹人',
      name_en: 'Hawlucha',
      family: '摔角鷹人',
      family_en: 'Hawlucha',
      skill: '食材精選S',
      skill_en: 'Ingr. Select S',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/701.png',
      ingredients: [
        { name: '火辣香草', name_en: 'Fiery Herb', icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
        { name: '暖暖薑', name_en: 'Warming Ginger', icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
        { name: '豆製肉', name_en: 'Bean Sausage', icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' }
      ],
      extraEffect: '精準產出香草、暖薑與豆肉',
      extraEffect_en: 'Guaranteed Herb, Ginger, or Sausage'
    },
    {
      id: 743,
      name: '蝶結萌虻',
      name_en: 'Ribombee',
      family: '萌虻 / 蝶結萌虻',
      family_en: 'Cutiefly / Ribombee',
      skill: '食材精選S',
      skill_en: 'Ingr. Select S',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/743.png',
      ingredients: [
        { name: '甜甜蜜', name_en: 'Honey', icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
        { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
        { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' }
      ],
      extraEffect: '精準產出蜂蜜、純油與玉米',
      extraEffect_en: 'Guaranteed Honey, Oil, or Corn'
    }
  ];

  // --- 1. 主技能完整數值資料庫 (Main Skills Lv.1 ~ Lv.8) ---
  const MAIN_SKILLS_DATA = [
    {
      id: "charge_energy_s_fixed",
      name: "能量填充S",
      icon: "⚡",
      category: "energy",
      catName: "能量系",
      desc: "增加卡比獸的能量（固定數值）。",
      desc_en: "Adds a fixed amount of Snorlax Strength.",
      maxLevel: 7,
      values: [400, 569, 785, 1083, 1496, 2066, 3002],
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "charge_energy_s_range",
      name: "能量填充S (隨機)",
      icon: "🎲",
      category: "energy",
      catName: "能量系",
      desc: "隨機增加卡比獸能量（在最小~最大區間浮動）。",
      desc_en: "Adds random Snorlax Strength within a range.",
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
      specialNote_en: "🎲 Random: Strength varies per trigger",
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "charge_energy_m",
      name: "能量填充M",
      icon: "🔥",
      category: "energy",
      catName: "能量系",
      desc: "大量增加卡比獸的能量（固定數值）。",
      desc_en: "Adds a large fixed amount of Snorlax Strength.",
      maxLevel: 7,
      values: [880, 1251, 1726, 2383, 3290, 4546, 6409],
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "charge_stock_s",
      name: "蓄力（能量填充S）",
      icon: "🔋",
      category: "energy",
      catName: "能量系",
      desc: "發動蓄積或噴放。依蓄積次數（0~10次）暴增能量，最高達 82,386 能量！",
      desc_en: "Charges or releases. Scales with 0~10 stacks up to 82,386 Strength!",
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
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "nightmare_m",
      name: "夢魘（能量填充M）",
      icon: "🌑",
      category: "special",
      catName: "神獸與特殊",
      desc: "卡比獸能量超大幅增加，但非惡屬性隊友活力下降。",
      desc_en: "Huge Strength boost; non-Dark allies lose energy.",
      maxLevel: 6,
      values: [2640, 3753, 5178, 7149, 9870, 13638],
      penaltyNote: "副作用：非惡屬性隊友全員活力 -12",
      penaltyNote_en: "Penalty: Non-Dark teammates lose 12 Energy",
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "ingredient_magnet_s",
      name: "食材獲取S",
      icon: "🥗",
      category: "ingredient",
      catName: "食材與料理",
      desc: "隨機獲得已解鎖的食材（全圖鑑已解鎖食材隨機抽選）。",
      desc_en: "Gets a random assortment of all unlocked ingredients.",
      maxLevel: 7,
      values: [6, 8, 11, 14, 17, 21, 24],
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "ingredient_draw_s",
      name: "食材精選S",
      icon: "🥗",
      category: "ingredient",
      catName: "食材與料理",
      desc: "從該寶可夢自身可產出的食材（Lv.1/Lv.30/Lv.60專屬食材池）中，隨機獲得其中 1 種食材。",
      desc_en: "Obtains 1 ingredient type exclusively from this Pokémon's own ingredient pool (Lv.1/Lv.30/Lv.60).",
      maxLevel: 7,
      values: [6, 8, 11, 14, 17, 21, 24],
      specialNote: "機制：僅鎖定抽取發動寶可夢自身專屬食材池。特殊型態：超幸運有機率爆發大量夢之碎片；怪力鉗有機率爆發更多食材。",
      specialNote_en: "Rule: Draws 1 ingredient type only from this Pokémon's own ingredient pool. Variants: Super Luck may grant Dream Shards; Hyper Cutter may grant bonus ingredients.",
      hasIngredientDrawMatrix: true,
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "cooking_power_up_s",
      name: "料理強化S",
      icon: "🍲",
      category: "ingredient",
      catName: "食材與料理",
      desc: "增加下次烹調時鍋子容量上限，效果持續到料理大成功或換營地。",
      desc_en: "Expands pot capacity for next meal. Stacks until Extra Tasty or move.",
      maxLevel: 7,
      values: [7, 10, 12, 17, 22, 27, 31],
      unit: " 個容量",
      unit_en: " Pot Space"
    },
    {
      id: "tasty_chance_s",
      name: "料理成功S",
      icon: "✨",
      category: "ingredient",
      catName: "食材與料理",
      desc: "料理漂亮成功（大成功）機率提升，可持續疊加直到大成功為止。",
      desc_en: "Boosts Extra Tasty chance; stacks until an Extra Tasty dish is cooked.",
      maxLevel: 6,
      values: [4, 5, 6, 7, 8, 10],
      specialNote: "機率累加：大成功時發動雙倍/三倍能量，成功後機率重設",
      specialNote_en: "2x~3x power on Extra Tasty; resets after trigger",
      unit: "%",
      unit_en: "%"
    },
    {
      id: "helper_boost_s",
      name: "幫手支援S",
      icon: "🤝",
      category: "special",
      catName: "神獸與特殊",
      desc: "隨機 1 隻隊友立刻完成多次幫忙產出。",
      desc_en: "Instantly gets helps from a random teammate.",
      maxLevel: 7,
      values: [5, 6, 7, 8, 9, 10, 11],
      unit: " 次幫忙",
      unit_en: " Helps"
    },
    {
      id: "helper_boost_type",
      name: "幫手加速（屬性）",
      icon: "⚡",
      category: "special",
      catName: "神獸與特殊",
      desc: "隊伍同屬寶可夢立刻幫忙，同屬不同種類越多越強！",
      desc_en: "All same-type allies help; scales with unique species!",
      maxLevel: 6,
      hasTypeKindsMatrix: true,
      matrix: [
        { kinds: "0 種類", kinds_en: "0 Species", vals: [2, 3, 3, 4, 4, 5] },
        { kinds: "1 種類", kinds_en: "1 Species", vals: [2, 3, 3, 4, 4, 5] },
        { kinds: "2 種類", kinds_en: "2 Species", vals: [2, 3, 3, 4, 5, 6] },
        { kinds: "3 種類", kinds_en: "3 Species", vals: [3, 4, 5, 6, 7, 8] },
        { kinds: "4 種類", kinds_en: "4 Species", vals: [4, 5, 6, 7, 8, 9] },
        { kinds: "5 種類", kinds_en: "5 Species", vals: [6, 7, 8, 9, 10, 11] }
      ],
      unit: " 次幫忙",
      unit_en: " Helps"
    },
    {
      id: "berry_burst",
      name: "樹果遽增",
      icon: "🫐",
      category: "special",
      catName: "神獸與特殊",
      desc: "獲得自身產出的樹果，並額外獲得隊友撿來的樹果。",
      desc_en: "Gathers extra berries from user and allies.",
      maxLevel: 6,
      hasDualValues: true,
      selfShort: "自",
      teamShort: "他",
      selfValues: [11, 14, 21, 24, 27, 30],
      teamValues: [1, 2, 2, 3, 4, 5],
      unit: " 個",
      unit_en: " Berries"
    },
    {
      id: "disguise_berry_burst",
      name: "畫皮（樹果遽增）",
      icon: "🎭",
      category: "special",
      catName: "神獸與特殊",
      desc: "獲得自身與隊友的樹果。大成功時獲得 3 倍樹果。",
      desc_en: "Gathers berries from user and allies; 3x on Extra Tasty.",
      maxLevel: 6,
      hasDualValues: true,
      selfShort: "自",
      teamShort: "他",
      selfValues: [8, 10, 15, 17, 19, 21],
      teamValues: [1, 2, 2, 3, 4, 5],
      specialNote: "機率觸發：大成功時獲得 3 倍樹果（至下次睡眠研究前不重複發動）",
      specialNote_en: "3x berries on Extra Tasty (once per sleep session)",
      unit: " 個",
      unit_en: " Berries"
    },
    {
      id: "dream_shard_magnet_s_fixed",
      name: "夢之碎片獲取S",
      icon: "💎",
      category: "shards",
      catName: "夢之碎片",
      desc: "獲得夢之碎片（固定數量）。最高支援至 Lv.8！",
      desc_en: "Obtains a fixed amount of Dream Shards (up to Lv.8).",
      maxLevel: 8,
      values: [240, 340, 480, 670, 920, 1260, 1800, 2500],
      unit: " 碎片",
      unit_en: " Shards"
    },
    {
      id: "dream_shard_magnet_s_range",
      name: "夢之碎片獲取S (隨機)",
      icon: "🎰",
      category: "shards",
      catName: "夢之碎片",
      desc: "隨機獲得夢之碎片（在最小~最大區間浮動）。最高支援至 Lv.8！",
      desc_en: "Obtains random Dream Shards within a range (up to Lv.8).",
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
      specialNote: "浮動機制：每次發動隨機給予區間內碎片",
      specialNote_en: "Random: Shards vary per trigger",
      unit: " 碎片",
      unit_en: " Shards"
    },
    {
      id: "charge_energy_self_s",
      name: "活力充填S",
      icon: "🔋",
      category: "energy_heal",
      catName: "活力系",
      desc: "讓自身回復活力。",
      desc_en: "Restores energy to the user.",
      maxLevel: 6,
      values: [12, 16, 21, 26, 33, 43],
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "energizing_cheer_s",
      name: "活力療癒S",
      icon: "💚",
      category: "energy_heal",
      catName: "活力系",
      desc: "隨機讓隊伍中的 1 隻隊友回復活力。",
      desc_en: "Restores energy to 1 random teammate.",
      maxLevel: 6,
      values: [14, 17, 22, 28, 38, 50],
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "energy_for_everyone_s",
      name: "活力全體療癒S",
      icon: "💖",
      category: "energy_heal",
      catName: "活力系",
      desc: "讓全體隊友回復活力（主力補師核心招式）。",
      desc_en: "Restores energy to all teammates (core healer skill).",
      maxLevel: 6,
      values: [5, 7, 9, 11, 15, 18],
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "moonlight",
      name: "月光（活力充填S）",
      icon: "🌙",
      category: "energy_heal",
      catName: "活力系",
      desc: "自己回復活力；大成功時額外隨機讓 1 隻隊友回復活力。",
      desc_en: "Restores self energy; heals 1 ally on Extra Tasty.",
      maxLevel: 6,
      hasMoonlightChips: true,
      selfValues: [12, 16, 21, 26, 33, 43],
      teamValues: [6, 7, 10, 13, 17, 22],
      specialNote: "機率觸發：大成功（漂亮成功）時額外隨機讓 1 隻隊友回復活力",
      specialNote_en: "Extra Tasty: Heals 1 additional random teammate",
      unit: " 點",
      unit_en: " Energy"
    },
    {
      id: "lunar_prayer",
      name: "新月祈禱（活力全體療癒S）",
      icon: "🌠",
      category: "energy_heal",
      catName: "活力系",
      desc: "全隊回復活力，並額外獲得隊友撿來的樹果。",
      desc_en: "Restores team energy and gathers bonus berries from allies.",
      maxLevel: 6,
      hasLunarPrayerMatrix: true,
      healValues: [3, 4, 5, 7, 9, 11],
      berryFormulas: ["14+2n", "19+3n", "24+4n", "29+5n", "30+7n", "32+9n"],
      specialNote: "額外樹果公式：自身基礎 + 隊友額外 × n（n 為其他超能隊友種類數，滿編 5 種類時 n=4）",
      specialNote_en: "Berry Formula: Base + Ally Bonus × n (n = other Psychic species count, n=4 for full team)",
      berryMatrix: [
        { kinds: "1種", kinds_en: "1 Species", vals: ["5", "9", "13", "17", "21", "25"] },
        { kinds: "2種", kinds_en: "2 Species", vals: ["7+1*1", "12+1*1", "17+1*1", "19+2*1", "24+2*1", "29+2*1"] },
        { kinds: "3種", kinds_en: "3 Species", vals: ["9+1*2", "15+1*2", "18+2*2", "25+2*2", "27+3*2", "30+4*2"] },
        { kinds: "4種", kinds_en: "4 Species", vals: ["12+1*3", "16+2*3", "20+3*3", "28+3*3", "28+5*3", "31+6*3"] },
        { kinds: "5種", kinds_en: "5 Species", vals: ["14+2*4", "19+3*4", "24+4*4", "29+5*4", "30+7*4", "32+9*4"] }
      ],
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "transform",
      name: "變身",
      name_en: "Transform",
      icon: "🧬",
      category: "special",
      catName: "神獸與特殊",
      desc: "隨機複製隊伍中 1 隻隊友的主技能發動。",
      desc_en: "Copies and executes a random teammate's main skill.",
      maxLevel: 7,
      unit: "比照複製招式等級",
      unit_en: "Matches Target Lv."
    },
    {
      id: "mimic",
      name: "模仿",
      name_en: "Mimic",
      icon: "🎪",
      category: "special",
      catName: "神獸與特殊",
      desc: "隨機複製隊伍中 1 隻隊友的主技能發動。",
      desc_en: "Copies and executes a random teammate's main skill.",
      maxLevel: 7,
      unit: "比照複製招式等級",
      unit_en: "Matches Target Lv."
    },
    {
      id: "metronome",
      name: "揮指",
      name_en: "Metronome",
      icon: "☝️",
      category: "special",
      catName: "神獸與特殊",
      desc: "從全主技能庫中隨機抽選 1 種發動。",
      desc_en: "Randomly triggers any main skill in the game.",
      maxLevel: 7,
      unit: "Lv.1~7 隨機發動",
      unit_en: "Random Lv.1~7 Trigger"
    }
  ];

  // --- 2. 副技能完整階級與數值資料庫 (Sub-Skills Data - 僅列出官方已開放副技能) ---
  const SUB_SKILLS_DATA = [
    {
      category: "持有上限",
      category_en: "Inventory",
      skills: [
        { name: "持有上限提升 S", color: "white", val: "+6 個", val_en: "+6" },
        { name: "持有上限提升 M", color: "blue", val: "+12 個", val_en: "+12" },
        { name: "持有上限提升 L", color: "blue", val: "+18 個", val_en: "+18" }
      ],
      desc: "可持有的樹果與食材上限提升 +6 / +12 / +18 個（避免睡眠溢出）",
      desc_en: "Increases carry capacity by +6 / +12 / +18 (prevents overflow during sleep)."
    },
    {
      category: "幫忙速度",
      category_en: "Speed",
      skills: [
        { name: "幫忙速度 S", color: "white", val: "-7%", val_en: "-7%" },
        { name: "幫忙速度 M", color: "blue", val: "-14%", val_en: "-14%" }
      ],
      desc: "提供幫助所需的時間減少 7% / 14%（副技能幫速合計上限 35%）",
      desc_en: "Reduces help time by 7% / 14% (helping speed sub-skills capped at 35%)."
    },
    {
      category: "技能機率",
      category_en: "Skill Trigger",
      skills: [
        { name: "技能機率提升 S", color: "white", val: "+18%", val_en: "+18%" },
        { name: "技能機率提升 M", color: "blue", val: "+36%", val_en: "+36%" }
      ],
      desc: "主技能發動機率提升 18% / 36%（技能型寶可夢核心畢業副技）",
      desc_en: "Boosts main skill trigger rate by +18% / +36% (essential for Skill specialists)."
    },
    {
      category: "食材機率",
      category_en: "Ingredient",
      skills: [
        { name: "食材機率提升 S", color: "white", val: "+18%", val_en: "+18%" },
        { name: "食材機率提升 M", color: "blue", val: "+36%", val_en: "+36%" }
      ],
      desc: "發現食材的機率提升 18% / 36%（食材型寶可夢核心畢業副技）",
      desc_en: "Boosts ingredient finding rate by +18% / +36% (essential for Ingredient specialists)."
    },
    {
      category: "樹果數量",
      category_en: "Berries",
      skills: [
        { name: "樹果數量 S", color: "gold", val: "+1 個", val_en: "+1 Berry" }
      ],
      desc: "每次找到樹果的數量 +1 個（樹果型寶可夢最強 T0 核心）",
      desc_en: "Increases berries gathered by +1 (top-tier core for Berry specialists)."
    },
    {
      category: "技能等級",
      category_en: "Skill Level",
      skills: [
        { name: "技能等級提升 S", color: "blue", val: "+1 級", val_en: "+1 Lv." },
        { name: "技能等級提升 M", color: "gold", val: "+2 級", val_en: "+2 Lv." }
      ],
      desc: "主技能等級提升 1 / 2 級（省下主技能金種子珍貴資源）",
      desc_en: "Increases main skill level by +1 / +2 (saves Main Skill Seeds)."
    },
    {
      category: "全隊幫忙",
      category_en: "Team Speed",
      skills: [
        { name: "幫手獎勵", color: "gold", val: "全隊 -5%", val_en: "Team -5%" }
      ],
      desc: "全隊提供幫助時間減少 5%（隊伍最多疊加 5 隻 = 25%）",
      desc_en: "Reduces team help time by 5% (stacks up to 25% with 5 helpers)."
    },
    {
      category: "全隊活力",
      category_en: "Team Recovery",
      skills: [
        { name: "活力恢復獎勵", color: "gold", val: "全隊 1.12x", val_en: "Team 1.12x" }
      ],
      desc: "全隊睡眠活力恢復量提高 1.12 倍（可彌補性格活力下降隊友）",
      desc_en: "Boosts team sleep energy recovery by 1.12x (offsets Energy Down natures)."
    },
    {
      category: "全隊經驗",
      category_en: "Team EXP",
      skills: [
        { name: "睡眠 EXP 獎勵", color: "gold", val: "全隊 +14%", val_en: "Team +14%" }
      ],
      desc: "全隊睡眠結算獲得 EXP 提高 14%（大幅加速全隊成長）",
      desc_en: "Boosts team sleep EXP by +14% (significantly accelerates leveling)."
    },
    {
      category: "研究經驗",
      category_en: "Research EXP",
      skills: [
        { name: "研究 EXP 獎勵", color: "gold", val: "個人 +6%", val_en: "Self +6%" }
      ],
      desc: "玩家睡眠結算獲得的研究 EXP 提高 6%（加快研究等級升級）",
      desc_en: "Boosts player research EXP by +6% (speeds up research rank progress)."
    },
    {
      category: "夢之碎片",
      category_en: "Dream Shards",
      skills: [
        { name: "夢之碎片獎勵", color: "gold", val: "個人 +6%", val_en: "Self +6%" }
      ],
      desc: "睡眠結算獲得夢之碎片數量提高 6%（可與幸運薰香疊加）",
      desc_en: "Boosts dream shards gained from sleep by +6% (stacks with Luck Incense)."
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
      grade: "SSS (頂級極限)",
      grade_en: "SSS (Peak Meta)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.36 × 1.20",
      multiplier: 1.632,
      grade: "SS (優秀極限)",
      grade_en: "SS (Top Tier)"
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
      grade: "S (雙副技無性格)",
      grade_en: "S (Dual Sub Neutral)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.18 × 1.20",
      multiplier: 1.416,
      grade: "A (單副技+性格)",
      grade_en: "A (Sub + Nature)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.36 × 1.00",
      multiplier: 1.360,
      grade: "A (單STM無性格)",
      grade_en: "A (Solo STM Neutral)"
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
      grade: "B (雙副技補回性格)",
      grade_en: "B (Dual Offset)"
    },
    {
      subskills: [],
      nature: "▲▲ 技能機率上升",
      natureBadge: "up",
      calc: "1.00 × 1.20",
      multiplier: 1.200,
      grade: "B (純性格無副技)",
      grade_en: "B (Nature Only)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.18 × 1.00",
      multiplier: 1.180,
      grade: "B (純STS無性格)",
      grade_en: "B (Solo STS Neutral)"
    },
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" }
      ],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.36 × 0.80",
      multiplier: 1.088,
      grade: "C (STM抵銷性格下修)",
      grade_en: "C (STM Neutralizer)"
    },
    {
      subskills: [],
      nature: "無修正 / 其它性格",
      natureBadge: "neutral",
      calc: "1.00 × 1.00",
      multiplier: 1.000,
      grade: "基準線 (1.00x)",
      grade_en: "Baseline (1.00x)"
    },
    {
      subskills: [
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.18 × 0.80",
      multiplier: 0.944,
      grade: "D (微幅受阻)",
      grade_en: "D (Slight Impair)"
    },
    {
      subskills: [],
      nature: "▼▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.00 × 0.80",
      multiplier: 0.800,
      grade: "E (嚴重削弱)",
      grade_en: "E (Heavy Impair)"
    }
  ];

  // 性格五維倍率表 (包含官方最新數值與下降懲罰減輕修正)
  const NATURES_EFFECT_DATA = [
    { 
      stat: "幫忙速度", 
      stat_en: "Speed of Help",
      up: "+10%", 
      up_en: "+10%",
      down: "-7.5%", 
      down_en: "-7.5%",
      desc: "影響所有樹果、食材與技能判定頻率（下降懲罰調輕至 -7.5%）",
      desc_en: "Affects frequency of berries, ingredients, and skill checks (-7.5% penalty)."
    },
    { 
      stat: "活力回復量", 
      stat_en: "Energy Recovery",
      up: "+20%", 
      up_en: "+20%",
      down: "-12%", 
      down_en: "-12%",
      desc: "影響睡眠與隊伍補師回復量（下降懲罰調輕至 -12%）",
      desc_en: "Affects sleep energy and healer skill recovery (-12% penalty)."
    },
    { 
      stat: "食材發現率", 
      stat_en: "Ingredient Finding",
      up: "+20%", 
      up_en: "+20%",
      down: "-20%", 
      down_en: "-20%",
      desc: "每次幫忙時判定獲得食材的機率",
      desc_en: "Probability of finding ingredients during each help cycle."
    },
    { 
      stat: "主技能機率", 
      stat_en: "Main Skill Trigger",
      up: "+20%", 
      up_en: "+20%",
      down: "-20%", 
      down_en: "-20%",
      desc: "每次幫忙時判定觸發主技能的機率",
      desc_en: "Probability of triggering main skill during each help cycle."
    },
    { 
      stat: "EXP 獲得量", 
      stat_en: "EXP Gained",
      up: "+18%", 
      up_en: "+18%",
      down: "-18%", 
      down_en: "-18%",
      desc: "影響睡眠結算與糖果升級經驗值",
      desc_en: "Affects sleep session EXP and candy leveling EXP."
    }
  ];

  // --- 3. 培育與評級指南資料庫 (Image 2) ---
  const RATINGS_GUIDE_DATA = {
    berry: {
      type: "berry",
      title: "樹果型專長 【樹果 2 個、食材 1 個】",
      title_en: "Berry Specialists (2 Berries, 1 Ingredient)",
      desc: "以高頻率產出大量樹果累積卡比獸能量為最高目標。",
      desc_en: "Maximizes Snorlax Strength via massive, high-speed berry output.",
      subskills: [
        { grade: "Ⓢ", name: "樹果數量S", name_en: "Berry Finding S", detail: "樹果數量+1，能量直接翻倍（容易滿包需常收取）", detail_en: "Berry count +1, doubles base strength (fills inventory quickly, gather often)." },
        { grade: "Ⓐ", name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊 -5% 幫忙時間（5隻疊加 25%）", detail_en: "Reduces team help time by 5% (up to 25% with 5 helpers)." },
        { grade: "Ⓐ", name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己 -14% 幫忙時間", detail_en: "Self help time -14%." },
        { grade: "Ⓑ", name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己 -7% 幫忙時間（可用銀種子升階為 M 升至 Ⓐ）", detail_en: "Self help time -7% (upgradeable to M with Sub Skill Seed)." }
      ],
      natures: [
        { grade: "Ⓢ", name: "幫忙速度 ▲▲", name_en: "Speed of Help ▲▲", detail: "全方位提升樹果產出速度", detail_en: "Accelerates overall berry gathering frequency." },
        { grade: "Ⓐ", name: "食材發現率 ▼▼", name_en: "Ingredient Finding ▼▼", detail: "食材率降低，變相提高樹果產出機率（加分項）", detail_en: "Lower ingredient chance means higher relative berry production." },
        { grade: "Ⓑ", name: "主技能機率 ▲▲ / ▼▼", name_en: "Main Skill Chance ▲▲ / ▼▼", detail: "技能對樹果寵非首要，發動機率高低影響不大", detail_en: "Skill trigger is secondary for berry specialists." }
      ]
    },
    ingredient: {
      type: "ingredient",
      title: "食材型專長 【樹果 1 個、食材 2 個】",
      title_en: "Ingredient Specialists (1 Berry, 2 Ingredients)",
      desc: "以穩定供給高階食譜所需的高價值食材為核心職責。",
      desc_en: "Provides consistent supply of high-tier ingredients for powerful dishes.",
      subskills: [
        { grade: "Ⓢ", name: "食材機率提升M", name_en: "Ingredient Finder M", detail: "+36% 食材機率，食材寵畢業核心", detail_en: "+36% ingredient rate, top-tier graduation core." },
        { grade: "Ⓐ", name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊 -5% 幫忙時間", detail_en: "Reduces team help time by 5%." },
        { grade: "Ⓐ", name: "食材機率提升S", name_en: "Ingredient Finder S", detail: "+18% 食材機率（可用銀種子升階為 M 升至 Ⓢ）", detail_en: "+18% ingredient rate (upgradeable to M)." },
        { grade: "Ⓐ", name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己 -14% 幫忙時間", detail_en: "Self help time -14%." },
        { grade: "Ⓑ", name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己 -7% 幫忙時間", detail_en: "Self help time -7%." },
        { grade: "Ⓑ", name: "持有上限提升 M/L", name_en: "Inventory Up M/L", detail: "防止睡覺滿包停止產出食材", detail_en: "Prevents full inventory during sleep, avoiding missed ingredients." },
        { grade: "Ⓑ", name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "需搭配持有上限擴充，並保持頻繁收取", detail_en: "Pairs well with inventory upgrades and frequent gathering." }
      ],
      natures: [
        { grade: "Ⓢ", name: "食材發現率 ▲▲", name_en: "Ingredient Finding ▲▲", detail: "食材產出量大幅提升", detail_en: "Significantly boosts ingredient quantity." },
        { grade: "Ⓐ", name: "幫忙速度 ▲▲", name_en: "Speed of Help ▲▲", detail: "提高整體幫忙與食材判定頻率", detail_en: "Increases overall helping and check frequency." },
        { grade: "Ⓑ", name: "主技能機率 ▲▲ / ▼▼", name_en: "Main Skill Chance ▲▲ / ▼▼", detail: "若有自補/料理強化可加分，其餘技能影響不大", detail_en: "Beneficial if Pokémon has Charge Energy or Cooking Power Up." }
      ]
    },
    skill: {
      type: "skill",
      title: "技能型專長 【樹果 1 個、食材 1 個】",
      title_en: "Skill Specialists (1 Berry, 1 Ingredient)",
      desc: "以高頻率觸發核心主技能（全體補血、神獸加速、高額能量、料理擴鍋）為核心職責。",
      desc_en: "Triggers crucial main skills (E4E heal, Legend boost, pot expand, energy burst) frequently.",
      subskills: [
        { grade: "Ⓢ", name: "技能機率提升M", name_en: "Skill Trigger M", detail: "+36% 技能發動機率，技能寵畢業核心", detail_en: "+36% skill trigger rate, essential graduation core." },
        { grade: "Ⓐ", name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊 -5% 幫忙時間", detail_en: "Reduces team help time by 5%." },
        { grade: "Ⓐ", name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己 -14% 幫忙時間", detail_en: "Self help time -14%." },
        { grade: "Ⓐ", name: "技能機率提升S", name_en: "Skill Trigger S", detail: "+18% 技能發動機率（可用銀種子升階為 M 升至 Ⓢ）", detail_en: "+18% skill trigger rate (upgradeable to M)." },
        { grade: "Ⓑ", name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "補足基本能量產出，需常收取", detail_en: "Supplements base strength output; requires active collection." },
        { grade: "Ⓑ", name: "技能等級提升M", name_en: "Skill Level Up M", detail: "主技能等級+2，節省金種子珍貴資源", detail_en: "Main skill Lv.+2, saves precious Main Skill Seeds." },
        { grade: "Ⓒ", name: "技能等級提升S", name_en: "Skill Level Up S", detail: "主技能等級+1（可用銀種子升階）", detail_en: "Main skill Lv.+1 (upgradeable with seeds)." }
      ],
      natures: [
        { grade: "Ⓢ", name: "主技能發動機率 ▲▲", name_en: "Main Skill Chance ▲▲", detail: "技能寵靈魂性格，觸發次數最大化", detail_en: "Prime nature for skill specialists; maximizes activations." },
        { grade: "Ⓐ", name: "幫忙速度 ▲▲", name_en: "Speed of Help ▲▲", detail: "提高幫忙判定頻率", detail_en: "Increases helping cycle rate." },
        { grade: "Ⓐ", name: "食材發現率 ▼▼", name_en: "Ingredient Finding ▼▼", detail: "降低食材掉落，無副作用（技能寵只看技能與速度）", detail_en: "Reduces ingredient drop, no negative impact on skills." }
      ]
    }
  };

  // 睡眠天數成長基準表 (Image 2)
  const SLEEP_DAYS_BASELINE = [
    { level: 10, totalExp: 1600, days: 16, note: "解鎖第一個副技能，新手初期門檻", note_en: "Unlocks 1st sub-skill, early milestone." },
    { level: 25, totalExp: 8700, days: 87, note: "解鎖第二個副技能，中階關鍵戰力", note_en: "Unlocks 2nd sub-skill, mid-game power spike." },
    { level: 30, totalExp: 12000, days: 120, note: "解鎖第二種食材，前期核心目標（約 2~4 個月）", note_en: "Unlocks 2nd ingredient slot, primary early goal (approx. 2-4 mos)." },
    { level: 50, totalExp: 30000, days: 300, note: "解鎖第三個副技能，後期主力培育（約 5~10 個月）", note_en: "Unlocks 3rd sub-skill, late-game investment (approx. 5-10 mos)." },
    { level: 60, totalExp: 51500, days: 515, note: "解鎖第三種食材，頂級完全體", note_en: "Unlocks 3rd ingredient slot, max potential complete build." }
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
        "enName": "Fancy Apple",
        "energy": 90,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png",
        "pokemon": [
            {
                "name": "骨紋巨聲鱷",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "AAA",
                "count": 91,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 91,
                        "note": "AAA 特選蘋果 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 45,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "阿勃梭魯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "ABB",
                "count": 79,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 79,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "凱羅斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                "recipe": "ABB",
                "count": 76,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 76,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 29,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "信使鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                "recipe": "ABB",
                "count": 74,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 74,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 29,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "雷丘",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/026.png",
                "recipe": "AAA",
                "count": 47,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 47,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "水君",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/245.png",
                "recipe": "AAA",
                "count": 47,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 47,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（萬聖節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png",
                "recipe": "AAA",
                "count": 40,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 40,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "拉達",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/020.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "音波龍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/715.png",
                "recipe": "AAA",
                "count": 33,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 33,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（船長）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png",
                "recipe": "AAA",
                "count": 32,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 32,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "咚咚鼠",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/702.png",
                "recipe": "AAA",
                "count": 32,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 32,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "哥達鴨",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/055.png",
                "recipe": "ABB",
                "count": 31,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 31,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（高調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（低調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "怪顎龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/697.png",
                "recipe": "ABB",
                "count": 29,
                "note": "ABB 特選蘋果 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 29,
                        "note": "ABB 特選蘋果 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "果然翁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/202.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "艾路雷朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/475.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "謎擬Q",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/778.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "皮可西",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/036.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "沙奈朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/282.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "天然鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/178.png",
                "recipe": "AAC",
                "count": 25,
                "note": "AAC 單特選蘋果 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 25,
                        "note": "AAC 單特選蘋果 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "請假王",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                "recipe": "AAC",
                "count": 25,
                "note": "AAC 單特選蘋果 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 25,
                        "note": "AAC 單特選蘋果 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 特選蘋果 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 特選蘋果 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙特選蘋果 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單特選蘋果 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            },
            {
                "name": "七夕青鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/334.png",
                "recipe": "AAC",
                "count": 24,
                "note": "AAC 單特選蘋果 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 單特選蘋果 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 特選蘋果 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "milk",
        "name": "哞哞鮮奶",
        "enName": "Moomoo Milk",
        "energy": 98,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png",
        "pokemon": [
            {
                "name": "水箭龜",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                "recipe": "AAA",
                "count": 90,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 90,
                        "note": "AAA 哞哞鮮奶 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 45,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "魔幻假面喵",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                "recipe": "ABB",
                "count": 72,
                "note": "ABB 哞哞鮮奶 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 72,
                        "note": "ABB 哞哞鮮奶 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 29,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（高調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（低調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "巴布土撥",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/923.png",
                "recipe": "ABB",
                "count": 35,
                "note": "ABB 哞哞鮮奶 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 35,
                        "note": "ABB 哞哞鮮奶 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "水伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/134.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "雷伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/135.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "火伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/136.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "太陽伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/196.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "月亮伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/197.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "葉伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/470.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "冰伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/471.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "仙子伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/700.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "夢夢蝕",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/518.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "托戈德瑪爾",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/777.png",
                "recipe": "AAA",
                "count": 29,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 29,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "貓老大",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/053.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "巨沼怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/260.png",
                "recipe": "ABB",
                "count": 27,
                "note": "ABB 哞哞鮮奶 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 27,
                        "note": "ABB 哞哞鮮奶 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（佳節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png",
                "recipe": "AAA",
                "count": 23,
                "note": "AAA 哞哞鮮奶 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 23,
                        "note": "AAA 哞哞鮮奶 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙哞哞鮮奶 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單哞哞鮮奶 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（萬聖節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                "recipe": "AAC",
                "count": 22,
                "note": "AAC 單哞哞鮮奶 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 單哞哞鮮奶 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "負電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/312.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單哞哞鮮奶 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單哞哞鮮奶 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "風速狗",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/059.png",
                "recipe": "AAC",
                "count": 18,
                "note": "AAC 單哞哞鮮奶 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 單哞哞鮮奶 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝歐斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/381.png",
                "recipe": "AAC",
                "count": 18,
                "note": "AAC 單哞哞鮮奶 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 單哞哞鮮奶 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            },
            {
                "name": "正電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/311.png",
                "recipe": "AAC",
                "count": 17,
                "note": "AAC 單哞哞鮮奶 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 單哞哞鮮奶 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 哞哞鮮奶 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "soybeans",
        "name": "萌綠大豆",
        "enName": "Greengrass Soybeans",
        "energy": 100,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png",
        "pokemon": [
            {
                "name": "班基拉斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                "recipe": "ABB",
                "count": 84,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 84,
                        "note": "ABB 萌綠大豆 主力產出",
                        "isTop": true
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "隆隆岩",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                "recipe": "AAA",
                "count": 83,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 83,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "狂歡浪舞鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                "recipe": "AAA",
                "count": 82,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 82,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (小顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "ABB",
                "count": 79,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 79,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 30,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (中顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "ABB",
                "count": 77,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 77,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 29,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "老翁龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                "recipe": "AAA",
                "count": 77,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 77,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (大顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "ABB",
                "count": 75,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 75,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (巨顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "ABB",
                "count": 72,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 72,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "沙漠蜻蜓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "AAC",
                "count": 50,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 50,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 50,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "袋獸",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/115.png",
                "recipe": "AAC",
                "count": 44,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 44,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 44,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "波士可多拉",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "AAC",
                "count": 43,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 43,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "火焰雞",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/257.png",
                "recipe": "ABB",
                "count": 38,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 38,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "九尾（阿羅拉的樣子）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "三地鼠",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                "recipe": "AAC",
                "count": 37,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 37,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "嘟嘟利",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/085.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "七夕青鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/334.png",
                "recipe": "ABB",
                "count": 34,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 34,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "九尾",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038.png",
                "recipe": "AAA",
                "count": 29,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 29,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "吞食獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/317.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 萌綠大豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 萌綠大豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙萌綠大豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單萌綠大豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "拉達",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/020.png",
                "recipe": "ABB",
                "count": 26,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 26,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "烏鴉頭頭",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/430.png",
                "recipe": "ABB",
                "count": 26,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 26,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "瑪狃拉",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/461.png",
                "recipe": "AAC",
                "count": 24,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "巴大蝶",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/012.png",
                "recipe": "AAC",
                "count": 21,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 21,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "樹才怪",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/185.png",
                "recipe": "ABB",
                "count": 21,
                "note": "ABB 萌綠大豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 21,
                        "note": "ABB 萌綠大豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            },
            {
                "name": "皮可西",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/036.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單萌綠大豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單萌綠大豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 萌綠大豆 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "honey",
        "name": "甜甜蜜",
        "enName": "Honey",
        "energy": 101,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/honey.png",
        "pokemon": [
            {
                "name": "妙蛙花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                "recipe": "AAA",
                "count": 87,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 87,
                        "note": "AAA 甜甜蜜 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "凱羅斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                "recipe": "AAA",
                "count": 82,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 82,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "蝶結萌虻",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                "recipe": "AAA",
                "count": 77,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 77,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 39,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "鍬農炮蟲",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "AAC",
                "count": 50,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 50,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 50,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "幸福蛋",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "AAC",
                "count": 40,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 40,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 40,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "請假王",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                "recipe": "ABB",
                "count": 37,
                "note": "ABB 甜甜蜜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 37,
                        "note": "ABB 甜甜蜜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "巴大蝶",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/012.png",
                "recipe": "AAA",
                "count": 36,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 36,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "大竺葵",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/154.png",
                "recipe": "ABB",
                "count": 33,
                "note": "ABB 甜甜蜜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 33,
                        "note": "ABB 甜甜蜜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "負電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/312.png",
                "recipe": "AAA",
                "count": 33,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 33,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "赫拉克羅斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/214.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "胖可丁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/040.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 甜甜蜜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 甜甜蜜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙甜甜蜜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單甜甜蜜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "夢夢蝕",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/518.png",
                "recipe": "ABB",
                "count": 22,
                "note": "ABB 甜甜蜜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 22,
                        "note": "ABB 甜甜蜜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "皮可西",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/036.png",
                "recipe": "ABB",
                "count": 20,
                "note": "ABB 甜甜蜜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 甜甜蜜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "火爆猴",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/057.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "吞食獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/317.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "壺壺",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/213.png",
                "recipe": "AAC",
                "count": 15,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            },
            {
                "name": "帝王拿波",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/395.png",
                "recipe": "AAC",
                "count": 14,
                "note": "AAC 單甜甜蜜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 單甜甜蜜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 甜甜蜜 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "sausage",
        "name": "豆製肉",
        "enName": "Bean Sausage",
        "energy": 103,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/beansausage.png",
        "pokemon": [
            {
                "name": "波士可多拉",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "AAA",
                "count": 87,
                "note": "AAA 豆製肉 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 87,
                        "note": "AAA 豆製肉 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "噴火龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "AAA",
                "count": 85,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 85,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 43,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "穿著熊",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "ABB",
                "count": 85,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 85,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "大蔥鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "ABB",
                "count": 73,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 73,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "浩大鯨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "ABB",
                "count": 68,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 68,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "骨紋巨聲鱷",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "ABB",
                "count": 65,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 65,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "毒骷蛙",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/454.png",
                "recipe": "ABB",
                "count": 57,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 57,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 35,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "班基拉斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                "recipe": "AAC",
                "count": 51,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 51,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 51,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "水箭龜",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                "recipe": "AAC",
                "count": 45,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 45,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 45,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "沼王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                "recipe": "AAC",
                "count": 44,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 44,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 44,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "大力鱷",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/160.png",
                "recipe": "AAA",
                "count": 42,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 42,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "瑪狃拉",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/461.png",
                "recipe": "AAA",
                "count": 42,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 42,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "雷公",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/243.png",
                "recipe": "AAA",
                "count": 42,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 42,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "凱羅斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                "recipe": "AAC",
                "count": 41,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 41,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "老翁龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                "recipe": "AAC",
                "count": 38,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 38,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "阿柏怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/024.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "帝牙海獅",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/365.png",
                "recipe": "ABB",
                "count": 34,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 34,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "火爆猴",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/057.png",
                "recipe": "AAA",
                "count": 33,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 33,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "海豹球（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "怪顎龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/697.png",
                "recipe": "AAA",
                "count": 29,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 29,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "風速狗",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/059.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "勇士雄鷹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/628.png",
                "recipe": "AAA",
                "count": 23,
                "note": "AAA 豆製肉 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 23,
                        "note": "AAA 豆製肉 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙豆製肉 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單豆製肉 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "摔角鷹人",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/701.png",
                "recipe": "AAC",
                "count": 21,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 21,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "貓老大",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/053.png",
                "recipe": "ABB",
                "count": 20,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "大綱蛇",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/208.png",
                "recipe": "ABB",
                "count": 20,
                "note": "ABB 豆製肉 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 豆製肉 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "暴飛龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/373.png",
                "recipe": "AAC",
                "count": 20,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "赫拉克羅斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/214.png",
                "recipe": "AAC",
                "count": 18,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "拉達",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/020.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "哥達鴨",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/055.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "嘟嘟利",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/085.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "音波龍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/715.png",
                "recipe": "AAC",
                "count": 14,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "水伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/134.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "雷伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/135.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "火伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/136.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "太陽伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/196.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "月亮伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/197.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "葉伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/470.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "冰伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/471.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "仙子伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/700.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（佳節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單豆製肉 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單豆製肉 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 豆製肉 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "ginger",
        "name": "暖暖薑",
        "enName": "Warming Ginger",
        "energy": 109,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png",
        "pokemon": [
            {
                "name": "班基拉斯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                "recipe": "AAA",
                "count": 90,
                "note": "AAA 暖暖薑 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 90,
                        "note": "AAA 暖暖薑 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 45,
                        "note": "AAC 雙暖暖薑 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 單暖暖薑 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "袋獸",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/115.png",
                "recipe": "AAA",
                "count": 77,
                "note": "AAA 暖暖薑 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 77,
                        "note": "AAA 暖暖薑 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙暖暖薑 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單暖暖薑 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "噴火龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "ABB",
                "count": 67,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 67,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "花療環環",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                "recipe": "ABB",
                "count": 65,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 65,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 26,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "克雷色利亞",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                "recipe": "AAA",
                "count": 48,
                "note": "AAA 暖暖薑 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 48,
                        "note": "AAA 暖暖薑 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 雙暖暖薑 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單暖暖薑 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "大蔥鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "AAC",
                "count": 42,
                "note": "AAC 單暖暖薑 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 42,
                        "note": "AAC 單暖暖薑 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 42,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "火爆獸",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/157.png",
                "recipe": "AAA",
                "count": 40,
                "note": "AAA 暖暖薑 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 40,
                        "note": "AAA 暖暖薑 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 雙暖暖薑 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單暖暖薑 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "魔幻假面喵",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                "recipe": "AAC",
                "count": 38,
                "note": "AAC 單暖暖薑 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 單暖暖薑 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 38,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "暴飛龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/373.png",
                "recipe": "ABB",
                "count": 35,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 35,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "雷丘",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/026.png",
                "recipe": "ABB",
                "count": 33,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 33,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "嘎啦嘎啦",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/105.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 暖暖薑 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 暖暖薑 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙暖暖薑 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單暖暖薑 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "摔角鷹人",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/701.png",
                "recipe": "ABB",
                "count": 29,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 29,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（萬聖節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "黑魯加",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/229.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "詛咒娃娃",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/354.png",
                "recipe": "ABB",
                "count": 27,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 27,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "波克基斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/468.png",
                "recipe": "ABB",
                "count": 24,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 24,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（船長）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png",
                "recipe": "ABB",
                "count": 23,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "土台龜",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/389.png",
                "recipe": "AAC",
                "count": 21,
                "note": "AAC 單暖暖薑 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 21,
                        "note": "AAC 單暖暖薑 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 21,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "烈焰猴",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/392.png",
                "recipe": "ABB",
                "count": 20,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "帝牙海獅",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/365.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單暖暖薑 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單暖暖薑 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png",
                "recipe": "ABB",
                "count": 17,
                "note": "ABB 暖暖薑 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 暖暖薑 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            },
            {
                "name": "海豹球（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png",
                "recipe": "AAC",
                "count": 17,
                "note": "AAC 單暖暖薑 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 單暖暖薑 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 暖暖薑 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "tomato",
        "name": "好眠番茄",
        "enName": "Snoozy Tomato",
        "energy": 110,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png",
        "pokemon": [
            {
                "name": "大食花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                "recipe": "AAA",
                "count": 76,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 76,
                        "note": "AAA 好眠番茄 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "AAA",
                "count": 76,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 76,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "暴雪王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "AAA",
                "count": 76,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 76,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "魔牆人偶",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                "recipe": "AAA",
                "count": 71,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 71,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "妙蛙花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                "recipe": "ABB",
                "count": 68,
                "note": "ABB 好眠番茄 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 68,
                        "note": "ABB 好眠番茄 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "三地鼠",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                "recipe": "AAA",
                "count": 66,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 66,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 33,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "請假王",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                "recipe": "AAA",
                "count": 43,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 43,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 6,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "巨鍛匠",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/959.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "大嘴娃",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                "recipe": "AAC",
                "count": 33,
                "note": "AAC 單好眠番茄 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 33,
                        "note": "AAC 單好眠番茄 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 33,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝歐斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/381.png",
                "recipe": "AAA",
                "count": 32,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 32,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "炎帝",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/244.png",
                "recipe": "ABB",
                "count": 31,
                "note": "ABB 好眠番茄 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 31,
                        "note": "ABB 好眠番茄 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "克雷色利亞",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                "recipe": "AAC",
                "count": 27,
                "note": "AAC 單好眠番茄 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 27,
                        "note": "AAC 單好眠番茄 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "巴大蝶",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/012.png",
                "recipe": "ABB",
                "count": 26,
                "note": "ABB 好眠番茄 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 26,
                        "note": "ABB 好眠番茄 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "樹才怪",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/185.png",
                "recipe": "AAA",
                "count": 25,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 25,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "大綱蛇",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/208.png",
                "recipe": "AAA",
                "count": 23,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 23,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝亞斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/380.png",
                "recipe": "AAA",
                "count": 19,
                "note": "AAA 好眠番茄 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 19,
                        "note": "AAA 好眠番茄 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 雙好眠番茄 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單好眠番茄 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "呆殼獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                "recipe": "AAC",
                "count": 17,
                "note": "AAC 單好眠番茄 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 單好眠番茄 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            },
            {
                "name": "呆呆王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/199.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單好眠番茄 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單好眠番茄 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 好眠番茄 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "egg",
        "name": "特選蛋",
        "enName": "Fancy Egg",
        "energy": 115,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png",
        "pokemon": [
            {
                "name": "幸福蛋",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "AAA",
                "count": 70,
                "note": "AAA 特選蛋 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 70,
                        "note": "AAA 特選蛋 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "信使鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                "recipe": "AAA",
                "count": 69,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 69,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 34,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "暴雪王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "ABB",
                "count": 60,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 60,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "穿著熊",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "AAC",
                "count": 48,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 48,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 48,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "天然鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/178.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "七夕青鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/334.png",
                "recipe": "AAA",
                "count": 34,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 34,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "古月鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/845.png",
                "recipe": "AAC",
                "count": 32,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "瑪狃拉",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/461.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "波克基斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/468.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "負電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/312.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "阿柏怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/024.png",
                "recipe": "ABB",
                "count": 25,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "電龍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/181.png",
                "recipe": "ABB",
                "count": 24,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 24,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "帝王拿波",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/395.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝歐斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/381.png",
                "recipe": "ABB",
                "count": 23,
                "note": "ABB 特選蛋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 特選蛋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "蜥蜴王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/254.png",
                "recipe": "AAA",
                "count": 21,
                "note": "AAA 特選蛋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 21,
                        "note": "AAA 特選蛋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 雙特選蛋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單特選蛋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "雷丘",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/026.png",
                "recipe": "AAC",
                "count": 20,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "巴布土撥",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/923.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（萬聖節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png",
                "recipe": "AAC",
                "count": 17,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "路卡利歐",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/448.png",
                "recipe": "AAC",
                "count": 15,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（船長）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png",
                "recipe": "AAC",
                "count": 14,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 14,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            },
            {
                "name": "皮卡丘（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單特選蛋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單特選蛋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 特選蛋 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "oil",
        "name": "純粹油",
        "enName": "Pure Oil",
        "energy": 121,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/pureoil.png",
        "pokemon": [
            {
                "name": "毒骷蛙",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/454.png",
                "recipe": "AAA",
                "count": 62,
                "note": "AAA 純粹油 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 62,
                        "note": "AAA 純粹油 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 31,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "ABB",
                "count": 60,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 60,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "大嘴娃",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                "recipe": "AAA",
                "count": 58,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 58,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 29,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "古月鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/845.png",
                "recipe": "AAA",
                "count": 56,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 56,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 28,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "蝶結萌虻",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                "recipe": "ABB",
                "count": 55,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 55,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "百變怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "AAA",
                "count": 53,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 53,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 26,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "快龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "AAC",
                "count": 53,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 53,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 53,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "耿鬼",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                "recipe": "AAC",
                "count": 38,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 38,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 38,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "炎帝",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/244.png",
                "recipe": "AAA",
                "count": 36,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 36,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "狂歡浪舞鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                "recipe": "AAC",
                "count": 35,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 35,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "帝牙海獅",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/365.png",
                "recipe": "AAA",
                "count": 34,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 34,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "水君",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/245.png",
                "recipe": "ABB",
                "count": 33,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 33,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "詛咒娃娃",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/354.png",
                "recipe": "AAA",
                "count": 31,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 31,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "大力鱷",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/160.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "海豹球（佳節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png",
                "recipe": "AAA",
                "count": 30,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 30,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "自爆磁怪",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/462.png",
                "recipe": "AAA",
                "count": 26,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 26,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "壺壺",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/213.png",
                "recipe": "AAA",
                "count": 26,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 26,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "路卡利歐",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/448.png",
                "recipe": "AAA",
                "count": 26,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 26,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "勾魂眼",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/302.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 純粹油 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 純粹油 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙純粹油 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單純粹油 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "岩殿居蟹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/558.png",
                "recipe": "AAC",
                "count": 24,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "隨風球",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/426.png",
                "recipe": "ABB",
                "count": 23,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "胖可丁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/040.png",
                "recipe": "ABB",
                "count": 20,
                "note": "ABB 純粹油 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 20,
                        "note": "ABB 純粹油 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "火焰雞",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/257.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "火爆獸",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/157.png",
                "recipe": "AAC",
                "count": 17,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            },
            {
                "name": "果然翁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/202.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單純粹油 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單純粹油 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 純粹油 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "potato",
        "name": "窩心洋芋",
        "enName": "Soft Potato",
        "energy": 124,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/softpotato.png",
        "pokemon": [
            {
                "name": "浩大鯨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "AAA",
                "count": 68,
                "note": "AAA 窩心洋芋 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 68,
                        "note": "AAA 窩心洋芋 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 34,
                        "note": "AAC 雙窩心洋芋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單窩心洋芋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "魔幻假面喵",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                "recipe": "AAA",
                "count": 67,
                "note": "AAA 窩心洋芋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 67,
                        "note": "AAA 窩心洋芋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 33,
                        "note": "AAC 雙窩心洋芋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單窩心洋芋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "隆隆岩",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                "recipe": "ABB",
                "count": 59,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 59,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "沼王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                "recipe": "ABB",
                "count": 58,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 58,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "幸福蛋",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                "recipe": "ABB",
                "count": 55,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 55,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "袋獸",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/115.png",
                "recipe": "ABB",
                "count": 55,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 55,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "大食花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                "recipe": "ABB",
                "count": 54,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 54,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "魔牆人偶",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                "recipe": "ABB",
                "count": 50,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 50,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "古月鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/845.png",
                "recipe": "ABB",
                "count": 44,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 44,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (小顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAC",
                "count": 41,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 41,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 41,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (中顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAC",
                "count": 40,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 40,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 40,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "岩殿居蟹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/558.png",
                "recipe": "ABB",
                "count": 39,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 39,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (大顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAC",
                "count": 39,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 39,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 39,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "妙蛙花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                "recipe": "AAC",
                "count": 37,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 37,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (巨顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAC",
                "count": 37,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 37,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "土王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                "recipe": "AAC",
                "count": 35,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 35,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 35,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "暴飛龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/373.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 窩心洋芋 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 窩心洋芋 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙窩心洋芋 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單窩心洋芋 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "土台龜",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/389.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "路卡利歐",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/448.png",
                "recipe": "ABB",
                "count": 23,
                "note": "ABB 窩心洋芋 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 23,
                        "note": "ABB 窩心洋芋 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "穿山王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                "recipe": "AAC",
                "count": 18,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "九尾（阿羅拉的樣子）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png",
                "recipe": "AAC",
                "count": 16,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 16,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "巨鍛匠",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/959.png",
                "recipe": "AAC",
                "count": 15,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "隨風球",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/426.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "九尾",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "怪顎龍",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/697.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            },
            {
                "name": "大綱蛇",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/208.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單窩心洋芋 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單窩心洋芋 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 窩心洋芋 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "herb",
        "name": "火辣香草",
        "enName": "Fiery Herb",
        "energy": 130,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png",
        "pokemon": [
            {
                "name": "快龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "AAA",
                "count": 93,
                "note": "AAA 火辣香草 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 93,
                        "note": "AAA 火辣香草 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 46,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "耿鬼",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                "recipe": "AAA",
                "count": 67,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 67,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 33,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "沙漠蜻蜓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "ABB",
                "count": 62,
                "note": "ABB 火辣香草 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 62,
                        "note": "ABB 火辣香草 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "噴火龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                "recipe": "AAC",
                "count": 37,
                "note": "AAC 單火辣香草 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 單火辣香草 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 37,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "骨紋巨聲鱷",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                "recipe": "AAC",
                "count": 32,
                "note": "AAC 單火辣香草 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 單火辣香草 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 32,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "雷公",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/243.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 火辣香草 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 火辣香草 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "摔角鷹人",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/701.png",
                "recipe": "AAA",
                "count": 29,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 29,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "火爆獸",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/157.png",
                "recipe": "ABB",
                "count": 28,
                "note": "ABB 火辣香草 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 28,
                        "note": "ABB 火辣香草 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "黑魯加",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/229.png",
                "recipe": "AAA",
                "count": 28,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 28,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "風速狗",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/059.png",
                "recipe": "AAA",
                "count": 25,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 25,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "電龍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/181.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "烈焰猴",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/392.png",
                "recipe": "AAA",
                "count": 20,
                "note": "AAA 火辣香草 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 20,
                        "note": "AAA 火辣香草 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 雙火辣香草 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單火辣香草 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "自爆磁怪",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/462.png",
                "recipe": "ABB",
                "count": 19,
                "note": "ABB 火辣香草 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 火辣香草 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 單火辣香草 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "阿柏怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/024.png",
                "recipe": "AAC",
                "count": 15,
                "note": "AAC 單火辣香草 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 單火辣香草 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            },
            {
                "name": "烏鴉頭頭",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/430.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單火辣香草 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單火辣香草 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 火辣香草 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "corn",
        "name": "萌綠玉米",
        "enName": "Greengrass Corn",
        "energy": 140,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png",
        "pokemon": [
            {
                "name": "穿著熊",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                "recipe": "AAA",
                "count": 75,
                "note": "AAA 萌綠玉米 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 75,
                        "note": "AAA 萌綠玉米 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 37,
                        "note": "AAC 雙萌綠玉米 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 11,
                        "note": "ABB 單萌綠玉米 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "快龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                "recipe": "ABB",
                "count": 73,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 73,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "花療環環",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                "recipe": "AAA",
                "count": 61,
                "note": "AAA 萌綠玉米 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 61,
                        "note": "AAA 萌綠玉米 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 31,
                        "note": "AAC 雙萌綠玉米 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單萌綠玉米 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "大嘴娃",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                "recipe": "ABB",
                "count": 42,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 42,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 17,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "蝶結萌虻",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                "recipe": "AAC",
                "count": 28,
                "note": "AAC 單萌綠玉米 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 28,
                        "note": "AAC 單萌綠玉米 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "九尾（阿羅拉的樣子）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png",
                "recipe": "ABB",
                "count": 26,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 26,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "穿山王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                "recipe": "ABB",
                "count": 25,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "巨沼怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/260.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 萌綠玉米 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 萌綠玉米 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙萌綠玉米 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單萌綠玉米 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "隨風球",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/426.png",
                "recipe": "AAA",
                "count": 23,
                "note": "AAA 萌綠玉米 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 23,
                        "note": "AAA 萌綠玉米 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙萌綠玉米 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單萌綠玉米 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "九尾",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038.png",
                "recipe": "ABB",
                "count": 21,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 21,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "勇士雄鷹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/628.png",
                "recipe": "ABB",
                "count": 16,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "水君",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/245.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單萌綠玉米 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單萌綠玉米 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "沙奈朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/282.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "艾路雷朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/475.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 萌綠玉米 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 萌綠玉米 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            },
            {
                "name": "咚咚鼠",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/702.png",
                "recipe": "AAC",
                "count": 9,
                "note": "AAC 單萌綠玉米 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 單萌綠玉米 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 萌綠玉米 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "cacao",
        "name": "放鬆可可",
        "enName": "Soothing Cacao",
        "energy": 151,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png",
        "pokemon": [
            {
                "name": "阿勃梭魯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "AAA",
                "count": 55,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 55,
                        "note": "AAA 放鬆可可 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 28,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "土王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                "recipe": "AAA",
                "count": 54,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 54,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 27,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "水箭龜",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                "recipe": "ABB",
                "count": 51,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 51,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "克雷色利亞",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                "recipe": "ABB",
                "count": 34,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 34,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "花療環環",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                "recipe": "AAC",
                "count": 31,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 31,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 31,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "大竺葵",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/154.png",
                "recipe": "AAA",
                "count": 29,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 29,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "巴布土撥",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/923.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "天然鳥",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/178.png",
                "recipe": "ABB",
                "count": 25,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "信使鳥",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                "recipe": "AAC",
                "count": 25,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 25,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 25,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "巨鍛匠",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/959.png",
                "recipe": "ABB",
                "count": 25,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 25,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "呆殼獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                "recipe": "AAA",
                "count": 24,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 24,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（萬聖節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                "recipe": "ABB",
                "count": 24,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 24,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "哥達鴨",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/055.png",
                "recipe": "AAA",
                "count": 22,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 22,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "呆呆王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/199.png",
                "recipe": "AAA",
                "count": 22,
                "note": "AAA 放鬆可可 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 22,
                        "note": "AAA 放鬆可可 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 雙放鬆可可 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單放鬆可可 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "嘎啦嘎啦",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/105.png",
                "recipe": "ABB",
                "count": 22,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 22,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "嘟嘟利",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/085.png",
                "recipe": "ABB",
                "count": 16,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 16,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "咚咚鼠",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/702.png",
                "recipe": "ABB",
                "count": 14,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "水伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/134.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "雷伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/135.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "火伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/136.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "太陽伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/196.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "月亮伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/197.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "葉伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/470.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "冰伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/471.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "仙子伊布",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/700.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "波克基斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/468.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（佳節）",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png",
                "recipe": "ABB",
                "count": 10,
                "note": "ABB 放鬆可可 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 放鬆可可 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "勾魂眼",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/302.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "胖可丁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/040.png",
                "recipe": "AAC",
                "count": 8,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            },
            {
                "name": "托戈德瑪爾",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/777.png",
                "recipe": "AAC",
                "count": 8,
                "note": "AAC 單放鬆可可 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 單放鬆可可 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 放鬆可可 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "coffee",
        "name": "醒腦咖啡豆",
        "enName": "Rousing Coffee",
        "energy": 153,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png",
        "pokemon": [
            {
                "name": "鍬農炮蟲",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "AAA",
                "count": 63,
                "note": "AAA 醒腦咖啡豆 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 63,
                        "note": "AAA 醒腦咖啡豆 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 32,
                        "note": "AAC 雙醒腦咖啡豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 9,
                        "note": "ABB 單醒腦咖啡豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "波士可多拉",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                "recipe": "ABB",
                "count": 50,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 50,
                        "note": "ABB 醒腦咖啡豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "土王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                "recipe": "ABB",
                "count": 43,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 43,
                        "note": "ABB 醒腦咖啡豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "倫琴貓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                "recipe": "AAC",
                "count": 27,
                "note": "AAC 單醒腦咖啡豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 27,
                        "note": "AAC 單醒腦咖啡豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "烏鴉頭頭",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/430.png",
                "recipe": "AAA",
                "count": 20,
                "note": "AAA 醒腦咖啡豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 20,
                        "note": "AAA 醒腦咖啡豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 雙醒腦咖啡豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單醒腦咖啡豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "正電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/311.png",
                "recipe": "AAA",
                "count": 20,
                "note": "AAA 醒腦咖啡豆 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 20,
                        "note": "AAA 醒腦咖啡豆 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 雙醒腦咖啡豆 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單醒腦咖啡豆 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "壺壺",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/213.png",
                "recipe": "ABB",
                "count": 19,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 19,
                        "note": "ABB 醒腦咖啡豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "蜥蜴王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/254.png",
                "recipe": "ABB",
                "count": 15,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 15,
                        "note": "ABB 醒腦咖啡豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "謎擬Q",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/778.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 醒腦咖啡豆 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 醒腦咖啡豆 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "烈焰猴",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/392.png",
                "recipe": "AAC",
                "count": 9,
                "note": "AAC 單醒腦咖啡豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 單醒腦咖啡豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "夢夢蝕",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/518.png",
                "recipe": "AAC",
                "count": 9,
                "note": "AAC 單醒腦咖啡豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 9,
                        "note": "AAC 單醒腦咖啡豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 9,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            },
            {
                "name": "勇士雄鷹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/628.png",
                "recipe": "AAC",
                "count": 7,
                "note": "AAC 單醒腦咖啡豆 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 7,
                        "note": "AAC 單醒腦咖啡豆 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 醒腦咖啡豆 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "glossyavocado",
        "name": "嫩亮酪梨",
        "enName": "Glossy Avocado",
        "energy": 162,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png",
        "pokemon": [
            {
                "name": "沙漠蜻蜓",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                "recipe": "AAA",
                "count": 58,
                "note": "AAA 嫩亮酪梨 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 58,
                        "note": "AAA 嫩亮酪梨 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 29,
                        "note": "AAC 雙嫩亮酪梨 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 單嫩亮酪梨 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 嫩亮酪梨 兼顧"
                    }
                ]
            },
            {
                "name": "老翁龍",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                "recipe": "ABB",
                "count": 38,
                "note": "ABB 嫩亮酪梨 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 38,
                        "note": "ABB 嫩亮酪梨 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 16,
                        "note": "ABC 嫩亮酪梨 兼顧"
                    }
                ]
            },
            {
                "name": "岩殿居蟹",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/558.png",
                "recipe": "AAA",
                "count": 34,
                "note": "AAA 嫩亮酪梨 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 34,
                        "note": "AAA 嫩亮酪梨 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 雙嫩亮酪梨 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單嫩亮酪梨 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 嫩亮酪梨 兼顧"
                    }
                ]
            },
            {
                "name": "托戈德瑪爾",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/777.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 嫩亮酪梨 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 嫩亮酪梨 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 嫩亮酪梨 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "mushroom",
        "name": "品鮮蘑菇",
        "enName": "Tasty Mushroom",
        "energy": 167,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png",
        "pokemon": [
            {
                "name": "花岩怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "AAA",
                "count": 52,
                "note": "AAA 品鮮蘑菇 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 52,
                        "note": "AAA 品鮮蘑菇 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 26,
                        "note": "AAC 雙品鮮蘑菇 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單品鮮蘑菇 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "沼王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                "recipe": "AAA",
                "count": 51,
                "note": "AAA 品鮮蘑菇 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 51,
                        "note": "AAA 品鮮蘑菇 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 26,
                        "note": "AAC 雙品鮮蘑菇 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單品鮮蘑菇 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "鍬農炮蟲",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                "recipe": "ABB",
                "count": 50,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 50,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 18,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "耿鬼",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                "recipe": "ABB",
                "count": 48,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 48,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "阿勃梭魯",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                "recipe": "AAC",
                "count": 28,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 28,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 28,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "火焰雞",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/257.png",
                "recipe": "AAA",
                "count": 27,
                "note": "AAA 品鮮蘑菇 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 27,
                        "note": "AAA 品鮮蘑菇 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 雙品鮮蘑菇 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單品鮮蘑菇 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "暴雪王",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                "recipe": "AAC",
                "count": 27,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 27,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 27,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "土台龜",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/389.png",
                "recipe": "AAA",
                "count": 25,
                "note": "AAA 品鮮蘑菇 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 25,
                        "note": "AAA 品鮮蘑菇 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 雙品鮮蘑菇 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 4,
                        "note": "ABB 單品鮮蘑菇 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "隆隆岩",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                "recipe": "AAC",
                "count": 24,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 24,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "勾魂眼",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/302.png",
                "recipe": "ABB",
                "count": 17,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 17,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "炎帝",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/244.png",
                "recipe": "AAC",
                "count": 15,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 15,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 15,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "火爆猴",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/057.png",
                "recipe": "ABB",
                "count": 14,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "赫拉克羅斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/214.png",
                "recipe": "ABB",
                "count": 13,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 13,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "詛咒娃娃",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/354.png",
                "recipe": "AAC",
                "count": 13,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 13,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 13,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "果然翁",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/202.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "吞食獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/317.png",
                "recipe": "ABB",
                "count": 12,
                "note": "ABB 品鮮蘑菇 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 12,
                        "note": "ABB 品鮮蘑菇 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 4,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "巨沼怪",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/260.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "謎擬Q",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/778.png",
                "recipe": "AAC",
                "count": 8,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "樹才怪",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/185.png",
                "recipe": "AAC",
                "count": 7,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 7,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝亞斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/380.png",
                "recipe": "AAC",
                "count": 5,
                "note": "AAC 單品鮮蘑菇 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 5,
                        "note": "AAC 單品鮮蘑菇 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 品鮮蘑菇 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "leek",
        "name": "粗枝大蔥",
        "enName": "Large Leek",
        "energy": 185,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/largeleek.png",
        "pokemon": [
            {
                "name": "大蔥鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                "recipe": "AAA",
                "count": 49,
                "note": "AAA 粗枝大蔥 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 49,
                        "note": "AAA 粗枝大蔥 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 24,
                        "note": "AAC 雙粗枝大蔥 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 7,
                        "note": "ABB 單粗枝大蔥 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 7,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "狂歡浪舞鴨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                "recipe": "ABB",
                "count": 35,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 35,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "三地鼠",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                "recipe": "ABB",
                "count": 33,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 33,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 14,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "百變怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "大食花",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                "recipe": "AAC",
                "count": 22,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "花岩怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "AAC",
                "count": 22,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 22,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 22,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "魔牆人偶",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                "recipe": "AAC",
                "count": 20,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 20,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 20,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "正電拍拍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/311.png",
                "recipe": "ABB",
                "count": 14,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "音波龍",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/715.png",
                "recipe": "ABB",
                "count": 14,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 14,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "大竺葵",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/154.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "黑魯加",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/229.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "雷公",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/243.png",
                "recipe": "AAC",
                "count": 12,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 12,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 12,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "帝王拿波",
                "specialty": "樹果",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/395.png",
                "recipe": "ABB",
                "count": 10,
                "note": "ABB 粗枝大蔥 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 粗枝大蔥 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（高調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "顫弦蠑螈（低調的樣子）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png",
                "recipe": "AAC",
                "count": 10,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 10,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 10,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "沙奈朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/282.png",
                "recipe": "AAC",
                "count": 8,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "艾路雷朵",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/475.png",
                "recipe": "AAC",
                "count": 8,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 8,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            },
            {
                "name": "蜥蜴王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/254.png",
                "recipe": "AAC",
                "count": 6,
                "note": "AAC 單粗枝大蔥 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 6,
                        "note": "AAC 單粗枝大蔥 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 6,
                        "note": "ABC 粗枝大蔥 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "pumpkin",
        "name": "沉甸甸南瓜",
        "enName": "Plump Pumpkin",
        "energy": 250,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png",
        "pokemon": [
            {
                "name": "南瓜怪人 (小顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAA",
                "count": 38,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 38,
                        "note": "AAA 沉甸甸南瓜 純種產出",
                        "isTop": true
                    },
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (中顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAA",
                "count": 37,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 37,
                        "note": "AAA 沉甸甸南瓜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (大顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAA",
                "count": 36,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 36,
                        "note": "AAA 沉甸甸南瓜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 18,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "南瓜怪人 (巨顆種)",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                "recipe": "AAA",
                "count": 35,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 35,
                        "note": "AAA 沉甸甸南瓜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 17,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 5,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 5,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "花岩怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                "recipe": "ABB",
                "count": 30,
                "note": "ABB 沉甸甸南瓜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 30,
                        "note": "ABB 沉甸甸南瓜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "浩大鯨",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                "recipe": "AAC",
                "count": 19,
                "note": "AAC 單沉甸甸南瓜 補足",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 19,
                        "note": "AAC 單沉甸甸南瓜 補足"
                    },
                    {
                        "recipe": "ABC",
                        "count": 19,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "穿山王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                "recipe": "AAA",
                "count": 18,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 18,
                        "note": "AAA 沉甸甸南瓜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 8,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 3,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "伊布（萬聖節）",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                "recipe": "AAA",
                "count": 17,
                "note": "AAA 沉甸甸南瓜 純種產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "AAA",
                        "count": 17,
                        "note": "AAA 沉甸甸南瓜 純種產出"
                    },
                    {
                        "recipe": "AAC",
                        "count": 7,
                        "note": "AAC 雙沉甸甸南瓜 產出"
                    },
                    {
                        "recipe": "ABB",
                        "count": 2,
                        "note": "ABB 單沉甸甸南瓜 混產"
                    },
                    {
                        "recipe": "ABC",
                        "count": 2,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            },
            {
                "name": "拉帝亞斯",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/380.png",
                "recipe": "ABB",
                "count": 8,
                "note": "ABB 沉甸甸南瓜 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 8,
                        "note": "ABB 沉甸甸南瓜 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 沉甸甸南瓜 兼顧"
                    }
                ]
            }
        ]
    },
    {
        "id": "tail",
        "name": "美味尾巴",
        "enName": "Slowpoke Tail",
        "energy": 342,
        "icon": "https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png",
        "pokemon": [
            {
                "name": "百變怪",
                "specialty": "食材",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/132.png",
                "recipe": "AAC",
                "count": 11,
                "note": "AAC 單美味尾巴 補足",
                "isTop": true,
                "variants": [
                    {
                        "recipe": "AAC",
                        "count": 11,
                        "note": "AAC 單美味尾巴 補足",
                        "isTop": true
                    },
                    {
                        "recipe": "ABC",
                        "count": 11,
                        "note": "ABC 美味尾巴 兼顧"
                    }
                ]
            },
            {
                "name": "呆殼獸",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                "recipe": "ABB",
                "count": 10,
                "note": "ABB 美味尾巴 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 美味尾巴 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 美味尾巴 兼顧"
                    }
                ]
            },
            {
                "name": "呆呆王",
                "specialty": "技能",
                "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/199.png",
                "recipe": "ABB",
                "count": 10,
                "note": "ABB 美味尾巴 主力產出",
                "isTop": false,
                "variants": [
                    {
                        "recipe": "ABB",
                        "count": 10,
                        "note": "ABB 美味尾巴 主力產出"
                    },
                    {
                        "recipe": "ABC",
                        "count": 3,
                        "note": "ABC 美味尾巴 兼顧"
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
      name: p.name,
      recipe: p.recipe,
      rawCount: p.count,
      count: p.count,
      rate: Math.min(Math.round((p.count / (d.isSpecialScale ? 20 : 105)) * 100), 100),
      note: p.note
    }))
  }));

  let currentWikiSubTab = 'skills';

  // --- 核心互動控制函數 ---

  // 1. 切換子分頁 (skills / subskills / ratings / ingredients / values)
  function switchWikiSubTab(targetTab) {
    if (!targetTab) return;
    currentWikiSubTab = targetTab;

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

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const ladderSidebar = document.getElementById('ladder-filter-sidebar');
    const ladderFab = document.getElementById('ladder-sidebar-bookmark-handle');
    const ladderBackdrop = document.getElementById('ladder-sidebar-backdrop');

    if (ladderSidebar) {
      if (isMobileH5) {
        if (targetTab === 'ingredients') {
          ladderSidebar.style.display = 'flex';
          ladderSidebar.classList.add('collapsed');
          if (ladderFab) ladderFab.style.display = 'flex';
        } else {
          ladderSidebar.classList.add('collapsed');
          ladderSidebar.style.display = 'none';
          if (ladderFab) ladderFab.style.display = 'none';
          if (ladderBackdrop) ladderBackdrop.classList.remove('active');
        }
      } else {
        ladderSidebar.style.display = (targetTab === 'ingredients') ? 'flex' : 'none';
        ladderSidebar.classList.remove('collapsed');
      }
    }
  }

  function openLadderSidebar() {
    const sidebar = document.getElementById('ladder-filter-sidebar');
    const backdrop = document.getElementById('ladder-sidebar-backdrop');
    if (sidebar) {
      sidebar.classList.remove('collapsed');
      sidebar.style.setProperty('display', 'flex', 'important');
    }
    if (backdrop) {
      backdrop.classList.add('active');
    }
  }

  function closeLadderSidebar() {
    const sidebar = document.getElementById('ladder-filter-sidebar');
    const backdrop = document.getElementById('ladder-sidebar-backdrop');
    if (sidebar) {
      sidebar.classList.add('collapsed');
    }
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  function getCurrentSubTab() {
    return currentWikiSubTab;
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

  // 3.0 食材天梯榜即時副技能與性格補正開關、跨軌道搜尋/三維度篩選狀態
  let isLadderIngM = false;
  let isLadderSpeedM = false;
  let isLadderNatureIng = false;
  let isLadderNatureSpeed = false;
  let ladderSearchQuery = '';
  let ladderSupplyFilter = 'ALL'; // 'ALL' | 'TOP' | 'MEALS_3' | 'MEALS_2'
  let ladderRecipeFilter = 'ALL'; // 'ALL' | 'AAA' | 'ABB' | 'AXX'
  let ladderSpecialtyFilter = 'ALL'; // 'ALL' | 'INGREDIENT' | 'BERRY' | 'SKILL'
  let ladderViewMode = 'coordinate'; // 'coordinate' | 'list'

  const POKEMON_SPECIALTY_MAP = {
    "妙蛙種子": "食材", "妙蛙草": "食材", "妙蛙花": "食材", "小火龍": "食材", "火恐龍": "食材", "噴火龍": "食材",
    "傑尼龜": "食材", "卡咪龜": "食材", "水箭龜": "食材", "綠毛蟲": "樹果", "鐵甲蛹": "樹果", "巴大蝶": "樹果",
    "小拉達": "樹果", "拉達": "樹果", "阿柏蛇": "樹果", "阿柏怪": "樹果", "皮丘": "樹果", "皮卡丘": "樹果",
    "皮卡丘（萬聖節）": "樹果", "皮卡丘（佳節）": "技能", "皮卡丘（節日）": "技能", "皮卡丘（船長）": "樹果", "皮卡丘（戴著紅帽子）": "樹果",
    "雷丘": "樹果", "穿山鼠": "技能", "穿山王": "技能", "皮寶寶": "樹果", "皮皮": "樹果", "皮可西": "樹果",
    "六尾": "樹果", "六尾（阿羅拉的樣子）": "樹果", "九尾": "樹果", "九尾（阿羅拉的樣子）": "樹果",
    "寶寶丁": "技能", "胖丁": "技能", "胖可丁": "技能", "地鼠": "食材", "三地鼠": "食材", "喵喵": "技能", "貓老大": "技能",
    "可達鴨": "技能", "哥達鴨": "技能", "猴怪": "樹果", "火爆猴": "樹果", "卡蒂狗": "技能", "風速狗": "技能",
    "喇叭芽": "食材", "口呆花": "食材", "大食花": "食材", "小拳石": "食材", "隆隆石": "食材", "隆隆岩": "食材",
    "呆呆獸": "技能", "呆殼獸": "技能", "呆呆王": "技能", "小磁怪": "技能", "三合一磁怪": "技能", "自爆磁怪": "技能",
    "大蔥鴨": "食材", "嘟嘟": "樹果", "嘟嘟利": "樹果", "鬼斯": "食材", "鬼斯通": "食材", "耿鬼": "食材",
    "大岩蛇": "樹果", "大鋼蛇": "樹果", "卡拉卡拉": "樹果", "嘎啦嘎啦": "樹果", "小福蛋": "食材", "吉利蛋": "食材", "幸福蛋": "食材",
    "袋獸": "食材", "魔尼尼": "食材", "魔牆人偶": "食材", "凱羅斯": "食材", "大甲": "食材", "百變怪": "食材",
    "伊布": "技能", "伊布（佳節）": "樹果", "伊布（萬聖節）": "技能", "水伊布": "技能", "雷伊布": "技能", "火伊布": "技能",
    "太陽伊布": "技能", "月亮伊布": "技能", "葉伊布": "技能", "冰伊布": "技能", "仙子伊布": "技能",
    "迷你龍": "食材", "哈克龍": "食材", "快龍": "食材", "超夢": "技能", "夢幻": "全部",
    "菊草葉": "樹果", "月桂葉": "樹果", "大竺葵": "樹果", "火球鼠": "樹果", "火岩鼠": "樹果", "火爆獸": "樹果",
    "小鋸鱷": "樹果", "藍鱷": "樹果", "大力鱷": "樹果", "波克比": "技能", "波克基古": "技能", "波克基斯": "技能",
    "天然雀": "樹果", "天然鳥": "樹果", "咩利羊": "技能", "茸茸羊": "技能", "電龍": "技能",
    "盆才怪": "技能", "樹才怪": "技能", "胡說樹": "技能",
    "烏波": "食材", "烏波（阿羅拉的樣子）": "食材", "沼王": "食材", "土王": "食材",
    "黑暗鴉": "技能", "烏鴉頭頭": "技能", "小果然": "技能", "果然翁": "技能", "壺壺": "技能",
    "赫拉克羅斯": "技能", "狃拉": "樹果", "瑪狃拉": "樹果", "信使鳥": "食材", "戴魯比": "樹果", "黑魯加": "樹果",
    "雷公": "技能", "炎帝": "技能", "水君": "技能", "幼基拉斯": "食材", "沙基拉斯": "食材", "班基拉斯": "食材",
    "木守宮": "技能", "森林蜥蜴": "技能", "蜥蜴王": "技能", "火稚雞": "樹果", "力壯雞": "樹果", "火焰雞": "樹果",
    "水躍魚": "樹果", "沼躍魚": "樹果", "巨沼怪": "樹果",
    "拉魯拉絲": "技能", "奇鲁莉安": "技能", "沙奈朵": "技能", "艾路雷朵": "技能",
    "懶人獺": "樹果", "過動猿": "樹果", "請假王": "樹果", "勾魂眼": "技能",
    "大嘴娃": "食材", "可可多拉": "食材", "可多拉": "食材", "波士可多拉": "食材",
    "正電拍拍": "技能", "負電拍拍": "技能", "溶食獸": "技能", "吞食獸": "技能",
    "大顎蟻": "食材", "超音波幼蟲": "食材", "沙漠蜻蜓": "食材",
    "青綿鳥": "樹果", "七夕青鳥": "樹果", "怨影娃娃": "樹果", "詛咒娃娃": "樹果", "阿勃梭魯": "食材",
    "海豹球": "技能", "海豹球（佳節）": "技能", "海魔獅": "樹果", "帝牙海獅": "樹果",
    "寶貝龍": "樹果", "甲殼龍": "樹果", "暴飛龍": "樹果", "拉帝亞斯": "技能", "拉帝歐斯": "技能",
    "草苗龜": "技能", "樹林龜": "技能", "土台龜": "技能",
    "小火焰猴": "技能", "猛火猴": "技能", "烈焰猴": "技能",
    "波加曼": "樹果", "波皇子": "樹果", "帝王拿波": "樹果",
    "小貓怪": "食材", "勒克貓": "食材", "倫琴貓": "食材",
    "飄飄球": "技能", "隨風球": "技能", "花岩怪": "食材",
    "利歐路": "技能", "路卡利歐": "技能", "不良蛙": "食材", "毒骷蛙": "食材",
    "雪笠怪": "食材", "暴雪王": "食材", "克雷色利亞": "技能", "達克萊伊": "全部",
    "食夢夢": "樹果", "夢夢蝕": "樹果", "石居蟹": "技能", "岩殿居蟹": "技能",
    "毛頭小鷹": "技能", "勇士雄鷹": "技能", "寶寶暴龍": "樹果", "怪顎龍": "樹果",
    "摔角鷹人": "技能", "咚咚鼠": "技能",
    "南瓜精": "食材", "南瓜怪人": "食材", "嗡蝠": "技能", "音波龍": "技能",
    "強顎雞母蟲": "食材", "蟲電寶": "食材", "鍬農炮蟲": "食材",
    "萌虻": "食材", "蝶結萌虻": "食材", "童偶熊": "食材", "穿著熊": "食材", "花療環環": "食材",
    "托戈德瑪爾": "技能", "謎擬Q": "技能", "老翁龍": "食材", "古月鳥": "食材",
    "毒電嬰": "技能", "顫弦蠑螈": "技能", "顫弦蠑螈（高調的樣子）": "技能", "顫弦蠑螈（低調的樣子）": "技能",
    "新葉喵": "食材", "蒂蕾喵": "食材", "魔幻假面喵": "食材",
    "呆火鱷": "食材", "炙燙鱷": "食材", "骨紋巨聲鱷": "食材",
    "潤水鴨": "食材", "湧躍鴨": "食材", "狂歡浪舞鴨": "食材",
    "布撥": "技能", "布土撥": "技能", "巴布土撥": "技能",
    "小鍛匠": "樹果", "巧鍛匠": "樹果", "巨鍛匠": "樹果",
    "走鯨": "食材", "浩大鯨": "食材", "白海獅": "樹果", "巨鉗蟹": "食材", "巨鉗螳螂": "食材",
    "快泳蛙": "樹果", "胡地": "技能", "怪力": "食材", "白海獅": "樹果", "臭臭泥": "技能"
  };

  function getPokemonLadderSpecialty(pkmName) {
    if (!pkmName) return '食材';
    const clean = pkmName.replace(/（.*）|\(.*\)/g, '').trim();
    if (POKEMON_SPECIALTY_MAP[clean]) return POKEMON_SPECIALTY_MAP[clean];
    if (POKEMON_SPECIALTY_MAP[pkmName]) return POKEMON_SPECIALTY_MAP[pkmName];
    return '食材';
  }

  const TOP_RECIPES_FOR_INGREDIENTS = {
    apple: { name: '蘋果酸優格風味沙拉', name_en: 'Apple Acid Yogurt-Dressed Salad', need: 28, type: '沙拉', type_en: 'Salad', energy: 19293, secondary: '麻麻刺刺香料可樂 (35)', secondary_en: 'Zing Zap Spiced Cola (35)' },
    milk: { name: '茂盛焗烤酪梨', name_en: 'Overgrow Avocado Gratin', need: 41, type: '咖哩', type_en: 'Curry', energy: 24802, secondary: '土王閃電泡芙 (26)', secondary_en: 'Clodsire Eclair (26)' },
    soybeans: { name: '重踏酪梨醬薯片', name_en: 'Bulldoze Guacamole and Chips', need: 22, type: '沙拉', type_en: 'Salad', energy: 25162, secondary: '覺醒力量醒腦燉湯 (28)', secondary_en: 'Hidden Power Perk-Up Stew (28)' },
    honey: { name: '採蜜可可鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 38, type: '甜點', type_en: 'Dessert', energy: 25484, secondary: '心跳加速鬼面鬆餅 (32)', secondary_en: 'Scary Face Pancakes (32)' },
    sausage: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 20, type: '咖哩', type_en: 'Curry', energy: 25539, secondary: '一字斬壽喜燒咖哩 (26)', secondary_en: 'Cut Sukiyaki Curry (26)' },
    ginger: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 39, type: '咖哩', type_en: 'Curry', energy: 25539, secondary: '麻麻刺刺香料可樂 (20)', secondary_en: 'Zing Zap Spiced Cola (20)' },
    tomato: { name: '心跳加速鬼面鬆餅', name_en: 'Scary Face Pancakes', need: 29, type: '甜點', type_en: 'Dessert', energy: 24354, secondary: '蘋果酸優格風味沙拉 (23)', secondary_en: 'Apple Acid Yogurt-Dressed Salad (23)' },
    egg: { name: '心跳加速鬼面鬆餅', name_en: 'Scary Face Pancakes', need: 24, type: '甜點', type_en: 'Dessert', energy: 24354, secondary: '一字斬壽喜燒咖哩 (22)', secondary_en: 'Cut Sukiyaki Curry (22)' },
    oil: { name: '採蜜可可鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 28, type: '甜點', type_en: 'Dessert', energy: 25484, secondary: '茂盛焗烤酪梨 (32)', secondary_en: 'Overgrow Avocado Gratin (32)' },
    potato: { name: '熱水溫沙拉', name_en: 'Scald Chunky Salad', need: 30, type: '沙拉', type_en: 'Salad', energy: 25356, secondary: '茂盛焗烤酪梨 (20)', secondary_en: 'Overgrow Avocado Gratin (20)' },
    herb: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 22, type: '咖哩', type_en: 'Curry', energy: 25539, secondary: '重踏酪梨醬薯片 (30)', secondary_en: 'Bulldoze Guacamole and Chips (30)' },
    corn: { name: '採蜜可可鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 28, type: '甜點', type_en: 'Dessert', energy: 25484, secondary: '熱水溫沙拉 (18)', secondary_en: 'Scald Chunky Salad (18)' },
    cacao: { name: '採蜜可可鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 21, type: '甜點', type_en: 'Dessert', energy: 25484, secondary: '土王閃電泡芙 (30)', secondary_en: 'Clodsire Eclair (30)' },
    coffee: { name: '土王閃電泡芙', name_en: 'Clodsire Eclair', need: 24, type: '甜點', type_en: 'Dessert', energy: 20885, secondary: '不服輸咖啡風味沙拉 (28)', secondary_en: 'Defiant Coffee-Dressed Salad (28)' },
    glossyavocado: { name: '重踏酪梨醬薯片', name_en: 'Bulldoze Guacamole and Chips', need: 28, type: '沙拉', type_en: 'Salad', energy: 25162, secondary: '茂盛焗烤酪梨 (22)', secondary_en: 'Overgrow Avocado Gratin (22)' },
    mushroom: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 31, type: '咖哩', type_en: 'Curry', energy: 25539, secondary: '熱水溫沙拉 (27)', secondary_en: 'Scald Chunky Salad (27)' },
    leek: { name: '一字斬壽喜燒咖哩', name_en: 'Cut Sukiyaki Curry', need: 27, type: '咖哩', type_en: 'Curry', energy: 20655, secondary: '麻麻刺刺香料可樂 (20)', secondary_en: 'Zing Zap Spiced Cola (20)' },
    pumpkin: { name: '熱水溫沙拉', name_en: 'Scald Chunky Salad', need: 20, type: '沙拉', type_en: 'Salad', energy: 25356, secondary: '心跳加速鬼面鬆餅 (18)', secondary_en: 'Scary Face Pancakes (18)' },
    tail: { name: '呆呆獸尾巴的胡椒沙拉', name_en: 'Slowpoke Tail Pepper Salad', need: 10, type: '沙拉', type_en: 'Salad', energy: 8169, secondary: '炙烤尾巴咖哩 (8)', secondary_en: 'Grilled Tail Curry (8)' }
  };

  function getLadderMultiplier() {
    let mult = 1.0;
    if (isLadderIngM) mult *= 1.36;
    if (isLadderSpeedM) mult *= (1.0 / 0.86); // -14% 間隔 = 約 1.16279 倍
    if (isLadderNatureIng) mult *= 1.20; // 性格食材機率▲▲ (+20%)
    if (isLadderNatureSpeed) mult *= (1.0 / 0.9090909); // 性格幫忙速度▲▲ (約 +10% 幫忙次數)
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

  function toggleLadderNatureIng(checked) {
    isLadderNatureIng = !!checked;
    refreshCoordinateLadder();
  }

  function toggleLadderNatureSpeed(checked) {
    isLadderNatureSpeed = !!checked;
    refreshCoordinateLadder();
  }

  function onLadderSearch(val) {
    ladderSearchQuery = (val || '').trim();
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = ladderSearchQuery ? 'flex' : 'none';
    applyLadderFiltersInPlace();
  }

  function clearLadderSearch() {
    ladderSearchQuery = '';
    const input = document.getElementById('ladder-pkm-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    applyLadderFiltersInPlace();
  }

  function setLadderSupplyFilter(filterType) {
    ladderSupplyFilter = filterType || 'ALL';
    document.querySelectorAll('[data-supply-filter]').forEach(btn => {
      if (btn.getAttribute('data-supply-filter') === ladderSupplyFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function setLadderRecipeFilter(filterType) {
    ladderRecipeFilter = filterType || 'ALL';
    document.querySelectorAll('[data-recipe-filter]').forEach(btn => {
      if (btn.getAttribute('data-recipe-filter') === ladderRecipeFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function setLadderSpecialtyFilter(filterType) {
    ladderSpecialtyFilter = filterType || 'ALL';
    document.querySelectorAll('[data-specialty-filter]').forEach(btn => {
      if (btn.getAttribute('data-specialty-filter') === ladderSpecialtyFilter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function resetLadderFilters() {
    ladderSearchQuery = '';
    const searchInput = document.getElementById('ladder-pkm-search-input');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    ladderSupplyFilter = 'ALL';
    document.querySelectorAll('[data-supply-filter]').forEach(btn => {
      if (btn.getAttribute('data-supply-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    ladderRecipeFilter = 'ALL';
    document.querySelectorAll('[data-recipe-filter]').forEach(btn => {
      if (btn.getAttribute('data-recipe-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    ladderSpecialtyFilter = 'ALL';
    document.querySelectorAll('[data-specialty-filter]').forEach(btn => {
      if (btn.getAttribute('data-specialty-filter') === 'ALL') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    switchLadderView('coordinate');

    isLadderIngM = false;
    isLadderSpeedM = false;
    isLadderNatureIng = false;
    isLadderNatureSpeed = false;

    const ingM = document.getElementById('ladder-ing-m-toggle');
    if (ingM) ingM.checked = false;
    const speedM = document.getElementById('ladder-speed-m-toggle');
    if (speedM) speedM.checked = false;
    const natIng = document.getElementById('ladder-nature-ing-toggle');
    if (natIng) natIng.checked = false;
    const natSpd = document.getElementById('ladder-nature-speed-toggle');
    if (natSpd) natSpd.checked = false;

    refreshCoordinateLadder();
  }

  function applyLadderFiltersInPlace() {
    const q = ladderSearchQuery.toLowerCase();
    const nodes = document.querySelectorAll('.ladder-node');
    const spans = document.querySelectorAll('.ladder-pkm-span-line');

    if (!q) {
      nodes.forEach(n => {
        n.classList.remove('ladder-node-dimmed', 'ladder-node-spotlight');
      });
      spans.forEach(s => {
        s.classList.remove('ladder-span-dimmed', 'ladder-span-spotlight');
      });
      return;
    }

    nodes.forEach(n => {
      const pkmName = (n.getAttribute('data-pkm') || '').toLowerCase();
      if (pkmName.includes(q)) {
        n.classList.remove('ladder-node-dimmed');
        n.classList.add('ladder-node-spotlight');
      } else {
        n.classList.remove('ladder-node-spotlight');
        n.classList.add('ladder-node-dimmed');
      }
    });

    spans.forEach(s => {
      const pkmGroup = (s.getAttribute('data-pkm-group') || '').toLowerCase();
      if (pkmGroup.includes(q)) {
        s.classList.remove('ladder-span-dimmed');
        s.classList.add('ladder-span-spotlight');
      } else {
        s.classList.remove('ladder-span-spotlight');
        s.classList.add('ladder-span-dimmed');
      }
    });
  }

  function refreshCoordinateLadder() {
    const container = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (container) {
      container.innerHTML = renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA);
      if (ladderSearchQuery) {
        applyLadderFiltersInPlace();
      }
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
    if (chargeSkill && chargeSkill.matrix && chargeSkill.matrix[stackNum]) {
      const vals = chargeSkill.matrix[stackNum].vals;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const unit = isEN ? 'Strength' : '能量';

      // 更新 Hero 雙核心看板
      const heroBase = document.getElementById('hero-base-charge_stock_s');
      const heroMax = document.getElementById('hero-max-charge_stock_s');
      if (heroBase) heroBase.textContent = `${vals[0].toLocaleString()} ${unit}`;
      if (heroMax) heroMax.textContent = `${vals[6].toLocaleString()} ${unit}`;

      // 更新 Stepper 階梯列表
      const stepper = document.getElementById('skill-stepper-charge_stock_s');
      if (stepper) {
        stepper.innerHTML = vals.map((v, i) => {
          const lv = i + 1;
          const isMax = lv === 7;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${v.toLocaleString()} ${unit}</span>
            </div>
          `;
        }).join('');
      }

      // 保留舊版相容性容器更新 (若有)
      const dynamicContainer = document.getElementById('charge-stock-dynamic-levels');
      if (dynamicContainer) {
        dynamicContainer.innerHTML = vals.map((v, i) => `
          <div class="skill-level-chip ${stackNum === 10 ? 'highlight-gold' : 'highlight-blue'}">
            <span class="level-tag">Lv.${i + 1}</span>
            <span class="level-val">${v.toLocaleString()} ${isEN ? 'Strength' : '能量'}</span>
          </div>
        `).join('');
      }
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
    if (boostSkill && boostSkill.matrix && boostSkill.matrix[kindNum]) {
      const vals = boostSkill.matrix[kindNum].vals;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const unit = isEN ? 'Helps' : '次幫忙';

      // 更新 Hero 雙核心看板
      const heroBase = document.getElementById('hero-base-helper_boost_type');
      const heroMax = document.getElementById('hero-max-helper_boost_type');
      if (heroBase) heroBase.textContent = `${vals[0]} ${unit}`;
      if (heroMax) heroMax.textContent = `${vals[5]} ${unit}`;

      // 更新 Stepper 階梯列表
      const stepper = document.getElementById('skill-stepper-helper_boost_type');
      if (stepper) {
        stepper.innerHTML = vals.map((v, i) => {
          const lv = i + 1;
          const isMax = lv === 6;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${v} ${unit}</span>
            </div>
          `;
        }).join('');
      }

      // 保留舊版相容性容器更新 (若有)
      const dynamicContainer = document.getElementById('helper-boost-dynamic-levels');
      if (dynamicContainer) {
        dynamicContainer.innerHTML = vals.map((v, i) => `
          <div class="skill-level-chip highlight-blue">
            <span class="level-tag">Lv.${i + 1}</span>
            <span class="level-val">${v} ${isEN ? 'Helps' : '次幫忙'}</span>
          </div>
        `).join('');
      }
    }
  }

  // 5.0 方案 C: 點擊卡片展開 / 收合主技能各等級階梯清單
  function toggleSkillCard(cardEl, skillId, event) {
    if (event) {
      const target = event.target;
      // 避免點擊互動式按鈕、晶片、對照表或展開/收合子按鈕時觸發卡片折疊
      if (target && target.closest && target.closest('button, a, input, select, .wiki-table-wrapper, .stack-chip-btn, .wiki-toggle-detail-btn')) {
        return;
      }
    }
    const card = cardEl || document.getElementById(`skill-card-${skillId}`);
    if (!card) return;
    card.classList.toggle('is-expanded');
  }

  function toggleSkillStepper(skillId) {
    const card = document.getElementById(`skill-card-${skillId}`);
    if (card) {
      card.classList.toggle('is-expanded');
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    grid.innerHTML = BERRY_VALUES_DATA.map(b => {
      const energy = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, isFavoriteBerry2x);
      const bName = isEN ? (window.I18N.getBerryName(b.name) || b.name) : b.name;
      const bType = isEN ? (window.I18N.getTypeName(b.type) || b.type) : b.type;
      const bonusStr = currentIslandBonus > 0 ? (isEN ? ` +${currentIslandBonus}% Island` : ` +${currentIslandBonus}%島嶼`) : '';
      const favStr = isFavoriteBerry2x ? (isEN ? ' Fav 2x' : ' 順果2x') : '';
      return `
        <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr}${favStr} ${isEN ? 'Energy' : '能量'} ${energy}">
          <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
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

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    resultVal.textContent = totalMult.toFixed(3) + (isEN ? 'x' : ' 倍');

    let grade = isEN ? 'A (Good)' : 'A (良好)';
    let gradeCls = 'grade-a';

    if (totalMult >= 1.8) {
      grade = isEN ? 'SSS (God Tier Max)' : 'SSS (頂級發動極限)';
      gradeCls = 'grade-sss';
    } else if (totalMult >= 1.6) {
      grade = isEN ? 'SS (Excellent Max)' : 'SS (優秀極限)';
      gradeCls = 'grade-ss';
    } else if (totalMult >= 1.5) {
      grade = isEN ? 'S (Dual Sub-Skills Very High)' : 'S (雙副技極高)';
      gradeCls = 'grade-s';
    } else if (totalMult >= 1.35) {
      grade = isEN ? 'A (Single STM Neutral Nature)' : 'A (單STM無性格)';
      gradeCls = 'grade-a';
    } else if (totalMult >= 1.15) {
      grade = isEN ? 'B (Moderate Boost)' : 'B (微幅加成)';
      gradeCls = 'grade-b';
    } else if (totalMult >= 1.0) {
      grade = isEN ? 'C (Baseline)' : 'C (基準線附近)';
      gradeCls = 'grade-c';
    } else if (totalMult >= 0.9) {
      grade = isEN ? 'D (Impacted by Nature Down)' : 'D (受性格下修影響)';
      gradeCls = 'grade-d';
    } else {
      grade = isEN ? 'E (Severely Hindered)' : 'E (嚴重受阻)';
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    daysResult.textContent = daysNeeded.toLocaleString() + (isEN ? ' Days' : ' 天');
    expResult.textContent = isEN 
      ? `Approx. ${baseExpNeeded.toLocaleString()} EXP (~${Math.round(dailyExp)} EXP/Day)` 
      : `約需 ${baseExpNeeded.toLocaleString()} EXP (每日約 ${Math.round(dailyExp)} EXP)`;
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
      if (e.target && e.target.id === 'ladder-nature-ing-toggle') {
        toggleLadderNatureIng(e.target.checked);
      }
      if (e.target && e.target.id === 'ladder-nature-speed-toggle') {
        toggleLadderNatureSpeed(e.target.checked);
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

    try {
      renderWikiLayout(wikiContainer);
    } catch (e) {
      console.error('Error rendering Wiki layout:', e);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('panel-wiki', '數據百科佈局渲染異常', e);
      }
    }

    try {
      bindAllEvents();
      bindGlobalDelegationFallback();
    } catch (e) {
      console.error('Error binding Wiki events:', e);
    }

    try { recalcTriggerChance(); } catch (e) {}
    try { recalcSleepDays(); } catch (e) {}
    try { refreshCoordinateLadder(); } catch (e) {}
    try { refreshBerryNodes(); } catch (e) {}
  }

  // 渲染副技能標籤
  function renderSkillBadge(skill) {
    if (!skill || !skill.name || skill.name === '-') return '<span class="text-muted">-</span>';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const displayName = isEN ? (window.I18N.getSubSkillName(skill.name) || skill.name) : skill.name;
    const cls = skill.color ? `skill-badge-${skill.color}` : '';
    const statusNote = skill.status === 'unreleased' ? (isEN ? ' <span class="badge-unreleased">(Unreleased)</span>' : ' <span class="badge-unreleased">(未開放)</span>') : '';
    return `<span class="wiki-skill-badge ${cls}">${displayName}${statusNote}</span>`;
  }

  // 渲染專長評級卡片
  function renderRatingCard(data) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const title = isEN ? (data.title_en || data.title) : data.title;
    const desc = isEN ? (data.desc_en || data.desc) : data.desc;

    return `
      <div class="wiki-card wiki-rating-card">
        <div class="wiki-card-header">
          <h3 class="wiki-card-title">${title}</h3>
        </div>
        <p class="wiki-card-desc">${desc}</p>
        
        <div class="rating-subsections">
          <div class="rating-col">
            <h4 class="rating-col-title">${isEN ? 'Sub-Skill Priority' : '副技能推薦梯度'}</h4>
            <div class="rating-list">
              ${data.subskills.map(s => {
                const sName = isEN ? (s.name_en || (window.I18N ? window.I18N.getSubSkillName(s.name) : s.name)) : s.name;
                const sDetail = isEN ? (s.detail_en || s.detail) : s.detail;
                return `
                <div class="rating-item">
                  <span class="rating-tier-tag tier-${s.grade.toLowerCase()}">${s.grade}</span>
                  <div class="rating-item-content">
                    <span class="rating-item-name font-bold text-white">${sName}</span>
                    <span class="rating-item-detail text-secondary">${sDetail}</span>
                  </div>
                </div>
              `;}).join('')}
            </div>
          </div>

          <div class="rating-col">
            <h4 class="rating-col-title">${isEN ? 'Nature Priority' : '性格推薦梯度'}</h4>
            <div class="rating-list">
              ${data.natures.map(n => {
                const nName = isEN ? (n.name_en || (window.I18N ? window.I18N.getNatureName(n.name) : n.name)) : n.name;
                const nDetail = isEN ? (n.detail_en || n.detail) : n.detail;
                return `
                <div class="rating-item">
                  <span class="rating-tier-tag tier-${n.grade.toLowerCase()}">${n.grade}</span>
                  <div class="rating-item-content">
                    <span class="rating-item-name font-bold text-white">${nName}</span>
                    <span class="rating-item-detail text-secondary">${nDetail}</span>
                  </div>
                </div>
              `;}).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function formatLadderNote(note, isEN) {
    if (!note) return '';
    let translated = (window.I18N && typeof window.I18N.translateDynamicText === 'function') 
      ? window.I18N.translateDynamicText(note) 
      : note;

    if (window.I18N && typeof window.I18N.getIngredientIcon === 'function') {
      const ingList = [
        '特選蘋果', 'Fancy Apple', '哞哞鮮奶', 'Moomoo Milk', '萌綠大豆', 'Greengrass Soybeans',
        '甜甜蜜', 'Honey', '豆製肉', 'Bean Sausage', '暖暖薑', 'Warming Ginger',
        '好眠番茄', '熟透番茄', 'Snoozy Tomato', '特選蛋', 'Fancy Egg', '純粹油', 'Pure Oil',
        '窩心洋芋', 'Soft Potato', '火辣香草', 'Fiery Herb', '萌綠玉米', 'Greengrass Corn',
        '放鬆可可', 'Soothing Cacao', '醒腦咖啡豆', 'Rousing Coffee', '嫩亮酪梨', 'Glossy Avocado',
        '品鮮蘑菇', 'Tasty Mushroom', '粗枝大蔥', 'Large Leek', '沉甸甸南瓜', 'Plump Pumpkin',
        '美味尾巴', 'Slowpoke Tail'
      ];
      ingList.forEach(ingName => {
        if (translated.includes(ingName)) {
          const icon = window.I18N.getIngredientIcon(ingName);
          if (icon) {
            const displayName = window.I18N.getIngredientName(ingName);
            const tag = `<img src="${icon}" class="ladder-note-ing-icon" alt="${displayName}" title="${displayName}">`;
            translated = translated.split(ingName).join(tag);
          }
        }
      });
    }
    return translated;
  }

  // 渲染橫向視覺座標天梯圖 (支援多型態並列節點、同組跨度連接線、大菜供應能力評定、跨軌道搜尋聚焦)
  function renderCoordinateLadder(ladderData) {
    const mult = getLadderMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    
    // 依據是否開啟各項加成動態調整刻度上限
    const maxProjected = 100 * mult;
    let minVal = 10;
    let maxVal = 105;
    let step = 10;

    if (maxProjected > 165) {
      maxVal = 220;
      step = 30;
    } else if (maxProjected > 135) {
      maxVal = 175;
      step = 25;
    } else if (maxProjected > 110) {
      maxVal = 145;
      step = 20;
    } else {
      maxVal = 105;
      step = 10;
    }

    let ticks = [];
    for (let t = 10; t <= maxVal; t += step) {
      ticks.push(t);
    }

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return ((clamped - minVal) / (maxVal - minVal) * 100).toFixed(2);
    }

    const activeBoosts = [];
    if (isLadderIngM) activeBoosts.push(isEN ? 'Ing. Finder M' : '食材M');
    if (isLadderSpeedM) activeBoosts.push(isEN ? 'Help Speed M' : '幫速M');
    if (isLadderNatureIng) activeBoosts.push(isEN ? 'Nature Ing▲▲' : '性格食材▲▲');
    if (isLadderNatureSpeed) activeBoosts.push(isEN ? 'Nature Speed▲▲' : '性格幫速▲▲');
    const boostLabel = activeBoosts.length > 0 
      ? (isEN ? ` (incl. ${activeBoosts.join(' + ')})` : ` (含 ${activeBoosts.join(' + ')} 補正)`) 
      : '';

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder" onmouseover="window.WikiDB.handleLadderGroupHover(event)" onmouseout="window.WikiDB.handleLadderGroupHoverOut(event)">
          <!-- 頂部刻度標尺 -->
          <div class="ladder-ruler-header">
            <div class="ladder-ruler-spacer">
              <span class="ruler-spacer-title">${isEN ? 'Champion' : '產量冠軍'}</span>
            </div>
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
          ${ladderData.map(ing => {
            const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { name: isEN ? 'High Tier Dish' : '高階料理', name_en: 'High Tier Dish', need: 20, type: isEN ? 'Dish' : '料理', secondary: '' };
            const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
            const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;

            // 尋找該軌道在目前篩選條件下的產量冠軍與理論極限產量
            let champPkm = null;
            let champRecipe = 'AAA';
            let champMaxBaseCount = 0;
            let totalTrackVariants = 0;

            ing.pokemon.forEach((p, pIdx) => {
              const pkmSpec = getPokemonLadderSpecialty(p.name);
              if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return;
              if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return;
              if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return;

              let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
              if (ladderRecipeFilter === 'AAA') {
                variants = variants.filter(v => v.recipe === 'AAA');
              } else if (ladderRecipeFilter === 'ABB') {
                variants = variants.filter(v => v.recipe === 'ABB');
              } else if (ladderRecipeFilter === 'AXX') {
                variants = variants.filter(v => v.recipe !== 'AAA' && v.recipe !== 'ABB');
              }

              if (ladderSupplyFilter === 'TOP') {
                variants = variants.filter((v, vIdx) => v.isTop || (p.isTop && v.recipe === p.recipe) || (pIdx < 2 && vIdx === 0));
              } else if (ladderSupplyFilter === 'MEALS_3') {
                variants = variants.filter(v => {
                  const scaled = Math.round(v.count * mult);
                  return (scaled / dishInfo.need) >= 3.0;
                });
              } else if (ladderSupplyFilter === 'MEALS_2') {
                variants = variants.filter(v => {
                  const scaled = Math.round(v.count * mult);
                  return (scaled / dishInfo.need) >= 1.8;
                });
              }

              totalTrackVariants += variants.length;
              variants.forEach(v => {
                if (v.count > champMaxBaseCount) {
                  champMaxBaseCount = v.count;
                  champPkm = p;
                  champRecipe = v.recipe;
                }
              });
            });

            const champDisplayName = champPkm 
              ? (isEN ? ((window.I18N && window.I18N.getPokemonName(champPkm.name)) || champPkm.name) : champPkm.name) 
              : '';
            const champScaledCount = Math.round(champMaxBaseCount * mult);
            const isTrackEmpty = totalTrackVariants === 0;

            // 判斷是否為預設無篩選全覽模式 (預設全覽展示前 12 名保持清爽；任何篩選/搜尋生效時展示 100% 全部符合之寶可夢)
            const isUnfilteredDefault = (ladderSpecialtyFilter === 'ALL' && ladderRecipeFilter === 'ALL' && ladderSupplyFilter === 'ALL' && !ladderSearchQuery);
            const targetPokemonList = (isUnfilteredDefault && ing.pokemon.length > 12)
              ? ing.pokemon.slice(0, 12)
              : ing.pokemon;

            return `
            <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''}" data-ladder-ing="${ing.id}">
              <div class="ladder-track-header" title="${ingName} (${isEN ? 'Base Energy' : '基礎能量'} ${ing.energy}) · ${isEN ? 'Key Dish: ' : '核心大菜：'}${dishName} (${dishInfo.need}${isEN ? '/meal' : '顆/餐'})">
                <div class="ladder-track-ing-main">
                  <img src="${ing.icon}" class="ladder-ing-icon" alt="${ingName}">
                </div>
                ${champPkm ? `
                  <div class="ladder-track-champion-badge" title="${isEN ? 'Champion: ' + champDisplayName + ' (' + champRecipe + ') - ' + champScaledCount + ' /day' : '產量冠軍：' + champDisplayName + ' (' + champRecipe + ') - 每日預估 ' + champScaledCount + ' 顆'}">
                    <span class="champ-pkm">${champDisplayName}</span>
                    <span class="champ-yield">${champScaledCount}${isEN ? '/d' : '顆'}</span>
                  </div>
                ` : `
                  <div class="ladder-track-champion-badge badge-empty" title="${isEN ? 'No matching Pokémon under current filter' : '目前篩選條件下無符合寶可夢'}">
                    <span class="champ-pkm text-muted" style="font-size: 11px;">--</span>
                  </div>
                `}
              </div>

              <div class="ladder-track-canvas">
                <div class="ladder-grid-lines">
                  ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                </div>

                <div class="ladder-track-line"></div>

                <!-- 跨度連接線容器 -->
                <div class="ladder-spans-container">
                  ${targetPokemonList.map((p, pIdx) => {
                    const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                    const pkmSpec = getPokemonLadderSpecialty(p.name);
                    if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return '';
                    if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return '';
                    if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return '';

                    let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
                    if (ladderRecipeFilter === 'AAA') {
                      variants = variants.filter(v => v.recipe === 'AAA');
                    } else if (ladderRecipeFilter === 'ABB') {
                      variants = variants.filter(v => v.recipe === 'ABB');
                    } else if (ladderRecipeFilter === 'AXX') {
                      variants = variants.filter(v => v.recipe !== 'AAA' && v.recipe !== 'ABB');
                    }

                    if (ladderSupplyFilter === 'TOP') {
                      variants = variants.filter((v, vIdx) => v.isTop || (p.isTop && v.recipe === p.recipe) || (pIdx < 2 && vIdx === 0));
                    } else if (ladderSupplyFilter === 'MEALS_3') {
                      variants = variants.filter(v => {
                        const scaled = Math.round(v.count * mult);
                        return (scaled / dishInfo.need) >= 3.0;
                      });
                    } else if (ladderSupplyFilter === 'MEALS_2') {
                      variants = variants.filter(v => {
                        const scaled = Math.round(v.count * mult);
                        return (scaled / dishInfo.need) >= 1.8;
                      });
                    }

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
                           title="${pkmDisplayName} ${isEN ? 'Range:' : '配方跨度：'}${minCount} ~ ${maxCount} ${isEN ? '/day' : '顆/天'}">
                      </div>
                    `;
                  }).join('')}
                </div>

                <!-- 寶可夢型態節點容器 (Nodes Container) -->
                <div class="ladder-nodes-container">
                  ${targetPokemonList.flatMap((p, pIdx) => {
                    const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                    const pkmSpec = getPokemonLadderSpecialty(p.name);
                    if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return [];
                    if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return [];
                    if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return [];

                    let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
                    if (ladderRecipeFilter === 'AAA') {
                      variants = variants.filter(v => v.recipe === 'AAA');
                    } else if (ladderRecipeFilter === 'ABB') {
                      variants = variants.filter(v => v.recipe === 'ABB');
                    } else if (ladderRecipeFilter === 'AXX') {
                      variants = variants.filter(v => v.recipe !== 'AAA' && v.recipe !== 'ABB');
                    }

                    if (ladderSupplyFilter === 'TOP') {
                      variants = variants.filter((v, vIdx) => v.isTop || (p.isTop && v.recipe === p.recipe) || (pIdx < 2 && vIdx === 0));
                    } else if (ladderSupplyFilter === 'MEALS_3') {
                      variants = variants.filter(v => {
                        const scaled = Math.round(v.count * mult);
                        return (scaled / dishInfo.need) >= 3.0;
                      });
                    } else if (ladderSupplyFilter === 'MEALS_2') {
                      variants = variants.filter(v => {
                        const scaled = Math.round(v.count * mult);
                        return (scaled / dishInfo.need) >= 1.8;
                      });
                    }

                    return variants.map((v, vIdx) => {
                      const scaledCount = Math.round(v.count * mult);
                      const isTopNode = v.isTop || (p.isTop && v.recipe === p.recipe);
                      const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);

                      // 大菜供應能力試算
                      const mealsPerDay = (scaledCount / dishInfo.need).toFixed(1);
                      let dishTag = '';
                      let dishBadgeClass = '';
                      if (mealsPerDay >= 3.0) {
                        dishTag = isEN ? `Full 3 Meals (${mealsPerDay} meals/day)` : `滿載 3 餐大菜 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-full';
                      } else if (mealsPerDay >= 1.8) {
                        dishTag = isEN ? `Solid 2 Meals (${mealsPerDay} meals/day)` : `充足供應 2 餐大菜 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-high';
                      } else {
                        dishTag = isEN ? `Auxiliary Support (${mealsPerDay} meals/day)` : `輔助支援 (${mealsPerDay} 餐/天)`;
                        dishBadgeClass = 'dish-badge-assist';
                      }

                      return `
                        <div class="ladder-node ${isTopNode ? 'node-top1' : ''} recipe-${v.recipe.toLowerCase()}" 
                             data-pkm-group="${p.name}"
                             data-pkm="${p.name}" 
                             data-recipe="${v.recipe}"
                             style="left: ${getPosPct(scaledCount)}%; z-index: ${zIndex};">
                          <div class="node-recipe-tag recipe-tag-${v.recipe.toLowerCase()}">${v.recipe}</div>
                          <div class="node-avatar-wrapper">
                            <img src="${p.icon}" class="node-avatar-img" alt="${pkmDisplayName}">
                          </div>
                          <div class="node-count-badge">${scaledCount}</div>
                          
                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">${isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${pkmDisplayName}</div>
                            <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估日產：'}<span class="text-success font-bold">${scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                            
                            <!-- 頂級大菜供貨能力指標 -->
                            <div class="tooltip-dish-box">
                              <div class="tooltip-dish-title">${isEN ? 'Key Dish: ' : '核心大菜：'}<span class="text-white font-bold">${dishName}</span> (${dishInfo.need}${isEN ? '/meal' : '顆/餐'})</div>
                              <div class="tooltip-dish-badge ${dishBadgeClass}">${dishTag}</div>
                            </div>

                            <div class="tooltip-note">${formatLadderNote(v.note || '', isEN)}</div>
                          </div>
                        </div>
                      `;
                    });
                  }).join('')}
                </div>
              </div>
            </div>
          `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 渲染樹果與食材基礎能量看板 (極簡無名無滾輪 18 格全展開版 + 等級滑桿、島嶼加成與順果 2x 開關)
  function renderValuesBoard() {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    return `
      <div class="values-horizontal-container">
        <!-- 區塊 1：樹果基礎能量庫 (Lv.1 ~ Lv.70 + 島嶼加成 0~85% 動態試算) -->
        <div class="values-horizontal-section">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge berry-badge">${isEN ? 'Berry Base Power' : '樹果能量庫'}</span>
              <span class="values-section-sub">${isEN ? 'Base Energy (Lv.1: 24 ➔ 35)' : '基礎能量 (Lv.1: 24 ➔ 35)'}</span>
            </div>

            <!-- 等級滑桿、島嶼加成與順果 2x 控制器 -->
            <div class="berry-calc-controls">
              <!-- 寶可夢等級滑桿 (1 ~ 70) -->
              <div class="berry-control-group">
                <label for="berry-level-slider" class="berry-control-label">
                  ${isEN ? 'Level:' : '等級：'}<span id="berry-level-display" class="berry-level-tag">Lv. ${currentBerryLevel}</span>
                </label>
                <input type="range" id="berry-level-slider" min="1" max="70" value="${currentBerryLevel}" step="1" class="berry-slider" oninput="window.WikiDB.updateBerryLevel(this.value)">
              </div>

              <!-- 島嶼加成滑桿 (0% ~ 85%) -->
              <div class="berry-control-group">
                <label for="berry-island-slider" class="berry-control-label">
                  ${isEN ? 'Island Bonus:' : '島嶼加成：'}<span id="berry-island-display" class="berry-island-tag">+${currentIslandBonus}%</span>
                </label>
                <input type="range" id="berry-island-slider" min="0" max="85" value="${currentIslandBonus}" step="5" class="berry-slider island-slider" oninput="window.WikiDB.updateBerryIsland(this.value)">
              </div>

              <!-- 順果 2x 開關 -->
              <div class="berry-control-group">
                <label class="berry-switch-label" title="${isEN ? 'Favorite Berry 2x Energy Multiplier' : '卡比獸喜愛樹果 (順果) 能量翻倍 (2x)'}">
                  <input type="checkbox" id="berry-favorite-toggle" ${isFavoriteBerry2x ? 'checked' : ''} onchange="window.WikiDB.toggleBerryFavorite(this.checked)">
                  <span class="berry-switch-slider"></span>
                  <span class="berry-switch-text">${isEN ? 'Favorite 2x' : '順果 2x'}</span>
                </label>
              </div>
            </div>
          </div>

          <div id="values-berry-grid" class="values-compact-grid values-berry-grid">
            ${BERRY_VALUES_DATA.map(b => {
              const energy = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, isFavoriteBerry2x);
              const bName = isEN ? (window.I18N.getBerryName(b.name) || b.name) : b.name;
              const bType = isEN ? (window.I18N.getTypeName(b.type) || b.type) : b.type;
              const bonusStr = currentIslandBonus > 0 ? (isEN ? ` +${currentIslandBonus}% Island` : ` +${currentIslandBonus}%島嶼`) : '';
              const favStr = isFavoriteBerry2x ? (isEN ? ' Fav 2x' : ' 順果2x') : '';
              return `
                <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr}${favStr} ${isEN ? 'Energy' : '能量'} ${energy}">
                  <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
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
              <span class="values-section-badge ing-badge">${isEN ? '🍲 Ingredient Base Power' : '🍲 食材基礎能量庫'}</span>
              <span class="values-section-sub">${isEN ? 'Ingredient Base Power (90 ➔ 342)' : '食材基礎能量一覽'}</span>
            </div>
          </div>

          <div class="values-compact-grid values-ing-grid">
            ${INGREDIENT_VALUES_DATA.map(ing => {
              const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;
              return `
              <div class="value-compact-node ${ing.id === 'tail' ? 'value-tail-highlight' : ''}" title="${ingName} - ${isEN ? 'Base Energy' : '基礎能量'} ${ing.energy}">
                <img src="${ing.icon}" class="value-compact-icon" alt="${ingName}">
                <span class="value-compact-energy ing-val">${ing.energy}</span>
              </div>
            `;}).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 渲染食材天梯榜卡片 (舊版清單檢視)
  // 渲染食材天梯榜卡片 (舊版清單檢視)
  function renderIngredientLadders(ladders) {
    const mult = getLadderMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    return ladders.map(ing => {
      const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;
      const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { need: 20 };
      
      let filteredTiers = ing.tiers.filter((t, tIdx) => {
        const pkmSpec = getPokemonLadderSpecialty(t.name);
        if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return false;
        if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return false;
        if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return false;

        const recipe = t.recipe || 'AAA';
        if (ladderRecipeFilter === 'AAA' && recipe !== 'AAA') return false;
        if (ladderRecipeFilter === 'ABB' && recipe !== 'ABB') return false;
        if (ladderRecipeFilter === 'AXX' && (recipe === 'AAA' || recipe === 'ABB')) return false;

        const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
        const scaledCount = rawCountNum * mult;
        if (ladderSupplyFilter === 'TOP' && tIdx >= 2) return false;
        if (ladderSupplyFilter === 'MEALS_3' && (scaledCount / dishInfo.need) < 3.0) return false;
        if (ladderSupplyFilter === 'MEALS_2' && (scaledCount / dishInfo.need) < 1.8) return false;

        return true;
      });

      const maxDailyBase = filteredTiers.length > 0 ? (filteredTiers[0].rawCount !== undefined ? filteredTiers[0].rawCount : filteredTiers[0].count) : 0;
      const scaledMax = (parseFloat(maxDailyBase) * mult).toFixed(1);

      return `
      <div class="ladder-card ${filteredTiers.length === 0 ? 'ladder-track-empty' : ''}" data-ladder-ing="${ing.id}">
        <div class="ladder-header">
          <div class="ladder-title-group">
            <img src="${ing.icon}" class="ladder-icon" alt="${ingName}">
            <h4 class="ladder-name">${ingName}</h4>
          </div>
          <span class="ladder-max-badge">${filteredTiers.length > 0 ? (isEN ? 'Max Daily ~ ' : '最高日產 ~ ') + scaledMax + (isEN ? '/day' : '顆/天') : (isEN ? 'No Match' : '無符合')}</span>
        </div>

        <div class="ladder-tiers-list">
          ${filteredTiers.length === 0 ? `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '無符合篩選條件之寶可夢'}</div>` : filteredTiers.map(t => {
            const rawName = t.name || '';
            const translatedPkm = isEN ? ((window.I18N && window.I18N.getPokemonName(rawName)) || rawName) : rawName;
            const pkmDisplayName = `${translatedPkm} (${t.recipe || 'AAA'})`;
            const noteText = formatLadderNote(t.note || '', isEN);
            const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
            const displayCount = (rawCountNum * mult).toFixed(1);

            return `
            <div class="ladder-tier-row">
              <div class="ladder-tier-info">
                <span class="ladder-pkm-name font-bold">${pkmDisplayName}</span>
                <span class="ladder-count text-accent font-bold">${displayCount} ${isEN ? '/day' : '顆/天'}</span>
              </div>
              <div class="ladder-progress-bar">
                <div class="ladder-progress-fill" style="width: ${t.rate}%"></div>
              </div>
              <div class="ladder-note text-muted">${noteText}</div>
            </div>
          `;}).join('')}
        </div>
      </div>
    `;}).join('');
  }

  // 方案 C: 渲染技能「精華單行速查 (Lv.1 ➔ Lv.Max)」與「縱向階梯清單（隨卡片點擊展開/收合）」
  function renderSkillHeroAndStepper(skillId, levelsData, unitLabel, maxLv = 7) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    if (!levelsData || levelsData.length === 0) return '';

    const actualMaxLv = levelsData.length;
    const baseVal = levelsData[0];
    const maxVal = levelsData[actualMaxLv - 1];

    return `
      <!-- 精華單行速查 (無外框、無emoji、單行極簡展示) -->
      <div class="skill-hero-summary single-line">
        <span class="hero-stat-item">
          <span class="hero-lv-label">Lv.1</span>
          <span class="hero-val-text" id="hero-base-${skillId}">${baseVal}</span>
        </span>
        <span class="hero-arrow-icon">➔</span>
        <span class="hero-stat-item item-max">
          <span class="hero-lv-label tag-max">Lv.${actualMaxLv}</span>
          <span class="hero-val-text val-max" id="hero-max-${skillId}">${maxVal}</span>
        </span>
      </div>

      <!-- 展開後的縱向階梯列表 (隨卡片 .is-expanded 狀態展開/收合) -->
      <div id="skill-stepper-${skillId}" class="skill-stepper-list">
        ${levelsData.map((val, idx) => {
          const lv = idx + 1;
          const isMax = lv === actualMaxLv;
          return `
            <div class="skill-step-item ${isMax ? 'item-max' : ''}">
              <span class="step-tag-badge">Lv.${lv}</span>
              <span class="step-val-text">${val}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 渲染技能卡片 (方案 C: 精華看板 + 點擊卡片展開/收合階梯)
  function renderSkillsCards(skills) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    const catNameMap = {
      energy: isEN ? 'Strength' : '能量系',
      energy_heal: isEN ? 'Energy Heal' : '活力系',
      ingredient: isEN ? 'Ingredients' : '食材與料理',
      special: isEN ? 'Special/Legend' : '神獸與特殊專屬',
      shards: isEN ? 'Dream Shards' : '夢之碎片'
    };

    return skills.map(skill => {
      let valuesHtml = '';
      const rawSkillName = skill.name || skill.id;
      const skillName = isEN ? (window.I18N ? (window.I18N.getMainSkillName(rawSkillName) || skill.name_en || rawSkillName) : rawSkillName) : rawSkillName;
      const catLabel = catNameMap[skill.category] || skill.catName;
      const unitLabel = isEN ? (skill.unit_en || (skill.unit.includes('能量') ? ' Strength' : (skill.unit.includes('食材') ? ' Ingredients' : (skill.unit.includes('次') ? ' Helps' : (skill.unit.includes('點') ? ' Energy' : skill.unit))))) : skill.unit;

      if (skill.hasStackMatrix) {
        const sampleStrings = skill.matrix[10].vals.map(v => `${v.toLocaleString()} ${unitLabel}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${isEN ? 'Stack Count:' : '蓄力次數切換：'}</span>
              <div class="stack-chips-group" id="charge-stack-chips">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
                  <button type="button" class="stack-chip-btn ${s === 10 ? 'active' : ''}" data-stack-target="${s}" onclick="window.WikiDB.switchStack(${s})">${s}${isEN ? 'x' : '次'}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 7)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="charge-matrix-table" onclick="window.WikiDB.toggleDetail('charge-matrix-table')">
                ${isEN ? 'Toggle 0~10 Stack Value Matrix' : '展開 / 收合完整 0~10 次蓄力數值表'}
              </button>
            </div>

            <div id="charge-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${isEN ? 'Stacks' : '蓄力次數'}</th>
                    ${[1, 2, 3, 4, 5, 6, 7].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.stacks === 10 ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.stacks} ${isEN ? 'Stacks' : '次'}</td>
                      ${m.vals.map(v => `<td>${v.toLocaleString()}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasTypeKindsMatrix) {
        const sampleStrings = skill.matrix[5].vals.map(v => `${v} ${isEN ? 'Helps' : '次幫忙'}`);
        valuesHtml = `
          <div class="skill-interactive-section">
            <div class="stack-selector-row">
              <span class="stack-selector-label">${isEN ? 'Same-type Species:' : '同屬性種類數：'}</span>
              <div class="stack-chips-group" id="helper-boost-chips">
                ${[0, 1, 2, 3, 4, 5].map(k => `
                  <button type="button" class="stack-chip-btn ${k === 5 ? 'active' : ''}" data-boost-kind="${k}" onclick="window.WikiDB.switchBoost(${k})">${k} ${isEN ? 'Types' : '種類'}</button>
                `).join('')}
              </div>
            </div>

            ${renderSkillHeroAndStepper(skill.id, sampleStrings, unitLabel, 6)}

            <!-- 展開完整對照表按鈕 -->
            <div style="margin-top: 8px;">
              <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="helper-boost-table" onclick="window.WikiDB.toggleDetail('helper-boost-table')">
                ${isEN ? 'Toggle 0~5 Types Comparison Table' : '展開 / 收合完整 0~5 種類對照表'}
              </button>
            </div>

            <div id="helper-boost-table" class="wiki-table-wrapper" style="display: none; margin-top: 8px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${isEN ? 'Same-Type' : '同屬種類'}</th>
                    ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${(m.kinds === '5 種類' || m.kinds_en === '5 Species') ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${isEN ? (m.kinds_en || m.kinds) : m.kinds}</td>
                      ${m.vals.map(v => `<td>${v} ${isEN ? 'Helps' : '次'}</td>`).join('')}
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `;
      } else if (skill.hasMoonlightChips) {
        const mlStrings = skill.selfValues.map((v, i) => isEN ? `Self ${v}+Ally ${skill.teamValues[i]}${unitLabel.trim()}` : `自${v}+他${skill.teamValues[i]}${unitLabel.trim()}`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, mlStrings, unitLabel, 6);
      } else if (skill.hasLunarPrayerMatrix) {
        const lpStrings = skill.healValues.map((v, i) => {
          const formula = skill.berryFormulas ? skill.berryFormulas[i] : ["14+2n", "19+3n", "24+4n", "29+5n", "30+7n", "32+9n"][i];
          return isEN ? `All ${v}+${formula}` : `全隊${v}點+${formula}`;
        });
        valuesHtml = `
          ${renderSkillHeroAndStepper(skill.id, lpStrings, unitLabel, 6)}

          <!-- 展開完整 1~5 種類隊友樹果對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="lunar-prayer-table" onclick="window.WikiDB.toggleDetail('lunar-prayer-table')">
              ${isEN ? 'Toggle 1~5 Species Berry Table' : '展開 / 收合 1~5 種類隊友樹果表'}
            </button>
          </div>

          <div id="lunar-prayer-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="white-space: nowrap;">${isEN ? 'Species' : '種類'}</th>
                  ${[1, 2, 3, 4, 5, 6].map(lv => `<th>Lv.${lv}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${skill.berryMatrix.map((m, idx) => `
                  <tr class="${idx === 4 ? 'row-highlight' : ''}">
                    <td class="font-bold text-accent" style="white-space: nowrap;">${isEN ? (m.kinds_en || m.kinds) : m.kinds}</td>
                    ${m.vals.map(v => `<td style="font-size: 10.5px; white-space: nowrap;">${v}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (skill.hasIngredientDrawMatrix) {
        const ingStrings = skill.values.map(v => `${v}${unitLabel.trim()}`);
        valuesHtml = `
          ${renderSkillHeroAndStepper(skill.id, ingStrings, unitLabel, 6)}

          <!-- 展開各寶可夢專屬食材池對照表按鈕 -->
          <div style="margin-top: 6px;">
            <button type="button" class="wiki-toggle-detail-btn" data-toggle-target="ing-draw-matrix-table" onclick="window.WikiDB.toggleDetail('ing-draw-matrix-table')">
              ${isEN ? 'Toggle Candidate Ingredient Pools per Pokémon' : '展開 / 收合 各寶可夢「專屬食材池」對照表'}
            </button>
          </div>

          <div id="ing-draw-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
            <table class="wiki-mini-table">
              <thead>
                <tr>
                  <th style="width: 44px; text-align: center;">${isEN ? 'Pokémon' : '寶可夢'}</th>
                  <th>${isEN ? 'Skill Variant' : '主技能型態'}</th>
                  <th style="text-align: center;">${isEN ? 'Candidate Ingredients (3)' : '專屬食材 (3種)'}</th>
                </tr>
              </thead>
              <tbody>
                ${INGREDIENT_DRAW_POKEMONS.map(p => `
                  <tr>
                    <td style="text-align: center; padding: 5px 4px;">
                      <img src="${p.icon}" width="30" height="30" style="object-fit: contain; vertical-align: middle; border-radius: 6px;" alt="${isEN ? p.name_en : p.name}" title="${isEN ? (p.family_en || p.name_en) : (p.family || p.name)}">
                    </td>
                    <td style="text-align: center; padding: 5px 6px;">
                      <span class="wiki-skill-badge skill-badge-blue">${isEN ? p.skill_en : p.skill}</span>
                      ${(p.id === 430 || p.id === 303) ? `<div style="font-size: 9.5px; color: var(--color-note-highlight, #d97706); margin-top: 3px; line-height: 1.2;">${isEN ? p.extraEffect_en : p.extraEffect}</div>` : ''}
                    </td>
                    <td style="text-align: center; padding: 5px 4px;">
                      <div style="display: inline-flex; align-items: center; gap: 4px; justify-content: center; flex-direction: row; flex-wrap: nowrap;">
                        ${p.ingredients.map(ig => `
                          <div class="wiki-ing-badge" title="${isEN ? ig.name_en : ig.name}" style="display: inline-flex; align-items: center; justify-content: center; background: var(--bg-card-inner); padding: 2px 4px; border-radius: 5px; border: 1px solid var(--border-color-subtle); cursor: help;">
                            <img src="${ig.icon}" width="20" height="20" alt="${isEN ? ig.name_en : ig.name}" style="object-fit: contain; vertical-align: middle;">
                          </div>
                        `).join('')}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      } else if (skill.hasDualValues) {
        const dualStrings = skill.selfValues.map((v, i) => `${v}+${skill.teamValues[i]}*4`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, dualStrings, unitLabel, skill.selfValues.length);
      } else if (skill.ranges) {
        const rangeStrings = skill.ranges.map(r => `${r.min.toLocaleString()}~${r.max.toLocaleString()}${unitLabel.trim()}`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, rangeStrings, unitLabel, skill.ranges.length);
      } else if (skill.values) {
        const valStrings = skill.values.map(v => `${typeof v === 'number' ? v.toLocaleString() : v}${unitLabel.trim()}`);
        valuesHtml = renderSkillHeroAndStepper(skill.id, valStrings, unitLabel, skill.values.length);
      } else {
        valuesHtml = `<div class="skill-level-chip"><span class="level-val">${unitLabel}</span></div>`;
      }

      const skillDesc = isEN ? (skill.desc_en || skill.desc) : skill.desc;
      const specialNote = skill.specialNote ? (isEN ? (skill.specialNote_en || skill.specialNote) : skill.specialNote) : null;
      const penaltyNote = skill.penaltyNote ? (isEN ? (skill.penaltyNote_en || skill.penaltyNote) : skill.penaltyNote) : null;

      return `
        <div class="wiki-skill-card clickable-card" id="skill-card-${skill.id}" data-category="${skill.category}" onclick="window.WikiDB.toggleSkillCard(this, '${skill.id}', event)">
          <div class="skill-card-top">
            <div class="skill-title-badges">
              <h4 class="skill-name-text">${skillName}</h4>
              <span class="skill-cat-tag cat-${skill.category}">${catLabel}</span>
            </div>
            <div class="skill-top-right">
              <span class="skill-max-lv-badge">${isEN ? 'Max Lv.' : '上限 Lv.'}${skill.maxLevel}</span>
              <span class="skill-card-chevron">▾</span>
            </div>
          </div>

          <p class="skill-desc-text">
            ${skillDesc}
            ${specialNote ? `<span class="skill-note-inline">${specialNote}</span>` : ''}
            ${penaltyNote ? `<span class="skill-penalty-inline">${penaltyNote}</span>` : ''}
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    container.innerHTML = `
      <!-- 天梯專屬側邊篩選器 (Mobile: 抽屜式 / Desktop: 左側固定) -->
      <aside id="ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${isMobileH5 ? 'collapsed' : ''}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}" aria-label="${isEN ? 'Ladder Filters' : '天梯篩選器'}">
        <div class="sidebar-header">
          <button type="button" id="ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.closeLadderSidebar()" title="${isEN ? 'Close' : '收合'}" aria-label="${isEN ? 'Close' : '收合'}">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="sidebar-title-group">
            <span class="sidebar-title">${isEN ? 'Ladder Filters' : '天梯篩選器'}</span>
          </div>
          <button type="button" id="ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetLadderFilters()" title="${isEN ? 'Reset All Filters' : '重設所有條件'}">${isEN ? 'Reset All' : '全部重設'}</button>
        </div>

        <div class="sidebar-scrollable-content">
          <!-- 1. 搜尋寶可夢 -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Search Pokémon' : '搜尋寶可夢'}</span>
              <button type="button" id="ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${ladderSearchQuery ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearLadderSearch()">${isEN ? 'Clear' : '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <input type="text" id="ladder-pkm-search-input" class="sidebar-search-input" placeholder="${isEN ? 'Search Pokémon...' : '搜尋寶可夢名稱...'}" value="${ladderSearchQuery}" oninput="window.WikiDB.onLadderSearch(this.value)">
            </div>
          </div>

          <!-- 2. 產量與供餐梯隊 (Supply Tier) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Supply Tier' : '產量供餐梯隊'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'ALL' ? 'active' : ''}" data-supply-filter="ALL" onclick="window.WikiDB.setLadderSupplyFilter('ALL')">${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'TOP' ? 'active' : ''}" data-supply-filter="TOP" onclick="window.WikiDB.setLadderSupplyFilter('TOP')">${isEN ? 'Top 1-2' : '冠亞軍'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_3' ? 'active' : ''}" data-supply-filter="MEALS_3" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_3')">${isEN ? '3 Meals' : '滿載 3 餐'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_2' ? 'active' : ''}" data-supply-filter="MEALS_2" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_2')">${isEN ? '2 Meals' : '充足 2 餐'}</button>
            </div>
          </div>

          <!-- 3. 食材組合型態 (Recipe Structure) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Recipe Structure' : '食材組合型態'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ALL' ? 'active' : ''}" data-recipe-filter="ALL" onclick="window.WikiDB.setLadderRecipeFilter('ALL')">${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AAA' ? 'active' : ''}" data-recipe-filter="AAA" onclick="window.WikiDB.setLadderRecipeFilter('AAA')">${isEN ? 'Pure AAA' : '純種 AAA'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'ABB' ? 'active' : ''}" data-recipe-filter="ABB" onclick="window.WikiDB.setLadderRecipeFilter('ABB')">${isEN ? 'Dual ABB' : '雙食材 ABB'}</button>
              <button type="button" class="tag-btn ${ladderRecipeFilter === 'AXX' ? 'active' : ''}" data-recipe-filter="AXX" onclick="window.WikiDB.setLadderRecipeFilter('AXX')">${isEN ? 'Mix AXX' : '混搭 AXX'}</button>
            </div>
          </div>

          <!-- 4. 寶可夢專長分類 (Specialty Type) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Specialty Type' : '寶可夢專長'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'ALL' ? 'active' : ''}" data-specialty-filter="ALL" onclick="window.WikiDB.setLadderSpecialtyFilter('ALL')">${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'INGREDIENT' ? 'active' : ''}" data-specialty-filter="INGREDIENT" onclick="window.WikiDB.setLadderSpecialtyFilter('INGREDIENT')">${isEN ? 'Ingredient' : '食材型'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'BERRY' ? 'active' : ''}" data-specialty-filter="BERRY" onclick="window.WikiDB.setLadderSpecialtyFilter('BERRY')">${isEN ? 'Berry' : '樹果型'}</button>
              <button type="button" class="tag-btn ${ladderSpecialtyFilter === 'SKILL' ? 'active' : ''}" data-specialty-filter="SKILL" onclick="window.WikiDB.setLadderSpecialtyFilter('SKILL')">${isEN ? 'Skill' : '技能型'}</button>
            </div>
          </div>

          <!-- 5. 檢視呈現模式 -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'View Mode' : '檢視模式'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderViewMode === 'coordinate' ? 'active' : ''}" data-ladder-view="coordinate" onclick="window.WikiDB.switchLadderView('coordinate')">${isEN ? 'Visual' : '視覺天梯'}</button>
              <button type="button" class="tag-btn ${ladderViewMode === 'list' ? 'active' : ''}" data-ladder-view="list" onclick="window.WikiDB.switchLadderView('list')">${isEN ? 'List' : '卡片清單'}</button>
            </div>
          </div>

          <!-- 4. 副技能補正模擬 (Sub-Skill Boost Simulation) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Sub-Skills' : '副技能補正模擬'}</span>
            </div>
            <label class="sidebar-final-evo-label" for="ladder-ing-m-toggle" title="${isEN ? 'Ingredient Finder M (+36%)' : '食材發現機率提升M (+36%)'}">
              <span class="sidebar-final-evo-text">${isEN ? 'Ing. Finder M (+36%)' : '食材機率提升M (+36%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-ing-m-toggle" class="switch-checkbox" ${isLadderIngM ? 'checked' : ''} onchange="window.WikiDB.toggleLadderIngM(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>

            <label class="sidebar-final-evo-label" for="ladder-speed-m-toggle" title="${isEN ? 'Helping Speed M (+16.3% helps)' : '幫忙速度M (-14% 間隔時間，約 +16.3% 幫忙次數)'}" style="margin-top: 6px;">
              <span class="sidebar-final-evo-text">${isEN ? 'Helping Speed M (+16.3%)' : '幫忙速度提升M (+16.3%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-speed-m-toggle" class="switch-checkbox" ${isLadderSpeedM ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSpeedM(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>
          </div>

          <!-- 5. 性格補正模擬 (Nature Boost Simulation) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Natures' : '性格補正模擬'}</span>
            </div>
            <label class="sidebar-final-evo-label" for="ladder-nature-ing-toggle" title="${isEN ? 'Nature Ingredient Rate Up (+20%)' : '性格食材機率提升▲▲ (+20%)'}">
              <span class="sidebar-final-evo-text">${isEN ? 'Ing. Rate ▲▲ (+20%)' : '食材機率提升▲▲ (+20%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-nature-ing-toggle" class="switch-checkbox" ${isLadderNatureIng ? 'checked' : ''} onchange="window.WikiDB.toggleLadderNatureIng(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>

            <label class="sidebar-final-evo-label" for="ladder-nature-speed-toggle" title="${isEN ? 'Nature Helping Speed Up (+10% helps)' : '性格幫忙速度提升▲▲ (-9.09% 間隔時間，約 +10% 幫忙次數)'}" style="margin-top: 6px;">
              <span class="sidebar-final-evo-text">${isEN ? 'Help Speed ▲▲ (+10%)' : '幫忙速度提升▲▲ (+10%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-nature-speed-toggle" class="switch-checkbox" ${isLadderNatureSpeed ? 'checked' : ''} onchange="window.WikiDB.toggleLadderNatureSpeed(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>
          </div>
        </div>
      </aside>

      <div class="wiki-main-container">
        <!-- 二級子分頁導航 (Sub-tabs) - 精簡無大標題橫幅 -->
        <div class="wiki-subnav-bar">
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills' ? 'active' : ''}" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">${isMobileH5 ? (isEN ? 'Skills' : '主技能') : (isEN ? 'Main Skills DB' : '主技能數值庫')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'subskills' ? 'active' : ''}" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">${isMobileH5 ? (isEN ? 'Subskills' : '副技性格') : (isEN ? 'Sub-Skills & Natures' : '副技能與性格指南')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ratings' ? 'active' : ''}" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">${isMobileH5 ? (isEN ? 'Growth' : '培育指南') : (isEN ? 'Growth & Tier Guide' : '培育與評級指南')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">${isMobileH5 ? (isEN ? 'Ladder' : '食材天梯') : (isEN ? 'Ingredient Yield Ladder' : '食材產量天梯榜')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'values' ? 'active' : ''}" data-subtab="values" onclick="window.WikiDB.switchSubTab('values')">${isMobileH5 ? (isEN ? 'Values' : '能量速查') : (isEN ? 'Berry & Ing. Values' : '樹果與食材能量')}</button>
          </div>
        </div>

        <!-- 子分頁 1：主技能數值庫 (Main Skills) -->
        <div id="wiki-subpanel-skills" class="wiki-subpanel ${currentWikiSubTab === 'skills' ? 'active' : ''}" style="${currentWikiSubTab === 'skills' ? 'display:block;' : 'display:none;'}">
          <div class="wiki-control-bar">
            <div class="wiki-filter-pills">
              <span class="wiki-pill-label">${isEN ? 'Skill Type:' : '技能類型：'}</span>
              <button type="button" class="wiki-pill-btn active" data-skill-cat="all" onclick="window.WikiDB.filterSkills('all')">${isEN ? 'All Skills' : '全部技能'} (${MAIN_SKILLS_DATA.length})</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="energy" onclick="window.WikiDB.filterSkills('energy')">${isEN ? 'Strength' : '能量系'}</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="energy_heal" onclick="window.WikiDB.filterSkills('energy_heal')">${isEN ? 'Energy Recovery' : '活力系'}</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="ingredient" onclick="window.WikiDB.filterSkills('ingredient')">${isEN ? 'Ingredients' : '食材與料理'}</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="special" onclick="window.WikiDB.filterSkills('special')">${isEN ? 'Legend & Special' : '神獸與特殊專屬'}</button>
              <button type="button" class="wiki-pill-btn" data-skill-cat="shards" onclick="window.WikiDB.filterSkills('shards')">${isEN ? 'Dream Shards' : '夢之碎片'}</button>
            </div>
          </div>

          <div id="wiki-skills-grid" class="wiki-skills-grid">
            ${renderSkillsCards(MAIN_SKILLS_DATA)}
          </div>
        </div>

        <!-- 子分頁 2：副技能與性格指南 (Sub-Skills & Natures) -->
        <div id="wiki-subpanel-subskills" class="wiki-subpanel ${currentWikiSubTab === 'subskills' ? 'active' : ''}" style="${currentWikiSubTab === 'subskills' ? 'display:block;' : 'display:none;'}">
          <!-- 主技能發動機率矩陣速查表 -->
          <div class="wiki-card">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Main Skill Trigger Chance Matrix' : '主技能發動機率矩陣'}</h3>
            </div>
            <div class="wiki-rule-banner">
              ${isEN 
                ? '<strong>Formula</strong>: <code>(1 + Sub-Skill %) × Nature Multiplier = Final Multiplier</code>' 
                : '<strong>公式</strong>：<code>(1 + 副技能提升%) × 性格倍率 = 最終發動總倍率</code>'}
            </div>

            <!-- 速查對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${isEN ? 'Sub-Skills' : '副技能組合'}</th>
                    <th style="text-align: center;">${isEN ? 'Nature' : '性格'}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${isEN ? 'Calculation Formula' : '乘算計算式'}</th>
                    <th style="text-align: center;">${isEN ? 'Total Multiplier' : '總倍率'}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${isEN ? 'Trigger Tier' : '發動強度評級'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${TRIGGER_CHANCE_MATRIX.map(row => `
                    <tr>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: nowrap; white-space: nowrap;">
                          ${row.subskills && row.subskills.length > 0 
                            ? row.subskills.map(s => {
                                const sName = isEN 
                                  ? (s.name.includes('M') ? 'Trigger M' : 'Trigger S') 
                                  : s.name.replace('技能機率提升', '機率提升');
                                return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                              }).join('') 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">✕</span>`}
                        </div>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        ${row.natureBadge === 'up' 
                          ? `<span class="matrix-rate-up">${isEN ? '▲▲ Up' : '▲▲ 上升'}</span>` 
                          : (row.natureBadge === 'down' 
                            ? `<span class="matrix-rate-down">${isEN ? '▼▼ Down' : '▼▼ 下降'}</span>` 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">✕</span>`)}
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="text-accent font-bold" style="font-size: 13px;">x${row.multiplier.toFixed(3)}</span>
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge tier-${row.grade[0].toLowerCase()}">${isEN ? (row.grade_en || row.grade) : row.grade}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 副技能完整階級與數值說明表格 -->
          <div class="wiki-card" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Sub-Skills Complete Tier & Stats Overview' : '副技能階級與數值總覽'}</h3>
            </div>
            <div class="wiki-rule-banner">
              ${isEN 
                ? '<strong>Rule</strong>: Helping speed buff from sub-skills is <strong>capped at 35%</strong> per Pokémon (includes own Helping Speed M/S plus stacked 5% Helping Bonus from all teammates).' 
                : '<strong>規則</strong>：單隻寶可夢受副技能加成之幫忙速度<strong>上限為 35%</strong>（包含自身幫速 M/S，以及全隊所有隊友攜帶「幫手獎勵」每隻 5% 之全隊疊加）。'}
            </div>
            <div class="wiki-table-wrapper">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${isEN ? 'Category' : '專長分類'}</th>
                    <th>${isEN ? 'Skill Tags' : '技能標籤'}</th>
                    <th>${isEN ? 'Detailed Effect' : '詳細效果說明'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SUB_SKILLS_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-accent" style="vertical-align: middle; text-align: center;">${isEN ? (row.category_en || row.category) : row.category}</td>
                      <td style="vertical-align: middle;">
                        <div class="wiki-subskill-tags-col">
                          ${row.skills.map(s => renderSkillBadge(s)).join('')}
                        </div>
                      </td>
                      <td class="text-secondary" style="vertical-align: middle;">${isEN ? (row.desc_en || row.desc) : row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 性格五維加成倍率表 -->
          <div class="wiki-card" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Nature 5-Stat Multiplier Table' : '性格五維屬性倍率表'}</h3>
            </div>
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${isEN ? 'Stat' : '屬性項目'}</th>
                    <th style="text-align: center;">${isEN ? '▲▲ Nature' : '▲▲ 性格'}</th>
                    <th style="text-align: center;">${isEN ? '▼▼ Nature' : '▼▼ 性格'}</th>
                    <th>${isEN ? 'Mechanic Details' : '影響機制說明'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${NATURES_EFFECT_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-accent" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.stat_en || row.stat) : row.stat}</td>
                      <td class="text-success font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.up_en || row.up) : row.up}</td>
                      <td class="text-danger font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.down_en || row.down) : row.down}</td>
                      <td class="text-secondary" style="vertical-align: middle;">${isEN ? (row.desc_en || row.desc) : row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 3：培育與評級指南 (Ratings & Growth) -->
        <div id="wiki-subpanel-ratings" class="wiki-subpanel ${currentWikiSubTab === 'ratings' ? 'active' : ''}" style="${currentWikiSubTab === 'ratings' ? 'display:block;' : 'display:none;'}">
          <!-- 培育週期與核心思維 -->
          <div class="wiki-card">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Core Growth & Investment Cycle Guide' : '新手與進階養成核心週期指引'}</h3>
            </div>
            <div class="wiki-strategy-grid">
              <div class="strategy-item">
                <div class="strategy-badge">${isEN ? 'Early Goal' : '前期目標'}</div>
                <div class="strategy-title">${isEN ? 'Prioritize Lv.30' : '優先放置在 Lv.30'}</div>
                <div class="strategy-desc">${isEN ? 'Focus on nature and Lv.10 & Lv.25 sub-skills. Takes ~2-4 months for free/light players to unlock 2nd ingredient slot, becoming core pillars.' : '先看性格與 Lv.10 & Lv.25 副技能，無課/微課約養成 2~4 個月即可解鎖第 2 種食材，成為中流砥柱。'}</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">${isEN ? 'Late Game' : '後期投資'}</div>
                <div class="strategy-title">${isEN ? 'Carefully Invest in Lv.50~60' : '慎選投入 Lv.50~60'}</div>
                <div class="strategy-desc">${isEN ? 'Ensure sub-skills and nature reach Ⓢ/Ⓐ graduation tier before heavily investing candies and Main Skill Seeds (~5-10 months).' : '確認副技能與性格皆達 Ⓢ/Ⓐ 畢業級再投入大量糖果與金種子（約需 5~10 個月養成時間）。'}</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">${isEN ? 'Energy Core' : '活力核心'}</div>
                <div class="strategy-title">${isEN ? 'Raise One Dedicated Healer First' : '優先養成一隻主力補師'}</div>
                <div class="strategy-desc">${isEN ? 'Maintaining team energy > 80% grants 2.2x~2.5x helping speed! Recommended healers: Wigglytuff, Sylveon, Gardevoir, or Pawmot.' : '全體活力維持在 80% 以上可享受 2.2x~2.5x 幫忙速度！建議先練：胖可丁、仙子伊布、沙奈朵或巴布土撥。'}</div>
              </div>
              <div class="strategy-item">
                <div class="strategy-badge">${isEN ? 'Seed Rules' : '種子機制'}</div>
                <div class="strategy-title">${isEN ? 'Main & Sub Skill Seed Rules' : '主技能與副技能種子規則'}</div>
                <div class="strategy-desc">${isEN ? 'Each evolution grants Main Skill Lv.+1 and inventory +5. Duplicate sub-skills cannot coexist (if S and M already exist, S cannot upgrade to M).' : '每次進化主技能+1、持有上限+5。副技能不能同時存在相同名稱技能（如已有S與M，則S無法再升階為M）。'}</div>
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
              <h3 class="wiki-card-title">${isEN ? 'Pokémon Sleep EXP & Days Calculator' : '寶可夢睡眠升級天數計算器'}</h3>
            </div>
            <p class="wiki-card-desc">${isEN ? 'Based on 100 daily sleep score (100 base EXP), calculates required sleep days and EXP from current to target level.' : '依據每日睡滿 100 分（100 EXP 基礎），計算從目前等級升至目標等級所需睡眠天數與經驗值。'}</p>
            
            <div class="calc-inputs-row">
              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-cur-lv">${isEN ? 'Current Level:' : '目前等級：'}</label>
                <input type="number" id="calc-sleep-cur-lv" class="calc-input-num" value="1" min="1" max="59" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-target-lv">${isEN ? 'Target Level:' : '目標等級：'}</label>
                <input type="number" id="calc-sleep-target-lv" class="calc-input-num" value="30" min="2" max="60" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label">${isEN ? 'Boost Conditions:' : '加成條件：'}</label>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 4px;">
                  <label><input type="checkbox" id="calc-sleep-exp-subskill" onchange="window.WikiDB.recalcSleepDays()"> ${isEN ? 'Sleep EXP Bonus (+14%)' : '睡眠EXP獎勵 (+14%)'}</label>
                  <label><input type="checkbox" id="calc-sleep-incense" onchange="window.WikiDB.recalcSleepDays()"> ${isEN ? 'Growth Incense (2x)' : '成長薰香 (2x)'}</label>
                  <select id="calc-sleep-nature-select" class="calc-select" style="width: auto; padding: 4px 8px;" onchange="window.WikiDB.recalcSleepDays()">
                    <option value="1.0">${isEN ? 'Neutral EXP Nature' : '性格無 EXP 修正'}</option>
                    <option value="1.18">${isEN ? 'EXP Up ▲▲ (+18%)' : '性格 EXP ▲▲ (+18%)'}</option>
                    <option value="0.82">${isEN ? 'EXP Down ▼▼ (-18%)' : '性格 EXP ▼▼ (-18%)'}</option>
                  </select>
                </div>
              </div>

              <div class="calc-result-box">
                <div class="calc-result-label">${isEN ? 'Estimated Sleep Days' : '預估所需睡眠天數'}</div>
                <div id="calc-sleep-days-result" class="calc-result-val">${isEN ? '120 Days' : '120 天'}</div>
                <div id="calc-sleep-exp-result" class="calc-result-badge">${isEN ? 'Approx. 12,000 EXP' : '約需 12,000 EXP'}</div>
              </div>
            </div>

            <!-- 基準天數對照表 -->
            <div class="wiki-table-wrapper" style="margin-top: 18px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th>${isEN ? 'Target Level' : '目標等級'}</th>
                    <th>${isEN ? 'Total Required EXP' : '累計所需 EXP'}</th>
                    <th>${isEN ? 'Base Sleep Days (100 EXP/Day)' : '無加成睡眠天數 (每天100EXP)'}</th>
                    <th>${isEN ? 'Milestone Significance' : '里程碑意義'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SLEEP_DAYS_BASELINE.map(row => `
                    <tr>
                      <td class="font-bold text-accent">Lv. ${row.level}</td>
                      <td class="font-bold">${row.totalExp.toLocaleString()} EXP</td>
                      <td class="text-success font-bold">${row.days} ${isEN ? 'Days (approx. ' + Math.ceil(row.days / 2) + ' with events)' : '天 (搭配活動約 ' + Math.ceil(row.days / 2) + ' 天)'}</td>
                      <td class="text-secondary">${isEN ? (row.note_en || row.note) : row.note}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 4：食材產量天梯榜 (Ingredient Yield Ladder) -->
        <div id="wiki-subpanel-ingredients" class="wiki-subpanel ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" style="${currentWikiSubTab === 'ingredients' ? 'display:block;' : 'display:none;'}">
          <!-- 右下懸浮天梯篩選按鈕 (Mobile Only FAB) -->
          <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn" onclick="window.WikiDB.openLadderSidebar()" title="${isEN ? 'Open Filters' : '展開天梯篩選器'}" aria-label="${isEN ? 'Open Filters' : '展開天梯篩選器'}" style="${isMobileH5 && currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}">
            <span class="bookmark-icon">
              <svg class="fab-svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" y1="21" x2="4" y2="14"></line>
                <line x1="4" y1="10" x2="4" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="3"></line>
                <line x1="20" y1="21" x2="20" y2="16"></line>
                <line x1="20" y1="12" x2="20" y2="3"></line>
                <line x1="1" y1="14" x2="7" y2="14"></line>
                <line x1="9" y1="8" x2="15" y2="8"></line>
                <line x1="17" y1="16" x2="23" y2="16"></line>
              </svg>
            </span>
          </button>

          <!-- 橫向視覺天梯座標圖 (預設顯示) -->
          <div id="wiki-ingredient-ladder-coordinate">
            ${renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA)}
          </div>

          <!-- 食材天梯卡片清單 (列表檢視，預設隱藏) -->
          <div id="wiki-ingredient-ladder-grid" class="wiki-ladder-grid" style="display: none;">
            ${renderIngredientLadders(LV60_INGREDIENTS_LADDER)}
          </div>
        </div>

        <!-- 子分頁 5：樹果與食材基礎能量 (Image 1 實體化 - Berry & Ingredient Values) -->
        <div id="wiki-subpanel-values" class="wiki-subpanel ${currentWikiSubTab === 'values' ? 'active' : ''}" style="${currentWikiSubTab === 'values' ? 'display:block;' : 'display:none;'}">
          <div class="wiki-card">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Berry & Ingredient Base Power Table' : '樹果與食材基礎能量表'}</h3>
            </div>
            <p class="wiki-card-desc">${isEN ? 'Official in-game base power values for 18 Berries (24~35) and 19 Ingredients (90~342).' : '依據官方遊戲底層能量設定，完整展示 18 種屬性樹果基礎能量（24~35）與 19 種料理食材基礎能量（90~342）。'}</p>

            <div style="margin-top: 20px;">
              ${renderValuesBoard()}
            </div>
          </div>
        </div>
      </div>

      <!-- 遮罩層 (Backdrop for Mobile Drawer) -->
      <div id="ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="window.WikiDB.closeLadderSidebar()"></div>
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
    switchWikiSubTab: switchWikiSubTab,
    getCurrentSubTab: getCurrentSubTab,
    switchLadderView: switchLadderView,
    filterSkills: filterWikiSkills,
    filterWikiSkills: filterWikiSkills,
    filterIngredients: filterWikiIngredients,
    filterWikiIngredients: filterWikiIngredients,
    switchStack: switchChargeStock,
    switchChargeStock: switchChargeStock,
    switchBoost: switchHelperBoost,
    switchHelperBoost: switchHelperBoost,
    toggleDetail: toggleDetailTable,
    toggleDetailTable: toggleDetailTable,
    updateBerryLevel: updateBerryLevel,
    updateBerryIsland: updateBerryIsland,
    toggleBerryFavorite: toggleBerryFavorite,
    toggleFavorite: toggleBerryFavorite,
    toggleLadderIngM: toggleLadderIngM,
    toggleLadderSpeedM: toggleLadderSpeedM,
    toggleLadderNatureIng: toggleLadderNatureIng,
    toggleLadderNatureSpeed: toggleLadderNatureSpeed,
    onLadderSearch: onLadderSearch,
    clearLadderSearch: clearLadderSearch,
    setLadderSupplyFilter: setLadderSupplyFilter,
    setLadderRecipeFilter: setLadderRecipeFilter,
    setLadderSpecialtyFilter: setLadderSpecialtyFilter,
    resetLadderFilters: resetLadderFilters,
    refreshCoordinateLadder: refreshCoordinateLadder,
    handleLadderGroupHover: handleLadderGroupHover,
    handleLadderGroupHoverOut: handleLadderGroupHoverOut,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays,
    openLadderSidebar: openLadderSidebar,
    closeLadderSidebar: closeLadderSidebar,
    toggleSkillCard: toggleSkillCard,
    toggleSkillStepper: toggleSkillStepper,
    TOP_RECIPES_FOR_INGREDIENTS: TOP_RECIPES_FOR_INGREDIENTS
  };

  window.WikiDB = WikiDBExport;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  window.switchWikiSubTab = switchWikiSubTab;
  window.getCurrentSubTab = getCurrentSubTab;
  window.switchLadderView = switchLadderView;
  window.filterWikiSkills = filterWikiSkills;
  window.filterWikiIngredients = filterWikiIngredients;
  window.switchChargeStock = switchChargeStock;
  window.switchHelperBoost = switchHelperBoost;
  window.toggleDetailTable = toggleDetailTable;
  window.toggleSkillCard = toggleSkillCard;
  window.toggleSkillStepper = toggleSkillStepper;
  window.updateBerryLevel = updateBerryLevel;
  window.updateBerryIsland = updateBerryIsland;
  window.toggleBerryFavorite = toggleBerryFavorite;
  window.toggleLadderIngM = toggleLadderIngM;
  window.toggleLadderSpeedM = toggleLadderSpeedM;
  window.toggleLadderNatureIng = toggleLadderNatureIng;
  window.toggleLadderNatureSpeed = toggleLadderNatureSpeed;
  window.onLadderSearch = onLadderSearch;
  window.clearLadderSearch = clearLadderSearch;
  window.setLadderSupplyFilter = setLadderSupplyFilter;
  window.setLadderRecipeFilter = setLadderRecipeFilter;
  window.setLadderSpecialtyFilter = setLadderSpecialtyFilter;
  window.resetLadderFilters = resetLadderFilters;
  window.refreshCoordinateLadder = refreshCoordinateLadder;
  window.handleLadderGroupHover = handleLadderGroupHover;
  window.handleLadderGroupHoverOut = handleLadderGroupHoverOut;
  window.recalcTriggerChance = recalcTriggerChance;
  window.recalcSleepDays = recalcSleepDays;
  window.openLadderSidebar = openLadderSidebar;
  window.closeLadderSidebar = closeLadderSidebar;

  // 當 DOM 準備完成時自動初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWikiModule);
  } else {
    initWikiModule();
  }

})();
