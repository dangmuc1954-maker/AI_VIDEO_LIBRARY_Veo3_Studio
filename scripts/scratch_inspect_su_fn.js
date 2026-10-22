const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = code.indexOf('function su(');
console.log('function su:');
console.log(code.slice(pos - 100, pos + 800));

const pos2 = code.indexOf('function fn(');
console.log('function fn:');
console.log(code.slice(pos2 - 100, pos2 + 800));
