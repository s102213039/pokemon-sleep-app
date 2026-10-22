  function showToast(title, message, type = 'success') {
    if (typeof document === 'undefined') return null;

    // 1. 防重複與節流：若 2.5 秒內有完全相同標題與內容的 Toast，直接略過
    const now = Date.now();
    const sig = `${title}__${message}`;
    if (sig === lastToastSignature && (now - lastToastTime) < 2500) {
      return null;
    }
    lastToastSignature = sig;
    lastToastTime = now;

    let container = document.getElementById('box-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'box-toast-container';
      container.className = 'box-toast-container';
      if (document.body) {
        document.body.appendChild(container);
      }
    }

    // 2. 限制畫面上最多保留 2 個最新通知，避免多重疊層遮蔽介面
    if (container && container.children && container.children.length >= 2) {
      const oldest = container.firstElementChild;
      if (oldest) oldest.remove();
    }

    const toast = document.createElement('div');
    toast.className = `box-toast-item toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>';
    } else if (type === 'warning') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
    } else if (type === 'error') {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
    } else {
      iconSvg = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    }

    toast.innerHTML = `
      <div class="box-toast-icon">${iconSvg}</div>
      <div class="box-toast-body">
        <div class="box-toast-title">${escapeHtml(title)}</div>
        <div class="box-toast-msg">${escapeHtml(message)}</div>
      </div>
      <button type="button" class="box-toast-close" onclick="this.parentElement && this.parentElement.remove()" aria-label="關閉">✕</button>
    `;

    if (container && typeof container.appendChild === 'function') {
      container.appendChild(toast);
    }

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.add('toast-fadeout');
        setTimeout(() => {
          if (toast && toast.parentElement) toast.remove();
        }, 300);
      }
    }, 4500);

    return toast;
  }

  /* ─── UI 狀態與彈窗管理 ───────────────────────────────────── */
  function updateSyncUI() {
    if (typeof document === 'undefined') return;
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const userDisplay = currentUser && currentUser.email ? currentUser.email.split('@')[0] : 'User';

    // 1. 更新桌面導航頂欄登入按鈕 (#header-cloud-auth-btn)
    const headerAuthBtn = document.getElementById('header-cloud-auth-btn');
    if (headerAuthBtn) {
      if (currentUser) {
        headerAuthBtn.classList.add('is-logged-in');
        headerAuthBtn.classList.remove('is-guest');
        headerAuthBtn.innerHTML = `
          <span class="sync-dot dot-active"></span>
          <span class="header-auth-text">${escapeHtml(userDisplay)}</span>
        `;
        headerAuthBtn.title = isEN ? `Logged in: ${userDisplay}. Click to manage sync.` : `已登入：${userDisplay}。點擊管理雲端同步。`;
      } else {
        headerAuthBtn.classList.remove('is-logged-in');
        headerAuthBtn.classList.add('is-guest');
        headerAuthBtn.innerHTML = `
          <span class="sync-dot dot-guest"></span>
          <span class="header-auth-text">${isEN ? 'Sign In / Register' : '登入 / 註冊'}</span>
        `;
        headerAuthBtn.title = isEN ? 'Sign in or register to enable cloud sync.' : '登入或註冊帳號以啟用手機/電腦即時同步。';
      }
    }

    // 2. 更新手機端頂部導航頭像按鈕 (#mobile-header-auth-btn)
    const mobileHeaderBtn = document.getElementById('mobile-header-auth-btn');
    if (mobileHeaderBtn) {
      if (currentUser) {
        mobileHeaderBtn.classList.add('is-logged-in');
        mobileHeaderBtn.classList.remove('is-guest');
        mobileHeaderBtn.title = isEN ? `Logged in: ${userDisplay}` : `已登入：${userDisplay}`;
      } else {
        mobileHeaderBtn.classList.remove('is-logged-in');
        mobileHeaderBtn.classList.add('is-guest');
        mobileHeaderBtn.title = isEN ? 'Sign In / Register' : '雲端帳號 登入 / 註冊';
      }
    }

    // 3. 倉庫區塊依需求全面移除「已同步：帳號」展示（統一由頂部導覽列帳號狀態管理）
    const boxSyncBtns = document.querySelectorAll('.box-btn-cloud-sync, #box-cloud-sync-btn, #box-mobile-cloud-sync-btn');
    boxSyncBtns.forEach(btn => {
      if (btn) btn.style.display = 'none';
    });

    // 5. 更新彈窗內狀態
    const modalStatus = document.getElementById('cloud-auth-status-info');
    if (modalStatus) {
      if (currentUser) {
        modalStatus.innerHTML = `
          <div class="auth-status-card status-active">
            <div class="auth-status-row">
              <span class="status-indicator-dot dot-active"></span>
              <strong>${isEN ? 'Cloud Sync Active' : '雲端即時同步中'}</strong>
            </div>
            <div class="auth-account-text">${isEN ? 'Account: ' : '登入帳號：'}${escapeHtml(userDisplay)}</div>
            <div class="auth-sub-hint">${isEN ? 'Data is synced in real-time across your PC and mobile devices.' : '倉庫資料已自動與雲端連動，手機與電腦雙向秒級同步。'}</div>
          </div>
        `;
      } else {
        modalStatus.innerHTML = `
          <div class="auth-status-card status-guest">
            <div class="auth-status-row">
              <span class="status-indicator-dot dot-guest"></span>
              <strong>${isEN ? 'Local Guest Mode (Not Logged In)' : '本機訪客模式 (未登入)'}</strong>
            </div>
            <div class="auth-sub-hint">${isEN 
              ? 'Enter username and password below to automatically sync your Pokémon box between phone and PC.' 
              : '輸入帳號與密碼登入或註冊，即可自動在手機與電腦間同步寶可夢倉庫。'}</div>
          </div>
        `;
      }
    }

    // 6. 切換彈窗內的按鈕展示與標題
    const loginSection = document.getElementById('cloud-auth-form-section');
    const userSection = document.getElementById('cloud-auth-user-section');
    const titleEl = document.getElementById('cloud-auth-title-text');
    if (titleEl) {
      if (currentUser) {
        titleEl.textContent = isEN ? 'Cloud Account Management' : '雲端帳號與同步管理';
      } else if (authViewMode === 'signup') {
        titleEl.textContent = isEN ? 'Register Pokémon Sleep Cloud Account' : '註冊寶可夢雲端帳號';
      } else {
        titleEl.textContent = isEN ? 'Sign In to Pokémon Sleep Cloud' : '登入寶可夢雲端帳號';
      }
    }
    if (loginSection && userSection) {
      if (currentUser) {
        loginSection.style.display = 'none';
        userSection.style.display = 'block';
      } else {
        loginSection.style.display = 'block';
        userSection.style.display = 'none';
      }
    }

    // 7. 更新倉庫 Tab 未登入引導遮罩狀態
    updateBoxAuthOverlay();
  }

  let guestDismissed = false;

  function dismissBoxAuthOverlay() {
    guestDismissed = true;
    const overlay = document.getElementById('box-auth-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    try {
      const overlays = document.querySelectorAll('.box-auth-overlay');
      if (overlays && overlays.forEach) {
        overlays.forEach(el => {
          el.style.display = 'none';
        });
      }
    } catch (e) {}
  }

  function updateBoxAuthOverlay(resetDismissed = false) {
    if (resetDismissed) {
      guestDismissed = false;
    }
    const panelBox = document.getElementById('panel-box');
    if (!panelBox) return;

    let overlay = document.getElementById('box-auth-overlay');
    if (currentUser) {
      guestDismissed = false;
      if (overlay) overlay.style.display = 'none';
      return;
    }

    if (guestDismissed) {
      if (overlay) overlay.style.display = 'none';
      return;
    }

    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';

    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'box-auth-overlay';
      overlay.className = 'box-auth-overlay';
      panelBox.insertBefore(overlay, panelBox.firstChild);
    }

    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <div class="box-auth-prompt-card">
        <div class="box-auth-prompt-icon-wrap">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
          </svg>
        </div>
        <h3 class="box-auth-prompt-title">${isEN ? 'Sign In to Pokémon Sleep Cloud Box' : '登入啟用寶可夢雲端倉庫'}</h3>
        <p class="box-auth-prompt-desc">${isEN 
          ? 'Sign in or register an account to enable real-time cross-device sync, cloud backup, and Pokémon box management.' 
          : '登入或自訂帳號註冊，即可享有電腦與手機跨裝置秒級雙向同步、即時雲端備份與完整寶可夢管理功能。'}</p>
        <button type="button" class="box-auth-prompt-btn cloud-auth-btn btn-primary" onclick="window.CloudSync && window.CloudSync.openAuthModal('signin')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>${isEN ? 'Sign In / Register' : '立即登入 / 註冊帳號'}</span>
        </button>
        <div class="box-auth-prompt-guest-row">
          <button type="button" class="box-auth-guest-link" onclick="window.CloudSync && window.CloudSync.dismissBoxAuthOverlay()">${isEN ? 'Continue as local guest (offline mode)' : '以本機訪客模式暫時使用 (離線模式)'}</button>
        </div>
      </div>
    `;
  }

  function switchAuthView(mode) {
    authViewMode = (mode === 'signup') ? 'signup' : 'signin';
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';
    const titleEl = document.getElementById('cloud-auth-title-text');
    const signinView = document.getElementById('cloud-auth-signin-view');
    const signupView = document.getElementById('cloud-auth-signup-view');
    const msgBox = document.getElementById('cloud-auth-msg');
    if (msgBox) msgBox.style.display = 'none';

    if (authViewMode === 'signup') {
      if (titleEl && !currentUser) titleEl.textContent = isEN ? 'Register Pokémon Sleep Cloud Account' : '註冊寶可夢雲端帳號';
      if (signinView) signinView.style.display = 'none';
      if (signupView) signupView.style.display = 'block';

      // 若使用者在登入框已輸入過帳號，自動帶入註冊框
      const signinUser = document.getElementById('cloud-auth-username');
      const signupUser = document.getElementById('cloud-signup-username');
      if (signinUser && signupUser && signinUser.value && !signupUser.value) {
        signupUser.value = signinUser.value.trim();
      }
      if (signupUser && typeof signupUser.focus === 'function') signupUser.focus();
    } else {
      if (titleEl && !currentUser) titleEl.textContent = isEN ? 'Sign In to Pokémon Sleep Cloud' : '登入寶可夢雲端帳號';
      if (signinView) signinView.style.display = 'block';
      if (signupView) signupView.style.display = 'none';

      // 檢查是否有儲存的帳密
      const remembered = getRememberedAuth();
      const signinUser = document.getElementById('cloud-auth-username');
      const signinPwd = document.getElementById('cloud-auth-password');
      const rememberCheck = document.getElementById('cloud-auth-remember-check');
      if (remembered) {
        if (signinUser && !signinUser.value) signinUser.value = remembered.account || '';
        if (signinPwd && !signinPwd.value) signinPwd.value = remembered.password || '';
        if (rememberCheck) rememberCheck.checked = true;
      }
      if (signinUser && typeof signinUser.focus === 'function') signinUser.focus();
    }
  }

  function openAuthModal(mode = 'signin') {
    let modal = document.getElementById('cloud-auth-modal');
    if (!modal) {
      createAuthModalDOM();
      modal = document.getElementById('cloud-auth-modal');
    }
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
      switchAuthView(mode);
      updateSyncUI();
    }
  }

  function closeAuthModal() {
    const modal = document.getElementById('cloud-auth-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    }
  }

  function createAuthModalDOM() {
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';

    const div = document.createElement('div');
    div.id = 'cloud-auth-modal';
    div.className = 'cloud-auth-backdrop';
    div.style.display = 'none';
    div.innerHTML = `
      <div class="cloud-auth-dialog">
        <div class="cloud-auth-header">
          <div class="cloud-auth-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
            <span id="cloud-auth-title-text">${isEN ? 'Sign In to Pokémon Sleep Cloud' : '登入寶可夢雲端帳號'}</span>
          </div>
          <button type="button" class="cloud-auth-close-btn" onclick="window.CloudSync.closeAuthModal()" aria-label="關閉">✕</button>
        </div>

        <div class="cloud-auth-body">
          <!-- 狀態卡片 -->
          <div id="cloud-auth-status-info"></div>

          <!-- 通用訊息提示框 (置於狀態卡片下方，登入前後皆可顯示操作反饋) -->
          <div id="cloud-auth-msg" class="cloud-auth-msg" style="display:none; margin-top: 10px;"></div>

          <!-- 登入與註冊表單區塊 (未登入時展示) -->
          <div id="cloud-auth-form-section" style="margin-top: 14px;">

            <!-- 視窗 1: 登入表單 (預設展示) -->
            <div id="cloud-auth-signin-view">
              <div class="cloud-auth-input-group">
                <label for="cloud-auth-username" class="cloud-auth-label">${isEN ? 'Account / Username' : '帳號'}</label>
                <input type="text" id="cloud-auth-username" class="cloud-auth-input" placeholder="${isEN ? 'Enter username' : '請輸入自訂帳號'}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20">
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-auth-password" class="cloud-auth-label">${isEN ? 'Password' : '密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-auth-password" class="cloud-auth-input" placeholder="${isEN ? 'Enter password' : '請輸入密碼'}" autocomplete="current-password" maxlength="32">
                  <button type="button" id="cloud-auth-pwd-toggle" class="cloud-auth-pwd-toggle" title="${isEN ? 'Toggle password visibility' : '顯示或隱藏密碼'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 記住帳號與密碼 -->
              <label class="cloud-auth-remember-row" for="cloud-auth-remember-check">
                <input type="checkbox" id="cloud-auth-remember-check">
                <span>${isEN ? 'Remember account & password' : '記住帳號與密碼'}</span>
              </label>

              <button type="button" id="cloud-auth-signin-btn" class="cloud-auth-btn btn-primary" style="width: 100%;">${isEN ? 'Sign In' : '登入帳號'}</button>

              <div class="cloud-auth-footer-link">
                ${isEN ? "Don't have an account yet?" : '還沒有雲端帳號？'}
                <button type="button" id="cloud-switch-to-signup" class="cloud-auth-switch-btn">${isEN ? 'Register Now' : '一鍵註冊'}</button>
              </div>
            </div>

            <!-- 視窗 2: 註冊表單 (獨立視窗) -->
            <div id="cloud-auth-signup-view" style="display: none;">
              <div class="cloud-auth-input-group">
                <label for="cloud-signup-username" class="cloud-auth-label">${isEN ? 'Set Username' : '自訂帳號'}</label>
                <input type="text" id="cloud-signup-username" class="cloud-auth-input" placeholder="${isEN ? '3-20 characters (letters, numbers, _)' : '3 ~ 20 位英文、數字或底線'}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20">
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-signup-password" class="cloud-auth-label">${isEN ? 'Set Password' : '自訂密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-signup-password" class="cloud-auth-input" placeholder="${isEN ? '6-32 characters' : '6 ~ 32 位密碼'}" autocomplete="new-password" maxlength="32">
                  <button type="button" id="cloud-signup-pwd-toggle" class="cloud-auth-pwd-toggle" title="${isEN ? 'Toggle password visibility' : '顯示或隱藏密碼'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-signup-pwd-confirm" class="cloud-auth-label">${isEN ? 'Confirm Password' : '確認密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-signup-pwd-confirm" class="cloud-auth-input" placeholder="${isEN ? 'Repeat password' : '請再次輸入密碼'}" autocomplete="new-password" maxlength="32">
                  <button type="button" id="cloud-signup-confirm-toggle" class="cloud-auth-pwd-toggle" title="${isEN ? 'Toggle password visibility' : '顯示或隱藏密碼'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="button" id="cloud-auth-signup-btn" class="cloud-auth-btn btn-primary" style="width: 100%;">${isEN ? 'Create Account' : '立即建立帳號'}</button>

              <div class="cloud-auth-footer-link">
                ${isEN ? 'Already have an account?' : '已經有雲端帳號？'}
                <button type="button" id="cloud-switch-to-signin" class="cloud-auth-switch-btn">${isEN ? 'Back to Sign In' : '返回登入'}</button>
              </div>
            </div>
          </div>

          <!-- 已登入操作區塊 (已登入時展示) -->
          <div id="cloud-auth-user-section" style="display:none; margin-top: 14px;">
            <div class="cloud-auth-btn-row">
              <button type="button" id="cloud-auth-manual-sync-btn" class="cloud-auth-btn btn-primary">${isEN ? 'Sync Now' : '立即手動同步'}</button>
              <button type="button" id="cloud-auth-signout-btn" class="cloud-auth-btn btn-danger">${isEN ? 'Sign Out' : '登出帳號'}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(div);

    // 點擊彈窗外部背景關閉彈窗
    div.addEventListener('click', (e) => {
      if (e.target === div) {
        closeAuthModal();
      }
    });

    bindAuthModalEvents();
  }

  function bindAuthModalEvents() {
    // 登入元件
    const signinUser = document.getElementById('cloud-auth-username');
    const signinPwd = document.getElementById('cloud-auth-password');
    const signinPwdToggle = document.getElementById('cloud-auth-pwd-toggle');
    const rememberCheck = document.getElementById('cloud-auth-remember-check');
    const signInBtn = document.getElementById('cloud-auth-signin-btn');
    const switchToSignupBtn = document.getElementById('cloud-switch-to-signup');

    // 註冊元件
    const signupUser = document.getElementById('cloud-signup-username');
    const signupPwd = document.getElementById('cloud-signup-password');
    const signupPwdToggle = document.getElementById('cloud-signup-pwd-toggle');
    const signupConfirm = document.getElementById('cloud-signup-pwd-confirm');
    const signupConfirmToggle = document.getElementById('cloud-signup-confirm-toggle');
    const signUpBtn = document.getElementById('cloud-auth-signup-btn');
    const switchToSigninBtn = document.getElementById('cloud-switch-to-signin');

    // 通用元件
    const signOutBtn = document.getElementById('cloud-auth-signout-btn');
    const manualSyncBtn = document.getElementById('cloud-auth-manual-sync-btn');
    const msgBox = document.getElementById('cloud-auth-msg');

    // 密碼顯示/隱藏切換
    function setupPwdToggle(btn, input) {
      if (btn && input) {
        btn.onclick = () => {
          input.type = input.type === 'password' ? 'text' : 'password';
        };
      }
    }
    setupPwdToggle(signinPwdToggle, signinPwd);
    setupPwdToggle(signupPwdToggle, signupPwd);
    setupPwdToggle(signupConfirmToggle, signupConfirm);

    // 切換頁面事件
    if (switchToSignupBtn) {
      switchToSignupBtn.onclick = () => switchAuthView('signup');
    }
    if (switchToSigninBtn) {
      switchToSigninBtn.onclick = () => switchAuthView('signin');
    }

    function showMsg(text, isError = true) {
      if (!msgBox) return;
      msgBox.style.display = 'block';
      msgBox.className = `cloud-auth-msg ${isError ? 'msg-error' : 'msg-success'}`;
      msgBox.textContent = text;
    }

    function clearMsg() {
      if (msgBox) msgBox.style.display = 'none';
    }

    // 鍵盤 Enter 鍵快速提交
    if (signinUser) {
      signinUser.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (signinPwd && !signinPwd.value) {
            signinPwd.focus();
          } else if (signInBtn) {
            signInBtn.click();
          }
        }
      });
    }
    if (signinPwd) {
      signinPwd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && signInBtn) {
          signInBtn.click();
        }
      });
    }

    if (signupUser) {
      signupUser.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && signupPwd && !signupPwd.value) {
          signupPwd.focus();
        }
      });
    }
    if (signupPwd) {
      signupPwd.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && signupConfirm && !signupConfirm.value) {
          signupConfirm.focus();
        }
      });
    }
    if (signupConfirm) {
      signupConfirm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && signUpBtn) {
          signUpBtn.click();
        }
      });
    }

    // 登入操作
    if (signInBtn) {
      signInBtn.onclick = async () => {
        clearMsg();
        const account = signinUser ? signinUser.value.trim() : '';
        const pwd = signinPwd ? signinPwd.value : '';
        const isRemember = rememberCheck ? rememberCheck.checked : false;

        if (!account) {
          showMsg('請輸入自訂帳號！');
          return;
        }
        if (!pwd) {
          showMsg('請輸入密碼！');
          return;
        }

        signInBtn.disabled = true;
        signInBtn.textContent = '登入中...';
        const res = await signInWithPassword(account, pwd);
        signInBtn.disabled = false;
        signInBtn.textContent = '登入帳號';

        if (res.success) {
          saveRememberedAuth(account, pwd, isRemember);
          // 立即關閉視窗與遮罩，直接進入主頁面，絕不展示任何確認框或過渡畫面
          closeAuthModal();
          dismissBoxAuthOverlay();
          // 使用右下角浮動 Toast 進行狀態提醒
          showToast('登入成功', `歡迎回來，${account}！已連線雲端即時同步。`, 'success');
        } else {
          showMsg(res.error || '登入失敗，請檢查帳號密碼！');
        }
      };
    }

    // 註冊操作
    if (signUpBtn) {
      signUpBtn.onclick = async () => {
        clearMsg();
        const account = signupUser ? signupUser.value.trim() : '';
        const pwd = signupPwd ? signupPwd.value : '';
        const confirm = signupConfirm ? signupConfirm.value : '';

        if (!account) {
          showMsg('請輸入自訂帳號！');
          return;
        }
        if (!pwd) {
          showMsg('請輸入自訂密碼！');
          return;
        }
        if (pwd !== confirm) {
          showMsg('兩次輸入的密碼不一致，請重新檢查！');
          return;
        }

        signUpBtn.disabled = true;
        signUpBtn.textContent = '建立中...';
        const res = await signUpWithPassword(account, pwd);
        signUpBtn.disabled = false;
        signUpBtn.textContent = '立即建立帳號';

        if (res.success) {
          saveRememberedAuth(account, pwd, true);
          // 立即關閉視窗與遮罩，直接進入主頁面
          closeAuthModal();
          dismissBoxAuthOverlay();
          showToast('註冊成功', `歡迎使用，${account}！已自動登入並建立雲端倉庫。`, 'success');
        } else {
          showMsg(res.error || '註冊失敗，請稍後再試！');
        }
      };
    }

    // 登出操作
    if (signOutBtn) {
      signOutBtn.onclick = async () => {
        clearMsg();
        signOutBtn.disabled = true;
        await signOut();
        signOutBtn.disabled = false;
        closeAuthModal();
        updateBoxAuthOverlay(true);
        showToast('已登出', '目前已切換為本機訪客模式。', 'info');
      };
    }

    // 手動同步操作
    if (manualSyncBtn) {
      manualSyncBtn.onclick = async () => {
        clearMsg();
        manualSyncBtn.disabled = true;
        manualSyncBtn.textContent = '同步中...';
        await triggerInitialSyncAndMerge();
        manualSyncBtn.disabled = false;
        manualSyncBtn.textContent = '立即手動同步';
        closeAuthModal();
        showToast('手動同步完成', '寶可夢倉庫已與雲端完成最新同步。', 'success');
      };
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─── 全域鍵盤快捷鍵 (Escape 鍵關閉彈窗) ─────────────────── */
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('cloud-auth-modal');
        if (modal && modal.style.display !== 'none') {
          closeAuthModal();
        }
      }
    });
  }

  /* ─── 頁面載入完成後自動初始化 ───────────────────────────── */
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', () => {
      initClient();
    });
  }

  /* ─── 全域命名空間匯出 ───────────────────────────────────── */
  const CloudSyncModule = {
    init: initClient,
    signInWithPassword,
    signUpWithPassword,
    signOut,
    pushCloudBox,
    pullCloudBox: fetchRemoteBox,
    syncNow: triggerInitialSyncAndMerge,
    isLoggedIn: () => !!currentUser,
    getUser: () => currentUser,
    getStatus: () => syncStatus,
    openAuthModal,
    closeAuthModal,
    switchAuthView,
    updateBoxAuthOverlay,
    dismissBoxAuthOverlay,
    getRememberedAuth,
    saveRememberedAuth,
    showToast,
    onRemoteUpdate,
    onAuthStateChange,
    saveCustomConfig,
    clearCustomConfig,
    mergePokemonBoxes,
    parseAndValidateAccount,
    validatePassword
  };

  if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showAppToast = showToast;
    window.CloudSync = CloudSyncModule;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncModule;
  }
})();
