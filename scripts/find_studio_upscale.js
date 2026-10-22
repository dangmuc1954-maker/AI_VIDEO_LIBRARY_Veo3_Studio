const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('upscale_video', pos)) !== -1) {
  console.log('upscale_video at', pos);
  console.log(content.slice(Math.max(0, pos - 50), pos + 150));
  pos += 13;
}
