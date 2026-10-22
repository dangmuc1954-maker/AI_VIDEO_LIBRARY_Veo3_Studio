const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find where dA and oA are defined
const idx = 43804;
console.log('Context around listProviders:');
console.log(content.slice(Math.max(0, idx - 1000), Math.min(content.length, idx + 500)));
