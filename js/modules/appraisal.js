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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    currentLv = currentLv || 30;
    natureName = natureName || '坦率';
    subskills = subskills || [];
    ingredients = ingredients || [];

    const specialty = pkmData.specialty || '樹果';
    const subskillArr = Array.isArray(subskills) ? subskills.map(function(s) { return typeof s === 'string' ? s : (s ? s.name : ''); }) : [];
    
    // 性格修正
    const nature = (window.UserBox && window.UserBox.NATURE_DICT && window.UserBox.NATURE_DICT[natureName]) || { buffType: 'none', debuffType: 'none' };
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    // 1. 🍊 樹果產能 (Berry Power)
    let berryScore = (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') ? 68 : ((specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') ? 35 : 30);
    const hasBFS = subskillArr.indexOf('樹果數量S') !== -1;
    const bfsIdx = subskillArr.indexOf('樹果數量S');
    if (hasBFS) {
      if (bfsIdx === 0) berryScore += 32;
      else if (bfsIdx === 1) berryScore += 26;
      else if (bfsIdx === 2) berryScore += 18;
      else berryScore += 12;
    }
    if (subskillArr.indexOf('幫忙速度M') !== -1) berryScore += 8;
    if (subskillArr.indexOf('幫手獎勵') !== -1) berryScore += 8;
    if (nature.buffType === 'speed') berryScore += 7;
    if (nature.debuffType === 'speed') berryScore -= 6;
    berryScore = Math.min(Math.max(Math.round(berryScore), 15), 100);

    // 2. 🍲 食材產能 (Ingredient Power)
    let ingScore = (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') ? 68 : ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') ? 28 : 32);
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
    let skillScore = (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') ? 68 : 32;
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
      if (totalSec < 2400) speedScore += 15;
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
    const lateSubskills = subskillArr.slice(2);
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
    const earlySubskills = subskillArr.slice(0, 2);
    if ((specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') && earlySubskills.indexOf('樹果數量S') !== -1) roiScore += 25;
    if ((specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') && earlySubskills.indexOf('食材機率提升M') !== -1) roiScore += 22;
    if ((specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills') && earlySubskills.indexOf('技能機率提升M') !== -1) roiScore += 22;
    if (earlySubskills.indexOf('幫手獎勵') !== -1 || earlySubskills.indexOf('幫忙速度M') !== -1) roiScore += 12;
    if (nature.buffType === 'exp') roiScore += 8;
    if (nature.debuffType === 'exp') roiScore -= 8;
    roiScore = Math.min(Math.max(Math.round(roiScore), 20), 100);

    // 綜合加權評分
    let compositeScore = 0;
    if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      compositeScore = (berryScore * 0.40) + (speedScore * 0.22) + (growthScore * 0.15) + (roiScore * 0.13) + (skillScore * 0.05) + (ingScore * 0.05);
    } else if (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients') {
      compositeScore = (ingScore * 0.40) + (speedScore * 0.20) + (growthScore * 0.15) + (roiScore * 0.13) + (berryScore * 0.07) + (skillScore * 0.05);
    } else {
      compositeScore = (skillScore * 0.40) + (speedScore * 0.22) + (growthScore * 0.15) + (roiScore * 0.13) + (berryScore * 0.05) + (ingScore * 0.05);
    }
    compositeScore = Math.round(compositeScore);

    // 評級判定
    let grade = 'B';
    let gradeTitle = isEN ? '⏳ Usable' : '⏳ 過渡可用 (Usable)';
    let gradeColor = '#94a3b8';
    if (compositeScore >= 90) {
      grade = 'S+';
      gradeTitle = isEN ? '👑 God Tier' : '👑 頂級畢業 (God Tier)';
      gradeColor = '#eab308';
    } else if (compositeScore >= 80) {
      grade = 'S';
      gradeTitle = isEN ? '🌟 High Potential' : '🌟 強力主力 (High Potential)';
      gradeColor = '#38bdf8';
    } else if (compositeScore >= 68) {
      grade = 'A';
      gradeTitle = isEN ? '👍 Solid Pick' : '👍 實用良品 (Solid Pick)';
      gradeColor = '#10b981';
    } else if (compositeScore >= 55) {
      grade = 'B';
      gradeTitle = isEN ? '⏳ Usable' : '⏳ 過渡可用 (Usable)';
      gradeColor = '#a855f7';
    } else {
      grade = 'C';
      gradeTitle = isEN ? '🍬 Recycle' : '🍬 換糖回收 (Recycle)';
      gradeColor = '#ef4444';
    }

    // 深度優點與缺點分析 (Pros & Cons)
    const pros = [];
    const cons = [];

    if (hasBFS) {
      pros.push(isEN
        ? `✨ Equipped with God-tier sub-skill "Berry Finding S" (${bfsIdx <= 1 ? 'Early Lv.10/25 unlock, immense power' : 'Late unlock'}), +1 berry per help.`
        : '✨ 擁有神技「樹果數量S」(' + (bfsIdx <= 1 ? 'Lv.10/25 早期解鎖，極度強勢' : '後期解鎖') + ')，樹果產能躍升 +1 個。');
    } else if (specialty === '樹果' || specialty.indexOf('樹果') !== -1 || specialty === 'Berries') {
      cons.push(isEN
        ? '⚠️ Berry specialist without "Berry Finding S", ceiling is below top meta.'
        : '⚠️ 樹果型專長未配置「樹果數量S」，上限與產能較難與頂標相比。');
    }

    if (hasIngM) {
      pros.push(isEN
        ? `🍲 Features "Ingredient Finder M" (${ingMIdx <= 1 ? 'Early unlock powers recipes quickly' : 'Late unlock'}), greatly stabilizing ingredient supply.`
        : '🍲 具備「食材機率提升M」(' + (ingMIdx <= 1 ? '前中期即可發力' : '後期解鎖') + ')，大幅提升料理食材供貨穩定度。');
    }

    if (hasSkillM) {
      pros.push(isEN
        ? '⚡ Features "Skill Trigger M", significantly raising main skill activation frequency.'
        : '⚡ 擁有「技能機率提升M」，主技能發動頻率顯著提高。');
    }

    if (subskillArr.indexOf('幫手獎勵') !== -1) {
      pros.push(isEN
        ? '🤝 Features top-tier team aura "Helping Bonus", reducing team helping time by 5%.'
        : '🤝 具備全隊頂級光環「幫手獎勵」，全員幫忙時間縮短 5%。');
    }

    if (subskillArr.indexOf('幫忙速度M') !== -1) {
      pros.push(isEN
        ? '⚡ Features "Helping Speed M", shortening self helping interval by 14%.'
        : '⚡ 擁有「幫忙速度M」，自身幫忙間隔縮短 14%。');
    }

    if (nature.buffType === 'speed') {
      pros.push(isEN
        ? `🚀 Nature "${natDisplayName}" provides Speed of Help ▲ (+10%), boosting all production.`
        : '🚀 性格「' + natureName + '」帶來幫忙速度▲ (+10%)，強化所有產出判定。');
    } else if (nature.debuffType === 'speed') {
      cons.push(isEN
        ? `⚠️ Nature "${natDisplayName}" reduces Speed of Help ▼ (-7.5%), slightly impacting output.`
        : '⚠️ 性格「' + natureName + '」幫忙速度▼ (-7.5%)，對全方位產出有微幅負面影響。');
    }

    if (nature.buffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      pros.push(isEN
        ? `🥩 Nature "${natDisplayName}" perfectly synergizes with Ingredient specialty (Ingredient Finder ▲ +20%).`
        : '🥩 性格「' + natureName + '」完美契合食材型專長 (食材發現率▲ +20%)。');
    } else if (nature.debuffType === 'ingredient' && (specialty === '食材' || specialty.indexOf('食材') !== -1 || specialty === 'Ingredients')) {
      cons.push(isEN
        ? `❌ Nature "${natDisplayName}" reduces Ingredient Finding ▼ (-20%), severely weakening specialty advantage.`
        : '❌ 性格「' + natureName + '」導致食材發現率▼ (-20%)，嚴重削弱食材專長優勢。');
    }

    if (nature.buffType === 'skill' && (specialty === '技能' || specialty.indexOf('技能') !== -1 || specialty === 'Skills')) {
      pros.push(isEN
        ? `💖 Nature "${natDisplayName}" perfectly matches Skill specialty (Main Skill Trigger ▲ +20%).`
        : '💖 性格「' + natureName + '」完美契合技能型專長 (主技能發動率▲ +20%)。');
    }

    if (pros.length === 0) {
      pros.push(isEN
        ? '💡 Well-balanced stats, suitable as a reliable placeholder support.'
        : '💡 數值均衡，適合作為過渡期日常隊伍輔助成員。');
    }

    // 升級消耗計算
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

    if (nature && nature.buffType === 'exp') {
      expDiff = Math.round(expDiff * 0.82);
    } else if (nature && nature.debuffType === 'exp') {
      expDiff = Math.round(expDiff * 1.18);
    }

    const candiesNeeded = Math.ceil(expDiff / 25);
    const startShards = SHARD_MILESTONES[fromLv] || (fromLv * 80);
    const endShards = SHARD_MILESTONES[targetLv] || (targetLv * 1200);
    const shardsNeeded = Math.max(endShards - startShards, 0);

    return {
      exp: expDiff,
      candies: candiesNeeded,
      shards: shardsNeeded,
      handyCandyS: Math.ceil(candiesNeeded / 3),
      handyCandyM: Math.ceil(candiesNeeded / 20)
    };
  }

  /* ─── 原生 SVG 六維雷達圖生成器 (完美對稱正規六邊形 + 頂點直接標註分數) ───────────────────────── */
  function renderRadarChartSVG(scores, width, height) {
    width = width || 340;
    height = height || 320;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const SIX_DIM_META = getSixDimMeta(isEN);
    const cx = width / 2;
    const cy = (height / 2) + 2;
    const r = Math.min(width, height) / 2 - 58;

    const scoreKeys = ['berry', 'ingredient', 'skill', 'speed', 'growth', 'roi'];
    const angles = SIX_DIM_META.map(function (m) { return m.angle; });

    // 生成 5 圈同心正六角形網格
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];
    const gridPolygons = gridLevels.map(function (level) {
      const pts = angles.map(function (a) {
        const x = cx + (r * level) * Math.cos(a);
        const y = cy + (r * level) * Math.sin(a);
        return x.toFixed(1) + ',' + y.toFixed(1);
      }).join(' ');
      return '<polygon points="' + pts + '" fill="' + (level === 1.0 ? 'rgba(255,255,255,0.02)' : 'none') + '" stroke="rgba(255,255,255,0.09)" stroke-width="' + (level === 1.0 ? '1.5' : '1') + '" stroke-dasharray="' + (level === 1.0 ? 'none' : '2,2') + '" />';
    }).join('');

    // 生成 6 條徑向軸線
    const radialAxes = angles.map(function (a) {
      const x2 = cx + r * Math.cos(a);
      const y2 = cy + r * Math.sin(a);
      return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="rgba(255,255,255,0.12)" stroke-width="1" />';
    }).join('');

    // 計算資料多邊形座標
    const dataPoints = scoreKeys.map(function (k, i) {
      const score = Math.max(scores[k] || 20, 10);
      const radius = (score / 100) * r;
      const x = cx + radius * Math.cos(angles[i]);
      const y = cy + radius * Math.sin(angles[i]);
      return { x: x, y: y, score: score, key: k, meta: SIX_DIM_META[i] };
    });

    const dataPolygonPoints = dataPoints.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

    // 頂點標籤與數值 (維度名稱 + 評分標題直接整合在頂點)
    const labelsAndDots = dataPoints.map(function (p, i) {
      let lx = cx;
      let ly = cy;
      let textAnchor = 'middle';

      if (i === 0) { // Top (樹果產能)
        lx = cx;
        ly = cy - r - 22;
        textAnchor = 'middle';
      } else if (i === 1) { // Top-Right (食材產能)
        lx = cx + r * Math.cos(angles[i]) + 10;
        ly = cy + r * Math.sin(angles[i]) - 8;
        textAnchor = 'start';
      } else if (i === 2) { // Bottom-Right (技能強度)
        lx = cx + r * Math.cos(angles[i]) + 10;
        ly = cy + r * Math.sin(angles[i]) + 4;
        textAnchor = 'start';
      } else if (i === 3) { // Bottom (幫忙速度)
        lx = cx;
        ly = cy + r + 18;
        textAnchor = 'middle';
      } else if (i === 4) { // Bottom-Left (後期成長)
        lx = cx + r * Math.cos(angles[i]) - 10;
        ly = cy + r * Math.sin(angles[i]) + 4;
        textAnchor = 'end';
      } else if (i === 5) { // Top-Left (資源效益)
        lx = cx + r * Math.cos(angles[i]) - 10;
        ly = cy + r * Math.sin(angles[i]) - 8;
        textAnchor = 'end';
      }

      return '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />' +
             '<text x="' + lx.toFixed(1) + '" y="' + ly.toFixed(1) + '" text-anchor="' + textAnchor + '" class="radar-label">' +
             '<tspan x="' + lx.toFixed(1) + '" dy="0" fill="var(--text-primary)" font-size="11.5" font-weight="700">' + p.meta.label + '</tspan>' +
             '<tspan x="' + lx.toFixed(1) + '" dy="13" fill="#38bdf8" font-size="11" font-weight="800">' + p.score + (isEN ? ' pts' : ' 分') + '</tspan>' +
             '</text>';
    }).join('');

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" class="radar-svg-chart" width="100%" height="auto" style="max-width:' + width + 'px; display:block; margin:0 auto;" xmlns="http://www.w3.org/2000/svg">' +
           '<defs><linearGradient id="radarFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">' +
           '<stop offset="0%" stop-color="rgba(56, 189, 248, 0.45)" />' +
           '<stop offset="100%" stop-color="rgba(234, 179, 8, 0.35)" />' +
           '</linearGradient></defs>' +
           gridPolygons + radialAxes +
           '<polygon points="' + dataPolygonPoints + '" fill="url(#radarFillGradient)" stroke="#38bdf8" stroke-width="2.5" />' +
           labelsAndDots +
           '</svg>';
  }

  /* ─── 診斷報告書彈窗管理 ───────────────────────────────── */
  function openAppraisalModal(pkmOrBoxItem) {
    if (!pkmOrBoxItem) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

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
    const SIX_DIM_META = getSixDimMeta(isEN);
    const displayName = isEN ? (pkmData.name_en || pkmData.name_cn) : (pkmData.name_cn || pkmData.name_en);
    const typeName = window.I18N ? window.I18N.getTypeName(pkmData.type) : pkmData.type;
    const specName = window.I18N ? window.I18N.getSpecialtyName(pkmData.specialty) : pkmData.specialty;
    const natDisplayName = window.I18N ? window.I18N.getNatureName(natureName) : natureName;

    modal.innerHTML = `
      <div class="appraisal-modal-container">
        <!-- 頂部標題與關閉按鈕 -->
        <div class="appraisal-modal-header">
          <div class="appraisal-header-title-group">
            <span class="appraisal-modal-badge">${isEN ? '🔮 Deep-Dive Diagnostic Report' : '🔮 深度能力診斷報告'}</span>
            <h2 class="appraisal-pokemon-title" style="display:flex;align-items:center;">
              ${displayName}
              ${!isEN && pkmData.name_en ? `<span class="appraisal-pokemon-en">${pkmData.name_en}</span>` : ''}
            </h2>
          </div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${isEN ? 'Close' : '關閉'}">✕</button>
        </div>

        <!-- 報告核心主體 -->
        <div class="appraisal-modal-body">
          <!-- 左欄：寶可夢基本卡片與配置 -->
          <div class="appraisal-left-col">
            <div class="appraisal-profile-card">
              <div class="appraisal-avatar-wrapper">
                <img src="${pkmData.icon_url}" class="appraisal-avatar-img" alt="${displayName}">
                <span class="appraisal-level-badge">Lv. ${currentLv}</span>
              </div>
              
              <div class="appraisal-specialty-row">
                <span class="appraisal-type-tag" style="display:inline-flex;align-items:center;gap:4px;">${window.I18N ? window.I18N.getTypeIconSvg(pkmData.type, 16) : ''} <span>${typeName} ${isEN ? 'Type' : '屬性'}</span></span>
                <span class="appraisal-spec-tag">${specName} ${isEN ? 'Specialty' : '專長'}</span>
              </div>

              <!-- 性格 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">${isEN ? '🧬 Nature' : '🧬 性格'}</div>
                <div class="appraisal-nature-badge">${natDisplayName}</div>
              </div>

              <!-- 副技能清單 -->
              <div class="appraisal-config-section">
                <div class="appraisal-config-title">${isEN ? '🧩 Configured Sub-Skills' : '🧩 已配置副技能'}</div>
                <div class="appraisal-subskills-list">
                  ${subskills && subskills.length > 0 ? subskills.map(function(s, idx) {
                    const rawName = typeof s === 'string' ? s : (s ? s.name : '');
                    const sName = window.I18N ? window.I18N.getSubSkillName(rawName) : rawName;
                    const levels = [10, 25, 50, 75, 100];
                    return rawName ? `<div class="appraisal-subskill-pill"><span class="subskill-lv-tag">Lv.${levels[idx]}</span> ${sName}</div>` : '';
                  }).join('') : `<span class="text-secondary text-sm">${isEN ? 'No sub-skills configured' : '無自訂副技能'}</span>`}
                </div>
              </div>
            </div>

            <!-- 綜合評級卡片 -->
            <div class="appraisal-verdict-box" style="border-color: ${evaluation.gradeColor};">
              <div class="appraisal-grade-large" style="color: ${evaluation.gradeColor};">${evaluation.grade}</div>
              <div class="appraisal-grade-title">${evaluation.gradeTitle}</div>
              <div class="appraisal-composite-score">${isEN ? 'Overall Potential Score: ' : '綜合潛力分：'}<span class="font-bold text-accent">${evaluation.compositeScore}</span> / 100</div>
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
                <h4 class="appraisal-section-heading">${isEN ? '📊 6-Dimension Quantitative Analysis' : '📊 六維能力量化分析'}</h4>
                ${SIX_DIM_META.map(function(m) {
                  const score = evaluation.scores[m.key] || 0;
                  return `
                    <div class="appraisal-dim-row" title="${m.desc}">
                      <div class="appraisal-dim-label">
                        <span>${m.icon} ${m.label}</span>
                        <span class="font-bold text-white">${score} ${isEN ? 'pts' : '分'}</span>
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
              <h4 class="appraisal-section-heading">${isEN ? '💡 Specialty, Nature & Sub-Skill Synergy Analysis' : '💡 專長與性格副技能協同點評'}</h4>
              
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
              <h4 class="appraisal-section-heading">${isEN ? `🍬 Milestone Investment Calculator (Lv.${currentLv})` : `🍬 培育成本精算 (當前 Lv.${currentLv})`}</h4>
              <div class="appraisal-costs-grid">
                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '🎯 Reach Lv. 30' : '🎯 升至 Lv. 30'} <span class="cost-milestone-sub">${isEN ? '(Unlock 2nd Ingredient)' : '(解鎖第 2 食材)'}</span></div>
                  ${currentLv >= 30 ? `<div class="cost-achieved">${isEN ? '✅ Completed' : '✅ 已達成'}</div>` : `
                    <div class="cost-detail-row">🍬 ${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to30.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to30.handyCandyS} / M: ${evaluation.costs.to30.handyCandyM})</div>
                    <div class="cost-detail-row">✨ ${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to30.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '🚀 Reach Lv. 50' : '🚀 升至 Lv. 50'} <span class="cost-milestone-sub">${isEN ? '(Unlock 3rd Sub-Skill)' : '(解鎖第 3 副技能)'}</span></div>
                  ${currentLv >= 50 ? `<div class="cost-achieved">${isEN ? '✅ Completed' : '✅ 已達成'}</div>` : `
                    <div class="cost-detail-row">🍬 ${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to50.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to50.handyCandyS} / M: ${evaluation.costs.to50.handyCandyM})</div>
                    <div class="cost-detail-row">✨ ${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to50.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
                  `}
                </div>

                <div class="appraisal-cost-block">
                  <div class="cost-milestone-title">${isEN ? '👑 Reach Lv. 60' : '👑 升至 Lv. 60'} <span class="cost-milestone-sub">${isEN ? '(Unlock 3rd Ingredient Max)' : '(解鎖第 3 食材完全體)'}</span></div>
                  ${currentLv >= 60 ? `<div class="cost-achieved">${isEN ? '✅ Completed' : '✅ 已達成'}</div>` : `
                    <div class="cost-detail-row">🍬 ${isEN ? 'Species Candies: ' : '專屬糖果：'}<span class="cost-val">${evaluation.costs.to60.candies} ${isEN ? 'candies' : '顆'}</span> (${isEN ? 'Handy S' : '萬能S'}: ${evaluation.costs.to60.handyCandyS} / M: ${evaluation.costs.to60.handyCandyM})</div>
                    <div class="cost-detail-row">✨ ${isEN ? 'Dream Shards: ' : '夢之碎片：'}<span class="cost-val">${evaluation.costs.to60.shards.toLocaleString()} ${isEN ? 'shards' : '碎片'}</span></div>
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ─── 獨立模擬評測實驗室 (Appraisal Lab & Box Linkage) ───────────────── */
  let labState = {
    selectedBoxUid: '',
    selectedPkmId: '1',
    level: 30,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '食材機率提升M', '', ''],
    ingredients: [],
    nickname: '',
    isCustomized: false
  };

  function loadBoxItem(item) {
    if (!item) return;
    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const pkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; }) || pokemons[0];

    labState.selectedBoxUid = item.uid;
    labState.selectedPkmId = pkm ? pkm.id : '1';
    labState.level = item.level || 30;
    labState.nature = item.nature || '坦率';

    const rawSubs = Array.isArray(item.subskills) ? item.subskills.slice(0, 5) : [];
    while (rawSubs.length < 5) rawSubs.push('');
    labState.subskills = rawSubs;

    labState.ingredients = [item.ing1, item.ing2, item.ing3].filter(Boolean);
    labState.nickname = item.nickname || '';
    labState.isCustomized = false;
  }

  function onBoxItemSelect(uid) {
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    if (!uid) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.isCustomized = false;
      updateLabUI();
      return;
    }
    const item = userBox.find(function (p) { return p.uid === uid; });
    if (item) {
      loadBoxItem(item);
      updateLabUI();
    }
  }

  function resetToBoxOriginal() {
    if (!labState.selectedBoxUid) return;
    onBoxItemSelect(labState.selectedBoxUid);
  }

  function renderAppraisalLabContainer(targetElement) {
    if (!targetElement) return;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    const pokemons = window.allPokemons || (window.PokemonApp && window.PokemonApp.allPokemons) || [];
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    
    if (pokemons.length === 0) {
      targetElement.innerHTML = `<div style="padding:20px;text-align:center;color:#94a3b8;">${isEN ? 'Loading Pokédex data...' : '載入圖鑑資料中...'}</div>`;
      return;
    }

    // 若有選中 boxUid 但該物品已不存在，重置為自訂模式
    if (labState.selectedBoxUid && !userBox.some(function (p) { return p.uid === labState.selectedBoxUid; })) {
      labState.selectedBoxUid = '';
      labState.nickname = '';
      labState.isCustomized = false;
    }

    const currentPkm = pokemons.find(function (p) { return p.id === labState.selectedPkmId; }) || pokemons[0];
    const natures = (window.UserBox && window.UserBox.NATURE_DATA) || [];
    const subskillPool = (window.UserBox && window.UserBox.SUBSKILLS_DATA) || [];

    const evaluation = evaluatePokemon(currentPkm, labState.level, labState.nature, labState.subskills, labState.ingredients);
    const radarSVG = evaluation ? renderRadarChartSVG(evaluation.scores, 340, 310) : '';
    const displayName = isEN ? (currentPkm.name_en || currentPkm.name_cn) : currentPkm.name_cn;
    const typeName = window.I18N ? window.I18N.getTypeName(currentPkm.type) : currentPkm.type;
    const specName = window.I18N ? window.I18N.getSpecialtyName(currentPkm.specialty) : currentPkm.specialty;

    targetElement.innerHTML = `
      <div class="appraisal-lab-seamless-view">
        <!-- 1. 倉庫快速選取區 (User Box Linkage) -->
        <div class="lab-control-group lab-box-linkage-group">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <label for="lab-box-select" class="lab-control-label font-bold text-accent">
              ${isEN ? 'Select from My Box:' : '從我的倉庫選取：'}
            </label>
            ${labState.selectedBoxUid && labState.isCustomized ? `
              <button type="button" class="lab-box-reset-btn" onclick="window.AppraisalLab.resetToBoxOriginal()" title="${isEN ? 'Reset to Box Stats' : '重置為倉庫原始數值'}">
                ${isEN ? '🔄 Reset' : '🔄 重置原始數值'}
              </button>
            ` : ''}
          </div>

          <select id="lab-box-select" class="lab-select lab-box-select" onchange="window.AppraisalLab.onBoxItemSelect(this.value)">
            <option value="" ${!labState.selectedBoxUid ? 'selected' : ''}>${isEN ? '✨ Custom Simulation (Select Any Species)' : '✨ 自訂模擬 (自由挑選物種)'}</option>
            ${userBox.map(function (item) {
              const bPkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; });
              const pDisplayName = isEN ? (bPkm ? (bPkm.name_en || bPkm.name_cn) : item.name) : item.name;
              const nickText = item.nickname ? `${item.nickname} (${pDisplayName})` : pDisplayName;
              const natText = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;
              return '<option value="' + item.uid + '" ' + (labState.selectedBoxUid === item.uid ? 'selected' : '') + '>Lv.' + (item.level || 1) + ' ' + escapeHtml(nickText) + ' · ' + natText + '</option>';
            }).join('')}
          </select>

          ${userBox.length > 0 ? `
            <div class="lab-box-chips-scroll">
              <button type="button" class="lab-box-chip ${!labState.selectedBoxUid ? 'active' : ''}" onclick="window.AppraisalLab.onBoxItemSelect('')">
                <span class="lab-box-chip-name">${isEN ? '✨ Custom' : '✨ 自訂模擬'}</span>
              </button>
              ${userBox.map(function (item) {
                const bPkm = pokemons.find(function (p) { return p.id === item.pokemonId || p.name_cn === item.name; });
                const pDisplayName = isEN ? (bPkm ? (bPkm.name_en || bPkm.name_cn) : item.name) : item.name;
                const avatarUrl = (bPkm && (bPkm.icon_url || bPkm.icon)) || (bPkm && bPkm.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${bPkm.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
                const isSelected = labState.selectedBoxUid === item.uid;
                return `
                  <button type="button" class="lab-box-chip ${isSelected ? 'active' : ''}" onclick="window.AppraisalLab.onBoxItemSelect('${item.uid}')" title="${escapeHtml(item.nickname || pDisplayName)}">
                    <img src="${avatarUrl}" class="lab-box-chip-icon" alt="${escapeHtml(item.name)}" loading="lazy">
                    <span class="lab-box-chip-name">${escapeHtml(item.nickname || pDisplayName)}</span>
                    <span class="lab-box-chip-lv">Lv.${item.level || 1}</span>
                  </button>
                `;
              }).join('')}
            </div>
          ` : `
            <div class="lab-box-empty-hint">${isEN ? 'Tip: Register Pokémon in Box tab to evaluate your personal collection here!' : '提示：在【寶可夢倉庫】新增登錄寶可夢後，即可在此一鍵選取並評測你的專屬寶可夢！'}</div>
          `}
        </div>

        <div class="appraisal-lab-layout">
          <!-- 自訂配置控制器 -->
          <div class="appraisal-lab-controls">
            <!-- 寶可夢物種選擇 -->
            <div class="lab-control-group">
              <label for="lab-pkm-select" class="lab-control-label">${isEN ? 'Select Pokémon Species:' : '選擇寶可夢物種：'}</label>
              <select id="lab-pkm-select" class="lab-select" onchange="window.AppraisalLab.onPkmChange(this.value)">
                ${pokemons.map(function (p) {
                  const pName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
                  const pSpec = window.I18N ? window.I18N.getSpecialtyName(p.specialty) : p.specialty;
                  const pType = window.I18N ? window.I18N.getTypeName(p.type) : p.type;
                  return '<option value="' + p.id + '" ' + (p.id === labState.selectedPkmId ? 'selected' : '') + '>#' + p.formatted_no + ' ' + pName + ' (' + pSpec + ' / ' + pType + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 等級滑桿 (支援 1 ~ 100) -->
            <div class="lab-control-group">
              <label for="lab-level-slider" class="lab-control-label">
                ${isEN ? 'Training Level:' : '培育等級：'}<span class="font-bold text-accent">Lv. ${labState.level}</span>
              </label>
              <input type="range" id="lab-level-slider" min="1" max="100" value="${labState.level}" step="1" class="lab-slider" oninput="window.AppraisalLab.onLevelChange(this.value)">
            </div>

            <!-- 性格選擇 -->
            <div class="lab-control-group">
              <label for="lab-nature-select" class="lab-control-label">${isEN ? 'Nature Setting:' : '性格設定：'}</label>
              <select id="lab-nature-select" class="lab-select" onchange="window.AppraisalLab.onNatureChange(this.value)">
                ${natures.map(function (n) {
                  const nName = window.I18N ? window.I18N.getNatureName(n.name) : n.name;
                  return '<option value="' + n.name + '" ' + (n.name === labState.nature ? 'selected' : '') + '>' + nName + ' (' + n.buff + ' / ' + n.debuff + ')</option>';
                }).join('')}
              </select>
            </div>

            <!-- 5 個副技能槽位選擇 (Lv.10, 25, 50, 70, 80) -->
            <div class="lab-control-group">
              <label class="lab-control-label">${isEN ? 'Sub-Skill Setup (Lv.10, 25, 50, 70, 80):' : '副技能配置 (Lv.10, 25, 50, 70, 80)：'}</label>
              <div class="lab-subskills-picker">
                ${[10, 25, 50, 70, 80].map(function (lv, idx) {
                  return '<div class="lab-subskill-slot"><span class="slot-lv-label">Lv.' + lv + '</span><select class="lab-select-subskill" onchange="window.AppraisalLab.onSubskillChange(' + idx + ', this.value)"><option value="">' + (isEN ? '(None)' : '(無)') + '</option>' +
                    subskillPool.map(function (s) {
                      const sDisplayName = window.I18N ? window.I18N.getSubSkillName(s.name) : s.name;
                      return '<option value="' + s.name + '" ' + (labState.subskills[idx] === s.name ? 'selected' : '') + '>' + sDisplayName + '</option>';
                    }).join('') + '</select></div>';
                }).join('')}
              </div>
            </div>
          </div>

          <!-- 即時評測展示 (簡介 + 六邊形雷達圖 + 下方評語) -->
          <div class="appraisal-lab-preview">
            <div class="lab-preview-header">
              <div class="lab-preview-pokemon-info">
                <img src="${currentPkm.icon_url}" class="lab-preview-icon" alt="${displayName}">
                <div>
                  <div class="lab-preview-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="lab-preview-name">${displayName}</span>
                    ${labState.selectedBoxUid && labState.nickname ? `
                      <span class="lab-nickname-tag">${escapeHtml(labState.nickname)}</span>
                    ` : ''}
                    ${labState.selectedBoxUid ? (labState.isCustomized ? `
                      <span class="lab-sim-tag" style="background:rgba(234,179,8,0.18); color:#facc15; border:1px solid rgba(234,179,8,0.35); font-size:11px; padding:1px 6px; border-radius:4px; font-weight:600;">${isEN ? 'Simulating' : '模擬調校中'}</span>
                    ` : `
                      <span class="lab-inbox-tag" style="background:rgba(56,189,248,0.18); color:#38bdf8; border:1px solid rgba(56,189,248,0.35); font-size:11px; padding:1px 6px; border-radius:4px; font-weight:600;">${isEN ? 'In Box' : '倉庫實體'}</span>
                    `) : ''}
                  </div>
                  <div class="lab-preview-spec" style="display:flex;align-items:center;gap:4px;">
                    ${window.I18N ? window.I18N.getTypeIconSvg(currentPkm.type, 15) : ''} 
                    <span>${isEN ? `${typeName} · ${specName}` : `${currentPkm.type}屬性 · ${currentPkm.specialty}專長`} · Lv.${labState.level}</span>
                  </div>
                </div>
              </div>

              <div class="lab-preview-verdict" style="border-color: ${evaluation.gradeColor}; color: ${evaluation.gradeColor};">
                <span class="lab-grade-char">${evaluation.grade}</span>
                <span class="lab-grade-title">${evaluation.gradeTitle}</span>
              </div>
            </div>

            <!-- 六邊形能力圖 (標題與分數直接印在各頂點) -->
            <div class="lab-chart-container">
              ${radarSVG}
            </div>

            <!-- 下方的深度診斷評語 -->
            <div class="lab-pros-box">
              ${evaluation.pros.map(function (p) { return '<div class="lab-bullet-item">' + p + '</div>'; }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function onPkmChange(pkmId) {
    labState.selectedPkmId = pkmId;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onLevelChange(val) {
    labState.level = parseInt(val, 10) || 30;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onNatureChange(nature) {
    labState.nature = nature;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
    updateLabUI();
  }

  function onSubskillChange(idx, val) {
    labState.subskills[idx] = val;
    if (labState.selectedBoxUid) {
      labState.isCustomized = true;
    }
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
    loadBoxItem: loadBoxItem,
    onBoxItemSelect: onBoxItemSelect,
    resetToBoxOriginal: resetToBoxOriginal,
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