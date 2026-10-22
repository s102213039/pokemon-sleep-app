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
