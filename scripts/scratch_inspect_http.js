const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = 202240;
console.log(code.slice(pos - 600, pos + 400));
