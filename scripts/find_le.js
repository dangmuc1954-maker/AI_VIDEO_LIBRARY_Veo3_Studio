const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.lastIndexOf('Le=', 100922);
console.log('--- Le definition before 100922: ' + idx + ' ---');
if (idx !== -1) console.log(content.slice(idx - 20, idx + 80));

const idx2 = content.indexOf('Le.patchAccount');
console.log('--- Le.patchAccount at: ' + idx2 + ' ---');
console.log(content.slice(Math.max(0, idx2 - 50), Math.min(content.length, idx2 + 150)));
