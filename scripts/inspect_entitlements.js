const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('--- 794000 ---');
console.log(content.slice(794000, 794500));
console.log('--- 796400 ---');
console.log(content.slice(796400, 796900));
console.log('--- 797600 ---');
console.log(content.slice(797600, 798000));
