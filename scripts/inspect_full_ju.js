const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = content.indexOf('function Ju(');
console.log(content.slice(pos, pos + 2500));
