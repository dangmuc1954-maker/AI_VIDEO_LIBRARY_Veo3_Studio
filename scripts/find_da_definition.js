const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find where dA and oA are defined
const matches = [];
let idx = 0;
while ((idx = content.indexOf('dA=', idx)) !== -1) {
  console.log('dA= at', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
  console.log('----------------------------------------------------');
  idx += 3;
}

idx = 0;
while ((idx = content.indexOf('oA=', idx)) !== -1) {
  console.log('oA= at', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
  console.log('----------------------------------------------------');
  idx += 3;
}
