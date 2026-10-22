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
    "岩殿居蟹": "558",
    "哎呀球菇": "590",
    "敗露球菇": "591",
    "Foongus": "590",
    "Amoonguss": "591"
  };

  function getPokemonAvatarUrl(pOrName, name_en) {
    if (typeof window !== 'undefined' && typeof window.getItemIcon === 'function') {
      const arg = (pOrName && typeof pOrName === 'object') ? pOrName : { name: pOrName, name_en: name_en };
      const url = window.getItemIcon(arg);
      if (url && !url.startsWith('data:image/svg+xml')) return url;
    }
    const name = (pOrName && typeof pOrName === 'object') ? (pOrName.name_cn || pOrName.name) : pOrName;
    const nEn = (pOrName && typeof pOrName === 'object') ? pOrName.name_en : name_en;
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
      const idx = _getWikiPkmIndex(window.allPokemons);
      const normName = name ? String(name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
      const p = (name && idx['cn:' + name]) || (normName && idx['cn:' + normName]) || (nEn && (idx['en:' + nEn] || idx['en:' + String(nEn).toLowerCase()]));
      if (p) {
        if (p.icon && typeof p.icon === 'string' && p.icon.trim() !== '') return p.icon;
        if (p.icon_url && typeof p.icon_url === 'string' && p.icon_url.trim() !== '') return p.icon_url;
        if (p.formatted_no) return `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png`;
      }
    }
    const dex = POKEMON_SPRITE_FALLBACK[name] || POKEMON_SPRITE_FALLBACK[nEn];
    if (dex) {
      return `https://www.serebii.net/pokemonsleep/pokemon/icon/${dex}.png`;
    }
    return '';
  }

  function getIslandPokemonDexCode(p) {
    if (!p) return '001';
    if (typeof window !== 'undefined' && Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
      const idx = _getWikiPkmIndex(window.allPokemons);
      const normName = p.name ? String(p.name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
      const found = (p.name && idx['cn:' + p.name]) || (normName && idx['cn:' + normName]) || (p.name_en && (idx['en:' + p.name_en] || idx['en:' + String(p.name_en).toLowerCase()]));
      if (found && found.formatted_no) return String(found.formatted_no);
    }
    const normFallback = p.name ? String(p.name).replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）') : '';
    return POKEMON_SPRITE_FALLBACK[p.name] || POKEMON_SPRITE_FALLBACK[normFallback] || POKEMON_SPRITE_FALLBACK[p.name_en] || '001';
  }

  function getIslandPokemonDexOrder(p) {
    if (!p) return 999999;
    const rawDex = getIslandPokemonDexCode(p);
    const num = parseInt(rawDex, 10);
    const base = isNaN(num) ? 9999 : num;
    const isForm = String(rawDex).includes('-') || (p.name && (p.name.includes('樣子') || p.name.includes('低調')));
    return base * 10 + (isForm ? 1 : 0);
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
      layer.innerHTML = '<img class="island-scene-photo" alt=""><div class="island-scene-fade"></div>';
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

