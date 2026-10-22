const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idxEO = content.indexOf('function eo(');
console.log('eo:', content.slice(idxEO, idxEO + 200));
