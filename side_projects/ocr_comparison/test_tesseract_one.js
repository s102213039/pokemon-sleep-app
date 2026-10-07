const { createWorker } = require('tesseract.js');
const path = require('path');

async function testOne() {
  const samplePath = '/Users/yanli/Downloads/Telegram Lite/photo_100_2026-09-30_19-52-23.jpg';
  console.log('Testing Tesseract on:', samplePath);
  const start = Date.now();
  const worker = await createWorker('chi_tra+eng');
  const ret = await worker.recognize(samplePath);
  const elapsed = Date.now() - start;
  console.log(`Tesseract completed in ${elapsed} ms`);
  console.log('Text preview:');
  console.log(ret.data.text.slice(0, 300));
  await worker.terminate();
}

testOne().catch(console.error);
