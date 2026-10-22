  function switchSubTab(tab) {
    if (!['team', 'compare'].includes(tab)) tab = 'team';
    labState.currentSubTab = tab;
    labState.editMode = false;
    updateLabUI();
  }

  function setTeamIsland(islandId) {
    labState.teamIslandId = islandId;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_team_island', islandId);
      }
    } catch (e) {}
    autoOptimizeTeam(false);
  }

  function setTeamSlot(slotIndex, uid) {
    if (slotIndex >= 0 && slotIndex < 5) {
      labState.teamSlots[slotIndex] = uid;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function clearTeamSlot(slotIndex) {
    if (slotIndex >= 0 && slotIndex < 5) {
      labState.teamSlots[slotIndex] = null;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function clearAllTeamSlots() {
    labState.teamSlots = [null, null, null, null, null];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_team_slots', JSON.stringify(labState.teamSlots));
      }
    } catch (e) {}
    updateLabUI();
  }

  function setCompareSlot(slot, uid) {
    let idx = 0;
    if (typeof slot === 'number') idx = slot;
    else if (String(slot).toLowerCase() === 'b' || slot === '1') idx = 1;
    else if (String(slot).toLowerCase() === 'c' || slot === '2') idx = 2;
    else idx = 0;

    if (!Array.isArray(labState.compareSlots)) {
      labState.compareSlots = [null, null, null];
    }

    if (uid) {
      const otherIdx = labState.compareSlots.findIndex((u, i) => u === uid && i !== idx);
      if (otherIdx !== -1) {
        if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
          const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
          window.showToast(isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！');
        }
        return;
      }
    }

    labState.compareSlots[idx] = uid || null;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
        localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
          a: labState.compareSlots[0],
          b: labState.compareSlots[1],
          c: labState.compareSlots[2]
        }));
      }
    } catch (e) {}
    updateLabUI();
  }

  function clearCompareSlot(slot) {
    let idx = 0;
    if (typeof slot === 'number') idx = slot;
    else if (String(slot).toLowerCase() === 'b' || slot === '1') idx = 1;
    else if (String(slot).toLowerCase() === 'c' || slot === '2') idx = 2;
    else idx = 0;

    if (Array.isArray(labState.compareSlots) && idx >= 0 && idx < 3) {
      labState.compareSlots[idx] = null;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
          localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
            a: labState.compareSlots[0],
            b: labState.compareSlots[1],
            c: labState.compareSlots[2]
          }));
        }
      } catch (e) {}
      updateLabUI();
    }
  }

  function swapCompareSlots() {
    if (!Array.isArray(labState.compareSlots)) labState.compareSlots = [null, null, null];
    const tmp = labState.compareSlots[0];
    labState.compareSlots[0] = labState.compareSlots[1];
    labState.compareSlots[1] = tmp;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_slots', JSON.stringify(labState.compareSlots));
        localStorage.setItem('pksleep_lab_compare_uids', JSON.stringify({
          a: labState.compareSlots[0],
          b: labState.compareSlots[1],
          c: labState.compareSlots[2]
        }));
      }
    } catch (e) {}
    updateLabUI();
  }

  function setCompareBenchmarkLevel(lvl) {
    const val = (lvl === 'box' || !lvl) ? 'box' : parseInt(lvl, 10);
    labState.compareBenchmarkLevel = val;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('pksleep_lab_compare_benchmark', String(val));
      }
    } catch (e) {}
    updateLabUI();
  }

  /* ─── 自訂隊員/選手挑選彈窗 (Custom Pokémon Picker Modal) ────────────── */
  let activePickerState = null;

  function openLabPicker(opts) {
    activePickerState = opts || {};
    const userBox = (window.UserBox && typeof window.UserBox.getUserBox === 'function') ? window.UserBox.getUserBox() : [];
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    let modal = document.getElementById('modal-lab-picker');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-lab-picker';
      modal.className = 'lab-picker-modal';
      document.body.appendChild(modal);
    }

    if (opts.type === 'recipe') {
      const allRecipesList = getAllTargetRecipes();
      const currentTargetName = labState.targetRecipeName || '彈跳咖哩烏龍麵';

      function generateRecipeItemsHtml(query = '', categoryFilter = 'all') {
        const q = (query || '').trim().toLowerCase();
        const filtered = allRecipesList.filter(r => {
          const nameCn = (r.name_cn || r.name || '').toLowerCase();
          const nameEn = (r.name_en || '').toLowerCase();
          const cat = (r.category || '').toLowerCase();

          if (categoryFilter === 'curry' && !cat.includes('咖哩') && !cat.includes('curry') && !cat.includes('濃湯') && !cat.includes('stew')) return false;
          if (categoryFilter === 'salad' && !cat.includes('沙拉') && !cat.includes('salad')) return false;
          if (categoryFilter === 'dessert' && !cat.includes('點心') && !cat.includes('dessert') && !cat.includes('飲料') && !cat.includes('drink')) return false;

          if (!q) return true;
          if (nameCn.includes(q) || nameEn.includes(q) || cat.includes(q)) return true;
          if (Array.isArray(r.ingredients)) {
            return r.ingredients.some(ing => (ing.name || '').toLowerCase().includes(q));
          }
          return false;
        });

        if (filtered.length === 0) {
          return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching recipes found' : '未找到符合條件的料理'}</div>`;
        }

        return filtered.map(r => {
          const rNameCn = r.name_cn || r.name || '';
          const rDisplayName = isEN ? (r.name_en || rNameCn) : rNameCn;
          const isSelected = (rNameCn === currentTargetName || r.name === currentTargetName);
          const ings = Array.isArray(r.ingredients) ? r.ingredients : [];

          const ingsHtml = ings.map(ing => {
            const iDisp = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
            const iconUrl = ing.icon || (window.I18N && typeof window.I18N.getIngredientIcon === 'function' ? window.I18N.getIngredientIcon(ing.name) : '');
            return `
              <span class="lab-recipe-ing-chip" title="${escapeHtml(iDisp)} x${ing.count}">
                ${iconUrl ? `<img src="${iconUrl}" class="lab-recipe-ing-icon" alt="${escapeHtml(iDisp)}">` : ''}
                <span class="lab-recipe-ing-count">x${ing.count}</span>
              </span>
            `;
          }).join('');

          return `
            <div class="lab-recipe-card ${isSelected ? 'selected' : ''}" onclick="window.AppraisalLab.onRecipePickerSelect('${escapeHtml(rNameCn)}')">
              ${isSelected ? `<span class="lab-recipe-active-badge">${isEN ? 'Current' : '當前目標'}</span>` : ''}
              <div class="lab-recipe-card-header">
                ${r.icon ? `<img src="${r.icon}" class="lab-recipe-card-icon" alt="${escapeHtml(rDisplayName)}" loading="lazy">` : ''}
                <div class="lab-recipe-card-meta">
                  <div class="lab-recipe-card-name">${escapeHtml(rDisplayName)}</div>
                  <div class="lab-recipe-card-sub">
                    <span class="lab-recipe-card-cat">${escapeHtml(r.category || '')}</span>
                    ${r.pot_size ? `<span class="lab-recipe-card-pot">${r.pot_size} ${isEN ? 'Pots' : '格'}</span>` : ''}
                    ${r.base_energy ? `<span class="lab-recipe-card-energy">${r.base_energy.toLocaleString()} ${isEN ? 'Energy' : '能量'}</span>` : ''}
                  </div>
                </div>
              </div>
              <div class="lab-recipe-card-ingredients">
                ${ingsHtml}
              </div>
            </div>
          `;
        }).join('');
      }

      function renderRecipeItems(query = '', filter = 'all') {
        const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-recipe-list') : null) || document.getElementById('lab-picker-recipe-list');
        if (listEl) {
          listEl.innerHTML = generateRecipeItemsHtml(query, filter);
        }
      }

      modal.innerHTML = `
        <div class="lab-picker-container lab-recipe-picker-container">
          <div class="lab-picker-header">
            <div style="font-size:15px;font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
              <span>${isEN ? 'Select Target Recipe' : '挑選目標料理 (深度研究室)'}</span>
              <span style="font-size:11px;color:var(--accent-color,#38bdf8);background:rgba(56,189,248,0.12);padding:1px 6px;border-radius:4px;">${allRecipesList.length} ${isEN ? 'Dishes' : '道料理'}</span>
            </div>
            <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="lab-picker-search-bar">
            <input type="text" id="lab-picker-recipe-search" class="box-form-input" placeholder="${isEN ? 'Search recipe name or ingredient...' : '搜尋料理名稱或所需食材...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
            <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
              <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${isEN ? 'All' : '全部'} (${allRecipesList.length})</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="curry" style="padding:3px 10px;font-size:11px;">${isEN ? 'Curry' : '咖哩/濃湯'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="salad" style="padding:3px 10px;font-size:11px;">${isEN ? 'Salad' : '沙拉'}</button>
              <button type="button" class="box-btn box-btn-secondary" data-filter="dessert" style="padding:3px 10px;font-size:11px;">${isEN ? 'Dessert' : '點心/飲料'}</button>
            </div>
          </div>

          <div class="lab-picker-list lab-recipe-picker-list" id="lab-picker-recipe-list">
            ${generateRecipeItemsHtml('', 'all')}
          </div>
        </div>
      `;

      const searchInput = modal.querySelector('#lab-picker-recipe-search');
      let currentFilter = 'all';
      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderRecipeItems(searchInput.value, currentFilter);
        });
      }

      modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
        btn.addEventListener('click', () => {
          modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentFilter = btn.getAttribute('data-filter') || 'all';
          renderRecipeItems(searchInput ? searchInput.value : '', currentFilter);
        });
      });

      modal.style.display = 'flex';
      if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
      if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
      document.body.style.overflow = 'hidden';

      modal.onclick = (e) => {
        if (e.target === modal) closeLabPicker();
      };
      return;
    }

    const currentIsland = LAB_ISLANDS.find(i => i.id === labState.teamIslandId) || LAB_ISLANDS[0];
    const favBerries = getIslandFavoredBerries(labState.teamIslandId);
    const favTypes = getIslandFavoredTypes(labState.teamIslandId);

    let compareTargetIdx = 0;
    if (opts.type === 'compare') {
      if (typeof opts.compareSlot === 'number') compareTargetIdx = opts.compareSlot;
      else if (String(opts.compareSlot).toLowerCase() === 'b' || opts.compareSlot === '1') compareTargetIdx = 1;
      else if (String(opts.compareSlot).toLowerCase() === 'c' || opts.compareSlot === '2') compareTargetIdx = 2;
      else compareTargetIdx = 0;
    }
    const compareLetter = ['A', 'B', 'C'][compareTargetIdx] || 'A';

    const title = opts.type === 'team'
      ? (isEN ? `Select Member for Slot ${opts.slotIndex + 1}` : `挑選隊員 (隊員槽位 ${opts.slotIndex + 1})`)
      : (isEN ? `Select Pokémon for Player ${compareLetter}` : `挑選選手 ${compareLetter}`);

    function generatePickerItemsHtml(query = '', filter = 'all') {
      const q = (query || '').trim().toLowerCase();
      const filtered = userBox.filter(item => {
        const base = findBasePkm(item.pokemonId || item.name);
        const nameCn = (item.name || (base ? base.name_cn : '')).toLowerCase();
        const nameEn = (base && base.name_en ? base.name_en : '').toLowerCase();
        const nick = (item.nickname || '').toLowerCase();
        const dexNo = String(base ? (base.formatted_no || base.id) : (item.pokemonId || ''));

        if (q && !nameCn.includes(q) && !nameEn.includes(q) && !nick.includes(q) && !dexNo.includes(q)) {
          return false;
        }

        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const bName = berry.name || '';
        const bType = berry.type || (base ? base.type : '') || '';
        const isFav = favBerries.includes(bName) || favTypes.includes(bType);

        const spec = (base && base.specialty) || '';
        if (filter === 'fav' && !isFav) return false;
        if (filter === 'berry' && !spec.includes('樹果') && spec !== 'Berries') return false;
        if (filter === 'ingredient' && !spec.includes('食材') && spec !== 'Ingredients') return false;
        if (filter === 'skill' && !spec.includes('技能') && spec !== 'Skills') return false;
        return true;
      });

      if (filtered.length === 0) {
        return `<div style="padding:30px;text-align:center;color:var(--text-muted);font-size:13px;grid-column:1/-1;">${isEN ? 'No matching Pokémon found in Box' : '倉庫中未找到符合條件之寶可夢'}</div>`;
      }

      // Check occupied in comparison
      const occupiedInOtherSlot = new Set();
      let currentSelectedUid = null;
      if (opts.type === 'compare' && Array.isArray(labState.compareSlots)) {
        currentSelectedUid = labState.compareSlots[compareTargetIdx] || null;
        labState.compareSlots.forEach((uid, idx) => {
          if (uid && idx !== compareTargetIdx) occupiedInOtherSlot.add(uid);
        });
      } else if (opts.type === 'team' && Array.isArray(labState.teamSlots)) {
        currentSelectedUid = labState.teamSlots[opts.slotIndex] || null;
      }

      return filtered.map(item => {
        const base = findBasePkm(item.pokemonId || item.name);
        const pDisplayName = isEN ? (base ? (base.name_en || base.name_cn) : item.name) : (item.name || (base ? base.name_cn : ''));
        const avatarUrl = (base && (base.icon_url || base.icon)) || (base && base.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${base.formatted_no}.png` : '') || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="18" fill="%23334155"/></svg>';
        const berry = (typeof window.getPokemonBerry === 'function' && base) ? window.getPokemonBerry(base) : (base && base.berry ? base.berry : {});
        const isFav = favBerries.includes(berry.name || '') || favTypes.includes(berry.type || (base ? base.type : '') || '');
        const specHtml = (window.I18N && window.I18N.getSpecialtyIconHtml && base) ? window.I18N.getSpecialtyIconHtml(base.specialty, 16) : '';
        const natDisplayName = window.I18N ? window.I18N.getNatureName(item.nature) : item.nature;

        const isOccupied = occupiedInOtherSlot.has(item.uid);
        const isSel = (item.uid === currentSelectedUid);

        let clickAttr;
        if (isOccupied) {
          const toastMsg = isEN ? 'This Pokémon is already selected in comparison!' : '該寶可夢已在對比選手名單中，無法重複選擇！';
          clickAttr = `onclick="if(typeof window.showToast==='function')window.showToast('${toastMsg}');"`;
        } else {
          clickAttr = `onclick="window.AppraisalLab.onPickerSelect('${item.uid}')"`;
        }

        return `
          <div class="lab-picker-card ${isSel ? 'selected' : ''} ${isOccupied ? 'occupied disabled' : ''} ${isFav ? 'fav' : ''}" data-uid="${item.uid}" ${clickAttr} title="${isOccupied ? (isEN ? 'Already in comparison' : '已在對比選手中') : ''}">
            ${isOccupied ? `<span class="lab-picker-occupied-badge">${isEN ? 'In Comparison' : '已在對比中'}</span>` : ''}
            <div class="lab-picker-avatar">
              <img src="${avatarUrl}" alt="${escapeHtml(pDisplayName)}" loading="lazy">
              <span class="lab-picker-lv">Lv.${item.level || 1}</span>
            </div>
            <div class="lab-picker-meta">
              <div class="lab-picker-name">${escapeHtml(pDisplayName)}</div>
              ${item.nickname ? `<div class="lab-picker-nick">${escapeHtml(item.nickname)}</div>` : ''}
              <div class="lab-picker-sub">
                ${berry.icon ? `<img src="${berry.icon}" class="lab-picker-berry" alt="Berry">` : ''}
                ${specHtml}
                <span class="lab-picker-nature">${natDisplayName || ''}${(item.cleanseMint || item.mint) ? (isEN ? ' (Mint)' : ' (薄荷)') : ''}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function renderPickerItems(query = '', filter = 'all') {
      const listEl = (modal && typeof modal.querySelector === 'function' ? modal.querySelector('#lab-picker-items-list') : null) || document.getElementById('lab-picker-items-list');
      if (listEl) {
        listEl.innerHTML = generatePickerItemsHtml(query, filter);
      }
    }

    modal.innerHTML = `
      <div class="lab-picker-container">
        <div class="lab-picker-header">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);">${title}</div>
          <button type="button" class="appraisal-close-btn" onclick="window.AppraisalLab.closePicker()" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="lab-picker-search-bar">
          <input type="text" id="lab-picker-search-input" class="box-form-input" placeholder="${isEN ? 'Search name, nickname or Dex No...' : '搜尋寶可夢名稱、暱稱或編號...'}" style="flex:1;min-width:180px;height:34px;font-size:12px;">
          <div class="lab-picker-filter-chips" style="display:flex;gap:6px;flex-wrap:wrap;">
            <button type="button" class="box-btn box-btn-secondary active" data-filter="all" style="padding:3px 10px;font-size:11px;">${isEN ? 'All' : '全部'} (${userBox.length})</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="fav" style="padding:3px 10px;font-size:11px;">${isEN ? 'Favored' : '喜愛樹果'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="berry" style="padding:3px 10px;font-size:11px;">${isEN ? 'Berries' : '樹果型'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="ingredient" style="padding:3px 10px;font-size:11px;">${isEN ? 'Ingredients' : '食材型'}</button>
            <button type="button" class="box-btn box-btn-secondary" data-filter="skill" style="padding:3px 10px;font-size:11px;">${isEN ? 'Skills' : '技能型'}</button>
          </div>
        </div>

        <div class="lab-picker-list" id="lab-picker-items-list">${generatePickerItemsHtml('', 'all')}</div>
      </div>
    `;

    const searchInput = modal.querySelector('#lab-picker-search-input');
    let currentFilter = 'all';
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderPickerItems(searchInput.value, currentFilter);
      });
    }

    modal.querySelectorAll('.lab-picker-filter-chips button').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.lab-picker-filter-chips button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderPickerItems(searchInput ? searchInput.value : '', currentFilter);
      });
    });

    modal.style.display = 'flex';
    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
    document.body.style.overflow = 'hidden';

    modal.onclick = (e) => {
      if (e.target === modal) closeLabPicker();
    };
  }

  function closeLabPicker() {
    const modal = document.getElementById('modal-lab-picker');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = '';
    activePickerState = null;
  }

  function onPickerSelect(uid) {
    if (!activePickerState) return;
    if (activePickerState.type === 'team') {
      setTeamSlot(activePickerState.slotIndex, uid);
    } else if (activePickerState.type === 'compare') {
      const slot = activePickerState.compareSlot !== undefined ? activePickerState.compareSlot : (activePickerState.slotIndex || 0);
      setCompareSlot(slot, uid);
    } else if (activePickerState.type === 'recipe') {
      setTargetRecipe(uid);
    }
    closeLabPicker();
  }

  function onRecipePickerSelect(recipeName) {
    setTargetRecipe(recipeName);
    closeLabPicker();
  }

