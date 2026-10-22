const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('"elevenlabs"', pos)) !== -1) {
  console.log('--- "elevenlabs" at pos', pos, '---');
  console.log(content.substring(Math.max(0, pos - 100), Math.min(content.length, pos + 300)));
  pos += 12;
}
