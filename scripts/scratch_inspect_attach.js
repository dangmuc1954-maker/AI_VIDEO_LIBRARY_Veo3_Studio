const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = code.indexOf('browser:attachSession');
console.log('browser:attachSession:');
console.log(code.slice(pos - 100, pos + 800));
