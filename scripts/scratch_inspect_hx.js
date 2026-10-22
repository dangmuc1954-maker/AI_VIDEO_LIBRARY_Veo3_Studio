const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

let pos = code.indexOf('class hx');
if (pos === -1) pos = code.indexOf('hx=class');
if (pos === -1) pos = code.indexOf('function hx');
console.log('Definition of hx:');
console.log(code.slice(Math.max(0, pos - 50), Math.min(code.length, pos + 800)));
