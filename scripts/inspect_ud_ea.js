const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idxUD = content.indexOf('function ud(');
const idxEA = content.indexOf('function ea(');
console.log('ud:', content.slice(idxUD, idxUD + 200));
console.log('ea:', content.slice(idxEA, idxEA + 200));
