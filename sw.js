/**
 * sw.js — Pokemon Sleep App Service Worker
 * ========================================
 * 1. 圖片資源本地優先與持久化快取 (Local-First + Cache-First):
 *    攔截所有寶可夢頭像、樹果、食材、食譜、道具與島嶼圖示 (含本地 assets/ 與 serebii.net 圖床)，
 *    自動將外部圖床網址映射至同源本地 assets/ 鏡像，徹底消除第三方圖床 DNS/限流/死圖與 Opaque 污染。
 * 2. OCR 語言模型與字型持久化快取 (Cache-First):
 *    針對 .traineddata 與 .woff2 字型檔提供本地持久化快取，避免重複下載數 MB 模型檔。
 * 3. API 與動態資料直通 (Network-Only / Manifest 控制):
 *    Supabase 雲端同步與 JSON 資料交由前端 DataCacheManager 透過 manifest.json 雜湊比對精準控制。
 */

// 歷史快取標記：用於 activate 事件自動清理歷史舊版快取 pksleep-img-cache-v1 與 pksleep-static-cache-v1
const IMG_CACHE_NAME = 'pksleep-img-cache-v20261106_04';
const STATIC_CACHE_NAME = 'pksleep-static-v20261113_1549';
const VALID_CACHES = [IMG_CACHE_NAME, STATIC_CACHE_NAME];

const FALLBACK_SVG_BODY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#38bdf8"/></svg>';

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

/**
 * 將外部 Serebii 圖床網址轉換為同源本地 assets/ 相對路徑
 */
function mapSerebiiToLocalRelPath(url) {
  if (!url || !url.hostname || !url.hostname.includes('serebii.net')) return '';
  let pathname = '';
  try {
    pathname = decodeURIComponent(url.pathname || '');
  } catch (e) {
    pathname = url.pathname || '';
  }
  if (pathname.includes('/pokemonsleep/pokemon/icon/')) {
    const fn = pathname.split('/pokemonsleep/pokemon/icon/')[1];
    if (fn) return 'assets/pokemon/icon/' + fn;
  }
  if (pathname.includes('/pokemonsleep/items/')) {
    const fn = pathname.split('/pokemonsleep/items/')[1];
    if (fn) return 'assets/items/' + fn.replace(/'/g, '');
  }
  if (pathname.includes('/itemdex/sprites/')) {
    const fn = pathname.split('/itemdex/sprites/')[1];
    if (fn) return 'assets/items/' + fn.replace(/'/g, '');
  }
  if (pathname.includes('/pokemonsleep/locations/')) {
    const fn = pathname.split('/pokemonsleep/locations/')[1];
    if (fn) {
      const stem = fn.replace(/\.(jpg|jpeg|png|webp)$/i, '');
      return 'assets/islands/original/' + stem + '-location.jpg';
    }
  }
  if (pathname.includes('/pokemonsleep/berries/')) {
    const fn = pathname.split('/pokemonsleep/berries/')[1];
    if (fn) return 'assets/berries/' + fn;
  }
  if (pathname.includes('/pokemonsleep/ingredients/')) {
    const fn = pathname.split('/pokemonsleep/ingredients/')[1];
    if (fn) return 'assets/ingredients/' + fn;
  }
  if (pathname.includes('/pokemonsleep/meals/')) {
    const fn = pathname.split('/pokemonsleep/meals/')[1];
    if (fn) return 'assets/meals/' + fn;
  }
  if (pathname.endsWith('/pokemonsleep/star.png')) {
    return 'assets/star.png';
  }
  return '';
}

function isValidCacheableImageResponse(resp) {
  return !!(resp && resp.ok && resp.status === 200 && resp.type !== 'opaque');
}

function createFallbackSvgResponse() {
  return new Response(FALLBACK_SVG_BODY, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
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

  // 0. 頁面導航 (HTML)：一律向網路重新驗證，確保推送新版本後立即取得帶有新 ?v= 的入口頁
  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(new Request(request, { cache: 'no-cache' })).catch(() => fetch(request))
    );
    return;
  }

  // 1. 圖片資源：本地同源鏡像優先 + 嚴格狀態碼快取驗證 (杜絕 Opaque 403/429/503 快取污染)
  if (isImageRequest(request, url)) {
    const localRelPath = mapSerebiiToLocalRelPath(url);
    const scopeBase = (self.registration && self.registration.scope)
      ? self.registration.scope
      : (self.location.origin + '/');
    const localAssetUrl = localRelPath ? new URL(localRelPath, scopeBase).href : '';

    event.respondWith(
      caches.open(IMG_CACHE_NAME).then(async (cache) => {
        // A. 若可映射為本地同源圖檔，優先讀取本地快取或同源靜態檔案
        if (localAssetUrl) {
          const cachedLocal = await cache.match(localAssetUrl);
          if (isValidCacheableImageResponse(cachedLocal)) {
            return cachedLocal;
          }
          try {
            const localResp = await fetch(localAssetUrl);
            if (isValidCacheableImageResponse(localResp)) {
              cache.put(localAssetUrl, localResp.clone()).catch(() => {});
              return localResp;
            }
          } catch (e) {
            // 本地鏡像若未命中則繼續嘗試原始請求
          }
        }

        // B. 檢查原始請求快取（嚴格排除歷史 Opaque 錯誤回應）
        const cachedOrig = await cache.match(request);
        if (isValidCacheableImageResponse(cachedOrig)) {
          return cachedOrig;
        }
        if (cachedOrig && cachedOrig.type === 'opaque') {
          cache.delete(request).catch(() => {});
        }

        // C. 發起網路請求（僅在同源或 CORS 200 OK 時寫入快取，絕不快取 Opaque 回應）
        try {
          const networkResponse = await fetch(request);
          if (isValidCacheableImageResponse(networkResponse)) {
            cache.put(request, networkResponse.clone()).catch(() => {});
          }
          if (networkResponse) {
            return networkResponse;
          }
        } catch (err) {
          // 網路或 DNS 失敗時回傳安全 SVG 佔位圖，避免 respondWith(undefined) 崩潰
        }

        return createFallbackSvgResponse();
      })
    );
    return;
  }

  // 2. OCR 模型、字型檔、版本化靜態程式碼 (?v=...) 與 CDN 函式庫快取 (Cache-First 0ms 秒開)
  if (isStaticHeavyAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then((cache) =>
        cache.match(request).then((cachedResponse) => {
          if (cachedResponse && cachedResponse.status === 200) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone()).catch(() => {});
            }
            return networkResponse;
          }).catch(() => cachedResponse || new Response('', { status: 504 }));
        })
      )
    );
    return;
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PURGE_IMAGE_CACHE') {
    caches.delete(IMG_CACHE_NAME).catch(() => {});
  }
});
