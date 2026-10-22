const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.lastIndexOf('function ja(', 539462);
console.log('--- ja definition at ' + idx + ' ---');
console.log(content.slice(idx, idx + 400));
