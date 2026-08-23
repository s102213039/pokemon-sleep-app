/**
 * Test Routing when Entry Page is app/index.html across All Permutations
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

const firstScriptOpen = indexHtml.indexOf('<script>');
const firstScriptClose = indexHtml.indexOf('</script>', firstScriptOpen);
const indexRedirectScript = indexHtml.substring(firstScriptOpen + 8, firstScriptClose);

const appFirstScriptOpen = appIndexHtml.indexOf('<script>');
const appFirstScriptClose = appIndexHtml.indexOf('</script>', appFirstScriptOpen);
const appRedirectScript = appIndexHtml.substring(appFirstScriptOpen + 8, appFirstScriptClose);

function createEnvironment({
  page = 'app/index.html',
  width = 1920,
  height = 1080,
  userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  platform = 'Win32',
  maxTouchPoints = 0,
  initialStorage = {},
  storageThrows = false,
  url = 'http://localhost/' + page,
  search = '',
  hash = ''
}) {
  const storageData = { ...initialStorage };
  let redirectedTo = null;
  let navigationCount = 0;

  const mockStorage = {
    getItem(k) {
      if (storageThrows) throw new Error('SecurityError: The operation is insecure.');
      return Object.prototype.hasOwnProperty.call(storageData, k) ? storageData[k] : null;
    },
    setItem(k, v) {
      if (storageThrows) throw new Error('QuotaExceededError: Storage quota exceeded.');
      storageData[k] = String(v);
    },
    removeItem(k) {
      if (storageThrows) throw new Error('SecurityError: The operation is insecure.');
      delete storageData[k];
    },
    clear() {
      if (storageThrows) throw new Error('SecurityError: The operation is insecure.');
      Object.keys(storageData).forEach(k => delete storageData[k]);
    }
  };

  const mockLocation = {
    _href: url + search + hash,
    get href() { return this._href; },
    set href(val) {
      navigationCount++;
      redirectedTo = val;
      this._href = val;
    },
    search: search,
    hash: hash,
    pathname: page.startsWith('app/') ? '/app/index.html' : '/index.html',
    replace(val) {
      navigationCount++;
      redirectedTo = val;
      this._href = val;
    }
  };

  const mockNavigator = {
    userAgent: userAgent,
    platform: platform,
    maxTouchPoints: maxTouchPoints
  };

  const mockDocument = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  };

  const mockWindow = {
    location: mockLocation,
    navigator: mockNavigator,
    localStorage: mockStorage,
    document: mockDocument,
    innerWidth: width,
    innerHeight: height,
    screen: { width: width, height: height },
    console: {
      log: () => {},
      error: () => {},
      warn: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  };

  return {
    window: mockWindow,
    get redirectedTo() { return redirectedTo; },
    get storage() { return storageData; },
    get navigationCount() { return navigationCount; }
  };
}

function executePageRouting(page, envConfig) {
  const env = createEnvironment({ ...envConfig, page });
  const scriptCode = page === 'index.html' ? indexRedirectScript : appRedirectScript;

  const sandbox = {
    window: env.window,
    document: env.window.document,
    location: env.window.location,
    navigator: env.window.navigator,
    localStorage: env.window.localStorage,
    console: env.window.console
  };
  sandbox.window.window = sandbox.window;

  try {
    vm.runInNewContext(scriptCode, sandbox, { timeout: 1000 });
  } catch (err) {
    return {
      error: err,
      redirectedTo: null,
      storage: env.storage
    };
  }

  return {
    error: null,
    redirectedTo: env.redirectedTo,
    storage: env.storage
  };
}

function simulateNavigationChain(initialPage, envConfig, maxHops = 10) {
  const history = [];
  let currentPage = initialPage;
  let currentSearch = envConfig.search || '';
  let currentHash = envConfig.hash || '';
  let currentStorage = { ...envConfig.initialStorage };

  for (let hop = 0; hop < maxHops; hop++) {
    history.push({
      page: currentPage,
      search: currentSearch,
      hash: currentHash,
      storage: { ...currentStorage }
    });

    const stepResult = executePageRouting(currentPage, {
      ...envConfig,
      page: currentPage,
      search: currentSearch,
      hash: currentHash,
      initialStorage: currentStorage
    });

    if (stepResult.error) {
      return {
        hops: hop,
        history,
        error: stepResult.error,
        loopDetected: false,
        finalPage: currentPage,
        finalSearch: currentSearch,
        finalHash: currentHash,
        finalStorage: currentStorage,
        terminated: true
      };
    }

    currentStorage = { ...stepResult.storage };

    if (!stepResult.redirectedTo) {
      return {
        hops: hop,
        history,
        error: null,
        loopDetected: false,
        finalPage: currentPage,
        finalSearch: currentSearch,
        finalHash: currentHash,
        finalStorage: currentStorage,
        terminated: true
      };
    }

    const target = stepResult.redirectedTo;
    let nextPage;
    let nextSearch = '';
    let nextHash = '';

    const urlMatch = target.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
    const targetPath = urlMatch[1] || '';
    nextSearch = urlMatch[2] || '';
    nextHash = urlMatch[3] || '';

    if (currentPage === 'index.html') {
      if (targetPath.includes('app/index.html') || targetPath === 'app/index.html') {
        nextPage = 'app/index.html';
      } else {
        nextPage = targetPath;
      }
    } else {
      if (targetPath.includes('index.html') || targetPath === '../index.html') {
        nextPage = 'index.html';
      } else {
        nextPage = targetPath;
      }
    }

    currentPage = nextPage;
    currentSearch = nextSearch;
    currentHash = nextHash;
  }

  return {
    hops: maxHops,
    history,
    error: null,
    loopDetected: true,
    finalPage: currentPage,
    terminated: false
  };
}

const SCREEN_WIDTHS = [
  { name: '360px', width: 360, isSmall: true },
  { name: '390px', width: 390, isSmall: true },
  { name: '768px', width: 768, isSmall: true },
  { name: '769px', width: 769, isSmall: false },
  { name: '1024px', width: 1024, isSmall: false },
  { name: '1920px', width: 1920, isSmall: false }
];

const USER_AGENTS = [
  { name: 'iPhone', ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPhone', maxTouchPoints: 5, isMobile: true },
  { name: 'Android', ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l', maxTouchPoints: 5, isMobile: true },
  { name: 'iPad-Mobile', ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', platform: 'iPad', maxTouchPoints: 5, isMobile: true },
  { name: 'iPad-DesktopUA', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 5, isMobile: true },
  { name: 'Mac-Desktop', ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', platform: 'MacIntel', maxTouchPoints: 0, isMobile: false },
  { name: 'Win-Desktop', ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', platform: 'Win32', maxTouchPoints: 0, isMobile: false }
];

const STORAGE_STATES = [
  { name: 'desktop', storage: { pksleep_view_pref: 'desktop' }, throws: false },
  { name: 'mobile', storage: { pksleep_view_pref: 'mobile' }, throws: false },
  { name: 'null', storage: {}, throws: false },
  { name: 'corrupted_str', storage: { pksleep_view_pref: 'invalid' }, throws: false },
  { name: 'corrupted_num', storage: { pksleep_view_pref: '12345' }, throws: false },
  { name: 'corrupted_json', storage: { pksleep_view_pref: '{}' }, throws: false },
  { name: 'storage_exception', storage: {}, throws: true }
];

const URL_QUERIES = [
  { name: 'empty', search: '' },
  { name: 'view=desktop', search: '?view=desktop' },
  { name: 'view=mobile', search: '?view=mobile' },
  { name: 'view=auto', search: '?view=auto' },
  { name: 'reset_view=1', search: '?reset_view=1' },
  { name: 'view=DESKTOP', search: '?view=DESKTOP' },
  { name: 'view=Mobile', search: '?view=Mobile' },
  { name: 'multi_param', search: '?foo=1&view=desktop&bar=2' },
  { name: 'unknown_query', search: '?view=unknown_val' }
];

const URL_HASHES = [
  { name: 'empty', hash: '' },
  { name: '#recipes', hash: '#recipes' },
  { name: '#wiki', hash: '#wiki' },
  { name: '#box', hash: '#box' },
  { name: '#news', hash: '#news' },
  { name: '#tab-pokemon', hash: '#tab-pokemon' }
];

let totalFromApp = 0;
let passedFromApp = 0;
let loopsFromApp = 0;
let errorsFromApp = 0;
let failedFromApp = 0;

for (const widthObj of SCREEN_WIDTHS) {
  for (const uaObj of USER_AGENTS) {
    for (const storageObj of STORAGE_STATES) {
      for (const queryObj of URL_QUERIES) {
        for (const hashObj of URL_HASHES) {
          totalFromApp++;
          const config = {
            width: widthObj.width,
            height: 800,
            userAgent: uaObj.ua,
            platform: uaObj.platform,
            maxTouchPoints: uaObj.maxTouchPoints,
            initialStorage: storageObj.storage,
            storageThrows: storageObj.throws,
            search: queryObj.search,
            hash: hashObj.hash
          };

          const navResult = simulateNavigationChain('app/index.html', config);

          if (navResult.loopDetected) {
            loopsFromApp++;
            failedFromApp++;
            continue;
          }

          if (navResult.error) {
            errorsFromApp++;
            failedFromApp++;
            continue;
          }

          // Expected: If query is ?view=desktop (or multi containing view=desktop), redirects to index.html and stays.
          // Otherwise, stays on app/index.html.
          let queryView = null;
          const qMatch = queryObj.search.match(/[?&]view=([^&#]*)/i);
          if (qMatch) queryView = decodeURIComponent(qMatch[1]).toLowerCase();

          let expectedPage = 'app/index.html';
          if (queryView === 'desktop') {
            expectedPage = 'index.html';
          }

          if (navResult.finalPage === expectedPage && (!hashObj.hash || navResult.finalHash === hashObj.hash)) {
            passedFromApp++;
          } else {
            failedFromApp++;
          }
        }
      }
    }
  }
}

console.log(`Starting from app/index.html: Total=${totalFromApp}, Passed=${passedFromApp}, Failed=${failedFromApp}, Loops=${loopsFromApp}, Errors=${errorsFromApp}`);
