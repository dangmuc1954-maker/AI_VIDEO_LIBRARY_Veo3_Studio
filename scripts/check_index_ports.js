const fs = require('fs');
const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

let p = 0;
while ((p = index.indexOf('video-script-extract', p)) !== -1) {
  console.log('video-script-extract in index at', p);
  console.log(index.slice(Math.max(0, p - 60), p + 120));
  p += 1;
}
