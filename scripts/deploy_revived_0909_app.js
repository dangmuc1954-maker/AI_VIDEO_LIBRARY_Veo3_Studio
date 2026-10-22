const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🚀 TRIỂN KHAI SOURCE HỒI SINH 09/9 VÀO APP VÀ BUILD RELEASE CHO TRIS 🚀');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const revivedDir = path.join(rootDir, 'scratch/revived_0909_app');
const appDir = path.join(rootDir, 'app');

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

// 1. Backup existing app/out
const backupOut = path.join(appDir, 'out_backup_prior_to_pristine_0909');
if (!fs.existsSync(backupOut)) {
  console.log('[1/4] Sao lưu thư mục app/out hiện tại...');
  copyDir(path.join(appDir, 'out'), backupOut);
}

// 2. Overwrite app/out with scratch/revived_0909_app/out
console.log('[2/4] Cập nhật app/out từ source 09/9 hồi sinh...');
fs.rmSync(path.join(appDir, 'out'), { recursive: true, force: true });
copyDir(path.join(revivedDir, 'out'), path.join(appDir, 'out'));
console.log('  ✓ Đã cập nhật app/out sạch sẽ 100%');

// 3. Ensure models/ (Whisper) are in app/models
if (fs.existsSync(path.join(revivedDir, 'models'))) {
  console.log('[3/4] Đồng bộ models/ (Whisper STT)...');
  copyDir(path.join(revivedDir, 'models'), path.join(appDir, 'models'));
  console.log('  ✓ Đã đồng bộ models/');
}

// 4. Run syntax check on app/out/main/index.js
console.log('[4/4] Kiểm tra cú pháp app/out/main/index.js...');
execSync(`node --check "${path.join(appDir, 'out/main/index.js')}"`, { stdio: 'inherit' });
console.log('  ✅ Cú pháp app/out/main/index.js PASS 100%!');

console.log('\n🎉 Triển khai vào app/ hoàn tất! Chuẩn bị sync_dist và compile installer...');
