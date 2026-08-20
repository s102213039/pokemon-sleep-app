/**
 * recipes.js — Pokémon Sleep 料理食譜大全
 * 功能：篩選、排序、等級滑桿、島嶼加成、活動加成、漂亮成功分數、localStorage 記憶
 */
document.addEventListener('DOMContentLoaded', () => {

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
    if (showTasty) {
      tastyToggleBtn.classList.add('active');
      tastyToggleBtn.setAttribute('aria-checked', 'true');
    } else {
      tastyToggleBtn.classList.remove('active');
      tastyToggleBtn.setAttribute('aria-checked', 'false');
    }
  }

  /* ─── 載入 recipes.json ─────────────────────────────── */
  loadPrefs();

  const fetchRecipesWithFallback = async (primaryUrl, fallbackUrl) => {
    try {
      const res = await fetch(primaryUrl, { cache: 'no-store' });
      if (res.ok) return res.json();
    } catch (e) {}
    const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
    if (!fallbackRes.ok) throw new Error(`HTTP ${fallbackRes.status}`);
    return fallbackRes.json();
  };

  fetchRecipesWithFallback(`data/recipes.json?t=${Date.now()}`, `recipes.json?t=${Date.now()}`)
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
      render();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      if (contentArea) {
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">載入 recipes.json 失敗，請確認檔案存在。</div>`;
      }
    });

  /* ─── 料理種類 Filter ────────────────────────────────── */
  function initCategoryFilters() {
    if (!categoryContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catEmoji   = { ALL:'🍽️', '咖哩':'🍛', '沙拉':'🥗', '甜點':'🍰' };
    const catLabels  = {
      ALL: isEN ? 'All' : '全部種類',
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
      return `<button class="tag-btn ${active}" data-cat="${cat}">
        ${catEmoji[cat]} ${catLabels[cat] || cat} (${count})
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
    if (!selectElement || selectElement._customized) return;
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
      const selected = selectElement.options[selectElement.selectedIndex] || selectElement.options[0];
      labelSpan.textContent = selected ? selected.text : '';

      menuDiv.innerHTML = '';
      Array.from(selectElement.options).forEach(opt => {
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
    selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
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
    tastyToggleBtn.addEventListener('click', () => {
      showTasty = !showTasty;
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
      return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${name}">
        ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${name}">` : ''}
      </button>`;
    }).join('');

    ingredientPickerContainer.addEventListener('click', e => {
      const btn = e.target.closest('.ing-picker-btn');
      if (btn) {
        const name = btn.getAttribute('data-name');
        if (excludedIngredients.has(name)) {
          excludedIngredients.delete(name);
          const exBtn = excludedPickerContainer && excludedPickerContainer.querySelector(`[data-name="${CSS.escape(name)}"]`);
          if (exBtn) exBtn.classList.remove('active');
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

    const excludedPickerContainer = document.getElementById('excluded-ingredient-picker-tags');
    if (excludedPickerContainer) {
      excludedPickerContainer.innerHTML = ingNames.map(name => {
        const icon   = ingMap.get(name);
        const active = excludedIngredients.has(name) ? 'active-exclude' : '';
        return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${name}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${name}">` : ''}
        </button>`;
      }).join('');

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
    if (!recipeSearchClear || !searchInput) return;
    recipeSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
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

  function getBonusBadgeStyle(pct) {
    if (pct >= 78) return 'background:rgba(251,191,36,0.25);color:#fbbf24;border:1px solid rgba(251,191,36,0.7);';
    if (pct >= 61) return 'background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.5);';
    if (pct >= 48) return 'background:rgba(168,85,247,0.2);color:#c084fc;border:1px solid rgba(168,85,247,0.5);';
    if (pct >= 35) return 'background:rgba(59,130,246,0.2);color:#60a5fa;border:1px solid rgba(59,130,246,0.5);';
    if (pct >= 25) return 'background:rgba(16,185,129,0.2);color:#34d399;border:1px solid rgba(16,185,129,0.5);';
    return 'background:rgba(255,255,255,0.08);color:var(--text-main);border:1px solid rgba(255,255,255,0.15);';
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

  /* ─── 渲染主入口 ────────────────────────────────────── */
  function render() {
    if (!contentArea || !countBadge) return;
    initCategoryFilters();
    const filtered = getFilteredRecipes();
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;

    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const catCounts = {};
    filtered.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const breakdownHTML = Object.entries(catCounts).map(([cat, c]) => `${catLabels[cat] || cat} <strong>${c}</strong>`).join(' · ');

    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventText  = eventBonus > 1.0 ? `<span style="margin-left:6px;font-size:12px;color:var(--color-accent-rose);">🎉 ×${eventBonus.toFixed(2)}</span>` : '';
    const tastyText  = showTasty ? `<span style="margin-left:6px;font-size:12px;color:var(--color-accent-rose);font-weight:600;">✨ Extra Tasty</span>` : '';

    countBadge.innerHTML = `${isEN ? `Showing <strong>${filtered.length}</strong>/${allRecipes.length} dishes` : `顯示 <strong>${filtered.length}</strong>/${allRecipes.length} 筆`}
      <span style="margin-left:12px;font-size:12px;color:var(--text-muted);">${breakdownHTML}</span>
      <span style="margin-left:10px;font-size:12px;color:var(--color-accent-gold);">Lv.${recipeLevel}</span>
      <span style="margin-left:6px;font-size:12px;color:var(--color-accent-green);">🏝️ ×${islandMult}</span>
      ${eventText}
      ${tastyText}`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">🔍 ${isEN ? 'No matching recipes found' : '未找到符合條件的料理食譜'}</div>`;
      return;
    }

    if (viewMode === 'table') renderTable(filtered);
    else renderGrid(filtered);
  }

  function renderTable(recipes) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · 🎉×${eventBonus.toFixed(2)}` : '';
    contentArea.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>${t('th.icon', '圖示')}</th>
              <th>${t('recipe.th_dish', '料理名稱')}</th>
              <th>${t('recipe.th_category', '分類')}</th>
              <th>${t('recipe.th_bonus', '食材加成')}</th>
              <th>${t('recipe.th_pot', '鍋子容量')}</th>
              <th>${t('recipe.th_ingredients', '食材需求')}</th>
              <th style="white-space:nowrap;min-width:115px;text-align:center;">
                ${t('recipe.th_final_energy', '能量')}<br>
                <small style="color:var(--color-accent-gold);font-weight:500;">Lv.${recipeLevel} · 🏝️×${islandMult}${eventSub}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const bp         = r.bonus_pct || 19;
              const badgeStyle = getBonusBadgeStyle(bp);
              const emoji      = getBonusEmoji(bp);
              const finalE     = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
              const primaryName = isEN ? (r.name_en || r.name_cn) : r.name_cn;
              const secondaryName = isEN ? (r.name_cn || '') : (r.name_en || '');

              let energyCellHTML = '';
              if (!showTasty) {
                energyCellHTML = `
                  <td style="font-weight:700;color:var(--color-accent-gold);font-family:monospace;font-size:15px;white-space:nowrap;text-align:center;">
                    ⚡ ${finalE.toLocaleString()}
                  </td>
                `;
              } else {
                energyCellHTML = `
                  <td style="white-space:nowrap;text-align:center;padding:8px 8px;">
                    <div class="tasty-energy-stack">
                      <div class="tasty-row tasty-row-normal" title="一般能量 (1x)">
                        <span class="tasty-tag">1x</span>
                        <span class="tasty-icon">⚡</span>
                        <span class="tasty-num">${finalE.toLocaleString()}</span>
                      </div>
                      <div class="tasty-row tasty-row-2x" title="漂亮成功 (2倍)">
                        <span class="tasty-tag">2x</span>
                        <span class="tasty-icon">✨</span>
                        <span class="tasty-num">${(finalE * 2).toLocaleString()}</span>
                      </div>
                      <div class="tasty-row tasty-row-3x" title="超成功 / 漂亮 (3倍)">
                        <span class="tasty-tag">3x</span>
                        <span class="tasty-icon">🌟</span>
                        <span class="tasty-num">${(finalE * 3).toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                `;
              }

              return `
              <tr>
                <td>
                  <img src="${r.icon}" width="52" height="52" alt="${primaryName}" loading="lazy"
                    style="border-radius:10px;object-fit:contain;background:var(--bg-card-inner);padding:4px;border:1px solid var(--border-color);">
                </td>
                <td style="font-weight:700;font-size:15px;color:var(--text-main);white-space:nowrap;">
                  ${primaryName}
                  ${secondaryName ? `<br><small style="color:var(--text-muted);font-size:11px;font-weight:400;">${secondaryName}</small>` : ''}
                </td>
                <td><span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span></td>
                <td>
                  <span style="${badgeStyle}padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap;display:inline-block;">
                    ${emoji} +${bp}%
                  </span>
                </td>
                <td><span class="pot-badge">🍲 ${r.pot_size}</span></td>
                <td>${renderIngRow(r.ingredients)}</td>
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
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const catLabels = { '咖哩': isEN ? 'Curry' : '咖哩', '沙拉': isEN ? 'Salad' : '沙拉', '甜點': isEN ? 'Dessert' : '甜點' };
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · 🎉×${eventBonus.toFixed(2)}` : '';
    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const bp         = r.bonus_pct || 19;
          const badgeStyle = getBonusBadgeStyle(bp);
          const emoji      = getBonusEmoji(bp);
          const finalE     = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
          const primaryName = isEN ? (r.name_en || r.name_cn) : r.name_cn;
          return `
          <div class="pokemon-card">
            <div class="card-header" style="align-items:center;">
              <img class="card-icon" src="${r.icon}" alt="${primaryName}" style="width:56px;height:56px;border-radius:10px;">
              <div class="card-title-group">
                <h3 class="pokemon-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${primaryName}</h3>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  <span class="recipe-cat-badge cat-${r.category}">${catLabels[r.category] || r.category}</span>
                  <span style="${badgeStyle}padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;">${emoji} +${bp}%</span>
                </div>
              </div>
            </div>
            <div class="card-stats" style="grid-template-columns:1fr;gap:8px;margin-top:10px;">
              <div class="stat-item" style="display:flex;justify-content:space-between;align-items:center;">
                <span class="stat-label">🍲 ${t('recipe.th_pot', '鍋子容量')}</span>
                <span class="stat-value" style="color:var(--accent-color);">🍲 ${r.pot_size}</span>
              </div>
              <div class="stat-item" style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span class="stat-label">⚡ ${t('recipe.th_final_energy', '能量')} (Lv.${recipeLevel} · 🏝️×${islandMult}${eventSub})</span>
                  <span class="stat-value" style="color:var(--color-accent-gold);font-size:15px;font-family:monospace;font-weight:700;">⚡ ${finalE.toLocaleString()}</span>
                </div>
                ${showTasty ? `
                  <div class="card-tasty-group">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:12px;color:var(--text-muted);font-family:sans-serif;">✨ 2x</span>
                      <span class="card-score-2x">✨ ${(finalE * 2).toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:12px;color:var(--text-muted);font-family:sans-serif;">🌟 3x</span>
                      <span class="card-score-3x">🌟 ${(finalE * 3).toLocaleString()}</span>
                    </div>
                  </div>
                ` : ''}
              </div>
            </div>
            <div style="margin-top:10px;">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:5px;">${t('recipe.th_ingredients', '材料需求')}</div>
              ${renderIngRow(r.ingredients)}
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }

  window.RecipesApp = {
    render: function() {
      initCategoryFilters();
      render();
    }
  };
});
