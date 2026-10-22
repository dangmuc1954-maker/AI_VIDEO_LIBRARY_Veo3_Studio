const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

const term = '.ix=function';
let pos = code.indexOf(term);
if (pos === -1) pos = code.indexOf('_.ix=');
console.log('Definition of _.ix:');
console.log(code.slice(Math.max(0, pos - 100), Math.min(code.length, pos + 500)));
