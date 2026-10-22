const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('function Oo(');
console.log('Oo:', content.slice(idx, idx + 200));
