/**
 * =========================================================================
 * IDBStorage — 輕量級純原生 IndexedDB 儲存驅動器 (Zero Dependencies)
 * =========================================================================
 * 1. 突破 LocalStorage 5MB 容量上限，提供百萬級結構化離線快取
 * 2. 雙對象倉庫 (ObjectStores)：
 *    - 'cache': 存放大型靜態 JSON 快取 (sleep_styles, ladder, manifest)
 *    - 'user': 存放使用者個人資料 (user_box, teams, preferences)
 * 3. 內建自動升級版本控制與錯誤回退 (LocalStorage Fallback)
 * 4. 全非同步 Promise API，避免主線程 UI 阻塞
 */

(function (global) {
  'use strict';

  const DB_NAME = 'pksleep_idb_v1';
  const DB_VERSION = 1;
  const STORES = ['cache', 'user'];

  let dbPromise = null;

  function isIDBSupported() {
    try {
      return typeof global !== 'undefined' &&
             'indexedDB' in global &&
             global.indexedDB !== null;
    } catch (e) {
      return false;
    }
  }

  const _memoryStore = new Map();
  function getFallbackStorage() {
    try {
      if (typeof global !== 'undefined' && global.localStorage) return global.localStorage;
      if (typeof localStorage !== 'undefined') return localStorage;
    } catch (e) {}
    return {
      getItem: (k) => _memoryStore.has(k) ? _memoryStore.get(k) : null,
      setItem: (k, v) => _memoryStore.set(k, String(v)),
      removeItem: (k) => _memoryStore.delete(k),
      keys: () => Array.from(_memoryStore.keys())
    };
  }

  function openDatabase() {
    if (!isIDBSupported()) {
      return Promise.resolve(null);
    }

    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
      try {
        const req = global.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = function (e) {
          const db = e.target.result;
          STORES.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName);
            }
          });
        };

        req.onsuccess = function (e) {
          resolve(e.target.result);
        };

        req.onerror = function () {
          resolve(null);
        };
      } catch (e) {
        resolve(null);
      }
    });

    return dbPromise;
  }

  const IDBStorage = {
    isSupported: isIDBSupported,

    /**
     * 讀取資料
     * @param {string} key
     * @param {string} storeName - 'cache' 或 'user'
     * @returns {Promise<any>}
     */
    get: async function (key, storeName = 'cache') {
      if (!key) return null;
      const db = await openDatabase();
      if (!db) {
        const store = getFallbackStorage();
        if (!store) return null;
        try {
          const raw = store.getItem('idb_' + storeName + '_' + key);
          return raw ? JSON.parse(raw) : null;
        } catch (e) {
          return null;
        }
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const os = tx.objectStore(storeName);
          const req = os.get(key);
          req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    /**
     * 寫入資料
     * @param {string} key
     * @param {any} value
     * @param {string} storeName - 'cache' 或 'user'
     * @returns {Promise<boolean>}
     */
    set: async function (key, value, storeName = 'cache') {
      if (!key) return false;
      const db = await openDatabase();
      if (!db) {
        const store = getFallbackStorage();
        if (!store) return false;
        try {
          store.setItem('idb_' + storeName + '_' + key, JSON.stringify(value));
          return true;
        } catch (e) {
          return false;
        }
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const os = tx.objectStore(storeName);
          const req = os.put(value, key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    },

    /**
     * 刪除特定鍵
     * @param {string} key
     * @param {string} storeName
     * @returns {Promise<boolean>}
     */
    delete: async function (key, storeName = 'cache') {
      if (!key) return false;
      const db = await openDatabase();
      if (!db) {
        const store = getFallbackStorage();
        if (!store) return false;
        try {
          store.removeItem('idb_' + storeName + '_' + key);
          return true;
        } catch (e) {
          return false;
        }
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const os = tx.objectStore(storeName);
          const req = os.delete(key);
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    },

    /**
     * 清空指定對象倉庫
     * @param {string} storeName
     * @returns {Promise<boolean>}
     */
    clear: async function (storeName = 'cache') {
      const db = await openDatabase();
      if (!db) {
        const store = getFallbackStorage();
        if (!store) return false;
        try {
          const prefix = 'idb_' + storeName + '_';
          const keys = typeof store.keys === 'function' ? store.keys() : Object.keys(store);
          keys.forEach((k) => {
            if (k.startsWith(prefix)) store.removeItem(k);
          });
          return true;
        } catch (e) {
          return false;
        }
      }

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const os = tx.objectStore(storeName);
          const req = os.clear();
          req.onsuccess = () => resolve(true);
          req.onerror = () => resolve(false);
        } catch (e) {
          resolve(false);
        }
      });
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = IDBStorage;
  }
  if (typeof global !== 'undefined') {
    global.IDBStorage = IDBStorage;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
