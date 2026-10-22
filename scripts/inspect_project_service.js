const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const idx = c.indexOf('class pu{'); // or projectService
const pIdx = c.indexOf('ensureProject(');
console.log('=== ensureProject ===');
console.log(c.substring(pIdx - 100, pIdx + 1200));
