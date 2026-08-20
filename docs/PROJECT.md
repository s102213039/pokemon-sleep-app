# Project: Pokémon Sleep SPA (`pokemon-sleep-app`)

## Architecture
Single Page Application (Vanilla HTML/CSS/JS) loading a static `data.json` containing 247+ Pokémon Sleep dataset entries.
Features:
- Instant multi-lingual & ID text search (CN/EN/JP names, ID number format e.g. #0001 or 1).
- Multi-select type filtering (Berry/Type: 草, 火, 水, 電, 草, 冰, 鬥, 毒, 地, 飛, 超, 蟲, 岩, 鬼, 龍, 惡, 鋼, 妖, etc.).
- Multi-select specialty filtering (樹果, 食材, 技能).
- Sorting by Carry Capacity, Ingredient Rate, Help Interval, Pokedex ID.
- View mode toggle (Grid Cards View vs Detailed Table View).
- Responsive Dark Theme aesthetic with CSS custom properties and badge styling.
- Rich fallback icon system (SVG inline data / image fallbacks).
- Clean Git repository setup and GitHub Pages deployment configuration (`.github/workflows/deploy.yml` or root `index.html`).

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Testing Track | Requirement-driven test suite (Tiers 1-4) & test runner | None | DONE |
| 2 | Dataset Construction | 247+ Pokemons data.json with full stats, multi-language names, ingredients, rates, carry capacity, interval, fallback icons | None | DONE |
| 3 | Web App SPA Implementation | index.html, styles.css, app.js (search, filter, sort, grid/table view toggle, dark theme) | M2 | DONE |
| 4 | Git Repository & GitHub Pages Setup | Git init, clean commit history, GitHub Pages deployment preparation & E2E verification | M1, M3 | DONE |

## Interface Contracts & Data Formats

### `data.json` Structure
```json
[
  {
    "id": 1,
    "name": {
      "cn": "妙蛙種子",
      "en": "Bulbasaur",
      "jp": "フシギダネ"
    },
    "type": "草",
    "specialty": "食材",
    "sleepType": "深頭睡",
    "specialtySkill": "能量填充S",
    "helpInterval": 4400,
    "carryCapacity": 11,
    "ingredientRate": 0.268,
    "skillRate": 0.045,
    "ingredients": [
      { "name": "蜜糖", "count": 1 },
      { "name": "鮮牛奶", "count": 2 }
    ],
    "icon": "data:image/svg+xml;utf8,..."
  }
]
```

## Code Layout
- `index.html` — SPA HTML structure
- `styles.css` — Responsive dark theme styling & custom badges
- `app.js` — Client-side rendering, search, filtering, sorting, state management
- `data.json` — Static dataset containing 247+ Pokémon entries
- `tests/` — Automated test runner & E2E test suite
- `.github/workflows/deploy.yml` — GitHub Pages deployment action

## E2E Testing Infrastructure
- Automated test script in Node.js / Python to validate HTML, JS, data integrity (247+ entries), filtering logic, and SPA rendering.
- `TEST_READY.md` published upon completion of test infrastructure.
