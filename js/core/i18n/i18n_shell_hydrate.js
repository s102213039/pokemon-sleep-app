  // ─── 靜態 Shell 動態掛載引擎 (Static HTML Shell Hydration Engine) ───
  let _shellsHydrated = false;
  function hydrateAppShells() {
    if (typeof document === "undefined" || typeof document.getElementById !== "function") return;
    const isMobileH5 = !!(document.body && document.body.classList && typeof document.body.classList.contains === "function" && document.body.classList.contains("mobile-h5-app"));

    const settingsModal = document.getElementById("settings-modal");
    if (settingsModal && (!settingsModal.children || settingsModal.children.length === 0) && typeof _getSettingsModalHtml === "function") {
      settingsModal.innerHTML = _getSettingsModalHtml(isMobileH5);
    }

    const boxAuthOverlay = document.getElementById("box-auth-overlay");
    if (boxAuthOverlay && (!boxAuthOverlay.children || boxAuthOverlay.children.length === 0)) {
      boxAuthOverlay.innerHTML = `<div class="box-auth-prompt-card" onclick="window.CloudSync && window.CloudSync.openAuthModal('signin')">
<div class="box-auth-prompt-icon-wrap">
<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
</svg>
</div>
<h3 class="box-auth-prompt-title" data-i18n="box.auth_guest_title">登入啟用寶可夢雲端倉庫</h3>
<p class="box-auth-prompt-desc" data-i18n="box.auth_guest_desc">登入或自訂帳號註冊，即可享有電腦與手機跨裝置秒級雙向同步、即時雲端備份與完整寶可夢管理功能。</p>
<button type="button" class="box-auth-prompt-btn cloud-auth-btn btn-primary" onclick="event.stopPropagation(); window.CloudSync && window.CloudSync.openAuthModal('signin')">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
<polyline points="10 17 15 12 10 7"></polyline>
<line x1="15" y1="12" x2="3" y2="12"></line>
</svg>
<span data-i18n="box.auth_guest_login_btn">立即登入 / 註冊帳號</span>
</button>
<div class="box-auth-prompt-guest-row" onclick="event.stopPropagation()">
<button type="button" class="box-auth-guest-link" onclick="window.CloudSync && window.CloudSync.dismissBoxAuthOverlay()">以本機訪客模式暫時使用 (離線模式)</button>
</div>
</div>`;
    }

    const guideCard = document.getElementById("box-screenshot-guide-card");
    if (guideCard && (!guideCard.children || guideCard.children.length === 0)) {
      guideCard.innerHTML = isMobileH5 ? `<div class="box-guide-header">
<div class="box-guide-title">
<span data-i18n="box.guide_title">標準截圖示範例與必備資訊</span>
</div>
<button type="button" id="box-guide-toggle-btn" class="box-guide-toggle-btn" aria-expanded="false" data-i18n="box.guide_expand">展開說明</button>
</div>
<div id="box-guide-body" class="box-guide-body" style="display:none;">
<div class="box-guide-thumb-col">
<div class="box-guide-thumb-wrap" id="box-guide-thumb-wrap">
<img src="../assets/guide/standard_screenshot_guide.png" alt="標準截圖示範例" class="box-guide-thumb-img" decoding="async">
</div>
</div>
</div>` : `<div class="box-guide-header">
<div class="box-guide-title">
<svg class="box-guide-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"></circle>
<line x1="12" y1="16" x2="12" y2="12"></line>
<line x1="12" y1="8" x2="12.01" y2="8"></line>
</svg>
<span data-i18n="box.guide_title">標準截圖示範例與必備資訊</span>
</div>
<button type="button" id="box-guide-toggle-btn" class="box-guide-toggle-btn" aria-expanded="true" data-i18n="box.guide_collapse">收合說明</button>
</div>
<div id="box-guide-body" class="box-guide-body">
<div class="box-guide-thumb-col">
<div class="box-guide-thumb-wrap" id="box-guide-thumb-wrap" title="點擊放大查看標準截圖範例" data-i18n-title="box.guide_click_zoom">
<img src="assets/guide/standard_screenshot_guide.png" alt="標準截圖示範例" class="box-guide-thumb-img" decoding="async">
<div class="box-guide-thumb-overlay">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="8"></circle>
<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
<line x1="11" y1="8" x2="11" y2="14"></line>
<line x1="8" y1="11" x2="14" y2="11"></line>
</svg>
<span data-i18n="box.guide_click_zoom">點擊放大檢視</span>
</div>
</div>
<span class="box-guide-thumb-caption" data-i18n="box.guide_sample_label">官方遊戲詳細資訊全幅示範</span>
</div>
<div class="box-guide-info-col">
<div class="box-guide-subtitle" data-i18n="box.guide_info_heading">標準截圖必備 5 大核心資訊 (確保 100% 辨識率)：</div>
<div class="box-guide-items-grid">
<div class="box-guide-item">
<span class="box-guide-num">[1]</span>
<div class="box-guide-item-content">
<strong data-i18n="box.guide_item1_title">頂部資訊 (名稱與等級)</strong>
<p data-i18n="box.guide_item1_desc">包含完整的寶可夢名稱 (如 赫拉克羅斯) 與等級 (如 Lv. 52), 文字清晰無遮蔽。</p>
</div>
</div>
<div class="box-guide-item">
<span class="box-guide-num">[2]</span>
<div class="box-guide-item-content">
<strong data-i18n="box.guide_item2_title">食材組合 (Lv.1 / 30 / 60)</strong>
<p data-i18n="box.guide_item2_desc">清晰顯示三個等級之解鎖食材圖示與獲得數量 (如 甜甜蜜x1, 品鮮蘑菇x1, 甜甜蜜x4)。</p>
</div>
</div>
<div class="box-guide-item">
<span class="box-guide-num">[3]</span>
<div class="box-guide-item-content">
<strong data-i18n="box.guide_item3_title">主技能資訊</strong>
<p data-i18n="box.guide_item3_desc">顯示完整主技能名稱 (如 健美 / 料理輔助S) 與目前技能等級 (如 Lv.7)。</p>
</div>
</div>
<div class="box-guide-item">
<span class="box-guide-num">[4]</span>
<div class="box-guide-item-content">
<strong data-i18n="box.guide_item4_title">副技能欄位 (全部 5 格)</strong>
<p data-i18n="box.guide_item4_desc">完整露出 Lv.10 至 Lv.80 共 5 個副技能方塊按鈕, 無選單或彈窗覆蓋遮擋。</p>
</div>
</div>
<div class="box-guide-item">
<span class="box-guide-num">[5]</span>
<div class="box-guide-item-content">
<strong data-i18n="box.guide_item5_title">性格與能力修正</strong>
<p data-i18n="box.guide_item5_desc">底部性格名稱 (如 慎重) 及對應的主技能發動率 / 食材發現率加減成箭頭 (▲▲ / ▼▼)。</p>
</div>
</div>
</div>
<div class="box-guide-tips">
<span class="box-guide-tip-badge" data-i18n="box.guide_tip_badge">提示</span>
<span data-i18n="box.guide_tip_text">請截取遊戲中「詳細資訊」完整畫面, 避開半透明浮動選單覆蓋, 即可實現高精準度秒速辨識！</span>
</div>
</div>
</div>`;
    }

    const guideLightbox = document.getElementById("box-guide-lightbox-modal");
    if (guideLightbox && (!guideLightbox.children || guideLightbox.children.length === 0)) {
      guideLightbox.innerHTML = isMobileH5 ? `<div class="box-guide-lightbox-dialog">
<button type="button" id="box-guide-lightbox-close" class="box-guide-lightbox-close" aria-label="關閉大圖" data-i18n-aria="common.close" data-i18n-title="common.close">✕</button>
<img src="../assets/guide/standard_screenshot_guide.png" alt="標準截圖完整大圖" class="box-guide-lightbox-img" decoding="async">
</div>` : `<div class="box-guide-lightbox-dialog">
<button type="button" id="box-guide-lightbox-close" class="box-guide-lightbox-close" aria-label="關閉大圖" data-i18n-aria="common.close" data-i18n-title="common.close">✕</button>
<img src="assets/guide/standard_screenshot_guide.png" alt="標準截圖完整大圖" class="box-guide-lightbox-img" decoding="async">
</div>`;
    }

    const newsPanel = document.getElementById("panel-news");
    if (newsPanel && (!newsPanel.children || newsPanel.children.length === 0)) {
      newsPanel.innerHTML = isMobileH5 ? `<section class="controls-container mobile-controls-container">
<div class="search-box news-search-box">
<span class="search-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="7"></circle>
<line x1="21" y1="21" x2="16.5" y2="16.5"></line>
</svg>
</span>
<input type="text" id="news-search-input" class="search-input news-search-input"
placeholder="搜尋公告標題、關鍵字、寶可夢..."
data-i18n-placeholder="news.search_placeholder"
data-i18n-aria="news.search_placeholder"
aria-label="搜尋新聞公告">
<button type="button" id="news-search-clear" class="search-clear-btn" style="display:none;" title="清空搜尋" aria-label="清空搜尋" data-i18n-title="pokedex.clear" data-i18n-aria="pokedex.clear">✕</button>
</div>
<div id="news-category-tags" class="news-category-tags"></div>
<div id="news-event-timeline" class="news-timeline-container mobile-touch-scroll"></div>
<div class="news-info-bar">
<div id="news-count-badge" class="result-count" data-i18n="news.loading">載入最新公告中...</div>
</div>
</section>
<section class="news-content-container">
<div id="news-list-container" class="news-list-grid">
<div class="app-loading-view">
<div class="app-loading-spinner"></div>
<div class="app-loading-text" data-i18n="news.loading">載入最新公告中...</div>
</div>
</div>
<footer class="news-minimal-footer">
<p class="news-footer-source" data-i18n-html="news.source_full_hint">
由 AI 自動提煉核心亮點 · 來源：<a href="https://www.pokemonsleep.net/zh/news/" target="_blank" rel="noopener noreferrer">Pokémon Sleep 繁體中文官方網站</a>
</p>
</footer>
</section>` : `<section class="controls-container" aria-label="News Search and Category Controls">
<div id="news-event-timeline" class="news-timeline-container"></div>
<div class="news-filter-card">
<div class="news-top-bar">
<div id="news-category-tags" class="news-category-tags">
</div>
<div class="search-box news-search-box">
<span class="search-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="7"></circle>
<line x1="21" y1="21" x2="16.5" y2="16.5"></line>
</svg>
</span>
<input type="text" id="news-search-input" class="search-input news-search-input"
placeholder="搜尋公告標題、關鍵字、寶可夢..."
data-i18n-placeholder="news.search_placeholder"
data-i18n-aria="news.search_placeholder"
aria-label="搜尋新聞公告">
<button type="button" id="news-search-clear" class="search-clear-btn" style="display:none;" title="清空搜尋" aria-label="清空搜尋" data-i18n-title="pokedex.clear" data-i18n-aria="pokedex.clear">✕</button>
</div>
</div>
<div class="news-info-bar">
<div id="news-count-badge" class="result-count" data-i18n="news.loading">
載入最新官方消息中...
</div>
</div>
</div>
</section>
<section class="news-content-container">
<div id="news-list-container" class="news-list-grid">
<div style="text-align:center;padding:60px;color:var(--text-muted);" data-i18n="news.loading">
最新新聞與公告載入中...
</div>
</div>
<footer class="news-minimal-footer">
<p class="news-footer-source" data-i18n-html="news.source_full_hint">
由 AI 自動提煉核心亮點 · 來源：<a href="https://www.pokemonsleep.net/zh/news/" target="_blank" rel="noopener noreferrer">Pokémon Sleep 繁體中文官方網站</a>
</p>
</footer>
</section>`;
    }
    const subskillGroup = document.getElementById("box-subskill-group");
    if (subskillGroup && (!subskillGroup.children || subskillGroup.children.length === 0)) {
      subskillGroup.innerHTML = isMobileH5 ? `<div style="display:flex;justify-content:space-between;align-items:center;">
<label class="box-form-label" data-i18n="box.modal_poke_subskills">副技能配置</label>
<button type="button" id="box-subskill-clear-all-btn" class="box-subskill-clear-btn" data-i18n="box.modal_clear_all_subskills">✕ 清空全部</button>
</div>
<input type="hidden" id="modal-subskill-1" value="">
<input type="hidden" id="modal-subskill-2" value="">
<input type="hidden" id="modal-subskill-3" value="">
<input type="hidden" id="modal-subskill-4" value="">
<input type="hidden" id="modal-subskill-5" value="">
<div class="box-subskill-slots-row" id="box-subskill-slots-row">
<button type="button" class="box-subskill-slot-btn active" data-slot="1">
<span class="slot-lvl-header">Lv.10</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="2">
<span class="slot-lvl-header">Lv.25</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="3">
<span class="slot-lvl-header">Lv.50</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="4">
<span class="slot-lvl-header">Lv.70</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="5">
<span class="slot-lvl-header">Lv.80</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
</div>
<div class="box-subskill-palette" id="box-subskill-palette">
<div class="subskill-tier-section">
<div class="subskill-tier-label gold-label" data-i18n="box.modal_gold_skills">金色頂級技能</div>
<div class="subskill-chips-row" id="subskill-chips-gold"></div>
</div>
<div class="subskill-tier-section">
<div class="subskill-tier-label blue-label" data-i18n="box.modal_blue_skills">藍色高階技能</div>
<div class="subskill-chips-row" id="subskill-chips-blue"></div>
</div>
<div class="subskill-tier-section">
<div class="subskill-tier-label white-label" data-i18n="box.modal_white_skills">白色基礎技能</div>
<div class="subskill-chips-row" id="subskill-chips-white"></div>
</div>
</div>
` : `<div style="display:flex;justify-content:space-between;align-items:center;">
<label class="box-form-label" data-i18n="box.modal_poke_subskills">副技能配置</label>
<button type="button" id="box-subskill-clear-all-btn" class="box-subskill-clear-btn" data-i18n="box.modal_clear_all_subskills" data-i18n-title="box.modal_clear_all_subskills" title="清空全部副技能">✕ 清空全部</button>
</div>
<input type="hidden" id="modal-subskill-1" value="">
<input type="hidden" id="modal-subskill-2" value="">
<input type="hidden" id="modal-subskill-3" value="">
<input type="hidden" id="modal-subskill-4" value="">
<input type="hidden" id="modal-subskill-5" value="">
<div class="box-subskill-slots-row" id="box-subskill-slots-row">
<button type="button" class="box-subskill-slot-btn active" data-slot="1">
<span class="slot-lvl-header">Lv.10</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="2">
<span class="slot-lvl-header">Lv.25</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="3">
<span class="slot-lvl-header">Lv.50</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="4">
<span class="slot-lvl-header">Lv.70</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
<button type="button" class="box-subskill-slot-btn" data-slot="5">
<span class="slot-lvl-header">Lv.80</span>
<span class="slot-val-badge slot-val-empty" data-i18n="box.subskill_locked">-- 未解鎖 --</span>
</button>
</div>
<div class="box-subskill-palette" id="box-subskill-palette">
<div class="subskill-tier-section">
<div class="subskill-tier-label gold-label" data-i18n="box.modal_gold_skills">金色頂級技能</div>
<div class="subskill-chips-row" id="subskill-chips-gold"></div>
</div>
<div class="subskill-tier-section">
<div class="subskill-tier-label blue-label" data-i18n="box.modal_blue_skills">藍色高階技能</div>
<div class="subskill-chips-row" id="subskill-chips-blue"></div>
</div>
<div class="subskill-tier-section">
<div class="subskill-tier-label white-label" data-i18n="box.modal_white_skills">白色基礎技能</div>
<div class="subskill-chips-row" id="subskill-chips-white"></div>
</div>
</div>
`;
    }

    const ingStrip = document.getElementById("box-ing-strip-shell");
    if (ingStrip && (!ingStrip.children || ingStrip.children.length === 0)) {
      ingStrip.innerHTML = isMobileH5 ? `<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv1">Lv.1</span>
<div id="modal-ing-options-1" class="box-ing-options-list"></div>
</div>
<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv30">Lv.30</span>
<div id="modal-ing-options-2" class="box-ing-options-list"></div>
</div>
<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv60">Lv.60</span>
<div id="modal-ing-options-3" class="box-ing-options-list"></div>
</div>` : `<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv1">Lv.1</span>
<div id="modal-ing-options-1" class="box-ing-options-list"></div>
</div>
<span class="box-ing-slot-sep">|</span>
<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv30">Lv.30</span>
<div id="modal-ing-options-2" class="box-ing-options-list"></div>
</div>
<span class="box-ing-slot-sep">|</span>
<div class="box-ing-slot-group">
<span class="box-ing-lvl-tag" data-i18n="box.modal_ing_lv60">Lv.60</span>
<div id="modal-ing-options-3" class="box-ing-options-list"></div>
</div>`;
    }

    const potSel = document.getElementById("pot-filter-select");
    if (potSel && (!potSel.children || potSel.children.length === 0)) {
      potSel.innerHTML = `<option value="0" data-i18n="recipe.all">全部</option>
<option value="35" data-i18n="recipe.pot_35">≥ 35（中階料理）</option>
<option value="55" data-i18n="recipe.pot_55">≥ 55（中高階料理）</option>
<option value="67" data-i18n="recipe.pot_67">≥ 67（高階大料理）</option>
<option value="87" data-i18n="recipe.pot_87">≥ 87（特階大料理）</option>
<option value="100" data-i18n="recipe.pot_100">≥ 100（頂級究極）</option>`;
    }

    const recSortSel = document.getElementById("recipe-sort-select");
    if (recSortSel && (!recSortSel.children || recSortSel.children.length === 0)) {
      recSortSel.innerHTML = `<option value="energy-desc" data-i18n="recipe.sort_energy_desc">食譜能量 ↓（高→低）</option>
<option value="energy-asc" data-i18n="recipe.sort_energy_asc">食譜能量 ↑（低→高）</option>
<option value="pot-asc" data-i18n="recipe.sort_pot_asc">鍋子容量 ↑（小→大）</option>
<option value="pot-desc" data-i18n="recipe.sort_pot_desc">鍋子容量 ↓（大→小）</option>
<option value="name-asc" data-i18n="recipe.sort_name_asc">名稱排序</option>`;
    }

    const skillLvSel = document.getElementById("modal-poke-skill-level");
    if (skillLvSel && (!skillLvSel.children || skillLvSel.children.length === 0)) {
      skillLvSel.innerHTML = `<option value="1">Lv. 1</option>
<option value="2">Lv. 2</option>
<option value="3">Lv. 3</option>
<option value="4">Lv. 4</option>
<option value="5">Lv. 5</option>
<option value="6">Lv. 6</option>
<option value="7">Lv. 7</option>`;
    }

    const boxBanner = document.getElementById("box-top-banner-shell");
    if (boxBanner && (!boxBanner.children || boxBanner.children.length === 0)) {
      boxBanner.innerHTML = `<div class="box-banner-text">
<h2 class="box-banner-title" data-i18n="box.banner_title">我的寶可夢倉庫 & 截圖智能辨識</h2>
<p class="box-banner-desc" data-i18n="box.banner_desc">支援上傳遊戲截圖自動辨識等級、食材組合、副技能與性格，亦可隨時手動錄入與編輯。</p>
</div>
<div class="box-banner-actions">
<input type="file" id="box-file-input" accept="image/*" multiple style="display:none;">
<button type="button" id="box-upload-btn" class="box-btn" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: 1px solid rgba(16, 185, 129, 0.4); font-weight: 700;" title="上傳遊戲截圖自動辨識" data-i18n-title="box.upload_screenshots" data-i18n="box.upload_screenshots">上傳截圖辨識</button>
<button type="button" id="box-toggle-guide-btn" class="box-btn box-btn-secondary" style="display:none;" title="展開/收合 截圖拖曳與示範指引" data-i18n-title="box.toggle_guide" data-i18n="box.toggle_guide">截圖指引</button>
<button type="button" id="box-manual-add-btn" class="box-btn box-btn-primary" data-i18n="box.add_pokemon">手動新增寶可夢</button>
</div>`;
    }

    const boxDrop = document.getElementById("box-dropzone");
    if (boxDrop && !isMobileH5 && (!boxDrop.children || boxDrop.children.length === 0)) {
      boxDrop.innerHTML = `<div class="box-dropzone-inner">
<span class="box-dropzone-icon">
<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
<circle cx="12" cy="13" r="4"></circle>
</svg>
</span>
<div class="box-dropzone-content">
<div class="box-dropzone-title" data-i18n="box.dropzone_title">點擊或多選/批次拖曳「寶可夢資料截圖」至此，或直接按 <kbd>Ctrl+V</kbd> / <kbd>Cmd+V</kbd> 貼上</div>
<div class="box-dropzone-sub" data-i18n="box.dropzone_sub">自動批次辨識：寶可夢名稱 · 等級 · Lv.1/30/60 食材組合 · 5 格副技能 · 性格加成 · 智能防重保護</div>
</div>
</div>
<div id="box-scanner-status" class="box-scanner-status" style="display:none;"></div>`;
    }

    const boxSearchRow = document.getElementById("box-search-filter-row");
    if (boxSearchRow && (!boxSearchRow.children || boxSearchRow.children.length === 0)) {
      boxSearchRow.innerHTML = `<div class="search-box">
<span class="search-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="7"></circle>
<line x1="21" y1="21" x2="16.5" y2="16.5"></line>
</svg>
</span>
<input type="text" id="box-search-input" class="search-input"
placeholder="搜尋倉庫寶可夢名稱、暱稱、性格、副技能..."
data-i18n-placeholder="box.search_placeholder"
data-i18n-aria="box.search_placeholder"
aria-label="搜尋個人倉庫">
<button type="button" id="box-search-clear" class="search-clear-btn" style="display:none;" title="清空搜尋" aria-label="清空搜尋" data-i18n-title="pokedex.clear" data-i18n-aria="pokedex.clear">✕</button>
</div>
<div class="view-mode-toggle">
<button id="box-toggle-grid" class="toggle-btn active" data-i18n="pokedex.view_cards">卡片</button>
<button id="box-toggle-table" class="toggle-btn" data-i18n="pokedex.view_table">表格</button>
</div>`;
    }

    const hiddenFooter = document.getElementById("app-hidden-footer");
    if (hiddenFooter && (!hiddenFooter.children || hiddenFooter.children.length === 0)) {
      hiddenFooter.innerHTML = `<p data-i18n-html="footer.copyright">
Pokémon Sleep 寶可夢資料庫 &copy; 2026 ·
<a href="https://github.com/s102213039/pokemon-sleep-app" target="_blank" rel="noopener noreferrer">GitHub 原始碼</a> ·
Powered by <a href="https://www.serebii.net/" target="_blank" rel="noopener noreferrer">Serebii.net</a>
</p>
<p style="margin-top:8px;color:var(--text-muted);font-size:11px;" data-i18n="footer.sync_note">
同步功能透過 GitHub Actions 執行，點擊「同步資料」後約需 60-120 秒生效。
需先在「設定」中填入 GitHub PAT Token。
</p>`;
    }

    const appRecCtrl = document.getElementById("app-recipe-controls");
    if (appRecCtrl && (!appRecCtrl.children || appRecCtrl.children.length === 0)) {
      appRecCtrl.innerHTML = `<div class="search-filter-row">
<div class="search-box" style="width:100%;">
<span class="search-icon" aria-hidden="true">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
<circle cx="11" cy="11" r="7"></circle>
<line x1="21" y1="21" x2="16.5" y2="16.5"></line>
</svg>
</span>
<input type="text" id="recipe-search-input" class="search-input"
placeholder="搜尋料理名稱、食材..."
data-i18n-placeholder="recipes.search_placeholder"
data-i18n-aria="recipes.search_placeholder"
aria-label="搜尋料理">
<button type="button" id="recipe-search-clear" class="search-clear-btn" style="display:none;" title="清空搜尋" aria-label="清空搜尋" data-i18n-title="pokedex.clear" data-i18n-aria="pokedex.clear">
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
<line x1="18" y1="6" x2="6" y2="18"></line>
<line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
</button>
</div>
</div>`;
    }

    const dockSvgs = {"pokemon":"<svg class=\"dock-svg\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<circle cx=\"12\" cy=\"12\" r=\"10\"></circle>\n<path d=\"M2 12h7\"></path>\n<path d=\"M15 12h7\"></path>\n<circle cx=\"12\" cy=\"12\" r=\"3\"></circle>\n</svg>","recipes":"<svg class=\"dock-svg\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M3 11h18a1 1 0 0 1 1 1v2a7 7 0 0 1-14 0v-2\"></path>\n<path d=\"M7 11V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5\"></path>\n<line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"4\"></line>\n</svg>","wiki":"<svg class=\"dock-svg\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M4 19.5A2.5 2.5 0 0 1 6.5 17H20\"></path>\n<path d=\"M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\"></path>\n<line x1=\"8\" y1=\"6\" x2=\"16\" y2=\"6\"></line>\n<line x1=\"8\" y1=\"10\" x2=\"14\" y2=\"10\"></line>\n</svg>","box":"<svg class=\"dock-svg\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z\"></path>\n<polyline points=\"3.27 6.96 12 12.01 20.73 6.96\"></polyline>\n<line x1=\"12\" y1=\"22.08\" x2=\"12\" y2=\"12\"></line>\n</svg>","news":"<svg class=\"dock-svg\" viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1\"></path>\n<path d=\"M19 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-5v14z\"></path>\n<line x1=\"7\" y1=\"8\" x2=\"11\" y2=\"8\"></line>\n<line x1=\"7\" y1=\"12\" x2=\"11\" y2=\"12\"></line>\n<line x1=\"7\" y1=\"16\" x2=\"9\" y2=\"16\"></line>\n</svg>"};
    if (typeof document.querySelectorAll === "function") {
      document.querySelectorAll("[data-dock-svg]").forEach(el => {
        const key = el.getAttribute("data-dock-svg");
        if (dockSvgs[key] && (!el.children || el.children.length === 0)) el.innerHTML = dockSvgs[key];
      });
      const cSvgs = {"header":"<svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<polyline points=\"23 4 23 10 17 10\"></polyline>\n<polyline points=\"1 20 1 14 7 14\"></polyline>\n<path d=\"M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15\"></path>\n</svg>","overwrite":"<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-1.19\"/>\n</svg>","savenew":"<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<line x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"></line>\n<line x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"></line>\n</svg>"};
      document.querySelectorAll("[data-conflict-svg]").forEach(el => {
        const key = el.getAttribute("data-conflict-svg");
        if (cSvgs[key] && (!el.children || el.children.length === 0)) el.innerHTML = cSvgs[key];
      });
    }
    _shellsHydrated = true;
  }
