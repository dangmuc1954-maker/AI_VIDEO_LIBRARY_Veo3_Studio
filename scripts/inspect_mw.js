const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class Mw');
console.log('class Mw pos:', idx);
console.log(content.slice(idx, idx + 1500));
