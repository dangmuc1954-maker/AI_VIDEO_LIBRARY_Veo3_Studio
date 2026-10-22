const fs = require('fs');
const path = require('path');
const file = path.resolve('app/out/main/index.js');
const code = fs.readFileSync(file, 'utf8');

let pos = 0;
while ((pos = code.indexOf('su(', pos)) !== -1) {
  console.log(`su call at ${pos}:`);
  console.log(code.slice(pos - 100, pos + 300));
  pos += 3;
}
