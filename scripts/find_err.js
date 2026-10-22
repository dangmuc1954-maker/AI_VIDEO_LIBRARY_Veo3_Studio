const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find all indices of 'catch'
const indices = [];
let idx = 0;
while ((idx = code.indexOf('catch', idx)) !== -1) {
  indices.push(idx);
  idx += 5;
}
console.log('Total catch keywords:', indices.length);

// Binary search or check around our modifications (740000 - 760000)
for (const pos of indices) {
  if (pos >= 745000 && pos <= 760000) {
    console.log('Catch at', pos, ':', code.substring(pos - 30, pos + 40));
  }
}
