  /* ─── 幫手隊伍效益模擬器 (Team Synergy & Output Simulator) ─────────────── */
  function simulateTeamPerformance(teamPokemonItems, islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(islandId);
    const favTypes = getIslandFavoredTypes(islandId);

    let totalDailyBerryEnergy = 0;
    let totalDailySkillProcs = 0;
    let totalDailyIngredientsCount = 0;
    const ingredientsMap = {};
    let helpingBonusCount = 0;
    let sleepExpBonusCount = 0;
    let energyRecoveryBonusCount = 0;
    let hasHealer = false;

    const validItems = (teamPokemonItems || []).filter(Boolean);

    validItems.forEach(item => {
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      subs.forEach(s => {
        if (s === '幫手獎勵') helpingBonusCount++;
        if (s === '睡眠EXP獎勵') sleepExpBonusCount++;
        if (s === '活力回復獎勵') energyRecoveryBonusCount++;
      });
      const base = findBasePkm(item.pokemonId || item.name);
      const skill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      if (skill.includes('活力療癒') || skill.includes('能量充填') || skill.includes('Energizing')) {
        hasHealer = true;
      }
    });

    const teamHelpingBonusReduction = Math.min(helpingBonusCount, 5) * 0.05;
    const energySpeedMultiplier = hasHealer ? 2.2 : 1.6;

    const slotResults = (teamPokemonItems || []).map(item => {
      if (!item) return null;
      const base = findBasePkm(item.pokemonId || item.name);
      if (!base) return null;

      const level = item.level || 30;
      const nature = item.nature || '坦率';
      const subskills = Array.isArray(item.subskills) ? item.subskills : [];
      const ribbon = parseInt(item.ribbon, 10) || 0;
      const ribbonBonus = getRibbonBonus(base, ribbon);

      const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
      const berryName = berry.name || '';
      const berryType = berry.type || base.type || '';
      const isFavored = favBerries.includes(berryName) || favTypes.includes(berryType);

      const baseFreq = base.base_frequency || base.frequency || 3600;
      let freq = baseFreq * (1 - (level - 1) * 0.002);

      let subSpeedDiscount = 0;
      if (subskills.includes('幫忙速度M')) subSpeedDiscount += 0.14;
      if (subskills.includes('幫忙速度S')) subSpeedDiscount += 0.07;
      subSpeedDiscount += teamHelpingBonusReduction;
      freq = freq * (1 - Math.min(0.35, subSpeedDiscount));

      if (ribbonBonus && ribbonBonus.speedDiscount > 0) {
        freq = freq * (1 - ribbonBonus.speedDiscount);
      }

      const isMint = !!(item.cleanseMint || item.mint);
      const nat = isMint ? null : NATURE_DATA.find(n => n.name === nature);
      if (nat) {
        if (nat.buff && nat.buff.includes('幫忙速度')) freq *= 0.90;
        if (nat.debuff && nat.debuff.includes('幫忙速度')) freq *= 1.075;
      }

      const effectiveInterval = Math.max(300, freq / energySpeedMultiplier);
      const dailyHelps = Math.floor(86400 / effectiveInterval);

      let berryCount = 1;
      if (base.specialty && (base.specialty.includes('樹果') || base.specialty === 'Berries')) {
        berryCount = 2;
      }
      if (subskills.includes('樹果數量S')) {
        berryCount += 1;
      }

      const bValueObj = (typeof BERRY_VALUES_DATA !== 'undefined' ? BERRY_VALUES_DATA : []).find(b => b.name === berryName);
      const baseBerryEnergy = bValueObj ? bValueObj.energy : 28;
      const singleBerryEnergy = Math.max(1, baseBerryEnergy + level - 1);
      const favoriteMultiplier = isFavored ? 2.0 : 1.0;

      let ingRate = 0.20;
      if (base.specialty && (base.specialty.includes('食材') || base.specialty === 'Ingredients')) {
        ingRate = 0.28;
      }
      if (subskills.includes('食材機率提升M')) ingRate *= 1.36;
      if (subskills.includes('食材機率提升S')) ingRate *= 1.18;
      if (nat && nat.buff && nat.buff.includes('食材')) ingRate *= 1.20;
      if (nat && nat.debuff && nat.debuff.includes('食材')) ingRate *= 0.80;
      ingRate = Math.min(0.65, ingRate);

      const berryHelps = dailyHelps * (1 - ingRate);
      const ingHelps = dailyHelps * ingRate;

      const dailyBerryEnergy = Math.round(berryHelps * berryCount * singleBerryEnergy * favoriteMultiplier);
      totalDailyBerryEnergy += dailyBerryEnergy;

      const unlockedIngs = [];
      unlockedIngs.push(item.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : ''));
      if (level >= 30) unlockedIngs.push(item.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : unlockedIngs[0]));
      if (level >= 60) unlockedIngs.push(item.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : unlockedIngs[0]));
      const validIngs = unlockedIngs.filter(Boolean);

      const helpsPerIng = ingHelps / Math.max(1, validIngs.length);
      validIngs.forEach(iName => {
        const yieldPerHelp = 2;
        const totalIngAmount = Math.round(helpsPerIng * yieldPerHelp);
        ingredientsMap[iName] = (ingredientsMap[iName] || 0) + totalIngAmount;
        totalDailyIngredientsCount += totalIngAmount;
      });

      let skillRate = 0.035;
      if (base.specialty && (base.specialty.includes('技能') || base.specialty === 'Skills')) {
        skillRate = 0.055;
      }
      if (subskills.includes('技能機率提升M')) skillRate *= 1.36;
      if (subskills.includes('技能機率提升S')) skillRate *= 1.18;
      if (nat && nat.buff && nat.buff.includes('主技能')) skillRate *= 1.20;
      if (nat && nat.debuff && nat.debuff.includes('主技能')) skillRate *= 0.80;
      const dailySkillProcs = dailyHelps * skillRate;
      totalDailySkillProcs += dailySkillProcs;

      return {
        item,
        base,
        level,
        isFavored,
        effectiveInterval,
        dailyHelps,
        dailyBerryEnergy,
        dailySkillProcs: dailySkillProcs.toFixed(1)
      };
    });

    let targetRecipeAnalysis = null;
    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    if (targetRecipe && Array.isArray(targetRecipe.ingredients) && targetRecipe.ingredients.length > 0) {
      const items = targetRecipe.ingredients.map(ing => {
        const perMeal = ing.count || 0;
        const dailyDemand = perMeal * 3;
        const teamYield = ingredientsMap[ing.name] || 0;
        const fulfillmentPct = dailyDemand > 0 ? Math.min(999, Math.round((teamYield / dailyDemand) * 100)) : 100;
        const diff = teamYield - dailyDemand;
        const iconUrl = ing.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ing.name) : '');
        return {
          name: ing.name,
          icon: iconUrl,
          perMeal,
          dailyDemand,
          teamYield,
          fulfillmentPct,
          diff
        };
      });
      const overallFulfillmentPct = items.length > 0 ? Math.min(...items.map(i => i.fulfillmentPct)) : 0;
      targetRecipeAnalysis = {
        recipe: targetRecipe,
        items,
        overallFulfillmentPct,
        isFullySatisfied: items.every(i => i.teamYield >= i.dailyDemand)
      };
    }

    return {
      island,
      totalDailyBerryEnergy,
      totalDailyIngredientsCount,
      ingredientsMap,
      totalDailySkillProcs: totalDailySkillProcs.toFixed(1),
      helpingBonusCount,
      sleepExpBonusCount,
      energyRecoveryBonusCount,
      hasHealer,
      slotResults,
      targetRecipeAnalysis
    };
  }

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

      const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
      const berryName = berry.name || '';
      const berryType = berry.type || base.type || '';
      const isFavored = favBerries.includes(berryName) || favTypes.includes(berryType);

      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const isMint = !!(item.cleanseMint || item.mint);
      const nat = isMint ? null : NATURE_DATA.find(n => n.name === item.nature);

      const spec = base.specialty || '';
      const isBerrySpec = spec.includes('樹果') || spec === 'Berries';
      const isIngSpec = spec.includes('食材') || spec === 'Ingredients';
      const isSkillSpec = spec.includes('技能') || spec === 'Skills';

      const mainSkill = (base.main_skill || (base.skill && base.skill.name)) || item.main_skill || '';
      const isHealer = mainSkill.includes('活力療癒') || mainSkill.includes('活力全體療癒') || mainSkill.includes('Energy for Everyone');

      const unlockedIngs = [
        item.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '')
      ];
      if (level >= 30) unlockedIngs.push(item.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : ''));
      if (level >= 60) unlockedIngs.push(item.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : ''));
      const validUnlockedIngs = unlockedIngs.filter(Boolean);
      const matchCount = validUnlockedIngs.filter(i => keyIngs.includes(i)).length;

      if (role === 'healer') {
        if (!isHealer) return 0;
        let healScore = 1000 + speedFactor;
        if (subs.includes('技能機率提升M')) healScore *= 1.36;
        if (subs.includes('技能機率提升S')) healScore *= 1.18;
        if (subs.includes('技能等級提升M')) healScore *= 1.15;
        if (nat && nat.buff && nat.buff.includes('主技能')) healScore *= 1.20;
        if (isFavored) healScore *= 1.15;
        return healScore;
      }

      if (role === 'berry' || strategy === 'berries') {
        let bScore = speedFactor;
        if (isBerrySpec) bScore *= 1.6;
        if (isFavored) bScore *= 2.4;
        if (subs.includes('樹果數量S')) bScore *= 1.6;
        if (subs.includes('幫手獎勵')) bScore *= 1.25;
        if (subs.includes('幫忙速度M')) bScore *= 1.15;
        if (subs.includes('幫忙速度S')) bScore *= 1.08;
        if (nat && nat.buff && nat.buff.includes('幫忙速度')) bScore *= 1.10;
        return bScore;
      }

      if (role === 'ingredient' || strategy === 'ingredients') {
        let iScore = speedFactor;
        if (isIngSpec) iScore *= 1.6;
        if (matchCount === 1) iScore *= 1.35;
        else if (matchCount === 2) iScore *= 1.70;
        else if (matchCount >= 3) iScore *= 2.10;
        if (subs.includes('食材機率提升M')) iScore *= 1.36;
        if (subs.includes('食材機率提升S')) iScore *= 1.18;
        if (subs.includes('幫手獎勵')) iScore *= 1.25;
        if (subs.includes('幫忙速度M')) iScore *= 1.12;
        if (nat && nat.buff && nat.buff.includes('食材')) iScore *= 1.20;
        if (isFavored) iScore *= 1.25;
        return iScore;
      }

      if (role === 'skill' || strategy === 'skills') {
        let sScore = speedFactor;
        if (isSkillSpec) sScore *= 1.6;
        if (isHealer) sScore *= 1.5;
        if (subs.includes('技能機率提升M')) sScore *= 1.36;
        if (subs.includes('技能機率提升S')) sScore *= 1.18;
        if (subs.includes('幫手獎勵')) sScore *= 1.25;
        if (nat && nat.buff && nat.buff.includes('主技能')) sScore *= 1.20;
        if (isFavored) sScore *= 1.25;
        return sScore;
      }

      // General / Balanced
      let gScore = speedFactor;
      if (isFavored) gScore *= 2.0;
      if (subs.includes('樹果數量S')) gScore *= 1.45;
      if (subs.includes('幫手獎勵')) gScore *= 1.25;
      if (subs.includes('幫忙速度M')) gScore *= 1.15;
      if (subs.includes('食材機率提升M')) gScore *= 1.15;
      if (matchCount > 0) gScore *= (1 + matchCount * 0.15);
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
      return sk.includes('活力療癒') || sk.includes('活力全體療癒') || sk.includes('Energy for Everyone');
    });

    if (strategy === 'berries') {
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'berry');
        if (!picked) break;
      }
    } else if (strategy === 'ingredients') {
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'ingredient');
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
    } else if (strategy === 'recipe') {
      const targetRecipe = findTargetRecipe(labState.targetRecipeName);
      const reqIngredients = (targetRecipe && Array.isArray(targetRecipe.ingredients)) ? targetRecipe.ingredients : [];
      const remainingDeficits = {};
      reqIngredients.forEach(ing => {
        remainingDeficits[ing.name] = (ing.count || 0) * 3;
      });

      function estimatePkmIngDailyYield(p, ingName) {
        const base = findBasePkm(p.pokemonId || p.name);
        if (!base) return 0;
        const level = parseInt(p.level, 10) || 30;
        const unlockedIngs = [];
        unlockedIngs.push(p.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : ''));
        if (level >= 30) unlockedIngs.push(p.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : unlockedIngs[0]));
        if (level >= 60) unlockedIngs.push(p.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : unlockedIngs[0]));
        const validUnlocked = unlockedIngs.filter(Boolean);
        const matches = validUnlocked.filter(i => i === ingName).length;
        if (matches === 0) return 0;

        const baseFreq = base.base_frequency || base.frequency || 3600;
        let freq = baseFreq * (1 - (level - 1) * 0.002);
        const subs = Array.isArray(p.subskills) ? p.subskills : [];
        let subSpeedDiscount = 0;
        if (subs.includes('幫忙速度M')) subSpeedDiscount += 0.14;
        if (subs.includes('幫忙速度S')) subSpeedDiscount += 0.07;
        if (subs.includes('幫手獎勵')) subSpeedDiscount += 0.05;
        freq = freq * (1 - Math.min(0.35, subSpeedDiscount));

        const isMint = !!(p.cleanseMint || p.mint);
        const nat = isMint ? null : NATURE_DATA.find(n => n.name === p.nature);
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
        const ratio = matches / Math.max(1, validUnlocked.length);
        return Math.round(ingHelps * ratio * 2);
      }

      while (selected.length < 5) {
        let bestCandidate = null;
        let bestScore = -1;

        for (let i = 0; i < userBox.length; i++) {
          const p = userBox[i];
          if (!p || usedUids.has(p.uid)) continue;
          const base = findBasePkm(p.pokemonId || p.name);
          if (!base) continue;

          let marginalScore = 0;
          let anyYield = false;

          reqIngredients.forEach(ing => {
            const y = estimatePkmIngDailyYield(p, ing.name);
            if (y > 0) {
              anyYield = true;
              const def = remainingDeficits[ing.name] || 0;
              marginalScore += Math.min(y, def) * 3.0 + Math.max(0, y - def) * 0.4;
            }
          });

          if (anyYield) {
            const spec = base.specialty || '';
            if (spec.includes('食材') || spec === 'Ingredients') marginalScore *= 1.30;
            const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
            const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || base.type || '');
            if (isFav) marginalScore *= 1.15;

            if (marginalScore > bestScore) {
              bestScore = marginalScore;
              bestCandidate = p;
            }
          }
        }

        if (bestCandidate && bestScore > 0) {
          usedUids.add(bestCandidate.uid);
          selected.push(bestCandidate.uid);
          reqIngredients.forEach(ing => {
            const y = estimatePkmIngDailyYield(bestCandidate, ing.name);
            remainingDeficits[ing.name] = Math.max(0, (remainingDeficits[ing.name] || 0) - y);
          });
        } else {
          const fallback = pickBest(userBox, 'ingredient') || pickBest(userBox, 'general');
          if (!fallback) break;
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
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      if (strategy === 'recipe') {
        const targetRecipe = findTargetRecipe(labState.targetRecipeName);
        const rName = isEN ? (targetRecipe.name_en || targetRecipe.name_cn) : (targetRecipe.name_cn || targetRecipe.name);
        window.showToast(isEN
          ? `Team optimized for target recipe: ${rName} on ${island.name_en || island.name} (Ingredient Maximization)!`
          : `已自動為【${island.name}】推薦【${rName}】食材最大化最佳陣容！`
        );
      } else {
        const stratNames = { balanced: isEN ? 'Balanced' : '綜合隊', berries: isEN ? 'Berry-Focused' : '樹果隊', ingredients: isEN ? 'Ingredient-Focused' : '食材隊', skills: isEN ? 'Skill-Focused' : '技能隊' };
        const cookNames = { curry: isEN ? 'Curry' : '咖哩/濃湯', salad: isEN ? 'Salad' : '沙拉', dessert: isEN ? 'Dessert' : '點心/飲料' };
        const sName = stratNames[strategy] || strategy;
        const cName = cookNames[cookingType] || cookingType;
        window.showToast(isEN
          ? `Team optimized: ${sName} on ${island.name_en || island.name} (${cName})!`
          : `已自動為【${island.name}】推薦【${sName}】（料理目標：${cName}）！`
        );
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
      updateLabUI();
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
    updateLabUI();
  }

  const ALL_BERRY_NAMES = [
    '桃桃果', '橙橙果', '櫻子果', '零餘果', '木子果', '蘋野果',
    '藍橘果', '墨莓果', '文柚果', '利歐果', '金枕果', '勿忘果',
    '柿仔果', '椰木果', '異奇果', '番荔果', '芭亞果', '芒芒果'
  ];

  function rerollGreengrassBerries(autoBuild = false) {
    const pool = ALL_BERRY_NAMES.slice();
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

    if (autoBuild) {
      autoOptimizeTeam(true);
    } else {
      updateLabUI();
      if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        const berryDisplay = rolled.map(b => (isEN && window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b) : b)).join(', ');
        window.showToast(isEN ? `Greengrass favored berries rerolled: ${berryDisplay}` : `萌綠之島喜愛樹果已隨機刷新：${rolled.join('、')}！`);
      }
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
      updateLabUI();
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
      updateLabUI();
    }
  }

  /* ─── 子分頁與營地/槽位切換控制 (Tab & Slot Actions) ───────────────── */
  function switchSubTab(tab) {
    if (!['team', 'compare'].includes(tab)) tab = 'team';
    labState.currentSubTab = tab;
    labState.editMode = false;
    updateLabUI();
  }

  function setTeamIsland(islandId) {
    labState.teamIslandId = islandId;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_team_island', islandId);
      }
    } catch (e) {}
    updateLabUI();
  }

  function setTeamSlot(slotIndex, uid) {
    if (slotIndex >= 0 && slotIndex < 5) {
      labState.teamSlots[slotIndex] = uid;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function clearTeamSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < 5) {
      labState.teamSlots[slotIndex] = null;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function clearAllTeamSlots() {
    labState.teamSlots = [null, null, null, null, null];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
      }
    } catch (e) {}
    updateLabUI();
  }

  function setCompareSlot(slot, uid) {
    let idx = 0;
    if (typeof slot === 'number') idx = slot;
    else if (String(slot).toLowerCase() === 'b' || slot === '1') idx = 1;
    else if (String(slot).toLowerCase() === 'c' || slot === '2') idx = 2;
    else idx = 0;

    if (!Array.isArray(labState.compareSlots)) {
      labState.compareSlots = [null, null, null];
    }

    if (uid) {
      const otherIdx = labState.compareSlots.findIndex((u, i) => u === uid && i !== idx);
      if (otherIdx !== -1) {
        if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
          const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
          window.showToast(isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！');
        }
        return;
      }
    }

    labState.compareSlots[idx] = uid || null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
        localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
          a: labState.compareSlots[0],
          b: labState.compareSlots[1],
          c: labState.compareSlots[2]
        }));
      }
    } catch (e) {}
    updateLabUI();
  }

  function clearCompareSlot(slot) {
    let idx = 0;
    if (typeof slot === 'number') idx = slot;
    else if (String(slot).toLowerCase() === 'b' || slot === '1') idx = 1;
    else if (String(slot).toLowerCase() === 'c' || slot === '2') idx = 2;
    else idx = 0;

    if (Array.isArray(labState.compareSlots) && idx >= 0 && idx < 3) {
      labState.compareSlots[idx] = null;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
          localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
            a: labState.compareSlots[0],
            b: labState.compareSlots[1],
            c: labState.compareSlots[2]
          }));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function swapCompareSlots() {
    if (!Array.isArray(labState.compareSlots)) labState.compareSlots = [null, null, null];
    const tmp = labState.compareSlots[0];
    labState.compareSlots[0] = labState.compareSlots[1];
    labState.compareSlots[1] = tmp;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
        localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
          a: labState.compareSlots[0],
          b: labState.compareSlots[1],
          c: labState.compareSlots[2]
        }));
      }
    } catch (e) {}
    updateLabUI();
  }

  function setCompareBenchmarkLevel(lvl) {
    const val = (lvl === 'box' || !lvl) ? 'box' : parseInt(lvl, 10);
    labState.compareBenchmarkLevel = val;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_benchmark', String(val));
      }
    } catch (e) {}
    updateLabUI();
  }

  /* ─── 自訂隊員/選手挑選彈窗 (Custom Pokémon Picker Modal) ────────────── */
  let activePickerState = null;

  function openLabPicker(opts) {
    activePickerState = opts || {};
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    let modal = document.getElementById('modal-lab-picker');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-lab-picker';
      modal.className = 'lab-picker-modal';
      document.body.appendChild(modal);
    }

    if (opts.type === 'recipe') {
      const allRecipesList = getAllTargetRecipes();
      const currentTargetName = labState.targetRecipeName || '彈跳咖哩烏龍麵';

      function generateRecipeItemsHtml(query = '', categoryFilter = 'all') {
        const q = (query || '').trim().toLowerCase();
        const filtered = allRecipesList.filter(r => {
          const nameCn = (r.name_cn || r.name || '').toLowerCase();
          const nameEn = (r.name_en || '').toLowerCase();
          const cat = (r.category || '').toLowerCase();

          if (categoryFilter === 'curry' && !cat.includes('咖哩') && !cat.includes('curry') && !cat.includes('濃湯') && !cat.includes('stew')) return false;
          if (categoryFilter === 'salad' && !cat.includes('沙拉') && !cat.includes('salad')) return false;
          if (categoryFilter === 'dessert' && !cat.includes('點心') && !cat.includes('dessert') && !cat.includes('飲料') && !cat.includes('drink')) return false;

          if (!q) return true;
          if (nameCn.includes(q) || nameEn.includes(q) || cat.includes(q)) return true;
          if (Array.isArray(r.ingredients)) {
            return r.ingredients.some(ing => (ing.name || '').toLowerCase().includes(q));
          }
          return false;
        });

        if (filtered.length === 0) {
          return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching recipes found' : '未找到符合條件的料理'}</div>`;
        }

        return filtered.map(r => {
          const rNameCn = r.name_cn || r.name || '';
          const rDisplayName = isEN ? (r.name_en || rNameCn) : rNameCn;
          const isSelected = (rNameCn === currentTargetName || r.name === currentTargetName);
          const ings = Array.isArray(r.ingredients) ? r.ingredients : [];

          const ingsHtml = ings.map(ing => {
            const iDisp = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
            const iconUrl = ing.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ing.name) : '');
            return `
              <span class="lab-recipe-ing-chip" title="${escapeHtml(iDisp)} x${ing.count}">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-recipe-ing-icon" alt="${escapeHtml(iDisp)}">` : ''}
                <span class="lab-recipe-ing-count">x${ing.count}</span>
              </span>
            `;
          }).join('');

          return `
            <div class="lab-recipe-card ${isSelected ? 'selected' : ''}" onclick="window.AppraisalLab.onRecipePickerSelect('${escapeHtml(rNameCn)}')">
              ${isSelected ? `<span class="lab-recipe-active-badge">${isEN ? 'Current' : '當前目標'}</span>` : ''}
              <div class="lab-recipe-card-header">
                ${r.icon ? `<img src="${r.icon}" class="lab-recipe-card-icon" alt="${escapeHtml(rDisplayName)}" loading="lazy">` : ''}
                <div class="lab-recipe-card-meta">
                  <div class="lab-recipe-card-name">${escapeHtml(rDisplayName)}</div>
                  <div class="lab-recipe-card-sub">
                    <span class="lab-recipe-card-cat">${escapeHtml(r.category || '')}</span>
                    ${r.pot_size ? `<span class="lab-recipe-card-pot">${r.pot_size} ${isEN ? 'Pots' : '格'}</span>` : ''}
                    ${r.base_energy ? `<span class="lab-recipe-card-energy">${r.base_energy.toLocaleString()} ${isEN ? 'Energy' : '能量'}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="lab-recipe-card-ingredients">
                ${ingsHtml}
              </div>
            </div>
          `;
        }).join('');
      }

      function renderRecipeItems(query = '', filter = 'all') {
        const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-recipe-list') : null) || document.getElementById('lab-picker-recipe-list');
        if (listEl) {
          listEl.innerHTML = generateRecipeItemsHtml(query, filter);
        }
      }

      modal.innerHTML = `
        <div class="lab-picker-container lab-recipe-picker-container">
          <div class="lab-picker-header">
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
              <span>${isEN ? 'Select Target Recipe' : '挑選目標料理 (深度研究室)'}</span>
              <span style="font-size:11px;color:var(--accent-color,#38bdf8);background:rgba(56,189,248,0.12);padding:1px 6px;border-radius:4px;">${allRecipesList.length} ${isEN ? 'Dishes' : '道料理'}</span>
            </div>
            <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="lab-picker-search-bar">
            <input type="text" id="lab-picker-recipe-search" class="box-form-input" placeholder="${isEN ? 'Search recipe name or ingredient...' : '搜尋料理名稱或所需食材...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
            <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${isEN ? 'All' : '全部'} (${allRecipesList.length})</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="curry" style="padding:3px 10px;font-size:11px;">${isEN ? 'Curry' : '咖哩/濃湯'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="salad" style="padding:3px 10px;font-size:11px;">${isEN ? 'Salad' : '沙拉'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="dessert" style="padding:3px 10px;font-size:11px;">${isEN ? 'Dessert' : '點心/飲料'}</button>
            </div>
          </div>

          <div class="lab-picker-list lab-recipe-picker-list" id="lab-picker-recipe-list">
            ${generateRecipeItemsHtml('', 'all')}
          </div>
        </div>
      `;

      const searchInput = modal.querySelector('#lab-picker-recipe-search');
      let currentFilter = 'all';
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderRecipeItems(searchInput.value, currentFilter);
        });
      }

      modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.getAttribute('data-filter') || 'all';
          renderRecipeItems(searchInput ? searchInput.value : '', currentFilter);
        });
      });

      modal.style.display = 'flex';
      if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
      if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
      document.body.style.overflow = 'hidden';

      modal.onclick = (e) => {
        if (e.target === modal) closeLabPicker();
      };
      return;
    }

    const currentIsland = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);

    let compareTargetIdx = 0;
    if (opts.type === 'compare') {
      if (typeof opts.compareSlot === 'number') compareTargetIdx = opts.compareSlot;
      else if (String(opts.compareSlot).toLowerCase() === 'b' || opts.compareSlot === '1') compareTargetIdx = 1;
      else if (String(opts.compareSlot).toLowerCase() === 'c' || opts.compareSlot === '2') compareTargetIdx = 2;
      else compareTargetIdx = 0;
    }
    const compareLetter = ['A', 'B', 'C'][compareTargetIdx] || 'A';

    const title = opts.type === 'team'
      ? (isEN ? `Select Member for Slot ${opts.slotIndex + 1}` : `挑選隊員 (隊員槽位 ${opts.slotIndex + 1})`)
      : (isEN ? `Select Pokémon for Player ${compareLetter}` : `挑選選手 ${compareLetter}`);

    function generatePickerItemsHtml(query = '', filter = 'all') {
      const q = (query || '').trim().toLowerCase();
      const filtered = userBox.filter(item => {
        const base = findBasePkm(item.pokemonId || item.name);
        const nameCn = (item.name || (base ? base.name_cn : '')).toLowerCase();
        const nameEn = (base && base.name_en ? base.name_en : '').toLowerCase();
        const nick = (item.nickname || '').toLowerCase();
        const dexNo = String(base ? (base.formatted_no || base.id) : (item.pokemonId || ''));

        if (q && !nameCn.includes(q) && !nameEn.includes(q) && !nick.includes(q) && !dexNo.includes(q)) {
          return false;
        }

        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const bName = berry.name || '';
        const bType = berry.type || (base ? base.type : '') || '';
        const isFav = favBerries.includes(bName) || favTypes.includes(bType);

        const spec = (base && base.specialty) || '';
        if (filter === 'fav' && !isFav) return false;
        if (filter === 'berry' && !spec.includes('樹果') && spec !== 'Berries') return false;
        if (filter === 'ingredient' && !spec.includes('食材') && spec !== 'Ingredients') return false;
        if (filter === 'skill' && !spec.includes('技能') && spec !== 'Skills') return false;
        return true;
      });

      if (filtered.length === 0) {
        return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching Pokémon found in Box' : '倉庫中未找到符合條件之寶可夢'}</div>`;
      }

      // Check occupied in comparison
      const occupiedInOtherSlot = new Set();
      let currentSelectedUid = null;
      if (opts.type === 'compare' && Array.isArray(labState.compareSlots)) {
        currentSelectedUid = labState.compareSlots[compareTargetIdx] || null;
        labState.compareSlots.forEach((uid, idx) => {
          if (uid && idx !== compareTargetIdx) occupiedInOtherSlot.add(uid);
        });
      } else if (opts.type === 'team' && Array.isArray(labState.teamSlots)) {
        currentSelectedUid = labState.teamSlots[opts.slotIndex] || null;
      }

      return filtered.map(item => {
        const base = findBasePkm(item.pokemonId || item.name);
        const pDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
        const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
        const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 16) : '';
        const natDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;

        const isOccupied = occupiedInOtherSlot.has(item.uid);
        const isSel = (item.uid === currentSelectedUid);

        let clickAttr;
        if (isOccupied) {
          const toastMsg = isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！';
          clickAttr = `onclick="if(typeof window.showToast==='function')window.showToast('${toastMsg}');"`;
        } else {
          clickAttr = `onclick="window.AppraisalLab.onPickerSelect('${item.uid}')"`;
        }

        return `
          <div class="lab-picker-card ${isSel ? 'selected' : ''} ${isOccupied ? 'occupied disabled' : ''} ${isFav ? 'fav' : ''}" data-uid="${item.uid}" ${clickAttr} title="${isOccupied ? (isEN ? 'Already in comparison' : '已在對比選手中') : ''}">
            ${isOccupied ? `<span class="lab-picker-occupied-badge">${isEN ? 'In Comparison' : '已在對比中'}</span>` : ''}
            <div class="lab-picker-avatar">
              <img src="${avatarUrl}" alt="${escapeHtml(pDisplayName)}" loading="lazy">
              <span class="lab-picker-lv">Lv.${item.level || 1}</span>
            </div>
            <div class="lab-picker-meta">
              <div class="lab-picker-name">${escapeHtml(pDisplayName)}</div>
              ${item.nickname ? `<div class="lab-picker-nick">${escapeHtml(item.nickname)}</div>` : ''}
              <div class="lab-picker-sub">
                ${berry.icon ? `<img src="${berry.icon}" class="lab-picker-berry" alt="Berry">` : ''}
                ${specHtml}
                <span class="lab-picker-nature">${natDisplayName || ''}${(item.cleanseMint || item.mint) ? (isEN ? ' (Mint)' : ' (薄荷)') : ''}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderPickerItems(query = '', filter = 'all') {
      const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-items-list') : null) || document.getElementById('lab-picker-items-list');
      if (listEl) {
        listEl.innerHTML = generatePickerItemsHtml(query, filter);
      }
    }

    modal.innerHTML = `
      <div class="lab-picker-container">
        <div class="lab-picker-header">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);">${title}</div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="lab-picker-search-bar">
          <input type="text" id="lab-picker-search-input" class="box-form-input" placeholder="${isEN ? 'Search name, nickname or Dex No...' : '搜尋寶可夢名稱、暱稱或編號...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
          <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${isEN ? 'All' : '全部'} (${userBox.length})</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="fav" style="padding:3px 10px;font-size:11px;">${isEN ? 'Favored' : '喜愛樹果'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="berry" style="padding:3px 10px;font-size:11px;">${isEN ? 'Berries' : '樹果型'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="ingredient" style="padding:3px 10px;font-size:11px;">${isEN ? 'Ingredients' : '食材型'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="skill" style="padding:3px 10px;font-size:11px;">${isEN ? 'Skills' : '技能型'}</button>
          </div>
        </div>

        <div class="lab-picker-list" id="lab-picker-items-list">${generatePickerItemsHtml('', 'all')}</div>
      </div>
    `;

    const searchInput = modal.querySelector('#lab-picker-search-input');
    let currentFilter = 'all';
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderPickerItems(searchInput.value, currentFilter);
      });
    }

    modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderPickerItems(searchInput ? searchInput.value : '', currentFilter);
      });
    });

    modal.style.display = 'flex';
    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
    document.body.style.overflow = 'hidden';

    modal.onclick = (e) => {
      if (e.target === modal) closeLabPicker();
    };
  }

  function closeLabPicker() {
    const modal = document.getElementById('modal-lab-picker');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    activePickerState = null;
  }

  function onPickerSelect(uid) {
    if (!activePickerState) return;
    if (activePickerState.type === 'team') {
      setTeamSlot(activePickerState.slotIndex, uid);
    } else if (activePickerState.type === 'compare') {
      const slot = activePickerState.compareSlot !== undefined ? activePickerState.compareSlot : (activePickerState.slotIndex || 0);
      setCompareSlot(slot, uid);
    } else if (activePickerState.type === 'recipe') {
      setTargetRecipe(uid);
    }
    closeLabPicker();
  }

  function onRecipePickerSelect(recipeName) {
    setTargetRecipe(recipeName);
    closeLabPicker();
  }

  function renderGreengrassBerrySelect(idx, currentBerryName, isEN) {
    const optionsHtml = BERRY_VALUES_DATA.map(b => {
      const bDisp = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b.name) : b.name) : b.name;
      const tDisp = window.I18N ? window.I18N.getTypeName(b.type) : b.type;
      const isSel = b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = BERRY_VALUES_DATA.find(b => b.name === currentBerryName) || BERRY_VALUES_DATA[0];

    return `
      <div class="lab-greengrass-berry-item">
        ${bObj && bObj.icon ? `<img src="${bObj.icon}" class="lab-berry-mini-icon" alt="Berry">` : ''}
        <select class="lab-select lab-berry-select" onchange="window.AppraisalLab.setGreengrassBerry(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /* ─── 幫手組隊 HTML 產生器 (Team Builder View Renderer) ──────────────── */
  function renderTeamBuilderView(userBox, pokemons, isEN, isMobileH5) {
    const island = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);
    const isGreengrass = labState.teamIslandId === 'greengrass';

    while (labState.teamSlots.length < 5) labState.teamSlots.push(null);
    if (labState.teamSlots.length > 5) labState.teamSlots = labState.teamSlots.slice(0, 5);

    const teamItems = labState.teamSlots.map(uid => uid ? userBox.find(p => p.uid === uid) : null);
    const simulation = simulateTeamPerformance(teamItems, labState.teamIslandId);

    const islandPillsHtml = LAB_ISLANDS.map(isl => {
      const isActive = labState.teamIslandId === isl.id;
      return `
        <button type="button" class="lab-island-pill ${isActive ? 'active' : ''}" style="${isActive ? `border-color:${isl.color};color:${isl.color};` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')">
          <span class="lab-island-dot" style="width:8px;height:8px;border-radius:50%;background:${isl.color};display:inline-block;"></span>
          <span>${isEN ? (isl.name_en || isl.name) : isl.name}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = BERRY_VALUES_DATA.find(b => b.name === bName) || {};
      const bDisplayName = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(bName) : bName) : bName;
      return `
        <span class="lab-island-berry-tag" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(bDisplayName)}">` : ''}
          <span>${escapeHtml(bDisplayName)}</span>
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:12px;font-weight:700;color:#22c55e;">[#] ${isEN ? 'Greengrass Favored Berries (Customizable):' : '萌綠之島本週喜愛樹果 (可自由自選):'}</span>
            <span style="font-size:11px;color:var(--text-muted);">${isEN ? 'Select 3 favored berries for this week (2x energy boost)' : '自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries from 18' : '從 18 種樹果隨機刷新 3 種'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${isEN ? 'Random Reroll' : '隨機擲骰'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:11px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries and immediately auto-optimize team' : '隨機抽出 3 種樹果並立即自動推薦最佳陣容'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${isEN ? 'Roll & Build' : '擲骰並自動配隊'}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx], isEN)).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = isEN ? (targetRecipe.name_en || targetRecipe.name_cn) : (targetRecipe.name_cn || targetRecipe.name);
    const targetRecipeCategory = isEN
      ? (targetRecipe.category || 'Curry')
      : (targetRecipe.category || '咖哩');
    const isTargetRecipeStrategy = labState.teamStrategy === 'recipe';

    const teamVariablesBarHtml = `
      <div class="lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${isEN ? 'Team Focus:' : '隊伍類型:'}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${isEN ? 'Balanced' : '綜合隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${isEN ? 'Berries' : '樹果隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${isEN ? 'Ingredients' : '食材隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${isEN ? 'Skills' : '技能隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${isEN ? 'Target Recipe' : '目標料理'}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${isEN ? 'Target Dish:' : '目標料理:'}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${isEN ? 'Click to change target recipe' : '點擊切換目標料理'}">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-name">${escapeHtml(targetRecipeDisplayName)}</span>
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${isEN ? 'Change' : '切換'}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${isEN ? 'Cooking Goal:' : '料理種類:'}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${isEN ? 'Curry/Stew' : '咖哩/濃湯'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${isEN ? 'Salad' : '沙拉'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${isEN ? 'Dessert/Drinks' : '點心/飲料'}</button>
            </div>
          </div>
        `}
      </div>
    `;

    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${isEN ? 'Click to select team member' : '點擊挑選隊員'}">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);margin-bottom:4px;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${isEN ? `Slot ${idx + 1}` : `隊員 ${idx + 1}`}</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">${isEN ? 'Empty Slot' : '空缺位 · 點擊挑選'}</div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 16) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N ? window.I18N.getMainSkillName(rawSkill) : rawSkill) : (isEN ? 'Skill' : '技能');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const simSlot = simulation.slotResults[idx];

      return `
        <div class="lab-team-slot-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:10.5px;font-weight:800;color:var(--text-muted);">${isEN ? `SLOT ${idx + 1}` : `隊員 ${idx + 1}`}</span>
            <button type="button" class="lab-slot-remove-btn" onclick="window.AppraisalLab.clearTeamSlot(${idx})" title="${isEN ? 'Remove from team' : '從隊伍移除'}" style="background:transparent;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:0 2px;">
              [X]
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <div style="position:relative;flex-shrink:0;">
              <img src="${avatarUrl}" style="width:42px;height:42px;object-fit:contain;" alt="${escapeHtml(displayName)}" loading="lazy">
              <span style="position:absolute;bottom:-3px;right:-3px;background:#0f172a;border:1px solid #334155;border-radius:4px;padding:0 3px;font-size:9.5px;font-weight:800;color:#94a3b8;">Lv.${item.level || 1}</span>
            </div>
            <div style="min-width:0;flex:1;">
              <div style="font-size:12.5px;font-weight:700;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${escapeHtml(displayName)}
              </div>
              ${item.nickname ? `<div style="font-size:10.5px;color:var(--accent-color,#38bdf8);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">(${escapeHtml(item.nickname)})</div>` : ''}
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                ${specialtyIconHtml}
                ${berry.icon ? `<img src="${berry.icon}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;" alt="Berry">` : ''}
                ${isFav ? `<span style="background:rgba(234,179,8,0.2);color:#facc15;padding:0 3px;border-radius:3px;font-weight:800;font-size:9.5px;">2x 喜愛</span>` : ''}
              </div>
            </div>
          </div>

          <div style="font-size:11px;color:var(--text-secondary);display:flex;flex-direction:column;gap:2px;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-weight:700;">${isEN ? 'Skill:' : '技能:'}</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;">${escapeHtml(skillName)}</span>
              <span style="background:rgba(56,189,248,0.15);color:var(--accent-color,#38bdf8);padding:0 3px;border-radius:3px;font-size:9.5px;font-weight:700;">Lv.${skillLv}</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="color:var(--text-muted);font-weight:700;">${isEN ? 'Nat:' : '性格:'}</span>
              <span>${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ' <span class="nature-mint-tag">' + (isEN ? 'Mint' : '使用淨白薄荷消除個性效果') + '</span>' : ''}</span>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:3px;">
            ${[0, 1, 2, 3, 4].map(sIdx => {
              const lvReq = [10, 25, 50, 70, 80][sIdx];
              const isUnlocked = (item.level || 1) >= lvReq;
              const sName = subs[sIdx] || '';
              if (!sName) return '';
              const tier = getSkillTier(sName);
              const sDisplayName = window.I18N ? window.I18N.getSubSkillName(sName) : sName;
              return `
                <div class="box-subskill-pill subskill-${tier} ${!isUnlocked ? 'subskill-locked' : ''}" style="font-size:10px;padding:1px 4px;margin:0;line-height:1.2;" title="Lv.${lvReq} ${escapeHtml(sDisplayName)}${!isUnlocked ? (isEN ? ' (Locked)' : ' (未解鎖)') : ''}">
                  <span style="font-size:8.5px;color:var(--text-muted);margin-right:2px;">${lvReq}</span>
                  <span class="subskill-name">${escapeHtml(sDisplayName)}</span>
                </div>
              `;
            }).join('')}
          </div>

          ${simSlot ? `
            <div style="margin-top:auto;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);font-size:10.5px;color:var(--text-muted);display:flex;justify-content:space-between;">
              <span>${isEN ? 'Daily Berry:' : '每日樹果:'}</span>
              <strong style="color:#facc15;">${simSlot.dailyBerryEnergy.toLocaleString()}</strong>
            </div>
          ` : ''}

          <button type="button" class="box-btn box-btn-secondary" style="font-size:11px;padding:3px 6px;margin-top:2px;" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
            ${isEN ? 'Replace' : '更換'}
          </button>
        </div>
      `;
    }).join('');

    const ingEntries = Object.entries(simulation.ingredientsMap);
    ingEntries.sort((a, b) => b[1] - a[1]);
    const keyIngs = COOKING_CATEGORY_KEY_INGREDIENTS[labState.cookingType] || [];
    const topIngsHtml = ingEntries.slice(0, 8).map(([iName, count]) => {
      const iDisplayName = window.I18N ? window.I18N.getIngredientName(iName) : iName;
      const iconUrl = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
      const isCookMatch = keyIngs.includes(iName);
      return `
        <div style="display:inline-flex;align-items:center;gap:3px;background:${isCookMatch ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)'};border:1px solid ${isCookMatch ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'};border-radius:5px;padding:2px 5px;font-size:11px;" title="${escapeHtml(iDisplayName)}${isCookMatch ? (isEN ? ' (Cooking Matched)' : ' (料理契合)') : ''}">
          ${iconUrl ? `<img src="${iconUrl}" style="width:14px;height:14px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${isCookMatch ? '#38bdf8' : '#e2e8f0'};font-weight:700;">x${count}</span>
          ${isCookMatch ? `<span style="font-size:8.5px;color:#38bdf8;font-weight:800;">${isEN ? 'FIT' : '契合'}</span>` : ''}
        </div>
      `;
    }).join('');

    const targetAnalysis = simulation.targetRecipeAnalysis;
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N ? window.I18N.getIngredientName(item.name) : item.name;
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus ? `+${item.diff} ${isEN ? 'Surplus' : '充裕'}` : `${item.diff} ${isEN ? 'Deficit' : '缺口'}`;
        const diffClass = isSurplus ? 'lab-supply-surplus' : 'lab-supply-deficit';
        const barPct = Math.min(100, Math.max(0, item.fulfillmentPct));
        const barColor = item.fulfillmentPct >= 100 ? '#22c55e' : (item.fulfillmentPct >= 60 ? 'var(--accent-color, #38bdf8)' : '#f59e0b');

        return `
          <div class="lab-supply-row">
            <div class="lab-supply-col-ing">
              ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" alt="${escapeHtml(iDisplayName)}">` : ''}
              <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
            </div>
            <div class="lab-supply-col-demand" title="${isEN ? 'Single meal requirement' : '單餐需求'}">
              <span class="lab-supply-label">${isEN ? 'Per Meal:' : '每餐:'}</span>
              <strong style="color:var(--text-primary);">x${item.perMeal}</strong>
            </div>
            <div class="lab-supply-col-daily" title="${isEN ? 'Daily 3-meal total demand' : '每日 3 餐總需求'}">
              <span class="lab-supply-label">${isEN ? 'Daily Demand:' : '日需(3餐):'}</span>
              <strong style="color:var(--text-secondary);">x${item.dailyDemand}</strong>
            </div>
            <div class="lab-supply-col-yield" title="${isEN ? 'Team estimated daily harvest' : '隊伍每日預估產出'}">
              <span class="lab-supply-label">${isEN ? 'Team Yield:' : '隊伍日產:'}</span>
              <strong style="color:#22c55e;">x${item.teamYield}</strong>
            </div>
            <div class="lab-supply-col-diff">
              <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
            </div>
            <div class="lab-supply-col-progress">
              <div class="lab-supply-progress-bar-bg">
                <div class="lab-supply-progress-bar-fill" style="width:${barPct}%;background:${barColor};"></div>
              </div>
              <span class="lab-supply-progress-pct" style="color:${barColor};">${item.fulfillmentPct}%</span>
            </div>
          </div>
        `;
      }).join('');

      const overallStatusBadge = targetAnalysis.isFullySatisfied
        ? `<span class="lab-supply-overall-badge satisfied">[✓] ${isEN ? '100% Self-Sufficient' : '100% 達成 · 可完全自給自足'}</span>`
        : `<span class="lab-supply-overall-badge pending">${isEN ? `Overall: ${targetAnalysis.overallFulfillmentPct}%` : `全體達成率: ${targetAnalysis.overallFulfillmentPct}%`}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span class="lab-supply-dish-name">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${isEN ? 'Pots' : '格鍋容量'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${isEN ? 'Base Energy' : '基礎能量'}</span>` : ''}
                </div>
                <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">
                  ${isEN ? 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)' : '目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:11px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${isEN ? 'Change Recipe' : '更換目標料理'}</span>
              </button>
            </div>
          </div>
          <div class="lab-supply-table-wrapper">
            <div class="lab-supply-items-list">
              ${itemsHtml}
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="lab-team-view-container">
        <div class="lab-island-selector">
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);margin-right:4px;">${isEN ? 'Camp:' : '研究營地:'}</div>
          ${islandPillsHtml}
        </div>

        ${teamVariablesBarHtml}

        ${greengrassConfigHtml}

        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
            <span style="font-size:12px;font-weight:700;color:var(--text-secondary);">${isEN ? 'Favored Berries (2x Power):' : '喜愛樹果 (2x 能量):'}</span>
            ${favoredBerriesHtml}
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.autoOptimizeTeam(true)" style="font-size:12px;padding:5px 12px;display:inline-flex;align-items:center;gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${isEN ? 'Auto-Optimize Team' : '一鍵推薦最佳陣容'}</span>
            </button>
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.clearAllTeamSlots()" style="font-size:12px;padding:5px 12px;display:inline-flex;align-items:center;gap:4px;">
              <span>[X]</span>
              <span>${isEN ? 'Clear Team' : '清空隊伍'}</span>
            </button>
          </div>
        </div>

        <div class="lab-team-grid">
          ${slotsHtml}
        </div>

        ${supplyDemandBoardHtml}

        <div class="lab-team-metrics-grid">
          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Estimated Daily Total Energy' : '預估每日能量總產出'}</div>
            <div class="lab-metric-value">${simulation.totalDailyBerryEnergy.toLocaleString()} <span style="font-size:13px;font-weight:600;color:var(--text-muted);">${isEN ? 'pts/day' : '能量/日'}</span></div>
            <div class="lab-metric-sub">
              ${isEN ? `Calculated based on ${island.name_en || island.name} 2x berry energy bonus, helping speed, and subskill multipliers.` : `依據【${island.name}】喜愛樹果 2 倍能量加成、幫手速度與副技能協同倍率精確計算。`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Daily Ingredients Harvest' : '預估每日食材總產量'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:13px;font-weight:600;color:var(--text-muted);">${isEN ? 'items/day' : '個/日'}</span></div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:11px;color:var(--text-muted);">${isEN ? 'No ingredients yet' : '尚無食材產出'}</span>`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:12px;font-weight:700;color:var(--text-muted);">${isEN ? 'Skills & Team Auras' : '主技能與隊伍光環協同'}</div>
            <div style="font-size:13px;color:var(--text-primary);display:flex;flex-direction:column;gap:4px;margin-top:2px;">
              <div>${isEN ? 'Main Skill Procs:' : '主技能總發動預估:'} <strong style="color:var(--accent-color,#38bdf8);">${simulation.totalDailySkillProcs} ${isEN ? 'times/day' : '次/日'}</strong></div>
              <div>${isEN ? 'Helping Bonus:' : '幫手獎勵光環:'} <strong style="color:#facc15;">${simulation.helpingBonusCount} ${isEN ? 'layers' : '層'} (+${simulation.helpingBonusCount * 5}% ${isEN ? 'Speed' : '全隊幫速'})</strong></div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.3;">
                ${simulation.hasHealer ? `<span style="color:#22c55e;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:2px;"><polyline points="20 6 9 17 4 12"></polyline></svg>${isEN ? 'Team has dedicated healer: High energy (>80%) grants 2.2x speed boost!' : '隊內具備常駐補師：預估常駐高活力 (>80%)，享有 2.2x 最大幫速加速！'}</span>` : `<span style="color:#94a3b8;">[!] ${isEN ? 'No healer in team: Daytime energy decay applies (~1.6x speed baseline).' : '隊內無常駐補師：預估日間活力衰減 (約 1.6x 基準幫速)。'}</span>`}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
