# 主題配色與深淺色雙向檢核規範 (Theme Color Specification & Dual-Surface Check Protocol)

> [!IMPORTANT]
> 本規範為專案全域最高色彩標準。任何新增或修改之 UI 元件, 均必須嚴格遵守深淺雙色系適配原則。
> 每次執行任務的前後, 均必須依據本規範執行完整色彩檢核, 嚴禁在任何模組中遺留未對齊的主題色問題。

---

## 1. 核心配色體系與支援主題

本專案具備完整的多主題引擎 (Multi-Theme Engine), 包含 4 款原生核心主題與其反色衍生模式:

| 主題分類 | 主題代碼 (`data-theme`) | 背景底色 | 主要文字 | 重點強調色 | 特色與設計語意 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **深色系 (Dark)** | `midnight` (預設) | `#0a0f1d` (深藍黑) | `#f8fafc` / `#cbd5e1` | `#38bdf8` (天藍) | 經典高對比科技深色風格 |
| **深色系 (Dark)** | `onyx` | `#050505` (純黑) | `#ffffff` / `#d4d4d8` | `#cbd5e1` (冷銀) | OLED 極致純黑省電模式 |
| **淺色系 (Light)** | `dawn` | `#f8fafc` (暖白) | `#0f172a` (深岩灰) | `#0284c7` (海藍) | 清爽明亮、自然紙感淺色風格 |
| **淺色系 (Light)** | `emerald` | `#f1f5f9` (薄荷岩灰) | `#0f172a` / `#1e293b` | `#475569` (石板灰) | 溫和低飽和綠意淺色風格 |
| **反色衍生 (Inverted)**| `[data-theme-inverted="true"]` | 對調 | 對調 | 對調 | 支援將原深色轉為淺色, 原淺色轉為深色 |

---

## 2. 嚴格禁止事項 (Prohibited Practices)

1. **嚴禁硬編碼無適配之深色背景**:
   - 絕對禁止在元件中直接寫死 `#0f172a`, `rgba(15, 23, 42, ...)`, `#1e293b` 等深色背景值, 除非同時提供了明確的淺色主題覆蓋選擇器 (`[data-theme="dawn"]`, `[data-theme="emerald"]`)。
   - 違規示例: 在淺色模式 (`dawn`) 下, 產生突兀的純黑或深藍硬底卡片/晶片。
2. **嚴禁硬編碼無適配之淺色/低對比文字**:
   - 絕對禁止在未區分主題的情況下直接寫死 `#ffffff`, `#f8fafc`, `#38bdf8`, `#fca5a5`。
   - 違規示例: 在淺色模式的淺白背景上直接使用 `#38bdf8` (淡天藍) 或 `#fca5a5` (淡粉紅), 造成文字幾近隱形、無法閱讀。
3. **嚴禁自創非標準的分類顏色**:
   - 料理三大分類 (咖哩、沙拉、甜點) 必須一律使用系統定義的分類變數 (`--badge-cat-curry-...`, `--badge-cat-salad-...`, `--badge-cat-dessert-...`), 嚴禁自定義生硬的 `rgba` 色彩而破壞主題自適應機制。

---

## 3. 語意化變數標準清單 (Semantic Theme Tokens)

任何元件樣式設計應優先依賴下列全域 CSS 語意變數, 以保證在 4 款主題切換時自動無縫適配:

### 3.1 容器與背景
- 核心卡片底色: `var(--bg-card)` (深色為半透明深板岩, 淺色為純白 `#ffffff`)
- 巢狀內部容器: `var(--bg-card-inner)` (深色為深色半透, 淺色為淺灰 `#f1f5f9` / `#e2e8f0`)
- 微弱底色與懸浮: `var(--bg-card-inner-subtle)`, `var(--bg-card-hover)`
- 輸入框與下拉選單: `var(--bg-input)`, `var(--bg-dropdown)`

### 3.2 邊框與陰影
- 標準邊框: `var(--border-color)` (深色為半透白, 淺色為半透深藍黑)
- 微弱邊框: `var(--border-color-subtle)`
- 陰影光暈: `var(--shadow-lg)`, `var(--shadow-hover)`

### 3.3 排版文字
- 標題主字: `var(--text-title)` (深色為 `#f8fafc`, 淺色為 `#0f172a`)
- 內文常規: `var(--text-primary)` (深色為 `#cbd5e1`, 淺色為 `#0f172a` / `#1e293b`)
- 次要說明: `var(--text-secondary)` (深色為 `#94a3b8`, 淺色為 `#475569`)
- 弱化標籤: `var(--text-muted)` (深淺色皆維持 `#64748b`)

### 3.4 強調與警示色
- 主題強調色: `var(--accent-color)` (Midnight: `#38bdf8`, Dawn: `#0284c7`, Onyx: `#cbd5e1`, Emerald: `#475569`)
- 漸層效果: `var(--accent-gradient)`
- 金色/能量: `var(--color-accent-gold)` (深色為 `#fbbf24`, 淺色為 `#b45309`)
- 危險/清除按鈕:
  - 深色系: `background: rgba(239, 68, 68, 0.18); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5;`
  - 淺色系: `background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c;` (深紅高對比)

### 3.5 料理分類徽章
- 咖哩類: `var(--badge-cat-curry-bg)`, `var(--badge-cat-curry-text)`, `var(--badge-cat-curry-border)`
- 沙拉類: `var(--badge-cat-salad-bg)`, `var(--badge-cat-salad-text)`, `var(--badge-cat-salad-border)`
- 甜點類: `var(--badge-cat-dessert-bg)`, `var(--badge-cat-dessert-text)`, `var(--badge-cat-dessert-border)`

### 3.6 天梯三餐及格線與軌道遮罩 (Ladder 3-Meal Passing Line & Track Masking)
- 及格基準線: `var(--ladder-passing-line-color)` (深色為亮琥珀金 `#f59e0b`, 淺色為深琥珀橘 `#d97706` / `#b45309`)
- 及格線光暈: `var(--ladder-passing-line-glow)`
- 數值徽章底色: `var(--ladder-passing-badge-bg)` (深色為深棕黑 `rgba(26, 21, 12, 0.94)`, 淺色為淡琥珀金 `#fffbeb` / `#fef3c7`)
- 數值徽章外框: `var(--ladder-passing-badge-border)`
- 數值徽章文字: `var(--ladder-passing-badge-text)` (深色為亮金 `#fbbf24`, 淺色為深暖褐 `#92400e` / `#78350f`, 對比度 > 7:1)
- 非料理食材軌道透明度遮罩: `.ladder-track-row.ladder-track-dimmed`, `.ladder-tail-standalone-container.ladder-track-dimmed` (`opacity: 0.28 !important; filter: grayscale(40%) !important; pointer-events: none !important;`)
- 禁用食材標題標籤: `.ladder-track-disabled-header` (`cursor: not-allowed !important; pointer-events: none !important; opacity: 0.35 !important;`)

### 3.7 食材天梯浮窗、技能拆解與開關元件 (Ladder Tooltip, Skill Breakdown & Switches)
- **色彩語意區隔原則 (Strict Role-Color Separation)**:
  - **冠軍 TOP 1 (Champion)**: 專屬黃金配色 (`#eab308`, `var(--color-accent-gold)`，含金色王冠與頭像外框光暈)。
  - **食材精選S (Skill Draw S)**: 官方技能紫色配色 (`#c084fc`, 淺色 `#7e22ce`, 黑曜 `#d8b4fe`)，絕對嚴禁與冠軍金色混用。
- **浮窗內部容器 (`.tooltip-yield-breakdown`)**:
  - 嚴禁硬編碼任何深色背景 (如 `rgba(0, 0, 0, 0.25)`)。
  - 底色必須使用語意變數 `var(--bg-card-inner)`，邊框使用 `var(--border-color)`，左側飾條使用技能紫 `#a855f7`，技能加成文字使用 `#c084fc`。
  - 淺色主題 (`dawn`, `emerald`) 覆蓋: 底色為 `#f8fafc`，邊框為 `rgba(0, 0, 0, 0.08)`，飾條與技能值為高對比深皇家紫 `#7e22ce` (對比度 > 7:1)。
  - 深色主題 (`onyx`): 底色為 `#141414`，飾條為 `#c084fc`，技能值為 `#d8b4fe`。
- **節點徽章 (`.node-count-badge.badge-skill-draw`)**:
  - **嚴禁**對寶可夢頭像外加任何方框或光暈外框 (保持自然圓形頭像無外框)。
  - 徽章底色使用 `rgba(168, 85, 247, 0.14)`，邊框使用 `rgba(168, 85, 247, 0.6)`，文字使用 `#c084fc`。
  - 淺色主題覆蓋: 底色為 `rgba(147, 51, 234, 0.08)`，邊框為 `rgba(126, 34, 206, 0.45)`，數值文字為 `#7e22ce`。
  - 黑曜主題覆蓋: 底色為 `rgba(168, 85, 247, 0.15)`，邊框為 `rgba(192, 132, 252, 0.6)`，數值文字為 `#d8b4fe`。
  - 若節點同時為冠軍 (TOP 1) 且具有技能加成: 徽章明確使用紫色系 (如 `.ladder-node.node-top1 .node-count-badge.badge-skill-draw`)，頭像保留黃金王冠與光暈，雙重身分清楚辨識。
- **標題列緊湊開關 (`.ladder-top15-switch-label`)**:
  - 側邊欄篩選開關必須統一放置於各節標題列 (`.sidebar-section-header`) 右側 (如「天梯軌道排序」旁之「前15名」、「寶可夢專長」旁之「食材精選」)。
  - 「食材精選」開關啟用時使用技能紫色滑塊 (`#a855f7` / 淺色 `#7e22ce`)，文字切換為紫色 (`#c084fc` / `#7e22ce`)。

---

## 4. 雙向執行檢核機制 (Execution Pre/Post Check Protocol)

每次代碼修改**執行前**與**執行後**, 必須嚴格執行下列檢核流程:

### 4.1 執行前檢核 (Pre-Execution Check)
1. **結構分析**: 擬新增或修改的元件位於哪一個頁面? 該頁面是否支援主題切換?
2. **變數覆蓋率審查**:
   - 所有的 `background`, `border`, `color`, `box-shadow` 是否均使用語意化變數?
   - 若必須使用自訂色彩, 是否已為 `[data-theme="dawn"]` 與 `[data-theme="emerald"]` 撰寫顯式覆蓋規則?
3. **對比度預估 (WCAG AA)**:
   - 內文與背景對比度是否達到 4.5:1 以上?
   - 晶片、按鈕、大文字對比度是否達到 3:0 以上?

### 4.2 執行後檢核 (Post-Execution Check)
1. **主題矩陣遍歷驗證**:
   - 依序切換至 `midnight` (預設深色), `onyx` (極致深色), `dawn` (明亮淺色), `emerald` (自然淺色)。
   - 檢查元件在 4 種背景下是否有「黑底方塊殘留」、「白底破圖」、「文字看不清」之問題。
2. **互動狀態驗證**:
   - 檢查 `:hover`, `:active`, `.selected`, `.active` 在深淺色模式下是否具備清晰的視覺反饋且不刺眼。
3. **自動化測試守護**:
   - 在 `tests/run_tests.js` 中必須包含主題色彩斷言, 驗證深淺色專屬選擇器與語意變數的存在性與正確性。
