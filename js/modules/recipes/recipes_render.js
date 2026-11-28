  function calcEnergy(base, level, islandBonusPct, eventBonusMult = 1.0, extraCount = potExpansion, extraUnitEnergy = 100) {
    const validBase        = (typeof base === 'number' && Number.isFinite(base)) ? base : 0;
    const lvMultiplier     = 1 + (getLevelBonus(level) / 100);
    const recipeBaseWithLv = validBase * lvMultiplier;
    const validExtraCount  = Math.max(0, Number(extraCount) || 0);
    const extraBaseEnergy  = validExtraCount * (extraUnitEnergy || 100);
    const potSubtotal      = recipeBaseWithLv + extraBaseEnergy;
    const islandMultiplier = 1 + (islandBonusPct / 100);
    return Math.round(potSubtotal * islandMultiplier * eventBonusMult);
  }

  /* ─── 篩選 + 排序 ───────────────────────────────────── */
  function getFilteredRecipes() {
    const hasSelectedIngs = selectedIngredients.size > 0;
    const hasExcludedIngs = excludedIngredients.size > 0;
    const selectedIngArr  = hasSelectedIngs ? [...selectedIngredients] : null;

    const filtered = allRecipes.filter(recipe => {
      if (!recipe || typeof recipe !== 'object') return false;
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;
      if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;
      if (minPot   > 0 && (recipe.pot_size   || 0) < minPot)  return false;
      if (!recipe._ingNameSet) {
        const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        recipe._ingNameSet = new Set(ings.filter(i => i && typeof i.name === 'string').map(i => i.name));
        recipe._searchStr = ((recipe.name_cn || '') + ' ' + (recipe.name_en || '') + ' ' + ings.filter(i => i && typeof i.name === 'string').map(i => i.name).join(' ')).toLowerCase();
      }
      if (currentSearch && !recipe._searchStr.includes(currentSearch)) return false;
      if (hasSelectedIngs) {
        if (matchMode === 'all') {
          for (let i = 0; i < selectedIngArr.length; i++) {
            if (!recipe._ingNameSet.has(selectedIngArr[i])) return false;
          }
        } else {
          let anyMatch = false;
          for (let i = 0; i < selectedIngArr.length; i++) {
            if (recipe._ingNameSet.has(selectedIngArr[i])) { anyMatch = true; break; }
          }
          if (!anyMatch) return false;
        }
      }
      if (hasExcludedIngs) {
        for (const exName of excludedIngredients) {
          if (recipe._ingNameSet.has(exName)) return false;
        }
      }

      const missingInfo = getRecipeMissingDetails(recipe, pantryInventory);
      recipe._missingCount = missingInfo.missingCount;
      recipe._missingDetails = missingInfo.missingItems;
      recipe._isCookable = missingInfo.isCookable;

      if (filterCookableOnly && recipe._missingCount > 0) return false;
      return true;
    });

    if (sortOption === 'energy-desc' || sortOption === 'energy-asc' || sortOption === 'missing-asc') {
      for (let i = 0; i < filtered.length; i++) {
        filtered[i]._cachedEnergy = calcEnergy(filtered[i].base_energy, recipeLevel, islandBonus, eventBonus);
      }
    }

    return filtered.sort((a, b) => {
      if (sortOption === 'energy-desc') return (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0) - (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0);
      if (sortOption === 'energy-asc')  return (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0) - (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0);
      if (sortOption === 'pot-asc')     return (a.pot_size || 0) - (b.pot_size || 0);
      if (sortOption === 'pot-desc')    return (b.pot_size || 0) - (a.pot_size || 0);
      if (sortOption === 'bonus-desc')  return (b.bonus_pct || 0) - (a.bonus_pct || 0);
      if (sortOption === 'name-asc')    return (a.name_cn || a.name || '').localeCompare(b.name_cn || b.name || '', 'zh-TW');
      if (sortOption === 'missing-asc') {
        const diff = (a._missingCount || 0) - (b._missingCount || 0);
        return diff !== 0 ? diff : (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0) - (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0);
      }
      return 0;
    });
  }

  function _resolveRecipeAssetUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    if (rawUrl.startsWith('assets/') || rawUrl.includes('snackablenuts') || rawUrl.includes('seedbombnaanandcurry') || rawUrl.includes('grassknotsaladwrap') || rawUrl.includes('slowpoketailrollcake')) {
      if (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function') {
        const mapped = window.mapExternalToLocalAsset(rawUrl);
        if (mapped) return mapped;
      }
      if (rawUrl.startsWith('assets/')) {
        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__)
          ? window.__DATA_BASE_PATH__
          : ((typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.includes('/app/')) ? '../' : '');
        return `${base}${rawUrl}`;
      }
    }
    return rawUrl;
  }

  function renderIngRow(ingredients) {
    const list = Array.isArray(ingredients) ? ingredients : [];
    return `<div class="recipe-ing-row">
      ${list.map(i => {
        if (!i || typeof i !== 'object') return '';
        const rawName = typeof i.name === 'string' ? i.name : (typeof i.name !== 'symbol' ? String(i.name || '') : '');
        const ingDisplayName = (window.I18N && rawName) ? window.I18N.getIngredientName(rawName) : rawName;
        const count = (typeof i.count === 'number' && Number.isFinite(i.count)) ? i.count : 0;
        const ingIcon = _resolveRecipeAssetUrl(i.icon);
        return `
        <div class="recipe-ing-chip" title="${ingDisplayName} × ${count}">
          ${ingIcon ? `<img src="${ingIcon}" class="recipe-ing-icon" width="20" height="20" alt="${ingDisplayName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : ''}
          <span class="recipe-ing-count">×${count}</span>
        </div>
      `;
      }).join('')}
    </div>`;
  }

  function renderPantryBadge(recipe) {
    const missing = recipe._missingCount || 0;
    if (missing === 0) {
      return `<span class="recipe-pantry-badge pantry-ready">${window.I18N?.t?.('recipe.pantry_badge_ready') ?? '可烹飪'}</span>`;
    }
    const details = recipe._missingDetails || [];
    const tooltip = details.map(d => `${(window.I18N && typeof window.I18N.getIngredientName === 'function') ? window.I18N.getIngredientName(d.name) : (window.I18N?.text?.(d.name) ?? d.name)}: ${d.onHand}/${d.required} (-${d.missing})`).join('\n');
    return `<span class="recipe-pantry-badge pantry-missing" title="${tooltip}">${window.I18N?.t?.('recipes.ui_pantry_missing_count', { count: missing }) ?? `缺 ${missing}`}</span>`;
  }

  function renderEnergyStack(finalE) {
    return `
      <div class="desktop-energy-stack ${showTasty ? 'has-tasty' : 'single-energy'}">
        <div class="desktop-energy-row energy-1x">
          <span class="energy-multiplier">1x</span>
          <span class="energy-number">${finalE.toLocaleString()}</span>
        </div>
        ${showTasty ? `
          <div class="desktop-energy-row energy-2x">
            <span class="energy-multiplier">2x</span>
            <span class="energy-number">${Math.round(finalE * 2).toLocaleString()}</span>
          </div>
          <div class="desktop-energy-row energy-3x">
            <span class="energy-multiplier">3x</span>
            <span class="energy-number">${Math.round(finalE * 3).toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── 側邊欄展開/收合事件與計數 ───────────────────────── */
  function updateRecipeActiveFilterBadge() {
    const badge = document.getElementById('recipe-sidebar-bookmark-badge');
    const clearIncBtn = document.getElementById('clear-ingredients-btn');
    const clearExcBtn = document.getElementById('clear-excluded-btn');
    if (clearIncBtn) clearIncBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
    if (clearExcBtn) clearExcBtn.style.display = excludedIngredients.size > 0 ? 'inline-block' : 'none';

    let activeCount = 0;
    if (selectedCategory && selectedCategory !== 'ALL') activeCount++;
    if (minBonus > 0) activeCount++;
    if (minPot > 0) activeCount++;
    if (selectedIngredients.size > 0) activeCount += 1;
    if (excludedIngredients.size > 0) activeCount += 1;
    if (recipeLevel > 1 || islandBonus > 0 || eventBonus > 1.0 || showTasty) activeCount++;
    if (filterCookableOnly) activeCount++;
    if (Object.keys(pantryInventory).length > 0) activeCount++;

    if (badge) {
      badge.textContent = activeCount;
      badge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
    }

    const cookableBtn = document.getElementById('recipe-cookable-filter-btn');
    if (cookableBtn && cookableBtn.classList) {
      if (typeof cookableBtn.classList.toggle === 'function') cookableBtn.classList.toggle('active', filterCookableOnly);
      else cookableBtn.classList[filterCookableOnly ? 'add' : 'remove']('active');
    }
  }

  function initRecipeSidebarEvents() {
    const sidebar = document.getElementById('recipe-filter-sidebar');
    const bookmarkHandle = document.getElementById('recipe-sidebar-bookmark-handle');
    const closeBtn = document.getElementById('recipe-sidebar-close-btn');
    const backdrop = document.getElementById('recipe-sidebar-backdrop');
    const resetAllBtn = document.getElementById('recipe-sidebar-reset-all-btn') || document.getElementById('recipe-reset-all-btn');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    function toggleRecipeSidebar(forceState) {
      if (!sidebar) return;
      const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
      const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

      if (shouldCollapse) {
        sidebar.classList.add('collapsed');
        if (backdrop) backdrop.classList.remove('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.remove('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.title = window.I18N?.t?.('recipes.ui_sidebar_expand') ?? '展開食譜篩選側邊欄';
          Object.assign(bookmarkHandle.style, { opacity: '1', pointerEvents: 'auto', display: 'flex', visibility: 'visible' });
        }
        if (typeof window.setSidebarSavedState === 'function') window.setSidebarSavedState('pksleep_recipe_sidebar_open', false);
      } else {
        if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
        sidebar.classList.remove('collapsed');
        if (backdrop) backdrop.classList.add('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.title = window.I18N?.t?.('recipes.ui_sidebar_collapse') ?? '收合食譜篩選側邊欄';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
        if (typeof window.setSidebarSavedState === 'function') window.setSidebarSavedState('pksleep_recipe_sidebar_open', true);
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    }
    window.toggleRecipeSidebar = toggleRecipeSidebar;

    const initialOpen = (typeof window.getSidebarSavedState === 'function')
      ? window.getSidebarSavedState('pksleep_recipe_sidebar_open', !isMobileH5)
      : (!isMobileH5);

    if (sidebar) {
      if (initialOpen) {
        sidebar.classList.remove('collapsed');
        if (backdrop) backdrop.classList.add('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
      } else {
        sidebar.classList.add('collapsed');
        if (bookmarkHandle) {
          bookmarkHandle.classList.remove('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.style.display = 'flex';
          bookmarkHandle.style.opacity = '1';
          bookmarkHandle.style.pointerEvents = 'auto';
          bookmarkHandle.style.visibility = 'visible';
        }
      }
    }

    if (bookmarkHandle && !bookmarkHandle._hasListener) {
      bookmarkHandle._hasListener = true;
      bookmarkHandle.addEventListener('click', (e) => { e.stopPropagation(); toggleRecipeSidebar(); });
    }
    if (closeBtn && !closeBtn._hasListener) {
      closeBtn._hasListener = true;
      closeBtn.addEventListener('click', () => toggleRecipeSidebar(false));
    }
    if (backdrop && !backdrop._hasListener) {
      backdrop._hasListener = true;
      backdrop.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleRecipeSidebar(false); });
    }
    if (sidebar && typeof window.bindSidebarSwipeRightToClose === 'function') {
      window.bindSidebarSwipeRightToClose(sidebar, () => toggleRecipeSidebar(false));
    }

    if (resetAllBtn && !resetAllBtn._hasListener) {
      resetAllBtn._hasListener = true;
      resetAllBtn.addEventListener('click', () => {
        selectedCategory = 'ALL';
        minBonus = 0;
        filterCookableOnly = false;
        selectedIngredients.clear();
        excludedIngredients.clear();
        currentSearch = '';
        if (searchInput) searchInput.value = '';
        updateRecipeClearBtn();
        if (bonusSelect) { bonusSelect.value = '0'; bonusSelect.dispatchEvent(new Event('sync-ui')); }
        if (categoryContainer) {
          categoryContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL'));
        }
        document.querySelectorAll('#ingredient-picker-tags .ing-picker-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#excluded-ingredient-picker-tags .ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        savePrefs();
        updateRecipeActiveFilterBadge();
        render();
      });
    }
    updateRecipeActiveFilterBadge();
  }

  /* ─── 選擇器與互動初始化 ─────────────────────────────── */
  function initCategoryFilters() {
    if (!categoryContainer) return;
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catCounts  = { '咖哩': 0, '沙拉': 0, '甜點': 0 };
    for (let i = 0; i < allRecipes.length; i++) {
      const c = allRecipes[i] && allRecipes[i].category;
      if (catCounts[c] !== undefined) catCounts[c]++;
    }

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : (catCounts[cat] || 0);
      const active = cat === selectedCategory ? 'active' : '';
      return `<button class="tag-btn ${active}" data-cat="${cat}">${_getRecipeCategoryLabel(cat)} (${count})</button>`;
    }).join('');

    if (!categoryContainer._hasListener) {
      categoryContainer._hasListener = true;
      categoryContainer.addEventListener('click', e => {
        const btn = e.target.closest('.tag-btn');
        if (btn) {
          selectedCategory = btn.getAttribute('data-cat');
          categoryContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          savePrefs();
          render();
        }
      });
    }
  }

  function initIngredientPicker() {
    if (!ingredientPickerContainer) return;
    const ingMap = new Map();
    allRecipes.forEach(r => {
      (Array.isArray(r.ingredients) ? r.ingredients : []).forEach(ing => {
        if (ing && ing.name && !ingMap.has(ing.name)) ingMap.set(ing.name, ing.icon || '');
      });
    });

    const ingNames = ingMap.size > 0
      ? _sortRecipesIngredientsByEnergyAsc(Array.from(ingMap.keys()))
      : _getRecipesCanonicalIngredients();
    const excludedPickerContainer = document.getElementById('excluded-ingredient-picker-tags');

    const renderPickerButtons = (container, set, activeCls) => {
      if (!container) return;
      container.innerHTML = ingNames.map(name => {
        const icon = _resolveRecipeAssetUrl(ingMap.get(name));
        const active = set.has(name) ? activeCls : '';
        const ingTitle = window.I18N ? window.I18N.getIngredientName(name) : name;
        return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${ingTitle}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" width="22" height="22" loading="lazy" decoding="async" alt="${ingTitle}">` : ''}
        </button>`;
      }).join('');
    };

    renderPickerButtons(ingredientPickerContainer, selectedIngredients, 'active');
    renderPickerButtons(excludedPickerContainer, excludedIngredients, 'active-exclude');

    const bindPickerClicks = (container, set, oppositeSet, activeCls, oppCls, oppContainer) => {
      if (!container || container._hasListener) return;
      container._hasListener = true;
      container.addEventListener('click', e => {
        const btn = e.target.closest('.ing-picker-btn');
        if (!btn) return;
        const name = btn.getAttribute('data-name');
        if (oppositeSet.has(name)) {
          oppositeSet.delete(name);
          const oppBtn = oppContainer && oppContainer.querySelector(`[data-name="${CSS.escape(name)}"]`);
          if (oppBtn) oppBtn.classList.remove(oppCls);
        }
        if (set.has(name)) {
          set.delete(name);
          btn.classList.remove(activeCls);
        } else {
          set.add(name);
          btn.classList.add(activeCls);
        }
        savePrefs();
        render();
      });
    };

    bindPickerClicks(ingredientPickerContainer, selectedIngredients, excludedIngredients, 'active', 'active-exclude', excludedPickerContainer);
    bindPickerClicks(excludedPickerContainer, excludedIngredients, selectedIngredients, 'active-exclude', 'active', ingredientPickerContainer);

    if (clearIngredientsBtn && !clearIngredientsBtn._hasListener) {
      clearIngredientsBtn._hasListener = true;
      clearIngredientsBtn.addEventListener('click', () => {
        selectedIngredients.clear();
        excludedIngredients.clear();
        document.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active', 'active-exclude'));
        savePrefs();
        render();
      });
    }

    const clearExcludedBtn = document.getElementById('clear-excluded-btn');
    if (clearExcludedBtn && !clearExcludedBtn._hasListener) {
      clearExcludedBtn._hasListener = true;
      clearExcludedBtn.addEventListener('click', () => {
        excludedIngredients.clear();
        if (excludedPickerContainer) excludedPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        savePrefs();
        render();
      });
    }

    document.querySelectorAll('input[name="ingredient-match-mode"]').forEach(radio => {
      if (radio.value === matchMode) radio.checked = true;
      radio.addEventListener('change', e => {
        matchMode = e.target.value;
        savePrefs();
        render();
      });
    });
  }

  function initViewToggle() {
    if (!toggleGridBtn || !toggleTableBtn) return;
    if (toggleGridBtn.classList) {
      if (typeof toggleGridBtn.classList.toggle === 'function') toggleGridBtn.classList.toggle('active', viewMode === 'grid');
      else toggleGridBtn.classList[viewMode === 'grid' ? 'add' : 'remove']('active');
    }
    if (toggleTableBtn.classList) {
      if (typeof toggleTableBtn.classList.toggle === 'function') toggleTableBtn.classList.toggle('active', viewMode === 'table');
      else toggleTableBtn.classList[viewMode === 'table' ? 'add' : 'remove']('active');
    }

    toggleGridBtn.addEventListener('click', () => {
      viewMode = 'grid';
      toggleGridBtn.classList.add('active');
      toggleTableBtn.classList.remove('active');
      savePrefs();
      render();
    });
    toggleTableBtn.addEventListener('click', () => {
      viewMode = 'table';
      toggleTableBtn.classList.add('active');
      toggleGridBtn.classList.remove('active');
      savePrefs();
      render();
    });
  }

  function initSort() {
    if (!sortSelect) return;
    if (!sortSelect.querySelector('option[value="missing-asc"]')) {
      const opt = document.createElement('option');
      opt.value = 'missing-asc';
      opt.textContent = window.I18N?.t?.('recipe.sort_missing_asc') ?? '缺件最少（優先可煮）';
      opt.setAttribute('data-i18n', 'recipe.sort_missing_asc');
      sortSelect.appendChild(opt);
    }
    sortSelect.value = sortOption;
    setupCustomSelect(sortSelect);
    sortSelect.addEventListener('change', () => {
      sortOption = sortSelect.value;
      savePrefs();
      render();
    });
  }

  function updateRecipeClearBtn() {
    if (!searchInput) return;
    if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      window.updateSearchInputHighlight(searchInput, recipeSearchClear);
    } else if (recipeSearchClear) {
      recipeSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
    }
  }

  function initSearch() {
    if (!searchInput) return;
    let recipeSearchTimer = null;
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value.trim().toLowerCase();
      updateRecipeClearBtn();
      if (recipeSearchTimer) clearTimeout(recipeSearchTimer);
      recipeSearchTimer = setTimeout(() => {
        recipeSearchTimer = null;
        render();
      }, 90);
    });

    if (recipeSearchClear) {
      recipeSearchClear.addEventListener('click', () => {
        if (recipeSearchTimer) { clearTimeout(recipeSearchTimer); recipeSearchTimer = null; }
        searchInput.value = '';
        currentSearch = '';
        updateRecipeClearBtn();
        searchInput.focus();
        render();
      });
    }
  }

  /* ─── 渲染主入口 ────────────────────────────────────── */
  function render() {
    if (!contentArea || !countBadge) return;
    syncPotExpansionUI();
    initCategoryFilters();
    updateRecipeActiveFilterBadge();
    const filtered = getFilteredRecipes();

    const catCounts = {};
    filtered.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const breakdownHTML = Object.entries(catCounts).map(([cat, c]) => `${_getRecipeCategoryLabel(cat)} <strong>${c}</strong>`).join(' · ');

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const lvBonus = getLevelBonus(recipeLevel);
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventMult = Number(eventBonus).toFixed(2);

    let formulaParts = [`Lv.${recipeLevel}${lvBonus > 0 ? ` (+${lvBonus}%)` : ''}`];
    if (islandBonus > 0) formulaParts.push(`+${islandBonus}% (×${islandMult})`);
    if (eventBonus > 1.0) formulaParts.push(`×${eventMult}`);
    if (potExpansion > 0) formulaParts.push(`${window.I18N?.t?.('recipes.ui_pot_extra', { count: potExpansion }) ?? `+${potExpansion}料`} (+${(potExpansion * 100).toLocaleString()})`);
    const formulaText = formulaParts.join(' · ');

    if (isMobileH5) {
      countBadge.style.display = 'flex';
      countBadge.innerHTML = `
        <span class="rc-badge-count">${window.I18N?.t?.('recipes.ui_dishes_count_mobile', { count: filtered.length }) ?? `食譜 <strong>${filtered.length}</strong> 道`}</span>
        <span class="rc-badge-formula">${formulaText}</span>
      `;
    } else {
      countBadge.innerHTML = window.I18N?.t?.('recipes.ui_dishes_count_desktop', { count: filtered.length, breakdown: breakdownHTML }) ?? `食譜 <strong>${filtered.length}</strong> 道（${breakdownHTML}）`;
    }

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">${window.I18N?.t?.('recipes.ui_no_matching') ?? '未找到符合條件的料理食譜'}</div>`;
      return;
    }

    if (isMobileH5 || viewMode === 'grid') renderGrid(filtered);
    else renderTable(filtered);
  }

  function renderTable(recipes) {
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';
    const potSub = potExpansion > 0 ? ` · ${window.I18N?.t?.('recipes.ui_pot_extra', { count: potExpansion }) ?? `+${potExpansion}料`}` : '';

    contentArea.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table recipe-table">
          <thead>
            <tr>
              <th style="width:68px;text-align:center;">${t('recipe.th_icon', '圖示')}</th>
              <th class="sortable" data-sort="name" style="min-width:140px;">${t('recipe.th_name', '料理名稱')} <span class="sort-arrow"></span></th>
              <th class="sortable" data-sort="category" style="width:100px;">${t('recipe.th_type', '分類')} <span class="sort-arrow"></span></th>
              <th class="sortable" data-sort="pot" style="width:90px;">${t('recipe.th_pot', '鍋子容量')} <span class="sort-arrow"></span></th>
              <th style="min-width:180px;">${t('recipe.th_ingredients', '食材需求')}</th>
              <th class="sortable th-energy" data-sort="energy" style="min-width:140px;text-align:right;padding-right:32px;">
                ${t('recipe.th_final_energy', '預估能量')} <span class="sort-arrow"></span>
                <div class="table-sub-header">Lv.${recipeLevel} · ×${islandMult}${eventSub}${potSub}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const finalE        = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
              const primaryName   = getRecipeName(r);
              const cnAlt         = (r.name_cn && r.name_cn !== primaryName) ? r.name_cn : '';
              const enAlt         = r.name_en || '';
              const secondaryName = window.I18N && typeof window.I18N.pick === 'function'
                ? window.I18N.pick({ 'zh-TW': enAlt, 'zh-CN': enAlt, 'en-US': cnAlt })
                : enAlt;
              const pantryBadgeHTML = renderPantryBadge(r);
              return `
              <tr>
                <td style="vertical-align:middle;text-align:center;">
                  <img src="${_resolveRecipeAssetUrl(r.icon)}" width="58" height="58" alt="${primaryName}" loading="lazy" decoding="async" onerror="this.style.opacity='0.3';" style="object-fit:contain;display:block;margin:0 auto;">
                </td>
                <td class="recipe-name-cell" style="vertical-align:middle;text-align:left;">
                  <div class="recipe-name-wrapper" style="display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;min-height:52px;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <span class="recipe-name-primary" style="font-weight:700;font-size:15px;color:var(--text-main);line-height:1.3;">${primaryName}</span>
                      ${pantryBadgeHTML}
                    </div>
                    ${secondaryName ? `<span class="recipe-name-sub" style="color:var(--text-muted);font-size:11px;font-weight:400;margin-top:2px;line-height:1.2;text-align:left;">${secondaryName}</span>` : ''}
                  </div>
                </td>
                <td style="vertical-align:middle;"><span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span></td>
                <td style="vertical-align:middle;">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <span class="pot-badge">${r.pot_size}</span>
                    <button type="button" class="pot-filler-open-btn" data-recipe-id="${r.name_cn}" title="${window.I18N?.t?.('recipes.ui_optimize_pot_title') ?? '填鍋與容量最佳化'}">
                      ${window.I18N?.t?.('recipes.ui_optimizer_btn') ?? '最佳加料'}
                    </button>
                  </div>
                </td>
                <td style="vertical-align:middle;">${renderIngRow(r.ingredients)}</td>
                <td class="recipe-energy-cell" style="vertical-align:middle;text-align:right;padding-right:32px;">
                  ${renderEnergyStack(finalE)}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindTableActionEvents();
  }

  function renderGrid(recipes) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';

    if (isMobileH5) {
      contentArea.innerHTML = `
        <div class="h5-recipe-cards-list">
          ${recipes.map(r => {
            const finalE = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
            const primaryName = getRecipeName(r);
            const pantryBadgeHTML = renderPantryBadge(r);
            return `
            <div class="h5-recipe-card">
              <div class="h5-recipe-left-col">
                <div class="h5-recipe-top-row">
                  <img class="h5-recipe-img" src="${_resolveRecipeAssetUrl(r.icon)}" width="44" height="44" alt="${primaryName}" loading="lazy" decoding="async" onerror="this.style.display='none';">
                  <div class="h5-recipe-title-meta">
                    <span class="h5-recipe-name">${primaryName}</span>
                    <div class="h5-recipe-tags-row">
                      <span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span>
                      <span class="h5-recipe-pot">${r.pot_size}</span>
                      ${pantryBadgeHTML}
                      <button type="button" class="pot-filler-open-btn compact-filler-btn" data-recipe-id="${r.name_cn}">${window.I18N?.t?.('recipes.ui_optimizer_btn_short') ?? '加料'}</button>
                    </div>
                  </div>
                </div>
                <div class="h5-recipe-ing-section">${renderIngRow(r.ingredients)}</div>
              </div>
              <div class="h5-recipe-energy-col ${showTasty ? 'has-tasty' : 'single-energy'}">
                <div class="h5-energy-score energy-1x"><span class="energy-multiplier">1x</span><span class="energy-number">${finalE.toLocaleString()}</span></div>
                ${showTasty ? `
                  <div class="h5-energy-score energy-2x"><span class="energy-multiplier">2x</span><span class="energy-number">${(finalE * 2).toLocaleString()}</span></div>
                  <div class="h5-energy-score energy-3x"><span class="energy-multiplier">3x</span><span class="energy-number">${(finalE * 3).toLocaleString()}</span></div>
                ` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      `;
      bindTableActionEvents();
      return;
    }

    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const finalE = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
          const primaryName = getRecipeName(r);
          const pantryBadgeHTML = renderPantryBadge(r);
          return `
          <div class="pokemon-card recipe-desktop-card">
            <div class="card-header" style="align-items:center;margin-bottom:6px;">
              <img class="card-icon" src="${r.icon}" width="56" height="56" alt="${primaryName}" loading="lazy" decoding="async" onerror="this.style.opacity='0.3';" style="width:56px;height:56px;object-fit:contain;">
              <div class="card-title-group" style="flex:1;min-width:0;">
                <h3 class="pokemon-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;margin-bottom:3px;">${primaryName}</h3>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  <span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span>
                  ${pantryBadgeHTML}
                </div>
              </div>
            </div>

            <div class="recipe-desktop-stats">
              <div class="recipe-stat-row">
                <span class="stat-label">${t('recipe.th_pot', '鍋子容量')}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="stat-value pot-value">${r.pot_size}</span>
                  <button type="button" class="pot-filler-open-btn" data-recipe-id="${r.name_cn}" title="${window.I18N?.t?.('recipes.ui_optimize_pot_title') ?? '填鍋與容量最佳化'}">
                    ${window.I18N?.t?.('recipes.ui_optimizer_btn') ?? '最佳加料'}
                  </button>
                </div>
              </div>
              <div class="recipe-stat-row ${showTasty ? 'has-tasty-energy' : ''}" style="${showTasty ? 'align-items:flex-start;' : 'align-items:center;'}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                  <span class="stat-label">${t('recipe.th_final_energy', '預估能量')}</span>
                  <span style="color:var(--text-muted);font-size:10.5px;font-weight:400;margin-top:1px;">Lv.${recipeLevel} · ×${islandMult}${eventSub}</span>
                </div>
                ${renderEnergyStack(finalE)}
              </div>
            </div>

            <div class="recipe-desktop-ings">
              <div class="recipe-ing-row compact-4-row">
                ${(Array.isArray(r.ingredients) ? r.ingredients : []).map(i => {
                  if (!i || typeof i !== 'object') return '';
                  const rawName = typeof i.name === 'string' ? i.name : String(i.name || '');
                  const ingDisplayName = (window.I18N && rawName) ? window.I18N.getIngredientName(rawName) : rawName;
                  const count = (typeof i.count === 'number' && Number.isFinite(i.count)) ? i.count : 0;
                  return `
                  <div class="recipe-ing-chip compact-chip" title="${ingDisplayName} × ${count}">
                    ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" width="20" height="20" alt="${ingDisplayName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : ''}
                    <span class="recipe-ing-count">×${count}</span>
                  </div>
                `;
                }).join('')}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;

    bindTableActionEvents();
  }

  function bindTableActionEvents() {
    if (!contentArea || contentArea._hasPotFillerListener) return;
    contentArea._hasPotFillerListener = true;
    contentArea.addEventListener('click', e => {
      const btn = e.target && e.target.closest ? e.target.closest('.pot-filler-open-btn') : null;
      if (!btn) return;
      e.stopPropagation();
      const recipeId = btn.getAttribute('data-recipe-id');
      const targetRecipe = allRecipes.find(r => r.name_cn === recipeId || r.name === recipeId);
      if (targetRecipe) openPotFillerModal(targetRecipe);
    });
  }

  window.RecipesApp = {
    render: function() {
      if (typeof startRecipesFetch === 'function' && !_recipesFetchStarted) {
        startRecipesFetch();
      }
      initCategoryFilters();
      initIngredientPicker();
      initPantryUI();
      render();
    },
    calcEnergy: calcEnergy,
    getLevelBonus: getLevelBonus,
    isRecipesHealthy: isRecipesHealthy,
    getPotExpansion: function() { return potExpansion; },
    setPotExpansion: function(val) {
      potExpansion = Math.min(700, Math.max(0, Number(val) || 0));
      syncPotExpansionUI();
      savePrefs();
      render();
    },
    getPantry: getPantry,
    setPantryIngredient: setPantryIngredient,
    clearPantry: clearPantry,
    calculateRecipeMissingCount: calculateRecipeMissingCount,
    getRecipeMissingDetails: getRecipeMissingDetails,
    getFilterCookableOnly: function() { return filterCookableOnly; },
    setFilterCookableOnly: function(val) {
      filterCookableOnly = Boolean(val);
      savePrefs();
      updateRecipeActiveFilterBadge();
      render();
    },
    getEffectivePotCapacity: getEffectivePotCapacity,
    getPotCapacity: function() { return potCapacity; },
    setPotCapacity: function(val) {
      potCapacity = Math.max(15, Math.min(200, Number(val) || 57));
      savePrefs();
      render();
    },
    setCampTicket: function(val) {
      campTicketActive = Boolean(val);
      savePrefs();
      render();
    },
    setSundayExpansion: function(val) {
      sundayExpansionActive = Boolean(val);
      savePrefs();
      render();
    },
    getRecommendedFillers: getRecommendedFillers,
    calculateMealEnergyWithFillers: calculateMealEnergyWithFillers,
    openPotFillerModal: openPotFillerModal
  };
}

if (typeof window !== 'undefined') {
  window.isRecipesHealthy = isRecipesHealthy;
  if (!window.RecipesApp) window.RecipesApp = {};
  window.RecipesApp.isRecipesHealthy = isRecipesHealthy;
}

if (typeof global !== 'undefined') {
  global.isRecipesHealthy = isRecipesHealthy;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRecipesModule);
  else initRecipesModule();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isRecipesHealthy: isRecipesHealthy,
    RecipesApp: (typeof window !== 'undefined' && window.RecipesApp) ? window.RecipesApp : { isRecipesHealthy: isRecipesHealthy }
  };
}
})();
