const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

const idx = orig.indexOf('async fetchAccessToken(e,t){');
console.log('--- fetchAccessToken in original AIForge Studio ---');
console.log(orig.slice(idx, idx + 1800));
