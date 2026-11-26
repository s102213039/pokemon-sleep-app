  // --- 道具百科模組 (Items Encyclopedia) ---

  const ITEM_CATEGORIES = [
    { key: 'all', labelKey: 'wiki.ui_item_cat_all', labelFb: '全部道具' },
    { key: 'evolution', labelKey: 'wiki.ui_item_cat_evolution', labelFb: '進化道具' },
    { key: 'training', labelKey: 'wiki.ui_item_cat_training', labelFb: '培育與種子' },
    { key: 'biscuit', labelKey: 'wiki.ui_item_cat_biscuit', labelFb: '捕捉沙布蕾' },
    { key: 'supply', labelKey: 'wiki.ui_item_cat_supply', labelFb: '探索與補給' }
  ];

  const ITEM_POKEMON_FAMILY_MAP = {
    'thunder_stone': ['25', '26', '133', '135', '82', '462', '737', '738'],
    'fire_stone': ['133', '136', '37', '38', '58', '59'],
    'water_stone': ['133', '134'],
    'leaf_stone': ['70', '71', '133', '470'],
    'moon_stone': ['35', '36', '39', '40', '517', '518'],
    'sun_stone': ['546', '547'],
    'ice_stone': ['37', '38', '133', '471', '974', '975', '7006', '7007'],
    'shiny_stone': ['176', '468'],
    'dusk_stone': ['200', '429', '198', '430'],
    'dawn_stone': ['281', '475'],
    'oval_stone': ['440', '113'],
    'linking_cord': ['75', '76', '93', '94', '95', '208', '79', '199', '710', '711'],
    'metal_coat': ['95', '208'],
    'kings_rock': ['79', '199'],
    'razor_claw': ['215', '461']
  };

  function getMasterItemsData() {
    let list = [];
    if (typeof window !== 'undefined' && Array.isArray(window.ITEMS_DATA)) {
      list = window.ITEMS_DATA;
    } else if (typeof ITEMS_DATA !== 'undefined' && Array.isArray(ITEMS_DATA)) {
      list = ITEMS_DATA;
    }
    return list.filter(item => item && !String(item.category || '').includes('incense') && !String(item.id || '').includes('incense'));
  }

  function escapeRegExp(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getAssociatedPokemonStrings(item) {
    const allPkm = (typeof window !== 'undefined' && Array.isArray(window.allPokemons))
      ? window.allPokemons
      : [];
    if (item._assocPkmStr !== undefined && item._assocPkmLen === allPkm.length) {
      return item._assocPkmStr;
    }
    const ids = new Set([
      ...(item.pokemon_ids || []),
      ...(ITEM_POKEMON_FAMILY_MAP[item.id] || [])
    ]);
    const pkmStrings = [];
    const idx = _getWikiPkmIndex(allPkm);

    ids.forEach(id => {
      const idStr = String(id);
      pkmStrings.push(idStr);
      const p = idx['id:' + idStr] || idx['no:' + idStr.padStart(3, '0')];
      if (p) {
        if (p.name_cn) pkmStrings.push(p.name_cn.toLowerCase());
        if (p.name_en) pkmStrings.push(p.name_en.toLowerCase());
        if (p.name_jp) pkmStrings.push(p.name_jp.toLowerCase());
      }
    });

    const joined = pkmStrings.join(' ');
    item._assocPkmStr = joined;
    item._assocPkmLen = allPkm.length;
    return joined;
  }

  function itemMatchesToken(item, token) {
    const t = token.toLowerCase();
    if (!t) return true;

    // Item names
    const nameTW = (item.name && item.name['zh-TW'] || '').toLowerCase();
    const nameCN = (item.name && item.name['zh-CN'] || '').toLowerCase();
    const nameEN = (item.name && item.name['en-US'] || '').toLowerCase();
    if (nameTW.includes(t) || nameCN.includes(t) || nameEN.includes(t)) return true;

    // Item description & effects
    const descTW = (item.description && item.description['zh-TW'] || '').toLowerCase();
    const descCN = (item.description && item.description['zh-CN'] || '').toLowerCase();
    const descEN = (item.description && item.description['en-US'] || '').toLowerCase();
    const effTW = (item.effects && item.effects['zh-TW'] || '').toLowerCase();
    const effCN = (item.effects && item.effects['zh-CN'] || '').toLowerCase();
    const effEN = (item.effects && item.effects['en-US'] || '').toLowerCase();
    if (descTW.includes(t) || descCN.includes(t) || descEN.includes(t)) return true;
    if (effTW.includes(t) || effCN.includes(t) || effEN.includes(t)) return true;

    // Acquisition sources
    const acqTW = ((item.acquisition && item.acquisition['zh-TW']) || []).join(' ').toLowerCase();
    const acqCN = ((item.acquisition && item.acquisition['zh-CN']) || []).join(' ').toLowerCase();
    const acqEN = ((item.acquisition && item.acquisition['en-US']) || []).join(' ').toLowerCase();
    if (acqTW.includes(t) || acqCN.includes(t) || acqEN.includes(t)) return true;

    // Associated Pokemon
    const pkmText = getAssociatedPokemonStrings(item);
    if (pkmText.includes(t)) return true;

    return false;
  }

  function filterItems(category, query) {
    const cat = category || currentItemsCategory || 'all';
    const q = (typeof query === 'string' ? query : currentItemsSearchQuery || '').trim();
    const rawList = getMasterItemsData();

    const tokens = q ? q.toLowerCase().split(/\s+/).filter(Boolean) : [];

    return rawList.filter(item => {
      // 1. Category filter
      if (cat !== 'all' && item.category !== cat) return false;

      // 2. Multilingual search
      if (tokens.length === 0) return true;
      return tokens.every(tok => itemMatchesToken(item, tok));
    });
  }

  function searchItems(query) {
    return filterItems(currentItemsCategory, query);
  }

  function filterItemsByCategory(category) {
    if (!category || !VALID_ITEMS_CATEGORIES.includes(category)) category = 'all';
    currentItemsCategory = category;
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) storage.setItem(STORAGE_KEY_ITEMS_CATEGORY, category);
    } catch (e) {}

    const pillBtns = document.querySelectorAll('.wiki-items-category-pills .wiki-pill-btn');
    pillBtns.forEach(btn => {
      const bCat = btn.getAttribute('data-category');
      btn.classList.toggle('active', bCat === currentItemsCategory);
    });

    renderFilteredItemsGrid();
  }

  function handleItemsSearch(query) {
    currentItemsSearchQuery = (query || '').trim();
    const input = document.getElementById('wiki-items-search-input');
    const clearBtn = document.getElementById('wiki-items-search-clear');
    const searchBox = document.querySelector('.wiki-items-search-box');

    if (input) {
      if (currentItemsSearchQuery) {
        input.classList.add('has-value');
        if (searchBox) searchBox.classList.add('has-query');
      } else {
        input.classList.remove('has-value');
        if (searchBox) searchBox.classList.remove('has-query');
      }
    }

    if (clearBtn) {
      clearBtn.style.display = currentItemsSearchQuery ? 'flex' : 'none';
    }

    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      try { window.updateSearchInputHighlight(input, clearBtn); } catch (e) {}
    }

    renderFilteredItemsGrid();
  }

  function clearItemsSearch() {
    currentItemsSearchQuery = '';
    const input = document.getElementById('wiki-items-search-input');
    const clearBtn = document.getElementById('wiki-items-search-clear');
    const searchBox = document.querySelector('.wiki-items-search-box');
    if (input) {
      input.value = '';
      input.classList.remove('has-value');
      input.focus();
    }
    if (searchBox) searchBox.classList.remove('has-query');
    if (clearBtn) clearBtn.style.display = 'none';
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      try { window.updateSearchInputHighlight(input, clearBtn); } catch (e) {}
    }
    renderFilteredItemsGrid();
  }

  function resetItemsFilters() {
    currentItemsCategory = 'all';
    currentItemsSearchQuery = '';
    const input = document.getElementById('wiki-items-search-input');
    const clearBtn = document.getElementById('wiki-items-search-clear');
    const searchBox = document.querySelector('.wiki-items-search-box');
    if (input) {
      input.value = '';
      input.classList.remove('has-value');
    }
    if (searchBox) searchBox.classList.remove('has-query');
    if (clearBtn) clearBtn.style.display = 'none';
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) storage.setItem(STORAGE_KEY_ITEMS_CATEGORY, 'all');
    } catch (e) {}

    const pillBtns = document.querySelectorAll('.wiki-items-category-pills .wiki-pill-btn');
    pillBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-category') === 'all');
    });

    renderFilteredItemsGrid();
  }

  const ITEM_CATEGORY_BADGE_MAP = {
    evolution: ['wiki.ui_item_cat_evolution', '進化道具'],
    training: ['wiki.ui_item_cat_training', '培育與種子'],
    biscuit: ['wiki.ui_item_cat_biscuit', '捕捉沙布蕾'],
    supply: ['wiki.ui_item_cat_supply', '探索與補給']
  };

  function getItemCategoryBadgeName(category) {
    const entry = ITEM_CATEGORY_BADGE_MAP[category];
    if (entry) return window.I18N?.t?.(entry[0]) ?? entry[1];
    return window.I18N?.t?.('wiki.ui_item_cat_default') ?? '道具';
  }

  const ITEM_HIGHLIGHT_STATS = {
    poke_biscuit: { val: '+1', unitKey: 'wiki.ui_unit_pt', unitFb: '格', lblKey: 'wiki.ui_lbl_friendship', lblFb: '友好度', type: 'biscuit' },
    great_biscuit: { val: '+3', unitKey: 'wiki.ui_unit_pt', unitFb: '格', lblKey: 'wiki.ui_lbl_friendship', lblFb: '友好度', type: 'biscuit' },
    ultra_biscuit: { val: '+5', unitKey: 'wiki.ui_unit_pt', unitFb: '格', lblKey: 'wiki.ui_lbl_friendship', lblFb: '友好度', type: 'biscuit' },
    master_biscuit: { val: 'MAX', unit: '', lblKey: 'wiki.ui_lbl_max_catch', lblFb: '友好度滿格', type: 'biscuit-max' },
    main_skill_seed: { val: '+1', unit: 'Lv', lblKey: 'wiki.ui_lbl_main_skill', lblFb: '主技能提升', type: 'seed' },
    sub_skill_seed: { val: '+1', unitKey: 'wiki.ui_unit_tier', unitFb: '階', lblKey: 'wiki.ui_lbl_sub_skill', lblFb: '副技能升級', type: 'seed' },
    cleanse_mint: { val: '1.00x', unit: '', lblKey: 'wiki.ui_lbl_neutral_nature', lblFb: '性格中性化', type: 'mint' },
    handy_candy_s: { val: '+3', unitKey: 'wiki.ui_unit_candies', unitFb: '顆', lblKey: 'wiki.ui_lbl_uni_candy', lblFb: '萬能糖果', type: 'candy' },
    handy_candy_m: { val: '+20', unitKey: 'wiki.ui_unit_candies', unitFb: '顆', lblKey: 'wiki.ui_lbl_uni_candy', lblFb: '萬能糖果', type: 'candy' },
    handy_candy_l: { val: '+100', unitKey: 'wiki.ui_unit_candies', unitFb: '顆', lblKey: 'wiki.ui_lbl_uni_candy', lblFb: '萬能糖果', type: 'candy' },
    dream_cluster_s: { val: 'S', unitKey: 'wiki.ui_unit_cluster', unitFb: '塊', lblKey: 'wiki.ui_lbl_dream_shards', lblFb: '夢之碎片', type: 'shard' },
    dream_cluster_m: { val: 'M', unitKey: 'wiki.ui_unit_cluster', unitFb: '塊', lblKey: 'wiki.ui_lbl_dream_shards', lblFb: '夢之碎片', type: 'shard' },
    dream_cluster_l: { val: 'L', unitKey: 'wiki.ui_unit_cluster', unitFb: '塊', lblKey: 'wiki.ui_lbl_dream_shards', lblFb: '夢之碎片', type: 'shard' },
    energy_pillow: { val: '+50', unitKey: 'wiki.ui_unit_energy_lbl', unitFb: '活力', lblKey: 'wiki.ui_lbl_energy_restore', lblFb: '活力恢復', type: 'energy' },
    helper_whistle: { val: '3 hrs', unit: '', lblKey: 'wiki.ui_lbl_help_yield', lblFb: '幫手即時產出', type: 'whistle' },
    good_camp_ticket: { val: '+50%', unit: 'Pot', lblKey: 'wiki.ui_lbl_pot_speed', lblFb: '鍋容量與幫手速度', type: 'camp' },
    ingredient_ticket_s: { val: '+10', unitKey: 'wiki.ui_unit_ings', unitFb: '個', lblKey: 'wiki.ui_lbl_random_ings', lblFb: '隨機食材', type: 'ticket' },
    ingredient_ticket_m: { val: '+30', unitKey: 'wiki.ui_unit_ings', unitFb: '個', lblKey: 'wiki.ui_lbl_random_ings', lblFb: '隨機食材', type: 'ticket' },
    e_zzz_travel_ticket: { valKey: 'wiki.ui_val_move', valFb: '轉移', unit: '', lblKey: 'wiki.ui_lbl_relocate', lblFb: '重新選點', type: 'ticket' }
  };

  function getItemHighlightStat(item) {
    if (!item) return null;
    const spec = ITEM_HIGHLIGHT_STATS[item.id];
    if (!spec) return null;
    return {
      val: spec.valKey ? (window.I18N?.t?.(spec.valKey) ?? spec.valFb) : spec.val,
      unit: spec.unitKey ? (window.I18N?.t?.(spec.unitKey) ?? spec.unitFb) : (spec.unit || ''),
      lbl: window.I18N?.t?.(spec.lblKey) ?? spec.lblFb,
      type: spec.type
    };
  }

  function _pickLocalizedObj(obj) {
    if (!obj) return '';
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.pick === 'function') {
      return window.I18N.pick(obj);
    }
    return obj['zh-TW'] || obj['zh-CN'] || obj['en-US'] || '';
  }

  function getItemLocalizedName(item) {
    if (!item || !item.name) return '';
    return _pickLocalizedObj(item.name);
  }

  function getItemLocalizedDescription(item) {
    if (!item) return '';
    return _pickLocalizedObj(item.effects || item.description);
  }

  function renderItemCardHTML(item) {
    const name = escapeHtml(getItemLocalizedName(item));
    const catBadgeText = escapeHtml(getItemCategoryBadgeName(item.category));

    // Prominent numerical stat highlight
    const stat = getItemHighlightStat(item);
    let statRowHTML = '';
    if (stat) {
      statRowHTML = `
        <div class="wiki-item-card-stat-row">
          <div class="wiki-item-stat-badge stat-type-${stat.type}">
            <span class="wiki-item-stat-number font-mono">${escapeHtml(stat.val)}</span>
            ${stat.unit ? `<span class="wiki-item-stat-unit font-mono">${escapeHtml(stat.unit)}</span>` : ''}
            <span class="wiki-item-stat-divider">|</span>
            <span class="wiki-item-stat-label">${escapeHtml(stat.lbl)}</span>
          </div>
        </div>
      `;
    }

    // Evolution target Pokemon: NO COUNT TEXT! Direct prominent display with enlarged borderless avatars without names
    let evoSectionHTML = '';
    if (Array.isArray(item.pokemon_ids) && item.pokemon_ids.length > 0) {
      const idx = _getWikiPkmIndex();

      const chipsHTML = item.pokemon_ids.map(pkmId => {
        const idStr = String(pkmId);
        const padId = idStr.padStart(3, '0');
        const p = idx['id:' + idStr] || idx['no:' + padId];
        const pkmName = p
          ? (window.I18N?.getPokemonName?.(p) ?? (p.name_cn || p.name || p.name_en || ''))
          : `Pokemon #${pkmId}`;
        const pkmNo = p ? (p.formatted_no || String(p.id).padStart(3, '0')) : padId;
        const iconUrl = (p && typeof window !== 'undefined' && typeof window.getItemIcon === 'function')
          ? window.getItemIcon(p)
          : (p && p.icon_url ? p.icon_url : `https://www.serebii.net/pokemonsleep/pokemon/icon/${pkmNo}.png`);
        return `
          <div class="wiki-item-evo-chip" title="${escapeHtml(pkmName)}">
            <img src="${iconUrl}" class="wiki-item-evo-avatar" alt="${escapeHtml(pkmName)}" loading="lazy" onerror="if(typeof handlePokemonIconError==='function'){handlePokemonIconError(this);}else{this.style.opacity='0.5';}" />
          </div>
        `;
      }).join('');

      evoSectionHTML = `
        <div class="wiki-item-card-evosection">
          <div class="wiki-item-evo-chips">
            ${chipsHTML}
          </div>
        </div>
      `;
    }

    const rawIcon = item.icon_url || '';
    const iconUrl = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function')
      ? (window.mapExternalToLocalAsset(rawIcon) || rawIcon)
      : rawIcon;

    return `
      <div class="wiki-item-card" data-item-id="${item.id}" onclick="window.WikiDB.openItemDetailModal('${item.id}')" role="button" tabindex="0">
        <div class="wiki-item-card-header">
          <div class="wiki-item-card-icon-wrap">
            <img src="${iconUrl}" class="wiki-item-card-icon" alt="${name}" loading="lazy" onerror="if(typeof handleAssetImageError==='function'){handleAssetImageError(this);}else{this.style.opacity='0.3';}" />
          </div>
          <div class="wiki-item-card-title-group">
            <h4 class="wiki-item-card-name" title="${name}">${name}</h4>
            <div class="wiki-item-card-badge-row">
              <span class="wiki-item-cat-badge wiki-item-cat-${item.category}">${catBadgeText}</span>
            </div>
          </div>
        </div>
        ${statRowHTML}
        ${evoSectionHTML}
      </div>
    `;
  }

  function renderFilteredItemsGrid() {
    const grid = document.getElementById('wiki-items-card-grid');
    const empty = document.getElementById('wiki-items-empty-state');
    const badge = document.getElementById('wiki-items-count-badge');
    if (!grid) return;

    const filtered = filterItems(currentItemsCategory, currentItemsSearchQuery);
    const total = getMasterItemsData().length;

    if (badge) {
      badge.textContent = `${filtered.length} / ${total}`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (empty) empty.style.display = 'block';
    } else {
      if (empty) empty.style.display = 'none';
      grid.innerHTML = filtered.map(renderItemCardHTML).join('');
    }
  }

  function renderItemsSubpanel() {
    const allItems = getMasterItemsData();
    const totalCount = allItems.length;
    const filtered = filterItems(currentItemsCategory, currentItemsSearchQuery);
    const searchPlaceholder = window.I18N?.t?.('wiki.ui_items_search_ph') ?? '搜尋道具名稱、效果或對應寶可夢...';

    const categoryCounts = { all: totalCount };
    allItems.forEach(i => {
      categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
    });

    const categoryPillsHTML = ITEM_CATEGORIES.map(cat => {
      const isActive = currentItemsCategory === cat.key;
      const label = window.I18N?.t?.(cat.labelKey) ?? cat.labelFb;
      const count = categoryCounts[cat.key] || 0;
      return `<button type="button" class="wiki-pill-btn ${isActive ? 'active' : ''}" data-category="${cat.key}" onclick="window.WikiDB.filterItemsByCategory('${cat.key}')">${label} <span class="wiki-pill-count">(${count})</span></button>`;
    }).join('');

    const cardsHTML = filtered.length > 0
      ? filtered.map(renderItemCardHTML).join('')
      : '';

    const emptyDisplay = filtered.length === 0 ? 'block' : 'none';

    return `
      <div class="wiki-items-container">
        <div class="wiki-items-control-bar">
          <div class="wiki-items-search-row">
            <div class="sidebar-search-box wiki-items-search-box ${currentItemsSearchQuery ? 'has-query' : ''}">
              <span class="wiki-items-search-icon" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input type="text" id="wiki-items-search-input" class="sidebar-search-input wiki-items-search-input ${currentItemsSearchQuery ? 'has-value' : ''}"
                placeholder="${searchPlaceholder}"
                data-i18n-placeholder="wiki.items_search_placeholder"
                autocomplete="off"
                value="${escapeHtml(currentItemsSearchQuery)}"
                oninput="window.WikiDB.handleItemsSearch(this.value)">
              <button type="button" id="wiki-items-search-clear" class="sidebar-section-clear-btn wiki-items-search-clear"
                style="${currentItemsSearchQuery ? 'display:flex;' : 'display:none;'}"
                onclick="window.WikiDB.clearItemsSearch()"
                title="${window.I18N?.t?.('wiki.ui_clear') ?? '清空'}">
                [X]
              </button>
            </div>
            <div class="wiki-items-count-badge-wrapper">
              <span id="wiki-items-count-badge" class="wiki-items-count-badge font-mono">${filtered.length} / ${totalCount}</span>
            </div>
          </div>

          <div class="wiki-filter-pills wiki-items-filter-pills wiki-items-category-pills" role="tablist">
            ${categoryPillsHTML}
          </div>
        </div>

        <div id="wiki-items-card-grid" class="wiki-item-card-grid">
          ${cardsHTML}
        </div>

        <div id="wiki-items-empty-state" class="wiki-items-empty-state" style="display:${emptyDisplay};">
          <p class="wiki-empty-text font-bold" style="margin-bottom: 8px;">${window.I18N?.t?.('wiki.ui_items_empty') ?? '未找到符合條件的道具。'}</p>
          <button type="button" class="sidebar-reset-btn" onclick="window.WikiDB.resetItemsFilters()">${window.I18N?.t?.('wiki.ui_reset') ?? '重設'}</button>
        </div>
      </div>
    `;
  }

  // --- 道具詳細資訊彈窗與雙向圖鑑跳轉模組 (Item Detail Modal & Bidirectional Dex Linkage) ---

  let activeItemModalEscHandler = null;

  function getItemLocalizedEffects(item) {
    if (!item) return '';
    return _pickLocalizedObj(item.effects || item.description);
  }

  function getItemFlavorDescription(item) {
    if (!item || !item.description) return '';
    return _pickLocalizedObj(item.description);
  }

  function getItemAcquisitionList(item) {
    if (!item || !item.acquisition) return [];
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.pick === 'function') {
      const picked = window.I18N.pick(item.acquisition);
      if (Array.isArray(picked)) return picked.map(s => window.I18N?.text?.(s) ?? s);
    }
    if (Array.isArray(item.acquisition['zh-TW'])) return item.acquisition['zh-TW'];
    return [];
  }

  function formatItemExchangeLimit(limitStr) {
    if (!limitStr) return '';
    const m = String(limitStr).match(/^每月\s*(\d+)\s*[個个]$/);
    if (m) {
      return window.I18N?.t?.('wiki.ui_item_monthly_limit', { n: m[1] }) ?? limitStr;
    }
    return window.I18N?.text?.(limitStr) ?? limitStr;
  }

  function navigateToPokemonDex(pokemonId) {
    const pokedexModal = document.getElementById('pokedex-detail-modal');
    if (pokedexModal) pokedexModal.__suspendedForDetail = false;

    closeItemDetailModal();
    if (window.PokemonApp && typeof window.PokemonApp.openPokemonDetailModal === 'function') {
      window.PokemonApp.openPokemonDetailModal(pokemonId);
    } else if (typeof window.openPokemonDetailModal === 'function') {
      window.openPokemonDetailModal(pokemonId);
    }
  }

  function renderItemDetailModalContent(modal, item) {
    if (!modal || !item) return;

    const name = getItemLocalizedName(item);
    const enName = (item.name && item.name['en-US']) || '';
    const subName = (enName && enName !== name) ? enName : '';
    const catBadgeText = getItemCategoryBadgeName(item.category);
    const effectsText = getItemLocalizedEffects(item);
    const descText = getItemFlavorDescription(item);
    const channels = getItemAcquisitionList(item);
    const rawIcon = item.icon_url || '';
    const iconUrl = (typeof window !== 'undefined' && typeof window.mapExternalToLocalAsset === 'function')
      ? (window.mapExternalToLocalAsset(rawIcon) || rawIcon)
      : rawIcon;

    const closeLabel = window.I18N?.t?.('common.close') ?? '關閉';
    const effectTitle = window.I18N?.t?.('wiki.item_effect_title') ?? '效果與說明';
    const acqTitle = window.I18N?.t?.('wiki.item_acquisition_title') ?? '獲取管道與睡點兌換';
    const relatedTitle = window.I18N?.t?.('wiki.item_related_pokemon') ?? '對應寶可夢';

    // If modal inner elements are missing, generate full markup skeleton
    if (typeof modal.querySelector === 'function' && !modal.querySelector('#wiki-item-modal-body')) {
      const isMobileH5 = typeof document !== 'undefined' && document.body && document.body.classList && typeof document.body.classList.contains === 'function' && document.body.classList.contains('mobile-h5-app');
      modal.innerHTML = `
        <div class="wiki-item-modal-backdrop-dismiss" onclick="window.WikiDB.closeItemDetailModal()"></div>
        <div class="box-modal-dialog wiki-item-modal-dialog ${isMobileH5 ? 'mobile-box-sheet bottom-sheet mobile-modal-sheet' : ''}" role="document">
          <div class="box-modal-header wiki-item-modal-header">
            <div class="wiki-item-modal-title-group">
              <div class="wiki-item-modal-icon-wrap" id="wiki-item-modal-icon-wrap">
                <img id="wiki-item-modal-icon" class="wiki-item-modal-icon" alt="Item" loading="lazy" onerror="if(typeof handleAssetImageError==='function'){handleAssetImageError(this);}">
              </div>
              <div class="wiki-item-modal-heading">
                <div class="wiki-item-modal-title-row">
                  <h3 id="wiki-item-modal-title" class="wiki-item-modal-title">--</h3>
                  <span id="wiki-item-modal-cat-badge" class="wiki-item-category-badge wiki-item-modal-cat-badge">--</span>
                </div>
                <p id="wiki-item-modal-subtitle" class="wiki-item-modal-subtitle">--</p>
              </div>
            </div>
            <button type="button" id="wiki-item-modal-close-btn" class="box-modal-close wiki-item-modal-close-btn" onclick="window.WikiDB.closeItemDetailModal()" aria-label="${escapeHtml(closeLabel)}" data-i18n-aria="common.close">&times;</button>
          </div>

          <div class="box-modal-body wiki-item-modal-body" id="wiki-item-modal-body">
            <section class="wiki-item-modal-section wiki-item-desc-section">
              <h4 class="wiki-item-section-title" data-i18n="wiki.item_effect_title">${escapeHtml(effectTitle)}</h4>
              <div id="wiki-item-modal-stat-hero" class="wiki-item-modal-stat-hero" style="display:none;"></div>
              <p id="wiki-item-modal-effects" class="wiki-item-modal-effects font-bold">--</p>
              <p id="wiki-item-modal-desc" class="wiki-item-modal-desc">--</p>
            </section>

            <section class="wiki-item-modal-section wiki-item-shop-section">
              <h4 class="wiki-item-section-title" data-i18n="wiki.item_acquisition_title">${escapeHtml(acqTitle)}</h4>
              <div class="wiki-item-pricing-grid" id="wiki-item-modal-pricing"></div>
              <ul class="wiki-item-acq-list" id="wiki-item-modal-acq-list"></ul>
            </section>

            <section class="wiki-item-modal-section wiki-item-pokemon-section" id="wiki-item-modal-pokemon-section">
              <div class="wiki-item-section-header">
                <h4 class="wiki-item-section-title" id="wiki-item-pokemon-section-title" data-i18n="wiki.item_related_pokemon">${escapeHtml(relatedTitle)}</h4>
              </div>
              <div class="wiki-item-pokemon-grid" id="wiki-item-modal-pokemon-grid"></div>
            </section>
          </div>
        </div>
      `;
    }

    if (typeof modal.querySelector !== 'function') return;

    // Ensure existing or newly created modal headings/aria labels reflect current language immediately
    if (typeof modal.querySelectorAll === 'function') {
      modal.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key === 'wiki.item_effect_title') el.textContent = effectTitle;
        else if (key === 'wiki.item_acquisition_title') el.textContent = acqTitle;
        else if (key === 'wiki.item_related_pokemon') el.textContent = relatedTitle;
        else if (key && typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') {
          el.textContent = window.I18N.t(key, el.textContent);
        }
      });
      modal.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        if (key === 'common.close' && typeof el.setAttribute === 'function') {
          el.setAttribute('aria-label', closeLabel);
        } else if (key && typeof el.setAttribute === 'function' && typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') {
          el.setAttribute('aria-label', window.I18N.t(key, el.getAttribute('aria-label') || ''));
        }
      });
    }

    // 1. Header populate
    const iconEl = modal.querySelector('#wiki-item-modal-icon');
    if (iconEl) {
      if (iconEl.style) iconEl.style.opacity = '';
      if (iconEl.dataset) delete iconEl.dataset.fallbackStep;
      iconEl.src = iconUrl;
      iconEl.alt = name;
      iconEl.onerror = function() {
        if (typeof handleAssetImageError === 'function') {
          handleAssetImageError(this);
        }
      };
    }

    const titleEl = modal.querySelector('#wiki-item-modal-title');
    if (titleEl) {
      titleEl.textContent = name;
    }

    const catBadgeEl = modal.querySelector('#wiki-item-modal-cat-badge');
    if (catBadgeEl) {
      catBadgeEl.textContent = catBadgeText;
      catBadgeEl.className = 'wiki-item-category-badge wiki-item-modal-cat-badge wiki-item-cat-' + item.category;
    }

    const subtitleEl = modal.querySelector('#wiki-item-modal-subtitle');
    if (subtitleEl) {
      subtitleEl.textContent = subName;
      subtitleEl.style.display = subName ? '' : 'none';
    }

    // 2. Effects & Description with Stat Hero
    const effectsEl = modal.querySelector('#wiki-item-modal-effects');
    if (effectsEl) {
      effectsEl.textContent = effectsText;
    }

    let statHeroEl = modal.querySelector('#wiki-item-modal-stat-hero');
    const stat = getItemHighlightStat(item);
    if (!statHeroEl && effectsEl && effectsEl.parentNode) {
      statHeroEl = document.createElement('div');
      statHeroEl.id = 'wiki-item-modal-stat-hero';
      statHeroEl.className = 'wiki-item-modal-stat-hero';
      effectsEl.parentNode.insertBefore(statHeroEl, effectsEl);
    }
    if (statHeroEl) {
      if (stat) {
        statHeroEl.className = `wiki-item-modal-stat-hero stat-type-${stat.type}`;
        statHeroEl.innerHTML = `
          <div class="stat-hero-badge">
            <span class="stat-hero-val font-mono">${escapeHtml(stat.val)}</span>
            ${stat.unit ? `<span class="stat-hero-unit font-mono">${escapeHtml(stat.unit)}</span>` : ''}
          </div>
          <div class="stat-hero-meta">
            <span class="stat-hero-title">${escapeHtml(stat.lbl)}</span>
          </div>
        `;
        statHeroEl.style.display = 'flex';
      } else {
        statHeroEl.innerHTML = '';
        statHeroEl.style.display = 'none';
      }
    }

    const descEl = modal.querySelector('#wiki-item-modal-desc');
    if (descEl) {
      if (descText && descText !== effectsText) {
        descEl.textContent = descText;
        descEl.style.display = '';
      } else {
        descEl.textContent = '';
        descEl.style.display = 'none';
      }
    }

    // 3. Pricing Grid & Acquisition List
    const pricingEl = modal.querySelector('#wiki-item-modal-pricing');
    if (pricingEl) {
      const sleepPoints = item.sleep_points || {};
      const hasRegular = sleepPoints.regular !== null && sleepPoints.regular !== undefined;
      const hasPremium = sleepPoints.premium !== null && sleepPoints.premium !== undefined;
      const hasDiamonds = item.diamonds !== null && item.diamonds !== undefined;

      const regularValText = hasRegular
        ? `${Number(sleepPoints.regular).toLocaleString()} pt`
        : (hasPremium ? (window.I18N?.t?.('wiki.ui_item_prem_only') ?? '僅限高級交換所') : (window.I18N?.t?.('wiki.ui_item_not_sold') ?? '非交換所販售'));
      const regularLimitText = hasRegular && sleepPoints.limit_regular ? formatItemExchangeLimit(sleepPoints.limit_regular) : '';

      const premiumValText = hasPremium
        ? `${Number(sleepPoints.premium).toLocaleString()} pt`
        : (window.I18N?.t?.('wiki.ui_item_none') ?? '無');
      const premiumLimitText = hasPremium && sleepPoints.limit_premium ? formatItemExchangeLimit(sleepPoints.limit_premium) : '';

      pricingEl.innerHTML = `
        <div class="wiki-item-price-pill ${hasRegular ? '' : 'is-empty'}">
          <span class="price-label">${window.I18N?.t?.('wiki.ui_item_reg_exchange') ?? '一般睡眠點數'}</span>
          <span class="price-value ${hasRegular ? 'text-highlight' : 'text-muted'}">${regularValText}</span>
          ${regularLimitText ? `<span class="price-limit font-mono">${escapeHtml(regularLimitText)}</span>` : ''}
        </div>
        <div class="wiki-item-price-pill ${hasPremium ? '' : 'is-empty'}">
          <span class="price-label">${window.I18N?.t?.('wiki.ui_item_prem_exchange') ?? '高級睡眠點數'}</span>
          <span class="price-value ${hasPremium ? 'text-highlight' : 'text-muted'}">${premiumValText}</span>
          ${premiumLimitText ? `<span class="price-limit font-mono">${escapeHtml(premiumLimitText)}</span>` : ''}
        </div>
        ${hasDiamonds ? `
        <div class="wiki-item-price-pill has-diamonds">
          <span class="price-label">${window.I18N?.t?.('wiki.ui_item_diamond_shop') ?? '鑽石商店'}</span>
          <span class="price-value text-diamonds">${item.diamonds} ${window.I18N?.t?.('wiki.ui_item_diamonds_unit') ?? '鑽石'}</span>
          <span class="price-limit">${window.I18N?.t?.('wiki.ui_item_direct_buy') ?? '直接購買'}</span>
        </div>
        ` : ''}
      `;
    }

    const acqListEl = modal.querySelector('#wiki-item-modal-acq-list');
    if (acqListEl) {
      if (channels.length > 0) {
        acqListEl.innerHTML = channels.map(ch => `<li class="wiki-item-acq-item">${escapeHtml(ch)}</li>`).join('');
      } else {
        acqListEl.innerHTML = `<li class="wiki-item-acq-item text-muted">${window.I18N?.t?.('wiki.ui_item_no_channels') ?? '暫無常規獲取紀錄'}</li>`;
      }
    }

    // 4. Associated Pokemon Grid (Item -> Dex)
    const pkmSectionEl = modal.querySelector('#wiki-item-modal-pokemon-section');
    const pkmGridEl = modal.querySelector('#wiki-item-modal-pokemon-grid');
    const pkmCountEl = modal.querySelector('#wiki-item-modal-pkm-count');
    if (pkmCountEl) pkmCountEl.remove();

    const pkmSectionTitleEl = modal.querySelector('#wiki-item-pokemon-section-title');

    const shouldShowPokemon = item.category === 'evolution' || (Array.isArray(item.pokemon_ids) && item.pokemon_ids.length > 0);

    if (pkmSectionEl) {
      if (!shouldShowPokemon) {
        pkmSectionEl.style.display = 'none';
      } else {
        pkmSectionEl.style.display = 'block';
        const pkmIds = item.pokemon_ids || [];

        if (pkmSectionTitleEl) {
          const sectionTitle = item.category === 'evolution'
            ? (window.I18N?.t?.('wiki.ui_item_evo_pkm') ?? '對應可進化寶可夢')
            : (window.I18N?.t?.('wiki.ui_item_assoc_pkm') ?? '對應寶可夢');
          pkmSectionTitleEl.textContent = sectionTitle;
        }

        if (pkmGridEl) {
          if (pkmIds.length === 0) {
            pkmGridEl.innerHTML = `
              <div class="wiki-item-pkm-empty">
                <p>${window.I18N?.t?.('wiki.ui_item_pkm_empty') ?? '目前圖鑑中尚無需要此道具的寶可夢。'}</p>
              </div>
            `;
          } else {
            const idx = _getWikiPkmIndex();

            pkmGridEl.innerHTML = pkmIds.map(pkmId => {
              const idStr = String(pkmId);
              const padId = idStr.padStart(3, '0');
              const p = idx['id:' + idStr] || idx['no:' + padId];
              const pkmName = p
                ? (window.I18N?.getPokemonName?.(p) ?? (p.name_cn || p.name || p.name_en || ''))
                : `Pokemon #${pkmId}`;
              const pkmNo = p ? (p.formatted_no || String(p.id).padStart(3, '0')) : padId;
              const pkmIcon = (p && typeof window !== 'undefined' && typeof window.getItemIcon === 'function')
                ? window.getItemIcon(p)
                : (p && p.icon_url ? p.icon_url : `https://www.serebii.net/pokemonsleep/pokemon/icon/${pkmNo}.png`);
              const targetId = p ? p.id : pkmId;
              const viewTitle = window.I18N?.t?.('wiki.ui_item_view_pkm', { name: escapeHtml(pkmName) })
                ?? `查看 ${escapeHtml(pkmName)} 圖鑑評測`;

              return `
                <button type="button" class="wiki-item-pkm-card"
                  onclick="window.WikiDB.navigateToPokemonDex('${targetId}'); if (window.PokemonApp && window.PokemonApp.openPokemonDetailModal) { window.PokemonApp.openPokemonDetailModal('${targetId}'); }"
                  title="${viewTitle}">
                  <img src="${pkmIcon}" class="wiki-item-pkm-avatar" alt="${escapeHtml(pkmName)}" loading="lazy" onerror="if(typeof handlePokemonIconError==='function'){handlePokemonIconError(this);}else{this.style.opacity='0.5';}" />
                  <div class="wiki-item-pkm-info">
                    <span class="wiki-item-pkm-no font-mono">No.${pkmNo}</span>
                    <span class="wiki-item-pkm-name">${escapeHtml(pkmName)}</span>
                  </div>
                  <span class="wiki-item-pkm-arrow font-mono" aria-hidden="true">&rarr;</span>
                </button>
              `;
            }).join('');
          }
        }
      }
    }
  }

  function openItemDetailModal(itemId) {
    if (!itemId) return;
    try {
      const allItems = getMasterItemsData();
      const item = allItems.find(i => i.id === itemId);
      if (!item) {
        console.warn('[WikiDB] Item not found:', itemId);
        return;
      }

      let modal = null;
      try {
        if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
          modal = document.getElementById('wiki-item-detail-modal');
        }
      } catch (e) {}

      if (!modal) {
        if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
          try {
            modal = document.createElement('div');
            modal.id = 'wiki-item-detail-modal';
            modal.className = 'wiki-item-modal-backdrop';
            if (typeof modal.setAttribute === 'function') {
              modal.setAttribute('role', 'dialog');
              modal.setAttribute('aria-modal', 'true');
              modal.setAttribute('aria-labelledby', 'wiki-item-modal-title');
            }
            if (document.body && typeof document.body.appendChild === 'function') {
              document.body.appendChild(modal);
            }
          } catch (e) {}
        }
      }

      if (!modal) {
        return;
      }

      // Modal Suspension Protocol: suspend Pokédex modal if open to prevent stacked backdrops
      let pokedexModal = null;
      try {
        if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
          pokedexModal = document.getElementById('pokedex-detail-modal');
          if (pokedexModal && pokedexModal.style && pokedexModal.style.display !== 'none') {
            pokedexModal.style.display = 'none';
            pokedexModal.__suspendedForDetail = true;
          }
        }
      } catch (e) {}

      renderItemDetailModalContent(modal, item);

      try { if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal); else if (typeof document !== 'undefined' && document.body && typeof document.body.appendChild === 'function' && modal.parentElement !== document.body) document.body.appendChild(modal); } catch (e) {}
      try { if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal); } catch (e) {}
      if (modal.style) modal.style.display = 'flex';
      try {
        if (document.body && document.body.classList && typeof document.body.classList.add === 'function') {
          document.body.classList.add('item-modal-open');
          document.body.classList.add('modal-open');
        }
        if (document.body && document.body.style) document.body.style.overflow = 'hidden';
      } catch (e) {}
      try { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); } catch (e) {}
      try {
        if (activeItemModalEscHandler && typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
          document.removeEventListener('keydown', activeItemModalEscHandler);
        }
        activeItemModalEscHandler = (e) => { if (e && e.key === 'Escape') closeItemDetailModal(); };
        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') document.addEventListener('keydown', activeItemModalEscHandler);
      } catch (e) {}
    } catch (err) {
      console.warn('[WikiDB] openItemDetailModal error:', err);
    }
  }

  function closeItemDetailModal() {
    try {
      if (activeItemModalEscHandler) {
        if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
          document.removeEventListener('keydown', activeItemModalEscHandler);
        }
        activeItemModalEscHandler = null;
      }

      let modal = null;
      try {
        if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
          modal = document.getElementById('wiki-item-detail-modal');
        }
      } catch (e) {}
      if (!modal) return;

      const cleanup = () => {
        if (modal.style) modal.style.display = 'none';

        // Restore Pokédex modal if it was suspended
        try {
          const pokedexModal = document.getElementById('pokedex-detail-modal');
          if (pokedexModal && pokedexModal.__suspendedForDetail) {
            pokedexModal.__suspendedForDetail = false;
            if (pokedexModal.style) pokedexModal.style.display = 'flex';
            if (typeof window.prepareOverlayOpen === 'function') {
              window.prepareOverlayOpen(pokedexModal);
            }
            if (document.body && document.body.classList && typeof document.body.classList.add === 'function') {
              document.body.classList.add('pokedex-modal-open');
            }
          } else {
            if (document.body && document.body.classList && typeof document.body.classList.remove === 'function') {
              document.body.classList.remove('item-modal-open');
              document.body.classList.remove('modal-open');
            }
            if (document.body && document.body.style) {
              document.body.style.overflow = '';
            }
          }
        } catch (e) {}

        try {
          if (typeof window.syncOverlayOpenState === 'function') {
            window.syncOverlayOpenState();
          }
        } catch (e) {}
      };

      if (typeof window.animateOverlayClose === 'function') {
        window.animateOverlayClose(modal, cleanup);
      } else {
        cleanup();
      }
    } catch (err) {
      console.warn('[WikiDB] closeItemDetailModal error:', err);
    }
  }

  // 渲染 Wiki 主佈局與 5 大子分頁 (精簡二級選單列)