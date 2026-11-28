  const BOX_SPECIALTIES = ['樹果', '食材', '技能'];

  function renderBoxSpecialtyButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-specialty-filter-tags');
    if (!container) return;
    container.innerHTML = BOX_SPECIALTIES.map(s => {
      const isActive = boxSelectedSpecialties.has(s);
      const label = window.I18N ? window.I18N.getSpecialtyName(s) : s;
      return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-specialty="${s}">${label}</button>`;
    }).join('');
  }

  function renderBoxBerryButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-berry-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-berries-btn');
    const berryData = getBerryData();
    container.innerHTML = berryData.map(b => {
      const isActive = boxSelectedBerries.has(b.name);
      const berryName = (typeof window !== 'undefined' ? window.I18N?.getBerryName?.(b.name) : undefined) ?? b.name;
      const typeName = (typeof window !== 'undefined' ? window.I18N?.getTypeName?.(b.type) : undefined) ?? b.type;
      return `
        <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-berry="${b.name}" title="${berryName} (${typeName})" aria-label="${berryName}">
          ${b.icon ? `<img src="${b.icon}" class="subfilter-icon-img" width="22" height="22" alt="${berryName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : ''}
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedBerries.size > 0 ? 'inline-block' : 'none';
    }
  }

  function renderBoxIngredientButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-ingredient-pkm-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-ingredients-pkm-btn');
    const uniqueIngs = getUniqueIngredients();
    container.innerHTML = uniqueIngs.map(ing => {
      const isActive = boxSelectedIngredients.has(ing.name);
      const ingName = typeof window !== 'undefined' && window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
      return `
        <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-ing="${ing.name}" title="${ingName}" aria-label="${ingName}">
          ${ing.icon ? `<img src="${ing.icon}" class="subfilter-icon-img" width="22" height="22" alt="${ingName}" loading="lazy" decoding="async" onerror="this.style.display='none';">` : ''}
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedIngredients.size > 0 ? 'inline-block' : 'none';
    }
  }

  function renderBoxSkillButtons() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('box-skill-filter-tags');
    if (!container) return;
    const clearBtn = document.getElementById('box-clear-skills-btn');
    const baseSkills = getBaseSkills();
    container.innerHTML = baseSkills.map(skillItem => {
      const isActive = boxSelectedSkills.has(skillItem.key);
      const label = (typeof window !== 'undefined' ? window.I18N?.field?.(skillItem, 'label') : undefined) || skillItem.label || '';
      const fullTitle = (typeof window !== 'undefined' ? window.I18N?.getMainSkillName?.(skillItem.key || skillItem.label) : undefined) ?? label;
      return `
        <button type="button" class="subfilter-skill-btn ${isActive ? 'active' : ''}" data-skill="${skillItem.key}" title="${fullTitle}">
          <span class="subfilter-skill-name">${label}</span>
        </button>
      `;
    }).join('');

    if (clearBtn) {
      clearBtn.style.display = boxSelectedSkills.size > 0 ? 'inline-block' : 'none';
    }
  }

  function updateBoxActiveFilterBadge() {
    if (typeof document === 'undefined') return;
    let count = 0;
    if (boxSelectedSpecialties && boxSelectedSpecialties.size > 0) count += 1;
    if (boxSelectedBerries && boxSelectedBerries.size > 0) count += 1;
    if (boxSelectedIngredients && boxSelectedIngredients.size > 0) count += 1;
    if (boxSelectedSkills && boxSelectedSkills.size > 0) count += 1;
    if (boxOnlyInitialIng) count += 1;
    if (boxOnlyFinal) count += 1;
    if (boxShinyOnly) count += 1;
    if (boxRibbonOnly) count += 1;
    if (boxSelectedKeySubskills && boxSelectedKeySubskills.size > 0) count += boxSelectedKeySubskills.size;

    const badge = document.getElementById('box-sidebar-bookmark-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  function toggleBoxSidebar(forceState) {
    const sidebar = document.getElementById('box-filter-sidebar');
    const bookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
    const backdrop = document.getElementById('box-sidebar-backdrop');
    if (!sidebar) return;

    const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
    const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      if (backdrop) backdrop.classList.remove('active');
      if (bookmarkHandle) {
        bookmarkHandle.classList.remove('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'false');
        bookmarkHandle.title = (typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_expand_sidebar') : undefined) ?? '展開篩選側邊欄';
        bookmarkHandle.style.removeProperty('display');
        bookmarkHandle.style.removeProperty('opacity');
        bookmarkHandle.style.removeProperty('visibility');
        bookmarkHandle.style.removeProperty('pointer-events');
      }
      if (typeof window !== 'undefined' && typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_box_sidebar_open', false);
      }
    } else {
      if (typeof window !== 'undefined' && typeof window.portalMobileOverlays === 'function') {
        window.portalMobileOverlays(sidebar);
      }
      sidebar.classList.remove('collapsed');
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');
      const isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 1024;
      if ((isMobileH5 || isSmallScreen) && backdrop) {
        backdrop.classList.add('active');
      }
      if (bookmarkHandle) {
        bookmarkHandle.classList.add('drawer-open');
        bookmarkHandle.setAttribute('aria-expanded', 'true');
        bookmarkHandle.title = (typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_collapse_sidebar') : undefined) ?? '收合篩選側邊欄';
        bookmarkHandle.style.removeProperty('display');
        bookmarkHandle.style.removeProperty('opacity');
        bookmarkHandle.style.removeProperty('visibility');
        bookmarkHandle.style.removeProperty('pointer-events');
      }
      if (typeof window !== 'undefined' && typeof window.setSidebarSavedState === 'function') {
        window.setSidebarSavedState('pksleep_box_sidebar_open', true);
      }
    }
    if (typeof window !== 'undefined' && typeof window.syncOverlayOpenState === 'function') {
      window.syncOverlayOpenState();
    }
  }

  function renderBoxQuickFilterChips() {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;
    let bar = document.getElementById('box-quick-filter-chips');
    if (!bar) {
      if (typeof document.createElement !== 'function') return;
      const contentArea = document.getElementById('box-content-area');
      const searchRow = (typeof document.querySelector === 'function')
        ? document.querySelector('#panel-box .search-filter-row, #view-box .search-filter-row, .search-filter-row')
        : null;
      bar = document.createElement('div');
      bar.id = 'box-quick-filter-chips';
      bar.className = 'box-quick-filter-bar';
      if (searchRow && searchRow.parentNode && typeof searchRow.parentNode.insertBefore === 'function') {
        searchRow.parentNode.insertBefore(bar, searchRow.nextSibling);
      } else if (contentArea && contentArea.parentNode && typeof contentArea.parentNode.insertBefore === 'function') {
        contentArea.parentNode.insertBefore(bar, contentArea);
      } else {
        return;
      }
    }

    const escapeText = (s) => (s ? String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : '');
    bar.innerHTML = BOX_QUICK_FILTERS.map(qf => {
      let isActive = false;
      if (qf.type === 'shiny') isActive = boxShinyOnly;
      else if (qf.type === 'ribbon') isActive = boxRibbonOnly;
      else if (qf.type === 'subskill') isActive = boxSelectedKeySubskills.has(qf.subskill);

      const label = (typeof window !== 'undefined' ? window.I18N?.field?.(qf, 'label') : undefined) ?? qf.label;
      return `<button type="button" class="box-quick-chip ${isActive ? 'active' : ''}" data-qf-id="${qf.id}">${escapeText(label)}</button>`;
    }).join('');

    if (!bar._hasQuickChipListener) {
      bar._hasQuickChipListener = true;
      if (typeof bar.addEventListener === 'function') {
        bar.addEventListener('click', (e) => {
          const btn = e.target.closest('.box-quick-chip');
          if (!btn) return;
          const qfId = btn.getAttribute('data-qf-id');
          const qf = BOX_QUICK_FILTERS.find(f => f.id === qfId);
          if (!qf) return;

          if (qf.type === 'shiny') {
            boxShinyOnly = !boxShinyOnly;
          } else if (qf.type === 'ribbon') {
            boxRibbonOnly = !boxRibbonOnly;
          } else if (qf.type === 'subskill') {
            if (boxSelectedKeySubskills.has(qf.subskill)) {
              boxSelectedKeySubskills.delete(qf.subskill);
            } else {
              boxSelectedKeySubskills.add(qf.subskill);
            }
          }
          renderBoxQuickFilterChips();
          updateBoxActiveFilterBadge();
          if (typeof renderBox === 'function') renderBox();
        });
      }
    }
  }

  function resetBoxFilters() {
    boxSelectedSpecialties.clear();
    boxSelectedBerries.clear();
    boxSelectedIngredients.clear();
    boxSelectedSkills.clear();
    boxOnlyFinal = false;
    boxOnlyInitialIng = false;
    boxShowNo = false;
    boxShinyOnly = false;
    boxRibbonOnly = false;
    boxSelectedKeySubskills.clear();
    sortBy = 'id-asc';
    if (typeof document !== 'undefined') {
      const sortSelect = document.getElementById('box-sort-select');
      if (sortSelect) sortSelect.value = 'id-asc';
      const finalToggle = document.getElementById('box-final-evo-toggle');
      const initialToggle = document.getElementById('box-initial-ing-toggle');
      const showNoToggle = document.getElementById('box-show-no-toggle');
      if (finalToggle) finalToggle.checked = false;
      if (initialToggle) initialToggle.checked = false;
      if (showNoToggle) showNoToggle.checked = false;
      renderBoxSpecialtyButtons();
      renderBoxBerryButtons();
      renderBoxIngredientButtons();
      renderBoxSkillButtons();
      renderBoxQuickFilterChips();
      updateBoxActiveFilterBadge();
      renderBox();
    }
  }

  function getBoxFilterState() {
    return {
      selectedSpecialties: new Set(boxSelectedSpecialties),
      selectedBerries: new Set(boxSelectedBerries),
      selectedIngredients: new Set(boxSelectedIngredients),
      selectedSkills: new Set(boxSelectedSkills),
      onlyFinal: boxOnlyFinal,
      onlyInitialIng: boxOnlyInitialIng,
      showNo: boxShowNo,
      shinyOnly: boxShinyOnly,
      ribbonOnly: boxRibbonOnly,
      selectedKeySubskills: new Set(boxSelectedKeySubskills)
    };
  }

  function setBoxFilterState(state) {
    if (!state) return;
    if (state.selectedSpecialties) {
      boxSelectedSpecialties.clear();
      state.selectedSpecialties.forEach(s => boxSelectedSpecialties.add(s));
    }
    if (state.selectedBerries) {
      boxSelectedBerries.clear();
      state.selectedBerries.forEach(b => boxSelectedBerries.add(b));
    }
    if (state.selectedIngredients) {
      boxSelectedIngredients.clear();
      state.selectedIngredients.forEach(i => boxSelectedIngredients.add(i));
    }
    if (state.selectedSkills) {
      boxSelectedSkills.clear();
      state.selectedSkills.forEach(k => boxSelectedSkills.add(k));
    }
    if (state.selectedKeySubskills) {
      boxSelectedKeySubskills.clear();
      state.selectedKeySubskills.forEach(k => boxSelectedKeySubskills.add(k));
    }
    if (state.onlyFinal !== undefined) boxOnlyFinal = Boolean(state.onlyFinal);
    if (state.onlyInitialIng !== undefined) boxOnlyInitialIng = Boolean(state.onlyInitialIng);
    if (state.showNo !== undefined) boxShowNo = Boolean(state.showNo);
    if (state.shinyOnly !== undefined) boxShinyOnly = Boolean(state.shinyOnly);
    if (state.ribbonOnly !== undefined) boxRibbonOnly = Boolean(state.ribbonOnly);
    renderBoxQuickFilterChips();
    updateBoxActiveFilterBadge();
  }

  let boxFiltersInitialized = false;
  function initBoxFilters() {
    renderBoxSpecialtyButtons();
    renderBoxBerryButtons();
    renderBoxIngredientButtons();
    renderBoxSkillButtons();
    renderBoxQuickFilterChips();
    updateBoxActiveFilterBadge();

    if (boxFiltersInitialized) return;
    boxFiltersInitialized = true;

    const sidebar = document.getElementById('box-filter-sidebar');
    const bookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
    const closeBtn = document.getElementById('box-sidebar-close-btn');
    const resetAllBtn = document.getElementById('box-sidebar-reset-all-btn');
    const backdrop = document.getElementById('box-sidebar-backdrop');
    const finalEvoToggle = document.getElementById('box-final-evo-toggle');
    const initialIngToggle = document.getElementById('box-initial-ing-toggle');
    const showNoToggle = document.getElementById('box-show-no-toggle');
    const specialtyContainer = document.getElementById('box-specialty-filter-tags');
    const berryContainer = document.getElementById('box-berry-filter-tags');
    const ingredientContainer = document.getElementById('box-ingredient-pkm-filter-tags');
    const skillContainer = document.getElementById('box-skill-filter-tags');
    const clearBerriesBtn = document.getElementById('box-clear-berries-btn');
    const clearIngredientsBtn = document.getElementById('box-clear-ingredients-pkm-btn');
    const clearSkillsBtn = document.getElementById('box-clear-skills-btn');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');

    if (finalEvoToggle) {
      finalEvoToggle.addEventListener('change', (e) => {
        boxOnlyFinal = e.target.checked;
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (initialIngToggle) {
      initialIngToggle.addEventListener('change', (e) => {
        boxOnlyInitialIng = e.target.checked;
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (showNoToggle) {
      showNoToggle.addEventListener('change', (e) => {
        boxShowNo = e.target.checked;
        renderBox();
      });
    }

    if (specialtyContainer) {
      specialtyContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const specialty = btn.getAttribute('data-specialty');
        if (!specialty) return;
        if (boxSelectedSpecialties.has(specialty)) {
          boxSelectedSpecialties.delete(specialty);
        } else {
          boxSelectedSpecialties.add(specialty);
        }
        renderBoxSpecialtyButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (berryContainer) {
      berryContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
        if (!btn) return;
        const berry = btn.getAttribute('data-berry');
        if (!berry) return;
        if (boxSelectedBerries.has(berry)) {
          boxSelectedBerries.delete(berry);
        } else {
          boxSelectedBerries.add(berry);
        }
        renderBoxBerryButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (ingredientContainer) {
      ingredientContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
        if (!btn) return;
        const ing = btn.getAttribute('data-ing');
        if (!ing) return;
        if (boxSelectedIngredients.has(ing)) {
          boxSelectedIngredients.delete(ing);
        } else {
          boxSelectedIngredients.add(ing);
        }
        renderBoxIngredientButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (skillContainer) {
      skillContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.subfilter-skill-btn, .subfilter-tag-btn');
        if (!btn) return;
        const skill = btn.getAttribute('data-skill');
        if (!skill) return;
        if (boxSelectedSkills.has(skill)) {
          boxSelectedSkills.delete(skill);
        } else {
          boxSelectedSkills.add(skill);
        }
        renderBoxSkillButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearBerriesBtn) {
      clearBerriesBtn.addEventListener('click', () => {
        boxSelectedBerries.clear();
        renderBoxBerryButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearIngredientsBtn) {
      clearIngredientsBtn.addEventListener('click', () => {
        boxSelectedIngredients.clear();
        renderBoxIngredientButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (clearSkillsBtn) {
      clearSkillsBtn.addEventListener('click', () => {
        boxSelectedSkills.clear();
        renderBoxSkillButtons();
        updateBoxActiveFilterBadge();
        renderBox();
      });
    }

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', () => {
        resetBoxFilters();
      });
    }

    if (bookmarkHandle && sidebar && !bookmarkHandle._hasListener) {
      bookmarkHandle._hasListener = true;
      if (typeof window !== 'undefined' && typeof window.makeFloatingDraggable === 'function' && isMobileH5) {
        window.makeFloatingDraggable(bookmarkHandle, () => toggleBoxSidebar());
      } else {
        bookmarkHandle.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleBoxSidebar();
        });
      }
    }

    if (closeBtn && sidebar && !closeBtn._hasListener) {
      closeBtn._hasListener = true;
      closeBtn.addEventListener('click', () => {
        toggleBoxSidebar(false);
      });
    }

    if (backdrop && sidebar && !backdrop._hasListener) {
      backdrop._hasListener = true;
      if (typeof window !== 'undefined' && typeof window.bindBackdropDismiss === 'function') {
        window.bindBackdropDismiss(backdrop, () => toggleBoxSidebar(false));
      } else {
        backdrop.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleBoxSidebar(false);
        });
      }
    }

    if (sidebar && typeof window !== 'undefined' && typeof window.bindSidebarSwipeRightToClose === 'function') {
      window.bindSidebarSwipeRightToClose(sidebar, () => toggleBoxSidebar(false));
    }
  }

  if (typeof window !== 'undefined') {
    window.toggleBoxSidebar = toggleBoxSidebar;
    window.resetBoxFilters = resetBoxFilters;
    window.initBoxFilters = initBoxFilters;
    window.renderBoxQuickFilterChips = renderBoxQuickFilterChips;
    window.getBoxFilterState = getBoxFilterState;
    window.setBoxFilterState = setBoxFilterState;
  }

