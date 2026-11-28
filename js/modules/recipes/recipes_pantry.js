  /* ─── 食材庫存 UI ────────────────────────────────────── */
  function initPantryUI() {
    const sidebarScrollable = document.querySelector('#recipe-filter-sidebar .sidebar-scrollable-content');
    if (!sidebarScrollable) return;

    let pantrySection = document.getElementById('recipe-pantry-sidebar-section');
    if (!pantrySection) {
      pantrySection = document.createElement('div');
      pantrySection.id = 'recipe-pantry-sidebar-section';
      pantrySection.className = 'sidebar-section recipe-pantry-section';
      const catSection = sidebarScrollable.querySelector('.sidebar-section');
      if (catSection && catSection.nextSibling) sidebarScrollable.insertBefore(pantrySection, catSection.nextSibling);
      else sidebarScrollable.prepend(pantrySection);
    }

    pantrySection.innerHTML = `
      <div class="sidebar-section-header pantry-section-header">
        <div class="pantry-header-title-row">
          <span class="sidebar-section-title" data-i18n="recipe.pantry_title">${window.I18N?.t?.('recipe.pantry_title') ?? '食材庫存'}</span>
          <span class="pantry-count-badge" id="pantry-total-count-badge">0</span>
        </div>
        <div class="pantry-header-actions">
          <button type="button" id="pantry-clear-all-btn" class="sidebar-section-clear-btn">${window.I18N?.t?.('recipes.ui_pantry_clear_btn') ?? '清空'}</button>
          <button type="button" id="pantry-collapse-toggle-btn" class="pantry-toggle-btn" aria-expanded="true" title="${window.I18N?.t?.('recipes.ui_pantry_toggle') ?? '收合/展開'}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
        </div>
      </div>
      <div id="pantry-content-body" class="pantry-body">
        <div class="pantry-quick-toolbar">
          <button type="button" class="pantry-quick-btn" id="pantry-fill-demo-btn">${window.I18N?.t?.('recipes.ui_pantry_fill_demo') ?? '+10 全食材'}</button>
          <button type="button" class="pantry-quick-btn" id="pantry-reset-zero-btn">${window.I18N?.t?.('recipes.ui_pantry_reset_zero') ?? '全設為 0'}</button>
        </div>
        <div class="pantry-items-grid" id="pantry-items-grid"></div>
      </div>
    `;

    renderPantryItemsGrid();

    const collapseBtn = document.getElementById('pantry-collapse-toggle-btn');
    const body = document.getElementById('pantry-content-body');
    if (collapseBtn && body) {
      collapseBtn.addEventListener('click', () => {
        const isCollapsed = body.classList.toggle('collapsed');
        collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
        collapseBtn.classList.toggle('rotated', isCollapsed);
      });
    }

    const clearBtn = document.getElementById('pantry-clear-all-btn');
    if (clearBtn) clearBtn.addEventListener('click', () => clearPantry());

    const fillDemoBtn = document.getElementById('pantry-fill-demo-btn');
    if (fillDemoBtn) {
      fillDemoBtn.addEventListener('click', () => {
        _getRecipesCanonicalIngredients().forEach(ing => { pantryInventory[ing] = (Number(pantryInventory[ing]) || 0) + 10; });
        savePantry();
        syncPantryUI();
        render();
      });
    }

    const resetZeroBtn = document.getElementById('pantry-reset-zero-btn');
    if (resetZeroBtn) resetZeroBtn.addEventListener('click', () => clearPantry());
  }

  function renderPantryItemsGrid() {
    const grid = document.getElementById('pantry-items-grid');
    if (!grid) return;

    const ingIconMap = {};
    allRecipes.forEach(r => {
      (Array.isArray(r.ingredients) ? r.ingredients : []).forEach(i => {
        if (i && i.name && !ingIconMap[i.name]) ingIconMap[i.name] = _resolveRecipeAssetUrl(i.icon);
      });
    });

    grid.innerHTML = _getRecipesCanonicalIngredients().map(name => {
      const count = Number(pantryInventory[name]) || 0;
      const icon = ingIconMap[name] || '';
      const displayName = window.I18N ? window.I18N.getIngredientName(name) : name;
      return `
        <div class="pantry-item-row" data-ing="${name}">
          <div class="pantry-item-info">
            ${icon ? `<img src="${icon}" class="pantry-item-icon" width="20" height="20" loading="lazy" decoding="async" alt="${displayName}">` : ''}
            <span class="pantry-item-name" title="${displayName}">${displayName}</span>
          </div>
          <div class="pantry-stepper">
            <button type="button" class="pantry-step-btn pantry-btn-minus" data-ing="${name}">-</button>
            <input type="number" class="pantry-stepper-input" data-ing="${name}" min="0" max="999" value="${count}">
            <button type="button" class="pantry-step-btn pantry-btn-plus" data-ing="${name}">+</button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.pantry-stepper-input').forEach(input => {
      input.addEventListener('change', e => {
        setPantryIngredient(e.target.getAttribute('data-ing'), Math.max(0, parseInt(e.target.value, 10) || 0));
      });
    });

    grid.querySelectorAll('.pantry-btn-minus').forEach(btn => {
      btn.addEventListener('click', e => {
        const name = btn.getAttribute('data-ing');
        const step = e.shiftKey ? 5 : 1;
        setPantryIngredient(name, Math.max(0, (Number(pantryInventory[name]) || 0) - step));
      });
    });

    grid.querySelectorAll('.pantry-btn-plus').forEach(btn => {
      btn.addEventListener('click', e => {
        const name = btn.getAttribute('data-ing');
        const step = e.shiftKey ? 5 : 1;
        setPantryIngredient(name, (Number(pantryInventory[name]) || 0) + step);
      });
    });

    syncPantryUI();
  }

  function syncPantryUI() {
    const grid = document.getElementById('pantry-items-grid');
    let totalItems = 0;
    if (grid) {
      grid.querySelectorAll('.pantry-stepper-input').forEach(input => {
        const count = Number(pantryInventory[input.getAttribute('data-ing')]) || 0;
        input.value = count;
        totalItems += count;
      });
    } else {
      totalItems = Object.values(pantryInventory).reduce((acc, c) => acc + (Number(c) || 0), 0);
    }
    const badge = document.getElementById('pantry-total-count-badge');
    if (badge) badge.textContent = totalItems;
  }

  function initQuickFilterPill() {
    const controlsContainer = document.querySelector('.controls-container .search-filter-row');
    if (!controlsContainer || document.getElementById('recipe-cookable-filter-btn')) return;

    const cookableBtn = document.createElement('button');
    cookableBtn.type = 'button';
    cookableBtn.id = 'recipe-cookable-filter-btn';
    cookableBtn.className = `recipe-filter-pill-btn ${filterCookableOnly ? 'active' : ''}`;
    cookableBtn.textContent = window.I18N?.t?.('recipe.filter_cookable') ?? '可立即烹飪 (100%)';
    cookableBtn.setAttribute('data-i18n', 'recipe.filter_cookable');

    cookableBtn.addEventListener('click', () => {
      filterCookableOnly = !filterCookableOnly;
      cookableBtn.classList.toggle('active', filterCookableOnly);
      savePrefs();
      updateRecipeActiveFilterBadge();
      render();
    });

    const sortBox = controlsContainer.querySelector('.sort-box');
    if (sortBox) controlsContainer.insertBefore(cookableBtn, sortBox);
    else controlsContainer.appendChild(cookableBtn);
  }

  /* ─── 填鍋最佳化彈窗 ─────────────────────────────────── */
  let potFillerMode = 'pantry';

  function openPotFillerModal(recipe) {
    if (!recipe || typeof recipe !== 'object') return;
    let modal = document.getElementById('recipe-pot-filler-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'recipe-pot-filler-modal';
      modal.className = 'recipe-modal-overlay';
      document.body.appendChild(modal);
    }
    renderPotFillerModalContent(modal, recipe);
    modal.classList.add('active');
  }

  function renderPotFillerModalContent(modal, recipe) {
    const primaryName = getRecipeName(recipe);
    const catLabel = _getRecipeCategoryLabel(recipe.category);
    const reqPot = Number(recipe.pot_size) || 0;
    const effPot = getEffectivePotCapacity(potCapacity, campTicketActive, sundayExpansionActive);
    const fillerSlots = Math.max(0, effPot - reqPot);
    const fromPantry = potFillerMode === 'pantry';
    const fillerRes = getRecommendedFillers(recipe, effPot, fromPantry, pantryInventory);
    const potentialEnergy = calculateMealEnergyWithFillers(recipe, fillerRes.totalFillerEnergy, recipeLevel, islandBonus, eventBonus);

    modal.innerHTML = `
      <div class="recipe-pot-filler-dialog" role="dialog" aria-modal="true" aria-labelledby="filler-dialog-title">
        <div class="filler-dialog-header">
          <div class="filler-header-title-group">
            <h3 id="filler-dialog-title" class="filler-dialog-title">${window.I18N?.t?.('recipe.pot_capacity_title') ?? '鍋子容量與填鍋最佳化'}</h3>
            <span class="filler-dialog-recipe-sub">${primaryName} (${catLabel} · ${window.I18N?.t?.('recipes.ui_req_pot_slots', { count: reqPot }) ?? `${reqPot}料`})</span>
          </div>
          <button type="button" class="filler-dialog-close-btn" id="filler-dialog-close-btn" aria-label="${window.I18N?.t?.('recipes.ui_close') ?? '關閉'}">&times;</button>
        </div>
        <div class="filler-dialog-body">
          <div class="filler-section-card">
            <div class="filler-section-title">${window.I18N?.t?.('recipes.ui_filler_step1') ?? '1. 鍋子容量配置'}</div>
            <div class="filler-controls-grid">
              <div class="filler-control-item">
                <label class="filler-control-label">${window.I18N?.t?.('recipes.ui_base_pot_size') ?? '基礎鍋子容量'}: <strong id="filler-pot-cap-val">${potCapacity}</strong></label>
                <div class="filler-pot-stepper">
                  <input type="range" id="filler-pot-slider" class="rf-slider pot-slider" min="15" max="200" step="1" value="${potCapacity}">
                </div>
                <div class="filler-presets-row">
                  <button type="button" class="filler-preset-pill ${potCapacity === 35 ? 'active' : ''}" data-val="35">35</button>
                  <button type="button" class="filler-preset-pill ${potCapacity === 57 ? 'active' : ''}" data-val="57">57</button>
                  <button type="button" class="filler-preset-pill ${potCapacity === 69 ? 'active' : ''}" data-val="69">69</button>
                  <button type="button" class="filler-preset-pill ${potCapacity === 77 ? 'active' : ''}" data-val="77">77</button>
                  <button type="button" class="filler-preset-pill ${potCapacity === 100 ? 'active' : ''}" data-val="100">100</button>
                </div>
              </div>
              <div class="filler-switches-item">
                <label class="filler-toggle-label">
                  <input type="checkbox" id="filler-camp-ticket-check" ${campTicketActive ? 'checked' : ''}>
                  <span>${window.I18N?.t?.('recipes.ui_good_camp_ticket') ?? '好露營券 (+50%)'}</span>
                </label>
                <label class="filler-toggle-label">
                  <input type="checkbox" id="filler-sunday-check" ${sundayExpansionActive ? 'checked' : ''}>
                  <span>${window.I18N?.t?.('recipes.ui_sunday_cooking') ?? '週末料理加倍 (×2)'}</span>
                </label>
              </div>
            </div>
            <div class="filler-effective-banner">
              <span>${window.I18N?.t?.('recipes.ui_effective_pot') ?? '有效總容量'}: <strong>${effPot}</strong></span>
              <span class="filler-effective-divider">·</span>
              <span>${window.I18N?.t?.('recipes.ui_base_required') ?? '料理基礎需求'}: <strong>${reqPot}</strong></span>
              <span class="filler-effective-divider">·</span>
              <span>${window.I18N?.t?.('recipes.ui_filler_slots') ?? '剩餘填鍋格數'}: <strong class="filler-highlight-slots">${fillerSlots}</strong></span>
            </div>
          </div>

          <div class="filler-section-card">
            <div class="filler-section-header-row">
              <div class="filler-section-title">${window.I18N?.t?.('recipes.ui_filler_step2') ?? '2. 填鍋加料最佳推薦'}</div>
              <div class="filler-mode-selector">
                <button type="button" class="filler-mode-btn ${potFillerMode === 'pantry' ? 'active' : ''}" id="filler-mode-pantry-btn">${window.I18N?.t?.('recipes.ui_filler_mode_pantry') ?? '依庫存食材'}</button>
                <button type="button" class="filler-mode-btn ${potFillerMode === 'all' ? 'active' : ''}" id="filler-mode-all-btn">${window.I18N?.t?.('recipes.ui_filler_mode_all') ?? '理論最高能量'}</button>
              </div>
            </div>
            <div class="filler-table-wrapper">
              ${fillerSlots === 0 ? `
                <div class="filler-empty-hint">${window.I18N?.t?.('recipes.ui_filler_zero_hint') ?? '有效鍋容量等於料理基礎需求，無需追加多餘食材。'}</div>
              ` : (fillerRes.recommendations.length === 0 ? `
                <div class="filler-empty-hint">${window.I18N?.t?.('recipes.ui_filler_empty_pantry') ?? '目前食材庫存已無剩餘多餘食材可供加料。可切換為「理論最高能量」。'}</div>
              ` : `
                <table class="pokemon-table filler-recommend-table">
                  <thead>
                    <tr>
                      <th style="width:140px;">${window.I18N?.t?.('recipes.ui_filler_th_ing') ?? '推薦食材'}</th>
                      <th style="width:70px;text-align:right;">${window.I18N?.t?.('recipes.ui_filler_th_unit') ?? '單個能量'}</th>
                      <th style="width:80px;text-align:right;">${window.I18N?.t?.('recipes.ui_filler_th_count') ?? '填入數量'}</th>
                      <th style="width:110px;text-align:right;">${window.I18N?.t?.('recipes.ui_filler_th_added') ?? '追加基礎分'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${fillerRes.recommendations.map(r => `
                      <tr>
                        <td><strong>${window.I18N && typeof window.I18N.getIngredientName === 'function' ? window.I18N.getIngredientName(r.name) : (window.I18N?.field?.({ name_tw: r.name, name_en: r.enName }, 'name') ?? r.name)}</strong></td>
                        <td style="text-align:right;">+${r.unitEnergy}</td>
                        <td style="text-align:right;color:var(--text-accent);font-weight:700;">×${r.count}</td>
                        <td style="text-align:right;font-weight:700;">+${r.totalEnergy.toLocaleString()}</td>
                      </tr>
                    `).join('')}
                    ${fillerRes.remainingSlots > 0 ? `
                      <tr class="filler-unfilled-row">
                        <td colspan="2" style="color:var(--text-muted);">${window.I18N?.t?.('recipes.ui_filler_unfilled') ?? '庫存已耗盡之未填格數'}</td>
                        <td style="text-align:right;color:#ef4444;font-weight:700;">×${fillerRes.remainingSlots}</td>
                        <td style="text-align:right;color:var(--text-muted);">+0</td>
                      </tr>
                    ` : ''}
                  </tbody>
                </table>
              `)}
            </div>
          </div>

          <div class="filler-summary-banner">
            <div class="filler-summary-col">
              <span class="filler-summary-label">${window.I18N?.t?.('recipes.ui_filler_total_energy') ?? '最終試算預估總能量'}</span>
              <div class="filler-summary-val-row">
                <span class="filler-summary-value">${potentialEnergy.toLocaleString()}</span>
                <span class="filler-summary-sub">Lv.${recipeLevel} · ×${(1 + islandBonus / 100).toFixed(2)} · ×${Number(eventBonus).toFixed(2)}</span>
              </div>
            </div>
            <div class="filler-summary-actions">
              <button type="button" class="filler-action-btn filler-apply-btn" id="filler-apply-to-expansion-btn">
                ${window.I18N?.t?.('recipes.ui_filler_apply_btn') ?? '一鍵同步至主介面擴鍋滑桿'}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = modal.querySelector('#filler-dialog-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    const potSlider = modal.querySelector('#filler-pot-slider');
    const potVal = modal.querySelector('#filler-pot-cap-val');
    if (potSlider) {
      potSlider.addEventListener('input', () => {
        potCapacity = parseInt(potSlider.value, 10) || 57;
        if (potVal) potVal.textContent = potCapacity;
        savePrefs();
        renderPotFillerModalContent(modal, recipe);
      });
    }

    modal.querySelectorAll('.filler-preset-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.getAttribute('data-val'), 10);
        if (val) {
          potCapacity = val;
          savePrefs();
          renderPotFillerModalContent(modal, recipe);
        }
      });
    });

    const campCheck = modal.querySelector('#filler-camp-ticket-check');
    if (campCheck) {
      campCheck.addEventListener('change', () => {
        campTicketActive = campCheck.checked;
        savePrefs();
        renderPotFillerModalContent(modal, recipe);
      });
    }

    const sundayCheck = modal.querySelector('#filler-sunday-check');
    if (sundayCheck) {
      sundayCheck.addEventListener('change', () => {
        sundayExpansionActive = sundayCheck.checked;
        savePrefs();
        renderPotFillerModalContent(modal, recipe);
      });
    }

    const pantryModeBtn = modal.querySelector('#filler-mode-pantry-btn');
    const allModeBtn = modal.querySelector('#filler-mode-all-btn');
    if (pantryModeBtn) {
      pantryModeBtn.addEventListener('click', () => {
        potFillerMode = 'pantry';
        renderPotFillerModalContent(modal, recipe);
      });
    }
    if (allModeBtn) {
      allModeBtn.addEventListener('click', () => {
        potFillerMode = 'all';
        renderPotFillerModalContent(modal, recipe);
      });
    }

    const applyBtn = modal.querySelector('#filler-apply-to-expansion-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        potExpansion = Math.min(700, Math.max(0, fillerSlots));
        syncPotExpansionUI();
        savePrefs();
        render();
        modal.classList.remove('active');
      });
    }
  }
