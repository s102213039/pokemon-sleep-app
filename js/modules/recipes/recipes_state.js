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
  let eventBonus          = 1.0;     // 1.00 - 1.50 (step 0.25)
  let potExpansion        = 0;       // 0 - 700 (多餘食材追加個數)
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
      eventBonus       = saved.eventBonus !== undefined ? Math.min(1.5, Math.max(1.0, Number(saved.eventBonus))) : 1.0;
      potExpansion     = Number(saved.potExpansion) || 0;
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
        potExpansion,
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
  const potExpansionSlider   = document.getElementById('pot-expansion-slider');
  const potExpansionBadge    = document.getElementById('pot-expansion-badge');
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
    updateSliderFill(eventSlider, 1.0, 1.5);
  }

  function syncPotExpansionUI() {
    if (!potExpansionSlider || !potExpansionBadge) return;
    potExpansionSlider.value = potExpansion;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    if (potExpansion === 0) {
      potExpansionBadge.textContent = isEN ? '+0 (None)' : (isCN ? '+0 (无追加)' : '+0 (無追加)');
    } else {
      potExpansionBadge.textContent = `+${potExpansion} (+${(potExpansion * 100).toLocaleString()})`;
    }
    updateSliderFill(potExpansionSlider, 0, 700);
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

  const CACHE_KEY_RECIPES_JSON = 'pksleep_cache_recipes_json';
  const CACHE_KEY_RECIPES_JSON_TIME = 'pksleep_cache_recipes_json_time';

  const fetchRecipesWithFallback = async (...customUrls) => {
    // 1. 優先自本機快取瞬間載入 (Cache-First 0ms 秒開：IndexedDB / LocalStorage)，背景再由 manifest 檢查是否需更新
    try {
      if (typeof window !== 'undefined') {
        if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
          const cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_RECIPES_JSON);
          if (Array.isArray(cachedData) && cachedData.length > 0) {
            return cachedData;
          }
        } else if (window.localStorage) {
          const cachedText = window.localStorage.getItem(CACHE_KEY_RECIPES_JSON);
          if (cachedText) {
            const cachedData = JSON.parse(cachedText);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              return cachedData;
            }
          }
        }
      }
    } catch (cacheReadErr) {}

    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const defaultCandidates = [
      `${base}data/recipes.json`,
      `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json`,
      `data/recipes.json`,
      `../data/recipes.json`,
      `${base}recipes.json`,
      `recipes.json`,
      `../recipes.json`
    ];
    const rawUrls = customUrls.length > 0 ? customUrls : defaultCandidates;
    const cleanUrls = Array.from(new Set(rawUrls.filter(Boolean).map(u => u.split('?')[0])));

    const maxAttempts = 3;
    let lastErr = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const uniqueUrls = attempt === 1 ? cleanUrls : cleanUrls.map(u => `${u}?t=${Date.now()}`);

      for (const url of uniqueUrls) {
        try {
          const res = await fetch(url, { cache: attempt === 1 ? 'default' : 'no-store' });
          if (res && res.ok) {
            const text = await res.text();
            const parsed = JSON.parse(text);
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                try {
                  window.localStorage.setItem(CACHE_KEY_RECIPES_JSON, text);
                  window.localStorage.setItem(CACHE_KEY_RECIPES_JSON_TIME, String(Date.now()));
                } catch (e) {}
              }
              if (typeof window !== 'undefined' && window.DataCacheManager) {
                window.DataCacheManager.saveCachedJson(CACHE_KEY_RECIPES_JSON, 'recipes.json', parsed);
              }
            } catch (e) {}
            return parsed;
          }
        } catch (e) {
          lastErr = e;
        }
      }

      // 若前次嘗試未成功，短暫退避等待後重試 (平滑跨過 GitHub Pages 部署瞬間)
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, attempt * 600));
      }
    }

    // 若所有網路請求重試皆失敗，嘗試自本機快取 (IndexedDB / LocalStorage) 離線載入
    try {
      if (typeof window !== 'undefined') {
        if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
          const cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_RECIPES_JSON);
          if (Array.isArray(cachedData) && cachedData.length > 0) {
            console.warn('[Recipe Engine] 網路請求暫時失敗，已自動自本機離線快取載入 recipes.json (' + cachedData.length + ' 筆料理)');
            return cachedData;
          }
        } else if (window.localStorage) {
          const cachedText = window.localStorage.getItem(CACHE_KEY_RECIPES_JSON);
          if (cachedText) {
            const cachedData = JSON.parse(cachedText);
            if (Array.isArray(cachedData) && cachedData.length > 0) {
              console.warn('[Recipe Engine] 網路請求暫時失敗，已自動自本機離線快取載入 recipes.json (' + cachedData.length + ' 筆料理)');
              return cachedData;
            }
          }
        }
      }
    } catch (cacheErr) {
      console.warn('[Recipe Engine] 讀取離線快取失敗:', cacheErr);
    }

    throw lastErr || new Error('Failed to load recipes.json from candidate paths: ' + cleanUrls.join(', '));
  };

  function scheduleDynamicRecipesSync() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    let isSyncing = false;

    async function runSyncCheck(forceManifest = false) {
      if (isSyncing) return;
      isSyncing = true;
      try {
        let remoteHash = '';
        if (window.DataCacheManager && typeof window.DataCacheManager.checkFileNeedsUpdate === 'function') {
          const check = await window.DataCacheManager.checkFileNeedsUpdate('recipes.json', CACHE_KEY_RECIPES_JSON, forceManifest);
          if (!check.needsUpdate && Array.isArray(allRecipes) && allRecipes.length > 0) {
            return;
          }
          remoteHash = check.remoteHash || '';
        }

        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
        const liveUrl = `${base}data/recipes.json?v=${remoteHash || Date.now()}`;
        let res = await fetch(liveUrl, { cache: 'no-cache' }).catch(() => null);
        if (!res || !res.ok) {
          const fallbackRawUrl = `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json?t=${Date.now()}`;
          res = await fetch(fallbackRawUrl, { cache: 'no-store' });
        }
        if (!res || !res.ok) return;
        const rawText = await res.text();
        const freshData = JSON.parse(rawText);
        if (!Array.isArray(freshData) || freshData.length === 0) return;

        if (window.DataCacheManager) {
          window.DataCacheManager.saveCachedJson(CACHE_KEY_RECIPES_JSON, 'recipes.json', rawText, remoteHash);
        } else if (window.localStorage) {
          try {
            window.localStorage.setItem(CACHE_KEY_RECIPES_JSON, rawText);
            window.localStorage.setItem(CACHE_KEY_RECIPES_JSON_TIME, String(Date.now()));
          } catch (e) {}
        }

        const currentLen = Array.isArray(allRecipes) ? allRecipes.length : 0;
        const isDifferent = currentLen !== freshData.length ||
          (freshData.length > 0 && allRecipes.length > 0 && (
            freshData[0].name !== allRecipes[0].name ||
            freshData[freshData.length - 1].name !== allRecipes[allRecipes.length - 1].name
          ));

        if (isDifferent || !currentLen) {
          console.log(`[Recipe Engine] 動態連線取得最新食譜料理 (${freshData.length} 道)，正在原地更新...`);
          allRecipes = freshData;
          if (typeof window !== 'undefined') {
            window.allRecipes = freshData;
            window.__RECIPES_CACHE__ = freshData;
          }

          if (typeof render === 'function') {
            render();
          }
          window.dispatchEvent(new CustomEvent('recipes-data-updated', { detail: freshData }));
        }
      } catch (err) {
        // 靜默處理網路異常
      } finally {
        isSyncing = false;
      }
    }

    setTimeout(() => runSyncCheck(false), 1800);
    setInterval(() => runSyncCheck(false), 30 * 60 * 1000);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          runSyncCheck(false);
        }
      });
    }
  }

  fetchRecipesWithFallback(
    (typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '') + `data/recipes.json`,
    `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json`,
    `data/recipes.json`,
    `../data/recipes.json`,
    `recipes.json`
  )
    .then(data => {
      allRecipes = data;
      if (typeof window !== 'undefined') {
        window.allRecipes = data;
        window.__RECIPES_CACHE__ = data;
      }
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
      scheduleDynamicRecipesSync();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('recipe-content-area', '料理食譜資料庫載入失敗 (recipes.json)', err);
      } else if (contentArea) {
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">載入 recipes.json 失敗：${err.message}</div>`;
      }
    });

  function getRecipeName(r) {
    if (!r) return '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    if (isEN) return r.name_en || r.name_cn;
    if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') {
      return window.I18N.toSimplified(r.name_cn);
    }
    return r.name_cn;
  }

  /* ─── 料理種類 Filter ────────────────────────────────── */
  function initCategoryFilters() {
    if (!categoryContainer) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = window.I18N && window.I18N.getLanguage() === 'zh-CN';
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catLabels  = {
      ALL: isEN ? 'All' : '全部',
      '咖哩': isEN ? 'Curries' : (isCN ? '咖喱' : '咖哩'),
      '沙拉': isEN ? 'Salads' : '沙拉',
      '甜點': isEN ? 'Desserts' : (isCN ? '甜点' : '甜點')
    };
    const catCounts  = { '咖哩': 0, '沙拉': 0, '甜點': 0 };
    for (let i = 0; i < allRecipes.length; i++) {
      const c = allRecipes[i].category;
      if (catCounts[c] !== undefined) catCounts[c]++;
    }

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : (catCounts[cat] || 0);
      const active = cat === selectedCategory ? 'active' : '';
      return `<button class="tag-btn ${active}" data-cat="${cat}">
        ${catLabels[cat] || cat} (${count})
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
    if (typeof window !== 'undefined' && window.CustomSelect && typeof window.CustomSelect.setup === 'function') {
      return window.CustomSelect.setup(selectElement);
    }
    if (!selectElement || selectElement._customized || !selectElement.parentNode) return;
    selectElement._customized = true;

    selectElement.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-container';
    if (selectElement.classList.contains('sort-select')) {
      container.classList.add('custom-select-sort');
    } else if (selectElement.classList.contains('calc-select')) {
      container.classList.add('custom-select-calc');
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
    arrowSpan.innerHTML = `<svg viewBox="0 0 12 8" width="7" height="4.5"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;

    triggerBtn.appendChild(labelSpan);
    triggerBtn.appendChild(arrowSpan);

    const menuDiv = document.createElement('div');
    menuDiv.className = 'custom-select-menu';
    menuDiv.setAttribute('role', 'listbox');

    function syncUI() {
      const options = selectElement.options ? Array.from(selectElement.options) : [];
      const selected = (selectElement.selectedIndex >= 0 && options[selectElement.selectedIndex]) || options[0] || null;
      const selectedIcon = selected ? selected.getAttribute('data-icon') : null;
      if (selectedIcon) {
        labelSpan.innerHTML = `<img src="${selectedIcon}" class="custom-select-icon" alt="" /><span>${selected.text}</span>`;
      } else {
        labelSpan.textContent = selected ? selected.text : '';
      }

      menuDiv.innerHTML = '';
      options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'custom-select-item';
        if (opt.value === selectElement.value) {
          item.classList.add('active');
        }
        item.setAttribute('role', 'option');
        item.setAttribute('data-value', opt.value);
        const optIcon = opt.getAttribute('data-icon');
        item.innerHTML = `
          <div class="custom-select-item-content">
            ${optIcon ? `<img src="${optIcon}" class="custom-select-icon" alt="" />` : ''}
            <span class="custom-select-item-text">${opt.text}</span>
          </div>
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
    if (levelSlider) {
      syncLevelUI();
      levelSlider.addEventListener('input', () => {
        recipeLevel = parseInt(levelSlider.value, 10);
        syncLevelUI();
        savePrefs();
        render();
      });
    }

    if (islandSlider) {
      syncIslandUI();
      islandSlider.addEventListener('input', () => {
        islandBonus = parseInt(islandSlider.value, 10);
        syncIslandUI();
        savePrefs();
        render();
      });
    }

    if (eventSlider) {
      syncEventUI();
      eventSlider.addEventListener('input', () => {
        eventBonus = parseFloat(eventSlider.value);
        syncEventUI();
        savePrefs();
        render();
      });
    }

    if (potExpansionSlider) {
      syncPotExpansionUI();
      potExpansionSlider.addEventListener('input', () => {
        potExpansion = parseInt(potExpansionSlider.value, 10) || 0;
        syncPotExpansionUI();
        savePrefs();
        render();
      });
    }
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

  /* ─── 能量計算 (含食譜等級、多餘食材追加擴鍋、島嶼加成與活動加成) ──────────────────────── */
