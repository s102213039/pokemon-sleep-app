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
