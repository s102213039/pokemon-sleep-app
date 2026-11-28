  // 3.0 食材天梯榜即時副技能與性格補正開關、跨軌道搜尋/三維度篩選狀態
  let isLadderIngM = false;
  let isLadderIngS = false;
  let isLadderSpeedM = false;
  let isLadderSpeedS = false;
  let isLadderSkillM = false;
  let isLadderSkillS = false;
  let ladderNatureIng = false;
  let ladderNatureSpeed = false;
  let ladderNatureSkill = false;
  let ladderNature = 'NONE'; // 'NONE' | 'ING' | 'SPEED' | 'SKILL' | 'MIXED'
  let ladderSearchQuery = '';
  let ladderSupplyFilter = 'ALL'; // 'ALL' | 'TOP' | 'MEALS_3' | 'MEALS_2'
  let ladderRecipeFilter = 'ALL'; // 'ALL' | 'AAA' | 'ABB' | 'AXX'
  let ladderSpecialtyFilter = 'ALL'; // 'ALL' | 'INGREDIENT' | 'BERRY' | 'SKILL'
  let ladderSortOrder = 'ENERGY_ASC'; // 'ENERGY_ASC' | 'ENERGY_DESC' | 'YIELD_DESC' | 'DEMAND_DESC'
  let ladderViewMode = 'coordinate'; // 'coordinate' | 'list'
  let ladderTop15Only = true; // 預設開啟前 15 名排行（有效降低 DOM 節點並消除行動端卡頓）
  let isLadderSkillDrawExpected = false; // 食材精選S 技能期望值加成開關
  try {
    if (typeof localStorage !== 'undefined') {
      isLadderSkillDrawExpected = localStorage.getItem('pksleep_ladder_skill_draw') === 'true';
    }
  } catch (e) {}

  function toggleLadderTop15(enabled) {
    ladderTop15Only = enabled !== undefined ? !!enabled : !ladderTop15Only;
    const switchInput = document.getElementById('ladder-top15-switch');
    if (switchInput) switchInput.checked = ladderTop15Only;
    refreshCoordinateLadder();
  }

  function getLadderTop15Only() {
    return ladderTop15Only;
  }

  function toggleLadderSkillDrawExpected(enabled) {
    isLadderSkillDrawExpected = enabled !== undefined ? !!enabled : !isLadderSkillDrawExpected;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_ladder_skill_draw', String(isLadderSkillDrawExpected));
      }
    } catch (e) {}
    const toggleInput = document.getElementById('ladder-skill-draw-toggle');
    if (toggleInput) toggleInput.checked = isLadderSkillDrawExpected;
    refreshCoordinateLadder();
  }

  function getLadderSkillDrawExpected() {
    return isLadderSkillDrawExpected;
  }

  // 食材精選S 專屬寶可夢主技能期望值加成 (主技能最高等級 Lv.7, 每次 18 顆; 全部專長以 1.0 倍發動機率為基準, 技能機率M/S與性格▲由篩選器另行疊加)
  // 排除暴擊、大成功與碎片，依候選食材池等機率 1/K 均分推導之日獲取期望值
  const INGREDIENT_DRAW_SKILL_EXPECTATIONS = {
    '穿山王': {
      bonus: 18,
      ingredients: ['沉甸甸南瓜', '吉利蛋南瓜', '南瓜', '萌綠玉米', '玉米', '窩心洋芋', '洋芋', 'Plump Pumpkin', 'Greengrass Corn', 'Soft Potato', 'pumpkin', 'corn', 'potato']
    },
    'Sandslash': {
      bonus: 18,
      ingredients: ['沉甸甸南瓜', '吉利蛋南瓜', '南瓜', '萌綠玉米', '玉米', '窩心洋芋', '洋芋', 'Plump Pumpkin', 'Greengrass Corn', 'Soft Potato', 'pumpkin', 'corn', 'potato']
    },
    '烏鴉頭頭': {
      bonus: 18,
      ingredients: ['醒腦咖啡豆', '醒晨咖啡', '咖啡', '萌綠大豆', '大豆', '豆製肉', '美味蘑菇', '蘑菇', 'Rousing Coffee', 'Greengrass Soybeans', 'Bean Sausage', 'Tasty Mushroom', 'coffee', 'soy', 'soybeans', 'meat', 'sausage', 'beansausage', 'mushroom']
    },
    'Honchkrow': {
      bonus: 18,
      ingredients: ['醒腦咖啡豆', '醒晨咖啡', '咖啡', '萌綠大豆', '大豆', '豆製肉', '美味蘑菇', '蘑菇', 'Rousing Coffee', 'Greengrass Soybeans', 'Bean Sausage', 'Tasty Mushroom', 'coffee', 'soy', 'soybeans', 'meat', 'sausage', 'beansausage', 'mushroom']
    },
    '岩殿居蟹': {
      bonus: 23,
      ingredients: ['嫩亮酪梨', '酪梨', '窩心洋芋', '洋芋', '純粹油', '純油', 'Glossy Avocado', 'Soft Potato', 'Pure Oil', 'avocado', 'glossyavocado', 'potato', 'oil']
    },
    'Crustle': {
      bonus: 23,
      ingredients: ['嫩亮酪梨', '酪梨', '窩心洋芋', '洋芋', '純粹油', '純油', 'Glossy Avocado', 'Soft Potato', 'Pure Oil', 'avocado', 'glossyavocado', 'potato', 'oil']
    },
    '摔角鷹人': {
      bonus: 25,
      ingredients: ['火辣香草', '透心涼香草', '香草', '暖暖薑', '豆製肉', 'Fiery Herb', 'Warming Ginger', 'Bean Sausage', 'herb', 'ginger', 'meat', 'sausage', 'beansausage']
    },
    'Hawlucha': {
      bonus: 25,
      ingredients: ['火辣香草', '透心涼香草', '香草', '暖暖薑', '豆製肉', 'Fiery Herb', 'Warming Ginger', 'Bean Sausage', 'herb', 'ginger', 'meat', 'sausage', 'beansausage']
    },
    '蝶結萌虻': {
      bonus: 13,
      ingredients: ['甜甜蜜', '蜜糖', '蜂蜜', '純粹油', '純油', '萌綠玉米', '玉米', 'Honey', 'Pure Oil', 'Greengrass Corn', 'honey', 'oil', 'corn']
    },
    'Ribombee': {
      bonus: 13,
      ingredients: ['甜甜蜜', '蜜糖', '蜂蜜', '純粹油', '純油', '萌綠玉米', '玉米', 'Honey', 'Pure Oil', 'Greengrass Corn', 'honey', 'oil', 'corn']
    },
    '大嘴娃': {
      bonus: 10,
      ingredients: ['窩心洋芋', '洋芋', '純粹油', '純油', '萌綠玉米', '玉米', '好眠番茄', '番茄', 'Soft Potato', 'Pure Oil', 'Greengrass Corn', 'Snoozy Tomato', 'potato', 'oil', 'corn', 'tomato']
    },
    'Mawile': {
      bonus: 10,
      ingredients: ['窩心洋芋', '洋芋', '純粹油', '純油', '萌綠玉米', '玉米', '好眠番茄', '番茄', 'Soft Potato', 'Pure Oil', 'Greengrass Corn', 'Snoozy Tomato', 'potato', 'oil', 'corn', 'tomato']
    }
  };

  function getPokemonSkillDrawBonus(pkmName, ingId, ingName) {
    if (!isLadderSkillDrawExpected) return 0;
    if (!pkmName) return 0;
    const cleanName = pkmName.trim();
    const entry = INGREDIENT_DRAW_SKILL_EXPECTATIONS[cleanName];
    if (!entry) return 0;
    const lowerIngId = ingId ? ingId.toLowerCase().trim() : '';
    const cleanIngName = ingName ? ingName.trim() : '';
    const matched = entry.ingredients.some(target => {
      const lowerTarget = target.toLowerCase();
      return target === cleanIngName || lowerTarget === lowerIngId || target === ingId;
    });
    const bonus = matched ? entry.bonus : 0;
    if (!bonus) return 0;
    return Math.round(bonus * getLadderSkillTriggerMultiplier());
  }

  const ING_SELECT_SKILL_NAMES = new Set([
    '食材精選S', '食材精選', '超幸運', '怪力鉗',
    'Ingredient Selection S', 'Super Luck', 'Hyper Cutter'
  ]);

  const ING_SELECT_POKEMON_FALLBACK = new Set([
    '穿山鼠', '穿山王', '黑暗鴉', '烏鴉頭頭', '大嘴娃',
    '石居蟹', '岩殿居蟹', '摔角鷹人', '萌虻', '蝶結萌虻',
    'Sandshrew', 'Sandslash', 'Murkrow', 'Honchkrow', 'Mawile',
    'Dwebble', 'Crustle', 'Hawlucha', 'Cutiefly', 'Ribombee'
  ]);

  function hasPokemonIngSelectSkill(pkmName) {
    if (!pkmName) return false;
    const cleanName = String(pkmName).trim();
    const baseName = cleanName.replace(/（.*）|\(.*\)/g, '').trim();
    if (typeof window !== 'undefined') {
      const liveArr = (Array.isArray(window.POKEMON_DATA) && window.POKEMON_DATA.length > 0 && window.POKEMON_DATA)
        || (window.PokemonApp && Array.isArray(window.PokemonApp.allPokemons) && window.PokemonApp.allPokemons.length > 0 && window.PokemonApp.allPokemons)
        || (Array.isArray(window.allPokemons) && window.allPokemons.length > 0 && window.allPokemons)
        || null;
      if (liveArr) {
        const idx = _getWikiPkmIndex(liveArr);
        const match = idx['cn:' + cleanName] || idx['cn:' + baseName] || idx['en:' + cleanName] || idx['en:' + cleanName.toLowerCase()];
        if (match && match.main_skill) {
          return ING_SELECT_SKILL_NAMES.has(String(match.main_skill).trim());
        }
      }
    }
    return ING_SELECT_POKEMON_FALLBACK.has(cleanName) || ING_SELECT_POKEMON_FALLBACK.has(baseName);
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
    "烏波": "食材", "烏波（帕底亞的樣子）": "食材", "沼王": "食材", "土王": "食材",
    "黑暗鴉": "技能", "烏鴉頭頭": "技能", "小果然": "技能", "果然翁": "技能", "壺壺": "技能",
    "赫拉克羅斯": "技能", "狃拉": "樹果", "瑪狃拉": "樹果", "信使鳥": "食材", "戴魯比": "樹果", "黑魯加": "樹果",
    "雷公": "技能", "炎帝": "技能", "水君": "技能", "幼基拉斯": "食材", "沙基拉斯": "食材", "班基拉斯": "食材",
    "木守宮": "技能", "森林蜥蜴": "技能", "蜥蜴王": "技能", "火稚雞": "樹果", "力壯雞": "樹果", "火焰雞": "樹果",
    "水躍魚": "樹果", "沼躍魚": "樹果", "巨沼怪": "樹果",
    "拉魯拉絲": "技能", "奇鲁莉安": "技能", "奇魯莉安": "技能", "沙奈朵": "技能", "艾路雷朵": "技能",
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
    "快泳蛙": "樹果", "胡地": "技能", "怪力": "食材", "臭臭泥": "技能",
    "哎呀球菇": "食材", "敗露球菇": "食材",
    "木棉球": "食材", "風妖精": "食材",
    "夢妖": "技能", "夢妖魔": "技能",
    "南瓜精 (小顆種)": "食材", "南瓜精 (中顆種)": "食材", "南瓜精 (大顆種)": "食材", "南瓜精 (巨顆種)": "食材",
    "南瓜精（小顆種）": "食材", "南瓜精（中顆種）": "食材", "南瓜精（大顆種）": "食材", "南瓜精（巨顆種）": "食材",
    "南瓜怪人 (小顆種)": "食材", "南瓜怪人 (中顆種)": "食材", "南瓜怪人 (大顆種)": "食材", "南瓜怪人 (巨顆種)": "食材",
    "南瓜怪人（小顆種）": "食材", "南瓜怪人（中顆種）": "食材", "南瓜怪人（大顆種）": "食材", "南瓜怪人（巨顆種）": "食材"
  };

  let _wikiPkmIdxArr = null;
  let _wikiPkmIdxLen = -1;
  let _wikiPkmIdxMap = null;
  let _ladderSpecCache = Object.create(null);
  let _ladderSpecCachePkmLen = -1;

  function _getWikiPkmIndex(overrideArr) {
    const arr = overrideArr || (typeof window !== 'undefined' && (
      (window.PokemonApp && Array.isArray(window.PokemonApp.allPokemons) && window.PokemonApp.allPokemons.length > 0)
        ? window.PokemonApp.allPokemons
        : (Array.isArray(window.allPokemons) && window.allPokemons.length > 0
          ? window.allPokemons
          : (Array.isArray(window.POKEMON_DATA) ? window.POKEMON_DATA : []))
    )) || [];
    if (_wikiPkmIdxMap && _wikiPkmIdxArr === arr && _wikiPkmIdxLen === arr.length) {
      return _wikiPkmIdxMap;
    }
    const map = Object.create(null);
    for (let i = 0; i < arr.length; i++) {
      const p = arr[i];
      if (!p) continue;
      if (p.id != null) {
        map['id:' + p.id] = p;
        map['no:' + String(p.id).padStart(3, '0')] = p;
      }
      if (p.formatted_no) {
        map['no:' + p.formatted_no] = p;
        map['id:' + p.formatted_no] = p;
      }
      if (p.name_cn) {
        map['cn:' + p.name_cn] = p;
        const normCn = p.name_cn.replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）');
        map['cn:' + normCn] = p;
        const halfCn = p.name_cn.replace(/（/g, ' (').replace(/）/g, ')');
        map['cn:' + halfCn] = p;
      }
      if (p.name && typeof p.name === 'string') {
        map['cn:' + p.name] = p;
        const normName = p.name.replace(/\s*\(\s*/g, '（').replace(/\s*\)\s*/g, '）');
        map['cn:' + normName] = p;
      }
      if (p.name_en) {
        map['en:' + p.name_en] = p;
        map['en:' + p.name_en.toLowerCase()] = p;
      }
    }
    const p710 = map['id:710'];
    if (p710) {
      map['cn:南瓜精'] = p710;
      map['en:pumpkaboo'] = p710;
    }
    const p711 = map['id:711'];
    if (p711) {
      map['cn:南瓜怪人'] = p711;
      map['en:gourgeist'] = p711;
    }
    const p208 = map['id:208'];
    if (p208) {
      map['cn:大鋼蛇'] = p208;
      map['cn:大綱蛇'] = p208;
    }
    const p281 = map['id:281'];
    if (p281) {
      map['cn:奇魯莉安'] = p281;
      map['cn:奇鲁莉安'] = p281;
    }
    const p7006 = map['id:7006'];
    if (p7006) {
      map['en:Alolan Vulpix'] = p7006;
      map['en:alolan vulpix'] = p7006;
    }
    const p7007 = map['id:7007'];
    if (p7007) {
      map['en:Alolan Ninetales'] = p7007;
      map['en:alolan ninetales'] = p7007;
    }
    const p7054 = map['id:7054'];
    if (p7054) {
      map['en:Paldean Wooper'] = p7054;
      map['en:paldean wooper'] = p7054;
    }
    const p849 = map['id:849'];
    if (p849) {
      map['en:Toxtricity Amped Form'] = p849;
      map['en:toxtricity amped form'] = p849;
    }
    const p8001 = map['id:8001'];
    if (p8001) {
      map['en:Toxtricity Low Key Form'] = p8001;
      map['en:toxtricity low key form'] = p8001;
    }
    _wikiPkmIdxArr = arr;
    _wikiPkmIdxLen = arr.length;
    _wikiPkmIdxMap = map;
    return map;
  }

  function getPokemonLadderSpecialty(pkmName) {
    if (!pkmName) return '食材';
    const livePkmArr = (typeof window !== 'undefined')
      ? ((Array.isArray(window.POKEMON_DATA) && window.POKEMON_DATA.length > 0 && window.POKEMON_DATA)
        || (window.PokemonApp && Array.isArray(window.PokemonApp.allPokemons) && window.PokemonApp.allPokemons.length > 0 && window.PokemonApp.allPokemons)
        || (Array.isArray(window.allPokemons) && window.allPokemons.length > 0 && window.allPokemons)
        || null)
      : null;
    const pkmDataLen = livePkmArr ? livePkmArr.length : 0;
    if (pkmDataLen !== _ladderSpecCachePkmLen) {
      _ladderSpecCache = Object.create(null);
      _ladderSpecCachePkmLen = pkmDataLen;
    }
    const cached = _ladderSpecCache[pkmName];
    if (cached !== undefined) return cached;

    const clean = pkmName.replace(/（.*）|\(.*\)/g, '').trim();
    let res = '食材';
    // 1. 若全域寶可夢資料庫（window.POKEMON_DATA / allPokemons）已載入，優先使用官方資料集
    if (pkmDataLen > 0) {
      const idx = _getWikiPkmIndex(livePkmArr);
      const match = idx['cn:' + pkmName] || idx['cn:' + clean] || idx['cn:' + pkmName.replace('大綱蛇', '大鋼蛇')] || idx['cn:' + pkmName.replace('大鋼蛇', '大綱蛇')] || idx['en:' + pkmName];
      if (match && match.specialty) {
        _ladderSpecCache[pkmName] = match.specialty;
        return match.specialty;
      }
    }
    // 2. 本地字典速查
    if (POKEMON_SPECIALTY_MAP[pkmName]) res = POKEMON_SPECIALTY_MAP[pkmName];
    else if (POKEMON_SPECIALTY_MAP[clean]) res = POKEMON_SPECIALTY_MAP[clean];
    else if (clean === '大綱蛇' || clean === '大鋼蛇') res = '樹果';
    _ladderSpecCache[pkmName] = res;
    return res;
  }
