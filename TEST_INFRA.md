# Test Infrastructure: Pokémon Sleep Items & Incense Encyclopedia

## 1. Test Philosophy

- **Opaque-Box & Requirement-Driven**: Tests are designed directly against requirements specified in `PROJECT.md` and `ORIGINAL_REQUEST.md`, without coupling to hidden implementation details.
- **Methodology Matrix**:
  - **Category-Partition**: Functional division into Master Data Engine, Wiki Subpanel Navigation, Multilingual Search/Filtering, Detail Modals, and Bidirectional Pokédex Linkage.
  - **Boundary Value Analysis (BVA)**: Empty strings, whitespace queries, maximum category items, zero sleep point costs, null acquisition fields, single vs multi-target Pokémon evolutions.
  - **Pairwise Testing**: Cross-combination of item categories, multilingual query terms (zh-TW, zh-CN, en-US), UI themes (Midnight, Onyx, Dawn, Emerald), and viewport form factors (Desktop vs Mobile H5).
  - **Workload & Stress Testing**: Parsing speed across all 118 items, DOM node creation thresholds, rapid modal opening/closing, and non-destructive filter switching.
- **Zero External Dependencies**: Pure Node.js test runner using native `fs`, `path`, and `vm` modules with custom headless `MiniElement` DOM emulation.
- **Progressive Testability & Zero Regressions**: All 216 existing baseline tests must maintain a 100% pass rate at all times. Test 217 verifies full integration across all 18 project features.

---

## 2. Feature Inventory Mapping (Tiers 1 - 4)

Complete mapping of all 18 features defined in `PROJECT.md` across the 4-tier test architecture:

| # | Feature | Milestone | Source | Tier 1 (Feature Coverage) | Tier 2 (Boundary & Corner) | Tier 3 (Cross-Feature Pairwise) | Tier 4 (Real-World Scenarios) |
|---|---------|-----------|--------|:-------------------------:|:--------------------------:|:-------------------------------:|:-----------------------------:|
| 1 | Items Master JSON Schema | M1 | ORIGINAL_REQUEST R1 | [x] Schema structure, required keys, 118 items count | [x] Null sleep points, empty pokemon_ids | [x] Category distribution parity | [x] Test 217 Master Data Audit |
| 2 | Multilingual Localization | M1 | ORIGINAL_REQUEST R1 | [x] zh-TW, zh-CN, en-US strings for all items | [x] Missing locale fallback, long text overflow | [x] Language switch dynamic re-render | [x] Test 217 Localization Audit |
| 3 | Serebii CDN Sprite URLs | M1 | Spec Miner | [x] Asset URL patterns and protocol | [x] Malformed URL handling, default sprite | [x] Image lazy-load & theme contrast | [x] Test 217 Asset Integrity |
| 4 | Shop Pricing & Acquisition | M1 | ORIGINAL_REQUEST R1 | [x] Sleep points regular/premium limits | [x] Non-purchasable items (null prices) | [x] Shop price vs achievement filters | [x] Test 217 Economy Validation |
| 5 | Evolution Target Mapping | M1 | Spec Miner | [x] Mapping 15+ evo items to Pokemon IDs | [x] Multi-branch evolutions (Eevee, Slowpoke) | [x] Pokédex evo_req string alignment | [x] Test 217 Evolution Linkage |
| 6 | Wiki Subtab Registration | M2 | ORIGINAL_REQUEST R2 | [x] 'items' in VALID_WIKI_SUBTABS | [x] Invalid subtab fallback | [x] URL hash routing (#wiki/items) | [x] Test 217 Navigation Routing |
| 7 | Wiki Subpanel Container | M2 | ORIGINAL_REQUEST R2 | [x] #wiki-subpanel-items DOM presence | [x] Hidden panel rendering performance | [x] Mobile drawer vs desktop panel | [x] Test 217 Layout Conformance |
| 8 | Horizontal Category Filter | M2 | ORIGINAL_REQUEST R2 | [x] 7 category filter pills presence | [x] Rapid pill toggling, empty category | [x] Filter pill active state across themes | [x] Test 217 Filter Interaction |
| 9 | Multilingual Search Bar | M2 | ORIGINAL_REQUEST R2 | [x] Real-time search by name/effect/pokemon | [x] Whitespace, special regex chars, case | [x] Category filter + search intersection | [x] Test 217 Query Engine |
| 10 | Item Cards Grid Layout | M2 | ORIGINAL_REQUEST R2 | [x] .wiki-item-card-grid and card DOM | [x] Single-item grid, 118-item full render | [x] Grid responsiveness (1-col to 4-col) | [x] Test 217 Responsive Grid |
| 11 | Multi-Theme & Mobile CSS | M2 | ORIGINAL_REQUEST R4 | [x] Stylesheet tokens across 4 themes | [x] Viewport clamp (320px to 2560px) | [x] Theme switch without layout glitch | [x] Test 217 Theme & Mobile Audit |
| 12 | Item Detail Modal | M3 | ORIGINAL_REQUEST R3 | [x] #wiki-item-detail-modal structure | [x] Missing item ID lookup, rapid close | [x] Modal open over active wiki subtab | [x] Test 217 Modal UX Lifecycle |
| 13 | Item -> Dex Navigation | M3 | ORIGINAL_REQUEST R3 | [x] Pokemon avatar click triggers Dex modal | [x] Unreleased / invalid Pokemon ID | [x] Modal stack depth & back navigation | [x] Test 217 Forward Dex Linkage |
| 14 | Dex -> Item Navigation | M3 | ORIGINAL_REQUEST R3 | [x] Clickable evo item chip in Dex modal | [x] Multi-item requirements (Metal Coat) | [x] Dex modal -> Item modal round-trip | [x] Test 217 Reverse Dex Linkage |
| 15 | Overlay Lifecycle Hooks | M3 | Explorer 1 | [x] MOBILE_OVERLAY_IDS registration | [x] Touch gesture conflicts, body scroll lock | [x] Drawer swipe-down dismiss on mobile | [x] Test 217 Overlay Integrity |
| 16 | E2E Test 217 Suite | M4 | ORIGINAL_REQUEST AC | [x] Standalone probe & run_tests integration | [x] Strict assertion failure reporting | [x] Combined pipeline execution | [x] Test 217 Suite Verification |
| 17 | Adversarial Hardening | M4 | Project Pattern | [x] XSS escaping in search/modal descriptions | [x] Null/undefined inputs, prototype pollution | [x] Memory leak & listener accumulation | [x] Test 217 Security & Resilience |
| 18 | Final Verification & Deploy | M4 | System Prompt | [x] Zero regression (217/217 pass) | [x] Zero Emoji strict compliance scan | [x] Single Frame & Dropdown Arrow rules | [x] Test 217 Compliance Audit |

---

## 3. Test Architecture & Runner Environment

### 3.1 Execution Harness
- **Test Runner**: Pure Node.js script located at `tests/run_tests.js`.
- **Standalone Probe**: Dedicated test probe at `tests/test_217_items_encyclopedia.js`.
- **CLI Commands**:
  - Run complete test suite: `rtk node tests/run_tests.js`
  - Run standalone Test 217 probe: `rtk node tests/test_217_items_encyclopedia.js`

### 3.2 Headless DOM & VM Sandboxing
- Headless simulation via lightweight `MiniElement` class implementing standard DOM APIs:
  - Properties: `tagName`, `id`, `className`, `classList`, `style`, `dataset`, `children`, `parentNode`.
  - Methods: `querySelector`, `querySelectorAll`, `appendChild`, `removeChild`, `setAttribute`, `getAttribute`, `addEventListener`, `dispatchEvent`.
- Sandboxed execution via `vm.createContext` providing:
  - Isolated `window`, `document`, `localStorage`, `location`, `history`, `console`, and `setTimeout`.
  - Offline cache inspection and dynamic script execution.

### 3.3 Assertion Primitives
- `assert(condition, message)`: Validates truthy condition.
- `assertEquals(actual, expected, message)`: Strict equality comparison (`!==`) with formatted JSON mismatch output.
- `assertArrayEquals(actual, expected, message)`: Deep array comparison via serialized JSON verification.

---

## 4. Test Tiers Structure & Thresholds

### Tier 1 - Feature Coverage (Target: 64 Tests)
- Baseline verification of core units, data schemas, and UI layout elements.
- Features: Schema structure, DOM existence, registry entries, CSS classes.
- Requirement: Minimum 5 assertions per feature.

### Tier 2 - Boundary & Corner Cases (Target: 43 Tests)
- Input boundaries, empty/malformed values, whitespace handling, and error states.
- Features: Non-existent item IDs, empty search inputs, regex meta-character injection, extreme screen widths, null pricing.
- Requirement: Minimum 3 boundary assertions per module.

### Tier 3 - Cross-Feature Combinations (Target: 8 Tests)
- Pairwise interactions between modules.
- Features:
  - Category filter combined with real-time text query.
  - Multi-theme color switches across desktop and mobile views.
  - Localized string toggles affecting rendered items and modals.
  - Bidirectional navigation handoff (Item Modal <-> Pokédex Modal).
- Requirement: Minimum 2 combinations per primary interaction flow.

### Tier 4 - Real-World Application Scenarios (Target: 102 Tests)
- End-to-end user journeys, compliance audits, and full system integration.
- Tests 1 to 216: Existing regression coverage (101 tests in Tier 4).
- Test 217: Comprehensive Items & Incense Encyclopedia integration (1 test in Tier 4).
  - Scope of Test 217:
    1. Master Data Engine Integrity (118 items, 6 categories, schema conformance).
    2. Wiki Subpanel Navigation & Subtab Switching.
    3. Multilingual Search & Horizontal Filter Pill Mechanics.
    4. Item Detail Modal UI & Overlay Registry.
    5. Bidirectional Dex Linkage (Item Modal -> Pokédex Modal & Pokédex Modal -> Item Modal).
    6. Global Compliance Rules:
       - Zero Emoji Policy: Scan codebase and data for unicode emojis.
       - Single Frame Rule: Ensure no nested double outer borders.
       - Dropdown Layout: 36px right padding and 18px center icon inset.
       - 4-Theme Support: Midnight, Onyx, Dawn, Emerald custom properties.

---

## 5. Verification Commands

Run full regression suite:
```bash
rtk node tests/run_tests.js
```

Run standalone Items & Incense Encyclopedia probe:
```bash
rtk node tests/test_217_items_encyclopedia.js
```
