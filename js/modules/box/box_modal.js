  function bindCardActions(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    container.querySelectorAll('.btn-appraise').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            cleanseMint: !!(item.cleanseMint || item.mint),
            rawItem: item
          });
        }
      });
    });

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item) openBoxEditModal(item);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item) {
          openDeleteConfirmModal(item);
        }
      });
    });

    // 點擊表格整行開啟寶可夢深度診斷評測彈窗
    container.querySelectorAll('.box-table tbody tr[data-uid]').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', (e) => {
        if (e.target.closest('.box-action-btn') || e.target.closest('button')) return;
        const uid = row.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          if (typeof window.AppraisalLab.loadBoxItem === 'function') {
            window.AppraisalLab.loadBoxItem(item);
          }
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            cleanseMint: !!(item.cleanseMint || item.mint),
            rawItem: item
          });
        }
      });
    });

    // 點擊卡片開啟寶可夢深度診斷評測彈窗
    container.querySelectorAll('.box-card[data-uid]').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.box-card-actions') || e.target.closest('button')) return;
        const uid = card.getAttribute('data-uid');
        const item = userBox.find(p => p.uid === uid);
        if (item && window.AppraisalLab) {
          if (typeof window.AppraisalLab.loadBoxItem === 'function') {
            window.AppraisalLab.loadBoxItem(item);
          }
          const base = findPokemonBase(item.pokemonId || item.name);
          const prInfo = calculatePokemonPR(item, base);
          window.AppraisalLab.openModal({
            pkm: base,
            level: item.level || 30,
            nature: item.nature || '坦率',
            subskills: item.subskills || [],
            ingredients: [item.ing1, item.ing2, item.ing3],
            ribbon: item.ribbon || 0,
            nickname: item.nickname || '',
            summaryNote: (prInfo && prInfo.summaryNote) || '',
            cleanseMint: !!(item.cleanseMint || item.mint),
            rawItem: item
          });
        }
      });
    });
  }

  /* ─── 視覺化確認與編輯彈窗 ───────────────────────────────── */
  let activeSubskillSlot = 1; // 1 to 5

  /* ─── 睡飽飽獎章動態效果選單更新 (依據寶可夢進化形態不同動態調整) ── */
  function updateRibbonSelectOptions(p) {
    const ribbonSelect = document.getElementById('modal-poke-ribbon');
    if (!ribbonSelect) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    // 計算剩餘進化次數
    let remainingEvos = 0;
    if (p) {
      if (typeof window !== 'undefined' && window.AppraisalLab && typeof window.AppraisalLab.getRemainingEvolutions === 'function') {
        remainingEvos = window.AppraisalLab.getRemainingEvolutions(p);
      } else {
        const isFinal = p.is_final === '〇' || p.is_final === 'O' || p.is_final === 'o' || p.is_final === true || p.is_final === '1';
        remainingEvos = isFinal ? 0 : 1;
      }
    }

    // 記住當前選取值
    const currentVal = ribbonSelect.value || '0';

    const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ : '';
    let opt2Text = '';
    let opt3Text = isEN ? '1000 hrs (+6 Carry Limit)' : '1000 小時 (+6 持有上限)';
    let opt4Text = '';

    if (!p) {
      // 未選擇寶可夢時的通用預設文案
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed Boost)' : '500 小時 (+3 持有上限 · 幫速加成)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Max Speed Boost)' : '2000 小時 (+8 持有上限 · 幫速最大加成)';
    } else if (remainingEvos === 2) {
      // 尚可進化 2 次 (例如：小火龍、小貓怪、皮丘)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -11%)' : '500 小時 (+3 持有上限 · 幫速加成 -11%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -25%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -25%)';
    } else if (remainingEvos === 1) {
      // 尚可進化 1 次 (例如：火恐龍、勒克貓、皮卡丘、伊布)
      opt2Text = isEN ? '500 hrs (+3 Carry Limit · Speed -5%)' : '500 小時 (+3 持有上限 · 幫速加成 -5%)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit · Speed -12%)' : '2000 小時 (+8 持有上限 · 幫速最大加成 -12%)';
    } else {
      // 最終進化形或無法進化的寶可夢 (例如：噴火龍、倫琴貓、凱羅斯) -> 無幫速加成
      opt2Text = isEN ? '500 hrs (+3 Carry Limit)' : '500 小時 (+3 持有上限)';
      opt4Text = isEN ? '2000 hrs (+8 Carry Limit)' : '2000 小時 (+8 持有上限)';
    }

    const optionsData = [
      { val: '0', text: isEN ? 'None (0h)' : '未佩戴 (0h)', icon: '' },
      { val: '1', text: isEN ? '200 hrs (+1 Carry Limit)' : '200 小時 (+1 持有上限)', icon: `${base}assets/ribbons/ribbon_lv1.png` },
      { val: '2', text: opt2Text, icon: `${base}assets/ribbons/ribbon_lv2.png` },
      { val: '3', text: opt3Text, icon: `${base}assets/ribbons/ribbon_lv3.png` },
      { val: '4', text: opt4Text, icon: `${base}assets/ribbons/ribbon_lv4.png` }
    ];

    ribbonSelect.innerHTML = optionsData.map(o => `
      <option value="${o.val}" ${o.icon ? `data-icon="${o.icon}"` : ''} ${o.val === currentVal ? 'selected' : ''}>${o.text}</option>
    `).join('');

    ribbonSelect.value = currentVal;

    // 同步自訂下拉元件
    if (typeof window.setupCustomSelect === 'function' && !ribbonSelect._customized) {
      window.setupCustomSelect(ribbonSelect);
    } else if (ribbonSelect._customized) {
      ribbonSelect.dispatchEvent(new Event('sync-ui'));
    }
  }

  /* ─── 取得主技能的最大等級上限 (6 / 7 / 8) ─────────────────── */
  function getMainSkillMaxLevel(name) {
    if (!name) return 7;
    const clean = String(name).trim();

    // 1. 夢之碎片系列（夢之碎片獲取S、波導彈）：官方上限 Lv. 8
    if (clean.includes('夢之碎片') || clean.includes('波導彈') || clean.includes('Dream Shard') || clean.includes('Aura Sphere')) {
      return 8;
    }

    // 2. 能量填充 / 蓄力 / 夢魘 系列：官方上限 Lv. 7
    if (clean.includes('能量填充') || clean.includes('Charge Strength') || clean.includes('蓄力') || clean.includes('夢魘')) {
      return 7;
    }

    // 3. 食材系列（獲取、精選、怪力鉗、超幸運、正電、禮物）：官方上限 Lv. 7
    if (clean.includes('食材獲取') || clean.includes('食材精選') || clean.includes('Ingredient') || clean.includes('怪力钳') || clean.includes('超幸運') || clean.includes('正電') || clean.includes('禮物')) {
      return 7;
    }

    // 4. 料理鍋系列：料理強化為 Lv. 7，料理成功為 Lv. 6
    if (clean.includes('料理強化') || clean.includes('Cooking Power') || clean.includes('負電')) {
      return 7;
    }
    if (clean.includes('料理成功') || clean.includes('Extra Tasty')) {
      return 6;
    }

    // 5. 幫手系列：幫手支援為 Lv. 7，幫手加速（屬性）為 Lv. 6
    if (clean.includes('幫手支援') || clean.includes('Helper Support')) {
      return 7;
    }
    if (clean.includes('幫手加速') || clean.includes('Helper Boost')) {
      return 6;
    }

    // 6. 樹果遽增系列 / 領域系列：官方上限 Lv. 6
    if (clean.includes('樹果遽增') || clean.includes('Berry Burst') || clean.includes('畫皮') || clean.includes('流星群') || clean.includes('精神擊破') || clean.includes('樹果領域') || clean.includes('Psystrike')) {
      return 6;
    }

    // 7. 活力恢復系列（全體療癒、活力療癒、活力填充/充填、月光、新月祈禱、蹭蹭臉頰、治癒波動、樹果汁）：官方上限 Lv. 6
    if (clean.includes('活力') || clean.includes('療癒') || clean.includes('充填') || clean.includes('月光') || clean.includes('新月祈禱') || clean.includes('蹭蹭臉頰') || clean.includes('治癒波動') || clean.includes('樹果汁') || clean.includes('Energizing Cheer') || clean.includes('Energy for Everyone') || clean.includes('Charge Energy')) {
      return 6;
    }

    // 8. 料理輔助 / 揮指 / 變身 / 模仿：官方上限 Lv. 7
    if (clean.includes('料理輔助') || clean.includes('健美') || clean.includes('Bulk Up') || clean.includes('揮指') || clean.includes('十項全能') || clean.includes('Metronome') || clean.includes('變身') || clean.includes('模仿') || clean.includes('Transform') || clean.includes('Mimic')) {
      return 7;
    }

    // 9. 從 window.WikiDB 動態比對
    if (typeof window !== 'undefined' && window.WikiDB && Array.isArray(window.WikiDB.MAIN_SKILLS_DATA)) {
      const norm = clean.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '');
      const found = window.WikiDB.MAIN_SKILLS_DATA.find(s => s.name.replace(/[（(].*?[）)]/, '').replace(/\s+/g, '') === norm);
      if (found && found.maxLevel) return found.maxLevel;
    }

    return 7;
  }

  /* ─── 最終階段 3 階進化形態清單 (進化兩次，基礎主技能 +2) ─────── */
  const STAGE3_FINAL_NAMES = new Set([
    '妙蛙花', '噴火龍', '水箭龜', '巴大蝶', '雷丘', '皮可西', '胖可丁',
    '大食花', '隆隆岩', '耿鬼', '自爆磁怪', '幸福蛋', '波克基斯', '電龍',
    '快龍', '火爆獸', '大力鱷', '班基拉斯', '蜥蜴王', '火焰雞', '巨沼怪',
    '沙奈朵', '艾路雷朵', '請假王', '波士可多拉', '沙漠蜻蜓', '帝牙海獅',
    '暴飛龍', '土台龜', '烈焰猴', '帝王拿波', '倫琴貓', '鍬農炮蟲',
    '魔幻假面喵', '骨紋巨聲鱷', '狂歡浪舞鴨', '巴布土撥', '巨鍛匠',
    'Venusaur', 'Charizard', 'Blastoise', 'Butterfree', 'Raichu', 'Clefable', 'Wigglytuff',
    'Victreebel', 'Golem', 'Gengar', 'Magnezone', 'Blissey', 'Togekiss', 'Ampharos',
    'Dragonite', 'Typhlosion', 'Feraligatr', 'Tyranitar', 'Sceptile', 'Blaziken', 'Swampert',
    'Gardevoir', 'Gallade', 'Slaking', 'Aggron', 'Flygon', 'Walrein',
    'Salamence', 'Torterra', 'Infernape', 'Empoleon', 'Luxray', 'Vikavolt',
    'Meowscarada', 'Skeledirge', 'Quaquaval', 'Pawmot', 'Tinkaton'
  ]);

  /* ─── 取得寶可夢的進化階段 (1 基礎 / 2 一階進化 / 3 二階最終進化) ─── */
  function getPokemonEvolutionStage(pkm) {
    if (!pkm) return 1;
    const name = pkm.name_cn || (pkm.name && pkm.name.cn) || pkm.name_en || (pkm.name && pkm.name.en) || '';
    if (STAGE3_FINAL_NAMES.has(name)) return 3;
    if (pkm.evo_req && String(pkm.evo_req).trim()) {
      return 2;
    }
    return 1;
  }

  /* ─── 取得已解鎖副技能的主技能等級加成 (技能等級提升S/M) ────────── */
  function getSubskillLevelBonus(subskills, currentLv) {
    if (!Array.isArray(subskills) || subskills.length === 0) return 0;
    const thresholds = [10, 25, 50, 70, 80];
    let bonus = 0;
    subskills.forEach((sub, idx) => {
      const unlockLv = thresholds[idx] || 100;
      if ((currentLv || 1) >= unlockLv) {
        const name = typeof sub === 'string' ? sub : (sub && (sub.name || sub.name_cn) ? (sub.name || sub.name_cn) : '');
        if (name.includes('技能等級提升M') || name.includes('Skill Level Up M')) {
          bonus += 2;
        } else if (name.includes('技能等級提升S') || name.includes('Skill Level Up S')) {
          bonus += 1;
        }
      }
    });
    return bonus;
  }

  /* ─── 計算實際有效主技能等級 (結合進化次數基礎、副技能解鎖加成與自訂上限) ── */
  function getEffectiveSkillLevel(pkmOrBoxItem, basePkm) {
    const pkm = pkmOrBoxItem || {};
    const base = basePkm || (typeof findPokemonBase === 'function' ? findPokemonBase(pkm.name || pkm.name_cn || pkm.pokemonId) : null) || pkm;
    const currentLv = parseInt(pkm.level, 10) || 30;
    const stage = getPokemonEvolutionStage(base);
    const subskills = pkm.subskills || [];
    const subBonus = getSubskillLevelBonus(subskills, currentLv);
    const naturalLvl = stage + subBonus;

    const savedLvl = parseInt(pkm.skillLevel || pkm.skill_level || (pkm.rawItem && pkm.rawItem.skillLevel), 10);
    let effective = (!isNaN(savedLvl) && savedLvl > 0) ? savedLvl : naturalLvl;

    const maxLvl = base && base.main_skill ? getMainSkillMaxLevel(base.main_skill) : 8;
    return Math.min(maxLvl, Math.max(1, effective));
  }

  /* ─── 主技能展示與等級更新 (動態依技能上限調整 Lv.1 ~ Lv.max) ─── */
  function updateModalMainSkill(p, targetLevel = null) {
    const skillEl = document.getElementById('modal-poke-main-skill-name');
    const skillLevelSelect = document.getElementById('modal-poke-skill-level');

    const skillName = p ? (p.main_skill || '--') : '--';
    if (skillEl) {
      const displaySkillName = (typeof window !== 'undefined' && window.I18N && typeof window.I18N.getSkillName === 'function') 
        ? window.I18N.getSkillName(skillName) 
        : skillName;
      skillEl.textContent = displaySkillName;
      skillEl.setAttribute('title', skillName);
    }

    if (skillLevelSelect) {
      const maxLvl = p && p.main_skill ? getMainSkillMaxLevel(p.main_skill) : 7;
      let desiredLvl;
      if (targetLevel != null) {
        desiredLvl = parseInt(targetLevel, 10);
      } else {
        const cur = parseInt(skillLevelSelect.value, 10);
        if (!isNaN(cur) && cur > 0) {
          desiredLvl = cur;
        } else if (p) {
          desiredLvl = getEffectiveSkillLevel({ level: 30, subskills: [] }, p);
        } else {
          desiredLvl = 1;
        }
      }
      const clampedLvl = Math.max(1, Math.min(maxLvl, desiredLvl));

      // 動態更新下拉選單選項至該主技能之最大上限 (Lv.1 ~ Lv.maxLvl)
      const options = [];
      for (let i = 1; i <= maxLvl; i++) {
        options.push(`<option value="${i}" ${i === clampedLvl ? 'selected' : ''}>Lv. ${i}</option>`);
      }
      skillLevelSelect.innerHTML = options.join('');
      skillLevelSelect.value = String(clampedLvl);

      // 同步自訂下拉元件
      if (typeof window !== 'undefined' && typeof window.setupCustomSelect === 'function' && !skillLevelSelect._customized) {
        window.setupCustomSelect(skillLevelSelect);
      } else if (skillLevelSelect._customized) {
        skillLevelSelect.dispatchEvent(new Event('sync-ui'));
      }
    }
  }

  /* ─── 寶可夢名稱 Combobox 搜尋選擇器 ───────────────────────── */
  function initPokemonCombobox(existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const searchInput = document.getElementById('modal-poke-search');
    const nameHidden = document.getElementById('modal-poke-name');
    const dropdown = document.getElementById('box-pkm-dropdown');
    const toggleBtn = document.getElementById('box-pkm-dropdown-toggle');
    if (!searchInput || !nameHidden || !dropdown) return;

    const CHEVRON_ICON = `<svg viewBox="0 0 12 8" width="8" height="5"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>`;
    const CLEAR_ICON = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    function syncToggleBtnIcon() {
      if (!toggleBtn) return;
      const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
      if (hasText) {
        toggleBtn.innerHTML = CLEAR_ICON;
        toggleBtn.title = isEN ? 'Clear selection' : '清除已選寶可夢';
        toggleBtn.setAttribute('aria-label', isEN ? 'Clear selection' : '清除已選寶可夢');
      } else {
        toggleBtn.innerHTML = CHEVRON_ICON;
        toggleBtn.title = isEN ? 'Expand list' : '展開寶可夢列表';
        toggleBtn.setAttribute('aria-label', isEN ? 'Expand list' : '展開寶可夢列表');
      }
    }

    const initialPkm = existingItem
      ? allPokemonsRef.find(p => p.id === existingItem.pokemonId || p.name_cn === existingItem.name)
      : null;

    function renderDropdown(filterText = '') {
      const q = (filterText || '').trim().toLowerCase();
      let matchedItems = [];

      const numMatch = q.match(/^(?:#|no\.?\s*)?(\d+)$/i);
      const isNumQuery = !!numMatch;
      const qDigits = numMatch ? numMatch[1] : '';
      const qNoZero = qDigits.replace(/^0+/, '');

      if (!q) {
        matchedItems = allPokemonsRef.slice();
      } else if (isNumQuery && qDigits) {
        // 純數字編號智能查找：只要編號有任何符合 (包含 formatted_no, id, 無前導零) 全部列出
        allPokemonsRef.forEach(p => {
          const fNo = String(p.formatted_no || '');
          const idStr = String(p.id || '');
          const cleanNo = fNo.replace(/^0+/, '');
          const pad4 = fNo.padStart(4, '0');

          let rank = 0;
          if (idStr === qDigits || cleanNo === qDigits || (qNoZero && cleanNo === qNoZero) || fNo === qDigits || pad4 === qDigits) {
            rank = 1; // 完全精確比對，最優先展示
          } else if ((qNoZero && cleanNo.startsWith(qNoZero)) || cleanNo.startsWith(qDigits) || fNo.startsWith(qDigits)) {
            rank = 2; // 前綴符合 (例如輸入 40 時，400, 403, 404, 405 優先展示)
          } else if (fNo.includes(qDigits) || idStr.includes(qDigits) || cleanNo.includes(qDigits) || pad4.includes(qDigits) || (qNoZero && idStr.includes(qNoZero))) {
            rank = 3; // 包含符合 (例如輸入 40 時，140, 240, 340 也列出供挑選)
          } else if (typeof window.matchesPokemonSearch === 'function' && window.matchesPokemonSearch(p, q)) {
            rank = 4; // 名稱或同音錯字符合
          }

          if (rank > 0) {
            matchedItems.push({ p, rank });
          }
        });

        matchedItems.sort((a, b) => {
          if (a.rank !== b.rank) return a.rank - b.rank;
          const noA = parseInt(a.p.id || a.p.formatted_no, 10) || 0;
          const noB = parseInt(b.p.id || b.p.formatted_no, 10) || 0;
          return noA - noB;
        });

        matchedItems = matchedItems.map(item => item.p);
      } else {
        matchedItems = allPokemonsRef.filter(p => {
          if (typeof window.matchesPokemonSearch === 'function') {
            return window.matchesPokemonSearch(p, q);
          }
          const cn = (p.name_cn || '').toLowerCase();
          const en = (p.name_en || '').toLowerCase();
          return cn.includes(q) || en.includes(q);
        });
      }

      renderFilteredItems(matchedItems);
    }

    if (typeof window !== 'undefined') {
      window._boxRenderDropdown = renderDropdown;
    }

    function renderFilteredItems(items) {
      if (items.length === 0) {
        dropdown.innerHTML = `<div class="text-muted" style="padding: 12px; text-align: center; font-size: 12px;">${isEN ? 'No matching Pokémon' : '找不到符合之寶可夢'}</div>`;
        dropdown.style.display = 'block';
        return;
      }

      dropdown.innerHTML = items.map(p => {
        const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
        const isSelected = nameHidden.value === p.name_cn;
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || 'assets/placeholder.svg';

        return `
          <div class="box-pkm-dropdown-item ${isSelected ? 'active' : ''}" data-id="${p.id}" data-name="${escapeHtml(p.name_cn)}">
            <img src="${avatarUrl}" class="box-pkm-dropdown-avatar" alt="${escapeHtml(pkmDisplayName)}" loading="lazy" onerror="this.src='https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png'">
            <div class="box-pkm-dropdown-info">
              <div class="box-pkm-dropdown-name">
                <span>No.${p.formatted_no} ${escapeHtml(pkmDisplayName)}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      dropdown.querySelectorAll('.box-pkm-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const pName = item.getAttribute('data-name');
          const found = allPokemonsRef.find(p => p.name_cn === pName);
          if (found) {
            selectPokemonInCombobox(found, true);
          }
        });
      });

      dropdown.style.display = 'block';
    }

    const POKEBALL_PLACEHOLDER_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='18' fill='%23334155' stroke='%2364748b' stroke-width='2'/><path d='M2 20h36' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='6' fill='%231e293b' stroke='%2364748b' stroke-width='2'/><circle cx='20' cy='20' r='2.5' fill='%2394a3b8'/></svg>";

    function updateSelectedPokemonAvatar(p) {
      const avatarImg = document.getElementById('modal-poke-selected-avatar');
      if (!avatarImg) return;
      if (p) {
        const avatarUrl = p.icon_url || p.icon || (p.formatted_no ? `https://www.serebii.net/pokemonsleep/pokemon/icon/${p.formatted_no}.png` : '') || POKEBALL_PLACEHOLDER_SVG;
        avatarImg.src = avatarUrl;
        avatarImg.alt = p.name_cn || 'Pokémon';
        avatarImg.onerror = () => {
          avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        };
      } else {
        avatarImg.src = POKEBALL_PLACEHOLDER_SVG;
        avatarImg.alt = 'Pokémon';
      }
    }

    function selectPokemonInCombobox(p, userChanged = false, existing = null) {
      if (!p) return;
      nameHidden.value = p.name_cn;
      const pkmDisplayName = isEN ? (p.name_en || p.name_cn) : p.name_cn;
      searchInput.value = `No.${p.formatted_no} ${pkmDisplayName}`;
      dropdown.style.display = 'none';
      updateSelectedPokemonAvatar(p);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(p, existing);
      let defLvl = null;
      if (existing && existing.skillLevel != null) {
        defLvl = getEffectiveSkillLevel(existing, p);
      } else if (p) {
        const currentLevelInput = document.getElementById('modal-poke-level');
        const curLv = parseInt(currentLevelInput ? currentLevelInput.value : '', 10) || 30;
        defLvl = getEffectiveSkillLevel({ level: curLv, subskills: [] }, p);
      }
      updateRibbonSelectOptions(p);
      updateModalMainSkill(p, defLvl);
    }

    if (initialPkm) {
      selectPokemonInCombobox(initialPkm, false, existingItem);
    } else {
      nameHidden.value = '';
      searchInput.value = '';
      updateSelectedPokemonAvatar(null);
      syncToggleBtnIcon();
      renderTiledIngredientPickers(null, null);
      updateRibbonSelectOptions(null);
      updateModalMainSkill(null);
    }

    searchInput.onfocus = () => {
      renderDropdown(searchInput.value.replace(/^No\.\d+\s*/, ''));
    };

    searchInput.oninput = () => {
      syncToggleBtnIcon();
      if (!searchInput.value.trim()) {
        nameHidden.value = '';
        updateSelectedPokemonAvatar(null);
        renderTiledIngredientPickers(null, null);
        updateRibbonSelectOptions(null);
        updateModalMainSkill(null);
      }
      renderDropdown(searchInput.value);
    };

    if (toggleBtn) {
      toggleBtn.onclick = (e) => {
        e.stopPropagation();
        const hasText = !!(searchInput.value && searchInput.value.trim().length > 0);
        if (hasText) {
          searchInput.value = '';
          nameHidden.value = '';
          updateSelectedPokemonAvatar(null);
          syncToggleBtnIcon();
          renderTiledIngredientPickers(null, null);
          updateRibbonSelectOptions(null);
          updateModalMainSkill(null);
          renderDropdown('');
          searchInput.focus();
        } else {
          if (dropdown.style.display === 'block') {
            dropdown.style.display = 'none';
          } else {
            renderDropdown('');
            searchInput.focus();
          }
        }
      };
    }

    // 點擊外面關閉下拉選單
    if (document._boxComboboxClickListener) {
      document.removeEventListener('click', document._boxComboboxClickListener);
    }
    document._boxComboboxClickListener = (e) => {
      if (!e.target.closest('#box-pkm-combobox')) {
        dropdown.style.display = 'none';
      }
    };
    document.addEventListener('click', document._boxComboboxClickListener);
  }

  /* ─── 解鎖食材組合平鋪選擇器 (符合官方解鎖規則：Lv.1=A, Lv.30=A/B, Lv.60=A/B/C) ── */
  function renderTiledIngredientPickers(basePkm, existingItem = null) {
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const slots = [
      { key: 'ing1', level: 1, containerId: 'modal-ing-options-1' },
      { key: 'ing2', level: 30, containerId: 'modal-ing-options-2' },
      { key: 'ing3', level: 60, containerId: 'modal-ing-options-3' }
    ];

    if (!basePkm) {
      slots.forEach(slot => {
        const hiddenInput = document.getElementById(`modal-${slot.key}`);
        const container = document.getElementById(slot.containerId);
        if (hiddenInput) hiddenInput.value = '';
        if (container) container.innerHTML = `<span class="box-ing-placeholder-slot">--</span>`;
      });
      return;
    }

    const ingList = (basePkm && basePkm.ingredients && basePkm.ingredients.length > 0)
      ? basePkm.ingredients
      : [{ name: '特選蘋果' }, { name: '暖暖薑' }, { name: '美味尾巴' }];

    const ingA = ingList[0] || { name: '特選蘋果' };
    const ingB = ingList[1] || ingA;
    const ingC = ingList[2] || ingB || ingA;

    // 依照遊戲規則建立各等級可選食材庫
    const rawLv30 = [ingA, ingB];
    const uniqueLv30 = Array.from(new Set(rawLv30.map(i => i.name))).map(n => rawLv30.find(i => i.name === n));

    const rawLv60 = [ingA, ingB, ingC];
    const uniqueLv60 = Array.from(new Set(rawLv60.map(i => i.name))).map(n => rawLv60.find(i => i.name === n));

    const slotConfigs = [
      {
        key: 'ing1',
        level: 1,
        containerId: 'modal-ing-options-1',
        allowed: [ingA],
        defaultVal: (existingItem && existingItem.ing1) || ingA.name // 預設食材 A
      },
      {
        key: 'ing2',
        level: 30,
        containerId: 'modal-ing-options-2',
        allowed: uniqueLv30,
        defaultVal: (existingItem && existingItem.ing2) || ingA.name // 預設食材 A
      },
      {
        key: 'ing3',
        level: 60,
        containerId: 'modal-ing-options-3',
        allowed: uniqueLv60,
        defaultVal: (existingItem && existingItem.ing3) || ingA.name // 預設食材 A
      }
    ];

    slotConfigs.forEach(slot => {
      const hiddenInput = document.getElementById(`modal-${slot.key}`);
      const container = document.getElementById(slot.containerId);
      if (!hiddenInput || !container) return;

      // 檢查 defaultVal 是否在允許列表中
      const isDefaultValid = slot.allowed.some(i => i.name === slot.defaultVal);
      hiddenInput.value = isDefaultValid ? slot.defaultVal : slot.allowed[0].name;

      container.innerHTML = slot.allowed.map(ing => {
        const isSelected = hiddenInput.value === ing.name;
        const ingDisplayName = window.I18N ? window.I18N.getIngredientName(ing.name) : ing.name;
        const iconUrl = ing.icon || (window.I18N && window.I18N.getIngredientIcon(ing.name)) || '';

        return `
          <button type="button" class="box-ing-opt-btn ${isSelected ? 'active' : ''}" data-slot="${slot.key}" data-ing="${escapeHtml(ing.name)}" title="${escapeHtml(ingDisplayName)}" aria-label="${escapeHtml(ingDisplayName)}">
            <img src="${iconUrl}" class="box-ing-opt-icon" alt="${escapeHtml(ingDisplayName)}" loading="lazy">
          </button>
        `;
      }).join('');

      container.querySelectorAll('.box-ing-opt-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const ingName = btn.getAttribute('data-ing');
          hiddenInput.value = ingName;
          container.querySelectorAll('.box-ing-opt-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    });
  }

  /* ─── 單行 5 階副技能插槽 + 平鋪副技能選擇盤 ──────────────────── */
  function initSubskillFlowPicker(initialSubskills = []) {
    activeSubskillSlot = 1;
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    for (let slot = 1; slot <= 5; slot++) {
      const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
      if (hiddenInput) {
        hiddenInput.value = (initialSubskills && initialSubskills[slot - 1]) || '';
      }
    }

    function updateSubskillUI() {
      // 1. 更新 5 個插槽按鈕
      const boxModal = document.getElementById('box-edit-modal');
      const slotBtns = (boxModal && typeof boxModal.querySelectorAll === 'function')
        ? boxModal.querySelectorAll('.box-subskill-slot-btn')
        : document.querySelectorAll('#box-edit-modal .box-subskill-slot-btn');
      slotBtns.forEach(btn => {
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        const hiddenInput = document.getElementById(`modal-subskill-${slot}`);
        const curVal = hiddenInput ? hiddenInput.value : '';
        const valBadge = btn.querySelector('.slot-val-badge');

        if (slot === activeSubskillSlot) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }

        if (valBadge) {
          if (!curVal) {
            valBadge.className = 'slot-val-badge slot-val-empty';
            valBadge.textContent = isEN ? '-- None --' : '-- 未解鎖 --';
          } else {
            const sk = SUBSKILLS_DATA.find(s => s.name === curVal);
            const tier = sk ? sk.tier : 'white';
            const skDisplayName = window.I18N ? window.I18N.getSubSkillName(curVal) : curVal;
            valBadge.className = `slot-val-badge box-subskill-pill subskill-${tier}`;
            valBadge.textContent = skDisplayName;
          }
        }
      });

      // 2. 獲取所有目前已被使用的副技能
      const usedSkills = new Set();
      for (let slot = 1; slot <= 5; slot++) {
        const input = document.getElementById(`modal-subskill-${slot}`);
        if (input && input.value) usedSkills.add(input.value);
      }

      // 3. 渲染平鋪副技能晶片
      ['gold', 'blue', 'white'].forEach(tier => {
        const container = document.getElementById(`subskill-chips-${tier}`);
        if (!container) return;

        const skillsInTier = SUBSKILLS_DATA.filter(s => s.tier === tier);
        container.innerHTML = skillsInTier.map(sk => {
          const skDisplayName = window.I18N ? window.I18N.getSubSkillName(sk.name) : sk.name;
          const isUsed = usedSkills.has(sk.name);
          return `
            <button type="button" class="box-subskill-chip subskill-${tier} ${isUsed ? 'in-use' : ''}" data-name="${escapeHtml(sk.name)}" ${isUsed ? 'disabled' : ''} title="${escapeHtml(skDisplayName)}${isUsed ? (isEN ? ' (Already Selected)' : '（已選用）') : ''}">
              <span>${escapeHtml(skDisplayName)}</span>
              ${isUsed ? '<span style="font-size:10px;opacity:0.8;">✓</span>' : ''}
            </button>
          `;
        }).join('');

        container.querySelectorAll('.box-subskill-chip').forEach(chip => {
          chip.addEventListener('click', (e) => {
            e.preventDefault();
            if (chip.disabled || chip.classList.contains('in-use')) return;
            const skName = chip.getAttribute('data-name');
            const targetInput = document.getElementById(`modal-subskill-${activeSubskillSlot}`);
            if (targetInput) {
              targetInput.value = skName;
            }
            // 自動推進到下一個未選取的插槽
            let nextEmptySlot = -1;
            for (let s = 1; s <= 5; s++) {
              const inp = document.getElementById(`modal-subskill-${s}`);
              if (inp && !inp.value) {
                nextEmptySlot = s;
                break;
              }
            }
            if (nextEmptySlot !== -1) {
              activeSubskillSlot = nextEmptySlot;
            } else if (activeSubskillSlot < 5) {
              activeSubskillSlot += 1;
            } else {
              activeSubskillSlot = 1;
            }
            updateSubskillUI();
          });
        });
      });
    }

    // 綁定插槽按鈕點擊
    const boxModalDialog = document.getElementById('box-edit-modal');
    const targetSlotBtns = (boxModalDialog && typeof boxModalDialog.querySelectorAll === 'function')
      ? boxModalDialog.querySelectorAll('.box-subskill-slot-btn')
      : document.querySelectorAll('#box-edit-modal .box-subskill-slot-btn');
    targetSlotBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const slot = parseInt(btn.getAttribute('data-slot'), 10);
        activeSubskillSlot = slot;
        updateSubskillUI();
      };
    });

    // 綁定清空全部副技能按鈕
    const clearBtn = document.getElementById('box-subskill-clear-all-btn') || document.getElementById('box-subskill-clear-active-btn');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        for (let slot = 1; slot <= 5; slot++) {
          const targetInput = document.getElementById(`modal-subskill-${slot}`);
          if (targetInput) {
            targetInput.value = '';
          }
        }
        activeSubskillSlot = 1;
        updateSubskillUI();
      };
    }

    updateSubskillUI();
  }

  /* ─── 開啟編輯/新增彈窗 ─────────────────────────────────── */
  function openBoxEditModal(existingItem = null, screenshotSrc = null) {
    const modal = document.getElementById('box-edit-modal');
    if (!modal) return;

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const isEdit = !!existingItem;
    const titleEl = document.getElementById('box-modal-title');
    if (titleEl) {
      titleEl.textContent = isEdit 
        ? (isEN ? 'Edit Pokémon' : '編輯寶可夢') 
        : (screenshotSrc ? (isEN ? 'Confirm OCR Entry' : '截圖辨識確認入庫') : (isEN ? 'Add Pokémon' : '手動新增寶可夢'));
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
            <span class="box-screenshot-preview-tag">${isEN ? 'Original Screenshot' : '原始截圖對照'}</span>
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
        const buffLabel = isEN ? (n.buff_en || n.buff) : n.buff;
        const debuffLabel = isEN ? (n.debuff_en || n.debuff) : n.debuff;
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

    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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
      alert(isEN ? 'Please select a Pokémon.' : '請選擇寶可夢！');
      document.getElementById('modal-poke-search')?.focus();
      return;
    }

    const parsedLevel = parseInt(levelInput ? levelInput.value : '', 10);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 100) {
      alert(isEN ? 'Please enter a valid level (1 ~ 100).' : '請輸入有效的等級 (1 ~ 100)！');
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
  function findSimilarPokemonInBox(parsed) {
    if (!parsed || !parsed.name || !userBox || userBox.length === 0) return null;
    const pkmName = parsed.name.trim();

    // 1. 同一寶可夢品種候選池 (Same Species Candidates)
    const candidates = userBox.filter(p => {
      if (!p) return false;
      if (p.name && p.name.trim() === pkmName) return true;
      if (p.pokemonId && parsed.pokemonId && p.pokemonId === parsed.pokemonId) return true;
      return false;
    });

    if (candidates.length === 0) return null;

    // 2. 計算相似度權重分數 (Similarity Score)
    let bestCandidate = null;
    let maxScore = -1;

    candidates.forEach(cand => {
      let score = 20; // 同品種基準分

      // (a) 性格一致 (性格是先天固定屬性)
      if (parsed.nature && cand.nature && parsed.nature === cand.nature) {
        score += 35;
      }

      // (b) 食材組合一致性 (比對 Lv.1, Lv.30, Lv.60)
      let ingMatchCount = 0;
      if (parsed.ing1 && cand.ing1 && parsed.ing1 === cand.ing1) ingMatchCount++;
      if (parsed.ing2 && cand.ing2 && parsed.ing2 === cand.ing2) ingMatchCount++;
      if (parsed.ing3 && cand.ing3 && parsed.ing3 === cand.ing3) ingMatchCount++;
      score += ingMatchCount * 12; // 最高 +36

      // (c) 副技能交集 (副技能是先天固定的)
      const candSks = new Set(cand.subskills || []);
      const parsedSks = parsed.subskills || [];
      let skMatchCount = 0;
      parsedSks.forEach(sk => {
        if (sk && candSks.has(sk)) skMatchCount++;
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
    const comparisons = [];

    // 1. 等級
    const oldLevel = Number(existing.level) || 1;
    const newLevel = Number(parsed.level) || oldLevel;
    comparisons.push({
      field: 'level',
      label: isEN ? 'Level' : '等級',
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
      label: isEN ? 'Nickname' : '自訂暱稱',
      isSame: isNickSame,
      oldHtml: oldNick ? escapeHtml(oldNick) : `<span style="color:var(--text-muted);">${isEN ? 'None' : '未設定'}</span>`,
      newHtml: newNick ? escapeHtml(newNick) : (oldNick ? `<span style="color:var(--text-muted);">${isEN ? '(Retain: ' + escapeHtml(oldNick) + ')' : '(維持原暱稱：' + escapeHtml(oldNick) + ')'}</span>` : `<span style="color:var(--text-muted);">${isEN ? 'None' : '未設定'}</span>`)
    });

    // 3. 主技能等級
    const oldSkillLvl = Number(existing.skillLevel || existing.mainSkillLevel) || 1;
    const newSkillLvl = Number(parsed.skillLevel || parsed.mainSkillLevel) || oldSkillLvl;
    comparisons.push({
      field: 'skillLevel',
      label: isEN ? 'Main Skill Level' : '主技能等級',
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
      label: isEN ? 'Nature' : '性格',
      isSame: oldNat === newNat,
      oldHtml: escapeHtml(oldNatName),
      newHtml: escapeHtml(newNatName)
    });

    // 5. 淨白薄荷
    const oldMint = !!(existing.cleanseMint || existing.mint);
    const newMint = !!(parsed.cleanseMint || parsed.useMint);
    comparisons.push({
      field: 'cleanseMint',
      label: isEN ? 'Cleanse Mint' : '淨白薄荷',
      isSame: oldMint === newMint,
      oldHtml: oldMint ? (isEN ? 'Used' : '已消除效果') : (isEN ? 'None' : '未消除'),
      newHtml: newMint ? (isEN ? 'Used' : '已消除效果') : (isEN ? 'None' : '未消除')
    });

    // 6. 睡飽飽獎章
    const oldRibbon = Number(existing.ribbon) || 0;
    const newRibbon = (parsed.ribbon !== undefined) ? (Number(parsed.ribbon) || 0) : oldRibbon;
    const getRibbonLabel = (val) => {
      if (val === 1) return isEN ? '200h (+1 Carry)' : '200 小時 (+1 上限)';
      if (val === 2) return isEN ? '500h (+3 Carry · Speed)' : '500 小時 (+3 上限 · 幫速)';
      if (val === 3) return isEN ? '1000h (+6 Carry)' : '1000 小時 (+6 上限)';
      if (val === 4) return isEN ? '2000h (+8 Carry · Max)' : '2000 小時 (+8 上限 · 最大幫速)';
      return isEN ? 'None (0h)' : '未佩戴 (0h)';
    };
    comparisons.push({
      field: 'ribbon',
      label: isEN ? 'Good-Night Ribbon' : '睡飽飽獎章',
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
      label: isEN ? 'Ingredients (Lv1/30/60)' : '食材組合 (Lv1/30/60)',
      isSame: (existing.ing1 === parsed.ing1 && existing.ing2 === parsed.ing2 && existing.ing3 === parsed.ing3),
      oldHtml: escapeHtml(oldIngs),
      newHtml: escapeHtml(newIngs)
    });

    // 8. 副技能組合
    const oldSks = (existing.subskills || []).slice(0, 5);
    const newSks = (parsed.subskills || []).slice(0, 5);
    const isSksSame = (oldSks.length === newSks.length) && oldSks.every((sk, i) => sk === newSks[i]);
    const formatSks = (sks) => {
      if (!sks || sks.length === 0) return isEN ? 'None' : '無';
      return sks.map(s => {
        const sName = (window.I18N && typeof window.I18N.getSubskillName === 'function') ? window.I18N.getSubskillName(s) : s;
        return escapeHtml(sName);
      }).join('、');
    };
    comparisons.push({
      field: 'subskills',
      label: isEN ? 'Sub-Skills' : '副技能組合',
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';

    const base = findPokemonBase(existingCandidate.pokemonId || existingCandidate.name);
    const pkmDisplayName = isEN ? ((base && base.name_en) || existingCandidate.name) : (existingCandidate.name || (base ? base.name_cn : ''));
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
            <div class="box-conflict-pkm-sub">UID: ${existingCandidate.uid ? existingCandidate.uid.slice(-8) : ''} · ${isEN ? 'Lv.' + (existingCandidate.level || 1) : '現有 Lv.' + (existingCandidate.level || 1)}</div>
          </div>
        </div>
        <div class="box-conflict-pills">
          <span class="conflict-badge-diff">${diffItems.length} ${isEN ? 'Updates' : '項更新'}</span>
          <span class="conflict-badge-same">${sameItems.length} ${isEN ? 'Same' : '項相同'}</span>
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
            <span class="conflict-status-tag ${item.isSame ? 'tag-same' : 'tag-diff'}">${item.isSame ? (isEN ? 'Same' : '相同') : (isEN ? 'Updated' : '已更新')}</span>
          </div>
          <div class="conflict-values-grid">
            <div class="conflict-val-col col-existing">
              <span class="conflict-val-label">${isEN ? 'In Box' : '倉庫現有'}</span>
              <div class="conflict-val-content">${item.oldHtml}</div>
            </div>
            <div class="conflict-val-arrow">→</div>
            <div class="conflict-val-col col-parsed">
              <span class="conflict-val-label">${isEN ? 'New Screenshot' : '截圖新值'}</span>
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
    const isEN = window.I18N && window.I18N.getLanguage() === 'en-US';
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

    const pkmName = isEN ? ((existingCandidate.name_en || existingCandidate.name) || 'Pokémon') : (existingCandidate.name || '寶可夢');
    const displayName = userBox[idx].nickname ? `${pkmName} (${userBox[idx].nickname})` : pkmName;
    showBoxToast(
      isEN ? 'Pokémon Overwritten & Updated' : '寶可夢覆蓋更新成功！',
      isEN ? `Successfully updated "${displayName}" with latest screenshot data.` : `已成功將「${displayName}」覆蓋更新為最新截圖數據！`,
      'success'
    );
  }

  /* ─── 截圖智能分析與 OCR 引擎 (支援單圖與多圖連續批次辨識) ───────────────────────── */
  function makePokemonFingerprint(p) {
    if (!p) return '';
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.name || p.pokemonId || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  async function handleScreenshotFiles(files) {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f && f.type && f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('請上傳圖片檔案 (PNG, JPG, WebP)！');
      return;
    }

    const scannerStatus = document.getElementById('box-scanner-status');

    // 1. 單張截圖流程 (智能相似寶可夢比對與確認)
    if (imageFiles.length === 1) {
      const file = imageFiles[0];
      if (scannerStatus) {
        scannerStatus.style.display = 'flex';
        scannerStatus.innerHTML = `<span>正在智能解析截圖中，請稍候...</span>`;
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
    let importedCount = 0;
    let duplicateCount = 0;
    const importedNames = [];

    // 建立既有特徵指紋集合
    const existingFingerprints = new Set(userBox.map(makePokemonFingerprint));

    if (scannerStatus) {
      scannerStatus.style.display = 'flex';
      scannerStatus.innerHTML = `
        <div class="batch-ocr-progress-card">
          <div class="batch-ocr-header">
            <span class="batch-ocr-title">批次智能辨識入庫中...</span>
            <span id="batch-ocr-counter" class="batch-ocr-counter">0 / ${total}</span>
          </div>
          <div class="batch-ocr-bar-bg">
            <div id="batch-ocr-bar-fill" class="batch-ocr-bar-fill" style="width: 0%;"></div>
          </div>
          <div id="batch-ocr-status-text" class="batch-ocr-status-text">初始化 OCR 引擎中...</div>
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

    for (let i = 0; i < total; i++) {
      const file = imageFiles[i];
      const statusText = document.getElementById('batch-ocr-status-text');
      const counterEl = document.getElementById('batch-ocr-counter');
      const barFill = document.getElementById('batch-ocr-bar-fill');

      if (statusText) statusText.textContent = `正在辨識：${file.name} (${i + 1}/${total})...`;
      if (counterEl) counterEl.textContent = `${i + 1} / ${total}`;
      if (barFill) barFill.style.width = `${Math.round(((i + 1) / total) * 100)}%`;

      try {
        const imgSrc = await readFileAsDataURL(file);
        const parsed = await parsePokemonScreenshotWithWorker(imgSrc, sharedWorker);

        // 防重保護檢測
        const fp = makePokemonFingerprint(parsed);
        if (existingFingerprints.has(fp)) {
          duplicateCount++;
        } else {
          existingFingerprints.add(fp);
          parsed.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
          parsed.createdAt = Date.now();
          userBox.push(parsed);
          importedCount++;
          importedNames.push(parsed.name || '寶可夢');
        }
      } catch (err) {
        console.error(`Error parsing file ${file.name}:`, err);
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

    if (importedCount > 0) {
      saveUserBox();
      renderBox();
    }

    // 彈出 Toast 通知
    showBoxToast(
      '批次辨識入庫完成！',
      `成功入庫 ${importedCount} 隻寶可夢${duplicateCount > 0 ? ` (已略過 ${duplicateCount} 隻重複截圖)` : ''}${importedNames.length > 0 ? `：${importedNames.slice(0, 5).join('、')}${importedNames.length > 5 ? ' 等' : ''}` : ''}。`,
      importedCount > 0 ? 'success' : 'info'
    );
  }
