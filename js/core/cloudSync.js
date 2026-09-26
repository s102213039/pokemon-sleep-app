/**
 * cloudSync.js — 我的寶可夢倉庫 雲端資料庫與帳號即時同步核心 (Supabase BaaS)
 * =========================================================================
 * 1. 支援 Supabase 帳號密碼登入 (Sign In) 與一鍵註冊 (Sign Up)
 * 2. 雙軌資料同步 (LocalStorage 本機離線快取 + 雲端資料庫雙向備份)
 * 3. 智慧聯集合併演算法 (Merge Algorithm, 防覆蓋與指紋去重)
 * 4. WebSocket Realtime 即時推送監聽 (跨裝置秒級無感刷新)
 * 5. 零配置平滑降級 (若未配置或處於離線狀態，自動維持本機訪客模式，零報錯)
 */

(function () {
  'use strict';

  const STORAGE_KEY_USER_BOX = 'PKMSLEEP_USER_BOX_V1';
  const STORAGE_KEY_CONFIG = 'PKMSLEEP_SUPABASE_CONFIG_V1';

  // 預設可填入全域 Supabase 專案配置（若使用者未在 UI 自訂，以此為基準）
  const DEFAULT_CONFIG = {
    url: (typeof window !== 'undefined' && window.__SUPABASE_URL__) || '',
    anonKey: (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || ''
  };

  let supabaseClient = null;
  let currentUser = null;
  let realtimeChannel = null;
  let pushDebounceTimer = null;
  let remoteUpdateCallbacks = [];
  let authStateCallbacks = [];
  let syncStatus = 'guest'; // 'guest' | 'connecting' | 'synced' | 'syncing' | 'offline' | 'error'
  let lastSyncError = '';

  /* ─── 讀取與儲存配置 ───────────────────────────────────────── */
  function getActiveConfig() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.url && parsed.anonKey) {
            return parsed;
          }
        }
      }
    } catch (e) {
      console.warn('[CloudSync] Failed to read custom config from localStorage:', e);
    }
    return DEFAULT_CONFIG;
  }

  function saveCustomConfig(url, anonKey) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
          url: (url || '').trim(),
          anonKey: (anonKey || '').trim()
        }));
      }
    } catch (e) {
      console.error('[CloudSync] Failed to save custom config:', e);
    }
    initClient();
  }

  function clearCustomConfig() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY_CONFIG);
      }
    } catch (e) {}
    initClient();
  }

  /* ─── 初始化 Supabase Client ───────────────────────────────── */
  function initClient() {
    const config = getActiveConfig();
    const hasValidConfig = !!(config.url && config.anonKey);

    if (!hasValidConfig || typeof window === 'undefined' || !window.supabase || typeof window.supabase.createClient !== 'function') {
      supabaseClient = null;
      currentUser = null;
      syncStatus = hasValidConfig ? 'offline' : 'guest';
      notifyAuthStateChanged();
      updateSyncUI();
      return false;
    }

    try {
      supabaseClient = window.supabase.createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });

      // 檢查現有 Session
      supabaseClient.auth.getSession().then(({ data, error }) => {
        if (!error && data && data.session && data.session.user) {
          currentUser = data.session.user;
          syncStatus = 'synced';
          notifyAuthStateChanged();
          subscribeToRealtime();
          triggerInitialSyncAndMerge();
        } else {
          currentUser = null;
          syncStatus = 'guest';
          notifyAuthStateChanged();
        }
        updateSyncUI();
      }).catch(err => {
        console.warn('[CloudSync] Check session failed:', err);
        syncStatus = 'guest';
        updateSyncUI();
      });

      // 監聽 Auth 狀態改變
      supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session && session.user) {
          currentUser = session.user;
          syncStatus = 'synced';
          notifyAuthStateChanged();
          subscribeToRealtime();
          triggerInitialSyncAndMerge();
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          syncStatus = 'guest';
          unsubscribeRealtime();
          notifyAuthStateChanged();
        }
        updateSyncUI();
      });

      return true;
    } catch (err) {
      console.error('[CloudSync] Initialization error:', err);
      supabaseClient = null;
      currentUser = null;
      syncStatus = 'error';
      lastSyncError = err.message || '初始化失敗';
      updateSyncUI();
      return false;
    }
  }

  /* ─── 帳號密碼註冊與登入 ───────────────────────────────────── */
  async function signUpWithPassword(email, password) {
    if (!supabaseClient) {
      return { success: false, error: '尚未配置 Supabase 專案網址與金鑰，請先於設定中填入！' };
    }
    const cleanEmail = (email || '').trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: '請輸入有效的電子郵件地址！' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: '密碼長度至少需為 6 個字元！' };
    }

    try {
      syncStatus = 'connecting';
      updateSyncUI();

      const { data, error } = await supabaseClient.auth.signUp({
        email: cleanEmail,
        password: password
      });

      if (error) {
        syncStatus = currentUser ? 'synced' : 'guest';
        updateSyncUI();
        return { success: false, error: error.message };
      }

      if (data && data.user) {
        currentUser = data.user;
        syncStatus = 'synced';
        notifyAuthStateChanged();
        subscribeToRealtime();
        await triggerInitialSyncAndMerge();
        updateSyncUI();
        return { success: true, user: data.user, session: data.session };
      }

      return { success: true, message: '註冊確認信已寄送至信箱，請查收驗證後登入！' };
    } catch (err) {
      syncStatus = currentUser ? 'synced' : 'guest';
      updateSyncUI();
      return { success: false, error: err.message || '註冊時發生未知錯誤' };
    }
  }

  async function signInWithPassword(email, password) {
    if (!supabaseClient) {
      return { success: false, error: '尚未配置 Supabase 專案網址與金鑰，請先於設定中填入！' };
    }
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      return { success: false, error: '請輸入帳號或電子郵件！' };
    }
    if (!password) {
      return { success: false, error: '請輸入密碼！' };
    }

    try {
      syncStatus = 'connecting';
      updateSyncUI();

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        syncStatus = currentUser ? 'synced' : 'guest';
        updateSyncUI();
        return { success: false, error: error.message };
      }

      if (data && data.user) {
        currentUser = data.user;
        syncStatus = 'synced';
        notifyAuthStateChanged();
        subscribeToRealtime();
        await triggerInitialSyncAndMerge();
        updateSyncUI();
        return { success: true, user: data.user, session: data.session };
      }

      return { success: false, error: '登入失敗，查無使用者資訊' };
    } catch (err) {
      syncStatus = currentUser ? 'synced' : 'guest';
      updateSyncUI();
      return { success: false, error: err.message || '登入時發生錯誤' };
    }
  }

  async function signOut() {
    if (!supabaseClient) {
      currentUser = null;
      syncStatus = 'guest';
      notifyAuthStateChanged();
      updateSyncUI();
      return { success: true };
    }

    try {
      await supabaseClient.auth.signOut();
      currentUser = null;
      syncStatus = 'guest';
      unsubscribeRealtime();
      notifyAuthStateChanged();
      updateSyncUI();
      return { success: true };
    } catch (err) {
      console.error('[CloudSync] Sign out error:', err);
      currentUser = null;
      syncStatus = 'guest';
      notifyAuthStateChanged();
      updateSyncUI();
      return { success: false, error: err.message };
    }
  }

  /* ─── 智慧指紋與資料合併演算法 (Union Merge) ───────────────── */
  function getPokemonFingerprint(p) {
    if (!p) return '';
    const sks = (p.subskills || []).slice().sort().join(',');
    return `${p.pokemonId || p.name || ''}_Lv${p.level || 1}_${p.nature || ''}_${sks}_${p.ing1 || ''}_${p.ing2 || ''}_${p.ing3 || ''}`;
  }

  function mergePokemonBoxes(localList, remoteList) {
    if (!Array.isArray(localList) || localList.length === 0) return Array.isArray(remoteList) ? remoteList.slice() : [];
    if (!Array.isArray(remoteList) || remoteList.length === 0) return localList.slice();

    const merged = [];
    const seenUids = new Set();
    const seenFingerprints = new Set();

    // 優先以 remoteList 為基底，紀錄 UID 與指紋
    remoteList.forEach(item => {
      if (item && item.uid) {
        seenUids.add(item.uid);
      }
      const fp = getPokemonFingerprint(item);
      if (fp) seenFingerprints.add(fp);
      merged.push(item);
    });

    // 檢視 localList，若 UID 或指紋均未存在，則視為在離線時新增的寶可夢，進行聯集合併
    localList.forEach(item => {
      if (!item) return;
      const fp = getPokemonFingerprint(item);
      if (item.uid && seenUids.has(item.uid)) {
        // UID 重複：比對時間戳記，若本機較新則替換
        const existingIdx = merged.findIndex(m => m.uid === item.uid);
        if (existingIdx !== -1) {
          const remoteTime = merged[existingIdx].updatedAt || merged[existingIdx].createdAt || 0;
          const localTime = item.updatedAt || item.createdAt || 0;
          if (localTime > remoteTime) {
            merged[existingIdx] = item;
          }
        }
      } else if (fp && seenFingerprints.has(fp)) {
        // 指紋相同（同寶可夢、同等級、同副技能、同性格）：略過避免重複
      } else {
        // 新增的實體，納入合併庫
        if (!item.uid) {
          item.uid = 'pkm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        }
        merged.push(item);
        seenUids.add(item.uid);
        if (fp) seenFingerprints.add(fp);
      }
    });

    return merged;
  }

  /* ─── 雲端資料庫讀取與推送 (Pull & Push) ─────────────────────── */
  async function fetchRemoteBox() {
    if (!supabaseClient || !currentUser) return null;

    try {
      const { data, error } = await supabaseClient
        .from('user_boxes')
        .select('box_data, updated_at')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.warn('[CloudSync] fetchRemoteBox error:', error);
        return null;
      }

      if (data && Array.isArray(data.box_data)) {
        return data.box_data;
      }
      return [];
    } catch (err) {
      console.warn('[CloudSync] fetchRemoteBox exception:', err);
      return null;
    }
  }

  async function pushRemoteBox(boxData) {
    if (!supabaseClient || !currentUser) return false;

    try {
      syncStatus = 'syncing';
      updateSyncUI();

      const payload = {
        user_id: currentUser.id,
        box_data: Array.isArray(boxData) ? boxData : [],
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('user_boxes')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.error('[CloudSync] pushRemoteBox failed:', error);
        syncStatus = 'error';
        lastSyncError = error.message;
        updateSyncUI();
        return false;
      }

      syncStatus = 'synced';
      lastSyncError = '';
      updateSyncUI();
      return true;
    } catch (err) {
      console.error('[CloudSync] pushRemoteBox exception:', err);
      syncStatus = 'error';
      lastSyncError = err.message || '同步推送失敗';
      updateSyncUI();
      return false;
    }
  }

  /* ─── 首次登入與初始雙軌合併 ───────────────────────────────── */
  async function triggerInitialSyncAndMerge() {
    if (!supabaseClient || !currentUser) return;

    try {
      syncStatus = 'syncing';
      updateSyncUI();

      // 1. 取得本機既有 LocalStorage 資料
      let localBox = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY_USER_BOX);
        if (raw) localBox = JSON.parse(raw);
        if (!Array.isArray(localBox)) localBox = [];
      } catch (e) {
        localBox = [];
      }

      // 2. 取得雲端既有資料
      const remoteBox = await fetchRemoteBox();

      let finalMerged = [];
      if (remoteBox === null) {
        // 雲端尚未建立此記錄或查詢失敗：直接上傳本機資料
        finalMerged = localBox;
        await pushRemoteBox(finalMerged);
      } else if (remoteBox.length === 0 && localBox.length > 0) {
        // 雲端是空倉庫，本機有資料：上傳本機資料至雲端
        finalMerged = localBox;
        await pushRemoteBox(finalMerged);
      } else if (remoteBox.length > 0 && localBox.length === 0) {
        // 本機是空倉庫，雲端有資料：以雲端資料覆蓋本機
        finalMerged = remoteBox;
      } else {
        // 兩端皆有資料：執行智慧聯集合併
        finalMerged = mergePokemonBoxes(localBox, remoteBox);
        await pushRemoteBox(finalMerged);
      }

      // 3. 寫回本機 LocalStorage 並通知 Box 模組更新
      try {
        localStorage.setItem(STORAGE_KEY_USER_BOX, JSON.stringify(finalMerged));
      } catch (e) {}

      if (typeof window !== 'undefined' && window.PokemonBoxApp && typeof window.PokemonBoxApp.setUserBox === 'function') {
        window.PokemonBoxApp.setUserBox(finalMerged);
      }

      syncStatus = 'synced';
      updateSyncUI();
    } catch (err) {
      console.error('[CloudSync] Initial sync failed:', err);
      syncStatus = 'error';
      lastSyncError = err.message || '首次同步失敗';
      updateSyncUI();
    }
  }

  /* ─── 帶防抖 (Debounce) 的外部推送介面 ─────────────────────── */
  function pushCloudBox(boxData) {
    if (!supabaseClient || !currentUser) return;

    if (pushDebounceTimer) {
      clearTimeout(pushDebounceTimer);
    }

    pushDebounceTimer = setTimeout(() => {
      pushRemoteBox(boxData);
    }, 800);
  }

  /* ─── WebSocket Realtime 跨裝置即時推送監聽 ───────────────── */
  function subscribeToRealtime() {
    if (!supabaseClient || !currentUser) return;
    unsubscribeRealtime();

    try {
      realtimeChannel = supabaseClient
        .channel(`user_box_${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_boxes',
            filter: `user_id=eq.${currentUser.id}`
          },
          (payload) => {
            if (payload && payload.new && Array.isArray(payload.new.box_data)) {
              handleRemoteUpdateReceived(payload.new.box_data);
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[CloudSync] Realtime subscription error:', err);
    }
  }

  function unsubscribeRealtime() {
    if (realtimeChannel && supabaseClient) {
      try {
        supabaseClient.removeChannel(realtimeChannel);
      } catch (e) {}
      realtimeChannel = null;
    }
  }

  function handleRemoteUpdateReceived(remoteBox) {
    // 收到來自另一裝置的更新
    try {
      localStorage.setItem(STORAGE_KEY_USER_BOX, JSON.stringify(remoteBox));
    } catch (e) {}

    // 通知外部註冊之回調
    remoteUpdateCallbacks.forEach(cb => {
      try { cb(remoteBox); } catch (e) {}
    });

    syncStatus = 'synced';
    updateSyncUI();
  }

  /* ─── 監聽器與回調註冊 ─────────────────────────────────────── */
  function onRemoteUpdate(cb) {
    if (typeof cb === 'function') {
      remoteUpdateCallbacks.push(cb);
    }
  }

  function onAuthStateChange(cb) {
    if (typeof cb === 'function') {
      authStateCallbacks.push(cb);
    }
  }

  function notifyAuthStateChanged() {
    authStateCallbacks.forEach(cb => {
      try { cb(currentUser); } catch (e) {}
    });
  }

  /* ─── UI 狀態與彈窗管理 ───────────────────────────────────── */
  function updateSyncUI() {
    if (typeof document === 'undefined') return;
    const isEN = typeof window !== 'undefined' && window.I18N && window.I18N.getLanguage() === 'en-US';

    // 1. 更新頂部狀態標籤 (桌面端與手機端按鈕)
    const syncBtns = document.querySelectorAll('.box-btn-cloud-sync, #box-cloud-sync-btn, .box-cloud-sync-chip');
    syncBtns.forEach(btn => {
      if (!btn) return;
      if (currentUser) {
        btn.classList.add('is-logged-in');
        btn.classList.remove('is-guest');
        const userDisplay = currentUser.email ? currentUser.email.split('@')[0] : 'User';
        btn.innerHTML = `
          <span class="sync-dot dot-active"></span>
          <span class="sync-text">${isEN ? `Synced: ${escapeHtml(userDisplay)}` : `已同步：${escapeHtml(userDisplay)}`}</span>
        `;
        btn.title = isEN ? `Logged in as ${currentUser.email}. Click to manage cloud sync.` : `已登入：${currentUser.email}。點擊管理雲端同步。`;
      } else {
        btn.classList.remove('is-logged-in');
        btn.classList.add('is-guest');
        btn.innerHTML = `
          <span class="sync-dot dot-guest"></span>
          <span class="sync-text">${isEN ? 'Cloud: Guest' : '雲端同步：訪客'}</span>
        `;
        btn.title = isEN ? 'Operating in local guest mode. Click to sign in and enable cloud sync.' : '目前為本機訪客模式。點擊登入以啟用手機/電腦即時同步。';
      }
    });

    // 2. 更新彈窗內狀態
    const modalStatus = document.getElementById('cloud-auth-status-info');
    if (modalStatus) {
      if (currentUser) {
        modalStatus.innerHTML = `
          <div class="auth-status-card status-active">
            <div class="auth-status-row">
              <span class="status-indicator-dot dot-active"></span>
              <strong>${isEN ? 'Cloud Sync Active' : '雲端即時同步中'}</strong>
            </div>
            <div class="auth-account-text">${isEN ? 'Account: ' : '登入帳號：'}${escapeHtml(currentUser.email || 'User')}</div>
            <div class="auth-sub-hint">${isEN ? 'Data is synced in real-time across your PC and mobile devices.' : '倉庫資料已自動與雲端連動，手機與電腦雙向秒級同步。'}</div>
          </div>
        `;
      } else {
        const config = getActiveConfig();
        const hasConfig = !!(config.url && config.anonKey);
        modalStatus.innerHTML = `
          <div class="auth-status-card status-guest">
            <div class="auth-status-row">
              <span class="status-indicator-dot dot-guest"></span>
              <strong>${isEN ? 'Local Guest Mode' : '本機訪客模式 (未登入)'}</strong>
            </div>
            <div class="auth-sub-hint">${hasConfig 
              ? (isEN ? 'Sign in with your account to automatically sync your Pokémon between phone and PC.' : '輸入帳號密碼登入或註冊，即可自動在手機與電腦間同步寶可夢。')
              : (isEN ? 'Supabase project not yet configured. You can expand Settings below to connect your own Supabase project.' : '尚未配置 Supabase 專案。可展開下方「進階配置」填入個人 Supabase 專案網址與金鑰。')}</div>
          </div>
        `;
      }
    }

    // 3. 切換彈窗內的按鈕展示
    const loginSection = document.getElementById('cloud-auth-form-section');
    const userSection = document.getElementById('cloud-auth-user-section');
    if (loginSection && userSection) {
      if (currentUser) {
        loginSection.style.display = 'none';
        userSection.style.display = 'block';
      } else {
        loginSection.style.display = 'block';
        userSection.style.display = 'none';
      }
    }
  }

  function openAuthModal() {
    let modal = document.getElementById('cloud-auth-modal');
    if (!modal) {
      createAuthModalDOM();
      modal = document.getElementById('cloud-auth-modal');
    }
    if (modal) {
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
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
    const config = getActiveConfig();

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
            <span>${isEN ? 'Pokémon Box Cloud Sync' : '寶可夢倉庫 雲端雙軌同步'}</span>
          </div>
          <button type="button" class="cloud-auth-close-btn" onclick="window.CloudSync.closeAuthModal()" aria-label="關閉">✕</button>
        </div>

        <div class="cloud-auth-body">
          <!-- 狀態卡片 -->
          <div id="cloud-auth-status-info"></div>

          <!-- 登入與註冊表單區塊 (未登入時展示) -->
          <div id="cloud-auth-form-section" style="margin-top: 14px;">
            <div class="cloud-auth-input-group">
              <label for="cloud-auth-email" class="cloud-auth-label">${isEN ? 'Email / Account' : '電子信箱 / 帳號'}</label>
              <input type="email" id="cloud-auth-email" class="cloud-auth-input" placeholder="user@example.com" autocomplete="username">
            </div>

            <div class="cloud-auth-input-group">
              <label for="cloud-auth-password" class="cloud-auth-label">${isEN ? 'Password (Min. 6 chars)' : '密碼 (至少 6 個字元)'}</label>
              <div class="cloud-auth-password-wrap">
                <input type="password" id="cloud-auth-password" class="cloud-auth-input" placeholder="••••••••" autocomplete="current-password">
                <button type="button" id="cloud-auth-pwd-toggle" class="cloud-auth-pwd-toggle" title="顯示/隱藏密碼">👁</button>
              </div>
            </div>

            <div id="cloud-auth-msg" class="cloud-auth-msg" style="display:none;"></div>

            <div class="cloud-auth-btn-row">
              <button type="button" id="cloud-auth-signin-btn" class="cloud-auth-btn btn-primary">${isEN ? 'Sign In' : '登入帳號'}</button>
              <button type="button" id="cloud-auth-signup-btn" class="cloud-auth-btn btn-secondary">${isEN ? 'Register New' : '一秒註冊'}</button>
            </div>
          </div>

          <!-- 已登入操作區塊 (已登入時展示) -->
          <div id="cloud-auth-user-section" style="display:none; margin-top: 14px;">
            <div class="cloud-auth-btn-row">
              <button type="button" id="cloud-auth-manual-sync-btn" class="cloud-auth-btn btn-primary">${isEN ? 'Sync Now' : '立即手動同步'}</button>
              <button type="button" id="cloud-auth-signout-btn" class="cloud-auth-btn btn-danger">${isEN ? 'Sign Out' : '登出帳號'}</button>
            </div>
          </div>

          <!-- 進階配置折疊卡片 -->
          <div class="cloud-config-accordion">
            <button type="button" id="cloud-config-toggle-btn" class="cloud-config-toggle">
              <span>${isEN ? 'Advanced: Supabase Server Configuration' : '進階設定：Supabase 伺服器配置'}</span>
              <svg viewBox="0 0 12 8" width="10" height="6"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1 1.5L6 6.5L11 1.5"/></svg>
            </button>
            <div id="cloud-config-content" class="cloud-config-content" style="display:none;">
              <p class="cloud-config-hint">${isEN ? 'Enter your own Supabase project URL and anon public key to host your private database.' : '可填入您自己的 Supabase Project URL 與 public anon key，所有資料庫權限將完全由您掌控。'}</p>
              <div class="cloud-auth-input-group">
                <label for="cloud-config-url" class="cloud-auth-label">Project URL</label>
                <input type="text" id="cloud-config-url" class="cloud-auth-input" placeholder="https://xyzcompany.supabase.co" value="${escapeHtml(config.url || '')}">
              </div>
              <div class="cloud-auth-input-group">
                <label for="cloud-config-key" class="cloud-auth-label">Anon Public Key</label>
                <input type="text" id="cloud-config-key" class="cloud-auth-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." value="${escapeHtml(config.anonKey || '')}">
              </div>
              <div class="cloud-auth-btn-row" style="margin-top: 8px;">
                <button type="button" id="cloud-config-save-btn" class="cloud-auth-btn btn-secondary" style="font-size:12px;padding:6px 12px;">${isEN ? 'Save Configuration' : '儲存配置'}</button>
                <button type="button" id="cloud-config-clear-btn" class="cloud-auth-btn btn-outline" style="font-size:12px;padding:6px 12px;">${isEN ? 'Reset' : '重設'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(div);
    bindAuthModalEvents();
  }

  function bindAuthModalEvents() {
    const emailInput = document.getElementById('cloud-auth-email');
    const pwdInput = document.getElementById('cloud-auth-password');
    const pwdToggle = document.getElementById('cloud-auth-pwd-toggle');
    const signInBtn = document.getElementById('cloud-auth-signin-btn');
    const signUpBtn = document.getElementById('cloud-auth-signup-btn');
    const signOutBtn = document.getElementById('cloud-auth-signout-btn');
    const manualSyncBtn = document.getElementById('cloud-auth-manual-sync-btn');
    const msgBox = document.getElementById('cloud-auth-msg');

    const configToggle = document.getElementById('cloud-config-toggle-btn');
    const configContent = document.getElementById('cloud-config-content');
    const configUrl = document.getElementById('cloud-config-url');
    const configKey = document.getElementById('cloud-config-key');
    const configSave = document.getElementById('cloud-config-save-btn');
    const configClear = document.getElementById('cloud-config-clear-btn');

    if (pwdToggle && pwdInput) {
      pwdToggle.onclick = () => {
        pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
      };
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

    if (signInBtn) {
      signInBtn.onclick = async () => {
        clearMsg();
        const email = emailInput ? emailInput.value : '';
        const pwd = pwdInput ? pwdInput.value : '';
        signInBtn.disabled = true;
        signInBtn.textContent = '登入中...';
        const res = await signInWithPassword(email, pwd);
        signInBtn.disabled = false;
        signInBtn.textContent = '登入帳號';
        if (res.success) {
          showMsg('登入成功！已啟動跨裝置即時同步。', false);
          setTimeout(() => closeAuthModal(), 1200);
        } else {
          showMsg(res.error || '登入失敗，請檢查帳號密碼！');
        }
      };
    }

    if (signUpBtn) {
      signUpBtn.onclick = async () => {
        clearMsg();
        const email = emailInput ? emailInput.value : '';
        const pwd = pwdInput ? pwdInput.value : '';
        signUpBtn.disabled = true;
        signUpBtn.textContent = '註冊中...';
        const res = await signUpWithPassword(email, pwd);
        signUpBtn.disabled = false;
        signUpBtn.textContent = '一秒註冊';
        if (res.success) {
          showMsg('註冊成功！已自動登入並建立雲端倉庫。', false);
          setTimeout(() => closeAuthModal(), 1200);
        } else {
          showMsg(res.error || '註冊失敗，請稍後再試！');
        }
      };
    }

    if (signOutBtn) {
      signOutBtn.onclick = async () => {
        clearMsg();
        await signOut();
        showMsg('已成功登出，目前為本機訪客模式。', false);
      };
    }

    if (manualSyncBtn) {
      manualSyncBtn.onclick = async () => {
        clearMsg();
        manualSyncBtn.disabled = true;
        manualSyncBtn.textContent = '同步中...';
        await triggerInitialSyncAndMerge();
        manualSyncBtn.disabled = false;
        manualSyncBtn.textContent = '立即手動同步';
        showMsg('手動同步完成！', false);
      };
    }

    if (configToggle && configContent) {
      configToggle.onclick = () => {
        const isClosed = configContent.style.display === 'none';
        configContent.style.display = isClosed ? 'block' : 'none';
        configToggle.classList.toggle('is-open', isClosed);
      };
    }

    if (configSave) {
      configSave.onclick = () => {
        const url = configUrl ? configUrl.value : '';
        const key = configKey ? configKey.value : '';
        saveCustomConfig(url, key);
        showMsg('Supabase 伺服器配置已儲存並重新連線！', false);
      };
    }

    if (configClear) {
      configClear.onclick = () => {
        clearCustomConfig();
        if (configUrl) configUrl.value = '';
        if (configKey) configKey.value = '';
        showMsg('已重設為預設配置！', false);
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
    onRemoteUpdate,
    onAuthStateChange,
    saveCustomConfig,
    clearCustomConfig,
    mergePokemonBoxes
  };

  if (typeof window !== 'undefined') {
    window.CloudSync = CloudSyncModule;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncModule;
  }
})();
