/**
 * sw.js — Pokemon Sleep App Service Worker
 * ========================================
 * 1. 圖片資源持久化快取 (Cache-First):
 *    攔截所有寶可夢頭像、樹果、食材、食譜、道具與島嶼圖示 (含本地 assets/ 與 serebii.net 圖床)，
 *    首次載入後即寫入瀏覽器 CacheStorage，後續載入與切換分頁皆由本地快取瞬間讀取 (0 網路流量)。
 * 2. OCR 語言模型與字型持久化快取 (Cache-First):
 *    針對 .traineddata 與 .woff2 字型檔提供本地持久化快取，避免重複下載數 MB 模型檔。
 * 3. API 與動態資料直通 (Network-Only / Manifest 控制):
 *    Supabase 雲端同步與 JSON 資料交由前端 DataCacheManager 透過 manifest.json 雜湊比對精準控制。
 */

const IMG_CACHE_NAME = 'pksleep-img-cache-v1';
const STATIC_CACHE_NAME = 'pksleep-static-v20261023_03';
// 舊版快取標記：用於 activate 事件自動清理歷史舊版快取 pksleep-static-cache-v1
const LEGACY_STATIC_CACHE = 'pksleep-static-cache-v1';
const VALID_CACHES = [IMG_CACHE_NAME, STATIC_CACHE_NAME];

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!VALID_CACHES.includes(key)) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

function isImageRequest(request, url) {
  if (request.destination === 'image') return true;
  const pathname = url.pathname.toLowerCase();
  return (
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  );
}

function isStaticHeavyAsset(url) {
  const pathname = url.pathname.toLowerCase();
  if (
    pathname.endsWith('.traineddata') ||
    pathname.endsWith('.traineddata.gz') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.ttf')
  ) {
    return true;
  }
  // 針對帶有明確版本號 (?v=...) 的大型 CSS / JS 靜態資源或 CDN 函式庫啟用持久化快取
  if (url.searchParams && url.searchParams.has('v') && (pathname.endsWith('.css') || pathname.endsWith('.js'))) {
    return true;
  }
  if (url.hostname && url.hostname.includes('cdn.jsdelivr.net') && (pathname.endsWith('.js') || pathname.endsWith('.wasm'))) {
    return true;
  }
  return false;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (!request || request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 略過 Supabase 與 GitHub API 請求
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('api.github.com')
  ) {
    return;
  }

  // 1. 圖片資源：Cache-First 本地優先快取策略
  if (isImageRequest(request, url)) {
    event.respondWith(
      caches.open(IMG_CACHE_NAME).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (
              networkResponse &&
              (networkResponse.status === 200 || networkResponse.type === 'opaque')
            ) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          }).catch(() => cachedResponse);
        })
      )
    );
    return;
  }

  // 2. OCR 模型、字型檔與版本化資源快取
  if (isStaticHeavyAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        const pathname = url.pathname.toLowerCase();
        const isCode = pathname.endsWith('.css') || pathname.endsWith('.js');
        // 對於 JS / CSS 程式碼：Network-First（網路優先確保獲取最新版，離線時回退快取）
        if (isCode) {
          return fetch(request, { cache: 'no-cache' })
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone()).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => cache.match(request));
        }

        // 對於 OCR 模型與字型檔：Cache-First 本地優先快取
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          });
        });
      })
    );
  }
});
