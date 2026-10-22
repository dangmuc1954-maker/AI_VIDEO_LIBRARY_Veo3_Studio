const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('autoUpscale', pos)) !== -1) {
  console.log(`pos ${pos}:`);
  console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 250)));
  console.log('---');
  pos += 11;
}
