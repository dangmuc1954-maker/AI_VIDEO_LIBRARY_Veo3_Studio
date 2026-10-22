const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const idx = content.indexOf('children:"Video Queue"');
console.log('Video Queue at:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 200, idx + 1200));
}
