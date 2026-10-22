const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 227000;
while ((pos = content.indexOf('https://', pos)) !== -1 && pos < 248000) {
  console.log('URL at pos', pos, ':', content.substring(pos, pos + 100).split(/["'`]/)[0]);
  pos += 10;
}
