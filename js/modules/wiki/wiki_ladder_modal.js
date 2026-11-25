  function getLadderDishIcon(dishName) {
    if (!dishName) return '';
    const found = ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === dishName || r.name_en === dishName);
    if (found && found.icon) return found.icon;
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__)) {
      const cacheFound = window.__RECIPES_CACHE__.find(r => r.name_cn === dishName || r.name_en === dishName);
      if (cacheFound && cacheFound.icon) return cacheFound.icon;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.allRecipes)) {
      const liveFound = window.allRecipes.find(r => r.name_cn === dishName || r.name_en === dishName);
      if (liveFound && liveFound.icon) return liveFound.icon;
    }
    return '';
  }

  // 全局前 10 高能量料理 (保留 TOP_7_RECIPES_HIGHLIGHT 命名以維持舊介面與單元測試相容性)
  const TOP_7_RECIPES_HIGHLIGHT = [];

  function _normalizeLadderRecipeCat(rawCat) {
    const s = String(rawCat || '').trim().toLowerCase();
    if (!s) return null;
    if (s === 'curry' || s === '咖哩' || s === '咖喱' || s.includes('curry') || s.includes('stew') || s.includes('咖哩') || s.includes('咖喱') || s.includes('濃湯') || s.includes('浓汤')) {
      return { key: 'curry', label: '咖哩' };
    }
    if (s === 'salad' || s === '沙拉' || s.includes('salad') || s.includes('沙拉')) {
      return { key: 'salad', label: '沙拉' };
    }
    if (s === 'dessert' || s === '甜點' || s === '甜点' || s === '點心' || s === '点心' || s.includes('dessert') || s.includes('drink') || s.includes('甜點') || s.includes('甜点') || s.includes('點心') || s.includes('飲料')) {
      return { key: 'dessert', label: '甜點' };
    }
    return null;
  }

  function _normalizeLadderRecipeEntry(r, catLabel) {
    const nameCn = r.name_cn || r.name || r.name_en || '';
    const nameEn = r.name_en || nameCn;
    const slug = nameEn.toLowerCase().replace(/[^a-z0-9]/g, '');
    const icon = r.icon || r.icon_url || (slug ? ('https://www.serebii.net/pokemonsleep/meals/' + slug + '.png') : '');
    const rawIngs = Array.isArray(r.ingredients) ? r.ingredients : [];
    const ingredients = rawIngs.map(ing => {
      if (!ing) return null;
      const ingName = ing.name || ing.name_cn || ing.name_en || '';
      const ingCount = Number(ing.count || ing.qty || 0);
      let ingIcon = ing.icon || '';
      if (!ingIcon && ingName && typeof CANONICAL_INGREDIENT_META !== 'undefined') {
        const meta = CANONICAL_INGREDIENT_META.find(m => m.name === ingName || m.enName === ingName);
        if (meta && meta.icon) ingIcon = meta.icon;
      }
      return { name: ingName, count: ingCount, icon: ingIcon };
    }).filter(Boolean);
    return {
      name_cn: nameCn,
      name_en: nameEn,
      category: catLabel,
      pot_size: Number(r.pot_size || 0),
      base_energy: Number(r.base_energy !== undefined ? r.base_energy : (r.energy || 0)),
      icon: icon,
      ingredients: ingredients
    };
  }

  function recomputeTopRecipesByCategory(recipesOverride) {
    const source = (Array.isArray(recipesOverride) && recipesOverride.length > 0)
      ? recipesOverride
      : (typeof _getLiveRecipesSourceForLadder === 'function' ? _getLiveRecipesSourceForLadder() : []);
    const fallbackMap = (typeof FALLBACK_TOP_RECIPES_BY_CATEGORY !== 'undefined' && FALLBACK_TOP_RECIPES_BY_CATEGORY)
      ? FALLBACK_TOP_RECIPES_BY_CATEGORY
      : TOP_RECIPES_BY_CATEGORY;
    const buckets = { curry: [], salad: [], dessert: [] };
    const seenPerCat = { curry: new Set(), salad: new Set(), dessert: new Set() };

    if (Array.isArray(source) && source.length > 0) {
      for (let i = 0; i < source.length; i++) {
        const r = source[i];
        if (!r) continue;
        const catInfo = _normalizeLadderRecipeCat(r.category || r.type);
        if (!catInfo) continue;
        const norm = _normalizeLadderRecipeEntry(r, catInfo.label);
        if (!norm.name_cn || seenPerCat[catInfo.key].has(norm.name_cn)) continue;
        seenPerCat[catInfo.key].add(norm.name_cn);
        buckets[catInfo.key].push(norm);
      }
    }

    ['curry', 'salad', 'dessert'].forEach(catKey => {
      const nextList = buckets[catKey].length > 0
        ? buckets[catKey]
            .slice()
            .sort((a, b) => (b.base_energy - a.base_energy) || (b.pot_size - a.pot_size))
            .slice(0, 10)
        : (fallbackMap[catKey] || []).slice(0, 10);
      TOP_RECIPES_BY_CATEGORY[catKey].splice(0, TOP_RECIPES_BY_CATEGORY[catKey].length, ...nextList);
    });

    const dedupedAll = [];
    const seenAll = new Set();
    const appendUnique = arr => {
      if (!Array.isArray(arr)) return;
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (!item || !item.name_cn || seenAll.has(item.name_cn)) continue;
        seenAll.add(item.name_cn);
        dedupedAll.push(item);
      }
    };
    appendUnique(TOP_RECIPES_BY_CATEGORY.curry);
    appendUnique(TOP_RECIPES_BY_CATEGORY.salad);
    appendUnique(TOP_RECIPES_BY_CATEGORY.dessert);
    if (typeof TAIL_FEATURED_RECIPES !== 'undefined') {
      appendUnique(TAIL_FEATURED_RECIPES);
    }
    ALL_TOP_CATEGORY_RECIPES.splice(0, ALL_TOP_CATEGORY_RECIPES.length, ...dedupedAll);

    const topHighlightPool = [
      ...TOP_RECIPES_BY_CATEGORY.curry,
      ...TOP_RECIPES_BY_CATEGORY.salad,
      ...TOP_RECIPES_BY_CATEGORY.dessert
    ].sort((a, b) => (b.base_energy - a.base_energy) || (b.pot_size - a.pot_size)).slice(0, 10);
    TOP_7_RECIPES_HIGHLIGHT.splice(0, TOP_7_RECIPES_HIGHLIGHT.length, ...topHighlightPool);
  }

  recomputeTopRecipesByCategory();

  let ladderRecipeCategory = 'curry';
  let ladderHighlightRecipe = null;
  let ladderRecipeMultiSelect = false;
  let ladderHighlightRecipes = [];

  const RECIPE_MARK_PALETTE = [
    { fg: '#0369a1', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' },  // 1. 晴空藍 (Sky Blue)
    { fg: '#92400e', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' },  // 2. 琥珀金黃 (Amber Gold)
    { fg: '#a21caf', color: '#e879f9', bg: 'rgba(232, 121, 249, 0.2)' }, // 3. 桃紅洋紅 (Fuchsia Magenta)
    { fg: '#065f46', color: '#34d399', bg: 'rgba(52, 211, 153, 0.2)' },  // 4. 翡翠綠 (Emerald Green)
    { fg: '#9a3412', color: '#fb923c', bg: 'rgba(251, 146, 60, 0.2)' },  // 5. 鮮亮橘 (Vivid Orange)
    { fg: '#6d28d9', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.2)' }, // 6. 魅惑紫 (Electric Violet)
    { fg: '#b91c1c', color: '#f87171', bg: 'rgba(248, 113, 113, 0.2)' }, // 7. 珊瑚紅 (Coral Red)
    { fg: '#115e59', color: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.2)' }   // 8. 湖水青綠 (Seafoam Teal)
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

    // 1. 渲染三大料理分類切換列
    const catBarEl = modal.querySelector('.ladder-recipe-cat-bar');
    if (catBarEl) {
      const categories = [
        { id: 'curry', key: 'wiki.ldr_cat_curry', fallback: '咖哩、濃湯' },
        { id: 'salad', key: 'wiki.ldr_cat_salad', fallback: '沙拉' },
        { id: 'dessert', key: 'wiki.ldr_cat_dessert', fallback: '點心、飲料' }
      ];
      catBarEl.innerHTML = categories.map(cat => {
        const isActive = (ladderRecipeCategory === cat.id);
        const label = window.I18N?.t?.(cat.key) ?? cat.fallback;
        return `<button type="button" class="ladder-recipe-cat-btn ${isActive ? 'active' : ''}" onclick="window.WikiDB.switchLadderRecipeCategory('${cat.id}')">${label}</button>`;
      }).join('');
    }

    // 2. 渲染當前分類下前 10 頂級料理卡片
    const bodyEl = modal.querySelector('.ladder-recipe-modal-body');
    if (bodyEl) {
      const list = TOP_RECIPES_BY_CATEGORY[ladderRecipeCategory] || [];
      bodyEl.innerHTML = list.map((r, rIdx) => {
        const isCurrent = isHighlightRecipeSelected(r.name_cn);
        const displayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getRecipeName === 'function')
          ? window.I18N.getRecipeName(r)
          : (window.I18N?.field?.(r, 'name') ?? (r.name_cn || r.name_en || ''));
        const catLabel = r.category === '咖哩'
          ? (window.I18N?.t?.('wiki.ldr_badge_curry') ?? '咖哩')
          : (r.category === '沙拉'
            ? (window.I18N?.t?.('wiki.ldr_badge_salad') ?? '沙拉')
            : (r.category === '甜點'
              ? (window.I18N?.t?.('wiki.ldr_badge_dessert') ?? '甜點')
              : (window.I18N?.text?.(r.category) ?? (r.category || ''))));
        const recipeIconUrl = (typeof window.mapExternalToLocalAsset === 'function' ? window.mapExternalToLocalAsset(r.icon) : r.icon) || r.icon;
        return `
          <div class="ladder-recipe-card ${isCurrent ? 'selected' : ''}" onclick="window.WikiDB.selectLadderHighlightRecipe('${r.name_cn}')" role="button" tabindex="0">
            <div class="recipe-card-top">
              <span class="recipe-card-rank">${rIdx + 1}</span>
              <img src="${recipeIconUrl}" class="recipe-card-icon" alt="${displayName}" onerror="this.style.opacity='0.3';">
              <div class="recipe-card-meta">
                <div class="recipe-card-name-row">
                  <span class="recipe-card-name">${displayName}</span>
                  <span class="recipe-card-cat-badge cat-${r.category}">${catLabel}</span>
                  ${isCurrent ? `<span class="recipe-card-active-pill">${window.I18N?.t?.('wiki.ldr_active') ?? '目前選取'}</span>` : ''}
                </div>
                <div class="recipe-card-energy-row">
                  <span class="recipe-card-energy-num">${r.base_energy.toLocaleString()}</span>
                  <span class="recipe-card-pot">${window.I18N?.t?.('wiki.ldr_pot_size', { size: r.pot_size }) ?? `鍋容量 ${r.pot_size}`}</span>
                </div>
              </div>
            </div>
            <div class="recipe-card-ings-row">
              ${r.ingredients.map(ing => {
                const ingDisplayName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getIngredientName === 'function')
                  ? (window.I18N.getIngredientName(ing.name) || (window.I18N?.text?.(ing.name) ?? ing.name))
                  : (window.I18N?.text?.(ing.name) ?? ing.name);
                const ingIconUrl = (typeof window.mapExternalToLocalAsset === 'function' ? window.mapExternalToLocalAsset(ing.icon) : ing.icon) || ing.icon;
                return `
                  <span class="recipe-card-ing-chip" title="${ingDisplayName}">
                    <img src="${ingIconUrl}" class="recipe-card-ing-icon" alt="${ingDisplayName}" onerror="this.style.display='none';">
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
    const title = window.I18N?.t?.('wiki.ldr_skill_draw_help_title') ?? '專長發動機率加成';
    const body = window.I18N?.t?.('wiki.ldr_skill_draw_help_body') ?? '所有專長皆以 1.0 倍發動機率為基準。<br>請用技能機率M/S與技能機率▲模擬補正。';

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

