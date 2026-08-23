/**
 * Adversarial Redirection State Machine & Anti-Loop Stress Test Probe
 * Exhaustive Permutation Matrix & Cycle Detection
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

// 1. Extract Redirection Scripts from actual HTML files
const indexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'index.html'), 'utf8');
const appIndexHtml = fs.readFileSync(path.join(WORKSPACE_ROOT, 'app', 'index.html'), 'utf8');

// Extract script in head of index.html (between the first <script> and </script>)
const firstScriptOpen = indexHtml.indexOf('<script>');
const firstScriptClose = indexHtml.indexOf('</script>', firstScriptOpen);
if (firstScriptOpen === -1 || firstScriptClose === -1) {
  throw new Error('Failed to locate first <script> tag in index.html');
}
const indexRedirectScript = indexHtml.substring(firstScriptOpen + 8, firstScriptClose);

// Extract script in head of app/index.html (between the first <script> and </script>)
const appFirstScriptOpen = appIndexHtml.indexOf('<script>');
const appFirstScriptClose = appIndexHtml.indexOf('</script>', appFirstScriptOpen);
if (appFirstScriptOpen === -1 || appFirstScriptClose === -1) {
  throw new Error('Failed to locate first <script> tag in app/index.html');
}
const appRedirectScript = appIndexHtml.substring(appFirstScriptOpen + 8, appFirstScriptClose);

// Simulation Environment Factory
function createEnvironment({
  page = 'index.html', // 'index.html' or 'app/index.html'
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

// Execute single-step redirection on a page
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

// Multi-hop cycle detector simulating navigation between pages
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
      // Equilibrium reached!
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

    // Parse target of redirection
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
    loopDetected: true, // Failed to terminate within maxHops -> infinite redirect loop!
    finalPage: currentPage,
    terminated: false
  };
}

// Permutation Matrix Definitions
const SCREEN_WIDTHS = [
  { name: '360px (Standard Mobile)', width: 360, isSmall: true },
  { name: '390px (iPhone 12/13/14/15)', width: 390, isSmall: true },
  { name: '768px (Mobile Boundary Threshold)', width: 768, isSmall: true },
  { name: '769px (Desktop Boundary Threshold)', width: 769, isSmall: false },
  { name: '1024px (Tablet/Laptop)', width: 1024, isSmall: false },
  { name: '1920px (Desktop Full HD)', width: 1920, isSmall: false }
];

const USER_AGENTS = [
  {
    name: 'iPhone (iOS 17)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPhone',
    maxTouchPoints: 5,
    isMobile: true
  },
  {
    name: 'Android (Samsung Galaxy S23)',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv8l',
    maxTouchPoints: 5,
    isMobile: true
  },
  {
    name: 'iPad (Mobile UA Safari)',
    ua: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    platform: 'iPad',
    maxTouchPoints: 5,
    isMobile: true
  },
  {
    name: 'iPad (Desktop UA MacIntel touch)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    platform: 'MacIntel',
    maxTouchPoints: 5,
    isMobile: true
  },
  {
    name: 'Mac Desktop (macOS Sonoma)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
    isMobile: false
  },
  {
    name: 'Windows Desktop (Win 11 Chrome)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'Win32',
    maxTouchPoints: 0,
    isMobile: false
  }
];

const STORAGE_STATES = [
  { name: 'desktop', storage: { pksleep_view_pref: 'desktop' }, throws: false },
  { name: 'mobile', storage: { pksleep_view_pref: 'mobile' }, throws: false },
  { name: 'null (empty)', storage: {}, throws: false },
  { name: 'corrupted_str ("invalid")', storage: { pksleep_view_pref: 'invalid' }, throws: false },
  { name: 'corrupted_num ("12345")', storage: { pksleep_view_pref: '12345' }, throws: false },
  { name: 'corrupted_json ("{}")', storage: { pksleep_view_pref: '{}' }, throws: false },
  { name: 'storage_exception (SecurityError)', storage: {}, throws: true }
];

const URL_QUERIES = [
  { name: 'no query', search: '' },
  { name: '?view=desktop', search: '?view=desktop' },
  { name: '?view=mobile', search: '?view=mobile' },
  { name: '?view=auto', search: '?view=auto' },
  { name: '?reset_view=1', search: '?reset_view=1' },
  { name: '?view=DESKTOP (uppercase)', search: '?view=DESKTOP' },
  { name: '?view=Mobile (mixedcase)', search: '?view=Mobile' },
  { name: '?foo=1&view=desktop&bar=2 (multi)', search: '?foo=1&view=desktop&bar=2' },
  { name: '?view=unknown_val', search: '?view=unknown_val' }
];

const URL_HASHES = [
  { name: 'empty hash', hash: '' },
  { name: '#recipes', hash: '#recipes' },
  { name: '#wiki', hash: '#wiki' },
  { name: '#box', hash: '#box' },
  { name: '#news', hash: '#news' },
  { name: '#tab-pokemon', hash: '#tab-pokemon' }
];

// Run Exhaustive Permutation Matrix
console.log('================================================================');
console.log('    Milestone 1 Challenger: Exhaustive Redirection Matrix');
console.log('================================================================\n');

let totalCombinations = 0;
let passedCombinations = 0;
let failedCombinations = 0;
let infiniteLoopsDetected = 0;
let unhandledErrors = 0;
const failureReports = [];

for (const widthObj of SCREEN_WIDTHS) {
  for (const uaObj of USER_AGENTS) {
    for (const storageObj of STORAGE_STATES) {
      for (const queryObj of URL_QUERIES) {
        for (const hashObj of URL_HASHES) {
          totalCombinations++;

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

          // 1. Test starting at index.html
          const navResult = simulateNavigationChain('index.html', config);

          if (navResult.loopDetected) {
            infiniteLoopsDetected++;
            failedCombinations++;
            failureReports.push({
              type: 'INFINITE_LOOP',
              config: { width: widthObj.name, ua: uaObj.name, storage: storageObj.name, query: queryObj.name, hash: hashObj.name },
              history: navResult.history
            });
            continue;
          }

          if (navResult.error) {
            unhandledErrors++;
            failedCombinations++;
            failureReports.push({
              type: 'UNHANDLED_ERROR',
              config: { width: widthObj.name, ua: uaObj.name, storage: storageObj.name, query: queryObj.name, hash: hashObj.name },
              error: navResult.error.message
            });
            continue;
          }

          // Verify Hash Preservation
          if (hashObj.hash && navResult.finalHash !== hashObj.hash) {
            failedCombinations++;
            failureReports.push({
              type: 'HASH_LOST',
              config: { width: widthObj.name, ua: uaObj.name, storage: storageObj.name, query: queryObj.name, hash: hashObj.name },
              expectedHash: hashObj.hash,
              actualHash: navResult.finalHash
            });
            continue;
          }

          // Verify Expected Destination based on Business Logic
          let queryView = null;
          const qMatch = queryObj.search.match(/[?&]view=([^&#]*)/i);
          if (qMatch) queryView = decodeURIComponent(qMatch[1]).toLowerCase();

          let expectedFinalPage;
          if (queryView === 'desktop') {
            expectedFinalPage = 'index.html';
          } else if (queryView === 'mobile') {
            expectedFinalPage = 'app/index.html';
          } else if (queryView === 'auto' || queryObj.search.includes('reset_view=1')) {
            expectedFinalPage = (widthObj.isSmall || uaObj.isMobile) ? 'app/index.html' : 'index.html';
          } else {
            // Check storage pref
            const pref = storageObj.storage.pksleep_view_pref;
            if (pref === 'desktop') {
              expectedFinalPage = 'index.html';
            } else if (pref === 'mobile') {
              expectedFinalPage = 'app/index.html';
            } else {
              // null or corrupted -> fallback to auto-detection!
              expectedFinalPage = (widthObj.isSmall || uaObj.isMobile) ? 'app/index.html' : 'index.html';
            }
          }

          if (navResult.finalPage !== expectedFinalPage) {
            failedCombinations++;
            failureReports.push({
              type: 'INCORRECT_DESTINATION',
              config: { width: widthObj.name, ua: uaObj.name, storage: storageObj.name, query: queryObj.name, hash: hashObj.name },
              expectedPage: expectedFinalPage,
              actualPage: navResult.finalPage,
              hops: navResult.hops
            });
            continue;
          }

          passedCombinations++;
        }
      }
    }
  }
}

console.log(`Total Permutations Tested: ${totalCombinations}`);
console.log(`Passed: ${passedCombinations}`);
console.log(`Failed: ${failedCombinations}`);
console.log(`Infinite Redirect Loops: ${infiniteLoopsDetected}`);
console.log(`Unhandled Errors: ${unhandledErrors}`);

if (failureReports.length > 0) {
  console.log(`\n--- First 10 Failure Reports ---`);
  failureReports.slice(0, 10).forEach((f, idx) => {
    console.log(`\nFailure #${idx + 1}: [${f.type}]`);
    console.log(`  Config: ${JSON.stringify(f.config)}`);
    if (f.error) console.log(`  Error: ${f.error}`);
    if (f.expectedPage) console.log(`  Expected: ${f.expectedPage}, Actual: ${f.actualPage}, Hops: ${f.hops}`);
    if (f.expectedHash) console.log(`  Expected Hash: ${f.expectedHash}, Actual Hash: ${f.actualHash}`);
    if (f.history) console.log(`  History: ${JSON.stringify(f.history)}`);
  });
}

// Exit code based on failures
process.exit(failedCombinations > 0 ? 1 : 0);
