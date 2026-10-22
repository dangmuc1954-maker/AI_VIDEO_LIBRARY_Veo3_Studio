const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('google-flow', pos)) !== -1) {
  console.log('--- google-flow in main at pos', pos, '---');
  console.log(content.substring(Math.max(0, pos - 30), Math.min(content.length, pos + 200)));
  pos += 11;
}
