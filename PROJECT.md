# Project: Pokémon Sleep Dedicated Mobile H5 Web App (`/app/`)

## Architecture
- **Dual-Surface Web Architecture**:
  - Desktop Surface: `index.html` (Full SPA with multi-column desktop layout).
  - Mobile Surface: `app/index.html` (Dedicated Mobile H5 SPA with 2-char Dock, segmented controls, bottom sheets).
- **Shared Core Data Layer**:
  - Data Files: `data/data.json`, `data/recipes.json`, `data/news.json`, `data/special_icons.json`.
  - Core Modules: `js/core/i18n.js`, `js/modules/app.js`, `js/modules/recipes.js`, `js/modules/wiki.js`, `js/modules/box.js`, `js/modules/news.js`, `js/modules/appraisal.js`.
  - Shared CSS & Assets: `css/styles.css` (with dedicated mobile H5 CSS extensions/sections).
- **Smart Routing & Anti-Loop Engine**:
  - Device/Screen detection: `index.html` checks `innerWidth <= 768` or mobile UA.
  - User Preference Persistence: `localStorage.getItem('pksleep_view_pref')` (`'desktop'` or `'mobile'`).
  - Query Override: `?view=desktop` or `?view=mobile`.
  - Seamless navigation between mobile H5 and desktop version without infinite loops.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | **Dedicated App Entry & Safe Area** | `app/index.html` standalone document, viewport fit-cover, zero 404 resource links | M1 | Survey (DONE) |
| 2 | **2-Character Minimal Bottom Dock** | 5 fixed tabs: 【⚡ 圖鑑】, 【🍲 料理】, 【📚 百科】, 【📦 盒子】, 【📰 最新】 with active states & safe area padding | M1 | Survey (DONE) |
| 3 | **Smart Routing & Anti-Loop Guard** | Mobile auto-detection in `index.html`, remember choice toggle, switch to desktop link in `/app/` | M1 | Survey (DONE) |
| 4 | **Pokedex Mobile View (⚡ 圖鑑)** | App search bar with 1-tap clear, horizontal type & specialty filter chips, 2-column compact card grid | M2 | Survey (DONE) |
| 5 | **Recipes Mobile View (🍲 料理)** | Horizontal category segmented control (全部/咖哩/沙拉/甜點), pot capacity stepper (-/+), tasty multiplier toggle, 1-col recipe cards | M2 | Survey (DONE) |
| 6 | **Wiki Mobile View (📚 百科)** | 5 top sub-tabs (主技能, 副技能/性格, 評級, 食材天梯, 能量), sticky first-column scrolling data tables, sleep EXP calculator | M2 | Survey (DONE) |
| 7 | **Box & OCR Mobile View (📦 盒子)** | Photo/screenshot OCR card, batch deduplication, box management, RaenonX PR calculations | M3 | Survey (DONE) |
| 8 | **News & Gantt Mobile View (📰 最新)** | Touch horizontal scrolling event Gantt timeline, AI highlight summaries | M3 | Survey (DONE) |
| 9 | **Bottom Sheet Drawer & Modal System** | Pokedex advanced filter sheet, Box add/edit sheet (anti-duplicate subskill palette, locked height ing slots), Appraisal 6D modal | M3 | Survey (DONE) |
| 10 | **Full Feature Parity & Lab Appraisal** | Six-dimension appraisal engine, responsive SVG radar charts, evolution calculator, milestone cost calculations | M3 | Survey (DONE) |
| 11 | **Bilingual Engine & 4 Themes Support** | Complete zh-TW & en-US i18n support for mobile components; 4 themes (Midnight, Onyx, Dawn, Emerald) synchronized via localStorage | M4 | Survey (DONE) |
| 12 | **Dropdown & UI Safety Polish** | User rules compliance: dropdown arrow inset (padding-right 36px, arrow position 18px), downward options alignment | M4 | Survey (DONE) |
| 13 | **E2E Test Suite (Tiers 1-4)** | Comprehensive opaque-box test suite for desktop + mobile, 100% test pass (85/85 tests passed) | M-TEST / M5 | Survey (DONE) |
| 14 | **Adversarial Hardening (Tier 5)** | Redirection matrix (27,216 permutations passed, 0 loops, 0 errors) & static forensic audit CLEAN | M5 | Survey (DONE) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-TEST | **E2E Testing Track** | Design E2E test infra, write Tiers 1-4 tests covering all 14 features in `tests/run_tests.js`, publish `TEST_READY.md` | Survey | DONE (85/85 tests) |
| M1 | **App Shell, Dock & Routing Engine** | Create `app/index.html` structure, 2-char Dock, safe area, and smart redirection in `index.html` with anti-loop protection | Survey | DONE (Gate PASSED) |
| M2 | **Mobile Core Tab Views (Dex, Cook, Wiki)** | Pokedex search/chips/2-col cards, Recipes segmented bar/stepper/1-col cards, Wiki 5 sub-tabs & sticky tables | M1 | DONE |
| M3 | **Interactive Systems (Box, OCR, News, Sheets)** | Box Bottom Sheet with anti-duplicate palette, OCR batch card, News touch Gantt, 6D Appraisal SVG radar modal | M2 | DONE |
| M4 | **i18n Bilingual, 4 Themes & UI Polish** | Complete mobile translations (zh-TW 2-char / en-US), 4 themes, dropdown arrow padding-right 36px rules | M3 | DONE |
| M5 | **E2E Test Verification & Coverage Hardening** | Pass 100% of E2E test suite (85/85), 27,216 redirection permutations, forensic integrity audit CLEAN | M4, M-TEST | DONE |

## Interface Contracts
### Data & Path Contract (`window.__DATA_BASE_PATH__`)
- `app/index.html` defines `window.__DATA_BASE_PATH__ = '../'` prior to loading module scripts.
- All fetch methods (`app.js`, `recipes.js`, `news.js`) use multi-fallback path resolution:
  - `(window.__DATA_BASE_PATH__ || '') + 'data/data.json'`
  - `'data/data.json'`, `'../data/data.json'`, `'data.json'`
- Zero 404 network errors regardless of base URL (`/`, `/app/`, `file:///`, or subpath).

### Routing & Preference Contract (`pksleep_view_pref`)
- `localStorage` key: `'pksleep_view_pref'`
- Values: `'desktop'` | `'mobile'`
- Query param override: `?view=desktop` | `?view=mobile`
- Logic:
  - `index.html`: If query `view=desktop` -> set pref='desktop' and stay. If pref==='desktop' -> stay. If mobile screen (`<= 768px` or mobile UA) and pref!=='desktop' -> redirect to `app/index.html` (retaining URL hash).
  - `app/index.html`: Header button "💻 桌面完整版" -> sets pref='desktop' and navigates to `../index.html?view=desktop`.

### Dock & View Navigation Contract
- Active tab switching: `switchMainTab(tabId)`
- Tab IDs: `tab-pokemon`, `tab-recipes`, `tab-wiki`, `tab-box`, `tab-news`.
- Panel IDs: `panel-pokemon`, `panel-recipes`, `panel-wiki`, `panel-box`, `panel-news`.
- Dock Labels (zh-TW): `圖鑑`, `料理`, `百科`, `盒子`, `最新` (strictly 2 characters).
- Dock Labels (en-US): `Dex`, `Cook`, `Wiki`, `Box`, `News` (compact).

### Subskill Anti-Duplicate Contract
- In Box editor, subskill dropdowns / palette must enforce uniqueness: a selected subskill in slot $i$ is disabled/unavailable for selection in slot $j \neq i$.

### Dropdown Arrow & Layout Contract (Global Rule)
- Select elements: `padding-right: 36px`, `background-position: right 18px center`.
- Options menu: opens strictly downwards aligned with the bottom of the trigger, unless touching screen bottom.

### 🛡️ Mandatory Pre-Flight & Component Delivery Contract (全域開發最高準則)
1. **📱 跨端環境確認 (H5 Mobile vs Desktop Surface)**：每次開發前確認目標是 H5 App (`/app/`) 還是 桌面網頁版 (`index.html`)，樣式必須精確隔離於 `.mobile-h5-app`，嚴禁跨端相互干擾。
2. **🌐 雙語系切換與簡短翻譯確認 (Bilingual i18n Adaptation)**：新增任何組件或文字，**必須**第一時間對一遍繁中 (`zh-TW`) 與 英文 (`en-US`) 字典。英文翻譯必須正確且簡短精煉，確保長度適配不破版、不溢出。
3. **🎨 4 大主題亮/暗色雙向適配 (4-Theme Light/Dark Adaptation - 嚴禁寫死單一亮色/暗色)**：
   - 只要新增或修改任何組件，**必須**同時核對深色主題（`midnight` 深邃夜空、`onyx` 曜石暗影）與亮色主題（`dawn` 晨曦暖陽、`emerald` 萌綠森林）。
   - **嚴禁硬編碼 `#ffffff` 或固定暗色值**：背景一律使用語意化變數（`var(--bg-card)`、`var(--bg-card-inner)`、`var(--border-color)`）或透明背景 `transparent`。
   - **深色主題文字與高亮色**：必須具備足夠高飽和度、螢光高對比度（如 `#fbbf24`、`#38bdf8`、`#f472b6`），嚴禁使用暗褐色或黯淡顏色导致在黑底上無法辨識。
   - **亮色主題文字與高亮色**：自動適配為高飽和深色調（如 `#b45309`、`#0284c7`、`#be185d`），確保在白底上對比鮮明。

## Code Layout
- `app/index.html` — Mobile H5 App HTML Entry & Shell
- `index.html` — Desktop SPA Entry with smart mobile redirection guard
- `css/styles.css` — Global styles, themes, and mobile H5 dedicated styling (`.mobile-app-...`, `.bottom-dock`, `.segmented-control`, `.bottom-sheet`, `.sticky-col`)
- `js/core/i18n.js` — Shared bilingual dictionary & mobile translations
- `js/modules/app.js` — Pokedex core, search, filter chips, mobile grid rendering
- `js/modules/recipes.js` — Recipes core, segmented bar, pot stepper, tasty multiplier
- `js/modules/wiki.js` — Wiki database, 5 sub-tabs, sticky table rendering
- `js/modules/box.js` — Box database, OCR processing, bottom sheet editor, PR engine
- `js/modules/news.js` — News feed, touch Gantt chart, AI summary cards
- `js/modules/appraisal.js` — 6D appraisal lab, SVG radar chart modal
- `tests/run_tests.js` — Unified 4-tier automated test suite (90 tests)

