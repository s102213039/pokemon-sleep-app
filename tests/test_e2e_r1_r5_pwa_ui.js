#!/usr/bin/env node
/**
 * Real Headless Chrome CDP End-to-End Acceptance Suite for R1 - R5:
 * - R1: Zero-flash synchronous theme load on refresh (Desktop & Mobile H5)
 * - R2: Ingredient ladder node bounds, zero header overlap, real click opens ranking modal
 * - R3: Ingredient ladder Dense Top-3 + Ingredient Selection skill badges & special font/effect
 * - R4: Energy Quick Check H5 6-column grid alignment vs Web Desktop single-row separation
 * - R5: Standalone H5 PWA status bar integration vs zero impact on regular browsers
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const assert = require('assert');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, 'http://127.0.0.1');
        let pathname = decodeURIComponent(reqUrl.pathname);
        if (pathname === '/') pathname = '/index.html';
        if (pathname === '/app' || pathname === '/app/') pathname = '/app/index.html';
        const resolved = path.resolve(ROOT_DIR, '.' + pathname);
        if (!resolved.startsWith(ROOT_DIR)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        const ext = path.extname(resolved).toLowerCase();
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-store'
        });
        fs.createReadStream(resolved).pipe(res);
      } catch (e) {
        if (!res.headersSent) res.writeHead(500);
        res.end(String(e));
      }
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, port: addr.port, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

function findChromeBinary() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ].filter(Boolean);
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Google Chrome binary not found on host');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

class ChromeCDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.wsUrl);
      this.ws = ws;
      const timer = setTimeout(() => reject(new Error('CDP WebSocket connect timeout')), 10000);
      ws.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      });
      ws.addEventListener('error', (err) => {
        clearTimeout(timer);
        reject(new Error('CDP WebSocket error: ' + (err.message || String(err))));
      });
      ws.addEventListener('message', (evt) => {
        try {
          const msg = JSON.parse(typeof evt.data === 'string' ? evt.data : evt.data.toString());
          if (msg.id && this.pending.has(msg.id)) {
            const p = this.pending.get(msg.id);
            this.pending.delete(msg.id);
            clearTimeout(p.timer);
            if (msg.error) {
              p.reject(new Error(`CDP ${p.method} failed: ${msg.error.message || JSON.stringify(msg.error)}`));
            } else {
              p.resolve(msg.result);
            }
          }
        } catch (_) {}
      });
      ws.addEventListener('close', () => {
        for (const [, p] of this.pending) {
          clearTimeout(p.timer);
          p.reject(new Error('CDP WebSocket closed'));
        }
        this.pending.clear();
      });
    });
  }

  send(method, params = {}, timeoutMs = 20000) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`CDP WebSocket not open for ${method}`));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      this.pending.set(id, { method, resolve, reject, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evalJs(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true
    });
    if (res && res.exceptionDetails) {
      const desc = (res.exceptionDetails.exception && res.exceptionDetails.exception.description) ||
                   res.exceptionDetails.text ||
                   'Unknown runtime exception';
      throw new Error('Browser JS exception: ' + desc);
    }
    return res && res.result ? res.result.value : undefined;
  }

  close() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    } catch (_) {}
  }
}

async function launchChromeCDP() {
  const chromeBin = findChromeBinary();
  const proc = spawn(chromeBin, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--remote-debugging-port=0',
    'about:blank'
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let stderrBuf = '';
  const debugPort = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timed out waiting for Chrome DevTools port. stderr: ' + stderrBuf));
    }, 15000);
    proc.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString('utf8');
      const m = stderrBuf.match(/DevTools listening on ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (m) {
        clearTimeout(timer);
        resolve(parseInt(m[1], 10));
      }
    });
    proc.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited prematurely (${code}). stderr: ${stderrBuf}`));
    });
  });

  let pageTarget = null;
  for (let i = 0; i < 30; i++) {
    const resp = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    const list = await resp.json();
    pageTarget = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
    if (pageTarget) break;
    await sleep(100);
  }
  if (!pageTarget) {
    proc.kill('SIGTERM');
    throw new Error('No CDP page target found');
  }

  const client = new ChromeCDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();
  await client.send('Page.enable');
  await client.send('Runtime.enable');
  return { proc, client };
}

async function waitForAppReady(cdp, label) {
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    try {
      const ok = await cdp.evalJs(`Boolean(window.PokemonApp && window.WikiDB && window.I18N && document.querySelector('#content-area .pokemon-card, #content-area .pokemon-table tbody tr'))`);
      if (ok) {
        await sleep(120);
        return;
      }
    } catch (_) {}
    await sleep(80);
  }
  throw new Error(`Timed out waiting for app ready: ${label}`);
}

const tests = [];
function addTest(id, name, fn) {
  tests.push({ id, name, fn });
}

// ---------------------------------------------------------------------------
// R1: Dynamic Theme Load on Refresh (Desktop & Mobile, No Dark Flash)
// ---------------------------------------------------------------------------
addTest('E2E-R1-01', 'Desktop & Mobile refresh preserves light/dark/inverted themes synchronously before DOMContentLoaded with zero #0a0f1d flash', async ({ cdp, baseUrl }) => {
  // Install MutationObserver + DOMContentLoaded snapshot probe on every document load
  const probeScript = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__THEME_PROBE__ = { firstMut: null, domContentLoaded: null };
      try {
        const obs = new MutationObserver(() => {
          const el = document.documentElement;
          if (!el) return;
          if (!window.__THEME_PROBE__.firstMut && el.hasAttribute('data-theme')) {
            window.__THEME_PROBE__.firstMut = {
              theme: el.getAttribute('data-theme'),
              inverted: el.getAttribute('data-theme-inverted'),
              colorScheme: el.style.colorScheme || '',
              bg: window.getComputedStyle(el).backgroundColor
            };
          }
        });
        obs.observe(document, { subtree: true, attributes: true, childList: true });
      } catch (e) {}
      document.addEventListener('DOMContentLoaded', () => {
        const el = document.documentElement;
        window.__THEME_PROBE__.domContentLoaded = {
          theme: el.getAttribute('data-theme'),
          inverted: el.getAttribute('data-theme-inverted'),
          colorScheme: el.style.colorScheme || '',
          bg: window.getComputedStyle(el).backgroundColor
        };
      });
    `
  });

  try {
    const scenarios = [
      { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false, theme: 'dawn', inv: 'false', expBg: 'rgb(248, 250, 252)', expScheme: 'light' },
      { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false, theme: 'emerald', inv: 'false', expBg: 'rgb(241, 245, 249)', expScheme: 'light' },
      { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false, theme: 'midnight', inv: 'true', expBg: 'rgb(240, 249, 255)', expScheme: 'light' },
      { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false, theme: 'dawn', inv: 'true', expBg: 'rgb(28, 25, 23)', expScheme: 'dark' },
      { path: '/app/index.html?view=mobile', w: 390, h: 844, mobile: true, theme: 'dawn', inv: 'false', expBg: 'rgb(248, 250, 252)', expScheme: 'light' },
      { path: '/app/index.html?view=mobile', w: 390, h: 844, mobile: true, theme: 'onyx', inv: 'true', expBg: 'rgb(250, 250, 250)', expScheme: 'light' },
      { path: '/app/index.html?view=mobile', w: 390, h: 844, mobile: true, theme: 'emerald', inv: 'true', expBg: 'rgb(15, 23, 42)', expScheme: 'dark' }
    ];

    for (const s of scenarios) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: s.w, height: s.h, deviceScaleFactor: s.mobile ? 2 : 1, mobile: s.mobile });
      await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
      await sleep(50);
      await cdp.evalJs(`(() => {
        localStorage.clear();
        localStorage.setItem('user_theme', ${JSON.stringify(s.theme)});
        localStorage.setItem('user_theme_inverted', ${JSON.stringify(s.inv)});
        localStorage.setItem('pksleep_view_pref', ${JSON.stringify(s.mobile ? 'mobile' : 'desktop')});
      })()`);

      await cdp.send('Page.navigate', { url: `${baseUrl}${s.path}` });
      await waitForAppReady(cdp, `${s.path} ${s.theme} inv=${s.inv}`);

      // Also test actual Page.reload
      await cdp.send('Page.reload', { ignoreCache: true });
      await waitForAppReady(cdp, `${s.path} reload ${s.theme} inv=${s.inv}`);

      const res = await cdp.evalJs(`(() => {
        const el = document.documentElement;
        return {
          probe: window.__THEME_PROBE__,
          finalTheme: el.getAttribute('data-theme'),
          finalInv: el.getAttribute('data-theme-inverted'),
          finalScheme: el.style.colorScheme,
          finalComputedScheme: window.getComputedStyle(el).colorScheme,
          finalBg: window.getComputedStyle(el).backgroundColor,
          bodyBg: window.getComputedStyle(document.body).backgroundColor
        };
      })()`);

      assert.strictEqual(res.finalTheme, s.theme, `${s.path}: final data-theme mismatch`);
      assert.strictEqual(res.finalInv, s.inv === 'true' ? 'true' : null, `${s.path}: final inverted mismatch`);
      assert.strictEqual(res.finalScheme, s.expScheme, `${s.path}: inline colorScheme mismatch`);
      assert.strictEqual(res.finalComputedScheme, s.expScheme, `${s.path}: computed colorScheme mismatch`);
      assert.strictEqual(res.finalBg, s.expBg, `${s.path}: html background mismatch`);
      assert.strictEqual(res.bodyBg, s.expBg, `${s.path}: body background mismatch`);
      assert(res.probe.domContentLoaded, `${s.path}: DOMContentLoaded probe missing`);
      assert.strictEqual(res.probe.domContentLoaded.theme, s.theme, `${s.path}: DOMContentLoaded flashed wrong theme`);
      assert.strictEqual(res.probe.domContentLoaded.bg, s.expBg, `${s.path}: DOMContentLoaded flashed wrong background (${res.probe.domContentLoaded.bg})`);
      assert(res.probe.firstMut, `${s.path}: firstMut probe missing`);
      assert.strictEqual(res.probe.firstMut.theme, s.theme, `${s.path}: first theme attribute was not saved theme`);
    }
  } finally {
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: probeScript.identifier });
  }
});

addTest('E2E-R1-02', 'Throwing window.localStorage getter (SecurityError) does not crash boot or prevent card rendering on index.html and app/index.html', async ({ cdp, baseUrl }) => {
  const throwScript = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      window.__E2E_UNCAUGHT_ERRORS__ = [];
      window.addEventListener('error', (ev) => {
        window.__E2E_UNCAUGHT_ERRORS__.push((ev && ev.message) || String(ev));
      });
      window.addEventListener('unhandledrejection', (ev) => {
        window.__E2E_UNCAUGHT_ERRORS__.push(String(ev && ev.reason));
      });
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get() {
          throw new DOMException('Blocked localStorage', 'SecurityError');
        }
      });
    `
  });

  try {
    for (const cfg of [
      { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false },
      { path: '/app/index.html?view=mobile', w: 390, h: 844, mobile: true }
    ]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: cfg.w, height: cfg.h, deviceScaleFactor: cfg.mobile ? 2 : 1, mobile: cfg.mobile });
      await cdp.send('Page.navigate', { url: `${baseUrl}${cfg.path}` });
      await waitForAppReady(cdp, `SecurityError ${cfg.path}`);

      const res = await cdp.evalJs(`(() => ({
        theme: document.documentElement.getAttribute('data-theme'),
        bg: window.getComputedStyle(document.documentElement).backgroundColor,
        appErr: window.__APP_ERROR_OCCURRED__ === true,
        appLogs: window.__APP_LOG_BUFFER__ || [],
        uncaught: window.__E2E_UNCAUGHT_ERRORS__ || [],
        cardCount: document.querySelectorAll('#content-area .pokemon-card, #content-area .pokemon-table tbody tr').length
      }))()`);

      assert.strictEqual(res.theme, 'midnight', `${cfg.path}: fallback theme must be midnight`);
      assert.strictEqual(res.bg, 'rgb(10, 15, 29)', `${cfg.path}: fallback bg mismatch`);
      assert.strictEqual(res.appErr, false, `${cfg.path}: window.__APP_ERROR_OCCURRED__ must not be true (logs: ${JSON.stringify(res.appLogs)})`);
      assert.strictEqual(res.uncaught.length, 0, `${cfg.path}: uncaught errors under SecurityError: ${JSON.stringify(res.uncaught)}`);
      assert(res.cardCount > 0, `${cfg.path}: expected cardCount > 0 under SecurityError, got ${res.cardCount}`);
    }
  } finally {
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: throwScript.identifier });
  }
});

// ---------------------------------------------------------------------------
// R2 & R3: Ingredient Ladder Node Bounds, Header Click & Top-3 + Ing Select Badges
// ---------------------------------------------------------------------------
addTest('E2E-R2-R3-01', 'Desktop & Mobile H5 Ingredient Ladder keeps all nodes clear of track headers, Mushroom click opens modal, and shows Top-3 + Ing Select badges only', async ({ cdp, baseUrl }) => {
  for (const cfg of [
    { path: '/index.html?view=desktop', w: 1280, h: 800, mobile: false },
    { path: '/app/index.html?view=mobile', w: 390, h: 844, mobile: true }
  ]) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: cfg.w, height: cfg.h, deviceScaleFactor: cfg.mobile ? 2 : 1, mobile: cfg.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => {
      localStorage.clear();
      localStorage.setItem('user_lang', 'zh-TW');
      localStorage.setItem('pksleep_view_pref', ${JSON.stringify(cfg.mobile ? 'mobile' : 'desktop')});
    })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${cfg.path}` });
    await waitForAppReady(cdp, cfg.path);

    const audit = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      if (window.switchMainTab) window.switchMainTab('wiki');
      await sleepMs(100);
      if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('ingredients');
      await sleepMs(150);

      const rows = Array.from(document.querySelectorAll('#wiki-subpanel-ingredients .ladder-track-row, #wiki-subpanel-ingredients .ladder-tail-track-row'));
      const overlaps = [];
      const badgeMismatches = [];
      let mushroomHeaderRect = null;
      let tailHeaderRect = null;
      let ingSelectSampleStyle = null;
      let hiddenTooltipCount = 0;

      for (const row of rows) {
        const ingId = row.getAttribute('data-ladder-ing');
        const header = row.querySelector('.ladder-track-header');
        const icon = row.querySelector('.ladder-ing-icon');
        if (!header || !icon) continue;
        const hRect = header.getBoundingClientRect();
        const iRect = icon.getBoundingClientRect();
        if (ingId === 'mushroom') mushroomHeaderRect = { x: iRect.left + iRect.width / 2, y: iRect.top + iRect.height / 2 };
        if (ingId === 'tail') tailHeaderRect = { x: iRect.left + iRect.width / 2, y: iRect.top + iRect.height / 2 };

        const nodes = Array.from(row.querySelectorAll('.ladder-node'));
        const counts = nodes.map(n => {
          const valEl = n.querySelector('.ladder-node-tooltip .text-success');
          const m = valEl ? valEl.textContent.match(/(\\d+)/) : null;
          return m ? parseInt(m[1], 10) : 0;
        });
        const distinct = [...new Set(counts)].sort((a, b) => b - a);
        const top3Threshold = distinct.length > 0 ? distinct[Math.min(2, distinct.length - 1)] : Infinity;

        nodes.forEach((n, idx) => {
          const avatar = n.querySelector('.node-avatar-wrapper') || n;
          const nRect = avatar.getBoundingClientRect();
          if (nRect.left < hRect.right - 0.5) {
            overlaps.push({ ingId, pkm: n.getAttribute('data-pkm'), recipe: n.getAttribute('data-recipe'), nLeft: nRect.left, hRight: hRect.right });
          }

          const pkm = n.getAttribute('data-pkm');
          const count = counts[idx];
          const isTop3 = count > 0 && count >= top3Threshold;
          const hasIngSkill = window.WikiDB.hasPokemonIngSelectSkill(pkm);
          const badge = n.querySelector('.node-count-badge');
          const expected = isTop3 || hasIngSkill;
          if (Boolean(badge) !== expected) {
            badgeMismatches.push({ ingId, pkm, count, top3Threshold, hasIngSkill, hasBadge: Boolean(badge) });
          }
          if (!badge && count > 0) hiddenTooltipCount++;
          if (badge && hasIngSkill && !ingSelectSampleStyle) {
            const cs = window.getComputedStyle(badge);
            ingSelectSampleStyle = {
              pkm,
              fontFamily: cs.fontFamily,
              fontStyle: cs.fontStyle,
              hasClass: badge.classList.contains('badge-ing-select')
            };
          }
        });
      }

      return {
        rowCount: rows.length,
        overlaps,
        badgeMismatches,
        mushroomHeaderRect,
        tailHeaderRect,
        ingSelectSampleStyle,
        hiddenTooltipCount
      };
    })()`);

    assert.strictEqual(audit.rowCount, 20, `${cfg.path}: expected 20 tracks`);
    assert.strictEqual(audit.overlaps.length, 0, `${cfg.path}: node overlaps header: ${JSON.stringify(audit.overlaps)}`);
    assert.strictEqual(audit.badgeMismatches.length, 0, `${cfg.path}: badge mismatches: ${JSON.stringify(audit.badgeMismatches)}`);
    assert(audit.hiddenTooltipCount > 40, `${cfg.path}: expected >40 hidden badges with intact tooltips`);
    assert(audit.ingSelectSampleStyle && audit.ingSelectSampleStyle.hasClass && audit.ingSelectSampleStyle.fontStyle === 'italic', `${cfg.path}: ing-select badge special italic style missing: ${JSON.stringify(audit.ingSelectSampleStyle)}`);
    assert(audit.mushroomHeaderRect && audit.tailHeaderRect, `${cfg.path}: missing mushroom/tail header coordinates`);

    if (cfg.mobile) {
      for (const target of [
        { ingId: 'mushroom', expectTitle: '蘑菇' },
        { ingId: 'tail', expectTitle: '美味尾巴' },
        { ingId: 'oil', expectTitle: '純粹油' }
      ]) {
        const hitInfo = await cdp.evalJs(`(() => {
          const icon = document.querySelector('#wiki-subpanel-ingredients [data-ladder-ing="${target.ingId}"] .ladder-ing-icon');
          if (!icon) return null;
          icon.scrollIntoView({ block: 'center', inline: 'nearest' });
          const r = icon.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const y = r.top + r.height / 2;
          const hit = document.elementFromPoint(x, y);
          return { x, y, hitInsideHeader: Boolean(hit && hit.closest('.ladder-track-header')) };
        })()`);
        assert(hitInfo && hitInfo.hitInsideHeader, `${cfg.path}: elementFromPoint on ${target.ingId} failed: ${JSON.stringify(hitInfo)}`);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hitInfo.x, y: hitInfo.y });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hitInfo.x, y: hitInfo.y, button: 'left', clickCount: 1 });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hitInfo.x, y: hitInfo.y, button: 'left', clickCount: 1 });
        await sleep(120);
        const modalCheck = await cdp.evalJs(`(() => {
          const m = document.getElementById('wiki-ingredient-ranking-modal');
          const title = m ? m.querySelector('.ing-rank-header-title') : null;
          const rows = m ? m.querySelectorAll('.ing-rank-card').length : 0;
          const open = !!(m && window.getComputedStyle(m).display !== 'none');
          if (window.WikiDB && window.WikiDB.closeIngredientRankingModal) window.WikiDB.closeIngredientRankingModal();
          return { open, title: title ? title.textContent : '', rows };
        })()`);
        await sleep(120);
        assert(modalCheck.open, `${cfg.path}: real click on ${target.ingId} icon failed to open ranking modal`);
        assert(modalCheck.title.includes(target.expectTitle), `${cfg.path}: modal title mismatch for ${target.ingId}: ${modalCheck.title}`);
        assert(modalCheck.rows >= 5, `${cfg.path}: ranking modal missing rows for ${target.ingId}`);
      }
    } else {
      // Desktop 1280x800 OPEN sidebar: all 20 track headers clear sidebar & pass real CDP clicks
      const openIngCheck = await cdp.evalJs(`(() => {
        const sb = document.getElementById('ladder-filter-sidebar');
        if (!sb) return { error: 'Missing #ladder-filter-sidebar' };
        const sbRect = sb.getBoundingClientRect();
        const headers = Array.from(document.querySelectorAll('#wiki-subpanel-ingredients .ladder-track-header'));
        const headerFailures = [];
        for (const h of headers) {
          h.scrollIntoView({ block: 'center', inline: 'nearest' });
          const r = h.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const hit = document.elementFromPoint(cx, cy);
          if (r.left < sbRect.right - 0.5 || !hit || !hit.closest('.ladder-track-header')) {
            headerFailures.push({ left: r.left, sbRight: sbRect.right, hitClass: hit ? hit.className : null });
          }
        }
        return {
          collapsed: sb.classList.contains('collapsed'),
          sbRight: sbRect.right,
          headerCount: headers.length,
          headerFailures,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth
        };
      })()`);
      assert(!openIngCheck.error, openIngCheck.error);
      assert.strictEqual(openIngCheck.collapsed, false, 'Desktop 1280x800 #ladder-filter-sidebar should be open by default');
      assert(openIngCheck.sbRight >= 239, `Desktop open sidebar right expected >= 239, got ${openIngCheck.sbRight}`);
      assert.strictEqual(openIngCheck.headerCount, 20, `Expected 20 ingredient headers, got ${openIngCheck.headerCount}`);
      assert.strictEqual(openIngCheck.headerFailures.length, 0, `Desktop 1280x800 OPEN sidebar covered headers: ${JSON.stringify(openIngCheck.headerFailures)}`);
      assert.strictEqual(openIngCheck.overflowX, false, `Desktop 1280x800 horizontal overflow: scrollWidth=${openIngCheck.scrollWidth} innerWidth=${openIngCheck.innerWidth}`);

      for (const target of [
        { ingId: 'mushroom', expectTitle: '蘑菇' },
        { ingId: 'tail', expectTitle: '美味尾巴' },
        { ingId: 'oil', expectTitle: '純粹油' }
      ]) {
        const hitInfo = await cdp.evalJs(`(() => {
          const icon = document.querySelector('#wiki-subpanel-ingredients [data-ladder-ing="${target.ingId}"] .ladder-ing-icon');
          if (!icon) return null;
          icon.scrollIntoView({ block: 'center', inline: 'nearest' });
          const r = icon.getBoundingClientRect();
          const x = r.left + r.width / 2;
          const y = r.top + r.height / 2;
          const hit = document.elementFromPoint(x, y);
          return { x, y, hitInsideHeader: Boolean(hit && hit.closest('.ladder-track-header')) };
        })()`);
        assert(hitInfo && hitInfo.hitInsideHeader, `Desktop 1280x800 OPEN sidebar: elementFromPoint on ${target.ingId} failed: ${JSON.stringify(hitInfo)}`);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hitInfo.x, y: hitInfo.y });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hitInfo.x, y: hitInfo.y, button: 'left', clickCount: 1 });
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hitInfo.x, y: hitInfo.y, button: 'left', clickCount: 1 });
        await sleep(120);
        const modalCheck = await cdp.evalJs(`(() => {
          const m = document.getElementById('wiki-ingredient-ranking-modal');
          const title = m ? m.querySelector('.ing-rank-header-title') : null;
          const rows = m ? m.querySelectorAll('.ing-rank-card').length : 0;
          const open = !!(m && window.getComputedStyle(m).display !== 'none');
          if (window.WikiDB && window.WikiDB.closeIngredientRankingModal) window.WikiDB.closeIngredientRankingModal();
          return { open, title: title ? title.textContent : '', rows };
        })()`);
        await sleep(120);
        assert(modalCheck.open, `Desktop 1280x800 OPEN sidebar: click on ${target.ingId} failed to open ranking modal`);
        assert(modalCheck.title.includes(target.expectTitle), `Desktop 1280x800 OPEN sidebar: modal title mismatch for ${target.ingId}: ${modalCheck.title}`);
        assert(modalCheck.rows >= 5, `Desktop 1280x800 OPEN sidebar: ranking modal missing rows for ${target.ingId}`);
      }

      // Desktop 1440x900 OPEN sidebar verification
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      await sleep(150);
      const hit1440 = await cdp.evalJs(`(() => {
        const sb = document.getElementById('ladder-filter-sidebar');
        const sbRect = sb.getBoundingClientRect();
        const header = document.querySelector('#wiki-subpanel-ingredients [data-ladder-ing="mushroom"] .ladder-track-header');
        const icon = header ? header.querySelector('.ladder-ing-icon') : null;
        if (!header || !icon) return null;
        icon.scrollIntoView({ block: 'center', inline: 'nearest' });
        const hRect = header.getBoundingClientRect();
        const iRect = icon.getBoundingClientRect();
        const x = iRect.left + iRect.width / 2;
        const y = iRect.top + iRect.height / 2;
        const hit = document.elementFromPoint(x, y);
        return {
          x, y,
          hLeft: hRect.left,
          sbRight: sbRect.right,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
          hitInsideHeader: Boolean(hit && hit.closest('.ladder-track-header'))
        };
      })()`);
      assert(hit1440 && hit1440.hLeft >= hit1440.sbRight - 0.5 && hit1440.hitInsideHeader && !hit1440.overflowX, `Desktop 1440x900 OPEN sidebar check failed: ${JSON.stringify(hit1440)}`);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: hit1440.x, y: hit1440.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: hit1440.x, y: hit1440.y, button: 'left', clickCount: 1 });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: hit1440.x, y: hit1440.y, button: 'left', clickCount: 1 });
      await sleep(120);
      const modal1440 = await cdp.evalJs(`(() => {
        const m = document.getElementById('wiki-ingredient-ranking-modal');
        const open = !!(m && window.getComputedStyle(m).display !== 'none');
        if (window.WikiDB && window.WikiDB.closeIngredientRankingModal) window.WikiDB.closeIngredientRankingModal();
        return open;
      })()`);
      await sleep(120);
      assert(modal1440, 'Desktop 1440x900 OPEN sidebar: Mushroom click failed to open modal');
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
      await sleep(150);

      // Desktop 1280x800 Skill Ladder OPEN & COLLAPSED sidebar verification
      const skillOpenCheck = await cdp.evalJs(`(async () => {
        const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
        if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('skills_ladder');
        await sleepMs(150);
        const sb = document.getElementById('skill-ladder-filter-sidebar');
        if (!sb) return { error: 'Missing #skill-ladder-filter-sidebar' };
        const sbRect = sb.getBoundingClientRect();
        const headers = Array.from(document.querySelectorAll('#wiki-subpanel-skills_ladder .skill-ladder-track-header'));
        const failures = [];
        let firstClick = null;
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          h.scrollIntoView({ block: 'center', inline: 'nearest' });
          const r = h.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const hit = document.elementFromPoint(cx, cy);
          if (i === 0) firstClick = { x: cx, y: cy };
          if (r.left < sbRect.right - 0.5 || !hit || !hit.closest('.skill-ladder-track-header')) {
            failures.push({ idx: i, left: r.left, sbRight: sbRect.right, hitClass: hit ? hit.className : null });
          }
        }
        return {
          collapsed: sb.classList.contains('collapsed'),
          sbRight: sbRect.right,
          headerCount: headers.length,
          failures,
          firstClick,
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
        };
      })()`);
      assert(!skillOpenCheck.error, skillOpenCheck.error);
      assert.strictEqual(skillOpenCheck.collapsed, false, 'Desktop #skill-ladder-filter-sidebar should be open by default');
      assert(skillOpenCheck.headerCount >= 5, `Expected >=5 skill headers, got ${skillOpenCheck.headerCount}`);
      assert.strictEqual(skillOpenCheck.failures.length, 0, `Desktop OPEN Skill sidebar covered headers: ${JSON.stringify(skillOpenCheck.failures)}`);
      assert.strictEqual(skillOpenCheck.overflowX, false, 'Desktop OPEN Skill Ladder horizontal overflow');

      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: skillOpenCheck.firstClick.x, y: skillOpenCheck.firstClick.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: skillOpenCheck.firstClick.x, y: skillOpenCheck.firstClick.y, button: 'left', clickCount: 1 });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: skillOpenCheck.firstClick.x, y: skillOpenCheck.firstClick.y, button: 'left', clickCount: 1 });
      await sleep(120);
      const skillModalOpen = await cdp.evalJs(`(() => {
        const m = document.getElementById('wiki-skill-ranking-modal');
        const rows = m ? m.querySelectorAll('.ing-rank-card').length : 0;
        const open = !!(m && window.getComputedStyle(m).display !== 'none');
        if (window.WikiDB && window.WikiDB.closeSkillRankingModal) window.WikiDB.closeSkillRankingModal();
        return { open, rows };
      })()`);
      await sleep(150);
      assert(skillModalOpen.open && skillModalOpen.rows >= 5, `Desktop OPEN Skill Ladder click failed: ${JSON.stringify(skillModalOpen)}`);

      const skillCollapsedTarget = await cdp.evalJs(`(async () => {
        const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
        document.getElementById('skill-ladder-sidebar-close-btn')?.click();
        await sleepMs(300);
        const sb = document.getElementById('skill-ladder-filter-sidebar');
        const h = document.querySelector('#wiki-subpanel-skills_ladder .skill-ladder-track-header');
        if (!sb || !h) return null;
        h.scrollIntoView({ block: 'center', inline: 'nearest' });
        const r = h.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return {
          collapsed: sb.classList.contains('collapsed'),
          x, y,
          hitInsideHeader: Boolean(hit && hit.closest('.skill-ladder-track-header')),
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
        };
      })()`);
      assert(skillCollapsedTarget && skillCollapsedTarget.collapsed && skillCollapsedTarget.hitInsideHeader && !skillCollapsedTarget.overflowX,
        `Desktop COLLAPSED Skill Ladder check failed: ${JSON.stringify(skillCollapsedTarget)}`);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: skillCollapsedTarget.x, y: skillCollapsedTarget.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: skillCollapsedTarget.x, y: skillCollapsedTarget.y, button: 'left', clickCount: 1 });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: skillCollapsedTarget.x, y: skillCollapsedTarget.y, button: 'left', clickCount: 1 });
      await sleep(120);
      const skillModalCollapsed = await cdp.evalJs(`(() => {
        const m = document.getElementById('wiki-skill-ranking-modal');
        const open = !!(m && window.getComputedStyle(m).display !== 'none');
        if (window.WikiDB && window.WikiDB.closeSkillRankingModal) window.WikiDB.closeSkillRankingModal();
        return open;
      })()`);
      await sleep(150);
      assert(skillModalCollapsed, 'Desktop COLLAPSED Skill Ladder click failed to open modal');

      // Desktop 1280x800 Ingredient Ladder COLLAPSED sidebar verification
      const ingCollapsedTarget = await cdp.evalJs(`(async () => {
        const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
        if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('ingredients');
        await sleepMs(150);
        document.getElementById('ladder-sidebar-close-btn')?.click();
        await sleepMs(300);
        const sb = document.getElementById('ladder-filter-sidebar');
        const icon = document.querySelector('#wiki-subpanel-ingredients [data-ladder-ing="mushroom"] .ladder-ing-icon');
        if (!sb || !icon) return null;
        icon.scrollIntoView({ block: 'center', inline: 'nearest' });
        const r = icon.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const hit = document.elementFromPoint(x, y);
        return {
          collapsed: sb.classList.contains('collapsed'),
          x, y,
          hitInsideHeader: Boolean(hit && hit.closest('.ladder-track-header')),
          overflowX: document.documentElement.scrollWidth > window.innerWidth + 1
        };
      })()`);
      assert(ingCollapsedTarget && ingCollapsedTarget.collapsed && ingCollapsedTarget.hitInsideHeader && !ingCollapsedTarget.overflowX,
        `Desktop COLLAPSED Ingredient Ladder check failed: ${JSON.stringify(ingCollapsedTarget)}`);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: ingCollapsedTarget.x, y: ingCollapsedTarget.y });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: ingCollapsedTarget.x, y: ingCollapsedTarget.y, button: 'left', clickCount: 1 });
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: ingCollapsedTarget.x, y: ingCollapsedTarget.y, button: 'left', clickCount: 1 });
      await sleep(120);
      const ingModalCollapsed = await cdp.evalJs(`(() => {
        const m = document.getElementById('wiki-ingredient-ranking-modal');
        const open = !!(m && window.getComputedStyle(m).display !== 'none');
        if (window.WikiDB && window.WikiDB.closeIngredientRankingModal) window.WikiDB.closeIngredientRankingModal();
        return open;
      })()`);
      assert(ingModalCollapsed, 'Desktop COLLAPSED Ingredient Ladder Mushroom click failed');
    }
  }
});

addTest('E2E-R3-02', 'All 8 theme variants achieve >= 4.5:1 WCAG AA contrast on tooltips, dish badges, skill ladder, ranking modal, and H5/Desktop parity', async ({ cdp, baseUrl }) => {
  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', '${vp.pref}'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
    await waitForAppReady(cdp, `R3 8-Theme Contrast (${vp.label})`);

    const report = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      if (window.switchMainTab) window.switchMainTab('wiki');
      await sleepMs(100);
      if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('ingredients');
      await sleepMs(120);
      if (window.WikiDB.toggleLadderFinalOnly) window.WikiDB.toggleLadderFinalOnly(false);
      if (window.WikiDB.toggleLadderTop15) window.WikiDB.toggleLadderTop15(false);
      if (window.WikiDB.toggleLadderSkillDrawExpected) window.WikiDB.toggleLadderSkillDrawExpected(true);
      await sleepMs(150);

      function parseRgba(str) {
        const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
      }
      function blendOver(fg, bg) {
        const a = fg.a;
        return {
          r: fg.r * a + bg.r * (1 - a),
          g: fg.g * a + bg.g * (1 - a),
          b: fg.b * a + bg.b * (1 - a),
          a: 1
        };
      }
      function getEffectiveBg(el, fallbackBg) {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
          if (bg && bg.a > 0) chain.push(bg);
          cur = cur.parentElement;
        }
        let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) {
          acc = blendOver(chain[i], acc);
        }
        return acc;
      }
      function relLum(rgb) {
        const lin = (c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      }
      function contrast(fg, bg) {
        const f = fg.a < 1 ? blendOver(fg, bg) : fg;
        const l1 = relLum(f), l2 = relLum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }

      const themes = [
        ['midnight', false, false],
        ['onyx', false, false],
        ['dawn', false, true],
        ['emerald', false, true],
        ['midnight', true, true],
        ['onyx', true, true],
        ['dawn', true, false],
        ['emerald', true, false]
      ];

      const results = [];
      for (const [theme, inv, isLight] of themes) {
        window.PokemonApp.applyTheme(theme, inv);
        await sleepMs(40);
        const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);

        if (window.WikiDB && window.WikiDB.switchWikiSubTab) {
          window.WikiDB.switchWikiSubTab('ingredients');
          await sleepMs(80);
        }

        const badge = document.querySelector('.ladder-node:not(.node-top1) .node-count-badge.badge-ing-select');
        const top1Badge = document.querySelector('.ladder-node.node-top1 .node-count-badge.badge-ing-select') ||
                          document.querySelector('.ladder-node.node-top1 .node-count-badge.badge-skill-draw');
        const skillNode = Array.from(document.querySelectorAll('.ladder-node')).find(n => n.querySelector('.tooltip-yield-breakdown'));
        const tip = skillNode.querySelector('.ladder-node-tooltip');
        const tipTitle = tip.querySelector('.tooltip-title');
        const tipDetail = tip.querySelector('.tooltip-detail');
        const tipSuccess = tipDetail.querySelector('.text-success');
        const tipNote = tip.querySelector('.tooltip-note');
        const breakdown = tip.querySelector('.tooltip-yield-breakdown');
        const bdLabel = breakdown.querySelector('.breakdown-label');
        const bdVal = breakdown.querySelector('.breakdown-val');
        const bdSkill = breakdown.querySelector('.breakdown-skill .breakdown-val');

        const dishFull = document.querySelector('.ladder-node-tooltip .tooltip-dish-badge.dish-badge-full');
        const dishHigh = document.querySelector('.ladder-node-tooltip .tooltip-dish-badge.dish-badge-high');
        const dishAssist = document.querySelector('.ladder-node-tooltip .tooltip-dish-badge.dish-badge-assist');
        const helpBtn = document.querySelector('.ladder-help-icon-btn');
        const skillBubble = document.querySelector('.ladder-skill-tooltip-bubble');
        const skillBubbleLine = skillBubble ? skillBubble.querySelector('.ladder-skill-tooltip-line') : null;
        const skillBubbleContrast = skillBubble
          ? contrast(
              parseRgba(window.getComputedStyle(skillBubbleLine || skillBubble).color),
              parseRgba(window.getComputedStyle(skillBubble).backgroundColor)
            )
          : null;

        const tipBg = parseRgba(window.getComputedStyle(tip).backgroundColor);
        const bdBg = parseRgba(window.getComputedStyle(breakdown).backgroundColor);

        if (window.WikiDB && window.WikiDB.openIngredientRankingModal) {
          window.WikiDB.openIngredientRankingModal('oil');
          await sleepMs(40);
        }
        const splitSkill = document.querySelector('#wiki-ingredient-ranking-modal .ing-rank-split-line .split-skill');
        const yieldNum = document.querySelector('#wiki-ingredient-ranking-modal .ing-rank-yield-num');
        const r1Num = document.querySelector('#wiki-ingredient-ranking-modal .ing-rank-num.rank-1');
        const r2Num = document.querySelector('#wiki-ingredient-ranking-modal .ing-rank-num.rank-2');
        const r3Num = document.querySelector('#wiki-ingredient-ranking-modal .ing-rank-num.rank-3');
        const splitSkillRatio = splitSkill
          ? contrast(parseRgba(window.getComputedStyle(splitSkill).color), getEffectiveBg(splitSkill, rootBg))
          : null;
        const yieldNumRatio = yieldNum
          ? contrast(parseRgba(window.getComputedStyle(yieldNum).color), getEffectiveBg(yieldNum, rootBg))
          : null;
        const rankNumRatios = [r1Num, r2Num, r3Num].filter(Boolean).map(el =>
          contrast(parseRgba(window.getComputedStyle(el).color), getEffectiveBg(el, rootBg))
        );
        if (window.WikiDB && window.WikiDB.closeIngredientRankingModal) {
          window.WikiDB.closeIngredientRankingModal();
          await sleepMs(20);
        }

        // Skill Ladder tooltip & Single Frame Rule
        if (window.WikiDB && window.WikiDB.switchWikiSubTab) {
          window.WikiDB.switchWikiSubTab('skills_ladder');
          await sleepMs(80);
        }
        const skNode = Array.from(document.querySelectorAll('.wiki-skill-coordinate-ladder .ladder-node')).find(n => n.querySelector('.breakdown-val.text-accent'));
        let skSuccessRatio = null;
        let skAccentRatio = null;
        let skBdBgStr = null;
        let skBdBorders = null;
        if (skNode) {
          const skTip = skNode.querySelector('.ladder-node-tooltip');
          const skTipBg = parseRgba(window.getComputedStyle(skTip).backgroundColor);
          const skSucc = skTip.querySelector('.tooltip-detail .text-success');
          const skAcc = skTip.querySelector('.breakdown-val.text-accent');
          const skBd = skTip.querySelector('.tooltip-yield-breakdown');
          const skBdCs = window.getComputedStyle(skBd);
          skBdBgStr = skBdCs.backgroundColor;
          skBdBorders = [skBdCs.borderTopWidth, skBdCs.borderRightWidth, skBdCs.borderBottomWidth, skBdCs.borderLeftWidth];
          if (skSucc) skSuccessRatio = contrast(parseRgba(window.getComputedStyle(skSucc).color), skTipBg);
          if (skAcc) skAccentRatio = contrast(parseRgba(window.getComputedStyle(skAcc).color), skTipBg);
        }

        results.push({
          theme, inv, isLight,
          tipBgStr: window.getComputedStyle(tip).backgroundColor,
          bdBgStr: window.getComputedStyle(breakdown).backgroundColor,
          tipTitleContrast: contrast(parseRgba(window.getComputedStyle(tipTitle).color), tipBg),
          tipDetailContrast: contrast(parseRgba(window.getComputedStyle(tipDetail).color), tipBg),
          tipSuccessContrast: tipSuccess ? contrast(parseRgba(window.getComputedStyle(tipSuccess).color), tipBg) : null,
          tipNoteContrast: tipNote ? contrast(parseRgba(window.getComputedStyle(tipNote).color), tipBg) : null,
          bdLabelContrast: contrast(parseRgba(window.getComputedStyle(bdLabel).color), bdBg),
          bdValContrast: contrast(parseRgba(window.getComputedStyle(bdVal).color), bdBg),
          bdSkillContrast: contrast(parseRgba(window.getComputedStyle(bdSkill).color), bdBg),
          dishFullContrast: dishFull ? contrast(parseRgba(window.getComputedStyle(dishFull).color), getEffectiveBg(dishFull, tipBg)) : null,
          dishHighContrast: dishHigh ? contrast(parseRgba(window.getComputedStyle(dishHigh).color), getEffectiveBg(dishHigh, tipBg)) : null,
          dishAssistContrast: dishAssist ? contrast(parseRgba(window.getComputedStyle(dishAssist).color), getEffectiveBg(dishAssist, tipBg)) : null,
          helpBtnContrast: helpBtn ? contrast(parseRgba(window.getComputedStyle(helpBtn).color), getEffectiveBg(helpBtn, rootBg)) : null,
          skillBubbleContrast,
          badgeContrast: contrast(parseRgba(window.getComputedStyle(badge).color), getEffectiveBg(badge, rootBg)),
          top1BadgeContrast: top1Badge ? contrast(parseRgba(window.getComputedStyle(top1Badge).color), getEffectiveBg(top1Badge, rootBg)) : null,
          splitSkillContrast: splitSkillRatio,
          yieldNumContrast: yieldNumRatio,
          rankNumMinContrast: rankNumRatios.length ? Math.min(...rankNumRatios) : null,
          skSuccessContrast: skSuccessRatio,
          skAccentContrast: skAccentRatio,
          skBdBgStr,
          skBdBorders
        });
      }
      return results;
    })()`);

    assert.strictEqual(report.length, 8, `${vp.label}: Must test all 8 theme variants`);
    for (const r of report) {
      const label = `${vp.label} ${r.theme}:inv=${r.inv}`;
      assert(r.tipTitleContrast >= 4.5, `${label} tooltip title contrast ${r.tipTitleContrast.toFixed(2)} < 4.5`);
      assert(r.tipDetailContrast >= 4.5, `${label} tooltip detail contrast ${r.tipDetailContrast.toFixed(2)} < 4.5`);
      assert(r.tipSuccessContrast !== null && r.tipSuccessContrast >= 4.5, `${label} tooltip .text-success contrast ${r.tipSuccessContrast} < 4.5`);
      assert(r.tipNoteContrast !== null && r.tipNoteContrast >= 4.5, `${label} tooltip .tooltip-note contrast ${r.tipNoteContrast} < 4.5`);
      assert(r.bdLabelContrast >= 4.5, `${label} breakdown label contrast ${r.bdLabelContrast.toFixed(2)} < 4.5`);
      assert(r.bdValContrast >= 4.5, `${label} breakdown val contrast ${r.bdValContrast.toFixed(2)} < 4.5`);
      assert(r.bdSkillContrast >= 4.5, `${label} breakdown skill contrast ${r.bdSkillContrast.toFixed(2)} < 4.5`);
      assert(r.dishFullContrast !== null && r.dishFullContrast >= 4.5, `${label} .dish-badge-full contrast ${r.dishFullContrast} < 4.5`);
      assert(r.dishHighContrast !== null && r.dishHighContrast >= 4.5, `${label} .dish-badge-high contrast ${r.dishHighContrast} < 4.5`);
      assert(r.dishAssistContrast !== null && r.dishAssistContrast >= 4.5, `${label} .dish-badge-assist contrast ${r.dishAssistContrast} < 4.5`);
      assert(r.helpBtnContrast !== null && r.helpBtnContrast >= 4.5, `${label} .ladder-help-icon-btn contrast ${r.helpBtnContrast} < 4.5`);
      assert(r.skillBubbleContrast !== null && r.skillBubbleContrast >= 4.5, `${label} .ladder-skill-tooltip-bubble contrast ${r.skillBubbleContrast} < 4.5`);
      assert(r.badgeContrast >= 4.5, `${label} badge-ing-select contrast ${r.badgeContrast.toFixed(2)} < 4.5`);
      if (r.top1BadgeContrast !== null) {
        assert(r.top1BadgeContrast >= 4.5, `${label} top1 badge contrast ${r.top1BadgeContrast.toFixed(2)} < 4.5`);
      }
      assert(r.splitSkillContrast !== null && r.splitSkillContrast >= 4.5, `${label} oil modal .split-skill contrast ${r.splitSkillContrast} < 4.5`);
      assert(r.yieldNumContrast !== null && r.yieldNumContrast >= 4.5, `${label} oil modal .ing-rank-yield-num contrast ${r.yieldNumContrast} < 4.5`);
      assert(r.rankNumMinContrast !== null && r.rankNumMinContrast >= 4.5, `${label} oil modal .ing-rank-num contrast ${r.rankNumMinContrast} < 4.5`);
      assert(r.skSuccessContrast !== null && r.skSuccessContrast >= 4.5, `${label} skill ladder .text-success contrast ${r.skSuccessContrast} < 4.5`);
      assert(r.skAccentContrast !== null && r.skAccentContrast >= 4.5, `${label} skill ladder .breakdown-val.text-accent contrast ${r.skAccentContrast} < 4.5`);
      assert.strictEqual(r.skBdBgStr, 'rgba(0, 0, 0, 0)', `${label} skill ladder breakdown bg must stay transparent (Single Frame Rule)`);
      assert.deepStrictEqual(r.skBdBorders, ['0px', '0px', '0px', '0px'], `${label} skill ladder breakdown border must stay 0px (Single Frame Rule)`);
      if (r.isLight) {
        assert.strictEqual(r.tipBgStr, 'rgb(255, 255, 255)', `${label} light tooltip bg must be white (got ${r.tipBgStr})`);
        assert.strictEqual(r.bdBgStr, 'rgb(241, 245, 249)', `${label} light breakdown bg must be #f1f5f9 (got ${r.bdBgStr})`);
      } else {
        assert.notStrictEqual(r.tipBgStr, 'rgb(255, 255, 255)', `${label} dark tooltip bg must not be white`);
        assert.notStrictEqual(r.bdBgStr, 'rgb(241, 245, 249)', `${label} dark breakdown bg must not be light`);
      }
    }
  }
});

addTest('E2E-R3-03', 'Recipe Highlight .ladder-passing-badge achieves >= 4.5:1 WCAG AA across 8 themes & stays inside tail canvas bounds', async ({ cdp, baseUrl }) => {
  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', '${vp.pref}'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
    await waitForAppReady(cdp, `R3 Passing Badge (${vp.label})`);

    const report = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      if (window.switchMainTab) window.switchMainTab('wiki');
      await sleepMs(80);
      if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('ingredients');
      await sleepMs(100);
      if (window.WikiDB && window.WikiDB.selectLadderHighlightRecipe) {
        window.WikiDB.selectLadderHighlightRecipe('美味尾巴蛋糕捲');
      }
      await sleepMs(100);

      function parseRgba(str) {
        const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
      }
      function blendOver(fg, bg) {
        const a = fg.a;
        return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
      }
      function getEffectiveBg(el, fallbackBg) {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
          if (bg && bg.a > 0) chain.push(bg);
          cur = cur.parentElement;
        }
        let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) acc = blendOver(chain[i], acc);
        return acc;
      }
      function relLum(rgb) {
        const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      }
      function contrast(fg, bg) {
        const f = fg.a < 1 ? blendOver(fg, bg) : fg;
        const l1 = relLum(f), l2 = relLum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }

      const themes = [
        ['midnight', false], ['onyx', false], ['dawn', false], ['emerald', false],
        ['midnight', true], ['onyx', true], ['dawn', true], ['emerald', true]
      ];
      const out = [];
      for (const [theme, inv] of themes) {
        window.PokemonApp.applyTheme(theme, inv);
        await sleepMs(30);
        const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);
        const eggBadge = document.querySelector('[data-ladder-ing="egg"] .ladder-passing-badge');
        const tailBadge = document.querySelector('[data-ladder-ing="tail"] .ladder-passing-badge');
        const tailCanvas = document.querySelector('.ladder-tail-canvas');
        const tailContainer = document.querySelector('[data-ladder-ing="tail"] .ladder-passing-line-container');
        const tailLine = document.querySelector('[data-ladder-ing="tail"] .ladder-passing-line');

        const tbRect = tailBadge ? tailBadge.getBoundingClientRect() : null;
        const tcRect = tailCanvas ? tailCanvas.getBoundingClientRect() : null;
        const tlRect = tailLine ? tailLine.getBoundingClientRect() : null;

        out.push({
          theme, inv,
          eggContrast: eggBadge ? contrast(parseRgba(window.getComputedStyle(eggBadge).color), getEffectiveBg(eggBadge, rootBg)) : null,
          tailContrast: tailBadge ? contrast(parseRgba(window.getComputedStyle(tailBadge).color), getEffectiveBg(tailBadge, rootBg)) : null,
          tailBadgeRight: tbRect ? tbRect.right : null,
          tailBadgeLeft: tbRect ? tbRect.left : null,
          tailCanvasRight: tcRect ? tcRect.right : null,
          tailCanvasLeft: tcRect ? tcRect.left : null,
          tailLineLeftStyle: tailContainer ? tailContainer.style.left : null,
          tailLineCenter: tlRect ? (tlRect.left + tlRect.width / 2) : null
        });
      }
      if (window.WikiDB && window.WikiDB.clearLadderHighlightRecipe) {
        window.WikiDB.clearLadderHighlightRecipe();
      }
      // Also verify multi-select across 8 distinct recipes (all 8 RECIPE_MARK_PALETTE colors)
      if (window.WikiDB && window.WikiDB.toggleLadderRecipeMultiSelect && window.WikiDB.selectLadderHighlightRecipe) {
        window.WikiDB.toggleLadderRecipeMultiSelect(true);
        const multiRecipes = [
          '煉獄玉米肉末咖哩',
          '睡飽飽番茄沙拉',
          '花瓣舞巧克力塔',
          '絕對睡眠奶油咖哩',
          '忍者沙拉',
          '馬卡龍',
          '彈跳咖哩烏龍麵',
          '美味尾巴蛋糕捲'
        ];
        for (const rn of multiRecipes) window.WikiDB.selectLadderHighlightRecipe(rn);
        await sleepMs(80);
        for (let ti = 0; ti < themes.length; ti++) {
          const [theme, inv] = themes[ti];
          window.PokemonApp.applyTheme(theme, inv);
          await sleepMs(25);
          const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);
          const allBadges = Array.from(document.querySelectorAll('.ladder-passing-badge'));
          const minMultiContrast = allBadges.length
            ? Math.min(...allBadges.map(b => contrast(parseRgba(window.getComputedStyle(b).color), getEffectiveBg(b, rootBg))))
            : 0;
          out[ti].multiBadgeCount = allBadges.length;
          out[ti].multiMinContrast = minMultiContrast;
        }
        window.WikiDB.toggleLadderRecipeMultiSelect(false);
        window.WikiDB.clearLadderHighlightRecipe();
      }
      return out;
    })()`);

    assert.strictEqual(report.length, 8);
    for (const r of report) {
      const label = `${vp.label} ${r.theme}:inv=${r.inv}`;
      assert(r.eggContrast !== null && r.eggContrast >= 4.5, `${label} egg passing badge contrast ${r.eggContrast} < 4.5`);
      assert(r.tailContrast !== null && r.tailContrast >= 4.5, `${label} tail passing badge contrast ${r.tailContrast} < 4.5`);
      assert(r.tailBadgeRight <= r.tailCanvasRight + 1, `${label} tail passing badge right (${r.tailBadgeRight}) > canvas right (${r.tailCanvasRight})`);
      assert(r.tailBadgeLeft >= r.tailCanvasLeft - 1, `${label} tail passing badge left (${r.tailBadgeLeft}) < canvas left (${r.tailCanvasLeft})`);
      assert.strictEqual(parseFloat(r.tailLineLeftStyle), 100, `${label} tail passing line container must remain at 100% (got ${r.tailLineLeftStyle})`);
      if (r.multiBadgeCount !== undefined) {
        assert(r.multiBadgeCount >= 8, `${label} multi-select must render >= 8 passing badges`);
        assert(r.multiMinContrast >= 4.5, `${label} 8-palette multi-select min contrast ${r.multiMinContrast} < 4.5`);
      }
    }
  }
});

// ---------------------------------------------------------------------------
// R4: Energy Quick Check H5 6-Col Grid Parity vs Web Desktop Single-Row
// ---------------------------------------------------------------------------
addTest('E2E-R4-01', 'H5 Energy Quick Check Ingredient Base Library renders 6-column grid matching Berry icon/text styles while Web Desktop stays single-row', async ({ cdp, baseUrl }) => {
  // 1. Mobile H5
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
  await sleep(50);
  await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', 'mobile'); })()`);
  await cdp.send('Page.navigate', { url: `${baseUrl}/app/index.html?view=mobile` });
  await waitForAppReady(cdp, 'R4 H5');

  const h5Metrics = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('values');
    await sleepMs(120);

    const berryGrid = document.getElementById('values-berry-grid');
    const ingGrid = document.querySelector('.values-ing-grid');
    const bCs = window.getComputedStyle(berryGrid);
    const iCs = window.getComputedStyle(ingGrid);
    const bIcon = window.getComputedStyle(berryGrid.querySelector('.value-compact-icon'));
    const iIcon = window.getComputedStyle(ingGrid.querySelector('.value-compact-icon'));
    const bText = window.getComputedStyle(berryGrid.querySelector('.value-compact-energy'));
    const iText = window.getComputedStyle(ingGrid.querySelector('.value-compact-energy'));
    const ingTops = [...new Set(Array.from(ingGrid.querySelectorAll('.value-compact-node')).map(n => Math.round(n.getBoundingClientRect().top)))];

    return {
      berryCols: bCs.gridTemplateColumns.split(' ').length,
      ingCols: iCs.gridTemplateColumns.split(' ').length,
      ingAutoFlow: iCs.gridAutoFlow,
      ingOverflow: ingGrid.scrollWidth > ingGrid.clientWidth + 1,
      ingRowCount: ingTops.length,
      bIconSize: [bIcon.width, bIcon.height],
      iIconSize: [iIcon.width, iIcon.height],
      bTextStyle: [bText.fontSize, bText.lineHeight, bText.fontWeight, bText.padding],
      iTextStyle: [iText.fontSize, iText.lineHeight, iText.fontWeight, iText.padding]
    };
  })()`);

  assert.strictEqual(h5Metrics.berryCols, 6, 'H5 Berry grid must be 6 columns');
  assert.strictEqual(h5Metrics.ingCols, 6, 'H5 Ingredient grid must be 6 columns');
  assert.strictEqual(h5Metrics.ingAutoFlow, 'row', 'H5 Ingredient gridAutoFlow must be row');
  assert.strictEqual(h5Metrics.ingOverflow, false, 'H5 Ingredient grid must not overflow horizontally');
  assert(h5Metrics.ingRowCount >= 3, `H5 Ingredient grid must wrap into multiple rows (got ${h5Metrics.ingRowCount})`);
  assert.deepStrictEqual(h5Metrics.iIconSize, h5Metrics.bIconSize, 'H5 Ingredient icon size must match Berry');
  assert.deepStrictEqual(h5Metrics.iTextStyle, h5Metrics.bTextStyle, 'H5 Ingredient text style must match Berry');

  // Verify H5 Energy Quick Check 8-theme contrast on berry-val, berry-val-fav, ing-val, and tail-highlight
  const h5ThemeContrast = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    function parseRgba(str) {
      const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
      if (!m) return null;
      return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
    }
    function blendOver(fg, bg) {
      const a = fg.a;
      return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
    }
    function getEffectiveBg(el, fallbackBg) {
      const chain = [];
      let cur = el;
      while (cur && cur.nodeType === 1) {
        const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
        if (bg && bg.a > 0) chain.push(bg);
        cur = cur.parentElement;
      }
      let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
      for (let i = chain.length - 1; i >= 0; i--) acc = blendOver(chain[i], acc);
      return acc;
    }
    function relLum(rgb) {
      const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
    }
    function contrast(fg, bg) {
      const f = fg.a < 1 ? blendOver(fg, bg) : fg;
      const l1 = relLum(f), l2 = relLum(bg);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }
    const themes = [
      ['midnight', false], ['onyx', false], ['dawn', false], ['emerald', false],
      ['midnight', true], ['onyx', true], ['dawn', true], ['emerald', true]
    ];
    const out = [];
    for (const [theme, inv] of themes) {
      window.PokemonApp.applyTheme(theme, inv);
      await sleepMs(30);
      const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);
      const bv = document.querySelector('#values-berry-grid .value-compact-energy.berry-val');
      const bvf = document.querySelector('#values-berry-grid .value-compact-energy.berry-val-fav');
      const iv = document.querySelector('.values-ing-grid .value-compact-node:not(.value-tail-highlight) .value-compact-energy.ing-val');
      const th = document.querySelector('.values-ing-grid .value-compact-node.value-tail-highlight .value-compact-energy');
      out.push({
        theme, inv,
        bvRatio: bv ? contrast(parseRgba(window.getComputedStyle(bv).color), getEffectiveBg(bv, rootBg)) : null,
        bvfRatio: bvf ? contrast(parseRgba(window.getComputedStyle(bvf).color), getEffectiveBg(bvf, rootBg)) : null,
        ivRatio: iv ? contrast(parseRgba(window.getComputedStyle(iv).color), getEffectiveBg(iv, rootBg)) : null,
        thRatio: th ? contrast(parseRgba(window.getComputedStyle(th).color), getEffectiveBg(th, rootBg)) : null
      });
    }
    return out;
  })()`);
  for (const r of h5ThemeContrast) {
    const label = `H5 values ${r.theme}:inv=${r.inv}`;
    assert(r.bvRatio !== null && r.bvRatio >= 4.5, `${label} .berry-val contrast ${r.bvRatio} < 4.5`);
    if (r.bvfRatio !== null) assert(r.bvfRatio >= 4.5, `${label} .berry-val-fav contrast ${r.bvfRatio} < 4.5`);
    assert(r.ivRatio !== null && r.ivRatio >= 4.5, `${label} .ing-val contrast ${r.ivRatio} < 4.5`);
    if (r.thRatio !== null) assert(r.thRatio >= 4.5, `${label} .value-tail-highlight contrast ${r.thRatio} < 4.5`);
  }

  // 2. Web Desktop wide-screen
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
  await sleep(50);
  await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', 'desktop'); })()`);
  await cdp.send('Page.navigate', { url: `${baseUrl}/index.html?view=desktop` });
  await waitForAppReady(cdp, 'R4 Desktop');

  const deskMetrics = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('values');
    await sleepMs(120);
    const ingGrid = document.querySelector('.values-ing-grid');
    const iCs = window.getComputedStyle(ingGrid);
    const ingTops = [...new Set(Array.from(ingGrid.querySelectorAll('.value-compact-node')).map(n => Math.round(n.getBoundingClientRect().top)))];
    return {
      ingAutoFlow: iCs.gridAutoFlow,
      ingRowCount: ingTops.length,
      nodeCount: ingGrid.querySelectorAll('.value-compact-node').length
    };
  })()`);

  assert.strictEqual(deskMetrics.ingAutoFlow, 'column', 'Desktop Ingredient gridAutoFlow must stay column');
  assert.strictEqual(deskMetrics.ingRowCount, 1, 'Desktop Ingredient grid must stay single-row');
  assert.strictEqual(deskMetrics.nodeCount, 20, 'Desktop Ingredient grid must render 20 ingredients');
});

// ---------------------------------------------------------------------------
// R5: Standalone H5 Immersive Status Bar vs Regular Browser Isolation
// ---------------------------------------------------------------------------
addTest('E2E-R5-01', 'Regular browser leaves theme-color/apple-status-bar untouched; standalone mode updates them across all 8 theme variants', async ({ cdp, baseUrl }) => {
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  // 1. Regular browser mode
  await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
  await sleep(50);
  await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_theme', 'dawn'); localStorage.setItem('pksleep_view_pref', 'mobile'); })()`);
  await cdp.send('Page.navigate', { url: `${baseUrl}/app/index.html?view=mobile` });
  await waitForAppReady(cdp, 'R5 Regular Browser');

  const regState = await cdp.evalJs(`(() => {
    if (window.PokemonApp && window.PokemonApp.applyTheme) window.PokemonApp.applyTheme('emerald', false);
    return {
      hasClass: document.documentElement.classList.contains('pwa-standalone'),
      themeColor: document.querySelector('meta[name="theme-color"]').getAttribute('content'),
      appleStyle: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content')
    };
  })()`);

  assert.strictEqual(regState.hasClass, false, 'Regular browser must not have pwa-standalone class');
  assert.strictEqual(regState.themeColor, '#0a0f1d', 'Regular browser must keep default theme-color');
  assert.strictEqual(regState.appleStyle, 'black-translucent', 'Regular browser must keep default apple status bar style');

  // 2. Simulated Standalone PWA mode
  const standaloneHook = await cdp.send('Page.addScriptToEvaluateOnNewDocument', {
    source: `
      try {
        const origMM = window.matchMedia ? window.matchMedia.bind(window) : null;
        window.matchMedia = function(q) {
          if (q && q.indexOf('display-mode: standalone') !== -1) {
            return {
              matches: true,
              media: q,
              onchange: null,
              addEventListener: function() {},
              removeEventListener: function() {},
              addListener: function() {},
              removeListener: function() {}
            };
          }
          return origMM ? origMM(q) : { matches: false, media: q, addEventListener: function() {}, removeEventListener: function() {} };
        };
      } catch (e) {}
    `
  });

  try {
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_theme', 'dawn'); localStorage.setItem('user_theme_inverted', 'false'); localStorage.setItem('pksleep_view_pref', 'mobile'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}/app/index.html?view=mobile` });
    await waitForAppReady(cdp, 'R5 Standalone');

    const initStandalone = await cdp.evalJs(`(() => ({
      hasClass: document.documentElement.classList.contains('pwa-standalone'),
      themeColor: document.querySelector('meta[name="theme-color"]').getAttribute('content'),
      appleStyle: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content')
    }))()`);
    assert.strictEqual(initStandalone.hasClass, true, 'Standalone mode must add pwa-standalone class');
    assert.strictEqual(initStandalone.themeColor, '#f8fafc', 'Standalone initial dawn theme-color mismatch');
    assert.strictEqual(initStandalone.appleStyle, 'default', 'Standalone initial dawn apple status bar mismatch');

    const matrix = [
      ['midnight', false, '#0a0f1d', 'black-translucent'],
      ['onyx', false, '#0a0a0a', 'black-translucent'],
      ['dawn', false, '#f8fafc', 'default'],
      ['emerald', false, '#f1f5f9', 'default'],
      ['midnight', true, '#f0f9ff', 'default'],
      ['onyx', true, '#fafafa', 'default'],
      ['dawn', true, '#1c1917', 'black-translucent'],
      ['emerald', true, '#0f172a', 'black-translucent']
    ];
    for (const [theme, inv, expHex, expApple] of matrix) {
      const state = await cdp.evalJs(`(async () => {
        window.PokemonApp.applyTheme(${JSON.stringify(theme)}, ${JSON.stringify(inv)});
        await new Promise(r => setTimeout(r, 180));
        const header = document.querySelector('.mobile-app-header');
        const title = document.querySelector('.mobile-app-header .mobile-brand-title');
        const btn = document.querySelector('.mobile-app-header .mobile-header-btn');
        function parseRgbList(str) {
          return [...String(str || '').matchAll(/rgb\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*\\)/g)]
            .map(m => ({ r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }));
        }
        function hexToRgb(hex) {
          const c = hex.replace('#', '');
          return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
        }
        function relLum(rgb) {
          const lin = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
          return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
        }
        function contrast(fg, bg) {
          const l1 = relLum(fg), l2 = relLum(bg);
          return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        }
        const bgRgb = hexToRgb(${JSON.stringify(expHex)});
        const titleCs = title ? window.getComputedStyle(title) : null;
        const gradStops = titleCs ? parseRgbList(titleCs.backgroundImage) : [];
        const titleColor = titleCs ? parseRgbList(titleCs.color)[0] : null;
        const btnCs = btn ? window.getComputedStyle(btn) : null;
        const btnColor = btnCs ? parseRgbList(btnCs.color)[0] : null;
        return {
          themeColor: document.querySelector('meta[name="theme-color"]').getAttribute('content'),
          appleStyle: document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').getAttribute('content'),
          titleStopMinContrast: gradStops.length ? Math.min(...gradStops.map(s => contrast(s, bgRgb))) : (titleColor ? contrast(titleColor, bgRgb) : null),
          titleColorContrast: titleColor ? contrast(titleColor, bgRgb) : null,
          btnContrast: btnColor ? contrast(btnColor, bgRgb) : null
        };
      })()`);
      assert.strictEqual(state.themeColor, expHex, `Standalone ${theme} inv=${inv} theme-color mismatch`);
      assert.strictEqual(state.appleStyle, expApple, `Standalone ${theme} inv=${inv} apple status bar mismatch`);
      assert(state.titleStopMinContrast !== null && state.titleStopMinContrast >= 4.5, `Standalone ${theme} inv=${inv} .mobile-brand-title gradient stop contrast ${state.titleStopMinContrast} < 4.5`);
      assert(state.titleColorContrast !== null && state.titleColorContrast >= 4.5, `Standalone ${theme} inv=${inv} .mobile-brand-title fallback color contrast ${state.titleColorContrast} < 4.5`);
      if (state.btnContrast !== null) {
        assert(state.btnContrast >= 4.5, `Standalone ${theme} inv=${inv} .mobile-header-btn contrast ${state.btnContrast} < 4.5`);
      }
    }
  } finally {
    await cdp.send('Page.removeScriptToEvaluateOnNewDocument', { identifier: standaloneHook.identifier });
  }
});

addTest('E2E-R5-02', 'Settings Modal (#settings-modal) achieves >= 4.5:1 WCAG AA contrast across all 8 themes on Desktop and Mobile H5', async ({ cdp, baseUrl }) => {
  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', '${vp.pref}'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
    await waitForAppReady(cdp, `Settings Modal (${vp.label})`);

    const report = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      const openBtn = document.getElementById('sync-config-btn');
      if (!openBtn) throw new Error('Missing #sync-config-btn');
      openBtn.click();
      await sleepMs(200);

      function parseRgba(str) {
        const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
      }
      function parseRgbList(str) {
        return [...String(str || '').matchAll(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/g)]
          .map(m => ({ r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }));
      }
      function blendOver(fg, bg) {
        const a = fg.a;
        return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
      }
      function getEffectiveBg(el, fallbackBg) {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
          if (bg && bg.a > 0) chain.push(bg);
          cur = cur.parentElement;
        }
        let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) acc = blendOver(chain[i], acc);
        return acc;
      }
      function relLum(rgb) {
        const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      }
      function contrast(fg, bg) {
        const f = fg.a < 1 ? blendOver(fg, bg) : fg;
        const l1 = relLum(f), l2 = relLum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }
      function minButtonContrast(el, rootBg) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        const fg = parseRgba(cs.color);
        const effBg = getEffectiveBg(el, rootBg);
        const stops = parseRgbList(cs.backgroundImage);
        if (stops.length > 0) {
          return Math.min(...stops.map(s => contrast(fg, s.a < 1 ? blendOver(s, effBg) : s)));
        }
        return contrast(fg, effBg);
      }

      const themes = [
        ['midnight', false], ['onyx', false], ['dawn', false], ['emerald', false],
        ['midnight', true], ['onyx', true], ['dawn', true], ['emerald', true]
      ];
      const out = [];
      for (const [theme, inv] of themes) {
        window.PokemonApp.applyTheme(theme, inv);
        await sleepMs(200);
        const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);
        const cardBadge = document.querySelector('#settings-modal .theme-card-btn.active .theme-card-badge');
        const chipActive = document.querySelector('#settings-modal .app-theme-chip.active');
        const chipLabel = chipActive ? chipActive.querySelector('.theme-chip-label') : null;
        const chipCheck = chipActive ? chipActive.querySelector('.theme-chip-check') : null;
        const langActive = document.querySelector('#settings-modal .lang-btn.active');
        const segActive = document.querySelector('#settings-modal .app-segment-btn.active');
        const exportBtn = document.getElementById('settings-export-box-btn');
        const closeBtn = document.getElementById('settings-modal-close-btn');
        const copyDiagBtn = document.getElementById('settings-copy-diag-btn');

        const sectionTitles = Array.from(document.querySelectorAll('#settings-modal .settings-section-title'));
        const sectionTitleMinContrast = sectionTitles.length > 0
          ? Math.min(...sectionTitles.map(el => contrast(parseRgba(window.getComputedStyle(el).color), getEffectiveBg(el, rootBg))))
          : null;

        out.push({
          theme, inv,
          sectionTitleCount: sectionTitles.length,
          sectionTitleMinContrast,
          cardBadgeContrast: cardBadge && window.getComputedStyle(cardBadge).display !== 'none'
            ? contrast(parseRgba(window.getComputedStyle(cardBadge).color), getEffectiveBg(cardBadge, rootBg))
            : null,
          chipActiveContrast: chipActive
            ? contrast(parseRgba(window.getComputedStyle(chipActive).color), getEffectiveBg(chipActive, rootBg))
            : null,
          chipLabelContrast: chipLabel
            ? contrast(parseRgba(window.getComputedStyle(chipLabel).color), getEffectiveBg(chipLabel, rootBg))
            : null,
          chipCheckContrast: chipCheck
            ? contrast(parseRgba(window.getComputedStyle(chipCheck).color), getEffectiveBg(chipCheck, rootBg))
            : null,
          chipCheckOpacity: chipCheck ? window.getComputedStyle(chipCheck).opacity : null,
          langActiveContrast: minButtonContrast(langActive, rootBg),
          segActiveContrast: minButtonContrast(segActive, rootBg),
          exportBtnContrast: minButtonContrast(exportBtn, rootBg),
          closeBtnContrast: closeBtn
            ? contrast(parseRgba(window.getComputedStyle(closeBtn).color), getEffectiveBg(closeBtn, rootBg))
            : null,
          copyDiagBtnContrast: minButtonContrast(copyDiagBtn, rootBg)
        });
      }
      const closeBtn = document.getElementById('settings-modal-close-btn');
      if (closeBtn) closeBtn.click();
      return out;
    })()`);

    assert.strictEqual(report.length, 8, `${vp.label}: must test all 8 theme variants in #settings-modal`);
    for (const r of report) {
      const label = `${vp.label} #settings-modal ${r.theme}:inv=${r.inv}`;
      if (!vp.mobile) {
        assert(r.sectionTitleCount >= 4, `${label} expected >=4 .settings-section-title elements, got ${r.sectionTitleCount}`);
        assert(r.sectionTitleMinContrast !== null && r.sectionTitleMinContrast >= 4.5, `${label} .settings-section-title contrast ${r.sectionTitleMinContrast} < 4.5`);
        assert(r.cardBadgeContrast !== null && r.cardBadgeContrast >= 4.5, `${label} .theme-card-badge contrast ${r.cardBadgeContrast} < 4.5`);
      } else {
        assert(r.chipActiveContrast !== null && r.chipActiveContrast >= 4.5, `${label} .app-theme-chip.active contrast ${r.chipActiveContrast} < 4.5`);
        assert(r.chipLabelContrast !== null && r.chipLabelContrast >= 4.5, `${label} .theme-chip-label contrast ${r.chipLabelContrast} < 4.5`);
        assert.strictEqual(r.chipCheckOpacity, '1', `${label} .theme-chip-check opacity must be 1`);
        assert(r.chipCheckContrast !== null && r.chipCheckContrast >= 4.5, `${label} .theme-chip-check contrast ${r.chipCheckContrast} < 4.5`);
        assert(r.segActiveContrast !== null && r.segActiveContrast >= 4.5, `${label} .app-segment-btn.active contrast ${r.segActiveContrast} < 4.5`);
      }
      assert(r.copyDiagBtnContrast !== null && r.copyDiagBtnContrast >= 4.5, `${label} #settings-copy-diag-btn contrast ${r.copyDiagBtnContrast} < 4.5`);
      assert(r.langActiveContrast !== null && r.langActiveContrast >= 4.5, `${label} .lang-btn.active contrast ${r.langActiveContrast} < 4.5`);
      assert(r.exportBtnContrast !== null && r.exportBtnContrast >= 4.5, `${label} #settings-export-box-btn contrast ${r.exportBtnContrast} < 4.5`);
      assert(r.closeBtnContrast !== null && r.closeBtnContrast >= 4.5, `${label} .settings-modal-close-btn contrast ${r.closeBtnContrast} < 4.5`);
    }
  }
});

addTest('E2E-R5-03', 'Global Skill Tooltip (#global-skill-tooltip) and CloudSync Auth (#cloud-auth-modal, header auth) meet >= 4.5:1 WCAG AA across all 8 themes', async ({ cdp, baseUrl }) => {
  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', '${vp.pref}'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
    await waitForAppReady(cdp, `Tooltip & CloudSync (${vp.label})`);

    const report = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      function parseRgba(str) {
        const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
      }
      function parseRgbList(str) {
        return [...String(str || '').matchAll(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/g)]
          .map(m => ({ r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }));
      }
      function blendOver(fg, bg) {
        const a = fg.a;
        return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
      }
      function getEffectiveBg(el, fallbackBg) {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
          if (bg && bg.a > 0) chain.push(bg);
          cur = cur.parentElement;
        }
        let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) acc = blendOver(chain[i], acc);
        return acc;
      }
      function relLum(rgb) {
        const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      }
      function contrast(fg, bg) {
        const f = fg.a < 1 ? blendOver(fg, bg) : fg;
        const l1 = relLum(f), l2 = relLum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }
      function minElContrast(el, rootBg) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        const fg = parseRgba(cs.color);
        const effBg = getEffectiveBg(el, rootBg);
        const stops = parseRgbList(cs.backgroundImage);
        if (stops.length > 0) {
          return Math.min(...stops.map(s => contrast(fg, s.a < 1 ? blendOver(s, effBg) : s)));
        }
        return contrast(fg, effBg);
      }

      const themes = [
        ['midnight', false], ['onyx', false], ['dawn', false], ['emerald', false],
        ['midnight', true], ['onyx', true], ['dawn', true], ['emerald', true]
      ];
      const out = [];

      for (const [theme, inv] of themes) {
        window.PokemonApp.applyTheme(theme, inv);
        await sleepMs(200);
        const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);

        // 1. Global Skill Tooltip
        window.PokemonApp.showGlobalTooltip(document.body, 'Test Title', 'Body <span class="text-accent font-bold">0.45x</span>', 'Tag');
        await sleepMs(60);
        const gTip = document.getElementById('global-skill-tooltip');
        const gTipBg = gTip ? getEffectiveBg(gTip, rootBg) : null;
        const tipTitle = gTip ? gTip.querySelector('.tooltip-title') : null;
        const tipTag = gTip ? gTip.querySelector('.tooltip-tag') : null;
        const tipBody = gTip ? gTip.querySelector('.tooltip-body') : null;
        const tipAccent = gTip ? gTip.querySelector('.tooltip-body .text-accent') : null;

        const tooltipMetrics = {
          bgRgb: gTipBg,
          titleContrast: minElContrast(tipTitle, rootBg),
          tagContrast: minElContrast(tipTag, rootBg),
          bodyContrast: minElContrast(tipBody, rootBg),
          accentContrast: minElContrast(tipAccent, rootBg)
        };
        window.PokemonApp.hideGlobalTooltip();

        // Live badge click check on light themes (dawn:false & onyx:true)
        let liveBadgeOk = true;
        if ((theme === 'dawn' && !inv) || (theme === 'onyx' && inv)) {
          const badge = document.querySelector('.special-skill-badge');
          if (badge) {
            badge.click();
            await sleepMs(60);
            const liveTitle = document.querySelector('#global-skill-tooltip .tooltip-title');
            const ratio = minElContrast(liveTitle, rootBg);
            liveBadgeOk = Boolean(ratio !== null && ratio >= 4.5);
            window.PokemonApp.hideGlobalTooltip();
          }
        }

        // 2. CloudSync Auth Modal
        window.CloudSync.openAuthModal('signin');
        await sleepMs(100);
        const modal = document.getElementById('cloud-auth-modal');
        const authMetrics = modal ? {
          titleContrast: minElContrast(modal.querySelector('.cloud-auth-title'), rootBg),
          closeContrast: minElContrast(modal.querySelector('.cloud-auth-close-btn'), rootBg),
          subHintContrast: minElContrast(modal.querySelector('.auth-sub-hint'), rootBg),
          labelContrast: minElContrast(modal.querySelector('.cloud-auth-label'), rootBg),
          pwdToggleContrast: minElContrast(modal.querySelector('.cloud-auth-pwd-toggle'), rootBg),
          footerContrast: minElContrast(modal.querySelector('.cloud-auth-footer-link'), rootBg),
          switchContrast: minElContrast(modal.querySelector('.cloud-auth-switch-btn'), rootBg),
          primaryBtnContrast: minElContrast(modal.querySelector('.cloud-auth-btn.btn-primary'), rootBg)
        } : null;
        window.CloudSync.closeAuthModal();
        await sleepMs(60);

        // 3. Logged-in Header Auth Buttons
        let headerAuthContrast = null;
        if (!${vp.mobile}) {
          const hBtn = document.getElementById('header-cloud-auth-btn');
          if (hBtn) {
            hBtn.classList.remove('is-guest');
            hBtn.classList.add('is-logged-in');
            headerAuthContrast = minElContrast(hBtn, rootBg);
            hBtn.classList.remove('is-logged-in');
            hBtn.classList.add('is-guest');
          }
        } else {
          const mBtn = document.getElementById('mobile-header-auth-btn');
          if (mBtn) {
            mBtn.classList.remove('is-guest');
            mBtn.classList.add('is-logged-in');
            headerAuthContrast = minElContrast(mBtn, rootBg);
            mBtn.classList.remove('is-logged-in');
            mBtn.classList.add('is-guest');
          }
        }

        out.push({ theme, inv, tooltipMetrics, liveBadgeOk, authMetrics, headerAuthContrast });
      }
      return out;
    })()`);

    assert.strictEqual(report.length, 8, `${vp.label}: must test all 8 themes in E2E-R5-03`);
    for (const r of report) {
      const label = `${vp.label} ${r.theme}:inv=${r.inv}`;
      if (r.theme === 'onyx' && r.inv) {
        assert(r.tooltipMetrics.bgRgb && r.tooltipMetrics.bgRgb.r >= 240 && r.tooltipMetrics.bgRgb.g >= 240 && r.tooltipMetrics.bgRgb.b >= 240,
          `${label} #global-skill-tooltip must use light background, got ${JSON.stringify(r.tooltipMetrics.bgRgb)}`);
      }
      assert(r.tooltipMetrics.titleContrast >= 4.5, `${label} .tooltip-title contrast ${r.tooltipMetrics.titleContrast} < 4.5`);
      assert(r.tooltipMetrics.tagContrast >= 4.5, `${label} .tooltip-tag contrast ${r.tooltipMetrics.tagContrast} < 4.5`);
      assert(r.tooltipMetrics.bodyContrast >= 4.5, `${label} .tooltip-body contrast ${r.tooltipMetrics.bodyContrast} < 4.5`);
      assert(r.tooltipMetrics.accentContrast >= 4.5, `${label} .tooltip-body .text-accent contrast ${r.tooltipMetrics.accentContrast} < 4.5`);
      assert(r.liveBadgeOk, `${label} live .special-skill-badge tooltip failed contrast check`);

      assert(r.authMetrics, `${label} missing #cloud-auth-modal`);
      for (const [k, v] of Object.entries(r.authMetrics)) {
        assert(v !== null && v >= 4.5, `${label} #cloud-auth-modal ${k} contrast ${v} < 4.5`);
      }
      assert(r.headerAuthContrast !== null && r.headerAuthContrast >= 4.5, `${label} logged-in header auth button contrast ${r.headerAuthContrast} < 4.5`);
    }
  }
});

// ---------------------------------------------------------------------------
// M2: Items Tab & Item Detail Modal 8-Theme Dark/Light & WCAG AA Verification
// ---------------------------------------------------------------------------
addTest('E2E-M2-ITEMS-01', 'Items Tab (#wiki-subpanel-items) and Item Detail Modal (#wiki-item-detail-modal) enforce dark/light luminance & >= 4.5:1 WCAG AA contrast across all 8 themes on Desktop & Mobile H5', async ({ cdp, baseUrl }) => {
  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
    await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
    await sleep(50);
    await cdp.evalJs(`(() => { localStorage.clear(); localStorage.setItem('user_lang', 'zh-TW'); localStorage.setItem('pksleep_view_pref', '${vp.pref}'); })()`);
    await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
    await waitForAppReady(cdp, `Items 8-Theme (${vp.label})`);

    const report = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      if (window.switchMainTab) window.switchMainTab('wiki');
      await sleepMs(100);
      if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab('items');
      await sleepMs(150);

      function parseRgba(str) {
        const m = String(str || '').match(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/);
        if (!m) return null;
        return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 };
      }
      function parseRgbList(str) {
        return [...String(str || '').matchAll(/rgba?\\(\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)(?:\\s*,\\s*([\\d.]+))?\\s*\\)/g)]
          .map(m => ({ r: Number(m[1]), g: Number(m[2]), b: Number(m[3]), a: m[4] !== undefined ? Number(m[4]) : 1 }));
      }
      function blendOver(fg, bg) {
        const a = fg.a;
        return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
      }
      function getEffectiveBg(el, fallbackBg) {
        const chain = [];
        let cur = el;
        while (cur && cur.nodeType === 1) {
          const bg = parseRgba(window.getComputedStyle(cur).backgroundColor);
          if (bg && bg.a > 0) chain.push(bg);
          cur = cur.parentElement;
        }
        let acc = fallbackBg || { r: 10, g: 15, b: 29, a: 1 };
        for (let i = chain.length - 1; i >= 0; i--) acc = blendOver(chain[i], acc);
        return acc;
      }
      function relLum(rgb) {
        const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
        return 0.2126 * lin(rgb.r) + 0.7152 * lin(rgb.g) + 0.0722 * lin(rgb.b);
      }
      function contrast(fg, bg) {
        const f = fg.a < 1 ? blendOver(fg, bg) : fg;
        const l1 = relLum(f), l2 = relLum(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      }
      function minElContrast(el, rootBg) {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        const fg = parseRgba(cs.color);
        const effBg = getEffectiveBg(el, rootBg);
        const stops = parseRgbList(cs.backgroundImage);
        if (stops.length > 0) {
          return Math.min(...stops.map(s => contrast(fg, s.a < 1 ? blendOver(s, effBg) : s)));
        }
        return contrast(fg, effBg);
      }

      const themes = [
        ['midnight', false, false],
        ['onyx', false, false],
        ['dawn', false, true],
        ['emerald', false, true],
        ['midnight', true, true],
        ['onyx', true, true],
        ['dawn', true, false],
        ['emerald', true, false]
      ];

      const out = [];
      for (const [theme, inv, isLight] of themes) {
        window.PokemonApp.applyTheme(theme, inv);
        await sleepMs(220);
        const rootBg = parseRgba(window.getComputedStyle(document.documentElement).backgroundColor);

        const activePill = document.querySelector('#wiki-subpanel-items .wiki-items-filter-pills .wiki-pill-btn.active');
        const firstCard = document.querySelector('#wiki-subpanel-items .wiki-item-card');
        const cardName = firstCard ? firstCard.querySelector('.wiki-item-card-name') : null;
        const cardCat = firstCard ? firstCard.querySelector('.wiki-item-cat-badge') : null;

        // 1. Open Evolution item modal (thunder_stone) for pkm cards + evolution badge
        window.WikiDB.openItemDetailModal('thunder_stone');
        await sleepMs(220);
        const modal = document.getElementById('wiki-item-detail-modal');
        const dialog = modal ? modal.querySelector('.wiki-item-modal-dialog') : null;
        const header = modal ? modal.querySelector('.wiki-item-modal-header') : null;
        const titleEl = modal ? modal.querySelector('#wiki-item-modal-title') : null;
        const closeBtn = modal ? modal.querySelector('#wiki-item-modal-close-btn') : null;
        const modalCat = modal ? modal.querySelector('#wiki-item-modal-cat-badge') : null;
        const secTitle = modal ? modal.querySelector('.wiki-item-section-title') : null;
        const effectsEl = modal ? modal.querySelector('#wiki-item-modal-effects') : null;
        const pricePill = modal ? modal.querySelector('.wiki-item-price-pill') : null;
        const priceLbl = modal ? modal.querySelector('.wiki-item-price-pill .price-label') : null;
        const priceVal = modal ? modal.querySelector('.wiki-item-price-pill .price-value.text-highlight, .wiki-item-price-pill .price-value:not(.text-muted)') : null;
        const acqItem = modal ? modal.querySelector('.wiki-item-acq-item') : null;
        const pkmCard = modal ? modal.querySelector('.wiki-item-pkm-card') : null;
        const pkmNo = modal ? modal.querySelector('.wiki-item-pkm-no') : null;
        const pkmName = modal ? modal.querySelector('.wiki-item-pkm-name') : null;

        const dialogLum = dialog ? relLum(getEffectiveBg(dialog, rootBg)) : null;
        const headerLum = header ? relLum(getEffectiveBg(header, rootBg)) : null;
        const pricePillLum = pricePill ? relLum(getEffectiveBg(pricePill, rootBg)) : null;
        const pkmCardLum = pkmCard ? relLum(getEffectiveBg(pkmCard, rootBg)) : null;

        const evoSnapshot = {
          dialogLum, headerLum, pricePillLum, pkmCardLum,
          titleContrast: minElContrast(titleEl, rootBg),
          closeContrast: minElContrast(closeBtn, rootBg),
          modalCatContrast: minElContrast(modalCat, rootBg),
          secTitleContrast: minElContrast(secTitle, rootBg),
          effectsContrast: minElContrast(effectsEl, rootBg),
          priceLblContrast: minElContrast(priceLbl, rootBg),
          priceValContrast: minElContrast(priceVal, rootBg),
          acqContrast: minElContrast(acqItem, rootBg),
          pkmNoContrast: minElContrast(pkmNo, rootBg),
          pkmNameContrast: minElContrast(pkmName, rootBg)
        };
        window.WikiDB.closeItemDetailModal();
        await sleepMs(120);

        // 2. Open Seed item modal (main_skill_seed) for .stat-type-seed hero
        window.WikiDB.openItemDetailModal('main_skill_seed');
        await sleepMs(220);
        const statHero = document.querySelector('#wiki-item-detail-modal #wiki-item-modal-stat-hero');
        const statVal = statHero ? statHero.querySelector('.stat-hero-val') : null;
        const statTitle = statHero ? statHero.querySelector('.stat-hero-title') : null;
        const seedSnapshot = {
          statValContrast: minElContrast(statVal, rootBg),
          statTitleContrast: minElContrast(statTitle, rootBg)
        };
        window.WikiDB.closeItemDetailModal();
        await sleepMs(120);

        out.push({
          theme, inv, isLight,
          activePillContrast: minElContrast(activePill, rootBg),
          cardNameContrast: minElContrast(cardName, rootBg),
          cardCatContrast: minElContrast(cardCat, rootBg),
          ...evoSnapshot,
          ...seedSnapshot
        });
      }
      return out;
    })()`);

    assert.strictEqual(report.length, 8, `${vp.label}: must test all 8 themes on Items tab`);
    for (const r of report) {
      const label = `${vp.label} Items ${r.theme}:inv=${r.inv}`;
      if (r.isLight) {
        assert(r.dialogLum !== null && r.dialogLum > 0.8, `${label} light modal dialog luminance ${r.dialogLum} <= 0.8`);
        assert(r.headerLum !== null && r.headerLum > 0.8, `${label} light modal header luminance ${r.headerLum} <= 0.8`);
        assert(r.pricePillLum !== null && r.pricePillLum > 0.8, `${label} light price pill luminance ${r.pricePillLum} <= 0.8`);
        assert(r.pkmCardLum !== null && r.pkmCardLum > 0.8, `${label} light pkm card luminance ${r.pkmCardLum} <= 0.8`);
      } else {
        assert(r.dialogLum !== null && r.dialogLum < 0.1, `${label} dark modal dialog luminance ${r.dialogLum} >= 0.1`);
        assert(r.headerLum !== null && r.headerLum < 0.1, `${label} dark modal header luminance ${r.headerLum} >= 0.1`);
        assert(r.pricePillLum !== null && r.pricePillLum < 0.1, `${label} dark price pill luminance ${r.pricePillLum} >= 0.1`);
        assert(r.pkmCardLum !== null && r.pkmCardLum < 0.1, `${label} dark pkm card luminance ${r.pkmCardLum} >= 0.1`);
      }

      for (const field of [
        'activePillContrast', 'cardNameContrast', 'cardCatContrast',
        'titleContrast', 'closeContrast', 'modalCatContrast', 'secTitleContrast',
        'effectsContrast', 'priceLblContrast', 'priceValContrast', 'acqContrast',
        'pkmNoContrast', 'pkmNameContrast', 'statValContrast', 'statTitleContrast'
      ]) {
        assert(r[field] !== null && r[field] >= 4.5, `${label} ${field} contrast ${r[field]} < 4.5`);
      }
    }
  }
});

// ---------------------------------------------------------------------------
// M1: 3-Language Live DOM Verification (zh-TW, zh-CN, en-US)
// ---------------------------------------------------------------------------
addTest('E2E-M1-I18N-01', '3-Language Live DOM audit (zh-TW, zh-CN, en-US) across Pokédex, Recipes, Wiki (7 subtabs + Item Modal), Box + Lab + Appraisal, and News has 0 Traditional leaks in zh-CN and 0 unintended CJK in en-US', async ({ cdp, baseUrl }) => {
  const t2sSrc = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n', 'i18n_t2s.js'), 'utf8');
  const tradChars = (t2sSrc.match(/const T2S_TRAD = "([^"]+)";/) || [])[1] || '';
  assert(tradChars.length > 900, 'Expected T2S_TRAD table from i18n_t2s.js');

  const sampleBox = JSON.stringify([{
    uid: 'cdp_test_pika_1',
    pokemonId: 25,
    name: '皮卡丘',
    nickname: 'Sparky',
    level: 50,
    nature: '固執',
    subskills: ['樹果數量S', '幫忙速度M', '幫手獎勵', '持有上限提升L', '技能機率提升M'],
    ingredients: ['特選蘋果', '特選蘋果', '暖暖薑'],
    skillLevel: 3,
    ribbon: 1
  }]);

  const viewports = [
    { label: 'Desktop', url: '/index.html?view=desktop', pref: 'desktop', width: 1280, height: 800, dpr: 1, mobile: false },
    { label: 'MobileH5', url: '/app/index.html?view=mobile', pref: 'mobile', width: 390, height: 844, dpr: 2, mobile: true }
  ];

  const langs = ['zh-TW', 'zh-CN', 'en-US'];

  const allFailures = [];
  for (const vp of viewports) {
    for (const lang of langs) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.dpr, mobile: vp.mobile });
      await cdp.send('Page.navigate', { url: `${baseUrl}/manifest.webmanifest` });
      await sleep(40);
      await cdp.evalJs(`(() => {
        localStorage.clear();
        localStorage.setItem('user_lang', ${JSON.stringify(lang)});
        localStorage.setItem('pksleep_view_pref', ${JSON.stringify(vp.pref)});
        localStorage.setItem('PKMSLEEP_USER_BOX_V1', ${JSON.stringify(sampleBox)});
      })()`);
      await cdp.send('Page.navigate', { url: `${baseUrl}${vp.url}` });
      await waitForAppReady(cdp, `I18N ${vp.label} ${lang}`);

      const audit = await cdp.evalJs(`(async () => {
        const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
        const tradSet = new Set(${JSON.stringify([...tradChars])});
        const cjkRe = /[\\u4e00-\\u9fff\\u3400-\\u4dbf]/;
        const leaks = [];

        function isVisibleEl(el) {
          let cur = el;
          while (cur && cur.nodeType === 1) {
            const tag = cur.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEMPLATE') return false;
            const cs = window.getComputedStyle(cur);
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
            cur = cur.parentElement;
          }
          return true;
        }

        function scanVisibleDom(areaLabel) {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
          let node;
          while ((node = walker.nextNode())) {
            const txt = (node.nodeValue || '').trim();
            if (!txt) continue;
            const parent = node.parentElement;
            if (!parent || !isVisibleEl(parent)) continue;
            if (txt === '繁體中文' || txt === '简体中文' || txt === 'English') continue;

            if (${JSON.stringify(lang)} === 'zh-CN') {
              const bad = [];
              for (const ch of txt) {
                if (tradSet.has(ch)) bad.push(ch);
              }
              if (bad.length > 0) {
                leaks.push({ area: areaLabel, chars: [...new Set(bad)].join(''), text: txt.slice(0, 120), selector: parent.id || parent.className || parent.tagName });
              }
            } else if (${JSON.stringify(lang)} === 'en-US') {
              if (cjkRe.test(txt)) {
                leaks.push({ area: areaLabel, text: txt.slice(0, 120), selector: parent.id || parent.className || parent.tagName });
              }
            }
          }
        }

        // 1. Pokedex + Detail Modal
        if (window.switchMainTab) window.switchMainTab('pokemon');
        await sleepMs(120);
        scanVisibleDom('pokedex-list');
        if (window.PokemonApp && window.PokemonApp.openPokemonDetailModal) {
          window.PokemonApp.openPokemonDetailModal(25);
          await sleepMs(150);
          scanVisibleDom('pokedex-detail-modal');
          const pClose = document.querySelector('#pokedex-detail-modal .modal-close, #pokedex-detail-modal .pokedex-modal-close, #pokedex-detail-modal .box-modal-close');
          if (pClose) pClose.click();
          else if (window.PokemonApp.closePokemonDetailModal) window.PokemonApp.closePokemonDetailModal();
          await sleepMs(380);
        }

        // 2. Recipes + Pot Filler Modal
        if (window.switchMainTab) window.switchMainTab('recipes');
        await sleepMs(150);
        scanVisibleDom('recipes-list');
        if (window.RecipesApp && window.RecipesApp.openPotFillerModal) {
          const firstRecipe = (window.__RECIPES_CACHE__ && window.__RECIPES_CACHE__[0]) || null;
          if (firstRecipe) {
            window.RecipesApp.openPotFillerModal(firstRecipe);
            await sleepMs(150);
            scanVisibleDom('recipes-pot-filler-modal');
            const fClose = document.getElementById('filler-dialog-close-btn');
            if (fClose) fClose.click();
            await sleepMs(380);
          }
        }

        // 3. Wiki (all 7 subtabs + Item Detail Modal)
        if (window.switchMainTab) window.switchMainTab('wiki');
        await sleepMs(120);
        for (const sub of ['skills', 'ratings', 'ingredients', 'skills_ladder', 'values', 'islands', 'items']) {
          if (window.WikiDB && window.WikiDB.switchWikiSubTab) window.WikiDB.switchWikiSubTab(sub);
          await sleepMs(120);
          scanVisibleDom('wiki-' + sub);
        }
        if (window.WikiDB && window.WikiDB.openItemDetailModal) {
          window.WikiDB.openItemDetailModal('thunder_stone');
          await sleepMs(150);
          scanVisibleDom('wiki-item-detail-modal');
          window.WikiDB.closeItemDetailModal();
          await sleepMs(380);
        }

        // 4. Box + Edit Modal + Lab (Team / Compare / Growth) + Appraisal Modal
        if (window.switchMainTab) window.switchMainTab('box');
        await sleepMs(150);
        if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) {
          window.CloudSync.dismissBoxAuthOverlay();
          await sleepMs(60);
        }
        scanVisibleDom('box-list');
        const boxList = window.PokemonBoxApp && window.PokemonBoxApp.getUserBox ? window.PokemonBoxApp.getUserBox() : [];
        if (boxList[0] && window.PokemonBoxApp && window.PokemonBoxApp.openBoxEditModal) {
          window.PokemonBoxApp.openBoxEditModal(boxList[0]);
          await sleepMs(120);
          scanVisibleDom('box-edit-modal');
          if (window.PokemonBoxApp.closeBoxEditModal) window.PokemonBoxApp.closeBoxEditModal();
          await sleepMs(80);
        }
        if (window.AppraisalLab) {
          for (const labSub of ['team', 'compare', 'growth']) {
            if (window.AppraisalLab.switchSubTab) window.AppraisalLab.switchSubTab(labSub);
            await sleepMs(120);
            scanVisibleDom('lab-' + labSub);
          }
          if (boxList[0] && window.AppraisalLab.openModal) {
            window.AppraisalLab.openModal(boxList[0]);
            await sleepMs(120);
            scanVisibleDom('lab-appraisal-modal');
            if (window.AppraisalLab.closeModal) window.AppraisalLab.closeModal();
            await sleepMs(80);
          }
        }

        // 5. News + Timeline + Expanded Article
        if (window.switchMainTab) window.switchMainTab('news');
        await sleepMs(150);
        scanVisibleDom('news-timeline');
        const firstArticle = document.querySelector('#news-list .news-accordion-card');
        if (firstArticle) {
          firstArticle.click();
          await sleepMs(120);
          scanVisibleDom('news-expanded-article');
        }

        return {
          docLang: document.documentElement.getAttribute('lang'),
          leaksCount: leaks.length,
          leaks: leaks.slice(0, 20)
        };
      })()`);

      const expDocLang = lang === 'zh-TW' ? 'zh-Hant' : (lang === 'zh-CN' ? 'zh-Hans' : 'en');
      assert.strictEqual(audit.docLang, expDocLang, `${vp.label} ${lang}: html[lang] mismatch`);
      if (audit.leaksCount > 0) {
        allFailures.push({ viewport: vp.label, lang, leaksCount: audit.leaksCount, leaks: audit.leaks });
      }
    }
  }
  assert.strictEqual(allFailures.length, 0, `Detected i18n leaks across viewports/languages: ${JSON.stringify(allFailures, null, 2)}`);
});

async function main() {
  let httpCtx = null;
  let chrome = null;
  let passed = 0;
  let failed = 0;

  try {
    httpCtx = await startStaticServer();
    chrome = await launchChromeCDP();
    const ctx = { cdp: chrome.client, baseUrl: httpCtx.baseUrl };

    for (const t of tests) {
      const t0 = Date.now();
      try {
        await t.fn(ctx);
        console.log(`[PASS] ${t.id} ${t.name} (${Date.now() - t0}ms)`);
        passed++;
      } catch (err) {
        console.log(`[FAIL] ${t.id} ${t.name} (${Date.now() - t0}ms)`);
        console.log(`       Diagnostic: ${err && err.stack ? err.stack : err}`);
        failed++;
      }
    }
  } finally {
    if (chrome) {
      try { chrome.client.close(); } catch (_) {}
      try { chrome.proc.kill('SIGTERM'); } catch (_) {}
    }
    if (httpCtx) {
      await new Promise(resolve => httpCtx.server.close(() => resolve()));
    }
  }

  console.log(`\nE2E R1-R5 Summary: ${passed}/${passed + failed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
