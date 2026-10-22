  function getIslandSpawnsCoordinatorEls() {
    const scroller = document.getElementById('panel-wiki');
    const host = document.querySelector('#wiki-subpanel-islands .island-spawns-coordinator');
    const card = host && host.querySelector('.island-spawns-card');
    const wrap = card && card.querySelector('.wiki-table-wrapper');
    const subnav = document.querySelector('#panel-wiki .wiki-subnav-bar');
    return { scroller: scroller, host: host, card: card, wrap: wrap, subnav: subnav };
  }

  function islandSpawnsTabActive() {
    if (currentWikiSubTab !== 'islands') return false;
    const panel = document.getElementById('wiki-subpanel-islands');
    return !!(panel && panel.classList.contains('active') && panel.style.display !== 'none');
  }

  function releaseIslandSpawnsPin() {
    const els = getIslandSpawnsCoordinatorEls();
    if (els.card) {
      els.card.classList.remove('is-spawns-pinned');
      els.card.style.left = '';
      els.card.style.width = '';
      els.card.style.removeProperty('--spawns-pin-top');
      els.card.style.removeProperty('--spawns-pin-h');
    }
    if (els.host) els.host.style.height = '';
    if (els.wrap) els.wrap.scrollTop = 0;
  }

  function applyIslandSpawnsCoordinator() {
    if (!document.body || !document.body.classList.contains('mobile-h5-app')) return;
    if (!islandSpawnsTabActive()) {
      releaseIslandSpawnsPin();
      return;
    }
    const els = getIslandSpawnsCoordinatorEls();
    if (!els.scroller || !els.host || !els.card || !els.wrap) return;
    // 批次執行所有 Layout 讀取，避免讀寫交錯觸發 Forced Synchronous Layout
    const sRect = els.scroller.getBoundingClientRect();
    const pinTop = els.subnav ? els.subnav.getBoundingClientRect().bottom : sRect.top;
    const hostRect = els.host.getBoundingClientRect();
    const pinH = Math.max(160, Math.round(sRect.bottom - pinTop));
    const shouldPin = hostRect.top <= pinTop + 0.5;
    // 批次執行所有 DOM Style 寫入
    els.card.style.setProperty('--spawns-pin-h', pinH + 'px');
    if (!shouldPin) {
      els.card.classList.remove('is-spawns-pinned');
      els.card.style.left = '';
      els.card.style.width = '';
      els.card.style.removeProperty('--spawns-pin-top');
      els.host.style.height = '';
      els.wrap.scrollTop = 0;
      return;
    }
    if (!els.host.style.height) {
      els.host.style.height = pinH + 'px';
    }
    els.card.classList.add('is-spawns-pinned');
    els.card.style.setProperty('--spawns-pin-top', pinTop + 'px');
    els.card.style.left = hostRect.left + 'px';
    els.card.style.width = hostRect.width + 'px';
  }

  let _islandCoordRafId = 0;

  function scheduleIslandSpawnsCoordinator() {
    if (_islandCoordRafId) return;
    if (typeof requestAnimationFrame === 'function') {
      _islandCoordRafId = requestAnimationFrame(function () {
        _islandCoordRafId = 0;
        applyIslandSpawnsCoordinator();
      });
    } else {
      applyIslandSpawnsCoordinator();
    }
  }

  function consumeIslandSpawnsNestedDy(dy) {
    const els = getIslandSpawnsCoordinatorEls();
    if (!els.scroller || !els.wrap || !els.card || !dy) return;
    if (!els.card.classList.contains('is-spawns-pinned')) {
      els.scroller.scrollTop += dy;
      scheduleIslandSpawnsCoordinator();
      return;
    }
    if (els.wrap.scrollTop <= 0 && dy < 0) {
      els.scroller.scrollTop += dy;
      scheduleIslandSpawnsCoordinator();
    }
  }

  function onIslandSpawnsCardTouchStart(e) {
    if (e.touches && e.touches[0]) islandSpawnsTouchY = e.touches[0].clientY;
  }

  function onIslandSpawnsCardTouchMove(e) {
    const els = getIslandSpawnsCoordinatorEls();
    if (!els.card || !els.card.classList.contains('is-spawns-pinned')) return;
    if (!e.touches || !e.touches[0]) return;
    const y = e.touches[0].clientY;
    const dy = islandSpawnsTouchY - y;
    islandSpawnsTouchY = y;
    if (!dy) return;
    if (els.wrap && els.wrap.scrollTop <= 0 && dy < 0) {
      if (e.cancelable) e.preventDefault();
      consumeIslandSpawnsNestedDy(dy);
    }
  }

  function onIslandSpawnsCardWheel(e) {
    const els = getIslandSpawnsCoordinatorEls();
    if (!els.card || !els.card.classList.contains('is-spawns-pinned')) return;
    if (e.deltaY < 0 && els.wrap && els.wrap.scrollTop <= 0) {
      if (e.cancelable) e.preventDefault();
      consumeIslandSpawnsNestedDy(e.deltaY);
    }
  }

  function bindIslandSpawnsCoordinator() {
    if (!document.body || !document.body.classList.contains('mobile-h5-app')) return;
    const els = getIslandSpawnsCoordinatorEls();
    if (els.scroller && els.scroller.dataset.spawnsCoordinatorBound !== '1') {
      els.scroller.dataset.spawnsCoordinatorBound = '1';
      els.scroller.addEventListener('scroll', scheduleIslandSpawnsCoordinator, { passive: true });
      window.addEventListener('resize', scheduleIslandSpawnsCoordinator);
    }
    if (els.card && els.card.dataset.spawnsCoordinatorBound !== '1') {
      els.card.dataset.spawnsCoordinatorBound = '1';
      els.card.addEventListener('touchstart', onIslandSpawnsCardTouchStart, { passive: true });
      els.card.addEventListener('touchmove', onIslandSpawnsCardTouchMove, { passive: false });
      els.card.addEventListener('wheel', onIslandSpawnsCardWheel, { passive: false });
    }
    applyIslandSpawnsCoordinator();
  }

  function refreshIslandsSubpanel() {
    const panel = document.getElementById('wiki-subpanel-islands');
    const panelWiki = document.getElementById('panel-wiki');
    const live = (typeof document !== 'undefined' && document.querySelector)
      ? document.querySelector('.island-scene-layer')
      : null;
    if (live && panelWiki && live.parentElement !== panelWiki && typeof panelWiki.insertBefore === 'function') {
      panelWiki.insertBefore(live, panelWiki.firstChild);
    }
    if (panel) {
      panel.innerHTML = renderIslandsSubpanel();
    }
    placeIslandSceneLayer();
    try { scrollActiveIslandTabIntoView(); } catch (e) {}
    try { bindIslandSpawnsCoordinator(); } catch (e) {}
  }

  function renderIslandsSubpanel() {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const island = ISLANDS_DATA.find(i => i.id === currentIslandId) || ISLANDS_DATA[0];
    const isExpert = island.hasExpertMode && isExpertModeActive;

    const normalNavHtml = ISLANDS_DATA.map(isl => {
      const isActive = !isExpert && isl.id === currentIslandId;
      const islName = isEN ? isl.name_en : isl.name;
      return `
        <button type="button" class="island-tab-btn ${isActive ? 'active' : ''}" onclick="window.WikiDB.selectIsland('${isl.id}', false)" title="${islName}" aria-label="${islName}">
          <img src="${isl.image}" class="island-tab-thumb" alt="${islName}" loading="lazy">
          <span class="island-tab-indicator"></span>
        </button>
      `;
    }).join('');

    const exIslands = ISLANDS_DATA.filter(isl => isl.hasExpertMode);
    const exNavHtml = exIslands.map(isl => {
      const isActive = isExpert && isl.id === currentIslandId;
      const baseName = isEN ? isl.name_en : isl.name;
      const islName = baseName + ' EX';
      return `
        <button type="button" class="island-tab-btn island-tab-ex-item ${isActive ? 'active' : ''}" onclick="window.WikiDB.selectIsland('${isl.id}', true)" title="${islName}" aria-label="${islName}">
          <div class="island-tab-thumb-wrapper">
            <img src="${isl.image}" class="island-tab-thumb" alt="${islName}" loading="lazy">
            <span class="island-tab-ex-tag">EX</span>
          </div>
          <span class="island-tab-indicator"></span>
        </button>
      `;
    }).join('');

    let berriesHtml = '';
    if (island.berriesMode === 'random') {
      // 萌綠森林為每週隨機樹果, 依需求不展示亦不說明
      berriesHtml = '';
    } else {
      const activeFavBerries = (isExpert && island.expertMode && island.expertMode.favoriteBerries)
        ? island.expertMode.favoriteBerries
        : (island.favoriteBerries || []);
      const berryChips = activeFavBerries.map(bName => {
        const bInfo = BERRY_VALUES_DATA.find(b => b.name === bName);
        const displayName = isEN ? (window.I18N && window.I18N.t(bName) || bName) : bName;
        const iconSrc = bInfo ? bInfo.icon : '';
        const rawType = bInfo ? bInfo.type : '';
        const typeLabel = isEN ? (window.I18N && window.I18N.getTypeName ? window.I18N.getTypeName(rawType) : rawType) : rawType;
        return `
          <div class="island-berry-chip island-berry-icon-only" title="${displayName} (${typeLabel})">
            ${iconSrc ? `<img src="${iconSrc}" class="island-berry-icon" alt="${displayName}" loading="lazy">` : ''}
          </div>
        `;
      }).join('');
      berriesHtml = `
        <div class="island-berries-section">
          <span class="island-berries-label">${isEN ? 'Favored:' : '喜好樹果:'}</span>
          <div class="island-berries-list">${berryChips}</div>
        </div>
      `;
    }

    function renderIslandSleepCell(p, star, rankStr) {
      if (!rankStr || rankStr === '-') {
        return `<span class="rank-badge rank-dash" title="${isEN ? 'Unavailable' : '未出現'}">-</span>`;
      }
      const badgeHtml = formatSnorlaxRankBadge(rankStr, isEN);
      const style = getSleepStyleData(p.name, star);
      if (!style) {
        return `<div class="island-sleep-cell-wrap">${badgeHtml}</div>`;
      }

      const safePkmName = (p.name || '').replace(/'/g, "\\'");

      return `
        <div class="island-sleep-cell-wrap" 
             data-pkm="${safePkmName}" 
             data-star="${star}" 
             data-rank="${rankStr}"
             onmouseenter="window.WikiDB.showSleepStylePopover('${safePkmName}', ${star}, '${rankStr}', this, event)"
             onmouseleave="window.WikiDB.closeSleepStylePopover()"
             onclick="window.WikiDB.showSleepStylePopover('${safePkmName}', ${star}, '${rankStr}', this, event)">
          ${badgeHtml}
        </div>
      `;
    }

    const activeEnergyTiers = (isExpert && island.expertMode && island.expertMode.snorlaxEnergyTiers)
      ? island.expertMode.snorlaxEnergyTiers
      : island.snorlaxEnergyTiers;

    const energyRows = activeEnergyTiers.map(t => `
      <tr>
        <td class="font-bold" style="vertical-align:middle;">${formatSnorlaxRankBadge(t.rank)}</td>
        <td class="font-bold text-accent" style="vertical-align:middle;">${t.energy.toLocaleString()}</td>
      </tr>
    `).join('');

    function formatEnergyK(val) {
      if (!val || val === 0) return '0';
      if (val >= 1000000) {
        return '≥ ' + (val / 1000000).toFixed(val % 1000000 === 0 ? 0 : 1) + 'M';
      }
      if (val >= 10000) {
        return '≥ ' + (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k';
      }
      return '≥ ' + val.toLocaleString();
    }

    function getMinRankForDrowsyPower(powerStr, tiers) {
      if (!powerStr || !tiers || !tiers.length) return { rank: 'Basic 1', energy: 0 };
      const cleanNum = parseInt(String(powerStr).replace(/[^0-9]/g, ''), 10) || 0;
      if (cleanNum === 0) return { rank: 'Basic 1', energy: 0 };
      const minEnergyNeeded = Math.ceil(cleanNum / 100);

      const great1Obj = tiers.find(t => t.rank === 'Great 1') || { energy: 23385 };
      const ultra1Obj = tiers.find(t => t.rank === 'Ultra 1') || { energy: 79197 };
      const master1Obj = tiers.find(t => t.rank === 'Master 1') || { energy: 187832 };

      const g1 = great1Obj.energy;
      const u1 = ultra1Obj.energy;
      const m1 = master1Obj.energy;

      let rank = 'Basic 1';
      if (minEnergyNeeded < g1) {
        const ratio = minEnergyNeeded / g1;
        if (ratio < 0.133) rank = 'Basic 1';
        else if (ratio < 0.307) rank = 'Basic 2';
        else if (ratio < 0.500) rank = 'Basic 3';
        else if (ratio < 0.733) rank = 'Basic 4';
        else rank = 'Basic 5';
      } else if (minEnergyNeeded < u1) {
        const ratio = (minEnergyNeeded - g1) / (u1 - g1);
        if (ratio < 0.145) rank = 'Great 1';
        else if (ratio < 0.321) rank = 'Great 2';
        else if (ratio < 0.531) rank = 'Great 3';
        else if (ratio < 0.757) rank = 'Great 4';
        else rank = 'Great 5';
      } else if (minEnergyNeeded < m1) {
        const ratio = (minEnergyNeeded - u1) / (m1 - u1);
        if (ratio < 0.132) rank = 'Ultra 1';
        else if (ratio < 0.276) rank = 'Ultra 2';
        else if (ratio < 0.422) rank = 'Ultra 3';
        else if (ratio < 0.708) rank = 'Ultra 4';
        else rank = 'Ultra 5';
      } else {
        rank = 'Master 1';
        for (let i = 0; i < tiers.length; i++) {
          if (tiers[i].rank.startsWith('Master') && minEnergyNeeded >= tiers[i].energy) {
            rank = tiers[i].rank;
          }
        }
      }
      return { rank, energy: minEnergyNeeded };
    }

    const drowsyRows = island.drowsyPowerSpawns.map(d => {
      const match = getMinRankForDrowsyPower(d.power, activeEnergyTiers);
      const energyText = formatEnergyK(match.energy);
      return `
        <tr>
          <td class="font-bold text-success" style="vertical-align:middle;">${d.count} ${isEN ? 'Pokemon' : '隻'}</td>
          <td class="font-bold" style="vertical-align:middle;">${d.power}</td>
          <td style="vertical-align:middle; text-align:center; padding:5px 4px;">
            <div style="display:inline-flex; flex-direction:column; align-items:center; gap:2px;">
              ${formatSnorlaxRankBadge(match.rank)}
              <span style="font-size:10px; color:var(--text-secondary); line-height:1; font-weight:600;">${energyText}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const sleepTypeNameMap = {
      dozing: isEN ? 'Dozing' : '淺淺入夢',
      snoozing: isEN ? 'Snoozing' : '安然入睡',
      slumbering: isEN ? 'Slumbering' : '深深入眠'
    };

    let dozingList = (island.spawns && island.spawns.dozing) ? island.spawns.dozing.map(p => ({ ...p, sleepType: 'dozing' })) : [];
    let snoozingList = (island.spawns && island.spawns.snoozing) ? island.spawns.snoozing.map(p => ({ ...p, sleepType: 'snoozing' })) : [];
    let slumberingList = (island.spawns && island.spawns.slumbering) ? island.spawns.slumbering.map(p => ({ ...p, sleepType: 'slumbering' })) : [];

    if (isIslandLegendaryOnly) {
      dozingList = dozingList.filter(isLegendaryPokemon);
      snoozingList = snoozingList.filter(isLegendaryPokemon);
      slumberingList = slumberingList.filter(isLegendaryPokemon);
    }

    let spawnList = [];
    if (currentIslandSleepType === 'all') {
      spawnList = [...dozingList, ...snoozingList, ...slumberingList];
    } else if (currentIslandSleepType === 'dozing') {
      spawnList = [...dozingList];
    } else if (currentIslandSleepType === 'snoozing') {
      spawnList = [...snoozingList];
    } else if (currentIslandSleepType === 'slumbering') {
      spawnList = [...slumberingList];
    } else {
      spawnList = [...dozingList, ...snoozingList, ...slumberingList];
    }

    // 全島嶼睡姿排序處理 (依選中欄位進行 降冪 -> 升冪 -> 預設編號排序)
    if (islandSpawnsSortCol === 'pokemon') {
      spawnList.sort((a, b) => {
        const orderA = getIslandPokemonDexOrder(a);
        const orderB = getIslandPokemonDexOrder(b);
        if (islandSpawnsSortDir === 'desc') {
          if (orderB !== orderA) return orderB - orderA;
          return (b.name || '').localeCompare(a.name || '');
        } else {
          if (orderA !== orderB) return orderA - orderB;
          return (a.name || '').localeCompare(b.name || '');
        }
      });
    } else if (['s1', 's2', 's3', 's4'].includes(islandSpawnsSortCol)) {
      const col = islandSpawnsSortCol;
      spawnList.sort((a, b) => {
        const scoreA = getSnorlaxRankScore(a[col]);
        const scoreB = getSnorlaxRankScore(b[col]);

        if (scoreA >= 0 && scoreB < 0) return -1;
        if (scoreA < 0 && scoreB >= 0) return 1;

        if (scoreA >= 0 && scoreB >= 0 && scoreA !== scoreB) {
          if (islandSpawnsSortDir === 'desc') {
            return scoreB - scoreA;
          } else {
            return scoreA - scoreB;
          }
        }

        const orderDiff = getIslandPokemonDexOrder(a) - getIslandPokemonDexOrder(b);
        if (orderDiff !== 0) return orderDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
    } else {
      // 全島嶼睡姿一律整合並依全國圖鑑編號由小到大排序, 避免三個睡眠狀態分塊堆疊不直觀
      spawnList.sort((a, b) => {
        const orderDiff = getIslandPokemonDexOrder(a) - getIslandPokemonDexOrder(b);
        if (orderDiff !== 0) return orderDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    let spawnsRows = '';
    if (spawnList.length === 0) {
      const emptyMsg = isIslandLegendaryOnly
        ? (isEN ? 'No legendary Pokémon found for current selection' : '目前選取條件下無棲息之神獸寶可夢')
        : (isEN ? 'No Pokémon found' : '目前無符合條件之寶可夢');
      spawnsRows = `
        <tr>
          <td colspan="5" style="vertical-align:middle; text-align:center; padding:24px 12px; color:var(--text-secondary); font-size:13px;">
            ${emptyMsg}
          </td>
        </tr>
      `;
    } else {
      spawnsRows = spawnList.map(p => {
        const pName = isEN ? p.name_en : p.name;
        const pkmAvatar = getPokemonAvatarUrl(p, p.name_en);
        const pkmDex = getIslandPokemonDexCode(p);
        const dexNum = parseInt(pkmDex, 10);
        const dexPrefix = isNaN(dexNum) ? '' : `#${String(dexNum).padStart(3, '0')} `;
        const sleepTypeName = p.sleepType ? (sleepTypeNameMap[p.sleepType] || '') : '';
        const tooltipText = `${dexPrefix}${pName}${sleepTypeName ? ' (' + sleepTypeName + ')' : ''}`;
        return `
          <tr data-sleep-type="${p.sleepType || ''}">
            <td style="vertical-align:middle; text-align:center; padding:3px 4px;">
              <div class="island-pkm-item island-pkm-icon-only" title="${tooltipText}">
                <img src="${pkmAvatar}" class="island-pkm-avatar" alt="${pName}" title="${tooltipText}" loading="lazy" onerror="this.style.opacity='0.3';">
              </div>
            </td>
            <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${renderIslandSleepCell(p, 1, p.s1)}</td>
            <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${renderIslandSleepCell(p, 2, p.s2)}</td>
            <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${renderIslandSleepCell(p, 3, p.s3)}</td>
            <td style="vertical-align:middle; text-align:center; padding:3px 4px;">${renderIslandSleepCell(p, 4, p.s4)}</td>
          </tr>
        `;
      }).join('');
    }

    const totalCount = dozingList.length + snoozingList.length + slumberingList.length;
    const dozingCount = dozingList.length;
    const snoozingCount = snoozingList.length;
    const slumberingCount = slumberingList.length;

    const basePath = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) || '';
    const starImgSrc = `${basePath}assets/star.png`;

    function renderIslandSortTh(colKey, labelHtml, titleText, styleStr) {
      const isSorted = islandSpawnsSortCol === colKey;
      let arrowSvg = '';
      if (isSorted) {
        if (islandSpawnsSortDir === 'desc') {
          arrowSvg = `<svg class="island-sort-arrow-svg active" viewBox="0 0 10 6" width="10" height="6" fill="currentColor" aria-label="${isEN ? 'Descending' : '降冪'}"><path d="M0 0l5 6 5-6z"/></svg>`;
        } else if (islandSpawnsSortDir === 'asc') {
          arrowSvg = `<svg class="island-sort-arrow-svg active" viewBox="0 0 10 6" width="10" height="6" fill="currentColor" aria-label="${isEN ? 'Ascending' : '升冪'}"><path d="M0 6l5-6 5 6z"/></svg>`;
        }
      } else {
        arrowSvg = `<svg class="island-sort-arrow-svg inactive" viewBox="0 0 10 12" width="8" height="10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 4.5L5 1.5L8 4.5M2 7.5L5 10.5L8 7.5"/></svg>`;
      }

      if (colKey === 'pokemon') {
        return `<th class="island-sort-th ${isSorted ? 'active-sort' : ''}" style="${styleStr || 'text-align:center;'}" onclick="window.WikiDB.sortIslandSpawns('${colKey}')" title="${titleText}" data-col="${colKey}"><span class="island-sort-arrow-wrap" style="margin-right:2px; vertical-align:middle;">${arrowSvg}</span>${isEN ? 'Pokemon' : '寶可夢'}</th>`;
      }

      return `
        <th class="island-sort-th ${isSorted ? 'active-sort' : ''}" style="${styleStr || 'text-align:center;'}" onclick="window.WikiDB.sortIslandSpawns('${colKey}')" title="${titleText}" data-col="${colKey}">
          <div class="island-th-content">
            ${labelHtml}
            <span class="island-sort-arrow-wrap">${arrowSvg}</span>
          </div>
        </th>
      `;
    }

    const sceneSrc = islandSceneSrc(island);
    return `
      <div class="island-scene-layer" aria-hidden="true">
        <img class="island-scene-photo" src="${sceneSrc}" alt="">
        <div class="island-scene-fade"></div>
      </div>
      <div class="island-nav-strip">
        ${normalNavHtml}
        <div class="island-nav-divider" title="${isEN ? 'EX Expert Mode' : 'EX 專家模式'}"></div>
        ${exNavHtml}
      </div>

      <div class="island-overview-card">
        <div class="island-hero-banner">
          <div class="island-hero-body">
          <div class="island-hero-content">
            <div class="island-title-group">
              <h3 class="island-hero-title">${isEN ? (isExpert ? island.name_en + ' EX' : island.name_en) : (isExpert ? island.name + ' EX' : island.name)}</h3>
            </div>
            ${berriesHtml}
          </div>
          <div class="island-dual-grid">
        <div class="island-table-card">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${isEN ? 'Rank Energy' : '評級所需能量'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top:8px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="width:45%;">${isEN ? 'Rank' : '評級'}</th>
                  <th style="width:55%;">${isEN ? 'Energy' : '所需能量'}</th>
                </tr>
              </thead>
              <tbody>
                ${energyRows}
              </tbody>
            </table>
          </div>
        </div>

        <div class="island-table-card">
          <div class="wiki-card-header">
            <h3 class="wiki-card-title">${isEN ? 'Spawn Thresholds' : '出現數門檻'}</h3>
          </div>
          <div class="wiki-table-wrapper" style="margin-top:8px;">
            <table class="wiki-data-table">
              <thead>
                <tr>
                  <th style="width:28%;">${isEN ? 'Spawns' : '出現數'}</th>
                  <th style="width:40%;">${isEN ? 'Min Power' : '最低門檻'}</th>
                  <th style="width:32%; text-align:center;">${isEN ? '100pt Rank' : '分數100分'}</th>
                </tr>
              </thead>
              <tbody>
                ${drowsyRows}
              </tbody>
            </table>
          </div>
        </div>
          </div>
          </div>
        </div>
      </div>

      <div class="island-spawns-coordinator">
      <div class="island-spawns-card">
        <div class="wiki-card-header" style="flex-wrap:wrap; gap:10px 14px; justify-content:space-between; align-items:center;">
          <div class="island-spawns-title-wrap" style="display:inline-flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <h3 class="wiki-card-title" style="margin:0;">${isEN ? 'Habitats & Sleep Styles' : '棲息寶可夢與各星級睡姿解鎖門檻'}</h3>
            <label class="island-legendary-switch-label" title="${isEN ? 'Show Legendary Pokémon Only' : '僅展示神獸寶可夢'}">
              <input type="checkbox" id="island-legendary-switch" class="ladder-switch-input" ${isIslandLegendaryOnly ? 'checked' : ''} onchange="window.WikiDB.toggleIslandLegendaryOnly(this.checked)">
              <span class="ladder-switch-slider"></span>
              <span class="ladder-switch-text font-bold">${isEN ? 'Legendary' : '神獸寶可夢'}</span>
            </label>
          </div>
          <div class="island-sleep-filters">
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'all' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('all')">
              ${isEN ? 'All' : '全部'} <span class="island-sleep-count">${totalCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'dozing' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('dozing')">
              ${isEN ? 'Dozing' : '淺淺入夢'} <span class="island-sleep-count">${dozingCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'snoozing' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('snoozing')">
              ${isEN ? 'Snoozing' : '安然入睡'} <span class="island-sleep-count">${snoozingCount}</span>
            </button>
            <button type="button" class="island-sleep-btn ${currentIslandSleepType === 'slumbering' ? 'active' : ''}" onclick="window.WikiDB.filterIslandSleepType('slumbering')">
              ${isEN ? 'Slumbering' : '深深入眠'} <span class="island-sleep-count">${slumberingCount}</span>
            </button>
          </div>
        </div>
        <div class="wiki-table-wrapper" style="margin-top:8px;">
          <table class="wiki-data-table island-spawns-compact-table">
            <thead>
              <tr>
                ${renderIslandSortTh('pokemon', `<span>${isEN ? 'Pokemon' : '寶可夢'}</span>`, isEN ? 'Sort by Pokemon Dex No. (Desc -> Asc -> Default)' : '點選依寶可夢編號排序 (降冪 -> 升冪 -> 回復預設)', 'width:70px; text-align:center;')}
                ${renderIslandSortTh('s1', `<span class="sleep-star-label">1<img src="${starImgSrc}" class="sleep-style-star-icon" alt="Star" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://www.serebii.net/pokemonsleep/star.png';}"></span>`, isEN ? 'Sort by 1-Star Unlock Rank (Desc -> Asc -> Default)' : '點選依 1 星睡姿門檻排序 (降冪 -> 升冪 -> 回復預設)', 'text-align:center;')}
                ${renderIslandSortTh('s2', `<span class="sleep-star-label">2<img src="${starImgSrc}" class="sleep-style-star-icon" alt="Star" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://www.serebii.net/pokemonsleep/star.png';}"></span>`, isEN ? 'Sort by 2-Star Unlock Rank (Desc -> Asc -> Default)' : '點選依 2 星睡姿門檻排序 (降冪 -> 升冪 -> 回復預設)', 'text-align:center;')}
                ${renderIslandSortTh('s3', `<span class="sleep-star-label">3<img src="${starImgSrc}" class="sleep-style-star-icon" alt="Star" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://www.serebii.net/pokemonsleep/star.png';}"></span>`, isEN ? 'Sort by 3-Star Unlock Rank (Desc -> Asc -> Default)' : '點選依 3 星睡姿門檻排序 (降冪 -> 升冪 -> 回復預設)', 'text-align:center;')}
                ${renderIslandSortTh('s4', `<span class="sleep-star-label">4<img src="${starImgSrc}" class="sleep-style-star-icon" alt="Star" onerror="if(!this.dataset.fallback){this.dataset.fallback='1';this.src='https://www.serebii.net/pokemonsleep/star.png';}"></span>`, isEN ? 'Sort by 4-Star Unlock Rank (Desc -> Asc -> Default)' : '點選依 4 星睡姿門檻排序 (降冪 -> 升冪 -> 回復預設)', 'text-align:center;')}
              </tr>
            </thead>
            <tbody>
              ${spawnsRows}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    `;
  }

  // 監聽寶可夢資料庫載入與更新事件，確保非同步載入完成後島嶼分頁若為活動狀態能無縫重刷圖示
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('pokemon-data-updated', function() {
      try {
        if (typeof getCurrentSubTab === 'function' && getCurrentSubTab() === 'islands') {
          refreshIslandsSubpanel();
        }
      } catch (e) {}
    });
  }
