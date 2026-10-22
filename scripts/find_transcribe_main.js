const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('transcrib', pos)) !== -1) {
  console.log('transcrib at pos', pos, ':', content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 250)));
  pos += 9;
}
