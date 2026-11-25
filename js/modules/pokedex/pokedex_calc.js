function getPokedexMainSkillYield(mainSkillName, skillLevel, dailyTriggers) {
  const s = mainSkillName || '';
  const lvl = parseInt(skillLevel, 10) || 1;
  const lvlIdx = Math.max(0, lvl - 1);
  const tr = (key, params) => {
    const res = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function')
      ? window.I18N.t(key, params)
      : undefined;
    return typeof res === 'string' ? res : key;
  };
  let label = s
    ? ((typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function') ? window.I18N.getMainSkillName(s) : s)
    : tr('dex.ui_main_skill_default');
  let singleVal = 0;
  let singleText = '';
  let valueText = '';
  let dailyTotal = 0;

  // 1. 健美 (食材獲取S + 料理成功S)
  if (s.includes('健美') || s.includes('料理輔助') || s.includes('Bulk Up') || s.includes('Cooking Support')) {
    const ingTable = [6, 8, 11, 14, 17, 21, 24];
    const tastyTable = [1, 2, 2, 3, 3, 4, 5];
    const ingVal = ingTable[Math.min(lvlIdx, ingTable.length - 1)];
    const tastyVal = tastyTable[Math.min(lvlIdx, tastyTable.length - 1)];
    const dailyIng = dailyTriggers * ingVal;
    const dailyTasty = dailyTriggers * tastyVal;
    dailyTotal = dailyIng;
    label = tr('dex.ui_sy_bulk_up_lbl');
    valueText = tr('dex.ui_sy_bulk_up_val', { ing: dailyIng.toFixed(1), tasty: dailyTasty.toFixed(1) });
    singleText = tr('dex.ui_sy_bulk_up_sgl', { ing: ingVal, tasty: tastyVal });
  }
  // 1b. 魔法火焰 (料理強化S + 料理成功S)
  else if (s.includes('魔法火焰') || s.includes('料理躍進') || s.includes('Mystical Fire') || s.includes('Cooking Advance')) {
    const potTable = [7, 10, 12, 17, 22, 27, 31];
    const tastyTable = [1, 2, 2, 3, 3, 4, 5];
    const potVal = potTable[Math.min(lvlIdx, potTable.length - 1)];
    const tastyVal = tastyTable[Math.min(lvlIdx, tastyTable.length - 1)];
    const dailyPot = dailyTriggers * potVal;
    const dailyTasty = dailyTriggers * tastyVal;
    dailyTotal = dailyPot;
    label = tr('dex.ui_sy_mystical_fire_lbl');
    valueText = tr('dex.ui_sy_mystical_fire_val', { pot: dailyPot.toFixed(1), tasty: dailyTasty.toFixed(1) });
    singleText = tr('dex.ui_sy_mystical_fire_sgl', { pot: potVal, tasty: tastyVal });
  }
  // 2. 正電
  else if (s.includes('正電') || s.includes('Plus')) {
    const table = [5, 7, 9, 12, 14, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_plus_lbl');
    valueText = tr('dex.ui_sy_extra_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_plus_sgl', { val: singleVal });
  }
  // 3. 禮物
  else if (s.includes('禮物') || s.includes('Present')) {
    const table = [4, 6, 8, 11, 13, 15, 17];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_present_lbl');
    valueText = tr('dex.ui_sy_extra_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_present_sgl', { val: singleVal });
  }
  // 4. 食材獲取S
  else if (s.includes('食材獲取') || s.includes('Ingredient Magnet')) {
    const table = [6, 8, 11, 14, 17, 21, 24];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_magnet_s_lbl');
    valueText = tr('dex.ui_sy_extra_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_ings_sgl', { val: singleVal });
  }
  // 5. 怪力鉗
  else if (s.includes('怪力鉗') || s.includes('怪力钳') || s.includes('Hyper Cutter')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_hyper_cutter_lbl');
    valueText = tr('dex.ui_sy_selected_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_hyper_cutter_sgl', { val: singleVal });
  }
  // 6. 超幸運
  else if (s.includes('超幸運') || s.includes('Super Luck')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_super_luck_lbl');
    valueText = tr('dex.ui_sy_selected_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_super_luck_sgl', { val: singleVal });
  }
  // 7. 食材精選S
  else if (s.includes('食材精選') || s.includes('Ingredient Draw')) {
    const table = [5, 6, 8, 11, 13, 16, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_draw_s_lbl');
    valueText = tr('dex.ui_sy_selected_ings_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_ings_sgl', { val: singleVal });
  }
  // 8. 精神擊破
  else if (s.includes('精神擊破') || s.includes('Psystrike')) {
    const table = [2640, 3753, 5178, 7149, 9870, 13638, 18515];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_psystrike_lbl');
    valueText = tr('dex.ui_sy_psystrike_val', { val: Math.round(dailyTotal).toLocaleString() });
    singleText = tr('dex.ui_sy_psystrike_sgl', { val: singleVal.toLocaleString() });
  }
  // 9. 能量填充M / 夢魘
  else if (s.includes('能量填充M') || s.includes('Charge Str. M') || s.includes('Charge Strength M') || s.includes('夢魘') || s.includes('Bad Dreams')) {
    const isBadDreams = s.includes('夢魘') || s.includes('Bad Dreams');
    const table = isBadDreams ? [2640, 3753, 5178, 7149, 9870, 13638, 18515] : [880, 1251, 1726, 2383, 3290, 4546, 6409];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isBadDreams ? tr('dex.ui_sy_bad_dreams_lbl') : tr('dex.ui_sy_charge_m_lbl');
    valueText = tr('dex.ui_sy_str_val', { val: Math.round(dailyTotal).toLocaleString() });
    singleText = tr('dex.ui_sy_str_sgl', { val: singleVal.toLocaleString() });
  }
  // 10. 能量填充S / 蓄力
  else if (s.includes('能量填充S') || s.includes('Charge Str. S') || s.includes('Charge Strength S') || s.includes('蓄力') || s.includes('Stockpile')) {
    if (s.includes('隨機') || s.includes('Random')) {
      const table = [500, 712, 982, 1354, 1870, 2583, 4015];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = tr('dex.ui_sy_charge_s_rand_lbl');
      valueText = tr('dex.ui_sy_charge_s_rand_val', { val: Math.round(dailyTotal).toLocaleString() });
      singleText = tr('dex.ui_sy_charge_s_rand_sgl', { val: singleVal.toLocaleString() });
    } else if (s.includes('蓄力') || s.includes('Stockpile')) {
      const table = [600, 853, 1177, 1625, 2243, 3099, 4502];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = tr('dex.ui_sy_stockpile_lbl');
      valueText = tr('dex.ui_sy_stockpile_val', { val: Math.round(dailyTotal).toLocaleString() });
      singleText = tr('dex.ui_sy_stockpile_sgl', { val: singleVal.toLocaleString() });
    } else {
      const table = [400, 569, 785, 1083, 1496, 2066, 3212];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = tr('dex.ui_sy_charge_s_lbl');
      valueText = tr('dex.ui_sy_str_val', { val: Math.round(dailyTotal).toLocaleString() });
      singleText = tr('dex.ui_sy_str_sgl', { val: singleVal.toLocaleString() });
    }
  }
  // 11. 新月祈禱
  else if (s.includes('新月祈禱') || s.includes('Lunar Prayer')) {
    const table = [3, 4, 5, 7, 9, 11];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_lunar_prayer_lbl');
    valueText = tr('dex.ui_sy_lunar_prayer_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_lunar_prayer_sgl', { val: singleVal });
  }
  // 12. 樹果汁
  else if (s.includes('樹果汁') || s.includes('Berry Juice')) {
    const table = [5, 7, 9, 11, 15, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_berry_juice_lbl');
    valueText = tr('dex.ui_sy_team_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_berry_juice_sgl', { val: singleVal });
  }
  // 13. 活力全體療癒S
  else if (s.includes('活力全體療癒') || s.includes('Energy for Everyone')) {
    const table = [5, 7, 9, 11, 15, 18];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_e4e_s_lbl');
    valueText = tr('dex.ui_sy_team_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_heal_pts_sgl', { val: singleVal });
  }
  // 14. 月光
  else if (s.includes('月光') || s.includes('Moonlight')) {
    const table = [12, 16, 21, 26, 33, 43];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_moonlight_lbl');
    valueText = tr('dex.ui_sy_self_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_moonlight_sgl', { val: singleVal });
  }
  // 15. 活力充填S
  else if (s.includes('活力充填') || s.includes('活力填充') || s.includes('Charge Energy')) {
    const table = [12, 16, 21, 26, 33, 43];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_charge_ene_s_lbl');
    valueText = tr('dex.ui_sy_self_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_heal_pts_sgl', { val: singleVal });
  }
  // 16. 治癒波動
  else if (s.includes('治癒波動') || s.includes('Heal Pulse')) {
    const table = [6, 8, 11, 14, 18, 22];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal * 2;
    label = tr('dex.ui_sy_heal_pulse_lbl');
    valueText = tr('dex.ui_sy_heal_pulse_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_heal_pulse_sgl', { val: singleVal });
  }
  // 17. 蹭蹭臉頰
  else if (s.includes('蹭蹭臉頰') || s.includes('Nuzzle')) {
    const table = [9, 12, 16, 20, 26, 35];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_nuzzle_lbl');
    valueText = tr('dex.ui_sy_ally_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_nuzzle_sgl', { val: singleVal });
  }
  // 18. 活力療癒S
  else if (s.includes('活力療癒') || s.includes('Energizing Cheer')) {
    const table = [12, 15, 20, 25, 33, 44];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_cheer_s_lbl');
    valueText = tr('dex.ui_sy_ally_ene_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_heal_pts_sgl', { val: singleVal });
  }
  // 19. 幫手加速
  else if (s.includes('幫手加速') || s.includes('Helper Boost')) {
    const table = [6, 7, 8, 9, 10, 11];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    const hbTw = s.includes('（') ? s : '幫手加速';
    label = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.pick === 'function')
      ? window.I18N.pick({ 'zh-TW': hbTw, 'en-US': 'Helper Boost' })
      : hbTw;
    valueText = tr('dex.ui_sy_helper_boost_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_helper_boost_sgl', { val: singleVal });
  }
  // 20. 幫手支援S
  else if (s.includes('幫手支援') || s.includes('Extra Helpful')) {
    const table = [6, 7, 8, 9, 10, 11, 12];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_extra_helpful_lbl');
    valueText = tr('dex.ui_sy_extra_helpful_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_helps_sgl', { val: singleVal });
  }
  // 21. 樹果遽增 / 流星群 / 畫皮 (excluding 精神擊破)
  else if (s.includes('樹果遽增') || s.includes('Berry Burst') || s.includes('流星群') || s.includes('Draco Meteor') || s.includes('畫皮') || s.includes('Disguise')) {
    const isMimikyu = s.includes('畫皮') || s.includes('Disguise');
    const isDraco = s.includes('流星群') || s.includes('Draco Meteor');
    const table = isMimikyu ? [12, 18, 23, 29, 35, 41] : [15, 22, 29, 36, 43, 50];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = isMimikyu ? tr('dex.ui_sy_disguise_lbl') : (isDraco ? tr('dex.ui_sy_draco_meteor_lbl') : tr('dex.ui_sy_berry_burst_lbl'));
    valueText = tr('dex.ui_sy_extra_berries_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_approx_berries_sgl', { val: singleVal });
  }
  // 22. 波導彈
  else if (s.includes('波導彈') || s.includes('Aura Sphere')) {
    const shardTable = [240, 340, 480, 670, 920, 1260, 1800, 2500];
    const strTable = [200, 280, 396, 552, 758, 1038, 1482, 2042];
    const singleShard = shardTable[Math.min(lvlIdx, shardTable.length - 1)];
    const singleStr = strTable[Math.min(lvlIdx, strTable.length - 1)];
    const dailyShard = dailyTriggers * singleShard;
    const dailyStr = dailyTriggers * singleStr;
    dailyTotal = dailyShard;
    label = tr('dex.ui_sy_aura_sphere_lbl');
    valueText = tr('dex.ui_sy_aura_sphere_val', { shards: Math.round(dailyShard).toLocaleString(), str: Math.round(dailyStr).toLocaleString() });
    singleText = tr('dex.ui_sy_aura_sphere_sgl', { shards: singleShard.toLocaleString(), str: singleStr.toLocaleString() });
  }
  // 23. 夢之碎片獲取S
  else if (s.includes('夢之碎片') || s.includes('Dream Shard')) {
    if (s.includes('隨機') || s.includes('Random')) {
      const table = [300, 425, 600, 838, 1150, 1575, 2250, 2875];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = tr('dex.ui_sy_shards_rand_lbl');
      valueText = tr('dex.ui_sy_shards_rand_val', { val: Math.round(dailyTotal).toLocaleString() });
      singleText = tr('dex.ui_sy_shards_rand_sgl', { val: singleVal.toLocaleString() });
    } else {
      const table = [240, 340, 480, 670, 920, 1260, 1800, 2500];
      singleVal = table[Math.min(lvlIdx, table.length - 1)];
      dailyTotal = dailyTriggers * singleVal;
      label = tr('dex.ui_sy_shards_s_lbl');
      valueText = tr('dex.ui_sy_shards_s_val', { val: Math.round(dailyTotal).toLocaleString() });
      singleText = tr('dex.ui_sy_shards_s_sgl', { val: singleVal.toLocaleString() });
    }
  }
  // 24. 負電
  else if (s.includes('負電') || s.includes('Minus')) {
    const table = [5, 7, 9, 12, 16, 20, 24];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_minus_lbl');
    valueText = tr('dex.ui_sy_pot_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_minus_sgl', { val: singleVal });
  }
  // 25. 料理強化S
  else if (s.includes('料理強化') || s.includes('Cooking Power Up')) {
    const table = [7, 10, 12, 17, 22, 27, 31];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_cook_power_lbl');
    valueText = tr('dex.ui_sy_pot_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_pot_sgl', { val: singleVal });
  }
  // 26. 料理成功S (not including 健美 / 魔法火焰)
  else if (s.includes('料理成功') || s.includes('Tasty Chance')) {
    const table = [4, 5, 6, 7, 8, 10];
    singleVal = table[Math.min(lvlIdx, table.length - 1)];
    dailyTotal = dailyTriggers * singleVal;
    label = tr('dex.ui_sy_tasty_chance_lbl');
    valueText = tr('dex.ui_sy_tasty_chance_val', { val: dailyTotal.toFixed(1) });
    singleText = tr('dex.ui_sy_tasty_chance_sgl', { val: singleVal });
  }
  // 27. 揮指 / 模仿 / 變身 / 十項全能
  else if (s.includes('揮指') || s.includes('Metronome') || s.includes('模仿') || s.includes('Mimic') || s.includes('變身') || s.includes('Transform') || s.includes('十項全能') || s.includes('All-Rounder')) {
    singleVal = 1;
    dailyTotal = dailyTriggers;
    label = (s.includes('變身') || s.includes('Transform'))
      ? tr('dex.ui_sy_transform_lbl')
      : ((s.includes('模仿') || s.includes('Mimic'))
        ? tr('dex.ui_sy_mimic_lbl')
        : ((s.includes('十項全能') || s.includes('All-Rounder')) ? tr('dex.ui_sy_all_rounder_lbl') : tr('dex.ui_sy_metronome_lbl')));
    valueText = tr('dex.ui_sy_metronome_val');
    singleText = tr('dex.ui_sy_metronome_sgl');
  } else if (s) {
    singleVal = 1;
    dailyTotal = dailyTriggers;
    label = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getMainSkillName === 'function')
      ? window.I18N.getMainSkillName(s)
      : s;
    valueText = tr('dex.ui_sy_generic_val', { val: dailyTriggers.toFixed(2) });
    singleText = tr('dex.ui_sy_generic_sgl');
  }

  const mainSkillDesc = typeof getSkillDescription === 'function' ? getSkillDescription(s) : '';

  return {
    mainSkillExtraDaily: dailyTotal,
    mainSkillLabel: `${label} (Lv.${lvl})`,
    mainSkillValueText: valueText,
    mainSkillSingleText: singleText,
    mainSkillDesc: mainSkillDesc
  };
}

function getIngCountFromBase(basePkm, slotIdx, ingName) {
  if (!basePkm || !basePkm.ingredients) {
    return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
  }
  const found = basePkm.ingredients.find(function(ig) { return ig.name === ingName; });
  if (found) {
    if (slotIdx === 0 && found.l1 !== undefined) return parseInt(found.l1, 10);
    if (slotIdx === 1 && found.l30 !== undefined) return parseInt(found.l30, 10);
    if (slotIdx === 2 && found.l60 !== undefined) return parseInt(found.l60, 10);
    if (typeof found.count === 'number') return found.count;
  }
  const slotIng = basePkm.ingredients[slotIdx];
  if (slotIng) {
    if (slotIdx === 0 && slotIng.l1 !== undefined) return parseInt(slotIng.l1, 10);
    if (slotIdx === 1 && slotIng.l30 !== undefined) return parseInt(slotIng.l30, 10);
    if (slotIdx === 2 && slotIng.l60 !== undefined) return parseInt(slotIng.l60, 10);
    if (typeof slotIng.count === 'number') return slotIng.count;
  }
  return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
}

function calculatePokedexIngredientFormulas(customState) {
  const _pokedexStatsCache = calculatePokedexIngredientFormulas._cache || (calculatePokedexIngredientFormulas._cache = new Map());
  const state = customState || pokedexModalState;
  const pkm = (state && state.pkm) || pokedexModalState.pkm;
  if (!pkm) return null;

  const currentLevel = (state && state.level != null) ? state.level : pokedexModalState.level;
  const currentNature = (state && state.nature != null) ? state.nature : pokedexModalState.nature;
  const subskills = (state && state.subskills != null) ? state.subskills : pokedexModalState.subskills;
  const ribbon = (state && state.ribbon != null) ? state.ribbon : pokedexModalState.ribbon;
  const skillLevel = (state && state.skillLevel != null) ? state.skillLevel : pokedexModalState.skillLevel;
  const ingSlots = (state && state.ingSlots != null) ? state.ingSlots : pokedexModalState.ingSlots;
  const customIngredients = (state && (state.customIngredients || state.ingredients)) ? (state.customIngredients || state.ingredients) : null;

  const localeTag = (window.I18N && typeof window.I18N.t === 'function' ? window.I18N.t('dex.ui_locale_tag') : null) || 'zh-TW';
  const isCleanseMintFlag = !!(state && (state.cleanseMint || state.mint || (pkm && (pkm.cleanseMint || pkm.mint))));
  const pkmKey = pkm.id || pkm.formatted_no || pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || '';
  const subKey = Array.isArray(subskills) ? subskills.map(s => typeof s === 'string' ? s : (s && s.name ? s.name : '')).join(',') : '';
  const ingSlotKey = customIngredients
    ? 'cust:' + customIngredients.map(c => typeof c === 'string' ? c : (c && c.name ? c.name : '')).join(',')
    : 'slots:' + (Array.isArray(ingSlots) ? ingSlots.join(',') : '');
  const pkmIngBaseKey = Array.isArray(pkm.ingredients) ? pkm.ingredients.map(i => `${i.name}:${i.l1 || ''}/${i.l30 || ''}/${i.l60 || ''}`).join(';') : '';
  const statsCacheKey = `${localeTag}|${pkmKey}|${pkm.interval || ''}|${pkm.ingredient_rate || ''}|${pkm.skill_rate || ''}|${pkm.carry || pkm.carryCapacity || ''}|${pkm.main_skill || ''}|${pkm.specialty || ''}|${pkm.is_final || ''}|${pkmIngBaseKey}|${currentLevel}|${currentNature}|${isCleanseMintFlag ? 1 : 0}|${ribbon}|${skillLevel}|${subKey}|${ingSlotKey}`;

  if (_pokedexStatsCache.has(statsCacheKey)) {
    return _pokedexStatsCache.get(statsCacheKey);
  }

  // 1. 基礎數值
  const baseIngRate = parseFloat(pkm.ingredient_rate || '0') || 20.0;
  const baseSkillRate = parseFloat(pkm.skill_rate || '0') || 2.0;
  const baseIntervalSec = parsePokedexIntervalToSec(pkm.interval);

  // 2. 副技能加成判定 (Lv.10, Lv.25, Lv.50, Lv.70, Lv.80)
  const slotLevels = [10, 25, 50, 70, 80];
  let subskillIngBonus = 0;
  let subskillSpeedBonus = 0;
  let subskillSkillBonus = 0;
  const activeSubskillNames = [];

  subskills.forEach((s, idx) => {
    const sName = (typeof s === 'string') ? s : (s && s.name ? s.name : '');
    if (!sName) return;
    const isUnlocked = currentLevel >= slotLevels[idx];
    if (isUnlocked) {
      activeSubskillNames.push(sName);
      if (sName === '食材機率提升M' || sName.includes('Ingredient Finder M')) subskillIngBonus += 36;
      if (sName === '食材機率提升S' || sName.includes('Ingredient Finder S')) subskillIngBonus += 18;
      if (sName === '幫忙速度M' || sName.includes('Helping Speed M')) subskillSpeedBonus += 14;
      if (sName === '幫忙速度S' || sName.includes('Helping Speed S')) subskillSpeedBonus += 7;
      if (sName === '幫手獎勵' || sName.includes('Helping Bonus')) subskillSpeedBonus += 5;
      if (sName === '技能機率提升M' || sName.includes('Skill Trigger M')) subskillSkillBonus += 36;
      if (sName === '技能機率提升S' || sName.includes('Skill Trigger S')) subskillSkillBonus += 18;
    }
  });

  // 3. 性格修正
  const isCleanseMint = !!(state && (state.cleanseMint || state.mint || (pkm && (pkm.cleanseMint || pkm.mint))));
  const natureObj = POKEDEX_MODAL_NATURES.find(n => n.name === currentNature || n.name_en === currentNature) || { buffType: 'none', debuffType: 'none' };
  let natureIngMult = 1.0;
  let natureSpeedMult = 1.0;
  let natureSkillMult = 1.0;

  if (!isCleanseMint) {
    if (natureObj.buffType === 'ingredient') natureIngMult = 1.20;
    else if (natureObj.debuffType === 'ingredient') natureIngMult = 0.80;

    if (natureObj.buffType === 'speed') natureSpeedMult = 0.90;
    else if (natureObj.debuffType === 'speed') natureSpeedMult = 1.075;

    if (natureObj.buffType === 'skill') natureSkillMult = 1.20;
    else if (natureObj.debuffType === 'skill') natureSkillMult = 0.80;
  }

  // 4. 最終食材發動率
  const finalIngRate = baseIngRate * (1 + subskillIngBonus / 100) * natureIngMult;

  // 5. 幫忙速度與每日幫忙次數
  const levelSpeedDiscount = (currentLevel - 1) * 0.002;
  const speedReduction = Math.min(0.35, subskillSpeedBonus / 100);

  let ribbonDiscount = 0;
  if (ribbon > 0 && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function') {
    const remEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    const rBonus = window.AppraisalLab.getRibbonBonus(ribbon, remEvos);
    ribbonDiscount = rBonus.speedDiscount || 0;
  }

  const effectiveIntervalSec = Math.max(600, Math.round(baseIntervalSec * (1 - levelSpeedDiscount) * (1 - speedReduction) * natureSpeedMult * (1 - ribbonDiscount)));
  const ENERGY_INTERVAL_MULT = 0.45;
  const BASE_CALC_SECONDS = 43200; // 12 小時日間活躍基準 (12 hours = 43200s)
  const idealIntervalSec = Math.round(effectiveIntervalSec * ENERGY_INTERVAL_MULT * 10) / 10;
  const dailyHelps = BASE_CALC_SECONDS / (effectiveIntervalSec * ENERGY_INTERVAL_MULT);
  const dailyIngDrops = dailyHelps * (finalIngRate / 100);

  // 6. 樹果產量與單日能量 (12h) 精算
  const berryObj = (typeof getPokemonBerry === 'function') ? getPokemonBerry(pkm) : { name: '', icon: '' };
  const berryName = window.I18N ? window.I18N.getBerryName(berryObj.name) : berryObj.name;
  const berryRawName = berryObj.name || '';
  const berryIcon = berryObj.icon || '';
  const berryBaseEnergy = getBerryBaseEnergy(berryRawName || pkm.type);
  const singleBerryEnergy = calculateSingleBerryEnergy(berryBaseEnergy, currentLevel);

  const isBerrySpec = !!(pkm.specialty && (pkm.specialty.includes('樹果') || pkm.specialty === 'Berries' || pkm.specialty === 'berry'));
  const baseBerryCount = isBerrySpec ? 2 : 1;
  const hasBFS = activeSubskillNames.some(s => s === '樹果數量S' || s.includes('Berry Finding'));
  const berriesPerHelp = baseBerryCount + (hasBFS ? 1 : 0);

  const dailyBerryHelps = Math.max(0, dailyHelps - dailyIngDrops);
  const dailyBerryCount = dailyBerryHelps * berriesPerHelp;
  const dailyBerryEnergy = Math.round(dailyBerryCount * singleBerryEnergy);
  const dailyBerryEnergyFav = dailyBerryEnergy * 2;

  // 7. 各槽位食材掉落計算
  const ingredientsList = pkm.ingredients || [];
  let unlockedSlotCount = 1;
  if (currentLevel >= 60) unlockedSlotCount = 3;
  else if (currentLevel >= 30) unlockedSlotCount = 2;

  const activeIngredientDetails = [];
  const summaryYieldMap = new Map();

  for (let s = 0; s < unlockedSlotCount; s++) {
    let ingData = null;
    let count = 1;
    if (customIngredients && customIngredients[s]) {
      const cItem = customIngredients[s];
      const cName = (typeof cItem === 'string') ? cItem : (cItem.name || '');
      const found = ingredientsList.find(i => i.name === cName || i.name_en === cName);
      if (found) {
        ingData = found;
      } else {
        const icon = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') ? window.I18N.getIngredientIcon(cName) : '';
        ingData = { name: cName, icon: icon };
      }
      count = getIngCountFromBase(pkm, s, ingData.name);
    } else {
      const ingChoiceIdx = ingSlots[s] || 0;
      ingData = ingredientsList[ingChoiceIdx] || ingredientsList[0] || { name: '甜甜蜜', icon: '' };
      if (s === 0) count = parseInt(ingData.l1 || 1, 10);
      else if (s === 1) count = parseInt(ingData.l30 || ingData.l1 || 1, 10);
      else if (s === 2) count = parseInt(ingData.l60 || ingData.l30 || ingData.l1 || 1, 10);
    }

    const ingName = window.I18N ? window.I18N.getIngredientName(ingData.name) : ingData.name;
    const ingDailyCount = (dailyIngDrops * (count / unlockedSlotCount));

    activeIngredientDetails.push({
      slot: s + 1,
      name: ingName,
      rawName: ingData.name,
      icon: ingData.icon || '',
      count: count,
      dailyYield: ingDailyCount
    });

    const prev = summaryYieldMap.get(ingData.name) || { name: ingName, icon: ingData.icon || '', daily: 0 };
    prev.daily += ingDailyCount;
    summaryYieldMap.set(ingData.name, prev);
  }

  let totalDailyIngredients = 0;
  summaryYieldMap.forEach(item => {
    totalDailyIngredients += item.daily;
  });

  // 8. 持有上限計算 (基礎持有 + 副技能 + 睡飽飽獎章)
  const baseCarry = parseInt(pkm.carry || pkm.carryCapacity || '0', 10) || 0;
  let subskillCarryBonus = 0;
  subskills.forEach((s, idx) => {
    const sName = (typeof s === 'string') ? s : (s && s.name ? s.name : '');
    if (!sName) return;
    const isUnlocked = currentLevel >= slotLevels[idx];
    if (isUnlocked) {
      if (sName === '持有上限提升L' || sName.includes('Inventory Up L')) subskillCarryBonus += 18;
      else if (sName === '持有上限提升M' || sName.includes('Inventory Up M')) subskillCarryBonus += 12;
      else if (sName === '持有上限提升S' || sName.includes('Inventory Up S')) subskillCarryBonus += 6;
    }
  });

  let ribbonCarryBonus = 0;
  if (ribbon > 0 && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function') {
    const remEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    const rBonus = window.AppraisalLab.getRibbonBonus(ribbon, remEvos);
    ribbonCarryBonus = rBonus.carry || 0;
  }

  const effectiveCarry = baseCarry + subskillCarryBonus + ribbonCarryBonus;
  const diffCarry = effectiveCarry - baseCarry;

  // 9. 主技能附加期望 (全主技能全量精算支援)
  const finalSkillRate = baseSkillRate * (1 + subskillSkillBonus / 100) * natureSkillMult;
  const dailyTriggers = dailyHelps * (finalSkillRate / 100);

  const diffIngRate = finalIngRate - baseIngRate;
  const diffSkillRate = finalSkillRate - baseSkillRate;
  const diffSec = effectiveIntervalSec - baseIntervalSec;

  const skillYield = getPokedexMainSkillYield(pkm.main_skill, skillLevel, dailyTriggers);
  const mainSkillExtraDaily = skillYield.mainSkillExtraDaily;
  const mainSkillLabel = skillYield.mainSkillLabel;
  const mainSkillValueText = skillYield.mainSkillValueText;
  const mainSkillSingleText = skillYield.mainSkillSingleText;
  const mainSkillDesc = skillYield.mainSkillDesc;

  const resultObj = {
    baseCarry,
    subskillCarryBonus,
    ribbonCarryBonus,
    effectiveCarry,
    diffCarry,
    diffIngRate,
    diffSkillRate,
    diffSec,
    baseIngRate,
    subskillIngBonus,
    natureIngMult,
    cleanseMint: isCleanseMint,
    finalIngRate,
    baseIntervalSec,
    effectiveIntervalSec,
    energyIntervalMult: ENERGY_INTERVAL_MULT,
    baseCalcSeconds: BASE_CALC_SECONDS,
    idealIntervalSec,
    dailyHelps,
    dailyIngDrops,
    berryName,
    berryRawName,
    berryIcon,
    berryBaseEnergy,
    singleBerryEnergy,
    isBerrySpec,
    baseBerryCount,
    hasBFS,
    berriesPerHelp,
    dailyBerryHelps,
    dailyBerryCount,
    dailyBerryEnergy,
    dailyBerryEnergyFav,
    unlockedSlotCount,
    activeIngredientDetails,
    summaryYieldList: Array.from(summaryYieldMap.values()),
    totalDailyIngredients,
    mainSkillExtraDaily,
    mainSkillLabel,
    mainSkillValueText,
    mainSkillSingleText,
    mainSkillDesc,
    dailyTriggers,
    baseSkillRate,
    subskillSkillBonus,
    natureSkillMult,
    finalSkillRate,
    levelSpeedDiscount,
    subskillSpeedBonus,
    natureSpeedMult,
    ribbonDiscount
  };
  if (_pokedexStatsCache.size > 500) {
    _pokedexStatsCache.clear();
  }
  _pokedexStatsCache.set(statsCacheKey, resultObj);
  return resultObj;
}

function formatPokedexIntervalDiff(diffSec) {
  if (diffSec === 0) return { text: '(+0s)', cls: 'diff-zero' };
  const absSec = Math.abs(diffSec);
  const m = Math.floor(absSec / 60);
  const s = absSec % 60;
  const timeStr = m > 0 ? `${m}:${s < 10 ? '0' : ''}${s}` : `${s}s`;
  if (diffSec < 0) {
    return { text: `(-${timeStr})`, cls: 'diff-pos' };
  } else {
    return { text: `(+${timeStr})`, cls: 'diff-neg' };
  }
}

function renderPokedexIntervalValue(f, pkm) {
  if (!f) return formatHelpInterval(pkm ? pkm.interval : 0);
  const mainVal = formatHelpInterval(f.effectiveIntervalSec);
  const diff = formatPokedexIntervalDiff(f.diffSec);
  return `${mainVal}<span class="header-stat-diff ${diff.cls}">${diff.text}</span>`;
}

function renderPokedexCarryValue(f, pkm) {
  if (!f) {
    const baseC = pkm ? (pkm.carry || pkm.carryCapacity || '--') : '--';
    return `${baseC}`;
  }
  const diffVal = f.diffCarry;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < 0) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${f.effectiveCarry}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal})</span>`;
}

function formatRateWithTens(val) {
  if (typeof val !== 'number' || isNaN(val)) return '--';
  const parts = val.toFixed(2).split('.');
  // When integer part is single-digit (e.g. 2.10%), pad with a figure space (\u2007)
  // instead of '0', leaving a visual empty space of exact digit width for vertical % alignment.
  const intPart = parts[0].length < 2 ? '\u2007' + parts[0] : parts[0];
  return `${intPart}.${parts[1]}%`;
}

function renderPokedexIngRateValue(f, pkm) {
  if (!f || typeof f.finalIngRate !== 'number') {
    if (!pkm || !pkm.ingredient_rate) return '--';
    const num = parseFloat(pkm.ingredient_rate);
    return isNaN(num) ? pkm.ingredient_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffIngRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalIngRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

function renderPokedexSkillRateValue(f, pkm) {
  if (!f || typeof f.finalSkillRate !== 'number') {
    if (!pkm || !pkm.skill_rate) return '--';
    const num = parseFloat(pkm.skill_rate);
    return isNaN(num) ? pkm.skill_rate : formatRateWithTens(num);
  }
  const diffVal = f.diffSkillRate;
  let diffCls = 'diff-zero';
  let diffSign = '+';
  if (diffVal > 0.001) {
    diffCls = 'diff-pos';
    diffSign = '+';
  } else if (diffVal < -0.001) {
    diffCls = 'diff-neg';
    diffSign = '';
  }
  return `${formatRateWithTens(f.finalSkillRate)}<span class="header-stat-diff ${diffCls}">(${diffSign}${diffVal.toFixed(2)}%)</span>`;
}

const STAGE3_INHERITED_MIN_LEVELS = {
  '土王': 15, 'Clodsire': 15,
  '大食花': 16, 'Victreebel': 16,
  '隆隆岩': 19, 'Golem': 19,
  '自爆磁怪': 23, 'Magnezone': 23,
  '耿鬼': 19, 'Gengar': 19,
  '艾路雷朵': 15, 'Gallade': 15,
  '鍬農炮蟲': 15, 'Vikavolt': 15,
  '巴布土撥': 14, 'Pawmot': 14
};

function getPokedexMinEvolutionLevel(pkm) {
  if (!pkm) return 1;
  const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
  if (STAGE3_INHERITED_MIN_LEVELS[name]) {
    return STAGE3_INHERITED_MIN_LEVELS[name];
  }
  if (!pkm.evo_req) return 1;
  const match = pkm.evo_req.match(/Lv\.?\s*(\d+)/i);
  if (match) {
    return parseInt(match[1], 10) || 1;
  }
  return 1;
}

// Canonical evolution items definitions for Pokedex modal linkage
const POKEDEX_EVO_ITEM_DEFINITIONS = [
  { id: 'thunder_stone', name_tw: '雷之石', name_cn: '雷之石', name_en: 'Thunder Stone', icon: 'https://www.serebii.net/pokemonsleep/items/thunderstone.png' },
  { id: 'fire_stone',    name_tw: '火之石', name_cn: '火之石', name_en: 'Fire Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/firestone.png' },
  { id: 'water_stone',   name_tw: '水之石', name_cn: '水之石', name_en: 'Water Stone',   icon: 'https://www.serebii.net/pokemonsleep/items/waterstone.png' },
  { id: 'leaf_stone',    name_tw: '葉之石', name_cn: '叶之石', name_en: 'Leaf Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/leafstone.png' },
  { id: 'moon_stone',    name_tw: '月之石', name_cn: '月之石', name_en: 'Moon Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/moonstone.png' },
  { id: 'sun_stone',     name_tw: '太陽之石', name_cn: '太阳之石', name_en: 'Sun Stone', icon: 'https://www.serebii.net/itemdex/sprites/sunstone.png' },
  { id: 'ice_stone',     name_tw: '冰之石', name_cn: '冰之石', name_en: 'Ice Stone',     icon: 'https://www.serebii.net/pokemonsleep/items/icestone.png' },
  { id: 'shiny_stone',   name_tw: '光之石', name_cn: '光之石', name_en: 'Shiny Stone',   icon: 'https://www.serebii.net/pokemonsleep/items/shinystone.png' },
  { id: 'dusk_stone',    name_tw: '暗之石', name_cn: '暗之石', name_en: 'Dusk Stone',    icon: 'https://www.serebii.net/pokemonsleep/items/duskstone.png' },
  { id: 'dawn_stone',    name_tw: '覺醒之石', name_cn: '觉醒之石', name_en: 'Dawn Stone', icon: 'https://www.serebii.net/pokemonsleep/items/dawnstone.png' },
  { id: 'oval_stone',    name_tw: '渾圓之石', name_cn: '浑圆之石', name_en: 'Oval Stone', icon: 'https://www.serebii.net/pokemonsleep/items/ovalstone.png' },
  { id: 'linking_cord',  name_tw: '聯繫繩', name_cn: '联系绳', name_en: 'Linking Cord',  icon: 'https://www.serebii.net/pokemonsleep/items/linkingcord.png' },
  { id: 'metal_coat',    name_tw: '金屬膜', name_cn: '金属膜', name_en: 'Metal Coat',    icon: 'https://www.serebii.net/pokemonsleep/items/metalcoat.png' },
  { id: 'kings_rock',    name_tw: '王者之證', name_cn: '王者之证', name_en: "King's Rock", icon: "https://www.serebii.net/pokemonsleep/items/king'srock.png" },
  { id: 'razor_claw',    name_tw: '銳利之爪', name_cn: '锐利之爪', name_en: 'Razor Claw', icon: 'https://www.serebii.net/pokemonsleep/items/razorclaw.png' }
];

function getPokemonEvolutionItems(pkm) {
  if (!pkm || !pkm.evo_req || typeof pkm.evo_req !== 'string') return [];
  const req = pkm.evo_req;
  const matched = [];

  for (let i = 0; i < POKEDEX_EVO_ITEM_DEFINITIONS.length; i++) {
    const def = POKEDEX_EVO_ITEM_DEFINITIONS[i];
    if (
      req.includes(def.name_tw) ||
      req.includes(def.name_cn) ||
      req.toLowerCase().includes(def.name_en.toLowerCase())
    ) {
      let displayName = def.name_tw;
      if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getItemName === 'function') {
        displayName = window.I18N.getItemName(def.id) || def.name_tw;
      }
      let iconUrl = def.icon;
      if (typeof window !== 'undefined' && Array.isArray(window.ITEMS_DATA)) {
        const itemRecord = window.ITEMS_DATA.find(x => x.id === def.id);
        if (itemRecord && itemRecord.icon_url) {
          iconUrl = itemRecord.icon_url;
        }
      }
      matched.push({
        id: def.id,
        name: displayName,
        icon_url: iconUrl
      });
    }
  }
  return matched;
}

function renderPokedexEvoItemChipsHTML(pkm) {
  const items = getPokemonEvolutionItems(pkm);
  if (!items || items.length === 0) return '';

  return items.map(item => {
    const tip = window.I18N?.t?.('dex.ui_evo_item_tip', { name: item.name }) ?? 'dex.ui_evo_item_tip';
    return `<button type="button" class="pokedex-evo-item-btn pokedex-evo-item-icon-only" data-evo-item-id="${item.id}" onclick="window.WikiDB && typeof window.WikiDB.openItemDetailModal === 'function' ? window.WikiDB.openItemDetailModal('${item.id}') : (window.openItemDetailModal && window.openItemDetailModal('${item.id}'))" title="${escapeHtml(tip)}" aria-label="${escapeHtml(tip)}">${item.icon_url ? `<img src="${item.icon_url}" class="pokedex-evo-item-icon" alt="${escapeHtml(item.name)}" loading="lazy">` : ''}</button>`;
  }).join('');
}

function renderPokedexEvoGuardBadgeHTML(pkm, level) {
  const minLv = getPokedexMinEvolutionLevel(pkm);
  if (minLv <= 1) return '';
  const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
  const currentLevel = parseInt(level, 10) || 1;
  const isBelow = currentLevel < minLv;
  if (isBelow) {
    const tipTpl = t('pokedex.evo_guard_tip_below', '此形態最低進化等級為 Lv.{0}，點擊可快速調整至門檻等級');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_below', '進化門檻 Lv.');
    return `<button type="button" class="pokedex-evo-guard-badge evo-warning" onclick="window.PokemonApp.setPokedexModalLevel(${minLv})" title="${tip}">[!] ${label}${minLv}</button>`;
  } else {
    const tipTpl = t('pokedex.evo_guard_tip_met', '已達此形態最低進化門檻 (Lv.{0}+)');
    const tip = tipTpl.replace('{0}', minLv);
    const label = t('pokedex.evo_guard_met', '已達門檻 Lv.');
    return `<span class="pokedex-evo-guard-badge evo-passed" title="${tip}">[✓] ${label}${minLv}+</span>`;
  }
}

function renderPokedexRibbonOptionsHTML(pkm, currentRibbon) {
  let remainingEvos = 0;
  if (pkm) {
    if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
      remainingEvos = window.AppraisalLab.getRemainingEvolutions(pkm);
    } else {
      const isFinal = (typeof isFinalEvolution === 'function')
        ? isFinalEvolution(pkm)
        : (pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1');
      remainingEvos = isFinal ? 0 : 1;
    }
  }

  const tr = (k) => window.I18N?.t?.(k) ?? k;
  const currentVal = parseInt(currentRibbon, 10) || 0;
  let opt2Text = '';
  const opt3Text = tr('dex.ui_ribbon_lv3');
  let opt4Text = '';

  if (!pkm) {
    opt2Text = tr('dex.ui_ribbon_lv2_generic');
    opt4Text = tr('dex.ui_ribbon_lv4_generic');
  } else if (remainingEvos === 2) {
    opt2Text = tr('dex.ui_ribbon_lv2_evo2');
    opt4Text = tr('dex.ui_ribbon_lv4_evo2');
  } else if (remainingEvos === 1) {
    opt2Text = tr('dex.ui_ribbon_lv2_evo1');
    opt4Text = tr('dex.ui_ribbon_lv4_evo1');
  } else {
    opt2Text = tr('dex.ui_ribbon_lv2_evo0');
    opt4Text = tr('dex.ui_ribbon_lv4_evo0');
  }

  const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/app/') ? '../' : '');
  const optionsData = [
    { val: 0, text: tr('dex.ui_ribbon_lv0'), icon: '' },
    { val: 1, text: tr('dex.ui_ribbon_lv1'), icon: `${base}assets/ribbons/ribbon_lv1.png` },
    { val: 2, text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
    { val: 3, text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
    { val: 4, text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
  ];

  return optionsData.map(o => `
    <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${escapeHtml(o.text)}</option>
  `).join('');
}

function renderPokedexStrategyCardHTML(pkm) {
  if (!pkm) return '';

  const tr = (k) => window.I18N?.t?.(k) ?? k;
  const subName = (k) => window.I18N?.getSubSkillName?.(k) ?? k;
  const specialty = pkm.specialty || '';
  let roleTitle = '';
  let coreSkill = '';
  let coreTier = 'gold';
  let recommendedSubs = [];
  let recommendedNatures = '';

  if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
    roleTitle = tr('dex.ui_strat_berry_title');
    coreSkill = subName('樹果數量S');
    coreTier = 'gold';
    recommendedSubs = ['樹果數量S', '幫手獎勵', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
    recommendedNatures = tr('dex.ui_strat_berry_nature');
  } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
    roleTitle = tr('dex.ui_strat_ing_title');
    coreSkill = subName('食材機率提升M');
    coreTier = 'blue';
    recommendedSubs = ['幫手獎勵', '食材機率提升M', '食材機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
    recommendedNatures = tr('dex.ui_strat_ing_nature');
  } else {
    const isBerryBurst = isBerryBurstSkillSpecialist(pkm);
    const isHealer = isHealerSkillSpecialist(pkm);
    const isHelper = isHelperBoostSkillSpecialist(pkm);
    const isCharge = isChargeStrengthSkillSpecialist(pkm);

    if (isBerryBurst) {
      roleTitle = tr('dex.ui_strat_burst_title');
      coreSkill = [subName('樹果數量S'), subName('技能機率提升M')];
      coreTier = 'gold';
      recommendedSubs = ['樹果數量S', '技能機率提升M', '幫手獎勵', '幫忙速度M', '持有上限提升L', '技能機率提升S'].map(subName);
      recommendedNatures = tr('dex.ui_strat_burst_nature');
    } else if (isHealer) {
      roleTitle = tr('dex.ui_strat_healer_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
      recommendedNatures = tr('dex.ui_strat_healer_nature');
    } else if (isHelper) {
      roleTitle = tr('dex.ui_strat_helper_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '持有上限提升L', '幫忙速度M', '持有上限提升M'].map(subName);
      recommendedNatures = tr('dex.ui_strat_helper_nature');
    } else if (isCharge) {
      roleTitle = tr('dex.ui_strat_charge_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['技能機率提升M', '幫手獎勵', '技能機率提升S', '幫忙速度M', '持有上限提升L', '樹果數量S'].map(subName);
      recommendedNatures = tr('dex.ui_strat_charge_nature');
    } else {
      roleTitle = tr('dex.ui_strat_tactical_title');
      coreSkill = subName('技能機率提升M');
      coreTier = 'blue';
      recommendedSubs = ['幫手獎勵', '技能機率提升M', '技能機率提升S', '幫忙速度M', '幫忙速度S', '持有上限提升L'].map(subName);
      recommendedNatures = tr('dex.ui_strat_tactical_nature');
    }
  }

  const getSubskillTier = (name) => {
    const sk = POKEDEX_MODAL_SUBSKILLS.find(item =>
      item.name === name ||
      item.name_en === name ||
      (typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function' && window.I18N.toSimplified(item.name) === name)
    );
    return sk ? sk.tier : 'white';
  };

  const coreChipsHtml = Array.isArray(coreSkill)
    ? coreSkill.map(sk => `<span class="strategy-chip subskill-${getSubskillTier(sk)} strategy-core-chip">${escapeHtml(sk)}</span>`).join(' ')
    : `<span class="strategy-chip subskill-${coreTier} strategy-core-chip">${escapeHtml(coreSkill)}</span>`;

  return `
    <div class="pokedex-strategy-card">
      <div class="strategy-card-title pokedex-formula-badge font-bold">${roleTitle}</div>
      <div class="strategy-details-grid">
        <div class="strategy-item strategy-item-core">
          <span class="strategy-k strategy-core-k">${tr('dex.ui_strat_core_skill')}：</span>
          ${coreChipsHtml}
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${tr('dex.ui_strat_recommended')}：</span>
          <div class="strategy-chips-wrap">
            ${recommendedSubs.map(s => `<span class="strategy-chip subskill-${getSubskillTier(s)}">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="strategy-item">
          <span class="strategy-k">${tr('dex.ui_strat_best_nature')}：</span>
          <span class="strategy-v text-accent">${recommendedNatures}</span>
        </div>
      </div>
    </div>
  `;
}
