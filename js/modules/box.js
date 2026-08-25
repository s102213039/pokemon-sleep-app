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
    { name: '固執', name_en: 'Adamant', buff: '幫忙速度▲▲', buff_en: 'Speed ▲▲', debuff: '食材機率▼▼', debuff_en: 'Ingr. ▼▼', buffType: 'speed', debuffType: 'ingredient' },
    { name: '勇敢', name_en: 'Brave', buff: '幫忙速度▲▲', buff_en: 'Speed ▲▲', debuff: 'EXP獲得量▼▼', debuff_en: 'EXP ▼▼', buffType: 'speed', debuffType: 'exp' },
    { name: '怕寂寞', name_en: 'Lonely', buff: '幫忙速度▲▲', buff_en: 'Speed ▲▲', debuff: '活力回復量▼▼', debuff_en: 'Energy ▼▼', buffType: 'speed', debuffType: 'energy' },
    { name: '頑皮', name_en: 'Naughty', buff: '幫忙速度▲▲', buff_en: 'Speed ▲▲', debuff: '主技能發動機率▼▼', debuff_en: 'Skill ▼▼', buffType: 'speed', debuffType: 'skill' },
    { name: '內斂', name_en: 'Modest', buff: '食材機率▲▲', buff_en: 'Ingr. ▲▲', debuff: '幫忙速度▼▼', debuff_en: 'Speed ▼▼', buffType: 'ingredient', debuffType: 'speed' },
    { name: '冷靜', name_en: 'Quiet', buff: '食材機率▲▲', buff_en: 'Ingr. ▲▲', debuff: 'EXP獲得量▼▼', debuff_en: 'EXP ▼▼', buffType: 'ingredient', debuffType: 'exp' },
    { name: '慢吞吞', name_en: 'Mild', buff: '食材機率▲▲', buff_en: 'Ingr. ▲▲', debuff: '活力回復量▼▼', debuff_en: 'Energy ▼▼', buffType: 'ingredient', debuffType: 'energy' },
    { name: '馬虎', name_en: 'Rash', buff: '食材機率▲▲', buff_en: 'Ingr. ▲▲', debuff: '主技能發動機率▼▼', debuff_en: 'Skill ▼▼', buffType: 'ingredient', debuffType: 'skill' },
    { name: '溫和', name_en: 'Calm', buff: '主技能發動機率▲▲', buff_en: 'Skill ▲▲', debuff: '幫忙速度▼▼', debuff_en: 'Speed ▼▼', buffType: 'skill', debuffType: 'speed' },
    { name: '慎重', name_en: 'Careful', buff: '主技能發動機率▲▲', buff_en: 'Skill ▲▲', debuff: '食材機率▼▼', debuff_en: 'Ingr. ▼▼', buffType: 'skill', debuffType: 'ingredient' },
    { name: '自大', name_en: 'Sassy', buff: '主技能發動機率▲▲', buff_en: 'Skill ▲▲', debuff: 'EXP獲得量▼▼', debuff_en: 'EXP ▼▼', buffType: 'skill', debuffType: 'exp' },
    { name: '溫順', name_en: 'Gentle', buff: '主技能發動機率▲▲', buff_en: 'Skill ▲▲', debuff: '活力回復量▼▼', debuff_en: 'Energy ▼▼', buffType: 'skill', debuffType: 'energy' },
    { name: '大膽', name_en: 'Bold', buff: '活力回復量▲▲', buff_en: 'Energy ▲▲', debuff: '幫忙速度▼▼', debuff_en: 'Speed ▼▼', buffType: 'energy', debuffType: 'speed' },
    { name: '淘氣', name_en: 'Impish', buff: '活力回復量▲▲', buff_en: 'Energy ▲▲', debuff: '食材機率▼▼', debuff_en: 'Ingr. ▼▼', buffType: 'energy', debuffType: 'ingredient' },
    { name: '悠閒', name_en: 'Relaxed', buff: '活力回復量▲▲', buff_en: 'Energy ▲▲', debuff: 'EXP獲得量▼▼', debuff_en: 'EXP ▼▼', buffType: 'energy', debuffType: 'exp' },
    { name: '樂天', name_en: 'Lax', buff: '活力回復量▲▲', buff_en: 'Energy ▲▲', debuff: '主技能發動機率▼▼', debuff_en: 'Skill ▼▼', buffType: 'energy', debuffType: 'skill' },
    { name: '膽小', name_en: 'Timid', buff: 'EXP獲得量▲▲', buff_en: 'EXP ▲▲', debuff: '幫忙速度▼▼', debuff_en: 'Speed ▼▼', buffType: 'exp', debuffType: 'speed' },
    { name: '爽朗', name_en: 'Jolly', buff: 'EXP獲得量▲▲', buff_en: 'EXP ▲▲', debuff: '食材機率▼▼', debuff_en: 'Ingr. ▼▼', buffType: 'exp', debuffType: 'ingredient' },
    { name: '急躁', name_en: 'Hasty', buff: 'EXP獲得量▲▲', buff_en: 'EXP ▲▲', debuff: '活力回復量▼▼', debuff_en: 'Energy ▼▼', buffType: 'exp', debuffType: 'energy' },
    { name: '天真', name_en: 'Naive', buff: 'EXP獲得量▲▲', buff_en: 'EXP ▲▲', debuff: '主技能發動機率▼▼', debuff_en: 'Skill ▼▼', buffType: 'exp', debuffType: 'skill' },
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
        summaryNote: `⚠️ ${baselineFailReason}`,
        score: failScore
      };
    }

    // ─── 階段 2：及格線以上的高階精確評分 (覆蓋 Lv.10, 25, 50, 70, 80) ───
    let score = 0;
    const highlights = [];

    // 1. 性格評分
    if (specialty === '樹果') {
      if (buff === 'speed') { score += 25; highlights.push(isEN ? 'Speed ▲▲' : '幫忙速度▲▲'); }
      if (debuff === 'speed') { score -= 25; }
      if (debuff === 'ingredient') { score += 12; highlights.push(isEN ? 'Ing. ▼▼ (Pure Berry)' : '食材▼▼ (樹果極限流)'); }
      if (buff === 'ingredient') { score -= 6; }
    } else if (specialty === '食材') {
      if (buff === 'ingredient') { score += 28; highlights.push(isEN ? 'Ing. Rate ▲▲' : '食材機率▲▲'); }
      if (debuff === 'ingredient') { score -= 28; }
      if (buff === 'speed') { score += 16; highlights.push(isEN ? 'Speed ▲▲' : '幫忙速度▲▲'); }
      if (debuff === 'speed') { score -= 16; }
    } else { // 技能
      if (buff === 'skill') { score += 30; highlights.push(isEN ? 'Skill Trigger ▲▲' : '主技能機率▲▲'); }
      if (debuff === 'skill') { score -= 30; }
      if (buff === 'speed') { score += 15; highlights.push(isEN ? 'Speed ▲▲' : '幫忙速度▲▲'); }
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
    const countBadge = document.getElementById('box-count-badge');
    if (!container) return;

    try {
      const filtered = getFilteredBox();
      const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    if (countBadge) {
      countBadge.innerHTML = isEN
        ? `Registered <strong>${userBox.length}</strong> Pokémon (${filtered.length} shown)`
        : `已登錄 <strong>${userBox.length}</strong> 隻寶可夢 (顯示 ${filtered.length} 隻)`;
    }

    if (filtered.length === 0) {
      if (userBox.length === 0) {
        container.innerHTML = `
          <div class="box-empty-state">
            <div class="box-empty-icon">📸</div>
            <h3>${isEN ? 'Your Pokémon Box is empty' : '您的寶可夢倉庫還是空的'}</h3>
            <p>${isEN ? 'Click "📸 Scan Screenshots" above to upload images, or click "➕ Add Pokémon" to get started!' : '點擊上方「<strong>📸 截圖智能辨識</strong>」上傳遊戲截圖，或點擊「<strong>➕ 手動新增</strong>」開始登錄你的幫手寶可夢！'}</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
              <button type="button" class="sync-btn" id="empty-scan-btn" style="background:var(--accent-gradient);color:#fff;">📸 ${isEN ? 'Scan Screenshots' : '上傳截圖辨識'}</button>
              <button type="button" class="toggle-btn" id="empty-manual-btn" style="border:1px solid var(--border-color);padding:8px 16px;">➕ ${isEN ? 'Add Manually' : '手動新增'}</button>
            </div>
          </div>
        `;
        document.getElementById('empty-scan-btn')?.addEventListener('click', () => {
          document.getElementById('box-file-input')?.click();
        });
        document.getElementById('empty-manual-btn')?.addEventListener('click', () => {
          openBoxEditModal();
        });
      } else {
        container.innerHTML = `
          <div class="box-empty-state">
            <div class="box-empty-icon">🔍</div>
            <h3>${isEN ? 'No Pokémon matched the filter' : '查無符合篩選條件的寶可夢'}</h3>
            <p>${isEN ? 'Try searching different keywords or adjusting filter tags.' : '請嘗試更換搜尋關鍵字，或切換屬性與得意篩選標籤。'}</p>
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
          <span class="ing-qty">${count}</span>
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
          const typeName = window.I18N ? window.I18N.getTypeName((base && base.type) || p.type || '一般') : ((base && base.type) || p.type || '一般');
          const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
          const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;

          return `
            <div class="box-card" data-uid="${p.uid}">
              <div class="box-card-header">
                <div class="box-card-img-wrap">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="box-card-icon" onerror="this.style.display='none';">` : '⚡'}
                </div>
                <div class="box-card-info">
                  <div class="box-card-name-row">
                    <span class="box-card-name">${escapeHtml(pkmDisplayName)}</span>
                    <span class="box-card-level">Lv.${p.level || 1}</span>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}" title="PR: ${prInfo.pr}/100">
                      ${prInfo.tier === 'S+' ? '👑' : (prInfo.tier === 'S' ? '🌟' : '')} PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </div>
                  ${p.nickname ? `<div class="box-card-nickname">🏷️ ${escapeHtml(p.nickname)}</div>` : ''}
                  <div class="box-card-tags">
                    <span class="pkm-type-icon-wrapper" title="${typeName}">
                      ${window.I18N ? window.I18N.getTypeIconSvg((base && base.type) || p.type || '一般', 15) : `<span class="type-badge" style="background-color: var(--type-${(base && base.type) || p.type || '一般'}, #64748b);">${typeName}</span>`}
                    </span>
                    <span class="box-spec-tag">${specName}</span>
                  </div>
                </div>
                <div class="box-card-actions">
                  <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '🔮 深度診斷報告書與六維雷達圖'}">🔮</button>
                  <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯寶可夢'}">✏️</button>
                  <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除寶可夢'}">🗑️</button>
                </div>
              </div>

              <!-- PR 智能簡評 -->
              <div class="box-pr-summary-bar">
                <span class="box-pr-summary-label">${isEN ? 'PR Rating:' : '潛力評價：'}</span>
                <span class="box-pr-summary-text">${escapeHtml(prInfo.summaryNote)}</span>
              </div>

              <!-- 食材插槽組合 (圖標與數量徽章) -->
              <div class="box-card-section">
                <div class="box-section-title">🍲 ${isEN ? 'Ingredients' : '食材組合'}</div>
                <div class="box-ing-slots">
                  ${renderBoxCardIngSlot(p.ing1, 'Lv.1', base, 0)}
                  ${renderBoxCardIngSlot(p.ing2, 'Lv.30', base, 1)}
                  ${renderBoxCardIngSlot(p.ing3, 'Lv.60', base, 2)}
                </div>
              </div>

              <!-- 副技能清單 -->
              <div class="box-card-section">
                <div class="box-section-title">🧩 ${isEN ? 'Sub-Skills' : '副技能組合'}</div>
                <div class="box-subskills-grid">
                  ${[10, 25, 50, 75, 100].map((lv, idx) => {
                    const skName = (p.subskills && p.subskills[idx]) || '';
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
              <th>${t('th.type', '屬性')}</th>
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
              const typeName = window.I18N ? window.I18N.getTypeName((base && base.type) || p.type || '一般') : ((base && base.type) || p.type || '一般');
              const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
              const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;

              return `
                <tr data-uid="${p.uid}">
                  <td>
                    <div class="table-icon-wrapper">
                      ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="table-icon" onerror="this.style.display='none';">` : '⚡'}
                    </div>
                  </td>
                  <td>
                    <div class="table-name-cn">${escapeHtml(pkmDisplayName)}</div>
                    ${p.nickname ? `<div style="font-size:11px;color:var(--accent-color);">🏷️ ${escapeHtml(p.nickname)}</div>` : ''}
                  </td>
                  <td><span class="box-table-lvl">Lv.${p.level || 1}</span></td>
                  <td>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}">
                      ${prInfo.tier === 'S+' ? '👑' : ''} PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </td>
                  <td>
                    <span class="pkm-type-icon-wrapper" title="${typeName}">
                      ${window.I18N ? window.I18N.getTypeIconSvg((base && base.type) || p.type || '一般', 16) : `<span class="type-badge" style="background-color: var(--type-${(base && base.type) || p.type || '一般'}, #64748b);">${typeName}</span>`}
                    </span>
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
                      <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '🔮 深度診斷報告'}">🔮</button>
                      <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯'}">✏️</button>
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除'}">🗑️</button>
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
          const base = findPokemonBase(item.pokemonId || item.name);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3]
          });
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

  /* ─── 寶可夢名稱 Combobox 搜尋選擇器 ───────────────────────── */
  function initPokemonCombobox(existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const searchInput = document.getElementById('modal-poke-search');
    const nameHidden = document.getElementById('modal-poke-name');
    const dropdown = document.getElementById('box-pkm-dropdown');
    const toggleBtn = document.getElementById('box-pkm-dropdown-toggle');
    if (!searchInput || !nameHidden || !dropdown) return;

    const CHEVRON_ICON = `<svg viewBox="0 0 12 8" width="12" height="8"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;
    const CLEAR_ICON = `<svg viewBox="0 0 12 12" width="12" height="12"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M2 2L10 10M10 2L2 10"/></svg>`;

    function syncToggleBtnIcon() {
      if (!toggleBtn) return;
      const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
      if (hasText) {
        toggleBtn.innerHTML = CLEAR_ICON;
        toggleBtn.setAttribute('aria-label', isEN ? 'Clear Pokémon' : '清空寶可夢');
        toggleBtn.setAttribute('title', isEN ? 'Clear' : '清空');
      } else {
        toggleBtn.innerHTML = CHEVRON_ICON;
        toggleBtn.setAttribute('aria-label', isEN ? 'Expand Pokémon list' : '展開寶可夢列表');
        toggleBtn.removeAttribute('title');
      }
    }

    // 初始選取（僅在編輯或辨識帶入時設定，手動新增時為空）
    let initialPkm = null;
    if (existingItem) {
      initialPkm = allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name) || null;
    }

    function renderDropdown(filterText = '') {
      const q = filterText.trim().toLowerCase();
      const filtered = allPokemonsRef.filter(p => {
        if (!q) return true;
        const cn = (p.name_cn || '').toLowerCase();
        const en = (p.name_en || '').toLowerCase();
        const no = String(p.formatted_no || p.id || '').toLowerCase();
        const cleanNo = no.replace(/^0+/, '');
        const cleanQ = q.replace(/^#/, '');
        return cn.includes(q) || en.includes(q) || no.includes(cleanQ) || cleanNo === cleanQ;
      });

      if (filtered.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '找不到符合之寶可夢'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = filtered.map(p => {
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

    function selectPokemonInCombobox(p, userChanged = false, existing = null) {
      if (!p) return;
      nameHidden.value = p.name_cn;
      const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
      searchInput.value = `No.${p.formatted_no} ${pkmDisplayName}`;
      dropdown.style.display = 'none';
      syncToggleBtnIcon();
      renderTiledIngredientPickers(p, existing);
    }

    if (initialPkm) {
      selectPokemonInCombobox(initialPkm, false, existingItem);
    } else {
      nameHidden.value = '';
      searchInput.value = '';
      syncToggleBtnIcon();
      renderTiledIngredientPickers(null, null);
    }

    searchInput.onfocus = () => {
      renderDropdown(searchInput.value.replace(/^No\.\d+\s*/, ''));
    };

    searchInput.oninput = () => {
      syncToggleBtnIcon();
      if (!searchInput.value.trim()) {
        nameHidden.value = '';
        renderTiledIngredientPickers(null, null);
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
          syncToggleBtnIcon();
          renderTiledIngredientPickers(null, null);
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
        ? (isEN ? '✏️ Edit Pokémon' : '✏️ 編輯個人寶可夢') 
        : (screenshotSrc ? (isEN ? '📸 Confirm OCR Entry' : '📸 截圖辨識確認入庫') : (isEN ? '➕ Add Pokémon' : '➕ 手動新增寶可夢'));
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
            <span class="box-screenshot-preview-tag">${isEN ? '📸 Original Screenshot' : '📸 原始截圖對照'}</span>
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

    // 5. 初始化副技能單行插槽 + 選擇盤
    initSubskillFlowPicker(existingItem ? existingItem.subskills : []);

    modal.style.display = 'flex';
  }

  function closeBoxEditModal() {
    const modal = document.getElementById('box-edit-modal');
    if (modal) modal.style.display = 'none';
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
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 80) {
      alert(isEN ? 'Please enter a valid level (1 ~ 80).' : '請輸入有效的等級 (1 ~ 80)！');
      levelInput?.focus();
      return;
    }

    const base = findPokemonBase(pokeName);

    const subskills = [];
    for (let slot = 1; slot <= 5; slot++) {
      const s = document.getElementById(`modal-subskill-${slot}`);
      if (s && s.value) subskills.push(s.value);
    }

    const itemData = {
      uid: editingUid || ('pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      pokemonId: base ? base.id : '',
      name: pokeName,
      type: base ? base.type : '一般',
      specialty: base ? base.specialty : '樹果',
      level: parsedLevel,
      nickname: nickInput ? nickInput.value.trim() : '',
      nature: natureSelect ? natureSelect.value : '坦率',
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

  /* ─── 📸 截圖智能分析與 OCR 引擎 (支援單圖與多圖連續批次辨識) ───────────────────────── */
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
        scannerStatus.innerHTML = `<span>⚡ 正在智能解析截圖中，請稍候...</span>`;
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
            <span class="batch-ocr-title">⚡ 批次智能辨識入庫中...</span>
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
      '📸 批次辨識入庫完成！',
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
        const result = {
          name: '',
          level: 30,
          nature: '固執',
          ing1: '',
          ing2: '',
          ing3: '',
          subskills: []
        };

        try {
          if (worker) {
            const ret = await worker.recognize(img);
            const text = ret.data.text || '';

            // 1. 辨識寶可夢名稱
            for (const p of allPokemonsRef) {
              if (text.includes(p.name_cn) || text.includes(p.formatted_no)) {
                result.name = p.name_cn;
                result.pokemonId = p.id;
                result.type = p.type;
                result.specialty = p.specialty;
                if (p.ingredients) {
                  result.ing1 = p.ingredients[0] ? p.ingredients[0].name : '';
                  result.ing2 = p.ingredients[1] ? p.ingredients[1].name : (p.ingredients[0] ? p.ingredients[0].name : '');
                  result.ing3 = p.ingredients[2] ? p.ingredients[2].name : (p.ingredients[0] ? p.ingredients[0].name : '');
                }
                break;
              }
            }

            // 2. 辨識等級 Lv.XX
            const lvlMatch = text.match(/Lv\.?\s*(\d{1,2})/i) || text.match(/LV\s*(\d{1,2})/i);
            if (lvlMatch) {
              result.level = Math.min(70, Math.max(1, parseInt(lvlMatch[1], 10)));
            }

            // 3. 辨識性格
            for (const n of NATURE_DATA) {
              if (text.includes(n.name)) {
                result.nature = n.name;
                break;
              }
            }

            // 4. 辨識副技能
            for (const sk of SUBSKILLS_DATA) {
              if (text.includes(sk.name) && !result.subskills.includes(sk.name) && result.subskills.length < 5) {
                result.subskills.push(sk.name);
              }
            }
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
      <div class="box-toast-icon">${type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : 'ℹ️')}</div>
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
            alert(`✅ 成功匯入 ${imported.length} 隻寶可夢！`);
          }
        } else {
          alert('❌ JSON 格式不正確，必須是寶可夢陣列清單！');
        }
      } catch (err) {
        alert('❌ 解析 JSON 檔案失敗：' + err.message);
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
      if (!boxSearchClear || !searchInput) return;
      boxSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
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
  }

  if (typeof window !== 'undefined') {
    window.initUserBox = function (pokemons) {
      allPokemonsRef = pokemons || [];
      initBoxEvents();
      renderBox();
    };

    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });

    window.PokemonBoxApp = {
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = box; saveUserBox(); renderBox(); },
      renderBox: renderBox,
      calculatePokemonPR,
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
      PokemonBoxApp: typeof window !== 'undefined' ? window.PokemonBoxApp : { calculatePokemonPR, NATURE_DATA, NATURE_DICT, SUBSKILLS_DATA },
      calculatePokemonPR,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA
    };
  }
})();
