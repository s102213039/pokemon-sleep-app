  function getLadderDishIcon(dishName) {
    if (!dishName) return '';
    const found = ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === dishName || r.name_en === dishName);
    if (found && found.icon) return found.icon;
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__)) {
      const cacheFound = window.__RECIPES_CACHE__.find(r => r.name_cn === dishName || r.name_en === dishName);
      if (cacheFound && cacheFound.icon) return cacheFound.icon;
    }
    return '';
  }

  // 全局前 7 高能量料理 (維持舊介面與單元測試相容性)
  const TOP_7_RECIPES_HIGHLIGHT = [
    TOP_RECIPES_BY_CATEGORY.curry[0],
    TOP_RECIPES_BY_CATEGORY.dessert[0],
    TOP_RECIPES_BY_CATEGORY.salad[0],
    TOP_RECIPES_BY_CATEGORY.salad[1],
    TOP_RECIPES_BY_CATEGORY.curry[1],
    TOP_RECIPES_BY_CATEGORY.dessert[1],
    TOP_RECIPES_BY_CATEGORY.dessert[2]
  ];

  let ladderRecipeCategory = 'curry';
  let ladderHighlightRecipe = null;
  let ladderRecipeMultiSelect = false;
  let ladderHighlightRecipes = [];

  const RECIPE_MARK_PALETTE = [
    { fg: '#0284c7', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },  // 1. 晴空藍 (Sky Blue)
    { fg: '#b45309', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' },  // 2. 琥珀金黃 (Amber Gold)
    { fg: '#c026d3', color: '#e879f9', bg: 'rgba(232, 121, 249, 0.2)' }, // 3. 桃紅洋紅 (Fuchsia Magenta)
    { fg: '#059669', color: '#34d399', bg: 'rgba(52, 211, 153, 0.2)' },  // 4. 翡翠綠 (Emerald Green)
    { fg: '#ea580c', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.2)' },  // 5. 鮮亮橘 (Vivid Orange)
    { fg: '#7c3aed', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.2)' }, // 6. 魅惑紫 (Electric Violet)
    { fg: '#dc2626', color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)' }, // 7. 珊瑚紅 (Coral Red)
    { fg: '#0d9488', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' }   // 8. 湖水青綠 (Seafoam Teal)
  ];

  function getRecipeMarkStyle(index) {
    return RECIPE_MARK_PALETTE[index % RECIPE_MARK_PALETTE.length];
  }

  function getActiveHighlightRecipes() {
    const names = ladderRecipeMultiSelect
      ? ladderHighlightRecipes.slice()
      : (ladderHighlightRecipe ? [ladderHighlightRecipe] : []);
    const seen = new Set();
    const list = [];
    names.forEach(n => {
      const rec = ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === n || r.name_en === n);
      if (!rec) return;
      if (seen.has(rec.name_cn)) return;
      seen.add(rec.name_cn);
      list.push(rec);
    });
    return list;
  }

  function buildHighlightIngState() {
    const recipes = getActiveHighlightRecipes();
    const map = new Map();
    const marks = new Map();
    recipes.forEach((rec, idx) => {
      const style = getRecipeMarkStyle(idx);
      (rec.ingredients || []).forEach(item => {
        const entry = { count: item.count, recipe: rec, ...style };
        const keys = [item.name];
        if (item.name === '美味尾巴') keys.push('Slowpoke Tail');
        if (item.name === 'Slowpoke Tail') keys.push('美味尾巴');
        keys.forEach(key => {
          const arr = marks.get(key) || [];
          arr.push(entry);
          marks.set(key, arr);
          map.set(key, Math.max(map.get(key) || 0, item.count || 0));
        });
      });
    });
    return { recipes, map, marks };
  }

  function isHighlightRecipeSelected(recipeName) {
    const recipes = getActiveHighlightRecipes();
    return recipes.some(r => r.name_cn === recipeName || r.name_en === recipeName);
  }

  function renderIngQtyMarks(markList) {
    if (!markList || !markList.length) return '';
    return `<div class="ladder-ing-qty-marks">${markList.map(m =>
      `<span class="ladder-ing-qty-mark" style="color:${m.fg};border-color:${m.color};background:${m.bg}">×${m.count}</span>`
    ).join('')}</div>`;
  }

  function getOverlayEl(id) {
    if (typeof window !== 'undefined' && typeof window.resolveUniqueOverlay === 'function') {
      return window.resolveUniqueOverlay(id);
    }
    return (typeof document !== 'undefined' && document.getElementById) ? document.getElementById(id) : null;
  }

  function switchLadderRecipeCategory(cat) {
    if (cat !== 'curry' && cat !== 'salad' && cat !== 'dessert') return;
    ladderRecipeCategory = cat;
    renderLadderRecipeModalContent();
  }

  function renderLadderRecipeModalContent(modalEl) {
    const modal = modalEl || getOverlayEl('ladder-recipe-modal');
    if (!modal) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 1. 渲染三大料理分類切換列
    const catBarEl = modal.querySelector('.ladder-recipe-cat-bar');
    if (catBarEl) {
      const categories = [
        { id: 'curry', name: '咖哩、濃湯', name_en: 'Curry & Stew' },
        { id: 'salad', name: '沙拉', name_en: 'Salad' },
        { id: 'dessert', name: '點心、飲料', name_en: 'Dessert & Drinks' }
      ];
      catBarEl.innerHTML = categories.map(cat => {
        const isActive = (ladderRecipeCategory === cat.id);
        const label = isEN ? cat.name_en : cat.name;
        return `<button type="button" class="ladder-recipe-cat-btn ${isActive ? 'active' : ''}" onclick="window.WikiDB.switchLadderRecipeCategory('${cat.id}')">${label}</button>`;
      }).join('');
    }

    // 2. 渲染當前分類下前 7 頂級料理卡片
    const bodyEl = modal.querySelector('.ladder-recipe-modal-body');
    if (bodyEl) {
      const list = TOP_RECIPES_BY_CATEGORY[ladderRecipeCategory] || [];
      bodyEl.innerHTML = list.map((r, rIdx) => {
        const isCurrent = isHighlightRecipeSelected(r.name_cn);
        const displayName = isEN ? r.name_en : r.name_cn;
        return `
          <div class="ladder-recipe-card ${isCurrent ? 'selected' : ''}" onclick="window.WikiDB.selectLadderHighlightRecipe('${r.name_cn}')" role="button" tabindex="0">
            <div class="recipe-card-top">
              <span class="recipe-card-rank">${rIdx + 1}</span>
              <img src="${r.icon}" class="recipe-card-icon" alt="${displayName}">
              <div class="recipe-card-meta">
                <div class="recipe-card-name-row">
                  <span class="recipe-card-name">${displayName}</span>
                  <span class="recipe-card-cat-badge cat-${r.category}">${r.category}</span>
                  ${isCurrent ? `<span class="recipe-card-active-pill">${isEN ? 'Active' : '目前選取'}</span>` : ''}
                </div>
                <div class="recipe-card-energy-row">
                  <span class="recipe-card-energy-num">${r.base_energy.toLocaleString()}</span>
                  <span class="recipe-card-pot">${isEN ? `Pot ${r.pot_size}` : `鍋容量 ${r.pot_size}`}</span>
                </div>
              </div>
            </div>
            <div class="recipe-card-ings-row">
              ${r.ingredients.map(ing => {
                const ingDisplayName = isEN ? ((window.I18N && window.I18N.getIngredientName(ing.name)) || ing.name) : ing.name;
                return `
                  <span class="recipe-card-ing-chip" title="${ingDisplayName}">
                    <img src="${ing.icon}" class="recipe-card-ing-icon" alt="${ingDisplayName}">
                    <span class="ing-chip-count">×${ing.count}</span>
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  function openLadderRecipeModal() {
    const modal = getOverlayEl('ladder-recipe-modal');
    if (!modal) return;
    if (typeof window.portalMobileOverlays === 'function') {
      window.portalMobileOverlays(modal);
    } else if (typeof document !== 'undefined' && document.body && modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
    const firstSelected = getActiveHighlightRecipes()[0];
    if (firstSelected) {
      if (firstSelected.category === '咖哩') ladderRecipeCategory = 'curry';
      else if (firstSelected.category === '沙拉') ladderRecipeCategory = 'salad';
      else if (firstSelected.category === '甜點') ladderRecipeCategory = 'dessert';
    }
    const multiToggle = modal.querySelector('#ladder-recipe-multi-toggle');
    if (multiToggle) multiToggle.checked = !!ladderRecipeMultiSelect;
    renderLadderRecipeModalContent(modal);
    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
  }

  function closeLadderRecipeModal() {
    const modal = getOverlayEl('ladder-recipe-modal');
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    };
    if (modal && typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, done);
    } else {
      if (modal) modal.style.display = 'none';
      done();
    }
  }

  function openSkillDrawHelpModal(e) {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
      e.preventDefault();
    }
    const ladderPanel = document.getElementById('wiki-subpanel-ladder') || document.getElementById('panel-wiki') || document;
    const btn = (e && (e.currentTarget || e.target))
      || (ladderPanel && typeof ladderPanel.querySelector === 'function' ? ladderPanel.querySelector('.ladder-help-icon-btn') : (typeof document.querySelector === 'function' ? document.querySelector('.ladder-help-icon-btn') : null));
    const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function') ? window.I18N.getLanguage() : 'zh-TW';
    const isEN = lang === 'en-US';
    const isCN = lang === 'zh-CN';
    const title = isEN ? 'Specialty Trigger Multipliers' : (isCN ? '专长发动几率加成' : '專長發動機率加成');
    const body = isEN
      ? 'All specialties use a 1.0x trigger baseline.<br>Use Skill Trigger M/S and Skill Chance ▲ to simulate boosts.'
      : (isCN
        ? '所有专长皆以 1.0 倍发动几率作为基准。<br>请用技能几率M/S与技能几率▲模拟补正。'
        : '所有專長皆以 1.0 倍發動機率為基準。<br>請用技能機率M/S與技能機率▲模擬補正。');

    if (window.PokemonApp && typeof window.PokemonApp.toggleGlobalTooltip === 'function') {
      window.PokemonApp.toggleGlobalTooltip(btn, title, body);
    } else {
      const modal = document.getElementById('ladder-skill-help-modal');
      if (modal) {
        const isVisible = modal.style.display === 'block' || modal.style.display === 'flex';
        if (isVisible) {
          closeSkillDrawHelpModal();
        } else {
          modal.style.display = 'block';
        }
      }
    }
  }

  function closeSkillDrawHelpModal() {
    if (window.PokemonApp && typeof window.PokemonApp.hideGlobalTooltip === 'function') {
      window.PokemonApp.hideGlobalTooltip();
    }
    const modal = document.getElementById('ladder-skill-help-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function selectLadderHighlightRecipe(recipeName) {
    if (ladderRecipeMultiSelect) {
      const idx = ladderHighlightRecipes.indexOf(recipeName);
      if (idx >= 0) ladderHighlightRecipes.splice(idx, 1);
      else ladderHighlightRecipes.push(recipeName);
      ladderHighlightRecipe = ladderHighlightRecipes[0] || null;
      renderLadderRecipeModalContent();
      updateLadderRecipeFabState();
      refreshCoordinateLadder();
      return;
    }
    if (ladderHighlightRecipe === recipeName) {
      ladderHighlightRecipe = null;
      ladderHighlightRecipes = [];
    } else {
      ladderHighlightRecipe = recipeName;
      ladderHighlightRecipes = [recipeName];
    }
    closeLadderRecipeModal();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function toggleLadderRecipeMultiSelect(enabled) {
    const next = !!enabled;
    const current = getActiveHighlightRecipes().map(r => r.name_cn);
    ladderRecipeMultiSelect = next;
    if (next) {
      ladderHighlightRecipes = current.slice();
      ladderHighlightRecipe = ladderHighlightRecipes[0] || null;
    } else {
      ladderHighlightRecipe = current[0] || null;
      ladderHighlightRecipes = ladderHighlightRecipe ? [ladderHighlightRecipe] : [];
    }
    const toggle = document.getElementById('ladder-recipe-multi-toggle');
    if (toggle) toggle.checked = next;
    renderLadderRecipeModalContent();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function clearLadderHighlightRecipe() {
    ladderHighlightRecipe = null;
    ladderHighlightRecipes = [];
    closeLadderRecipeModal();
    updateLadderRecipeFabState();
    refreshCoordinateLadder();
  }

  function updateLadderRecipeFabState() {
    const fab = document.getElementById('ladder-recipe-highlight-fab');
    if (!fab) return;
    const badge = document.getElementById('ladder-recipe-fab-badge');
    const count = getActiveHighlightRecipes().length;
    if (count > 0) {
      fab.classList.add('has-active');
      if (badge) {
        badge.style.display = 'flex';
        badge.textContent = count > 1 ? String(count) : '✓';
      }
    } else {
      fab.classList.remove('has-active');
      if (badge) {
        badge.style.display = 'none';
        badge.textContent = '✓';
      }
    }
  }

  const EEVEELUTIONS_ALIASES = [
    '雷伊布', 'jolteon', '水伊布', 'vaporeon', '火伊布', 'flareon',
    '太陽伊布', 'espeon', '月亮伊布', 'umbreon', '葉伊布', 'leafeon',
    '冰伊布', 'glaceon', '仙子伊布', 'sylveon', '伊布家族', 'eevee'
  ];

  function matchesLadderSearch(pName, pNameEn, query) {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    const name = (pName || '').toLowerCase();
    const nameEn = (pNameEn || '').toLowerCase();
    if (name.includes(q) || nameEn.includes(q)) return true;
    if (name.includes('伊布家族') || nameEn.includes('eevee')) {
      if (EEVEELUTIONS_ALIASES.some(alias => alias.includes(q) || q.includes(alias))) {
        return true;
      }
    }
    return false;
  }

