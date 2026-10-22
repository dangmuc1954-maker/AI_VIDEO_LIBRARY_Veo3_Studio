const fs = require('fs');
const path = require('path');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find where oP is defined
const oPIdx = mainCode.indexOf('function oP(r,e){');
console.log('oP definition:');
console.log(mainCode.slice(oPIdx, oPIdx + 600));

// Find where Hn is defined
const hnIdx = mainCode.indexOf('function Hn(r,e,t){');
console.log('Hn definition:');
console.log(mainCode.slice(hnIdx, hnIdx + 600));
