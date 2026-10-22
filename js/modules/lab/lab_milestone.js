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
            ? `Recommended to prioritize Lv.${targetLv} to unlock "${skillDisplay}": rating leaps from ${currentEval.grade} (${currentEval.compositeScore} pts) to ${projEval.grade} (${projEval.compositeScore} pts)!`
            : `建議優先升至 Lv.${targetLv} 解鎖「${skillDisplay}」，評級將由 ${currentEval.grade} 級（${currentEval.compositeScore}分）跨階躍升至 ${projEval.grade} 級（${projEval.compositeScore}分）！`;
        } else {
          milestoneText = isEN
            ? `Recommended to train to Lv.${targetLv} to unlock core "${skillDisplay}": overall score increases from ${currentEval.compositeScore} pts to ${projEval.compositeScore} pts.`
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
    // 咖哩 (Curry)
    {
      name_cn: '彈跳咖哩烏龍麵',
      name_en: 'Bounce Curry Udon',
      base_energy: 25539,
      ingredients: [
        { name: '暖暖薑', count: 39 },
        { name: '品鮮蘑菇', count: 31 },
        { name: '火辣香草', count: 22 },
        { name: '豆製肉', count: 20 }
      ]
    },
    {
      name_cn: '茂盛焗烤酪梨',
      name_en: 'Overgrow Avocado Gratin',
      base_energy: 24802,
      ingredients: [
        { name: '哞哞鮮奶', count: 41 },
        { name: '純粹油', count: 32 },
        { name: '嫩亮酪梨', count: 22 },
        { name: '窩心洋芋', count: 20 }
      ]
    },
    {
      name_cn: '居合斬壽喜燒咖哩',
      name_en: 'Cut Sukiyaki Curry',
      base_energy: 20655,
      ingredients: [
        { name: '粗枝大蔥', count: 27 },
        { name: '豆製肉', count: 26 },
        { name: '甜甜蜜', count: 26 },
        { name: '特選蛋', count: 22 }
      ]
    },
    {
      name_cn: '覺醒力量濃湯',
      name_en: 'Hidden Power Perk-Up Stew',
      base_energy: 19061,
      ingredients: [
        { name: '萌綠大豆', count: 28 },
        { name: '好眠番茄', count: 25 },
        { name: '品鮮蘑菇', count: 23 },
        { name: '醒腦咖啡豆', count: 16 }
      ]
    },
    {
      name_cn: '扮演南瓜精濃湯',
      name_en: 'Role Play Pumpkaboo Stew',
      base_energy: 15621,
      ingredients: [
        { name: '品鮮蘑菇', count: 25 },
        { name: '窩心洋芋', count: 18 },
        { name: '豆製肉', count: 16 },
        { name: '沉甸甸南瓜', count: 10 }
      ]
    },
    {
      name_cn: '煉獄玉米乾咖哩',
      name_en: 'Inferno Corn Keema Curry',
      base_energy: 13690,
      ingredients: [
        { name: '火辣香草', count: 27 },
        { name: '豆製肉', count: 24 },
        { name: '萌綠玉米', count: 14 },
        { name: '暖暖薑', count: 12 }
      ]
    },
    {
      name_cn: '萌綠咖哩麵包',
      name_en: 'Greengrass Curry Bun',
      base_energy: 10945,
      ingredients: [
        { name: '暖暖薑', count: 20 },
        { name: '火辣香草', count: 20 },
        { name: '純粹油', count: 15 },
        { name: '萌綠大豆', count: 8 }
      ]
    },
    {
      name_cn: '絕對睡眠奶油咖哩',
      name_en: 'Dream Eater Butter Curry',
      base_energy: 9010,
      ingredients: [
        { name: '窩心洋芋', count: 18 },
        { name: '好眠番茄', count: 15 },
        { name: '放鬆可可', count: 12 },
        { name: '哞哞鮮奶', count: 10 }
      ]
    },
    {
      name_cn: '忍者咖哩',
      name_en: 'Ninja Curry',
      base_energy: 9445,
      ingredients: [
        { name: '萌綠大豆', count: 24 },
        { name: '粗枝大蔥', count: 12 },
        { name: '豆製肉', count: 9 },
        { name: '品鮮蘑菇', count: 5 }
      ]
    },
    {
      name_cn: '炙燒尾肉咖哩',
      name_en: 'Grilled Tail Curry',
      base_energy: 7483,
      ingredients: [
        { name: '火辣香草', count: 25 },
        { name: '美味尾巴', count: 8 }
      ]
    },
    {
      name_cn: '辣味蔥勁十足咖哩',
      name_en: 'Spicy Leek Curry',
      base_energy: 5900,
      ingredients: [
        { name: '粗枝大蔥', count: 14 },
        { name: '暖暖薑', count: 10 },
        { name: '火辣香草', count: 8 }
      ]
    },

    // 沙拉 (Salad)
    {
      name_cn: '大塊滿滿熱水沙拉',
      name_en: 'Scald Chunky Salad',
      base_energy: 25356,
      ingredients: [
        { name: '窩心洋芋', count: 30 },
        { name: '品鮮蘑菇', count: 27 },
        { name: '沉甸甸南瓜', count: 20 },
        { name: '萌綠玉米', count: 18 }
      ]
    },
    {
      name_cn: '重踏酪梨醬脆片',
      name_en: 'Bulldoze Guacamole and Chips',
      base_energy: 25162,
      ingredients: [
        { name: '火辣香草', count: 30 },
        { name: '嫩亮酪梨', count: 28 },
        { name: '萌綠玉米', count: 25 },
        { name: '萌綠大豆', count: 22 }
      ]
    },
    {
      name_cn: '不服輸咖啡沙拉',
      name_en: 'Defiant Coffee-Dressed Salad',
      base_energy: 20218,
      ingredients: [
        { name: '醒腦咖啡豆', count: 28 },
        { name: '豆製肉', count: 28 },
        { name: '純粹油', count: 22 },
        { name: '窩心洋芋', count: 22 }
      ]
    },
    {
      name_cn: '蘋果酸優格沙拉',
      name_en: 'Apple Acid Yogurt-Dressed Salad',
      base_energy: 19293,
      ingredients: [
        { name: '特選蛋', count: 35 },
        { name: '特選蘋果', count: 28 },
        { name: '好眠番茄', count: 23 },
        { name: '哞哞鮮奶', count: 18 }
      ]
    },
    {
      name_cn: '落英繽紛含羞草蛋沙拉',
      name_en: 'Petal Blizzard Layered Salad',
      base_energy: 11811,
      ingredients: [
        { name: '特選蛋', count: 25 },
        { name: '純粹油', count: 17 },
        { name: '窩心洋芋', count: 15 },
        { name: '豆製肉', count: 12 }
      ]
    },
    {
      name_cn: '忍者沙拉',
      name_en: 'Ninja Salad',
      base_energy: 11659,
      ingredients: [
        { name: '萌綠大豆', count: 19 },
        { name: '粗枝大蔥', count: 15 },
        { name: '品鮮蘑菇', count: 12 },
        { name: '暖暖薑', count: 11 }
      ]
    },
    {
      name_cn: '萌綠沙拉',
      name_en: 'Greengrass Salad',
      base_energy: 11393,
      ingredients: [
        { name: '純粹油', count: 22 },
        { name: '萌綠玉米', count: 17 },
        { name: '好眠番茄', count: 14 },
        { name: '窩心洋芋', count: 9 }
      ]
    },
    {
      name_cn: '碎裂酪梨沙拉',
      name_en: 'Luscious Avocado Salad',
      base_energy: 7125,
      ingredients: [
        { name: '萌綠大豆', count: 18 },
        { name: '嫩亮酪梨', count: 14 },
        { name: '純粹油', count: 10 }
      ]
    },
    {
      name_cn: '呆呆獸尾巴的胡椒沙拉',
      name_en: 'Slowpoke Tail Pepper Salad',
      base_energy: 8169,
      ingredients: [
        { name: '美味尾巴', count: 10 },
        { name: '火辣香草', count: 10 },
        { name: '純粹油', count: 15 }
      ]
    },

    // 甜點 (Dessert)
    {
      name_cn: '採蜜巧克力格子鬆餅',
      name_en: 'Honey Gather Chocolate Waffles',
      base_energy: 25484,
      ingredients: [
        { name: '甜甜蜜', count: 38 },
        { name: '萌綠玉米', count: 28 },
        { name: '純粹油', count: 28 },
        { name: '放鬆可可', count: 21 }
      ]
    },
    {
      name_cn: '心跳加速鬼面鬆餅',
      name_en: 'Scary Face Pancakes',
      base_energy: 24354,
      ingredients: [
        { name: '甜甜蜜', count: 32 },
        { name: '好眠番茄', count: 29 },
        { name: '特選蛋', count: 24 },
        { name: '沉甸甸南瓜', count: 18 }
      ]
    },
    {
      name_cn: '土王閃電泡芙',
      name_en: 'Clodsire Eclair',
      base_energy: 20885,
      ingredients: [
        { name: '放鬆可可', count: 30 },
        { name: '哞哞鮮奶', count: 26 },
        { name: '醒腦咖啡豆', count: 24 },
        { name: '甜甜蜜', count: 22 }
      ]
    },
    {
      name_cn: '電光香料可樂',
      name_en: 'Zing Zap Spiced Cola',
      base_energy: 17494,
      ingredients: [
        { name: '特選蘋果', count: 35 },
        { name: '暖暖薑', count: 20 },
        { name: '粗枝大蔥', count: 20 },
        { name: '醒腦咖啡豆', count: 12 }
      ]
    },
    {
      name_cn: '花之禮馬卡龍',
      name_en: 'Flower Gift Macarons',
      base_energy: 13834,
      ingredients: [
        { name: '放鬆可可', count: 25 },
        { name: '特選蛋', count: 25 },
        { name: '甜甜蜜', count: 17 },
        { name: '哞哞鮮奶', count: 10 }
      ]
    },
    {
      name_cn: '茶會玉米司康',
      name_en: 'Teatime Corn Scones',
      base_energy: 10925,
      ingredients: [
        { name: '特選蘋果', count: 20 },
        { name: '暖暖薑', count: 20 },
        { name: '萌綠玉米', count: 18 },
        { name: '哞哞鮮奶', count: 9 }
      ]
    },
    {
      name_cn: '青草攪拌器冰沙',
      name_en: 'Leaf Tornado Smoothie',
      base_energy: 8165,
      ingredients: [
        { name: '嫩亮酪梨', count: 18 },
        { name: '好眠番茄', count: 16 },
        { name: '哞哞鮮奶', count: 14 }
      ]
    }
  ];

