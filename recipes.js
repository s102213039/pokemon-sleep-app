document.addEventListener('DOMContentLoaded', () => {
  let allRecipes = [];
  let selectedCategory = 'ALL';
  let selectedIngredients = new Set();
  let matchMode = 'any';
  let currentSearch = '';
  let sortOption = 'energy-desc';
  let viewMode = 'table';
  let minBonus = 0;
  let minPot = 0;
  let recipeLevel = 1;

  // Level multiplier table (approx. from game data: each level adds ~2%)
  // Level 1 = base (bonus_pct as-is), higher levels scale up
  const LEVEL_MULT = { 1:1, 10:1.18, 20:1.38, 30:1.58, 40:1.78, 50:1.98, 55:2.08, 60:2.18 };

  const searchInput   = document.getElementById('recipe-search-input');
  const sortSelect    = document.getElementById('recipe-sort-select');
  const categoryContainer  = document.getElementById('category-filter-tags');
  const ingredientPickerContainer = document.getElementById('ingredient-picker-tags');
  const clearIngredientsBtn = document.getElementById('clear-ingredients-btn');
  const countBadge    = document.getElementById('recipe-count-badge');
  const contentArea   = document.getElementById('recipe-content-area');
  const toggleGridBtn = document.getElementById('toggle-grid');
  const toggleTableBtn = document.getElementById('toggle-table');
  const bonusSelect   = document.getElementById('bonus-filter-select');
  const levelSelect   = document.getElementById('recipe-level-select');
  const potSelect     = document.getElementById('pot-filter-select');

  // Load recipes.json
  fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
      allRecipes = data;
      initCategoryFilters();
      initSelectFilters();
      initIngredientPicker();
      render();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 recipes.json 失敗，請確認檔案存在。</div>`;
    });

  /* ─── Category Filter ──────────────────────────────── */
  function initCategoryFilters() {
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catEmoji = { 'ALL': '🍽️', '咖哩': '🍛', '沙拉': '🥗', '甜點': '🍰' };
    const catCounts = {};
    categories.slice(1).forEach(cat => {
      catCounts[cat] = allRecipes.filter(r => r.category === cat).length;
    });

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : catCounts[cat];
      return `
        <button class="tag-btn ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">
          ${catEmoji[cat]} ${cat === 'ALL' ? '全部' : cat}
          <span style="margin-left:3px;opacity:0.65;font-size:11px;">(${count})</span>
        </button>
      `;
    }).join('');

    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-btn');
      if (btn && btn.hasAttribute('data-category')) {
        selectedCategory = btn.getAttribute('data-category');
        categoryContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      }
    });
  }

  /* ─── Select-based Filters ─────────────────────────── */
  function initSelectFilters() {
    if (bonusSelect) {
      bonusSelect.value = '0';
      bonusSelect.addEventListener('change', () => {
        minBonus = parseInt(bonusSelect.value, 10);
        render();
      });
    }
    if (levelSelect) {
      levelSelect.value = '1';
      levelSelect.addEventListener('change', () => {
        recipeLevel = parseInt(levelSelect.value, 10);
        render();
      });
    }
    if (potSelect) {
      potSelect.value = '0';
      potSelect.addEventListener('change', () => {
        minPot = parseInt(potSelect.value, 10);
        render();
      });
    }
    if (sortSelect) {
      sortSelect.value = sortOption;
      sortSelect.addEventListener('change', () => {
        sortOption = sortSelect.value;
        render();
      });
    }
  }

  /* ─── Ingredient Picker ────────────────────────────── */
  function initIngredientPicker() {
    const ingMap = new Map();
    allRecipes.forEach(r => {
      r.ingredients.forEach(ing => {
        if (!ingMap.has(ing.name)) ingMap.set(ing.name, ing.icon || '');
      });
    });

    const ingNames = Array.from(ingMap.keys()).sort();
    ingredientPickerContainer.innerHTML = ingNames.map(name => {
      const icon = ingMap.get(name);
      return `
        <button class="ing-picker-btn" data-name="${name}" title="${name}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${name}">` : ''}
        </button>
      `;
    }).join('');

    ingredientPickerContainer.addEventListener('click', (e) => {
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
        render();
      }
    });

    if (clearIngredientsBtn) {
      clearIngredientsBtn.addEventListener('click', () => {
        selectedIngredients.clear();
        ingredientPickerContainer.querySelectorAll('.ing-picker-btn').forEach(btn => btn.classList.remove('active'));
        render();
      });
    }

    document.querySelectorAll('input[name="ingredient-match-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        matchMode = e.target.value;
        render();
      });
    });
  }

  /* ─── Search listener ──────────────────────────────── */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      render();
    });
  }

  if (toggleGridBtn && toggleTableBtn) {
    toggleGridBtn.addEventListener('click', () => {
      viewMode = 'grid';
      toggleGridBtn.classList.add('active');
      toggleTableBtn.classList.remove('active');
      render();
    });
    toggleTableBtn.addEventListener('click', () => {
      viewMode = 'table';
      toggleTableBtn.classList.add('active');
      toggleGridBtn.classList.remove('active');
      render();
    });
  }

  /* ─── Filtering & Sorting ──────────────────────────── */
  function getFilteredRecipes() {
    return allRecipes.filter(recipe => {
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;
      if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;
      if (minPot > 0 && (recipe.pot_size || 0) < minPot) return false;
      if (currentSearch) {
        const nameCN = (recipe.name_cn || '').toLowerCase();
        const nameEN = (recipe.name_en || '').toLowerCase();
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
    }).sort((a, b) => {
      if (sortOption === 'pot-asc') return a.pot_size - b.pot_size;
      if (sortOption === 'pot-desc') return b.pot_size - a.pot_size;
      if (sortOption === 'energy-desc') return b.base_energy - a.base_energy;
      if (sortOption === 'energy-asc') return a.base_energy - b.base_energy;
      if (sortOption === 'bonus-desc') return (b.bonus_pct || 0) - (a.bonus_pct || 0);
      if (sortOption === 'name-asc') return a.name_cn.localeCompare(b.name_cn, 'zh-TW');
      return 0;
    });
  }

  /* ─── Compute energy at level ──────────────────────── */
  function energyAtLevel(base, bonus_pct, level) {
    const mult = LEVEL_MULT[level] || 1;
    // At Lv.1, bonus_pct is the base ingredient bonus
    // At higher levels, total multiplier scales up by ~2% per level beyond 1
    const extraLevels = level - 1;
    const totalMult = 1 + (bonus_pct / 100) + (extraLevels * 0.02);
    return Math.round(base * totalMult);
  }

  /* ─── Badge helpers ────────────────────────────────── */
  function getBonusEmoji(pct) {
    if (pct >= 78) return '🏆';
    if (pct >= 61) return '🔥';
    if (pct >= 48) return '⭐';
    if (pct >= 35) return '✨';
    if (pct >= 25) return '💧';
    if (pct >= 21) return '💫';
    if (pct >= 20) return '•';
    return '•';
  }

  function getBonusBadgeStyle(pct) {
    if (pct >= 78) return 'background:rgba(251,191,36,0.25);color:#fbbf24;border:1px solid rgba(251,191,36,0.7);';
    if (pct >= 61) return 'background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.6);';
    if (pct >= 48) return 'background:rgba(167,139,250,0.2);color:#c4b5fd;border:1px solid rgba(167,139,250,0.5);';
    if (pct >= 35) return 'background:rgba(52,211,153,0.15);color:#6ee7b7;border:1px solid rgba(52,211,153,0.4);';
    if (pct >= 25) return 'background:rgba(56,189,248,0.15);color:#7dd3fc;border:1px solid rgba(56,189,248,0.4);';
    if (pct >= 21) return 'background:rgba(148,163,184,0.15);color:#cbd5e1;border:1px solid rgba(148,163,184,0.35);';
    if (pct >= 20) return 'background:rgba(148,163,184,0.1);color:#94a3b8;border:1px solid rgba(148,163,184,0.25);';
    return 'background:rgba(100,116,139,0.1);color:#64748b;border:1px solid rgba(100,116,139,0.2);';
  }

  /* ─── Ingredient display (icon only, inline row) ───── */
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

  /* ─── Render ───────────────────────────────────────── */
  function render() {
    const filtered = getFilteredRecipes();
    const isFiltered = filtered.length < allRecipes.length;

    const catBreakdown = {};
    ['咖哩', '沙拉', '甜點'].forEach(cat => {
      catBreakdown[cat] = {
        total: allRecipes.filter(r => r.category === cat).length,
        shown: filtered.filter(r => r.category === cat).length
      };
    });

    const catEmoji = { '咖哩': '🍛', '沙拉': '🥗', '甜點': '🍰' };
    const breakdownHTML = Object.entries(catBreakdown)
      .map(([cat, { total, shown }]) =>
        `<span style="margin:0 6px;opacity:0.8;">${catEmoji[cat]}${cat} <strong>${isFiltered ? shown + '/' : ''}${total}</strong></span>`
      ).join('<span style="opacity:0.3;">|</span>');

    const levelMult = LEVEL_MULT[recipeLevel] || 1;
    countBadge.innerHTML = `顯示 <strong>${filtered.length}</strong>/${allRecipes.length} 筆
      <span style="margin-left:12px;font-size:12px;color:var(--text-muted);">${breakdownHTML}</span>
      <span style="margin-left:12px;font-size:12px;color:#fbbf24;">@ Lv.${recipeLevel}</span>`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center; padding: 60px; color: var(--text-muted);">🔍 未找到符合條件的料理食譜</div>`;
      return;
    }

    if (viewMode === 'table') renderTable(filtered);
    else renderGrid(filtered);
  }

  /* ─── Table View ───────────────────────────────────── */
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
              <th>基礎能量 (Lv.${recipeLevel})</th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const bp = r.bonus_pct || 19;
              const badgeStyle = getBonusBadgeStyle(bp);
              const emoji = getBonusEmoji(bp);
              const mult = LEVEL_MULT[recipeLevel] || 1;
              const extraLevels = recipeLevel - 1;
              const totalMult = 1 + (bp / 100) + (extraLevels * 0.02);
              const lvEnergy = Math.round(r.base_energy * totalMult);
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
                  <span class="bonus-badge" style="${badgeStyle}padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap;display:inline-block;">
                    ${emoji} +${bp}%
                  </span>
                </td>
                <td><span class="pot-badge">🍲 ${r.pot_size}</span></td>
                <td>${renderIngRow(r.ingredients)}</td>
                <td style="font-weight:700;color:#fbbf24;font-family:monospace;font-size:15px;white-space:nowrap;">
                  ⚡ ${lvEnergy.toLocaleString()}
                  ${recipeLevel > 1 ? `<br><small style="color:var(--text-muted);font-size:11px;">(基礎 ${r.base_energy.toLocaleString()})</small>` : ''}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ─── Grid View ────────────────────────────────────── */
  function renderGrid(recipes) {
    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const bp = r.bonus_pct || 19;
          const badgeStyle = getBonusBadgeStyle(bp);
          const emoji = getBonusEmoji(bp);
          const extraLevels = recipeLevel - 1;
          const totalMult = 1 + (bp / 100) + (extraLevels * 0.02);
          const lvEnergy = Math.round(r.base_energy * totalMult);
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
                <span class="stat-label">能量 Lv.${recipeLevel}</span>
                <span class="stat-value" style="color:#fbbf24;">⚡ ${lvEnergy.toLocaleString()}</span>
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
