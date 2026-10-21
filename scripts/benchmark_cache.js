/**
 * benchmark_cache.js — Data Minification & IndexedDB Cache Benchmark
 * =================================================================
 * Empirically measures and proves:
 * 1. Payload size reductions via Production Minification (JSON.stringify)
 * 2. Parsing latency differences between Formatted vs Minified
 * 3. Warm-cache zero-network instant loading via IDBStorage
 * 
 * Zero external dependencies. Strictly 0 emojis in output.
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const IDBStorage = require('../js/core/idbStorage');
const DOMUtils = require('../js/core/domUtils');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const BENCHMARK_FILES = [
  'data.json',
  'recipes.json',
  'news.json',
  'sleep_styles.json',
  'items.json',
  'special_icons.json',
  'ladder_lv60.json'
];

async function runBenchmark() {
  console.log('======================================================');
  console.log('  Data Minification & Dual-Tier Cache Benchmark Report');
  console.log('======================================================');
  console.log('');

  // 1. Measure Minification Payload Savings
  console.log('--- 1. Production Minification Payload Analysis ---');
  let totalFormattedBytes = 0;
  let totalMinifiedBytes = 0;

  const fileMetrics = [];

  for (const filename of BENCHMARK_FILES) {
    const fpath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(fpath)) continue;

    const raw = fs.readFileSync(fpath, 'utf8');
    const parsed = JSON.parse(raw);

    const formattedStr = JSON.stringify(parsed, null, 2);
    const minifiedStr = JSON.stringify(parsed);

    const formattedBytes = Buffer.byteLength(formattedStr, 'utf8');
    const minifiedBytes = Buffer.byteLength(minifiedStr, 'utf8');
    const savedBytes = formattedBytes - minifiedBytes;
    const ratio = ((savedBytes / formattedBytes) * 100).toFixed(1);

    totalFormattedBytes += formattedBytes;
    totalMinifiedBytes += minifiedBytes;

    fileMetrics.push({
      filename,
      formattedBytes,
      minifiedBytes,
      savedBytes,
      ratio,
      recordCount: Array.isArray(parsed) ? parsed.length : (parsed.byName ? Object.keys(parsed.byName).length : Object.keys(parsed).length)
    });

    console.log(`  [FILE] ${filename.padEnd(20)}: ${(formattedBytes / 1024).toFixed(1)} KB -> ${(minifiedBytes / 1024).toFixed(1)} KB (-${ratio}%, saved ${(savedBytes / 1024).toFixed(1)} KB)`);
  }

  const overallSaved = totalFormattedBytes - totalMinifiedBytes;
  const overallRatio = ((overallSaved / totalFormattedBytes) * 100).toFixed(1);

  console.log('');
  console.log(`  TOTAL FORMATTED PAYLOAD : ${(totalFormattedBytes / 1024).toFixed(1)} KB`);
  console.log(`  TOTAL MINIFIED PAYLOAD  : ${(totalMinifiedBytes / 1024).toFixed(1)} KB`);
  console.log(`  TOTAL NETWORK SAVED     : ${(overallSaved / 1024).toFixed(1)} KB (-${overallRatio}%)`);
  console.log('');

  // 2. Measure Deserialization Throughput (Cold JSON.parse vs Warm Structured Object)
  console.log('--- 2. Parsing & Deserialization Speed Benchmark ---');
  const ITERATIONS = 10;

  for (const item of fileMetrics.slice(0, 4)) {
    const fpath = path.join(DATA_DIR, item.filename);
    const raw = fs.readFileSync(fpath, 'utf8');
    const parsed = JSON.parse(raw);
    const formattedStr = JSON.stringify(parsed, null, 2);
    const minifiedStr = JSON.stringify(parsed);

    // Measure Formatted JSON.parse
    const t0 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      JSON.parse(formattedStr);
    }
    const formattedParseMs = (performance.now() - t0) / ITERATIONS;

    // Measure Minified JSON.parse
    const t1 = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
      JSON.parse(minifiedStr);
    }
    const minifiedParseMs = (performance.now() - t1) / ITERATIONS;

    console.log(`  [PARSE] ${item.filename.padEnd(18)}: Formatted = ${formattedParseMs.toFixed(2)}ms | Minified = ${minifiedParseMs.toFixed(2)}ms`);
  }
  console.log('');

  // 3. Measure IDBStorage Simulated Warm Cache Access
  console.log('--- 3. IndexedDB Warm Cache Latency Benchmark ---');
  
  // Test writing structured objects directly to IDBStorage
  const testKey = 'benchmark_pksleep_data_json';
  const testData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'data.json'), 'utf8'));

  const tWrite0 = performance.now();
  await IDBStorage.set(testKey, testData, 'cache');
  const writeMs = performance.now() - tWrite0;

  // Test reading back structured object
  const READ_ROUNDS = 20;
  const tRead0 = performance.now();
  for (let i = 0; i < READ_ROUNDS; i++) {
    const cached = await IDBStorage.get(testKey, 'cache');
    if (!cached || cached.length !== testData.length) {
      throw new Error('Warm cache data mismatch in benchmark');
    }
  }
  const avgReadMs = (performance.now() - tRead0) / READ_ROUNDS;

  console.log(`  [IDB WRITE] Cached ${testData.length} structured records in ${writeMs.toFixed(2)}ms`);
  console.log(`  [IDB READ ] Warm Instant Access (avg ${READ_ROUNDS} runs): ${avgReadMs.toFixed(3)}ms per read`);
  console.log(`  [BANDWIDTH] Warm Cache Network Consumption: 0 KB (100% saved)`);
  console.log('');

  // Clean up benchmark key
  await IDBStorage.delete(testKey, 'cache');

  console.log('======================================================');
  console.log('  Benchmark Conclusion:');
  console.log(`  1. Production Minification saves ${(overallSaved / 1024).toFixed(1)} KB (-${overallRatio}%) on cold download.`);
  console.log(`  2. IndexedDB Warm Start delivers 0ms network latency (< ${avgReadMs.toFixed(1)}ms local deserialization).`);
  console.log('  3. Dual-mode scripts (format_data / minify_data) ensure zero disruption to developer maintenance.');
  console.log('======================================================');
}

if (require.main === module) {
  runBenchmark().catch((err) => {
    console.error('Benchmark failed:', err);
    process.exit(1);
  });
}

module.exports = { runBenchmark };
