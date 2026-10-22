/**
 * =========================================================
 * Pokémon Sleep 數據百科與知識庫 (Wiki & Strategy Guide)
 * 實體化 Google 試算表圖表與官方最新拆包數據 (v2.7.0)
 * =========================================================
 */

(function () {
  'use strict';

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
      extraEffect: '少數情況暴擊獲得大量夢之碎片 (暴擊時最高 20,000)',
      extraEffect_en: 'Rarely crits for massive Dream Shards (up to 20,000)'
    },
    {
      id: 303,
      name: '大嘴娃',
      name_en: 'Mawile',
      family: '大嘴娃',
      family_en: 'Mawile',
      skill: '怪力鉗（食材精選S）',
      skill_en: 'Hyper Cutter (Ingr. Select S)',
      icon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/303.png',
      ingredients: [
        { name: '窩心洋芋', name_en: 'Soft Potato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
        { name: '純粹油', name_en: 'Pure Oil', icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
        { name: '萌綠玉米', name_en: 'Greengrass Corn', icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
        { name: '好眠番茄', name_en: 'Snoozy Tomato', icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' }
      ],
      extraEffect: '漂亮成功 (大成功/暴擊) 獲取 2 倍食材 (最高 36 個)',
      extraEffect_en: 'Crits on Extra Tasty for 2x ingredients (up to 36)'
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
      category: "ingredient",
      catName: "食材與料理",
      desc: "從該寶可夢專屬的特定食材候選池中，隨機獲得其中 1 種食材（單一食材獲取量為 5~18 個）。",
      desc_en: "Obtains 1 ingredient type exclusively from this Pokémon's candidate pool (5~18 of a single ingredient).",
      maxLevel: 7,
      values: [5, 6, 8, 11, 13, 16, 18],
      specialNote: "機制: 鎖定抽取發動寶可夢專屬食材池中 1 種食材 (Lv.1 為 5 個, Lv.7 上限最高獲取 18 個). 特殊型態: 超幸運有機率暴擊獲得大量夢之碎片 (暴擊時最高達 20,000 碎片); 怪力鉗漂亮成功 (大成功/暴擊) 時獲取 2 倍食材 (最高達 36 個).",
      specialNote_en: "Rule: Draws 1 ingredient type only from this Pokémon's candidate pool (Lv.1 yields 5, up to 18 at Lv.7). Variants: Super Luck may crit for massive Dream Shards (up to 20,000); Hyper Cutter crits on Extra Tasty for 2x ingredients (up to 36).",
      hasIngredientDrawMatrix: true,
      unit: " 個食材",
      unit_en: " Ingredients"
    },
    {
      id: "cooking_power_up_s",
      name: "料理強化S",
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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
      icon: "",
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

