const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🔨 ĐANG BIÊN DỊCH BỘ CÀI ĐẶT STANDALONE EXE (AI_VIDEO_LIBRARY_SETUP.EXE) 🔨');
console.log('======================================================================');

const rootDir = path.resolve(__dirname, '..');
const zipPath = path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0.zip');
const csPath = path.join(rootDir, 'scripts/Installer.cs');
const icoPath = path.join(rootDir, 'assets/icon.ico');
const outExe = path.join(rootDir, 'dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe';

if (!fs.existsSync(zipPath)) {
  console.error('❌ Không tìm thấy file ZIP:', zipPath);
  process.exit(1);
}

if (!fs.existsSync(csPath)) {
  console.error('❌ Không tìm thấy file C#:', csPath);
  process.exit(1);
}

// Kill any hanging installer instance
try {
  spawnSync('taskkill', ['/F', '/IM', 'AI_VIDEO_LIBRARY_Setup_v3.0.exe'], { stdio: 'ignore' });
} catch(e) {}

// If outExe exists, try removing or writing to a temp file and rename
if (fs.existsSync(outExe)) {
  try {
    fs.unlinkSync(outExe);
  } catch(e) {
    console.log('Note on existing outExe:', e.message);
  }
}

console.log(`[*] Tệp nguồn ZIP đính kèm: ${zipPath} (${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(1)} MB)`);
console.log(`[*] Đang biên dịch C# sang Native Windows Installer Executable...`);

const manifestPath = path.join(rootDir, 'scripts/installer.manifest');

const args = [
  '/target:winexe',
  '/optimize+',
  fs.existsSync(icoPath) ? `/win32icon:${icoPath}` : '',
  fs.existsSync(manifestPath) ? `/win32manifest:${manifestPath}` : '',
  '/reference:System.dll',
  '/reference:System.Windows.Forms.dll',
  '/reference:System.Drawing.dll',
  '/reference:System.IO.Compression.FileSystem.dll',
  '/reference:System.IO.Compression.dll',
  `/resource:${zipPath},AppPayload.zip`,
  `/out:${outExe}`,
  csPath
].filter(Boolean);

const res = spawnSync(cscPath, args, { stdio: 'inherit', cwd: rootDir });

if (res.status === 0 && fs.existsSync(outExe)) {
  console.log(`
======================================================================
  🎉 BIÊN DỊCH THÀNH CÔNG BỘ CÀI ĐẶT STANDALONE EXE!
  📍 File cài đặt duy nhất: ${outExe}
  📦 Dung lượng: ${(fs.statSync(outExe).size / 1024 / 1024).toFixed(1)} MB
  👉 Khách hàng CHỈ CẦN TẢI 1 FILE "AI_VIDEO_LIBRARY_Setup_v3.0.exe" NÀY!
  👉 Nhấp đúp mở lên -> Có nút "CÀI ĐẶT NGAY" -> Tự động tạo icon Desktop -> Mở App!
======================================================================
`);
} else {
  console.error('❌ Lỗi khi biên dịch qua spawnSync. Exit code:', res.status);
  process.exit(res.status || 1);
}
