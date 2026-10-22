const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

const idx = orig.indexOf('detectPageState:async({webContents:e,url:t})');
console.log('--- detectPageState in original AIForge Studio ---');
console.log(orig.slice(idx, idx + 2500));
