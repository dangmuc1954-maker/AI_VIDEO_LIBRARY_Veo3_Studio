const fs = require('fs');
const main = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

const idx = main.indexOf('function lg(');
console.log('=== lg function ===');
console.log(main.slice(idx, idx + 600));
