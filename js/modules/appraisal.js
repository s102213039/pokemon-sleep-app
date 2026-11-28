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
  function getSixDimMeta() {
    return [
      { key: 'berry', label: window.I18N?.t?.('lab.t_dim_berry_lbl') ?? 'lab.t_dim_berry_lbl', icon: '', angle: -Math.PI / 2, desc: window.I18N?.t?.('lab.t_dim_berry_desc') ?? 'lab.t_dim_berry_desc' },
      { key: 'ingredient', label: window.I18N?.t?.('lab.t_dim_ing_lbl') ?? 'lab.t_dim_ing_lbl', icon: '', angle: -Math.PI / 6, desc: window.I18N?.t?.('lab.t_dim_ing_desc') ?? 'lab.t_dim_ing_desc' },
      { key: 'skill', label: window.I18N?.t?.('lab.t_dim_skill_lbl') ?? 'lab.t_dim_skill_lbl', icon: '', angle: Math.PI / 6, desc: window.I18N?.t?.('lab.t_dim_skill_desc') ?? 'lab.t_dim_skill_desc' },
      { key: 'speed', label: window.I18N?.t?.('lab.t_dim_speed_lbl') ?? 'lab.t_dim_speed_lbl', icon: '', angle: Math.PI / 2, desc: window.I18N?.t?.('lab.t_dim_speed_desc') ?? 'lab.t_dim_speed_desc' },
      { key: 'growth', label: window.I18N?.t?.('lab.t_dim_growth_lbl') ?? 'lab.t_dim_growth_lbl', icon: '', angle: 5 * Math.PI / 6, desc: window.I18N?.t?.('lab.t_dim_growth_desc') ?? 'lab.t_dim_growth_desc' },
      { key: 'roi', label: window.I18N?.t?.('lab.t_dim_roi_lbl') ?? 'lab.t_dim_roi_lbl', icon: '', angle: -5 * Math.PI / 6, desc: window.I18N?.t?.('lab.t_dim_roi_desc') ?? 'lab.t_dim_roi_desc' }
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
    70: 82162,
    75: 98000,
    80: 120262,
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
    70: 200000,
    75: 260000,
    80: 380000,
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

  /* ─── 最終階段 3 階進化形態清單 (進化兩次，基礎主技能 +2) ─────── */
  const STAGE3_FINAL_NAMES = new Set([
    '妙蛙花', '噴火龍', '水箭龜', '巴大蝶', '雷丘', '皮可西', '胖可丁',
    '大食花', '隆隆岩', '耿鬼', '自爆磁怪', '幸福蛋', '波克基斯', '電龍',
    '快龍', '火爆獸', '大力鱷', '班基拉斯', '蜥蜴王', '火焰雞', '巨沼怪',
    '沙奈朵', '艾路雷朵', '請假王', '波士可多拉', '沙漠蜻蜓', '帝牙海獅',
    '暴飛龍', '土台龜', '烈焰猴', '帝王拿波', '倫琴貓', '鍬農炮蟲',
    '魔幻假面喵', '骨紋巨聲鱷', '狂歡浪舞鴨', '巴布土撥', '巨鍛匠',
    'Venusaur', 'Charizard', 'Blastoise', 'Butterfree', 'Raichu', 'Clefable', 'Wigglytuff',
    'Victreebel', 'Golem', 'Gengar', 'Magnezone', 'Blissey', 'Togekiss', 'Ampharos',
    'Dragonite', 'Typhlosion', 'Feraligatr', 'Tyranitar', 'Sceptile', 'Blaziken', 'Swampert',
    'Gardevoir', 'Gallade', 'Slaking', 'Aggron', 'Flygon', 'Walrein',
    'Salamence', 'Torterra', 'Infernape', 'Empoleon', 'Luxray', 'Vikavolt',
    'Meowscarada', 'Skeledirge', 'Quaquaval', 'Pawmot', 'Tinkaton'
  ]);

  /* ─── 取得寶可夢的進化階段 (1 基礎 / 2 一階進化 / 3 二階最終進化) ─── */
  function getPokemonEvolutionStage(pkm) {
    if (!pkm) return 1;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
    if (STAGE3_FINAL_NAMES.has(name)) return 3;
    if (pkm.evo_req && String(pkm.evo_req).trim()) {
      return 2;
    }
    return 1;
  }

  /* ─── 取得已解鎖副技能的主技能等級加成 (技能等級提升S/M) ────────── */
  function getSubskillLevelBonus(subskills, currentLv) {
    if (!Array.isArray(subskills) || subskills.length === 0) return 0;
    const thresholds = [10, 25, 50, 70, 80];
    let bonus = 0;
    subskills.forEach((sub, idx) => {
      const unlockLv = thresholds[idx] || 100;
      if ((currentLv || 1) >= unlockLv) {
        const name = typeof sub === 'string' ? sub : (sub && (sub.name || sub.name_cn) ? (sub.name || sub.name_cn) : '');
        if (name.includes('技能等級提升M') || name.includes('Skill Level Up M')) {
          bonus += 2;
        } else if (name.includes('技能等級提升S') || name.includes('Skill Level Up S')) {
          bonus += 1;
        }
      }
    });
    return bonus;
  }

  function getMainSkillMaxLevel(name) {
    if (typeof window !== 'undefined' && typeof window.getMainSkillMaxLevel === 'function' && window.getMainSkillMaxLevel !== getMainSkillMaxLevel) {
      return window.getMainSkillMaxLevel(name);
    }
    if (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.getMainSkillMaxLevel === 'function') {
      return window.UserBox.getMainSkillMaxLevel(name);
    }
    if (!name || typeof name !== 'string') return 6;
    const clean = name.trim();
    if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) {
      return 8;
    }
    if (
      clean.includes('能量填充') || clean.includes('能量充填') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘') ||
      clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力鉗') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物') ||
      clean.includes('料理強化') || clean.includes('料理等級') || clean.includes('Cooking Power') || clean.includes('負電') || clean.includes('魔法火焰') || clean.includes('Mystical Fire') || clean.includes('料理躍進') || clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') ||
      clean.includes('揮指') || clean.includes('技能複製') || clean.includes('十項全能') || clean.includes('All-Rounder') || clean.includes('Metronome') || clean.includes('Skill Copy') || clean.includes('變身') || clean.includes('模仿') ||
      clean.includes('幫手支援') || clean.includes('Extra Helpful') || clean.includes('Helper Support')
    ) {
      return 7;
    }
    if (typeof window !== 'undefined' && window.MAIN_SKILLS_DATA) {
      const sData = window.MAIN_SKILLS_DATA[clean] || (Array.isArray(window.MAIN_SKILLS_DATA) ? window.MAIN_SKILLS_DATA.find(s => s && s.name === clean) : null);
      if (sData) {
        if (sData.levels && (sData.levels['8'] || sData.levels[8])) return 8;
        if (sData.levels && (sData.levels['7'] || sData.levels[7])) return 7;
        if (sData.maxLevel) return sData.maxLevel;
      }
    }
    return 6;
  }

  if (typeof window !== 'undefined' && !window.getMainSkillMaxLevel) {
    window.getMainSkillMaxLevel = getMainSkillMaxLevel;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.getMainSkillMaxLevel = getMainSkillMaxLevel;
  }

  /* ─── 計算實際有效主技能等級 (結合進化次數基礎、副技能解鎖加成與自訂上限) ── */
  function getEffectiveSkillLevel(pkmOrBoxItem, basePkm) {
    const pkm = pkmOrBoxItem || {};
    let base = basePkm;
    if (!base && typeof findPokemonBase === 'function') {
      base = findPokemonBase(pkm.name || pkm.name_cn || pkm.pokemonId);
    } else if (!base && typeof window !== 'undefined' && window.allPokemons) {
      base = window.allPokemons.find(function(p) { return p.name_cn === (pkm.name || pkm.name_cn) || p.id === (pkm.pokemonId || pkm.id); });
    }
    base = base || pkm;

    const currentLv = parseInt(pkm.level, 10) || 30;
    const stage = getPokemonEvolutionStage(base);
    const subskills = pkm.subskills || [];
    const subBonus = getSubskillLevelBonus(subskills, currentLv);
    const naturalLvl = stage + subBonus;

    const savedLvl = parseInt(pkm.skillLevel || pkm.skill_level || (pkm.rawItem && pkm.rawItem.skillLevel), 10);
    let effective = (!isNaN(savedLvl) && savedLvl > 0) ? savedLvl : naturalLvl;

    const maxLvl = getMainSkillMaxLevel(base ? base.main_skill : '');
    return Math.min(maxLvl, Math.max(1, effective));
  }

  function getRemainingEvolutions(pkm) {
    if (!pkm) return 0;
    const isFinal = (typeof isFinalEvolution === 'function')
      ? isFinalEvolution(pkm)
      : (pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1');
    if (isFinal) return 0;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name;
    if (THREE_STAGE_BASE_NAMES.has(name)) return 2;
    return 1;
  }

  function getRibbonBonus(ribbonLevel, remainingEvolutions) {
    if (ribbonLevel && typeof ribbonLevel === 'object') {
      const pkmObj = ribbonLevel;
      ribbonLevel = remainingEvolutions;
      remainingEvolutions = getRemainingEvolutions(pkmObj);
    }
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
    if (skill.includes('活力全體療癒') || skill.includes('Energy for Everyone') || skill.includes('新月祈禱') || skill.includes('樹果汁') || skill.includes('治癒波動') || skill.includes('蹭蹭臉頰') || skill.includes('活力療癒') || skill.includes('活力氣場') || skill.includes('Energizing Cheer')) return true;
    const healerNames = ['沙奈朵', '仙子伊布', '胖可丁', '巴布土撥', '拉魯拉絲', '奇鲁莉安', '寶寶丁', '胖丁', '布撥', '布土撥', '克雷色利亞', '壺壺', '拉帝亞斯', '托戈德瑪爾', '帕奇利茲',
                         'Gardevoir', 'Sylveon', 'Wigglytuff', 'Pawmot', 'Ralts', 'Kirlia', 'Igglybuff', 'Jigglypuff', 'Pawmi', 'Pawmo', 'Cresselia', 'Shuckle', 'Latias', 'Togedemaru', 'Pachirisu'];
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
    if (skill.includes('料理強化') || skill.includes('Cooking Power') || skill.includes('負電') || skill.includes('魔法火焰') || skill.includes('Mystical Fire')) return true;
    const potNames = ['小磁怪', '三合一磁怪', '自爆磁怪', '火伊布', '冰伊布', '負電拍拍', '顫弦蠑螈', '夢妖魔',
                      'Magnemite', 'Magneton', 'Magnezone', 'Flareon', 'Glaceon', 'Minun', 'Toxtricity', 'Mismagius'];
    return potNames.some(p => name.includes(p));
  }

  // 7. 料理美味度/成功率型 (Extra Tasty / Cooking Success Specialists: Dedenne, Cramorant, etc.)
  function isExtraTastySkillSpecialist(pkm) {
    if (!pkm) return false;
    const skill = pkm.main_skill || (pkm.skill && pkm.skill.name) || '';
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || pkm.name || '';
    if (skill.includes('料理成功') || skill.includes('美味大成功') || skill.includes('Extra Tasty') || skill.includes('Tasty Chance') || skill.includes('魔法火焰') || skill.includes('Mystical Fire') || skill.includes('健美') || skill.includes('Bulk Up')) return true;
    const tastyNames = ['咚咚鼠', '海豹球（佳節）', '古月鳥', '夢妖魔', '赫拉克羅斯', 'Dedenne', 'Spheal (Holiday)', 'Cramorant', 'Mismagius', 'Heracross'];
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

  /* ─── 食材名稱官方正規化與別名對照 (Ingredient Normalization Engine) ─── */
  const ING_ALIASES = {
    '蘋果': '特選蘋果', '特選蘋果': '特選蘋果', 'fancy apple': '特選蘋果', 'apple': '特選蘋果',
    '牛奶': '哞哞鮮奶', '鮮奶': '哞哞鮮奶', '哞哞鮮奶': '哞哞鮮奶', 'moomoo milk': '哞哞鮮奶', 'milk': '哞哞鮮奶',
    '大豆': '萌綠大豆', '萌綠大豆': '萌綠大豆', 'greengrass soybeans': '萌綠大豆', 'soybeans': '萌綠大豆', 'soybean': '萌綠大豆',
    '蜂蜜': '甜甜蜜', '甜甜蜜': '甜甜蜜', 'honey': '甜甜蜜',
    '香腸': '豆製肉', '豆製肉': '豆製肉', 'bean sausage': '豆製肉', 'sausage': '豆製肉',
    '生薑': '暖暖薑', '生姜': '暖暖薑', '暖暖薑': '暖暖薑', '暖暖生薑': '暖暖薑', 'warming ginger': '暖暖薑', 'ginger': '暖暖薑',
    '番茄': '好眠番茄', '好眠番茄': '好眠番茄', 'snoozy tomato': '好眠番茄', 'tomato': '好眠番茄',
    '堅果': '一口堅果', '一口堅果': '一口堅果', 'snackable nuts': '一口堅果', 'nuts': '一口堅果',
    '蛋': '特選蛋', '特選蛋': '特選蛋', 'fancy egg': '特選蛋', 'egg': '特選蛋',
    '油': '純粹油', '純粹油': '純粹油', 'pure oil': '純粹油', 'oil': '純粹油',
    '洋芋': '窩心洋芋', '馬鈴薯': '窩心洋芋', '窩心洋芋': '窩心洋芋', 'soft potato': '窩心洋芋', 'potato': '窩心洋芋',
    '香草': '火辣香草', '火辣香草': '火辣香草', 'fiery herb': '火辣香草', 'herb': '火辣香草',
    '玉米': '萌綠玉米', '萌綠玉米': '萌綠玉米', 'greengrass corn': '萌綠玉米', 'corn': '萌綠玉米',
    '可可': '放鬆可可', '放鬆可可': '放鬆可可', 'soothing cacao': '放鬆可可', 'cacao': '放鬆可可',
    '咖啡': '醒腦咖啡豆', '咖啡豆': '醒腦咖啡豆', '醒腦咖啡豆': '醒腦咖啡豆', 'rousing coffee': '醒腦咖啡豆', 'coffee': '醒腦咖啡豆',
    '酪梨': '嫩亮酪梨', '嫩亮酪梨': '嫩亮酪梨', 'glossy avocado': '嫩亮酪梨', 'avocado': '嫩亮酪梨',
    '蘑菇': '品鮮蘑菇', '品鮮蘑菇': '品鮮蘑菇', 'tasty mushroom': '品鮮蘑菇', 'mushroom': '品鮮蘑菇',
    '蔥': '粗枝大蔥', '大蔥': '粗枝大蔥', '粗枝大蔥': '粗枝大蔥', '美味大蔥': '粗枝大蔥', 'large leek': '粗枝大蔥', 'leek': '粗枝大蔥',
    '南瓜': '沉甸甸南瓜', '沉甸甸南瓜': '沉甸甸南瓜', 'plump pumpkin': '沉甸甸南瓜', 'pumpkin': '沉甸甸南瓜',
    '尾巴': '美味尾巴', '美味尾巴': '美味尾巴', 'slowpoke tail': '美味尾巴', 'tail': '美味尾巴'
  };

  const ING_ALIASES_ENTRIES = Object.keys(ING_ALIASES).map(function (k) {
    return [k.toLowerCase(), ING_ALIASES[k]];
  });
  const _normIngCache = Object.create(null);

  function normalizeIngName(name) {
    if (!name) return '';
    const raw = typeof name === 'string' ? name : (name.name || name.name_cn || name.name_tw || name.name_en || '');
    if (!raw) return '';
    const rawStr = String(raw).trim();
    if (_normIngCache[rawStr] !== undefined) return _normIngCache[rawStr];
    const clean = rawStr.toLowerCase().replace(/^[0-9xX+\s]+/, '').trim();
    for (let i = 0; i < ING_ALIASES_ENTRIES.length; i++) {
      const kl = ING_ALIASES_ENTRIES[i][0];
      if (clean === kl || clean.includes(kl) || kl.includes(clean)) {
        _normIngCache[rawStr] = ING_ALIASES_ENTRIES[i][1];
        return _normIngCache[rawStr];
      }
    }
    _normIngCache[rawStr] = rawStr;
    return rawStr;
  }


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
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    let nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) ||
      (window.PokemonApp && window.PokemonApp.NATURE_DICT && window.PokemonApp.NATURE_DICT[natureName]) ||
      _FALLBACK_LAB_NATURE_DICT[natureName] || { buffType: 'none', debuffType: 'none' };
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

    const { pros, cons } = _buildLabDiagnostics({
      activeSubskills, isBerryBurst, isHelper, isHealer, isCharge, isSlaking,
      isExtraTasty, isPotExpander, isDreamShard, pkmName, specialty, nature,
      isSlowpoke, ingredients, hasSkillM, hasSkillS, pkmData, skillLevel,
      natureName, natDisplayName, isMint, ribbonBonus, remainingEvos,
      currentLv, isLegendary, isIngSkill, isMetronome
    });
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

  /* ─── 升級里程碑質變預測 (Specialty-Aware Milestone Leap Projections) ─── */
  function calculateMilestoneProjections(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval) {
    if (!pkmData || !currentEval) return [];
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
            targetSkillName = window.I18N?.getIngredientName?.('美味尾巴') ?? (window.I18N?.t?.('lab.c_slowpoke_tail') ?? '美味尾巴');
            milestoneType = 'ingredient';
            isKeyMilestone = true;
          }
        } else if (isIng && ingArr.length >= 2 && ingArr[1]) {
          targetSkillName = window.I18N?.getIngredientName?.(ingArr[1]) ?? ingArr[1];
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
          targetSkillName = window.I18N?.getSubSkillName?.(skName) ?? skName;
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
        const skillDisplay = targetSkillName || (window.I18N?.t?.('lab.c_lv_unlock', { lv: targetLv }) ?? `Lv.${targetLv} Unlock`);
        let milestoneText = '';
        if (isGradeLeap) {
          milestoneText = window.I18N?.t?.('lab.c_milestone_grade_leap', {
            lv: targetLv,
            skill: skillDisplay,
            curGrade: currentEval.grade,
            curScore: currentEval.compositeScore,
            projGrade: projEval.grade,
            projScore: projEval.compositeScore
          }) ?? 'lab.c_milestone_grade_leap';
        } else {
          milestoneText = window.I18N?.t?.('lab.c_milestone_score_leap', {
            lv: targetLv,
            skill: skillDisplay,
            curScore: currentEval.compositeScore,
            projScore: projEval.compositeScore
          }) ?? 'lab.c_milestone_score_leap';
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
    { name_cn: '種子炸彈烤餅咖哩', name_en: 'Seed Bomb Naan and Curry', category: '咖哩', pot_size: 39, base_energy: 7950, icon: 'https://www.serebii.net/pokemonsleep/meals/seedbombnaanandcurry.png', ingredients: [{ name: '一口堅果', count: 15 }, { name: '沉甸甸南瓜', count: 12 }, { name: '萌綠玉米', count: 12 }] },
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
    { name_cn: '打草結沙拉捲', name_en: 'Grass Knot Salad Wrap', category: '沙拉', pot_size: 121, base_energy: 26350, icon: 'https://www.serebii.net/pokemonsleep/meals/grassknotsaladwrap.png', ingredients: [{ name: '一口堅果', count: 30 }, { name: '嫩亮酪梨', count: 22 }, { name: '暖暖薑', count: 36 }, { name: '好眠番茄', count: 33 }] },
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
    { name_cn: '採蜜巧克力格子鬆餅', name_en: 'Honey Gather Chocolate Waffles', category: '甜點', pot_size: 115, base_energy: 25484, icon: 'https://www.serebii.net/pokemonsleep/meals/honeygatherchocolatewaffles.png', ingredients: [{ name: '甜甜蜜', count: 38 }, { name: '萌綠玉米', count: 28 }, { name: '純粹油', count: 28 }, { name: '放鬆可可', count: 21 }] },
    { name_cn: '美味尾巴蛋糕捲', name_en: 'Slowpoke Tail Roll Cake', category: '甜點', pot_size: 91, base_energy: 19846, icon: 'https://www.serebii.net/pokemonsleep/meals/slowpoketailrollcake.png', ingredients: [{ name: '一口堅果', count: 26 }, { name: '美味尾巴', count: 10 }, { name: '萌綠大豆', count: 22 }, { name: '特選蛋', count: 33 }] }
  ];

  function getAllTargetRecipes() {
    if (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0) {
      return window.__RECIPES_CACHE__;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.allRecipes) && window.allRecipes.length > 0) {
      return window.allRecipes;
    }
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cached = localStorage.getItem('pksleep_cache_recipes_json');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            window.__RECIPES_CACHE__ = parsed;
            return parsed;
          }
        }
      }
    } catch (e) {}
    return TARGET_TOP_RECIPES;
  }

  function findTargetRecipe(name) {
    if (!name) return TARGET_TOP_RECIPES[0];
    const list = getAllTargetRecipes();
    const found = list.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           TARGET_TOP_RECIPES.find(r => (r.name_cn === name || r.name === name || r.name_en === name)) ||
           list[0] || TARGET_TOP_RECIPES[0];
    if (found && !found.icon) {
      const topMatch = (typeof window !== 'undefined' && Array.isArray(window.ALL_TOP_CATEGORY_RECIPES))
        ? window.ALL_TOP_CATEGORY_RECIPES.find(r => r.name_cn === (found.name_cn || found.name) || r.name_en === (found.name_en || found.name))
        : null;
      if (topMatch && topMatch.icon) {
        found.icon = topMatch.icon;
        if (!found.category) found.category = topMatch.category;
        if (!found.pot_size) found.pot_size = topMatch.pot_size;
      } else if (found.name_en) {
        const slug = found.name_en.toLowerCase().replace(/[^a-z0-9]/g, '');
        found.icon = 'https://www.serebii.net/pokemonsleep/meals/' + slug + '.png';
      }
    }
    return found;
  }

  const _sigRecipeRecCache = Object.create(null);

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('recipes-data-updated', function() {
      for (const k in _sigRecipeRecCache) {
        delete _sigRecipeRecCache[k];
      }
    });
  }

  function formatSummaryRecipeChip(rec) {
    if (!rec) return '';
    const name = window.I18N?.getRecipeName?.(rec) ?? (rec.name_cn || rec.name_en || '');
    const icon = rec.icon || rec.icon_url || '';
    if (!icon) return window.I18N?.t?.('lab.t_recipe_quote', { name }) ?? 'lab.t_recipe_quote';
    return `<span class="appraisal-summary-recipe-chip" title="${name}"><img src="${icon}" class="appraisal-summary-recipe-icon" width="22" height="22" alt="${name}" loading="lazy" decoding="async" onerror="this.style.display='none'; if (this.nextElementSibling) { this.nextElementSibling.style.position='static'; this.nextElementSibling.style.clip='auto'; this.nextElementSibling.style.width='auto'; this.nextElementSibling.style.height='auto'; }"><span class="sr-only">${name}</span></span>`;
  }

  function getSignatureRecipeRecommendations(ingredients) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) return '';
    const normIngs = Array.from(new Set(
      ingredients.map(function(item) {
        if (!item) return '';
        const raw = typeof item === 'string' ? item : (item.name || '');
        return normalizeIngName(raw);
      }).filter(Boolean)
    ));

    if (normIngs.length === 0) return '';

    const topCategoryPool = (typeof window !== 'undefined' && Array.isArray(window.ALL_TOP_CATEGORY_RECIPES) && window.ALL_TOP_CATEGORY_RECIPES.length > 0)
      ? window.ALL_TOP_CATEGORY_RECIPES
      : null;
    const liveCachePool = (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0)
      ? window.__RECIPES_CACHE__
      : (typeof window !== 'undefined' && Array.isArray(window.allRecipes) && window.allRecipes.length > 0)
        ? window.allRecipes
        : null;

    let pool;
    if (liveCachePool && topCategoryPool) {
      const seen = new Set();
      pool = [];
      const addRecipe = function(r) {
        if (!r) return;
        const key = r.name_cn || r.name || r.name_en || '';
        if (!key || seen.has(key)) return;
        seen.add(key);
        pool.push(r);
      };
      liveCachePool.forEach(function(r) {
        if (r && (r.base_energy || 0) >= 7000) addRecipe(r);
      });
      topCategoryPool.forEach(addRecipe);
    } else if (liveCachePool) {
      const highTier = liveCachePool.filter(function(r) { return r && (r.base_energy || 0) >= 7000; });
      pool = highTier.length > 0 ? highTier : liveCachePool;
    } else if (topCategoryPool) {
      pool = topCategoryPool;
    } else {
      pool = TARGET_TOP_RECIPES;
    }

    const curLang = window.I18N?.pick?.({ 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN', 'en-US': 'en-US' }) ?? 'zh-TW';
    const cacheKey = curLang + ':' + (liveCachePool ? liveCachePool.length : 0) + ':' + pool.length + ':' + normIngs.join('|');
    const cachedRec = _sigRecipeRecCache[cacheKey];
    if (cachedRec !== undefined) return cachedRec;

    const scored = pool.map(function(recipe) {
      if (!recipe || !recipe.ingredients) return null;
      let matchCount = 0;
      let matchRequired = 0;
      recipe.ingredients.forEach(function(ing) {
        const normRecipeIng = normalizeIngName(ing.name || ing);
        if (normIngs.indexOf(normRecipeIng) !== -1) {
          matchCount++;
          matchRequired += (ing.count || 0);
        }
      });
      if (matchCount === 0) return null;

      const hasTail = normIngs.indexOf('美味尾巴') !== -1;
      const recipeHasTail = recipe.ingredients.some(function(i) { return (i.name || '').includes('尾巴'); });
      const tailBonus = (hasTail && recipeHasTail) ? 20000 : 0;
      const multiMatchBonus = (matchCount - 1) * 9000;
      const score = (recipe.base_energy || 0) + multiMatchBonus + (matchRequired * 40) + tailBonus;

      return {
        recipe: recipe,
        name_cn: recipe.name_cn,
        name_en: recipe.name_en,
        matchCount: matchCount,
        score: score
      };
    }).filter(Boolean).sort(function(a, b) {
      return b.score - a.score;
    });

    if (scored.length === 0) {
      _sigRecipeRecCache[cacheKey] = '';
      return '';
    }

    const top1 = scored[0];
    const top2 = scored.length > 1 ? scored[1] : null;

    const chip1 = formatSummaryRecipeChip(top1.recipe);
    const chip2 = top2 ? formatSummaryRecipeChip(top2.recipe) : '';

    let res = '';
    if (top2 && top2.name_cn !== top1.name_cn) {
      res = window.I18N?.t?.('lab.t_sig_recipes_two', { chip1, chip2 }) ?? 'lab.t_sig_recipes_two';
    } else {
      res = window.I18N?.t?.('lab.t_sig_recipes_one', { chip1 }) ?? 'lab.t_sig_recipes_one';
    }
    _sigRecipeRecCache[cacheKey] = res;
    return res;
  }

  /* ─── 智能深度簡評生成引擎 (Intelligent Appraisal Summary Engine) ─── */
  function generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation) {
    if (!pkmData) return '';
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

    const isMint = !!(pkmData && (pkmData.cleanseMint || pkmData.mint));
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    const buff = isMint ? 'none' : (natureObj ? natureObj.buffType : 'none');
    const debuff = isMint ? 'none' : (natureObj ? natureObj.debuffType : 'none');

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
    let ingArr = (ingredients || []).map(function(item) {
      if (!item) return '';
      return typeof item === 'string' ? item : (item.name || '');
    }).filter(Boolean);
    if (ingArr.length === 0 && pkmData && pkmData.ingredients) {
      ingArr = pkmData.ingredients.map(function(i) {
        return typeof i === 'string' ? i : (i.name || '');
      }).filter(Boolean);
    }
    if (ingArr.length === 0 && pkmData && (pkmData.ing1 || pkmData.ing2 || pkmData.ing3)) {
      ingArr = [pkmData.ing1, pkmData.ing2, pkmData.ing3].filter(Boolean);
    }

    const isAAA = ingArr.length >= 3 && ingArr[0] === ingArr[1] && ingArr[1] === ingArr[2];
    const isABB = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] === ingArr[2];
    const isABC = ingArr.length >= 3 && ingArr[0] !== ingArr[1] && ingArr[1] !== ingArr[2] && ingArr[0] !== ingArr[2];
    const hasTailLv30 = ingArr.length >= 2 && (ingArr[1] === '美味尾巴' || (ingArr[1] && ingArr[1].indexOf('尾巴') !== -1) || (ingArr[1] && ingArr[1].toLowerCase().indexOf('tail') !== -1));

    // 1. 呆呆獸家族 (核心戰略使命：解鎖美味尾巴)
    if (isSlowpoke) {
      if (hasTailLv30) {
        const slowpokeTailSalad = findTargetRecipe('呆呆獸尾巴的胡椒沙拉');
        const grilledTailCurry = findTargetRecipe('炙燒尾肉咖哩');
        const chip1 = formatSummaryRecipeChip(slowpokeTailSalad);
        const chip2 = formatSummaryRecipeChip(grilledTailCurry);
        return window.I18N?.t?.('lab.t_sum_slowpoke_ok', { chip1, chip2 }) ?? 'lab.t_sum_slowpoke_ok';
      } else {
        return window.I18N?.t?.('lab.t_sum_slowpoke_fail') ?? 'lab.t_sum_slowpoke_fail';
      }
    }

    // 2. 樹果型專精分析
    if (isBerry) {
      if (hasBFS_active) {
        if (hasHB_active || hasSpeedM_active || buff === 'speed' || debuff === 'ingredient') {
          return window.I18N?.t?.('lab.t_sum_berry_top') ?? 'lab.t_sum_berry_top';
        } else {
          return window.I18N?.t?.('lab.t_sum_berry_bfs') ?? 'lab.t_sum_berry_bfs';
        }
      } else if (hasBFS_future) {
        return window.I18N?.t?.('lab.t_sum_berry_future_bfs', { lv: hasBFS_future.level }) ?? 'lab.t_sum_berry_future_bfs';
      } else {
        if (hasHB_active && (hasSpeedM_active || buff === 'speed')) {
          return window.I18N?.t?.('lab.t_sum_berry_speed') ?? 'lab.t_sum_berry_speed';
        } else if (debuff === 'speed') {
          return window.I18N?.t?.('lab.t_sum_berry_slow') ?? 'lab.t_sum_berry_slow';
        } else {
          return window.I18N?.t?.('lab.t_sum_berry_trans') ?? 'lab.t_sum_berry_trans';
        }
      }
    }

    // 3. 技能型專精分析 (全面精細化劃分各大戰略流派)
    if (isSkill) {
      // 3.1 樹果遽增型 (Berry Burst: 謎擬Q, 蜥蜴王, 烈焰猴, 勇士雄鷹, 拉帝歐斯)
      if (isBerryBurst) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return window.I18N?.t?.('lab.t_sum_burst_top') ?? 'lab.t_sum_burst_top';
          }
          return window.I18N?.t?.('lab.t_sum_burst_bfs') ?? 'lab.t_sum_burst_bfs';
        }
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_burst_freq') ?? 'lab.t_sum_burst_freq';
        }
        return window.I18N?.t?.('lab.t_sum_burst_base') ?? 'lab.t_sum_burst_base';
      }

      // 3.2 活力全體療癒補師 (Healers: 沙奈朵, 仙子伊布, 胖可丁, 巴布土撥, 克雷色利亞, 壺壺)
      if (isHealer) {
        if (debuff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_healer_bad') ?? 'lab.t_sum_healer_bad';
        }
        if (hasSkillM_active && (buff === 'skill' || hasSpeedM_active || hasHB_active)) {
          const extraNote = hasBFS_active ? (window.I18N?.t?.('lab.t_sum_healer_bfs_note') ?? 'lab.t_sum_healer_bfs_note') : '';
          return window.I18N?.t?.('lab.t_sum_healer_top', { extraNote }) ?? 'lab.t_sum_healer_top';
        }
        if (!hasSkillM_active && !hasSkillS_active && buff !== 'skill') {
          if (hasSkillM_future) {
            return window.I18N?.t?.('lab.t_sum_healer_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_healer_future';
          }
          return window.I18N?.t?.('lab.t_sum_healer_low') ?? 'lab.t_sum_healer_low';
        }
        return window.I18N?.t?.('lab.t_sum_healer_ok') ?? 'lab.t_sum_healer_ok';
      }

      // 3.3 傳說神獸幫手加速型 (Helper Boost: 雷公, 炎帝, 水君, 風速狗, 雷伊布, 艾路雷朵)
      if (isHelperBoost) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_helper_top') ?? 'lab.t_sum_helper_top';
        }
        return window.I18N?.t?.('lab.t_sum_helper_base') ?? 'lab.t_sum_helper_base';
      }

      // 3.4 單體充能直傷型 (Charge Strength S/M: 電龍, 太陽伊布, 哥達鴨, 樹才怪, 隨風球, 音波龍, 達克萊伊)
      if (isChargeStrength) {
        if (hasBFS_active) {
          if (hasSkillM_active || buff === 'skill') {
            return window.I18N?.t?.('lab.t_sum_charge_hybrid_top') ?? 'lab.t_sum_charge_hybrid_top';
          }
          return window.I18N?.t?.('lab.t_sum_charge_hybrid') ?? 'lab.t_sum_charge_hybrid';
        }
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_charge_freq') ?? 'lab.t_sum_charge_freq';
        }
        return window.I18N?.t?.('lab.t_sum_charge_base') ?? 'lab.t_sum_charge_base';
      }

      // 3.5 傳說/幻之寶可夢專屬機制 (超夢, 夢幻, 達克萊伊, 克雷色利亞)
      if (isLegendary) {
        if (mainSkill.includes('精神擊破') || mainSkill.includes('樹果領域')) {
          return window.I18N?.t?.('lab.t_sum_leg_psystrike') ?? 'lab.t_sum_leg_psystrike';
        }
        if (mainSkill.includes('十項全能') || mainSkill.includes('揮指')) {
          return window.I18N?.t?.('lab.t_sum_leg_decathlon') ?? 'lab.t_sum_leg_decathlon';
        }
        if (mainSkill.includes('夢魘')) {
          return window.I18N?.t?.('lab.t_sum_leg_dark') ?? 'lab.t_sum_leg_dark';
        }
      }

      // 3.6 料理美味度/大成功型 (Extra Tasty: 咚咚鼠, 海豹球佳節)
      if (isExtraTasty) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_tasty_top') ?? 'lab.t_sum_tasty_top';
        }
        return window.I18N?.t?.('lab.t_sum_tasty_base') ?? 'lab.t_sum_tasty_base';
      }

      // 3.7 料理擴鍋型 (Pot Expanders: 自爆磁怪, 火伊布, 冰伊布, 負電拍拍, 顫弦蠑螈)
      if (isPotExpander) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_pot_top') ?? 'lab.t_sum_pot_top';
        }
        return window.I18N?.t?.('lab.t_sum_pot_base') ?? 'lab.t_sum_pot_base';
      }

      // 3.8 夢之碎片型 (Dream Shards: 路卡利歐, 喵喵, 貓老大, 勾魂眼, 吞食獸)
      if (isDreamShard) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_shard_top') ?? 'lab.t_sum_shard_top';
        }
        return window.I18N?.t?.('lab.t_sum_shard_base') ?? 'lab.t_sum_shard_base';
      }

      // 3.9 食材獲取/精選型技能寵 (Ingredient Draw: 水伊布, 伊布, 毒電嬰, 正電拍拍, 穿山王, 摔角鷹人, 赫拉克羅斯)
      if (isIngSkill) {
        if (hasSkillM_active || buff === 'skill') {
          return window.I18N?.t?.('lab.t_sum_ingskill_top') ?? 'lab.t_sum_ingskill_top';
        }
        return window.I18N?.t?.('lab.t_sum_ingskill_base') ?? 'lab.t_sum_ingskill_base';
      }

      // 3.10 隨機揮指型 (Metronome: 波克基斯, 波克比, 夢幻)
      if (isMetronome) {
        return window.I18N?.t?.('lab.t_sum_metronome') ?? 'lab.t_sum_metronome';
      }

      if (debuff === 'skill') {
        return window.I18N?.t?.('lab.t_sum_skill_bad') ?? 'lab.t_sum_skill_bad';
      }
      if (hasSkillM_active || buff === 'skill') {
        if (hasSkillM_future) {
          return window.I18N?.t?.('lab.t_sum_skill_anchor_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_skill_anchor_future';
        }
        return window.I18N?.t?.('lab.t_sum_skill_anchor') ?? 'lab.t_sum_skill_anchor';
      }
      if (hasSkillM_future) {
        return window.I18N?.t?.('lab.t_sum_skill_future', { lv: hasSkillM_future.level }) ?? 'lab.t_sum_skill_future';
      }
      return window.I18N?.t?.('lab.t_sum_skill_base') ?? 'lab.t_sum_skill_base';
    }

    // 4. 食材型專精分析 (嚴禁混入技能型要求)
    if (isIng) {
      if (debuff === 'ingredient') {
        return window.I18N?.t?.('lab.t_sum_ing_bad') ?? 'lab.t_sum_ing_bad';
      }

      const recipeSynergy = getSignatureRecipeRecommendations(ingArr);
      const recipePhrase = recipeSynergy ? ` ${recipeSynergy}` : '';

      let ingSpreadDesc = '';
      if (isAAA) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_aaa') ?? 'lab.t_sum_ing_aaa';
      } else if (isABB) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_abb') ?? 'lab.t_sum_ing_abb';
      } else if (isABC) {
        ingSpreadDesc = window.I18N?.t?.('lab.t_sum_ing_abc') ?? 'lab.t_sum_ing_abc';
      }

      if (hasIngM_active || buff === 'ingredient') {
        if (hasBFS_active) {
          if (hasInv_active) {
            return window.I18N?.t?.('lab.t_sum_ing_hybrid_inv', { recipePhrase }) ?? 'lab.t_sum_ing_hybrid_inv';
          } else {
            return window.I18N?.t?.('lab.t_sum_ing_hybrid_noinv', { recipePhrase }) ?? 'lab.t_sum_ing_hybrid_noinv';
          }
        }

        return window.I18N?.t?.('lab.t_sum_ing_top', { recipePhrase, ingSpreadDesc }) ?? 'lab.t_sum_ing_top';
      }

      if (!hasIngM_active && !hasIngS_active && buff !== 'ingredient') {
        if (hasIngM_future) {
          return window.I18N?.t?.('lab.t_sum_ing_future', { lv: hasIngM_future.level, recipePhrase }) ?? 'lab.t_sum_ing_future';
        }
        if (hasSpeedM_active || buff === 'speed' || hasHB_active) {
          return window.I18N?.t?.('lab.t_sum_ing_speed', { recipePhrase }) ?? 'lab.t_sum_ing_speed';
        }
        return window.I18N?.t?.('lab.t_sum_ing_low', { recipePhrase }) ?? 'lab.t_sum_ing_low';
      }

      return window.I18N?.t?.('lab.t_sum_ing_solid', { recipePhrase, ingSpreadDesc }) ?? 'lab.t_sum_ing_solid';
    }

    return window.I18N?.t?.('lab.t_sum_fallback', { grade: currentGrade, score: currentScore }) ?? 'lab.t_sum_fallback';
  }

  /* ─── 對外入口：雙軌評級與里程碑評定 (Dual-Track Appraisal API) ─────── */
  const _evalPokemonCache = Object.create(null);
  let _evalPokemonCacheCount = 0;

  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, cleanseMint) {
    if (!pkmData) return null;
    currentLv = parseInt(currentLv, 10) || 30;
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const langKey = window.I18N?.pick?.({ 'zh-TW': 'zh-TW', 'zh-CN': 'zh-CN', 'en-US': 'en-US' }) ?? 'zh-TW';
    const pkmIdentity = (pkmData.id || '') + ':' + (pkmData.name_cn || pkmData.name_en || pkmData.name || '') + ':' + (pkmData.specialty || '') + ':' + (pkmData.base_frequency || pkmData.frequency || '') + ':' + (pkmData.is_final || '') + ':' + (pkmData.main_skill || '') + ':' + (pkmData.ingredient_rate || '') + ':' + (pkmData.skill_rate || '');
    const subsKey = Array.isArray(subskills) ? subskills.join('|') : '';
    const ingsKey = Array.isArray(ingredients)
      ? ingredients.map(function (x) { return typeof x === 'string' ? x : ((x && x.name) ? (x.name + ':' + (x.count || x.l1 || '')) : ''); }).join('|')
      : '';
    const cacheKey = pkmIdentity + '@' + currentLv + '@' + (natureName || '') + '@' + subsKey + '@' + ingsKey + '@' + (ribbonLevel || 0) + '@' + (skillLevel || '') + '@' + (isMint ? 1 : 0) + '@' + langKey;

    if (_evalPokemonCache[cacheKey]) {
      return Object.assign({}, _evalPokemonCache[cacheKey]);
    }

    const targetPkm = Object.assign({}, pkmData, { cleanseMint: isMint });

    const currentEval = evaluateSingle(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, false, isMint);
    if (!currentEval) return null;

    const potentialEval = evaluateSingle(targetPkm, 100, natureName, subskills, ingredients, ribbonLevel, skillLevel, true, isMint);
    const milestones = calculateMilestoneProjections(targetPkm, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    if (currentEval.diagnostics) {
      currentEval.diagnostics.milestones = milestones;
    }

    const intelligentSummary = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, currentEval);

    const result = Object.assign({}, currentEval, {
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

    if (_evalPokemonCacheCount > 2500) {
      for (const k in _evalPokemonCache) delete _evalPokemonCache[k];
      _evalPokemonCacheCount = 0;
    }
    _evalPokemonCache[cacheKey] = result;
    _evalPokemonCacheCount++;

    return Object.assign({}, result);
  }

  /* ─── 升級成本精算 ─────────────────────────────────────── */
  const _milestoneCostCache = Object.create(null);

  function calculateMilestoneCost(fromLv, targetLv, nature) {
    if (fromLv >= targetLv) {
      return { exp: 0, candies: 0, shards: 0, handyCandyS: 0, handyCandyM: 0 };
    }

    const expMod = (nature && nature.buffType === 'exp') ? 'up' : ((nature && nature.debuffType === 'exp') ? 'down' : 'neutral');
    const costKey = fromLv + ':' + targetLv + ':' + expMod;
    const cachedCost = _milestoneCostCache[costKey];
    if (cachedCost) return cachedCost;

    const startExp = EXP_MILESTONES[fromLv] || (fromLv * 100);
    const endExp = EXP_MILESTONES[targetLv] || (targetLv * 500);
    let expDiff = Math.max(endExp - startExp, 0);

    if (expMod === 'up') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (expMod === 'down') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candiesNeeded = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shardsNeeded = Math.max(endShards - startShards, 0);

    const res = {
      exp: expDiff,
      candies: candiesNeeded,
      shards: shardsNeeded,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20)
    };
    _milestoneCostCache[costKey] = res;
    return res;
  }

  /* ─── 原生 SVG 六維雷達圖生成器 (完美對稱正規六邊形 + 頂點直接標註分數) ───────────────────────── */
  function renderRadarChartSVG(scores, width, height) {
    width = width || 360;
    height = height || 270;
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta();
    const cx = width / 2;
    const cy = (height / 2) + 1;
    const marginY = isCompact ? 22 : 28;
    const marginX = isCompact ? 36 : 46;
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
      const cls = level === 1.0 ? 'radar-grid-poly radar-grid-outer' : 'radar-grid-poly';
      return '<polygon class="' + cls + '" points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line class="radar-axis-line" x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
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
      const sideOffset = isCompact ? 6 : 8;

      if (i === 0) { // Top (樹果產能)
        lx = cx;
        ly = cy - r - (isCompact ? 16 : 19);
        textAnchor = 'middle';
      } else if (i === 1) { // Top-Right (食材產能)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'start';
      } else if (i === 2) { // Bottom-Right (技能強度)
        lx = cx + r * Math.cos(angles[i]) + sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'start';
      } else if (i === 3) { // Bottom (幫忙速度)
        lx = cx;
        ly = cy + r + (isCompact ? 13 : 15);
        textAnchor = 'middle';
      } else if (i === 4) { // Bottom-Left (後期成長)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) + (isCompact ? 3 : 5);
        textAnchor = 'end';
      } else if (i === 5) { // Top-Left (資源效益)
        lx = cx + r * Math.cos(angles[i]) - sideOffset;
        ly = cy + r * Math.sin(angles[i]) - (isCompact ? 5 : 7);
        textAnchor = 'end';
      }

      const dotR = isCompact ? '3.5' : '4.8';
      const labelFontSize = isCompact ? '10' : '13';
      const scoreFontSize = isCompact ? '9.5' : '12';
      const scoreDy = isCompact ? '11.5' : '14';

      return '<circle class="radar-data-dot" cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + dotR + '" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan class="radar-label-text" x="' + lx.toFixed(1) + '" dy="' + (i === 0 ? '-2' : '0') + '" fill="var(--text-primary)" font-size="' + labelFontSize + '" font-weight="700">' + p.meta.label + '</tspan>' +
             '<tspan class="radar-score-tspan" x="' + lx.toFixed(1) + '" dy="' + scoreDy + '" fill="#38bdf8" font-size="' + scoreFontSize + '" font-weight="800">' + p.score + (window.I18N?.t?.('lab.t_pts_unit') ?? 'lab.t_pts_unit') + '</tspan>' +
             '</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="100%" style="display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon class="radar-data-poly" points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
  }


  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  function _getLabGameConfig() {
    return (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
           (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
  }

  const _FALLBACK_BERRY_VALUES_DATA = [
    { id: 'pamtre', name: '椰木果', type: '飛行', energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/pamtreberry.png' },
    { id: 'lum',    name: '木子果', type: '蟲',   energy: 24, icon: 'https://www.serebii.net/pokemonsleep/berries/lumberry.png' },
    { id: 'grepa',  name: '異奇果', type: '電',   energy: 25, icon: 'https://www.serebii.net/pokemonsleep/berries/grepaberry.png' },
    { id: 'bluk',   name: '檬果',   type: '幽靈', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/blukberry.png' },
    { id: 'pecha',  name: '桃桃果', type: '妖精', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/pechaberry.png' },
    { id: 'mago',   name: '芒念果', type: '超能', energy: 26, icon: 'https://www.serebii.net/pokemonsleep/berries/magoberry.png' },
    { id: 'leppa',  name: '蘋野果', type: '火',   energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/leppaberry.png' },
    { id: 'cheri',  name: '櫻子果', type: '格鬥', energy: 27, icon: 'https://www.serebii.net/pokemonsleep/berries/cheriberry.png' },
    { id: 'persim', name: '柿仔果', type: '一般', energy: 28, icon: 'https://www.serebii.net/pokemonsleep/berries/persimberry.png' },
    { id: 'figy',   name: '勿花果', type: '地面', energy: 29, icon: 'https://www.serebii.net/pokemonsleep/berries/figyberry.png' },
    { id: 'sitrus', name: '文柚果', type: '岩石', energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/sitrusberry.png' },
    { id: 'durin',  name: '榴石果', type: '草',   energy: 30, icon: 'https://www.serebii.net/pokemonsleep/berries/durinberry.png' },
    { id: 'oran',   name: '橙橙果', type: '水',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/oranberry.png' },
    { id: 'wiki',   name: '芭拉果', type: '惡',   energy: 31, icon: 'https://www.serebii.net/pokemonsleep/berries/wikiberry.png' },
    { id: 'chesto', name: '零餘果', type: '毒',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/chestoberry.png' },
    { id: 'rawst',  name: '生薑果', type: '冰',   energy: 32, icon: 'https://www.serebii.net/pokemonsleep/berries/rawstberry.png' },
    { id: 'belue',  name: '靛莓果', type: '鋼',   energy: 33, icon: 'https://www.serebii.net/pokemonsleep/berries/belueberry.png' },
    { id: 'yache',  name: '巧可果', type: '龍',   energy: 35, icon: 'https://www.serebii.net/pokemonsleep/berries/yacheberry.png' }
  ];

  const _LAB_FALLBACK_BERRY_ID_ALIASES = {
    '椰木果': 'pamtre', '藍異果': 'pamtre', 'pamtre': 'pamtre', '飛行': 'pamtre', '飛': 'pamtre',
    '木子果': 'lum', '芭亞果': 'lum', 'lum': 'lum', '蟲': 'lum',
    '異奇果': 'grepa', 'grepa': 'grepa', '電': 'grepa',
    '檬果': 'bluk', 'bluk': 'bluk', '幽靈': 'bluk', '鬼': 'bluk',
    '桃桃果': 'pecha', 'pecha': 'pecha', '妖精': 'pecha', '妖': 'pecha',
    '芒念果': 'mago', '芒芒果': 'mago', 'mago': 'mago', '超能力': 'mago', '超能': 'mago', '超': 'mago',
    '蘋野果': 'leppa', 'leppa': 'leppa', '火': 'leppa',
    '櫻子果': 'cheri', 'cheri': 'cheri', '格鬥': 'cheri', '鬥': 'cheri',
    '柿仔果': 'persim', 'persim': 'persim', '一般': 'persim',
    '勿花果': 'figy', 'figy': 'figy', '地面': 'figy', '地': 'figy',
    '文柚果': 'sitrus', 'sitrus': 'sitrus', '岩石': 'sitrus', '岩': 'sitrus',
    '榴石果': 'durin', '墨莓果': 'durin', 'durin': 'durin', '草': 'durin',
    '橙橙果': 'oran', 'oran': 'oran', '水': 'oran',
    '芭拉果': 'wiki', '威嘻果': 'wiki', 'wiki': 'wiki', '惡': 'wiki',
    '零餘果': 'chesto', 'chesto': 'chesto', '毒': 'chesto',
    '生薑果': 'rawst', '羅子果': 'rawst', 'rawst': 'rawst', '冰': 'rawst',
    '靛莓果': 'belue', '刺角果': 'belue', 'belue': 'belue', '鋼': 'belue',
    '巧可果': 'yache', '亞雪果': 'yache', 'yache': 'yache', '龍': 'yache'
  };

  function _resolveLabBerryCanonicalId(nameOrType) {
    if (!nameOrType) return null;
    const gc = _getLabGameConfig();
    if (gc && typeof gc.resolveBerryCanonicalId === 'function') {
      const id = gc.resolveBerryCanonicalId(nameOrType);
      if (id) return id;
    }
    const k = String(nameOrType).trim();
    return _LAB_FALLBACK_BERRY_ID_ALIASES[k] || _LAB_FALLBACK_BERRY_ID_ALIASES[k.toLowerCase()] || null;
  }

  function _sortLabBerriesByEnergyAsc(list) {
    if (!Array.isArray(list)) return [];
    const gc = _getLabGameConfig();
    if (gc && typeof gc.sortBerriesByEnergyAsc === 'function') {
      return gc.sortBerriesByEnergyAsc(list, (b) => (typeof b === 'string' ? b : (b.id || b.name || b.type)));
    }
    const orderMap = Object.create(null);
    _FALLBACK_BERRY_VALUES_DATA.forEach((b, idx) => { orderMap[b.id] = idx; });
    return list
      .map((item, idx) => ({ item, idx }))
      .sort((a, b) => {
        const ida = _resolveLabBerryCanonicalId(typeof a.item === 'string' ? a.item : (a.item && (a.item.id || a.item.name || a.item.type)));
        const idb = _resolveLabBerryCanonicalId(typeof b.item === 'string' ? b.item : (b.item && (b.item.id || b.item.name || b.item.type)));
        const ra = ida && Object.prototype.hasOwnProperty.call(orderMap, ida) ? orderMap[ida] : Number.MAX_SAFE_INTEGER;
        const rb = idb && Object.prototype.hasOwnProperty.call(orderMap, idb) ? orderMap[idb] : Number.MAX_SAFE_INTEGER;
        return ra !== rb ? ra - rb : a.idx - b.idx;
      })
      .map((x) => x.item);
  }

  function _getLabBerryValuesData() {
    const gc = _getLabGameConfig();
    if (gc && Array.isArray(gc.CANONICAL_BERRIES) && gc.CANONICAL_BERRIES.length > 0) {
      const fallbackById = Object.create(null);
      _FALLBACK_BERRY_VALUES_DATA.forEach((b) => { fallbackById[b.id] = b; });
      return _sortLabBerriesByEnergyAsc(gc.CANONICAL_BERRIES.map((b) => {
        const fb = fallbackById[b.id];
        return {
          id: b.id,
          name: b.name,
          type: (fb && fb.type) || b.type,
          energy: b.energy,
          icon: b.icon || (fb && fb.icon) || ''
        };
      }));
    }
    return _FALLBACK_BERRY_VALUES_DATA.slice();
  }

  const BERRY_VALUES_DATA = _getLabBerryValuesData();

  function _findLabBerryData(nameOrType) {
    if (!nameOrType) return null;
    const list = _getLabBerryValuesData();
    const direct = list.find((b) => b.name === nameOrType || b.id === nameOrType);
    if (direct) return direct;
    const cid = _resolveLabBerryCanonicalId(nameOrType);
    if (!cid) return null;
    return list.find((b) => b.id === cid) || null;
  }

  function _isLabFavoredBerryOrType(berryName, berryType, favBerries, favTypes) {
    if (Array.isArray(favBerries)) {
      if (berryName && favBerries.includes(berryName)) return true;
      const bCid = _resolveLabBerryCanonicalId(berryName);
      if (bCid && favBerries.some(fb => _resolveLabBerryCanonicalId(fb) === bCid)) return true;
    }
    if (Array.isArray(favTypes)) {
      if (berryType && favTypes.includes(berryType)) return true;
      const tCid = _resolveLabBerryCanonicalId(berryType);
      if (tCid && favTypes.some(ft => _resolveLabBerryCanonicalId(ft) === tCid)) return true;
    }
    return false;
  }

  const INGREDIENTS_ENERGY_MAP = {
    '特選蘋果': 90, 'Fancy Apple': 90,
    '哞哞鮮奶': 98, 'Moomoo Milk': 98,
    '萌綠大豆': 100, 'Greengrass Soybeans': 100,
    '甜甜蜜': 101, 'Honey': 101,
    '豆製肉': 103, 'Bean Sausage': 103,
    '暖暖薑': 109, 'Warming Ginger': 109,
    '好眠番茄': 110, 'Snoozy Tomato': 110,
    '一口堅果': 112, 'Snackable Nuts': 112,
    '特選蛋': 115, 'Fancy Egg': 115,
    '純粹油': 121, 'Pure Oil': 121,
    '窩心洋芋': 124, 'Soft Potato': 124,
    '火辣香草': 130, 'Fiery Herb': 130,
    '萌綠玉米': 140, 'Greengrass Corn': 140,
    '放鬆可可': 151, 'Soothing Cacao': 151,
    '醒腦咖啡豆': 153, 'Rousing Coffee': 153,
    '嫩亮酪梨': 162, 'Glossy Avocado': 162,
    '品鮮蘑菇': 167, 'Tasty Mushroom': 167,
    '粗枝大蔥': 185, 'Large Leek': 185,
    '沉甸甸南瓜': 250, 'Plump Pumpkin': 250,
    '美味尾巴': 342, 'Slowpoke Tail': 342
  };

  const LAB_ISLANDS = [
    {
      id: 'greengrass',
      name: '萌綠之島',
      name_en: 'Greengrass Isle',
      color: '#22c55e',
      image: 'assets/islands/hd/greengrass.jpg',
      berries: ['桃桃果', '橙橙果', '櫻子果'],
      types: ['妖精', '水', '格鬥'],
      desc: '初始營地 · 自由全屬性'
    },
    {
      id: 'cyan',
      name: '天青沙灘',
      name_en: 'Cyan Beach',
      color: '#06b6d4',
      image: 'assets/islands/hd/cyan.jpg',
      berries: ['橙橙果', '椰木果', '桃桃果'],
      types: ['水', '飛行', '妖精'],
      desc: '喜愛樹果：水、飛行、妖精 (2x 能量)'
    },
    {
      id: 'taupe',
      name: '灰褐洞窟',
      name_en: 'Taupe Hollow',
      color: '#f97316',
      image: 'assets/islands/hd/taupe.jpg',
      berries: ['蘋野果', '勿花果', '文柚果'],
      types: ['火', '地面', '岩石'],
      desc: '喜愛樹果：火、地面、岩石 (2x 能量)'
    },
    {
      id: 'snowdrop',
      name: '白花雪原',
      name_en: 'Snowdrop Tundra',
      color: '#38bdf8',
      image: 'assets/islands/hd/snowdrop.jpg',
      berries: ['柿仔果', '生薑果', '芭拉果'],
      types: ['一般', '冰', '惡'],
      desc: '喜愛樹果：一般、冰、惡 (2x 能量)'
    },
    {
      id: 'lapis',
      name: '寶藍湖畔',
      name_en: 'Lapis Lakeside',
      color: '#a855f7',
      image: 'assets/islands/hd/lapis.jpg',
      berries: ['榴石果', '櫻子果', '芒念果'],
      types: ['草', '格鬥', '超能'],
      desc: '喜愛樹果：草、格鬥、超能 (2x 能量)'
    },
    {
      id: 'powerplant',
      name: '黃金舊發電廠',
      name_en: 'Old Gold Power Plant',
      color: '#eab308',
      image: 'assets/islands/hd/oldgold.jpg',
      berries: ['異奇果', '檬果', '靛莓果'],
      types: ['電', '幽靈', '鋼'],
      desc: '喜愛樹果：電、幽靈、鋼 (2x 能量)'
    },
    {
      id: 'amber',
      name: '琥褐溪谷',
      name_en: 'Amber Canyon',
      color: '#d97706',
      image: 'assets/islands/hd/amber.jpg',
      berries: ['零餘果', '木子果', '巧可果'],
      types: ['毒', '蟲', '龍'],
      desc: '喜愛樹果：毒、蟲、龍 (2x 能量)'
    }
  ];

  let labState = {
    currentSubTab: 'team',
    teamIslandId: 'greengrass',
    teamSlots: [null, null, null, null, null],
    teamStrategy: 'balanced', // 'balanced' | 'berries' | 'ingredients' | 'skills' | 'recipe'
    cookingType: 'curry',     // 'curry' | 'salad' | 'dessert'
    targetRecipeName: '彈跳咖哩烏龍麵',
    greengrassBerries: ['桃桃果', '橙橙果', '櫻子果'],
    compareSlots: [null, null, null],
    compareBenchmarkLevel: 'box', // 'box' | 30 | 50 | 60 | 100
    selectedBoxUid: '',
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: [],
    ribbon: 0,
    nickname: '',
    skillLevel: 1,
    isCustomized: false,
    editMode: false,
    editBackup: null,
    activeSubskillSlot: 1
  };

  Object.defineProperty(labState, 'compareUidA', {
    get: function() { return (this.compareSlots && this.compareSlots[0]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[0] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidB', {
    get: function() { return (this.compareSlots && this.compareSlots[1]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[1] = v || null; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(labState, 'compareUidC', {
    get: function() { return (this.compareSlots && this.compareSlots[2]) || null; },
    set: function(v) { if (!Array.isArray(this.compareSlots)) this.compareSlots = [null, null, null]; this.compareSlots[2] = v || null; },
    configurable: true,
    enumerable: true
  });

  const COOKING_CATEGORY_KEY_INGREDIENTS = {
    curry: ['豆製肉', '好眠番茄', '暖暖薑', '火辣香草', '萌綠玉米', '粗枝大蔥', '品鮮蘑菇', '特選蛋', '美味尾巴', 'Bean Sausage', 'Snoozy Tomato', 'Warming Ginger', 'Fiery Herb', 'Greengrass Corn', 'Large Leek', 'Tasty Mushroom', 'Fancy Egg', 'Slowpoke Tail'],
    salad: ['純粹油', '好眠番茄', '特選蘋果', '放鬆可可', '窩心洋芋', '萌綠大豆', '萌綠玉米', '嫩亮酪梨', '粗枝大蔥', 'Pure Oil', 'Snoozy Tomato', 'Fancy Apple', 'Soothing Cacao', 'Soft Potato', 'Greengrass Soybeans', 'Greengrass Corn', 'Glossy Avocado', 'Large Leek'],
    dessert: ['甜甜蜜', '特選蘋果', '哞哞鮮奶', '放鬆可可', '特選蛋', '醒腦咖啡豆', '暖暖薑', '沉甸甸南瓜', 'Honey', 'Fancy Apple', 'Moomoo Milk', 'Soothing Cacao', 'Fancy Egg', 'Rousing Coffee', 'Warming Ginger', 'Plump Pumpkin']
  };


  /* ─── 診斷報告書彈窗模板渲染 (H5 & Desktop HTML Templates) ─── */
  function renderAppraisalMobileSheetHtml(ctx) {
    const { pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName, natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote, mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG, subskills, ribbonLevel } = ctx;
    return `
        <div class="box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
          <div class="box-modal-header">
            <button type="button" class="box-modal-header-cancel" onclick="window.AppraisalLab.closeModal()">${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}</button>
            <!-- 雙軌綜合評級徽章 (居中置於標題原位) -->
            <div class="appraisal-dual-verdict-column">
              <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};">
                <span class="pokedex-verdict-track-lbl" style="font-size:9.5px;color:#94a3b8;line-height:1;">${window.I18N?.t?.('lab.t_track_current') ?? 'lab.t_track_current'}</span>
                <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:13px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:10px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
              </div>
              <div class="pokedex-header-verdict-badge potential-track">
                <span class="pokedex-verdict-track-lbl" style="font-size:8.5px;color:#64748b;line-height:1;">${window.I18N?.t?.('lab.t_track_max_lv') ?? 'lab.t_track_max_lv'}</span>
                <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:9.5px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
              </div>
            </div>
            ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
              <button type="button" class="box-modal-header-confirm" onclick="window.AppraisalLab.openCurrentEditModal()">${window.I18N?.t?.('lab.t_edit') ?? 'lab.t_edit'}</button>
            ` : `<span style="width:36px;"></span>`}
          </div>

          <div class="box-modal-body appraisal-modal-sheet-body">
            <!-- 寶可夢核心建構資訊 (純淨無外框容器，依據 Single Frame 原則) -->
            <div class="appraisal-h5-header-summary">
              <div class="appraisal-h5-profile-row" style="display:flex;align-items:center;gap:10px;">
                <div class="appraisal-h5-avatar-wrap">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" width="88" height="88" decoding="async" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                <div class="appraisal-h5-info-col">
                  <!-- Row 1: 寶可夢名稱 + 稱號 + 樹果 + 專長 + 睡飽飽獎章 -->
                  <div class="appraisal-h5-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="appraisal-h5-pkm-name font-bold">${displayName}</span>
                    ${nickname ? `<span class="appraisal-h5-nick">(${escapeHtml(nickname)})</span>` : ''}
                    <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                      ${berry.icon ? `<img src="${berry.icon}" width="18" height="18" decoding="async" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                    </span>
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 18, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                    ${ribbonLevel > 0 ? `
                      <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:10.5px;font-weight:700;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" width="14" height="14" decoding="async" style="width:14px;height:14px;object-fit:contain;" alt="Ribbon" />
                        <span>+${evaluation.ribbonBonus.carry} ${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${window.I18N?.t?.('lab.t_ribbon_spd', { pct: Math.round(evaluation.ribbonBonus.speedDiscount * 100) }) ?? 'lab.t_ribbon_spd'}` : ''}</span>
                      </div>
                    ` : ''}
                  </div>
                  <!-- Row 2: 主技能與三階段食材插槽整合成同一行 (位於頭像旁第二行) -->
                  <div class="appraisal-h5-subinfo-row" style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;">
                    <div class="appraisal-mainskill-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <span class="appraisal-mainskill-name" style="font-size:12px;font-weight:700;color:var(--text-primary);">${escapeHtml(mainSkillName)}</span>
                      <span class="appraisal-mainskill-level" style="font-size:11px;font-weight:700;color:var(--accent-blue, #38bdf8);background:rgba(56,189,248,0.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(56,189,248,0.25);">Lv.${skillLvl}</span>
                    </div>
                    <div class="appraisal-ing-parallel-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <div class="appraisal-ing-chips-grid" style="display:inline-flex;gap:4px;align-items:center;">
                        ${ingChipsHtml}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 性格展示 (遊戲同款卡片) -->
              <div class="appraisal-config-section" style="margin-top:2px;display:flex;justify-content:center;width:100%;">
                <div class="appraisal-nature-game-card">
                  <div class="nature-pill-capsule">
                    <span class="nature-capsule-tag">${window.I18N?.t?.('lab.t_nature') ?? 'lab.t_nature'}</span>
                    <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                  </div>
                  ${natureEffectHtml}
                </div>
              </div>

              <!-- 基礎數值雙欄縱向列 (幫忙間隔/持有/食材率/技能率，佔位寬度契合副技能網格) -->
              <div class="appraisal-config-section appraisal-stats-section" style="margin-top:4px;width:100%;">
                <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_frequency') ?? 'lab.t_frequency'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-interval-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-carry-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_ing_rate') ?? 'lab.t_ing_rate'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_skill_rate') ?? 'lab.t_skill_rate'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 副技能清單 (2+2+1 排列) -->
              <div class="appraisal-config-section" style="margin-top:6px;width:100%;">
                <div class="appraisal-subskills-grid">
                  ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                    const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                    const sName = rawName ? (window.I18N?.getSubSkillName?.(rawName) ?? rawName) : '--';
                    const tier = getSkillTier(rawName);
                    const isUnlocked = currentLv >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = rawName
                      ? (window.I18N?.t?.(isUnlocked ? 'lab.t_subskill_title_unlocked' : 'lab.t_subskill_title_locked', { name: sName, lv }) ?? 'lab.t_subskill_title_unlocked')
                      : (window.I18N?.t?.('lab.t_subskill_slot', { lv }) ?? 'lab.t_subskill_slot');
                    return `
                      <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(sName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- 食材與技能產能算法精算拆解 (純展示無調整組件) -->
            ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function') ? `
              <div class="appraisal-calc-mobile-wrap" style="margin-top:8px;width:100%;">
                <div class="pokedex-calc-formula-card">
                  ${window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)}
                </div>
              </div>
            ` : ''}

            <!-- 雷達圖與六維能量條 -->
            <div class="appraisal-chart-flex" style="margin-top:4px;">
              <div class="appraisal-radar-wrapper" style="width:100%;max-width:340px;height:255px;margin:0 auto;">
                ${renderRadarChartSVG(evaluation.scores, 340, 255)}
              </div>
            </div>

            <!-- 專長深度點評與優缺點 -->
            <div class="appraisal-analysis-card" style="margin-top:6px;">
              <h4 class="appraisal-section-heading">${window.I18N?.t?.('lab.t_synergy_heading_mobile') ?? 'lab.t_synergy_heading_mobile'}</h4>
              <div class="appraisal-pros-list">
                ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
              </div>
              ${evaluation.cons.length > 0 ? `
                <div class="appraisal-cons-list">
                  ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- 智能簡評欄 (嵌入式膠囊標籤) -->
            <div class="appraisal-summary-bar">
              <span class="appraisal-summary-label">${window.I18N?.t?.('lab.t_summary_label') ?? 'lab.t_summary_label'}</span>
              <span class="appraisal-summary-text">${summaryNote}</span>
            </div>
          </div>
        </div>
      `;
  }

  function renderAppraisalDesktopModalHtml(ctx) {
    const { pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName, natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote, mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG, subskills, ribbonLevel } = ctx;
    return `
        <div class="appraisal-modal-container">
          <!-- 頂部標題列 (高度加寬，垂直置中，整合雙軌評級與極簡關閉鈕) -->
          <div class="appraisal-modal-header">
            <div class="appraisal-header-title-group">
              <span class="appraisal-modal-badge">${window.I18N?.t?.('lab.t_modal_badge') ?? 'lab.t_modal_badge'}</span>
              <h2 class="appraisal-pokemon-title">
                ${nickname ? `<span class="appraisal-pokemon-nickname">${escapeHtml(nickname)}</span> <span class="appraisal-pokemon-base-name" style="font-size:0.85em;color:var(--text-secondary);font-weight:normal;">(${displayName})</span>` : displayName}
              </h2>
            </div>

            <div class="appraisal-header-actions">
              <!-- 雙軌綜合評級徽章 (對齊圖鑑彈窗風格，垂直置中，當前亮眼 + 滿級低調) -->
              <div class="appraisal-dual-verdict-column">
                <!-- 當前實力 (Current Level Rating) -->
                <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${window.I18N?.t?.('lab.t_current_rating_title', { lv: currentLv }) ?? 'lab.t_current_rating_title'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${window.I18N?.t?.('lab.t_track_current') ?? 'lab.t_track_current'}</span>
                  <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
                </div>
                <!-- 滿級潛力 (Max Potential Rating) -->
                <div class="pokedex-header-verdict-badge potential-track" title="${window.I18N?.t?.('lab.t_max_rating_title') ?? 'lab.t_max_rating_title'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${window.I18N?.t?.('lab.t_track_max_lv') ?? 'lab.t_track_max_lv'}</span>
                  <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
                </div>
              </div>

              <!-- 編輯按鈕 (若來自倉庫) -->
              ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
                <button type="button" class="appraisal-edit-btn" onclick="window.AppraisalLab.openCurrentEditModal()" title="${window.I18N?.t?.('lab.t_edit_stats_title') ?? 'lab.t_edit_stats_title'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>${window.I18N?.t?.('lab.t_edit_stats') ?? 'lab.t_edit_stats'}</span>
                </button>
              ` : ''}

              <!-- 極簡關閉按鈕 -->
              <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}" aria-label="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 報告核心主體 (精簡三欄排版，徹底去除多餘巢狀容器外框) -->
          <div class="appraisal-modal-body">
            <!-- 左欄：寶可夢基本卡片與配置 (純淨無外框容器) -->
            <div class="appraisal-left-col">
              <div class="appraisal-profile-card">
                <div class="appraisal-avatar-wrapper">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" width="88" height="88" decoding="async" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                
                <!-- 樹果與專長 + 睡飽飽獎章 (與 H5 版本同排並行) -->
                <div class="appraisal-specialty-row" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;flex-wrap:wrap;">
                  <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                    ${berry.icon ? `<img src="${berry.icon}" width="22" height="22" decoding="async" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                  </span>
                  ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 22, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                  ${ribbonLevel > 0 ? `
                    <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:11.5px;font-weight:700;">
                      <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" width="16" height="16" decoding="async" style="width:16px;height:16px;object-fit:contain;" alt="Ribbon" />
                      <span>+${evaluation.ribbonBonus.carry} ${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${window.I18N?.t?.('lab.t_ribbon_spd', { pct: Math.round(evaluation.ribbonBonus.speedDiscount * 100) }) ?? 'lab.t_ribbon_spd'}` : ''}</span>
                    </div>
                  ` : ''}
                </div>

                <!-- 主技能名稱與等級 (Appraisal Main Skill) -->
                <div class="appraisal-mainskill-row">
                  <span class="appraisal-mainskill-label">${window.I18N?.t?.('lab.t_main_skill_colon') ?? 'lab.t_main_skill_colon'}</span>
                  <span class="appraisal-mainskill-name">${escapeHtml(mainSkillName)}</span>
                  <span class="appraisal-mainskill-level">Lv.${skillLvl}</span>
                </div>

                <!-- 食材三階插槽組合 (Appraisal Ingredients, 尚未開放插槽半透明) -->
                <div class="appraisal-ing-parallel-row">
                  <span class="appraisal-ing-row-label">${window.I18N?.t?.('lab.t_ingredients_colon') ?? 'lab.t_ingredients_colon'}</span>
                  <div class="appraisal-ing-chips-grid">
                    ${ingChipsHtml}
                  </div>
                </div>

                <!-- 遊戲同款性格展示 (膠囊外框 + 性格標籤 + 右側上下條目，純淨無外框容器) -->
                <div class="appraisal-config-section" style="margin-top:12px;display:flex;justify-content:center;">
                  <div class="appraisal-nature-game-card">
                    <div class="nature-pill-capsule">
                      <span class="nature-capsule-tag">${window.I18N?.t?.('lab.t_nature') ?? 'lab.t_nature'}</span>
                      <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                    </div>
                    ${natureEffectHtml}
                  </div>
                </div>

                <!-- 副技能清單 (2+2+1 遊戲同款外框顏色與排列，無多餘標題) -->
                <div class="appraisal-config-section" style="margin-top:10px;">
                  <div class="appraisal-subskills-grid">
                    ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                      const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                      const sName = rawName ? (window.I18N?.getSubSkillName?.(rawName) ?? rawName) : '--';
                      const tier = getSkillTier(rawName);
                      const isUnlocked = currentLv >= lv;
                      const lockClass = !isUnlocked ? 'subskill-locked' : '';
                      const titleText = rawName
                        ? (window.I18N?.t?.(isUnlocked ? 'lab.t_subskill_title_unlocked' : 'lab.t_subskill_title_locked', { name: sName, lv }) ?? 'lab.t_subskill_title_unlocked')
                        : (window.I18N?.t?.('lab.t_subskill_slot', { lv }) ?? 'lab.t_subskill_slot');
                      return `
                        <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                          <span class="subskill-name">${escapeHtml(sName)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- 基礎數值雙欄縱向列 (移動至副技能網格下方，緊湊整潔無溢出) -->
                <div class="appraisal-config-section appraisal-stats-section" style="margin-top:12px;width:100%;">
                  <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_frequency') ?? 'lab.t_frequency'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-interval">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-carry">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_ing_rate') ?? 'lab.t_ing_rate'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_skill_rate') ?? 'lab.t_skill_rate'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 中欄：食材與技能產能算法精算拆解 (純展示無調整組件，空間最大化單一整合外框) -->
            <div class="appraisal-calc-col">
              <div class="pokedex-calc-formula-card" id="appraisal-calc-formula-container">
                ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function')
                  ? window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)
                  : ''}
              </div>
            </div>

          <!-- 右欄：雷達圖 + 智能簡評 + 專長深度點評 (純淨無外框容器) -->
          <div class="appraisal-right-col">
            <div class="appraisal-desktop-content-grid">
              <!-- 頂部：雷達圖區塊 (自適應置中，無冗餘標題) -->
              <div class="appraisal-radar-block">
                <div class="appraisal-radar-wrapper">
                  ${radarSVG}
                </div>
              </div>

              <!-- 中部：PR 智能簡評欄 (嵌入式膠囊標籤，不佔用內容展示空間) -->
              <div class="appraisal-summary-bar">
                <span class="appraisal-summary-label">${window.I18N?.t?.('lab.t_summary_label') ?? 'lab.t_summary_label'}</span>
                <span class="appraisal-summary-text">${summaryNote}</span>
              </div>

              <!-- 下方：專長深度點評與優缺點 (在智能簡評下方，同樣長度) -->
              <div class="appraisal-analysis-card">
                <h4 class="appraisal-section-heading">${window.I18N?.t?.('lab.t_synergy_heading') ?? 'lab.t_synergy_heading'}</h4>
                <div class="appraisal-pros-list">
                  ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
                </div>
                ${evaluation.cons.length > 0 ? `
                  <div class="appraisal-cons-list">
                    ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
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

  const DEFAULT_SUBSKILLS_DATA = [
    { name: '樹果數量S', tier: 'gold' },
    { name: '幫手獎勵', tier: 'gold' },
    { name: '睡眠EXP獎勵', tier: 'gold' },
    { name: '活力回復獎勵', tier: 'gold' },
    { name: '夢之碎片獎勵', tier: 'gold' },
    { name: '研究EXP獎勵', tier: 'gold' },
    { name: '技能等級提升M', tier: 'gold' },
    { name: '幫忙速度M', tier: 'blue' },
    { name: '食材機率提升M', tier: 'blue' },
    { name: '技能機率提升M', tier: 'blue' },
    { name: '技能等級提升S', tier: 'blue' },
    { name: '持有上限提升L', tier: 'blue' },
    { name: '持有上限提升M', tier: 'blue' },
    { name: '幫忙速度S', tier: 'white' },
    { name: '食材機率提升S', tier: 'white' },
    { name: '技能機率提升S', tier: 'white' },
    { name: '持有上限提升S', tier: 'white' },
    { name: '活力回復提升S', tier: 'white' }
  ];

  function getSkillTier(sName) {
    if (!sName) return 'white';
    if (GOLD_SUBSKILLS.has(sName)) return 'gold';
    if (BLUE_SUBSKILLS.has(sName)) return 'blue';
    const subskillPool = (typeof window !== 'undefined' && ((window.UserBox && window.UserBox.SUBSKILLS_DATA) || (window.PokemonBoxApp && window.PokemonBoxApp.SUBSKILLS_DATA))) || DEFAULT_SUBSKILLS_DATA;
    const found = subskillPool.find(function (s) { return s.name === sName; });
    if (found && found.tier) return found.tier;
    return 'white';
  }

  /* ─── 診斷報告書彈窗管理 ───────────────────────────────── */
  function openAppraisalModal(pkmOrBoxItem) {
    if (!pkmOrBoxItem) return;
    if (window.AppraisalLab) {
      window.AppraisalLab._currentBoxItem = (pkmOrBoxItem && pkmOrBoxItem.rawItem) ? pkmOrBoxItem.rawItem : (pkmOrBoxItem && pkmOrBoxItem.uid ? pkmOrBoxItem : null);
    }

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

    let skillLevel = getEffectiveSkillLevel(pkmOrBoxItem, pkmData);
    const nickname = (pkmOrBoxItem.nickname || '').trim();
    const isMint = !!(pkmOrBoxItem.cleanseMint || pkmOrBoxItem.mint || (pkmOrBoxItem.rawItem && (pkmOrBoxItem.rawItem.cleanseMint || pkmOrBoxItem.rawItem.mint)) || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const targetPkmData = Object.assign({}, pkmData, { cleanseMint: isMint });

    const evaluation = evaluatePokemon(targetPkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, isMint);
    if (!evaluation) return;

    let modal = document.getElementById('modal-appraisal-report');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-appraisal-report';
      modal.className = 'appraisal-modal-backdrop';
      document.body.appendChild(modal);
    }

    const radarSVG = renderRadarChartSVG(evaluation.scores, 360, 270);
    const SIX_DIM_META = getSixDimMeta();
    const displayName = window.I18N?.getPokemonName?.(pkmData) ?? (pkmData.name_cn || pkmData.name_en || '');
    const natDisplayName = window.I18N?.getNatureName?.(natureName) ?? natureName;

    // 遊戲同款性格展示排版 (In-Game Style Nature Display)
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    let natureEffectHtml = '';
    if (isMint) {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral nature-effect-mint">
            ${window.I18N?.t?.('lab.t_nature_mint_neutral') ?? 'lab.t_nature_mint_neutral'}
          </div>
        </div>
      `;
    } else if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
      const buffLabel = (window.I18N?.field?.(natureObj, 'buff') ?? (natureObj.buff || '')).replace(/[▲▼]/g, '').trim();
      const debuffLabel = (window.I18N?.field?.(natureObj, 'debuff') ?? (natureObj.debuff || '')).replace(/[▲▼]/g, '').trim();
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
            ${window.I18N?.t?.('lab.t_nature_neutral') ?? 'lab.t_nature_neutral'}
          </div>
        </div>
      `;
    }

    const berry = (typeof window.getPokemonBerry === 'function') 
      ? window.getPokemonBerry(pkmData) 
      : (pkmData.berry || { name: '', icon: '' });
    const berryName = window.I18N?.getBerryName?.(berry.name) ?? (berry.name || '--');

    // 專長型態 (不展示「專長」二字，僅展示 食材型 / 技能型 / 樹果型，無外框)
    let specTypeLabel = window.I18N?.t?.('lab.t_spec_ing') ?? 'lab.t_spec_ing';
    let specClass = 'spec-ingredient';
    if (pkmData.specialty && (pkmData.specialty.includes('樹果') || pkmData.specialty === 'Berries')) {
      specClass = 'spec-berry';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_berry') ?? 'lab.t_spec_berry';
    } else if (pkmData.specialty && (pkmData.specialty.includes('技能') || pkmData.specialty === 'Skills')) {
      specClass = 'spec-skill';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_skill') ?? 'lab.t_spec_skill';
    } else if (pkmData.specialty && (pkmData.specialty.includes('全能') || pkmData.specialty.includes('全部') || pkmData.specialty === 'All-Rounder' || pkmData.specialty.toLowerCase() === 'all')) {
      specClass = 'spec-all';
      specTypeLabel = window.I18N?.t?.('lab.t_spec_all') ?? 'lab.t_spec_all';
    }

    let summaryNote = pkmOrBoxItem.summaryNote || '';
    if (!summaryNote || summaryNote.includes('質變躍升') || summaryNote.includes('建議優先升至') || summaryNote.includes('未達')) {
      summaryNote = generateIntelligentSummary(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, evaluation);
    }

    // 主技能資訊 (Main Skill & Level)
    const rawMainSkill = (pkmData && pkmData.main_skill) || (pkmData && pkmData.skill && pkmData.skill.name) || pkmOrBoxItem.main_skill || '';
    const mainSkillName = rawMainSkill ? (window.I18N?.getMainSkillName?.(rawMainSkill) ?? rawMainSkill) : (window.I18N?.t?.('lab.t_main_skill') ?? 'lab.t_main_skill');
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
      const lockTitleSuffix = !isUnlocked ? (window.I18N?.t?.('lab.t_ing_locked') ?? 'lab.t_ing_locked') : '';

      if (!ingName || ingName === '--') {
        return `
          <div class="appraisal-ing-chip is-empty${lockClass}">
            <span class="appraisal-ing-chip-empty">--</span>
          </div>
        `;
      }
      const displayName = window.I18N?.getIngredientName?.(ingName) ?? ingName;
      const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function')
        ? window.I18N.getIngredientIcon(ingName)
        : '';
      const count = getIngCountFromBase(pkmData, idx, ingName);
      return `
        <div class="appraisal-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
          ${iconUrl ? `<img src="${iconUrl}" class="appraisal-ing-chip-icon" width="20" height="20" loading="lazy" decoding="async" alt="${escapeHtml(displayName)}">` : ''}
        </div>
      `;
    }).join('');

    const formulaData = (window.PokemonApp && typeof window.PokemonApp.calculatePokedexIngredientFormulas === 'function')
      ? window.PokemonApp.calculatePokedexIngredientFormulas({
          pkm: pkmData,
          level: currentLv,
          nature: natureName,
          subskills: subskills,
          ingredients: ingSlotNames,
          ribbon: ribbonLevel,
          skillLevel: skillLevel,
          cleanseMint: isMint
        })
      : null;

    const isMobileH5 = typeof document !== 'undefined' && (
      (document.body && document.body.classList && document.body.classList.contains('mobile-h5-app')) ||
      (typeof document.querySelector === 'function' && !!document.querySelector('.mobile-h5-app')) ||
      (typeof window !== 'undefined' && (window.IS_MOBILE_H5 || (window.location && window.location.pathname && window.location.pathname.includes('/app/'))))
    );

    const modalRenderCtx = {
      pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName,
      natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote,
      mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG,
      subskills, ribbonLevel
    };
    if (isMobileH5) {
      modal.className = 'box-modal-backdrop modal-overlay appraisal-modal-backdrop mobile-modal-backdrop';
      modal.innerHTML = renderAppraisalMobileSheetHtml(modalRenderCtx);
    } else {
      modal.className = 'appraisal-modal-backdrop';
      modal.innerHTML = renderAppraisalDesktopModalHtml(modalRenderCtx);
    }

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    if (modal.style && typeof modal.style.removeProperty === 'function') {
      modal.style.removeProperty('display');
    }
    modal.style.display = 'flex';
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
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

  function openCurrentEditModal() {
    const item = window.AppraisalLab ? window.AppraisalLab._currentBoxItem : null;
    const modal = document.getElementById('modal-appraisal-report');
    if (modal) {
      if (modal._onKeydown && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', modal._onKeydown);
      }
      modal._onKeydown = null;
      if (modal.classList) modal.classList.remove('overlay-closing');
      if (modal.style) {
        if (typeof modal.style.setProperty === 'function') modal.style.setProperty('display', 'none', 'important');
        else modal.style.display = 'none';
      }
    }
    if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    document.body.style.overflow = '';
    if (!item) return;
    if (window.UserBox && typeof window.UserBox.openBoxEditModal === 'function') {
      const fresh = (typeof window.UserBox.getUserBox === 'function' && window.UserBox.getUserBox().find(p => p.uid === item.uid)) || item;
      if (window.AppraisalLab) window.AppraisalLab._reopenUid = item.uid;
      window.UserBox.openBoxEditModal(fresh);
    }
  }

  function reopenAfterEdit() {
    const lab = window.AppraisalLab;
    if (!lab || !lab._reopenUid) return;
    const uid = lab._reopenUid;
    lab._reopenUid = null;
    const box = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const item = box.find(p => p.uid === uid);
    if (!item) return;
    const pokemons = window.allPokemons || [];
    const base = findBasePkm(item.pokemonId || item.name) || pokemons.find(p => p.name_cn === item.name);
    openAppraisalModal({
      pkm: base,
      level: item.level || 30,
      nature: item.nature || '坦率',
      subskills: item.subskills || [],
      ingredients: [item.ing1, item.ing2, item.ing3],
      ribbon: item.ribbon || 0,
      nickname: item.nickname || '',
      skillLevel: item.skillLevel || 1,
      rawItem: item
    });
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
      if (modal && modal.style) {
        if (typeof modal.style.setProperty === 'function') modal.style.setProperty('display', 'none', 'important');
        else modal.style.display = 'none';
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      document.body.style.overflow = '';
    };
    if (typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, done);
    } else {
      done();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getIslandFavoredBerries(islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    if (island.id === 'greengrass' && Array.isArray(labState.greengrassBerries) && labState.greengrassBerries.length === 3) {
      return labState.greengrassBerries;
    }
    return island.berries || [];
  }

  function getIslandFavoredTypes(islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    if (island.id === 'greengrass' && Array.isArray(labState.greengrassBerries) && labState.greengrassBerries.length === 3) {
      return labState.greengrassBerries.map(bName => {
        const found = _findLabBerryData(bName);
        if (!found || !found.type) return '';
        return found.type === '超能' ? '超能力' : found.type;
      }).filter(Boolean);
    }
    return (island.types || []).map(t => (t === '超能' ? '超能力' : t));
  }

  try {
    if (typeof localStorage !== 'undefined') {
      const sIsland = localStorage.getItem('pksleep_lab_team_island');
      if (sIsland && LAB_ISLANDS.some(i => i.id === sIsland)) labState.teamIslandId = sIsland;
      const sSlots = JSON.parse(localStorage.getItem('pksleep_lab_team_slots') || 'null');
      if (Array.isArray(sSlots) && sSlots.length === 5) labState.teamSlots = sSlots;
      const sStrategy = localStorage.getItem('pksleep_lab_team_strategy');
      if (['balanced', 'berries', 'ingredients', 'skills', 'recipe'].includes(sStrategy)) labState.teamStrategy = sStrategy;
      const sCooking = localStorage.getItem('pksleep_lab_cooking_type');
      if (['curry', 'salad', 'dessert'].includes(sCooking)) labState.cookingType = sCooking;
      const sTargetRecipe = localStorage.getItem('pksleep_lab_target_recipe');
      if (sTargetRecipe) labState.targetRecipeName = sTargetRecipe;
      const sGgBerries = JSON.parse(localStorage.getItem('pksleep_lab_greengrass_berries') || 'null');
      if (Array.isArray(sGgBerries) && sGgBerries.length === 3) {
        const defaultGg = ['桃桃果', '橙橙果', '櫻子果', '椰木果', '木子果', '異奇果'];
        const canonicalized = sGgBerries.map(b => (_findLabBerryData(b) || {}).name || null);
        const usedSet = new Set(canonicalized.filter(Boolean));
        labState.greengrassBerries = canonicalized.map((name, idx) => {
          if (name) return name;
          const fb = defaultGg.find(cand => !usedSet.has(cand)) || defaultGg[idx % defaultGg.length];
          usedSet.add(fb);
          return fb;
        });
      }
      const sCompareSlots = JSON.parse(localStorage.getItem('pksleep_lab_compare_slots') || 'null');
      if (Array.isArray(sCompareSlots) && sCompareSlots.length > 0) {
        labState.compareSlots = [sCompareSlots[0] || null, sCompareSlots[1] || null, sCompareSlots[2] || null];
      } else {
        const sCompare = JSON.parse(localStorage.getItem('pksleep_lab_compare_uids') || 'null');
        if (sCompare) {
          labState.compareSlots = [sCompare.a || null, sCompare.b || null, sCompare.c || null];
        }
      }
      const sBench = localStorage.getItem('pksleep_lab_compare_benchmark');
      if (['box', '30', '50', '60', '100'].includes(String(sBench))) {
        labState.compareBenchmarkLevel = (sBench === 'box' ? 'box' : parseInt(sBench, 10));
      }
    }
  } catch (e) {}

  let _basePkmListRef = null;
  let _basePkmListLen = 0;
  let _basePkmIndex = null;

  function findBasePkm(idOrName) {
    const list = (typeof window !== 'undefined' && (window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons))) || [];
    if (!idOrName) return list[0] || null;
    if (_basePkmListRef !== list || _basePkmListLen !== list.length || !_basePkmIndex) {
      _basePkmListRef = list;
      _basePkmListLen = list.length;
      _basePkmIndex = Object.create(null);
      for (let i = 0; i < list.length; i++) {
        const p = list[i];
        if (!p) continue;
        if (p.id !== undefined && _basePkmIndex[p.id] === undefined) _basePkmIndex[p.id] = p;
        if (p.name_cn && _basePkmIndex[p.name_cn] === undefined) _basePkmIndex[p.name_cn] = p;
        if (p.name_en && _basePkmIndex[p.name_en] === undefined) _basePkmIndex[p.name_en] = p;
      }
    }
    return _basePkmIndex[idOrName] || list.find(p => p.id === idOrName || p.name_cn === idOrName || p.name_en === idOrName) || list[0] || null;
  }

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
    labState.cleanseMint = !!(item.cleanseMint || item.mint);
    labState.skillLevel = item.skillLevel || item.mainSkillLevel || 1;
    labState.isCustomized = false;
    labState.editMode = false;
    labState.editBackup = null;
    labState.activeSubskillSlot = 1;
  }

  function onBoxItemSelect(uid) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!uid) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.cleanseMint = false;
      labState.isCustomized = false;
      labState.editMode = false;
      labState.editBackup = null;
      labState.activeSubskillSlot = 1;
      updateLabUI();
      return;
    }
    const item = userBox.find(function (p) { return p.uid === uid; });
    if (item) {
      loadBoxItem(item);
      labState.editMode = false;
      labState.editBackup = null;
      labState.activeSubskillSlot = 1;
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
    labState.currentSubTab = 'single';
    labState.editBackup = {
      selectedPkmId: labState.selectedPkmId,
      nickname: labState.nickname,
      level: labState.level,
      nature: labState.nature,
      ribbon: labState.ribbon,
      skillLevel: labState.skillLevel,
      ingredients: (labState.ingredients || []).slice(),
      subskills: (labState.subskills || []).slice()
    };
    labState.editMode = true;
    labState.activeSubskillSlot = 1;
    updateLabUI();
  }

  function cancelEditMode() {
    if (labState.editBackup) {
      if (labState.editBackup.selectedPkmId) {
        labState.selectedPkmId = labState.editBackup.selectedPkmId;
      }
      labState.nickname = labState.editBackup.nickname;
      labState.level = labState.editBackup.level;
      labState.nature = labState.editBackup.nature;
      labState.ribbon = labState.editBackup.ribbon;
      labState.skillLevel = labState.editBackup.skillLevel;
      labState.ingredients = (labState.editBackup.ingredients || []).slice();
      labState.subskills = (labState.editBackup.subskills || []).slice();
      labState.editBackup = null;
    } else {
      resetToBoxOriginal();
    }
    labState.editMode = false;
    labState.activeSubskillSlot = 1;
    updateLabUI();
  }

  function saveEditMode() {
    const levelInp = document.getElementById('lab-level-num-input');
    if (levelInp) {
      const lv = parseInt(levelInp.value, 10);
      if (lv >= 1 && lv <= 100) labState.level = lv;
    }
    const nickInp = document.getElementById('lab-nickname-input');
    if (nickInp) {
      labState.nickname = nickInp.value.trim();
    }
    const natureSel = document.getElementById('lab-nature-select');
    if (natureSel && natureSel.value) {
      labState.nature = natureSel.value;
    }
    const ribbonSel = document.getElementById('lab-ribbon-select');
    if (ribbonSel && ribbonSel.value != null) {
      labState.ribbon = parseInt(ribbonSel.value, 10) || 0;
    }
    const skillSel = document.getElementById('lab-mainskill-select');
    if (skillSel && skillSel.value) {
      labState.skillLevel = parseInt(skillSel.value, 10) || 1;
    }

    if (!labState.selectedBoxUid) {
      labState.editMode = false;
      labState.editBackup = null;
      updateLabUI();
      return;
    }
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') 
      ? window.UserBox.getUserBox() 
      : [];
    const item = userBox.find(function (p) { return p.uid === labState.selectedBoxUid; });
    if (item) {
      if (labState.selectedPkmId) {
        item.pokemonId = labState.selectedPkmId;
        const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
        const pObj = pokemons.find(p => p.id === labState.selectedPkmId);
        if (pObj) {
          item.name = pObj.name_cn;
        }
      }
      item.level = labState.level;
      item.nature = labState.nature;
      item.subskills = labState.subskills.slice();
      item.ribbon = labState.ribbon;
      item.nickname = (labState.nickname || '').trim();
      if (labState.ingredients[0]) item.ing1 = labState.ingredients[0];
      if (labState.ingredients[1]) item.ing2 = labState.ingredients[1];
      if (labState.ingredients[2]) item.ing3 = labState.ingredients[2];
      if (labState.skillLevel != null) {
        item.skillLevel = labState.skillLevel;
        item.mainSkillLevel = labState.skillLevel;
      }

      if (window.UserBox && typeof window.UserBox.setUserBox === 'function') {
        window.UserBox.setUserBox(userBox);
      }
      labState.editMode = false;
      labState.editBackup = null;
      labState.isCustomized = false;
      updateLabUI();
      if (typeof window.showToast === 'function') {
        window.showToast(window.I18N?.t?.('lab.c_pkm_updated') ?? 'lab.c_pkm_updated');
      }
    }
  }

  function selectSubskillSlot(slotNum) {
    labState.activeSubskillSlot = Math.max(1, Math.min(5, parseInt(slotNum, 10) || 1));
    updateLabUI();
  }

  function onSubskillChipSelect(skName) {
    if (!skName) return;
    const currentSlotIdx = Math.max(0, Math.min(4, (labState.activeSubskillSlot || 1) - 1));
    const usedIdx = labState.subskills.indexOf(skName);
    if (usedIdx !== -1 && usedIdx !== currentSlotIdx) {
      return;
    }
    labState.subskills[currentSlotIdx] = skName;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    let nextEmptySlot = -1;
    for (let s = 1; s <= 5; s++) {
      if (!labState.subskills[s - 1]) {
        nextEmptySlot = s;
        break;
      }
    }
    if (nextEmptySlot !== -1) {
      labState.activeSubskillSlot = nextEmptySlot;
    } else if (labState.activeSubskillSlot < 5) {
      labState.activeSubskillSlot += 1;
    } else {
      labState.activeSubskillSlot = 1;
    }
    updateLabUI();
  }

  function onNicknameChange(val) {
    labState.nickname = val || '';
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    const nickEl = document.getElementById('lab-pkm-identity-nick');
    if (nickEl) {
      const trimmed = (val || '').trim();
      if (trimmed) {
        nickEl.textContent = `(${trimmed})`;
        nickEl.style.display = '';
      } else {
        nickEl.textContent = '';
        nickEl.style.display = 'none';
      }
    }
  }

  function onIngredientChange(slotIdx, val) {
    labState.ingredients[slotIdx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onSkillLevelChange(val) {
    labState.skillLevel = parseInt(val, 10) || 1;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function clearAllSubskills() {
    labState.subskills = ['', '', '', '', ''];
    labState.activeSubskillSlot = 1;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function initLabPokemonCombobox(pokemons, currentPkm) {
    const searchInput = document.getElementById('lab-poke-search');
    const dropdown = document.getElementById('lab-pkm-dropdown');
    const toggleBtn = document.getElementById('lab-pkm-dropdown-toggle');
    if (!searchInput || !dropdown) return;

    function renderDropdown(filterText = '') {
      const q = (filterText || '').trim().toLowerCase();
      let matched = [];
      if (!q) {
        matched = pokemons.slice();
      } else {
        matched = pokemons.filter(p => {
          if (typeof window.matchesPokemonSearch === 'function') {
            return window.matchesPokemonSearch(p, q);
          }
          const cn = (p.name_cn || '').toLowerCase();
          const en = (p.name_en || '').toLowerCase();
          const no = String(p.formatted_no || p.id || '');
          return cn.includes(q) || en.includes(q) || no.includes(q);
        });
      }

      if (matched.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${window.I18N?.t?.('lab.c_no_matching_pkm') ?? 'No matching Pokémon'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = matched.map(p => {
        const pkmDisplayName = window.I18N?.getPokemonName?.(p) ?? (window.I18N?.field?.(p, 'name') || p.name_cn || p.name_en || '');
        const isSelected = p.id === currentPkm.id;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';
        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" width="28" height="28" style="width:28px;height:28px;object-fit:contain;" alt="${escapeHtml(pkmDisplayName)}" loading="lazy" decoding="async">
            <div class="box-pkm-dropdown-info" style="display:flex;flex-direction:column;">
              <span style="font-size:12px;font-weight:700;color:var(--text-primary);">No.${p.formatted_no || p.id} ${pkmDisplayName}</span>
            </div>
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.box-pkm-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const pId = item.getAttribute('data-id');
          dropdown.style.display = 'none';
          onPkmChange(pId);
        });
      });

      dropdown.style.display = 'block';
    }

    searchInput.addEventListener('input', () => {
      renderDropdown(searchInput.value);
    });

    searchInput.addEventListener('focus', () => {
      renderDropdown(searchInput.value);
    });

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (dropdown.style.display === 'block') {
          dropdown.style.display = 'none';
        } else {
          renderDropdown('');
        }
      });
    }
  }

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
      const nat = isMint ? null : _getLabNature(item.nature);

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
    } else if (strategy === 'skills') {
      if (healers.length > 0) {
        pickBest(healers, 'healer');
      }
      while (selected.length < 5) {
        const picked = pickBest(userBox, 'skill');
        if (!picked) break;
      }
    } else if (strategy === 'ingredients' || strategy === 'recipe') {
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
        const nat = isMint ? null : _getLabNature(p.nature);
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

      const yieldCache = new Map();
      function getCachedIngDailyYield(p, ingName) {
        const cacheKey = (p.uid || p.pokemonId || p.name || '') + ':' + (p.level || '') + ':' + ingName;
        if (yieldCache.has(cacheKey)) return yieldCache.get(cacheKey);
        const val = estimatePkmIngDailyYield(p, ingName);
        yieldCache.set(cacheKey, val);
        return val;
      }

      const healerUidSet = new Set(healers.map(h => h.uid));
      const teamSpeciesMap = {};

      while (selected.length < 5) {
        const hasRemainingDeficit = reqIngredients.some(ing => (remainingDeficits[ing.name] || 0) > 0);
        let bestCandidate = null;
        let bestScore = -1;

        if (hasRemainingDeficit) {
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
            const nat = isMint ? null : _getLabNature(p.nature);
            let natMultiplier = 1.0;
            if (nat && nat.buff && nat.buff.includes('食材')) natMultiplier *= 1.20;
            if (nat && nat.debuff && nat.debuff.includes('食材')) natMultiplier *= 0.80;
            if (nat && nat.buff && nat.buff.includes('幫忙速度')) natMultiplier *= 1.10;

            // 統計該寶可夢在當前「仍有缺口」之目標食材中的實質日產能與缺口覆蓋比例
            let effectiveMatchCount = 0;
            let deficitCoveredScore = 0;
            let deficitRatioBonus = 0;
            let totalYieldAmount = 0;

            reqIngredients.forEach(ing => {
              const def = remainingDeficits[ing.name] || 0;
              const y = getCachedIngDailyYield(p, ing.name);
              if (y > 0) {
                if (def > 0 && y >= 8) {
                  effectiveMatchCount++;
                }
                const covered = Math.min(y, def);
                const surplus = Math.max(0, y - def);
                deficitCoveredScore += covered * 4.5;
                if (def > 0) {
                  deficitRatioBonus += (covered / def) * 60;
                }
                totalYieldAmount += surplus * 0.25;
              }
            });

            // 雙食材或多食材重疊契合度加權：必須高等級 (Lv>=30) 且對不同缺口均有實質規模產出
            let synergyMultiplier = 1.0;
            if (pLv >= 30 && effectiveMatchCount >= 3) synergyMultiplier = 2.5;
            else if (pLv >= 30 && effectiveMatchCount === 2) synergyMultiplier = 1.85;
            else if (effectiveMatchCount === 1) synergyMultiplier = 1.0;
            else synergyMultiplier = 0.35;

            const rawYieldScore = deficitCoveredScore + deficitRatioBonus + totalYieldAmount;
            if (deficitCoveredScore > 0) {
              const finalScore = rawYieldScore * synergyMultiplier * levelWeight * specMultiplier * subMultiplier * natMultiplier * favMultiplier * duplicatePenalty;
              if (finalScore > bestScore) {
                bestScore = finalScore;
                bestCandidate = p;
              }
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
            const y = getCachedIngDailyYield(bestCandidate, ing.name);
            remainingDeficits[ing.name] = Math.max(0, (remainingDeficits[ing.name] || 0) - y);
          });
        } else {
          // 所有缺口已 100% 覆蓋（或倉庫無對應食材怪）時：食材隊優先補入最佳奶媽維持全隊活力，其次補最強食材／綜合怪
          const hasTeamHealer = selected.some(uid => healerUidSet.has(uid));
          const fallback = (strategy === 'ingredients' && !hasTeamHealer && healers.length > 0 ? pickBest(healers, 'healer') : null)
            || pickBest(userBox, 'ingredient')
            || pickBest(userBox, 'general');
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
      const islandName = window.I18N?.getIslandName?.(island.name) ?? (window.I18N?.field?.(island, 'name') || island.name);
      if (strategy === 'recipe' || strategy === 'ingredients') {
        const targetRecipe = findTargetRecipe(labState.targetRecipeName);
        const rName = window.I18N?.getRecipeName?.(targetRecipe) ?? (targetRecipe.name_cn || targetRecipe.name || '');
        window.showToast(window.I18N?.t?.('lab.t_toast_opt_recipe', { islandName, recipeName: rName }) ?? 'lab.t_toast_opt_recipe');
      } else {
        const stratKeyMap = {
          balanced: 'lab.t_strat_balanced',
          berries: 'lab.t_strat_berries',
          ingredients: 'lab.t_strat_ingredients',
          skills: 'lab.t_strat_skills'
        };
        const cookKeyMap = {
          curry: 'lab.t_cook_curry',
          salad: 'lab.t_cook_salad',
          dessert: 'lab.t_cook_dessert'
        };
        const sName = stratKeyMap[strategy] ? (window.I18N?.t?.(stratKeyMap[strategy]) ?? stratKeyMap[strategy]) : strategy;
        const cName = cookKeyMap[cookingType] ? (window.I18N?.t?.(cookKeyMap[cookingType]) ?? cookKeyMap[cookingType]) : cookingType;
        window.showToast(window.I18N?.t?.('lab.t_toast_opt_strat', { islandName, stratName: sName, cookName: cName }) ?? 'lab.t_toast_opt_strat');
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
    if (labState.teamStrategy === 'ingredients' || labState.teamStrategy === 'recipe') {
      autoOptimizeTeam(true);
    } else {
      updateLabUI();
    }
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
      const sep = window.I18N?.t?.('lab.t_list_sep') ?? ', ';
      const berryDisplay = rolled.map(b => window.I18N?.getBerryName?.(b) ?? b).join(sep);
      window.showToast(window.I18N?.t?.('lab.t_toast_reroll_gg', { berries: berryDisplay }) ?? 'lab.t_toast_reroll_gg');
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
      // 若目前目標料理不屬於新選取的料理種類，自動對齊該分類最高基礎能量料理
      const matchesCat = (r) => {
        const cat = ((r && r.category) || '').toLowerCase();
        if (cookingType === 'curry') return cat.includes('咖哩') || cat.includes('curry') || cat.includes('濃湯') || cat.includes('stew');
        if (cookingType === 'salad') return cat.includes('沙拉') || cat.includes('salad');
        if (cookingType === 'dessert') return cat.includes('甜') || cat.includes('點心') || cat.includes('dessert') || cat.includes('飲料') || cat.includes('drink');
        return false;
      };
      const curRecipe = findTargetRecipe(labState.targetRecipeName);
      if (!curRecipe || !matchesCat(curRecipe)) {
        const candidates = getAllTargetRecipes().filter(matchesCat).sort((a, b) => {
          const ea = parseInt(String(a.base_energy || a.energy || 0).replace(/,/g, ''), 10) || 0;
          const eb = parseInt(String(b.base_energy || b.energy || 0).replace(/,/g, ''), 10) || 0;
          return (eb - ea) || ((b.pot_size || 0) - (a.pot_size || 0));
        });
        if (candidates.length > 0) {
          const nextName = candidates[0].name_cn || candidates[0].name;
          if (nextName) {
            labState.targetRecipeName = nextName;
            try {
              if (typeof localStorage !== 'undefined') {
                localStorage.setItem('pksleep_lab_target_recipe', nextName);
              }
            } catch (e) {}
          }
        }
      }
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

  function switchSubTab(tab) {
    if (!['team', 'compare', 'growth'].includes(tab)) tab = 'team';
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
    autoOptimizeTeam(false);
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
          window.showToast(window.I18N?.t?.('lab.t_toast_dup_compare') ?? 'lab.t_toast_dup_compare');
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

  const _FALLBACK_LAB_CANONICAL_INGREDIENTS = [
    '特選蘋果', '哞哞鮮奶', '萌綠大豆', '甜甜蜜', '豆製肉',
    '暖暖薑', '好眠番茄', '一口堅果', '特選蛋', '純粹油', '窩心洋芋',
    '火辣香草', '萌綠玉米', '放鬆可可', '醒腦咖啡豆', '嫩亮酪梨',
    '品鮮蘑菇', '粗枝大蔥', '沉甸甸南瓜', '美味尾巴'
  ];

  function _getLabCanonicalIngredients() {
    const gc = _getLabGameConfig();
    if (gc && Array.isArray(gc.CANONICAL_INGREDIENTS) && gc.CANONICAL_INGREDIENTS.length > 0) {
      return gc.CANONICAL_INGREDIENTS.map(item => item.name);
    }
    return _FALLBACK_LAB_CANONICAL_INGREDIENTS.slice();
  }

  function openLabPicker(opts) {
    activePickerState = opts || {};
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];

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
      const lockedCategory = ['curry', 'salad', 'dessert'].includes(labState.cookingType) ? labState.cookingType : null;
      let currentRecipeCategoryFilter = lockedCategory || 'all';
      let currentRecipeIngFilter = 'all';

      function matchesRecipeCategory(r, catKey) {
        if (!catKey || catKey === 'all') return true;
        const cat = (r.category || '').toLowerCase();
        if (catKey === 'curry') return cat.includes('咖哩') || cat.includes('curry') || cat.includes('濃湯') || cat.includes('stew');
        if (catKey === 'salad') return cat.includes('沙拉') || cat.includes('salad');
        if (catKey === 'dessert') return cat.includes('甜') || cat.includes('點心') || cat.includes('dessert') || cat.includes('飲料') || cat.includes('drink');
        return true;
      }

      function getRecipeBaseEnergy(r) {
        if (!r) return 0;
        const raw = r.base_energy !== undefined ? r.base_energy : (r.energy !== undefined ? r.energy : 0);
        const num = typeof raw === 'number' ? raw : parseInt(String(raw).replace(/,/g, ''), 10);
        return Number.isFinite(num) ? num : 0;
      }

      const scopedRecipesList = (lockedCategory
        ? allRecipesList.filter(r => matchesRecipeCategory(r, lockedCategory))
        : allRecipesList.slice()
      ).sort((a, b) => {
        const energyDiff = getRecipeBaseEnergy(b) - getRecipeBaseEnergy(a);
        if (energyDiff !== 0) return energyDiff;
        return (b.pot_size || 0) - (a.pot_size || 0);
      });

      function generateRecipeItemsHtml(query = '') {
        const q = (query || '').trim().toLowerCase();
        const filtered = scopedRecipesList.filter(r => {
          const nameCn = (r.name_cn || r.name || '').toLowerCase();
          const nameEn = (r.name_en || '').toLowerCase();
          const cat = (r.category || '').toLowerCase();

          if (!matchesRecipeCategory(r, currentRecipeCategoryFilter)) return false;

          if (currentRecipeIngFilter !== 'all') {
            if (!Array.isArray(r.ingredients) || !r.ingredients.some(ing => ing.name === currentRecipeIngFilter)) {
              return false;
            }
          }

          if (!q) return true;
          if (nameCn.includes(q) || nameEn.includes(q) || cat.includes(q)) return true;
          if (Array.isArray(r.ingredients)) {
            return r.ingredients.some(ing => (ing.name || '').toLowerCase().includes(q));
          }
          return false;
        });

        if (filtered.length === 0) {
          return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;">${window.I18N?.t?.('lab.t_picker_no_recipe') ?? 'lab.t_picker_no_recipe'}</div>`;
        }

        return filtered.map(r => {
          const rNameCn = r.name_cn || r.name || '';
          const rNameDisplay = window.I18N?.getRecipeName?.(r) ?? (r.name_en || rNameCn);
          const isSelected = (rNameCn === currentTargetName || r.name === currentTargetName);
          const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
          const cat = (r.category || '').toLowerCase();
          let catClass = 'lab-recipe-cat-curry';
          if (cat.includes('沙拉') || cat.includes('salad')) catClass = 'lab-recipe-cat-salad';
          else if (cat.includes('甜') || cat.includes('點心') || cat.includes('dessert') || cat.includes('飲料') || cat.includes('drink')) catClass = 'lab-recipe-cat-dessert';

          const ingsHtml = ings.map(ing => {
            const iDisp = window.I18N?.getIngredientName?.(ing.name) ?? ing.name;
            const iconUrl = ing.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ing.name) : '');
            return `
              <span class="lab-recipe-ing-chip" title="${escapeHtml(iDisp)} x${ing.count}">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-recipe-ing-icon" alt="${escapeHtml(iDisp)}" width="18" height="18" loading="lazy" decoding="async">` : ''}
                <span class="lab-recipe-ing-count">x${ing.count}</span>
              </span>
            `;
          }).join('');

          const baseEnergy = getRecipeBaseEnergy(r);
          const energyText = baseEnergy > 0 ? baseEnergy.toLocaleString() : '';

          return `
            <div class="lab-recipe-card ${catClass} ${isSelected ? 'selected' : ''}" onclick="window.AppraisalLab.onRecipePickerSelect('${escapeHtml(rNameCn)}')">
              <div class="lab-recipe-card-left">
                ${r.icon ? `<img src="${r.icon}" class="lab-recipe-card-icon" alt="" width="38" height="38" loading="lazy" decoding="async">` : ''}
                <div class="lab-recipe-card-info">
                  <div class="lab-recipe-card-title-row">
                    <span class="lab-recipe-card-title">${escapeHtml(rNameDisplay)}</span>
                    ${r.pot_size ? `<span class="lab-recipe-card-pot">${r.pot_size}${window.I18N?.t?.('lab.t_pots_unit') ?? 'lab.t_pots_unit'}</span>` : ''}
                    ${energyText ? `<span class="lab-recipe-card-pot">${energyText}</span>` : ''}
                    ${isSelected ? `<span class="lab-recipe-active-badge">${window.I18N?.t?.('lab.t_current_badge') ?? 'lab.t_current_badge'}</span>` : ''}
                  </div>
                  <div class="lab-recipe-card-ingredients">
                    ${ingsHtml}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      function renderRecipeItems(query = '') {
        const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-recipe-list') : null) || document.getElementById('lab-picker-recipe-list');
        if (listEl) {
          listEl.innerHTML = generateRecipeItemsHtml(query);
        }
      }

      const categoryLabelMap = {
        curry: window.I18N?.t?.('lab.t_cook_curry') ?? 'lab.t_cook_curry',
        salad: window.I18N?.t?.('lab.t_cook_salad') ?? 'lab.t_cook_salad',
        dessert: window.I18N?.t?.('lab.t_cook_dessert') ?? 'lab.t_cook_dessert'
      };
      const allText = window.I18N?.t?.('lab.t_all') ?? 'lab.t_all';
      const categoryFilterHtml = lockedCategory
        ? `<button type="button" class="box-btn box-btn-secondary active" data-filter="${lockedCategory}" style="padding:3px 10px;font-size:11px;cursor:default;">${categoryLabelMap[lockedCategory]} (${scopedRecipesList.length})</button>`
        : `
          <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${allText} (${allRecipesList.length})</button>
          <button type="button" class="box-btn box-btn-secondary" data-filter="curry" style="padding:3px 10px;font-size:11px;">${categoryLabelMap.curry}</button>
          <button type="button" class="box-btn box-btn-secondary" data-filter="salad" style="padding:3px 10px;font-size:11px;">${categoryLabelMap.salad}</button>
          <button type="button" class="box-btn box-btn-secondary" data-filter="dessert" style="padding:3px 10px;font-size:11px;">${categoryLabelMap.dessert}</button>
        `;

      const recipeIngChipsHtml = [
        `<button type="button" class="lab-picker-ing-chip-btn ${currentRecipeIngFilter === 'all' ? 'active' : ''}" data-recipe-ing="all" title="${window.I18N?.t?.('lab.t_all_ings') ?? 'lab.t_all_ings'}"><span>${allText}</span></button>`,
        ..._getLabCanonicalIngredients().map(iName => {
          const iDisp = window.I18N?.getIngredientName?.(iName) ?? iName;
          const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
          return `
            <button type="button" class="lab-picker-ing-chip-btn ${currentRecipeIngFilter === iName ? 'active' : ''}" data-recipe-ing="${escapeHtml(iName)}" title="${escapeHtml(iDisp)}">
              ${icon ? `<img src="${icon}" class="lab-picker-filter-ing-img" alt="${escapeHtml(iDisp)}" width="18" height="18" loading="lazy" decoding="async">` : `<span>${escapeHtml(iDisp)}</span>`}
            </button>
          `;
        })
      ].join('');

      modal.innerHTML = `
        <div class="lab-picker-container lab-recipe-picker-container">
          <div class="lab-picker-header">
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
              <span>${window.I18N?.t?.('lab.t_picker_recipe_title') ?? 'lab.t_picker_recipe_title'}</span>
              <span style="font-size:11px;color:var(--text-secondary);background:var(--bg-card-inner);border:1px solid var(--border-color);padding:1px 7px;border-radius:999px;">${scopedRecipesList.length} ${window.I18N?.t?.('lab.t_dishes_unit') ?? 'lab.t_dishes_unit'}</span>
            </div>
            <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="lab-picker-controls-section">
            <div class="lab-picker-search-bar">
              <input type="text" id="lab-picker-recipe-search" class="box-form-input" placeholder="${window.I18N?.t?.('lab.t_picker_recipe_search_ph') ?? 'lab.t_picker_recipe_search_ph'}" style="flex:1;min-width:160px;height:34px;font-size:12px;">
              <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
                ${categoryFilterHtml}
              </div>
            </div>

            <div class="lab-picker-secondary-filters" style="margin-top:4px;">
              <div class="lab-picker-ing-filter-group" style="width:100%;">
                <span class="lab-picker-filter-label">${window.I18N?.t?.('lab.t_ingr_colon') ?? 'lab.t_ingr_colon'}</span>
                <div class="lab-picker-ing-chips-scroll" id="lab-recipe-picker-ing-scroll">
                  ${recipeIngChipsHtml}
                </div>
              </div>
            </div>
          </div>

          <div class="lab-picker-list lab-recipe-picker-list" id="lab-picker-recipe-list">
            ${generateRecipeItemsHtml('')}
          </div>
        </div>
      `;

      const searchInput = modal.querySelector('#lab-picker-recipe-search');
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderRecipeItems(searchInput.value);
        });
      }

      modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentRecipeCategoryFilter = btn.getAttribute('data-filter') || 'all';
          renderRecipeItems(searchInput ? searchInput.value : '');
        });
      });

      const recipeIngScroll = modal.querySelector('#lab-recipe-picker-ing-scroll');
      if (recipeIngScroll) {
        recipeIngScroll.querySelectorAll('.lab-picker-ing-chip-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const targetIng = btn.getAttribute('data-recipe-ing') || 'all';
            if (currentRecipeIngFilter === targetIng && targetIng !== 'all') {
              currentRecipeIngFilter = 'all';
            } else {
              currentRecipeIngFilter = targetIng;
            }
            recipeIngScroll.querySelectorAll('.lab-picker-ing-chip-btn').forEach(b => {
              b.classList.toggle('active', (b.getAttribute('data-recipe-ing') === currentRecipeIngFilter));
            });
            renderRecipeItems(searchInput ? searchInput.value : '');
          });
        });
      }

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
      ? (window.I18N?.t?.('lab.t_picker_title_team', { slot: opts.slotIndex + 1 }) ?? 'lab.t_picker_title_team')
      : (opts.type === 'growth'
        ? (window.I18N?.t?.('lab.t_picker_title_growth') ?? 'lab.t_picker_title_growth')
        : (window.I18N?.t?.('lab.t_picker_title_compare', { letter: compareLetter }) ?? 'lab.t_picker_title_compare'));

    const berriesList = _getLabBerryValuesData();

    let currentFilter = 'all';
    let currentBerryFilter = 'all';
    let currentIngFilter = 'all';
    let currentQuery = '';

    function generatePickerItemsHtml() {
      const q = (currentQuery || '').trim().toLowerCase();
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
        const isFav = _isLabFavoredBerryOrType(bName, bType, favBerries, favTypes);

        const spec = (base && base.specialty) || '';
        if (currentFilter === 'fav' && !isFav) return false;
        if (currentFilter === 'berry' && !spec.includes('樹果') && spec !== 'Berries') return false;
        if (currentFilter === 'ingredient' && !spec.includes('食材') && spec !== 'Ingredients') return false;
        if (currentFilter === 'skill' && !spec.includes('技能') && spec !== 'Skills') return false;

        if (currentBerryFilter !== 'all') {
          const bCid = _resolveLabBerryCanonicalId(bName);
          const fCid = _resolveLabBerryCanonicalId(currentBerryFilter);
          if (bCid && fCid) {
            if (bCid !== fCid) return false;
          } else if (bName !== currentBerryFilter) {
            return false;
          }
        }

        if (currentIngFilter !== 'all') {
          const pLv = item.level || 1;
          const unlocked = [item.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '')];
          if (pLv >= 30) unlocked.push(item.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : ''));
          if (pLv >= 60) unlocked.push(item.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : ''));
          const validUnlocked = unlocked.filter(Boolean);
          if (!validUnlocked.includes(currentIngFilter)) return false;
        }

        return true;
      });

      if (filtered.length === 0) {
        return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${window.I18N?.t?.('lab.t_picker_no_pkm') ?? 'lab.t_picker_no_pkm'}</div>`;
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
      } else if (opts.type === 'growth') {
        currentSelectedUid = growthState.selectedUid || null;
      }

      return filtered.map(item => {
        const base = findBasePkm(item.pokemonId || item.name);
        const pDisplayName = window.I18N?.getPokemonName?.(base || item.name) ?? (item.name || (base ? (base.name_cn || base.name_en) : ''));
        const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const berryDisp = window.I18N?.getBerryName?.(berry.name || '') ?? (berry.name || '');
        const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
        const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';

        const isOccupied = occupiedInOtherSlot.has(item.uid);
        const isSel = (item.uid === currentSelectedUid);

        let clickAttr;
        if (isOccupied) {
          const toastMsg = window.I18N?.t?.('lab.t_toast_dup_compare') ?? 'lab.t_toast_dup_compare';
          clickAttr = `onclick="if(typeof window.showToast==='function')window.showToast('${escapeHtml(toastMsg)}');"`;
        } else {
          clickAttr = `onclick="window.AppraisalLab.onPickerSelect('${item.uid}')"`;
        }

        // 3 食材槽呈現 (純圖示、清晰展示解鎖狀態)
        const pLv = item.level || 1;
        const pIng1 = item.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '');
        const pIng2 = item.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : '');
        const pIng3 = item.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : '');
        const pIngSlots = [
          { name: pIng1, req: 1, unlocked: true },
          { name: pIng2, req: 30, unlocked: pLv >= 30 },
          { name: pIng3, req: 60, unlocked: pLv >= 60 }
        ];

        const pIngsHtml = pIngSlots.map(s => {
          const iName = s.name || '';
          const iDisp = window.I18N?.getIngredientName?.(iName) ?? iName;
          const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
          return `
            <span class="lab-picker-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (window.I18N?.t?.('lab.t_locked_paren') ?? 'lab.t_locked_paren') : ''}">
              ${icon ? `<img src="${icon}" class="lab-picker-ing-icon" alt="${escapeHtml(iDisp)}" width="20" height="20" loading="lazy" decoding="async">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
            </span>
          `;
        }).join('');

        return `
          <div class="lab-picker-card ${isSel ? 'selected' : ''} ${isOccupied ? 'occupied disabled' : ''} ${isFav ? 'fav' : ''}" data-uid="${item.uid}" ${clickAttr} title="${isOccupied ? (window.I18N?.t?.('lab.t_already_compare_title') ?? 'lab.t_already_compare_title') : escapeHtml(pDisplayName)}">
            ${isOccupied ? `<span class="lab-picker-occupied-badge">${window.I18N?.t?.('lab.t_in_compare_badge') ?? 'lab.t_in_compare_badge'}</span>` : ''}
            <div class="lab-picker-main">
              <div class="lab-picker-avatar">
                <img src="${avatarUrl}" alt="${escapeHtml(pDisplayName)}" width="44" height="44" loading="lazy" decoding="async">
                <span class="lab-picker-lv">Lv.${item.level || 1}</span>
              </div>
              <div class="lab-picker-meta">
                <div class="lab-picker-sub">
                  ${berry.icon ? `<img src="${berry.icon}" class="lab-picker-berry" alt="Berry" title="${escapeHtml(berryDisp)}" width="15" height="15" loading="lazy" decoding="async">` : ''}
                  ${specHtml}
                </div>
                <div class="lab-picker-ings">
                  ${pIngsHtml}
                </div>
              </div>
            </div>
            <div class="lab-picker-nick">${escapeHtml(item.nickname || pDisplayName)}</div>
          </div>
        `;
      }).join('');
    }

    function renderPickerItems() {
      const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-items-list') : null) || document.getElementById('lab-picker-items-list');
      if (listEl) {
        listEl.innerHTML = generatePickerItemsHtml();
      }
    }

    const allLabel = window.I18N?.t?.('lab.t_all') ?? 'lab.t_all';
    const berryChipsHtml = [
      `<button type="button" class="lab-picker-berry-chip-btn ${currentBerryFilter === 'all' ? 'active' : ''}" data-berry="all" title="${window.I18N?.t?.('lab.t_all_berries') ?? 'lab.t_all_berries'}"><span>${allLabel}</span></button>`,
      ...berriesList.map(b => {
        const bDisp = window.I18N?.getBerryName?.(b.name) ?? b.name;
        const tDisp = window.I18N?.getTypeName?.(b.type) ?? b.type;
        const bIcon = b.icon || '';
        return `
          <button type="button" class="lab-picker-berry-chip-btn ${currentBerryFilter === b.name ? 'active' : ''}" data-berry="${escapeHtml(b.name)}" title="${escapeHtml(bDisp)} (${escapeHtml(tDisp)})">
            ${bIcon ? `<img src="${bIcon}" class="lab-picker-filter-berry-img" alt="${escapeHtml(bDisp)}" width="18" height="18" loading="lazy" decoding="async">` : `<span>${escapeHtml(bDisp)}</span>`}
          </button>
        `;
      })
    ].join('');

    const ingChipsHtml = [
      `<button type="button" class="lab-picker-ing-chip-btn ${currentIngFilter === 'all' ? 'active' : ''}" data-ing="all" title="${window.I18N?.t?.('lab.t_all_ings') ?? 'lab.t_all_ings'}"><span>${allLabel}</span></button>`,
      ..._getLabCanonicalIngredients().map(iName => {
        const iDisp = window.I18N?.getIngredientName?.(iName) ?? iName;
        const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
        return `
          <button type="button" class="lab-picker-ing-chip-btn ${currentIngFilter === iName ? 'active' : ''}" data-ing="${escapeHtml(iName)}" title="${escapeHtml(iDisp)}">
            ${icon ? `<img src="${icon}" class="lab-picker-filter-ing-img" alt="${escapeHtml(iDisp)}" width="18" height="18" loading="lazy" decoding="async">` : `<span>${escapeHtml(iDisp)}</span>`}
          </button>
        `;
      })
    ].join('');

    modal.innerHTML = `
      <div class="lab-picker-container">
        <div class="lab-picker-header">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);">${title}</div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="lab-picker-controls-section">
          <div class="lab-picker-search-bar">
            <input type="text" id="lab-picker-search-input" class="box-form-input" placeholder="${window.I18N?.t?.('lab.t_picker_pkm_search_ph') ?? 'lab.t_picker_pkm_search_ph'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
            <div class="lab-picker-filter-chips" style="display:flex;gap:5px;flex-wrap:wrap;">
              <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 8px;font-size:11px;">${allLabel} (${userBox.length})</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="fav" style="padding:3px 8px;font-size:11px;">${window.I18N?.t?.('lab.t_filter_fav') ?? 'lab.t_filter_fav'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="berry" style="padding:3px 8px;font-size:11px;">${window.I18N?.t?.('lab.t_filter_berries') ?? 'lab.t_filter_berries'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="ingredient" style="padding:3px 8px;font-size:11px;">${window.I18N?.t?.('lab.t_filter_ings') ?? 'lab.t_filter_ings'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="skill" style="padding:3px 8px;font-size:11px;">${window.I18N?.t?.('lab.t_filter_skills') ?? 'lab.t_filter_skills'}</button>
            </div>
          </div>

          <div class="lab-picker-secondary-filters">
            <div class="lab-picker-berry-filter-group" style="width:100%;">
              <span class="lab-picker-filter-label">${window.I18N?.t?.('lab.t_berry_colon') ?? 'lab.t_berry_colon'}</span>
              <div class="lab-picker-berry-chips-scroll" id="lab-picker-berry-scroll">
                ${berryChipsHtml}
              </div>
            </div>
            <div class="lab-picker-ing-filter-group" style="width:100%;">
              <span class="lab-picker-filter-label">${window.I18N?.t?.('lab.t_ingr_colon') ?? 'lab.t_ingr_colon'}</span>
              <div class="lab-picker-ing-chips-scroll" id="lab-picker-ing-scroll">
                ${ingChipsHtml}
              </div>
            </div>
          </div>
        </div>

        <div class="lab-picker-list" id="lab-picker-items-list">${generatePickerItemsHtml()}</div>
      </div>
    `;

    const searchInput = modal.querySelector('#lab-picker-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentQuery = searchInput.value;
        renderPickerItems();
      });
    }

    modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderPickerItems();
      });
    });

    const berryScroll = modal.querySelector('#lab-picker-berry-scroll');
    if (berryScroll) {
      berryScroll.querySelectorAll('.lab-picker-berry-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetBerry = btn.getAttribute('data-berry') || 'all';
          if (currentBerryFilter === targetBerry && targetBerry !== 'all') {
            currentBerryFilter = 'all';
          } else {
            currentBerryFilter = targetBerry;
          }
          berryScroll.querySelectorAll('.lab-picker-berry-chip-btn').forEach(b => {
            b.classList.toggle('active', (b.getAttribute('data-berry') === currentBerryFilter));
          });
          renderPickerItems();
        });
      });
    }

    const ingScroll = modal.querySelector('#lab-picker-ing-scroll');
    if (ingScroll) {
      ingScroll.querySelectorAll('.lab-picker-ing-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetIng = btn.getAttribute('data-ing') || 'all';
          if (currentIngFilter === targetIng && targetIng !== 'all') {
            currentIngFilter = 'all';
          } else {
            currentIngFilter = targetIng;
          }
          ingScroll.querySelectorAll('.lab-picker-ing-chip-btn').forEach(b => {
            b.classList.toggle('active', (b.getAttribute('data-ing') === currentIngFilter));
          });
          renderPickerItems();
        });
      });
    }

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
    } else if (activePickerState.type === 'growth') {
      setGrowthTarget(uid);
    }
    closeLabPicker();
  }

  function onRecipePickerSelect(recipeName) {
    setTargetRecipe(recipeName);
    closeLabPicker();
  }


  function setPotSize(size) {
    const val = parseInt(size, 10);
    if (!isNaN(val)) {
      labState.potSize = Math.max(15, Math.min(100, val));
      if (typeof updateLabUI === 'function') updateLabUI();
    }
  }

  function stepPotSize(delta) {
    const cur = labState.potSize || 57;
    const next = Math.max(15, Math.min(100, cur + delta));
    labState.potSize = next;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  function toggleSundayPotExpansion() {
    labState.sundayPotExpansion = !labState.sundayPotExpansion;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  function toggleGoodCampTicket() {
    labState.goodCampTicket = !labState.goodCampTicket;
    if (typeof updateLabUI === 'function') updateLabUI();
  }

  if (typeof window !== 'undefined') {
    window.setPotSize = setPotSize;
    window.stepPotSize = stepPotSize;
    window.toggleSundayPotExpansion = toggleSundayPotExpansion;
    window.toggleGoodCampTicket = toggleGoodCampTicket;

    let _appraisalLabRef = window.AppraisalLab || {};
    try {
      Object.defineProperty(window, 'AppraisalLab', {
        configurable: true,
        enumerable: true,
        get: function () {
          return _appraisalLabRef;
        },
        set: function (newVal) {
          _appraisalLabRef = newVal;
          if (_appraisalLabRef && typeof _appraisalLabRef === 'object') {
            _appraisalLabRef.setPotSize = setPotSize;
            _appraisalLabRef.stepPotSize = stepPotSize;
            _appraisalLabRef.toggleSundayPotExpansion = toggleSundayPotExpansion;
            _appraisalLabRef.toggleGoodCampTicket = toggleGoodCampTicket;
            if (typeof calculateProjectedSnorlaxRank === 'function') {
              _appraisalLabRef.calculateProjectedSnorlaxRank = calculateProjectedSnorlaxRank;
            }
            if (typeof ISLAND_SNORLAX_THRESHOLDS !== 'undefined') {
              _appraisalLabRef.ISLAND_SNORLAX_THRESHOLDS = ISLAND_SNORLAX_THRESHOLDS;
            }
          }
        }
      });
    } catch (e) {}

    if (_appraisalLabRef && typeof _appraisalLabRef === 'object') {
      _appraisalLabRef.setPotSize = setPotSize;
      _appraisalLabRef.stepPotSize = stepPotSize;
      _appraisalLabRef.toggleSundayPotExpansion = toggleSundayPotExpansion;
      _appraisalLabRef.toggleGoodCampTicket = toggleGoodCampTicket;
      if (typeof calculateProjectedSnorlaxRank === 'function') {
        _appraisalLabRef.calculateProjectedSnorlaxRank = calculateProjectedSnorlaxRank;
      }
      if (typeof ISLAND_SNORLAX_THRESHOLDS !== 'undefined') {
        _appraisalLabRef.ISLAND_SNORLAX_THRESHOLDS = ISLAND_SNORLAX_THRESHOLDS;
      }
    }
  }

  function renderGreengrassBerrySelect(idx, currentBerryName) {
    const berriesList = _getLabBerryValuesData();
    const currentCid = _resolveLabBerryCanonicalId(currentBerryName);
    const optionsHtml = berriesList.map(b => {
      const bDisp = window.I18N?.getBerryName?.(b.name) ?? b.name;
      const tDisp = window.I18N?.getTypeName?.(b.type) ?? b.type;
      const isSel = (currentCid && b.id === currentCid) || b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = _findLabBerryData(currentBerryName) || berriesList[0];

    return `
      <div class="lab-greengrass-berry-item">
        ${bObj && bObj.icon ? `<img src="${bObj.icon}" class="lab-berry-mini-icon" width="18" height="18" loading="lazy" decoding="async" alt="Berry">` : ''}
        <select class="lab-select lab-berry-select" onchange="window.AppraisalLab.setGreengrassBerry(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /* ─── 幫手組隊 HTML 產生器 (Team Builder View Renderer) ──────────────── */
  function renderTeamBuilderView(userBox, pokemons) {
    const island = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);
    const isGreengrass = labState.teamIslandId === 'greengrass';

    while (labState.teamSlots.length < 5) labState.teamSlots.push(null);
    if (labState.teamSlots.length > 5) labState.teamSlots = labState.teamSlots.slice(0, 5);

    const teamItems = labState.teamSlots.map(uid => uid ? userBox.find(p => p.uid === uid) : null);
    const simulation = simulateTeamPerformance(teamItems, labState.teamIslandId);

    const basePath = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) || '';
    const islandPillsHtml = LAB_ISLANDS.map(isl => {
      const isActive = labState.teamIslandId === isl.id;
      const islImgUrl = isl.image ? (basePath + isl.image) : '';
      const islName = window.I18N?.getIslandName?.(isl.name) ?? (window.I18N?.field?.(isl, 'name') || isl.name);
      return `
        <button type="button" class="lab-island-circle-btn ${isActive ? 'active' : ''}" style="${islImgUrl ? `background-image:url('${islImgUrl}');` : `background-color:${isl.color};`}${isActive ? `border-color:${isl.color};box-shadow:0 0 10px ${isl.color}99;` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')" title="${escapeHtml(islName)}">
          <span class="sr-only">${escapeHtml(islName)}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = _findLabBerryData(bName) || {};
      const canonicalName = bObj.name || bName;
      const bDisplayName = window.I18N?.getBerryName?.(canonicalName) ?? canonicalName;
      return `
        <span class="lab-favored-berry-icon-wrap" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" class="lab-favored-berry-img" width="22" height="22" loading="lazy" decoding="async" alt="${escapeHtml(bDisplayName)}">` : ''}
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:1px;">
            <span style="font-size:11.5px;font-weight:700;color:#22c55e;">${window.I18N?.t?.('lab.t_gg_berries_title') ?? 'lab.t_gg_berries_title'}</span>
            <span style="font-size:10.5px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_gg_berries_sub') ?? 'lab.t_gg_berries_sub'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:5px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${window.I18N?.t?.('lab.t_reroll_title') ?? 'lab.t_reroll_title'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${window.I18N?.t?.('lab.t_reroll_btn') ?? 'lab.t_reroll_btn'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${window.I18N?.t?.('lab.t_roll_build_title') ?? 'lab.t_roll_build_title'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${window.I18N?.t?.('lab.t_roll_build_btn') ?? 'lab.t_roll_build_btn'}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx])).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = window.I18N?.getRecipeName?.(targetRecipe) ?? (targetRecipe.name_cn || targetRecipe.name || '');
    const rawCat = targetRecipe.category || '咖哩';
    const catLower = rawCat.toLowerCase();
    const catKey = (catLower.includes('沙拉') || catLower.includes('salad'))
      ? 'lab.t_cook_salad'
      : ((catLower.includes('甜') || catLower.includes('點心') || catLower.includes('dessert') || catLower.includes('飲料') || catLower.includes('drink'))
          ? 'lab.t_cook_dessert'
          : 'lab.t_cook_curry');
    const targetRecipeCategory = window.I18N?.t?.(catKey) ?? catKey;
    const isTargetRecipeStrategy = labState.teamStrategy === 'recipe';

    // ─── 料理鍋容量與加成 (Pot Size Controls & Modifiers) ─────────
    labState.potSize = labState.potSize || 57;
    labState.sundayPotExpansion = Boolean(labState.sundayPotExpansion);
    labState.goodCampTicket = Boolean(labState.goodCampTicket);

    const basePotSize = labState.potSize;
    let potMultiplier = 1.0;
    if (labState.goodCampTicket) potMultiplier *= 1.5;
    if (labState.sundayPotExpansion) potMultiplier *= 2.0;
    const effectivePotSize = Math.floor(basePotSize * potMultiplier);

    const targetPotReq = (targetRecipe && targetRecipe.pot_size) || 0;
    const isPotFeasible = targetPotReq > 0 ? (effectivePotSize >= targetPotReq) : true;
    const potFeasibilityBadge = targetPotReq > 0
      ? (isPotFeasible
          ? `<span class="lab-pot-feasibility feasible">[OK] ${window.I18N?.t?.('lab.t_pot_ok') ?? 'lab.t_pot_ok'} (${targetPotReq}/${effectivePotSize})</span>`
          : `<span class="lab-pot-feasibility deficit">[!] ${window.I18N?.t?.('lab.t_pot_short') ?? 'lab.t_pot_short'} (${targetPotReq}/${effectivePotSize})</span>`)
      : '';

    const potControlHtml = `
      <div class="lab-team-config-group lab-pot-config-group">
        <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_pot_size_label') ?? 'lab.t_pot_size_label'}</span>
        <div class="lab-pot-stepper-wrap">
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(-3)" title="${window.I18N?.t?.('lab.t_pot_dec_title') ?? 'lab.t_pot_dec_title'}">-</button>
          <span class="lab-pot-size-display" title="${window.I18N?.t?.('lab.t_pot_base_title', { size: basePotSize }) ?? 'lab.t_pot_base_title'}">${basePotSize}</span>
          <button type="button" class="lab-pot-step-btn" onclick="window.AppraisalLab.stepPotSize(3)" title="${window.I18N?.t?.('lab.t_pot_inc_title') ?? 'lab.t_pot_inc_title'}">+</button>
        </div>
        <div class="lab-pot-modifiers">
          <button type="button" class="lab-pot-toggle-btn ${labState.sundayPotExpansion ? 'active' : ''}" onclick="window.AppraisalLab.toggleSundayPotExpansion()" title="${window.I18N?.t?.('lab.t_pot_sunday_title') ?? 'lab.t_pot_sunday_title'}">
            ${window.I18N?.t?.('lab.t_pot_sunday_btn') ?? 'lab.t_pot_sunday_btn'}
          </button>
          <button type="button" class="lab-pot-toggle-btn ${labState.goodCampTicket ? 'active' : ''}" onclick="window.AppraisalLab.toggleGoodCampTicket()" title="${window.I18N?.t?.('lab.t_pot_camp_title') ?? 'lab.t_pot_camp_title'}">
            ${window.I18N?.t?.('lab.t_pot_camp_btn') ?? 'lab.t_pot_camp_btn'}
          </button>
        </div>
        <div class="lab-effective-pot-wrap">
          <span class="lab-effective-pot-label">${window.I18N?.t?.('lab.t_pot_effective_label') ?? 'lab.t_pot_effective_label'} <strong class="lab-effective-pot-num">${effectivePotSize}</strong></span>
          ${potFeasibilityBadge}
        </div>
      </div>
    `;

    const teamVariablesBarHtml = `
      <div class="lab-team-config-col lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_team_focus_label') ?? 'lab.t_team_focus_label'}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${window.I18N?.t?.('lab.t_strat_balanced') ?? 'lab.t_strat_balanced'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${window.I18N?.t?.('lab.t_pill_berries') ?? 'lab.t_pill_berries'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${window.I18N?.t?.('lab.t_pill_ingredients') ?? 'lab.t_pill_ingredients'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${window.I18N?.t?.('lab.t_pill_skills') ?? 'lab.t_pill_skills'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${window.I18N?.t?.('lab.t_pill_recipe') ?? 'lab.t_pill_recipe'}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_target_dish_label') ?? 'lab.t_target_dish_label'}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${escapeHtml(targetRecipeDisplayName)} (${window.I18N?.t?.('lab.t_click_to_change') ?? 'lab.t_click_to_change'})">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" width="26" height="26" loading="lazy" decoding="async" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${window.I18N?.t?.('lab.t_change') ?? 'lab.t_change'}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${window.I18N?.t?.('lab.t_cooking_goal_label') ?? 'lab.t_cooking_goal_label'}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${window.I18N?.t?.('lab.t_cook_curry') ?? 'lab.t_cook_curry'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${window.I18N?.t?.('lab.t_cook_salad') ?? 'lab.t_cook_salad'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${window.I18N?.t?.('lab.t_cook_dessert') ?? 'lab.t_cook_dessert'}</button>
            </div>
          </div>
        `}

        ${potControlHtml}
      </div>
    `;

    // ─── 全隊生效光環彙總列 (Team Shared Bonuses Summary Bar - Zero Glyphs/Icons) ─────────────
    const activeAuraChips = [];
    if (simulation.helpingBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-helping" title="${window.I18N?.t?.('lab.t_aura_helping_title', { pct: simulation.helpingBonusCount * 5 }) ?? 'lab.t_aura_helping_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_helping') ?? 'lab.t_aura_helping'}</strong> x${simulation.helpingBonusCount} (+${simulation.helpingBonusCount * 5}%)
        </span>
      `);
    }
    if (simulation.energyRecoveryBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-energy" title="${window.I18N?.t?.('lab.t_aura_energy_title', { pct: simulation.energyRecoveryBonusCount * 14 }) ?? 'lab.t_aura_energy_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_energy') ?? 'lab.t_aura_energy'}</strong> x${simulation.energyRecoveryBonusCount} (+${simulation.energyRecoveryBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.sleepExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-sleepexp" title="${window.I18N?.t?.('lab.t_aura_sleepexp_title', { pct: simulation.sleepExpBonusCount * 14 }) ?? 'lab.t_aura_sleepexp_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_sleepexp') ?? 'lab.t_aura_sleepexp'}</strong> x${simulation.sleepExpBonusCount} (+${simulation.sleepExpBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.researchExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-researchexp" title="${window.I18N?.t?.('lab.t_aura_researchexp_title', { pct: simulation.researchExpBonusCount * 6 }) ?? 'lab.t_aura_researchexp_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_researchexp') ?? 'lab.t_aura_researchexp'}</strong> x${simulation.researchExpBonusCount} (+${simulation.researchExpBonusCount * 6}%)
        </span>
      `);
    }
    if (simulation.dreamShardBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-dreamshard" title="${window.I18N?.t?.('lab.t_aura_dreamshard_title', { pct: simulation.dreamShardBonusCount * 6 }) ?? 'lab.t_aura_dreamshard_title'}">
          <strong>${window.I18N?.t?.('lab.t_aura_dreamshard') ?? 'lab.t_aura_dreamshard'}</strong> x${simulation.dreamShardBonusCount} (+${simulation.dreamShardBonusCount * 6}%)
        </span>
      `);
    }

    const teamAurasBarHtml = `
      <div class="lab-team-auras-col lab-team-auras-bar">
        <div class="lab-team-auras-label">
          <span>${window.I18N?.t?.('lab.t_auras_bar_label') ?? 'lab.t_auras_bar_label'}</span>
        </div>
        <div class="lab-team-auras-chips">
          ${activeAuraChips.length > 0 ? activeAuraChips.join('') : `<span class="lab-team-aura-chip empty">${window.I18N?.t?.('lab.t_auras_empty') ?? 'lab.t_auras_empty'}</span>`}
        </div>
      </div>
    `;

    // ─── 隊伍 5 個隊員卡片 (Pokémon Sleep App Style Compact 100% Width Rows) ─
    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${window.I18N?.t?.('lab.t_slot_empty_title') ?? 'lab.t_slot_empty_title'}">
            <div class="lab-slot-empty-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="lab-slot-empty-text">${window.I18N?.t?.('lab.t_slot_empty_text') ?? 'lab.t_slot_empty_text'}</span>
            </div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = window.I18N?.getPokemonName?.(base || item.name) ?? (item.name || (base ? (base.name_cn || base.name_en) : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const berryDisp = window.I18N?.getBerryName?.(berry.name || '') ?? (berry.name || '');
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N?.getMainSkillName?.(rawSkill) ?? rawSkill) : (window.I18N?.t?.('lab.t_skill_short') ?? 'lab.t_skill_short');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N?.getNatureName?.(item.nature) ?? item.nature;
      const simSlot = simulation.slotResults[idx];
      const itemLv = item.level || 1;

      // 3 食材槽呈現 (無等級標籤、無外框、靠右展示)
      const ing1 = item.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '');
      const ing2 = item.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : '');
      const ing3 = item.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : '');
      const ingSlots = [
        { name: ing1, req: 1, unlocked: true },
        { name: ing2, req: 30, unlocked: itemLv >= 30 },
        { name: ing3, req: 60, unlocked: itemLv >= 60 }
      ];

      const ingStripHtml = `
        <div class="lab-slot-ing-strip">
          ${ingSlots.map(s => {
            const iName = s.name || '--';
            const iDisp = window.I18N?.getIngredientName?.(iName) ?? iName;
            const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
            return `
              <div class="lab-slot-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (window.I18N?.t?.('lab.t_locked_paren') ?? 'lab.t_locked_paren') : ''}">
                ${icon ? `<img src="${icon}" class="lab-slot-ing-icon" width="20" height="20" loading="lazy" decoding="async" alt="${escapeHtml(iDisp)}">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
              </div>
            `;
          }).join('')}
        </div>
      `;

      // 僅展示影響全隊之副技能 (全體加成光環: 幫手獎勵/活力回復獎勵/睡眠EXP獎勵/研究EXP獎勵/夢之碎片獎勵)
      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const lvReqs = [10, 25, 50, 70, 80];
      const activeAuras = [];
      const lockedAuras = [];

      subs.forEach((sName, sIdx) => {
        if (!sName) return;
        const req = lvReqs[sIdx] || 10;
        const isUnlocked = itemLv >= req;
        const isTeamSub = (
          sName === '幫手獎勵' || sName === 'Helping Bonus' ||
          sName === '睡眠EXP獎勵' || sName === 'Sleep EXP Bonus' ||
          sName === '活力回復獎勵' || sName === '能量回復獎勵' || sName === 'Energy Recovery Bonus' ||
          sName === '研究EXP獎勵' || sName === 'Research EXP Bonus' ||
          sName === '夢之碎片獎勵' || sName === 'Dream Shard Bonus'
        );

        if (isTeamSub) {
          const auraObj = { name: sName, req, sIdx };
          if (isUnlocked) {
            activeAuras.push(auraObj);
          } else {
            lockedAuras.push(auraObj);
          }
        }
      });

      let aurasHtml = '';
      if (activeAuras.length > 0) {
        aurasHtml = activeAuras.map(a => {
          const sDisp = window.I18N?.getSubSkillName?.(a.name) ?? a.name;
          return `
            <div class="lab-slot-aura-badge aura-active" title="Lv.${a.req} ${escapeHtml(sDisp)} · ${window.I18N?.t?.('lab.t_aura_team_shared') ?? 'lab.t_aura_team_shared'}">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
            </div>
          `;
        }).join('');
      } else if (lockedAuras.length > 0) {
        aurasHtml = lockedAuras.map(a => {
          const sDisp = window.I18N?.getSubSkillName?.(a.name) ?? a.name;
          return `
            <div class="lab-slot-aura-badge aura-locked" title="Lv.${a.req} ${escapeHtml(sDisp)} (${window.I18N?.t?.('lab.t_aura_locked_until', { lv: a.req }) ?? 'lab.t_aura_locked_until'})">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
              <span class="aura-tag">Lv.${a.req}</span>
            </div>
          `;
        }).join('');
      } else {
        aurasHtml = `
          <div class="lab-slot-aura-badge aura-none" title="${window.I18N?.t?.('lab.t_solo_spec_title') ?? 'lab.t_solo_spec_title'}">
            <span class="aura-name">${window.I18N?.t?.('lab.t_solo_spec') ?? 'lab.t_solo_spec'}</span>
          </div>
        `;
      }

      return `
        <div class="lab-team-slot-card">
          <div class="lab-slot-main-row">
            <div class="lab-slot-identity-group">
              <div class="lab-slot-avatar-wrap">
                <img src="${avatarUrl}" class="lab-slot-avatar-img" width="36" height="36" alt="${escapeHtml(displayName)}" loading="lazy" decoding="async">
                <span class="lab-slot-lv-badge">Lv.${item.level || 1}</span>
              </div>
              <div class="lab-slot-name-col">
                <div class="lab-slot-name-row">
                  <span class="lab-slot-name">${escapeHtml(displayName)}</span>
                  ${item.nickname ? `<span class="lab-slot-nickname">(${escapeHtml(item.nickname)})</span>` : ''}
                </div>
                <div class="lab-slot-spec-left">
                  ${specialtyIconHtml}
                  <div class="lab-slot-berry-wrap ${isFav ? 'favored' : ''}" title="${escapeHtml(berryDisp)}${isFav ? ' (2x)' : ''}">
                    ${berry.icon ? `<img src="${berry.icon}" class="lab-slot-berry-icon" width="15" height="15" loading="lazy" decoding="async" alt="Berry">` : ''}
                    ${isFav ? `<span class="lab-slot-fav-badge">2x</span>` : ''}
                  </div>
                  <span class="lab-slot-nature-name">${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ` (${window.I18N?.t?.('lab.t_mint_short') ?? 'lab.t_mint_short'})` : ''}</span>
                </div>
              </div>
            </div>
            <button type="button" class="box-btn box-btn-secondary lab-slot-replace-top-btn" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
              ${window.I18N?.t?.('lab.t_replace') ?? 'lab.t_replace'}
            </button>
          </div>

          <div class="lab-slot-spec-row">
            <div class="lab-slot-ings-right">
              ${ingStripHtml}
            </div>
          </div>

          <div class="lab-slot-bottom-row">
            <div class="lab-slot-bottom-left">
              <span class="lab-slot-skill-name">${escapeHtml(skillName)} <strong class="lab-slot-skill-lv">Lv.${skillLv}</strong></span>
              ${aurasHtml}
            </div>
            <div class="lab-slot-bottom-right">
              ${simSlot ? `<span class="lab-slot-berry-pts" title="${window.I18N?.t?.('lab.t_daily_berry_energy_title') ?? 'lab.t_daily_berry_energy_title'}">${simSlot.dailyBerryEnergy.toLocaleString()} <span style="font-size:9px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_energy_pts') ?? 'lab.t_energy_pts'}</span></span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const ingEntries = Object.entries(simulation.ingredientsMap);
    ingEntries.sort((a, b) => b[1] - a[1]);
    const keyIngs = COOKING_CATEGORY_KEY_INGREDIENTS[labState.cookingType] || [];
    const targetAnalysis = simulation.targetRecipeAnalysis;
    const topIngsHtml = ingEntries.slice(0, 8).map(([iName, count]) => {
      const iDisplayName = window.I18N?.getIngredientName?.(iName) ?? iName;
      const iconUrl = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
      
      const targetItem = targetAnalysis && Array.isArray(targetAnalysis.items)
        ? targetAnalysis.items.find(it => it.name === iName || (window.I18N && window.I18N.getIngredientName(it.name) === iName))
        : null;
      const isTargetIng = !!targetItem;
      const isSurplusDaily = targetItem ? (targetItem.diff >= 0 || targetItem.fulfillmentPct >= 100) : false;
      const isCategoryKey = keyIngs.includes(iName);
      const isCookMatch = isTargetIng || isSurplusDaily || isCategoryKey;

      const chipBorder = isSurplusDaily
        ? '1px solid #22c55e'
        : (isCookMatch ? '1px solid var(--accent-color, #38bdf8)' : 'none');
      const chipBg = isSurplusDaily
        ? 'rgba(34, 197, 94, 0.12)'
        : (isCookMatch ? 'rgba(56, 189, 248, 0.12)' : 'transparent');
      const chipPadding = (isSurplusDaily || isCookMatch) ? '1px 5px' : '0 2px';
      const numColor = isSurplusDaily
        ? '#4ade80'
        : (isCookMatch ? '#38bdf8' : '#e2e8f0');

      return `
        <div style="display:inline-flex;align-items:center;gap:3px;background:${chipBg};border:${chipBorder};border-radius:4px;padding:${chipPadding};font-size:10.5px;" title="${escapeHtml(iDisplayName)}${isSurplusDaily ? (window.I18N?.t?.('lab.t_ing_surplus_paren') ?? 'lab.t_ing_surplus_paren') : (isCookMatch ? (window.I18N?.t?.('lab.t_ing_synergy_paren') ?? 'lab.t_ing_synergy_paren') : '')}">
          ${iconUrl ? `<img src="${iconUrl}" width="16" height="16" loading="lazy" decoding="async" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${numColor};font-weight:700;">x${count}</span>
        </div>
      `;
    }).join('');

    // ─── 目標料理食材供需看板 (緊湊多欄 Grid 卡片矩陣) ────────────────────
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N?.getIngredientName?.(item.name) ?? item.name;
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus
          ? `+${item.diff} ${window.I18N?.t?.('lab.t_supply_surplus') ?? 'lab.t_supply_surplus'}`
          : `${item.diff} ${window.I18N?.t?.('lab.t_supply_deficit') ?? 'lab.t_supply_deficit'}`;
        const diffClass = isSurplus ? 'lab-supply-surplus' : 'lab-supply-deficit';
        const barPct = Math.min(100, Math.max(0, item.fulfillmentPct));
        const barColor = item.fulfillmentPct >= 100 ? '#22c55e' : (item.fulfillmentPct >= 60 ? 'var(--accent-color, #38bdf8)' : '#f59e0b');

        return `
          <div class="lab-supply-row">
            <div class="lab-supply-row-top">
              <div class="lab-supply-col-ing">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" width="18" height="18" loading="lazy" decoding="async" alt="${escapeHtml(iDisplayName)}">` : ''}
                <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
              </div>
              <div class="lab-supply-col-diff">
                <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
              </div>
            </div>
            <div class="lab-supply-row-mid">
              <span title="${window.I18N?.t?.('lab.t_supply_meal_title') ?? 'lab.t_supply_meal_title'}">${window.I18N?.t?.('lab.t_supply_meal_lbl') ?? 'lab.t_supply_meal_lbl'} <strong>x${item.perMeal}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${window.I18N?.t?.('lab.t_supply_daily_title') ?? 'lab.t_supply_daily_title'}">${window.I18N?.t?.('lab.t_supply_daily_lbl') ?? 'lab.t_supply_daily_lbl'} <strong>x${item.dailyDemand}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${window.I18N?.t?.('lab.t_supply_yield_title') ?? 'lab.t_supply_yield_title'}">${window.I18N?.t?.('lab.t_supply_yield_lbl') ?? 'lab.t_supply_yield_lbl'} <strong style="color:#22c55e;">x${item.teamYield}</strong></span>
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
        ? `<span class="lab-supply-overall-badge satisfied">[OK] ${window.I18N?.t?.('lab.t_supply_satisfied') ?? 'lab.t_supply_satisfied'}</span>`
        : `<span class="lab-supply-overall-badge pending">${window.I18N?.t?.('lab.t_supply_overall', { pct: targetAnalysis.overallFulfillmentPct }) ?? 'lab.t_supply_overall'}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" width="44" height="44" loading="lazy" decoding="async" alt="${escapeHtml(targetRecipeDisplayName)}" title="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  <span class="sr-only">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${window.I18N?.t?.('lab.t_supply_pots_meta') ?? 'lab.t_supply_pots_meta'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${window.I18N?.t?.('lab.t_supply_base_energy_meta') ?? 'lab.t_supply_base_energy_meta'}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                  ${window.I18N?.t?.('lab.t_supply_board_sub') ?? 'lab.t_supply_board_sub'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:10.5px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${window.I18N?.t?.('lab.t_change_recipe_btn') ?? 'lab.t_change_recipe_btn'}</span>
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

    const islandNameDisplay = window.I18N?.getIslandName?.(island.name) ?? (window.I18N?.field?.(island, 'name') || island.name);

    return `
      <div class="lab-team-view-container">
        <div class="lab-island-config-row">
          <div class="lab-island-selector-col">
            <div class="lab-island-circles-row">
              ${islandPillsHtml}
            </div>
          </div>
          ${teamVariablesBarHtml}
        </div>

        ${greengrassConfigHtml}

        <div class="lab-favored-auras-row">
          <div class="lab-favored-berries-col">
            <span class="lab-favored-label">${window.I18N?.t?.('lab.t_favored_berries_lbl') ?? 'lab.t_favored_berries_lbl'}</span>
            <div class="lab-favored-berries-list">
              ${favoredBerriesHtml}
            </div>
          </div>
          ${teamAurasBarHtml}
        </div>

        <div class="lab-team-grid">
          ${slotsHtml}
        </div>

        ${supplyDemandBoardHtml}

        <div class="lab-team-metrics-grid">
          <div class="lab-metric-card lab-metric-headline-card">
            <div class="lab-metric-headline-top" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
              <span class="lab-metric-title" style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${window.I18N?.t?.('lab.t_est_daily_total') ?? 'lab.t_est_daily_total'}</span>
              <span class="lab-projected-rank-badge" title="${window.I18N?.t?.('lab.t_projected_rank_title') ?? 'lab.t_projected_rank_title'}">
                ${window.I18N?.t?.('lab.t_projected_rank_lbl') ?? 'lab.t_projected_rank_lbl'}<strong>${simulation.projectedSundayRank}</strong>
              </span>
            </div>
            <div class="lab-metric-value">${simulation.totalDailyEnergy.toLocaleString()} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${window.I18N?.t?.('lab.t_pts_per_day') ?? 'lab.t_pts_per_day'}</span></div>
            <div class="lab-metric-breakdown-chips">
              <span class="breakdown-chip chip-berry">${window.I18N?.t?.('lab.t_chip_berry') ?? 'lab.t_chip_berry'}${simulation.totalDailyBerryEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-cooking">${window.I18N?.t?.('lab.t_chip_cooking') ?? 'lab.t_chip_cooking'}${simulation.dailyCookingEnergy.toLocaleString()}</span>
              <span class="breakdown-chip chip-skill">${window.I18N?.t?.('lab.t_chip_skill') ?? 'lab.t_chip_skill'}${simulation.dailySkillEnergy.toLocaleString()}</span>
            </div>
            <div class="lab-metric-sub">
              ${window.I18N?.t?.('lab.t_metric_sub', { islandName: islandNameDisplay }) ?? 'lab.t_metric_sub'}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${window.I18N?.t?.('lab.t_est_daily_ings') ?? 'lab.t_est_daily_ings'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${window.I18N?.t?.('lab.t_items_per_day') ?? 'lab.t_items_per_day'}</span></div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:10.5px;color:var(--text-muted);">${window.I18N?.t?.('lab.t_no_ings_yet') ?? 'lab.t_no_ings_yet'}</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const _FALLBACK_LAB_COMPARE_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  function _getCompareCaps() {
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    return (gc && typeof gc.getCaps === 'function') ? gc.getCaps() : _FALLBACK_LAB_COMPARE_CAPS;
  }

  /* ─── 寶可夢對比數據精算器 (Performance Metrics Calculator for Compare) ─ */
  function calculatePokemonComparisonPerformance(item, base, overrideLevel) {
    if (!item) return null;
    const boxLevel = parseInt(item.level, 10) || 30;
    const level = (overrideLevel && overrideLevel !== 'box') ? parseInt(overrideLevel, 10) : boxLevel;
    const nature = item.nature || '坦率';
    const subskills = Array.isArray(item.subskills) ? item.subskills : [];
    const ribbon = parseInt(item.ribbon, 10) || 0;
    const ribbonBonus = getRibbonBonus(base, ribbon);
    const skillLevel = parseInt(item.skillLevel || item.skill_level || 1, 10) || 1;

    // 依基準等級判定解鎖的副技能 (解鎖門檻: Lv.10, 25, 50, 70, 80)
    const unlockTiers = (typeof _getCompareCaps === 'function' && _getCompareCaps().SUBSKILL_UNLOCK_LEVELS) ? _getCompareCaps().SUBSKILL_UNLOCK_LEVELS : [10, 25, 50, 70, 80];
    const activeSubskills = subskills.filter((s, idx) => s && level >= (unlockTiers[idx] || 10));
    const hasSub = name => activeSubskills.includes(name);

    // 1. Helping speed & intervals
    const baseFreq = (base && (base.base_frequency || base.frequency)) ? (base.base_frequency || base.frequency) : 3600;
    let freq = baseFreq * (1 - (level - 1) * 0.002);

    let subSpeedDiscount = 0;
    if (hasSub('幫忙速度M')) subSpeedDiscount += 0.14;
    if (hasSub('幫忙速度S')) subSpeedDiscount += 0.07;
    if (hasSub('幫手獎勵')) subSpeedDiscount += 0.05;
    freq = freq * (1 - Math.min(0.35, subSpeedDiscount));

    if (ribbonBonus && ribbonBonus.speedDiscount > 0) {
      freq = freq * (1 - ribbonBonus.speedDiscount);
    }

    const isMint = !!(item.cleanseMint || item.mint);
    const nat = isMint ? null : NATURE_DATA.find(n => n.name === nature || n.name_en === nature);
    if (nat) {
      if (nat.buff && nat.buff.includes('幫忙速度')) freq *= 0.90;
      if (nat.debuff && nat.debuff.includes('幫忙速度')) freq *= 1.075;
    }

    const energySpeedMultiplier = 2.22; // ~80% daytime active energy level
    const effectiveInterval = Math.max(300, Math.round(freq / energySpeedMultiplier));
    const dailyHelps = Math.max(1, Math.round(86400 / effectiveInterval));

    // 2. Ingredients & yield rate
    let baseIngRate = 0.20;
    if (base && base.ingredient_rate) {
      baseIngRate = parseFloat(base.ingredient_rate) / 100;
    } else if (base && base.specialty && (base.specialty.includes('食材') || base.specialty === 'Ingredients')) {
      baseIngRate = 0.28;
    }

    let ingRateMultiplier = 1.0;
    if (hasSub('食材機率提升M')) ingRateMultiplier *= 1.36;
    if (hasSub('食材機率提升S')) ingRateMultiplier *= 1.18;
    if (nat && nat.buff && nat.buff.includes('食材')) ingRateMultiplier *= 1.20;
    if (nat && nat.debuff && nat.debuff.includes('食材')) ingRateMultiplier *= 0.80;

    const effectiveIngRate = Math.min(0.65, Math.max(0.05, baseIngRate * ingRateMultiplier));
    const dailyIngHelps = dailyHelps * effectiveIngRate;

    const rawIngSlots = [
      item.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : ''),
      item.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : ''),
      item.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : '')
    ];

    const slotMetas = [
      { slotIdx: 0, unlockLv: 1, isUnlocked: true, name: rawIngSlots[0] },
      { slotIdx: 1, unlockLv: 30, isUnlocked: level >= 30, name: rawIngSlots[1] },
      { slotIdx: 2, unlockLv: 60, isUnlocked: level >= 60, name: rawIngSlots[2] }
    ];

    const unlockedSlots = slotMetas.filter(s => s.isUnlocked && s.name && s.name !== '--');
    const numUnlocked = Math.max(1, unlockedSlots.length);
    const helpsPerUnlockedSlot = dailyIngHelps / numUnlocked;

    let totalDailyIngredientsCount = 0;
    let totalDailyIngredientEnergy = 0;
    const itemizedIngredients = [];

    slotMetas.forEach(s => {
      const dropCount = getIngCountFromBase(base, s.slotIdx, s.name);
      const isUnlocked = s.isUnlocked;
      let dailyCount = 0;
      let dailyEnergy = 0;
      const baseEnergy = (s.name && INGREDIENTS_ENERGY_MAP[s.name]) ? INGREDIENTS_ENERGY_MAP[s.name] : 110;

      if (isUnlocked && s.name && s.name !== '--') {
        dailyCount = helpsPerUnlockedSlot * dropCount;
        dailyEnergy = Math.round(dailyCount * baseEnergy);
        totalDailyIngredientsCount += dailyCount;
        totalDailyIngredientEnergy += dailyEnergy;
      }

      itemizedIngredients.push({
        slotIdx: s.slotIdx,
        unlockLv: s.unlockLv,
        isUnlocked: isUnlocked,
        name: s.name || '',
        dropCount: dropCount,
        dailyCount: Math.round(dailyCount * 10) / 10,
        dailyEnergy: dailyEnergy,
        baseEnergy: baseEnergy
      });
    });

    // 3. Berries
    const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : ((base && base.berry) || {});
    let berryCount = (base && base.specialty && (base.specialty.includes('樹果') || base.specialty === 'Berries')) ? 2 : 1;
    if (hasSub('樹果數量S')) berryCount += 1;

    const bValueObj = _findLabBerryData(berry.name || '');
    const baseBerryEnergy = bValueObj ? bValueObj.energy : 28;
    const singleBerryPower = Math.max(1, baseBerryEnergy + level - 1);
    const dailyBerryHelps = dailyHelps * (1 - effectiveIngRate);
    const dailyBerryCount = Math.round(dailyBerryHelps * berryCount);
    const dailyBerryEnergy = Math.round(dailyBerryCount * singleBerryPower);

    // 4. Main Skill
    const mainSkillName = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
    let baseSkillRate = 0.035;
    if (base && base.skill_rate) {
      baseSkillRate = parseFloat(base.skill_rate) / 100;
    } else if (base && base.specialty && (base.specialty.includes('技能') || base.specialty === 'Skills')) {
      baseSkillRate = 0.055;
    }

    let skillMultiplier = 1.0;
    if (hasSub('技能機率提升M')) skillMultiplier *= 1.36;
    if (hasSub('技能機率提升S')) skillMultiplier *= 1.18;
    if (nat && nat.buff && nat.buff.includes('主技能')) skillMultiplier *= 1.20;
    if (nat && nat.debuff && nat.debuff.includes('主技能')) skillMultiplier *= 0.80;

    const effectiveSkillRate = Math.min(0.35, Math.max(0.01, baseSkillRate * skillMultiplier));
    const dailySkillProcs = Math.round((dailyHelps * effectiveSkillRate) * 100) / 100;

    let dailySkillEnergy = 0;
    const lvlIdx = Math.max(0, skillLevel - 1);
    if (mainSkillName.includes('能量填充M') || mainSkillName.includes('Bad Dreams')) {
      const tbl = [880, 1251, 1726, 2383, 3290, 4546, 6400];
      dailySkillEnergy = Math.round(dailySkillProcs * (tbl[Math.min(lvlIdx, tbl.length - 1)] || 880));
    } else if (mainSkillName.includes('能量填充S') || mainSkillName.includes('Charge Str. S') || mainSkillName.includes('Charge Strength S')) {
      if (mainSkillName.includes('隨機') || mainSkillName.includes('Random')) {
        const tbl = [500, 712, 982, 1354, 1870, 2583, 4015];
        dailySkillEnergy = Math.round(dailySkillProcs * (tbl[Math.min(lvlIdx, tbl.length - 1)] || 500));
      } else {
        const tbl = [400, 569, 785, 1083, 1496, 2066, 3212];
        dailySkillEnergy = Math.round(dailySkillProcs * (tbl[Math.min(lvlIdx, tbl.length - 1)] || 400));
      }
    } else if (mainSkillName.includes('食材獲取') || mainSkillName.includes('Ingredient Magnet')) {
      const tbl = [6, 8, 11, 14, 17, 21, 24];
      const count = tbl[Math.min(lvlIdx, tbl.length - 1)] || 6;
      dailySkillEnergy = Math.round(dailySkillProcs * count * 115);
    } else if (mainSkillName.includes('活力全體療癒') || mainSkillName.includes('Energy for Everyone')) {
      dailySkillEnergy = Math.round(dailySkillProcs * 1800);
    } else {
      dailySkillEnergy = Math.round(dailySkillProcs * 650);
    }

    const totalDailyEnergy = dailyBerryEnergy + totalDailyIngredientEnergy + dailySkillEnergy;

    return {
      level,
      boxLevel,
      overrideLevel: overrideLevel || 'box',
      effectiveInterval,
      dailyHelps,
      effectiveIngRate,
      effectiveSkillRate,
      dailyBerryCount,
      dailyBerryEnergy,
      singleBerryPower,
      berryCount,
      berry,
      totalDailyIngredientsCount: Math.round(totalDailyIngredientsCount * 10) / 10,
      totalDailyIngredientEnergy,
      itemizedIngredients,
      mainSkillName,
      skillLevel,
      dailySkillProcs,
      dailySkillEnergy,
      totalDailyEnergy,
      activeSubskills,
      allSubskills: subskills
    };
  }

  function formatSecsToMinSec(seconds, _unused) {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (s) {
      return window.I18N?.t?.('lab.c_fmt_min_sec', { m, s }) ?? `${m}m ${s}s`;
    }
    return window.I18N?.t?.('lab.c_fmt_min_only', { m }) ?? `${m}m`;
  }

  /* ─── 寶可夢對比 HTML 產生器 (最多 3 位選手並排比較) ──────── */
  const COMPARE_COLORS = ['#38bdf8', '#c084fc', '#f59e0b'];
  const COMPARE_LETTERS = ['A', 'B', 'C'];
  const COMPARE_MAX = 3;

  function renderComparisonView(userBox, pokemons, _unused, isMobileH5) {
    if (userBox.length === 0) {
      return `<div style="padding:40px;text-align:center;color:var(--text-muted);">${window.I18N?.t?.('lab.c_cmp_register_first') ?? 'lab.c_cmp_register_first'}</div>`;
    }

    if (!Array.isArray(labState.compareSlots)) {
      labState.compareSlots = [null, null, null];
    }
    while (labState.compareSlots.length < COMPARE_MAX) {
      labState.compareSlots.push(null);
    }

    // 清理已在倉庫中不存在的 uid
    labState.compareSlots = labState.compareSlots.map(uid => (uid && userBox.some(p => p.uid === uid) ? uid : null));

    const currentBenchmark = labState.compareBenchmarkLevel || 'box';

    // 收集目前已選之選手
    const activePlayers = [];
    [0, 1, 2].forEach(i => {
      const uid = labState.compareSlots[i];
      if (!uid) return;
      const item = userBox.find(p => p.uid === uid);
      if (!item) return;
      const base = findBasePkm(item.pokemonId || item.name);
      const perf = calculatePokemonComparisonPerformance(item, base, currentBenchmark);
      const evalItem = (currentBenchmark && currentBenchmark !== 'box')
        ? Object.assign({}, item, { level: parseInt(currentBenchmark, 10) })
        : item;
      const evaluation = (typeof evaluatePokemon === 'function') ? evaluatePokemon(evalItem) : null;
      activePlayers.push({
        slotIndex: i,
        letter: COMPARE_LETTERS[i],
        color: COMPARE_COLORS[i],
        item,
        base,
        perf,
        evaluation
      });
    });

    const N = activePlayers.length;
    const fmt = n => Number(n).toLocaleString();
    const pLabel = p => window.I18N?.t?.('lab.c_cmp_player_label', { letter: p.letter }) ?? `Player ${p.letter}`;
    const unitIng = window.I18N?.t?.('lab.c_cmp_unit_ing_day') ?? 'items/day';
    const fallbackAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';

    // ── 頂部：3 個選手槽位 (單行並排展示 + 簡化卡片) ──
    const slotCardHtml = i => {
      const letter = COMPARE_LETTERS[i];
      const color = COMPARE_COLORS[i];
      const uid = labState.compareSlots[i];
      const item = uid ? userBox.find(p => p.uid === uid) : null;

      if (!item) {
        return `
          <button type="button" class="lab-compare-vs-player lab-compare-empty-slot slot-${letter.toLowerCase()}" style="border-top-color:${color};" onclick="window.AppraisalLab.openPicker({ type: 'compare', compareSlot: ${i} })">
            <div class="lab-compare-vs-header-top">
              <span class="lab-compare-slot-letter" style="background:${color};">${letter}</span>
            </div>
            <div class="lab-compare-empty-content">
              <span class="lab-compare-empty-plus">+</span>
              <span class="lab-compare-empty-text">${window.I18N?.t?.('lab.c_cmp_pick_player', { letter }) ?? `Pick Player ${letter}`}</span>
            </div>
            <div class="lab-compare-tap-hint">${window.I18N?.t?.('lab.c_cmp_tap_pick') ?? 'Tap to pick'}</div>
          </button>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const avatarUrl = (base && typeof window !== 'undefined' && typeof window.getItemIcon === 'function')
        ? window.getItemIcon(base)
        : ((base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || fallbackAvatar);
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const berryDisp = window.I18N?.getBerryName?.(berry.name || '') ?? (window.I18N?.text?.(berry.name || '') ?? (berry.name || ''));
      const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 13) : '';
      const natDisplayName = window.I18N?.getNatureName?.(item.nature) ?? (window.I18N?.text?.(item.nature) ?? (item.nature || ''));
      const pkmDisplayName = item.nickname || window.I18N?.getPokemonName?.(base || item.name) || (window.I18N?.text?.(item.name) ?? (item.name || ''));
      const effLevel = (currentBenchmark && currentBenchmark !== 'box') ? parseInt(currentBenchmark, 10) : (parseInt(item.level, 10) || 1);
      const removeLabel = window.I18N?.t?.('lab.c_cmp_remove') ?? 'Remove';

      return `
        <div class="lab-compare-vs-player slot-${letter.toLowerCase()}" style="border-top-color:${color}; cursor:pointer;" onclick="window.AppraisalLab.openPicker({ type: 'compare', compareSlot: ${i} })">
          <div class="lab-compare-vs-header-top">
            <span class="lab-compare-slot-letter" style="background:${color};">${letter}</span>
            <button type="button" class="lab-compare-remove-btn" aria-label="${removeLabel}" title="${removeLabel}" onclick="event.stopPropagation(); window.AppraisalLab.clearCompareSlot(${i});">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="lab-compare-vs-avatar-wrap">
            <img src="${avatarUrl}" class="lab-compare-vs-avatar" width="44" height="44" alt="${window.I18N?.t?.('lab.c_cmp_player_label', { letter }) ?? `Player ${letter}`}" loading="lazy" decoding="async">
            <span class="lab-compare-vs-lvl">Lv.${effLevel}</span>
          </div>
          <div class="lab-compare-micro-meta">
            ${specHtml}
            ${berry && berry.icon ? `<img src="${berry.icon}" class="lab-compare-mini-berry" width="16" height="16" loading="lazy" decoding="async" alt="Berry" title="${escapeHtml(berryDisp)}">` : ''}
            <span class="lab-compare-vs-tag nat-tag">${escapeHtml(natDisplayName)}</span>
          </div>
          <div class="lab-compare-tap-hint">${window.I18N?.t?.('lab.c_cmp_tap_change') ?? 'Tap to change'}</div>
        </div>
      `;
    };

    const headerHtml = `
      <div class="lab-compare-vs-header">
        ${slotCardHtml(0)}
        <div class="lab-compare-vs-divider">
          <div class="lab-compare-vs-badge">VS</div>
        </div>
        ${slotCardHtml(1)}
        <div class="lab-compare-vs-divider">
          <div class="lab-compare-vs-badge">VS</div>
        </div>
        ${slotCardHtml(2)}
      </div>
      <div class="lab-compare-pick-hint" style="margin-bottom:8px;font-size:11.5px;color:var(--text-muted);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
        <span>${window.I18N?.t?.('lab.c_cmp_selected_hint', { n: N, max: COMPARE_MAX }) ?? 'lab.c_cmp_selected_hint'}</span>
        ${N > 0 ? `<button type="button" class="box-btn box-btn-secondary" style="font-size:11px;padding:2px 8px;" onclick="[0,1,2].forEach(i=>window.AppraisalLab.clearCompareSlot(i));">${window.I18N?.t?.('lab.c_cmp_clear_all') ?? 'Clear All'}</button>` : ''}
      </div>
    `;

    // ── 基準等級切換橫列 ──
    const caps = _getCompareCaps();
    const capLv = caps.POKEMON_LEVEL_CAP || 70;
    const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
    const milestoneLevels = Array.from(new Set([30, 50, 60, capLv, 80, maxLv])).sort((a, b) => a - b);
    const benchmarkLevels = [
      { id: 'box', label: window.I18N?.t?.('lab.c_cmp_box_lv') ?? 'Box Lv', title: window.I18N?.t?.('lab.c_cmp_box_lv_title') ?? 'lab.c_cmp_box_lv_title' }
    ];
    milestoneLevels.forEach(lv => {
      let descKey = 'lab.c_cmp_desc_milestone';
      if (lv === capLv && lv !== 60) {
        descKey = 'lab.c_cmp_desc_cap';
      } else if (lv === 30) {
        descKey = 'lab.c_cmp_desc_lv30';
      } else if (lv === 50) {
        descKey = 'lab.c_cmp_desc_lv50';
      } else if (lv === 60) {
        descKey = capLv === 60 ? 'lab.c_cmp_desc_lv60_cap' : 'lab.c_cmp_desc_lv60';
      } else if (lv === 80) {
        descKey = 'lab.c_cmp_desc_lv80';
      } else if (lv === maxLv) {
        descKey = 'lab.c_cmp_desc_max';
      } else if (lv > capLv) {
        descKey = 'lab.c_cmp_desc_sim';
      }
      const desc = window.I18N?.t?.(descKey) ?? descKey;
      benchmarkLevels.push({
        id: String(lv),
        label: `Lv.${lv}`,
        title: window.I18N?.t?.('lab.c_cmp_bench_title', { lv, desc }) ?? `Lv.${lv}: ${desc}`
      });
    });
    const benchmarkBarHtml = `
      <div class="lab-compare-benchmark-row">
        <span class="lab-compare-benchmark-title">${window.I18N?.t?.('lab.c_cmp_benchmark_label') ?? 'Benchmark Level:'}</span>
        <div class="lab-compare-benchmark-chips">
          ${benchmarkLevels.map(b => `
            <button type="button" class="benchmark-chip${String(currentBenchmark) === String(b.id) ? ' active' : ''}" onclick="window.AppraisalLab.setCompareBenchmarkLevel('${b.id}')" title="${b.title || b.label}">
              ${b.label}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // ── 下方比較容器 (無論選滿與否，均常駐於 DOM) ──
    if (N < 2) {
      return `
        <div class="lab-compare-view-container">
          ${headerHtml}
          ${benchmarkBarHtml}
          <div class="lab-compare-kpi-card" id="lab-compare-energy">
            <div class="lab-compare-kpi-head">
              <div class="lab-compare-kpi-title">
                <span>${window.I18N?.t?.('lab.c_cmp_energy_title') ?? 'Daily Total Energy Output'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${window.I18N?.t?.('lab.c_cmp_energy_empty') ?? 'lab.c_cmp_energy_empty'}
            </div>
          </div>

          <div class="lab-compare-kpi-card" id="lab-compare-ingredients">
            <div class="lab-compare-kpi-head">
              <div class="lab-compare-kpi-title">
                <span>${window.I18N?.t?.('lab.c_cmp_ing_title') ?? 'Daily Ingredient Yield Comparison'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${window.I18N?.t?.('lab.c_cmp_ing_empty') ?? 'lab.c_cmp_ing_empty'}
            </div>
          </div>

          <div class="lab-compare-kpi-card" id="lab-compare-skills">
            <div class="lab-compare-kpi-head">
              <div class="lab-compare-kpi-title">
                <span>${window.I18N?.t?.('lab.c_cmp_skills_title') ?? 'Skill Procs, Speed & Specs'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${window.I18N?.t?.('lab.c_cmp_skills_empty') ?? 'lab.c_cmp_skills_empty'}
            </div>
          </div>
        </div>
      `;
    }

    // N >= 2 時：進行多選手深度數據對照
    const bestIdxOf = (vals, higher) => {
      if (higher === null || higher === undefined) return [];
      const target = higher ? Math.max.apply(null, vals) : Math.min.apply(null, vals);
      if (vals.every(v => v === vals[0])) return [];
      return vals.map((v, i) => (v === target ? i : -1)).filter(i => i >= 0);
    };

    const letterChip = p => `<span class="lab-compare-slot-letter small" style="background:${p.color};">${p.letter}</span>`;

    const barRowsHtml = (vals, texts) => {
      const max = Math.max.apply(null, vals.concat([0.0001]));
      return activePlayers.map((p, i) => {
        const pct = vals[i] > 0 ? Math.max(4, Math.round((vals[i] / max) * 100)) : 0;
        return `
          <div class="lab-cmp-bar-row">
            ${letterChip(p)}
            <div class="lab-cmp-bar-track"><div class="lab-cmp-bar-fill" style="width:${pct}%;background:${p.color};"></div></div>
            <span class="lab-cmp-bar-val" style="color:${p.color};">${texts[i]}</span>
          </div>`;
      }).join('');
    };

    const leadBadge = (vals, formatDiff) => {
      const sorted = vals.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v);
      const diff = sorted[0].v - sorted[1].v;
      if (diff <= 0) return `<span class="lab-compare-kpi-badge tie">${window.I18N?.t?.('lab.c_cmp_tie') ?? 'Tie'}</span>`;
      const lead = activePlayers[sorted[0].i];
      const pct = sorted[1].v > 0 ? ((diff / sorted[1].v) * 100).toFixed(1) : null;
      return `<span class="lab-compare-kpi-badge" style="background:${lead.color}2e;color:${lead.color};border:1px solid ${lead.color}59;">${lead.letter} ${window.I18N?.t?.('lab.c_cmp_leads') ?? 'Leads'} +${formatDiff(diff)}${pct ? ` (${pct}%)` : ''}</span>`;
    };

    const tableHtml = rows => `
      <div class="lab-cmp-table" style="--n:${N};">
        <div class="lab-cmp-row lab-cmp-head"><span></span>${activePlayers.map(p => `<span class="lab-cmp-val">${letterChip(p)}</span>`).join('')}</div>
        ${rows.map(r => {
          const bests = bestIdxOf(r.vals, r.higher);
          return `<div class="lab-cmp-row"><span class="lab-cmp-label">${r.label}</span>${activePlayers.map((p, i) => `<span class="lab-cmp-val${bests.includes(i) ? ' best' : ''}" style="--pc:${p.color};">${r.texts[i]}</span>`).join('')}</div>`;
        }).join('')}
      </div>`;

    const num = (label, getter, higher, textFn) => {
      const vals = activePlayers.map(p => getter(p.perf));
      return { label, vals, higher, texts: vals.map((v, i) => (textFn ? textFn(v, activePlayers[i]) : fmt(v))) };
    };

    // ── 1. 六維綜合戰力評定對照 (6-Dimension Evaluation Matrix) ──
    const sixDimRows = [
      num(window.I18N?.t?.('lab.c_cmp_total_energy') ?? 'Est. Total Energy', x => x.totalDailyEnergy, true),
      num(window.I18N?.t?.('lab.c_cmp_berry_power') ?? 'Berry Power', x => x.dailyBerryEnergy, true),
      num(window.I18N?.t?.('lab.c_cmp_ing_power') ?? 'Ingredient Power', x => x.totalDailyIngredientEnergy, true),
      num(window.I18N?.t?.('lab.c_cmp_skill_procs_day') ?? 'Skill Procs / Day', x => x.dailySkillProcs, true, v => window.I18N?.t?.('lab.c_cmp_val_per_day', { v }) ?? `${v} /day`),
      num(window.I18N?.t?.('lab.c_cmp_help_interval') ?? 'Help Interval', x => x.effectiveInterval, false, v => formatSecsToMinSec(v)),
      {
        label: window.I18N?.t?.('lab.c_cmp_composite_tier') ?? 'Composite Tier',
        vals: activePlayers.map(p => (p.evaluation ? p.evaluation.compositeScore : 0)),
        higher: true,
        texts: activePlayers.map(p => {
          const ev = p.evaluation;
          if (!ev) return '--';
          const grade = ev.grade || 'B';
          const score = ev.compositeScore || 70;
          return `<div style="display:flex;align-items:center;justify-content:center;gap:4px;"><span class="lab-grade-badge" style="background:${ev.gradeColor || '#38bdf8'}26;color:${ev.gradeColor || '#38bdf8'};border:1px solid ${ev.gradeColor || '#38bdf8'}59;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:800;">${grade}</span><span style="font-size:11px;color:var(--text-secondary);font-weight:700;">${score}${window.I18N?.t?.('lab.c_cmp_pts_unit') ?? ' pts'}</span></div>`;
        })
      }
    ];

    const sixDimHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-sixdim">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title">
            <span>${window.I18N?.t?.('lab.c_cmp_sixdim_title') ?? '6-Dimension Evaluation Matrix'}</span>
          </div>
        </div>
        ${tableHtml(sixDimRows)}
      </div>
    `;

    // ── 2. 每日能量 ──
    const energyVals = activePlayers.map(p => p.perf.totalDailyEnergy);
    const energyHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-energy">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title"><span>${window.I18N?.t?.('lab.c_cmp_energy_title') ?? 'Daily Total Energy Output'}</span></div>
          ${leadBadge(energyVals, d => fmt(d))}
        </div>
        ${barRowsHtml(energyVals, energyVals.map(v => `${fmt(v)}`))}
        ${tableHtml([
          num(window.I18N?.t?.('lab.c_cmp_berry_energy') ?? 'Berry Energy', x => x.dailyBerryEnergy, true),
          num(window.I18N?.t?.('lab.c_cmp_ing_energy') ?? 'Ingredient Energy', x => x.totalDailyIngredientEnergy, true),
          num(window.I18N?.t?.('lab.c_cmp_skill_energy') ?? 'Skill Energy (Est)', x => x.dailySkillEnergy, true)
        ])}
      </div>`;

    // ── 3. 副技能與性格配置橫向對照 (Subskills & Nature Build Matchup) ──
    const unlockLevels = (typeof _getCompareCaps === 'function' && _getCompareCaps().SUBSKILL_UNLOCK_LEVELS) ? _getCompareCaps().SUBSKILL_UNLOCK_LEVELS : [10, 25, 50, 70, 80];
    const subskillSlotRows = unlockLevels.map((tierLv, slotIdx) => {
      return {
        label: `Lv.${tierLv}`,
        tierLv: tierLv,
        higher: null,
        vals: activePlayers.map(() => 0),
        texts: activePlayers.map(p => {
          const effLv = p.perf.level;
          const isUnlocked = effLv >= tierLv;
          const sName = (p.item.subskills && p.item.subskills[slotIdx]) || '--';
          const locName = sName !== '--' ? (window.I18N?.getSubSkillName?.(sName) ?? (window.I18N?.text?.(sName) ?? sName)) : '--';
          const tierColor = (sName !== '--' && typeof getSkillTier === 'function') ? getSkillTier(sName) : null;
          let badgeStyle = '';
          if (tierColor === 'gold' || tierColor === 'gold-tier') {
            badgeStyle = 'background:rgba(245,158,11,0.15);color:#f59e0b;border:1px solid rgba(245,158,11,0.4);';
          } else if (tierColor === 'blue' || tierColor === 'blue-tier') {
            badgeStyle = 'background:rgba(56,189,248,0.15);color:#38bdf8;border:1px solid rgba(56,189,248,0.4);';
          } else if (sName !== '--') {
            badgeStyle = 'background:rgba(148,163,184,0.12);color:#cbd5e1;border:1px solid rgba(148,163,184,0.3);';
          } else {
            badgeStyle = 'color:var(--text-muted);';
          }

          if (!isUnlocked && sName !== '--') {
            badgeStyle += 'opacity:0.42;filter:grayscale(60%);';
          }

          return `<span class="lab-subskill-pill${isUnlocked ? '' : ' locked'}" style="${badgeStyle}" title="${isUnlocked ? '' : (window.I18N?.t?.('lab.c_cmp_subskill_locked_title') ?? 'Locked at this level')}">${escapeHtml(locName)}${!isUnlocked && sName !== '--' ? (window.I18N?.t?.('lab.c_cmp_subskill_locked_tag') ?? ' [Locked]') : ''}</span>`;
        })
      };
    });

    const natureRow = {
      label: window.I18N?.t?.('lab.c_cmp_nature_build') ?? 'Nature',
      higher: null,
      vals: activePlayers.map(() => 0),
      texts: activePlayers.map(p => {
        const isMint = !!(p.item.cleanseMint || p.item.mint);
        const nName = window.I18N?.getNatureName?.(p.item.nature) ?? (window.I18N?.text?.(p.item.nature) ?? (p.item.nature || ''));
        const nat = isMint ? null : NATURE_DATA.find(n => n.name === p.item.nature || n.name_en === p.item.nature);
        let extra = '';
        if (isMint) {
          extra = `<span style="font-size:10px;color:var(--accent-color,#38bdf8);">${window.I18N?.t?.('lab.c_cmp_minted') ?? '(Minted)'}</span>`;
        } else if (nat && nat.buff && nat.buff !== '無增減') {
          const buffText = window.I18N?.field?.(nat, 'buff') || nat.buff || '';
          const debuffText = window.I18N?.field?.(nat, 'debuff') || nat.debuff || '';
          extra = `<span style="font-size:9.5px;color:#10b981;">${escapeHtml(buffText)}</span> <span style="font-size:9.5px;color:#f43f5e;">${escapeHtml(debuffText)}</span>`;
        }
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-weight:700;">${escapeHtml(nName)}</span>${extra}</div>`;
      })
    };

    const buildHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-builds">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title">
            <span>${window.I18N?.t?.('lab.c_cmp_build_title') ?? 'Subskills & Nature Build Matchup'}</span>
          </div>
        </div>
        ${tableHtml([ ...subskillSlotRows, natureRow ])}
      </div>
    `;

    // ── 4. 每日食材 (跨插槽食材產量總和對照) ──
    const aggs = activePlayers.map(p => {
      const agg = {};
      (p.perf.itemizedIngredients || []).forEach(slot => {
        if (slot.isUnlocked && slot.name && slot.name !== '--') agg[slot.name] = (agg[slot.name] || 0) + (slot.dailyCount || 0);
      });
      return agg;
    });
    const names = Array.from(new Set([].concat.apply([], aggs.map(a => Object.keys(a)))));
    const sumOf = n => aggs.reduce((s, a) => s + (a[n] || 0), 0);
    names.sort((a, b) => sumOf(b) - sumOf(a));

    let distinctIngRowsHtml;
    if (names.length === 0) {
      distinctIngRowsHtml = `<div style="text-align:center;color:var(--text-muted);padding:14px;font-size:12px;">${window.I18N?.t?.('lab.c_cmp_no_ing_unlocked') ?? 'No ingredients unlocked yet'}</div>`;
    } else {
      distinctIngRowsHtml = names.map(n => {
        const vals = aggs.map(a => Math.round((a[n] || 0) * 10) / 10);
        const nameText = window.I18N?.getIngredientName?.(n) ?? (window.I18N?.text?.(n) ?? n);
        const icon = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') ? window.I18N.getIngredientIcon(n) : '';
        const holders = vals.filter(v => v > 0).length;
        let badge = '';
        const top = Math.max.apply(null, vals);
        const topIdx = vals.map((v, i) => (v === top ? i : -1)).filter(i => i >= 0);
        if (holders === 1) {
          const p = activePlayers[vals.findIndex(v => v > 0)];
          badge = `<span class="lab-compare-kpi-badge" style="background:${p.color}2e;color:${p.color};border:1px solid ${p.color}59;">${p.letter} ${window.I18N?.t?.('lab.c_cmp_exclusive') ?? 'Exclusive'}</span>`;
        } else if (topIdx.length === 1) {
          const p = activePlayers[topIdx[0]];
          badge = `<span class="lab-compare-kpi-badge" style="background:${p.color}2e;color:${p.color};border:1px solid ${p.color}59;">${p.letter} ${window.I18N?.t?.('lab.c_cmp_leads') ?? 'Leads'}</span>`;
        } else {
          badge = `<span class="lab-compare-kpi-badge tie">${window.I18N?.t?.('lab.c_cmp_tie') ?? 'Tie'}</span>`;
        }
        return `
          <div class="lab-compare-distinct-row">
            <div class="lab-compare-distinct-head">
              <div class="lab-compare-distinct-title">
                ${icon ? `<img src="${icon}" class="lab-compare-distinct-icon" width="22" height="22" loading="lazy" decoding="async" alt="${escapeHtml(nameText)}">` : ''}
                <span>${escapeHtml(nameText)}</span>
              </div>
              <div>${badge}</div>
            </div>
            ${barRowsHtml(vals, vals.map(v => `${v} ${unitIng}`))}
          </div>`;
      }).join('');
    }

    const ingVals = activePlayers.map(p => p.perf.totalDailyIngredientsCount);
    const ingredientsHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-ingredients">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title"><span>${window.I18N?.t?.('lab.c_cmp_ing_title') ?? 'Daily Ingredient Yield Comparison'}</span></div>
          ${leadBadge(ingVals, d => `${Math.round(d * 10) / 10} ${unitIng}`)}
        </div>
        ${barRowsHtml(ingVals, ingVals.map(v => `${v} ${unitIng}`))}
        <div class="lab-compare-distinct-list" style="margin-top:6px;">
          <div class="lab-compare-distinct-caption" style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">${window.I18N?.t?.('lab.c_cmp_per_ing_caption') ?? 'lab.c_cmp_per_ing_caption'}</div>
          ${distinctIngRowsHtml}
        </div>
      </div>`;

    // ── 5. 技能發動與幫手效能全面對照 ──
    const skillLabel = p => {
      const nm = (p.base && (p.base.main_skill || (p.base.skill && p.base.skill.name))) || p.item.main_skill || '--';
      const locNm = window.I18N?.getMainSkillName?.(nm) ?? (window.I18N?.text?.(nm) ?? nm);
      return `${locNm} Lv.${p.item.skillLevel || 1}`;
    };
    const specRows = [
      { label: window.I18N?.t?.('lab.c_cmp_level') ?? 'Level', vals: activePlayers.map(p => p.perf.level), higher: null, texts: activePlayers.map(p => `Lv.${p.perf.level}`) },
      num(window.I18N?.t?.('lab.c_cmp_help_period') ?? 'Help Interval', x => x.effectiveInterval, false, v => formatSecsToMinSec(v)),
      num(window.I18N?.t?.('lab.c_cmp_daily_helps') ?? 'Daily Helps', x => x.dailyHelps, true, v => window.I18N?.t?.('lab.c_cmp_val_helps_day', { v }) ?? `${v} /day`),
      num(window.I18N?.t?.('lab.c_cmp_ing_rate') ?? 'Ingredient Rate', x => Math.round(x.effectiveIngRate * 1000) / 10, true, v => `${v}%`),
      num(window.I18N?.t?.('lab.c_cmp_berries_day') ?? 'Berries / Day', x => x.dailyBerryCount, true),
      num(window.I18N?.t?.('lab.c_cmp_energy_berry') ?? 'Energy / Berry', x => x.singleBerryPower, true),
      { label: window.I18N?.t?.('lab.c_cmp_main_skill') ?? 'Main Skill', vals: activePlayers.map(() => 0), higher: null, texts: activePlayers.map(p => skillLabel(p)) },
      num(window.I18N?.t?.('lab.c_cmp_skill_proc_rate') ?? 'Skill Proc Rate', x => Math.round(x.effectiveSkillRate * 1000) / 10, true, v => `${v}%`),
      num(window.I18N?.t?.('lab.c_cmp_skill_procs_day_row') ?? 'Skill Procs / Day', x => x.dailySkillProcs, true, v => window.I18N?.t?.('lab.c_cmp_val_procs_day', { v }) ?? `~${v} /day`),
      num(window.I18N?.t?.('lab.c_cmp_avg_proc_interval') ?? 'Avg Proc Interval', x => (x.dailySkillProcs > 0 ? Math.round((24 / x.dailySkillProcs) * 10) / 10 : 9999), false, v => (v >= 9999 ? '--' : (window.I18N?.t?.('lab.c_cmp_hours', { v }) ?? `${v} h`))),
      num(window.I18N?.t?.('lab.c_cmp_skill_energy_day') ?? 'Skill Energy / Day', x => x.dailySkillEnergy, true),
      { label: window.I18N?.t?.('lab.c_cmp_nature') ?? 'Nature', vals: activePlayers.map(() => 0), higher: null, texts: activePlayers.map(p => {
        const nName = window.I18N?.getNatureName?.(p.item.nature) ?? (window.I18N?.text?.(p.item.nature) ?? (p.item.nature || ''));
        return (p.item.cleanseMint || p.item.mint) ? `${nName}${window.I18N?.t?.('lab.c_cmp_mint_suffix') ?? ' (Mint)'}` : nName;
      }) }
    ];
    const specHtml = `
      <div class="lab-compare-kpi-card lab-compare-matchup-table" id="lab-compare-skills">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title"><span>${window.I18N?.t?.('lab.c_cmp_skills_title') ?? 'Skill Procs, Speed & Specs'}</span></div>
        </div>
        ${tableHtml(specRows)}
      </div>`;

    // ── 6. 結論與培育建議 ──
    const topOf = vals => vals.indexOf(Math.max.apply(null, vals));
    const allEqual = vals => vals.every(v => v === vals[0]);
    const skillProcVals = activePlayers.map(p => p.perf.dailySkillProcs);
    const parts = [];
    if (!allEqual(energyVals)) {
      const p = activePlayers[topOf(energyVals)];
      parts.push(window.I18N?.t?.('lab.c_cmp_verdict_energy', { player: pLabel(p), val: fmt(p.perf.totalDailyEnergy) }) ?? 'lab.c_cmp_verdict_energy');
    }
    if (!allEqual(ingVals)) {
      const p = activePlayers[topOf(ingVals)];
      parts.push(window.I18N?.t?.('lab.c_cmp_verdict_ing', { player: pLabel(p), val: p.perf.totalDailyIngredientsCount, unit: unitIng }) ?? 'lab.c_cmp_verdict_ing');
    }
    if (!allEqual(skillProcVals)) {
      const p = activePlayers[topOf(skillProcVals)];
      parts.push(window.I18N?.t?.('lab.c_cmp_verdict_skill', { player: pLabel(p), val: p.perf.dailySkillProcs }) ?? 'lab.c_cmp_verdict_skill');
    }
    const verdictSummary = parts.length
      ? parts.join(window.I18N?.t?.('lab.c_cmp_verdict_sep') ?? ' ')
      : (window.I18N?.t?.('lab.c_cmp_verdict_even') ?? 'All selected Pokémon are evenly matched.');

    return `
      <div class="lab-compare-view-container">
        ${headerHtml}
        ${benchmarkBarHtml}
        ${energyHtml}
        ${sixDimHtml}
        ${buildHtml}
        ${ingredientsHtml}
        ${specHtml}
        <div class="lab-compare-verdict-card" style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.25);border-radius:10px;padding:14px;">
          <div style="font-size:12.5px;font-weight:800;color:var(--accent-color,#38bdf8);margin-bottom:6px;">
            ${window.I18N?.t?.('lab.c_cmp_verdict_title') ?? 'Research Lab Comparative Verdict & Advice'}
          </div>
          <div style="font-size:12px;color:#e2e8f0;line-height:1.6;">${verdictSummary}</div>
        </div>
      </div>
    `;
  }

  const _FALLBACK_LAB_GROWTH_CAPS = /* @GAME_CONFIG_FALLBACK_START */ {"POKEMON_LEVEL_CAP":70,"RECIPE_LEVEL_CAP":70,"THEORETICAL_MAX_LEVEL":100,"ISLAND_BONUS_CAP":95,"ISLAND_BONUS_STEP":5,"RECIPE_MAX_BONUS_PCT":258,"SUBSKILL_UNLOCK_LEVELS":[10,25,50,70,80]} /* @GAME_CONFIG_FALLBACK_END */;

  function _getGrowthCaps() {
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) ||
               (typeof window !== 'undefined' && window.GAME_CONFIG) || null;
    return (gc && typeof gc.getCaps === 'function') ? gc.getCaps() : _FALLBACK_LAB_GROWTH_CAPS;
  }

  /* ==========================================================================
     lab_growth.js — 深度研究室：培育與種子精算模組 (Growth & Seed ROI Lab)
     ==========================================================================
     遵守全域規範：
     - Rule 8 (Zero Emojis): 全面禁止 Emoji。
     - Rule 9 (Single Frame Rule): 容器零多餘巢狀外框。
     - Rule 10 (Zero Glyphs): 零特殊裝飾字形符號 (無星號、特殊記號)。
     - 單檔嚴格保持在 1,000 行以內。
     ========================================================================== */

  const growthState = {
    selectedUid: null,
    fromLevel: 1,
    targetLevel: 30,
    customExpCurve: 'auto', // 'auto' | '1.0' | '1.5' | '1.8' | '3.0'
    customNatureExp: 'auto' // 'auto' | 'up' | 'down' | 'normal'
  };

  /* 官方 Pokemon Sleep Lv.1 ~ Lv.80 各等級累積所需 EXP 資料 (解包正本) */
  const GROWTH_CUMULATIVE_EXP = [
    0, 0, 54, 125, 233, 361, 525, 727, 971, 1245, 1560,
    1905, 2281, 2688, 3107, 3536, 3976, 4430, 4899, 5382, 5879,
    6394, 6931, 7489, 8068, 8668, 9290, 9933, 10598, 11284, 11992,
    12721, 13469, 14235, 15020, 15823, 16644, 17483, 18340, 19215, 20108,
    21018, 21946, 22891, 23854, 24834, 25831, 26846, 27878, 28927, 29993,
    31355, 32917, 34664, 36610, 38805, 41084, 43488, 46021, 48687, 51493,
    54358, 57280, 60257, 63286, 66363, 69458, 72574, 75718, 78907, 82162,
    85492, 88902, 92402, 96002, 99712, 103542, 107502, 111602, 115852, 120262
  ];

  /* 官方夢之碎片累積里程碑表 (標準 1.0x 曲線) */
  const GROWTH_SHARD_MILESTONES = [
    { lv: 1, shards: 0 },
    { lv: 10, shards: 1400 },
    { lv: 25, shards: 9200 },
    { lv: 30, shards: 14500 },
    { lv: 50, shards: 48000 },
    { lv: 60, shards: 110000 },
    { lv: 70, shards: 200000 },
    { lv: 75, shards: 260000 },
    { lv: 80, shards: 380000 },
    { lv: 100, shards: 680000 }
  ];

  /* 銀色技能種子升級階梯映射表 */
  const SUBSKILL_UPGRADE_MAP = {
    '幫忙速度S': '幫忙速度M',
    'Helping Speed S': 'Helping Speed M',
    '食材機率提升S': '食材機率提升M',
    'Ingredient Finder S': 'Ingredient Finder M',
    '技能機率提升S': '技能機率提升M',
    'Skill Trigger S': 'Skill Trigger M',
    '持有上限提升S': '持有上限提升M',
    'Inventory Up S': 'Inventory Up M',
    '持有上限提升M': '持有上限提升L',
    'Inventory Up M': 'Inventory Up L',
    '技能等級提升S': '技能等級提升M',
    'Skill Level Up S': 'Skill Level Up M'
  };

  /* 準神與神獸名單 (自動識別成長曲線) */
  const PSEUDO_LEGENDARY_NAMES = ['迷你龍', '哈克龍', '快龍', '幼基拉斯', '沙基拉斯', '班基拉斯', 'Dratini', 'Dragonair', 'Dragonite', 'Larvitar', 'Pupitar', 'Tyranitar'];
  const LEGENDARY_NAMES = ['雷公', '炎帝', '水君', 'Raikou', 'Entei', 'Suicune'];

  function getGrowthCumulativeShards(level) {
    const lv = Math.max(1, Math.min(100, parseInt(level, 10) || 1));
    for (let i = 0; i < GROWTH_SHARD_MILESTONES.length - 1; i++) {
      const cur = GROWTH_SHARD_MILESTONES[i];
      const next = GROWTH_SHARD_MILESTONES[i + 1];
      if (lv >= cur.lv && lv <= next.lv) {
        if (cur.lv === next.lv) return cur.shards;
        const ratio = (lv - cur.lv) / (next.lv - cur.lv);
        return Math.round(cur.shards + ratio * (next.shards - cur.shards));
      }
    }
    return GROWTH_SHARD_MILESTONES[GROWTH_SHARD_MILESTONES.length - 1].shards;
  }

  function detectPkmExpCurve(name) {
    if (!name) return 1.0;
    const clean = String(name).trim();
    if (PSEUDO_LEGENDARY_NAMES.some(n => clean.includes(n))) return 1.5;
    if (LEGENDARY_NAMES.some(n => clean.includes(n))) return 1.8;
    return 1.0;
  }

  function detectNatureExpMod(natureName) {
    if (!natureName) return 'normal';
    const nature = NATURE_DATA.find(n => n.name === natureName || n.name_en === natureName);
    if (!nature) return 'normal';
    if (nature.buffType === 'exp' || (nature.buff && nature.buff.includes('EXP'))) return 'up';
    if (nature.debuffType === 'exp' || (nature.debuff && nature.debuff.includes('EXP'))) return 'down';
    return 'normal';
  }

  function getCumulativeExp(level) {
    const lv = Math.max(1, Math.min(100, parseInt(level, 10) || 1));
    if (lv <= 80) return GROWTH_CUMULATIVE_EXP[lv] || 0;
    // Lv.81 - Lv.100 平滑內插至 215,000 EXP (五階滿等畢業)
    const exp80 = GROWTH_CUMULATIVE_EXP[80] || 120262;
    return Math.round(exp80 + ((lv - 80) / 20) * (215000 - exp80));
  }

  function calculateGrowthCost(fromLv, targetLv, curveMult, expMod) {
    const cur = Math.max(1, Math.min(99, parseInt(fromLv, 10) || 1));
    let tgt = Math.max(cur, Math.min(100, parseInt(targetLv, 10) || cur));

    const curExp = Math.round(getCumulativeExp(cur) * curveMult);
    const tgtExp = Math.round(getCumulativeExp(tgt) * curveMult);
    const baseExpNeeded = Math.max(0, tgtExp - curExp);

    let expPerCandy = 25;
    if (expMod === 'up') expPerCandy = 30; // +18% (25 * 1.18 = 29.5 -> 30)
    else if (expMod === 'down') expPerCandy = 21; // -18% (25 * 0.82 = 20.5 -> 21)

    const candiesNeeded = baseExpNeeded > 0 ? Math.ceil(baseExpNeeded / expPerCandy) : 0;
    const curShards = Math.round(getGrowthCumulativeShards(cur) * curveMult);
    const tgtShards = Math.round(getGrowthCumulativeShards(tgt) * curveMult);
    const shardsNeeded = Math.max(0, tgtShards - curShards);

    return {
      curLevel: cur,
      targetLevel: tgt,
      expNeeded: baseExpNeeded,
      candiesNeeded: candiesNeeded,
      shardsNeeded: shardsNeeded,
      expPerCandy: expPerCandy,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20),
      handyCandyL: Math.ceil(candiesNeeded / 100)
    };
  }

  function evaluateSubskillSeedUpgrades(targetPkm, basePkm, _unused) {
    if (!targetPkm || !basePkm) return [];
    const subskills = Array.isArray(targetPkm.subskills) ? [...targetPkm.subskills] : [];
    if (subskills.length === 0) return [];

    const existingNames = new Set(subskills.map(s => typeof s === 'string' ? s : (s ? s.name : '')));
    const curLv = targetPkm.level || 30;
    const nature = targetPkm.nature || '坦率';
    const ings = [targetPkm.ing1, targetPkm.ing2, targetPkm.ing3].filter(Boolean);
    const ribbon = targetPkm.ribbon || 0;
    const skillLv = targetPkm.skillLevel || 1;
    const isMint = !!(targetPkm.cleanseMint || targetPkm.mint);

    const baseEval = evaluateSingle(basePkm, curLv, nature, subskills, ings, ribbon, skillLv, false, isMint);
    const basePR = baseEval ? baseEval.compositeScore : 50;

    const upgradeResults = [];
    subskills.forEach((sk, idx) => {
      const skName = typeof sk === 'string' ? sk : (sk ? sk.name : '');
      if (!skName) return;

      const upgradedName = SUBSKILL_UPGRADE_MAP[skName];
      if (!upgradedName) return;

      // 官方規則：若隊員其餘槽位已持有該上位技能，則無法升級（防重複規則）
      if (existingNames.has(upgradedName)) return;

      const clonedSubskills = [...subskills];
      clonedSubskills[idx] = upgradedName;

      const newEval = evaluateSingle(basePkm, curLv, nature, clonedSubskills, ings, ribbon, skillLv, false, isMint);
      const newPR = newEval ? newEval.compositeScore : basePR;
      const deltaPR = Math.max(0, newPR - basePR);

      const fromDisp = window.I18N?.getSubSkillName?.(skName) ?? (window.I18N?.text?.(skName) ?? skName);
      const toDisp = window.I18N?.getSubSkillName?.(upgradedName) ?? (window.I18N?.text?.(upgradedName) ?? upgradedName);

      upgradeResults.push({
        slotIndex: idx,
        fromSkill: skName,
        fromDisplay: fromDisp,
        toSkill: upgradedName,
        toDisplay: toDisp,
        basePR: basePR,
        newPR: newPR,
        deltaPR: deltaPR
      });
    });

    return upgradeResults;
  }

  function evaluateMainSkillSeedROI(targetPkm, basePkm, _unused) {
    if (!targetPkm || !basePkm) {
      const noneLabel = window.I18N?.t?.('lab.c_growth_none') ?? 'None';
      return {
        skillName: noneLabel,
        skillDisplay: noneLabel,
        currentLevel: 1,
        maxLevel: 6,
        seedsNeeded: 0,
        roiGrade: 'C',
        recommendation: window.I18N?.t?.('lab.c_growth_no_skill_data') ?? 'No main skill data.',
        gainSummary: ''
      };
    }

    let rawSkill = targetPkm.skill || targetPkm.main_skill || (basePkm && basePkm.main_skill) || (basePkm && basePkm.skill) || '';
    if (rawSkill && typeof rawSkill === 'object') {
      rawSkill = rawSkill.name || rawSkill.name_cn || rawSkill.name_en || '';
    }
    const skillName = String(rawSkill || (window.I18N?.t?.('lab.c_growth_main_skill') ?? 'Main Skill'));
    const skillDisp = window.I18N?.getMainSkillName?.(skillName) ?? (window.I18N?.text?.(skillName) ?? skillName);
    const curSkillLv = parseInt(targetPkm.skillLevel || 1, 10) || 1;

    // 主技能上限判定：優先採用主技能等級上限查詢函式，支援 Lv.7 及 Lv.8
    const isLv7Skill = ['能量填充M', '能量填充S', '活力加油S', 'Charge Strength M', 'Charge Strength S', 'Energizing Cheer S'].some(s => skillName.includes(s));
    const maxSkillLv = (typeof getMainSkillMaxLevel === 'function') ? getMainSkillMaxLevel(skillName) : (typeof window !== 'undefined' && typeof window.getMainSkillMaxLevel === 'function') ? window.getMainSkillMaxLevel(skillName) : (isLv7Skill ? 7 : 6);
    const seedsNeeded = Math.max(0, maxSkillLv - curSkillLv);

    const spec = basePkm.specialty || '樹果';
    const isSkillSpec = spec.includes('技能') || spec === 'Skills';
    const subskills = Array.isArray(targetPkm.subskills) ? targetPkm.subskills.map(s => typeof s === 'string' ? s : (s ? s.name : '')) : [];
    const hasTriggerM = subskills.some(s => s.includes('技能機率提升M') || s.includes('Skill Trigger M'));
    const hasTriggerS = subskills.some(s => s.includes('技能機率提升S') || s.includes('Skill Trigger S'));
    const nature = targetPkm.nature || '坦率';
    const nat = NATURE_DATA.find(n => n.name === nature || n.name_en === nature);
    const hasSkillBuff = nat && (nat.buffType === 'skill' || (nat.buff && (nat.buff.includes('主技能') || nat.buff.includes('Skill'))));
    const hasSkillDebuff = nat && (nat.debuffType === 'skill' || (nat.debuff && (nat.debuff.includes('主技能') || nat.debuff.includes('Skill'))));

    const isHealer = ['活力療癒', '活力全體療癒', '能量療癒', 'Energy for Everyone', 'Energizing Cheer', 'Heal', '新月祈禱', '樹果汁', '治癒波動', '蹭蹭臉頰'].some(s => skillName.includes(s));
    const isHighImpact = ['幫手加速', 'Helper Boost', '樹果遽增', 'Berry Burst', '料理大成功', '料理成功', 'Extra Tasty', '料理擴鍋', '料理強化', 'Cooking Power Up', '精神擊破', '畫皮', '流星群', '魔法火焰', '健美', '負電'].some(s => skillName.includes(s));

    let roiGrade = 'B';
    let recommendation = '';

    if (hasSkillDebuff) {
      roiGrade = 'C';
      recommendation = window.I18N?.t?.('lab.c_growth_roi_debuff') ?? 'lab.c_growth_roi_debuff';
    } else if (isHealer) {
      if (hasTriggerM || hasSkillBuff) {
        roiGrade = 'S';
        recommendation = window.I18N?.t?.('lab.c_growth_roi_healer_s') ?? 'lab.c_growth_roi_healer_s';
      } else {
        roiGrade = 'A';
        recommendation = window.I18N?.t?.('lab.c_growth_roi_healer_a') ?? 'lab.c_growth_roi_healer_a';
      }
    } else if (isSkillSpec) {
      if (hasTriggerM && (hasSkillBuff || hasTriggerS)) {
        roiGrade = 'S';
        recommendation = window.I18N?.t?.('lab.c_growth_roi_skill_s') ?? 'lab.c_growth_roi_skill_s';
      } else if (hasTriggerM || hasSkillBuff) {
        roiGrade = 'A';
        recommendation = window.I18N?.t?.('lab.c_growth_roi_skill_a') ?? 'lab.c_growth_roi_skill_a';
      } else {
        roiGrade = 'B';
        recommendation = window.I18N?.t?.('lab.c_growth_roi_skill_b') ?? 'lab.c_growth_roi_skill_b';
      }
    } else if (isHighImpact) {
      roiGrade = 'B';
      recommendation = window.I18N?.t?.('lab.c_growth_roi_high_impact') ?? 'lab.c_growth_roi_high_impact';
    } else {
      roiGrade = 'C';
      recommendation = window.I18N?.t?.('lab.c_growth_roi_other') ?? 'lab.c_growth_roi_other';
    }

    return {
      skillName: skillName,
      skillDisplay: skillDisp,
      currentLevel: curSkillLv,
      maxLevel: maxSkillLv,
      seedsNeeded: seedsNeeded,
      roiGrade: roiGrade,
      recommendation: recommendation
    };
  }

  function getActiveGrowthTarget(userBox, pokemons) {
    if (growthState.selectedUid && userBox && userBox.length > 0) {
      const found = userBox.find(p => p.uid === growthState.selectedUid);
      if (found) {
        const base = findBasePkm(found.pokemonId || found.name) || pokemons[0];
        return { item: found, base: base };
      }
    }
    if (userBox && userBox.length > 0) {
      const found = userBox[0];
      const base = findBasePkm(found.pokemonId || found.name) || pokemons[0];
      return { item: found, base: base };
    }
    const defaultBase = pokemons && pokemons[0] ? pokemons[0] : { name: '皮卡丘', name_en: 'Pikachu', specialty: '樹果' };
    const mockItem = {
      uid: 'mock_target',
      name: defaultBase.name_cn || defaultBase.name,
      level: 1,
      nature: '坦率',
      subskills: ['幫忙速度S', '持有上限提升S'],
      skillLevel: 1
    };
    return { item: mockItem, base: defaultBase };
  }

  function renderGrowthView(userBox, pokemons, _unused, isMobileH5) {
    const targetObj = getActiveGrowthTarget(userBox, pokemons);
    const targetPkm = targetObj.item;
    const basePkm = targetObj.base;

    const baseName = basePkm.name_cn || basePkm.name || targetPkm.name || '';
    const pDisplayName = window.I18N?.getPokemonName?.(basePkm) ?? (window.I18N?.field?.(basePkm, 'name') || baseName);
    const avatarUrl = (basePkm && (basePkm.icon_url || basePkm.icon)) || (basePkm && basePkm.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${basePkm.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
    const specDisp = window.I18N?.getSpecialtyName?.(basePkm.specialty) ?? (window.I18N?.text?.(basePkm.specialty || '樹果') ?? (basePkm.specialty || '樹果'));

    const growthCaps = _getGrowthCaps();
    const capLv = growthCaps.POKEMON_LEVEL_CAP || 70;
    const maxLv = growthCaps.THEORETICAL_MAX_LEVEL || 100;
    const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) || (typeof window !== 'undefined' && window.GAME_CONFIG);
    const growthMilestones = (gc && typeof gc.getGrowthMilestones === 'function')
      ? gc.getGrowthMilestones()
      : Array.from(new Set([30, 50, 60, capLv, 80, maxLv])).sort((a, b) => a - b);

    // 確定等級區間 (從個體當前等級至目標等級)
    const boxLevel = parseInt(targetPkm.level, 10) || 1;
    if (!growthState.fromLevel || growthState.fromLevel < 1) {
      growthState.fromLevel = boxLevel;
    }
    if (!growthState.targetLevel || growthState.targetLevel <= growthState.fromLevel) {
      let nextM = maxLv;
      for (const m of growthMilestones) {
        if (growthState.fromLevel < m) {
          nextM = m;
          break;
        }
      }
      growthState.targetLevel = nextM;
    }

    // 成長曲線乘數判定
    let curveMult = 1.0;
    if (growthState.customExpCurve === 'auto') {
      curveMult = detectPkmExpCurve(baseName);
    } else {
      curveMult = parseFloat(growthState.customExpCurve) || 1.0;
    }

    // 性格經驗修正判定
    let expMod = 'normal';
    if (growthState.customNatureExp === 'auto') {
      expMod = detectNatureExpMod(targetPkm.nature);
    } else {
      expMod = growthState.customNatureExp;
    }

    // 精算成長消耗
    const cost = calculateGrowthCost(growthState.fromLevel, growthState.targetLevel, curveMult, expMod);

    // 技能種子評估
    const subskillUpgrades = evaluateSubskillSeedUpgrades(targetPkm, basePkm);
    const mainskillROI = evaluateMainSkillSeedROI(targetPkm, basePkm);

    // 曲線標籤字串
    const curveKey = curveMult === 1.5
      ? 'lab.c_growth_curve_pseudo'
      : curveMult === 1.8
      ? 'lab.c_growth_curve_legendary'
      : curveMult === 3.0
      ? 'lab.c_growth_curve_mythical'
      : 'lab.c_growth_curve_standard';
    const curveLabel = window.I18N?.t?.(curveKey) ?? curveKey;

    // 性格 EXP 標籤字串
    const natureExpKey = expMod === 'up'
      ? 'lab.c_growth_exp_up'
      : expMod === 'down'
      ? 'lab.c_growth_exp_down'
      : 'lab.c_growth_exp_neutral';
    const natureExpLabel = window.I18N?.t?.(natureExpKey) ?? natureExpKey;

    const growthNatName = targetPkm.nature || '坦率';
    const growthNatDisp = window.I18N?.getNatureName?.(growthNatName) ?? (window.I18N?.text?.(growthNatName) ?? growthNatName);

    return `
      <div class="lab-growth-container">
        <!-- 頂部個體資訊橫幅 (Single Frame) -->
        <div class="lab-growth-header-card">
          <div class="lab-growth-target-summary">
            <div class="lab-growth-avatar-wrap">
              <img src="${avatarUrl}" class="lab-growth-avatar-img" width="52" height="52" alt="${escapeHtml(pDisplayName)}" loading="lazy" decoding="async">
            </div>
            <div class="lab-growth-target-info">
              <div class="lab-growth-target-name-row">
                <span class="lab-growth-target-name">${escapeHtml(pDisplayName)}</span>
                ${targetPkm.nickname ? `<span class="lab-growth-target-badge">${escapeHtml(targetPkm.nickname)}</span>` : ''}
              </div>
              <div class="lab-growth-target-specs">
                <span>Lv.${targetPkm.level || 1}</span>
                <span>·</span>
                <span>${specDisp}</span>
                <span>·</span>
                <span>${escapeHtml(growthNatDisp)} (${natureExpLabel})</span>
              </div>
            </div>
          </div>
          <button type="button" class="lab-growth-change-btn" onclick="window.AppraisalLab.openGrowthPicker()">
            ${window.I18N?.t?.('lab.c_growth_change_pkm') ?? 'Change Pokémon'}
          </button>
        </div>

        <!-- 主面板網格 (2 欄並列) -->
        <div class="lab-growth-grid">
          <!-- 左欄：培育等級與資源消耗精算 -->
          <div class="lab-growth-card">
            <div class="lab-growth-card-title">
              <span>${window.I18N?.t?.('lab.c_growth_calc_title') ?? 'Level & Resource Calculator'}</span>
              <span style="font-size:12px;color:var(--text-secondary);font-weight:normal;">${curveLabel}</span>
            </div>

            <!-- 等級滑桿與區間控制 (min="2" max="100") -->
            <div class="lab-growth-level-control">
              <div class="lab-growth-range-display">
                <span class="lab-growth-range-label">${window.I18N?.t?.('lab.c_growth_from_level') ?? 'Current Level'}</span>
                <span class="lab-growth-range-val">Lv.${growthState.fromLevel}</span>
              </div>
              <input type="range" class="lab-growth-slider" min="1" max="${maxLv - 1}" value="${growthState.fromLevel}" oninput="window.AppraisalLab.setGrowthFromLevel(this.value)">

              <div class="lab-growth-range-display" style="margin-top:10px;">
                <span class="lab-growth-range-label">${window.I18N?.t?.('lab.c_growth_target_level') ?? 'Target Level'}</span>
                <span class="lab-growth-range-val">Lv.${growthState.targetLevel}</span>
              </div>
              <input type="range" class="lab-growth-slider" min="2" max="${maxLv}" value="${growthState.targetLevel}" oninput="window.AppraisalLab.setGrowthTargetLevel(this.value)">

              <!-- 里程碑快速按鈕 (setGrowthMilestone(30), setGrowthMilestone(50), setGrowthMilestone(60), setGrowthMilestone(70), setGrowthMilestone(80), setGrowthMilestone(100)) -->
              <div class="lab-growth-milestones-row">
                ${growthMilestones.map(m => `
                  <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === m ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(${m})">Lv.${m}</button>
                `).join('')}
              </div>
            </div>

            <!-- 消耗總結看板 -->
            <div class="lab-growth-cost-board">
              <div class="lab-growth-cost-cell">
                <div class="lab-growth-cost-label">${window.I18N?.t?.('lab.c_growth_req_candies') ?? 'Required Candies'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-candies">${cost.candiesNeeded.toLocaleString()} <span style="font-size:12px;color:var(--text-secondary);font-weight:normal;">${window.I18N?.t?.('lab.c_growth_exp_per_candy', { exp: cost.expPerCandy }) ?? `(${cost.expPerCandy} EXP/ea)`}</span></div>
              </div>
              <div class="lab-growth-cost-cell">
                <div class="lab-growth-cost-label">${window.I18N?.t?.('lab.c_growth_req_shards') ?? 'Required Dream Shards'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-shards">${cost.shardsNeeded.toLocaleString()}</div>
              </div>
              <div class="lab-growth-cost-cell" style="grid-column: 1 / -1;">
                <div class="lab-growth-cost-label">${window.I18N?.t?.('lab.c_growth_req_exp') ?? 'Cumulative Experience'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-exp">${cost.expNeeded.toLocaleString()} EXP</div>
              </div>
            </div>

            <!-- 萬能糖果換算列 -->
            <div class="lab-growth-handy-bar">
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${window.I18N?.t?.('lab.c_growth_handy_s') ?? 'Handy Candy S (+3)'}</span>
                <span class="lab-growth-handy-count">${window.I18N?.t?.('lab.c_growth_pcs', { count: cost.handyCandyS.toLocaleString() }) ?? `${cost.handyCandyS.toLocaleString()} pcs`}</span>
              </div>
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${window.I18N?.t?.('lab.c_growth_handy_m') ?? 'Handy Candy M (+20)'}</span>
                <span class="lab-growth-handy-count">${window.I18N?.t?.('lab.c_growth_pcs', { count: cost.handyCandyM.toLocaleString() }) ?? `${cost.handyCandyM.toLocaleString()} pcs`}</span>
              </div>
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${window.I18N?.t?.('lab.c_growth_handy_l') ?? 'Handy Candy L (+100)'}</span>
                <span class="lab-growth-handy-count">${window.I18N?.t?.('lab.c_growth_pcs', { count: cost.handyCandyL.toLocaleString() }) ?? `${cost.handyCandyL.toLocaleString()} pcs`}</span>
              </div>
            </div>
          </div>

          <!-- 右欄：技能種子效益精算 -->
          <div class="lab-growth-card">
            <div class="lab-growth-card-title">
              <span>${window.I18N?.t?.('lab.c_growth_seed_roi_title') ?? 'Skill Seeds ROI & Upgrade Analysis'}</span>
            </div>

            <!-- 1. 銀色技能種子區塊 -->
            <div class="lab-growth-seed-section">
              <div class="lab-growth-seed-title-row">
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${window.I18N?.t?.('lab.c_growth_sub_seed') ?? 'Sub Skill Seed'}</span>
                <span class="lab-growth-seed-badge lab-growth-seed-badge-silver">${window.I18N?.t?.('lab.c_growth_sub_seed_badge') ?? 'Sub-Skills'}</span>
              </div>
              ${subskillUpgrades.length === 0 ? `
                <div class="lab-growth-no-subskills">
                  ${window.I18N?.t?.('lab.c_growth_no_sub_upgrades') ?? 'lab.c_growth_no_sub_upgrades'}
                </div>
              ` : `
                <div class="lab-growth-subskill-list">
                  ${subskillUpgrades.map(u => `
                    <div class="lab-growth-subskill-row">
                      <div class="lab-growth-subskill-left">
                        <span class="lab-growth-subskill-from">${escapeHtml(u.fromDisplay)}</span>
                        <span class="lab-growth-arrow">-></span>
                        <span class="lab-growth-subskill-to">${escapeHtml(u.toDisplay)}</span>
                      </div>
                      <div class="lab-growth-pr-delta">
                        PR ${u.basePR} -> PR ${u.newPR} (+${u.deltaPR})
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- 2. 金色技能種子區塊 -->
            <div class="lab-growth-seed-section" style="margin-bottom:0;">
              <div class="lab-growth-seed-title-row">
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${window.I18N?.t?.('lab.c_growth_main_seed') ?? 'Main Skill Seed'}</span>
                <span class="lab-growth-seed-badge lab-growth-seed-badge-gold">${window.I18N?.t?.('lab.c_growth_main_seed_badge') ?? 'Main Skill'}</span>
              </div>
              <div class="lab-growth-mainskill-box">
                <div class="lab-growth-mainskill-header">
                  <span class="lab-growth-mainskill-name">${escapeHtml(mainskillROI.skillDisplay)}</span>
                  <span class="lab-growth-roi-pill lab-growth-roi-${mainskillROI.roiGrade.toLowerCase()}">${window.I18N?.t?.('lab.c_growth_roi_rating', { grade: mainskillROI.roiGrade }) ?? `ROI Rating: ${mainskillROI.roiGrade}`}</span>
                </div>
                <div class="lab-growth-mainskill-detail">
                  <span>${window.I18N?.t?.('lab.c_growth_cur_to_max') ?? 'Current Level -> Max'}</span>
                  <span class="lab-growth-mainskill-val">Lv.${mainskillROI.currentLevel} -> Lv.${mainskillROI.maxLevel}</span>
                </div>
                <div class="lab-growth-mainskill-detail">
                  <span>${window.I18N?.t?.('lab.c_growth_seeds_needed') ?? 'Seeds Needed to Max'}</span>
                  <span class="lab-growth-mainskill-val">${window.I18N?.t?.('lab.c_growth_seeds_unit', { count: mainskillROI.seedsNeeded }) ?? `${mainskillROI.seedsNeeded} Seeds`}</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);line-height:1.5;background:rgba(15,23,42,0.3);padding:8px 10px;border-radius:6px;">
                  ${escapeHtml(mainskillROI.recommendation)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function setGrowthTarget(uid) {
    growthState.selectedUid = uid;
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const target = userBox.find(p => p.uid === uid);
    if (target) {
      const caps = _getGrowthCaps();
      const capLv = caps.POKEMON_LEVEL_CAP || 70;
      const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
      const gc = (typeof globalThis !== 'undefined' && globalThis.GAME_CONFIG) || (typeof window !== 'undefined' && window.GAME_CONFIG);
      const milestones = (gc && typeof gc.getGrowthMilestones === 'function')
        ? gc.getGrowthMilestones()
        : Array.from(new Set([30, 50, 60, capLv, 80, maxLv])).sort((a, b) => a - b);

      growthState.fromLevel = parseInt(target.level, 10) || 1;
      let nextM = maxLv;
      for (const m of milestones) {
        if (growthState.fromLevel < m) {
          nextM = m;
          break;
        }
      }
      growthState.targetLevel = nextM;
    }
    updateLabUI();
  }

  function setGrowthFromLevel(val) {
    const caps = _getGrowthCaps();
    const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
    const num = Math.max(1, Math.min(maxLv - 1, parseInt(val, 10) || 1));
    growthState.fromLevel = num;
    if (growthState.targetLevel <= num) {
      growthState.targetLevel = Math.min(maxLv, num + 1);
    }
    updateLabUI();
  }

  function setGrowthTargetLevel(val) {
    const caps = _getGrowthCaps();
    const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
    const num = Math.max(2, Math.min(maxLv, parseInt(val, 10) || 30));
    growthState.targetLevel = num;
    if (growthState.fromLevel >= num) {
      growthState.fromLevel = Math.max(1, num - 1);
    }
    updateLabUI();
  }

  function setGrowthMilestone(target) {
    const caps = _getGrowthCaps();
    const maxLv = caps.THEORETICAL_MAX_LEVEL || 100;
    const tgt = Math.max(2, Math.min(maxLv, parseInt(target, 10) || 30));
    growthState.targetLevel = tgt;
    if (growthState.fromLevel >= tgt) {
      growthState.fromLevel = Math.max(1, tgt - 5);
    }
    updateLabUI();
  }

  function openGrowthPicker() {
    openLabPicker({ type: 'growth' });
  }

  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;
    const isMobileH5 = typeof document !== 'undefined' && (
      (typeof document.querySelector === 'function' && !!document.querySelector('.mobile-h5-app')) ||
      (document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app'))
    );
    const showControls = labState.editMode;

    const pokemons = window.allPokemons || (window.PokemonApp && (window.PokemonApp.allPokemons || (typeof window.PokemonApp.getPokemons === 'function' && window.PokemonApp.getPokemons()))) || [];
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    
    if (pokemons.length === 0) {
      targetElement.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">${window.I18N?.t?.('lab.c_loading_pokedex') ?? 'lab.c_loading_pokedex'}</div>`;
      return;
    }

    if (userBox.length === 0) {
      targetElement.innerHTML = `
        <div class="lab-box-empty-container" style="padding:48px 20px;text-align:center;color:var(--text-muted);">
          <div style="font-size:32px;margin-bottom:12px;opacity:0.8;">[!]</div>
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
            ${window.I18N?.t?.('lab.c_no_pokemon_box') ?? 'lab.c_no_pokemon_box'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);max-width:320px;margin:0 auto 18px;line-height:1.5;">
            ${window.I18N?.t?.('lab.c_register_first_desc') ?? 'lab.c_register_first_desc'}
          </div>
          <button type="button" class="btn-primary" onclick="if(window.switchMainTab)window.switchMainTab('box');" style="padding:8px 20px;border-radius:8px;font-size:13px;cursor:pointer;">
            ${window.I18N?.t?.('lab.c_go_to_box') ?? 'lab.c_go_to_box'}
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

    const currentPkm = findBasePkm(labState.selectedPkmId) || pokemons[0];
    // Spec icon helper reference for subviews: getSpecialtyIconHtml(currentPkm.specialty, 16)

    // Auto populate team if empty
    if (labState.teamSlots.every(s => !s) && userBox.length > 0) {
      autoOptimizeTeam(false);
    }

    targetElement.innerHTML = `
      <div class="appraisal-lab-seamless-view">
        ${!labState.editMode ? `
        <!-- 深度研究室 頂部子分頁導航 (Subnav Bar) -->
        <div class="lab-subnav-bar">
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'team' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('team')">
            <span class="lab-subtab-title">${window.I18N?.t?.('lab.c_subtab_team') ?? 'lab.c_subtab_team'}</span>
          </button>
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'compare' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('compare')">
            <span class="lab-subtab-title">${window.I18N?.t?.('lab.c_subtab_compare') ?? 'lab.c_subtab_compare'}</span>
          </button>
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'growth' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('growth')">
            <span class="lab-subtab-title">${window.I18N?.t?.('lab.c_subtab_growth') ?? 'lab.c_subtab_growth'}</span>
          </button>
        </div>
        ` : ''}

        <!-- 1. 幫手組隊子面板 (Team Builder & Simulator) -->
        <div id="lab-subpanel-team" class="lab-subpanel" style="${labState.currentSubTab === 'team' && !labState.editMode ? '' : 'display:none;'}">
          ${labState.currentSubTab === 'team' && !labState.editMode ? renderTeamBuilderView(userBox, pokemons, undefined, isMobileH5) : ''}
        </div>

        <!-- 2. 寶可夢對比子面板 (Side-by-Side Comparison) -->
        <div id="lab-subpanel-compare" class="lab-subpanel" style="${labState.currentSubTab === 'compare' ? '' : 'display:none;'}">
          ${labState.currentSubTab === 'compare' ? renderComparisonView(userBox, pokemons, undefined, isMobileH5) : ''}
        </div>

        <!-- 3. 培育精算子面板 (Growth & Seeds Calculator) -->
        <div id="lab-subpanel-growth" class="lab-subpanel" style="${labState.currentSubTab === 'growth' ? '' : 'display:none;'}">
          ${labState.currentSubTab === 'growth' ? renderGrowthView(userBox, pokemons, undefined, isMobileH5) : ''}
        </div>
      </div>
    `;

    if (labState.editMode) {
      if (typeof window !== 'undefined' && typeof window.setupCustomSelect === 'function') {
        ['lab-nature-select', 'lab-ribbon-select', 'lab-mainskill-select'].forEach(id => {
          const el = targetElement.querySelector('#' + id);
          if (el && !el._customized) {
            window.setupCustomSelect(el);
          }
        });
      }
      initLabPokemonCombobox(pokemons, currentPkm);
    }
  }

  function onPkmChange(pkmId) {
    labState.selectedPkmId = pkmId;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onLevelChange(val, isLiveDragging = false) {
    labState.level = Math.max(1, Math.min(100, parseInt(val, 10) || 1));
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    const numInput = document.getElementById('lab-level-num-input');
    if (numInput && numInput.value != labState.level) {
      numInput.value = labState.level;
    }
    const slider = document.getElementById('lab-level-slider');
    if (slider && slider.value != labState.level) {
      slider.value = labState.level;
    }
    if (!isLiveDragging) {
      updateLabUI();
    }
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
  const AppraisalLab = {
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
    getSignatureRecipeRecommendations: getSignatureRecipeRecommendations,
    getRemainingEvolutions: getRemainingEvolutions,
    getRibbonBonus: getRibbonBonus,
    getEffectiveSkillLevel: getEffectiveSkillLevel,
    getPokemonEvolutionStage: getPokemonEvolutionStage,
    getSubskillLevelBonus: getSubskillLevelBonus,
    getMainSkillMaxLevel: getMainSkillMaxLevel,
    renderRadarChartSVG: renderRadarChartSVG,
    calculateMilestoneCost: calculateMilestoneCost,
    openModal: openAppraisalModal,
    closeModal: closeAppraisalModal,
    openCurrentEditModal: openCurrentEditModal,
    reopenAfterEdit: reopenAfterEdit,
    calculatePokemonComparisonPerformance: calculatePokemonComparisonPerformance,
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
    onSkillLevelChange: onSkillLevelChange,
    clearAllSubskills: clearAllSubskills,
    selectSubskillSlot: selectSubskillSlot,
    onSubskillSlotSelect: selectSubskillSlot,
    onSubskillChipSelect: onSubskillChipSelect,
    onPkmChange: onPkmChange,
    onLevelChange: onLevelChange,
    onNatureChange: onNatureChange,
    onRibbonChange: onRibbonChange,
    onSubskillChange: onSubskillChange,
    switchSubTab: switchSubTab,
    setTeamIsland: setTeamIsland,
    setTeamSlot: setTeamSlot,
    clearTeamSlot: clearTeamSlot,
    clearAllTeamSlots: clearAllTeamSlots,
    autoOptimizeTeam: autoOptimizeTeam,
    setTeamStrategy: setTeamStrategy,
    setCookingType: setCookingType,
    setTargetRecipe: setTargetRecipe,
    rerollGreengrassBerries: rerollGreengrassBerries,
    getAllTargetRecipes: getAllTargetRecipes,
    findTargetRecipe: findTargetRecipe,
    setGreengrassBerry: setGreengrassBerry,
    setCompareSlot: setCompareSlot,
    clearCompareSlot: clearCompareSlot,
    swapCompareSlots: swapCompareSlots,
    setCompareBenchmarkLevel: setCompareBenchmarkLevel,
    openPicker: openLabPicker,
    closePicker: closeLabPicker,
    onPickerSelect: onPickerSelect,
    onRecipePickerSelect: onRecipePickerSelect,
    renderGrowthView: renderGrowthView,
    setGrowthTarget: setGrowthTarget,
    setGrowthFromLevel: setGrowthFromLevel,
    setGrowthTargetLevel: setGrowthTargetLevel,
    setGrowthMilestone: setGrowthMilestone,
    openGrowthPicker: openGrowthPicker,
    calculateGrowthCost: calculateGrowthCost,
    evaluateSubskillSeedUpgrades: evaluateSubskillSeedUpgrades,
    evaluateMainSkillSeedROI: evaluateMainSkillSeedROI,
    simulateTeamPerformance: simulateTeamPerformance,
    toggleLab: function () {
      if (typeof document === 'undefined') return;
      const container = document.getElementById('appraisal-lab-container');
      if (container) {
        const isHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
        const willOpen = isHidden;
        if (typeof window !== 'undefined' && typeof window.switchBoxSubtab === 'function') {
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

  if (typeof window !== 'undefined') {
    window.AppraisalLab = AppraisalLab;
    window.openAppraisalModal = openAppraisalModal;
    window.closeAppraisalModal = closeAppraisalModal;
    window.openCurrentEditModal = openCurrentEditModal;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppraisalLab;
  }
})();