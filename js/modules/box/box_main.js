  /* ─── 統一去重與高階升級入庫函式 (Unified Upsert & Deduplication) ───── */
  function upsertImportedPokemonToBox(incomingEntry, userBoxArray) {
    const list = userBoxArray || userBox;
    if (!incomingEntry || typeof incomingEntry !== 'object') return { status: 'skipped', entry: null };

    const incomingLevel = Math.max(1, Math.min(100, parseInt(incomingEntry.level, 10) || 1));
    const incomingSkillLevel = Math.max(1, Math.min(8, parseInt(incomingEntry.skillLevel || incomingEntry.mainSkillLevel || incomingEntry.main_skill_level, 10) || 1));

    // 1. Check exact feature fingerprint via makePokemonFingerprint
    const fpFn = (typeof makePokemonFingerprint === 'function') ? makePokemonFingerprint
      : (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.makePokemonFingerprint === 'function' ? window.UserBox.makePokemonFingerprint : null);
    const incomingFp = fpFn ? fpFn(incomingEntry) : '';
    if (fpFn && incomingFp) {
      const exactMatch = list.find(p => p && fpFn(p) === incomingFp);
      if (exactMatch) {
        const existLevel = Math.max(1, Math.min(100, parseInt(exactMatch.level, 10) || 1));
        const existSkillLevel = Math.max(1, Math.min(8, parseInt(exactMatch.skillLevel || exactMatch.mainSkillLevel || exactMatch.main_skill_level, 10) || 1));
        if (existLevel >= incomingLevel && existSkillLevel >= incomingSkillLevel) {
          return { status: 'skipped', entry: exactMatch };
        }
      }
    }

    // 2. Check findSimilarPokemonInBox (same pkmId, same nature, compatible subskills / ingredients)
    const similarFn = (typeof findSimilarPokemonInBox === 'function') ? findSimilarPokemonInBox
      : (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.findSimilarPokemonInBox === 'function' ? window.UserBox.findSimilarPokemonInBox : null);
    const similarExisting = similarFn ? similarFn(incomingEntry, list) : null;

    if (similarExisting) {
      const existLevel = Math.max(1, Math.min(100, parseInt(similarExisting.level, 10) || 1));
      const existSkillLevel = Math.max(1, Math.min(8, parseInt(similarExisting.skillLevel || similarExisting.mainSkillLevel || similarExisting.main_skill_level, 10) || 1));

      if (incomingLevel > existLevel || incomingSkillLevel > existSkillLevel) {
        similarExisting.level = Math.max(existLevel, incomingLevel);
        const upgradedSkillLvl = Math.max(existSkillLevel, incomingSkillLevel);
        similarExisting.skillLevel = upgradedSkillLvl;
        if ('mainSkillLevel' in similarExisting || 'main_skill_level' in similarExisting) {
          similarExisting.mainSkillLevel = upgradedSkillLvl;
          similarExisting.main_skill_level = upgradedSkillLvl;
        }

        const incomingSubs = Array.isArray(incomingEntry.subskills) ? incomingEntry.subskills : [];
        const existingSubs = Array.isArray(similarExisting.subskills) ? similarExisting.subskills : [];
        if (incomingSubs.filter(Boolean).length > existingSubs.filter(Boolean).length) {
          similarExisting.subskills = incomingSubs.slice();
        }

        const incomingIng1 = incomingEntry.ing1 || (incomingEntry.ingredients && incomingEntry.ingredients[0]) || '';
        const incomingIng2 = incomingEntry.ing2 || (incomingEntry.ingredients && incomingEntry.ingredients[1]) || '';
        const incomingIng3 = incomingEntry.ing3 || (incomingEntry.ingredients && incomingEntry.ingredients[2]) || '';
        const existIng1 = similarExisting.ing1 || (similarExisting.ingredients && similarExisting.ingredients[0]) || '';
        const existIng2 = similarExisting.ing2 || (similarExisting.ingredients && similarExisting.ingredients[1]) || '';
        const existIng3 = similarExisting.ing3 || (similarExisting.ingredients && similarExisting.ingredients[2]) || '';
        const incomingIngCount = [incomingIng1, incomingIng2, incomingIng3].filter(Boolean).length;
        const existIngCount = [existIng1, existIng2, existIng3].filter(Boolean).length;

        if (incomingIngCount > existIngCount) {
          if (incomingIng1) similarExisting.ing1 = incomingIng1;
          if (incomingIng2) similarExisting.ing2 = incomingIng2;
          if (incomingIng3) similarExisting.ing3 = incomingIng3;
          if (Array.isArray(similarExisting.ingredients) || Array.isArray(incomingEntry.ingredients)) {
            similarExisting.ingredients = [similarExisting.ing1, similarExisting.ing2, similarExisting.ing3].filter(Boolean);
          }
        }

        const existNick = (similarExisting.nickname || '').trim();
        const incomingNick = (incomingEntry.nickname || '').trim();
        if (!existNick && incomingNick) similarExisting.nickname = incomingNick;

        const incomingRibbon = parseInt(incomingEntry.ribbon, 10) || 0;
        const existRibbon = parseInt(similarExisting.ribbon, 10) || 0;
        similarExisting.ribbon = Math.max(existRibbon, incomingRibbon);

        const isShiny = Boolean(similarExisting.isShiny || similarExisting.shiny || incomingEntry.isShiny || incomingEntry.shiny);
        similarExisting.isShiny = isShiny;
        if ('shiny' in similarExisting || 'shiny' in incomingEntry) similarExisting.shiny = isShiny;

        similarExisting.updatedAt = new Date().toISOString();
        return { status: 'upgraded', entry: similarExisting };
      } else {
        return { status: 'skipped', entry: similarExisting };
      }
    }

    // 3. No match exists -> append incomingEntry to list
    if (!incomingEntry.uid && !incomingEntry.id) {
      incomingEntry.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    } else if (!incomingEntry.uid && incomingEntry.id) {
      incomingEntry.uid = incomingEntry.id;
    }
    if (!incomingEntry.addedAt && !incomingEntry.createdAt) {
      incomingEntry.addedAt = new Date().toISOString();
      incomingEntry.createdAt = Date.now();
    }
    list.push(incomingEntry);
    return { status: 'added', entry: incomingEntry };
  }

  /* ─── 備份匯出與匯入 ─────────────────────────────────────── */
  function exportBoxJSON() {
    if (userBox.length === 0) {
      showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_export_notice') : undefined) ?? '匯出提醒', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_export_empty') : undefined) ?? '倉庫內目前沒有任何寶可夢可匯出！', 'warning');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userBox, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pokemon_sleep_box_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  const MAX_IMPORT_COUNT = 500;
  const DANGEROUS_PROTO_KEYS = ['__proto__', 'constructor', 'prototype'];

  function sanitizeImportedPokemon(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    for (const key of DANGEROUS_PROTO_KEYS) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) return null;
    }

    const clean = {};
    if (typeof raw.uid === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(raw.uid)) {
      clean.uid = raw.uid;
    } else {
      clean.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    clean.name = typeof raw.name === 'string' ? raw.name.trim().slice(0, 30) : '未知寶可夢';
    if (typeof raw.nickname === 'string' && raw.nickname.trim()) {
      clean.nickname = raw.nickname.trim().slice(0, 30);
    }

    clean.level = Math.max(1, Math.min(100, parseInt(raw.level, 10) || 1));
    clean.main_skill_level = Math.max(1, Math.min(8, parseInt(raw.main_skill_level || raw.skillLevel || raw.mainSkillLevel, 10) || 1));
    clean.skillLevel = clean.main_skill_level;
    clean.mainSkillLevel = clean.main_skill_level;
    if (raw.pokemonId != null) clean.pokemonId = String(raw.pokemonId).slice(0, 20);
    if (raw.pkmId != null) clean.pkmId = String(raw.pkmId).slice(0, 20);

    clean.nature = typeof raw.nature === 'string' ? raw.nature.trim().slice(0, 20) : '認真';
    clean.cleanseMint = Boolean(raw.cleanseMint);
    clean.ribbon = Math.max(0, Math.min(4, parseInt(raw.ribbon, 10) || 0));
    clean.isShiny = Boolean(raw.isShiny || raw.shiny);

    if (Array.isArray(raw.subskills)) {
      clean.subskills = raw.subskills
        .filter(s => typeof s === 'string')
        .map(s => s.trim().slice(0, 30))
        .slice(0, 5);
    } else {
      clean.subskills = [];
    }

    if (Array.isArray(raw.ingredients)) {
      clean.ingredients = raw.ingredients
        .filter(i => typeof i === 'string')
        .map(i => i.trim().slice(0, 30))
        .slice(0, 3);
    } else {
      clean.ingredients = [];
    }
    clean.ing1 = raw.ing1 || clean.ingredients[0] || '';
    clean.ing2 = raw.ing2 || clean.ingredients[1] || '';
    clean.ing3 = raw.ing3 || clean.ingredients[2] || '';

    if (typeof raw.specialty === 'string') clean.specialty = raw.specialty.slice(0, 20);
    if (typeof raw.type === 'string') clean.type = raw.type.slice(0, 20);
    if (typeof raw.main_skill === 'string') clean.main_skill = raw.main_skill.slice(0, 40);
    if (raw.is_final !== undefined || raw.isFinal !== undefined) {
      clean.is_final = Boolean(raw.is_final !== undefined ? raw.is_final : raw.isFinal);
    }

    return clean;
  }

  function importBoxJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (imported.length > MAX_IMPORT_COUNT) {
            showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_limit_title') : undefined) ?? '匯入超限', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_limit_desc', { max: MAX_IMPORT_COUNT }) : undefined) ?? `單次匯入不可超過 ${MAX_IMPORT_COUNT} 隻寶可夢！`, 'warning');
            return;
          }
          const validItems = imported.map(sanitizeImportedPokemon).filter(Boolean);
          if (validItems.length === 0) {
            showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_failed_title') : undefined) ?? '匯入失敗', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_empty') : undefined) ?? '無有效的寶可夢資料可匯入！', 'warning');
            return;
          }

          const confirmMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_confirm_import', { count: validItems.length }) : undefined) ?? `確定要匯入 ${validItems.length} 隻寶可夢嗎？（將合併至現有倉庫）`;
          const confirmTitle = (typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_confirm_import_title') : undefined) ?? '確認匯入';
          const confirmed = await showBoxConfirmModal(confirmMsg, {
            title: confirmTitle,
            confirmText: confirmTitle
          });
          if (!confirmed) return;

          let addedCount = 0;
          let upgradedCount = 0;
          let skippedCount = 0;

          validItems.forEach(item => {
            const res = upsertImportedPokemonToBox(item, userBox);
            if (res.status === 'added') addedCount++;
            else if (res.status === 'upgraded') upgradedCount++;
            else if (res.status === 'skipped') skippedCount++;
          });

          saveUserBox();
          renderBox();

          const summaryMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_summary', { added: addedCount, upgraded: upgradedCount, skipped: skippedCount }) : undefined) ?? `匯入完成！新增 ${addedCount} 隻，升級更新 ${upgradedCount} 隻，略過重複 ${skippedCount} 隻。`;
          showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_success_title') : undefined) ?? '匯入成功', summaryMsg, 'success');
        } else {
          showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_failed_title') : undefined) ?? '匯入失敗', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_import_invalid_format') : undefined) ?? '匯入檔案格式錯誤，請確認為正確的 JSON 備份檔！', 'warning');
        }
      } catch (err) {
        showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_parse_failed_title') : undefined) ?? '解析失敗', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_parse_failed_error', { error: err.message }) : undefined) ?? ('解析 JSON 備份檔案失敗：' + err.message), 'error');
      }
    };
    reader.readAsText(file);
  }

  /* ─── XSS 防護 ───────────────────────────────────────── */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const STORAGE_KEY_BOX_SUBTAB = 'pksleep_active_box_subtab';
  const VALID_BOX_SUBTABS = ['list', 'lab'];

  function getSavedBoxSubtab() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const rawHash = window.location.hash.replace(/^#/, '');
        const parts = rawHash.split(/[/_?]/);
        if (parts[0] === 'box') {
          if (parts[1] === 'lab') return 'lab';
          return 'list';
        }
      }
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        const saved = storage.getItem(STORAGE_KEY_BOX_SUBTAB);
        if (VALID_BOX_SUBTABS.includes(saved)) {
          return saved;
        }
      }
    } catch (e) {}
    return 'list';
  }

  function switchBoxSubtab(tab) {
    if (typeof window !== 'undefined' && typeof window.cancelPullToRefresh === 'function') {
      try { window.cancelPullToRefresh(); } catch (e) {}
    }
    if (!VALID_BOX_SUBTABS.includes(tab)) tab = 'list';
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo(0, 0);
    }
    try {
      const storage = (typeof window !== 'undefined' && window.localStorage) ? window.localStorage : (typeof localStorage !== 'undefined' ? localStorage : null);
      if (storage) {
        storage.setItem(STORAGE_KEY_BOX_SUBTAB, tab);
      }
      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        const curHash = window.location.hash ? window.location.hash.replace(/^#/, '') : '';
        const mainPart = curHash.split(/[/_?]/)[0];
        if (mainPart === 'box' || !mainPart) {
          window.history.replaceState(null, '', tab === 'list' ? '#box' : '#box/' + tab);
        }
      }
    } catch (e) {}

    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');
    const subpanelList = document.getElementById('box-subpanel-list');
    const subpanelLab = document.getElementById('box-subpanel-lab');
    const fabContainer = document.getElementById('box-fab-container');
    const desktopLabBtn = document.getElementById('box-appraisal-lab-btn');
    const panelBox = document.getElementById('panel-box');

    if (tab === 'lab') {
      if (document.body) document.body.classList.add('box-lab-active');
      if (panelBox) panelBox.classList.add('box-lab-active');
      if (subtabLab) subtabLab.classList.add('active');
      if (subtabList) subtabList.classList.remove('active');
      if (subpanelList && subpanelList.style) {
        if (typeof subpanelList.style.setProperty === 'function') {
          subpanelList.style.setProperty('display', 'none', 'important');
        } else {
          subpanelList.style.display = 'none';
        }
      }
      if (subpanelLab && subpanelLab.style) {
        if (typeof subpanelLab.style.setProperty === 'function') {
          subpanelLab.style.setProperty('display', 'block', 'important');
        } else {
          subpanelLab.style.display = 'block';
        }
      }
      if (fabContainer && fabContainer.style) {
        fabContainer.style.display = 'none';
        if (typeof fabContainer.style.setProperty === 'function') {
          fabContainer.style.setProperty('display', 'none', 'important');
        }
      }
      if (desktopLabBtn) desktopLabBtn.classList.add('active');
      const boxSidebar = document.getElementById('box-filter-sidebar');
      const boxBookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
      const boxBackdrop = document.getElementById('box-sidebar-backdrop');
      if (boxSidebar) {
        boxSidebar.style.display = 'none';
        boxSidebar.classList.add('collapsed');
      }
      if (boxBookmarkHandle && boxBookmarkHandle.style) {
        boxBookmarkHandle.style.display = 'none';
        boxBookmarkHandle.style.opacity = '0';
        boxBookmarkHandle.style.pointerEvents = 'none';
        boxBookmarkHandle.style.visibility = 'hidden';
        if (typeof boxBookmarkHandle.style.setProperty === 'function') {
          boxBookmarkHandle.style.setProperty('display', 'none', 'important');
        }
      }
      document.querySelectorAll('#panel-box .sidebar-fab-btn, #panel-box .sidebar-bookmark-handle, .box-fab-container').forEach(el => {
        if (el && el.style) {
          el.style.display = 'none';
          if (typeof el.style.setProperty === 'function') {
            el.style.setProperty('display', 'none', 'important');
          }
        }
      });
      if (boxBackdrop) boxBackdrop.classList.remove('active');
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer) {
        labContainer.style.display = 'block';
        if (window.AppraisalLab && typeof window.AppraisalLab.renderLab === 'function') {
          window.AppraisalLab.renderLab(labContainer);
        }
      }
    } else {
      if (document.body) document.body.classList.remove('box-lab-active');
      if (panelBox) panelBox.classList.remove('box-lab-active');
      if (subtabList) subtabList.classList.add('active');
      if (subtabLab) subtabLab.classList.remove('active');
      if (subpanelList && subpanelList.style) {
        if (typeof subpanelList.style.removeProperty === 'function') {
          subpanelList.style.removeProperty('display');
        }
        if (typeof subpanelList.style.setProperty === 'function') {
          subpanelList.style.setProperty('display', 'block', 'important');
        } else {
          subpanelList.style.display = 'block';
        }
      }
      if (subpanelLab && subpanelLab.style) {
        if (typeof subpanelLab.style.setProperty === 'function') {
          subpanelLab.style.setProperty('display', 'none', 'important');
        } else {
          subpanelLab.style.display = 'none';
        }
      }
      if (fabContainer && fabContainer.style) {
        if (typeof fabContainer.style.removeProperty === 'function') {
          fabContainer.style.removeProperty('display');
        }
        fabContainer.style.display = 'flex';
      }
      document.querySelectorAll('.box-fab-container').forEach(el => {
        if (el && el.style && typeof el.style.removeProperty === 'function') {
          el.style.removeProperty('display');
        }
      });
      if (desktopLabBtn) desktopLabBtn.classList.remove('active');
      const boxSidebar = document.getElementById('box-filter-sidebar');
      const boxBookmarkHandle = document.getElementById('box-sidebar-bookmark-handle');
      if (boxSidebar) {
        boxSidebar.style.display = 'flex';
      }
      if (boxBookmarkHandle && boxBookmarkHandle.style) {
        if (typeof boxBookmarkHandle.style.removeProperty === 'function') {
          boxBookmarkHandle.style.removeProperty('display');
        }
        const isCollapsed = boxSidebar ? boxSidebar.classList.contains('collapsed') : true;
        if (isCollapsed) {
          boxBookmarkHandle.classList.remove('drawer-open');
          boxBookmarkHandle.style.display = 'flex';
          boxBookmarkHandle.style.opacity = '1';
          boxBookmarkHandle.style.pointerEvents = 'auto';
          boxBookmarkHandle.style.visibility = 'visible';
        }
      }
      document.querySelectorAll('#panel-box .sidebar-fab-btn, #panel-box .sidebar-bookmark-handle').forEach(el => {
        if (el && el.style && typeof el.style.removeProperty === 'function') {
          el.style.removeProperty('display');
        }
      });
      const labContainer = document.getElementById('appraisal-lab-container');
      if (labContainer && !subpanelLab) {
        labContainer.style.display = 'none';
      }
      renderBox();
    }
  }

  if (typeof window !== 'undefined') {
    window.switchBoxSubtab = switchBoxSubtab;
    window.getCurrentBoxSubtab = getSavedBoxSubtab;
    window.initUserBox = function (pokemons) {
      allPokemonsRef = pokemons || [];
      initBoxEvents();
      initBoxFilters();
      const boxPanel = typeof document !== 'undefined' && document.getElementById ? document.getElementById('panel-box') : null;
      const isBoxHidden = !!(boxPanel && boxPanel.style && boxPanel.style.display === 'none');
      if (isBoxHidden) return;
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      } else {
        renderBox();
      }
    };

    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });

    window.PokemonBoxApp = {
      showBoxConfirmModal,
      removeFromUserBox,
      upsertImportedPokemonToBox,
      makePokemonFingerprint: (typeof makePokemonFingerprint === 'function') ? makePokemonFingerprint : (typeof window !== 'undefined' && window.makePokemonFingerprint ? window.makePokemonFingerprint : null),
      getUserBox: () => userBox,
      setUserBox: (box, skipCloudPush = false) => {
        const sanitized = Array.isArray(box) ? box.map(sanitizeImportedPokemon).filter(Boolean) : [];
        userBox = sanitized;
        saveUserBox(skipCloudPush);
        renderBox();
      },
      sanitizeImportedPokemon: sanitizeImportedPokemon,
      renderBox: renderBox,
      syncBoxVisibility,
      setBoxUserForcedGuideVisible: (v) => { boxUserForcedGuideVisible = v; },
      renderBoxGrid,
      renderBoxCardIngSlot,
      getIngCountFromBase,
      getCurrentSubTab: getSavedBoxSubtab,
      switchSubTab: switchBoxSubtab,
      calculatePokemonPR,
      getMainSkillMaxLevel,
      getEffectiveSkillLevel,
      getPokemonEvolutionStage,
      getSubskillLevelBonus,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      openBoxEditModal,
      closeBoxEditModal,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      ensureTesseractLoaded,
      TESSERACT_CDN_URL,
      NATURE_DATA,
      NATURE_DICT,
      SUBSKILLS_DATA,
      getFilteredBox,
      initBoxFilters,
      toggleBoxSidebar,
      resetBoxFilters,
      getBoxFilterState,
      setBoxFilterState,
      findSimilarPokemonInBox,
      comparePokemonDetails,
      openPokemonConflictModal,
      closePokemonConflictModal,
      executePokemonOverwrite,
      getSortBy: () => sortBy,
      setSortBy: (s) => { sortBy = s; if (typeof renderBox === 'function') renderBox(); },
      toggleColumnSort: (col) => { sortBy = nextBoxSort(sortBy, col); if (typeof renderBox === 'function') renderBox(); return sortBy; },
      parseBoxSort,
      nextBoxSort,
      BOX_SORT_DEFAULT_DIR
    };
    window.UserBox = window.PokemonBoxApp;
    window.showBoxConfirmModal = showBoxConfirmModal;
    window.removeFromUserBox = removeFromUserBox;
    window.upsertImportedPokemonToBox = upsertImportedPokemonToBox;
    window.getMainSkillMaxLevel = getMainSkillMaxLevel;
  }

  if (typeof module !== 'undefined' && module.exports) {
    const sharedExports = (typeof window !== 'undefined' && window.PokemonBoxApp) ? window.PokemonBoxApp : {
      showBoxConfirmModal,
      removeFromUserBox,
      upsertImportedPokemonToBox,
      makePokemonFingerprint: (typeof makePokemonFingerprint === 'function') ? makePokemonFingerprint : null,
      getUserBox: () => userBox,
      setUserBox: (box) => {
        userBox = Array.isArray(box) ? box.map(sanitizeImportedPokemon).filter(Boolean) : [];
      },
      sanitizeImportedPokemon: sanitizeImportedPokemon,
      renderBox: renderBox,
      syncBoxVisibility,
      setBoxUserForcedGuideVisible: (v) => { boxUserForcedGuideVisible = v; },
      renderBoxGrid,
      renderBoxCardIngSlot,
      getIngCountFromBase,
      calculatePokemonPR,
      getMainSkillMaxLevel,
      getEffectiveSkillLevel,
      getPokemonEvolutionStage,
      getSubskillLevelBonus,
      updateRibbonSelectOptions,
      updateModalMainSkill,
      deduceRibbonFromCarry,
      initPokemonCombobox,
      setAllPokemons: (p) => { allPokemonsRef = p || []; },
      buildOcrCompositeCanvas,
      parsePokemonFromOcr,
      parsePokemonScreenshotWithWorker,
      ensureTesseractLoaded,
      TESSERACT_CDN_URL,
      NATURE_DATA,
      NATURE_DICT: (function() { const d = {}; NATURE_DATA.forEach(n => { d[n.name] = n; }); return d; })(),
      SUBSKILLS_DATA,
      getFilteredBox,
      initBoxFilters,
      toggleBoxSidebar,
      resetBoxFilters,
      getBoxFilterState,
      setBoxFilterState,
      findSimilarPokemonInBox,
      comparePokemonDetails,
      openPokemonConflictModal,
      closePokemonConflictModal,
      executePokemonOverwrite,
      getSortBy: () => sortBy,
      setSortBy: (s) => { sortBy = s; if (typeof renderBox === 'function') renderBox(); },
      toggleColumnSort: (col) => { sortBy = nextBoxSort(sortBy, col); if (typeof renderBox === 'function') renderBox(); return sortBy; },
      parseBoxSort, nextBoxSort, BOX_SORT_DEFAULT_DIR
    };
    module.exports = { PokemonBoxApp: sharedExports, ...sharedExports };
  }
})();
