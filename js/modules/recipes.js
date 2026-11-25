/**
 * recipes.js — Pokémon Sleep 料理食譜大全
 * 功能：篩選、排序、等級滑桿、島嶼加成、活動加成、漂亮成功分數、食材庫存反查、填鍋最佳化、localStorage 記憶
 */
(function () {
  'use strict';

  const RECIPE_CATEGORY_KEYS = {
    ALL: 'recipes.ui_cat_all',
    '咖哩': 'recipes.ui_cat_curry',
    '沙拉': 'recipes.ui_cat_salad',
    '甜點': 'recipes.ui_cat_dessert'
  };

  function _getRecipeCategoryLabel(cat) {
    const key = RECIPE_CATEGORY_KEYS[cat];
    if (key) {
      return window.I18N?.t?.(key) ?? (cat === 'ALL' ? '全部' : cat);
    }
    return window.I18N?.text?.(cat) ?? (cat || '');
  }

  function isRecipesHealthy(data) {
    try {
      if (!Array.isArray(data) || data.length < 78) return false;
      const hasOwn = Object.prototype.hasOwnProperty;
      for (let i = 0; i < data.length; i++) {
        if (!hasOwn.call(data, i)) return false;
        const r = data[i];
        if (!r || typeof r !== 'object') return false;

        let name = null;
        if (hasOwn.call(r, 'name_cn') && typeof r.name_cn === 'string' && r.name_cn.trim()) {
          name = r.name_cn;
        } else if (hasOwn.call(r, 'name') && typeof r.name === 'string' && r.name.trim()) {
          name = r.name;
        } else {
          return false;
        }

        if (!hasOwn.call(r, 'category') || typeof r.category !== 'string' || !r.category.trim()) return false;

        let energy = null;
        if (hasOwn.call(r, 'base_energy') && typeof r.base_energy !== 'undefined') energy = r.base_energy;
        else if (hasOwn.call(r, 'energy')) energy = r.energy;
        else return false;
        if (typeof energy !== 'number' || !Number.isFinite(energy) || energy <= 0) return false;

        if (!hasOwn.call(r, 'ingredients') || !Array.isArray(r.ingredients) || r.ingredients.length === 0) return false;

        for (let j = 0; j < r.ingredients.length; j++) {
          if (!hasOwn.call(r.ingredients, j)) return false;
          const ing = r.ingredients[j];
          if (!ing || typeof ing !== 'object') return false;
          if (!hasOwn.call(ing, 'name') || typeof ing.name !== 'string' || !ing.name.trim()) return false;
          if (!hasOwn.call(ing, 'count') || typeof ing.count !== 'number' || !Number.isFinite(ing.count) || ing.count <= 0) return false;
        }

        // 防護 Serebii 官網表格漏植「彈跳咖哩烏龍麵 (Bounce Curry Udon)」之火辣香草 x22 (正確為 4 種食材、鍋容量 112)
        if ((r.name_en === 'Bounce Curry Udon' || name === '彈跳咖哩烏龍麵') && (r.ingredients.length < 4 || (typeof r.pot_size === 'number' && r.pot_size !== 112))) {
          return false;
        }
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  if (typeof window !== 'undefined') {
    window.isRecipesHealthy = isRecipesHealthy;
    if (!window.RecipesApp) window.RecipesApp = {};
    window.RecipesApp.isRecipesHealthy = isRecipesHealthy;
  }
  if (typeof global !== 'undefined') global.isRecipesHealthy = isRecipesHealthy;

  function initRecipesModule() {

  /* ─── 狀態變數 ──────────────────────────────────────── */
  let allRecipes          = [];
  let selectedCategory    = 'ALL';
  let selectedIngredients = new Set();
  let excludedIngredients = new Set();
  let matchMode           = 'any';
  let currentSearch       = '';
  let sortOption          = 'energy-desc';
  let viewMode            = 'table';
  let minBonus            = 0;
  let minPot              = 0;
  let recipeLevel         = 1;
  let islandBonus         = 0;
  let eventBonus          = 1.0;
  let potExpansion        = 0;
  let showTasty           = false;
  let filterCookableOnly  = false;
  let potCapacity         = 57;
  let campTicketActive    = false;
  let sundayExpansionActive = false;
  let pantryInventory     = {};

  /* ─── 20 種官方食材基礎能量庫 ──────────────────────────── */
  const INGREDIENTS_ENERGY_MAP = {
    '特選蘋果': 90, 'Fancy Apple': 90, '哞哞鮮奶': 98, 'Moomoo Milk': 98,
    '萌綠大豆': 100, 'Greengrass Soybeans': 100, '甜甜蜜': 101, 'Honey': 101,
    '豆製肉': 103, 'Bean Sausage': 103, '暖暖薑': 109, 'Warming Ginger': 109,
    '好眠番茄': 110, 'Snoozy Tomato': 110, '一口堅果': 112, 'Snackable Nuts': 112,
    '特選蛋': 115, 'Fancy Egg': 115, '純粹油': 121, 'Pure Oil': 121,
    '窩心洋芋': 124, 'Soft Potato': 124, '火辣香草': 130, 'Fiery Herb': 130,
    '萌綠玉米': 140, 'Greengrass Corn': 140, '放鬆可可': 151, 'Soothing Cacao': 151,
    '醒腦咖啡豆': 153, 'Rousing Coffee': 153, '嫩亮酪梨': 162, 'Glossy Avocado': 162,
    '品鮮蘑菇': 167, 'Tasty Mushroom': 167, '粗枝大蔥': 185, 'Large Leek': 185,
    '沉甸甸南瓜': 250, 'Plump Pumpkin': 250, '美味尾巴': 342, 'Slowpoke Tail': 342
  };

  const _FALLBACK_CANONICAL_INGREDIENTS = [
    '特選蘋果', '哞哞鮮奶', '萌綠大豆', '甜甜蜜', '豆製肉',
    '暖暖薑', '好眠番茄', '一口堅果', '特選蛋', '純粹油', '窩心洋芋',
    '火辣香草', '萌綠玉米', '放鬆可可', '醒腦咖啡豆', '嫩亮酪梨',
    '品鮮蘑菇', '粗枝大蔥', '沉甸甸南瓜', '美味尾巴'
  ];

  function _getRecipesGameConfig() {
    return (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) || (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  }

  function _getRecipesCanonicalIngredients() {
    const gc = _getRecipesGameConfig();
    if (gc && Array.isArray(gc.CANONICAL_INGREDIENTS) && gc.CANONICAL_INGREDIENTS.length > 0) {
      return gc.CANONICAL_INGREDIENTS.map(item => item.name);
    }
    return _FALLBACK_CANONICAL_INGREDIENTS.slice();
  }

  function _sortRecipesIngredientsByEnergyAsc(list) {
    if (!Array.isArray(list)) return [];
    const gc = _getRecipesGameConfig();
    if (gc && typeof gc.sortIngredientsByEnergyAsc === 'function') {
      return gc.sortIngredientsByEnergyAsc(list);
    }
    const orderMap = Object.create(null);
    _FALLBACK_CANONICAL_INGREDIENTS.forEach((name, idx) => { orderMap[name] = idx; });
    return list
      .map((item, idx) => ({ item, idx }))
      .sort((a, b) => {
        const ka = typeof a.item === 'string' ? a.item : (a.item && (a.item.name || a.item.id));
        const kb = typeof b.item === 'string' ? b.item : (b.item && (b.item.name || b.item.id));
        const ra = Object.prototype.hasOwnProperty.call(orderMap, ka) ? orderMap[ka] : Number.MAX_SAFE_INTEGER;
        const rb = Object.prototype.hasOwnProperty.call(orderMap, kb) ? orderMap[kb] : Number.MAX_SAFE_INTEGER;
        if (ra !== rb) return ra - rb;
        const ea = Object.prototype.hasOwnProperty.call(INGREDIENTS_ENERGY_MAP, ka) ? INGREDIENTS_ENERGY_MAP[ka] : Number.MAX_SAFE_INTEGER;
        const eb = Object.prototype.hasOwnProperty.call(INGREDIENTS_ENERGY_MAP, kb) ? INGREDIENTS_ENERGY_MAP[kb] : Number.MAX_SAFE_INTEGER;
        return ea !== eb ? ea - eb : a.idx - b.idx;
      })
      .map(x => x.item);
  }

  const CANONICAL_INGREDIENTS = _getRecipesCanonicalIngredients();

  const FILLER_RECOMMENDED_ORDER = [
    { name: '美味尾巴', enName: 'Slowpoke Tail', energy: 342 },
    { name: '沉甸甸南瓜', enName: 'Plump Pumpkin', energy: 250 },
    { name: '粗枝大蔥', enName: 'Large Leek', energy: 185 },
    { name: '品鮮蘑菇', enName: 'Tasty Mushroom', energy: 167 },
    { name: '嫩亮酪梨', enName: 'Glossy Avocado', energy: 162 },
    { name: '醒腦咖啡豆', enName: 'Rousing Coffee', energy: 153 },
    { name: '放鬆可可', enName: 'Soothing Cacao', energy: 151 },
    { name: '萌綠玉米', enName: 'Greengrass Corn', energy: 140 },
    { name: '火辣香草', enName: 'Fiery Herb', energy: 130 },
    { name: '窩心洋芋', enName: 'Soft Potato', energy: 124 },
    { name: '純粹油', enName: 'Pure Oil', energy: 121 },
    { name: '特選蛋', enName: 'Fancy Egg', energy: 115 },
    { name: '一口堅果', enName: 'Snackable Nuts', energy: 112 },
    { name: '好眠番茄', enName: 'Snoozy Tomato', energy: 110 },
    { name: '暖暖薑', enName: 'Warming Ginger', energy: 109 },
    { name: '豆製肉', enName: 'Bean Sausage', energy: 103 },
    { name: '甜甜蜜', enName: 'Honey', energy: 101 },
    { name: '萌綠大豆', enName: 'Greengrass Soybeans', energy: 100 },
    { name: '哞哞鮮奶', enName: 'Moomoo Milk', energy: 98 },
    { name: '特選蘋果', enName: 'Fancy Apple', energy: 90 }
  ];

  /* ─── 食材庫存管理 ──────────────────────────────────── */
  const PANTRY_LS_KEY = 'pksleep_pantry_v1';

  function loadPantry() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(PANTRY_LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            const clean = {};
            for (const [k, v] of Object.entries(parsed)) {
              const num = parseInt(v, 10);
              if (!isNaN(num) && num > 0) clean[k] = num;
            }
            return clean;
          }
        }
      }
    } catch (e) {}
    return {};
  }

  function savePantry() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PANTRY_LS_KEY, JSON.stringify(pantryInventory));
      }
    } catch (e) {}
  }

  function getPantry() {
    return Object.assign({}, pantryInventory);
  }

  function setPantryIngredient(name, quantity) {
    if (!name || typeof name !== 'string') return;
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    if (qty > 0) pantryInventory[name] = qty;
    else delete pantryInventory[name];
    savePantry();
    if (typeof syncPantryUI === 'function') syncPantryUI();
    if (typeof render === 'function') render();
  }

  function clearPantry() {
    pantryInventory = {};
    savePantry();
    if (typeof syncPantryUI === 'function') syncPantryUI();
    if (typeof render === 'function') render();
  }

  function calculateRecipeMissingCount(recipe, pantry = pantryInventory) {
    if (!recipe || typeof recipe !== 'object') return 0;
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    let missing = 0;
    for (let i = 0; i < ings.length; i++) {
      const req = ings[i];
      if (!req || typeof req !== 'object') continue;
      const onHand = (pantry && typeof pantry[req.name] === 'number') ? pantry[req.name] : (pantry && pantry[req.name] ? parseInt(pantry[req.name], 10) || 0 : 0);
      const count = (typeof req.count === 'number' && Number.isFinite(req.count)) ? req.count : 0;
      missing += Math.max(0, count - onHand);
    }
    return missing;
  }

  function getRecipeMissingDetails(recipe, pantry = pantryInventory) {
    if (!recipe || typeof recipe !== 'object') return { missingCount: 0, missingItems: [], isCookable: true };
    const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    let missingCount = 0;
    const missingItems = [];
    for (let i = 0; i < ings.length; i++) {
      const req = ings[i];
      if (!req || typeof req !== 'object') continue;
      const onHand = (pantry && typeof pantry[req.name] === 'number') ? pantry[req.name] : (pantry && pantry[req.name] ? parseInt(pantry[req.name], 10) || 0 : 0);
      const count = (typeof req.count === 'number' && Number.isFinite(req.count)) ? req.count : 0;
      const diff = Math.max(0, count - onHand);
      if (diff > 0) {
        missingCount += diff;
        missingItems.push({ name: req.name, icon: req.icon || '', required: count, onHand: onHand, missing: diff });
      }
    }
    return { missingCount, missingItems, isCookable: missingCount === 0 };
  }

  /* ─── 鍋子容量與填鍋最佳化計算 ───────────────────────────── */
  function getEffectivePotCapacity(base = potCapacity, camp = campTicketActive, sunday = sundayExpansionActive) {
    let eff = Math.max(15, Math.min(200, Number(base) || 57));
    if (camp) eff = Math.floor(eff * 1.5);
    if (sunday) eff = eff * 2;
    return eff;
  }

  function getRecommendedFillers(recipe, effectivePotSize, fromPantryOnly = false, pantry = pantryInventory) {
    if (!recipe || typeof recipe !== 'object') return { fillerSlots: 0, remainingSlots: 0, recommendations: [], totalFillerEnergy: 0 };
    const reqPot = Number(recipe.pot_size) || 0;
    const effPot = Math.max(reqPot, Number(effectivePotSize) || getEffectivePotCapacity());
    const fillerSlots = Math.max(0, effPot - reqPot);
    if (fillerSlots === 0) return { fillerSlots: 0, remainingSlots: 0, recommendations: [], totalFillerEnergy: 0 };

    const recs = [];
    let remainingSlots = fillerSlots, totalFillerEnergy = 0;

    if (fromPantryOnly) {
      const reqMap = {};
      (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).forEach(i => {
        if (i && i.name) reqMap[i.name] = (reqMap[i.name] || 0) + (Number(i.count) || 0);
      });
      for (let i = 0; i < FILLER_RECOMMENDED_ORDER.length && remainingSlots > 0; i++) {
        const ing = FILLER_RECOMMENDED_ORDER[i];
        const onHand = (pantry && pantry[ing.name]) ? Math.max(0, Number(pantry[ing.name]) || 0) : 0;
        const available = Math.max(0, onHand - (reqMap[ing.name] || 0));
        if (available > 0) {
          const alloc = Math.min(available, remainingSlots);
          const energy = alloc * ing.energy;
          recs.push({ name: ing.name, enName: ing.enName, count: alloc, unitEnergy: ing.energy, totalEnergy: energy });
          totalFillerEnergy += energy;
          remainingSlots -= alloc;
        }
      }
    } else {
      const topIng = FILLER_RECOMMENDED_ORDER[0];
      const energy = remainingSlots * topIng.energy;
      recs.push({ name: topIng.name, enName: topIng.enName, count: remainingSlots, unitEnergy: topIng.energy, totalEnergy: energy });
      totalFillerEnergy += energy;
      remainingSlots = 0;
    }
    return { fillerSlots, remainingSlots, recommendations: recs, totalFillerEnergy };
  }

  function calculateMealEnergyWithFillers(recipe, fillerMapOrEnergy, level = recipeLevel, islandBonusPct = islandBonus, eventMult = eventBonus) {
    if (!recipe || typeof recipe !== 'object') return 0;
    const baseEnergy = Number(recipe.base_energy) || 0;
    const lvBonus = getLevelBonus(level);
    const recipeBaseWithLv = baseEnergy * (1 + lvBonus / 100);

    let fillerBaseEnergy = 0;
    if (typeof fillerMapOrEnergy === 'number') {
      fillerBaseEnergy = Math.max(0, fillerMapOrEnergy);
    } else if (fillerMapOrEnergy && typeof fillerMapOrEnergy === 'object') {
      const gc = _getRecipesGameConfig();
      for (const [ingName, count] of Object.entries(fillerMapOrEnergy)) {
        const c = Math.max(0, Number(count) || 0);
        const unitE = (gc && typeof gc.getIngredientBaseEnergy === 'function' ? gc.getIngredientBaseEnergy(ingName) : null) || INGREDIENTS_ENERGY_MAP[ingName] || 100;
        fillerBaseEnergy += c * unitE;
      }
    }
    const subtotal = recipeBaseWithLv + fillerBaseEnergy;
    const islandMult = 1 + (islandBonusPct / 100);
    return Math.round(subtotal * islandMult * eventMult);
  }

  const _RECIPES_FALLBACK_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  function _getRecipesGameCaps() {
    const gc = _getRecipesGameConfig();
    return (gc && typeof gc.getCaps === 'function' ? gc.getCaps() : null) || _RECIPES_FALLBACK_CAPS;
  }

  const LEVEL_BONUS_TABLE = {
     1:   0,  2:   2,  3:   4,  4:   6,  5:   8,  6:   9,  7:  11,  8:  13,  9:  16, 10:  18,
    11:  19, 12:  21, 13:  23, 14:  24, 15:  26, 16:  28, 17:  30, 18:  31, 19:  33, 20:  35,
    21:  37, 22:  40, 23:  42, 24:  45, 25:  47, 26:  50, 27:  52, 28:  55, 29:  58, 30:  61,
    31:  64, 32:  67, 33:  70, 34:  74, 35:  77, 36:  81, 37:  84, 38:  88, 39:  92, 40:  96,
    41: 100, 42: 104, 43: 108, 44: 113, 45: 117, 46: 122, 47: 127, 48: 132, 49: 137, 50: 142,
    51: 148, 52: 153, 53: 159, 54: 165, 55: 171, 56: 177, 57: 183, 58: 190, 59: 197, 60: 203,
    61: 209, 62: 215, 63: 221, 64: 227, 65: 234, 66: 239, 67: 243, 68: 248, 69: 252, 70: 258
  };

  function getLevelBonus(lv) {
    const gc = _getRecipesGameConfig(), caps = _getRecipesGameCaps(), recipeCap = caps.RECIPE_LEVEL_CAP || 70;
    if (gc && typeof gc.getRecipeLevelBonus === 'function') return gc.getRecipeLevelBonus(lv, recipeCap);
    const clampedLv = Math.min(Math.max(parseInt(lv, 10) || 1, 1), recipeCap);
    if (Object.prototype.hasOwnProperty.call(LEVEL_BONUS_TABLE, clampedLv)) return LEVEL_BONUS_TABLE[clampedLv];
    return clampedLv > 70 ? 258 + (clampedLv - 70) * (258 - 252) : 0;
  }

  const LS_KEY = 'pksleep_recipe_prefs_v3';

  function loadPrefs() {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      const caps = _getRecipesGameCaps();
      selectedCategory = saved.selectedCategory || 'ALL';
      minBonus         = Number(saved.minBonus) || 0;
      minPot           = Number(saved.minPot)   || 0;
      recipeLevel      = Math.min(Math.max(Number(saved.recipeLevel) || 1, 1), caps.RECIPE_LEVEL_CAP || 70);
      islandBonus      = Math.min(Math.max(Number(saved.islandBonus) || 0, 0), caps.ISLAND_BONUS_CAP !== undefined ? caps.ISLAND_BONUS_CAP : _RECIPES_FALLBACK_CAPS.ISLAND_BONUS_CAP);
      eventBonus       = saved.eventBonus !== undefined ? Math.min(1.5, Math.max(1.0, Number(saved.eventBonus))) : 1.0;
      potExpansion     = Number(saved.potExpansion) || 0;
      showTasty        = Boolean(saved.showTasty);
      sortOption       = saved.sortOption || 'energy-desc';
      viewMode         = saved.viewMode || 'table';
      matchMode        = saved.matchMode || 'any';
      filterCookableOnly = Boolean(saved.filterCookableOnly);
      potCapacity      = Math.max(15, Math.min(200, Number(saved.potCapacity) || 57));
      campTicketActive = Boolean(saved.campTicketActive);
      sundayExpansionActive = Boolean(saved.sundayExpansionActive);
      selectedIngredients = new Set(saved.selectedIngredients || []);
      excludedIngredients = new Set(saved.excludedIngredients || []);
      pantryInventory  = loadPantry();
    } catch (e) {}
  }

  function savePrefs() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        selectedCategory, minBonus, minPot, recipeLevel, islandBonus, eventBonus,
        potExpansion, showTasty, sortOption, viewMode, matchMode, filterCookableOnly,
        potCapacity, campTicketActive, sundayExpansionActive,
        selectedIngredients: [...selectedIngredients], excludedIngredients: [...excludedIngredients]
      }));
    } catch (e) {}
  }

  /* ─── DOM 元素與滑桿控制 ──────────────────────────────── */
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
  const recipeSearchClear    = document.getElementById('recipe-search-clear');

  function updateSliderFill(slider, min, max) {
    if (!slider) return;
    slider.style.setProperty('--slider-fill', (((slider.value - min) / (max - min)) * 100) + '%');
  }

  function syncLevelUI() {
    if (!levelSlider || !levelBadge) return;
    const recipeCap = (_getRecipesGameCaps().RECIPE_LEVEL_CAP || 70);
    levelSlider.min = '1'; levelSlider.max = String(recipeCap);
    const maxLabel = document.getElementById('recipe-level-max-label');
    if (maxLabel) maxLabel.textContent = `Lv.${recipeCap}`;
    recipeLevel = Math.min(Math.max(recipeLevel, 1), recipeCap);
    levelSlider.value = recipeLevel;
    levelBadge.textContent = `Lv.${recipeLevel}  +${getLevelBonus(recipeLevel)}%`;
    updateSliderFill(levelSlider, 1, recipeCap);
  }

  function syncIslandUI() {
    if (!islandSlider || !islandBadge) return;
    const caps = _getRecipesGameCaps(), islandCap = (caps.ISLAND_BONUS_CAP !== undefined ? caps.ISLAND_BONUS_CAP : _RECIPES_FALLBACK_CAPS.ISLAND_BONUS_CAP);
    islandSlider.min = '0'; islandSlider.max = String(islandCap); islandSlider.step = String(caps.ISLAND_BONUS_STEP || 5);
    const maxLabel = document.getElementById('island-bonus-max-label');
    if (maxLabel) maxLabel.textContent = `${islandCap}%`;
    islandBonus = Math.min(Math.max(islandBonus, 0), islandCap);
    islandSlider.value = islandBonus;
    islandBadge.textContent = `+${islandBonus}% (×${(1 + islandBonus / 100).toFixed(2)})`;
    updateSliderFill(islandSlider, 0, islandCap);
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
    potExpansionBadge.textContent = potExpansion === 0 ? (window.I18N?.t?.('recipes.ui_pot_expansion_none') ?? '+0 (無追加)') : `+${potExpansion} (+${(potExpansion * 100).toLocaleString()})`;
    updateSliderFill(potExpansionSlider, 0, 700);
  }

  function syncTastyUI() {
    if (!tastyToggleBtn) return;
    if (tastyToggleBtn.type === 'checkbox') tastyToggleBtn.checked = showTasty;
    else {
      tastyToggleBtn.classList.toggle('active', showTasty);
      tastyToggleBtn.setAttribute('aria-checked', String(showTasty));
    }
  }

  function setupCustomSelect(selectElement) {
    if (typeof window !== 'undefined' && window.CustomSelect && typeof window.CustomSelect.setup === 'function') {
      return window.CustomSelect.setup(selectElement);
    }
    if (!selectElement || selectElement._customized || !selectElement.parentNode) return;
    selectElement._customized = true;
    selectElement.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'custom-select-container' + (selectElement.classList.contains('sort-select') ? ' custom-select-sort' : ' custom-select-rf');

    const triggerBtn = document.createElement('button');
    triggerBtn.type = 'button'; triggerBtn.className = 'custom-select-trigger';
    triggerBtn.setAttribute('aria-haspopup', 'listbox'); triggerBtn.setAttribute('aria-expanded', 'false');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'custom-select-label';
    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'custom-select-arrow';
    arrowSpan.innerHTML = `<svg viewBox="0 0 12 8" width="7" height="4.5"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;

    triggerBtn.appendChild(labelSpan); triggerBtn.appendChild(arrowSpan);
    const menuDiv = document.createElement('div');
    menuDiv.className = 'custom-select-menu'; menuDiv.setAttribute('role', 'listbox');

    function syncUI() {
      const options = selectElement.options ? Array.from(selectElement.options) : [];
      const selected = (selectElement.selectedIndex >= 0 && options[selectElement.selectedIndex]) || options[0] || null;
      labelSpan.textContent = selected ? selected.text : '';
      menuDiv.innerHTML = '';
      options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'custom-select-item' + (opt.value === selectElement.value ? ' active' : '');
        item.setAttribute('role', 'option'); item.setAttribute('data-value', opt.value);
        item.innerHTML = `<div class="custom-select-item-content"><span class="custom-select-item-text">${opt.text}</span></div>`;
        item.addEventListener('click', (e) => {
          e.stopPropagation(); selectElement.value = opt.value;
          container.classList.remove('open'); triggerBtn.setAttribute('aria-expanded', 'false');
          syncUI(); selectElement.dispatchEvent(new Event('change', { bubbles: true }));
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
      if (!isOpen) { container.classList.add('open'); triggerBtn.setAttribute('aria-expanded', 'true'); }
    });

    selectElement.addEventListener('sync-ui', syncUI);
    container.appendChild(triggerBtn); container.appendChild(menuDiv);
    if (selectElement.parentNode) selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
  }

  window.setupCustomSelect = setupCustomSelect;

  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-container.open').forEach(c => {
      c.classList.remove('open');
      const btn = c.querySelector('.custom-select-trigger');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.custom-select-container.open').forEach(c => {
        c.classList.remove('open');
        const btn = c.querySelector('.custom-select-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }
  });

  function initSelectFilters() {
    if (bonusSelect) {
      bonusSelect.value = minBonus;
      setupCustomSelect(bonusSelect);
      bonusSelect.addEventListener('change', () => { minBonus = Number(bonusSelect.value); savePrefs(); render(); });
    }
    if (potSelect) {
      potSelect.value = minPot;
      setupCustomSelect(potSelect);
      potSelect.addEventListener('change', () => { minPot = Number(potSelect.value); savePrefs(); render(); });
    }
  }

  function initSliders() {
    if (levelSlider) {
      syncLevelUI();
      levelSlider.addEventListener('input', () => {
        const caps = _getRecipesGameCaps(), parsed = parseInt(levelSlider.value, 10);
        recipeLevel = Math.min(Math.max(isNaN(parsed) ? 1 : parsed, 1), caps.RECIPE_LEVEL_CAP || 70);
        syncLevelUI(); savePrefs(); render();
      });
    }
    if (islandSlider) {
      syncIslandUI();
      islandSlider.addEventListener('input', () => {
        const caps = _getRecipesGameCaps(), parsed = parseInt(islandSlider.value, 10);
        islandBonus = Math.min(Math.max(isNaN(parsed) ? 0 : parsed, 0), caps.ISLAND_BONUS_CAP !== undefined ? caps.ISLAND_BONUS_CAP : _RECIPES_FALLBACK_CAPS.ISLAND_BONUS_CAP);
        syncIslandUI(); savePrefs(); render();
      });
    }
    if (eventSlider) {
      syncEventUI();
      eventSlider.addEventListener('input', () => {
        eventBonus = parseFloat(eventSlider.value);
        syncEventUI(); savePrefs(); render();
      });
    }
    if (potExpansionSlider) {
      syncPotExpansionUI();
      potExpansionSlider.addEventListener('input', () => {
        potExpansion = parseInt(potExpansionSlider.value, 10) || 0;
        syncPotExpansionUI(); savePrefs(); render();
      });
    }
  }

  function initTastyToggle() {
    if (!tastyToggleBtn) return;
    syncTastyUI();
    tastyToggleBtn.addEventListener(tastyToggleBtn.type === 'checkbox' ? 'change' : 'click', () => {
      showTasty = tastyToggleBtn.type === 'checkbox' ? tastyToggleBtn.checked : !showTasty;
      syncTastyUI(); savePrefs(); render();
    });
  }

  /* ─── 載入 recipes.json 與動態同步 ─────────────────────── */
  loadPrefs();

  const CACHE_KEY_RECIPES_JSON = 'pksleep_cache_recipes_json';
  const CACHE_KEY_RECIPES_JSON_TIME = 'pksleep_cache_recipes_json_time';

  const fetchRecipesWithFallback = async (...customUrls) => {
    try {
      if (typeof window !== 'undefined') {
        let cachedData = null;
        if (window.DataCacheManager && typeof window.DataCacheManager.getCachedJsonAsync === 'function') {
          cachedData = await window.DataCacheManager.getCachedJsonAsync(CACHE_KEY_RECIPES_JSON);
        } else if (window.localStorage) {
          const cachedText = window.localStorage.getItem(CACHE_KEY_RECIPES_JSON);
          if (cachedText) cachedData = JSON.parse(cachedText);
        }
        if (Array.isArray(cachedData) && cachedData.length > 0) {
          if (isRecipesHealthy(cachedData)) return cachedData;
          if (window.DataCacheManager && typeof window.DataCacheManager.invalidateCache === 'function') {
            window.DataCacheManager.invalidateCache(CACHE_KEY_RECIPES_JSON, 'recipes.json');
          }
        }
      }
    } catch (cacheReadErr) {}

    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    const defaultCandidates = [
      `${base}data/recipes.json`, `data/recipes.json`, `../data/recipes.json`,
      `${base}recipes.json`, `recipes.json`, `../recipes.json`,
      `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json`
    ];
    const rawUrls = customUrls.length > 0 ? customUrls : defaultCandidates;
    const cleanUrls = Array.from(new Set(rawUrls.filter(Boolean).map(u => u.split('?')[0])));
    let lastErr = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      const uniqueUrls = attempt === 1 ? cleanUrls : cleanUrls.map(u => `${u}?t=${Date.now()}`);
      for (const url of uniqueUrls) {
        try {
          const res = await fetch(url, { cache: attempt === 1 ? 'no-cache' : 'no-store' });
          if (res && res.ok) {
            const text = await res.text(), parsed = JSON.parse(text);
            if (!isRecipesHealthy(parsed)) continue;
            try {
              if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(CACHE_KEY_RECIPES_JSON, text);
                window.localStorage.setItem(CACHE_KEY_RECIPES_JSON_TIME, String(Date.now()));
              }
              if (typeof window !== 'undefined' && window.DataCacheManager) {
                window.DataCacheManager.saveCachedJson(CACHE_KEY_RECIPES_JSON, 'recipes.json', parsed);
              }
            } catch (e) {}
            return parsed;
          }
        } catch (e) { lastErr = e; }
      }
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 600));
    }

    try {
      if (typeof window !== 'undefined') {
        const cachedText = window.localStorage && window.localStorage.getItem(CACHE_KEY_RECIPES_JSON);
        if (cachedText) {
          const cachedData = JSON.parse(cachedText);
          if (Array.isArray(cachedData) && cachedData.length > 0) return cachedData;
        }
      }
    } catch (cacheErr) {}

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
          if (!check.needsUpdate && Array.isArray(allRecipes) && allRecipes.length >= 78) return;
          remoteHash = check.remoteHash || '';
        }

        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
        const syncCandidates = [
          `${base}data/recipes.json?v=${remoteHash || Date.now()}`,
          `data/recipes.json?v=${remoteHash || Date.now()}`,
          `../data/recipes.json?v=${remoteHash || Date.now()}`,
          `${base}recipes.json?v=${remoteHash || Date.now()}`,
          `recipes.json?v=${remoteHash || Date.now()}`,
          `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json?t=${Date.now()}`
        ];
        let res = null, rawText = '', freshData = null;

        for (const url of Array.from(new Set(syncCandidates))) {
          try {
            const r = await fetch(url, { cache: 'no-cache' });
            if (r && r.ok) {
              const txt = await r.text(), json = JSON.parse(txt);
              if (isRecipesHealthy(json)) { res = r; rawText = txt; freshData = json; break; }
            }
          } catch (e) {}
        }

        if (!res || !freshData) return;
        if (window.DataCacheManager) window.DataCacheManager.saveCachedJson(CACHE_KEY_RECIPES_JSON, 'recipes.json', rawText, remoteHash);
        else if (window.localStorage) {
          try {
            window.localStorage.setItem(CACHE_KEY_RECIPES_JSON, rawText);
            window.localStorage.setItem(CACHE_KEY_RECIPES_JSON_TIME, String(Date.now()));
          } catch (e) {}
        }

        const currentLen = Array.isArray(allRecipes) ? allRecipes.length : 0;
        let isDifferent = true;
        if (currentLen === freshData.length && currentLen > 0) {
          try { isDifferent = JSON.stringify(freshData) !== JSON.stringify(allRecipes); } catch (e) { isDifferent = true; }
        }

        if (isDifferent || !currentLen) {
          allRecipes = freshData;
          if (typeof window !== 'undefined') { window.allRecipes = freshData; window.__RECIPES_CACHE__ = freshData; }
          if (typeof render === 'function') render();
          window.dispatchEvent(new CustomEvent('recipes-data-updated', { detail: freshData }));
        }
      } catch (err) {
      } finally {
        isSyncing = false;
      }
    }

    setTimeout(() => runSyncCheck(true), 1800);
    setInterval(() => runSyncCheck(false), 30 * 60 * 1000);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') runSyncCheck(false);
      });
    }
  }

  fetchRecipesWithFallback(
    (typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '') + `data/recipes.json`,
    `data/recipes.json`, `../data/recipes.json`, `recipes.json`,
    `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/recipes.json`
  )
    .then(data => {
      allRecipes = data;
      if (typeof window !== 'undefined') {
        window.allRecipes = data;
        window.__RECIPES_CACHE__ = data;
        if (typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
          window.dispatchEvent(new CustomEvent('recipes-data-updated', { detail: data }));
        }
      }
      initCategoryFilters();
      initSelectFilters();
      initSliders();
      initTastyToggle();
      initIngredientPicker();
      initPantryUI();
      initQuickFilterPill();
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
        window.__renderInPlaceError('recipe-content-area', window.I18N?.t?.('recipes.ui_err_load_db') ?? '料理食譜資料庫載入失敗 (recipes.json)', err);
      } else if (contentArea) {
        const safeMsg = (window.DOMUtils && typeof window.DOMUtils.escapeHtml === 'function')
          ? window.DOMUtils.escapeHtml(err.message)
          : String(err.message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">${window.I18N?.t?.('recipes.ui_err_load_prefix') ?? '載入 recipes.json 失敗：'}${safeMsg}</div>`;
      }
    });

  function getRecipeName(r) {
    if (!r) return '';
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getRecipeName === 'function') {
      return window.I18N.getRecipeName(r);
    }
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.field === 'function') {
      return window.I18N.field(r, 'name');
    }
    return r.name_cn || r.name_en || r.name || '';
  }
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
            ${icon ? `<img src="${icon}" class="pantry-item-icon" alt="${displayName}">` : ''}
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
  function calcEnergy(base, level, islandBonusPct, eventBonusMult = 1.0, extraCount = potExpansion, extraUnitEnergy = 100) {
    const validBase        = (typeof base === 'number' && Number.isFinite(base)) ? base : 0;
    const lvMultiplier     = 1 + (getLevelBonus(level) / 100);
    const recipeBaseWithLv = validBase * lvMultiplier;
    const validExtraCount  = Math.max(0, Number(extraCount) || 0);
    const extraBaseEnergy  = validExtraCount * (extraUnitEnergy || 100);
    const potSubtotal      = recipeBaseWithLv + extraBaseEnergy;
    const islandMultiplier = 1 + (islandBonusPct / 100);
    return Math.round(potSubtotal * islandMultiplier * eventBonusMult);
  }

  /* ─── 篩選 + 排序 ───────────────────────────────────── */
  function getFilteredRecipes() {
    const hasSelectedIngs = selectedIngredients.size > 0;
    const hasExcludedIngs = excludedIngredients.size > 0;
    const selectedIngArr  = hasSelectedIngs ? [...selectedIngredients] : null;

    const filtered = allRecipes.filter(recipe => {
      if (!recipe || typeof recipe !== 'object') return false;
      if (selectedCategory !== 'ALL' && recipe.category !== selectedCategory) return false;
      if (minBonus > 0 && (recipe.bonus_pct || 0) < minBonus) return false;
      if (minPot   > 0 && (recipe.pot_size   || 0) < minPot)  return false;
      if (!recipe._ingNameSet) {
        const ings = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
        recipe._ingNameSet = new Set(ings.filter(i => i && typeof i.name === 'string').map(i => i.name));
        recipe._searchStr = ((recipe.name_cn || '') + ' ' + (recipe.name_en || '') + ' ' + ings.filter(i => i && typeof i.name === 'string').map(i => i.name).join(' ')).toLowerCase();
      }
      if (currentSearch && !recipe._searchStr.includes(currentSearch)) return false;
      if (hasSelectedIngs) {
        if (matchMode === 'all') {
          for (let i = 0; i < selectedIngArr.length; i++) {
            if (!recipe._ingNameSet.has(selectedIngArr[i])) return false;
          }
        } else {
          let anyMatch = false;
          for (let i = 0; i < selectedIngArr.length; i++) {
            if (recipe._ingNameSet.has(selectedIngArr[i])) { anyMatch = true; break; }
          }
          if (!anyMatch) return false;
        }
      }
      if (hasExcludedIngs) {
        for (const exName of excludedIngredients) {
          if (recipe._ingNameSet.has(exName)) return false;
        }
      }

      const missingInfo = getRecipeMissingDetails(recipe, pantryInventory);
      recipe._missingCount = missingInfo.missingCount;
      recipe._missingDetails = missingInfo.missingItems;
      recipe._isCookable = missingInfo.isCookable;

      if (filterCookableOnly && recipe._missingCount > 0) return false;
      return true;
    });

    if (sortOption === 'energy-desc' || sortOption === 'energy-asc' || sortOption === 'missing-asc') {
      for (let i = 0; i < filtered.length; i++) {
        filtered[i]._cachedEnergy = calcEnergy(filtered[i].base_energy, recipeLevel, islandBonus, eventBonus);
      }
    }

    return filtered.sort((a, b) => {
      if (sortOption === 'energy-desc') return (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0) - (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0);
      if (sortOption === 'energy-asc')  return (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0) - (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0);
      if (sortOption === 'pot-asc')     return (a.pot_size || 0) - (b.pot_size || 0);
      if (sortOption === 'pot-desc')    return (b.pot_size || 0) - (a.pot_size || 0);
      if (sortOption === 'bonus-desc')  return (b.bonus_pct || 0) - (a.bonus_pct || 0);
      if (sortOption === 'name-asc')    return (a.name_cn || a.name || '').localeCompare(b.name_cn || b.name || '', 'zh-TW');
      if (sortOption === 'missing-asc') {
        const diff = (a._missingCount || 0) - (b._missingCount || 0);
        return diff !== 0 ? diff : (Number.isFinite(b._cachedEnergy) ? b._cachedEnergy : 0) - (Number.isFinite(a._cachedEnergy) ? a._cachedEnergy : 0);
      }
      return 0;
    });
  }

  /* ─── Badge 與圖示輔助 ───────────────────────────────── */
  function getBonusEmoji(pct) {
    if (pct >= 78) return 'S';
    if (pct >= 61) return 'A';
    if (pct >= 48) return 'B';
    if (pct >= 35) return 'C';
    if (pct >= 25) return 'D';
    if (pct >= 21) return 'E';
    return '-';
  }

  function getBonusBadgeClass(pct) {
    if (pct >= 78) return 'bonus-badge-78';
    if (pct >= 61) return 'bonus-badge-61';
    if (pct >= 48) return 'bonus-badge-48';
    if (pct >= 35) return 'bonus-badge-35';
    if (pct >= 25) return 'bonus-badge-25';
    return 'bonus-badge-default';
  }

  function _resolveRecipeAssetUrl(rawUrl) {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    if (rawUrl.startsWith('assets/') || rawUrl.includes('snackablenuts') || rawUrl.includes('seedbombnaanandcurry') || rawUrl.includes('grassknotsaladwrap') || rawUrl.includes('slowpoketailrollcake')) {
      if (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function') {
        const mapped = window.mapExternalToLocalAsset(rawUrl);
        if (mapped) return mapped;
      }
      if (rawUrl.startsWith('assets/')) {
        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__)
          ? window.__DATA_BASE_PATH__
          : ((typeof window !== 'undefined' && window.location && window.location.pathname && window.location.pathname.includes('/app/')) ? '../' : '');
        return `${base}${rawUrl}`;
      }
    }
    return rawUrl;
  }

  function renderIngRow(ingredients) {
    const list = Array.isArray(ingredients) ? ingredients : [];
    return `<div class="recipe-ing-row">
      ${list.map(i => {
        if (!i || typeof i !== 'object') return '';
        const rawName = typeof i.name === 'string' ? i.name : (typeof i.name !== 'symbol' ? String(i.name || '') : '');
        const ingDisplayName = (window.I18N && rawName) ? window.I18N.getIngredientName(rawName) : rawName;
        const count = (typeof i.count === 'number' && Number.isFinite(i.count)) ? i.count : 0;
        const ingIcon = _resolveRecipeAssetUrl(i.icon);
        return `
        <div class="recipe-ing-chip" title="${ingDisplayName} × ${count}">
          ${ingIcon ? `<img src="${ingIcon}" class="recipe-ing-icon" alt="${ingDisplayName}" loading="lazy" onerror="this.style.display='none';">` : ''}
          <span class="recipe-ing-count">×${count}</span>
        </div>
      `;
      }).join('')}
    </div>`;
  }

  function renderPantryBadge(recipe) {
    const missing = recipe._missingCount || 0;
    if (missing === 0) {
      return `<span class="recipe-pantry-badge pantry-ready">${window.I18N?.t?.('recipe.pantry_badge_ready') ?? '可烹飪'}</span>`;
    }
    const details = recipe._missingDetails || [];
    const tooltip = details.map(d => `${(window.I18N && typeof window.I18N.getIngredientName === 'function') ? window.I18N.getIngredientName(d.name) : (window.I18N?.text?.(d.name) ?? d.name)}: ${d.onHand}/${d.required} (-${d.missing})`).join('\n');
    return `<span class="recipe-pantry-badge pantry-missing" title="${tooltip}">${window.I18N?.t?.('recipes.ui_pantry_missing_count', { count: missing }) ?? `缺 ${missing}`}</span>`;
  }

  function renderEnergyStack(finalE) {
    return `
      <div class="desktop-energy-stack ${showTasty ? 'has-tasty' : 'single-energy'}">
        <div class="desktop-energy-row energy-1x">
          <span class="energy-multiplier">1x</span>
          <span class="energy-number">${finalE.toLocaleString()}</span>
        </div>
        ${showTasty ? `
          <div class="desktop-energy-row energy-2x">
            <span class="energy-multiplier">2x</span>
            <span class="energy-number">${Math.round(finalE * 2).toLocaleString()}</span>
          </div>
          <div class="desktop-energy-row energy-3x">
            <span class="energy-multiplier">3x</span>
            <span class="energy-number">${Math.round(finalE * 3).toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─── 側邊欄展開/收合事件與計數 ───────────────────────── */
  function updateRecipeActiveFilterBadge() {
    const badge = document.getElementById('recipe-sidebar-bookmark-badge');
    const clearIncBtn = document.getElementById('clear-ingredients-btn');
    const clearExcBtn = document.getElementById('clear-excluded-btn');
    if (clearIncBtn) clearIncBtn.style.display = selectedIngredients.size > 0 ? 'inline-block' : 'none';
    if (clearExcBtn) clearExcBtn.style.display = excludedIngredients.size > 0 ? 'inline-block' : 'none';

    let activeCount = 0;
    if (selectedCategory && selectedCategory !== 'ALL') activeCount++;
    if (minBonus > 0) activeCount++;
    if (minPot > 0) activeCount++;
    if (selectedIngredients.size > 0) activeCount += 1;
    if (excludedIngredients.size > 0) activeCount += 1;
    if (recipeLevel > 1 || islandBonus > 0 || eventBonus > 1.0 || showTasty) activeCount++;
    if (filterCookableOnly) activeCount++;
    if (Object.keys(pantryInventory).length > 0) activeCount++;

    if (badge) {
      badge.textContent = activeCount;
      badge.style.display = activeCount > 0 ? 'inline-flex' : 'none';
    }

    const cookableBtn = document.getElementById('recipe-cookable-filter-btn');
    if (cookableBtn) cookableBtn.classList.toggle('active', filterCookableOnly);
  }

  function initRecipeSidebarEvents() {
    const sidebar = document.getElementById('recipe-filter-sidebar');
    const bookmarkHandle = document.getElementById('recipe-sidebar-bookmark-handle');
    const closeBtn = document.getElementById('recipe-sidebar-close-btn');
    const backdrop = document.getElementById('recipe-sidebar-backdrop');
    const resetAllBtn = document.getElementById('recipe-sidebar-reset-all-btn') || document.getElementById('recipe-reset-all-btn');
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');

    function toggleRecipeSidebar(forceState) {
      if (!sidebar) return;
      const isCurrentlyCollapsed = sidebar.classList.contains('collapsed');
      const shouldCollapse = forceState !== undefined ? !forceState : !isCurrentlyCollapsed;

      if (shouldCollapse) {
        sidebar.classList.add('collapsed');
        if (backdrop) backdrop.classList.remove('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.remove('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.title = window.I18N?.t?.('recipes.ui_sidebar_expand') ?? '展開食譜篩選側邊欄';
          Object.assign(bookmarkHandle.style, { opacity: '1', pointerEvents: 'auto', display: 'flex', visibility: 'visible' });
        }
        if (typeof window.setSidebarSavedState === 'function') window.setSidebarSavedState('pksleep_recipe_sidebar_open', false);
      } else {
        if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(sidebar);
        sidebar.classList.remove('collapsed');
        if (backdrop) backdrop.classList.add('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.title = window.I18N?.t?.('recipes.ui_sidebar_collapse') ?? '收合食譜篩選側邊欄';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
        if (typeof window.setSidebarSavedState === 'function') window.setSidebarSavedState('pksleep_recipe_sidebar_open', true);
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    }
    window.toggleRecipeSidebar = toggleRecipeSidebar;

    const initialOpen = (typeof window.getSidebarSavedState === 'function')
      ? window.getSidebarSavedState('pksleep_recipe_sidebar_open', !isMobileH5)
      : (!isMobileH5);

    if (sidebar) {
      if (initialOpen) {
        sidebar.classList.remove('collapsed');
        if (backdrop) backdrop.classList.add('active');
        if (bookmarkHandle) {
          bookmarkHandle.classList.add('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'true');
          bookmarkHandle.style.display = 'none';
          bookmarkHandle.style.opacity = '0';
          bookmarkHandle.style.pointerEvents = 'none';
          bookmarkHandle.style.visibility = 'hidden';
        }
      } else {
        sidebar.classList.add('collapsed');
        if (bookmarkHandle) {
          bookmarkHandle.classList.remove('drawer-open');
          bookmarkHandle.setAttribute('aria-expanded', 'false');
          bookmarkHandle.style.display = 'flex';
          bookmarkHandle.style.opacity = '1';
          bookmarkHandle.style.pointerEvents = 'auto';
          bookmarkHandle.style.visibility = 'visible';
        }
      }
    }

    if (bookmarkHandle && !bookmarkHandle._hasListener) {
      bookmarkHandle._hasListener = true;
      bookmarkHandle.addEventListener('click', (e) => { e.stopPropagation(); toggleRecipeSidebar(); });
    }
    if (closeBtn && !closeBtn._hasListener) {
      closeBtn._hasListener = true;
      closeBtn.addEventListener('click', () => toggleRecipeSidebar(false));
    }
    if (backdrop && !backdrop._hasListener) {
      backdrop._hasListener = true;
      backdrop.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); toggleRecipeSidebar(false); });
    }
    if (sidebar && typeof window.bindSidebarSwipeRightToClose === 'function') {
      window.bindSidebarSwipeRightToClose(sidebar, () => toggleRecipeSidebar(false));
    }

    if (resetAllBtn && !resetAllBtn._hasListener) {
      resetAllBtn._hasListener = true;
      resetAllBtn.addEventListener('click', () => {
        selectedCategory = 'ALL';
        minBonus = 0;
        filterCookableOnly = false;
        selectedIngredients.clear();
        excludedIngredients.clear();
        currentSearch = '';
        if (searchInput) searchInput.value = '';
        updateRecipeClearBtn();
        if (bonusSelect) { bonusSelect.value = '0'; bonusSelect.dispatchEvent(new Event('sync-ui')); }
        if (categoryContainer) {
          categoryContainer.querySelectorAll('.tag-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'ALL'));
        }
        document.querySelectorAll('#ingredient-picker-tags .ing-picker-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('#excluded-ingredient-picker-tags .ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
        savePrefs();
        updateRecipeActiveFilterBadge();
        render();
      });
    }
    updateRecipeActiveFilterBadge();
  }

  /* ─── 選擇器與互動初始化 ─────────────────────────────── */
  function initCategoryFilters() {
    if (!categoryContainer) return;
    const categories = ['ALL', '咖哩', '沙拉', '甜點'];
    const catCounts  = { '咖哩': 0, '沙拉': 0, '甜點': 0 };
    for (let i = 0; i < allRecipes.length; i++) {
      const c = allRecipes[i] && allRecipes[i].category;
      if (catCounts[c] !== undefined) catCounts[c]++;
    }

    categoryContainer.innerHTML = categories.map(cat => {
      const count = cat === 'ALL' ? allRecipes.length : (catCounts[cat] || 0);
      const active = cat === selectedCategory ? 'active' : '';
      return `<button class="tag-btn ${active}" data-cat="${cat}">${_getRecipeCategoryLabel(cat)} (${count})</button>`;
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

  function initIngredientPicker() {
    if (!ingredientPickerContainer) return;
    const ingMap = new Map();
    allRecipes.forEach(r => {
      (Array.isArray(r.ingredients) ? r.ingredients : []).forEach(ing => {
        if (ing && ing.name && !ingMap.has(ing.name)) ingMap.set(ing.name, ing.icon || '');
      });
    });

    const ingNames = _sortRecipesIngredientsByEnergyAsc(Array.from(ingMap.keys()));
    const excludedPickerContainer = document.getElementById('excluded-ingredient-picker-tags');

    const renderPickerButtons = (container, set, activeCls) => {
      if (!container) return;
      container.innerHTML = ingNames.map(name => {
        const icon = _resolveRecipeAssetUrl(ingMap.get(name));
        const active = set.has(name) ? activeCls : '';
        const ingTitle = window.I18N ? window.I18N.getIngredientName(name) : name;
        return `<button class="ing-picker-btn ${active}" data-name="${name}" title="${ingTitle}">
          ${icon ? `<img src="${icon}" class="ing-picker-icon" alt="${ingTitle}">` : ''}
        </button>`;
      }).join('');
    };

    renderPickerButtons(ingredientPickerContainer, selectedIngredients, 'active');
    renderPickerButtons(excludedPickerContainer, excludedIngredients, 'active-exclude');

    const bindPickerClicks = (container, set, oppositeSet, activeCls, oppCls, oppContainer) => {
      if (!container || container._hasListener) return;
      container._hasListener = true;
      container.addEventListener('click', e => {
        const btn = e.target.closest('.ing-picker-btn');
        if (!btn) return;
        const name = btn.getAttribute('data-name');
        if (oppositeSet.has(name)) {
          oppositeSet.delete(name);
          const oppBtn = oppContainer && oppContainer.querySelector(`[data-name="${CSS.escape(name)}"]`);
          if (oppBtn) oppBtn.classList.remove(oppCls);
        }
        if (set.has(name)) {
          set.delete(name);
          btn.classList.remove(activeCls);
        } else {
          set.add(name);
          btn.classList.add(activeCls);
        }
        savePrefs();
        render();
      });
    };

    bindPickerClicks(ingredientPickerContainer, selectedIngredients, excludedIngredients, 'active', 'active-exclude', excludedPickerContainer);
    bindPickerClicks(excludedPickerContainer, excludedIngredients, selectedIngredients, 'active-exclude', 'active', ingredientPickerContainer);

    if (clearIngredientsBtn && !clearIngredientsBtn._hasListener) {
      clearIngredientsBtn._hasListener = true;
      clearIngredientsBtn.addEventListener('click', () => {
        selectedIngredients.clear();
        excludedIngredients.clear();
        document.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active', 'active-exclude'));
        savePrefs();
        render();
      });
    }

    const clearExcludedBtn = document.getElementById('clear-excluded-btn');
    if (clearExcludedBtn && !clearExcludedBtn._hasListener) {
      clearExcludedBtn._hasListener = true;
      clearExcludedBtn.addEventListener('click', () => {
        excludedIngredients.clear();
        if (excludedPickerContainer) excludedPickerContainer.querySelectorAll('.ing-picker-btn').forEach(b => b.classList.remove('active-exclude'));
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

  function initViewToggle() {
    if (!toggleGridBtn || !toggleTableBtn) return;
    toggleGridBtn.classList.toggle('active', viewMode === 'grid');
    toggleTableBtn.classList.toggle('active', viewMode === 'table');

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

  function initSort() {
    if (!sortSelect) return;
    if (!sortSelect.querySelector('option[value="missing-asc"]')) {
      const opt = document.createElement('option');
      opt.value = 'missing-asc';
      opt.textContent = window.I18N?.t?.('recipe.sort_missing_asc') ?? '缺件最少（優先可煮）';
      opt.setAttribute('data-i18n', 'recipe.sort_missing_asc');
      sortSelect.appendChild(opt);
    }
    sortSelect.value = sortOption;
    setupCustomSelect(sortSelect);
    sortSelect.addEventListener('change', () => {
      sortOption = sortSelect.value;
      savePrefs();
      render();
    });
  }

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

  /* ─── 渲染主入口 ────────────────────────────────────── */
  function render() {
    if (!contentArea || !countBadge) return;
    syncPotExpansionUI();
    initCategoryFilters();
    updateRecipeActiveFilterBadge();
    const filtered = getFilteredRecipes();

    const catCounts = {};
    filtered.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
    const breakdownHTML = Object.entries(catCounts).map(([cat, c]) => `${_getRecipeCategoryLabel(cat)} <strong>${c}</strong>`).join(' · ');

    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const lvBonus = getLevelBonus(recipeLevel);
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventMult = Number(eventBonus).toFixed(2);

    let formulaParts = [`Lv.${recipeLevel}${lvBonus > 0 ? ` (+${lvBonus}%)` : ''}`];
    if (islandBonus > 0) formulaParts.push(`+${islandBonus}% (×${islandMult})`);
    if (eventBonus > 1.0) formulaParts.push(`×${eventMult}`);
    if (potExpansion > 0) formulaParts.push(`${window.I18N?.t?.('recipes.ui_pot_extra', { count: potExpansion }) ?? `+${potExpansion}料`} (+${(potExpansion * 100).toLocaleString()})`);
    const formulaText = formulaParts.join(' · ');

    if (isMobileH5) {
      countBadge.style.display = 'flex';
      countBadge.innerHTML = `
        <span class="rc-badge-count">${window.I18N?.t?.('recipes.ui_dishes_count_mobile', { count: filtered.length }) ?? `食譜 <strong>${filtered.length}</strong> 道`}</span>
        <span class="rc-badge-formula">${formulaText}</span>
      `;
    } else {
      countBadge.innerHTML = window.I18N?.t?.('recipes.ui_dishes_count_desktop', { count: filtered.length, breakdown: breakdownHTML }) ?? `食譜 <strong>${filtered.length}</strong> 道（${breakdownHTML}）`;
    }

    if (filtered.length === 0) {
      contentArea.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted);">${window.I18N?.t?.('recipes.ui_no_matching') ?? '未找到符合條件的料理食譜'}</div>`;
      return;
    }

    if (isMobileH5 || viewMode === 'grid') renderGrid(filtered);
    else renderTable(filtered);
  }

  function renderTable(recipes) {
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';
    const potSub = potExpansion > 0 ? ` · ${window.I18N?.t?.('recipes.ui_pot_extra', { count: potExpansion }) ?? `+${potExpansion}料`}` : '';

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
              <th class="sortable th-energy" data-sort="energy" style="min-width:140px;text-align:right;padding-right:32px;">
                ${t('recipe.th_final_energy', '預估能量')} <span class="sort-arrow"></span>
                <div class="table-sub-header">Lv.${recipeLevel} · ×${islandMult}${eventSub}${potSub}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            ${recipes.map(r => {
              const finalE        = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
              const primaryName   = getRecipeName(r);
              const cnAlt         = (r.name_cn && r.name_cn !== primaryName) ? r.name_cn : '';
              const enAlt         = r.name_en || '';
              const secondaryName = window.I18N && typeof window.I18N.pick === 'function'
                ? window.I18N.pick({ 'zh-TW': enAlt, 'zh-CN': enAlt, 'en-US': cnAlt })
                : enAlt;
              const pantryBadgeHTML = renderPantryBadge(r);
              return `
              <tr>
                <td style="vertical-align:middle;text-align:center;">
                  <img src="${_resolveRecipeAssetUrl(r.icon)}" width="58" height="58" alt="${primaryName}" loading="lazy" onerror="this.style.opacity='0.3';" style="object-fit:contain;display:block;margin:0 auto;">
                </td>
                <td class="recipe-name-cell" style="vertical-align:middle;text-align:left;">
                  <div class="recipe-name-wrapper" style="display:flex;flex-direction:column;justify-content:center;align-items:flex-start;text-align:left;min-height:52px;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <span class="recipe-name-primary" style="font-weight:700;font-size:15px;color:var(--text-main);line-height:1.3;">${primaryName}</span>
                      ${pantryBadgeHTML}
                    </div>
                    ${secondaryName ? `<span class="recipe-name-sub" style="color:var(--text-muted);font-size:11px;font-weight:400;margin-top:2px;line-height:1.2;text-align:left;">${secondaryName}</span>` : ''}
                  </div>
                </td>
                <td style="vertical-align:middle;"><span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span></td>
                <td style="vertical-align:middle;">
                  <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                    <span class="pot-badge">${r.pot_size}</span>
                    <button type="button" class="pot-filler-open-btn" data-recipe-id="${r.name_cn}" title="${window.I18N?.t?.('recipes.ui_optimize_pot_title') ?? '填鍋與容量最佳化'}">
                      ${window.I18N?.t?.('recipes.ui_optimizer_btn') ?? '最佳加料'}
                    </button>
                  </div>
                </td>
                <td style="vertical-align:middle;">${renderIngRow(r.ingredients)}</td>
                <td class="recipe-energy-cell" style="vertical-align:middle;text-align:right;padding-right:32px;">
                  ${renderEnergyStack(finalE)}
                </td>
              </tr>
            `}).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindTableActionEvents();
  }

  function renderGrid(recipes) {
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList.contains('mobile-h5-app');
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    const islandMult = (1 + islandBonus / 100).toFixed(2);
    const eventSub = eventBonus > 1.0 ? ` · ×${eventBonus.toFixed(2)}` : '';

    if (isMobileH5) {
      contentArea.innerHTML = `
        <div class="h5-recipe-cards-list">
          ${recipes.map(r => {
            const finalE = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
            const primaryName = getRecipeName(r);
            const pantryBadgeHTML = renderPantryBadge(r);
            return `
            <div class="h5-recipe-card">
              <div class="h5-recipe-left-col">
                <div class="h5-recipe-top-row">
                  <img class="h5-recipe-img" src="${_resolveRecipeAssetUrl(r.icon)}" alt="${primaryName}" loading="lazy" onerror="this.style.display='none';">
                  <div class="h5-recipe-title-meta">
                    <span class="h5-recipe-name">${primaryName}</span>
                    <div class="h5-recipe-tags-row">
                      <span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span>
                      <span class="h5-recipe-pot">${r.pot_size}</span>
                      ${pantryBadgeHTML}
                      <button type="button" class="pot-filler-open-btn compact-filler-btn" data-recipe-id="${r.name_cn}">${window.I18N?.t?.('recipes.ui_optimizer_btn_short') ?? '加料'}</button>
                    </div>
                  </div>
                </div>
                <div class="h5-recipe-ing-section">${renderIngRow(r.ingredients)}</div>
              </div>
              <div class="h5-recipe-energy-col ${showTasty ? 'has-tasty' : 'single-energy'}">
                <div class="h5-energy-score energy-1x"><span class="energy-multiplier">1x</span><span class="energy-number">${finalE.toLocaleString()}</span></div>
                ${showTasty ? `
                  <div class="h5-energy-score energy-2x"><span class="energy-multiplier">2x</span><span class="energy-number">${(finalE * 2).toLocaleString()}</span></div>
                  <div class="h5-energy-score energy-3x"><span class="energy-multiplier">3x</span><span class="energy-number">${(finalE * 3).toLocaleString()}</span></div>
                ` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      `;
      bindTableActionEvents();
      return;
    }

    contentArea.innerHTML = `
      <div class="pokemon-grid">
        ${recipes.map(r => {
          const finalE = calcEnergy(r.base_energy, recipeLevel, islandBonus, eventBonus);
          const primaryName = getRecipeName(r);
          const pantryBadgeHTML = renderPantryBadge(r);
          return `
          <div class="pokemon-card recipe-desktop-card">
            <div class="card-header" style="align-items:center;margin-bottom:6px;">
              <img class="card-icon" src="${r.icon}" alt="${primaryName}" loading="lazy" onerror="this.style.opacity='0.3';" style="width:56px;height:56px;object-fit:contain;">
              <div class="card-title-group" style="flex:1;min-width:0;">
                <h3 class="pokemon-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;margin-bottom:3px;">${primaryName}</h3>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                  <span class="recipe-cat-badge cat-${r.category}">${_getRecipeCategoryLabel(r.category)}</span>
                  ${pantryBadgeHTML}
                </div>
              </div>
            </div>

            <div class="recipe-desktop-stats">
              <div class="recipe-stat-row">
                <span class="stat-label">${t('recipe.th_pot', '鍋子容量')}</span>
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="stat-value pot-value">${r.pot_size}</span>
                  <button type="button" class="pot-filler-open-btn" data-recipe-id="${r.name_cn}" title="${window.I18N?.t?.('recipes.ui_optimize_pot_title') ?? '填鍋與容量最佳化'}">
                    ${window.I18N?.t?.('recipes.ui_optimizer_btn') ?? '最佳加料'}
                  </button>
                </div>
              </div>
              <div class="recipe-stat-row ${showTasty ? 'has-tasty-energy' : ''}" style="${showTasty ? 'align-items:flex-start;' : 'align-items:center;'}">
                <div style="display:flex;flex-direction:column;align-items:flex-start;">
                  <span class="stat-label">${t('recipe.th_final_energy', '預估能量')}</span>
                  <span style="color:var(--text-muted);font-size:10.5px;font-weight:400;margin-top:1px;">Lv.${recipeLevel} · ×${islandMult}${eventSub}</span>
                </div>
                ${renderEnergyStack(finalE)}
              </div>
            </div>

            <div class="recipe-desktop-ings">
              <div class="recipe-ing-row compact-4-row">
                ${(Array.isArray(r.ingredients) ? r.ingredients : []).map(i => {
                  if (!i || typeof i !== 'object') return '';
                  const rawName = typeof i.name === 'string' ? i.name : String(i.name || '');
                  const ingDisplayName = (window.I18N && rawName) ? window.I18N.getIngredientName(rawName) : rawName;
                  const count = (typeof i.count === 'number' && Number.isFinite(i.count)) ? i.count : 0;
                  return `
                  <div class="recipe-ing-chip compact-chip" title="${ingDisplayName} × ${count}">
                    ${i.icon ? `<img src="${i.icon}" class="recipe-ing-icon" alt="${ingDisplayName}" loading="lazy" onerror="this.style.display='none';">` : ''}
                    <span class="recipe-ing-count">×${count}</span>
                  </div>
                `;
                }).join('')}
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;

    bindTableActionEvents();
  }

  function bindTableActionEvents() {
    if (!contentArea) return;
    contentArea.querySelectorAll('.pot-filler-open-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const recipeId = btn.getAttribute('data-recipe-id');
        const targetRecipe = allRecipes.find(r => r.name_cn === recipeId || r.name === recipeId);
        if (targetRecipe) openPotFillerModal(targetRecipe);
      });
    });
  }

  window.RecipesApp = {
    render: function() {
      initCategoryFilters();
      initIngredientPicker();
      initPantryUI();
      render();
    },
    calcEnergy: calcEnergy,
    getLevelBonus: getLevelBonus,
    isRecipesHealthy: isRecipesHealthy,
    getPotExpansion: function() { return potExpansion; },
    setPotExpansion: function(val) {
      potExpansion = Math.min(700, Math.max(0, Number(val) || 0));
      syncPotExpansionUI();
      savePrefs();
      render();
    },
    getPantry: getPantry,
    setPantryIngredient: setPantryIngredient,
    clearPantry: clearPantry,
    calculateRecipeMissingCount: calculateRecipeMissingCount,
    getRecipeMissingDetails: getRecipeMissingDetails,
    getFilterCookableOnly: function() { return filterCookableOnly; },
    setFilterCookableOnly: function(val) {
      filterCookableOnly = Boolean(val);
      savePrefs();
      updateRecipeActiveFilterBadge();
      render();
    },
    getEffectivePotCapacity: getEffectivePotCapacity,
    getPotCapacity: function() { return potCapacity; },
    setPotCapacity: function(val) {
      potCapacity = Math.max(15, Math.min(200, Number(val) || 57));
      savePrefs();
      render();
    },
    setCampTicket: function(val) {
      campTicketActive = Boolean(val);
      savePrefs();
      render();
    },
    setSundayExpansion: function(val) {
      sundayExpansionActive = Boolean(val);
      savePrefs();
      render();
    },
    getRecommendedFillers: getRecommendedFillers,
    calculateMealEnergyWithFillers: calculateMealEnergyWithFillers,
    openPotFillerModal: openPotFillerModal
  };
}

if (typeof window !== 'undefined') {
  window.isRecipesHealthy = isRecipesHealthy;
  if (!window.RecipesApp) window.RecipesApp = {};
  window.RecipesApp.isRecipesHealthy = isRecipesHealthy;
}

if (typeof global !== 'undefined') {
  global.isRecipesHealthy = isRecipesHealthy;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRecipesModule);
  else initRecipesModule();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isRecipesHealthy: isRecipesHealthy,
    RecipesApp: (typeof window !== 'undefined' && window.RecipesApp) ? window.RecipesApp : { isRecipesHealthy: isRecipesHealthy }
  };
}
})();
