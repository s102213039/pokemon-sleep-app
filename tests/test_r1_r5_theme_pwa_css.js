/**
 * Standalone Unit & Structural Verification Suite for R1, R2, R3, R4, R5
 * Runs in Node VM without requiring browser launch (fast tier integration).
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT_DIR = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.message}`);
    failed++;
  }
}

console.log('======================================================');
console.log('  R1-R5 Theme Boot, Standalone PWA & CSS Sync Suite');
console.log('======================================================');

const { CSS_MODULES } = require(path.join(ROOT_DIR, 'scripts', 'build_css.js'));
const readMod = (rel) => fs.readFileSync(path.join(ROOT_DIR, 'css', rel), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const appHtml = fs.readFileSync(path.join(ROOT_DIR, 'app', 'index.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'styles.css'), 'utf8');
const tokensCss = readMod('tokens.css');
const tokensInvCss = readMod('tokens_inverted.css');
const h5PokedexViewportCss = readMod('mobile/h5_pokedex_viewport.css');
const wikiLadderCss = readMod('views/wiki/wiki_ladder.css');
const wikiLadderOverridesCss = readMod('views/wiki/wiki_ladder_overrides.css');
const wikiLadderNodesCss = readMod('views/wiki/wiki_ladder_nodes.css');
const wikiLadderSidebarCss = readMod('views/wiki/wiki_ladder_sidebar.css');
const wikiLadderPassingCss = readMod('views/wiki/wiki_ladder_passing.css');
const wikiLadderMealsH5Css = readMod('mobile/wiki_ladder_meals_h5.css');
const wikiValuesGridCss = readMod('views/wiki/wiki_values_grid.css');
const wikiValuesCampsH5Css = readMod('mobile/wiki_values_camps_h5.css');
const wikiStrategiesCss = readMod('views/wiki/wiki_strategies.css');
const wikiTablesCss = readMod('views/wiki/wiki_tables.css');
const wikiCampsSpawnsCss = readMod('views/wiki/wiki_camps_spawns.css');
const dockNavCss = readMod('mobile/dock_nav.css');
const wikiSkillLadderCss = readMod('views/wiki/wiki_skill_ladder.css');
const ingRankModalCss = readMod('components/modals/ing_rank_modal.css');
const settingsModalCss = readMod('components/modals/settings_modal.css');
const settingsH5Css = readMod('components/modals/settings_h5.css');
const wikiItemsCss = readMod('views/wiki/wiki_items.css');
const wikiItemModalCss = readMod('components/modals/wiki_item_modal.css');
const itemCategoriesCss = readMod('components/item_categories.css');
const pokedexModalFormulasCss = readMod('components/modals/pokedex_modal_formulas.css');
const mobileItemsCss = readMod('mobile/items.css');
const boxEditCss = readMod('mobile/box_edit.css');
const boxSheetControlsCss = readMod('mobile/box_sheet_controls.css');
const boxFabThemesCss = readMod('mobile/box_fab_themes.css');
const modalOverridesCss = readMod('mobile/modal_overrides.css');
const pokedexFiltersCss = readMod('views/pokedex_filters.css');
const boxBatchOcrCss = readMod('views/box/box_batch_ocr.css');
const boxCloudAuthCss = readMod('views/box/box_cloud_auth.css');
const recipesPantryCss = readMod('views/recipes_pantry.css');
const wikiLadderModalJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki', 'wiki_ladder_modal.js'), 'utf8');
const wikiRenderLadderJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'wiki', 'wiki_render_ladder.js'), 'utf8');
const pokedexOverlayJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_overlay.js'), 'utf8');
const pokedexFiltersJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_filters.js'), 'utf8');
const pokedexNavJs = fs.readFileSync(path.join(ROOT_DIR, 'js', 'modules', 'pokedex', 'pokedex_nav.js'), 'utf8');

function extractHeadBootScript(html) {
  const m = html.match(/<!-- 同步主題初始化與 Standalone 狀態欄融合引擎 -->\s*<script>([\s\S]*?)<\/script>/);
  return m ? m[1] : null;
}

check('R1-1: Both index.html and app/index.html execute synchronous theme boot script BEFORE styles.min.css', () => {
  for (const [label, html, cssNeedle] of [
    ['index.html', indexHtml, 'css/styles.min.css'],
    ['app/index.html', appHtml, '../css/styles.min.css']
  ]) {
    const bootIdx = html.indexOf('同步主題初始化與 Standalone 狀態欄融合引擎');
    const cssIdx = html.indexOf(cssNeedle);
    assert(bootIdx > 0, `${label} missing theme boot script`);
    assert(cssIdx > bootIdx, `${label} must place theme boot script before ${cssNeedle}`);
  }
});

check('R1-2: Synchronous head boot script applies all 8 theme/inverted combinations & colorScheme synchronously', () => {
  const cases = [
    { theme: 'midnight', inv: 'false', expTheme: 'midnight', expInv: null, expScheme: 'dark', expHeader: '#0a0f1d' },
    { theme: 'onyx', inv: 'false', expTheme: 'onyx', expInv: null, expScheme: 'dark', expHeader: '#0a0a0a' },
    { theme: 'dawn', inv: 'false', expTheme: 'dawn', expInv: null, expScheme: 'light', expHeader: '#f8fafc' },
    { theme: 'emerald', inv: 'false', expTheme: 'emerald', expInv: null, expScheme: 'light', expHeader: '#f1f5f9' },
    { theme: 'midnight', inv: 'true', expTheme: 'midnight', expInv: 'true', expScheme: 'light', expHeader: '#f0f9ff' },
    { theme: 'onyx', inv: 'true', expTheme: 'onyx', expInv: 'true', expScheme: 'light', expHeader: '#fafafa' },
    { theme: 'dawn', inv: 'true', expTheme: 'dawn', expInv: 'true', expScheme: 'dark', expHeader: '#1c1917' },
    { theme: 'emerald', inv: 'true', expTheme: 'emerald', expInv: 'true', expScheme: 'dark', expHeader: '#0f172a' },
    { theme: 'invalid_theme', inv: 'false', expTheme: 'midnight', expInv: null, expScheme: 'dark', expHeader: '#0a0f1d' }
  ];

  for (const html of [indexHtml, appHtml]) {
    const script = extractHeadBootScript(html);
    assert(script, 'Extracted head boot script must not be null');
    for (const c of cases) {
      const attrs = {};
      const classes = new Set();
      const themeMeta = { content: '#0a0f1d', setAttribute(k, v) { if (k === 'content') this.content = v; } };
      const appleMeta = { content: 'black-translucent', setAttribute(k, v) { if (k === 'content') this.content = v; } };
      const sb = {
        localStorage: {
          getItem: (k) => (k === 'user_theme' ? c.theme : (k === 'user_theme_inverted' ? c.inv : null))
        },
        document: {
          documentElement: {
            style: {},
            setAttribute: (k, v) => { attrs[k] = v; },
            removeAttribute: (k) => { delete attrs[k]; },
            classList: { add: (cls) => classes.add(cls), remove: (cls) => classes.delete(cls) }
          },
          querySelector: (sel) => sel.includes('theme-color') ? themeMeta : (sel.includes('apple-mobile-web-app-status-bar-style') ? appleMeta : null)
        },
        window: {
          matchMedia: () => ({ matches: false }),
          navigator: { standalone: false }
        }
      };
      vm.createContext(sb);
      vm.runInContext(script, sb);

      assert.strictEqual(attrs['data-theme'], c.expTheme);
      assert.strictEqual(attrs['data-theme-inverted'] || null, c.expInv);
      assert.strictEqual(sb.document.documentElement.style.colorScheme, c.expScheme);
      assert.strictEqual(classes.has('pwa-standalone'), false, 'Regular browser must not get pwa-standalone');
      assert.strictEqual(themeMeta.content, '#0a0f1d', 'Regular browser must not mutate theme-color');
      assert.strictEqual(appleMeta.content, 'black-translucent', 'Regular browser must not mutate apple status bar style');
    }
  }
});

check('R5-1: Standalone mode adds html.pwa-standalone and updates theme-color & apple status bar style across all 8 variants', () => {
  const script = extractHeadBootScript(appHtml);
  const cases = [
    { theme: 'dawn', inv: 'false', expHeader: '#f8fafc', expApple: 'default' },
    { theme: 'emerald', inv: 'false', expHeader: '#f1f5f9', expApple: 'default' },
    { theme: 'midnight', inv: 'true', expHeader: '#f0f9ff', expApple: 'default' },
    { theme: 'onyx', inv: 'true', expHeader: '#fafafa', expApple: 'default' },
    { theme: 'midnight', inv: 'false', expHeader: '#0a0f1d', expApple: 'black-translucent' },
    { theme: 'onyx', inv: 'false', expHeader: '#0a0a0a', expApple: 'black-translucent' },
    { theme: 'dawn', inv: 'true', expHeader: '#1c1917', expApple: 'black-translucent' },
    { theme: 'emerald', inv: 'true', expHeader: '#0f172a', expApple: 'black-translucent' }
  ];

  for (const standaloneVia of ['matchMedia', 'iosNavigator']) {
    for (const c of cases) {
      const attrs = {};
      const classes = new Set();
      const themeMeta = { content: '#0a0f1d', setAttribute(k, v) { if (k === 'content') this.content = v; } };
      const appleMeta = { content: 'black-translucent', setAttribute(k, v) { if (k === 'content') this.content = v; } };
      const sb = {
        localStorage: {
          getItem: (k) => (k === 'user_theme' ? c.theme : (k === 'user_theme_inverted' ? c.inv : null))
        },
        document: {
          documentElement: {
            style: {},
            setAttribute: (k, v) => { attrs[k] = v; },
            removeAttribute: (k) => { delete attrs[k]; },
            classList: { add: (cls) => classes.add(cls), remove: (cls) => classes.delete(cls) }
          },
          querySelector: (sel) => sel.includes('theme-color') ? themeMeta : (sel.includes('apple-mobile-web-app-status-bar-style') ? appleMeta : null)
        },
        window: {
          matchMedia: () => ({ matches: standaloneVia === 'matchMedia' }),
          navigator: { standalone: standaloneVia === 'iosNavigator' }
        }
      };
      vm.createContext(sb);
      vm.runInContext(script, sb);

      assert.strictEqual(classes.has('pwa-standalone'), true, `Standalone via ${standaloneVia} must add pwa-standalone`);
      assert.strictEqual(themeMeta.content, c.expHeader);
      assert.strictEqual(appleMeta.content, c.expApple);
    }
  }
});

check('R1+R5 CSS Sync: color-scheme tokens and html.pwa-standalone rules exist in modular CSS and styles.css', () => {
  for (const [label, css] of [
    ['css/tokens.css + tokens_inverted.css', tokensCss + '\n' + tokensInvCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert((css.match(/color-scheme:\s*dark;/g) || []).length >= 4, `${label} missing 4 dark color-scheme declarations`);
    assert((css.match(/color-scheme:\s*light;/g) || []).length >= 4, `${label} missing 4 light color-scheme declarations`);
  }

  for (const [label, css] of [
    ['css/mobile/h5_pokedex_viewport.css', h5PokedexViewportCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('html.pwa-standalone .mobile-app-header'), `${label} missing standalone header rule`);
    assert(css.includes('html.pwa-standalone .mobile-app-header::before'), `${label} missing standalone safe-area fill`);
  }

  assert(pokedexOverlayJs.includes('syncStandaloneStatusBar') && pokedexOverlayJs.includes('colorScheme'), 'pokedex_overlay.js syncs standalone status bar and colorScheme');
});

check('R2+R3+R4 CSS Sync: track header z-index, aligned margins, badge-ing-select styles, and H5/Desktop grid separation', () => {
  assert(stylesCss.includes('z-index: 60;') && stylesCss.includes('.ladder-track-header'), 'styles.css sets z-index: 60 on .ladder-track-header');
  assert(!stylesCss.includes('margin: 0 10px;\n}') || !/\.ladder-track-canvas\s*\{[^}]*margin:\s*0 10px;/.test(stylesCss), 'Duplicate 0 10px margin on .ladder-track-canvas removed');
  assert(stylesCss.includes('.node-count-badge.badge-ing-select') && stylesCss.includes('font-style: italic'), 'styles.css styles .badge-ing-select with distinct italic monospace font');

  for (const [label, css] of [
    ['css/views/wiki/wiki_ladder_overrides.css', wikiLadderOverridesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('body:not(.mobile-h5-app) .values-compact-grid.values-ing-grid'), `${label} scopes single-row .values-ing-grid to desktop`);
    assert(!/\n\.mobile-h5-app \.values-compact-grid\.values-ing-grid\s*\{\s*grid-template-columns:\s*none/.test(css), `${label} must not override H5 .values-ing-grid back to single-row`);
    assert(css.includes('body:not(.mobile-h5-app) #panel-wiki:has(> #ladder-filter-sidebar:not(.collapsed)') && css.includes('padding-left: 240px;'),
      `${label} offsets #panel-wiki for open desktop #ladder-filter-sidebar`);
    assert(css.includes('body:not(.mobile-h5-app) #panel-wiki:has(> #skill-ladder-filter-sidebar:not(.collapsed)') && css.includes('width: min(1200px, calc(100% - 32px));'),
      `${label} offsets #panel-wiki for open desktop #skill-ladder-filter-sidebar`);
  }

  for (const [label, css] of [
    ['css/mobile/wiki_values_camps_h5.css', wikiValuesCampsH5Css],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('.mobile-h5-app .values-compact-grid.values-ing-grid'), `${label} defines explicit H5 6-column parity rule`);
  }
});

check('R1-3: Throwing localStorage SecurityError fails safely in head boot script and pokedex storage helpers', () => {
  for (const [label, html] of [['index.html', indexHtml], ['app/index.html', appHtml]]) {
    const script = extractHeadBootScript(html);
    assert(script, `${label} missing head boot script`);
    const attrs = {};
    const sb = {
      document: {
        documentElement: {
          style: {},
          setAttribute: (k, v) => { attrs[k] = v; },
          removeAttribute: (k) => { delete attrs[k]; },
          classList: { add: () => {}, remove: () => {} }
        },
        querySelector: () => null
      },
      window: {
        matchMedia: () => ({ matches: false }),
        navigator: { standalone: false }
      }
    };
    Object.defineProperty(sb, 'localStorage', {
      configurable: true,
      get() { throw new Error('SecurityError: Blocked localStorage'); }
    });
    vm.createContext(sb);
    vm.runInContext(script, sb);
    assert.strictEqual(attrs['data-theme'], 'midnight', `${label}: throwing localStorage must fall back to midnight`);
    assert.strictEqual(sb.document.documentElement.style.colorScheme, 'dark', `${label}: throwing localStorage must set dark colorScheme`);
  }

  assert(pokedexOverlayJs.includes('safeStorageGet') && !/\blet\s+(?:ghPat|currentTheme|isThemeInverted)\s*=\s*localStorage\.getItem/.test(pokedexOverlayJs),
    'pokedex_overlay.js must guard boot localStorage reads via safeStorageGet');
  assert(pokedexFiltersJs.includes('_safeReadStorage') && !/:\s*\(typeof localStorage !== 'undefined'\s*\?\s*localStorage\.getItem/.test(pokedexFiltersJs),
    'pokedex_filters.js must guard drawer/resize localStorage reads via _safeReadStorage');
  assert(pokedexNavJs.includes('getStorage()') && !/window\.localStorage\.getItem|window\.localStorage\.setItem/.test(pokedexNavJs),
    'pokedex_nav.js must route localStorage accesses through try/catch-guarded getStorage()');
});

check('R3+8-Theme WCAG AA CSS Sync: inverted theme isolation, light/dark tooltip & badge contrast, and <=800 line modular CSS', () => {
  assert.strictEqual(CSS_MODULES.length, 75, 'scripts/build_css.js must list all 75 CSS modules');
  for (const mod of CSS_MODULES) {
    const lines = fs.readFileSync(path.join(ROOT_DIR, 'css', mod), 'utf8').split('\n').length;
    assert(lines <= 800, `css/${mod} must stay <= 800 lines (got ${lines})`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_values_grid.css', wikiValuesGridCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-node-tooltip'), `${label} guards dawn tooltip rule`);
    assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .ladder-node-tooltip'), `${label} guards emerald tooltip rule`);
    assert(css.includes('[data-theme="onyx"]:not([data-theme-inverted="true"]) .ladder-node-tooltip'), `${label} guards onyx tooltip rule`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .ladder-node-tooltip'), `${label} styles midnight+inverted tooltip`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .ladder-node-tooltip'), `${label} styles onyx+inverted tooltip`);
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .ladder-node-tooltip'), `${label} styles dawn+inverted tooltip`);
    assert(css.includes('[data-theme="emerald"][data-theme-inverted="true"] .ladder-node-tooltip'), `${label} styles emerald+inverted tooltip`);

    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .tooltip-yield-breakdown'), `${label} guards dawn breakdown rule`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .tooltip-yield-breakdown'), `${label} styles midnight+inverted breakdown`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .tooltip-yield-breakdown'), `${label} styles onyx+inverted breakdown`);
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .tooltip-yield-breakdown'), `${label} styles dawn+inverted breakdown`);
    assert(css.includes('[data-theme="emerald"][data-theme-inverted="true"] .tooltip-yield-breakdown'), `${label} styles emerald+inverted breakdown`);

    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .node-count-badge.badge-ing-select'), `${label} guards dawn badge-ing-select`);
    assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .node-count-badge.badge-ing-select'), `${label} guards emerald badge-ing-select`);
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .node-count-badge.badge-ing-select'), `${label} styles dawn+inverted badge-ing-select`);
    assert(css.includes('[data-theme="emerald"][data-theme-inverted="true"] .node-count-badge.badge-ing-select'), `${label} styles emerald+inverted badge-ing-select`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .ing-rank-split-line .split-skill'), `${label} styles midnight+inverted split-skill`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .ing-rank-split-line .split-skill'), `${label} styles onyx+inverted split-skill`);
    assert(css.includes('color: #92400e;') && css.includes('.value-compact-energy.ing-val'), `${label} updates light .value-compact-energy.ing-val to #92400e`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_skill_ladder.css', wikiSkillLadderCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme] .wiki-skill-coordinate-ladder .ladder-node-tooltip .tooltip-yield-breakdown'), `${label} preserves skill ladder breakdown Single Frame rule`);
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .wiki-skill-coordinate-ladder .ladder-node-tooltip .breakdown-val.text-accent'), `${label} fixes dawn skill ladder .text-accent`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .wiki-skill-coordinate-ladder .ladder-node-tooltip .breakdown-val.text-accent'), `${label} fixes midnight+inv skill ladder .text-accent`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_ladder_nodes.css', wikiLadderNodesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="midnight"]:not([data-theme-inverted="true"]) .dish-badge-full'), `${label} guards midnight .dish-badge-full`);
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .dish-badge-full'), `${label} styles dawn+inv .dish-badge-full`);
    assert(css.includes('[data-theme="emerald"][data-theme-inverted="true"] .dish-badge-assist'), `${label} styles emerald+inv .dish-badge-assist`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_ladder_sidebar.css', wikiLadderSidebarCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-switch-text.nature-ing-text'), `${label} guards dawn .nature-ing-text`);
  }

  for (const [label, css] of [
    ['css/mobile/wiki_ladder_meals_h5.css', wikiLadderMealsH5Css],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ladder-node-tooltip .tooltip-detail .text-success'), `${label} fixes light tooltip .text-success`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .ladder-node-tooltip .tooltip-note'), `${label} fixes midnight+inv .tooltip-note`);
    assert(css.includes('var(--ladder-passing-color-light'), `${label} uses --ladder-passing-color-light on light passing badge`);
    assert(css.includes('.mobile-app-header .mobile-brand-title'), `${label} enforces high-contrast .mobile-brand-title`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_ladder_passing.css', wikiLadderPassingCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('var(--ladder-passing-color-dark'), `${label} uses --ladder-passing-color-dark on .ladder-passing-badge`);
    assert(css.includes('.ladder-passing-line-container.passing-edge-right .ladder-passing-badge'), `${label} aligns right-edge passing badge`);
  }

  for (const [label, css] of [
    ['css/tokens_inverted.css', tokensInvCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('--ladder-passing-badge-bg: rgba(28, 25, 23, 0.94);'), `${label} defines dawn+inv --ladder-passing-badge-bg`);
    assert(css.includes('--ladder-passing-badge-bg: rgba(15, 23, 42, 0.94);'), `${label} defines emerald+inv --ladder-passing-badge-bg`);
  }

  for (const [label, css] of [
    ['css/mobile/wiki_values_camps_h5.css', wikiValuesCampsH5Css],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .mobile-h5-app .value-compact-energy.berry-val'), `${label} guards H5 .value-compact-energy`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .mobile-h5-app .value-compact-energy.ing-val'), `${label} styles midnight+inv H5 .ing-val`);
    assert(css.includes('.mobile-h5-app .value-compact-node.value-tail-highlight .value-compact-energy'), `${label} styles H5 tail highlight`);
  }

  for (const [label, css] of [
    ['css/components/modals/ing_rank_modal.css', ingRankModalCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .ing-rank-avatar-box'), `${label} guards .ing-rank-avatar-box`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .ing-rank-yield-num'), `${label} styles light .ing-rank-yield-num`);
  }

  for (const [label, css] of [
    ['css/components/modals/settings_modal.css', settingsModalCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .settings-section-title') && css.includes('[data-theme="midnight"][data-theme-inverted="true"] .settings-section-title'),
      `${label} darkens .settings-section-title in dawn & midnight+inv`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .theme-card-badge'), `${label} styles midnight+inv .theme-card-badge`);
    assert(css.includes('var(--accent-btn-bg') && css.includes('var(--accent-btn-text'), `${label} uses --accent-btn-bg/--accent-btn-text for settings accent buttons`);
    assert(!/\.settings-modal-close-btn\s*\{[^}]*color:\s*var\(--text-muted\)/.test(css), `${label} must not use low-contrast --text-muted on .settings-modal-close-btn`);
    assert(/\.settings-modal-close-btn\s*\{[^}]*color:\s*var\(--text-secondary\)/.test(css), `${label} uses --text-secondary on .settings-modal-close-btn`);
  }

  for (const [label, css] of [
    ['css/components/modals/settings_h5.css', settingsH5Css],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .app-theme-chip.active'), `${label} styles midnight+inv .app-theme-chip.active`);
    assert(!/\.app-theme-chip\s+\.theme-chip-check\s*\{[^}]*color:\s*var\(--accent-blue/.test(css), `${label} must not hardcode --accent-blue on .theme-chip-check`);
    assert(/\.app-theme-chip\s+\.theme-chip-check\s*\{[^}]*color:\s*inherit;/.test(css), `${label} sets color: inherit on .theme-chip-check`);
    assert(css.includes('var(--accent-btn-bg') && css.includes('var(--accent-btn-text'), `${label} uses --accent-btn-bg/--accent-btn-text for settings accent buttons`);
    assert(!/\.settings-modal-close-btn\s*\{[^}]*color:\s*var\(--text-muted\)/.test(css), `${label} must not use low-contrast --text-muted on .settings-modal-close-btn`);
    assert(/\.settings-modal-close-btn\s*\{[^}]*color:\s*var\(--text-secondary\)/.test(css), `${label} uses --text-secondary on .settings-modal-close-btn`);
  }

  for (const [label, css] of [
    ['css/views/pokedex_filters.css', pokedexFiltersCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .global-skill-tooltip .tooltip-body .text-accent'),
      `${label} overrides .global-skill-tooltip .tooltip-body .text-accent in dawn & midnight+inv`);
    assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .global-skill-tooltip .tooltip-body .text-accent'),
      `${label} overrides .global-skill-tooltip .tooltip-body .text-accent in emerald`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .global-skill-tooltip') && css.includes('[data-theme="onyx"][data-theme-inverted="true"] .global-skill-tooltip .tooltip-tag'),
      `${label} defines light onyx+inv .global-skill-tooltip rules`);
    assert(css.includes('color: #0369a1 !important;') && css.includes('color: #047857 !important;'),
      `${label} uses >= AA darkened tooltip title/tag colors`);
  }

  for (const [label, css] of [
    ['css/views/box/box_batch_ocr.css', boxBatchOcrCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .header-auth-btn.is-logged-in'),
      `${label} darkens .header-auth-btn.is-logged-in in light themes`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .mobile-header-btn.is-logged-in'),
      `${label} darkens .mobile-header-btn.is-logged-in in light themes`);
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .box-cloud-sync-chip.is-logged-in'),
      `${label} darkens .box-cloud-sync-chip.is-logged-in in light themes`);
  }

  for (const [label, css] of [
    ['css/views/box/box_cloud_auth.css', boxCloudAuthCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\.cloud-auth-close-btn\s*\{[^}]*var\(--text-muted\)/.test(css), `${label} must not use --text-muted on .cloud-auth-close-btn`);
    assert(!/\.auth-sub-hint\s*\{[^}]*var\(--text-muted\)/.test(css), `${label} must not use --text-muted on .auth-sub-hint`);
    assert(!/\.cloud-auth-pwd-toggle\s*\{[^}]*var\(--text-muted\)/.test(css), `${label} must not use --text-muted on .cloud-auth-pwd-toggle`);
    assert(!/\.cloud-auth-footer-link\s*\{[^}]*var\(--text-muted\)/.test(css), `${label} must not use --text-muted on .cloud-auth-footer-link`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .cloud-auth-btn.btn-secondary'),
      `${label} defines midnight+inv .cloud-auth-btn.btn-secondary`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .cloud-auth-btn.btn-secondary'),
      `${label} defines onyx+inv .cloud-auth-btn.btn-secondary`);
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .cloud-auth-switch-btn {\n  color: #0369a1;'),
      `${label} darkens dawn .cloud-auth-switch-btn to #0369a1`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .cloud-auth-switch-btn {\n  color: #0369a1;'),
      `${label} darkens midnight+inv .cloud-auth-switch-btn to #0369a1`);
    assert(!/\.box-auth-guest-link\s*\{[^}]*var\(--text-muted\)/.test(css), `${label} must not use --text-muted on .box-auth-guest-link`);
    assert(/\.box-auth-guest-link\s*\{[^}]*var\(--text-secondary\)/.test(css), `${label} uses --text-secondary on .box-auth-guest-link`);
  }

  for (const [label, css] of [
    ['css/mobile/box_fab_themes.css', boxFabThemesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(/\.app-backup-action-btn\.export-btn\s*\{[^}]*--accent-btn-bg/.test(css), `${label} uses --accent-btn-bg on .app-backup-action-btn.export-btn`);
    assert(/\.app-backup-action-btn\.export-btn\s*\{[^}]*--accent-btn-text/.test(css), `${label} uses --accent-btn-text on .app-backup-action-btn.export-btn`);
  }

  for (const [label, css] of [
    ['css/tokens.css + tokens_inverted.css', tokensCss + '\n' + tokensInvCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert((css.match(/--accent-btn-bg:/g) || []).length >= 8, `${label} defines --accent-btn-bg across all 8 themes`);
    assert((css.match(/--accent-btn-text:/g) || []).length >= 8, `${label} defines --accent-btn-text across all 8 themes`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_strategies.css', wikiStrategiesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .ladder-max-badge'), `${label} styles dawn+inv .ladder-max-badge`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_ladder.css', wikiLadderCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="emerald"][data-theme-inverted="true"] .ladder-track-champion-badge'), `${label} styles emerald+inv .ladder-track-champion-badge`);
  }

  for (const [label, css] of [
    ['css/components/modals/pokedex_modal_formulas.css', pokedexModalFormulasCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"][data-theme-inverted="true"] .ladder-skill-tooltip-bubble'), `${label} styles dawn+inv .ladder-skill-tooltip-bubble`);
  }

  assert(wikiRenderLadderJs.includes('--ladder-passing-color-dark') && wikiRenderLadderJs.includes('--ladder-passing-color-light'),
    'wiki_render_ladder.js must pass dual passing-badge CSS variables');
  assert(!/<div class="ladder-passing-badge"\s+style="/.test(wikiRenderLadderJs),
    'wiki_render_ladder.js must not inject hardcoded inline color on .ladder-passing-badge');

  // Verify mathematical WCAG 2.1 contrast ratios (>= 4.5:1) for all 8 theme palette pairs used in tooltips and badges
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  }
  function blendOver(fgRgb, alpha, bgRgb) {
    return [
      fgRgb[0] * alpha + bgRgb[0] * (1 - alpha),
      fgRgb[1] * alpha + bgRgb[1] * (1 - alpha),
      fgRgb[2] * alpha + bgRgb[2] * (1 - alpha)
    ];
  }
  function relLumRgb(rgb) {
    const lin = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  }
  function contrastRgb(fg, bg) {
    const l1 = relLumRgb(fg), l2 = relLumRgb(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  function contrastHex(fg, bg) {
    return contrastRgb(hexToRgb(fg), hexToRgb(bg));
  }
  const pairs = [
    ['midnight:0 title', '#cbd5e1', '#0d1527'],
    ['midnight:0 detail', '#94a3b8', '#0d1527'],
    ['onyx:0 title', '#d4d4d8', '#09090b'],
    ['onyx:0 detail', '#a1a1aa', '#09090b'],
    ['dawn:0 title', '#0f172a', '#ffffff'],
    ['dawn:0 detail', '#475569', '#ffffff'],
    ['emerald:0 title', '#1e293b', '#ffffff'],
    ['emerald:0 detail', '#475569', '#ffffff'],
    ['midnight:1 title', '#0c4a6e', '#ffffff'],
    ['midnight:1 detail', '#0369a1', '#ffffff'],
    ['onyx:1 title', '#09090b', '#ffffff'],
    ['onyx:1 detail', '#52525b', '#ffffff'],
    ['dawn:1 title', '#e7e5e4', '#1c1917'],
    ['dawn:1 detail', '#a8a29e', '#1c1917'],
    ['emerald:1 title', '#e2e8f0', '#0f172a'],
    ['emerald:1 detail', '#94a3b8', '#0f172a'],
    ['dawn:1 breakdown skill', '#d8b4fe', '#141211'],
    ['emerald:1 breakdown skill', '#d8b4fe', '#0a0f1d'],
    ['light breakdown skill', '#7e22ce', '#f1f5f9'],
    ['light tooltip .text-success', '#047857', '#ffffff'],
    ['dawn/midnight+inv .tooltip-note', '#0369a1', '#ffffff'],
    ['light .ing-rank-yield-num on emerald card', '#065f46', '#e2e8f0'],
    ['light .ing-rank-num.rank-1', '#92400e', '#e2e8f0'],
    ['light .ing-rank-num.rank-2', '#334155', '#e2e8f0'],
    ['light .ing-rank-num.rank-3', '#9a3412', '#e2e8f0'],
    ['dawn .settings-section-title', '#0369a1', '#f8fafc'],
    ['midnight+inv .settings-section-title', '#0369a1', '#f0f9ff'],
    ['dawn/midnight+inv tooltip title', '#0369a1', '#ffffff'],
    ['emerald tooltip title', '#047857', '#ffffff'],
    ['onyx+inv tooltip title', '#18181b', '#ffffff'],
    ['light auth switch btn dawn/midnight+inv', '#0369a1', '#ffffff'],
    ['light auth chip logged-in', '#065f46', '#ffffff'],
    ['auth primary btn midnight/dawn stop 1', '#ffffff', '#0369a1'],
    ['auth primary btn dawn+inv stop 1', '#ffffff', '#b45309'],
    ['auth primary btn emerald+inv stop 1', '#ffffff', '#047857']
  ];
  for (const [label, fg, bg] of pairs) {
    const ratio = contrastHex(fg, bg);
    assert(ratio >= 4.5, `${label} contrast ${ratio.toFixed(2)} < 4.5`);
  }

  // Alpha-blended tooltip tags & logged-in header auth buttons
  const dawnTagBg = blendOver(hexToRgb('#0369a1'), 0.1, hexToRgb('#ffffff'));
  assert(contrastRgb(hexToRgb('#0369a1'), dawnTagBg) >= 4.5, 'dawn/midnight+inv .tooltip-tag < 4.5');
  const emTagBg = blendOver(hexToRgb('#047857'), 0.1, hexToRgb('#ffffff'));
  assert(contrastRgb(hexToRgb('#047857'), emTagBg) >= 4.5, 'emerald .tooltip-tag < 4.5');
  for (const lBg of ['#f8fafc', '#f1f5f9', '#f0f9ff', '#fafafa']) {
    const hdrAuthBg = blendOver(hexToRgb('#059669'), 0.12, hexToRgb(lBg));
    assert(contrastRgb(hexToRgb('#065f46'), hdrAuthBg) >= 4.5, `header-auth-btn.is-logged-in on ${lBg} < 4.5`);
  }

  // Alpha-blended dish badges across light & dark tooltip surfaces
  const dishSpecs = [
    ['dish-badge-full', '#065f46', '#34d399', '#10b981', 0.2],
    ['dish-badge-high', '#075985', '#38bdf8', '#38bdf8', 0.2],
    ['dish-badge-assist', '#92400e', '#fbbf24', '#f59e0b', 0.15]
  ];
  for (const [cls, fgLight, fgDark, tintHex, alpha] of dishSpecs) {
    const lightBg = blendOver(hexToRgb(tintHex), alpha, hexToRgb('#ffffff'));
    assert(contrastRgb(hexToRgb(fgLight), lightBg) >= 4.5, `${cls} light contrast < 4.5`);
    for (const darkHex of ['#0d1527', '#09090b', '#1c1917', '#0f172a']) {
      const darkBg = blendOver(hexToRgb(tintHex), alpha, hexToRgb(darkHex));
      assert(contrastRgb(hexToRgb(fgDark), darkBg) >= 4.5, `${cls} dark (${darkHex}) contrast < 4.5`);
    }
  }

  // All 8 RECIPE_MARK_PALETTE entries parsed from wiki_ladder_modal.js against light & dark passing badge bgs
  const paletteMatches = [...wikiLadderModalJs.matchAll(/\{\s*fg:\s*'([^']+)',\s*color:\s*'([^']+)'/g)];
  assert.strictEqual(paletteMatches.length, 8, 'RECIPE_MARK_PALETTE must have 8 entries');
  for (const [, fgLight, fgDark] of paletteMatches) {
    for (const lBg of ['#fffbeb', '#fef3c7']) {
      assert(contrastHex(fgLight, lBg) >= 4.5, `Palette fg ${fgLight} on ${lBg} < 4.5`);
    }
    for (const dBg of ['#19150d', '#12100c', '#1c1917', '#0f172a']) {
      assert(contrastHex(fgDark, dBg) >= 4.5, `Palette color ${fgDark} on ${dBg} < 4.5`);
    }
  }

  // R4 H5 & Desktop .value-compact-energy light contrast
  for (const lBg of ['#f8fafc', '#f1f5f9', '#f0f9ff', '#fafafa']) {
    const berryBg = blendOver(hexToRgb('#0369a1'), 0.08, hexToRgb(lBg));
    const ingBg = blendOver(hexToRgb('#b45309'), 0.08, hexToRgb(lBg));
    assert(contrastRgb(hexToRgb('#0369a1'), berryBg) >= 4.5, `berry-val on ${lBg} < 4.5`);
    assert(contrastRgb(hexToRgb('#92400e'), ingBg) >= 4.5, `ing-val on ${lBg} < 4.5`);
  }

  // All 8 theme --accent-btn-bg gradient stops vs --accent-btn-text >= 4.5:1
  const combinedTokens = tokensCss + '\n' + tokensInvCss;
  const btnMatches = [...combinedTokens.matchAll(/--accent-btn-bg:\s*([^;]+);\s*--accent-btn-text:\s*(#[0-9a-fA-F]{6});/g)];
  assert.strictEqual(btnMatches.length, 8, 'tokens.css + tokens_inverted.css must define 8 --accent-btn-bg/--accent-btn-text pairs');
  for (const [, bgExpr, fgHex] of btnMatches) {
    const stops = [...bgExpr.matchAll(/#[0-9a-fA-F]{6}/g)].map(m => m[0]);
    assert(stops.length >= 2, `Expected gradient stops in ${bgExpr}`);
    for (const stopHex of stops) {
      assert(contrastHex(fgHex, stopHex) >= 4.5, `--accent-btn-text ${fgHex} on ${stopHex} < 4.5`);
    }
  }
});

check('M2 Items Tab & Item Detail Modal 8-Theme CSS Sync & WCAG AA Contrast', () => {
  // 1. #wiki-item-detail-modal & light/dark 8-theme rules in wiki_item_modal.css <-> styles.css
  for (const [label, css] of [
    ['css/components/modals/wiki_item_modal.css', wikiItemModalCss],
    ['css/styles.css', stylesCss]
  ]) {
    for (const sel of [
      '[data-theme="dawn"]:not([data-theme-inverted="true"]) .wiki-item-modal-dialog',
      '[data-theme="emerald"]:not([data-theme-inverted="true"]) .wiki-item-modal-dialog',
      '[data-theme="midnight"][data-theme-inverted="true"] .wiki-item-modal-dialog',
      '[data-theme="onyx"][data-theme-inverted="true"] .wiki-item-modal-dialog',
      '[data-theme="midnight"]:not([data-theme-inverted="true"]) .wiki-item-modal-dialog',
      '[data-theme="dawn"][data-theme-inverted="true"] .wiki-item-modal-dialog',
      '[data-theme="emerald"][data-theme-inverted="true"] .wiki-item-modal-dialog',
      '[data-theme="onyx"]:not([data-theme-inverted="true"]) .wiki-item-modal-dialog',
      '[data-theme="dawn"]:not([data-theme-inverted="true"]) .wiki-item-price-pill .price-value.text-highlight',
      '[data-theme="onyx"][data-theme-inverted="true"] .wiki-item-price-pill .price-value.text-diamonds',
      '.mobile-h5-app #wiki-item-detail-modal .wiki-item-modal-dialog.mobile-modal-sheet'
    ]) {
      assert(css.includes(sel), `${label} missing selector: ${sel}`);
    }
  }

  // 2. .wiki-item-cat-* in item_categories.css <-> styles.css
  for (const [label, css] of [
    ['css/components/item_categories.css', itemCategoriesCss],
    ['css/styles.css', stylesCss]
  ]) {
    for (const cat of ['evolution', 'pokemon_incense', 'functional_incense', 'training', 'biscuit', 'supply']) {
      assert(css.includes(`:root:not([data-theme-inverted="true"]) .wiki-item-cat-${cat}`), `${label} guards :root .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="midnight"]:not([data-theme-inverted="true"]) .wiki-item-cat-${cat}`), `${label} guards midnight .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="dawn"][data-theme-inverted="true"] .wiki-item-cat-${cat}`), `${label} styles dawn+inv .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="emerald"][data-theme-inverted="true"] .wiki-item-cat-${cat}`), `${label} styles emerald+inv .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="onyx"]:not([data-theme-inverted="true"]) .wiki-item-cat-${cat}`), `${label} guards onyx .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="dawn"]:not([data-theme-inverted="true"]) .wiki-item-cat-${cat}`), `${label} guards dawn .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="emerald"]:not([data-theme-inverted="true"]) .wiki-item-cat-${cat}`), `${label} guards emerald .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="midnight"][data-theme-inverted="true"] .wiki-item-cat-${cat}`), `${label} styles midnight+inv .wiki-item-cat-${cat}`);
      assert(css.includes(`[data-theme="onyx"][data-theme-inverted="true"] .wiki-item-cat-${cat}`), `${label} styles onyx+inv .wiki-item-cat-${cat}`);
    }
  }

  // 3. .stat-type-* in wiki_items.css <-> styles.css
  for (const [label, css] of [
    ['css/views/wiki/wiki_items.css', wikiItemsCss],
    ['css/styles.css', stylesCss]
  ]) {
    for (const st of ['biscuit', 'biscuit-max', 'seed', 'mint', 'candy', 'shard', 'energy', 'whistle', 'camp', 'ticket', 'evolution']) {
      assert(css.includes(`[data-theme="dawn"]:not([data-theme-inverted="true"]) .stat-type-${st}`), `${label} guards dawn .stat-type-${st}`);
      assert(css.includes(`[data-theme="emerald"]:not([data-theme-inverted="true"]) .stat-type-${st}`), `${label} guards emerald .stat-type-${st}`);
      assert(css.includes(`[data-theme="midnight"][data-theme-inverted="true"] .stat-type-${st}`), `${label} styles midnight+inv .stat-type-${st}`);
      assert(css.includes(`[data-theme="onyx"][data-theme-inverted="true"] .stat-type-${st}`), `${label} styles onyx+inv .stat-type-${st}`);
    }
  }

  // 4. .sheet-drag-handle, .wiki-items-filter-pills .wiki-pill-btn.active, .mobile-box-sheet .box-modal-close
  for (const [label, css] of [
    ['css/mobile/dock_nav.css', dockNavCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .sheet-drag-handle'), `${label} guards dawn .sheet-drag-handle`);
    assert(css.includes('[data-theme="emerald"]:not([data-theme-inverted="true"]) .sheet-drag-handle'), `${label} guards emerald .sheet-drag-handle`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .sheet-drag-handle'), `${label} styles midnight+inv .sheet-drag-handle`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .sheet-drag-handle'), `${label} styles onyx+inv .sheet-drag-handle`);
  }
  for (const [label, css] of [
    ['css/mobile/box_edit.css', boxEditCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .mobile-h5-app .mobile-box-sheet .sheet-drag-handle'), `${label} guards dawn mobile sheet drag handle`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .mobile-h5-app .mobile-box-sheet .sheet-drag-handle'), `${label} styles midnight+inv mobile sheet drag handle`);
    assert(css.includes('[data-theme="onyx"][data-theme-inverted="true"] .mobile-h5-app .mobile-box-sheet .sheet-drag-handle'), `${label} styles onyx+inv mobile sheet drag handle`);
  }
  for (const [label, css] of [
    ['css/views/wiki/wiki_items.css', wikiItemsCss],
    ['css/mobile/items.css', mobileItemsCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('.wiki-items-filter-pills .wiki-pill-btn.active'), `${label} styles .wiki-items-filter-pills .wiki-pill-btn.active`);
    assert(css.includes('var(--accent-btn-bg') && css.includes('var(--accent-btn-text'), `${label} uses --accent-btn-bg/--accent-btn-text`);
  }
  for (const [label, css] of [
    ['css/mobile/box_sheet_controls.css', boxSheetControlsCss],
    ['css/styles.css', stylesCss]
  ]) {
    for (const sel of [
      '[data-theme="dawn"]:not([data-theme-inverted="true"]) .mobile-h5-app .mobile-box-sheet .box-modal-close',
      '[data-theme="emerald"]:not([data-theme-inverted="true"]) .mobile-h5-app .mobile-box-sheet .box-modal-close',
      '[data-theme="midnight"][data-theme-inverted="true"] .mobile-h5-app .mobile-box-sheet .box-modal-close',
      '[data-theme="onyx"][data-theme-inverted="true"] .mobile-h5-app .mobile-box-sheet .box-modal-close'
    ]) {
      assert(css.includes(sel), `${label} missing ${sel}`);
    }
  }
  for (const [label, css] of [
    ['css/mobile/box_edit.css', boxEditCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('color: var(--text-secondary) !important;'), `${label} uses --text-secondary for mobile item controls`);
  }

  // 5. Mathematical WCAG AA (>= 4.5:1) contrast for .wiki-item-cat-*, .stat-type-*, modal price/title/close across all 8 themes
  function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return [parseInt(clean.slice(0, 2), 16), parseInt(clean.slice(2, 4), 16), parseInt(clean.slice(4, 6), 16)];
  }
  function blendOver(fgRgb, alpha, bgRgb) {
    return [fgRgb[0] * alpha + bgRgb[0] * (1 - alpha), fgRgb[1] * alpha + bgRgb[1] * (1 - alpha), fgRgb[2] * alpha + bgRgb[2] * (1 - alpha)];
  }
  function relLumRgb(rgb) {
    const lin = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
  }
  function contrastRgb(fg, bg) {
    const l1 = relLumRgb(fg), l2 = relLumRgb(bg);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  const darkSurfaces = ['#131d31', '#0a0a0c', '#1c1917', '#0f172a'];
  const catDarkSpecs = [
    ['evolution', '#fbbf24', '#f59e0b', 0.2],
    ['pokemon_incense', '#d8b4fe', '#a855f7', 0.2],
    ['functional_incense', '#38bdf8', '#38bdf8', 0.2],
    ['training', '#34d399', '#10b981', 0.2],
    ['biscuit', '#f9a8d4', '#f472b6', 0.2],
    ['supply', '#2dd4bf', '#14b8a6', 0.2]
  ];
  for (const [cat, fgHex, tintHex, alpha] of catDarkSpecs) {
    for (const surf of darkSurfaces) {
      const effBg = blendOver(hexToRgb(tintHex), alpha, hexToRgb(surf));
      const ratio = contrastRgb(hexToRgb(fgHex), effBg);
      assert(ratio >= 4.5, `Dark .wiki-item-cat-${cat} on ${surf} contrast ${ratio.toFixed(2)} < 4.5`);
    }
  }
  const catOnyxFunctionalBg = blendOver(hexToRgb('#cbd5e1'), 0.15, hexToRgb('#0a0a0c'));
  assert(contrastRgb(hexToRgb('#e2e8f0'), catOnyxFunctionalBg) >= 4.5, 'Onyx .wiki-item-cat-functional_incense < 4.5');

  for (const [cat, fgHex, bgHex] of [
    ['dawn evolution', '#92400e', '#fef3c7'],
    ['dawn pokemon_incense', '#6b21a8', '#f3e8ff'],
    ['dawn functional_incense', '#0369a1', '#e0f2fe'],
    ['dawn training', '#166534', '#dcfce7'],
    ['dawn biscuit', '#9d174d', '#fce7f3'],
    ['dawn supply', '#0f766e', '#ccfbf1'],
    ['emerald evolution', '#854d0e', '#fef9c3'],
    ['emerald pokemon_incense', '#5b21b6', '#ede9fe'],
    ['emerald functional_incense', '#075985', '#e0f2fe'],
    ['emerald training', '#15803d', '#dcfce7'],
    ['emerald biscuit', '#9d174d', '#fce7f3'],
    ['emerald supply', '#115e59', '#ccfbf1']
  ]) {
    const ratio = contrastRgb(hexToRgb(fgHex), hexToRgb(bgHex));
    assert(ratio >= 4.5, `${cat} contrast ${ratio.toFixed(2)} < 4.5`);
  }

  // .stat-type-* dark and light contrast checks
  for (const [st, fgHex, tintHex, alpha] of [
    ['biscuit', '#fbbf24', '#f59e0b', 0.18],
    ['biscuit-max', '#f9a8d4', '#f472b6', 0.18],
    ['seed/mint', '#34d399', '#10b981', 0.18],
    ['candy/shard', '#38bdf8', '#38bdf8', 0.18],
    ['energy/whistle/camp/ticket', '#d8b4fe', '#a855f7', 0.18],
    ['evolution', '#fb923c', '#fb923c', 0.18]
  ]) {
    for (const surf of darkSurfaces) {
      const effBg = blendOver(hexToRgb(tintHex), alpha, hexToRgb(surf));
      const ratio = contrastRgb(hexToRgb(fgHex), effBg);
      assert(ratio >= 4.5, `Dark .stat-type-${st} on ${surf} contrast ${ratio.toFixed(2)} < 4.5`);
    }
  }
  for (const [st, fgHex, tintHex, alpha] of [
    ['biscuit', '#92400e', '#f59e0b', 0.18],
    ['biscuit-max', '#9d174d', '#f472b6', 0.18],
    ['seed/mint', '#065f46', '#10b981', 0.18],
    ['candy/shard', '#0369a1', '#38bdf8', 0.18],
    ['energy/whistle/camp/ticket', '#6b21a8', '#a855f7', 0.18],
    ['evolution', '#9a3412', '#fb923c', 0.18]
  ]) {
    for (const surf of ['#ffffff', '#f1f5f9']) {
      const effBg = blendOver(hexToRgb(tintHex), alpha, hexToRgb(surf));
      const ratio = contrastRgb(hexToRgb(fgHex), effBg);
      assert(ratio >= 4.5, `Light .stat-type-${st} on ${surf} contrast ${ratio.toFixed(2)} < 4.5`);
    }
  }
  assert(contrastRgb(hexToRgb('#0f172a'), hexToRgb('#f8fafc')) >= 4.5, 'Light .mobile-box-sheet .box-modal-close < 4.5');
  assert(contrastRgb(hexToRgb('#b45309'), hexToRgb('#f1f5f9')) >= 4.5, 'Light .wiki-item-price-pill .price-value.text-highlight < 4.5');
  assert(contrastRgb(hexToRgb('#0369a1'), hexToRgb('#f1f5f9')) >= 4.5, 'Light .wiki-item-price-pill .price-value.text-diamonds < 4.5');
});

check('8-Theme Dropdown, Modal, Tooltip & Popover Isolation Guard (Zero Bare/Bogus Selectors & Zero Undefined Vars)', () => {
  for (const [label, css] of [
    ['css/views/wiki/wiki_tables.css', wikiTablesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\[data-theme="(?:dawn|emerald)"\]\s+\.custom-select-calc\s+\.custom-select-menu/.test(css),
      `${label} must not have bare [data-theme="dawn|emerald"] on .custom-select-calc .custom-select-menu`);
    assert(!/\[data-theme="(?:dawn|emerald)"\]\s+\.calc-select\s+option/.test(css),
      `${label} must not have bare [data-theme="dawn|emerald"] on .calc-select option`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .custom-select-calc .custom-select-menu') &&
      css.includes('[data-theme="onyx"][data-theme-inverted="true"] .custom-select-calc .custom-select-menu'),
      `${label} must cover all 4 light themes on .custom-select-calc .custom-select-menu`);
  }

  for (const [label, css] of [
    ['css/mobile/modal_overrides.css', modalOverridesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\[data-theme="(?:dawn|emerald)"\]\s+\.box-conflict-dialog/.test(css),
      `${label} must not have bare [data-theme="dawn|emerald"] on .box-conflict-dialog`);
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .box-conflict-dialog') &&
      css.includes('[data-theme="onyx"][data-theme-inverted="true"] .box-conflict-dialog'),
      `${label} must cover all 4 light themes on .box-conflict-dialog`);
  }

  for (const [label, css] of [
    ['css/views/recipes_pantry.css', recipesPantryCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\.recipe-pot-filler-dialog\s*\{[^}]*var\(--bg-primary\b/.test(css),
      `${label} must not use undefined --bg-primary on .recipe-pot-filler-dialog`);
    assert(!/\.filler-dialog-header\s*\{[^}]*var\(--bg-secondary\b/.test(css),
      `${label} must not use undefined --bg-secondary on .filler-dialog-header`);
  }

  for (const [label, css] of [
    ['css/views/wiki/wiki_camps_spawns.css', wikiCampsSpawnsCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\[data-theme="light"\]\s+\.island-sleep-hover-tooltip/.test(css),
      `${label} must not use non-existent [data-theme="light"] on .island-sleep-hover-tooltip`);
    assert(css.includes('[data-theme="dawn"]:not([data-theme-inverted="true"]) .island-sleep-hover-tooltip') &&
      css.includes('[data-theme="onyx"][data-theme-inverted="true"] .island-sleep-hover-tooltip'),
      `${label} must cover all 4 light themes on .island-sleep-hover-tooltip`);
  }

  for (const [label, css] of [
    ['css/mobile/box_fab_themes.css', boxFabThemesCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(css.includes('[data-theme="midnight"][data-theme-inverted="true"] .mobile-h5-app .box-toolbar-control-row .custom-select-menu') &&
      css.includes('[data-theme="onyx"][data-theme-inverted="true"] .mobile-h5-app .box-toolbar-control-row .custom-select-menu'),
      `${label} must cover all 4 light themes on H5 box toolbar .custom-select-menu`);
  }

  for (const [label, css] of [
    ['css/components/modals/pokedex_modal_formulas.css', pokedexModalFormulasCss],
    ['css/styles.css', stylesCss]
  ]) {
    assert(!/\[data-theme="(?:midnight|onyx)"\]\s+#pokedex-detail-modal\s+\.calc-color-/.test(css),
      `${label} must guard [data-theme="midnight|onyx"] with :not([data-theme-inverted="true"]) on #pokedex-detail-modal .calc-color-*`);
  }
});

check('Zero Emoji & Zero Decorative Glyphs compliance in all modified R1-R5 & M2 files', () => {
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u23F1\u2605\u2606\u2B50\u2728\u2764\uFE0F\u20E3]/u;
  const glyphRe = /[★☆]|\[★\]|\[☆\]|\[\*\]|\[\+\]|\[#\]/;
  const files = [
    'index.html',
    'app/index.html',
    'js/modules/pokedex/pokedex_overlay.js',
    'js/modules/pokedex/pokedex_filters.js',
    'js/modules/pokedex/pokedex_nav.js',
    'js/modules/box/box_storage_crud.js',
    'js/modules/wiki/wiki_nav_ctrl.js',
    'js/modules/wiki/wiki_ladder_top_recipes.js',
    'js/modules/wiki/wiki_ladder_recipes.js',
    'js/modules/wiki/wiki_ladder_modal.js',
    'js/modules/wiki/wiki_calculators.js',
    'js/modules/wiki/wiki_events.js',
    'js/modules/wiki/wiki_camps_islands_ex.js',
    'js/modules/wiki/wiki_camps_islands_std.js',
    'js/modules/wiki/wiki_camps_config.js',
    'js/modules/wiki/wiki_render_ladder_tail.js',
    'js/modules/wiki/wiki_render_ladder.js',
    'js/modules/wiki/wiki_items.js',
    'js/modules/wiki/wiki_item_modal.js',
    'js/modules/wiki/wiki_render_subskills.js',
    'js/modules/wiki/wiki_render_layout.js',
    'js/modules/wiki/wiki_main.js',
    'js/core/i18n/i18n_entities_items.js',
    'js/core/i18n/i18n_entities.js',
    'js/core/i18n/i18n_icons_names.js',
    'js/core/i18n/i18n_translate_en.js',
    'js/core/i18n/i18n_shell_settings.js',
    'js/core/i18n/i18n_shell_hydrate.js',
    'js/core/i18n/i18n_core.js',
    ...CSS_MODULES.map(m => 'css/' + m),
    'css/styles.css'
  ];
  for (const rel of files) {
    const txt = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert(!emojiRe.test(txt), `${rel} contains prohibited emoji`);
    assert(!glyphRe.test(txt), `${rel} contains prohibited decorative star/glyph symbol`);
  }
});

console.log('\n======================================================');
console.log(`  R1-R5 Theme/PWA/CSS Suite: ${passed} / ${passed + failed} Passed (${failed} Failed)`);
console.log('======================================================');
if (failed > 0) process.exit(1);
