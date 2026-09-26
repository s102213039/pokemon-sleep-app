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
  const STORAGE_KEY_REMEMBER = 'PKMSLEEP_REMEMBER_AUTH_V1';

  // 預設全域中央雲端資料庫配置 (Supabase BaaS - 全使用者統一共享)
  const DEFAULT_CONFIG = {
    url: (typeof window !== 'undefined' && window.__SUPABASE_URL__) || 'https://tyoeegvqszobiosaaxbb.supabase.co',
    anonKey: (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5b2VlZ3Zxc3pvYmlvc2FheGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MDA5MzksImV4cCI6MjEwNTk3NjkzOX0.CKJzWnjeoBM8jue9XnflKUctg7DBD2l6skqu-61rgF4'
  };

  let supabaseClient = null;
  let currentUser = null;
  let realtimeChannel = null;
  let pushDebounceTimer = null;
  let remoteUpdateCallbacks = [];
  let authStateCallbacks = [];
  let syncStatus = 'guest'; // 'guest' | 'connecting' | 'synced' | 'syncing' | 'offline' | 'error'
  let lastSyncError = '';
  let authViewMode = 'signin'; // 'signin' | 'signup'

  /* ─── 記住帳號與密碼管理 ───────────────────────────────────── */
  function getRememberedAuth() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_REMEMBER);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.account === 'string') {
            return parsed;
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function saveRememberedAuth(account, password, remember) {
    try {
      if (typeof localStorage !== 'undefined') {
        if (remember) {
          localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify({
            account: (account || '').trim(),
            password: password || ''
          }));
        } else {
          localStorage.removeItem(STORAGE_KEY_REMEMBER);
        }
      }
    } catch (e) {}
  }

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

  /* ─── 帳號與密碼規格校驗 ───────────────────────────────────── */
  function parseAndValidateAccount(input) {
    const raw = (input || '').trim();
    if (!raw) {
      return { valid: false, error: '請輸入使用者帳號！' };
    }

    // 兼容可能輸入完整 Email 的情況
    if (raw.includes('@')) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        return { valid: true, username: raw.split('@')[0], email: raw.toLowerCase() };
      }
      return { valid: false, error: '電子郵件格式不正確！' };
    }

    // 純帳號校驗：3 ~ 20 個字元，僅限英文、數字、底線
    if (raw.length < 3 || raw.length > 20) {
      return { valid: false, error: '帳號長度需介於 3 到 20 個字元之間！' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
      return { valid: false, error: '帳號僅允許英文字母、數字與底線 (_)，不可包含空格或特殊符號！' };
    }

    const cleanUsername = raw.toLowerCase();
    // 內部映射為 Supabase 唯一識別安全憑證
    return {
      valid: true,
      username: cleanUsername,
      email: `${cleanUsername}@pkmsleep.internal`
    };
  }

  function validatePassword(password) {
    if (!password) {
      return { valid: false, error: '請輸入密碼！' };
    }
    if (password.length < 6 || password.length > 32) {
      return { valid: false, error: '密碼長度需介於 6 到 32 個字元之間！' };
    }
    if (/\s/.test(password)) {
      return { valid: false, error: '密碼不可包含空白字元！' };
    }
    // 避免全部為相同字元，例如 111111 或 aaaaaa
    if (/^(.)\1+$/.test(password)) {
      return { valid: false, error: '密碼過於簡單，請勿使用連續單一相同字元！' };
    }
    // 常見極弱密碼黑名單
    const weakPasswords = ['123456', '12345678', 'password', 'abcdef', '654321', 'qwerty', '000000'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: '密碼過於簡單，請更換較安全的組合！' };
    }
    return { valid: true };
  }

  /* ─── 帳號密碼註冊與登入 ───────────────────────────────────── */
  async function signUpWithPassword(accountInput, password) {
    if (!supabaseClient) {
      return { success: false, error: '雲端同步服務未初始化，請稍後再試！' };
    }

    const accResult = parseAndValidateAccount(accountInput);
    if (!accResult.valid) {
      return { success: false, error: accResult.error };
    }

    const pwdResult = validatePassword(password);
    if (!pwdResult.valid) {
      return { success: false, error: pwdResult.error };
    }

    try {
      syncStatus = 'connecting';
      updateSyncUI();

      const { data, error } = await supabaseClient.auth.signUp({
        email: accResult.email,
        password: password
      });

      if (error) {
        syncStatus = currentUser ? 'synced' : 'guest';
        updateSyncUI();
        let errMsg = error.message || '註冊失敗';
        if (errMsg.includes('User already registered')) {
          errMsg = '此帳號已被註冊，請直接點擊「登入帳號」！';
        } else if (errMsg.includes('Password should be at least 6 characters')) {
          errMsg = '密碼長度至少需為 6 個字元！';
        }
        return { success: false, error: errMsg };
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

      return { success: true, message: '註冊成功！' };
    } catch (err) {
      syncStatus = currentUser ? 'synced' : 'guest';
      updateSyncUI();
      return { success: false, error: err.message || '註冊時發生未知錯誤' };
    }
  }

  async function signInWithPassword(accountInput, password) {
    if (!supabaseClient) {
      return { success: false, error: '雲端同步服務未初始化，請稍後再試！' };
    }

    const accResult = parseAndValidateAccount(accountInput);
    if (!accResult.valid) {
      return { success: false, error: accResult.error };
    }

    if (!password) {
      return { success: false, error: '請輸入密碼！' };
    }

    try {
      syncStatus = 'connecting';
      updateSyncUI();

      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: accResult.email,
        password: password
      });

      if (error) {
        syncStatus = currentUser ? 'synced' : 'guest';
        updateSyncUI();
        let errMsg = error.message || '登入失敗';
        if (errMsg.includes('Invalid login credentials')) {
          errMsg = '帳號或密碼錯誤，請檢查後重新輸入！';
        } else if (errMsg.includes('Email not confirmed')) {
          errMsg = '登入失敗：請管理員於 Supabase 後台關閉「Confirm email」驗證設定。';
        }
        return { success: false, error: errMsg };
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

    // 3. 更新倉庫頂部按鈕 (#box-cloud-sync-btn)
    const boxSyncBtns = document.querySelectorAll('.box-btn-cloud-sync, #box-cloud-sync-btn');
    boxSyncBtns.forEach(btn => {
      if (!btn) return;
      if (currentUser) {
        btn.classList.add('is-logged-in');
        btn.classList.remove('is-guest');
        btn.innerHTML = `
          <span class="sync-dot dot-active"></span>
          <span class="sync-text">${isEN ? `Synced: ${escapeHtml(userDisplay)}` : `已同步：${escapeHtml(userDisplay)}`}</span>
        `;
        btn.title = isEN ? `Logged in as ${userDisplay}. Click to manage sync.` : `已登入：${userDisplay}。點擊管理雲端同步。`;
      } else {
        btn.classList.remove('is-logged-in');
        btn.classList.add('is-guest');
        btn.innerHTML = `
          <span class="sync-dot dot-guest"></span>
          <span class="sync-text">${isEN ? 'Cloud Sync (Sign In)' : '雲端同步 (登入/註冊)'}</span>
        `;
        btn.title = isEN ? 'Operating in local guest mode. Click to sign in or register.' : '目前為本機訪客模式。點擊登入或註冊以啟用即時同步。';
      }
    });

    // 4. 更新手機端工具列晶片 (#box-mobile-cloud-sync-btn)
    const mobileChip = document.getElementById('box-mobile-cloud-sync-btn');
    if (mobileChip) {
      if (currentUser) {
        mobileChip.classList.add('is-logged-in');
        mobileChip.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
          <span class="view-chip-text sync-text">${escapeHtml(userDisplay)}</span>
        `;
      } else {
        mobileChip.classList.remove('is-logged-in');
        mobileChip.innerHTML = `
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
          <span class="view-chip-text sync-text">${isEN ? 'Sign In' : '登入/同步'}</span>
        `;
      }
    }

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

    // 3. 切換彈窗內的按鈕展示與標題
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

    // 登入操作
    if (signInBtn) {
      signInBtn.onclick = async () => {
        clearMsg();
        const account = signinUser ? signinUser.value : '';
        const pwd = signinPwd ? signinPwd.value : '';
        const isRemember = rememberCheck ? rememberCheck.checked : false;

        signInBtn.disabled = true;
        signInBtn.textContent = '登入中...';
        const res = await signInWithPassword(account, pwd);
        signInBtn.disabled = false;
        signInBtn.textContent = '登入帳號';

        if (res.success) {
          saveRememberedAuth(account, pwd, isRemember);
          showMsg('登入成功！已啟動跨裝置即時同步。', false);
          setTimeout(() => closeAuthModal(), 1200);
        } else {
          showMsg(res.error || '登入失敗，請檢查帳號密碼！');
        }
      };
    }

    // 註冊操作
    if (signUpBtn) {
      signUpBtn.onclick = async () => {
        clearMsg();
        const account = signupUser ? signupUser.value : '';
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
          showMsg('註冊成功！已自動登入並建立雲端倉庫。', false);
          setTimeout(() => closeAuthModal(), 1200);
        } else {
          showMsg(res.error || '註冊失敗，請稍後再試！');
        }
      };
    }

    // 登出操作
    if (signOutBtn) {
      signOutBtn.onclick = async () => {
        clearMsg();
        await signOut();
        showMsg('已成功登出，目前為本機訪客模式。', false);
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
        showMsg('手動同步完成！', false);
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
    getRememberedAuth,
    saveRememberedAuth,
    onRemoteUpdate,
    onAuthStateChange,
    saveCustomConfig,
    clearCustomConfig,
    mergePokemonBoxes,
    parseAndValidateAccount,
    validatePassword
  };

  if (typeof window !== 'undefined') {
    window.CloudSync = CloudSyncModule;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncModule;
  }
})();
