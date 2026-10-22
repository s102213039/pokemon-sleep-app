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
  const STORAGE_KEY_BOX_UPDATED_AT = 'PKMSLEEP_USER_BOX_UPDATED_AT_V1';
  const INITIAL_SYNC_COOLDOWN_MS = 5 * 60 * 1000; // 5 分鐘冷卻，避免分頁切換與重複 Auth 事件頻繁拉取

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
  let lastPushedBoxHash = '';
  let lastLocalPushTime = 0;
  let lastSyncedUserId = '';
  let lastInitialSyncTimestamp = 0;
  let initialSyncPromise = null;
  let isRealtimeSubscribed = false;
  let lastToastSignature = '';
  let lastToastTime = 0;

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
          triggerInitialSyncAndMerge(false);
        } else if (event === 'SIGNED_OUT') {
          currentUser = null;
          lastSyncedUserId = '';
          lastInitialSyncTimestamp = 0;
          lastPushedBoxHash = '';
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
        closeAuthModal();
        dismissBoxAuthOverlay();
        notifyAuthStateChanged();
        subscribeToRealtime();
        await triggerInitialSyncAndMerge(true);
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
        closeAuthModal();
        dismissBoxAuthOverlay();
        notifyAuthStateChanged();
        subscribeToRealtime();
        await triggerInitialSyncAndMerge(true);
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
      lastSyncedUserId = '';
      lastInitialSyncTimestamp = 0;
      lastPushedBoxHash = '';
      syncStatus = 'guest';
      notifyAuthStateChanged();
      updateSyncUI();
      return { success: true };
    }

    try {
      await supabaseClient.auth.signOut();
      currentUser = null;
      lastSyncedUserId = '';
      lastInitialSyncTimestamp = 0;
      lastPushedBoxHash = '';
      syncStatus = 'guest';
      unsubscribeRealtime();
      notifyAuthStateChanged();
      updateSyncUI();
      return { success: true };
    } catch (err) {
      console.error('[CloudSync] Sign out error:', err);
      currentUser = null;
      lastSyncedUserId = '';
      lastInitialSyncTimestamp = 0;
      lastPushedBoxHash = '';
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
    const uidToIndex = new Map();
    const seenUids = new Set();
    const seenFingerprints = new Set();

    // 優先以 remoteList 為基底，紀錄 UID 與指紋
    remoteList.forEach(item => {
      if (item && item.uid) {
        seenUids.add(item.uid);
        uidToIndex.set(item.uid, merged.length);
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
        const existingIdx = uidToIndex.get(item.uid);
        if (existingIdx !== undefined) {
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
        uidToIndex.set(item.uid, merged.length);
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

      if (data && data.updated_at) {
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY_BOX_UPDATED_AT, String(data.updated_at));
          }
        } catch (e) {}
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

    const dataArray = Array.isArray(boxData) ? boxData : [];
    const serialized = JSON.stringify(dataArray);
    // 若即將推送的內容與上次成功同步/推送的雲端內容完全一致，直接略過重複寫入請求
    if (serialized === lastPushedBoxHash) {
      return true;
    }
    lastPushedBoxHash = serialized;
    lastLocalPushTime = Date.now();

    try {
      syncStatus = 'syncing';
      updateSyncUI();

      const nowIso = new Date().toISOString();
      const payload = {
        user_id: currentUser.id,
        box_data: dataArray,
        updated_at: nowIso
      };

      const { error } = await supabaseClient
        .from('user_boxes')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.error('[CloudSync] pushRemoteBox failed:', error);
        lastPushedBoxHash = '';
        syncStatus = 'error';
        lastSyncError = error.message;
        updateSyncUI();
        return false;
      }

      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_BOX_UPDATED_AT, nowIso);
        }
      } catch (e) {}

      syncStatus = 'synced';
      lastSyncError = '';
      updateSyncUI();
      return true;
    } catch (err) {
      console.error('[CloudSync] pushRemoteBox exception:', err);
      lastPushedBoxHash = '';
      syncStatus = 'error';
      lastSyncError = err.message || '同步推送失敗';
      updateSyncUI();
      return false;
    }
  }

  /* ─── 首次登入與初始雙軌合併 ───────────────────────────────── */
  async function triggerInitialSyncAndMerge(force = false) {
    if (!supabaseClient || !currentUser) return;
    if (initialSyncPromise) return initialSyncPromise;

    // 防抖與冷卻檢查：避免 getSession 與 onAuthStateChange('SIGNED_IN') 或分頁切換重複觸發
    const now = Date.now();
    if (!force && lastSyncedUserId === currentUser.id && (now - lastInitialSyncTimestamp < INITIAL_SYNC_COOLDOWN_MS)) {
      return;
    }

    lastSyncedUserId = currentUser.id;
    lastInitialSyncTimestamp = now;

    initialSyncPromise = (async () => {
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
        let shouldPush = false;

        if (remoteBox === null) {
          // 雲端尚未建立此記錄或查詢失敗：若本機有資料才推送
          if (localBox.length > 0) {
            finalMerged = localBox;
            shouldPush = true;
          } else {
            finalMerged = [];
          }
        } else if (remoteBox.length === 0 && localBox.length > 0) {
          // 雲端是空倉庫，本機有資料：上傳本機資料至雲端
          finalMerged = localBox;
          shouldPush = true;
        } else if (remoteBox.length > 0 && localBox.length === 0) {
          // 本機是空倉庫，雲端有資料：以雲端資料更新本機，無需推回雲端
          finalMerged = remoteBox;
          shouldPush = false;
        } else if (remoteBox.length === 0 && localBox.length === 0) {
          // 兩端皆為空：維持空倉庫，不執行任何推送，避免產生多餘 Realtime 廣播
          finalMerged = [];
          shouldPush = false;
        } else {
          // 兩端皆有資料：比對是否完全相同
          if (JSON.stringify(localBox) === JSON.stringify(remoteBox)) {
            finalMerged = localBox;
            shouldPush = false;
          } else {
            finalMerged = mergePokemonBoxes(localBox, remoteBox);
            shouldPush = true;
          }
        }

        const finalSerialized = JSON.stringify(finalMerged);

        if (shouldPush) {
          await pushRemoteBox(finalMerged);
        } else {
          // 記錄當前雲端與本地已同步之內容雜湊，避免後續重複發送 POST upsert
          lastPushedBoxHash = finalSerialized;
        }

        // 3. 寫回本機 LocalStorage 並通知 Box 模組更新 (傳入 skipCloudPush = true 阻斷回環推送)
        try {
          localStorage.setItem(STORAGE_KEY_USER_BOX, finalSerialized);
        } catch (e) {}

        if (typeof window !== 'undefined' && window.PokemonBoxApp && typeof window.PokemonBoxApp.setUserBox === 'function') {
          window.PokemonBoxApp.setUserBox(finalMerged, true);
        }

        syncStatus = 'synced';
        updateSyncUI();
      } catch (err) {
        console.error('[CloudSync] Initial sync failed:', err);
        lastInitialSyncTimestamp = 0;
        syncStatus = 'error';
        lastSyncError = err.message || '首次同步失敗';
        updateSyncUI();
      } finally {
        initialSyncPromise = null;
      }
    })();

    return initialSyncPromise;
  }

  /* ─── 帶防抖 (Debounce) 的外部推送介面 ─────────────────────── */
  function pushCloudBox(boxData) {
    if (!supabaseClient || !currentUser) return;

    const dataArray = Array.isArray(boxData) ? boxData : [];
    if (JSON.stringify(dataArray) === lastPushedBoxHash) {
      return;
    }

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
    if (isRealtimeSubscribed && realtimeChannel) return;
    unsubscribeRealtime();
    isRealtimeSubscribed = true;

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
      isRealtimeSubscribed = false;
    }
  }

  function unsubscribeRealtime() {
    isRealtimeSubscribed = false;
    if (realtimeChannel && supabaseClient) {
      try {
        supabaseClient.removeChannel(realtimeChannel);
      } catch (e) {}
      realtimeChannel = null;
    }
  }

  function handleRemoteUpdateReceived(remoteBox) {
    const remoteData = Array.isArray(remoteBox) ? remoteBox : [];
    const remoteHash = JSON.stringify(remoteData);
    let localHash = '';
    try {
      localHash = localStorage.getItem(STORAGE_KEY_USER_BOX) || '[]';
    } catch (e) {}

    // 1. 若收到的資料與本機現存內容完全一致，表示無任何實質變更，直接略過
    if (remoteHash === localHash) {
      return;
    }

    // 2. 若此更新為本機剛推送後的自身回環 (Echo)，且內容與本機剛推送的完全吻合，直接略過
    if (remoteHash === lastPushedBoxHash && (Date.now() - lastLocalPushTime < 4000)) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY_USER_BOX, remoteHash);
    } catch (e) {}

    // 通知外部註冊之回調
    remoteUpdateCallbacks.forEach(cb => {
      try { cb(remoteData); } catch (e) {}
    });

    syncStatus = 'synced';
    updateSyncUI();
  }

  /* ─── 監聽器與回調註冊 ─────────────────────────────────────── */
  function onRemoteUpdate(cb) {
    if (typeof cb === 'function' && !remoteUpdateCallbacks.includes(cb)) {
      remoteUpdateCallbacks.push(cb);
    }
  }

  function onAuthStateChange(cb) {
    if (typeof cb === 'function' && !authStateCallbacks.includes(cb)) {
      authStateCallbacks.push(cb);
    }
  }

  function notifyAuthStateChanged() {
    authStateCallbacks.forEach(cb => {
      try { cb(currentUser); } catch (e) {}
    });
  }

  /* ─── 浮動 Toast 系統 (支援右下角狀態提醒與多端通知) ───────────── */
