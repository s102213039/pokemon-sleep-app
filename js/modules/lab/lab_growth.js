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
    { lv: 75, shards: 260000 },
    { lv: 80, shards: 380000 }
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
    const lv = Math.max(1, Math.min(80, parseInt(level, 10) || 1));
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

  function calculateGrowthCost(fromLv, targetLv, curveMult, expMod) {
    const cur = Math.max(1, Math.min(79, parseInt(fromLv, 10) || 1));
    let tgt = Math.max(cur, Math.min(80, parseInt(targetLv, 10) || cur));

    const curExp = Math.round((GROWTH_CUMULATIVE_EXP[cur] || 0) * curveMult);
    const tgtExp = Math.round((GROWTH_CUMULATIVE_EXP[tgt] || 0) * curveMult);
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
      else growthState.targetLevel = 80;
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
              <input type="range" class="lab-growth-slider" min="1" max="79" value="${growthState.fromLevel}" oninput="window.AppraisalLab.setGrowthFromLevel(this.value)">

              <div class="lab-growth-range-display" style="margin-top:10px;">
                <span class="lab-growth-range-label">${isEN ? 'Target Level' : '目標等級'}</span>
                <span class="lab-growth-range-val">Lv.${growthState.targetLevel}</span>
              </div>
              <input type="range" class="lab-growth-slider" min="2" max="80" value="${growthState.targetLevel}" oninput="window.AppraisalLab.setGrowthTargetLevel(this.value)">

              <!-- 里程碑快速按鈕 -->
              <div class="lab-growth-milestones-row">
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 30 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(30)">Lv.30</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 50 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(50)">Lv.50</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 60 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(60)">Lv.60</button>
                <button type="button" class="lab-growth-milestone-chip ${growthState.targetLevel === 80 ? 'active' : ''}" onclick="window.AppraisalLab.setGrowthMilestone(80)">Lv.80</button>
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
      else growthState.targetLevel = 80;
    }
    updateLabUI();
  }

  function setGrowthFromLevel(val) {
    const num = Math.max(1, Math.min(79, parseInt(val, 10) || 1));
    growthState.fromLevel = num;
    if (growthState.targetLevel <= num) {
      growthState.targetLevel = Math.min(80, num + 1);
    }
    updateLabUI();
  }

  function setGrowthTargetLevel(val) {
    const num = Math.max(2, Math.min(80, parseInt(val, 10) || 30));
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
