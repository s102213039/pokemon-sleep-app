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

  /* ─── 記住帳號與混合加密信封管理 (由 cloudSync_crypto.js 提供實作) ─── */

  /* ─── 雲端倉庫資料防護與無害化 (Sanitize Remote Box) ──────────── */
  function sanitizeRemoteBox(box) {
    if (!Array.isArray(box)) return [];
    if (typeof window !== 'undefined' && window.PokemonBoxApp && typeof window.PokemonBoxApp.sanitizeImportedPokemon === 'function') {
      return box.map(window.PokemonBoxApp.sanitizeImportedPokemon).filter(Boolean);
    }
    const DANGEROUS_PROTO_KEYS = ['__proto__', 'constructor', 'prototype'];
    return box.filter(raw => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return false;
      for (const key of DANGEROUS_PROTO_KEYS) {
        if (Object.prototype.hasOwnProperty.call(raw, key)) return false;
      }
      return true;
    });
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
      lastSyncError = err.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_init_failed') : undefined) ?? '初始化失敗');
      updateSyncUI();
      return false;
    }
  }

  /* ─── 帳號與密碼規格校驗 ───────────────────────────────────── */
  function parseAndValidateAccount(input) {
    const raw = (input || '').trim();
    if (!raw) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_username_required') : undefined) ?? '請輸入使用者帳號！' };
    }

    // 兼容可能輸入完整 Email 的情況
    if (raw.includes('@')) {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        return { valid: true, username: raw.split('@')[0], email: raw.toLowerCase() };
      }
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_email_invalid') : undefined) ?? '電子郵件格式不正確！' };
    }

    // 純帳號校驗：3 ~ 20 個字元，僅限英文、數字、底線
    if (raw.length < 3 || raw.length > 20) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_username_length') : undefined) ?? '帳號長度需介於 3 到 20 個字元之間！' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_username_chars') : undefined) ?? '帳號僅允許英文字母、數字與底線 (_)，不可包含空格或特殊符號！' };
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
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_required') : undefined) ?? '請輸入密碼！' };
    }
    if (password.length < 6 || password.length > 32) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_length') : undefined) ?? '密碼長度需介於 6 到 32 個字元之間！' };
    }
    if (/\s/.test(password)) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_whitespace') : undefined) ?? '密碼不可包含空白字元！' };
    }
    // 避免全部為相同字元，例如 111111 或 aaaaaa
    if (/^(.)\1+$/.test(password)) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_repeated') : undefined) ?? '密碼過於簡單，請勿使用連續單一相同字元！' };
    }
    // 常見極弱密碼黑名單
    const weakPasswords = ['123456', '12345678', 'password', 'abcdef', '654321', 'qwerty', '000000'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return { valid: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_weak') : undefined) ?? '密碼過於簡單，請更換較安全的組合！' };
    }
    return { valid: true };
  }

  /* ─── 帳號密碼註冊與登入 ───────────────────────────────────── */
  async function signUpWithPassword(accountInput, password) {
    if (!supabaseClient) {
      return { success: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_not_initialized') : undefined) ?? '雲端同步服務未初始化，請稍後再試！' };
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
        let errMsg = error.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_register_failed') : undefined) ?? '註冊失敗');
        if (errMsg.includes('User already registered')) {
          errMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_user_exists') : undefined) ?? '此帳號已被註冊，請直接點擊「登入帳號」！';
        } else if (errMsg.includes('Password should be at least 6 characters')) {
          errMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_min6') : undefined) ?? '密碼長度至少需為 6 個字元！';
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

      return { success: true, message: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.msg_register_ok') : undefined) ?? '註冊成功！' };
    } catch (err) {
      syncStatus = currentUser ? 'synced' : 'guest';
      updateSyncUI();
      return { success: false, error: err.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_register_unknown') : undefined) ?? '註冊時發生未知錯誤') };
    }
  }

  async function signInWithPassword(accountInput, password) {
    if (!supabaseClient) {
      return { success: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_not_initialized') : undefined) ?? '雲端同步服務未初始化，請稍後再試！' };
    }

    const accResult = parseAndValidateAccount(accountInput);
    if (!accResult.valid) {
      return { success: false, error: accResult.error };
    }

    if (!password) {
      return { success: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_required') : undefined) ?? '請輸入密碼！' };
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
        let errMsg = error.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_signin_failed') : undefined) ?? '登入失敗');
        if (errMsg.includes('Invalid login credentials')) {
          errMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_invalid_credentials') : undefined) ?? '帳號或密碼錯誤，請檢查後重新輸入！';
        } else if (errMsg.includes('Email not confirmed')) {
          errMsg = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_email_not_confirmed') : undefined) ?? '登入失敗：請管理員於 Supabase 後台關閉「Confirm email」驗證設定。';
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

      return { success: false, error: (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_user_not_found') : undefined) ?? '登入失敗，查無使用者資訊' };
    } catch (err) {
      syncStatus = currentUser ? 'synced' : 'guest';
      updateSyncUI();
      return { success: false, error: err.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_signin_exception') : undefined) ?? '登入時發生錯誤') };
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
        return sanitizeRemoteBox(data.box_data);
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
      lastSyncError = err.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_sync_push_failed') : undefined) ?? '同步推送失敗');
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
        lastSyncError = err.message || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_initial_sync_failed') : undefined) ?? '首次同步失敗');
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
    const rawData = Array.isArray(remoteBox) ? remoteBox : [];
    const remoteData = sanitizeRemoteBox(rawData);
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
  /* ─── 軍規級混合信封加密金庫 (Hybrid RSA-OAEP-2048 + AES-256-GCM + PBKDF2-SHA256) ─── */
  const CRYPTO_SUITE_ID = 'RSA-OAEP-2048+AES-256-GCM+PBKDF2-SHA256';
  const CRYPTO_ENVELOPE_VERSION = 2;
  const CRYPTO_PBKDF2_ITERATIONS = 100000;
  const CRYPTO_RSA_MODULUS_BITS = 2048;
  const CRYPTO_AES_KEY_BITS = 256;
  const CRYPTO_IDB_NAME = 'PKMSLEEP_CRYPTO_VAULT_V1';
  const CRYPTO_IDB_STORE = 'keystore';
  const CRYPTO_IDB_KEY_ID = 'rsa_oaep_2048_sha256_master_v2';
  const CRYPTO_KDF_PEPPER = 'PKMSLEEP_HYBRID_VAULT_PEPPER_V2_9F4A8C2E';

  let _nodeCrypto = null;
  try {
    if (typeof require === 'function') {
      _nodeCrypto = require('crypto');
    }
  } catch (e) {}

  let _nodeRsaKeyPair = null;
  let _webCryptoKeyPairPromise = null;
  let _lastEncryptionPromise = null;

  function _getNodeRsaKeyPair() {
    if (_nodeRsaKeyPair) return _nodeRsaKeyPair;
    if (!_nodeCrypto || typeof _nodeCrypto.generateKeyPairSync !== 'function') return null;
    _nodeRsaKeyPair = _nodeCrypto.generateKeyPairSync('rsa', {
      modulusLength: CRYPTO_RSA_MODULUS_BITS,
      publicExponent: 0x10001
    });
    return _nodeRsaKeyPair;
  }

  function _getSubtleCrypto() {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      return window.crypto.subtle;
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
      return globalThis.crypto.subtle;
    }
    if (_nodeCrypto && _nodeCrypto.webcrypto && _nodeCrypto.webcrypto.subtle) {
      return _nodeCrypto.webcrypto.subtle;
    }
    return null;
  }

  function _getRandomBytes(byteLength) {
    const buf = new Uint8Array(byteLength);
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.getRandomValues === 'function') {
      window.crypto.getRandomValues(buf);
      return buf;
    }
    if (typeof globalThis !== 'undefined' && globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
      globalThis.crypto.getRandomValues(buf);
      return buf;
    }
    if (_nodeCrypto && typeof _nodeCrypto.randomBytes === 'function') {
      const nb = _nodeCrypto.randomBytes(byteLength);
      buf.set(nb);
      return buf;
    }
    throw new Error('Cryptographically secure CSPRNG is unavailable in this environment');
  }

  function _bytesToBase64(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('base64');
    }
    let binary = '';
    for (let i = 0; i < u8.byteLength; i++) {
      binary += String.fromCharCode(u8[i]);
    }
    return btoa(binary);
  }

  function _base64ToBytes(b64) {
    if (typeof b64 !== 'string' || !b64) return new Uint8Array(0);
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(b64, 'base64');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    const binary = atob(b64);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  }

  function _utf8ToBytes(str) {
    const s = String(str || '');
    if (typeof TextEncoder !== 'undefined') {
      return new TextEncoder().encode(s);
    }
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(s, 'utf8'));
    }
    const arr = [];
    for (let i = 0; i < s.length; i++) {
      arr.push(s.charCodeAt(i) & 0xff);
    }
    return new Uint8Array(arr);
  }

  function _bytesToUtf8(bytes) {
    const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8', { fatal: true }).decode(u8);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength).toString('utf8');
    }
    let out = '';
    for (let i = 0; i < u8.byteLength; i++) {
      out += String.fromCharCode(u8[i]);
    }
    return out;
  }

  function _buildAuthAAD(account) {
    const normAcc = String(account || '').trim().toLowerCase();
    return `PKMSLEEP_AUTH_V2:${normAcc}`;
  }

  function _buildKdfSecretMaterial(account) {
    const normAcc = String(account || '').trim().toLowerCase();
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? window.location.origin
      : 'pkmsleep-local-origin';
    return `${CRYPTO_KDF_PEPPER}::${origin}::${normAcc}`;
  }

  function _xorBytes32(a, b) {
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      out[i] = (a[i] ^ b[i]) & 0xff;
    }
    return out;
  }

  /* ─── IndexedDB 非可匯出 (Non-Extractable) RSA-OAEP 金鑰庫 ─────── */
  function _loadOrCreateIdbRsaKeyPair(subtle) {
    if (typeof indexedDB === 'undefined' || !indexedDB) {
      return subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: CRYPTO_RSA_MODULUS_BITS,
          publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
          hash: 'SHA-256'
        },
        false,
        ['encrypt', 'decrypt']
      );
    }

    return new Promise((resolve, reject) => {
      let req;
      try {
        req = indexedDB.open(CRYPTO_IDB_NAME, 1);
      } catch (err) {
        subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: CRYPTO_RSA_MODULUS_BITS,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'
          },
          false,
          ['encrypt', 'decrypt']
        ).then(resolve, reject);
        return;
      }

      req.onupgradeneeded = function (ev) {
        const db = ev.target.result;
        if (!db.objectStoreNames.contains(CRYPTO_IDB_STORE)) {
          db.createObjectStore(CRYPTO_IDB_STORE);
        }
      };

      req.onerror = function () {
        subtle.generateKey(
          {
            name: 'RSA-OAEP',
            modulusLength: CRYPTO_RSA_MODULUS_BITS,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256'
          },
          false,
          ['encrypt', 'decrypt']
        ).then(resolve, reject);
      };

      req.onsuccess = function (ev) {
        const db = ev.target.result;
        try {
          const tx = db.transaction(CRYPTO_IDB_STORE, 'readonly');
          const store = tx.objectStore(CRYPTO_IDB_STORE);
          const getReq = store.get(CRYPTO_IDB_KEY_ID);
          getReq.onsuccess = function () {
            const existing = getReq.result;
            if (existing && existing.publicKey && existing.privateKey) {
              db.close();
              resolve(existing);
              return;
            }
            subtle.generateKey(
              {
                name: 'RSA-OAEP',
                modulusLength: CRYPTO_RSA_MODULUS_BITS,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: 'SHA-256'
              },
              false, // 強制 extractable: false，杜絕腳本匯出私鑰
              ['encrypt', 'decrypt']
            ).then(pair => {
              try {
                const wtx = db.transaction(CRYPTO_IDB_STORE, 'readwrite');
                wtx.objectStore(CRYPTO_IDB_STORE).put(pair, CRYPTO_IDB_KEY_ID);
                wtx.oncomplete = function () { db.close(); };
              } catch (e) {
                try { db.close(); } catch (err) {}
              }
              resolve(pair);
            }, err => {
              try { db.close(); } catch (e) {}
              reject(err);
            });
          };
          getReq.onerror = function () {
            try { db.close(); } catch (e) {}
            subtle.generateKey(
              {
                name: 'RSA-OAEP',
                modulusLength: CRYPTO_RSA_MODULUS_BITS,
                publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
                hash: 'SHA-256'
              },
              false,
              ['encrypt', 'decrypt']
            ).then(resolve, reject);
          };
        } catch (err) {
          try { db.close(); } catch (e) {}
          subtle.generateKey(
            {
              name: 'RSA-OAEP',
              modulusLength: CRYPTO_RSA_MODULUS_BITS,
              publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
              hash: 'SHA-256'
            },
            false,
            ['encrypt', 'decrypt']
          ).then(resolve, reject);
        }
      };
    });
  }

  function _getWebCryptoKeyPair() {
    if (_webCryptoKeyPairPromise) return _webCryptoKeyPairPromise;
    const subtle = _getSubtleCrypto();
    if (!subtle) return Promise.reject(new Error('WebCrypto SubtleCrypto is unavailable'));
    _webCryptoKeyPairPromise = _loadOrCreateIdbRsaKeyPair(subtle);
    return _webCryptoKeyPairPromise;
  }

  /* ─── 同步版混合信封加解密 (Node.js / 同進程即時加解密) ─────────── */
  function encryptCredentialEnvelope(account, password) {
    const normAcc = String(account || '').trim();
    const pwdStr = String(password || '');
    if (!normAcc || !pwdStr) return null;

    const rsaPair = _getNodeRsaKeyPair();
    if (!rsaPair || !_nodeCrypto) return null;

    const rawDek = _getRandomBytes(32); // 256-bit DEK
    const salt = _getRandomBytes(16);   // 128-bit PBKDF2 Salt
    const iv = _getRandomBytes(12);     // 96-bit AES-GCM IV
    const aadBytes = _utf8ToBytes(_buildAuthAAD(normAcc));

    // Layer 1: PBKDF2-HMAC-SHA256 衍生 256-bit 遮罩並與隨機 DEK 合成
    const kdfMask = new Uint8Array(_nodeCrypto.pbkdf2Sync(
      _buildKdfSecretMaterial(normAcc),
      Buffer.from(salt),
      CRYPTO_PBKDF2_ITERATIONS,
      32,
      'sha256'
    ));
    const effectiveAesKey = _xorBytes32(rawDek, kdfMask);

    // Layer 2: AES-256-GCM 認證加密 (含 AAD 帳號綁定與 128-bit AuthTag)
    const cipher = _nodeCrypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(effectiveAesKey),
      Buffer.from(iv),
      { authTagLength: 16 }
    );
    cipher.setAAD(Buffer.from(aadBytes));
    const encPart1 = cipher.update(Buffer.from(_utf8ToBytes(pwdStr)));
    const encPart2 = cipher.final();
    const ciphertextBuf = Buffer.concat([encPart1, encPart2]);
    const authTagBuf = cipher.getAuthTag();

    // Layer 3: RSA-OAEP-2048 (SHA-256) 非對稱公鑰封裝 256-bit 隨機 DEK
    const wrappedDekBuf = _nodeCrypto.publicEncrypt(
      {
        key: rsaPair.publicKey,
        padding: _nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256'
      },
      Buffer.from(rawDek)
    );

    return {
      v: CRYPTO_ENVELOPE_VERSION,
      alg: CRYPTO_SUITE_ID,
      engine: 'node-crypto',
      kdf: 'PBKDF2-HMAC-SHA256',
      kdfIterations: CRYPTO_PBKDF2_ITERATIONS,
      rsaBits: CRYPTO_RSA_MODULUS_BITS,
      aesBits: CRYPTO_AES_KEY_BITS,
      wrappedDek: _bytesToBase64(wrappedDekBuf),
      iv: _bytesToBase64(iv),
      salt: _bytesToBase64(salt),
      tag: _bytesToBase64(authTagBuf),
      ciphertext: _bytesToBase64(ciphertextBuf)
    };
  }

  function decryptCredentialEnvelope(envelope, account) {
    try {
      if (!envelope || typeof envelope !== 'object') return null;
      if (envelope.v !== CRYPTO_ENVELOPE_VERSION || envelope.alg !== CRYPTO_SUITE_ID) return null;
      const normAcc = String(account || '').trim();
      if (!normAcc) return null;

      const rsaPair = _getNodeRsaKeyPair();
      if (!rsaPair || !_nodeCrypto) return null;

      const wrappedDek = _base64ToBytes(envelope.wrappedDek);
      const iv = _base64ToBytes(envelope.iv);
      const salt = _base64ToBytes(envelope.salt);
      const tag = _base64ToBytes(envelope.tag);
      const ciphertext = _base64ToBytes(envelope.ciphertext);

      if (iv.byteLength !== 12 || salt.byteLength !== 16 || tag.byteLength !== 16 || ciphertext.byteLength === 0) {
        return null;
      }

      // Layer 3 逆向: RSA-OAEP-2048 (SHA-256) 私鑰解封裝 DEK
      const rawDekBuf = _nodeCrypto.privateDecrypt(
        {
          key: rsaPair.privateKey,
          padding: _nodeCrypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(wrappedDek)
      );
      if (rawDekBuf.byteLength !== 32) return null;

      // Layer 1 逆向: PBKDF2-HMAC-SHA256 衍生遮罩還原 AES-256 金鑰
      const iterations = Number.isInteger(envelope.kdfIterations) && envelope.kdfIterations >= 10000
        ? envelope.kdfIterations
        : CRYPTO_PBKDF2_ITERATIONS;
      const kdfMask = new Uint8Array(_nodeCrypto.pbkdf2Sync(
        _buildKdfSecretMaterial(normAcc),
        Buffer.from(salt),
        iterations,
        32,
        'sha256'
      ));
      const effectiveAesKey = _xorBytes32(new Uint8Array(rawDekBuf), kdfMask);

      // Layer 2 逆向: AES-256-GCM 驗證 AAD 與 128-bit Tag 並解密
      const decipher = _nodeCrypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(effectiveAesKey),
        Buffer.from(iv),
        { authTagLength: 16 }
      );
      decipher.setAAD(Buffer.from(_utf8ToBytes(_buildAuthAAD(normAcc))));
      decipher.setAuthTag(Buffer.from(tag));

      const decPart1 = decipher.update(Buffer.from(ciphertext));
      const decPart2 = decipher.final();
      return _bytesToUtf8(Buffer.concat([decPart1, decPart2]));
    } catch (e) {
      return null;
    }
  }

  /* ─── 非同步 Web Crypto API 混合信封加解密 (瀏覽器硬體級防護) ─── */
  async function encryptCredentialEnvelopeAsync(account, password) {
    const normAcc = String(account || '').trim();
    const pwdStr = String(password || '');
    if (!normAcc || !pwdStr) return null;

    const subtle = _getSubtleCrypto();
    if (!subtle) {
      return encryptCredentialEnvelope(normAcc, pwdStr);
    }

    const keyPair = await _getWebCryptoKeyPair();
    const rawDek = _getRandomBytes(32);
    const salt = _getRandomBytes(16);
    const iv = _getRandomBytes(12);
    const aadBytes = _utf8ToBytes(_buildAuthAAD(normAcc));

    // Layer 1: WebCrypto PBKDF2-HMAC-SHA256
    const baseKey = await subtle.importKey(
      'raw',
      _utf8ToBytes(_buildKdfSecretMaterial(normAcc)),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const kdfBits = await subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: CRYPTO_PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      256
    );
    const effectiveAesKeyBytes = _xorBytes32(rawDek, new Uint8Array(kdfBits));

    // Layer 2: WebCrypto AES-256-GCM (輸出末端含 16-byte Auth Tag)
    const aesKey = await subtle.importKey(
      'raw',
      effectiveAesKeyBytes,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    const encryptedBuf = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        additionalData: aadBytes,
        tagLength: 128
      },
      aesKey,
      _utf8ToBytes(pwdStr)
    );
    const encryptedBytes = new Uint8Array(encryptedBuf);
    const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.byteLength - 16);
    const tagBytes = encryptedBytes.slice(encryptedBytes.byteLength - 16);

    // Layer 3: WebCrypto RSA-OAEP-2048 (SHA-256) 封裝 DEK
    const wrappedDekBuf = await subtle.encrypt(
      { name: 'RSA-OAEP' },
      keyPair.publicKey,
      rawDek
    );

    return {
      v: CRYPTO_ENVELOPE_VERSION,
      alg: CRYPTO_SUITE_ID,
      engine: 'webcrypto-subtle',
      kdf: 'PBKDF2-HMAC-SHA256',
      kdfIterations: CRYPTO_PBKDF2_ITERATIONS,
      rsaBits: CRYPTO_RSA_MODULUS_BITS,
      aesBits: CRYPTO_AES_KEY_BITS,
      wrappedDek: _bytesToBase64(new Uint8Array(wrappedDekBuf)),
      iv: _bytesToBase64(iv),
      salt: _bytesToBase64(salt),
      tag: _bytesToBase64(tagBytes),
      ciphertext: _bytesToBase64(ciphertextBytes)
    };
  }

  async function decryptCredentialEnvelopeAsync(envelope, account) {
    try {
      if (!envelope || typeof envelope !== 'object') return null;
      if (envelope.v !== CRYPTO_ENVELOPE_VERSION || envelope.alg !== CRYPTO_SUITE_ID) return null;
      const normAcc = String(account || '').trim();
      if (!normAcc) return null;

      if (envelope.engine === 'node-crypto' && _nodeCrypto) {
        const syncResult = decryptCredentialEnvelope(envelope, normAcc);
        if (syncResult !== null) return syncResult;
      }

      const subtle = _getSubtleCrypto();
      if (!subtle) {
        return decryptCredentialEnvelope(envelope, normAcc);
      }

      const keyPair = await _getWebCryptoKeyPair();
      const wrappedDek = _base64ToBytes(envelope.wrappedDek);
      const iv = _base64ToBytes(envelope.iv);
      const salt = _base64ToBytes(envelope.salt);
      const tag = _base64ToBytes(envelope.tag);
      const ciphertext = _base64ToBytes(envelope.ciphertext);

      if (iv.byteLength !== 12 || salt.byteLength !== 16 || tag.byteLength !== 16 || ciphertext.byteLength === 0) {
        return null;
      }

      const rawDekBuf = await subtle.decrypt(
        { name: 'RSA-OAEP' },
        keyPair.privateKey,
        wrappedDek
      );
      const rawDek = new Uint8Array(rawDekBuf);
      if (rawDek.byteLength !== 32) return null;

      const iterations = Number.isInteger(envelope.kdfIterations) && envelope.kdfIterations >= 10000
        ? envelope.kdfIterations
        : CRYPTO_PBKDF2_ITERATIONS;
      const baseKey = await subtle.importKey(
        'raw',
        _utf8ToBytes(_buildKdfSecretMaterial(normAcc)),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      const kdfBits = await subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: 'SHA-256'
        },
        baseKey,
        256
      );
      const effectiveAesKeyBytes = _xorBytes32(rawDek, new Uint8Array(kdfBits));

      const aesKey = await subtle.importKey(
        'raw',
        effectiveAesKeyBytes,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );

      const combinedCiphertext = new Uint8Array(ciphertext.byteLength + tag.byteLength);
      combinedCiphertext.set(ciphertext, 0);
      combinedCiphertext.set(tag, ciphertext.byteLength);

      const decryptedBuf = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          additionalData: _utf8ToBytes(_buildAuthAAD(normAcc)),
          tagLength: 128
        },
        aesKey,
        combinedCiphertext
      );
      return _bytesToUtf8(new Uint8Array(decryptedBuf));
    } catch (e) {
      return null;
    }
  }

  /* ─── 記住帳號與加密信封持久化管理 (絕不儲存明文密碼) ─────────── */
  function getRememberedAuth() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_REMEMBER);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.account === 'string') {
            // 安全防護：若偵測到舊版遺留明文 password 欄位，強制刪除並重寫乾淨結構
            if (Object.prototype.hasOwnProperty.call(parsed, 'password')) {
              delete parsed.password;
              try {
                localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify({
                  account: parsed.account
                }));
              } catch (err) {}
            }
            const validEnvelope = (
              parsed.cipherEnvelope &&
              typeof parsed.cipherEnvelope === 'object' &&
              parsed.cipherEnvelope.v === CRYPTO_ENVELOPE_VERSION &&
              parsed.cipherEnvelope.alg === CRYPTO_SUITE_ID
            ) ? parsed.cipherEnvelope : null;

            return {
              account: parsed.account,
              hasEncryptedPassword: Boolean(validEnvelope),
              cipherEnvelope: validEnvelope
            };
          }
        }
      }
    } catch (e) {}
    return null;
  }

  function decryptRememberedPassword() {
    try {
      const remembered = getRememberedAuth();
      if (!remembered || !remembered.account || !remembered.cipherEnvelope) return '';
      const plain = decryptCredentialEnvelope(remembered.cipherEnvelope, remembered.account);
      return typeof plain === 'string' ? plain : '';
    } catch (e) {
      return '';
    }
  }

  async function getRememberedAuthAsync() {
    try {
      if (_lastEncryptionPromise) {
        try { await _lastEncryptionPromise; } catch (e) {}
      }
      const remembered = getRememberedAuth();
      if (!remembered || !remembered.account) return null;
      let decryptedPassword = '';
      if (remembered.cipherEnvelope) {
        const asyncDec = await decryptCredentialEnvelopeAsync(remembered.cipherEnvelope, remembered.account);
        if (typeof asyncDec === 'string' && asyncDec.length > 0) {
          decryptedPassword = asyncDec;
        } else {
          decryptedPassword = decryptRememberedPassword();
        }
      }
      return {
        account: remembered.account,
        password: decryptedPassword,
        hasEncryptedPassword: Boolean(remembered.cipherEnvelope),
        cipherEnvelope: remembered.cipherEnvelope
      };
    } catch (e) {
      return null;
    }
  }

  function saveRememberedAuth(account, password, remember) {
    try {
      if (typeof localStorage === 'undefined') return;
      if (!remember) {
        _lastEncryptionPromise = null;
        localStorage.removeItem(STORAGE_KEY_REMEMBER);
        return;
      }

      const cleanAccount = String(account || '').trim();
      const rawPassword = typeof password === 'string' ? password : '';
      const record = { account: cleanAccount };

      if (rawPassword.length > 0) {
        const syncEnvelope = encryptCredentialEnvelope(cleanAccount, rawPassword);
        if (syncEnvelope) {
          record.cipherEnvelope = syncEnvelope;
        }
      }

      localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify(record));

      // 若處於純瀏覽器環境 (無 Node.js 同步 crypto)，立即透過 WebCrypto SubtleCrypto 執行非同步 RSA-OAEP + AES-256-GCM 寫入
      if (rawPassword.length > 0 && !record.cipherEnvelope && _getSubtleCrypto()) {
        _lastEncryptionPromise = encryptCredentialEnvelopeAsync(cleanAccount, rawPassword)
          .then(asyncEnvelope => {
            if (asyncEnvelope && typeof localStorage !== 'undefined') {
              localStorage.setItem(STORAGE_KEY_REMEMBER, JSON.stringify({
                account: cleanAccount,
                cipherEnvelope: asyncEnvelope
              }));
            }
          })
          .catch(() => {});
      }
    } catch (e) {}
  }
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
      <button type="button" class="box-toast-close" onclick="this.parentElement && this.parentElement.remove()" aria-label="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_close') : undefined) ?? '關閉'}">✕</button>
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
        headerAuthBtn.title = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_logged_in_title', { user: userDisplay }) : undefined) ?? `已登入：${userDisplay}。點擊管理雲端同步。`;
      } else {
        headerAuthBtn.classList.remove('is-logged-in');
        headerAuthBtn.classList.add('is-guest');
        headerAuthBtn.innerHTML = `
          <span class="sync-dot dot-guest"></span>
          <span class="header-auth-text">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_auth_btn') : undefined) ?? '登入 / 註冊'}</span>
        `;
        headerAuthBtn.title = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_auth_btn_title') : undefined) ?? '登入或註冊帳號以啟用手機/電腦即時同步。';
      }
    }

    // 2. 更新手機端頂部導航頭像按鈕 (#mobile-header-auth-btn)
    const mobileHeaderBtn = document.getElementById('mobile-header-auth-btn');
    if (mobileHeaderBtn) {
      if (currentUser) {
        mobileHeaderBtn.classList.add('is-logged-in');
        mobileHeaderBtn.classList.remove('is-guest');
        mobileHeaderBtn.title = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_mobile_logged_in', { user: userDisplay }) : undefined) ?? `已登入：${userDisplay}`;
      } else {
        mobileHeaderBtn.classList.remove('is-logged-in');
        mobileHeaderBtn.classList.add('is-guest');
        mobileHeaderBtn.title = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_mobile_guest') : undefined) ?? '雲端帳號 登入 / 註冊';
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
              <strong>${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_sync_active') : undefined) ?? '雲端即時同步中'}</strong>
            </div>
            <div class="auth-account-text">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_account_label') : undefined) ?? '登入帳號：'}${escapeHtml(userDisplay)}</div>
            <div class="auth-sub-hint">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_sync_active_hint') : undefined) ?? '倉庫資料已自動與雲端連動，手機與電腦雙向秒級同步。'}</div>
          </div>
        `;
      } else {
        modalStatus.innerHTML = `
          <div class="auth-status-card status-guest">
            <div class="auth-status-row">
              <span class="status-indicator-dot dot-guest"></span>
              <strong>${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_guest_mode') : undefined) ?? '本機訪客模式 (未登入)'}</strong>
            </div>
            <div class="auth-sub-hint">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_guest_hint') : undefined) ?? '輸入帳號與密碼登入或註冊，即可自動在手機與電腦間同步寶可夢倉庫。'}</div>
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
        titleEl.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_manage') : undefined) ?? '雲端帳號與同步管理';
      } else if (authViewMode === 'signup') {
        titleEl.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_signup') : undefined) ?? '註冊寶可夢雲端帳號';
      } else {
        titleEl.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_signin') : undefined) ?? '登入寶可夢雲端帳號';
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
        <h3 class="box-auth-prompt-title">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_prompt_title') : undefined) ?? '登入啟用寶可夢雲端倉庫'}</h3>
        <p class="box-auth-prompt-desc">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_prompt_desc') : undefined) ?? '登入或自訂帳號註冊，即可享有電腦與手機跨裝置秒級雙向同步、即時雲端備份與完整寶可夢管理功能。'}</p>
        <button type="button" class="box-auth-prompt-btn cloud-auth-btn btn-primary" onclick="window.CloudSync && window.CloudSync.openAuthModal('signin')">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span>${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_prompt_btn') : undefined) ?? '立即登入 / 註冊帳號'}</span>
        </button>
        <div class="box-auth-prompt-guest-row">
          <button type="button" class="box-auth-guest-link" onclick="window.CloudSync && window.CloudSync.dismissBoxAuthOverlay()">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_prompt_guest') : undefined) ?? '以本機訪客模式暫時使用 (離線模式)'}</button>
        </div>
      </div>
    `;
  }

  function switchAuthView(mode) {
    authViewMode = (mode === 'signup') ? 'signup' : 'signin';
    const titleEl = document.getElementById('cloud-auth-title-text');
    const signinView = document.getElementById('cloud-auth-signin-view');
    const signupView = document.getElementById('cloud-auth-signup-view');
    const msgBox = document.getElementById('cloud-auth-msg');
    if (msgBox) msgBox.style.display = 'none';

    if (authViewMode === 'signup') {
      if (titleEl && !currentUser) titleEl.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_signup') : undefined) ?? '註冊寶可夢雲端帳號';
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
      if (titleEl && !currentUser) titleEl.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_signin') : undefined) ?? '登入寶可夢雲端帳號';
      if (signinView) signinView.style.display = 'block';
      if (signupView) signupView.style.display = 'none';

      // 檢查是否有儲存的帳號與混合加密信封金庫
      const remembered = getRememberedAuth();
      const usernameInput = document.getElementById('cloud-auth-username');
      const passwordInput = document.getElementById('cloud-auth-password');
      const rememberCheck = document.getElementById('cloud-auth-remember-check');
      const signinUser = usernameInput;
      if (remembered) {
        if (usernameInput) usernameInput.value = remembered.account || '';
        if (passwordInput) {
          const syncPwd = decryptRememberedPassword();
          if (syncPwd) passwordInput.value = syncPwd;
          getRememberedAuthAsync().then(res => {
            if (res && res.password && passwordInput && !passwordInput.value) {
              passwordInput.value = res.password;
            }
          }).catch(() => {});
        }
        if (rememberCheck) rememberCheck.checked = true;
      }
      if (signinUser && typeof signinUser.focus === 'function') signinUser.focus();
    }
  }

  function openAuthModal(mode = 'signin') {
    let modal = document.getElementById('cloud-auth-modal');
    const currentLocale = (typeof window !== 'undefined' && window.I18N?.getDateLocale?.()) || 'zh-TW';
    if (modal && modal.getAttribute('data-cloud-lang') !== currentLocale) {
      modal.remove();
      modal = null;
    }
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
    const div = document.createElement('div');
    div.id = 'cloud-auth-modal';
    div.className = 'cloud-auth-backdrop';
    div.setAttribute('data-cloud-lang', (typeof window !== 'undefined' && window.I18N?.getDateLocale?.()) || 'zh-TW');
    div.style.display = 'none';
    div.innerHTML = `
      <div class="cloud-auth-dialog">
        <div class="cloud-auth-header">
          <div class="cloud-auth-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
            <span id="cloud-auth-title-text">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_title_signin') : undefined) ?? '登入寶可夢雲端帳號'}</span>
          </div>
          <button type="button" class="cloud-auth-close-btn" onclick="window.CloudSync.closeAuthModal()" aria-label="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_close') : undefined) ?? '關閉'}">✕</button>
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
                <label for="cloud-auth-username" class="cloud-auth-label">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_label_account') : undefined) ?? '帳號'}</label>
                <input type="text" id="cloud-auth-username" class="cloud-auth-input" placeholder="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_ph_account') : undefined) ?? '請輸入自訂帳號'}" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20">
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-auth-password" class="cloud-auth-label">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_label_password') : undefined) ?? '密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-auth-password" class="cloud-auth-input" placeholder="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_ph_password') : undefined) ?? '請輸入密碼'}" autocomplete="current-password" maxlength="32">
                  <button type="button" id="cloud-auth-pwd-toggle" class="cloud-auth-pwd-toggle" title="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_toggle_pwd') : undefined) ?? '顯示或隱藏密碼'}">
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
                <span>${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_remember') : undefined) ?? '記住帳號與密碼'}</span>
              </label>

              <button type="button" id="cloud-auth-signin-btn" class="cloud-auth-btn btn-primary" style="width: 100%;">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_signin') : undefined) ?? '登入帳號'}</button>

              <div class="cloud-auth-footer-link">
                ${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_no_account') : undefined) ?? '還沒有雲端帳號？'}
                <button type="button" id="cloud-switch-to-signup" class="cloud-auth-switch-btn">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_switch_signup') : undefined) ?? '一鍵註冊'}</button>
              </div>
            </div>

            <!-- 視窗 2: 註冊表單 (獨立視窗) -->
            <div id="cloud-auth-signup-view" style="display: none;">
              <div class="cloud-auth-input-group">
                <label for="cloud-signup-username" class="cloud-auth-label">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_label_signup_user') : undefined) ?? '自訂帳號'}</label>
                <input type="text" id="cloud-signup-username" class="cloud-auth-input" placeholder="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_ph_signup_user') : undefined) ?? '3 ~ 20 位英文、數字或底線'}" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20">
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-signup-password" class="cloud-auth-label">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_label_signup_pwd') : undefined) ?? '自訂密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-signup-password" class="cloud-auth-input" placeholder="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_ph_signup_pwd') : undefined) ?? '6 ~ 32 位密碼'}" autocomplete="new-password" maxlength="32">
                  <button type="button" id="cloud-signup-pwd-toggle" class="cloud-auth-pwd-toggle" title="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_toggle_pwd') : undefined) ?? '顯示或隱藏密碼'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="cloud-auth-input-group">
                <label for="cloud-signup-pwd-confirm" class="cloud-auth-label">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_label_confirm_pwd') : undefined) ?? '確認密碼'}</label>
                <div class="cloud-auth-password-wrap">
                  <input type="password" id="cloud-signup-pwd-confirm" class="cloud-auth-input" placeholder="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_ph_confirm_pwd') : undefined) ?? '請再次輸入密碼'}" autocomplete="new-password" maxlength="32">
                  <button type="button" id="cloud-signup-confirm-toggle" class="cloud-auth-pwd-toggle" title="${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_toggle_pwd') : undefined) ?? '顯示或隱藏密碼'}">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="button" id="cloud-auth-signup-btn" class="cloud-auth-btn btn-primary" style="width: 100%;">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_create_account') : undefined) ?? '立即建立帳號'}</button>

              <div class="cloud-auth-footer-link">
                ${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_has_account') : undefined) ?? '已經有雲端帳號？'}
                <button type="button" id="cloud-switch-to-signin" class="cloud-auth-switch-btn">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_switch_signin') : undefined) ?? '返回登入'}</button>
              </div>
            </div>
          </div>

          <!-- 已登入操作區塊 (已登入時展示) -->
          <div id="cloud-auth-user-section" style="display:none; margin-top: 14px;">
            <div class="cloud-auth-btn-row">
              <button type="button" id="cloud-auth-manual-sync-btn" class="cloud-auth-btn btn-primary">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_manual_sync') : undefined) ?? '立即手動同步'}</button>
              <button type="button" id="cloud-auth-signout-btn" class="cloud-auth-btn btn-danger">${(typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_signout') : undefined) ?? '登出帳號'}</button>
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
          showMsg((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_custom_username_required') : undefined) ?? '請輸入自訂帳號！');
          return;
        }
        if (!pwd) {
          showMsg((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_password_required') : undefined) ?? '請輸入密碼！');
          return;
        }

        signInBtn.disabled = true;
        signInBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_signing_in') : undefined) ?? '登入中...';
        const res = await signInWithPassword(account, pwd);
        signInBtn.disabled = false;
        signInBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_signin') : undefined) ?? '登入帳號';

        if (res.success) {
          saveRememberedAuth(account, pwd, isRemember);
          // 立即關閉視窗與遮罩，直接進入主頁面，絕不展示任何確認框或過渡畫面
          closeAuthModal();
          dismissBoxAuthOverlay();
          // 使用右下角浮動 Toast 進行狀態提醒
          showToast(
            (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signin_title') : undefined) ?? '登入成功',
            (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signin_msg', { account }) : undefined) ?? `歡迎回來，${account}！已連線雲端即時同步。`,
            'success'
          );
        } else {
          showMsg(res.error || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_signin_check') : undefined) ?? '登入失敗，請檢查帳號密碼！'));
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
          showMsg((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_custom_username_required') : undefined) ?? '請輸入自訂帳號！');
          return;
        }
        if (!pwd) {
          showMsg((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_custom_pwd_required') : undefined) ?? '請輸入自訂密碼！');
          return;
        }
        if (pwd !== confirm) {
          showMsg((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_pwd_mismatch') : undefined) ?? '兩次輸入的密碼不一致，請重新檢查！');
          return;
        }

        signUpBtn.disabled = true;
        signUpBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_creating') : undefined) ?? '建立中...';
        const res = await signUpWithPassword(account, pwd);
        signUpBtn.disabled = false;
        signUpBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_create_account') : undefined) ?? '立即建立帳號';

        if (res.success) {
          saveRememberedAuth(account, pwd, true);
          // 立即關閉視窗與遮罩，直接進入主頁面
          closeAuthModal();
          dismissBoxAuthOverlay();
          showToast(
            (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signup_title') : undefined) ?? '註冊成功',
            (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signup_msg', { account }) : undefined) ?? `歡迎使用，${account}！已自動登入並建立雲端倉庫。`,
            'success'
          );
        } else {
          showMsg(res.error || ((typeof window !== 'undefined' ? window.I18N?.t?.('cloud.err_signup_later') : undefined) ?? '註冊失敗，請稍後再試！'));
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
        showToast(
          (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signout_title') : undefined) ?? '已登出',
          (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_signout_msg') : undefined) ?? '目前已切換為本機訪客模式。',
          'info'
        );
      };
    }

    // 手動同步操作
    if (manualSyncBtn) {
      manualSyncBtn.onclick = async () => {
        clearMsg();
        manualSyncBtn.disabled = true;
        manualSyncBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_syncing') : undefined) ?? '同步中...';
        await triggerInitialSyncAndMerge();
        manualSyncBtn.disabled = false;
        manualSyncBtn.textContent = (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.ui_btn_manual_sync') : undefined) ?? '立即手動同步';
        closeAuthModal();
        showToast(
          (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_sync_title') : undefined) ?? '手動同步完成',
          (typeof window !== 'undefined' ? window.I18N?.t?.('cloud.toast_sync_msg') : undefined) ?? '寶可夢倉庫已與雲端完成最新同步。',
          'success'
        );
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
    getRememberedAuthAsync,
    decryptRememberedPassword,
    encryptCredentialEnvelope,
    decryptCredentialEnvelope,
    encryptCredentialEnvelopeAsync,
    decryptCredentialEnvelopeAsync,
    CRYPTO_SUITE_ID,
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
    window.CloudSync = CloudSyncModule;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncModule;
  }
})();
