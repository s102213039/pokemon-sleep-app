  const _FALLBACK_LAB_ENGINE_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  function _getLabEngineCaps() {
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    return (gc && typeof gc.getCaps === 'function') ? gc.getCaps() : _FALLBACK_LAB_ENGINE_CAPS;
  }

  /* ─── 核心評估演算法 (單一維度/等級計算核心) ──────────── */
  function evaluateSingle(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, isPotential, cleanseMint) {
    if (!pkmData) return null;
    natureName = natureName || '坦率';
    subskills = subskills || [];
    const ingArr = (Array.isArray(ingredients) ? ingredients : []).map(normalizeIngName).filter(Boolean);
    ingredients = ingArr;
    ribbonLevel = parseInt(ribbonLevel, 10) || 0;
    skillLevel = parseInt(skillLevel, 10) || 1;

    // 若為畢業潛力 (isPotential)，統一以 Lv.100 全解鎖規格計算
    if (isPotential) {
      currentLv = 100;
    } else {
      currentLv = parseInt(currentLv, 10) || 30;
    }

    const specialty = pkmData.specialty || '樹果';
    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    
    // 計算已解鎖副技能 (官方最新解鎖門檻: Lv.10, 25, 50, 70, 80)
    const slotLevels = [10, 25, 50, 70, 80];
    const unlockedSlotLimit = isPotential ? 5 : slotLevels.filter(lvl => currentLv >= lvl).length;
    const activeSubskills = [];
    subskillArr.forEach(function(s, idx) {
      if (s && (isPotential || currentLv >= (slotLevels[idx] || 10))) {
        activeSubskills.push(s);
      }
    });

    // 性格修正
    const fallbackNatureDict = {
      // 幫忙速度▲
      '固執': { buffType: 'speed', debuffType: 'ingredient' },
      'Adamant': { buffType: 'speed', debuffType: 'ingredient' },
      '勇敢': { buffType: 'speed', debuffType: 'exp' },
      'Brave': { buffType: 'speed', debuffType: 'exp' },
      '怕寂寞': { buffType: 'speed', debuffType: 'energy' },
      'Lonely': { buffType: 'speed', debuffType: 'energy' },
      '頑皮': { buffType: 'speed', debuffType: 'skill' },
      'Naughty': { buffType: 'speed', debuffType: 'skill' },
      // 食材機率▲
      '內斂': { buffType: 'ingredient', debuffType: 'speed' },
      'Modest': { buffType: 'ingredient', debuffType: 'speed' },
      '冷靜': { buffType: 'ingredient', debuffType: 'exp' },
      'Quiet': { buffType: 'ingredient', debuffType: 'exp' },
      '慢吞吞': { buffType: 'ingredient', debuffType: 'energy' },
      'Mild': { buffType: 'ingredient', debuffType: 'energy' },
      '馬虎': { buffType: 'ingredient', debuffType: 'skill' },
      'Rash': { buffType: 'ingredient', debuffType: 'skill' },
      // 主技能發動機率▲
      '溫和': { buffType: 'skill', debuffType: 'speed' },
      'Calm': { buffType: 'skill', debuffType: 'speed' },
      '慎重': { buffType: 'skill', debuffType: 'ingredient' },
      'Careful': { buffType: 'skill', debuffType: 'ingredient' },
      '自大': { buffType: 'skill', debuffType: 'exp' },
      'Sassy': { buffType: 'skill', debuffType: 'exp' },
      '溫順': { buffType: 'skill', debuffType: 'energy' },
      'Gentle': { buffType: 'skill', debuffType: 'energy' },
      // 活力回復量▲
      '大膽': { buffType: 'energy', debuffType: 'speed' },
      'Bold': { buffType: 'energy', debuffType: 'speed' },
      '淘氣': { buffType: 'energy', debuffType: 'ingredient' },
      'Impish': { buffType: 'energy', debuffType: 'ingredient' },
      '悠閒': { buffType: 'energy', debuffType: 'exp' },
      'Relaxed': { buffType: 'energy', debuffType: 'exp' },
      '樂天': { buffType: 'energy', debuffType: 'skill' },
      'Lax': { buffType: 'energy', debuffType: 'skill' },
      // EXP獲得量▲
      '膽小': { buffType: 'exp', debuffType: 'speed' },
      'Timid': { buffType: 'exp', debuffType: 'speed' },
      '爽朗': { buffType: 'exp', debuffType: 'ingredient' },
      'Jolly': { buffType: 'exp', debuffType: 'ingredient' },
      '急躁': { buffType: 'exp', debuffType: 'energy' },
      'Hasty': { buffType: 'exp', debuffType: 'energy' },
      '天真': { buffType: 'exp', debuffType: 'skill' },
      'Naive': { buffType: 'exp', debuffType: 'skill' },
      // 無增減
      '坦率': { buffType: 'none', debuffType: 'none' },
      'Hardy': { buffType: 'none', debuffType: 'none' },
      '害羞': { buffType: 'none', debuffType: 'none' },
      'Bashful': { buffType: 'none', debuffType: 'none' },
      '認真': { buffType: 'none', debuffType: 'none' },
      'Docile': { buffType: 'none', debuffType: 'none' },
      '勤奮': { buffType: 'none', debuffType: 'none' },
      'Serious': { buffType: 'none', debuffType: 'none' },
      '浮躁': { buffType: 'none', debuffType: 'none' },
      'Quirky': { buffType: 'none', debuffType: 'none' }
    };
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    let nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) ||
      (window.PokemonApp && window.PokemonApp.NATURE_DICT && window.PokemonApp.NATURE_DICT[natureName]) ||
      fallbackNatureDict[natureName] || { buffType: 'none', debuffType: 'none' };
    if (isMint) {
      nature = { buffType: 'none', debuffType: 'none' };
    }
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    const isBerryBurst = isBerryBurstSkillSpecialist(pkmData);
    const isHealer = isHealerSkillSpecialist(pkmData);
    const isHelper = isHelperBoostSkillSpecialist(pkmData);
    const isCharge = isChargeStrengthSkillSpecialist(pkmData);
    const isPotExpander = isPotExpanderSkillSpecialist(pkmData);
    const isExtraTasty = isExtraTastySkillSpecialist(pkmData);
    const isDreamShard = isDreamShardSkillSpecialist(pkmData);
    const isIngSkill = isIngredientSkillSpecialist(pkmData);
    const isMetronome = isMetronomeSkillSpecialist(pkmData);
    const isLegendary = isLegendaryPokemon(pkmData);
    const isSlowpoke = isSlowpokeFamily(pkmData);
    const isSlaking = isSlakingFamily(pkmData);
    const pkmName = pkmData.name_cn || (pkmData.name && pkmData.name.cn) || pkmData.name_en || pkmData.name || '';

    // 1. 樹果產能 (Berry Power)
    let berryScore = (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') ? 40 : 20;
    const hasBFS = activeSubskills.indexOf('樹果數量S') !== -1 || activeSubskills.indexOf('Berry Finding S') !== -1;
    const bfsIdx = Math.max(subskillArr.indexOf('樹果數量S'), subskillArr.indexOf('Berry Finding S'));
    if (hasBFS) {
      if (bfsIdx === 0) berryScore += 36;
      else if (bfsIdx === 1) berryScore += 28;
      else if (bfsIdx === 2) berryScore += 18;
      else berryScore += 10;
    }
    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) berryScore += 10;
    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) berryScore += 10;
    if (activeSubskills.indexOf('幫忙速度S') !== -1 || activeSubskills.indexOf('Helping Speed S') !== -1) berryScore += 5;
    if (nature.buffType === 'speed') {
      berryScore += (natureName === '固執' && (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries')) ? 14 : 8;
    }
    if (nature.debuffType === 'speed') berryScore -= 18;
    if (nature.buffType === 'ingredient' && (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries')) {
      berryScore -= 10; // 稀釋樹果掉落判定
    }
    if (ribbonLevel === 4) berryScore += 6;
    else if (ribbonLevel >= 2) berryScore += 3;
    const berryLvBonus = Math.min(6, Math.floor((currentLv - 1) * 0.08));
    berryScore += berryLvBonus;
    berryScore = Math.min(Math.max(Math.round(berryScore), 15), 100);

    // 2. 食材產能 (Ingredient Power)
    let ingScore = (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') ? 40 : 20;
    const hasIngM = activeSubskills.indexOf('食材機率提升M') !== -1 || activeSubskills.indexOf('Ingredient Finder M') !== -1;
    const ingMIdx = Math.max(subskillArr.indexOf('食材機率提升M'), subskillArr.indexOf('Ingredient Finder M'));
    if (hasIngM) {
      if (ingMIdx === 0) ingScore += 26;
      else if (ingMIdx === 1) ingScore += 20;
      else if (ingMIdx === 2) ingScore += 14;
      else ingScore += 8;
    }
    if (activeSubskills.indexOf('食材機率提升S') !== -1 || activeSubskills.indexOf('Ingredient Finder S') !== -1) ingScore += 12;
    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) ingScore += 8;
    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) ingScore += 8;

    // 持有上限提升 (Carry Limit)
    if (activeSubskills.indexOf('持有上限提升L') !== -1 || activeSubskills.indexOf('Inventory Up L') !== -1) ingScore += 18;
    else if (activeSubskills.indexOf('持有上限提升M') !== -1 || activeSubskills.indexOf('Inventory Up M') !== -1) ingScore += 12;
    else if (activeSubskills.indexOf('持有上限提升S') !== -1 || activeSubskills.indexOf('Inventory Up S') !== -1) ingScore += 6;

    if (ribbonLevel === 4) ingScore += 10;
    else if (ribbonLevel === 3) ingScore += 7;
    else if (ribbonLevel === 2) ingScore += 4;
    else if (ribbonLevel === 1) ingScore += 2;

    if (nature.buffType === 'ingredient') ingScore += 16;
    if (nature.debuffType === 'ingredient') ingScore -= 25; // 致命負面

    if (currentLv >= 60) ingScore += 8;
    else if (currentLv >= 30) ingScore += 4;
    else ingScore -= 6;

    let isABCCombination = false;
    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (ingredients.length >= 3 && currentLv >= 60) {
        const i0 = ingredients[0], i1 = ingredients[1], i2 = ingredients[2];
        if (i0 && i1 && i2) {
          if (i0 === i1 && i1 === i2) {
            ingScore += 18; // AAA 極品純色
          } else if (i0 !== i1 && i1 === i2) {
            ingScore += 12; // ABB 強勢雙色量產
          } else if (i0 === i1 && i1 !== i2) {
            ingScore += 4;  // AAB
          } else if (i0 !== i1 && i1 !== i2 && i0 !== i2) {
            ingScore -= 12; // ABC 三色雜菜
            isABCCombination = true;
          }
        }
      } else if (ingredients.length >= 2 && currentLv >= 30) {
        const i0 = ingredients[0], i1 = ingredients[1];
        if (i0 && i1) {
          if (i0 === i1) ingScore += 10; // AA 純色
          else ingScore += 4;           // AB
        }
      }

      // 食材型帶 BFS 但無持有上限提升：易滿包阻斷產料
      const hasCarryBuff = activeSubskills.some(s => s.includes('持有上限') || s.includes('Inventory Up'));
      if (hasBFS && !hasCarryBuff) {
        ingScore -= 6;
      }
    }
    ingScore = Math.min(Math.max(Math.round(ingScore), 15), 100);

    // 3. 技能強度 (Skill Power)
    let skillScore = (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') ? 40 : 20;
    const hasSkillM = activeSubskills.indexOf('技能機率提升M') !== -1 || activeSubskills.indexOf('Skill Trigger M') !== -1;
    const skillMIdx = Math.max(subskillArr.indexOf('技能機率提升M'), subskillArr.indexOf('Skill Trigger M'));
    if (hasSkillM) {
      if (skillMIdx === 0) skillScore += 26;
      else if (skillMIdx === 1) skillScore += 20;
      else if (skillMIdx === 2) skillScore += 14;
      else skillScore += 8;
    }
    const hasSkillS = activeSubskills.indexOf('技能機率提升S') !== -1 || activeSubskills.indexOf('Skill Trigger S') !== -1;
    if (hasSkillS) skillScore += 14;
    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) skillScore += 8;
    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) skillScore += 8;

    if (nature.buffType === 'skill') skillScore += 16;
    if (nature.debuffType === 'skill') skillScore -= 25; // 致命減技

    if (skillLevel > 1) {
      skillScore += Math.min(20, Math.round((skillLevel - 1) * 3.5));
    }
    if (ribbonLevel === 4) skillScore += 8;
    else if (ribbonLevel >= 2) skillScore += 4;

    if (activeSubskills.indexOf('持有上限提升L') !== -1 || activeSubskills.indexOf('Inventory Up L') !== -1) skillScore += 10;
    else if (activeSubskills.indexOf('持有上限提升M') !== -1 || activeSubskills.indexOf('Inventory Up M') !== -1) skillScore += 6;
    else if (activeSubskills.indexOf('持有上限提升S') !== -1 || activeSubskills.indexOf('Inventory Up S') !== -1) skillScore += 3;

    // 補師嚴審：減技能或無任何技能加成者嚴懲
    if (isHealer) {
      if (nature.debuffType === 'skill') skillScore = Math.min(35, skillScore);
      else if (!hasSkillM && !hasSkillS && nature.buffType !== 'skill') {
        skillScore = Math.min(50, skillScore);
      }
    }
    skillScore = Math.min(Math.max(Math.round(skillScore), 15), 100);

    // 4. 幫忙速度 (Speed Power)
    let speedScore = 50;
    let calculatedInterval = 0;
    if (pkmData.interval) {
      const parts = pkmData.interval.split(':');
      const totalSec = (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2] || 0);
      calculatedInterval = totalSec;
      if (totalSec < 2400) speedScore += 15;
      else if (totalSec < 3000) speedScore += 8;
      else if (totalSec > 3800) speedScore -= 8;
    }
    const speedFromLv = Math.round(((currentLv - 1) * 0.002) * 50);
    speedScore += speedFromLv;

    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) speedScore += 18;
    if (activeSubskills.indexOf('幫忙速度S') !== -1 || activeSubskills.indexOf('Helping Speed S') !== -1) speedScore += 8;
    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) speedScore += 12;
    if (nature.buffType === 'speed') speedScore += 12;
    if (nature.debuffType === 'speed') speedScore -= 14;

    const remainingEvos = getRemainingEvolutions(pkmData);
    const ribbonBonus = getRibbonBonus(ribbonLevel, remainingEvos);
    if (ribbonBonus.speedDiscount > 0) {
      speedScore += Math.round(ribbonBonus.speedDiscount * 90);
      if (calculatedInterval > 0) {
        calculatedInterval = Math.round(calculatedInterval * (1 - ribbonBonus.speedDiscount));
      }
    }
    speedScore = Math.min(Math.max(Math.round(speedScore), 15), 100);

    // 5. 後期成長 (Late-game Growth)
    let growthScore = 48;
    subskillArr.forEach(function(s, idx) {
      if (!s || idx < 2) return;
      const isUnlocked = isPotential || currentLv >= (slotLevels[idx] || 50);
      if (isUnlocked) {
        if (['樹果數量S', '幫手獎勵', '幫忙速度M', '食材機率提升M', '技能機率提升M', 'Berry Finding S', 'Helping Bonus', 'Helping Speed M', 'Ingredient Finder M', 'Skill Trigger M'].indexOf(s) !== -1) {
          growthScore += 14;
        } else if (['技能機率提升S', '食材機率提升S', '幫忙速度S', '持有上限提升L', 'Skill Trigger S', 'Ingredient Finder S', 'Helping Speed S', 'Inventory Up L'].indexOf(s) !== -1) {
          growthScore += 10;
        } else if (['持有上限提升M', 'Inventory Up M'].indexOf(s) !== -1) {
          growthScore += 6;
        } else if (['持有上限提升S', 'Inventory Up S'].indexOf(s) !== -1) {
          growthScore += 3;
        } else if (['睡眠EXP獎勵', '技能等級提升M', '技能等級提升S', '夢之碎片獎勵', '研究EXP獎勵'].indexOf(s) !== -1) {
          growthScore += 2;
        }
      }
    });
    if (currentLv >= 60) growthScore += 10;
    else if (currentLv >= 50) growthScore += 5;
    if (ribbonLevel === 4) growthScore += 6;
    else if (ribbonLevel >= 2) growthScore += 3;
    if (nature.buffType === 'exp') growthScore += 6;
    if (nature.debuffType === 'exp') growthScore -= 4;
    growthScore = Math.min(Math.max(Math.round(growthScore), 15), 100);

    // 6. 資源效益 (Resource Efficiency & ROI)
    let roiScore = 40;
    subskillArr.forEach(function(s, idx) {
      if (!s || idx >= 2) return;
      const isUnlocked = isPotential || currentLv >= (slotLevels[idx] || 10);
      if (isUnlocked) {
        if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
          if (s === '樹果數量S' || s === 'Berry Finding S') roiScore += 24;
          if (s === '持有上限提升L' || s === 'Inventory Up L') roiScore += 6;
          else if (s === '持有上限提升M' || s === 'Inventory Up M') roiScore += 4;
        }
        if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
          if (s === '食材機率提升M' || s === 'Ingredient Finder M') roiScore += 22;
          if (s === '食材機率提升S' || s === 'Ingredient Finder S') roiScore += 12;
          if (s === '持有上限提升L' || s === 'Inventory Up L') roiScore += 14;
          else if (s === '持有上限提升M' || s === 'Inventory Up M') roiScore += 9;
          else if (s === '持有上限提升S' || s === 'Inventory Up S') roiScore += 5;
        }
        if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
          if (s === '技能機率提升M' || s === 'Skill Trigger M') roiScore += 22;
          if (s === '技能機率提升S' || s === 'Skill Trigger S') roiScore += 14;
          if (s === '持有上限提升L' || s === 'Inventory Up L') roiScore += 8;
        }
        if (s === '幫手獎勵' || s === 'Helping Bonus' || s === '幫忙速度M' || s === 'Helping Speed M') roiScore += 12;
        if (s === '幫忙速度S' || s === 'Helping Speed S') roiScore += 6;
      }
    });
    if (currentLv >= 30) roiScore += 6;
    if (currentLv >= 50) roiScore += 6;
    if (ribbonLevel === 4) roiScore += 6;
    else if (ribbonLevel >= 2) roiScore += 3;
    if (nature.buffType === 'exp') roiScore += 8;
    if (nature.debuffType === 'exp' && specialty !== '食材' && specialty !== 'Ingredients' && specialty.indexOf('食材') === -1) roiScore -= 8;
    if (specialty === '食材' || specialty === 'Ingredients' || specialty.indexOf('食材') !== -1) {
      if (nature.buffType === 'ingredient') roiScore += 10;
    }
    roiScore = Math.min(Math.max(Math.round(roiScore), 15), 100);

    // ─── 綜合加權評分 (Specialty-Weighted Composite Score) ─────────────
    let compositeScore = 0;
    const isHybridBfsCandidate = (isBerryBurst || isCharge || isSlaking) && hasBFS;

    if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      compositeScore = (berryScore * 0.50) + (speedScore * 0.24) + (roiScore * 0.14) + (growthScore * 0.12);
    } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      compositeScore = (ingScore * 0.50) + (speedScore * 0.24) + (roiScore * 0.14) + (growthScore * 0.12);
    } else {
      if (isBerryBurst && hasBFS) {
        // 樹果遽增型持有 BFS：主技能直接爆發樹果，一般幫忙亦產出+1樹果，雙輪極限產能
        compositeScore = (berryScore * 0.40) + (skillScore * 0.35) + (speedScore * 0.15) + (roiScore * 0.10);
      } else if (isHybridBfsCandidate) {
        // 充能直傷型 BFS 雙修產能補償：以樹果高額副輸出補足總能量期望
        compositeScore = (skillScore * 0.34) + (berryScore * 0.32) + (speedScore * 0.20) + (roiScore * 0.14);
      } else {
        compositeScore = (skillScore * 0.50) + (speedScore * 0.24) + (roiScore * 0.14) + (growthScore * 0.12);
      }
    }

    // 持有上限綜效加成 (Carry Limit Synergy)
    let carrySynergy = 0;
    const hasCarryL = activeSubskills.some(s => s === '持有上限提升L' || s === 'Inventory Up L');
    const hasCarryM = activeSubskills.some(s => s === '持有上限提升M' || s === 'Inventory Up M');
    const hasCarryS = activeSubskills.some(s => s === '持有上限提升S' || s === 'Inventory Up S');

    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (hasCarryL) carrySynergy = 3.0;
      else if (hasCarryM) carrySynergy = 2.0;
      else if (hasCarryS) carrySynergy = 1.0;
    } else if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
      if (hasCarryL) carrySynergy = 2.0;
      else if (hasCarryM) carrySynergy = 1.2;
      else if (hasCarryS) carrySynergy = 0.6;
    }
    compositeScore += carrySynergy;

    // 專長契合與天花板綜效 (Specialty Synergy & Ceiling Bonuses)
    let specialtySynergy = 0;
    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (nature.buffType === 'ingredient') specialtySynergy += 2.0;
      if (hasIngM) specialtySynergy += 2.0;
      if (ingredients.length >= 3 && currentLv >= 60 && ingredients[0] === ingredients[1] && ingredients[1] === ingredients[2]) specialtySynergy += 1.5;
      else if (ingredients.length >= 2 && currentLv >= 30 && ingredients[0] === ingredients[1]) specialtySynergy += 1.0;
      if (ribbonLevel === 4) specialtySynergy += 1.0;
      else if (ribbonLevel >= 2) specialtySynergy += 0.5;
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      if (hasBFS) specialtySynergy += 3.0;
      if (nature.buffType === 'speed') specialtySynergy += 2.0;
      if (hasBFS && (activeSubskills.some(s => s.includes('幫忙速度') || s.includes('幫手獎勵')))) specialtySynergy += 2.0;
      if (ribbonLevel === 4) specialtySynergy += 1.0;
      else if (ribbonLevel >= 2) specialtySynergy += 0.5;
    } else {
      if (hasSkillM) specialtySynergy += 3.0;
      if (nature.buffType === 'skill') specialtySynergy += 2.0;
      if (isBerryBurst && hasBFS) specialtySynergy += 5.0; // 樹果遽增極致契合
      else if (isHybridBfsCandidate) specialtySynergy += 4.5; // 雙修突破加分
      if (ribbonLevel === 4) specialtySynergy += 1.0;
      else if (ribbonLevel >= 2) specialtySynergy += 0.5;
    }
    compositeScore += specialtySynergy;

    // 專長精通基準加成 (Specialty Mastery)
    let specialtyMasteryBonus = 0;
    const hasCoreIng = activeSubskills.some(s => ['食材機率提升M', '食材機率提升S', 'Ingredient Finder M', 'Ingredient Finder S', '持有上限提升L', '持有上限提升M', '持有上限提升S', 'Inventory Up L', 'Inventory Up M', 'Inventory Up S', '幫手獎勵', 'Helping Bonus'].indexOf(s) !== -1);
    const hasCoreBerry = activeSubskills.some(s => ['樹果數量S', 'Berry Finding S', '幫忙速度M', '幫忙速度S', 'Helping Speed M', 'Helping Speed S', '幫手獎勵', 'Helping Bonus'].indexOf(s) !== -1);
    const hasCoreSkill = activeSubskills.some(s => ['技能機率提升M', '技能機率提升S', 'Skill Trigger M', 'Skill Trigger S', '幫手獎勵', 'Helping Bonus'].indexOf(s) !== -1);

    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (hasCoreIng && ingScore >= 95) specialtyMasteryBonus = activeSubskills.length >= 3 ? 6 : (activeSubskills.length >= 1 ? 5 : 2);
      else if (hasCoreIng && ingScore >= 85) specialtyMasteryBonus = activeSubskills.length >= 2 ? 4 : (activeSubskills.length >= 1 ? 3 : 2);
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      if (hasCoreBerry && berryScore >= 95) specialtyMasteryBonus = activeSubskills.length >= 3 ? 6 : (activeSubskills.length >= 1 ? 5 : 2);
      else if (hasCoreBerry && berryScore >= 85) specialtyMasteryBonus = activeSubskills.length >= 2 ? 4 : (activeSubskills.length >= 1 ? 3 : 2);
    } else {
      if (hasCoreSkill && skillScore >= 95) specialtyMasteryBonus = activeSubskills.length >= 3 ? 6 : (activeSubskills.length >= 1 ? 5 : 2);
      else if (hasCoreSkill && skillScore >= 85) specialtyMasteryBonus = activeSubskills.length >= 2 ? 4 : (activeSubskills.length >= 1 ? 3 : 2);
    }
    compositeScore += specialtyMasteryBonus;

    // 階段相對評分制加成 (Stage-Relative Scoring Bonus for Early Stage Powerhouses Lv.10~24)
    let stageMasteryBonus = 0;
    if (!isPotential && unlockedSlotLimit === 1) {
      if ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') && (hasBFS || activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1)) {
        stageMasteryBonus = 8.0;
      } else if ((specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') && hasCoreIng) {
        stageMasteryBonus = 8.0;
      } else if ((specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') && (hasCoreSkill || isHybridBfsCandidate)) {
        stageMasteryBonus = 8.0;
      }
    }
    compositeScore += stageMasteryBonus;

    // 幫手獎勵全隊頂級戰略加成
    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) {
      compositeScore += 3.5;
    }

    // 主技能等級實質效益加成
    let skillLvlBonus = 0;
    if (skillLevel > 1) {
      if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
        skillLvlBonus = (skillLevel - 1) * 1.5;
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        skillLvlBonus = (skillLevel - 1) * 0.8;
      } else {
        skillLvlBonus = (skillLevel - 1) * 0.5;
      }
    }
    compositeScore += skillLvlBonus;

    // 呆呆獸家族 (Slowpoke Family) 尾巴戰略解鎖判定
    if (isSlowpoke) {
      const hasTailLv30 = ingredients.length >= 2 && (ingredients[1] === '美味尾巴' || (ingredients[1] && ingredients[1].includes('尾巴')) || (ingredients[1] && ingredients[1].includes('Tail')));
      if (hasTailLv30) {
        if (currentLv >= 30) {
          compositeScore += 14.0;
          if (nature.buffType === 'exp' || activeSubskills.indexOf('睡眠EXP獎勵') !== -1) {
            compositeScore += 4.0; // 加速解鎖獎勵
          }
        }
      } else {
        compositeScore -= 20.0;
        compositeScore = Math.min(64, compositeScore); // 未出尾巴核心失職
      }
    }

    // ─── 嚴格淘汰門檻與分數截斷 (Strict Disqualifications & Hard Caps) ─
    // 1. 樹果型門檻：無 BFS 原則上封頂 72 (B/C級)；極致幫速特例放寬至 85 (A級)
    if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      if (!hasBFS) {
        const hasHB = activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1;
        const hasSpeedM = activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1;
        const isExtremeSpeed = hasHB && hasSpeedM && (nature.buffType === 'speed');
        if (isExtremeSpeed) {
          compositeScore = Math.min(85, compositeScore);
        } else {
          compositeScore = Math.min(72, compositeScore);
        }
      }
      // 樹果型減幫速致命扣分
      if (nature.debuffType === 'speed') {
        compositeScore = Math.min(64, compositeScore);
      }
    }

    // 2. 食材型門檻：減食材性格直接鎖死於 C/D 級 (<= 62)；ABC 雜菜組合封頂 A 級 (<= 88)
    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (nature.debuffType === 'ingredient') {
        compositeScore = Math.min(62, compositeScore);
      }
      if (isABCCombination) {
        compositeScore = Math.min(88, compositeScore);
      }
    }

    // 3. 技能型門檻：補師減技能性格鎖死 D 級 (<= 58)；補師完全無發動率加成鎖死 C 級 (<= 68)
    if (isHealer) {
      if (nature.debuffType === 'skill') {
        compositeScore = Math.min(58, compositeScore);
      } else if (!hasSkillM && !hasSkillS && nature.buffType !== 'skill') {
        compositeScore = Math.min(68, compositeScore);
      }
    }

    // 4. 無副技能嚴格防溢上限：副技能清空狀態或未解鎖副技能狀態下絕對不可評為 S / SS / SSS / A
    if (activeSubskills.length === 0 || unlockedSlotLimit === 0) {
      compositeScore = Math.min(62, compositeScore);
    }

    compositeScore = Math.min(100, Math.max(15, Math.round(compositeScore)));

    // 評級判定 (7 級制: SSS, SS, S, A, B, C, D)
    let grade = 'B';
    let gradeTitle = window.I18N?.t?.('lab.c_grade_b_plain') ?? 'Solid Choice';
    let gradeColor = '#10b981';
    if (compositeScore >= 98) {
      grade = 'SSS';
      gradeTitle = window.I18N?.t?.('lab.c_grade_sss') ?? 'Apex God';
      gradeColor = '#f43f5e';
    } else if (compositeScore >= 95) {
      grade = 'SS';
      gradeTitle = window.I18N?.t?.('lab.c_grade_ss') ?? 'Mythic Tier';
      gradeColor = '#8b5cf6';
    } else if (compositeScore >= 90) {
      grade = 'S';
      gradeTitle = window.I18N?.t?.('lab.c_grade_s') ?? 'Top Tier';
      gradeColor = '#f59e0b';
    } else if (compositeScore >= 80) {
      grade = 'A';
      gradeTitle = window.I18N?.t?.('lab.c_grade_a') ?? 'Strong Pick';
      gradeColor = '#3b82f6';
    } else if (compositeScore >= 70) {
      grade = 'B';
      gradeTitle = window.I18N?.t?.('lab.c_grade_b') ?? '[✓] Solid Choice';
      gradeColor = '#10b981';
    } else if (compositeScore >= 60) {
      grade = 'C';
      gradeTitle = window.I18N?.t?.('lab.c_grade_c') ?? '[~] Usable';
      gradeColor = '#64748b';
    } else {
      grade = 'D';
      gradeTitle = window.I18N?.t?.('lab.c_grade_d') ?? '[-] Recycle';
      gradeColor = '#ef4444';
    }

    // 深度優點與缺點分析 (Pros & Cons)
    const pros = [];
    const cons = [];

    const hasBFSInTotal = activeSubskills.indexOf('樹果數量S') !== -1 || activeSubskills.indexOf('Berry Finding S') !== -1;

    if (hasBFSInTotal) {
      if (isBerryBurst) {
        pros.push(window.I18N?.t?.('lab.c_pro_bfs_berry_burst') ?? 'lab.c_pro_bfs_berry_burst');
      } else if (isHelper) {
        cons.push(window.I18N?.t?.('lab.c_con_bfs_helper_boost') ?? 'lab.c_con_bfs_helper_boost');
      } else if (isHealer) {
        cons.push(window.I18N?.t?.('lab.c_con_bfs_healer') ?? 'lab.c_con_bfs_healer');
      } else if (isCharge || isSlaking) {
        pros.push(window.I18N?.t?.('lab.c_pro_bfs_charge_slaking') ?? 'lab.c_pro_bfs_charge_slaking');
      } else if (isExtraTasty || isPotExpander || isDreamShard || pkmName.includes('咚咚鼠') || pkmName.includes('Dedenne') || pkmName.includes('磁怪') || pkmName.includes('Magne') || pkmName.includes('喵喵') || pkmName.includes('Meowth')) {
        cons.push(window.I18N?.t?.('lab.c_con_bfs_tactical_skill') ?? 'lab.c_con_bfs_tactical_skill');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        const hasCarryBuff = activeSubskills.some(s => s.includes('持有上限') || s.includes('Inventory Up'));
        if (hasCarryBuff) {
          pros.push(window.I18N?.t?.('lab.c_pro_bfs_ing_with_carry') ?? 'lab.c_pro_bfs_ing_with_carry');
        } else {
          cons.push(window.I18N?.t?.('lab.c_con_bfs_ing_no_carry') ?? 'lab.c_con_bfs_ing_no_carry');
        }
      } else {
        pros.push(window.I18N?.t?.('lab.c_pro_bfs_generic') ?? 'lab.c_pro_bfs_generic');
      }
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      const hasHB = activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1;
      const hasSpeedM = activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1;
      if (hasHB && hasSpeedM && nature.buffType === 'speed') {
        pros.push(window.I18N?.t?.('lab.c_pro_berry_extreme_speed') ?? 'lab.c_pro_berry_extreme_speed');
      } else {
        cons.push(window.I18N?.t?.('lab.c_con_berry_no_bfs') ?? 'lab.c_con_berry_no_bfs');
      }
    }

    if (isSlowpoke) {
      const hasTailLv30 = ingredients.length >= 2 && (ingredients[1] === '美味尾巴' || (ingredients[1] && ingredients[1].includes('尾巴')) || (ingredients[1] && ingredients[1].includes('Tail')));
      if (hasTailLv30) {
        pros.push(window.I18N?.t?.('lab.c_pro_slowpoke_tail') ?? 'lab.c_pro_slowpoke_tail');
      } else {
        cons.push(window.I18N?.t?.('lab.c_con_slowpoke_no_tail') ?? 'lab.c_con_slowpoke_no_tail');
      }
    }

    if (isHealer) {
      if (nature.debuffType === 'skill') {
        cons.push(window.I18N?.t?.('lab.c_con_healer_skill_down') ?? 'lab.c_con_healer_skill_down');
      } else if (!hasSkillM && !hasSkillS && nature.buffType !== 'skill') {
        cons.push(window.I18N?.t?.('lab.c_con_healer_no_trigger') ?? 'lab.c_con_healer_no_trigger');
      }
    }

    const hasIngMInTotal = activeSubskills.indexOf('食材機率提升M') !== -1 || activeSubskills.indexOf('Ingredient Finder M') !== -1;
    if (hasIngMInTotal && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(window.I18N?.t?.('lab.c_pro_ing_m') ?? 'lab.c_pro_ing_m');
    }

    const hasSkillMInTotal = activeSubskills.indexOf('技能機率提升M') !== -1 || activeSubskills.indexOf('Skill Trigger M') !== -1;
    if (hasSkillMInTotal) {
      if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
        pros.push(window.I18N?.t?.('lab.c_pro_skill_m_spec') ?? 'lab.c_pro_skill_m_spec');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        if (pkmData.main_skill && (pkmData.main_skill.includes('食材') || pkmData.main_skill.includes('Ingredient') || pkmData.main_skill.includes('怪力鉗') || pkmData.main_skill.includes('超幸運') || pkmData.main_skill.includes('禮物') || pkmData.main_skill.includes('正電') || pkmData.main_skill.includes('健美'))) {
          pros.push(window.I18N?.t?.('lab.c_pro_skill_m_ing') ?? 'lab.c_pro_skill_m_ing');
        }
      }
    }

    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) {
      pros.push(window.I18N?.t?.('lab.c_pro_helping_bonus') ?? 'lab.c_pro_helping_bonus');
    }

    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) {
      pros.push(window.I18N?.t?.('lab.c_pro_helping_speed_m') ?? 'lab.c_pro_helping_speed_m');
    }

    if (skillLevel >= 6 && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(window.I18N?.t?.('lab.c_pro_high_skill_lv', { lv: skillLevel }) ?? 'lab.c_pro_high_skill_lv');
    }

    if (nature.buffType === 'speed') {
      if ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') && natureName === '固執') {
        pros.push(window.I18N?.t?.('lab.c_pro_adamant_berry') ?? 'lab.c_pro_adamant_berry');
      } else {
        pros.push(window.I18N?.t?.('lab.c_pro_nature_speed_up', { nature: natDisplayName }) ?? 'lab.c_pro_nature_speed_up');
      }
    } else if (nature.debuffType === 'speed') {
      cons.push(window.I18N?.t?.('lab.c_con_nature_speed_down', { nature: natDisplayName }) ?? 'lab.c_con_nature_speed_down');
    }

    if (nature.buffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(window.I18N?.t?.('lab.c_pro_nature_ing_up', { nature: natDisplayName }) ?? 'lab.c_pro_nature_ing_up');
    } else if (nature.debuffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      cons.push(window.I18N?.t?.('lab.c_con_nature_ing_down', { nature: natDisplayName }) ?? 'lab.c_con_nature_ing_down');
    }

    if (nature.buffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(window.I18N?.t?.('lab.c_pro_nature_skill_up', { nature: natDisplayName }) ?? 'lab.c_pro_nature_skill_up');
    } else if (nature.debuffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      cons.push(window.I18N?.t?.('lab.c_con_nature_skill_down', { nature: natDisplayName }) ?? 'lab.c_con_nature_skill_down');
    }

    if (isMint) {
      pros.push(window.I18N?.t?.('lab.c_pro_cleanse_mint', { nature: natDisplayName }) ?? 'lab.c_pro_cleanse_mint');
    }

    if (ribbonBonus.level > 0) {
      const carryText = `+${ribbonBonus.carry}`;
      if (ribbonBonus.speedDiscount > 0) {
        const pctText = `${Math.round(ribbonBonus.speedDiscount * 100)}%`;
        pros.push(window.I18N?.t?.('lab.c_pro_ribbon_speed', { lv: ribbonBonus.level, pct: pctText, carry: carryText }) ?? 'lab.c_pro_ribbon_speed');
      } else {
        const ribbonKey = remainingEvos === 0 ? 'lab.c_pro_ribbon_carry_final' : 'lab.c_pro_ribbon_carry';
        pros.push(window.I18N?.t?.(ribbonKey, { lv: ribbonBonus.level, carry: carryText }) ?? ribbonKey);
      }
    }

    // 食材組合深度診斷 (AAA, ABB, ABC)
    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (ingredients.length >= 3 && currentLv >= 60) {
        const i0 = ingredients[0], i1 = ingredients[1], i2 = ingredients[2];
        if (i0 && i1 && i2) {
          if (i0 === i1 && i1 === i2) {
            pros.push(window.I18N?.t?.('lab.c_pro_ing_aaa') ?? 'lab.c_pro_ing_aaa');
          } else if (i0 !== i1 && i1 === i2) {
            pros.push(window.I18N?.t?.('lab.c_pro_ing_abb') ?? 'lab.c_pro_ing_abb');
          } else if (i0 !== i1 && i1 !== i2 && i0 !== i2) {
            cons.push(window.I18N?.t?.('lab.c_con_ing_abc') ?? 'lab.c_con_ing_abc');
          }
        }
      }
    }

    // 持有上限防溢滿診斷
    if (activeSubskills.indexOf('持有上限提升L') !== -1 || activeSubskills.indexOf('持有上限提升M') !== -1) {
      pros.push(window.I18N?.t?.('lab.c_pro_inventory_up') ?? 'lab.c_pro_inventory_up');
    }

    // 樹果遽增型特殊診斷 (未帶 BFS 時)
    if (isBerryBurst && !hasBFSInTotal) {
      pros.push(window.I18N?.t?.('lab.c_pro_berry_burst_no_bfs') ?? 'lab.c_pro_berry_burst_no_bfs');
    }

    // 充能直傷型特殊診斷 (未帶 BFS 時)
    if (isCharge && !hasBFSInTotal) {
      pros.push(window.I18N?.t?.('lab.c_pro_charge_no_bfs') ?? 'lab.c_pro_charge_no_bfs');
    }

    // 傳說神獸特殊診斷
    if (isLegendary) {
      pros.push(window.I18N?.t?.('lab.c_pro_legendary') ?? 'lab.c_pro_legendary');
    }

    // 料理大成功 (咚咚鼠)
    if (isExtraTasty) {
      pros.push(window.I18N?.t?.('lab.c_pro_extra_tasty') ?? 'lab.c_pro_extra_tasty');
    }

    // 料理擴鍋 (自爆磁怪)
    if (isPotExpander) {
      pros.push(window.I18N?.t?.('lab.c_pro_pot_expander') ?? 'lab.c_pro_pot_expander');
    }

    // 夢之碎片 (路卡利歐)
    if (isDreamShard) {
      pros.push(window.I18N?.t?.('lab.c_pro_dream_shard') ?? 'lab.c_pro_dream_shard');
    }

    // 食材獲取 (水伊布)
    if (isIngSkill) {
      pros.push(window.I18N?.t?.('lab.c_pro_ing_skill') ?? 'lab.c_pro_ing_skill');
    }

    // 揮指隨機戰術 (波克基斯)
    if (isMetronome) {
      pros.push(window.I18N?.t?.('lab.c_pro_metronome') ?? 'lab.c_pro_metronome');
    }

    if (pros.length === 0) {
      pros.push(window.I18N?.t?.('lab.c_pro_basic_fallback') ?? 'lab.c_pro_basic_fallback');
    }

    // 升級消耗計算
    const caps = _getLabEngineCaps();
    const capLv = caps.POKEMON_LEVEL_CAP || 70;
    const costTo30 = calculateMilestoneCost(currentLv, 30, nature);
    const costTo50 = calculateMilestoneCost(currentLv, 50, nature);
    const costTo60 = calculateMilestoneCost(currentLv, 60, nature);
    const costTo70 = calculateMilestoneCost(currentLv, 70, nature);
    const costTo80 = calculateMilestoneCost(currentLv, 80, nature);
    const costTo100 = calculateMilestoneCost(currentLv, 100, nature);
    const costToCap = calculateMilestoneCost(currentLv, capLv, nature);

    const costsObj = {
      to30: costTo30,
      to50: costTo50,
      to60: costTo60,
      to70: costTo70,
      to80: costTo80,
      to100: costTo100,
      toCap: costToCap
    };
    costsObj['to' + capLv] = costToCap;

    return {
      scores: {
        berry: berryScore,
        ingredient: ingScore,
        skill: skillScore,
        speed: speedScore,
        growth: growthScore,
        roi: roiScore
      },
      calculatedInterval: calculatedInterval,
      ribbonBonus: ribbonBonus,
      remainingEvos: remainingEvos,
      compositeScore: compositeScore,
      grade: grade,
      gradeTitle: gradeTitle,
      gradeColor: gradeColor,
      diagnostics: { pros: pros, cons: cons },
      pros: pros,
      cons: cons,
      costs: costsObj
    };
  }

