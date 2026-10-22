const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('runVideoJob(');
console.log('=== runVideoJob ===');
console.log(c.substring(idx, idx + 1500));
