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

  let _itemsSearchTimer = null;

  function handleItemsSearchInput(query) {
    const q = (query || '').trim();
    const input = document.getElementById('wiki-items-search-input');
    const clearBtn = document.getElementById('wiki-items-search-clear');
    const searchBox = document.querySelector('.wiki-items-search-box');

    if (input) {
      if (q) {
        input.classList.add('has-value');
        if (searchBox) searchBox.classList.add('has-query');
      } else {
        input.classList.remove('has-value');
        if (searchBox) searchBox.classList.remove('has-query');
      }
    }
    if (clearBtn) {
      clearBtn.style.display = q ? 'flex' : 'none';
    }
    if (input && typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
      try { window.updateSearchInputHighlight(input, clearBtn); } catch (e) {}
    }

    if (_itemsSearchTimer) clearTimeout(_itemsSearchTimer);
    _itemsSearchTimer = setTimeout(() => {
      _itemsSearchTimer = null;
      handleItemsSearch(query);
    }, 90);
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
    if (_itemsSearchTimer) { clearTimeout(_itemsSearchTimer); _itemsSearchTimer = null; }
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
    evolution: ['wiki.ui_item_cat_evolution', '進化道具', '进化道具', 'Evolution'],
    training: ['wiki.ui_item_cat_training', '培育與種子', '培育与种子', 'Training'],
    biscuit: ['wiki.ui_item_cat_biscuit', '捕捉沙布蕾', '捕捉沙布蕾', 'Biscuits'],
    supply: ['wiki.ui_item_cat_supply', '探索與補給', '探索与补给', 'Supplies']
  };

  function getItemCategoryBadgeName(category) {
    const entry = ITEM_CATEGORY_BADGE_MAP[category];
    const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function')
      ? window.I18N.getLanguage() : 'zh-TW';
    if (entry) {
      if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') {
        return window.I18N.t(entry[0]);
      }
      return lang === 'en-US' ? entry[3] : (lang === 'zh-CN' ? entry[2] : entry[1]);
    }
    if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.t === 'function') {
      return window.I18N.t('wiki.ui_item_cat_default');
    }
    return lang === 'en-US' ? 'Item' : '道具';
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
    if (typeof window !== 'undefined' && window.I18N) {
      if (typeof window.I18N.pick === 'function') {
        return window.I18N.pick(obj);
      }
      if (typeof window.I18N.getLanguage === 'function') {
        const lang = window.I18N.getLanguage();
        if (lang && obj[lang]) return obj[lang];
      }
    }
    return obj['zh-TW'] || obj['zh-CN'] || obj['en-US'] || '';
  }

  function getItemLocalizedName(item) {
    if (!item || !item.name) return '';
    return _pickLocalizedObj(item.name);
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
            <img src="${iconUrl}" class="wiki-item-evo-avatar" alt="${escapeHtml(pkmName)}" width="28" height="28" loading="lazy" decoding="async" onerror="if(typeof handlePokemonIconError==='function'){handlePokemonIconError(this);}else{this.style.opacity='0.5';}" />
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
            <img src="${iconUrl}" class="wiki-item-card-icon" alt="${name}" width="44" height="44" loading="lazy" decoding="async" onerror="if(typeof handleAssetImageError==='function'){handleAssetImageError(this);}else{this.style.opacity='0.3';}" />
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
                oninput="window.WikiDB.handleItemsSearchInput(this.value)">
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
