const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('async ensureProjectPool(');
console.log(content.slice(idx, idx + 1500));
