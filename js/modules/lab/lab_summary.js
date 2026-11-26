  function getAllTargetRecipes() {
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0) {
      return window.__RECIPES_CACHE__;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.allRecipes) && window.allRecipes.length > 0) {
      return window.allRecipes;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('pksleep_cache_recipes_json');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.__RECIPES_CACHE__ = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {}
    return TARGET_TOP_RECIPES;
  }

  function findTargetRecipe(name) {
    if (!name) return TARGET_TOP_RECIPES[0];
    const list = getAllTargetRecipes();
    const found = list.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           TARGET_TOP_RECIPES.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           list[0] || TARGET_TOP_RECIPES[0];
    if (found && !found.icon) {
      const topMatch = (typeof window !== 'undefined' && Array.isArray(window.ALL_TOP_CATEGORY_RECIPES))
        ? window.ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === (found.name_cn || found.name) || r.name_en === (found.name_en || found.name))
        : null;
      if (topMatch && topMatch.icon) {
        found.icon = topMatch.icon;
        if (!found.category) found.category = topMatch.category;
        if (!found.pot_size) found.pot_size = topMatch.pot_size;
      } else if (found.name_en) {
        const slug = found.name_en.toLowerCase().replace(/[^a-z0-9]/g, '');
        found.icon = 'https://www.serebii.net/pokemonsleep/meals/' + slug + '.png';
      }
    }
    return found;
  }

  const _sigRecipeRecCache = Object.create(null);

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('recipes-data-updated', function() {
      for (const k in _sigRecipeRecCache) {
        delete _sigRecipeRecCache[k];
      }
    });
  }

  function formatSummaryRecipeChip(rec) {
    if (!rec) return '';
    const name = window.I18N?.getRecipeName?.(rec) ?? (rec.name_cn || rec.name_en || '');
    const icon = rec.icon || rec.icon_url || '';
    if (!icon) return window.I18N?.t?.('lab.t_recipe_quote', { name }) ?? 'lab.t_recipe_quote';
    return `<span class="appraisal-summary-recipe-chip" title="${name}"><img src="${icon}" class="appraisal-summary-recipe-icon" alt="${name}" loading="lazy" onerror="this.style.display='none'; if (this.nextElementSibling) { this.nextElementSibling.style.position='static'; this.nextElementSibling.style.clip='auto'; this.nextElementSibling.style.width='auto'; this.nextElementSibling.style.height='auto'; }"><span class="sr-only">${name}</span></span>`;
  }

  function getSignatureRecipeRecommendations(ingredients) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) return '';
    const normIngs = Array.from(new Set(
      ingredients.map(function(item) {
        if (!item) return '';
        const raw = typeof item === 'string' ? item : (item.name || '');
        return normalizeIngName(raw);
      }).filter(Boolean)
    ));

    if (normIngs.length === 0) return '';

    const topCategoryPool = (typeof window !== 'undefined' && Array.isArray(window.ALL_TOP_CATEGORY_RECIPES) && window.ALL_TOP_CATEGORY_RECIPES.length > 0)
      ? window.ALL_TOP_CATEGORY_RECIPES
      : null;
    const liveCachePool = (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0)
      ? window.__RECIPES_CACHE__
      : (typeof window !== 'undefined' && Array.isArray(window.allRecipes) && window.allRecipes.length > 0)
        ? window.allRecipes
        : null;

    let pool;
    if (liveCachePool && topCategoryPool) {
      const seen = new Set();
      pool = [];
      const addRecipe = function(r) {
        if (!r) return;
        const key = r.name_cn || r.name || r.name_en || '';
        if (!key || seen.has(key)) return;
        seen.add(key);
        pool.push(r);
      };
      liveCachePool.forEach(function(r) {
        if (r && (r.base_energy || 0) >= 7000) addRecipe(r);
      });
      topCategoryPool.forEach(addRecipe);
    } else if (liveCachePool) {
      const highTier = liveCachePool.filter(function(r) { return r && (r.base_energy || 0) >= 7000; });
      pool = highTier.length > 0 ? highTier : liveCachePool;
    } else if (topCategoryPool) {
      pool = topCategoryPool;
    } else {
      pool = TARGET_TOP_RECIPES;
    }

    const curLang = window.I18N?.pick?.({ 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN', 'en-US': 'en-US' }) ?? 'zh-TW';
    const cacheKey = curLang + ':' + (liveCachePool ? liveCachePool.length : 0) + ':' + pool.length + ':' + normIngs.join('|');
    const cachedRec = _sigRecipeRecCache[cacheKey];
    if (cachedRec !== undefined) return cachedRec;

    const scored = pool.map(function(recipe) {
      if (!recipe || !recipe.ingredients) return null;
      let matchCount = 0;
      let matchRequired = 0;
      recipe.ingredients.forEach(function(ing) {
        const normRecipeIng = normalizeIngName(ing.name || ing);
        if (normIngs.indexOf(normRecipeIng) !== -1) {
          matchCount++;
          matchRequired += (ing.count || 0);
        }
      });
      if (matchCount === 0) return null;

      const hasTail = normIngs.indexOf('美味尾巴') !== -1;
      const recipeHasTail = recipe.ingredients.some(function(i) { return (i.name || '').includes('尾巴'); });
      const tailBonus = (hasTail && recipeHasTail) ? 20000 : 0;
      const multiMatchBonus = (matchCount - 1) * 9000;
      const score = (recipe.base_energy || 0) + multiMatchBonus + (matchRequired * 40) + tailBonus;

      return {
        recipe: recipe,
        name_cn: recipe.name_cn,
        name_en: recipe.name_en,
        matchCount: matchCount,
        score: score
      };
    }).filter(Boolean).sort(function(a, b) {
      return b.score - a.score;
    });

    if (scored.length === 0) {
      _sigRecipeRecCache[cacheKey] = '';
      return '';
    }

    const top1 = scored[0];
    const top2 = scored.length > 1 ? scored[1] : null;

    const chip1 = formatSummaryRecipeChip(top1.recipe);
    const chip2 = top2 ? formatSummaryRecipeChip(top2.recipe) : '';

    let res = '';
    if (top2 && top2.name_cn !== top1.name_cn) {
      res = window.I18N?.t?.('lab.t_sig_recipes_two', { chip1, chip2 }) ?? 'lab.t_sig_recipes_two';
    } else {
      res = window.I18N?.t?.('lab.t_sig_recipes_one', { chip1 }) ?? 'lab.t_sig_recipes_one';
    }
    _sigRecipeRecCache[cacheKey] = res;
    return res;
  }

  /* ─── 智能深度簡評生成引擎 (Intelligent Appraisal Summary Engine) ─── */
  function generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation) {
    if (!pkmData) return '';
    const specialty = pkmData.specialty || '';
    const isBerry = specialty.includes('樹果') || specialty === 'Berries';
    const isIng = specialty.includes('食材') || specialty === 'Ingredients';
    const isSkill = specialty.includes('技能') || specialty === 'Skills';
    const mainSkill = pkmData.main_skill || '';
    const currentGrade = (evaluation && evaluation.current && evaluation.current.grade) || (evaluation && evaluation.grade) || 'B';
    const currentScore = (evaluation && evaluation.current && evaluation.current.compositeScore) || (evaluation && evaluation.compositeScore) || 50;

    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    const slotLevels = [10, 25, 50, 70, 80];
    const activeSubskills = [];
    const futureSubskills = [];
    slotLevels.forEach(function(lv, idx) {
      const sk = subskillArr[idx];
      if (!sk) return;
      if (currentLv >= lv) {
        activeSubskills.push({ name: sk, level: lv });
      } else {
        futureSubskills.push({ name: sk, level: lv });
      }
    });

    const activeNames = activeSubskills.map(function(s) { return s.name; });

    const isMint = !!(pkmData && (pkmData.cleanseMint || pkmData.mint));
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    const buff = isMint ? 'none' : (natureObj ? natureObj.buffType : 'none');
    const debuff = isMint ? 'none' : (natureObj ? natureObj.debuffType : 'none');

    // 特殊角色識別
    const isSlowpoke = isSlowpokeFamily(pkmData);
    const isBerryBurst = isBerryBurstSkillSpecialist(pkmData);
    const isHealer = isHealerSkillSpecialist(pkmData);
    const isHelperBoost = isHelperBoostSkillSpecialist(pkmData);
    const isChargeStrength = isChargeStrengthSkillSpecialist(pkmData);
    const isPotExpander = isPotExpanderSkillSpecialist(pkmData);
    const isExtraTasty = isExtraTastySkillSpecialist(pkmData);
    const isDreamShard = isDreamShardSkillSpecialist(pkmData);
    const isIngSkill = isIngredientSkillSpecialist(pkmData);
    const isMetronome = isMetronomeSkillSpecialist(pkmData);
    const isLegendary = isLegendaryPokemon(pkmData);

    // 關鍵副技能持有檢測
    const hasBFS_active = activeNames.indexOf('樹果數量S') !== -1 || activeNames.indexOf('Berry Finding S') !== -1;
    const hasBFS_future = futureSubskills.find(function(s) { return s.name === '樹果數量S' || s.name === 'Berry Finding S'; });

    const hasHB_active = activeNames.indexOf('幫手獎勵') !== -1 || activeNames.indexOf('Helping Bonus') !== -1;

    const hasIngM_active = activeNames.indexOf('食材機率提升M') !== -1 || activeNames.indexOf('Ingredient Finder M') !== -1;
    const hasIngS_active = activeNames.indexOf('食材機率提升S') !== -1 || activeNames.indexOf('Ingredient Finder S') !== -1;
    const hasIngM_future = futureSubskills.find(function(s) { return s.name === '食材機率提升M' || s.name === 'Ingredient Finder M'; });

    const hasSkillM_active = activeNames.indexOf('技能機率提升M') !== -1 || activeNames.indexOf('Skill Trigger M') !== -1;
    const hasSkillS_active = activeNames.indexOf('技能機率提升S') !== -1 || activeNames.indexOf('Skill Trigger S') !== -1;
    const hasSkillM_future = futureSubskills.find(function(s) { return s.name === '技能機率提升M' || s.name === 'Skill Trigger M'; });

    const hasSpeedM_active = activeNames.indexOf('幫忙速度M') !== -1 || activeNames.indexOf('Helping Speed M') !== -1;

    const hasInv_active = activeNames.some(function(s) { return s.indexOf('持有上限') !== -1 || s.indexOf('Inventory Up') !== -1; });

    // 食材組合分析
    let ingArr = (ingredients || []).map(function(item) {
      if (!item) return '';
      return typeof item === 'string' ? item : (item.name || '');
    }).filter(Boolean);
    if (ingArr.length === 0 && pkmData && pkmData.ingredients) {
      ingArr = pkmData.ingredients.map(function(i) {
        return typeof i === 'string' ? i : (i.name || '');
      }).filter(Boolean);
    }
    if (ingArr.length === 0 && pkmData && (pkmData.ing1 || pkmData.ing2 || pkmData.ing3)) {
      ingArr = [pkmData.ing1, pkmData.ing2, pkmData.ing3].filter(Boolean);
    }

    const isAAA = ingArr.length >= 3 && ingArr[0] === ingArr[1] && ingArr[1] === ingArr[2];
    const isABB = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] === ingArr[2];
    const isABC = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] !== ingArr[2] && ingArr[0] !== ingArr[2];
    const hasTailLv30 = ingArr.length >= 2 && (ingArr[1] === '美味尾巴' || (ingArr[1] && ingArr[1].indexOf('尾巴') !== -1) || (ingArr[1] && ingArr[1].toLowerCase().indexOf('tail') !== -1));

    // 1. 呆呆獸家族 (核心戰略使命：解鎖美味尾巴)
    if (isSlowpoke) {
      if (hasTailLv30) {
        const slowpokeTailSalad = findTargetRecipe('呆呆獸尾巴的胡椒沙拉');
        const grilledTailCurry = findTargetRecipe('炙燒尾肉咖哩');
        const chip1 = formatSummaryRecipeChip(slowpokeTailSalad);
        const chip2 = formatSummaryRecipeChip(grilledTailCurry);
        return window.I18N?.t?.('lab.t_sum_slowpoke_ok', { chip1, chip2 }) ?? 'lab.t_sum_slowpoke_ok';
      } else {
        return window.I18N?.t?.('lab.t_sum_slowpoke_fail') ?? 'lab.t_sum_slowpoke_fail';
      }
    }

    // 2. 樹果型專精分析
    if (isBerry) {
      if (hasBFS_active) {
        if (hasHB_active || hasSpeedM_active || buff === 'speed' || debuff === 'ingredient') {
          return window.I18N?.t?.('lab.t_sum_berry_top') ?? 'lab.t_sum_berry_top';
        } else {
          return window.I18N?.t?.('lab.t_sum_berry_bfs') ?? 'lab.t_sum_berry_bfs';
        }
      } else if (hasBFS_future) {
        return window.I18N?.t?.('lab.t_sum_berry_future_bfs', { lv: hasBFS_future.level }) ?? 'lab.t_sum_berry_future_bfs';
      } else {
        if (hasHB_active && (hasSpeedM_active || buff === 'speed')) {
          return window.I18N?.t?.('lab.t_sum_berry_speed') ?? 'lab.t_sum_berry_speed';
        } else if (debuff === 'speed') {
          return window.I18N?.t?.('lab.t_sum_berry_slow') ?? 'lab.t_sum_berry_slow';
        } else {
          return window.I18N?.t?.('lab.t_sum_berry_trans') ?? 'lab.t_sum_berry_trans';
        }
      }
    }

    // 3. 技能型專精分析 (全面精細化劃分各大戰略流派)
    if (isSkill) {
      // 3.1 樹果遽增型 (Berry Burst: 謎擬Q, 蜥蜴王, 烈焰猴, 勇士雄鷹, 拉帝歐斯)
      if (isBerryBurst) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return window.I18N?.t?.('lab.t_sum_burst_top') ?? 'lab.t_sum_burst_top';
          }
          return window.I18N?.t?.('lab.t_sum_burst_bfs') ?? 'lab.t_sum_burst_bfs';
        }
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_burst_freq') ?? 'lab.t_sum_burst_freq';
        }
        return window.I18N?.t?.('lab.t_sum_burst_base') ?? 'lab.t_sum_burst_base';
      }

      // 3.2 活力全體療癒補師 (Healers: 沙奈朵, 仙子伊布, 胖可丁, 巴布土撥, 克雷色利亞, 壺壺)
      if (isHealer) {
        if (debuff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_healer_bad') ?? 'lab.t_sum_healer_bad';
        }
        if (hasSkillM_active && (buff === 'skill' || hasSpeedM_active || hasHB_active)) {
          const extraNote = hasBFS_active ? (window.I18N?.t?.('lab.t_sum_healer_bfs_note') ?? 'lab.t_sum_healer_bfs_note') : '';
          return window.I18N?.t?.('lab.t_sum_healer_top', { extraNote }) ?? 'lab.t_sum_healer_top';
        }
        if (!hasSkillM_active && !hasSkillS_active && buff !== 'skill') {
          if (hasSkillM_future) {
            return window.I18N?.t?.('lab.t_sum_healer_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_healer_future';
          }
          return window.I18N?.t?.('lab.t_sum_healer_low') ?? 'lab.t_sum_healer_low';
        }
        return window.I18N?.t?.('lab.t_sum_healer_ok') ?? 'lab.t_sum_healer_ok';
      }

      // 3.3 傳說神獸幫手加速型 (Helper Boost: 雷公, 炎帝, 水君, 風速狗, 雷伊布, 艾路雷朵)
      if (isHelperBoost) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_helper_top') ?? 'lab.t_sum_helper_top';
        }
        return window.I18N?.t?.('lab.t_sum_helper_base') ?? 'lab.t_sum_helper_base';
      }

      // 3.4 單體充能直傷型 (Charge Strength S/M: 電龍, 太陽伊布, 哥達鴨, 樹才怪, 隨風球, 音波龍, 達克萊伊)
      if (isChargeStrength) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return window.I18N?.t?.('lab.t_sum_charge_hybrid_top') ?? 'lab.t_sum_charge_hybrid_top';
          }
          return window.I18N?.t?.('lab.t_sum_charge_hybrid') ?? 'lab.t_sum_charge_hybrid';
        }
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_charge_freq') ?? 'lab.t_sum_charge_freq';
        }
        return window.I18N?.t?.('lab.t_sum_charge_base') ?? 'lab.t_sum_charge_base';
      }

      // 3.5 傳說/幻之寶可夢專屬機制 (超夢, 夢幻, 達克萊伊, 克雷色利亞)
      if (isLegendary) {
        if (mainSkill.includes('精神擊破') || mainSkill.includes('樹果領域')) {
          return window.I18N?.t?.('lab.t_sum_leg_psystrike') ?? 'lab.t_sum_leg_psystrike';
        }
        if (mainSkill.includes('十項全能') || mainSkill.includes('揮指')) {
          return window.I18N?.t?.('lab.t_sum_leg_decathlon') ?? 'lab.t_sum_leg_decathlon';
        }
        if (mainSkill.includes('夢魘')) {
          return window.I18N?.t?.('lab.t_sum_leg_dark') ?? 'lab.t_sum_leg_dark';
        }
      }

      // 3.6 料理美味度/大成功型 (Extra Tasty: 咚咚鼠, 海豹球佳節)
      if (isExtraTasty) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_tasty_top') ?? 'lab.t_sum_tasty_top';
        }
        return window.I18N?.t?.('lab.t_sum_tasty_base') ?? 'lab.t_sum_tasty_base';
      }

      // 3.7 料理擴鍋型 (Pot Expanders: 自爆磁怪, 火伊布, 冰伊布, 負電拍拍, 顫弦蠑螈)
      if (isPotExpander) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_pot_top') ?? 'lab.t_sum_pot_top';
        }
        return window.I18N?.t?.('lab.t_sum_pot_base') ?? 'lab.t_sum_pot_base';
      }

      // 3.8 夢之碎片型 (Dream Shards: 路卡利歐, 喵喵, 貓老大, 勾魂眼, 吞食獸)
      if (isDreamShard) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_shard_top') ?? 'lab.t_sum_shard_top';
        }
        return window.I18N?.t?.('lab.t_sum_shard_base') ?? 'lab.t_sum_shard_base';
      }

      // 3.9 食材獲取/精選型技能寵 (Ingredient Draw: 水伊布, 伊布, 毒電嬰, 正電拍拍, 穿山王, 摔角鷹人, 赫拉克羅斯)
      if (isIngSkill) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_ingskill_top') ?? 'lab.t_sum_ingskill_top';
        }
        return window.I18N?.t?.('lab.t_sum_ingskill_base') ?? 'lab.t_sum_ingskill_base';
      }

      // 3.10 隨機揮指型 (Metronome: 波克基斯, 波克比, 夢幻)
      if (isMetronome) {
        return window.I18N?.t?.('lab.t_sum_metronome') ?? 'lab.t_sum_metronome';
      }

      if (debuff === 'skill') {
        return window.I18N?.t?.('lab.t_sum_skill_bad') ?? 'lab.t_sum_skill_bad';
      }
      if (hasSkillM_active || buff === 'skill') {
        if (hasSkillM_future) {
          return window.I18N?.t?.('lab.t_sum_skill_anchor_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_skill_anchor_future';
        }
        return window.I18N?.t?.('lab.t_sum_skill_anchor') ?? 'lab.t_sum_skill_anchor';
      }
      if (hasSkillM_future) {
        return window.I18N?.t?.('lab.t_sum_skill_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_skill_future';
      }
      return window.I18N?.t?.('lab.t_sum_skill_base') ?? 'lab.t_sum_skill_base';
    }

    // 4. 食材型專精分析 (嚴禁混入技能型要求)
    if (isIng) {
      if (debuff === 'ingredient') {
        return window.I18N?.t?.('lab.t_sum_ing_bad') ?? 'lab.t_sum_ing_bad';
      }

      const recipeSynergy = getSignatureRecipeRecommendations(ingArr);
      const recipePhrase = recipeSynergy ? ` ${recipeSynergy}` : '';

      let ingSpreadDesc = '';
      if (isAAA) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_aaa') ?? 'lab.t_sum_ing_aaa';
      } else if (isABB) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_abb') ?? 'lab.t_sum_ing_abb';
      } else if (isABC) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_abc') ?? 'lab.t_sum_ing_abc';
      }

      if (hasIngM_active || buff === 'ingredient') {
        if (hasBFS_active) {
          if (hasInv_active) {
            return window.I18N?.t?.('lab.t_sum_ing_hybrid_inv', { recipePhrase }) ?? 'lab.t_sum_ing_hybrid_inv';
          } else {
            return window.I18N?.t?.('lab.t_sum_ing_hybrid_noinv', { recipePhrase }) ?? 'lab.t_sum_ing_hybrid_noinv';
          }
        }

        return window.I18N?.t?.('lab.t_sum_ing_top', { recipePhrase, ingSpreadDesc }) ?? 'lab.t_sum_ing_top';
      }

      if (!hasIngM_active && !hasIngS_active && buff !== 'ingredient') {
        if (hasIngM_future) {
          return window.I18N?.t?.('lab.t_sum_ing_future', { lv: hasIngM_future.level, recipePhrase }) ?? 'lab.t_sum_ing_future';
        }
        if (hasSpeedM_active || buff === 'speed' || hasHB_active) {
          return window.I18N?.t?.('lab.t_sum_ing_speed', { recipePhrase }) ?? 'lab.t_sum_ing_speed';
        }
        return window.I18N?.t?.('lab.t_sum_ing_low', { recipePhrase }) ?? 'lab.t_sum_ing_low';
      }

      return window.I18N?.t?.('lab.t_sum_ing_solid', { recipePhrase, ingSpreadDesc }) ?? 'lab.t_sum_ing_solid';
    }

    return window.I18N?.t?.('lab.t_sum_fallback', { grade: currentGrade, score: currentScore }) ?? 'lab.t_sum_fallback';
  }

  /* ─── 對外入口：雙軌評級與里程碑評定 (Dual-Track Appraisal API) ─────── */
  const _evalPokemonCache = Object.create(null);
  let _evalPokemonCacheCount = 0;

  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, cleanseMint) {
    if (!pkmData) return null;
    currentLv = parseInt(currentLv, 10) || 30;
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const langKey = window.I18N?.pick?.({ 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN', 'en-US': 'en-US' }) ?? 'zh-TW';
    const pkmIdentity = (pkmData.id || '') + ':' + (pkmData.name_cn || pkmData.name_en || pkmData.name || '') + ':' + (pkmData.specialty || '') + ':' + (pkmData.base_frequency || pkmData.frequency || '') + ':' + (pkmData.is_final || '') + ':' + (pkmData.main_skill || '') + ':' + (pkmData.ingredient_rate || '') + ':' + (pkmData.skill_rate || '');
    const subsKey = Array.isArray(subskills) ? subskills.join('|') : '';
    const ingsKey = Array.isArray(ingredients)
      ? ingredients.map(function (x) { return typeof x === 'string' ? x : ((x && x.name) ? (x.name + ':' + (x.count || x.l1 || '')) : ''); }).join('|')
      : '';
    const cacheKey = pkmIdentity + '@' + currentLv + '@' + (natureName || '') + '@' + subsKey + '@' + ingsKey + '@' + (ribbonLevel || 0) + '@' + (skillLevel || '') + '@' + (isMint ? 1 : 0) + '@' + langKey;

    if (_evalPokemonCache[cacheKey]) {
      return Object.assign({}, _evalPokemonCache[cacheKey]);
    }

    const targetPkm = Object.assign({}, pkmData, { cleanseMint: isMint });

    const currentEval = evaluateSingle(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false, isMint);
    if (!currentEval) return null;

    const potentialEval = evaluateSingle(targetPkm, 100, natureName, subskills, ingredients, ribbonLevel, skillLevel, true, isMint);
    const milestones = calculateMilestoneProjections(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    if (currentEval.diagnostics) {
      currentEval.diagnostics.milestones = milestones;
    }

    const intelligentSummary = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    const result = Object.assign({}, currentEval, {
      current: currentEval,
      potential: potentialEval,
      currentScore: currentEval.compositeScore,
      currentGrade: currentEval.grade,
      potentialScore: potentialEval ? potentialEval.compositeScore : currentEval.compositeScore,
      potentialGrade: potentialEval ? potentialEval.grade : currentEval.grade,
      milestones: milestones,
      milestoneNote: milestones.length > 0 ? milestones[0].text : '',
      summaryNote: intelligentSummary,
      intelligentSummary: intelligentSummary
    });

    if (_evalPokemonCacheCount > 2500) {
      for (const k in _evalPokemonCache) delete _evalPokemonCache[k];
      _evalPokemonCacheCount = 0;
    }
    _evalPokemonCache[cacheKey] = result;
    _evalPokemonCacheCount++;

    return Object.assign({}, result);
  }

  /* ─── 升級成本精算 ─────────────────────────────────────── */
  const _milestoneCostCache = Object.create(null);

  function calculateMilestoneCost(fromLv, targetLv, nature) {
    if (fromLv >= targetLv) {
      return { exp: 0, candies: 0, shards: 0, handyCandyS: 0, handyCandyM: 0 };
    }

    const expMod = (nature && nature.buffType === 'exp') ? 'up' : ((nature && nature.debuffType === 'exp') ? 'down' : 'neutral');
    const costKey = fromLv + ':' + targetLv + ':' + expMod;
    const cachedCost = _milestoneCostCache[costKey];
    if (cachedCost) return cachedCost;

    const startExp = EXP_MILESTONES[fromLv] || (fromLv * 100);
    const endExp = EXP_MILESTONES[targetLv] || (targetLv * 500);
    let expDiff = Math.max(endExp - startExp, 0);

    if (expMod === 'up') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (expMod === 'down') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candiesNeeded = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shardsNeeded = Math.max(endShards - startShards, 0);

    const res = {
      exp: expDiff,
      candies: candiesNeeded,
      shards: shardsNeeded,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20)
    };
    _milestoneCostCache[costKey] = res;
    return res;
  }

  /* ─── 原生 SVG 六維雷達圖生成器 (完美對稱正規六邊形 + 頂點直接標註分數) ───────────────────────── */
  function renderRadarChartSVG(scores, width, height) {
    width = width || 360;
    height = height || 270;
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta();
    const cx = width / 2;
    const cy = (height / 2) + 1;
    const marginY = isCompact ? 22 : 28;
    const marginX = isCompact ? 36 : 46;
    const r = Math.min((width - marginX * 2) / 2, (height - marginY * 2) / 2);

    const scoreKeys = ['berry', 'ingredient', 'skill', 'speed', 'growth', 'roi'];
    const angles = SIX_DIM_META.map(function (m) { return m.angle; });

    // 生成 5 圈同心正六角形網格
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(function (level) {
      const pts = angles.map(function (a) {
        const x = cx + (r * level) * Math.cos(a);
        const y = cy + (r * level) * Math.sin(a);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      const cls = level === 1.0 ? 'radar-grid-poly radar-grid-outer' : 'radar-grid-poly';
      return '<polygon class="' + cls + '" points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line class="radar-axis-line" x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
    }).join('');

    // 計算資料多邊形座標
    const dataPoints = scoreKeys.map(function (k, i) {
      const score = Math.max(scores[k] || 20, 10);
      const radius = (score / 100) * r;
      const x = cx + radius * Math.cos(angles[i]);
      const y = cy + radius * Math.sin(angles[i]);
      return { x: x, y: y, score: score, key: k, meta: SIX_DIM_META[i] };
    });

    const dataPolygonPoints = dataPoints.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // 頂點標籤與數值 (維度名稱 + 評分標題直接整合在頂點)
    const labelsAndDots = dataPoints.map(function (p, i) {
      let lx = cx;
      let ly = cy;
      let textAnchor = 'middle';
      const sideOffset = isCompact ? 6 : 8;

      if (i === 0) { // Top (樹果產能)
        lx = cx;
        ly = cy - r - (isCompact ? 16 : 19);
        textAnchor = 'middle';
      } else if (i === 1) { // Top-Right (食材產能)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'start';
      } else if (i === 2) { // Bottom-Right (技能強度)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'start';
      } else if (i === 3) { // Bottom (幫忙速度)
        lx = cx;
        ly = cy + r + (isCompact ? 13 : 15);
        textAnchor = 'middle';
      } else if (i === 4) { // Bottom-Left (後期成長)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'end';
      } else if (i === 5) { // Top-Left (資源效益)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'end';
      }

      const dotR = isCompact ? '3.5' : '4.8';
      const labelFontSize = isCompact ? '10' : '13';
      const scoreFontSize = isCompact ? '9.5' : '12';
      const scoreDy = isCompact ? '11.5' : '14';

      return '<circle class="radar-data-dot" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + dotR + '" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan class="radar-label-text" x="' + lx.toFixed(1) + '" dy="' + (i === 0 ? '-2' : '0') + '" fill="var(--text-primary)" font-size="' + labelFontSize + '" font-weight="700">' + p.meta.label + '</tspan>' +
             '<tspan class="radar-score-tspan" x="' + lx.toFixed(1) + '" dy="' + scoreDy + '" fill="#38bdf8" font-size="' + scoreFontSize + '" font-weight="800">' + p.score + (window.I18N?.t?.('lab.t_pts_unit') ?? 'lab.t_pts_unit') + '</tspan>' +
             '</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="100%" style="display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon class="radar-data-poly" points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
  }

