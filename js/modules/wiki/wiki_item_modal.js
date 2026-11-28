  // --- 道具詳細資訊彈窗與雙向圖鑑跳轉模組 (Item Detail Modal & Bidirectional Dex Linkage) ---

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

  let activeItemModalEscHandler = null;

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
                <img id="wiki-item-modal-icon" class="wiki-item-modal-icon" alt="Item" width="52" height="52" loading="lazy" decoding="async" onerror="if(typeof handleAssetImageError==='function'){handleAssetImageError(this);}">
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
            const idx = typeof _getWikiPkmIndex === 'function' ? _getWikiPkmIndex() : {};

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
                  <img src="${pkmIcon}" class="wiki-item-pkm-avatar" alt="${escapeHtml(pkmName)}" width="40" height="40" loading="lazy" decoding="async" onerror="if(typeof handlePokemonIconError==='function'){handlePokemonIconError(this);}else{this.style.opacity='0.5';}" />
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
