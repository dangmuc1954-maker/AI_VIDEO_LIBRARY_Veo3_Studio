const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../extracted_original/out/main/index.js'), 'utf8');

let pos = 0;
while ((pos = mainJs.indexOf('userData', pos)) !== -1) {
  console.log('Pos', pos, ':', mainJs.slice(pos - 50, pos + 150));
  pos += 8;
}
