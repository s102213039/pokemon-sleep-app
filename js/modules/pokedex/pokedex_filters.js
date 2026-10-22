    function renderTypeButtons() {
      if (!typeFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      typeFilterContainer.innerHTML = types.map(t => {
        const isActive = t === 'ALL' ? selectedTypes.size === 0 : selectedTypes.has(t);
        const label = t === 'ALL' ? (isEN ? 'All Types' : '全部屬性') : (isEN && window.I18N ? window.I18N.getTypeName(t) : t);
        return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-type="${t}">${label}</button>`;
      }).join('');
    }

    function renderSpecialtyButtons() {
      if (!specialtyFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      specialtyFilterContainer.innerHTML = specialties.map(s => {
        const isActive = selectedSpecialties.has(s);
        const label = window.I18N ? window.I18N.getSpecialtyName(s) : s;
        return `<button type="button" class="tag-btn ${isActive ? 'active' : ''}" data-specialty="${s}">${label}</button>`;
      }).join('');
    }

    function renderBerryButtons() {
      if (!berryFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      berryFilterContainer.innerHTML = BERRY_DATA.map(b => {
        const isActive = selectedBerries.has(b.name);
        const berryName = window.I18N ? window.I18N.getBerryName(b.name) : b.name;
        const typeName = isEN && window.I18N ? window.I18N.getTypeName(b.type) : b.type;
        return `
          <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-berry="${b.name}" title="${berryName} (${typeName})" aria-label="${berryName}">
            ${b.icon ? `<img src="${b.icon}" class="subfilter-icon-img" alt="${berryName}" loading="lazy" onerror="this.style.display='none';">` : ''}
          </button>
        `;
      }).join('');

      if (clearBerriesBtn) {
        clearBerriesBtn.style.display = selectedBerries.size > 0 ? 'inline-block' : 'none';
      }
    }

    function renderIngredientButtons() {
      if (!ingredientFilterContainer) return;
      ingredientFilterContainer.innerHTML = uniqueIngredients.map(ing => {
        const isActive = selectedIngredients.has(ing.name);
        const ingName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
        return `
          <button type="button" class="subfilter-icon-btn ${isActive ? 'active' : ''}" data-ing="${ing.name}" title="${ingName}" aria-label="${ingName}">
            ${ing.icon ? `<img src="${ing.icon}" class="subfilter-icon-img" alt="${ingName}" loading="lazy" onerror="this.style.display='none';">` : ''}
          </button>
        `;
      }).join('');

      if (clearIngredientsBtn) {
        clearIngredientsBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
      }
    }

    function renderSkillButtons() {
      if (!skillFilterContainer) return;
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      skillFilterContainer.innerHTML = BASE_SKILLS.map(skillItem => {
        const isActive = selectedSkills.has(skillItem.key);
        const label = isEN ? (skillItem.label_en || (window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label)) : (window.I18N ? window.I18N.getMainSkillName(skillItem.label) : skillItem.label);
        const fullTitle = isEN ? (window.I18N ? window.I18N.getMainSkillName(skillItem.key) : skillItem.label) : skillItem.label;
        return `
          <button type="button" class="subfilter-skill-btn ${isActive ? 'active' : ''}" data-skill="${skillItem.key}" title="${fullTitle}">
            <span class="subfilter-skill-name">${label}</span>
          </button>
        `;
      }).join('');

      if (clearSkillsBtn) {
        clearSkillsBtn.style.display = selectedSkills.size > 0 ? 'inline-block' : 'none';
      }
    }

    function updateSubfilterVisibility() {
      if (subfilterBerryGroup) subfilterBerryGroup.style.display = 'flex';
      if (subfilterIngredientGroup) subfilterIngredientGroup.style.display = 'flex';
      if (subfilterSkillGroup) subfilterSkillGroup.style.display = 'flex';
    }

    function initFilters() {
      // 從資料庫動態收集所有食材與其圖示
      const uniqueIngredientsMap = new Map();
      allPokemons.forEach(p => {
        if (p.ingredients) {
          p.ingredients.forEach(ing => {
            if (ing.name && !uniqueIngredientsMap.has(ing.name)) {
              uniqueIngredientsMap.set(ing.name, ing.icon || '');
            }
          });
        }
      });
      uniqueIngredients = Array.from(uniqueIngredientsMap.entries()).map(([name, icon]) => ({ name, icon }));
      PokemonApp.uniqueIngredients = uniqueIngredients;
      if (typeof window !== 'undefined') window.uniqueIngredients = uniqueIngredients;

      renderTypeButtons();
      renderSpecialtyButtons();
      renderBerryButtons();
      renderIngredientButtons();
      renderSkillButtons();
      updateSubfilterVisibility();

      if (PokemonApp._filtersEventsBound) return;
      PokemonApp._filtersEventsBound = true;

      if (typeFilterContainer) {
        typeFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.tag-btn');
          if (!btn) return;
          const type = btn.getAttribute('data-type');
          if (type === 'ALL') {
            selectedTypes.clear();
          } else {
            if (selectedTypes.has(type)) {
              selectedTypes.delete(type);
            } else {
              selectedTypes.add(type);
            }
          }
          renderTypeButtons();
          renderUI();
        });
      }

      specialtyFilterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        const specialty = btn.getAttribute('data-specialty');
        if (!specialty) return;
        if (selectedSpecialties.has(specialty)) {
          selectedSpecialties.delete(specialty);
        } else {
          selectedSpecialties.add(specialty);
        }
        renderSpecialtyButtons();
        updateSubfilterVisibility();
        renderUI();
      });

      // 樹果細節點擊
      if (berryFilterContainer) {
        berryFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
          if (!btn) return;
          const berry = btn.getAttribute('data-berry');
          if (!berry) return;
          if (selectedBerries.has(berry)) {
            selectedBerries.delete(berry);
          } else {
            selectedBerries.add(berry);
          }
          renderBerryButtons();
          renderUI();
        });
      }

      // 食材細節點擊
      if (ingredientFilterContainer) {
        ingredientFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-icon-btn, .subfilter-tag-btn');
          if (!btn) return;
          const ing = btn.getAttribute('data-ing');
          if (!ing) return;
          if (selectedIngredients.has(ing)) {
            selectedIngredients.delete(ing);
          } else {
            selectedIngredients.add(ing);
          }
          renderIngredientButtons();
          renderUI();
        });
      }

      // 技能細節點擊
      if (skillFilterContainer) {
        skillFilterContainer.addEventListener('click', (e) => {
          const btn = e.target.closest('.subfilter-skill-btn, .subfilter-tag-btn');
          if (!btn) return;
          const skill = btn.getAttribute('data-skill');
          if (!skill) return;
          if (selectedSkills.has(skill)) {
            selectedSkills.delete(skill);
          } else {
            selectedSkills.add(skill);
          }
          renderSkillButtons();
          renderUI();
        });
      }

      // 清空按鈕
      if (clearBerriesBtn) {
        clearBerriesBtn.addEventListener('click', () => {
          selectedBerries.clear();
          renderBerryButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearIngredientsBtn) {
        clearIngredientsBtn.addEventListener('click', () => {
          selectedIngredients.clear();
          renderIngredientButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      if (clearSkillsBtn) {
        clearSkillsBtn.addEventListener('click', () => {
          selectedSkills.clear();
          renderSkillButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      // 側邊欄「全部重設」按鈕
      const sidebarResetAllBtn = document.getElementById('sidebar-reset-all-btn');
      if (sidebarResetAllBtn) {
        sidebarResetAllBtn.addEventListener('click', () => {
          selectedSpecialties.clear();
          selectedBerries.clear();
          selectedIngredients.clear();
          selectedSkills.clear();
          if (showNoToggle) showNoToggle.checked = false;
          showNo = false;
          PokemonApp.showNo = false;
          renderSpecialtyButtons();
          renderBerryButtons();
          renderIngredientButtons();
          renderSkillButtons();
          updateSubfilterVisibility();
          renderUI();
        });
      }

      const pokemonSearchClear = document.getElementById('pokemon-search-clear');
      if (searchInput) {
        const updatePkmClear = () => {
          if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
            window.updateSearchInputHighlight(searchInput, pokemonSearchClear);
          } else if (pokemonSearchClear) {
            pokemonSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
          }
        };

        searchInput.addEventListener('input', (e) => {
          currentSearch = e.target.value.trim().toLowerCase();
          updatePkmClear();
          renderUI();
        });

        if (pokemonSearchClear) {
          pokemonSearchClear.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            updatePkmClear();
            searchInput.focus();
            renderUI();
          });
        }
      }

      if (toggleGridBtn) {
        toggleGridBtn.addEventListener('click', () => {
          viewMode = 'grid';
          toggleGridBtn.classList.add('active');
          if (toggleTableBtn) toggleTableBtn.classList.remove('active');
          renderUI();
        });
      }

      if (toggleTableBtn) {
        toggleTableBtn.addEventListener('click', () => {
          viewMode = 'table';
          toggleTableBtn.classList.add('active');
          if (toggleGridBtn) toggleGridBtn.classList.remove('active');
          renderUI();
        });
      }

      if (finalEvoToggle) {
        finalEvoToggle.addEventListener('change', (e) => {
          onlyFinal = e.target.checked;
          PokemonApp.onlyFinal = onlyFinal;
          renderUI();
        });
      }

      if (initialIngToggle) {
        initialIngToggle.addEventListener('change', (e) => {
          onlyInitialIng = e.target.checked;
          PokemonApp.onlyInitialIng = onlyInitialIng;
          renderUI();
        });
      }

      if (showNoToggle) {
        showNoToggle.addEventListener('change', (e) => {
          showNo = e.target.checked;
          PokemonApp.showNo = showNo;
          renderUI();
        });
      }

      //  左側抽屜式側邊欄展開與收合控制 (Left Sliding Sidebar Controller)
      const sidebar = document.getElementById('pokemon-filter-sidebar');
      const bookmarkHandle = document.getElementById('sidebar-bookmark-handle');
      const closeBtn = document.getElementById('sidebar-close-btn');
      const backdrop = document.getElementById('sidebar-backdrop');
      const bookmarkBadge = document.getElementById('sidebar-bookmark-badge');

      function updateActiveFilterBadge() {
        let count = 0;
        if (selectedSpecialties && selectedSpecialties.size > 0) count += 1;
        if (selectedBerries && selectedBerries.size > 0) count += 1;
        if (selectedIngredients && selectedIngredients.size > 0) count += 1;
        if (selectedSkills && selectedSkills.size > 0) count += 1;
        if (onlyInitialIng) count += 1;
        
        if (bookmarkBadge) {
          if (count > 0) {
            bookmarkBadge.textContent = count;
            bookmarkBadge.style.display = 'inline-flex';
          } else {
            bookmarkBadge.style.display = 'none';
          }
        }
      }

      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

      function toggleSidebar(forceState) {
        if (!sidebar) return;
        const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
        const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

        if (shouldCollapse) {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
          if (bookmarkHandle) {
            bookmarkHandle.classList.remove('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'false');
            bookmarkHandle.title = '展開篩選側邊欄';
            bookmarkHandle.style.opacity = '1';
            bookmarkHandle.style.pointerEvents = 'auto';
            bookmarkHandle.style.display = 'flex';
            bookmarkHandle.style.visibility = 'visible';
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', false);
        } else {
          if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
          sidebar.classList.remove('collapsed');
          if (window.innerWidth <= 1024 && backdrop) {
            backdrop.classList.add('active');
          }
          if (bookmarkHandle) {
            bookmarkHandle.classList.add('drawer-open');
            bookmarkHandle.setAttribute('aria-expanded', 'true');
            bookmarkHandle.title = '收合篩選側邊欄';
            bookmarkHandle.style.opacity = '0';
            bookmarkHandle.style.pointerEvents = 'none';
            bookmarkHandle.style.display = 'none';
            bookmarkHandle.style.visibility = 'hidden';
          }
          setSidebarSavedState('pksleep_dex_sidebar_open', true);
        }
        if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      }
      window.toggleSidebar = toggleSidebar;
      PokemonApp.toggleSidebar = toggleSidebar;

      // 依暫存狀態初始化側邊欄展開/收合
      const initialDexOpen = getSidebarSavedState('pksleep_dex_sidebar_open', true);
      if (sidebar) {
        if (initialDexOpen) {
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
          if (window.innerWidth <= 1024 && backdrop) backdrop.classList.add('active');
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

      if (bookmarkHandle) {
        if (typeof makeFloatingDraggable === 'function' && isMobileH5) {
          makeFloatingDraggable(bookmarkHandle, () => toggleSidebar());
        } else {
          bookmarkHandle.addEventListener('click', () => toggleSidebar());
        }
      }
      if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleSidebar(false));
      }

      // 遮罩層專屬事件消費器 (Backdrop Event Consumer - 徹底阻斷穿透至底層元件)
      function bindBackdropDismiss(backdropEl, closeFn) {
        if (!backdropEl || backdropEl._hasDismissBound) return;
        backdropEl._hasDismissBound = true;

        backdropEl.addEventListener('touchstart', (e) => {
          e.stopPropagation();
        }, { passive: false });

        backdropEl.addEventListener('touchend', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeFn();
        }, { passive: false });

        backdropEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeFn();
        });
      }
      window.bindBackdropDismiss = bindBackdropDismiss;

      if (backdrop) {
        bindBackdropDismiss(backdrop, () => toggleSidebar(false));
      }

      // 手勢右滑收合控制 (Swipe Right to Close Sidebar Helper - 支援全組件區域右滑且不干擾點選與滑桿)
      function bindSidebarSwipeRightToClose(sidebarEl, closeFn) {
        if (!sidebarEl || sidebarEl._hasSwipeRightListener) return;
        sidebarEl._hasSwipeRightListener = true;

        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isIgnored = false;

        sidebarEl.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          const touch = e.touches[0];
          startX = touch.clientX;
          startY = touch.clientY;
          startTime = Date.now();
          isIgnored = false;

          const target = e.target;
          // 僅排除水平滑桿本體操作（防止拖動數值滑桿時誤觸收合）
          if (target && target.tagName === 'INPUT' && (target.type === 'range' || target.classList.contains('rf-slider'))) {
            isIgnored = true;
            return;
          }

          // 若觸控點在右側邊緣滾動條區域（距右邊框 24px 內），視為滾動條操作，不觸發收合
          const sidebarRect = sidebarEl.getBoundingClientRect();
          if (touch.clientX > sidebarRect.right - 24) {
            isIgnored = true;
            return;
          }
        }, { passive: true });

        sidebarEl.addEventListener('touchmove', (e) => {
          if (isIgnored || !e.touches || !e.touches[0]) return;
          const currentX = e.touches[0].clientX;
          const currentY = e.touches[0].clientY;
          const deltaX = currentX - startX;
          const deltaY = currentY - startY;

          // 若主要為縱向上下滑動瀏覽列表（縱向位移大於橫向且 > 8px），立即忽略本輪收合手勢，保證正常縱向滾動流暢
          if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
            isIgnored = true;
          }
        }, { passive: true });

        sidebarEl.addEventListener('touchend', (e) => {
          if (isIgnored || !e.changedTouches || !e.changedTouches[0]) return;
          const endX = e.changedTouches[0].clientX;
          const endY = e.changedTouches[0].clientY;
          const diffX = endX - startX;
          const diffY = endY - startY;
          const elapsed = Date.now() - startTime;

          // 判定向右橫向滑動收合（位移 >= 45px、橫向位移大於縱向位移的 1.2 倍、時間 < 800ms）
          if (diffX >= 45 && diffX > Math.abs(diffY) * 1.2 && elapsed < 800) {
            if (!sidebarEl.classList.contains('collapsed')) {
              closeFn();
            }
          }
        }, { passive: true });
      }
      window.bindSidebarSwipeRightToClose = bindSidebarSwipeRightToClose;

      if (sidebar) {
        bindSidebarSwipeRightToClose(sidebar, () => toggleSidebar(false));
      }

      // 全域防護：點擊遮罩層 (sidebar-backdrop) 時優雅收合側邊欄並消費事件
      document.addEventListener('touchend', (e) => {
        const target = e.target;
        if (target && target.classList && target.classList.contains('sidebar-backdrop')) {
          e.preventDefault();
          e.stopPropagation();
          if (typeof window.toggleRecipeSidebar === 'function') {
            window.toggleRecipeSidebar(false);
          }
          if (typeof window.closeLadderSidebar === 'function') {
            window.closeLadderSidebar();
          }
          if (typeof window.toggleSidebar === 'function') {
            window.toggleSidebar(false);
          }
          if (typeof window.toggleBoxSidebar === 'function') {
            window.toggleBoxSidebar(false);
          }
          document.querySelectorAll('.pokemon-filter-sidebar, .recipe-filter-sidebar, .box-filter-sidebar, .ladder-fixed-sidebar').forEach(sb => {
            sb.classList.add('collapsed');
          });
          document.querySelectorAll('.sidebar-backdrop').forEach(bd => bd.classList.remove('active'));
          const curMainTab = (typeof window !== 'undefined' && window.location && window.location.hash)
            ? window.location.hash.replace(/^#/, '').split(/[/_?]/)[0]
            : (typeof localStorage !== 'undefined' ? localStorage.getItem('pksleep_active_main_tab') || 'pokemon' : 'pokemon');
          const isPoke = curMainTab === 'pokemon' || curMainTab === '';
          const isRecipe = curMainTab === 'recipes';
          const isWiki = curMainTab === 'wiki';
          const isBox = curMainTab === 'box';

          const f1 = document.getElementById('sidebar-bookmark-handle');
          const f2 = document.getElementById('recipe-sidebar-bookmark-handle');
          const f3 = document.getElementById('ladder-sidebar-bookmark-handle');
          const f4 = document.getElementById('box-sidebar-bookmark-handle');

          if (f1) {
            f1.style.opacity = isPoke ? '1' : '0';
            f1.style.pointerEvents = isPoke ? 'auto' : 'none';
            f1.style.display = isPoke ? 'flex' : 'none';
            f1.style.visibility = isPoke ? 'visible' : 'hidden';
          }
          if (f2) {
            f2.style.opacity = isRecipe ? '1' : '0';
            f2.style.pointerEvents = isRecipe ? 'auto' : 'none';
            f2.style.display = isRecipe ? 'flex' : 'none';
            f2.style.visibility = isRecipe ? 'visible' : 'hidden';
          }
          if (f3) {
            const rawHash = (typeof window !== 'undefined' && window.location && window.location.hash) || '';
            const isIngSubtab = rawHash.includes('/ingredients') || (typeof localStorage !== 'undefined' && localStorage.getItem('pksleep_active_wiki_subtab') === 'ingredients');
            const showF3 = isWiki && isIngSubtab;
            f3.style.opacity = showF3 ? '1' : '0';
            f3.style.pointerEvents = showF3 ? 'auto' : 'none';
            f3.style.display = showF3 ? 'flex' : 'none';
            f3.style.visibility = showF3 ? 'visible' : 'hidden';
          }
          if (f4) {
            const rawHash = (typeof window !== 'undefined' && window.location && window.location.hash) || '';
            const isLabSubtab = rawHash.includes('/lab') || (typeof localStorage !== 'undefined' && localStorage.getItem('pksleep_active_box_subtab') === 'lab');
            const showF4 = isBox && !isLabSubtab;
            f4.style.opacity = showF4 ? '1' : '0';
            f4.style.pointerEvents = showF4 ? 'auto' : 'none';
            f4.style.display = showF4 ? 'flex' : 'none';
            f4.style.visibility = showF4 ? 'visible' : 'hidden';
          }
        }
      }, { passive: false });

      window.updateActiveFilterBadge = updateActiveFilterBadge;
    }

