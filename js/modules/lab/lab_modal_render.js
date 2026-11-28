  /* ─── 診斷報告書彈窗模板渲染 (H5 & Desktop HTML Templates) ─── */
  function renderAppraisalMobileSheetHtml(ctx) {
    const { pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName, natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote, mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG, subskills, ribbonLevel } = ctx;
    return `
        <div class="box-modal-dialog mobile-box-sheet bottom-sheet mobile-modal-sheet" role="dialog" aria-modal="true">
          <div class="box-modal-header">
            <button type="button" class="box-modal-header-cancel" onclick="window.AppraisalLab.closeModal()">${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}</button>
            <!-- 雙軌綜合評級徽章 (居中置於標題原位) -->
            <div class="appraisal-dual-verdict-column">
              <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};">
                <span class="pokedex-verdict-track-lbl" style="font-size:9.5px;color:#94a3b8;line-height:1;">${window.I18N?.t?.('lab.t_track_current') ?? 'lab.t_track_current'}</span>
                <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:13px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:10px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
              </div>
              <div class="pokedex-header-verdict-badge potential-track">
                <span class="pokedex-verdict-track-lbl" style="font-size:8.5px;color:#64748b;line-height:1;">${window.I18N?.t?.('lab.t_track_max_lv') ?? 'lab.t_track_max_lv'}</span>
                <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                <span class="pokedex-header-score-text" style="font-size:9.5px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
              </div>
            </div>
            ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
              <button type="button" class="box-modal-header-confirm" onclick="window.AppraisalLab.openCurrentEditModal()">${window.I18N?.t?.('lab.t_edit') ?? 'lab.t_edit'}</button>
            ` : `<span style="width:36px;"></span>`}
          </div>

          <div class="box-modal-body appraisal-modal-sheet-body">
            <!-- 寶可夢核心建構資訊 (純淨無外框容器，依據 Single Frame 原則) -->
            <div class="appraisal-h5-header-summary">
              <div class="appraisal-h5-profile-row" style="display:flex;align-items:center;gap:10px;">
                <div class="appraisal-h5-avatar-wrap">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" width="88" height="88" decoding="async" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                <div class="appraisal-h5-info-col">
                  <!-- Row 1: 寶可夢名稱 + 稱號 + 樹果 + 專長 + 睡飽飽獎章 -->
                  <div class="appraisal-h5-name-row" style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                    <span class="appraisal-h5-pkm-name font-bold">${displayName}</span>
                    ${nickname ? `<span class="appraisal-h5-nick">(${escapeHtml(nickname)})</span>` : ''}
                    <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                      ${berry.icon ? `<img src="${berry.icon}" width="18" height="18" decoding="async" style="width:18px;height:18px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                    </span>
                    ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 18, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                    ${ribbonLevel > 0 ? `
                      <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:10.5px;font-weight:700;">
                        <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" width="14" height="14" decoding="async" style="width:14px;height:14px;object-fit:contain;" alt="Ribbon" />
                        <span>+${evaluation.ribbonBonus.carry} ${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${window.I18N?.t?.('lab.t_ribbon_spd', { pct: Math.round(evaluation.ribbonBonus.speedDiscount * 100) }) ?? 'lab.t_ribbon_spd'}` : ''}</span>
                      </div>
                    ` : ''}
                  </div>
                  <!-- Row 2: 主技能與三階段食材插槽整合成同一行 (位於頭像旁第二行) -->
                  <div class="appraisal-h5-subinfo-row" style="display:flex;align-items:center;gap:8px;margin-top:3px;flex-wrap:wrap;">
                    <div class="appraisal-mainskill-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <span class="appraisal-mainskill-name" style="font-size:12px;font-weight:700;color:var(--text-primary);">${escapeHtml(mainSkillName)}</span>
                      <span class="appraisal-mainskill-level" style="font-size:11px;font-weight:700;color:var(--accent-blue, #38bdf8);background:rgba(56,189,248,0.12);padding:1px 5px;border-radius:4px;border:1px solid rgba(56,189,248,0.25);">Lv.${skillLvl}</span>
                    </div>
                    <div class="appraisal-ing-parallel-row" style="display:inline-flex;align-items:center;gap:4px;padding:0;margin:0;">
                      <div class="appraisal-ing-chips-grid" style="display:inline-flex;gap:4px;align-items:center;">
                        ${ingChipsHtml}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 性格展示 (遊戲同款卡片) -->
              <div class="appraisal-config-section" style="margin-top:2px;display:flex;justify-content:center;width:100%;">
                <div class="appraisal-nature-game-card">
                  <div class="nature-pill-capsule">
                    <span class="nature-capsule-tag">${window.I18N?.t?.('lab.t_nature') ?? 'lab.t_nature'}</span>
                    <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                  </div>
                  ${natureEffectHtml}
                </div>
              </div>

              <!-- 基礎數值雙欄縱向列 (幫忙間隔/持有/食材率/技能率，佔位寬度契合副技能網格) -->
              <div class="appraisal-config-section appraisal-stats-section" style="margin-top:4px;width:100%;">
                <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_frequency') ?? 'lab.t_frequency'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-interval-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-carry-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                  <div class="pokedex-header-stat-col">
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_ing_rate') ?? 'lab.t_ing_rate'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                    <div class="pokedex-header-stat-item">
                      <span class="header-stat-k">${window.I18N?.t?.('lab.t_skill_rate') ?? 'lab.t_skill_rate'}</span>
                      <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate-m">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 副技能清單 (2+2+1 排列) -->
              <div class="appraisal-config-section" style="margin-top:6px;width:100%;">
                <div class="appraisal-subskills-grid">
                  ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                    const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                    const sName = rawName ? (window.I18N?.getSubSkillName?.(rawName) ?? rawName) : '--';
                    const tier = getSkillTier(rawName);
                    const isUnlocked = currentLv >= lv;
                    const lockClass = !isUnlocked ? 'subskill-locked' : '';
                    const titleText = rawName
                      ? (window.I18N?.t?.(isUnlocked ? 'lab.t_subskill_title_unlocked' : 'lab.t_subskill_title_locked', { name: sName, lv }) ?? 'lab.t_subskill_title_unlocked')
                      : (window.I18N?.t?.('lab.t_subskill_slot', { lv }) ?? 'lab.t_subskill_slot');
                    return `
                      <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                        <span class="subskill-name">${escapeHtml(sName)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- 食材與技能產能算法精算拆解 (純展示無調整組件) -->
            ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function') ? `
              <div class="appraisal-calc-mobile-wrap" style="margin-top:8px;width:100%;">
                <div class="pokedex-calc-formula-card">
                  ${window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)}
                </div>
              </div>
            ` : ''}

            <!-- 雷達圖與六維能量條 -->
            <div class="appraisal-chart-flex" style="margin-top:4px;">
              <div class="appraisal-radar-wrapper" style="width:100%;max-width:340px;height:255px;margin:0 auto;">
                ${renderRadarChartSVG(evaluation.scores, 340, 255)}
              </div>
            </div>

            <!-- 專長深度點評與優缺點 -->
            <div class="appraisal-analysis-card" style="margin-top:6px;">
              <h4 class="appraisal-section-heading">${window.I18N?.t?.('lab.t_synergy_heading_mobile') ?? 'lab.t_synergy_heading_mobile'}</h4>
              <div class="appraisal-pros-list">
                ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
              </div>
              ${evaluation.cons.length > 0 ? `
                <div class="appraisal-cons-list">
                  ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- 智能簡評欄 (嵌入式膠囊標籤) -->
            <div class="appraisal-summary-bar">
              <span class="appraisal-summary-label">${window.I18N?.t?.('lab.t_summary_label') ?? 'lab.t_summary_label'}</span>
              <span class="appraisal-summary-text">${summaryNote}</span>
            </div>
          </div>
        </div>
      `;
  }

  function renderAppraisalDesktopModalHtml(ctx) {
    const { pkmOrBoxItem, pkmData, currentLv, nickname, displayName, natDisplayName, natureEffectHtml, berry, berryName, specClass, specTypeLabel, summaryNote, mainSkillName, skillLvl, ingChipsHtml, formulaData, evaluation, radarSVG, subskills, ribbonLevel } = ctx;
    return `
        <div class="appraisal-modal-container">
          <!-- 頂部標題列 (高度加寬，垂直置中，整合雙軌評級與極簡關閉鈕) -->
          <div class="appraisal-modal-header">
            <div class="appraisal-header-title-group">
              <span class="appraisal-modal-badge">${window.I18N?.t?.('lab.t_modal_badge') ?? 'lab.t_modal_badge'}</span>
              <h2 class="appraisal-pokemon-title">
                ${nickname ? `<span class="appraisal-pokemon-nickname">${escapeHtml(nickname)}</span> <span class="appraisal-pokemon-base-name" style="font-size:0.85em;color:var(--text-secondary);font-weight:normal;">(${displayName})</span>` : displayName}
              </h2>
            </div>

            <div class="appraisal-header-actions">
              <!-- 雙軌綜合評級徽章 (對齊圖鑑彈窗風格，垂直置中，當前亮眼 + 滿級低調) -->
              <div class="appraisal-dual-verdict-column">
                <!-- 當前實力 (Current Level Rating) -->
                <div class="pokedex-header-verdict-badge current-track" style="border-color: ${(evaluation.current || evaluation).gradeColor};" title="${window.I18N?.t?.('lab.t_current_rating_title', { lv: currentLv }) ?? 'lab.t_current_rating_title'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:10px;color:#94a3b8;line-height:1;">${window.I18N?.t?.('lab.t_track_current') ?? 'lab.t_track_current'}</span>
                  <span class="verdict-grade pokedex-header-grade-text" style="color: ${(evaluation.current || evaluation).gradeColor};font-size:14px;font-weight:900;line-height:1;">${(evaluation.current || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:11px;"><span class="verdict-num font-bold">${(evaluation.current || evaluation).compositeScore}</span>/100</span>
                </div>
                <!-- 滿級潛力 (Max Potential Rating) -->
                <div class="pokedex-header-verdict-badge potential-track" title="${window.I18N?.t?.('lab.t_max_rating_title') ?? 'lab.t_max_rating_title'}">
                  <span class="pokedex-verdict-track-lbl" style="font-size:9px;color:#64748b;line-height:1;">${window.I18N?.t?.('lab.t_track_max_lv') ?? 'lab.t_track_max_lv'}</span>
                  <span class="verdict-potential-grade pokedex-header-grade-text" style="color:#94a3b8;font-size:11px;font-weight:700;line-height:1;">${(evaluation.potential || evaluation).grade}</span>
                  <span class="pokedex-header-score-text" style="font-size:10px;color:#94a3b8;"><span class="verdict-potential-num" style="font-weight:600;">${(evaluation.potential || evaluation).compositeScore}</span>/100</span>
                </div>
              </div>

              <!-- 編輯按鈕 (若來自倉庫) -->
              ${pkmOrBoxItem && (pkmOrBoxItem.rawItem || pkmOrBoxItem.uid) ? `
                <button type="button" class="appraisal-edit-btn" onclick="window.AppraisalLab.openCurrentEditModal()" title="${window.I18N?.t?.('lab.t_edit_stats_title') ?? 'lab.t_edit_stats_title'}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  <span>${window.I18N?.t?.('lab.t_edit_stats') ?? 'lab.t_edit_stats'}</span>
                </button>
              ` : ''}

              <!-- 極簡關閉按鈕 -->
              <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closeModal()" title="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}" aria-label="${window.I18N?.t?.('lab.t_close') ?? 'lab.t_close'}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- 報告核心主體 (精簡三欄排版，徹底去除多餘巢狀容器外框) -->
          <div class="appraisal-modal-body">
            <!-- 左欄：寶可夢基本卡片與配置 (純淨無外框容器) -->
            <div class="appraisal-left-col">
              <div class="appraisal-profile-card">
                <div class="appraisal-avatar-wrapper">
                  <img src="${pkmData.icon_url}" class="appraisal-avatar-img" width="88" height="88" decoding="async" alt="${displayName}">
                  <span class="appraisal-level-badge">Lv. ${currentLv}</span>
                </div>
                
                <!-- 樹果與專長 + 睡飽飽獎章 (與 H5 版本同排並行) -->
                <div class="appraisal-specialty-row" style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px;flex-wrap:wrap;">
                  <span class="appraisal-berry-tag" style="display:inline-flex;align-items:center;background:transparent;border:none;padding:0;" title="${escapeHtml(berryName)}">
                    ${berry.icon ? `<img src="${berry.icon}" width="22" height="22" decoding="async" style="width:22px;height:22px;object-fit:contain;vertical-align:middle;" alt="${escapeHtml(berryName)}">` : ''}
                  </span>
                  ${(window.I18N && window.I18N.getSpecialtyIconHtml) ? window.I18N.getSpecialtyIconHtml(pkmData.specialty, 22, 'appraisal-spec-icon-wrap') : `<span class="appraisal-spec-tag ${specClass}">${specTypeLabel}</span>`}
                  ${ribbonLevel > 0 ? `
                    <div class="appraisal-ribbon-badge" style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:6px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.25);color:#38bdf8;font-size:11.5px;font-weight:700;">
                      <img src="${(typeof window !== 'undefined' && window.__DATA_BASE_PATH__ ? window.__DATA_BASE_PATH__ : '')}assets/ribbons/ribbon_lv${ribbonLevel}.png" width="16" height="16" decoding="async" style="width:16px;height:16px;object-fit:contain;" alt="Ribbon" />
                      <span>+${evaluation.ribbonBonus.carry} ${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}${evaluation.ribbonBonus.speedDiscount > 0 ? ` · ${window.I18N?.t?.('lab.t_ribbon_spd', { pct: Math.round(evaluation.ribbonBonus.speedDiscount * 100) }) ?? 'lab.t_ribbon_spd'}` : ''}</span>
                    </div>
                  ` : ''}
                </div>

                <!-- 主技能名稱與等級 (Appraisal Main Skill) -->
                <div class="appraisal-mainskill-row">
                  <span class="appraisal-mainskill-label">${window.I18N?.t?.('lab.t_main_skill_colon') ?? 'lab.t_main_skill_colon'}</span>
                  <span class="appraisal-mainskill-name">${escapeHtml(mainSkillName)}</span>
                  <span class="appraisal-mainskill-level">Lv.${skillLvl}</span>
                </div>

                <!-- 食材三階插槽組合 (Appraisal Ingredients, 尚未開放插槽半透明) -->
                <div class="appraisal-ing-parallel-row">
                  <span class="appraisal-ing-row-label">${window.I18N?.t?.('lab.t_ingredients_colon') ?? 'lab.t_ingredients_colon'}</span>
                  <div class="appraisal-ing-chips-grid">
                    ${ingChipsHtml}
                  </div>
                </div>

                <!-- 遊戲同款性格展示 (膠囊外框 + 性格標籤 + 右側上下條目，純淨無外框容器) -->
                <div class="appraisal-config-section" style="margin-top:12px;display:flex;justify-content:center;">
                  <div class="appraisal-nature-game-card">
                    <div class="nature-pill-capsule">
                      <span class="nature-capsule-tag">${window.I18N?.t?.('lab.t_nature') ?? 'lab.t_nature'}</span>
                      <span class="nature-capsule-name">${escapeHtml(natDisplayName)}</span>
                    </div>
                    ${natureEffectHtml}
                  </div>
                </div>

                <!-- 副技能清單 (2+2+1 遊戲同款外框顏色與排列，無多餘標題) -->
                <div class="appraisal-config-section" style="margin-top:10px;">
                  <div class="appraisal-subskills-grid">
                    ${[10, 25, 50, 70, 80].map(function(lv, idx) {
                      const rawName = subskills && subskills[idx] ? (typeof subskills[idx] === 'string' ? subskills[idx] : subskills[idx].name) : '';
                      const sName = rawName ? (window.I18N?.getSubSkillName?.(rawName) ?? rawName) : '--';
                      const tier = getSkillTier(rawName);
                      const isUnlocked = currentLv >= lv;
                      const lockClass = !isUnlocked ? 'subskill-locked' : '';
                      const titleText = rawName
                        ? (window.I18N?.t?.(isUnlocked ? 'lab.t_subskill_title_unlocked' : 'lab.t_subskill_title_locked', { name: sName, lv }) ?? 'lab.t_subskill_title_unlocked')
                        : (window.I18N?.t?.('lab.t_subskill_slot', { lv }) ?? 'lab.t_subskill_slot');
                      return `
                        <div class="appraisal-subskill-pill subskill-${tier} ${lockClass}" title="${escapeHtml(titleText)}">
                          <span class="subskill-name">${escapeHtml(sName)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <!-- 基礎數值雙欄縱向列 (移動至副技能網格下方，緊湊整潔無溢出) -->
                <div class="appraisal-config-section appraisal-stats-section" style="margin-top:12px;width:100%;">
                  <div class="pokedex-header-stats-row pokedex-header-stats-dual appraisal-header-stats-dual">
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_frequency') ?? 'lab.t_frequency'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-interval">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIntervalValue === 'function') ? window.PokemonApp.renderPokedexIntervalValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_carry') ?? 'lab.t_carry'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-carry">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexCarryValue === 'function') ? window.PokemonApp.renderPokedexCarryValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                    <div class="pokedex-header-stat-col">
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_ing_rate') ?? 'lab.t_ing_rate'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-ingredient-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexIngRateValue === 'function') ? window.PokemonApp.renderPokedexIngRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                      <div class="pokedex-header-stat-item">
                        <span class="header-stat-k">${window.I18N?.t?.('lab.t_skill_rate') ?? 'lab.t_skill_rate'}</span>
                        <span class="header-stat-v font-bold" id="appraisal-stat-skill-rate">${(window.PokemonApp && typeof window.PokemonApp.renderPokedexSkillRateValue === 'function') ? window.PokemonApp.renderPokedexSkillRateValue(formulaData, pkmData) : '--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 中欄：食材與技能產能算法精算拆解 (純展示無調整組件，空間最大化單一整合外框) -->
            <div class="appraisal-calc-col">
              <div class="pokedex-calc-formula-card" id="appraisal-calc-formula-container">
                ${(formulaData && window.PokemonApp && typeof window.PokemonApp.renderPokedexFormulaBreakdownHTML === 'function')
                  ? window.PokemonApp.renderPokedexFormulaBreakdownHTML(formulaData, pkmData)
                  : ''}
              </div>
            </div>

          <!-- 右欄：雷達圖 + 智能簡評 + 專長深度點評 (純淨無外框容器) -->
          <div class="appraisal-right-col">
            <div class="appraisal-desktop-content-grid">
              <!-- 頂部：雷達圖區塊 (自適應置中，無冗餘標題) -->
              <div class="appraisal-radar-block">
                <div class="appraisal-radar-wrapper">
                  ${radarSVG}
                </div>
              </div>

              <!-- 中部：PR 智能簡評欄 (嵌入式膠囊標籤，不佔用內容展示空間) -->
              <div class="appraisal-summary-bar">
                <span class="appraisal-summary-label">${window.I18N?.t?.('lab.t_summary_label') ?? 'lab.t_summary_label'}</span>
                <span class="appraisal-summary-text">${summaryNote}</span>
              </div>

              <!-- 下方：專長深度點評與優缺點 (在智能簡評下方，同樣長度) -->
              <div class="appraisal-analysis-card">
                <h4 class="appraisal-section-heading">${window.I18N?.t?.('lab.t_synergy_heading') ?? 'lab.t_synergy_heading'}</h4>
                <div class="appraisal-pros-list">
                  ${evaluation.pros.map(function(p) { return `<div class="appraisal-pro-item">${p}</div>`; }).join('')}
                </div>
                ${evaluation.cons.length > 0 ? `
                  <div class="appraisal-cons-list">
                    ${evaluation.cons.map(function(c) { return `<div class="appraisal-con-item">${c}</div>`; }).join('')}
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
