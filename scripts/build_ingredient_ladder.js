/**
 * build_ingredient_ladder.js — Node.js Lv.60 Ingredient Ladder Generator
 * =====================================================================
 * Executes the exact frontend js/modules/wiki/wiki_ladder_builder.js engine
 * against data/data.json to idempotently synchronize:
 *   - data/ladder_lv60.json
 *   - js/data/ladder_data.js
 *
 * Zero external dependencies. Used by scripts/build_all.js.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_JSON_PATH = path.join(ROOT_DIR, 'data', 'data.json');
const BUILDER_JS_PATH = path.join(ROOT_DIR, 'js', 'modules', 'wiki', 'wiki_ladder_builder.js');
const LADDER_JSON_PATH = path.join(ROOT_DIR, 'data', 'ladder_lv60.json');
const LADDER_JS_PATH = path.join(ROOT_DIR, 'js', 'data', 'ladder_data.js');

function loadBuilderFn() {
  const code = fs.readFileSync(BUILDER_JS_PATH, 'utf8');
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(code + '\nthis.__buildDynamicIngredientLadder = buildDynamicIngredientLadder;', sandbox);
  return sandbox.__buildDynamicIngredientLadder;
}

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') === content) {
    return false;
  }
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function buildIngredientLadder() {
  const raw = JSON.parse(fs.readFileSync(DATA_JSON_PATH, 'utf8'));
  const pokemonList = Array.isArray(raw) ? raw : (raw.pokemon || []);
  const buildFn = loadBuilderFn();
  const tracks = buildFn(pokemonList, { finalOnly: true, minFinalSafetyFloor: 2 });

  const jsonStr = JSON.stringify(tracks, null, 2);
  const jsonChanged = writeIfChanged(LADDER_JSON_PATH, jsonStr + '\n');

  const jsContent =
    '/**\n' +
    ' * js/data/ladder_data.js - Pokémon Sleep Lv.60 Ingredient Ladder Master Data\n' +
    ' * Auto-generated from data/data.json (Lv.60 Ideal Energy 0.45x unified baseline).\n' +
    ' */\n\n' +
    '(function (global) {\n' +
    "  'use strict';\n\n" +
    '  const LV60_COORDINATE_LADDER_DATA = ' + jsonStr + ';\n' +
    '  // 舊版清單資料\n\n' +
    "  if (typeof module !== 'undefined' && module.exports) {\n" +
    '    module.exports = LV60_COORDINATE_LADDER_DATA;\n' +
    '  }\n' +
    "  if (typeof global !== 'undefined') {\n" +
    '    global.LV60_COORDINATE_LADDER_DATA = LV60_COORDINATE_LADDER_DATA;\n' +
    '  }\n' +
    "})(typeof window !== 'undefined' ? window : this);\n";

  const jsChanged = writeIfChanged(LADDER_JS_PATH, jsContent);
  const totalEntries = tracks.reduce((sum, t) => sum + t.pokemon.length, 0);

  return {
    tracksCount: tracks.length,
    entriesCount: totalEntries,
    jsonChanged,
    jsChanged
  };
}

if (require.main === module) {
  const start = Date.now();
  const res = buildIngredientLadder();
  console.log(
    `[build_ingredient_ladder] Built ${res.tracksCount} tracks (${res.entriesCount} entries) ` +
    `in ${Date.now() - start}ms (json=${res.jsonChanged}, js=${res.jsChanged})`
  );
}

module.exports = { buildIngredientLadder, loadBuilderFn };
