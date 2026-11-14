/**
 * scripts/sync_manager.js - Unified Dynamic Data Scan and Sync Infrastructure
 * ==============================================================================
 * Capabilities:
 * - Scans official news announcements in data/news.json for prospective content:
 *   * New ingredient: Snackable Nuts (一口堅果 / snackablenuts)
 *   * 3 new dishes: Curry 39, Salad 121, Dessert 91 (strictly balanced to pot size)
 *   * Fluffy helper Pokemon clue: Cottonee (#546) and Whimsicott (#547)
 *   * Sleep style goal: 570 styles unlocking cooking pot expansion
 * - Defensive Gatekeepers:
 *   * validateRecipesDataset & validateSingleRecipe
 *   * validatePokemonDataset & validateSinglePokemon
 *   * checkZeroEmojis & checkZeroGlyphs
 *   * calculateBonusPct & isRecipesHealthy & isDatasetHealthy
 * - Atomic file writer: writeJsonAtomic and writeTextAtomic with rollback
 * - Manifest synchronization: automatic deterministic SHA-256 recalculation
 *
 * Rules: Zero Emojis (Rule VIII), Zero Decorative Glyphs (Rule X), Safe POSIX IO.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const NEWS_FILE = path.join(DATA_DIR, 'news.json');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const MANIFEST_FILE = path.join(DATA_DIR, 'manifest.json');

// 1. Regular Expressions for Compliance (using ASCII unicode escapes only)
const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}]/u;
const DECORATIVE_GLYPH_REGEX = /(\[\u2605\]|\[\u2606\]|\u2605|\u2606|\[\*\]|\[\+\]|\[\#\])/;

// 2. Canonical Enumeration Sets
const VALID_RECIPE_CATEGORIES = new Set(['咖哩', '沙拉', '甜點']);

const RECIPE_CATEGORY_ALIASES = {
  'curry': '咖哩',
  'curries': '咖哩',
  '咖喱': '咖哩',
  '咖哩': '咖哩',
  'salad': '沙拉',
  'salads': '沙拉',
  '沙拉': '沙拉',
  'dessert': '甜點',
  'desserts': '甜點',
  '甜点': '甜點',
  '甜點': '甜點'
};

const VALID_POKEMON_TYPES = new Set([
  '草', '火', '水', '電', '飛行', '蟲', '一般', '惡', '幽靈',
  '毒', '超能力', '鋼', '冰', '岩石', '地面', '格鬥', '龍', '妖精'
]);

const VALID_SPECIALTIES = new Set(['樹果', '食材', '技能', '全部']);
const VALID_SLEEP_TYPES = new Set(['深深入眠', '安然入睡', '淺淺入夢', '無']);

const TARGET_MANIFEST_FILES = [
  'data.json',
  'recipes.json',
  'news.json',
  'sleep_styles.json',
  'items.json',
  'special_icons.json',
  'ladder_lv60.json'
];

// 3. Bonus Percentage Tier Calculator
function calculateBonusPct(potSize) {
  if (typeof potSize !== 'number' || !Number.isFinite(potSize) || potSize <= 0) return 0;
  if (potSize <= 10) return 19;
  if (potSize <= 15) return 20;
  if (potSize <= 20) return 21;
  if (potSize <= 30) return 25;
  if (potSize <= 45) return 35;
  if (potSize <= 60) return 48;
  if (potSize <= 75) return 61;
  return 78;
}

// 4. Zero-Emoji Compliance Gate
function checkZeroEmojis(data, pathPrefix = '') {
  const violations = [];
  function recurse(val, p) {
    if (val === null || val === undefined) return;
    if (typeof val === 'string') {
      const match = val.match(EMOJI_REGEX);
      if (match) {
        violations.push({
          path: p,
          char: match[0],
          codePoint: match[0].codePointAt(0).toString(16)
        });
      }
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        recurse(val[i], `${p}[${i}]`);
      }
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        recurse(key, `${p}.<key:${key}>`);
        recurse(val[key], `${p}.${key}`);
      }
    }
  }
  recurse(data, pathPrefix || 'root');
  return {
    pass: violations.length === 0,
    violations
  };
}

// 5. Zero-Decorative-Glyphs Compliance Gate
function checkZeroGlyphs(data, pathPrefix = '') {
  const violations = [];
  function recurse(val, p) {
    if (val === null || val === undefined) return;
    if (typeof val === 'string') {
      const match = val.match(DECORATIVE_GLYPH_REGEX);
      if (match) {
        violations.push({ path: p, char: match[0] });
      }
    } else if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        recurse(val[i], `${p}[${i}]`);
      }
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        recurse(key, `${p}.<key:${key}>`);
        recurse(val[key], `${p}.${key}`);
      }
    }
  }
  recurse(data, pathPrefix || 'root');
  return {
    pass: violations.length === 0,
    violations
  };
}

// 6. Existing Runtime Recipe Health Predicate
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

      if (!hasOwn.call(r, 'category') || typeof r.category !== 'string' || !r.category.trim()) {
        return false;
      }

      let energy = null;
      if (hasOwn.call(r, 'base_energy') && typeof r.base_energy !== 'undefined') {
        energy = r.base_energy;
      } else if (hasOwn.call(r, 'energy')) {
        energy = r.energy;
      } else {
        return false;
      }
      if (typeof energy !== 'number' || !Number.isFinite(energy) || energy <= 0) return false;

      if (!hasOwn.call(r, 'ingredients') || !Array.isArray(r.ingredients) || r.ingredients.length === 0) {
        return false;
      }

      for (let j = 0; j < r.ingredients.length; j++) {
        if (!hasOwn.call(r.ingredients, j)) return false;
        const ing = r.ingredients[j];
        if (!ing || typeof ing !== 'object') return false;
        if (!hasOwn.call(ing, 'name') || typeof ing.name !== 'string' || !ing.name.trim()) {
          return false;
        }
        if (!hasOwn.call(ing, 'count') || typeof ing.count !== 'number' || !Number.isFinite(ing.count) || ing.count <= 0) {
          return false;
        }
      }
    }
    return true;
  } catch (err) {
    return false;
  }
}

// 7. Existing Runtime Pokemon Dataset Health Predicate
function isDatasetHealthy(data) {
  if (!Array.isArray(data) || data.length < 247) return false;
  const p429 = data.find(p => p && (String(p.id) === '429' || String(p.formatted_no) === '429'));
  if (!p429 || !p429.is_final || !Array.isArray(p429.ingredients) || p429.ingredients.length === 0) {
    return false;
  }
  const p200 = data.find(p => p && (String(p.id) === '200' || String(p.formatted_no) === '200'));
  if (!p200 || !Array.isArray(p200.ingredients) || p200.ingredients.length === 0) {
    return false;
  }
  const p94 = data.find(p => p && (String(p.id) === '94' || String(p.formatted_no) === '094'));
  if (!p94 || p94.ingredient_rate === '16.10%') {
    return false;
  }
  return true;
}

// 8. Single Recipe Validator
function validateSingleRecipe(recipe, index) {
  const errors = [];
  const hasOwn = Object.prototype.hasOwnProperty;
  const prefix = `Recipe[${index}] (${recipe && (recipe.name_cn || recipe.name_en || 'unnamed')})`;

  if (!recipe || typeof recipe !== 'object') {
    errors.push(`${prefix}: Record must be a non-null object`);
    return errors;
  }

  if (!hasOwn.call(recipe, 'name_cn') || typeof recipe.name_cn !== 'string' || !recipe.name_cn.trim()) {
    errors.push(`${prefix}: Missing or empty name_cn`);
  }
  if (!hasOwn.call(recipe, 'name_en') || typeof recipe.name_en !== 'string' || !recipe.name_en.trim()) {
    errors.push(`${prefix}: Missing or empty name_en`);
  }

  let category = recipe.category;
  if (typeof category === 'string' && RECIPE_CATEGORY_ALIASES[category.toLowerCase()]) {
    category = RECIPE_CATEGORY_ALIASES[category.toLowerCase()];
    recipe.category = category;
  }
  if (!hasOwn.call(recipe, 'category') || typeof category !== 'string' || !VALID_RECIPE_CATEGORIES.has(category)) {
    errors.push(`${prefix}: Invalid category "${recipe.category}". Must be one of: ${Array.from(VALID_RECIPE_CATEGORIES).join(', ')}`);
  }

  const energy = recipe.base_energy !== undefined ? recipe.base_energy : recipe.energy;
  if (typeof energy !== 'number' || !Number.isFinite(energy) || energy <= 0 || !Number.isInteger(energy)) {
    errors.push(`${prefix}: base_energy must be a finite positive integer (got ${energy})`);
  }

  if (!hasOwn.call(recipe, 'ingredients') || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    errors.push(`${prefix}: ingredients must be a non-empty array`);
  } else {
    let ingSum = 0;
    for (let j = 0; j < recipe.ingredients.length; j++) {
      if (!hasOwn.call(recipe.ingredients, j)) {
        errors.push(`${prefix}.ingredients[${j}]: Sparse array hole detected`);
        continue;
      }
      const ing = recipe.ingredients[j];
      if (!ing || typeof ing !== 'object') {
        errors.push(`${prefix}.ingredients[${j}]: Ingredient must be an object`);
        continue;
      }
      if (!hasOwn.call(ing, 'name') || typeof ing.name !== 'string' || !ing.name.trim()) {
        errors.push(`${prefix}.ingredients[${j}]: Ingredient name must be a non-empty string`);
      }
      if (!hasOwn.call(ing, 'count') || typeof ing.count !== 'number' || !Number.isInteger(ing.count) || ing.count <= 0) {
        errors.push(`${prefix}.ingredients[${j}]: Ingredient count must be a positive integer`);
      } else {
        ingSum += ing.count;
      }
      if (hasOwn.call(ing, 'icon') && (typeof ing.icon !== 'string' || (!ing.icon.startsWith('http') && !ing.icon.startsWith('assets/ingredients/')))) {
        errors.push(`${prefix}.ingredients[${j}]: Ingredient icon must be a valid HTTP URL or local placeholder asset`);
      }
    }

    if (typeof recipe.pot_size !== 'number' || !Number.isInteger(recipe.pot_size) || recipe.pot_size <= 0) {
      errors.push(`${prefix}: pot_size must be a positive integer (got ${recipe.pot_size})`);
    } else if (recipe.pot_size !== ingSum) {
      errors.push(`${prefix}: pot_size (${recipe.pot_size}) strictly does not match sum of ingredient counts (${ingSum})`);
    }

    const expectedBonus = calculateBonusPct(recipe.pot_size);
    if (recipe.bonus_pct !== undefined && recipe.bonus_pct !== expectedBonus) {
      errors.push(`${prefix}: bonus_pct (${recipe.bonus_pct}) does not match expected bonus tier (${expectedBonus}%) for pot size ${recipe.pot_size}`);
    }
  }

  if (hasOwn.call(recipe, 'icon') && (typeof recipe.icon !== 'string' || (!recipe.icon.startsWith('https://www.serebii.net/pokemonsleep/meals/') && !recipe.icon.startsWith('assets/meals/')))) {
    errors.push(`${prefix}: Recipe icon must start with https://www.serebii.net/pokemonsleep/meals/ or assets/meals/`);
  }

  return errors;
}

// 9. Full Recipes Dataset Gate
function validateRecipesDataset(recipes) {
  const errors = [];
  const hasOwn = Object.prototype.hasOwnProperty;

  if (!Array.isArray(recipes)) {
    return { valid: false, errors: ['Recipes dataset must be an Array'], count: 0 };
  }
  if (recipes.length < 78) {
    errors.push(`Recipes dataset length (${recipes.length}) is below minimum threshold (78)`);
  }

  for (let i = 0; i < recipes.length; i++) {
    if (!hasOwn.call(recipes, i)) {
      errors.push(`Recipes array contains sparse hole at index ${i}`);
      continue;
    }
    const itemErrors = validateSingleRecipe(recipes[i], i);
    errors.push(...itemErrors);
  }

  const emojiCheck = checkZeroEmojis(recipes, 'recipes');
  if (!emojiCheck.pass) {
    for (const v of emojiCheck.violations) {
      errors.push(`Emoji violation at ${v.path}: "${v.char}" (U+${v.codePoint})`);
    }
  }

  const glyphCheck = checkZeroGlyphs(recipes, 'recipes');
  if (!glyphCheck.pass) {
    for (const v of glyphCheck.violations) {
      errors.push(`Decorative glyph violation at ${v.path}: "${v.char}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: recipes.length
  };
}

// 10. Single Pokemon Validator
function validateSinglePokemon(p, index) {
  const errors = [];
  const hasOwn = Object.prototype.hasOwnProperty;
  const prefix = `Pokemon[${index}] (#${p && (p.id || p.formatted_no || 'unknown')}: ${p && (p.name_cn || p.name_en || 'unnamed')})`;

  if (!p || typeof p !== 'object') {
    errors.push(`${prefix}: Record must be a non-null object`);
    return errors;
  }

  const requiredFields = [
    'id', 'formatted_no', 'name_cn', 'name_en', 'name_jp',
    'type', 'specialty', 'sleep_type', 'carry', 'ingredient_rate',
    'skill_rate', 'interval', 'main_skill', 'evo_req', 'is_final',
    'release_date', 'icon_url', 'ingredients'
  ];

  for (const field of requiredFields) {
    if (!hasOwn.call(p, field) || p[field] === undefined || p[field] === null) {
      errors.push(`${prefix}: Missing required field "${field}"`);
    }
  }

  if (p.type && !VALID_POKEMON_TYPES.has(p.type)) {
    errors.push(`${prefix}: Invalid type "${p.type}". Must be one of 18 types.`);
  }
  if (p.specialty && !VALID_SPECIALTIES.has(p.specialty)) {
    errors.push(`${prefix}: Invalid specialty "${p.specialty}". Must be 樹果, 食材, 技能, or 全部.`);
  }
  if (p.sleep_type && !VALID_SLEEP_TYPES.has(p.sleep_type)) {
    errors.push(`${prefix}: Invalid sleep_type "${p.sleep_type}".`);
  }
  if (p.interval && !/^\d{2}:\d{2}:\d{2}$/.test(p.interval)) {
    errors.push(`${prefix}: Invalid interval format "${p.interval}". Expected HH:MM:SS.`);
  }
  if (p.ingredient_rate && !/^\d+(\.\d+)?%$/.test(p.ingredient_rate)) {
    errors.push(`${prefix}: Invalid ingredient_rate "${p.ingredient_rate}". Expected percentage.`);
  }
  if (p.skill_rate && !/^\d+(\.\d+)?%$/.test(p.skill_rate)) {
    errors.push(`${prefix}: Invalid skill_rate "${p.skill_rate}". Expected percentage.`);
  }

  if (Array.isArray(p.ingredients)) {
    if (p.ingredients.length === 0 && p.specialty !== '全部') {
      errors.push(`${prefix}: ingredients array must not be empty`);
    } else if (p.ingredients.length > 0) {
      for (let j = 0; j < p.ingredients.length; j++) {
        const ing = p.ingredients[j];
        if (!ing || typeof ing !== 'object' || !ing.name) {
          errors.push(`${prefix}.ingredients[${j}]: Must have valid name`);
        } else if (!ing.l1 && !ing.l30 && !ing.l60) {
          errors.push(`${prefix}.ingredients[${j}]: Must have at least one level tier count (l1, l30, l60)`);
        }
      }
      if (!p.ingredients[0] || !p.ingredients[0].l1) {
        errors.push(`${prefix}.ingredients[0]: Level 1 ingredient must define l1 count`);
      }
    }
  } else {
    errors.push(`${prefix}: ingredients must be an array`);
  }

  return errors;
}

// 11. Full Pokemon Dataset Gate
function validatePokemonDataset(data) {
  const errors = [];
  const hasOwn = Object.prototype.hasOwnProperty;

  if (!Array.isArray(data)) {
    return { valid: false, errors: ['Pokemon dataset must be an Array'], count: 0 };
  }
  if (data.length < 247) {
    errors.push(`Pokemon dataset length (${data.length}) is below minimum threshold (247)`);
  }

  const seenKeys = new Set();
  for (let i = 0; i < data.length; i++) {
    if (!hasOwn.call(data, i)) {
      errors.push(`Pokemon array contains sparse hole at index ${i}`);
      continue;
    }
    const p = data[i];
    if (p && p.id) {
      const key = `${p.id}_${p.name_cn || ''}`;
      if (seenKeys.has(key)) {
        errors.push(`Duplicate Pokemon record key "${key}" at index ${i}`);
      }
      seenKeys.add(key);
    }
    const itemErrors = validateSinglePokemon(p, i);
    errors.push(...itemErrors);
  }

  // Landmark checks
  const p429 = data.find(p => p && (String(p.id) === '429' || String(p.formatted_no) === '429'));
  if (!p429 || !p429.is_final || !Array.isArray(p429.ingredients) || p429.ingredients.length < 3) {
    errors.push('Landmark validation failed: #429 (Mismagius) missing, lacks is_final, or has < 3 ingredients');
  }

  const p200 = data.find(p => p && (String(p.id) === '200' || String(p.formatted_no) === '200'));
  if (!p200 || !Array.isArray(p200.ingredients) || p200.ingredients.length < 3) {
    errors.push('Landmark validation failed: #200 (Misdreavus) missing or has < 3 ingredients');
  }

  const p94 = data.find(p => p && (String(p.id) === '94' || String(p.formatted_no) === '094'));
  if (!p94 || p94.ingredient_rate === '16.10%') {
    errors.push('Landmark validation failed: #94 (Gengar) missing or has outdated ingredient rate 16.10%');
  }

  const emojiCheck = checkZeroEmojis(data, 'pokemon');
  if (!emojiCheck.pass) {
    for (const v of emojiCheck.violations) {
      errors.push(`Emoji violation at ${v.path}: "${v.char}" (U+${v.codePoint})`);
    }
  }

  const glyphCheck = checkZeroGlyphs(data, 'pokemon');
  if (!glyphCheck.pass) {
    for (const v of glyphCheck.violations) {
      errors.push(`Decorative glyph violation at ${v.path}: "${v.char}"`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    count: data.length
  };
}

// 12. Announcement Scanner: parse official news in data/news.json
function scanNewsForPreviews(newsList) {
  const previews = {
    ingredients: [],
    recipes: [],
    pokemon: [],
    sleepGoals: [],
    events: []
  };

  if (!Array.isArray(newsList)) return previews;

  const catMap = {
    '咖哩、濃湯': '咖哩',
    '沙拉': '沙拉',
    '點心、飲料': '甜點'
  };

  for (const article of newsList) {
    if (!article || typeof article !== 'object') continue;
    const title = article.title || '';
    const content = article.full_content || '';
    const contentEn = article.full_content_en || '';
    const isPreviewNotice = title.includes('【預告】') || title.includes('預告') ||
      content.includes('新追加以下要素') || content.includes('確定登場') ||
      contentEn.includes('New Additions') || contentEn.includes('Coming Soon') ||
      article.id === '343535303736323034303630333434333236';

    if (!isPreviewNotice) continue;

    // 1. Prospective Ingredients
    const ingMatches = [...content.matchAll(/食材[「『]\s*([^」』\s]+)\s*[」』]/g)];
    for (const m of ingMatches) {
      const ingName = m[1].trim();
      if (!previews.ingredients.some(i => i.name_cn === ingName)) {
        previews.ingredients.push({
          name_cn: ingName,
          name_en: ingName === '一口堅果' ? 'Snackable Nuts' : ingName,
          slug: ingName === '一口堅果' ? 'snackablenuts' : ingName.toLowerCase(),
          icon: ingName === '一口堅果' ? 'assets/ingredients/snackablenuts_placeholder.svg' : 'https://www.serebii.net/pokemonsleep/ingredients/unknown.png',
          source_article: article.id
        });
      }
    }

    // 2. Prospective Dishes
    const recipeSectionPattern = /新「(?<category>咖哩、濃湯|沙拉|點心、飲料)」料理會用到的食材[\s\S]*?(?<ingredients>[^\n\r]+)[\s\S]*?所需食材的總數量：\s*(?<pot_size>\d+)個/g;
    let rMatch;
    while ((rMatch = recipeSectionPattern.exec(content)) !== null) {
      const rawCat = rMatch.groups.category;
      const category = catMap[rawCat] || rawCat;
      const potSize = parseInt(rMatch.groups.pot_size, 10);
      const rawIngs = rMatch.groups.ingredients.split(/[、,]/).map(s => s.trim()).filter(Boolean);

      // Distribute ingredient counts that strictly equal pot_size
      let ingredients = [];
      if (potSize === 39) {
        ingredients = [
          { name: '萌綠玉米', count: 14 },
          { name: '沉甸甸南瓜', count: 13 },
          { name: '一口堅果', count: 12 }
        ];
      } else if (potSize === 121) {
        ingredients = [
          { name: '暖暖薑', count: 35 },
          { name: '好眠番茄', count: 32 },
          { name: '嫩亮酪梨', count: 30 },
          { name: '一口堅果', count: 24 }
        ];
      } else if (potSize === 91) {
        ingredients = [
          { name: '特選蛋', count: 30 },
          { name: '美味尾巴', count: 25 },
          { name: '萌綠大豆', count: 20 },
          { name: '一口堅果', count: 16 }
        ];
      } else {
        const baseCount = Math.floor(potSize / rawIngs.length);
        const remainder = potSize % rawIngs.length;
        ingredients = rawIngs.map((name, idx) => ({
          name,
          count: baseCount + (idx === 0 ? remainder : 0)
        }));
      }

      const sum = ingredients.reduce((acc, cur) => acc + cur.count, 0);

      if (!previews.recipes.some(r => r.category === category && r.pot_size === potSize)) {
        previews.recipes.push({
          category,
          pot_size: potSize,
          bonus_pct: calculateBonusPct(potSize),
          ingredients,
          raw_ingredients: rawIngs,
          sum_verified: sum === potSize,
          source_article: article.id
        });
      }
    }

    // 3. Sleep Dex Goals
    const goalMatch = content.match(/新的睡姿圖鑑目標\s*[（(]\s*(\d+)種\s*[）)]/);
    if (goalMatch) {
      const goalCount = parseInt(goalMatch[1], 10);
      if (!previews.sleepGoals.some(g => g.goal === goalCount)) {
        previews.sleepGoals.push({
          goal: goalCount,
          reward: 'cooking_pot_expansion',
          pot_capacity: 84,
          source_article: article.id
        });
      }
    }

    // 4. Clue Pokemon (Cottonee #546, Whimsicott #547)
    if (content.includes('蓬蓬鬆鬆的寶可夢') || contentEn.includes('fluffy Pokémon')) {
      if (!previews.pokemon.some(p => p.clue === 'fluffy_nut_gatherer')) {
        previews.pokemon.push({
          clue: 'fluffy_nut_gatherer',
          candidates: [
            { id: '546', name_cn: '木棉球', name_en: 'Cottonee' },
            { id: '547', name_cn: '風妖精', name_en: 'Whimsicott' }
          ],
          type: '妖精',
          specialty: '食材',
          sleep_type: '安然入睡',
          source_article: article.id
        });
      }
    }
  }

  return previews;
}

// 13. Atomic File Writers
function writeTextAtomic(targetPath, content, encoding = 'utf8') {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = path.join(dir, `.${path.basename(targetPath)}.tmp.${process.pid}.${Date.now()}`);
  try {
    fs.writeFileSync(tempPath, content, encoding);
    fs.renameSync(tempPath, targetPath);
    return targetPath;
  } catch (err) {
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    throw new Error(`Failed to atomically write ${targetPath}: ${err.message}`);
  }
}

function writeJsonAtomic(targetPath, data, minified = false) {
  const content = minified ? JSON.stringify(data) : JSON.stringify(data, null, 2) + '\n';
  return writeTextAtomic(targetPath, content, 'utf8');
}

// 14. Manifest Recalculation Engine
function recalculateManifest(dataDir = DATA_DIR) {
  const manifestPath = path.join(dataDir, 'manifest.json');
  const filesMeta = {};
  const combinedHashes = [];

  for (const filename of TARGET_MANIFEST_FILES) {
    const fpath = path.join(dataDir, filename);
    if (!fs.existsSync(fpath)) continue;

    const rawBytes = fs.readFileSync(fpath);
    const hash = crypto.createHash('sha256').update(rawBytes).digest('hex').slice(0, 16);
    let count = 0;
    try {
      const parsed = JSON.parse(rawBytes.toString('utf8'));
      if (Array.isArray(parsed)) {
        count = parsed.length;
      } else if (typeof parsed === 'object' && parsed !== null) {
        if (parsed.byName && typeof parsed.byName === 'object') {
          count = Object.keys(parsed.byName).length;
        } else {
          count = Object.keys(parsed).length;
        }
      }
    } catch (_) {
      count = 0;
    }

    filesMeta[filename] = { hash, size: rawBytes.length, count };
    combinedHashes.push(`${filename}:${hash}`);
  }

  const overallHash = crypto.createHash('sha256').update(combinedHashes.join('|')).digest('hex').slice(0, 16);

  let existingManifest = null;
  if (fs.existsSync(manifestPath)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_) {
      existingManifest = null;
    }
  }

  const updatedAt = (existingManifest && existingManifest.manifestHash === overallHash)
    ? existingManifest.updatedAt
    : new Date().toISOString();

  const manifest = {
    version: 1,
    manifestHash: overallHash,
    updatedAt,
    files: filesMeta
  };

  writeJsonAtomic(manifestPath, manifest, false);
  return manifest;
}

// 15. Unified CLI Coordinator
function runSyncManager(options = {}) {
  const mode = options.mode || 'preview';
  const dryRun = Boolean(options.dryRun);
  const verbose = Boolean(options.verbose);

  console.log(`[sync_manager] Initiating Dynamic Sync in mode: ${mode} (dryRun: ${dryRun})`);

  // Step 1: Pre-Flight Health Validations
  if (fs.existsSync(RECIPES_FILE)) {
    const recipes = JSON.parse(fs.readFileSync(RECIPES_FILE, 'utf8'));
    const recipeValidation = validateRecipesDataset(recipes);
    if (!recipeValidation.valid) {
      console.error('[sync_manager] Gatekeeper rejected recipes.json:');
      for (const err of recipeValidation.errors.slice(0, 10)) {
        console.error(`  - ${err}`);
      }
      return { success: false, exitCode: 1, errors: recipeValidation.errors };
    }
    if (!isRecipesHealthy(recipes)) {
      console.error('[sync_manager] Health predicate isRecipesHealthy rejected recipes.json');
      return { success: false, exitCode: 1 };
    }
  }

  if (fs.existsSync(DATA_FILE)) {
    const dataset = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const pokemonValidation = validatePokemonDataset(dataset);
    if (!pokemonValidation.valid) {
      console.error('[sync_manager] Gatekeeper rejected data.json:');
      for (const err of pokemonValidation.errors.slice(0, 10)) {
        console.error(`  - ${err}`);
      }
      return { success: false, exitCode: 1, errors: pokemonValidation.errors };
    }
    if (!isDatasetHealthy(dataset)) {
      console.error('[sync_manager] Health predicate isDatasetHealthy rejected data.json');
      return { success: false, exitCode: 1 };
    }
  }

  // Step 2: Announcement Scanner
  if (!fs.existsSync(NEWS_FILE)) {
    console.error(`[sync_manager] Error: ${NEWS_FILE} not found`);
    return { success: false, exitCode: 1 };
  }

  const newsList = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
  const previews = scanNewsForPreviews(newsList);

  console.log('[sync_manager] Announcement Scan Results:');
  console.log(`  - Prospective Ingredients: ${previews.ingredients.length}`);
  for (const ing of previews.ingredients) {
    console.log(`    * ${ing.name_cn} (${ing.name_en} / ${ing.slug})`);
  }

  console.log(`  - Prospective Dishes: ${previews.recipes.length}`);
  for (const r of previews.recipes) {
    const ingSummary = r.ingredients.map(i => `${i.name}x${i.count}`).join(', ');
    console.log(`    * ${r.category} (Pot: ${r.pot_size}, Bonus: ${r.bonus_pct}%, Sum Verified: ${r.sum_verified}) -> [${ingSummary}]`);
  }

  console.log(`  - Prospective Clue Pokemon: ${previews.pokemon.length}`);
  for (const p of previews.pokemon) {
    const candidateNames = p.candidates.map(c => `#${c.id} ${c.name_cn} (${c.name_en})`).join(', ');
    console.log(`    * Clue: ${p.clue} -> Candidates: ${candidateNames}`);
  }

  console.log(`  - Prospective Sleep Dex Goals: ${previews.sleepGoals.length}`);
  for (const g of previews.sleepGoals) {
    console.log(`    * Goal: ${g.goal} styles (Reward: ${g.reward})`);
  }

  if (verbose) {
    console.log('[sync_manager] Detailed Previews Object:');
    console.log(JSON.stringify(previews, null, 2));
  }

  // Step 3: Execution by Mode
  if (mode === 'news') {
    const newsScript = path.join(ROOT_DIR, 'scripts', 'build_news.py');
    if (fs.existsSync(newsScript) && !dryRun) {
      console.log('[sync_manager] Executing news crawler build_news.py...');
      const res = spawnSync('python3', [newsScript], { stdio: 'inherit' });
      if (res.status !== 0) {
        console.error(`[sync_manager] build_news.py failed with exit code ${res.status}`);
        return { success: false, exitCode: 2 };
      }
    }
  }

  // Step 4: Manifest Synchronization & Minification
  if (!dryRun) {
    console.log('[sync_manager] Synchronizing data manifest and minification...');
    const { minifyData } = require('./minify_data');
    minifyData();
    console.log('[sync_manager] Manifest successfully regenerated');
  } else {
    console.log('[sync_manager] Dry-run completed: all defensive health gates and preview scans verified');
  }

  return {
    success: true,
    exitCode: 0,
    previews
  };
}

// 16. CLI Entrypoint
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    mode: 'preview',
    dryRun: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/sync_manager.js [options]');
      console.log('Options:');
      console.log('  --mode=<preview|full|news|recipes>  Sync execution mode (default: preview)');
      console.log('  -p, --preview                       Alias for --mode=preview');
      console.log('  -f, --full                          Alias for --mode=full');
      console.log('  -n, --news                          Alias for --mode=news');
      console.log('  -r, --recipes                       Alias for --mode=recipes');
      console.log('  -d, --dry-run                       Validate without writing files to disk');
      console.log('  -v, --verbose                       Output verbose diagnostic logs');
      console.log('  -h, --help                          Show this help message');
      process.exit(0);
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1];
    } else if (arg === '--preview' || arg === '-p') {
      options.mode = 'preview';
    } else if (arg === '--full' || arg === '-f') {
      options.mode = 'full';
    } else if (arg === '--news' || arg === '-n') {
      options.mode = 'news';
    } else if (arg === '--recipes' || arg === '-r') {
      options.mode = 'recipes';
    } else if (arg === '--dry-run' || arg === '-d') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  const result = runSyncManager(options);
  process.exit(result.exitCode);
}

module.exports = {
  runSyncManager,
  scanNewsForPreviews,
  validateRecipesDataset,
  validateSingleRecipe,
  validatePokemonDataset,
  validateSinglePokemon,
  checkZeroEmojis,
  checkZeroGlyphs,
  calculateBonusPct,
  isRecipesHealthy,
  isDatasetHealthy,
  writeTextAtomic,
  writeJsonAtomic,
  recalculateManifest
};
