# Project: Pokemon Sleep Dynamic Data Scan and Sync System

## Architecture
The Pokemon Sleep WebApp architecture is a static-first Single Page Application with modular ES6 components, bundled via esbuild into production assets (`js/modules/app.min.js`, `js/modules/recipes.min.js`, etc.).
Master data resides in `/data/*.json` and is guarded by:
1. `DataCacheManager` with SHA-256 manifest checking (`data/manifest.json`), IndexedDB fallback, and service worker caching.
2. Modular rendering controllers (`pokedex/`, `recipes/`, `wiki/`, `lab/`, `camps/`).
3. Defensive health predicates (`isRecipesHealthy`, `isDatasetHealthy`).
4. Dual-mode sync pipeline (`scripts/sync_manager.js`, `scripts/sync_data.py`, `scripts/build_recipes.py`, `scripts/build_news.py`, `scripts/generate_manifest.py`).

The Dynamic Data Scan and Sync System introduces a unified CLI command (`npm run sync:data` via `scripts/sync_manager.js`) to:
- Detect and scan official announcements and external reference sources (Serebii / RaenonX).
- Automatically parse prospective or finalized content (ingredients, recipes, Pokemon, sleep goals).
- Validate incoming records with schema and integrity checks.
- Atomically update `/data/*.json` and mirrored CommonJS data files.
- Recompute deterministic SHA-256 hashes for `data/manifest.json`.
- Synchronize frontend dictionary linkages (i18n names, top meta recipes, evolution items).
- Maintain 100% test pass rate with zero regressions.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Dynamic Sync CLI & Coordinator | Unified CLI script (`npm run sync:data` / `scripts/sync_manager.js`) coordinating news scan, external scraping, data transform, and manifest update | M1 (DONE) | Survey 1 |
| 2 | Official Announcement Scanner | Parser scanning official `data/news.json` announcements for upcoming previews (ingredients, recipes, goals) | M1 (DONE) | Survey 1 |
| 3 | Serebii & RaenonX Integration | Scraper/parser updating exact recipe ingredient counts, base energies, and Pokemon stats | M1 (DONE) | Survey 1 |
| 4 | Defensive Health Gate & Atomic Writer | Pre-write validator enforcing `isRecipesHealthy` and schema validity with atomic file write | M1 (DONE) | Survey 1 |
| 5 | New Ingredient: 一口堅果 (Snackable Nuts) | 20th ingredient record in `data/ladder_lv60.json`, `js/data/ladder_data.js`, and i18n dictionaries | M2 | Survey 2 |
| 6 | 3 New Official Recipes | Bountiful Nut & Pumpkin Stew (Curry 39), Supreme Avocado Nut Feast Salad (Salad 121), Grand Tail Soy Nut Cake (Dessert 91) in `data/recipes.json` | M2 | Survey 2 |
| 7 | New Pokemon: 木棉球 & 風妖精 | National Dex #546 Cottonee and #547 Whimsicott in `data/data.json` with Fairy type, ingredient specialty, snoozing sleep type | M2 | Survey 2 |
| 8 | Evolution Item Sun Stone Linkage | Link `sun_stone` in `data/items.json` to Whimsicott (#547) | M2 | Survey 2 |
| 9 | Sleep Styles for Cottonee & Whimsicott | 1-4 star sleep style definitions in `data/sleep_styles.json` | M2 | Survey 2 |
| 10 | 570 Sleep Styles Goal & Pot Expansion | Add 570 sleep style goal to camp milestones (`wiki_camps_data.js`) unlocking 84-pot expansion | M2 | Survey 2 |
| 11 | Frontend Static Dictionaries Sync | Update `i18n_core.js` (POKEMON_NAMES, INGREDIENT_ICONS), `i18n_entities.js` (INGREDIENT_NAMES), and `wiki_skills_matrix.js` (INGREDIENT_VALUES_DATA) | M2 | Survey 3 |
| 12 | Top Meta & Appraisal Lab Integration | Update `TARGET_TOP_RECIPES` and `TOP_RECIPES_FOR_INGREDIENTS` with the 3 new recipes | M2 | Survey 3 |
| 13 | Manifest SHA-256 Synchronization | Recalculate deterministic hashes, file sizes, and record counts in `data/manifest.json` | M2 | Survey 1 & 3 |
| 14 | E2E & Fast Regression Guard | Ensure `npm run test:fast` (0.25s) and `npm test` pass 100%, updating invariant fixtures in `tests/stress_recipe_consumers_adversarial.js` and `tests/test_challenger_m1_1.js` | M3 | Survey 3 |
| 15 | Multi-Page Visual & Interaction Parity | Verify Pokedex, Cooking, Ladder, and Wiki pages render new items seamlessly without runtime errors | M3 | Survey 3 |
| 16 | Comprehensive E2E Testing Suite | Tier 1-4 opaque-box test suite verifying dynamic sync, multi-page data rendering, and anti-regression | M4 (E2E) | Dual Track |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | Dynamic Data Scan & Sync Infrastructure | Implement unified CLI sync runner (`scripts/sync_manager.js`, `package.json: sync:data`), official news preview scanner, and defensive validation gate | none | DONE |
| M2 | Multi-Tab Data Ingestion & Integration | Ingest Snackable Nuts, 3 recipes, Cottonee/Whimsicott, Sun Stone linkage, sleep styles, 570 goal, and dictionary mappings; update manifest | M1 | DONE |
| M3 | Anti-Regression, Bundle Sync & Verification | Synchronize production bundles (`npm run build:prod`), synchronize test invariants, ensure 100% passing tests on fast and full suites | M2 | DONE |
| M4 | Final Milestone: E2E Test Suite Pass & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4), adversarial test hardening (Tier 5) | M3 | DONE |

## Interface Contracts

### CLI Sync Interface: `npm run sync:data`
- Execution: `node scripts/sync_manager.js [options]`
- Options:
  - `--mode=preview`: Scans `data/news.json` for prospective announcements and generates preview records.
  - `--mode=full`: Full sync combining news scan, Serebii scraping, and manifest recalculation.
  - `--dry-run`: Validates changes against health predicates without writing to disk.
- Return Code: 0 on success, non-zero on validation failure.

### Data Schemas & Invariants
- `data/recipes.json`:
  - `pot_size === sum(ingredients.map(i => i.count))`
  - `isRecipesHealthy(recipes) === true`
  - `bonus_pct` matches pot size threshold tiers.
- `data/data.json`:
  - `isDatasetHealthy(dataset) === true`
  - Required fields: `id`, `formatted_no`, `name_cn`, `name_en`, `name_jp`, `type`, `specialty`, `sleep_type`, `carry`, `ingredient_rate`, `skill_rate`, `interval`, `main_skill`, `evo_req`, `is_final`, `release_date`, `icon_url`, `ingredients`.
- `data/manifest.json`:
  - `files[fileName].hash === sha256(rawBytes).slice(0, 16)`
  - `files[fileName].size === rawBytes.length`
  - `files[fileName].count === jsonRecords.length`

## Code Layout
- `scripts/`: Data fetching, synchronization, and manifest scripts (`sync_manager.js`, `sync_data.py`, `build_recipes.py`, `build_news.py`, `generate_manifest.py`, `format_data.js`, `minify_data.js`, `build_prod.js`).
- `data/`: Master JSON databases (`data.json`, `recipes.json`, `items.json`, `news.json`, `sleep_styles.json`, `ladder_lv60.json`, `manifest.json`).
- `js/data/`: Mirrored CommonJS datasets (`items.js`, `ladder_data.js`).
- `js/core/`: Common utilities and i18n (`domUtils.js`, `DataCacheManager.js`, `i18n/i18n_core.js`, `i18n/i18n_entities.js`).
- `js/modules/`: Application view controllers (`pokedex/`, `recipes/`, `wiki/`, `lab/`, `camps/`).
- `tests/`: Automated test suite (`run_tests.js`, `tiers/tier1_coverage.js`, `tiers/tier2_boundary.js`, `tiers/tier3_combinations.js`, `tiers/tier4/*.js`, `e2e_sync_and_multitab.js`).
