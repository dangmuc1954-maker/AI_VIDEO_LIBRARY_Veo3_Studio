const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

const pos = code.indexOf('attachSessionWithoutCoordination(');
console.log('attachSessionWithoutCoordination:');
console.log(code.slice(pos - 100, pos + 1200));
