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
      <button type="button" class="box-toast-close" onclick="this.parentElement && this.parentElement.remove()">&times;</button>
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

  /* ─── 非阻塞主題自訂確認彈窗 (Custom Themed Confirmation Modal) ─── */
  function showBoxConfirmModal(message, options = {}) {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') return resolve(true);
      let modal = document.getElementById('box-custom-confirm-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'box-custom-confirm-modal';
        modal.className = 'box-modal-backdrop modal-backdrop modal-overlay';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:10060;';
        document.body.appendChild(modal);
      }
      const title = options.title || ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_confirm_action') : undefined) ?? '確認操作');
      const confirmText = options.confirmText || ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_confirm') : undefined) ?? '確認');
      const cancelText = options.cancelText || ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_cancel') : undefined) ?? '取消');
      const isDanger = options.type === 'danger';
      modal.innerHTML = `
        <div class="box-modal-dialog modal-content" style="max-width:380px;width:90%;border-radius:16px;padding:24px 20px;text-align:center;box-sizing:border-box;margin:auto;background:var(--bg-card-solid, #1e293b);border:1px solid var(--border-color, rgba(255,255,255,0.1));box-shadow:var(--shadow-lg, 0 10px 25px rgba(0,0,0,0.5));">
          <div style="width:48px;height:48px;border-radius:50%;background:${isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)'};border:1.5px solid ${isDanger ? 'rgba(239, 68, 68, 0.35)' : 'rgba(59, 130, 246, 0.35)'};display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:${isDanger ? '#ef4444' : '#3b82f6'};">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <div style="font-size:16px;font-weight:700;color:var(--text-primary, #f8fafc);margin-bottom:8px;">${escapeHtml(title)}</div>
          <p style="font-size:13px;color:var(--text-secondary, #94a3b8);line-height:1.6;margin:10px 0 20px;word-break:break-word;">${escapeHtml(message)}</p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button type="button" id="box-confirm-cancel-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;background:var(--bg-card, #0f172a);border:1px solid var(--border-color, rgba(255,255,255,0.15));color:var(--text-secondary, #94a3b8);cursor:pointer;">${escapeHtml(cancelText)}</button>
            <button type="button" id="box-confirm-ok-btn" style="flex:1;padding:10px 14px;border-radius:8px;font-size:13px;font-weight:600;background:${isDanger ? '#ef4444' : 'var(--primary-color, #3b82f6)'};border:none;color:#ffffff;cursor:pointer;">${escapeHtml(confirmText)}</button>
          </div>
        </div>
      `;
      modal.style.display = 'flex';
      if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
      function cleanup(result) {
        modal.style.display = 'none';
        modal.innerHTML = '';
        if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
        resolve(result);
      }
      const okBtn = document.getElementById('box-confirm-ok-btn');
      const cancelBtn = document.getElementById('box-confirm-cancel-btn');
      if (okBtn) okBtn.onclick = (e) => { e.stopPropagation(); cleanup(true); };
      if (cancelBtn) cancelBtn.onclick = (e) => { e.stopPropagation(); cleanup(false); };
      modal.onclick = (e) => { if (e.target === modal) { e.stopPropagation(); cleanup(false); } };
    });
  }

  /* ─── 刪除寶可夢操作 (非阻塞自訂確認彈窗) ────────────────────────── */
  async function removeFromUserBox(boxId) {
    const item = userBox.find(p => (p && (p.uid === boxId || p.id === boxId)));
    if (!item) return false;
    const base = typeof findPokemonBase === 'function' ? findPokemonBase(item.pokemonId || item.name) : null;
    const rawName = (base && (base.name_cn || base.name_en)) || item.name || '';
    const pName = rawName
      ? ((window.I18N && typeof window.I18N.getPokemonName === 'function')
          ? window.I18N.getPokemonName(base || rawName) : (rawName || (base && base.name_en)))
      : ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_pokemon') : undefined) ?? '寶可夢');
    const confirmMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_confirm_delete_one', { name: pName }) : undefined) ?? `確定要從倉庫刪除「${pName}」嗎？`;
    const confirmed = await showBoxConfirmModal(confirmMsg, {
      title: (typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_confirm_delete_title') : undefined) ?? '確認刪除',
      confirmText: (typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_delete') : undefined) ?? '刪除',
      type: 'danger'
    });
    if (!confirmed) return false;
    const idx = userBox.indexOf(item);
    if (idx !== -1) {
      userBox.splice(idx, 1);
      saveUserBox();
      renderBox();
      showBoxToast(
        (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_delete_success_title') : undefined) ?? '刪除成功',
        (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_deleted_one', { name: pName }) : undefined) ?? `已刪除「${pName}」`,
        'info'
      );
      return true;
    }
    return false;
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
        guideToggleBtn.textContent = isCollapsed
          ? ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_guide_collapse') : undefined) ?? '收合說明')
          : ((typeof window !== 'undefined' ? window.I18N?.t?.('box.ui_guide_expand') : undefined) ?? '展開說明');
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
      let boxSearchTimer = null;
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        updateBoxClearBtn();
        if (boxSearchTimer) clearTimeout(boxSearchTimer);
        boxSearchTimer = setTimeout(() => {
          boxSearchTimer = null;
          renderBox();
        }, 90);
      });

      if (boxSearchClear) {
        boxSearchClear.addEventListener('click', () => {
          if (boxSearchTimer) { clearTimeout(boxSearchTimer); boxSearchTimer = null; }
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
        showBoxToast((typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_cloud_sync_title') : undefined) ?? '雲端同步成功', (typeof window !== 'undefined' ? window.I18N?.t?.('box.msg_cloud_sync_desc') : undefined) ?? '已從其他裝置即時同步最新寶可夢倉庫資料！', 'success');
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
