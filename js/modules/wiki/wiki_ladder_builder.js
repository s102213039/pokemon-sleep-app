  // =========================================================================
  // 動態食材天梯建構引擎 (Dynamic Lv.60 Ingredient Ladder Builder)
  // -------------------------------------------------------------------------
  // 單一真相來源：直接從 data/data.json (allPokemons) 與 recipes.json 即時推算
  // Lv.60 滿活力 (0.45x) 全食材日產量天梯，支援：
  //   1. 24h 滿活力統一公式 (86400 / (Math.max(600, round(interval * 0.882)) * 0.45) * ingRate)
  //   2. Slot A (AAA/ABA/AAX/ABX)、Slot B (ABB/AAB/ABX)、Slot C (XXC) 自動展開與去重
  //   3. 同 ID 同圖示體型自動合併 (如南瓜怪人四種體型取最高產代表)，保留不同圖示形態
  //   4. 最終進化開關 (預設開啟) + 稀有食材 (<2 最終進化) 自動補入未進化保底
  //   5. 未來第 21 種以上新食材自動建軌並從 recipes.json 自動挑選最高能量代表料理
  // =========================================================================

  let ladderFinalOnly = true;
  let _dynamicLadderCache = { key: '', data: null };
  let _dynamicRecipeCache = { len: -1, ref: null, map: Object.create(null) };

  const CANONICAL_INGREDIENT_META = [
    { id: 'apple', name: '特選蘋果', enName: 'Fancy Apple', energy: 90, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png' },
    { id: 'milk', name: '哞哞鮮奶', enName: 'Moomoo Milk', energy: 98, icon: 'https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png' },
    { id: 'soybeans', name: '萌綠大豆', enName: 'Greengrass Soybeans', energy: 100, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png' },
    { id: 'honey', name: '甜甜蜜', enName: 'Honey', energy: 101, icon: 'https://www.serebii.net/pokemonsleep/ingredients/honey.png' },
    { id: 'sausage', name: '豆製肉', enName: 'Bean Sausage', energy: 103, icon: 'https://www.serebii.net/pokemonsleep/ingredients/beansausage.png' },
    { id: 'ginger', name: '暖暖薑', enName: 'Warming Ginger', energy: 109, icon: 'https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png' },
    { id: 'tomato', name: '好眠番茄', enName: 'Snoozy Tomato', energy: 110, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png' },
    { id: 'snackablenuts', name: '一口堅果', enName: 'Snackable Nuts', energy: 112, icon: 'https://www.serebii.net/pokemonsleep/ingredients/snackablenuts.png' },
    { id: 'egg', name: '特選蛋', enName: 'Fancy Egg', energy: 115, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png' },
    { id: 'oil', name: '純粹油', enName: 'Pure Oil', energy: 121, icon: 'https://www.serebii.net/pokemonsleep/ingredients/pureoil.png' },
    { id: 'potato', name: '窩心洋芋', enName: 'Soft Potato', energy: 124, icon: 'https://www.serebii.net/pokemonsleep/ingredients/softpotato.png' },
    { id: 'herb', name: '火辣香草', enName: 'Fiery Herb', energy: 130, icon: 'https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png' },
    { id: 'corn', name: '萌綠玉米', enName: 'Greengrass Corn', energy: 140, icon: 'https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png' },
    { id: 'cacao', name: '放鬆可可', enName: 'Soothing Cacao', energy: 151, icon: 'https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png' },
    { id: 'coffee', name: '醒腦咖啡豆', enName: 'Rousing Coffee', energy: 153, icon: 'https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png' },
    { id: 'glossyavocado', name: '嫩亮酪梨', enName: 'Glossy Avocado', energy: 162, icon: 'https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png' },
    { id: 'mushroom', name: '品鮮蘑菇', enName: 'Tasty Mushroom', energy: 167, icon: 'https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png' },
    { id: 'leek', name: '粗枝大蔥', enName: 'Large Leek', energy: 185, icon: 'https://www.serebii.net/pokemonsleep/ingredients/largeleek.png' },
    { id: 'pumpkin', name: '沉甸甸南瓜', enName: 'Plump Pumpkin', energy: 250, icon: 'https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png' },
    { id: 'tail', name: '美味尾巴', enName: 'Slowpoke Tail', energy: 342, icon: 'https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png' }
  ];

  function _parseLadderIntervalSec(raw) {
    if (typeof raw === 'number' && Number.isFinite(raw) && raw > 0) return raw;
    if (!raw) return 0;
    const parts = String(raw).trim().split(':').map(n => parseInt(n, 10));
    if (parts.some(n => isNaN(n))) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }

  function _parseLadderIngRate(raw) {
    if (raw === undefined || raw === null || raw === '') return 0;
    if (typeof raw === 'number') {
      if (!Number.isFinite(raw) || raw <= 0) return 0;
      return raw <= 1 ? raw : raw / 100;
    }
    const str = String(raw).trim();
    const num = parseFloat(str.replace('%', ''));
    if (!Number.isFinite(num) || num <= 0) return 0;
    return (str.includes('%') || num > 1) ? (num / 100) : num;
  }

  function _normalizeIconStem(url) {
    if (!url) return '';
    const clean = String(url).split('?')[0].split('#')[0];
    const parts = clean.split('/');
    return (parts[parts.length - 1] || '').toLowerCase();
  }

  function _deriveNewIngredientId(name, iconUrl, usedIds) {
    let base = '';
    const stem = _normalizeIconStem(iconUrl).replace(/\.(png|jpg|jpeg|webp|svg)$/i, '');
    if (stem && /^[a-z0-9_-]+$/.test(stem)) {
      base = stem.replace(/[^a-z0-9_]/g, '');
    }
    if (!base) {
      base = String(name || 'ingredient').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'custom_ing';
    }
    let id = base;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = base + '_' + suffix;
      suffix++;
    }
    return id;
  }

  function _normalizeLadderSpecialty(raw) {
    const s = String(raw || '').trim();
    if (!s) return '食材';
    if (s.includes('全部') || s.includes('全能') || s === 'All' || s === 'All-Rounder') return '全部';
    if (s.includes('樹果') || s === 'Berries' || s === 'Berry') return '樹果';
    if (s.includes('技能') || s === 'Skills' || s === 'Skill') return '技能';
    if (s.includes('食材') || s === 'Ingredients' || s === 'Ingredient') return '食材';
    return s;
  }

  function isPokemonFinalEvoForLadder(p) {
    if (!p) return false;
    const v = p.is_final;
    return v === '〇' || v === true || v === 'true' || v === 'O' || v === 1;
  }

  function _getLivePokemonSourceForLadder() {
    if (typeof window !== 'undefined') {
      if (window.PokemonApp && Array.isArray(window.PokemonApp.allPokemons) && window.PokemonApp.allPokemons.length > 0) {
        return window.PokemonApp.allPokemons;
      }
      if (Array.isArray(window.allPokemons) && window.allPokemons.length > 0) {
        return window.allPokemons;
      }
      if (Array.isArray(window.POKEMON_DATA) && window.POKEMON_DATA.length > 0) {
        return window.POKEMON_DATA;
      }
    }
    return null;
  }

  function _getLiveRecipesSourceForLadder() {
    if (typeof window !== 'undefined') {
      if (Array.isArray(window.allRecipes) && window.allRecipes.length > 0) return window.allRecipes;
      if (Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0) return window.__RECIPES_CACHE__;
    }
    try {
      const ls = (typeof window !== 'undefined' && window.localStorage)
        ? window.localStorage
        : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (ls && typeof ls.getItem === 'function') {
        const raw = ls.getItem('pksleep_cache_recipes_json');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {}
    return [];
  }

  function _categoryToEn(cat) {
    if (cat === '咖哩' || cat === 'Curry') return 'Curry';
    if (cat === '沙拉' || cat === 'Salad') return 'Salad';
    if (cat === '甜點' || cat === 'Dessert') return 'Dessert';
    return cat || 'Dish';
  }

  function getDynamicTopRecipeForIngredient(ingId, ingName, recipesOverride) {
    const staticMap = (typeof TOP_RECIPES_FOR_INGREDIENTS !== 'undefined' && TOP_RECIPES_FOR_INGREDIENTS) ? TOP_RECIPES_FOR_INGREDIENTS : {};
    const recipes = Array.isArray(recipesOverride) ? recipesOverride : _getLiveRecipesSourceForLadder();
    const metaById = ingId ? CANONICAL_INGREDIENT_META.find(m => m.id === ingId) : null;
    const resolvedName = ingName || (metaById && metaById.name) || '';
    const altCnName = (metaById && metaById.name) || '';
    const altEnName = (metaById && metaById.enName) || '';

    const fallback = (ingId && staticMap[ingId])
      ? staticMap[ingId]
      : { name: '高階料理', name_en: 'High Tier Dish', need: 20, type: '料理', type_en: 'Dish', energy: 0, icon: '', secondary: '' };

    if (!recipes || !recipes.length || (!resolvedName && !ingId)) {
      return fallback;
    }

    if (!recipesOverride && (_dynamicRecipeCache.len !== recipes.length || _dynamicRecipeCache.ref !== recipes)) {
      _dynamicRecipeCache = { len: recipes.length, ref: recipes, map: Object.create(null) };
    }
    const cacheKey = (ingId || '') + '|' + resolvedName;
    if (!recipesOverride && _dynamicRecipeCache.map[cacheKey]) {
      return _dynamicRecipeCache.map[cacheKey];
    }

    const matches = [];
    for (let i = 0; i < recipes.length; i++) {
      const r = recipes[i];
      if (!r || !Array.isArray(r.ingredients)) continue;
      const found = r.ingredients.find(item => item && (
        (resolvedName && (item.name === resolvedName || item.name_cn === resolvedName)) ||
        (altCnName && (item.name === altCnName || item.name_cn === altCnName)) ||
        (altEnName && (item.name === altEnName || item.name_en === altEnName)) ||
        (ingId && item.id === ingId) ||
        (ingId === 'tail' && (item.name === '美味尾巴' || item.name === 'Slowpoke Tail'))
      ));
      if (!found) continue;
      const need = Number(found.count || found.qty || 0);
      const energy = Number(r.base_energy || r.energy || 0);
      if (need > 0) {
        matches.push({ recipe: r, need, energy });
      }
    }

    if (matches.length === 0) {
      return fallback;
    }

    // Prioritize highest single-meal ingredient consumption so yield coverage guarantees zero shortage,
    // tie-broken by highest recipe base energy.
    matches.sort((a, b) => (b.need - a.need) || (b.energy - a.energy));
    const top = matches[0];
    const sec = matches[1] || null;
    const topNameCn = top.recipe.name_cn || top.recipe.name || '高階料理';
    const topNameEn = top.recipe.name_en || topNameCn;
    const secNameCn = sec ? (sec.recipe.name_cn || sec.recipe.name || '') : '';
    const secNameEn = sec ? (sec.recipe.name_en || secNameCn) : '';

    const derived = {
      name: topNameCn,
      name_en: topNameEn,
      need: top.need,
      type: top.recipe.category || '料理',
      type_en: _categoryToEn(top.recipe.category),
      energy: top.energy,
      icon: top.recipe.icon || '',
      secondary: sec ? `${secNameCn} (${sec.need})` : '',
      secondary_en: sec ? `${secNameEn} (${sec.need})` : ''
    };

    if (!recipesOverride) {
      _dynamicRecipeCache.map[cacheKey] = derived;
      if (ingId && staticMap) {
        staticMap[ingId] = derived;
      }
    }
    return derived;
  }

  function buildDynamicIngredientLadder(pokemonList, options) {
    const opts = options || {};
    const finalOnly = opts.finalOnly !== undefined ? !!opts.finalOnly : true;
    const minFinalSafetyFloor = opts.minFinalSafetyFloor !== undefined ? opts.minFinalSafetyFloor : 2;
    const list = Array.isArray(pokemonList) ? pokemonList : [];

    // 1. Build canonical ingredient metadata lookup + auto-discover new ingredients
    const ingValuesList = (typeof INGREDIENT_VALUES_DATA !== 'undefined' && Array.isArray(INGREDIENT_VALUES_DATA))
      ? INGREDIENT_VALUES_DATA
      : CANONICAL_INGREDIENT_META;
    const metaByName = new Map();
    const usedIds = new Set();
    const orderedTracks = [];

    const ladderSeedGc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
                         (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    const gcIngs = (ladderSeedGc && Array.isArray(ladderSeedGc.CANONICAL_INGREDIENTS))
      ? ladderSeedGc.CANONICAL_INGREDIENTS
      : [];
    const seedList = CANONICAL_INGREDIENT_META.concat(
      gcIngs.filter(v => v && v.name && !CANONICAL_INGREDIENT_META.some(c => c.name === v.name)),
      ingValuesList.filter(v => v && v.name && !CANONICAL_INGREDIENT_META.some(c => c.name === v.name))
    );
    seedList.forEach(m => {
      if (!m || !m.name || metaByName.has(m.name)) return;
      const trackMeta = {
        id: m.id,
        name: m.name,
        enName: m.enName || m.name,
        energy: Number(m.energy) || 115,
        icon: m.icon || ''
      };
      metaByName.set(m.name, trackMeta);
      usedIds.add(trackMeta.id);
      orderedTracks.push(trackMeta);
    });

    // Discover any 21st+ unknown ingredients from live Pokemon data
    list.forEach(p => {
      if (!p || !Array.isArray(p.ingredients)) return;
      p.ingredients.forEach(ing => {
        if (!ing || !ing.name || metaByName.has(ing.name)) return;
        const derivedId = _deriveNewIngredientId(ing.name, ing.icon, usedIds);
        const enName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getIngredientName === 'function')
          ? (window.I18N.getIngredientName(ing.name) || ing.name)
          : derivedId.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
        const trackMeta = {
          id: derivedId,
          name: ing.name,
          enName: enName,
          energy: 115,
          icon: ing.icon || ''
        };
        metaByName.set(ing.name, trackMeta);
        usedIds.add(derivedId);
        orderedTracks.push(trackMeta);
      });
    });

    // 2. Deduplicate same-ID same-icon body-size variants (e.g., Gourgeist Small/Average/Large/Super)
    //    and consolidate the 8 Eeveelutions (identical ingredient production) into 伊布家族（8種進化）.
    const EEVEELUTION_NAMES = new Set(['水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布']);
    const dedupeBuckets = new Map();
    const bucketOrder = [];
    list.forEach((p, rawIdx) => {
      if (!p || !Array.isArray(p.ingredients) || p.ingredients.length === 0) return;
      const baseIntervalSec = _parseLadderIntervalSec(p.interval || p.help_interval || p.frequency);
      const ingRate = _parseLadderIngRate(p.ingredient_rate || p.ingredientRate);
      if (baseIntervalSec <= 0 || ingRate <= 0) return;

      const iconStem = _normalizeIconStem(p.icon_url || p.icon || '');
      const isFinal = isPokemonFinalEvoForLadder(p);
      const rawCn = p.name_cn || p.name || '';
      const isEeveeFam = isFinal && EEVEELUTION_NAMES.has(rawCn);
      const key = isEeveeFam ? 'eevee_family_8' : `${String(p.id || rawIdx)}|${iconStem}|${isFinal ? '1' : '0'}`;

      const effectiveSec = Math.max(600, Math.round(baseIntervalSec * 0.882));
      const idealSec = effectiveSec * 0.45;
      const ingHelpsPerDay = (86400 / idealSec) * ingRate;

      if (!dedupeBuckets.has(key)) {
        dedupeBuckets.set(key, []);
        bucketOrder.push(key);
      }
      dedupeBuckets.get(key).push({ p, rawIdx, isFinal, ingHelpsPerDay, isEeveeFam });
    });

    const selectedPokemon = [];
    bucketOrder.forEach(key => {
      const group = dedupeBuckets.get(key);
      if (key === 'eevee_family_8' && group.length > 1) {
        group.sort((a, b) => (b.ingHelpsPerDay - a.ingHelpsPerDay) || (a.rawIdx - b.rawIdx));
        selectedPokemon.push({
          ...group[0],
          displayName: '伊布家族（8種進化）',
          displayNameEn: 'Eevee Evolutions (8 Forms)',
          overrideIcon: 'https://www.serebii.net/pokemonsleep/pokemon/icon/133.png',
          overrideNumId: 133,
          noteSuffix: ' (8種進化產量皆相同)'
        });
        return;
      }
      if (group.length === 1) {
        selectedPokemon.push({
          ...group[0],
          displayName: group[0].p.name_cn || group[0].p.name || '',
          displayNameEn: group[0].p.name_en || ''
        });
        return;
      }
      // Multiple forms share exact same ID + icon -> pick highest daily ingredient helps (fastest)
      group.sort((a, b) => (b.ingHelpsPerDay - a.ingHelpsPerDay) || (a.rawIdx - b.rawIdx));
      const best = group[0];
      const rawName = best.p.name_cn || best.p.name || '';
      const baseCn = rawName.replace(/\s*[（\(][^）\)]+[）\)]\s*$/, '').trim();
      const allSameBase = baseCn && group.every(g => {
        const gn = (g.p.name_cn || g.p.name || '').replace(/\s*[（\(][^）\)]+[）\)]\s*$/, '').trim();
        return gn === baseCn;
      });
      const rawEn = best.p.name_en || '';
      const baseEn = rawEn.replace(/\s*\([^)]+\)\s*$/, '').trim();
      selectedPokemon.push({
        ...best,
        displayName: allSameBase ? baseCn : rawName,
        displayNameEn: allSameBase && baseEn ? baseEn : rawEn
      });
    });

    // 3. Populate raw per-track entries for every (Pokemon, Ingredient) across slots A / B / C
    const trackEntriesMap = new Map();
    orderedTracks.forEach(t => trackEntriesMap.set(t.name, []));

    selectedPokemon.forEach(item => {
      const p = item.p;
      const ingHelpsPerDay = item.ingHelpsPerDay;
      const ings = p.ingredients;
      const ingA = ings[0] || null;
      const ingB = ings[1] || null;
      const ingC = ings[2] || null;
      const spec = _normalizeLadderSpecialty(p.specialty);
      const iconUrl = item.overrideIcon || p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '');
      const numericId = item.overrideNumId !== undefined ? item.overrideNumId : (parseInt(String(p.id || '99999'), 10) || 99999);
      const noteSuffix = item.noteSuffix || '';

      function pushEntry(ingName, rawVariants) {
        const listForTrack = trackEntriesMap.get(ingName);
        if (!listForTrack) return;

        // Filter out non-positive yields and deduplicate identical rounded counts (preserving priority)
        const kept = [];
        const seenCounts = new Set();
        rawVariants.forEach(v => {
          if (!v || v.count <= 0) return;
          if (seenCounts.has(v.count)) return;
          seenCounts.add(v.count);
          kept.push(noteSuffix ? { ...v, note: v.note + noteSuffix } : v);
        });
        if (kept.length === 0) return;
        kept.sort((a, b) => b.count - a.count);

        const topVar = kept[0];
        listForTrack.push({
          name: item.displayName,
          name_en: item.displayNameEn || undefined,
          id: String(p.id || ''),
          _numId: numericId,
          isFinal: item.isFinal,
          specialty: spec,
          icon: iconUrl,
          recipe: topVar.recipe,
          count: topVar.count,
          note: topVar.note,
          isTop: false,
          variants: kept
        });
      }

      // Slot A (l1, l30, l60)
      if (ingA && ingA.name) {
        const l1 = Number(ingA.l1 || 0);
        const l30 = Number(ingA.l30 || 0);
        const l60 = Number(ingA.l60 || 0);
        const variantsA = [
          { recipe: 'AAA', count: Math.round(ingHelpsPerDay * (l1 + l30 + l60) / 3), note: `AAA ${ingA.name} 純種產出` },
          { recipe: 'ABA', count: Math.round(ingHelpsPerDay * (l1 + l60) / 3), note: `ABA 雙${ingA.name} 產出` },
          { recipe: 'AAX', count: Math.round(ingHelpsPerDay * (l1 + l30) / 3), note: `AAX 雙${ingA.name} 產出`, origRecipes: ['AAB', 'AAC'] },
          { recipe: 'ABX', count: Math.round(ingHelpsPerDay * l1 / 3), note: `ABX 單${ingA.name} 混產`, origRecipes: ['ABB', 'ABC'] }
        ];
        pushEntry(ingA.name, variantsA);
      }

      // Slot B (l30, l60) when distinct from Slot A
      if (ingB && ingB.name && (!ingA || ingB.name !== ingA.name)) {
        const l30 = Number(ingB.l30 || 0);
        const l60 = Number(ingB.l60 || 0);
        const variantsB = [
          { recipe: 'ABB', count: Math.round(ingHelpsPerDay * (l30 + l60) / 3), note: `ABB ${ingB.name} 主力產出` },
          { recipe: 'AAB', count: Math.round(ingHelpsPerDay * l60 / 3), note: `AAB ${ingB.name} 後期主力` },
          { recipe: 'ABX', count: Math.round(ingHelpsPerDay * l30 / 3), note: `ABX ${ingB.name} 兼顧`, origRecipes: ['ABA', 'ABC'] }
        ];
        pushEntry(ingB.name, variantsB);
      }

      // Slot C (l60) when distinct from Slot A and Slot B
      if (ingC && ingC.name && (!ingA || ingC.name !== ingA.name) && (!ingB || ingC.name !== ingB.name)) {
        const l60 = Number(ingC.l60 || 0);
        const variantsC = [
          { recipe: 'XXC', count: Math.round(ingHelpsPerDay * l60 / 3), note: `XXC 單${ingC.name} 補足`, origRecipes: ['AAC', 'ABC'] }
        ];
        pushEntry(ingC.name, variantsC);
      }
    });

    // 4. Sort tracks (energy ascending, tail always last) and apply finalOnly + rare-track floor
    const ladderGc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
                     (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    orderedTracks.sort((a, b) => {
      if (a.id === 'tail' && b.id !== 'tail') return 1;
      if (b.id === 'tail' && a.id !== 'tail') return -1;
      if (a.energy !== b.energy) return a.energy - b.energy;
      if (ladderGc && typeof ladderGc.getIngredientSortOrder === 'function') {
        return ladderGc.getIngredientSortOrder(a.name || a.id) - ladderGc.getIngredientSortOrder(b.name || b.id);
      }
      return 0;
    });

    return orderedTracks.map(meta => {
      const allEntries = trackEntriesMap.get(meta.name) || [];
      let chosen = allEntries;
      if (finalOnly) {
        const finals = allEntries.filter(e => e.isFinal);
        chosen = finals.length >= minFinalSafetyFloor ? finals : allEntries;
      }

      chosen.sort((a, b) => (b.count - a.count) || ((b.isFinal ? 1 : 0) - (a.isFinal ? 1 : 0)) || (a._numId - b._numId));

      const maxCount = chosen.length > 0 ? chosen[0].count : 0;
      const cleanPokemon = chosen.map(entry => {
        const isTop = maxCount > 0 && entry.count === maxCount;
        const cleanVariants = entry.variants.map((v, vIdx) => {
          const out = { recipe: v.recipe, count: v.count, note: v.note };
          if (isTop && vIdx === 0) out.isTop = true;
          if (v.origRecipes) out.origRecipes = v.origRecipes.slice();
          return out;
        });
        const outEntry = {
          name: entry.name,
          specialty: entry.specialty,
          icon: entry.icon,
          recipe: entry.recipe,
          count: entry.count,
          note: entry.note,
          isTop: isTop,
          isFinal: entry.isFinal,
          variants: cleanVariants
        };
        if (entry.name_en) outEntry.name_en = entry.name_en;
        return outEntry;
      });

      const trackObj = {
        id: meta.id,
        name: meta.name,
        enName: meta.enName,
        energy: meta.energy,
        icon: meta.icon,
        pokemon: cleanPokemon
      };
      if (meta.id === 'tail') {
        trackObj.isSpecialScale = true;
      }
      return trackObj;
    });
  }

  function getActiveCoordinateLadderData(forceFinalOnly) {
    const useFinalOnly = forceFinalOnly !== undefined ? !!forceFinalOnly : ladderFinalOnly;
    const liveList = _getLivePokemonSourceForLadder();
    if (!liveList || liveList.length === 0) {
      return (typeof LV60_COORDINATE_LADDER_DATA !== 'undefined' && Array.isArray(LV60_COORDINATE_LADDER_DATA))
        ? LV60_COORDINATE_LADDER_DATA
        : [];
    }

    const firstId = liveList[0] ? String(liveList[0].id || '') : '';
    const lastId = liveList[liveList.length - 1] ? String(liveList[liveList.length - 1].id || '') : '';
    const cacheKey = `${liveList.length}|${firstId}|${lastId}|${useFinalOnly ? 1 : 0}`;
    if (_dynamicLadderCache.key === cacheKey && Array.isArray(_dynamicLadderCache.data)) {
      return _dynamicLadderCache.data;
    }

    const built = buildDynamicIngredientLadder(liveList, { finalOnly: useFinalOnly });
    _dynamicLadderCache = { key: cacheKey, data: built };
    return built;
  }

  function invalidateDynamicLadderCache() {
    _dynamicLadderCache = { key: '', data: null };
    _dynamicRecipeCache = { len: -1, ref: null, map: Object.create(null) };
    if (typeof _coordLadderRenderCache !== 'undefined' && _coordLadderRenderCache) {
      _coordLadderRenderCache.key = '';
      _coordLadderRenderCache.html = '';
    }
  }

  function toggleLadderFinalOnly(enabled) {
    ladderFinalOnly = enabled !== undefined ? !!enabled : !ladderFinalOnly;
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('#ladder-final-only-switch').forEach(el => {
        el.checked = ladderFinalOnly;
      });
    }
    invalidateDynamicLadderCache();
    if (typeof refreshCoordinateLadder === 'function') {
      refreshCoordinateLadder();
    }
  }

  function getLadderFinalOnly() {
    return ladderFinalOnly;
  }

  // Register live sync listeners once so incoming data.json / recipes.json refreshes ladders automatically
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function' && !window.__pksleepLadderSyncBound) {
    window.__pksleepLadderSyncBound = true;
    const _onLiveDataUpdated = function () {
      invalidateDynamicLadderCache();
      if (typeof refreshCoordinateLadder === 'function') {
        try { refreshCoordinateLadder(); } catch (e) {}
      }
      if (typeof refreshSkillCoordinateLadder === 'function') {
        try { refreshSkillCoordinateLadder(); } catch (e) {}
      }
    };
    window.addEventListener('pokemon-data-updated', _onLiveDataUpdated);
    window.addEventListener('recipes-data-updated', function (e) {
      invalidateDynamicLadderCache();
      if (typeof recomputeTopRecipesByCategory === 'function') {
        try { recomputeTopRecipesByCategory(e && e.detail); } catch (err) {}
      }
      if (typeof refreshCoordinateLadder === 'function') {
        try { refreshCoordinateLadder(); } catch (err) {}
      }
      if (typeof document !== 'undefined') {
        const modal = (typeof getOverlayEl === 'function')
          ? getOverlayEl('ladder-recipe-modal')
          : (document.getElementById ? document.getElementById('ladder-recipe-modal') : null);
        if (modal && modal.style && modal.style.display === 'flex' && typeof renderLadderRecipeModalContent === 'function') {
          try { renderLadderRecipeModalContent(modal); } catch (err) {}
        }
      }
    });
  }
