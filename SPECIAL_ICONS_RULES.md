# Pokémon Sleep 特殊寶可夢圖示與資源對應規範手冊 (Special Icons Rules)

> [!IMPORTANT]
> **本手冊為本專案寶可夢與料理圖示的「永久特殊對應規則」基準文檔。**
> 在執行任何數據同步（`sync_all.py` / `sync_data.py` / `build_webapp_data.py`）或前端邏輯更新（`app.js`）時，系統與 Agent 必須優先遵循本規範，以確保所有特殊形態與特殊編號之寶可夢圖示 100% 正常獲取並正確顯示，無需用戶再次提示。

---

## 📌 一、 核心問題背景

在 Pokémon Sleep 遊戲內部與資料庫中：
1. **一般標準寶可夢（ID < 1000）**：Serebii 官方圖示遵循標準 4 位數檔名規則，例如 `0001.png`（妙蛙種子）、`0025.png`（皮卡丘）、`0143.png`（卡比獸）。
2. **特殊節日／地區／形態寶可夢（9xxx / 7xxx / 8xxx）**：
   - 遊戲使用自定義虛擬 ID（例如萬聖節皮卡丘 `9001`、阿羅拉六尾 `7006`）。
   - **Serebii 伺服器並不存在 `9001.png` 或 `7006.png`**，而是採用語義化檔名（例如 `025-halloween.png`、`037-alolanvulpix.png`）。
   - 若直接以數字拼接 URL，會造成 **HTTP 404 圖片破圖**。
3. **未開放／世代預覽寶可夢**（如超夢 `150`）：
   - 官方 Sleep 圖庫尚未收錄該寶可夢獨立資源，需自動 fallback 至標準全圖鑑圖庫（如 `pokedex-sv/icon/150.png`）。

---

## 📋 二、 特殊寶可夢圖示映射對照表 (Authoritative Special Icons Map)

| 遊戲 ID | 寶可夢名稱 (中) | 英文名稱 | 官方正確 Serebii 圖片 URL | 狀態 |
| :--- | :--- | :--- | :--- | :--- |
| **9001** | 皮卡丘（萬聖節） | Pikachu (Halloween) | `https://www.serebii.net/pokemonsleep/pokemon/icon/025-halloween.png` | ✅ 200 OK |
| **9002** | 皮卡丘（佳節） | Pikachu (Holiday) | `https://www.serebii.net/pokemonsleep/pokemon/icon/025-holiday.png` | ✅ 200 OK |
| **9003** | 皮卡丘（船長） | Pikachu (Captain) | `https://www.serebii.net/pokemonsleep/pokemon/icon/025-captain.png` | ✅ 200 OK |
| **9004** | 伊布（佳節） | Eevee (Holiday) | `https://www.serebii.net/pokemonsleep/pokemon/icon/133-holiday.png` | ✅ 200 OK |
| **9005** | 伊布（萬聖節） | Eevee (Halloween) | `https://www.serebii.net/pokemonsleep/pokemon/icon/133-halloween.png` | ✅ 200 OK |
| **9006** | 海豹球（佳節） | Spheal (Holiday) | `https://www.serebii.net/pokemonsleep/pokemon/icon/363-holiday.png` | ✅ 200 OK |
| **7006** | 六尾（阿羅拉的樣子） | Vulpix (Alolan) | `https://www.serebii.net/pokemonsleep/pokemon/icon/037-alolanvulpix.png` | ✅ 200 OK |
| **7007** | 九尾（阿羅拉的樣子） | Ninetales (Alolan) | `https://www.serebii.net/pokemonsleep/pokemon/icon/038-alolanninetales.png` | ✅ 200 OK |
| **7054** | 烏波（帕底亞的樣子） | Wooper (Paldean) | `https://www.serebii.net/pokemonsleep/pokemon/icon/194-paldeanwooper.png` | ✅ 200 OK |
| **8001** | 顫弦蠑螈（低調的樣子） | Toxtricity (Low-Key) | `https://www.serebii.net/pokemonsleep/pokemon/icon/849-toxtricitylowkeyform.png` | ✅ 200 OK |
| **150** | 超夢 | Mewtwo | `https://www.serebii.net/pokedex-sv/icon/150.png` | ✅ 200 OK |
| **957** | 小鍛匠 | Tinkatink | `https://www.serebii.net/pokemonsleep/pokemon/icon/957.png` | ✅ 200 OK |
| **958** | 巧鍛匠 | Tinkatuff | `https://www.serebii.net/pokemonsleep/pokemon/icon/958.png` | ✅ 200 OK |
| **959** | 巨鍛匠 | Tinkaton | `https://www.serebii.net/pokemonsleep/pokemon/icon/959.png` | ✅ 200 OK |

---

## 🍳 三、 19 種官方食材圖示對照表

所有 19 種食材統一採用 Serebii 官方標準高清食材圖庫：

| 食材中文名稱 | Serebii 標識名稱 | 官方正確圖片網址 |
| :--- | :--- | :--- |
| **特選蘋果** | `fancyapple` | `https://www.serebii.net/pokemonsleep/ingredients/fancyapple.png` |
| **哞哞鮮奶** | `moomoomilk` | `https://www.serebii.net/pokemonsleep/ingredients/moomoomilk.png` |
| **萌綠大豆** | `greengrasssoybeans` | `https://www.serebii.net/pokemonsleep/ingredients/greengrasssoybeans.png` |
| **甜甜蜜** | `honey` | `https://www.serebii.net/pokemonsleep/ingredients/honey.png` |
| **豆製肉** | `beansausage` | `https://www.serebii.net/pokemonsleep/ingredients/beansausage.png` |
| **暖暖薑** | `warmingginger` | `https://www.serebii.net/pokemonsleep/ingredients/warmingginger.png` |
| **好眠番茄** | `snoozytomato` | `https://www.serebii.net/pokemonsleep/ingredients/snoozytomato.png` |
| **特選蛋** | `fancyegg` | `https://www.serebii.net/pokemonsleep/ingredients/fancyegg.png` |
| **純粹油** | `pureoil` | `https://www.serebii.net/pokemonsleep/ingredients/pureoil.png` |
| **窩心洋芋** | `softpotato` | `https://www.serebii.net/pokemonsleep/ingredients/softpotato.png` |
| **火辣香草** | `fieryherb` | `https://www.serebii.net/pokemonsleep/ingredients/fieryherb.png` |
| **放鬆可可** | `soothingcacao` | `https://www.serebii.net/pokemonsleep/ingredients/soothingcacao.png` |
| **品鮮蘑菇** | `tastymushroom` | `https://www.serebii.net/pokemonsleep/ingredients/tastymushroom.png` |
| **粗枝大蔥** | `largeleek` | `https://www.serebii.net/pokemonsleep/ingredients/largeleek.png` |
| **美味尾巴** | `slowpoketail` | `https://www.serebii.net/pokemonsleep/ingredients/slowpoketail.png` |
| **萌綠玉米** | `greengrasscorn` | `https://www.serebii.net/pokemonsleep/ingredients/greengrasscorn.png` |
| **醒腦咖啡豆** | `rousingcoffee` | `https://www.serebii.net/pokemonsleep/ingredients/rousingcoffee.png` |
| **嫩亮酪梨** | `glossyavocado` | `https://www.serebii.net/pokemonsleep/ingredients/glossyavocado.png` |
| **沉甸甸南瓜** | `plumppumpkin` | `https://www.serebii.net/pokemonsleep/ingredients/plumppumpkin.png` |

---

## 🛠️ 四、 程式碼整合與永久防呆機制

本專案已在以下各層次內建自動映射，無需手動干預：

1. **配置檔 [`special_icons.json`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/special_icons.json)**：
   - 集中保存上述所有特殊 ID 及中文名稱的正確 URL。
2. **數據生成器 [`build_webapp_data.py`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/build_webapp_data.py)**：
   - 在產生 `data.json` 時，優先檢查 `special_icons.json`，存在特殊映射時自動套用正確 URL。
3. **前端圖示解析器 [`app.js`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/app.js) (`getIconUrl`)**：
   - 前端內建 `SPECIAL_ICON_MAP`，即使本機快取或舊資料遺漏，前端也會自動轉址至正確圖片。
4. **自動化同步腳本 [`scripts/sync_data.py`](file:///Users/yanli/AndroidStudioProjects/pokemon-sleep-app/scripts/sync_data.py)**：
   - 內嵌 `SPECIAL_ICON_MAP`，後續執行 GitHub Actions 時將自動維護特殊形態圖片。
