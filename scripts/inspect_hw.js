const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('class Hw');
console.log('class Hw pos:', idx);
console.log(content.slice(idx, idx + 2000));
