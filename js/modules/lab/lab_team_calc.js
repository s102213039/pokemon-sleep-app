  /* ─── 卡比獸島嶼週日階級評級標準 (Snorlax Island Master Rank Energy Tiers) ─── */
  const ISLAND_SNORLAX_THRESHOLDS = {
    greengrass: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 23385 },
      { rank: 'Ultra 1', energy: 79197 },
      { rank: 'Master 1', energy: 187832 },
      { rank: 'Master 5', energy: 321146 },
      { rank: 'Master 10', energy: 532707 },
      { rank: 'Master 15', energy: 1199506 },
      { rank: 'Master 20', energy: 3245795 }
    ],
    cyan: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 36164 },
      { rank: 'Ultra 1', energy: 122474 },
      { rank: 'Master 1', energy: 256544 },
      { rank: 'Master 5', energy: 420363 },
      { rank: 'Master 10', energy: 735875 },
      { rank: 'Master 15', energy: 1379432 },
      { rank: 'Master 20', energy: 3732664 }
    ],
    beach: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 36164 },
      { rank: 'Ultra 1', energy: 122474 },
      { rank: 'Master 1', energy: 256544 },
      { rank: 'Master 5', energy: 420363 },
      { rank: 'Master 10', energy: 735875 },
      { rank: 'Master 15', energy: 1379432 },
      { rank: 'Master 20', energy: 3732664 }
    ],
    taupe: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 51635 },
      { rank: 'Ultra 1', energy: 174869 },
      { rank: 'Master 1', energy: 366295 },
      { rank: 'Master 5', energy: 600197 },
      { rank: 'Master 10', energy: 1050688 },
      { rank: 'Master 15', energy: 1776213 },
      { rank: 'Master 20', energy: 4219534 }
    ],
    snowdrop: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 78645 },
      { rank: 'Ultra 1', energy: 266344 },
      { rank: 'Master 1', energy: 557907 },
      { rank: 'Master 5', energy: 914159 },
      { rank: 'Master 10', energy: 1600296 },
      { rank: 'Master 15', energy: 2705329 },
      { rank: 'Master 20', energy: 4706403 }
    ],
    lapis: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 97031 },
      { rank: 'Ultra 1', energy: 328610 },
      { rank: 'Master 1', energy: 675330 },
      { rank: 'Master 5', energy: 1075709 },
      { rank: 'Master 10', energy: 1825483 },
      { rank: 'Master 15', energy: 2925574 },
      { rank: 'Master 20', energy: 5193272 }
    ],
    powerplant: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 151061 },
      { rank: 'Ultra 1', energy: 511595 },
      { rank: 'Master 1', energy: 1038306 },
      { rank: 'Master 5', energy: 1582395 },
      { rank: 'Master 10', energy: 2476059 },
      { rank: 'Master 15', energy: 3744954 },
      { rank: 'Master 20', energy: 6674166 }
    ],
    oldgold: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 151061 },
      { rank: 'Ultra 1', energy: 511595 },
      { rank: 'Master 1', energy: 1038306 },
      { rank: 'Master 5', energy: 1582395 },
      { rank: 'Master 10', energy: 2476059 },
      { rank: 'Master 15', energy: 3744954 },
      { rank: 'Master 20', energy: 6674166 }
    ],
    amber: [
      { rank: 'Basic 1', energy: 0 },
      { rank: 'Great 1', energy: 198585 },
      { rank: 'Ultra 1', energy: 654607 },
      { rank: 'Master 1', energy: 1325740 },
      { rank: 'Master 5', energy: 2015408 },
      { rank: 'Master 10', energy: 3179971 },
      { rank: 'Master 15', energy: 4815792 },
      { rank: 'Master 20', energy: 8528976 }
    ]
  };

  function calculateProjectedSnorlaxRank(weeklyEnergy, islandId) {
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    if (typeof weeklyEnergy !== 'number' || isNaN(weeklyEnergy) || !isFinite(weeklyEnergy) || weeklyEnergy <= 0) {
      return isEN ? 'Basic 1' : '普通 1';
    }
    const key = (islandId || 'greengrass').toLowerCase();
    const tiers = ISLAND_SNORLAX_THRESHOLDS[key] || ISLAND_SNORLAX_THRESHOLDS.greengrass;
    const m1 = tiers.find(t => t.rank === 'Master 1') || { energy: 187832 };
    const m5 = tiers.find(t => t.rank === 'Master 5') || { energy: 321146 };
    const m10 = tiers.find(t => t.rank === 'Master 10') || { energy: 532707 };
    const m15 = tiers.find(t => t.rank === 'Master 15') || { energy: 1199506 };
    const m20 = tiers.find(t => t.rank === 'Master 20') || { energy: 3245795 };

    if (weeklyEnergy >= m20.energy) {
      return isEN ? 'Master 20' : '大師 20';
    }
    if (weeklyEnergy >= m15.energy) {
      const step = (m20.energy - m15.energy) / 5;
      const rankNum = Math.max(15, Math.min(20, 15 + Math.floor((weeklyEnergy - m15.energy) / Math.max(1, step))));
      return isEN ? `Master ${rankNum}` : `大師 ${rankNum}`;
    }
    if (weeklyEnergy >= m10.energy) {
      const step = (m15.energy - m10.energy) / 5;
      const rankNum = Math.max(10, Math.min(15, 10 + Math.floor((weeklyEnergy - m10.energy) / Math.max(1, step))));
      return isEN ? `Master ${rankNum}` : `大師 ${rankNum}`;
    }
    if (weeklyEnergy >= m5.energy) {
      const step = (m10.energy - m5.energy) / 5;
      const rankNum = Math.max(5, Math.min(10, 5 + Math.floor((weeklyEnergy - m5.energy) / Math.max(1, step))));
      return isEN ? `Master ${rankNum}` : `大師 ${rankNum}`;
    }
    if (weeklyEnergy >= m1.energy) {
      const step = (m5.energy - m1.energy) / 4;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - m1.energy) / Math.max(1, step))));
      return isEN ? `Master ${rankNum}` : `大師 ${rankNum}`;
    }
    const u1 = tiers.find(t => t.rank === 'Ultra 1') || { energy: 79197 };
    if (weeklyEnergy >= u1.energy) {
      const step = (m1.energy - u1.energy) / 5;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - u1.energy) / Math.max(1, step))));
      return isEN ? `Ultra ${rankNum}` : `超級 ${rankNum}`;
    }
    const g1 = tiers.find(t => t.rank === 'Great 1') || { energy: 23385 };
    if (weeklyEnergy >= g1.energy) {
      const step = (u1.energy - g1.energy) / 5;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - g1.energy) / Math.max(1, step))));
      return isEN ? `Great ${rankNum}` : `進階 ${rankNum}`;
    }
    const b1 = tiers.find(t => t.rank === 'Basic 1') || { energy: 0 };
    const step = (g1.energy - b1.energy) / 5;
    const rankNum = Math.max(1, Math.min(5, 1 + Math.floor(weeklyEnergy / Math.max(1, step))));
    return isEN ? `Basic ${rankNum}` : `普通 ${rankNum}`;
  }

  /* ─── 幫手隊伍效益模擬器 (Team Synergy & Output Simulator) ─────────────── */
  function simulateTeamPerformance(teamPokemonItems, islandId, targetRecipeArg, potSize, options) {
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    const validItems = Array.isArray(teamPokemonItems) ? teamPokemonItems.filter(Boolean) : [];

    // If team is completely empty or null, immediately return zero output
    if (!teamPokemonItems || !Array.isArray(teamPokemonItems) || teamPokemonItems.length === 0 || validItems.length === 0) {
      return {
        island,
        totalDailyBerryEnergy: 0,
        dailyCookingEnergy: 0,
        dailySkillEnergy: 0,
        totalDailyEnergy: 0,
        projectedSundayRank: isEN ? 'Basic 1' : '普通 1',
        weeklyProjectedEnergy: 0,
        totalDailyIngredientsCount: 0,
        ingredientsMap: {},
        totalDailySkillProcs: '0.0',
        helpingBonusCount: 0,
        sleepExpBonusCount: 0,
        energyRecoveryBonusCount: 0,
        researchExpBonusCount: 0,
        dreamShardBonusCount: 0,
        hasHealer: false,
        slotResults: Array.isArray(teamPokemonItems) ? teamPokemonItems.map(() => null) : [],
        targetRecipeAnalysis: null
      };
    }

    const favBerries = getIslandFavoredBerries(islandId);
    const favTypes = getIslandFavoredTypes(islandId);

    let totalDailyBerryEnergy = 0;
    let totalDailySkillProcs = 0;
    let totalDailySkillEnergy = 0;
    let totalDailyIngredientsCount = 0;
    const ingredientsMap = {};
    let helpingBonusCount = 0;
    let sleepExpBonusCount = 0;
    let energyRecoveryBonusCount = 0;
    let researchExpBonusCount = 0;
    let dreamShardBonusCount = 0;
    let hasHealer = false;

    validItems.forEach(item => {
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const itemLv = item.level || 1;
      const lvReqs = [10, 25, 50, 70, 80];
      subs.forEach((s, sIdx) => {
        const req = lvReqs[sIdx] || 10;
        if (itemLv >= req) {
          if (s === '幫手獎勵' || s === 'Helping Bonus') helpingBonusCount++;
          if (s === '睡眠EXP獎勵' || s === 'Sleep EXP Bonus') sleepExpBonusCount++;
          if (s === '活力回復獎勵' || s === '能量回復獎勵' || s === 'Energy Recovery Bonus') energyRecoveryBonusCount++;
          if (s === '研究EXP獎勵' || s === 'Research EXP Bonus') researchExpBonusCount++;
          if (s === '夢之碎片獎勵' || s === 'Dream Shard Bonus') dreamShardBonusCount++;
        }
      });
      const base = findBasePkm(item.pokemonId || item.name);
      const skill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      if (skill.includes('活力療癒') || skill.includes('活力全體療癒') || skill.includes('能量充填') || skill.includes('Energizing') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('蹭蹭臉頰')) {
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
      const isFavored = _isLabFavoredBerryOrType(berryName, berryType, favBerries, favTypes);

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

      const bValueObj = _findLabBerryData(berryName);
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

      const unlockedSlots = [
        { idx: 0, name: item.ing1 || (base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '') }
      ];
      if (level >= 30) {
        unlockedSlots.push({ idx: 1, name: item.ing2 || (base.ingredients && base.ingredients[1] ? base.ingredients[1].name : unlockedSlots[0].name) });
      }
      if (level >= 60) {
        unlockedSlots.push({ idx: 2, name: item.ing3 || (base.ingredients && base.ingredients[2] ? base.ingredients[2].name : unlockedSlots[0].name) });
      }
      const validSlots = unlockedSlots.filter(s => s.name);
      const helpsPerSlot = ingHelps / Math.max(1, validSlots.length);

      validSlots.forEach(s => {
        const dropCount = (typeof getIngCountFromBase === 'function')
          ? getIngCountFromBase(base, s.idx, s.name)
          : (s.idx === 0 ? 1 : (s.idx === 1 ? 2 : 4));
        const totalIngAmount = Math.round(helpsPerSlot * dropCount);
        ingredientsMap[s.name] = (ingredientsMap[s.name] || 0) + totalIngAmount;
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

      let slotSkillEnergy = 0;
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      let avgPower = 0;
      if (rawSkill.includes('能量填充M') || rawSkill.includes('Charge Strength M') || rawSkill.includes('Charge Energy M')) {
        avgPower = 3800;
      } else if (rawSkill.includes('能量填充') || rawSkill.includes('Charge Strength') || rawSkill.includes('Charge Energy')) {
        avgPower = 2400;
      } else if (rawSkill.includes('幫手激勵') || rawSkill.includes('Helper Boost')) {
        avgPower = 3500;
      } else if (rawSkill.includes('幫手支援') || rawSkill.includes('Extra Helpful')) {
        avgPower = 2000;
      } else if (rawSkill.includes('料理擴大') || rawSkill.includes('Cooking Power-Up')) {
        avgPower = 1500;
      } else if (rawSkill.includes('食材獲取') || rawSkill.includes('Ingredient Magnet')) {
        avgPower = 1200;
      }
      slotSkillEnergy = Math.round(dailySkillProcs * avgPower);
      totalDailySkillEnergy += slotSkillEnergy;

      return {
        item,
        base,
        level,
        isFavored,
        effectiveInterval,
        dailyHelps,
        dailyBerryEnergy,
        dailySkillEnergy: slotSkillEnergy,
        dailySkillProcs: dailySkillProcs.toFixed(1)
      };
    });

    let targetRecipe = null;
    if (targetRecipeArg) {
      if (typeof targetRecipeArg === 'string' && typeof findTargetRecipe === 'function') {
        targetRecipe = findTargetRecipe(targetRecipeArg);
      } else if (typeof targetRecipeArg === 'object') {
        targetRecipe = targetRecipeArg;
      }
    }
    if (!targetRecipe && typeof labState !== 'undefined' && labState.targetRecipeName && typeof findTargetRecipe === 'function') {
      targetRecipe = findTargetRecipe(labState.targetRecipeName);
    }

    const effectivePotSize = (typeof potSize === 'number' && potSize > 0)
      ? potSize
      : ((options && typeof options.potSize === 'number')
          ? options.potSize
          : ((typeof labState !== 'undefined' && labState.potSize) || 57));

    let targetRecipeAnalysis = null;
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
      const targetPotReq = (targetRecipe && targetRecipe.pot_size) || 0;
      const isPotFeasible = targetPotReq > 0 ? (effectivePotSize >= targetPotReq) : true;
      targetRecipeAnalysis = {
        recipe: targetRecipe,
        items,
        overallFulfillmentPct,
        isFullySatisfied: items.every(i => i.teamYield >= i.dailyDemand),
        effectivePotSize,
        isPotFeasible
      };
    }

    let dailyCookingEnergy = 0;
    if (targetRecipe && targetRecipe.base_energy) {
      const recipeLevelMultiplier = 1 + ((targetRecipe.bonus_pct || 25) / 100);
      const islandMultiplier = 1.0;
      let fulfillmentRatio = 0.0;
      if (targetRecipeAnalysis && typeof targetRecipeAnalysis.overallFulfillmentPct === 'number') {
        fulfillmentRatio = Math.min(1.0, Math.max(0.0, targetRecipeAnalysis.overallFulfillmentPct / 100));
      }
      dailyCookingEnergy = Math.round(targetRecipe.base_energy * recipeLevelMultiplier * islandMultiplier * 3 * fulfillmentRatio);
    } else {
      const ingBaseSum = Object.entries(ingredientsMap).reduce((sum, [iName, count]) => {
        const ingVal = (typeof INGREDIENT_ENERGY_DICT !== 'undefined' && INGREDIENT_ENERGY_DICT[iName]) ? INGREDIENT_ENERGY_DICT[iName] : 110;
        return sum + count * ingVal;
      }, 0);
      dailyCookingEnergy = ingBaseSum > 0 ? Math.round(ingBaseSum * 1.25) : 0;
    }

    const totalDailyEnergy = totalDailyBerryEnergy + dailyCookingEnergy + totalDailySkillEnergy;
    const weeklyProjectedEnergy = totalDailyEnergy * 7;
    const projectedSundayRank = calculateProjectedSnorlaxRank(weeklyProjectedEnergy, islandId);

    return {
      island,
      totalDailyBerryEnergy,
      dailyCookingEnergy,
      dailySkillEnergy: totalDailySkillEnergy,
      totalDailyEnergy,
      projectedSundayRank,
      weeklyProjectedEnergy,
      totalDailyIngredientsCount,
      ingredientsMap,
      totalDailySkillProcs: totalDailySkillProcs.toFixed(1),
      helpingBonusCount,
      sleepExpBonusCount,
      energyRecoveryBonusCount,
      researchExpBonusCount,
      dreamShardBonusCount,
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
      // 強度指數：等級權重指數化，確保高等級真正強勢怪優先入隊
      const levelWeight = Math.pow(Math.max(1, level) / 30, 1.35);

      const berry = (typeof window.getPokemonBerry === 'function') ? window.getPokemonBerry(base) : (base.berry || {});
      const berryName = berry.name || '';
      const berryType = berry.type || base.type || '';
      const isFavored = _isLabFavoredBerryOrType(berryName, berryType, favBerries, favTypes);

      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const isMint = !!(item.cleanseMint || item.mint);
      const nat = isMint ? null : NATURE_DATA.find(n => n.name === item.nature);

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

      const teamSpeciesMap = {};

      while (selected.length < 5) {
        let bestCandidate = null;
        let bestScore = -1;

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
          const nat = isMint ? null : NATURE_DATA.find(n => n.name === p.nature);
          let natMultiplier = 1.0;
          if (nat && nat.buff && nat.buff.includes('食材')) natMultiplier *= 1.20;
          if (nat && nat.debuff && nat.debuff.includes('食材')) natMultiplier *= 0.80;
          if (nat && nat.buff && nat.buff.includes('幫忙速度')) natMultiplier *= 1.10;

          // 統計該寶可夢在當前「仍有缺口」之目標食材中的實質日產能 (>=8 個視為具實質規模)
          let effectiveMatchCount = 0;
          let deficitCoveredScore = 0;
          let totalYieldAmount = 0;

          reqIngredients.forEach(ing => {
            const def = remainingDeficits[ing.name] || 0;
            const y = estimatePkmIngDailyYield(p, ing.name);
            if (y > 0) {
              if (def > 0 && y >= 8) {
                effectiveMatchCount++;
              }
              const covered = Math.min(y, def);
              const surplus = Math.max(0, y - def);
              deficitCoveredScore += covered * 4.5;
              totalYieldAmount += surplus * 0.25;
            }
          });

          // 雙食材或多食材重疊契合度加權：必須高等級 (Lv>=30) 且對不同缺口均有實質規模產出
          let synergyMultiplier = 1.0;
          if (pLv >= 30 && effectiveMatchCount >= 3) synergyMultiplier = 2.5;
          else if (pLv >= 30 && effectiveMatchCount === 2) synergyMultiplier = 1.85;
          else if (effectiveMatchCount === 1) synergyMultiplier = 1.0;
          else synergyMultiplier = 0.35;

          const rawYieldScore = deficitCoveredScore + totalYieldAmount;
          if (rawYieldScore > 0) {
            const finalScore = rawYieldScore * synergyMultiplier * levelWeight * specMultiplier * subMultiplier * natMultiplier * favMultiplier * duplicatePenalty;
            if (finalScore > bestScore) {
              bestScore = finalScore;
              bestCandidate = p;
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
            const y = estimatePkmIngDailyYield(bestCandidate, ing.name);
            remainingDeficits[ing.name] = Math.max(0, (remainingDeficits[ing.name] || 0) - y);
          });
        } else {
          // 當所有缺口已滿足或無食材契合怪時，挑選全隊中最強的食材型或高戰力綜合怪
          const fallback = pickBest(userBox, 'ingredient') || pickBest(userBox, 'general');
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
    autoOptimizeTeam(false);
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
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
      const berryDisplay = rolled.map(b => (isEN && window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b) : b)).join(', ');
      window.showToast(isEN ? `Greengrass favored berries rerolled: ${berryDisplay}` : `萌綠之島喜愛樹果已隨機刷新：${rolled.join('、')}！`);
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
