const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('First 500 chars of main/index.js:');
console.log(content.slice(0, 500));
