document.addEventListener('DOMContentLoaded', () => {
  let allRecipes = [];
  let selectedCategory = 'ALL';
  let selectedIngredients = new Set();
  let matchMode = 'any';
  let currentSearch = '';
  let sortOption = 'pot-asc';
  let viewMode = 'table';
  let minBonus = 0; // 0 = show all

  const searchInput = document.getElementById('recipe-search-input');
  const sortSelect = document.getElementById('recipe-sort-select');
  const categoryContainer = document.getElementById('category-filter-tags');
  const ingredientPickerContainer = document.getElementById('ingredient-picker-tags');
  const clearIngredientsBtn = document.getElementById('clear-ingredients-btn');
  const countBadge = document.getElementById('recipe-count-badge');
  const contentArea = document.getElementById('recipe-content-area');
  const toggleGridBtn = document.getElementById('toggle-grid');
  const toggleTableBtn = document.getElementById('toggle-table');
  const bonusFilterContainer = document.getElementById('bonus-filter-tags');

  // Load recipes.json
  fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
      allRecipes = data;
      initCategoryFilters();
      initBonusFilter();
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

    function buildCategoryHTML() {
      const catCounts = {};
      categories.slice(1).forEach(cat => {
        catCounts[cat] = allRecipes.filter(r => r.category === cat).length;
      });
      categoryContainer.innerHTML = categories.map(cat => {
        const count = cat === 'ALL' ? allRecipes.length : catCounts[cat];
        return `
          <button class="tag-btn ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">
            ${catEmoji[cat]} ${cat === 'ALL' ? '全部料理' : cat}
            <span style="margin-left:4px;opacity:0.7;font-size:11px;">(${count}種)</span>
          </button>
        `;
      }).join('');
    }

    buildCategoryHTML();

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

  /* ─── Bonus % Filter ───────────────────────────────── */
  function initBonusFilter() {
    const bonusOptions = [
      { label: '全部', value: 0 },
      { label: '≥ 23%', value: 23 },
      { label: '≥ 27%', value: 27 },
      { label: '≥ 33%', value: 33 },
      { label: '≥ 40%', value: 40 },
    ];

    bonusFilterContainer.innerHTML = bonusOptions.map(opt => `
      <button class="tag-btn bonus-filter-btn ${opt.value === minBonus ? 'active' : ''}"
              data-bonus="${opt.value}"
              style="${opt.value >= 33 ? 'border-color:rgba(251,191,36,0.5);' : ''}">
        ${opt.value === 0 ? '🍽️ ' : getBonusEmoji(opt.value)}${opt.label}
      </button>
    `).join('');

    bonusFilterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.bonus-filter-btn');
      if (btn) {
        minBonus = parseInt(btn.getAttribute('data-bonus'), 10);
        bonusFilterContainer.querySelectorAll('.bonus-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      }
    });
  }

  function getBonusEmoji(pct) {
    if (pct >= 40) return '🔥';
    if (pct >= 33) return '⭐';
    if (pct >= 27) return '✨';
    return '💫';
  }

  function getBonusBadgeStyle(pct) {
    if (pct >= 40) return 'background:rgba(239,68,68,0.2);color:#f87171;border:1px solid rgba(239,68,68,0.5);';
    if (pct >= 33) return 'background:rgba(251,191,36,0.2);color:#fbbf24;border:1px solid rgba(251,191,36,0.5);';
    if (pct >= 27) return 'background:rgba(167,139,250,0.2);color:#a78bfa;border:1px solid rgba(167,139,250,0.4);';
    return 'background:rgba(96,165,250,0.15);color:#93c5fd;border:1px solid rgba(96,165,250,0.35);';
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
        <button class="ing-picker-btn" data-name="${name}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${name}">` : ''}
          <span>${name}</span>
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

    clearIngredientsBtn.addEventListener('click', () => {
      selectedIngredients.clear();
      ingredientPickerContainer.querySelectorAll('.ing-picker-btn').forEach(btn => btn.classList.remove('active'));
      render();
    });

    document.querySelectorAll('input[name="ingredient-match-mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        matchMode = e.target.value;
        render();
      });
    });
  }

  /* ─── Search & Sort listeners ──────────────────────── */
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOption = e.target.value;
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
      // Category filter
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;

      // Bonus % filter
      if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;

      // Search query
      if (currentSearch) {
        const nameCN = (recipe.name_cn || '').toLowerCase();
        const nameEN = (recipe.name_en || '').toLowerCase();
        const ingMatch = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(currentSearch));
        if (!nameCN.includes(currentSearch) && !nameEN.includes(currentSearch) && !ingMatch) return false;
      }

      // Ingredient selector filter
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

  /* ─── Render ───────────────────────────────────────── */
  function render() {
    const filtered = getFilteredRecipes();

    // Build category breakdown
    const catBreakdown = {};
    ['咖哩', '沙拉', '甜點'].forEach(cat => {
      const total = allRecipes.filter(r => r.category === cat).length;
      const shown = filtered.filter(r => r.category === cat).length;
      catBreakdown[cat] = { total, shown };
    });

    const isFiltered = filtered.length < allRecipes.length;
    const breakdownHTML = Object.entries(catBreakdown)
      .map(([cat, { total, shown }]) => {
        const emoji = cat === '咖哩' ? '🍛' : cat === '沙拉' ? '🥗' : '🍰';
        return `<span style="margin:0 6px;opacity:0.8;">` +
               `${emoji}${cat} <strong>${isFiltered ? shown + '/' : ''}${total}</strong>種</span>`;
      }).join('<span style="opacity:0.3;">|</span>');

    countBadge.innerHTML = `顯示 <strong>${filtered.length}</strong>/${allRecipes.length} 筆食譜
      <span style="margin-left:12px;font-size:12px;color:var(--text-muted);">${breakdownHTML}</span>`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `
        <div style="text-align:center; padding: 60px; color: var(--text-muted);">
          🔍 未找到符合條件的料理食譜，請嘗試放寬搜尋條件或勾選食材。
        </div>
      `;
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
              <th>所需容量</th>
              <th>食材需求</th>
              <th>基礎能量</th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const bp = r.bonus_pct || 19;
              const badgeStyle = getBonusBadgeStyle(bp);
              const emoji = getBonusEmoji(bp);
              return `
              <tr>
                <td>
                  <img src="${r.icon}" width="52" height="52" alt="${r.name_cn}" loading="lazy"
                    style="border-radius:10px;object-fit:contain;background:rgba(0,0,0,0.25);padding:4px;border:1px solid rgba(255,255,255,0.1);">
                </td>
                <td style="font-weight:700;font-size:15px;color:var(--text-main);">
                  ${r.name_cn}
                  <br><small style="color:var(--text-muted);font-size:12px;font-weight:400;">${r.name_en || ''}</small>
                </td>
                <td>
                  <span class="recipe-cat-badge cat-${r.category}">${r.category}</span>
                </td>
                <td>
                  <span class="bonus-badge" style="${badgeStyle}padding:4px 10px;border-radius:20px;font-weight:700;font-size:13px;white-space:nowrap;display:inline-block;">
                    ${emoji} +${bp}%
                  </span>
                </td>
                <td>
                  <span class="pot-badge">🍲 ${r.pot_size}</span>
                </td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                    ${r.ingredients.map(ing => `
                      <span class="ing-badge" title="${ing.name} ×${ing.count}">
                        ${ing.icon ? `<img src="${ing.icon}" class="ing-badge-icon" alt="${ing.name}">` : ''}
                        <span>×${ing.count}</span>
                      </span>
                    `).join('')}
                  </div>
                </td>
                <td style="font-weight:700;color:#fbbf24;font-family:monospace;font-size:16px;">
                  ⚡ ${r.base_energy.toLocaleString()}
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
          return `
          <div class="pokemon-card">
            <div class="card-header" style="align-items:center;">
              <img class="card-icon" src="${r.icon}" alt="${r.name_cn}" style="width:56px;height:56px;border-radius:10px;">
              <div class="card-title-group">
                <h3 class="pokemon-name">${r.name_cn}</h3>
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
                  <span class="recipe-cat-badge cat-${r.category}">${r.category}</span>
                  <span style="${badgeStyle}padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;">${emoji} +${bp}%</span>
                </div>
              </div>
            </div>
            <div class="card-stats" style="grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
              <div class="stat-item">
                <span class="stat-label">鍋子容量</span>
                <span class="stat-value" style="color:var(--accent-color);">🍲 ${r.pot_size}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">基礎能量</span>
                <span class="stat-value" style="color:#fbbf24;">⚡ ${r.base_energy.toLocaleString()}</span>
              </div>
            </div>
            <div class="ingredient-list" style="margin-top:12px;">
              <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px;">材料需求：</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${r.ingredients.map(ing => `
                  <span class="ing-badge" title="${ing.name} ×${ing.count}">
                    ${ing.icon ? `<img src="${ing.icon}" class="ing-badge-icon" alt="${ing.name}">` : ''}
                    <span>×${ing.count}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }
});
