const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('ss(', pos)) !== -1) {
  console.log(`ss( at ${pos}:`);
  console.log(content.slice(Math.max(0, pos - 50), pos + 100));
  pos += 3;
}
