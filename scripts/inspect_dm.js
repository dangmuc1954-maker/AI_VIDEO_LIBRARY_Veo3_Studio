const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('dm=class{');
console.log('dm class idx:', idx);
console.log(content.slice(idx, idx + 500));
