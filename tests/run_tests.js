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

// CLI option parsing: e.g. --tier=1..4, --tier=1,2,3, --fast, --skip-tier4, --grep="pattern"
const args = process.argv.slice(2);
let targetTiers = null;
let grepFilter = null;
const isFastMode = args.includes('--fast') || args.includes('--quick') || args.includes('-f') || process.env.FAST_TEST === '1';
const skipTier4 = args.includes('--skip-tier4') || isFastMode;

const parseTierString = (str) => {
  return str.split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n) && n >= 1 && n <= 4);
};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg.startsWith('--tier=') || arg.startsWith('--tiers=') || arg.startsWith('-t=') || arg.startsWith('-T=')) {
    const val = arg.split('=')[1];
    targetTiers = parseTierString(val);
  } else if (arg === '-t' || arg === '-T' || arg === '--tier' || arg === '--tiers') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      targetTiers = parseTierString(args[i + 1]);
      i++;
    }
  } else if (arg.startsWith('--grep=') || arg.startsWith('-g=')) {
    grepFilter = arg.split('=')[1].trim();
  } else if (arg === '--grep' || arg === '-g') {
    if (args[i + 1] && !args[i + 1].startsWith('-')) {
      grepFilter = args[i + 1].trim();
      i++;
    }
  }
}

if (skipTier4) {
  if (!targetTiers || targetTiers.length === 0) {
    targetTiers = [1, 2, 3];
  } else {
    targetTiers = targetTiers.filter(t => t !== 4);
    if (targetTiers.length === 0) targetTiers = [1, 2, 3];
  }
}

if (targetTiers && targetTiers.length === 0) {
  targetTiers = null;
}

if (grepFilter) {
  harness.setGrepFilter(grepFilter);
}

const shouldRun = (t) => !targetTiers || targetTiers.includes(t);

console.log('\n======================================================');
console.log('      Pokémon Sleep SPA Automated E2E Test Suite');
if (targetTiers) console.log(`      Running Tiers: ${targetTiers.join(', ')}`);
if (grepFilter) console.log(`      Filter Grep: "${grepFilter}"`);
console.log('======================================================\n');

if (shouldRun(1)) registerTier1Tests();
if (shouldRun(2)) registerTier2Tests();
if (shouldRun(3)) registerTier3Tests();
if (shouldRun(4)) registerTier4Tests();

harness.printSummaryAndExit();
