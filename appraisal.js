/**
 * appraisal.js — 🔮 寶可夢深度診斷評測室與六維雷達圖報告書 (Deep Dive Appraisal & Radar Chart Lab)
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

  /* ─── 字典常數 ─────────────────────────────────────────── */
  const SIX_DIM_META = [
    { key: 'berry', label: '樹果產能', icon: '🍊', angle: -Math.PI / 2, desc: '單日樹果總能量潛力 (含樹果S、專長與幫速)' },
    { key: 'ingredient', label: '食材產能', icon: '🍲', angle: -Math.PI / 6, desc: '食材獲取期望與解鎖組合協同效應' },
    { key: 'skill', label: '技能強度', icon: '⚡', angle: Math.PI / 6, desc: '主技能觸發頻率、等級加成與爆發收益' },
    { key: 'speed', label: '幫忙速度', icon: '⏱️', angle: Math.PI / 2, desc: '整體幫忙頻率 (基礎間隔、幫速SM、幫獎與性格)' },
    { key: 'growth', label: '後期成長', icon: '📈', angle: 5 * Math.PI / 6, desc: 'Lv.50/60/75 後期技能與第三食材爆發潛能' },
    { key: 'roi', label: '資源效益', icon: '💎', angle: -5 * Math.PI / 6, desc: '成型週期、前中期戰力解鎖速度與糖果回報率' }
  ];

  /* 官方 EXP 累計表 (基準 1.0x 曲線) */
  const EXP_MILESTONES = {
    1: 0,
    10: 1600,
    25: 8700,
    30: 12000,
    50: 30000,
    60: 51500,
    75: 98000,
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
    75: 260000,
    100: 680000
  };

  /* ─── 核心評估演算法 ───────────────────────────────────── */
  function evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients) {
    if (!pkmData) return null;
    currentLv = currentLv || 30;
    natureName = natureName || '坦率';
    subskills = subskills || [];
    ingredients = ingredients || [];

    const specialty = pkmData.specialty || '樹果';
    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    
    // 性格修正
    const nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) || { buffType: 'none', debuffType: 'none' };

    // 1. 🍊 樹果產能 (Berry Power)
    let berryScore = (specialty === '樹果' || specialty.indexOf('樹果') !== -1) ? 68 : ((specialty === '食材' || specialty.indexOf('食材') !== -1) ? 35 : 30);
    const hasBFS = subskillArr.indexOf('樹果數量S') !== -1;
    const bfsIdx = subskillArr.indexOf('樹果數量S');
    if (hasBFS) {
      if (bfsIdx === 0) berryScore += 32; // Lv.10 BFS
      else if (bfsIdx === 1) berryScore += 26; // Lv.25 BFS
      else if (bfsIdx === 2) berryScore += 18; // Lv.50 BFS
      else berryScore += 12;
    }
    if (subskillArr.indexOf('幫忙速度M') !== -1) berryScore += 8;
    if (subskillArr.indexOf('幫手獎勵') !== -1) berryScore += 8;
    if (nature.buffType === 'speed') berryScore += 7;
    if (nature.debuffType === 'speed') berryScore -= 6;
    berryScore = Math.min(Math.max(Math.round(berryScore), 15), 100);

    // 2. 🍲 食材產能 (Ingredient Power)
    let ingScore = (specialty === '食材' || specialty.indexOf('食材') !== -1) ? 68 : ((specialty === '樹果' || specialty.indexOf('樹果') !== -1) ? 28 : 32);
    const hasIngM = subskillArr.indexOf('食材機率提升M') !== -1;
    const ingMIdx = subskillArr.indexOf('食材機率提升M');
    if (hasIngM) {
      if (ingMIdx === 0) ingScore += 24;
      else if (ingMIdx === 1) ingScore += 18;
      else ingScore += 12;
    }
    if (subskillArr.indexOf('食材機率提升S') !== -1) ingScore += 7;
    if (subskillArr.indexOf('幫忙速度M') !== -1) ingScore += 6;
    if (subskillArr.indexOf('持有上限提升L') !== -1 || subskillArr.indexOf('持有上限提升M') !== -1) ingScore += 6;
    if (nature.buffType === 'ingredient') ingScore += 12;
    if (nature.debuffType === 'ingredient') ingScore -= 12;
    
    // 食材組合 AAA/ABB 加分
    if (ingredients.length >= 2) {
      const isAAA = ingredients[0] === ingredients[1] && (ingredients[2] ? ingredients[0] === ingredients[2] : true);
      if (isAAA) ingScore += 6;
    }
    ingScore = Math.min(Math.max(Math.round(ingScore), 15), 100);

    // 3. ⚡ 技能強度 (Skill Power)
    let skillScore = (specialty === '技能' || specialty.indexOf('技能') !== -1) ? 68 : 32;
    const hasSkillM = subskillArr.indexOf('技能機率提升M') !== -1;
    const skillMIdx = subskillArr.indexOf('技能機率提升M');
    if (hasSkillM) {
      if (skillMIdx === 0) skillScore += 24;
      else if (skillMIdx === 1) skillScore += 18;
      else skillScore += 12;
    }
    if (subskillArr.indexOf('技能機率提升S') !== -1) skillScore += 7;
    if (subskillArr.indexOf('技能等級提升M') !== -1) skillScore += 12;
    if (subskillArr.indexOf('技能等級提升S') !== -1) skillScore += 6;
    if (nature.buffType === 'skill') skillScore += 12;
    if (nature.debuffType === 'skill') skillScore -= 12;
    skillScore = Math.min(Math.max(Math.round(skillScore), 15), 100);

    // 4. ⏱️ 幫忙速度 (Speed Power)
    let speedScore = 55;
    if (pkmData.interval) {
      const parts = pkmData.interval.split(':');
      const totalSec = (+parts[0] * 3600) + (+parts[1] * 60) + (+parts[2] || 0);
      if (totalSec < 2400) speedScore += 15; // 超高速
      else if (totalSec < 3000) speedScore += 8;
      else if (totalSec > 4000) speedScore -= 8;
    }
    if (subskillArr.indexOf('幫忙速度M') !== -1) speedScore += 14;
    if (subskillArr.indexOf('幫忙速度S') !== -1) speedScore += 7;
    if (subskillArr.indexOf('幫手獎勵') !== -1) speedScore += 8;
    if (nature.buffType === 'speed') speedScore += 10;
    if (nature.debuffType === 'speed') speedScore -= 8;
    speedScore = Math.min(Math.max(Math.round(speedScore), 20), 100);

    // 5. 📈 後期成長 (Late-game Growth)
    let growthScore = 50;
    const lateSubskills = subskillArr.slice(2); // Lv.50, 75, 100
    lateSubskills.forEach(function(s) {
      if (['樹果數量S', '幫手獎勵', '幫忙速度M', '食材機率提升M', '技能機率提升M'].indexOf(s) !== -1) {
        growthScore += 15;
      } else if (['睡眠EXP獎勵', '技能等級提升M', '持有上限提升L'].indexOf(s) !== -1) {
        growthScore += 8;
      }
    });
    if (nature.buffType === 'exp') growthScore += 6;
    if (nature.debuffType === 'exp') growthScore -= 4;
    growthScore = Math.min(Math.max(Math.round(growthScore), 20), 100);

    // 6. 💎 資源效益 (Resource Efficiency & ROI)
    let roiScore = 55;
    const earlySubskills = subskillArr.slice(0, 2); // Lv.10, 25
    if (specialty === '樹果' && earlySubskills.indexOf('樹果數量S') !== -1) roiScore += 25;
    if (specialty === '食材' && earlySubskills.indexOf('食材機率提升M') !== -1) roiScore += 22;
    if (specialty === '技能' && earlySubskills.indexOf('技能機率提升M') !== -1) roiScore += 22;
    if (earlySubskills.indexOf('幫手獎勵') !== -1 || earlySubskills.indexOf('幫忙速度M') !== -1) roiScore += 12;
    if (nature.buffType === 'exp') roiScore += 8;
    if (nature.debuffType === 'exp') roiScore -= 8;
    roiScore = Math.min(Math.max(Math.round(roiScore), 20), 100);

    // 綜合加權評分 (依專長動態加權)
    let compositeScore = 0;
    if (specialty === '樹果' || specialty.indexOf('樹果') !== -1) {
      compositeScore = (berryScore * 0.40) + (speedScore * 0.22) + (growthScore * 0.15) + (roiScore * 0.13) + (skillScore * 0.05) + (ingScore * 0.05);
    } else if (specialty === '食材' || specialty.indexOf('食材') !== -1) {
      compositeScore = (ingScore * 0.40) + (speedScore * 0.20) + (growthScore * 0.15) + (roiScore * 0.13) + (berryScore * 0.07) + (skillScore * 0.05);
    } else {
      compositeScore = (skillScore * 0.40) + (speedScore * 0.22) + (growthScore * 0.15) + (roiScore * 0.13) + (berryScore * 0.05) + (ingScore * 0.05);
    }
    compositeScore = Math.round(compositeScore);

    // 評級判定
    let grade = 'B';
    let gradeTitle = '⏳ 過渡可用 (Usable)';
    let gradeColor = '#94a3b8';
    if (compositeScore >= 90) {
      grade = 'S+';
      gradeTitle = '👑 頂級畢業 (God Tier)';
      gradeColor = '#eab308';
    } else if (compositeScore >= 80) {
      grade = 'S';
      gradeTitle = '🌟 強力主力 (High Potential)';
      gradeColor = '#38bdf8';
    } else if (compositeScore >= 68) {
      grade = 'A';
      gradeTitle = '👍 實用良品 (Solid Pick)';
      gradeColor = '#10b981';
    } else if (compositeScore >= 55) {
      grade = 'B';
      gradeTitle = '⏳ 過渡可用 (Usable)';
      gradeColor = '#a855f7';
    } else {
      grade = 'C';
      gradeTitle = '🍬 換糖回收 (Recycle)';
      gradeColor = '#ef4444';
    }

    // 深度優點與缺點分析 (Pros & Cons)
    const pros = [];
    const cons = [];

    if (hasBFS) {
      pros.push('✨ 擁有神技「樹果數量S」(' + (bfsIdx <= 1 ? 'Lv.10/25 早期解鎖，極度強勢' : '後期解鎖') + ')，樹果產能躍升 +1 個。');
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1) {
      cons.push('⚠️ 樹果型專長未配置「樹果數量S」，上限與產能較難與頂標相比。');
    }

    if (hasIngM) {
      pros.push('🍲 具備「食材機率提升M」(' + (ingMIdx <= 1 ? '前中期即可發力' : '後期解鎖') + ')，大幅提升料理食材供貨穩定度。');
    }

    if (hasSkillM) {
      pros.push('⚡ 擁有「技能機率提升M」，主技能發動頻率顯著提高。');
    }

    if (subskillArr.indexOf('幫手獎勵') !== -1) {
      pros.push('🤝 具備全隊頂級光環「幫手獎勵」，全員幫忙時間縮短 5%。');
    }

    if (subskillArr.indexOf('幫忙速度M') !== -1) {
      pros.push('⚡ 擁有「幫忙速度M」，自身幫忙間隔縮短 14%。');
    }

    if (nature.buffType === 'speed') {
      pros.push('🚀 性格「' + natureName + '」帶來幫忙速度▲▲ (+10%)，強化所有產出判定。');
    } else if (nature.debuffType === 'speed') {
      cons.push('⚠️ 性格「' + natureName + '」幫忙速度▼▼ (-7.5%)，對全方位產出有微幅負面影響。');
    }

    if (nature.buffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1)) {
      pros.push('🥩 性格「' + natureName + '」完美契合食材型專長 (食材發現率▲▲ +20%)。');
    } else if (nature.debuffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1)) {
      cons.push('❌ 性格「' + natureName + '」導致食材發現率▼▼ (-20%)，嚴重削弱食材專長優勢。');
    }

    if (nature.buffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1)) {
      pros.push('💖 性格「' + natureName + '」完美契合技能型專長 (主技能發動率▲▲ +20%)。');
    }

    if (pros.length === 0) {
      pros.push('💡 數值均衡，適合作為過渡期日常隊伍輔助成員。');
    }

    // 升級消耗計算 (升至 Lv.30, Lv.50, Lv.60)
    const costTo30 = calculateMilestoneCost(currentLv, 30, nature);
    const costTo50 = calculateMilestoneCost(currentLv, 50, nature);
    const costTo60 = calculateMilestoneCost(currentLv, 60, nature);

    return {
      scores: {
        berry: berryScore,
        ingredient: ingScore,
        skill: skillScore,
        speed: speedScore,
        growth: growthScore,
        roi: roiScore
      },
      compositeScore: compositeScore,
      grade: grade,
      gradeTitle: gradeTitle,
      gradeColor: gradeColor,
      pros: pros,
      cons: cons,
      costs: {
        to30: costTo30,
        to50: costTo50,
        to60: costTo60
      }
    };
  }

  /* ─── 升級成本精算 ─────────────────────────────────────── */
  function calculateMilestoneCost(fromLv, targetLv, nature) {
    if (fromLv >= targetLv) {
      return { exp: 0, candies: 0, shards: 0, handyCandyS: 0, handyCandyM: 0 };
    }

    const startExp = EXP_MILESTONES[fromLv] || (fromLv * 100);
    const endExp = EXP_MILESTONES[targetLv] || (targetLv * 500);
    let expDiff = Math.max(endExp - startExp, 0);

    // 性格 EXP 修正 (EXP▲▲ 需要少 18% EXP / 糖果給 1.18x，EXP▼▼ 需要多 18% EXP)
    if (nature && nature.buffType === 'exp') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (nature && nature.debuffType === 'exp') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candies = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shards = Math.max(endShards - startShards, 0);

    const handyCandyS = Math.ceil(candies / 3);
    const handyCandyM = Math.ceil(candies / 20);

    return {
      exp: expDiff,
      candies: candies,
      shards: shards,
      handyCandyS: handyCandyS,
      handyCandyM: handyCandyM
    };
  }

  /* ─── 原生 SVG 六維雷達圖生成器 ───────────────────────── */
  function renderRadarChartSVG(scores, size) {
    size = size || 290;
    const cx = size / 2;
    const cy = (size / 2) + 4;
    const r = (size / 2) - 46; // 最大半徑約 95px

    const scoreKeys = ['berry', 'ingredient', 'skill', 'speed', 'growth', 'roi'];
    const angles = SIX_DIM_META.map(function(m) { return m.angle; });

    // 生成 5 圈同心六角形網格
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(function(level) {
      const pts = angles.map(function(a) {
        const x = cx + (r * level) * Math.cos(a);
        const y = cy + (r * level) * Math.sin(a);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      return '<polygon points=\"' + pts + '\" fill=\"none\" stroke=\"rgba(255,255,255,0.08)\" stroke-width=\"' + (level === 1.0 ? '1.5' : '1') + '\" stroke-dasharray=\"' + (level === 1.0 ? 'none' : '2,2') + '\" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function(a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line x1=\"' + cx + '\" y1=\"' + cy + '\" x2=\"' + x2.toFixed(1) + '\" y2=\"' + y2.toFixed(1) + '\" stroke=\"rgba(255,255,255,0.12)\" stroke-width=\"1\" />';
    }).join('');

    // 計算資料多邊形座標
    const dataPoints = scoreKeys.map(function(k, i) {
      const score = Math.max(scores[k] || 20, 10);
      const radius = (score / 100) * r;
      const x = cx + radius * Math.cos(angles[i]);
      const y = cy + radius * Math.sin(angles[i]);
      return { x: x, y: y, score: score, key: k, meta: SIX_DIM_META[i] };
    });

    const dataPolygonPoints = dataPoints.map(function(p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // 頂點標籤與小圓點
    const labelsAndDots = dataPoints.map(function(p, i) {
      const labelDist = r + 24;
      const lx = cx + labelDist * Math.cos(angles[i]);
      const ly = cy + labelDist * Math.sin(angles[i]) + (i === 0 ? -4 : (i === 3 ? 12 : 3));
      
      let textAnchor = 'middle';
      if (i === 1 || i === 2) textAnchor = 'start';
      else if (i === 4 || i === 5) textAnchor = 'end';

      return '<circle cx=\"' + p.x.toFixed(1) + '\" cy=\"' + p.y.toFixed(1) + '\" r=\"4\" fill=\"#38bdf8\" stroke=\"#ffffff\" stroke-width=\"1.5\" />' +
             '<text x=\"' + lx.toFixed(1) + '\" y=\"' + ly.toFixed(1) + '\" text-anchor=\"' + textAnchor + '\" class=\"radar-label\" fill=\"#f1f5f9\" font-size=\"11\" font-weight=\"700\">' +
             p.meta.icon + ' ' + p.meta.label + ' <tspan fill=\"#38bdf8\" font-size=\"10\" font-weight=\"800\">' + p.score + '</tspan></text>';
    }).join('');

    return '<svg viewBox=\"0 0 ' + size + ' ' + size + '\" class=\"radar-svg-chart\" width=\"' + size + '\" height=\"' + size + '\" xmlns=\"http://www.w3.org/2000/svg\">' +
           '<defs><linearGradient id=\"radarFillGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"100%\">' +
           '<stop offset=\"0%\" stop-color=\"rgba(56, 189, 248, 0.45)\" />' +
           '<stop offset=\"100%\" stop-color=\"rgba(234, 179, 8, 0.35)\" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon points=\"' + dataPolygonPoints + '\" fill=\"url(#radarFillGradient)\" stroke=\"#38bdf8\" stroke-width=\"2.5\" />' +
           labelsAndDots +
           '</svg>';
  }

  /* ─── 診斷報告書彈窗管理 ───────────────────────────────── */
  function openAppraisalModal(pkmOrBoxItem) {
    if (!pkmOrBoxItem) return;

    let pkmData = null;
    let currentLv = pkmOrBoxItem.level || 30;
    let natureName = pkmOrBoxItem.nature || '坦率';
    let subskills = pkmOrBoxItem.subskills || [];
    let ingredients = pkmOrBoxItem.ingredients || [];

    if (pkmOrBoxItem.pkm) {
      pkmData = pkmOrBoxItem.pkm;
    } else if (pkmOrBoxItem.name_cn) {
      pkmData = pkmOrBoxItem;
    } else if (window.allPokemons) {
      pkmData = window.allPokemons.find(function(p) { return p.name_cn === pkmOrBoxItem.name || p.id === pkmOrBoxItem.pkmId; });
    }

    if (!pkmData && window.allPokemons && window.allPokemons[0]) {
      pkmData = window.allPokemons[0];
    }

    const evaluation = evaluatePokemon(pkmData, currentLv, natureName, subskills, ingredients);
    if (!evaluation) return;

    let modal = document.getElementById('modal-appraisal-report');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-appraisal-report';
      modal.className = 'appraisal-modal-backdrop';
      document.body.appendChild(modal);
    }

    const radarSVG = renderRadarChartSVG(evaluation.scores, 280);

    modal.innerHTML = `
      <div class="appraisal-modal-container">
        <!-- 頂部標題與關閉按鈕 -->
        <div class="appraisal-modal-header">
          <div class="appraisal-header-title-group">
            <span class="appraisal-modal-badge">🔮 深度能力診斷報告</span>
            <h2 class="appraisal-pokemon-title">${pkmData.name_cn} <span class="appraisal-pokemon-en">${pkmData.name_en || ''}</span></h2>
          </div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="關閉">✕</button>
        </div>

        <!-- 報告核心主體 -->
        <div class="appraisal-modal-body">
          <!-- 左欄：寶可夢基本卡片與配置 -->
          <div class="appraisal-left-col">
            <div class="appraisal-profile-card">
              <div class="appraisal-avatar-wrapper">
                <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${pkmData.name_cn}">
                <span class="appraisal-level-badge">Lv. ${currentLv}</span>
              </div>
              
              <div class="appraisal-specialty-row">
                <span class="appraisal-type-tag">${pkmData.type}屬性</span>
                <span class="appraisal-spec-tag">${pkmData.specialty}專長</span>
              </div>

              <!-- 性格 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">🧬 性格</div>
                <div class="appraisal-nature-badge">${natureName}</div>
              </div>

              <!-- 副技能清單 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">🧩 已配置副技能</div>
                <div class="appraisal-subskills-list">
                  ${subskills && subskills.length > 0 ? subskills.map(function(s, idx) {
                    const sName = typeof s === 'string' ? s : (s ? s.name : '');
                    const levels = [10, 25, 50, 75, 100];
                    return sName ? `<div class="appraisal-subskill-pill"><span class="subskill-lv-tag">Lv.${levels[idx]}</span> ${sName}</div>` : '';
                  }).join('') : '<span class="text-secondary text-sm">無自訂副技能</span>'}
                </div>
              </div>
            </div>

            <!-- 綜合評級卡片 -->
            <div class="appraisal-verdict-box" style="border-color: ${evaluation.gradeColor};">
              <div class="appraisal-grade-large" style="color: ${evaluation.gradeColor};">${evaluation.grade}</div>
              <div class="appraisal-grade-title">${evaluation.gradeTitle}</div>
              <div class="appraisal-composite-score">綜合潛力分：<span class="font-bold text-accent">${evaluation.compositeScore}</span> / 100</div>
            </div>
          </div>

          <!-- 右欄：雷達圖 + 六維量表 + 深度點評 + 糖果升級試算 -->
          <div class="appraisal-right-col">
            <!-- 上半部：雷達圖與六維能量條 -->
            <div class="appraisal-chart-flex">
              <div class="appraisal-radar-wrapper">
                ${radarSVG}
              </div>

              <div class="appraisal-scores-breakdown">
                <h4 class="appraisal-section-heading">📊 六維能力量化分析</h4>
                ${SIX_DIM_META.map(function(m) {
                  const score = evaluation.scores[m.key] || 0;
                  return `
                    <div class="appraisal-dim-row" title="${m.desc}">
                      <div class="appraisal-dim-label">
                        <span>${m.icon} ${m.label}</span>
                        <span class="font-bold text-white">${score} 分</span>
                      </div>
                      <div class="appraisal-dim-bar-bg">
                        <div class="appraisal-dim-bar-fill" style="width: ${score}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 中半部：專長深度點評與優缺點 -->
            <div class="appraisal-analysis-card">
              <h4 class="appraisal-section-heading">💡 專長與性格副技能協同點評</h4>
              
              <div class="appraisal-pros-list">
                ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
              </div>

              ${evaluation.cons.length > 0 ? `
                <div class="appraisal-cons-list">
                  ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- 下半部：關鍵里程碑升級消耗試算 -->
            <div class="appraisal-costs-card">
              <h4 class="appraisal-section-heading">🍬 關鍵里程碑培育成本精算 (當前 Lv.${currentLv})</h4>
              <div class="appraisal-costs-grid">
                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">🎯 升至 Lv. 30 <span class="cost-milestone-sub">(解鎖第 2 食材)</span></div>
                  ${currentLv >= 30 ? '<div class="cost-achieved">✅ 已達成</div>' : `
                    <div class="cost-detail-row">🍬 專屬糖果：<span class="cost-val">${evaluation.costs.to30.candies} 顆</span> (萬能S: ${evaluation.costs.to30.handyCandyS} / M: ${evaluation.costs.to30.handyCandyM})</div>
                    <div class="cost-detail-row">✨ 夢之碎片：<span class="cost-val">${evaluation.costs.to30.shards.toLocaleString()} 碎片</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">🚀 升至 Lv. 50 <span class="cost-milestone-sub">(解鎖第 3 副技能)</span></div>
                  ${currentLv >= 50 ? '<div class="cost-achieved">✅ 已達成</div>' : `
                    <div class="cost-detail-row">🍬 專屬糖果：<span class="cost-val">${evaluation.costs.to50.candies} 顆</span> (萬能S: ${evaluation.costs.to50.handyCandyS} / M: ${evaluation.costs.to50.handyCandyM})</div>
                    <div class="cost-detail-row">✨ 夢之碎片：<span class="cost-val">${evaluation.costs.to50.shards.toLocaleString()} 碎片</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">👑 升至 Lv. 60 <span class="cost-milestone-sub">(解鎖第 3 食材完全體)</span></div>
                  ${currentLv >= 60 ? '<div class="cost-achieved">✅ 已達成</div>' : `
                    <div class="cost-detail-row">🍬 專屬糖果：<span class="cost-val">${evaluation.costs.to60.candies} 顆</span> (萬能S: ${evaluation.costs.to60.handyCandyS} / M: ${evaluation.costs.to60.handyCandyM})</div>
                    <div class="cost-detail-row">✨ 夢之碎片：<span class="cost-val">${evaluation.costs.to60.shards.toLocaleString()} 碎片</span></div>
                  `}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeAppraisalModal() {
    const modal = document.getElementById('modal-appraisal-report');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  /* ─── 獨立模擬評測實驗室 (Appraisal Lab) ───────────────── */
  let labState = {
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: []
  };

  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;

    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    if (pokemons.length === 0) {
      targetElement.innerHTML = '<div style="padding:20px;text-align:center;color:#94a3b8;">載入圖鑑資料中...</div>';
      return;
    }

    const currentPkm = pokemons.find(function(p) { return p.id === labState.selectedPkmId; }) || pokemons[0];
    const natures = (window.UserBox && window.UserBox.NATURE_DATA) || [];
    const subskillPool = (window.UserBox && window.UserBox.SUBSKILLS_DATA) || [];

    const evaluation = evaluatePokemon(currentPkm, labState.level, labState.nature, labState.subskills, labState.ingredients);
    const radarSVG = evaluation ? renderRadarChartSVG(evaluation.scores, 270) : '';

    targetElement.innerHTML = `
      <div class="appraisal-lab-card">
        <div class="appraisal-lab-header">
          <div class="appraisal-lab-title-group">
            <span class="appraisal-lab-badge">🔮 評測實驗室 (Lab)</span>
            <h3 class="appraisal-lab-title">寶可夢深度診斷評測實驗室</h3>
          </div>
          <p class="appraisal-lab-desc">自由挑選任何寶可夢物種、自選性格、副技能與等級，即時繪製六維雷達圖並精算潛力與升級成本！</p>
        </div>

        <div class="appraisal-lab-layout">
          <!-- 左側：自訂配置控制器 -->
          <div class="appraisal-lab-controls">
            <!-- 寶可夢選擇 -->
            <div class="lab-control-group">
              <label for="lab-pkm-select" class="lab-control-label">選擇寶可夢物種：</label>
              <select id="lab-pkm-select" class="lab-select" onchange="window.AppraisalLab.onPkmChange(this.value)">
                ${pokemons.map(function(p) {
                  return '<option value="' + p.id + '" ' + (p.id === labState.selectedPkmId ? 'selected' : '') + '>#' + p.formatted_no + ' ' + p.name_cn + ' (' + p.specialty + '型 / ' + p.type + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 等級滑桿 -->
            <div class="lab-control-group">
              <label for="lab-level-slider" class="lab-control-label">
                培育等級：<span class="font-bold text-accent">Lv. ${labState.level}</span>
              </label>
              <input type="range" id="lab-level-slider" min="1" max="60" value="${labState.level}" step="1" class="lab-slider" oninput="window.AppraisalLab.onLevelChange(this.value)">
            </div>

            <!-- 性格選擇 -->
            <div class="lab-control-group">
              <label for="lab-nature-select" class="lab-control-label">性格設定：</label>
              <select id="lab-nature-select" class="lab-select" onchange="window.AppraisalLab.onNatureChange(this.value)">
                ${natures.map(function(n) {
                  return '<option value="' + n.name + '" ' + (n.name === labState.nature ? 'selected' : '') + '>' + n.name + ' (' + n.buff + ' / ' + n.debuff + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 5 個副技能槽位選擇 -->
            <div class="lab-control-group">
              <label class="lab-control-label">副技能配置 (Lv.10, 25, 50, 75, 100)：</label>
              <div class="lab-subskills-picker">
                ${[10, 25, 50, 75, 100].map(function(lv, idx) {
                  return '<div class="lab-subskill-slot"><span class="slot-lv-label">Lv.' + lv + '</span><select class="lab-select-subskill" onchange="window.AppraisalLab.onSubskillChange(' + idx + ', this.value)"><option value="">(無)</option>' +
                    subskillPool.map(function(s) {
                      return '<option value="' + s.name + '" ' + (labState.subskills[idx] === s.name ? 'selected' : '') + '>' + s.name + '</option>';
                    }).join('') + '</select></div>';
                }).join('')}
              </div>
            </div>
          </div>

          <!-- 右側：即時評測報告與雷達圖 -->
          <div class="appraisal-lab-preview">
            <div class="lab-preview-header">
              <div class="lab-preview-pokemon-info">
                <img src="${currentPkm.icon_url}" class="lab-preview-icon" alt="${currentPkm.name_cn}">
                <div>
                  <div class="lab-preview-name">${currentPkm.name_cn}</div>
                  <div class="lab-preview-spec">${currentPkm.type}屬性 · ${currentPkm.specialty}專長</div>
                </div>
              </div>

              <div class="lab-preview-verdict" style="border-color: ${evaluation.gradeColor}; color: ${evaluation.gradeColor};">
                <span class="lab-grade-char">${evaluation.grade}</span>
                <span class="lab-grade-title">${evaluation.gradeTitle}</span>
              </div>
            </div>

            <div class="lab-preview-chart-row">
              <div class="lab-chart-box">
                ${radarSVG}
              </div>

              <div class="lab-scores-box">
                <div class="lab-scores-title">六維數值評分</div>
                ${SIX_DIM_META.map(function(m) {
                  return '<div class="lab-dim-item"><span>' + m.icon + ' ' + m.label + '</span><span class="font-bold text-accent">' + evaluation.scores[m.key] + ' 分</span></div>';
                }).join('')}
              </div>
            </div>

            <div class="lab-pros-box">
              ${evaluation.pros.map(function(p) { return '<div class="lab-bullet-item">' + p + '</div>'; }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function onPkmChange(pkmId) {
    labState.selectedPkmId = pkmId;
    updateLabUI();
  }

  function onLevelChange(val) {
    labState.level = parseInt(val, 10) || 30;
    updateLabUI();
  }

  function onNatureChange(nature) {
    labState.nature = nature;
    updateLabUI();
  }

  function onSubskillChange(idx, val) {
    labState.subskills[idx] = val;
    updateLabUI();
  }

  function updateLabUI() {
    const container = document.getElementById('appraisal-lab-container');
    if (container) {
      renderAppraisalLabContainer(container);
    }
  }

  /* ─── 全域導出 ─────────────────────────────────────────── */
  window.AppraisalLab = {
    evaluatePokemon: evaluatePokemon,
    renderRadarChartSVG: renderRadarChartSVG,
    calculateMilestoneCost: calculateMilestoneCost,
    openModal: openAppraisalModal,
    closeModal: closeAppraisalModal,
    renderLab: renderAppraisalLabContainer,
    onPkmChange: onPkmChange,
    onLevelChange: onLevelChange,
    onNatureChange: onNatureChange,
    onSubskillChange: onSubskillChange,
    toggleLab: function () {
      const container = document.getElementById('appraisal-lab-container');
      if (container) {
        const isHidden = container.style.display === 'none' || getComputedStyle(container).display === 'none';
        container.style.display = isHidden ? 'block' : 'none';
        if (isHidden) renderAppraisalLabContainer(container);
      }
    }
  };

  // 全域別名
  window.openAppraisalModal = openAppraisalModal;
  window.closeAppraisalModal = closeAppraisalModal;

})();