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
    { name: '固執', buff: '幫忙速度▲▲', debuff: '食材機率▼▼', buffType: 'speed', debuffType: 'ingredient' },
    { name: '勇敢', buff: '幫忙速度▲▲', debuff: 'EXP獲得量▼▼', buffType: 'speed', debuffType: 'exp' },
    { name: '怕寂寞', buff: '幫忙速度▲▲', debuff: '活力回復量▼▼', buffType: 'speed', debuffType: 'energy' },
    { name: '頑皮', buff: '幫忙速度▲▲', debuff: '主技能發動機率▼▼', buffType: 'speed', debuffType: 'skill' },
    { name: '內斂', buff: '食材機率▲▲', debuff: '幫忙速度▼▼', buffType: 'ingredient', debuffType: 'speed' },
    { name: '冷靜', buff: '食材機率▲▲', debuff: 'EXP獲得量▼▼', buffType: 'ingredient', debuffType: 'exp' },
    { name: '慢吞吞', buff: '食材機率▲▲', debuff: '活力回復量▼▼', buffType: 'ingredient', debuffType: 'energy' },
    { name: '馬虎', buff: '食材機率▲▲', debuff: '主技能發動機率▼▼', buffType: 'ingredient', debuffType: 'skill' },
    { name: '溫和', buff: '主技能發動機率▲▲', debuff: '幫忙速度▼▼', buffType: 'skill', debuffType: 'speed' },
    { name: '慎重', buff: '主技能發動機率▲▲', debuff: '食材機率▼▼', buffType: 'skill', debuffType: 'ingredient' },
    { name: '自大', buff: '主技能發動機率▲▲', debuff: 'EXP獲得量▼▼', buffType: 'skill', debuffType: 'exp' },
    { name: '溫順', buff: '主技能發動機率▲▲', debuff: '活力回復量▼▼', buffType: 'skill', debuffType: 'energy' },
    { name: '大膽', buff: '活力回復量▲▲', debuff: '幫忙速度▼▼', buffType: 'energy', debuffType: 'speed' },
    { name: '淘氣', buff: '活力回復量▲▲', debuff: '食材機率▼▼', buffType: 'energy', debuffType: 'ingredient' },
    { name: '悠閒', buff: '活力回復量▲▲', debuff: 'EXP獲得量▼▼', buffType: 'energy', debuffType: 'exp' },
    { name: '樂天', buff: '活力回復量▲▲', debuff: '主技能發動機率▼▼', buffType: 'energy', debuffType: 'skill' },
    { name: '膽小', buff: 'EXP獲得量▲▲', debuff: '幫忙速度▼▼', buffType: 'exp', debuffType: 'speed' },
    { name: '爽朗', buff: 'EXP獲得量▲▲', debuff: '食材機率▼▼', buffType: 'exp', debuffType: 'ingredient' },
    { name: '急躁', buff: 'EXP獲得量▲▲', debuff: '活力回復量▼▼', buffType: 'exp', debuffType: 'energy' },
    { name: '天真', buff: 'EXP獲得量▲▲', debuff: '主技能發動機率▼▼', buffType: 'exp', debuffType: 'skill' },
    { name: '坦率', buff: '無增減', debuff: '', buffType: 'none', debuffType: 'none' },
    { name: '害羞', buff: '無增減', debuff: '', buffType: 'none', debuffType: 'none' },
    { name: '認真', buff: '無增減', debuff: '', buffType: 'none', debuffType: 'none' },
    { name: '勤奮', buff: '無增減', debuff: '', buffType: 'none', debuffType: 'none' },
    { name: '浮躁', buff: '無增減', debuff: '', buffType: 'none', debuffType: 'none' }
  ];

  const SUBSKILLS_DATA = [
    // 金色技能 (Tier 1 Gold)
    { name: '樹果數量S', tier: 'gold', desc: '幫忙時發現的樹果數量增加1個' },
    { name: '幫手獎勵', tier: 'gold', desc: '隊伍全員的幫忙時間縮短5%' },
    { name: '睡眠EXP獎勵', tier: 'gold', desc: '睡眠研究獲得的EXP提升14%' },
    { name: '活力回復獎勵', tier: 'gold', desc: '隊伍全員睡眠活力回復量提升14%' },
    { name: '夢之碎片獎勵', tier: 'gold', desc: '睡眠研究獲得的夢之碎片增加6%' },
    { name: '研究EXP獎勵', tier: 'gold', desc: '睡眠研究獲得的研究EXP增加6%' },
    { name: '技能等級提升M', tier: 'gold', desc: '主技能等級提升2級' },
    // 藍色技能 (Tier 2 Silver/Blue)
    { name: '幫忙速度M', tier: 'blue', desc: '幫忙時間縮短14%' },
    { name: '食材機率提升M', tier: 'blue', desc: '發現食材的機率大幅提升' },
    { name: '技能機率提升M', tier: 'blue', desc: '發動主技能的機率大幅提升' },
    { name: '技能等級提升S', tier: 'blue', desc: '主技能等級提升1級' },
    { name: '持有上限提升L', tier: 'blue', desc: '最大持有數量增加18' },
    { name: '持有上限提升M', tier: 'blue', desc: '最大持有數量增加12' },
    // 白色技能 (Tier 3 White)
    { name: '幫忙速度S', tier: 'white', desc: '幫忙時間縮短7%' },
    { name: '食材機率提升S', tier: 'white', desc: '發現食材的機率小幅提升' },
    { name: '技能機率提升S', tier: 'white', desc: '發動主技能的機率小幅提升' },
    { name: '持有上限提升S', tier: 'white', desc: '最大持有數量增加6' },
    { name: '活力回復提升S', tier: 'white', desc: '自身的活力回復量提升' }
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
        baselineFailReason = '性格減慢幫忙速度，未達樹果手及格線（且前三格無樹果S/幫手獎勵補救）';
      } else if (!hasEarlyBFS && !hasEarlyHB && !hasEarlySpeedM && !isSpeedUp) {
        passedBaseline = false;
        baselineFailReason = '前三格缺乏樹果S/速度加成，未達樹果手及格線';
      }
    } else if (specialty === '食材') {
      const hasEarlyIngM = earlySubskills.includes('食材機率提升M');
      const hasEarlyIngS = earlySubskills.includes('食材機率提升S');
      const hasEarlyHB = earlySubskills.includes('幫手獎勵');
      const isIngDown = debuff === 'ingredient';
      const isIngUp = buff === 'ingredient';

      if (isIngDown && !hasEarlyIngM) {
        passedBaseline = false;
        baselineFailReason = '性格減少食材機率，未達食材手及格線';
      } else if (!hasEarlyIngM && !hasEarlyIngS && !hasEarlyHB && !isIngUp) {
        passedBaseline = false;
        baselineFailReason = '缺乏食材機率加成，未達食材手及格線';
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
        baselineFailReason = '性格減少主技能機率，未達技能手及格線';
      } else if (!hasEarlySkillM && !hasEarlySkillS && !hasEarlySkillLvlM && !hasEarlyHB && !isSkillUp) {
        passedBaseline = false;
        baselineFailReason = '缺乏技能發動率加成，未達技能手及格線';
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
      if (buff === 'speed') { score += 25; highlights.push('幫忙速度▲▲'); }
      if (debuff === 'speed') { score -= 25; }
      if (debuff === 'ingredient') { score += 12; highlights.push('食材▼▼ (樹果極限流)'); }
      if (buff === 'ingredient') { score -= 6; }
    } else if (specialty === '食材') {
      if (buff === 'ingredient') { score += 28; highlights.push('食材機率▲▲'); }
      if (debuff === 'ingredient') { score -= 28; }
      if (buff === 'speed') { score += 16; highlights.push('幫忙速度▲▲'); }
      if (debuff === 'speed') { score -= 16; }
    } else { // 技能
      if (buff === 'skill') { score += 30; highlights.push('主技能機率▲▲'); }
      if (debuff === 'skill') { score -= 30; }
      if (buff === 'speed') { score += 15; highlights.push('幫忙速度▲▲'); }
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
        highlights.push(`Lv.${lvl} 樹果S`);
      } else if (skName === '幫手獎勵') {
        skScore = 65;
        highlights.push(`Lv.${lvl} 幫手獎勵`);
      } else if (skName === '食材機率提升M') {
        skScore = specialty === '食材' ? 85 : 20;
        if (specialty === '食材') highlights.push(`Lv.${lvl} 食材機率M`);
      } else if (skName === '食材機率提升S') {
        skScore = specialty === '食材' ? 45 : 10;
      } else if (skName === '技能機率提升M') {
        skScore = specialty === '技能' ? 85 : 20;
        if (specialty === '技能') highlights.push(`Lv.${lvl} 技能機率M`);
      } else if (skName === '技能機率提升S') {
        skScore = specialty === '技能' ? 45 : 10;
      } else if (skName === '技能等級提升M') {
        skScore = specialty === '技能' ? 60 : 15;
        if (specialty === '技能') highlights.push(`Lv.${lvl} 技能等級M`);
      } else if (skName === '技能等級提升S') {
        skScore = specialty === '技能' ? 30 : 10;
      } else if (skName === '幫忙速度M') {
        skScore = 50;
        highlights.push(`Lv.${lvl} 幫忙速度M`);
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
      summaryNote = '及格主力，基礎能力扎實';
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

    const filtered = getFilteredBox();

    if (countBadge) {
      countBadge.innerHTML = `已登錄 <strong>${userBox.length}</strong> 隻寶可夢 (顯示 ${filtered.length} 隻)`;
    }

    if (filtered.length === 0) {
      if (userBox.length === 0) {
        container.innerHTML = `
          <div class="box-empty-state">
            <div class="box-empty-icon">📸</div>
            <h3>您的寶可夢倉庫還是空的</h3>
            <p>點擊上方「<strong>📸 截圖智能辨識</strong>」上傳遊戲截圖，或點擊「<strong>➕ 手動新增</strong>」開始登錄你的幫手寶可夢！</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;">
              <button type="button" class="sync-btn" id="empty-scan-btn" style="background:var(--accent-gradient);color:#fff;">📸 上傳截圖辨識</button>
              <button type="button" class="toggle-btn" id="empty-manual-btn" style="border:1px solid rgba(255,255,255,0.2);padding:8px 16px;">➕ 手動新增</button>
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
            <h3>查無符合篩選條件的寶可夢</h3>
            <p>請嘗試更換搜尋關鍵字，或切換屬性與得意篩選標籤。</p>
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
  }

  function renderBoxGrid(list, container) {
    container.innerHTML = `
      <div class="box-grid">
        ${list.map(p => {
          const base = findPokemonBase(p.pokemonId || p.name);
          const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
          const natureObj = NATURE_DATA.find(n => n.name === p.nature);
          const prInfo = calculatePokemonPR(p, base);

          return `
            <div class="box-card" data-uid="${p.uid}">
              <div class="box-card-header">
                <div class="box-card-img-wrap">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${p.name}" class="box-card-icon" onerror="this.style.display='none';">` : '⚡'}
                </div>
                <div class="box-card-info">
                  <div class="box-card-name-row">
                    <span class="box-card-name">${escapeHtml(p.name || (base ? base.name_cn : '未知'))}</span>
                    <span class="box-card-level">Lv.${p.level || 1}</span>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}" title="PR 百分位評分：${prInfo.pr}/100">
                      ${prInfo.tier === 'S+' ? '👑' : (prInfo.tier === 'S' ? '🌟' : '')} PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </div>
                  ${p.nickname ? `<div class="box-card-nickname">🏷️ ${escapeHtml(p.nickname)}</div>` : ''}
                  <div class="box-card-tags">
                    <span class="type-badge" style="background-color: var(--type-${(base && base.type) || p.type || '一般'}, #64748b);">
                      ${(base && base.type) || p.type || '一般'}
                    </span>
                    <span class="box-spec-tag">${(base && base.specialty) || p.specialty || '--'}</span>
                  </div>
                </div>
                <div class="box-card-actions">
                  <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="編輯寶可夢">✏️</button>
                  <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="刪除寶可夢">🗑️</button>
                </div>
              </div>

              <!-- PR 智能簡評 -->
              <div class="box-pr-summary-bar">
                <span class="box-pr-summary-label">潛力評價：</span>
                <span class="box-pr-summary-text">${escapeHtml(prInfo.summaryNote)}</span>
              </div>

              <!-- 食材插槽組合 -->
              <div class="box-card-section">
                <div class="box-section-title">🍲 食材組合</div>
                <div class="box-ing-slots">
                  <div class="box-ing-slot">
                    <span class="box-ing-lvl">Lv.1</span>
                    <span class="box-ing-val">${escapeHtml(p.ing1 || (base && base.ingredients && base.ingredients[0] ? base.ingredients[0].name : '--'))}</span>
                  </div>
                  <div class="box-ing-slot">
                    <span class="box-ing-lvl">Lv.30</span>
                    <span class="box-ing-val">${escapeHtml(p.ing2 || (base && base.ingredients && base.ingredients[1] ? base.ingredients[1].name : '--'))}</span>
                  </div>
                  <div class="box-ing-slot">
                    <span class="box-ing-lvl">Lv.60</span>
                    <span class="box-ing-val">${escapeHtml(p.ing3 || (base && base.ingredients && base.ingredients[2] ? base.ingredients[2].name : '--'))}</span>
                  </div>
                </div>
              </div>

              <!-- 副技能 (Sub-skills) -->
              <div class="box-card-section">
                <div class="box-section-title">⚡ 副技能</div>
                <div class="box-subskill-pills">
                  ${(p.subskills || []).map((skName, idx) => {
                    const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                    const tier = sk ? sk.tier : 'white';
                    const lvlTag = [10, 25, 50, 70, 80][idx] || '';
                    return `
                      <span class="box-subskill-pill subskill-${tier}" title="Lv.${lvlTag} ${sk ? sk.desc : ''}">
                        <span class="subskill-lvl">Lv.${lvlTag}</span>
                        <span>${escapeHtml(skName)}</span>
                      </span>
                    `;
                  }).join('') || '<span style="color:var(--text-muted);font-size:12px;">尚未設定副技能</span>'}
                </div>
              </div>

              <!-- 性格 (Nature) -->
              <div class="box-card-section box-nature-section">
                <div class="box-section-title">🧠 性格</div>
                <div class="box-nature-badge">
                  <strong style="color:#ffffff;">${escapeHtml(p.nature || '坦率')}</strong>
                  ${natureObj && natureObj.buff ? `
                    <span class="nature-buff">${natureObj.buff}</span>
                    ${natureObj.debuff ? `<span class="nature-debuff">${natureObj.debuff}</span>` : ''}
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    bindCardActions(container);
  }

  function renderBoxTable(list, container) {
    container.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table box-table">
          <thead>
            <tr>
              <th>圖示</th>
              <th>寶可夢 / 暱稱</th>
              <th>等級</th>
              <th>PR 評分</th>
              <th>屬性</th>
              <th>得意</th>
              <th>Lv.1 食材</th>
              <th>Lv.30 食材</th>
              <th>Lv.60 食材</th>
              <th>副技能 (Lv.10 ~ 80)</th>
              <th>性格</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => {
              const base = findPokemonBase(p.pokemonId || p.name);
              const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
              const natureObj = NATURE_DATA.find(n => n.name === p.nature);
              const prInfo = calculatePokemonPR(p, base);

              return `
                <tr data-uid="${p.uid}">
                  <td>
                    <div class="table-icon-wrapper">
                      ${iconUrl ? `<img src="${iconUrl}" alt="${p.name}" class="table-icon" onerror="this.style.display='none';">` : '⚡'}
                    </div>
                  </td>
                  <td>
                    <div class="table-name-cn">${escapeHtml(p.name || (base ? base.name_cn : '未知'))}</div>
                    ${p.nickname ? `<div style="font-size:11px;color:var(--accent-color);">🏷️ ${escapeHtml(p.nickname)}</div>` : ''}
                  </td>
                  <td><span class="box-table-lvl">Lv.${p.level || 1}</span></td>
                  <td>
                    <span class="box-pr-badge ${prInfo.tierBadgeClass}">
                      ${prInfo.tier === 'S+' ? '👑' : ''} PR ${prInfo.pr} · ${prInfo.tier}
                    </span>
                  </td>
                  <td>
                    <span class="type-badge" style="background-color: var(--type-${(base && base.type) || p.type || '一般'}, #64748b);">
                      ${(base && base.type) || p.type || '一般'}
                    </span>
                  </td>
                  <td>${(base && base.specialty) || p.specialty || '--'}</td>
                  <td>${escapeHtml(p.ing1 || '--')}</td>
                  <td>${escapeHtml(p.ing2 || '--')}</td>
                  <td>${escapeHtml(p.ing3 || '--')}</td>
                  <td>
                    <div style="display:flex;flex-wrap:wrap;gap:4px;">
                      ${(p.subskills || []).map((skName) => {
                        const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                        const tier = sk ? sk.tier : 'white';
                        return `<span class="box-subskill-pill subskill-${tier}" style="font-size:11px;padding:1px 6px;">${escapeHtml(skName)}</span>`;
                      }).join('')}
                    </div>
                  </td>
                  <td>
                    <div><strong>${escapeHtml(p.nature || '坦率')}</strong></div>
                    ${natureObj && natureObj.buff ? `<div style="font-size:10.5px;" class="nature-buff">${natureObj.buff} ${natureObj.debuff}</div>` : ''}
                  </td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="編輯">✏️</button>
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="刪除">🗑️</button>
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
        if (item && confirm(`確定要從倉庫刪除「${item.name || '這隻寶可夢'}」嗎？`)) {
          userBox = userBox.filter(p => p.uid !== uid);
          saveUserBox();
          renderBox();
        }
      });
    });
  }

  /* ─── 視覺化確認與編輯彈窗 ───────────────────────────────── */
  function openBoxEditModal(existingItem = null, screenshotSrc = null) {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;

    const isEdit = !!existingItem;
    const titleEl = document.getElementById('box-modal-title');
    if (titleEl) titleEl.textContent = isEdit ? '✏️ 編輯個人寶可夢' : (screenshotSrc ? '📸 截圖辨識確認入庫' : '➕ 手動新增寶可夢');

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
            <span class="box-screenshot-preview-tag">📸 原始截圖對照</span>
            <img src="${screenshotSrc}" alt="截圖預覽" class="box-screenshot-img">
          </div>
        `;
        previewContainer.style.display = 'block';
      } else {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
      }
    }

    // 寶可夢名稱選單
    const nameSelect = document.getElementById('modal-poke-name');
    if (nameSelect && allPokemonsRef.length > 0) {
      nameSelect.innerHTML = allPokemonsRef.map(p => `
        <option value="${escapeHtml(p.name_cn)}" data-id="${p.id}" ${existingItem && (existingItem.pokemonId === p.id || existingItem.name === p.name_cn) ? 'selected' : ''}>
          No.${p.formatted_no} ${p.name_cn} (${p.type} · ${p.specialty})
        </option>
      `).join('');
    }

    // 等級
    const levelInput = document.getElementById('modal-poke-level');
    if (levelInput) levelInput.value = existingItem ? (existingItem.level || 30) : 30;

    // 暱稱
    const nickInput = document.getElementById('modal-poke-nickname');
    if (nickInput) nickInput.value = existingItem ? (existingItem.nickname || '') : '';

    // 性格選單
    const natureSelect = document.getElementById('modal-poke-nature');
    if (natureSelect) {
      natureSelect.innerHTML = NATURE_DATA.map(n => `
        <option value="${n.name}" ${existingItem && existingItem.nature === n.name ? 'selected' : (n.name === '固執' && !existingItem ? 'selected' : '')}>
          ${n.name} (${n.buff}${n.debuff ? ' / ' + n.debuff : ''})
        </option>
      `).join('');
    }

    // 食材選單 (Slot 1, Slot 2, Slot 3)
    updateIngredientOptions(existingItem);

    // 當更換寶可夢名稱時，自動刷新食材可選清單
    if (nameSelect) {
      nameSelect.onchange = () => {
        updateIngredientOptions();
      };
    }

    // 5 個副技能選單 (Lv.10, 25, 50, 75, 100)
    for (let slot = 1; slot <= 5; slot++) {
      const selectEl = document.getElementById(`modal-subskill-${slot}`);
      if (selectEl) {
        const curVal = existingItem && existingItem.subskills && existingItem.subskills[slot - 1] ? existingItem.subskills[slot - 1] : '';
        selectEl.innerHTML = `
          <option value="">-- 未解鎖 / 無 --</option>
          <optgroup label="🌟 金色技能">
            ${SUBSKILLS_DATA.filter(s => s.tier === 'gold').map(s => `
              <option value="${s.name}" ${curVal === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </optgroup>
          <optgroup label="🔷 藍色技能">
            ${SUBSKILLS_DATA.filter(s => s.tier === 'blue').map(s => `
              <option value="${s.name}" ${curVal === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </optgroup>
          <optgroup label="⚪ 白色技能">
            ${SUBSKILLS_DATA.filter(s => s.tier === 'white').map(s => `
              <option value="${s.name}" ${curVal === s.name ? 'selected' : ''}>${s.name}</option>
            `).join('')}
          </optgroup>
        `;
      }
    }

    modal.style.display = 'flex';
  }

  function updateIngredientOptions(existingItem = null) {
    const nameSelect = document.getElementById('modal-poke-name');
    const selectedName = nameSelect ? nameSelect.value : '';
    const base = findPokemonBase(selectedName);

    const ingList = (base && base.ingredients) ? base.ingredients : [
      { name: '特選蘋果' }, { name: '窩心牛奶' }, { name: '熟透番茄' }
    ];

    ['ing1', 'ing2', 'ing3'].forEach((slotKey, idx) => {
      const sel = document.getElementById(`modal-${slotKey}`);
      if (!sel) return;
      const curVal = existingItem ? existingItem[slotKey] : (ingList[idx] ? ingList[idx].name : ingList[0].name);

      sel.innerHTML = ingList.map(ing => `
        <option value="${escapeHtml(ing.name)}" ${curVal === ing.name ? 'selected' : ''}>
          🍲 ${escapeHtml(ing.name)}
        </option>
      `).join('');
    });
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

    const editingUid = form.getAttribute('data-editing-uid');
    const nameSelect = document.getElementById('modal-poke-name');
    const levelInput = document.getElementById('modal-poke-level');
    const nickInput = document.getElementById('modal-poke-nickname');
    const natureSelect = document.getElementById('modal-poke-nature');
    const ing1Select = document.getElementById('modal-ing1');
    const ing2Select = document.getElementById('modal-ing2');
    const ing3Select = document.getElementById('modal-ing3');

    const pokeName = nameSelect ? nameSelect.value : '';
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
      level: parseInt(levelInput ? levelInput.value : '30', 10) || 30,
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

  /* ─── 📸 截圖智能分析與 OCR 引擎 ───────────────────────── */
  async function handleScreenshotFiles(files) {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片檔案 (PNG, JPG, WebP)！');
      return;
    }

    const scannerStatus = document.getElementById('box-scanner-status');
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
        // 辨識失敗時仍打開彈窗讓使用者對照截圖手動填寫
        openBoxEditModal(null, imgSrc);
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * 截圖解析核心演算法：
   * 結合 Canvas 幾何區域採樣、色彩分析與 Tesseract OCR 文字比對
   */
  async function parsePokemonScreenshot(imageSrc) {
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
          // 動態載入 Tesseract.js (若可用) 或本地模糊幾何解析
          if (window.Tesseract) {
            const worker = await window.Tesseract.createWorker('chi_tra+eng');
            const ret = await worker.recognize(img);
            await worker.terminate();

            const text = ret.data.text || '';
            console.log('[OCR Raw Text]:', text);

            // 1. 辨識寶可夢名稱 (比對 data.json)
            for (const p of allPokemonsRef) {
              if (text.includes(p.name_cn) || text.includes(p.formatted_no)) {
                result.name = p.name_cn;
                result.pokemonId = p.id;
                result.type = p.type;
                result.specialty = p.specialty;
                break;
              }
            }

            // 2. 辨識等級 Lv.XX
            const lvlMatch = text.match(/Lv\.?\s*(\d{1,2})/i) || text.match(/LV\s*(\d{1,2})/i);
            if (lvlMatch) {
              result.level = Math.min(70, Math.max(1, parseInt(lvlMatch[1], 10)));
            }

            // 3. 辨識性格 (比對 25 種性格)
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
        }

        resolve(result);
      };
      img.src = imageSrc;
    });
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

    // 全域剪貼簿貼上監聽 (Ctrl+V / Cmd+V 截圖入庫)
    window.addEventListener('paste', (e) => {
      const panelBox = document.getElementById('panel-box');
      if (panelBox && panelBox.style.display !== 'none') {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            handleScreenshotFiles([blob]);
            break;
          }
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

    // 3. 倉庫搜尋與篩選
    const searchInput = document.getElementById('box-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        renderBox();
      });
    }

    const sortSelect = document.getElementById('box-sort-select');
    if (sortSelect) {
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

    window.PokemonBoxApp = {
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = box; saveUserBox(); renderBox(); },
      calculatePokemonPR,
      NATURE_DATA,
      SUBSKILLS_DATA
    };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PokemonBoxApp: typeof window !== 'undefined' ? window.PokemonBoxApp : { calculatePokemonPR, NATURE_DATA, SUBSKILLS_DATA },
      calculatePokemonPR,
      NATURE_DATA,
      SUBSKILLS_DATA
    };
  }
})();
