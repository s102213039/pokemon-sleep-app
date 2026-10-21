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
        const curHash = (window.location && window.location.hash) ? window.location.hash.replace(/^#/, '') : '';
        const mainPart = curHash.split(/[/_?]/)[0];
        if (mainPart === 'wiki' || !mainPart) {
          window.history.replaceState(null, '', '#wiki/' + targetTab);
        }
      }
    } catch (e) {}

    const allSubtabBtns = document.querySelectorAll('.wiki-subtab-btn');
    allSubtabBtns.forEach(b => {
      if (b.getAttribute('data-subtab') === targetTab) {
        b.classList.add('active');
        try {
          if (typeof b.scrollIntoView === 'function') {
            b.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
          }
        } catch (e) {}
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
    const wikiPanel = document.getElementById('panel-wiki');
    const isWikiMainActive = !!(wikiPanel && (
      (wikiPanel.style.display !== 'none' && !wikiPanel.hidden) ||
      (typeof document !== 'undefined' && document.getElementById('tab-wiki') && document.getElementById('tab-wiki').classList.contains('active'))
    ));

    if (isMobileH5) {
      if (isWikiMainActive && targetTab === 'ingredients') {
        document.body.classList.add('ladder-active');
      } else {
        document.body.classList.remove('ladder-active');
      }
      if (isWikiMainActive && targetTab === 'values') {
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
      if (isWikiMainActive && targetTab === 'ingredients') {
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
      if (isWikiMainActive && targetTab === 'ingredients') {
        const isCollapsed = ladderSidebar ? ladderSidebar.classList.contains('collapsed') : true;
        if (isCollapsed) {
          ladderHandle.classList.remove('drawer-open');
          ladderHandle.style.display = 'flex';
          ladderHandle.style.opacity = '1';
          ladderHandle.style.pointerEvents = 'auto';
          ladderHandle.style.visibility = 'visible';
        } else {
          ladderHandle.classList.add('drawer-open');
          ladderHandle.style.display = 'none';
          ladderHandle.style.opacity = '0';
          ladderHandle.style.pointerEvents = 'none';
          ladderHandle.style.visibility = 'hidden';
        }
        updateLadderActiveFilterBadge();
      } else {
        ladderHandle.classList.add('drawer-open');
        ladderHandle.style.display = 'none';
        ladderHandle.style.opacity = '0';
        ladderHandle.style.pointerEvents = 'none';
      }
    }

    const ladderRecipeFab = document.getElementById('ladder-recipe-highlight-fab');
    if (ladderRecipeFab && ladderRecipeFab.style) {
      if (typeof ladderRecipeFab.style.removeProperty === 'function') {
        ladderRecipeFab.style.removeProperty('display');
      }
      if (isWikiMainActive && targetTab === 'ingredients') {
        ladderRecipeFab.style.display = 'flex';
        updateLadderRecipeFabState();
      } else {
        ladderRecipeFab.style.display = 'none';
        closeLadderRecipeModal();
      }
    }

    if (targetTab === 'ratings') {
      try {
        initCalcCustomSelects();
        recalcSleepDays();
      } catch (e) {}
    }

    if (targetTab === 'items') {
      try {
        renderFilteredItemsGrid();
      } catch (e) {}
    }

    if (targetTab === 'islands') {
      try {
        const islandsPanel = document.getElementById('wiki-subpanel-islands');
        if (islandsPanel && !islandsPanel.querySelector('.island-nav-strip')) {
          refreshIslandsSubpanel();
        } else {
          placeIslandSceneLayer();
        }
        try { bindIslandSpawnsCoordinator(); } catch (e) {}
      } catch (e) {}
    } else {
      try { releaseIslandSpawnsPin(); } catch (e) {}
      try { placeIslandSceneLayer(); } catch (e) {}
    }
  }

  function openLadderSidebar() {
    toggleLadderSidebar(true);
  }

  function closeLadderSidebar() {
    toggleLadderSidebar(false);
  }

  function toggleLadderSidebar(forceState) {
    const sidebar = getOverlayEl('ladder-filter-sidebar');
    const backdrop = getOverlayEl('ladder-sidebar-backdrop');
    const bookmarkHandle = getOverlayEl('ladder-sidebar-bookmark-handle');
    const ladderRecipeFab = document.getElementById('ladder-recipe-highlight-fab');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (bookmarkHandle) {
        bookmarkHandle.classList.remove('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'false');
        bookmarkHandle.title = isEN ? 'Expand Filter' : '展開天梯篩選側邊欄';
        bookmarkHandle.style.opacity = '1';
        bookmarkHandle.style.pointerEvents = 'auto';
        bookmarkHandle.style.display = 'flex';
        bookmarkHandle.style.visibility = 'visible';
      }
      if (ladderRecipeFab && currentWikiSubTab === 'ingredients') {
        ladderRecipeFab.classList.remove('drawer-open');
        ladderRecipeFab.style.display = 'flex';
      }
      if (typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_ladder_sidebar_open', false);
      }
    } else {
      if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
      sidebar.classList.remove('collapsed');
      sidebar.style.setProperty('display', 'flex', 'important');
      if (backdrop && (isMobileH5 || window.innerWidth <= 1024)) {
        backdrop.classList.add('active');
      }
      if (bookmarkHandle) {
        bookmarkHandle.classList.add('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'true');
        bookmarkHandle.title = isEN ? 'Collapse Filter' : '收合天梯篩選側邊欄';
        bookmarkHandle.style.opacity = '0';
        bookmarkHandle.style.pointerEvents = 'none';
        bookmarkHandle.style.display = 'none';
        bookmarkHandle.style.visibility = 'hidden';
      }
      if (ladderRecipeFab) {
        ladderRecipeFab.classList.add('drawer-open');
        ladderRecipeFab.style.display = 'none';
      }
      if (typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_ladder_sidebar_open', true);
      }
    }
    if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
  }

  function toggleLadderEnergyHelp(event) {
    if (event) {
      if (typeof event.stopPropagation === 'function') event.stopPropagation();
      if (typeof event.preventDefault === 'function') event.preventDefault();
    }
    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const btn = (event && (event.currentTarget || event.target))
      || (ladderPanel && typeof ladderPanel.querySelector === 'function' ? ladderPanel.querySelector('.ladder-formula-help-btn') : (typeof document.querySelector === 'function' ? document.querySelector('.ladder-formula-help-btn') : null));
    const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : 'zh-TW';
    const isEN = lang === 'en-US';
    const isCN = lang === 'zh-CN';
    const title = isEN ? 'Baseline: Lv.60 Ideal Energy' : (isCN ? '天梯基准：Lv.60 满活力' : '天梯基準：Lv.60 滿活力');
    const body = isEN
      ? 'Calculated at Lv.60 under ideal energy (≥80%, 0.45x interval) for daily yield.'
      : (isCN
        ? '以 Lv.60 满活力理想状态 (活力 ≥ 80%，间隔 0.45x) 试算单日产能。'
        : '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算單日產能。');

    if (window.PokemonApp && typeof window.PokemonApp.toggleGlobalTooltip === 'function') {
      window.PokemonApp.toggleGlobalTooltip(btn, title, body);
    } else {
      const popover = document.getElementById('ladder-energy-help-popover');
      if (!popover) return;
      const isVisible = popover.style.display === 'block';
      popover.style.display = isVisible ? 'none' : 'block';
    }
  }

  function closeLadderEnergyHelp(event) {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    if (window.PokemonApp && typeof window.PokemonApp.hideGlobalTooltip === 'function') {
      window.PokemonApp.hideGlobalTooltip();
    }
    const popover = document.getElementById('ladder-energy-help-popover');
    if (popover) popover.style.display = 'none';
  }

  function getCurrentSubTab() {
    return currentWikiSubTab;
  }

  // 2. 篩選技能類型 (all / energy / energy_heal / ingredient / special / shards)
  function filterWikiSkills(category) {
    if (!category) return;
    if (!VALID_SKILLS_CATEGORIES.includes(category)) category = 'all';
    currentSkillsCategory = category;

    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_SKILLS_CATEGORY, category);
      }
    } catch (e) {}

    const skillsPanel = document.getElementById('wiki-subpanel-skills') || document.getElementById('panel-wiki') || document;
    const allPills = (typeof skillsPanel.querySelectorAll === 'function') ? skillsPanel.querySelectorAll('[data-skill-cat]') : document.querySelectorAll('[data-skill-cat]');
    allPills.forEach(b => {
      if (b.getAttribute('data-skill-cat') === category) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const allCards = (typeof skillsPanel.querySelectorAll === 'function') ? skillsPanel.querySelectorAll('.wiki-skill-card') : document.querySelectorAll('.wiki-skill-card');
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

    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const ladderSidebar = document.getElementById('ladder-filter-sidebar') || ladderPanel;
    const allPills = (typeof ladderSidebar.querySelectorAll === 'function') ? ladderSidebar.querySelectorAll('[data-ing-filter]') : document.querySelectorAll('[data-ing-filter]');
    allPills.forEach(b => {
      if (b.getAttribute('data-ing-filter') === ingId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const allLadderCards = (typeof ladderPanel.querySelectorAll === 'function') ? ladderPanel.querySelectorAll('.ladder-card, .ladder-track-row') : document.querySelectorAll('.ladder-card, .ladder-track-row');
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
    "烏波": "食材", "烏波（帕底亞的樣子）": "食材", "烏波（阿羅拉的樣子）": "食材", "沼王": "食材", "土王": "食材",
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
    "快泳蛙": "樹果", "胡地": "技能", "怪力": "食材", "臭臭泥": "技能",
    "哎呀球菇": "食材", "敗露球菇": "食材"
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
    _wikiPkmIdxArr = arr;
    _wikiPkmIdxLen = arr.length;
    _wikiPkmIdxMap = map;
    return map;
  }

  function getPokemonLadderSpecialty(pkmName) {
    if (!pkmName) return '食材';
    const pkmDataLen = (typeof window !== 'undefined' && Array.isArray(window.POKEMON_DATA)) ? window.POKEMON_DATA.length : 0;
    if (pkmDataLen !== _ladderSpecCachePkmLen) {
      _ladderSpecCache = Object.create(null);
      _ladderSpecCachePkmLen = pkmDataLen;
    }
    const cached = _ladderSpecCache[pkmName];
    if (cached !== undefined) return cached;

    const clean = pkmName.replace(/（.*）|\(.*\)/g, '').trim();
    let res = '食材';
    // 1. 若全域寶可夢資料庫（window.POKEMON_DATA）已載入，優先使用官方資料集
    if (pkmDataLen > 0) {
      const idx = _getWikiPkmIndex(window.POKEMON_DATA);
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

  const TOP_RECIPES_FOR_INGREDIENTS = {
    apple: { name: '蘋果酸優格沙拉', name_en: 'Apple Acid Yogurt-Dressed Salad', need: 28, type: '沙拉', type_en: 'Salad', energy: 19293, icon: 'https://www.serebii.net/pokemonsleep/meals/appleacidyogurt-dressedsalad.png', secondary: '電光香料可樂 (35)', secondary_en: 'Zing Zap Spiced Cola (35)' },
    milk: { name: '茂盛焗烤酪梨', name_en: 'Overgrow Avocado Gratin', need: 41, type: '咖哩', type_en: 'Curry', energy: 24802, icon: 'https://www.serebii.net/pokemonsleep/meals/overgrowavocadogratin.png', secondary: '土王閃電泡芙 (26)', secondary_en: 'Clodsire Eclair (26)' },
    soybeans: { name: '重踏酪梨醬脆片', name_en: 'Bulldoze Guacamole and Chips', need: 22, type: '沙拉', type_en: 'Salad', energy: 25162, icon: 'https://www.serebii.net/pokemonsleep/meals/bulldozeguacamoleandchips.png', secondary: '覺醒力量濃湯 (28)', secondary_en: 'Hidden Power Perk-Up Stew (28)' },
    honey: { name: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 38, type: '甜點', type_en: 'Dessert', energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', secondary: '心跳加速鬼面鬆餅 (32)', secondary_en: 'Scary Face Pancakes (32)' },
    sausage: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 20, type: '咖哩', type_en: 'Curry', energy: 25539, icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png', secondary: '居合斬壽喜燒咖哩 (26)', secondary_en: 'Cut Sukiyaki Curry (26)' },
    ginger: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 39, type: '咖哩', type_en: 'Curry', energy: 25539, icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png', secondary: '電光香料可樂 (20)', secondary_en: 'Zing Zap Spiced Cola (20)' },
    tomato: { name: '心跳加速鬼面鬆餅', name_en: 'Scary Face Pancakes', need: 29, type: '甜點', type_en: 'Dessert', energy: 24354, icon: 'https://www.serebii.net/pokemonsleep/meals/scaryfacepancakes.png', secondary: '蘋果酸優格沙拉 (23)', secondary_en: 'Apple Acid Yogurt-Dressed Salad (23)' },
    egg: { name: '心跳加速鬼面鬆餅', name_en: 'Scary Face Pancakes', need: 24, type: '甜點', type_en: 'Dessert', energy: 24354, icon: 'https://www.serebii.net/pokemonsleep/meals/scaryfacepancakes.png', secondary: '居合斬壽喜燒咖哩 (22)', secondary_en: 'Cut Sukiyaki Curry (22)' },
    oil: { name: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 28, type: '甜點', type_en: 'Dessert', energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', secondary: '茂盛焗烤酪梨 (32)', secondary_en: 'Overgrow Avocado Gratin (32)' },
    potato: { name: '大塊滿滿熱水沙拉', name_en: 'Scald Chunky Salad', need: 30, type: '沙拉', type_en: 'Salad', energy: 25356, icon: 'https://www.serebii.net/pokemonsleep/meals/scaldchunkysalad.png', secondary: '茂盛焗烤酪梨 (20)', secondary_en: 'Overgrow Avocado Gratin (20)' },
    herb: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 22, type: '咖哩', type_en: 'Curry', energy: 25539, icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png', secondary: '重踏酪梨醬脆片 (30)', secondary_en: 'Bulldoze Guacamole and Chips (30)' },
    corn: { name: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 28, type: '甜點', type_en: 'Dessert', energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', secondary: '大塊滿滿熱水沙拉 (18)', secondary_en: 'Scald Chunky Salad (18)' },
    cacao: { name: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', need: 21, type: '甜點', type_en: 'Dessert', energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', secondary: '土王閃電泡芙 (30)', secondary_en: 'Clodsire Eclair (30)' },
    coffee: { name: '土王閃電泡芙', name_en: 'Clodsire Eclair', need: 24, type: '甜點', type_en: 'Dessert', energy: 20885, icon: 'https://www.serebii.net/pokemonsleep/meals/clodsireeclair.png', secondary: '不服輸咖啡沙拉 (28)', secondary_en: 'Defiant Coffee-Dressed Salad (28)' },
    glossyavocado: { name: '重踏酪梨醬脆片', name_en: 'Bulldoze Guacamole and Chips', need: 28, type: '沙拉', type_en: 'Salad', energy: 25162, icon: 'https://www.serebii.net/pokemonsleep/meals/bulldozeguacamoleandchips.png', secondary: '茂盛焗烤酪梨 (22)', secondary_en: 'Overgrow Avocado Gratin (22)' },
    mushroom: { name: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', need: 31, type: '咖哩', type_en: 'Curry', energy: 25539, icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png', secondary: '大塊滿滿熱水沙拉 (27)', secondary_en: 'Scald Chunky Salad (27)' },
    leek: { name: '居合斬壽喜燒咖哩', name_en: 'Cut Sukiyaki Curry', need: 27, type: '咖哩', type_en: 'Curry', energy: 20655, icon: 'https://www.serebii.net/pokemonsleep/meals/cutsukiyakicurry.png', secondary: '電光香料可樂 (20)', secondary_en: 'Zing Zap Spiced Cola (20)' },
    pumpkin: { name: '大塊滿滿熱水沙拉', name_en: 'Scald Chunky Salad', need: 20, type: '沙拉', type_en: 'Salad', energy: 25356, icon: 'https://www.serebii.net/pokemonsleep/meals/scaldchunkysalad.png', secondary: '心跳加速鬼面鬆餅 (18)', secondary_en: 'Scary Face Pancakes (18)' },
    tail: { name: '呆呆獸尾巴的胡椒沙拉', name_en: 'Slowpoke Tail Pepper Salad', need: 10, type: '沙拉', type_en: 'Salad', energy: 8169, icon: 'https://www.serebii.net/pokemonsleep/meals/slowpoketailpeppersalad.png', secondary: '炙燒尾肉咖哩 (8)', secondary_en: 'Grilled Tail Curry (8)' }
  };

  // 食材天梯各分類前 7 高基礎能量之頂級大菜 (咖哩、沙拉、甜點三大類各 7 種)
  const TOP_RECIPES_BY_CATEGORY = {
    curry: [
      {
        name_cn: '彈跳咖哩烏龍麵',
        name_en: 'Bounce Curry Udon',
        category: '咖哩',
        pot_size: 112,
        base_energy: 25539,
        icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png',
        ingredients: [
          { name: '暖暖薑', count: 39, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
          { name: '品鮮蘑菇', count: 31, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
          { name: '火辣香草', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
          { name: '豆製肉', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' }
        ]
      },
      {
        name_cn: '茂盛焗烤酪梨',
        name_en: 'Overgrow Avocado Gratin',
        category: '咖哩',
        pot_size: 115,
        base_energy: 24802,
        icon: 'https://www.serebii.net/pokemonsleep/meals/overgrowavocadogratin.png',
        ingredients: [
          { name: '哞哞鮮奶', count: 41, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' },
          { name: '純粹油', count: 32, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '嫩亮酪梨', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png' },
          { name: '窩心洋芋', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' }
        ]
      },
      {
        name_cn: '居合斬壽喜燒咖哩',
        name_en: 'Cut Sukiyaki Curry',
        category: '咖哩',
        pot_size: 101,
        base_energy: 20655,
        icon: 'https://www.serebii.net/pokemonsleep/meals/cutsukiyakicurry.png',
        ingredients: [
          { name: '粗枝大蔥', count: 27, icon: 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png' },
          { name: '豆製肉', count: 26, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
          { name: '甜甜蜜', count: 26, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
          { name: '特選蛋', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' }
        ]
      },
      {
        name_cn: '覺醒力量濃湯',
        name_en: 'Hidden Power Perk-Up Stew',
        category: '咖哩',
        pot_size: 92,
        base_energy: 19061,
        icon: 'https://www.serebii.net/pokemonsleep/meals/hiddenpowerperk-upstew.png',
        ingredients: [
          { name: '萌綠大豆', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
          { name: '好眠番茄', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
          { name: '品鮮蘑菇', count: 23, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
          { name: '醒腦咖啡豆', count: 16, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' }
        ]
      },
      {
        name_cn: '扮演南瓜精濃湯',
        name_en: 'Role Play Pumpkaboo Stew',
        category: '咖哩',
        pot_size: 69,
        base_energy: 15621,
        icon: 'https://www.serebii.net/pokemonsleep/meals/roleplaypumpkaboostew.png',
        ingredients: [
          { name: '品鮮蘑菇', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
          { name: '窩心洋芋', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
          { name: '豆製肉', count: 16, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
          { name: '沉甸甸南瓜', count: 10, icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png' }
        ]
      },
      {
        name_cn: '煉獄玉米乾咖哩',
        name_en: 'Inferno Corn Keema Curry',
        category: '咖哩',
        pot_size: 77,
        base_energy: 13690,
        icon: 'https://www.serebii.net/pokemonsleep/meals/infernocornkeemacurry.png',
        ingredients: [
          { name: '火辣香草', count: 27, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
          { name: '豆製肉', count: 24, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
          { name: '萌綠玉米', count: 14, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
          { name: '暖暖薑', count: 12, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' }
        ]
      },
      {
        name_cn: '萌綠咖哩麵包',
        name_en: 'Greengrass Curry Bun',
        category: '咖哩',
        pot_size: 63,
        base_energy: 10945,
        icon: 'https://www.serebii.net/pokemonsleep/meals/greengrasscurrybun.png',
        ingredients: [
          { name: '暖暖薑', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
          { name: '火辣香草', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
          { name: '純粹油', count: 15, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '萌綠大豆', count: 8, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' }
        ]
      }
    ],
    salad: [
      {
        name_cn: '大塊滿滿熱水沙拉',
        name_en: 'Scald Chunky Salad',
        category: '沙拉',
        pot_size: 95,
        base_energy: 25356,
        icon: 'https://www.serebii.net/pokemonsleep/meals/scaldchunkysalad.png',
        ingredients: [
          { name: '窩心洋芋', count: 30, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
          { name: '品鮮蘑菇', count: 27, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
          { name: '沉甸甸南瓜', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png' },
          { name: '萌綠玉米', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' }
        ]
      },
      {
        name_cn: '重踏酪梨醬脆片',
        name_en: 'Bulldoze Guacamole and Chips',
        category: '沙拉',
        pot_size: 105,
        base_energy: 25162,
        icon: 'https://www.serebii.net/pokemonsleep/meals/bulldozeguacamoleandchips.png',
        ingredients: [
          { name: '火辣香草', count: 30, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
          { name: '嫩亮酪梨', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png' },
          { name: '萌綠玉米', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
          { name: '萌綠大豆', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' }
        ]
      },
      {
        name_cn: '不服輸咖啡沙拉',
        name_en: 'Defiant Coffee-Dressed Salad',
        category: '沙拉',
        pot_size: 100,
        base_energy: 20218,
        icon: 'https://www.serebii.net/pokemonsleep/meals/defiantcoffee-dressedsalad.png',
        ingredients: [
          { name: '醒腦咖啡豆', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
          { name: '豆製肉', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
          { name: '純粹油', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '窩心洋芋', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' }
        ]
      },
      {
        name_cn: '蘋果酸優格沙拉',
        name_en: 'Apple Acid Yogurt-Dressed Salad',
        category: '沙拉',
        pot_size: 104,
        base_energy: 19293,
        icon: 'https://www.serebii.net/pokemonsleep/meals/appleacidyogurt-dressedsalad.png',
        ingredients: [
          { name: '特選蛋', count: 35, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' },
          { name: '特選蘋果', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png' },
          { name: '好眠番茄', count: 23, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
          { name: '哞哞鮮奶', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' }
        ]
      },
      {
        name_cn: '落英繽紛含羞草蛋沙拉',
        name_en: 'Petal Blizzard Layered Salad',
        category: '沙拉',
        pot_size: 69,
        base_energy: 11811,
        icon: 'https://www.serebii.net/pokemonsleep/meals/petalblizzardlayeredsalad.png',
        ingredients: [
          { name: '特選蛋', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' },
          { name: '純粹油', count: 17, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '窩心洋芋', count: 15, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
          { name: '豆製肉', count: 12, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' }
        ]
      },
      {
        name_cn: '忍者沙拉',
        name_en: 'Ninja Salad',
        category: '沙拉',
        pot_size: 57,
        base_energy: 11659,
        icon: 'https://www.serebii.net/pokemonsleep/meals/ninjasalad.png',
        ingredients: [
          { name: '萌綠大豆', count: 19, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
          { name: '粗枝大蔥', count: 15, icon: 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png' },
          { name: '品鮮蘑菇', count: 12, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
          { name: '暖暖薑', count: 11, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' }
        ]
      },
      {
        name_cn: '萌綠沙拉',
        name_en: 'Greengrass Salad',
        category: '沙拉',
        pot_size: 62,
        base_energy: 11393,
        icon: 'https://www.serebii.net/pokemonsleep/meals/greengrasssalad.png',
        ingredients: [
          { name: '純粹油', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '萌綠玉米', count: 17, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
          { name: '好眠番茄', count: 14, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
          { name: '窩心洋芋', count: 9, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' }
        ]
      }
    ],
    dessert: [
      {
        name_cn: '採蜜巧克力格子鬆餅',
        name_en: 'Honey Gather Chocolate Waffles',
        category: '甜點',
        pot_size: 115,
        base_energy: 25484,
        icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png',
        ingredients: [
          { name: '甜甜蜜', count: 38, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
          { name: '萌綠玉米', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
          { name: '純粹油', count: 28, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
          { name: '放鬆可可', count: 21, icon: 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png' }
        ]
      },
      {
        name_cn: '心跳加速鬼面鬆餅',
        name_en: 'Scary Face Pancakes',
        category: '甜點',
        pot_size: 103,
        base_energy: 24354,
        icon: 'https://www.serebii.net/pokemonsleep/meals/scaryfacepancakes.png',
        ingredients: [
          { name: '甜甜蜜', count: 32, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
          { name: '好眠番茄', count: 29, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
          { name: '特選蛋', count: 24, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' },
          { name: '沉甸甸南瓜', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png' }
        ]
      },
      {
        name_cn: '土王閃電泡芙',
        name_en: 'Clodsire Eclair',
        category: '甜點',
        pot_size: 102,
        base_energy: 20885,
        icon: 'https://www.serebii.net/pokemonsleep/meals/clodsireeclair.png',
        ingredients: [
          { name: '放鬆可可', count: 30, icon: 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png' },
          { name: '哞哞鮮奶', count: 26, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' },
          { name: '醒腦咖啡豆', count: 24, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
          { name: '甜甜蜜', count: 22, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' }
        ]
      },
      {
        name_cn: '電光香料可樂',
        name_en: 'Zing Zap Spiced Cola',
        category: '甜點',
        pot_size: 87,
        base_energy: 17494,
        icon: 'https://www.serebii.net/pokemonsleep/meals/zingzapspicedcola.png',
        ingredients: [
          { name: '特選蘋果', count: 35, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png' },
          { name: '暖暖薑', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
          { name: '粗枝大蔥', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png' },
          { name: '醒腦咖啡豆', count: 12, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' }
        ]
      },
      {
        name_cn: '花之禮馬卡龍',
        name_en: 'Flower Gift Macarons',
        category: '甜點',
        pot_size: 77,
        base_energy: 13834,
        icon: 'https://www.serebii.net/pokemonsleep/meals/flowergiftmacarons.png',
        ingredients: [
          { name: '放鬆可可', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png' },
          { name: '特選蛋', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' },
          { name: '甜甜蜜', count: 17, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
          { name: '哞哞鮮奶', count: 10, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' }
        ]
      },
      {
        name_cn: '茶會玉米司康',
        name_en: 'Teatime Corn Scones',
        category: '甜點',
        pot_size: 67,
        base_energy: 10925,
        icon: 'https://www.serebii.net/pokemonsleep/meals/teatimecornscones.png',
        ingredients: [
          { name: '特選蘋果', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png' },
          { name: '暖暖薑', count: 20, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
          { name: '萌綠玉米', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
          { name: '哞哞鮮奶', count: 9, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' }
        ]
      },
      {
        name_cn: '青草攪拌器冰沙',
        name_en: 'Leaf Tornado Smoothie',
        category: '甜點',
        pot_size: 48,
        base_energy: 8165,
        icon: 'https://www.serebii.net/pokemonsleep/meals/leaftornadosmoothie.png',
        ingredients: [
          { name: '嫩亮酪梨', count: 18, icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png' },
          { name: '好眠番茄', count: 16, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
          { name: '哞哞鮮奶', count: 14, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' }
        ]
      }
    ]
  };

  const TAIL_FEATURED_RECIPES = [
    {
      name_cn: '炙燒尾肉咖哩',
      name_en: 'Grilled Tail Curry',
      category: '咖哩',
      pot_size: 33,
      base_energy: 7483,
      icon: 'https://www.serebii.net/pokemonsleep/meals/grilledtailcurry.png',
      ingredients: [
        { name: '美味尾巴', count: 8, icon: 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png' },
        { name: '火辣香草', count: 25, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' }
      ]
    },
    {
      name_cn: '呆呆獸尾巴的胡椒沙拉',
      name_en: 'Slowpoke Tail Pepper Salad',
      category: '沙拉',
      pot_size: 35,
      base_energy: 8169,
      icon: 'https://www.serebii.net/pokemonsleep/meals/slowpoketailpeppersalad.png',
      ingredients: [
        { name: '美味尾巴', count: 10, icon: 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png' },
        { name: '火辣香草', count: 10, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
        { name: '純粹油', count: 15, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' }
      ]
    }
  ];

  const ALL_TOP_CATEGORY_RECIPES = [
    ...TOP_RECIPES_BY_CATEGORY.curry,
    ...TOP_RECIPES_BY_CATEGORY.salad,
    ...TOP_RECIPES_BY_CATEGORY.dessert,
    ...TAIL_FEATURED_RECIPES
  ];

  if (typeof window !== 'undefined') {
    window.ALL_TOP_CATEGORY_RECIPES = ALL_TOP_CATEGORY_RECIPES;
  }

  function getLadderDishIcon(dishName) {
    if (!dishName) return '';
    const found = ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === dishName || r.name_en === dishName);
    if (found && found.icon) return found.icon;
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__)) {
      const cacheFound = window.__RECIPES_CACHE__.find(r => r.name_cn === dishName || r.name_en === dishName);
      if (cacheFound && cacheFound.icon) return cacheFound.icon;
    }
    return '';
  }

  // 全局前 7 高能量料理 (維持舊介面與單元測試相容性)
  const TOP_7_RECIPES_HIGHLIGHT = [
    TOP_RECIPES_BY_CATEGORY.curry[0],
    TOP_RECIPES_BY_CATEGORY.dessert[0],
    TOP_RECIPES_BY_CATEGORY.salad[0],
    TOP_RECIPES_BY_CATEGORY.salad[1],
    TOP_RECIPES_BY_CATEGORY.curry[1],
    TOP_RECIPES_BY_CATEGORY.dessert[1],
    TOP_RECIPES_BY_CATEGORY.dessert[2]
  ];

  let ladderRecipeCategory = 'curry';
  let ladderHighlightRecipe = null;
  let ladderRecipeMultiSelect = false;
  let ladderHighlightRecipes = [];

  const RECIPE_MARK_PALETTE = [
    { fg: '#0284c7', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },  // 1. 晴空藍 (Sky Blue)
    { fg: '#b45309', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' },  // 2. 琥珀金黃 (Amber Gold)
    { fg: '#c026d3', color: '#e879f9', bg: 'rgba(232, 121, 249, 0.2)' }, // 3. 桃紅洋紅 (Fuchsia Magenta)
    { fg: '#059669', color: '#34d399', bg: 'rgba(52, 211, 153, 0.2)' },  // 4. 翡翠綠 (Emerald Green)
    { fg: '#ea580c', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.2)' },  // 5. 鮮亮橘 (Vivid Orange)
    { fg: '#7c3aed', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.2)' }, // 6. 魅惑紫 (Electric Violet)
    { fg: '#dc2626', color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)' }, // 7. 珊瑚紅 (Coral Red)
    { fg: '#0d9488', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' }   // 8. 湖水青綠 (Seafoam Teal)
  ];

  function getRecipeMarkStyle(index) {
    return RECIPE_MARK_PALETTE[index % RECIPE_MARK_PALETTE.length];
  }

  function getActiveHighlightRecipes() {
    const names = ladderRecipeMultiSelect
      ? ladderHighlightRecipes.slice()
      : (ladderHighlightRecipe ? [ladderHighlightRecipe] : []);
    const seen = new Set();
    const list = [];
    names.forEach(n => {
      const rec = ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === n || r.name_en === n);
      if (!rec) return;
      if (seen.has(rec.name_cn)) return;
      seen.add(rec.name_cn);
      list.push(rec);
    });
    return list;
  }

  function buildHighlightIngState() {
    const recipes = getActiveHighlightRecipes();
    const map = new Map();
    const marks = new Map();
    recipes.forEach((rec, idx) => {
      const style = getRecipeMarkStyle(idx);
      (rec.ingredients || []).forEach(item => {
        const entry = { count: item.count, recipe: rec, ...style };
        const keys = [item.name];
        if (item.name === '美味尾巴') keys.push('Slowpoke Tail');
        if (item.name === 'Slowpoke Tail') keys.push('美味尾巴');
        keys.forEach(key => {
          const arr = marks.get(key) || [];
          arr.push(entry);
          marks.set(key, arr);
          map.set(key, Math.max(map.get(key) || 0, item.count || 0));
        });
      });
    });
    return { recipes, map, marks };
  }

  function isHighlightRecipeSelected(recipeName) {
    const recipes = getActiveHighlightRecipes();
    return recipes.some(r => r.name_cn === recipeName || r.name_en === recipeName);
  }

  function renderIngQtyMarks(markList) {
    if (!markList || !markList.length) return '';
    return `<div class="ladder-ing-qty-marks">${markList.map(m =>
      `<span class="ladder-ing-qty-mark" style="color:${m.fg};border-color:${m.color};background:${m.bg}">×${m.count}</span>`
    ).join('')}</div>`;
  }

  function getOverlayEl(id) {
    if (typeof window !== 'undefined' && typeof window.resolveUniqueOverlay === 'function') {
      return window.resolveUniqueOverlay(id);
    }
    return (typeof document !== 'undefined' && document.getElementById) ? document.getElementById(id) : null;
  }

  function switchLadderRecipeCategory(cat) {
    if (cat !== 'curry' && cat !== 'salad' && cat !== 'dessert') return;
    ladderRecipeCategory = cat;
    renderLadderRecipeModalContent();
  }

  function renderLadderRecipeModalContent(modalEl) {
    const modal = modalEl || getOverlayEl('ladder-recipe-modal');
    if (!modal) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 1. 渲染三大料理分類切換列
    const catBarEl = modal.querySelector('.ladder-recipe-cat-bar');
    if (catBarEl) {
      const categories = [
        { id: 'curry', name: '咖哩、濃湯', name_en: 'Curry & Stew' },
        { id: 'salad', name: '沙拉', name_en: 'Salad' },
        { id: 'dessert', name: '點心、飲料', name_en: 'Dessert & Drinks' }
      ];
      catBarEl.innerHTML = categories.map(cat => {
        const isActive = (ladderRecipeCategory === cat.id);
        const label = isEN ? cat.name_en : cat.name;
        return `<button type="button" class="ladder-recipe-cat-btn ${isActive ? 'active' : ''}" onclick="window.WikiDB.switchLadderRecipeCategory('${cat.id}')">${label}</button>`;
      }).join('');
    }

    // 2. 渲染當前分類下前 7 頂級料理卡片
    const bodyEl = modal.querySelector('.ladder-recipe-modal-body');
    if (bodyEl) {
      const list = TOP_RECIPES_BY_CATEGORY[ladderRecipeCategory] || [];
      bodyEl.innerHTML = list.map((r, rIdx) => {
        const isCurrent = isHighlightRecipeSelected(r.name_cn);
        const displayName = isEN ? r.name_en : r.name_cn;
        return `
          <div class="ladder-recipe-card ${isCurrent ? 'selected' : ''}" onclick="window.WikiDB.selectLadderHighlightRecipe('${r.name_cn}')" role="button" tabindex="0">
            <div class="recipe-card-top">
              <span class="recipe-card-rank">${rIdx + 1}</span>
              <img src="${r.icon}" class="recipe-card-icon" alt="${displayName}">
              <div class="recipe-card-meta">
                <div class="recipe-card-name-row">
                  <span class="recipe-card-name">${displayName}</span>
                  <span class="recipe-card-cat-badge cat-${r.category}">${r.category}</span>
                  ${isCurrent ? `<span class="recipe-card-active-pill">${isEN ? 'Active' : '目前選取'}</span>` : ''}
                </div>
                <div class="recipe-card-energy-row">
                  <span class="recipe-card-energy-num">${r.base_energy.toLocaleString()}</span>
                  <span class="recipe-card-pot">${isEN ? `Pot ${r.pot_size}` : `鍋容量 ${r.pot_size}`}</span>
                </div>
              </div>
            </div>
            <div class="recipe-card-ings-row">
              ${r.ingredients.map(ing => {
                const ingDisplayName = isEN ? ((window.I18N && window.I18N.getIngredientName(ing.name)) || ing.name) : ing.name;
                return `
                  <span class="recipe-card-ing-chip" title="${ingDisplayName}">
                    <img src="${ing.icon}" class="recipe-card-ing-icon" alt="${ingDisplayName}">
                    <span class="ing-chip-count">×${ing.count}</span>
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function openLadderRecipeModal() {
    const modal = getOverlayEl('ladder-recipe-modal');
    if (!modal) return;
    if (typeof window.portalMobileOverlays === 'function') {
      window.portalMobileOverlays(modal);
    } else if (typeof document !== 'undefined' && document.body && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    const firstSelected = getActiveHighlightRecipes()[0];
    if (firstSelected) {
      if (firstSelected.category === '咖哩') ladderRecipeCategory = 'curry';
      else if (firstSelected.category === '沙拉') ladderRecipeCategory = 'salad';
      else if (firstSelected.category === '甜點') ladderRecipeCategory = 'dessert';
    }
    const multiToggle = modal.querySelector('#ladder-recipe-multi-toggle');
    if (multiToggle) multiToggle.checked = !!ladderRecipeMultiSelect;
    renderLadderRecipeModalContent(modal);
    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
  }

  function closeLadderRecipeModal() {
    const modal = getOverlayEl('ladder-recipe-modal');
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    };
    if (modal && typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, done);
    } else {
      if (modal) modal.style.display = 'none';
      done();
    }
  }

  function openSkillDrawHelpModal(e) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
      e.preventDefault();
    }
    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const btn = (e && (e.currentTarget || e.target))
      || (ladderPanel && typeof ladderPanel.querySelector === 'function' ? ladderPanel.querySelector('.ladder-help-icon-btn') : (typeof document.querySelector === 'function' ? document.querySelector('.ladder-help-icon-btn') : null));
    const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : 'zh-TW';
    const isEN = lang === 'en-US';
    const isCN = lang === 'zh-CN';
    const title = isEN ? 'Specialty Trigger Multipliers' : (isCN ? '专长发动几率加成' : '專長發動機率加成');
    const body = isEN
      ? 'All specialties use a 1.0x trigger baseline.<br>Use Skill Trigger M/S and Skill Chance ▲ to simulate boosts.'
      : (isCN
        ? '所有专长皆以 1.0 倍发动几率作为基准。<br>请用技能几率M/S与技能几率▲模拟补正。'
        : '所有專長皆以 1.0 倍發動機率為基準。<br>請用技能機率M/S與技能機率▲模擬補正。');

    if (window.PokemonApp && typeof window.PokemonApp.toggleGlobalTooltip === 'function') {
      window.PokemonApp.toggleGlobalTooltip(btn, title, body);
    } else {
      const modal = document.getElementById('ladder-skill-help-modal');
      if (modal) {
        const isVisible = modal.style.display === 'block' || modal.style.display === 'flex';
        if (isVisible) {
          closeSkillDrawHelpModal();
        } else {
          modal.style.display = 'block';
        }
      }
    }
  }

  function closeSkillDrawHelpModal() {
    if (window.PokemonApp && typeof window.PokemonApp.hideGlobalTooltip === 'function') {
      window.PokemonApp.hideGlobalTooltip();
    }
    const modal = document.getElementById('ladder-skill-help-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function selectLadderHighlightRecipe(recipeName) {
    if (ladderRecipeMultiSelect) {
      const idx = ladderHighlightRecipes.indexOf(recipeName);
      if (idx >= 0) ladderHighlightRecipes.splice(idx, 1);
      else ladderHighlightRecipes.push(recipeName);
      ladderHighlightRecipe = ladderHighlightRecipes[0] || null;
      renderLadderRecipeModalContent();
      updateLadderRecipeFabState();
      refreshCoordinateLadder();
      return;
    }
    if (ladderHighlightRecipe === recipeName) {
      ladderHighlightRecipe = null;
      ladderHighlightRecipes = [];
    } else {
      ladderHighlightRecipe = recipeName;
      ladderHighlightRecipes = [recipeName];
    }
    closeLadderRecipeModal();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function toggleLadderRecipeMultiSelect(enabled) {
    const next = !!enabled;
    const current = getActiveHighlightRecipes().map(r => r.name_cn);
    ladderRecipeMultiSelect = next;
    if (next) {
      ladderHighlightRecipes = current.slice();
      ladderHighlightRecipe = ladderHighlightRecipes[0] || null;
    } else {
      ladderHighlightRecipe = current[0] || null;
      ladderHighlightRecipes = ladderHighlightRecipe ? [ladderHighlightRecipe] : [];
    }
    const toggle = document.getElementById('ladder-recipe-multi-toggle');
    if (toggle) toggle.checked = next;
    renderLadderRecipeModalContent();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function clearLadderHighlightRecipe() {
    ladderHighlightRecipe = null;
    ladderHighlightRecipes = [];
    closeLadderRecipeModal();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function updateLadderRecipeFabState() {
    const fab = document.getElementById('ladder-recipe-highlight-fab');
    if (!fab) return;
    const badge = document.getElementById('ladder-recipe-fab-badge');
    const count = getActiveHighlightRecipes().length;
    if (count > 0) {
      fab.classList.add('has-active');
      if (badge) {
        badge.style.display = 'flex';
        badge.textContent = count > 1 ? String(count) : '✓';
      }
    } else {
      fab.classList.remove('has-active');
      if (badge) {
        badge.style.display = 'none';
        badge.textContent = '✓';
      }
    }
  }

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

    // 性格加成：單選；未選視為無修正
    if (getLadderNature() !== 'NONE') {
      if (ladderNatureIng) mult *= 1.20;
      if (ladderNatureSpeed) mult *= (1.0 / 0.90);
    }

    return mult;
  }

  function getLadderSkillTriggerMultiplier() {
    let m = 1.0;
    let boost = 0;
    if (isLadderSkillM) boost += 0.36;
    if (isLadderSkillS) boost += 0.18;
    if (boost > 0) m *= (1.0 + boost);
    if (getLadderNature() !== 'NONE' && ladderNatureSkill) m *= 1.20;
    return m;
  }

  function toggleLadderIngM(checked) {
    isLadderIngM = (checked === undefined) ? !isLadderIngM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderIngS(checked) {
    isLadderIngS = (checked === undefined) ? !isLadderIngS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedM(checked) {
    isLadderSpeedM = (checked === undefined) ? !isLadderSpeedM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSpeedS(checked) {
    isLadderSpeedS = (checked === undefined) ? !isLadderSpeedS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSkillM(checked) {
    isLadderSkillM = (checked === undefined) ? !isLadderSkillM : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSkillS(checked) {
    isLadderSkillS = (checked === undefined) ? !isLadderSkillS : !!checked;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderSubskill(key) {
    if (key === 'ING_M') isLadderIngM = !isLadderIngM;
    else if (key === 'ING_S') isLadderIngS = !isLadderIngS;
    else if (key === 'SPEED_M') isLadderSpeedM = !isLadderSpeedM;
    else if (key === 'SPEED_S') isLadderSpeedS = !isLadderSpeedS;
    else if (key === 'SKILL_M') isLadderSkillM = !isLadderSkillM;
    else if (key === 'SKILL_S') isLadderSkillS = !isLadderSkillS;
    syncLadderSubskillButtons();
    refreshCoordinateLadder();
  }

  function syncLadderSubskillButtons() {
    const flags = {
      ING_M: isLadderIngM,
      ING_S: isLadderIngS,
      SPEED_M: isLadderSpeedM,
      SPEED_S: isLadderSpeedS,
      SKILL_M: isLadderSkillM,
      SKILL_S: isLadderSkillS
    };
    const ladderSidebar = document.getElementById('ladder-filter-sidebar') || document;
    const boostBtns = (typeof ladderSidebar.querySelectorAll === 'function') ? ladderSidebar.querySelectorAll('[data-subskill-boost]') : document.querySelectorAll('[data-subskill-boost]');
    boostBtns.forEach(btn => {
      const key = btn.getAttribute('data-subskill-boost');
      btn.classList.toggle('active', !!flags[key]);
    });
  }

  function getLadderNature() {
    const selected = [];
    if (ladderNatureIng) selected.push('ING');
    if (ladderNatureSpeed) selected.push('SPEED');
    if (ladderNatureSkill) selected.push('SKILL');
    if (selected.length === 0 || selected.length === 3) return 'NONE';
    if (selected.length === 1) return selected[0];
    return 'MIXED';
  }

  function syncLadderNatureButtons() {
    ladderNature = getLadderNature();
    const ladderSidebar = document.getElementById('ladder-filter-sidebar') || document;
    const natureBtns = (typeof ladderSidebar.querySelectorAll === 'function') ? ladderSidebar.querySelectorAll('[data-nature-filter]') : document.querySelectorAll('[data-nature-filter]');
    natureBtns.forEach(btn => {
      const key = btn.getAttribute('data-nature-filter');
      const on = (key === 'ING' && ladderNatureIng) || (key === 'SPEED' && ladderNatureSpeed) || (key === 'SKILL' && ladderNatureSkill);
      btn.classList.toggle('active', on);
    });
  }

  function setLadderNature(natureType) {
    ladderNatureIng = natureType === 'ING';
    ladderNatureSpeed = natureType === 'SPEED';
    ladderNatureSkill = natureType === 'SKILL';
    if (natureType !== 'ING' && natureType !== 'SPEED' && natureType !== 'SKILL') {
      ladderNatureIng = false;
      ladderNatureSpeed = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureFilter(type) {
    const currentlyOn =
      (type === 'ING' && ladderNatureIng) ||
      (type === 'SPEED' && ladderNatureSpeed) ||
      (type === 'SKILL' && ladderNatureSkill);
    ladderNatureIng = false;
    ladderNatureSpeed = false;
    ladderNatureSkill = false;
    if (!currentlyOn) {
      if (type === 'ING') ladderNatureIng = true;
      else if (type === 'SPEED') ladderNatureSpeed = true;
      else if (type === 'SKILL') ladderNatureSkill = true;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureIng(checked) {
    const on = !!checked;
    ladderNatureIng = on;
    if (on) {
      ladderNatureSpeed = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
  }

  function toggleLadderNatureSpeed(checked) {
    const on = !!checked;
    ladderNatureSpeed = on;
    if (on) {
      ladderNatureIng = false;
      ladderNatureSkill = false;
    }
    syncLadderNatureButtons();
    refreshCoordinateLadder();
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

    ladderNatureIng = false;
    ladderNatureSpeed = false;
    ladderNatureSkill = false;
    syncLadderNatureButtons();

    isLadderIngM = false;
    isLadderIngS = false;
    isLadderSpeedM = false;
    isLadderSpeedS = false;
    isLadderSkillM = false;
    isLadderSkillS = false;
    syncLadderSubskillButtons();
    isLadderSkillDrawExpected = false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_ladder_skill_draw', 'false');
      }
    } catch (e) {}
    ladderTop15Only = true;

    const top15 = document.getElementById('ladder-top15-switch');
    if (top15) top15.checked = true;
    const skillDraw = document.getElementById('ladder-skill-draw-toggle');
    if (skillDraw) skillDraw.checked = false;
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
    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const nodes = (typeof ladderPanel.querySelectorAll === 'function') ? ladderPanel.querySelectorAll('.ladder-node') : document.querySelectorAll('.ladder-node');
    const spans = (typeof ladderPanel.querySelectorAll === 'function') ? ladderPanel.querySelectorAll('.ladder-pkm-span-line') : document.querySelectorAll('.ladder-pkm-span-line');

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
    if (isLadderIngM || isLadderIngS || isLadderSpeedM || isLadderSpeedS || isLadderSkillM || isLadderSkillS) count++;
    if (ladderNature && ladderNature !== 'NONE') count++;
    if (isLadderSkillDrawExpected) count++;

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

    // 若當前有高亮料理，且點選的食材非該料理所需食材，則禁止開啟與選取
    const activeRecipes = getActiveHighlightRecipes();
    if (activeRecipes.length) {
      const isRecipeIng = activeRecipes.some(rec => rec.ingredients && rec.ingredients.some(i => i.name === ingData.name || (i.name === '美味尾巴' && ingId === 'tail') || (i.name === 'Slowpoke Tail' && ingId === 'tail')));
      if (!isRecipeIng) return;
    }

    const ingName = isEN ? ((window.I18N && window.I18N.getIngredientName(ingData.name)) || ingData.name) : ingData.name;
    const dishInfo = TOP_RECIPES_FOR_INGREDIENTS[ingId] || { name: isEN ? 'Key Dish' : '核心大菜', name_en: 'Key Dish', need: 20 };
    const dishName = isEN ? (dishInfo.name_en || dishInfo.name) : dishInfo.name;
    const dishIcon = dishInfo.icon || getLadderDishIcon(dishInfo.name);

    // 依當前篩選條件收集並計算所有寶可夢產量排名
    let rankingList = [];
    let modalTop5Threshold = 0;
    if (ladderSupplyFilter === 'TOP') {
      const allMaxCounts = ingData.pokemon.map(pkm => {
        const pkmBonus = getPokemonSkillDrawBonus(pkm.name, ingData.id, ingData.name);
        return Math.max(...(pkm.variants || [{ count: pkm.count }]).map(v => Math.round(v.count * mult) + pkmBonus));
      });
      const distinctCounts = [...new Set(allMaxCounts)].sort((a, b) => b - a);
      modalTop5Threshold = distinctCounts[Math.min(4, distinctCounts.length - 1)] || 0;
    }

    ingData.pokemon.forEach((p, pIdx) => {
      const pkmSpec = getPokemonLadderSpecialty(p.name);
      if (ladderSpecialtyFilter === 'INGREDIENT' && pkmSpec !== '食材' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'BERRY' && pkmSpec !== '樹果' && pkmSpec !== '全部') return;
      if (ladderSpecialtyFilter === 'SKILL' && pkmSpec !== '技能' && pkmSpec !== '全部') return;

      const skillBonus = getPokemonSkillDrawBonus(p.name, ingData.id, ingData.name);

      let variants = (p.variants || [{ recipe: p.recipe, count: p.count, note: p.note, isTop: p.isTop }]).filter(v => matchesLadderRecipeFilter(v, ladderRecipeFilter));

      if (ladderSupplyFilter === 'TOP') {
        const pkmMaxCount = Math.max(...(p.variants || [{ count: p.count }]).map(v => Math.round(v.count * mult) + skillBonus));
        if (pkmMaxCount < modalTop5Threshold) return;
        variants = variants.slice(0, 1);
      } else if (ladderSupplyFilter === 'MEALS_3') {
        variants = variants.filter(v => Math.round(v.count * mult) + skillBonus >= dishInfo.need * 3);
      } else if (ladderSupplyFilter === 'MEALS_2') {
        variants = variants.filter(v => Math.round(v.count * mult) + skillBonus >= dishInfo.need * 2);
      }

      if (ladderSearchQuery) {
        if (!matchesLadderSearch(p.name, p.name_en, ladderSearchQuery)) return;
      }

      variants.forEach(v => {
        const dropCount = Math.round(v.count * mult);
        const totalCount = dropCount + skillBonus;
        rankingList.push({
          name: p.name,
          name_en: p.name_en,
          icon: p.icon,
          recipe: v.recipe,
          count: totalCount,
          dropCount: dropCount,
          skillBonus: skillBonus,
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
                  ${rank === 1 ? '\u{1F947}' : (rank === 2 ? '\u{1F948}' : (rank === 3 ? '\u{1F949}' : `#${rank}`))}
                </div>
                <div class="ing-rank-avatar-box ${rankClass}">
                  <img src="${item.icon}" class="ing-rank-avatar-img" alt="${pkmDisplayName}" loading="lazy">
                </div>
                <span class="node-recipe-tag-inline recipe-tag-${item.recipe.toLowerCase()}">${item.recipe}</span>
              </div>
              <div class="ing-rank-right">
                <span class="ing-rank-yield-line"><span class="ing-rank-yield-num">${item.count}</span><span class="ing-rank-yield-unit">${isEN ? ' /day' : ' 顆/天'}</span></span>
                ${item.skillBonus > 0 ? `
                  <span class="ing-rank-split-line" title="${isEN ? 'Drop: ' + item.dropCount + ' + Skill: ' + item.skillBonus : '食材掉落: ' + item.dropCount + ' + 技能獲取: ' + item.skillBonus}">
                    <span class="split-drop">${item.dropCount}</span>+<span class="split-skill">${item.skillBonus}</span>
                  </span>
                ` : ''}
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
              <div class="ing-rank-header-sub">${dishIcon ? `<img src="${dishIcon}" class="tooltip-dish-icon" alt="" loading="lazy">` : ''}<span>${isEN ? 'Key Dish:' : '核心大菜：'} ${dishName} (${dishInfo.need}${isEN ? '/meal' : '顆/餐'}) · ${isEN ? 'Ideal Energy (0.45x)' : '滿活力 (0.45x)'} · ${rankingList.length} ${isEN ? 'Pokémon' : '隻寶可夢'}</span></div>
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

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
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
    if (!modal) return;
    const wipe = () => { modal.innerHTML = ''; };
    if (typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, wipe);
    } else {
      modal.style.display = 'none';
      wipe();
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

  // 8. 升級睡眠天數計算機重新計算 (Official Pokemon Sleep EXP Table Lv.1~80)
  function recalcSleepDays() {
    const curLvInput    = document.getElementById('calc-sleep-cur-lv');
    const targetLvInput = document.getElementById('calc-sleep-target-lv');
    const expSubskill   = document.getElementById('calc-sleep-exp-subskill');
    const natureSelect  = document.getElementById('calc-sleep-nature-select');
    const daysResult    = document.getElementById('calc-sleep-days-result');
    const expResult     = document.getElementById('calc-sleep-exp-result');
    const candiesResult = document.getElementById('calc-sleep-candies-result');

    if (!curLvInput || !targetLvInput || !daysResult || !expResult) return;

    // 官方 Pokemon Sleep 各等級累積所需 EXP 資料庫 (Lv.1 ~ Lv.80)
    // 依據 WikiWiki 與 RaenonX 實測解包正本
    const cumulativeExp = [
      0,     0,     54,    125,   233,   361,   525,   727,   971,   1245,  1560,
      1905,  2281,  2688,  3107,  3536,  3976,  4430,  4899,  5382,  5879,
      6394,  6931,  7489,  8068,  8668,  9290,  9933,  10598, 11284, 11992,
      12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
      21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
      31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
      54358, 57280, 60257, 63286, 66363, 69458, 72574, 75718, 78907, 82162,
      85492, 88902, 92402, 96002, 99712, 103542, 107502, 111602, 115852, 120262
    ];

    let cur = parseInt(curLvInput.value, 10) || 1;
    let target = parseInt(targetLvInput.value, 10) || 30;

    if (cur < 1) cur = 1;
    if (cur > 79) cur = 79;
    if (target < 2) target = 30;
    if (target > 80) target = 80;

    // 經驗值類型: 600型 1.0 / 900型(準神) 1.5 / 1080型(神獸) 1.8 / 1320型(幻) 2.2
    // ponytail: 累計值乘倍率四捨五入, 與 Pokebip/WikiWiki 實表誤差 <=1 EXP; 要逐點精準需內嵌三張實表
    const expTypeSelect = document.getElementById('calc-sleep-exp-type');
    const expTypeMult = parseFloat(expTypeSelect ? expTypeSelect.value : 1.0) || 1.0;
    const curExp = Math.round(cumulativeExp[cur] * expTypeMult);
    const targetExp = Math.round(cumulativeExp[target] * expTypeMult);
    const baseExpNeeded = Math.max(0, targetExp - curExp);

    let dailyExp = 100;
    if (expSubskill && expSubskill.checked) dailyExp *= 1.14;
    const natureFactor = parseFloat(natureSelect ? natureSelect.value : 1.0) || 1.0;
    dailyExp *= natureFactor;

    const daysNeeded = baseExpNeeded > 0 ? Math.ceil(baseExpNeeded / dailyExp) : 0;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 糖果換算 (Candy calculation):
    // 基礎 1 顆 25 EXP; 性格修正: +18% -> 30 EXP (25*1.18=29.5->30), -18% -> 21 EXP (25*0.82=20.5->21)
    const expPerCandy = Math.round(25 * natureFactor);
    const candiesNeeded = baseExpNeeded > 0 ? Math.ceil(baseExpNeeded / expPerCandy) : 0;

    if (baseExpNeeded === 0) {
      daysResult.textContent = isEN ? '0 Days' : '0 天';
      expResult.textContent = isEN ? 'Target Level Already Reached' : '已達目標等級, 無需額外 EXP';
      if (candiesResult) {
        candiesResult.textContent = isEN ? '0 Candies Needed' : '無需額外糖果';
      }
    } else {
      daysResult.textContent = daysNeeded.toLocaleString() + (isEN ? ' Days' : ' 天');
      expResult.textContent = isEN 
        ? `Approx. ${baseExpNeeded.toLocaleString()} EXP` 
        : `約需 ${baseExpNeeded.toLocaleString()} EXP`;
      if (candiesResult) {
        candiesResult.textContent = isEN
          ? `Approx. ${candiesNeeded.toLocaleString()} Candies (${expPerCandy} EXP/ea)`
          : `約需 ${candiesNeeded.toLocaleString()} 顆糖果 (每顆 ${expPerCandy} EXP)`;
      }
    }
  }

  // 9. 初始化升級天數計算機自訂下拉選單
  function initCalcCustomSelects() {
    if (typeof window === 'undefined' || typeof window.setupCustomSelect !== 'function') return;
    const targetSelect = document.getElementById('calc-sleep-target-lv');
    const natureSelect = document.getElementById('calc-sleep-nature-select');
    if (targetSelect && !targetSelect._customized) {
      window.setupCustomSelect(targetSelect);
    }
    if (natureSelect && !natureSelect._customized) {
      window.setupCustomSelect(natureSelect);
    }
    const expTypeSelect = document.getElementById('calc-sleep-exp-type');
    if (expTypeSelect && !expTypeSelect._customized) {
      window.setupCustomSelect(expTypeSelect);
    }
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
      curLvInput.addEventListener('focus', function () {
        if (typeof this.select === 'function') this.select();
      });
      curLvInput.addEventListener('click', function () {
        if (typeof this.select === 'function') this.select();
      });
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
      if (e.target && e.target.id === 'ladder-skill-draw-toggle') {
        toggleLadderSkillDrawExpected(e.target.checked);
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

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSleepStylePopover();
      }
    });
  }
