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
    ISLAND_BONUS_CAP: 85,
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

  return {
    CAPS,
    RECIPE_LEVEL_BONUS_TABLE,
    getCaps: getActiveCaps,
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
    syncStaticDomCaps
  };
});
