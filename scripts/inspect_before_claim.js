const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('ClaimJob');
console.log(c.substring(idx - 600, idx + 200));
