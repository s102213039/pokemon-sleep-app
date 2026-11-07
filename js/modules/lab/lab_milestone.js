  /* ─── 升級里程碑質變預測 (Specialty-Aware Milestone Leap Projections) ─── */
  function calculateMilestoneProjections(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval) {
    if (!pkmData || !currentEval) return [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const ingArr = (Array.isArray(ingredients) ? ingredients : []).map(normalizeIngName).filter(Boolean);
    ingredients = ingArr;
    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    const milestones = [];
    const candidateLevels = [25, 30, 50, 70, 80];
    const slotLevels = [10, 25, 50, 70, 80];
    const isSlowpoke = isSlowpokeFamily(pkmData);
    const specialty = pkmData.specialty || '';
    const isBerry = specialty.includes('樹果') || specialty === 'Berries';
    const isIng = specialty.includes('食材') || specialty === 'Ingredients';
    const isSkill = specialty.includes('技能') || specialty === 'Skills';

    candidateLevels.forEach(function(targetLv) {
      if (targetLv <= currentLv) return;

      let targetSkillName = '';
      let isKeyMilestone = false;
      let milestoneType = 'subskill';

      if (targetLv === 30) {
        if (isSlowpoke) {
          const hasTailLv30 = ingArr.length >= 2 && (ingArr[1] === '美味尾巴' || ingArr[1].includes('尾巴') || ingArr[1].toLowerCase().includes('tail'));
          if (hasTailLv30) {
            targetSkillName = isEN ? 'Slowpoke Tail' : '美味尾巴';
            milestoneType = 'ingredient';
            isKeyMilestone = true;
          }
        } else if (isIng && ingArr.length >= 2 && ingArr[1]) {
          targetSkillName = window.I18N ? window.I18N.getIngredientName(ingArr[1]) : ingArr[1];
          milestoneType = 'ingredient';
        }
      }

      const slotIdx = slotLevels.indexOf(targetLv);
      if (slotIdx !== -1 && subskillArr[slotIdx]) {
        const skName = subskillArr[slotIdx];

        // 嚴格依照專長過濾核心副技能，杜絕跨專長亂推薦
        let isSpecialtyCore = false;
        if (isBerry) {
          isSpecialtyCore = ['樹果數量S', '幫手獎勵', '幫忙速度M', 'Berry Finding S', 'Helping Bonus', 'Helping Speed M'].indexOf(skName) !== -1;
        } else if (isIng) {
          isSpecialtyCore = ['食材機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L', '食材機率提升S', '持有上限提升M', 'Ingredient Finder M', 'Helping Bonus', 'Helping Speed M', 'Inventory Up L', 'Ingredient Finder S', 'Inventory Up M'].indexOf(skName) !== -1;
        } else if (isSkill) {
          isSpecialtyCore = ['技能機率提升M', '幫手獎勵', '幫忙速度M', '技能等級提升M', '技能機率提升S', 'Skill Trigger M', 'Helping Bonus', 'Helping Speed M', 'Skill Level Up M', 'Skill Trigger S'].indexOf(skName) !== -1;
        }

        if (isSpecialtyCore) {
          targetSkillName = window.I18N ? window.I18N.getSubSkillName(skName) : skName;
          milestoneType = 'subskill';
          isKeyMilestone = true;
        }
      }

      if (!targetSkillName && !isKeyMilestone) return;

      const projEval = evaluateSingle(pkmData, targetLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false);
      if (!projEval) return;

      const scoreDiff = projEval.compositeScore - currentEval.compositeScore;
      const isGradeLeap = projEval.grade !== currentEval.grade && scoreDiff > 0;
      const isScoreLeap = scoreDiff >= 3;

      if (isGradeLeap || isScoreLeap || (isKeyMilestone && scoreDiff > 0)) {
        const skillDisplay = targetSkillName || (isEN ? `Lv.${targetLv} Unlock` : `Lv.${targetLv} 解鎖`);
        let milestoneText = '';
        if (isGradeLeap) {
          milestoneText = isEN
            ? `Recommended to prioritize Lv.${targetLv} to unlock '${skillDisplay}': rating leaps from ${currentEval.grade} (${currentEval.compositeScore} pts) to ${projEval.grade} (${projEval.compositeScore} pts)!`
            : `建議優先升至 Lv.${targetLv} 解鎖「${skillDisplay}」，評級將由 ${currentEval.grade} 級（${currentEval.compositeScore}分）跨階躍升至 ${projEval.grade} 級（${projEval.compositeScore}分）！`;
        } else {
          milestoneText = isEN
            ? `Recommended to train to Lv.${targetLv} to unlock core '${skillDisplay}': overall score increases from ${currentEval.compositeScore} pts to ${projEval.compositeScore} pts.`
            : `建議培育至 Lv.${targetLv} 解鎖核心「${skillDisplay}」，綜合能力將由 ${currentEval.compositeScore} 分實質提升至 ${projEval.compositeScore} 分。`;
        }

        milestones.push({
          level: targetLv,
          type: milestoneType,
          skill: targetSkillName,
          currentScore: currentEval.compositeScore,
          projectedScore: projEval.compositeScore,
          currentGrade: currentEval.grade,
          projectedGrade: projEval.grade,
          scoreDiff: scoreDiff,
          text: milestoneText
        });
      }
    });

    milestones.sort(function(a, b) {
      return a.level - b.level;
    });
    return milestones;
  }

  /* ─── 頂尖料理精選對照庫與食材掛勾引擎 (Target Recipe Synergy Engine) ─── */
const TARGET_TOP_RECIPES = [
    { name_cn: '特選蘋果咖哩', name_en: 'Fancy Apple Curry', category: '咖哩', pot_size: 7, base_energy: 748, icon: 'https://www.serebii.net/pokemonsleep/meals/fancyapplecurry.png', ingredients: [{ name: '特選蘋果', count: 7 }] },
    { name_cn: '炙燒尾肉咖哩', name_en: 'Grilled Tail Curry', category: '咖哩', pot_size: 33, base_energy: 7483, icon: 'https://www.serebii.net/pokemonsleep/meals/grilledtailcurry.png', ingredients: [{ name: '美味尾巴', count: 8 }, { name: '火辣香草', count: 25 }] },
    { name_cn: '太陽之力番茄咖哩', name_en: 'Solar Power Tomato Curry', category: '咖哩', pot_size: 15, base_energy: 2078, icon: 'https://www.serebii.net/pokemonsleep/meals/solarpowertomatocurry.png', ingredients: [{ name: '好眠番茄', count: 10 }, { name: '火辣香草', count: 5 }] },
    { name_cn: '絕對睡眠奶油咖哩', name_en: 'Dream Eater Butter Curry', category: '咖哩', pot_size: 55, base_energy: 9010, icon: 'https://www.serebii.net/pokemonsleep/meals/dreameaterbuttercurry.png', ingredients: [{ name: '窩心洋芋', count: 18 }, { name: '好眠番茄', count: 15 }, { name: '放鬆可可', count: 12 }, { name: '哞哞鮮奶', count: 10 }] },
    { name_cn: '辣味蔥勁十足咖哩', name_en: 'Spicy Leek Curry', category: '咖哩', pot_size: 32, base_energy: 5900, icon: 'https://www.serebii.net/pokemonsleep/meals/spicyleekcurry.png', ingredients: [{ name: '粗枝大蔥', count: 14 }, { name: '暖暖薑', count: 10 }, { name: '火辣香草', count: 8 }] },
    { name_cn: '蘑菇孢子咖哩', name_en: 'Spore Mushroom Curry', category: '咖哩', pot_size: 23, base_energy: 4162, icon: 'https://www.serebii.net/pokemonsleep/meals/sporemushroomcurry.png', ingredients: [{ name: '品鮮蘑菇', count: 14 }, { name: '窩心洋芋', count: 9 }] },
    { name_cn: '親子愛咖哩', name_en: 'Egg Bomb Curry', category: '咖哩', pot_size: 35, base_energy: 4523, icon: 'https://www.serebii.net/pokemonsleep/meals/eggbombcurry.png', ingredients: [{ name: '甜甜蜜', count: 12 }, { name: '特選蘋果', count: 11 }, { name: '特選蛋', count: 8 }, { name: '窩心洋芋', count: 4 }] },
    { name_cn: '吃飽飽起司肉排咖哩', name_en: 'Hearty Cheeseburger Curry', category: '咖哩', pot_size: 16, base_energy: 1910, icon: 'https://www.serebii.net/pokemonsleep/meals/heartycheeseburgercurry.png', ingredients: [{ name: '哞哞鮮奶', count: 8 }, { name: '豆製肉', count: 8 }] },
    { name_cn: '窩心白醬濃湯', name_en: 'Soft Potato Chowder', category: '咖哩', pot_size: 22, base_energy: 3181, icon: 'https://www.serebii.net/pokemonsleep/meals/softpotatochowder.png', ingredients: [{ name: '哞哞鮮奶', count: 10 }, { name: '窩心洋芋', count: 8 }, { name: '品鮮蘑菇', count: 4 }] },
    { name_cn: '單純白醬濃湯', name_en: 'Simple Chowder', category: '咖哩', pot_size: 7, base_energy: 814, icon: 'https://www.serebii.net/pokemonsleep/meals/simplechowder.png', ingredients: [{ name: '哞哞鮮奶', count: 7 }] },
    { name_cn: '豆製肉排咖哩', name_en: 'Beanburger Curry', category: '咖哩', pot_size: 7, base_energy: 856, icon: 'https://www.serebii.net/pokemonsleep/meals/beanburgercurry.png', ingredients: [{ name: '豆製肉', count: 7 }] },
    { name_cn: '寶寶甜蜜咖哩', name_en: 'Mild Honey Curry', category: '咖哩', pot_size: 7, base_energy: 839, icon: 'https://www.serebii.net/pokemonsleep/meals/mildhoneycurry.png', ingredients: [{ name: '甜甜蜜', count: 7 }] },
    { name_cn: '忍者咖哩', name_en: 'Ninja Curry', category: '咖哩', pot_size: 50, base_energy: 9445, icon: 'https://www.serebii.net/pokemonsleep/meals/ninjacurry.png', ingredients: [{ name: '萌綠大豆', count: 24 }, { name: '豆製肉', count: 9 }, { name: '粗枝大蔥', count: 12 }, { name: '品鮮蘑菇', count: 5 }] },
    { name_cn: '日照炸肉排咖哩', name_en: 'Drought Katsu Curry', category: '咖哩', pot_size: 15, base_energy: 1942, icon: 'https://www.serebii.net/pokemonsleep/meals/droughtkatsucurry.png', ingredients: [{ name: '豆製肉', count: 10 }, { name: '純粹油', count: 5 }] },
    { name_cn: '入口即化蛋捲咖哩', name_en: 'Melty Omelette Curry', category: '咖哩', pot_size: 16, base_energy: 2150, icon: 'https://www.serebii.net/pokemonsleep/meals/meltyomelettecurry.png', ingredients: [{ name: '特選蛋', count: 10 }, { name: '好眠番茄', count: 6 }] },
    { name_cn: '健美豆子咖哩', name_en: 'Bulk Up Bean Curry', category: '咖哩', pot_size: 26, base_energy: 3372, icon: 'https://www.serebii.net/pokemonsleep/meals/bulkupbeancurry.png', ingredients: [{ name: '萌綠大豆', count: 12 }, { name: '豆製肉', count: 6 }, { name: '火辣香草', count: 4 }, { name: '特選蛋', count: 4 }] },
    { name_cn: '柔軟玉米濃湯', name_en: 'Limber Corn Stew', category: '咖哩', pot_size: 30, base_energy: 4670, icon: 'https://www.serebii.net/pokemonsleep/meals/limbercornstew.png', ingredients: [{ name: '萌綠玉米', count: 14 }, { name: '哞哞鮮奶', count: 8 }, { name: '窩心洋芋', count: 8 }] },
    { name_cn: '煉獄玉米乾咖哩', name_en: 'Inferno Corn Keema Curry', category: '咖哩', pot_size: 77, base_energy: 13690, icon: 'https://www.serebii.net/pokemonsleep/meals/infernocornkeemacurry.png', ingredients: [{ name: '火辣香草', count: 27 }, { name: '豆製肉', count: 24 }, { name: '萌綠玉米', count: 14 }, { name: '暖暖薑', count: 12 }] },
    { name_cn: '迷昏拳辣味咖哩', name_en: 'Dizzy Punch Spicy Curry', category: '咖哩', pot_size: 33, base_energy: 5702, icon: 'https://www.serebii.net/pokemonsleep/meals/dizzypunchspicycurry.png', ingredients: [{ name: '醒腦咖啡豆', count: 11 }, { name: '火辣香草', count: 11 }, { name: '甜甜蜜', count: 11 }] },
    { name_cn: '覺醒力量濃湯', name_en: 'Hidden Power Perk-Up Stew', category: '咖哩', pot_size: 92, base_energy: 19061, icon: 'https://www.serebii.net/pokemonsleep/meals/hiddenpowerperk-upstew.png', ingredients: [{ name: '萌綠大豆', count: 28 }, { name: '好眠番茄', count: 25 }, { name: '品鮮蘑菇', count: 23 }, { name: '醒腦咖啡豆', count: 16 }] },
    { name_cn: '居合斬壽喜燒咖哩', name_en: 'Cut Sukiyaki Curry', category: '咖哩', pot_size: 101, base_energy: 20655, icon: 'https://www.serebii.net/pokemonsleep/meals/cutsukiyakicurry.png', ingredients: [{ name: '粗枝大蔥', count: 27 }, { name: '豆製肉', count: 26 }, { name: '甜甜蜜', count: 26 }, { name: '特選蛋', count: 22 }] },
    { name_cn: '扮演南瓜精濃湯', name_en: 'Role Play Pumpkaboo Stew', category: '咖哩', pot_size: 69, base_energy: 15621, icon: 'https://www.serebii.net/pokemonsleep/meals/roleplaypumpkaboostew.png', ingredients: [{ name: '沉甸甸南瓜', count: 10 }, { name: '豆製肉', count: 16 }, { name: '窩心洋芋', count: 18 }, { name: '品鮮蘑菇', count: 25 }] },
    { name_cn: '茂盛焗烤酪梨', name_en: 'Overgrow Avocado Gratin', category: '咖哩', pot_size: 115, base_energy: 24802, icon: 'https://www.serebii.net/pokemonsleep/meals/overgrowavocadogratin.png', ingredients: [{ name: '嫩亮酪梨', count: 22 }, { name: '窩心洋芋', count: 20 }, { name: '哞哞鮮奶', count: 41 }, { name: '純粹油', count: 32 }] },
    { name_cn: '萌綠咖哩麵包', name_en: 'Greengrass Curry Bun', category: '咖哩', pot_size: 63, base_energy: 10945, icon: 'https://www.serebii.net/pokemonsleep/meals/greengrasscurrybun.png', ingredients: [{ name: '暖暖薑', count: 20 }, { name: '火辣香草', count: 20 }, { name: '萌綠大豆', count: 8 }, { name: '純粹油', count: 15 }] },
    { name_cn: '彈跳咖哩烏龍麵', name_en: 'Bounce Curry Udon', category: '咖哩', pot_size: 112, base_energy: 25539, icon: 'https://www.serebii.net/pokemonsleep/meals/bouncecurryudon.png', ingredients: [{ name: '暖暖薑', count: 39 }, { name: '品鮮蘑菇', count: 31 }, { name: '火辣香草', count: 22 }, { name: '豆製肉', count: 20 }] },
    { name_cn: '呆呆獸尾巴的胡椒沙拉', name_en: 'Slowpoke Tail Pepper Salad', category: '沙拉', pot_size: 35, base_energy: 8169, icon: 'https://www.serebii.net/pokemonsleep/meals/slowpoketailpeppersalad.png', ingredients: [{ name: '美味尾巴', count: 10 }, { name: '火辣香草', count: 10 }, { name: '純粹油', count: 15 }] },
    { name_cn: '蘑菇孢子沙拉', name_en: 'Spore Mushroom Salad', category: '沙拉', pot_size: 33, base_energy: 5859, icon: 'https://www.serebii.net/pokemonsleep/meals/sporemushroomsalad.png', ingredients: [{ name: '品鮮蘑菇', count: 17 }, { name: '好眠番茄', count: 8 }, { name: '純粹油', count: 8 }] },
    { name_cn: '撥雪凱撒沙拉', name_en: 'Snow Cloak Caesar Salad', category: '沙拉', pot_size: 16, base_energy: 1898, icon: 'https://www.serebii.net/pokemonsleep/meals/snowcloakcaesarsalad.png', ingredients: [{ name: '哞哞鮮奶', count: 10 }, { name: '豆製肉', count: 6 }] },
    { name_cn: '貪吃鬼洋芋沙拉', name_en: 'Gluttony Potato Salad', category: '沙拉', pot_size: 36, base_energy: 5040, icon: 'https://www.serebii.net/pokemonsleep/meals/gluttonypotatosalad.png', ingredients: [{ name: '窩心洋芋', count: 14 }, { name: '特選蛋', count: 9 }, { name: '豆製肉', count: 7 }, { name: '特選蘋果', count: 6 }] },
    { name_cn: '濕潤豆腐沙拉', name_en: 'Water Veil Tofu Salad', category: '沙拉', pot_size: 24, base_energy: 3113, icon: 'https://www.serebii.net/pokemonsleep/meals/waterveiltofusalad.png', ingredients: [{ name: '萌綠大豆', count: 15 }, { name: '好眠番茄', count: 9 }] },
    { name_cn: '蠻力豪邁沙拉', name_en: 'Superpower Extreme Salad', category: '沙拉', pot_size: 23, base_energy: 3046, icon: 'https://www.serebii.net/pokemonsleep/meals/superpowerextremesalad.png', ingredients: [{ name: '豆製肉', count: 9 }, { name: '暖暖薑', count: 6 }, { name: '特選蛋', count: 5 }, { name: '窩心洋芋', count: 3 }] },
    { name_cn: '豆製火腿沙拉', name_en: 'Bean Ham Salad', category: '沙拉', pot_size: 8, base_energy: 978, icon: 'https://www.serebii.net/pokemonsleep/meals/beanhamsalad.png', ingredients: [{ name: '豆製肉', count: 8 }] },
    { name_cn: '好眠番茄沙拉', name_en: 'Snoozy Tomato Salad', category: '沙拉', pot_size: 8, base_energy: 1045, icon: 'https://www.serebii.net/pokemonsleep/meals/snoozytomatosalad.png', ingredients: [{ name: '好眠番茄', count: 8 }] },
    { name_cn: '哞哞起司番茄沙拉', name_en: 'Moomoo Caprese Salad', category: '沙拉', pot_size: 23, base_energy: 2942, icon: 'https://www.serebii.net/pokemonsleep/meals/moomoocapresesalad.png', ingredients: [{ name: '哞哞鮮奶', count: 12 }, { name: '好眠番茄', count: 6 }, { name: '純粹油', count: 5 }] },
    { name_cn: '心情不定肉沙拉淋巧克力醬', name_en: 'Contrary Chocolate Meat Salad', category: '沙拉', pot_size: 23, base_energy: 3665, icon: 'https://www.serebii.net/pokemonsleep/meals/contrarychocolatemeatsalad.png', ingredients: [{ name: '放鬆可可', count: 14 }, { name: '豆製肉', count: 9 }] },
    { name_cn: '過熱沙拉', name_en: 'Overheat Ginger Salad', category: '沙拉', pot_size: 35, base_energy: 5225, icon: 'https://www.serebii.net/pokemonsleep/meals/overheatgingersalad.png', ingredients: [{ name: '火辣香草', count: 17 }, { name: '暖暖薑', count: 10 }, { name: '好眠番茄', count: 8 }] },
    { name_cn: '特選蘋果沙拉', name_en: 'Fancy Apple Salad', category: '沙拉', pot_size: 8, base_energy: 855, icon: 'https://www.serebii.net/pokemonsleep/meals/fancyapplesalad.png', ingredients: [{ name: '特選蘋果', count: 8 }] },
    { name_cn: '免疫蔥花沙拉', name_en: 'Immunity Leek Salad', category: '沙拉', pot_size: 15, base_energy: 2845, icon: 'https://www.serebii.net/pokemonsleep/meals/immunityleeksalad.png', ingredients: [{ name: '粗枝大蔥', count: 10 }, { name: '暖暖薑', count: 5 }] },
    { name_cn: '迷人蘋果起司沙拉', name_en: 'Dazzling Apple Cheese Salad', category: '沙拉', pot_size: 23, base_energy: 2655, icon: 'https://www.serebii.net/pokemonsleep/meals/dazzlingapplecheesesalad.png', ingredients: [{ name: '特選蘋果', count: 15 }, { name: '哞哞鮮奶', count: 5 }, { name: '純粹油', count: 3 }] },
    { name_cn: '忍者沙拉', name_en: 'Ninja Salad', category: '沙拉', pot_size: 57, base_energy: 11659, icon: 'https://www.serebii.net/pokemonsleep/meals/ninjasalad.png', ingredients: [{ name: '粗枝大蔥', count: 15 }, { name: '萌綠大豆', count: 19 }, { name: '品鮮蘑菇', count: 12 }, { name: '暖暖薑', count: 11 }] },
    { name_cn: '熱風豆腐沙拉', name_en: 'Heat Wave Tofu Salad', category: '沙拉', pot_size: 16, base_energy: 2114, icon: 'https://www.serebii.net/pokemonsleep/meals/heatwavetofusalad.png', ingredients: [{ name: '萌綠大豆', count: 10 }, { name: '火辣香草', count: 6 }] },
    { name_cn: '萌綠沙拉', name_en: 'Greengrass Salad', category: '沙拉', pot_size: 62, base_energy: 11393, icon: 'https://www.serebii.net/pokemonsleep/meals/greengrasssalad.png', ingredients: [{ name: '純粹油', count: 22 }, { name: '萌綠玉米', count: 17 }, { name: '好眠番茄', count: 14 }, { name: '窩心洋芋', count: 9 }] },
    { name_cn: '冥想香甜沙拉', name_en: 'Calm Mind Fruit Salad', category: '沙拉', pot_size: 49, base_energy: 7675, icon: 'https://www.serebii.net/pokemonsleep/meals/calmmindfruitsalad.png', ingredients: [{ name: '特選蘋果', count: 21 }, { name: '甜甜蜜', count: 16 }, { name: '萌綠玉米', count: 12 }] },
    { name_cn: '亂擊玉米沙拉', name_en: 'Fury Attack Corn Salad', category: '沙拉', pot_size: 17, base_energy: 2785, icon: 'https://www.serebii.net/pokemonsleep/meals/furyattackcornsalad.png', ingredients: [{ name: '萌綠玉米', count: 9 }, { name: '純粹油', count: 8 }] },
    { name_cn: '十字切碎丁沙拉', name_en: 'Cross Chop Salad', category: '沙拉', pot_size: 56, base_energy: 8755, icon: 'https://www.serebii.net/pokemonsleep/meals/crosschopsalad.png', ingredients: [{ name: '特選蛋', count: 20 }, { name: '豆製肉', count: 15 }, { name: '萌綠玉米', count: 11 }, { name: '好眠番茄', count: 10 }] },
    { name_cn: '不服輸咖啡沙拉', name_en: 'Defiant Coffee-Dressed Salad', category: '沙拉', pot_size: 100, base_energy: 20218, icon: 'https://www.serebii.net/pokemonsleep/meals/defiantcoffee-dressedsalad.png', ingredients: [{ name: '醒腦咖啡豆', count: 28 }, { name: '豆製肉', count: 28 }, { name: '純粹油', count: 22 }, { name: '窩心洋芋', count: 22 }] },
    { name_cn: '落英繽紛含羞草蛋沙拉', name_en: 'Petal Blizzard Layered Salad', category: '沙拉', pot_size: 69, base_energy: 11811, icon: 'https://www.serebii.net/pokemonsleep/meals/petalblizzardlayeredsalad.png', ingredients: [{ name: '特選蛋', count: 25 }, { name: '純粹油', count: 17 }, { name: '窩心洋芋', count: 15 }, { name: '豆製肉', count: 12 }] },
    { name_cn: '蘋果酸優格沙拉', name_en: 'Apple Acid Yogurt-Dressed Salad', category: '沙拉', pot_size: 104, base_energy: 19293, icon: 'https://www.serebii.net/pokemonsleep/meals/appleacidyogurt-dressedsalad.png', ingredients: [{ name: '特選蛋', count: 35 }, { name: '特選蘋果', count: 28 }, { name: '好眠番茄', count: 23 }, { name: '哞哞鮮奶', count: 18 }] },
    { name_cn: '碎裂酪梨沙拉', name_en: 'Luscious Avocado Salad', category: '沙拉', pot_size: 42, base_energy: 7125, icon: 'https://www.serebii.net/pokemonsleep/meals/lusciousavocadosalad.png', ingredients: [{ name: '嫩亮酪梨', count: 14 }, { name: '萌綠大豆', count: 18 }, { name: '純粹油', count: 10 }] },
    { name_cn: '重踏酪梨醬脆片', name_en: 'Bulldoze Guacamole and Chips', category: '沙拉', pot_size: 105, base_energy: 25162, icon: 'https://www.serebii.net/pokemonsleep/meals/bulldozeguacamoleandchips.png', ingredients: [{ name: '嫩亮酪梨', count: 28 }, { name: '萌綠玉米', count: 25 }, { name: '火辣香草', count: 30 }, { name: '萌綠大豆', count: 22 }] },
    { name_cn: '大塊滿滿熱水沙拉', name_en: 'Scald Chunky Salad', category: '沙拉', pot_size: 95, base_energy: 25356, icon: 'https://www.serebii.net/pokemonsleep/meals/scaldchunkysalad.png', ingredients: [{ name: '沉甸甸南瓜', count: 20 }, { name: '窩心洋芋', count: 30 }, { name: '萌綠玉米', count: 18 }, { name: '品鮮蘑菇', count: 27 }] },
    { name_cn: '熟成甜薯燒', name_en: 'Fluffy Sweet Potatoes', category: '甜點', pot_size: 14, base_energy: 1907, icon: 'https://www.serebii.net/pokemonsleep/meals/fluffysweetpotatoes.png', ingredients: [{ name: '窩心洋芋', count: 9 }, { name: '哞哞鮮奶', count: 5 }] },
    { name_cn: '不屈薑餅', name_en: 'Steadfast Ginger Cookies', category: '甜點', pot_size: 35, base_energy: 4921, icon: 'https://www.serebii.net/pokemonsleep/meals/steadfastgingercookies.png', ingredients: [{ name: '甜甜蜜', count: 14 }, { name: '暖暖薑', count: 12 }, { name: '放鬆可可', count: 5 }, { name: '特選蛋', count: 4 }] },
    { name_cn: '特選蘋果汁', name_en: 'Fancy Apple Juice', category: '甜點', pot_size: 8, base_energy: 855, icon: 'https://www.serebii.net/pokemonsleep/meals/fancyapplejuice.png', ingredients: [{ name: '特選蘋果', count: 8 }] },
    { name_cn: '手製勁爽汽水', name_en: 'Craft Soda Pop', category: '甜點', pot_size: 9, base_energy: 1079, icon: 'https://www.serebii.net/pokemonsleep/meals/craftsodapop.png', ingredients: [{ name: '甜甜蜜', count: 9 }] },
    { name_cn: '火花薑茶', name_en: 'Ember Ginger Tea', category: '甜點', pot_size: 16, base_energy: 1913, icon: 'https://www.serebii.net/pokemonsleep/meals/embergingertea.png', ingredients: [{ name: '暖暖薑', count: 9 }, { name: '特選蘋果', count: 7 }] },
    { name_cn: '胖丁百匯布丁', name_en: 'Jigglypuff\'s Fruity Flan', category: '甜點', pot_size: 55, base_energy: 7594, icon: 'https://www.serebii.net/pokemonsleep/meals/jigglypuff\'sfruityflan.png', ingredients: [{ name: '甜甜蜜', count: 20 }, { name: '特選蛋', count: 15 }, { name: '哞哞鮮奶', count: 10 }, { name: '特選蘋果', count: 10 }] },
    { name_cn: '惡魔之吻水果牛奶', name_en: 'Lovely Kiss Smoothie', category: '甜點', pot_size: 35, base_energy: 4734, icon: 'https://www.serebii.net/pokemonsleep/meals/lovelykisssmoothie.png', ingredients: [{ name: '特選蘋果', count: 11 }, { name: '哞哞鮮奶', count: 9 }, { name: '甜甜蜜', count: 7 }, { name: '放鬆可可', count: 8 }] },
    { name_cn: '祈願蘋果派', name_en: 'Lucky Chant Apple Pie', category: '甜點', pot_size: 16, base_energy: 1748, icon: 'https://www.serebii.net/pokemonsleep/meals/luckychantapplepie.png', ingredients: [{ name: '特選蘋果', count: 12 }, { name: '哞哞鮮奶', count: 4 }] },
    { name_cn: '橙夢的排毒茶', name_en: 'Neroli\'s Restorative Tea', category: '甜點', pot_size: 35, base_energy: 5065, icon: 'https://www.serebii.net/pokemonsleep/meals/neroli\'srestorativetea.png', ingredients: [{ name: '暖暖薑', count: 11 }, { name: '特選蘋果', count: 15 }, { name: '品鮮蘑菇', count: 9 }] },
    { name_cn: '甜甜香氣巧克力蛋糕', name_en: 'Sweet Scent Chocolate Cake', category: '甜點', pot_size: 24, base_energy: 3378, icon: 'https://www.serebii.net/pokemonsleep/meals/sweetscentchocolatecake.png', ingredients: [{ name: '甜甜蜜', count: 9 }, { name: '放鬆可可', count: 8 }, { name: '哞哞鮮奶', count: 7 }] },
    { name_cn: '哞哞熱鮮奶', name_en: 'Warm Moomoo Milk', category: '甜點', pot_size: 7, base_energy: 814, icon: 'https://www.serebii.net/pokemonsleep/meals/warmmoomoomilk.png', ingredients: [{ name: '哞哞鮮奶', count: 7 }] },
    { name_cn: '輕裝豆香蛋糕', name_en: 'Cloud Nine Soy Cake', category: '甜點', pot_size: 15, base_energy: 1924, icon: 'https://www.serebii.net/pokemonsleep/meals/cloudninesoycake.png', ingredients: [{ name: '特選蛋', count: 8 }, { name: '萌綠大豆', count: 7 }] },
    { name_cn: '活力蛋白飲', name_en: 'Hustle Protein Smoothie', category: '甜點', pot_size: 23, base_energy: 3168, icon: 'https://www.serebii.net/pokemonsleep/meals/hustleproteinsmoothie.png', ingredients: [{ name: '萌綠大豆', count: 15 }, { name: '放鬆可可', count: 8 }] },
    { name_cn: '我行我素蔬菜汁', name_en: 'Stalwart Vegetable Juice', category: '甜點', pot_size: 16, base_energy: 1924, icon: 'https://www.serebii.net/pokemonsleep/meals/stalwartvegetablejuice.png', ingredients: [{ name: '好眠番茄', count: 9 }, { name: '特選蘋果', count: 7 }] },
    { name_cn: '大馬拉薩達', name_en: 'Big Malasada', category: '甜點', pot_size: 23, base_energy: 3015, icon: 'https://www.serebii.net/pokemonsleep/meals/bigmalasada.png', ingredients: [{ name: '純粹油', count: 10 }, { name: '哞哞鮮奶', count: 7 }, { name: '甜甜蜜', count: 6 }] },
    { name_cn: '大力士豆香甜甜圈', name_en: 'Huge Power Soy Donuts', category: '甜點', pot_size: 35, base_energy: 5547, icon: 'https://www.serebii.net/pokemonsleep/meals/hugepowersoydonuts.png', ingredients: [{ name: '純粹油', count: 12 }, { name: '萌綠大豆', count: 16 }, { name: '放鬆可可', count: 7 }] },
    { name_cn: '大爆炸爆米花', name_en: 'Explosion Popcorn', category: '甜點', pot_size: 36, base_energy: 6048, icon: 'https://www.serebii.net/pokemonsleep/meals/explosionpopcorn.png', ingredients: [{ name: '萌綠玉米', count: 15 }, { name: '純粹油', count: 14 }, { name: '哞哞鮮奶', count: 7 }] },
    { name_cn: '茶會玉米司康', name_en: 'Teatime Corn Scones', category: '甜點', pot_size: 67, base_energy: 10925, icon: 'https://www.serebii.net/pokemonsleep/meals/teatimecornscones.png', ingredients: [{ name: '特選蘋果', count: 20 }, { name: '暖暖薑', count: 20 }, { name: '萌綠玉米', count: 18 }, { name: '哞哞鮮奶', count: 9 }] },
    { name_cn: '花瓣舞巧克力塔', name_en: 'Petal Dance Chocolate Tart', category: '甜點', pot_size: 22, base_energy: 3314, icon: 'https://www.serebii.net/pokemonsleep/meals/petaldancechocolatetart.png', ingredients: [{ name: '特選蘋果', count: 11 }, { name: '放鬆可可', count: 11 }] },
    { name_cn: '花之禮馬卡龍', name_en: 'Flower Gift Macarons', category: '甜點', pot_size: 77, base_energy: 13834, icon: 'https://www.serebii.net/pokemonsleep/meals/flowergiftmacarons.png', ingredients: [{ name: '放鬆可可', count: 25 }, { name: '特選蛋', count: 25 }, { name: '甜甜蜜', count: 17 }, { name: '哞哞鮮奶', count: 10 }] },
    { name_cn: '早起咖啡凍', name_en: 'Early Bird Coffee Jelly', category: '甜點', pot_size: 42, base_energy: 6793, icon: 'https://www.serebii.net/pokemonsleep/meals/earlybirdcoffeejelly.png', ingredients: [{ name: '醒腦咖啡豆', count: 16 }, { name: '哞哞鮮奶', count: 14 }, { name: '甜甜蜜', count: 12 }] },
    { name_cn: '電光香料可樂', name_en: 'Zing Zap Spiced Cola', category: '甜點', pot_size: 87, base_energy: 17494, icon: 'https://www.serebii.net/pokemonsleep/meals/zingzapspicedcola.png', ingredients: [{ name: '特選蘋果', count: 35 }, { name: '暖暖薑', count: 20 }, { name: '粗枝大蔥', count: 20 }, { name: '醒腦咖啡豆', count: 12 }] },
    { name_cn: '破格玉米香提拉米蘇', name_en: 'Mold Breaker Corn Tiramisu', category: '甜點', pot_size: 40, base_energy: 7125, icon: 'https://www.serebii.net/pokemonsleep/meals/moldbreakercorntiramisu.png', ingredients: [{ name: '醒腦咖啡豆', count: 14 }, { name: '萌綠玉米', count: 14 }, { name: '哞哞鮮奶', count: 12 }] },
    { name_cn: '土王閃電泡芙', name_en: 'Clodsire Eclair', category: '甜點', pot_size: 102, base_energy: 20885, icon: 'https://www.serebii.net/pokemonsleep/meals/clodsireeclair.png', ingredients: [{ name: '放鬆可可', count: 30 }, { name: '哞哞鮮奶', count: 26 }, { name: '醒腦咖啡豆', count: 24 }, { name: '甜甜蜜', count: 22 }] },
    { name_cn: '心跳加速鬼面鬆餅', name_en: 'Scary Face Pancakes', category: '甜點', pot_size: 103, base_energy: 24354, icon: 'https://www.serebii.net/pokemonsleep/meals/scaryfacepancakes.png', ingredients: [{ name: '沉甸甸南瓜', count: 18 }, { name: '特選蛋', count: 24 }, { name: '甜甜蜜', count: 32 }, { name: '好眠番茄', count: 29 }] },
    { name_cn: '青草攪拌器冰沙', name_en: 'Leaf Tornado Smoothie', category: '甜點', pot_size: 48, base_energy: 8165, icon: 'https://www.serebii.net/pokemonsleep/meals/leaftornadosmoothie.png', ingredients: [{ name: '嫩亮酪梨', count: 18 }, { name: '好眠番茄', count: 16 }, { name: '哞哞鮮奶', count: 14 }] },
    { name_cn: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', category: '甜點', pot_size: 115, base_energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', ingredients: [{ name: '甜甜蜜', count: 38 }, { name: '萌綠玉米', count: 28 }, { name: '純粹油', count: 28 }, { name: '放鬆可可', count: 21 }] }
  ];
