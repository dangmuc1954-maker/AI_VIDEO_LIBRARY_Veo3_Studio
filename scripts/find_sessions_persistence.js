const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = 48914;
console.log(c.slice(Math.max(0, p - 600), p + 600));
