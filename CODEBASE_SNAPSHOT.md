# 🔒 Pokémon Sleep App — 程式碼狀態快照

> **建立時間**：2026-08-21
> **目的**：記錄當前已確認正常運作的所有功能與設定，後續修改任何需求時，以下條目必須保持不變。

---

## 📌 當前穩定版本

| 項目 | 值 |
|---|---|
| **Git Commit** | `2c15a7c8545aca5f058c50910f63207be700ca23` |
| **JS/CSS 版本號** | `v=20260830_02` (dev) |
| **最後確認** | 2026-08-26 |

---

## 📁 檔案結構與行數（不得無故大量增減）

| 檔案 | 行數 |
|---|---|
| `index.html` | 738 |
| `css/styles.css` | 7556 |
| `js/core/i18n.js` | 927 |
| `js/modules/app.js` | 1561 |
| `js/modules/wiki.js` | 5333 |
| `js/modules/box.js` | 1321 |
| `js/modules/recipes.js` | 830 |
| `js/modules/news.js` | 626 |
| `js/modules/appraisal.js` | 761 |

---

## ✅ 已確認正常運作的功能（不得破壞）

### 🔖 1. 篩選器側邊欄書籤

**正確行為**：
- 圖鑑頁 展開狀態 → 書籤 **隱藏**
- 圖鑑頁 收合狀態 → 書籤 **顯示**
- 其他頁面（Wiki / Box / Recipes / News）→ 書籤 **完全隱藏**

**位置**：`js/modules/app.js` — `switchMainTab()` 函數

**不得修改的關鍵程式碼**：
```js
// 圖鑑頁（else 分支）—— 絕對禁止改回 style.display = 'flex'
if (bookmarkHandle) bookmarkHandle.style.display = '';
// 讓 CSS 的 .collapsed class 控制顯示/隱藏
```

**CSS 規則**（`css/styles.css`）：
```css
.sidebar-bookmark-handle { display: none; }
.pokemon-filter-sidebar.collapsed .sidebar-bookmark-handle { display: flex; }
```

---

### 🌐 2. 雙語系統語言持久化

**正確行為**：
- 選擇語言 → 重新整理頁面 → 仍保持選擇的語言
- 儲存位置：`localStorage`，key = `user_lang`

**位置**：`js/core/i18n.js`

**不得移除的 Wiki 重新渲染邏輯**（`setLanguage` 函數內）：
```js
if (window.WikiDB && typeof window.WikiDB.renderWikiLayout === 'function') {
  const wikiPanel = document.getElementById('panel-wiki');
  if (wikiPanel) {
    window.WikiDB.renderWikiLayout(wikiPanel);
    if (typeof window.WikiDB.recalcTriggerChance === 'function') window.WikiDB.recalcTriggerChance();
    if (typeof window.WikiDB.recalcSleepDays === 'function') window.WikiDB.recalcSleepDays();
    if (typeof window.WikiDB.refreshCoordinateLadder === 'function') window.WikiDB.refreshCoordinateLadder();
  }
}
```

---

### ⚡ 3. 主技能英文兩行排版與無橫向滾動條規範

**正確行為**：
- 英文版本主技能過長時（包含括號如 `(Random)`、`(Fixed)`、`[Customizable]` 或 3 個單詞以上如 `Ingredient Magnet S`、`Energy for Everyone S`），自動折為兩行展示
- 中文版本保持簡潔一行展示
- 圖鑑表格容器隱藏滾動條（`scrollbar-width: none` 與 `::-webkit-scrollbar { display: none; }`），防止難看的滾輪 bar

---

### 🔑 4. Box 排序 i18n Key 對照

HTML 使用的 data-i18n key 與字典定義必須一致：

| HTML key | zh-TW | en-US |
|---|---|---|
| `box.sort_recent` | 📅 最近加入 | 📅 Recently Added |
| `box.sort_dex_asc` | 🔢 全國圖鑑編號 | 🔢 Pokedex No. |

兩個 key 在 zh-TW section（line ~195）和 en-US section（line ~424）均已定義。

---

### 📜 5. Script 載入順序（不得更改）

```html
<script src="js/core/i18n.js?v=..."></script>      <!-- 必須最先 -->
<script src="js/modules/app.js?v=..."></script>
<script src="js/modules/recipes.js?v=..."></script>
<script src="js/modules/wiki.js?v=..."></script>
<script src="js/modules/box.js?v=..."></script>
<script src="js/modules/news.js?v=..."></script>
<script src="js/modules/appraisal.js?v=..."></script>
```

> ⚠️ 每次修改 JS/CSS 後，必須同時更新版本號（如 v=20260821_03）強制清除快取。

---

### 🎨 6. 主題系統

儲存於 `localStorage`，key = `user_theme`，支援：`midnight`、`onyx`、`dawn`、`emerald`

---

### 🗂️ 7. Tab 導航與書籤對應

| Tab | Hash | 書籤 |
|---|---|---|
| Dex | `#pokemon` | 依收合狀態 |
| Dishes | `#recipes` | 隱藏 |
| Wiki | `#wiki` | 隱藏 |
| Box | `#box` | 隱藏 |
| News | `#news` | 隱藏 |

---

### 🔽 8. 下拉選單規範

- 箭頭 `background-position: right 18px center`
- `padding-right: 36px` 防止文字覆蓋箭頭

---

## 🛡️ 每次處理需求時的三大核心鐵律 (Mandatory Pre-Flight Rules)

> [!IMPORTANT]
> **以下三大鐵律為所有需求開發的最高準則，每次接手任何任務時必須優先確認與執行！**

### 1. 📱 跨端環境確認 (H5 Mobile vs Desktop Surface)
- **需求端確認**：每次處理需求前，必須先明確確認使用者是要修改 **H5 Mobile App 版 (`/app/` 與 `app/index.html`)** 還是 **桌面完整網頁版 (`index.html`)**。
- **作用域隔離**：針對 H5 移動端的樣式修改，必須嚴格限定於 `.mobile-h5-app` 命名空間或移動端專用區塊，**絕對禁止**改壞桌面版的版面結構；反之亦然。

### 2. 🌐 雙語系切換確認 (Bilingual i18n Adaptation)
- **同步支援**：任何新增/修改的 UI 文字、卡片、標籤、按鈕或提示，必須同時在 `js/core/i18n.js` 與對應模組中支援 **繁體中文 (`zh-TW`)** 與 **英文 (`en-US`)**。
- **長度與折行防護**：英文單詞長度通常大於中文，必須測試英文模式下是否會產生文字溢出、破版或難看的橫向滾動條，必要時設計智慧折行（如 2 行展示）或動態寬度。

### 3. 🎨 4 大主題亮/暗色自適應確認 (4-Theme Light/Dark Adaptation)
- **嚴禁硬編碼色值**：CSS 與 JS 中**絕對禁止寫死深色或淺色固定 Hex 色值**（如 `#0a0f1d`、`#111827`、`#1e293b`、`#f8fafc`、`#ffffff` 等）。
- **語意化變數綁定**：
  - 背景：`var(--bg-header)`、`var(--bg-card)`、`var(--bg-card-inner)`、`var(--bg-input)`
  - 文字：`var(--text-primary)`、`var(--text-secondary)`、`var(--text-muted)`
  - 邊框：`var(--border-color)`、`var(--border-color-subtle)`
  - 重點色：`var(--accent-blue)`、`var(--accent-gradient)`、`var(--color-accent-gold)`
- **強制覆蓋 4 套主題**：每次 UI 變更必須同時在以下 4 套主題進行亮/暗色驗證：
  1. 🌙 **深邃夜空 (`midnight`)** — 暗色
  2. 🖤 **曜石暗影 (`onyx`)** — 極暗色
  3. ☀️ **晨曦暖陽 (`dawn`)** — 亮色（白底深字）
  4. 🍃 **萌綠森林 (`emerald`)** — 亮色（清新綠底深字）

---

## 🚨 每次修改前必查清單

- [ ] **跨端確認**：本次修改是針對 H5 App 還是 桌面版？是否互不干擾？
- [ ] **雙語系確認**：切換繁中 (`zh-TW`) 與 英文 (`en-US`) 是否均完整顯示且無破版？
- [ ] **多主題確認**：切換 4 套主題（深邃夜空、曜石暗影、晨曦暖陽、萌綠森林）是否在亮色與暗色下均具備完美背景與清晰對比度？
- [ ] 書籤在圖鑑頁展開時是否隱藏？收合時是否顯示？
- [ ] 切換語言後 Wiki 頁是否完整重新渲染？
- [ ] 重新整理頁面後語言設定與主題設定是否保持？
- [ ] Box 排序在英文模式是否正確顯示英文？
- [ ] 英文主技能是否整齊兩行展示且不出現橫向滾動條？
- [ ] 是否已更新版本號？
- [ ] Script 載入順序 i18n.js 是否仍在最前？
