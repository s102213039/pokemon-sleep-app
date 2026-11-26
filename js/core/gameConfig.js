/**
 * gameConfig.js — Single Source of Truth for Global Game Caps & Progression Rules
 * =================================================================================
 * Centralizes all official rolling caps (Pokemon Level Cap, Recipe Level Cap,
 * Island Bonus Cap, Theoretical Max Level, Subskill Unlock Thresholds) so that
 * updating one parameter here automatically propagates across runtime calculations,
 * sliders, labels, milestones, OCR validation, i18n strings, and static HTML via
 * scripts/sync_game_config.js.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.GAME_CONFIG = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function () {
  'use strict';

  const CAPS = Object.freeze({
    POKEMON_LEVEL_CAP: 70,
    RECIPE_LEVEL_CAP: 70,
    THEORETICAL_MAX_LEVEL: 100,
    ISLAND_BONUS_CAP: 95,
    ISLAND_BONUS_STEP: 5,
    SUBSKILL_UNLOCK_LEVELS: Object.freeze([10, 25, 50, 70, 80])
  });

  // Official non-linear Recipe Level Bonus table (%). Ver.3.6.0: Lv.1 (0%) ~ Lv.70 (+258%).
  const RECIPE_LEVEL_BONUS_TABLE = Object.freeze({
    1: 0, 2: 2, 3: 4, 4: 6, 5: 8, 6: 10, 7: 12, 8: 14, 9: 16, 10: 18,
    11: 20, 12: 22, 13: 24, 14: 26, 15: 28, 16: 30, 17: 33, 18: 35, 19: 37, 20: 39,
    21: 42, 22: 44, 23: 46, 24: 49, 25: 51, 26: 53, 27: 56, 28: 58, 29: 61, 30: 63,
    31: 66, 32: 68, 33: 70, 34: 74, 35: 77, 36: 81, 37: 84, 38: 88, 39: 92, 40: 96,
    41: 100, 42: 104, 43: 108, 44: 112, 45: 117, 46: 122, 47: 127, 48: 132, 49: 137, 50: 142,
    51: 148, 52: 153, 53: 159, 54: 165, 55: 171, 56: 177, 57: 183, 58: 190, 59: 196, 60: 203,
    61: 209, 62: 215, 63: 221, 64: 227, 65: 234, 66: 239, 67: 243, 68: 248, 69: 252, 70: 258
  });

  const DEFINED_RECIPE_KEYS = Object.keys(RECIPE_LEVEL_BONUS_TABLE)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);
  const MAX_DEFINED_RECIPE_LV = DEFINED_RECIPE_KEYS[DEFINED_RECIPE_KEYS.length - 1];
  const MAX_DEFINED_RECIPE_BONUS = RECIPE_LEVEL_BONUS_TABLE[MAX_DEFINED_RECIPE_LV];
  const PREV_DEFINED_RECIPE_BONUS = RECIPE_LEVEL_BONUS_TABLE[MAX_DEFINED_RECIPE_LV - 1];
  const EXTRAPOLATED_RECIPE_STEP = Math.max(1, MAX_DEFINED_RECIPE_BONUS - PREV_DEFINED_RECIPE_BONUS);

  function _deepFreeze(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    Object.freeze(obj);
    Object.keys(obj).forEach((k) => {
      const val = obj[k];
      if (val && typeof val === 'object' && !Object.isFrozen(val)) {
        _deepFreeze(val);
      }
    });
    return obj;
  }

  // Canonical 20 official ingredients (base energy ascending: 90 -> 342).
  // To add a future ingredient, append an entry { id, name, zhCnName, enName, energy, icon, aliases }.
  const _RAW_CANONICAL_INGREDIENTS = [
    { id: 'apple',         name: '特選蘋果',   zhCnName: '特选苹果',   enName: 'Fancy Apple',         energy: 90,  icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png',        aliases: ['蘋果'] },
    { id: 'milk',          name: '哞哞鮮奶',   zhCnName: '哞哞鲜奶',   enName: 'Moomoo Milk',         energy: 98,  icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png',        aliases: ['純粹鮮奶', '纯粹鲜奶', '鮮奶', '鲜奶'] },
    { id: 'soybeans',      name: '萌綠大豆',   zhCnName: '萌绿大豆',   enName: 'Greengrass Soybeans', energy: 100, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png', aliases: ['soybean', '大豆', 'soy'] },
    { id: 'honey',         name: '甜甜蜜',     zhCnName: '甜甜蜜',     enName: 'Honey',               energy: 101, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png',             aliases: ['蜜糖', '蜂蜜'] },
    { id: 'sausage',       name: '豆製肉',     zhCnName: '豆制肉',     enName: 'Bean Sausage',        energy: 103, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png',       aliases: ['香腸', '香肠', 'beansausage', 'meat'] },
    { id: 'ginger',        name: '暖暖薑',     zhCnName: '暖暖姜',     enName: 'Warming Ginger',      energy: 109, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png',     aliases: ['薑'] },
    { id: 'tomato',        name: '好眠番茄',   zhCnName: '好眠番茄',   enName: 'Snoozy Tomato',       energy: 110, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png',      aliases: ['番茄'] },
    { id: 'snackablenuts', name: '一口堅果',   zhCnName: '一口坚果',   enName: 'Snackable Nuts',      energy: 112, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snackablenuts.png',     aliases: ['nuts'] },
    { id: 'egg',           name: '特選蛋',     zhCnName: '特选蛋',     enName: 'Fancy Egg',           energy: 115, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png',          aliases: ['蛋'] },
    { id: 'oil',           name: '純粹油',     zhCnName: '纯粹油',     enName: 'Pure Oil',            energy: 121, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png',           aliases: ['純油'] },
    { id: 'potato',        name: '窩心洋芋',   zhCnName: '窝心洋芋',   enName: 'Soft Potato',         energy: 124, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png',        aliases: ['洋芋'] },
    { id: 'herb',          name: '火辣香草',   zhCnName: '火辣香草',   enName: 'Fiery Herb',          energy: 130, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png',         aliases: ['香草'] },
    { id: 'corn',          name: '萌綠玉米',   zhCnName: '萌绿玉米',   enName: 'Greengrass Corn',     energy: 140, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png',    aliases: ['玉米'] },
    { id: 'cacao',         name: '放鬆可可',   zhCnName: '放松可可',   enName: 'Soothing Cacao',      energy: 151, icon: 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png',     aliases: ['可可'] },
    { id: 'coffee',        name: '醒腦咖啡豆', zhCnName: '醒脑咖啡豆', enName: 'Rousing Coffee',      energy: 153, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png',     aliases: ['咖啡'] },
    { id: 'glossyavocado', name: '嫩亮酪梨',   zhCnName: '嫩亮酪梨',   enName: 'Glossy Avocado',      energy: 162, icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png',     aliases: ['avocado', '酪梨'] },
    { id: 'mushroom',      name: '品鮮蘑菇',   zhCnName: '品鲜蘑菇',   enName: 'Tasty Mushroom',      energy: 167, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png',     aliases: ['美味蘑菇', '蘑菇'] },
    { id: 'leek',          name: '粗枝大蔥',   zhCnName: '粗枝大葱',   enName: 'Large Leek',          energy: 185, icon: 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png',         aliases: ['大蔥'] },
    { id: 'pumpkin',       name: '沉甸甸南瓜', zhCnName: '沉甸甸南瓜', enName: 'Plump Pumpkin',       energy: 250, icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png',      aliases: ['南瓜'] },
    { id: 'tail',          name: '美味尾巴',   zhCnName: '美味尾巴',   enName: 'Slowpoke Tail',       energy: 342, icon: 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png',      aliases: ['slowpoketail', '呆呆獸尾巴'] }
  ];

  // Canonical 18 official berries (Lv.1 base energy ascending: 24 -> 35; tie-breaking matches BERRY_VALUES_DATA).
  // To add a future berry, append an entry { id, name, zhCnName, enName, type, typeAliases, energy, icon, aliases }.
  const _RAW_CANONICAL_BERRIES = [
    { id: 'pamtre', name: '椰木果', zhCnName: '椰木果', enName: 'Pamtre Berry', type: '飛行',   typeAliases: ['飛', '飞', '飞行', 'Flying'],       energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png', aliases: ['藍異果', '蓝异果', '藍異', 'Pamtre'] },
    { id: 'lum',    name: '木子果', zhCnName: '木子果', enName: 'Lum Berry',    type: '蟲',     typeAliases: ['虫', 'Bug'],                        energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png',    aliases: ['芭亞果', '芭亚果', '芭亞', 'Lum'] },
    { id: 'grepa',  name: '異奇果', zhCnName: '异奇果', enName: 'Grepa Berry',  type: '電',     typeAliases: ['电', 'Electric'],                   energy: 25, icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png',  aliases: ['Grepa'] },
    { id: 'bluk',   name: '檬果',   zhCnName: '檬果',   enName: 'Bluk Berry',   type: '幽靈',   typeAliases: ['鬼', '幽灵', 'Ghost'],              energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png',   aliases: ['Bluk'] },
    { id: 'pecha',  name: '桃桃果', zhCnName: '桃桃果', enName: 'Pecha Berry',  type: '妖精',   typeAliases: ['妖', 'Fairy'],                      energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png',  aliases: ['Pecha'] },
    { id: 'mago',   name: '芒念果', zhCnName: '芒念果', enName: 'Mago Berry',   type: '超能力', typeAliases: ['超能', '超', 'Psychic'],            energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png',   aliases: ['芒芒果', 'Mago'] },
    { id: 'leppa',  name: '蘋野果', zhCnName: '苹野果', enName: 'Leppa Berry',  type: '火',     typeAliases: ['Fire'],                             energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png',  aliases: ['Leppa'] },
    { id: 'cheri',  name: '櫻子果', zhCnName: '樱子果', enName: 'Cheri Berry',  type: '格鬥',   typeAliases: ['鬥', '斗', '格斗', 'Fighting'],     energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png',  aliases: ['Cheri'] },
    { id: 'persim', name: '柿仔果', zhCnName: '柿仔果', enName: 'Persim Berry', type: '一般',   typeAliases: ['Normal'],                           energy: 28, icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png', aliases: ['Persim'] },
    { id: 'figy',   name: '勿花果', zhCnName: '勿花果', enName: 'Figy Berry',   type: '地面',   typeAliases: ['地', 'Ground'],                     energy: 29, icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png',   aliases: ['Figy'] },
    { id: 'sitrus', name: '文柚果', zhCnName: '文柚果', enName: 'Sitrus Berry', type: '岩石',   typeAliases: ['岩', 'Rock'],                       energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png', aliases: ['Sitrus'] },
    { id: 'durin',  name: '榴石果', zhCnName: '榴石果', enName: 'Durin Berry',  type: '草',     typeAliases: ['Grass'],                            energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png',  aliases: ['墨莓果', 'Durin'] },
    { id: 'oran',   name: '橙橙果', zhCnName: '橙橙果', enName: 'Oran Berry',   type: '水',     typeAliases: ['Water'],                            energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png',   aliases: ['Oran'] },
    { id: 'wiki',   name: '芭拉果', zhCnName: '芭拉果', enName: 'Wiki Berry',   type: '惡',     typeAliases: ['恶', 'Dark'],                       energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png',   aliases: ['威嘻果', 'Wiki'] },
    { id: 'chesto', name: '零餘果', zhCnName: '零余果', enName: 'Chesto Berry', type: '毒',     typeAliases: ['Poison'],                           energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png', aliases: ['Chesto'] },
    { id: 'rawst',  name: '生薑果', zhCnName: '生姜果', enName: 'Rawst Berry',  type: '冰',     typeAliases: ['Ice'],                              energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png',  aliases: ['羅子果', '罗子果', 'Rawst'] },
    { id: 'belue',  name: '靛莓果', zhCnName: '靛莓果', enName: 'Belue Berry',  type: '鋼',     typeAliases: ['钢', 'Steel'],                      energy: 33, icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png',  aliases: ['刺角果', 'Belue'] },
    { id: 'yache',  name: '巧可果', zhCnName: '巧可果', enName: 'Yache Berry',  type: '龍',     typeAliases: ['龙', 'Dragon'],                     energy: 35, icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png',  aliases: ['亞雪果', '亚雪果', 'Yache'] }
  ];

  const CANONICAL_INGREDIENTS = _deepFreeze(
    _RAW_CANONICAL_INGREDIENTS
      .map((entry, idx) => ({
        entry: _deepFreeze({ ...entry, aliases: (entry.aliases || []).slice() }),
        idx
      }))
      .sort((a, b) => (a.entry.energy !== b.entry.energy ? a.entry.energy - b.entry.energy : a.idx - b.idx))
      .map((x) => x.entry)
  );

  const CANONICAL_BERRIES = _deepFreeze(
    _RAW_CANONICAL_BERRIES
      .map((entry, idx) => ({
        entry: _deepFreeze({
          ...entry,
          typeAliases: (entry.typeAliases || []).slice(),
          aliases: (entry.aliases || []).slice()
        }),
        idx
      }))
      .sort((a, b) => (a.entry.energy !== b.entry.energy ? a.entry.energy - b.entry.energy : a.idx - b.idx))
      .map((x) => x.entry)
  );

  function _normalizeCanonicalKey(val) {
    if (val === null || val === undefined) return '';
    return String(val).trim().toLowerCase();
  }

  function _buildCanonicalLookup(list, includeType) {
    const map = new Map();
    list.forEach((entry, rank) => {
      const record = { entry, rank, energy: entry.energy };
      const keys = [entry.id, entry.name, entry.zhCnName, entry.enName];
      if (includeType && entry.type) keys.push(entry.type);
      if (includeType && Array.isArray(entry.typeAliases)) {
        for (let i = 0; i < entry.typeAliases.length; i++) keys.push(entry.typeAliases[i]);
      }
      if (Array.isArray(entry.aliases)) {
        for (let i = 0; i < entry.aliases.length; i++) keys.push(entry.aliases[i]);
      }
      for (let i = 0; i < keys.length; i++) {
        const k = _normalizeCanonicalKey(keys[i]);
        if (k && !map.has(k)) {
          map.set(k, record);
        }
      }
    });
    return map;
  }

  const _INGREDIENT_LOOKUP = _buildCanonicalLookup(CANONICAL_INGREDIENTS, false);
  const _BERRY_LOOKUP = _buildCanonicalLookup(CANONICAL_BERRIES, true);

  function _resolveCanonicalRecord(lookupMap, itemOrKey, getKey) {
    if (itemOrKey === null || itemOrKey === undefined) return null;
    if (typeof getKey === 'function') {
      const k = _normalizeCanonicalKey(getKey(itemOrKey));
      if (k && lookupMap.has(k)) return lookupMap.get(k);
    }
    if (typeof itemOrKey === 'string' || typeof itemOrKey === 'number') {
      const k = _normalizeCanonicalKey(itemOrKey);
      return k && lookupMap.has(k) ? lookupMap.get(k) : null;
    }
    if (typeof itemOrKey === 'object') {
      const candidates = [
        itemOrKey.id,
        itemOrKey.name,
        itemOrKey.zhCnName,
        itemOrKey.enName,
        itemOrKey.name_en,
        itemOrKey.name_cn,
        itemOrKey.type
      ];
      for (let i = 0; i < candidates.length; i++) {
        const k = _normalizeCanonicalKey(candidates[i]);
        if (k && lookupMap.has(k)) return lookupMap.get(k);
      }
    }
    return null;
  }

  function _sortByCanonicalEnergyAsc(list, lookupMap, getKey) {
    if (!Array.isArray(list)) return [];
    return list
      .map((item, idx) => {
        const rec = _resolveCanonicalRecord(lookupMap, item, getKey);
        const rawEnergy = item && typeof item === 'object' && typeof item.energy === 'number' && Number.isFinite(item.energy)
          ? item.energy
          : Infinity;
        return {
          item,
          idx,
          energy: rec ? rec.energy : rawEnergy,
          rank: rec ? rec.rank : Number.MAX_SAFE_INTEGER
        };
      })
      .sort((a, b) => {
        if (a.energy !== b.energy) return a.energy - b.energy;
        if (a.rank !== b.rank) return a.rank - b.rank;
        return a.idx - b.idx;
      })
      .map((x) => x.item);
  }

  function getIngredientBaseEnergy(nameOrId) {
    const rec = _resolveCanonicalRecord(_INGREDIENT_LOOKUP, nameOrId);
    return rec ? rec.energy : null;
  }

  function getIngredientSortOrder(nameOrId) {
    const rec = _resolveCanonicalRecord(_INGREDIENT_LOOKUP, nameOrId);
    return rec ? rec.rank : Number.MAX_SAFE_INTEGER;
  }

  function sortIngredientsByEnergyAsc(list, getKey) {
    return _sortByCanonicalEnergyAsc(list, _INGREDIENT_LOOKUP, getKey);
  }

  function resolveIngredientCanonicalId(nameOrId) {
    const rec = _resolveCanonicalRecord(_INGREDIENT_LOOKUP, nameOrId);
    return rec ? rec.entry.id : null;
  }

  function getBerryBaseEnergy(nameOrIdOrType) {
    const rec = _resolveCanonicalRecord(_BERRY_LOOKUP, nameOrIdOrType);
    return rec ? rec.energy : null;
  }

  function getBerrySortOrder(nameOrIdOrType) {
    const rec = _resolveCanonicalRecord(_BERRY_LOOKUP, nameOrIdOrType);
    return rec ? rec.rank : Number.MAX_SAFE_INTEGER;
  }

  function sortBerriesByEnergyAsc(list, getKey) {
    return _sortByCanonicalEnergyAsc(list, _BERRY_LOOKUP, getKey);
  }

  function resolveBerryCanonicalId(nameOrIdOrType) {
    const rec = _resolveCanonicalRecord(_BERRY_LOOKUP, nameOrIdOrType);
    return rec ? rec.entry.id : null;
  }

  function getActiveCaps() {
    const g = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG && globalThis.GAME_CONFIG.CAPS) ||
              (typeof window !== 'undefined' && window.GAME_CONFIG && window.GAME_CONFIG.CAPS);
    return g || CAPS;
  }

  function mergeSortedLevels(levels) {
    const valid = levels
      .map((n) => parseInt(n, 10))
      .filter((n) => !isNaN(n) && n > 0);
    return Array.from(new Set(valid)).sort((a, b) => a - b);
  }

  function getPokemonLevelCap() {
    return getActiveCaps().POKEMON_LEVEL_CAP || CAPS.POKEMON_LEVEL_CAP;
  }

  function getRecipeLevelCap() {
    return getActiveCaps().RECIPE_LEVEL_CAP || CAPS.RECIPE_LEVEL_CAP;
  }

  function getTheoreticalMaxLevel() {
    return getActiveCaps().THEORETICAL_MAX_LEVEL || CAPS.THEORETICAL_MAX_LEVEL;
  }

  function getIslandBonusCap() {
    const cap = getActiveCaps().ISLAND_BONUS_CAP;
    return typeof cap === 'number' ? cap : CAPS.ISLAND_BONUS_CAP;
  }

  function getIslandBonusStep() {
    return getActiveCaps().ISLAND_BONUS_STEP || CAPS.ISLAND_BONUS_STEP;
  }

  function getSubskillUnlockLevels() {
    const arr = getActiveCaps().SUBSKILL_UNLOCK_LEVELS || CAPS.SUBSKILL_UNLOCK_LEVELS;
    return Array.isArray(arr) ? arr.slice() : [10, 25, 50, 70, 80];
  }

  function isLevelUnreleased(lv) {
    return Number(lv) > getPokemonLevelCap();
  }

  function isPokemonLevelCap(lv) {
    return Number(lv) === getPokemonLevelCap();
  }

  function clampPokemonLevel(lv, minLv = 1) {
    const cap = getPokemonLevelCap();
    const minVal = Math.max(1, parseInt(minLv, 10) || 1);
    const parsed = parseInt(lv, 10);
    if (isNaN(parsed)) return minVal;
    return Math.min(Math.max(parsed, minVal), cap);
  }

  function clampTheoreticalLevel(lv, minLv = 1) {
    const maxLv = getTheoreticalMaxLevel();
    const minVal = Math.max(1, parseInt(minLv, 10) || 1);
    const parsed = parseInt(lv, 10);
    if (isNaN(parsed)) return minVal;
    return Math.min(Math.max(parsed, minVal), maxLv);
  }

  function clampRecipeLevel(lv) {
    const cap = getRecipeLevelCap();
    const parsed = parseInt(lv, 10);
    if (isNaN(parsed)) return 1;
    return Math.min(Math.max(parsed, 1), cap);
  }

  function clampIslandBonus(pct) {
    const cap = getIslandBonusCap();
    const parsed = parseInt(pct, 10);
    if (isNaN(parsed)) return 0;
    return Math.min(Math.max(parsed, 0), cap);
  }

  function getRecipeLevelBonus(lv, capOverride) {
    const cap = typeof capOverride === 'number' ? capOverride : getRecipeLevelCap();
    const clampedLv = Math.min(Math.max(parseInt(lv, 10) || 1, 1), cap);
    if (Object.prototype.hasOwnProperty.call(RECIPE_LEVEL_BONUS_TABLE, clampedLv)) {
      return RECIPE_LEVEL_BONUS_TABLE[clampedLv];
    }
    if (clampedLv > MAX_DEFINED_RECIPE_LV) {
      return MAX_DEFINED_RECIPE_BONUS + (clampedLv - MAX_DEFINED_RECIPE_LV) * EXTRAPOLATED_RECIPE_STEP;
    }
    return 0;
  }

  function getRecipeMaxBonusPct(capOverride) {
    const cap = typeof capOverride === 'number' ? capOverride : getRecipeLevelCap();
    return getRecipeLevelBonus(cap, cap);
  }

  function getReleasedPokemonMilestones() {
    const cap = getPokemonLevelCap();
    const base = [10, 25, 30, 50, 60, ...getSubskillUnlockLevels(), cap].filter((l) => l <= cap);
    return mergeSortedLevels(base);
  }

  function getAllPokedexPinMilestones() {
    const cap = getPokemonLevelCap();
    const maxLv = getTheoreticalMaxLevel();
    return mergeSortedLevels([10, 25, 30, 50, 60, ...getSubskillUnlockLevels(), cap, maxLv]);
  }

  function getGrowthMilestones() {
    const cap = getPokemonLevelCap();
    const maxLv = getTheoreticalMaxLevel();
    return mergeSortedLevels([30, 50, 60, cap, 80, maxLv]);
  }

  function getSleepExpTargetLevels() {
    const cap = getPokemonLevelCap();
    const maxLv = getTheoreticalMaxLevel();
    return mergeSortedLevels([30, 50, 60, cap, 80, maxLv]);
  }

  function syncStaticDomCaps(doc) {
    const d = doc || (typeof document !== 'undefined' ? document : null);
    if (!d || typeof d.getElementById !== 'function') return;

    const recipeCap = getRecipeLevelCap();
    const islandCap = getIslandBonusCap();
    const islandStep = getIslandBonusStep();
    const theoreticalMax = getTheoreticalMaxLevel();

    const recipeSlider = d.getElementById('recipe-level-slider');
    if (recipeSlider) {
      recipeSlider.min = '1';
      recipeSlider.max = String(recipeCap);
    }
    const recipeMaxLabel = d.getElementById('recipe-level-max-label');
    if (recipeMaxLabel) {
      recipeMaxLabel.textContent = `Lv.${recipeCap}`;
    }

    const islandSlider = d.getElementById('island-bonus-slider');
    if (islandSlider) {
      islandSlider.min = '0';
      islandSlider.max = String(islandCap);
      islandSlider.step = String(islandStep);
    }
    const islandMaxLabel = d.getElementById('island-bonus-max-label');
    if (islandMaxLabel) {
      islandMaxLabel.textContent = `${islandCap}%`;
    }

    const modalPokeLv = d.getElementById('modal-poke-level');
    if (modalPokeLv) {
      modalPokeLv.min = '1';
      modalPokeLv.max = String(theoreticalMax);
      modalPokeLv.placeholder = `1~${theoreticalMax}`;
    }
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        syncStaticDomCaps(document);
      });
    } else {
      syncStaticDomCaps(document);
    }
  }

  // Official Pokemon Sleep National Dex + Form Sub-Order mapping (baseDex * 100 + formSubOrder)
  // Ensures regional forms, costume variants, and alternate forms sort right beside their base species
  // in both ascending and descending order, matching the official in-game Sleep Style Dex & Pokemon Box.
  const OFFICIAL_DEX_FORM_OVERRIDES = Object.freeze({
    9001: 2501,  // Pikachu (Halloween)
    9002: 2502,  // Pikachu (Holiday)
    9003: 2503,  // Pikachu (Captain legacy alias)
    9007: 2503,  // Pikachu (Captain)
    7006: 3701,  // Vulpix (Alola)
    7007: 3801,  // Ninetales (Alola)
    7013: 5801,  // Growlithe (Hisui)
    7014: 5901,  // Arcanine (Hisui)
    9004: 13301, // Eevee (Holiday)
    9005: 13302, // Eevee (Halloween)
    7054: 19401, // Wooper (Paldea)
    9006: 36301, // Spheal (Holiday)
    8001: 84901  // Toxtricity (Low Key)
  });

  function getOfficialPokemonDexOrder(p) {
    if (!p) return 9999999;
    const rawId = parseInt(p.id != null ? p.id : (p.formatted_no != null ? p.formatted_no : p.pokedex_id), 10);
    const rawNo = parseInt(p.formatted_no != null ? p.formatted_no : p.id, 10);
    const keyId = Number.isFinite(rawId) ? rawId : (Number.isFinite(rawNo) ? rawNo : NaN);

    if (Number.isFinite(keyId) && Object.prototype.hasOwnProperty.call(OFFICIAL_DEX_FORM_OVERRIDES, keyId)) {
      return OFFICIAL_DEX_FORM_OVERRIDES[keyId];
    }
    if (Number.isFinite(rawNo) && Object.prototype.hasOwnProperty.call(OFFICIAL_DEX_FORM_OVERRIDES, rawNo)) {
      return OFFICIAL_DEX_FORM_OVERRIDES[rawNo];
    }

    const cn = String(p.name_cn || p.name || '');
    const en = String(p.name_en || '');
    // Handle multi-variety species sharing the same National Dex ID (e.g. #710 Pumpkaboo / #711 Gourgeist)
    if (keyId === 710 || keyId === 711) {
      let sub = 0;
      if (cn.includes('中顆') || cn.includes('中颗') || /\bMedium\b/i.test(en)) sub = 1;
      else if (cn.includes('大顆') || cn.includes('大颗') || /\bLarge\b/i.test(en)) sub = 2;
      else if (cn.includes('巨顆') || cn.includes('巨颗') || /\bJumbo\b/i.test(en)) sub = 3;
      return keyId * 100 + sub;
    }

    // Fallback for future regional/costume forms with synthetic IDs > 1025: parse base dex from icon_url (e.g. 59-h.png)
    if (Number.isFinite(keyId) && keyId > 1025) {
      const iconStr = String(p.icon_url || p.icon || '');
      const m = iconStr.match(/\/icon\/(\d+)-/);
      if (m) {
        const baseDex = parseInt(m[1], 10);
        if (Number.isFinite(baseDex) && baseDex > 0 && baseDex <= 1025) {
          return baseDex * 100 + 50 + (keyId % 50);
        }
      }
    }

    if (Number.isFinite(keyId)) return keyId * 100;
    return 9999999;
  }

  return {
    CAPS,
    RECIPE_LEVEL_BONUS_TABLE,
    CANONICAL_INGREDIENTS,
    CANONICAL_BERRIES,
    OFFICIAL_DEX_FORM_OVERRIDES,
    getCaps: getActiveCaps,
    getOfficialPokemonDexOrder,
    getPokemonLevelCap,
    getRecipeLevelCap,
    getTheoreticalMaxLevel,
    getIslandBonusCap,
    getIslandBonusStep,
    getSubskillUnlockLevels,
    isLevelUnreleased,
    isPokemonLevelCap,
    clampPokemonLevel,
    clampTheoreticalLevel,
    clampRecipeLevel,
    clampIslandBonus,
    getRecipeLevelBonus,
    getRecipeMaxBonusPct,
    getReleasedPokemonMilestones,
    getAllPokedexPinMilestones,
    getGrowthMilestones,
    getSleepExpTargetLevels,
    getIngredientBaseEnergy,
    getIngredientSortOrder,
    sortIngredientsByEnergyAsc,
    resolveIngredientCanonicalId,
    getBerryBaseEnergy,
    getBerrySortOrder,
    sortBerriesByEnergyAsc,
    resolveBerryCanonicalId,
    syncStaticDomCaps
  };
});
