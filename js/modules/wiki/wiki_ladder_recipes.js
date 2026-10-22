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

