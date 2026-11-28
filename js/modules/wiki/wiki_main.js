  function renderWikiLayout(container) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const isLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_ladder_sidebar_open', true) : true;
    const initialLadderCollapsed = isMobileH5 ? 'collapsed' : (isLadderOpen ? '' : 'collapsed');
    const isSkillLadderOpen = typeof window.getSidebarSavedState === 'function' ? window.getSidebarSavedState('pksleep_skill_ladder_sidebar_open', true) : true;
    const initialSkillLadderCollapsed = isMobileH5 ? 'collapsed' : (isSkillLadderOpen ? '' : 'collapsed');
    const isWikiMainActive = !!(container && (
      (container.style && container.style.display !== 'none' && !container.hidden) ||
      (typeof document !== 'undefined' && document.getElementById && document.getElementById('tab-wiki') && document.getElementById('tab-wiki').classList && document.getElementById('tab-wiki').classList.contains('active')) ||
      (!container.style && (!document.getElementById || !document.getElementById('tab-wiki')))
    ));
    const gameCfg = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
                    (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    const caps = (typeof _getWikiCaps === 'function') ? _getWikiCaps() : (gameCfg && typeof gameCfg.getCaps === 'function' ? gameCfg.getCaps() : { POKEMON_LEVEL_CAP: 70, THEORETICAL_MAX_LEVEL: 100 });
    const sleepExpTargetLevels = (gameCfg && typeof gameCfg.getSleepExpTargetLevels === 'function')
      ? gameCfg.getSleepExpTargetLevels()
      : Array.from(new Set([30, 50, 60, caps.POKEMON_LEVEL_CAP, 80, caps.THEORETICAL_MAX_LEVEL].filter(Boolean))).sort((a, b) => a - b);

    const deferSubpanels = !!(container && container.id === 'panel-wiki' && container.style && container.style.display === 'none');
    const shouldRenderSubpanel = (subName) => !deferSubpanels || currentWikiSubTab === subName || subName === 'ratings';


    function _renderWikiSubpanelBody(subTabId) {
      if (subTabId === 'skills') return _renderWikiSkillsBody();
      if (subTabId === 'subskills') return _renderWikiSubskillsBody(base);
      if (subTabId === 'ingredients') return `<div id="wiki-ingredient-ladder-coordinate">${renderCoordinateLadder()}</div>`;
      if (subTabId === 'skills_ladder') return `<div id="wiki-skill-ladder-coordinate">${typeof renderSkillCoordinateLadder === 'function' ? renderSkillCoordinateLadder() : ''}</div>`;
      if (subTabId === 'values') return renderValuesBoard();
      if (subTabId === 'ratings') return _renderWikiRatingsBody(caps, sleepExpTargetLevels);
      if (subTabId === 'islands') return renderIslandsSubpanel();
      if (subTabId === 'items') return renderItemsSubpanel();
      return '';
    }
    container._renderWikiSubpanelBody = _renderWikiSubpanelBody;

    container.innerHTML = _buildWikiLayoutHtml({
      isMobileH5,
      isWikiMainActive,
      initialLadderCollapsed,
      initialSkillLadderCollapsed,
      caps,
      sleepExpTargetLevels,
      shouldRenderSubpanel,
      renderSkillsBody: _renderWikiSkillsBody,
      renderSubskillsBody: () => _renderWikiSubskillsBody(base)
    });

    if (typeof window.pruneOverlayDuplicates === 'function') {
      window.pruneOverlayDuplicates([
        'ladder-recipe-modal',
        'ladder-filter-sidebar',
        'ladder-sidebar-backdrop',
        'ladder-sidebar-bookmark-handle',
        'ladder-recipe-highlight-fab',
        'skill-ladder-filter-sidebar',
        'skill-ladder-sidebar-backdrop',
        'skill-ladder-sidebar-bookmark-handle',
        'wiki-item-detail-modal'
      ]);
    }

    try {
      initCalcCustomSelects();
      if (typeof bindWikiFloatingFabs === 'function') bindWikiFloatingFabs();
    } catch (e) {}
  }

  function handleLadderGroupHover(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const skillLadder = target.closest('.wiki-skill-coordinate-ladder');
    if (skillLadder) {
      const siblings = skillLadder.querySelectorAll(`[data-pkm-group="${groupName}"]`);
      siblings.forEach(el => el.classList.add('group-hover-active'));
      return;
    }
    const row = target.closest('.ladder-track-row, .ladder-tail-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.add('group-hover-active'));
  }

  function handleLadderGroupHoverOut(e) {
    const target = e.target.closest('[data-pkm-group]');
    if (!target) return;
    const groupName = target.getAttribute('data-pkm-group');
    if (!groupName) return;
    const skillLadder = target.closest('.wiki-skill-coordinate-ladder');
    if (skillLadder) {
      const siblings = skillLadder.querySelectorAll(`[data-pkm-group="${groupName}"]`);
      siblings.forEach(el => el.classList.remove('group-hover-active'));
      return;
    }
    const row = target.closest('.ladder-track-row, .ladder-tail-track-row');
    if (!row) return;
    const siblings = row.querySelectorAll(`[data-pkm-group="${groupName}"]`);
    siblings.forEach(el => el.classList.remove('group-hover-active'));
  }

  // 導出全局命名空間與公共函數 (支援 window.WikiDB 及 window 全域名稱)
  const WikiDBExport = {
    MAIN_SKILLS_DATA,
    SUB_SKILLS_DATA,
    TRIGGER_CHANCE_MATRIX,
    HELPING_SPEED_MATRIX,
    NATURES_EFFECT_DATA,
    RATINGS_GUIDE_DATA,
    SLEEP_DAYS_BASELINE,
    BERRY_VALUES_DATA,
    INGREDIENT_VALUES_DATA,
    LV60_COORDINATE_LADDER_DATA,
    mergeRecipeCodes,
    matchesLadderRecipeFilter,
    matchesLadderSearch,
    init: initWikiModule,
    renderWikiLayout: renderWikiLayout,
    switchSubTab: switchWikiSubTab,
    switchWikiSubTab: switchWikiSubTab,
    getCurrentSubTab: getCurrentSubTab,
    getCurrentSkillsCategory: () => currentSkillsCategory,
    switchLadderView: switchLadderView,
    filterSkills: filterWikiSkills,
    filterWikiSkills: filterWikiSkills,
    filterIngredients: filterWikiIngredients,
    filterWikiIngredients: filterWikiIngredients,
    switchStack: switchChargeStock,
    switchChargeStock: switchChargeStock,
    switchBoost: switchHelperBoost,
    switchHelperBoost: switchHelperBoost,
    toggleDetail: toggleDetailTable,
    toggleDetailTable: toggleDetailTable,
    updateBerryLevel: updateBerryLevel,
    updateBerryIsland: updateBerryIsland,
    toggleBerryFavorite: toggleBerryFavorite,
    toggleFavorite: toggleBerryFavorite,
    toggleLadderTop15: toggleLadderTop15,
    getLadderTop15Only: getLadderTop15Only,
    toggleLadderFinalOnly: typeof toggleLadderFinalOnly === 'function' ? toggleLadderFinalOnly : null,
    getLadderFinalOnly: typeof getLadderFinalOnly === 'function' ? getLadderFinalOnly : null,
    buildDynamicIngredientLadder: typeof buildDynamicIngredientLadder === 'function' ? buildDynamicIngredientLadder : null,
    getActiveCoordinateLadderData: typeof getActiveCoordinateLadderData === 'function' ? getActiveCoordinateLadderData : null,
    getDynamicTopRecipeForIngredient: typeof getDynamicTopRecipeForIngredient === 'function' ? getDynamicTopRecipeForIngredient : null,
    invalidateDynamicLadderCache: typeof invalidateDynamicLadderCache === 'function' ? invalidateDynamicLadderCache : null,
    toggleLadderIngM: toggleLadderIngM,
    toggleLadderIngS: toggleLadderIngS,
    toggleLadderSpeedM: toggleLadderSpeedM,
    toggleLadderSpeedS: toggleLadderSpeedS,
    toggleLadderSkillM: toggleLadderSkillM,
    toggleLadderSkillS: toggleLadderSkillS,
    toggleLadderSubskill: toggleLadderSubskill,
    toggleLadderNatureIng: toggleLadderNatureIng,
    toggleLadderNatureSpeed: toggleLadderNatureSpeed,
    toggleLadderNatureFilter: toggleLadderNatureFilter,
    getLadderNature: getLadderNature,
    setLadderNature: setLadderNature,
    toggleLadderRecipeMultiSelect: toggleLadderRecipeMultiSelect,
    onLadderSearch: onLadderSearch,
    onLadderSearchInput: onLadderSearchInput,
    clearLadderSearch: clearLadderSearch,
    setLadderSupplyFilter: setLadderSupplyFilter,
    setLadderRecipeFilter: setLadderRecipeFilter,
    setLadderSpecialtyFilter: setLadderSpecialtyFilter,
    toggleLadderSkillDrawExpected: toggleLadderSkillDrawExpected,
    getLadderSkillDrawExpected: getLadderSkillDrawExpected,
    getPokemonSkillDrawBonus: getPokemonSkillDrawBonus,
    hasPokemonIngSelectSkill: hasPokemonIngSelectSkill,
    INGREDIENT_DRAW_SKILL_EXPECTATIONS: INGREDIENT_DRAW_SKILL_EXPECTATIONS,
    setLadderSortOrder: setLadderSortOrder,
    getLadderSortOrder: getLadderSortOrder,
    resetLadderFilters: resetLadderFilters,
    refreshCoordinateLadder: refreshCoordinateLadder,
    renderCoordinateLadder: renderCoordinateLadder,
    handleLadderGroupHover: handleLadderGroupHover,
    handleLadderGroupHoverOut: handleLadderGroupHoverOut,
    recalcTriggerChance: recalcTriggerChance,
    recalcSleepDays: recalcSleepDays,
    initCalcCustomSelects: initCalcCustomSelects,
    openLadderSidebar: openLadderSidebar,
    closeLadderSidebar: closeLadderSidebar,
    toggleLadderSidebar: toggleLadderSidebar,
    openIngredientRankingModal: openIngredientRankingModal,
    closeIngredientRankingModal: closeIngredientRankingModal,
    updateLadderActiveFilterBadge: updateLadderActiveFilterBadge,
    toggleSkillCard: toggleSkillCard,
    toggleSkillStepper: toggleSkillStepper,
    TOP_RECIPES_FOR_INGREDIENTS: TOP_RECIPES_FOR_INGREDIENTS,
    getPokemonLadderSpecialty: getPokemonLadderSpecialty,
    ISLANDS_DATA: ISLANDS_DATA,
    SLEEP_STYLE_GOALS_DATA: SLEEP_STYLE_GOALS_DATA,
    selectIsland: selectIsland,
    toggleIslandExpertMode: toggleIslandExpertMode,
    filterIslandSleepType: filterIslandSleepType,
    renderIslandsSubpanel: renderIslandsSubpanel,
    getCurrentIslandId: () => currentIslandId,
    getIsExpertModeActive: () => isExpertModeActive,
    getCurrentIslandSleepType: () => currentIslandSleepType,
    getIslandPokemonDexOrder: getIslandPokemonDexOrder,
    getIslandPokemonDexCode: getIslandPokemonDexCode,
    getPokemonAvatarUrl: getPokemonAvatarUrl,
    sortIslandSpawns: sortIslandSpawns,
    getIslandSpawnsSort: getIslandSpawnsSort,
    getSnorlaxRankScore: getSnorlaxRankScore,
    TOP_7_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT, TOP_10_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT,
    TOP_RECIPES_BY_CATEGORY: TOP_RECIPES_BY_CATEGORY, recomputeTopRecipesByCategory: recomputeTopRecipesByCategory, getLadderDishIcon: getLadderDishIcon, getActiveHighlightRecipes: getActiveHighlightRecipes,
    openLadderRecipeModal: openLadderRecipeModal,
    closeLadderRecipeModal: closeLadderRecipeModal,
    openSkillDrawHelpModal: openSkillDrawHelpModal,
    closeSkillDrawHelpModal: closeSkillDrawHelpModal,
    selectLadderHighlightRecipe: selectLadderHighlightRecipe,
    clearLadderHighlightRecipe: clearLadderHighlightRecipe,
    switchLadderRecipeCategory: switchLadderRecipeCategory,
    getLadderRecipeCategory: () => ladderRecipeCategory,
    getLadderHighlightRecipe: () => ladderHighlightRecipe,
    toggleLadderEnergyHelp: toggleLadderEnergyHelp,
    closeLadderEnergyHelp: closeLadderEnergyHelp,
    toggleIslandLegendaryOnly: toggleIslandLegendaryOnly,
    getSavedIslandLegendaryOnly: getSavedIslandLegendaryOnly,
    getIsIslandLegendaryOnly: () => isIslandLegendaryOnly,
    getSleepStyleData: getSleepStyleData,
    toggleIslandSleepRewards: toggleIslandSleepRewards,
    getSavedIslandSleepRewards: getSavedIslandSleepRewards,
    getIsIslandSleepRewardsVisible: () => isIslandSleepRewardsVisible,
    showSleepStylePopover: showSleepStylePopover,
    closeSleepStylePopover: closeSleepStylePopover,
    formatSnorlaxRankBadge: formatSnorlaxRankBadge,
    filterItemsByCategory: filterItemsByCategory,
    handleItemsSearch: handleItemsSearch,
    handleItemsSearchInput: handleItemsSearchInput,
    clearItemsSearch: clearItemsSearch,
    resetItemsFilters: resetItemsFilters,
    filterItems: filterItems,
    searchItems: searchItems,
    renderItemsSubpanel: renderItemsSubpanel,
    renderFilteredItemsGrid: renderFilteredItemsGrid,
    getItemsCategory: () => currentItemsCategory,
    getItemsSearchQuery: () => currentItemsSearchQuery,
    openItemDetailModal: openItemDetailModal,
    closeItemDetailModal: closeItemDetailModal,
    navigateToPokemonDex: navigateToPokemonDex,
    onSleepCurLvInput: handleSleepCurLvInput
  };

  if (typeof attachSkillLadderExports === 'function') {
    attachSkillLadderExports(WikiDBExport, window);
  }
  if (typeof attachIslandSleepTrackerExports === 'function') {
    attachIslandSleepTrackerExports(WikiDBExport, window);
  }

  window.WikiDB = WikiDBExport;
  window.filterItemsByCategory = filterItemsByCategory;
  window.handleItemsSearch = handleItemsSearch;
  window.handleItemsSearchInput = handleItemsSearchInput;
  window.clearItemsSearch = clearItemsSearch;
  window.resetItemsFilters = resetItemsFilters;
  window.filterItems = filterItems;
  window.searchItems = searchItems;
  window.renderItemsSubpanel = renderItemsSubpanel;
  window.openItemDetailModal = openItemDetailModal;
  window.closeItemDetailModal = closeItemDetailModal;
  window.navigateToPokemonDex = navigateToPokemonDex;
  window.formatSnorlaxRankBadge = formatSnorlaxRankBadge;

  // 同步掛載至 window 根層級以防止任何命名空間呼叫錯誤
  Object.assign(window, {
    switchWikiSubTab, getCurrentSubTab, getCurrentIslandId: () => currentIslandId,
    getIsExpertModeActive: () => isExpertModeActive, getCurrentIslandSleepType: () => currentIslandSleepType,
    sortIslandSpawns, getIslandSpawnsSort, toggleIslandLegendaryOnly, getSavedIslandLegendaryOnly,
    toggleLadderSidebar, toggleLadderEnergyHelp, closeLadderEnergyHelp, closeSleepStylePopover,
    switchLadderView, filterWikiSkills, filterWikiIngredients, switchChargeStock, switchHelperBoost,
    toggleDetailTable, toggleSkillCard, toggleSkillStepper, updateBerryLevel, updateBerryIsland,
    toggleBerryFavorite, toggleLadderTop15, getLadderTop15Only, toggleLadderIngM, toggleLadderIngS,
    toggleLadderSpeedM, toggleLadderSpeedS, toggleLadderSkillM, toggleLadderSkillS, toggleLadderSubskill,
    toggleLadderNatureIng, toggleLadderNatureSpeed, toggleLadderNatureFilter, toggleLadderRecipeMultiSelect,
    getLadderNature, setLadderNature, onLadderSearch, onLadderSearchInput, clearLadderSearch, setLadderSupplyFilter,
    setLadderRecipeFilter, setLadderSpecialtyFilter, toggleLadderSkillDrawExpected, getLadderSkillDrawExpected,
    getPokemonSkillDrawBonus, hasPokemonIngSelectSkill, INGREDIENT_DRAW_SKILL_EXPECTATIONS, setLadderSortOrder, getLadderSortOrder,
    resetLadderFilters, refreshCoordinateLadder, renderCoordinateLadder, handleLadderGroupHover,
    handleLadderGroupHoverOut, recalcTriggerChance, recalcSleepDays, onSleepCurLvInput: handleSleepCurLvInput, initCalcCustomSelects,
    openLadderSidebar, closeLadderSidebar, openIngredientRankingModal, closeIngredientRankingModal,
    updateLadderActiveFilterBadge, HELPING_SPEED_MATRIX, selectIsland, toggleIslandExpertMode,
    filterIslandSleepType, renderIslandsSubpanel, TOP_7_RECIPES_HIGHLIGHT, TOP_10_RECIPES_HIGHLIGHT: TOP_7_RECIPES_HIGHLIGHT, TOP_RECIPES_BY_CATEGORY, recomputeTopRecipesByCategory,
    openLadderRecipeModal, closeLadderRecipeModal, openSkillDrawHelpModal, closeSkillDrawHelpModal,
    selectLadderHighlightRecipe, clearLadderHighlightRecipe, switchLadderRecipeCategory,
    getLadderRecipeCategory: () => ladderRecipeCategory, getLadderHighlightRecipe: () => ladderHighlightRecipe
  });

  // 當 DOM 準備完成時自動初始化（若百科分頁處於隱藏狀態則延後至首幀繪製後初始化）
  function scheduleWikiInit() {
    const wikiPanel = typeof document !== 'undefined' && document.getElementById ? document.getElementById('panel-wiki') : null;
    if (wikiPanel && wikiPanel.style && wikiPanel.style.display === 'none') {
      const deferWiki = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
        ? (fn) => window.requestAnimationFrame(() => setTimeout(fn, 0))
        : (fn) => setTimeout(fn, 0);
      deferWiki(() => {
        if (!_wikiModuleInitialized) initWikiModule();
      });
    } else {
      initWikiModule();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleWikiInit);
  } else {
    scheduleWikiInit();
  }

})();
