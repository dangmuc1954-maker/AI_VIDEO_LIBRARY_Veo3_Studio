const fs = require('fs');
const mainPath = 'app/out/main/index.js';
let content = fs.readFileSync(mainPath, 'utf8');

// Xóa các dòng require thừa
content = content.replace(/const nodeFs = require\("node:fs"\);\s*/g, '');
content = content.replace(/const nodePath = require\("node:path"\);\s*/g, '');
content = content.replace(/const nodeCp = require\("node:child_process"\);\s*/g, '');
content = content.replace(/const nodeCrypto = require\("node:crypto"\);\s*/g, '');

fs.writeFileSync(mainPath, content, 'utf8');
console.log('✓ Đã dọn dẹp các dòng require thừa, dùng trực tiếp top-level imports!');
