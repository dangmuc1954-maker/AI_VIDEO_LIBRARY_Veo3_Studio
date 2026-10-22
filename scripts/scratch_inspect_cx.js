const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

let pos = code.indexOf('class cx');
if (pos === -1) pos = code.indexOf('cx=class');
if (pos === -1) pos = code.indexOf('function cx');
console.log('Definition of cx:');
console.log(code.slice(Math.max(0, pos - 50), Math.min(code.length, pos + 800)));
