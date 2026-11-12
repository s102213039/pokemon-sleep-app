    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;

    const isEdit = !!existingItem;
    const titleEl = document.getElementById('box-modal-title');
    if (titleEl) {
      titleEl.textContent = isEdit 
        ? _tBox('編輯寶可夢', 'Edit Pokémon') 
        : (screenshotSrc ? _tBox('截圖辨識確認入庫', 'Confirm OCR Entry') : _tBox('手動新增寶可夢', 'Add Pokémon'));
    }

    // 填寫預設值
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    form.setAttribute('data-editing-uid', isEdit ? existingItem.uid : '');

    // 截圖預覽區
    const previewContainer = document.getElementById('box-modal-screenshot-preview');
    if (previewContainer) {
      if (screenshotSrc) {
        previewContainer.innerHTML = `
          <div class="box-screenshot-preview-wrap">
            <span class="box-screenshot-preview-tag">${_tBox('原始截圖對照', 'Original Screenshot')}</span>
            <img src="${screenshotSrc}" alt="Screenshot" class="box-screenshot-img">
          </div>
        `;
        previewContainer.style.display = 'block';
      } else {
        previewContainer.innerHTML = '';
        previewContainer.style.display = 'none';
      }
    }

    // 1. 初始化寶可夢 Combobox 搜尋選擇器
    initPokemonCombobox(existingItem);

    // 2. 等級 (手動新增不給預設值)
    const levelInput = document.getElementById('modal-poke-level');
    if (levelInput) levelInput.value = existingItem ? (existingItem.level || '') : '';

    // 3. 暱稱
    const nickInput = document.getElementById('modal-poke-nickname');
    if (nickInput) nickInput.value = existingItem ? (existingItem.nickname || '') : '';

    // 4. 性格選單
    const natureSelect = document.getElementById('modal-poke-nature');
    if (natureSelect) {
      natureSelect.innerHTML = NATURE_DATA.map(n => {
        const natDisplayName = window.I18N ? window.I18N.getNatureName(n.name) : n.name;
        const buffLabel = _tBox(n.buff, n.buff_en || n.buff);
        const debuffLabel = _tBox(n.debuff, n.debuff_en || n.debuff);
        return `
        <option value="${n.name}" ${existingItem && existingItem.nature === n.name ? 'selected' : (n.name === '固執' && !existingItem ? 'selected' : '')}>
          ${natDisplayName} (${buffLabel}${debuffLabel ? ' / ' + debuffLabel : ''})
        </option>
      `;}).join('');

      if (typeof window.setupCustomSelect === 'function' && !natureSelect._customized) {
        window.setupCustomSelect(natureSelect);
      } else if (natureSelect._customized) {
        natureSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.1 淨白薄荷核取方塊
    const mintCheck = document.getElementById('modal-poke-mint');
    if (mintCheck) {
      mintCheck.checked = !!(existingItem && (existingItem.cleanseMint || existingItem.mint));
    }

    // 4.5 睡飽飽獎章選單 (依據選取寶可夢更新動態文案)
    const currentSelectedPkm = existingItem 
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name) 
      : null;
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (ribbonSelect) {
      ribbonSelect.value = String(existingItem && existingItem.ribbon != null ? existingItem.ribbon : '0');
      updateRibbonSelectOptions(currentSelectedPkm);
      if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
        window.setupCustomSelect(ribbonSelect);
      } else if (ribbonSelect._customized) {
        ribbonSelect.dispatchEvent(new Event('sync-ui'));
      }
    }

    // 4.6 主技能展示與技能等級選單 (依據該主技能上限動態生成 Lv.1 ~ Lv.max)
    let initialSkillLevel;
    if (existingItem) {
      initialSkillLevel = getEffectiveSkillLevel(existingItem, currentSelectedPkm);
    } else if (currentSelectedPkm) {
      initialSkillLevel = getEffectiveSkillLevel({ level: 30, subskills: [] }, currentSelectedPkm);
    } else {
      initialSkillLevel = 1;
    }
    updateModalMainSkill(currentSelectedPkm, initialSkillLevel);

    // 5. 初始化副技能單行插槽 + 選擇盤
    initSubskillFlowPicker(existingItem ? existingItem.subskills : []);

    const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
    if (dialog && dialog.classList) {
      if (screenshotSrc) {
        dialog.classList.add('has-screenshot');
      } else {
        dialog.classList.remove('has-screenshot');
      }
    }

    const modalBody = modal.querySelector ? modal.querySelector('.box-modal-body') : null;
    if (modalBody) modalBody.scrollTop = 0;

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
  }

  function closeBoxEditModal() {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;
    const done = () => {
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
      const dialog = modal.querySelector ? modal.querySelector('.box-modal-dialog') : null;
      if (dialog && dialog.classList) dialog.classList.remove('has-screenshot');
      if (window.AppraisalLab && typeof window.AppraisalLab.reopenAfterEdit === 'function') {
        window.AppraisalLab.reopenAfterEdit();
      }
    };
    if (typeof window.animateOverlayClose === 'function') window.animateOverlayClose(modal, done);
    else { modal.style.display = 'none'; done(); }
  }

  /* ─── 儲存編輯表單 ─────────────────────────────────────── */
  function handleFormSave(e) {
    e.preventDefault();
    const form = document.getElementById('box-edit-form');
    if (!form) return;

    const editingUid = form.getAttribute('data-editing-uid');
    const nameSelect = document.getElementById('modal-poke-name');
    const levelInput = document.getElementById('modal-poke-level');
    const nickInput = document.getElementById('modal-poke-nickname');
    const natureSelect = document.getElementById('modal-poke-nature');
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');
    const ing1Select = document.getElementById('modal-ing1');
    const ing2Select = document.getElementById('modal-ing2');
    const ing3Select = document.getElementById('modal-ing3');

    const pokeName = nameSelect ? nameSelect.value : '';
    if (!pokeName) {
      if (typeof showBoxToast === 'function') {
        showBoxToast(_tBox('提示', 'Notice'), _tBox('請選擇寶可夢！', 'Please select a Pokémon.'), 'warning');
      }
      document.getElementById('modal-poke-search')?.focus();
      return;
    }

    const parsedLevel = parseInt(levelInput ? levelInput.value : '', 10);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 100) {
      if (typeof showBoxToast === 'function') {
        showBoxToast(_tBox('提示', 'Notice'), _tBox('請輸入有效的等級 (1 ~ 100)！', 'Please enter a valid level (1 ~ 100).'), 'warning');
      }
      levelInput?.focus();
      return;
    }

    const base = findPokemonBase(pokeName);
    const maxSkillLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    const rawSkillLevel = skillLevelSelect ? (parseInt(skillLevelSelect.value, 10) || 1) : 1;

    const subskills = [];
    for (let slot = 1; slot <= 5; slot++) {
      const s = document.getElementById(`modal-subskill-${slot}`);
      if (s && s.value) subskills.push(s.value);
    }

    const effectiveFromForm = getEffectiveSkillLevel({
      level: parsedLevel,
      skillLevel: rawSkillLevel,
      subskills: subskills
    }, base);
    const parsedSkillLevel = Math.max(1, Math.min(maxSkillLvl, effectiveFromForm));

    const ribbonVal = ribbonSelect ? (parseInt(ribbonSelect.value, 10) || 0) : 0;
    const mintCheck = document.getElementById('modal-poke-mint');
    const isMintChecked = !!(mintCheck && mintCheck.checked);

    const itemData = {
      uid: editingUid || ('pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)),
      pokemonId: base ? base.id : '',
      name: pokeName,
      type: base ? base.type : '一般',
      specialty: base ? base.specialty : '樹果',
      level: parsedLevel,
      skillLevel: parsedSkillLevel,
      nickname: nickInput ? nickInput.value.trim() : '',
      nature: natureSelect ? natureSelect.value : '坦率',
      cleanseMint: isMintChecked,
      ribbon: ribbonVal,
      ing1: ing1Select ? ing1Select.value : '',
      ing2: ing2Select ? ing2Select.value : '',
      ing3: ing3Select ? ing3Select.value : '',
      subskills: subskills,
      createdAt: editingUid ? (userBox.find(p => p.uid === editingUid)?.createdAt || Date.now()) : Date.now()
    };

    if (editingUid) {
      const idx = userBox.findIndex(p => p.uid === editingUid);
      if (idx !== -1) userBox[idx] = itemData;
    } else {
      userBox.unshift(itemData);
    }

    saveUserBox();
    closeBoxEditModal();
    renderBox();
  }

  /* ─── 截圖辨識相似寶可夢比對與覆蓋確認彈窗 ───────────────────────── */
  function findSimilarPokemonInBox(parsed, customList) {
    const list = customList || (typeof userBox !== 'undefined' ? userBox : []);
    if (!parsed || (!parsed.name && !parsed.pokemonId && !parsed.pkmId) || !list || list.length === 0) return null;
    const pkmName = (parsed.name || '').trim();
    const pkmId = parsed.pokemonId || parsed.pkmId;

    // 1. 同一寶可夢品種候選池 (Same Species Candidates)
    const candidates = list.filter(p => {
      if (!p) return false;
      const cName = (p.name || '').trim();
      const cId = p.pokemonId || p.pkmId;
      const isSameSpecies = (pkmName && cName && cName === pkmName) ||
                            (pkmId && cId && String(cId) === String(pkmId));
      if (!isSameSpecies) return false;

      // Nature must match if both are specified
      if (parsed.nature && p.nature && parsed.nature.trim() !== p.nature.trim()) {
        return false;
      }
      return true;
    });

    if (candidates.length === 0) return null;

    // 2. 計算相似度權重分數 (Similarity Score)
    let bestCandidate = null;
    let maxScore = -1;

    candidates.forEach(cand => {
      // Subskills compatibility check
      const parsedSks = parsed.subskills || [];
      const candSks = cand.subskills || [];
      const minSlot = Math.min(parsedSks.length, candSks.length);
      for (let s = 0; s < minSlot; s++) {
        if (parsedSks[s] && candSks[s] && parsedSks[s] !== candSks[s]) return;
      }

      // Ingredients compatibility check
      const pIng1 = parsed.ing1 || (parsed.ingredients && parsed.ingredients[0]);
      const pIng2 = parsed.ing2 || (parsed.ingredients && parsed.ingredients[1]);
      const pIng3 = parsed.ing3 || (parsed.ingredients && parsed.ingredients[2]);
      const cIng1 = cand.ing1 || (cand.ingredients && cand.ingredients[0]);
      const cIng2 = cand.ing2 || (cand.ingredients && cand.ingredients[1]);
      const cIng3 = cand.ing3 || (cand.ingredients && cand.ingredients[2]);

      if (pIng1 && cIng1 && pIng1 !== cIng1) return;
      if (pIng2 && cIng2 && pIng2 !== cIng2) return;
      if (pIng3 && cIng3 && pIng3 !== cIng3) return;

      let score = 20; // 同品種基準分

      // (a) 性格一致 (性格是先天固定屬性)
      if (parsed.nature && cand.nature && parsed.nature === cand.nature) {
        score += 35;
      }

      // (b) 食材組合一致性 (比對 Lv.1, Lv.30, Lv.60)
      let ingMatchCount = 0;
      if (pIng1 && cIng1 && pIng1 === cIng1) ingMatchCount++;
      if (pIng2 && cIng2 && pIng2 === cIng2) ingMatchCount++;
      if (pIng3 && cIng3 && pIng3 === cIng3) ingMatchCount++;
      score += ingMatchCount * 12; // 最高 +36

      // (c) 副技能交集 (副技能是先天固定的)
      const candSkSet = new Set(candSks.filter(Boolean));
      let skMatchCount = 0;
      parsedSks.forEach(sk => {
        if (sk && candSkSet.has(sk)) skMatchCount++;
      });
      score += skMatchCount * 10; // 最高 +50

      // (d) 暱稱相符加分
      if (parsed.nickname && cand.nickname && parsed.nickname === cand.nickname) {
        score += 20;
      }

      // (e) 等級合理性 (新等級 >= 舊等級，或等級相差不超過 10)
      const oldLvl = Number(cand.level) || 1;
      const newLvl = Number(parsed.level) || 1;
      if (newLvl >= oldLvl) {
        score += 10;
      } else if (Math.abs(newLvl - oldLvl) <= 10) {
        score += 5;
      }

      if (score > maxScore) {
        maxScore = score;
        bestCandidate = cand;
      }
    });

    const threshold = (candidates.length === 1) ? 35 : 45;
    if (bestCandidate && maxScore >= threshold) {
      return bestCandidate;
    }
    return null;
  }

  function comparePokemonDetails(existing, parsed) {
    const comparisons = [];

    // 1. 等級
    const oldLevel = Number(existing.level) || 1;
    const newLevel = Number(parsed.level) || oldLevel;
    comparisons.push({
      field: 'level',
      label: _tBox('等級', 'Level'),
      isSame: oldLevel === newLevel,
      oldHtml: `Lv.${oldLevel}`,
      newHtml: `Lv.${newLevel}`
    });

    // 2. 暱稱
    const oldNick = existing.nickname ? existing.nickname.trim() : '';
    const newNick = parsed.nickname ? parsed.nickname.trim() : '';
    const isNickSame = !newNick || (oldNick === newNick);
    comparisons.push({
      field: 'nickname',
      label: _tBox('自訂暱稱', 'Nickname'),
      isSame: isNickSame,
      oldHtml: oldNick ? escapeHtml(oldNick) : `<span style="color:var(--text-muted);">${_tBox('未設定', 'None')}</span>`,
      newHtml: newNick ? escapeHtml(newNick) : (oldNick ? `<span style="color:var(--text-muted);">${_tBox('(維持原暱稱：' + escapeHtml(oldNick) + ')', '(Retain: ' + escapeHtml(oldNick) + ')')}</span>` : `<span style="color:var(--text-muted);">${_tBox('未設定', 'None')}</span>`)
    });

    // 3. 主技能等級
    const oldSkillLvl = Number(existing.skillLevel || existing.mainSkillLevel) || 1;
    const newSkillLvl = Number(parsed.skillLevel || parsed.mainSkillLevel) || oldSkillLvl;
    comparisons.push({
      field: 'skillLevel',
      label: _tBox('主技能等級', 'Main Skill Level'),
      isSame: oldSkillLvl === newSkillLvl,
      oldHtml: `Lv.${oldSkillLvl}`,
      newHtml: `Lv.${newSkillLvl}`
    });

    // 4. 性格
    const oldNat = existing.nature || '坦率';
    const newNat = parsed.nature || oldNat;
    const oldNatName = (window.I18N && typeof window.I18N.getNatureName === 'function') ? window.I18N.getNatureName(oldNat) : oldNat;
    const newNatName = (window.I18N && typeof window.I18N.getNatureName === 'function') ? window.I18N.getNatureName(newNat) : newNat;
    comparisons.push({
      field: 'nature',
      label: _tBox('性格', 'Nature'),
      isSame: oldNat === newNat,
      oldHtml: escapeHtml(oldNatName),
      newHtml: escapeHtml(newNatName)
    });

    // 5. 淨白薄荷
    const oldMint = !!(existing.cleanseMint || existing.mint);
    const newMint = !!(parsed.cleanseMint || parsed.useMint);
    comparisons.push({
      field: 'cleanseMint',
      label: _tBox('淨白薄荷', 'Cleanse Mint'),
      isSame: oldMint === newMint,
      oldHtml: oldMint ? _tBox('已消除效果', 'Used') : _tBox('未消除', 'None'),
      newHtml: newMint ? _tBox('已消除效果', 'Used') : _tBox('未消除', 'None')
    });

    // 6. 睡飽飽獎章
    const oldRibbon = Number(existing.ribbon) || 0;
    const newRibbon = (parsed.ribbon !== undefined) ? (Number(parsed.ribbon) || 0) : oldRibbon;
    const getRibbonLabel = (val) => {
      if (val === 1) return _tBox('200 小時 (+1 上限)', '200h (+1 Carry)');
      if (val === 2) return _tBox('500 小時 (+3 上限 · 幫速)', '500h (+3 Carry · Speed)');
      if (val === 3) return _tBox('1000 小時 (+6 上限)', '1000h (+6 Carry)');
      if (val === 4) return _tBox('2000 小時 (+8 上限 · 最大幫速)', '2000h (+8 Carry · Max)');
      return _tBox('未佩戴 (0h)', 'None (0h)');
    };
    comparisons.push({
      field: 'ribbon',
      label: _tBox('睡飽飽獎章', 'Good-Night Ribbon'),
      isSame: oldRibbon === newRibbon,
      oldHtml: getRibbonLabel(oldRibbon),
      newHtml: getRibbonLabel(newRibbon)
    });

    // 7. 食材組合
    const formatIngCombo = (item) => {
      const p1 = item.ing1 || '-';
      const p2 = item.ing2 || '-';
      const p3 = item.ing3 || '-';
      return `${p1} / ${p2} / ${p3}`;
    };
    const oldIngs = formatIngCombo(existing);
    const newIngs = formatIngCombo(parsed);
    comparisons.push({
      field: 'ingredients',
      label: _tBox('食材組合 (Lv1/30/60)', 'Ingredients (Lv1/30/60)'),
      isSame: (existing.ing1 === parsed.ing1 && existing.ing2 === parsed.ing2 && existing.ing3 === parsed.ing3),
      oldHtml: escapeHtml(oldIngs),
      newHtml: escapeHtml(newIngs)
    });

    // 8. 副技能組合
    const oldSks = (existing.subskills || []).slice(0, 5);
    const newSks = (parsed.subskills || []).slice(0, 5);
    const isSksSame = (oldSks.length === newSks.length) && oldSks.every((sk, i) => sk === newSks[i]);
    const formatSks = (sks) => {
      if (!sks || sks.length === 0) return _tBox('無', 'None');
      return sks.map(s => {
        const sName = (window.I18N && typeof window.I18N.getSubskillName === 'function') ? window.I18N.getSubskillName(s) : s;
        return escapeHtml(sName);
      }).join('、');
    };
    comparisons.push({
      field: 'subskills',
      label: _tBox('副技能組合', 'Sub-Skills'),
      isSame: isSksSame,
      oldHtml: formatSks(oldSks),
      newHtml: formatSks(newSks)
    });

    return comparisons;
  }

  function openPokemonConflictModal(parsedData, existingCandidate, imgSrc) {
    if (typeof document === 'undefined') return;
    let modal = document.getElementById('box-conflict-modal');
    if (!modal) return;

    const base = findPokemonBase(existingCandidate.pokemonId || existingCandidate.name);
    const pkmDisplayName = _tBox(existingCandidate.name || (base ? base.name_cn : ''), ((base && base.name_en) || existingCandidate.name));
    const candidateDisplayName = existingCandidate.nickname ? `${pkmDisplayName} (${existingCandidate.nickname})` : pkmDisplayName;
    const iconUrl = (base && window.getItemIcon) ? window.getItemIcon(base) : (base ? base.icon : '');

    const comparisons = comparePokemonDetails(existingCandidate, parsedData);
    const diffItems = comparisons.filter(c => !c.isSame);
    const sameItems = comparisons.filter(c => c.isSame);

    // Summary banner
    const summaryEl = document.getElementById('box-conflict-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div class="box-conflict-summary-pkm">
          ${iconUrl ? `<img src="${iconUrl}" class="box-conflict-pkm-icon" alt="" loading="lazy">` : ''}
          <div class="box-conflict-pkm-names">
            <div class="box-conflict-pkm-main">${escapeHtml(candidateDisplayName)}</div>
            <div class="box-conflict-pkm-sub">UID: ${existingCandidate.uid ? existingCandidate.uid.slice(-8) : ''} · ${_tBox('現有 Lv.' + (existingCandidate.level || 1), 'Lv.' + (existingCandidate.level || 1))}</div>
          </div>
        </div>
        <div class="box-conflict-pills">
          <span class="conflict-badge-diff">${diffItems.length} ${_tBox('項更新', 'Updates')}</span>
          <span class="conflict-badge-same">${sameItems.length} ${_tBox('項相同', 'Same')}</span>
        </div>
      `;
    }

    // Comparison rows list
    const listEl = document.getElementById('box-conflict-list');
    if (listEl) {
      listEl.innerHTML = comparisons.map(item => `
        <div class="box-conflict-row ${item.isSame ? 'is-same' : 'is-diff'}">
          <div class="conflict-row-field">
            <span class="conflict-field-name">${item.label}</span>
            <span class="conflict-status-tag ${item.isSame ? 'tag-same' : 'tag-diff'}">${item.isSame ? _tBox('相同', 'Same') : _tBox('已更新', 'Updated')}</span>
          </div>
          <div class="conflict-values-grid">
            <div class="conflict-val-col col-existing">
              <span class="conflict-val-label">${_tBox('倉庫現有', 'In Box')}</span>
              <div class="conflict-val-content">${item.oldHtml}</div>
            </div>
            <div class="conflict-val-arrow">→</div>
            <div class="conflict-val-col col-parsed">
              <span class="conflict-val-label">${_tBox('截圖新值', 'New Screenshot')}</span>
              <div class="conflict-val-content">${item.newHtml}</div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Bind action buttons
    const overwriteBtn = document.getElementById('box-conflict-overwrite-btn');
    if (overwriteBtn) {
      overwriteBtn.onclick = () => {
        executePokemonOverwrite(parsedData, existingCandidate);
      };
    }

    const saveNewBtn = document.getElementById('box-conflict-savenew-btn');
    if (saveNewBtn) {
      saveNewBtn.onclick = () => {
        closePokemonConflictModal();
        openBoxEditModal(parsedData, imgSrc);
      };
    }

    const cancelBtn = document.getElementById('box-conflict-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        closePokemonConflictModal();
      };
    }

    modal.onclick = (e) => {
      if (e.target === modal) closePokemonConflictModal();
    };

    if (typeof window.prepareOverlayOpen === 'function') window.prepareOverlayOpen(modal);
    modal.style.display = 'flex';
    if (document.body && document.body.classList && typeof document.body.classList.add === 'function') {
      document.body.classList.add('modal-open');
    }
    if (typeof window.portalMobileOverlays === 'function') window.portalMobileOverlays(modal);
  }

  function closePokemonConflictModal() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('box-conflict-modal');
    if (!modal) return;
    const done = () => {
      if (document.body && document.body.classList && typeof document.body.classList.remove === 'function') {
        document.body.classList.remove('modal-open');
      }
      if (typeof window.syncOverlayOpenState === 'function') window.syncOverlayOpenState();
    };
    if (typeof window.animateOverlayClose === 'function') {
      window.animateOverlayClose(modal, done);
    } else {
      modal.style.display = 'none';
      done();
    }
  }

  function executePokemonOverwrite(parsedData, existingCandidate) {
    const idx = userBox.findIndex(p => p.uid === existingCandidate.uid);
    if (idx === -1) {
      closePokemonConflictModal();
      return;
    }

    // 更新各項數值
    if (parsedData.level != null) userBox[idx].level = Number(parsedData.level) || userBox[idx].level;
    if (parsedData.nature) userBox[idx].nature = parsedData.nature;
    if (parsedData.cleanseMint !== undefined) userBox[idx].cleanseMint = !!parsedData.cleanseMint;
    if (parsedData.useMint !== undefined) userBox[idx].cleanseMint = !!parsedData.useMint;
    if (parsedData.ribbon !== undefined) userBox[idx].ribbon = Number(parsedData.ribbon) || 0;
    if (parsedData.skillLevel !== undefined) userBox[idx].skillLevel = Number(parsedData.skillLevel) || userBox[idx].skillLevel;
    if (parsedData.mainSkillLevel !== undefined) userBox[idx].skillLevel = Number(parsedData.mainSkillLevel) || userBox[idx].skillLevel;
    if (parsedData.ing1) userBox[idx].ing1 = parsedData.ing1;
    if (parsedData.ing2) userBox[idx].ing2 = parsedData.ing2;
    if (parsedData.ing3) userBox[idx].ing3 = parsedData.ing3;
    if (parsedData.subskills && parsedData.subskills.length > 0) {
      userBox[idx].subskills = parsedData.subskills.slice();
    }
    // 只有在截圖確實有辨識出自訂暱稱時才覆蓋，否則保留原有暱稱
    if (parsedData.nickname && parsedData.nickname.trim()) {
      userBox[idx].nickname = parsedData.nickname.trim();
    }
    userBox[idx].updatedAt = Date.now();

    saveUserBox();
    renderBox();
    closePokemonConflictModal();

    const pkmName = _tBox(existingCandidate.name || '寶可夢', (existingCandidate.name_en || existingCandidate.name) || 'Pokémon');
    const displayName = userBox[idx].nickname ? `${pkmName} (${userBox[idx].nickname})` : pkmName;
    showBoxToast(
      _tBox('寶可夢覆蓋更新成功！', 'Pokémon Overwritten & Updated'),
      _tBox(`已成功將「${displayName}」覆蓋更新為最新截圖數據！`, `Successfully updated "${displayName}" with latest screenshot data.`),
      'success'
    );
  }

  /* ─── 截圖智能分析與 OCR 引擎 (支援單圖與多圖連續批次辨識) ───────────────────────── */
  function makePokemonFingerprint(p) {
    if (!p) return '';
    const sks = (p.subskills || []).slice().sort().join(',');
    const ing1 = p.ing1 || (p.ingredients && p.ingredients[0]) || '';
    const ing2 = p.ing2 || (p.ingredients && p.ingredients[1]) || '';
    const ing3 = p.ing3 || (p.ingredients && p.ingredients[2]) || '';
    const id = p.pokemonId || p.pkmId || p.name || '';
    return `${id}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${ing1}_${ing2}_${ing3}`;
  }

  if (typeof window !== 'undefined') {
    window.makePokemonFingerprint = makePokemonFingerprint;
    window.findSimilarPokemonInBox = findSimilarPokemonInBox;
    window.UserBox = window.UserBox || {};
    window.UserBox.makePokemonFingerprint = makePokemonFingerprint;
    window.UserBox.findSimilarPokemonInBox = findSimilarPokemonInBox;
  }

  async function handleScreenshotFiles(files) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      if (typeof showBoxToast === 'function') {
        showBoxToast(_tBox('提示', 'Notice'), _tBox('請上傳圖片檔案 (PNG, JPG, WebP)！', 'Please upload valid image files (PNG, JPG, WebP).'), 'warning');
      }
      return;
    }

    const scannerStatus = document.getElementById('box-scanner-status');

    // 1. 單張截圖流程 (智能相似寶可夢比對與確認)
    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      if (scannerStatus) {
        scannerStatus.style.display = 'flex';
        scannerStatus.innerHTML = `<span>${_tBox('正在智能解析截圖中，請稍候...', 'Analyzing screenshot with AI OCR, please wait...')}</span>`;
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        const imgSrc = e.target.result;
        try {
          const parsedData = await parsePokemonScreenshot(imgSrc);
          if (scannerStatus) scannerStatus.style.display = 'none';

          const similarExisting = findSimilarPokemonInBox(parsedData);
          if (similarExisting) {
            openPokemonConflictModal(parsedData, similarExisting, imgSrc);
          } else {
            openBoxEditModal(parsedData, imgSrc);
          }
        } catch (err) {
          console.error('Screenshot parse failed:', err);
          if (scannerStatus) scannerStatus.style.display = 'none';
          openBoxEditModal(null, imgSrc);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // 2. 多圖批次辨識入庫流程 (Batch OCR Multi-Import & Smart Deduplication)
    const total = imageFiles.length;
    let addedCount = 0;
    let upgradedCount = 0;
    let skippedCount = 0;
    const failedFiles = [];
    const addedNames = [];

    if (scannerStatus) {
      scannerStatus.style.display = 'flex';
      scannerStatus.innerHTML = `
        <div class="batch-ocr-progress-card">
          <div class="batch-ocr-header">
            <span class="batch-ocr-title">${_tBox('批次智能辨識入庫中...', 'Batch OCR Smart Ingestion...')}</span>
            <span id="batch-ocr-counter" class="batch-ocr-counter">0 / ${total}</span>
          </div>
          <div class="batch-ocr-bar-bg">
            <div id="batch-ocr-bar-fill" class="batch-ocr-bar-fill" style="width: 0%;"></div>
          </div>
          <div id="batch-ocr-status-text" class="batch-ocr-status-text">${_tBox('初始化 OCR 引擎中...', 'Initializing OCR engine...')}</div>
        </div>
      `;
    }

    let sharedWorker = null;
    try {
      await ensureTesseractLoaded();
      if (window.Tesseract) {
        sharedWorker = await window.Tesseract.createWorker('chi_tra+eng');
      }
    } catch (e) {
      console.warn('Could not initialize shared Tesseract worker:', e);
    }

    const upsertFn = (typeof upsertImportedPokemonToBox === 'function')
      ? upsertImportedPokemonToBox
      : (typeof window !== 'undefined' && window.UserBox && typeof window.UserBox.upsertImportedPokemonToBox === 'function'
          ? window.UserBox.upsertImportedPokemonToBox
          : null);

    for (let i = 0; i < total; i++) {
      const file = imageFiles[i];
      const statusText = document.getElementById('batch-ocr-status-text');
      const counterEl = document.getElementById('batch-ocr-counter');
      const barFill = document.getElementById('batch-ocr-bar-fill');

      if (statusText) statusText.textContent = _tBox(`正在辨識：${file.name} (${i + 1}/${total})...`, `Recognizing: ${file.name} (${i + 1}/${total})...`);
      if (counterEl) counterEl.textContent = `${i + 1} / ${total}`;
      if (barFill) barFill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;

      try {
        const imgSrc = await readFileAsDataURL(file);
        const parsed = await parsePokemonScreenshotWithWorker(imgSrc, sharedWorker);

        if (!parsed || (!parsed.name && !parsed.pokemonId && !parsed.pkmId)) {
          failedFiles.push(file.name);
          continue;
        }

        if (typeof upsertFn === 'function') {
          const res = upsertFn(parsed, userBox);
          if (res.status === 'added') {
            addedCount++;
            addedNames.push(parsed.name || _tBox('寶可夢', 'Pokémon'));
          } else if (res.status === 'upgraded') {
            upgradedCount++;
          } else if (res.status === 'skipped') {
            skippedCount++;
          }
        } else {
          parsed.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          parsed.createdAt = Date.now();
          userBox.push(parsed);
          addedCount++;
        }
      } catch (err) {
        console.error(`Error parsing file ${file.name}:`, err);
        failedFiles.push(file.name);
      }
    }

    if (sharedWorker) {
      try {
        await sharedWorker.terminate();
      } catch (e) {}
    }

    if (scannerStatus) {
      scannerStatus.style.display = 'none';
    }

    if (addedCount > 0 || upgradedCount > 0) {
      saveUserBox();
      renderBox();
    }

    // 彈出 Toast 通知 (全面統計：新增、升級、略過、失敗)
    let summary = _tBox(
      `成功入庫 ${addedCount} 隻，升級更新 ${upgradedCount} 隻，略過重複 ${skippedCount} 隻。`,
      `Successfully added ${addedCount}, upgraded ${upgradedCount}, skipped ${skippedCount} duplicates.`
    );
    if (failedFiles.length > 0) {
      summary += ' ' + _tBox(
        `失敗 ${failedFiles.length} 張（${failedFiles.join(', ')}）。`,
        `Failed ${failedFiles.length} images (${failedFiles.join(', ')}).`
      );
    }

    showBoxToast(
      _tBox('批次辨識入庫完成！', 'Batch OCR Import Complete!'),
      summary,
      (addedCount > 0 || upgradedCount > 0) ? 'success' : (failedFiles.length > 0 ? 'warning' : 'info')
    );
  }
