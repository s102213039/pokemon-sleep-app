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
