const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const pos = content.indexOf('setPath("userData",_ud)');
console.log('Snippet around setPath userData:');
console.log(content.slice(Math.max(0, pos - 200), Math.min(content.length, pos + 200)));
