# 🍲 Pokémon Sleep 新增食譜指南

> 本文件記錄如何新增或更新 `recipes.json` 中的食譜資料，
> 包含資料來源、欄位格式、自動化腳本與手動新增步驟。

---

## 📦 recipes.json 資料格式

每道食譜在 `recipes.json` 是一個 JSON 物件，格式如下：

```json
{
  "name_cn": "奶油蘑菇炒飯",
  "name_en": "Fancy Apple Curry",
  "category": "咖哩",
  "bonus_pct": 25,
  "pot_size": 15,
  "base_energy": 1542,
  "icon": "https://www.serebii.net/pokemonsleep/food/fancyapplecurry.png",
  "ingredients": [
    {
      "name": "Fancy Apple",
      "icon": "https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png",
      "count": 8
    }
  ]
}
```

### 欄位說明

| 欄位          | 類型     | 說明                                                                                 |
|---------------|----------|--------------------------------------------------------------------------------------|
| `name_cn`     | `string` | 中文名稱（參考官方繁體中文版本）                                                     |
| `name_en`     | `string` | 英文名稱（與 Serebii.net / RaenonX 一致）                                             |
| `category`    | `string` | 料理類別：`"咖哩"` / `"沙拉"` / `"甜點"`                                             |
| `bonus_pct`   | `number` | 食材加成百分比（整數，例如 `25` = +25%），固定值不因等級改變                          |
| `pot_size`    | `number` | 所需最低鍋子容量（整數）                                                              |
| `base_energy` | `number` | Lv.1 基礎能量（不含任何加成）                                                         |
| `icon`        | `string` | 食譜圖片 URL（Serebii.net 格式，見下方規則）                                          |
| `ingredients` | `array`  | 食材陣列，每個物件含 `name`（英文）、`icon`（URL）、`count`（數量，整數）             |

---

## 📸 圖片 URL 規則

### 食譜圖片
```
https://www.serebii.net/pokemonsleep/food/{英文名稱全小寫無空格}.png
```
範例：
- `Fancy Apple Curry` → `fancyapplecurry.png`
- `Grilled Tail with Herbs` → `grilledtailwithherbs.png`
- `Lovely Kiss Smoothie` → `lovelykisssmoothie.png`

### 食材圖片
```
https://www.serebii.net/pokemonsleep/ingredients/{食材名稱全小寫無空格}.png
```
範例：
- `Fancy Apple` → `fancyapple.png`
- `Large Leek` → `largeleek.png`
- `Tasty Mushroom` → `tastymushroom.png`

> **驗證方式**：將 URL 貼入瀏覽器，確認圖片能正常顯示。  
> 若圖片不存在，回到 [Serebii Pokémon Sleep 食材頁面](https://www.serebii.net/pokemonsleep/ingredients.shtml) 確認正確名稱。

---

## 🌐 資料來源

### 主要參考網站

| 網站 | URL | 用途 |
|------|-----|------|
| **RaenonX（主力）** | https://pks.raenonx.cc/zh/meal | 完整食譜清單（含加成、能量、食材） |
| **Serebii.net** | https://www.serebii.net/pokemonsleep/recipe/ | 英文名稱、圖片 URL |
| **Bulbapedia** | https://bulbapedia.bulbagarden.net/wiki/Cooking_(Pok%C3%A9mon_Sleep) | 食譜資料、能量數值 |

### 如何從 RaenonX 取得資料

1. 開啟 [https://pks.raenonx.cc/zh/meal](https://pks.raenonx.cc/zh/meal)
2. 按 F12 開啟開發者工具 → **Network** 標籤
3. 重新整理頁面，找到 `meal` 或 `recipes` 的 API 請求
4. 常見 API 端點（依網站版本可能更新）：
   ```
   GET https://pks.raenonx.cc/api/v2/meal?lang=zh
   GET https://pks.raenonx.cc/api/meal?lang=zh
   ```
5. 複製 Response JSON，取得所有食譜資料

### RaenonX API 回應欄位對應

```json
{
  "name": {
    "zh": "奶油蘑菇炒飯",   ← name_cn
    "en": "Fancy Apple Curry" ← name_en
  },
  "type": "CURRY",           ← category（CURRY→咖哩, SALAD→沙拉, DESSERT→甜點）
  "ingredientMultiplier": 25, ← bonus_pct
  "potCapacity": 15,         ← pot_size
  "basePotPower": 1542,      ← base_energy
  "imageUrl": "...",         ← icon
  "ingredients": [
    {
      "name": { "zh": "美味蘋果", "en": "Fancy Apple" },
      "count": 8,
      "imageUrl": "..."       ← ingredients[n].icon
    }
  ]
}
```

---

## ✏️ 手動新增食譜步驟

### 步驟 1：確認食譜資訊

到 [RaenonX 食譜頁](https://pks.raenonx.cc/zh/meal) 或 [Serebii](https://www.serebii.net/pokemonsleep/recipe/) 查詢：
- [ ] 中文名稱（繁體中文版）
- [ ] 英文名稱
- [ ] 料理分類（咖哩/沙拉/甜點）
- [ ] 食材加成 %
- [ ] 最低鍋子容量
- [ ] Lv.1 基礎能量
- [ ] 所有食材名稱及數量

### 步驟 2：確認圖片 URL

```bash
# 測試食譜圖片 URL（將食譜名轉為全小寫無空格）
open "https://www.serebii.net/pokemonsleep/food/{食譜英文名全小寫無空格}.png"

# 測試食材圖片 URL
open "https://www.serebii.net/pokemonsleep/ingredients/{食材英文名全小寫無空格}.png"
```

### 步驟 3：在 recipes.json 新增條目

開啟 `recipes.json`，在陣列末尾新增一筆 JSON 物件：

```json
{
  "name_cn": "【填入中文名稱】",
  "name_en": "【填入英文名稱】",
  "category": "【咖哩 / 沙拉 / 甜點】",
  "bonus_pct": 【整數，例如 25】,
  "pot_size": 【整數，例如 15】,
  "base_energy": 【整數，例如 1542】,
  "icon": "https://www.serebii.net/pokemonsleep/food/【英文名小寫無空格】.png",
  "ingredients": [
    {
      "name": "【食材英文名】",
      "icon": "https://www.serebii.net/pokemonsleep/ingredients/【食材英文名小寫無空格】.png",
      "count": 【整數】
    }
  ]
}
```

### 步驟 4：驗證 JSON 格式

```bash
# 驗證 JSON 格式正確（需要 Python）
python3 -c "import json; data = json.load(open('recipes.json')); print(f'✅ {len(data)} 道食譜，格式正確')"
```

### 步驟 5：Commit & Push

```bash
git add recipes.json
git commit -m "feat: 新增食譜 — 【食譜名稱】"
git push
```

---

## 🤖 自動化腳本說明

### 本地執行同步腳本

```bash
# 安裝依賴
pip install requests beautifulsoup4 lxml

# 執行（同步寶可夢 + 食譜）
python scripts/sync_data.py

# 只同步食譜
SYNC_TYPE=recipes_only python scripts/sync_data.py

# 只同步寶可夢
SYNC_TYPE=pokemon_only python scripts/sync_data.py
```

腳本邏輯（`scripts/sync_data.py`）：
1. 讀取現有 `recipes.json`，取得所有食譜英文名稱
2. 向 RaenonX API 請求最新食譜清單
3. 比對差異，**只新增未存在的食譜**（不覆蓋現有）
4. 儲存更新後的 `recipes.json`

### GitHub Actions 自動同步

工作流程檔案：`.github/workflows/update-data.yml`

觸發方式：
- **手動**：在網站點擊「🔄 同步資料」按鈕（需設定 GitHub PAT Token）
- **自動**：每週一台灣時間 10:00 自動執行

> 設定 PAT Token：  
> 1. 開啟 https://github.com/settings/tokens/new?scopes=workflow  
> 2. 勾選 `workflow` 權限，建立 Token  
> 3. 在網站點擊「⚙️ 設定」，填入 Token 並儲存

---

## 📋 現有食譜加成分級參考

| 加成等級 | 範圍     | 標識 | 代表食譜類型 |
|----------|----------|------|-------------|
| 🏆 傳奇  | ≥ 78%    | 金色 | 超稀有食譜  |
| 🔥 頂級  | 61-77%   | 紅色 | 高級食譜    |
| ⭐ 優秀  | 48-60%   | 紫色 | 進階食譜    |
| ✨ 良好  | 35-47%   | 綠色 | 中階食譜    |
| 💧 普通  | 25-34%   | 藍色 | 一般食譜    |
| 💫 基礎  | 21-24%   | 灰色 | 入門食譜    |
| •  最低  | 19-20%   | 暗色 | 基礎食譜    |

---

## 🔢 能量計算公式

```
最終能量 = base_energy × (1 + bonus_pct/100 + (level-1) × 0.02) × (1 + islandBonus/100)
```

| 參數           | 說明                        |
|----------------|-----------------------------|
| `base_energy`  | 食譜 Lv.1 基礎能量          |
| `bonus_pct`    | 食材加成（固定值）           |
| `level`        | 食譜等級 (1-65)             |
| `islandBonus`  | 島嶼加成 % (0-85)           |

範例：  
- 食譜能量 1542、加成 25%、Lv.30、島嶼加成 20%  
- `1542 × (1 + 0.25 + 29 × 0.02) × 1.20`  
- `= 1542 × 2.08 × 1.20`  
- `= 3,848`

---

## 🗓️ 更新日誌

| 日期       | 版本更新說明                          |
|------------|---------------------------------------|
| 2026-08-08 | 初始建立，涵蓋 76 道官方食譜          |
| （持續更新）| 依遊戲版本新增最新食譜               |
