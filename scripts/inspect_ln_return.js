const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

const qnIdx = code.indexOf('function Qn(');
const lastReturnIdx = code.lastIndexOf('return e.jsx(');
console.log('function Qn at:', qnIdx);
console.log('last return at:', lastReturnIdx);
console.log(code.substring(lastReturnIdx - 100, lastReturnIdx + 300));
