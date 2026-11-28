  /* ─── 評測引擎性格兜底表與優缺點診斷輔助函式 ───────────────── */
const _FALLBACK_LAB_NATURE_DICT = {
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

  function _buildLabDiagnostics(ctx) {
    const {
      activeSubskills, isBerryBurst, isHelper, isHealer, isCharge, isSlaking,
      isExtraTasty, isPotExpander, isDreamShard, pkmName, specialty, nature,
      isSlowpoke, ingredients, hasSkillM, hasSkillS, pkmData, skillLevel,
      natureName, natDisplayName, isMint, ribbonBonus, remainingEvos,
      currentLv, isLegendary, isIngSkill, isMetronome
    } = ctx;
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
    return { pros, cons };
  }
