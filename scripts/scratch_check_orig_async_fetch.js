const fs = require('fs');
const origFile = 'extracted_aiforge_studio_new/out/main/index.js';
const code = fs.readFileSync(origFile, 'utf8');
const pos = code.indexOf('async fetchAccessToken(');
console.log('Original async fetchAccessToken:');
console.log(code.slice(pos, pos + 1500));
