/**
 * tests/test_security_audit.js
 * Security Regression and Vulnerability Remediation Verification Suite
 * ===================================================================
 * Verifies all security hardening measures implemented across:
 *   1. Content Security Policy (CSP) & Web Worker directives
 *   2. Reverse Tabnabbing (rel="noopener noreferrer" on all external target="_blank" links)
 *   3. Credential Protection (Plaintext password elimination from localStorage)
 *   4. DOM XSS & Error Boundary Escaping / Prototype Pollution Defense
 *   5. Service Worker Path Traversal Rejection & Origin Isolation
 *   6. Agent Safety Scripts (sync-brain.sh traversal prevention & zero glyph policy)
 *   7. Model Collaboration Documentation Hierarchy Verification
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

let total = 0;
let passed = 0;

async function check(name, fn) {
  total++;
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      await res;
    }
    passed++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function checkAsync(name, fn) {
  return check(name, fn);
}

(async () => {

// ---------------------------------------------------------------------------
// 1. Content Security Policy (CSP) Verification
// ---------------------------------------------------------------------------
await check('CSP: index.html and app/index.html contain worker-src and exclude unused cdnjs', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const appIndexHtml = fs.readFileSync(path.join(ROOT_DIR, 'app', 'index.html'), 'utf8');

  for (const [name, content] of [['index.html', indexHtml], ['app/index.html', appIndexHtml]]) {
    const cspMatch = content.match(/<meta\s+http-equiv=["']Content-Security-Policy["']\s+content="([^"]+)"/i);
    assert(cspMatch, `Content-Security-Policy meta tag must exist in ${name}`);
    const csp = cspMatch[1];

    assert(!csp.includes('cdnjs.cloudflare.com'), `${name} CSP must not whitelist unused cdnjs.cloudflare.com`);
    assert(csp.includes("worker-src 'self' blob:;"), `${name} CSP must explicitly define worker-src 'self' blob:;`);
    assert(csp.includes("base-uri 'self';"), `${name} CSP must restrict base-uri to 'self'`);
    assert(csp.includes("object-src 'none';"), `${name} CSP must restrict object-src to 'none'`);
  }
});

// ---------------------------------------------------------------------------
// 2. Reverse Tabnabbing Hardening (target="_blank" requires rel="noopener noreferrer")
// ---------------------------------------------------------------------------
await check('Tabnabbing: All external target="_blank" links contain rel="noopener noreferrer"', () => {
  const filesToCheck = [
    'index.html',
    'app/index.html',
    'js/modules/pokedex/pokedex_overlay.js',
    'js/modules/app.js',
    'js/core/i18n/i18n_dict_zh_tw.js',
    'js/core/i18n/i18n_dict_en_us.js',
    'js/core/i18n.js'
  ];

  for (const relFile of filesToCheck) {
    const fullPath = path.join(ROOT_DIR, relFile);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      if (line.includes('target="_blank"') || line.includes('target=\\"_blank\\"')) {
        // Line must also contain rel="noopener noreferrer" or rel=\"noopener noreferrer\"
        const hasRel = line.includes('rel="noopener noreferrer"') ||
                       line.includes('rel=\\"noopener noreferrer\\"') ||
                       line.includes("rel='noopener noreferrer'") ||
                       // Check adjacent lines in multi-line tag declarations
                       lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 3)).some(l => l.includes('noopener noreferrer'));
        assert(hasRel, `${relFile}:${idx + 1} target="_blank" link must include rel="noopener noreferrer"`);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. Credential Protection: Plaintext Password Removal from LocalStorage
// ---------------------------------------------------------------------------
await check('Credentials: saveRememberedAuth never stores passwords and getRememberedAuth strips password', async () => {
  const mockStorage = {};
  global.localStorage = {
    getItem: (k) => (Object.prototype.hasOwnProperty.call(mockStorage, k) ? mockStorage[k] : null),
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };
  global.window = global;

  const cloudSync = require(path.join(ROOT_DIR, 'js', 'core', 'cloudSync.js'));
  assert(cloudSync && typeof cloudSync.saveRememberedAuth === 'function', 'CloudSync must export saveRememberedAuth');

  // 1. Verify saving credentials does NOT write password in plaintext
  cloudSync.saveRememberedAuth('testPlayer_123', 'SecretPassword987!', true);
  const rawStored = global.localStorage.getItem('PKMSLEEP_REMEMBER_AUTH_V1');
  assert(rawStored, 'Stored remembered auth payload must exist');
  assert(!rawStored.includes('SecretPassword987!'), 'localStorage MUST NEVER contain plaintext password');

  const parsed = JSON.parse(rawStored);
  assert.strictEqual(parsed.account, 'testPlayer_123', 'Account name must be retained');
  assert.strictEqual(parsed.password, undefined, 'Password field must not exist in stored JSON');

  // Verify Hybrid RSA-OAEP-2048 + AES-256-GCM + PBKDF2-SHA256 envelope structure
  assert(parsed.cipherEnvelope && typeof parsed.cipherEnvelope === 'object', 'cipherEnvelope must be an object');
  assert.strictEqual(parsed.cipherEnvelope.alg, 'RSA-OAEP-2048+AES-256-GCM+PBKDF2-SHA256', 'alg must match CRYPTO_SUITE_ID');
  assert.strictEqual(parsed.cipherEnvelope.v, 2, 'Version must be 2');
  assert.strictEqual(parsed.cipherEnvelope.rsaBits, 2048, 'RSA bits must be 2048');
  assert.strictEqual(parsed.cipherEnvelope.aesBits, 256, 'AES bits must be 256');
  assert.strictEqual(parsed.cipherEnvelope.kdfIterations, 100000, 'PBKDF2 iterations must be 100000');
  assert(typeof parsed.cipherEnvelope.wrappedDek === 'string' && parsed.cipherEnvelope.wrappedDek.length > 0, 'wrappedDek must be non-empty string');
  assert(typeof parsed.cipherEnvelope.iv === 'string' && parsed.cipherEnvelope.iv.length > 0, 'iv must be non-empty string');
  assert(typeof parsed.cipherEnvelope.salt === 'string' && parsed.cipherEnvelope.salt.length > 0, 'salt must be non-empty string');
  assert(typeof parsed.cipherEnvelope.tag === 'string' && parsed.cipherEnvelope.tag.length > 0, 'tag must be non-empty string');
  assert(typeof parsed.cipherEnvelope.ciphertext === 'string' && parsed.cipherEnvelope.ciphertext.length > 0, 'ciphertext must be non-empty string');

  // Verify decryptRememberedPassword
  const decryptedSync = cloudSync.decryptRememberedPassword();
  assert.strictEqual(decryptedSync, 'SecretPassword987!', 'decryptRememberedPassword must return original plaintext password');

  // Verify tamper detection on cloudSync.decryptCredentialEnvelope
  // 1. Mutate ciphertext
  const tamperedCipher = {
    ...parsed.cipherEnvelope,
    ciphertext: parsed.cipherEnvelope.ciphertext[0] === 'A' ? 'B' + parsed.cipherEnvelope.ciphertext.slice(1) : 'A' + parsed.cipherEnvelope.ciphertext.slice(1)
  };
  assert.strictEqual(cloudSync.decryptCredentialEnvelope(tamperedCipher, 'testPlayer_123'), null, 'Tampered ciphertext must fail decryption');

  // 2. Mutate tag
  const tamperedTag = {
    ...parsed.cipherEnvelope,
    tag: parsed.cipherEnvelope.tag[0] === 'A' ? 'B' + parsed.cipherEnvelope.tag.slice(1) : 'A' + parsed.cipherEnvelope.tag.slice(1)
  };
  assert.strictEqual(cloudSync.decryptCredentialEnvelope(tamperedTag, 'testPlayer_123'), null, 'Tampered auth tag must fail decryption');

  // 3. Mutate wrappedDek
  const tamperedDek = {
    ...parsed.cipherEnvelope,
    wrappedDek: parsed.cipherEnvelope.wrappedDek[0] === 'A' ? 'B' + parsed.cipherEnvelope.wrappedDek.slice(1) : 'A' + parsed.cipherEnvelope.wrappedDek.slice(1)
  };
  assert.strictEqual(cloudSync.decryptCredentialEnvelope(tamperedDek, 'testPlayer_123'), null, 'Tampered wrappedDek must fail decryption');

  // 4. Calling with wrong account (AAD & PBKDF2 mismatch)
  assert.strictEqual(cloudSync.decryptCredentialEnvelope(parsed.cipherEnvelope, 'wrongAccount_999'), null, 'Mismatched account AAD must fail decryption');

  // Verify Async WebCrypto envelope encryption and decryption
  const asyncEnv = await cloudSync.encryptCredentialEnvelopeAsync('asyncUser_01', 'AsyncVaultPass#2026');
  assert(asyncEnv && typeof asyncEnv === 'object', 'encryptCredentialEnvelopeAsync must return an envelope');
  assert.strictEqual(asyncEnv.alg, 'RSA-OAEP-2048+AES-256-GCM+PBKDF2-SHA256', 'Async alg must match');
  assert.strictEqual(asyncEnv.v, 2, 'Async v must be 2');
  assert.strictEqual(asyncEnv.rsaBits, 2048, 'Async rsaBits must be 2048');
  assert.strictEqual(asyncEnv.aesBits, 256, 'Async aesBits must be 256');
  assert(typeof asyncEnv.wrappedDek === 'string' && asyncEnv.wrappedDek.length > 0, 'Async wrappedDek must be non-empty');
  assert(typeof asyncEnv.iv === 'string' && asyncEnv.iv.length > 0, 'Async iv must be non-empty');
  assert(typeof asyncEnv.salt === 'string' && asyncEnv.salt.length > 0, 'Async salt must be non-empty');
  assert(typeof asyncEnv.tag === 'string' && asyncEnv.tag.length > 0, 'Async tag must be non-empty');
  assert(typeof asyncEnv.ciphertext === 'string' && asyncEnv.ciphertext.length > 0, 'Async ciphertext must be non-empty');

  const decryptedAsync = await cloudSync.decryptCredentialEnvelopeAsync(asyncEnv, 'asyncUser_01');
  assert.strictEqual(decryptedAsync, 'AsyncVaultPass#2026', 'decryptCredentialEnvelopeAsync must decrypt async envelope');

  const wrongUserAsync = await cloudSync.decryptCredentialEnvelopeAsync(asyncEnv, 'wrongUser_02');
  assert.strictEqual(wrongUserAsync, null, 'decryptCredentialEnvelopeAsync with wrong account must return null');

  // 2. Verify reading legacy data strips any existing password
  global.localStorage.setItem('PKMSLEEP_REMEMBER_AUTH_V1', JSON.stringify({
    account: 'legacyUser',
    password: 'insecureLegacyPassword'
  }));

  const retrieved = cloudSync.getRememberedAuth();
  assert(retrieved, 'Remembered auth should be retrieved');
  assert.strictEqual(retrieved.account, 'legacyUser');
  assert.strictEqual(retrieved.password, undefined, 'getRememberedAuth must strip password property');

  // 3. Verify unchecking remember clears storage
  cloudSync.saveRememberedAuth('testPlayer_123', '', false);
  assert.strictEqual(global.localStorage.getItem('PKMSLEEP_REMEMBER_AUTH_V1'), null, 'Storage should be cleared when remember is false');
});

// ---------------------------------------------------------------------------
// 4. Remote Data Sanitization and Prototype Pollution Defense
// ---------------------------------------------------------------------------
await check('Sanitization: sanitizeImportedPokemon rejects prototype pollution and normalizes fields', () => {
  const boxApp = require(path.join(ROOT_DIR, 'js', 'modules', 'box.js'));
  assert(typeof boxApp.sanitizeImportedPokemon === 'function', 'sanitizeImportedPokemon must be exported on PokemonBoxApp');
  const sanitize = boxApp.sanitizeImportedPokemon;

  // 1. Prototype pollution attacks
  const attack1 = JSON.parse('{"__proto__": {"isAdmin": true}, "name": "Pikachu"}');
  assert.strictEqual(sanitize(attack1), null, '__proto__ key must be rejected');

  const attack2 = { constructor: { prototype: { poll: true } }, name: 'Charmander' };
  assert.strictEqual(sanitize(attack2), null, 'constructor key must be rejected');

  const attack3 = { prototype: { test: 1 }, name: 'Bulbasaur' };
  assert.strictEqual(sanitize(attack3), null, 'prototype key must be rejected');

  // 2. Legitimate record sanitization & clamping
  const rawPokemon = {
    uid: 'pkm_valid_123',
    name: '  Pikachu  ',
    level: 150, // Should clamp to max 100
    main_skill_level: 99, // Should clamp to max 8
    ribbon: 10, // Should clamp to max 4
    subskills: ['Helping Speed M', '<script>alert(1)</script>', 'Skill Trigger S', 'Extra 4', 'Extra 5', 'Extra 6'],
    ingredients: ['Apple', 'Herb', 'Milk', 'Extra']
  };

  const clean = sanitize(rawPokemon);
  assert(clean, 'Valid Pokemon record must produce clean object');
  assert.strictEqual(clean.name, 'Pikachu');
  assert.strictEqual(clean.level, 100, 'Level must be clamped to 100');
  assert.strictEqual(clean.main_skill_level, 8, 'Skill level must be clamped to 8');
  assert.strictEqual(clean.ribbon, 4, 'Ribbon tier must be clamped to 4');
  assert.strictEqual(clean.subskills.length, 5, 'Subskills must be clamped to 5 slots');
  assert.strictEqual(clean.ingredients.length, 3, 'Ingredients must be clamped to 3 slots');
});

// ---------------------------------------------------------------------------
// 5. Service Worker Path Traversal Rejection & Origin Isolation
// ---------------------------------------------------------------------------
await check('Service Worker: mapSerebiiToLocalRelPath rejects path traversal and enforces origin rules', () => {
  const swCode = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');

  // Create isolated sandbox to test sw helper functions
  const sandbox = {
    self: {
      location: { origin: 'https://s102213039.github.io' },
      addEventListener() {}
    },
    URL,
    decodeURIComponent
  };
  vm.createContext(sandbox);

  // Extract functions from sw.js
  vm.runInContext(swCode + `
    self.__test_mapSerebii = mapSerebiiToLocalRelPath;
    self.__test_isStaticHeavy = isStaticHeavyAsset;
    self.__test_sanitizeFilename = sanitizePathFilename;
  `, sandbox);

  const mapSerebii = sandbox.self.__test_mapSerebii;
  const isStaticHeavy = sandbox.self.__test_isStaticHeavy;
  const sanitizeFilename = sandbox.self.__test_sanitizeFilename;

  // 1. Path traversal attacks
  const traversalUrl1 = new URL('https://www.serebii.net/pokemonsleep/pokemon/icon/../../sensitive_file.png');
  assert.strictEqual(mapSerebii(traversalUrl1), '', 'Path traversal via ../ must return empty string');

  const traversalUrl2 = new URL('https://www.serebii.net/pokemonsleep/items/..%2f..%2fconfig.json');
  assert.strictEqual(mapSerebii(traversalUrl2), '', 'Encoded path traversal must return empty string');

  const traversalFilename = sanitizeFilename('../etc/passwd');
  assert.strictEqual(traversalFilename, '', 'sanitizePathFilename must reject traversal tokens');

  // 2. Legitimate URL mapping
  const validUrl = new URL('https://www.serebii.net/pokemonsleep/pokemon/icon/25.png');
  assert.strictEqual(mapSerebii(validUrl), 'assets/pokemon/icon/25.png', 'Valid Serebii icon must map to local relative path');

  // 3. Static asset origin enforcement
  const sameOriginVersioned = new URL('https://s102213039.github.io/css/styles.min.css?v=20261114_1200');
  assert.strictEqual(isStaticHeavy(sameOriginVersioned), true, 'Same-origin versioned CSS must be cached');

  const crossOriginUntrusted = new URL('https://attacker.example.com/malicious.js?v=123');
  assert.strictEqual(isStaticHeavy(crossOriginUntrusted), false, 'Untrusted cross-origin URL must NOT be classified as static asset');

  const trustedCdnWasm = new URL('https://cdn.jsdelivr.net/npm/tesseract.js-core@v5/tesseract-core.wasm');
  assert.strictEqual(isStaticHeavy(trustedCdnWasm), true, 'Trusted CDN WASM must be cached');
});

// ---------------------------------------------------------------------------
// 6. CI/CD Workflow Script Injection Mitigation
// ---------------------------------------------------------------------------
await check('CI/CD: update-data.yml uses $SYNC_TYPE environment variable instead of inline interpolation', () => {
  const workflowContent = fs.readFileSync(path.join(ROOT_DIR, '.github', 'workflows', 'update-data.yml'), 'utf8');

  // Look for dangerous inline expressions inside run: blocks
  const lines = workflowContent.split('\n');
  let inRunBlock = false;
  lines.forEach((line, idx) => {
    if (line.trim().startsWith('run:')) {
      inRunBlock = true;
    } else if (line.trim().startsWith('- name:') || (inRunBlock && line.length > 0 && !line.startsWith(' ') && !line.startsWith('\t'))) {
      inRunBlock = false;
    }

    if (inRunBlock && line.includes('${{ github.event.inputs.')) {
      assert.fail(`update-data.yml:${idx + 1} contains inline expression inside run block: ${line.trim()}`);
    }
  });

  assert(workflowContent.includes('echo "Sync type: $SYNC_TYPE"'), 'Workflow must use $SYNC_TYPE env var in echo');
  assert(workflowContent.includes('if [ "$SYNC_TYPE" != "news_only" ]; then'), 'Workflow must use $SYNC_TYPE env var in condition');
});

// ---------------------------------------------------------------------------
// 7. Localhost Sync Server Security Hardening
// ---------------------------------------------------------------------------
await check('Sync Server: sync_server.py validates Origin header and enforces token authentication', () => {
  const serverCode = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'sync_server.py'), 'utf8');

  assert(!serverCode.includes("Access-Control-Allow-Origin', '*'"), 'Wildcard Access-Control-Allow-Origin must be eliminated');
  assert(serverCode.includes('ALLOWED_ORIGIN_REGEX'), 'Server must define origin validation regex');
  assert(serverCode.includes('SYNC_TOKEN'), 'Server must define sync authorization token');
  assert(serverCode.includes('X-Sync-Token'), 'Server must verify X-Sync-Token header');
  assert(serverCode.includes('is_authenticated'), 'Server must implement is_authenticated check');
});

// ---------------------------------------------------------------------------
// 8. Python Scripts Timeout Verification
// ---------------------------------------------------------------------------
await check('Network Timeouts: build_webapp_data.py and build_recipes.py include timeout=30', () => {
  const dataScript = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'build_webapp_data.py'), 'utf8');
  assert(dataScript.includes('urlopen(url, timeout=30)'), 'build_webapp_data.py must specify timeout=30 in urlopen');

  const recipeScript = fs.readFileSync(path.join(ROOT_DIR, 'scripts', 'build_recipes.py'), 'utf8');
  assert(recipeScript.includes('urlopen(req, timeout=30)'), 'build_recipes.py must specify timeout=30 in urlopen(req)');
  assert(recipeScript.includes('urlopen(dreq, timeout=30)'), 'build_recipes.py must specify timeout=30 in urlopen(dreq)');
});

// ---------------------------------------------------------------------------
// 9. Agent Safety Scripts & Documentation Zero-Glyph Policy Verification
// ---------------------------------------------------------------------------
await check('Agent Safety: sync-brain.sh validates UUID and project boundaries, zero emojis in agent-docs', () => {
  const syncBrainCode = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'agent-docs', 'scripts', 'sync-brain.sh'), 'utf8');

  assert(syncBrainCode.includes('UUID_PATTERN'), 'sync-brain.sh must define UUID regex pattern');
  assert(syncBrainCode.includes('Path traversal detected'), 'sync-brain.sh must validate project directory boundaries');
  assert(!syncBrainCode.includes('\u2713'), 'sync-brain.sh must not contain unescaped unicode checkmark glyph');
  assert(syncBrainCode.includes('[v]'), 'sync-brain.sh must use ASCII [v] indicator');

  const agentDocsReadme = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'agent-docs', 'README.md'), 'utf8');
  assert(!agentDocsReadme.includes('\u2705'), 'agent-docs/README.md must not contain checkmark emojis (U+2705)');
  assert(!agentDocsReadme.includes('→'), 'agent-docs/README.md must not contain arrow glyphs');
});

// ---------------------------------------------------------------------------
// 10. Model Collaboration Documentation Hierarchy
// ---------------------------------------------------------------------------
await check('Model Collaboration: Hydrogen established as Tier 0 Primary and Gemini 3.8 Flash as Tier 1-2 Secondary', () => {
  const protocol = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'agent-docs', 'PROTOCOL.md'), 'utf8');
  assert(protocol.includes('Hydrogen'), 'PROTOCOL.md must establish Hydrogen as primary model');
  assert(protocol.includes('Gemini 3.8 Flash'), 'PROTOCOL.md must establish Gemini 3.8 Flash as secondary model');

  const harness = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'agent-docs', 'HETERO_MODEL_HARNESS.md'), 'utf8');
  assert(harness.includes('第一主力模型：Hydrogen'), 'HETERO_MODEL_HARNESS.md must designate Hydrogen as primary model');
  assert(harness.includes('第二主力模型：Gemini 3.8 Flash'), 'HETERO_MODEL_HARNESS.md must designate Gemini 3.8 Flash as secondary model');

  const agentsMd = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'AGENTS.md'), 'utf8');
  assert(agentsMd.includes('第一主力模型 Hydrogen'), 'AGENTS.md must designate Hydrogen as primary model');
  assert(agentsMd.includes('第二主力模型 Gemini 3.8 Flash'), 'AGENTS.md must designate Gemini 3.8 Flash as secondary model');

  const geminiMd = fs.readFileSync(path.join(process.env.HOME, '.gemini', 'GEMINI.md'), 'utf8');
  assert(geminiMd.includes('第一主力模型 Hydrogen'), 'GEMINI.md must designate Hydrogen as primary model');
  assert(geminiMd.includes('第二主力模型 Gemini 3.8 Flash'), 'GEMINI.md must designate Gemini 3.8 Flash as secondary model');

  const projectMd = fs.readFileSync(path.join(ROOT_DIR, 'PROJECT.md'), 'utf8');
  assert(projectMd.includes('Primary Model: Hydrogen'), 'PROJECT.md must document Hydrogen as primary model');
  assert(projectMd.includes('Secondary Model: Gemini 3.8 Flash'), 'PROJECT.md must document Gemini 3.8 Flash as secondary model');
});

  console.log(`\n======================================================`);
  console.log(`Security Audit Test Results: ${passed} / ${total} Passed (0 Failed)`);
  console.log(`======================================================\n`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
