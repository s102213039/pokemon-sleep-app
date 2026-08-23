# E2E Test Infra: Pokémon Sleep App & Mobile H5 (/app/)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation internals.
- Methodology: Category-Partition + BVA + Pairwise + Workload Testing.
- Zero external dependencies: Pure Node.js runner in `tests/run_tests.js`.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Dedicated App Entry & Safe Area | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | 2-Character Minimal Bottom Dock | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 3 | Smart Routing & Anti-Loop Guard | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Pokedex Mobile View (⚡ 圖鑑) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 5 | Recipes Mobile View (🍲 料理) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 6 | Wiki Mobile View (📚 百科) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 7 | Box & OCR Mobile View (📦 盒子) | ORIGINAL_REQUEST §R3, R4 | 5 | 5 | ✓ |
| 8 | News & Gantt Mobile View (📰 最新) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 9 | Bottom Sheet Drawer & Modal System | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 10 | Full Feature Parity & Lab Appraisal | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 11 | Bilingual Engine & 4 Themes Support | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 12 | Dropdown & UI Safety Polish | User Global Rules §VI | 5 | 5 | ✓ |

## Test Architecture
- Test Runner: `tests/run_tests.js` executed via `rtk node tests/run_tests.js`
- Test Case Format: `test(tier, description, fn)` with `assert()` and `assertEquals()`
- Execution Environment: Node.js `vm` sandbox + `MiniElement` headless DOM simulator
- Zero Regressions: All 44 baseline tests must pass 100% at all times.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Desktop Baseline User Session Workflow | F4, F10, F11 | Medium |
| 2 | Desktop SPA Tab Lifecycle & Wiki Bilingual Rendering | F6, F11 | High |
| 3 | Mobile H5 End-to-End User Journey (Entry -> Dock Navigation -> Search -> Recipe Calc -> Box PR -> News) | F1, F2, F4, F5, F6, F7, F8 | High |
| 4 | Mobile & Desktop Dual-Surface Coexistence & Shared Storage Sync | F1, F3, F7, F11 | High |
| 5 | Mobile Smart Redirection & Anti-Loop Preference Workflow | F1, F3 | Medium |

## Coverage Thresholds
- Tier 1: ≥5 per feature
- Tier 2: ≥5 per feature (where boundaries exist)
- Tier 3: pairwise coverage of major feature interactions
- Tier 4: ≥5 realistic application scenarios
