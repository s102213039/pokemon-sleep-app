/**
 * recipes.js — Pokémon Sleep 料理食譜大全
 * 功能：篩選、排序、等級滑桿、島嶼加成、活動加成、漂亮成功分數、食材庫存反查、填鍋最佳化、localStorage 記憶
 */
(function () {
  'use strict';

  function _tRecipes(tw, en) {
    if (typeof window !== 'undefined' && window.I18N) {
      const lang = typeof window.I18N.getLanguage === 'function' ? window.I18N.getLanguage() : 'zh-TW';
      if (lang === 'en-US') return en !== undefined ? en : tw;
      if (lang === 'zh-CN' && typeof window.I18N.toSimplified === 'function') {
        return window.I18N.toSimplified(tw);
      }
    }
    return tw;
  }

  function _getRecipeCategoryLabel(cat) {
    if (cat === 'ALL') return _tRecipes('全部', 'All');
    if (cat === '咖哩') return _tRecipes('咖哩', 'Curry');
    if (cat === '沙拉') return _tRecipes('沙拉', 'Salad');
    if (cat === '甜點') return _tRecipes('甜點', 'Dessert');
    return _tRecipes(cat, cat);
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
    potExpansionBadge.textContent = potExpansion === 0 ? _tRecipes('+0 (無追加)', '+0 (None)') : `+${potExpansion} (+${(potExpansion * 100).toLocaleString()})`;
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
        window.__renderInPlaceError('recipe-content-area', _tRecipes('料理食譜資料庫載入失敗 (recipes.json)', 'Failed to load recipe database (recipes.json)'), err);
      } else if (contentArea) {
        const safeMsg = (window.DOMUtils && typeof window.DOMUtils.escapeHtml === 'function')
          ? window.DOMUtils.escapeHtml(err.message)
          : String(err.message).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        contentArea.innerHTML = `<div style="text-align:center;padding:40px;color:#ef4444;">${_tRecipes('載入 recipes.json 失敗：', 'Failed to load recipes.json: ')}${safeMsg}</div>`;
      }
    });

  function getRecipeName(r) {
    if (!r) return '';
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getRecipeName === 'function') {
      return window.I18N.getRecipeName(r);
    }
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'zh-CN';
    if (isEN) return r.name_en || r.name_cn;
    if (isCN && window.I18N && typeof window.I18N.toSimplified === 'function') return window.I18N.toSimplified(r.name_cn);
    return r.name_cn;
  }
