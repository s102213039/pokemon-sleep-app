/**
 * DOMUtils & DataCacheManager — 專案共用安全 DOM 查詢、版本清單比對與本地快取管理器
 * =========================================================================
 * 1. DOMUtils: 提供跨環境安全元素查找、事件綁定與樣式操作
 * 2. DataCacheManager:
 *    - 透過輕量級 data/manifest.json (~700 Bytes) 比對各資料檔 SHA-256 雜湊值 (Hash)
 *    - 支援 Cache-First 本地快取優先秒開 (0ms 渲染)，背景僅在雜湊值變更時才下載對應 JSON
 *    - 內建請求合併 (In-Flight Deduplication) 與 10 分鐘檢查冷卻節流 (Cooldown Throttle)，
 *      徹底消除切分頁與定時器重複下載整份 data.json / recipes.json / news.json 的問題
 * 3. Service Worker 自動註冊: 啟用 sw.js 攔截並永久快取寶可夢/樹果/食材/料理圖片於 CacheStorage
 */
(function (global) {
  'use strict';

  const DOMUtils = {
    /**
     * 安全單一元素查詢
     * @param {Element|Document|null} parent - 查找容器，若為空則預設為 global.document
     * @param {string} selector - CSS 選擇器
     * @returns {Element|null}
     */
    find: function (parent, selector) {
      if (!selector) return null;
      const root = parent || (typeof global.document !== 'undefined' ? global.document : null);
      if (!root) return null;
      if (typeof root.querySelector === 'function') {
        try {
          return root.querySelector(selector);
        } catch (e) {
          return null;
        }
      }
      return null;
    },

    /**
     * 安全多元素查詢，保證回傳陣列
     * @param {Element|Document|null} parent - 查找容器，若為空則預設為 global.document
     * @param {string} selector - CSS 選擇器
     * @returns {Array<Element>}
     */
    findAll: function (parent, selector) {
      if (!selector) return [];
      const root = parent || (typeof global.document !== 'undefined' ? global.document : null);
      if (!root) return [];
      if (typeof root.querySelectorAll === 'function') {
        try {
          const res = root.querySelectorAll(selector);
          return res ? Array.from(res) : [];
        } catch (e) {
          return [];
        }
      }
      return [];
    },

    /**
     * 依據 ID 查找元素
     * @param {string} id - 元素 ID
     * @returns {Element|null}
     */
    byId: function (id) {
      if (!id || typeof global.document === 'undefined' || typeof global.document.getElementById !== 'function') {
        return null;
      }
      return global.document.getElementById(id);
    },

    /**
     * 安全切換 class
     * @param {Element|null} el
     * @param {string} className
     * @param {boolean} [force]
     */
    toggleClass: function (el, className, force) {
      if (!el || !el.classList || typeof el.classList.toggle !== 'function') return;
      el.classList.toggle(className, force);
    },

    /**
     * 批次設定樣式
     * @param {Element|null} el
     * @param {string} prop
     * @param {string} value
     */
    setStyle: function (el, prop, value) {
      if (!el || !el.style) return;
      el.style[prop] = value;
    },

    _scriptPromises: Object.create(null),

    /**
     * 按需單次動態載入外部腳本 (On-Demand Single-Flight Script Loader)
     * @param {string} src - 外部 Script URL
     * @returns {Promise<boolean>}
     */
    loadScriptOnce: function (src) {
      if (!src) return Promise.resolve(false);
      if (this._scriptPromises[src]) {
        return this._scriptPromises[src];
      }
      if (typeof global.document === 'undefined' || typeof global.document.createElement !== 'function') {
        return Promise.resolve(false);
      }
      const existing = this.find(global.document, `script[src="${src}"]`);
      if (existing && existing.getAttribute('data-loaded') === '1') {
        return Promise.resolve(true);
      }
      this._scriptPromises[src] = new Promise((resolve) => {
        try {
          const script = existing || global.document.createElement('script');
          script.src = src;
          script.async = true;
          script.onload = () => {
            if (script.setAttribute) script.setAttribute('data-loaded', '1');
            resolve(true);
          };
          script.onerror = () => {
            delete DOMUtils._scriptPromises[src];
            resolve(false);
          };
          if (!existing) {
            const target = global.document.head || global.document.body || global.document.documentElement;
            if (target && typeof target.appendChild === 'function') {
              target.appendChild(script);
            } else {
              resolve(false);
            }
          }
        } catch (e) {
          delete DOMUtils._scriptPromises[src];
          resolve(false);
        }
      });
      return this._scriptPromises[src];
    }
  };

  /* ─── 智慧型版本清單與本地快取管理器 (DataCacheManager) ─────────── */
  const MANIFEST_CACHE_KEY = 'pksleep_cache_manifest_v1';
  const MANIFEST_TIME_KEY = 'pksleep_cache_manifest_time';
  const FILE_HASH_PREFIX = 'pksleep_file_hash_';
  const CHECK_COOLDOWN_MS = 10 * 60 * 1000; // 10 分鐘內不重複發起網路檢查

  let _inFlightManifestPromise = null;
  let _memoryManifest = null;
  let _lastManifestFetchTs = 0;

  function getStorage() {
    try {
      if (typeof global !== 'undefined' && global.localStorage) return global.localStorage;
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) {}
    return null;
  }

  function getRecordCount(parsed) {
    if (!parsed) return 0;
    if (Array.isArray(parsed)) return parsed.length;
    if (typeof parsed === 'object') {
      if (parsed.byName && typeof parsed.byName === 'object') {
        return Object.keys(parsed.byName).length;
      }
      return Object.keys(parsed).length;
    }
    return 0;
  }

  const DataCacheManager = {
    MANIFEST_CACHE_KEY,
    MANIFEST_TIME_KEY,
    FILE_HASH_PREFIX,
    CHECK_COOLDOWN_MS,

    getFileHash: function (fileName) {
      const store = getStorage();
      if (!store || !fileName) return '';
      try {
        return store.getItem(FILE_HASH_PREFIX + fileName) || '';
      } catch (e) {
        return '';
      }
    },

    setFileHash: function (fileName, hash) {
      const store = getStorage();
      if (!store || !fileName || !hash) return;
      try {
        store.setItem(FILE_HASH_PREFIX + fileName, String(hash));
      } catch (e) {}
    },

    markFileUpdated: function (fileName, hash) {
      this.setFileHash(fileName, hash);
    },

    getCachedJson: function (cacheKey) {
      const store = getStorage();
      if (!store || !cacheKey) return null;
      try {
        const raw = store.getItem(cacheKey);
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    getCachedJsonAsync: async function (cacheKey) {
      const idb = (typeof global !== 'undefined' && global.IDBStorage) || (typeof window !== 'undefined' && window.IDBStorage);
      if (idb && typeof idb.get === 'function') {
        try {
          const val = await idb.get(cacheKey, 'cache');
          if (val) {
            return typeof val === 'string' ? JSON.parse(val) : val;
          }
        } catch (e) {}
      }
      return this.getCachedJson(cacheKey);
    },

    saveCachedJson: function (cacheKey, fileName, rawTextOrObj, explicitHash) {
      const store = getStorage();
      if (!store || !cacheKey) return;
      try {
        const text = typeof rawTextOrObj === 'string' ? rawTextOrObj : JSON.stringify(rawTextOrObj);
        try {
          store.setItem(cacheKey, text);
        } catch (quotaErr) {
          // LocalStorage 5MB quota protection: when exceeded, safe ignore as IDBStorage takes over
        }
        try {
          store.setItem(cacheKey + '_time', String(Date.now()));
        } catch (e) {}
        const hashToSave = explicitHash ||
          (_memoryManifest && _memoryManifest.files && _memoryManifest.files[fileName] && _memoryManifest.files[fileName].hash) ||
          '';
        if (fileName && hashToSave) {
          try {
            store.setItem(FILE_HASH_PREFIX + fileName, String(hashToSave));
          } catch (e) {}
        }

        const idb = (typeof global !== 'undefined' && global.IDBStorage) || (typeof window !== 'undefined' && window.IDBStorage);
        if (idb && typeof idb.set === 'function') {
          let objectToStore = rawTextOrObj;
          if (typeof rawTextOrObj === 'string') {
            try {
              objectToStore = JSON.parse(rawTextOrObj);
            } catch (e) {
              objectToStore = rawTextOrObj;
            }
          }
          idb.set(cacheKey, objectToStore, 'cache').catch(() => {});
        }
      } catch (e) {}
    },

    fetchManifest: async function (force) {
      if (typeof fetch === 'undefined') return null;
      const now = Date.now();
      const store = getStorage();

      if (!force) {
        if (_memoryManifest && (now - _lastManifestFetchTs < CHECK_COOLDOWN_MS)) {
          return _memoryManifest;
        }
        if (store) {
          try {
            const lastTime = parseInt(store.getItem(MANIFEST_TIME_KEY) || '0', 10);
            const cachedRaw = store.getItem(MANIFEST_CACHE_KEY);
            if (cachedRaw && lastTime > 0 && (now - lastTime < CHECK_COOLDOWN_MS)) {
              _memoryManifest = JSON.parse(cachedRaw);
              _lastManifestFetchTs = lastTime;
              return _memoryManifest;
            }
          } catch (e) {}
        }
      }

      if (_inFlightManifestPromise) {
        return _inFlightManifestPromise;
      }

      _inFlightManifestPromise = (async () => {
        const base = (typeof window !== 'undefined' && window.__DATA_BASE_PATH__) ? window.__DATA_BASE_PATH__ :
                     (typeof global !== 'undefined' && global.__DATA_BASE_PATH__) ? global.__DATA_BASE_PATH__ :
                     (typeof location !== 'undefined' && location.pathname && location.pathname.includes('/app/') ? '../' : '');
        const candidates = [
          `${base}data/manifest.json`,
          `data/manifest.json`,
          `../data/manifest.json`,
          `https://raw.githubusercontent.com/s102213039/pokemon-sleep-app/main/data/manifest.json`
        ];
        const uniqueCandidates = Array.from(new Set(candidates));

        for (const url of uniqueCandidates) {
          try {
            const res = await fetch(url, { cache: 'no-cache' });
            if (res && res.ok) {
              const manifest = await res.json();
              if (manifest && manifest.files) {
                _memoryManifest = manifest;
                _lastManifestFetchTs = Date.now();
                if (store) {
                  try {
                    store.setItem(MANIFEST_CACHE_KEY, JSON.stringify(manifest));
                    store.setItem(MANIFEST_TIME_KEY, String(_lastManifestFetchTs));
                  } catch (e) {}
                }
                return manifest;
              }
            }
          } catch (e) {}
        }

        if (store) {
          try {
            const fallbackRaw = store.getItem(MANIFEST_CACHE_KEY);
            if (fallbackRaw) return JSON.parse(fallbackRaw);
          } catch (e) {}
        }
        return null;
      })();

      try {
        return await _inFlightManifestPromise;
      } finally {
        _inFlightManifestPromise = null;
      }
    },

    /**
     * 檢查指定資料檔是否需要從遠端更新
     * @param {string} fileName - 例如 'data.json', 'recipes.json', 'news.json', 'sleep_styles.json'
     * @param {string} cacheKey - LocalStorage 快取鍵名
     * @param {boolean} [force=false] - 是否強制忽略冷卻時間檢查 manifest
     */
    checkFileNeedsUpdate: async function (fileName, cacheKey, force) {
      let cachedData = this.getCachedJson(cacheKey);
      if (!cachedData) {
        cachedData = await this.getCachedJsonAsync(cacheKey);
      }
      const hasValidCache = cachedData && getRecordCount(cachedData) > 0;
      const localHash = this.getFileHash(fileName);

      const manifest = await this.fetchManifest(!!force);
      const fileMeta = manifest && manifest.files ? manifest.files[fileName] : null;
      const remoteHash = fileMeta ? fileMeta.hash : '';

      if (!hasValidCache) {
        return { needsUpdate: true, remoteHash, cachedData: null };
      }

      if (!remoteHash) {
        // 無法取得遠端 manifest 時，直接沿用本地快取，不重抓大檔
        return { needsUpdate: false, remoteHash: localHash, cachedData };
      }

      if (localHash && localHash === remoteHash) {
        return { needsUpdate: false, remoteHash, cachedData };
      }

      // 若舊版快取尚未紀錄 hash，但筆數與 manifest 完全吻合，直接認領該 hash 免重抓
      if (!localHash && fileMeta && fileMeta.count && getRecordCount(cachedData) === fileMeta.count) {
        this.setFileHash(fileName, remoteHash);
        return { needsUpdate: false, remoteHash, cachedData };
      }

      return { needsUpdate: true, remoteHash, cachedData };
    },

    registerServiceWorker: function () {
      if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
      if (typeof location === 'undefined' || (location.protocol !== 'http:' && location.protocol !== 'https:')) return;
      try {
        const isSubApp = location.pathname && location.pathname.includes('/app/');
        const swUrl = isSubApp ? '../sw.js' : 'sw.js';
        navigator.serviceWorker.register(swUrl).catch(() => {});
      } catch (e) {}
    }
  };

  // 自動啟動 Service Worker 圖片與靜態資源快取
  if (typeof global !== 'undefined' && global.addEventListener) {
    global.addEventListener('load', function () {
      DataCacheManager.registerServiceWorker();
    });
  }

  DOMUtils.DataCacheManager = DataCacheManager;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMUtils;
  }
  if (typeof global !== 'undefined') {
    global.DOMUtils = DOMUtils;
    global.DataCacheManager = DataCacheManager;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
