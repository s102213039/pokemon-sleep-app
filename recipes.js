/**
 * recipes.js — Pokémon Sleep 料理食譜大全
 * 功能：篩選、排序、等級滑桿、島嶼加成、localStorage 記憶
 */
document.addEventListener('DOMContentLoaded', () => {

  /* ─── 狀態變數 ──────────────────────────────────────── */
  let allRecipes      = [];
  let selectedCategory = 'ALL';
  let selectedIngredients = new Set();
  let matchMode       = 'any';
  let currentSearch   = '';
  let sortOption      = 'energy-desc';
  let viewMode        = 'table';
  let minBonus        = 0;
  let minPot          = 0;
  let recipeLevel     = 1;       // 1-65
  let islandBonus     = 0;       // 0-85 (%)

  /* ─── 等級能量乘數表 (Lv.1-65)
     公式：每級 +2% 於基礎，即 mult(N) = 1 + (N-1) * 0.02
     此為遊戲內近似值，可依官方數據更新 */
  function levelMult(lv) {
    return 1 + (lv - 1) * 0.02;  // Lv.1→1.00x, Lv.65→2.28x
  }

  /* ─── LocalStorage 鍵值 ─────────────────────────────── */
  const LS_KEY = 'pksleep_recipe_prefs_v2';

  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      selectedCategory = saved.selectedCategory || 'ALL';
      minBonus         = Number(saved.minBonus) || 0;
      minPot           = Number(saved.minPot)   || 0;
      recipeLevel      = Number(saved.recipeLevel) || 1;
      islandBonus      = Number(saved.islandBonus) || 0;
      sortOption       = saved.sortOption || 'energy-desc';
      viewMode         = saved.viewMode || 'table';
      matchMode        = saved.matchMode || 'any';
      const savedIngs  = saved.selectedIngredients || [];
      selectedIngredients = new Set(savedIngs);
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
        sortOption,
        viewMode,
        matchMode,
        selectedIngredients: [...selectedIngredients]
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
  const toggleGridBtn        = document.getElementById('toggle-grid');
  const toggleTableBtn       = document.getElementById('toggle-table');
  const bonusSelect          = document.getElementById('bonus-filter-select');
  const potSelect            = document.getElementById('pot-filter-select');
  const levelSlider          = document.getElementById('recipe-level-slider');
  const levelBadge           = document.getElementById('level-badge');
  const islandSlider         = document.getElementById('island-bonus-slider');
  const islandBadge          = document.getElementById('island-bonus-badge');

  /* ─── 滑桿顏色 fill 更新 ────────────────────────────── */
  function updateSliderFill(slider, min, max) {
    const pct = ((slider.value - min) / (max - min)) * 100;
    slider.style.setProperty('--slider-fill', pct + '%');
  }

  /* ─── 初始化滑桿顯示 ─────────────────────────────────── */
  function syncLevelUI() {
    levelSlider.value = recipeLevel;
    levelBadge.textContent = `Lv. ${recipeLevel}`;
    updateSliderFill(levelSlider, 1, 65);
  }

  function syncIslandUI() {
    islandSlider.value = islandBonus;
    const mult = (1 + islandBonus / 100).toFixed(2);
    islandBadge.textContent = `+${islandBonus}% (×${mult})`;
    updateSliderFill(islandSlider, 0, 85);
  }

  /* ─── 載入 recipes.json ─────────────────────────────── */
  loadPrefs();

  fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
      allRecipes = data;
      initCategoryFilters();
      initSelectFilters();
      initSliders();
      initIngredientPicker();
      initViewToggle();
      initSort();
      initSearch();
      render();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">載入 recipes.json 失敗，請確認檔案存在。</div>`;
    });

  /* ─── 料理種類 Filter ────────────────────────────────── */
  function initCategoryFilters() {
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catEmoji   = { ALL:'🍽️', '咖哩':'🍛', '沙拉':'🥗', '甜點':'🍰' };
    const catCounts  = {};
    categories.slice(1).forEach(cat => {
      catCounts[cat] = allRecipes.filter(r => r.category === cat).length;
    });

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : catCounts[cat];
      const active = cat === selectedCategory ? 'active' : '';
      return `<button class="tag-btn ${active}" data-category="${cat}">
        ${catEmoji[cat]} ${cat === 'ALL' ? '全部' : cat}
        <span style="margin-left:3px;opacity:0.65;font-size:11px;">(${count})</span>
      </button>`;
    }).join('');

    categoryContainer.addEventListener('click', e => {
      const btn = e.target.closest('.tag-btn');
      if (btn && btn.hasAttribute('data-category')) {
        selectedCategory = btn.getAttribute('data-category');
        categoryContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        savePrefs();
        render();
      }
    });
  }

  /* ─── Select Filters (bonus / pot) ─────────────────── */
  function initSelectFilters() {
    if (bonusSelect) {
      bonusSelect.value = String(minBonus);
      bonusSelect.addEventListener('change', () => {
        minBonus = parseInt(bonusSelect.value, 10);
        savePrefs();
        render();
      });
    }
    if (potSelect) {
      potSelect.value = String(minPot);
      potSelect.addEventListener('change', () => {
        minPot = parseInt(potSelect.value, 10);
        savePrefs();
        render();
      });
    }
    if (sortSelect) {
      sortSelect.value = sortOption;
    }
  }

  /* ─── 等級 + 島嶼加成 滑桿 ──────────────────────────── */
  function initSliders() {
    // 等級滑桿
    syncLevelUI();
    levelSlider.addEventListener('input', () => {
      recipeLevel = parseInt(levelSlider.value, 10);
      syncLevelUI();
      savePrefs();
      render();
    });

    // 島嶼加成滑桿
    syncIslandUI();
    islandSlider.addEventListener('input', () => {
      islandBonus = parseInt(islandSlider.value, 10);
      syncIslandUI();
      savePrefs();
      render();
    });
  }

  /* ─── 食材選擇器 ─────────────────────────────────────── */
  function initIngredientPicker() {
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

    if (clearIngredientsBtn) {
      clearIngredientsBtn.addEventListener('click', () => {
        selectedIngredients.clear();
        ingredientPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active'));
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
    sortSelect.addEventListener('change', () => {
      sortOption = sortSelect.value;
      savePrefs();
      render();
    });
  }

  /* ─── 搜尋 ──────────────────────────────────────────── */
  function initSearch() {
    if (!searchInput) return;
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value.trim().toLowerCase();
      render();
    });
  }

  /* ─── 能量計算 ──────────────────────────────────────── */
  /**
   * 最終能量計算公式：
   *   finalEnergy = base_energy × (1 + bonus_pct/100 + (level-1)×0.02) × (1 + islandBonus/100)
   *
   * 說明：
   *   1. base_energy：食譜原始基礎能量（Lv.1，無任何加成）
   *   2. bonus_pct：食材加成（固定，依鍋子容量決定）
   *   3. (level-1)×0.02：食譜等級加成（每升1級約+2%）
   *   4. (1 + islandBonus/100)：島嶼能量加成（×1.00 ～ ×1.85）
   */
  function calcEnergy(base, bonus_pct, level, islandBonusPct) {
    const lvMultiplier     = 1 + (bonus_pct / 100) + (level - 1) * 0.02;
    const islandMultiplier = 1 + islandBonusPct / 100;
    return Math.round(base * lvMultiplier * islandMultiplier);
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
            if (!recipeIngNames.every(name => selectedIngredients.has(name))) return false;
          } else {
            if (!recipeIngNames.some(name => selectedIngredients.has(name))) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const eA = calcEnergy(a.base_energy, a.bonus_pct || 19, recipeLevel, islandBonus);
        const eB = calcEnergy(b.base_energy, b.bonus_pct || 19, recipeLevel, islandBonus);
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
    if (pct >= 61) return 'background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.6);';
    if (pct >= 48) return 'background:rgba(167,139,250,0.2);color:#c4b5fd;border:1px solid rgba(167,139,250,0.5);';
    if (pct >= 35) return 'background:rgba(52,211,153,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);';
    if (pct >= 25) return 'background:rgba(56,189,248,0.15);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);';
    if (pct >= 21) return 'background:rgba(148,163,184,0.15);color:#cbd5e1;border:1px solid rgba(148,163,184,0.35);';
    return 'background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2);';
  }

  /* ─── 食材顯示（圖示+數量，inline） ────────────────── */
  function renderIngRow(ingredients) {
    return `<div class="recipe-ing-row">${
      ingredients.map(ing => `
        <span class="recipe-ing-chip" title="${ing.name} ×${ing.count}">
          ${ing.icon ? `<img src="${ing.icon}" class="recipe-ing-icon" alt="${ing.name}" loading="lazy">` : ''}
          <span class="recipe-ing-count">×${ing.count}</span>
        </span>
      `).join('')
    }</div>`;
  }

  /* ─── Render ──────────────────────────────────────── */
  function render() {
    const filtered    = getFilteredRecipes();
    const isFiltered  = filtered.length < allRecipes.length;

    const catBreakdown = {};
    ['咖哩', '沙拉', '甜點'].forEach(cat => {
      catBreakdown[cat] = {
        total: allRecipes.filter(r => r.category === cat).length,
        shown: filtered.filter(r => r.category === cat).length
      };
    });

    const catEmoji = { '咖哩':'🍛', '沙拉':'🥗', '甜點':'🍰' };
    const breakdownHTML = Object.entries(catBreakdown)
      .map(([cat, { total, shown }]) =>
        `<span style="margin:0 6px;opacity:0.8;">${catEmoji[cat]}${cat} <strong>${isFiltered ? shown + '/' : ''}${total}</strong></span>`
      ).join('<span style="opacity:0.3;">|</span>');

    const islandMult = (1 + islandBonus / 100).toFixed(2);
    countBadge.innerHTML = `顯示 <strong>${filtered.length}</strong>/${allRecipes.length} 筆
      <span style="margin-left:12px;font-size:12px;color:var(--text-muted);">${breakdownHTML}</span>
      <span style="margin-left:10px;font-size:12px;color:#fbbf24;">Lv.${recipeLevel}</span>
      <span style="margin-left:6px;font-size:12px;color:#6ee7b7;">🏝️ ×${islandMult}</span>`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">🔍 未找到符合條件的料理食譜</div>`;
      return;
    }

    if (viewMode === 'table') renderTable(filtered);
    else renderGrid(filtered);
  }

  /* ─── 表格視圖 ──────────────────────────────────────── */
  function renderTable(recipes) {
    contentArea.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>圖示</th>
              <th>料理名稱</th>
              <th>分類</th>
              <th>食材加成</th>
              <th>鍋子容量</th>
              <th>食材需求</th>
              <th style="white-space:nowrap;">
                能量<br>
                <small style="color:#fbbf24;font-weight:500;">Lv.${recipeLevel} ×${(1 + islandBonus/100).toFixed(2)}</small>
              </th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const bp         = r.bonus_pct || 19;
              const badgeStyle = getBonusBadgeStyle(bp);
              const emoji      = getBonusEmoji(bp);
              const finalE     = calcEnergy(r.base_energy, bp, recipeLevel, islandBonus);
              const baseE      = calcEnergy(r.base_energy, bp, recipeLevel, 0); // 無島嶼時
              return `
              <tr>
                <td>
                  <img src="${r.icon}" width="52" height="52" alt="${r.name_cn}" loading="lazy"
                    style="border-radius:10px;object-fit:contain;background:rgba(0,0,0,0.25);padding:4px;border:1px solid rgba(255,255,255,0.1);">
                </td>
                <td style="font-weight:700;font-size:15px;color:var(--text-main);white-space:nowrap;">
                  ${r.name_cn}
                  <br><small style="color:var(--text-muted);font-size:11px;font-weight:400;">${r.name_en || ''}</small>
                </td>
                <td><span class="recipe-cat-badge cat-${r.category}">${r.category}</span></td>
                <td>
                  <span style="${badgeStyle}padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap;display:inline-block;">
                    ${emoji} +${bp}%
                  </span>
                </td>
                <td><span class="pot-badge">🍲 ${r.pot_size}</span></td>
                <td>${renderIngRow(r.ingredients)}</td>
                <td style="font-weight:700;color:#fbbf24;font-family:monospace;font-size:15px;white-space:nowrap;">
                  ⚡ ${finalE.toLocaleString()}
                  ${islandBonus > 0 || recipeLevel > 1 ? `
                    <br><small style="color:var(--text-muted);font-size:10px;font-weight:400;">
                      基礎 ${r.base_energy.toLocaleString()}
                      ${recipeLevel > 1 ? ` · Lv.${recipeLevel} ${baseE.toLocaleString()}` : ''}
                    </small>` : ''}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ─── 卡片視圖 ──────────────────────────────────────── */
  function renderGrid(recipes) {
    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const bp         = r.bonus_pct || 19;
          const badgeStyle = getBonusBadgeStyle(bp);
          const emoji      = getBonusEmoji(bp);
          const finalE     = calcEnergy(r.base_energy, bp, recipeLevel, islandBonus);
          const islandMult = (1 + islandBonus / 100).toFixed(2);
          return `
          <div class="pokemon-card">
            <div class="card-header" style="align-items:center;">
              <img class="card-icon" src="${r.icon}" alt="${r.name_cn}" style="width:56px;height:56px;border-radius:10px;">
              <div class="card-title-group">
                <h3 class="pokemon-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.name_cn}</h3>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  <span class="recipe-cat-badge cat-${r.category}">${r.category}</span>
                  <span style="${badgeStyle}padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;">${emoji} +${bp}%</span>
                </div>
              </div>
            </div>
            <div class="card-stats" style="grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;">
              <div class="stat-item">
                <span class="stat-label">鍋子容量</span>
                <span class="stat-value" style="color:var(--accent-color);">🍲 ${r.pot_size}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">⚡ Lv.${recipeLevel} ×${islandMult}</span>
                <span class="stat-value" style="color:#fbbf24;">${finalE.toLocaleString()}</span>
              </div>
            </div>
            <div style="margin-top:10px;">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:5px;">材料需求</div>
              ${renderIngRow(r.ingredients)}
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }
});
