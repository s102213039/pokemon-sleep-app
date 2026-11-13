/**
 * sync_game_config.js — Single Source of Truth Sync Tool
 * ======================================================
 * Reads canonical caps from js/core/gameConfig.js and synchronizes:
 *   1. Static HTML slider bounds, steps, and max labels in index.html & app/index.html
 *   2. Embedded fallback config blocks (tagged with @GAME_CONFIG_FALLBACK_START / END)
 *      in modular JS source files so standalone Node VM unit tests without gameConfig.js
 *      always remain 100% consistent with js/core/gameConfig.js.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const GAME_CONFIG = require(path.join(ROOT_DIR, 'js', 'core', 'gameConfig.js'));

function walkJsFiles(dir) {
  let out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(walkJsFiles(full));
    } else if (entry.name.endsWith('.js') && !entry.name.endsWith('.min.js')) {
      out.push(full);
    }
  }
  return out;
}

function syncHtmlFile(relPath, caps) {
  const absPath = path.join(ROOT_DIR, relPath);
  if (!fs.existsSync(absPath)) return false;

  const orig = fs.readFileSync(absPath, 'utf8');
  let next = orig;

  // Recipe level slider & max label
  next = next.replace(
    /(<input\b[^>]*id="recipe-level-slider"[^>]*\bmax=")\d+(")/g,
    `$1${caps.RECIPE_LEVEL_CAP}$2`
  );
  next = next.replace(
    /(<span\b[^>]*id="recipe-level-max-label"[^>]*>)Lv\.\d+(<\/span>)/g,
    `$1Lv.${caps.RECIPE_LEVEL_CAP}$2`
  );

  // Island bonus slider & max label
  next = next.replace(
    /(<input\b[^>]*id="island-bonus-slider"[^>]*\bmax=")\d+(")/g,
    `$1${caps.ISLAND_BONUS_CAP}$2`
  );
  next = next.replace(
    /(<input\b[^>]*id="island-bonus-slider"[^>]*\bstep=")\d+(")/g,
    `$1${caps.ISLAND_BONUS_STEP}$2`
  );
  next = next.replace(
    /(<span\b[^>]*id="island-bonus-max-label"[^>]*>)\d+%(<\/span>)/g,
    `$1${caps.ISLAND_BONUS_CAP}%$2`
  );

  // Box Pokemon level modal input bounds
  next = next.replace(
    /(<input\b[^>]*id="modal-poke-level"[^>]*\bmax=")\d+(")/g,
    `$1${caps.THEORETICAL_MAX_LEVEL}$2`
  );
  next = next.replace(
    /(<input\b[^>]*id="modal-poke-level"[^>]*\bplaceholder=")1~\d+(")/g,
    `$11~${caps.THEORETICAL_MAX_LEVEL}$2`
  );

  if (next !== orig) {
    fs.writeFileSync(absPath, next, 'utf8');
    return true;
  }
  return false;
}

function buildFallbackPayload(caps, maxRecipeBonusPct) {
  return JSON.stringify({
    POKEMON_LEVEL_CAP: caps.POKEMON_LEVEL_CAP,
    RECIPE_LEVEL_CAP: caps.RECIPE_LEVEL_CAP,
    THEORETICAL_MAX_LEVEL: caps.THEORETICAL_MAX_LEVEL,
    ISLAND_BONUS_CAP: caps.ISLAND_BONUS_CAP,
    ISLAND_BONUS_STEP: caps.ISLAND_BONUS_STEP,
    RECIPE_MAX_BONUS_PCT: maxRecipeBonusPct,
    SUBSKILL_UNLOCK_LEVELS: caps.SUBSKILL_UNLOCK_LEVELS
  });
}

function syncFallbackMarkers(caps, maxRecipeBonusPct) {
  const dirs = [
    path.join(ROOT_DIR, 'js', 'core', 'i18n'),
    path.join(ROOT_DIR, 'js', 'modules', 'box'),
    path.join(ROOT_DIR, 'js', 'modules', 'lab'),
    path.join(ROOT_DIR, 'js', 'modules', 'pokedex'),
    path.join(ROOT_DIR, 'js', 'modules', 'recipes'),
    path.join(ROOT_DIR, 'js', 'modules', 'wiki')
  ];
  const payload = buildFallbackPayload(caps, maxRecipeBonusPct);
  const blockRe = /(\/\*\s*@GAME_CONFIG_FALLBACK_START\s*\*\/)[\s\S]*?(\/\*\s*@GAME_CONFIG_FALLBACK_END\s*\*\/)/g;

  let updatedFiles = 0;
  for (const dir of dirs) {
    for (const filePath of walkJsFiles(dir)) {
      const orig = fs.readFileSync(filePath, 'utf8');
      if (!orig.includes('@GAME_CONFIG_FALLBACK_START')) continue;
      const next = orig.replace(blockRe, `$1 ${payload} $2`);
      if (next !== orig) {
        fs.writeFileSync(filePath, next, 'utf8');
        updatedFiles++;
      }
    }
  }
  return updatedFiles;
}

function syncGameConfig() {
  const caps = GAME_CONFIG.getCaps();
  const maxRecipeBonusPct = GAME_CONFIG.getRecipeMaxBonusPct();
  const htmlChanged = [];
  if (syncHtmlFile('index.html', caps)) htmlChanged.push('index.html');
  if (syncHtmlFile(path.join('app', 'index.html'), caps)) htmlChanged.push('app/index.html');
  const fallbackUpdatedCount = syncFallbackMarkers(caps, maxRecipeBonusPct);

  return {
    caps,
    maxRecipeBonusPct,
    htmlChanged,
    fallbackUpdatedCount
  };
}

if (require.main === module) {
  const res = syncGameConfig();
  console.log(
    `[sync_game_config] Caps synced (Pokemon Lv.${res.caps.POKEMON_LEVEL_CAP}, Recipe Lv.${res.caps.RECIPE_LEVEL_CAP} +${res.maxRecipeBonusPct}%, Island ${res.caps.ISLAND_BONUS_CAP}% step ${res.caps.ISLAND_BONUS_STEP}%, Max Lv.${res.caps.THEORETICAL_MAX_LEVEL}). HTML updated: [${res.htmlChanged.join(', ')}], fallback blocks updated: ${res.fallbackUpdatedCount}`
  );
}

module.exports = { syncGameConfig };
