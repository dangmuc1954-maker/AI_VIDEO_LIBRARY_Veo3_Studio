const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idxJB = content.indexOf('function JB(');
const idxSB = content.indexOf('function $B(');
console.log('JB:', content.slice(idxJB, idxJB + 250));
console.log('$B:', content.slice(idxSB, idxSB + 250));
