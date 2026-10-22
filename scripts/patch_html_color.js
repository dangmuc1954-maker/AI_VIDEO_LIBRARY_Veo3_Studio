const fs = require('fs');
const p = 'd:/dự án antigravity/Xieng_Nuong_Be_Huyen/public/index.html';
let h = fs.readFileSync(p, 'utf-8');
h = h.replace('content="#121316"', 'content="#FAF7F0"');
fs.writeFileSync(p, h, 'utf-8');
console.log('Updated index.html theme-color successfully!');
