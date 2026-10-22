const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('cacheGeneratedVideo', pos)) !== -1) {
  console.log('--- cacheGeneratedVideo at pos', pos, '---');
  console.log(content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 300)));
  pos += 19;
}

pos = 0;
while ((pos = content.indexOf('type:"video"', pos)) !== -1) {
  console.log('--- type:"video" at pos', pos, '---');
  console.log(content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 300)));
  pos += 12;
}
