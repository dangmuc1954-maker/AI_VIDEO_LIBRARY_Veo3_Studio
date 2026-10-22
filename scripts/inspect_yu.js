const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.lastIndexOf('class yu', 531124);
console.log('--- class yu at ' + idx + ' ---');
console.log(content.slice(idx, idx + 600));
