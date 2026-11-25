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
            <img src="${avatarUrl}" class="lab-compare-vs-avatar" alt="${window.I18N?.t?.('lab.c_cmp_player_label', { letter }) ?? `Player ${letter}`}" loading="lazy">
            <span class="lab-compare-vs-lvl">Lv.${effLevel}</span>
          </div>
          <div class="lab-compare-micro-meta">
            ${specHtml}
            ${berry && berry.icon ? `<img src="${berry.icon}" class="lab-compare-mini-berry" alt="Berry" title="${escapeHtml(berryDisp)}">` : ''}
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
