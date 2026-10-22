const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const bannerIdx = code.indexOf('Lồng Tiếng ElevenLabs');
console.log('Banner at:', bannerIdx);
if (bannerIdx !== -1) {
  console.log(code.slice(bannerIdx - 150, bannerIdx + 1200));
}
