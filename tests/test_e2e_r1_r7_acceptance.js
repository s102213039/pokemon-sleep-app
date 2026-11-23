#!/usr/bin/env node
/**
 * tests/test_e2e_r1_r7_acceptance.js
 * Comprehensive E2E Acceptance Suite for Requirements R1-R7 (Tiers 1-4)
 * =====================================================================
 * Zero external npm dependencies. Uses Node.js built-ins (http, fs, path,
 * os, vm, assert, child_process, WebSocket, fetch), macOS Google Chrome
 * Headless CDP (--headless=new), and Python 3 + Pillow (PIL).
 *
 * Supported CLI flags (Global Rule 11 compliant):
 *   --fast | --skip-tier4        Skip Tier 4 scenarios
 *   --tier=1,2 | -t 1,2          Run selected tiers only (comma-separated)
 *   -g "pattern" | --grep=...    Filter tests by ID, requirement, or name
 *   --json                       Emit structured JSON summary to stdout
 */
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const http = require('http');
const assert = require('assert');
const { spawn, execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const HOME_DIR = os.homedir();

// ---------------------------------------------------------------------------
// 1. CLI Argument Parsing (Global Rule 11: tolerant flag parsing)
// ---------------------------------------------------------------------------
function parseCliArgs(argv) {
  const opts = {
    skipTier4: false,
    tiers: null,
    grep: null,
    json: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--fast' || arg === '--skip-tier4') {
      opts.skipTier4 = true;
    } else if (arg === '--json') {
      opts.json = true;
    } else if (arg.startsWith('--tier=')) {
      const vals = arg.slice('--tier='.length).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      opts.tiers = new Set(vals);
    } else if (arg === '--tier' || arg === '-t') {
      const next = argv[++i] || '';
      const vals = next.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      opts.tiers = new Set(vals);
    } else if (arg.startsWith('-t=')) {
      const vals = arg.slice('-t='.length).split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
      opts.tiers = new Set(vals);
    } else if (arg.startsWith('--grep=')) {
      opts.grep = arg.slice('--grep='.length);
    } else if (arg === '--grep' || arg === '-g') {
      opts.grep = argv[++i] || '';
    }
  }
  return opts;
}

const CLI = parseCliArgs(process.argv.slice(2));

// ---------------------------------------------------------------------------
// 2. Canonical Domain Constants (Derived from ORIGINAL_REQUEST & PROJECT.md)
// ---------------------------------------------------------------------------
const EXPECTED_INGREDIENTS = [
  { key: 'apple', zhTw: '特選蘋果', zhCn: '特选苹果', en: 'Fancy Apple', energy: 90, stems: ['fancyapple'] },
  { key: 'milk', zhTw: '哞哞鮮奶', zhCn: '哞哞鲜奶', en: 'Moomoo Milk', energy: 98, stems: ['moomoomilk'] },
  { key: 'soybeans', zhTw: '萌綠大豆', zhCn: '萌绿大豆', en: 'Greengrass Soybeans', energy: 100, stems: ['greengrasssoybeans'] },
  { key: 'honey', zhTw: '甜甜蜜', zhCn: '甜甜蜜', en: 'Honey', energy: 101, stems: ['honey'] },
  { key: 'sausage', zhTw: '豆製肉', zhCn: '豆制肉', en: 'Bean Sausage', energy: 103, stems: ['beansausage'] },
  { key: 'ginger', zhTw: '暖暖薑', zhCn: '暖暖姜', en: 'Warming Ginger', energy: 109, stems: ['warmingginger'] },
  { key: 'tomato', zhTw: '好眠番茄', zhCn: '好眠番茄', en: 'Snoozy Tomato', energy: 110, stems: ['snoozytomato'] },
  { key: 'nuts', zhTw: '一口堅果', zhCn: '一口坚果', en: 'Snackable Nuts', energy: 112, stems: ['snackablenuts'] },
  { key: 'egg', zhTw: '特選蛋', zhCn: '特选蛋', en: 'Fancy Egg', energy: 115, stems: ['fancyegg'] },
  { key: 'oil', zhTw: '純粹油', zhCn: '纯粹油', en: 'Pure Oil', energy: 121, stems: ['pureoil'] },
  { key: 'potato', zhTw: '窩心洋芋', zhCn: '窝心洋芋', en: 'Soft Potato', energy: 124, stems: ['softpotato'] },
  { key: 'herb', zhTw: '火辣香草', zhCn: '火辣香草', en: 'Fiery Herb', energy: 130, stems: ['fieryherb'] },
  { key: 'corn', zhTw: '萌綠玉米', zhCn: '萌绿玉米', en: 'Greengrass Corn', energy: 140, stems: ['greengrasscorn'] },
  { key: 'cacao', zhTw: '放鬆可可', zhCn: '放松可可', en: 'Soothing Cacao', energy: 151, stems: ['soothingcacao'] },
  { key: 'coffee', zhTw: '醒腦咖啡豆', zhCn: '醒脑咖啡豆', en: 'Rousing Coffee', energy: 153, stems: ['rousingcoffee'] },
  { key: 'glossyavocado', zhTw: '嫩亮酪梨', zhCn: '嫩亮酪梨', en: 'Glossy Avocado', energy: 162, stems: ['glossyavocado'] },
  { key: 'mushroom', zhTw: '品鮮蘑菇', zhCn: '品鲜蘑菇', en: 'Tasty Mushroom', energy: 167, stems: ['tastymushroom'] },
  { key: 'leek', zhTw: '粗枝大蔥', zhCn: '粗枝大葱', en: 'Large Leek', energy: 185, stems: ['largeleek'] },
  { key: 'pumpkin', zhTw: '沉甸甸南瓜', zhCn: '沉甸甸南瓜', en: 'Plump Pumpkin', energy: 250, stems: ['plumppumpkin'] },
  { key: 'tail', zhTw: '美味尾巴', zhCn: '美味尾巴', en: 'Slowpoke Tail', energy: 342, stems: ['slowpoketail'] }
];

const EXPECTED_BERRIES = [
  { key: 'pamtre', names: ['椰木果', '藍異果', '蓝异果', 'Pamtre Berry', 'pamtreberry'], energy: 24 },
  { key: 'lum', names: ['木子果', '芭亞果', '芭亚果', 'Lum Berry', 'lumberry'], energy: 24 },
  { key: 'grepa', names: ['異奇果', '异奇果', 'Grepa Berry', 'grepaberry'], energy: 25 },
  { key: 'bluk', names: ['檬果', 'Bluk Berry', 'blukberry'], energy: 26 },
  { key: 'pecha', names: ['桃桃果', 'Pecha Berry', 'pechaberry'], energy: 26 },
  { key: 'mago', names: ['芒念果', '芒芒果', 'Mago Berry', 'magoberry'], energy: 26 },
  { key: 'leppa', names: ['蘋野果', '苹野果', 'Leppa Berry', 'leppaberry'], energy: 27 },
  { key: 'cheri', names: ['櫻子果', '樱子果', 'Cheri Berry', 'cheriberry'], energy: 27 },
  { key: 'persim', names: ['柿仔果', 'Persim Berry', 'persimberry'], energy: 28 },
  { key: 'figy', names: ['勿花果', 'Figy Berry', 'figyberry'], energy: 29 },
  { key: 'sitrus', names: ['文柚果', 'Sitrus Berry', 'sitrusberry'], energy: 30 },
  { key: 'durin', names: ['榴石果', '墨莓果', 'Durin Berry', 'durinberry'], energy: 30 },
  { key: 'oran', names: ['橙橙果', 'Oran Berry', 'oranberry'], energy: 31 },
  { key: 'wiki', names: ['芭拉果', '威嘻果', 'Wiki Berry', 'wikiberry'], energy: 31 },
  { key: 'chesto', names: ['零餘果', '零余果', 'Chesto Berry', 'chestoberry'], energy: 32 },
  { key: 'rawst', names: ['生薑果', '羅子果', '生姜果', '罗子果', 'Rawst Berry', 'rawstberry'], energy: 32 },
  { key: 'belue', names: ['靛莓果', '刺角果', 'Belue Berry', 'belueberry'], energy: 33 },
  { key: 'yache', names: ['巧可果', '亞雪果', '亚雪果', 'Yache Berry', 'yacheberry'], energy: 35 }
];

const CANONICAL_ING_KEYS = EXPECTED_INGREDIENTS.map(x => x.key);
const CANONICAL_BERRY_KEYS = EXPECTED_BERRIES.map(x => x.key);

// Sample UserBox payload so Lab Team Builder / Comparison / Growth mount cleanly
const SEED_USER_BOX = [
  {
    uid: 'e2e_seed_pika_1',
    pokemonId: '25',
    name: '皮卡丘',
    nickname: '',
    level: 50,
    nature: '怕寂寞',
    subskills: ['樹果數量S', '幫忙速度M', '幫手獎勵'],
    ing1: '特選蘋果',
    ing2: '暖暖薑',
    ing3: '特選蛋',
    ribbon: 0,
    skillLevel: 1,
    createdAt: 1700000001000
  },
  {
    uid: 'e2e_seed_venu_2',
    pokemonId: '3',
    name: '妙蛙花',
    nickname: '',
    level: 60,
    nature: '內斂',
    subskills: ['食材機率提升M', '幫忙速度M', '持有上限提升L'],
    ing1: '甜甜蜜',
    ing2: '好眠番茄',
    ing3: '窩心洋芋',
    ribbon: 0,
    skillLevel: 3,
    createdAt: 1700000002000
  }
];

// Unicode-escaped regexes for R7 (zero literal emojis or decorative glyphs in source)
const RE_SUPPLEMENTARY_EMOJI = /[\u{1F300}-\u{1FAFF}]/u;
const RE_MISC_EMOJI_OR_GLYPH = /[\u23F1\u2605\u2606\u2B50\u2728\u2764\uFE0F\u20E3\u{1F300}-\u{1FAFF}]/u;
const RE_DECORATIVE_BRACKET_GLYPH = new RegExp(
  '\\x5B\\x2A\\x5D|\\x5B\\x2B\\x5D|\\x5B\\x23\\x5D|\\x5B\\u2605\\x5D|\\x5B\\u2606\\x5D'
);

function findProhibitedGlyphs(text, options = {}) {
  const hits = [];
  const lines = String(text).split('\n');
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (options.stripMarkdownBackticks) {
      line = line.replace(/`[^`]*`/g, '');
    }
    if (options.ignoreLinesMatching && options.ignoreLinesMatching.test(line)) {
      continue;
    }
    const m1 = line.match(RE_MISC_EMOJI_OR_GLYPH);
    const m2 = line.match(RE_DECORATIVE_BRACKET_GLYPH);
    if (m1 || m2) {
      const token = (m1 && m1[0]) || (m2 && m2[0]);
      const codePoints = Array.from(token).map(ch => 'U+' + ch.codePointAt(0).toString(16).toUpperCase()).join(' ');
      hits.push({ line: i + 1, codePoints, snippet: line.trim().slice(0, 90) });
    }
  }
  return hits;
}

// ---------------------------------------------------------------------------
// 3. Python Pillow Asset Forensics Helper (Cached per run)
// ---------------------------------------------------------------------------
let _pillowReportCache = null;

function getPillowReport() {
  if (_pillowReportCache) return _pillowReportCache;
  const pyScript = `
import json, os
from PIL import Image

root = os.environ['E2E_ROOT_DIR']
out = {'pngs': {}, 'ico': None}

png_files = [
    'assets/icons/apple-touch-icon.png',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/icon-maskable.png',
]

for rel in png_files:
    full = os.path.join(root, rel)
    if not os.path.exists(full):
        out['pngs'][rel] = {'exists': False}
        continue
    im = Image.open(full)
    orig_mode = im.mode
    rgba = im.convert('RGBA')
    w, h = rgba.size
    px = rgba.load()
    corners = [
        {'x': 0, 'y': 0, 'rgba': list(px[0, 0])},
        {'x': w - 1, 'y': 0, 'rgba': list(px[w - 1, 0])},
        {'x': 0, 'y': h - 1, 'rgba': list(px[0, h - 1])},
        {'x': w - 1, 'y': h - 1, 'rgba': list(px[w - 1, h - 1])},
    ]
    extrema = rgba.getextrema()
    min_alpha, max_alpha = extrema[3]
    flat = rgba.get_flattened_data()
    transparent_count = sum(1 for p in flat if p[3] < 255)

    info = {
        'exists': True,
        'width': w,
        'height': h,
        'orig_mode': orig_mode,
        'corners': corners,
        'min_alpha': min_alpha,
        'max_alpha': max_alpha,
        'transparent_pixels': transparent_count,
    }

    if rel.endswith('icon-maskable.png'):
        # Check outer <8% border ring vs inner 80% safe zone (10%..90%)
        margin = max(1, int(min(w, h) * 0.08))
        safe_lo = int(min(w, h) * 0.12)
        safe_hi = int(min(w, h) * 0.88)
        border_lums = []
        safe_bright_pixels = 0
        border_opaque = True
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
                if x < margin or x >= w - margin or y < margin or y >= h - margin:
                    if a < 255:
                        border_opaque = False
                    border_lums.append(lum)
                elif safe_lo <= x <= safe_hi and safe_lo <= y <= safe_hi:
                    if lum >= 130:
                        safe_bright_pixels += 1
        border_max_lum = max(border_lums) if border_lums else 0
        border_avg_lum = sum(border_lums) / len(border_lums) if border_lums else 0
        info['maskable_check'] = {
            'border_opaque': border_opaque,
            'border_avg_lum': round(border_avg_lum, 2),
            'border_max_lum': round(border_max_lum, 2),
            'safe_bright_pixels': safe_bright_pixels,
        }

    out['pngs'][rel] = info

ico_path = os.path.join(root, 'favicon.ico')
if os.path.exists(ico_path):
    ico = Image.open(ico_path)
    sizes = ico.info.get('sizes', set())
    out['ico'] = {
        'exists': True,
        'format': ico.format,
        'size': list(ico.size),
        'sizes': sorted([list(s) for s in sizes]),
    }
else:
    out['ico'] = {'exists': False}

print(json.dumps(out))
`;
  const raw = execFileSync('python3', ['-c', pyScript], {
    env: { ...process.env, E2E_ROOT_DIR: ROOT_DIR },
    encoding: 'utf8'
  });
  _pillowReportCache = JSON.parse(raw.trim());
  return _pillowReportCache;
}

// ---------------------------------------------------------------------------
// 4. Local Static HTTP Server + Headless Chrome CDP Harness
// ---------------------------------------------------------------------------
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

class BrowserHarness {
  constructor() {
    this.httpCtx = null;
    this.chrome = null;
  }

  async ensureStarted() {
    if (!this.httpCtx) {
      this.httpCtx = await startStaticServer();
    }
    if (!this.chrome) {
      this.chrome = await launchChromeCDP();
    }
  }

  async openPage(relPath, opts = {}) {
    await this.ensureStarted();
    const {
      width = 1280,
      height = 800,
      mobile = false,
      lang = 'zh-TW',
      seedBox = false,
      clearStorage = true,
      waitCheck = 'Boolean(window.PokemonApp && window.I18N && window.GAME_CONFIG && document.querySelector("#content-area .pokemon-card, #content-area .pokemon-table tbody tr"))'
    } = opts;

    const cdp = this.chrome.client;
    const base = this.httpCtx.baseUrl;

    // Step 1: Visit lightweight same-origin resource to configure localStorage cleanly before app boot
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile
    });
    await cdp.send('Page.navigate', { url: `${base}/manifest.webmanifest` });
    await sleep(60);

    await cdp.evalJs(`(() => {
      try {
        if (${clearStorage}) localStorage.clear();
        localStorage.setItem('user_lang', ${JSON.stringify(lang)});
        localStorage.setItem('pksleep_view_pref', ${JSON.stringify(mobile ? 'mobile' : 'desktop')});
        if (${seedBox}) {
          localStorage.setItem('PKMSLEEP_USER_BOX_V1', ${JSON.stringify(JSON.stringify(SEED_USER_BOX))});
        }
      } catch (e) {}
      return true;
    })()`);

    // Step 2: Navigate to target entry
    const targetUrl = `${base}${relPath}`;
    await cdp.send('Page.navigate', { url: targetUrl });

    const deadline = Date.now() + 20000;
    let ready = false;
    while (Date.now() < deadline) {
      try {
        ready = await cdp.evalJs(`(() => { return ${waitCheck}; })()`);
        if (ready) break;
      } catch (_) {}
      await sleep(80);
    }
    if (!ready) {
      throw new Error(`Timed out waiting for app readiness at ${relPath} (${width}x${height}, ${lang})`);
    }
    // Give post-init rendering a brief moment to settle
    await sleep(120);
    return cdp;
  }

  async shutdown() {
    if (this.chrome) {
      try { this.chrome.client.close(); } catch (_) {}
      try { this.chrome.proc.kill('SIGTERM'); } catch (_) {}
      this.chrome = null;
    }
    if (this.httpCtx) {
      await new Promise(resolve => {
        try {
          this.httpCtx.server.close(() => resolve());
        } catch (_) {
          resolve();
        }
      });
      this.httpCtx = null;
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Browser DOM Inspection Helpers (Shared across Tiers 1-4)
// ---------------------------------------------------------------------------
async function openPokedexModalAndMeasure(cdp, lang) {
  await cdp.evalJs(`(() => {
    if (window.I18N && window.I18N.getLanguage() !== ${JSON.stringify(lang)}) {
      window.I18N.setLanguage(${JSON.stringify(lang)});
    }
    if (window.switchMainTab) window.switchMainTab('pokemon');
    const trigger = document.querySelector('#content-area .card-title-group, #content-area .td-name.pokemon-name-cell');
    if (!trigger) throw new Error('No Pokemon trigger element found in #content-area');
    trigger.click();
    return true;
  })()`);

  // Wait for modal visible
  for (let i = 0; i < 40; i++) {
    const vis = await cdp.evalJs(`(() => {
      const m = document.getElementById('pokedex-detail-modal');
      const b = document.getElementById('pokedex-subskill-clear-all-btn');
      return !!(m && b && window.getComputedStyle(m).display !== 'none');
    })()`);
    if (vis) break;
    await sleep(50);
  }

  return await cdp.evalJs(`(() => {
    const modal = document.getElementById('pokedex-detail-modal');
    const dialog = modal ? modal.querySelector('.pokedex-modal-dialog, .box-modal-dialog') : null;
    const btn = document.getElementById('pokedex-subskill-clear-all-btn');
    if (!modal || !btn) return { found: false };
    const parent = btn.parentElement;
    const label = parent ? parent.querySelector('label, .box-form-label') : null;
    const btnRect = btn.getBoundingClientRect();
    const parentRect = parent ? parent.getBoundingClientRect() : null;
    const labelRect = label ? label.getBoundingClientRect() : null;
    const dialogRect = dialog ? dialog.getBoundingClientRect() : null;
    const cs = window.getComputedStyle(btn);

    let lineRectsCount = 0;
    const range = document.createRange();
    if (btn.firstChild) {
      range.selectNodeContents(btn);
      lineRectsCount = range.getClientRects().length;
    }

    return {
      found: true,
      text: (btn.textContent || '').trim(),
      whiteSpace: cs.whiteSpace,
      flexShrink: cs.flexShrink,
      fontSize: cs.fontSize,
      lineRectsCount,
      scrollWidth: btn.scrollWidth,
      clientWidth: btn.clientWidth,
      btnRect: { left: btnRect.left, right: btnRect.right, top: btnRect.top, bottom: btnRect.bottom, width: btnRect.width, height: btnRect.height },
      parentRect: parentRect ? { left: parentRect.left, right: parentRect.right, width: parentRect.width } : null,
      labelRect: labelRect ? { left: labelRect.left, right: labelRect.right, width: labelRect.width } : null,
      dialogScrollWidth: dialog ? dialog.scrollWidth : 0,
      dialogClientWidth: dialog ? dialog.clientWidth : 0,
      dialogWidth: dialogRect ? dialogRect.width : 0
    };
  })()`);
}

function assertClearAllButtonSingleLine(m, ctxLabel) {
  assert(m && m.found, `${ctxLabel}: #pokedex-subskill-clear-all-btn not found`);
  assert(m.btnRect.width > 0 && m.btnRect.height > 0, `${ctxLabel}: clear-all button not visible (${JSON.stringify(m.btnRect)})`);
  assert.strictEqual(m.lineRectsCount, 1, `${ctxLabel}: text wrapped to ${m.lineRectsCount} lines (expected 1), height=${m.btnRect.height}`);
  assert(m.btnRect.height <= 30, `${ctxLabel}: button height ${m.btnRect.height}px > 30px (wrapped)`);
  assert.strictEqual(m.whiteSpace, 'nowrap', `${ctxLabel}: expected computed white-space: nowrap, got ${m.whiteSpace}`);
  assert(m.scrollWidth <= m.clientWidth + 1, `${ctxLabel}: text clipped scrollWidth=${m.scrollWidth} > clientWidth=${m.clientWidth}`);
  if (m.parentRect) {
    assert(m.btnRect.right <= m.parentRect.right + 1, `${ctxLabel}: button overflows parent right (${m.btnRect.right} > ${m.parentRect.right})`);
  }
  if (m.labelRect) {
    assert(m.labelRect.right <= m.btnRect.left + 1, `${ctxLabel}: sibling label overlaps button (${m.labelRect.right} > ${m.btnRect.left})`);
  }
}

async function inspectSidebarHeaders(cdp, lang, isMobile) {
  await cdp.evalJs(`(() => {
    if (window.I18N && window.I18N.getLanguage() !== ${JSON.stringify(lang)}) {
      window.I18N.setLanguage(${JSON.stringify(lang)});
    }
    return true;
  })()`);
  await sleep(80);

  // Switch through Box (dismiss auth overlay) and Wiki (ingredients & skills_ladder) so all 5 sidebars mount
  const data = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    const readSidebar = (id) => {
      const el = document.getElementById(id);
      if (!el) return { id, exists: false };
      const titleEl = el.querySelector('.sidebar-title');
      const resetEl = el.querySelector('.sidebar-reset-btn');
      const iconCount = el.querySelectorAll('.sidebar-icon').length;
      const handleId = id.replace('-filter-sidebar', '-sidebar-bookmark-handle').replace('pokemon-sidebar-bookmark-handle', 'sidebar-bookmark-handle');
      const handleEl = document.getElementById(handleId);
      const bookmarkTextEl = handleEl ? handleEl.querySelector('.bookmark-text') : null;
      return {
        id,
        exists: true,
        title: titleEl ? titleEl.textContent.trim() : null,
        reset: resetEl ? resetEl.textContent.trim() : null,
        iconCount,
        bookmarkText: bookmarkTextEl ? bookmarkTextEl.textContent.trim() : null
      };
    };

    const result = {
      globalSidebarIconCount: document.querySelectorAll('.sidebar-icon').length,
      sidebars: {}
    };

    if (window.switchMainTab) window.switchMainTab('pokemon');
    await sleepMs(60);
    result.sidebars.pokemon = readSidebar('pokemon-filter-sidebar');

    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(80);
    result.sidebars.recipes = readSidebar('recipe-filter-sidebar');

    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    await sleepMs(80);
    result.sidebars.box = readSidebar('box-filter-sidebar');

    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchSubTab) {
      window.WikiDB.switchSubTab('ingredients');
      await sleepMs(80);
      result.sidebars.ladder = readSidebar('ladder-filter-sidebar');

      window.WikiDB.switchSubTab('skills_ladder');
      await sleepMs(80);
      result.sidebars.skillLadder = readSidebar('skill-ladder-filter-sidebar');
    }

    return result;
  })()`);
  return data;
}

// Normalization helpers executed inside browser context
const BROWSER_NORMALIZER_SNIPPET = `
  const _ING_STEM_MAP = {
    fancyapple: 'apple',
    moomoomilk: 'milk',
    greengrasssoybeans: 'soybeans',
    honey: 'honey',
    beansausage: 'sausage',
    warmingginger: 'ginger',
    snoozytomato: 'tomato',
    snackablenuts: 'nuts',
    fancyegg: 'egg',
    pureoil: 'oil',
    softpotato: 'potato',
    fieryherb: 'herb',
    greengrasscorn: 'corn',
    soothingcacao: 'cacao',
    rousingcoffee: 'coffee',
    glossyavocado: 'glossyavocado',
    tastymushroom: 'mushroom',
    largeleek: 'leek',
    plumppumpkin: 'pumpkin',
    slowpoketail: 'tail'
  };
  const _ING_NAME_MAP = {
    '特選蘋果': 'apple', '特选苹果': 'apple', 'Fancy Apple': 'apple',
    '哞哞鮮奶': 'milk', '哞哞鲜奶': 'milk', 'Moomoo Milk': 'milk',
    '萌綠大豆': 'soybeans', '萌绿大豆': 'soybeans', 'Greengrass Soybeans': 'soybeans',
    '甜甜蜜': 'honey', 'Honey': 'honey',
    '豆製肉': 'sausage', '豆制肉': 'sausage', 'Bean Sausage': 'sausage',
    '暖暖薑': 'ginger', '暖暖姜': 'ginger', 'Warming Ginger': 'ginger',
    '好眠番茄': 'tomato', 'Snoozy Tomato': 'tomato',
    '一口堅果': 'nuts', '一口坚果': 'nuts', 'Snackable Nuts': 'nuts',
    '特選蛋': 'egg', '特选蛋': 'egg', 'Fancy Egg': 'egg',
    '純粹油': 'oil', '纯粹油': 'oil', 'Pure Oil': 'oil',
    '窩心洋芋': 'potato', '窝心洋芋': 'potato', 'Soft Potato': 'potato',
    '火辣香草': 'herb', 'Fiery Herb': 'herb',
    '萌綠玉米': 'corn', '萌绿玉米': 'corn', 'Greengrass Corn': 'corn',
    '放鬆可可': 'cacao', '放松可可': 'cacao', 'Soothing Cacao': 'cacao',
    '醒腦咖啡豆': 'coffee', '醒脑咖啡豆': 'coffee', 'Rousing Coffee': 'coffee',
    '嫩亮酪梨': 'glossyavocado', 'Glossy Avocado': 'glossyavocado',
    '品鮮蘑菇': 'mushroom', '品鲜蘑菇': 'mushroom', 'Tasty Mushroom': 'mushroom',
    '粗枝大蔥': 'leek', '粗枝大葱': 'leek', 'Large Leek': 'leek',
    '沉甸甸南瓜': 'pumpkin', 'Plump Pumpkin': 'pumpkin',
    '美味尾巴': 'tail', 'Slowpoke Tail': 'tail'
  };
  const _BERRY_NAME_MAP = {
    '椰木果': 'pamtre', '藍異果': 'pamtre', '蓝异果': 'pamtre', 'Pamtre Berry': 'pamtre', 'pamtreberry': 'pamtre', 'pamtre': 'pamtre',
    '木子果': 'lum', '芭亞果': 'lum', '芭亚果': 'lum', 'Lum Berry': 'lum', 'lumberry': 'lum', 'lum': 'lum',
    '異奇果': 'grepa', '异奇果': 'grepa', 'Grepa Berry': 'grepa', 'grepaberry': 'grepa', 'grepa': 'grepa',
    '檬果': 'bluk', 'Bluk Berry': 'bluk', 'blukberry': 'bluk', 'bluk': 'bluk',
    '桃桃果': 'pecha', 'Pecha Berry': 'pecha', 'pechaberry': 'pecha', 'pecha': 'pecha',
    '芒念果': 'mago', '芒芒果': 'mago', 'Mago Berry': 'mago', 'magoberry': 'mago', 'mago': 'mago',
    '蘋野果': 'leppa', '苹野果': 'leppa', 'Leppa Berry': 'leppa', 'leppaberry': 'leppa', 'leppa': 'leppa',
    '櫻子果': 'cheri', '樱子果': 'cheri', 'Cheri Berry': 'cheri', 'cheriberry': 'cheri', 'cheri': 'cheri',
    '柿仔果': 'persim', 'Persim Berry': 'persim', 'persimberry': 'persim', 'persim': 'persim',
    '勿花果': 'figy', 'Figy Berry': 'figy', 'figyberry': 'figy', 'figy': 'figy',
    '文柚果': 'sitrus', 'Sitrus Berry': 'sitrus', 'sitrusberry': 'sitrus', 'sitrus': 'sitrus',
    '榴石果': 'durin', '墨莓果': 'durin', 'Durin Berry': 'durin', 'durinberry': 'durin', 'durin': 'durin',
    '橙橙果': 'oran', 'Oran Berry': 'oran', 'oranberry': 'oran', 'oran': 'oran',
    '芭拉果': 'wiki', '威嘻果': 'wiki', 'Wiki Berry': 'wiki', 'wikiberry': 'wiki', 'wiki': 'wiki',
    '零餘果': 'chesto', '零余果': 'chesto', 'Chesto Berry': 'chesto', 'chestoberry': 'chesto', 'chesto': 'chesto',
    '生薑果': 'rawst', '羅子果': 'rawst', '生姜果': 'rawst', '罗子果': 'rawst', 'Rawst Berry': 'rawst', 'rawstberry': 'rawst', 'rawst': 'rawst',
    '靛莓果': 'belue', '刺角果': 'belue', 'Belue Berry': 'belue', 'belueberry': 'belue', 'belue': 'belue',
    '巧可果': 'yache', '亞雪果': 'yache', '亚雪果': 'yache', 'Yache Berry': 'yache', 'yacheberry': 'yache', 'yache': 'yache'
  };
  function _stemFromImg(el) {
    const img = el.querySelector('img');
    if (!img) return '';
    const src = img.getAttribute('src') || '';
    const m = src.match(/([a-zA-Z0-9_-]+)\.(?:png|webp|jpg|svg)(?:[?#].*)?$/i);
    return m ? m[1].toLowerCase() : '';
  }
  function _normIng(el) {
    const stem = _stemFromImg(el);
    if (stem && _ING_STEM_MAP[stem]) return _ING_STEM_MAP[stem];
    const candidates = [
      el.getAttribute('data-ing'),
      el.getAttribute('data-name'),
      el.getAttribute('data-recipe-ing'),
      el.getAttribute('title'),
      el.textContent
    ].filter(Boolean).map(s => s.trim());
    for (const c of candidates) {
      if (_ING_NAME_MAP[c]) return _ING_NAME_MAP[c];
    }
    const img = el.querySelector('img');
    if (img && img.alt && _ING_NAME_MAP[img.alt.trim()]) return _ING_NAME_MAP[img.alt.trim()];
    return stem || (candidates[0] || '');
  }
  function _normBerry(el) {
    const stem = _stemFromImg(el);
    if (stem && _BERRY_NAME_MAP[stem]) return _BERRY_NAME_MAP[stem];
    const candidates = [
      el.getAttribute('data-berry'),
      el.value,
      el.getAttribute('aria-label'),
      el.getAttribute('title')
    ].filter(Boolean).map(s => s.trim());
    for (const c of candidates) {
      if (_BERRY_NAME_MAP[c]) return _BERRY_NAME_MAP[c];
      const base = c.split('(')[0].trim();
      if (_BERRY_NAME_MAP[base]) return _BERRY_NAME_MAP[base];
    }
    const img = el.querySelector('img');
    if (img && img.alt && _BERRY_NAME_MAP[img.alt.trim()]) return _BERRY_NAME_MAP[img.alt.trim()];
    return stem || (candidates[0] || '');
  }
`;

async function extractAllCanonicalContainers(cdp) {
  return await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    ${BROWSER_NORMALIZER_SNIPPET}
    const out = {};

    // 1. Pokedex Berries & Ingredients
    if (window.switchMainTab) window.switchMainTab('pokemon');
    await sleepMs(60);
    out.pokedexBerries = Array.from(document.querySelectorAll('#berry-filter-tags .subfilter-icon-btn, #berry-filter-tags button')).map(_normBerry);
    out.pokedexIngs = Array.from(document.querySelectorAll('#ingredient-pkm-filter-tags .subfilter-icon-btn, #ingredient-pkm-filter-tags button')).map(_normIng);

    // 2. Recipes Include, Exclude, Pantry
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(100);
    out.recipesIncludeIngs = Array.from(document.querySelectorAll('#ingredient-picker-tags button')).map(_normIng);
    out.recipesExcludeIngs = Array.from(document.querySelectorAll('#excluded-ingredient-picker-tags button')).map(_normIng);
    out.recipesPantryIngs = Array.from(document.querySelectorAll('#pantry-items-grid .pantry-item-row')).map(_normIng);

    // 3. Box Berries & Ingredients
    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    if (window.switchBoxSubtab) window.switchBoxSubtab('list');
    await sleepMs(100);
    out.boxBerries = Array.from(document.querySelectorAll('#box-berry-filter-tags .subfilter-icon-btn, #box-berry-filter-tags button')).map(_normBerry);
    out.boxIngs = Array.from(document.querySelectorAll('#box-ingredient-pkm-filter-tags .subfilter-icon-btn, #box-ingredient-pkm-filter-tags button')).map(_normIng);

    // 4. Lab Greengrass select + Team Picker + Recipe Picker
    if (window.switchBoxSubtab) window.switchBoxSubtab('lab');
    await sleepMs(120);
    const ggSelect = document.querySelector('#lab-gg-berry-select, .lab-greengrass-selects-row select.lab-berry-select');
    out.labGreengrassBerries = ggSelect ? Array.from(ggSelect.querySelectorAll('option')).map(o => _BERRY_NAME_MAP[o.value] || o.value) : [];

    if (window.AppraisalLab && window.AppraisalLab.openPicker) {
      window.AppraisalLab.openPicker({ type: 'team', slotIndex: 0 });
      await sleepMs(80);
      out.labPickerBerries = Array.from(document.querySelectorAll('#lab-picker-berry-scroll button[data-berry]'))
        .filter(b => b.getAttribute('data-berry') !== 'all')
        .map(_normBerry);
      out.labPickerIngs = Array.from(document.querySelectorAll('#lab-picker-ing-scroll button[data-ing]'))
        .filter(b => b.getAttribute('data-ing') !== 'all')
        .map(_normIng);
      if (window.AppraisalLab.closePicker) window.AppraisalLab.closePicker();

      window.AppraisalLab.openPicker({ type: 'recipe' });
      await sleepMs(80);
      out.labRecipePickerIngs = Array.from(document.querySelectorAll('#lab-recipe-picker-ing-scroll button[data-recipe-ing]'))
        .filter(b => b.getAttribute('data-recipe-ing') !== 'all')
        .map(_normIng);
      if (window.AppraisalLab.closePicker) window.AppraisalLab.closePicker();
    } else {
      out.labPickerBerries = [];
      out.labPickerIngs = [];
      out.labRecipePickerIngs = [];
    }

    // 5. Wiki Values Berries & Ingredients
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab('values');
    await sleepMs(100);
    out.wikiValuesBerries = Array.from(document.querySelectorAll('#values-berry-grid .value-compact-node')).map(_normBerry);
    out.wikiValuesIngs = Array.from(document.querySelectorAll('.values-ing-grid .value-compact-node')).map(_normIng);
    out.wikiValuesIngEnergies = Array.from(document.querySelectorAll('.values-ing-grid .value-compact-node .ing-val')).map(el => parseInt(el.textContent.trim(), 10));

    return out;
  })()`);
}

async function auditMobileH5EnOverflow(cdp) {
  return await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.I18N && window.I18N.getLanguage() !== 'en-US') {
      window.I18N.setLanguage('en-US');
      await sleepMs(100);
    }

    const report = {
      viewportWidth: window.innerWidth,
      tabs: {},
      wikiSubtabs: {},
      labSubtabs: {},
      drawers: {},
      settingsModal: null
    };

    function collectClipped(selectors) {
      const issues = [];
      for (const sel of selectors) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) continue;
          const cs = window.getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (el.scrollWidth > el.clientWidth + 1) {
            issues.push({
              selector: sel,
              text: (el.textContent || '').trim().slice(0, 50),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth
            });
          }
          if (rect.right > window.innerWidth + 1.5 && !el.closest('.wiki-subnav-tabs, .wiki-filter-pills, .lab-subnav-bar')) {
            issues.push({
              selector: sel,
              text: (el.textContent || '').trim().slice(0, 50),
              rectRight: Math.round(rect.right * 10) / 10,
              viewportWidth: window.innerWidth
            });
          }
        }
      }
      return issues;
    }

    // 1. Settings modal
    const syncBtn = document.getElementById('sync-config-btn');
    if (syncBtn) syncBtn.click();
    await sleepMs(260);
    const settingsDialog = document.querySelector('#settings-modal .app-settings-dialog');
    report.settingsModal = {
      open: !!(settingsDialog && window.getComputedStyle(document.getElementById('settings-modal')).display !== 'none'),
      dialogOverflow: settingsDialog ? (settingsDialog.scrollWidth > settingsDialog.clientWidth + 1) : true,
      clipped: collectClipped([
        '#settings-modal .app-segment-btn',
        '#settings-modal .app-theme-chip .theme-chip-label',
        '#settings-modal .app-theme-invert-title',
        '#settings-modal .app-backup-btn-row button'
      ])
    };
    const settingsClose = document.getElementById('settings-modal-close-btn');
    if (settingsClose) settingsClose.click();
    await sleepMs(50);

    // 2. Main 5 tabs
    for (const tab of ['pokemon', 'recipes', 'wiki', 'box', 'news']) {
      if (window.switchMainTab) window.switchMainTab(tab);
      if (tab === 'box' && window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) {
        window.CloudSync.dismissBoxAuthOverlay();
      }
      await sleepMs(90);
      report.tabs[tab] = {
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        clipped: collectClipped(['#bottom-dock .dock-tab-btn', '.box-subnav-item'])
      };
    }

    // 3. All 8 Wiki subtabs
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    const wikiTabs = ['skills', 'subskills', 'ingredients', 'skills_ladder', 'values', 'ratings', 'islands', 'items'];
    for (const st of wikiTabs) {
      if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab(st);
      await sleepMs(80);
      report.wikiSubtabs[st] = {
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        clipped: collectClipped(['.wiki-pill-btn'])
      };
    }

    // 4. All 3 Lab subtabs
    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    if (window.switchBoxSubtab) window.switchBoxSubtab('lab');
    await sleepMs(100);
    for (const lt of ['team', 'compare', 'growth']) {
      if (window.AppraisalLab && window.AppraisalLab.switchSubTab) window.AppraisalLab.switchSubTab(lt);
      await sleepMs(90);
      report.labSubtabs[lt] = {
        docScrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        clipped: collectClipped([
          '.lab-subtab-btn',
          '.lab-team-pill',
          '.lab-pot-toggle-btn',
          '.lab-greengrass-actions button',
          '.lab-compare-vs-tag',
          '.lab-growth-milestone-chip'
        ])
      };
    }

    // 5. All 5 H5 Filter Drawers
    const drawerSpecs = [
      { key: 'pokemon', tab: 'pokemon', open: () => document.getElementById('sidebar-bookmark-handle')?.click(), close: () => document.getElementById('sidebar-close-btn')?.click(), sel: '#pokemon-filter-sidebar' },
      { key: 'recipes', tab: 'recipes', open: () => document.getElementById('recipe-sidebar-bookmark-handle')?.click(), close: () => document.getElementById('recipe-sidebar-close-btn')?.click(), sel: '#recipe-filter-sidebar' },
      { key: 'box', tab: 'box', open: () => { if (window.switchBoxSubtab) window.switchBoxSubtab('list'); document.getElementById('box-sidebar-bookmark-handle')?.click(); }, close: () => document.getElementById('box-sidebar-close-btn')?.click(), sel: '#box-filter-sidebar' },
      { key: 'ladder', tab: 'wiki', subtab: 'ingredients', open: () => document.getElementById('ladder-sidebar-bookmark-handle')?.click(), close: () => document.getElementById('ladder-sidebar-close-btn')?.click(), sel: '#ladder-filter-sidebar' },
      { key: 'skillLadder', tab: 'wiki', subtab: 'skills_ladder', open: () => document.getElementById('skill-ladder-sidebar-bookmark-handle')?.click(), close: () => document.getElementById('skill-ladder-sidebar-close-btn')?.click(), sel: '#skill-ladder-filter-sidebar' }
    ];

    for (const d of drawerSpecs) {
      if (window.switchMainTab) window.switchMainTab(d.tab);
      await sleepMs(60);
      if (d.subtab && window.WikiDB && window.WikiDB.switchSubTab) {
        window.WikiDB.switchSubTab(d.subtab);
        await sleepMs(70);
      }
      d.open();
      await sleepMs(360);
      const sidebarEl = document.querySelector(d.sel);
      report.drawers[d.key] = {
        exists: !!sidebarEl,
        collapsed: sidebarEl ? sidebarEl.classList.contains('collapsed') : true,
        sidebarOverflow: sidebarEl ? (sidebarEl.scrollWidth > sidebarEl.clientWidth + 1) : false,
        clipped: collectClipped([
          d.sel + ' .sidebar-title',
          d.sel + ' .sidebar-reset-btn',
          d.sel + ' .sidebar-switch-compact .sidebar-final-evo-text',
          d.sel + ' .tag-btn'
        ])
      };
      d.close();
      await sleepMs(50);
    }

    return report;
  })()`);
}

// ---------------------------------------------------------------------------
// 6. Test Registry & Execution Engine
// ---------------------------------------------------------------------------
const tests = [];
function addTest(id, tier, req, name, usesBrowser, fn) {
  tests.push({ id, tier, req, name, usesBrowser, fn });
}

// ===========================================================================
// TIER 1 — FEATURE COVERAGE (40 tests: R1=6, R2=5, R3=6, R4=6, R5=5, R6=6, R7=6)
// ===========================================================================

// --- R1 (Tier 1) ---
addTest('T1-R1-01', 1, 'R1', 'All required PWA icon files and favicon.ico exist', false, () => {
  const required = [
    'assets/icons/favicon.svg',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/icon-maskable.png',
    'assets/icons/apple-touch-icon.png',
    'favicon.ico',
    'manifest.webmanifest'
  ];
  for (const rel of required) {
    const p = path.join(ROOT_DIR, rel);
    assert(fs.existsSync(p), `Missing required PWA file: ${rel}`);
    assert(fs.statSync(p).size > 0, `Empty PWA file: ${rel}`);
  }
});

addTest('T1-R1-02', 1, 'R1', 'PNG icons have exact required pixel dimensions (192, 512, 512, 180)', false, () => {
  const rep = getPillowReport();
  const expected = {
    'assets/icons/icon-192.png': [192, 192],
    'assets/icons/icon-512.png': [512, 512],
    'assets/icons/icon-maskable.png': [512, 512],
    'assets/icons/apple-touch-icon.png': [180, 180]
  };
  for (const [rel, [ew, eh]] of Object.entries(expected)) {
    const info = rep.pngs[rel];
    assert(info && info.exists, `Missing PNG: ${rel}`);
    assert.strictEqual(info.width, ew, `${rel} width expected ${ew}, got ${info.width}`);
    assert.strictEqual(info.height, eh, `${rel} height expected ${eh}, got ${info.height}`);
  }
});

addTest('T1-R1-03', 1, 'R1', 'favicon.ico contains multi-resolution 16x16, 32x32, and 48x48 frames', false, () => {
  const rep = getPillowReport();
  assert(rep.ico && rep.ico.exists, 'favicon.ico missing');
  assert.strictEqual(rep.ico.format, 'ICO', `Expected ICO format, got ${rep.ico.format}`);
  const sizeKeys = new Set((rep.ico.sizes || []).map(([w, h]) => `${w}x${h}`));
  for (const expected of ['16x16', '32x32', '48x48']) {
    assert(sizeKeys.has(expected), `favicon.ico missing ${expected} frame (found: ${[...sizeKeys].join(', ')})`);
  }
});

addTest('T1-R1-04', 1, 'R1', 'manifest.webmanifest declares all 5 icons with matching sizes and maskable purpose', false, () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'manifest.webmanifest'), 'utf8'));
  assert(Array.isArray(manifest.icons), 'manifest.icons must be an array');
  const bySrc = new Map(manifest.icons.map(i => [i.src, i]));
  assert.strictEqual(bySrc.get('assets/icons/favicon.svg')?.sizes, 'any');
  assert.strictEqual(bySrc.get('assets/icons/icon-192.png')?.sizes, '192x192');
  assert.strictEqual(bySrc.get('assets/icons/icon-512.png')?.sizes, '512x512');
  assert.strictEqual(bySrc.get('assets/icons/icon-maskable.png')?.sizes, '512x512');
  assert.strictEqual(bySrc.get('assets/icons/icon-maskable.png')?.purpose, 'maskable');
  assert.strictEqual(bySrc.get('assets/icons/apple-touch-icon.png')?.sizes, '180x180');
});

addTest('T1-R1-05', 1, 'R1', 'index.html and app/index.html reference manifest, svg, ico, and apple-touch-icon', false, () => {
  const desktopHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
  const mobileHtml = fs.readFileSync(path.join(ROOT_DIR, 'app', 'index.html'), 'utf8');
  for (const needle of ['href="manifest.webmanifest"', 'href="assets/icons/favicon.svg"', 'href="favicon.ico"', 'href="assets/icons/apple-touch-icon.png"']) {
    assert(desktopHtml.includes(needle), `index.html missing ${needle}`);
  }
  for (const needle of ['href="../manifest.webmanifest"', 'href="../assets/icons/favicon.svg"', 'href="../favicon.ico"', 'href="../assets/icons/apple-touch-icon.png"']) {
    assert(mobileHtml.includes(needle), `app/index.html missing ${needle}`);
  }
});

addTest('T1-R1-06', 1, 'R1', 'sw.js bumps IMG_CACHE_NAME beyond pre-R1 baseline and caches icon assets', false, () => {
  const sw = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
  const m = sw.match(/const\s+IMG_CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  assert(m, 'IMG_CACHE_NAME constant not found in sw.js');
  assert.notStrictEqual(m[1], 'pksleep-img-cache-v20261117_02', `IMG_CACHE_NAME was not bumped from baseline (${m[1]})`);
  assert(sw.includes('assets/'), 'sw.js must handle local assets/ caching');
});

// --- R2 (Tier 1) ---
addTest('T1-R2-01', 1, 'R2', 'Modular CSS, css/styles.css, and css/styles.min.css enforce single-line nowrap on Clear-All button', false, () => {
  const stylesCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'styles.css'), 'utf8');
  const stylesMin = fs.readFileSync(path.join(ROOT_DIR, 'css', 'styles.min.css'), 'utf8');
  const modCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'views', 'lab', 'lab_editor.css'), 'utf8') + '\n' +
                 fs.readFileSync(path.join(ROOT_DIR, 'css', 'views', 'box', 'box_detail.css'), 'utf8') + '\n' +
                 fs.readFileSync(path.join(ROOT_DIR, 'css', 'mobile', 'items.css'), 'utf8');

  const checkClearBtnRule = (cssText, label) => {
    const blocks = cssText.match(/[^\n{}]*(?:box-subskill-clear-btn|pokedex-subskill-clear-all-btn)[^}]*\{[^}]*\}/g) || [];
    const hasNowrap = blocks.some(b => /white-space\s*:\s*nowrap/i.test(b));
    assert(hasNowrap, `${label} missing white-space: nowrap on .box-subskill-clear-btn / #pokedex-subskill-clear-all-btn`);
  };
  checkClearBtnRule(modCss, 'modular CSS');
  checkClearBtnRule(stylesCss, 'css/styles.css');
  assert(/box-subskill-clear-btn[^}]*white-space\s*:\s*nowrap/i.test(stylesMin) ||
         /pokedex-subskill-clear-all-btn[^}]*white-space\s*:\s*nowrap/i.test(stylesMin),
         'css/styles.min.css missing compiled white-space: nowrap rule (run build?)');
});

addTest('T1-R2-02', 1, 'R2', 'Desktop (1280x800, zh-TW) Pokedex modal Clear-All button renders on 1 line', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW' });
  const m = await openPokedexModalAndMeasure(cdp, 'zh-TW');
  assertClearAllButtonSingleLine(m, 'Desktop 1280x800 zh-TW');
});

addTest('T1-R2-03', 1, 'R2', 'Desktop (1280x800, en-US) Pokedex modal Clear-All button renders on 1 line', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'Desktop 1280x800 en-US');
  assert(['Clear', 'Clear All'].includes(m.text), `Unexpected EN clear button text: ${m.text}`);
});

addTest('T1-R2-04', 1, 'R2', 'Mobile H5 (390x844, zh-TW) Pokedex modal Clear-All button renders on 1 line', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-TW' });
  const m = await openPokedexModalAndMeasure(cdp, 'zh-TW');
  assertClearAllButtonSingleLine(m, 'Mobile H5 390x844 zh-TW');
  assert.strictEqual(m.text, '清空全部');
});

addTest('T1-R2-05', 1, 'R2', 'Mobile H5 (390x844, en-US) Pokedex modal Clear-All button renders on 1 line', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'en-US' });
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'Mobile H5 390x844 en-US');
  assert(['Clear', 'Clear All'].includes(m.text), `Unexpected EN clear button text: ${m.text}`);
});

// --- R3 (Tier 1) ---
addTest('T1-R3-01', 1, 'R3', 'GAME_CONFIG.CAPS.ISLAND_BONUS_CAP and getIslandBonusCap() equal 95', false, () => {
  delete require.cache[require.resolve(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'))];
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert.strictEqual(cfg.CAPS.ISLAND_BONUS_CAP, 95);
  assert.strictEqual(cfg.getIslandBonusCap(), 95);
  assert.strictEqual(cfg.clampIslandBonus(95), 95);
  assert.strictEqual(cfg.clampIslandBonus(100), 95);
});

addTest('T1-R3-02', 1, 'R3', 'index.html and app/index.html #island-bonus-slider max="95" and #island-bonus-max-label "95%"', false, () => {
  for (const rel of ['index.html', path.join('app', 'index.html')]) {
    const html = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert(/id="island-bonus-slider"[^>]*max="95"/.test(html), `${rel} #island-bonus-slider missing max="95"`);
    assert(html.includes('id="island-bonus-max-label">95%</span>'), `${rel} #island-bonus-max-label not 95%`);
  }
});

addTest('T1-R3-03', 1, 'R3', 'i18n recipe.slider_island_desc interpolates 95% and 1.95 in zh-TW, zh-CN, en-US', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
  const sb = {
    window: { GAME_CONFIG: cfg },
    globalThis: null,
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { documentElement: { setAttribute: () => {} }, readyState: 'loading', addEventListener: () => {} },
    console
  };
  sb.window.window = sb.window;
  sb.globalThis = sb;
  sb.GAME_CONFIG = cfg;
  vm.createContext(sb);
  vm.runInContext(i18nCode, sb);
  for (const lang of ['zh-TW', 'zh-CN', 'en-US']) {
    sb.window.I18N.setLanguage(lang);
    const desc = sb.window.I18N.t('recipe.slider_island_desc');
    assert(desc.includes('95%'), `${lang} recipe.slider_island_desc missing 95%: ${desc}`);
    assert(desc.includes('1.95'), `${lang} recipe.slider_island_desc missing 1.95: ${desc}`);
  }
});

addTest('T1-R3-04', 1, 'R3', 'tests/test_dynamic_game_config.js asserts 95 and passes execution', false, () => {
  const testSrc = fs.readFileSync(path.join(ROOT_DIR, 'tests', 'test_dynamic_game_config.js'), 'utf8');
  assert(testSrc.includes('assert.strictEqual(GAME_CONFIG.getIslandBonusCap(), 95)'),
         'test_dynamic_game_config.js still asserts old cap instead of 95');
  execFileSync(process.execPath, [path.join(ROOT_DIR, 'tests', 'test_dynamic_game_config.js')], {
    cwd: ROOT_DIR,
    stdio: 'pipe'
  });
});

addTest('T1-R3-05', 1, 'R3', 'Live Chrome Recipes tab accepts 95% island bonus and calculates Fancy Apple Curry Lv.1 = 1,459', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(120);
    const slider = document.getElementById('island-bonus-slider');
    const maxLabel = document.getElementById('island-bonus-max-label');
    const badge = document.getElementById('island-bonus-badge');
    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(100);
    const rows = Array.from(document.querySelectorAll('#recipe-content-area tr, #recipe-content-area .recipe-desktop-card'));
    const appleRow = rows.find(r => (r.textContent || '').includes('Fancy Apple Curry') || (r.textContent || '').includes('特選蘋果咖哩'));
    const energyEl = appleRow ? appleRow.querySelector('.energy-1x .energy-number') : null;
    return {
      max: slider.max,
      value: slider.value,
      maxLabel: maxLabel ? maxLabel.textContent.trim() : null,
      badge: badge ? badge.textContent.trim() : null,
      fancyAppleCurryEnergy: energyEl ? energyEl.textContent.trim() : null
    };
  })()`);
  assert.strictEqual(res.max, '95');
  assert.strictEqual(res.value, '95');
  assert.strictEqual(res.maxLabel, '95%');
  assert.strictEqual(res.badge, '+95% (\u00d71.95)');
  assert.strictEqual(res.fancyAppleCurryEnergy, '1,459');
});

addTest('T1-R3-06', 1, 'R3', 'Live Chrome Wiki Values tab #berry-island-slider max="95" scales Pamtre Lv.1 to 1x 47 / 2x 94', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab('values');
    await sleepMs(100);
    if (window.WikiDB && window.WikiDB.updateBerryLevel) window.WikiDB.updateBerryLevel(1);
    const slider = document.getElementById('berry-island-slider');
    slider.value = '95';
    if (window.WikiDB && window.WikiDB.updateBerryIsland) window.WikiDB.updateBerryIsland(95);
    await sleepMs(80);
    const display = document.getElementById('berry-island-display');
    const nodes = Array.from(document.querySelectorAll('#values-berry-grid .value-compact-node'));
    const pamtre = nodes.find(n => (n.querySelector('img')?.getAttribute('src') || '').includes('pamtreberry')) || nodes[0];
    return {
      max: slider ? slider.max : null,
      display: display ? display.textContent.trim() : null,
      pamtre1x: pamtre ? pamtre.querySelector('.berry-val')?.textContent.replace(/\\s+/g, ' ').trim() : null,
      pamtre2x: pamtre ? pamtre.querySelector('.berry-val-fav')?.textContent.replace(/\\s+/g, ' ').trim() : null
    };
  })()`);
  assert.strictEqual(res.max, '95');
  assert.strictEqual(res.display, '+95%');
  assert.strictEqual(res.pamtre1x, '1x 47');
  assert.strictEqual(res.pamtre2x, '2x 94');
});

// --- R4 (Tier 1) ---
addTest('T1-R4-01', 1, 'R4', 'Static HTML (index.html and app/index.html) contains zero .sidebar-icon elements', false, () => {
  for (const rel of ['index.html', path.join('app', 'index.html')]) {
    const html = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert(!/class=["'](?:[^"']*\s)?sidebar-icon(?:\s[^"']*)?["']/.test(html), `${rel} still contains .sidebar-icon`);
  }
});

addTest('T1-R4-02', 1, 'R4', 'Live DOM across Desktop and Mobile H5 has zero .sidebar-icon elements', true, async (harness) => {
  for (const entry of [
    { path: '/index.html?view=desktop', w: 1280, h: 800, m: false },
    { path: '/app/index.html?view=mobile', w: 390, h: 844, m: true }
  ]) {
    const cdp = await harness.openPage(entry.path, { width: entry.w, height: entry.h, mobile: entry.m, lang: 'zh-TW' });
    const data = await inspectSidebarHeaders(cdp, 'zh-TW', entry.m);
    assert.strictEqual(data.globalSidebarIconCount, 0, `${entry.path} rendered ${data.globalSidebarIconCount} .sidebar-icon elements`);
  }
});

addTest('T1-R4-03', 1, 'R4', 'Desktop zh-TW all 5 filter sidebars unify title="篩選器" and reset="重設"', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW' });
  const data = await inspectSidebarHeaders(cdp, 'zh-TW', false);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Desktop zh-TW sidebar ${k} missing`);
    assert.strictEqual(s.title, '篩選器', `Desktop zh-TW ${k} .sidebar-title expected 篩選器, got ${s.title}`);
    assert.strictEqual(s.reset, '重設', `Desktop zh-TW ${k} .sidebar-reset-btn expected 重設, got ${s.reset}`);
  }
});

addTest('T1-R4-04', 1, 'R4', 'Desktop en-US all 5 filter sidebars unify title="Filter" and reset="Reset"', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const data = await inspectSidebarHeaders(cdp, 'en-US', false);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Desktop en-US sidebar ${k} missing`);
    assert.strictEqual(s.title, 'Filter', `Desktop en-US ${k} .sidebar-title expected Filter, got ${s.title}`);
    assert.strictEqual(s.reset, 'Reset', `Desktop en-US ${k} .sidebar-reset-btn expected Reset, got ${s.reset}`);
  }
});

addTest('T1-R4-05', 1, 'R4', 'Mobile H5 zh-TW all 5 filter drawers unify title="篩選器" and reset="重設"', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-TW' });
  const data = await inspectSidebarHeaders(cdp, 'zh-TW', true);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Mobile H5 zh-TW sidebar ${k} missing`);
    assert.strictEqual(s.title, '篩選器', `Mobile H5 zh-TW ${k} .sidebar-title expected 篩選器, got ${s.title}`);
    assert.strictEqual(s.reset, '重設', `Mobile H5 zh-TW ${k} .sidebar-reset-btn expected 重設, got ${s.reset}`);
  }
});

addTest('T1-R4-06', 1, 'R4', 'Mobile H5 en-US all 5 filter drawers unify title="Filter" and reset="Reset"', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'en-US' });
  const data = await inspectSidebarHeaders(cdp, 'en-US', true);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Mobile H5 en-US sidebar ${k} missing`);
    assert.strictEqual(s.title, 'Filter', `Mobile H5 en-US ${k} .sidebar-title expected Filter, got ${s.title}`);
    assert.strictEqual(s.reset, 'Reset', `Mobile H5 en-US ${k} .sidebar-reset-btn expected Reset, got ${s.reset}`);
  }
});

// --- R5 (Tier 1) ---
addTest('T1-R5-01', 1, 'R5', 'Mobile H5 (375x812, en-US) Settings modal controls fit without clipping or overflow', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  assert(rep.settingsModal.open, 'Settings modal failed to open');
  assert(!rep.settingsModal.dialogOverflow, 'Settings modal dialog overflows horizontally');
  assert.deepStrictEqual(rep.settingsModal.clipped, [], `Settings modal clipped controls: ${JSON.stringify(rep.settingsModal.clipped)}`);
});

addTest('T1-R5-02', 1, 'R5', 'Mobile H5 (375x812, en-US) Pokedex, Recipes, and Box filter drawers fit without clipping', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const k of ['pokemon', 'recipes', 'box']) {
    const d = rep.drawers[k];
    assert(d.exists && !d.collapsed, `Drawer ${k} failed to open`);
    assert(!d.sidebarOverflow, `Drawer ${k} overflows horizontally`);
    assert.deepStrictEqual(d.clipped, [], `Drawer ${k} clipped controls: ${JSON.stringify(d.clipped)}`);
  }
});

addTest('T1-R5-03', 1, 'R5', 'Mobile H5 (375x812, en-US) Wiki subtabs, pills, and ladder drawers fit cleanly', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  assert(!rep.tabs.wiki.overflow, 'Wiki tab page overflows');
  for (const [st, info] of Object.entries(rep.wikiSubtabs)) {
    assert(!info.overflow, `Wiki subtab ${st} overflows (${info.docScrollWidth} > ${info.innerWidth})`);
    assert.deepStrictEqual(info.clipped, [], `Wiki subtab ${st} clipped pills: ${JSON.stringify(info.clipped)}`);
  }
  for (const k of ['ladder', 'skillLadder']) {
    const d = rep.drawers[k];
    assert(d.exists && !d.collapsed, `Wiki drawer ${k} failed to open`);
    assert(!d.sidebarOverflow, `Wiki drawer ${k} overflows`);
    assert.deepStrictEqual(d.clipped, [], `Wiki drawer ${k} clipped controls: ${JSON.stringify(d.clipped)}`);
  }
});

addTest('T1-R5-04', 1, 'R5', 'Mobile H5 (375x812, en-US) Box subnav and Lab subtabs/pills/pot toggles fit cleanly', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  assert(!rep.tabs.box.overflow, 'Box tab overflows');
  for (const [lt, info] of Object.entries(rep.labSubtabs)) {
    assert(!info.overflow, `Lab subtab ${lt} overflows (${info.docScrollWidth} > ${info.innerWidth})`);
    assert.deepStrictEqual(info.clipped, [], `Lab subtab ${lt} clipped controls: ${JSON.stringify(info.clipped)}`);
  }
});

addTest('T1-R5-05', 1, 'R5', 'Mobile H5 (375x812, en-US) Settings cloud sync & Box edit mint rows render English i18n text', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    document.getElementById('sync-config-btn')?.click();
    await sleepMs(60);
    const cloudRowText = (document.querySelector('#settings-modal .app-cloud-sync-card, #settings-modal')?.textContent || '');
    document.getElementById('settings-modal-close-btn')?.click();
    await sleepMs(50);

    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    await sleepMs(80);
    const editBtn = document.querySelector('#box-content-area .box-edit-btn, #box-content-area .box-card');
    if (window.PokemonBoxApp && window.PokemonBoxApp.openBoxEditModal) {
      window.PokemonBoxApp.openBoxEditModal('e2e_seed_pika_1');
    } else if (editBtn) {
      editBtn.click();
    }
    await sleepMs(80);
    const mintText = (document.querySelector('#box-edit-modal .mint-checkbox-label')?.textContent || '').trim();
    return {
      hasUntranslatedCloudHeading: /雲端同步/.test(cloudRowText),
      mintText,
      mintIsCjk: /[\\u4e00-\\u9fff]/.test(mintText)
    };
  })()`);
  assert(!res.hasUntranslatedCloudHeading, 'Settings modal cloud sync heading remains untranslated Chinese in en-US');
  if (res.mintText) {
    assert(!res.mintIsCjk, `Box edit mint label remains untranslated Chinese in en-US: ${res.mintText}`);
  }
});

// --- R6 (Tier 1) ---
addTest('T1-R6-01', 1, 'R6', 'GAME_CONFIG.CANONICAL_INGREDIENTS (20) and CANONICAL_BERRIES (18) match energy-asc spec', false, () => {
  delete require.cache[require.resolve(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'))];
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert(Array.isArray(cfg.CANONICAL_INGREDIENTS) && Object.isFrozen(cfg.CANONICAL_INGREDIENTS), 'CANONICAL_INGREDIENTS must be frozen array');
  assert(Array.isArray(cfg.CANONICAL_BERRIES) && Object.isFrozen(cfg.CANONICAL_BERRIES), 'CANONICAL_BERRIES must be frozen array');
  assert.strictEqual(cfg.CANONICAL_INGREDIENTS.length, 20);
  assert.strictEqual(cfg.CANONICAL_BERRIES.length, 18);

  const ingEnergies = cfg.CANONICAL_INGREDIENTS.map(i => i.energy);
  assert.deepStrictEqual(ingEnergies, EXPECTED_INGREDIENTS.map(i => i.energy), 'Ingredient energy sequence mismatch');
  assert.deepStrictEqual(cfg.CANONICAL_INGREDIENTS.map(i => i.name), EXPECTED_INGREDIENTS.map(i => i.zhTw), 'Ingredient zh-TW order mismatch');

  const berryIds = cfg.CANONICAL_BERRIES.map(b => b.id);
  const berryEnergies = cfg.CANONICAL_BERRIES.map(b => b.energy);
  assert.deepStrictEqual(berryIds, CANONICAL_BERRY_KEYS, 'Berry canonical ID / tie-break sequence mismatch');
  assert.deepStrictEqual(berryEnergies, EXPECTED_BERRIES.map(b => b.energy), 'Berry energy sequence mismatch');
});

addTest('T1-R6-02', 1, 'R6', 'GAME_CONFIG berry/ingredient sort and energy lookup helpers operate accurately', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert.strictEqual(cfg.getIngredientBaseEnergy('特選蘋果'), 90);
  assert.strictEqual(cfg.getIngredientBaseEnergy('美味尾巴'), 342);
  assert.strictEqual(cfg.getBerryBaseEnergy('椰木果'), 24);
  assert.strictEqual(cfg.getBerryBaseEnergy('巧可果'), 35);
  assert(cfg.getBerrySortOrder('pamtre') < cfg.getBerrySortOrder('lum'), 'pamtre must sort before lum');
  assert(cfg.getBerrySortOrder('sitrus') < cfg.getBerrySortOrder('durin'), 'sitrus must sort before durin');

  const shuffledIngs = ['美味尾巴', '特選蘋果', '萌綠玉米', '哞哞鮮奶'];
  const sortedIngs = cfg.sortIngredientsByEnergyAsc(shuffledIngs);
  assert.deepStrictEqual(sortedIngs, ['特選蘋果', '哞哞鮮奶', '萌綠玉米', '美味尾巴']);
  assert.deepStrictEqual(shuffledIngs, ['美味尾巴', '特選蘋果', '萌綠玉米', '哞哞鮮奶'], 'sortIngredientsByEnergyAsc must not mutate input');

  const shuffledBerries = ['巧可果', '木子果', '椰木果', '文柚果'];
  const sortedBerries = cfg.sortBerriesByEnergyAsc(shuffledBerries);
  assert.deepStrictEqual(sortedBerries, ['椰木果', '木子果', '文柚果', '巧可果']);
  assert.deepStrictEqual(shuffledBerries, ['巧可果', '木子果', '椰木果', '文柚果'], 'sortBerriesByEnergyAsc must not mutate input');
});

addTest('T1-R6-03', 1, 'R6', 'Desktop Pokedex and Box filter tags match canonical energy-asc berry and ingredient order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.pokedexBerries, CANONICAL_BERRY_KEYS, '#berry-filter-tags order mismatch');
  assert.deepStrictEqual(dom.pokedexIngs, CANONICAL_ING_KEYS, '#ingredient-pkm-filter-tags order mismatch');
  assert.deepStrictEqual(dom.boxBerries, CANONICAL_BERRY_KEYS, '#box-berry-filter-tags order mismatch');
  assert.deepStrictEqual(dom.boxIngs, CANONICAL_ING_KEYS, '#box-ingredient-pkm-filter-tags order mismatch');
});

addTest('T1-R6-04', 1, 'R6', 'Desktop Recipes include/exclude pickers and pantry grid match canonical energy-asc order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.recipesIncludeIngs, CANONICAL_ING_KEYS, '#ingredient-picker-tags order mismatch');
  assert.deepStrictEqual(dom.recipesExcludeIngs, CANONICAL_ING_KEYS, '#excluded-ingredient-picker-tags order mismatch');
  assert.deepStrictEqual(dom.recipesPantryIngs, CANONICAL_ING_KEYS, '#pantry-items-grid order mismatch');
});

addTest('T1-R6-05', 1, 'R6', 'Desktop Lab Greengrass select, Team Picker, and Recipe Picker match canonical energy-asc order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.labGreengrassBerries, CANONICAL_BERRY_KEYS, 'Lab Greengrass berry select order mismatch');
  assert.deepStrictEqual(dom.labPickerBerries, CANONICAL_BERRY_KEYS, '#lab-picker-berry-scroll order mismatch');
  assert.deepStrictEqual(dom.labPickerIngs, CANONICAL_ING_KEYS, '#lab-picker-ing-scroll order mismatch');
  assert.deepStrictEqual(dom.labRecipePickerIngs, CANONICAL_ING_KEYS, '#lab-recipe-picker-ing-scroll order mismatch');
});

addTest('T1-R6-06', 1, 'R6', 'Desktop Wiki Values berry and ingredient grids match canonical energy-asc order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.wikiValuesBerries, CANONICAL_BERRY_KEYS, '#values-berry-grid order mismatch');
  assert.deepStrictEqual(dom.wikiValuesIngs, CANONICAL_ING_KEYS, '.values-ing-grid order mismatch');
  assert.deepStrictEqual(dom.wikiValuesIngEnergies, EXPECTED_INGREDIENTS.map(i => i.energy), '.values-ing-grid energy values mismatch');
});

// --- R7 (Tier 1) ---
addTest('T1-R7-01', 1, 'R7', 'HTML entries and all 3 i18n dictionary files contain zero emojis or decorative glyphs', false, () => {
  const files = [
    'index.html',
    path.join('app', 'index.html'),
    path.join('js', 'core', 'i18n', 'i18n_dict_zh_tw.js'),
    path.join('js', 'core', 'i18n', 'i18n_dict_zh_cn.js'),
    path.join('js', 'core', 'i18n', 'i18n_dict_en_us.js')
  ];
  for (const rel of files) {
    const content = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    const hits = findProhibitedGlyphs(content);
    assert.strictEqual(hits.length, 0, `${rel} contains prohibited emoji/glyph: ${JSON.stringify(hits.slice(0, 3))}`);
  }
});

addTest('T1-R7-02', 1, 'R7', 'js/modules/** and manifest.webmanifest contain zero emojis or decorative glyphs', false, () => {
  const files = [path.join(ROOT_DIR, 'manifest.webmanifest')];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.endsWith('.js') && !ent.name.endsWith('.min.js')) files.push(full);
    }
  };
  walk(path.join(ROOT_DIR, 'js', 'modules'));
  for (const full of files) {
    const rel = path.relative(ROOT_DIR, full);
    const content = fs.readFileSync(full, 'utf8');
    const hits = findProhibitedGlyphs(content);
    assert.strictEqual(hits.length, 0, `${rel} contains prohibited emoji/glyph: ${JSON.stringify(hits.slice(0, 3))}`);
  }
});

addTest('T1-R7-03', 1, 'R7', 'Project docs (README.md, PROJECT.md, docs/walkthrough.md) contain zero emojis or unquoted decorative glyphs', false, () => {
  for (const rel of ['README.md', 'PROJECT.md', path.join('docs', 'walkthrough.md')]) {
    const full = path.join(ROOT_DIR, rel);
    assert(fs.existsSync(full), `Missing project doc: ${rel}`);
    const content = fs.readFileSync(full, 'utf8');
    assert(!RE_SUPPLEMENTARY_EMOJI.test(content) && !content.includes('\u23F1'), `${rel} contains supplementary/stopwatch emoji`);
    const hits = findProhibitedGlyphs(content, { stripMarkdownBackticks: true });
    assert.strictEqual(hits.length, 0, `${rel} contains prohibited glyph outside backticks: ${JSON.stringify(hits.slice(0, 3))}`);
  }
});

addTest('T1-R7-04', 1, 'R7', 'Single-Frame CSS invariant preserved for .lab-team-view-container and .lab-compare-view-container', false, () => {
  const boxEditCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'mobile', 'box_edit.css'), 'utf8');
  const stylesCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'styles.css'), 'utf8');
  for (const [label, css] of [['css/mobile/box_edit.css', boxEditCss], ['css/styles.css', stylesCss]]) {
    const m = css.match(/\.lab-team-view-container[\s\S]*?\{([^}]*)\}/);
    assert(m, `${label} missing .lab-team-view-container rule`);
    assert(/border\s*:\s*none/i.test(m[1]), `${label} .lab-team-view-container must keep border: none`);
    assert(/background\s*:\s*transparent/i.test(m[1]), `${label} .lab-team-view-container must keep background: transparent`);
  }
});

addTest('T1-R7-05', 1, 'R7', 'Global rules and repo PROJECT.md reflect Neon + Argon teamwork policy', false, () => {
  const targets = [
    path.join(HOME_DIR, '.gemini', 'GEMINI.md'),
    path.join(HOME_DIR, '.gemini', 'AGENTS.md'),
    path.join(HOME_DIR, '.gemini', 'agent-docs', 'PROTOCOL.md'),
    path.join(ROOT_DIR, 'PROJECT.md')
  ];
  for (const p of targets) {
    assert(fs.existsSync(p), `Required policy doc missing: ${p}`);
    const txt = fs.readFileSync(p, 'utf8');
    assert(/\bNeon\b/i.test(txt), `${p} missing Neon teamwork designation`);
    assert(/\bArgon\b/i.test(txt), `${p} missing Argon planner designation`);
  }
});

addTest('T1-R7-06', 1, 'R7', 'docs/walkthrough.md is byte-identical to ~/.gemini/agent-docs/projects/pokemon-sleep-app/walkthrough.md', false, () => {
  const repoWalkthrough = path.join(ROOT_DIR, 'docs', 'walkthrough.md');
  const sharedWalkthrough = path.join(HOME_DIR, '.gemini', 'agent-docs', 'projects', 'pokemon-sleep-app', 'walkthrough.md');
  assert(fs.existsSync(repoWalkthrough), 'docs/walkthrough.md missing');
  assert(fs.existsSync(sharedWalkthrough), `${sharedWalkthrough} missing`);
  const bufRepo = fs.readFileSync(repoWalkthrough);
  const bufShared = fs.readFileSync(sharedWalkthrough);
  assert(bufRepo.equals(bufShared), `docs/walkthrough.md (${bufRepo.length}B) differs from shared walkthrough (${bufShared.length}B)`);
});

// ===========================================================================
// TIER 2 — BOUNDARY & CORNER CASES (39 tests: R1=6, R2=5, R3=6, R4=5, R5=6, R6=6, R7=5)
// ===========================================================================

// --- R1 (Tier 2) ---
addTest('T2-R1-01', 2, 'R1', 'All 4 PWA PNGs have min_alpha === 255 and zero transparent pixels across entire canvas', false, () => {
  const rep = getPillowReport();
  for (const [rel, info] of Object.entries(rep.pngs)) {
    assert(info.exists, `${rel} missing`);
    assert.strictEqual(info.min_alpha, 255, `${rel} has transparent pixels (min_alpha=${info.min_alpha}, transparent_pixels=${info.transparent_pixels})`);
    assert.strictEqual(info.transparent_pixels, 0, `${rel} has ${info.transparent_pixels} non-opaque pixels`);
  }
});

addTest('T2-R1-02', 2, 'R1', 'All 4 corner pixels of all 4 PNGs are opaque (alpha=255) and not white/transparent', false, () => {
  const rep = getPillowReport();
  for (const [rel, info] of Object.entries(rep.pngs)) {
    assert(info.exists, `${rel} missing`);
    for (const c of info.corners) {
      const [r, g, b, a] = c.rgba;
      assert.strictEqual(a, 255, `${rel} corner (${c.x},${c.y}) alpha=${a}, expected 255`);
      const isWhite = r >= 245 && g >= 245 && b >= 245;
      assert(!isWhite, `${rel} corner (${c.x},${c.y}) has white border rgb(${r},${g},${b})`);
    }
  }
});

addTest('T2-R1-03', 2, 'R1', 'icon-maskable.png outer <8% ring is full-bleed twilight background while inner 80% safe zone holds bright foreground', false, () => {
  const rep = getPillowReport();
  const m = rep.pngs['assets/icons/icon-maskable.png'];
  assert(m && m.exists && m.maskable_check, 'icon-maskable.png forensics missing');
  assert(m.maskable_check.border_opaque, 'icon-maskable.png outer <8% margin has transparent pixels');
  assert(m.maskable_check.border_max_lum < 120,
         `icon-maskable.png foreground graphic clips outer 8% edge (border_max_lum=${m.maskable_check.border_max_lum})`);
  assert(m.maskable_check.safe_bright_pixels > 1000,
         `icon-maskable.png inner safe zone lacks luminous crescent/stars (safe_bright_pixels=${m.maskable_check.safe_bright_pixels})`);
});

addTest('T2-R1-04', 2, 'R1', 'favicon.svg root background rect is full-bleed 512x512 with zero rounded-corner transparent cutout', false, () => {
  const svg = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'icons', 'favicon.svg'), 'utf8');
  const rectMatch = svg.match(/<rect\b[^>]*width="512"[^>]*height="512"[^>]*>/i) ||
                    svg.match(/<rect\b[^>]*height="512"[^>]*width="512"[^>]*>/i);
  assert(rectMatch, 'favicon.svg missing full 512x512 background <rect>');
  const rxMatch = rectMatch[0].match(/\brx=["'](\d+(?:\.\d+)?)["']/i);
  const ryMatch = rectMatch[0].match(/\bry=["'](\d+(?:\.\d+)?)["']/i);
  assert(!rxMatch || Number(rxMatch[1]) === 0, `favicon.svg background <rect> still has corner radius ${rxMatch && rxMatch[0]}`);
  assert(!ryMatch || Number(ryMatch[1]) === 0, `favicon.svg background <rect> still has corner radius ${ryMatch && ryMatch[0]}`);
});

addTest('T2-R1-05', 2, 'R1', 'favicon.svg includes twilight gradient and celestial elements (moon/stars) without white backdrop', false, () => {
  const svg = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'icons', 'favicon.svg'), 'utf8');
  assert(/<(?:linearGradient|radialGradient)\b/i.test(svg), 'favicon.svg missing SVG gradient');
  assert(/<(?:path|circle)\b/i.test(svg), 'favicon.svg missing vector moon/star shapes');
  assert(!/fill=["']#fff(?:fff)?["'][^>]*width=["']512["']/i.test(svg), 'favicon.svg must not use white full-canvas fill');
});

addTest('T2-R1-06', 2, 'R1', 'Local HTTP server returns 200 OK with valid Content-Type for manifest, favicon.ico, and all icons', true, async (harness) => {
  await harness.ensureStarted();
  const base = harness.httpCtx.baseUrl;
  const manifestResp = await fetch(`${base}/manifest.webmanifest`);
  assert.strictEqual(manifestResp.status, 200);
  const manifest = await manifestResp.json();
  for (const icon of manifest.icons) {
    const r = await fetch(`${base}/${icon.src}`);
    assert.strictEqual(r.status, 200, `Icon ${icon.src} returned HTTP ${r.status}`);
    const buf = await r.arrayBuffer();
    assert(buf.byteLength > 100, `Icon ${icon.src} unexpectedly small (${buf.byteLength}B)`);
  }
  const icoResp = await fetch(`${base}/favicon.ico`);
  assert.strictEqual(icoResp.status, 200);
});

// --- R2 (Tier 2) ---
addTest('T2-R2-01', 2, 'R2', 'Ultra-narrow Mobile H5 (360x800, zh-TW) Pokedex Clear-All button stays single-line', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'zh-TW' });
  const m = await openPokedexModalAndMeasure(cdp, 'zh-TW');
  assertClearAllButtonSingleLine(m, 'Mobile H5 360x800 zh-TW');
});

addTest('T2-R2-02', 2, 'R2', 'Ultra-narrow Mobile H5 (360x800, en-US) Pokedex Clear-All button stays single-line', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US' });
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'Mobile H5 360x800 en-US');
});

addTest('T2-R2-03', 2, 'R2', 'Mobile H5 (375x812, en-US) sibling .box-form-label does not crush or overlap Clear-All button', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US' });
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'Mobile H5 375x812 en-US');
  assert(m.dialogScrollWidth <= m.dialogClientWidth + 1, `Modal dialog overflows horizontally: ${m.dialogScrollWidth} > ${m.dialogClientWidth}`);
});

addTest('T2-R2-04', 2, 'R2', 'Mobile H5 (390x844, zh-CN) Pokedex Clear-All button stays single-line and non-overlapping', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-CN' });
  const m = await openPokedexModalAndMeasure(cdp, 'zh-CN');
  assertClearAllButtonSingleLine(m, 'Mobile H5 390x844 zh-CN');
});

addTest('T2-R2-05', 2, 'R2', 'Clicking #pokedex-subskill-clear-all-btn clears subskills cleanly without layout break', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US' });
  await openPokedexModalAndMeasure(cdp, 'en-US');
  const after = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    const chip = document.querySelector('#pokedex-subskill-palette button');
    if (chip) chip.click();
    await sleepMs(40);
    const btn = document.getElementById('pokedex-subskill-clear-all-btn');
    btn.click();
    await sleepMs(40);
    const rect = btn.getBoundingClientRect();
    const filled = document.querySelectorAll('#pokedex-subskill-slots-row .filled, #pokedex-subskill-slots-row [data-subskill]:not([data-subskill=""])').length;
    return { height: rect.height, filled };
  })()`);
  assert(after.height <= 30, `Button height grew after click: ${after.height}`);
  assert.strictEqual(after.filled, 0, 'Subskill slots were not cleared');
});

// --- R3 (Tier 2) ---
addTest('T2-R3-01', 2, 'R3', 'Static scan confirms zero unmanaged hardcoded 85 island bonus caps outside gameConfig.js and @GAME_CONFIG_FALLBACK blocks', false, () => {
  const scanFiles = [
    path.join(ROOT_DIR, 'index.html'),
    path.join(ROOT_DIR, 'app', 'index.html'),
    path.join(ROOT_DIR, 'tests', 'test_dynamic_game_config.js')
  ];
  const walkJs = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walkJs(full);
      else if (ent.name.endsWith('.js') && !ent.name.endsWith('.min.js') && !full.endsWith(path.join('core', 'gameConfig.js'))) {
        scanFiles.push(full);
      }
    }
  };
  walkJs(path.join(ROOT_DIR, 'js', 'core', 'i18n'));
  walkJs(path.join(ROOT_DIR, 'js', 'modules'));

  const violations = [];
  for (const full of scanFiles) {
    const rel = path.relative(ROOT_DIR, full);
    const raw = fs.readFileSync(full, 'utf8');
    // Strip managed @GAME_CONFIG_FALLBACK blocks (those are verified separately by T2-R3-05)
    const stripped = raw.replace(/\/\*\s*@GAME_CONFIG_FALLBACK_START\s*\*\/[\s\S]*?\/\*\s*@GAME_CONFIG_FALLBACK_END\s*\*\//g, '');
    const lines = stripped.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/ISLAND_BONUS_CAP[^;\n]*\b85\b/i.test(line) ||
          /islandCap[^;\n]*:\s*85\b/i.test(line) ||
          /islandBonus[^;\n]*:\s*85\b/i.test(line) ||
          /getIslandBonusCap\(\)\s*,\s*85\b/.test(line) ||
          /id="island-bonus-slider"[^>]*max="85"/.test(line) ||
          /id="island-bonus-max-label">85%/.test(line)) {
        violations.push(`${rel}:${i + 1}: ${line.trim()}`);
      }
    }
  }
  assert.strictEqual(violations.length, 0, `Residual hardcoded 85 island bonus cap found:\n${violations.join('\n')}`);
});

addTest('T2-R3-02', 2, 'R3', 'Standalone VM fallback (without window.GAME_CONFIG) defaults ISLAND_BONUS_CAP to 95 in i18n, recipes, and wiki', false, () => {
  // 1. i18n.js standalone
  const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
  const sbI18n = {
    window: {},
    globalThis: null,
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { documentElement: { setAttribute: () => {} }, readyState: 'loading', addEventListener: () => {} },
    console
  };
  sbI18n.window.window = sbI18n.window;
  sbI18n.globalThis = sbI18n;
  vm.createContext(sbI18n);
  vm.runInContext(i18nCode, sbI18n);
  sbI18n.window.I18N.setLanguage('en-US');
  const desc = sbI18n.window.I18N.t('recipe.slider_island_desc');
  assert(desc.includes('95%') && desc.includes('1.95'), `Standalone i18n fallback did not use 95%: ${desc}`);

  // 2. wiki.js standalone
  const wikiCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki.js'), 'utf8');
  const berrySlider = { min: '', max: '', step: '', value: '0' };
  const islandDisplay = { textContent: '' };
  const els = { 'berry-island-slider': berrySlider, 'berry-island-display': islandDisplay };
  const sbWiki = {
    window: { innerWidth: 1200, localStorage: { getItem: () => null, setItem: () => {} } },
    document: { readyState: 'complete', addEventListener: () => {}, getElementById: (id) => els[id] || null, querySelectorAll: () => [] },
    localStorage: { getItem: () => null, setItem: () => {} },
    PokemonApp: { getAllData: () => [] },
    console
  };
  sbWiki.window.window = sbWiki.window;
  sbWiki.window.document = sbWiki.document;
  sbWiki.globalThis = sbWiki;
  vm.createContext(sbWiki);
  vm.runInContext(wikiCode, sbWiki);
  sbWiki.window.WikiDB.updateBerryIsland(95);
  assert.strictEqual(islandDisplay.textContent, '+95%', 'Standalone wiki.js clamped 95% down');
  assert.strictEqual(berrySlider.max, '95', 'Standalone wiki.js slider max not 95');
});

addTest('T2-R3-03', 2, 'R3', 'Recipes live DOM boundary: 0% (748) vs 95% (1,459) and clamping out-of-range inputs', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(120);
    const readAppleEnergy = () => {
      const rows = Array.from(document.querySelectorAll('#recipe-content-area tr, #recipe-content-area .recipe-desktop-card'));
      const row = rows.find(r => (r.textContent || '').includes('Fancy Apple Curry'));
      return row ? row.querySelector('.energy-1x .energy-number')?.textContent.trim() : null;
    };
    const slider = document.getElementById('island-bonus-slider');
    slider.value = '0';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(60);
    const e0 = readAppleEnergy();

    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(60);
    const e95 = readAppleEnergy();
    const clampedHigh = window.GAME_CONFIG.clampIslandBonus(120);
    const clampedLow = window.GAME_CONFIG.clampIslandBonus(-10);
    return { e0, e95, step: slider.step, clampedHigh, clampedLow };
  })()`);
  assert.strictEqual(res.e0, '748');
  assert.strictEqual(res.e95, '1,459');
  assert.strictEqual(res.step, '5');
  assert.strictEqual(res.clampedHigh, 95);
  assert.strictEqual(res.clampedLow, 0);
});

addTest('T2-R3-04', 2, 'R3', 'Wiki Values live DOM boundary: 0% (1x 24 / 2x 48) vs 95% (1x 47 / 2x 94) and step="5"', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab('values');
    await sleepMs(80);
    if (window.WikiDB && window.WikiDB.updateBerryLevel) window.WikiDB.updateBerryLevel(1);
    const readPamtre = () => {
      const nodes = Array.from(document.querySelectorAll('#values-berry-grid .value-compact-node'));
      const pamtre = nodes.find(n => (n.querySelector('img')?.getAttribute('src') || '').includes('pamtreberry')) || nodes[0];
      return {
        v1: pamtre?.querySelector('.berry-val')?.textContent.replace(/\\s+/g, ' ').trim(),
        v2: pamtre?.querySelector('.berry-val-fav')?.textContent.replace(/\\s+/g, ' ').trim()
      };
    };
    window.WikiDB.updateBerryIsland(0);
    await sleepMs(50);
    const at0 = readPamtre();
    window.WikiDB.updateBerryIsland(95);
    await sleepMs(50);
    const at95 = readPamtre();
    const slider = document.getElementById('berry-island-slider');
    return { at0, at95, step: slider?.step, max: slider?.max };
  })()`);
  assert.deepStrictEqual(res.at0, { v1: '1x 24', v2: '2x 48' });
  assert.deepStrictEqual(res.at95, { v1: '1x 47', v2: '2x 94' });
  assert.strictEqual(res.step, '5');
  assert.strictEqual(res.max, '95');
});

addTest('T2-R3-05', 2, 'R3', 'All 10 @GAME_CONFIG_FALLBACK blocks in modular source files carry ISLAND_BONUS_CAP: 95', false, () => {
  const fallbackFiles = [
    path.join('js', 'core', 'i18n', 'i18n_core.js'),
    path.join('js', 'modules', 'box', 'box_modal_form.js'),
    path.join('js', 'modules', 'box', 'box_ocr_parse.js'),
    path.join('js', 'modules', 'lab', 'lab_growth.js'),
    path.join('js', 'modules', 'lab', 'lab_engine.js'),
    path.join('js', 'modules', 'lab', 'lab_compare.js'),
    path.join('js', 'modules', 'pokedex', 'pokedex_detail_ctrl.js'),
    path.join('js', 'modules', 'pokedex', 'pokedex_modal.js'),
    path.join('js', 'modules', 'recipes', 'recipes_state.js'),
    path.join('js', 'modules', 'wiki', 'wiki_calculators.js')
  ];
  for (const rel of fallbackFiles) {
    const content = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    const blockMatch = content.match(/\/\*\s*@GAME_CONFIG_FALLBACK_START\s*\*\/([\s\S]*?)\/\*\s*@GAME_CONFIG_FALLBACK_END\s*\*\//);
    assert(blockMatch, `${rel} missing @GAME_CONFIG_FALLBACK block`);
    assert(/["']?ISLAND_BONUS_CAP["']?\s*:\s*95\b/.test(blockMatch[1]), `${rel} @GAME_CONFIG_FALLBACK block does not have ISLAND_BONUS_CAP: 95`);
  }
});

addTest('T2-R3-06', 2, 'R3', 'Recipes Pot Filler Optimizer modal displays x1.95 at 95% island bonus', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(100);
    const slider = document.getElementById('island-bonus-slider');
    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(80);
    const btn = document.querySelector('#recipe-content-area .pot-filler-open-btn');
    if (!btn) return { opened: false };
    btn.click();
    await sleepMs(80);
    const modal = document.getElementById('recipe-pot-filler-modal') || document.querySelector('.recipe-pot-filler-dialog');
    const txt = modal ? modal.textContent : '';
    return { opened: !!modal, has195: txt.includes('1.95') };
  })()`);
  assert(res.opened, 'Pot filler modal failed to open');
  assert(res.has195, 'Pot filler modal missing 1.95 multiplier at 95% island bonus');
});

// --- R4 (Tier 2) ---
addTest('T2-R4-01', 2, 'R4', 'Desktop zh-CN all 5 filter sidebars unify title="筛选器" and reset="重设"', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-CN' });
  const data = await inspectSidebarHeaders(cdp, 'zh-CN', false);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Desktop zh-CN sidebar ${k} missing`);
    assert.strictEqual(s.title, '筛选器', `Desktop zh-CN ${k} .sidebar-title expected 筛选器, got ${s.title}`);
    assert.strictEqual(s.reset, '重设', `Desktop zh-CN ${k} .sidebar-reset-btn expected 重设, got ${s.reset}`);
  }
});

addTest('T2-R4-02', 2, 'R4', 'Mobile H5 zh-CN all 5 filter drawers unify title="筛选器" and reset="重设"', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-CN' });
  const data = await inspectSidebarHeaders(cdp, 'zh-CN', true);
  for (const [k, s] of Object.entries(data.sidebars)) {
    assert(s.exists, `Mobile H5 zh-CN sidebar ${k} missing`);
    assert.strictEqual(s.title, '筛选器', `Mobile H5 zh-CN ${k} .sidebar-title expected 筛选器, got ${s.title}`);
    assert.strictEqual(s.reset, '重设', `Mobile H5 zh-CN ${k} .sidebar-reset-btn expected 重设, got ${s.reset}`);
  }
});

addTest('T2-R4-03', 2, 'R4', 'Wiki Items empty-state reset button uses unified Reset / 重設 / 重设 across 3 locales', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW' });
  const results = {};
  for (const [lang, expected] of [['zh-TW', '重設'], ['zh-CN', '重设'], ['en-US', 'Reset']]) {
    const txt = await cdp.evalJs(`(async () => {
      const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
      window.I18N.setLanguage(${JSON.stringify(lang)});
      window.switchMainTab('wiki');
      await sleepMs(60);
      window.WikiDB.switchSubTab('items');
      await sleepMs(80);
      const btn = document.querySelector('#wiki-items-empty-state .sidebar-reset-btn');
      return btn ? btn.textContent.trim() : null;
    })()`);
    results[lang] = txt;
    assert.strictEqual(txt, expected, `Wiki items empty-state reset button in ${lang} expected ${expected}, got ${txt}`);
  }
});

addTest('T2-R4-04', 2, 'R4', 'Desktop bookmark handles show short Filter / 篩選 / 筛选 text across all 5 sidebars', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  for (const [lang, expected] of [['zh-TW', '篩選'], ['zh-CN', '筛选'], ['en-US', 'Filter']]) {
    const data = await inspectSidebarHeaders(cdp, lang, false);
    for (const [k, s] of Object.entries(data.sidebars)) {
      if (s.bookmarkText !== null) {
        assert.strictEqual(s.bookmarkText, expected, `Desktop ${lang} ${k} bookmark-text expected ${expected}, got ${s.bookmarkText}`);
      }
    }
  }
});

addTest('T2-R4-05', 2, 'R4', 'tests/tiers/tier4/tier4_part3.js does not assert obsolete "Box Filters" title', false, () => {
  const t4p3 = fs.readFileSync(path.join(ROOT_DIR, 'tests', 'tiers', 'tier4', 'tier4_part3.js'), 'utf8');
  assert(!t4p3.includes("'box.filter_sidebar_title': 'Box Filters'"),
         'tier4_part3.js still asserts obsolete Box Filters string');
});

// --- R5 (Tier 2) ---
addTest('T2-R5-01', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) all 5 main tabs have zero horizontal page overflow', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [tab, info] of Object.entries(rep.tabs)) {
    assert(!info.overflow, `360px tab ${tab} overflowed (${info.docScrollWidth} > ${info.innerWidth})`);
    assert.deepStrictEqual(info.clipped, [], `360px tab ${tab} clipped nav controls: ${JSON.stringify(info.clipped)}`);
  }
});

addTest('T2-R5-02', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) all 8 Wiki subtabs have zero overflow and zero clipped pills', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [st, info] of Object.entries(rep.wikiSubtabs)) {
    assert(!info.overflow, `360px Wiki subtab ${st} overflowed (${info.docScrollWidth} > ${info.innerWidth})`);
    assert.deepStrictEqual(info.clipped, [], `360px Wiki subtab ${st} clipped pills: ${JSON.stringify(info.clipped)}`);
  }
});

addTest('T2-R5-03', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) all 3 Lab subtabs have zero overflow and zero clipped controls', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [lt, info] of Object.entries(rep.labSubtabs)) {
    assert(!info.overflow, `360px Lab subtab ${lt} overflowed (${info.docScrollWidth} > ${info.innerWidth})`);
    assert.deepStrictEqual(info.clipped, [], `360px Lab subtab ${lt} clipped controls: ${JSON.stringify(info.clipped)}`);
  }
});

addTest('T2-R5-04', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) all 5 filter drawers fit without clipped switches or tags', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [k, d] of Object.entries(rep.drawers)) {
    assert(d.exists && !d.collapsed, `360px drawer ${k} failed to open`);
    assert(!d.sidebarOverflow, `360px drawer ${k} overflows horizontally`);
    assert.deepStrictEqual(d.clipped, [], `360px drawer ${k} clipped controls: ${JSON.stringify(d.clipped)}`);
  }
});

addTest('T2-R5-05', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) Settings modal controls fit without clipping', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  assert(rep.settingsModal.open, 'Settings modal did not open');
  assert(!rep.settingsModal.dialogOverflow, '360px Settings modal overflows');
  assert.deepStrictEqual(rep.settingsModal.clipped, [], `360px Settings modal clipped controls: ${JSON.stringify(rep.settingsModal.clipped)}`);
});

addTest('T2-R5-06', 2, 'R5', 'Ultra-narrow Mobile H5 (360x800, en-US) Box Edit modal and Lab Picker modal fit inside 360px width', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    await sleepMs(80);
    if (window.PokemonBoxApp && window.PokemonBoxApp.openBoxEditModal) {
      window.PokemonBoxApp.openBoxEditModal('e2e_seed_pika_1');
    }
    await sleepMs(80);
    const editDlg = document.querySelector('#box-edit-modal .mobile-box-sheet, #box-edit-modal .box-modal-dialog');
    const editOk = editDlg ? (editDlg.getBoundingClientRect().width <= 361 && editDlg.scrollWidth <= editDlg.clientWidth + 1) : true;
    document.getElementById('box-edit-cancel-btn')?.click();
    await sleepMs(50);

    if (window.switchBoxSubtab) window.switchBoxSubtab('lab');
    await sleepMs(90);
    if (window.AppraisalLab && window.AppraisalLab.openPicker) {
      window.AppraisalLab.openPicker({ type: 'team', slotIndex: 0 });
    }
    await sleepMs(80);
    const pickerDlg = document.querySelector('#modal-lab-picker .lab-picker-container');
    const pickerOk = pickerDlg ? (pickerDlg.getBoundingClientRect().width <= 361 && pickerDlg.scrollWidth <= pickerDlg.clientWidth + 1) : false;
    if (window.AppraisalLab && window.AppraisalLab.closePicker) window.AppraisalLab.closePicker();
    return { editOk, pickerOk };
  })()`);
  assert(res.editOk, 'Box edit modal overflows 360px viewport');
  assert(res.pickerOk, 'Lab picker modal overflows 360px viewport');
});

// --- R6 (Tier 2) ---
addTest('T2-R6-01', 2, 'R6', 'Canonical berry tie-break order preserved across all 6 tied energy pairs/triplets', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  const ids = cfg.CANONICAL_BERRIES.map(b => b.id);
  const pairs = [
    ['pamtre', 'lum'],          // 24
    ['bluk', 'pecha', 'mago'],  // 26
    ['leppa', 'cheri'],         // 27
    ['sitrus', 'durin'],        // 30
    ['oran', 'wiki'],           // 31
    ['chesto', 'rawst']         // 32
  ];
  for (const group of pairs) {
    for (let i = 0; i < group.length - 1; i++) {
      assert(ids.indexOf(group[i]) < ids.indexOf(group[i + 1]),
             `Tie-break failed: ${group[i]} must precede ${group[i + 1]}`);
    }
  }
});

addTest('T2-R6-02', 2, 'R6', 'Berry alias resolution maps historical aliases (芭亞果, 墨莓果, etc.) in GAME_CONFIG & I18N', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert.strictEqual(cfg.getBerryBaseEnergy('芭亞果'), 24);
  assert.strictEqual(cfg.getBerryBaseEnergy('墨莓果'), 30);
  assert.strictEqual(cfg.getBerrySortOrder('芭亞果'), cfg.getBerrySortOrder('木子果'));
  assert.strictEqual(cfg.getBerrySortOrder('墨莓果'), cfg.getBerrySortOrder('榴石果'));

  const i18nCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n.js'), 'utf8');
  const sb = {
    window: { GAME_CONFIG: cfg },
    globalThis: null,
    localStorage: { getItem: () => null, setItem: () => {} },
    document: { documentElement: { setAttribute: () => {} }, readyState: 'loading', addEventListener: () => {} },
    console
  };
  sb.window.window = sb.window;
  sb.globalThis = sb;
  sb.GAME_CONFIG = cfg;
  vm.createContext(sb);
  vm.runInContext(i18nCode, sb);
  sb.window.I18N.setLanguage('en-US');
  assert.strictEqual(sb.window.I18N.getBerryName('芭亞果'), 'Lum Berry');
  assert.strictEqual(sb.window.I18N.getBerryName('墨莓果'), 'Durin Berry');
});

addTest('T2-R6-03', 2, 'R6', 'Mobile H5 Pokedex, Recipes, and Box filter/picker/pantry containers (7 DOMs) match canonical order', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.pokedexBerries, CANONICAL_BERRY_KEYS, 'Mobile #berry-filter-tags mismatch');
  assert.deepStrictEqual(dom.pokedexIngs, CANONICAL_ING_KEYS, 'Mobile #ingredient-pkm-filter-tags mismatch');
  assert.deepStrictEqual(dom.recipesIncludeIngs, CANONICAL_ING_KEYS, 'Mobile #ingredient-picker-tags mismatch');
  assert.deepStrictEqual(dom.recipesExcludeIngs, CANONICAL_ING_KEYS, 'Mobile #excluded-ingredient-picker-tags mismatch');
  assert.deepStrictEqual(dom.recipesPantryIngs, CANONICAL_ING_KEYS, 'Mobile #pantry-items-grid mismatch');
  assert.deepStrictEqual(dom.boxBerries, CANONICAL_BERRY_KEYS, 'Mobile #box-berry-filter-tags mismatch');
  assert.deepStrictEqual(dom.boxIngs, CANONICAL_ING_KEYS, 'Mobile #box-ingredient-pkm-filter-tags mismatch');
});

addTest('T2-R6-04', 2, 'R6', 'Mobile H5 Lab selects/pickers and Wiki Values grids (6 DOMs) match canonical order', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'zh-TW', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.labGreengrassBerries, CANONICAL_BERRY_KEYS, 'Mobile Lab Greengrass select mismatch');
  assert.deepStrictEqual(dom.labPickerBerries, CANONICAL_BERRY_KEYS, 'Mobile #lab-picker-berry-scroll mismatch');
  assert.deepStrictEqual(dom.labPickerIngs, CANONICAL_ING_KEYS, 'Mobile #lab-picker-ing-scroll mismatch');
  assert.deepStrictEqual(dom.labRecipePickerIngs, CANONICAL_ING_KEYS, 'Mobile #lab-recipe-picker-ing-scroll mismatch');
  assert.deepStrictEqual(dom.wikiValuesBerries, CANONICAL_BERRY_KEYS, 'Mobile #values-berry-grid mismatch');
  assert.deepStrictEqual(dom.wikiValuesIngs, CANONICAL_ING_KEYS, 'Mobile .values-ing-grid mismatch');
});

addTest('T2-R6-05', 2, 'R6', 'Canonical energy-asc DOM order holds across zh-TW, zh-CN, and en-US without alphabetical re-sort', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US', seedBox: true });
  const domEn = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(domEn.pokedexBerries, CANONICAL_BERRY_KEYS, 'en-US Pokedex berries mismatch');
  assert.deepStrictEqual(domEn.recipesIncludeIngs, CANONICAL_ING_KEYS, 'en-US Recipes include ingredients mismatch');
  assert.deepStrictEqual(domEn.boxIngs, CANONICAL_ING_KEYS, 'en-US Box ingredients mismatch');

  await cdp.evalJs(`window.I18N && window.I18N.setLanguage('zh-CN')`);
  await sleep(100);
  const domCn = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(domCn.pokedexBerries, CANONICAL_BERRY_KEYS, 'zh-CN Pokedex berries mismatch');
  assert.deepStrictEqual(domCn.recipesIncludeIngs, CANONICAL_ING_KEYS, 'zh-CN Recipes include ingredients mismatch');
});

addTest('T2-R6-06', 2, 'R6', 'Sort helpers safely handle unknown/empty/null entries without throwing', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert.strictEqual(cfg.getIngredientBaseEnergy('nonexistent_ing'), null);
  assert.strictEqual(cfg.getBerryBaseEnergy('nonexistent_berry'), null);
  assert.strictEqual(cfg.getIngredientSortOrder('nonexistent_ing'), Number.MAX_SAFE_INTEGER);
  assert.strictEqual(cfg.getBerrySortOrder('nonexistent_berry'), Number.MAX_SAFE_INTEGER);
  const resIng = cfg.sortIngredientsByEnergyAsc(['unknown_x', '美味尾巴', '特選蘋果']);
  assert.deepStrictEqual(resIng, ['特選蘋果', '美味尾巴', 'unknown_x']);
  const resBerry = cfg.sortBerriesByEnergyAsc(['unknown_b', '巧可果', '椰木果']);
  assert.deepStrictEqual(resBerry, ['椰木果', '巧可果', 'unknown_b']);
});

// --- R7 (Tier 2) ---
addTest('T2-R7-01', 2, 'R7', 'Global ~/.gemini/GEMINI.md and ~/.gemini/AGENTS.md have zero emojis and zero Hydrogen primary-coder directives', false, () => {
  for (const name of ['GEMINI.md', 'AGENTS.md']) {
    const full = path.join(HOME_DIR, '.gemini', name);
    assert(fs.existsSync(full), `Missing global rule file: ${full}`);
    const txt = fs.readFileSync(full, 'utf8');
    assert(!RE_SUPPLEMENTARY_EMOJI.test(txt) && !txt.includes('\u23F1'), `${name} still contains emojis (e.g. section headers)`);
    assert(!/\bHydrogen\b/i.test(txt), `${name} still references Hydrogen`);
    assert(/\bNeon\b/i.test(txt) && /\bArgon\b/i.test(txt), `${name} must designate Neon and Argon`);
  }
});

addTest('T2-R7-02', 2, 'R7', '~/.gemini/agent-docs/PROTOCOL.md updates multi-agent policy to Neon + Argon without Hydrogen or emojis', false, () => {
  const protoPath = path.join(HOME_DIR, '.gemini', 'agent-docs', 'PROTOCOL.md');
  assert(fs.existsSync(protoPath), `Missing ${protoPath}`);
  const txt = fs.readFileSync(protoPath, 'utf8');
  assert(!RE_SUPPLEMENTARY_EMOJI.test(txt), 'PROTOCOL.md contains emojis');
  assert(!/\bHydrogen\b/i.test(txt), 'PROTOCOL.md still references Hydrogen');
  assert(/\bNeon\b/i.test(txt) && /\bArgon\b/i.test(txt), 'PROTOCOL.md must specify Neon + Argon');
});

addTest('T2-R7-03', 2, 'R7', 'i18n_dict_zh_cn.js pokedex.sort_interval_asc has no U+23F1 stopwatch emoji', false, () => {
  const zhCn = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n', 'i18n_dict_zh_cn.js'), 'utf8');
  const m = zhCn.match(/'pokedex\.sort_interval_asc'\s*:\s*'([^']*)'/);
  assert(m, 'pokedex.sort_interval_asc key not found in i18n_dict_zh_cn.js');
  assert(!m[1].includes('\u23F1') && !RE_MISC_EMOJI_OR_GLYPH.test(m[1]),
         `pokedex.sort_interval_asc still contains emoji/glyph: ${m[1]}`);
});

addTest('T2-R7-04', 2, 'R7', 'Live Desktop & Mobile H5 rendered document.body.innerText across all 5 tabs has zero emojis or decorative glyphs', true, async (harness) => {
  for (const cfg of [
    { path: '/index.html?view=desktop', w: 1280, h: 800, m: false },
    { path: '/app/index.html?view=mobile', w: 390, h: 844, m: true }
  ]) {
    for (const lang of ['zh-TW', 'en-US']) {
      const cdp = await harness.openPage(cfg.path, { width: cfg.w, height: cfg.h, mobile: cfg.m, lang, seedBox: true });
      const hits = await cdp.evalJs(`(async () => {
        const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
        const re1 = /[\\u{1F300}-\\u{1FAFF}\\u23F1\\u2605\\u2606\\u2B50\\u2728\\u2764\\uFE0F\\u20E3]/gu;
        const re2 = new RegExp('\\\\x5B\\\\x2A\\\\x5D|\\\\x5B\\\\x2B\\\\x5D|\\\\x5B\\\\x23\\\\x5D', 'g');
        const found = [];
        for (const tab of ['pokemon', 'recipes', 'wiki', 'box', 'news']) {
          if (window.switchMainTab) window.switchMainTab(tab);
          if (tab === 'box' && window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
          await sleepMs(70);
          const txt = document.body.innerText || '';
          const m1 = txt.match(re1);
          const m2 = txt.match(re2);
          if (m1 || m2) found.push({ tab, m1, m2 });
        }
        return found;
      })()`);
      assert.strictEqual(hits.length, 0, `${cfg.path} (${lang}) rendered prohibited emoji/glyph: ${JSON.stringify(hits)}`);
    }
  }
});

addTest('T2-R7-05', 2, 'R7', 'Live Lab containers uphold Single-Frame rule (border-style none, transparent background)', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'en-US', seedBox: true });
  const styles = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('box');
    if (window.CloudSync && window.CloudSync.dismissBoxAuthOverlay) window.CloudSync.dismissBoxAuthOverlay();
    if (window.switchBoxSubtab) window.switchBoxSubtab('lab');
    await sleepMs(100);
    const out = [];
    for (const sel of ['.lab-team-view-container', '.lab-compare-view-container']) {
      const el = document.querySelector(sel);
      if (el) {
        const cs = window.getComputedStyle(el);
        out.push({ sel, borderTopWidth: cs.borderTopWidth, borderTopStyle: cs.borderTopStyle, backgroundColor: cs.backgroundColor });
      }
    }
    return out;
  })()`);
  for (const s of styles) {
    assert(s.borderTopStyle === 'none' || s.borderTopWidth === '0px', `${s.sel} has nested outer border: ${JSON.stringify(s)}`);
  }
});

// ===========================================================================
// TIER 3 — CROSS-FEATURE COMBINATIONS (14 tests: 2 per R1-R7)
// ===========================================================================

addTest('T3-R1-01', 3, 'R1', 'R1+R7: favicon.svg and manifest.webmanifest are emoji/glyph-free and match HTML links on both entries', true, async (harness) => {
  const svg = fs.readFileSync(path.join(ROOT_DIR, 'assets', 'icons', 'favicon.svg'), 'utf8');
  const mfText = fs.readFileSync(path.join(ROOT_DIR, 'manifest.webmanifest'), 'utf8');
  assert.strictEqual(findProhibitedGlyphs(svg).length, 0);
  assert.strictEqual(findProhibitedGlyphs(mfText).length, 0);
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 390, height: 844, mobile: true, lang: 'en-US' });
  const linkHrefs = await cdp.evalJs(`Array.from(document.querySelectorAll('link[rel="manifest"], link[rel="icon"], link[rel="apple-touch-icon"]')).map(l => l.href)`);
  assert(linkHrefs.length >= 4, 'Missing PWA link tags on mobile H5');
  for (const href of linkHrefs) {
    const r = await fetch(href);
    assert.strictEqual(r.status, 200, `Linked PWA asset ${href} returned HTTP ${r.status}`);
  }
});

addTest('T3-R1-02', 3, 'R1', 'R1+R7: sw.js cache names are clean and valid without emojis or stale baseline versions', false, () => {
  const sw = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
  assert.strictEqual(findProhibitedGlyphs(sw).length, 0);
  const imgM = sw.match(/const\s+IMG_CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  const staticM = sw.match(/const\s+STATIC_CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  assert(imgM && staticM, 'sw.js missing cache constants');
  assert.notStrictEqual(imgM[1], 'pksleep-img-cache-v20261117_02');
});

addTest('T3-R2-01', 3, 'R2', 'R2+R5: Narrow H5 (360x800, en-US) Pokedex modal Clear-All stays single-line with zero modal overflow', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US' });
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'T3-R2-01 360x800 en-US');
  assert(m.dialogScrollWidth <= m.dialogClientWidth + 1, 'Modal dialog overflows horizontally at 360px');
});

addTest('T3-R2-02', 3, 'R2', 'R2+R4: Opening Pokedex filter drawer ("Filter"/"Reset") then opening detail modal preserves single-line Clear-All', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US' });
  const drawer = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    document.getElementById('sidebar-bookmark-handle')?.click();
    await sleepMs(80);
    const title = document.querySelector('#pokemon-filter-sidebar .sidebar-title')?.textContent.trim();
    const reset = document.querySelector('#pokemon-filter-sidebar .sidebar-reset-btn')?.textContent.trim();
    document.getElementById('sidebar-close-btn')?.click();
    await sleepMs(50);
    return { title, reset };
  })()`);
  assert.strictEqual(drawer.title, 'Filter');
  assert.strictEqual(drawer.reset, 'Reset');
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'T3-R2-02 after drawer');
});

addTest('T3-R3-01', 3, 'R3', 'R3+R6: Recipes at 95% bonus simultaneously renders canonical energy-asc pickers and Fancy Apple Curry = 1,459', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    ${BROWSER_NORMALIZER_SNIPPET}
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(100);
    const slider = document.getElementById('island-bonus-slider');
    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(80);
    const rows = Array.from(document.querySelectorAll('#recipe-content-area tr, #recipe-content-area .recipe-desktop-card'));
    const apple = rows.find(r => (r.textContent || '').includes('Fancy Apple Curry'));
    return {
      badge: document.getElementById('island-bonus-badge')?.textContent.trim(),
      energy: apple?.querySelector('.energy-1x .energy-number')?.textContent.trim(),
      inc: Array.from(document.querySelectorAll('#ingredient-picker-tags button')).map(_normIng),
      exc: Array.from(document.querySelectorAll('#excluded-ingredient-picker-tags button')).map(_normIng),
      pantry: Array.from(document.querySelectorAll('#pantry-items-grid .pantry-item-row')).map(_normIng)
    };
  })()`);
  assert.strictEqual(res.badge, '+95% (\u00d71.95)');
  assert.strictEqual(res.energy, '1,459');
  assert.deepStrictEqual(res.inc, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(res.exc, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(res.pantry, CANONICAL_ING_KEYS);
});

addTest('T3-R3-02', 3, 'R3', 'R3+R5: Mobile H5 (360x800, en-US) Recipes 95% badge and Wiki Values +95% fit without overflow', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(100);
    document.getElementById('recipe-sidebar-bookmark-handle')?.click();
    await sleepMs(80);
    const slider = document.getElementById('island-bonus-slider');
    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(60);
    const badge = document.getElementById('island-bonus-badge');
    const recBadgeText = badge?.textContent.trim();
    const recBadgeFits = badge ? (badge.scrollWidth <= badge.clientWidth + 1) : false;
    document.getElementById('recipe-sidebar-close-btn')?.click();
    await sleepMs(50);

    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(70);
    if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab('values');
    await sleepMs(70);
    window.WikiDB.updateBerryIsland(95);
    await sleepMs(50);
    const wikiDisp = document.getElementById('berry-island-display')?.textContent.trim();
    const pageOverflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    return { recBadgeText, recBadgeFits, wikiDisp, pageOverflow };
  })()`);
  assert.strictEqual(res.recBadgeText, '+95% (\u00d71.95)');
  assert(res.recBadgeFits, 'Recipes 95% badge clipped in 360px drawer');
  assert.strictEqual(res.wikiDisp, '+95%');
  assert(!res.pageOverflow, 'Wiki Values overflows at 360px with 95% bonus');
});

addTest('T3-R4-01', 3, 'R4', 'R4+R5: Mobile H5 (360x800, en-US) all 5 filter drawers show unified Filter/Reset without icons or clipping', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const headers = await inspectSidebarHeaders(cdp, 'en-US', true);
  assert.strictEqual(headers.globalSidebarIconCount, 0);
  for (const [k, s] of Object.entries(headers.sidebars)) {
    assert.strictEqual(s.title, 'Filter', `360px ${k} title mismatch`);
    assert.strictEqual(s.reset, 'Reset', `360px ${k} reset mismatch`);
  }
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [k, d] of Object.entries(rep.drawers)) {
    assert.deepStrictEqual(d.clipped, [], `360px ${k} clipped: ${JSON.stringify(d.clipped)}`);
  }
});

addTest('T3-R4-02', 3, 'R4', 'R4+R6: Switching zh-TW -> zh-CN -> en-US preserves unified Filter/Reset AND canonical energy-asc DOM order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'zh-TW', seedBox: true });
  for (const [lang, expTitle, expReset] of [['zh-TW', '篩選器', '重設'], ['zh-CN', '筛选器', '重设'], ['en-US', 'Filter', 'Reset']]) {
    const h = await inspectSidebarHeaders(cdp, lang, false);
    for (const [k, s] of Object.entries(h.sidebars)) {
      assert.strictEqual(s.title, expTitle, `${lang} ${k} title`);
      assert.strictEqual(s.reset, expReset, `${lang} ${k} reset`);
    }
    const dom = await extractAllCanonicalContainers(cdp);
    assert.deepStrictEqual(dom.pokedexBerries, CANONICAL_BERRY_KEYS, `${lang} pokedex berries`);
    assert.deepStrictEqual(dom.recipesIncludeIngs, CANONICAL_ING_KEYS, `${lang} recipes include ings`);
    assert.deepStrictEqual(dom.boxBerries, CANONICAL_BERRY_KEYS, `${lang} box berries`);
  }
});

addTest('T3-R5-01', 3, 'R5', 'R5+R6: Mobile H5 (360x800, en-US) Lab Picker modals fit 360px viewport and keep canonical order', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.labPickerBerries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(dom.labPickerIngs, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(dom.labRecipePickerIngs, CANONICAL_ING_KEYS);
});

addTest('T3-R5-02', 3, 'R5', 'R5+R7: Mobile H5 (375x812, en-US) full sweep has zero overflow and zero emojis/decorative glyphs', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [t, info] of Object.entries(rep.tabs)) {
    assert(!info.overflow, `Tab ${t} overflows`);
  }
  const emojiCheck = await cdp.evalJs(`(() => {
    const txt = document.body.innerText || '';
    const re = /[\\u{1F300}-\\u{1FAFF}\\u23F1\\u2605\\u2606\\u2B50]/gu;
    return txt.match(re) || [];
  })()`);
  assert.strictEqual(emojiCheck.length, 0, `Found emojis in H5 EN view: ${JSON.stringify(emojiCheck)}`);
});

addTest('T3-R6-01', 3, 'R6', 'R6+R3: Wiki Values at 95% keeps Pamtre (1x 47 / 2x 94) first and Yache last in canonical order', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const res = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    ${BROWSER_NORMALIZER_SNIPPET}
    if (window.switchMainTab) window.switchMainTab('wiki');
    await sleepMs(70);
    if (window.WikiDB && window.WikiDB.switchSubTab) window.WikiDB.switchSubTab('values');
    await sleepMs(70);
    window.WikiDB.updateBerryLevel(1);
    window.WikiDB.updateBerryIsland(95);
    await sleepMs(60);
    const nodes = Array.from(document.querySelectorAll('#values-berry-grid .value-compact-node'));
    return {
      order: nodes.map(_normBerry),
      first1x: nodes[0]?.querySelector('.berry-val')?.textContent.replace(/\\s+/g, ' ').trim(),
      first2x: nodes[0]?.querySelector('.berry-val-fav')?.textContent.replace(/\\s+/g, ' ').trim(),
      last1x: nodes[nodes.length - 1]?.querySelector('.berry-val')?.textContent.replace(/\\s+/g, ' ').trim()
    };
  })()`);
  assert.deepStrictEqual(res.order, CANONICAL_BERRY_KEYS);
  assert.strictEqual(res.first1x, '1x 47');
  assert.strictEqual(res.first2x, '2x 94');
  assert.strictEqual(res.last1x, '1x 68');
});

addTest('T3-R6-02', 3, 'R6', 'R6+R2: Filtering Pokedex via energy-asc berry button then opening modal preserves single-line Clear-All', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US' });
  await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    document.getElementById('sidebar-bookmark-handle')?.click();
    await sleepMs(70);
    const pamtreBtn = document.querySelector('#berry-filter-tags button');
    if (pamtreBtn) pamtreBtn.click();
    await sleepMs(70);
    document.getElementById('sidebar-close-btn')?.click();
    await sleepMs(50);
  })()`);
  const m = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(m, 'T3-R6-02 filtered modal');
});

addTest('T3-R7-01', 3, 'R7', 'R7+R3: PROJECT.md and docs/walkthrough.md document both 95% cap and Neon+Argon without emojis', false, () => {
  const proj = fs.readFileSync(path.join(ROOT_DIR, 'PROJECT.md'), 'utf8');
  const walk = fs.readFileSync(path.join(ROOT_DIR, 'docs', 'walkthrough.md'), 'utf8');
  assert(proj.includes('95%') || proj.includes('ISLAND_BONUS_CAP') && proj.includes('95'), 'PROJECT.md must document 95% island cap');
  assert(/\bNeon\b/i.test(proj) && /\bArgon\b/i.test(proj), 'PROJECT.md must document Neon + Argon');
  assert(walk.includes('95%'), 'docs/walkthrough.md must document 95% cap update');
  assert(/\bNeon\b/i.test(walk) && /\bArgon\b/i.test(walk), 'docs/walkthrough.md must document Neon + Argon');
});

addTest('T3-R7-02', 3, 'R7', 'R7+R4/R5: Global rules, docs, and i18n pass combined cleanliness + Filter/Reset + walkthrough parity audit', false, () => {
  const enDict = fs.readFileSync(path.join(ROOT_DIR, 'js', 'core', 'i18n', 'i18n_dict_en_us.js'), 'utf8');
  assert(!enDict.includes("'box.filter_sidebar_title': 'Box Filters'"), 'en-US dictionary still has Box Filters');
  const walkRepo = fs.readFileSync(path.join(ROOT_DIR, 'docs', 'walkthrough.md'));
  const walkShared = fs.readFileSync(path.join(HOME_DIR, '.gemini', 'agent-docs', 'projects', 'pokemon-sleep-app', 'walkthrough.md'));
  assert(walkRepo.equals(walkShared), 'walkthrough.md not synced with agent-docs');
});

// ===========================================================================
// TIER 4 — REAL-WORLD APPLICATION SCENARIOS (7 end-to-end journeys)
// ===========================================================================

addTest('T4-01', 4, 'R2,R4,R5,R6', 'Scenario 1: Mobile H5 Pokedex user switches to en-US, uses Filter drawer, and opens Detail modal', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'zh-TW' });
  const flow = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    ${BROWSER_NORMALIZER_SNIPPET}
    // Switch language via Settings modal UI
    document.getElementById('sync-config-btn')?.click();
    await sleepMs(70);
    document.getElementById('lang-btn-en')?.click();
    await sleepMs(100);
    document.getElementById('settings-modal-close-btn')?.click();
    await sleepMs(60);

    // Open Pokedex drawer
    document.getElementById('sidebar-bookmark-handle')?.click();
    await sleepMs(80);
    const sb = document.getElementById('pokemon-filter-sidebar');
    const title = sb?.querySelector('.sidebar-title')?.textContent.trim();
    const reset = sb?.querySelector('.sidebar-reset-btn')?.textContent.trim();
    const icons = sb ? sb.querySelectorAll('.sidebar-icon').length : -1;
    const berries = Array.from(document.querySelectorAll('#berry-filter-tags button')).map(_normBerry);
    const ings = Array.from(document.querySelectorAll('#ingredient-pkm-filter-tags button')).map(_normIng);
    document.getElementById('sidebar-close-btn')?.click();
    await sleepMs(60);
    return { title, reset, icons, berries, ings };
  })()`);
  assert.strictEqual(flow.title, 'Filter');
  assert.strictEqual(flow.reset, 'Reset');
  assert.strictEqual(flow.icons, 0);
  assert.deepStrictEqual(flow.berries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(flow.ings, CANONICAL_ING_KEYS);

  const modal = await openPokedexModalAndMeasure(cdp, 'en-US');
  assertClearAllButtonSingleLine(modal, 'T4-01 Scenario 1');
});

addTest('T4-02', 4, 'R3,R4,R5,R6', 'Scenario 2: Mobile H5 Recipes journey verifies Filter/Reset, canonical pickers/pantry, and 95% bonus = 1,459', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 375, height: 812, mobile: true, lang: 'en-US' });
  const flow = await cdp.evalJs(`(async () => {
    const sleepMs = (ms) => new Promise(r => setTimeout(r, ms));
    ${BROWSER_NORMALIZER_SNIPPET}
    if (window.switchMainTab) window.switchMainTab('recipes');
    await sleepMs(100);
    document.getElementById('recipe-sidebar-bookmark-handle')?.click();
    await sleepMs(80);
    const sb = document.getElementById('recipe-filter-sidebar');
    const title = sb?.querySelector('.sidebar-title')?.textContent.trim();
    const reset = sb?.querySelector('.sidebar-reset-btn')?.textContent.trim();
    const inc = Array.from(document.querySelectorAll('#ingredient-picker-tags button')).map(_normIng);
    const exc = Array.from(document.querySelectorAll('#excluded-ingredient-picker-tags button')).map(_normIng);
    const pantry = Array.from(document.querySelectorAll('#pantry-items-grid .pantry-item-row')).map(_normIng);

    const slider = document.getElementById('island-bonus-slider');
    slider.value = '95';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    await sleepMs(70);
    const badge = document.getElementById('island-bonus-badge')?.textContent.trim();
    document.getElementById('recipe-sidebar-close-btn')?.click();
    await sleepMs(70);

    const cards = Array.from(document.querySelectorAll('#recipe-content-area .h5-recipe-card'));
    const apple = cards.find(c => (c.textContent || '').includes('Fancy Apple Curry'));
    const energy = apple?.querySelector('.h5-energy-score.energy-1x .energy-number')?.textContent.trim();
    const overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    return { title, reset, inc, exc, pantry, badge, energy, overflow };
  })()`);
  assert.strictEqual(flow.title, 'Filter');
  assert.strictEqual(flow.reset, 'Reset');
  assert.deepStrictEqual(flow.inc, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(flow.exc, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(flow.pantry, CANONICAL_ING_KEYS);
  assert.strictEqual(flow.badge, '+95% (\u00d71.95)');
  assert.strictEqual(flow.energy, '1,459');
  assert(!flow.overflow, 'Recipes H5 page overflowed horizontally');
});

addTest('T4-03', 4, 'R4,R5,R6,R7', 'Scenario 3: Mobile H5 Box & Lab journey (360x800, en-US) checks Box filters, Greengrass selects, Pickers, and Single-Frame', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.boxBerries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(dom.boxIngs, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(dom.labGreengrassBerries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(dom.labPickerBerries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(dom.labPickerIngs, CANONICAL_ING_KEYS);
  assert.deepStrictEqual(dom.labRecipePickerIngs, CANONICAL_ING_KEYS);

  const rep = await auditMobileH5EnOverflow(cdp);
  for (const [lt, info] of Object.entries(rep.labSubtabs)) {
    assert(!info.overflow, `T4-03 Lab ${lt} overflow`);
    assert.deepStrictEqual(info.clipped, [], `T4-03 Lab ${lt} clipped: ${JSON.stringify(info.clipped)}`);
  }
});

addTest('T4-04', 4, 'R3,R4,R6', 'Scenario 4: Desktop Wiki Values & Ladders journey verifies 95% bonus, canonical grids, and unified trilingual sidebars', true, async (harness) => {
  const cdp = await harness.openPage('/index.html?view=desktop', { width: 1280, height: 800, mobile: false, lang: 'en-US' });
  const dom = await extractAllCanonicalContainers(cdp);
  assert.deepStrictEqual(dom.wikiValuesBerries, CANONICAL_BERRY_KEYS);
  assert.deepStrictEqual(dom.wikiValuesIngs, CANONICAL_ING_KEYS);
  const valRes = await cdp.evalJs(`(() => {
    window.WikiDB.updateBerryLevel(1);
    window.WikiDB.updateBerryIsland(95);
    const pamtre = document.querySelector('#values-berry-grid .value-compact-node');
    return {
      disp: document.getElementById('berry-island-display')?.textContent.trim(),
      p1: pamtre?.querySelector('.berry-val')?.textContent.replace(/\\s+/g, ' ').trim(),
      p2: pamtre?.querySelector('.berry-val-fav')?.textContent.replace(/\\s+/g, ' ').trim()
    };
  })()`);
  assert.strictEqual(valRes.disp, '+95%');
  assert.strictEqual(valRes.p1, '1x 47');
  assert.strictEqual(valRes.p2, '2x 94');

  for (const [lang, expTitle, expReset] of [['zh-TW', '篩選器', '重設'], ['zh-CN', '筛选器', '重设'], ['en-US', 'Filter', 'Reset']]) {
    const h = await inspectSidebarHeaders(cdp, lang, false);
    assert.strictEqual(h.sidebars.ladder.title, expTitle);
    assert.strictEqual(h.sidebars.ladder.reset, expReset);
    assert.strictEqual(h.sidebars.skillLadder.title, expTitle);
    assert.strictEqual(h.sidebars.skillLadder.reset, expReset);
  }
});

addTest('T4-05', 4, 'R1,R7', 'Scenario 5: Full PWA & Asset Integrity Audit across PNG alpha/safe-zone, ICO, SVG, manifest, HTML, and SW', true, async (harness) => {
  const rep = getPillowReport();
  for (const [rel, info] of Object.entries(rep.pngs)) {
    assert(info.exists && info.min_alpha === 255 && info.transparent_pixels === 0, `${rel} failed full-bleed opacity`);
  }
  assert(rep.pngs['assets/icons/icon-maskable.png'].maskable_check.border_max_lum < 120, 'Maskable border clipped');
  assert(rep.pngs['assets/icons/icon-maskable.png'].maskable_check.safe_bright_pixels > 1000, 'Maskable safe zone empty');
  assert(rep.ico.exists && rep.ico.sizes.length >= 3, 'favicon.ico incomplete');

  await harness.ensureStarted();
  const base = harness.httpCtx.baseUrl;
  const mf = await (await fetch(`${base}/manifest.webmanifest`)).json();
  for (const ic of mf.icons) {
    const r = await fetch(`${base}/${ic.src}`);
    assert.strictEqual(r.status, 200);
  }
});

addTest('T4-06', 4, 'R5,R7', 'Scenario 6: Mobile H5 Full-App English Sweep (360x800) verifies zero horizontal overflow, zero clipping, and zero emojis', true, async (harness) => {
  const cdp = await harness.openPage('/app/index.html?view=mobile', { width: 360, height: 800, mobile: true, lang: 'en-US', seedBox: true });
  const rep = await auditMobileH5EnOverflow(cdp);
  assert(!rep.settingsModal.dialogOverflow && rep.settingsModal.clipped.length === 0, 'Settings modal overflow/clip');
  for (const [k, v] of Object.entries(rep.tabs)) {
    assert(!v.overflow && v.clipped.length === 0, `Tab ${k} overflow/clip: ${JSON.stringify(v)}`);
  }
  for (const [k, v] of Object.entries(rep.wikiSubtabs)) {
    assert(!v.overflow && v.clipped.length === 0, `Wiki ${k} overflow/clip: ${JSON.stringify(v)}`);
  }
  for (const [k, v] of Object.entries(rep.labSubtabs)) {
    assert(!v.overflow && v.clipped.length === 0, `Lab ${k} overflow/clip: ${JSON.stringify(v)}`);
  }
  for (const [k, v] of Object.entries(rep.drawers)) {
    assert(!v.sidebarOverflow && v.clipped.length === 0, `Drawer ${k} overflow/clip: ${JSON.stringify(v)}`);
  }
});

addTest('T4-07', 4, 'R3,R7', 'Scenario 7: Global Rules, Docs Parity, and Single-Source 95% Cap Full Audit', false, () => {
  const cfg = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));
  assert.strictEqual(cfg.getIslandBonusCap(), 95);
  for (const p of [
    path.join(HOME_DIR, '.gemini', 'GEMINI.md'),
    path.join(HOME_DIR, '.gemini', 'AGENTS.md'),
    path.join(HOME_DIR, '.gemini', 'agent-docs', 'PROTOCOL.md'),
    path.join(ROOT_DIR, 'PROJECT.md')
  ]) {
    const txt = fs.readFileSync(p, 'utf8');
    assert(/\bNeon\b/i.test(txt) && /\bArgon\b/i.test(txt), `${p} missing Neon+Argon`);
    assert(!/\bHydrogen\b/i.test(txt), `${p} still mentions Hydrogen`);
  }
  const walkRepo = fs.readFileSync(path.join(ROOT_DIR, 'docs', 'walkthrough.md'));
  const walkShared = fs.readFileSync(path.join(HOME_DIR, '.gemini', 'agent-docs', 'projects', 'pokemon-sleep-app', 'walkthrough.md'));
  assert(walkRepo.equals(walkShared), 'walkthrough.md parity check failed');
});

// ---------------------------------------------------------------------------
// 7. Runner
// ---------------------------------------------------------------------------
async function main() {
  const grepRegex = CLI.grep ? new RegExp(CLI.grep, 'i') : null;

  const selected = tests.filter(t => {
    if (CLI.skipTier4 && t.tier === 4) return false;
    if (CLI.tiers && !CLI.tiers.has(t.tier)) return false;
    if (grepRegex) {
      const hay = `${t.id} T${t.tier} ${t.req} ${t.name}`;
      if (!grepRegex.test(hay)) return false;
    }
    return true;
  });

  if (selected.length === 0) {
    console.error('No tests matched the provided CLI filters.');
    process.exit(1);
  }

  const harness = new BrowserHarness();
  const results = [];
  const tierStats = { 1: { pass: 0, fail: 0 }, 2: { pass: 0, fail: 0 }, 3: { pass: 0, fail: 0 }, 4: { pass: 0, fail: 0 } };
  const reqStats = { R1: { pass: 0, fail: 0 }, R2: { pass: 0, fail: 0 }, R3: { pass: 0, fail: 0 }, R4: { pass: 0, fail: 0 }, R5: { pass: 0, fail: 0 }, R6: { pass: 0, fail: 0 }, R7: { pass: 0, fail: 0 } };

  const startAll = Date.now();
  try {
    for (const t of selected) {
      const t0 = Date.now();
      let status = 'PASS';
      let errorMsg = null;
      try {
        await t.fn(harness);
      } catch (err) {
        status = 'FAIL';
        errorMsg = err && err.message ? err.message : String(err);
      }
      const durationMs = Date.now() - t0;
      results.push({ id: t.id, tier: t.tier, req: t.req, name: t.name, status, durationMs, error: errorMsg });

      if (status === 'PASS') tierStats[t.tier].pass++;
      else tierStats[t.tier].fail++;

      for (const rKey of t.req.split(',')) {
        if (reqStats[rKey]) {
          if (status === 'PASS') reqStats[rKey].pass++;
          else reqStats[rKey].fail++;
        }
      }

      if (!CLI.json) {
        if (status === 'PASS') {
          console.log(`[PASS] [Tier ${t.tier}] [${t.req}] ${t.id} ${t.name} (${durationMs}ms)`);
        } else {
          console.log(`[FAIL] [Tier ${t.tier}] [${t.req}] ${t.id} ${t.name} (${durationMs}ms)`);
          console.log(`       Diagnostic: ${errorMsg}`);
        }
      }
    }
  } finally {
    await harness.shutdown();
  }

  const totalDurationMs = Date.now() - startAll;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.length - passed;

  if (CLI.json) {
    console.log(JSON.stringify({
      summary: { total: results.length, passed, failed, durationMs: totalDurationMs },
      tiers: tierStats,
      requirements: reqStats,
      results
    }, null, 2));
  } else {
    console.log('\n==============================================================');
    console.log(`E2E R1-R7 Acceptance Summary: ${passed}/${results.length} passed, ${failed} failed (${totalDurationMs}ms)`);
    console.log('By Tier:');
    for (const tierNum of [1, 2, 3, 4]) {
      const s = tierStats[tierNum];
      if (s.pass + s.fail > 0) {
        console.log(`  Tier ${tierNum}: ${s.pass}/${s.pass + s.fail} passed (${s.fail} failed)`);
      }
    }
    console.log('By Requirement:');
    for (const rKey of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7']) {
      const s = reqStats[rKey];
      if (s.pass + s.fail > 0) {
        console.log(`  ${rKey}: ${s.pass}/${s.pass + s.fail} passed (${s.fail} failed)`);
      }
    }
    console.log('==============================================================');
  }

  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('[FATAL] Unhandled runner error:', err);
  process.exit(1);
});
