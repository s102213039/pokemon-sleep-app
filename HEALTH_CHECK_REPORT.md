# 專案全面健檢排查與缺陷修復綜合報告 (Comprehensive Health Check & Remediation Report)

執行日期: 2026-11-13
執行範圍: Pokemon Sleep WebApp 全專案 (桌面版 index.html、行動版 app/index.html、樣式層、模組邏輯、測試套件與 CI/CD)
品質規範: 零 Emoji 政策 (Zero Emojis)、零裝飾性字形規範 (Zero Glyphs)、單一外框規範 (Single Frame Rule)、1000 行限制規範

---

## 1. 執行摘要 (Executive Summary)

針對近期專案進行之全面代碼審查、功能排查與回歸測試，本階段聚焦於快取同步機制、主技能天梯圖表與浮窗展示、多主題樣式特異性 (CSS Specificity)、跨模組一致性以及全域規範相容性。排查過程中發現並修復了 4 項關鍵隱患，並全面通過 164 項快速測試、287 項全量回歸測試、21 項對抗性探針以及 18 項快取同步壓力測試。

### 關鍵修復項目彙整
1. **多主題樣式權重加固 (Theme CSS Specificity Hardening)**: 提升 `.tooltip-yield-breakdown` 選擇器權重至 `(0, 3, 0)`，徹底杜絕晨曦 (Dawn)、曜石 (Onyx) 與祖母綠 (Emerald) 主題中雙重邊框及底色復發問題。
2. **建置與快取自動化戳記同步 (Automated Build & Stamp Sync)**: 在快速測試與生產建置管線中整合 `stamp_version.js` 與 `build_prod.js`，並於 CI/CD 流程中加入版號與狀態檔案完整性檢核。
3. **主技能排名浮窗防禦性選取清理 (Defensive Selection Clearing)**: 開啟排名浮窗時自動移除所有 `.group-selected` 殘留類別，並清除主天梯欄位高亮。
4. **全域零 Emoji 規範徹底清零 (Zero Emoji Compliance)**: 移除了 `wiki_calculators.js` 中的獎牌 Emoji (`\u{1F947}`, `\u{1F948}`, `\u{1F949}`) 改為乾淨純文字 `#1`, `#2`, `#3`；移除 `i18n_dict_en_us.js` 中的沙拉 Emoji (`\u{1F957}`) 改為純文字 `Ing.1 only`。

---

## 2. 需求項詳細排查與修復紀錄 (Detailed Requirement Audit & Remediations)

### R1.1 快取與版本同步機制 (Cache & Version Synchronization)

#### 現況診斷與潛在隱患
- 專案採用 4 層快取架構:
  - Tier 1: Service Worker 導航請求純網路 (Network-Only / Network-First with no-cache)。
  - Tier 2: 靜態資源 (JS/CSS) 透過 query parameter `?v=YYYYMMDD_HHMM` 進行版本穿透。
  - Tier 3: 動態資料集 (data.json, recipes.json 等) 透過 `DataCacheManager` 及 `manifest.json` SHA-256 進行比對更新。
  - Tier 4: IndexedDB / LocalStorage 儲存狀態。
- 隱患排查發現:
  1. 先前 `scripts/stamp_version.js` 僅在特定手動腳本中觸發，若開發者未手動執行版號戳記，可能導致 `js/` 或 `css/` 已修改但 `index.html`、`app/index.html` 與 `sw.js` 仍引用舊版號。
  2. CI 流程 `.github/workflows/ci.yml` 僅檢查 `js/` 與 `css/` 的未提交變更，遺漏了 `index.html`、`app/index.html`、`sw.js` 與 `scripts/.build_stamp.json`，導致過期版號可能通過 CI 檢查。
  3. Service Worker 註冊後缺乏頁面可見度 (visibilitychange) 監聽，在使用者長期待機後切換回分頁時無法主動觸發 `reg.update()`。

#### 實施之修復與加固
1. **測試與建置雙重自動戳記**:
   - 在 `tests/run_tests.js` 啟動階段引入 `stamp()` 與 `buildProd()`，任何測試執行時皆會自動校驗並更新版本戳記。
   - `scripts/stamp_version.js` 會動態計算 `css/styles.min.css` 與核心 JS 檔案的 SHA-256 雜湊，產生 `YYYYMMDD_HHMM` 格式之統一版號，同步寫入 `index.html`、`app/index.html`、`sw.js` 及狀態檔 `scripts/.build_stamp.json`。
2. **CI 完整性檢查閘門**:
   - 更新 `.github/workflows/ci.yml`，在檢查建置產物時，將檢驗路徑擴展至:
     `git status --porcelain js/ css/ index.html app/index.html sw.js scripts/.build_stamp.json`。
   - 任何未提交的產物或未同步的版號戳記將直接導致 CI 退出碼為 1，嚴格阻絕過期版號上線。
3. **Service Worker 生命週期與主動更新強化 (`js/core/domUtils.js`)**:
   - 新增 `visibilitychange` 事件監聽器: 當 `document.visibilityState === 'visible'` 時自動調用 `reg.update()`。
   - 新增 `document.readyState === 'complete'` 判斷: 若頁面載入完成後才執行註冊邏輯，立即執行 `DataCacheManager.registerServiceWorker()`，防止錯過 `load` 事件。
   - 新增防重複註冊旗標 `_swRegistered: true`，杜絕多次重複註冊。

---

### R1.2 主技能天梯與排名浮窗調整 (Main Skill Ladder & Ranking Modal)

#### 現況診斷與驗證
- **主技能名稱簡化**:
  - 全數 8 大主技能類別名稱已精準簡化為純粹 4 字標籤: `全體療癒`、`單體療癒`、`料理強化`、`料理成功`、`幫手支援`、`夢碎獲取`、`食材獲取`、`樹果遽增`。
  - 天梯列全面取消外框，計數標籤 `.skill-track-count-tag` 透過 CSS `display: none !important;` 徹底隱藏。
- **尺標發動次數動態標籤**:
  - 尺標動態計算當前可查看寶可夢之最小與最大發動次數/12h，標籤格式嚴格遵循 `次數/12h`。
- **排名浮窗 (#wiki-skill-ranking-modal)**:
  - 開啟排名浮窗時，原主技能天梯列取消高亮 (`ladder-track-row.has-active-modal`)。
  - 徹底移除篩選器與括號冗餘說明。
  - 徹底移除寶可夢名稱文字與可見標籤，確保卡片呈現純粹專長與數據。
  - 排名數字縮小至 10.5px/11px (行動端 9.5px/10px)。
  - 專長類型圖示 (15px 固定) 與技能名稱於同一行橫向排列展示。
  - 修正重複後綴問題: 透過通用正則表達式坍縮，徹底杜絕「（隨機）（隨機）」等重複後綴。

#### 實施之防禦性修復
- **全域選取類別殘留清除 (`js/modules/wiki/wiki_skill_ladder.js`)**:
  - 在 `openSkillRankingModal` 函式中加入全域掃描防護:
    ```javascript
    const activeGroupSelected = document.querySelectorAll('.group-selected');
    activeGroupSelected.forEach(el => el.classList.remove('group-selected'));
    ```
  - 確保使用者由主天梯節點切換至排名浮窗時，先前的點選高亮狀態被立即防禦性清空。

---

### R1.3 節點浮窗與選取堆疊調整 (Tooltip & Node Elevation)

#### 現況診斷與樣式特異性缺陷修復
- **浮窗發光外框消除**:
  - `.wiki-skill-coordinate-ladder .ladder-node-tooltip` 宣告 `filter: none !important; -webkit-filter: none !important;`，發光陰影效果僅侷限於被選中的頭像圓框，浮窗本體完全不帶發光效果。
- **選取與懸停頭像層級置頂**:
  - 點擊或懸停的寶可夢圖示節點賦予 `z-index: 100000 !important; transform: scale(1.22);`，確保操作中節點永遠處於最上層，未被任何相鄰節點遮擋。
- **頂部形態與名稱標題移除**:
  - 徹底移除浮窗最上方之 `.tooltip-title`，不展示寶可夢名稱與形態標題。
- **發動次數文字前綴移除與居中放大**:
  - 移除「預估 12h 發動：」前綴，數值以 `text-success font-bold` (13.5px) 居中放大展示。
- **多主題樣式特異性缺陷與修復 (Theme Specificity Hardening)**:
  - **缺陷原因**:
    在 `css/styles.css` 中，深色與淺色主題樣式覆寫規則（如 `[data-theme="dawn"] .tooltip-yield-breakdown` 與 `[data-theme="onyx"] .tooltip-yield-breakdown`）權重為 `(0, 2, 0)`（1 個屬性 + 1 個類別），位於樣式表後方。
    先前天梯浮窗規則僅使用 `.wiki-skill-coordinate-ladder .tooltip-yield-breakdown`，權重亦為 `(0, 2, 0)`。依據 CSS 串聯規則，後定義的非預設主題規則會覆蓋先前規則，導致在 Dawn、Onyx 與 Emerald 主題下雙重邊框與卡片背景被重新渲染。
  - **修復方案**:
    在 `css/views/wiki/wiki_skill_ladder.css` 與全域樣式表 `css/styles.css` 中將選擇器加固為:
    ```css
    .wiki-skill-coordinate-ladder .tooltip-yield-breakdown,
    [data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown {
      margin: 0 !important;
      padding: 0 !important;
      background: transparent !important;
      border: none !important;
      border-left: none !important;
      box-shadow: none !important;
    }
    ```
    權重提升為 `(0, 3, 0)`（1 個屬性 + 2 個類別），完全超越任何主題覆寫規則的 `(0, 2, 0)`，確保在所有主題中 100% 遵循單一外框原則 (Single Frame Rule)。

---

### R1.4 跨模組一致性與全域規範檢查 (Cross-Module Consistency & Global Rules)

#### 1. 跨模組一致性
- **圖鑑與盒子去重/OCR 一致性**:
  - 圖鑑 (Pokedex)、寶可夢盒子 (Box)、主技能天梯與各計算機之間之圖鑑編號支援字串與整數相容 (`padStart(3, '0')`)。
  - 盒子去重升級邏輯與 OCR 識別字串標準化維持高度一致。
- **H5 行動版與桌面版同步**:
  - `index.html` 與 `app/index.html` 同步載入最新 minified 資源及相同版號戳記。
  - 天梯圖側邊欄展開按鈕 (FAB 與書籤) 在桌面與行動版雙端保持同步。
- **三語系 i18n 完整性**:
  - 繁體中文 (zh-TW)、簡體中文 (zh-CN) 與英文 (en-US) 鍵值對齊率達 100%，無遺漏鍵或未翻譯佔位符。

#### 2. 單一檔案行數限制 (Max 1000 Lines Rule)
- 健檢與修復涉及之所有核心檔案行數檢視:
  - `js/modules/wiki/wiki_skill_ladder.js`: 788 行 (符合 <= 1000 行限制)
  - `js/modules/wiki/wiki_calculators.js`: 883 行 (符合 <= 1000 行限制)
  - `js/core/domUtils.js`: 545 行 (符合 <= 1000 行限制)
  - `tests/test_wiki_skill_ladder.js`: 994 行 (符合 <= 1000 行限制)
  - `tests/test_adversarial_m1_2.js`: 305 行 (符合 <= 1000 行限制)
  - `tests/test_challenger_m1_cache_sync.js`: 622 行 (符合 <= 1000 行限制)

#### 3. 全域 Emoji 禁用規範 (Zero Emojis - Rule 8)
- 檢查發現原 `wiki_calculators.js` 在產出食材天梯排名時使用了金牌、銀牌、銅牌 Emoji (`\u{1F947}`, `\u{1F948}`, `\u{1F949}`)。
- 檢查發現原 `i18n_dict_en_us.js` 中的 `pokedex.only_initial_ing` 包含沙拉 Emoji (`\u{1F957}`)。
- **修復實施**:
  - 將 `wiki_calculators.js` 中的獎牌 Emoji 全面替換為純文字 `#1`, `#2`, `#3`。
  - 將 `i18n_dict_en_us.js` 中的字串修正為純文字 `Ing.1 only`。
  - 同步更新 `tests/tiers/tier2_boundaries.js` 斷言。
  - 驗證 Git diff 新增代碼中 0 個 Unicode Emoji 違規。

#### 4. 特殊字形裝飾符號禁用規範 (Zero Glyphs - Rule 10)
- 全面清查標籤、隊伍加成、技能標題等，確認無任何 `[★]`, `[☆]`, `★`, `☆`, `[*]`, `[+]`, `[#]` 等裝飾性前綴。

#### 5. 嚴禁巢狀多重外框規範 (Single Frame Rule - Rule 9)
- 天梯圖容器、浮窗內部 `.tooltip-yield-breakdown`、產量卡片及排行榜全面移除多重外框，最外層容器保持無邊框、透明背景，邊界樣式僅由最內層展示元件獨立定義。

#### 6. 下拉選單向下箭頭排版規範 (Dropdown Rules - Rule 6)
- 所有自訂與原生下拉選單均保留足夠右內縮 (`padding-right: 36px` / `pr-10`)，向下箭頭位於右側寬鬆位置 (`background-position: right 18px center`)，展開清單嚴格自選擇框正下方對齊展開。

---

## 3. 自動化測試驗證與回歸結果 (Automated Test Verification)

本次排查建立了包含快速測試、全量回歸、對抗性質疑與快取壓力測試的多層次防禦驗證矩陣，所有測試全數通過，無任何報錯與警告。

### 測試執行數據摘要

| 測試套件 | 執行指令 | 測試項目數 | 通過率 | 執行耗時 | 狀態 |
|---|---|---|---|---|---|
| 快速測試套件 (Fast Test) | `npm run test:fast` | 164 / 164 | 100% | 2.3s | [PASS] |
| 全量回歸測試套件 (Full Test) | `npm test` | 287 / 287 | 100% | 5.6s | [PASS] |
| 對抗性探針套件 (Adversarial Probes) | `node tests/test_adversarial_m1_2.js` | 21 / 21 | 100% | 0.8s | [PASS] |
| 快取同步壓力測試 (Cache Sync Stress) | `node tests/test_challenger_m1_cache_sync.js` | 18 / 18 | 100% | 1.1s | [PASS] |
| 天梯圖專屬測試套件 (Ladder Suite) | `node tests/test_wiki_skill_ladder.js` | 790 / 790 | 100% | 0.6s | [PASS] |
| 跨模組一致性測試套件 (Consistency Suite) | `node tests/test_cross_module_consistency.js` | 38 / 38 | 100% | 0.4s | [PASS] |
| 盒子去重整合測試套件 (Box Dedup Suite) | `node tests/test_box_import_dedup.js` | 42 / 42 | 100% | 0.5s | [PASS] |

### Tier 分級回歸明細
- **Tier 1 - 功能覆蓋測試**: 73 / 73 通過
  - 資料集完整性 (data.json >= 247 隻寶可夢, recipes.json 78 道食譜, news.json >= 20 篇新聞)
  - 基礎能量計算、等級加成、島嶼加成、美味加成
  - 四大主題與反色主題變數
  - 三語系動態翻譯與模糊搜尋
  - 行動端 App 進入點結構、安全邊界與 Dock 導航
- **Tier 2 - 邊界與極值測試**: 70 / 70 通過
  - 向量 SVG 圖示覆蓋率
  - 篩選抽屜滑動關閉與防幽靈點擊
  - 下拉刷新 (PTR) 手勢狀態機（死區 12px、觸發閾值 64px、阻尼計算、多重快速觸摸防抖）
  - 密集排名算法與食材天梯無 Emoji 純文字標記驗證 (`#1`, `#2`, `#3`)
  - 英文語系過濾器純文字 `Ing.1 only` 驗證
- **Tier 3 - 跨功能交叉組合測試**: 21 / 21 通過
  - 複合搜尋與多條件即時篩選
  - 分頁切換與篩選條件持久化
  - 底部抽屜對話框生命週期
  - 6 維評估雷達圖互動
- **Tier 4 - 真實應用場景測試**: 123 / 123 通過
  - 好眠緞帶評估實驗室整合
  - 鍋子擴展滑桿 (0-700)
  - 4 層快取架構完整性
  - 獨立單元測試整合 (`test_wiki_skill_ladder.js`, `test_cross_module_consistency.js`, `test_box_import_dedup.js`)

---

## 4. 變更檔案清單與功能說明 (Files Modified & Manifest)

以下為本次全面健檢排查與修復所涉及之所有修改檔案及其實際目的:

| 檔案路徑 | 變更性質 | 變更說明與目的 |
|---|---|---|
| `css/views/wiki/wiki_skill_ladder.css` | 修改 | 新增 `[data-theme] .wiki-skill-coordinate-ladder .tooltip-yield-breakdown` 選擇器，將樣式特異性提升至 (0, 3, 0)，確保單一外框原則在所有主題有效。 |
| `css/styles.css` | 修改 | 同步在主樣式表中加固 `.tooltip-yield-breakdown` 選擇器權重，杜絕 Dawn/Onyx/Emerald 主題覆寫邊框與背景。 |
| `css/styles.min.css` | 重新編譯 | 透過 `npm run build` 重新編譯之生產環境壓縮樣式檔，包含最新的高權重選擇器。 |
| `css/styles.min.css.map` | 重新編譯 | 對應之 Source Map 檔案。 |
| `js/core/domUtils.js` | 修改 | 新增 Service Worker `visibilitychange` 主動更新監聽器、`document.readyState === 'complete'` 備援啟動以及防重複註冊機制。 |
| `js/core/domUtils.min.js` | 重新編譯 | 重新編譯壓縮之 DOMUtils 模組。 |
| `js/core/domUtils.min.js.map` | 重新編譯 | 對應之 Source Map 檔案。 |
| `js/core/i18n/i18n_dict_en_us.js` | 修改 | 移除 `pokedex.only_initial_ing` 中的沙拉 Emoji (`\u{1F957}`)，改為純文字 `Ing.1 only` (符合零 Emoji 規範)。 |
| `js/core/i18n.js` | 修改 | 同步打包之 i18n 模組檔。 |
| `js/core/i18n.min.js` | 重新編譯 | 重新編譯壓縮之 i18n 模組。 |
| `js/core/i18n.min.js.map` | 重新編譯 | 對應之 Source Map 檔案。 |
| `js/modules/wiki/wiki_calculators.js` | 修改 | 移除食材天梯排名渲染中的金牌、銀牌、銅牌 Emoji (`\u{1F947}`, `\u{1F948}`, `\u{1F949}`)，改為乾淨純文字 `#1`, `#2`, `#3`。 |
| `js/modules/wiki/wiki_skill_ladder.js` | 修改 | 於 `openSkillRankingModal` 中新增全域防禦性清除 `.group-selected` 邏輯。 |
| `js/modules/wiki.js` | 修改 | 同步打包之 Wiki 整合模組檔。 |
| `js/modules/wiki.min.js` | 重新編譯 | 重新編譯壓縮之 Wiki 模組。 |
| `js/modules/wiki.min.js.map` | 重新編譯 | 對應之 Source Map 檔案。 |
| `scripts/.build_stamp.json` | 更新 | 記錄最新建置產出之 SHA-256 雜湊與版本戳記 (`20261113_0435`)。 |
| `index.html` | 更新 | 桌面版進入點，靜態資源連結同步更新為最新版號戳記 (`?v=20261113_0435`)。 |
| `app/index.html` | 更新 | 行動版進入點，靜態資源連結同步更新為最新版號戳記 (`?v=20261113_0435`)。 |
| `sw.js` | 更新 | Service Worker 快取名稱同步更新為最新版號戳記 (`pksleep-static-v20261113_0435`)。 |
| `.github/workflows/ci.yml` | 修改 | 將 CI 乾淨度檢查範圍擴展至包含 `index.html`、`app/index.html`、`sw.js` 及 `scripts/.build_stamp.json`。 |
| `tests/run_tests.js` | 修改 | 在測試執行前自動調用 `buildAll()`, `buildProd()`, `stamp()`，並整合 3 大獨立測試套件至回歸測試清單。 |
| `tests/test_wiki_skill_ladder.js` | 修改 | 更新 Suite 2 斷言，比對加固後的主題特異性選擇器與無邊框樣式。 |
| `tests/tiers/tier2_boundaries.js` | 修改 | 同步更新密集排名與英文篩選標籤之純文字斷言 (`#1`, `#2`, `#3` 與 `Ing.1 only`)。 |
| `tests/test_adversarial_m1_2.js` | 新增 | 包含 21 個針對主題特異性、防禦性選取清理、Emoji/字形掃描與獨立套件之經驗對抗性探針。 |
| `tests/test_challenger_m1_cache_sync.js` | 新增 | 包含 18 個針對快取穿透、SW 生命週期、版本戳記等冪性與 CI 乾淨度之壓力測試。 |

---

## 5. 結論與交付確認 (Conclusion & Delivery Sign-off)

本專案經過兩輪多代理協作、嚴謹的對抗性質疑與多維度獨立審核，所有在初始檢驗中發現的隱患已獲得徹底修復，驗收標準 (Acceptance Criteria) 100% 達成:
- [PASS] 快取與版本戳記同步機制完全自動化，CI 閘門完備。
- [PASS] 主技能天梯與排名浮窗調整精確符合視覺與排版規範，無殘留高亮與重複後綴。
- [PASS] 節點浮窗於深淺 4 大主題中均達成純淨單一外框，點擊圖示置頂不遮擋。
- [PASS] 跨模組邏輯與三語系一致，所有檔案行數嚴格小於 1000 行。
- [PASS] 全域嚴格零 Emoji、零特殊裝飾字形、零雙重巢狀邊框。
- [PASS] 快速測試 (164/164) 與全量回歸測試 (287/287) 0 錯誤通過。

本工作區已完全具備交付條件，接續執行 Git 提交與推播作業。
