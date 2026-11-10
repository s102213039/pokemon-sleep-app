/**
 * tests/test_challenger_m2_1_dom_adversarial.js
 * Empirical Adversarial Challenger Suite for Milestone 2:
 * Stress-testing DOM rendering, node clustering, coordinate clamping, and tooltips
 * in js/modules/wiki/wiki_skill_ladder_render.js.
 *
 * Focus areas:
 * 1. Extreme Node Clustering (2, 4, 6, 10 nodes; deltas 0.05, 0.15, 0.195, 0.25)
 * 2. Boundary Position Clamping (0.0 procs, > 10.0 procs, clamp(20px, ..., calc(100% - 20px)))
 * 3. Tooltip Positioning (Tracks 0-3 popup-down, Tracks 4-8 popup-up; sort invariance)
 * 4. Seconds Rounding Edge Cases (23m00s, never 22m60s)
 * 5. Rule Compliance (Zero Emojis, Zero Star Glyphs, Pure Text Tags, Single Frame Rule)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WORKSPACE_ROOT = path.resolve(__dirname, '..');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails = [];

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log('  [PASS] ' + message);
  } else {
    failedChecks++;
    console.error('  [FAIL] ' + message);
    failureDetails.push(message);
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (Expected: ${expected}, Actual: ${actual})`);
}

console.log('================================================================');
console.log('  Challenger M2-1: Skill Ladder DOM & Clustering Adversarial');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Helper to construct a simulated VM context with full wiki.js loaded
// -----------------------------------------------------------------------------
function createWikiContext(customPokemons = null, lang = 'zh-TW') {
  const wikiJsPath = path.join(WORKSPACE_ROOT, 'js', 'modules', 'wiki.js');
  const wikiJs = fs.readFileSync(wikiJsPath, 'utf8');

  const mockStorage = new Map([['pksleep_lang', lang]]);
  let coordinateInner = '';

  const ctx = {
    localStorage: {
      getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    },
    window: {
      localStorage: {
        getItem: (k) => mockStorage.has(k) ? mockStorage.get(k) : null,
        setItem: (k, v) => mockStorage.set(k, String(v)),
        removeItem: (k) => mockStorage.delete(k)
      },
      addEventListener: () => {},
      I18N: {
        getLanguage: () => lang,
        getPokemonName: (s) => s,
        getMainSkillName: (s) => s
      },
      allPokemons: customPokemons || undefined
    },
    document: {
      body: { classList: { contains: (c) => false } },
      documentElement: { setAttribute: () => {} },
      getElementById: (id) => {
        if (id === 'wiki-skill-ladder-coordinate') {
          return {
            get innerHTML() { return coordinateInner; },
            set innerHTML(v) { coordinateInner = v; }
          };
        }
        return null;
      },
      querySelectorAll: () => [],
      createElement: () => ({ setAttribute: () => {}, innerHTML: '', className: '', id: '', style: {} }),
      addEventListener: () => {}
    },
    console: console
  };

  ctx.window.window = ctx.window;
  ctx.window.document = ctx.document;
  vm.createContext(ctx);
  vm.runInContext(wikiJs, ctx);

  return { ctx, WikiDB: ctx.window.WikiDB };
}

// -----------------------------------------------------------------------------
// Helper to create synthetic test Pokemon
// -----------------------------------------------------------------------------
function makeSyntheticPokemon(id, name, skill, intervalSec, skillRate, specialty = '技能') {
  return {
    id,
    name,
    name_cn: name,
    name_en: `Pkm_${id}`,
    formatted_no: String(id).padStart(3, '0'),
    main_skill: skill,
    interval: intervalSec,
    skill_rate: skillRate,
    specialty,
    icon_url: `https://example.com/icon/${id}.png`
  };
}

function parseOffset(style) {
  // style: clamp(20px, calc(60.47% + 12px), calc(100% - 20px))
  // or clamp(20px, calc(60.47% + -12px), calc(100% - 20px))
  // or clamp(20px, 60.47%, calc(100% - 20px))
  const inner = style.split(',')[1] || '';
  const m = inner.match(/\+\s*(-?\d+)px/);
  return m ? parseInt(m[1], 10) : 0;
}

// =============================================================================
// TEST SUITE 1: Extreme Node Clustering Under Artificial Densities
// =============================================================================
console.log('--- Test Suite 1: Extreme Node Clustering Under High Density ---');

{
  // Test 1.1: Identical procs clusters of size 2, 4, 6, 10
  const sizes = [2, 4, 6, 10];
  for (const groupSize of sizes) {
    const pkmList = [];
    for (let i = 0; i < groupSize; i++) {
      pkmList.push(makeSyntheticPokemon(100 + i, `ClusterNode_${groupSize}_${i}`, '能量填充S', 3600, 0.10));
    }

    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();

    // Verify cluster membership class
    const clusterMatches = html.match(/node-in-cluster/g) || [];
    assertEquals(clusterMatches.length, groupSize, `Cluster of size ${groupSize} must mark all ${groupSize} nodes with node-in-cluster`);

    // Extract leftStyle for each node in this track
    const trackStart = html.indexOf('data-skill-track="charge_energy"');
    const trackEnd = html.indexOf('data-skill-track="', trackStart + 1);
    const trackBlock = trackEnd !== -1 ? html.slice(trackStart, trackEnd) : html.slice(trackStart);

    const styleRegex = /class="ladder-node[^"]*"[^>]*style="left:\s*([^;]+);/g;
    const parsedOffsets = [];
    let match;
    while ((match = styleRegex.exec(trackBlock)) !== null) {
      parsedOffsets.push(parseOffset(match[1].trim()));
    }

    assertEquals(parsedOffsets.length, groupSize, `Must extract ${groupSize} leftStyle declarations`);

    const expectedStaggerStep = groupSize >= 6 ? 16 : (groupSize >= 4 ? 20 : 24);

    // Check step between consecutive nodes
    for (let i = 0; i < parsedOffsets.length - 1; i++) {
      const step = parsedOffsets[i] - parsedOffsets[i + 1];
      assertEquals(step, expectedStaggerStep, `Cluster size ${groupSize}: step between node ${i} and ${i+1} must be ${expectedStaggerStep}px`);
    }

    // Verify avatar centers are strictly non-overlapping
    const uniqueOffsets = new Set(parsedOffsets);
    assertEquals(uniqueOffsets.size, groupSize, `Cluster size ${groupSize}: all ${groupSize} node avatar centers must have distinct pixel offsets`);
  }
}

{
  // Test 1.2: Proximity threshold boundary testing (deltas 0.05, 0.15, 0.195, 0.25)
  const baseInterval = 3600;
  const factor = 43200 / (Math.round(3600 * (1 - 0.118)) * 0.45);

  // Case A: delta = 0.05 (4 nodes: 3.15, 3.10, 3.05, 3.00)
  // Pairwise diff: 0.05 <= 0.20, head diff: 0.15 <= 0.45 -> Single cluster of 4
  {
    const pkmList = [
      makeSyntheticPokemon(201, 'Delta05_A', '能量填充S', baseInterval, 3.15 / factor),
      makeSyntheticPokemon(202, 'Delta05_B', '能量填充S', baseInterval, 3.10 / factor),
      makeSyntheticPokemon(203, 'Delta05_C', '能量填充S', baseInterval, 3.05 / factor),
      makeSyntheticPokemon(204, 'Delta05_D', '能量填充S', baseInterval, 3.00 / factor)
    ];
    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();
    const clusterCount = (html.match(/node-in-cluster/g) || []).length;
    assertEquals(clusterCount, 4, 'Delta 0.05 across 4 nodes within span 0.15 must form a cluster of 4');
  }

  // Case B: delta = 0.15 (3 nodes: 3.30, 3.15, 3.00)
  // Pairwise diff: 0.15 <= 0.20, head diff: 0.30 <= 0.45 -> Single cluster of 3
  {
    const pkmList = [
      makeSyntheticPokemon(211, 'Delta15_A', '能量填充S', baseInterval, 3.30 / factor),
      makeSyntheticPokemon(212, 'Delta15_B', '能量填充S', baseInterval, 3.15 / factor),
      makeSyntheticPokemon(213, 'Delta15_C', '能量填充S', baseInterval, 3.00 / factor)
    ];
    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();
    const clusterCount = (html.match(/node-in-cluster/g) || []).length;
    assertEquals(clusterCount, 3, 'Delta 0.15 across 3 nodes within span 0.30 must form a cluster of 3');
  }

  // Case C: delta = 0.195 (3 nodes: 3.39, 3.195, 3.00)
  // Pairwise diff: 0.195 <= 0.20, head diff: 0.39 <= 0.45 -> Single cluster of 3
  {
    const pkmList = [
      makeSyntheticPokemon(221, 'Delta195_A', '能量填充S', baseInterval, 3.39 / factor),
      makeSyntheticPokemon(222, 'Delta195_B', '能量填充S', baseInterval, 3.195 / factor),
      makeSyntheticPokemon(223, 'Delta195_C', '能量填充S', baseInterval, 3.00 / factor)
    ];
    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();
    const clusterCount = (html.match(/node-in-cluster/g) || []).length;
    assertEquals(clusterCount, 3, 'Delta 0.195 (< 0.20 limit) must cluster 3 nodes');
  }

  // Case D: delta = 0.25 (3 nodes: 3.50, 3.25, 3.00)
  // Pairwise diff: 0.25 > 0.20 -> Must NOT cluster (each node is independent)
  {
    const pkmList = [
      makeSyntheticPokemon(231, 'Delta25_A', '能量填充S', baseInterval, 3.50 / factor),
      makeSyntheticPokemon(232, 'Delta25_B', '能量填充S', baseInterval, 3.25 / factor),
      makeSyntheticPokemon(233, 'Delta25_C', '能量填充S', baseInterval, 3.00 / factor)
    ];
    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();
    const clusterCount = (html.match(/node-in-cluster/g) || []).length;
    assertEquals(clusterCount, 0, 'Delta 0.25 (> 0.20 limit) must NOT cluster nodes');
  }

  // Case E: Chain span exceedance: 5 nodes with pairwise delta 0.12:
  // [3.48, 3.36, 3.24, 3.12, 3.00]
  // Pairwise deltas: 0.12 <= 0.20
  // Span from 3.48:
  // Node 1: diff 0.12 <= 0.45 -> in cluster
  // Node 2: diff 0.24 <= 0.45 -> in cluster
  // Node 3: diff 0.36 <= 0.45 -> in cluster
  // Node 4: diff 0.48 > 0.45 -> MUST SPLIT into a new cluster!
  {
    const pkmList = [
      makeSyntheticPokemon(241, 'Span_A', '能量填充S', baseInterval, 3.48 / factor),
      makeSyntheticPokemon(242, 'Span_B', '能量填充S', baseInterval, 3.36 / factor),
      makeSyntheticPokemon(243, 'Span_C', '能量填充S', baseInterval, 3.24 / factor),
      makeSyntheticPokemon(244, 'Span_D', '能量填充S', baseInterval, 3.12 / factor),
      makeSyntheticPokemon(245, 'Span_E', '能量填充S', baseInterval, 3.00 / factor)
    ];
    const { WikiDB } = createWikiContext(pkmList);
    WikiDB.toggleSkillLadderTop15(false);
    const html = WikiDB.renderSkillCoordinateLadder();

    // First 4 nodes should be in a cluster of size 4 (staggerStep 20)
    // 5th node (Span_E) should be alone (size 1, not in cluster)
    const inClusterMatches = (html.match(/node-in-cluster/g) || []).length;
    assertEquals(inClusterMatches, 4, 'Span > 0.45 must cap cluster size at 4 and leave 5th node independent');
    assert(!html.includes('data-pkm="Span_E" class="ladder-node node-in-cluster'), 'Span_E must NOT have node-in-cluster class');
  }
}

// =============================================================================
// TEST SUITE 2: Boundary Position Clamping & Margin Safety
// =============================================================================
console.log('\n--- Test Suite 2: Boundary Position Clamping & Margin Safety ---');

{
  // Test 2.1: Procs = 0.0 (absolute minimum boundary)
  const pkmMin = [
    makeSyntheticPokemon(301, 'ZeroProcs_A', '能量填充S', 3600, 0.0000001) // near 0
  ];
  const { WikiDB } = createWikiContext(pkmMin);
  WikiDB.toggleSkillLadderTop15(false);
  const html = WikiDB.renderSkillCoordinateLadder();

  // Verify leftStyle has clamp(20px, ..., calc(100% - 20px))
  assert(html.includes('left: clamp(20px,'), 'Zero procs node leftStyle must be wrapped in clamp(20px, ...)');
  assert(html.includes('calc(100% - 20px))'), 'Zero procs node leftStyle must clamp max boundary to calc(100% - 20px)');

  // Verify data boundary protection attribute on container
  assert(html.includes('data-boundary-protection="clamp(12px, calc(100% - 12px))"'), 'Nodes container must declare boundary protection attribute');
}

{
  // Test 2.2: Extreme high procs (> 10.0 and up to 100.0)
  const factor = 43200 / (Math.round(3600 * (1 - 0.118)) * 0.45);
  const pkmExtreme = [
    makeSyntheticPokemon(311, 'Extreme_12', '能量填充S', 3600, 12.0 / factor),
    makeSyntheticPokemon(312, 'Extreme_25', '能量填充S', 3600, 25.0 / factor)
  ];
  const { WikiDB } = createWikiContext(pkmExtreme);
  WikiDB.toggleSkillLadderTop15(false);
  const html = WikiDB.renderSkillCoordinateLadder();

  // Verify ruler ticks scale beyond 10
  assert(html.includes('<span class="tick-label">25</span>') || html.includes('<span class="tick-label">26</span>') || html.includes('<span class="tick-label">27</span>'), 'Ruler scale must adapt dynamically to extreme procs > 10.0');

  // Verify nodes at boundary have valid clamp
  assert(html.includes('left: clamp(20px,'), 'High procs node leftStyle must use clamp(20px, ...)');
  assert(html.includes('calc(100% - 20px))'), 'High procs node leftStyle must clamp max to calc(100% - 20px)');
}

{
  // Test 2.3: Boundary cluster with extreme negative offset at 0%
  const factor = 43200 / (Math.round(3600 * (1 - 0.118)) * 0.45);
  const pkmZeroCluster = [
    makeSyntheticPokemon(321, 'ZeroClust_1', '能量填充S', 3600, 0.05 / factor),
    makeSyntheticPokemon(322, 'ZeroClust_2', '能量填充S', 3600, 0.05 / factor),
    makeSyntheticPokemon(323, 'ZeroClust_3', '能量填充S', 3600, 0.05 / factor),
    makeSyntheticPokemon(324, 'ZeroClust_4', '能量填充S', 3600, 0.05 / factor)
  ];
  const { WikiDB } = createWikiContext(pkmZeroCluster);
  WikiDB.toggleSkillLadderTop15(false);
  const html = WikiDB.renderSkillCoordinateLadder();

  assert(html.includes('left: clamp(20px, calc('), 'Clustered nodes at low procs must have clamp with calc');
  assert(!html.includes('style="left: -'), 'Negative pixel coordinate must never be unshielded outside clamp');
}

// =============================================================================
// TEST SUITE 3: Tooltip Positioning & Sorting Invariance
// =============================================================================
console.log('\n--- Test Suite 3: Tooltip Positioning & Sorting Invariance ---');

{
  // Test 3.1: Verify default order popup directions for all 9 tracks
  // Tracks 0-3 must have 'popup-down', Tracks 4-8 must have 'popup-up'
  const { WikiDB } = createWikiContext();
  WikiDB.toggleSkillLadderTop15(false);
  WikiDB.setSkillLadderSortOrder('DEFAULT');
  const html = WikiDB.renderSkillCoordinateLadder();

  const trackDefs = [
    { id: 'charge_energy', expectedDir: 'popup-down', trackNum: 0 },
    { id: 'energy_all', expectedDir: 'popup-down', trackNum: 1 },
    { id: 'energy_single', expectedDir: 'popup-down', trackNum: 2 },
    { id: 'cooking_pot', expectedDir: 'popup-down', trackNum: 3 },
    { id: 'cooking_chance', expectedDir: 'popup-up', trackNum: 4 },
    { id: 'helper_boost', expectedDir: 'popup-up', trackNum: 5 },
    { id: 'dream_shards', expectedDir: 'popup-up', trackNum: 6 },
    { id: 'ingredient', expectedDir: 'popup-up', trackNum: 7 },
    { id: 'berry_burst', expectedDir: 'popup-up', trackNum: 8 }
  ];

  trackDefs.forEach(({ id, expectedDir, trackNum }) => {
    const trackStart = html.indexOf(`data-skill-track="${id}"`);
    assert(trackStart !== -1, `Track ${id} must exist in rendered HTML`);
    const nextTrack = html.indexOf('data-skill-track="', trackStart + 1);
    const trackBlock = nextTrack !== -1 ? html.slice(trackStart, nextTrack) : html.slice(trackStart);

    // If track has nodes, assert that each node has the expected direction class
    const nodeRegex = /class="ladder-node\s+([^"]+)"/g;
    let nodeMatch;
    let nodeCount = 0;
    while ((nodeMatch = nodeRegex.exec(trackBlock)) !== null) {
      nodeCount++;
      const classes = nodeMatch[1].split(/\s+/);
      assert(classes.includes(expectedDir), `Track ${trackNum} (${id}) node must have ${expectedDir} class`);
      assert(!classes.includes(expectedDir === 'popup-down' ? 'popup-up' : 'popup-down'), `Track ${trackNum} (${id}) node must NOT have conflicting direction class`);
    }
    assert(nodeCount > 0, `Track ${trackNum} (${id}) must contain at least 1 node for direction testing`);
  });
}

{
  // Test 3.2: Verify sorting invariance: tracks 0-3 always popup-down regardless of sort order
  const { WikiDB } = createWikiContext();
  const sortOrders = ['PROCS_DESC', 'COUNT_DESC'];

  for (const order of sortOrders) {
    WikiDB.setSkillLadderSortOrder(order);
    const html = WikiDB.renderSkillCoordinateLadder();

    // Find all track rows in rendered order
    const trackRowRegex = /<div class="ladder-track-row[^"]*" data-skill-track="([^"]+)">([\s\S]*?)(?=<div class="ladder-track-row|$)/g;
    let rowMatch;
    let renderedTrackIdx = 0;

    while ((rowMatch = trackRowRegex.exec(html)) !== null) {
      const trackId = rowMatch[1];
      const rowContent = rowMatch[2];
      const expectedDir = renderedTrackIdx < 4 ? 'popup-down' : 'popup-up';

      // Check node classes in this track
      const nodeRegex = /class="ladder-node\s+([^"]+)"/g;
      let nMatch;
      while ((nMatch = nodeRegex.exec(rowContent)) !== null) {
        const classes = nMatch[1].split(/\s+/);
        assert(classes.includes(expectedDir), `Sorted (${order}) rendered track #${renderedTrackIdx} (${trackId}) must have ${expectedDir}`);
      }
      renderedTrackIdx++;
    }
    assertEquals(renderedTrackIdx, 9, `Total rendered tracks under sort ${order} must be exactly 9`);
  }
}

// =============================================================================
// TEST SUITE 4: Tooltip Seconds Rounding & Helps Breakdown Precision
// =============================================================================
console.log('\n--- Test Suite 4: Tooltip Seconds Rounding & Precision ---');

{
  // Test 4.1: Mathematical precision of ideal interval seconds
  const edgeIntervals = [
    { sec: 1379.8, expectedMin: 23, expectedSec: '00', label: '1379.8s -> 23m00s (anti 22m60s)' },
    { sec: 1379.2, expectedMin: 22, expectedSec: '59', label: '1379.2s -> 22m59s' },
    { sec: 59.7, expectedMin: 1, expectedSec: '00', label: '59.7s -> 1m00s (anti 0m60s)' },
    { sec: 59.2, expectedMin: 0, expectedSec: '59', label: '59.2s -> 0m59s' },
    { sec: 0.4, expectedMin: 0, expectedSec: '00', label: '0.4s -> 0m00s' },
    { sec: 3599.9, expectedMin: 60, expectedSec: '00', label: '3599.9s -> 60m00s (anti 59m60s)' }
  ];

  for (const edge of edgeIntervals) {
    const rounded = Math.round(edge.sec);
    const m = Math.floor(rounded / 60);
    const s = String(rounded % 60).padStart(2, '0');
    assertEquals(m, edge.expectedMin, `${edge.label} minutes calculation`);
    assertEquals(s, edge.expectedSec, `${edge.label} seconds calculation`);
    assert(s !== '60', `${edge.label} seconds must NEVER equal 60`);
  }

  // Test 4.2: Tooltip formatting in rendered HTML
  const { WikiDB } = createWikiContext();
  WikiDB.toggleSkillLadderTop15(false);
  const html = WikiDB.renderSkillCoordinateLadder();

  // Assert NO tooltip contains '60秒' or '60s'
  assert(!html.includes('60秒'), 'Rendered skill ladder tooltips must NEVER contain 60秒');
  assert(!html.includes('60s'), 'Rendered skill ladder tooltips must NEVER contain 60s');

  // Verify presence of valid minute and second formatting
  assert(/滿活力間隔 \(0\.45x\)：<\/span>\s*<span class="breakdown-val">\d+分\d{2}秒<\/span>/.test(html), 'Tooltips must render interval as 分XX秒 with 2-digit zero-padded seconds');

  // Verify 12h helps breakdown row is rendered
  assert(html.includes('日間 12h 總幫忙次數：'), 'Tooltips must include Daytime 12h helps breakdown row');
  assert(/<span class="breakdown-val">\d+\.\d\s*次<\/span>/.test(html), 'Daytime 12h helps must be formatted to 1 decimal place');
}

// =============================================================================
// TEST SUITE 5: Track Header & User Rule Conformance Audit
// =============================================================================
console.log('\n--- Test Suite 5: User Rule Conformance & Layout Integrity ---');

{
  const { WikiDB } = createWikiContext();
  const html = WikiDB.renderSkillCoordinateLadder();

  // 5.1 Track Headers: Pure text tags (Zero SVG icons in headers)
  const trackHeaderRegex = /<div class="ladder-track-header[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let headerMatch;
  let headerCount = 0;

  while ((headerMatch = trackHeaderRegex.exec(html)) !== null) {
    headerCount++;
    const headerContent = headerMatch[1];
    assert(headerContent.includes('class="skill-track-name-tag"'), `Track header #${headerCount} must render skill-track-name-tag`);
    assert(!headerContent.includes('<svg'), `Track header #${headerCount} must NOT contain SVG icons`);
    assert(!headerContent.includes('<polygon'), `Track header #${headerCount} must NOT contain star/glyph polygons`);
  }
  assertEquals(headerCount, 9, 'All 9 track headers must be present and verified');

  // 5.2 Zero Emojis in rendered output
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert(!emojiRegex.test(html), 'Rendered skill ladder HTML must be strictly 100% free of Emojis');

  // 5.3 Zero Decorative Star Glyphs
  const starGlyphRegex = /[★☆]|\[★\]|\[☆\]/;
  assert(!starGlyphRegex.test(html), 'Rendered skill ladder HTML must be strictly 100% free of Decorative Star Glyphs');

  // 5.4 CSS Verification: styles.css & wiki_ladder.css
  const stylesCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'styles.css'), 'utf8');
  const wikiLadderCss = fs.readFileSync(path.join(WORKSPACE_ROOT, 'css', 'views', 'wiki', 'wiki_ladder.css'), 'utf8');

  // Check Single Frame Rule on #wiki-subpanel-skills_ladder
  assert(stylesCss.includes('#wiki-subpanel-skills_ladder'), 'styles.css must declare #wiki-subpanel-skills_ladder');
  assert(stylesCss.includes('border: none !important') || wikiLadderCss.includes('border: none !important'), 'Subpanel must enforce border: none !important for Single Frame Rule');

  // Check 38px Avatar Size in CSS
  assert(stylesCss.includes('width: 38px !important') || wikiLadderCss.includes('width: 38px !important'), 'Avatar wrapper must be styled with 38px width');
  assert(stylesCss.includes('height: 38px !important') || wikiLadderCss.includes('height: 38px !important'), 'Avatar wrapper must be styled with 38px height');

  // Check 140px / 96px Track Header & Spacer Synchronization
  assert(stylesCss.includes('width: 140px !important') || wikiLadderCss.includes('width: 140px !important'), 'Header and spacer must be synchronized to 140px on desktop');
  assert(stylesCss.includes('width: 96px !important') || wikiLadderCss.includes('width: 96px !important'), 'Header and spacer must be synchronized to 96px on mobile');
}

// =============================================================================
// SUMMARY & VERDICT
// =============================================================================
console.log('\n================================================================');
console.log(`  Challenger M2-1 Verification Result: ${passedChecks} / ${totalChecks} Passed (${failedChecks} Failed)`);
console.log('================================================================\n');

if (failedChecks > 0) {
  console.error('Failure Details:');
  failureDetails.forEach(f => console.error('  - ' + f));
  process.exit(1);
} else {
  console.log('All empirical challenger invariants satisfied without failure.');
  process.exit(0);
}
