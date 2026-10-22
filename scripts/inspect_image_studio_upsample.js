const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('upsampleResolution', pos)) !== -1) {
  console.log('pos', pos, ':', content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 250)));
  pos += 18;
}
