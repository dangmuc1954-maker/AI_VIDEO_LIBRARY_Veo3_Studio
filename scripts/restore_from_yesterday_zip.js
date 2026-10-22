const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

const yesterdayApp = 'C:/Users/admin/AppData/Local/Temp/yesterday_unpacked/resources/app';
const workspaceApp = path.resolve(__dirname, '../app');

console.log('[*] Đang phục hồi 100% mã nguồn từ bản Setup hôm qua Tris gửi...');
console.log('Nguồn:', yesterdayApp);

// 1. Phục hồi vào app/
const targetOut = path.join(workspaceApp, 'out');
if (fs.existsSync(targetOut)) {
  fs.rmSync(targetOut, { recursive: true, force: true });
}
copyDir(path.join(yesterdayApp, 'out'), targetOut);
console.log('✓ Đã khôi phục app/out 100%');

// Copy package.json
fs.copyFileSync(path.join(yesterdayApp, 'package.json'), path.join(workspaceApp, 'package.json'));
console.log('✓ Đã khôi phục app/package.json');

// Copy node_modules if any extra in yesterday
if (fs.existsSync(path.join(yesterdayApp, 'node_modules'))) {
  copyDir(path.join(yesterdayApp, 'node_modules'), path.join(workspaceApp, 'node_modules'));
  console.log('✓ Đã đồng bộ node_modules');
}

// 2. Đồng bộ sang Customer Edition, Khách Hàng v3.0 và Installed App
const syncScript = path.resolve(__dirname, 'sync_dist.cjs');
console.log('[*] Đang đồng bộ sang tất cả các thư mục dist và installed app...');
require(syncScript);

console.log('🎉 PHỤC HỒI 100% THEO ĐÚNG BẢN SETUP HÔM QUA TRIS GỬI THÀNH CÔNG!');
