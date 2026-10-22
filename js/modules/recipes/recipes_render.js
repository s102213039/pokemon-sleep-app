  function calcEnergy(base, level, islandBonusPct, eventBonusMult = 1.0, extraCount = potExpansion, extraUnitEnergy = 100) {
    // 1. 食譜等級加成（僅乘在食譜本體需求食材上，追加食材不享等級加成）
    const lvMultiplier     = 1 + (getLevelBonus(level) / 100);
    const recipeBaseWithLv = base * lvMultiplier;

    // 2. 多餘食材追加能量（依官方機制，預設以每個 100 點基礎能量計算）
    const validExtraCount  = Math.max(0, Number(extraCount) || 0);
    const extraBaseEnergy  = validExtraCount * (extraUnitEnergy || 100);

    // 3. 鍋內所有食材小計
    const potSubtotal      = recipeBaseWithLv + extraBaseEnergy;

    // 4. 島嶼加成（適用於整鍋所有食材）
    const islandMultiplier = 1 + (islandBonusPct / 100);

    // 5. 活動加成（適用於最終總能量倍率）與整數四捨五入
    return Math.round(potSubtotal * islandMultiplier * eventBonusMult);
  }

  /* ─── 篩選 + 排序 ───────────────────────────────────── */
  function getFilteredRecipes() {
    const hasSelectedIngs = selectedIngredients.size > 0;
    const hasExcludedIngs = excludedIngredients.size > 0;
    const selectedIngArr  = hasSelectedIngs ? [...selectedIngredients] : null;

    const filtered = allRecipes.filter(recipe => {
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;
      if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;
      if (minPot   > 0 && (recipe.pot_size   || 0) < minPot)  return false;
      if (!recipe._ingNameSet) {
        recipe._ingNameSet = new Set(recipe.ingredients.map(i => i.name));
        recipe._searchStr = ((recipe.name_cn || '') + ' ' + (recipe.name_en || '') + ' ' + recipe.ingredients.map(i => i.name).join(' ')).toLowerCase();
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
      return true;
    });

    if (sortOption === 'energy-desc' || sortOption === 'energy-asc') {
      for (let i = 0; i < filtered.length; i++) {
        const r = filtered[i];
        r._cachedEnergy = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
      }
    }

    return filtered.sort((a, b) => {
      if (sortOption === 'energy-desc')  return b._cachedEnergy - a._cachedEnergy;
      if (sortOption === 'energy-asc')   return a._cachedEnergy - b._cachedEnergy;
      if (sortOption === 'pot-asc')      return a.pot_size - b.pot_size;
      if (sortOption === 'pot-desc')     return b.pot_size - a.pot_size;
      if (sortOption === 'bonus-desc')   return (b.bonus_pct || 0) - (a.bonus_pct || 0);
      if (sortOption === 'name-asc')     return a.name_cn.localeCompare(b.name_cn, 'zh-TW');
      return 0;
    });
  }

  /* ─── Badge 輔助 ────────────────────────────────────── */
  function getBonusEmoji(pct) {
    if (pct >= 78) return 'S';
    if (pct >= 61) return 'A';
    if (pct >= 48) return 'B';
    if (pct >= 35) return 'C';
    if (pct >= 25) return 'D';
    if (pct >= 21) return 'E';
    return '-';
  }

  function getBonusBadgeClass(pct) {
    if (pct >= 78) return 'bonus-badge-78';
    if (pct >= 61) return 'bonus-badge-61';
    if (pct >= 48) return 'bonus-badge-48';
    if (pct >= 35) return 'bonus-badge-35';
    if (pct >= 25) return 'bonus-badge-25';
    return 'bonus-badge-default';
  }

  function renderIngRow(ingredients) {
    return `<div class="recipe-ing-row">
      ${ingredients.map(i => {
        const ingDisplayName = window.I18N ? window.I18N.getIngredientName(i.name) : i.name;
        return `
        <div class="recipe-ing-chip" title="${ingDisplayName} × ${i.count}">
          ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" alt="${ingDisplayName}" loading="lazy">` : ''}
          <span class="recipe-ing-count">×${i.count}</span>
        </div>
      `;
      }).join('')}
    </div>`;
  }

  /* ─── 側邊欄展開/收合事件與計數 ───────────────────────── */
  function updateRecipeActiveFilterBadge() {
    const badge = document.getElementById('recipe-sidebar-bookmark-badge');
    const clearIncBtn = document.getElementById('clear-ingredients-btn');
    const clearExcBtn = document.getElementById('clear-excluded-btn');

    if (clearIncBtn) {
      clearIncBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
    }
    if (clearExcBtn) {
      clearExcBtn.style.display = excludedIngredients.size > 0 ? 'inline-block' : 'none';
    }

    let activeCount = 0;
    if (selectedCategory && selectedCategory !== 'ALL') activeCount++;
    if (minBonus > 0) activeCount++;
    if (minPot > 0) activeCount++;
    if (selectedIngredients.size > 0) activeCount += 1;
    if (excludedIngredients.size > 0) activeCount += 1;
    if (recipeLevel > 1 || islandBonus > 0 || eventBonus > 1.0 || showTasty) activeCount++;

    if (badge) {
      if (activeCount > 0) {
        badge.textContent = activeCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
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
          bookmarkHandle.title = '展開食譜篩選側邊欄';
          bookmarkHandle.style.opacity = '1';
          bookmarkHandle.style.pointerEvents = 'auto';
          bookmarkHandle.style.display = 'flex';
          bookmarkHandle.style.visibility = 'visible';
        }
        if (typeof window.setSidebarSavedState === 'function') {
          window.setSidebarSavedState('pksleep_recipe_sidebar_open', false);
        }
      } else {
        if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
        sidebar.classList.remove('collapsed');
        if (backdrop) {
          backdrop.classList.add('active');
        }
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.title = '收合食譜篩選側邊欄';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
        if (typeof window.setSidebarSavedState === 'function') {
          window.setSidebarSavedState('pksleep_recipe_sidebar_open', true);
        }
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    }
    window.toggleRecipeSidebar = toggleRecipeSidebar;

    // 依暫存狀態初始化食譜側邊欄展開/收合
    const initialRecipeOpen = (function() {
      if (typeof window.getSidebarSavedState === 'function') {
        return window.getSidebarSavedState('pksleep_recipe_sidebar_open', true);
      }
      try {
        const saved = sessionStorage.getItem('pksleep_recipe_sidebar_open');
        if (saved !== null) return saved === 'true';
      } catch (e) {}
      return isMobileH5 ? false : true;
    })();

    if (sidebar) {
      if (initialRecipeOpen) {
        sidebar.classList.remove('collapsed');
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
        if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
        if (backdrop) backdrop.classList.add('active');
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

    if (bookmarkHandle && sidebar && !bookmarkHandle._hasListener) {
      bookmarkHandle._hasListener = true;
      if (typeof window.makeFloatingDraggable === 'function' && isMobileH5) {
        window.makeFloatingDraggable(bookmarkHandle, () => toggleRecipeSidebar());
      } else {
        bookmarkHandle.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleRecipeSidebar();
        });
      }
    }

    if (closeBtn && sidebar && !closeBtn._hasListener) {
      closeBtn._hasListener = true;
      closeBtn.addEventListener('click', () => {
        toggleRecipeSidebar(false);
      });
    }

    if (backdrop && sidebar && !backdrop._hasListener) {
      backdrop._hasListener = true;
      if (typeof window.bindBackdropDismiss === 'function') {
        window.bindBackdropDismiss(backdrop, () => toggleRecipeSidebar(false));
      } else {
        backdrop.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: false });
        backdrop.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleRecipeSidebar(false);
        }, { passive: false });
        backdrop.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleRecipeSidebar(false);
        });
      }
    }

    if (sidebar) {
      if (typeof window.bindSidebarSwipeRightToClose === 'function') {
        window.bindSidebarSwipeRightToClose(sidebar, () => {
          toggleRecipeSidebar(false);
        });
      }
    }

    if (resetAllBtn && !resetAllBtn._hasListener) {
      resetAllBtn._hasListener = true;
      resetAllBtn.addEventListener('click', () => {
        // 重設分類、食材與搜尋條件（保留「鍋子容量」與「能量試算設定」不重設，以符合使用者持久化保存需求）
        selectedCategory = 'ALL';
        minBonus = 0;
        selectedIngredients.clear();
        excludedIngredients.clear();
        currentSearch = '';

        if (searchInput) searchInput.value = '';
        updateRecipeClearBtn();

        if (bonusSelect) {
          bonusSelect.value = '0';
          bonusSelect.dispatchEvent(new Event('sync-ui'));
        }

        if (categoryContainer) {
          categoryContainer.querySelectorAll('.tag-btn').forEach(b => {
            if (b.getAttribute('data-cat') === 'ALL') b.classList.add('active');
            else b.classList.remove('active');
          });
        }

        const ingContainer = document.getElementById('ingredient-picker-tags');
        if (ingContainer) {
          ingContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active'));
        }
        const excContainer = document.getElementById('excluded-ingredient-picker-tags');
        if (excContainer) {
          excContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        }

        savePrefs();
        updateRecipeActiveFilterBadge();
        render();
      });
    }

    updateRecipeActiveFilterBadge();
  }

  /* ─── 渲染主入口 ────────────────────────────────────── */
  function render() {
    if (!contentArea || !countBadge) return;
    syncPotExpansionUI();
    initCategoryFilters();
    updateRecipeActiveFilterBadge();
    const filtered = getFilteredRecipes();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

    const catLabels = { '咖哩': isEN ? 'Curry' : (isCN ? '咖喱' : '咖哩'), '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : (isCN ? '甜点' : '甜點') };
    const catCounts = {};
    filtered.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const breakdownHTML = Object.entries(catCounts).map(([cat, c]) => `${catLabels[cat] || cat} <strong>${c}</strong>`).join(' · ');

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    const lvBonus = getLevelBonus(recipeLevel);
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventMult = Number(eventBonus).toFixed(2);

    let formulaParts = [];
    formulaParts.push(`Lv.${recipeLevel}${lvBonus > 0 ? ` (+${lvBonus}%)` : ''}`);
    if (islandBonus > 0) formulaParts.push(`+${islandBonus}% (×${islandMult})`);
    if (eventBonus > 1.0) formulaParts.push(`×${eventMult}`);
    if (potExpansion > 0) formulaParts.push(`+${potExpansion}料 (+${(potExpansion * 100).toLocaleString()})`);

    const formulaText = formulaParts.join(' · ');

    if (isMobileH5) {
      countBadge.style.display = 'flex';
      countBadge.innerHTML = isEN ? `
        <span class="rc-badge-count">Dishes <strong>${filtered.length}</strong></span>
        <span class="rc-badge-formula">${formulaText}</span>
      ` : `
        <span class="rc-badge-count">食譜 <strong>${filtered.length}</strong> 道</span>
        <span class="rc-badge-formula">${formulaText}</span>
      `;
    } else {
      countBadge.innerHTML = isEN ? `Dishes <strong>${filtered.length}</strong> (${breakdownHTML})` : `食譜 <strong>${filtered.length}</strong> 道（${breakdownHTML}）`;
    }

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">${isEN ? 'No matching recipes found' : '未找到符合條件的料理食譜'}</div>`;
      return;
    }

    if (isMobileH5 || viewMode === 'grid') renderGrid(filtered);
    else renderTable(filtered);
  }

  function renderTable(recipes) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const catLabels = { '咖哩': isEN ? 'Curry' : (isCN ? '咖喱' : '咖哩'), '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : (isCN ? '甜点' : '甜點') };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';
    const potSub = potExpansion > 0 ? ` · +${potExpansion}料` : '';
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
              const secondaryName = isEN ? (r.name_cn !== primaryName ? r.name_cn : '') : (r.name_en || '');
              const energyCellHTML = `
                <td class="recipe-energy-cell" style="vertical-align:middle;text-align:right;padding-right:32px;">
                  <div class="desktop-energy-stack ${showTasty ? 'has-tasty' : 'single-energy'}">
                    <div class="desktop-energy-row energy-1x">
                      <span class="energy-multiplier">${showTasty ? '1x' : '1x'}</span>
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
                </td>
              `;
              return `
              <tr>
                <td style="vertical-align:middle;text-align:center;">
                  <img src="${r.icon}" width="52" height="52" alt="${primaryName}" loading="lazy"
                    style="border-radius:10px;object-fit:contain;background:var(--bg-card-inner);padding:4px;border:1px solid var(--border-color);display:block;margin:0 auto;">
                </td>
                <td class="recipe-name-cell" style="vertical-align:middle;">
                  <div class="recipe-name-wrapper" style="display:flex;flex-direction:column;justify-content:center;min-height:52px;">
                    <span class="recipe-name-primary" style="font-weight:700;font-size:15px;color:var(--text-main);line-height:1.3;">${primaryName}</span>
                    ${secondaryName ? `<span class="recipe-name-sub" style="color:var(--text-muted);font-size:11px;font-weight:400;margin-top:2px;line-height:1.2;">${secondaryName}</span>` : ''}
                  </div>
                </td>
                <td style="vertical-align:middle;"><span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span></td>
                <td style="vertical-align:middle;"><span class="pot-badge">${r.pot_size}</span></td>
                <td style="vertical-align:middle;">${renderIngRow(r.ingredients)}</td>
                ${energyCellHTML}
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderGrid(recipes) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const catLabels = { '咖哩': isEN ? 'Curry' : (isCN ? '咖喱' : '咖哩'), '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : (isCN ? '甜点' : '甜點') };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';

    if (isMobileH5) {
      contentArea.innerHTML = `
        <div class="h5-recipe-cards-list">
          ${recipes.map(r => {
            const finalE     = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
            const primaryName = getRecipeName(r);
            return `
            <div class="h5-recipe-card">
              <div class="h5-recipe-left-col">
                <div class="h5-recipe-top-row">
                  <img class="h5-recipe-img" src="${r.icon}" alt="${primaryName}" loading="lazy" onerror="this.style.display='none';">
                  <div class="h5-recipe-title-meta">
                    <span class="h5-recipe-name">${primaryName}</span>
                    <div class="h5-recipe-tags-row">
                      <span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span>
                      <span class="h5-recipe-pot">${r.pot_size}</span>
                    </div>
                  </div>
                </div>
                <div class="h5-recipe-ing-section">
                  ${renderIngRow(r.ingredients)}
                </div>
              </div>
              <div class="h5-recipe-energy-col ${showTasty ? 'has-tasty' : 'single-energy'}">
                <div class="h5-energy-score energy-1x">
                  <span class="energy-multiplier">1x</span>
                  <span class="energy-number">${finalE.toLocaleString()}</span>
                </div>
                ${showTasty ? `
                  <div class="h5-energy-score energy-2x">
                    <span class="energy-multiplier">2x</span>
                    <span class="energy-number">${(finalE * 2).toLocaleString()}</span>
                  </div>
                  <div class="h5-energy-score energy-3x">
                    <span class="energy-multiplier">3x</span>
                    <span class="energy-number">${(finalE * 3).toLocaleString()}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      `;
      return;
    }

    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const finalE     = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
          const primaryName = getRecipeName(r);
          return `
          <div class="pokemon-card recipe-desktop-card">
            <div class="card-header" style="align-items:center;margin-bottom:6px;">
              <img class="card-icon" src="${r.icon}" alt="${primaryName}" style="width:48px;height:48px;border-radius:10px;object-fit:contain;background:var(--bg-card-inner);padding:2px;border:1px solid var(--border-color);">
              <div class="card-title-group" style="flex:1;min-width:0;">
                <h3 class="pokemon-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;margin-bottom:3px;">${primaryName}</h3>
                <div style="display:flex;gap:6px;align-items:center;">
                  <span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span>
                </div>
              </div>
            </div>

            <div class="recipe-desktop-stats">
              <div class="recipe-stat-row">
                <span class="stat-label">${t('recipe.th_pot', '鍋子容量')}</span>
                <span class="stat-value pot-value">${r.pot_size}</span>
              </div>
              <div class="recipe-stat-row ${showTasty ? 'has-tasty-energy' : ''}" style="${showTasty ? 'align-items:flex-start;' : 'align-items:center;'}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                  <span class="stat-label">${t('recipe.th_final_energy', '預估能量')}</span>
                  <span style="color:var(--text-muted);font-size:10.5px;font-weight:400;margin-top:1px;">Lv.${recipeLevel} · ×${islandMult}${eventSub}</span>
                </div>
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
              </div>
            </div>

            <div class="recipe-desktop-ings">
              <div class="recipe-ing-row compact-4-row">
                ${r.ingredients.map(i => {
                  const ingDisplayName = window.I18N ? window.I18N.getIngredientName(i.name) : i.name;
                  return `
                  <div class="recipe-ing-chip compact-chip" title="${ingDisplayName} × ${i.count}">
                    ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" alt="${ingDisplayName}" loading="lazy">` : ''}
                    <span class="recipe-ing-count">×${i.count}</span>
                  </div>
                `;
                }).join('')}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }

    window.RecipesApp = {
      render: function() {
        initCategoryFilters();
        initIngredientPicker();
        render();
      },
      calcEnergy: calcEnergy,
      getLevelBonus: getLevelBonus,
      getPotExpansion: function() { return potExpansion; },
      setPotExpansion: function(val) {
        potExpansion = Math.min(700, Math.max(0, Number(val) || 0));
        syncPotExpansionUI();
        savePrefs();
        render();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipesModule);
  } else {
    initRecipesModule();
  }
})();
