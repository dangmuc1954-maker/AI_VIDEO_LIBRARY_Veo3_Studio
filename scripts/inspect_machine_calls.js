const fs = require('fs');
const lines = fs.readFileSync('license_server/server.js', 'utf8').split('\n');

console.log('--- Line 180 to 200 ---');
console.log(lines.slice(175, 205).join('\n'));

console.log('--- Line 535 to 555 ---');
console.log(lines.slice(530, 560).join('\n'));

console.log('--- Line 640 to 660 ---');
console.log(lines.slice(635, 665).join('\n'));
