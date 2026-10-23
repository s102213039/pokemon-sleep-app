# 自動化測試架構與極速執行策略指引 (Testing Strategy & Fast Execution Guide)

> [!IMPORTANT]
> **全域測試核心原則：**
> 1. **反饋極速化 (Sub-Second Feedback)**：日常功能開發與 UI 微調優先執行 `npm run test:fast`（耗時僅 0.25 秒），杜絕無謂等待。
> 2. **發布前全量驗收 (Full Regression Gate)**：任何重大交付或發布前執行 `npm test`（全量 236 項測試，耗時約 2.1 秒）。
> 3. **嚴禁寫死路徑與環境 (No Hardcoded Calling Assumptions)**：所有腳本、測試與調用邏輯必須以動態路徑與跨環境標準實作，嚴禁寫死絕對路徑或特定工作目錄。
> 4. **零 Emoji 與零字形規範**：所有測試用例名稱、斷言文字、日誌與報告嚴禁使用任何 Emoji 或特殊裝飾字形符號。

---

## 一、 測試命令快速索引 (Command Quick Reference)

| 常用指令 | 涵蓋範圍 | 執行時間 | 適用場景 |
| :--- | :--- | :--- | :--- |
| `npm run test:fast` | **Tier 1 + Tier 2 + Tier 3** (118 項核心測試) | **~0.25 秒** | **日常程式碼修改、UI 排版微調、即時反饋** (推薦) |
| `npm test` | **Tier 1 ~ Tier 4 全量測試** (236 項完整測試) | **~2.1 秒** | **發布前驗收、完整回歸、CI 部署** |
| `npm run test:tier1` | **Tier 1: 功能覆蓋** (67 項) | ~0.08 秒 | 資料庫完整性、HTML 結構、基礎公式 |
| `npm run test:tier2` | **Tier 2: 邊界與極限防禦** (43 項) | ~0.08 秒 | 邊界數值、空值、UI 標籤、各類別篩選 |
| `npm run test:tier3` | **Tier 3: 跨模組狀態連動** (8 項) | ~0.05 秒 | 跨頁面狀態、模態彈窗生命週期、複合篩選 |
| `npm run test:tier4` | **Tier 4: 真實情境與壓力測試** (118 項) | ~1.8 秒 | OCR 模糊解析、萬次壓力測試、全真情境 |

---

## 二、 彈性命令列參數 (CLI Flexible Arguments)

測試主入口位於 [`tests/run_tests.js`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/run_tests.js)，原生支援彈性命令列引數，無需任何第三方依賴：

### 2.1 跳過耗時之 Tier 4 壓力測試 (`--fast` / `--skip-tier4`)
```bash
# 以下指令效果完全相同，均只運行 Tier 1~3 (118 項，0.25 秒)：
npm run test:fast
node tests/run_tests.js --fast
node tests/run_tests.js --quick
node tests/run_tests.js -f
node tests/run_tests.js --skip-tier4
FAST_TEST=1 node tests/run_tests.js
```

### 2.2 指定單一或多個 Tier 組合 (`--tier` / `-t`)
支援逗號分隔多選或等號/空格語法，容錯率高：
```bash
# 僅運行 Tier 1
node tests/run_tests.js --tier=1

# 同時運行 Tier 2 與 Tier 3
node tests/run_tests.js --tier=2,3
node tests/run_tests.js -t 2,3
node tests/run_tests.js --tiers=1,2,3
```

### 2.3 關鍵字精準過濾 (`--grep` / `-g`)
支援依測試用例名稱進行不分大小寫之子字串或正規表達式過濾，幾毫秒內只跑關心之項目：
```bash
# 僅執行名稱包含 "OCR" 的測試 (共 7 項，秒級驗收)
node tests/run_tests.js -g OCR

# 結合 fast 模式與關鍵字過濾
node tests/run_tests.js --fast -g "Batch OCR"

# 僅執行特定功能 (如 "Amber" 琥褐溪谷)
node tests/run_tests.js --grep="Amber"
```

---

## 三、 防止「寫死導致調用失敗」之核心準則 (Anti-Hardcoding Guidelines)

為了確保任何開發者、CI 系統或 AI Agent 在任何目錄下均能正確調用測試，必須遵守以下設計規範：

### 3.1 絕對禁止寫死實體路徑與執行目錄假設
- **錯誤做法**：使用寫死的主機絕對路徑（如 `/Users/yanli/...`）或直接依賴 `process.cwd()` 相對路徑（如 `fs.readFileSync('data/data.json')`，一旦執行命令的目錄不是根目錄即報錯）。
- **正確做法**：
  在主入口與所有模組中使用 `__dirname` 解析出根目錄基準：
  ```javascript
  const path = require('path');
  const WORKSPACE_ROOT = path.resolve(__dirname, '..');
  const dataPath = path.join(WORKSPACE_ROOT, 'data', 'data.json');
  ```
  在 [`tests/test_harness.js`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/test_harness.js) 中導出 `WORKSPACE_ROOT`，所有測試用例統一取用。

### 3.2 參數解析的動態化與容錯防禦
- **避免硬編碼索引**：參數解析嚴禁依賴固定索引 `process.argv[2]`。必須使用走訪判斷（`startsWith('--tier=')`、`arg === '-t'` 等）。
- **數值安全轉換與清洗**：字串拆解為數字時，必須過濾非法值（NaN）與越界數值（`n >= 1 && n <= 4`）。
- **優先順序動態裁決**：若同時出現 `--skip-tier4` 與 `--tier=1,4`，程式碼自動動態排除 Tier 4（`targetTiers = targetTiers.filter(t => t !== 4)`），避免邏輯衝突導致非預期執行。

### 3.3 自動模組同步 (Zero-Config Bundler Auto-Run)
- 在執行測試時，[`tests/run_tests.js`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/tests/run_tests.js) 會自動先執行 `buildAll()`（耗時僅 16ms），將 `css/` 與 `js/modules/` 子模組編譯為 `styles.css`、`app.js`、`wiki.js` 等整合檔案。
- 開發者即使剛修改了子模組程式碼而忘記手動 build，測試也能永遠讀取到最新程式碼，杜絕因忘記打包而測試舊代碼之缺陷。

---

## 四、 測試層級結構 (Test Architecture)

```
tests/
  ├── run_tests.js                 # 測試主入口 (支援 --fast, --tier=N, --grep)
  ├── test_harness.js              # 斷言庫、Mock DOM (MiniElement)、測試過濾器
  └── tiers/
        ├── tier1_coverage.js      # Tier 1 (67 項): 檔案完整性、JSON Schema、公式基線
        ├── tier2_boundaries.js    # Tier 2 (43 項): 邊界防禦、各類別篩選、防退化
        ├── tier3_combos.js        # Tier 3 (8 項): 跨模組狀態聯動、彈窗生命週期
        └── tier4_scenarios.js     # Tier 4 微型協調器 (118 項，分流至 4 子套件)
              ├── tier4/tier4_part1.js   # 用例 1-30: 圖鑑工作流、H5 跳轉、導航
              ├── tier4/tier4_part2.js   # 用例 31-60: 百科營地、天梯、基礎 OCR
              ├── tier4/tier4_part3.js   # 用例 61-90: 緞帶扣減、雷達圖、配方公式
              └── tier4/tier4_part4.js   # 用例 91-118: 深度組隊、萬次 OCR 壓力、快取
```

---

## 五、 開發與驗收工作流 (Recommended Workflow)

1. **編寫或微調功能時**：
   - 終端機執行 `npm run test:fast`。
   - **0.25 秒** 取得即時反饋，確保核心功能與 UI 未退化。
2. **針對特定功能單元驗證時**：
   - 執行 `node tests/run_tests.js -g "<模組關鍵字>"`。
   - 僅執行相關用例，數毫秒內精準定位問題。
3. **完成整個需求、準備回報使用者或發布前**：
   - 執行 `npm test`。
   - **2.1 秒** 完成全量 236 項完整回歸驗證，確保 100% 通過（0 失敗）。
