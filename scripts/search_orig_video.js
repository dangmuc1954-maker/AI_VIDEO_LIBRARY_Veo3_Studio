const fs = require('fs');
const content = fs.readFileSync('scratch/shop_app_unpacked/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');

console.log('Size of VideoStudio-CbTMj2SN.js:', content.length);

const keywords = ['merge', 'edit', 'clip', 'timeline', 'transition', 'chuyển cảnh', 'biên tập', 'ghép', 'auto', 'automatic', 'concat', 'ffmpeg'];
for (const kw of keywords) {
  let count = 0;
  let idx = 0;
  while ((idx = content.toLowerCase().indexOf(kw, idx)) !== -1) {
    count++;
    idx += kw.length;
  }
  console.log(`Keyword "${kw}": found ${count} times`);
}
