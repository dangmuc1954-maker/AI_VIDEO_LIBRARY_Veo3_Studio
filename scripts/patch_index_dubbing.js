const fs = require('fs');
const path = require('path');

console.log('=== ĐỒNG BỘ INDEX-BS7VGKVV.JS CHO VIDEO-DUBBING ===');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app')
];

for (const root of targetRoots) {
  if (!fs.existsSync(root)) continue;
  const p = path.join(root, 'out/renderer/assets/index-BS7vgKVV.js');
  if (!fs.existsSync(p)) continue;

  console.log('[*] Xử lý:', p);
  let code = fs.readFileSync(p, 'utf8');

  // 1. Thêm vào tb (Node có thể chạy được & reset được)
  if (!code.includes('n.type==="select-item"||n.type==="video-dubbing"')) {
    code = code.replace(
      'n.type==="select-item"',
      'n.type==="select-item"||n.type==="video-dubbing"'
    );
    console.log('  ✓ Đã thêm video-dubbing vào tb');
  }

  // 2. Thêm vào o1 (Node xuất output có thể tái sử dụng cho các node sau)
  if (!code.includes('||n.type==="select-item"||n.type==="video-dubbing"')) {
    code = code.replace(
      '||n.type==="select-item")',
      '||n.type==="select-item"||n.type==="video-dubbing")'
    );
    console.log('  ✓ Đã thêm video-dubbing vào o1');
  }

  fs.writeFileSync(p, code, 'utf8');
}
