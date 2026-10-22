const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm tất cả nơi khai báo Id và oo
function checkVar(name) {
  const defRegex = new RegExp(`(?:const|let|var|import)\\s+${name}\\b|function\\s+${name}\\b`, 'g');
  let m;
  console.log(`=== Definitions of ${name} ===`);
  while ((m = defRegex.exec(content)) !== null) {
    console.log(m.index, content.slice(m.index, m.index + 100));
  }
}

checkVar('Id');
checkVar('oo');

// Kiểm tra xem ở 264093 (hàm ni), các icon khác dùng cái gì
console.log('=== Surrounding of ni (264093) ===');
console.log(content.slice(264093, 267000));
