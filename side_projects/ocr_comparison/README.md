# Pokémon Sleep AI OCR 對比實驗室 (OCR Benchmark Side Project)

> **研究課題**：評估現有網頁端 OCR（Tesseract.js / LSTM 架構）與 Umi-OCR 核心引擎（PaddleOCR PP-OCRv4 / 深度學習 DBNet + SVTR 架構）在《Pokémon Sleep》真實遊戲截圖上的辨識精度、速度與可用性差異。

---

## 測試環境與對比引擎

1. **引擎 A（現有方案）：Tesseract.js (`chi_tra+eng`)**
   - 架構：基於傳統 LSTM 文字辨識架構，運行於 WebAssembly。
   - 優點：純前端免伺服器，直接在瀏覽器執行。
   - 痛點：對手遊圓角字型、漸層底色與局部光影極為敏感，易產生 `Lv. S`、`1v.`、`III` 等字元混淆。

2. **引擎 B（Umi-OCR 核心）：PaddleOCR PP-OCRv4 (`RapidOCR ONNX`)**
   - 架構：現代深度學習兩階段 OCR：
     - 文字檢測：DBNet（差分二值化）
     - 文字識別：SVTR（場景文字視覺 Transformer）
   - 優點：對手遊 UI、複雜排版抗噪力極高，輸出精確幾何邊界框（Bounding Box），繁體/簡體中文辨識率頂級。
   - 執行方式：透過 ONNX Runtime 本地推論（可於 Python、C++ 或 WebGPU/Wasm 中原生運行）。

---

## 測試數據集

取樣自玩家真實遊戲截圖（包含不同屬性、不同進化階級、不同長度寶可夢名稱、長技能名、含金色/銀色/白色副技能、不同性格膠囊）。

---

## 評測維度

1. **基礎文字辨識率 (CER - Character Error Rate)**
2. **寶可夢名稱與等級 (Name & Level Accuracy)**
3. **主技能名稱與等級 (Main Skill Name & Lv.1~7)**
4. **5 格副技能完整度 (Subskills 1~5 Completeness & Order)**
5. **性格與加減值 (Nature Name & Modifiers)**
6. **推論延遲 (Inference Latency in ms)**
