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
    if (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.getMainSkillMaxLevel === 'function') {
      return window.UserBox.getMainSkillMaxLevel(name);
    }
    if (!name) return 7;
    const clean = String(name).trim();
    if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) return 8;
    if (clean.includes('能量填充') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘')) return 7;
    if (clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物')) return 7;
    if (clean.includes('料理強化') || clean.includes('Cooking Power') || clean.includes('負電') || clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') || clean.includes('揮指') || clean.includes('十項全能') || clean.includes('Metronome') || clean.includes('變身') || clean.includes('模仿') || clean.includes('幫手支援') || clean.includes('Helper Support')) return 7;
    return 6;
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

    const maxLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    return Math.min(maxLvl, Math.max(1, effective));
  }

  function getRemainingEvolutions(pkm) {
    if (!pkm) return 0;
    const isFinal = pkm.is_final === '〇' || pkm.is_final === 'O' || pkm.is_final === 'o' || pkm.is_final === true || pkm.is_final === '1';
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

  /* ─── 食材名稱官方正規化與別名對照 (Ingredient Normalization Engine) ─── */
  const ING_ALIASES = {
    '蘋果': '特選蘋果', '特選蘋果': '特選蘋果', 'fancy apple': '特選蘋果', 'apple': '特選蘋果',
    '牛奶': '哞哞鮮奶', '鮮奶': '哞哞鮮奶', '哞哞鮮奶': '哞哞鮮奶', 'moomoo milk': '哞哞鮮奶', 'milk': '哞哞鮮奶',
    '大豆': '萌綠大豆', '萌綠大豆': '萌綠大豆', 'greengrass soybeans': '萌綠大豆', 'soybeans': '萌綠大豆', 'soybean': '萌綠大豆',
    '蜂蜜': '甜甜蜜', '甜甜蜜': '甜甜蜜', 'honey': '甜甜蜜',
    '香腸': '豆製肉', '豆製肉': '豆製肉', 'bean sausage': '豆製肉', 'sausage': '豆製肉',
    '生薑': '暖暖薑', '生姜': '暖暖薑', '暖暖薑': '暖暖薑', '暖暖生薑': '暖暖薑', 'warming ginger': '暖暖薑', 'ginger': '暖暖薑',
    '番茄': '好眠番茄', '好眠番茄': '好眠番茄', 'snoozy tomato': '好眠番茄', 'tomato': '好眠番茄',
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


  /* ─── 核心評估演算法 (單一維度/等級計算核心) ──────────── */
  function evaluateSingle(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, isPotential, cleanseMint) {
    if (!pkmData) return null;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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
    let gradeTitle = isEN ? 'Solid Choice' : '實用良品 (Solid Choice)';
    let gradeColor = '#10b981';
    if (compositeScore >= 98) {
      grade = 'SSS';
      gradeTitle = isEN ? 'Apex God' : '神級天花板 (Apex God)';
      gradeColor = '#f43f5e';
    } else if (compositeScore >= 95) {
      grade = 'SS';
      gradeTitle = isEN ? 'Mythic Tier' : '極品畢業 (Mythic Tier)';
      gradeColor = '#8b5cf6';
    } else if (compositeScore >= 90) {
      grade = 'S';
      gradeTitle = isEN ? 'Top Tier' : '頂級戰力 (Top Tier)';
      gradeColor = '#f59e0b';
    } else if (compositeScore >= 80) {
      grade = 'A';
      gradeTitle = isEN ? 'Strong Pick' : '強力主力 (Strong Pick)';
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
          ? 'Perfectly synergizes with "Berry Burst"! "Berry Finding S" increases base helps by +1 berry while main skill unleashes massive team berry bursts, forming an elite island pusher (maximize yields via regular collection).'
          : '完美契合「樹果遽增」機制！具備「樹果數量S」能在常態幫忙中額外產出樹果，同時透過主技能引爆全隊樹果能量，為島嶼衝分第一梯隊打手！（勤勞清包收益最大化）');
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
          ? 'Equipped with "Berry Finding S" for high-strength hybrid berry output (ensure frequent collection to avoid bag overflow blocking skill procs).'
          : '具備「樹果數量S」解鎖高額樹果副輸出，兼顧單兵直傷與產果（需留意及時清包避免阻斷主技能判定）。');
      } else if (isExtraTasty || isPotExpander || isDreamShard || pkmName.includes('咚咚鼠') || pkmName.includes('Dedenne') || pkmName.includes('磁怪') || pkmName.includes('Magne') || pkmName.includes('喵喵') || pkmName.includes('Meowth')) {
        cons.push(isEN
          ? '[!] Tactical skill specialist; "Berry Finding S" causes early bag overflow and blocks main skill checks.'
          : '[!] 純戰術型技能寶可夢持有上限較低，擁有「樹果數量S」容易過早滿包限制主技能判定。');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        const hasCarryBuff = activeSubskills.some(s => s.includes('持有上限') || s.includes('Inventory Up'));
        if (hasCarryBuff) {
          pros.push(isEN
            ? 'Features "Berry Finding S" backed by Inventory Up, providing bonus berry value without hurting ingredient capacity.'
            : '具備「樹果數量S」並搭配「持有上限提升」，兼顧穩定副產能且不易過早滿包。');
        } else {
          cons.push(isEN
            ? '[-] "Berry Finding S" on ingredient specialist without Inventory Up causes rapid overflow, blocking ingredient drops during sleep.'
            : '[-] 食材型持有「樹果數量S」但缺乏「持有上限提升」，易在離線期間快速滿包並提前進入偷吃樹果狀態阻斷產料。');
        }
      } else {
        pros.push(isEN
          ? 'Equipped with active God-tier sub-skill "Berry Finding S", +1 berry per help.'
          : '擁有已解鎖神技「樹果數量S」，樹果產能躍升 +1 個。');
      }
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      const hasHB = activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1;
      const hasSpeedM = activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1;
      if (hasHB && hasSpeedM && nature.buffType === 'speed') {
        pros.push(isEN
          ? 'Features extreme speed kit (Helping Bonus + Helping Speed M + Speed Up Nature), qualifying as a viable core support.'
          : '具備「幫手獎勵 + 幫忙速度M + 加幫速性格」之極限幫速配置，成功特例躋身主力行列！');
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
          ? 'Lv.30 unlocks the most valuable ingredient "Slowpoke Tail", fulfilling primary strategic unlock mission!'
          : 'Lv.30 解鎖遊戲最頂級食材「美味尾巴」，達成呆呆獸家族首要戰略解鎖使命！');
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
        ? 'Features active "Ingredient Finder M", greatly stabilizing ingredient supply.'
        : '具備已解鎖「食材機率提升M」，大幅提升料理食材供貨穩定度。');
    }

    const hasSkillMInTotal = activeSubskills.indexOf('技能機率提升M') !== -1 || activeSubskills.indexOf('Skill Trigger M') !== -1;
    if (hasSkillMInTotal) {
      if (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') {
        pros.push(isEN
          ? 'Features active "Skill Trigger M", significantly raising main skill activation frequency.'
          : '擁有已解鎖「技能機率提升M」，主技能發動頻率顯著提高。');
      } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
        if (pkmData.main_skill && (pkmData.main_skill.includes('食材') || pkmData.main_skill.includes('Ingredient'))) {
          pros.push(isEN
            ? 'Unlocked "Skill Trigger M" synergizes with ingredient-fetching main skill for bonus food supplies.'
            : '具備已解鎖「技能機率提升M」，輔助觸發食材獲取主技能，提供額外料理補給。');
        }
      }
    }

    if (activeSubskills.indexOf('幫手獎勵') !== -1 || activeSubskills.indexOf('Helping Bonus') !== -1) {
      pros.push(isEN
        ? 'Features active top-tier team aura "Helping Bonus", reducing team helping time by 5%.'
        : '具備已解鎖全隊頂級光環「幫手獎勵」，全員幫忙時間縮短 5%（相當於全隊淨產能大幅提升）。');
    }

    if (activeSubskills.indexOf('幫忙速度M') !== -1 || activeSubskills.indexOf('Helping Speed M') !== -1) {
      pros.push(isEN
        ? 'Features active "Helping Speed M", shortening self helping interval by 14%.'
        : '擁有已解鎖「幫忙速度M」，自身幫忙間隔縮短 14%。');
    }

    if (skillLevel >= 6 && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(isEN
        ? `High Main Skill Level (Lv.${skillLevel}), maximizing main skill trigger output.`
        : `主技能等級達到 Lv.${skillLevel}，技能單次發動效益已達極限。`);
    }

    if (nature.buffType === 'speed') {
      if ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') && natureName === '固執') {
        pros.push(isEN
          ? 'Nature "Adamant" is the #1 God nature for Berry specialists (Speed of Help ▲ +10%, Ingredient Finding ▼ converts help cycles directly into berry output).'
          : '性格「固執」為樹果型第一神性格（幫忙速度▲ +10%，食材發現率▼ 進一步轉化樹果產量）。');
      } else {
        pros.push(isEN
          ? `Nature "${natDisplayName}" provides Speed of Help ▲ (+10%), boosting all production.`
          : '性格「' + natureName + '」帶來幫忙速度▲ (+10%)，強化所有產出判定。');
      }
    } else if (nature.debuffType === 'speed') {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Speed of Help ▼ (-7.5%), severely impacting output.`
        : '[-] 性格「' + natureName + '」幫忙速度▼ (-7.5%)，對全方位產出有顯著負面影響。');
    }

    if (nature.buffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(isEN
        ? `Nature "${natDisplayName}" perfectly synergizes with Ingredient specialty (Ingredient Finder ▲ +20%).`
        : '性格「' + natureName + '」完美契合食材型專長 (食材發現率▲ +20%)。');
    } else if (nature.debuffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Ingredient Finding ▼ (-20%), severely weakening specialty advantage (disqualification flaw).`
        : '[-] 致命缺陷：性格「' + natureName + '」導致食材發現率▼ (-20%)，產料嚴重不足，建議換糖回收。');
    }

    if (nature.buffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(isEN
        ? `Nature "${natDisplayName}" perfectly matches Skill specialty (Main Skill Trigger ▲ +20%).`
        : '性格「' + natureName + '」完美契合技能型專長 (主技能發動率▲ +20%)。');
    } else if (nature.debuffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      cons.push(isEN
        ? `[-] Nature "${natDisplayName}" reduces Main Skill Trigger ▼ (-20%), severely crippling skill output.`
        : '[-] 致命缺陷：性格「' + natureName + '」導致主技能發動率▼ (-20%)，嚴重閹割核心發動頻率。');
    }

    if (isMint) {
      pros.push(isEN
        ? `Cleanse Mint used: original nature "${natDisplayName}" neutralized to standard baseline.`
        : `已使用淨白薄荷：原性格「${natDisplayName}」個性效果已被中和消除。`);
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
              ? 'Pure mono-ingredient (AAA) configuration, maximizing targeted ingredient yield for top recipes.'
              : '具備極品純色 AAA 食材配置，特定食材產量高度集中，為頂級食材專精配置。');
          } else if (i0 !== i1 && i1 === i2) {
            pros.push(isEN
              ? 'Dual-ingredient (ABB) configuration, excellent mid-to-late game specialized output.'
              : '具備強勢 ABB 雙色食材配置，二階與三階食材量產能力卓越。');
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
        ? 'Active Inventory Up subskill prevents overnight inventory capping, sustaining ingredient and skill production.'
        : '具備已解鎖「持有上限提升」，大幅延長離線/睡眠產出時間，避免背包溢滿阻斷食材與技能。');
    }

    // 樹果遽增型特殊診斷 (未帶 BFS 時)
    if (isBerryBurst && !hasBFSInTotal) {
      pros.push(isEN
        ? 'Berry Burst Specialist: Main skill detonates instant berry energy for Snorlax (and copies teammate berries); 1.4x boosted during Buncha Berries events.'
        : '樹果遽增戰略型：主技能發動直接為卡比獸爆發樹果能量（並隨機獲取隊友樹果）；果實纍纍樹果週享有 1.4 倍加成！');
    }

    // 充能直傷型特殊診斷 (未帶 BFS 時)
    if (isCharge && !hasBFSInTotal) {
      pros.push(isEN
        ? 'High-Frequency Direct Charge: Pure skill build consistently fires Charge Strength throughout the day without inventory overflow risks.'
        : '高頻單兵充能直傷：正統純技能流派，全天穩定發動能量填充，無背包過早滿包阻斷技能之顧慮。');
    }

    // 傳說神獸特殊診斷
    if (isLegendary) {
      pros.push(isEN
        ? 'Legendary / Mythical Pokemon with signature mechanics, high base helping output and indispensable mono-type or domain tactical value.'
        : '傳說/幻之寶可夢專屬機制：素質基礎高，在特定同屬性純色隊或領域戰術中具備無可替代的戰略地位。');
    }

    // 料理大成功 (咚咚鼠)
    if (isExtraTasty) {
      pros.push(isEN
        ? 'Extra Tasty Specialist: Stacks dish critical success chance, tailor-made for exploding weekend master recipes.'
        : '料理大成功戰術手：疊加料理美味機率，專為週末大餐爆擊（數十萬能量突破）而生的高階戰略組件。');
    }

    // 料理擴鍋 (自爆磁怪)
    if (isPotExpander) {
      pros.push(isEN
        ? 'Cooking Power Up Specialist: Expands pot capacity to cook limit-breaking high-tier recipes.'
        : '料理擴鍋戰術手：突破鍋子容量上限，烹調極限大菜（如彈跳咖哩烏龍麵、採蜜巧克力格子鬆餅等大型食譜）不可或缺的擴容手。');
    }

    // 夢之碎片 (路卡利歐)
    if (isDreamShard) {
      pros.push(isEN
        ? 'Dream Shard Farmer: High shard acquisition yield, essential for Candy Boost weeks and late-game leveling.'
        : '夢之碎片收割手：高效獲取夢之碎片，為糖果強化週與後期高昂養成成本提供源源不絕的資金。');
    }

    // 食材獲取 (水伊布)
    if (isIngSkill) {
      pros.push(isEN
        ? 'Ingredient Stockpile Specialist: Rapidly restocks ingredient inventory to resolve cooking shortages.'
        : '應急食材庫存手：能高頻補充隨機食材庫存，化解大菜料理缺料危機。');
    }

    // 揮指隨機戰術 (波克基斯)
    if (isMetronome) {
      pros.push(isEN
        ? 'Metronome Specialist: Triggers unpredictable random skills with unmatched fun and high lucky ceilings.'
        : '隨機揮指戰術手：能隨機發動全遊戲主技能，具備極高趣味性與驚喜爆發上限。');
    }

    if (pros.length === 0) {
      pros.push(isEN
        ? 'Basic stats, suitable as a temporary placeholder.'
        : '數值平庸，適合作為過渡期日常隊伍替補成員。');
    }

    // 升級消耗計算
    const costTo30 = calculateMilestoneCost(currentLv, 30, nature);
    const costTo50 = calculateMilestoneCost(currentLv, 50, nature);
    const costTo60 = calculateMilestoneCost(currentLv, 60, nature);
    const costTo70 = calculateMilestoneCost(currentLv, 70, nature);
    const costTo80 = calculateMilestoneCost(currentLv, 80, nature);
    const costTo100 = calculateMilestoneCost(currentLv, 100, nature);

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
        to60: costTo60,
        to70: costTo70,
        to80: costTo80,
        to100: costTo100
      }
    };
  }


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

  function getSignatureRecipeRecommendations(ingredients, isEN) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) return '';
    const normIngs = Array.from(new Set(
      ingredients.map(function(item) {
        if (!item) return '';
        const raw = typeof item === 'string' ? item : (item.name || '');
        return normalizeIngName(raw);
      }).filter(Boolean)
    ));

    if (normIngs.length === 0) return '';

    const pool = (typeof window !== 'undefined' && window.ALL_TOP_CATEGORY_RECIPES && window.ALL_TOP_CATEGORY_RECIPES.length > 0)
      ? window.ALL_TOP_CATEGORY_RECIPES
      : (typeof window !== 'undefined' && Array.isArray(window.__RECIPES_CACHE__) && window.__RECIPES_CACHE__.length > 0)
        ? window.__RECIPES_CACHE__
        : TARGET_TOP_RECIPES;

    const cacheKey = (isEN ? '1:' : '0:') + pool.length + ':' + normIngs.join('|');
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

    let res = '';
    if (top2 && top2.name_cn !== top1.name_cn) {
      res = isEN
        ? `Target recipes: prime pipeline for "${top1.name_en}" & "${top2.name_en}".`
        : `直通頂尖料理『${top1.name_cn}』與『${top2.name_cn}』關鍵供料。`;
    } else {
      res = isEN
        ? `Target recipe: prime pipeline for "${top1.name_en}".`
        : `直通頂尖料理『${top1.name_cn}』關鍵供料。`;
    }
    _sigRecipeRecCache[cacheKey] = res;
    return res;
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
        return isEN
          ? 'Strategic Unlock Specialist: Lv.30 unlocks "Slowpoke Tail", fulfilling the primary strategic mission of unlocking the highest-energy ingredient in Pokémon Sleep! Direct pipeline for "Slowpoke Tail Pepper Salad" & "Grilled Tail Curry".'
          : '戰略解鎖專門手：Lv.30 精準解鎖「美味尾巴」，圓滿達成全遊戲最高能量食材之戰略開圖使命！直通頂尖料理『呆呆獸尾巴的胡椒沙拉』與『炙燒尾肉咖哩』關鍵供料，解鎖後可常駐作為後備庫存手。';
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

      const recipeSynergy = getSignatureRecipeRecommendations(ingArr, isEN);
      const recipePhrase = recipeSynergy ? ` ${recipeSynergy}` : '';

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
              ? `Top Hybrid Specialist: Active "Ingredient Finder M" backed by BFS and Inventory Up provides exceptional food yields with massive bonus berries.${recipePhrase}`
              : `極品雙修食材手！食材機率大幅提升搭配「樹果數量S」與「持有上限提升」，食材爆發力極強且兼顧頂級樹果副產能！${recipePhrase}`;
          } else {
            return isEN
              ? `High-Burst Hybrid: Excellent ingredient rate and BFS provide huge dual yield, but inventory caps fast overnight—collect regularly.${recipePhrase}`
              : `高爆發雙修型：食材機率優異並持有「樹果數量S」，但缺乏持有上限容易在睡眠期間提早滿包阻斷產料，建議勤勞收成。${recipePhrase}`;
          }
        }

        return isEN
          ? `Premier Kitchen Anchor! High ingredient finding rate ensures abundant cooking supply for top recipes.${recipePhrase}${ingSpreadDesc}`
          : `頂級食材供應中樞！高額食材發現率確保了穩定龐大的料理供應，做大菜的最佳後勤基石。${recipePhrase}${ingSpreadDesc}`;
      }

      if (!hasIngM_active && !hasIngS_active && buff !== 'ingredient') {
        if (hasIngM_future) {
          return isEN
            ? `Future Ingredient Prospect: Core "Ingredient Finder M" unlocks at Lv.${hasIngM_future.level}. Prioritize leveling to establish reliable kitchen supply.${recipePhrase}`
            : `潛力食材手：關鍵「食材機率提升M」將於 Lv.${hasIngM_future.level} 解鎖，建議優先培育升級以構築主力供貨能力。${recipePhrase}`;
        }
        if (hasSpeedM_active || buff === 'speed' || hasHB_active) {
          return isEN
            ? `Speed-Driven Producer: Lacks direct ingredient finder boost, but high helping speed compensates to provide acceptable general output.${recipePhrase}`
            : `幫速彌補型：雖缺乏直接食材機率提升，但憑藉優良的幫忙速度維持了合格的基礎供貨，適合作為實用過渡。${recipePhrase}`;
        }
        return isEN
          ? `Lacks Ingredient Output: Missing ingredient finder and speed boosts; yields are insufficient to sustain demanding high-tier dishes.${recipePhrase}`
          : `缺乏食材爆發力：前中期未持有食材機率加成或顯著幫速，產量難以滿足高階大型料理（如彈跳咖哩烏龍麵、大塊滿滿熱水沙拉等頂級大菜）的消耗需求。${recipePhrase}`;
      }

      return isEN
        ? `Solid Ingredient Provider: Steady supply for regular meals, serving reliably in daily cooking rotations.${recipePhrase}${ingSpreadDesc}`
        : `穩健食材供應手：供貨節奏穩定，足以勝任日常食譜輪替與食材儲備。${recipePhrase}${ingSpreadDesc}`;
    }

    return isEN
      ? `${currentGrade} Grade (${currentScore} pts) - Reliable team member with balanced baseline performance.`
      : `${currentGrade} 級（${currentScore}分）- 基礎素質均衡，適合作為隊伍實用成員。`;
  }

  /* ─── 對外入口：雙軌評級與里程碑評定 (Dual-Track Appraisal API) ─────── */
  const _evalPokemonCache = Object.create(null);
  let _evalPokemonCacheCount = 0;

  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients, ribbonLevel, skillLevel, cleanseMint) {
    if (!pkmData) return null;
    currentLv = parseInt(currentLv, 10) || 30;
    const isMint = !!(cleanseMint || (pkmData && (pkmData.cleanseMint || pkmData.mint)));
    const langKey = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function')
      ? window.I18N.getLanguage()
      : 'zh-TW';
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isCompact = width <= 250;
    const SIX_DIM_META = getSixDimMeta(isEN);
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

      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + dotR + '" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan x="' + lx.toFixed(1) + '" dy="' + (i === 0 ? '-2' : '0') + '" fill="var(--text-primary)" font-size="' + labelFontSize + '" font-weight="700">' + p.meta.label + '</tspan>' +
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
    const SIX_DIM_META = getSixDimMeta(isEN);
    const displayName = isEN ? (pkmData.name_en || pkmData.name_cn) : (pkmData.name_cn || pkmData.name_en);
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    // 遊戲同款性格展示排版 (In-Game Style Nature Display)
    const natureObj = NATURE_DATA.find(function(n) { return n.name === natureName || n.name_en === natureName; });
    let natureEffectHtml = '';
    if (isMint) {
      natureEffectHtml = `
        <div class="nature-effects-group">
          <div class="nature-effect-neutral nature-effect-mint">
            ${isEN ? 'Has no distinctive personality traits (Cleanse Mint used)' : '沒有性格帶來的特色（使用淨白薄荷消除個性效果）'}
          </div>
        </div>
      `;
    } else if (natureObj && natureObj.buff && natureObj.buff !== '無增減') {
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
    } else if (pkmData.specialty && (pkmData.specialty.includes('全能') || pkmData.specialty.includes('全部') || pkmData.specialty === 'All-Rounder' || pkmData.specialty.toLowerCase() === 'all')) {
      specClass = 'spec-all';
      specTypeLabel = isEN ? 'All-Rounder' : '全能型';
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

    if (isMobileH5) {
      modal.className = 'box-modal-backdrop modal-overlay appraisal-modal-backdrop mobile-modal-backdrop';
      modal.innerHTML = `
        <div class="box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
          <div class="sheet-drag-handle"></div>
          <div class="box-modal-header">
            <button type="button" class="box-modal-header-cancel" onclick="window.AppraisalLab.closeModal()">${isEN ? 'Close' : '關閉'}</button>
            <!-- 雙軌綜合評級徽章 (居中置於標題原位) -->
            <div class="appraisal-dual-verdict-column">
              <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};">
                <span class="pokedex-verdict-track-lbl" style="font-size:9.5px;color:#94a3b8;line-height:1;">${isEN ? 'Current' : '當前'}</span>
                <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:13px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:10px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
              </div>
              <div class="pokedex-header-verdict-badge potential-track">
                <span class="pokedex-verdict-track-lbl" style="font-size:8.5px;color:#64748b;line-height:1;">${isEN ? 'Max Lv' : '滿級'}</span>
                <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:9.5px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
              </div>
            </div>
            ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
              <button type="button" class="box-modal-header-confirm" onclick="window.AppraisalLab.openCurrentEditModal()">${isEN ? 'Edit' : '編輯'}</button>
            ` : `<span style="width:36px;"></span>`}
          </div>

          <div class="box-modal-body appraisal-modal-sheet-body">
            <!-- 寶可夢核心建構資訊 (純淨無外框容器，依據 Single Frame 原則) -->
            <div class="appraisal-h5-header-summary">
              <div class="appraisal-h5-profile-row" style="display:flex;align-items:center;gap:10px;">
                <div class="appraisal-h5-avatar-wrap">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                <div class="appraisal-h5-info-col">
                  <!-- Row 1: 寶可夢名稱 + 稱號 + 樹果 + 專長 + 睡飽飽獎章 -->
                  <div class="appraisal-h5-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="appraisal-h5-pkm-name font-bold">${displayName}</span>
                    ${nickname ? `<span class="appraisal-h5-nick">(${escapeHtml(nickname)})</span>` : ''}
                    <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                      ${berry.icon ? `<img src="${berry.icon}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                    </span>
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 18, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                    ${ribbonLevel > 0 ? `
                      <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:10.5px;font-weight:700;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" style="width:14px;height:14px;object-fit:contain;" alt="Ribbon" />
                        <span>+${evaluation.ribbonBonus.carry} ${isEN ? 'Carry' : '持有'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${isEN ? '-' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '% Spd' : '幫速 -' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '%'}` : ''}</span>
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
                    <span class="nature-capsule-tag">${isEN ? 'Nature' : '性格'}</span>
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
                      <span class="header-stat-k">${isEN ? 'Frequency' : '幫忙間隔'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-interval-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Carry' : '持有'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-carry-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Ing Rate' : '食材率'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${isEN ? 'Skill Rate' : '技能率'}</span>
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
              <h4 class="appraisal-section-heading">${isEN ? 'Specialty, Nature & Sub-Skill Synergy Analysis' : '專長與性格副技能協同點評'}</h4>
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
              <span class="appraisal-summary-label">${isEN ? 'Appraisal Note' : '智能簡評'}</span>
              <span class="appraisal-summary-text">${escapeHtml(summaryNote)}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      modal.className = 'appraisal-modal-backdrop';
      modal.innerHTML = `
        <div class="appraisal-modal-container">
          <!-- 頂部標題列 (高度加寬，垂直置中，整合雙軌評級與極簡關閉鈕) -->
          <div class="appraisal-modal-header">
            <div class="appraisal-header-title-group">
              <span class="appraisal-modal-badge">${isEN ? 'Diagnostic Report' : '深度能力診斷報告'}</span>
              <h2 class="appraisal-pokemon-title">
                ${nickname ? `<span class="appraisal-pokemon-nickname">${escapeHtml(nickname)}</span> <span class="appraisal-pokemon-base-name" style="font-size:0.85em;color:var(--text-secondary);font-weight:normal;">(${displayName})</span>` : displayName}
              </h2>
            </div>

            <div class="appraisal-header-actions">
              <!-- 雙軌綜合評級徽章 (對齊圖鑑彈窗風格，垂直置中，當前亮眼 + 滿級低調) -->
              <div class="appraisal-dual-verdict-column">
                <!-- 當前實力 (Current Level Rating) -->
                <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${isEN ? `Current Level Rating (Lv.${currentLv})` : `當前實力評級 (Lv.${currentLv})`}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${isEN ? 'Current' : '當前'}</span>
                  <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
                </div>
                <!-- 滿級潛力 (Max Potential Rating) -->
                <div class="pokedex-header-verdict-badge potential-track" title="${isEN ? 'Max Potential Rating (Lv.100)' : '畢業潛力評級 (Lv.100)'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${isEN ? 'Max Lv' : '滿級'}</span>
                  <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
                </div>
              </div>

              <!-- 編輯按鈕 (若來自倉庫) -->
              ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
                <button type="button" class="appraisal-edit-btn" onclick="window.AppraisalLab.openCurrentEditModal()" title="${isEN ? 'Edit Pokémon Stats' : '編輯寶可夢數值'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>${isEN ? 'Edit' : '編輯數值'}</span>
                </button>
              ` : ''}

              <!-- 極簡關閉按鈕 -->
              <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${isEN ? 'Close' : '關閉'}" aria-label="${isEN ? 'Close' : '關閉'}">
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
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                
                <!-- 樹果與專長 + 睡飽飽獎章 (與 H5 版本同排並行) -->
                <div class="appraisal-specialty-row" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;flex-wrap:wrap;">
                  <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                    ${berry.icon ? `<img src="${berry.icon}" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                  </span>
                  ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 22, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                  ${ribbonLevel > 0 ? `
                    <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:11.5px;font-weight:700;">
                      <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" style="width:16px;height:16px;object-fit:contain;" alt="Ribbon" />
                      <span>+${evaluation.ribbonBonus.carry} ${isEN ? 'Carry' : '持有'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${isEN ? '-' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '% Spd' : '幫速 -' + Math.round(evaluation.ribbonBonus.speedDiscount * 100) + '%'}` : ''}</span>
                    </div>
                  ` : ''}
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

                <!-- 基礎數值雙欄縱向列 (移動至副技能網格下方，緊湊整潔無溢出) -->
                <div class="appraisal-config-section appraisal-stats-section" style="margin-top:12px;width:100%;">
                  <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Frequency' : '幫忙間隔'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-interval">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Carry' : '持有'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-carry">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Ing Rate' : '食材率'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${isEN ? 'Skill Rate' : '技能率'}</span>
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
                <span class="appraisal-summary-label">${isEN ? 'Appraisal Note' : '智能簡評'}</span>
                <span class="appraisal-summary-text">${escapeHtml(summaryNote)}</span>
              </div>

              <!-- 下方：專長深度點評與優缺點 (在智能簡評下方，同樣長度) -->
              <div class="appraisal-analysis-card">
                <h4 class="appraisal-section-heading">${isEN ? 'Specialty & Synergy Analysis' : '專長與性格副技能協同點評'}</h4>
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

  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  const BERRY_VALUES_DATA = [
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

  const INGREDIENTS_ENERGY_MAP = {
    '特選蘋果': 90, 'Fancy Apple': 90,
    '哞哞鮮奶': 98, 'Moomoo Milk': 98,
    '萌綠大豆': 100, 'Greengrass Soybeans': 100,
    '甜甜蜜': 101, 'Honey': 101,
    '豆製肉': 103, 'Bean Sausage': 103,
    '暖暖薑': 109, 'Warming Ginger': 109,
    '好眠番茄': 110, 'Snoozy Tomato': 110,
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
      name: '白林原野',
      name_en: 'Snowdrop Tundra',
      color: '#38bdf8',
      image: 'assets/islands/hd/snowdrop.jpg',
      berries: ['柿仔果', '生薑果', '芭拉果'],
      types: ['一般', '冰', '惡'],
      desc: '喜愛樹果：一般、冰、惡 (2x 能量)'
    },
    {
      id: 'lapis',
      name: '拉碧絲湖畔',
      name_en: 'Lapis Lakeside',
      color: '#a855f7',
      image: 'assets/islands/hd/lapis.jpg',
      berries: ['榴石果', '芒念果', '櫻子果'],
      types: ['草', '超能', '格鬥'],
      desc: '喜愛樹果：草、超能、格鬥 (2x 能量)'
    },
    {
      id: 'powerplant',
      name: '發電廠',
      name_en: 'Old Gold Power Plant',
      color: '#eab308',
      image: 'assets/islands/hd/oldgold.jpg',
      berries: ['異奇果', '靛莓果', '檬果'],
      types: ['電', '鋼', '幽靈'],
      desc: '喜愛樹果：電、鋼、幽靈 (2x 能量)'
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
        const found = BERRY_VALUES_DATA.find(b => b.name === bName);
        return found ? found.type : '';
      }).filter(Boolean);
    }
    return island.types || [];
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
      if (Array.isArray(sGgBerries) && sGgBerries.length === 3) labState.greengrassBerries = sGgBerries;
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

  function getMainSkillMaxLvl(skillName) {
    if (!skillName) return 6;
    if (skillName.includes('能量充填') || skillName.includes('Charge Strength')) return 7;
    if (skillName.includes('食材獲取') || skillName.includes('Ingredient Magnet')) return 7;
    if (skillName.includes('食材精選') || skillName.includes('Ingredient Draw')) return 7;
    if (skillName.includes('夢之碎片') || skillName.includes('Dream Shard')) return 7;
    if (skillName.includes('料理等級') || skillName.includes('Cooking Power')) return 7;
    return 6;
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
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        window.showToast(isEN ? 'Pokémon updated successfully!' : '寶可夢數值已成功更新！');
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '找不到符合之寶可夢'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = matched.map(p => {
        const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
        const isSelected = p.id === currentPkm.id;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';
        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}" style="display:flex;align-items:center;gap:8px;padding:6px 10px;cursor:pointer;">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" style="width:28px;height:28px;object-fit:contain;" alt="${escapeHtml(pkmDisplayName)}" loading="lazy">
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

  /* ─── 雙重雷達圖渲染 (Dual Radar Chart SVG for Comparison) ─────────────── */
  function renderDualRadarChartSVG(scoresA, scoresB, nameA, nameB, width, height) {
    width = width || 360;
    height = height || 310;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const SIX_DIM_META = getSixDimMeta(isEN);
    const cx = width / 2;
    const cy = (height / 2) + 8;
    const r = Math.min(width * 0.34, height * 0.34);

    const scoreKeys = ['berry', 'ingredient', 'skill', 'speed', 'growth', 'roi'];
    const angles = SIX_DIM_META.map(function (m) { return m.angle; });

    // 5 圈同心正六角形網格
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(function (level) {
      const pts = angles.map(function (a) {
        const x = cx + (r * level) * Math.cos(a);
        const y = cy + (r * level) * Math.sin(a);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      return '<polygon points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
    }).join('');

    // 多邊形 A (Cyan)
    const ptsA = scoreKeys.map(function (k, i) {
      const s = Math.max(scoresA[k] || 20, 10);
      const ratio = Math.min(Math.max(s / 100, 0.1), 1.0);
      const x = cx + (r * ratio) * Math.cos(angles[i]);
      const y = cy + (r * ratio) * Math.sin(angles[i]);
      return { x, y, score: s };
    });
    const polygonAPts = ptsA.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');

    // 多邊形 B (Purple)
    const ptsB = scoreKeys.map(function (k, i) {
      const s = Math.max(scoresB[k] || 20, 10);
      const ratio = Math.min(Math.max(s / 100, 0.1), 1.0);
      const x = cx + (r * ratio) * Math.cos(angles[i]);
      const y = cy + (r * ratio) * Math.sin(angles[i]);
      return { x, y, score: s };
    });
    const polygonBPts = ptsB.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');

    const dotsA = ptsA.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#38bdf8" stroke="#0f172a" stroke-width="1" />`).join('');
    const dotsB = ptsB.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#c084fc" stroke="#0f172a" stroke-width="1" />`).join('');

    const labelsSvg = SIX_DIM_META.map(function (m, i) {
      const labelR = r + 24;
      const lx = cx + labelR * Math.cos(m.angle);
      const ly = cy + labelR * Math.sin(m.angle);
      const scoreA = scoresA[m.key] || 0;
      const scoreB = scoresB[m.key] || 0;
      let textAnchor = 'middle';
      if (Math.cos(m.angle) > 0.3) textAnchor = 'start';
      else if (Math.cos(m.angle) < -0.3) textAnchor = 'end';

      return `
        <text x="${lx.toFixed(1)}" y="${(ly - 6).toFixed(1)}" text-anchor="${textAnchor}" fill="#cbd5e1" font-size="11" font-weight="700">${m.label}</text>
        <text x="${lx.toFixed(1)}" y="${(ly + 8).toFixed(1)}" text-anchor="${textAnchor}" font-size="10" font-weight="800">
          <tspan fill="#38bdf8">${scoreA}</tspan> <tspan fill="#64748b">/</tspan> <tspan fill="#c084fc">${scoreB}</tspan>
        </text>
      `;
    }).join('');

    const legendSvg = `
      <g transform="translate(14, 18)">
        <rect x="0" y="0" width="10" height="10" rx="2" fill="#38bdf8" />
        <text x="14" y="9" fill="#38bdf8" font-size="11" font-weight="700">${escapeHtml(nameA || (isEN ? 'Pokémon A' : '選手 A'))}</text>
        <rect x="150" y="0" width="10" height="10" rx="2" fill="#c084fc" />
        <text x="164" y="9" fill="#c084fc" font-size="11" font-weight="700">${escapeHtml(nameB || (isEN ? 'Pokémon B' : '選手 B'))}</text>
      </g>
    `;

    return `
      <svg viewBox="0 0 ${width} ${height}" class="radar-svg-chart radar-dual-svg-chart" style="width:100%;max-width:${width}px;aspect-ratio:${width}/${height};overflow:visible;" xmlns="http://www.w3.org/2000/svg">
        ${legendSvg}
        ${gridPolygons}
        ${radialAxes}
        <polygon points="${polygonAPts}" fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" stroke-width="2.2" />
        <polygon points="${polygonBPts}" fill="rgba(168, 85, 247, 0.22)" stroke="#c084fc" stroke-width="2.2" />
        ${dotsA}
        ${dotsB}
        ${labelsSvg}
      </svg>
    `;
  }

  /* ─── 幫手隊伍效益模擬器 (Team Synergy & Output Simulator) ─────────────── */
  function simulateTeamPerformance(teamPokemonItems, islandId) {
    const island = LAB_ISLANDS.find(i => i.id === islandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(islandId);
    const favTypes = getIslandFavoredTypes(islandId);

    let totalDailyBerryEnergy = 0;
    let totalDailySkillProcs = 0;
    let totalDailyIngredientsCount = 0;
    const ingredientsMap = {};
    let helpingBonusCount = 0;
    let sleepExpBonusCount = 0;
    let energyRecoveryBonusCount = 0;
    let researchExpBonusCount = 0;
    let dreamShardBonusCount = 0;
    let hasHealer = false;

    const validItems = (teamPokemonItems || []).filter(Boolean);

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
      if (skill.includes('活力療癒') || skill.includes('能量充填') || skill.includes('Energizing')) {
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
      const isFavored = favBerries.includes(berryName) || favTypes.includes(berryType);

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

      const bValueObj = (typeof BERRY_VALUES_DATA !== 'undefined' ? BERRY_VALUES_DATA : []).find(b => b.name === berryName);
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

      return {
        item,
        base,
        level,
        isFavored,
        effectiveInterval,
        dailyHelps,
        dailyBerryEnergy,
        dailySkillProcs: dailySkillProcs.toFixed(1)
      };
    });

    let targetRecipeAnalysis = null;
    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
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
      targetRecipeAnalysis = {
        recipe: targetRecipe,
        items,
        overallFulfillmentPct,
        isFullySatisfied: items.every(i => i.teamYield >= i.dailyDemand)
      };
    }

    return {
      island,
      totalDailyBerryEnergy,
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
      const isFavored = favBerries.includes(berryName) || favTypes.includes(berryType);

      const subs = Array.isArray(item.subskills) ? item.subskills : [];
      const isMint = !!(item.cleanseMint || item.mint);
      const nat = isMint ? null : NATURE_DATA.find(n => n.name === item.nature);

      const spec = base.specialty || '';
      const isBerrySpec = spec.includes('樹果') || spec === 'Berries';
      const isIngSpec = spec.includes('食材') || spec === 'Ingredients';
      const isSkillSpec = spec.includes('技能') || spec === 'Skills';

      const mainSkill = (base.main_skill || (base.skill && base.skill.name)) || item.main_skill || '';
      const isHealer = mainSkill.includes('活力療癒') || mainSkill.includes('活力全體療癒') || mainSkill.includes('Energy for Everyone');

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
      return sk.includes('活力療癒') || sk.includes('活力全體療癒') || sk.includes('Energy for Everyone');
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

  const ALL_BERRY_NAMES = [
    '桃桃果', '橙橙果', '櫻子果', '零餘果', '木子果', '蘋野果',
    '藍橘果', '墨莓果', '文柚果', '利歐果', '金枕果', '勿忘果',
    '柿仔果', '椰木果', '異奇果', '番荔果', '芭亞果', '芒芒果'
  ];

  function rerollGreengrassBerries(autoBuild = false) {
    const pool = ALL_BERRY_NAMES.slice();
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
          const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
          window.showToast(isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！');
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

  const CANONICAL_INGREDIENTS = [
    '特選蘋果', '哞哞鮮奶', '萌綠大豆', '甜甜蜜', '豆製肉',
    '暖暖薑', '好眠番茄', '特選蛋', '純粹油', '窩心洋芋',
    '火辣香草', '萌綠玉米', '放鬆可可', '醒腦咖啡豆', '嫩亮酪梨',
    '品鮮蘑菇', '粗枝大蔥', '沉甸甸南瓜', '美味尾巴'
  ];

  function openLabPicker(opts) {
    activePickerState = opts || {};
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

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
      let currentRecipeCategoryFilter = 'all';
      let currentRecipeIngFilter = 'all';

      function generateRecipeItemsHtml(query = '') {
        const q = (query || '').trim().toLowerCase();
        const filtered = allRecipesList.filter(r => {
          const nameCn = (r.name_cn || r.name || '').toLowerCase();
          const nameEn = (r.name_en || '').toLowerCase();
          const cat = (r.category || '').toLowerCase();

          if (currentRecipeCategoryFilter === 'curry' && !cat.includes('咖哩') && !cat.includes('curry') && !cat.includes('濃湯') && !cat.includes('stew')) return false;
          if (currentRecipeCategoryFilter === 'salad' && !cat.includes('沙拉') && !cat.includes('salad')) return false;
          if (currentRecipeCategoryFilter === 'dessert' && !cat.includes('甜') && !cat.includes('點心') && !cat.includes('dessert') && !cat.includes('飲料') && !cat.includes('drink')) return false;

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
          return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching recipes found' : '未找到符合條件的料理'}</div>`;
        }

        return filtered.map(r => {
          const rNameCn = r.name_cn || r.name || '';
          const isSelected = (rNameCn === currentTargetName || r.name === currentTargetName);
          const ings = Array.isArray(r.ingredients) ? r.ingredients : [];
          const cat = (r.category || '').toLowerCase();
          let catClass = 'lab-recipe-cat-curry';
          if (cat.includes('沙拉') || cat.includes('salad')) catClass = 'lab-recipe-cat-salad';
          else if (cat.includes('甜') || cat.includes('點心') || cat.includes('dessert') || cat.includes('飲料') || cat.includes('drink')) catClass = 'lab-recipe-cat-dessert';

          const ingsHtml = ings.map(ing => {
            const iDisp = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
            const iconUrl = ing.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ing.name) : '');
            return `
              <span class="lab-recipe-ing-chip" title="${escapeHtml(iDisp)} x${ing.count}">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-recipe-ing-icon" alt="${escapeHtml(iDisp)}">` : ''}
                <span class="lab-recipe-ing-count">x${ing.count}</span>
              </span>
            `;
          }).join('');

          return `
            <div class="lab-recipe-card ${catClass} ${isSelected ? 'selected' : ''}" onclick="window.AppraisalLab.onRecipePickerSelect('${escapeHtml(rNameCn)}')">
              ${isSelected ? `<span class="lab-recipe-active-badge">${isEN ? 'Current' : '當前目標'}</span>` : ''}
              <div class="lab-recipe-card-visual">
                ${r.icon ? `<img src="${r.icon}" class="lab-recipe-card-icon" alt="" loading="lazy">` : ''}
                ${r.pot_size ? `<span class="lab-recipe-card-pot">${r.pot_size}${isEN ? ' Pots' : '格'}</span>` : ''}
              </div>
              <div class="lab-recipe-card-ingredients">
                ${ingsHtml}
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

      const recipeIngChipsHtml = [
        `<button type="button" class="lab-picker-ing-chip-btn ${currentRecipeIngFilter === 'all' ? 'active' : ''}" data-recipe-ing="all" title="${isEN ? 'All Ingredients' : '全部食材'}"><span>${isEN ? 'All' : '全部'}</span></button>`,
        ...CANONICAL_INGREDIENTS.map(iName => {
          const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : iName;
          const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
          return `
            <button type="button" class="lab-picker-ing-chip-btn ${currentRecipeIngFilter === iName ? 'active' : ''}" data-recipe-ing="${escapeHtml(iName)}" title="${escapeHtml(iDisp)}">
              ${icon ? `<img src="${icon}" class="lab-picker-filter-ing-img" alt="${escapeHtml(iDisp)}">` : `<span>${escapeHtml(iDisp)}</span>`}
            </button>
          `;
        })
      ].join('');

      modal.innerHTML = `
        <div class="lab-picker-container lab-recipe-picker-container">
          <div class="lab-picker-header">
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
              <span>${isEN ? 'Select Target Recipe' : '挑選目標料理 (深度研究室)'}</span>
              <span style="font-size:11px;color:var(--accent-color,#38bdf8);background:rgba(56,189,248,0.12);padding:1px 6px;border-radius:4px;">${allRecipesList.length} ${isEN ? 'Dishes' : '道料理'}</span>
            </div>
            <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="lab-picker-controls-section">
            <div class="lab-picker-search-bar">
              <input type="text" id="lab-picker-recipe-search" class="box-form-input" placeholder="${isEN ? 'Search recipe name or ingredient...' : '搜尋料理名稱或所需食材...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
              <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
                <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${isEN ? 'All' : '全部'} (${allRecipesList.length})</button>
                <button type="button" class="box-btn box-btn-secondary" data-filter="curry" style="padding:3px 10px;font-size:11px;">${isEN ? 'Curry' : '咖哩/濃湯'}</button>
                <button type="button" class="box-btn box-btn-secondary" data-filter="salad" style="padding:3px 10px;font-size:11px;">${isEN ? 'Salad' : '沙拉'}</button>
                <button type="button" class="box-btn box-btn-secondary" data-filter="dessert" style="padding:3px 10px;font-size:11px;">${isEN ? 'Dessert' : '點心/飲料'}</button>
              </div>
            </div>

            <div class="lab-picker-secondary-filters" style="margin-top:6px;">
              <div class="lab-picker-ing-filter-group" style="width:100%;">
                <span class="lab-picker-filter-label">${isEN ? 'Ingr:' : '食材:'}</span>
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
      ? (isEN ? `Select Member for Slot ${opts.slotIndex + 1}` : `挑選隊員 (隊員槽位 ${opts.slotIndex + 1})`)
      : (opts.type === 'growth'
        ? (isEN ? 'Select Pokémon for Growth & Seeds Calculation' : '挑選培育精算對象')
        : (isEN ? `Select Pokémon for Player ${compareLetter}` : `挑選選手 ${compareLetter}`));

    const berriesList = (typeof BERRY_VALUES_DATA !== 'undefined' ? BERRY_VALUES_DATA : []);

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
        const isFav = favBerries.includes(bName) || favTypes.includes(bType);

        const spec = (base && base.specialty) || '';
        if (currentFilter === 'fav' && !isFav) return false;
        if (currentFilter === 'berry' && !spec.includes('樹果') && spec !== 'Berries') return false;
        if (currentFilter === 'ingredient' && !spec.includes('食材') && spec !== 'Ingredients') return false;
        if (currentFilter === 'skill' && !spec.includes('技能') && spec !== 'Skills') return false;

        if (currentBerryFilter !== 'all' && bName !== currentBerryFilter) return false;

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
        return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching Pokémon found in Box' : '倉庫中未找到符合條件之寶可夢'}</div>`;
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
        const pDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
        const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
        const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';

        const isOccupied = occupiedInOtherSlot.has(item.uid);
        const isSel = (item.uid === currentSelectedUid);

        let clickAttr;
        if (isOccupied) {
          const toastMsg = isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！';
          clickAttr = `onclick="if(typeof window.showToast==='function')window.showToast('${toastMsg}');"`;
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
          const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : iName;
          const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
          return `
            <span class="lab-picker-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (isEN ? ' (Locked)' : ' (未解鎖)') : ''}">
              ${icon ? `<img src="${icon}" class="lab-picker-ing-icon" alt="${escapeHtml(iDisp)}">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
            </span>
          `;
        }).join('');

        return `
          <div class="lab-picker-card ${isSel ? 'selected' : ''} ${isOccupied ? 'occupied disabled' : ''} ${isFav ? 'fav' : ''}" data-uid="${item.uid}" ${clickAttr} title="${isOccupied ? (isEN ? 'Already in comparison' : '已在對比選手中') : escapeHtml(pDisplayName)}">
            ${isOccupied ? `<span class="lab-picker-occupied-badge">${isEN ? 'In Comparison' : '已在對比中'}</span>` : ''}
            <div class="lab-picker-main">
              <div class="lab-picker-avatar">
                <img src="${avatarUrl}" alt="${escapeHtml(pDisplayName)}" loading="lazy">
                <span class="lab-picker-lv">Lv.${item.level || 1}</span>
              </div>
              <div class="lab-picker-meta">
                <div class="lab-picker-sub">
                  ${berry.icon ? `<img src="${berry.icon}" class="lab-picker-berry" alt="Berry" title="${escapeHtml(berry.name || '')}">` : ''}
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

    const berryChipsHtml = [
      `<button type="button" class="lab-picker-berry-chip-btn ${currentBerryFilter === 'all' ? 'active' : ''}" data-berry="all" title="${isEN ? 'All Berries' : '全部樹果'}"><span>${isEN ? 'All' : '全部'}</span></button>`,
      ...berriesList.map(b => {
        const bDisp = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b.name) : b.name) : b.name;
        const tDisp = window.I18N ? window.I18N.getTypeName(b.type) : b.type;
        const bIcon = b.icon || '';
        return `
          <button type="button" class="lab-picker-berry-chip-btn ${currentBerryFilter === b.name ? 'active' : ''}" data-berry="${escapeHtml(b.name)}" title="${escapeHtml(bDisp)} (${escapeHtml(tDisp)})">
            ${bIcon ? `<img src="${bIcon}" class="lab-picker-filter-berry-img" alt="${escapeHtml(bDisp)}">` : `<span>${escapeHtml(bDisp)}</span>`}
          </button>
        `;
      })
    ].join('');

    const ingChipsHtml = [
      `<button type="button" class="lab-picker-ing-chip-btn ${currentIngFilter === 'all' ? 'active' : ''}" data-ing="all" title="${isEN ? 'All Ingredients' : '全部食材'}"><span>${isEN ? 'All' : '全部'}</span></button>`,
      ...CANONICAL_INGREDIENTS.map(iName => {
        const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : iName;
        const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
        return `
          <button type="button" class="lab-picker-ing-chip-btn ${currentIngFilter === iName ? 'active' : ''}" data-ing="${escapeHtml(iName)}" title="${escapeHtml(iDisp)}">
            ${icon ? `<img src="${icon}" class="lab-picker-filter-ing-img" alt="${escapeHtml(iDisp)}">` : `<span>${escapeHtml(iDisp)}</span>`}
          </button>
        `;
      })
    ].join('');

    modal.innerHTML = `
      <div class="lab-picker-container">
        <div class="lab-picker-header">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);">${title}</div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="lab-picker-controls-section">
          <div class="lab-picker-search-bar">
            <input type="text" id="lab-picker-search-input" class="box-form-input" placeholder="${isEN ? 'Search nickname or Dex No...' : '搜尋寶可夢暱稱或編號...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
            <div class="lab-picker-filter-chips" style="display:flex;gap:5px;flex-wrap:wrap;">
              <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 8px;font-size:11px;">${isEN ? 'All' : '全部'} (${userBox.length})</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="fav" style="padding:3px 8px;font-size:11px;">${isEN ? 'Favored' : '喜愛樹果'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="berry" style="padding:3px 8px;font-size:11px;">${isEN ? 'Berries' : '樹果型'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="ingredient" style="padding:3px 8px;font-size:11px;">${isEN ? 'Ingredients' : '食材型'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="skill" style="padding:3px 8px;font-size:11px;">${isEN ? 'Skills' : '技能型'}</button>
            </div>
          </div>

          <div class="lab-picker-secondary-filters">
            <div class="lab-picker-berry-filter-group" style="width:100%;">
              <span class="lab-picker-filter-label">${isEN ? 'Berry:' : '樹果:'}</span>
              <div class="lab-picker-berry-chips-scroll" id="lab-picker-berry-scroll">
                ${berryChipsHtml}
              </div>
            </div>
            <div class="lab-picker-ing-filter-group" style="width:100%;">
              <span class="lab-picker-filter-label">${isEN ? 'Ingr:' : '食材:'}</span>
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


  function renderGreengrassBerrySelect(idx, currentBerryName, isEN) {
    const optionsHtml = BERRY_VALUES_DATA.map(b => {
      const bDisp = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(b.name) : b.name) : b.name;
      const tDisp = window.I18N ? window.I18N.getTypeName(b.type) : b.type;
      const isSel = b.name === currentBerryName ? 'selected' : '';
      return `<option value="${escapeHtml(b.name)}" ${isSel}>${escapeHtml(bDisp)} (${tDisp})</option>`;
    }).join('');

    const bObj = BERRY_VALUES_DATA.find(b => b.name === currentBerryName) || BERRY_VALUES_DATA[0];

    return `
      <div class="lab-greengrass-berry-item">
        ${bObj && bObj.icon ? `<img src="${bObj.icon}" class="lab-berry-mini-icon" alt="Berry">` : ''}
        <select class="lab-select lab-berry-select" onchange="window.AppraisalLab.setGreengrassBerry(${idx}, this.value)">
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /* ─── 幫手組隊 HTML 產生器 (Team Builder View Renderer) ──────────────── */
  function renderTeamBuilderView(userBox, pokemons, isEN, isMobileH5) {
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
      const islName = isEN ? (isl.name_en || isl.name) : isl.name;
      return `
        <button type="button" class="lab-island-circle-btn ${isActive ? 'active' : ''}" style="${islImgUrl ? `background-image:url('${islImgUrl}');` : `background-color:${isl.color};`}${isActive ? `border-color:${isl.color};box-shadow:0 0 10px ${isl.color}99;` : ''}" onclick="window.AppraisalLab.setTeamIsland('${isl.id}')" title="${escapeHtml(islName)}">
          <span class="sr-only">${escapeHtml(islName)}</span>
        </button>
      `;
    }).join('');

    const favoredBerriesHtml = favBerries.map(bName => {
      const bObj = BERRY_VALUES_DATA.find(b => b.name === bName) || {};
      const bDisplayName = isEN ? (window.I18N && window.I18N.getBerryName ? window.I18N.getBerryName(bName) : bName) : bName;
      return `
        <span class="lab-favored-berry-icon-wrap" title="${escapeHtml(bDisplayName)}">
          ${bObj.icon ? `<img src="${bObj.icon}" class="lab-favored-berry-img" alt="${escapeHtml(bDisplayName)}">` : ''}
        </span>
      `;
    }).join('');

    const greengrassConfigHtml = isGreengrass ? `
      <div class="lab-greengrass-berries-config">
        <div class="lab-greengrass-berries-head">
          <div style="display:flex;flex-direction:column;gap:1px;">
            <span style="font-size:11.5px;font-weight:700;color:#22c55e;">${isEN ? 'Greengrass Favored Berries (Customizable):' : '萌綠之島本週喜愛樹果 (可自由自選):'}</span>
            <span style="font-size:10.5px;color:var(--text-muted);">${isEN ? 'Select 3 favored berries for this week (2x energy boost)' : '自選本週 3 種喜愛樹果，產能與推薦即時享有 2x 能量加成'}</span>
          </div>
          <div class="lab-greengrass-actions" style="display:flex;gap:5px;align-items:center;">
            <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.rerollGreengrassBerries(false)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries from 18' : '從 18 種樹果隨機刷新 3 種'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>${isEN ? 'Random Reroll' : '隨機擲骰'}</span>
            </button>
            <button type="button" class="box-btn box-btn-primary" onclick="window.AppraisalLab.rerollGreengrassBerries(true)" style="font-size:10.5px;padding:3px 7px;display:inline-flex;align-items:center;gap:3px;" title="${isEN ? 'Reroll 3 random berries and immediately auto-optimize team' : '隨機抽出 3 種樹果並立即自動推薦最佳陣容'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>${isEN ? 'Roll & Build' : '擲骰並自動配隊'}</span>
            </button>
          </div>
        </div>
        <div class="lab-greengrass-selects-row">
          ${[0, 1, 2].map(idx => renderGreengrassBerrySelect(idx, (labState.greengrassBerries && labState.greengrassBerries[idx]) || ['桃桃果', '橙橙果', '櫻子果'][idx], isEN)).join('')}
        </div>
      </div>
    ` : '';

    const targetRecipe = findTargetRecipe(labState.targetRecipeName);
    const targetRecipeDisplayName = isEN ? (targetRecipe.name_en || targetRecipe.name_cn) : (targetRecipe.name_cn || targetRecipe.name);
    const targetRecipeCategory = isEN
      ? (targetRecipe.category || 'Curry')
      : (targetRecipe.category || '咖哩');
    const isTargetRecipeStrategy = labState.teamStrategy === 'recipe';

    const teamVariablesBarHtml = `
      <div class="lab-team-config-col lab-team-config-panel">
        <div class="lab-team-config-group">
          <span class="lab-team-config-label">${isEN ? 'Team Focus:' : '隊伍類型:'}</span>
          <div class="lab-team-pills">
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'balanced' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('balanced')">${isEN ? 'Balanced' : '綜合隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'berries' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('berries')">${isEN ? 'Berries' : '樹果隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'ingredients' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('ingredients')">${isEN ? 'Ingredients' : '食材隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'skills' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('skills')">${isEN ? 'Skills' : '技能隊'}</button>
            <button type="button" class="lab-team-pill ${labState.teamStrategy === 'recipe' ? 'active' : ''}" onclick="window.AppraisalLab.setTeamStrategy('recipe')">${isEN ? 'Target Recipe' : '目標料理'}</button>
          </div>
        </div>

        ${isTargetRecipeStrategy ? `
          <div class="lab-team-config-group lab-target-recipe-config-group">
            <span class="lab-team-config-label">${isEN ? 'Target Dish:' : '目標料理:'}</span>
            <div class="lab-target-recipe-chip" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" title="${escapeHtml(targetRecipeDisplayName)} (${isEN ? 'Click to change' : '點擊更換'})">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-target-recipe-chip-icon" alt="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <span class="lab-target-recipe-chip-badge">${escapeHtml(targetRecipeCategory)}</span>
              <span class="lab-target-recipe-chip-btn">${isEN ? 'Change' : '更換'}</span>
            </div>
          </div>
        ` : `
          <div class="lab-team-config-group">
            <span class="lab-team-config-label">${isEN ? 'Cooking Goal:' : '料理種類:'}</span>
            <div class="lab-team-pills">
              <button type="button" class="lab-team-pill ${labState.cookingType === 'curry' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('curry')">${isEN ? 'Curry/Stew' : '咖哩/濃湯'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'salad' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('salad')">${isEN ? 'Salad' : '沙拉'}</button>
              <button type="button" class="lab-team-pill ${labState.cookingType === 'dessert' ? 'active' : ''}" onclick="window.AppraisalLab.setCookingType('dessert')">${isEN ? 'Dessert/Drinks' : '點心/飲料'}</button>
            </div>
          </div>
        `}
      </div>
    `;

    // ─── 全隊生效光環彙總列 (Team Shared Bonuses Summary Bar - Zero Glyphs/Icons) ─────────────
    const activeAuraChips = [];
    if (simulation.helpingBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-helping" title="${isEN ? 'Team Helping Speed +' + (simulation.helpingBonusCount * 5) + '%' : '全體幫手速度 +' + (simulation.helpingBonusCount * 5) + '%'}">
          <strong>${isEN ? 'Helping Bonus' : '幫手獎勵'}</strong> x${simulation.helpingBonusCount} (+${simulation.helpingBonusCount * 5}%)
        </span>
      `);
    }
    if (simulation.energyRecoveryBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-energy" title="${isEN ? 'Team Energy Recovery +' + (simulation.energyRecoveryBonusCount * 14) + '%' : '全體睡眠活力回復 +' + (simulation.energyRecoveryBonusCount * 14) + '%'}">
          <strong>${isEN ? 'Energy Recovery' : '活力回復獎勵'}</strong> x${simulation.energyRecoveryBonusCount} (+${simulation.energyRecoveryBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.sleepExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-sleepexp" title="${isEN ? 'Team Sleep EXP +' + (simulation.sleepExpBonusCount * 14) + '%' : '全體睡眠EXP +' + (simulation.sleepExpBonusCount * 14) + '%'}">
          <strong>${isEN ? 'Sleep EXP' : '睡眠EXP獎勵'}</strong> x${simulation.sleepExpBonusCount} (+${simulation.sleepExpBonusCount * 14}%)
        </span>
      `);
    }
    if (simulation.researchExpBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-researchexp" title="${isEN ? 'Research EXP +' + (simulation.researchExpBonusCount * 6) + '%' : '研究EXP +' + (simulation.researchExpBonusCount * 6) + '%'}">
          <strong>${isEN ? 'Research EXP' : '研究EXP獎勵'}</strong> x${simulation.researchExpBonusCount} (+${simulation.researchExpBonusCount * 6}%)
        </span>
      `);
    }
    if (simulation.dreamShardBonusCount > 0) {
      activeAuraChips.push(`
        <span class="lab-team-aura-chip chip-dreamshard" title="${isEN ? 'Dream Shards +' + (simulation.dreamShardBonusCount * 6) + '%' : '夢之碎片 +' + (simulation.dreamShardBonusCount * 6) + '%'}">
          <strong>${isEN ? 'Dream Shard' : '夢之碎片獎勵'}</strong> x${simulation.dreamShardBonusCount} (+${simulation.dreamShardBonusCount * 6}%)
        </span>
      `);
    }

    const teamAurasBarHtml = `
      <div class="lab-team-auras-col lab-team-auras-bar">
        <div class="lab-team-auras-label">
          <span>${isEN ? 'Team Shared Bonuses:' : '隊伍全體光環彙總:'}</span>
        </div>
        <div class="lab-team-auras-chips">
          ${activeAuraChips.length > 0 ? activeAuraChips.join('') : `<span class="lab-team-aura-chip empty">${isEN ? 'No team bonuses active (personal builds)' : '目前隊內無全體加成光環 (個人特化陣容)'}</span>`}
        </div>
      </div>
    `;

    // ─── 隊伍 5 個隊員卡片 (Pokémon Sleep App Style Compact 100% Width Rows) ─
    const slotsHtml = [0, 1, 2, 3, 4].map(idx => {
      const item = teamItems[idx];
      if (!item) {
        return `
          <div class="lab-team-slot-card lab-team-slot-empty" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })" title="${isEN ? 'Click to select team member' : '點擊挑選隊員'}">
            <div class="lab-slot-empty-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted);"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <span class="lab-slot-empty-text">${isEN ? 'Select Team Member' : '點擊挑選隊員'}</span>
            </div>
          </div>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const displayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
      const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
      const specialtyIconHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 15) : '';
      const rawSkill = (base && (base.main_skill || (base.skill && base.skill.name))) || item.main_skill || '';
      const skillName = rawSkill ? (window.I18N ? window.I18N.getMainSkillName(rawSkill) : rawSkill) : (isEN ? 'Skill' : '技能');
      const skillLv = item.skillLevel || item.mainSkillLevel || 1;
      const natureDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
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
            const iDisp = window.I18N ? window.I18N.getIngredientName(iName) : iName;
            const icon = window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(iName) : '';
            return `
              <div class="lab-slot-ing-chip ${!s.unlocked ? 'is-locked' : ''}" title="Lv.${s.req}: ${escapeHtml(iDisp)}${!s.unlocked ? (isEN ? ' (Locked)' : ' (未解鎖)') : ''}">
                ${icon ? `<img src="${icon}" class="lab-slot-ing-icon" alt="${escapeHtml(iDisp)}">` : `<span style="font-size:9px;color:var(--text-muted);">-</span>`}
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
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : a.name;
          return `
            <div class="lab-slot-aura-badge aura-active" title="Lv.${a.req} ${escapeHtml(sDisp)} · ${isEN ? 'Team Shared Bonus' : '全體隊伍加成'}">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
            </div>
          `;
        }).join('');
      } else if (lockedAuras.length > 0) {
        aurasHtml = lockedAuras.map(a => {
          const sDisp = window.I18N ? window.I18N.getSubSkillName(a.name) : a.name;
          return `
            <div class="lab-slot-aura-badge aura-locked" title="Lv.${a.req} ${escapeHtml(sDisp)} (${isEN ? 'Locked until Lv.' + a.req : '未解鎖 · Lv.' + a.req})">
              <span class="aura-name">${escapeHtml(sDisp)}</span>
              <span class="aura-tag">Lv.${a.req}</span>
            </div>
          `;
        }).join('');
      } else {
        aurasHtml = `
          <div class="lab-slot-aura-badge aura-none" title="${isEN ? 'Individual Specialist: Subskills focus on personal performance rather than whole team' : '個人特化專精：副技能均為個人加成，無全隊光環'}">
            <span class="aura-name">${isEN ? 'Solo Specialist' : '個人專精'}</span>
          </div>
        `;
      }

      return `
        <div class="lab-team-slot-card">
          <div class="lab-slot-main-row">
            <div class="lab-slot-identity-group">
              <div class="lab-slot-avatar-wrap">
                <img src="${avatarUrl}" class="lab-slot-avatar-img" alt="${escapeHtml(displayName)}" loading="lazy">
                <span class="lab-slot-lv-badge">Lv.${item.level || 1}</span>
              </div>
              <div class="lab-slot-name-col">
                <div class="lab-slot-name-row">
                  <span class="lab-slot-name">${escapeHtml(displayName)}</span>
                  ${item.nickname ? `<span class="lab-slot-nickname">(${escapeHtml(item.nickname)})</span>` : ''}
                </div>
                <div class="lab-slot-spec-left">
                  ${specialtyIconHtml}
                  <div class="lab-slot-berry-wrap ${isFav ? 'favored' : ''}" title="${escapeHtml(berry.name || '')}${isFav ? ' (2x)' : ''}">
                    ${berry.icon ? `<img src="${berry.icon}" class="lab-slot-berry-icon" alt="Berry">` : ''}
                    ${isFav ? `<span class="lab-slot-fav-badge">2x</span>` : ''}
                  </div>
                  <span class="lab-slot-nature-name">${escapeHtml(natureDisplayName)}${(item.cleanseMint || item.mint) ? ' (' + (isEN ? 'Mint' : '薄荷') + ')' : ''}</span>
                </div>
              </div>
            </div>
            <button type="button" class="box-btn box-btn-secondary lab-slot-replace-top-btn" onclick="window.AppraisalLab.openPicker({ type: 'team', slotIndex: ${idx} })">
              ${isEN ? 'Replace' : '更換'}
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
              ${simSlot ? `<span class="lab-slot-berry-pts" title="${isEN ? 'Daily berry energy' : '每日樹果能量'}">${simSlot.dailyBerryEnergy.toLocaleString()} <span style="font-size:9px;color:var(--text-muted);">${isEN ? 'pts' : '能量'}</span></span>` : ''}
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
      const iDisplayName = window.I18N ? window.I18N.getIngredientName(iName) : iName;
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
        : (isCookMatch ? '1px solid var(--accent-color, #38bdf8)' : '1px solid rgba(255,255,255,0.08)');
      const chipBg = isSurplusDaily
        ? 'rgba(34, 197, 94, 0.12)'
        : (isCookMatch ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)');
      const numColor = isSurplusDaily
        ? '#4ade80'
        : (isCookMatch ? '#38bdf8' : '#e2e8f0');

      return `
        <div style="display:inline-flex;align-items:center;gap:3px;background:${chipBg};border:${chipBorder};border-radius:4px;padding:1px 5px;font-size:10.5px;" title="${escapeHtml(iDisplayName)}${isSurplusDaily ? (isEN ? ' (Daily Self-Sufficient)' : ' (三餐自給充裕)') : (isCookMatch ? (isEN ? ' (Recipe Synergy)' : ' (料理契合)') : '')}">
          ${iconUrl ? `<img src="${iconUrl}" style="width:13px;height:13px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(iDisplayName)}">` : ''}
          <span style="color:${numColor};font-weight:700;">x${count}</span>
        </div>
      `;
    }).join('');

    // ─── 目標料理食材供需看板 (緊湊多欄 Grid 卡片矩陣) ────────────────────
    let supplyDemandBoardHtml = '';
    if (targetAnalysis && Array.isArray(targetAnalysis.items)) {
      const itemsHtml = targetAnalysis.items.map(item => {
        const iDisplayName = window.I18N ? window.I18N.getIngredientName(item.name) : item.name;
        const iconUrl = item.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(item.name) : '');
        const isSurplus = item.diff >= 0;
        const diffText = isSurplus ? `+${item.diff} ${isEN ? 'Surplus' : '充裕'}` : `${item.diff} ${isEN ? 'Deficit' : '缺口'}`;
        const diffClass = isSurplus ? 'lab-supply-surplus' : 'lab-supply-deficit';
        const barPct = Math.min(100, Math.max(0, item.fulfillmentPct));
        const barColor = item.fulfillmentPct >= 100 ? '#22c55e' : (item.fulfillmentPct >= 60 ? 'var(--accent-color, #38bdf8)' : '#f59e0b');

        return `
          <div class="lab-supply-row">
            <div class="lab-supply-row-top">
              <div class="lab-supply-col-ing">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-supply-ing-icon" alt="${escapeHtml(iDisplayName)}">` : ''}
                <span class="lab-supply-ing-name">${escapeHtml(iDisplayName)}</span>
              </div>
              <div class="lab-supply-col-diff">
                <span class="lab-supply-diff-badge ${diffClass}">${diffText}</span>
              </div>
            </div>
            <div class="lab-supply-row-mid">
              <span title="${isEN ? 'Single meal requirement' : '單餐需求'}">${isEN ? 'Meal:' : '每餐:'} <strong>x${item.perMeal}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${isEN ? 'Daily 3-meal total demand' : '每日 3 餐總需求'}">${isEN ? 'Daily:' : '日需:'} <strong>x${item.dailyDemand}</strong></span>
              <span class="lab-supply-mid-sep">·</span>
              <span title="${isEN ? 'Team estimated daily harvest' : '隊伍每日預估產出'}">${isEN ? 'Yield:' : '日產:'} <strong style="color:#22c55e;">x${item.teamYield}</strong></span>
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
        ? `<span class="lab-supply-overall-badge satisfied">[✓] ${isEN ? '100% Self-Sufficient' : '100% 達成 · 可完全自給自足'}</span>`
        : `<span class="lab-supply-overall-badge pending">${isEN ? `Overall: ${targetAnalysis.overallFulfillmentPct}%` : `全體達成率: ${targetAnalysis.overallFulfillmentPct}%`}</span>`;

      supplyDemandBoardHtml = `
        <div class="lab-recipe-supply-board" id="lab-team-recipe-supply-demand">
          <div class="lab-supply-board-header">
            <div class="lab-supply-board-title-group">
              ${targetRecipe.icon ? `<img src="${targetRecipe.icon}" class="lab-supply-dish-icon" alt="${escapeHtml(targetRecipeDisplayName)}" title="${escapeHtml(targetRecipeDisplayName)}">` : ''}
              <div>
                <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                  <span class="sr-only">${escapeHtml(targetRecipeDisplayName)}</span>
                  <span class="lab-supply-dish-badge">${escapeHtml(targetRecipeCategory)}</span>
                  ${targetRecipe.pot_size ? `<span class="lab-supply-dish-meta">${targetRecipe.pot_size} ${isEN ? 'Pots' : '格鍋容量'}</span>` : ''}
                  ${targetRecipe.base_energy ? `<span class="lab-supply-dish-meta">${targetRecipe.base_energy.toLocaleString()} ${isEN ? 'Base Energy' : '基礎能量'}</span>` : ''}
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:2px;">
                  ${isEN ? 'Target Recipe Ingredient Supply vs Daily Demand Dashboard (3 Meals/Day)' : '目標料理食材供需看板 · 精算每日 3 餐食材缺口與隊伍自給自足率'}
                </div>
              </div>
            </div>
            <div class="lab-supply-board-actions">
              ${overallStatusBadge}
              <button type="button" class="box-btn box-btn-secondary" onclick="window.AppraisalLab.openPicker({ type: 'recipe' })" style="font-size:10.5px;padding:3px 8px;display:inline-flex;align-items:center;gap:3px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                <span>${isEN ? 'Change Recipe' : '更換目標料理'}</span>
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
            <span class="lab-favored-label">${isEN ? 'Favored Berries (2x Power):' : '喜愛樹果 (2x 能量):'}</span>
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
          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${isEN ? 'Estimated Daily Total Energy' : '預估每日能量總產出'}</div>
            <div class="lab-metric-value">${simulation.totalDailyBerryEnergy.toLocaleString()} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${isEN ? 'pts/day' : '能量/日'}</span></div>
            <div class="lab-metric-sub">
              ${isEN ? `Calculated based on ${island.name_en || island.name} 2x berry energy bonus, helping speed, and subskill multipliers.` : `依據【${island.name}】喜愛樹果 2 倍能量加成、幫手速度與副技能協同倍率精確計算。`}
            </div>
          </div>

          <div class="lab-metric-card">
            <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);">${isEN ? 'Daily Ingredients Harvest' : '預估每日食材總產量'}</div>
            <div class="lab-metric-value" style="color:#22c55e;">${simulation.totalDailyIngredientsCount} <span style="font-size:12px;font-weight:600;color:var(--text-muted);">${isEN ? 'items/day' : '個/日'}</span></div>
            <div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px;">
              ${topIngsHtml || `<span style="font-size:10.5px;color:var(--text-muted);">${isEN ? 'No ingredients yet' : '尚無食材產出'}</span>`}
            </div>
          </div>
        </div>
      </div>
    `;
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

    // 依基準等級判定解鎖的副技能 (解鎖門檻: Lv.10, 25, 50, 75, 100)
    const unlockTiers = [10, 25, 50, 75, 100];
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

    const bValueObj = (typeof BERRY_VALUES_DATA !== 'undefined' ? BERRY_VALUES_DATA : []).find(b => b.name === (berry.name || ''));
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

  function formatSecsToMinSec(seconds, isEN) {
    if (!seconds) return '--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (isEN) return `${m}m ${s ? `${s}s` : ''}`.trim();
    return `${m}分${s ? `${s}秒` : ''}`;
  }

  /* ─── 寶可夢對比 HTML 產生器 (最多 3 位選手並排比較) ──────── */
  const COMPARE_COLORS = ['#38bdf8', '#c084fc', '#f59e0b'];
  const COMPARE_LETTERS = ['A', 'B', 'C'];
  const COMPARE_MAX = 3;

  function renderComparisonView(userBox, pokemons, isEN, isMobileH5) {
    if (userBox.length === 0) {
      return `<div style="padding:40px;text-align:center;color:var(--text-muted);">${isEN ? 'Please register Pokémon in Box first' : '請先在寶可夢倉庫新增寶可夢後再來對比！'}</div>`;
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
    const pLabel = p => `${isEN ? 'Player' : '選手'} ${p.letter}`;
    const unitIng = isEN ? 'items/day' : '顆/日';
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
              <span class="lab-compare-empty-text">${isEN ? `Pick Player ${letter}` : `挑選選手 ${letter}`}</span>
            </div>
            <div class="lab-compare-tap-hint">${isEN ? 'Tap to pick' : '點選挑選'}</div>
          </button>
        `;
      }

      const base = findBasePkm(item.pokemonId || item.name);
      const avatarUrl = (base && typeof window !== 'undefined' && typeof window.getItemIcon === 'function')
        ? window.getItemIcon(base)
        : ((base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || fallbackAvatar);
      const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
      const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 13) : '';
      const natDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
      const pkmDisplayName = (window.I18N && typeof window.I18N.getPokemonName === 'function') ? window.I18N.getPokemonName(item.pokemonId || (base && base.id), item.nickname || item.name) : (item.nickname || item.name);
      const effLevel = (currentBenchmark && currentBenchmark !== 'box') ? parseInt(currentBenchmark, 10) : (parseInt(item.level, 10) || 1);

      return `
        <div class="lab-compare-vs-player slot-${letter.toLowerCase()}" style="border-top-color:${color}; cursor:pointer;" onclick="window.AppraisalLab.openPicker({ type: 'compare', compareSlot: ${i} })">
          <div class="lab-compare-vs-header-top">
            <span class="lab-compare-slot-letter" style="background:${color};">${letter}</span>
            <button type="button" class="lab-compare-remove-btn" aria-label="${isEN ? 'Remove' : '移除'}" title="${isEN ? 'Remove' : '移除'}" onclick="event.stopPropagation(); window.AppraisalLab.clearCompareSlot(${i});">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="lab-compare-vs-avatar-wrap">
            <img src="${avatarUrl}" class="lab-compare-vs-avatar" alt="${isEN ? 'Player' : '選手'} ${letter}" loading="lazy">
            <span class="lab-compare-vs-lvl">Lv.${effLevel}</span>
          </div>
          <div class="lab-compare-micro-meta">
            ${specHtml}
            ${berry && berry.icon ? `<img src="${berry.icon}" class="lab-compare-mini-berry" alt="Berry" title="${escapeHtml(berry.name || '')}">` : ''}
            <span class="lab-compare-vs-tag nat-tag">${escapeHtml(natDisplayName)}</span>
          </div>
          <div class="lab-compare-tap-hint">${isEN ? 'Tap to change' : '點選更換'}</div>
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
        <span>${isEN ? `Selected ${N}/${COMPARE_MAX}. Tap a slot to change Pokémon (max 3, no duplicates).` : `已選 ${N}/${COMPARE_MAX} 位選手，點選卡片可更換寶可夢（最多3位，不可重複選擇同一隻）`}</span>
        ${N > 0 ? `<button type="button" class="box-btn box-btn-secondary" style="font-size:11px;padding:2px 8px;" onclick="[0,1,2].forEach(i=>window.AppraisalLab.clearCompareSlot(i));">${isEN ? 'Clear All' : '清空對比'}</button>` : ''}
      </div>
    `;

    // ── 基準等級切換橫列 ──
    const benchmarkLevels = [
      { id: 'box', label: isEN ? 'Box Lv' : '各自等級', title: isEN ? 'Use each Pokemon\'s box level' : '使用每隻寶可夢各自倉儲等級' },
      { id: '30', label: 'Lv.30', title: isEN ? 'Lv.30: Unlocks 2nd ingredient' : 'Lv.30：解鎖第2食材' },
      { id: '50', label: 'Lv.50', title: isEN ? 'Lv.50: Unlocks 3rd sub-skill' : 'Lv.50：解鎖第3副技能' },
      { id: '60', label: 'Lv.60', title: isEN ? 'Lv.60: Unlocks 3rd ingredient' : 'Lv.60：解鎖第3食材' },
      { id: '70', label: 'Lv.70', title: isEN ? 'Lv.70: Current in-game maximum level cap' : 'Lv.70：目前遊戲等級上限' },
      { id: '80', label: 'Lv.80', title: isEN ? 'Lv.80: Unlocks 4th sub-skill (Sim)' : 'Lv.80：解鎖第4副技能 (模擬)' },
      { id: '100', label: 'Lv.100', title: isEN ? 'Lv.100: Max level graduation with all 5 sub-skills' : 'Lv.100：五階滿等畢業 (全開模擬)' }
    ];
    const benchmarkBarHtml = `
      <div class="lab-compare-benchmark-row">
        <span class="lab-compare-benchmark-title">${isEN ? 'Benchmark Level:' : '基準等級:'}</span>
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
                <span>${isEN ? 'Daily Total Energy Output' : '每日預估總能量比較'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${isEN ? 'Select at least 2 Pokémon above to compare estimated daily energy output.' : '請在上方挑選至少 2 位選手進行每日預估總能量比較'}
            </div>
          </div>

          <div class="lab-compare-kpi-card" id="lab-compare-ingredients">
            <div class="lab-compare-kpi-head">
              <div class="lab-compare-kpi-title">
                <span>${isEN ? 'Daily Ingredient Yield Comparison' : '每日食材產量比較'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${isEN ? 'Select at least 2 Pokémon above to compare ingredient yields.' : '請在上方挑選至少 2 位選手進行每日食材產量比較'}
            </div>
          </div>

          <div class="lab-compare-kpi-card" id="lab-compare-skills">
            <div class="lab-compare-kpi-head">
              <div class="lab-compare-kpi-title">
                <span>${isEN ? 'Skill Procs, Speed & Specs' : '技能發動與幫手效能對照'}</span>
              </div>
            </div>
            <div class="lab-compare-empty-section-hint">
              ${isEN ? 'Select at least 2 Pokémon above to compare skill procs and helper speed.' : '請在上方挑選至少 2 位選手進行技能發動與幫手效能對照'}
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
      if (diff <= 0) return `<span class="lab-compare-kpi-badge tie">${isEN ? 'Tie' : '持平'}</span>`;
      const lead = activePlayers[sorted[0].i];
      const pct = sorted[1].v > 0 ? ((diff / sorted[1].v) * 100).toFixed(1) : null;
      return `<span class="lab-compare-kpi-badge" style="background:${lead.color}2e;color:${lead.color};border:1px solid ${lead.color}59;">${lead.letter} ${isEN ? 'Leads' : '領先'} +${formatDiff(diff)}${pct ? ` (${pct}%)` : ''}</span>`;
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
      num(isEN ? 'Est. Total Energy' : '每日總能量產出', x => x.totalDailyEnergy, true),
      num(isEN ? 'Berry Power' : '樹果強度能量', x => x.dailyBerryEnergy, true),
      num(isEN ? 'Ingredient Power' : '食材產出能量', x => x.totalDailyIngredientEnergy, true),
      num(isEN ? 'Skill Procs / Day' : '主技能期望次數', x => x.dailySkillProcs, true, v => `${v} ${isEN ? '/day' : '次/日'}`),
      num(isEN ? 'Help Interval' : '幫手週期間隔', x => x.effectiveInterval, false, v => formatSecsToMinSec(v, isEN)),
      {
        label: isEN ? 'Composite Tier' : '綜合戰力評價',
        vals: activePlayers.map(p => (p.evaluation ? p.evaluation.compositeScore : 0)),
        higher: true,
        texts: activePlayers.map(p => {
          const ev = p.evaluation;
          if (!ev) return '--';
          const grade = ev.grade || 'B';
          const score = ev.compositeScore || 70;
          return `<div style="display:flex;align-items:center;justify-content:center;gap:4px;"><span class="lab-grade-badge" style="background:${ev.gradeColor || '#38bdf8'}26;color:${ev.gradeColor || '#38bdf8'};border:1px solid ${ev.gradeColor || '#38bdf8'}59;padding:1px 6px;border-radius:4px;font-size:11px;font-weight:800;">${grade}</span><span style="font-size:11px;color:var(--text-secondary);font-weight:700;">${score}${isEN ? ' pts' : '分'}</span></div>`;
        })
      }
    ];

    const sixDimHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-sixdim">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title">
            <span>${isEN ? '6-Dimension Evaluation Matrix' : '六維綜合戰力評定對照'}</span>
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
          <div class="lab-compare-kpi-title"><span>${isEN ? 'Daily Total Energy Output' : '每日預估總能量比較'}</span></div>
          ${leadBadge(energyVals, d => fmt(d))}
        </div>
        ${barRowsHtml(energyVals, energyVals.map(v => `${fmt(v)}`))}
        ${tableHtml([
          num(isEN ? 'Berry Energy' : '樹果能量', x => x.dailyBerryEnergy, true),
          num(isEN ? 'Ingredient Energy' : '食材能量', x => x.totalDailyIngredientEnergy, true),
          num(isEN ? 'Skill Energy (Est)' : '主技能能量', x => x.dailySkillEnergy, true)
        ])}
      </div>`;

    // ── 3. 副技能與性格配置橫向對照 (Subskills & Nature Build Matchup) ──
    const unlockLevels = [10, 25, 50, 75, 100];
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
          const locName = (sName !== '--' && window.I18N) ? window.I18N.getSubSkillName(sName) : sName;
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

          return `<span class="lab-subskill-pill${isUnlocked ? '' : ' locked'}" style="${badgeStyle}" title="${isUnlocked ? '' : (isEN ? 'Locked at this level' : '當前等級未解鎖')}">${escapeHtml(locName)}${!isUnlocked && sName !== '--' ? ' [鎖]' : ''}</span>`;
        })
      };
    });

    const natureRow = {
      label: isEN ? 'Nature' : '性格配置',
      higher: null,
      vals: activePlayers.map(() => 0),
      texts: activePlayers.map(p => {
        const isMint = !!(p.item.cleanseMint || p.item.mint);
        const nName = window.I18N ? window.I18N.getNatureName(p.item.nature) : p.item.nature;
        const nat = isMint ? null : NATURE_DATA.find(n => n.name === p.item.nature || n.name_en === p.item.nature);
        let extra = '';
        if (isMint) {
          extra = `<span style="font-size:10px;color:var(--accent-color,#38bdf8);">${isEN ? '(Minted)' : '(薄荷中和)'}</span>`;
        } else if (nat && nat.buff && nat.buff !== '無增減') {
          extra = `<span style="font-size:9.5px;color:#10b981;">${nat.buff}</span> <span style="font-size:9.5px;color:#f43f5e;">${nat.debuff}</span>`;
        }
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;"><span style="font-weight:700;">${escapeHtml(nName)}</span>${extra}</div>`;
      })
    };

    const buildHtml = `
      <div class="lab-compare-kpi-card" id="lab-compare-builds">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title">
            <span>${isEN ? 'Subskills & Nature Build Matchup' : '副技能與性格配置橫向對照'}</span>
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
      distinctIngRowsHtml = `<div style="text-align:center;color:var(--text-muted);padding:14px;font-size:12px;">${isEN ? 'No ingredients unlocked yet' : '目前均無解鎖之食材'}</div>`;
    } else {
      distinctIngRowsHtml = names.map(n => {
        const vals = aggs.map(a => Math.round((a[n] || 0) * 10) / 10);
        const nameText = window.I18N ? window.I18N.getIngredientName(n) : n;
        const icon = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') ? window.I18N.getIngredientIcon(n) : '';
        const holders = vals.filter(v => v > 0).length;
        let badge = '';
        const top = Math.max.apply(null, vals);
        const topIdx = vals.map((v, i) => (v === top ? i : -1)).filter(i => i >= 0);
        if (holders === 1) {
          const p = activePlayers[vals.findIndex(v => v > 0)];
          badge = `<span class="lab-compare-kpi-badge" style="background:${p.color}2e;color:${p.color};border:1px solid ${p.color}59;">${p.letter} ${isEN ? 'Exclusive' : '獨佔'}</span>`;
        } else if (topIdx.length === 1) {
          const p = activePlayers[topIdx[0]];
          badge = `<span class="lab-compare-kpi-badge" style="background:${p.color}2e;color:${p.color};border:1px solid ${p.color}59;">${p.letter} ${isEN ? 'Leads' : '領先'}</span>`;
        } else {
          badge = `<span class="lab-compare-kpi-badge tie">${isEN ? 'Tie' : '持平'}</span>`;
        }
        return `
          <div class="lab-compare-distinct-row">
            <div class="lab-compare-distinct-head">
              <div class="lab-compare-distinct-title">
                ${icon ? `<img src="${icon}" class="lab-compare-distinct-icon" alt="${escapeHtml(nameText)}">` : ''}
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
          <div class="lab-compare-kpi-title"><span>${isEN ? 'Daily Ingredient Yield Comparison' : '每日食材產量比較'}</span></div>
          ${leadBadge(ingVals, d => `${Math.round(d * 10) / 10} ${unitIng}`)}
        </div>
        ${barRowsHtml(ingVals, ingVals.map(v => `${v} ${unitIng}`))}
        <div class="lab-compare-distinct-list" style="margin-top:6px;">
          <div class="lab-compare-distinct-caption" style="font-size:11px;color:var(--text-muted);margin-bottom:6px;">${isEN ? 'Per-ingredient total yield (each ingredient compared separately):' : '各食材總和產量對照（不同食材獨立比較）：'}</div>
          ${distinctIngRowsHtml}
        </div>
      </div>`;

    // ── 5. 技能發動與幫手效能全面對照 ──
    const skillLabel = p => {
      const nm = (p.base && (p.base.main_skill || (p.base.skill && p.base.skill.name))) || p.item.main_skill || '--';
      const locNm = window.I18N ? window.I18N.getMainSkillName(nm) : nm;
      return `${locNm} Lv.${p.item.skillLevel || 1}`;
    };
    const specRows = [
      { label: isEN ? 'Level' : '等級', vals: activePlayers.map(p => p.perf.level), higher: null, texts: activePlayers.map(p => `Lv.${p.perf.level}`) },
      num(isEN ? 'Help Interval' : '幫手週期', x => x.effectiveInterval, false, v => formatSecsToMinSec(v, isEN)),
      num(isEN ? 'Daily Helps' : '每日幫手次數', x => x.dailyHelps, true, v => `${v} ${isEN ? '/day' : '次'}`),
      num(isEN ? 'Ingredient Rate' : '食材掉落率', x => Math.round(x.effectiveIngRate * 1000) / 10, true, v => `${v}%`),
      num(isEN ? 'Berries / Day' : '每日樹果數量', x => x.dailyBerryCount, true),
      num(isEN ? 'Energy / Berry' : '單顆樹果能量', x => x.singleBerryPower, true),
      { label: isEN ? 'Main Skill' : '主技能', vals: activePlayers.map(() => 0), higher: null, texts: activePlayers.map(p => skillLabel(p)) },
      num(isEN ? 'Skill Proc Rate' : '技能發動率', x => Math.round(x.effectiveSkillRate * 1000) / 10, true, v => `${v}%`),
      num(isEN ? 'Skill Procs / Day' : '技能每日發動次數', x => x.dailySkillProcs, true, v => `~${v} ${isEN ? '/day' : '次'}`),
      num(isEN ? 'Avg Proc Interval' : '技能平均發動間隔', x => (x.dailySkillProcs > 0 ? Math.round((24 / x.dailySkillProcs) * 10) / 10 : 9999), false, v => (v >= 9999 ? '--' : `${v} ${isEN ? 'h' : '小時'}`)),
      num(isEN ? 'Skill Energy / Day' : '主技能每日能量', x => x.dailySkillEnergy, true),
      { label: isEN ? 'Nature' : '性格', vals: activePlayers.map(() => 0), higher: null, texts: activePlayers.map(p => {
        const nName = window.I18N ? window.I18N.getNatureName(p.item.nature) : p.item.nature;
        return (p.item.cleanseMint || p.item.mint) ? `${nName}${isEN ? ' (Mint)' : ' (薄荷)'}` : nName;
      }) }
    ];
    const specHtml = `
      <div class="lab-compare-kpi-card lab-compare-matchup-table" id="lab-compare-skills">
        <div class="lab-compare-kpi-head">
          <div class="lab-compare-kpi-title"><span>${isEN ? 'Skill Procs, Speed & Specs' : '技能發動與幫手效能對照'}</span></div>
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
      parts.push(isEN ? `${pLabel(p)} has the highest daily energy (${fmt(p.perf.totalDailyEnergy)}).` : `【${pLabel(p)}】每日總能量最高 (${fmt(p.perf.totalDailyEnergy)})，適合衝島嶼分數。`);
    }
    if (!allEqual(ingVals)) {
      const p = activePlayers[topOf(ingVals)];
      parts.push(isEN ? `${pLabel(p)} yields the most ingredients (${p.perf.totalDailyIngredientsCount} ${unitIng}).` : `【${pLabel(p)}】食材產量最高 (${p.perf.totalDailyIngredientsCount} ${unitIng})，適合支撐大鍋料理。`);
    }
    if (!allEqual(skillProcVals)) {
      const p = activePlayers[topOf(skillProcVals)];
      parts.push(isEN ? `${pLabel(p)} procs its main skill most often (~${p.perf.dailySkillProcs}/day).` : `【${pLabel(p)}】主技能發動最頻繁 (約 ${p.perf.dailySkillProcs} 次/日)。`);
    }
    const verdictSummary = parts.length ? parts.join(isEN ? ' ' : '') : (isEN ? 'All selected Pokémon are evenly matched.' : '所選寶可夢各項表現旗鼓相當，可依營地喜愛樹果與預備料理自行調配。');

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
            ${isEN ? 'Research Lab Comparative Verdict & Advice' : '深度研究室對比結論與培育建議'}
          </div>
          <div style="font-size:12px;color:#e2e8f0;line-height:1.6;">${verdictSummary}</div>
        </div>
      </div>
    `;
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

  function evaluateSubskillSeedUpgrades(targetPkm, basePkm, isEN) {
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

      const fromDisp = isEN && window.I18N ? window.I18N.getSubSkillName(skName) : skName;
      const toDisp = isEN && window.I18N ? window.I18N.getSubSkillName(upgradedName) : upgradedName;

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

  function evaluateMainSkillSeedROI(targetPkm, basePkm, isEN) {
    if (!targetPkm || !basePkm) {
      return {
        skillName: isEN ? 'None' : '無',
        skillDisplay: isEN ? 'None' : '無',
        currentLevel: 1,
        maxLevel: 6,
        seedsNeeded: 0,
        roiGrade: 'C',
        recommendation: isEN ? 'No main skill data.' : '暫無主技能資訊。',
        gainSummary: ''
      };
    }

    let rawSkill = targetPkm.skill || targetPkm.main_skill || (basePkm && basePkm.main_skill) || (basePkm && basePkm.skill) || '';
    if (rawSkill && typeof rawSkill === 'object') {
      rawSkill = rawSkill.name || rawSkill.name_cn || rawSkill.name_en || '';
    }
    const skillName = String(rawSkill || (isEN ? 'Main Skill' : '主技能'));
    const skillDisp = isEN && window.I18N ? window.I18N.getMainSkillName(skillName) : skillName;
    const curSkillLv = parseInt(targetPkm.skillLevel || 1, 10) || 1;

    // 大多數主技能上限為 Lv.6；能量填充S/M 與 活力加油 上限開放至 Lv.7
    const isLv7Skill = ['能量填充M', '能量填充S', '活力加油S', 'Charge Strength M', 'Charge Strength S', 'Energizing Cheer S'].some(s => skillName.includes(s));
    const maxSkillLv = isLv7Skill ? 7 : 6;
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

    const isHealer = ['活力療癒', '能量療癒', 'Energy for Everyone', 'Heal'].some(s => skillName.includes(s));
    const isHighImpact = ['幫手加速', 'Helper Boost', '樹果遽增', 'Berry Burst', '料理大成功', 'Extra Tasty', '料理擴鍋', 'Cooking Power Up'].some(s => skillName.includes(s));

    let roiGrade = 'B';
    let recommendation = '';

    if (hasSkillDebuff) {
      roiGrade = 'C';
      recommendation = isEN
        ? 'Skill Trigger Down nature severely cripples activation frequency. Gold seed investment is not recommended.'
        : '性格減主技能發動機率，嚴重壓低發動期望值，強烈不建議投資金種子。';
    } else if (isHealer) {
      if (hasTriggerM || hasSkillBuff) {
        roiGrade = 'S';
        recommendation = isEN
          ? 'Elite team healer with high proc frequency! Maxing main skill sustains full team energy throughout the day.'
          : '極品高頻補師！滿級主技能單次回復全隊18點活力，全天維持極速產能，值得最高優先級投資金種子。';
      } else {
        roiGrade = 'A';
        recommendation = isEN
          ? 'Core team healer. High investment value to maintain team energy stability.'
          : '隊伍核心補師，升滿主技能能大幅提升全隊續航力，投資性價比極高。';
      }
    } else if (isSkillSpec) {
      if (hasTriggerM && (hasSkillBuff || hasTriggerS)) {
        roiGrade = 'S';
        recommendation = isEN
          ? 'Top-tier skill specialist with extreme trigger rates! Gold seeds unleash maximum potential.'
          : '極限發動率頂級技能手！副技能與性格高度契合，滿等主技能產能爆發極高，強烈推薦投資。';
      } else if (hasTriggerM || hasSkillBuff) {
        roiGrade = 'A';
        recommendation = isEN
          ? 'Solid skill specialist. Recommended investment if this Pokemon is a key roster member.'
          : '具備良好技能加成，作為主力隊員時投資金種子效益顯著。';
      } else {
        roiGrade = 'B';
        recommendation = isEN
          ? 'Moderate trigger rate. Consider investing only after core healers are maxed.'
          : '發動頻率普通，建議優先將金種子保留給核心補師或頂級神獸。';
      }
    } else if (isHighImpact) {
      roiGrade = 'B';
      recommendation = isEN
        ? 'Support utility skill. Can be upgraded if resources permit, but lower priority than skill specialists.'
        : '實用戰術型技能，在主力隊伍成型後可酌量升級，優先級次於技能專長型。';
    } else {
      roiGrade = 'C';
      recommendation = isEN
        ? 'Berry/Ingredient specialist. Skill leveling grants marginal returns; save seeds for dedicated specialists.'
        : '非技能專長個體，主技能升級收益有限，建議保留金種子給專長寶可夢。';
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

  function renderGrowthView(userBox, pokemons, isEN, isMobileH5) {
    const targetObj = getActiveGrowthTarget(userBox, pokemons);
    const targetPkm = targetObj.item;
    const basePkm = targetObj.base;

    const baseName = basePkm.name_cn || basePkm.name || targetPkm.name || '';
    const pDisplayName = isEN ? (basePkm.name_en || baseName) : baseName;
    const avatarUrl = (basePkm && (basePkm.icon_url || basePkm.icon)) || (basePkm && basePkm.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${basePkm.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
    const specDisp = (window.I18N && window.I18N.getSpecialtyName) ? window.I18N.getSpecialtyName(basePkm.specialty) : (basePkm.specialty || '樹果');

    // 確定等級區間 (從個體當前等級至目標等級)
    const boxLevel = parseInt(targetPkm.level, 10) || 1;
    if (!growthState.fromLevel || growthState.fromLevel < 1) {
      growthState.fromLevel = boxLevel;
    }
    if (!growthState.targetLevel || growthState.targetLevel <= growthState.fromLevel) {
      if (growthState.fromLevel < 30) growthState.targetLevel = 30;
      else if (growthState.fromLevel < 50) growthState.targetLevel = 50;
      else if (growthState.fromLevel < 60) growthState.targetLevel = 60;
      else if (growthState.fromLevel < 70) growthState.targetLevel = 70;
      else if (growthState.fromLevel < 80) growthState.targetLevel = 80;
      else growthState.targetLevel = 100;
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
    const subskillUpgrades = evaluateSubskillSeedUpgrades(targetPkm, basePkm, isEN);
    const mainskillROI = evaluateMainSkillSeedROI(targetPkm, basePkm, isEN);

    // 曲線標籤字串
    const curveLabel = curveMult === 1.5
      ? (isEN ? 'Pseudo-Legendary (1.5x)' : '準神 (1.5倍)')
      : curveMult === 1.8
      ? (isEN ? 'Legendary (1.8x)' : '神獸 (1.8倍)')
      : curveMult === 3.0
      ? (isEN ? 'Mythical/Special (3.0x)' : '特殊神獸 (3.0倍)')
      : (isEN ? 'Standard (1.0x)' : '一般 (1.0倍)');

    // 性格 EXP 標籤字串
    const natureExpLabel = expMod === 'up'
      ? (isEN ? 'EXP Up (+18%)' : '經驗提升 (+18%)')
      : expMod === 'down'
      ? (isEN ? 'EXP Down (-18%)' : '經驗下降 (-18%)')
      : (isEN ? 'Neutral' : '無修正');

    return `
      <div class="lab-growth-container">
        <!-- 頂部個體資訊橫幅 (Single Frame) -->
        <div class="lab-growth-header-card">
          <div class="lab-growth-target-summary">
            <div class="lab-growth-avatar-wrap">
              <img src="${avatarUrl}" class="lab-growth-avatar-img" alt="${escapeHtml(pDisplayName)}" loading="lazy">
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
                <span>${targetPkm.nature || '坦率'} (${natureExpLabel})</span>
              </div>
            </div>
          </div>
          <button type="button" class="lab-growth-change-btn" onclick="window.AppraisalLab.openGrowthPicker()">
            ${isEN ? 'Change Pokémon' : '更換寶可夢'}
          </button>
        </div>

        <!-- 主面板網格 (2 欄並列) -->
        <div class="lab-growth-grid">
          <!-- 左欄：培育等級與資源消耗精算 -->
          <div class="lab-growth-card">
            <div class="lab-growth-card-title">
              <span>${isEN ? 'Level & Resource Calculator' : '培育升級消耗精算'}</span>
              <span style="font-size:12px;color:var(--text-secondary);font-weight:normal;">${curveLabel}</span>
            </div>

            <!-- 等級滑桿與區間控制 -->
            <div class="lab-growth-level-control">
              <div class="lab-growth-range-display">
                <span class="lab-growth-range-label">${isEN ? 'Current Level' : '起始等級'}</span>
                <span class="lab-growth-range-val">Lv.${growthState.fromLevel}</span>
              </div>
              <input type="range" class="lab-growth-slider" min="1" max="99" value="${growthState.fromLevel}" oninput="window.AppraisalLab.setGrowthFromLevel(this.value)">

              <div class="lab-growth-range-display" style="margin-top:10px;">
                <span class="lab-growth-range-label">${isEN ? 'Target Level' : '目標等級'}</span>
                <span class="lab-growth-range-val">Lv.${growthState.targetLevel}</span>
              </div>
              <input type="range" class="lab-growth-slider" min="2" max="100" value="${growthState.targetLevel}" oninput="window.AppraisalLab.setGrowthTargetLevel(this.value)">

              <!-- 里程碑快速按鈕 -->
              <div class="lab-growth-milestones-row">
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 30 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(30)">Lv.30</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 50 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(50)">Lv.50</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 60 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(60)">Lv.60</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 70 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(70)">Lv.70</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 80 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(80)">Lv.80</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 100 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(100)">Lv.100</button>
              </div>
            </div>

            <!-- 消耗總結看板 -->
            <div class="lab-growth-cost-board">
              <div class="lab-growth-cost-cell">
                <div class="lab-growth-cost-label">${isEN ? 'Required Candies' : '所需寶可夢糖果'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-candies">${cost.candiesNeeded.toLocaleString()} <span style="font-size:12px;color:var(--text-secondary);font-weight:normal;">(${cost.expPerCandy} EXP/${isEN ? 'ea' : '顆'})</span></div>
              </div>
              <div class="lab-growth-cost-cell">
                <div class="lab-growth-cost-label">${isEN ? 'Required Dream Shards' : '所需夢之碎片'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-shards">${cost.shardsNeeded.toLocaleString()}</div>
              </div>
              <div class="lab-growth-cost-cell" style="grid-column: 1 / -1;">
                <div class="lab-growth-cost-label">${isEN ? 'Cumulative Experience' : '所需經驗值累計 (EXP)'}</div>
                <div class="lab-growth-cost-val lab-growth-cost-exp">${cost.expNeeded.toLocaleString()} EXP</div>
              </div>
            </div>

            <!-- 萬能糖果換算列 -->
            <div class="lab-growth-handy-bar">
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${isEN ? 'Handy Candy S (+3)' : '萬能糖果 S (+3)'}</span>
                <span class="lab-growth-handy-count">${cost.handyCandyS.toLocaleString()} ${isEN ? 'pcs' : '顆'}</span>
              </div>
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${isEN ? 'Handy Candy M (+20)' : '萬能糖果 M (+20)'}</span>
                <span class="lab-growth-handy-count">${cost.handyCandyM.toLocaleString()} ${isEN ? 'pcs' : '顆'}</span>
              </div>
              <div class="lab-growth-handy-item">
                <span class="lab-growth-handy-name">${isEN ? 'Handy Candy L (+100)' : '萬能糖果 L (+100)'}</span>
                <span class="lab-growth-handy-count">${cost.handyCandyL.toLocaleString()} ${isEN ? 'pcs' : '顆'}</span>
              </div>
            </div>
          </div>

          <!-- 右欄：技能種子效益精算 -->
          <div class="lab-growth-card">
            <div class="lab-growth-card-title">
              <span>${isEN ? 'Skill Seeds ROI & Upgrade Analysis' : '技能種子投資效益精算'}</span>
            </div>

            <!-- 1. 銀色技能種子區塊 -->
            <div class="lab-growth-seed-section">
              <div class="lab-growth-seed-title-row">
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${isEN ? 'Sub Skill Seed' : '銀色技能種子'}</span>
                <span class="lab-growth-seed-badge lab-growth-seed-badge-silver">${isEN ? 'Sub-Skills' : '副技能升階'}</span>
              </div>
              ${subskillUpgrades.length === 0 ? `
                <div class="lab-growth-no-subskills">
                  ${isEN ? 'No eligible sub-skills for Sub Skill Seed (already max tier or no ladder skills).' : '無可使用銀色技能種子之副技能（已達上限或無階梯技能）'}
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
                <span style="font-size:13px;font-weight:600;color:var(--text-primary);">${isEN ? 'Main Skill Seed' : '金色技能種子'}</span>
                <span class="lab-growth-seed-badge lab-growth-seed-badge-gold">${isEN ? 'Main Skill' : '主技能突破'}</span>
              </div>
              <div class="lab-growth-mainskill-box">
                <div class="lab-growth-mainskill-header">
                  <span class="lab-growth-mainskill-name">${escapeHtml(mainskillROI.skillDisplay)}</span>
                  <span class="lab-growth-roi-pill lab-growth-roi-${mainskillROI.roiGrade.toLowerCase()}">${isEN ? 'ROI Rating: ' : '性價比評級：'}${mainskillROI.roiGrade}</span>
                </div>
                <div class="lab-growth-mainskill-detail">
                  <span>${isEN ? 'Current Level -> Max' : '當前等級 -> 上限'}</span>
                  <span class="lab-growth-mainskill-val">Lv.${mainskillROI.currentLevel} -> Lv.${mainskillROI.maxLevel}</span>
                </div>
                <div class="lab-growth-mainskill-detail">
                  <span>${isEN ? 'Seeds Needed to Max' : '升滿所需金種子'}</span>
                  <span class="lab-growth-mainskill-val">${mainskillROI.seedsNeeded} ${isEN ? 'Seeds' : '顆'}</span>
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
      growthState.fromLevel = parseInt(target.level, 10) || 1;
      if (growthState.fromLevel < 30) growthState.targetLevel = 30;
      else if (growthState.fromLevel < 50) growthState.targetLevel = 50;
      else if (growthState.fromLevel < 60) growthState.targetLevel = 60;
      else if (growthState.fromLevel < 70) growthState.targetLevel = 70;
      else if (growthState.fromLevel < 80) growthState.targetLevel = 80;
      else growthState.targetLevel = 100;
    }
    updateLabUI();
  }

  function setGrowthFromLevel(val) {
    const num = Math.max(1, Math.min(99, parseInt(val, 10) || 1));
    growthState.fromLevel = num;
    if (growthState.targetLevel <= num) {
      growthState.targetLevel = Math.min(100, num + 1);
    }
    updateLabUI();
  }

  function setGrowthTargetLevel(val) {
    const num = Math.max(2, Math.min(100, parseInt(val, 10) || 30));
    growthState.targetLevel = num;
    if (growthState.fromLevel >= num) {
      growthState.fromLevel = Math.max(1, num - 1);
    }
    updateLabUI();
  }

  function setGrowthMilestone(target) {
    const tgt = parseInt(target, 10) || 30;
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isMobileH5 = typeof document !== 'undefined' && (
      (typeof document.querySelector === 'function' && !!document.querySelector('.mobile-h5-app')) ||
      (document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app'))
    );
    const showControls = labState.editMode;

    const pokemons = window.allPokemons || (window.PokemonApp && (window.PokemonApp.allPokemons || (typeof window.PokemonApp.getPokemons === 'function' && window.PokemonApp.getPokemons()))) || [];
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
            <span class="lab-subtab-title">${isEN ? 'Team Builder' : '幫手組隊'}</span>
          </button>
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'compare' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('compare')">
            <span class="lab-subtab-title">${isEN ? 'Pokémon Comparison' : '寶可夢對比'}</span>
          </button>
          <button type="button" class="lab-subtab-btn ${labState.currentSubTab === 'growth' ? 'active' : ''}" onclick="window.AppraisalLab.switchSubTab('growth')">
            <span class="lab-subtab-title">${isEN ? 'Growth & Seeds' : '培育精算'}</span>
          </button>
        </div>
        ` : ''}

        <!-- 1. 幫手組隊子面板 (Team Builder & Simulator) -->
        <div id="lab-subpanel-team" class="lab-subpanel" style="${labState.currentSubTab === 'team' && !labState.editMode ? '' : 'display:none;'}">
          ${renderTeamBuilderView(userBox, pokemons, isEN, isMobileH5)}
        </div>

        <!-- 2. 寶可夢對比子面板 (Side-by-Side Comparison) -->
        <div id="lab-subpanel-compare" class="lab-subpanel" style="${labState.currentSubTab === 'compare' ? '' : 'display:none;'}">
          ${renderComparisonView(userBox, pokemons, isEN, isMobileH5)}
        </div>

        <!-- 3. 培育精算子面板 (Growth & Seeds Calculator) -->
        <div id="lab-subpanel-growth" class="lab-subpanel" style="${labState.currentSubTab === 'growth' ? '' : 'display:none;'}">
          ${renderGrowthView(userBox, pokemons, isEN, isMobileH5)}
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