const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('async runVideoJob(');
console.log('=== async runVideoJob ===');
console.log(c.substring(idx, idx + 2500));
