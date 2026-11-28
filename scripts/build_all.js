/**
 * build_all.js — Master Project Asset & Code Bundler
 * ==================================================
 * Compiles all modular CSS and JavaScript components:
 * 1. CSS: 18 granular modules -> css/styles.css
 * 2. Wiki: 6 modules -> js/modules/wiki.js
 * 3. Lab: 4 modules -> js/modules/appraisal.js
 * 4. Box: 5 modules -> js/modules/box.js
 * 5. Pokedex: 4 modules -> js/modules/app.js
 * 
 * Total build time < 25ms. Zero external dependencies.
 */

const fs = require('fs');
const path = require('path');
const { buildCss } = require('./build_css');
const { buildIngredientLadder } = require('./build_ingredient_ladder');
const { buildWiki } = require('./build_wiki');
const { buildAppraisal } = require('./build_appraisal');
const { buildBox } = require('./build_box');
const { buildApp } = require('./build_app');
const { buildI18n } = require('./build_i18n');
const { buildCloudSync } = require('./build_cloudSync');
const { buildRecipes } = require('./build_recipes');
const { buildNews } = require('./build_news');

function buildItemsData() {
  const rootDir = path.resolve(__dirname, '..');
  const itemsJsonPath = path.join(rootDir, 'data', 'items.json');
  const itemsJsPath = path.join(rootDir, 'js', 'data', 'items.js');
  const items = JSON.parse(fs.readFileSync(itemsJsonPath, 'utf8'));
  const lines = [
    '/**',
    ' * js/data/items.js - Pokémon Sleep Items Master Data',
    ` * Master dataset containing ${items.length} essential items across 4 categories (evolution, training, biscuit, supply).`,
    ' * Auto-generated from data/items.json via scripts/build_all.js.',
    ' */',
    '(function () {',
    "  'use strict';",
    '',
    '  const ITEMS_DATA = ['
  ];
  for (let i = 0; i < items.length; i++) {
    lines.push('  ' + JSON.stringify(items[i]) + (i < items.length - 1 ? ',' : ''));
  }
  lines.push(
    '];',
    '',
    "  if (typeof window !== 'undefined') {",
    '    window.ITEMS_DATA = ITEMS_DATA;',
    '  }',
    "  if (typeof module !== 'undefined' && module.exports) {",
    '    module.exports = ITEMS_DATA;',
    '  }',
    '})();',
    ''
  );
  const nextContent = lines.join('\n');
  const prevContent = fs.existsSync(itemsJsPath) ? fs.readFileSync(itemsJsPath, 'utf8') : '';
  if (prevContent !== nextContent) {
    fs.writeFileSync(itemsJsPath, nextContent, 'utf8');
  }
  return {
    itemsCount: items.length,
    totalBytes: Buffer.byteLength(nextContent, 'utf8'),
    totalLines: lines.length,
    updated: prevContent !== nextContent
  };
}

function buildAll() {
  const startTime = Date.now();
  const itemsRes = buildItemsData();
  const ladderRes = buildIngredientLadder();
  const cssRes = buildCss();
  const wikiRes = buildWiki();
  const appraisalRes = buildAppraisal();
  const boxRes = buildBox();
  const appRes = buildApp();
  const i18nRes = buildI18n();
  const cloudSyncRes = buildCloudSync();
  const recipesRes = buildRecipes();
  const newsRes = buildNews();
  const elapsed = Date.now() - startTime;

  return {
    items: itemsRes,
    ladder: ladderRes,
    css: cssRes,
    wiki: wikiRes,
    appraisal: appraisalRes,
    box: boxRes,
    app: appRes,
    i18n: i18nRes,
    cloudSync: cloudSyncRes,
    recipes: recipesRes,
    news: newsRes,
    elapsed
  };
}

if (require.main === module) {
  const res = buildAll();
  console.log(`[build_all] Successfully built all assets in ${res.elapsed}ms:`);
  console.log(`  - Items: ${res.items.itemsCount} items -> js/data/items.js (${(res.items.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - CSS: ${res.css.modulesCount} modules -> css/styles.css (${(res.css.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - I18N: ${res.i18n.modulesCount} modules -> js/core/i18n.js (${(res.i18n.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - CloudSync: ${res.cloudSync.modulesCount} modules -> js/core/cloudSync.js (${(res.cloudSync.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - Recipes: ${res.recipes.modulesCount} modules -> js/modules/recipes.js (${(res.recipes.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - News: ${res.news.modulesCount} modules -> js/modules/news.js (${(res.news.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - Wiki: ${res.wiki.modulesCount} modules -> js/modules/wiki.js (${(res.wiki.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - Lab: ${res.appraisal.modulesCount} modules -> js/modules/appraisal.js (${(res.appraisal.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - Box: ${res.box.modulesCount} modules -> js/modules/box.js (${(res.box.totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`  - App: ${res.app.modulesCount} modules -> js/modules/app.js (${(res.app.totalBytes / 1024).toFixed(1)} KB)`);
}

module.exports = { buildAll, buildItemsData };
