/**
 * appraisal.js — 寶可夢深度診斷評測室與六維雷達圖報告書 (Deep Dive Appraisal & Radar Chart Lab)
 * =========================================================================================
 * 功能：
 * 1. 六維能力評估演算法 (樹果力、食材力、技能頻率、幫速、後期成長、性價比)
 * 2. 原生精緻 SVG 六維雷達圖 (Responsive SVG Radar Chart with Glassmorphism)
 * 3. 專長適性深度分析、副技能性格協同效益點評、S+/S/A/B/C 培育評級
 * 4. 升級關鍵里程碑 (Lv.30/50/60) 糖果與夢之碎片成本精算
 * 5. 雙入口支援：個人盒子一鍵診斷 + 獨立模擬評測實驗室 (Appraisal Lab)
 */

(function () {
  'use strict';

  /* ─── 六維度元資料定義 ─────────────────────────────────────── */
  function getSixDimMeta(isEN) {
    return [
      { key: 'berry', label: isEN ? 'Berry Output' : '樹果產能', icon: '', angle: -Math.PI / 2, desc: isEN ? 'Total daily berry energy potential (BFS, specialty & speed)' : '單日樹果總能量潛力 (含樹果S、專長與幫速)' },
      { key: 'ingredient', label: isEN ? 'Ingredient Output' : '食材產能', icon: '', angle: -Math.PI / 6, desc: isEN ? 'Ingredient drop rate and recipe combo synergies' : '食材獲取期望與解鎖組合協同效應' },
      { key: 'skill', label: isEN ? 'Skill Power' : '技能強度', icon: '', angle: Math.PI / 6, desc: isEN ? 'Main skill trigger rate and value scaling' : '主技能觸發頻率、等級加成與爆發收益' },
      { key: 'speed', label: isEN ? 'Helping Speed' : '幫忙速度', icon: '', angle: Math.PI / 2, desc: isEN ? 'Overall helping frequency (base interval, sub-skills & nature)' : '整體幫忙頻率 (基礎間隔、幫速SM、幫獎與性格)' },
      { key: 'growth', label: isEN ? 'Late Growth' : '後期成長', icon: '', angle: 5 * Math.PI / 6, desc: isEN ? 'Lv.50/70/80 late skill and ingredient scaling potential' : 'Lv.50/70/80 後期技能與第三食材爆發潛能' },
      { key: 'roi', label: isEN ? 'Resource ROI' : '資源效益', icon: '', angle: -5 * Math.PI / 6, desc: isEN ? 'Early/mid power unlock and candy investment efficiency' : '成型週期、前中期戰力解鎖速度與糖果回報率' }
    ];
  }

  /* 官方 EXP 累計表 (基準 1.0x 曲線) */
  const EXP_MILESTONES = {
    1: 0,
    10: 1600,
    25: 8700,
    30: 12000,
    50: 30000,
    60: 51500,
    75: 98000,
    100: 215000
  };

  /* 官方 夢之碎片 累計表 */
  const SHARD_MILESTONES = {
    1: 0,
    10: 1400,
    25: 9200,
    30: 14500,
    50: 48000,
    60: 110000,
    75: 260000,
    100: 680000
  };

  /* ─── 剩餘可進化次數判定與睡飽飽獎章加成 ───────────────────── */
  const THREE_STAGE_BASE_NAMES = new Set([
    '妙蛙種子', '小火龍', '傑尼龜', '綠毛蟲', '皮丘', '皮寶寶', '寶寶丁', '喇叭芽',
    '小拳石', '鬼斯', '小磁怪', '小福蛋', '波克比', '咩利羊', '迷你龍', '菊草葉',
    '火球鼠', '小鋸鱷', '幼基拉斯', '木守宮', '火稚雞', '水躍魚', '拉魯拉絲', '懶人獺',
    '可可多拉', '大顎蟻', '海豹球', '寶貝龍', '草苗龜', '小火焰猴', '波加曼', '小貓怪',
    '強顎雞母蟲', '新葉喵', '呆火鱷', '潤水鴨', '布撥', '小鍛匠',
    'Bulbasaur', 'Charmander', 'Squirtle', 'Caterpie', 'Pichu', 'Cleffa', 'Igglybuff', 'Bellsprout',
    'Geodude', 'Gastly', 'Magnemite', 'Happiny', 'Togepi', 'Mareep', 'Dratini', 'Chikorita',
    'Cyndaquil', 'Totodile', 'Larvitar', 'Treecko', 'Torchic', 'Mudkip', 'Ralts', 'Slakoth',
    'Aron', 'Trapinch', 'Spheal', 'Bagon', 'Turtwig', 'Chimchar', 'Piplup', 'Shinx',
    'Grubbin', 'Sprigatito', 'Fuecoco', 'Quaxly', 'Pawmi', 'Tinkatink'
  ]);

  function getRemainingEvolutions(pkm) {
    if (!pkm) return 0;
    const isFinal = pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1';
    if (isFinal) return 0;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name;
    if (THREE_STAGE_BASE_NAMES.has(name)) return 2;
    return 1;
  }

  function getRibbonBonus(ribbonLevel, remainingEvolutions) {
    const lvl = Math.min(Math.max(parseInt(ribbonLevel, 10) || 0, 0), 4);
    let carry = 0;
    let speedDiscount = 0;

    if (lvl === 1) {
      carry = 1;
    } else if (lvl === 2) {
      carry = 3;
      if (remainingEvolutions === 1) speedDiscount = 0.05;
      else if (remainingEvolutions === 2) speedDiscount = 0.11;
    } else if (lvl === 3) {
      carry = 6;
      if (remainingEvolutions === 1) speedDiscount = 0.05;
      else if (remainingEvolutions === 2) speedDiscount = 0.11;
    } else if (lvl === 4) {
      carry = 8;
      if (remainingEvolutions === 1) speedDiscount = 0.12;
      else if (remainingEvolutions === 2) speedDiscount = 0.25;
    }
    return { carry: carry, speedDiscount: speedDiscount, speed: speedDiscount, level: lvl };
  }

  /* ─── 特殊寶可夢類型定位識別 (Specialty Category Helpers) ─────────────── */
  function isBfsSkillSpecialist(pkm) {
    // 經社群深入研究與玩家驗證，所有技能型寶可夢核心定位皆為追求主技能發動。
    // 滿包進入偷吃樹果狀態將徹底阻斷技能判定，因此標準神配一律回歸純技能發動專精。
    return false;
  }

  function isHealerSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('療癒')) return true;
    const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥',
                         'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo'];
    return healerNames.some(h => name.includes(h));
  }

  function isHelperBoostSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('幫手加速') || skill.includes('幫手支援') || skill.includes('Helper Boost') || skill.includes('Extra Helpful')) return true;
    const beastNames = ['雷公', '炎帝', '水君', '風速狗', '雷伊布', '艾路雷朵',
                        'Raikou', 'Entei', 'Suicune', 'Arcanine', 'Jolteon', 'Gallade'];
    return beastNames.some(b => name.includes(b));
  }

  function isChargeStrengthSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('能量填充') || skill.includes('Charge Strength') || skill.includes('蓄力')) return true;
    const chargeNames = ['電龍', '咩利羊', '茸茸羊', '太陽伊布', '可達鴨', '哥達鴨', '樹才怪', '盆才怪', '隨風球', '飄飄球', '音波龍', '嗡蝠',
                         'Ampharos', 'Mareep', 'Flaaffy', 'Espeon', 'Psyduck', 'Golduck', 'Sudowoodo', 'Bonsly', 'Drifblim', 'Drifloon', 'Noivern', 'Noibat'];
    return chargeNames.some(c => name.includes(c));
  }

  function isSlowpokeFamily(pkm) {
    if (!pkm) return false;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    return ['呆呆獸', '呆殼獸', '呆呆王', 'Slowpoke', 'Slowbro', 'Slowking'].some(s => name.includes(s));
  }

  function isSlakingFamily(pkm) {
    if (!pkm) return false;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    return ['請假王', '過動猿', '懶人獺', 'Slaking', 'Vigoroth', 'Slakoth'].some(s => name.includes(s));
  }

  /* ─── 核心評估演算法 (單一維度/等級計算核心) ──────────── */
  function evaluateSingle(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, isPotential) {
    if (!pkmData) return null;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    natureName = natureName || '坦率';
    subskills = subskills || [];
    ingredients = ingredients || [];
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
    
    // 計算已解鎖副技能 (官方最新解鎖門檻: Lv.10, 25, 50, 75, 100)
    const slotLevels = [10, 25, 50, 75, 100];
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
    const nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) ||
      (window.PokemonApp && window.PokemonApp.NATURE_DICT && window.PokemonApp.NATURE_DICT[natureName]) ||
      fallbackNatureDict[natureName] || { buffType: 'none', debuffType: 'none' };
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    const isHealer = isHealerSkillSpecialist(pkmData);
    const isHelper = isHelperBoostSkillSpecialist(pkmData);
    const isCharge = isChargeStrengthSkillSpecialist(pkmData);
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
    const isHybridBfsCandidate = (isCharge || isHelper || isSlaking) && hasBFS;

    if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      compositeScore = (berryScore * 0.50) + (speedScore * 0.24) + (roiScore * 0.14) + (growthScore * 0.12);
    } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      compositeScore = (ingScore * 0.50) + (speedScore * 0.24) + (roiScore * 0.14) + (growthScore * 0.12);
    } else {
      if (isHybridBfsCandidate) {
        // 技能型 BFS 雙修產能補償：以樹果高額副輸出補足總能量期望
        compositeScore = (skillScore * 0.32) + (berryScore * 0.32) + (speedScore * 0.22) + (roiScore * 0.14);
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
      if (isHybridBfsCandidate) specialtySynergy += 4.5; // 雙修突破加分
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
    let gradeTitle = isEN ? 'Solid Choice' : '實用良品 (Solid Choice)';
    let gradeColor = '#10b981';
    if (compositeScore >= 98) {
      grade = 'SSS';
      gradeTitle = isEN ? '[★] Apex God' : '[★] 神級天花板 (Apex God)';
      gradeColor = '#f43f5e';
    } else if (compositeScore >= 95) {
      grade = 'SS';
      gradeTitle = isEN ? '[★] Mythic Tier' : '[★] 極品畢業 (Mythic Tier)';
      gradeColor = '#8b5cf6';
    } else if (compositeScore >= 90) {
      grade = 'S';
      gradeTitle = isEN ? '[★] Top Tier' : '[★] 頂級戰力 (Top Tier)';
      gradeColor = '#f59e0b';
    } else if (compositeScore >= 80) {
      grade = 'A';
      gradeTitle = isEN ? '[+] Strong Pick' : '[+] 強力主力 (Strong Pick)';
      gradeColor = '#3b82f6';
    } else if (compositeScore >= 70) {
      grade = 'B';
      gradeTitle = isEN ? '[✓] Solid Choice' : '[✓] 實用良品 (Solid Choice)';
      gradeColor = '#10b981';
    } else if (compositeScore >= 60) {
      grade = 'C';
      gradeTitle = isEN ? '[~] Usable' : '[~] 過渡可用 (Usable)';
      gradeColor = '#64748b';
    } else {
      grade = 'D';
      gradeTitle = isEN ? '[-] Recycle' : '[-] 換糖回收 (Recycle)';
      gradeColor = '#ef4444';
    }

    // 深度優點與缺點分析 (Pros & Cons)
    const pros = [];
    const cons = [];

    const hasBFSInTotal = activeSubskills.indexOf('樹果數量S') !== -1 || activeSubskills.indexOf('Berry Finding S') !== -1;

    if (hasBFSInTotal) {
      if (isHelper) {
        cons.push(isEN
          ? '[!] Helper Boost base proc rate is extremely low (~2%); "Berry Finding S" causes rapid bag overflow and blocks main skill checks, crowding out trigger subskills.'
          : '[!] 傳說神獸「幫手加速」基礎機率極低（約2%），持有「樹果數量S」會迅速塞滿背包並阻斷主技能判定，嚴重排擠關鍵技能機率與持有上限。');
      } else if (isHealer) {
        cons.push(isEN
          ? '[!] Healer relies on all-day skill procs; "Berry Finding S" causes rapid bag overflow and blocks healing procs (especially overnight).'
          : '[!] 活力療癒補師首重全隊活力維持，「樹果數量S」會大幅加速滿包並阻斷主技能判定（尤其睡眠過夜期間），需高頻清包。');
      } else if (isCharge || isSlaking) {
        pros.push(isEN
          ? '[★] Equipped with "Berry Finding S" for high-strength hybrid berry output (ensure frequent collection to avoid bag overflow blocking skill procs).'
          : '[★] 具備「樹果數量S」解鎖高額樹果副輸出，兼顧單兵直傷與產果（需留意及時清包避免阻斷主技能判定）。');
      } else if (pkmName.includes('咚咚鼠') || pkmName.includes('Dedenne') || pkmName.includes('磁怪') || pkmName.includes('Magne') || pkmName.includes('喵喵') || pkmName.includes('Meowth')) {
        cons.push(isEN
          ? '[!] Tactical skill specialist; "Berry Finding S" causes early bag overflow and blocks main skill checks.'
          : '[!] 純戰術型技能寶可夢持有上限較低，擁有「樹果數量S」容易過早滿包限制主技能判定。');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        const hasCarryBuff = activeSubskills.some(s => s.includes('持有上限') || s.includes('Inventory Up'));
        if (hasCarryBuff) {
          pros.push(isEN
            ? '[+] Features "Berry Finding S" backed by Inventory Up, providing bonus berry value without hurting ingredient capacity.'
            : '[+] 具備「樹果數量S」並搭配「持有上限提升」，兼顧穩定副產能且不易過早滿包。');
        } else {
          cons.push(isEN
            ? '[-] "Berry Finding S" on ingredient specialist without Inventory Up causes rapid overflow, blocking ingredient drops during sleep.'
            : '[-] 食材型持有「樹果數量S」但缺乏「持有上限提升」，易在離線期間快速滿包並提前進入偷吃樹果狀態阻斷產料。');
        }
      } else {
        pros.push(isEN
          ? '[★] Equipped with active God-tier sub-skill "Berry Finding S", +1 berry per help.'
          : '[★] 擁有已解鎖神技「樹果數量S」，樹果產能躍升 +1 個。');
      }
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      const hasHB = activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1;
      const hasSpeedM = activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1;
      if (hasHB && hasSpeedM && nature.buffType === 'speed') {
        pros.push(isEN
          ? '[+] Features extreme speed kit (Helping Bonus + Helping Speed M + Speed Up Nature), qualifying as a viable core support.'
          : '[+] 具備「幫手獎勵 + 幫忙速度M + 加幫速性格」之極限幫速配置，成功特例躋身主力行列！');
      } else {
        cons.push(isEN
          ? '[-] Berry specialist without active "Berry Finding S", production ceiling is capped below top tier.'
          : '[-] 樹果型專長未激活「樹果數量S」，核心產能與頂標差距明顯，上限封頂於過渡可用（最高B級）。');
      }
    }

    if (isSlowpoke) {
      const hasTailLv30 = ingredients.length >= 2 && (ingredients[1] === '美味尾巴' || (ingredients[1] && ingredients[1].includes('尾巴')) || (ingredients[1] && ingredients[1].includes('Tail')));
      if (hasTailLv30) {
        pros.push(isEN
          ? '[★] Lv.30 unlocks the most valuable ingredient "Slowpoke Tail", fulfilling primary strategic unlock mission!'
          : '[★] Lv.30 解鎖遊戲最頂級食材「美味尾巴」，達成呆呆獸家族首要戰略解鎖使命！');
      } else {
        cons.push(isEN
          ? '[-] Lv.30 does NOT yield "Slowpoke Tail", failing its core strategic unlock role.'
          : '[-] 致命失職：Lv.30 未出「美味尾巴」，喪失呆呆獸家族核心戰略解鎖價值。');
      }
    }

    if (isHealer) {
      if (nature.debuffType === 'skill') {
        cons.push(isEN
          ? '[-] Critical flaw: Healer has Main Skill Trigger Down nature, failing to sustain team energy.'
          : '[-] 致命缺陷：補師性格為減主技能發動率（-20%），全天期望回能嚴重不足，無法勝任隊伍基石。');
      } else if (!hasSkillM && !hasSkillS && nature.buffType !== 'skill') {
        cons.push(isEN
          ? '[!] Lacks any active Skill Trigger subskills or nature boost; healing frequency is too low for reliable team recovery.'
          : '[!] 缺乏任何主技能發動率副技能或性格加成，發動期望偏低，無法穩定維持全隊活力。');
      }
    }

    const hasIngMInTotal = activeSubskills.indexOf('食材機率提升M') !== -1 || activeSubskills.indexOf('Ingredient Finder M') !== -1;
    if (hasIngMInTotal) {
      pros.push(isEN
        ? '[+] Features active "Ingredient Finder M", greatly stabilizing ingredient supply.'
        : '[+] 具備已解鎖「食材機率提升M」，大幅提升料理食材供貨穩定度。');
    }

    const hasSkillMInTotal = activeSubskills.indexOf('技能機率提升M') !== -1 || activeSubskills.indexOf('Skill Trigger M') !== -1;
    if (hasSkillMInTotal) {
      pros.push(isEN
        ? '[+] Features active "Skill Trigger M", significantly raising main skill activation frequency.'
        : '[+] 擁有已解鎖「技能機率提升M」，主技能發動頻率顯著提高。');
    }

    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) {
      pros.push(isEN
        ? '[★] Features active top-tier team aura "Helping Bonus", reducing team helping time by 5%.'
        : '[★] 具備已解鎖全隊頂級光環「幫手獎勵」，全員幫忙時間縮短 5%（相當於全隊淨產能大幅提升）。');
    }

    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) {
      pros.push(isEN
        ? '[+] Features active "Helping Speed M", shortening self helping interval by 14%.'
        : '[+] 擁有已解鎖「幫忙速度M」，自身幫忙間隔縮短 14%。');
    }

    if (skillLevel >= 6) {
      pros.push(isEN
        ? `[★] High Main Skill Level (Lv.${skillLevel}), maximizing main skill trigger output.`
        : `[★] 主技能等級達到 Lv.${skillLevel}，技能單次發動效益已達極限。`);
    }

    if (nature.buffType === 'speed') {
      if ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') && natureName === '固執') {
        pros.push(isEN
          ? '[★] Nature "Adamant" is the #1 God nature for Berry specialists (Speed of Help ▲ +10%, Ingredient Finding ▼ converts help cycles directly into berry output).'
          : '[★] 性格「固執」為樹果型第一神性格（幫忙速度▲ +10%，食材發現率▼ 進一步轉化樹果產量）。');
      } else {
        pros.push(isEN
          ? `[+] Nature "${natDisplayName}" provides Speed of Help ▲ (+10%), boosting all production.`
          : '[+] 性格「' + natureName + '」帶來幫忙速度▲ (+10%)，強化所有產出判定。');
      }
    } else if (nature.debuffType === 'speed') {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Speed of Help ▼ (-7.5%), severely impacting output.`
        : '[-] 性格「' + natureName + '」幫忙速度▼ (-7.5%)，對全方位產出有顯著負面影響。');
    }

    if (nature.buffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(isEN
        ? `[+] Nature "${natDisplayName}" perfectly synergizes with Ingredient specialty (Ingredient Finder ▲ +20%).`
        : '[+] 性格「' + natureName + '」完美契合食材型專長 (食材發現率▲ +20%)。');
    } else if (nature.debuffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Ingredient Finding ▼ (-20%), severely weakening specialty advantage (disqualification flaw).`
        : '[-] 致命缺陷：性格「' + natureName + '」導致食材發現率▼ (-20%)，產料嚴重不足，建議換糖回收。');
    }

    if (nature.buffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(isEN
        ? `[+] Nature "${natDisplayName}" perfectly matches Skill specialty (Main Skill Trigger ▲ +20%).`
        : '[+] 性格「' + natureName + '」完美契合技能型專長 (主技能發動率▲ +20%)。');
    } else if (nature.debuffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Main Skill Trigger ▼ (-20%), severely crippling skill output.`
        : '[-] 致命缺陷：性格「' + natureName + '」導致主技能發動率▼ (-20%)，嚴重閹割核心發動頻率。');
    }

    if (ribbonBonus.level > 0) {
      const carryText = `+${ribbonBonus.carry}`;
      if (ribbonBonus.speedDiscount > 0) {
        const pctText = `${Math.round(ribbonBonus.speedDiscount * 100)}%`;
        pros.push(isEN
          ? `[Ribbon Lv.${ribbonBonus.level}] Helping interval shortened by ${pctText}, carry capacity increased by ${carryText}.`
          : `[睡飽飽獎章 Lv.${ribbonBonus.level}] 幫忙間隔縮短 ${pctText}，持有上限增加 ${carryText}。`);
      } else {
        pros.push(isEN
          ? `[Ribbon Lv.${ribbonBonus.level}] Carry capacity increased by ${carryText}${remainingEvos === 0 ? ' (fully evolved/single-stage, no speed reduction)' : ''}.`
          : `[睡飽飽獎章 Lv.${ribbonBonus.level}] 持有上限增加 ${carryText}${remainingEvos === 0 ? '（最終形態/無進化型態無速度縮短）' : ''}。`);
      }
    }

    // 食材組合深度診斷 (AAA, ABB, ABC)
    if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      if (ingredients.length >= 3 && currentLv >= 60) {
        const i0 = ingredients[0], i1 = ingredients[1], i2 = ingredients[2];
        if (i0 && i1 && i2) {
          if (i0 === i1 && i1 === i2) {
            pros.push(isEN
              ? '[★] Pure mono-ingredient (AAA) configuration, maximizing targeted ingredient yield for top recipes.'
              : '[★] 具備極品純色 AAA 食材配置，特定食材產量高度集中，為頂級食材專精配置。');
          } else if (i0 !== i1 && i1 === i2) {
            pros.push(isEN
              ? '[+] Dual-ingredient (ABB) configuration, excellent mid-to-late game specialized output.'
              : '[+] 具備強勢 ABB 雙色食材配置，二階與三階食材量產能力卓越。');
          } else if (i0 !== i1 && i1 !== i2 && i0 !== i2) {
            cons.push(isEN
              ? '[-] Split-ingredient (ABC) configuration, recipe ingredient dilution caps overall potential.'
              : '[-] 三格食材分散 (ABC 雜菜配置)，產出種類嚴重稀釋難以穩定供應主力食譜，評級上限受限於A級。');
          }
        }
      }
    }

    // 持有上限防溢滿診斷
    if (activeSubskills.indexOf('持有上限提升L') !== -1 || activeSubskills.indexOf('持有上限提升M') !== -1) {
      pros.push(isEN
        ? '[+] Active Inventory Up subskill prevents overnight inventory capping, sustaining ingredient and skill production.'
        : '[+] 具備已解鎖「持有上限提升」，大幅延長離線/睡眠產出時間，避免背包溢滿阻斷食材與技能。');
    }

    if (pros.length === 0) {
      pros.push(isEN
        ? '[*] Basic stats, suitable as a temporary placeholder.'
        : '[*] 數值平庸，適合作為過渡期日常隊伍替補成員。');
    }

    // 升級消耗計算
    const costTo30 = calculateMilestoneCost(currentLv, 30, nature);
    const costTo50 = calculateMilestoneCost(currentLv, 50, nature);
    const costTo60 = calculateMilestoneCost(currentLv, 60, nature);

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
      costs: {
        to30: costTo30,
        to50: costTo50,
        to60: costTo60
      }
    };
  }

  /* ─── 升級里程碑質變預測 (Milestone Leap Projections) ─────────── */
  function calculateMilestoneProjections(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval) {
    if (!pkmData || !currentEval) return [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    const milestones = [];
    const candidateLevels = [25, 30, 50, 75, 100];
    const slotLevels = [10, 25, 50, 75, 100];
    const isSlowpoke = isSlowpokeFamily(pkmData);

    candidateLevels.forEach(function(targetLv) {
      if (targetLv <= currentLv) return;

      let targetSkillName = '';
      let isKeyMilestone = false;
      let milestoneType = 'subskill';

      if (targetLv === 30) {
        if (isSlowpoke) {
          const hasTailLv30 = ingredients.length >= 2 && (ingredients[1] === '美味尾巴' || (ingredients[1] && ingredients[1].includes('尾巴')) || (ingredients[1] && ingredients[1].includes('Tail')));
          if (hasTailLv30) {
            targetSkillName = isEN ? 'Slowpoke Tail' : '美味尾巴';
            milestoneType = 'ingredient';
            isKeyMilestone = true;
          }
        } else if (ingredients.length >= 2 && ingredients[1]) {
          targetSkillName = window.I18N ? window.I18N.getIngredientName(ingredients[1]) : ingredients[1];
          milestoneType = 'ingredient';
        }
      }

      const slotIdx = slotLevels.indexOf(targetLv);
      if (slotIdx !== -1 && subskillArr[slotIdx]) {
        const skName = subskillArr[slotIdx];
        const isCore = ['樹果數量S', '幫手獎勵', '食材機率提升M', '技能機率提升M', '幫忙速度M', '持有上限提升L', 'Berry Finding S', 'Helping Bonus', 'Ingredient Finder M', 'Skill Trigger M', 'Helping Speed M', 'Inventory Up L'].indexOf(skName) !== -1;
        if (isCore) {
          targetSkillName = window.I18N ? window.I18N.getSubSkillName(skName) : skName;
          milestoneType = 'subskill';
          isKeyMilestone = true;
        } else if (!targetSkillName) {
          targetSkillName = window.I18N ? window.I18N.getSubSkillName(skName) : skName;
          milestoneType = 'subskill';
        }
      }

      if (!targetSkillName && !isKeyMilestone) return;

      const projEval = evaluateSingle(pkmData, targetLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false);
      if (!projEval) return;

      const scoreDiff = projEval.compositeScore - currentEval.compositeScore;
      if (scoreDiff >= 3 || projEval.grade !== currentEval.grade || isKeyMilestone) {
        const skillDisplay = targetSkillName || (isEN ? `Lv.${targetLv} Unlock` : `Lv.${targetLv} 解鎖`);
        const milestoneText = isEN
          ? `Recommended to prioritize Lv.${targetLv} to unlock "${skillDisplay}": rating leaps from ${currentEval.grade} (${currentEval.compositeScore} pts) to ${projEval.grade} (${projEval.compositeScore} pts)!`
          : `建議優先升至 Lv.${targetLv} 解鎖「${skillDisplay}」，評級將由 ${currentEval.grade} 級（${currentEval.compositeScore}分）質變躍升至 ${projEval.grade} 級（${projEval.compositeScore}分）！`;

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

  /* ─── 對外入口：雙軌評級與里程碑評定 (Dual-Track Appraisal API) ─────── */
  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel) {
    if (!pkmData) return null;
    currentLv = parseInt(currentLv, 10) || 30;

    const currentEval = evaluateSingle(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false);
    if (!currentEval) return null;

    const potentialEval = evaluateSingle(pkmData, 100, natureName, subskills, ingredients, ribbonLevel, skillLevel, true);
    const milestones = calculateMilestoneProjections(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    if (currentEval.diagnostics) {
      currentEval.diagnostics.milestones = milestones;
    }

    return Object.assign({}, currentEval, {
      current: currentEval,
      potential: potentialEval,
      currentScore: currentEval.compositeScore,
      currentGrade: currentEval.grade,
      potentialScore: potentialEval ? potentialEval.compositeScore : currentEval.compositeScore,
      potentialGrade: potentialEval ? potentialEval.grade : currentEval.grade,
      milestones: milestones,
      milestoneNote: milestones.length > 0 ? milestones[0].text : ''
    });
  }

  /* ─── 升級成本精算 ─────────────────────────────────────── */
  function calculateMilestoneCost(fromLv, targetLv, nature) {
    if (fromLv >= targetLv) {
      return { exp: 0, candies: 0, shards: 0, handyCandyS: 0, handyCandyM: 0 };
    }

    const startExp = EXP_MILESTONES[fromLv] || (fromLv * 100);
    const endExp = EXP_MILESTONES[targetLv] || (targetLv * 500);
    let expDiff = Math.max(endExp - startExp, 0);

    if (nature && nature.buffType === 'exp') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (nature && nature.debuffType === 'exp') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candiesNeeded = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shardsNeeded = Math.max(endShards - startShards, 0);

    return {
      exp: expDiff,
      candies: candiesNeeded,
      shards: shardsNeeded,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20)
    };
  }

  /* ─── 原生 SVG 六維雷達圖生成器 (完美對稱正規六邊形 + 頂點直接標註分數) ───────────────────────── */
  function renderRadarChartSVG(scores, width, height) {
    width = width || 340;
    height = height || 320;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta(isEN);
    const cx = width / 2;
    const cy = (height / 2) + 2;
    const r = Math.min(width, height) / 2 - (isCompact ? 34 : 58);

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
      return '<polygon points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
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
      const sideOffset = isCompact ? 6 : 10;

      if (i === 0) { // Top (樹果產能)
        lx = cx;
        ly = cy - r - (isCompact ? 16 : 22);
        textAnchor = 'middle';
      } else if (i === 1) { // Top-Right (食材產能)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 8);
        textAnchor = 'start';
      } else if (i === 2) { // Bottom-Right (技能強度)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 4);
        textAnchor = 'start';
      } else if (i === 3) { // Bottom (幫忙速度)
        lx = cx;
        ly = cy + r + (isCompact ? 14 : 18);
        textAnchor = 'middle';
      } else if (i === 4) { // Bottom-Left (後期成長)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 4);
        textAnchor = 'end';
      } else if (i === 5) { // Top-Left (資源效益)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 8);
        textAnchor = 'end';
      }

      const dotR = isCompact ? '3.5' : '4.5';
      const labelFontSize = isCompact ? '9.5' : '11.5';
      const scoreFontSize = isCompact ? '9' : '11';
      const scoreDy = isCompact ? '11' : '13';

      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + dotR + '" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan x="' + lx.toFixed(1) + '" dy="0" fill="var(--text-primary)" font-size="' + labelFontSize + '" font-weight="700">' + p.meta.label + '</tspan>' +
             '<tspan x="' + lx.toFixed(1) + '" dy="' + scoreDy + '" fill="#38bdf8" font-size="' + scoreFontSize + '" font-weight="800">' + p.score + (isEN ? ' pts' : ' 分') + '</tspan>' +
             '</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="auto" style="max-width:' + width + 'px; display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
  }

  /* ─── 診斷報告書彈窗管理 ───────────────────────────────── */
  function openAppraisalModal(pkmOrBoxItem) {
    if (!pkmOrBoxItem) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    let pkmData = null;
    let currentLv = pkmOrBoxItem.level || 30;
    let natureName = pkmOrBoxItem.nature || '坦率';
    let subskills = pkmOrBoxItem.subskills || [];
    let ingredients = pkmOrBoxItem.ingredients || [];
    let ribbonLevel = parseInt(pkmOrBoxItem.ribbon, 10) || 0;

    if (pkmOrBoxItem.pkm) {
      pkmData = pkmOrBoxItem.pkm;
    } else if (pkmOrBoxItem.name_cn) {
      pkmData = pkmOrBoxItem;
    } else if (window.allPokemons) {
      pkmData = window.allPokemons.find(function(p) { return p.name_cn === pkmOrBoxItem.name || p.id === pkmOrBoxItem.pkmId; });
    }

    let skillLevel = parseInt(pkmOrBoxItem.skillLevel || pkmOrBoxItem.skill_level || 1, 10) || 1;

    const evaluation = evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel);
    if (!evaluation) return;

    let modal = document.getElementById('modal-appraisal-report');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-appraisal-report';
      modal.className = 'appraisal-modal-backdrop';
      document.body.appendChild(modal);
    }

    const radarSVG = renderRadarChartSVG(evaluation.scores, 280);
    const SIX_DIM_META = getSixDimMeta(isEN);
    const displayName = isEN ? (pkmData.name_en || pkmData.name_cn) : (pkmData.name_cn || pkmData.name_en);
    const typeName = window.I18N ? window.I18N.getTypeName(pkmData.type) : pkmData.type;
    const specName = window.I18N ? window.I18N.getSpecialtyName(pkmData.specialty) : pkmData.specialty;
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    modal.innerHTML = `
      <div class="appraisal-modal-container">
        <!-- 頂部標題與關閉按鈕 -->
        <div class="appraisal-modal-header">
          <div class="appraisal-header-title-group">
            <span class="appraisal-modal-badge">${isEN ? '[★] Deep-Dive Diagnostic Report' : '[★] 深度能力診斷報告'}</span>
            <h2 class="appraisal-pokemon-title" style="display:flex;align-items:center;">
              ${displayName}
              ${!isEN && pkmData.name_en ? `<span class="appraisal-pokemon-en">${pkmData.name_en}</span>` : ''}
            </h2>
          </div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${isEN ? 'Close' : '關閉'}">[x]</button>
        </div>

        <!-- 報告核心主體 -->
        <div class="appraisal-modal-body">
          <!-- 左欄：寶可夢基本卡片與配置 -->
          <div class="appraisal-left-col">
            <div class="appraisal-profile-card">
              <div class="appraisal-avatar-wrapper">
                <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                <span class="appraisal-level-badge">Lv. ${currentLv}</span>
              </div>
              
              <div class="appraisal-specialty-row">
                <span class="appraisal-type-tag" style="display:inline-flex;align-items:center;gap:4px;">${window.I18N ? window.I18N.getTypeIconSvg(pkmData.type, 16) : ''} <span>${typeName} ${isEN ? 'Type' : '屬性'}</span></span>
                <span class="appraisal-spec-tag">${specName} ${isEN ? 'Specialty' : '專長'}</span>
              </div>

              <!-- 性格 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">${isEN ? '[*] Nature' : '[*] 性格'}</div>
                <div class="appraisal-nature-badge">${natDisplayName}</div>
              </div>

              <!-- 睡飽飽獎章 -->
              ${ribbonLevel > 0 ? `
                <div class="appraisal-config-section">
                  <div class="appraisal-config-title">${isEN ? 'Good-Night Ribbon' : '睡飽飽獎章'}</div>
                  <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;padding:4px 8px;border-radius:6px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:12px;font-weight:600;">
                    ${isEN ? `Tier ${ribbonLevel} (+${evaluation.ribbonBonus.carry} Carry${evaluation.ribbonBonus.speedDiscount > 0 ? ` · -${Math.round(evaluation.ribbonBonus.speedDiscount * 100)}% Speed` : ''})` : `第 ${ribbonLevel} 階段 (+${evaluation.ribbonBonus.carry} 持有${evaluation.ribbonBonus.speedDiscount > 0 ? ` · 幫速 -${Math.round(evaluation.ribbonBonus.speedDiscount * 100)}%` : ''})`}
                  </div>
                </div>
              ` : ''}

              <!-- 副技能清單 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">${isEN ? '[#] Configured Sub-Skills' : '[#] 已配置副技能'}</div>
                <div class="appraisal-subskills-list">
                  ${subskills && subskills.length > 0 ? subskills.map(function(s, idx) {
                    const rawName = typeof s === 'string' ? s : (s ? s.name : '');
                    const sName = window.I18N ? window.I18N.getSubSkillName(rawName) : rawName;
                    const levels = [10, 25, 50, 75, 100];
                    return rawName ? `<div class="appraisal-subskill-pill"><span class="subskill-lv-tag">Lv.${levels[idx]}</span> ${sName}</div>` : '';
                  }).join('') : `<span class="text-secondary text-sm">${isEN ? 'No sub-skills configured' : '無自訂副技能'}</span>`}
                </div>
              </div>
            </div>

            <!-- 雙軌綜合評級卡片 (當前實力 + 畢業潛力) -->
            <div class="appraisal-dual-verdict-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
              <!-- 當前實力 (Current Level Rating) -->
              <div class="appraisal-verdict-box appraisal-verdict-current" style="border:1.5px solid ${(evaluation.current || evaluation).gradeColor};background:rgba(15,23,42,0.65);border-radius:10px;padding:10px 8px;text-align:center;">
                <div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:4px;text-transform:uppercase;">${isEN ? `Current (Lv.${currentLv})` : `當前實力 (Lv.${currentLv})`}</div>
                <div class="appraisal-grade-large" style="color:${(evaluation.current || evaluation).gradeColor};font-size:30px;font-weight:900;line-height:1.1;">${(evaluation.current || evaluation).grade}</div>
                <div class="appraisal-grade-title" style="font-size:11px;margin:2px 0;color:${(evaluation.current || evaluation).gradeColor};">${(evaluation.current || evaluation).gradeTitle}</div>
                <div class="appraisal-composite-score" style="font-size:12px;color:#e2e8f0;"><span class="font-bold text-accent">${(evaluation.current || evaluation).compositeScore}</span> / 100</div>
              </div>
              <!-- 畢業潛力 (Lv.100 Potential Rating) - 較小且低調顏色 -->
              <div class="appraisal-verdict-box appraisal-verdict-potential" style="border:1px solid rgba(148,163,184,0.25);background:rgba(15,23,42,0.45);border-radius:10px;padding:8px;text-align:center;opacity:0.88;">
                <div style="font-size:10px;font-weight:600;color:#94a3b8;margin-bottom:3px;text-transform:uppercase;">${isEN ? 'Max Potential (Lv.100)' : '畢業潛力 (Lv.100)'}</div>
                <div class="appraisal-grade-large" style="color:#94a3b8;font-size:24px;font-weight:700;line-height:1.1;">${(evaluation.potential || evaluation).grade}</div>
                <div class="appraisal-grade-title" style="font-size:10px;margin:2px 0;color:#64748b;">${(evaluation.potential || evaluation).gradeTitle}</div>
                <div class="appraisal-composite-score" style="font-size:11px;color:#94a3b8;"><span class="font-bold">${(evaluation.potential || evaluation).compositeScore}</span> / 100</div>
              </div>
            </div>

            <!-- 升級里程碑質變預測 -->
            ${evaluation.milestones && evaluation.milestones.length > 0 ? `
              <div class="appraisal-milestones-card" style="margin-top:10px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:8px;padding:8px 10px;">
                <div style="font-size:11px;font-weight:700;color:#facc15;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
                  <span>[^]</span>
                  <span>${isEN ? 'Milestone Projections' : '升級里程碑質變預測'}</span>
                </div>
                ${evaluation.milestones.map(m => `<div style="font-size:11px;color:#e2e8f0;line-height:1.4;margin-bottom:3px;">${escapeHtml(m.text)}</div>`).join('')}
              </div>
            ` : ''}
          </div>

          <!-- 右欄：雷達圖 + 六維量表 + 深度點評 + 糖果升級試算 -->
          <div class="appraisal-right-col">
            <!-- 上半部：雷達圖與六維能量條 -->
            <div class="appraisal-chart-flex">
              <div class="appraisal-radar-wrapper">
                ${radarSVG}
              </div>

              <div class="appraisal-scores-breakdown">
                <h4 class="appraisal-section-heading">${isEN ? '[*] 6-Dimension Quantitative Analysis' : '[*] 六維能力量化分析'}</h4>
                ${SIX_DIM_META.map(function(m) {
                  const score = evaluation.scores[m.key] || 0;
                  return `
                    <div class="appraisal-dim-row" title="${m.desc}">
                      <div class="appraisal-dim-label">
                        <span>${m.icon} ${m.label}</span>
                        <span class="font-bold text-white">${score} ${isEN ? 'pts' : '分'}</span>
                      </div>
                      <div class="appraisal-dim-bar-bg">
                        <div class="appraisal-dim-bar-fill" style="width: ${score}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 中半部：專長深度點評與優缺點 -->
            <div class="appraisal-analysis-card">
              <h4 class="appraisal-section-heading">${isEN ? '[*] Specialty, Nature & Sub-Skill Synergy Analysis' : '[*] 專長與性格副技能協同點評'}</h4>
              
              <div class="appraisal-pros-list">
                ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
              </div>

              ${evaluation.cons.length > 0 ? `
                <div class="appraisal-cons-list">
                  ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- 下半部：關鍵里程碑升級消耗試算 -->
            <div class="appraisal-costs-card">
              <h4 class="appraisal-section-heading">${isEN ? `[*] Milestone Investment Calculator (Lv.${currentLv})` : `[*] 培育成本精算 (當前 Lv.${currentLv})`}</h4>
              <div class="appraisal-costs-grid">
                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '[Lv.30] Reach Lv. 30' : '[Lv.30] 升至 Lv. 30'} <span class="cost-milestone-sub">${isEN ? '(Unlock 2nd Ingredient)' : '(解鎖第 2 食材)'}</span></div>
                  ${currentLv >= 30 ? `<div class="cost-achieved">${isEN ? '[✓] Completed' : '[✓] 已達成'}</div>` : `
                    <div class="cost-detail-row">${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to30.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to30.handyCandyS} / M: ${evaluation.costs.to30.handyCandyM})</div>
                    <div class="cost-detail-row">${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to30.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '[Lv.50] Reach Lv. 50' : '[Lv.50] 升至 Lv. 50'} <span class="cost-milestone-sub">${isEN ? '(Unlock 3rd Sub-Skill)' : '(解鎖第 3 副技能)'}</span></div>
                  ${currentLv >= 50 ? `<div class="cost-achieved">${isEN ? '[✓] Completed' : '[✓] 已達成'}</div>` : `
                    <div class="cost-detail-row">${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to50.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to50.handyCandyS} / M: ${evaluation.costs.to50.handyCandyM})</div>
                    <div class="cost-detail-row">${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to50.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '[Lv.60] Reach Lv. 60' : '[Lv.60] 升至 Lv. 60'} <span class="cost-milestone-sub">${isEN ? '(Unlock 3rd Ingredient Max)' : '(解鎖第 3 食材完全體)'}</span></div>
                  ${currentLv >= 60 ? `<div class="cost-achieved">${isEN ? '[✓] Completed' : '[✓] 已達成'}</div>` : `
                    <div class="cost-detail-row">${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to60.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to60.handyCandyS} / M: ${evaluation.costs.to60.handyCandyM})</div>
                    <div class="cost-detail-row">${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to60.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex'; if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
    document.body.style.overflow = 'hidden';
  }

  function closeAppraisalModal() {
    const modal = document.getElementById('modal-appraisal-report');
    if (!modal) return;
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      document.body.style.overflow = '';
    };
    if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(modal, done);
    else { modal.style.display = 'none'; done(); }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  let labState = {
    selectedBoxUid: '',
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: [],
    ribbon: 0,
    nickname: '',
    isCustomized: false
  };

  function loadBoxItem(item) {
    if (!item) return;
    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const pkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; }) || pokemons[0];

    labState.selectedBoxUid = item.uid;
    labState.selectedPkmId = pkm ? pkm.id : '1';
    labState.level = item.level || 30;
    labState.nature = item.nature || '坦率';

    const rawSubs = Array.isArray(item.subskills) ? item.subskills.slice(0, 5) : [];
    while (rawSubs.length < 5) rawSubs.push('');
    labState.subskills = rawSubs;

    labState.ingredients = [item.ing1, item.ing2, item.ing3].filter(Boolean);
    labState.ribbon = parseInt(item.ribbon, 10) || 0;
    labState.nickname = item.nickname || '';
    labState.isCustomized = false;
  }

  function onBoxItemSelect(uid) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!uid) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.isCustomized = false;
      updateLabUI();
      return;
    }
    const item = userBox.find(function (p) { return p.uid === uid; });
    if (item) {
      loadBoxItem(item);
      updateLabUI();
    }
  }

  function resetToBoxOriginal() {
    if (!labState.selectedBoxUid) return;
    onBoxItemSelect(labState.selectedBoxUid);
  }

  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    
    if (pokemons.length === 0) {
      targetElement.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">${isEN ? 'Loading Pokédex data...' : '載入圖鑑資料中...'}</div>`;
      return;
    }

    // 若有選中 boxUid 但該物品已不存在，重置為自訂模式
    if (labState.selectedBoxUid && !userBox.some(function (p) { return p.uid === labState.selectedBoxUid; })) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.isCustomized = false;
    }

    const currentPkm = pokemons.find(function (p) { return p.id === labState.selectedPkmId; }) || pokemons[0];
    const natures = (window.UserBox && window.UserBox.NATURE_DATA) || [];
    const subskillPool = (window.UserBox && window.UserBox.SUBSKILLS_DATA) || [];

    const evaluation = evaluatePokemon(currentPkm, labState.level, labState.nature, labState.subskills, labState.ingredients, labState.ribbon);
    const radarSVG = evaluation ? renderRadarChartSVG(evaluation.scores, 340, 310) : '';
    const displayName = isEN ? (currentPkm.name_en || currentPkm.name_cn) : currentPkm.name_cn;
    const typeName = window.I18N ? window.I18N.getTypeName(currentPkm.type) : currentPkm.type;
    const specName = window.I18N ? window.I18N.getSpecialtyName(currentPkm.specialty) : currentPkm.specialty;

    // 睡飽飽獎章動態效果文案 (依據寶可夢進化次數)
    const ribbonEvos = getRemainingEvolutions(currentPkm);
    let ribbonOpt2 = isEN ? '500 hrs (+3 Carry)' : '500 小時 (+3 持有上限)';
    let ribbonOpt3 = isEN ? '1000 hrs (+6 Carry)' : '1000 小時 (+6 持有上限)';
    let ribbonOpt4 = isEN ? '2000 hrs (+8 Carry)' : '2000 小時 (+8 持有上限)';
    if (ribbonEvos === 2) {
      ribbonOpt2 = isEN ? '500 hrs (+3 Carry · Speed -11%)' : '500 小時 (+3 持有上限 · 幫速加成 -11%)';
      ribbonOpt4 = isEN ? '2000 hrs (+8 Carry · Speed -25%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -25%)';
    } else if (ribbonEvos === 1) {
      ribbonOpt2 = isEN ? '500 hrs (+3 Carry · Speed -5%)' : '500 小時 (+3 持有上限 · 幫速加成 -5%)';
      ribbonOpt4 = isEN ? '2000 hrs (+8 Carry · Speed -12%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -12%)';
    }

    targetElement.innerHTML = `
      <div class="appraisal-lab-seamless-view">
        <!-- 1. 倉庫快速選取區 (User Box Linkage) -->
        <div class="lab-control-group lab-box-linkage-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label for="lab-box-select" class="lab-control-label font-bold text-accent">
              ${isEN ? 'Select from My Box:' : '從我的倉庫選取：'}
            </label>
            ${labState.selectedBoxUid && labState.isCustomized ? `
              <button type="button" class="lab-box-reset-btn" onclick="window.AppraisalLab.resetToBoxOriginal()" title="${isEN ? 'Reset to Box Stats' : '重置為倉庫原始數值'}">
                ${isEN ? '[R] Reset' : '[R] 重置原始數值'}
              </button>
            ` : ''}
          </div>

          <select id="lab-box-select" class="lab-select lab-box-select" onchange="window.AppraisalLab.onBoxItemSelect(this.value)">
            <option value="" ${!labState.selectedBoxUid ? 'selected' : ''}>${isEN ? '[+] Custom Simulation (Select Any Species)' : '[+] 自訂模擬 (自由挑選物種)'}</option>
            ${userBox.map(function (item) {
              const bPkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; });
              const pDisplayName = isEN ? (bPkm ? (bPkm.name_en || bPkm.name_cn) : item.name) : item.name;
              const nickText = item.nickname ? `${item.nickname} (${pDisplayName})` : pDisplayName;
              const natText = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
              return '<option value="' + item.uid + '" ' + (labState.selectedBoxUid === item.uid ? 'selected' : '') + '>Lv.' + (item.level || 1) + ' ' + escapeHtml(nickText) + ' · ' + natText + '</option>';
            }).join('')}
          </select>

          ${userBox.length > 0 ? `
            <div class="lab-box-chips-scroll">
              <button type="button" class="lab-box-chip ${!labState.selectedBoxUid ? 'active' : ''}" onclick="window.AppraisalLab.onBoxItemSelect('')">
                <span class="lab-box-chip-name">${isEN ? '[+] Custom' : '[+] 自訂模擬'}</span>
              </button>
              ${userBox.map(function (item) {
                const bPkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; });
                const pDisplayName = isEN ? (bPkm ? (bPkm.name_en || bPkm.name_cn) : item.name) : item.name;
                const avatarUrl = (bPkm && (bPkm.icon_url || bPkm.icon)) || (bPkm && bPkm.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${bPkm.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
                const isSelected = labState.selectedBoxUid === item.uid;
                return `
                  <button type="button" class="lab-box-chip ${isSelected ? 'active' : ''}" onclick="window.AppraisalLab.onBoxItemSelect('${item.uid}')" title="${escapeHtml(item.nickname || pDisplayName)}">
                    <img src="${avatarUrl}" class="lab-box-chip-icon" alt="${escapeHtml(item.name)}" loading="lazy">
                    <span class="lab-box-chip-name">${escapeHtml(item.nickname || pDisplayName)}</span>
                    <span class="lab-box-chip-lv">Lv.${item.level || 1}</span>
                  </button>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="lab-box-empty-hint">${isEN ? 'Tip: Register Pokémon in Box tab to evaluate your personal collection here!' : '提示：在【寶可夢倉庫】新增登錄寶可夢後，即可在此一鍵選取並評測你的專屬寶可夢！'}</div>
          `}
        </div>

        <div class="appraisal-lab-layout">
          <!-- 自訂配置控制器 -->
          <div class="appraisal-lab-controls">
            <!-- 寶可夢物種選擇 -->
            <div class="lab-control-group">
              <label for="lab-pkm-select" class="lab-control-label">${isEN ? 'Select Pokémon Species:' : '選擇寶可夢物種：'}</label>
              <select id="lab-pkm-select" class="lab-select" onchange="window.AppraisalLab.onPkmChange(this.value)">
                ${pokemons.map(function (p) {
                  const pName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
                  const pSpec = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : p.specialty;
                  const pType = window.I18N ? window.I18N.getTypeName(p.type) : p.type;
                  return '<option value="' + p.id + '" ' + (p.id === labState.selectedPkmId ? 'selected' : '') + '>#' + p.formatted_no + ' ' + pName + ' (' + pSpec + ' / ' + pType + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 等級滑桿 (支援 1 ~ 100) -->
            <div class="lab-control-group">
              <label for="lab-level-slider" class="lab-control-label">
                ${isEN ? 'Training Level:' : '培育等級：'}<span class="font-bold text-accent">Lv. ${labState.level}</span>
              </label>
              <input type="range" id="lab-level-slider" min="1" max="100" value="${labState.level}" step="1" class="lab-slider" oninput="window.AppraisalLab.onLevelChange(this.value)">
            </div>

            <!-- 性格選擇 -->
            <div class="lab-control-group">
              <label for="lab-nature-select" class="lab-control-label">${isEN ? 'Nature Setting:' : '性格設定：'}</label>
              <select id="lab-nature-select" class="lab-select" onchange="window.AppraisalLab.onNatureChange(this.value)">
                ${natures.map(function (n) {
                  const nName = window.I18N ? window.I18N.getNatureName(n.name) : n.name;
                  return '<option value="' + n.name + '" ' + (n.name === labState.nature ? 'selected' : '') + '>' + nName + ' (' + n.buff + ' / ' + n.debuff + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 睡飽飽獎章選擇 -->
            <div class="lab-control-group">
              <label for="lab-ribbon-select" class="lab-control-label" style="display:flex;align-items:center;gap:6px;">
                ${isEN ? 'Good-Night Ribbon:' : '睡飽飽獎章：'}
                ${labState.ribbon > 0 ? `<img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${labState.ribbon}.png" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="Ribbon" />` : ''}
              </label>
              <select id="lab-ribbon-select" class="lab-select" onchange="window.AppraisalLab.onRibbonChange(this.value)">
                <option value="0" ${labState.ribbon === 0 ? 'selected' : ''}>${isEN ? 'None (0h)' : '未佩戴 (0h)'}</option>
                <option value="1" data-icon="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv1.png" ${labState.ribbon === 1 ? 'selected' : ''}>${isEN ? '200 hrs (+1 Carry Limit)' : '200 小時 (+1 持有上限)'}</option>
                <option value="2" data-icon="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv2.png" ${labState.ribbon === 2 ? 'selected' : ''}>${ribbonOpt2}</option>
                <option value="3" data-icon="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv3.png" ${labState.ribbon === 3 ? 'selected' : ''}>${ribbonOpt3}</option>
                <option value="4" data-icon="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv4.png" ${labState.ribbon === 4 ? 'selected' : ''}>${ribbonOpt4}</option>
              </select>
            </div>

            <!-- 5 個副技能槽位選擇 (Lv.10, 25, 50, 75, 100) -->
            <div class="lab-control-group">
              <label class="lab-control-label">${isEN ? 'Sub-Skill Setup (Lv.10, 25, 50, 75, 100):' : '副技能配置 (Lv.10, 25, 50, 75, 100)：'}</label>
              <div class="lab-subskills-picker">
                ${[10, 25, 50, 75, 100].map(function (lv, idx) {
                  return '<div class="lab-subskill-slot"><span class="slot-lv-label">Lv.' + lv + '</span><select class="lab-select-subskill" onchange="window.AppraisalLab.onSubskillChange(' + idx + ', this.value)"><option value="">' + (isEN ? '(None)' : '(無)') + '</option>' +
                    subskillPool.map(function (s) {
                      const sDisplayName = window.I18N ? window.I18N.getSubSkillName(s.name) : s.name;
                      return '<option value="' + s.name + '" ' + (labState.subskills[idx] === s.name ? 'selected' : '') + '>' + sDisplayName + '</option>';
                    }).join('') + '</select></div>';
                }).join('')}
              </div>
            </div>
          </div>

          <!-- 即時評測展示 (簡介 + 六邊形雷達圖 + 下方評語) -->
          <div class="appraisal-lab-preview">
            <div class="lab-preview-header">
              <div class="lab-preview-pokemon-info">
                <img src="${currentPkm.icon_url}" class="lab-preview-icon" alt="${displayName}">
                <div>
                  <div class="lab-preview-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="lab-preview-name">${displayName}</span>
                    ${labState.selectedBoxUid && labState.nickname ? `
                      <span class="lab-nickname-tag">${escapeHtml(labState.nickname)}</span>
                    ` : ''}
                    ${labState.ribbon > 0 ? `
                      <span class="lab-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${labState.ribbon}` : `睡飽飽獎章`}" style="display:inline-flex;align-items:center;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${labState.ribbon}.png" class="lab-ribbon-icon" alt="Ribbon" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" />
                      </span>
                    ` : ''}
                    ${labState.selectedBoxUid ? (labState.isCustomized ? `
                      <span class="lab-sim-tag" style="background:rgba(234,179,8,0.18); color:#facc15; border:1px solid rgba(234,179,8,0.35); font-size:11px; padding:1px 6px; border-radius:4px; font-weight:600;">${isEN ? 'Simulating' : '模擬調校中'}</span>
                    ` : `
                      <span class="lab-inbox-tag" style="background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-size:11px; padding:1px 6px; border-radius:4px; font-weight:600;">${isEN ? 'In Box' : '倉庫實體'}</span>
                    `) : ''}
                  </div>
                  <div class="lab-preview-spec" style="display:flex;align-items:center;gap:4px;">
                    ${window.I18N ? window.I18N.getTypeIconSvg(currentPkm.type, 15) : ''} 
                    <span>${isEN ? `${typeName} · ${specName}` : `${currentPkm.type}屬性 · ${currentPkm.specialty}專長`} · Lv.${labState.level}</span>
                  </div>
                </div>
              </div>

              <div class="lab-preview-dual-verdict" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
                <div class="lab-preview-verdict lab-verdict-cur" style="border-color: ${(evaluation.current || evaluation).gradeColor}; color: ${(evaluation.current || evaluation).gradeColor}; padding:4px 8px; border-radius:8px; text-align:center;">
                  <span style="font-size:10px;display:block;color:#94a3b8;font-weight:700;">${isEN ? `Current Lv.${labState.level}` : `當前 Lv.${labState.level}`}</span>
                  <span class="lab-grade-char" style="font-size:20px;line-height:1.1;">${(evaluation.current || evaluation).grade}</span>
                  <span style="font-size:11px;font-weight:700;display:block;">${(evaluation.current || evaluation).compositeScore} ${isEN ? 'pts' : '分'}</span>
                </div>
                <div class="lab-preview-verdict lab-verdict-pot" style="border: 1px solid rgba(148,163,184,0.25); color: #94a3b8; background: rgba(148,163,184,0.08); padding:3px 6px; border-radius:6px; text-align:center; opacity:0.88;">
                  <span style="font-size:9px;display:block;color:#64748b;font-weight:600;">${isEN ? 'Potential Lv.100' : '滿級潛力 Lv.100'}</span>
                  <span class="lab-grade-char" style="font-size:16px;line-height:1.1;color:#94a3b8;">${(evaluation.potential || evaluation).grade}</span>
                  <span style="font-size:10px;font-weight:600;display:block;color:#94a3b8;">${(evaluation.potential || evaluation).compositeScore} ${isEN ? 'pts' : '分'}</span>
                </div>
              </div>
            </div>

            <!-- 六邊形能力圖 (標題與分數直接印在各頂點) -->
            <div class="lab-chart-container">
              ${radarSVG}
            </div>

            <!-- 下方的深度診斷評語與升級里程碑預測 -->
            <div class="lab-pros-box">
              ${evaluation.pros.map(function (p) { return '<div class="lab-bullet-item">' + p + '</div>'; }).join('')}
            </div>

            ${evaluation.milestones && evaluation.milestones.length > 0 ? `
              <div class="lab-milestones-box" style="margin-top:10px;background:rgba(234,179,8,0.08);border:1px solid rgba(234,179,8,0.3);border-radius:8px;padding:8px 12px;">
                <div style="font-size:11px;font-weight:700;color:#facc15;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
                  <span>[^]</span>
                  <span>${isEN ? 'Level-Up Milestone Projections' : '升級里程碑質變預測'}</span>
                </div>
                ${evaluation.milestones.map(m => `<div style="font-size:11px;color:#e2e8f0;line-height:1.4;margin-bottom:3px;">${escapeHtml(m.text)}</div>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function onPkmChange(pkmId) {
    labState.selectedPkmId = pkmId;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onLevelChange(val) {
    labState.level = parseInt(val, 10) || 30;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onNatureChange(nature) {
    labState.nature = nature;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onRibbonChange(val) {
    labState.ribbon = parseInt(val, 10) || 0;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onSubskillChange(idx, val) {
    labState.subskills[idx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function updateLabUI() {
    const container = document.getElementById('appraisal-lab-container');
    if (container) {
      renderAppraisalLabContainer(container);
    }
  }

  /* ─── 全域導出 ─────────────────────────────────────────── */
  window.AppraisalLab = {
    isBfsSkillSpecialist: isBfsSkillSpecialist,
    isHealerSkillSpecialist: isHealerSkillSpecialist,
    isHelperBoostSkillSpecialist: isHelperBoostSkillSpecialist,
    isChargeStrengthSkillSpecialist: isChargeStrengthSkillSpecialist,
    isSlowpokeFamily: isSlowpokeFamily,
    isSlakingFamily: isSlakingFamily,
    evaluateSingle: evaluateSingle,
    calculateMilestoneProjections: calculateMilestoneProjections,
    evaluatePokemon: evaluatePokemon,
    getRemainingEvolutions: getRemainingEvolutions,
    getRibbonBonus: getRibbonBonus,
    renderRadarChartSVG: renderRadarChartSVG,
    calculateMilestoneCost: calculateMilestoneCost,
    openModal: openAppraisalModal,
    closeModal: closeAppraisalModal,
    renderLab: renderAppraisalLabContainer,
    loadBoxItem: loadBoxItem,
    onBoxItemSelect: onBoxItemSelect,
    resetToBoxOriginal: resetToBoxOriginal,
    onPkmChange: onPkmChange,
    onLevelChange: onLevelChange,
    onNatureChange: onNatureChange,
    onRibbonChange: onRibbonChange,
    onSubskillChange: onSubskillChange,
    toggleLab: function () {
      const container = document.getElementById('appraisal-lab-container');
      if (container) {
        const isHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
        const willOpen = isHidden;
        container.style.display = willOpen ? 'block' : 'none';
        if (willOpen) {
          renderAppraisalLabContainer(container);
        }
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('pksleep_active_box_subtab', willOpen ? 'lab' : 'list');
          }
          const desktopLabBtn = document.getElementById('box-appraisal-lab-btn');
          if (desktopLabBtn) {
            desktopLabBtn.classList.toggle('active', willOpen);
          }
          if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
            const curHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
            const mainPart = curHash.split(/[/_?]/)[0];
            if (mainPart === 'box' || !mainPart) {
              window.history.replaceState(null, '', willOpen ? '#box/lab' : '#box');
            }
          }
        } catch (e) {}
      }
    }
  };

  // 全域別名
  window.openAppraisalModal = openAppraisalModal;
  window.closeAppraisalModal = closeAppraisalModal;

})();