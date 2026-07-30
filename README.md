# ⚡ Pokémon Sleep Web Application (`pokemon-sleep-app`)

A modern, high-performance, responsive Single Page Application (SPA) for browsing, searching, filtering, and analyzing Pokémon Sleep data.

---

## 🌟 Key Features

- 📊 **Comprehensive Dataset (318+ Pokémon)**: Complete Pokémon Sleep stats including multi-lingual names (CN / EN / JP), Pokedex IDs, sleep types, specialty skills, carry capacity, ingredient drop rates, help intervals, and ingredient breakdowns with SVG fallbacks.
- 🔍 **Instant Multi-Lingual & ID Search**: Real-time search across Chinese (CN), English (EN), Japanese (JP) names, and Pokedex ID numbers (e.g., `#0001`, `1`, `01`).
- 🏷️ **Multi-Select Filtering**: Combine multiple element types (草, 火, 水, 電, 冰, 鬥, 毒, 地, 飛, 超, 蟲, 岩, 鬼, 龍, 惡, 鋼, 妖, etc.) and specialties (樹果, 食材, 技能) simultaneously.
- 🔃 **5-Way Sorting Options**: Sort entries by Pokedex ID (asc/desc), Carry Capacity, Ingredient Rate, or Help Interval.
- 🔲 **Dual View Modes**: Switch seamlessly between responsive Grid Card View and Detailed Table View.
- 🎨 **Responsive Dark Theme System**: High-contrast, mobile-friendly design with dynamic element type badge styling, smooth transitions, and rich interactive feedback.

---

## 🧪 Local Development & Automated Testing

This repository includes a standalone automated test suite covering feature coverage, boundary conditions, cross-feature combinations, and real-world application workflows.

### Running Tests

Execute the automated test runner in Node.js:

```bash
node tests/run_tests.js
```

*All 12 E2E and unit test scenarios should complete with 100% PASS rate.*

---

## 🚀 Remote Push & GitHub Pages Hosting Guide

Follow these steps to publish `pokemon-sleep-app` to your GitHub Pages:

### Step 1: Create GitHub Repository
Create a new public repository named **`pokemon-sleep-app`** on [GitHub](https://github.com/new).

### Step 2: Add Remote Repository URL
In your local workspace terminal, attach your remote GitHub repository:
```bash
git remote add origin git@github.com:<USER>/pokemon-sleep-app.git
# or HTTPS:
# git remote add origin https://github.com/<USER>/pokemon-sleep-app.git
```

### Step 3: Rename Default Branch to `main`
```bash
git branch -M main
```

### Step 4: Push Local Repository to GitHub
```bash
git push -u origin main
```

### Step 5: Enable GitHub Pages
1. Go to your repository settings on GitHub: `https://github.com/<USER>/pokemon-sleep-app/settings`
2. Navigate to **Pages** in the left sidebar menu under **Code and automation**.
3. Under **Build and deployment -> Source**, select **GitHub Actions** (or **Deploy from a branch** set to `main` / `/ (root)`).
4. Once deployed, your site will be live at `https://<USER>.github.io/pokemon-sleep-app/`.

---

## 📁 Repository Structure

- `index.html` — Main SPA application layout and UI containers
- `styles.css` — Modern dark-theme stylesheet with dynamic type badge colors & media queries
- `app.js` — Client-side state management, search, multi-filtering, sorting, and view rendering
- `data.json` — 318+ Pokémon Sleep static dataset
- `tests/` — E2E & component automated test suite (`run_tests.js`)
- `.github/workflows/deploy.yml` — Automated GitHub Actions Pages deployment workflow
- `.gitignore` — Root git ignore file excluding agent metadata, logs, and temporary build outputs

---

## 📄 License
MIT License. Pokémon and Pokémon Sleep are trademarks of Nintendo, Creatures Inc., and GAME FREAK inc.
