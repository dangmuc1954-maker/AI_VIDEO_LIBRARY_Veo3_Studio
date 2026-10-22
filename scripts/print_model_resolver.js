const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('function ku(');
console.log(content.slice(idx - 1500, idx + 2500));
