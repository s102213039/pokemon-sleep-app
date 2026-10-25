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

