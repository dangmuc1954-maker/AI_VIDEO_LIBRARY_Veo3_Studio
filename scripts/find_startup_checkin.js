const fs = require('fs');
const path = require('path');

const origJs = fs.readFileSync(path.join(__dirname, '../extracted_original/out/main/index.js'), 'utf8');

const idx = origJs.indexOf('entitlementToken&&W.checkIn()');
console.log('Context of startup checkIn:');
console.log(origJs.slice(idx - 100, idx + 300));
