const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('runVideoJob(');
console.log(c.substring(idx + 1000, idx + 3500));
