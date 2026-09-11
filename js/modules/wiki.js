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
        { name: '豆製肉', name_en: 'Bean Sausage', icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
        { name: '美味蘑菇', name_en: 'Tasty Mushroom', icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' }
      ],
      extraEffect: '機率獲得大量夢之碎片（最高 20,000）',
      extraEffect_en: 'Chance to grant massive Dream Shards (up to 20,000)'
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
        { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
        { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
        { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
        { name: '好眠番茄', name_en: 'Snoozy Tomato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' }
      ],
      extraEffect: '大成功獲取 2 倍食材（最高 36 個）',
      extraEffect_en: '2x ingredients on Extra Tasty (up to 36)'
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
      desc: "增加卡比獸的能量（固定數值 400 ~ 3,212）。",
      desc_en: "Adds a fixed amount of Snorlax Strength (400 ~ 3,212).",
      maxLevel: 7,
      values: [400, 569, 785, 1083, 1496, 2066, 3212],
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
        { min: 1606, max: 6424 }
      ],
      specialNote: "浮動機制：每次發動隨機給予區間內能量（約 0.5x ~ 2.0x 基準值）",
      specialNote_en: "Random: Strength varies per trigger (~0.5x ~ 2.0x base value)",
      unit: " 能量",
      unit_en: " Strength"
    },
    {
      id: "charge_energy_m",
      name: "能量填充M",
      icon: "🔥",
      category: "energy",
      catName: "能量系",
      desc: "大量增加卡比獸的能量（固定數值 880 ~ 6,409）。",
      desc_en: "Adds a large fixed amount of Snorlax Strength (880 ~ 6,409).",
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
      desc: "發動蓄積或噴放。依蓄積次數（0~10次）暴增能量，最高達 90,940 能量！",
      desc_en: "Charges or releases. Scales with 0~10 stacks up to 90,940 Strength!",
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
        { stacks: 8, vals: [6480, 9213, 12712, 17552, 24225, 33469, 48621] },
        { stacks: 9, vals: [8880, 12625, 17420, 24052, 33197, 45865, 66629] },
        { stacks: 10, vals: [12120, 17231, 23776, 32827, 45309, 62600, 90940] }
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
      desc: "卡比獸能量超大幅增加（最高達 18,515 能量），但非惡屬性隊友活力下降。",
      desc_en: "Huge Strength boost (up to 18,515); non-Dark allies lose energy.",
      maxLevel: 7,
      values: [2640, 3753, 5178, 7149, 9870, 13638, 18515],
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
      desc: "隨機獲得已解鎖的食材（全圖鑑已解鎖食材隨機抽選 6~24 個）。",
      desc_en: "Gets a random assortment of all unlocked ingredients (6~24 ingredients).",
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
      desc: "從該寶可夢專屬的特定食材候選池中，隨機獲得其中 1 種食材（單一食材獲取量為 5~18 個）。",
      desc_en: "Obtains 1 ingredient type exclusively from this Pokémon's candidate pool (5~18 of a single ingredient).",
      maxLevel: 7,
      values: [5, 6, 8, 11, 13, 16, 18],
      specialNote: "機制：鎖定抽取發動寶可夢專屬食材池中 1 種食材。Lv.1 為 5 個，Lv.7 上限最高獲取 18 個。特殊型態：超幸運有機率爆發大量夢之碎片（最高達 20,000 碎片）；怪力鉗大成功時獲取 2 倍食材（最高達 36 個）。",
      specialNote_en: "Rule: Draws 1 ingredient type only from this Pokémon's candidate pool. Lv.1 yields 5, up to 18 at Lv.7. Variants: Super Luck may grant massive Dream Shards (up to 20,000); Hyper Cutter grants 2x ingredients on Extra Tasty (up to 36).",
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
      desc: "增加下次烹調時鍋子容量上限（7~31個），效果持續到料理大成功或換營地。",
      desc_en: "Expands pot capacity for next meal (+7~31). Stacks until Extra Tasty or move.",
      maxLevel: 7,
      values: [7, 10, 12, 17, 22, 27, 31],
      specialNote: "限制：擴充上限最高累加至鍋子容量 200，達到上限時無法再次發動",
      specialNote_en: "Limit: Pot capacity stacks up to 200 max; cannot trigger once limit is reached",
      unit: " 個容量",
      unit_en: " Pot Space"
    },
    {
      id: "tasty_chance_s",
      name: "料理成功S",
      icon: "✨",
      category: "ingredient",
      catName: "食材與料理",
      desc: "料理漂亮成功（大成功）機率提升（4%~10%），可持續疊加直到大成功為止。",
      desc_en: "Boosts Extra Tasty chance (+4%~10%); stacks until an Extra Tasty dish is cooked.",
      maxLevel: 6,
      values: [4, 5, 6, 7, 8, 10],
      specialNote: "機率累加：大成功機率最高累計至 70% 上限。大成功時發動雙倍/三倍能量，成功後機率重設",
      specialNote_en: "Stacks up to 70% max. 2x~3x power on Extra Tasty; resets after trigger",
      unit: "%",
      unit_en: "%"
    },
    {
      id: "helper_boost_s",
      name: "幫手支援S",
      icon: "🤝",
      category: "special",
      catName: "神獸與特殊",
      desc: "隨機 1 隻隊友立刻完成多次幫忙產出（6~12次幫忙）。",
      desc_en: "Instantly gets 6~12 helps from a random teammate.",
      maxLevel: 7,
      values: [6, 7, 8, 9, 10, 11, 12],
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
      desc: "隨機讓隊伍中的 1 隻隊友回復活力（12~44點，大幅度優先鎖定活力最低的寶可夢）。",
      desc_en: "Restores 12~44 energy to 1 random teammate (strongly favors lowest energy teammate).",
      maxLevel: 6,
      values: [12, 15, 20, 25, 33, 44],
      specialNote: "機制：官方 v3.0.0 平衡調整，大幅提升發動機率，且優先鎖定隊伍中當前活力最低的隊友",
      specialNote_en: "v3.0.0 balance update: Increased trigger rate and strongly favors the lowest energy teammate",
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
      desc: "從主技能庫中隨機抽選 1 種發動（部分未來特殊專屬招式除外）。",
      desc_en: "Randomly triggers a main skill from a large selection in the game.",
      maxLevel: 7,
      unit: "Lv.1~7 隨機發動",
      unit_en: "Random Lv.1~7 Trigger"
    },
    {
      id: "plus_ingredient_magnet",
      name: "正電（食材獲取S）",
      name_en: "Plus (Ingredient Magnet S)",
      icon: "",
      category: "ingredient",
      catName: "食材與料理",
      desc: "隨機獲得食材（5~18個）；若隊伍中有「正電」或「負電」隊友，額外獲得食材（6~14個）。",
      desc_en: "Gets 5~18 random ingredients; gets 6~14 bonus ingredients if Plus or Minus teammates present.",
      maxLevel: 7,
      values: [5, 7, 9, 11, 13, 16, 18],
      specialNote: "正負電連動：隊伍中有 1 隻以上正電或負電隊友時，額外獲得 +6, +7, +8, +10, +12, +13, +14 個食材。",
      specialNote_en: "Plus/Minus synergy: If team has Plus or Minus teammates, yields bonus +6, +7, +8, +10, +12, +13, +14 ingredients.",
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "minus_cooking_power_up",
      name: "負電（料理強化S）",
      name_en: "Minus (Cooking Power-Up S)",
      icon: "",
      category: "ingredient",
      catName: "食材與料理",
      desc: "擴大下次料理時鍋子容量上限（5~24個）；若隊伍中有「正電」或「負電」隊友，隨機讓 1 隻隊友回復活力（8~35點）。",
      desc_en: "Expands pot capacity (+5~24); if Plus or Minus teammates present, heals 1 teammate (8~35 energy).",
      maxLevel: 7,
      values: [5, 7, 9, 12, 16, 20, 24],
      specialNote: "正負電連動：隊伍中有 1 隻以上正電或負電隊友時，額外回復 1 隻隊友 +8, +10, +13, +17, +23, +30, +35 點活力。",
      specialNote_en: "Plus/Minus synergy: If team has Plus or Minus teammates, restores +8, +10, +13, +17, +23, +30, +35 energy to 1 teammate.",
      unit: " 個容量",
      unit_en: " Pot Space"
    },
    {
      id: "present_ingredient_magnet",
      name: "禮物（食材獲取S）",
      name_en: "Present (Ingredient Magnet S)",
      icon: "",
      category: "ingredient",
      catName: "食材與料理",
      desc: "隨機獲得食材（4~17個）；有時額外隨機獲得隊伍中 1 隻寶可夢的 4 顆糖果。",
      desc_en: "Gets 4~17 random ingredients; sometimes gets 4 candies for a random team member.",
      maxLevel: 7,
      values: [4, 6, 8, 10, 12, 15, 17],
      specialNote: "信使鳥專屬：發動時機率額外贈送隊伍中隨機 1 隻隊友的 4 顆專屬糖果。",
      specialNote_en: "Delibird signature: Chance to award 4 candies for a random teammate upon trigger.",
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "bulk_up_cooking_assist",
      name: "健美（料理輔助S）",
      name_en: "Bulk Up (Cooking Assist S)",
      icon: "",
      category: "ingredient",
      catName: "食材與料理",
      desc: "隨機獲得食材（6~24個），並提升下次料理漂亮成功（大成功）機率（+1%~5%）。",
      desc_en: "Gets 6~24 random ingredients and raises Extra Tasty rate (+1%~5%).",
      maxLevel: 7,
      values: [6, 8, 11, 14, 17, 21, 24],
      specialNote: "複合效果：同時提供食材產出與大成功機率疊加（+1%, +2%, +2%, +3%, +3%, +4%, +5%），直到大成功為止。",
      specialNote_en: "Dual Effect: Grants ingredients and stacks Extra Tasty rate (+1%~5%) until Extra Tasty triggers.",
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "aura_sphere_dream_shard",
      name: "波導彈（夢之碎片獲取S）",
      name_en: "Aura Sphere (Dream Shard Magnet S)",
      icon: "",
      category: "shards",
      catName: "夢之碎片",
      desc: "獲得夢之碎片（240~2,500），並同時增加卡比獸能量（200~2,042）。最高支援至 Lv.8！",
      desc_en: "Obtains 240~2,500 Dream Shards while boosting Strength by 200~2,042 (up to Lv.8).",
      maxLevel: 8,
      values: [240, 340, 480, 670, 920, 1260, 1800, 2500],
      specialNote: "路卡利歐專屬：碎片 240~2500 + 能量 +200, +285, +393, +542, +748, +1033, +1501, +2042。",
      specialNote_en: "Lucario signature: Grants 240~2500 Shards + boosts Strength by +200, +285, +393, +542, +748, +1033, +1501, +2042.",
      unit: " 碎片",
      unit_en: " Shards"
    },
    {
      id: "nuzzle_energizing_cheer",
      name: "蹭蹭臉頰（活力療癒S）",
      name_en: "Nuzzle (Energizing Cheer S)",
      icon: "",
      category: "energy_heal",
      catName: "活力系",
      desc: "隨機讓 1 隻隊友回復活力（9~35點）；幸運時該隊友獲得主技能發動獎勵，可額外發動 1 次主技能。",
      desc_en: "Restores 9~35 energy to 1 teammate; lucky teammates gain a bonus main skill trigger.",
      maxLevel: 6,
      values: [9, 12, 16, 20, 27, 35],
      specialNote: "獎勵發動：幸運時該隊友獲得額外 1 次主技能發動機會。",
      specialNote_en: "Lucky Bonus: Target teammate may gain an extra main skill trigger.",
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "heal_pulse_energizing_cheer",
      name: "治癒波動（活力療癒S）",
      name_en: "Heal Pulse (Energizing Cheer S)",
      icon: "",
      category: "energy_heal",
      catName: "活力系",
      desc: "隨機讓 2 隻隊友回復活力（6~22點），並立刻完成 1~4 次幫忙（隊伍中有拉帝歐斯時幫忙次數增加）。",
      desc_en: "Restores 6~22 energy to 2 teammates and instantly performs 1~4 helps (increased if Latios is on team).",
      maxLevel: 6,
      values: [6, 8, 10, 13, 17, 22],
      specialNote: "拉帝亞斯專屬：同時回復 2 隻隊友活力與立即幫忙（x1, x2, x2, x3, x4, x4；隊伍有拉帝歐斯時額外 +1, +1, +2, +2, +2, +3 次幫忙）。",
      specialNote_en: "Latias signature: Heals 2 teammates and grants 1~4 helps (+1~3 bonus helps if Latios is in party).",
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "berry_juice_energy_for_everyone",
      name: "樹果汁（活力全體療癒S）",
      name_en: "Berry Juice (Energy for Everyone S)",
      icon: "",
      category: "energy_heal",
      catName: "活力系",
      desc: "全體隊友回復活力（5~18點）；有機會額外獲得可回復單體 20 活力的「樹果汁」道具（最多持有 5 個）。",
      desc_en: "Restores 5~18 energy to all teammates; occasionally produces Berry Juice item (heals 20 energy, max 5 held).",
      maxLevel: 6,
      values: [5, 7, 9, 11, 15, 18],
      specialNote: "壺壺專屬：全隊活力回復 + 機率產出「樹果汁」背包道具。",
      specialNote_en: "Shuckle signature: Team energy heal + chance to obtain Berry Juice item.",
      unit: " 點活力",
      unit_en: " Energy"
    },
    {
      id: "draco_meteor_berry_burst",
      name: "流星群（樹果遽增）",
      name_en: "Draco Meteor (Berry Burst)",
      icon: "",
      category: "special",
      catName: "神獸與特殊",
      desc: "獲得自己與隊友撿來的樹果（龍屬性隊員越多樹果越多；隊伍中有拉帝亞斯數量進一步增加）。",
      desc_en: "Gathers berries from team (scales with Dragon types; further increased if Latias is on team).",
      maxLevel: 6,
      values: [12, 21, 29, 38, 43, 48],
      specialNote: "拉帝歐斯專屬：樹果爆發產出，龍屬性隊友越多獲得越多，若隊伍中有拉帝亞斯時樹果量再增加（+2~11顆）。",
      specialNote_en: "Latios signature: Berries gathered scales with Dragon types, plus +2~11 extra berries if Latias is in party.",
      unit: " 個樹果",
      unit_en: " Berries"
    },
    {
      id: "psystrike_berry_field",
      name: "精神擊破（樹果領域）",
      name_en: "Psystrike (Berry Field)",
      icon: "",
      category: "special",
      catName: "神獸與特殊",
      desc: "增加卡比獸能量，並在營地展開「樹果領域」，期間透過芒芒果（超能力屬性）獲得的能量提升。",
      desc_en: "Increases Snorlax Strength and deploys a Berry Field, boosting energy gained from Mago Berries.",
      maxLevel: 6,
      values: [2640, 3753, 5178, 7149, 9870, 13638],
      specialNote: "超夢專屬：能量增益 + 營地樹果領域（超能力屬性芒芒果能量倍率提升）。",
      specialNote_en: "Mewtwo signature: Strength gain + deploys Berry Field (boosts Mago Berry power).",
      unit: " 能量",
      unit_en: " Strength"
    }
  ];

  // --- 2. 副技能完整階級與數值資料庫 (Sub-Skills Data - 僅列出官方已開放副技能) ---
  const SUB_SKILLS_DATA = [
    {
      category: "持有上限",
      category_en: "Inventory",
      skills: [
        { name: "持有上限 S", color: "white", val: "+6 個", val_en: "+6" },
        { name: "持有上限 M", color: "blue", val: "+12 個", val_en: "+12" },
        { name: "持有上限 L", color: "blue", val: "+18 個", val_en: "+18" }
      ],
      desc: "持有上限+6/+12/+18個",
      desc_en: "Carry capacity +6 / +12 / +18"
    },
    {
      category: "幫忙速度",
      category_en: "Speed",
      skills: [
        { name: "幫忙速度 S", color: "white", val: "-7%", val_en: "-7%" },
        { name: "幫忙速度 M", color: "blue", val: "-14%", val_en: "-14%" }
      ],
      desc: "幫忙時間-7%/-14%",
      desc_en: "Help time -7% / -14%"
    },
    {
      category: "技能機率",
      category_en: "Skill Trigger",
      skills: [
        { name: "技能機率 S", color: "white", val: "+18%", val_en: "+18%" },
        { name: "技能機率 M", color: "blue", val: "+36%", val_en: "+36%" }
      ],
      desc: "主技能機率+18%/+36%",
      desc_en: "Skill trigger rate +18% / +36%"
    },
    {
      category: "食材機率",
      category_en: "Ingredient",
      skills: [
        { name: "食材機率 S", color: "white", val: "+18%", val_en: "+18%" },
        { name: "食材機率 M", color: "blue", val: "+36%", val_en: "+36%" }
      ],
      desc: "食材機率+18%/+36%",
      desc_en: "Ingredient rate +18% / +36%"
    },
    {
      category: "樹果數量",
      category_en: "Berries",
      skills: [
        { name: "樹果數量 S", color: "gold", val: "+1 個", val_en: "+1 Berry" }
      ],
      desc: "樹果數量+1個(樹果型T0核心)",
      desc_en: "Berries +1 (Berry T0 core)"
    },
    {
      category: "技能等級",
      category_en: "Skill Level",
      skills: [
        { name: "技能等級 S", color: "blue", val: "+1 級", val_en: "+1 Lv." },
        { name: "技能等級 M", color: "gold", val: "+2 級", val_en: "+2 Lv." }
      ],
      desc: "主技能等級+1/+2級",
      desc_en: "Skill level +1 / +2"
    },
    {
      category: "全隊幫忙",
      category_en: "Team Speed",
      skills: [
        { name: "幫手獎勵", color: "gold", val: "全隊 -5%", val_en: "Team -5%" }
      ],
      desc: "全隊幫忙時間-5%(5隻=25%)",
      desc_en: "Team help time -5% (5 helpers = 25%)"
    },
    {
      category: "全隊活力",
      category_en: "Team Recovery",
      skills: [
        { name: "活力恢復獎勵", color: "gold", val: "全隊 1.12x", val_en: "Team 1.12x" }
      ],
      desc: "全隊睡眠活力恢復1.12x",
      desc_en: "Team sleep energy 1.12x"
    },
    {
      category: "全隊經驗",
      category_en: "Team EXP",
      skills: [
        { name: "睡眠 EXP 獎勵", color: "gold", val: "全隊 +14%", val_en: "Team +14%" }
      ],
      desc: "全隊睡眠EXP+14%",
      desc_en: "Team sleep EXP +14%"
    },
    {
      category: "研究經驗",
      category_en: "Research EXP",
      skills: [
        { name: "研究 EXP 獎勵", color: "gold", val: "個人 +6%", val_en: "Self +6%" }
      ],
      desc: "研究EXP+6%",
      desc_en: "Research EXP +6%"
    },
    {
      category: "夢之碎片",
      category_en: "Dream Shards",
      skills: [
        { name: "夢之碎片獎勵", color: "gold", val: "個人 +6%", val_en: "Self +6%" }
      ],
      desc: "夢之碎片+6%",
      desc_en: "Dream shards +6%"
    }
  ];

  // 主技能機率矩陣速查表 (副技能 × 性格全排列)
  const TRIGGER_CHANCE_MATRIX = [
    {
      subskills: [
        { name: "技能機率提升M", color: "blue" },
        { name: "技能機率提升S", color: "white" }
      ],
      nature: "▲ 技能機率上升",
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
      nature: "▲ 技能機率上升",
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
      nature: "▲ 技能機率上升",
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
      nature: "▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.54 × 0.80",
      multiplier: 1.232,
      grade: "B (雙副技補回性格)",
      grade_en: "B (Dual Offset)"
    },
    {
      subskills: [],
      nature: "▲ 技能機率上升",
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
      nature: "▼ 技能機率下降",
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
      nature: "▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.18 × 0.80",
      multiplier: 0.944,
      grade: "D (微幅受阻)",
      grade_en: "D (Slight Impair)"
    },
    {
      subskills: [],
      nature: "▼ 技能機率下降",
      natureBadge: "down",
      calc: "1.00 × 0.80",
      multiplier: 0.800,
      grade: "E (嚴重削弱)",
      grade_en: "E (Heavy Impair)"
    }
  ];

  // 幫忙速度矩陣速查表 (副技能組合 × 性格獨立乘區)
  const HELPING_SPEED_MATRIX = [
    {
      subskills: [
        { name: "幫手獎勵滿配(35%封頂)", name_en: "Help Bonus Team Cap (35%)", color: "gold" }
      ],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "(1 - 0.35) × 0.90",
      intervalRatio: 0.585,
      intervalDisplay: "58.5%",
      intervalDiff: "-41.5%",
      outputMultiplier: 1.7094,
      outputBoostDisplay: "+70.94%",
      grade: "SSS (全隊極限滿配)",
      grade_en: "SSS (Full Team Cap)"
    },
    {
      subskills: [
        { name: "幫忙速度M", name_en: "Speed M", color: "blue" },
        { name: "幫忙速度S", name_en: "Speed S", color: "white" },
        { name: "幫手獎勵", name_en: "Help Bonus", color: "gold" }
      ],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "(1 - 0.26) × 0.90",
      intervalRatio: 0.666,
      intervalDisplay: "66.6%",
      intervalDiff: "-33.4%",
      outputMultiplier: 1.5015,
      outputBoostDisplay: "+50.15%",
      grade: "SS (單體滿配自帶)",
      grade_en: "SS (Solo Max Cap)"
    },
    {
      subskills: [
        { name: "幫忙速度M", name_en: "Speed M", color: "blue" },
        { name: "幫忙速度S", name_en: "Speed S", color: "white" }
      ],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "(1 - 0.21) × 0.90",
      intervalRatio: 0.711,
      intervalDisplay: "71.1%",
      intervalDiff: "-28.9%",
      outputMultiplier: 1.4065,
      outputBoostDisplay: "+40.65%",
      grade: "S (常規雙幫忙速度極限)",
      grade_en: "S (Dual Speed Up)"
    },
    {
      subskills: [
        { name: "幫忙速度M", name_en: "Speed M", color: "blue" }
      ],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "(1 - 0.14) × 0.90",
      intervalRatio: 0.774,
      intervalDisplay: "77.4%",
      intervalDiff: "-22.6%",
      outputMultiplier: 1.2920,
      outputBoostDisplay: "+29.20%",
      grade: "A (單幫忙速度M配性格)",
      grade_en: "A (Speed M + Nature)"
    },
    {
      subskills: [
        { name: "幫忙速度M", name_en: "Speed M", color: "blue" },
        { name: "幫忙速度S", name_en: "Speed S", color: "white" }
      ],
      nature: "無修正 / 其它性格",
      nature_en: "Neutral",
      natureBadge: "neutral",
      calc: "(1 - 0.21) × 1.00",
      intervalRatio: 0.790,
      intervalDisplay: "79.0%",
      intervalDiff: "-21.0%",
      outputMultiplier: 1.2658,
      outputBoostDisplay: "+26.58%",
      grade: "A (純雙幫忙速度無性格)",
      grade_en: "A (Dual Speed Neutral)"
    },
    {
      subskills: [
        { name: "幫忙速度S", name_en: "Speed S", color: "white" }
      ],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "(1 - 0.07) × 0.90",
      intervalRatio: 0.837,
      intervalDisplay: "83.7%",
      intervalDiff: "-16.3%",
      outputMultiplier: 1.1947,
      outputBoostDisplay: "+19.47%",
      grade: "B (單幫忙速度S配性格)",
      grade_en: "B (Speed S + Nature)"
    },
    {
      subskills: [
        { name: "幫忙速度M", name_en: "Speed M", color: "blue" }
      ],
      nature: "無修正 / 其它性格",
      nature_en: "Neutral",
      natureBadge: "neutral",
      calc: "(1 - 0.14) × 1.00",
      intervalRatio: 0.860,
      intervalDisplay: "86.0%",
      intervalDiff: "-14.0%",
      outputMultiplier: 1.1628,
      outputBoostDisplay: "+16.28%",
      grade: "B (純幫忙速度M無性格)",
      grade_en: "B (Speed M Neutral)"
    },
    {
      subskills: [],
      nature: "▲ 幫忙速度上升",
      nature_en: "▲ Speed Up",
      natureBadge: "up",
      calc: "1.00 × 0.90",
      intervalRatio: 0.900,
      intervalDisplay: "90.0%",
      intervalDiff: "-10.0%",
      outputMultiplier: 1.1111,
      outputBoostDisplay: "+11.11%",
      grade: "C (純幫忙速度上升)",
      grade_en: "C (Nature Up Only)"
    },
    {
      subskills: [
        { name: "幫忙速度S", name_en: "Speed S", color: "white" }
      ],
      nature: "無修正 / 其它性格",
      nature_en: "Neutral",
      natureBadge: "neutral",
      calc: "(1 - 0.07) × 1.00",
      intervalRatio: 0.930,
      intervalDisplay: "93.0%",
      intervalDiff: "-7.0%",
      outputMultiplier: 1.0753,
      outputBoostDisplay: "+7.53%",
      grade: "C (純幫忙速度S無性格)",
      grade_en: "C (Speed S Neutral)"
    },
    {
      subskills: [],
      nature: "無修正 / 其它性格",
      nature_en: "Neutral",
      natureBadge: "neutral",
      calc: "1.00 × 1.00",
      intervalRatio: 1.000,
      intervalDisplay: "100.0%",
      intervalDiff: "±0.0%",
      outputMultiplier: 1.0000,
      outputBoostDisplay: "+0.00%",
      grade: "基準線 (1.00x)",
      grade_en: "Baseline (1.00x)"
    },
    {
      subskills: [],
      nature: "▼ 幫忙速度下降",
      nature_en: "▼ Speed Down",
      natureBadge: "down",
      calc: "1.00 × 1.10",
      intervalRatio: 1.100,
      intervalDisplay: "110.0%",
      intervalDiff: "+10.0%",
      outputMultiplier: 0.9091,
      outputBoostDisplay: "-9.09%",
      grade: "D (性格減速削弱)",
      grade_en: "D (Nature Impair)"
    }
  ];

  // 性格五維倍率表 (包含官方最新數值與下降懲罰減輕修正)
  const NATURES_EFFECT_DATA = [
    { 
      stat: "幫忙速度", 
      stat_en: "Speed of Help",
      up: "-10%", 
      up_en: "-10%",
      down: "+7.5%", 
      down_en: "+7.5%",
      desc: "影響所有樹果,食材與技能判定間隔",
      desc_en: "Affects help interval for berries, ingredients, and skills."
    },
    { 
      stat: "活力回復量", 
      stat_en: "Energy Recovery",
      up: "+20%", 
      up_en: "+20%",
      down: "-12%", 
      down_en: "-12%",
      desc: "影響睡眠與隊伍補師回復量",
      desc_en: "Affects sleep energy and healer skill recovery."
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
      badge: "樹果專長",
      badge_en: "Berry Specialist",
      title: "樹果專長",
      title_en: "Berry Specialist",
      spec: "[樹果2個,食材1個]",
      spec_en: "[2 Berries, 1 Ingredient]",
      desc: "以高頻率產出大量樹果累積卡比獸能量為最高目標.",
      desc_en: "Maximizes Snorlax Strength via massive, high-speed berry output.",
      subskills: [
        { name: "樹果數量S", name_en: "Berry Finding S", detail: "樹果數量+1,能量直接翻倍(容易滿包需常收取)." },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間(5隻疊加25%)." },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間." },
        { name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己-7%幫忙時間(可用銀種子升階為M)." }
      ],
      natures: [
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "全方位提升樹果產出速度." },
        { name: "食材發現率▼", name_en: "Ingredient Finding ▼", detail: "食材率降低,變相提高樹果產出機率(加分項)." },
        { name: "主技能機率▲/▼", name_en: "Main Skill Chance ▲ / ▼", detail: "技能對樹果寵非首要,發動機率高低影響不大." }
      ]
    },
    ingredient: {
      type: "ingredient",
      badge: "食材專長",
      badge_en: "Ingredient Specialist",
      title: "食材專長",
      title_en: "Ingredient Specialist",
      spec: "[樹果1個,食材2個]",
      spec_en: "[1 Berry, 2 Ingredients]",
      desc: "以穩定供給高階食譜所需的高價值食材為核心職責.",
      desc_en: "Provides consistent supply of high-tier ingredients for powerful dishes.",
      subskills: [
        { name: "食材機率提升M", name_en: "Ingredient Finder M", detail: "+36%食材機率,食材寵畢業核心." },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間." },
        { name: "食材機率提升S", name_en: "Ingredient Finder S", detail: "+18%食材機率(可用銀種子升階為M)." },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間." },
        { name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己-7%幫忙時間." },
        { name: "持有上限提升 M/L", name_en: "Inventory Up M/L", detail: "防止睡覺滿包停止產出食材." },
        { name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "需搭配持有上限擴充,並保持頻繁收取." }
      ],
      natures: [
        { name: "食材發現率▲", name_en: "Ingredient Finding ▲", detail: "食材產出量大幅提升." },
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "提高整體幫忙與食材判定頻率." },
        { name: "主技能機率▲/▼", name_en: "Main Skill Chance ▲ / ▼", detail: "若有自補/料理強化可加分,其餘技能影響不大." }
      ]
    },
    skill: {
      type: "skill",
      badge: "技能專長",
      badge_en: "Skill Specialist",
      title: "技能專長",
      title_en: "Skill Specialist",
      spec: "[樹果1個,食材1個]",
      spec_en: "[1 Berry, 1 Ingredient]",
      desc: "以高頻率觸發核心主技能(全體補血,神獸加速,高額能量,料理擴鍋)為核心職責.",
      desc_en: "Triggers crucial main skills (E4E heal, Legend boost, pot expand, energy burst) frequently.",
      subskills: [
        { name: "技能機率提升M", name_en: "Skill Trigger M", detail: "+36%技能發動機率,技能寵畢業核心." },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間." },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間." },
        { name: "技能機率提升S", name_en: "Skill Trigger S", detail: "+18%技能發動機率(可用銀種子升階為M)." },
        { name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "補足基本能量產出,需常收取." },
        { name: "技能等級提升M", name_en: "Skill Level Up M", detail: "主技能等級+2,節省金種子珍貴資源." },
        { name: "技能等級提升S", name_en: "Skill Level Up S", detail: "主技能等級+1(可用銀種子升階)." }
      ],
      natures: [
        { name: "主技能發動機率▲", name_en: "Main Skill Chance ▲", detail: "技能寵靈魂性格,觸發次數最大化." },
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "提高幫忙判定頻率." },
        { name: "食材發現率▼", name_en: "Ingredient Finding ▼", detail: "降低食材掉落,無副作用(技能寵只看技能與速度)." }
      ]
    }
  };

  // 睡眠天數成長基準表 (Image 2)
  const SLEEP_DAYS_BASELINE = [
    { level: 10, totalExp: 1600, days: 16, note: "解鎖第1個副技能", note_en: "Unlocks 1st sub-skill" },
    { level: 25, totalExp: 8700, days: 87, note: "解鎖第2個副技能", note_en: "Unlocks 2nd sub-skill" },
    { level: 30, totalExp: 12000, days: 120, note: "解鎖第2種食材", note_en: "Unlocks 2nd ingredient slot" },
    { level: 50, totalExp: 30000, days: 300, note: "解鎖第3個副技能", note_en: "Unlocks 3rd sub-skill" },
    { level: 60, totalExp: 51500, days: 515, note: "解鎖第3種食材", note_en: "Unlocks 3rd ingredient slot" }
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
                            "recipe": "ABA",
                            "count": 58,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 46,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 47,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 32,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 47,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 29,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 44,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 30,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 34,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 20,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 34,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 20,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 29,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 17,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 26,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 16,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 23,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 23,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 特選蘋果 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 特選蘋果 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "天然鳥",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/178.png",
                    "recipe": "XXC",
                    "count": 25,
                    "note": "XXC 單特選蘋果 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 25,
                            "note": "XXC 單特選蘋果 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "請假王",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/289.png",
                    "recipe": "XXC",
                    "count": 25,
                    "note": "XXC 單特選蘋果 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 25,
                            "note": "XXC 單特選蘋果 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙特選蘋果 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙特選蘋果 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單特選蘋果 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "七夕青鳥",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/334.png",
                    "recipe": "XXC",
                    "count": 24,
                    "note": "XXC 單特選蘋果 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 24,
                            "note": "XXC 單特選蘋果 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 58,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 45,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 43,
                            "note": "AAB 哞哞鮮奶 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 29,
                            "note": "ABX 哞哞鮮奶 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 23,
                            "note": "AAB 哞哞鮮奶 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 哞哞鮮奶 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 22,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "伊布家族（8種進化）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133.png",
                    "recipe": "AAA",
                    "count": 31,
                    "note": "AAA 哞哞鮮奶 純種產出 (8種進化產量皆相同)",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "AAA",
                            "count": 31,
                            "note": "AAA 哞哞鮮奶 純種產出 (8種進化產量皆相同)"
                        },
                        {
                            "recipe": "ABA",
                            "count": 22,
                            "note": "ABA 雙哞哞鮮奶 產出 (8種進化產量皆相同)"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙哞哞鮮奶 產出 (8種進化產量皆相同)",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單哞哞鮮奶 混產 (8種進化產量皆相同)",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Eevee Evolutions (8 Forms)"
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 哞哞鮮奶 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 哞哞鮮奶 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙哞哞鮮奶 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙哞哞鮮奶 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單哞哞鮮奶 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "伊布（萬聖節）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png",
                    "recipe": "XXC",
                    "count": 22,
                    "note": "XXC 單哞哞鮮奶 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 22,
                            "note": "XXC 單哞哞鮮奶 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "負電拍拍",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/312.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單哞哞鮮奶 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單哞哞鮮奶 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "風速狗",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/059.png",
                    "recipe": "XXC",
                    "count": 18,
                    "note": "XXC 單哞哞鮮奶 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 18,
                            "note": "XXC 單哞哞鮮奶 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "拉帝歐斯",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/381.png",
                    "recipe": "XXC",
                    "count": 18,
                    "note": "XXC 單哞哞鮮奶 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 18,
                            "note": "XXC 單哞哞鮮奶 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "正電拍拍",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/311.png",
                    "recipe": "XXC",
                    "count": 17,
                    "note": "XXC 單哞哞鮮奶 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 17,
                            "note": "XXC 單哞哞鮮奶 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 52,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 32,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 53,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 42,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 53,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 41,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "南瓜怪人",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                    "recipe": "ABB",
                    "count": 79,
                    "note": "ABB 萌綠大豆 主力產出 (體型日產 72~79 顆)",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "ABB",
                            "count": 79,
                            "note": "ABB 萌綠大豆 主力產出 (體型日產 72~79 顆)"
                        },
                        {
                            "recipe": "AAB",
                            "count": 49,
                            "note": "AAB 萌綠大豆 後期主力 (體型日產 72~79 顆)"
                        },
                        {
                            "recipe": "ABX",
                            "count": 30,
                            "note": "ABX 萌綠大豆 兼顧 (體型日產 72~79 顆)",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Gourgeist"
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
                            "recipe": "ABA",
                            "count": 50,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "沙漠蜻蜓",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/330.png",
                    "recipe": "XXC",
                    "count": 50,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 50,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "袋獸",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/115.png",
                    "recipe": "XXC",
                    "count": 44,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 44,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "波士可多拉",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/306.png",
                    "recipe": "XXC",
                    "count": 43,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 43,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 23,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 15,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 26,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 16,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "三地鼠",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/051.png",
                    "recipe": "XXC",
                    "count": 37,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 37,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 26,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 16,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 15,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙萌綠大豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙萌綠大豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單萌綠大豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 16,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "瑪狃拉",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/461.png",
                    "recipe": "XXC",
                    "count": 24,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 24,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "巴大蝶",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/012.png",
                    "recipe": "XXC",
                    "count": 21,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 21,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 14,
                            "note": "AAB 萌綠大豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 萌綠大豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "皮可西",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/036.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單萌綠大豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單萌綠大豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 56,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 44,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 53,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 41,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 50,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "鍬農炮蟲",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/738.png",
                    "recipe": "XXC",
                    "count": 50,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 50,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "幸福蛋",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/242.png",
                    "recipe": "XXC",
                    "count": 40,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 40,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 25,
                            "note": "AAB 甜甜蜜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 甜甜蜜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 26,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 21,
                            "note": "AAB 甜甜蜜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 甜甜蜜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 22,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙甜甜蜜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙甜甜蜜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單甜甜蜜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 13,
                            "note": "AAB 甜甜蜜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 甜甜蜜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 12,
                            "note": "AAB 甜甜蜜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 甜甜蜜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "火爆猴",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/057.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "吞食獸",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/317.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "壺壺",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/213.png",
                    "recipe": "XXC",
                    "count": 15,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 15,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "帝王拿波",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/395.png",
                    "recipe": "XXC",
                    "count": 14,
                    "note": "XXC 單甜甜蜜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 14,
                            "note": "XXC 單甜甜蜜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 56,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 44,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 55,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 42,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 53,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 32,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 45,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 28,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 44,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 24,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 39,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 26,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 35,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "班基拉斯",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/248.png",
                    "recipe": "XXC",
                    "count": 51,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 51,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "水箭龜",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/009.png",
                    "recipe": "XXC",
                    "count": 45,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 45,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "沼王",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/195.png",
                    "recipe": "XXC",
                    "count": 44,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 44,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 30,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 18,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 30,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 18,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 30,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 18,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "凱羅斯",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/127.png",
                    "recipe": "XXC",
                    "count": 41,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 41,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "老翁龍",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/780.png",
                    "recipe": "XXC",
                    "count": 38,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 38,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 15,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙豆製肉 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙豆製肉 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單豆製肉 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "摔角鷹人",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/701.png",
                    "recipe": "XXC",
                    "count": 21,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 21,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 12,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大鋼蛇",
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
                            "recipe": "AAB",
                            "count": 13,
                            "note": "AAB 豆製肉 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 豆製肉 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "暴飛龍",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/373.png",
                    "recipe": "XXC",
                    "count": 20,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 20,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "赫拉克羅斯",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/214.png",
                    "recipe": "XXC",
                    "count": 18,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 18,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "拉達",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/020.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "哥達鴨",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/055.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "嘟嘟利",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/085.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "音波龍",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/715.png",
                    "recipe": "XXC",
                    "count": 14,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 14,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "伊布家族（8種進化）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133.png",
                    "recipe": "XXC",
                    "count": 13,
                    "note": "XXC 單豆製肉 補足 (8種進化產量皆相同)",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 13,
                            "note": "XXC 單豆製肉 補足 (8種進化產量皆相同)",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Eevee Evolutions (8 Forms)"
                },
                {
                    "name": "伊布（佳節）",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單豆製肉 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單豆製肉 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 58,
                            "note": "ABA 雙暖暖薑 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 45,
                            "note": "AAX 雙暖暖薑 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 單暖暖薑 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 50,
                            "note": "ABA 雙暖暖薑 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙暖暖薑 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單暖暖薑 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 43,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 24,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 39,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 26,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 34,
                            "note": "ABA 雙暖暖薑 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 21,
                            "note": "AAX 雙暖暖薑 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單暖暖薑 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大蔥鴨",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/083.png",
                    "recipe": "XXC",
                    "count": 42,
                    "note": "XXC 單暖暖薑 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 42,
                            "note": "XXC 單暖暖薑 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 29,
                            "note": "ABA 雙暖暖薑 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 17,
                            "note": "AAX 雙暖暖薑 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單暖暖薑 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "魔幻假面喵",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/908.png",
                    "recipe": "XXC",
                    "count": 38,
                    "note": "XXC 單暖暖薑 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 38,
                            "note": "XXC 單暖暖薑 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 15,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 22,
                            "note": "ABA 雙暖暖薑 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙暖暖薑 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單暖暖薑 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 16,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 16,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 14,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "土台龜",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/389.png",
                    "recipe": "XXC",
                    "count": 21,
                    "note": "XXC 單暖暖薑 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 21,
                            "note": "XXC 單暖暖薑 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 11,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "帝牙海獅",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/365.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單暖暖薑 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單暖暖薑 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 10,
                            "note": "AAB 暖暖薑 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 暖暖薑 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "海豹球（佳節）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png",
                    "recipe": "XXC",
                    "count": 17,
                    "note": "XXC 單暖暖薑 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 17,
                            "note": "XXC 單暖暖薑 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 49,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                    "isTop": true,
                    "variants": [
                        {
                            "recipe": "AAA",
                            "count": 76,
                            "note": "AAA 好眠番茄 純種產出",
                            "isTop": true
                        },
                        {
                            "recipe": "ABA",
                            "count": 49,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                    "isTop": true,
                    "variants": [
                        {
                            "recipe": "AAA",
                            "count": 76,
                            "note": "AAA 好眠番茄 純種產出",
                            "isTop": true
                        },
                        {
                            "recipe": "ABA",
                            "count": 49,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 46,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 36,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 43,
                            "note": "AAB 好眠番茄 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 25,
                            "note": "ABX 好眠番茄 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 42,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 33,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 31,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 18,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大嘴娃",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/303.png",
                    "recipe": "XXC",
                    "count": 33,
                    "note": "XXC 單好眠番茄 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 33,
                            "note": "XXC 單好眠番茄 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 23,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 14,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 21,
                            "note": "AAB 好眠番茄 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 好眠番茄 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "克雷色利亞",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/488.png",
                    "recipe": "XXC",
                    "count": 27,
                    "note": "XXC 單好眠番茄 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 27,
                            "note": "XXC 單好眠番茄 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 16,
                            "note": "AAB 好眠番茄 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 好眠番茄 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 18,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大鋼蛇",
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 14,
                            "note": "ABA 雙好眠番茄 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 8,
                            "note": "AAX 雙好眠番茄 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單好眠番茄 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "呆殼獸",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/080.png",
                    "recipe": "XXC",
                    "count": 17,
                    "note": "XXC 單好眠番茄 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 17,
                            "note": "XXC 單好眠番茄 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "呆呆王",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/199.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單好眠番茄 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單好眠番茄 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 45,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 35,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 44,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 34,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 38,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "穿著熊",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/760.png",
                    "recipe": "XXC",
                    "count": 48,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 48,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "古月鳥",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/845.png",
                    "recipe": "XXC",
                    "count": 32,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 32,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 15,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 14,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 14,
                            "note": "AAB 特選蛋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 特選蛋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 15,
                            "note": "ABA 雙特選蛋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙特選蛋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單特選蛋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "雷丘",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/026.png",
                    "recipe": "XXC",
                    "count": 20,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 20,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "巴布土撥",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/923.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "皮卡丘（萬聖節）",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png",
                    "recipe": "XXC",
                    "count": 17,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 17,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "路卡利歐",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/448.png",
                    "recipe": "XXC",
                    "count": 15,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 15,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "皮卡丘（船長）",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png",
                    "recipe": "XXC",
                    "count": 14,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 14,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "皮卡丘（佳節）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單特選蛋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單特選蛋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 40,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 31,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 38,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 37,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 29,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 36,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 28,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 33,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 34,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 26,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "快龍",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/149.png",
                    "recipe": "XXC",
                    "count": 53,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 53,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "耿鬼",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/094.png",
                    "recipe": "XXC",
                    "count": 38,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 38,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 26,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "狂歡浪舞鴨",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/914.png",
                    "recipe": "XXC",
                    "count": 35,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 35,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 22,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 13,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙純粹油 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙純粹油 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單純粹油 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "岩殿居蟹",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/558.png",
                    "recipe": "XXC",
                    "count": 24,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 24,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 13,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 12,
                            "note": "AAB 純粹油 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 純粹油 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "火焰雞",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/257.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "火爆獸",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/157.png",
                    "recipe": "XXC",
                    "count": 17,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 17,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "果然翁",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/202.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單純粹油 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單純粹油 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 44,
                            "note": "ABA 雙窩心洋芋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 34,
                            "note": "AAX 雙窩心洋芋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單窩心洋芋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 43,
                            "note": "ABA 雙窩心洋芋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 34,
                            "note": "AAX 雙窩心洋芋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單窩心洋芋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 35,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 24,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 36,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 35,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 20,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 33,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 32,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 22,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 30,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 20,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 28,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 16,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "南瓜怪人",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                    "recipe": "XXC",
                    "count": 41,
                    "note": "XXC 單窩心洋芋 補足 (體型日產 37~41 顆)",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 41,
                            "note": "XXC 單窩心洋芋 補足 (體型日產 37~41 顆)",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Gourgeist"
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
                            "recipe": "AAB",
                            "count": 24,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 15,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "妙蛙花",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/003.png",
                    "recipe": "XXC",
                    "count": 37,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 37,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "土王",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/980.png",
                    "recipe": "XXC",
                    "count": 35,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 35,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 25,
                            "note": "ABA 雙窩心洋芋 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙窩心洋芋 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單窩心洋芋 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 15,
                            "note": "AAB 窩心洋芋 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 窩心洋芋 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "穿山王",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/028.png",
                    "recipe": "XXC",
                    "count": 18,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 18,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "九尾（阿羅拉的樣子）",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png",
                    "recipe": "XXC",
                    "count": 16,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 16,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "巨鍛匠",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/959.png",
                    "recipe": "XXC",
                    "count": 15,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 15,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "隨風球",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/426.png",
                    "recipe": "XXC",
                    "count": 13,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 13,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "九尾",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/038.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "怪顎龍",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/697.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大鋼蛇",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/208.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單窩心洋芋 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單窩心洋芋 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 60,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 46,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 13,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 43,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 34,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 37,
                            "note": "AAB 火辣香草 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 25,
                            "note": "ABX 火辣香草 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "噴火龍",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/006.png",
                    "recipe": "XXC",
                    "count": 37,
                    "note": "XXC 單火辣香草 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 37,
                            "note": "XXC 單火辣香草 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "骨紋巨聲鱷",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/911.png",
                    "recipe": "XXC",
                    "count": 32,
                    "note": "XXC 單火辣香草 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 32,
                            "note": "XXC 單火辣香草 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 18,
                            "note": "AAB 火辣香草 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 火辣香草 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 17,
                            "note": "AAB 火辣香草 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 火辣香草 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 20,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 18,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 14,
                            "note": "ABA 雙火辣香草 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙火辣香草 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單火辣香草 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 11,
                            "note": "AAB 火辣香草 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 火辣香草 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "阿柏怪",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/024.png",
                    "recipe": "XXC",
                    "count": 15,
                    "note": "XXC 單火辣香草 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 15,
                            "note": "XXC 單火辣香草 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "烏鴉頭頭",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/430.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單火辣香草 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單火辣香草 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 48,
                            "note": "ABA 雙萌綠玉米 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 38,
                            "note": "AAX 雙萌綠玉米 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 單萌綠玉米 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 46,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 27,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 39,
                            "note": "ABA 雙萌綠玉米 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 30,
                            "note": "AAX 雙萌綠玉米 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 單萌綠玉米 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 25,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 17,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "蝶結萌虻",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/743.png",
                    "recipe": "XXC",
                    "count": 28,
                    "note": "XXC 單萌綠玉米 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 28,
                            "note": "XXC 單萌綠玉米 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 16,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 15,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙萌綠玉米 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙萌綠玉米 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單萌綠玉米 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙萌綠玉米 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙萌綠玉米 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單萌綠玉米 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 13,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 10,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "水君",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/245.png",
                    "recipe": "XXC",
                    "count": 13,
                    "note": "XXC 單萌綠玉米 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 13,
                            "note": "XXC 單萌綠玉米 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 萌綠玉米 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 萌綠玉米 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "咚咚鼠",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/702.png",
                    "recipe": "XXC",
                    "count": 9,
                    "note": "XXC 單萌綠玉米 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 9,
                            "note": "XXC 單萌綠玉米 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 35,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 28,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 35,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 27,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 32,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 19,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 20,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 14,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "花療環環",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/764.png",
                    "recipe": "XXC",
                    "count": 31,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 31,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 21,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 15,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "信使鳥",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/225.png",
                    "recipe": "XXC",
                    "count": 25,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 25,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 15,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 17,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 10,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 14,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 10,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 16,
                            "note": "ABA 雙放鬆可可 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙放鬆可可 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單放鬆可可 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 13,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 11,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "伊布家族（8種進化）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/133.png",
                    "recipe": "ABB",
                    "count": 13,
                    "note": "ABB 放鬆可可 主力產出 (8種進化產量皆相同)",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "ABB",
                            "count": 13,
                            "note": "ABB 放鬆可可 主力產出 (8種進化產量皆相同)"
                        },
                        {
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 放鬆可可 後期主力 (8種進化產量皆相同)"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 放鬆可可 兼顧 (8種進化產量皆相同)",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Eevee Evolutions (8 Forms)"
                },
                {
                    "name": "波克基斯",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/468.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 7,
                            "note": "AAB 放鬆可可 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 放鬆可可 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "勾魂眼",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/302.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "胖可丁",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/040.png",
                    "recipe": "XXC",
                    "count": 8,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 8,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "托戈德瑪爾",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/777.png",
                    "recipe": "XXC",
                    "count": 8,
                    "note": "XXC 單放鬆可可 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 8,
                            "note": "XXC 單放鬆可可 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 40,
                            "note": "ABA 雙醒腦咖啡豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 32,
                            "note": "AAX 雙醒腦咖啡豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 9,
                            "note": "ABX 單醒腦咖啡豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 31,
                            "note": "AAB 醒腦咖啡豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 19,
                            "note": "ABX 醒腦咖啡豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 27,
                            "note": "AAB 醒腦咖啡豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 16,
                            "note": "ABX 醒腦咖啡豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "倫琴貓",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/405.png",
                    "recipe": "XXC",
                    "count": 27,
                    "note": "XXC 單醒腦咖啡豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 27,
                            "note": "XXC 單醒腦咖啡豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 14,
                            "note": "ABA 雙醒腦咖啡豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙醒腦咖啡豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單醒腦咖啡豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 14,
                            "note": "ABA 雙醒腦咖啡豆 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 9,
                            "note": "AAX 雙醒腦咖啡豆 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單醒腦咖啡豆 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 11,
                            "note": "AAB 醒腦咖啡豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 醒腦咖啡豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 醒腦咖啡豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 醒腦咖啡豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 醒腦咖啡豆 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 醒腦咖啡豆 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "烈焰猴",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/392.png",
                    "recipe": "XXC",
                    "count": 9,
                    "note": "XXC 單醒腦咖啡豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 9,
                            "note": "XXC 單醒腦咖啡豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "夢夢蝕",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/518.png",
                    "recipe": "XXC",
                    "count": 9,
                    "note": "XXC 單醒腦咖啡豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 9,
                            "note": "XXC 單醒腦咖啡豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "勇士雄鷹",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/628.png",
                    "recipe": "XXC",
                    "count": 7,
                    "note": "XXC 單醒腦咖啡豆 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 7,
                            "note": "XXC 單醒腦咖啡豆 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 37,
                            "note": "ABA 雙嫩亮酪梨 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 29,
                            "note": "AAX 雙嫩亮酪梨 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 8,
                            "note": "ABX 單嫩亮酪梨 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 22,
                            "note": "AAB 嫩亮酪梨 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 16,
                            "note": "ABX 嫩亮酪梨 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙嫩亮酪梨 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 15,
                            "note": "AAX 雙嫩亮酪梨 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單嫩亮酪梨 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 嫩亮酪梨 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 嫩亮酪梨 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 33,
                            "note": "ABA 雙品鮮蘑菇 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 26,
                            "note": "AAX 雙品鮮蘑菇 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單品鮮蘑菇 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 33,
                            "note": "ABA 雙品鮮蘑菇 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 26,
                            "note": "AAX 雙品鮮蘑菇 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單品鮮蘑菇 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 32,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 18,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 29,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 19,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "阿勃梭魯",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/359.png",
                    "recipe": "XXC",
                    "count": 28,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 28,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 19,
                            "note": "ABA 雙品鮮蘑菇 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 12,
                            "note": "AAX 雙品鮮蘑菇 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單品鮮蘑菇 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "暴雪王",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/460.png",
                    "recipe": "XXC",
                    "count": 27,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 27,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 18,
                            "note": "ABA 雙品鮮蘑菇 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 11,
                            "note": "AAX 雙品鮮蘑菇 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 單品鮮蘑菇 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "隆隆岩",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/076.png",
                    "recipe": "XXC",
                    "count": 24,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 24,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 10,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "炎帝",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/244.png",
                    "recipe": "XXC",
                    "count": 15,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 15,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "詛咒娃娃",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/354.png",
                    "recipe": "XXC",
                    "count": 13,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 13,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 品鮮蘑菇 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 4,
                            "note": "ABX 品鮮蘑菇 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "巨沼怪",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/260.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "謎擬Q",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/778.png",
                    "recipe": "XXC",
                    "count": 8,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 8,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "樹才怪",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/185.png",
                    "recipe": "XXC",
                    "count": 7,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 7,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "拉帝亞斯",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/380.png",
                    "recipe": "XXC",
                    "count": 5,
                    "note": "XXC 單品鮮蘑菇 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 5,
                            "note": "XXC 單品鮮蘑菇 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 32,
                            "note": "ABA 雙粗枝大蔥 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 24,
                            "note": "AAX 雙粗枝大蔥 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 7,
                            "note": "ABX 單粗枝大蔥 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 23,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 12,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 14,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大食花",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/071.png",
                    "recipe": "XXC",
                    "count": 22,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 22,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "花岩怪",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/442.png",
                    "recipe": "XXC",
                    "count": 22,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 22,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "魔牆人偶",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/122.png",
                    "recipe": "XXC",
                    "count": 20,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 20,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 8,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 6,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 9,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "大竺葵",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/154.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "黑魯加",
                    "specialty": "樹果",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/229.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "雷公",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/243.png",
                    "recipe": "XXC",
                    "count": 12,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 12,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 7,
                            "note": "AAB 粗枝大蔥 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 粗枝大蔥 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "顫弦蠑螈（高調的樣子）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "顫弦蠑螈（低調的樣子）",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png",
                    "recipe": "XXC",
                    "count": 10,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 10,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "沙奈朵",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/282.png",
                    "recipe": "XXC",
                    "count": 8,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 8,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "艾路雷朵",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/475.png",
                    "recipe": "XXC",
                    "count": 8,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 8,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "蜥蜴王",
                    "specialty": "技能",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/254.png",
                    "recipe": "XXC",
                    "count": 6,
                    "note": "XXC 單粗枝大蔥 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 6,
                            "note": "XXC 單粗枝大蔥 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                    "name": "南瓜怪人",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/711.png",
                    "recipe": "AAA",
                    "count": 38,
                    "note": "AAA 沉甸甸南瓜 純種產出 (體型日產 35~38 顆)",
                    "isTop": true,
                    "variants": [
                        {
                            "recipe": "AAA",
                            "count": 38,
                            "note": "AAA 沉甸甸南瓜 純種產出 (體型日產 35~38 顆)",
                            "isTop": true
                        },
                        {
                            "recipe": "ABA",
                            "count": 24,
                            "note": "ABA 雙沉甸甸南瓜 產出 (體型日產 35~38 顆)"
                        },
                        {
                            "recipe": "AAX",
                            "count": 19,
                            "note": "AAX 雙沉甸甸南瓜 產出 (體型日產 35~38 顆)",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 5,
                            "note": "ABX 單沉甸甸南瓜 混產 (體型日產 35~38 顆)",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
                        }
                    ],
                    "name_en": "Gourgeist"
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
                            "recipe": "AAB",
                            "count": 19,
                            "note": "AAB 沉甸甸南瓜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 11,
                            "note": "ABX 沉甸甸南瓜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
                        }
                    ]
                },
                {
                    "name": "浩大鯨",
                    "specialty": "食材",
                    "icon": "https://www.serebii.net/pokemonsleep/pokemon/icon/975.png",
                    "recipe": "XXC",
                    "count": 19,
                    "note": "XXC 單沉甸甸南瓜 補足",
                    "isTop": false,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 19,
                            "note": "XXC 單沉甸甸南瓜 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 13,
                            "note": "ABA 雙沉甸甸南瓜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 8,
                            "note": "AAX 雙沉甸甸南瓜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 單沉甸甸南瓜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "ABA",
                            "count": 12,
                            "note": "ABA 雙沉甸甸南瓜 產出"
                        },
                        {
                            "recipe": "AAX",
                            "count": 7,
                            "note": "AAX 雙沉甸甸南瓜 產出",
                            "origRecipes": [
                                "AAB",
                                "AAC"
                            ]
                        },
                        {
                            "recipe": "ABX",
                            "count": 2,
                            "note": "ABX 單沉甸甸南瓜 混產",
                            "origRecipes": [
                                "ABB",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 5,
                            "note": "AAB 沉甸甸南瓜 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 沉甸甸南瓜 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                    "recipe": "XXC",
                    "count": 11,
                    "note": "XXC 單美味尾巴 補足",
                    "isTop": true,
                    "variants": [
                        {
                            "recipe": "XXC",
                            "count": 11,
                            "note": "XXC 單美味尾巴 補足",
                            "origRecipes": [
                                "AAC",
                                "ABC"
                            ],
                            "isTop": true
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
                            "recipe": "AAB",
                            "count": 7,
                            "note": "AAB 美味尾巴 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 美味尾巴 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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
                            "recipe": "AAB",
                            "count": 7,
                            "note": "AAB 美味尾巴 後期主力"
                        },
                        {
                            "recipe": "ABX",
                            "count": 3,
                            "note": "ABX 美味尾巴 兼顧",
                            "origRecipes": [
                                "ABA",
                                "ABC"
                            ]
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

  const STORAGE_KEY_WIKI_SUBTAB = 'pksleep_active_wiki_subtab';
  const VALID_WIKI_SUBTABS = ['skills', 'subskills', 'ingredients', 'values', 'ratings', 'islands'];

  function getSavedWikiSubTab() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const rawHash = window.location.hash.replace(/^#/, '');
        const parts = rawHash.split(/[/_?]/);
        if (parts[0] === 'wiki' && VALID_WIKI_SUBTABS.includes(parts[1])) {
          return parts[1];
        }
      }
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_WIKI_SUBTAB);
        if (VALID_WIKI_SUBTABS.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'skills';
  }

  let currentWikiSubTab = getSavedWikiSubTab();

  // --- 核心互動控制函數 ---

  // 1. 切換子分頁 (skills / subskills / ratings / ingredients / values)
  function switchWikiSubTab(targetTab) {
    if (!targetTab) return;
    if (!VALID_WIKI_SUBTABS.includes(targetTab)) targetTab = 'skills';
    currentWikiSubTab = targetTab;

    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_WIKI_SUBTAB, targetTab);
      }
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const curHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        const mainPart = curHash.split(/[/_?]/)[0];
        if (mainPart === 'wiki' || !mainPart) {
          window.history.replaceState(null, '', targetTab === 'skills' ? '#wiki' : '#wiki/' + targetTab);
        }
      }
    } catch (e) {}

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
      p.style.display = 'none';
    });

    const activePanel = document.getElementById(`wiki-subpanel-${targetTab}`);
    if (activePanel) {
      activePanel.classList.add('active');
      activePanel.style.display = '';
    }

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    if (isMobileH5) {
      if (targetTab === 'ingredients') {
        document.body.classList.add('ladder-active');
      } else {
        document.body.classList.remove('ladder-active');
      }
      if (targetTab === 'values') {
        document.body.classList.add('values-active');
      } else {
        document.body.classList.remove('values-active');
      }
    }

    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
    const ladderSidebar = document.getElementById('ladder-filter-sidebar');
    const ladderHandle = document.getElementById('ladder-sidebar-bookmark-handle');
    const ladderBackdrop = document.getElementById('ladder-sidebar-backdrop');

    if (ladderSidebar) {
      if (targetTab === 'ingredients') {
        ladderSidebar.style.display = 'flex';
        const isLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_ladder_sidebar_open', true) : true;
        if (isLadderOpen && !isMobileH5 && window.innerWidth > 1024) {
          ladderSidebar.classList.remove('collapsed');
        } else {
          ladderSidebar.classList.add('collapsed');
          if (ladderBackdrop) ladderBackdrop.classList.remove('active');
        }
      } else {
        ladderSidebar.style.display = 'none';
        ladderSidebar.classList.add('collapsed');
        if (ladderBackdrop) ladderBackdrop.classList.remove('active');
      }
    }

    if (ladderHandle) {
      if (targetTab === 'ingredients') {
        ladderHandle.style.display = '';
        if (isMobileH5) {
          const isCollapsed = ladderSidebar ? ladderSidebar.classList.contains('collapsed') : true;
          ladderHandle.style.opacity = isCollapsed ? '1' : '0';
          ladderHandle.style.pointerEvents = isCollapsed ? 'auto' : 'none';
        }
        updateLadderActiveFilterBadge();
      } else {
        ladderHandle.style.display = 'none';
        if (isMobileH5) {
          ladderHandle.style.opacity = '0';
          ladderHandle.style.pointerEvents = 'none';
        }
      }
    }
  }

  function openLadderSidebar() {
    toggleLadderSidebar(true);
  }

  function closeLadderSidebar() {
    toggleLadderSidebar(false);
  }

  function toggleLadderSidebar(forceState) {
    const sidebar = document.getElementById('ladder-filter-sidebar');
    const backdrop = document.getElementById('ladder-sidebar-backdrop');
    const bookmarkHandle = document.getElementById('ladder-sidebar-bookmark-handle');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (bookmarkHandle) {
        bookmarkHandle.setAttribute('aria-expanded', 'false');
        bookmarkHandle.title = isEN ? 'Expand Ladder Filters' : '展開天梯篩選側邊欄';
        if (isMobileH5) {
          bookmarkHandle.style.opacity = '1';
          bookmarkHandle.style.pointerEvents = 'auto';
        }
      }
      if (typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_ladder_sidebar_open', false);
      }
    } else {
      sidebar.classList.remove('collapsed');
      sidebar.style.setProperty('display', 'flex', 'important');
      if (backdrop && (isMobileH5 || window.innerWidth <= 1024)) {
        backdrop.classList.add('active');
      }
      if (bookmarkHandle) {
        bookmarkHandle.setAttribute('aria-expanded', 'true');
        bookmarkHandle.title = isEN ? 'Collapse Ladder Filters' : '收合天梯篩選側邊欄';
        if (isMobileH5) {
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
        }
      }
      if (typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_ladder_sidebar_open', true);
      }
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
  let isLadderIngS = false;
  let isLadderSpeedM = false;
  let isLadderSpeedS = false;
  let ladderNature = 'NONE'; // 'NONE' | 'ING' | 'SPEED'
  let ladderSearchQuery = '';
  let ladderSupplyFilter = 'ALL'; // 'ALL' | 'TOP' | 'MEALS_3' | 'MEALS_2'
  let ladderRecipeFilter = 'ALL'; // 'ALL' | 'AAA' | 'ABB' | 'AXX'
  let ladderSpecialtyFilter = 'ALL'; // 'ALL' | 'INGREDIENT' | 'BERRY' | 'SKILL'
  let ladderSortOrder = 'ENERGY_ASC'; // 'ENERGY_ASC' | 'ENERGY_DESC' | 'YIELD_DESC' | 'DEMAND_DESC'
  let ladderViewMode = 'coordinate'; // 'coordinate' | 'list'
  let ladderTop15Only = true; // 預設開啟前 15 名排行（有效降低 DOM 節點並消除行動端卡頓）

  function toggleLadderTop15(enabled) {
    ladderTop15Only = enabled !== undefined ? !!enabled : !ladderTop15Only;
    const switchInput = document.getElementById('ladder-top15-switch');
    if (switchInput) switchInput.checked = ladderTop15Only;
    refreshCoordinateLadder();
  }

  function getLadderTop15Only() {
    return ladderTop15Only;
  }

  // 3.0.0 食材天梯相同產量配方動態合併核心 (Dynamic Recipe Wildcard Merger)
  function mergeRecipeCodes(recipeList) {
    if (!recipeList || recipeList.length === 0) return 'AAA';
    if (recipeList.length === 1) return recipeList[0];
    const res = [];
    for (let col = 0; col < 3; col++) {
      const chars = new Set(recipeList.map(r => (r && r[col]) || 'A'));
      if (chars.size === 1) {
        res.push([...chars][0]);
      } else {
        res.push('X');
      }
    }
    return res.join('');
  }

  function matchesLadderRecipeFilter(v, filter) {
    if (!filter || filter === 'ALL') return true;
    const recipe = typeof v === 'string' ? v : (v.recipe || '');
    const origRecipes = (typeof v === 'object' && v.origRecipes) ? v.origRecipes : [recipe];
    if (filter === 'AAA') {
      return recipe === 'AAA' || origRecipes.includes('AAA');
    }
    if (filter === 'ABB') {
      return recipe === 'ABB' || origRecipes.includes('ABB');
    }
    if (filter === 'AXX') {
      return recipe !== 'AAA' && recipe !== 'ABB';
    }
    return recipe === filter || origRecipes.includes(filter);
  }

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
    "大岩蛇": "樹果", "大鋼蛇": "樹果", "大綱蛇": "樹果", "卡拉卡拉": "樹果", "嘎啦嘎啦": "樹果", "小福蛋": "食材", "吉利蛋": "食材", "幸福蛋": "食材",
    "袋獸": "食材", "魔尼尼": "食材", "魔牆人偶": "食材", "凱羅斯": "食材", "大甲": "食材", "百變怪": "食材",
    "伊布": "技能", "伊布（佳節）": "樹果", "伊布（萬聖節）": "技能", "伊布家族": "技能", "伊布家族（8種進化）": "技能", "水伊布": "技能", "雷伊布": "技能", "火伊布": "技能",
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
    "海豹球": "樹果", "海豹球（佳節）": "技能", "海魔獅": "樹果", "帝牙海獅": "樹果",
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
    "快泳蛙": "樹果", "胡地": "技能", "怪力": "食材", "臭臭泥": "技能"
  };

  function getPokemonLadderSpecialty(pkmName) {
    if (!pkmName) return '食材';
    const clean = pkmName.replace(/（.*）|\(.*\)/g, '').trim();
    // 1. 若全域寶可夢資料庫（window.POKEMON_DATA）已載入，優先使用官方資料集
    if (typeof window !== 'undefined' && Array.isArray(window.POKEMON_DATA) && window.POKEMON_DATA.length > 0) {
      const match = window.POKEMON_DATA.find(p => p.name_cn === pkmName || p.name_cn === clean || p.name_cn === pkmName.replace('大綱蛇', '大鋼蛇') || p.name_cn === pkmName.replace('大鋼蛇', '大綱蛇') || p.name_en === pkmName);
      if (match && match.specialty) return match.specialty;
    }
    // 2. 本地字典速查
    if (POKEMON_SPECIALTY_MAP[pkmName]) return POKEMON_SPECIALTY_MAP[pkmName];
    if (POKEMON_SPECIALTY_MAP[clean]) return POKEMON_SPECIALTY_MAP[clean];
    if (clean === '大綱蛇' || clean === '大鋼蛇') return '樹果';
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

  const EEVEELUTIONS_ALIASES = [
    '雷伊布', 'jolteon', '水伊布', 'vaporeon', '火伊布', 'flareon',
    '太陽伊布', 'espeon', '月亮伊布', 'umbreon', '葉伊布', 'leafeon',
    '冰伊布', 'glaceon', '仙子伊布', 'sylveon', '伊布家族', 'eevee'
  ];

  function matchesLadderSearch(pName, pNameEn, query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const name = (pName || '').toLowerCase();
    const nameEn = (pNameEn || '').toLowerCase();
    if (name.includes(q) || nameEn.includes(q)) return true;
    if (name.includes('伊布家族') || nameEn.includes('eevee')) {
      if (EEVEELUTIONS_ALIASES.some(alias => alias.includes(q) || q.includes(alias))) {
        return true;
      }
    }
    return false;
  }

  function getLadderMultiplier() {
    let mult = 1.0;
    // 副技能加成：食材機率 (M: +36%, S: +18%)
    let ingRateBoost = 0;
    if (isLadderIngM) ingRateBoost += 0.36;
    if (isLadderIngS) ingRateBoost += 0.18;
    if (ingRateBoost > 0) mult *= (1.0 + ingRateBoost);

    // 副技能加成：幫忙速度 (M: -14% 間隔, S: -7% 間隔)
    let speedReduction = 0;
    if (isLadderSpeedM) speedReduction += 0.14;
    if (isLadderSpeedS) speedReduction += 0.07;
    if (speedReduction > 0) mult *= (1.0 / (1.0 - speedReduction));

    // 性格加成 (單選):
    if (ladderNature === 'ING') {
      mult *= 1.20; // 性格食材機率▲ (+20%)
    } else if (ladderNature === 'SPEED') {
      mult *= (1.0 / 0.9090909); // 性格幫忙速度▲ (-9.09% 間隔，約 +10% 幫忙次數)
    }

    return mult;
  }

  function toggleLadderIngM(checked) {
    isLadderIngM = !!checked;
    refreshCoordinateLadder();
  }

  function toggleLadderIngS(checked) {
    isLadderIngS = !!checked;
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedM(checked) {
    isLadderSpeedM = !!checked;
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedS(checked) {
    isLadderSpeedS = !!checked;
    refreshCoordinateLadder();
  }

  function setLadderNature(natureType) {
    ladderNature = natureType || 'NONE';
    document.querySelectorAll('[data-nature-filter]').forEach(btn => {
      if (btn.getAttribute('data-nature-filter') === ladderNature) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function toggleLadderNatureIng(checked) {
    setLadderNature(checked ? 'ING' : 'NONE');
  }

  function toggleLadderNatureSpeed(checked) {
    setLadderNature(checked ? 'SPEED' : 'NONE');
  }

  function onLadderSearch(val) {
    ladderSearchQuery = (val || '').trim();
    const input = document.getElementById('ladder-pkm-search-input');
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(input, clearBtn);
    } else if (clearBtn) {
      clearBtn.style.display = ladderSearchQuery ? 'flex' : 'none';
    }
    applyLadderFiltersInPlace();
  }

  function clearLadderSearch() {
    ladderSearchQuery = '';
    const input = document.getElementById('ladder-pkm-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(input, clearBtn);
    } else if (clearBtn) {
      clearBtn.style.display = 'none';
    }
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

  function setLadderSortOrder(sortOrder) {
    ladderSortOrder = sortOrder || 'ENERGY_ASC';
    document.querySelectorAll('[data-sort-order]').forEach(btn => {
      if (btn.getAttribute('data-sort-order') === ladderSortOrder) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    refreshCoordinateLadder();
  }

  function getLadderSortOrder() {
    return ladderSortOrder;
  }

  function resetLadderFilters() {
    ladderSearchQuery = '';
    const searchInput = document.getElementById('ladder-pkm-search-input');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('ladder-search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    ladderSortOrder = 'ENERGY_ASC';
    document.querySelectorAll('[data-sort-order]').forEach(btn => {
      if (btn.getAttribute('data-sort-order') === 'ENERGY_ASC') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

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

    ladderNature = 'NONE';
    document.querySelectorAll('[data-nature-filter]').forEach(btn => {
      if (btn.getAttribute('data-nature-filter') === 'NONE') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    isLadderIngM = false;
    isLadderIngS = false;
    isLadderSpeedM = false;
    isLadderSpeedS = false;
    ladderTop15Only = true;

    const top15 = document.getElementById('ladder-top15-switch');
    if (top15) top15.checked = true;
    const ingM = document.getElementById('ladder-ing-m-toggle');
    if (ingM) ingM.checked = false;
    const ingS = document.getElementById('ladder-ing-s-toggle');
    if (ingS) ingS.checked = false;
    const speedM = document.getElementById('ladder-speed-m-toggle');
    if (speedM) speedM.checked = false;
    const speedS = document.getElementById('ladder-speed-s-toggle');
    if (speedS) speedS.checked = false;

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
      const pkmName = n.getAttribute('data-pkm') || '';
      if (matchesLadderSearch(pkmName, '', q)) {
        n.classList.remove('ladder-node-dimmed');
        n.classList.add('ladder-node-spotlight');
      } else {
        n.classList.remove('ladder-node-spotlight');
        n.classList.add('ladder-node-dimmed');
      }
    });

    spans.forEach(s => {
      const pkmGroup = s.getAttribute('data-pkm-group') || '';
      if (matchesLadderSearch(pkmGroup, '', q)) {
        s.classList.remove('ladder-span-dimmed');
        s.classList.add('ladder-span-spotlight');
      } else {
        s.classList.remove('ladder-span-spotlight');
        s.classList.add('ladder-span-dimmed');
      }
    });
  }

  function updateLadderActiveFilterBadge() {
    const badge = document.getElementById('ladder-sidebar-bookmark-badge');
    let count = 0;
    if (ladderSearchQuery && ladderSearchQuery.trim()) count++;
    if (ladderSupplyFilter && ladderSupplyFilter !== 'ALL') count++;
    if (ladderRecipeFilter && ladderRecipeFilter !== 'ALL') count++;
    if (ladderSpecialtyFilter && ladderSpecialtyFilter !== 'ALL') count++;
    if (ladderSortOrder && ladderSortOrder !== 'ENERGY_ASC') count++;
    if (isLadderIngM || isLadderIngS || isLadderSpeedM || isLadderSpeedS) count++;
    if (ladderNature && ladderNature !== 'NONE') count++;

    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function refreshCoordinateLadder() {
    const container = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (container) {
      container.innerHTML = renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA);
      if (ladderSearchQuery) {
        applyLadderFiltersInPlace();
      }
    }
    updateLadderActiveFilterBadge();
  }

  // 3.1 切換天梯圖呈現模式 (相容性函式)
  function switchLadderView(mode) {
    const coordContainer = document.getElementById('wiki-ingredient-ladder-coordinate');
    if (coordContainer) coordContainer.style.setProperty('display', 'block', 'important');
  }

  // 3.2 點選食材圖示開啟單一食材產量排名浮窗 (Ingredient Output Ranking Modal)
  function openIngredientRankingModal(ingId) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const mult = getLadderMultiplier();
    const ingData = LV60_COORDINATE_LADDER_DATA.find(i => i.id === ingId);
    if (!ingData) return;

    const ingName = isEN ? ((window.I18N && window.I18N.getIngredientName(ingData.name)) || ingData.name) : ingData.name;
    const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ingId] || { name: isEN ? 'Key Dish' : '核心大菜', name_en: 'Key Dish', need: 20 };
    const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;

    // 依當前篩選條件收集並計算所有寶可夢產量排名
    let rankingList = [];
    ingData.pokemon.forEach((p, pIdx) => {
      const pkmSpec = getPokemonLadderSpecialty(p.name);
      if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return;

      let variants = (p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }]).filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

      if (ladderSupplyFilter === 'TOP') {
        const allMaxCounts = ingData.pokemon.map(pkm => Math.max(...(pkm.variants || [{count: pkm.count}]).map(v => v.count)));
        const distinctCounts = [...new Set(allMaxCounts)].sort((a,b) => b - a);
        const top5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
        const pkmMaxCount = Math.max(...(p.variants || [{count: p.count}]).map(v => v.count));
        if (pkmMaxCount < top5Threshold) return;
        variants = variants.slice(0, 1);
      } else if (ladderSupplyFilter === 'MEALS_3') {
        variants = variants.filter(v => Math.round(v.count * mult) >= dishInfo.need * 3);
      } else if (ladderSupplyFilter === 'MEALS_2') {
        variants = variants.filter(v => Math.round(v.count * mult) >= dishInfo.need * 2);
      }

      if (ladderSearchQuery) {
        if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return;
      }

      variants.forEach(v => {
        const scaledCount = Math.round(v.count * mult);
        rankingList.push({
          name: p.name,
          name_en: p.name_en,
          icon: p.icon,
          recipe: v.recipe,
          count: scaledCount,
          rawCount: v.count,
          isTop: v.isTop || (p.isTop && v.recipe === p.recipe),
          specialty: pkmSpec,
          note: v.note
        });
      });
    });

    // 依產量由大到小排序
    rankingList.sort((a, b) => b.count - a.count);

    // 密集群組名次演算法 (Dense Ranking)：同產量者並列相同名次，後續名次緊接遞增不跳號
    let currentDenseRank = 0;
    let lastYieldCount = null;
    const rankedList = rankingList.map((item) => {
      if (lastYieldCount === null || item.count < lastYieldCount) {
        currentDenseRank++;
        lastYieldCount = item.count;
      }
      return {
        ...item,
        rank: currentDenseRank
      };
    });

    let modal = document.getElementById('wiki-ingredient-ranking-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'wiki-ingredient-ranking-modal';
      modal.className = 'ing-rank-modal-overlay modal-overlay';
      document.body.appendChild(modal);
    }

    const itemsHTML = rankedList.length === 0 ? `
      <div class="ing-rank-empty">
        <p>${isEN ? 'No Pokémon matched current ladder filter conditions.' : '當前篩選條件下查無符合之寶可夢。'}</p>
      </div>
    ` : `
      <div class="ing-rank-list">
        ${rankedList.map((item) => {
          const rank = item.rank;
          const rankClass = rank === 1 ? 'rank-1' : (rank === 2 ? 'rank-2' : (rank === 3 ? 'rank-3' : 'rank-other'));
          const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(item.name)) || item.name) : item.name;

          return `
            <div class="ing-rank-card ${rankClass}" title="${pkmDisplayName} (${item.recipe}) · ${item.count} ${isEN ? '/day' : '顆/天'}">
              <div class="ing-rank-left">
                <div class="ing-rank-num ${rankClass}">
                  ${rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : `#${rank}`))}
                </div>
                <div class="ing-rank-avatar-box ${rankClass}">
                  <img src="${item.icon}" class="ing-rank-avatar-img" alt="${pkmDisplayName}" loading="lazy">
                </div>
                <span class="node-recipe-tag-inline recipe-tag-${item.recipe.toLowerCase()}">${item.recipe}</span>
              </div>
              <div class="ing-rank-right">
                <span class="ing-rank-yield-line"><span class="ing-rank-yield-num">${item.count}</span><span class="ing-rank-yield-unit">${isEN ? ' /day' : ' 顆/天'}</span></span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modal.innerHTML = `
      <div class="ing-rank-dialog" onclick="event.stopPropagation()">
        <div class="ing-rank-header">
          <div class="ing-rank-title-group">
            <img src="${ingData.icon}" class="ing-rank-header-icon" alt="${ingName}">
            <div class="ing-rank-header-text">
              <div class="ing-rank-header-title">${ingName} <span class="ing-rank-header-energy">[${isEN ? 'Energy' : '能量'} ${ingData.energy || ''}]</span></div>
              <div class="ing-rank-header-sub">${isEN ? 'Key Dish:' : '核心大菜：'} ${dishName} (${dishInfo.need}${isEN ? '/meal' : '顆/餐'}) · ${rankingList.length} ${isEN ? 'Pokémon' : '隻寶可夢'}</div>
            </div>
          </div>
          <button type="button" class="ing-rank-close-btn" onclick="window.WikiDB.closeIngredientRankingModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="ing-rank-body">
          ${itemsHTML}
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.onclick = closeIngredientRankingModal;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeIngredientRankingModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  function closeIngredientRankingModal() {
    const modal = document.getElementById('wiki-ingredient-ranking-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.innerHTML = '';
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

  // 5.1 樹果能量動態等級 (Lv.1 ~ Lv.70)、島嶼加成 (0% ~ 85%) 與 順果 2x 計算 (持久化保存)
  const STORAGE_KEY_BERRY_LEVEL = 'pksleep_wiki_berry_level';
  const STORAGE_KEY_BERRY_ISLAND = 'pksleep_wiki_berry_island';

  let currentBerryLevel = 1;
  let currentIslandBonus = 0;
  let isFavoriteBerry2x = false;

  function loadPersistedBerrySettings() {
    try {
      if (typeof localStorage === 'undefined') return;
      const savedLv = localStorage.getItem(STORAGE_KEY_BERRY_LEVEL);
      if (savedLv !== null) {
        const parsedLv = parseInt(savedLv, 10);
        if (!isNaN(parsedLv) && parsedLv >= 1 && parsedLv <= 70) {
          currentBerryLevel = parsedLv;
        }
      }
      const savedIsland = localStorage.getItem(STORAGE_KEY_BERRY_ISLAND);
      if (savedIsland !== null) {
        const parsedIsland = parseInt(savedIsland, 10);
        if (!isNaN(parsedIsland) && parsedIsland >= 0 && parsedIsland <= 85) {
          currentIslandBonus = parsedIsland;
        }
      }
    } catch (e) {
      console.warn('Failed to load persisted berry settings from localStorage:', e);
    }
  }

  // 初始載入持久化設定
  loadPersistedBerrySettings();

  function calcBerryEnergy(base, lv, islandBonus, isFav) {
    const baseAtLv = Math.round(Math.max(base + (lv - 1), base * Math.pow(1.025, lv - 1)));
    const islandFactor = 1 + ((parseInt(islandBonus, 10) || 0) / 100);
    const favFactor = isFav ? 2 : 1;
    return Math.round(baseAtLv * islandFactor * favFactor);
  }

  function updateBerryLevel(val) {
    currentBerryLevel = Math.min(Math.max(parseInt(val, 10) || 1, 1), 70);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BERRY_LEVEL, currentBerryLevel.toString());
      }
    } catch (e) {}
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
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_BERRY_ISLAND, currentIslandBonus.toString());
      }
    } catch (e) {}
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
      const energy1x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, false);
      const energy2x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, true);
      const bName = isEN ? (window.I18N.getBerryName(b.name) || b.name) : b.name;
      const bType = isEN ? (window.I18N.getTypeName(b.type) || b.type) : b.type;
      const bonusStr = currentIslandBonus > 0 ? (isEN ? ` +${currentIslandBonus}% Island` : ` +${currentIslandBonus}%島嶼`) : '';
      return `
        <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr} | ${isEN ? 'Base' : '基礎'}: ${energy1x} / ${isEN ? 'Fav 2x' : '順果 2x'}: ${energy2x}">
          <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
          <span class="value-compact-energy berry-val" title="${isEN ? 'Base Energy (1x)' : '基礎能量 (1x)'}"><span class="energy-multiplier-prefix">1x</span> ${energy1x}</span>
          <span class="value-compact-energy berry-val-fav" title="${isEN ? 'Favorite Berry (2x)' : '順果 2x 能量'}"><span class="energy-multiplier-prefix">2x</span> ${energy2x}</span>
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

    // 9. 綁定天梯篩選側邊欄手勢右滑關閉 (Swipe Right to Close)
    const ladderSidebar = document.getElementById('ladder-filter-sidebar');
    if (ladderSidebar) {
      if (typeof window.bindSidebarSwipeRightToClose === 'function') {
        window.bindSidebarSwipeRightToClose(ladderSidebar, () => closeLadderSidebar());
      } else {
        let startX = 0, startY = 0, startTime = 0;
        ladderSidebar.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }, { passive: true });
        ladderSidebar.addEventListener('touchend', (e) => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const diffX = e.changedTouches[0].clientX - startX;
          const diffY = e.changedTouches[0].clientY - startY;
          const elapsed = Date.now() - startTime;
          if (diffX > 35 && (diffX > Math.abs(diffY) * 1.05 || (elapsed < 350 && diffX > 25))) {
            if (!ladderSidebar.classList.contains('collapsed')) {
              closeLadderSidebar();
            }
          }
        }, { passive: true });
      }
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

  // --- 8. 7大研究島嶼營地與EX專家模式資料庫 (Research Camps & EX Mode DB) ---
  const ISLANDS_DATA = [
    {
      id: "greengrass",
      name: "萌綠之島",
      name_en: "Greengrass Isle",
      image: "https://www.serebii.net/pokemonsleep/locations/greengrassisle.jpg",
      badgeColor: "#22c55e",
      unlockGoal: 0,
      unlockGoalText: "初始營地 (0種睡姿)",
      unlockGoalText_en: "Starting Camp (0 Styles)",
      snorlaxMultiplier: "1.0x",
      berriesMode: "random",
      berriesDesc: "每週自18種樹果中隨機指定3種",
      berriesDesc_en: "Random 3 Berries chosen weekly from all 18 types",
      favoriteBerries: [],
      favoriteTypes: [],
      hasExpertMode: true,
      expertMode: {
        name: "萌綠之島 EX模式",
        name_en: "Greengrass Isle EX",
        unlockReq: "萌綠之島卡比獸達到 [大師 18]",
        unlockReq_en: "Reach Snorlax Master 18 on Greengrass Isle",
        ticketReq: "進入需消耗 [EX券] 1張 (普通兌換所200點/進階兌換所100點, 背包上限持有2張)",
        ticketReq_en: "Requires 1 EX Pass (200 Sleep Pts normal / 100 Sleep Pts premium, max hold 2)",
        berryRule: "1種主樹果 + 2種副樹果 (每週隨機輪替)",
        berryRule_en: "1 Primary Berry + 2 Secondary Berries (Rotates weekly)",
        bonus: "收集主樹果的寶可夢享有幫忙間隔大幅縮短加成",
        bonus_en: "Pokemon collecting Primary Berry gain massive helping speed boost",
        penalty: "未收集當週指定喜愛樹果的寶可夢受到幫忙間隔延長 (+15%) 減速懲罰",
        penalty_en: "Pokemon without favored berries suffer +15% interval delay penalty",
        campReward: "累積獨立的 [EX營地加成], 不消耗也不疊加一般營地加成",
        campReward_en: "Accumulates independent EX Area Bonus, separate from normal area bonus",
        rewards: "異色寶可夢 (Shiny) 出現機率顯著提升, 獲得大量研究EXP與夢之碎片與糖果, 開放專屬高難度每週任務",
        rewards_en: "Higher Shiny rate, massive Research EXP, Dream Shards, Candies, and exclusive weekly missions",
        snorlaxEnergyTiers: [
          { rank: "Basic 1", energy: 0 },
          { rank: "Great 1", energy: 309675 },
          { rank: "Ultra 1", energy: 997610 },
          { rank: "Master 1", energy: 2014314 },
          { rank: "Master 5", energy: 3057187 },
          { rank: "Master 10", energy: 4778794 },
          { rank: "Master 15", energy: 7152862 },
          { rank: "Master 20", energy: 10981171 }
        ]
      },
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 23385 },
        { rank: "Ultra 1", energy: 79197 },
        { rank: "Master 1", energy: 187832 },
        { rank: "Master 5", energy: 321146 },
        { rank: "Master 10", energy: 532707 },
        { rank: "Master 15", energy: 1199506 },
        { rank: "Master 20", energy: 3245795 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "920,000"
              },
              {
                      "count": 5,
                      "power": "2,060,000"
              },
              {
                      "count": 6,
                      "power": "4,500,000"
              },
              {
                      "count": 7,
                      "power": "8,320,000"
              },
              {
                      "count": 8,
                      "power": "19,500,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "妙蛙種子", name_en: "Bulbasaur", type: "草", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "妙蛙草", name_en: "Ivysaur", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "妙蛙花", name_en: "Venusaur", type: "草", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "鐵甲蛹", name_en: "Metapod", type: "蟲", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "巴大蝶", name_en: "Butterfree", type: "蟲", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "阿柏蛇", name_en: "Ekans", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "阿柏怪", name_en: "Arbok", type: "毒", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "可達鴨", name_en: "Psyduck", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "猴怪", name_en: "Mankey", type: "格鬥", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "火爆猴", name_en: "Primeape", type: "格鬥", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "口呆花", name_en: "Weepinbell", type: "草", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "大食花", name_en: "Victreebel", type: "草", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "-" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "菊草葉", name_en: "Chikorita", type: "草", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "月桂葉", name_en: "Bayleef", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "大竺葵", name_en: "Meganium", type: "草", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "烏波 (帕底亞的樣子)", name_en: "Paldean Wooper", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Master 1" },
          { name: "月亮伊布", name_en: "Umbreon", type: "惡", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "狃拉", name_en: "Sneasel", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "信使鳥", name_en: "Delibird", type: "飛行", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "戴魯比", name_en: "Houndour", type: "惡", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "過動猿", name_en: "Vigoroth", type: "一般", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "Ultra 3" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "吞食獸", name_en: "Swalot", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "怨影娃娃", name_en: "Shuppet", type: "幽靈", s1: "Great 1", s2: "Great 5", s3: "-", s4: "-" },
          { name: "詛咒娃娃", name_en: "Banette", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "阿勃梭魯", name_en: "Absol", type: "惡", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "飄飄球", name_en: "Drifloon", type: "幽靈", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "-" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "不良蛙", name_en: "Croagunk", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "毒骷蛙", name_en: "Toxicroak", type: "毒", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "瑪狃拉", name_en: "Weavile", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "葉伊布", name_en: "Leafeon", type: "草", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "南瓜精", name_en: "Pumpkaboo", type: "幽靈", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
          { name: "南瓜怪人", name_en: "Gourgeist", type: "幽靈", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "謎擬Q", name_en: "Mimikyu", type: "幽靈", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "顫弦蠑螈 (高調的樣子)", name_en: "Toxtricity Amped Form", type: "毒", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "顫弦蠑螈 (低調的樣子)", name_en: "Toxtricity Low Key Form", type: "毒", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "新葉喵", name_en: "Sprigatito", type: "草", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "蒂蕾喵", name_en: "Floragato", type: "草", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "魔幻假面喵", name_en: "Meowscarada", type: "惡", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "土王", name_en: "Clodsire", type: "毒", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
        ],
        snoozing: [
          { name: "小火龍", name_en: "Charmander", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "火恐龍", name_en: "Charmeleon", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "噴火龍", name_en: "Charizard", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "小拉達", name_en: "Rattata", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "拉達", name_en: "Raticate", type: "一般", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Great 3" },
          { name: "雷丘", name_en: "Raichu", type: "電", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Master 3", s2: "Master 7", s3: "-", s4: "Master 8" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Master 1", s2: "Master 5", s3: "-", s4: "Master 6" },
          { name: "胖丁", name_en: "Jigglypuff", type: "妖精", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "胖可丁", name_en: "Wigglytuff", type: "妖精", s1: "Master 2", s2: "Master 6", s3: "-", s4: "Master 7" },
          { name: "地鼠", name_en: "Diglett", type: "地面", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "-" },
          { name: "三地鼠", name_en: "Dugtrio", type: "地面", s1: "Great 5", s2: "Ultra 4", s3: "-", s4: "-" },
          { name: "喵喵", name_en: "Meowth", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "貓老大", name_en: "Persian", type: "一般", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "卡蒂狗", name_en: "Growlithe", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "呆呆獸", name_en: "Slowpoke", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "呆殼獸", name_en: "Slowbro", type: "水", s1: "Ultra 1", s2: "Ultra 5", s3: "-", s4: "Master 1" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "袋獸", name_en: "Kangaskhan", type: "一般", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "雷伊布", name_en: "Jolteon", type: "電", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "火伊布", name_en: "Flareon", type: "火", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "火球鼠", name_en: "Cyndaquil", type: "火", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "火岩鼠", name_en: "Quilava", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "火爆獸", name_en: "Typhlosion", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "波克基古", name_en: "Togetic", type: "妖精", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "天然鳥", name_en: "Xatu", type: "超能力", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "咩利羊", name_en: "Mareep", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "茸茸羊", name_en: "Flaaffy", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "太陽伊布", name_en: "Espeon", type: "超能力", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "果然翁", name_en: "Wobbuffet", type: "超能力", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Ultra 1" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "雷公", name_en: "Raikou", type: "電", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "火稚雞", name_en: "Torchic", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "懶人獺", name_en: "Slakoth", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "請假王", name_en: "Slaking", type: "一般", s1: "Master 7", s2: "Master 11", s3: "Master 17", s4: "Master 12" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Ultra 5", s2: "Master 4", s3: "-", s4: "Master 5" },
          { name: "波克基斯", name_en: "Togekiss", type: "妖精", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "食夢夢", name_en: "Munna", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "-", s4: "-" },
          { name: "夢夢蝕", name_en: "Musharna", type: "超能力", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "仙子伊布", name_en: "Sylveon", type: "妖精", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "萌虻", name_en: "Cutiefly", type: "妖精", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "蝶結萌虻", name_en: "Ribombee", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "花療環環", name_en: "Comfey", type: "妖精", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "超夢", name_en: "Mewtwo", type: "超能力", s1: "Master 10", s2: "Master 14", s3: "Master 20", s4: "-" },
        ],
        slumbering: [
          { name: "傑尼龜", name_en: "Squirtle", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "卡咪龜", name_en: "Wartortle", type: "水", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "水箭龜", name_en: "Blastoise", type: "水", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "Master 4" },
          { name: "小拳石", name_en: "Geodude", type: "岩石", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "隆隆石", name_en: "Graveler", type: "岩石", s1: "Great 3", s2: "Ultra 2", s3: "-", s4: "Ultra 3" },
          { name: "小磁怪", name_en: "Magnemite", type: "鋼", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "-" },
          { name: "三合一磁怪", name_en: "Magneton", type: "鋼", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "-" },
          { name: "嘟嘟", name_en: "Doduo", type: "飛行", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "嘟嘟利", name_en: "Dodrio", type: "飛行", s1: "Great 5", s2: "Ultra 4", s3: "-", s4: "Ultra 5" },
          { name: "卡拉卡拉", name_en: "Cubone", type: "地面", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "嘎啦嘎啦", name_en: "Marowak", type: "地面", s1: "Great 2", s2: "Ultra 1", s3: "-", s4: "Ultra 2" },
          { name: "水伊布", name_en: "Vaporeon", type: "水", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "小鋸鱷", name_en: "Totodile", type: "水", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Great 2" },
          { name: "藍鱷", name_en: "Croconaw", type: "水", s1: "Great 4", s2: "Ultra 3", s3: "-", s4: "Ultra 4" },
          { name: "大力鱷", name_en: "Feraligatr", type: "水", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "Master 10" },
          { name: "皮丘", name_en: "Pichu", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Ultra 1" },
          { name: "寶寶丁", name_en: "Igglybuff", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "波克比", name_en: "Togepi", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "樹才怪", name_en: "Sudowoodo", type: "岩石", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Ultra 1" },
          { name: "烏波", name_en: "Wooper", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "沼王", name_en: "Quagsire", type: "水", s1: "Master 1", s2: "Master 5", s3: "-", s4: "Master 6" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 9", s2: "Master 13", s3: "Master 19", s4: "-" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "力壯雞", name_en: "Combusken", type: "格鬥", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "火焰雞", name_en: "Blaziken", type: "格鬥", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "水躍魚", name_en: "Mudkip", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "沼躍魚", name_en: "Marshtomp", type: "地面", s1: "Ultra 2", s2: "Master 1", s3: "-", s4: "Master 2" },
          { name: "巨沼怪", name_en: "Swampert", type: "地面", s1: "Master 7", s2: "Master 11", s3: "-", s4: "Master 12" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Master 3", s2: "Master 7", s3: "-", s4: "Master 8" },
          { name: "青綿鳥", name_en: "Swablu", type: "飛行", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "小果然", name_en: "Wynaut", type: "超能力", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "海豹球", name_en: "Spheal", type: "冰", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "盆才怪", name_en: "Bonsly", type: "岩石", s1: "Basic 1", s2: "Basic 5", s3: "-", s4: "Great 1" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 3", s2: "Great 2", s3: "-", s4: "Great 3" },
          { name: "自爆磁怪", name_en: "Magnezone", type: "鋼", s1: "Master 7", s2: "Master 11", s3: "Master 17", s4: "-" },
          { name: "冰伊布", name_en: "Glaceon", type: "冰", s1: "Master 5", s2: "Master 9", s3: "-", s4: "Master 10" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "勇士雄鷹", name_en: "Braviary", type: "飛行", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Master 7", s2: "Master 11", s3: "-", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Master 4", s2: "Master 8", s3: "-", s4: "Master 9" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "潤水鴨", name_en: "Quaxly", type: "水", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "走鯨", name_en: "Cetoddle", type: "冰", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Master 1" },
        ],
      }
    },
    {
      id: "cyan",
      name: "天青沙灘",
      name_en: "Cyan Beach",
      image: "https://www.serebii.net/pokemonsleep/locations/cyanbeach.jpg",
      badgeColor: "#06b6d4",
      unlockGoal: 20,
      unlockGoalText: "登錄 20 種睡姿",
      unlockGoalText_en: "20 Sleep Styles",
      snorlaxMultiplier: "1.25x",
      berriesMode: "fixed",
      favoriteBerries: ["橙橙果","椰木果","桃桃果"],
      favoriteTypes: ["水","飛行","妖精"],
      hasExpertMode: true,
      expertMode: {
        name: "天青沙灘 EX模式",
        name_en: "Cyan Beach EX",
        unlockReq: "萌綠之島與天青沙灘卡比獸皆達到 [大師 18]",
        unlockReq_en: "Reach Master 18 on both Greengrass Isle and Cyan Beach",
        ticketReq: "進入需消耗 [EX券] 1張",
        ticketReq_en: "Requires 1 EX Pass",
        berryRule: "1種主樹果自 (水/飛行/妖精) 中指定1種, 副樹果自其餘17種中隨機指定2種",
        berryRule_en: "1 Primary Berry from Water/Flying/Fairy, 2 Secondary Berries from remaining 17 types",
        bonus: "主樹果幫手速度大幅縮短, 水君 (Suicune) 與小鍛匠家族遭遇率大幅提升",
        bonus_en: "Primary Berry speed boost, significantly boosted Suicune and Tinkatink spawn rates",
        penalty: "非指定喜愛樹果寶可夢幫忙間隔延長 (+15%) 懲罰",
        penalty_en: "Pokemon without favored berries suffer +15% interval delay penalty",
        campReward: "累積獨立的 [EX營地加成]",
        campReward_en: "Accumulates independent EX Area Bonus",
        rewards: "高額研究EXP與夢之碎片與糖果, 異色率提升, EX專屬每週任務",
        rewards_en: "Massive Research EXP, Dream Shards, Candies, higher Shiny rates, and exclusive weekly missions",
        snorlaxEnergyTiers: [
          { rank: "Basic 1", energy: 0 },
          { rank: "Great 1", energy: 309675 },
          { rank: "Ultra 1", energy: 1037612 },
          { rank: "Master 1", energy: 2194292 },
          { rank: "Master 5", energy: 3489192 },
          { rank: "Master 10", energy: 5609891 },
          { rank: "Master 15", energy: 7802011 },
          { rank: "Master 20", energy: 14780152 }
        ]
      },
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 36164 },
        { rank: "Ultra 1", energy: 122474 },
        { rank: "Master 1", energy: 256544 },
        { rank: "Master 5", energy: 420363 },
        { rank: "Master 10", energy: 735875 },
        { rank: "Master 15", energy: 1379432 },
        { rank: "Master 20", energy: 3732664 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,150,000"
              },
              {
                      "count": 5,
                      "power": "2,570,000"
              },
              {
                      "count": 6,
                      "power": "5,620,000"
              },
              {
                      "count": 7,
                      "power": "10,400,000"
              },
              {
                      "count": 8,
                      "power": "24,400,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "可達鴨", name_en: "Psyduck", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "不良蛙", name_en: "Croagunk", type: "毒", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "毒骷蛙", name_en: "Toxicroak", type: "毒", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "骨紋巨聲鱷", name_en: "Skeledirge", type: "幽靈", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
        ],
        snoozing: [
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Great 1" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 6" },
          { name: "胖丁", name_en: "Jigglypuff", type: "妖精", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "胖可丁", name_en: "Wigglytuff", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "呆呆獸", name_en: "Slowpoke", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "呆殼獸", name_en: "Slowbro", type: "水", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "袋獸", name_en: "Kangaskhan", type: "一般", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "魔牆人偶", name_en: "Mr. Mime", type: "超能力", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Master 1" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "呆呆王", name_en: "Slowking", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "萌虻", name_en: "Cutiefly", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "蝶結萌虻", name_en: "Ribombee", type: "妖精", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "花療環環", name_en: "Comfey", type: "妖精", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "炙燙鱷", name_en: "Crocalor", type: "火", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Master 1" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "-" },
        ],
        slumbering: [
          { name: "傑尼龜", name_en: "Squirtle", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "卡咪龜", name_en: "Wartortle", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "水箭龜", name_en: "Blastoise", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "哥達鴨", name_en: "Golduck", type: "水", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "水伊布", name_en: "Vaporeon", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小鋸鱷", name_en: "Totodile", type: "水", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "藍鱷", name_en: "Croconaw", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "大力鱷", name_en: "Feraligatr", type: "水", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "寶寶丁", name_en: "Igglybuff", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "樹才怪", name_en: "Sudowoodo", type: "岩石", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "烏波", name_en: "Wooper", type: "水", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "沼王", name_en: "Quagsire", type: "水", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "-" },
          { name: "盆才怪", name_en: "Bonsly", type: "岩石", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "魔尼尼", name_en: "Mime Jr.", type: "超能力", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
        ],
      }
    },
    {
      id: "taupe",
      name: "灰褐洞窟",
      name_en: "Taupe Hollow",
      image: "https://www.serebii.net/pokemonsleep/locations/taupehollow.jpg",
      badgeColor: "#f97316",
      unlockGoal: 70,
      unlockGoalText: "登錄 70 種睡姿",
      unlockGoalText_en: "70 Sleep Styles",
      snorlaxMultiplier: "1.55x",
      berriesMode: "fixed",
      favoriteBerries: ["蘋野果","勿花果","文柚果"],
      favoriteTypes: ["火","地面","岩石"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 51635 },
        { rank: "Ultra 1", energy: 174869 },
        { rank: "Master 1", energy: 366295 },
        { rank: "Master 5", energy: 600197 },
        { rank: "Master 10", energy: 1050688 },
        { rank: "Master 15", energy: 1776213 },
        { rank: "Master 20", energy: 4219534 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,430,000"
              },
              {
                      "count": 5,
                      "power": "3,190,000"
              },
              {
                      "count": 6,
                      "power": "6,980,000"
              },
              {
                      "count": 7,
                      "power": "12,900,000"
              },
              {
                      "count": 8,
                      "power": "30,200,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "-" },
          { name: "耿鬼", name_en: "Gengar", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "烏波 (帕底亞的樣子)", name_en: "Paldean Wooper", type: "毒", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "月亮伊布", name_en: "Umbreon", type: "惡", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "壺壺", name_en: "Shuckle", type: "蟲", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "戴魯比", name_en: "Houndour", type: "惡", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "黑魯加", name_en: "Houndoom", type: "惡", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "班基拉斯", name_en: "Tyranitar", type: "惡", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "勾魂眼", name_en: "Sableye", type: "惡", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "骨紋巨聲鱷", name_en: "Skeledirge", type: "幽靈", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "土王", name_en: "Clodsire", type: "毒", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
        ],
        snoozing: [
          { name: "小火龍", name_en: "Charmander", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "火恐龍", name_en: "Charmeleon", type: "火", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "噴火龍", name_en: "Charizard", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 6" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Master 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 6" },
          { name: "地鼠", name_en: "Diglett", type: "地面", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "-" },
          { name: "三地鼠", name_en: "Dugtrio", type: "地面", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "-" },
          { name: "卡蒂狗", name_en: "Growlithe", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "風速狗", name_en: "Arcanine", type: "火", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Great 1", s2: "Great 5", s3: "-", s4: "Ultra 1" },
          { name: "火伊布", name_en: "Flareon", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "火球鼠", name_en: "Cyndaquil", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "火岩鼠", name_en: "Quilava", type: "火", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "火爆獸", name_en: "Typhlosion", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 5", s2: "Master 9", s3: "Master 15", s4: "-" },
          { name: "呆火鱷", name_en: "Fuecoco", type: "火", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "炙燙鱷", name_en: "Crocalor", type: "火", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
        ],
        slumbering: [
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "小拳石", name_en: "Geodude", type: "岩石", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "隆隆石", name_en: "Graveler", type: "岩石", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "隆隆岩", name_en: "Golem", type: "岩石", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "大岩蛇", name_en: "Onix", type: "岩石", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "-" },
          { name: "卡拉卡拉", name_en: "Cubone", type: "地面", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "嘎啦嘎啦", name_en: "Marowak", type: "地面", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "大綱蛇", name_en: "Steelix", type: "鋼", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Great 1" },
          { name: "沙基拉斯", name_en: "Pupitar", type: "岩石", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "水躍魚", name_en: "Mudkip", type: "水", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "沼躍魚", name_en: "Marshtomp", type: "地面", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "巨沼怪", name_en: "Swampert", type: "地面", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "大顎蟻", name_en: "Trapinch", type: "地面", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "超音波幼蟲", name_en: "Vibrava", type: "地面", s1: "Great 4", s2: "Ultra 3", s3: "Master 4", s4: "Ultra 4" },
          { name: "沙漠蜻蜓", name_en: "Flygon", type: "地面", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
        ],
      }
    },
    {
      id: "snowdrop",
      name: "白花雪原",
      name_en: "Snowdrop Tundra",
      image: "https://www.serebii.net/pokemonsleep/locations/snowdroptundra.jpg",
      badgeColor: "#38bdf8",
      unlockGoal: 150,
      unlockGoalText: "登錄 150 種睡姿",
      unlockGoalText_en: "150 Sleep Styles",
      snorlaxMultiplier: "2.0x",
      berriesMode: "fixed",
      favoriteBerries: ["柿仔果","生薑果","芭拉果"],
      favoriteTypes: ["一般","冰","惡"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 78645 },
        { rank: "Ultra 1", energy: 266344 },
        { rank: "Master 1", energy: 557907 },
        { rank: "Master 5", energy: 914159 },
        { rank: "Master 10", energy: 1600296 },
        { rank: "Master 15", energy: 2705329 },
        { rank: "Master 20", energy: 4706403 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "1,840,000"
              },
              {
                      "count": 5,
                      "power": "4,120,000"
              },
              {
                      "count": 6,
                      "power": "9,000,000"
              },
              {
                      "count": 7,
                      "power": "16,640,000"
              },
              {
                      "count": 8,
                      "power": "39,000,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "猴怪", name_en: "Mankey", type: "格鬥", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "火爆猴", name_en: "Primeape", type: "格鬥", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "狃拉", name_en: "Sneasel", type: "惡", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "信使鳥", name_en: "Delibird", type: "飛行", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "過動猿", name_en: "Vigoroth", type: "一般", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "溶食獸", name_en: "Gulpin", type: "毒", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Great 1" },
          { name: "吞食獸", name_en: "Swalot", type: "毒", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "七夕青鳥", name_en: "Altaria", type: "龍", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "阿勃梭魯", name_en: "Absol", type: "惡", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "瑪狃拉", name_en: "Weavile", type: "惡", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
        ],
        snoozing: [
          { name: "小拉達", name_en: "Rattata", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "拉達", name_en: "Raticate", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 6" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 5", s2: "Great 4", s3: "-", s4: "Great 5" },
          { name: "咩利羊", name_en: "Mareep", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "茸茸羊", name_en: "Flaaffy", type: "電", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "電龍", name_en: "Ampharos", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "懶人獺", name_en: "Slakoth", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "請假王", name_en: "Slaking", type: "一般", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "-" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "布土撥", name_en: "Pawmo", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "巴布土撥", name_en: "Pawmot", type: "電", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
        ],
        slumbering: [
          { name: "六尾 (阿羅拉的樣子)", name_en: "Alolan Vulpix", type: "冰", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Great 2" },
          { name: "九尾 (阿羅拉的樣子)", name_en: "Alolan Ninetales", type: "冰", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "青綿鳥", name_en: "Swablu", type: "飛行", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "海豹球", name_en: "Spheal", type: "冰", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "海魔獅", name_en: "Sealeo", type: "冰", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "Ultra 1" },
          { name: "帝牙海獅", name_en: "Walrein", type: "冰", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "利歐路", name_en: "Riolu", type: "格鬥", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "路卡利歐", name_en: "Lucario", type: "格鬥", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "雪笠怪", name_en: "Snover", type: "冰", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "暴雪王", name_en: "Abomasnow", type: "冰", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "-" },
          { name: "冰伊布", name_en: "Glaceon", type: "冰", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "古月鳥", name_en: "Cramorant", type: "飛行", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "走鯨", name_en: "Cetoddle", type: "冰", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Master 1" },
          { name: "浩大鯨", name_en: "Cetitan", type: "冰", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
        ],
      }
    },
    {
      id: "lapis",
      name: "拉碧絲湖畔",
      name_en: "Lapis Lakeside",
      image: "https://www.serebii.net/pokemonsleep/locations/lapislakeside.jpg",
      badgeColor: "#10b981",
      unlockGoal: 240,
      unlockGoalText: "登錄 240 種睡姿",
      unlockGoalText_en: "240 Sleep Styles",
      snorlaxMultiplier: "2.65x",
      berriesMode: "fixed",
      favoriteBerries: ["榴石果","櫻子果","芒念果"],
      favoriteTypes: ["草","格鬥","超能"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 97031 },
        { rank: "Ultra 1", energy: 328610 },
        { rank: "Master 1", energy: 675330 },
        { rank: "Master 5", energy: 1075709 },
        { rank: "Master 10", energy: 1825483 },
        { rank: "Master 15", energy: 2925574 },
        { rank: "Master 20", energy: 5193272 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "2,440,000"
              },
              {
                      "count": 5,
                      "power": "5,460,000"
              },
              {
                      "count": 6,
                      "power": "11,920,000"
              },
              {
                      "count": 7,
                      "power": "22,040,000"
              },
              {
                      "count": 8,
                      "power": "51,670,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "妙蛙種子", name_en: "Bulbasaur", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "妙蛙草", name_en: "Ivysaur", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Ultra 1" },
          { name: "妙蛙花", name_en: "Venusaur", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "喇叭芽", name_en: "Bellsprout", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "口呆花", name_en: "Weepinbell", type: "草", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Great 1" },
          { name: "大食花", name_en: "Victreebel", type: "草", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "迷你龍", name_en: "Dratini", type: "龍", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Ultra 1" },
          { name: "哈克龍", name_en: "Dragonair", type: "龍", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "快龍", name_en: "Dragonite", type: "龍", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "菊草葉", name_en: "Chikorita", type: "草", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "月桂葉", name_en: "Bayleef", type: "草", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "大竺葵", name_en: "Meganium", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "木守宮", name_en: "Treecko", type: "草", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "森林蜥蜴", name_en: "Grovyle", type: "草", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "蜥蜴王", name_en: "Sceptile", type: "草", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "葉伊布", name_en: "Leafeon", type: "草", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "新葉喵", name_en: "Sprigatito", type: "草", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "蒂蕾喵", name_en: "Floragato", type: "草", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "魔幻假面喵", name_en: "Meowscarada", type: "惡", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
        ],
        snoozing: [
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 6" },
          { name: "喵喵", name_en: "Meowth", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "貓老大", name_en: "Persian", type: "一般", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 4", s2: "Great 3", s3: "-", s4: "Great 4" },
          { name: "波克基古", name_en: "Togetic", type: "妖精", s1: "Basic 3", s2: "Great 2", s3: "Ultra 3", s4: "Great 3" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "太陽伊布", name_en: "Espeon", type: "超能力", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "果然翁", name_en: "Wobbuffet", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "火稚雞", name_en: "Torchic", type: "火", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "拉魯拉絲", name_en: "Ralts", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "奇鲁莉安", name_en: "Kirlia", type: "超能力", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "沙奈朵", name_en: "Gardevoir", type: "超能力", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "克雷色利亞", name_en: "Cresselia", type: "超能力", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "食夢夢", name_en: "Munna", type: "超能力", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "-" },
          { name: "夢夢蝕", name_en: "Musharna", type: "超能力", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
        ],
        slumbering: [
          { name: "嘟嘟", name_en: "Doduo", type: "飛行", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "嘟嘟利", name_en: "Dodrio", type: "飛行", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Ultra 1" },
          { name: "波克比", name_en: "Togepi", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "水君", name_en: "Suicune", type: "水", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "-" },
          { name: "力壯雞", name_en: "Combusken", type: "格鬥", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "火焰雞", name_en: "Blaziken", type: "格鬥", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "小果然", name_en: "Wynaut", type: "超能力", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Great 1" },
          { name: "艾路雷朵", name_en: "Gallade", type: "格鬥", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "童偶熊", name_en: "Stufful", type: "格鬥", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "穿著熊", name_en: "Bewear", type: "格鬥", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 6" },
          { name: "潤水鴨", name_en: "Quaxly", type: "水", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Ultra 1" },
          { name: "湧躍鴨", name_en: "Quaxwell", type: "水", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "狂歡浪舞鴨", name_en: "Quaquaval", type: "格鬥", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
        ],
      }
    },
    {
      id: "powerplant",
      name: "黃金舊發電廠",
      name_en: "Old Gold Power Plant",
      image: "https://www.serebii.net/pokemonsleep/locations/oldgoldpowerplant.jpg",
      badgeColor: "#a855f7",
      unlockGoal: 340,
      unlockGoalText: "登錄 340 種睡姿",
      unlockGoalText_en: "340 Sleep Styles",
      snorlaxMultiplier: "3.4x",
      berriesMode: "fixed",
      favoriteBerries: ["異奇果","檬果","靛莓果"],
      favoriteTypes: ["電","幽靈","鋼"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 151061 },
        { rank: "Ultra 1", energy: 511595 },
        { rank: "Master 1", energy: 1038306 },
        { rank: "Master 5", energy: 1582395 },
        { rank: "Master 10", energy: 2476059 },
        { rank: "Master 15", energy: 3744954 },
        { rank: "Master 20", energy: 6674166 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "3,130,000"
              },
              {
                      "count": 5,
                      "power": "7,000,000"
              },
              {
                      "count": 6,
                      "power": "15,300,000"
              },
              {
                      "count": 7,
                      "power": "28,290,000"
              },
              {
                      "count": 8,
                      "power": "66,300,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "綠毛蟲", name_en: "Caterpie", type: "蟲", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "鐵甲蛹", name_en: "Metapod", type: "蟲", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "巴大蝶", name_en: "Butterfree", type: "蟲", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "鬼斯", name_en: "Gastly", type: "幽靈", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "-" },
          { name: "鬼斯通", name_en: "Haunter", type: "幽靈", s1: "Basic 2", s2: "Great 1", s3: "Ultra 2", s4: "-" },
          { name: "耿鬼", name_en: "Gengar", type: "幽靈", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "黑暗鴉", name_en: "Murkrow", type: "惡", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Great 4" },
          { name: "怨影娃娃", name_en: "Shuppet", type: "幽靈", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "-" },
          { name: "詛咒娃娃", name_en: "Banette", type: "幽靈", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
          { name: "飄飄球", name_en: "Drifloon", type: "幽靈", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "-" },
          { name: "隨風球", name_en: "Drifblim", type: "幽靈", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "-" },
          { name: "烏鴉頭頭", name_en: "Honchkrow", type: "惡", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "南瓜精", name_en: "Pumpkaboo", type: "幽靈", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Master 1" },
          { name: "南瓜怪人", name_en: "Gourgeist", type: "幽靈", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "Master 5" },
          { name: "強顎雞母蟲", name_en: "Grubbin", type: "蟲", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "蟲電寶", name_en: "Charjabug", type: "蟲", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "鍬農炮蟲", name_en: "Vikavolt", type: "蟲", s1: "Master 4", s2: "Master 8", s3: "Master 14", s4: "Master 9" },
          { name: "謎擬Q", name_en: "Mimikyu", type: "幽靈", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
        ],
        snoozing: [
          { name: "皮卡丘", name_en: "Pikachu", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "雷丘", name_en: "Raichu", type: "電", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 2", s4: "Ultra 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 6" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 3", s2: "Great 2", s3: "Great 3", s4: "Great 3" },
          { name: "雷伊布", name_en: "Jolteon", type: "電", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "雷公", name_en: "Raikou", type: "電", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "-" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Ultra 3" },
          { name: "小貓怪", name_en: "Shinx", type: "電", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "勒克貓", name_en: "Luxio", type: "電", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "倫琴貓", name_en: "Luxray", type: "電", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "Master 6" },
          { name: "咚咚鼠", name_en: "Dedenne", type: "電", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Ultra 1" },
          { name: "布撥", name_en: "Pawmi", type: "電", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Basic 4" },
          { name: "布土撥", name_en: "Pawmo", type: "電", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "巴布土撥", name_en: "Pawmot", type: "電", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小鍛匠", name_en: "Tinkatink", type: "妖精", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "巧鍛匠", name_en: "Tinkatuff", type: "妖精", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Master 1" },
          { name: "巨鍛匠", name_en: "Tinkaton", type: "妖精", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "-" },
        ],
        slumbering: [
          { name: "小磁怪", name_en: "Magnemite", type: "鋼", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "-" },
          { name: "三合一磁怪", name_en: "Magneton", type: "鋼", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "-" },
          { name: "皮丘", name_en: "Pichu", type: "電", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 5", s4: "Ultra 1" },
          { name: "大綱蛇", name_en: "Steelix", type: "鋼", s1: "Ultra 4", s2: "Master 3", s3: "-", s4: "-" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "可可多拉", name_en: "Aron", type: "鋼", s1: "Basic 1", s2: "Basic 4", s3: "Great 5", s4: "Basic 5" },
          { name: "可多拉", name_en: "Lairon", type: "鋼", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "波士可多拉", name_en: "Aggron", type: "鋼", s1: "Master 3", s2: "Master 7", s3: "Master 13", s4: "Master 8" },
          { name: "自爆磁怪", name_en: "Magnezone", type: "鋼", s1: "Ultra 5", s2: "Master 4", s3: "Master 10", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Ultra 2", s2: "Master 1", s3: "Master 7", s4: "Master 2" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Basic 4" },
        ],
      }
    },
    {
      id: "amber",
      name: "琥褐溪谷",
      name_en: "Amber Canyon",
      image: "https://www.serebii.net/pokemonsleep/locations/ambercanyon.jpg",
      badgeColor: "#d97706",
      unlockGoal: 450,
      unlockGoalText: "登錄 450 種睡姿",
      unlockGoalText_en: "450 Sleep Styles",
      snorlaxMultiplier: "4.2x",
      berriesMode: "fixed",
      favoriteBerries: ["零餘果","木子果","巧可果"],
      favoriteTypes: ["毒","蟲","龍"],
      hasExpertMode: false,
      snorlaxEnergyTiers: [
        { rank: "Basic 1", energy: 0 },
        { rank: "Great 1", energy: 198585 },
        { rank: "Ultra 1", energy: 654607 },
        { rank: "Master 1", energy: 1325740 },
        { rank: "Master 5", energy: 2015408 },
        { rank: "Master 10", energy: 3179971 },
        { rank: "Master 15", energy: 4815792 },
        { rank: "Master 20", energy: 8528976 }
      ],
      drowsyPowerSpawns: [
              {
                      "count": 3,
                      "power": "0+"
              },
              {
                      "count": 4,
                      "power": "3,860,000"
              },
              {
                      "count": 5,
                      "power": "8,650,000"
              },
              {
                      "count": 6,
                      "power": "18,900,000"
              },
              {
                      "count": 7,
                      "power": "34,940,000"
              },
              {
                      "count": 8,
                      "power": "81,900,000"
              }
      ],
      spawns: {
        dozing: [
          { name: "阿柏蛇", name_en: "Ekans", type: "毒", s1: "Basic 1", s2: "Basic 1", s3: "Basic 3", s4: "Great 1" },
          { name: "阿柏怪", name_en: "Arbok", type: "毒", s1: "Basic 1", s2: "Basic 5", s3: "Ultra 1", s4: "Ultra 1" },
          { name: "凱羅斯", name_en: "Pinsir", type: "蟲", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "赫拉克羅斯", name_en: "Heracross", type: "蟲", s1: "Basic 4", s2: "Great 3", s3: "Ultra 4", s4: "Ultra 1" },
          { name: "寶貝龍", name_en: "Bagon", type: "龍", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "甲殼龍", name_en: "Shelgon", type: "龍", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "暴飛龍", name_en: "Salamence", type: "龍", s1: "Master 6", s2: "Master 10", s3: "Master 16", s4: "Master 11" },
          { name: "拉帝亞斯", name_en: "Latias", type: "龍", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "拉帝歐斯", name_en: "Latios", type: "龍", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "花岩怪", name_en: "Spiritomb", type: "惡", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "石居蟹", name_en: "Dwebble", type: "蟲", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "岩殿居蟹", name_en: "Crustle", type: "蟲", s1: "Ultra 3", s2: "Master 2", s3: "Master 8", s4: "Master 3" },
          { name: "嗡蝠", name_en: "Noibat", type: "龍", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "音波龍", name_en: "Noivern", type: "龍", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "老翁龍", name_en: "Drampa", type: "龍", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "顫弦蠑螈 (高調的樣子)", name_en: "Toxtricity Amped Form", type: "毒", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "顫弦蠑螈 (低調的樣子)", name_en: "Toxtricity Low Key Form", type: "毒", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
        ],
        snoozing: [
          { name: "皮皮", name_en: "Clefairy", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "皮可西", name_en: "Clefable", type: "妖精", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Master 1" },
          { name: "六尾", name_en: "Vulpix", type: "火", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "九尾", name_en: "Ninetales", type: "火", s1: "Great 3", s2: "Ultra 2", s3: "Master 3", s4: "Master 1" },
          { name: "吉利蛋", name_en: "Chansey", type: "一般", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "百變怪", name_en: "Ditto", type: "一般", s1: "Basic 2", s2: "Great 1", s3: "-", s4: "Master 1" },
          { name: "伊布", name_en: "Eevee", type: "一般", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "天然雀", name_en: "Natu", type: "超能力", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "天然鳥", name_en: "Xatu", type: "超能力", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "幸福蛋", name_en: "Blissey", type: "一般", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "Master 4" },
          { name: "炎帝", name_en: "Entei", type: "火", s1: "Master 1", s2: "Master 5", s3: "Master 11", s4: "-" },
          { name: "正電拍拍", name_en: "Plusle", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
          { name: "負電拍拍", name_en: "Minun", type: "電", s1: "Great 2", s2: "Ultra 1", s3: "Master 2", s4: "Ultra 2" },
        ],
        slumbering: [
          { name: "穿山鼠", name_en: "Sandshrew", type: "地面", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "穿山王", name_en: "Sandslash", type: "地面", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Master 1" },
          { name: "皮寶寶", name_en: "Cleffa", type: "妖精", s1: "Basic 1", s2: "Basic 1", s3: "Basic 4", s4: "Great 1" },
          { name: "幼基拉斯", name_en: "Larvitar", type: "岩石", s1: "Basic 1", s2: "Basic 1", s3: "Great 1", s4: "Great 1" },
          { name: "大嘴娃", name_en: "Mawile", type: "鋼", s1: "Great 5", s2: "Ultra 4", s3: "Master 5", s4: "Ultra 5" },
          { name: "大顎蟻", name_en: "Trapinch", type: "地面", s1: "Basic 1", s2: "Basic 3", s3: "Great 4", s4: "Great 1" },
          { name: "超音波幼蟲", name_en: "Vibrava", type: "地面", s1: "Basic 5", s2: "Great 4", s3: "Ultra 5", s4: "Great 5" },
          { name: "沙漠蜻蜓", name_en: "Flygon", type: "地面", s1: "Master 2", s2: "Master 6", s3: "Master 12", s4: "Master 7" },
          { name: "小福蛋", name_en: "Happiny", type: "一般", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "毛頭小鷹", name_en: "Rufflet", type: "飛行", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
          { name: "勇士雄鷹", name_en: "Braviary", type: "飛行", s1: "Great 1", s2: "Great 5", s3: "Master 1", s4: "Ultra 1" },
          { name: "寶寶暴龍", name_en: "Tyrunt", type: "岩石", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Ultra 1" },
          { name: "怪顎龍", name_en: "Tyrantrum", type: "岩石", s1: "Ultra 4", s2: "Master 3", s3: "Master 9", s4: "-" },
          { name: "托戈德瑪爾", name_en: "Togedemaru", type: "鋼", s1: "Ultra 1", s2: "Ultra 5", s3: "Master 6", s4: "Master 1" },
          { name: "毒電嬰", name_en: "Toxel", type: "毒", s1: "Basic 1", s2: "Basic 2", s3: "Great 3", s4: "Great 1" },
        ],
      }
    }
  ];

  let currentIslandId = 'greengrass';
  let isExpertModeActive = false;
  let currentIslandSleepType = 'all';

  function selectIsland(islandId, isExpert = false) {
    if (!islandId) return;
    currentIslandId = islandId;
    isExpertModeActive = !!isExpert;
    refreshIslandsSubpanel();
  }

  function toggleIslandExpertMode() {
    const island = ISLANDS_DATA.find(i => i.id === currentIslandId);
    if (!island || !island.hasExpertMode) {
      currentIslandId = 'greengrass';
      isExpertModeActive = true;
      refreshIslandsSubpanel();
      return;
    }
    isExpertModeActive = !isExpertModeActive;
    refreshIslandsSubpanel();
  }

  const POKEMON_SPRITE_FALLBACK = {
    "妙蛙種子": "001",
    "妙蛙草": "002",
    "妙蛙花": "003",
    "綠毛蟲": "010",
    "鐵甲蛹": "011",
    "巴大蝶": "012",
    "阿柏蛇": "023",
    "阿柏怪": "024",
    "可達鴨": "054",
    "猴怪": "056",
    "火爆猴": "057",
    "喇叭芽": "069",
    "口呆花": "070",
    "大食花": "071",
    "鬼斯": "092",
    "鬼斯通": "093",
    "凱羅斯": "127",
    "菊草葉": "152",
    "月桂葉": "153",
    "大竺葵": "154",
    "烏波 (帕底亞的樣子)": "194-paldeanwooper",
    "月亮伊布": "197",
    "黑暗鴉": "198",
    "壺壺": "213",
    "赫拉克羅斯": "214",
    "狃拉": "215",
    "信使鳥": "225",
    "戴魯比": "228",
    "木守宮": "252",
    "森林蜥蜴": "253",
    "蜥蜴王": "254",
    "過動猿": "288",
    "溶食獸": "316",
    "吞食獸": "317",
    "怨影娃娃": "353",
    "詛咒娃娃": "354",
    "阿勃梭魯": "359",
    "拉帝亞斯": "380",
    "拉帝歐斯": "381",
    "飄飄球": "425",
    "烏鴉頭頭": "430",
    "花岩怪": "442",
    "不良蛙": "453",
    "毒骷蛙": "454",
    "瑪狃拉": "461",
    "葉伊布": "470",
    "南瓜精": "710",
    "南瓜怪人": "711",
    "嗡蝠": "714",
    "音波龍": "715",
    "謎擬Q": "778",
    "老翁龍": "780",
    "顫弦蠑螈 (高調的樣子)": "849",
    "顫弦蠑螈 (低調的樣子)": "849-toxtricitylowkeyform",
    "新葉喵": "906",
    "蒂蕾喵": "907",
    "魔幻假面喵": "908",
    "土王": "980",
    "小火龍": "004",
    "火恐龍": "005",
    "噴火龍": "006",
    "小拉達": "019",
    "拉達": "020",
    "皮卡丘": "025",
    "雷丘": "026",
    "皮皮": "035",
    "皮可西": "036",
    "六尾": "037",
    "九尾": "038",
    "胖丁": "039",
    "胖可丁": "040",
    "地鼠": "050",
    "三地鼠": "051",
    "喵喵": "052",
    "貓老大": "053",
    "卡蒂狗": "058",
    "呆呆獸": "079",
    "呆殼獸": "080",
    "吉利蛋": "113",
    "袋獸": "115",
    "百變怪": "132",
    "伊布": "133",
    "雷伊布": "135",
    "火伊布": "136",
    "火球鼠": "155",
    "火岩鼠": "156",
    "火爆獸": "157",
    "波克基古": "176",
    "天然雀": "177",
    "天然鳥": "178",
    "咩利羊": "179",
    "茸茸羊": "180",
    "太陽伊布": "196",
    "果然翁": "202",
    "幸福蛋": "242",
    "雷公": "243",
    "炎帝": "244",
    "火稚雞": "255",
    "懶人獺": "287",
    "請假王": "289",
    "正電拍拍": "311",
    "負電拍拍": "312",
    "波克基斯": "468",
    "克雷色利亞": "488",
    "食夢夢": "517",
    "夢夢蝕": "518",
    "仙子伊布": "700",
    "咚咚鼠": "702",
    "萌虻": "742",
    "蝶結萌虻": "743",
    "花療環環": "764",
    "呆火鱷": "909",
    "布撥": "921",
    "小鍛匠": "957",
    "巧鍛匠": "958",
    "巨鍛匠": "959",
    "超夢": "150",
    "傑尼龜": "007",
    "卡咪龜": "008",
    "水箭龜": "009",
    "穿山鼠": "027",
    "穿山王": "028",
    "小拳石": "074",
    "隆隆石": "075",
    "小磁怪": "081",
    "三合一磁怪": "082",
    "嘟嘟": "084",
    "嘟嘟利": "085",
    "卡拉卡拉": "104",
    "嘎啦嘎啦": "105",
    "水伊布": "134",
    "小鋸鱷": "158",
    "藍鱷": "159",
    "大力鱷": "160",
    "皮丘": "172",
    "皮寶寶": "173",
    "寶寶丁": "174",
    "波克比": "175",
    "樹才怪": "185",
    "烏波": "194",
    "沼王": "195",
    "水君": "245",
    "幼基拉斯": "246",
    "力壯雞": "256",
    "火焰雞": "257",
    "水躍魚": "258",
    "沼躍魚": "259",
    "巨沼怪": "260",
    "大嘴娃": "303",
    "青綿鳥": "333",
    "小果然": "360",
    "海豹球": "363",
    "盆才怪": "438",
    "小福蛋": "440",
    "利歐路": "447",
    "自爆磁怪": "462",
    "冰伊布": "471",
    "毛頭小鷹": "627",
    "勇士雄鷹": "628",
    "寶寶暴龍": "696",
    "怪顎龍": "697",
    "托戈德瑪爾": "777",
    "古月鳥": "845",
    "毒電嬰": "848",
    "潤水鴨": "912",
    "走鯨": "974",
    "骨紋巨聲鱷": "911",
    "魔牆人偶": "122",
    "呆呆王": "199",
    "炙燙鱷": "910",
    "哥達鴨": "055",
    "魔尼尼": "439",
    "耿鬼": "094",
    "黑魯加": "229",
    "班基拉斯": "248",
    "勾魂眼": "302",
    "風速狗": "059",
    "隆隆岩": "076",
    "大岩蛇": "095",
    "大綱蛇": "208",
    "沙基拉斯": "247",
    "大顎蟻": "328",
    "超音波幼蟲": "329",
    "沙漠蜻蜓": "330",
    "七夕青鳥": "334",
    "電龍": "181",
    "布土撥": "922",
    "巴布土撥": "923",
    "六尾 (阿羅拉的樣子)": "037-alolanvulpix",
    "九尾 (阿羅拉的樣子)": "038-alolanninetales",
    "海魔獅": "364",
    "帝牙海獅": "365",
    "路卡利歐": "448",
    "雪笠怪": "459",
    "暴雪王": "460",
    "浩大鯨": "975",
    "迷你龍": "147",
    "哈克龍": "148",
    "快龍": "149",
    "拉魯拉絲": "280",
    "奇鲁莉安": "281",
    "沙奈朵": "282",
    "艾路雷朵": "475",
    "童偶熊": "759",
    "穿著熊": "760",
    "湧躍鴨": "913",
    "狂歡浪舞鴨": "914",
    "隨風球": "426",
    "強顎雞母蟲": "736",
    "蟲電寶": "737",
    "鍬農炮蟲": "738",
    "小貓怪": "403",
    "勒克貓": "404",
    "倫琴貓": "405",
    "可可多拉": "304",
    "可多拉": "305",
    "波士可多拉": "306",
    "寶貝龍": "371",
    "甲殼龍": "372",
    "暴飛龍": "373",
    "石居蟹": "557",
    "岩殿居蟹": "558"
  };

  function getPokemonAvatarUrl(name, name_en) {
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons)) {
      const p = window.allPokemons.find(x => x.name_cn === name || x.name === name || x.name_en === name_en);
      if (p) {
        if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
        if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;
        if (p.formatted_no) return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
      }
    }
    const dex = POKEMON_SPRITE_FALLBACK[name] || POKEMON_SPRITE_FALLBACK[name_en];
    if (dex) {
      return `https://www.serebii.net/pokemonsleep/pokemon/icon/${dex}.png`;
    }
    return '';
  }

  function filterIslandSleepType(sleepType) {
    if (!['all', 'dozing', 'snoozing', 'slumbering'].includes(sleepType)) return;
    currentIslandSleepType = sleepType;
    refreshIslandsSubpanel();
  }

  function refreshIslandsSubpanel() {
    const panel = document.getElementById('wiki-subpanel-islands');
    if (panel) {
      panel.innerHTML = renderIslandsSubpanel();
    }
  }

  function renderIslandsSubpanel() {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const island = ISLANDS_DATA.find(i => i.id === currentIslandId) || ISLANDS_DATA[0];
    const isExpert = island.hasExpertMode && isExpertModeActive;

    const normalNavHtml = ISLANDS_DATA.map(isl => {
      const isActive = !isExpert && isl.id === currentIslandId;
      const islName = isEN ? isl.name_en : isl.name;
      return `
        <button type="button" class="island-tab-btn ${isActive ? 'active' : ''}" onclick="window.WikiDB.selectIsland('${isl.id}', false)" title="${islName}" aria-label="${islName}">
          <img src="${isl.image}" class="island-tab-thumb" alt="${islName}" loading="lazy">
          <span class="island-tab-indicator"></span>
        </button>
      `;
    }).join('');

    const exIslands = ISLANDS_DATA.filter(isl => isl.hasExpertMode);
    const exNavHtml = exIslands.map(isl => {
      const isActive = isExpert && isl.id === currentIslandId;
      const baseName = isEN ? isl.name_en : isl.name;
      const islName = baseName + ' EX';
      return `
        <button type="button" class="island-tab-btn island-tab-ex-item ${isActive ? 'active' : ''}" onclick="window.WikiDB.selectIsland('${isl.id}', true)" title="${islName}" aria-label="${islName}">
          <div class="island-tab-thumb-wrapper">
            <img src="${isl.image}" class="island-tab-thumb" alt="${islName}" loading="lazy">
            <span class="island-tab-ex-tag">EX</span>
          </div>
          <span class="island-tab-indicator"></span>
        </button>
      `;
    }).join('');

    let berriesHtml = '';
    if (island.berriesMode === 'random') {
      berriesHtml = `
        <div class="island-berries-section">
          <span class="island-berries-label">${isEN ? 'Favored Berries:' : '卡比獸喜好樹果:'}</span>
          <span class="island-berries-random-desc">${isEN ? island.berriesDesc_en : island.berriesDesc}</span>
        </div>
      `;
    } else {
      const berryChips = island.favoriteBerries.map(bName => {
        const bInfo = BERRY_VALUES_DATA.find(b => b.name === bName);
        const displayName = isEN ? (window.I18N && window.I18N.t(bName) || bName) : bName;
        const iconSrc = bInfo ? bInfo.icon : '';
        const rawType = bInfo ? bInfo.type : '';
        const typeLabel = isEN ? (window.I18N && window.I18N.getTypeName ? window.I18N.getTypeName(rawType) : rawType) : rawType;
        return `
          <div class="island-berry-chip island-berry-icon-only" title="${displayName} (${typeLabel})">
            ${iconSrc ? `<img src="${iconSrc}" class="island-berry-icon" alt="${displayName}" loading="lazy">` : ''}
          </div>
        `;
      }).join('');
      berriesHtml = `
        <div class="island-berries-section">
          <span class="island-berries-label">${isEN ? 'Favored Berries:' : '卡比獸喜好樹果:'}</span>
          <div class="island-berries-list">${berryChips}</div>
        </div>
      `;
    }

    let expertCardHtml = '';
    if (island.hasExpertMode && isExpert) {
      const exp = island.expertMode;
      expertCardHtml = `
        <div class="wiki-card island-ex-card">
          <div class="island-ex-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="island-ex-badge">EX EXPERT MODE</span>
              <h4 style="margin:0; font-size:15px; color:#facc15; font-weight:700;">${isEN ? exp.name_en : exp.name}</h4>
            </div>
          </div>
          <div class="island-ex-rules-grid">
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Unlock Requirement:' : '開放條件:'}</div>
              <div class="island-ex-rule-desc">${isEN ? exp.unlockReq_en : exp.unlockReq}</div>
            </div>
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Admission Ticket:' : '入場門票:'}</div>
              <div class="island-ex-rule-desc">${isEN ? exp.ticketReq_en : exp.ticketReq}</div>
            </div>
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Berry Rule:' : '樹果規則:'}</div>
              <div class="island-ex-rule-desc">${isEN ? exp.berryRule_en : exp.berryRule}</div>
            </div>
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Primary Berry Bonus:' : '主樹果加成:'}</div>
              <div class="island-ex-rule-desc text-success">${isEN ? exp.bonus_en : exp.bonus}</div>
            </div>
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Non-Favored Berry Penalty:' : '非指定樹果懲罰:'}</div>
              <div class="island-ex-rule-desc text-danger">${isEN ? exp.penalty_en : exp.penalty}</div>
            </div>
            <div class="island-ex-rule-item">
              <div class="island-ex-rule-title">${isEN ? 'Area Bonus & Rewards:' : '營地加成與報酬:'}</div>
              <div class="island-ex-rule-desc text-accent">${isEN ? exp.rewards_en : exp.rewards}</div>
            </div>
          </div>
        </div>
      `;
    }

    function formatSnorlaxRankBadge(rankStr) {
      if (!rankStr || rankStr === '-') {
        return `<span class="rank-badge rank-dash" title="${isEN ? 'Unavailable' : '未出現'}">-</span>`;
      }
      const parts = rankStr.trim().split(/\s+/);
      const tier = (parts[0] || '').toLowerCase();
      const num = parts[1] || '';
      const tierTitle = isEN ? rankStr : (
        tier === 'basic' ? `普通 (Basic) ${num}` :
        tier === 'great' ? `超級 (Great) ${num}` :
        tier === 'ultra' ? `高級 (Ultra) ${num}` :
        tier === 'master' ? `大師 (Master) ${num}` : rankStr
      );

      let ballSvg = '';
      if (tier === 'basic') {
        ballSvg = `<svg class="pokeball-svg ball-basic" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#334155" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#ef4444"/><line x1="1" y1="8" x2="15" y2="8" stroke="#334155" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#334155" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#334155"/></svg>`;
      } else if (tier === 'great') {
        ballSvg = `<svg class="pokeball-svg ball-great" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#2563eb"/><path d="M 2.6,5.2 A 7,7 0 0,1 5.2,2.6 L 5.8,5.8 Z" fill="#ef4444"/><path d="M 13.4,5.2 A 7,7 0 0,0 10.8,2.6 L 10.2,5.8 Z" fill="#ef4444"/><line x1="1" y1="8" x2="15" y2="8" stroke="#1e3a8a" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#1e3a8a" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#1e3a8a"/></svg>`;
      } else if (tier === 'ultra') {
        ballSvg = `<svg class="pokeball-svg ball-ultra" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#1e293b"/><path d="M 3.2,7.5 L 4.4,2.2 L 5.8,2.4 L 4.8,7.5 Z" fill="#facc15"/><path d="M 12.8,7.5 L 11.6,2.2 L 10.2,2.4 L 11.2,7.5 Z" fill="#facc15"/><line x1="1" y1="8" x2="15" y2="8" stroke="#0f172a" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#0f172a" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#0f172a"/></svg>`;
      } else if (tier === 'master') {
        ballSvg = `<svg class="pokeball-svg ball-master" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="#ffffff" stroke="#4c1d95" stroke-width="1.2"/><path d="M 1,8 A 7,7 0 0,1 15,8 Z" fill="#7e22ce"/><circle cx="4.5" cy="4.5" r="1.6" fill="#ec4899"/><circle cx="11.5" cy="4.5" r="1.6" fill="#ec4899"/><path d="M 6.8,3.2 L 7.2,4.8 L 8,4 L 8.8,4.8 L 9.2,3.2" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="8" x2="15" y2="8" stroke="#4c1d95" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#ffffff" stroke="#4c1d95" stroke-width="1.2"/><circle cx="8" cy="8" r="0.8" fill="#4c1d95"/></svg>`;
      } else {
        return `<span class="rank-badge">${rankStr}</span>`;
      }

      return `
        <span class="rank-badge rank-${tier}" title="${tierTitle}">
          ${ballSvg}
          <span class="rank-num">${num}</span>
        </span>
      `;
    }

    const activeEnergyTiers = (isExpert && island.expertMode && island.expertMode.snorlaxEnergyTiers)
      ? island.expertMode.snorlaxEnergyTiers
      : island.snorlaxEnergyTiers;

    const energyRows = activeEnergyTiers.map(t => `
      <tr>
        <td class="font-bold" style="vertical-align:middle;">${formatSnorlaxRankBadge(t.rank)}</td>
        <td class="font-bold text-accent" style="vertical-align:middle;">${t.energy.toLocaleString()}</td>
      </tr>
    `).join('');

    const drowsyRows = island.drowsyPowerSpawns.map(d => `
      <tr>
        <td class="font-bold text-success" style="vertical-align:middle;">${d.count} ${isEN ? 'Pokemon' : '隻'}</td>
        <td class="font-bold" style="vertical-align:middle;">${d.power}</td>
      </tr>
    `).join('');

    let spawnList = [];
    if (currentIslandSleepType === 'all') {
      spawnList = [...island.spawns.dozing, ...island.spawns.snoozing, ...island.spawns.slumbering];
    } else {
      spawnList = island.spawns[currentIslandSleepType] || [];
    }

    const spawnsRows = spawnList.map(p => {
      const pName = isEN ? p.name_en : p.name;
      const pkmAvatar = getPokemonAvatarUrl(p.name, p.name_en);
      const pkmDex = POKEMON_SPRITE_FALLBACK[p.name] || '001';
      return `
        <tr>
          <td style="vertical-align:middle; text-align:center; padding:3px 4px;">
            <div class="island-pkm-item island-pkm-icon-only" title="${pName}">
              <img src="${pkmAvatar}" class="island-pkm-avatar" alt="${pName}" title="${pName}" loading="lazy" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://www.serebii.net/pokedex-sv/icon/${pkmDex}.png';}">
            </div>
          </td>
          <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${formatSnorlaxRankBadge(p.s1)}</td>
          <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${formatSnorlaxRankBadge(p.s2)}</td>
          <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${formatSnorlaxRankBadge(p.s3)}</td>
          <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${formatSnorlaxRankBadge(p.s4)}</td>
        </tr>
      `;
    }).join('');

    const totalCount = (island.spawns.dozing ? island.spawns.dozing.length : 0) +
      (island.spawns.snoozing ? island.spawns.snoozing.length : 0) +
      (island.spawns.slumbering ? island.spawns.slumbering.length : 0);
    const dozingCount = island.spawns.dozing ? island.spawns.dozing.length : 0;
    const snoozingCount = island.spawns.snoozing ? island.spawns.snoozing.length : 0;
    const slumberingCount = island.spawns.slumbering ? island.spawns.slumbering.length : 0;

    return `
      <div class="island-nav-strip">
        ${normalNavHtml}
        <div class="island-nav-divider" title="${isEN ? 'EX Expert Mode' : 'EX 專家模式'}"></div>
        ${exNavHtml}
      </div>

      <div class="wiki-card island-overview-card">
        <div class="island-hero-banner" style="background-image: linear-gradient(to bottom, rgba(13,21,39,0.35), rgba(13,21,39,0.92)), url('${island.image}');">
          <div class="island-hero-content">
            <div class="island-title-group">
              <h3 class="island-hero-title">${isEN ? (isExpert ? island.name_en + ' EX' : island.name_en) : (isExpert ? island.name + ' EX' : island.name)}</h3>
              <span class="island-title-en">${isEN ? (isExpert ? island.name + ' EX' : island.name) : (isExpert ? island.name_en + ' EX' : island.name_en)}</span>
            </div>
          </div>
        </div>
        ${berriesHtml}
      </div>

      ${expertCardHtml}

      <div class="wiki-two-col-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:16px; margin-bottom:16px;">
        <div class="wiki-card">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${isEN ? 'Snorlax Rank Energy Progression' : '卡比獸評級所需能量'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top:8px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="width:45%;">${isEN ? 'Rank' : '卡比獸評級'}</th>
                  <th style="width:55%;">${isEN ? 'Required Energy' : '所需能量 (累計)'}</th>
                </tr>
              </thead>
              <tbody>
                ${energyRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="wiki-card">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${isEN ? 'Drowsy Power Spawn Tiers' : '睡意之力與出現隻數門檻'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top:8px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="width:45%;">${isEN ? 'Morning Spawns' : '早晨出現隻數'}</th>
                  <th style="width:55%;">${isEN ? 'Min Drowsy Power' : '最低睡意之力門檻'}</th>
                </tr>
              </thead>
              <tbody>
                ${drowsyRows}
                <tr>
                  <td class="font-bold text-accent" style="vertical-align:middle;">+1 (9 ${isEN ? 'Pokemon' : '隻'})</td>
                  <td class="text-secondary" style="vertical-align:middle;">${isEN ? 'Good Camp Ticket guarantee' : '使用好露營券 (必出1隻貪吃)'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="wiki-card" style="margin-bottom:16px;">
        <div class="wiki-card-header" style="flex-wrap:wrap; gap:12px; justify-content:space-between; align-items:center;">
          <h3 class="wiki-card-title">${isEN ? 'Pokemon Sleep Types & Posture Unlock Tiers' : '棲息寶可夢與各星級睡姿解鎖門檻'}</h3>
          <div class="island-sleep-filters">
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'all' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('all')">
              ${isEN ? 'All' : '全部'} <span class="island-sleep-count">${totalCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'dozing' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('dozing')">
              ${isEN ? 'Dozing' : '淺淺入夢'} <span class="island-sleep-count">${dozingCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'snoozing' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('snoozing')">
              ${isEN ? 'Snoozing' : '安然入睡'} <span class="island-sleep-count">${snoozingCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'slumbering' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('slumbering')">
              ${isEN ? 'Slumbering' : '深深入眠'} <span class="island-sleep-count">${slumberingCount}</span>
            </button>
          </div>
        </div>
        <div class="wiki-table-wrapper" style="margin-top:8px;">
          <table class="wiki-data-table island-spawns-compact-table">
            <thead>
              <tr>
                <th style="width:56px; text-align:center;">${isEN ? 'Pokemon' : '寶可夢'}</th>
                <th style="text-align:center;">1*</th>
                <th style="text-align:center;">2*</th>
                <th style="text-align:center;">3*</th>
                <th style="text-align:center;">4*</th>
              </tr>
            </thead>
            <tbody>
              ${spawnsRows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- 初始化 Wiki 模組 ---
  function initWikiModule() {
    loadPersistedBerrySettings();
    currentWikiSubTab = getSavedWikiSubTab();
    const wikiContainer = document.getElementById('panel-wiki');
    if (!wikiContainer) return;

    try {
      renderWikiLayout(wikiContainer);
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
      const ladderFab = document.getElementById('ladder-sidebar-bookmark-handle-fab') || document.getElementById('ladder-sidebar-bookmark-handle');
      if (ladderFab && typeof window.makeFloatingDraggable === 'function' && isMobileH5 && !ladderFab._hasDraggable) {
        ladderFab._hasDraggable = true;
        window.makeFloatingDraggable(ladderFab, () => openLadderSidebar());
      }
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

    try { switchWikiSubTab(currentWikiSubTab); } catch (e) {}
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

  // 獲取副技能遊戲品階顏色 (Gold / Blue / White)
  function getSubSkillBadgeColor(rawName) {
    if (!rawName) return 'white';
    const name = rawName.replace(/\s+/g, '');
    if (name.includes('樹果數量') || name.includes('幫手獎勵') || name.includes('技能等級提升M') || 
        name.includes('睡眠EXP') || name.includes('睡眠EXP獎勵') || name.includes('活力恢復') || 
        name.includes('研究EXP') || name.includes('夢之碎片') ||
        name.toLowerCase().includes('berryfinding') || name.toLowerCase().includes('helpingbonus') ||
        name.toLowerCase().includes('skilllevelupm') || name.toLowerCase().includes('sleepexp') ||
        name.toLowerCase().includes('energyrecovery') || name.toLowerCase().includes('researchexp') ||
        name.toLowerCase().includes('dreamshard')) {
      return 'gold';
    }
    if (name.endsWith('M') || name.endsWith('L') || name.includes('M/L') || name.includes('技能等級提升S') ||
        name.toLowerCase().includes('finderm') || name.toLowerCase().includes('speedm') || 
        name.toLowerCase().includes('triggerm') || name.toLowerCase().includes('inventoryupm') ||
        name.toLowerCase().includes('inventoryupl') || name.toLowerCase().includes('inventoryupm/l') ||
        name.toLowerCase().includes('skilllevelups') || name.includes('持有上限') || name.toLowerCase().includes('inventory')) {
      return 'blue';
    }
    return 'white';
  }

  // 渲染副技能徽章 (支援複合格式 如 "樹果數量S + 持有上限")
  function renderRatingSubskillBadge(rawName, rawNameEn, isEN) {
    if (!rawName) return '';
    const text = isEN ? (rawNameEn || (window.I18N ? window.I18N.getSubSkillName(rawName) : rawName)) : rawName;
    if (text.includes('+')) {
      const parts = text.split('+').map(p => p.trim());
      return parts.map(part => {
        const color = getSubSkillBadgeColor(part);
        return `<span class="wiki-skill-badge skill-badge-${color}">${part}</span>`;
      }).join(' <span class="text-secondary font-bold" style="font-size: 11px;">+</span> ');
    }
    const color = getSubSkillBadgeColor(text);
    return `<span class="wiki-skill-badge skill-badge-${color}">${text}</span>`;
  }

  // 渲染性格推薦標籤 (高亮 ▲ 與 ▼ 符號)
  function renderRatingNatureBadge(natureName) {
    if (!natureName) return '';
    let html = natureName;
    html = html.replace(/▲/g, '<span class="matrix-rate-up font-bold" style="font-size: 13px; margin: 0 1px;">▲</span>');
    html = html.replace(/▼/g, '<span class="matrix-rate-down font-bold" style="font-size: 13px; margin: 0 1px;">▼</span>');
    return `<span class="rating-nature-title font-bold text-white">${html}</span>`;
  }

  // 培育指南詳細說明文字色彩強化
  function formatRatingDetail(detail) {
    if (!detail) return '';
    let res = detail;
    // 正向加成數值 (如 +36%, +18%, +1, +2)
    res = res.replace(/(\+\d+(?:\.\d+)?%?)/g, '<span class="text-success font-bold">$1</span>');
    // 時間縮短/減項 (如 -14%, -7%, -5%)
    res = res.replace(/(-\d+(?:\.\d+)?%)/g, '<span class="text-accent font-bold">$1</span>');
    // 關鍵專有名詞加亮
    res = res.replace(/(翻倍|畢業核心|靈魂性格|金種子|銀種子)/g, '<span class="text-warning font-bold">$1</span>');
    res = res.replace(/(doubles|graduation core|essential graduation core|Prime nature|Sub Skill Seed|Main Skill Seed)/g, '<span class="text-warning font-bold">$1</span>');
    // 箭頭高亮
    res = res.replace(/▲/g, '<span class="matrix-rate-up font-bold">▲</span>');
    res = res.replace(/▼/g, '<span class="matrix-rate-down font-bold">▼</span>');
    return res;
  }

  // 渲染專長評級卡片
  function renderRatingCard(data) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const badgeText = isEN ? (data.badge_en || data.badge || data.title_en || data.title) : (data.badge || data.title);
    const specText = isEN ? (data.spec_en || data.spec || '') : (data.spec || '');
    const desc = isEN ? (data.desc_en || data.desc) : data.desc;
    const type = data.type || 'berry';
    const themeColor = type === 'berry' ? '#f59e0b' : (type === 'ingredient' ? '#06b6d4' : '#a855f7');

    return `
      <div class="wiki-card wiki-rating-card rating-card-${type}">
        <div class="wiki-card-header">
          <h3 class="wiki-card-title rating-card-header-title" style="margin: 0;">
            <span class="rating-specialty-badge specialty-${type}">${badgeText}</span>
            <span class="rating-specialty-desc">${specText}</span>
          </h3>
        </div>
        <p class="wiki-card-desc" style="margin-top: 6px;">${desc}</p>
        
        <div class="rating-subsections">
          <div class="rating-col">
            <h4 class="rating-col-title" style="color: ${themeColor};">${isEN ? 'Sub-Skill Priority' : '副技能推薦梯度'}</h4>
            <div class="rating-list">
              ${data.subskills.map(s => {
                const sDetail = isEN ? (s.detail_en || s.detail) : s.detail;
                return `
                <div class="rating-item">
                  <span class="rating-item-badge">${renderRatingSubskillBadge(s.name, s.name_en, isEN)}</span><span class="rating-item-colon">:</span><span class="rating-item-detail text-secondary">${formatRatingDetail(sDetail)}</span>
                </div>
              `;}).join('')}
            </div>
          </div>

          <div class="rating-col">
            <h4 class="rating-col-title" style="color: ${themeColor};">${isEN ? 'Nature Priority' : '性格推薦梯度'}</h4>
            <div class="rating-list">
              ${data.natures.map(n => {
                const nName = isEN ? (n.name_en || (window.I18N ? window.I18N.getNatureName(n.name) : n.name)) : n.name;
                const nDetail = isEN ? (n.detail_en || n.detail) : n.detail;
                return `
                <div class="rating-item">
                  <span class="rating-item-badge">${renderRatingNatureBadge(nName)}</span><span class="rating-item-colon">:</span><span class="rating-item-detail text-secondary">${formatRatingDetail(nDetail)}</span>
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

  const DEFAULT_LADDER_MIN_THRESHOLDS = {
    coffee: 20,
    apple: 20,
    ginger: 20,
    milk: 20,
    honey: 20,
    sausage: 20,
    potato: 20,
    tomato: 20,
    corn: 20,
    egg: 20,
    soybeans: 20,
    oil: 20,
    leek: 20,
    mushroom: 20,
    cacao: 20,
    herb: 20,
    glossyavocado: 20,
    pumpkin: 20,
    tail: 1
  };

  // 渲染橫向視覺座標天梯圖 (支援多型態並列節點、同組跨度連接線、大菜供應能力評定、動態自適應最大刻度、美味尾巴獨立分離)
  function renderCoordinateLadder(ladderData) {
    const mult = getLadderMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    
    // 分離 18 種常規食材與 1 種獨立美味尾巴
    const mainTracks = ladderData.filter(ing => ing.id !== 'tail');
    const tailIng = ladderData.find(ing => ing.id === 'tail');

    const isUnfilteredDefault = (ladderSpecialtyFilter === 'ALL' && ladderRecipeFilter === 'ALL' && ladderSupplyFilter === 'ALL' && !ladderSearchQuery);

    // 1. 預先過濾各常規食材軌道之寶可夢與變體，並計算目前篩選下的全局最高產量
    let globalMaxCount = 20;
    const processedMainTracks = mainTracks.map(ing => {
      const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { name: isEN ? 'High Tier Dish' : '高階料理', name_en: 'High Tier Dish', need: 20, type: isEN ? 'Dish' : '料理', secondary: '' };
      const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
      const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;
      const minDefaultThreshold = isUnfilteredDefault ? 30 : (DEFAULT_LADDER_MIN_THRESHOLDS[ing.id] || 20);

      // 取得該軌道符合篩選之寶可夢與型態變體
      const filteredPokemonList = ing.pokemon.map((p, pIdx) => {
        const pkmSpec = getPokemonLadderSpecialty(p.name);
        if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return null;
        if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return null;
        if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return null;

        // 搜尋關鍵字過濾
        if (ladderSearchQuery) {
          if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return null;
        }

        let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];

        // 全部展示狀態下僅展示產量 >= 30 的主力型態變體；有具體篩選條件時則完整展示 (< 30 也展示)
        variants = variants.filter(v => Math.round(v.count * mult) >= minDefaultThreshold);

        variants = variants.filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

        if (ladderSupplyFilter === 'TOP') {
          // 前五名：保留該軌道排名前 5 (Top 1 ~ Top 5) 的寶可夢梯隊，且只展示其最高產量變體
          const allMaxCounts = ing.pokemon.map(pkm => Math.max(...(pkm.variants || [{count: pkm.count}]).map(v => v.count)));
          const distinctCounts = [...new Set(allMaxCounts)].sort((a,b) => b - a);
          const top5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
          const pkmMaxCount = Math.max(...(p.variants || [{count: p.count}]).map(v => v.count));
          if (pkmMaxCount < top5Threshold) return null;
          variants = variants.slice(0, 1);
        } else if (ladderSupplyFilter === 'MEALS_3') {
          // 滿載 3 餐：日產量 >= 核心大菜 3 餐所需總量
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult);
            return scaled >= dishInfo.need * 3;
          });
        } else if (ladderSupplyFilter === 'MEALS_2') {
          // 充足 2 餐：日產量 >= 核心大菜 2 餐所需總量
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult);
            return scaled >= dishInfo.need * 2;
          });
        }

        if (variants.length === 0) return null;

        variants.forEach(v => {
          const scaled = Math.round(v.count * mult);
          if (scaled > globalMaxCount) globalMaxCount = scaled;
        });

        return { ...p, variants };
      }).filter(Boolean);

      return {
        ing,
        dishInfo,
        dishName,
        ingName,
        filteredPokemonList,
        isTrackEmpty: filteredPokemonList.length === 0
      };
    });

    // 依天梯軌道排序選項排序 processedMainTracks (Track Sorting)
    processedMainTracks.sort((a, b) => {
      if (ladderSortOrder === 'ENERGY_DESC') {
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else if (ladderSortOrder === 'YIELD_DESC') {
        const getTrackMax = (track) => {
          if (track.filteredPokemonList && track.filteredPokemonList.length > 0) {
            let m = 0;
            track.filteredPokemonList.forEach(p => {
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult);
                if (scaled > m) m = scaled;
              });
            });
            return m;
          }
          let m = 0;
          if (track.ing && track.ing.pokemon) {
            track.ing.pokemon.forEach(p => {
              (p.variants || [{ count: p.count }]).forEach(v => {
                if (v.count > m) m = v.count;
              });
            });
          }
          return m * 0.001;
        };
        const maxA = getTrackMax(a);
        const maxB = getTrackMax(b);
        if (maxB !== maxA) return maxB - maxA;
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else if (ladderSortOrder === 'DEMAND_DESC') {
        const needA = (a.dishInfo && a.dishInfo.need) || 0;
        const needB = (b.dishInfo && b.dishInfo.need) || 0;
        if (needB !== needA) return needB - needA;
        return (b.ing.energy || 0) - (a.ing.energy || 0);
      } else {
        // 預設 ENERGY_ASC：食材能量由低到高
        return (a.ing.energy || 0) - (b.ing.energy || 0);
      }
    });

    // 2. 動態設定最高與最低刻度 (全部展示時自 30 起標，有篩選時動態支援低於 30 之刻度)
    let globalMinCount = 100;
    processedMainTracks.forEach(t => {
      t.filteredPokemonList.forEach(p => {
        p.variants.forEach(v => {
          const scaled = Math.round(v.count * mult);
          if (scaled < globalMinCount) globalMinCount = scaled;
        });
      });
    });

    let minVal = 30;
    if (!isUnfilteredDefault && globalMinCount < 30) {
      minVal = Math.max(0, Math.floor(globalMinCount / 10) * 10);
      if (minVal > 20) minVal = 20;
    }
    let maxVal = Math.ceil((globalMaxCount + 1) / 10) * 10;
    if (maxVal <= minVal) maxVal = minVal + 10; // 最低跨度至少 10

    // 動態計算刻度步長 step
    const span = maxVal - minVal;
    let step = 10;
    if (span > 120) {
      step = 20;
    } else if (span > 80) {
      step = 10;
    } else {
      step = 10;
    }

    let ticks = [];
    for (let t = minVal; t <= maxVal; t += step) {
      ticks.push(t);
    }
    if (ticks[ticks.length - 1] < maxVal) {
      ticks.push(maxVal);
    }

    function getPosPct(val) {
      const clamped = Math.min(Math.max(val, minVal), maxVal);
      return ((clamped - minVal) / (maxVal - minVal) * 100).toFixed(2);
    }

    return `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder" onmouseover="window.WikiDB.handleLadderGroupHover(event)" onmouseout="window.WikiDB.handleLadderGroupHoverOut(event)">
          <!-- 頂部刻度標尺 (自 20 起標至動態最高值 ${maxVal}) -->
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

          <!-- 常規食材軌道 (18種食材，依篩選動態縮放) -->
          ${processedMainTracks.map(({ ing, dishInfo, dishName, ingName, filteredPokemonList, isTrackEmpty }, trackIdx) => {
            // 計算該軌道最低產量起點，用於畫出前方點狀前導虛線
            let minTrackCount = maxVal;
            filteredPokemonList.forEach(p => {
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult);
                if (scaled < minTrackCount) minTrackCount = scaled;
              });
            });
            if (minTrackCount > maxVal) minTrackCount = minVal;
            const leadPct = getPosPct(minTrackCount);
            const isTopTrack = trackIdx < 5;
            const popupDirectionClass = isTopTrack ? 'popup-down' : 'popup-up';

            // 先計算該軌道最高產量 (Track Max Yield)
            let trackMaxYield = 0;
            filteredPokemonList.forEach(p => {
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult);
                if (scaled > trackMaxYield) trackMaxYield = scaled;
              });
            });

            let trackNodes = [];
            filteredPokemonList.forEach((p, pIdx) => {
              const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
              p.variants.forEach((v, vIdx) => {
                const scaledCount = Math.round(v.count * mult);
                const isTopNode = (scaledCount === trackMaxYield && scaledCount > 0) || v.isTop || (p.isTop && v.recipe === p.recipe);
                const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                trackNodes.push({
                  p,
                  pIdx,
                  pkmDisplayName,
                  v,
                  vIdx,
                  scaledCount,
                  isTopNode,
                  zIndex
                });
              });
            });

            // 預設或開啟前15名篩選：僅保留產量前 15 名的節點（大幅削減 70% DOM 節點，徹底消除卡頓）
            if (ladderTop15Only && trackNodes.length > 15) {
              trackNodes.sort((a, b) => b.scaledCount - a.scaledCount);
              trackNodes = trackNodes.slice(0, 15);
            }

            const visiblePkmGroupNames = new Set(trackNodes.map(n => n.p.name));

            return `
            <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''} ${isTopTrack ? 'ladder-track-top' : ''}" data-ladder-ing="${ing.id}">
              <div class="ladder-track-header clickable-ing-header" onclick="window.WikiDB.openIngredientRankingModal('${ing.id}')" role="button" tabindex="0" title="${ingName} (${isEN ? 'Base Energy' : '基礎能量'} ${ing.energy}) · ${isEN ? 'Key Dish: ' : '核心大菜：'}${dishName} · ${isEN ? 'Click to view rankings' : '點擊查看產量排名'}">
                <div class="ladder-track-ing-main">
                  <img src="${ing.icon}" class="ladder-ing-icon" alt="${ingName}">
                </div>
              </div>

              <div class="ladder-track-canvas">
                <div class="ladder-grid-lines">
                  ${ticks.map(t => `<div class="ladder-grid-line" style="left: ${getPosPct(t)}%;"></div>`).join('')}
                </div>

                <!-- 前導點狀虛線 (20 ~ 最低產量) 與 實體軌道線 (最低產量 ~ 終點) -->
                <div class="ladder-track-lead-line" style="left: 0; width: ${leadPct}%;"></div>
                <div class="ladder-track-line" style="left: ${leadPct}%; right: 0;"></div>

                <!-- 跨度連接線容器 -->
                <div class="ladder-spans-container">
                  ${filteredPokemonList.map(p => {
                    if (ladderTop15Only && !visiblePkmGroupNames.has(p.name)) return '';
                    const pkmNodes = trackNodes.filter(n => n.p.name === p.name);
                    if (pkmNodes.length < 2) return '';
                    const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                    const scaledCounts = pkmNodes.map(n => n.scaledCount);
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
                  ${(() => {
                    // 依據 scaledCount 分組以計算重疊節點之水平偏移量 (Cluster Stagger Offset)
                    const countGroups = {};
                    trackNodes.forEach(node => {
                      if (!countGroups[node.scaledCount]) countGroups[node.scaledCount] = [];
                      countGroups[node.scaledCount].push(node);
                    });

                    return trackNodes.map(node => {
                      const group = countGroups[node.scaledCount];
                      const groupSize = group.length;
                      const itemIdx = group.indexOf(node);
                      
                      let offsetPx = 0;
                      if (groupSize > 1) {
                        const staggerStep = groupSize >= 6 ? 14 : 18;
                        offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                      }

                      // 大菜供應能力試算
                      const mealsPerDay = (node.scaledCount / dishInfo.need).toFixed(1);
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

                      const basePosPct = parseFloat(getPosPct(node.scaledCount));
                      const alignClass = basePosPct > 55 ? 'align-right' : (basePosPct < 22 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0 ? `${basePosPct}%` : `calc(${basePosPct}% + ${offsetPx}px)`;

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${alignClass} ${popupDirectionClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                             data-pkm-group="${node.p.name}"
                             data-pkm="${node.p.name}" 
                             data-recipe="${node.v.recipe}"
                             style="left: ${leftStyle}; z-index: ${node.zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge">${node.scaledCount}</div>
                          
                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">${node.isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                            <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估日產：'}<span class="text-success font-bold">${node.scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                            
                            <!-- 頂級大菜供貨能力指標 -->
                            <div class="tooltip-dish-box">
                              <div class="tooltip-dish-title">${isEN ? 'Key Dish: ' : '核心大菜：'}<span class="text-white font-bold">${dishName}</span> (${dishInfo.need}${isEN ? '/meal' : '顆/餐'})</div>
                              <div class="tooltip-dish-badge ${dishBadgeClass}">${dishTag}</div>
                            </div>

                            <div class="tooltip-note">${formatLadderNote(node.v.note || '', isEN)}</div>
                          </div>
                        </div>
                      `;
                    }).join('');
                  })()}
                </div>
              </div>
            </div>
          `;
          }).join('')}

          <!-- 獨立美味尾巴專屬天梯小看板 (0 ~ 20 獨立刻度) -->
          ${tailIng ? (() => {
            const tailTicks = [0, 5, 10, 15, 20];
            function getTailPct(val) {
              const clamped = Math.min(Math.max(val, 0), 20);
              return ((clamped / 20) * 100).toFixed(2);
            }
            const tailDishInfo = TOP_RECIPES_FOR_INGREDIENTS.tail || { need: 10 };
            const filteredTailPkm = tailIng.pokemon.map((p, pIdx) => {
              const pkmSpec = getPokemonLadderSpecialty(p.name);
              if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return null;
              if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return null;
              if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return null;

              if (ladderSearchQuery) {
                if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return null;
              }

              let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];
              variants = variants.filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

              if (ladderSupplyFilter === 'TOP') {
                const allMaxCounts = tailIng.pokemon.map(pkm => Math.max(...(pkm.variants || [{count: pkm.count}]).map(v => v.count)));
                const distinctCounts = [...new Set(allMaxCounts)].sort((a,b) => b - a);
                const top5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
                const pkmMaxCount = Math.max(...(p.variants || [{count: p.count}]).map(v => v.count));
                if (pkmMaxCount < top5Threshold) return null;
                variants = variants.slice(0, 1);
              } else if (ladderSupplyFilter === 'MEALS_3') {
                variants = variants.filter(v => Math.round(v.count * mult) >= tailDishInfo.need * 3);
              } else if (ladderSupplyFilter === 'MEALS_2') {
                variants = variants.filter(v => Math.round(v.count * mult) >= tailDishInfo.need * 2);
              }

              if (variants.length === 0) return null;
              return { ...p, variants };
            }).filter(Boolean);

            const isTailEmpty = filteredTailPkm.length === 0;

            return `
              <div class="ladder-tail-standalone-container">
                <div class="ladder-tail-standalone-box">
                  <div class="ladder-tail-ruler">
                    <div class="ladder-tail-ruler-spacer"></div>
                    <div class="ladder-tail-ruler-scale">
                      ${tailTicks.map(t => `
                        <div class="ladder-tail-tick" style="left: ${getTailPct(t)}%;">
                          <span class="tick-label">${t}</span>
                          <div class="tick-line"></div>
                        </div>
                      `).join('')}
                    </div>
                    <div class="ladder-tail-ruler-spacer"></div>
                  </div>

                  <div class="ladder-tail-track-row ${isTailEmpty ? 'ladder-track-empty' : ''}" data-ladder-ing="tail">
                    <div class="ladder-track-header clickable-ing-header" onclick="window.WikiDB.openIngredientRankingModal('tail')" role="button" tabindex="0" title="${isEN ? 'Slowpoke Tail' : '美味尾巴'} · ${isEN ? 'Click to view rankings' : '點擊查看產量排名'}">
                      <img src="${tailIng.icon}" class="ladder-ing-icon" alt="${isEN ? 'Slowpoke Tail' : '美味尾巴'}">
                    </div>

                    <div class="ladder-tail-canvas">
                      <div class="ladder-grid-lines">
                        ${tailTicks.map(t => `<div class="ladder-grid-line" style="left: ${getTailPct(t)}%;"></div>`).join('')}
                      </div>

                      <div class="ladder-track-line" style="left: 0; right: 0;"></div>

                      <div class="ladder-spans-container">
                        ${filteredTailPkm.map(p => {
                          if (p.variants.length < 2) return '';
                          const scaledCounts = p.variants.map(v => Math.round(v.count * mult));
                          const minC = Math.min(...scaledCounts);
                          const maxC = Math.max(...scaledCounts);
                          const minPct = parseFloat(getTailPct(minC));
                          const maxPct = parseFloat(getTailPct(maxC));
                          const widthPct = Math.max(maxPct - minPct, 1.5).toFixed(2);
                          return `<div class="ladder-pkm-span-line" data-pkm-group="${p.name}" style="left: ${minPct}%; width: ${widthPct}%;"></div>`;
                        }).join('')}
                      </div>

                      <div class="ladder-nodes-container">
                        ${(() => {
                          // 先計算美味尾巴最高產量 (Tail Track Max Yield)
                          let tailMaxYield = 0;
                          filteredTailPkm.forEach(p => {
                            p.variants.forEach(v => {
                              const scaled = Math.round(v.count * mult);
                              if (scaled > tailMaxYield) tailMaxYield = scaled;
                            });
                          });

                          const tailTrackNodes = [];
                          filteredTailPkm.forEach((p, pIdx) => {
                            const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
                            p.variants.forEach((v, vIdx) => {
                              const scaledCount = Math.round(v.count * mult);
                              const isTopNode = (scaledCount === tailMaxYield && scaledCount > 0) || v.isTop || (p.isTop && v.recipe === p.recipe);
                              const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                              tailTrackNodes.push({
                                p,
                                pIdx,
                                pkmDisplayName,
                                v,
                                vIdx,
                                scaledCount,
                                isTopNode,
                                zIndex
                              });
                            });
                          });

                          const tailCountGroups = {};
                          tailTrackNodes.forEach(node => {
                            if (!tailCountGroups[node.scaledCount]) tailCountGroups[node.scaledCount] = [];
                            tailCountGroups[node.scaledCount].push(node);
                          });

                          return tailTrackNodes.map(node => {
                            const group = tailCountGroups[node.scaledCount];
                            const groupSize = group.length;
                            const itemIdx = group.indexOf(node);
                            
                            let offsetPx = 0;
                            if (groupSize > 1) {
                              const staggerStep = groupSize >= 6 ? 14 : 18;
                              offsetPx = Math.round((itemIdx - (groupSize - 1) / 2) * staggerStep);
                            }

                            const baseTailPosPct = parseFloat(getTailPct(node.scaledCount));
                            const tailAlignClass = baseTailPosPct > 55 ? 'align-right' : (baseTailPosPct < 25 ? 'align-left' : 'align-center');
                            const leftStyle = offsetPx === 0 ? `${baseTailPosPct}%` : `calc(${baseTailPosPct}% + ${offsetPx}px)`;

                            return `
                              <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${tailAlignClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                                   data-pkm-group="${node.p.name}"
                                   data-pkm="${node.p.name}" 
                                   data-recipe="${node.v.recipe}"
                                   style="left: ${leftStyle}; z-index: ${node.zIndex};">
                                <div class="node-avatar-wrapper">
                                  <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}">
                                </div>
                                <div class="node-count-badge">${node.scaledCount}</div>
                                <div class="ladder-node-tooltip">
                                  <div class="tooltip-title">${node.isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                                  <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估日產：'}<span class="text-success font-bold">${node.scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                                  <div class="tooltip-note">${formatLadderNote(node.v.note || '', isEN)}</div>
                                </div>
                              </div>
                            `;
                          }).join('');
                        })()}
                      </div>
                    </div>

                    <div class="ladder-track-header ladder-track-header-right">
                      <img src="${tailIng.icon}" class="ladder-ing-icon" alt="${isEN ? 'Slowpoke Tail' : '美味尾巴'}">
                    </div>
                  </div>
                </div>
              </div>
            `;
          })() : ''}
        </div>
      </div>
    `;
  }

  // 渲染樹果與食材基礎能量看板 (極簡無名無滾輪 18 格全展開版 + 等級滑桿、島嶼加成與順果 2x 開關)
  function renderValuesBoard() {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    return `
      <div class="values-horizontal-container">
        <!-- 區塊 1：樹果基礎能量庫 (Lv.1 ~ Lv.70 + 島嶼加成 0~85% 動態試算 + 雙行 1x/2x 展示) -->
        <div class="values-horizontal-section">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge berry-badge">${isEN ? 'Berry Power' : '樹果能量庫'}</span>
            </div>

            <!-- 等級滑桿與島嶼加成控制器 -->
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
            </div>
          </div>

          <div id="values-berry-grid" class="values-compact-grid values-berry-grid">
            ${BERRY_VALUES_DATA.map(b => {
              const energy1x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, false);
              const energy2x = calcBerryEnergy(b.energy, currentBerryLevel, currentIslandBonus, true);
              const bName = isEN ? (window.I18N.getBerryName(b.name) || b.name) : b.name;
              const bType = isEN ? (window.I18N.getTypeName(b.type) || b.type) : b.type;
              const bonusStr = currentIslandBonus > 0 ? (isEN ? ` +${currentIslandBonus}% Island` : ` +${currentIslandBonus}%島嶼`) : '';
              return `
                <div class="value-compact-node" title="${bName} (${bType}) - Lv.${currentBerryLevel}${bonusStr} | ${isEN ? 'Base' : '基礎'}: ${energy1x} / ${isEN ? 'Fav 2x' : '順果 2x'}: ${energy2x}">
                  <img src="${b.icon}" class="value-compact-icon" alt="${bName}">
                  <span class="value-compact-energy berry-val" title="${isEN ? 'Base Energy (1x)' : '基礎能量 (1x)'}"><span class="energy-multiplier-prefix">1x</span> ${energy1x}</span>
                  <span class="value-compact-energy berry-val-fav" title="${isEN ? 'Favorite Berry (2x)' : '順果 2x 能量'}"><span class="energy-multiplier-prefix">2x</span> ${energy2x}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 區塊 2：食材基礎庫 (90 ~ 342) -->
        <div class="values-horizontal-section" style="margin-top: 8px;">
          <div class="values-section-header">
            <div class="values-section-title-group">
              <span class="values-section-badge ing-badge">${isEN ? 'Ingredient Base Values' : '食材基礎庫'}</span>
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

        if (!matchesLadderRecipeFilter(t, ladderRecipeFilter)) return false;

        if (ladderSearchQuery) {
          if (!matchesLadderSearch(t.name, t.name_en, ladderSearchQuery)) return false;
        }

        const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
        const scaledCount = Math.round(rawCountNum * mult);
        if (ladderSupplyFilter === 'TOP' && tIdx >= 5) return false;
        if (ladderSupplyFilter === 'MEALS_3' && scaledCount < dishInfo.need * 3) return false;
        if (ladderSupplyFilter === 'MEALS_2' && scaledCount < dishInfo.need * 2) return false;

        return true;
      });

      if (ladderTop15Only && filteredTiers.length > 15) {
        filteredTiers = filteredTiers.slice(0, 15);
      }

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

            <div id="charge-matrix-table" class="wiki-table-wrapper" style="display: none; margin-top: 6px;">
              <table class="wiki-mini-table">
                <thead>
                  <tr>
                    <th>${isEN ? 'Stacks' : '蓄力'}</th>
                    ${[1, 2, 3, 4, 5, 6, 7].map(lv => `<th>Lv.${lv}</th>`).join('')}
                  </tr>
                </thead>
                <tbody>
                  ${skill.matrix.map(m => `
                    <tr class="${m.stacks === 10 ? 'row-highlight' : ''}">
                      <td class="font-bold text-accent">${m.stacks}${isEN ? 'x' : '次'}</td>
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
          ${renderSkillHeroAndStepper(skill.id, ingStrings, unitLabel, skill.maxLevel || 7)}

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
                  <th style="text-align: center;">${isEN ? 'Candidate Ingredients (3~4)' : '專屬食材候選池 (3~4種)'}</th>
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
    const isLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_ladder_sidebar_open', true) : true;
    const initialLadderCollapsed = isMobileH5 ? 'collapsed' : (isLadderOpen ? '' : 'collapsed');

    container.innerHTML = `
      ${isMobileH5 ? `
        <!-- 🎛️ 右下懸浮天梯篩選按鈕 (與圖鑑/料理完全一致的 FAB 結構) -->
        <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle sidebar-fab-btn" onclick="window.WikiDB.openLadderSidebar()" title="${isEN ? 'Open Filters' : '展開天梯篩選器'}" aria-label="${isEN ? 'Open Filters' : '展開天梯篩選器'}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}">
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
          <span id="ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
        </button>
      ` : ''}

      <!-- 天梯專屬側邊篩選器 (Mobile: 抽屜式 / Desktop: 左側滑動) -->
      <aside id="ladder-filter-sidebar" class="pokemon-filter-sidebar ladder-fixed-sidebar ${initialLadderCollapsed}" style="${currentWikiSubTab === 'ingredients' ? 'display:flex;' : 'display:none;'}" aria-label="${isEN ? 'Ladder Filters' : '天梯篩選器'}">
        ${!isMobileH5 ? `
          <!-- 側邊欄垂直中央書籤標籤 (Desktop: 抽屜把手，展開時自動隱藏，收合時展示) -->
          <button type="button" id="ladder-sidebar-bookmark-handle" class="sidebar-bookmark-handle" onclick="window.WikiDB.toggleLadderSidebar(true)" title="${isEN ? 'Expand Ladder Filters' : '展開天梯篩選側邊欄'}" aria-label="${isEN ? 'Expand Ladder Filters' : '展開天梯篩選側邊欄'}">
            <span class="bookmark-icon">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <span class="bookmark-text">${isEN ? 'Filter' : '篩選'}</span>
            <span class="bookmark-arrow">◀</span>
            <span id="ladder-sidebar-bookmark-badge" class="sidebar-bookmark-badge" style="display:none;"></span>
          </button>
        ` : ''}

        <div class="sidebar-header">
          <button type="button" id="ladder-sidebar-close-btn" class="sidebar-close-btn" onclick="window.WikiDB.toggleLadderSidebar(false)" title="${isEN ? 'Collapse Filters' : '收合側邊欄'}" aria-label="${isEN ? 'Collapse Filters' : '收合側邊欄'}">◀</button>
          <div class="sidebar-title-group">
            <span class="sidebar-title">${isEN ? 'Ladder Filters' : '天梯篩選器'}</span>
          </div>
          <div class="sidebar-header-actions" style="display: flex; align-items: center; gap: 8px;">
            <label class="ladder-top15-switch-label" title="${isEN ? 'Show Top 15 Only' : '預設開啟前15名排行'}">
              <input type="checkbox" id="ladder-top15-switch" class="ladder-switch-input" ${ladderTop15Only ? 'checked' : ''} onchange="window.WikiDB.toggleLadderTop15(this.checked)">
              <span class="ladder-switch-slider"></span>
              <span class="ladder-switch-text">${isEN ? 'Top 15' : '前15名'}</span>
            </label>
            <button type="button" id="ladder-reset-all-btn" class="sidebar-reset-btn" onclick="window.WikiDB.resetLadderFilters()" title="${isEN ? 'Reset All Filters' : '重設所有條件'}">${isEN ? 'Reset All' : '全部重設'}</button>
          </div>
        </div>

        <div class="sidebar-scrollable-content">
          <!-- 1. 搜尋寶可夢 -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Search Pokémon' : '搜尋寶可夢'}</span>
              <button type="button" id="ladder-search-clear-btn" class="sidebar-section-clear-btn" style="${ladderSearchQuery ? 'display:inline-block;' : 'display:none;'}" onclick="window.WikiDB.clearLadderSearch()">${isEN ? 'Clear' : '清空'}</button>
            </div>
            <div class="sidebar-search-box" style="margin-top: 4px;">
              <span class="sidebar-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="7"></circle>
                  <line x1="21" y1="21" x2="16.5" y2="16.5"></line>
                </svg>
              </span>
              <input type="text" id="ladder-pkm-search-input" class="sidebar-search-input" placeholder="${isEN ? 'Search Pokémon...' : '搜尋寶可夢名稱...'}" value="${ladderSearchQuery}" oninput="window.WikiDB.onLadderSearch(this.value)">
            </div>
          </div>

          <!-- 2. 天梯軌道排序 (Track Sorting) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Track Sorting' : '天梯軌道排序'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_ASC' ? 'active' : ''}" data-sort-order="ENERGY_ASC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_ASC')">${isEN ? 'Energy: Low to High' : '能量：低到高'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'ENERGY_DESC' ? 'active' : ''}" data-sort-order="ENERGY_DESC" onclick="window.WikiDB.setLadderSortOrder('ENERGY_DESC')">${isEN ? 'Energy: High to Low' : '能量：高到低'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'YIELD_DESC' ? 'active' : ''}" data-sort-order="YIELD_DESC" onclick="window.WikiDB.setLadderSortOrder('YIELD_DESC')">${isEN ? 'Yield: High to Low' : '產量：多到少'}</button>
              <button type="button" class="tag-btn ${ladderSortOrder === 'DEMAND_DESC' ? 'active' : ''}" data-sort-order="DEMAND_DESC" onclick="window.WikiDB.setLadderSortOrder('DEMAND_DESC')">${isEN ? 'Demand: High to Low' : '大菜需求：多到少'}</button>
            </div>
          </div>

          <!-- 3. 產量與供餐梯隊 (Supply Tier) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Supply Tier' : '產量供餐梯隊'}</span>
            </div>
            <div class="sidebar-skills-list">
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'ALL' ? 'active' : ''}" data-supply-filter="ALL" onclick="window.WikiDB.setLadderSupplyFilter('ALL')">${isEN ? 'All' : '全部'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'TOP' ? 'active' : ''}" data-supply-filter="TOP" onclick="window.WikiDB.setLadderSupplyFilter('TOP')">${isEN ? 'Top 5' : '前五名'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_3' ? 'active' : ''}" data-supply-filter="MEALS_3" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_3')">${isEN ? '3 Meals' : '滿載 3 餐'}</button>
              <button type="button" class="tag-btn ${ladderSupplyFilter === 'MEALS_2' ? 'active' : ''}" data-supply-filter="MEALS_2" onclick="window.WikiDB.setLadderSupplyFilter('MEALS_2')">${isEN ? '2 Meals' : '充足 2 餐'}</button>
            </div>
          </div>

          <!-- 4. 食材組合型態 (Recipe Structure) -->
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

          <!-- 5. 寶可夢專長分類 (Specialty Type) -->
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


          <!-- 6. 副技能補正模擬 (Sub-Skill Boost Simulation) -->
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

            <label class="sidebar-final-evo-label" for="ladder-ing-s-toggle" title="${isEN ? 'Ingredient Finder S (+18%)' : '食材發現機率提升S (+18%)'}" style="margin-top: 6px;">
              <span class="sidebar-final-evo-text">${isEN ? 'Ing. Finder S (+18%)' : '食材機率提升S (+18%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-ing-s-toggle" class="switch-checkbox" ${isLadderIngS ? 'checked' : ''} onchange="window.WikiDB.toggleLadderIngS(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>

            <label class="sidebar-final-evo-label" for="ladder-speed-m-toggle" title="${isEN ? 'Helping Speed M (+16.3% helps)' : '幫忙速度提升M (-14% 間隔時間，約 +16.3% 幫忙次數)'}" style="margin-top: 6px;">
              <span class="sidebar-final-evo-text">${isEN ? 'Helping Speed M (+16.3%)' : '幫忙速度提升M (+16.3%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-speed-m-toggle" class="switch-checkbox" ${isLadderSpeedM ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSpeedM(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>

            <label class="sidebar-final-evo-label" for="ladder-speed-s-toggle" title="${isEN ? 'Helping Speed S (+7.5% helps)' : '幫忙速度提升S (-7% 間隔時間，約 +7.5% 幫忙次數)'}" style="margin-top: 6px;">
              <span class="sidebar-final-evo-text">${isEN ? 'Helping Speed S (+7.5%)' : '幫忙速度提升S (+7.5%)'}</span>
              <div class="sidebar-switch-wrapper">
                <input type="checkbox" id="ladder-speed-s-toggle" class="switch-checkbox" ${isLadderSpeedS ? 'checked' : ''} onchange="window.WikiDB.toggleLadderSpeedS(this.checked)">
                <span class="switch-slider"></span>
              </div>
            </label>
          </div>

          <!-- 7. 性格補正模擬 (Nature Boost Simulation - 單選) -->
          <div class="sidebar-section">
            <div class="sidebar-section-header">
              <span class="sidebar-section-title">${isEN ? 'Nature Boost' : '性格補正模擬'}</span>
            </div>
            <div class="sidebar-skills-list sidebar-2col-tags">
              <button type="button" class="tag-btn ${ladderNature === 'NONE' ? 'active' : ''}" data-nature-filter="NONE" onclick="window.WikiDB.setLadderNature('NONE')">${isEN ? 'Neutral' : '無修正'}</button>
              <button type="button" class="tag-btn ${ladderNature === 'ING' ? 'active' : ''}" data-nature-filter="ING" onclick="window.WikiDB.setLadderNature('ING')">${isEN ? 'Ing. Rate ▲ (+20%)' : '食材機率▲ (+20%)'}</button>
              <button type="button" class="tag-btn ${ladderNature === 'SPEED' ? 'active' : ''}" data-nature-filter="SPEED" onclick="window.WikiDB.setLadderNature('SPEED')">${isEN ? 'Help Speed ▲ (+10%)' : '幫忙速度▲ (+10%)'}</button>
            </div>
          </div>
        </div>
      </aside>

      <div class="wiki-main-container">
        <!-- 二級子分頁導航 (Sub-tabs) - 精簡無大標題橫幅 -->
        <div class="wiki-subnav-bar">
          <div class="wiki-subnav-tabs" role="tablist">
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'skills' ? 'active' : ''}" data-subtab="skills" onclick="window.WikiDB.switchSubTab('skills')">${isMobileH5 ? (isEN ? 'Skills' : '主技能') : (isEN ? 'Main Skills DB' : '主技能數值庫')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'subskills' ? 'active' : ''}" data-subtab="subskills" onclick="window.WikiDB.switchSubTab('subskills')">${isMobileH5 ? (isEN ? 'Subskills' : '副技性格') : (isEN ? 'Sub-Skills & Natures' : '副技能與性格指南')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" data-subtab="ingredients" onclick="window.WikiDB.switchSubTab('ingredients')">${isMobileH5 ? (isEN ? 'Ladder' : '食材天梯') : (isEN ? 'Ingredient Yield Ladder' : '食材產量天梯榜')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'values' ? 'active' : ''}" data-subtab="values" onclick="window.WikiDB.switchSubTab('values')">${isMobileH5 ? (isEN ? 'Values' : '能量速查') : (isEN ? 'Berry & Ing. Values' : '樹果與食材能量')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'ratings' ? 'active' : ''}" data-subtab="ratings" onclick="window.WikiDB.switchSubTab('ratings')">${isMobileH5 ? (isEN ? 'Growth' : '培育指南') : (isEN ? 'Growth & Tier Guide' : '培育與評級指南')}</button>
            <button type="button" class="wiki-subtab-btn ${currentWikiSubTab === 'islands' ? 'active' : ''}" data-subtab="islands" onclick="window.WikiDB.switchSubTab('islands')">${isMobileH5 ? (isEN ? 'Islands' : '島嶼營地') : (isEN ? 'Research Camps & EX' : '島嶼營地與EX模式')}</button>
          </div>
        </div>

        <!-- 子分頁 1：主技能數值庫 (Main Skills) -->
        <div id="wiki-subpanel-skills" class="wiki-subpanel ${currentWikiSubTab === 'skills' ? 'active' : ''}" style="${currentWikiSubTab === 'skills' ? '' : 'display:none;'}">
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
        <div id="wiki-subpanel-subskills" class="wiki-subpanel ${currentWikiSubTab === 'subskills' ? 'active' : ''}" style="${currentWikiSubTab === 'subskills' ? '' : 'display:none;'}">
          <!-- 主技能發動機率矩陣速查表 -->
          <div class="wiki-card wiki-card-trigger-matrix">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Main Skill Trigger Chance Matrix' : '主技能發動機率矩陣'}</h3>
            </div>
            <div class="wiki-rule-banner">
              ${isEN 
                ? '<strong>Formula</strong>: <code>(1 + Sub-Skill %) × Nature Multiplier = Final Multiplier</code>' 
                : '<strong>公式</strong>: <code>(1 + 副技能提升%) × 性格倍率 = 最終發動總倍率</code>'}
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
                  ${TRIGGER_CHANCE_MATRIX.map(row => {
                    const gradeStr = row.grade || '';
                    const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                      : gradeStr.startsWith('SS') ? 'tier-ss'
                      : gradeStr.startsWith('S') ? 'tier-s'
                      : gradeStr.startsWith('A') ? 'tier-a'
                      : gradeStr.startsWith('B') ? 'tier-b'
                      : gradeStr.startsWith('C') ? 'tier-c'
                      : gradeStr.startsWith('D') ? 'tier-d'
                      : gradeStr.startsWith('E') ? 'tier-e'
                      : 'tier-baseline';
                    return `
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
                          ? `<span class="matrix-rate-up">${isEN ? '▲ Up' : '▲ 上升'}</span>` 
                          : (row.natureBadge === 'down' 
                            ? `<span class="matrix-rate-down">${isEN ? '▼ Down' : '▼ 下降'}</span>` 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">✕</span>`)}
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="text-accent font-bold" style="font-size: 13px;">x${row.multiplier.toFixed(3)}</span>
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${isEN ? (row.grade_en || row.grade) : row.grade}</span></td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 幫忙速度極限與計算機制指南 (Helping Speed Limits & Mechanics) -->
          <div class="wiki-card wiki-card-speed-guide" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Helping Speed Limits & Calculation Mechanics Guide' : '幫忙速度極限與計算機制指南'}</h3>
            </div>
            
            <!-- 幫忙速度核心機制重點說明 (無外框直接展示, 文字極簡化) -->
            <div class="wiki-speed-summary-points">
              <div class="summary-point-line">
                <span class="point-prefix">1.</span>
                <span class="point-title">${isEN ? 'Sub-Skills 35% Cap:' : '副技能上限35%:'}</span>
                <span class="point-desc">${isEN ? 'Combined reduction capped at 35%, excess is ignored.' : '副技能合計縮短上限為35%,溢出無效.'}</span>
              </div>
              <div class="summary-point-line">
                <span class="point-prefix">2.</span>
                <span class="point-title">${isEN ? 'Independent Nature:' : '性格獨立乘區:'}</span>
                <span class="point-desc">${isEN ? 'Multiplies after sub-skills, exempt from 35% cap.' : '直接與副技能相乘,不受35%上限約束.'}</span>
              </div>
              <div class="summary-point-line">
                <span class="point-prefix">3.</span>
                <span class="point-title">${isEN ? 'Output Conversion:' : '產能換算:'}</span>
                <span class="point-desc">${isEN ? 'Output is inverse of time. 58.5% interval equals +70.94% output.' : '產能為時間倒數,間隔58.5%等同產能提升70.94%.'}</span>
              </div>
            </div>

            <!-- 速查對照表 (Quick-Lookup Table) -->
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${isEN ? 'Sub-Skills' : '副技能組合'}</th>
                    <th style="text-align: center;">${isEN ? 'Nature' : '性格'}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${isEN ? 'Formula' : '計算式'}</th>
                    <th style="text-align: center;">${isEN ? 'Interval Ratio' : '幫忙間隔'}</th>
                    <th style="text-align: center;">${isEN ? 'Output Boost' : '產能提升'}</th>
                    <th class="col-hide-mobile" style="text-align: center;">${isEN ? 'Tier' : '強度評級'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${HELPING_SPEED_MATRIX.map(row => {
                    const gradeStr = row.grade || '';
                    const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                      : gradeStr.startsWith('SS') ? 'tier-ss'
                      : gradeStr.startsWith('S') ? 'tier-s'
                      : gradeStr.startsWith('A') ? 'tier-a'
                      : gradeStr.startsWith('B') ? 'tier-b'
                      : gradeStr.startsWith('C') ? 'tier-c'
                      : gradeStr.startsWith('D') ? 'tier-d'
                      : 'tier-baseline';
                    const isBoostPositive = row.outputMultiplier >= 1.0;
                    return `
                    <tr>
                      <td style="vertical-align: middle; text-align: center;">
                        <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: wrap;">
                          ${row.subskills && row.subskills.length > 0 
                            ? row.subskills.map(s => {
                                const sName = isEN ? (s.name_en || s.name) : s.name;
                                return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                              }).join('') 
                            : `<span class="text-muted font-bold" style="font-size: 13px;">✕</span>`}
                        </div>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        ${row.natureBadge === 'up' 
                          ? `<span class="matrix-rate-up font-bold" style="font-size: 15px;" title="${isEN ? 'Speed Up' : '幫忙速度上升'}">▲</span>` 
                          : (row.natureBadge === 'down' 
                            ? `<span class="matrix-rate-down font-bold" style="font-size: 15px;" title="${isEN ? 'Speed Down' : '幫忙速度下降'}">▼</span>` 
                            : `<span class="text-muted font-bold" style="font-size: 15px;" title="${isEN ? 'Neutral' : '無修正'}">-</span>`)}
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="font-bold text-accent" style="font-size: 13.5px;">${row.intervalRatio}x</span>
                      </td>
                      <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                        <span class="${isBoostPositive ? 'matrix-pct-up' : 'matrix-pct-down'} font-bold" style="font-size: 13px;">${row.outputBoostDisplay}</span>
                      </td>
                      <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${isEN ? (row.grade_en || row.grade) : row.grade}</span></td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 睡飽飽獎章加成指南 (Good-Night Ribbon Quick Guide) -->
          <div class="wiki-card wiki-card-ribbon-guide" style="margin-top: 16px;">
            <div class="wiki-card-header" style="margin-bottom: 8px;">
              <h3 class="wiki-card-title">${isEN ? 'Good-Night Ribbon Quick Guide' : '睡飽飽獎章加成指南'}</h3>
            </div>

            <div class="ribbon-compact-tiers">
              <div class="ribbon-compact-chip chip-bronze">
                <span class="chip-tier-tag">${isEN ? 'Tier 1' : '第 1 階段'} (200h)</span>
                <span class="chip-effect-text">+1 ${isEN ? 'Carry' : '持有上限'}</span>
              </div>
              <div class="ribbon-compact-chip chip-silver">
                <span class="chip-tier-tag">${isEN ? 'Tier 2' : '第 2 階段'} (500h)</span>
                <span class="chip-effect-text">+3 ${isEN ? 'Carry' : '持有'}, ${isEN ? 'Speed' : '幫速'} -5% / -11%</span>
              </div>
              <div class="ribbon-compact-chip chip-gold">
                <span class="chip-tier-tag">${isEN ? 'Tier 3' : '第 3 階段'} (1,000h)</span>
                <span class="chip-effect-text">+6 ${isEN ? 'Carry' : '持有'}, ${isEN ? 'Profile Icon' : '專屬頭像'}</span>
              </div>
              <div class="ribbon-compact-chip chip-platinum">
                <span class="chip-tier-tag">${isEN ? 'Tier 4' : '第 4 階段'} (2,000h)</span>
                <span class="chip-effect-text">+8 ${isEN ? 'Carry' : '持有'}, ${isEN ? 'Speed' : '幫速'} -12% / -25%</span>
              </div>
            </div>

            <div class="ribbon-compact-notes">
              <div class="compact-note-line">
                <span class="compact-note-label">${isEN ? 'Core Rule:' : '核心規則:'}</span>
                <span class="compact-note-text">${isEN ? 'Speed boost applies only to unevolved Pokemon (up to -25%), compounding independently with Nature & Subskills.' : '僅未完全進化寶可夢享有幫速縮短(最高 -25%), 與性格/副技能獨立相乘, 不受 35% 上限限制.'}</span>
              </div>
              <div class="compact-note-line">
                <span class="compact-note-label">${isEN ? 'Classic Case:' : '經典案例:'}</span>
                <span class="compact-note-text">${isEN ? 'Chansey vs Blissey: Chansey (1 evo left, base 3,300s) reaches <strong>2,904s</strong> (-12%) at 2,000h, surpassing Blissey (3,100s).' : '吉利蛋 vs 幸福蛋: 吉利蛋(能再進化 1 次)滿 2000h 幫速縮短 12% 至 <strong>2904 秒</strong>, 反超幸福蛋(3100 秒).'}</span>
              </div>
            </div>
          </div>

          <!-- 副技能完整階級與數值說明表格 -->
          <div class="wiki-card wiki-card-subskills-overview" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Sub-Skills Complete Tier & Stats Overview' : '副技能階級與數值總覽'}</h3>
            </div>
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table wiki-subskills-table">
                <thead>
                  <tr>
                    <th class="col-subskills-tags" style="text-align: center;">${isEN ? 'Skill Tags' : '技能標籤'}</th>
                    <th class="col-subskills-effect">${isEN ? 'Detailed Effect' : '詳細效果說明'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SUB_SKILLS_DATA.map(row => `
                    <tr>
                      <td class="col-subskills-tags" style="vertical-align: middle; text-align: center;">
                        <div class="wiki-subskill-tags-col">
                          ${row.skills.map(s => renderSkillBadge(s)).join('')}
                        </div>
                      </td>
                      <td class="col-subskills-effect text-secondary" style="vertical-align: middle;">${isEN ? (row.desc_en || row.desc) : row.desc}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 性格五維加成倍率表 -->
          <div class="wiki-card wiki-card-natures-table" style="margin-top: 20px;">
            <div class="wiki-card-header">
              <h3 class="wiki-card-title">${isEN ? 'Nature 5-Stat Multiplier Table' : '性格五維屬性倍率表'}</h3>
            </div>
            <div class="wiki-table-wrapper" style="margin-top: 10px;">
              <table class="wiki-data-table">
                <thead>
                  <tr>
                    <th style="text-align: center;">${isEN ? 'Stat' : '屬性項目'}</th>
                    <th style="text-align: center;">${isEN ? '▲ Nature' : '▲ 性格'}</th>
                    <th style="text-align: center;">${isEN ? '▼ Nature' : '▼ 性格'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${NATURES_EFFECT_DATA.map(row => `
                    <tr>
                      <td class="font-bold text-accent" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.stat_en || row.stat) : row.stat}</td>
                      <td class="text-success font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.up_en || row.up) : row.up}</td>
                      <td class="text-danger font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${isEN ? (row.down_en || row.down) : row.down}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 3：食材產量天梯榜 (Ingredient Yield Ladder) -->
        <div id="wiki-subpanel-ingredients" class="wiki-subpanel ${currentWikiSubTab === 'ingredients' ? 'active' : ''}" style="${currentWikiSubTab === 'ingredients' ? '' : 'display:none;'}">
          <!-- 橫向視覺天梯座標圖 (預設顯示) -->
          <div id="wiki-ingredient-ladder-coordinate">
            ${renderCoordinateLadder(LV60_COORDINATE_LADDER_DATA)}
          </div>
        </div>

        <!-- 子分頁 4：樹果與食材基礎能量 (Berry & Ingredient Values) -->
        <div id="wiki-subpanel-values" class="wiki-subpanel ${currentWikiSubTab === 'values' ? 'active' : ''}" style="${currentWikiSubTab === 'values' ? '' : 'display:none;'}">
          ${renderValuesBoard()}
        </div>

        <!-- 子分頁 5: 培育與評級指南 (Ratings & Growth) -->
        <div id="wiki-subpanel-ratings" class="wiki-subpanel ${currentWikiSubTab === 'ratings' ? 'active' : ''}" style="${currentWikiSubTab === 'ratings' ? '' : 'display:none;'}">
          <!-- 區塊 1: 核心養成週期指引 -->
          <div class="wiki-section-heading">
            <h3 class="wiki-section-title">${isEN ? 'Core Growth & Investment Cycle Guide' : '新手與進階養成核心週期指引'}</h3>
            <p class="wiki-section-subtitle">${isEN ? 'Key milestones, energy management, and seed mechanics for early to late-game development.' : '掌握前期突破門檻,活力常駐加成與種子珍稀資源的養成核心思維.'}</p>
          </div>
          <div class="wiki-card">
            <div class="wiki-strategy-grid">
              <div class="strategy-item strategy-early">
                <div class="strategy-header">
                  <span class="strategy-badge badge-early">${isEN ? 'Early Goal' : '前期目標'}</span>
                  <span class="strategy-title">${isEN ? 'Prioritize <span class="text-accent font-bold">Lv.30</span>' : '優先放置在 <span class="text-accent font-bold">Lv.30</span>'}</span>
                </div>
                <div class="strategy-desc">${isEN ? 'Focus on nature and <span class="text-success font-bold">Lv.10</span> &amp; <span class="text-success font-bold">Lv.25</span> sub-skills. Takes <span class="text-warning font-bold">~2-4 months</span> for free/light players to unlock <span class="text-accent font-bold">2nd ingredient slot</span>, becoming core pillars.' : '先看性格與 <span class="text-success font-bold">Lv.10</span> &amp; <span class="text-success font-bold">Lv.25</span> 副技能,無課/微課約養成 <span class="text-warning font-bold">2~4個月</span>即可解鎖<span class="text-accent font-bold">第2種食材</span>,成為中流砥柱.'}</div>
              </div>
              <div class="strategy-item strategy-late">
                <div class="strategy-header">
                  <span class="strategy-badge badge-late">${isEN ? 'Late Game' : '後期投資'}</span>
                  <span class="strategy-title">${isEN ? 'Carefully Invest in <span class="text-accent font-bold">Lv.50~60</span>' : '慎選投入 <span class="text-accent font-bold">Lv.50~60</span>'}</span>
                </div>
                <div class="strategy-desc">${isEN ? 'Ensure sub-skills and nature reach graduation tier before heavily investing candies and <span class="text-warning font-bold">Main Skill Seeds</span> (<span class="text-warning font-bold">~5-10 months</span>).' : '確認副技能與性格皆達畢業級再投入大量糖果與<span class="text-warning font-bold">金種子</span>(約需 <span class="text-warning font-bold">5~10個月</span>養成時間).'}</div>
              </div>
              <div class="strategy-item strategy-energy">
                <div class="strategy-header">
                  <span class="strategy-badge badge-energy">${isEN ? 'Energy Core' : '活力核心'}</span>
                  <span class="strategy-title">${isEN ? 'Raise One Dedicated Healer First' : '優先養成一隻主力補師'}</span>
                </div>
                <div class="strategy-desc">${isEN ? 'Maintaining team energy <span class="text-success font-bold">&gt; 80%</span> grants <span class="text-accent font-bold">2.2x~2.5x</span> helping speed! Recommended healers: <span class="text-warning font-bold">Wigglytuff</span>, <span class="text-warning font-bold">Sylveon</span>, <span class="text-warning font-bold">Gardevoir</span>, or <span class="text-warning font-bold">Pawmot</span>.' : '全體活力維持在 <span class="text-success font-bold">80%以上</span>可享受 <span class="text-accent font-bold">2.2x~2.5x</span> 幫忙速度!建議先練:<span class="text-warning font-bold">胖可丁</span>,<span class="text-warning font-bold">仙子伊布</span>,<span class="text-warning font-bold">沙奈朵</span>或<span class="text-warning font-bold">巴布土撥</span>.'}</div>
              </div>
              <div class="strategy-item strategy-seeds">
                <div class="strategy-header">
                  <span class="strategy-badge badge-seeds">${isEN ? 'Seed Rules' : '種子機制'}</span>
                  <span class="strategy-title">${isEN ? 'Main &amp; Sub Skill Seed Rules' : '主技能與副技能種子規則'}</span>
                </div>
                <div class="strategy-desc">${isEN ? 'Each evolution grants <span class="text-success font-bold">Main Skill Lv.+1</span> and <span class="text-accent font-bold">inventory +5</span>. Duplicate sub-skills cannot coexist (if S and M already exist, S cannot upgrade to M).' : '每次進化<span class="text-success font-bold">主技能+1</span>,<span class="text-accent font-bold">持有上限+5</span>.副技能不能同時存在相同名稱技能(如已有S與M,則S無法再升階為M).'}</div>
              </div>
            </div>
          </div>

          <!-- 區塊 2: 三大專長畢業評級榜 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${isEN ? 'Specialty Graduation Tier Guide' : '三大專長畢業評級指南'}</h3>
            <p class="wiki-section-subtitle">${isEN ? 'Optimal sub-skill and nature combinations for Berry, Ingredient, and Skill specialists.' : '樹果,食材,技能三大專長的頂級副技能與黃金性格搭配方向.'}</p>
          </div>
          <div class="wiki-ratings-container">
            ${renderRatingCard(RATINGS_GUIDE_DATA.berry)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.ingredient)}
            ${renderRatingCard(RATINGS_GUIDE_DATA.skill)}
          </div>

          <!-- 區塊 3: 睡眠天數升級試算器 -->
          <div class="wiki-section-heading" style="margin-top: 24px;">
            <h3 class="wiki-section-title">${isEN ? 'Pokémon Sleep EXP & Days Calculator' : '寶可夢睡眠升級天數計算器'}</h3>
            <p class="wiki-section-subtitle">${isEN ? 'Based on 100 daily sleep score (100 base EXP), calculates required sleep days and EXP from current to target level.' : '依據每日睡滿100分(100 EXP基礎),計算從目前等級升至目標等級所需睡眠天數與經驗值.'}</p>
          </div>
          <div class="wiki-card wiki-calc-card">
            <div class="calc-inputs-row">
              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-cur-lv">${isEN ? 'Current Level:' : '目前等級:'}</label>
                <input type="number" id="calc-sleep-cur-lv" class="calc-input-num" value="1" min="1" max="59" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label" for="calc-sleep-target-lv">${isEN ? 'Target Level:' : '目標等級:'}</label>
                <input type="number" id="calc-sleep-target-lv" class="calc-input-num" value="30" min="2" max="60" oninput="window.WikiDB.recalcSleepDays()" onchange="window.WikiDB.recalcSleepDays()">
              </div>

              <div class="calc-input-group">
                <label class="calc-label">${isEN ? 'Boost Conditions:' : '加成條件:'}</label>
                <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 4px;">
                  <label><input type="checkbox" id="calc-sleep-exp-subskill" onchange="window.WikiDB.recalcSleepDays()"> ${isEN ? 'Sleep EXP Bonus (+14%)' : '睡眠EXP獎勵 (+14%)'}</label>
                  <label><input type="checkbox" id="calc-sleep-incense" onchange="window.WikiDB.recalcSleepDays()"> ${isEN ? 'Growth Incense (2x)' : '成長薰香 (2x)'}</label>
                  <select id="calc-sleep-nature-select" class="calc-select" style="width: auto; padding: 4px 8px;" onchange="window.WikiDB.recalcSleepDays()">
                    <option value="1.0">${isEN ? 'Neutral EXP Nature' : '性格無EXP修正'}</option>
                    <option value="1.18">${isEN ? 'EXP Up ▲ (+18%)' : '性格EXP▲ (+18%)'}</option>
                    <option value="0.82">${isEN ? 'EXP Down ▼ (-18%)' : '性格EXP▼ (-18%)'}</option>
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
            <div class="wiki-table-wrapper" style="margin-top: 14px;">
              <table class="wiki-data-table milestone-table">
                <thead>
                  <tr>
                    <th class="col-milestone-lv">${isEN ? 'Target Level' : '目標等級'}</th>
                    <th class="col-milestone-exp">${isEN ? 'Required EXP' : '所需EXP'}</th>
                    <th class="col-milestone-days">${isEN ? 'Daily Full Sleep' : '每天滿睡'}</th>
                    <th class="col-milestone-note">${isEN ? 'Milestone' : '里程碑'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${SLEEP_DAYS_BASELINE.map(row => {
                    const milestoneColor = row.level === 10 ? 'milestone-cyan'
                      : row.level === 25 ? 'milestone-purple'
                      : row.level === 30 ? 'milestone-green'
                      : row.level === 50 ? 'milestone-amber'
                      : 'milestone-pink';
                    const rawNote = isEN ? (row.note_en || row.note) : row.note;
                    const formattedNote = rawNote
                      .replace(/(第[一二三123]個副技能|第[一二三123]種食材|1st sub-skill|2nd sub-skill|3rd sub-skill|2nd ingredient slot|3rd ingredient slot)/g, '<span class="text-accent font-bold">$1</span>');
                    return `
                    <tr>
                      <td class="col-milestone-lv" style="vertical-align: middle;"><span class="milestone-badge ${milestoneColor}">Lv.${row.level}</span></td>
                      <td class="col-milestone-exp font-bold" style="vertical-align: middle;">${row.totalExp.toLocaleString()}</td>
                      <td class="col-milestone-days text-success font-bold" style="vertical-align: middle;">${row.days} ${isEN ? 'Days' : '天'}</td>
                      <td class="col-milestone-note text-secondary" style="vertical-align: middle;">${formattedNote}</td>
                    </tr>
                  `;}).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 子分頁 6: 島嶼營地與EX專家模式 (Research Camps & EX Mode) -->
        <div id="wiki-subpanel-islands" class="wiki-subpanel ${currentWikiSubTab === 'islands' ? 'active' : ''}" style="${currentWikiSubTab === 'islands' ? '' : 'display:none;'}">
          ${renderIslandsSubpanel()}
        </div>
      </div>

      <!-- 遮罩層 (Backdrop for Mobile Drawer - 阻斷點擊穿透) -->
      <div id="ladder-sidebar-backdrop" class="sidebar-backdrop" onclick="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchend="event.preventDefault(); event.stopPropagation(); window.WikiDB.closeLadderSidebar()" ontouchstart="event.stopPropagation()"></div>
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
    HELPING_SPEED_MATRIX,
    NATURES_EFFECT_DATA,
    RATINGS_GUIDE_DATA,
    SLEEP_DAYS_BASELINE,
    BERRY_VALUES_DATA,
    INGREDIENT_VALUES_DATA,
    LV60_COORDINATE_LADDER_DATA,
    LV60_INGREDIENTS_LADDER,
    mergeRecipeCodes,
    matchesLadderRecipeFilter,
    matchesLadderSearch,
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
    toggleLadderTop15: toggleLadderTop15,
    getLadderTop15Only: getLadderTop15Only,
    toggleLadderIngM: toggleLadderIngM,
    toggleLadderIngS: toggleLadderIngS,
    toggleLadderSpeedM: toggleLadderSpeedM,
    toggleLadderSpeedS: toggleLadderSpeedS,
    toggleLadderNatureIng: toggleLadderNatureIng,
    toggleLadderNatureSpeed: toggleLadderNatureSpeed,
    setLadderNature: setLadderNature,
    onLadderSearch: onLadderSearch,
    clearLadderSearch: clearLadderSearch,
    setLadderSupplyFilter: setLadderSupplyFilter,
    setLadderRecipeFilter: setLadderRecipeFilter,
    setLadderSpecialtyFilter: setLadderSpecialtyFilter,
    setLadderSortOrder: setLadderSortOrder,
    getLadderSortOrder: getLadderSortOrder,
    resetLadderFilters: resetLadderFilters,
    refreshCoordinateLadder: refreshCoordinateLadder,
    handleLadderGroupHover: handleLadderGroupHover,
    handleLadderGroupHoverOut: handleLadderGroupHoverOut,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays,
    openLadderSidebar: openLadderSidebar,
    closeLadderSidebar: closeLadderSidebar,
    toggleLadderSidebar: toggleLadderSidebar,
    openIngredientRankingModal: openIngredientRankingModal,
    closeIngredientRankingModal: closeIngredientRankingModal,
    updateLadderActiveFilterBadge: updateLadderActiveFilterBadge,
    toggleSkillCard: toggleSkillCard,
    toggleSkillStepper: toggleSkillStepper,
    TOP_RECIPES_FOR_INGREDIENTS: TOP_RECIPES_FOR_INGREDIENTS,
    getPokemonLadderSpecialty: getPokemonLadderSpecialty,
    ISLANDS_DATA: ISLANDS_DATA,
    selectIsland: selectIsland,
    toggleIslandExpertMode: toggleIslandExpertMode,
    filterIslandSleepType: filterIslandSleepType,
    renderIslandsSubpanel: renderIslandsSubpanel
  };

  window.WikiDB = WikiDBExport;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  window.switchWikiSubTab = switchWikiSubTab;
  window.getCurrentSubTab = getCurrentSubTab;
  window.toggleLadderSidebar = toggleLadderSidebar;
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
  window.toggleLadderTop15 = toggleLadderTop15;
  window.getLadderTop15Only = getLadderTop15Only;
  window.toggleLadderIngM = toggleLadderIngM;
  window.toggleLadderIngS = toggleLadderIngS;
  window.toggleLadderSpeedM = toggleLadderSpeedM;
  window.toggleLadderSpeedS = toggleLadderSpeedS;
  window.toggleLadderNatureIng = toggleLadderNatureIng;
  window.toggleLadderNatureSpeed = toggleLadderNatureSpeed;
  window.setLadderNature = setLadderNature;
  window.onLadderSearch = onLadderSearch;
  window.clearLadderSearch = clearLadderSearch;
  window.setLadderSupplyFilter = setLadderSupplyFilter;
  window.setLadderRecipeFilter = setLadderRecipeFilter;
  window.setLadderSpecialtyFilter = setLadderSpecialtyFilter;
  window.setLadderSortOrder = setLadderSortOrder;
  window.getLadderSortOrder = getLadderSortOrder;
  window.resetLadderFilters = resetLadderFilters;
  window.refreshCoordinateLadder = refreshCoordinateLadder;
  window.handleLadderGroupHover = handleLadderGroupHover;
  window.handleLadderGroupHoverOut = handleLadderGroupHoverOut;
  window.recalcTriggerChance = recalcTriggerChance;
  window.recalcSleepDays = recalcSleepDays;
  window.openLadderSidebar = openLadderSidebar;
  window.closeLadderSidebar = closeLadderSidebar;
  window.openIngredientRankingModal = openIngredientRankingModal;
  window.closeIngredientRankingModal = closeIngredientRankingModal;
  window.updateLadderActiveFilterBadge = updateLadderActiveFilterBadge;
  window.HELPING_SPEED_MATRIX = HELPING_SPEED_MATRIX;
  window.selectIsland = selectIsland;
  window.toggleIslandExpertMode = toggleIslandExpertMode;
  window.filterIslandSleepType = filterIslandSleepType;
  window.renderIslandsSubpanel = renderIslandsSubpanel;

  // 當 DOM 準備完成時自動初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWikiModule);
  } else {
    initWikiModule();
  }

})();
