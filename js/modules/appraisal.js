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

  /* 官方 25 種性格與數值修正定義表 */
  const NATURE_DATA = [
    { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼' },
    { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼' },
    { name: '怕寂寞', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼' },
    { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼' },
    { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼' },
    { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼' },
    { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼' },
    { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼' },
    { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼' },
    { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼' },
    { name: '自大', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼' },
    { name: '溫順', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼' },
    { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼' },
    { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼' },
    { name: '悠閒', name_en: 'Relaxed', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼' },
    { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼' },
    { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼' },
    { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼' },
    { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼' },
    { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼' },
    { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '' },
    { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '' },
    { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '' },
    { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '' },
    { name: '浮躁', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '' }
  ];

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

  // 1. 樹果遽增型 (Berry Burst Specialists): 主技能為樹果遽增/畫皮/流星群，天然以產果為核心
  function isBerryBurstSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('樹果遽增') || skill.includes('Berry Burst') || skill.includes('畫皮') || skill.includes('流星群')) return true;
    const burstNames = ['木守宮', '森林蜥蜴', '蜥蜴王', '小火焰猴', '猛火猴', '烈焰猴', '毛頭小鷹', '勇士雄鷹', '謎擬Q', '拉帝歐斯',
                        'Treecko', 'Grovyle', 'Sceptile', 'Chimchar', 'Monferno', 'Infernape', 'Rufflet', 'Braviary', 'Mimikyu', 'Latios'];
    return burstNames.some(b => name.includes(b));
  }

  // 2. 樹果數量S相性判定：樹果遽增型為天生契合型
  function isBfsSkillSpecialist(pkm) {
    return isBerryBurstSkillSpecialist(pkm);
  }

  // 3. 活力全體療癒/單體療癒補師 (Healers: E4E & Energizing)
  function isHealerSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('活力療癒') || skill.includes('活力氣場') || skill.includes('Energizing Cheer')) return true;
    const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥', '克雷色利亞', '壺壺', '拉帝亞斯', '托戈德瑪爾',
                         'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo', 'Cresselia', 'Shuckle', 'Latias', 'Togedemaru'];
    return healerNames.some(h => name.includes(h));
  }

  // 4. 幫手加速/支援型 (Helper Boost & Extra Helpful Specialists)
  function isHelperBoostSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('幫手加速') || skill.includes('幫手支援') || skill.includes('Helper Boost') || skill.includes('Extra Helpful')) return true;
    const beastNames = ['雷公', '炎帝', '水君', '風速狗', '卡蒂狗', '雷伊布', '艾路雷朵',
                        'Raikou', 'Entei', 'Suicune', 'Arcanine', 'Growlithe', 'Jolteon', 'Gallade'];
    return beastNames.some(b => name.includes(b));
  }

  // 5. 單體充能直傷型 (Charge Strength Specialists: Ampharos, Espeon, Golduck, etc.)
  function isChargeStrengthSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('能量填充') || skill.includes('Charge Strength') || skill.includes('蓄力') || skill.includes('夢魘')) return true;
    const chargeNames = ['電龍', '咩利羊', '茸茸羊', '太陽伊布', '可達鴨', '哥達鴨', '樹才怪', '盆才怪', '隨風球', '飄飄球', '音波龍', '嗡蝠', '達克萊伊',
                         'Ampharos', 'Mareep', 'Flaaffy', 'Espeon', 'Psyduck', 'Golduck', 'Sudowoodo', 'Bonsly', 'Drifblim', 'Drifloon', 'Noivern', 'Noibat', 'Darkrai'];
    return chargeNames.some(c => name.includes(c));
  }

  // 6. 料理擴鍋型 (Pot Expanders: Cooking Power Up S)
  function isPotExpanderSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('料理強化') || skill.includes('Cooking Power') || skill.includes('負電')) return true;
    const potNames = ['小磁怪', '三合一磁怪', '自爆磁怪', '火伊布', '冰伊布', '負電拍拍', '顫弦蠑螈',
                      'Magnemite', 'Magneton', 'Magnezone', 'Flareon', 'Glaceon', 'Minun', 'Toxtricity'];
    return potNames.some(p => name.includes(p));
  }

  // 7. 料理美味度/成功率型 (Extra Tasty / Cooking Success Specialists: Dedenne, Cramorant, etc.)
  function isExtraTastySkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('料理成功') || skill.includes('美味大成功') || skill.includes('Extra Tasty') || skill.includes('Tasty Chance')) return true;
    const tastyNames = ['咚咚鼠', '海豹球（佳節）', '古月鳥', 'Dedenne', 'Spheal (Holiday)', 'Cramorant'];
    return tastyNames.some(t => name.includes(t));
  }

  // 8. 夢之碎片型 (Dream Shard Magnet Specialists: Lucario, Persian, Sableye, Swalot)
  function isDreamShardSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('夢之碎片') || skill.includes('Dream Shard') || skill.includes('波導彈')) return true;
    const shardNames = ['利歐路', '路卡利歐', '喵喵', '貓老大', '勾魂眼', '溶食獸', '吞食獸',
                        'Riolu', 'Lucario', 'Meowth', 'Persian', 'Sableye', 'Gulpin', 'Swalot'];
    return shardNames.some(s => name.includes(s));
  }

  // 9. 食材獲取/精選型技能寵 (Ingredient Magnet / Draw Specialists: Vaporeon, Hawlucha, Heracross, etc.)
  function isIngredientSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('食材獲取') || skill.includes('食材精選') || skill.includes('正電') || skill.includes('怪力鉗') || skill.includes('超幸運') || skill.includes('健美') || skill.includes('禮物')) return true;
    const ingNames = ['水伊布', '伊布', '毒電嬰', '正電拍拍', '穿山鼠', '穿山王', '石居蟹', '岩殿居蟹', '摔角鷹人', '赫拉克羅斯', '黑暗鴉', '烏鴉頭頭',
                      'Vaporeon', 'Eevee', 'Toxel', 'Plusle', 'Sandshrew', 'Sandslash', 'Dwebble', 'Crustle', 'Hawlucha', 'Heracross', 'Murkrow', 'Honchkrow'];
    return ingNames.some(i => name.includes(i));
  }

  // 10. 隨機揮指型 (Metronome Specialists: Togekiss, Mew)
  function isMetronomeSkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('揮指') || skill.includes('十項全能') || skill.includes('Metronome')) return true;
    const metronomeNames = ['波克比', '波克基古', '波克基斯', '夢幻', '皮寶寶', 'Togepi', 'Togetic', 'Togekiss', 'Mew', 'Cleffa'];
    return metronomeNames.some(m => name.includes(m));
  }

  // 11. 傳說/幻之神獸判定 (Legendary & Mythical Pokemon)
  function isLegendaryPokemon(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('精神擊破') || skill.includes('十項全能') || skill.includes('新月祈禱') || skill.includes('流星群') || skill.includes('夢魘')) return true;
    const legendaryNames = ['雷公', '炎帝', '水君', '超夢', '夢幻', '克雷色利亞', '達克萊伊', '拉帝歐斯', '拉帝亞斯',
                            'Raikou', 'Entei', 'Suicune', 'Mewtwo', 'Mew', 'Cresselia', 'Darkrai', 'Latios', 'Latias'];
    return legendaryNames.some(l => name.includes(l));
  }

  // 12. 呆呆獸家族 (Slowpoke Family - Tail Opener)
  function isSlowpokeFamily(pkm) {
    if (!pkm) return false;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    return ['呆呆獸', '呆殼獸', '呆呆王', 'Slowpoke', 'Slowbro', 'Slowking'].some(s => name.includes(s));
  }

  // 13. 請假王家族 (Slaking Family)
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
    const nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) ||
      (window.PokemonApp && window.PokemonApp.NATURE_DICT && window.PokemonApp.NATURE_DICT[natureName]) ||
      fallbackNatureDict[natureName] || { buffType: 'none', debuffType: 'none' };
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
      if (isBerryBurst) {
        pros.push(isEN
          ? '[★] Perfectly synergizes with "Berry Burst"! "Berry Finding S" increases base helps by +1 berry while main skill unleashes massive team berry bursts, forming an elite island pusher (maximize yields via regular collection).'
          : '[★] 完美契合「樹果遽增」機制！具備「樹果數量S」能在常態幫忙中額外產出樹果，同時透過主技能引爆全隊樹果能量，為島嶼衝分第一梯隊打手！（勤勞清包收益最大化）');
      } else if (isHelper) {
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
      } else if (isExtraTasty || isPotExpander || isDreamShard || pkmName.includes('咚咚鼠') || pkmName.includes('Dedenne') || pkmName.includes('磁怪') || pkmName.includes('Magne') || pkmName.includes('喵喵') || pkmName.includes('Meowth')) {
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
    if (hasIngMInTotal && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(isEN
        ? '[+] Features active "Ingredient Finder M", greatly stabilizing ingredient supply.'
        : '[+] 具備已解鎖「食材機率提升M」，大幅提升料理食材供貨穩定度。');
    }

    const hasSkillMInTotal = activeSubskills.indexOf('技能機率提升M') !== -1 || activeSubskills.indexOf('Skill Trigger M') !== -1;
    if (hasSkillMInTotal) {
      if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
        pros.push(isEN
          ? '[+] Features active "Skill Trigger M", significantly raising main skill activation frequency.'
          : '[+] 擁有已解鎖「技能機率提升M」，主技能發動頻率顯著提高。');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        if (pkmData.main_skill && (pkmData.main_skill.includes('食材') || pkmData.main_skill.includes('Ingredient'))) {
          pros.push(isEN
            ? '[+] Unlocked "Skill Trigger M" synergizes with ingredient-fetching main skill for bonus food supplies.'
            : '[+] 具備已解鎖「技能機率提升M」，輔助觸發食材獲取主技能，提供額外料理補給。');
        }
      }
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

    if (skillLevel >= 6 && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
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

    // 樹果遽增型特殊診斷 (未帶 BFS 時)
    if (isBerryBurst && !hasBFSInTotal) {
      pros.push(isEN
        ? '[★] Berry Burst Specialist: Main skill detonates instant berry energy for Snorlax (and copies teammate berries); 1.4x boosted during Buncha Berries events.'
        : '[★] 樹果遽增戰略型：主技能發動直接為卡比獸爆發樹果能量（並隨機獲取隊友樹果）；果實纍纍樹果週享有 1.4 倍加成！');
    }

    // 充能直傷型特殊診斷 (未帶 BFS 時)
    if (isCharge && !hasBFSInTotal) {
      pros.push(isEN
        ? '[+] High-Frequency Direct Charge: Pure skill build consistently fires Charge Strength throughout the day without inventory overflow risks.'
        : '[+] 高頻單兵充能直傷：正統純技能流派，全天穩定發動能量填充，無背包過早滿包阻斷技能之顧慮。');
    }

    // 傳說神獸特殊診斷
    if (isLegendary) {
      pros.push(isEN
        ? '[★] Legendary / Mythical Pokemon with signature mechanics, high base helping output and indispensable mono-type or domain tactical value.'
        : '[★] 傳說/幻之寶可夢專屬機制：素質基礎高，在特定同屬性純色隊或領域戰術中具備無可替代的戰略地位。');
    }

    // 料理大成功 (咚咚鼠)
    if (isExtraTasty) {
      pros.push(isEN
        ? '[+] Extra Tasty Specialist: Stacks dish critical success chance, tailor-made for exploding weekend master recipes.'
        : '[+] 料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊（數十萬能量突破）而生的高階戰略組件。');
    }

    // 料理擴鍋 (自爆磁怪)
    if (isPotExpander) {
      pros.push(isEN
        ? '[+] Cooking Power Up Specialist: Expands pot capacity to cook limit-breaking high-tier recipes.'
        : '[+] 料理擴鍋戰術手：突破鍋子容量上限，烹調極限大菜（如煉獄咖哩/太妃糖豆漿）不可或缺的擴容手。');
    }

    // 夢之碎片 (路卡利歐)
    if (isDreamShard) {
      pros.push(isEN
        ? '[+] Dream Shard Farmer: High shard acquisition yield, essential for Candy Boost weeks and late-game leveling.'
        : '[+] 夢之碎片收割手：高效獲取夢之碎片，為糖果強化週與後期高昂養成成本提供源源不絕的資金。');
    }

    // 食材獲取 (水伊布)
    if (isIngSkill) {
      pros.push(isEN
        ? '[+] Ingredient Stockpile Specialist: Rapidly restocks ingredient inventory to resolve cooking shortages.'
        : '[+] 應急食材庫存手：能高頻補充隨機食材庫存，化解大菜料理缺料危機。');
    }

    // 揮指隨機戰術 (波克基斯)
    if (isMetronome) {
      pros.push(isEN
        ? '[+] Metronome Specialist: Triggers unpredictable random skills with unmatched fun and high lucky ceilings.'
        : '[+] 隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與驚喜爆發上限。');
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

  /* ─── 升級里程碑質變預測 (Specialty-Aware Milestone Leap Projections) ─── */
  function calculateMilestoneProjections(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval) {
    if (!pkmData || !currentEval) return [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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
          const hasTailLv30 = ingredients.length >= 2 && (ingredients[1] === '美味尾巴' || (ingredients[1] && ingredients[1].includes('尾巴')) || (ingredients[1] && ingredients[1].includes('Tail')));
          if (hasTailLv30) {
            targetSkillName = isEN ? 'Slowpoke Tail' : '美味尾巴';
            milestoneType = 'ingredient';
            isKeyMilestone = true;
          }
        } else if (isIng && ingredients.length >= 2 && ingredients[1]) {
          targetSkillName = window.I18N ? window.I18N.getIngredientName(ingredients[1]) : ingredients[1];
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

  /* ─── 智能深度簡評生成引擎 (Intelligent Appraisal Summary Engine) ─── */
  function generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation) {
    if (!pkmData) return '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const specialty = pkmData.specialty || '';
    const isBerry = specialty.includes('樹果') || specialty === 'Berries';
    const isIng = specialty.includes('食材') || specialty === 'Ingredients';
    const isSkill = specialty.includes('技能') || specialty === 'Skills';
    const mainSkill = pkmData.main_skill || '';
    const currentGrade = (evaluation && evaluation.current && evaluation.current.grade) || (evaluation && evaluation.grade) || 'B';
    const currentScore = (evaluation && evaluation.current && evaluation.current.compositeScore) || (evaluation && evaluation.compositeScore) || 50;

    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    const slotLevels = [10, 25, 50, 70, 80];
    const activeSubskills = [];
    const futureSubskills = [];
    slotLevels.forEach(function(lv, idx) {
      const sk = subskillArr[idx];
      if (!sk) return;
      if (currentLv >= lv) {
        activeSubskills.push({ name: sk, level: lv });
      } else {
        futureSubskills.push({ name: sk, level: lv });
      }
    });

    const activeNames = activeSubskills.map(function(s) { return s.name; });

    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    const buff = natureObj ? natureObj.buffType : 'none';
    const debuff = natureObj ? natureObj.debuffType : 'none';

    // 特殊角色識別
    const isSlowpoke = isSlowpokeFamily(pkmData);
    const isBerryBurst = isBerryBurstSkillSpecialist(pkmData);
    const isHealer = isHealerSkillSpecialist(pkmData);
    const isHelperBoost = isHelperBoostSkillSpecialist(pkmData);
    const isChargeStrength = isChargeStrengthSkillSpecialist(pkmData);
    const isPotExpander = isPotExpanderSkillSpecialist(pkmData);
    const isExtraTasty = isExtraTastySkillSpecialist(pkmData);
    const isDreamShard = isDreamShardSkillSpecialist(pkmData);
    const isIngSkill = isIngredientSkillSpecialist(pkmData);
    const isMetronome = isMetronomeSkillSpecialist(pkmData);
    const isLegendary = isLegendaryPokemon(pkmData);

    // 關鍵副技能持有檢測
    const hasBFS_active = activeNames.indexOf('樹果數量S') !== -1 || activeNames.indexOf('Berry Finding S') !== -1;
    const hasBFS_future = futureSubskills.find(function(s) { return s.name === '樹果數量S' || s.name === 'Berry Finding S'; });

    const hasHB_active = activeNames.indexOf('幫手獎勵') !== -1 || activeNames.indexOf('Helping Bonus') !== -1;

    const hasIngM_active = activeNames.indexOf('食材機率提升M') !== -1 || activeNames.indexOf('Ingredient Finder M') !== -1;
    const hasIngS_active = activeNames.indexOf('食材機率提升S') !== -1 || activeNames.indexOf('Ingredient Finder S') !== -1;
    const hasIngM_future = futureSubskills.find(function(s) { return s.name === '食材機率提升M' || s.name === 'Ingredient Finder M'; });

    const hasSkillM_active = activeNames.indexOf('技能機率提升M') !== -1 || activeNames.indexOf('Skill Trigger M') !== -1;
    const hasSkillS_active = activeNames.indexOf('技能機率提升S') !== -1 || activeNames.indexOf('Skill Trigger S') !== -1;
    const hasSkillM_future = futureSubskills.find(function(s) { return s.name === '技能機率提升M' || s.name === 'Skill Trigger M'; });

    const hasSpeedM_active = activeNames.indexOf('幫忙速度M') !== -1 || activeNames.indexOf('Helping Speed M') !== -1;

    const hasInv_active = activeNames.some(function(s) { return s.indexOf('持有上限') !== -1 || s.indexOf('Inventory Up') !== -1; });

    // 食材組合分析
    const ingArr = (ingredients || []).filter(Boolean);
    const isAAA = ingArr.length >= 3 && ingArr[0] === ingArr[1] && ingArr[1] === ingArr[2];
    const isABB = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] === ingArr[2];
    const isABC = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] !== ingArr[2] && ingArr[0] !== ingArr[2];
    const hasTailLv30 = ingArr.length >= 2 && (ingArr[1] === '美味尾巴' || (ingArr[1] && ingArr[1].indexOf('尾巴') !== -1) || (ingArr[1] && ingArr[1].indexOf('Tail') !== -1));

    // 1. 呆呆獸家族 (核心戰略使命：解鎖美味尾巴)
    if (isSlowpoke) {
      if (hasTailLv30) {
        return isEN
          ? 'Strategic Unlock Specialist: Lv.30 unlocks "Slowpoke Tail", fulfilling the primary strategic mission of unlocking the highest-energy ingredient in Pokémon Sleep!'
          : '戰略解鎖專門手：Lv.30 精準解鎖「美味尾巴」，圓滿達成全遊戲最高能量食材之戰略開圖使命！解鎖後可常駐作為後備庫存手。';
      } else {
        return isEN
          ? 'Fatal Strategic Flaw: Lv.30 fails to roll "Slowpoke Tail", missing the essential strategic unlock value of the Slowpoke family.'
          : '戰略定位失職：Lv.30 未能開出「美味尾巴」，喪失了呆呆獸家族核心戰略開圖價值，建議作為過渡替補或換糖。';
      }
    }

    // 2. 樹果型專精分析
    if (isBerry) {
      if (hasBFS_active) {
        if (hasHB_active || hasSpeedM_active || buff === 'speed' || debuff === 'ingredient') {
          return isEN
            ? 'Top-Tier Berry Cannon! "Berry Finding S" combined with excellent Speed boosts produces 3 berries per help cycle, serving as the ultimate Snorlax energy engine.'
            : '天花板級樹果砲台！解鎖第一神技「樹果數量S（樹果S）」配合極致幫忙速度加成，單次幫忙穩定產出 3 顆樹果，卡比獸能量滾雪球的最強主力。';
        } else {
          return isEN
            ? 'Core Berry Anchor: Unlocked God-tier "Berry Finding S", providing +1 berry per cycle and delivering strong, reliable island pushing power.'
            : '畢業級樹果主力：已解鎖第一核心神技「樹果數量S（樹果S）」，單次產果直接 +1，具備極強的島嶼推分實力。';
        }
      } else if (hasBFS_future) {
        return isEN
          ? `High Potential Seed: "Berry Finding S" unlocks at Lv.${hasBFS_future.level}. Recommended to prioritize training to unlock this game-changing leap in berry output!`
          : `未來潛力股：核心神技「樹果數量S（樹果S）」將於 Lv.${hasBFS_future.level} 解鎖，建議作為重點種子培育，解鎖後產能將迎來決定性質變！`;
      } else {
        if (hasHB_active && (hasSpeedM_active || buff === 'speed')) {
          return isEN
            ? 'High-Speed Auxiliary: Lacks "Berry Finding S", but extreme speed kit (Helping Bonus + Speed buffs) makes it a valuable team accelerator and transitional anchor.'
            : '極限速攻流：雖缺乏「樹果數量S」，但憑藉「幫手獎勵 + 幫忙速度加成」大幅縮短全員幫忙間隔，適合作為優質團隊加速掛件與過渡主力。';
        } else if (debuff === 'speed') {
          return isEN
            ? 'Severely Handicapped: Speed Down nature directly cripples help cycles. Combined with no BFS, output is too low for competitive island production.'
            : '致命減速：性格減幫忙速度（-7.5%）拖慢節奏，且未持有「樹果數量S」，產能難以支撐島嶼進度。';
        } else {
          return isEN
            ? 'Transitional Berry Specialist: Lacks core "Berry Finding S", capping output at 2 berries per help. Suitable as an early island transitional placeholder.'
            : '過渡型樹果手：缺乏核心神技「樹果數量S」，單次僅能產出 2 顆樹果，產能上限受限，適合作為島嶼前期拓荒過渡。';
        }
      }
    }

    // 3. 技能型專精分析 (全面精細化劃分各大戰略流派)
    if (isSkill) {
      // 3.1 樹果遽增型 (Berry Burst: 謎擬Q, 蜥蜴王, 烈焰猴, 勇士雄鷹, 拉帝歐斯)
      if (isBerryBurst) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return isEN
              ? 'Top-Tier Berry Burst Cannon! "Berry Burst" combined with "Berry Finding S" yields double help berries and triggers explosive team berry surges (Mimikyu doubles on Great Success!). An apex island pusher for active collectors; 1.4x boosted during Buncha Berries events.'
              : '天花板級樹果爆發砲台！「樹果遽增」主技能與「樹果數量S」完美結合，單次幫忙穩定產出加倍樹果，技能觸發更能引爆全隊巨額樹果能量（謎擬Q大成功翻倍爆發更強）！在喜愛樹果島嶼或樹果週（1.4倍加成）為頂尖衝分主力，勤勞收包可享極限產能。';
          }
          return isEN
            ? 'Berry Burst Pusher: Equipped with "Berry Finding S" for high baseline berry generation, synergizing with Berry Burst procs for strong island push power. Regular collection recommended.'
            : '樹果遽增推進主力：具備「樹果數量S」大幅提升常態樹果產量，配合主技能隨機爆發隊友樹果，具備極佳的推分爆發力。建議勤勞收包並搭配主技能種子或技能機率副技能。';
        }
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'High-Frequency Berry Burst Core: Excellent main skill trigger rate triggers frequent berry surges directly into Snorlax. Unlocking BFS or leveling main skill offers enormous burst potential (1.4x during Berry Weeks).'
            : '高頻樹果遽增核心：主技能發動率卓越，能頻繁為卡比獸爆發樹果能量；若未來能解鎖樹果數量S或配合樹果週活動（1.4倍加成），將具備天花板級爆發上限！';
        }
        return isEN
          ? 'Berry Burst Specialist: Main skill "Berry Burst" provides instant team berry surges. Prioritize skill seeds and skill trigger subskills for maximum efficiency.'
          : '樹果遽增技能型：主技能為「樹果遽增」，能瞬間爆發樹果能量，建議搭配主技能種子或技能機率副技能以提升發動次數。';
      }

      // 3.2 活力全體療癒補師 (Healers: 沙奈朵, 仙子伊布, 胖可丁, 巴布土撥, 克雷色利亞, 壺壺)
      if (isHealer) {
        if (debuff === 'skill') {
          return isEN
            ? 'Fatal Healer Flaw: Main Skill Trigger Down nature (-20%) cripples daily activation rate, failing to maintain team energy above the 80% speed threshold.'
            : '致命硬傷：補師性格為減少主技能機率（-20%），全天期望回能次數嚴重不足，難以維持全隊 80% 以上極限活力運轉。';
        }
        if (hasSkillM_active && (buff === 'skill' || hasSpeedM_active || hasHB_active)) {
          const extraNote = hasBFS_active ? (isEN ? ' (Note: BFS accelerates bag overflow; clear inventory before sleep to prevent blocked procs).' : '（注意：持有樹果S易過早滿包，睡前務必清空背包避免阻斷技能判定）。') : '';
          return isEN
            ? `Top-tier Team Healer Engine! High trigger rate guarantees 4-6 procs daily, locking the team at high energy for 2.2x maximum helping speed.${extraNote}`
            : `頂尖隊伍回能引擎！雙重技能發動機率加成，全天期望觸發 4~6 次以上，能牢牢鎖定全隊高活力上限，享受 2.2 倍極限幫忙速！${extraNote}`;
        }
        if (!hasSkillM_active && !hasSkillS_active && buff !== 'skill') {
          if (hasSkillM_future) {
            return isEN
              ? `Promising Healer: Core "Skill Trigger M" unlocks at Lv.${hasSkillM_future.level}. Prioritize leveling to establish reliable team energy coverage.`
              : `潛力補師：關鍵「技能機率提升M」將於 Lv.${hasSkillM_future.level} 解鎖，建議優先培育升級以構築全隊回能防線。`;
          }
          return isEN
            ? 'Insufficient Trigger Rate: Lacks active Skill Trigger subskills or nature boost; healing frequency is too low to sustain all-day team vitality.'
            : '發動期望不足：缺乏主技能機率提升副技能或性格加成，發動頻率偏低，無法勝任穩定維持全隊活力的隊伍核心基石。';
        }
        return isEN
          ? 'Qualified Team Healer: Decent trigger rate for stable energy support, helping the team maintain high daytime work efficiency.'
          : '及格團隊補師：具備穩健的發動頻率，能提供基礎活力續航，協助隊伍維持日間高水準工作效率。';
      }

      // 3.3 傳說神獸幫手加速型 (Helper Boost: 雷公, 炎帝, 水君, 風速狗, 雷伊布, 艾路雷朵)
      if (isHelperBoost) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Mono-Type Team Amplifier: "Helper Boost" triggers instant team-wide production cycles, scaling higher with more unique same-type team members! Prioritizes Skill Triggers and Helping Bonus to avoid self-bag overflow, while teammates carry BFS to massively amplify output.'
            : '同屬性純色隊終極放大器！主技能「幫手加速」單次發動可引爆全隊即時產出，隊伍中同屬性不同種類寶可夢越多倍率越高。神獸本體首重技能機率與持有上限防溢滿，而將樹果數量S交由「隊友」攜帶以最大化技能爆發收益！';
        }
        return isEN
          ? 'Mono-Type Helper Specialist: "Helper Boost" triggers instant multi-helps for all same-type members. Skill trigger subskills and Main Skill Seeds are primary priorities.'
          : '同屬性純色隊發動機：主技能「幫手加速」能帶動同屬性隊員進行多次額外幫忙。基礎發動率偏低（約2%），極度依賴技能機率副技能與主技能種子投入。';
      }

      // 3.4 單體充能直傷型 (Charge Strength S/M: 電龍, 太陽伊布, 哥達鴨, 樹才怪, 隨風球, 音波龍, 達克萊伊)
      if (isChargeStrength) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return isEN
              ? 'Top-Tier Hybrid Charge Cannon! Unlocks the "Charge Strength + Berry Finding S" dual-track form. On favorite berry islands (e.g. Ampharos at Power Plant, Espeon at Lakeside, Golduck at Beach), active collectors achieve the ultimate theoretical energy ceiling (thousands in direct skill strength + double island berries)! Collect regularly to prevent bag overflow.'
              : '頂級雙修能量砲台！解鎖「能量填充 + 樹果數量S」雙修形態。在對應喜好樹果島嶼上（如電龍在發電廠、太陽伊布在湖畔、哥達鴨在海灘），為勤勞收包玩家提供極限級總能量期望（單次直傷數千 + 每次雙倍島嶼樹果）！放置時需注意及時清包以防滿包阻斷技能判定。';
          }
          return isEN
            ? 'Hybrid Charge Producer: "Berry Finding S" provides high-value island berry yield alongside steady Charge Strength direct energy. High-frequency collection is recommended to prevent Sneaky Snacking from halting skill checks.'
            : '雙修型單兵直傷手：持有「樹果數量S」提供可觀樹果副產能，配合主技能能量填充提供穩定分數進帳，建議高頻收包以防滿包偷吃阻斷技能。';
        }
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'High-Yield Energy Cannon: Leverages frequent "Charge Strength" activations for heavy single-target Snorlax point generation.'
            : '強力單兵能量砲台：倚賴「能量填充」提供高額直傷分數，發動機率加成顯著，具備極佳的單兵獨立產分戰鬥力。';
        }
        return isEN
          ? 'Charge Strength Specialist: Provides steady direct Snorlax energy, depending primarily on skill trigger rate and main skill level.'
          : '單兵能量手：主技能為直接提升卡比獸能量，依賴主技能等級與發動頻率支撐產能。';
      }

      // 3.5 傳說/幻之寶可夢專屬機制 (超夢, 夢幻, 達克萊伊, 克雷色利亞)
      if (isLegendary) {
        if (mainSkill.includes('精神擊破') || mainSkill.includes('樹果領域')) {
          return isEN
            ? 'Legendary Berry Field Engine! Signature move "Psystrike" deploys a Berry Field, massively multiplying specific berry yields for team-wide strategic breakthroughs.'
            : '傳說樹果領域核心！專屬主技能「精神擊破」能展開樹果領域，全面提升特定屬性樹果能量，為全隊帶來跨維度的戰略爆發！';
        }
        if (mainSkill.includes('十項全能') || mainSkill.includes('揮指')) {
          return isEN
            ? 'Mythical All-Rounder! Signature move "Decathlon" draws from an unpredictable repertoire of master skills, serving as an adaptable wildcard.'
            : '幻之十項全能戰術手！專屬主技能「十項全能」技能池深不可測，為全隊提供極具彈性的戰術補強與意外上限。';
        }
        if (mainSkill.includes('夢魘')) {
          return isEN
            ? 'Mythical Dark Charge Burst! Signature move "Bad Dreams" unleashes massive direct energy points with outstanding base speed.'
            : '幻之惡系直傷爆發手！專屬主技能「夢魘」單次提供巨額卡比獸直傷能量，基礎速度快，為頂級獨立產分戰力。';
        }
      }

      // 3.6 料理美味度/大成功型 (Extra Tasty: 咚咚鼠, 海豹球佳節)
      if (isExtraTasty) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Extra Tasty Specialist: High trigger rate stacks dish crit probability rapidly, tailor-made for exploding weekend master dishes with multi-hundred-thousand point bursts! Strictly avoid BFS to protect skill procs.'
            : '料理大成功爆擊手：主技能「料理成功S」能不斷疊加下次料理的大成功機率，專為每週衝擊大師高階時引爆週末大餐（數十萬能量爆擊）的終極戰術組件！首重技能機率與持有上限，嚴禁樹果S阻斷判定。';
        }
        return isEN
          ? 'Tactical Extra Tasty Specialist: Stacks dish critical success chance to prepare for explosive cooking scores during event weeks.'
          : '料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊儲備機率，建議提高技能機率與持有上限。';
      }

      // 3.7 料理擴鍋型 (Pot Expanders: 自爆磁怪, 火伊布, 冰伊布, 負電拍拍, 顫弦蠑螈)
      if (isPotExpander) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Pot Expander: High main skill trigger rate expands pot size rapidly, tailor-made for breaking cooking limits on weekends!'
            : '極品戰術擴鍋手：具備優秀的主技能發動加成，能高頻擴充鍋子容量，專為週末衝擊頂級極限大菜（突破鍋子上限）而生！';
        }
        return isEN
          ? 'Tactical Pot Specialist: Main skill "Cooking Power Up S" expands pot capacity for preparing high-tier recipes during event weeks.'
          : '戰術擴鍋專門：主技能「料理強化S」能擴充鍋容量，適合週末囤積鍋空間以衝擊極限大型食譜。';
      }

      // 3.8 夢之碎片型 (Dream Shards: 路卡利歐, 喵喵, 貓老大, 勾魂眼, 吞食獸)
      if (isDreamShard) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Premier Dream Shard Harvester: High trigger rate paired with Dream Shard subskills yields massive currency during Good Sleep Days and Candy Boost weeks!'
            : '夢之碎片頂級收割手：高頻發動夢之碎片主技能，在好眠日活動與糖果強化週是不可或缺的頂尖資金農夫！';
        }
        return isEN
          ? 'Dream Shard Specialist: Main skill provides direct Dream Shards, crucial for sustaining high late-game candy power-up costs.'
          : '夢之碎片專門手：主技能為直接獲取夢之碎片，為後期高昂的寶可夢升級糖果消耗提供資金支持。';
      }

      // 3.9 食材獲取/精選型技能寵 (Ingredient Draw: 水伊布, 伊布, 毒電嬰, 正電拍拍, 穿山王, 摔角鷹人, 赫拉克羅斯)
      if (isIngSkill) {
        if (hasSkillM_active || buff === 'skill') {
          return isEN
            ? 'Rapid Stockpile Emergency Support: High trigger rate pours abundant random ingredients into inventory, instantly curing recipe ingredient shortages!'
            : '應急食材爆發中樞：高額技能發動率能瞬間填補龐大食材庫存，化解高階料理缺料危機，是食材告急時的最佳急救隊員！';
        }
        return isEN
          ? 'Ingredient Draw Specialist: Main skill fetches bonus random ingredients to support daily kitchen consumption.'
          : '應急食材補給手：主技能為獲取額外隨機食材，能輔助日常烹飪食材供給。';
      }

      // 3.10 隨機揮指型 (Metronome: 波克基斯, 波克比, 夢幻)
      if (isMetronome) {
        return isEN
          ? 'Wildcard Metronome Specialist: Triggers unpredictable random skills across the game, delivering high excitement and unexpected score leaps.'
          : '隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與意外上限，在日常探索中常有驚喜表現。';
      }

      if (debuff === 'skill') {
        return isEN
          ? 'Fatal Specialty Flaw: Nature reduces Main Skill Trigger (-20%), severely crippling core activation frequency.'
          : '致命缺陷：性格減少主技能發動機率（-20%），嚴重閹割核心發動頻率，不符技能型定位。';
      }
      if (hasSkillM_active || buff === 'skill') {
        if (hasSkillM_future) {
          return isEN
            ? `Specialized Skill Anchor: Strong active skill trigger frequency, with further performance leaps upon reaching Lv.${hasSkillM_future.level}.`
            : `專精技能主力：當前技能發動表現活躍，且後續 Lv.${hasSkillM_future.level} 仍有技能提升空間，戰術運轉流暢。`;
        }
        return isEN
          ? 'Specialized Skill Anchor: Excellent skill trigger bonuses ensure high activation frequency for stable specialty performance.'
          : '專精技能主力：優質的技能機率加成確保了穩定的觸發頻率，能充分發揮技能專長優勢。';
      }
      if (hasSkillM_future) {
        return isEN
          ? `Future Skill Prospect: Core "Skill Trigger M" unlocks at Lv.${hasSkillM_future.level}. Prioritize leveling to unleash true skill potential.`
          : `潛力技能手：關鍵「技能機率提升M」將於 Lv.${hasSkillM_future.level} 解鎖，建議優先培育升級以釋放核心潛力。`;
      }
      return isEN
        ? 'Standard Skill Specialist: Baseline skill trigger rate; suitable as a situational support or transitional pick.'
        : '常規技能手：技能觸發率處於基準線，適合作為特定情境替補或過渡成員。';
    }

    // 4. 食材型專精分析 (嚴禁混入技能型要求)
    if (isIng) {
      if (debuff === 'ingredient') {
        return isEN
          ? 'Fatal Specialty Flaw: Nature reduces Ingredient Finding (-20%), causing frequent berry dilution and unstable cooking supply. Not recommended for major investment.'
          : '致命短板：性格減少食材發現率（-20%），產出頻繁被樹果稀釋，極難穩定供應主力食譜所需食材，不建議投入過多資源。';
      }

      let ingSpreadDesc = '';
      if (isAAA) {
        ingSpreadDesc = isEN ? ' Features pure mono-ingredient (AAA) spread for maximum focused output.' : '搭配極品純色 AAA 食材配置，特定食材產量高度集中。';
      } else if (isABB) {
        ingSpreadDesc = isEN ? ' Features strong ABB dual spread, excelling in mid-to-late advanced ingredient yield.' : '搭配強勢 ABB 雙色配置，二階與三階食材量產能力卓越。';
      } else if (isABC) {
        ingSpreadDesc = isEN ? ' Split ABC spread dilutes single ingredient yield.' : '三色 ABC 雜色配置略微稀釋單項食材產量。';
      }

      if (hasIngM_active || buff === 'ingredient') {
        if (hasBFS_active) {
          if (hasInv_active) {
            return isEN
              ? `Top Hybrid Specialist: Active "Ingredient Finder M" backed by BFS and Inventory Up provides exceptional food yields with massive bonus berries.`
              : `極品雙修食材手！食材機率大幅提升搭配「樹果數量S」與「持有上限提升」，食材爆發力極強且兼顧頂級樹果副產能！`;
          } else {
            return isEN
              ? `High-Burst Hybrid: Excellent ingredient rate and BFS provide huge dual yield, but inventory caps fast overnight—collect regularly.`
              : `高爆發雙修型：食材機率優異並持有「樹果數量S」，但缺乏持有上限容易在睡眠期間提早滿包阻斷產料，建議勤勞收成。`;
          }
        }

        return isEN
          ? `Premier Kitchen Anchor! High ingredient finding rate ensures abundant cooking supply for top recipes.${ingSpreadDesc}`
          : `頂級食材供應中樞！高額食材發現率確保了穩定龐大的料理供應，做大菜的最佳後勤基石。${ingSpreadDesc}`;
      }

      if (!hasIngM_active && !hasIngS_active && buff !== 'ingredient') {
        if (hasIngM_future) {
          return isEN
            ? `Future Ingredient Prospect: Core "Ingredient Finder M" unlocks at Lv.${hasIngM_future.level}. Prioritize leveling to establish reliable kitchen supply.`
            : `潛力食材手：關鍵「食材機率提升M」將於 Lv.${hasIngM_future.level} 解鎖，建議優先培育升級以構築主力供貨能力。`;
        }
        if (hasSpeedM_active || buff === 'speed' || hasHB_active) {
          return isEN
            ? 'Speed-Driven Producer: Lacks direct ingredient finder boost, but high helping speed compensates to provide acceptable general output.'
            : '幫速彌補型：雖缺乏直接食材機率提升，但憑藉優良的幫忙速度維持了合格的基礎供貨，適合作為實用過渡。';
        }
        return isEN
          ? 'Lacks Ingredient Output: Missing ingredient finder and speed boosts; yields are insufficient to sustain demanding high-tier dishes.'
          : '缺乏食材爆發力：前中期未持有食材機率加成或顯著幫速，產量難以滿足高階大型料理（如大菜咖哩/沙拉）的消耗需求。';
      }

      return isEN
        ? `Solid Ingredient Provider: Steady supply for regular meals, serving reliably in daily cooking rotations.${ingSpreadDesc}`
        : `穩健食材供應手：供貨節奏穩定，足以勝任日常食譜輪替與食材儲備。${ingSpreadDesc}`;
    }

    return isEN
      ? `${currentGrade} Grade (${currentScore} pts) - Reliable team member with balanced baseline performance.`
      : `${currentGrade} 級（${currentScore}分）- 基礎素質均衡，適合作為隊伍實用成員。`;
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

    const intelligentSummary = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    return Object.assign({}, currentEval, {
      current: currentEval,
      potential: potentialEval,
      currentScore: currentEval.compositeScore,
      currentGrade: currentEval.grade,
      potentialScore: potentialEval ? potentialEval.compositeScore : currentEval.compositeScore,
      potentialGrade: potentialEval ? potentialEval.grade : currentEval.grade,
      milestones: milestones,
      milestoneNote: milestones.length > 0 ? milestones[0].text : '',
      summaryNote: intelligentSummary,
      intelligentSummary: intelligentSummary
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
    height = height || 240;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta(isEN);
    const cx = width / 2;
    const cy = (height / 2) + 2;
    const marginY = isCompact ? 22 : 30;
    const marginX = isCompact ? 36 : 52;
    const r = Math.min((width - marginX * 2) / 2, (height - marginY * 2) / 2);

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

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="100%" style="display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
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

  /* ─── 副技能分級判斷 ───────────────────────────────────── */
  const GOLD_SUBSKILLS = new Set(['幫手獎勵', '樹果數量S', '技能等級提升M', '夢之碎片獎勵', '睡眠EXP獎勵', '研究EXP獎勵', '活力回復獎勵']);
  const BLUE_SUBSKILLS = new Set(['幫忙速度M', '食材機率提升M', '技能機率提升M', '技能等級提升S', '持有上限提升L', '持有上限提升M']);

  function getSkillTier(sName) {
    if (!sName) return 'white';
    const subskillPool = (typeof window !== 'undefined' && ((window.UserBox && window.UserBox.SUBSKILLS_DATA) || (window.PokemonBoxApp && window.PokemonBoxApp.SUBSKILLS_DATA))) || [];
    const found = subskillPool.find(function (s) { return s.name === sName; });
    if (found && found.tier) return found.tier;
    if (GOLD_SUBSKILLS.has(sName)) return 'gold';
    if (BLUE_SUBSKILLS.has(sName)) return 'blue';
    return 'white';
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
    const nickname = (pkmOrBoxItem.nickname || '').trim();

    const evaluation = evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel);
    if (!evaluation) return;

    let modal = document.getElementById('modal-appraisal-report');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-appraisal-report';
      modal.className = 'appraisal-modal-backdrop';
      document.body.appendChild(modal);
    }

    const radarSVG = renderRadarChartSVG(evaluation.scores, 340, 240);
    const SIX_DIM_META = getSixDimMeta(isEN);
    const displayName = isEN ? (pkmData.name_en || pkmData.name_cn) : (pkmData.name_cn || pkmData.name_en);
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    // 遊戲同款性格展示排版 (In-Game Style Nature Display)
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    let natureEffectHtml = '';
    if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
      const rawBuff = isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff;
      const rawDebuff = isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff;
      const buffLabel = rawBuff.replace(/[▲▼]/g, '').trim();
      const debuffLabel = rawDebuff.replace(/[▲▼]/g, '').trim();
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-row nature-buff-row">
            <span class="nature-effect-label">${escapeHtml(buffLabel)}</span>
            <span class="nature-arrows-up">▲▲</span>
          </div>
          <div class="nature-effect-row nature-debuff-row">
            <span class="nature-effect-label">${escapeHtml(debuffLabel)}</span>
            <span class="nature-arrows-down">▼▼</span>
          </div>
        </div>
      `;
    } else {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral">
            ${isEN ? 'Has no distinctive personality traits' : '沒有性格帶來的特色（無影響）'}
          </div>
        </div>
      `;
    }

    const berry = (typeof window.getPokemonBerry === 'function') 
      ? window.getPokemonBerry(pkmData) 
      : (pkmData.berry || { name: '', icon: '' });
    const berryName = window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--');

    // 專長型態 (不展示「專長」二字，僅展示 食材型 / 技能型 / 樹果型，無外框)
    let specTypeLabel = isEN ? 'Ingredient' : '食材型';
    let specClass = 'spec-ingredient';
    if (pkmData.specialty && (pkmData.specialty.includes('樹果') || pkmData.specialty === 'Berries')) {
      specClass = 'spec-berry';
      specTypeLabel = isEN ? 'Berries' : '樹果型';
    } else if (pkmData.specialty && (pkmData.specialty.includes('技能') || pkmData.specialty === 'Skills')) {
      specClass = 'spec-skill';
      specTypeLabel = isEN ? 'Skills' : '技能型';
    }

    let summaryNote = pkmOrBoxItem.summaryNote || '';
    if (!summaryNote || summaryNote.includes('質變躍升') || summaryNote.includes('建議優先升至') || summaryNote.includes('未達')) {
      summaryNote = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation);
    }

    // 主技能資訊 (Main Skill & Level)
    const rawMainSkill = (pkmData && pkmData.main_skill) || (pkmData && pkmData.skill && pkmData.skill.name) || pkmOrBoxItem.main_skill || '';
    const mainSkillName = rawMainSkill ? (window.I18N ? window.I18N.getMainSkillName(rawMainSkill) : rawMainSkill) : (isEN ? 'Main Skill' : '主技能');
    const skillLvl = skillLevel || 1;

    // 食材組合資訊 (Ingredients & Quantity, 3 Slots with Level Unlock)
    const ingSlotNames = [
      (ingredients && ingredients[0]) ? (typeof ingredients[0] === 'string' ? ingredients[0] : ingredients[0].name) : (pkmOrBoxItem.ing1 || (pkmData && pkmData.ingredients && pkmData.ingredients[0] ? pkmData.ingredients[0].name : '')),
      (ingredients && ingredients[1]) ? (typeof ingredients[1] === 'string' ? ingredients[1] : ingredients[1].name) : (pkmOrBoxItem.ing2 || (pkmData && pkmData.ingredients && pkmData.ingredients[1] ? pkmData.ingredients[1].name : '')),
      (ingredients && ingredients[2]) ? (typeof ingredients[2] === 'string' ? ingredients[2] : ingredients[2].name) : (pkmOrBoxItem.ing3 || (pkmData && pkmData.ingredients && pkmData.ingredients[2] ? pkmData.ingredients[2].name : ''))
    ];

    const ingChipsHtml = [0, 1, 2].map(function(idx) {
      const unlockLv = idx === 0 ? 1 : (idx === 1 ? 30 : 60);
      const isUnlocked = currentLv >= unlockLv;
      const lockClass = !isUnlocked ? ' ing-locked' : '';
      const ingName = ingSlotNames[idx];
      const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

      if (!ingName || ingName === '--') {
        return `
          <div class="appraisal-ing-chip is-empty${lockClass}">
            <span class="appraisal-ing-chip-empty">--</span>
          </div>
        `;
      }
      const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
      const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function')
        ? window.I18N.getIngredientIcon(ingName)
        : '';
      const count = getIngCountFromBase(pkmData, idx, ingName);
      return `
        <div class="appraisal-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
          ${iconUrl ? `<img src="${iconUrl}" class="appraisal-ing-chip-icon" alt="${escapeHtml(displayName)}">` : ''}
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="appraisal-modal-container">
        <!-- 頂部標題列 (高度加寬，垂直置中，整合雙軌評級與極簡關閉鈕) -->
        <div class="appraisal-modal-header">
          <div class="appraisal-header-title-group">
            <span class="appraisal-modal-badge">${isEN ? '[★] Diagnostic Report' : '[★] 深度能力診斷報告'}</span>
            <h2 class="appraisal-pokemon-title">
              ${nickname ? `<span class="appraisal-pokemon-nickname">${escapeHtml(nickname)}</span> <span class="appraisal-pokemon-base-name" style="font-size:0.85em;color:var(--text-secondary);font-weight:normal;">(${displayName})</span>` : displayName}
              ${!isEN && pkmData.name_en ? `<span class="appraisal-pokemon-en">${pkmData.name_en}</span>` : ''}
            </h2>
          </div>

          <div class="appraisal-header-actions">
            <!-- 雙軌綜合評級徽章 (對齊圖鑑彈窗風格，垂直置中，當前亮眼 + 滿級低調) -->
            <div class="appraisal-dual-verdict-column">
              <!-- 當前實力 (Current Level Rating) -->
              <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${isEN ? `Current Level Rating (Lv.${currentLv})` : `當前實力評級 (Lv.${currentLv})`}">
                <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${isEN ? `Lv.${currentLv}` : `當前 Lv.${currentLv}`}</span>
                <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
              </div>
              <!-- 滿級潛力 (Max Potential Rating) -->
              <div class="pokedex-header-verdict-badge potential-track" title="${isEN ? 'Max Potential Rating (Lv.100)' : '畢業潛力評級 (Lv.100)'}">
                <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${isEN ? 'Lv.100 Pot' : '滿級潛力'}</span>
                <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
              </div>
            </div>

            <!-- 極簡關閉按鈕 -->
            <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="${isEN ? 'Close' : '關閉'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 報告核心主體 (精簡雙欄排版，徹底去除多餘巢狀容器外框) -->
        <div class="appraisal-modal-body">
          <!-- 左欄：寶可夢基本卡片與配置 (純淨無外框容器) -->
          <div class="appraisal-left-col">
            <div class="appraisal-profile-card">
              <div class="appraisal-avatar-wrapper">
                <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                <span class="appraisal-level-badge">Lv. ${currentLv}</span>
              </div>
              
              <!-- 樹果與專長 (專長使用精緻圓形圖示) -->
              <div class="appraisal-specialty-row" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;">
                <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                  ${berry.icon ? `<img src="${berry.icon}" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                </span>
                ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 22, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
              </div>

              <!-- 主技能名稱與等級 (Appraisal Main Skill) -->
              <div class="appraisal-mainskill-row">
                <span class="appraisal-mainskill-label">${isEN ? 'Main Skill:' : '主技能：'}</span>
                <span class="appraisal-mainskill-name">${escapeHtml(mainSkillName)}</span>
                <span class="appraisal-mainskill-level">Lv.${skillLvl}</span>
              </div>

              <!-- 食材三階插槽組合 (Appraisal Ingredients, 尚未開放插槽半透明) -->
              <div class="appraisal-ing-parallel-row">
                <span class="appraisal-ing-row-label">${isEN ? 'Ingredients:' : '食材：'}</span>
                <div class="appraisal-ing-chips-grid">
                  ${ingChipsHtml}
                </div>
              </div>

              <!-- 遊戲同款性格展示 (膠囊外框 + 性格標籤 + 右側上下條目，純淨無外框容器) -->
              <div class="appraisal-config-section" style="margin-top:12px;display:flex;justify-content:center;">
                <div class="appraisal-nature-game-card">
                  <div class="nature-pill-capsule">
                    <span class="nature-capsule-tag">${isEN ? 'Nature' : '性格'}</span>
                    <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                  </div>
                  ${natureEffectHtml}
                </div>
              </div>

              <!-- 睡飽飽獎章 (無多餘標題) -->
              ${ribbonLevel > 0 ? `
                <div class="appraisal-config-section" style="margin-top:8px;display:flex;justify-content:center;">
                  <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:6px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;font-size:12.5px;font-weight:700;">
                    <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" style="width:20px;height:20px;object-fit:contain;" alt="Ribbon" />
                    <span>${isEN ? `Tier ${ribbonLevel} (+${evaluation.ribbonBonus.carry} Carry${evaluation.ribbonBonus.speedDiscount > 0 ? ` · -${Math.round(evaluation.ribbonBonus.speedDiscount * 100)}% Speed` : ''})` : `第 ${ribbonLevel} 階段 (+${evaluation.ribbonBonus.carry} 持有${evaluation.ribbonBonus.speedDiscount > 0 ? ` · 幫速 -${Math.round(evaluation.ribbonBonus.speedDiscount * 100)}%` : ''})`}</span>
                  </div>
                </div>
              ` : ''}

              <!-- 副技能清單 (2+2+1 遊戲同款外框顏色與排列，無多餘標題) -->
              <div class="appraisal-config-section" style="margin-top:10px;">
                <div class="appraisal-subskills-grid">
                  ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                    const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                    const sName = rawName ? (window.I18N ? window.I18N.getSubSkillName(rawName) : rawName) : '--';
                    const tier = getSkillTier(rawName);
                    const isUnlocked = currentLv >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = rawName 
                      ? (isEN ? `${sName} (Lv.${lv}${!isUnlocked ? ' - Locked' : ''})` : `${sName} (Lv.${lv}${!isUnlocked ? '未解鎖' : ''})`)
                      : (isEN ? `Lv.${lv} Slot` : `Lv.${lv} 欄位`);
                    return `
                      <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(sName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- 右欄：雷達圖 + 六維量表 + 深度點評 + 智能簡評 (精簡排版，純淨無外框容器) -->
          <div class="appraisal-right-col">
            <!-- 上半部：雷達圖與六維能量條 (縮小上下邊距) -->
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

            <!-- 右邊最下方：PR 智能簡評欄 (純淨簡評提示條) -->
            <div class="appraisal-summary-bar">
              <span style="font-size:12.5px;font-weight:800;color:#38bdf8;white-space:nowrap;flex-shrink:0;">${isEN ? 'Appraisal Note:' : '智能簡評：'}</span>
              <span style="font-size:12.5px;color:#e2e8f0;line-height:1.4;">${escapeHtml(summaryNote)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex'; if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
    document.body.style.overflow = 'hidden';

    // 點選遮罩外部關閉與 Escape 鍵關閉
    modal.onclick = function(e) {
      if (e.target === modal) {
        closeAppraisalModal();
      }
    };
    if (modal._onKeydown && typeof window.removeEventListener === 'function') {
      window.removeEventListener('keydown', modal._onKeydown);
    }
    modal._onKeydown = function(e) {
      if (e.key === 'Escape') {
        closeAppraisalModal();
      }
    };
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('keydown', modal._onKeydown);
    }
  }

  function closeAppraisalModal() {
    const modal = document.getElementById('modal-appraisal-report');
    if (!modal) return;
    if (modal._onKeydown) {
      if (typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', modal._onKeydown);
      }
      modal._onKeydown = null;
    }
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
    isCustomized: false,
    editMode: false
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

    const baseIngs = (pkm && pkm.ingredients) ? pkm.ingredients : [];
    const ing1 = item.ing1 || (baseIngs[0] ? baseIngs[0].name : '');
    const ing2 = item.ing2 || (baseIngs[1] ? baseIngs[1].name : ing1);
    const ing3 = item.ing3 || (baseIngs[2] ? baseIngs[2].name : ing2);
    labState.ingredients = [ing1, ing2, ing3].filter(Boolean);

    labState.ribbon = parseInt(item.ribbon, 10) || 0;
    labState.nickname = item.nickname || '';
    labState.isCustomized = false;
    labState.editMode = false;
  }

  function onBoxItemSelect(uid) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!uid) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.isCustomized = false;
      labState.editMode = false;
      updateLabUI();
      return;
    }
    const item = userBox.find(function (p) { return p.uid === uid; });
    if (item) {
      loadBoxItem(item);
      labState.editMode = false;
      updateLabUI();
    }
  }

  function resetToBoxOriginal() {
    if (!labState.selectedBoxUid) return;
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const item = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; });
    if (item) {
      loadBoxItem(item);
    }
  }

  function enterEditMode() {
    labState.editMode = true;
    updateLabUI();
  }

  function cancelEditMode() {
    resetToBoxOriginal();
    labState.editMode = false;
    updateLabUI();
  }

  function saveEditMode() {
    if (!labState.selectedBoxUid) return;
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') 
      ? window.UserBox.getUserBox() 
      : [];
    const item = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; });
    if (item) {
      item.level = labState.level;
      item.nature = labState.nature;
      item.subskills = labState.subskills.slice();
      item.ribbon = labState.ribbon;
      item.nickname = (labState.nickname || '').trim();
      if (labState.ingredients[0]) item.ing1 = labState.ingredients[0];
      if (labState.ingredients[1]) item.ing2 = labState.ingredients[1];
      if (labState.ingredients[2]) item.ing3 = labState.ingredients[2];

      if (window.UserBox && typeof window.UserBox.setUserBox === 'function') {
        window.UserBox.setUserBox(userBox);
      }
      labState.editMode = false;
      labState.isCustomized = false;
      updateLabUI();
      if (typeof window.showToast === 'function') {
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        window.showToast(isEN ? 'Pokémon updated successfully!' : '寶可夢數值已成功更新！');
      }
    }
  }

  function onNicknameChange(val) {
    labState.nickname = val || '';
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
  }

  function onIngredientChange(slotIdx, val) {
    labState.ingredients[slotIdx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isMobileH5 = typeof document !== 'undefined' && (!!document.querySelector('.mobile-h5-app') || (document.body && document.body.classList.contains('mobile-h5-app')));

    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    
    if (pokemons.length === 0) {
      targetElement.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">${isEN ? 'Loading Pokédex data...' : '載入圖鑑資料中...'}</div>`;
      return;
    }

    if (userBox.length === 0) {
      targetElement.innerHTML = `
        <div class="lab-box-empty-container" style="padding:48px 20px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:12px;opacity:0.8;">[!]</div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            ${isEN ? 'No Pokémon in Box' : '倉庫中尚無寶可夢'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);max-width:320px;margin:0 auto 18px;line-height:1.5;">
            ${isEN ? 'Please register Pokémon in the Box tab first, then evaluate them here!' : '請先在【寶可夢倉庫】新增登錄寶可夢後，再來進行深度評測！'}
          </div>
          <button type="button" class="btn-primary" onclick="if(window.switchMainTab)window.switchMainTab('box');" style="padding:8px 20px;border-radius:8px;font-size:13px;cursor:pointer;">
            ${isEN ? 'Go to Box' : '前往寶可夢倉庫'}
          </button>
        </div>
      `;
      return;
    }

    // 若尚未選中任何倉庫寶可夢，或選中的寶可夢已不存在，預設載入倉庫列表中第一隻寶可夢（依當前排序與篩選順序）
    const displayBoxList = (window.UserBox && typeof window.UserBox.getFilteredBox === 'function')
      ? window.UserBox.getFilteredBox()
      : userBox;
    const activeList = displayBoxList.length > 0 ? displayBoxList : userBox;

    if ((!labState.selectedBoxUid || !userBox.some(function (p) { return p.uid === labState.selectedBoxUid; })) && activeList.length > 0) {
      loadBoxItem(activeList[0]);
    }

    const currentPkm = pokemons.find(function (p) { return p.id === labState.selectedPkmId; }) || pokemons[0];
    const boxItem = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; }) || null;
    const natures = (window.UserBox && window.UserBox.NATURE_DATA) || [];
    const subskillPool = (window.UserBox && window.UserBox.SUBSKILLS_DATA) || [];

    const evaluation = evaluatePokemon(currentPkm, labState.level, labState.nature, labState.subskills, labState.ingredients, labState.ribbon);
    const radarSVG = evaluation ? renderRadarChartSVG(evaluation.scores, 340, 310) : '';
    const displayName = isEN ? (currentPkm.name_en || currentPkm.name_cn) : currentPkm.name_cn;
    const typeName = window.I18N ? window.I18N.getTypeName(currentPkm.type) : currentPkm.type;
    const specName = window.I18N ? window.I18N.getSpecialtyName(currentPkm.specialty) : currentPkm.specialty;

    let specClass = 'spec-ingredient';
    const rawSpec = currentPkm.specialty || '';
    if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
      specClass = 'spec-berry';
    } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
      specClass = 'spec-skill';
    }

    const berryObj = (typeof window !== 'undefined' && window.getPokemonBerry) ? window.getPokemonBerry(currentPkm) : (currentPkm.berry || {});
    const berryIconHtml = berryObj && berryObj.icon 
      ? '<img src="' + berryObj.icon + '" alt="' + escapeHtml(berryObj.name || '') + '" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" loading="lazy">' 
      : '';
    const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml) 
      ? window.I18N.getSpecialtyIconHtml(currentPkm.specialty, 16) 
      : '<span class="box-spec-tag ' + specClass + '" style="font-size:11px;padding:1px 6px;">' + specName + '</span>';

    const rawMainSkill = (currentPkm && currentPkm.main_skill) || (currentPkm && currentPkm.skill && currentPkm.skill.name) || '';
    const mainSkillName = rawMainSkill ? (window.I18N ? window.I18N.getMainSkillName(rawMainSkill) : rawMainSkill) : (isEN ? 'Main Skill' : '主技能');
    const skillLvl = labState.skillLevel || (boxItem && (boxItem.skillLevel || boxItem.mainSkillLevel)) || 1;
    const natureDisplayName = window.I18N ? window.I18N.getNatureName(labState.nature) : labState.nature;
    const natureObj = natures.find(function (n) { return n.name === labState.nature; });
    let labNatureEffectHtml = '';
    if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
      const rawBuff = isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff;
      const rawDebuff = isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff;
      const buffLabel = rawBuff.replace(/[▲▼]/g, '').trim();
      const debuffLabel = rawDebuff.replace(/[▲▼]/g, '').trim();
      labNatureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-row nature-buff-row">
            <span class="nature-effect-label">${escapeHtml(buffLabel)}</span>
            <span class="nature-arrows-up">▲▲</span>
          </div>
          <div class="nature-effect-row nature-debuff-row">
            <span class="nature-effect-label">${escapeHtml(debuffLabel)}</span>
            <span class="nature-arrows-down">▼▼</span>
          </div>
        </div>
      `;
    } else {
      labNatureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral">
            ${isEN ? 'Has no distinctive personality traits' : '沒有性格帶來的特色（無影響）'}
          </div>
        </div>
      `;
    }

    const baseFreq = currentPkm.base_frequency || currentPkm.frequency || 0;
    const ribbonBonus = evaluation && evaluation.ribbonBonus ? evaluation.ribbonBonus : { carry: 0, speedDiscount: 0 };
    const carryLimitVal = (currentPkm.carry_limit || currentPkm.carry) 
      ? ((parseInt(currentPkm.carry_limit || currentPkm.carry, 10) || 10) + (ribbonBonus ? ribbonBonus.carry : 0)) 
      : '';
    function formatSecs(sec) {
      if (!sec || isNaN(sec)) return '';
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m + 'm ' + (s < 10 ? '0' : '') + s + 's';
    }
    const helpIntervalFormatted = baseFreq 
      ? (isEN ? formatSecs(baseFreq) : (Math.floor(baseFreq / 60) + '分' + (baseFreq % 60 ? (baseFreq % 60 + '秒') : ''))) 
      : '';

    // 食材選項
    const baseIngList = (currentPkm && currentPkm.ingredients && currentPkm.ingredients.length > 0)
      ? currentPkm.ingredients
      : [{ name: '特選蘋果' }];
    const ingA = baseIngList[0] || { name: '特選蘋果' };
    const ingB = baseIngList[1] || ingA;
    const ingC = baseIngList[2] || ingB || ingA;
    const uniqueLv1 = [ingA];
    const uniqueLv30 = Array.from(new Set([ingA.name, ingB.name])).map(n => baseIngList.find(i => i.name === n) || { name: n });
    const uniqueLv60 = Array.from(new Set([ingA.name, ingB.name, ingC.name])).map(n => baseIngList.find(i => i.name === n) || { name: n });

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

    const showControls = labState.editMode;

    targetElement.innerHTML = `
      <div class="appraisal-lab-seamless-view">
        ${!isMobileH5 ? `
        <!-- 1. 倉庫快速選取區 (User Box Linkage) (僅桌面版需要時保留) -->
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
            ${activeList.map(function (item) {
              const bPkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; });
              const pDisplayName = isEN ? (bPkm ? (bPkm.name_en || bPkm.name_cn) : item.name) : item.name;
              const nickText = item.nickname ? `${item.nickname} (${pDisplayName})` : pDisplayName;
              const natText = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
              return '<option value="' + item.uid + '" ' + (labState.selectedBoxUid === item.uid ? 'selected' : '') + '>Lv.' + (item.level || 1) + ' ' + escapeHtml(nickText) + ' · ' + natText + '</option>';
            }).join('')}
          </select>

          ${activeList.length > 0 ? `
            <div class="lab-box-chips-scroll">
              ${activeList.map(function (item) {
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
        ` : ''}

        ${labState.selectedBoxUid && labState.editMode ? `
          <div class="lab-edit-mode-banner" style="display:flex;align-items:center;justify-content:space-between;background:var(--card-bg, #1e293b);padding:10px 14px;border-radius:10px;margin-bottom:12px;border:1px solid var(--accent-color, #38bdf8);">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="font-weight:700;color:var(--accent-color, #38bdf8);font-size:13px;">${isEN ? '[✎] Editing Pokémon Stats' : '[✎] 修改模式 (即時保存至倉庫)'}</span>
              <span style="font-size:12px;color:var(--text-muted, #94a3b8);">(${escapeHtml(displayName)})</span>
            </div>
            <div style="display:flex;gap:8px;">
              <button type="button" class="btn-lab-save" onclick="window.AppraisalLab.saveEditMode()" style="background:#22c55e;color:#0f172a;font-weight:700;padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;">
                <span>[✓]</span>
                <span>${isEN ? 'Save' : '保存修改'}</span>
              </button>
              <button type="button" class="btn-lab-cancel" onclick="window.AppraisalLab.cancelEditMode()" style="background:rgba(148,163,184,0.2);color:var(--text-main, #f1f5f9);padding:5px 12px;border-radius:6px;border:none;cursor:pointer;font-size:12px;">
                ${isEN ? 'Cancel' : '取消'}
              </button>
            </div>
          </div>
        ` : ''}

        <div class="appraisal-lab-layout ${!showControls ? 'lab-preview-only-layout' : ''}">
          <!-- 自訂/修改配置控制器 (預覽模式下自動隱藏，點選「修改數值」時展開) -->
          <div class="appraisal-lab-controls" style="${!showControls ? 'display: none !important;' : ''}">
            <!-- 寶可夢暱稱 -->
            <div class="lab-control-group">
              <label for="lab-nickname-input" class="lab-control-label">${isEN ? 'Nickname:' : '寶可夢暱稱：'}</label>
              <input type="text" id="lab-nickname-input" class="lab-input" style="width:100%;height:36px;border-radius:8px;border:1px solid var(--border-color);background:var(--table-row-odd-solid, #0d1527);color:var(--text-primary);padding:0 12px;font-size:13px;box-sizing:border-box;" value="${escapeHtml(labState.nickname)}" placeholder="${isEN ? 'Optional nickname' : '可選暱稱'}" oninput="window.AppraisalLab.onNicknameChange(this.value)">
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

            <!-- 食材組合配置 (Lv.1, Lv.30, Lv.60) -->
            <div class="lab-control-group">
              <label class="lab-control-label">${isEN ? 'Ingredient Setup (Lv.1, Lv.30, Lv.60):' : '食材組合配置 (Lv.1, Lv.30, Lv.60)：'}</label>
              <div class="lab-ing-picker" style="display:flex;gap:8px;flex-wrap:wrap;">
                ${[
                  { label: 'Lv.1', idx: 0, options: uniqueLv1 },
                  { label: 'Lv.30', idx: 1, options: uniqueLv30 },
                  { label: 'Lv.60', idx: 2, options: uniqueLv60 }
                ].map(function (slot) {
                  const curVal = labState.ingredients[slot.idx] || (slot.options[0] ? slot.options[0].name : '');
                  return '<div class="lab-ing-slot" style="flex:1 1 90px;min-width:90px;">' +
                    '<span class="slot-lv-label" style="display:block;font-size:10px;color:var(--text-muted);font-weight:700;margin-bottom:3px;">' + slot.label + '</span>' +
                    '<select class="lab-select" onchange="window.AppraisalLab.onIngredientChange(' + slot.idx + ', this.value)" style="width:100%;height:34px;font-size:12px;padding:0 8px;">' +
                    slot.options.map(function (opt) {
                      const optName = window.I18N ? window.I18N.getIngredientName(opt.name) : opt.name;
                      return '<option value="' + opt.name + '" ' + (curVal === opt.name ? 'selected' : '') + '>' + optName + '</option>';
                    }).join('') +
                    '</select></div>';
                }).join('')}
              </div>
            </div>

            <!-- 5 個副技能槽位選擇 (Lv.10, 25, 50, 70, 80) -->
            <div class="lab-control-group">
              <label class="lab-control-label">${isEN ? 'Sub-Skill Setup (Lv.10, 25, 50, 70, 80):' : '副技能配置 (Lv.10, 25, 50, 70, 80)：'}</label>
              <div class="lab-subskills-picker">
                ${[10, 25, 50, 70, 80].map(function (lv, idx) {
                  return '<div class="lab-subskill-slot"><span class="slot-lv-label">Lv.' + lv + '</span><select class="lab-select-subskill" onchange="window.AppraisalLab.onSubskillChange(' + idx + ', this.value)"><option value="">' + (isEN ? '(None)' : '(無)') + '</option>' +
                    subskillPool.map(function (s) {
                      const sDisplayName = window.I18N ? window.I18N.getSubSkillName(s.name) : s.name;
                      return '<option value="' + s.name + '" ' + (labState.subskills[idx] === s.name ? 'selected' : '') + '>' + sDisplayName + '</option>';
                    }).join('') + '</select></div>';
                }).join('')}
              </div>
            </div>

            <!-- 修改模式儲存/取消動作按鈕 -->
            <div class="lab-edit-bottom-actions" style="display:flex;gap:10px;margin-top:16px;">
              <button type="button" class="btn-lab-save" onclick="window.AppraisalLab.saveEditMode()" style="flex:1;height:40px;background:#22c55e;color:#0f172a;font-weight:700;border-radius:10px;border:none;cursor:pointer;font-size:13.5px;display:flex;align-items:center;justify-content:center;gap:6px;">
                <span>[✓]</span>
                <span>${isEN ? 'Save Changes' : '保存修改'}</span>
              </button>
              <button type="button" class="btn-lab-cancel" onclick="window.AppraisalLab.cancelEditMode()" style="flex:1;height:40px;background:rgba(148,163,184,0.15);color:var(--text-primary);border-radius:10px;border:1px solid var(--border-color);cursor:pointer;font-size:13.5px;">
                <span>${isEN ? 'Cancel' : '取消'}</span>
              </button>
            </div>
          </div>

          <!-- 即時評測展示 (簡介 + 數值面板 + 六邊形雷達圖 + 下方評語) -->
          <div class="appraisal-lab-preview ${!showControls ? 'lab-preview-fullwidth' : ''}">
            <div class="lab-preview-header" style="position:relative;display:flex;${isMobileH5 ? 'flex-direction:column;gap:8px;' : 'justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;'}padding-right:50px;border-bottom:1px solid var(--border-color-subtle, rgba(255,255,255,0.08));padding-bottom:12px;">
              <!-- 最右上方固定操作按鈕：預覽模式下為鉛筆修改按鈕，編輯模式下為保存/取消 -->
              <div class="lab-preview-header-right" style="position:absolute;top:0;right:0;z-index:5;">
                ${!labState.editMode ? `
                  <button type="button" class="btn-lab-edit-toggle" onclick="window.AppraisalLab.enterEditMode()" title="${isEN ? 'Edit Pokémon Stats' : '修改寶可夢數值'}" style="background:var(--accent-color, #38bdf8);color:#0f172a;width:32px;height:32px;border-radius:8px;border:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(56,189,248,0.25);padding:0;" aria-label="${isEN ? 'Edit Pokémon Stats' : '修改寶可夢數值'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                ` : `
                  <div style="display:flex;gap:6px;">
                    <button type="button" class="btn-lab-save-header" onclick="window.AppraisalLab.saveEditMode()" style="background:#22c55e;color:#0f172a;font-weight:700;padding:5px 10px;border-radius:8px;border:none;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:4px;">
                      <span>[✓]</span>
                      <span>${isEN ? 'Save' : '保存'}</span>
                    </button>
                    <button type="button" class="btn-lab-cancel-header" onclick="window.AppraisalLab.cancelEditMode()" style="background:rgba(148,163,184,0.2);color:var(--text-main, #f1f5f9);padding:5px 10px;border-radius:8px;border:none;cursor:pointer;font-size:12px;">
                      ${isEN ? 'Cancel' : '取消'}
                    </button>
                  </div>
                `}
              </div>

              <!-- 左上方：頭像、名稱、獎章、得意、樹果、等級 -->
              <div class="lab-preview-pokemon-info">
                <img src="${currentPkm.icon_url}" class="lab-preview-icon" alt="${displayName}">
                <div>
                  <div class="lab-preview-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="lab-preview-name">${displayName}</span>
                    ${labState.nickname ? `
                      <span class="lab-nickname-tag">${escapeHtml(labState.nickname)}</span>
                    ` : ''}
                    ${labState.ribbon > 0 ? `
                      <span class="lab-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${labState.ribbon}` : `睡飽飽獎章`}" style="display:inline-flex;align-items:center;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${labState.ribbon}.png" class="lab-ribbon-icon" alt="Ribbon" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" />
                      </span>
                    ` : ''}
                    ${labState.isCustomized ? `
                      <span class="lab-sim-tag" style="background:rgba(234,179,8,0.18); color:#facc15; border:1px solid rgba(234,179,8,0.35); font-size:11px; padding:1px 6px; border-radius:4px; font-weight:600;">${isEN ? 'Editing' : '修改中'}</span>
                    ` : ''}
                  </div>
                  <div class="lab-preview-spec" style="display:flex;align-items:center;gap:6px;margin-top:2px;">
                    ${berryIconHtml}
                    ${specialtyIconHtml}
                    <span style="font-size:12px;color:var(--text-muted);font-weight:600;">Lv.${labState.level}</span>
                  </div>
                </div>
              </div>

              <!-- 雙軌評級 (當前評級與滿級潛力評級) -->
              <div class="lab-preview-dual-verdict" style="display:flex;gap:8px;align-items:center;margin-top:2px;">
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

            ${!showControls ? `
              <!-- 預覽模式完整寶可夢數據面板 (主技能、食材、性格、副技能) -->
              <div class="lab-preview-stats-panel" style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                <!-- 主技能名稱與等級 + 幫忙間隔與持有上限 -->
                <div class="lab-preview-mainskill-row" style="display:flex;align-items:center;gap:8px;font-size:12.5px;flex-wrap:wrap;">
                  <span style="font-weight:700;color:var(--text-muted);font-size:11.5px;">${isEN ? 'Main Skill:' : '主技能：'}</span>
                  <span style="font-weight:700;color:var(--text-primary);">${escapeHtml(mainSkillName)}</span>
                  <span style="background:rgba(56,189,248,0.15);color:var(--accent-color, #38bdf8);padding:1px 6px;border-radius:4px;font-size:11px;font-weight:700;">Lv.${skillLvl}</span>
                  ${helpIntervalFormatted ? `
                    <span style="font-size:11.5px;color:var(--text-muted);margin-left:auto;">${isEN ? 'Interval:' : '幫忙間隔:'} <strong style="color:var(--text-primary);">${helpIntervalFormatted}</strong></span>
                  ` : ''}
                  ${carryLimitVal ? `
                    <span style="font-size:11.5px;color:var(--text-muted);">${isEN ? 'Carry:' : '持有:'} <strong style="color:var(--text-primary);">${carryLimitVal}</strong></span>
                  ` : ''}
                </div>

                <!-- 食材組合 (Lv.1, Lv.30, Lv.60) 單行純圖示展示，無名稱無數量 -->
                <div class="lab-preview-ing-row" style="display:flex;align-items:center;gap:8px;font-size:12.5px;flex-wrap:nowrap;white-space:nowrap;overflow-x:auto;">
                  <span style="font-weight:700;color:var(--text-muted);font-size:11.5px;flex-shrink:0;">${isEN ? 'Ingredients:' : '食材：'}</span>
                  <div class="lab-preview-ing-chips" style="display:flex;gap:6px;align-items:center;flex-wrap:nowrap;">
                    ${[0, 1, 2].map(function (idx) {
                      const unlockLv = idx === 0 ? 1 : (idx === 1 ? 30 : 60);
                      const isUnlocked = labState.level >= unlockLv;
                      const ingName = labState.ingredients[idx] || '';
                      const ingDisplayName = ingName ? (window.I18N ? window.I18N.getIngredientName(ingName) : ingName) : '--';
                      const iconUrl = ingName && window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ingName) : '';
                      const lockStyle = !isUnlocked ? 'opacity:0.45;filter:grayscale(0.5);' : '';
                      return `
                        <div class="lab-preview-ing-chip" style="display:inline-flex;align-items:center;gap:4px;background:var(--table-row-odd-solid, #0d1527);border:1px solid var(--border-color);border-radius:6px;padding:3px 6px;font-size:11.5px;${lockStyle}" title="${escapeHtml(ingDisplayName)}${!isUnlocked ? (isEN ? ' (Locked Lv.' + unlockLv + ')' : ' (Lv.' + unlockLv + ' 解鎖)') : ''}">
                          <span style="font-size:9.5px;color:var(--text-muted);font-weight:700;">Lv.${unlockLv}</span>
                          ${iconUrl ? `<img src="${iconUrl}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(ingDisplayName)}">` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- 遊戲同款性格展示 (與網頁評測彈窗風格完全一致) -->
                <div class="lab-preview-nature-row" style="margin:4px 0;display:flex;justify-content:flex-start;">
                  <div class="appraisal-nature-game-card" style="margin:0;">
                    <div class="nature-pill-capsule">
                      <span class="nature-capsule-tag">${isEN ? 'Nature' : '性格'}</span>
                      <span class="nature-capsule-name">${escapeHtml(natureDisplayName)}</span>
                    </div>
                    ${labNatureEffectHtml}
                  </div>
                </div>

                <!-- 副技能清單 (Lv.10, Lv.25, Lv.50, Lv.70, Lv.80) 2+2+1 排列 -->
                <div class="lab-preview-subskills-section">
                  <div style="font-weight:700;color:var(--text-muted);font-size:11.5px;margin-bottom:6px;">${isEN ? 'Sub-Skills:' : '副技能：'}</div>
                  <div class="box-subskills-grid" style="display:grid;grid-template-columns:repeat(2, 1fr);gap:6px;">
                    ${[10, 25, 50, 70, 80].map(function (lv, idx) {
                      const sName = labState.subskills[idx] || '';
                      const displaySName = sName ? (window.I18N ? window.I18N.getSubSkillName(sName) : sName) : '--';
                      const tier = getSkillTier(sName);
                      const isUnlocked = labState.level >= lv;
                      const lockClass = !isUnlocked ? 'subskill-locked' : '';
                      return `
                        <div class="box-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(displaySName)} (Lv.${lv}${!isUnlocked ? (isEN ? ' Locked' : ' 未解鎖') : ''})">
                          <span style="font-size:9.5px;color:var(--text-muted);font-weight:800;margin-right:4px;">Lv.${lv}</span>
                          <span class="subskill-name">${escapeHtml(displaySName)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              </div>
            ` : ''}

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
    isBerryBurstSkillSpecialist: isBerryBurstSkillSpecialist,
    isBfsSkillSpecialist: isBfsSkillSpecialist,
    isHealerSkillSpecialist: isHealerSkillSpecialist,
    isHelperBoostSkillSpecialist: isHelperBoostSkillSpecialist,
    isChargeStrengthSkillSpecialist: isChargeStrengthSkillSpecialist,
    isPotExpanderSkillSpecialist: isPotExpanderSkillSpecialist,
    isExtraTastySkillSpecialist: isExtraTastySkillSpecialist,
    isDreamShardSkillSpecialist: isDreamShardSkillSpecialist,
    isIngredientSkillSpecialist: isIngredientSkillSpecialist,
    isMetronomeSkillSpecialist: isMetronomeSkillSpecialist,
    isLegendaryPokemon: isLegendaryPokemon,
    isSlowpokeFamily: isSlowpokeFamily,
    isSlakingFamily: isSlakingFamily,
    evaluateSingle: evaluateSingle,
    calculateMilestoneProjections: calculateMilestoneProjections,
    evaluatePokemon: evaluatePokemon,
    generateSummary: generateIntelligentSummary,
    generateIntelligentSummary: generateIntelligentSummary,
    getRemainingEvolutions: getRemainingEvolutions,
    getRibbonBonus: getRibbonBonus,
    renderRadarChartSVG: renderRadarChartSVG,
    calculateMilestoneCost: calculateMilestoneCost,
    openModal: openAppraisalModal,
    closeModal: closeAppraisalModal,
    renderLab: renderAppraisalLabContainer,
    getSkillTier: getSkillTier,
    loadBoxItem: loadBoxItem,
    onBoxItemSelect: onBoxItemSelect,
    resetToBoxOriginal: resetToBoxOriginal,
    enterEditMode: enterEditMode,
    cancelEditMode: cancelEditMode,
    saveEditMode: saveEditMode,
    onNicknameChange: onNicknameChange,
    onIngredientChange: onIngredientChange,
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
        if (typeof window.switchBoxSubtab === 'function') {
          window.switchBoxSubtab(willOpen ? 'lab' : 'list');
        } else {
          container.style.display = willOpen ? 'block' : 'none';
          if (willOpen) {
            renderAppraisalLabContainer(container);
          }
        }
      }
    }
  };

  // 全域別名
  window.openAppraisalModal = openAppraisalModal;
  window.closeAppraisalModal = closeAppraisalModal;

})();