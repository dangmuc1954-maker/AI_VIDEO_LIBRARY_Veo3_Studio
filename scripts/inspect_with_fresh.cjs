const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

console.log('--- 760300 to 761000 ---');
console.log(content.substring(760300, 761000));
console.log('\n--- 766400 to 767000 ---');
console.log(content.substring(766400, 767000));
