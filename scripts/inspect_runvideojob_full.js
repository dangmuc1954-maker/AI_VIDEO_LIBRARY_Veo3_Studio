const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const p = 234255 + 2000;
console.log('runVideoJob rest at', p);
console.log(content.substring(p, p + 2500));
