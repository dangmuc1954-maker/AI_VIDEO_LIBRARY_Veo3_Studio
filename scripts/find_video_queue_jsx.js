const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('videoStudio.videoQueue');
console.log('videoStudio.videoQueue at', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 400, idx + 800));
}
