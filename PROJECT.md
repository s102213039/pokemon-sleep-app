# Project: Pokémon Sleep Items & Incense Encyclopedia

## Architecture
The Items & Incense Encyclopedia is structured into four core layers:
1. **Master Data Engine Layer**:
   - `data/items.json` and in-memory cache `window.ITEMS_DATA` (embedded in `js/data/items.js` / `js/modules/wiki.js`).
   - Standard schema: `id`, `category`, `name` (zh-TW, zh-CN, en-US), `icon_url`, `description`, `effects`, `sleep_points` (regular, premium, monthly limits), `diamonds`, `acquisition`, and `pokemon_ids`.
   - Comprehensive collection: 118 items (17 evolution stones/items, 6 functional incenses, 9 training & skill items, 10 catching & camping supplies, and 76 verified Pokemon species incenses).
2. **Wiki Subpanel UI & Search/Filter Layer**:
   - Navigation subtab `items` added to `VALID_WIKI_SUBTABS` in `js/modules/app.js` and `js/modules/wiki.js`.
   - Subpanel container `#wiki-subpanel-items` inside `.wiki-main-container`.
   - Search bar (`#wiki-items-search-input`) supporting multilingual keywords and Pokemon names.
   - Horizontal category filter pills (`all`, `evolution`, `pokemon_incense`, `functional_incense`, `training`, `biscuit`, `supply`).
   - Single Frame Rule compliant item cards grid (`.wiki-item-card-grid`).
   - Theme styling supporting all 4 themes (Midnight, Onyx, Dawn, Emerald) plus high-contrast modes.
3. **Modal & Bidirectional Dex Linkage Layer**:
   - Item Detail Modal (`#wiki-item-detail-modal`) registered in `MOBILE_OVERLAY_IDS` and managed via `prepareOverlayOpen` / `animateOverlayClose`.
   - Displays full item specs, sleep point shop pricing, and associated Pokemon avatars.
   - Clicking Pokemon avatars opens `#pokedex-detail-modal` via `window.PokemonApp.openPokemonDetailModal(pkm)`.
   - In `#pokedex-detail-modal`, Pokemon requiring evolution items render interactive item chips that call `window.WikiDB.openItemDetailModal(itemId)`.
4. **Automated Verification & E2E Testing Layer**:
   - Test 217 added to `tests/run_tests.js` in Tier 4, validating dataset integrity, UI rendering, category filtering, multilingual search, bidirectional linkage, Zero Emoji compliance, and Single Frame styling.
   - Target: 217 / 217 tests passing (0 failures).

## Code Layout
- `data/items.json`: Canonical static item master dataset (118 items).
- `js/data/items.js` (or inline in `js/modules/wiki.js`): In-memory item data definitions for offline & VM test support.
- `js/modules/wiki.js`: Wiki subpanel rendering, subtab switching, category filtering, search mechanics, item modal lifecycle.
- `js/modules/app.js`: Subtab registration in main router, overlay registry, Pokédex modal evolution chip rendering.
- `js/core/i18n.js`: Localized item names and UI strings.
- `css/styles.css`: Subpanel, cards, filter pills, modal, and responsive H5 styles across all 4 themes.
- `index.html` & `app/index.html`: Desktop and mobile HTML containers for modals and subpanels.
- `tests/run_tests.js`: Test runner with integration Test 217.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Items Master JSON Schema | Canonical dataset for all 118 items | M1 | ORIGINAL_REQUEST R1, Spec Miner |
| 2 | Multilingual Localization | zh-TW, zh-CN, and en-US strings for all items | M1 | ORIGINAL_REQUEST R1, Spec Miner |
| 3 | Serebii CDN Sprite URLs | High-resolution validated sprite assets for items & incenses | M1 | Spec Miner |
| 4 | Shop Pricing & Acquisition | Sleep points (regular/premium limits) and sources | M1 | ORIGINAL_REQUEST R1, Spec Miner |
| 5 | Evolution Target Mapping | Mapping evolution items to evolved Pokemon IDs | M1 | ORIGINAL_REQUEST R1, Spec Miner |
| 6 | Wiki Subtab Registration | Subtab 'items' added to router and navigation | M2 | ORIGINAL_REQUEST R2, Explorer 1 |
| 7 | Wiki Subpanel Container | #wiki-subpanel-items container and layout | M2 | ORIGINAL_REQUEST R2, Explorer 1 |
| 8 | Horizontal Category Filter | Filter pills for 7 item categories | M2 | ORIGINAL_REQUEST R2, Explorer 1 |
| 9 | Multilingual Search Bar | Real-time search by name, effect, or Pokemon name | M2 | ORIGINAL_REQUEST R2, Explorer 1 |
| 10 | Item Cards Grid Layout | Clean single-frame responsive cards grid | M2 | ORIGINAL_REQUEST R2, Explorer 1 |
| 11 | Multi-Theme & Mobile CSS | Styling for 4 themes, mobile drawer/bottom sheet | M2 | ORIGINAL_REQUEST R4, Explorer 1 |
| 12 | Item Detail Modal | #wiki-item-detail-modal popup with full stats & pricing | M3 | ORIGINAL_REQUEST R3, Explorer 1 |
| 13 | Item -> Dex Navigation | Clicking associated Pokemon opens Pokedex modal | M3 | ORIGINAL_REQUEST R3, Spec Miner |
| 14 | Dex -> Item Navigation | Clickable evolution item chips in Pokedex modal | M3 | ORIGINAL_REQUEST R3, Spec Miner |
| 15 | Overlay Lifecycle Hooks | Registration in MOBILE_OVERLAY_IDS and smooth animation | M3 | Explorer 1 |
| 16 | E2E Test 217 Suite | Integration test in tests/run_tests.js | M4 (E2E) | ORIGINAL_REQUEST AC, Explorer 2 |
| 17 | Adversarial Hardening | Negative tests, edge cases, regression check | M4 | Project Pattern |
| 18 | Final Verification & Deploy | 217/217 pass, git commit, push, update shared docs | M4 | System Prompt |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Master Data Engine | `data/items.json`, data fallback, i18n entries, evolution mappings | none | DONE |
| M2 | Wiki Subpanel & Search | Wiki subtab, #wiki-subpanel-items, search, filter pills, card grid, CSS themes | M1 | DONE |
| M3 | Detail Modal & Dex Linkage | #wiki-item-detail-modal, bidirectional navigation between Dex and Items | M1, M2 | DONE |
| M4 | E2E Test Suite & Hardening | Test 217 implementation, 217/217 tests pass, adversarial audit, push & shared docs | M1, M2, M3 | DONE |

## Interface Contracts
### Master Data -> Wiki & App
- `window.ITEMS_DATA`: Array of 118 item objects conforming to `ItemMasterRecord`.
- Item schema:
  - `id`: string (e.g. `thunder_stone`, `incense_bulbasaur`, `poke_biscuit`)
  - `category`: `"evolution" | "pokemon_incense" | "functional_incense" | "training" | "biscuit" | "supply"`
  - `name`: `{ "zh-TW": string, "zh-CN": string, "en-US": string }`
  - `icon_url`: string
  - `description`: `{ "zh-TW": string, "zh-CN": string, "en-US": string }`
  - `sleep_points`: `{ regular: number | null, premium: number | null, limit_regular?: string, limit_premium?: string }`
  - `acquisition`: `{ "zh-TW": string[], "zh-CN": string[], "en-US": string[] }`
  - `pokemon_ids`: string[]

### Wiki Subpanel -> Item Modal
- `window.WikiDB.openItemDetailModal(itemId)`: Opens `#wiki-item-detail-modal` populated with data for `itemId`.
- `window.WikiDB.closeItemDetailModal()`: Dismisses modal with smooth exit animation.

### Bidirectional Linkage: Items <-> Pokédex
- Item Modal -> Dex: Inside `#wiki-item-detail-modal`, clicking an associated Pokemon card calls:
  `window.PokemonApp.openPokemonDetailModal(targetPokemonObject)`.
- Dex -> Item Modal: Inside `#pokedex-detail-modal`, when a Pokemon requires an evolution item, rendering an interactive chip `<button class="pokedex-evo-item-btn" onclick="window.WikiDB.openItemDetailModal('${matchedItemId}')">${itemName}</button>`.

## Design & UI Constraints
- Zero Emoji Policy: Absolutely NO EMOJIS in code, comments, UI text, or markdown. Use SVG or ASCII tokens (e.g. `[✓]`, `[!]`, `✕`).
- Single Frame Rule: Outer containers (`#wiki-subpanel-items`, modal containers) have `border: none; background: transparent; padding: 0;`.
- Dropdown arrow styling: `padding-right: 36px !important; background-position: right 18px center !important;` with downward menu opening.
- Themes: Midnight, Onyx, Dawn, Emerald styling using CSS custom properties.
