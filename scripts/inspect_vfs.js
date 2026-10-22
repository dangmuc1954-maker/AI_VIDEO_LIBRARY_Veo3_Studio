const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');

console.log('=== REGION 1: Main factory select element ===');
let p = 0;
while ((p = content.indexOf('vAccs.map(acc =>', p)) !== -1) {
  console.log('Found vAccs.map at:', p);
  console.log(content.substring(p - 200, p + 300));
  p += 15;
}

console.log('=== REGION 2: generateSingleVideo in Main Factory ===');
let p2 = content.indexOf('const isMuse = videoEngine ===');
console.log('p2:', p2);
if (p2 !== -1) console.log(content.substring(p2 - 50, p2 + 600));

console.log('=== REGION 3: renderAllVideos in Main Factory ===');
let p3 = content.indexOf('// Tìm session thích hợp theo engine đã chọn');
console.log('p3:', p3);
if (p3 !== -1) console.log(content.substring(p3 - 50, p3 + 600));
