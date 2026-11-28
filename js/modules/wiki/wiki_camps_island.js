  function getSavedIslandId() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_ISLAND_ID);
        if (saved && ISLANDS_DATA.some(i => i.id === saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'greengrass';
  }

  function getSavedIslandExpertMode() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        return storage.getItem(STORAGE_KEY_ISLAND_EXPERT) === 'true';
      }
    } catch (e) {}
    return false;
  }

  function getSavedIslandSleepType() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_ISLAND_SLEEP_TYPE);
        if (['all', 'dozing', 'snoozing', 'slumbering'].includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'all';
  }

  const STORAGE_KEY_ISLAND_LEGENDARY = 'pksleep_active_island_legendary_only';

  const LEGENDARY_POKEMON_SET = new Set([
    '雷公', '炎帝', '水君', '超夢', '夢幻', '拉帝亞斯', '拉帝歐斯', '克雷色利亞', '達克萊伊',
    '急凍鳥', '閃電鳥', '火焰鳥', '洛奇亞', '鳳王', '雪拉比', '蓋歐卡', '固拉多', '烈空坐', '基拉祈', '代歐奇希斯'
  ]);
  const LEGENDARY_POKEMON_EN_SET = new Set([
    'Raikou', 'Entei', 'Suicune', 'Mewtwo', 'Mew', 'Latias', 'Latios', 'Cresselia', 'Darkrai',
    'Articuno', 'Zapdos', 'Moltres', 'Lugia', 'Ho-Oh', 'Celebi', 'Kyogre', 'Groudon', 'Rayquaza', 'Jirachi', 'Deoxys'
  ]);

  function isLegendaryPokemon(p) {
    if (!p) return false;
    return LEGENDARY_POKEMON_SET.has(p.name) || LEGENDARY_POKEMON_EN_SET.has(p.name_en);
  }

  function getSavedIslandLegendaryOnly() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        return storage.getItem(STORAGE_KEY_ISLAND_LEGENDARY) === 'true';
      }
    } catch (e) {}
    return false;
  }

  let currentIslandId = getSavedIslandId();
  let isExpertModeActive = getSavedIslandExpertMode();
  let currentIslandSleepType = getSavedIslandSleepType();
  let isIslandLegendaryOnly = getSavedIslandLegendaryOnly();
  const STORAGE_KEY_ISLAND_SLEEP_REWARDS = 'pksleep_island_show_sleep_rewards';

  function getSavedIslandSleepRewards() {
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (!storage) return true;
      const v = storage.getItem(STORAGE_KEY_ISLAND_SLEEP_REWARDS);
      if (v === null) {
        const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
        return !isMobileH5;
      }
      return v === 'true';
    } catch (e) {
      return true;
    }
  }

  let isIslandSleepRewardsVisible = getSavedIslandSleepRewards();

  function toggleIslandSleepRewards(checked) {
    isIslandSleepRewardsVisible = typeof checked === 'boolean' ? checked : !isIslandSleepRewardsVisible;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_SLEEP_REWARDS, isIslandSleepRewardsVisible ? 'true' : 'false');
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  let islandSpawnsSortCol = null;
  let islandSpawnsSortDir = null;

  function toggleIslandLegendaryOnly(checked) {
    isIslandLegendaryOnly = typeof checked === 'boolean' ? checked : !isIslandLegendaryOnly;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_LEGENDARY, isIslandLegendaryOnly ? 'true' : 'false');
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  function selectIsland(islandId, isExpert = false) {
    if (!islandId) return;
    currentIslandId = islandId;
    isExpertModeActive = !!isExpert;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_ID, islandId);
        storage.setItem(STORAGE_KEY_ISLAND_EXPERT, String(!!isExpert));
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  function toggleIslandExpertMode() {
    const island = ISLANDS_DATA.find(i => i.id === currentIslandId);
    if (!island || !island.hasExpertMode) {
      currentIslandId = 'greengrass';
      isExpertModeActive = true;
    } else {
      isExpertModeActive = !isExpertModeActive;
    }
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_ID, currentIslandId);
        storage.setItem(STORAGE_KEY_ISLAND_EXPERT, String(isExpertModeActive));
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  const POKEMON_SPRITE_FALLBACK = {
    "妙蛙種子": "001", "Bulbasaur": "001", "bulbasaur": "001", "妙蛙草": "002", "Ivysaur": "002", "ivysaur": "002",
    "妙蛙花": "003", "Venusaur": "003", "venusaur": "003", "小火龍": "004", "Charmander": "004", "charmander": "004",
    "火恐龍": "005", "Charmeleon": "005", "charmeleon": "005", "噴火龍": "006", "Charizard": "006", "charizard": "006",
    "傑尼龜": "007", "Squirtle": "007", "squirtle": "007", "卡咪龜": "008", "Wartortle": "008", "wartortle": "008",
    "水箭龜": "009", "Blastoise": "009", "blastoise": "009", "綠毛蟲": "010", "Caterpie": "010", "caterpie": "010",
    "鐵甲蛹": "011", "Metapod": "011", "metapod": "011", "巴大蝶": "012", "Butterfree": "012", "butterfree": "012",
    "小拉達": "019", "Rattata": "019", "rattata": "019", "拉達": "020", "Raticate": "020", "raticate": "020",
    "阿柏蛇": "023", "Ekans": "023", "ekans": "023", "阿柏怪": "024", "Arbok": "024", "arbok": "024",
    "皮丘": "172", "Pichu": "172", "pichu": "172", "皮卡丘": "025", "Pikachu": "025", "pikachu": "025",
    "皮卡丘（萬聖節）": "025-halloween", "皮卡丘 (萬聖節)": "025-halloween", "Pikachu (Halloween)": "025-halloween", "pikachu (halloween)": "025-halloween", "皮卡丘（佳節）": "025-holiday", "皮卡丘 (佳節)": "025-holiday",
    "Pikachu (Holiday)": "025-holiday", "pikachu (holiday)": "025-holiday", "皮卡丘（船長）": "025-captain", "皮卡丘 (船長)": "025-captain", "Pikachu (Captain)": "025-captain", "pikachu (captain)": "025-captain",
    "雷丘": "026", "Raichu": "026", "raichu": "026", "穿山鼠": "027", "Sandshrew": "027", "sandshrew": "027",
    "穿山王": "028", "Sandslash": "028", "sandslash": "028", "皮寶寶": "173", "Cleffa": "173", "cleffa": "173",
    "皮皮": "035", "Clefairy": "035", "clefairy": "035", "皮可西": "036", "Clefable": "036", "clefable": "036",
    "六尾": "037", "Vulpix": "037", "vulpix": "037", "六尾（阿羅拉的樣子）": "037-alolanvulpix", "六尾 (阿羅拉的樣子)": "037-alolanvulpix", "Vulpix (Alolan Form)": "037-alolanvulpix",
    "vulpix (alolan form)": "037-alolanvulpix", "九尾": "038", "Ninetales": "038", "ninetales": "038", "九尾（阿羅拉的樣子）": "038-alolanninetales", "九尾 (阿羅拉的樣子)": "038-alolanninetales",
    "Ninetales (Alolan Form)": "038-alolanninetales", "ninetales (alolan form)": "038-alolanninetales", "寶寶丁": "174", "Igglybuff": "174", "igglybuff": "174", "胖丁": "039",
    "Jigglypuff": "039", "jigglypuff": "039", "胖可丁": "040", "Wigglytuff": "040", "wigglytuff": "040", "地鼠": "050",
    "Diglett": "050", "diglett": "050", "三地鼠": "051", "Dugtrio": "051", "dugtrio": "051", "喵喵": "052",
    "Meowth": "052", "meowth": "052", "貓老大": "053", "Persian": "053", "persian": "053", "可達鴨": "054",
    "Psyduck": "054", "psyduck": "054", "哥達鴨": "055", "Golduck": "055", "golduck": "055", "猴怪": "056",
    "Mankey": "056", "mankey": "056", "火爆猴": "057", "Primeape": "057", "primeape": "057", "卡蒂狗": "058",
    "Growlithe": "058", "growlithe": "058", "風速狗": "059", "Arcanine": "059", "arcanine": "059", "喇叭芽": "069",
    "Bellsprout": "069", "bellsprout": "069", "口呆花": "070", "Weepinbell": "070", "weepinbell": "070", "大食花": "071",
    "Victreebel": "071", "victreebel": "071", "小拳石": "074", "Geodude": "074", "geodude": "074", "隆隆石": "075",
    "Graveler": "075", "graveler": "075", "隆隆岩": "076", "Golem": "076", "golem": "076", "呆呆獸": "079",
    "Slowpoke": "079", "slowpoke": "079", "呆殼獸": "080", "Slowbro": "080", "slowbro": "080", "呆呆王": "199",
    "Slowking": "199", "slowking": "199", "小磁怪": "081", "Magnemite": "081", "magnemite": "081", "三合一磁怪": "082",
    "Magneton": "082", "magneton": "082", "自爆磁怪": "462", "Magnezone": "462", "magnezone": "462", "大蔥鴨": "083",
    "Farfetch'd": "083", "farfetch'd": "083", "嘟嘟": "084", "Doduo": "084", "doduo": "084", "嘟嘟利": "085",
    "Dodrio": "085", "dodrio": "085", "鬼斯": "092", "Gastly": "092", "gastly": "092", "鬼斯通": "093",
    "Haunter": "093", "haunter": "093", "耿鬼": "094", "Gengar": "094", "gengar": "094", "大岩蛇": "095",
    "Onix": "095", "onix": "095", "大綱蛇": "208", "Steelix": "208", "steelix": "208", "卡拉卡拉": "104",
    "Cubone": "104", "cubone": "104", "嘎啦嘎啦": "105", "Marowak": "105", "marowak": "105", "小福蛋": "440",
    "Happiny": "440", "happiny": "440", "吉利蛋": "113", "Chansey": "113", "chansey": "113", "幸福蛋": "242",
    "Blissey": "242", "blissey": "242", "袋獸": "115", "Kangaskhan": "115", "kangaskhan": "115", "魔尼尼": "439",
    "Mime Jr.": "439", "mime jr.": "439", "魔牆人偶": "122", "Mr. Mime": "122", "mr. mime": "122", "凱羅斯": "127",
    "Pinsir": "127", "pinsir": "127", "百變怪": "132", "Ditto": "132", "ditto": "132", "伊布": "133",
    "Eevee": "133", "eevee": "133", "伊布（佳節）": "133-holiday", "伊布 (佳節)": "133-holiday", "Eevee (Holiday)": "133-holiday", "eevee (holiday)": "133-holiday",
    "伊布（萬聖節）": "133-halloween", "伊布 (萬聖節)": "133-halloween", "Eevee (Halloween)": "133-halloween", "eevee (halloween)": "133-halloween", "水伊布": "134", "Vaporeon": "134",
    "vaporeon": "134", "雷伊布": "135", "Jolteon": "135", "jolteon": "135", "火伊布": "136", "Flareon": "136",
    "flareon": "136", "太陽伊布": "196", "Espeon": "196", "espeon": "196", "月亮伊布": "197", "Umbreon": "197",
    "umbreon": "197", "葉伊布": "470", "Leafeon": "470", "leafeon": "470", "冰伊布": "471", "Glaceon": "471",
    "glaceon": "471", "仙子伊布": "700", "Sylveon": "700", "sylveon": "700", "迷你龍": "147", "Dratini": "147",
    "dratini": "147", "哈克龍": "148", "Dragonair": "148", "dragonair": "148", "快龍": "149", "Dragonite": "149",
    "dragonite": "149", "超夢": "150", "Mewtwo": "150", "mewtwo": "150", "夢幻": "151", "Mew": "151",
    "mew": "151", "菊草葉": "152", "Chikorita": "152", "chikorita": "152", "月桂葉": "153", "Bayleef": "153",
    "bayleef": "153", "大竺葵": "154", "Meganium": "154", "meganium": "154", "火球鼠": "155", "Cyndaquil": "155",
    "cyndaquil": "155", "火岩鼠": "156", "Quilava": "156", "quilava": "156", "火爆獸": "157", "Typhlosion": "157",
    "typhlosion": "157", "小鋸鱷": "158", "Totodile": "158", "totodile": "158", "藍鱷": "159", "Croconaw": "159",
    "croconaw": "159", "大力鱷": "160", "Feraligatr": "160", "feraligatr": "160", "波克比": "175", "Togepi": "175",
    "togepi": "175", "波克基古": "176", "Togetic": "176", "togetic": "176", "波克基斯": "468", "Togekiss": "468",
    "togekiss": "468", "天然雀": "177", "Natu": "177", "natu": "177", "天然鳥": "178", "Xatu": "178",
    "xatu": "178", "咩利羊": "179", "Mareep": "179", "mareep": "179", "茸茸羊": "180", "Flaaffy": "180",
    "flaaffy": "180", "電龍": "181", "Ampharos": "181", "ampharos": "181", "盆才怪": "438", "Bonsly": "438",
    "bonsly": "438", "樹才怪": "185", "Sudowoodo": "185", "sudowoodo": "185", "烏波": "194", "Wooper": "194",
    "wooper": "194", "烏波（帕底亞的樣子）": "194-paldeanwooper", "烏波 (帕底亞的樣子)": "194-paldeanwooper", "Wooper (Paldea Form)": "194-paldeanwooper", "wooper (paldea form)": "194-paldeanwooper", "沼王": "195",
    "Quagsire": "195", "quagsire": "195", "土王": "980", "Clodsire": "980", "clodsire": "980", "黑暗鴉": "198",
    "Murkrow": "198", "murkrow": "198", "烏鴉頭頭": "430", "Honchkrow": "430", "honchkrow": "430", "小果然": "360",
    "Wynaut": "360", "wynaut": "360", "果然翁": "202", "Wobbuffet": "202", "wobbuffet": "202", "夢妖": "200",
    "Misdreavus": "200", "misdreavus": "200", "夢妖魔": "429", "Mismagius": "429", "mismagius": "429", "壺壺": "213",
    "Shuckle": "213", "shuckle": "213", "赫拉克羅斯": "214", "Heracross": "214", "heracross": "214", "狃拉": "215",
    "Sneasel": "215", "sneasel": "215", "瑪狃拉": "461", "Weavile": "461", "weavile": "461", "信使鳥": "225",
    "Delibird": "225", "delibird": "225", "戴魯比": "228", "Houndour": "228", "houndour": "228", "黑魯加": "229",
    "Houndoom": "229", "houndoom": "229", "雷公": "243", "Raikou": "243", "raikou": "243", "炎帝": "244",
    "Entei": "244", "entei": "244", "水君": "245", "Suicune": "245", "suicune": "245", "幼基拉斯": "246",
    "Larvitar": "246", "larvitar": "246", "沙基拉斯": "247", "Pupitar": "247", "pupitar": "247", "班基拉斯": "248",
    "Tyranitar": "248", "tyranitar": "248", "木守宮": "252", "Treecko": "252", "treecko": "252", "森林蜥蜴": "253",
    "Grovyle": "253", "grovyle": "253", "蜥蜴王": "254", "Sceptile": "254", "sceptile": "254", "火稚雞": "255",
    "Torchic": "255", "torchic": "255", "力壯雞": "256", "Combusken": "256", "combusken": "256", "火焰雞": "257",
    "Blaziken": "257", "blaziken": "257", "水躍魚": "258", "Mudkip": "258", "mudkip": "258", "沼躍魚": "259",
    "Marshtomp": "259", "marshtomp": "259", "巨沼怪": "260", "Swampert": "260", "swampert": "260", "拉魯拉絲": "280",
    "Ralts": "280", "ralts": "280", "奇鲁莉安": "281", "Kirlia": "281", "kirlia": "281", "沙奈朵": "282",
    "Gardevoir": "282", "gardevoir": "282", "艾路雷朵": "475", "Gallade": "475", "gallade": "475", "懶人獺": "287",
    "Slakoth": "287", "slakoth": "287", "過動猿": "288", "Vigoroth": "288", "vigoroth": "288", "請假王": "289",
    "Slaking": "289", "slaking": "289", "勾魂眼": "302", "Sableye": "302", "sableye": "302", "大嘴娃": "303",
    "Mawile": "303", "mawile": "303", "可可多拉": "304", "Aron": "304", "aron": "304", "可多拉": "305",
    "Lairon": "305", "lairon": "305", "波士可多拉": "306", "Aggron": "306", "aggron": "306", "正電拍拍": "311",
    "Plusle": "311", "plusle": "311", "負電拍拍": "312", "Minun": "312", "minun": "312", "溶食獸": "316",
    "Gulpin": "316", "gulpin": "316", "吞食獸": "317", "Swalot": "317", "swalot": "317", "大顎蟻": "328",
    "Trapinch": "328", "trapinch": "328", "超音波幼蟲": "329", "Vibrava": "329", "vibrava": "329", "沙漠蜻蜓": "330",
    "Flygon": "330", "flygon": "330", "青綿鳥": "333", "Swablu": "333", "swablu": "333", "七夕青鳥": "334",
    "Altaria": "334", "altaria": "334", "怨影娃娃": "353", "Shuppet": "353", "shuppet": "353", "詛咒娃娃": "354",
    "Banette": "354", "banette": "354", "阿勃梭魯": "359", "Absol": "359", "absol": "359", "海豹球": "363",
    "Spheal": "363", "spheal": "363", "海豹球（佳節）": "363-holiday", "海豹球 (佳節)": "363-holiday", "Spheal (Holiday)": "363-holiday", "spheal (holiday)": "363-holiday",
    "海魔獅": "364", "Sealeo": "364", "sealeo": "364", "帝牙海獅": "365", "Walrein": "365", "walrein": "365",
    "寶貝龍": "371", "Bagon": "371", "bagon": "371", "甲殼龍": "372", "Shelgon": "372", "shelgon": "372",
    "暴飛龍": "373", "Salamence": "373", "salamence": "373", "拉帝亞斯": "380", "Latias": "380", "latias": "380",
    "拉帝歐斯": "381", "Latios": "381", "latios": "381", "草苗龜": "387", "Turtwig": "387", "turtwig": "387",
    "樹林龜": "388", "Grotle": "388", "grotle": "388", "土台龜": "389", "Torterra": "389", "torterra": "389",
    "小火焰猴": "390", "Chimchar": "390", "chimchar": "390", "猛火猴": "391", "Monferno": "391", "monferno": "391",
    "烈焰猴": "392", "Infernape": "392", "infernape": "392", "波加曼": "393", "Piplup": "393", "piplup": "393",
    "波皇子": "394", "Prinplup": "394", "prinplup": "394", "帝王拿波": "395", "Empoleon": "395", "empoleon": "395",
    "小貓怪": "403", "Shinx": "403", "shinx": "403", "勒克貓": "404", "Luxio": "404", "luxio": "404",
    "倫琴貓": "405", "Luxray": "405", "luxray": "405", "飄飄球": "425", "Drifloon": "425", "drifloon": "425",
    "隨風球": "426", "Drifblim": "426", "drifblim": "426", "花岩怪": "442", "Spiritomb": "442", "spiritomb": "442",
    "利歐路": "447", "Riolu": "447", "riolu": "447", "路卡利歐": "448", "Lucario": "448", "lucario": "448",
    "不良蛙": "453", "Croagunk": "453", "croagunk": "453", "毒骷蛙": "454", "Toxicroak": "454", "toxicroak": "454",
    "雪笠怪": "459", "Snover": "459", "snover": "459", "暴雪王": "460", "Abomasnow": "460", "abomasnow": "460",
    "克雷色利亞": "488", "Cresselia": "488", "cresselia": "488", "達克萊伊": "491", "Darkrai": "491", "darkrai": "491",
    "食夢夢": "517", "Munna": "517", "munna": "517", "夢夢蝕": "518", "Musharna": "518", "musharna": "518",
    "木棉球": "546", "Cottonee": "546", "cottonee": "546", "風妖精": "547", "Whimsicott": "547", "whimsicott": "547",
    "石居蟹": "557", "Dwebble": "557", "dwebble": "557", "岩殿居蟹": "558", "Crustle": "558", "crustle": "558",
    "哎呀球菇": "590", "Foongus": "590", "foongus": "590", "敗露球菇": "591", "Amoonguss": "591", "amoonguss": "591",
    "毛頭小鷹": "627", "Rufflet": "627", "rufflet": "627", "勇士雄鷹": "628", "Braviary": "628", "braviary": "628",
    "寶寶暴龍": "696", "Tyrunt": "696", "tyrunt": "696", "怪顎龍": "697", "Tyrantrum": "697", "tyrantrum": "697",
    "摔角鷹人": "701", "Hawlucha": "701", "hawlucha": "701", "咚咚鼠": "702", "Dedenne": "702", "dedenne": "702",
    "南瓜精 (小顆種)": "710", "南瓜精（小顆種）": "710", "Pumpkaboo (Small Variety)": "710", "pumpkaboo (small variety)": "710", "南瓜精 (中顆種)": "710", "南瓜精（中顆種）": "710",
    "Pumpkaboo (Medium Variety)": "710", "pumpkaboo (medium variety)": "710", "南瓜精 (大顆種)": "710", "南瓜精（大顆種）": "710", "Pumpkaboo (Large Variety)": "710", "pumpkaboo (large variety)": "710",
    "南瓜精 (巨顆種)": "710", "南瓜精（巨顆種）": "710", "Pumpkaboo (Jumbo Variety)": "710", "pumpkaboo (jumbo variety)": "710", "南瓜怪人 (小顆種)": "711", "南瓜怪人（小顆種）": "711",
    "Gourgeist (Small Variety)": "711", "gourgeist (small variety)": "711", "南瓜怪人 (中顆種)": "711", "南瓜怪人（中顆種）": "711", "Gourgeist (Medium Variety)": "711", "gourgeist (medium variety)": "711",
    "南瓜怪人 (大顆種)": "711", "南瓜怪人（大顆種）": "711", "Gourgeist (Large Variety)": "711", "gourgeist (large variety)": "711", "南瓜怪人 (巨顆種)": "711", "南瓜怪人（巨顆種）": "711",
    "Gourgeist (Jumbo Variety)": "711", "gourgeist (jumbo variety)": "711", "嗡蝠": "714", "Noibat": "714", "noibat": "714", "音波龍": "715",
    "Noivern": "715", "noivern": "715", "強顎雞母蟲": "736", "Grubbin": "736", "grubbin": "736", "蟲電寶": "737",
    "Charjabug": "737", "charjabug": "737", "鍬農炮蟲": "738", "Vikavolt": "738", "vikavolt": "738", "萌虻": "742",
    "Cutiefly": "742", "cutiefly": "742", "蝶結萌虻": "743", "Ribombee": "743", "ribombee": "743", "童偶熊": "759",
    "Stufful": "759", "stufful": "759", "穿著熊": "760", "Bewear": "760", "bewear": "760", "花療環環": "764",
    "Comfey": "764", "comfey": "764", "托戈德瑪爾": "777", "Togedemaru": "777", "togedemaru": "777", "謎擬Q": "778",
    "Mimikyu": "778", "mimikyu": "778", "老翁龍": "780", "Drampa": "780", "drampa": "780", "古月鳥": "845",
    "Cramorant": "845", "cramorant": "845", "毒電嬰": "848", "Toxel": "848", "toxel": "848", "顫弦蠑螈（高調的樣子）": "849",
    "顫弦蠑螈 (高調的樣子)": "849", "Toxtricity (Amped Form)": "849", "toxtricity (amped form)": "849", "顫弦蠑螈（低調的樣子）": "849-toxtricitylowkeyform", "顫弦蠑螈 (低調的樣子)": "849-toxtricitylowkeyform", "Toxtricity (Low Key Form)": "849-toxtricitylowkeyform",
    "toxtricity (low key form)": "849-toxtricitylowkeyform", "新葉喵": "906", "Sprigatito": "906", "sprigatito": "906", "蒂蕾喵": "907", "Floragato": "907",
    "floragato": "907", "魔幻假面喵": "908", "Meowscarada": "908", "meowscarada": "908", "呆火鱷": "909", "Fuecoco": "909",
    "fuecoco": "909", "炙燙鱷": "910", "Crocalor": "910", "crocalor": "910", "骨紋巨聲鱷": "911", "Skeledirge": "911",
    "skeledirge": "911", "潤水鴨": "912", "Quaxly": "912", "quaxly": "912", "湧躍鴨": "913", "Quaxwell": "913",
    "quaxwell": "913", "狂歡浪舞鴨": "914", "Quaquaval": "914", "quaquaval": "914", "布撥": "921", "Pawmi": "921",
    "pawmi": "921", "布土撥": "922", "Pawmo": "922", "pawmo": "922", "巴布土撥": "923", "Pawmot": "923",
    "pawmot": "923", "小鍛匠": "957", "Tinkatink": "957", "tinkatink": "957", "巧鍛匠": "958", "Tinkatuff": "958",
    "tinkatuff": "958", "巨鍛匠": "959", "Tinkaton": "959", "tinkaton": "959", "走鯨": "974", "Cetoddle": "974",
    "cetoddle": "974", "浩大鯨": "975", "Cetitan": "975", "cetitan": "975", "南瓜精": "710", "Pumpkaboo": "710",
    "pumpkaboo": "710", "南瓜怪人": "711", "Gourgeist": "711", "gourgeist": "711", "大鋼蛇": "208", "奇魯莉安": "281"
  };

  function getActiveIslandSpawns(island, isExpert) {
    if (isExpert && island && island.expertMode && island.expertMode.spawns) {
      return island.expertMode.spawns;
    }
    return (island && island.spawns) ? island.spawns : { dozing: [], snoozing: [], slumbering: [] };
  }

  function getPokemonAvatarUrl(pOrName, name_en) {
    if (typeof window !== 'undefined' && typeof window.getItemIcon === 'function') {
      const arg = (pOrName && typeof pOrName === 'object') ? pOrName : { name: pOrName, name_en: name_en };
      const url = window.getItemIcon(arg);
      if (url && !url.startsWith('data:image/svg+xml')) return url;
    }
    const name = (pOrName && typeof pOrName === 'object') ? (pOrName.name_cn || pOrName.name) : pOrName;
    const nEn = (pOrName && typeof pOrName === 'object') ? pOrName.name_en : name_en;
    const normFull = name ? String(name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
    const normHalf = name ? String(name).replace(/（/g, ' (').replace(/）/g, ')') : '';
    const nEnLower = nEn ? String(nEn).toLowerCase() : '';
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
      const idx = _getWikiPkmIndex(window.allPokemons);
      const p = (name && idx['cn:' + name]) || (normFull && idx['cn:' + normFull]) || (normHalf && idx['cn:' + normHalf]) || (nEn && (idx['en:' + nEn] || idx['en:' + nEnLower]));
      if (p) {
        if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
        if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;
        if (p.formatted_no) return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
      }
    }
    const dex = (name && POKEMON_SPRITE_FALLBACK[name]) ||
                (normFull && POKEMON_SPRITE_FALLBACK[normFull]) ||
                (normHalf && POKEMON_SPRITE_FALLBACK[normHalf]) ||
                (nEn && (POKEMON_SPRITE_FALLBACK[nEn] || POKEMON_SPRITE_FALLBACK[nEnLower]));
    if (dex) {
      return `https://www.serebii.net/pokemonsleep/pokemon/icon/${dex}.png`;
    }
    return '';
  }

  function getIslandPokemonDexCode(p) {
    if (!p) return '';
    const name = p.name_cn || p.name || '';
    const normFull = name ? String(name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
    const normHalf = name ? String(name).replace(/（/g, ' (').replace(/）/g, ')') : '';
    const nEn = p.name_en || '';
    const nEnLower = nEn ? String(nEn).toLowerCase() : '';
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
      const idx = _getWikiPkmIndex(window.allPokemons);
      const found = (name && idx['cn:' + name]) || (normFull && idx['cn:' + normFull]) || (normHalf && idx['cn:' + normHalf]) || (nEn && (idx['en:' + nEn] || idx['en:' + nEnLower]));
      if (found) {
        if (found.icon_url && typeof found.icon_url === 'string') {
          const m = found.icon_url.match(/\/icon\/([^/.]+)\.png$/);
          if (m) return m[1];
        }
        if (found.formatted_no) return String(found.formatted_no);
      }
    }
    return (name && POKEMON_SPRITE_FALLBACK[name]) ||
           (normFull && POKEMON_SPRITE_FALLBACK[normFull]) ||
           (normHalf && POKEMON_SPRITE_FALLBACK[normHalf]) ||
           (nEn && (POKEMON_SPRITE_FALLBACK[nEn] || POKEMON_SPRITE_FALLBACK[nEnLower])) ||
           '';
  }

  function getIslandPokemonDexOrder(p) {
    if (!p) return 9999999;
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    if (gc && typeof gc.getOfficialPokemonDexOrder === 'function' && typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
      const name = p.name_cn || p.name || '';
      const normFull = name ? String(name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
      const normHalf = name ? String(name).replace(/（/g, ' (').replace(/）/g, ')') : '';
      const nEn = p.name_en || '';
      const nEnLower = nEn ? String(nEn).toLowerCase() : '';
      const idx = _getWikiPkmIndex(window.allPokemons);
      const found = (name && idx['cn:' + name]) || (normFull && idx['cn:' + normFull]) || (normHalf && idx['cn:' + normHalf]) || (nEn && (idx['en:' + nEn] || idx['en:' + nEnLower]));
      if (found) return gc.getOfficialPokemonDexOrder(found);
    }
    const rawDex = getIslandPokemonDexCode(p);
    const num = parseInt(rawDex, 10);
    const base = isNaN(num) ? 9999 : num;
    const isForm = String(rawDex).includes('-') || (p.name && (p.name.includes('樣子') || p.name.includes('低調') || p.name.includes('萬聖節') || p.name.includes('佳節') || p.name.includes('船長')));
    return base * 100 + (isForm ? 1 : 0);
  }

  function filterIslandSleepType(sleepType) {
    if (!['all', 'dozing', 'snoozing', 'slumbering'].includes(sleepType)) return;
    currentIslandSleepType = sleepType;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_SLEEP_TYPE, sleepType);
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  const _rankScoreCache = Object.create(null);

  function getSnorlaxRankScore(rankStr) {
    if (!rankStr || rankStr === '-' || rankStr.trim() === '') return -1;
    const cached = _rankScoreCache[rankStr];
    if (cached !== undefined) return cached;
    const parts = rankStr.trim().split(/\s+/);
    const tier = (parts[0] || '').toLowerCase();
    const num = parseInt(parts[1], 10) || 0;
    let score = 0;
    if (tier === 'basic') score = 100 + num;
    else if (tier === 'great') score = 200 + num;
    else if (tier === 'ultra') score = 300 + num;
    else if (tier === 'master') score = 400 + num;
    _rankScoreCache[rankStr] = score;
    return score;
  }

  function sortIslandSpawns(col) {
    if (!['pokemon', 's1', 's2', 's3', 's4'].includes(col)) return;
    if (islandSpawnsSortCol === col) {
      if (islandSpawnsSortDir === 'desc') {
        islandSpawnsSortDir = 'asc';
      } else if (islandSpawnsSortDir === 'asc') {
        islandSpawnsSortCol = null;
        islandSpawnsSortDir = null;
      } else {
        islandSpawnsSortDir = 'desc';
      }
    } else {
      islandSpawnsSortCol = col;
      islandSpawnsSortDir = 'desc';
    }
    refreshIslandsSubpanel();
  }

  function getIslandSpawnsSort() {
    return { col: islandSpawnsSortCol, dir: islandSpawnsSortDir };
  }

  function islandSceneSrc(island) {
    const basePath = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) || '';
    const rel = island && (island.imageScene || island.image);
    if (!rel) return '';
    if (/^https?:\/\//.test(rel)) return rel;
    return `${basePath}${rel}`;
  }

  function ensureIslandSceneLayer(host) {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return null;
    let layer = document.querySelector('.island-scene-layer');
    if (!layer && typeof document.createElement === 'function') {
      layer = document.createElement('div');
      layer.className = 'island-scene-layer';
      layer.setAttribute('aria-hidden', 'true');
      layer.innerHTML = '<img class="island-scene-photo" width="2560" height="1372" decoding="async" alt=""><div class="island-scene-fade"></div>';
    }
    if (!layer) return null;
    if (host && layer.parentElement !== host && typeof host.insertBefore === 'function') {
      host.insertBefore(layer, host.firstChild);
    }
    if (typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.island-scene-layer').forEach(el => {
        if (el !== layer && el.remove) el.remove();
      });
    }
    return layer;
  }

  function placeIslandSceneLayer() {
    const isH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const panelWiki = document.getElementById('panel-wiki');
    const islandsPanel = document.getElementById('wiki-subpanel-islands');
    const clearHost = (el) => {
      if (!el) return;
      el.style.backgroundImage = '';
      el.classList.remove('island-scene-host');
      el.classList.remove('has-island-scene');
    };
    if (typeof document.querySelectorAll !== 'function' || typeof document.querySelector !== 'function') return;
    if (currentWikiSubTab !== 'islands') {
      clearHost(panelWiki);
      clearHost(islandsPanel);
      document.querySelectorAll('.island-scene-layer').forEach(el => {
        if (el.classList) el.classList.add('island-scene-hidden');
      });
      return;
    }
    const host = isH5 ? islandsPanel : panelWiki;
    if (!host) return;
    const layer = ensureIslandSceneLayer(host);
    if (!layer) return;
    const island = ISLANDS_DATA.find(i => i.id === currentIslandId) || ISLANDS_DATA[0];
    const src = islandSceneSrc(island);
    if (layer.classList) layer.classList.remove('island-scene-hidden');
    const img = layer.querySelector && layer.querySelector('.island-scene-photo');
    if (img && src) img.src = src;
    host.classList.add('has-island-scene');
    if (panelWiki !== host) clearHost(panelWiki);
    if (islandsPanel !== host) clearHost(islandsPanel);
  }

  function scrollActiveIslandTabIntoView() {
    const strip = typeof document !== 'undefined' && document.querySelector
      ? document.querySelector('#wiki-subpanel-islands .island-nav-strip')
      : null;
    if (!strip) return;
    const active = strip.querySelector && strip.querySelector('.island-tab-btn.active');
    if (!active || typeof active.getBoundingClientRect !== 'function') return;
    const stripRect = strip.getBoundingClientRect();
    const btnRect = active.getBoundingClientRect();
    const pad = 12;
    if (btnRect.left < stripRect.left) {
      strip.scrollLeft += (btnRect.left - stripRect.left) - pad;
    } else if (btnRect.right > stripRect.right) {
      strip.scrollLeft += (btnRect.right - stripRect.right) + pad;
    }
  }

  let islandSpawnsTouchY = 0;

  // --- 8.5. 島嶼睡姿未收集清單追蹤與今晚推薦睡眠類型 (Sleep Style Uncollected Tracker) ---
  const STORAGE_KEY_COLLECTED_SLEEP_STYLES = 'pksleep_collected_sleep_styles_v1';
  const STORAGE_KEY_ISLAND_UNCOLLECTED_ONLY = 'pksleep_island_uncollected_only';

  function _getIslandStorage() {
    try {
      return (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
    } catch (e) {
      return null;
    }
  }

  function loadCollectedSleepStylesSet() {
    const set = new Set();
    try {
      const storage = _getIslandStorage();
      if (storage) {
        const raw = storage.getItem(STORAGE_KEY_COLLECTED_SLEEP_STYLES);
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            arr.forEach(k => { if (typeof k === 'string' && k) set.add(k); });
          }
        }
      }
    } catch (e) {}
    return set;
  }

  function getSavedIslandUncollectedOnly() {
    try {
      const storage = _getIslandStorage();
      if (storage) {
        return storage.getItem(STORAGE_KEY_ISLAND_UNCOLLECTED_ONLY) === 'true';
      }
    } catch (e) {}
    return false;
  }

  let collectedSleepStylesSet = loadCollectedSleepStylesSet();
  let isIslandUncollectedOnly = getSavedIslandUncollectedOnly();

  function saveCollectedSleepStylesSet() {
    try {
      const storage = _getIslandStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY_COLLECTED_SLEEP_STYLES, JSON.stringify(Array.from(collectedSleepStylesSet)));
      }
    } catch (e) {}
  }

  function getCollectedSleepStyleKey(pkmName, star) {
    if (!pkmName || !star) return '';
    return String(pkmName).trim() + ':' + Number(star);
  }

  function isSleepStyleCollected(pkmName, star) {
    const key = getCollectedSleepStyleKey(pkmName, star);
    return key ? collectedSleepStylesSet.has(key) : false;
  }

  function toggleCollectedSleepStyle(pkmName, star, event) {
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    const key = getCollectedSleepStyleKey(pkmName, star);
    if (!key) return false;
    if (collectedSleepStylesSet.has(key)) {
      collectedSleepStylesSet.delete(key);
    } else {
      collectedSleepStylesSet.add(key);
    }
    saveCollectedSleepStylesSet();
    refreshIslandsSubpanel();
    return collectedSleepStylesSet.has(key);
  }

  function setCollectedSleepStyles(keysArray) {
    collectedSleepStylesSet = new Set(Array.isArray(keysArray) ? keysArray.filter(Boolean) : []);
    saveCollectedSleepStylesSet();
    refreshIslandsSubpanel();
  }

  function toggleIslandUncollectedOnly(checked) {
    isIslandUncollectedOnly = typeof checked === 'boolean' ? checked : !isIslandUncollectedOnly;
    try {
      const storage = _getIslandStorage();
      if (storage) {
        storage.setItem(STORAGE_KEY_ISLAND_UNCOLLECTED_ONLY, isIslandUncollectedOnly ? 'true' : 'false');
      }
    } catch (e) {}
    refreshIslandsSubpanel();
  }

  function hasUncollectedStylesOnRow(pkmSpawnRow) {
    if (!pkmSpawnRow || !pkmSpawnRow.name) return false;
    const stars = [
      { star: 1, rank: pkmSpawnRow.s1 },
      { star: 2, rank: pkmSpawnRow.s2 },
      { star: 3, rank: pkmSpawnRow.s3 },
      { star: 4, rank: pkmSpawnRow.s4 }
    ];
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (s.rank && s.rank !== '-' && !isSleepStyleCollected(pkmSpawnRow.name, s.star)) {
        return true;
      }
    }
    return false;
  }

  function getIslandSleepStyleStats(islandId, isExpert) {
    const targetId = islandId || currentIslandId || 'greengrass';
    const island = ISLANDS_DATA.find(i => i.id === targetId) || ISLANDS_DATA[0];
    const useExpert = (typeof isExpert === 'boolean') ? isExpert : (targetId === currentIslandId && isExpertModeActive);
    const activeSpawns = getActiveIslandSpawns(island, useExpert);
    const bySleepType = {
      dozing: { total: 0, collected: 0, uncollected: 0 },
      snoozing: { total: 0, collected: 0, uncollected: 0 },
      slumbering: { total: 0, collected: 0, uncollected: 0 }
    };
    if (activeSpawns) {
      ['dozing', 'snoozing', 'slumbering'].forEach(st => {
        const list = Array.isArray(activeSpawns[st]) ? activeSpawns[st] : [];
        list.forEach(p => {
          if (isIslandLegendaryOnly && !isLegendaryPokemon(p)) return;
          [1, 2, 3, 4].forEach(star => {
            const rankStr = p['s' + star];
            if (rankStr && rankStr !== '-') {
              bySleepType[st].total += 1;
              if (isSleepStyleCollected(p.name, star)) {
                bySleepType[st].collected += 1;
              } else {
                bySleepType[st].uncollected += 1;
              }
            }
          });
        });
      });
    }
    const totalStyles = bySleepType.dozing.total + bySleepType.snoozing.total + bySleepType.slumbering.total;
    const collectedStyles = bySleepType.dozing.collected + bySleepType.snoozing.collected + bySleepType.slumbering.collected;
    const uncollectedStyles = totalStyles - collectedStyles;
    const completionPct = totalStyles > 0 ? Math.round((collectedStyles / totalStyles) * 100) : 0;

    let recommendedSleepType = 'dozing';
    let maxUncollected = -1;
    ['dozing', 'snoozing', 'slumbering'].forEach(st => {
      if (bySleepType[st].uncollected > maxUncollected) {
        maxUncollected = bySleepType[st].uncollected;
        recommendedSleepType = st;
      }
    });

    return {
      islandId: targetId,
      totalStyles,
      collectedStyles,
      uncollectedStyles,
      completionPct,
      bySleepType,
      recommendedSleepType,
      recommendedUncollectedCount: Math.max(0, maxUncollected)
    };
  }

  function attachIslandSleepTrackerExports(targetObj, winObj) {
    const api = {
      STORAGE_KEY_COLLECTED_SLEEP_STYLES,
      STORAGE_KEY_ISLAND_UNCOLLECTED_ONLY,
      getCollectedSleepStyleKey,
      isSleepStyleCollected,
      toggleCollectedSleepStyle,
      setCollectedSleepStyles,
      getCollectedSleepStyles: () => Array.from(collectedSleepStylesSet),
      toggleIslandUncollectedOnly,
      getIsIslandUncollectedOnly: () => isIslandUncollectedOnly,
      hasUncollectedStylesOnRow,
      getIslandSleepStyleStats
    };
    if (targetObj) Object.assign(targetObj, api);
    if (winObj) Object.assign(winObj, api);
  }

