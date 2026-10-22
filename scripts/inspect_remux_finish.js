const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const ttsStart = content.indexOf('Đang đồng bộ khẩu hình & ghép giọng đọc');
console.log(content.substring(ttsStart - 50, ttsStart + 3500));
