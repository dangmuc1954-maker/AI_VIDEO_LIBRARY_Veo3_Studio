const fs = require('fs');
const content = fs.readFileSync('app/out/preload/index.cjs', 'utf8');

const idx = content.indexOf('assets:');
console.log(content.substring(idx, idx + 800));
