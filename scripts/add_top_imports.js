const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
let content = fs.readFileSync(mainPath, 'utf8');

// Thêm các imports chuẩn ở đầu file nếu chưa có
const topImports = `import nodeFs from "node:fs";\nimport nodePath from "node:path";\nimport nodeCp from "node:child_process";\nimport nodeCrypto from "node:crypto";\n`;

if (!content.startsWith('import nodeFs from "node:fs";')) {
  content = topImports + content;
  fs.writeFileSync(mainPath, content, 'utf8');
  console.log('✓ Đã thêm top imports nodeFs, nodePath, nodeCp, nodeCrypto vào đầu app/out/main/index.js!');
} else {
  console.log('[-] Top imports đã có sẵn');
}
