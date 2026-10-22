const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('📦 TẠO FILE ZIP & BIÊN DỊCH SETUP INSTALLER SIÊU TỐC (.NET ZIPFILE) 📦');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Customer_Edition');
const zipFile = path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0.zip');

if (!fs.existsSync(distDir)) {
  console.error('❌ Không tìm thấy thư mục distDir:', distDir);
  process.exit(1);
}

if (fs.existsSync(zipFile)) {
  try { fs.unlinkSync(zipFile); } catch(e) {}
}
console.log('[*] Đang đồng bộ hóa mã nguồn sạch sang thư mục dist...');
try {
  execSync(`node "${path.join(__dirname, 'sync_dist.cjs')}"`, { stdio: 'inherit', cwd: rootDir });
} catch(e) {
  console.error('❌ Lỗi khi đồng bộ dist:', e.message);
  process.exit(1);
}

console.log('[*] Kích hoạt Lớp Giáp Bảo Vệ Chống AI (Anti-AI Code Shield)...');
try {
  execSync(`node "${path.join(__dirname, 'obfuscate_release.cjs')}"`, { stdio: 'inherit', cwd: rootDir });
} catch(e) {
  console.error('❌ Lỗi khi mã hóa chống AI:', e.message);
  process.exit(1);
}

console.log('[*] Đang nén thư mục bằng .NET Native Zip Engine...');
const psZipCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${distDir.replace(/'/g, "''")}', '${zipFile.replace(/'/g, "''")}', [System.IO.Compression.CompressionLevel]::Fastest, $false)"`;

try {
  execSync(psZipCmd, { stdio: 'inherit' });
  console.log(`✅ Đã tạo file ZIP thành công: ${zipFile} (${(fs.statSync(zipFile).size / 1024 / 1024).toFixed(1)} MB)`);
} catch(e) {
  console.error('Lỗi khi tạo zip:', e.message);
  process.exit(1);
}

console.log('[*] Đang biên dịch bộ cài đặt AI_VIDEO_LIBRARY_Setup_v3.0.exe...');
try {
  execSync(`node "${path.join(__dirname, 'compile_installer.js')}"`, { stdio: 'inherit', cwd: rootDir });
} catch(e) {
  console.error('Lỗi khi compile installer:', e.message);
}
