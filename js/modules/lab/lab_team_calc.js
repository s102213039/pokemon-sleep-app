  /* ─── 隊伍一鍵智慧最佳化 (Auto-Optimize Team with Multi-Variables) ─────── */
  function autoOptimizeTeam(showToastNotification = true) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!userBox || userBox.length === 0) return;

    const island = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);
    const strategy = labState.teamStrategy || 'balanced';
    const cookingType = labState.cookingType || 'curry';
    const keyIngs = COOKING_CATEGORY_KEY_INGREDIENTS[cookingType] || [];

    function scorePkm(item, role = 'general') {
      const base = findBasePkm(item.pokemonId || item.name);
      if (!base) return 0;
      const level = parseInt(item.level, 10) || 30;
      const baseFreq = base.base_frequency || base.frequency || 3600;
      const speedFactor = (3600 / Math.max(1200, baseFreq)) * 50 * (1 + level * 0.015);
      // 強度指數：等級權重指數化，確保高等級真正強勢怪優先入隊
      const levelWeight = Math.pow(Math.max(1, level) / 30, 1.35);

      const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
      const berryName = berry.name || '';
      const berryType = berry.type || base.type || '';
      const isFavored = _isLabFavoredBerryOrType(berryName, berryType, favBerries, favTypes);

      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const isMint = !!(item.cleanseMint || item.mint);
      const nat = isMint ? null : _getLabNature(item.nature);

      const spec = base.specialty || '';
      const isBerrySpec = spec.includes('樹果') || spec === 'Berries';
      const isIngSpec = spec.includes('食材') || spec === 'Ingredients';
      const isSkillSpec = spec.includes('技能') || spec === 'Skills';

      const mainSkill = (base.main_skill || (base.skill && base.skill.name)) || item.main_skill || '';
      const isHealer = mainSkill.includes('活力療癒') || mainSkill.includes('活力全體療癒') || mainSkill.includes('Energy for Everyone') || mainSkill.includes('新月祈禱') || mainSkill.includes('樹果汁') || mainSkill.includes('治癒波動') || mainSkill.includes('蹭蹭臉頰');

      const unlockedIngs = [
        item.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '')
      ];
      if (level >= 30) unlockedIngs.push(item.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : ''));
      if (level >= 60) unlockedIngs.push(item.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : ''));
      const validUnlockedIngs = unlockedIngs.filter(Boolean);
      const matchCount = validUnlockedIngs.filter(i => keyIngs.includes(i)).length;

      if (role === 'healer') {
        if (!isHealer) return 0;
        let healScore = (1000 + speedFactor) * levelWeight;
        if (subs.includes('技能機率提升M')) healScore *= 1.45;
        if (subs.includes('技能機率提升S')) healScore *= 1.22;
        if (subs.includes('技能等級提升M')) healScore *= 1.18;
        if (subs.includes('幫手獎勵')) healScore *= 1.25;
        if (nat && nat.buff && nat.buff.includes('主技能')) healScore *= 1.20;
        if (isFavored) healScore *= 1.15;
        return healScore;
      }

      if (role === 'berry' || strategy === 'berries') {
        let bScore = speedFactor * levelWeight;
        if (isBerrySpec) bScore *= 1.85;
        if (isFavored) bScore *= 2.60;
        if (subs.includes('樹果數量S')) bScore *= 1.80;
        if (subs.includes('幫手獎勵')) bScore *= 1.30;
        if (subs.includes('幫忙速度M')) bScore *= 1.18;
        if (subs.includes('幫忙速度S')) bScore *= 1.09;
        if (nat && nat.buff && nat.buff.includes('幫忙速度')) bScore *= 1.12;
        return bScore;
      }

      if (role === 'ingredient' || strategy === 'ingredients') {
        let iScore = speedFactor * levelWeight;
        if (isIngSpec) iScore *= 1.85;
        if (matchCount === 1) iScore *= 1.40;
        else if (matchCount === 2) iScore *= 1.95;
        else if (matchCount >= 3) iScore *= 2.50;
        if (subs.includes('食材機率提升M')) iScore *= 1.45;
        if (subs.includes('食材機率提升S')) iScore *= 1.22;
        if (subs.includes('幫手獎勵')) iScore *= 1.30;
        if (subs.includes('幫忙速度M')) iScore *= 1.15;
        if (nat && nat.buff && nat.buff.includes('食材')) iScore *= 1.20;
        if (isFavored) iScore *= 1.25;
        return iScore;
      }

      if (role === 'skill' || strategy === 'skills') {
        let sScore = speedFactor * levelWeight;
        if (isSkillSpec) sScore *= 1.85;
        if (isHealer) sScore *= 1.55;
        if (subs.includes('技能機率提升M')) sScore *= 1.45;
        if (subs.includes('技能機率提升S')) sScore *= 1.22;
        if (subs.includes('幫手獎勵')) sScore *= 1.30;
        if (nat && nat.buff && nat.buff.includes('主技能')) sScore *= 1.20;
        if (isFavored) sScore *= 1.25;
        return sScore;
      }

      // General / Balanced
      let gScore = speedFactor * levelWeight;
      if (isFavored) gScore *= 2.20;
      if (subs.includes('樹果數量S')) gScore *= 1.60;
      if (subs.includes('幫手獎勵')) gScore *= 1.30;
      if (subs.includes('幫忙速度M')) gScore *= 1.15;
      if (subs.includes('食材機率提升M')) gScore *= 1.20;
      if (matchCount > 0) gScore *= (1 + matchCount * 0.20);
      return gScore;
    }

    const selected = [];
    const usedUids = new Set();

    function pickBest(candidates, role) {
      let bestItem = null;
      let bestScore = 0;
      for (let i = 0; i < candidates.length; i++) {
        const p = candidates[i];
        if (!p || usedUids.has(p.uid)) continue;
        const s = scorePkm(p, role);
        if (s > bestScore) {
          bestScore = s;
          bestItem = p;
        }
      }
      if (bestItem && bestScore > 0) {
        usedUids.add(bestItem.uid);
        selected.push(bestItem.uid);
        return bestItem;
      }
      return null;
    }

    const healers = userBox.filter(p => {
      const b = findBasePkm(p.pokemonId || p.name);
      const sk = (b && (b.main_skill || (b.skill && b.skill.name))) || p.main_skill || '';
      return sk.includes('活力療癒') || sk.includes('活力全體療癒') || sk.includes('Energy for Everyone') || sk.includes('新月祈禱') || sk.includes('樹果汁') || sk.includes('治癒波動') || sk.includes('蹭蹭臉頰');
    });

    if (strategy === 'berries') {
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'berry');
        if (!picked) break;
      }
    } else if (strategy === 'skills') {
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'skill');
        if (!picked) break;
      }
    } else if (strategy === 'ingredients' || strategy === 'recipe') {
      const targetRecipe = findTargetRecipe(labState.targetRecipeName);
      const reqIngredients = (targetRecipe && Array.isArray(targetRecipe.ingredients)) ? targetRecipe.ingredients : [];
      const remainingDeficits = {};
      const reqIngredientNames = new Set();
      reqIngredients.forEach(ing => {
        remainingDeficits[ing.name] = (ing.count || 0) * 3;
        reqIngredientNames.add(ing.name);
      });

      function estimatePkmIngDailyYield(p, ingName) {
        const base = findBasePkm(p.pokemonId || p.name);
        if (!base) return 0;
        const level = parseInt(p.level, 10) || 30;

        const slots = [
          { idx: 0, name: p.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : ''), unlocked: true }
        ];
        if (level >= 30) {
          slots.push({ idx: 1, name: p.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : slots[0].name), unlocked: true });
        }
        if (level >= 60) {
          slots.push({ idx: 2, name: p.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : slots[0].name), unlocked: true });
        }
        const validSlots = slots.filter(s => s.unlocked && s.name);
        if (validSlots.length === 0) return 0;

        const matchingSlots = validSlots.filter(s => s.name === ingName);
        if (matchingSlots.length === 0) return 0;

        const baseFreq = base.base_frequency || base.frequency || 3600;
        let freq = baseFreq * (1 - (level - 1) * 0.002);
        const subs = Array.isArray(p.subskills) ? p.subskills : [];
        let subSpeedDiscount = 0;
        if (subs.includes('幫忙速度M')) subSpeedDiscount += 0.14;
        if (subs.includes('幫忙速度S')) subSpeedDiscount += 0.07;
        if (subs.includes('幫手獎勵')) subSpeedDiscount += 0.05;
        freq = freq * (1 - Math.min(0.35, subSpeedDiscount));

        const isMint = !!(p.cleanseMint || p.mint);
        const nat = isMint ? null : _getLabNature(p.nature);
        if (nat) {
          if (nat.buff && nat.buff.includes('幫忙速度')) freq *= 0.90;
          if (nat.debuff && nat.debuff.includes('幫忙速度')) freq *= 1.075;
        }

        const effectiveInterval = Math.max(300, freq / 1.8);
        const dailyHelps = Math.floor(86400 / effectiveInterval);

        let ingRate = 0.20;
        if (base.specialty && (base.specialty.includes('食材') || base.specialty === 'Ingredients')) ingRate = 0.28;
        if (subs.includes('食材機率提升M')) ingRate *= 1.36;
        if (subs.includes('食材機率提升S')) ingRate *= 1.18;
        if (nat && nat.buff && nat.buff.includes('食材')) ingRate *= 1.20;
        if (nat && nat.debuff && nat.debuff.includes('食材')) ingRate *= 0.80;
        ingRate = Math.min(0.65, ingRate);

        const ingHelps = dailyHelps * ingRate;
        const slotHelpCount = ingHelps / validSlots.length;

        let totalYield = 0;
        matchingSlots.forEach(s => {
          const dropCount = (typeof getIngCountFromBase === 'function')
            ? getIngCountFromBase(base, s.idx, s.name)
            : (s.idx === 0 ? 1 : (s.idx === 1 ? 2 : 4));
          totalYield += slotHelpCount * dropCount;
        });

        return Math.round(totalYield);
      }

      const yieldCache = new Map();
      function getCachedIngDailyYield(p, ingName) {
        const cacheKey = (p.uid || p.pokemonId || p.name || '') + ':' + (p.level || '') + ':' + ingName;
        if (yieldCache.has(cacheKey)) return yieldCache.get(cacheKey);
        const val = estimatePkmIngDailyYield(p, ingName);
        yieldCache.set(cacheKey, val);
        return val;
      }

      const healerUidSet = new Set(healers.map(h => h.uid));
      const teamSpeciesMap = {};

      while (selected.length < 5) {
        const hasRemainingDeficit = reqIngredients.some(ing => (remainingDeficits[ing.name] || 0) > 0);
        let bestCandidate = null;
        let bestScore = -1;

        if (hasRemainingDeficit) {
          for (let i = 0; i < userBox.length; i++) {
            const p = userBox[i];
            if (!p || usedUids.has(p.uid)) continue;
            const base = findBasePkm(p.pokemonId || p.name);
            if (!base) continue;

            const pLv = parseInt(p.level, 10) || 30;
            const speciesKey = base.id || base.name_cn || base.name || p.name;
            const alreadyInTeam = teamSpeciesMap[speciesKey] || 0;

            // 同物種重複怪懲罰：若非極高等級 (Lv>=50)，大幅施加懲罰係數 0.42，杜絕選入 Lv.32 等重複弱怪
            const duplicatePenalty = alreadyInTeam > 0 ? (pLv >= 50 ? 0.65 : 0.42) : 1.0;

            // 寶可夢自身戰力與等級權重 (等級權重深化至 1.45 次方，滿等神寵全面領先)
            const levelWeight = Math.pow(Math.max(1, pLv) / 30, 1.45);
            const spec = base.specialty || '';
            const isIngSpec = spec.includes('食材') || spec === 'Ingredients';
            const specMultiplier = isIngSpec ? 1.80 : 1.0;

            const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
            const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || base.type || '');
            const favMultiplier = isFav ? 1.25 : 1.0;

            const subs = Array.isArray(p.subskills) ? p.subskills : [];
            let subMultiplier = 1.0;
            if (subs.includes('食材機率提升M')) subMultiplier *= 1.36;
            if (subs.includes('食材機率提升S')) subMultiplier *= 1.18;
            if (subs.includes('幫手獎勵')) subMultiplier *= 1.25;
            if (subs.includes('幫忙速度M')) subMultiplier *= 1.15;
            if (subs.includes('幫忙速度S')) subMultiplier *= 1.08;

            const isMint = !!(p.cleanseMint || p.mint);
            const nat = isMint ? null : _getLabNature(p.nature);
            let natMultiplier = 1.0;
            if (nat && nat.buff && nat.buff.includes('食材')) natMultiplier *= 1.20;
            if (nat && nat.debuff && nat.debuff.includes('食材')) natMultiplier *= 0.80;
            if (nat && nat.buff && nat.buff.includes('幫忙速度')) natMultiplier *= 1.10;

            // 統計該寶可夢在當前「仍有缺口」之目標食材中的實質日產能與缺口覆蓋比例
            let effectiveMatchCount = 0;
            let deficitCoveredScore = 0;
            let deficitRatioBonus = 0;
            let totalYieldAmount = 0;

            reqIngredients.forEach(ing => {
              const def = remainingDeficits[ing.name] || 0;
              const y = getCachedIngDailyYield(p, ing.name);
              if (y > 0) {
                if (def > 0 && y >= 8) {
                  effectiveMatchCount++;
                }
                const covered = Math.min(y, def);
                const surplus = Math.max(0, y - def);
                deficitCoveredScore += covered * 4.5;
                if (def > 0) {
                  deficitRatioBonus += (covered / def) * 60;
                }
                totalYieldAmount += surplus * 0.25;
              }
            });

            // 雙食材或多食材重疊契合度加權：必須高等級 (Lv>=30) 且對不同缺口均有實質規模產出
            let synergyMultiplier = 1.0;
            if (pLv >= 30 && effectiveMatchCount >= 3) synergyMultiplier = 2.5;
            else if (pLv >= 30 && effectiveMatchCount === 2) synergyMultiplier = 1.85;
            else if (effectiveMatchCount === 1) synergyMultiplier = 1.0;
            else synergyMultiplier = 0.35;

            const rawYieldScore = deficitCoveredScore + deficitRatioBonus + totalYieldAmount;
            if (deficitCoveredScore > 0) {
              const finalScore = rawYieldScore * synergyMultiplier * levelWeight * specMultiplier * subMultiplier * natMultiplier * favMultiplier * duplicatePenalty;
              if (finalScore > bestScore) {
                bestScore = finalScore;
                bestCandidate = p;
              }
            }
          }
        }

        if (bestCandidate && bestScore > 0) {
          usedUids.add(bestCandidate.uid);
          selected.push(bestCandidate.uid);
          const cBase = findBasePkm(bestCandidate.pokemonId || bestCandidate.name);
          const cKey = (cBase && (cBase.id || cBase.name_cn || cBase.name)) || bestCandidate.name;
          teamSpeciesMap[cKey] = (teamSpeciesMap[cKey] || 0) + 1;

          reqIngredients.forEach(ing => {
            const y = getCachedIngDailyYield(bestCandidate, ing.name);
            remainingDeficits[ing.name] = Math.max(0, (remainingDeficits[ing.name] || 0) - y);
          });
        } else {
          // 所有缺口已 100% 覆蓋（或倉庫無對應食材怪）時：食材隊優先補入最佳奶媽維持全隊活力，其次補最強食材／綜合怪
          const hasTeamHealer = selected.some(uid => healerUidSet.has(uid));
          const fallback = (strategy === 'ingredients' && !hasTeamHealer && healers.length > 0 ? pickBest(healers, 'healer') : null)
            || pickBest(userBox, 'ingredient')
            || pickBest(userBox, 'general');
          if (!fallback) break;
          const fbBase = findBasePkm(fallback.pokemonId || fallback.name);
          const fbKey = (fbBase && (fbBase.id || fbBase.name_cn || fbBase.name)) || fallback.name;
          teamSpeciesMap[fbKey] = (teamSpeciesMap[fbKey] || 0) + 1;
        }
      }
    } else {
      // Balanced
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      for (let i = 0; i < 2; i++) {
        pickBest(userBox, 'berry');
      }
      for (let i = 0; i < 2; i++) {
        pickBest(userBox, 'ingredient');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'general');
        if (!picked) break;
      }
    }

    while (selected.length < 5) {
      selected.push(null);
    }

    labState.teamSlots = selected;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(selected));
      }
    } catch (e) {}

    updateLabUI();
    if (showToastNotification && typeof window.showToast === 'function') {
      const islandName = window.I18N?.getIslandName?.(island.name) ?? (window.I18N?.field?.(island, 'name') || island.name);
      if (strategy === 'recipe' || strategy === 'ingredients') {
        const targetRecipe = findTargetRecipe(labState.targetRecipeName);
        const rName = window.I18N?.getRecipeName?.(targetRecipe) ?? (targetRecipe.name_cn || targetRecipe.name || '');
        window.showToast(window.I18N?.t?.('lab.t_toast_opt_recipe', { islandName, recipeName: rName }) ?? 'lab.t_toast_opt_recipe');
      } else {
        const stratKeyMap = {
          balanced: 'lab.t_strat_balanced',
          berries: 'lab.t_strat_berries',
          ingredients: 'lab.t_strat_ingredients',
          skills: 'lab.t_strat_skills'
        };
        const cookKeyMap = {
          curry: 'lab.t_cook_curry',
          salad: 'lab.t_cook_salad',
          dessert: 'lab.t_cook_dessert'
        };
        const sName = stratKeyMap[strategy] ? (window.I18N?.t?.(stratKeyMap[strategy]) ?? stratKeyMap[strategy]) : strategy;
        const cName = cookKeyMap[cookingType] ? (window.I18N?.t?.(cookKeyMap[cookingType]) ?? cookKeyMap[cookingType]) : cookingType;
        window.showToast(window.I18N?.t?.('lab.t_toast_opt_strat', { islandName, stratName: sName, cookName: cName }) ?? 'lab.t_toast_opt_strat');
      }
    }
  }

  function setTeamStrategy(strategy) {
    if (['balanced', 'berries', 'ingredients', 'skills', 'recipe'].includes(strategy)) {
      labState.teamStrategy = strategy;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_team_strategy', strategy);
        }
      } catch (e) {}
      autoOptimizeTeam(false);
    }
  }

  function setTargetRecipe(recipeName) {
    if (!recipeName) return;
    labState.targetRecipeName = recipeName;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_target_recipe', recipeName);
      }
    } catch (e) {}
    if (labState.teamStrategy === 'ingredients' || labState.teamStrategy === 'recipe') {
      autoOptimizeTeam(true);
    } else {
      updateLabUI();
    }
  }

  function _getLabAllBerryNames() {
    const gc = _getLabGameConfig();
    if (gc && Array.isArray(gc.CANONICAL_BERRIES) && gc.CANONICAL_BERRIES.length > 0) {
      return gc.CANONICAL_BERRIES.map(b => b.name);
    }
    return _getLabBerryValuesData().map(b => b.name);
  }

  function rerollGreengrassBerries(autoBuild = false) {
    const pool = _getLabAllBerryNames();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i];
      pool[i] = pool[j];
      pool[j] = temp;
    }
    const rolled = pool.slice(0, 3);
    labState.greengrassBerries = rolled;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_greengrass_berries', JSON.stringify(rolled));
      }
    } catch (e) {}

    autoOptimizeTeam(autoBuild);
    if (!autoBuild && typeof window !== 'undefined' && typeof window.showToast === 'function') {
      const sep = window.I18N?.t?.('lab.t_list_sep') ?? ', ';
      const berryDisplay = rolled.map(b => window.I18N?.getBerryName?.(b) ?? b).join(sep);
      window.showToast(window.I18N?.t?.('lab.t_toast_reroll_gg', { berries: berryDisplay }) ?? 'lab.t_toast_reroll_gg');
    }
  }

  function setCookingType(cookingType) {
    if (['curry', 'salad', 'dessert'].includes(cookingType)) {
      labState.cookingType = cookingType;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_cooking_type', cookingType);
        }
      } catch (e) {}
      // 若目前目標料理不屬於新選取的料理種類，自動對齊該分類最高基礎能量料理
      const matchesCat = (r) => {
        const cat = ((r && r.category) || '').toLowerCase();
        if (cookingType === 'curry') return cat.includes('咖哩') || cat.includes('curry') || cat.includes('濃湯') || cat.includes('stew');
        if (cookingType === 'salad') return cat.includes('沙拉') || cat.includes('salad');
        if (cookingType === 'dessert') return cat.includes('甜') || cat.includes('點心') || cat.includes('dessert') || cat.includes('飲料') || cat.includes('drink');
        return false;
      };
      const curRecipe = findTargetRecipe(labState.targetRecipeName);
      if (!curRecipe || !matchesCat(curRecipe)) {
        const candidates = getAllTargetRecipes().filter(matchesCat).sort((a, b) => {
          const ea = parseInt(String(a.base_energy || a.energy || 0).replace(/,/g, ''), 10) || 0;
          const eb = parseInt(String(b.base_energy || b.energy || 0).replace(/,/g, ''), 10) || 0;
          return (eb - ea) || ((b.pot_size || 0) - (a.pot_size || 0));
        });
        if (candidates.length > 0) {
          const nextName = candidates[0].name_cn || candidates[0].name;
          if (nextName) {
            labState.targetRecipeName = nextName;
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('pksleep_lab_target_recipe', nextName);
              }
            } catch (e) {}
          }
        }
      }
      autoOptimizeTeam(false);
    }
  }

  function setGreengrassBerry(index, berryName) {
    if (index >= 0 && index < 3 && berryName) {
      if (!Array.isArray(labState.greengrassBerries) || labState.greengrassBerries.length !== 3) {
        labState.greengrassBerries = ['桃桃果', '橙橙果', '櫻子果'];
      }
      labState.greengrassBerries[index] = berryName;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_greengrass_berries', JSON.stringify(labState.greengrassBerries));
        }
      } catch (e) {}
      autoOptimizeTeam(false);
    }
  }

  /* ─── 子分頁與營地/槽位切換控制 (Tab & Slot Actions) ───────────────── */
