const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('async function Zr(');
console.log(content.slice(idx - 100, idx + 2500));
