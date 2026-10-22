const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('"browser:attachSession"');
console.log('--- attachSession at ' + idx + ' ---');
console.log(content.slice(idx, idx + 800));
