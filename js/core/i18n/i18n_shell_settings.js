  // ─── 設定彈窗靜態模板建構器 (Settings Modal Shell Templates) ───
  function _getSettingsModalHtml(isMobileH5) {
    return isMobileH5 ? `<div class="settings-modal-container app-settings-dialog">
<div class="settings-modal-header">
<h3 class="settings-modal-title">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="3"></circle>
<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>
<span data-i18n="settings.title">系統設定</span>
</h3>
<button type="button" id="settings-modal-close-btn" class="settings-modal-close-btn" title="關閉" aria-label="關閉" data-i18n-title="common.close" data-i18n-aria="common.close">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<line x1="18" y1="6" x2="6" y2="18"></line>
<line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
</button>
</div>
<div class="settings-modal-body app-settings-body">
<div class="app-settings-group">
<div class="app-group-header">
<span class="app-group-title">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
<circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
<circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
<circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
</svg>
<span data-i18n="settings.theme_section">外觀主題</span>
</span>
<div class="app-theme-invert-control-row">
<label class="app-theme-invert-title" for="app-theme-invert-switch" data-i18n="settings.theme_invert">反色模式</label>
<label class="switch switch-sm" for="app-theme-invert-switch" title="反色模式" data-i18n-title="header.invert_title">
<input type="checkbox" id="app-theme-invert-switch" class="switch-checkbox">
<span class="switch-slider"></span>
</label>
</div>
</div>
<div class="app-theme-grid">
<button type="button" class="theme-card-btn app-theme-chip active" data-theme-val="midnight">
<span class="theme-chip-dot" style="background: linear-gradient(135deg, #0a0f1d, #38bdf8);"></span>
<span class="theme-chip-label" data-i18n="settings.theme_midnight">深邃夜空</span>
<span class="theme-chip-check">✓</span>
</button>
<button type="button" class="theme-card-btn app-theme-chip" data-theme-val="onyx">
<span class="theme-chip-dot" style="background: linear-gradient(135deg, #050505, #94a3b8);"></span>
<span class="theme-chip-label" data-i18n="settings.theme_onyx">曜石暗影</span>
<span class="theme-chip-check">✓</span>
</button>
<button type="button" class="theme-card-btn app-theme-chip" data-theme-val="dawn">
<span class="theme-chip-dot" style="background: linear-gradient(135deg, #f8fafc, #0284c7);"></span>
<span class="theme-chip-label" data-i18n="settings.theme_dawn">晨曦暖陽</span>
<span class="theme-chip-check">✓</span>
</button>
<button type="button" class="theme-card-btn app-theme-chip" data-theme-val="emerald">
<span class="theme-chip-dot" style="background: linear-gradient(135deg, #f1f5f9, #475569);"></span>
<span class="theme-chip-label" data-i18n="settings.theme_emerald">雅緻灰石</span>
<span class="theme-chip-check">✓</span>
</button>
</div>
</div>
<div class="app-settings-group">
<div class="app-group-header">
<span class="app-group-title">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"></circle>
<line x1="2" y1="12" x2="22" y2="12"></line>
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
</svg>
<span data-i18n="settings.lang_section">介面語言</span>
</span>
</div>
<div class="app-segmented-lang">
<button type="button" id="lang-btn-zh" class="lang-btn app-segment-btn active" data-lang-val="zh-TW">
<img src="https://flagsapi.com/TW/flat/64.png" alt="TW" class="lang-flag-icon" width="18" height="18" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_zh">繁體中文</span>
</button>
<button type="button" id="lang-btn-zh-cn" class="lang-btn app-segment-btn" data-lang-val="zh-CN">
<img src="https://flagsapi.com/CN/flat/64.png" alt="CN" class="lang-flag-icon" width="18" height="18" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_zh_cn">简体中文</span>
</button>
<button type="button" id="lang-btn-en" class="lang-btn app-segment-btn" data-lang-val="en-US">
<img src="https://flagsapi.com/US/flat/64.png" alt="US" class="lang-flag-icon" width="18" height="18" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_en">English</span>
</button>
</div>
</div>
<div class="app-settings-group">
<div class="app-group-header">
<span class="app-group-title">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<polyline points="21 8 21 21 3 21 3 8"></polyline>
<rect x="1" y="3" width="22" height="5"></rect>
<line x1="10" y1="12" x2="14" y2="12"></line>
</svg>
<span data-i18n="settings.box_backup_section">倉庫備份與還原</span>
</span>
</div>
<div class="app-backup-card">
<div class="app-backup-btn-row">
<button type="button" id="settings-export-box-btn" class="app-backup-action-btn export-btn">
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
<polyline points="7 10 12 15 17 10"></polyline>
<line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
<span data-i18n="settings.box_export_btn">匯出備份 JSON</span>
</button>
<label class="app-backup-action-btn import-btn" style="cursor:pointer;margin:0;">
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
<polyline points="17 8 12 3 7 8"></polyline>
<line x1="12" y1="3" x2="12" y2="15"></line>
</svg>
<span data-i18n="settings.box_import_btn">匯入還原 JSON</span>
<input type="file" id="settings-import-box-input" accept=".json" style="display:none;">
</label>
</div>
<div class="app-cloud-sync-card" style="margin-top:10px;padding:8px 12px;background:var(--bg-hover, rgba(255,255,255,0.03));border:1px solid var(--border-color);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
<div style="font-size:12px;color:var(--text-secondary);">
<strong style="color:var(--text-primary);display:block;margin-bottom:2px;" data-i18n="settings.cloud_sync_title">雲端即時同步</strong>
<span data-i18n="settings.cloud_sync_desc">跨裝置自動同步倉庫資料</span>
</div>
<button type="button" class="box-btn box-btn-cloud-sync is-guest" onclick="window.CloudSync && window.CloudSync.openAuthModal()" style="padding:5px 10px;font-size:11.5px;">
<span class="sync-dot dot-guest"></span>
<span class="sync-text" data-i18n="settings.cloud_sync_btn">登入 / 註冊</span>
</button>
</div>
</div>
</div>
<div class="app-settings-group">
<div class="app-group-header">
<span class="app-group-title">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
</svg>
<span data-i18n="settings.telemetry_section">系統健康與診斷</span>
</span>
</div>
<div class="app-backup-card">
<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;line-height:1.4;">
<span data-i18n="settings.telemetry_desc">監控首屏載入耗時、Web Vitals 與本地快取健康狀態。若遇到功能異常，可一鍵複製診斷報告排查問題。</span>
</div>
<button type="button" id="settings-copy-diag-btn" class="app-backup-action-btn export-btn" style="width:100%;justify-content:center;" onclick="if(window.TelemetryManager){window.TelemetryManager.copyDiagnosticReport().then(function(ok){var l=(window.I18N&&window.I18N.getLanguage)?window.I18N.getLanguage():'zh-TW';alert(ok?(l==='en-US'?'Diagnostic report copied to clipboard!':(l==='zh-CN'?'诊断报告已复制至剪贴板！':'診斷報告已複製至剪貼簿！')):(l==='en-US'?'Copy failed':(l==='zh-CN'?'复制失败':'複製失敗')));});}">
<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
<span data-i18n="settings.copy_diag_btn">複製系統診斷日誌報告</span>
</button>
</div>
</div>
</div>
</div>` : `<div class="settings-modal-container">
<div class="settings-modal-header">
<h3 class="settings-modal-title">
<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="3"></circle>
<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
</svg>
<span data-i18n="settings.title">系統設定</span>
</h3>
<button type="button" id="settings-modal-close-btn" class="settings-modal-close-btn" title="關閉" data-i18n-title="common.close" data-i18n-aria="common.close">✕</button>
</div>
<div class="settings-modal-body">
<div class="settings-section-card">
<div class="settings-section-header">
<div class="settings-section-title">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
<circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
<circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
<circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z"></path>
</svg>
<span data-i18n="settings.theme_section">外觀主題風格</span>
</div>
<div class="theme-invert-control-row">
<label class="theme-invert-title" for="theme-invert-switch" data-i18n="settings.theme_invert">反色模式</label>
<label class="switch switch-sm" for="theme-invert-switch" title="反色模式" data-i18n-title="header.invert_title">
<input type="checkbox" id="theme-invert-switch" class="switch-checkbox">
<span class="switch-slider"></span>
</label>
</div>
</div>
<div class="theme-picker-grid">
<button type="button" class="theme-card-btn active" data-theme-val="midnight">
<div class="theme-card-header">
<div class="theme-card-palette">
<span class="theme-dot" style="background:#0a0f1d;"></span>
<span class="theme-dot" style="background:#1e293b;"></span>
<span class="theme-dot" style="background:#38bdf8;"></span>
</div>
<span class="theme-card-badge" data-i18n="settings.theme_active">✓ 使用中</span>
</div>
<div class="theme-card-name" data-i18n="settings.theme_midnight">深邃夜空</div>
</button>
<button type="button" class="theme-card-btn" data-theme-val="onyx">
<div class="theme-card-header">
<div class="theme-card-palette">
<span class="theme-dot" style="background:#050505;"></span>
<span class="theme-dot" style="background:#18181b;"></span>
<span class="theme-dot" style="background:#94a3b8;"></span>
</div>
<span class="theme-card-badge" data-i18n="settings.theme_active">✓ 使用中</span>
</div>
<div class="theme-card-name" data-i18n="settings.theme_onyx">曜石暗影</div>
</button>
<button type="button" class="theme-card-btn" data-theme-val="dawn">
<div class="theme-card-header">
<div class="theme-card-palette">
<span class="theme-dot" style="background:#f1f5f9;"></span>
<span class="theme-dot" style="background:#ffffff;"></span>
<span class="theme-dot" style="background:#0284c7;"></span>
</div>
<span class="theme-card-badge" data-i18n="settings.theme_active">✓ 使用中</span>
</div>
<div class="theme-card-name" data-i18n="settings.theme_dawn">晨曦暖陽</div>
</button>
<button type="button" class="theme-card-btn" data-theme-val="emerald">
<div class="theme-card-header">
<div class="theme-card-palette">
<span class="theme-dot" style="background:#f1f5f9;"></span>
<span class="theme-dot" style="background:#e2e8f0;"></span>
<span class="theme-dot" style="background:#475569;"></span>
</div>
<span class="theme-card-badge" data-i18n="settings.theme_active">✓ 使用中</span>
</div>
<div class="theme-card-name" data-i18n="settings.theme_emerald">雅緻灰石</div>
</button>
</div>
</div>
<div class="settings-section-card">
<div class="settings-section-header">
<div class="settings-section-title">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<circle cx="12" cy="12" r="10"></circle>
<line x1="2" y1="12" x2="22" y2="12"></line>
<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
</svg>
<span data-i18n="settings.lang_section">介面語言</span>
</div>
</div>
<div class="lang-switcher-row">
<button type="button" id="lang-btn-zh" class="lang-btn active" data-lang-val="zh-TW">
<img src="https://flagsapi.com/TW/flat/64.png" alt="TW" class="lang-flag-icon" width="22" height="22" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_zh">繁體中文</span>
</button>
<button type="button" id="lang-btn-zh-cn" class="lang-btn" data-lang-val="zh-CN">
<img src="https://flagsapi.com/CN/flat/64.png" alt="CN" class="lang-flag-icon" width="22" height="22" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_zh_cn">简体中文</span>
</button>
<button type="button" id="lang-btn-en" class="lang-btn" data-lang-val="en-US">
<img src="https://flagsapi.com/US/flat/64.png" alt="US" class="lang-flag-icon" width="22" height="22" loading="lazy" decoding="async" onerror="this.style.display='none'">
<span data-i18n="settings.lang_en">English</span>
</button>
</div>
</div>
<div class="settings-section-card">
<div class="settings-section-header">
<div class="settings-section-title">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<polyline points="21 8 21 21 3 21 3 8"></polyline>
<rect x="1" y="3" width="22" height="5"></rect>
<line x1="10" y1="12" x2="14" y2="12"></line>
</svg>
<span data-i18n="settings.box_backup_section">倉庫備份與還原</span>
</div>
</div>
<div style="display:flex;gap:10px;margin-top:2px;">
<button type="button" id="settings-export-box-btn" class="settings-backup-btn settings-export-btn">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
<polyline points="7 10 12 15 17 10"></polyline>
<line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
<span data-i18n="settings.box_export_btn">匯出備份 JSON</span>
</button>
<label class="settings-backup-btn settings-import-btn" style="cursor:pointer;margin:0;">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
<polyline points="17 8 12 3 7 8"></polyline>
<line x1="12" y1="3" x2="12" y2="15"></line>
</svg>
<span data-i18n="settings.box_import_btn">匯入還原 JSON</span>
<input type="file" id="settings-import-box-input" accept=".json" style="display:none;">
</label>
</div>
<div class="app-cloud-sync-card" style="margin-top:12px;padding:10px 14px;background:var(--bg-hover, rgba(255,255,255,0.03));border:1px solid var(--border-color);border-radius:8px;display:flex;justify-content:space-between;align-items:center;">
<div style="font-size:12px;color:var(--text-secondary);">
<strong style="color:var(--text-primary);display:block;margin-bottom:2px;" data-i18n="settings.cloud_sync_title">雲端即時同步 (手機與電腦)</strong>
<span data-i18n="settings.cloud_sync_desc">登入帳號即可跨裝置秒級雙向同步個人倉庫</span>
</div>
<button type="button" class="box-btn box-btn-cloud-sync is-guest" onclick="window.CloudSync && window.CloudSync.openAuthModal()" style="padding:6px 12px;font-size:12px;">
<span class="sync-dot dot-guest"></span>
<span class="sync-text" data-i18n="settings.cloud_sync_btn">登入 / 註冊</span>
</button>
</div>
</div>
<div class="settings-section-card">
<div class="settings-section-header">
<div class="settings-section-title">
<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
</svg>
<span data-i18n="settings.telemetry_section">系統健康與診斷</span>
</div>
</div>
<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">
<span data-i18n="settings.telemetry_desc">監控首屏載入耗時、Web Vitals 與本地快取健康狀態。若遇到功能異常，可一鍵複製診斷報告排查問題。</span>
</div>
<button type="button" id="settings-copy-diag-btn" class="settings-backup-btn settings-import-btn" style="width:100%;justify-content:center;" onclick="if(window.TelemetryManager){window.TelemetryManager.copyDiagnosticReport().then(function(ok){var l=(window.I18N&&window.I18N.getLanguage)?window.I18N.getLanguage():'zh-TW';alert(ok?(l==='en-US'?'Diagnostic report copied to clipboard!':(l==='zh-CN'?'诊断报告已复制至剪贴板！':'診斷報告已複製至剪貼簿！')):(l==='en-US'?'Copy failed':(l==='zh-CN'?'复制失败':'複製失敗')));});}">
<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
</svg>
<span data-i18n="settings.copy_diag_btn">複製系統診斷日誌報告</span>
</button>
</div>
</div>
</div>`;
  }
