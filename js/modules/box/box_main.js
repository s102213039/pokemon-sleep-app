  /* ─── 多語言輔助函式 (zh-TW / zh-CN / en-US) ───────────────────── */
  function _tBox(zhTw, en) {
    const lang = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getLanguage === 'function')
      ? window.I18N.getLanguage()
      : 'zh-TW';
    if (lang === 'en-US') {
      return (en !== undefined) ? en : zhTw;
    }
    if (lang === 'zh-CN') {
      if (typeof window !== 'undefined' && window.I18N && typeof window.I18N.toSimplified === 'function') {
        return window.I18N.toSimplified(zhTw);
      }
      return zhTw;
    }
    return zhTw;
  }

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
      const title = options.title || _tBox('確認操作', 'Confirm Action');
      const confirmText = options.confirmText || _tBox('確認', 'Confirm');
      const cancelText = options.cancelText || _tBox('取消', 'Cancel');
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
    const pName = item.name || _tBox('寶可夢', 'Pokémon');
    const confirmMsg = _tBox(`確定要從倉庫刪除「${pName}」嗎？`, `Are you sure you want to delete "${pName}" from your Box?`);
    const confirmed = await showBoxConfirmModal(confirmMsg, {
      title: _tBox('確認刪除', 'Confirm Deletion'),
      confirmText: _tBox('刪除', 'Delete'),
      type: 'danger'
    });
    if (!confirmed) return false;
    const idx = userBox.indexOf(item);
    if (idx !== -1) {
      userBox.splice(idx, 1);
      saveUserBox();
      renderBox();
      showBoxToast(_tBox('刪除成功', 'Deleted Successfully'), _tBox(`已刪除「${pName}」`, `"${pName}" has been removed from Box`), 'info');
      return true;
    }
    return false;
  }

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
      showBoxToast(_tBox('匯出提醒', 'Export Notice'), _tBox('倉庫內目前沒有任何寶可夢可匯出！', 'Your Box is currently empty, nothing to export!'), 'warning');
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
            showBoxToast(_tBox('匯入超限', 'Import Limit Exceeded'), _tBox(`單次匯入不可超過 ${MAX_IMPORT_COUNT} 隻寶可夢！`, `Cannot import more than ${MAX_IMPORT_COUNT} Pokémon at once!`), 'warning');
            return;
          }
          const validItems = imported.map(sanitizeImportedPokemon).filter(Boolean);
          if (validItems.length === 0) {
            showBoxToast(_tBox('匯入失敗', 'Import Failed'), _tBox('無有效的寶可夢資料可匯入！', 'No valid Pokémon data to import!'), 'warning');
            return;
          }

          const confirmMsg = _tBox(
            `確定要匯入 ${validItems.length} 隻寶可夢嗎？（將合併至現有倉庫）`,
            `Import ${validItems.length} Pokémon? (They will be merged into your Box)`
          );
          const confirmed = await showBoxConfirmModal(confirmMsg, {
            title: _tBox('確認匯入', 'Confirm Import'),
            confirmText: _tBox('確認匯入', 'Confirm Import')
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

          const summaryMsg = _tBox(
            `匯入完成！新增 ${addedCount} 隻，升級更新 ${upgradedCount} 隻，略過重複 ${skippedCount} 隻。`,
            `Import complete! ${addedCount} added, ${upgradedCount} upgraded, ${skippedCount} duplicates skipped.`
          );
          showBoxToast(_tBox('匯入成功', 'Import Successful'), summaryMsg, 'success');
        } else {
          showBoxToast(_tBox('匯入失敗', 'Import Failed'), _tBox('匯入檔案格式錯誤，請確認為正確的 JSON 備份檔！', 'Invalid import file format. Please ensure it is a valid JSON backup file!'), 'warning');
        }
      } catch (err) {
        showBoxToast(_tBox('解析失敗', 'Parse Failed'), _tBox('解析 JSON 備份檔案失敗：', 'Failed to parse JSON backup file: ') + err.message, 'error');
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
        guideToggleBtn.textContent = isCollapsed 
          ? _tBox('收合說明', 'Collapse') 
          : _tBox('展開說明', 'Expand Guide');
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
        showBoxToast(_tBox('雲端同步成功', 'Cloud Sync Successful'), _tBox('已從其他裝置即時同步最新寶可夢倉庫資料！', 'Latest Pokémon Box data synchronized from other devices!'), 'success');
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
      _tBox,
      showBoxConfirmModal,
      removeFromUserBox,
      upsertImportedPokemonToBox,
      makePokemonFingerprint: (typeof makePokemonFingerprint === 'function') ? makePokemonFingerprint : (typeof window !== 'undefined' && window.makePokemonFingerprint ? window.makePokemonFingerprint : null),
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
    window._tBox = _tBox;
    window.showBoxConfirmModal = showBoxConfirmModal;
    window.removeFromUserBox = removeFromUserBox;
    window.upsertImportedPokemonToBox = upsertImportedPokemonToBox;
    window.getMainSkillMaxLevel = getMainSkillMaxLevel;
  }

  if (typeof module !== 'undefined' && module.exports) {
    const sharedExports = (typeof window !== 'undefined' && window.PokemonBoxApp) ? window.PokemonBoxApp : {
      _tBox,
      showBoxConfirmModal,
      removeFromUserBox,
      upsertImportedPokemonToBox,
      makePokemonFingerprint: (typeof makePokemonFingerprint === 'function') ? makePokemonFingerprint : null,
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
      parseBoxSort,
      nextBoxSort,
      BOX_SORT_DEFAULT_DIR
    };
    module.exports = {
      PokemonBoxApp: sharedExports,
      ...sharedExports
    };
  }
})();
