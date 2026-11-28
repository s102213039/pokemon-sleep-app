  // --- Wiki 主技能與副技能指南子面板渲染器 ---
  function _renderWikiSkillsBody() {
    return `
        <div class="wiki-control-bar">
          <div class="wiki-filter-pills">
            <span class="wiki-pill-label">${window.I18N?.t?.('wiki.ui_skill_cat_label') ?? '技能類型：'}</span>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'all' ? 'active' : ''}" data-skill-cat="all" onclick="window.WikiDB.filterSkills('all')">${window.I18N?.t?.('wiki.ui_all_skills') ?? '全部技能'} (${MAIN_SKILLS_DATA.length})</button>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'energy' ? 'active' : ''}" data-skill-cat="energy" onclick="window.WikiDB.filterSkills('energy')">${window.I18N?.t?.('wiki.ui_cat_energy') ?? '能量系'}</button>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'energy_heal' ? 'active' : ''}" data-skill-cat="energy_heal" onclick="window.WikiDB.filterSkills('energy_heal')">${window.I18N?.t?.('wiki.ui_cat_energy_heal_btn') ?? '活力系'}</button>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'ingredient' ? 'active' : ''}" data-skill-cat="ingredient" onclick="window.WikiDB.filterSkills('ingredient')">${window.I18N?.t?.('wiki.ui_cat_ingredient') ?? '食材與料理'}</button>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'special' ? 'active' : ''}" data-skill-cat="special" onclick="window.WikiDB.filterSkills('special')">${window.I18N?.t?.('wiki.ui_cat_special_btn') ?? '神獸與特殊專屬'}</button>
            <button type="button" class="wiki-pill-btn ${currentSkillsCategory === 'shards' ? 'active' : ''}" data-skill-cat="shards" onclick="window.WikiDB.filterSkills('shards')">${window.I18N?.t?.('wiki.ui_cat_shards_btn') ?? '夢之碎片'}</button>
          </div>
        </div>

        <div id="wiki-skills-grid" class="wiki-skills-grid">
          ${renderSkillsCards(MAIN_SKILLS_DATA)}
        </div>
    `;
  }

  function _renderWikiSubskillsBody(base) {
    return `
        <!-- 主技能發動機率矩陣速查表 -->
        <div class="wiki-card wiki-card-trigger-matrix">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${window.I18N?.t?.('wiki.ui_trigger_matrix_title') ?? '主技能發動機率矩陣'}</h3>
          </div>
          <div class="wiki-rule-banner">
            ${window.I18N?.t?.('wiki.ui_trigger_matrix_formula') ?? '<strong>公式</strong>: <code>(1 + 副技能提升%) × 性格倍率 = 最終發動總倍率</code>'}
          </div>

          <!-- 速查對照表 -->
          <div class="wiki-table-wrapper" style="margin-top: 10px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_subskills_col') ?? '副技能組合'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_nature_col') ?? '性格'}</th>
                  <th class="col-hide-mobile" style="text-align: center;">${window.I18N?.t?.('wiki.ui_formula_mult_col') ?? '乘算計算式'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_multiplier_col') ?? '總倍率'}</th>
                  <th class="col-hide-mobile" style="text-align: center;">${window.I18N?.t?.('wiki.ui_trigger_tier_col') ?? '發動強度評級'}</th>
                </tr>
              </thead>
              <tbody>
                ${TRIGGER_CHANCE_MATRIX.map(row => {
                  const gradeStr = row.grade || '';
                  const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                    : gradeStr.startsWith('SS') ? 'tier-ss'
                    : gradeStr.startsWith('S') ? 'tier-s'
                    : gradeStr.startsWith('A') ? 'tier-a'
                    : gradeStr.startsWith('B') ? 'tier-b'
                    : gradeStr.startsWith('C') ? 'tier-c'
                    : gradeStr.startsWith('D') ? 'tier-d'
                    : gradeStr.startsWith('E') ? 'tier-e'
                    : 'tier-baseline';
                  return `
                  <tr>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: nowrap; white-space: nowrap;">
                        ${row.subskills && row.subskills.length > 0 
                          ? row.subskills.map(s => {
                              const isM = s.name.includes('M');
                              const sName = window.I18N?.t?.(isM ? 'wiki.ui_trigger_m_short' : 'wiki.ui_trigger_s_short') ?? (isM ? '機率提升M' : '機率提升S');
                              return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                            }).join('') 
                          : `<span class="text-muted font-bold" style="font-size: 13px;">-</span>`}
                      </div>
                    </td>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      ${row.natureBadge === 'up' 
                        ? `<span class="matrix-rate-up">${window.I18N?.t?.('wiki.ui_nature_up') ?? '▲ 上升'}</span>` 
                        : (row.natureBadge === 'down' 
                          ? `<span class="matrix-rate-down">${window.I18N?.t?.('wiki.ui_nature_down') ?? '▼ 下降'}</span>` 
                          : `<span class="text-muted font-bold" style="font-size: 13px;" data-symbol="-">-</span>`)}
                    </td>
                    <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      <span class="text-accent font-bold" style="font-size: 13px;">x${row.multiplier.toFixed(3)}</span>
                    </td>
                    <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${window.I18N?.field?.(row, 'grade') ?? row.grade}</span></td>
                  </tr>
                `;}).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 幫忙速度極限與計算機制指南 (Helping Speed Limits & Mechanics) -->
        <div class="wiki-card wiki-card-speed-guide" style="margin-top: 20px;">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${window.I18N?.t?.('wiki.ui_speed_guide_title') ?? '幫忙速度極限與計算機制指南'}</h3>
          </div>
          
          <!-- 幫忙速度核心機制重點說明 (無外框直接展示, 文字極簡化) -->
          <div class="wiki-speed-summary-points">
            <div class="summary-point-line">
              <span class="point-prefix">1.</span>
              <span class="point-title">${window.I18N?.t?.('wiki.ui_speed_pt1_title') ?? '副技能上限35%:'}</span>
              <span class="point-desc">${window.I18N?.t?.('wiki.ui_speed_pt1_desc') ?? '副技能合計縮短上限為35%,溢出無效.'}</span>
            </div>
            <div class="summary-point-line">
              <span class="point-prefix">2.</span>
              <span class="point-title">${window.I18N?.t?.('wiki.ui_speed_pt2_title') ?? '性格獨立乘區:'}</span>
              <span class="point-desc">${window.I18N?.t?.('wiki.ui_speed_pt2_desc') ?? '直接與副技能相乘,不受35%上限約束.'}</span>
            </div>
            <div class="summary-point-line">
              <span class="point-prefix">3.</span>
              <span class="point-title">${window.I18N?.t?.('wiki.ui_speed_pt3_title') ?? '產能換算:'}</span>
              <span class="point-desc">${window.I18N?.t?.('wiki.ui_speed_pt3_desc') ?? '產能為時間倒數,間隔58.5%等同產能提升70.94%.'}</span>
            </div>
          </div>

          <!-- 速查對照表 (Quick-Lookup Table) -->
          <div class="wiki-table-wrapper" style="margin-top: 10px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_subskills_col') ?? '副技能組合'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_nature_col') ?? '性格'}</th>
                  <th class="col-hide-mobile" style="text-align: center;">${window.I18N?.t?.('wiki.ui_formula_col') ?? '計算式'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_interval_col') ?? '幫忙間隔'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_boost_col') ?? '產能提升'}</th>
                  <th class="col-hide-mobile" style="text-align: center;">${window.I18N?.t?.('wiki.ui_speed_tier_col') ?? '強度評級'}</th>
                </tr>
              </thead>
              <tbody>
                ${HELPING_SPEED_MATRIX.map(row => {
                  const gradeStr = row.grade || '';
                  const tierClass = gradeStr.startsWith('SSS') ? 'tier-sss'
                    : gradeStr.startsWith('SS') ? 'tier-ss'
                    : gradeStr.startsWith('S') ? 'tier-s'
                    : gradeStr.startsWith('A') ? 'tier-a'
                    : gradeStr.startsWith('B') ? 'tier-b'
                    : gradeStr.startsWith('C') ? 'tier-c'
                    : gradeStr.startsWith('D') ? 'tier-d'
                    : 'tier-baseline';
                  const isBoostPositive = row.outputMultiplier >= 1.0;
                  return `
                  <tr>
                    <td style="vertical-align: middle; text-align: center;">
                      <div style="display: inline-flex; align-items: center; justify-content: center; gap: 3px; flex-wrap: wrap;">
                        ${row.subskills && row.subskills.length > 0 
                          ? row.subskills.map(s => {
                              const sName = window.I18N?.field?.(s, 'name') ?? s.name;
                              return `<span class="wiki-skill-badge skill-badge-${s.color}" style="white-space: nowrap;">${sName}</span>`;
                            }).join('') 
                          : `<span class="text-muted font-bold" style="font-size: 13px;">-</span>`}
                      </div>
                    </td>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      ${row.natureBadge === 'up' 
                        ? `<span class="matrix-rate-up">${window.I18N?.t?.('wiki.ui_nature_up') ?? '▲ 上升'}</span>` 
                        : (row.natureBadge === 'down' 
                          ? `<span class="matrix-rate-down">${window.I18N?.t?.('wiki.ui_nature_down') ?? '▼ 下降'}</span>` 
                          : `<span class="text-muted font-bold" style="font-size: 13px;" data-symbol="-">-</span>`)}
                    </td>
                    <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><code class="matrix-calc-code">${row.calc}</code></td>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      <span class="font-bold text-accent" style="font-size: 13.5px;">${row.intervalRatio}x</span>
                    </td>
                    <td style="vertical-align: middle; text-align: center; white-space: nowrap;">
                      <span class="${isBoostPositive ? 'matrix-pct-up' : 'matrix-pct-down'} font-bold" style="font-size: 13px;">${row.outputBoostDisplay}</span>
                    </td>
                    <td class="col-hide-mobile" style="vertical-align: middle; text-align: center;"><span class="wiki-tier-badge ${tierClass}">${window.I18N?.field?.(row, 'grade') ?? row.grade}</span></td>
                  </tr>
                `;}).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 睡飽飽獎章加成指南 (Good-Night Ribbon Quick Guide) -->
        <div class="wiki-card wiki-card-ribbon-guide" style="margin-top: 16px;">
          <div class="wiki-card-header" style="margin-bottom: 8px;">
            <h3 class="wiki-card-title">${window.I18N?.t?.('wiki.ui_ribbon_guide_title') ?? '睡飽飽獎章加成指南'}</h3>
          </div>

          <div class="ribbon-compact-tiers">
            <div class="ribbon-compact-chip chip-bronze">
              <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                <img src="${base}assets/ribbons/ribbon_lv1.png" width="18" height="18" loading="lazy" decoding="async" style="width:18px;height:18px;object-fit:contain;" alt="" />
                200h
              </span>
              <span class="chip-effect-text">${window.I18N?.t?.('wiki.ui_ribbon_200h') ?? '+1 持有上限'}</span>
            </div>
            <div class="ribbon-compact-chip chip-silver">
              <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                <img src="${base}assets/ribbons/ribbon_lv2.png" width="18" height="18" loading="lazy" decoding="async" style="width:18px;height:18px;object-fit:contain;" alt="" />
                500h
              </span>
              <span class="chip-effect-text">${window.I18N?.t?.('wiki.ui_ribbon_500h') ?? '+2 持有, 幫速 -5% / -11%'}</span>
            </div>
            <div class="ribbon-compact-chip chip-gold">
              <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                <img src="${base}assets/ribbons/ribbon_lv3.png" width="18" height="18" loading="lazy" decoding="async" style="width:18px;height:18px;object-fit:contain;" alt="" />
                1,000h
              </span>
              <span class="chip-effect-text">${window.I18N?.t?.('wiki.ui_ribbon_1000h') ?? '+3 持有上限'}</span>
            </div>
            <div class="ribbon-compact-chip chip-platinum">
              <span class="chip-tier-tag" style="display:flex;align-items:center;gap:4px;">
                <img src="${base}assets/ribbons/ribbon_lv4.png" width="18" height="18" loading="lazy" decoding="async" style="width:18px;height:18px;object-fit:contain;" alt="" />
                2,000h
              </span>
              <span class="chip-effect-text">${window.I18N?.t?.('wiki.ui_ribbon_2000h') ?? '+2 持有, 幫速 -12% / -25%'}</span>
            </div>
          </div>

          <div class="ribbon-compact-notes">
            <div class="compact-note-line">
              <span class="compact-note-label">${window.I18N?.t?.('wiki.ui_ribbon_core_lbl') ?? '核心規則:'}</span>
              <span class="compact-note-text">${window.I18N?.t?.('wiki.ui_ribbon_core_txt') ?? '僅未完全進化寶可夢享有幫速縮短(最高 -25%), 與性格/副技能獨立相乘, 不受 35% 上限限制.'}</span>
            </div>
            <div class="compact-note-line">
              <span class="compact-note-label">${window.I18N?.t?.('wiki.ui_ribbon_case_lbl') ?? '經典案例:'}</span>
              <span class="compact-note-text">${window.I18N?.t?.('wiki.ui_ribbon_case_txt') ?? '吉利蛋 vs 幸福蛋: 吉利蛋(能再進化 1 次)滿 2000h 幫速縮短 12% 至 <strong>2904 秒</strong>, 反超幸福蛋(3100 秒).'}</span>
            </div>
          </div>
        </div>

        <!-- 副技能完整階級與數值說明表格 -->
        <div class="wiki-card wiki-card-subskills-overview" style="margin-top: 20px;">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${window.I18N?.t?.('wiki.ui_subskills_overview') ?? '副技能階級與數值總覽'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top: 10px;">
            <table class="wiki-data-table wiki-subskills-table">
              <thead>
                <tr>
                  <th class="col-subskills-tags" style="text-align: center;">${window.I18N?.t?.('wiki.ui_skills_col') ?? '技能標籤'}</th>
                  <th class="col-subskills-effect">${window.I18N?.t?.('wiki.ui_effect_col') ?? '詳細效果說明'}</th>
                </tr>
              </thead>
              <tbody>
                ${SUB_SKILLS_DATA.map(row => `
                  <tr>
                    <td class="col-subskills-tags" style="vertical-align: middle; text-align: center;">
                      <div class="wiki-subskill-tags-col">
                        ${row.skills.map(s => renderSkillBadge(s)).join('')}
                      </div>
                    </td>
                    <td class="col-subskills-effect text-secondary" style="vertical-align: middle;">${window.I18N?.field?.(row, 'desc') ?? row.desc}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 性格五維加成倍率表 -->
        <div class="wiki-card wiki-card-natures-table" style="margin-top: 20px;">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${window.I18N?.t?.('wiki.ui_nature_modifiers') ?? '性格五維屬性倍率表'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top: 10px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_stat_col') ?? '屬性項目'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_nat_up_col') ?? '▲ 性格'}</th>
                  <th style="text-align: center;">${window.I18N?.t?.('wiki.ui_nat_down_col') ?? '▼ 性格'}</th>
                </tr>
              </thead>
              <tbody>
                ${NATURES_EFFECT_DATA.map(row => `
                  <tr>
                    <td class="font-bold text-accent" style="vertical-align: middle; text-align: center; white-space: nowrap;">${window.I18N?.field?.(row, 'stat') ?? row.stat}</td>
                    <td class="text-success font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${window.I18N?.field?.(row, 'up') ?? row.up}</td>
                    <td class="text-danger font-bold" style="vertical-align: middle; text-align: center; white-space: nowrap;">${window.I18N?.field?.(row, 'down') ?? row.down}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
    `;
  }
