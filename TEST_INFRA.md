# E2E Test Infra: Pokemon Sleep Dynamic Data Scan and Sync System

## Test Philosophy
- Opaque-box, requirement-driven. Derives from ORIGINAL_REQUEST.md without coupling to internal implementation logic.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial + Real-World Workload Testing.
- Progressive testability: verification mechanism uses the simplest channel (exit codes, manifest integrity, data parsing, rendering smoke tests).
- Zero emojis and zero decorative glyphs policy.

## Feature Inventory & Test Mapping
| # | Feature | Requirement | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---|---------|-------------|:------:|:------:|:------:|:------:|
| 1 | Dynamic Sync CLI Runner | R1 | 5 | 5 | Yes | Yes |
| 2 | Official Announcement Scanner | R1 | 5 | 5 | Yes | Yes |
| 3 | Serebii & RaenonX Ingestion | R1 | 5 | 5 | Yes | Yes |
| 4 | Defensive Health Gate & Validator | R1 | 5 | 5 | Yes | Yes |
| 5 | New Ingredient: 一口堅果 | R2 | 5 | 5 | Yes | Yes |
| 6 | 3 New Recipes (Curry 39, Salad 121, Dessert 91) | R2 | 5 | 5 | Yes | Yes |
| 7 | New Pokemon (Cottonee #546, Whimsicott #547) | R2 | 5 | 5 | Yes | Yes |
| 8 | Sun Stone Evolution Linkage | R2 | 5 | 5 | Yes | Yes |
| 9 | Sleep Styles for Cottonee & Whimsicott | R2 | 5 | 5 | Yes | Yes |
| 10 | 570 Sleep Styles Goal & Pot Expansion | R2 | 5 | 5 | Yes | Yes |
| 11 | Frontend Static Dictionaries & i18n | R2 | 5 | 5 | Yes | Yes |
| 12 | Top Meta & Appraisal Lab Integration | R2 | 5 | 5 | Yes | Yes |
| 13 | Manifest SHA-256 Consistency | R2, R3 | 5 | 5 | Yes | Yes |
| 14 | Anti-Regression (npm test / npm run test:fast) | R3 | 5 | 5 | Yes | Yes |
| 15 | Multi-Page Visual & Interaction Parity | R3 | 5 | 5 | Yes | Yes |

## Test Architecture
- Test Runner: `node tests/run_tests.js [--fast]`
- Dedicated Sync & Multi-Tab E2E Suite: `tests/e2e_sync_and_multitab.js`
- Pass/Fail Semantics: Exit code 0, 100% tests passing, zero unhandled rejections or runtime exceptions.
- Layout:
  - `tests/tiers/tier1_coverage.js`
  - `tests/tiers/tier2_boundary.js`
  - `tests/tiers/tier3_combinations.js`
  - `tests/tiers/tier4/`
  - `tests/e2e_sync_and_multitab.js`

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full Sync Execution & Manifest Invalidation Check | F1, F2, F3, F4, F13 | High |
| 2 | End-to-End Pokedex View & Search for Cottonee / Whimsicott | F7, F8, F9, F11, F15 | Medium |
| 3 | End-to-End Cooking Calculation for 121-Pot Salad with 一口堅果 | F5, F6, F11, F12, F15 | High |
| 4 | Ingredient Ladder & Wiki Values Render for 20th Ingredient | F5, F11, F15 | Medium |
| 5 | Island Camps & 570 Sleep Style Goal Unlock Verification | F10, F15 | Medium |
| 6 | Full Automated Test Regression Run (`npm run test:fast` & `npm test`) | F14, F13 | High |

## Coverage Thresholds
- Tier 1: >= 5 test cases per feature
- Tier 2: >= 5 test cases per feature (boundary and error conditions)
- Tier 3: pairwise coverage of major feature combinations
- Tier 4: >= 6 realistic application scenarios
