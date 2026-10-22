const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

const pos = 879122;
console.log('Context of sF:');
console.log(code.slice(pos, pos + 800));
