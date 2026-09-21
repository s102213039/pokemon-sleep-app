/**
 * box.js — 我的寶可夢倉庫與截圖智能辨識系統
 * =========================================================
 * 功能：
 * 1. 個人寶可夢倉庫管理 (LocalStorage CRUD + 匯出/匯入)
 * 2. 截圖影像智能分析與 OCR 辨識 (等級、食材、副技能、性格)
 * 3. 視覺化核對與防呆編輯彈窗
 * 4. 倉庫卡片與表格雙視圖呈現、多維度篩選
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'PKMSLEEP_USER_BOX_V1';

  /* ─── 字典常數定義 ─────────────────────────────────────── */
  const NATURE_DATA = [
    { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'speed', debuffType: 'ingredient' },
    { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'speed', debuffType: 'exp' },
    { name: '怕寂寞', name_en: 'Lonely', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'speed', debuffType: 'energy' },
    { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲', buff_en: 'Speed ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'speed', debuffType: 'skill' },
    { name: '內斂', name_en: 'Modest', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'ingredient', debuffType: 'speed' },
    { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'ingredient', debuffType: 'exp' },
    { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'ingredient', debuffType: 'energy' },
    { name: '馬虎', name_en: 'Rash', buff: '食材機率▲', buff_en: 'Ingr. ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'ingredient', debuffType: 'skill' },
    { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'skill', debuffType: 'speed' },
    { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'skill', debuffType: 'ingredient' },
    { name: '自大', name_en: 'Sassy', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'skill', debuffType: 'exp' },
    { name: '溫順', name_en: 'Gentle', buff: '主技能發動機率▲', buff_en: 'Skill ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'skill', debuffType: 'energy' },
    { name: '大膽', name_en: 'Bold', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'energy', debuffType: 'speed' },
    { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'energy', debuffType: 'ingredient' },
    { name: '悠閒', name_en: 'Relaxed', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: 'EXP獲得量▼', debuff_en: 'EXP ▼', buffType: 'energy', debuffType: 'exp' },
    { name: '樂天', name_en: 'Lax', buff: '活力回復量▲', buff_en: 'Energy ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'energy', debuffType: 'skill' },
    { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '幫忙速度▼', debuff_en: 'Speed ▼', buffType: 'exp', debuffType: 'speed' },
    { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '食材機率▼', debuff_en: 'Ingr. ▼', buffType: 'exp', debuffType: 'ingredient' },
    { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '活力回復量▼', debuff_en: 'Energy ▼', buffType: 'exp', debuffType: 'energy' },
    { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲', buff_en: 'EXP ▲', debuff: '主技能發動機率▼', debuff_en: 'Skill ▼', buffType: 'exp', debuffType: 'skill' },
    { name: '坦率', name_en: 'Hardy', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '害羞', name_en: 'Bashful', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '認真', name_en: 'Docile', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '勤奮', name_en: 'Serious', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' },
    { name: '浮躁', name_en: 'Quirky', buff: '無增減', buff_en: 'Neutral', debuff: '', debuff_en: '', buffType: 'none', debuffType: 'none' }
  ];

  const SUBSKILLS_DATA = [
    // 金色技能 (Tier 1 Gold)
    { name: '樹果數量S', name_en: 'Berry Finding S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個', desc_en: 'Finds 1 additional berry when helping.' },
    { name: '幫手獎勵', name_en: 'Helping Bonus', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%', desc_en: 'Reduces helping time of all team members by 5%.' },
    { name: '睡眠EXP獎勵', name_en: 'Sleep EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%', desc_en: 'Boosts EXP gained from sleep research by 14%.' },
    { name: '活力回復獎勵', name_en: 'Energy Recovery Bonus', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%', desc_en: 'Boosts sleep energy recovery for all team members by 14%.' },
    { name: '夢之碎片獎勵', name_en: 'Dream Shard Bonus', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%', desc_en: 'Boosts Dream Shards gained from sleep research by 6%.' },
    { name: '研究EXP獎勵', name_en: 'Research EXP Bonus', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%', desc_en: 'Boosts Research EXP gained from sleep research by 6%.' },
    { name: '技能等級提升M', name_en: 'Skill Level Up M', tier: 'gold', desc: '主技能等級提升2級', desc_en: 'Increases the level of the main skill by 2.' },
    // 藍色技能 (Tier 2 Silver/Blue)
    { name: '幫忙速度M', name_en: 'Helping Speed M', tier: 'blue', desc: '幫忙時間縮短14%', desc_en: 'Reduces helping time by 14%.' },
    { name: '食材機率提升M', name_en: 'Ingredient Finder M', tier: 'blue', desc: '發現食材的機率大幅提升', desc_en: 'Significantly increases the chance of finding ingredients.' },
    { name: '技能機率提升M', name_en: 'Skill Trigger M', tier: 'blue', desc: '發動主技能的機率大幅提升', desc_en: 'Significantly increases the chance of triggering main skill.' },
    { name: '技能等級提升S', name_en: 'Skill Level Up S', tier: 'blue', desc: '主技能等級提升1級', desc_en: 'Increases the level of the main skill by 1.' },
    { name: '持有上限提升L', name_en: 'Inventory Up L', tier: 'blue', desc: '最大持有數量增加18', desc_en: 'Increases max carry capacity by 18.' },
    { name: '持有上限提升M', name_en: 'Inventory Up M', tier: 'blue', desc: '最大持有數量增加12', desc_en: 'Increases max carry capacity by 12.' },
    // 白色技能 (Tier 3 White)
    { name: '幫忙速度S', name_en: 'Helping Speed S', tier: 'white', desc: '幫忙時間縮短7%', desc_en: 'Reduces helping time by 7%.' },
    { name: '食材機率提升S', name_en: 'Ingredient Finder S', tier: 'white', desc: '發現食材的機率小幅提升', desc_en: 'Slightly increases the chance of finding ingredients.' },
    { name: '技能機率提升S', name_en: 'Skill Trigger S', tier: 'white', desc: '發動主技能的機率小幅提升', desc_en: 'Slightly increases the chance of triggering main skill.' },
    { name: '持有上限提升S', name_en: 'Inventory Up S', tier: 'white', desc: '最大持有數量增加6', desc_en: 'Increases max carry capacity by 6.' },
    { name: '活力回復提升S', name_en: 'Energy Recovery Up S', tier: 'white', desc: '自身的活力回復量提升', desc_en: 'Boosts the Pokémon\'s own energy recovery by 14%.' }
  ];

  /* ─── 狀態管理 ─────────────────────────────────────────── */
  let userBox = [];
  let currentSearch = '';
  let selectedType = 'ALL';
  let selectedSpecialty = 'ALL';
  let sortBy = 'created-desc';
  let boxViewMode = 'grid'; // 'grid' | 'table'
  let allPokemonsRef = [];

  /* ─── 初始化與資料載入 ───────────────────────────────────── */
  function loadUserBox() {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        userBox = JSON.parse(raw);
        if (!Array.isArray(userBox)) userBox = [];
      } else {
        userBox = [];
      }
    } catch (e) {
      console.error('Failed to load user box:', e);
      userBox = [];
    }
  }

  function saveUserBox() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userBox));
    } catch (e) {
      console.error('Failed to save user box:', e);
    }
  }

  /* ─── 獲取寶可夢基礎資訊 ─────────────────────────────────── */
  function findPokemonBase(idOrName) {
    if (!allPokemonsRef || allPokemonsRef.length === 0) return null;
    return allPokemonsRef.find(p => 
      String(p.id) === String(idOrName) ||
      p.formatted_no === String(idOrName) ||
      (p.name && (p.name.cn === idOrName || p.name.en === idOrName || p.name.jp === idOrName)) ||
      p.name_cn === idOrName ||
      p.name_en === idOrName
    ) || null;
  }

  /* ─── 👑 RaenonX 級潛力 PR 評分演算法 (含核心及格線快速檢驗與 Lv.70/80 覆蓋) ─── */
  function calculatePokemonPR(pkm, baseData = null) {
    const base = baseData || findPokemonBase(pkm.pokemonId || pkm.name);
    const specialty = (base && base.specialty) || pkm.specialty || '樹果';
    const nature = pkm.nature || '坦率';
    const subskills = pkm.subskills || [];

    const natureObj = NATURE_DATA.find(n => n.name === nature) || { buffType: 'none', debuffType: 'none' };
    const buff = natureObj.buffType;
    const debuff = natureObj.debuffType;
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';

    // 前三格核心技能 (Lv.10, Lv.25, Lv.50)
    const earlySubskills = subskills.slice(0, 3);

    // ─── 階段 1：核心及格線快速判定 (Fast-Exit Baseline Filter) ───
    let passedBaseline = true;
    let baselineFailReason = '';

    if (specialty === '樹果') {
      const hasEarlyBFS = earlySubskills.includes('樹果數量S');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const hasEarlySpeedM = earlySubskills.includes('幫忙速度M');
      const isSpeedDown = debuff === 'speed';
      const isSpeedUp = buff === 'speed';

      if (isSpeedDown && !hasEarlyBFS && !hasEarlyHB) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Speed down nature without BFS / HB to compensate' : '性格減慢幫忙速度，未達樹果手及格線（且前三格無樹果S/幫手獎勵補救）';
      } else if (!hasEarlyBFS && !hasEarlyHB && !hasEarlySpeedM && !isSpeedUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks BFS or speed boost in first 3 slots' : '前三格缺乏樹果S/速度加成，未達樹果手及格線';
      }
    } else if (specialty === '食材') {
      const hasEarlyIngM = earlySubskills.includes('食材機率提升M');
      const hasEarlyIngS = earlySubskills.includes('食材機率提升S');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const isIngDown = debuff === 'ingredient';
      const isIngUp = buff === 'ingredient';

      if (isIngDown && !hasEarlyIngM) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Ingredient down nature without Ingredient Finder M' : '性格減少食材機率，未達食材手及格線';
      } else if (!hasEarlyIngM && !hasEarlyIngS && !hasEarlyHB && !isIngUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks ingredient finder boost in first 3 slots' : '缺乏食材機率加成，未達食材手及格線';
      }
    } else { // 技能型
      const hasEarlySkillM = earlySubskills.includes('技能機率提升M');
      const hasEarlySkillS = earlySubskills.includes('技能機率提升S');
      const hasEarlySkillLvlM = earlySubskills.includes('技能等級提升M');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const isSkillDown = debuff === 'skill';
      const isSkillUp = buff === 'skill';

      if (isSkillDown && !hasEarlySkillM) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Skill down nature without Skill Trigger M' : '性格減少主技能機率，未達技能手及格線';
      } else if (!hasEarlySkillM && !hasEarlySkillS && !hasEarlySkillLvlM && !hasEarlyHB && !isSkillUp) {
        passedBaseline = false;
        baselineFailReason = isEN ? 'Lacks skill trigger boost in first 3 slots' : '缺乏技能發動率加成，未達技能手及格線';
      }
    }

    // 若未通過及格線：快速出口 (Fast-Exit) 歸類為 B/C 級，免去多餘高階比對
    if (!passedBaseline) {
      let failScore = 15;
      if (earlySubskills.length > 0) failScore += 10;
      let pr = Math.min(42, Math.max(12, failScore));
      return {
        pr,
        tier: pr >= 30 ? 'B' : 'C',
        tierBadgeClass: pr >= 30 ? 'pr-tier-b' : 'pr-tier-c',
        summaryNote: `[!] ${baselineFailReason}`,
        score: failScore
      };
    }

    // ─── 階段 2：及格線以上的高階精確評分 (覆蓋 Lv.10, 25, 50, 70, 80) ───
    let score = 0;
    const highlights = [];

    // 1. 性格評分
    if (specialty === '樹果') {
      if (buff === 'speed') { score += 25; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 25; }
      if (debuff === 'ingredient') { score += 12; highlights.push(isEN ? 'Ing. ▼ (Pure Berry)' : '食材▼ (樹果極限流)'); }
      if (buff === 'ingredient') { score -= 6; }
    } else if (specialty === '食材') {
      if (buff === 'ingredient') { score += 28; highlights.push(isEN ? 'Ing. Rate ▲' : '食材機率▲'); }
      if (debuff === 'ingredient') { score -= 28; }
      if (buff === 'speed') { score += 16; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 16; }
    } else { // 技能
      if (buff === 'skill') { score += 30; highlights.push(isEN ? 'Skill Trigger ▲' : '主技能機率▲'); }
      if (debuff === 'skill') { score -= 30; }
      if (buff === 'speed') { score += 15; highlights.push(isEN ? 'Speed ▲' : '幫忙速度▲'); }
      if (debuff === 'speed') { score -= 15; }
    }

    // 2. 5 格副技能解鎖權重 (Lv.10: 30%, Lv.25: 30%, Lv.50: 20%, Lv.70: 12%, Lv.80: 8%)
    const slotWeights = [0.30, 0.30, 0.20, 0.12, 0.08];
    const lvlLabels = [10, 25, 50, 70, 80];

    subskills.forEach((skName, idx) => {
      const w = slotWeights[idx] || 0.08;
      const lvl = lvlLabels[idx] || 10;
      let skScore = 0;

      if (skName === '樹果數量S') {
        skScore = specialty === '樹果' ? 100 : 40;
        highlights.push(isEN ? `Lv.${lvl} BFS` : `Lv.${lvl} 樹果S`);
      } else if (skName === '幫手獎勵') {
        skScore = 65;
        highlights.push(isEN ? `Lv.${lvl} Helping Bonus` : `Lv.${lvl} 幫手獎勵`);
      } else if (skName === '食材機率提升M') {
        skScore = specialty === '食材' ? 85 : 20;
        if (specialty === '食材') highlights.push(isEN ? `Lv.${lvl} Ing. Finder M` : `Lv.${lvl} 食材機率M`);
      } else if (skName === '食材機率提升S') {
        skScore = specialty === '食材' ? 45 : 10;
      } else if (skName === '技能機率提升M') {
        skScore = specialty === '技能' ? 85 : 20;
        if (specialty === '技能') highlights.push(isEN ? `Lv.${lvl} Skill Trigger M` : `Lv.${lvl} 技能機率M`);
      } else if (skName === '技能機率提升S') {
        skScore = specialty === '技能' ? 45 : 10;
      } else if (skName === '技能等級提升M') {
        skScore = specialty === '技能' ? 60 : 15;
        if (specialty === '技能') highlights.push(isEN ? `Lv.${lvl} Skill Level M` : `Lv.${lvl} 技能等級M`);
      } else if (skName === '技能等級提升S') {
        skScore = specialty === '技能' ? 30 : 10;
      } else if (skName === '幫忙速度M') {
        skScore = 50;
        highlights.push(isEN ? `Lv.${lvl} Speed M` : `Lv.${lvl} 幫忙速度M`);
      } else if (skName === '幫忙速度S') {
        skScore = 25;
      } else if (skName === '持有上限提升L') {
        skScore = specialty === '食材' ? 40 : 20;
      } else if (skName === '持有上限提升M') {
        skScore = specialty === '食材' ? 26 : 14;
      } else if (skName === '持有上限提升S') {
        skScore = specialty === '食材' ? 14 : 7;
      } else if (skName === '睡眠EXP獎勵' || skName === '活力回復獎勵') {
        skScore = 18;
      } else {
        skScore = 8;
      }

      score += skScore * w;
    });

    // 睡飽飽獎章加成 (Good-Night Ribbon Bonus)
    const ribbonLvl = parseInt(pkm.ribbon, 10) || 0;
    if (ribbonLvl > 0) {
      const remainingEvos = typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function'
        ? window.AppraisalLab.getRemainingEvolutions(base)
        : 1;
      const ribbonBonus = typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRibbonBonus === 'function'
        ? window.AppraisalLab.getRibbonBonus(ribbonLvl, remainingEvos)
        : { carry: 8, speedDiscount: 0.12 };
      
      if (ribbonBonus.speedDiscount > 0) {
        score += Math.round(ribbonBonus.speedDiscount * 25);
        highlights.push(isEN ? `Ribbon -${Math.round(ribbonBonus.speedDiscount * 100)}% Speed` : `獎章幫速 -${Math.round(ribbonBonus.speedDiscount * 100)}%`);
      } else {
        score += ribbonBonus.carry * 0.8;
        highlights.push(isEN ? `Ribbon +${ribbonBonus.carry} Carry` : `獎章持有 +${ribbonBonus.carry}`);
      }
    }

    // 3. 正規化至 PR 百分位數 [50 ~ 100] (及格線以上個體)
    const minPassBenchmark = 10;
    const maxBenchmark = 75;
    let pr = 50 + Math.round(((score - minPassBenchmark) / (maxBenchmark - minPassBenchmark)) * 50);
    pr = Math.min(100, Math.max(50, pr));

    // 評級判定
    let tier = 'A';
    let tierBadgeClass = 'pr-tier-a';

    if (pr >= 90) {
      tier = 'S+';
      tierBadgeClass = 'pr-tier-splus';
    } else if (pr >= 75) {
      tier = 'S';
      tierBadgeClass = 'pr-tier-s';
    }

    let summaryNote = '';
    if (highlights.length > 0) {
      summaryNote = highlights.slice(0, 3).join(' · ');
    } else {
      summaryNote = isEN ? 'Solid baseline starter' : '及格主力，基礎能力扎實';
    }

    return {
      pr,
      tier,
      tierBadgeClass,
      summaryNote,
      highlights,
      score: Math.round(score * 10) / 10
    };
  }

  /* ─── 渲染倉庫清單 ─────────────────────────────────────── */
  function getFilteredBox() {
    return userBox.filter(p => {
      const base = findPokemonBase(p.pokemonId || p.name);
      const pType = (base && base.type) || p.type || '';
      const pSpec = (base && base.specialty) || p.specialty || '';

      if (selectedType !== 'ALL' && pType !== selectedType) return false;
      if (selectedSpecialty !== 'ALL' && pSpec !== selectedSpecialty) return false;

      if (currentSearch) {
        const q = currentSearch.toLowerCase().trim();
        const nameCN = (p.name || (base && base.name_cn) || '').toLowerCase();
        const nameEN = ((base && base.name_en) || '').toLowerCase();
        const nickname = (p.nickname || '').toLowerCase();
        const natureName = (p.nature || '').toLowerCase();
        const subskillStr = (p.subskills || []).join(' ').toLowerCase();

        if (!nameCN.includes(q) && !nameEN.includes(q) && !nickname.includes(q) && !natureName.includes(q) && !subskillStr.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'pr-desc') return calculatePokemonPR(b).pr - calculatePokemonPR(a).pr;
      if (sortBy === 'pr-asc') return calculatePokemonPR(a).pr - calculatePokemonPR(b).pr;
      if (sortBy === 'level-desc') return (b.level || 1) - (a.level || 1);
      if (sortBy === 'level-asc') return (a.level || 1) - (b.level || 1);
      if (sortBy === 'id-asc') return (parseInt(a.pokemonId || 0, 10)) - (parseInt(b.pokemonId || 0, 10));
      if (sortBy === 'created-asc') return (a.createdAt || 0) - (b.createdAt || 0);
      return (b.createdAt || 0) - (a.createdAt || 0); // created-desc default
    });
  }

  function renderBox() {
    const container = document.getElementById('box-content-area');
    if (!container) return;

    try {
      const filtered = getFilteredBox();
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

      if (filtered.length === 0) {
        if (userBox.length === 0) {
          container.innerHTML = `
            <div class="box-simple-empty-state">
              <p class="box-simple-empty-title">${isEN ? 'No Pokémon recorded yet' : '目前尚未登錄任何寶可夢'}</p>
              <p class="box-simple-empty-hint">${isEN ? 'Tap the "Scan OCR" or "Add Pokémon" button at the bottom right to start building your team!' : '請點擊右下角的「截圖辨識」或「手動新增」按鈕開始建立你的幫手隊伍！'}</p>
            </div>
          `;
        } else {
          container.innerHTML = `
            <div class="box-simple-empty-state">
              <p class="box-simple-empty-title">${isEN ? 'No Pokémon matched the filter' : '查無符合條件的寶可夢'}</p>
              <p class="box-simple-empty-hint">${isEN ? 'Try searching different keywords or clearing filters.' : '請嘗試更換搜尋關鍵字或清空篩選條件。'}</p>
            </div>
          `;
        }
        return;
      }

      if (boxViewMode === 'grid') {
        renderBoxGrid(filtered, container);
      } else {
        renderBoxTable(filtered, container);
      }
    } catch (err) {
      console.error('Error rendering Box:', err);
      if (typeof window.__renderInPlaceError === 'function') {
        window.__renderInPlaceError('box-content-area', '寶可夢倉庫渲染異常', err);
      }
    }
  }

  function getIngCountFromBase(basePkm, slotIdx, ingName) {
    if (!basePkm || !basePkm.ingredients) {
      return slotIdx === 0 ? 1 : (slotIdx === 1 ? 2 : 4);
    }
    const found = basePkm.ingredients.find(ig => ig.name === ingName);
    if (found && typeof found.count === 'number') {
      return found.count;
    }
    if (slotIdx === 0) return 1;
    if (slotIdx === 1) return (basePkm.ingredients[1] && basePkm.ingredients[1].count) || 2;
    return (basePkm.ingredients[2] && basePkm.ingredients[2].count) || 4;
  }

  function renderBoxCardIngSlot(ingName, slotLv, basePkm, slotIdx) {
    if (!ingName || ingName === '--') {
      return `
        <div class="box-ing-slot">
          <span class="box-slot-tag">${slotLv}</span>
          <span class="box-slot-val" style="color:var(--text-muted);font-size:11px;">--</span>
        </div>
      `;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);

    return `
      <div class="box-ing-slot" title="${escapeHtml(displayName)} ×${count}">
        <span class="box-slot-tag">${slotLv}</span>
        <div class="box-slot-content">
          ${iconUrl ? `<img src="${iconUrl}" class="box-slot-icon" alt="${escapeHtml(displayName)}">` : ''}
          <span class="box-slot-count">×${count}</span>
        </div>
      </div>
    `;
  }

  function renderBoxTableIngCell(ingName, basePkm, slotIdx) {
    if (!ingName || ingName === '--') {
      return `<td><span class="text-muted" style="font-size:11px;">--</span></td>`;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);

    return `
      <td class="td-ing" title="${escapeHtml(displayName)} ×${count}">
        <div class="ing-cell">
          ${iconUrl ? `<img src="${iconUrl}" class="ing-icon" alt="${escapeHtml(displayName)}">` : ''}
          <span class="ing-count">×${count}</span>
        </div>
      </td>
    `;
  }

  function renderBoxGrid(list, container) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    container.innerHTML = `
      <div class="box-grid">
        ${list.map(p => {
          const base = findPokemonBase(p.pokemonId || p.name);
          const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
          const natureObj = NATURE_DATA.find(n => n.name === p.nature);
          const prInfo = calculatePokemonPR(p, base);
          const pkmDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : p.name) : (p.name || (base ? base.name_cn : '未知'));
          const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
          const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;
          const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
          const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

          return `
            <div class="box-card" data-uid="${p.uid}">
              <div class="box-card-header">
                <div class="box-card-img-wrap">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="box-card-icon" onerror="this.style.display='none';">` : ''}
                </div>
                <div class="box-card-info">
                  <div class="box-card-name-row">
                    <span class="box-card-name">${escapeHtml(pkmDisplayName)}</span>
                    <span class="box-card-level">Lv.${p.level || 1}</span>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}" title="PR: ${prInfo.pr}/100">
                      PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </div>
                  ${p.nickname ? `<div class="box-card-nickname">${escapeHtml(p.nickname)}</div>` : ''}
                  <div class="box-card-tags">
                    ${berry && berry.icon ? `
                    <span class="pkm-berry-icon-wrapper" title="${berryName}">
                      <img src="${berry.icon}" alt="${berryName}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;">
                    </span>` : ''}
                    <span class="box-spec-tag">${specName}</span>
                    ${p.ribbon ? `
                      <span class="box-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${p.ribbon}` : `睡飽飽獎章`}">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${p.ribbon}.png" class="box-ribbon-icon" alt="Ribbon" />
                      </span>
                    ` : ''}
                  </div>
                </div>
                <div class="box-card-actions">
                  <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '深度診斷報告書與六維雷達圖'}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  </button>
                  <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯寶可夢'}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除寶可夢'}">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- PR 智能簡評 -->
              <div class="box-pr-summary-bar">
                <span class="box-pr-summary-label">${isEN ? 'PR Rating:' : '潛力評價：'}</span>
                <span class="box-pr-summary-text">${escapeHtml(prInfo.summaryNote)}</span>
              </div>

              <!-- 食材插槽組合 (圖標與數量徽章) -->
              <div class="box-card-section">
                <div class="box-section-title">${isEN ? 'Ingredients' : '食材組合'}</div>
                <div class="box-ing-slots">
                  ${renderBoxCardIngSlot(p.ing1, 'Lv.1', base, 0)}
                  ${renderBoxCardIngSlot(p.ing2, 'Lv.30', base, 1)}
                  ${renderBoxCardIngSlot(p.ing3, 'Lv.60', base, 2)}
                </div>
              </div>

              <!-- 副技能清單 -->
              <div class="box-card-section">
                <div class="box-section-title">${isEN ? 'Sub-Skills' : '副技能組合'}</div>
                <div class="box-subskills-grid">
                  ${[10, 25, 50, 70, 80].map((lv, i) => {
                    const skName = (p.subskills || [])[i];
                    const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                    const tier = sk ? sk.tier : 'empty';
                    const displaySkName = skName ? (window.I18N ? window.I18N.getSubSkillName(skName) : skName) : '--';
                    return `
                      <div class="box-subskill-pill subskill-${tier}" title="${sk ? sk.desc : ''}">
                        <span class="subskill-lv-badge">Lv.${lv}</span>
                        <span class="subskill-name">${escapeHtml(displaySkName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- 性格與修正 -->
              <div class="box-card-footer">
                <div class="box-nature-info">
                  <span class="box-nature-label">${isEN ? 'Nature:' : '性格：'}</span>
                  <span class="box-nature-badge">${escapeHtml(natureDisplayName || (isEN ? 'Hardy' : '坦率'))}</span>
                </div>
                ${natureObj && natureObj.buff ? `
                  <div class="box-nature-effects">
                    ${natureObj.buff !== '無增減' ? `
                      <span class="nature-buff">${isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff}</span>
                      <span class="nature-debuff">${isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff}</span>
                    ` : `<span class="nature-neutral">${isEN ? 'Neutral' : '無修正'}</span>`}
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
    bindCardActions(container);
  }

  function renderBoxTable(list, container) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const t = (k, def) => window.I18N ? window.I18N.t(k, def) : def;
    container.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table box-table">
          <thead>
            <tr>
              <th>${t('th.icon', '圖示')}</th>
              <th>${isEN ? 'Name / Nickname' : '寶可夢 / 暱稱'}</th>
              <th>${isEN ? 'Level' : '等級'}</th>
              <th>${isEN ? 'PR Rank' : 'PR 評分'}</th>
              <th>${t('th.berry', '樹果')}</th>
              <th>${t('th.specialty', '得意')}</th>
              <th>${t('th.ing1', 'Lv.1 食材')}</th>
              <th>${t('th.ing2', 'Lv.30 食材')}</th>
              <th>${t('th.ing3', 'Lv.60 食材')}</th>
              <th>${isEN ? 'Sub-Skills' : '副技能 (Lv.10 ~ 80)'}</th>
              <th>${isEN ? 'Nature' : '性格'}</th>
              <th>${isEN ? 'Actions' : '操作'}</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => {
              const base = findPokemonBase(p.pokemonId || p.name);
              const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
              const natureObj = NATURE_DATA.find(n => n.name === p.nature);
              const prInfo = calculatePokemonPR(p, base);
              const pkmDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : p.name) : (p.name || (base ? base.name_cn : '未知'));
              const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
              const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;
              const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
              const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

              return `
                <tr data-uid="${p.uid}">
                  <td>
                    <div class="table-icon-wrapper">
                      ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="table-icon" onerror="this.style.display='none';">` : ''}
                    </div>
                  </td>
                  <td>
                    <div class="table-name-cn" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                      <span>${escapeHtml(pkmDisplayName)}</span>
                      ${p.ribbon ? `<span class="box-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${p.ribbon}` : `睡飽飽獎章`}"><img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${p.ribbon}.png" class="box-ribbon-icon" alt="Ribbon" /></span>` : ''}
                    </div>
                    ${p.nickname ? `<div style="font-size:11px;color:var(--accent-color);">${escapeHtml(p.nickname)}</div>` : ''}
                  </td>
                  <td><span class="box-table-lvl">Lv.${p.level || 1}</span></td>
                  <td>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}">
                      PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </td>
                  <td>
                    ${berry && berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}">` : `<span class="berry-name-text">${berryName || '--'}</span>`}
                  </td>
                  <td>${specName}</td>
                  ${renderBoxTableIngCell(p.ing1, base, 0)}
                  ${renderBoxTableIngCell(p.ing2, base, 1)}
                  ${renderBoxTableIngCell(p.ing3, base, 2)}
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      ${(p.subskills || []).map((skName) => {
                        const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                        const tier = sk ? sk.tier : 'white';
                        const displaySkName = window.I18N ? window.I18N.getSubSkillName(skName) : skName;
                        return `<span class="box-subskill-pill subskill-${tier}" style="font-size:11px;padding:1px 6px;">${escapeHtml(displaySkName)}</span>`;
                      }).join('')}
                    </div>
                  </td>
                  <td>
                    <div><strong>${escapeHtml(natureDisplayName || (isEN ? 'Hardy' : '坦率'))}</strong></div>
                    ${natureObj && natureObj.buff ? `<div style="font-size:10.5px;" class="nature-buff">${natureObj.buff !== '無增減' ? (isEN ? `${natureObj.buff_en} ${natureObj.debuff_en}` : `${natureObj.buff} ${natureObj.debuff}`) : (isEN ? 'Neutral' : '無修正')}</div>` : ''}
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '深度診斷報告'}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯'}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除'}">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindCardActions(container);
  }

  function bindCardActions(container) {
    container.querySelectorAll('.btn-appraise').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          const isMobileH5 = document.body.classList.contains('mobile-h5-app');
          if (isMobileH5 && typeof window.switchBoxSubtab === 'function') {
            window.AppraisalLab.loadBoxItem(item);
            window.switchBoxSubtab('lab');
          } else {
            const base = findPokemonBase(item.pokemonId || item.name);
            window.AppraisalLab.openModal({
              pkm: base,
              level: item.level || 30,
              nature: item.nature || '坦率',
              subskills: item.subskills || [],
              ingredients: [item.ing1, item.ing2, item.ing3],
              ribbon: item.ribbon || 0
            });
          }
        }
      });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item) openBoxEditModal(item);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        const msg = isEN ? `Are you sure you want to delete "${item.name || 'this Pokémon'}" from your Box?` : `確定要從倉庫刪除「${item.name || '這隻寶可夢'}」嗎？`;
        if (item && confirm(msg)) {
          userBox = userBox.filter(p => p.uid !== uid);
          saveUserBox();
          renderBox();
        }
      });
    });
  }

  /* ─── 視覺化確認與編輯彈窗 ───────────────────────────────── */
  let activeSubskillSlot = 1; // 1 to 5

  /* ─── 睡飽飽獎章動態效果選單更新 (依據寶可夢進化形態不同動態調整) ── */
  function updateRibbonSelectOptions(p) {
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (!ribbonSelect) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 計算剩餘進化次數
    let remainingEvos = 0;
    if (p) {
      if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
        remainingEvos = window.AppraisalLab.getRemainingEvolutions(p);
      } else {
        const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
        remainingEvos = isFinal ? 0 : 1;
      }
    }

    // 記住當前選取值
    const currentVal = ribbonSelect.value || '0';

    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    let opt2Text = '';
    let opt3Text = isEN ? '1000 hrs (+6 Carry Limit)' : '1000 小時 (+6 持有上限)';
    let opt4Text = '';

    if (!p) {
      // 未選擇寶可夢時的通用預設文案
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed Boost)' : '500 小時 (+3 持有上限 · 幫速加成)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Max Speed Boost)' : '2000 小時 (+8 持有上限 · 幫速最大加成)';
    } else if (remainingEvos === 2) {
      // 尚可進化 2 次 (例如：小火龍、小貓怪、皮丘)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -11%)' : '500 小時 (+3 持有上限 · 幫速加成 -11%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -25%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -25%)';
    } else if (remainingEvos === 1) {
      // 尚可進化 1 次 (例如：火恐龍、勒克貓、皮卡丘、伊布)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -5%)' : '500 小時 (+3 持有上限 · 幫速加成 -5%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -12%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -12%)';
    } else {
      // 最終進化形或無法進化的寶可夢 (例如：噴火龍、倫琴貓、凱羅斯) -> 無幫速加成
      opt2Text = isEN ? '500 hrs (+3 Carry Limit)' : '500 小時 (+3 持有上限)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit)' : '2000 小時 (+8 持有上限)';
    }

    const optionsData = [
      { val: '0', text: isEN ? 'None (0h)' : '未佩戴 (0h)', icon: '' },
      { val: '1', text: isEN ? '200 hrs (+1 Carry Limit)' : '200 小時 (+1 持有上限)', icon: `${base}assets/ribbons/ribbon_lv1.png` },
      { val: '2', text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
      { val: '3', text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
      { val: '4', text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
    ];

    ribbonSelect.innerHTML = optionsData.map(o => `
      <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${o.text}</option>
    `).join('');

    ribbonSelect.value = currentVal;

    // 同步自訂下拉元件
    if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
      window.setupCustomSelect(ribbonSelect);
    } else if (ribbonSelect._customized) {
      ribbonSelect.dispatchEvent(new Event('sync-ui'));
    }
  }

  /* ─── 取得主技能的最大等級上限 (6 / 7 / 8) ─────────────────── */
  function getMainSkillMaxLevel(name) {
    if (!name) return 7;
    const clean = String(name).trim();

    // 1. 夢之碎片系列（夢之碎片獲取S、波導彈）：官方上限 Lv. 8
    if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) {
      return 8;
    }

    // 2. 能量填充 / 蓄力 / 夢魘 系列：官方上限 Lv. 7
    if (clean.includes('能量填充') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘')) {
      return 7;
    }

    // 3. 食材系列（獲取、精選、怪力鉗、超幸運、正電、禮物）：官方上限 Lv. 7
    if (clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物')) {
      return 7;
    }

    // 4. 料理鍋系列：料理強化為 Lv. 7，料理成功為 Lv. 6
    if (clean.includes('料理強化') || clean.includes('Cooking Power') || clean.includes('負電')) {
      return 7;
    }
    if (clean.includes('料理成功') || clean.includes('Extra Tasty')) {
      return 6;
    }

    // 5. 幫手系列：幫手支援為 Lv. 7，幫手加速（屬性）為 Lv. 6
    if (clean.includes('幫手支援') || clean.includes('Helper Support')) {
      return 7;
    }
    if (clean.includes('幫手加速') || clean.includes('Helper Boost')) {
      return 6;
    }

    // 6. 樹果遽增系列 / 領域系列：官方上限 Lv. 6
    if (clean.includes('樹果遽增') || clean.includes('Berry Burst') || clean.includes('畫皮') || clean.includes('流星群') || clean.includes('精神擊破') || clean.includes('樹果領域') || clean.includes('Psystrike')) {
      return 6;
    }

    // 7. 活力恢復系列（全體療癒、活力療癒、活力填充/充填、月光、新月祈禱、蹭蹭臉頰、治癒波動、樹果汁）：官方上限 Lv. 6
    if (clean.includes('活力') || clean.includes('療癒') || clean.includes('充填') || clean.includes('月光') || clean.includes('新月祈禱') || clean.includes('蹭蹭臉頰') || clean.includes('治癒波動') || clean.includes('樹果汁') || clean.includes('Energizing Cheer') || clean.includes('Energy for Everyone') || clean.includes('Charge Energy')) {
      return 6;
    }

    // 8. 料理輔助 / 揮指 / 變身 / 模仿：官方上限 Lv. 7
    if (clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') || clean.includes('揮指') || clean.includes('十項全能') || clean.includes('Metronome') || clean.includes('變身') || clean.includes('模仿') || clean.includes('Transform') || clean.includes('Mimic')) {
      return 7;
    }

    // 9. 從 window.WikiDB 動態比對
    if (typeof window !== 'undefined' && window.WikiDB && Array.isArray(window.WikiDB.MAIN_SKILLS_DATA)) {
      const norm = clean.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '');
      const found = window.WikiDB.MAIN_SKILLS_DATA.find(s => s.name.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '') === norm);
      if (found && found.maxLevel) return found.maxLevel;
    }

    return 7;
  }

  /* ─── 主技能展示與等級更新 (動態依技能上限調整 Lv.1 ~ Lv.max) ─── */
  function updateModalMainSkill(p, targetLevel = null) {
    const skillEl = document.getElementById('modal-poke-main-skill-name');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');

    const skillName = p ? (p.main_skill || '--') : '--';
    if (skillEl) {
      const displaySkillName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getSkillName === 'function') 
        ? window.I18N.getSkillName(skillName) 
        : skillName;
      skillEl.textContent = displaySkillName;
      skillEl.setAttribute('title', skillName);
    }

    if (skillLevelSelect) {
      const maxLvl = p && p.main_skill ? getMainSkillMaxLevel(p.main_skill) : 7;
      let desiredLvl;
      if (targetLevel != null) {
        desiredLvl = parseInt(targetLevel, 10);
      } else {
        const cur = parseInt(skillLevelSelect.value, 10);
        desiredLvl = !isNaN(cur) && cur > 0 ? cur : 1;
      }
      const clampedLvl = Math.max(1, Math.min(maxLvl, desiredLvl));

      // 動態更新下拉選單選項至該主技能之最大上限 (Lv.1 ~ Lv.maxLvl)
      const options = [];
      for (let i = 1; i <= maxLvl; i++) {
        options.push(`<option value="${i}" ${i === clampedLvl ? 'selected' : ''}>Lv. ${i}</option>`);
      }
      skillLevelSelect.innerHTML = options.join('');
      skillLevelSelect.value = String(clampedLvl);

      // 同步自訂下拉元件
      if (typeof window !== 'undefined' && typeof window.setupCustomSelect === 'function' && !skillLevelSelect._customized) {
        window.setupCustomSelect(skillLevelSelect);
      } else if (skillLevelSelect._customized) {
        skillLevelSelect.dispatchEvent(new Event('sync-ui'));
      }
    }
  }

  /* ─── 寶可夢名稱 Combobox 搜尋選擇器 ───────────────────────── */
  function initPokemonCombobox(existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const searchInput = document.getElementById('modal-poke-search');
    const nameHidden = document.getElementById('modal-poke-name');
    const dropdown = document.getElementById('box-pkm-dropdown');
    const toggleBtn = document.getElementById('box-pkm-dropdown-toggle');
    if (!searchInput || !nameHidden || !dropdown) return;

    const CHEVRON_ICON = `<svg viewBox="0 0 12 8" width="12" height="8"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;
    const CLEAR_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    function syncToggleBtnIcon() {
      if (!toggleBtn) return;
      const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
      if (hasText) {
        toggleBtn.innerHTML = CLEAR_ICON;
        toggleBtn.title = isEN ? 'Clear selection' : '清除已選寶可夢';
        toggleBtn.setAttribute('aria-label', isEN ? 'Clear selection' : '清除已選寶可夢');
      } else {
        toggleBtn.innerHTML = CHEVRON_ICON;
        toggleBtn.title = isEN ? 'Expand list' : '展開寶可夢列表';
        toggleBtn.setAttribute('aria-label', isEN ? 'Expand list' : '展開寶可夢列表');
      }
    }

    const initialPkm = existingItem
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name)
      : null;

    function renderDropdown(filterText = '') {
      const q = (filterText || '').trim().toLowerCase();
      let matchedItems = [];

      const numMatch = q.match(/^(?:#|no\.?\s*)?(\d+)$/i);
      const isNumQuery = !!numMatch;
      const qDigits = numMatch ? numMatch[1] : '';
      const qNoZero = qDigits.replace(/^0+/, '');

      if (!q) {
        matchedItems = allPokemonsRef.slice();
      } else if (isNumQuery && qDigits) {
        // 純數字編號智能查找：只要編號有任何符合 (包含 formatted_no, id, 無前導零) 全部列出
        allPokemonsRef.forEach(p => {
          const fNo = String(p.formatted_no || '');
          const idStr = String(p.id || '');
          const cleanNo = fNo.replace(/^0+/, '');
          const pad4 = fNo.padStart(4, '0');

          let rank = 0;
          if (idStr === qDigits || cleanNo === qDigits || (qNoZero && cleanNo === qNoZero) || fNo === qDigits || pad4 === qDigits) {
            rank = 1; // 完全精確比對，最優先展示
          } else if ((qNoZero && cleanNo.startsWith(qNoZero)) || cleanNo.startsWith(qDigits) || fNo.startsWith(qDigits)) {
            rank = 2; // 前綴符合 (例如輸入 40 時，400, 403, 404, 405 優先展示)
          } else if (fNo.includes(qDigits) || idStr.includes(qDigits) || cleanNo.includes(qDigits) || pad4.includes(qDigits) || (qNoZero && idStr.includes(qNoZero))) {
            rank = 3; // 包含符合 (例如輸入 40 時，140, 240, 340 也列出供挑選)
          } else if (typeof window.matchesPokemonSearch === 'function' && window.matchesPokemonSearch(p, q)) {
            rank = 4; // 名稱或同音錯字符合
          }

          if (rank > 0) {
            matchedItems.push({ p, rank });
          }
        });

        matchedItems.sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          const noA = parseInt(a.p.id || a.p.formatted_no, 10) || 0;
          const noB = parseInt(b.p.id || b.p.formatted_no, 10) || 0;
          return noA - noB;
        });

        matchedItems = matchedItems.map(item => item.p);
      } else {
        matchedItems = allPokemonsRef.filter(p => {
          if (typeof window.matchesPokemonSearch === 'function') {
            return window.matchesPokemonSearch(p, q);
          }
          const cn = (p.name_cn || '').toLowerCase();
          const en = (p.name_en || '').toLowerCase();
          return cn.includes(q) || en.includes(q);
        });
      }

      renderFilteredItems(matchedItems);
    }

    if (typeof window !== 'undefined') {
      window._boxRenderDropdown = renderDropdown;
    }

    function renderFilteredItems(items) {
      if (items.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '找不到符合之寶可夢'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = items.map(p => {
        const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
        const isSelected = nameHidden.value === p.name_cn;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';

        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" alt="${escapeHtml(pkmDisplayName)}" loading="lazy" onerror="this.src='https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png'">
            <div class="box-pkm-dropdown-info">
              <div class="box-pkm-dropdown-name">
                <span>No.${p.formatted_no} ${escapeHtml(pkmDisplayName)}</span>
              </div>
            </div>
            ${isSelected ? '<span style="color:var(--accent-blue);font-weight:bold;font-size:12px;">✓</span>' : ''}
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.box-pkm-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const pName = item.getAttribute('data-name');
          const found = allPokemonsRef.find(p => p.name_cn === pName);
          if (found) {
            selectPokemonInCombobox(found, true);
          }
        });
      });

      dropdown.style.display = 'block';
    }

    const POKEBALL_PLACEHOLDER_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%23334155' stroke='%2364748b' stroke-width='2'/><path d='M2 20h36' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='6' fill='%231e293b' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='2.5' fill='%2394a3b8'/></svg>";

    function updateSelectedPokemonAvatar(p) {
      const avatarImg = document.getElementById('modal-poke-selected-avatar');
      if (!avatarImg) return;
      if (p) {
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || POKEBALL_PLACEHOLDER_SVG;
        avatarImg.src = avatarUrl;
        avatarImg.alt = p.name_cn || 'Pokémon';
        avatarImg.onerror = () => {
          avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        };
      } else {
        avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        avatarImg.alt = 'Pokémon';
      }
    }

    function selectPokemonInCombobox(p, userChanged = false, existing = null) {
      if (!p) return;
      nameHidden.value = p.name_cn;
      const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
      searchInput.value = `No.${p.formatted_no} ${pkmDisplayName}`;
      dropdown.style.display = 'none';
      updateSelectedPokemonAvatar(p);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(p, existing);
      updateRibbonSelectOptions(p);
      updateModalMainSkill(p);
    }

    if (initialPkm) {
      selectPokemonInCombobox(initialPkm, false, existingItem);
    } else {
      nameHidden.value = '';
      searchInput.value = '';
      updateSelectedPokemonAvatar(null);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(null, null);
      updateRibbonSelectOptions(null);
      updateModalMainSkill(null);
    }

    searchInput.onfocus = () => {
      renderDropdown(searchInput.value.replace(/^No\.\d+\s*/, ''));
    };

    searchInput.oninput = () => {
      syncToggleBtnIcon();
      if (!searchInput.value.trim()) {
        nameHidden.value = '';
        updateSelectedPokemonAvatar(null);
        renderTiledIngredientPickers(null, null);
        updateRibbonSelectOptions(null);
        updateModalMainSkill(null);
      }
      renderDropdown(searchInput.value);
    };

    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
        if (hasText) {
          searchInput.value = '';
          nameHidden.value = '';
          updateSelectedPokemonAvatar(null);
          syncToggleBtnIcon();
          renderTiledIngredientPickers(null, null);
          updateRibbonSelectOptions(null);
          updateModalMainSkill(null);
          renderDropdown('');
          searchInput.focus();
        } else {
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          } else {
            renderDropdown('');
            searchInput.focus();
          }
        }
      };
    }

    // 點擊外面關閉下拉選單
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#box-pkm-combobox')) {
        dropdown.style.display = 'none';
      }
    });
  }

  /* ─── 解鎖食材組合平鋪選擇器 (符合官方解鎖規則：Lv.1=A, Lv.30=A/B, Lv.60=A/B/C) ── */
  function renderTiledIngredientPickers(basePkm, existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const slots = [
      { key: 'ing1', level: 1, containerId: 'modal-ing-options-1' },
      { key: 'ing2', level: 30, containerId: 'modal-ing-options-2' },
      { key: 'ing3', level: 60, containerId: 'modal-ing-options-3' }
    ];

    if (!basePkm) {
      slots.forEach(slot => {
        const hiddenInput = document.getElementById(`modal-${slot.key}`);
        const container = document.getElementById(slot.containerId);
        if (hiddenInput) hiddenInput.value = '';
        if (container) container.innerHTML = `<span class="box-ing-placeholder-slot">--</span>`;
      });
      return;
    }

    const ingList = (basePkm && basePkm.ingredients && basePkm.ingredients.length > 0)
      ? basePkm.ingredients
      : [{ name: '特選蘋果' }, { name: '暖暖薑' }, { name: '美味尾巴' }];

    const ingA = ingList[0] || { name: '特選蘋果' };
    const ingB = ingList[1] || ingA;
    const ingC = ingList[2] || ingB || ingA;

    // 依照遊戲規則建立各等級可選食材庫
    const rawLv30 = [ingA, ingB];
    const uniqueLv30 = Array.from(new Set(rawLv30.map(i => i.name))).map(n => rawLv30.find(i => i.name === n));

    const rawLv60 = [ingA, ingB, ingC];
    const uniqueLv60 = Array.from(new Set(rawLv60.map(i => i.name))).map(n => rawLv60.find(i => i.name === n));

    const slotConfigs = [
      {
        key: 'ing1',
        level: 1,
        containerId: 'modal-ing-options-1',
        allowed: [ingA],
        defaultVal: (existingItem && existingItem.ing1) || ingA.name // 預設食材 A
      },
      {
        key: 'ing2',
        level: 30,
        containerId: 'modal-ing-options-2',
        allowed: uniqueLv30,
        defaultVal: (existingItem && existingItem.ing2) || ingA.name // 預設食材 A
      },
      {
        key: 'ing3',
        level: 60,
        containerId: 'modal-ing-options-3',
        allowed: uniqueLv60,
        defaultVal: (existingItem && existingItem.ing3) || ingA.name // 預設食材 A
      }
    ];

    slotConfigs.forEach(slot => {
      const hiddenInput = document.getElementById(`modal-${slot.key}`);
      const container = document.getElementById(slot.containerId);
      if (!hiddenInput || !container) return;

      // 檢查 defaultVal 是否在允許列表中
      const isDefaultValid = slot.allowed.some(i => i.name === slot.defaultVal);
      hiddenInput.value = isDefaultValid ? slot.defaultVal : slot.allowed[0].name;

      container.innerHTML = slot.allowed.map(ing => {
        const isSelected = hiddenInput.value === ing.name;
        const ingDisplayName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
        const iconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';

        return `
          <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot="${slot.key}" data-ing="${escapeHtml(ing.name)}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}">
            <img src="${iconUrl}" class="box-ing-opt-icon" alt="${escapeHtml(ingDisplayName)}" loading="lazy">
          </button>
        `;
      }).join('');

      container.querySelectorAll('.box-ing-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const ingName = btn.getAttribute('data-ing');
          hiddenInput.value = ingName;
          container.querySelectorAll('.box-ing-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });
  }

  /* ─── 單行 5 階副技能插槽 + 平鋪副技能選擇盤 ──────────────────── */
  function initSubskillFlowPicker(initialSubskills = []) {
    activeSubskillSlot = 1;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    for (let slot = 1; slot <= 5; slot++) {
      const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
      if (hiddenInput) {
        hiddenInput.value = (initialSubskills && initialSubskills[slot - 1]) || '';
      }
    }

    function updateSubskillUI() {
      // 1. 更新 5 個插槽按鈕
      const slotBtns = document.querySelectorAll('.box-subskill-slot-btn');
      slotBtns.forEach(btn => {
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
        const curVal = hiddenInput ? hiddenInput.value : '';
        const valBadge = btn.querySelector('.slot-val-badge');

        if (slot === activeSubskillSlot) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        if (valBadge) {
          if (!curVal) {
            valBadge.className = 'slot-val-badge slot-val-empty';
            valBadge.textContent = isEN ? '-- None --' : '-- 未解鎖 --';
          } else {
            const sk = SUBSKILLS_DATA.find(s => s.name === curVal);
            const tier = sk ? sk.tier : 'white';
            const skDisplayName = window.I18N ? window.I18N.getSubSkillName(curVal) : curVal;
            valBadge.className = `slot-val-badge box-subskill-pill subskill-${tier}`;
            valBadge.textContent = skDisplayName;
          }
        }
      });

      // 2. 獲取所有目前已被使用的副技能
      const usedSkills = new Set();
      for (let slot = 1; slot <= 5; slot++) {
        const input = document.getElementById(`modal-subskill-${slot}`);
        if (input && input.value) usedSkills.add(input.value);
      }

      // 3. 渲染平鋪副技能晶片
      ['gold', 'blue', 'white'].forEach(tier => {
        const container = document.getElementById(`subskill-chips-${tier}`);
        if (!container) return;

        const skillsInTier = SUBSKILLS_DATA.filter(s => s.tier === tier);
        container.innerHTML = skillsInTier.map(sk => {
          const skDisplayName = window.I18N ? window.I18N.getSubSkillName(sk.name) : sk.name;
          const isUsed = usedSkills.has(sk.name);
          return `
            <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" ${isUsed ? 'disabled' : ''} title="${escapeHtml(skDisplayName)}${isUsed ? (isEN ? ' (Already Selected)' : '（已選用）') : ''}">
              <span>${escapeHtml(skDisplayName)}</span>
              ${isUsed ? '<span style="font-size:10px;opacity:0.8;">✓</span>' : ''}
            </button>
          `;
        }).join('');

        container.querySelectorAll('.box-subskill-chip').forEach(chip => {
          chip.addEventListener('click', (e) => {
            e.preventDefault();
            if (chip.disabled || chip.classList.contains('in-use')) return;
            const skName = chip.getAttribute('data-name');
            const targetInput = document.getElementById(`modal-subskill-${activeSubskillSlot}`);
            if (targetInput) {
              targetInput.value = skName;
            }
            // 自動推進到下一個未選取的插槽
            let nextEmptySlot = -1;
            for (let s = 1; s <= 5; s++) {
              const inp = document.getElementById(`modal-subskill-${s}`);
              if (inp && !inp.value) {
                nextEmptySlot = s;
                break;
              }
            }
            if (nextEmptySlot !== -1) {
              activeSubskillSlot = nextEmptySlot;
            } else if (activeSubskillSlot < 5) {
              activeSubskillSlot += 1;
            } else {
              activeSubskillSlot = 1;
            }
            updateSubskillUI();
          });
        });
      });
    }

    // 綁定插槽按鈕點擊
    document.querySelectorAll('.box-subskill-slot-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        activeSubskillSlot = slot;
        updateSubskillUI();
      };
    });

    // 綁定清空全部副技能按鈕
    const clearBtn = document.getElementById('box-subskill-clear-all-btn') || document.getElementById('box-subskill-clear-active-btn');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        for (let slot = 1; slot <= 5; slot++) {
          const targetInput = document.getElementById(`modal-subskill-${slot}`);
          if (targetInput) {
            targetInput.value = '';
          }
        }
        activeSubskillSlot = 1;
        updateSubskillUI();
      };
    }

    updateSubskillUI();
  }

  /* ─── 開啟編輯/新增彈窗 ─────────────────────────────────── */
  function openBoxEditModal(existingItem = null, screenshotSrc = null) {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isEdit = !!existingItem;
    const titleEl = document.getElementById('box-modal-title');
    if (titleEl) {
      titleEl.textContent = isEdit 
        ? (isEN ? 'Edit Pokémon' : '編輯寶可夢') 
        : (screenshotSrc ? (isEN ? 'Confirm OCR Entry' : '截圖辨識確認入庫') : (isEN ? 'Add Pokémon' : '手動新增寶可夢'));
    }

    // 填寫預設值
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    form.setAttribute('data-editing-uid', isEdit ? existingItem.uid : '');

    // 截圖預覽區
    const previewContainer = document.getElementById('box-modal-screenshot-preview');
    if (previewContainer) {
      if (screenshotSrc) {
        previewContainer.innerHTML = `
          <div class="box-screenshot-preview-wrap">
            <span class="box-screenshot-preview-tag">${isEN ? 'Original Screenshot' : '原始截圖對照'}</span>
            <img src="${screenshotSrc}" alt="Screenshot" class="box-screenshot-img">
          </div>
        `;
        previewContainer.style.display = 'block';
      } else {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
      }
    }

    // 1. 初始化寶可夢 Combobox 搜尋選擇器
    initPokemonCombobox(existingItem);

    // 2. 等級 (手動新增不給預設值)
    const levelInput = document.getElementById('modal-poke-level');
    if (levelInput) levelInput.value = existingItem ? (existingItem.level || '') : '';

    // 3. 暱稱
    const nickInput = document.getElementById('modal-poke-nickname');
    if (nickInput) nickInput.value = existingItem ? (existingItem.nickname || '') : '';

    // 4. 性格選單
    const natureSelect = document.getElementById('modal-poke-nature');
    if (natureSelect) {
      natureSelect.innerHTML = NATURE_DATA.map(n => {
        const natDisplayName = window.I18N ? window.I18N.getNatureName(n.name) : n.name;
        const buffLabel = isEN ? (n.buff_en || n.buff) : n.buff;
        const debuffLabel = isEN ? (n.debuff_en || n.debuff) : n.debuff;
        return `
        <option value="${n.name}" ${existingItem && existingItem.nature === n.name ? 'selected' : (n.name === '固執' && !existingItem ? 'selected' : '')}>
          ${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ''})
        </option>
      `;}).join('');

      if (typeof window.setupCustomSelect === 'function' && !natureSelect._customized) {
        window.setupCustomSelect(natureSelect);
      } else if (natureSelect._customized) {
        natureSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.5 睡飽飽獎章選單 (依據選取寶可夢更新動態文案)
    const currentSelectedPkm = existingItem 
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name) 
      : null;
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (ribbonSelect) {
      ribbonSelect.value = String(existingItem && existingItem.ribbon != null ? existingItem.ribbon : '0');
      updateRibbonSelectOptions(currentSelectedPkm);
      if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
        window.setupCustomSelect(ribbonSelect);
      } else if (ribbonSelect._customized) {
        ribbonSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.6 主技能展示與技能等級選單 (依據該主技能上限動態生成 Lv.1 ~ Lv.max)
    const initialSkillLevel = existingItem && existingItem.skillLevel != null ? existingItem.skillLevel : 1;
    updateModalMainSkill(currentSelectedPkm, initialSkillLevel);

    // 5. 初始化副技能單行插槽 + 選擇盤
    initSubskillFlowPicker(existingItem ? existingItem.subskills : []);

    const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
    if (dialog && dialog.classList) {
      if (screenshotSrc) {
        dialog.classList.add('has-screenshot');
      } else {
        dialog.classList.remove('has-screenshot');
      }
    }

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
  }

  function closeBoxEditModal() {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
      if (dialog && dialog.classList) dialog.classList.remove('has-screenshot');
    };
    if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(modal, done);
    else { modal.style.display = 'none'; done(); }
  }

  /* ─── 儲存編輯表單 ─────────────────────────────────────── */
  function handleFormSave(e) {
    e.preventDefault();
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const editingUid = form.getAttribute('data-editing-uid');
    const nameSelect = document.getElementById('modal-poke-name');
    const levelInput = document.getElementById('modal-poke-level');
    const nickInput = document.getElementById('modal-poke-nickname');
    const natureSelect = document.getElementById('modal-poke-nature');
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');
    const ing1Select = document.getElementById('modal-ing1');
    const ing2Select = document.getElementById('modal-ing2');
    const ing3Select = document.getElementById('modal-ing3');

    const pokeName = nameSelect ? nameSelect.value : '';
    if (!pokeName) {
      alert(isEN ? 'Please select a Pokémon.' : '請選擇寶可夢！');
      document.getElementById('modal-poke-search')?.focus();
      return;
    }

    const parsedLevel = parseInt(levelInput ? levelInput.value : '', 10);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 100) {
      alert(isEN ? 'Please enter a valid level (1 ~ 100).' : '請輸入有效的等級 (1 ~ 100)！');
      levelInput?.focus();
      return;
    }

    const base = findPokemonBase(pokeName);
    const maxSkillLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    const rawSkillLevel = skillLevelSelect ? (parseInt(skillLevelSelect.value, 10) || 1) : 1;
    const parsedSkillLevel = Math.max(1, Math.min(maxSkillLvl, rawSkillLevel));

    const subskills = [];
    for (let slot = 1; slot <= 5; slot++) {
      const s = document.getElementById(`modal-subskill-${slot}`);
      if (s && s.value) subskills.push(s.value);
    }

    const ribbonVal = ribbonSelect ? (parseInt(ribbonSelect.value, 10) || 0) : 0;

    const itemData = {
      uid: editingUid || ('pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      pokemonId: base ? base.id : '',
      name: pokeName,
      type: base ? base.type : '一般',
      specialty: base ? base.specialty : '樹果',
      level: parsedLevel,
      skillLevel: parsedSkillLevel,
      nickname: nickInput ? nickInput.value.trim() : '',
      nature: natureSelect ? natureSelect.value : '坦率',
      ribbon: ribbonVal,
      ing1: ing1Select ? ing1Select.value : '',
      ing2: ing2Select ? ing2Select.value : '',
      ing3: ing3Select ? ing3Select.value : '',
      subskills: subskills,
      createdAt: editingUid ? (userBox.find(p => p.uid === editingUid)?.createdAt || Date.now()) : Date.now()
    };

    if (editingUid) {
      const idx = userBox.findIndex(p => p.uid === editingUid);
      if (idx !== -1) userBox[idx] = itemData;
    } else {
      userBox.unshift(itemData);
    }

    saveUserBox();
    closeBoxEditModal();
    renderBox();
  }

  /* ─── 截圖智能分析與 OCR 引擎 (支援單圖與多圖連續批次辨識) ───────────────────────── */
  function makePokemonFingerprint(p) {
    if (!p) return '';
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.name || p.pokemonId || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  async function handleScreenshotFiles(files) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('請上傳圖片檔案 (PNG, JPG, WebP)！');
      return;
    }

    const scannerStatus = document.getElementById('box-scanner-status');

    // 1. 單張截圖流程 (保留單張確認彈窗)
    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      if (scannerStatus) {
        scannerStatus.style.display = 'flex';
        scannerStatus.innerHTML = `<span>正在智能解析截圖中，請稍候...</span>`;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target.result;
        try {
          const parsedData = await parsePokemonScreenshot(imgSrc);
          if (scannerStatus) scannerStatus.style.display = 'none';
          openBoxEditModal(parsedData, imgSrc);
        } catch (err) {
          console.error('Screenshot parse failed:', err);
          if (scannerStatus) scannerStatus.style.display = 'none';
          openBoxEditModal(null, imgSrc);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. 多圖批次辨識入庫流程 (Batch OCR Multi-Import & Smart Deduplication)
    const total = imageFiles.length;
    let importedCount = 0;
    let duplicateCount = 0;
    const importedNames = [];

    // 建立既有特徵指紋集合
    const existingFingerprints = new Set(userBox.map(makePokemonFingerprint));

    if (scannerStatus) {
      scannerStatus.style.display = 'flex';
      scannerStatus.innerHTML = `
        <div class="batch-ocr-progress-card">
          <div class="batch-ocr-header">
            <span class="batch-ocr-title">批次智能辨識入庫中...</span>
            <span id="batch-ocr-counter" class="batch-ocr-counter">0 / ${total}</span>
          </div>
          <div class="batch-ocr-bar-bg">
            <div id="batch-ocr-bar-fill" class="batch-ocr-bar-fill" style="width: 0%;"></div>
          </div>
          <div id="batch-ocr-status-text" class="batch-ocr-status-text">初始化 OCR 引擎中...</div>
        </div>
      `;
    }

    let sharedWorker = null;
    try {
      if (window.Tesseract) {
        sharedWorker = await window.Tesseract.createWorker('chi_tra+eng');
      }
    } catch (e) {
      console.warn('Could not initialize shared Tesseract worker:', e);
    }

    for (let i = 0; i < total; i++) {
      const file = imageFiles[i];
      const statusText = document.getElementById('batch-ocr-status-text');
      const counterEl = document.getElementById('batch-ocr-counter');
      const barFill = document.getElementById('batch-ocr-bar-fill');

      if (statusText) statusText.textContent = `正在辨識：${file.name} (${i + 1}/${total})...`;
      if (counterEl) counterEl.textContent = `${i + 1} / ${total}`;
      if (barFill) barFill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;

      try {
        const imgSrc = await readFileAsDataURL(file);
        const parsed = await parsePokemonScreenshotWithWorker(imgSrc, sharedWorker);

        // 防重保護檢測
        const fp = makePokemonFingerprint(parsed);
        if (existingFingerprints.has(fp)) {
          duplicateCount++;
        } else {
          existingFingerprints.add(fp);
          parsed.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          parsed.createdAt = Date.now();
          userBox.push(parsed);
          importedCount++;
          importedNames.push(parsed.name || '寶可夢');
        }
      } catch (err) {
        console.error(`Error parsing file ${file.name}:`, err);
      }
    }

    if (sharedWorker) {
      try {
        await sharedWorker.terminate();
      } catch (e) {}
    }

    if (scannerStatus) {
      scannerStatus.style.display = 'none';
    }

    if (importedCount > 0) {
      saveUserBox();
      renderBox();
    }

    // 彈出 Toast 通知
    showBoxToast(
      '批次辨識入庫完成！',
      `成功入庫 ${importedCount} 隻寶可夢${duplicateCount > 0 ? ` (已略過 ${duplicateCount} 隻重複截圖)` : ''}${importedNames.length > 0 ? `：${importedNames.slice(0, 5).join('、')}${importedNames.length > 5 ? ' 等' : ''}` : ''}。`,
      importedCount > 0 ? 'success' : 'info'
    );
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ─── 圖像預處理與多錨點 OCR 複合畫布建立 ─────────────────── */
  function buildOcrCompositeCanvas(img) {
    const w = img.naturalWidth || img.width || 472;
    const h = img.naturalHeight || img.height || 1024;

    // 1. 採樣食材像素色彩 (Slot 1, Slot 2, Slot 3)
    let rgbSlots = [
      { r: 240, g: 200, b: 140 },
      { r: 180, g: 105, b: 48 },
      { r: 250, g: 220, b: 160 }
    ];

    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      try {
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = w;
        sampleCanvas.height = h;
        const sCtx = sampleCanvas.getContext('2d');
        sCtx.drawImage(img, 0, 0, w, h);

        const slotCoords = [
          { x: Math.round(w * 0.49), y: Math.round(h * 0.135) },
          { x: Math.round(w * 0.67), y: Math.round(h * 0.135) },
          { x: Math.round(w * 0.83), y: Math.round(h * 0.135) }
        ];

        rgbSlots = slotCoords.map(coord => {
          try {
            const patch = sCtx.getImageData(Math.max(0, coord.x - 4), Math.max(0, coord.y - 4), 9, 9).data;
            let sumR = 0, sumG = 0, sumB = 0, count = 0;
            for (let i = 0; i < patch.length; i += 4) {
              sumR += patch[i];
              sumG += patch[i + 1];
              sumB += patch[i + 2];
              count++;
            }
            return count > 0 ? { r: sumR / count, g: sumG / count, b: sumB / count } : { r: 200, g: 200, b: 200 };
          } catch (e) {
            return { r: 200, g: 200, b: 200 };
          }
        });
      } catch (e) {}
    }

    // 2. 建立複合多錨點高對比畫布
    function cropAndEnhance(sx, sy, sw, sh, scale = 2.5, mode = 'binarize', threshold = 135) {
      if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
      const c = document.createElement('canvas');
      const dw = Math.round(sw * scale);
      const dh = Math.round(sh * scale);
      c.width = Math.max(10, dw);
      c.height = Math.max(10, dh);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

      try {
        const imgData = ctx.getImageData(0, 0, dw, dh);
        const d = imgData.data;

        if (mode === 'red_channel') {
          // 紅色通道增強：綠色文字在紅色通道數值低，轉為深黑文字，白色底維持純白
          for (let i = 0; i < d.length; i += 4) {
            const rVal = d[i];
            const v = rVal < 180 ? 0 : 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
          }
        } else if (mode === 'binarize') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const v = gray < threshold ? 0 : 255;
            d[i] = v;
            d[i + 1] = v;
            d[i + 2] = v;
          }
        } else if (mode === 'contrast') {
          const factor = 2.5;
          for (let i = 0; i < d.length; i += 4) {
            const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
            const cVal = Math.min(255, Math.max(0, factor * (gray - 128) + 128));
            d[i] = cVal;
            d[i + 1] = cVal;
            d[i + 2] = cVal;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}

      return c;
    }

    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return { compositeCanvas: null, rgbSlots };
    }

    const binLv = cropAndEnhance(Math.round(w * 0.18), Math.round(h * 0.10), Math.round(w * 0.32), Math.round(h * 0.04), 3.0, 'red_channel');
    // 主技能卡：僅裁切上半部標題與等級區域（y: 0.36 ~ 0.435），避開下半部長篇說明文字（「隨機獲得24個食材...」），杜絕干擾
    const mainSkill = cropAndEnhance(0, Math.round(h * 0.36), w, Math.round(h * 0.075), 1.2, 'none');
    // 持有上限：裁切「持有上限 21個」區域
    const carryNum = cropAndEnhance(Math.round(w * 0.36), Math.round(h * 0.25), Math.round(w * 0.26), Math.round(h * 0.045), 2.0, 'binarize', 135);

    const row1_y0 = Math.round(h * 0.55), row1_h = Math.round(h * 0.07);
    const row2_y0 = Math.round(h * 0.62), row2_h = Math.round(h * 0.07);
    const row3_y0 = Math.round(h * 0.69), row3_h = Math.round(h * 0.07);
    const col1_x0 = Math.round(w * 0.06), col_w = Math.round(w * 0.42);
    const col2_x0 = Math.round(w * 0.52);

    // 副技能插槽自適應預處理函數：支援已解鎖彩色按鈕與帶鎖白色按鈕
    function cropSubskillSlot(sx, sy, sw, sh) {
      if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
      const scale = 2.5;
      const dw = Math.round(sw * scale);
      const dh = Math.round(sh * scale);
      const c = document.createElement('canvas');
      c.width = Math.max(10, dw);
      c.height = Math.max(10, dh);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

      try {
        const imgData = ctx.getImageData(0, 0, dw, dh);
        const d = imgData.data;

        // 採樣插槽文字中心區域以辨別是否為帶鎖白色按鈕 (淺灰字 minGray > 100) 或彩色按鈕 (深色字 minGray <= 100)
        let minGray = 255;
        const startY = Math.round(dh * 0.35);
        const endY = Math.round(dh * 0.85);
        const startX = Math.round(dw * 0.10);
        const endX = Math.round(dw * 0.90);

        for (let y = startY; y < endY; y++) {
          for (let x = startX; x < endX; x++) {
            const idx = (y * dw + x) * 4;
            const g = d[idx] * 0.299 + d[idx + 1] * 0.587 + d[idx + 2] * 0.114;
            if (g < minGray) minGray = g;
          }
        }

        const isLocked = minGray > 100;
        const threshold = isLocked ? 220 : 135;

        for (let i = 0; i < d.length; i += 4) {
          const gray = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          const v = gray < threshold ? 0 : 255;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
        }

        // 若為鎖定插槽，遮蔽左上角鎖頭徽章 (x: 0~45%, y: 0~42%) 與底部邊界純白化，移除干擾雜訊
        if (isLocked) {
          const badgeW = Math.round(dw * 0.45);
          const badgeH = Math.round(dh * 0.42);
          for (let y = 0; y < badgeH; y++) {
            for (let x = 0; x < badgeW; x++) {
              const idx = (y * dw + x) * 4;
              d[idx] = 255;
              d[idx + 1] = 255;
              d[idx + 2] = 255;
            }
          }
          const bottomCut = Math.round(dh * 0.94);
          for (let y = bottomCut; y < dh; y++) {
            for (let x = 0; x < dw; x++) {
              const idx = (y * dw + x) * 4;
              d[idx] = 255;
              d[idx + 1] = 255;
              d[idx + 2] = 255;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
      } catch (e) {}

      return c;
    }

    const slot1 = cropSubskillSlot(col1_x0, row1_y0, col_w, row1_h);
    const slot2 = cropSubskillSlot(col2_x0, row1_y0, col_w, row1_h);
    const slot3 = cropSubskillSlot(col1_x0, row2_y0, col_w, row2_h);
    const slot4 = cropSubskillSlot(col2_x0, row2_y0, col_w, row2_h);
    const slot5 = cropSubskillSlot(col1_x0, row3_y0, col_w, row3_h);

    const nature = cropAndEnhance(0, Math.round(h * 0.81), w, Math.round(h * 0.13), 2.0, 'contrast');

    const parts = [
      { name: 'BIN_LV', canvas: binLv },
      { name: 'CARRY_NUM', canvas: carryNum },
      { name: 'MAINSKILL', canvas: mainSkill },
      { name: 'SLOT1', canvas: slot1 },
      { name: 'SLOT2', canvas: slot2 },
      { name: 'SLOT3', canvas: slot3 },
      { name: 'SLOT4', canvas: slot4 },
      { name: 'SLOT5', canvas: slot5 },
      { name: 'NATURE', canvas: nature }
    ].filter(p => !!p.canvas);

    const padding = 35;
    const totalH = parts.reduce((acc, p) => acc + p.canvas.height + padding, padding);
    const maxW = Math.max(...parts.map(p => p.canvas.width), 500);

    const compCanvas = document.createElement('canvas');
    compCanvas.width = maxW + 40;
    compCanvas.height = totalH;
    const compCtx = compCanvas.getContext('2d');
    compCtx.fillStyle = '#ffffff';
    compCtx.fillRect(0, 0, compCanvas.width, compCanvas.height);

    let curY = padding;
    for (const part of parts) {
      compCtx.drawImage(part.canvas, 20, curY);
      curY += part.canvas.height + padding;
    }

    return { compositeCanvas: compCanvas, rgbSlots };
  }

  /* ─── 依據持有上限反推睡飽飽獎章 (Carry to Good-Night Ribbon Deduction) ─── */
  function deduceRibbonFromCarry(pkm, currentLvl, subskillsList, carryVal) {
    if (!pkm || carryVal == null || isNaN(carryVal)) return 0;
    const baseCarry = parseInt(pkm.carry, 10) || 20;

    // 副技能解鎖等級門檻：Lv.10, Lv.25, Lv.50, Lv.70, Lv.80 (容錯 70/75 與 80/100)
    const unlockThresholds = [10, 25, 50, 70, 80];
    let subskillCarryBonus = 0;
    const actualLvl = parseInt(currentLvl, 10) || 1;

    for (let i = 0; i < (subskillsList || []).length; i++) {
      const reqLvl = unlockThresholds[i] || 100;
      if (actualLvl >= reqLvl) {
        const skName = subskillsList[i];
        if (skName === '持有上限提升S') subskillCarryBonus += 6;
        else if (skName === '持有上限提升M') subskillCarryBonus += 12;
        else if (skName === '持有上限提升L') subskillCarryBonus += 18;
      }
    }

    const diff = carryVal - baseCarry - subskillCarryBonus;
    if (diff >= 8) return 4;
    if (diff >= 6) return 3;
    if (diff >= 3) return 2;
    if (diff >= 1) return 1;
    return 0;
  }

  /* ─── 多錨點智能 OCR 解析核心 ─────────────────────────────── */
  function normalizeOcrText(txt) {
    if (!txt) return '';
    return txt
      .replace(/\s+/g, '')
      .replace(/[（(]/g, '(')
      .replace(/[）)]/g, ')')
      .replace(/提昇/g, '提升')
      .replace(/機傘/g, '機率')
      .replace(/革忙/g, '幫忙')
      .replace(/事忙/g, '幫忙');
  }

  function parsePokemonFromOcr(text, rgbSlots, allPokemons) {
    const clean = normalizeOcrText(text);

    // 1. 寶可夢名稱智能交叉比對 (主技能唯一性 + 名稱子字串 / 編輯距離)
    let bestPkm = null;
    let maxScore = -1;

    for (const p of allPokemons) {
      let score = 0;
      const cleanName = normalizeOcrText(p.name_cn || '');
      const cleanMainSkill = normalizeOcrText(p.main_skill || '');

      // 名稱完整符合
      if (clean.includes(cleanName)) {
        score += 120;
      } else {
        // 名稱子字串比對 (>= 2 字)
        for (let len = cleanName.length - 1; len >= 2; len--) {
          for (let i = 0; i <= cleanName.length - len; i++) {
            const sub = cleanName.substr(i, len);
            if (clean.includes(sub)) {
              score += len * 25;
              break;
            }
          }
        }
      }

      // 主技能交叉驗證 (大幅排除同名或誤判，如赫拉克羅斯專屬之「健美（料理輔助S）」)
      if (cleanMainSkill) {
        const skillBase = cleanMainSkill.split('(')[0];
        const skillSub = cleanMainSkill.includes('(') ? cleanMainSkill.split('(')[1].replace(')', '') : '';
        if (clean.includes(cleanMainSkill)) {
          score += 100;
        } else if (skillBase && skillBase.length >= 2 && clean.includes(skillBase)) {
          score += 70;
        }
        if (skillSub && clean.includes(skillSub)) {
          score += 50;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestPkm = p;
      }
    }

    // 2. 等級萃取 (優先從頂部資訊卡辨識，避開主技能等級如 Lv.7)
    let level = 30;
    const mainSkillIdx = text.indexOf('健美') !== -1 ? text.indexOf('健美') : (text.indexOf('料理') !== -1 ? text.indexOf('料理') : -1);
    const headerPart = mainSkillIdx > 0 ? text.substring(0, mainSkillIdx) : text;
    const mHeader = headerPart.match(/Lv\.?\s*(\d{1,2})/i) || headerPart.match(/LV\s*(\d{1,2})/i) || normalizeOcrText(headerPart).match(/Lv\.?(\d{1,2})/i);
    if (mHeader) {
      const parsedLvl = parseInt(mHeader[1], 10);
      if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
    } else {
      const mAny = text.match(/Lv\.?\s*(\d{1,2})/i) || normalizeOcrText(text).match(/Lv\.?(\d{1,2})/i);
      if (mAny) {
        const parsedLvl = parseInt(mAny[1], 10);
        if (parsedLvl >= 1 && parsedLvl <= 75) level = parsedLvl;
      }
    }

    // 2.5 主技能等級萃取 (依據該主技能上限 1~6, 7 或 8 級)
    let skillLevel = 1;
    const maxAllowedSkillLvl = bestPkm && bestPkm.main_skill ? getMainSkillMaxLevel(bestPkm.main_skill) : 8;
    const allOcrLines = text.split('\n');
    for (const line of allOcrLines) {
      const normLine = normalizeOcrText(line);
      if (normLine.includes('SP') || (bestPkm && normLine.includes(bestPkm.name_cn))) continue;
      const mSkillLvl = line.match(/(?:Lv\.?|LV)\s*([1-8])\b/) || normLine.match(/Lv\.?([1-8])$/);
      if (mSkillLvl) {
        const parsedSkillLvl = parseInt(mSkillLvl[1], 10);
        if (parsedSkillLvl >= 1 && parsedSkillLvl <= maxAllowedSkillLvl) {
          skillLevel = parsedSkillLvl;
          break;
        }
      }
    }

    // 2.6 持有上限萃取 (從 CARRY_NUM 區域取得，例如「21個」)
    let ocrCarry = null;
    const mCarry = text.match(/持有上限\s*(\d{1,2})\s*個?/) || 
                   text.match(/(\d{1,2})\s*個/) || 
                   normalizeOcrText(text).match(/持有上限(\d{1,2})/) ||
                   normalizeOcrText(text).match(/(\d{1,2})個/);
    if (mCarry) {
      const parsedCarry = parseInt(mCarry[1], 10);
      if (parsedCarry >= 5 && parsedCarry <= 120) {
        ocrCarry = parsedCarry;
      }
    }

    // 3. 性格辨識 (名稱膠囊 + 屬性增減雙向演譯對照)
    let nature = '慎重';
    let nameMatched = false;
    for (const n of NATURE_DATA) {
      if (clean.includes(n.name)) {
        nature = n.name;
        nameMatched = true;
        break;
      }
    }

    if (!nameMatched) {
      function getStatType(str) {
        if (str.includes('食材發現率') || str.includes('食材發現')) return 'ingredient';
        if (str.includes('主技能發動機率') || str.includes('主技能發動') || str.includes('主技能')) return 'skill';
        if (str.includes('活力回復量')) return 'energy';
        if (str.includes('EXP獲得量') || str.includes('EXP獲得')) return 'exp';
        if (str.includes('幫忙速度') && !str.includes('提升') && !str.match(/[SML]$/i)) return 'speed';
        if (str.includes('幫速')) return 'speed';
        return null;
      }

      const allLines = text.split('\n').map(normalizeOcrText).filter(Boolean);
      const natureLines = allLines.slice(-6); // 取底部性格卡相關行
      let buffStat = null;
      let debuffStat = null;

      for (const line of natureLines) {
        const st = getStatType(line);
        if (!st) continue;
        if (!buffStat) {
          buffStat = st;
        } else if (!debuffStat && st !== buffStat) {
          debuffStat = st;
        }
      }

      if (buffStat && debuffStat) {
        const match = NATURE_DATA.find(n => n.buffType === buffStat && n.debuffType === debuffStat);
        if (match) nature = match.name;
      }
    }

    // 4. 副技能 5 個插槽精準提取 (按圖片由上至下、由左至右順序)
    const subskills = [];
    const used = new Set();
    const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);

    function matchLineToSubskill(line) {
      const c = normalizeOcrText(line)
        .replace(/[5$]/g, 'S')
        .replace(/知$/g, 'M')
        .replace(/W$/g, 'M')
        .replace(/!/g, '');

      let best = null;
      let maxS = -1;

      for (const sk of SUBSKILLS_DATA) {
        let s = 0;
        const cleanSk = normalizeOcrText(sk.name);
        if (c.includes(cleanSk)) {
          s = 100;
        } else {
          const lastChar = cleanSk.slice(-1);
          const baseSk = cleanSk.slice(0, -1);
          if (c.includes(baseSk)) {
            s = 65;
            if (c.includes(lastChar)) s += 30;
          } else {
            let overlap = 0;
            for (const char of cleanSk) {
              if (c.includes(char)) overlap++;
            }
            if (overlap >= 2) {
              s = overlap * 15;
              if (c.includes(lastChar)) s += 10;
            }
          }
        }
        if (s > maxS) {
          maxS = s;
          best = sk.name;
        }
      }

      return maxS >= 40 ? best : null;
    }

    for (const line of rawLines) {
      if (line.includes('隨機') || line.includes('效果') || line.includes('移動') || line.includes('每29分')) continue;
      if (line.includes('發動機率') || line.includes('發現率') || line.includes('食材發現')) continue;
      if (line.includes('健美') || line.includes('料理輔助')) continue;
      if ((line.includes('持有上限') && !line.includes('提升')) || line.includes('料理漂亮') || line.includes('成功') || line.includes('持續到')) continue;
      if (line.includes('SP') || (line.includes('個') && !line.includes('提升'))) continue;

      const matched = matchLineToSubskill(line);
      if (matched && !used.has(matched)) {
        subskills.push(matched);
        used.add(matched);
        if (subskills.length === 5) break;
      }
    }

    // 依據持有上限反推睡飽飽獎章
    const deducedRibbon = deduceRibbonFromCarry(bestPkm, level, subskills, ocrCarry);

    // 5. 解鎖食材組合 (結合合法食材庫與色彩採樣)
    let ing1 = '';
    let ing2 = '';
    let ing3 = '';

    if (bestPkm && bestPkm.ingredients && bestPkm.ingredients.length > 0) {
      const ingA = bestPkm.ingredients[0].name;
      const ingB = bestPkm.ingredients[1] ? bestPkm.ingredients[1].name : ingA;
      const ingC = bestPkm.ingredients[2] ? bestPkm.ingredients[2].name : ingB;

      ing1 = ingA; // Lv.1 固定第一種食材

      // Lv.30: 判斷 Slot 2
      if (rgbSlots && rgbSlots[1]) {
        const s2 = rgbSlots[1];
        if (s2.g < 140 && s2.r > 140) {
          ing2 = ingB; // 蘑菇色調
        } else {
          ing2 = ingA; // 蜂蜜色調
        }
      } else {
        ing2 = ingB;
      }

      // Lv.60: 判斷 Slot 3
      if (rgbSlots && rgbSlots[2]) {
        const s3 = rgbSlots[2];
        if (s3.g >= 150) {
          ing3 = ingA; // 明亮黃橘色（蜂蜜）
        } else if (s3.r > 150 && s3.g < 100) {
          ing3 = ingC; // 深紅色（肉類/香腸）
        } else {
          ing3 = ingA;
        }
      } else {
        ing3 = ingA;
      }
    }

    return {
      name: bestPkm ? bestPkm.name_cn : (allPokemons[0] ? allPokemons[0].name_cn : ''),
      pokemonId: bestPkm ? bestPkm.id : (allPokemons[0] ? allPokemons[0].id : ''),
      type: bestPkm ? bestPkm.type : (allPokemons[0] ? allPokemons[0].type : ''),
      specialty: bestPkm ? bestPkm.specialty : (allPokemons[0] ? allPokemons[0].specialty : ''),
      level,
      skillLevel,
      ribbon: deducedRibbon,
      nature,
      subskills,
      ing1,
      ing2,
      ing3
    };
  }

  async function parsePokemonScreenshot(imageSrc) {
    let worker = null;
    try {
      if (window.Tesseract) {
        worker = await window.Tesseract.createWorker('chi_tra+eng');
      }
      const res = await parsePokemonScreenshotWithWorker(imageSrc, worker);
      if (worker) await worker.terminate();
      return res;
    } catch (e) {
      if (worker) try { await worker.terminate(); } catch (err) {}
      throw e;
    }
  }

  async function parsePokemonScreenshotWithWorker(imageSrc, worker) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        let result = {
          name: '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          ing1: '',
          ing2: '',
          ing3: '',
          subskills: []
        };

        try {
          if (worker) {
            let compositeCanvas = null;
            let rgbSlots = [];
            if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
              try {
                const prep = buildOcrCompositeCanvas(img);
                compositeCanvas = prep.compositeCanvas;
                rgbSlots = prep.rgbSlots;
              } catch (prepErr) {
                console.warn('[OCR Preprocess Warning]:', prepErr);
              }
            }

            const targetSource = compositeCanvas || img;
            const ret = await worker.recognize(targetSource);
            const text = ret.data.text || '';

            result = parsePokemonFromOcr(text, rgbSlots, allPokemonsRef);
          }
        } catch (ocrErr) {
          console.warn('[OCR Engine Warning]:', ocrErr);
        }

        // 預設填補
        if (!result.name && allPokemonsRef.length > 0) {
          result.name = allPokemonsRef[0].name_cn;
          result.pokemonId = allPokemonsRef[0].id;
          result.type = allPokemonsRef[0].type;
          result.specialty = allPokemonsRef[0].specialty;
        }

        resolve(result);
      };
      img.onerror = () => {
        resolve({
          name: allPokemonsRef[0] ? allPokemonsRef[0].name_cn : '',
          level: 30,
          skillLevel: 1,
          ribbon: 0,
          nature: '固執',
          subskills: [],
          ing1: '',
          ing2: '',
          ing3: ''
        });
      };
      img.src = imageSrc;
    });
  }

  /* ─── 浮動 Toast 系統 ─────────────────────────────────────── */
  function showBoxToast(title, message, type = 'success') {
    let container = document.getElementById('box-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'box-toast-container';
      container.className = 'box-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `box-toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="box-toast-icon">${type === 'success' ? '[OK]' : (type === 'warning' ? '[!]' : '[i]')}</div>
      <div class="box-toast-body">
        <div class="box-toast-title">${escapeHtml(title)}</div>
        <div class="box-toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="box-toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  }

  /* ─── 備份匯出與匯入 ─────────────────────────────────────── */
  function exportBoxJSON() {
    if (userBox.length === 0) {
      alert('倉庫內目前沒有任何寶可夢可匯出！');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userBox, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pokemon_sleep_box_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function importBoxJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`確定要匯入 ${imported.length} 隻寶可夢嗎？（將合併至現有倉庫）`)) {
            const existingUids = new Set(userBox.map(p => p.uid));
            imported.forEach(item => {
              if (!item.uid || existingUids.has(item.uid)) {
                item.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
              }
              userBox.push(item);
            });
            saveUserBox();
            renderBox();
            alert(`成功匯入 ${imported.length} 隻寶可夢！`);
          }
        } else {
          alert('匯入檔案格式錯誤，請確認為正確的 JSON 備份檔！');
        }
      } catch (err) {
        alert('解析 JSON 備份檔案失敗：' + err.message);
      }
    };
    reader.readAsText(file);
  }

  /* ─── XSS 防護 ───────────────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── 初始化事件監聽器 ───────────────────────────────────── */
  function initBoxEvents() {
    loadUserBox();

    // 1. 拖曳上傳與截圖掃描
    const dropzone = document.getElementById('box-dropzone');
    const fileInput = document.getElementById('box-file-input');
    const manualBtn = document.getElementById('box-manual-add-btn');
    const exportBtn = document.getElementById('box-export-btn');
    const importInput = document.getElementById('box-import-input');

    const settingsExportBtn = document.getElementById('settings-export-box-btn');
    const settingsImportInput = document.getElementById('settings-import-box-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        handleScreenshotFiles(e.target.files);
        fileInput.value = '';
      });

      // 拖曳事件
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleScreenshotFiles(e.dataTransfer.files);
        }
      });
    }

    // 全域剪貼簿貼上監聽 (Ctrl+V / Cmd+V 支援單張或多張截圖連續入庫)
    window.addEventListener('paste', (e) => {
      const panelBox = document.getElementById('panel-box');
      if (panelBox && panelBox.style.display !== 'none') {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        const imageBlobs = [];
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            imageBlobs.push(item.getAsFile());
          }
        }
        if (imageBlobs.length > 0) {
          handleScreenshotFiles(imageBlobs);
        }
      }
    });

    // 1.5 標準截圖指引卡片與 Lightbox 大圖彈窗
    const guideToggleBtn = document.getElementById('box-guide-toggle-btn');
    const guideBody = document.getElementById('box-guide-body');
    const guideThumbWrap = document.getElementById('box-guide-thumb-wrap');
    const guideLightbox = document.getElementById('box-guide-lightbox-modal');
    const guideLightboxClose = document.getElementById('box-guide-lightbox-close');

    if (guideToggleBtn && guideBody) {
      guideToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = guideBody.style.display === 'none';
        guideBody.style.display = isCollapsed ? 'flex' : 'none';
        guideToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        guideToggleBtn.textContent = isCollapsed 
          ? (isEN ? 'Collapse' : '收合說明') 
          : (isEN ? 'Expand Guide' : '展開說明');
      });
    }

    if (guideThumbWrap && guideLightbox) {
      guideThumbWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(guideLightbox);
        guideLightbox.style.display = 'flex'; if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(guideLightbox);
      });
    }

    if (guideLightboxClose && guideLightbox) {
      guideLightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
      });
    }

    if (guideLightbox) {
      guideLightbox.addEventListener('click', (e) => {
        if (e.target === guideLightbox) {
          if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
        }
      });
    }

    if (manualBtn) {
      manualBtn.addEventListener('click', () => openBoxEditModal());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBoxJSON);
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          importInput.value = '';
        }
      });
    }

    if (settingsExportBtn) {
      settingsExportBtn.addEventListener('click', exportBoxJSON);
    }

    if (settingsImportInput) {
      settingsImportInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          settingsImportInput.value = '';
        }
      });
    }

    // 2. 編輯彈窗表單監聽
    const form = document.getElementById('box-edit-form');
    if (form) form.addEventListener('submit', handleFormSave);

    const closeBtn = document.getElementById('box-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeBoxEditModal);

    const cancelBtn = document.getElementById('box-modal-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeBoxEditModal);

    const modal = document.getElementById('box-edit-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBoxEditModal();
      });
    }

    // 3. 倉庫搜尋與一鍵清空
    const searchInput = document.getElementById('box-search-input');
    const boxSearchClear = document.getElementById('box-search-clear');

    function updateBoxClearBtn() {
      if (!searchInput) return;
      if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
        window.updateSearchInputHighlight(searchInput, boxSearchClear);
      } else if (boxSearchClear) {
        boxSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        updateBoxClearBtn();
        renderBox();
      });

      if (boxSearchClear) {
        boxSearchClear.addEventListener('click', () => {
          searchInput.value = '';
          currentSearch = '';
          updateBoxClearBtn();
          searchInput.focus();
          renderBox();
        });
      }
    }

    const sortSelect = document.getElementById('box-sort-select');
    if (sortSelect) {
      if (typeof window.setupCustomSelect === 'function') {
        window.setupCustomSelect(sortSelect);
      }
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderBox();
      });
    }

    // 4. 視圖切換
    const toggleGridBtn = document.getElementById('box-toggle-grid');
    const toggleTableBtn = document.getElementById('box-toggle-table');
    if (toggleGridBtn && toggleTableBtn) {
      toggleGridBtn.addEventListener('click', () => {
        boxViewMode = 'grid';
        toggleGridBtn.classList.add('active');
        toggleTableBtn.classList.remove('active');
        renderBox();
      });
      toggleTableBtn.addEventListener('click', () => {
        boxViewMode = 'table';
        toggleTableBtn.classList.add('active');
        toggleGridBtn.classList.remove('active');
        renderBox();
      });
    }

    // 5. 頂部 Segmented 子分頁切換 (寶可夢倉庫 vs 深度評測室)
    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');

    if (subtabList) subtabList.addEventListener('click', () => switchBoxSubtab('list'));
    if (subtabLab) subtabLab.addEventListener('click', () => switchBoxSubtab('lab'));

    try {
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      }
    } catch (e) {}
  }

  const STORAGE_KEY_BOX_SUBTAB = 'pksleep_active_box_subtab';
  const VALID_BOX_SUBTABS = ['list', 'lab'];

  function getSavedBoxSubtab() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const rawHash = window.location.hash.replace(/^#/, '');
        const parts = rawHash.split(/[/_?]/);
        if (parts[0] === 'box' && VALID_BOX_SUBTABS.includes(parts[1])) {
          return parts[1];
        }
      }
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_BOX_SUBTAB);
        if (VALID_BOX_SUBTABS.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'list';
  }

  function switchBoxSubtab(tab) {
    if (!VALID_BOX_SUBTABS.includes(tab)) tab = 'list';
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_BOX_SUBTAB, tab);
      }
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const curHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        const mainPart = curHash.split(/[/_?]/)[0];
        if (mainPart === 'box' || !mainPart) {
          window.history.replaceState(null, '', tab === 'list' ? '#box' : '#box/' + tab);
        }
      }
    } catch (e) {}

    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');
    const subpanelList = document.getElementById('box-subpanel-list');
    const subpanelLab = document.getElementById('box-subpanel-lab');
    const fabContainer = document.getElementById('box-fab-container');
    const desktopLabBtn = document.getElementById('box-appraisal-lab-btn');

    if (tab === 'lab') {
      if (subtabLab) subtabLab.classList.add('active');
      if (subtabList) subtabList.classList.remove('active');
      if (subpanelList) subpanelList.style.display = 'none';
      if (subpanelLab) subpanelLab.style.display = 'block';
      if (fabContainer) fabContainer.style.display = 'none';
      if (desktopLabBtn) desktopLabBtn.classList.add('active');
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer) {
        labContainer.style.display = 'block';
        if (window.AppraisalLab && typeof window.AppraisalLab.renderLab === 'function') {
          window.AppraisalLab.renderLab(labContainer);
        }
      }
    } else {
      if (subtabList) subtabList.classList.add('active');
      if (subtabLab) subtabLab.classList.remove('active');
      if (subpanelList) subpanelList.style.display = 'block';
      if (subpanelLab) subpanelLab.style.display = 'none';
      if (fabContainer) fabContainer.style.display = 'flex';
      if (desktopLabBtn) desktopLabBtn.classList.remove('active');
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer && !subpanelLab) {
        labContainer.style.display = 'none';
      }
      renderBox();
    }
  }

  if (typeof window !== 'undefined') {
    window.switchBoxSubtab = switchBoxSubtab;
    window.getCurrentBoxSubtab = getSavedBoxSubtab;
    window.initUserBox = function (pokemons) {
      allPokemonsRef = pokemons || [];
      initBoxEvents();
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      } else {
        renderBox();
      }
    };

    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });

    window.PokemonBoxApp = {
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = box; saveUserBox(); renderBox(); },
      renderBox: renderBox,
      getCurrentSubTab: getSavedBoxSubtab,
      switchSubTab: switchBoxSubtab,
      calculatePokemonPR,
      getMainSkillMaxLevel,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA
    };
    window.UserBox = window.PokemonBoxApp;
  }

  if (typeof module !== 'undefined' && module.exports) {
    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });
    module.exports = {
      PokemonBoxApp: typeof window !== 'undefined' ? window.PokemonBoxApp : {
        calculatePokemonPR,
        getMainSkillMaxLevel,
        updateRibbonSelectOptions,
        updateModalMainSkill,
        deduceRibbonFromCarry,
        initPokemonCombobox,
        setAllPokemons: (p) => { allPokemonsRef = p || []; },
        buildOcrCompositeCanvas,
        parsePokemonFromOcr,
        parsePokemonScreenshotWithWorker,
        NATURE_DATA,
        NATURE_DICT,
        SUBSKILLS_DATA
      },
      calculatePokemonPR,
      getMainSkillMaxLevel,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA
    };
  }
})();
