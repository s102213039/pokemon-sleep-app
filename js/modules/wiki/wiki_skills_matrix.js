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
      calc: "1.00 × 1.075",
      intervalRatio: 1.075,
      intervalDisplay: "107.5%",
      intervalDiff: "+7.5%",
      outputMultiplier: 0.9302,
      outputBoostDisplay: "-6.98%",
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
        { name: "樹果數量S", name_en: "Berry Finding S", detail: "樹果+1,能量翻倍" },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間" },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間" },
        { name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己-7%幫忙時間" }
      ],
      natures: [
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "樹果產速提升" },
        { name: "食材發現率▼", name_en: "Ingredient Finding ▼", detail: "變相提高樹果率" },
        { name: "主技能機率▲/▼", name_en: "Main Skill Chance ▲ / ▼", detail: "影響不大" }
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
        { name: "食材機率提升M", name_en: "Ingredient Finder M", detail: "+36%食材機率" },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間" },
        { name: "食材機率提升S", name_en: "Ingredient Finder S", detail: "+18%食材機率" },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間" },
        { name: "幫忙速度S", name_en: "Helping Speed S", detail: "自己-7%幫忙時間" },
        { name: "持有上限提升 M/L", name_en: "Inventory Up M/L", detail: "防滿包停產" },
        { name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "需常收取" }
      ],
      natures: [
        { name: "食材發現率▲", name_en: "Ingredient Finding ▲", detail: "食材量大增" },
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "提高判定頻率" },
        { name: "主技能機率▲/▼", name_en: "Main Skill Chance ▲ / ▼", detail: "視技能而定" }
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
        { name: "技能機率提升M", name_en: "Skill Trigger M", detail: "+36%技能機率" },
        { name: "幫手獎勵", name_en: "Helping Bonus", detail: "全隊-5%幫忙時間" },
        { name: "幫忙速度M", name_en: "Helping Speed M", detail: "自己-14%幫忙時間" },
        { name: "技能機率提升S", name_en: "Skill Trigger S", detail: "+18%技能機率" },
        { name: "樹果數量S + 持有上限", name_en: "Berry Finding S + Inventory", detail: "補基本能量" },
        { name: "技能等級提升M", name_en: "Skill Level Up M", detail: "技能等級+2" },
        { name: "技能等級提升S", name_en: "Skill Level Up S", detail: "技能等級+1" }
      ],
      natures: [
        { name: "主技能發動機率▲", name_en: "Main Skill Chance ▲", detail: "觸發次數最大化" },
        { name: "幫忙速度▲", name_en: "Speed of Help ▲", detail: "提高判定頻率" },
        { name: "食材發現率▼", name_en: "Ingredient Finding ▼", detail: "無副作用" }
      ]
    }
  };

  // 睡眠天數成長基準表 (Image 2)
  const SLEEP_DAYS_BASELINE = [
    { level: 10, totalExp: 1560, days: 16, note: "解鎖第1個副技能", note_en: "Unlocks 1st sub-skill" },
    { level: 25, totalExp: 8668, days: 87, note: "解鎖第2個副技能", note_en: "Unlocks 2nd sub-skill" },
    { level: 30, totalExp: 11992, days: 120, note: "解鎖第2種食材", note_en: "Unlocks 2nd ingredient slot" },
    { level: 50, totalExp: 29993, days: 300, note: "解鎖第3個副技能", note_en: "Unlocks 3rd sub-skill" },
    { level: 60, totalExp: 51493, days: 515, note: "解鎖第3種食材", note_en: "Unlocks 3rd ingredient slot" },
    { level: 70, totalExp: 82162, days: 822, note: "解鎖第4個副技能", note_en: "Unlocks 4th sub-skill" },
    { level: 80, totalExp: 120262, days: 1203, note: "解鎖第5個副技能", note_en: "Unlocks 5th sub-skill" }
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
  const LV60_COORDINATE_LADDER_DATA = (function () {
    if (typeof window !== 'undefined' && (window.LV60_COORDINATE_LADDER_DATA || window.__LADDER_DATA__)) {
      return window.LV60_COORDINATE_LADDER_DATA || window.__LADDER_DATA__;
    }
    if (typeof global !== 'undefined' && (global.LV60_COORDINATE_LADDER_DATA || global.__LADDER_DATA__)) {
      return global.LV60_COORDINATE_LADDER_DATA || global.__LADDER_DATA__;
    }
    if (typeof globalThis !== 'undefined' && (globalThis.LV60_COORDINATE_LADDER_DATA || globalThis.__LADDER_DATA__)) {
      return globalThis.LV60_COORDINATE_LADDER_DATA || globalThis.__LADDER_DATA__;
    }
    if (typeof require !== 'undefined') {
      try {
        return require('../data/ladder_data.js');
      } catch (e1) {
        try {
          return require('../../data/ladder_lv60.json');
        } catch (e2) {}
      }
    }
    try {
      const proc = (new Function('return (typeof process !== "undefined" ? process : (this && this.constructor && this.constructor.constructor ? this.constructor.constructor("return process")() : null))'))();
      if (proc) {
        const fsModule = proc.getBuiltinModule ? proc.getBuiltinModule('fs') : (proc.mainModule ? proc.mainModule.require('fs') : null);
        const pathModule = proc.getBuiltinModule ? proc.getBuiltinModule('path') : (proc.mainModule ? proc.mainModule.require('path') : null);
        if (fsModule && pathModule) {
          const ladderPath = pathModule.resolve(proc.cwd(), 'data/ladder_lv60.json');
          if (fsModule.existsSync(ladderPath)) {
            return JSON.parse(fsModule.readFileSync(ladderPath, 'utf8'));
          }
        }
      }
    } catch (e3) {}
    return [];
  })();

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
  const VALID_WIKI_SUBTABS = ['skills', 'subskills', 'ingredients', 'values', 'ratings', 'islands', 'items'];

  const STORAGE_KEY_SKILLS_CATEGORY = 'pksleep_wiki_skills_category';
  const VALID_SKILLS_CATEGORIES = ['all', 'energy', 'energy_heal', 'ingredient', 'special', 'shards'];

  const STORAGE_KEY_ITEMS_CATEGORY = 'pksleep_wiki_items_category';
  const VALID_ITEMS_CATEGORIES = ['all', 'evolution', 'training', 'biscuit', 'supply'];

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

  function getSavedSkillsCategory() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_SKILLS_CATEGORY);
        if (VALID_SKILLS_CATEGORIES.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'all';
  }

  function getSavedItemsCategory() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_ITEMS_CATEGORY);
        if (VALID_ITEMS_CATEGORIES.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'all';
  }

  let currentWikiSubTab = getSavedWikiSubTab();
  let currentSkillsCategory = getSavedSkillsCategory();
  let currentItemsCategory = getSavedItemsCategory();
  let currentItemsSearchQuery = '';
