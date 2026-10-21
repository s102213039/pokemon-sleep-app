  // --- 初始化 Wiki 模組 ---
  function initWikiModule() {
    loadPersistedBerrySettings();
    currentWikiSubTab = getSavedWikiSubTab();
    currentSkillsCategory = getSavedSkillsCategory();
    currentIslandId = getSavedIslandId();
    isExpertModeActive = getSavedIslandExpertMode();
    currentIslandSleepType = getSavedIslandSleepType();
    isIslandLegendaryOnly = getSavedIslandLegendaryOnly();
    isIslandSleepRewardsVisible = getSavedIslandSleepRewards();
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
    try {
      if (typeof window !== 'undefined' && window.location) {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeParam = urlParams.get('recipe');
        if (recipeParam) {
          selectLadderHighlightRecipe(decodeURIComponent(recipeParam));
        }
      }
    } catch (e) {}
    try { recalcTriggerChance(); } catch (e) {}
    try { recalcSleepDays(); } catch (e) {}
    try {
      const ladderCanvas = document.getElementById('wiki-ingredient-ladder-coordinate') || document.getElementById('ladder-coordinate-canvas');
      if (!ladderCanvas || !ladderCanvas.innerHTML) refreshCoordinateLadder();
    } catch (e) {}
    try {
      const berryCanvas = document.getElementById('berry-energy-grid') || document.getElementById('berry-ladder-canvas');
      if (!berryCanvas || !berryCanvas.innerHTML) refreshBerryNodes();
    } catch (e) {}
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

  const LADDER_NOTE_ING_LIST = [
    '特選蘋果', 'Fancy Apple', '哞哞鮮奶', 'Moomoo Milk', '萌綠大豆', 'Greengrass Soybeans',
    '甜甜蜜', 'Honey', '豆製肉', 'Bean Sausage', '暖暖薑', 'Warming Ginger',
    '好眠番茄', '熟透番茄', 'Snoozy Tomato', '特選蛋', 'Fancy Egg', '純粹油', 'Pure Oil',
    '窩心洋芋', 'Soft Potato', '火辣香草', 'Fiery Herb', '萌綠玉米', 'Greengrass Corn',
    '放鬆可可', 'Soothing Cacao', '醒腦咖啡豆', 'Rousing Coffee', '嫩亮酪梨', 'Glossy Avocado',
    '品鮮蘑菇', 'Tasty Mushroom', '粗枝大蔥', 'Large Leek', '沉甸甸南瓜', 'Plump Pumpkin',
    '美味尾巴', 'Slowpoke Tail'
  ];
  const _ladderNoteCache = Object.create(null);

  function formatLadderNote(note, isEN) {
    if (!note) return '';
    const langKey = (window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : (isEN ? 'en-US' : 'zh-TW');
    const cacheKey = langKey + ':' + note;
    const cached = _ladderNoteCache[cacheKey];
    if (cached !== undefined) return cached;

    let translated = (window.I18N && typeof window.I18N.translateDynamicText === 'function') 
      ? window.I18N.translateDynamicText(note) 
      : note;

    if (window.I18N && typeof window.I18N.getIngredientIcon === 'function') {
      for (let i = 0; i < LADDER_NOTE_ING_LIST.length; i++) {
        const ingName = LADDER_NOTE_ING_LIST[i];
        if (translated.includes(ingName)) {
          const icon = window.I18N.getIngredientIcon(ingName);
          if (icon) {
            const displayName = window.I18N.getIngredientName(ingName);
            const tag = `<img src="${icon}" class="ladder-note-ing-icon" alt="${displayName}" title="${displayName}">`;
            translated = translated.split(ingName).join(tag);
          }
        }
      }
    }
    _ladderNoteCache[cacheKey] = translated;
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

  let _coordLadderRenderCache = { key: '', html: '' };

  // 渲染橫向視覺座標天梯圖 (支援多型態並列節點、同組跨度連接線、大菜供應能力評定、動態自適應最大刻度、美味尾巴獨立分離)
  function renderCoordinateLadder(ladderData) {
    const data = ladderData || LV60_COORDINATE_LADDER_DATA || [];
    const mult = getLadderMultiplier();
    const skillTrigMult = getLadderSkillTriggerMultiplier();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const langKey = (window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : (isEN ? 'en-US' : 'zh-TW');
    const isDefaultData = (!ladderData || ladderData === LV60_COORDINATE_LADDER_DATA);
    const cacheKey = isDefaultData ? [
      langKey,
      mult.toFixed(6),
      skillTrigMult.toFixed(6),
      isLadderSkillDrawExpected ? 1 : 0,
      ladderTop15Only ? 1 : 0,
      ladderSortOrder,
      ladderSupplyFilter,
      ladderRecipeFilter,
      ladderSpecialtyFilter,
      ladderSearchQuery,
      ladderRecipeMultiSelect ? 1 : 0,
      ladderHighlightRecipe || '',
      Array.isArray(ladderHighlightRecipes) ? ladderHighlightRecipes.join(',') : '',
      (typeof window !== 'undefined' && window.allPokemon && window.allPokemon.length) || 0
    ].join('|') : '';

    if (cacheKey && _coordLadderRenderCache.key === cacheKey && _coordLadderRenderCache.html) {
      return _coordLadderRenderCache.html;
    }
    
    const highlightState = buildHighlightIngState();
    const activeHighlightRecipes = highlightState.recipes;
    const highlightedIngMap = activeHighlightRecipes.length ? highlightState.map : null;
    const highlightMarks = highlightState.marks;
    const activeHighlightRecipe = activeHighlightRecipes[0] || null;

    // 分離 18 種常規食材與 1 種獨立美味尾巴
    const mainTracks = data.filter(ing => ing.id !== 'tail');
    const tailIng = data.find(ing => ing.id === 'tail');

    const isUnfilteredDefault = (ladderSpecialtyFilter === 'ALL' && ladderRecipeFilter === 'ALL' && ladderSupplyFilter === 'ALL' && !ladderSearchQuery);

    // 1. 預先過濾各常規食材軌道之寶可夢與變體，並計算目前篩選下的全局最高產量
    let globalMaxCount = 20;
    const processedMainTracks = mainTracks.map(ing => {
      const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ing.id] || { name: isEN ? 'High Tier Dish' : '高階料理', name_en: 'High Tier Dish', need: 20, type: isEN ? 'Dish' : '料理', secondary: '' };
      const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
      const ingName = isEN ? (window.I18N.getIngredientName(ing.name) || ing.name) : ing.name;
      const minDefaultThreshold = isUnfilteredDefault ? 30 : (DEFAULT_LADDER_MIN_THRESHOLDS[ing.id] || 20);

      const reqMarks = highlightMarks.get(ing.name) || [];
      const reqCount = highlightedIngMap ? highlightedIngMap.get(ing.name) : null;
      const isHighlighted = reqMarks.length > 0;
      const isDimmed = highlightedIngMap && !isHighlighted;
      const targetDishNeed = (isHighlighted && reqCount) ? reqCount : dishInfo.need;
      const targetDishName = isHighlighted
        ? (activeHighlightRecipes.length > 1
          ? (isEN ? `${activeHighlightRecipes.length} recipes` : `${activeHighlightRecipes.length} 道料理`)
          : (isEN ? (activeHighlightRecipe.name_en || activeHighlightRecipe.name_cn) : activeHighlightRecipe.name_cn))
        : dishName;
      const targetDishIcon = isHighlighted
        ? (activeHighlightRecipes.length > 1
          ? (activeHighlightRecipes[0] ? (activeHighlightRecipes[0].icon || getLadderDishIcon(activeHighlightRecipes[0].name_cn)) : '')
          : (activeHighlightRecipe ? (activeHighlightRecipe.icon || getLadderDishIcon(activeHighlightRecipe.name_cn)) : ''))
        : (dishInfo.icon || getLadderDishIcon(dishInfo.name));

      // 若為 TOP 篩選，於軌道外層一次性預先計算 top5Threshold，消除 O(P^2) 重複掃描
      let trackTop5Threshold = 0;
      if (ladderSupplyFilter === 'TOP') {
        const allMaxCounts = ing.pokemon.map(pkm => {
          const pkmBonus = getPokemonSkillDrawBonus(pkm.name, ing.id, ing.name);
          return Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => Math.round(v.count * mult) + pkmBonus));
        });
        const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
        trackTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
      }

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

        const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);

        let variants = p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }];

        // 全部展示狀態下僅展示產量 >= 30 的主力型態變體；有具體篩選條件時則完整展示 (< 30 也展示)
        variants = variants.filter(v => (Math.round(v.count * mult) + skillBonus) >= minDefaultThreshold);

        variants = variants.filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

        if (ladderSupplyFilter === 'TOP') {
          // 前五名：保留該軌道排名前 5 (Top 1 ~ Top 5) 的寶可夢梯隊，且只展示其最高產量變體
          const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => Math.round(v.count * mult) + skillBonus));
          if (pkmMaxCount < trackTop5Threshold) return null;
          variants = variants.slice(0, 1);
        } else if (ladderSupplyFilter === 'MEALS_3') {
          // 滿載 3 餐：日產量 >= 當前料理 3 餐所需總量 (選定料理時以選定料理需求計算)
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult) + skillBonus;
            return scaled >= targetDishNeed * 3;
          });
        } else if (ladderSupplyFilter === 'MEALS_2') {
          // 充足 2 餐：日產量 >= 當前料理 2 餐所需總量 (選定料理時以選定料理需求計算)
          variants = variants.filter(v => {
            const scaled = Math.round(v.count * mult) + skillBonus;
            return scaled >= targetDishNeed * 2;
          });
        }

        if (variants.length === 0) return null;

        variants.forEach(v => {
          const scaled = Math.round(v.count * mult) + skillBonus;
          if (scaled > globalMaxCount) globalMaxCount = scaled;
        });

        return { ...p, variants };
      }).filter(Boolean);

      return {
        ing,
        dishInfo,
        dishName,
        targetDishNeed,
        targetDishName,
        targetDishIcon,
        isHighlighted,
        isDimmed,
        reqCount,
        reqMarks,
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
              const skillBonus = getPokemonSkillDrawBonus(p.name, track.ing.id, track.ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
                if (scaled > m) m = scaled;
              });
            });
            return m;
          }
          let m = 0;
          if (track.ing && track.ing.pokemon) {
            track.ing.pokemon.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, track.ing.id, track.ing.name);
              (p.variants || [{ count: p.count }]).forEach(v => {
                const scaled = (v.count || 0) + skillBonus;
                if (scaled > m) m = scaled;
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

    // 若有選取高分料理高亮，將符合該料理的食材軌道優先置頂，並依需求量由多到少排序
    if (highlightedIngMap) {
      processedMainTracks.sort((a, b) => {
        const aReq = highlightedIngMap.has(a.ing.name);
        const bReq = highlightedIngMap.has(b.ing.name);
        if (aReq && !bReq) return -1;
        if (!aReq && bReq) return 1;
        if (aReq && bReq) {
          return (highlightedIngMap.get(b.ing.name) || 0) - (highlightedIngMap.get(a.ing.name) || 0);
        }
        return 0;
      });
    }

    // 2. 動態設定最高與最低刻度 (全部展示時自 30 起標，有篩選時動態支援低於 30 之刻度)
    let globalMinCount = 100;
    processedMainTracks.forEach(t => {
      t.filteredPokemonList.forEach(p => {
        const skillBonus = getPokemonSkillDrawBonus(p.name, t.ing.id, t.ing.name);
        p.variants.forEach(v => {
          const scaled = Math.round(v.count * mult) + skillBonus;
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

    // 若有選取料理，計算該料理所有食材之最大三餐及格線需求 (3 Meals Max Target)
    // 若當前範圍數量不足以把及格線畫上，則將最大及格線當作最大展示數量，務必展示出及格線
    let maxPassingTarget = 0;
    activeHighlightRecipes.forEach(rec => {
      (rec.ingredients || []).forEach(item => {
        if (item.name !== '美味尾巴' && item.name !== 'Slowpoke Tail') {
          const target = (item.count || 0) * 3;
          if (target > maxPassingTarget) maxPassingTarget = target;
        }
      });
    });
    if (maxPassingTarget > maxVal) {
      maxVal = Math.ceil(maxPassingTarget / 10) * 10;
    }

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

    const renderedHtml = `
      <div class="wiki-coordinate-ladder-wrapper">
        <div class="wiki-coordinate-ladder" onmouseover="window.WikiDB.handleLadderGroupHover(event)" onmouseout="window.WikiDB.handleLadderGroupHoverOut(event)">
          ${activeHighlightRecipes.length ? `
            <div class="ladder-recipe-banner ${activeHighlightRecipes.length > 1 ? 'ladder-recipe-banner-multi' : ''}">
              <div class="ladder-recipe-banner-recipes">
                ${activeHighlightRecipes.map((rec, idx) => {
                  const style = getRecipeMarkStyle(idx);
                  const recName = isEN ? rec.name_en : rec.name_cn;
                  return `
                    <div class="ladder-recipe-banner-recipe-chip" title="${recName}">
                      ${activeHighlightRecipes.length > 1 ? `<span class="ladder-recipe-banner-recipe-dot" style="background:${style.color}"></span>` : ''}
                      <img src="${rec.icon}" class="ladder-recipe-banner-icon" alt="${recName}">
                    </div>
                  `;
                }).join('')}
              </div>
              <button type="button" class="ladder-recipe-banner-clear-btn" onclick="window.WikiDB.clearLadderHighlightRecipe()" title="${isEN ? 'Clear recipe highlight' : '清除料理高亮'}" aria-label="${isEN ? 'Clear' : '清除'}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ` : ''}

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
          ${processedMainTracks.map(({ ing, dishInfo, dishName, targetDishNeed, targetDishName, targetDishIcon, isHighlighted, isDimmed, reqCount, reqMarks, ingName, filteredPokemonList, isTrackEmpty }, trackIdx) => {
            // 計算該軌道最低產量起點，用於畫出前方點狀前導虛線
            let minTrackCount = maxVal;
            filteredPokemonList.forEach(p => {
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
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
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach(v => {
                const scaled = Math.round(v.count * mult) + skillBonus;
                if (scaled > trackMaxYield) trackMaxYield = scaled;
              });
            });

            let trackNodes = [];
            filteredPokemonList.forEach((p, pIdx) => {
              const pkmDisplayName = isEN ? ((window.I18N && window.I18N.getPokemonName(p.name)) || p.name) : p.name;
              const skillBonus = getPokemonSkillDrawBonus(p.name, ing.id, ing.name);
              p.variants.forEach((v, vIdx) => {
                const dropCount = Math.round(v.count * mult);
                const scaledCount = dropCount + skillBonus;
                const isTopNode = (scaledCount === trackMaxYield && scaledCount > 0) || v.isTop || (p.isTop && v.recipe === p.recipe);
                const zIndex = isTopNode ? 45 : Math.max(35 - pIdx * 3 - vIdx, 5);
                trackNodes.push({
                  p,
                  pIdx,
                  pkmDisplayName,
                  v,
                  vIdx,
                  dropCount,
                  skillBonus,
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
            const highlightClass = isHighlighted ? 'ladder-track-highlighted' : (isDimmed ? 'ladder-track-dimmed' : '');
            const passingTargets = (reqMarks || []).map(m => ({ ...m, target: m.count * 3 }));

            return `
            <div class="ladder-track-row ${isTrackEmpty ? 'ladder-track-empty' : ''} ${isTopTrack ? 'ladder-track-top' : ''} ${highlightClass}" data-ladder-ing="${ing.id}">
              <div class="ladder-track-header ${isDimmed ? 'ladder-track-disabled-header' : 'clickable-ing-header'}" 
                   ${isDimmed ? 'tabindex="-1"' : `onclick="window.WikiDB.openIngredientRankingModal('${ing.id}')" role="button" tabindex="0"`} 
                   title="${ingName} (${isEN ? 'Base Energy' : '基礎能量'} ${ing.energy}) · ${isHighlighted ? (isEN ? 'Selected Dish: ' : '選定料理: ') + targetDishName + ` (${targetDishNeed}${isEN ? '/meal' : '顆/餐'})` : (isDimmed ? (isEN ? 'Not in current recipe' : '非此料理所需食材') : (isEN ? 'Key Dish: ' : '核心大菜: ') + dishName)} · ${isEN ? 'Click to view rankings' : '點擊查看產量排名'}">
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
                    const widthPct = Math.max(0.5, (maxPct - minPct)).toFixed(2);
                    return `
                      <div class="ladder-span-bar" 
                           data-pkm-group="${p.name}" 
                           style="left: ${minPct}%; width: ${widthPct}%;"
                           title="${pkmDisplayName} ${isEN ? 'Range: ' : '配方跨度: '}${minCount} ~ ${maxCount} ${isEN ? '/day' : '顆/天'}">
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

                      // 料理供應能力試算 (若有選取料理則依選定料理單餐需求計算，否則依核心大菜計算)
                      const mealsPerDay = (node.scaledCount / targetDishNeed).toFixed(1);
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
                      const alignClass = basePosPct > 60 ? 'align-right' : (basePosPct < 40 ? 'align-left' : 'align-center');
                      const leftStyle = offsetPx === 0 ? `${basePosPct}%` : `calc(${basePosPct}% + ${offsetPx}px)`;
                      const hasSkillDraw = node.skillBonus > 0;
                      const dishLabel = isHighlighted ? (isEN ? 'Selected Dish: ' : '選定料理: ') : (isEN ? 'Key Dish: ' : '核心大菜: ');

                      return `
                        <div class="ladder-node ${node.isTopNode ? 'node-top1' : ''} ${hasSkillDraw ? 'node-has-skill-draw' : ''} ${alignClass} ${popupDirectionClass} recipe-${node.v.recipe.toLowerCase()} ${groupSize > 1 ? 'node-in-cluster' : ''}" 
                             data-pkm-group="${node.p.name}"
                             data-pkm="${node.p.name}" 
                             data-recipe="${node.v.recipe}"
                             style="left: ${leftStyle}; z-index: ${node.zIndex};">
                          <div class="node-avatar-wrapper">
                            <img src="${node.p.icon}" class="node-avatar-img" alt="${node.pkmDisplayName}" loading="lazy" decoding="async">
                          </div>
                          <div class="node-count-badge ${hasSkillDraw ? 'badge-skill-draw' : ''}" ${hasSkillDraw ? `title="${isEN ? 'Base Drop: ' + node.dropCount + ' + Ingr. Selection Lv.7: ' + node.skillBonus : '常規食材掉落: ' + node.dropCount + ' + 食材精選S Lv.7: ' + node.skillBonus}"` : ''}>
                            ${node.scaledCount}
                          </div>
                          
                          <div class="ladder-node-tooltip">
                            <div class="tooltip-title">${node.isTopNode ? (isEN ? 'Top 1 Yield ' : '產量 TOP 1 ') : ''}${node.pkmDisplayName} <span class="node-recipe-tag-inline recipe-tag-${node.v.recipe.toLowerCase()}">${node.v.recipe}</span></div>
                            <div class="tooltip-detail">${isEN ? 'Est. Daily Output: ' : '預估總日產：'}<span class="text-success font-bold">${node.scaledCount} ${isEN ? '/day' : '顆/天'}</span></div>
                            
                            ${hasSkillDraw ? `
                              <!-- 食材掉落與技能獲取雙區塊拆解 -->
                              <div class="tooltip-yield-breakdown">
                                <div class="breakdown-row">
                                  <span class="breakdown-label">${isEN ? 'Ingredient Drop:' : '常規食材掉落：'}</span>
                                  <span class="breakdown-val">${node.dropCount} ${isEN ? 'items' : '顆'}</span>
                                </div>
                                <div class="breakdown-row breakdown-skill">
                                  <span class="breakdown-label">${isEN ? 'Ingr. Selection S (Lv.7):' : '食材精選S 獲取 (Lv.7)：'}</span>
                                  <span class="breakdown-val">+${node.skillBonus} ${isEN ? 'items' : '顆'}</span>
                                </div>
                              </div>
                            ` : ''}

                            <!-- 料理供貨能力指標 (動態對應選定料理，以料理圖示代替名稱) -->
                            <div class="tooltip-dish-box">
                              <div class="tooltip-dish-title">${dishLabel}${targetDishIcon ? `<img src="${targetDishIcon}" class="tooltip-dish-icon" alt="${escapeHtml(targetDishName)}" title="${escapeHtml(targetDishName)}" loading="lazy">` : `<span class="text-white font-bold">${targetDishName}</span>`} (${targetDishNeed}${isEN ? '/meal' : '顆/餐'})</div>
                              <div class="tooltip-dish-badge ${dishBadgeClass}">${dishTag}</div>
                            </div>

                            <div class="tooltip-note">${formatLadderNote(node.v.note || '', isEN)}</div>
                          </div>
                        </div>
                      `;
                    }).join('');
                  })()}
                </div>

                <!-- 三餐及格線 (3 Meals Passing Line) - 置於節點容器後，確保不被覆蓋 -->
                ${passingTargets.map(m => `
                  <div class="ladder-passing-line-container" style="left: ${getPosPct(m.target)}%; --ladder-passing-line-color: ${m.color}; --ladder-passing-line-glow: ${m.color};" title="${isEN ? '3 Meals Target: ' : '三餐及格線: '}${m.target} ${isEN ? 'items' : '顆'}">
                    <div class="ladder-passing-line"></div>
                    <div class="ladder-passing-badge" style="color:${m.color};border-color:${m.color}">
                      <span class="ladder-passing-num">${m.target}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
          }).join('')}

          <!-- 獨立美味尾巴專屬天梯小看板 (0 ~ 20 獨立刻度，支援高亮與及格線) -->
          ${tailIng ? (() => {
            const tailReqMarks = highlightMarks.get('美味尾巴') || highlightMarks.get('Slowpoke Tail') || [];
            const tailReqCount = highlightedIngMap ? (highlightedIngMap.get('美味尾巴') || highlightedIngMap.get('Slowpoke Tail')) : null;
            const isTailHighlighted = tailReqMarks.length > 0;
            const isTailDimmed = highlightedIngMap && !isTailHighlighted;
            const tailPassingTargets = tailReqMarks.map(m => ({ ...m, target: m.count * 3 }));
            const tailThreeMealsTarget = isTailHighlighted ? Math.max(...tailPassingTargets.map(m => m.target)) : null;

            let tailMax = 20;
            if (isTailHighlighted && tailThreeMealsTarget > tailMax) {
              tailMax = Math.ceil(tailThreeMealsTarget / 5) * 5;
            }
            const tailStep = tailMax > 30 ? 10 : 5;
            const tailTicks = [];
            for (let t = 0; t <= tailMax; t += tailStep) {
              tailTicks.push(t);
            }
            if (tailTicks[tailTicks.length - 1] < tailMax) {
              tailTicks.push(tailMax);
            }
            function getTailPct(val) {
              const clamped = Math.min(Math.max(val, 0), tailMax);
              return ((clamped / tailMax) * 100).toFixed(2);
            }
            const tailDishInfo = TOP_RECIPES_FOR_INGREDIENTS.tail || { need: 10 };
            let tailTop5Threshold = 0;
            if (ladderSupplyFilter === 'TOP') {
              const allMaxCounts = tailIng.pokemon.map(pkm => Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => v.count)));
              const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
              tailTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
            }
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
                const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => v.count));
                if (pkmMaxCount < tailTop5Threshold) return null;
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
              <div class="ladder-tail-standalone-container ${isTailDimmed ? 'ladder-track-dimmed' : ''}">
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
                  </div>

                  <div class="ladder-tail-track-row ${isTailEmpty ? 'ladder-track-empty' : ''} ${isTailDimmed ? 'ladder-track-dimmed' : (isTailHighlighted ? 'ladder-track-highlighted' : '')}" data-ladder-ing="tail">
                    <div class="ladder-track-header ${isTailDimmed ? 'ladder-track-disabled-header' : 'clickable-ing-header'}" 
                         ${isTailDimmed ? 'tabindex="-1"' : `onclick="window.WikiDB.openIngredientRankingModal('tail')" role="button" tabindex="0"`} 
                         title="${isEN ? 'Slowpoke Tail' : '美味尾巴'} · ${isTailDimmed ? (isEN ? 'Not required for this recipe' : '非此料理所需食材') : (isEN ? 'Click to view rankings' : '點擊查看產量排名')}">
                      <img src="${tailIng.icon}" class="ladder-ing-icon" alt="${isEN ? 'Slowpoke Tail' : '美味尾巴'}">
                    </div>

                    <div class="ladder-tail-canvas">
                      <div class="ladder-grid-lines">
                        ${tailTicks.map(t => `<div class="ladder-grid-line" style="left: ${getTailPct(t)}%;"></div>`).join('')}
                      </div>

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

                      <!-- 尾巴三餐及格線 - 置於節點容器後，確保不被覆蓋 -->
                      ${tailPassingTargets.map(m => `
                        <div class="ladder-passing-line-container" style="left: ${getTailPct(m.target)}%; --ladder-passing-line-color: ${m.color}; --ladder-passing-line-glow: ${m.color};" title="${isEN ? '3 Meals Target: ' : '三餐及格線: '}${m.target} ${isEN ? 'items' : '顆'}">
                          <div class="ladder-passing-line"></div>
                          <div class="ladder-passing-badge" style="color:${m.fg};border-color:${m.color}">
                            <span class="ladder-passing-num">${m.target}</span>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            `;
          })() : ''}
        </div>
      </div>
    `;
    if (cacheKey) {
      _coordLadderRenderCache = { key: cacheKey, html: renderedHtml };
    }
    return renderedHtml;
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
        const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
        const scaledCount = Math.round(rawCountNum * mult) + skillBonus;
        if (ladderSupplyFilter === 'TOP' && tIdx >= 5) return false;
        if (ladderSupplyFilter === 'MEALS_3' && scaledCount < dishInfo.need * 3) return false;
        if (ladderSupplyFilter === 'MEALS_2' && scaledCount < dishInfo.need * 2) return false;

        return true;
      });

      if (ladderTop15Only && filteredTiers.length > 15) {
        filteredTiers = filteredTiers.slice(0, 15);
      }

      const maxDailyBase = filteredTiers.length > 0 ? Math.max(...filteredTiers.map(t => {
        const rawCountNum = parseFloat(t.rawCount !== undefined ? t.rawCount : (String(t.count).replace(/[^\d.]/g, '') || t.count)) || 0;
        const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
        return rawCountNum * mult + skillBonus;
      })) : 0;
      const scaledMax = maxDailyBase.toFixed(1);

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
            const skillBonus = getPokemonSkillDrawBonus(t.name, ing.id, ing.name);
            const dropCount = (rawCountNum * mult).toFixed(1);
            const totalCount = (parseFloat(dropCount) + skillBonus).toFixed(1);
            const displayCount = skillBonus > 0
              ? `${totalCount} ${isEN ? '/day' : '顆/天'} <span class="ladder-split-text" style="font-size: 11px; color: #f59e0b; font-weight: normal; margin-left: 4px;">(${dropCount} + ${skillBonus})</span>`
              : `${dropCount} ${isEN ? '/day' : '顆/天'}`;

            return `
            <div class="ladder-tier-row">
              <div class="ladder-tier-info">
                <span class="ladder-pkm-name font-bold">${pkmDisplayName}</span>
                <span class="ladder-count text-accent font-bold">${displayCount}</span>
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
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';

    const catNameMap = {
      energy: isEN ? 'Strength' : '能量系',
      energy_heal: isEN ? 'Energy Heal' : '活力系',
      ingredient: isEN ? 'Ingredients' : (isCN ? '食材与料理' : '食材與料理'),
      special: isEN ? 'Special/Legend' : (isCN ? '神兽与特殊专属' : '神獸與特殊專屬'),
      shards: isEN ? 'Dream Shards' : (isCN ? '梦之碎片' : '夢之碎片')
    };

    const toSimp = (s) => (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') ? window.I18N.toSimplified(s) : s;

    return skills.map(skill => {
      let valuesHtml = '';
      const rawSkillName = skill.name || skill.id;
      const skillName = (window.I18N && typeof window.I18N.getMainSkillName === 'function')
        ? (window.I18N.getMainSkillName(rawSkillName) || skill.name_en || rawSkillName)
        : (isEN ? (skill.name_en || rawSkillName) : (toSimp(rawSkillName)));
      const catLabel = catNameMap[skill.category] || toSimp(skill.catName);
      const unitLabel = isEN ? (skill.unit_en || (skill.unit.includes('能量') ? ' Strength' : (skill.unit.includes('食材') ? ' Ingredients' : (skill.unit.includes('次') ? ' Helps' : (skill.unit.includes('點') ? ' Energy' : skill.unit))))) : toSimp(skill.unit);

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

      const skillDesc = isEN ? (skill.desc_en || skill.desc) : (isCN && window.I18N ? window.I18N.toSimplified(skill.desc) : skill.desc);
      const specialNote = skill.specialNote ? (isEN ? (skill.specialNote_en || skill.specialNote) : (isCN && window.I18N ? window.I18N.toSimplified(skill.specialNote) : skill.specialNote)) : null;
      const penaltyNote = skill.penaltyNote ? (isEN ? (skill.penaltyNote_en || skill.penaltyNote) : (isCN && window.I18N ? window.I18N.toSimplified(skill.penaltyNote) : skill.penaltyNote)) : null;

      const isVisible = currentSkillsCategory === 'all' || skill.category === currentSkillsCategory;
      return `
        <div class="wiki-skill-card clickable-card" id="skill-card-${skill.id}" data-category="${skill.category}" style="display: ${isVisible ? 'flex' : 'none'} !important;" onclick="window.WikiDB.toggleSkillCard(this, '${skill.id}', event)">
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
