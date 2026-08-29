/**
 * recipes.js — Pokémon Sleep 料理食譜大全
 * 功能：篩選、排序、等級滑桿、島嶼加成、活動加成、漂亮成功分數、localStorage 記憶
 */
(function () {
  'use strict';

  function initRecipesModule() {

  /* ─── 狀態變數 ──────────────────────────────────────── */
  let allRecipes          = [];
  let selectedCategory    = 'ALL';
  let selectedIngredients = new Set();   // 包含食材篩選
  let excludedIngredients = new Set();   // 排除食材篩選
  let matchMode           = 'any';
  let currentSearch       = '';
  let sortOption          = 'energy-desc';
  let viewMode            = 'table';
  let minBonus            = 0;
  let minPot              = 0;
  let recipeLevel         = 1;       // 1-70
  let islandBonus         = 0;       // 0-85 (%)
  let eventBonus          = 1.0;     // 1.00 - 2.50 (step 0.25)
  let showTasty           = false;   // 漂亮成功 (2x / 3x) 開關

  /* ─── 食譜等級加成倉率表（Lv.1-70）
     資料來源：ポケモンスリープ攻略・検証 Wiki (wikiwiki.jp/poke_sleep)
     Ver.3.6.0 更新：等級上限 70、最大加成 258% (×3.58)
     注：此加成為「等級加成」，不包含食材數量加成（bonus_pct）
  */
  const LEVEL_BONUS_TABLE = {
     1:   0,  2:   2,  3:   4,  4:   6,  5:   8,  6:   9,  7:  11,  8:  13,
     9:  16, 10:  18, 11:  19, 12:  21, 13:  23, 14:  24, 15:  26, 16:  28,
    17:  30, 18:  31, 19:  33, 20:  35, 21:  37, 22:  40, 23:  42, 24:  45,
    25:  47, 26:  50, 27:  52, 28:  55, 29:  58, 30:  61, 31:  64, 32:  67,
    33:  70, 34:  74, 35:  77, 36:  81, 37:  84, 38:  88, 39:  92, 40:  96,
    41: 100, 42: 104, 43: 108, 44: 113, 45: 117, 46: 122, 47: 127, 48: 132,
    49: 137, 50: 142, 51: 148, 52: 153, 53: 159, 54: 165, 55: 171, 56: 177,
    57: 183, 58: 190, 59: 197, 60: 203, 61: 209, 62: 215, 63: 221, 64: 227,
    65: 234, 66: 239, 67: 243, 68: 248, 69: 252, 70: 258
  };

  /* 取得指定等級的加成偉率 (百分比) */
  function getLevelBonus(lv) {
    return LEVEL_BONUS_TABLE[Math.min(Math.max(lv, 1), 70)] || 0;
  }

  /* ─── LocalStorage 鍵值 ─────────────────────────────── */
  const LS_KEY = 'pksleep_recipe_prefs_v3';

  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      selectedCategory = saved.selectedCategory || 'ALL';
      minBonus         = Number(saved.minBonus) || 0;
      minPot           = Number(saved.minPot)   || 0;
      recipeLevel      = Number(saved.recipeLevel) || 1;
      islandBonus      = Number(saved.islandBonus) || 0;
      eventBonus       = saved.eventBonus !== undefined ? Number(saved.eventBonus) : 1.0;
      showTasty        = Boolean(saved.showTasty);
      sortOption       = saved.sortOption || 'energy-desc';
      viewMode         = saved.viewMode || 'table';
      matchMode        = saved.matchMode || 'any';
      const savedIngs  = saved.selectedIngredients || [];
      selectedIngredients = new Set(savedIngs);
      const savedExcl  = saved.excludedIngredients || [];
      excludedIngredients = new Set(savedExcl);
    } catch (e) {}
  }

  function savePrefs() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        selectedCategory,
        minBonus,
        minPot,
        recipeLevel,
        islandBonus,
        eventBonus,
        showTasty,
        sortOption,
        viewMode,
        matchMode,
        selectedIngredients: [...selectedIngredients],
        excludedIngredients:  [...excludedIngredients],
      }));
    } catch (e) {}
  }

  /* ─── DOM 元素 ──────────────────────────────────────── */
  const searchInput          = document.getElementById('recipe-search-input');
  const sortSelect           = document.getElementById('recipe-sort-select');
  const categoryContainer    = document.getElementById('category-filter-tags');
  const ingredientPickerContainer = document.getElementById('ingredient-picker-tags');
  const clearIngredientsBtn  = document.getElementById('clear-ingredients-btn');
  const countBadge           = document.getElementById('recipe-count-badge');
  const contentArea          = document.getElementById('recipe-content-area');
  const toggleGridBtn        = document.getElementById('recipe-toggle-grid') || document.getElementById('toggle-grid');
  const toggleTableBtn       = document.getElementById('recipe-toggle-table') || document.getElementById('toggle-table');
  const bonusSelect          = document.getElementById('bonus-filter-select');
  const potSelect            = document.getElementById('pot-filter-select');
  const levelSlider          = document.getElementById('recipe-level-slider');
  const levelBadge           = document.getElementById('level-badge');
  const islandSlider         = document.getElementById('island-bonus-slider');
  const islandBadge          = document.getElementById('island-bonus-badge');
  const eventSlider          = document.getElementById('event-bonus-slider');
  const eventBadge           = document.getElementById('event-bonus-badge');
  const tastyToggleBtn       = document.getElementById('tasty-toggle-btn');

  /* ─── 滑桿顏色 fill 更新 ────────────────────────────── */
  function updateSliderFill(slider, min, max) {
    if (!slider) return;
    const pct = ((slider.value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-fill', pct + '%');
  }

  /* ─── 初始化滑桿與開關顯示 ─────────────────────────────── */
  function syncLevelUI() {
    if (!levelSlider || !levelBadge) return;
    levelSlider.value = recipeLevel;
    const bonusPct = getLevelBonus(recipeLevel);
    levelBadge.textContent = `Lv.${recipeLevel}  +${bonusPct}%`;
    updateSliderFill(levelSlider, 1, 70);
  }

  function syncIslandUI() {
    if (!islandSlider || !islandBadge) return;
    islandSlider.value = islandBonus;
    const mult = (1 + islandBonus / 100).toFixed(2);
    islandBadge.textContent = `+${islandBonus}% (×${mult})`;
    updateSliderFill(islandSlider, 0, 85);
  }

  function syncEventUI() {
    if (!eventSlider || !eventBadge) return;
    eventSlider.value = eventBonus;
    eventBadge.textContent = `×${Number(eventBonus).toFixed(2)}`;
    updateSliderFill(eventSlider, 1.0, 2.5);
  }

  function syncTastyUI() {
    if (!tastyToggleBtn) return;
    if (tastyToggleBtn.type === 'checkbox') {
      tastyToggleBtn.checked = showTasty;
    } else {
      if (showTasty) {
        tastyToggleBtn.classList.add('active');
        tastyToggleBtn.setAttribute('aria-checked', 'true');
      } else {
        tastyToggleBtn.classList.remove('active');
        tastyToggleBtn.setAttribute('aria-checked', 'false');
      }
    }
  }

  /* ─── 載入 recipes.json ─────────────────────────────── */
  loadPrefs();

  const fetchRecipesWithFallback = async (...customUrls) => {
    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const t = Date.now();
    const defaultCandidates = [
      `${base}data/recipes.json?t=${t}`,
      `data/recipes.json?t=${t}`,
      `../data/recipes.json?t=${t}`,
      `${base}recipes.json?t=${t}`,
      `recipes.json?t=${t}`,
      `../recipes.json?t=${t}`
    ];
    const urls = customUrls.length > 0 ? customUrls : defaultCandidates;
    const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));

    let lastErr = null;
    for (const url of uniqueUrls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res && res.ok) {
          return await res.json();
        }
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error('Failed to load recipes.json from candidate paths: ' + uniqueUrls.join(', '));
  };

  fetchRecipesWithFallback(
    (typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '') + `data/recipes.json?t=${Date.now()}`,
    `data/recipes.json?t=${Date.now()}`,
    `../data/recipes.json?t=${Date.now()}`,
    `recipes.json?t=${Date.now()}`
  )
    .then(data => {
      allRecipes = data;
      initCategoryFilters();
      initSelectFilters();
      initSliders();
      initTastyToggle();
      initIngredientPicker();
      initViewToggle();
      initSort();
      initSearch();
      initRecipeSidebarEvents();
      render();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('recipe-content-area', '料理食譜資料庫載入失敗 (recipes.json)', err);
      } else if (contentArea) {
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">載入 recipes.json 失敗：${err.message}</div>`;
      }
    });

  /* ─── 料理種類 Filter ────────────────────────────────── */
  function initCategoryFilters() {
    if (!categoryContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catEmoji   = { ALL:'', '咖哩':'🍛', '沙拉':'🥗', '甜點':'🍰' };
    const catLabels  = {
      ALL: isEN ? 'All' : '全部',
      '咖哩': isEN ? 'Curries' : '咖哩',
      '沙拉': isEN ? 'Salads' : '沙拉',
      '甜點': isEN ? 'Desserts' : '甜點'
    };
    const catCounts  = {};
    categories.slice(1).forEach(cat => {
      catCounts[cat] = allRecipes.filter(r => r.category === cat).length;
    });

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : (catCounts[cat] || 0);
      const active = cat === selectedCategory ? 'active' : '';
      const prefix = catEmoji[cat] ? `${catEmoji[cat]} ` : '';
      return `<button class="tag-btn ${active}" data-cat="${cat}">
        ${prefix}${catLabels[cat] || cat} (${count})
      </button>`;
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

  /* ─── 自訂下拉選單系統（嚴格向下展開對齊） ────────── */
  function setupCustomSelect(selectElement) {
    if (!selectElement || selectElement._customized || !selectElement.parentNode) return;
    selectElement._customized = true;

    selectElement.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-container';
    if (selectElement.classList.contains('sort-select')) {
      container.classList.add('custom-select-sort');
    } else {
      container.classList.add('custom-select-rf');
    }

    const triggerBtn = document.createElement('button');
    triggerBtn.type = 'button';
    triggerBtn.className = 'custom-select-trigger';
    triggerBtn.setAttribute('aria-haspopup', 'listbox');
    triggerBtn.setAttribute('aria-expanded', 'false');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'custom-select-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'custom-select-arrow';
    arrowSpan.innerHTML = `<svg viewBox="0 0 12 8" width="12" height="8"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;

    triggerBtn.appendChild(labelSpan);
    triggerBtn.appendChild(arrowSpan);

    const menuDiv = document.createElement('div');
    menuDiv.className = 'custom-select-menu';
    menuDiv.setAttribute('role', 'listbox');

    function syncUI() {
      const options = selectElement.options ? Array.from(selectElement.options) : [];
      const selected = (selectElement.selectedIndex >= 0 && options[selectElement.selectedIndex]) || options[0] || null;
      labelSpan.textContent = selected ? selected.text : '';

      menuDiv.innerHTML = '';
      options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'custom-select-item';
        if (opt.value === selectElement.value) {
          item.classList.add('active');
        }
        item.setAttribute('role', 'option');
        item.setAttribute('data-value', opt.value);
        item.innerHTML = `
          <span class="custom-select-item-text">${opt.text}</span>
          ${opt.value === selectElement.value ? '<span class="custom-select-check">✓</span>' : ''}
        `;

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectElement.value = opt.value;
          container.classList.remove('open');
          triggerBtn.setAttribute('aria-expanded', 'false');
          syncUI();
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        });

        menuDiv.appendChild(item);
      });
    }

    syncUI();

    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        const btn = c.querySelector('.custom-select-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        container.classList.add('open');
        triggerBtn.setAttribute('aria-expanded', 'true');
      }
    });

    selectElement.addEventListener('sync-ui', syncUI);

    container.appendChild(triggerBtn);
    container.appendChild(menuDiv);
    if (selectElement.parentNode) {
      selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
    }
  }

  window.setupCustomSelect = setupCustomSelect;

  // 全域點擊外部關閉所有下拉選單
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-container.open').forEach(c => {
      c.classList.remove('open');
      const btn = c.querySelector('.custom-select-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  // ESC 鍵關閉所有下拉選單
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        const btn = c.querySelector('.custom-select-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  /* ─── Dropdown 選擇器 ───────────────────────────────── */
  function initSelectFilters() {
    if (bonusSelect) {
      bonusSelect.value = minBonus;
      setupCustomSelect(bonusSelect);
      bonusSelect.addEventListener('change', () => {
        minBonus = Number(bonusSelect.value);
        savePrefs();
        render();
      });
    }

    if (potSelect) {
      potSelect.value = minPot;
      setupCustomSelect(potSelect);
      potSelect.addEventListener('change', () => {
        minPot = Number(potSelect.value);
        savePrefs();
        render();
      });
    }
  }

  /* ─── 滑桿控制 ───────────────────────────────────────── */
  function initSliders() {
    if (!levelSlider || !islandSlider || !eventSlider) return;

    syncLevelUI();
    levelSlider.addEventListener('input', () => {
      recipeLevel = parseInt(levelSlider.value, 10);
      syncLevelUI();
      savePrefs();
      render();
    });

    syncIslandUI();
    islandSlider.addEventListener('input', () => {
      islandBonus = parseInt(islandSlider.value, 10);
      syncIslandUI();
      savePrefs();
      render();
    });

    syncEventUI();
    eventSlider.addEventListener('input', () => {
      eventBonus = parseFloat(eventSlider.value);
      syncEventUI();
      savePrefs();
      render();
    });
  }

  /* ─── 漂亮成功開關 ───────────────────────────────────── */
  function initTastyToggle() {
    if (!tastyToggleBtn) return;
    syncTastyUI();
    const evt = tastyToggleBtn.type === 'checkbox' ? 'change' : 'click';
    tastyToggleBtn.addEventListener(evt, () => {
      showTasty = tastyToggleBtn.type === 'checkbox' ? tastyToggleBtn.checked : !showTasty;
      syncTastyUI();
      savePrefs();
      render();
    });
  }

  /* ─── 食材選擇器 ─────────────────────────────────────── */
  function initIngredientPicker() {
    if (!ingredientPickerContainer) return;
    const ingMap = new Map();
    allRecipes.forEach(r => {
      r.ingredients.forEach(ing => {
        if (!ingMap.has(ing.name)) ingMap.set(ing.name, ing.icon || '');
      });
    });

    const ingNames = Array.from(ingMap.keys()).sort();

    ingredientPickerContainer.innerHTML = ingNames.map(name => {
      const icon   = ingMap.get(name);
      const active = selectedIngredients.has(name) ? 'active' : '';
      const ingTitle = window.I18N ? window.I18N.getIngredientName(name) : name;
      return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${ingTitle}">
        ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${ingTitle}">` : ''}
      </button>`;
    }).join('');

    if (!ingredientPickerContainer._hasListener) {
      ingredientPickerContainer._hasListener = true;
      ingredientPickerContainer.addEventListener('click', e => {
        const btn = e.target.closest('.ing-picker-btn');
        if (btn) {
          const name = btn.getAttribute('data-name');
          if (excludedIngredients.has(name)) {
            excludedIngredients.delete(name);
            const exBtn = excludedPickerContainer && excludedPickerContainer.querySelector(`[data-name="${CSS.escape(name)}"]`);
            if (exBtn) exBtn.classList.remove('active-exclude');
          }
          if (selectedIngredients.has(name)) {
            selectedIngredients.delete(name);
            btn.classList.remove('active');
          } else {
            selectedIngredients.add(name);
            btn.classList.add('active');
          }
          savePrefs();
          render();
        }
      });
    }

    const excludedPickerContainer = document.getElementById('excluded-ingredient-picker-tags');
    if (excludedPickerContainer) {
      excludedPickerContainer.innerHTML = ingNames.map(name => {
        const icon   = ingMap.get(name);
        const active = excludedIngredients.has(name) ? 'active-exclude' : '';
        const ingTitle = window.I18N ? window.I18N.getIngredientName(name) : name;
        return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${ingTitle}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${ingTitle}">` : ''}
        </button>`;
      }).join('');

      if (!excludedPickerContainer._hasListener) {
        excludedPickerContainer._hasListener = true;
        excludedPickerContainer.addEventListener('click', e => {
          const btn = e.target.closest('.ing-picker-btn');
          if (btn) {
            const name = btn.getAttribute('data-name');
            if (selectedIngredients.has(name)) {
              selectedIngredients.delete(name);
              const incBtn = ingredientPickerContainer.querySelector(`[data-name="${CSS.escape(name)}"]`);
              if (incBtn) incBtn.classList.remove('active');
            }
            if (excludedIngredients.has(name)) {
              excludedIngredients.delete(name);
              btn.classList.remove('active-exclude');
            } else {
              excludedIngredients.add(name);
              btn.classList.add('active-exclude');
            }
            savePrefs();
            render();
          }
        });
      }
    }

    if (clearIngredientsBtn) {
      clearIngredientsBtn.addEventListener('click', () => {
        selectedIngredients.clear();
        excludedIngredients.clear();
        ingredientPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active'));
        if (excludedPickerContainer) {
          excludedPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        }
        savePrefs();
        render();
      });
    }

    const clearExcludedBtn = document.getElementById('clear-excluded-btn');
    if (clearExcludedBtn) {
      clearExcludedBtn.addEventListener('click', () => {
        excludedIngredients.clear();
        if (excludedPickerContainer) {
          excludedPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        }
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

  /* ─── 視圖切換 ──────────────────────────────────────── */
  function initViewToggle() {
    if (!toggleGridBtn || !toggleTableBtn) return;
    if (viewMode === 'grid') {
      toggleGridBtn.classList.add('active');
      toggleTableBtn.classList.remove('active');
    } else {
      toggleTableBtn.classList.add('active');
      toggleGridBtn.classList.remove('active');
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

  /* ─── 排序 ──────────────────────────────────────────── */
  function initSort() {
    if (!sortSelect) return;
    sortSelect.value = sortOption;
    setupCustomSelect(sortSelect);
    sortSelect.addEventListener('change', () => {
      sortOption = sortSelect.value;
      savePrefs();
      render();
    });
  }

  /* ─── 搜尋與一鍵清空 ─────────────────────────────────── */
  const recipeSearchClear = document.getElementById('recipe-search-clear');

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
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value.trim().toLowerCase();
      updateRecipeClearBtn();
      render();
    });

    if (recipeSearchClear) {
      recipeSearchClear.addEventListener('click', () => {
        searchInput.value = '';
        currentSearch = '';
        updateRecipeClearBtn();
        searchInput.focus();
        render();
      });
    }
  }

  /* ─── 能量計算 ──────────────────────────────────────── */
  function calcEnergy(base, level, islandBonusPct, eventBonusMult = 1.0) {
    const lvMultiplier     = 1 + (getLevelBonus(level) / 100);
    const islandMultiplier = 1 + (islandBonusPct / 100);
    return Math.round(base * lvMultiplier * islandMultiplier * eventBonusMult);
  }

  /* ─── 篩選 + 排序 ───────────────────────────────────── */
  function getFilteredRecipes() {
    return allRecipes
      .filter(recipe => {
        if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;
        if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;
        if (minPot   > 0 && (recipe.pot_size   || 0) < minPot)  return false;
        if (currentSearch) {
          const nameCN   = (recipe.name_cn || '').toLowerCase();
          const nameEN   = (recipe.name_en || '').toLowerCase();
          const ingMatch = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(currentSearch));
          if (!nameCN.includes(currentSearch) && !nameEN.includes(currentSearch) && !ingMatch) return false;
        }
        if (selectedIngredients.size > 0) {
          const recipeIngNames = recipe.ingredients.map(i => i.name);
          if (matchMode === 'all') {
            if (![...selectedIngredients].every(name => recipeIngNames.includes(name))) return false;
          } else {
            if (!recipeIngNames.some(name => selectedIngredients.has(name))) return false;
          }
        }
        if (excludedIngredients.size > 0) {
          const recipeIngNames = recipe.ingredients.map(i => i.name);
          if (recipeIngNames.some(name => excludedIngredients.has(name))) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const eA = calcEnergy(a.base_energy, recipeLevel, islandBonus, eventBonus);
        const eB = calcEnergy(b.base_energy, recipeLevel, islandBonus, eventBonus);
        if (sortOption === 'energy-desc')  return eB - eA;
        if (sortOption === 'energy-asc')   return eA - eB;
        if (sortOption === 'pot-asc')      return a.pot_size - b.pot_size;
        if (sortOption === 'pot-desc')     return b.pot_size - a.pot_size;
        if (sortOption === 'bonus-desc')   return (b.bonus_pct || 0) - (a.bonus_pct || 0);
        if (sortOption === 'name-asc')     return a.name_cn.localeCompare(b.name_cn, 'zh-TW');
        return 0;
      });
  }

  /* ─── Badge 輔助 ────────────────────────────────────── */
  function getBonusEmoji(pct) {
    if (pct >= 78) return '🏆';
    if (pct >= 61) return '🔥';
    if (pct >= 48) return '⭐';
    if (pct >= 35) return '✨';
    if (pct >= 25) return '💧';
    if (pct >= 21) return '💫';
    return '•';
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
      ${ingredients.map(i => `
        <div class="recipe-ing-chip" title="${i.name} × ${i.count}">
          ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" alt="${i.name}" loading="lazy">` : ''}
          <span class="recipe-ing-count">×${i.count}</span>
        </div>
      `).join('')}
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

    function toggleRecipeSidebar() {
      if (!sidebar) return;
      sidebar.classList.toggle('collapsed');
      if (backdrop) {
        if (!sidebar.classList.contains('collapsed')) {
          backdrop.classList.add('active');
        } else {
          backdrop.classList.remove('active');
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
        sidebar.classList.add('collapsed');
        if (backdrop) backdrop.classList.remove('active');
      });
    }

    if (backdrop && sidebar && !backdrop._hasListener) {
      backdrop._hasListener = true;
      backdrop.addEventListener('click', () => {
        sidebar.classList.add('collapsed');
        backdrop.classList.remove('active');
      });
    }

    if (sidebar) {
      if (typeof window.bindSidebarSwipeRightToClose === 'function') {
        window.bindSidebarSwipeRightToClose(sidebar, () => {
          sidebar.classList.add('collapsed');
          if (backdrop) backdrop.classList.remove('active');
        });
      } else {
        let startX = 0, startY = 0, startTime = 0;
        sidebar.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          startX = e.touches[0].clientX;
          startY = e.touches[0].clientY;
          startTime = Date.now();
        }, { passive: true });
        sidebar.addEventListener('touchend', (e) => {
          if (!e.changedTouches || !e.changedTouches[0]) return;
          const diffX = e.changedTouches[0].clientX - startX;
          const diffY = e.changedTouches[0].clientY - startY;
          const elapsed = Date.now() - startTime;
          if (diffX > 35 && (diffX > Math.abs(diffY) * 1.05 || (elapsed < 350 && diffX > 25))) {
            if (!sidebar.classList.contains('collapsed')) {
              sidebar.classList.add('collapsed');
              if (backdrop) backdrop.classList.remove('active');
            }
          }
        }, { passive: true });
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
    initCategoryFilters();
    updateRecipeActiveFilterBadge();
    const filtered = getFilteredRecipes();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const catCounts = {};
    filtered.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const breakdownHTML = Object.entries(catCounts).map(([cat, c]) => `${catLabels[cat] || cat} <strong>${c}</strong>`).join(' · ');

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    const lvBonus = getLevelBonus(recipeLevel);
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventMult = Number(eventBonus).toFixed(2);

    let formulaParts = [];
    formulaParts.push(`Lv.${recipeLevel}${lvBonus > 0 ? ` (+${lvBonus}%)` : ''}`);
    if (islandBonus > 0) formulaParts.push(`🏝️+${islandBonus}% (×${islandMult})`);
    if (eventBonus > 1.0) formulaParts.push(`🎉×${eventMult}`);

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
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · 🎉×${eventBonus.toFixed(2)}` : '';
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
              <th class="sortable" data-sort="energy" style="min-width:140px;text-align:right;">
                ${t('recipe.th_final_energy', '預估能量')} <span class="sort-arrow"></span>
                <div class="table-sub-header">Lv.${recipeLevel} · ×${islandMult}${eventSub}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const finalE        = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
              const primaryName   = isEN ? (r.name_en || r.name_cn) : r.name_cn;
              const secondaryName = isEN ? (r.name_cn !== primaryName ? r.name_cn : '') : (r.name_en || '');
              const energyCellHTML = showTasty ? `
                <td style="vertical-align:middle;text-align:right;">
                  <div class="table-energy-main">⚡ ${finalE.toLocaleString()}</div>
                  <div class="table-tasty-row">
                    <span class="tasty-badge">2x ${Math.round(finalE * 2).toLocaleString()}</span>
                    <span class="tasty-badge tasty-3x">3x ${Math.round(finalE * 3).toLocaleString()}</span>
                  </div>
                </td>
              ` : `
                <td style="vertical-align:middle;text-align:right;">
                  <div class="table-energy-main">⚡ ${finalE.toLocaleString()}</div>
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
                <td style="vertical-align:middle;"><span class="pot-badge">🍲 ${r.pot_size}</span></td>
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
    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · 🎉×${eventBonus.toFixed(2)}` : '';

    if (isMobileH5) {
      contentArea.innerHTML = `
        <div class="h5-recipe-cards-list">
          ${recipes.map(r => {
            const finalE     = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
            const primaryName = isEN ? (r.name_en || r.name_cn) : r.name_cn;
            return `
            <div class="h5-recipe-card">
              <div class="h5-recipe-left-col">
                <div class="h5-recipe-top-row">
                  <img class="h5-recipe-img" src="${r.icon}" alt="${primaryName}" loading="lazy" onerror="this.style.display='none';">
                  <div class="h5-recipe-title-meta">
                    <span class="h5-recipe-name">${primaryName}</span>
                    <div class="h5-recipe-tags-row">
                      <span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span>
                      <span class="h5-recipe-pot">🍲 ${r.pot_size}</span>
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
          const primaryName = isEN ? (r.name_en || r.name_cn) : r.name_cn;
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
              <div class="recipe-stat-row">
                <span class="stat-label">${t('recipe.th_final_energy', '預估能量')} <small style="color:var(--text-muted);font-weight:400;">(Lv.${recipeLevel} · ×${islandMult}${eventSub})</small></span>
                <span class="stat-value energy-value">${finalE.toLocaleString()}</span>
              </div>
              ${showTasty ? `
                <div class="recipe-stat-row tasty-stats-row">
                  <span class="tasty-desktop-badge">2x <strong>${(finalE * 2).toLocaleString()}</strong></span>
                  <span class="tasty-desktop-badge tasty-3x">3x <strong>${(finalE * 3).toLocaleString()}</strong></span>
                </div>
              ` : ''}
            </div>

            <div class="recipe-desktop-ings">
              <div class="recipe-ing-row compact-4-row">
                ${r.ingredients.map(i => `
                  <div class="recipe-ing-chip compact-chip" title="${i.name} × ${i.count}">
                    ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" alt="${i.name}" loading="lazy">` : ''}
                    <span class="recipe-ing-count">×${i.count}</span>
                  </div>
                `).join('')}
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
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecipesModule);
  } else {
    initRecipesModule();
  }
})();
