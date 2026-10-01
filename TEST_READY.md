# Pokémon Sleep App — E2E Test Suite & Test Infrastructure Ready

**Generated**: 2026-10-01  
**Status**: Ready & Integrated (171 / 171 Passed, 0 Failures)  
**Test Suite Path**: `tests/run_tests.js`  
**Execution Command**: `rtk node tests/run_tests.js`

---

## 1. Test Suite Overview

The Pokémon Sleep automated test suite is an opaque-box, zero-external-dependency test runner built on Node.js core modules (`fs`, `path`, `vm`). It utilizes a headless `MiniElement` DOM engine and simulated sandboxed browser contexts to test both the Desktop Surface (`index.html`) and the Mobile H5 Surface (`app/index.html`) across 4 rigorous tiers.

### Key Metrics
- **Total Test Cases**: 171 tests
- **Execution Speed**: ~400ms (Pure Node.js)
- **Status**: 100% Pass (171 / 171)
- **Tiers Covered**:
  - **Tier 1 - Feature Coverage**: 56 tests (Structure, Meta, Assets, Dock, CSS, Desktop non-regression, Dataset integrity)
  - **Tier 2 - Boundary & Corner Cases**: 41 tests (Redirection, Anti-loop, Stepper clamping, Anti-duplicate subskills, Clear button, Formats, Evolution level boundaries)
  - **Tier 3 - Cross-Feature Combinations**: 8 tests (Pairwise state persistence, Segmented controls + Steppers + Tasty multipliers, Themes + i18n across tabs, Bottom sheets, Appraisal modals, Ribbon carry deductions)
  - **Tier 4 - Real-World Application Scenarios**: 66 tests (Mobile H5 end-to-end user journey, Desktop baseline preservation, Dual-surface localStorage sync, Smart redirection & anti-loop flow, Multi-fallback data resolution, OCR multi-anchor parsing, CloudSync merge, Specialty-specific appraisals, Berry Burst BFS synergy, Legendary mechanics)

---

## 2. Test Execution & Verification

Run the test suite from anywhere within the repository using `rtk`:

```bash
rtk node tests/run_tests.js
```

### Current Test Execution Status
```
======================================================
                   Test Results Summary
======================================================
- Tier 1 - Feature Coverage: 56 Passed, 0 Failed (Total 56)
- Tier 2 - Boundary & Corner Cases: 41 Passed, 0 Failed (Total 41)
- Tier 3 - Cross-Feature Combinations: 8 Passed, 0 Failed (Total 8)
- Tier 4 - Real-World Application Scenarios: 66 Passed, 0 Failed (Total 66)
------------------------------------------------------
TOTAL RESULT: 171 / 171 Passed (0 Failed)
```

---

## 3. Core Test Specifications

1. **`window.__DATA_BASE_PATH__` Multi-Fallback Contract**:
   - `app/index.html`: `window.__DATA_BASE_PATH__ = '../'` ensures all multi-fallback fetches resolve shared JSON datasets from `../data/*.json` with zero 404s.
2. **`pksleep_view_pref` Routing Contract**:
   - `localStorage.getItem('pksleep_view_pref')` supports `'desktop'` and `'mobile'`.
   - Query override `?view=desktop` forces desktop mode and prevents redirection loops.
3. **Dual-Surface Coexistence**:
   - Desktop and Mobile H5 styles are strictly isolated (`.mobile-h5-app` namespace).
4. **Appraisal & Specialty Gating Rules**:
   - Berry Burst skill specialists require BFS (`+5.0` synergy).
   - E4E healers and pure tactical specialists strictly penalize BFS to prevent Sneaky Snacking skill check stops.
   - Charge Strength specialists support dual-track (pure skill vs BFS island cannon).
5. **Theme Color Specifications**:
   - Pre- and post-execution checks across Midnight, Onyx, Dawn, Emerald themes.
