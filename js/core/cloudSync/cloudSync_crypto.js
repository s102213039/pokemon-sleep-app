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
