const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');

const p = content.indexOf('// Tìm session thích hợp theo engine đã chọn');
console.log('Main Factory renderAllVideos:');
console.log(content.substring(p, p + 3500));
