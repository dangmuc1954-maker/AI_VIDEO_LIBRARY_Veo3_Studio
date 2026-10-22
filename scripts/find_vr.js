const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const regex = /\bVr\b/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(m.index, content.slice(Math.max(0, m.index - 60), Math.min(content.length, m.index + 60)));
}
