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

  const _snorlaxTierMapCache = new Map();
  function _getSnorlaxTierMap(tiers) {
    let m = _snorlaxTierMapCache.get(tiers);
    if (!m) {
      m = new Map();
      for (let i = 0; i < tiers.length; i++) {
        if (tiers[i] && tiers[i].rank) m.set(tiers[i].rank, tiers[i]);
      }
      _snorlaxTierMapCache.set(tiers, m);
    }
    return m;
  }

  let _labNatureMapCache = null;
  let _labNatureMapLen = -1;
  function _getLabNature(name) {
    if (!name || !Array.isArray(NATURE_DATA)) return null;
    if (!_labNatureMapCache || _labNatureMapLen !== NATURE_DATA.length) {
      _labNatureMapCache = new Map();
      for (let i = 0; i < NATURE_DATA.length; i++) {
        if (NATURE_DATA[i]) _labNatureMapCache.set(NATURE_DATA[i].name, NATURE_DATA[i]);
      }
      _labNatureMapLen = NATURE_DATA.length;
    }
    return _labNatureMapCache.get(name) || null;
  }

  function calculateProjectedSnorlaxRank(weeklyEnergy, islandId) {
    if (typeof weeklyEnergy !== 'number' || isNaN(weeklyEnergy) || !isFinite(weeklyEnergy) || weeklyEnergy <= 0) {
      return window.I18N?.t?.('lab.t_rank_basic', { n: 1 }) ?? 'lab.t_rank_basic';
    }
    const key = (islandId || 'greengrass').toLowerCase();
    const tiers = ISLAND_SNORLAX_THRESHOLDS[key] || ISLAND_SNORLAX_THRESHOLDS.greengrass;
    const tierMap = _getSnorlaxTierMap(tiers);
    const m1 = tierMap.get('Master 1') || { energy: 187832 };
    const m5 = tierMap.get('Master 5') || { energy: 321146 };
    const m10 = tierMap.get('Master 10') || { energy: 532707 };
    const m15 = tierMap.get('Master 15') || { energy: 1199506 };
    const m20 = tierMap.get('Master 20') || { energy: 3245795 };

    if (weeklyEnergy >= m20.energy) {
      return window.I18N?.t?.('lab.t_rank_master', { n: 20 }) ?? 'lab.t_rank_master';
    }
    if (weeklyEnergy >= m15.energy) {
      const step = (m20.energy - m15.energy) / 5;
      const rankNum = Math.max(15, Math.min(20, 15 + Math.floor((weeklyEnergy - m15.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_master', { n: rankNum }) ?? 'lab.t_rank_master';
    }
    if (weeklyEnergy >= m10.energy) {
      const step = (m15.energy - m10.energy) / 5;
      const rankNum = Math.max(10, Math.min(15, 10 + Math.floor((weeklyEnergy - m10.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_master', { n: rankNum }) ?? 'lab.t_rank_master';
    }
    if (weeklyEnergy >= m5.energy) {
      const step = (m10.energy - m5.energy) / 5;
      const rankNum = Math.max(5, Math.min(10, 5 + Math.floor((weeklyEnergy - m5.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_master', { n: rankNum }) ?? 'lab.t_rank_master';
    }
    if (weeklyEnergy >= m1.energy) {
      const step = (m5.energy - m1.energy) / 4;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - m1.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_master', { n: rankNum }) ?? 'lab.t_rank_master';
    }
    const u1 = tierMap.get('Ultra 1') || { energy: 79197 };
    if (weeklyEnergy >= u1.energy) {
      const step = (m1.energy - u1.energy) / 5;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - u1.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_ultra', { n: rankNum }) ?? 'lab.t_rank_ultra';
    }
    const g1 = tierMap.get('Great 1') || { energy: 23385 };
    if (weeklyEnergy >= g1.energy) {
      const step = (u1.energy - g1.energy) / 5;
      const rankNum = Math.max(1, Math.min(5, 1 + Math.floor((weeklyEnergy - g1.energy) / Math.max(1, step))));
      return window.I18N?.t?.('lab.t_rank_great', { n: rankNum }) ?? 'lab.t_rank_great';
    }
    const b1 = tierMap.get('Basic 1') || { energy: 0 };
    const step = (g1.energy - b1.energy) / 5;
    const rankNum = Math.max(1, Math.min(5, 1 + Math.floor(weeklyEnergy / Math.max(1, step))));
    return window.I18N?.t?.('lab.t_rank_basic', { n: rankNum }) ?? 'lab.t_rank_basic';
  }

  /* ─── 幫手隊伍效益模擬器 (Team Synergy & Output Simulator) ─────────────── */
  function simulateTeamPerformance(teamPokemonItems, islandId, targetRecipeArg, potSize, options) {
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
        projectedSundayRank: window.I18N?.t?.('lab.t_rank_basic', { n: 1 }) ?? 'lab.t_rank_basic',
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
      const nat = isMint ? null : _getLabNature(nature);
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
