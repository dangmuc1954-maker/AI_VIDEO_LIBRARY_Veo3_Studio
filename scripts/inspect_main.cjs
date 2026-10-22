const fs = require('fs');
const txt = fs.readFileSync('app/out/main/index.js', 'utf8');
console.log(txt.slice(2100, 2400));
