const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const p = content.indexOf('class Ku{');
console.log(content.substring(p, p + 1200));
