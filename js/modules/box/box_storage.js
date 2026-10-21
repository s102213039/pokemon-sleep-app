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

      // 資料相容性校正：確保淨白薄荷標記與正確的睡飽飽獎章持有計算
      let modified = false;
      userBox.forEach(item => {
        const pName = (item.pokemonId || item.name || '').trim();
        const pLv = parseInt(item.level, 10);
        // 校正舊版阿勃梭魯 Lv.52 (原慎重使用淨白薄荷中和，消除 -20% 食材扣分；獎章持有40 - 基礎21 - 技能18 = 1)
        if ((pName === '阿勃梭魯' || pName === 'Absol' || item.pokemonId === 359 || item.pokemonId === '359') && pLv === 52) {
          if (!item.cleanseMint) {
            item.cleanseMint = true;
            modified = true;
          }
          if (item.nature === '坦率') {
            item.nature = '慎重';
            item.cleanseMint = true;
            modified = true;
          }
          if (item.ribbon === 4) {
            item.ribbon = 1;
            modified = true;
          }
        }
        // 校正舊版沙漠蜻蜓 Lv.60 (原爽朗使用淨白薄荷中和，消除 -20% 食材扣分；獎章持有28 - 基礎27 = 1)
        if ((pName === '沙漠蜻蜓' || pName === 'Flygon' || item.pokemonId === 330 || item.pokemonId === '330') && pLv === 60) {
          if (!item.cleanseMint) {
            item.cleanseMint = true;
            modified = true;
          }
          if (item.nature === '坦率') {
            item.nature = '爽朗';
            item.cleanseMint = true;
            modified = true;
          }
          if (item.ribbon === 4) {
            item.ribbon = 1;
            modified = true;
          }
        }
      });
      if (modified) {
        saveUserBox();
      }
    } catch (e) {
      console.error('Failed to load user box:', e);
      userBox = [];
    }
  }

  function saveUserBox(skipCloudPush = false) {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userBox));
    } catch (e) {
      console.error('Failed to save user box:', e);
    }
    if (!skipCloudPush && typeof window !== 'undefined' && window.CloudSync && typeof window.CloudSync.pushCloudBox === 'function') {
      window.CloudSync.pushCloudBox(userBox);
    }
  }

  /* ─── 獲取寶可夢基礎資訊 (O(1) 預索引快取) ─────────────────── */
  let _boxPkmRefObj = null;
  let _boxPkmRefLen = 0;
  let _boxPkmIndexMap = null;

  function findPokemonBase(idOrName) {
    if (!allPokemonsRef || allPokemonsRef.length === 0) return null;
    if (idOrName === undefined || idOrName === null || idOrName === '') return null;
    if (_boxPkmRefObj !== allPokemonsRef || _boxPkmRefLen !== allPokemonsRef.length || !_boxPkmIndexMap) {
      _boxPkmRefObj = allPokemonsRef;
      _boxPkmRefLen = allPokemonsRef.length;
      _boxPkmIndexMap = Object.create(null);
      for (let i = 0; i < allPokemonsRef.length; i++) {
        const p = allPokemonsRef[i];
        if (!p) continue;
        if (p.id !== undefined) _boxPkmIndexMap[String(p.id)] = p;
        if (p.formatted_no) _boxPkmIndexMap[String(p.formatted_no)] = p;
        if (p.name_cn) _boxPkmIndexMap[p.name_cn] = p;
        if (p.name_en) _boxPkmIndexMap[p.name_en] = p;
        if (p.name && typeof p.name === 'object') {
          if (p.name.cn) _boxPkmIndexMap[p.name.cn] = p;
          if (p.name.en) _boxPkmIndexMap[p.name.en] = p;
          if (p.name.jp) _boxPkmIndexMap[p.name.jp] = p;
        }
      }
    }
    const key = String(idOrName);
    if (_boxPkmIndexMap[key]) return _boxPkmIndexMap[key];
    return allPokemonsRef.find(p => 
      String(p.id) === key ||
      p.formatted_no === key ||
      (p.name && (p.name.cn === idOrName || p.name.en === idOrName || p.name.jp === idOrName)) ||
      p.name_cn === idOrName ||
      p.name_en === idOrName
    ) || null;
  }

  /* ─── RaenonX 級潛力 PR 評分演算法 (含核心及格線快速檢驗與 Lv.70/80 覆蓋) ─── */
  const _boxPrCache = Object.create(null);
  let _boxPrCacheCount = 0;

  function calculatePokemonPR(pkm, baseData = null) {
    if (!pkm) return { pr: 0, tier: 'C', tierBadgeClass: 'pr-tier-c', summaryNote: '', score: 0 };
    const base = baseData || findPokemonBase(pkm.pokemonId || pkm.name);
    const specialty = (base && base.specialty) || pkm.specialty || '樹果';
    const nature = pkm.nature || '坦率';
    const subskills = pkm.subskills || [];

    const isMint = !!(pkm && (pkm.cleanseMint || pkm.mint));
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const lab = (typeof window !== 'undefined' && window.AppraisalLab) || (typeof AppraisalLab !== 'undefined' ? AppraisalLab : null);
    const hasLab = !!(lab && typeof lab.evaluatePokemon === 'function' && base);

    const prCacheKey = ((base && (base.id || base.name_cn)) || pkm.pokemonId || pkm.name || '') +
      ':' + specialty +
      ':' + (pkm.level || 30) +
      ':' + nature +
      ':' + (Array.isArray(subskills) ? subskills.join('|') : '') +
      ':' + (pkm.ing1 || '') + ',' + (pkm.ing2 || '') + ',' + (pkm.ing3 || '') +
      ':' + (pkm.ribbon || 0) +
      ':' + (pkm.skillLevel || pkm.mainSkillLevel || '') +
      ':' + (isMint ? 1 : 0) +
      ':' + (isEN ? 'en' : 'zh') +
      ':' + (hasLab ? 1 : 0);

    if (_boxPrCache[prCacheKey]) {
      return _boxPrCache[prCacheKey];
    }

    const natureObj = (typeof NATURE_DICT !== 'undefined' && NATURE_DICT[nature]) || NATURE_DATA.find(n => n.name === nature) || { buffType: 'none', debuffType: 'none' };
    const buff = isMint ? 'none' : natureObj.buffType;
    const debuff = isMint ? 'none' : natureObj.debuffType;

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
      const failRes = {
        pr,
        tier: pr >= 30 ? 'B' : 'C',
        tierBadgeClass: pr >= 30 ? 'pr-tier-b' : 'pr-tier-c',
        summaryNote: `[!] ${baselineFailReason}`,
        score: failScore
      };
      if (_boxPrCacheCount > 2500) {
        for (const k in _boxPrCache) delete _boxPrCache[k];
        _boxPrCacheCount = 0;
      }
      _boxPrCache[prCacheKey] = failRes;
      _boxPrCacheCount++;
      return failRes;
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

    if (isMint) {
      highlights.push(isEN ? 'Cleanse Mint: Neutralized Nature Effects' : '使用淨白薄荷消除個性效果');
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

    // 4. AppraisalLab 雙軌評分與升級里程碑整合 (Dual-Track Rating & Milestone Projection)
    let currentGrade = tier;
    let currentScore = pr;
    let potentialGrade = tier;
    let potentialScore = pr;
    let currentTierBadgeClass = tierBadgeClass;
    let potentialTierBadgeClass = tierBadgeClass;
    let milestones = [];
    let milestoneNote = '';

    const gradeToBadgeClass = {
      'SSS': 'pr-tier-sss',
      'SS': 'pr-tier-ss',
      'S': 'pr-tier-s',
      'A': 'pr-tier-a',
      'B': 'pr-tier-b',
      'C': 'pr-tier-c',
      'D': 'pr-tier-d'
    };

    let appResult = null;
    if (hasLab) {
      const currentLv = parseInt(pkm.level, 10) || 30;
      const subArr = pkm.subskills || [];
      const ingArr = [pkm.ing1, pkm.ing2, pkm.ing3].filter(Boolean);
      const ribLvl = parseInt(pkm.ribbon, 10) || 0;
      const skLvl = getEffectiveSkillLevel(pkm, base);
      appResult = lab.evaluatePokemon(base, currentLv, pkm.nature, subArr, ingArr, ribLvl, skLvl, isMint);
      if (appResult) {
        currentGrade = (appResult.current && appResult.current.grade) || appResult.grade;
        currentScore = (appResult.current && appResult.current.compositeScore) || appResult.compositeScore;
        potentialGrade = (appResult.potential && appResult.potential.grade) || appResult.grade;
        potentialScore = (appResult.potential && appResult.potential.compositeScore) || appResult.compositeScore;
        currentTierBadgeClass = gradeToBadgeClass[currentGrade] || 'pr-tier-b';
        potentialTierBadgeClass = gradeToBadgeClass[potentialGrade] || 'pr-tier-b';
        milestones = appResult.milestones || [];
        if (milestones.length > 0) {
          milestoneNote = milestones[0].text;
        }
      }
    }

    let summaryNote = '';
    if (appResult && (appResult.intelligentSummary || appResult.summaryNote)) {
      summaryNote = appResult.intelligentSummary || appResult.summaryNote;
    } else if (milestoneNote) {
      summaryNote = milestoneNote;
    } else if (highlights.length > 0) {
      summaryNote = highlights.slice(0, 3).join(' · ');
    } else {
      summaryNote = isEN ? 'Solid baseline starter' : '及格主力，基礎能力扎實';
    }

    const finalRes = {
      pr,
      tier,
      tierBadgeClass,
      currentGrade,
      currentScore,
      potentialGrade,
      potentialScore,
      currentTierBadgeClass,
      potentialTierBadgeClass,
      milestones,
      milestoneNote,
      summaryNote,
      highlights,
      score: Math.round(score * 10) / 10
    };
    if (_boxPrCacheCount > 2500) {
      for (const k in _boxPrCache) delete _boxPrCache[k];
      _boxPrCacheCount = 0;
    }
    _boxPrCache[prCacheKey] = finalRes;
    _boxPrCacheCount++;
    return finalRes;
  }

  /* ─── 渲染倉庫清單 ─────────────────────────────────────── */
  function getFilteredBox() {
    const typeToBerry = getTypeToBerry();
    const q = currentSearch ? currentSearch.toLowerCase().trim() : '';

    return userBox.filter(p => {
      const base = findPokemonBase(p.pokemonId || p.name);
      const pType = (base && base.type) || p.type || '';
      const pSpec = (base && base.specialty) || p.specialty || '';

      if (selectedType !== 'ALL' && pType !== selectedType) return false;
      if (selectedSpecialty !== 'ALL' && pSpec !== selectedSpecialty) return false;

      // 1. 專長類型多選篩選
      if (boxSelectedSpecialties.size > 0) {
        const isMewAll = pSpec === '全部' || pSpec === 'ALL';
        if (!isMewAll && !boxSelectedSpecialties.has(pSpec)) return false;
      }

      // 2. 僅最終進化篩選
      if (boxOnlyFinal) {
        const isFinal = (base && (base.is_final === '〇' || base.is_final === 'O' || base.is_final === 'o' || base.is_final === true || base.is_final === '1')) ||
          p.is_final === true || p.is_final === '〇';
        if (!isFinal) return false;
      }

      // 3. 樹果細節篩選 (多選)
      if (boxSelectedBerries.size > 0) {
        const berryName = typeToBerry[pType];
        if (!berryName || !boxSelectedBerries.has(berryName)) return false;
      }

      // 4. 食材細節篩選 (若開啟「僅初始食材」則只比對 Lv.1 食材，否則比對該寶可夢擁有的任何食材)
      if (boxSelectedIngredients.size > 0) {
        const initialIng = p.ing1 || (Array.isArray(p.ingredients) && p.ingredients[0] && (p.ingredients[0].name || p.ingredients[0])) ||
          (base && base.ingredients && base.ingredients[0] && base.ingredients[0].name) || '';

        if (boxOnlyInitialIng) {
          if (!initialIng || !boxSelectedIngredients.has(initialIng)) return false;
        } else {
          const itemIngs = [];
          if (p.ing1) itemIngs.push(p.ing1);
          if (p.ing2) itemIngs.push(p.ing2);
          if (p.ing3) itemIngs.push(p.ing3);
          if (itemIngs.length === 0 && Array.isArray(p.ingredients)) {
            p.ingredients.forEach(i => {
              const name = (typeof i === 'object' && i) ? i.name : i;
              if (name) itemIngs.push(name);
            });
          }
          if (itemIngs.length === 0 && base && Array.isArray(base.ingredients)) {
            base.ingredients.forEach(i => {
              const name = (typeof i === 'object' && i) ? i.name : i;
              if (name) itemIngs.push(name);
            });
          }
          const hasIng = itemIngs.some(ing => boxSelectedIngredients.has(ing));
          if (!hasIng) return false;
        }
      }

      // 5. 技能細節篩選 (多選，支援基礎技能與複合技能自動關聯)
      if (boxSelectedSkills.size > 0) {
        const mainSkill = p.main_skill || (base && base.main_skill) || '';
        let hasMatchedSkill = false;
        for (const targetSkill of boxSelectedSkills) {
          if (checkMatchesSkill(mainSkill, targetSkill)) {
            hasMatchedSkill = true;
            break;
          }
        }
        if (!hasMatchedSkill) return false;
      }

      // 6. 搜尋文字 (中/英/暱稱/性格/副技能/圖鑑編號)
      if (q) {
        const nameCN = (p.name || (base && base.name_cn) || '').toLowerCase();
        const nameEN = ((base && base.name_en) || '').toLowerCase();
        const nickname = (p.nickname || '').toLowerCase();
        const natureName = (p.nature || '').toLowerCase();
        const subskillStr = (p.subskills || []).join(' ').toLowerCase();
        const dexNo = String(p.pokemonId || (base && base.id) || (base && base.formatted_no) || '').toLowerCase();

        if (!nameCN.includes(q) && !nameEN.includes(q) && !nickname.includes(q) && !natureName.includes(q) && !subskillStr.includes(q) && !dexNo.includes(q)) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      const getPkmDexId = (p) => {
        if (!p) return 99999;
        const base = findPokemonBase(p.pokemonId || p.name);
        if (base) {
          if (base.formatted_no && !isNaN(parseInt(base.formatted_no, 10))) {
            return parseInt(base.formatted_no, 10);
          }
          if (base.id && !isNaN(parseInt(base.id, 10))) {
            return parseInt(base.id, 10);
          }
        }
        if (p.pokemonId && !isNaN(parseInt(p.pokemonId, 10))) {
          return parseInt(p.pokemonId, 10);
        }
        return 99999;
      };

      const getPkmName = (p) => {
        if (!p) return '';
        const base = findPokemonBase(p.pokemonId || p.name);
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        return p.nickname || (base ? (isEN ? (base.name_en || base.name_cn) : (base.name_cn || base.name_en)) : p.name) || '';
      };

      const getPkmSpecialty = (p) => {
        if (!p) return '';
        const base = findPokemonBase(p.pokemonId || p.name);
        return (base && base.specialty) || p.specialty || '';
      };

      const getPkmBerry = (p) => {
        if (!p) return '';
        const base = findPokemonBase(p.pokemonId || p.name);
        const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
        return (berry && berry.name) || '';
      };

      const getPkmIng = (p, slotIdx) => {
        if (!p) return '';
        const slotKey = slotIdx === 0 ? 'ing1' : slotIdx === 1 ? 'ing2' : 'ing3';
        if (p[slotKey]) return p[slotKey];
        if (Array.isArray(p.ingredients) && p.ingredients[slotIdx]) {
          const item = p.ingredients[slotIdx];
          return (item && item.name) ? item.name : (typeof item === 'string' ? item : '');
        }
        const base = findPokemonBase(p.pokemonId || p.name);
        if (base && Array.isArray(base.ingredients) && base.ingredients[slotIdx]) {
          return base.ingredients[slotIdx].name || '';
        }
        return '';
      };

      if (sortBy === 'level-desc') {
        const diff = (b.level || 1) - (a.level || 1);
        if (diff !== 0) return diff;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'level-asc') {
        const diff = (a.level || 1) - (b.level || 1);
        if (diff !== 0) return diff;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'id-desc' || sortBy === 'dex-desc' || sortBy === 'no-desc') {
        const idA = getPkmDexId(a);
        const idB = getPkmDexId(b);
        if (idA !== idB) return idB - idA;
        return (b.level || 1) - (a.level || 1);
      }
      if (sortBy === 'created-asc') {
        const diff = (a.createdAt || 0) - (b.createdAt || 0);
        if (diff !== 0) return diff;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'created-desc') {
        const diff = (b.createdAt || 0) - (a.createdAt || 0);
        if (diff !== 0) return diff;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'name-asc' || sortBy === 'name-desc') {
        const mul = sortBy === 'name-desc' ? -1 : 1;
        const cmp = getPkmName(a).localeCompare(getPkmName(b), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'specialty-asc' || sortBy === 'specialty-desc') {
        const mul = sortBy === 'specialty-desc' ? -1 : 1;
        const cmp = getPkmSpecialty(a).localeCompare(getPkmSpecialty(b), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'berry-asc' || sortBy === 'berry-desc') {
        const mul = sortBy === 'berry-desc' ? -1 : 1;
        const cmp = getPkmBerry(a).localeCompare(getPkmBerry(b), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'ing1-asc' || sortBy === 'ing1-desc') {
        const mul = sortBy === 'ing1-desc' ? -1 : 1;
        const cmp = getPkmIng(a, 0).localeCompare(getPkmIng(b, 0), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'ing2-asc' || sortBy === 'ing2-desc') {
        const mul = sortBy === 'ing2-desc' ? -1 : 1;
        const cmp = getPkmIng(a, 1).localeCompare(getPkmIng(b, 1), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      if (sortBy === 'ing3-asc' || sortBy === 'ing3-desc') {
        const mul = sortBy === 'ing3-desc' ? -1 : 1;
        const cmp = getPkmIng(a, 2).localeCompare(getPkmIng(b, 2), 'zh-Hant');
        if (cmp !== 0) return cmp * mul;
        return getPkmDexId(a) - getPkmDexId(b);
      }
      // Default: 'id-asc' / 'dex-asc' (編號由低到高)
      const idA = getPkmDexId(a);
      const idB = getPkmDexId(b);
      if (idA !== idB) return idA - idB;
      return (b.level || 1) - (a.level || 1);
    });
  }

  let boxUserForcedGuideVisible = false;

  function syncBoxVisibility() {
    if (typeof document === 'undefined') return;
    const hasItems = userBox && userBox.length > 0;
    const dropzone = document.getElementById('box-dropzone');
    const guideCard = document.getElementById('box-screenshot-guide-card');
    const boxPanel = (typeof document.getElementById === 'function') ? (document.getElementById('panel-box') || document.getElementById('view-box')) : null;
    let searchFilterRow = null;
    let toolbarControlRow = null;
    if (boxPanel && typeof boxPanel.querySelector === 'function') {
      searchFilterRow = boxPanel.querySelector('.search-filter-row');
      toolbarControlRow = boxPanel.querySelector('.box-toolbar-control-row');
    } else if (typeof document.querySelector === 'function') {
      searchFilterRow = document.querySelector('#panel-box .search-filter-row, #view-box .search-filter-row') || document.querySelector('.search-filter-row');
      toolbarControlRow = document.querySelector('#panel-box .box-toolbar-control-row, #view-box .box-toolbar-control-row') || document.querySelector('.box-toolbar-control-row');
    }
    const toggleGuideBtn = document.getElementById('box-toggle-guide-btn');
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // On desktop, dropzone is div.box-dropzone; on mobile H5, it is button.box-fab-scan
    const isDesktopDropzone = dropzone && !dropzone.classList.contains('box-fab-btn');

    if (hasItems) {
      const showGuide = boxUserForcedGuideVisible;
      if (isDesktopDropzone) {
        dropzone.style.display = showGuide ? '' : 'none';
      }
      if (guideCard) {
        guideCard.style.display = showGuide ? '' : 'none';
      }
      if (toggleGuideBtn) {
        toggleGuideBtn.style.display = '';
        toggleGuideBtn.textContent = showGuide
          ? (isEN ? 'Hide Guide' : '收合指引')
          : (isEN ? 'Screenshot Guide' : '截圖拖曳與指引');
      }
      if (searchFilterRow) searchFilterRow.style.display = '';
      if (toolbarControlRow) toolbarControlRow.style.display = '';
    } else {
      boxUserForcedGuideVisible = false;
      if (isDesktopDropzone) {
        dropzone.style.display = '';
      }
      if (guideCard) {
        guideCard.style.display = '';
      }
      if (toggleGuideBtn) {
        toggleGuideBtn.style.display = 'none';
      }
      if (searchFilterRow) searchFilterRow.style.display = 'none';
      if (toolbarControlRow) toolbarControlRow.style.display = 'none';
    }
  }

  function renderBox() {
    if (typeof document === 'undefined') return;
    syncBoxVisibility();
    updateBoxActiveFilterBadge();
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

      const isMobileH5 = typeof document !== 'undefined' && (!!document.querySelector('.mobile-h5-app') || (document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app')));
      if (isMobileH5 || boxViewMode === 'table') {
        renderBoxTable(filtered, container);
      } else {
        renderBoxGrid(filtered, container);
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

  function renderBoxCardIngSlot(ingName, arg2, arg3, arg4, arg5) {
    let basePkm = arg2;
    let slotIdx = 0;
    let currentLv = undefined;

    if (typeof arg2 === 'string' && typeof arg3 === 'object') {
      basePkm = arg3;
      slotIdx = typeof arg4 === 'number' ? arg4 : 0;
      currentLv = typeof arg5 === 'number' ? arg5 : undefined;
    } else if (typeof arg3 === 'number') {
      basePkm = arg2;
      slotIdx = arg3;
      currentLv = typeof arg4 === 'number' ? arg4 : undefined;
    } else if (typeof arg2 === 'object' && typeof arg3 === 'undefined') {
      basePkm = arg2;
      slotIdx = 0;
    }

    const unlockLv = slotIdx === 0 ? 1 : (slotIdx === 1 ? 30 : 60);
    const isUnlocked = currentLv === undefined || currentLv >= unlockLv;
    const lockClass = !isUnlocked ? ' ing-locked' : '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    if (!ingName || ingName === '--') {
      return `
        <div class="box-ing-chip is-empty${lockClass}">
          <span class="box-ing-chip-empty">--</span>
        </div>
      `;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);
    const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

    return `
      <div class="box-ing-chip${lockClass}" title="${escapeHtml(displayName)}${lockTitleSuffix}">
        ${iconUrl ? `<img src="${iconUrl}" class="box-ing-chip-icon" alt="${escapeHtml(displayName)}">` : ''}
      </div>
    `;
  }

  function renderBoxTableIngCell(ingName, basePkm, slotIdx, currentLv) {
    const unlockLv = slotIdx === 0 ? 1 : (slotIdx === 1 ? 30 : 60);
    const isUnlocked = currentLv === undefined || currentLv >= unlockLv;
    const lockClass = !isUnlocked ? ' ing-locked' : '';
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    if (!ingName || ingName === '--') {
      return `<td><span class="text-muted${lockClass}" style="font-size:11px;">--</span></td>`;
    }
    const displayName = window.I18N ? window.I18N.getIngredientName(ingName) : ingName;
    const iconUrl = (window.I18N && typeof window.I18N.getIngredientIcon === 'function') 
      ? window.I18N.getIngredientIcon(ingName) 
      : '';
    const count = getIngCountFromBase(basePkm, slotIdx, ingName);
    const lockTitleSuffix = !isUnlocked ? (isEN ? ' (Locked)' : ' (未開放)') : '';

    return `
      <td class="td-ing" title="${escapeHtml(displayName)}${lockTitleSuffix}">
        <div class="ing-cell${lockClass}">
          ${iconUrl ? `<img src="${iconUrl}" class="ing-icon" alt="${escapeHtml(displayName)}">` : ''}
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
          let specClass = 'spec-ingredient';
          const rawSpec = (base && base.specialty) || p.specialty || '';
          if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
            specClass = 'spec-berry';
          } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
            specClass = 'spec-skill';
          } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
            specClass = 'spec-all';
          }
          const natureDisplayName = window.I18N ? window.I18N.getNatureName(p.nature) : p.nature;
          const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
          const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

          return `
            <div class="box-card" data-uid="${p.uid}" title="${escapeHtml(prInfo.summaryNote || '')}">
              <div class="box-card-header">
                <div class="box-card-img-wrap">
                  ${iconUrl ? `<img src="${iconUrl}" alt="${escapeHtml(pkmDisplayName)}" class="box-card-icon" onerror="this.style.display='none';">` : ''}
                </div>
                <div class="box-card-info">
                  <div class="box-card-name-row">
                    ${boxShowNo ? `<span class="box-card-dex-no" style="font-size:11px;color:var(--text-muted);font-weight:600;margin-right:2px;">No.${base ? (base.formatted_no || base.id) : (p.pokemonId || '')}</span>` : ''}
                    <span class="box-card-name">${escapeHtml(pkmDisplayName)}</span>
                    <span class="box-card-level">Lv.${p.level || 1}</span>
                    <div class="box-card-actions">
                      <button type="button" class="box-action-btn btn-appraise" data-uid="${p.uid}" title="${isEN ? 'Appraisal Report' : '深度診斷報告書與六維雷達圖'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-edit" data-uid="${p.uid}" title="${isEN ? 'Edit' : '編輯寶可夢'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button type="button" class="box-action-btn btn-delete" data-uid="${p.uid}" title="${isEN ? 'Delete' : '刪除寶可夢'}">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                  ${p.nickname ? `<div class="box-card-nickname">${escapeHtml(p.nickname)}</div>` : ''}
                  <div class="box-card-tags">
                    ${berry && berry.icon ? `
                    <span class="pkm-berry-icon-wrapper" title="${berryName}">
                      <img src="${berry.icon}" alt="${berryName}" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;">
                    </span>` : ''}
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(base ? base.specialty : p.specialty, 18) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}
                    ${p.ribbon ? `
                      <span class="box-ribbon-tag" title="${isEN ? `Good-Night Ribbon Tier ${p.ribbon}` : `睡飽飽獎章`}">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${p.ribbon}.png" class="box-ribbon-icon" alt="Ribbon" />
                      </span>
                    ` : ''}
                  </div>
                </div>
              </div>

              <!-- 食材插槽組合 (精簡單行3個食材並行展示，未解鎖插槽半透明) -->
              <div class="box-card-section box-card-section-ing">
                <div class="box-ing-parallel-row">
                  <span class="box-ing-row-label">${isEN ? 'Ingredients:' : '食材：'}</span>
                  <div class="box-ing-chips-grid">
                    ${renderBoxCardIngSlot(p.ing1, base, 0, p.level || 1)}
                    ${renderBoxCardIngSlot(p.ing2, base, 1, p.level || 1)}
                    ${renderBoxCardIngSlot(p.ing3, base, 2, p.level || 1)}
                  </div>
                </div>
              </div>

              <!-- 副技能清單 (2+2+1 遊戲同款排列，無前置等級標籤，按解鎖狀態呈現) -->
              <div class="box-card-section">
                <div class="box-section-title">${isEN ? 'Sub-Skills' : '副技能組合'}</div>
                <div class="box-subskills-grid">
                  ${[10, 25, 50, 70, 80].map((lv, i) => {
                    const skName = (p.subskills || [])[i];
                    const sk = SUBSKILLS_DATA.find(s => s.name === skName);
                    const tier = sk ? sk.tier : 'empty';
                    const displaySkName = skName ? (window.I18N ? window.I18N.getSubSkillName(skName) : skName) : '--';
                    const isUnlocked = (p.level || 1) >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = sk 
                      ? (isEN ? `${sk.name_en || sk.name} (Lv.${lv}${!isUnlocked ? ' - Locked' : ''}): ${sk.desc_en || sk.desc}` : `${sk.name} (Lv.${lv}${!isUnlocked ? '未解鎖' : ''}): ${sk.desc}`)
                      : (isEN ? `Slot ${i + 1} (Lv.${lv})` : `第 ${i + 1} 欄位 (Lv.${lv})`);
                    return `
                      <div class="box-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(displaySkName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- 性格與修正 (同一行展示，無外框) -->
              <div class="box-card-footer">
                <div class="box-nature-single-row">
                  <span class="box-nature-label">${isEN ? 'Nature:' : '性格：'}</span>
                  <span class="box-nature-name font-bold">${escapeHtml(natureDisplayName || (isEN ? 'Hardy' : '坦率'))}</span>
                  ${(p.cleanseMint || p.mint) ? `
                    <span class="box-nature-effects">
                      <span class="nature-mint-tag" title="${isEN ? 'Cleanse Mint used: eliminated nature traits' : '使用淨白薄荷消除個性效果'}">${isEN ? 'Cleanse Mint (Neutralized)' : '使用淨白薄荷消除個性效果'}</span>
                    </span>
                  ` : (natureObj && natureObj.buff ? `
                    <span class="box-nature-effects">
                      ${natureObj.buff !== '無增減' ? `
                        <span class="nature-buff">▲▲ ${isEN ? (natureObj.buff_en || natureObj.buff) : natureObj.buff}</span>
                        <span class="nature-debuff">▼▼ ${isEN ? (natureObj.debuff_en || natureObj.debuff) : natureObj.debuff}</span>
                      ` : `<span class="nature-neutral">${isEN ? 'Neutral' : '無修正'}</span>`}
                    </span>
                  ` : '')}
                </div>
              </div>

              <!-- 智能簡評摘要 (直通頂尖料理精選) -->
              ${prInfo.summaryNote ? `
                <div class="box-card-summary" title="${escapeHtml(prInfo.summaryNote)}">
                  <span class="box-card-summary-label">${isEN ? 'Appraisal Note:' : '智能簡評：'}</span>
                  <span class="box-card-summary-text">${escapeHtml(prInfo.summaryNote)}</span>
                </div>
              ` : ''}
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
    const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');

    container.innerHTML = `
      <div class="table-container">
        <table class="pokemon-table box-table">
          <thead>
            <tr>
              ${boxSortableTh('id', t('th.icon', '圖示'), 'th-icon')}
              ${boxSortableTh('level', t('th.level', '等級'))}
              <th style="text-align:center;">${isEN ? 'Name / Nickname' : '寶可夢 / 暱稱'}</th>
              <th class="th-spec" style="text-align:center;">${t('th.specialty', '得意')}</th>
              <th style="text-align:center;">${t('th.berry', '樹果')}</th>
              <th style="text-align:center;">${isEN ? 'Ing 1' : '食1'}</th>
              <th style="text-align:center;">${isEN ? 'Ing 2' : '食2'}</th>
              <th style="text-align:center;">${isEN ? 'Ing 3' : '食3'}</th>
              <th style="text-align:center;">${t('th.actions', '操作')}</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(p => {
              const base = findPokemonBase(p.pokemonId || p.name);
              const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');
              const prInfo = calculatePokemonPR(p, base);
              const pkmDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : p.name) : (p.name || (base ? base.name_cn : '未知'));
              const specName = window.I18N ? window.I18N.getSpecialtyName((base && base.specialty) || p.specialty || '--') : ((base && base.specialty) || p.specialty || '--');
              let specClass = 'spec-ingredient';
              const rawSpec = (base && base.specialty) || p.specialty || '';
              if (rawSpec.includes('樹果') || rawSpec === 'Berries') {
                specClass = 'spec-berry';
              } else if (rawSpec.includes('技能') || rawSpec === 'Skills') {
                specClass = 'spec-skill';
              } else if (rawSpec.includes('全能') || rawSpec.includes('全部') || rawSpec === 'All-Rounder' || rawSpec.toLowerCase() === 'all') {
                specClass = 'spec-all';
              }
              const berry = (window.getPokemonBerry && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : null);
              const berryName = berry ? (window.I18N ? window.I18N.getBerryName(berry.name) : (berry.name || '--')) : '';

              return `
                <tr data-uid="${p.uid}" title="${escapeHtml(prInfo.summaryNote || '')}">
                  <td class="td-icon" style="text-align:center;">
                    <div class="table-icon-wrapper" style="margin:0 auto;width:34px;height:34px;">
                      ${iconUrl ? `<img src="${iconUrl}" alt="${pkmDisplayName}" class="table-icon" onerror="this.style.display='none';">` : ''}
                    </div>
                  </td>
                  <td style="text-align:center;">
                    <span class="box-table-lvl" style="font-weight:700;">Lv.${p.level || 1}</span>
                  </td>
                  <td style="text-align:center;">
                    <div class="table-name-cn" style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;text-align:center;">
                      ${boxShowNo ? `<span class="box-card-dex-no" style="font-size:11px;color:var(--text-muted);font-weight:600;">No.${base ? (base.formatted_no || base.id) : (p.pokemonId || '')}</span>` : ''}
                      <span style="font-weight:600;">${escapeHtml(pkmDisplayName)}</span>
                    </div>
                    ${p.nickname ? `<div style="font-size:11px;color:var(--accent-color);text-align:center;">${escapeHtml(p.nickname)}</div>` : ''}
                  </td>
                  <td class="td-spec" style="text-align:center;">
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(base ? base.specialty : p.specialty, 20) : `<span class="box-spec-tag ${specClass}">${specName}</span>`}
                  </td>
                  <td style="text-align:center;">
                    ${berry && berry.icon ? `<img src="${berry.icon}" width="22" height="22" class="table-berry-icon" alt="${berryName}" title="${berryName}">` : `<span class="berry-name-text">${berryName || '--'}</span>`}
                  </td>
                  ${renderBoxTableIngCell(p.ing1, base, 0, p.level || 1)}
                  ${renderBoxTableIngCell(p.ing2, base, 1, p.level || 1)}
                  ${renderBoxTableIngCell(p.ing3, base, 2, p.level || 1)}
                  <td style="text-align:center;">
                    <div style="display:flex;gap:6px;justify-content:center;align-items:center;">
                      ${!isMobileH5 ? `
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
                      ` : ''}
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
        <div class="table-bottom-spacer" aria-hidden="true"></div>
      </div>
    `;

    bindCardActions(container);
  }

  /* ─── 二次確認刪除彈窗 (Delete Confirmation Modal) ─── */
  function openDeleteConfirmModal(item) {
    if (!item) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const base = findPokemonBase(item.pokemonId || item.name);
    const pkmName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : '未知'));
    const displayName = item.nickname ? `${pkmName} (${item.nickname})` : pkmName;
    const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');

    let modal = document.getElementById('box-delete-confirm-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'box-delete-confirm-modal';
      modal.className = 'box-modal-backdrop modal-overlay';
      modal.style.zIndex = '10050';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="box-modal-dialog" style="max-width:360px;width:90%;border-radius:16px;padding:22px 20px;text-align:center;box-sizing:border-box;margin:auto;background:var(--bg-card-solid);border:1px solid var(--border-color);box-shadow:var(--shadow-lg);">
        <div style="width:48px;height:48px;border-radius:50%;background:rgba(239, 68, 68, 0.15);border:1.5px solid rgba(239, 68, 68, 0.35);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:#ef4444;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </div>
        <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">
          ${isEN ? 'Delete Pokémon?' : '確認刪除寶可夢？'}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:8px 0 14px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid var(--border-color-subtle, rgba(255,255,255,0.08));">
          ${iconUrl ? `<img src="${iconUrl}" width="32" height="32" style="border-radius:4px;object-fit:contain;" alt="">` : ''}
          <div style="text-align:left;">
            <div style="font-size:13px;font-weight:700;color:var(--text-primary);">${escapeHtml(displayName)}</div>
            <div style="font-size:11px;color:var(--text-muted);font-weight:600;">Lv.${item.level || 1}</div>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--text-secondary);line-height:1.5;margin:0 0 20px;">
          ${isEN 
            ? 'Are you sure you want to delete this Pokémon from your Box? This action cannot be undone.' 
            : '確定要將此隻寶可夢從倉庫中永久刪除嗎？刪除後將無法還原。'}
        </p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button type="button" id="box-delete-cancel-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;background:var(--bg-card);border:1px solid var(--border-color);color:var(--text-secondary);cursor:pointer;">
            ${isEN ? 'Cancel' : '取消'}
          </button>
          <button type="button" id="box-delete-confirm-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:700;background:#ef4444;border:none;color:#ffffff;cursor:pointer;">
            ${isEN ? 'Confirm Delete' : '確認刪除'}
          </button>
        </div>
      </div>
    `;

    if (typeof window !== 'undefined' && typeof window.prepareOverlayOpen === 'function') {
      window.prepareOverlayOpen(modal);
    }
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');

    function closeModal() {
      const cleanup = () => {
        document.body.classList.remove('modal-open');
        if (typeof window !== 'undefined' && typeof window.syncOverlayOpenState === 'function') {
          window.syncOverlayOpenState();
        }
      };
      if (typeof window !== 'undefined' && typeof window.animateOverlayClose === 'function') {
        window.animateOverlayClose(modal, cleanup);
      } else {
        modal.style.display = 'none';
        cleanup();
      }
    }

    const cancelBtn = modal.querySelector('#box-delete-cancel-btn');
    if (cancelBtn) cancelBtn.onclick = closeModal;

    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    const confirmBtn = modal.querySelector('#box-delete-confirm-btn');
    if (confirmBtn) {
      confirmBtn.onclick = () => {
        userBox = userBox.filter(p => p.uid !== item.uid);
        saveUserBox();
        renderBox();
        closeModal();
        if (typeof showToast === 'function') {
          showToast(isEN ? `Deleted ${displayName}` : `已刪除「${displayName}」`);
        }
      };
    }
  }
  if (typeof window !== 'undefined') {
    window.openDeleteConfirmModal = openDeleteConfirmModal;
  }
