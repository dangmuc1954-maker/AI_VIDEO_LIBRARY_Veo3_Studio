const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('detectPageState');
console.log('--- detectPageState at ' + idx + ' ---');
console.log(content.slice(idx, idx + 800));
