  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  function _getLabGameConfig() {
    return (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
           (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  }

  const _FALLBACK_BERRY_VALUES_DATA = [
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

  const _LAB_FALLBACK_BERRY_ID_ALIASES = {
    '椰木果': 'pamtre', '藍異果': 'pamtre', 'pamtre': 'pamtre', '飛行': 'pamtre', '飛': 'pamtre',
    '木子果': 'lum', '芭亞果': 'lum', 'lum': 'lum', '蟲': 'lum',
    '異奇果': 'grepa', 'grepa': 'grepa', '電': 'grepa',
    '檬果': 'bluk', 'bluk': 'bluk', '幽靈': 'bluk', '鬼': 'bluk',
    '桃桃果': 'pecha', 'pecha': 'pecha', '妖精': 'pecha', '妖': 'pecha',
    '芒念果': 'mago', '芒芒果': 'mago', 'mago': 'mago', '超能力': 'mago', '超能': 'mago', '超': 'mago',
    '蘋野果': 'leppa', 'leppa': 'leppa', '火': 'leppa',
    '櫻子果': 'cheri', 'cheri': 'cheri', '格鬥': 'cheri', '鬥': 'cheri',
    '柿仔果': 'persim', 'persim': 'persim', '一般': 'persim',
    '勿花果': 'figy', 'figy': 'figy', '地面': 'figy', '地': 'figy',
    '文柚果': 'sitrus', 'sitrus': 'sitrus', '岩石': 'sitrus', '岩': 'sitrus',
    '榴石果': 'durin', '墨莓果': 'durin', 'durin': 'durin', '草': 'durin',
    '橙橙果': 'oran', 'oran': 'oran', '水': 'oran',
    '芭拉果': 'wiki', '威嘻果': 'wiki', 'wiki': 'wiki', '惡': 'wiki',
    '零餘果': 'chesto', 'chesto': 'chesto', '毒': 'chesto',
    '生薑果': 'rawst', '羅子果': 'rawst', 'rawst': 'rawst', '冰': 'rawst',
    '靛莓果': 'belue', '刺角果': 'belue', 'belue': 'belue', '鋼': 'belue',
    '巧可果': 'yache', '亞雪果': 'yache', 'yache': 'yache', '龍': 'yache'
  };

  function _resolveLabBerryCanonicalId(nameOrType) {
    if (!nameOrType) return null;
    const gc = _getLabGameConfig();
    if (gc && typeof gc.resolveBerryCanonicalId === 'function') {
      const id = gc.resolveBerryCanonicalId(nameOrType);
      if (id) return id;
    }
    const k = String(nameOrType).trim();
    return _LAB_FALLBACK_BERRY_ID_ALIASES[k] || _LAB_FALLBACK_BERRY_ID_ALIASES[k.toLowerCase()] || null;
  }

  function _sortLabBerriesByEnergyAsc(list) {
    if (!Array.isArray(list)) return [];
    const gc = _getLabGameConfig();
    if (gc && typeof gc.sortBerriesByEnergyAsc === 'function') {
      return gc.sortBerriesByEnergyAsc(list, (b) => (typeof b === 'string' ? b : (b.id || b.name || b.type)));
    }
    const orderMap = Object.create(null);
    _FALLBACK_BERRY_VALUES_DATA.forEach((b, idx) => { orderMap[b.id] = idx; });
    return list
      .map((item, idx) => ({ item, idx }))
      .sort((a, b) => {
        const ida = _resolveLabBerryCanonicalId(typeof a.item === 'string' ? a.item : (a.item && (a.item.id || a.item.name || a.item.type)));
        const idb = _resolveLabBerryCanonicalId(typeof b.item === 'string' ? b.item : (b.item && (b.item.id || b.item.name || b.item.type)));
        const ra = ida && Object.prototype.hasOwnProperty.call(orderMap, ida) ? orderMap[ida] : Number.MAX_SAFE_INTEGER;
        const rb = idb && Object.prototype.hasOwnProperty.call(orderMap, idb) ? orderMap[idb] : Number.MAX_SAFE_INTEGER;
        return ra !== rb ? ra - rb : a.idx - b.idx;
      })
      .map((x) => x.item);
  }

  function _getLabBerryValuesData() {
    const gc = _getLabGameConfig();
    if (gc && Array.isArray(gc.CANONICAL_BERRIES) && gc.CANONICAL_BERRIES.length > 0) {
      const fallbackById = Object.create(null);
      _FALLBACK_BERRY_VALUES_DATA.forEach((b) => { fallbackById[b.id] = b; });
      return _sortLabBerriesByEnergyAsc(gc.CANONICAL_BERRIES.map((b) => {
        const fb = fallbackById[b.id];
        return {
          id: b.id,
          name: b.name,
          type: (fb && fb.type) || b.type,
          energy: b.energy,
          icon: b.icon || (fb && fb.icon) || ''
        };
      }));
    }
    return _FALLBACK_BERRY_VALUES_DATA.slice();
  }

  const BERRY_VALUES_DATA = _getLabBerryValuesData();

  function _findLabBerryData(nameOrType) {
    if (!nameOrType) return null;
    const list = _getLabBerryValuesData();
    const direct = list.find((b) => b.name === nameOrType || b.id === nameOrType);
    if (direct) return direct;
    const cid = _resolveLabBerryCanonicalId(nameOrType);
    if (!cid) return null;
    return list.find((b) => b.id === cid) || null;
  }

  function _isLabFavoredBerryOrType(berryName, berryType, favBerries, favTypes) {
    if (Array.isArray(favBerries)) {
      if (berryName && favBerries.includes(berryName)) return true;
      const bCid = _resolveLabBerryCanonicalId(berryName);
      if (bCid && favBerries.some(fb => _resolveLabBerryCanonicalId(fb) === bCid)) return true;
    }
    if (Array.isArray(favTypes)) {
      if (berryType && favTypes.includes(berryType)) return true;
      const tCid = _resolveLabBerryCanonicalId(berryType);
      if (tCid && favTypes.some(ft => _resolveLabBerryCanonicalId(ft) === tCid)) return true;
    }
    return false;
  }

  const INGREDIENTS_ENERGY_MAP = {
    '特選蘋果': 90, 'Fancy Apple': 90,
    '哞哞鮮奶': 98, 'Moomoo Milk': 98,
    '萌綠大豆': 100, 'Greengrass Soybeans': 100,
    '甜甜蜜': 101, 'Honey': 101,
    '豆製肉': 103, 'Bean Sausage': 103,
    '暖暖薑': 109, 'Warming Ginger': 109,
    '好眠番茄': 110, 'Snoozy Tomato': 110,
    '一口堅果': 112, 'Snackable Nuts': 112,
    '特選蛋': 115, 'Fancy Egg': 115,
    '純粹油': 121, 'Pure Oil': 121,
    '窩心洋芋': 124, 'Soft Potato': 124,
    '火辣香草': 130, 'Fiery Herb': 130,
    '萌綠玉米': 140, 'Greengrass Corn': 140,
    '放鬆可可': 151, 'Soothing Cacao': 151,
    '醒腦咖啡豆': 153, 'Rousing Coffee': 153,
    '嫩亮酪梨': 162, 'Glossy Avocado': 162,
    '品鮮蘑菇': 167, 'Tasty Mushroom': 167,
    '粗枝大蔥': 185, 'Large Leek': 185,
    '沉甸甸南瓜': 250, 'Plump Pumpkin': 250,
    '美味尾巴': 342, 'Slowpoke Tail': 342
  };

  const LAB_ISLANDS = [
    {
      id: 'greengrass',
      name: '萌綠之島',
      name_en: 'Greengrass Isle',
      color: '#22c55e',
      image: 'assets/islands/hd/greengrass.jpg',
      berries: ['桃桃果', '橙橙果', '櫻子果'],
      types: ['妖精', '水', '格鬥'],
      desc: '初始營地 · 自由全屬性'
    },
    {
      id: 'cyan',
      name: '天青沙灘',
      name_en: 'Cyan Beach',
      color: '#06b6d4',
      image: 'assets/islands/hd/cyan.jpg',
      berries: ['橙橙果', '椰木果', '桃桃果'],
      types: ['水', '飛行', '妖精'],
      desc: '喜愛樹果：水、飛行、妖精 (2x 能量)'
    },
    {
      id: 'taupe',
      name: '灰褐洞窟',
      name_en: 'Taupe Hollow',
      color: '#f97316',
      image: 'assets/islands/hd/taupe.jpg',
      berries: ['蘋野果', '勿花果', '文柚果'],
      types: ['火', '地面', '岩石'],
      desc: '喜愛樹果：火、地面、岩石 (2x 能量)'
    },
    {
      id: 'snowdrop',
      name: '白花雪原',
      name_en: 'Snowdrop Tundra',
      color: '#38bdf8',
      image: 'assets/islands/hd/snowdrop.jpg',
      berries: ['柿仔果', '生薑果', '芭拉果'],
      types: ['一般', '冰', '惡'],
      desc: '喜愛樹果：一般、冰、惡 (2x 能量)'
    },
    {
      id: 'lapis',
      name: '寶藍湖畔',
      name_en: 'Lapis Lakeside',
      color: '#a855f7',
      image: 'assets/islands/hd/lapis.jpg',
      berries: ['榴石果', '櫻子果', '芒念果'],
      types: ['草', '格鬥', '超能'],
      desc: '喜愛樹果：草、格鬥、超能 (2x 能量)'
    },
    {
      id: 'powerplant',
      name: '黃金舊發電廠',
      name_en: 'Old Gold Power Plant',
      color: '#eab308',
      image: 'assets/islands/hd/oldgold.jpg',
      berries: ['異奇果', '檬果', '靛莓果'],
      types: ['電', '幽靈', '鋼'],
      desc: '喜愛樹果：電、幽靈、鋼 (2x 能量)'
    },
    {
      id: 'amber',
      name: '琥褐溪谷',
      name_en: 'Amber Canyon',
      color: '#d97706',
      image: 'assets/islands/hd/amber.jpg',
      berries: ['零餘果', '木子果', '巧可果'],
      types: ['毒', '蟲', '龍'],
      desc: '喜愛樹果：毒、蟲、龍 (2x 能量)'
    }
  ];

  let labState = {
    currentSubTab: 'team',
    teamIslandId: 'greengrass',
    teamSlots: [null, null, null, null, null],
    teamStrategy: 'balanced', // 'balanced' | 'berries' | 'ingredients' | 'skills' | 'recipe'
    cookingType: 'curry',     // 'curry' | 'salad' | 'dessert'
    targetRecipeName: '彈跳咖哩烏龍麵',
    greengrassBerries: ['桃桃果', '橙橙果', '櫻子果'],
    compareSlots: [null, null, null],
    compareBenchmarkLevel: 'box', // 'box' | 30 | 50 | 60 | 100
    selectedBoxUid: '',
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: [],
    ribbon: 0,
    nickname: '',
    skillLevel: 1,
    isCustomized: false,
    editMode: false,
    editBackup: null,
    activeSubskillSlot: 1
  };

  Object.defineProperty(labState, 'compareUidA', {
    get: function() { return (this.compareSlots && this.compareSlots[0]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[0] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidB', {
    get: function() { return (this.compareSlots && this.compareSlots[1]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[1] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidC', {
    get: function() { return (this.compareSlots && this.compareSlots[2]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[2] = v || null; },
    configurable: true,
    enumerable: true
  });

  const COOKING_CATEGORY_KEY_INGREDIENTS = {
    curry: ['豆製肉', '好眠番茄', '暖暖薑', '火辣香草', '萌綠玉米', '粗枝大蔥', '品鮮蘑菇', '特選蛋', '美味尾巴', 'Bean Sausage', 'Snoozy Tomato', 'Warming Ginger', 'Fiery Herb', 'Greengrass Corn', 'Large Leek', 'Tasty Mushroom', 'Fancy Egg', 'Slowpoke Tail'],
    salad: ['純粹油', '好眠番茄', '特選蘋果', '放鬆可可', '窩心洋芋', '萌綠大豆', '萌綠玉米', '嫩亮酪梨', '粗枝大蔥', 'Pure Oil', 'Snoozy Tomato', 'Fancy Apple', 'Soothing Cacao', 'Soft Potato', 'Greengrass Soybeans', 'Greengrass Corn', 'Glossy Avocado', 'Large Leek'],
    dessert: ['甜甜蜜', '特選蘋果', '哞哞鮮奶', '放鬆可可', '特選蛋', '醒腦咖啡豆', '暖暖薑', '沉甸甸南瓜', 'Honey', 'Fancy Apple', 'Moomoo Milk', 'Soothing Cacao', 'Fancy Egg', 'Rousing Coffee', 'Warming Ginger', 'Plump Pumpkin']
  };

