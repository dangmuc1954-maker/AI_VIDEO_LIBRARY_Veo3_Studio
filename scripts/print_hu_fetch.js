const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('validateCachedAccessToken');
console.log(c.substring(idx + 100, idx + 1500));
