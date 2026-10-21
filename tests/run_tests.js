/**
 * Pokémon Sleep SPA Automated E2E Test Suite (Modular Architecture)
 * Supports running all 226 tests or specific tier via --tier=1..4
 */

const harness = require('./test_harness');
const { registerTier1Tests } = require('./tiers/tier1_coverage');
const { registerTier2Tests } = require('./tiers/tier2_boundaries');
const { registerTier3Tests } = require('./tiers/tier3_combos');
const { registerTier4Tests } = require('./tiers/tier4_scenarios');

// Ensure all CSS and JS modules are synchronized
try {
  const { buildAll } = require('../scripts/build_all');
  buildAll();
} catch (e) {
  // Silent fallback if running in custom environments
}

// CLI option parsing: e.g. --tier=1 or -t=4
const args = process.argv.slice(2);
let targetTier = null;
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--tier=')) {
    targetTier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('-t=')) {
    targetTier = parseInt(arg.split('=')[1], 10);
  } else if (arg === '-t' || arg === '--tier') {
    if (args[i + 1]) targetTier = parseInt(args[i + 1], 10);
  }
}

console.log('\n======================================================');
console.log('      Pokémon Sleep SPA Automated E2E Test Suite');
console.log('======================================================\n');

if (!targetTier || targetTier === 1) registerTier1Tests();
if (!targetTier || targetTier === 2) registerTier2Tests();
if (!targetTier || targetTier === 3) registerTier3Tests();
if (!targetTier || targetTier === 4) registerTier4Tests();

harness.printSummaryAndExit();
