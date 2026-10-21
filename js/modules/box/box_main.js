  function showBoxToast(title, message, type = 'success') {
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
      return window.showToast(title, message, type);
    }
    if (typeof document === 'undefined') return;
    let container = document.getElementById('box-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'box-toast-container';
      container.className = 'box-toast-container';
      if (document.body) {
        document.body.appendChild(container);
      }
    }

    const toast = document.createElement('div');
    toast.className = `box-toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="box-toast-icon">[i]</div>
      <div class="box-toast-body">
        <div class="box-toast-title">${escapeHtml(title)}</div>
        <div class="box-toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="box-toast-close" onclick="this.parentElement && this.parentElement.remove()">✕</button>
    `;

    if (container && typeof container.appendChild === 'function') {
      container.appendChild(toast);
    }

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.add('toast-fadeout');
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
    return toast;
  }

  /* ─── 備份匯出與匯入 ─────────────────────────────────────── */
  function exportBoxJSON() {
    if (userBox.length === 0) {
      showBoxToast('匯出提醒', '倉庫內目前沒有任何寶可夢可匯出！', 'warning');
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

  function importBoxJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`確定要匯入 ${imported.length} 隻寶可夢嗎？（將合併至現有倉庫）`)) {
            const existingUids = new Set(userBox.map(p => p.uid));
            imported.forEach(item => {
              if (!item.uid || existingUids.has(item.uid)) {
                item.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
              }
              userBox.push(item);
            });
            saveUserBox();
            renderBox();
            showBoxToast('匯入成功', `成功匯入 ${imported.length} 隻寶可夢！`, 'success');
          }
        } else {
          showBoxToast('匯入失敗', '匯入檔案格式錯誤，請確認為正確的 JSON 備份檔！', 'warning');
        }
      } catch (err) {
        showBoxToast('解析失敗', '解析 JSON 備份檔案失敗：' + err.message, 'error');
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

  /* ─── 初始化事件監聽器 ───────────────────────────────────── */
  let boxEventsInitialized = false;
  function initBoxEvents() {
    loadUserBox();
    initBoxFilters();
    if (boxEventsInitialized) return;
    boxEventsInitialized = true;

    // 1. 拖曳上傳與截圖掃描
    const dropzone = document.getElementById('box-dropzone');
    const fileInput = document.getElementById('box-file-input');
    const manualBtn = document.getElementById('box-manual-add-btn');
    const exportBtn = document.getElementById('box-export-btn');
    const importInput = document.getElementById('box-import-input');

    const settingsExportBtn = document.getElementById('settings-export-box-btn');
    const settingsImportInput = document.getElementById('settings-import-box-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', (e) => {
        handleScreenshotFiles(e.target.files);
        fileInput.value = '';
      });

      // 拖曳事件
      ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.add('dragover');
        });
      });
      ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          dropzone.classList.remove('dragover');
        });
      });
      dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleScreenshotFiles(e.dataTransfer.files);
        }
      });
    }

    const uploadBtn = document.getElementById('box-upload-btn');
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => fileInput.click());
    }

    const toggleGuideBtn = document.getElementById('box-toggle-guide-btn');
    if (toggleGuideBtn) {
      toggleGuideBtn.addEventListener('click', () => {
        boxUserForcedGuideVisible = !boxUserForcedGuideVisible;
        syncBoxVisibility();
      });
    }

    // 全域剪貼簿貼上監聽 (Ctrl+V / Cmd+V 支援單張或多張截圖連續入庫)
    window.addEventListener('paste', (e) => {
      const panelBox = document.getElementById('panel-box');
      if (panelBox && panelBox.style.display !== 'none') {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        const imageBlobs = [];
        for (let index in items) {
          const item = items[index];
          if (item.kind === 'file' && item.type.startsWith('image/')) {
            imageBlobs.push(item.getAsFile());
          }
        }
        if (imageBlobs.length > 0) {
          handleScreenshotFiles(imageBlobs);
        }
      }
    });

    // 1.5 標準截圖指引卡片與 Lightbox 大圖彈窗
    const guideToggleBtn = document.getElementById('box-guide-toggle-btn');
    const guideBody = document.getElementById('box-guide-body');
    const guideThumbWrap = document.getElementById('box-guide-thumb-wrap');
    const guideLightbox = document.getElementById('box-guide-lightbox-modal');
    const guideLightboxClose = document.getElementById('box-guide-lightbox-close');

    if (guideToggleBtn && guideBody) {
      guideToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isCollapsed = guideBody.style.display === 'none';
        guideBody.style.display = isCollapsed ? 'flex' : 'none';
        guideToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'true' : 'false');
        const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
        guideToggleBtn.textContent = isCollapsed 
          ? (isEN ? 'Collapse' : '收合說明') 
          : (isEN ? 'Expand Guide' : '展開說明');
      });
    }

    if (guideThumbWrap && guideLightbox) {
      guideThumbWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(guideLightbox);
        guideLightbox.style.display = 'flex'; if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(guideLightbox);
      });
    }

    if (guideLightboxClose && guideLightbox) {
      guideLightboxClose.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
      });
    }

    if (guideLightbox) {
      guideLightbox.addEventListener('click', (e) => {
        if (e.target === guideLightbox) {
          if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(guideLightbox, () => { if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); });
        else { guideLightbox.style.display = 'none'; if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState(); }
        }
      });
    }

    if (manualBtn) {
      manualBtn.addEventListener('click', () => openBoxEditModal());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', exportBoxJSON);
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          importInput.value = '';
        }
      });
    }

    if (settingsExportBtn) {
      settingsExportBtn.addEventListener('click', exportBoxJSON);
    }

    if (settingsImportInput) {
      settingsImportInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBoxJSON(e.target.files[0]);
          settingsImportInput.value = '';
        }
      });
    }

    // 2. 編輯彈窗表單監聽
    const form = document.getElementById('box-edit-form');
    if (form) form.addEventListener('submit', handleFormSave);

    const closeBtn = document.getElementById('box-modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeBoxEditModal);

    const cancelBtn = document.getElementById('box-modal-cancel-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeBoxEditModal);

    const modal = document.getElementById('box-edit-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeBoxEditModal();
      });
    }

    // 3. 倉庫搜尋與一鍵清空
    const searchInput = document.getElementById('box-search-input');
    const boxSearchClear = document.getElementById('box-search-clear');

    function updateBoxClearBtn() {
      if (!searchInput) return;
      if (typeof window !== 'undefined' && typeof window.updateSearchInputHighlight === 'function') {
        window.updateSearchInputHighlight(searchInput, boxSearchClear);
      } else if (boxSearchClear) {
        boxSearchClear.style.display = searchInput.value.trim() ? 'flex' : 'none';
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        updateBoxClearBtn();
        renderBox();
      });

      if (boxSearchClear) {
        boxSearchClear.addEventListener('click', () => {
          searchInput.value = '';
          currentSearch = '';
          updateBoxClearBtn();
          searchInput.focus();
          renderBox();
        });
      }
    }

    const sortSelect = document.getElementById('box-sort-select');
    if (sortSelect) {
      if (typeof window.setupCustomSelect === 'function') {
        window.setupCustomSelect(sortSelect);
      }
      sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderBox();
      });
    }

    const boxContentArea = document.getElementById('box-content-area');
    if (boxContentArea) {
      boxContentArea.addEventListener('click', (e) => {
        const th = e.target.closest('th[data-sort]');
        if (!th) return;
        const col = th.dataset.sort || th.getAttribute('data-sort');
        if (!col) return;
        sortBy = nextBoxSort(sortBy, col);
        if (sortSelect) {
          const hasOpt = Array.from(sortSelect.options || []).some(o => o.value === sortBy);
          if (hasOpt) {
            sortSelect.value = sortBy;
            if (sortSelect.closest && sortSelect.closest('.custom-select-container')) {
              const trigger = sortSelect.closest('.custom-select-container').querySelector('.custom-select-trigger');
              const opt = sortSelect.options[sortSelect.selectedIndex];
              if (trigger && opt) trigger.textContent = opt.textContent;
            }
          }
        }
        renderBox();
      });
    }

    // 4. 視圖切換
    const toggleGridBtn = document.getElementById('box-toggle-grid');
    const toggleTableBtn = document.getElementById('box-toggle-table');
    if (toggleGridBtn && toggleTableBtn) {
      toggleGridBtn.addEventListener('click', () => {
        boxViewMode = 'grid';
        toggleGridBtn.classList.add('active');
        toggleTableBtn.classList.remove('active');
        renderBox();
      });
      toggleTableBtn.addEventListener('click', () => {
        boxViewMode = 'table';
        toggleTableBtn.classList.add('active');
        toggleGridBtn.classList.remove('active');
        renderBox();
      });
    }

    // 5. 頂部 Segmented 子分頁切換 (寶可夢倉庫 vs 深度評測室)
    const subtabList = document.getElementById('box-subtab-list');
    const subtabLab = document.getElementById('box-subtab-lab');

    if (subtabList) subtabList.addEventListener('click', () => switchBoxSubtab('list'));
    if (subtabLab) subtabLab.addEventListener('click', () => switchBoxSubtab('lab'));

    try {
      const initialSubtab = getSavedBoxSubtab();
      if (initialSubtab === 'lab') {
        switchBoxSubtab('lab');
      }
    } catch (e) {}

    // 6. 雲端同步監聽與回調綁定 (Supabase CloudSync)
    if (typeof window !== 'undefined' && window.CloudSync) {
      let lastReceivedBoxHash = '';
      window.CloudSync.onRemoteUpdate((remoteBox) => {
        const newHash = JSON.stringify(remoteBox || []);
        let currentLocalHash = '';
        try {
          currentLocalHash = localStorage.getItem(STORAGE_KEY) || '[]';
        } catch (e) {}

        // 若雲端推送的內容與目前本地完全一樣，或與上次接收的完全一樣，直接略過，不重複渲染亦不彈出 Toast
        if (newHash === currentLocalHash || newHash === lastReceivedBoxHash) {
          return;
        }
        lastReceivedBoxHash = newHash;

        userBox = Array.isArray(remoteBox) ? remoteBox : [];
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, newHash);
          }
        } catch (e) {}
        renderBox();
        if (window.AppraisalLab && typeof window.AppraisalLab.updateBoxItems === 'function') {
          window.AppraisalLab.updateBoxItems();
        }
        showBoxToast('雲端同步成功', '已從其他裝置即時同步最新寶可夢倉庫資料！', 'success');
      });

      window.CloudSync.onAuthStateChange(() => {
        loadUserBox();
        renderBox();
        if (window.AppraisalLab && typeof window.AppraisalLab.updateBoxItems === 'function') {
          window.AppraisalLab.updateBoxItems();
        }
      });
    }

    const cloudSyncBtns = document.querySelectorAll('.box-btn-cloud-sync, #box-cloud-sync-btn');
    cloudSyncBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.CloudSync && typeof window.CloudSync.openAuthModal === 'function') {
          window.CloudSync.openAuthModal();
        }
      });
    });
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
          subpanelList.style.setProperty('display', 'flex', 'important');
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
      getUserBox: () => userBox,
      setUserBox: (box, skipCloudPush = false) => { userBox = box; saveUserBox(skipCloudPush); renderBox(); },
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
      setSortBy: (s) => { sortBy = s; renderBox(); },
      toggleColumnSort: (col) => { sortBy = nextBoxSort(sortBy, col); renderBox(); return sortBy; },
      parseBoxSort,
      nextBoxSort,
      BOX_SORT_DEFAULT_DIR
    };
    window.UserBox = window.PokemonBoxApp;
  }

  if (typeof module !== 'undefined' && module.exports) {
    const NATURE_DICT = {};
    NATURE_DATA.forEach(n => { NATURE_DICT[n.name] = n; });
    module.exports = {
      PokemonBoxApp: typeof window !== 'undefined' ? window.PokemonBoxApp : {
        getUserBox: () => userBox,
        setUserBox: (box, skipCloudPush = false) => { userBox = box; saveUserBox(skipCloudPush); renderBox(); },
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
        setSortBy: (s) => { sortBy = s; renderBox(); },
        toggleColumnSort: (col) => { sortBy = nextBoxSort(sortBy, col); renderBox(); return sortBy; },
        parseBoxSort,
        nextBoxSort,
        BOX_SORT_DEFAULT_DIR
      },
      getUserBox: () => userBox,
      setUserBox: (box) => { userBox = Array.isArray(box) ? box : []; },
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
  }
})();
