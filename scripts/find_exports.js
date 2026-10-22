const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

// Tìm export bv và export aI ở cuối file index-BS7vgKVV.js
const endChunk = content.slice(content.length - 8000);
console.log('Searching for bv and aI in exports of index-BS7vgKVV.js:');

const regexBv = /([a-zA-Z0-9_$]+)\s+as\s+bv\b/;
const regexAi = /([a-zA-Z0-9_$]+)\s+as\s+aI\b/;
console.log('bv export:', endChunk.match(regexBv));
console.log('aI export:', endChunk.match(regexAi));
