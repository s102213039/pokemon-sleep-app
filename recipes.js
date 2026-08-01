document.addEventListener('DOMContentLoaded', () => {
  let allRecipes = [];
  let selectedCategory = 'ALL';
  let selectedIngredients = new Set();
  let matchMode = 'any';
  let currentSearch = '';
  let sortOption = 'pot-asc';
  let viewMode = 'table';

  const searchInput = document.getElementById('recipe-search-input');
  const sortSelect = document.getElementById('recipe-sort-select');
  const categoryContainer = document.getElementById('category-filter-tags');
  const ingredientPickerContainer = document.getElementById('ingredient-picker-tags');
  const clearIngredientsBtn = document.getElementById('clear-ingredients-btn');
  const countBadge = document.getElementById('recipe-count-badge');
  const contentArea = document.getElementById('recipe-content-area');
  const toggleGridBtn = document.getElementById('toggle-grid');
  const toggleTableBtn = document.getElementById('toggle-table');

  // Load recipes.json
  fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
      allRecipes = data;
      initCategoryFilters();
      initIngredientPicker();
      render();
    })
    .catch(err => {
      console.error('Error loading recipes.json:', err);
      contentArea.innerHTML = `<div style="text-align:center; padding: 40px; color: #ef4444;">載入 recipes.json 失敗，請確認檔案存在。</div>`;
    });

  function initCategoryFilters() {
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    categoryContainer.innerHTML = categories.map(cat => `
      <button class="tag-btn ${cat === selectedCategory ? 'active' : ''}" data-category="${cat}">
        ${cat === 'ALL' ? '全部料理' : cat}
      </button>
    `).join('');

    categoryContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('tag-btn')) {
        selectedCategory = e.target.getAttribute('data-category');
        categoryContainer.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        render();
      }
    });
  }

  function initIngredientPicker() {
    // Extract unique ingredient names & icons
    const ingMap = new Map();
    allRecipes.forEach(r => {
      r.ingredients.forEach(ing => {
        if (!ingMap.has(ing.name)) {
          ingMap.set(ing.name, ing.icon || '');
        }
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

  function getFilteredRecipes() {
    return allRecipes.filter(recipe => {
      // Category filter
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (currentSearch) {
        const nameCN = (recipe.name_cn || '').toLowerCase();
        const nameEN = (recipe.name_en || '').toLowerCase();
        const ingMatch = recipe.ingredients.some(ing => ing.name.toLowerCase().includes(currentSearch));
        if (!nameCN.includes(currentSearch) && !nameEN.includes(currentSearch) && !ingMatch) {
          return false;
        }
      }

      // Ingredient selector filter
      if (selectedIngredients.size > 0) {
        const recipeIngNames = recipe.ingredients.map(i => i.name);
        if (matchMode === 'all') {
          // Recipe must only contain ingredients that are selected
          const allMatch = recipeIngNames.every(name => selectedIngredients.has(name));
          if (!allMatch) return false;
        } else {
          // Recipe must contain at least one selected ingredient
          const anyMatch = recipeIngNames.some(name => selectedIngredients.has(name));
          if (!anyMatch) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortOption === 'pot-asc') return a.pot_size - b.pot_size;
      if (sortOption === 'pot-desc') return b.pot_size - a.pot_size;
      if (sortOption === 'energy-desc') return b.base_energy - a.base_energy;
      if (sortOption === 'energy-asc') return a.base_energy - b.base_energy;
      if (sortOption === 'name-asc') return a.name_cn.localeCompare(b.name_cn, 'zh-TW');
      return 0;
    });
  }

  function render() {
    const filtered = getFilteredRecipes();
    countBadge.textContent = `共顯示 ${filtered.length} 筆食譜 (總計 ${allRecipes.length} 筆)`;

    if (filtered.length === 0) {
      contentArea.innerHTML = `
        <div style="text-align:center; padding: 60px; color: var(--text-muted);">
          🔍 未找到符合條件的料理食譜，請嘗試放寬搜尋條件或勾選食材。
        </div>
      `;
      return;
    }

    if (viewMode === 'table') {
      renderTable(filtered);
    } else {
      renderGrid(filtered);
    }
  }

  function renderTable(recipes) {
    contentArea.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table">
          <thead>
            <tr>
              <th>圖示</th>
              <th>料理名稱</th>
              <th>分類</th>
              <th>所需容量</th>
              <th>食材需求數量</th>
              <th>基礎能量</th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => `
              <tr>
                <td>
                  <img src="${r.icon}" width="52" height="52" alt="${r.name_cn}" loading="lazy" style="border-radius:10px;object-fit:contain;background:rgba(0,0,0,0.25);padding:4px;border:1px solid rgba(255,255,255,0.1);">
                </td>
                <td style="font-weight:700;font-size:15px;color:var(--text-main);">
                  ${r.name_cn}
                  <br><small style="color:var(--text-muted);font-size:12px;font-weight:400;">${r.name_en || ''}</small>
                </td>
                <td>
                  <span class="recipe-cat-badge cat-${r.category}">${r.category}</span>
                </td>
                <td>
                  <span class="pot-badge">🍲 ${r.pot_size}</span>
                </td>
                <td>
                  <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
                    ${r.ingredients.map(ing => `
                      <span class="ing-badge">
                        ${ing.icon ? `<img src="${ing.icon}" class="ing-badge-icon" alt="${ing.name}">` : ''}
                        ${ing.name} <strong style="color:var(--accent-color);">x${ing.count}</strong>
                      </span>
                    `).join('')}
                  </div>
                </td>
                <td style="font-weight:700;color:#fbbf24;font-family:monospace;font-size:16px;">
                  ⚡ ${r.base_energy.toLocaleString()}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderGrid(recipes) {
    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => `
          <div class="pokemon-card">
            <div class="card-header" style="align-items:center;">
              <img class="card-icon" src="${r.icon}" alt="${r.name_cn}" style="width:56px;height:56px;border-radius:10px;">
              <div class="card-title-group">
                <h3 class="pokemon-name">${r.name_cn}</h3>
                <span class="recipe-cat-badge cat-${r.category}">${r.category}</span>
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
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${r.ingredients.map(ing => `
                  <span class="ing-badge">
                    ${ing.icon ? `<img src="${ing.icon}" class="ing-badge-icon" alt="${ing.name}">` : ''}
                    ${ing.name} x${ing.count}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
});
