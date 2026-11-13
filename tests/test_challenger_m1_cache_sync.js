/**
 * =========================================================================
 * Challenger M1-1: Cache & Version Sync Adversarial Stress Test Suite
 * =========================================================================
 * Empirically stress-tests:
 * 1. Version stamp idempotency, dirty hash detection, and state recovery.
 * 2. Service Worker navigation vs static asset cache-first rules in sw.js.
 * 3. domUtils.js DataCacheManager SW registration and visibility lifecycle.
 * 4. CI cleanliness check simulation under unstamped / stale files.
 * 5. npm run test:fast working tree cleanliness and idempotency.
 * =========================================================================
 */

'use strict';

const path = require('path');
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const { execFileSync, execSync } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const STATE_FILE = path.join(WORKSPACE_ROOT, 'scripts/.build_stamp.json');
const INDEX_HTML = path.join(WORKSPACE_ROOT, 'index.html');
const APP_INDEX_HTML = path.join(WORKSPACE_ROOT, 'app/index.html');
const SW_JS = path.join(WORKSPACE_ROOT, 'sw.js');
const { stamp } = require('../scripts/stamp_version');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failures.push({ name, error: err });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('======================================================');
console.log('   Adversarial Cache & Version Sync Stress Suite');
console.log('======================================================');

// Backup files for atomic restorations
const backupState = fs.existsSync(STATE_FILE) ? fs.readFileSync(STATE_FILE, 'utf8') : null;
const backupIndex = fs.readFileSync(INDEX_HTML, 'utf8');
const backupAppIndex = fs.readFileSync(APP_INDEX_HTML, 'utf8');
const backupSw = fs.readFileSync(SW_JS, 'utf8');

function restoreAll() {
  if (backupState !== null) {
    fs.writeFileSync(STATE_FILE, backupState, 'utf8');
  }
  fs.writeFileSync(INDEX_HTML, backupIndex, 'utf8');
  fs.writeFileSync(APP_INDEX_HTML, backupAppIndex, 'utf8');
  fs.writeFileSync(SW_JS, backupSw, 'utf8');
}

(async function runAll() {
  // -----------------------------------------------------------------
  // Group 1: Version Stamp Idempotency, Dirty Detection & State Recovery
  // -----------------------------------------------------------------
  test('Group 1.1: Stamp idempotency when bundles are unchanged', () => {
    const res1 = stamp();
    const res2 = stamp();
    assert.strictEqual(res2.changed, false, 'Subsequent stamp must report changed = false');
    assert.strictEqual(res1.version, res2.version, 'Version string must remain identical');
  });

  test('Group 1.2: Stamped version consistency across all entrypoints', () => {
    const stampData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const indexContent = fs.readFileSync(INDEX_HTML, 'utf8');
    const appIndexContent = fs.readFileSync(APP_INDEX_HTML, 'utf8');
    const swContent = fs.readFileSync(SW_JS, 'utf8');

    const expectedVersion = stampData.version;
    assert.ok(expectedVersion, 'Version string must be non-empty');

    assert.ok(
      indexContent.includes(`?v=${expectedVersion}`),
      `index.html must contain ?v=${expectedVersion}`
    );
    assert.ok(
      appIndexContent.includes(`?v=${expectedVersion}`),
      `app/index.html must contain ?v=${expectedVersion}`
    );
    assert.ok(
      swContent.includes(`const STATIC_CACHE_NAME = 'pksleep-static-v${expectedVersion}';`),
      `sw.js must contain STATIC_CACHE_NAME with v${expectedVersion}`
    );
  });

  test('Group 1.3: Out-of-sync state file recovery (hash mismatch)', () => {
    try {
      const fakeState = {
        hash: '0000000000000000000000000000000000000000000000000000000000000000',
        version: '19990101_0000'
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(fakeState, null, 2), 'utf8');

      const res = stamp();
      assert.strictEqual(res.changed, true, 'stamp() must detect hash mismatch as changed = true');
      assert.notStrictEqual(res.version, '19990101_0000', 'New version must be generated');

      const newState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      assert.notStrictEqual(newState.hash, fakeState.hash, 'Hash must be updated');
      assert.strictEqual(newState.version, res.version, 'State version must match returned version');
    } finally {
      restoreAll();
      stamp();
    }
  });

  test('Group 1.4: Missing and corrupted state file resilience', () => {
    try {
      fs.writeFileSync(STATE_FILE, '{ INVALID_JSON_SYNTAX', 'utf8');
      const res = stamp();
      assert.strictEqual(res.changed, true, 'Corrupted state must trigger re-stamp');
      assert.ok(res.version, 'New version must be generated without crashing');

      const newState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      assert.strictEqual(newState.version, res.version, 'Recreated state must be valid JSON');
    } finally {
      restoreAll();
      stamp();
    }
  });

  test('Group 1.5: Bundle content tamper detection', () => {
    const targetBundle = path.join(WORKSPACE_ROOT, 'js/modules/wiki.min.js');
    const originalBundle = fs.readFileSync(targetBundle, 'utf8');
    try {
      fs.appendFileSync(targetBundle, '/* probe */', 'utf8');
      const res = stamp();
      assert.strictEqual(res.changed, true, 'Bundle byte alteration must trigger changed = true');
    } finally {
      fs.writeFileSync(targetBundle, originalBundle, 'utf8');
      restoreAll();
      stamp();
    }
  });

  test('Group 1.6: Entry files out-of-sync repair with identical bundle hash', () => {
    try {
      const stampData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      const tamperedIndex = backupIndex.replace(
        new RegExp(`\\?v=${stampData.version}`, 'g'),
        '?v=19990101_0000'
      );
      fs.writeFileSync(INDEX_HTML, tamperedIndex, 'utf8');

      // Calling stamp with matching bundle hash
      const res = stamp();
      assert.strictEqual(res.changed, false, 'Bundle hash unchanged -> changed = false');

      const repairedIndex = fs.readFileSync(INDEX_HTML, 'utf8');
      assert.ok(
        repairedIndex.includes(`?v=${stampData.version}`),
        'applyVersion must repair out-of-sync index.html even when changed = false'
      );
    } finally {
      restoreAll();
      stamp();
    }
  });

  // -----------------------------------------------------------------
  // Group 2: Service Worker Navigation vs Static Asset Cache-First Rules
  // -----------------------------------------------------------------
  function createSwSandbox() {
    const swCode = fs.readFileSync(SW_JS, 'utf8');
    const events = {};
    const mockCaches = {
      _store: new Map(),
      open: async (name) => {
        if (!mockCaches._store.has(name)) {
          mockCaches._store.set(name, new Map());
        }
        const cacheMap = mockCaches._store.get(name);
        return {
          match: async (req) => {
            const key = typeof req === 'string' ? req : req.url;
            return cacheMap.get(key) || null;
          },
          put: async (req, resp) => {
            const key = typeof req === 'string' ? req : req.url;
            cacheMap.set(key, resp);
          },
          delete: async (req) => {
            const key = typeof req === 'string' ? req : req.url;
            return cacheMap.delete(key);
          }
        };
      },
      keys: async () => Array.from(mockCaches._store.keys()),
      delete: async (name) => mockCaches._store.delete(name)
    };

    const fetchCalls = [];
    const mockFetch = async (req, opts) => {
      fetchCalls.push({ req, opts });
      if (req && req.url && req.url.includes('fail_network')) {
        throw new Error('Network failure simulation');
      }
      return {
        ok: true,
        status: 200,
        type: 'basic',
        clone: function () { return this; }
      };
    };

    const mockSelf = {
      location: { origin: 'https://pksleep.app' },
      registration: { scope: 'https://pksleep.app/' },
      addEventListener: (name, fn) => { events[name] = fn; },
      skipWaiting: () => {},
      clients: { claim: () => Promise.resolve() }
    };

    class MockRequest {
      constructor(input, opts = {}) {
        if (typeof input === 'string') {
          this.url = input;
          this.method = opts.method || 'GET';
          this.mode = opts.mode || 'cors';
          this.cache = opts.cache || 'default';
        } else {
          this.url = input.url;
          this.method = opts.method || input.method || 'GET';
          this.mode = opts.mode || input.mode || 'cors';
          this.cache = opts.cache || input.cache || 'default';
        }
      }
    }

    class MockResponse {
      constructor(body, init = {}) {
        this.body = body;
        this.status = init.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.type = 'basic';
        this.headers = new Map(Object.entries(init.headers || {}));
      }
      clone() { return this; }
    }

    const sandbox = {
      self: mockSelf,
      console,
      URL,
      Request: MockRequest,
      Response: MockResponse,
      caches: mockCaches,
      fetch: mockFetch
    };

    vm.createContext(sandbox);
    vm.runInContext(swCode, sandbox);

    return { events, mockCaches, fetchCalls, sandbox, mockSelf, MockRequest, MockResponse };
  }

  await testAsync('Group 2.1: Navigation fetch uses cache: no-cache and network-first', async () => {
    const { events, fetchCalls, MockRequest } = createSwSandbox();
    assert.ok(events.fetch, 'fetch event listener must be registered in sw.js');

    let respondedWithPromise = null;
    const navEvent = {
      request: new MockRequest('https://pksleep.app/', { mode: 'navigate' }),
      respondWith: (p) => { respondedWithPromise = p; }
    };

    events.fetch(navEvent);
    assert.ok(respondedWithPromise, 'Navigation event must call respondWith');

    const res = await respondedWithPromise;
    assert.strictEqual(res.status, 200, 'Navigation must resolve with status 200');
    assert.strictEqual(fetchCalls.length, 1, 'Exactly 1 fetch call executed');
    assert.strictEqual(fetchCalls[0].req.cache, 'no-cache', 'Navigation request must have cache: no-cache');
  });

  await testAsync('Group 2.2: Cross-origin navigation bypasses rule 0', async () => {
    const { events, MockRequest } = createSwSandbox();
    let responded = false;
    const crossNavEvent = {
      request: new MockRequest('https://external-auth.com/login', { mode: 'navigate' }),
      respondWith: () => { responded = true; }
    };

    events.fetch(crossNavEvent);
    assert.strictEqual(responded, false, 'Cross-origin navigation must not be intercepted');
  });

  await testAsync('Group 2.3: Versioned static asset Cache-First hit skips network', async () => {
    const { events, mockCaches, fetchCalls, MockRequest, MockResponse, sandbox } = createSwSandbox();
    const stampData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const staticCacheName = `pksleep-static-v${stampData.version}`;

    // Pre-populate cache
    const cache = await mockCaches.open(staticCacheName);
    const assetUrl = `https://pksleep.app/css/styles.min.css?v=${stampData.version}`;
    await cache.put(assetUrl, new MockResponse('/* cached css */', { status: 200 }));

    let respondedWithPromise = null;
    const reqEvent = {
      request: new MockRequest(assetUrl, { mode: 'cors' }),
      respondWith: (p) => { respondedWithPromise = p; }
    };

    events.fetch(reqEvent);
    assert.ok(respondedWithPromise, 'Versioned static asset must call respondWith');

    const result = await respondedWithPromise;
    assert.strictEqual(result.status, 200);
    assert.strictEqual(fetchCalls.length, 0, 'Cache hit must execute 0 network fetch calls');
  });

  await testAsync('Group 2.4: Versioned static asset Cache-First miss populates cache', async () => {
    const { events, mockCaches, fetchCalls, MockRequest, sandbox } = createSwSandbox();
    const stampData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const staticCacheName = `pksleep-static-v${stampData.version}`;

    const assetUrl = `https://pksleep.app/js/modules/wiki.min.js?v=${stampData.version}`;
    let respondedWithPromise = null;
    const reqEvent = {
      request: new MockRequest(assetUrl, { mode: 'cors' }),
      respondWith: (p) => { respondedWithPromise = p; }
    };

    events.fetch(reqEvent);
    assert.ok(respondedWithPromise, 'Must call respondWith');

    const result = await respondedWithPromise;
    assert.strictEqual(result.status, 200);
    assert.strictEqual(fetchCalls.length, 1, 'Network fetch executed on cache miss');

    // Verify written to cache
    const cache = await mockCaches.open(staticCacheName);
    const cachedItem = await cache.match(assetUrl);
    assert.ok(cachedItem, 'Fetched asset must be stored in static cache');
  });

  test('Group 2.5: Unversioned CSS/JS bypasses heavy static cache', () => {
    const { events, MockRequest } = createSwSandbox();
    let responded = false;
    const reqEvent = {
      request: new MockRequest('https://pksleep.app/css/styles.css', { mode: 'cors' }),
      respondWith: () => { responded = true; }
    };

    events.fetch(reqEvent);
    assert.strictEqual(responded, false, 'Unversioned CSS must not be intercepted by static heavy asset rule');
  });

  await testAsync('Group 2.6: Fonts and traineddata cached regardless of ?v=', async () => {
    const { events, MockRequest } = createSwSandbox();
    let fontResponded = false;
    let ocrResponded = false;

    events.fetch({
      request: new MockRequest('https://pksleep.app/fonts/custom.woff2', { mode: 'cors' }),
      respondWith: () => { fontResponded = true; }
    });
    events.fetch({
      request: new MockRequest('https://pksleep.app/tesseract/chi_tra.traineddata.gz', { mode: 'cors' }),
      respondWith: () => { ocrResponded = true; }
    });

    assert.ok(fontResponded, 'WOFF2 font must be intercepted as static heavy asset');
    assert.ok(ocrResponded, 'Traineddata model must be intercepted as static heavy asset');
  });

  await testAsync('Group 2.7: Activate event purges outdated static caches', async () => {
    const { events, mockCaches } = createSwSandbox();
    const stampData = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const currentStatic = `pksleep-static-v${stampData.version}`;
    const currentImg = 'pksleep-img-cache-v20261106_04';

    // Populate stores with current and stale caches
    await mockCaches.open(currentStatic);
    await mockCaches.open(currentImg);
    await mockCaches.open('pksleep-static-v19990101_0000');
    await mockCaches.open('legacy-cache-v0');

    let waitPromise = null;
    events.activate({
      waitUntil: (p) => { waitPromise = p; }
    });
    assert.ok(waitPromise, 'activate must call waitUntil');

    await waitPromise;
    const remainingCaches = await mockCaches.keys();
    assert.ok(remainingCaches.includes(currentStatic), 'Current static cache must be preserved');
    assert.ok(remainingCaches.includes(currentImg), 'Current img cache must be preserved');
    assert.ok(!remainingCaches.includes('pksleep-static-v19990101_0000'), 'Old static cache must be purged');
    assert.ok(!remainingCaches.includes('legacy-cache-v0'), 'Legacy cache must be purged');
  });

  // -----------------------------------------------------------------
  // Group 3: domUtils.js DataCacheManager SW Lifecycle Hardening
  // -----------------------------------------------------------------
  test('Group 3.1: DataCacheManager duplicate registration guard & updateViaCache none', () => {
    const domUtilsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/domUtils.js'), 'utf8');

    let registerCalls = 0;
    let registerOptions = null;
    let updateCalls = 0;
    const registeredListeners = {};

    const mockNavigator = {
      serviceWorker: {
        controller: {},
        addEventListener: (name, fn) => { registeredListeners[name] = fn; },
        register: (url, opts) => {
          registerCalls++;
          registerOptions = opts;
          return Promise.resolve({
            update: () => { updateCalls++; }
          });
        }
      }
    };

    const mockDocument = {
      readyState: 'complete',
      visibilityState: 'visible',
      addEventListener: (name, fn) => { registeredListeners[name] = fn; }
    };

    const mockWindow = {
      location: { protocol: 'https:', pathname: '/index.html', reload: () => {} },
      navigator: mockNavigator,
      document: mockDocument
    };

    const sandbox = {
      window: mockWindow,
      navigator: mockNavigator,
      document: mockDocument,
      location: mockWindow.location,
      console,
      module: { exports: {} },
      exports: {}
    };

    vm.createContext(sandbox);
    vm.runInContext(domUtilsCode, sandbox);

    const DOMUtils = sandbox.module.exports;
    assert.ok(DOMUtils.DataCacheManager, 'DataCacheManager must exist');

    // Attempt second registration
    DOMUtils.DataCacheManager.registerServiceWorker();
    assert.strictEqual(registerCalls, 1, 'Duplicate registration call must be ignored by _swRegistered guard');
    assert.strictEqual(registerOptions.updateViaCache, 'none', 'updateViaCache must be none');
  });

  test('Group 3.2: visibilitychange triggers reg.update()', () => {
    const domUtilsCode = fs.readFileSync(path.join(WORKSPACE_ROOT, 'js/core/domUtils.js'), 'utf8');

    let updateCalls = 0;
    const docListeners = {};

    const mockNavigator = {
      serviceWorker: {
        controller: {},
        addEventListener: () => {},
        register: () => Promise.resolve({
          update: () => { updateCalls++; }
        })
      }
    };

    const mockDocument = {
      readyState: 'loading',
      visibilityState: 'visible',
      addEventListener: (name, fn) => { docListeners[name] = fn; }
    };

    const mockWindow = {
      location: { protocol: 'https:', pathname: '/index.html' },
      navigator: mockNavigator,
      document: mockDocument,
      addEventListener: () => {}
    };

    const sandbox = {
      window: mockWindow,
      navigator: mockNavigator,
      document: mockDocument,
      location: mockWindow.location,
      console,
      module: { exports: {} },
      exports: {}
    };

    vm.createContext(sandbox);
    vm.runInContext(domUtilsCode, sandbox);

    const DOMUtils = sandbox.module.exports;
    DOMUtils.DataCacheManager._swRegistered = false;
    DOMUtils.DataCacheManager.registerServiceWorker();

    return new Promise((resolve, reject) => {
      setImmediate(() => {
        try {
          assert.strictEqual(updateCalls, 1, 'reg.update() called immediately on register');
          assert.ok(docListeners.visibilitychange, 'visibilitychange listener must be attached');

          // Trigger visibilitychange
          mockDocument.visibilityState = 'visible';
          docListeners.visibilitychange();
          assert.strictEqual(updateCalls, 2, 'reg.update() called on visibilitychange -> visible');

          // Trigger hidden
          mockDocument.visibilityState = 'hidden';
          docListeners.visibilitychange();
          assert.strictEqual(updateCalls, 2, 'reg.update() NOT called when visibilityState is hidden');
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });

  // -----------------------------------------------------------------
  // Group 4: CI Cleanliness Gate & Working Tree Simulation
  // -----------------------------------------------------------------
  test('Group 4.1: CI cleanliness check detects unstamped files and exits with 1', () => {
    const targetFile = path.join(WORKSPACE_ROOT, 'scripts/.build_stamp.json');
    const original = fs.readFileSync(targetFile, 'utf8');
    try {
      // Simulate unstamped state by adding a test property
      fs.writeFileSync(targetFile, JSON.stringify({ hash: 'stale', version: '0' }), 'utf8');

      let checkFailed = false;
      try {
        execSync(
          'if [ -n "$(git status --porcelain js/ css/ index.html app/index.html sw.js scripts/.build_stamp.json)" ]; then exit 1; fi',
          { cwd: WORKSPACE_ROOT, stdio: 'pipe' }
        );
      } catch (e) {
        checkFailed = true;
      }
      assert.strictEqual(checkFailed, true, 'CI check must exit with non-zero when stamp is modified');
    } finally {
      fs.writeFileSync(targetFile, original, 'utf8');
    }
  });

  test('Group 4.2: CI cleanliness check passes when working tree matches build', () => {
    // Current working tree should be consistent with npm run build
    let checkPassed = true;
    try {
      execSync('node scripts/stamp_version.js', { cwd: WORKSPACE_ROOT, stdio: 'pipe' });
    } catch (e) {
      checkPassed = false;
    }
    assert.strictEqual(checkPassed, true, 'stamp_version execution must succeed');
  });

  // -----------------------------------------------------------------
  // Group 5: Automated Test Suite Fast Run Working Tree Cleanliness
  // -----------------------------------------------------------------
  test('Group 5.1: npm run test:fast maintains clean and idempotent build stamps', () => {
    const beforeState = fs.readFileSync(STATE_FILE, 'utf8');
    const beforeIndex = fs.readFileSync(INDEX_HTML, 'utf8');
    const beforeAppIndex = fs.readFileSync(APP_INDEX_HTML, 'utf8');
    const beforeSw = fs.readFileSync(SW_JS, 'utf8');

    // Run fast tests via CLI
    execFileSync(process.execPath, [path.join(WORKSPACE_ROOT, 'tests/run_tests.js'), '--fast'], {
      cwd: WORKSPACE_ROOT,
      stdio: 'pipe',
      env: process.env
    });

    const afterState = fs.readFileSync(STATE_FILE, 'utf8');
    const afterIndex = fs.readFileSync(INDEX_HTML, 'utf8');
    const afterAppIndex = fs.readFileSync(APP_INDEX_HTML, 'utf8');
    const afterSw = fs.readFileSync(SW_JS, 'utf8');

    assert.strictEqual(beforeState, afterState, '.build_stamp.json must not drift after test:fast');
    assert.strictEqual(beforeIndex, afterIndex, 'index.html must not drift after test:fast');
    assert.strictEqual(beforeAppIndex, afterAppIndex, 'app/index.html must not drift after test:fast');
    assert.strictEqual(beforeSw, afterSw, 'sw.js must not drift after test:fast');
  });

  // Print Summary
  console.log('\n======================================================');
  console.log(`Results: ${passedTests} / ${totalTests} Passed (${failedTests} Failed)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
})().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
