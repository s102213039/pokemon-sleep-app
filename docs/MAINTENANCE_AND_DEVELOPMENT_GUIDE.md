# Pokémon Sleep SPA 開發維護與擴充指南 (Maintenance & Development Guide)

> **文件路徑:** `docs/MAINTENANCE_AND_DEVELOPMENT_GUIDE.md`  
> **適用對象:** 接續維護的開發者、資料管理員與 AI Agent  
> **最後校驗日期:** 2026-10-21（全站模組化、生產資料壓縮與原生 IndexedDB 快取全面實裝）  
> **測試基線:** 227 / 227 項 E2E 端到端自動化測試 100% 通過（0 失敗）

---

## 一、 專案全景與模組化架構 (Architecture Overview)

本專案採原生純前端單頁應用（Vanilla SPA）架構，已徹底告別過去單一千行巨石檔案的舊模式，全面落實**領域驅動模組化（Domain-Driven Modularization）**與**極速本地建構器（Sub-25ms Bundler）**。

### 1.1 前端程式碼原始碼目錄結構 (`js/modules/`)
全站所有業務邏輯均拆解於獨立子目錄中，修改特定功能時**必須優先修改子模組原始檔**，切勿直接在編譯後的發行檔做不可逆的覆蓋：

| 領域模組 | 原始碼子模組目錄 | 子模組清單與職責 | 編譯目標檔 | 獨立編譯器 |
| :--- | :--- | :--- | :--- | :--- |
| **圖鑑 (Pokedex)** | `js/modules/pokedex/` | `pokedex_core.js` (狀態、排序、索引)<br>`pokedex_render.js` (卡片與表格渲染、IndexedDB 資料載入)<br>`pokedex_formulas.js` (能量、幫速、食材產量公式)<br>`pokedex_modal.js` (詳細資料彈窗) | `js/modules/app.js` | `scripts/build_app.js` (2ms) |
| **倉庫 (User Box)** | `js/modules/box/` | `box_filter.js` (篩選器與屬性按鈕)<br>`box_storage.js` (本機儲存、CRUD、匯入匯出)<br>`box_modal.js` (手動編輯、性格、副技能選單)<br>`box_ocr.js` (截圖辨識、文字提取、錨點定位)<br>`box_main.js` (生命週期、事件綁定、全域導出) | `js/modules/box.js` | `scripts/build_box.js` (1ms) |
| **百科 (Wiki)** | `js/modules/wiki/` | `wiki_skills.js` (主副技能數據、幫速矩陣)<br>`wiki_ladder.js` (天梯篩選、及格線試算)<br>`wiki_camps.js` (島嶼營地出沒、IndexedDB 睡姿快取)<br>`wiki_render.js` (子面板卡片與看板 DOM 渲染)<br>`wiki_items.js` (道具薰香百科與彈窗)<br>`wiki_main.js` (主版面配置、子分頁切換、WikiDB 導出) | `js/modules/wiki.js` | `scripts/build_wiki.js` (2ms) |
| **研究室 (Appraisal)** | `js/modules/lab/` | `lab_core.js` (六維評測 PR 演算法、里程碑成本計算)<br>`lab_team.js` (組隊模擬、目標料理導向配隊、食材供需看板)<br>`lab_compare.js` (對比槽位、基準等級切換、六維戰力矩陣)<br>`lab_main.js` (生命週期、全域註冊) | `js/modules/appraisal.js` | `scripts/build_appraisal.js` (2ms) |
| **核心層 (Core)** | `js/core/` | `idbStorage.js` (原生 IndexedDB 結構化二進位快取驅動器)<br>`domUtils.js` (DOM 查詢、manifest.json 差分比對、DataCacheManager)<br>`cloudSync.js` (Supabase 雲端備份與回環防抖)<br>`i18n.js` (中英雙語字典與動態翻譯) | 原生直接引入 | 無需打包 |

### 1.2 樣式模組目錄結構 (`css/`)
35,000+ 行的單一 CSS 樣式已解構為 18 個專責樣式模組：
* `css/tokens.css`: 全站 CSS 變數、4 大核心主題配色、深淺雙向對比規範。
* `css/base.css`: 全站基礎 Reset、字體、排版、按鈕基底。
* `css/components/`: 自訂下拉選單 (`custom-select.css`)、回到頂部按鈕 (`back-to-top.css`)、彈窗子模組 (`components/modals/`)。
* `css/views/`: 圖鑑 (`pokedex.css`)、食譜 (`recipes.css`)、百科子樣式 (`views/wiki/`)、最新消息 (`news.css`)。
* `css/mobile/`: 行動端 H5 各分頁專屬優化 (`mobile/box.css`、`mobile/lab.css`、`mobile/nav.css` 等)。
* **編譯工具**: 透過 `scripts/build_css.js`（3ms）打包合併至 `css/styles.css`。

---

## 二、 本次已完成之重大系統改動 (Current Implemented Enhancements)

### 2.1 生產環境資料壓縮 (Production Minification)
* **改動背景**: 過去 `data/*.json` 靜態資料庫包含格式化縮排與換行，未壓縮體積達 1,173.9 KB，在行動端或網路弱訊環境冷啟動時造成額外下載延遲。
* **實裝成果**: 
  - 建立 `scripts/minify_data.js`，於建構時將全站 7 大靜態 JSON 檔案壓至最小體積（**762.6 KB**），單次冷下載直接減重 **411.3 KB (-35.0%)**。
  - 針對關鍵大檔瘦身尤為顯著：`ladder_lv60.json` 減少 45.7%、`sleep_styles.json` 減少 39.5%、`data.json` 減少 26.5%。
  - 自動依據壓縮後的二進位位元組重新計算 SHA-256 雜湊，並同步寫入 `data/manifest.json`，確保全站版本校驗 100% 確定性。

### 2.2 原生 IndexedDB 結構化二進位快取全面接管
* **改動背景**: 瀏覽器 LocalStorage 有嚴格的 5MB 配額限制。當快取 `sleep_styles.json` (2.8MB) 與 `ladder_lv60.json` 時，易觸發 `QuotaExceededError` 導致快取失敗、反覆自網路重抓。
* **實裝成果**:
  - 建立純原生、零外部依賴的 `js/core/idbStorage.js`，內建 `cache`（靜態大型 JSON）與 `user`（使用者倉庫、自訂隊伍）雙對象倉庫。
  - 升級 `DataCacheManager.saveCachedJson`：將資料以原生 JavaScript 結構化物件直接存入 IndexedDB，免除每次開檔重複執行 `JSON.parse` 的 CPU 主線程阻塞。
  - 升級 `DataCacheManager.checkFileNeedsUpdate`：當 LocalStorage 快取不存在或遭清理時，自動非同步檢索 IndexedDB 快取 (`getCachedJsonAsync`)。
  - 圖鑑 (`pokedex_render.js`)、料理 (`recipes.js`)、消息 (`news.js`)、百科島嶼營地 (`wiki_camps.js`) 全面接入 IndexedDB，達成**熱開 0ms 載入、0 位元組網路請求、0.3ms 本地反序列化**。

### 2.3 Tier 4 巨石測試套件模組化
* 原 8,993 行巨石檔案 `tests/tiers/tier4_scenarios.js` 解構為 18 行微型協調器，分流至 4 個專責子套件 (`tests/tiers/tier4/tier4_part1..4.js`)。
* 新增第 110 項測試用例（全站第 227 項測試）：全面檢驗資料壓縮完整性、SHA-256 雜湊一致性、IDBStorage 讀寫刪除與 DataCacheManager 快取連動。

---

## 三、 資料庫維護與新增作業指引 (Data Maintenance Guide)

為確保往後開發者或 AI 擴充、修訂資料時，既能享受清晰的 git diff 審查，又不會破壞生產環境極致壓縮體積，請嚴格遵守**雙模式作業流程**：

### 3.1 雙模式切換命令 (Dual-Mode Commands)

```bash
# 步驟 1：開始編輯資料前，切換為「開發格式化模式」（展開為 2 格縮排好讀格式）
npm run data:format

# 步驟 2：進行資料編輯、新增或欄位調整（請參照 3.2 節規範）
# ... 編輯 data/*.json ...

# 步驟 3：編輯完成後，一鍵壓回「生產極致壓縮模式」（自動更新 SHA-256 雜湊至 manifest.json）
npm run data:minify

# 步驟 4：執行全站回歸測試，確認資料解析無誤
npm test
```

### 3.2 各資料庫欄位結構與新增規範

#### 1. 寶可夢圖鑑資料庫 (`data/data.json`)
* **格式**: JSON Array
* **必填欄位**:
  ```json
  {
    "id": 248,
    "name_cn": "班基拉斯",
    "name_en": "Tyranitar",
    "name_jp": "バンギラス",
    "sleep_type": "snoozing",
    "specialty": "食材",
    "type": "暗",
    "berry": "刺角果",
    "carry_limit": 19,
    "base_frequency": 2700,
    "main_skill": "能量填充M",
    "skill_trigger_rate": 0.038,
    "ingredient_percentage": 0.265,
    "evolution_stage": 3,
    "ingredients": [
      { "name": "暖暖薑", "count": 2 },
      { "name": "豆製肉", "count": 5 },
      { "name": "油炸豆腐", "count": 7 }
    ]
  }
  ```
* **注意事項**:
  - `id` 為整數（不可重複）。
  - `specialty` 必須為 `"樹果"`、`"食材"` 或 `"技能"` 之一。
  - `sleep_type` 必須為 `"dozing"`（深灰/淺睡）、`"snoozing"`（安眠/安穩）或 `"slumbering"`（熟睡）。
  - 新增後請同步檢查 `js/core/i18n.js` 是否具備該寶可夢的中英雙語名稱對照。

#### 2. 料理食譜資料庫 (`data/recipes.json`)
* **格式**: JSON Array
* **必填欄位**:
  ```json
  {
    "id": 79,
    "category": "curry",
    "name_cn": "新版特製咖哩",
    "name_en": "Special New Curry",
    "pot_size": 35,
    "base_energy": 6400,
    "ingredients": [
      { "name": "特選蘋果", "count": 12 },
      { "name": "品鮮蘑菇", "count": 8 }
    ]
  }
  ```
* **注意事項**:
  - `category` 必須為 `"curry"`（咖哩/濃湯）、`"salad"`（沙拉）或 `"dessert"`（甜點/飲料）。
  - `pot_size` 必須等於所有材料的 `count` 總和。

#### 3. 道具與薰香資料庫 (`data/items.json`)
* **格式**: JSON Object，以道具分類分組（如 `"mints"`, `"stones"`, `"incenses"`）。
* **注意事項**:
  - 新增薄荷或進化石時，需提供 `name_cn`, `name_en`, `desc_cn`, `desc_en`, `icon` 與 `effect`。
  - 若新增寶可夢專屬薰香，請於 `incenses` 中配置對應之 `pokemon_id` 與 `camp_ids`。

#### 4. 睡姿與碎片資料庫 (`data/sleep_styles.json`)
* **格式**: JSON Object，以 `byName` 封裝：
  ```json
  {
    "byName": {
      "新寶可夢": {
        "1": ["光合作用睡", "Sunbathing Sleep", 23, 46, 4, "こうごうせい寝"],
        "2": ["踏步睡", "Braced Sleep", 122, 255, 6, "ふんばり寝"],
        "3": ["伸藤睡", "Vine-Sprout Sleep", 479, 1005, 9, "ツルだし寝"],
        "4": ["肚子上睡", "Atop-Belly Sleep", 720, 1513, 10, "おなかのうえ寝"]
      }
    }
  }
  ```
* **陣列元素順序**: `[中文睡姿名, 英文睡姿名, 研究EXP, 夢之碎片, 睡眠星級(1~4), 日文睡姿名]`。

#### 5. 官方公告與活動資料庫 (`data/news.json`)
* **格式**: JSON Array，新增之新聞物件直接放置於陣列開頭（最新排最前）。
* **必填欄位**: `id`, `category` (`"event"|"update"|"maintenance"|"notice"`), `title_cn`, `title_en`, `date` (`YYYY/MM/DD`), `summary_cn`, `summary_en`, `timeline`。

---

## 四、 程式碼與樣式模組維護指引 (Code & Style Maintenance Guide)

### 4.1 修改現有功能流程
1. **定位模組**:
   - 圖鑑相關邏輯 -> 編輯 [js/modules/pokedex/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/modules/pokedex/) 下的對應模組。
   - 倉庫與 OCR 邏輯 -> 編輯 [js/modules/box/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/modules/box/) 下的對應模組。
   - 百科、天梯、技能數據 -> 編輯 [js/modules/wiki/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/modules/wiki/) 下的對應模組。
   - 深度研究室、配隊模擬 -> 編輯 [js/modules/lab/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/js/modules/lab/) 下的對應模組。
   - 樣式調整 -> 編輯 [css/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/css/) 下的對應子樣式檔案。
2. **打包合併**:
   ```bash
   # 一鍵編譯所有 37 個 CSS 與 JS 子模組（耗時僅 10ms）
   npm run build:all
   ```
3. **驗證與防退化檢查**:
   ```bash
   # 執行全套測試，確保 227 項用例 100% 通過
   npm test
   ```

### 4.2 新增樣式模組流程
若需為新功能建立專屬 CSS（例如 `css/views/new_view.css`）：
1. 在 `css/` 適當子目錄建立該 CSS 檔案。
2. 開啟 [scripts/build_css.js](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/scripts/build_css.js)，在 `CSS_MODULES` 陣列中加入該檔案路徑。
3. 執行 `npm run build:css` 或 `npm run build:all`，新樣式將自動被納入 `css/styles.css`。

---

## 五、 自動化測試維護與極速執行策略 (Testing Guide & Fast Execution)

完整測試策略詳見專屬指南：[docs/TESTING_STRATEGY.md](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/docs/TESTING_STRATEGY.md)。
測試框架位於 [tests/](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/)，採純原生架構，無龐大第三方測試框架負擔：

### 5.1 測試套件結構
* `tests/run_tests.js`: 主入口，支援 `--fast`, `--skip-tier4`, `--tier=N`, `--grep="pattern"` 等多種彈性參數。
* `tests/test_harness.js`: 輕量斷言庫 (`assert`, `assertEquals`, `MiniElement`, Mock DOM, `setGrepFilter`)。
* `tests/tiers/tier1_coverage.js`: 基礎資料庫與元件結構覆蓋測試（67 項）。
* `tests/tiers/tier2_boundaries.js`: 邊界極限、空值與篩選條件防禦測試（43 項）。
* `tests/tiers/tier3_combos.js`: 跨模組狀態切換與連動測試（8 項）。
* `tests/tiers/tier4/`: 真實業務情境與複雜功能驗證測試（118 項）：
  - `tier4_part1.js`: 用例 1-30（圖鑑工作流、H5 跳轉、導航生命週期）
  - `tier4_part2.js`: 用例 31-60（百科營地、天梯及格線、OCR 初階）
  - `tier4_part3.js`: 用例 61-90（薄荷中和、緞帶扣減、雷達圖與公式）
  - `tier4_part4.js`: 用例 91-118（道具百科、深度研究室、萬次 OCR 壓力、快取與各島嶼營地）

### 5.2 核心命令與使用時機
```bash
# 日常開發推薦：極速執行 Tier 1~3 (118 項，僅 0.25 秒)
npm run test:fast

# 完整發布回歸：全量執行 Tier 1~4 (236 項，僅 2.1 秒)
npm test

# 精準單元過濾：僅測試名稱包含特定關鍵字之測試用例 (數毫秒)
node tests/run_tests.js -g "OCR"
node tests/run_tests.js -g "Amber"

# 指定單一或組合 Tier
npm run test:tier1    # 0.08 秒
npm run test:tier4    # 1.80 秒
node tests/run_tests.js --tier=2,3
```

### 5.3 防止寫死原則 (Anti-Hardcoding)
1. **路徑解析**：所有測試腳本一律透過 `path.resolve(__dirname, '..')` 或 `WORKSPACE_ROOT` 計算路徑，嚴禁寫死主機路徑或依賴 `process.cwd()`。
2. **參數適配**：命令列解析支援 `--tier=1,2`, `-t 1,2`, `--skip-tier4`, `--fast`, `-g` 等多種格式，且自動過濾非法輸入，杜絕調用報錯。
3. **自動編譯**：測試運行前自動調用 `buildAll()`，確保永遠對最新建構產物驗證，無須手動記住打包。

---

## 六、 部署發布與防退化鐵則 (Deployment & Anti-Regression Checklist)

任何修改送出至線上環境前，必須按順序逐一檢核下列項目：

- [ ] **1. 資料壓縮與雜湊更新**: 修改 `data/*.json` 後，已執行 `npm run data:minify` 並確認 `data/manifest.json` 已更新最新 SHA-256 雜湊。
- [ ] **2. 前端模組打包編譯**: 修改任何 `js/modules/` 或 `css/` 子模組後，已執行 `npm run build:all`，生成最新 `app.js`, `box.js`, `wiki.js`, `appraisal.js` 與 `styles.css`。
- [ ] **3. 236/236 自動化測試全過**: 執行 `npm test` 確認通過率 100%，無任何退化報錯（日常開發時可隨時執行 `npm run test:fast` 極速檢查）。
- [ ] **4. 零 Emoji 規範 (Rule 8)**: 全站程式碼、註解、UI 文字、文件與 Git Commit 訊息嚴禁包含任何 Emoji。
- [ ] **5. 嚴禁特殊裝飾符號 (Rule 10)**: 嚴禁在 UI 或 Markdown 中添加 `[★]`, `★`, `☆` 等裝飾性字形符號。
- [ ] **6. 嚴禁巢狀雙重外框 (Rule 9)**: UI 容器邊框不重疊，卡片與表格內部自帶邊框時最外層容器保持無框。
- [ ] **7. 跨工具共用文件同步 (Rule 7)**: 依規範將最新文件同步至 `~/.gemini/agent-docs/projects/pokemon-sleep-app/`。
- [ ] **8. 推送遠端觸發 Pages 部署**: 執行 `git push origin main`，確保 GitHub Pages 自動化流程順利發布。
