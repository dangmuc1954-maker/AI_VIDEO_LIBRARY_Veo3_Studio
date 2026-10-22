const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = content.indexOf('tracker.updateProgress(97, "Đang lưu video vào Thư viện...");');
console.log(content.slice(idx, idx + 800));
