const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const zuStart = content.indexOf('function zu(r){');
const zuEnd = content.indexOf('function Lu(', zuStart);
console.log('zu boundaries:', zuStart, zuEnd);

const nlStart = content.indexOf('function nl(r){');
const nlEnd = content.indexOf('function tl(', nlStart);
console.log('nl boundaries:', nlStart, nlEnd);
