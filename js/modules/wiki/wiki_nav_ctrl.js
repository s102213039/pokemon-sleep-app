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
        const curHash = (window.location && window.location.hash) ? window.location.hash.replace(/^#/, '').split('?')[0] : '';
        const mainPart = curHash.split(/[/_]/)[0];
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
      if (activePanel.classList) activePanel.classList.add('active');
      if (activePanel.style) activePanel.style.display = '';
      const isPending = (activePanel.getAttribute && activePanel.getAttribute('data-wiki-pending') === '1') || !(activePanel.innerHTML && activePanel.innerHTML.trim());
      if (isPending) {
        const wikiPanel = document.getElementById('panel-wiki');
        if (wikiPanel && typeof wikiPanel._renderWikiSubpanelBody === 'function') {
          activePanel.innerHTML = wikiPanel._renderWikiSubpanelBody(targetTab);
          if (typeof activePanel.removeAttribute === 'function') activePanel.removeAttribute('data-wiki-pending');
        }
      }
    }

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && document.body.classList.contains('mobile-h5-app');
    const wikiPanel = document.getElementById('panel-wiki');
    const isWikiMainActive = !!(wikiPanel && (
      (wikiPanel.style && wikiPanel.style.display !== 'none' && !wikiPanel.hidden) ||
      (typeof document !== 'undefined' && document.getElementById('tab-wiki') && document.getElementById('tab-wiki').classList && document.getElementById('tab-wiki').classList.contains('active'))
    ));

    if (isMobileH5 && document.body && document.body.classList) {
      if (isWikiMainActive && (targetTab === 'ingredients' || targetTab === 'skills_ladder')) {
        document.body.classList.add('ladder-active');
      } else {
        document.body.classList.remove('ladder-active');
      }
      if (isWikiMainActive && targetTab === 'ingredients') document.body.classList.add('ing-ladder-active');
      else document.body.classList.remove('ing-ladder-active');
      if (isWikiMainActive && targetTab === 'skills_ladder') document.body.classList.add('skill-ladder-active');
      else document.body.classList.remove('skill-ladder-active');
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

    if (ladderSidebar && ladderSidebar.classList && ladderSidebar.style) {
      if (isWikiMainActive && targetTab === 'ingredients') {
        if (typeof ladderSidebar.style.removeProperty === 'function') ladderSidebar.style.removeProperty('display');
        ladderSidebar.style.display = 'flex';
        const isLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_ladder_sidebar_open', true) : true;
        if (isLadderOpen && !isMobileH5 && window.innerWidth > 1024) {
          ladderSidebar.classList.remove('collapsed');
        } else {
          ladderSidebar.classList.add('collapsed');
          if (ladderBackdrop && ladderBackdrop.classList) ladderBackdrop.classList.remove('active');
        }
      } else {
        ladderSidebar.style.display = 'none';
        ladderSidebar.classList.add('collapsed');
        if (ladderBackdrop && ladderBackdrop.classList) ladderBackdrop.classList.remove('active');
      }
    }

    if (ladderHandle && ladderHandle.classList && ladderHandle.style) {
      if (isWikiMainActive && targetTab === 'ingredients') {
        const isCollapsed = (ladderSidebar && ladderSidebar.classList) ? ladderSidebar.classList.contains('collapsed') : true;
        if (isCollapsed) {
          ladderHandle.classList.remove('drawer-open');
          if (typeof ladderHandle.style.removeProperty === 'function') ladderHandle.style.removeProperty('display');
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
        ladderHandle.style.visibility = 'hidden';
      }
    }

    if (typeof handleSkillLadderSubTabSwitch === 'function') {
      handleSkillLadderSubTabSwitch(targetTab, isWikiMainActive, isMobileH5);
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
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      const wikiPanel = document.getElementById('panel-wiki');
      const isWikiMainActive = !!(wikiPanel && wikiPanel.style.display !== 'none' && !wikiPanel.hidden);
      const isIngActive = isWikiMainActive && currentWikiSubTab === 'ingredients';
      if (bookmarkHandle) {
        if (isIngActive) {
          bookmarkHandle.classList.remove('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.title = window.I18N?.t?.('wiki.ldr_expand_ladder_sidebar') ?? '展開天梯篩選側邊欄';
          if (bookmarkHandle.style && typeof bookmarkHandle.style.removeProperty === 'function') bookmarkHandle.style.removeProperty('display');
          bookmarkHandle.style.opacity = '1';
          bookmarkHandle.style.pointerEvents = 'auto';
          bookmarkHandle.style.display = 'flex';
          bookmarkHandle.style.visibility = 'visible';
        } else {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
      }
      if (ladderRecipeFab && isIngActive) {
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
        bookmarkHandle.title = window.I18N?.t?.('wiki.ldr_collapse_ladder_sidebar') ?? '收合天梯篩選側邊欄';
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
    const title = window.I18N?.t?.('wiki.ldr_ing_help_title') ?? '天梯基準：Lv.60 滿活力';
    const body = window.I18N?.t?.('wiki.ldr_ing_help_body') ?? '以 Lv.60 滿活力理想狀態 (活力 ≥ 80%，間隔 0.45x) 試算單日產能。';

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
