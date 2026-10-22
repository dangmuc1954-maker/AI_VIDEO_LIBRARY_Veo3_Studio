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
      try {
        fs.copyFileSync(s, d);
      } catch (e) {
        if (e.code !== 'EBUSY' && e.code !== 'EPERM') throw e;
      }
    }
  }
}

const targets = [
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app'),
  ...(process.env.AIFORGE_SKIP_INSTALLED_SYNC === '1' ? [] : ['C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app'])
];

for (const target of targets) {
  if (!fs.existsSync(target)) continue;
  console.log('[*] Đang đồng bộ hóa sang:', target);
  
  // 1. Clean & Copy out
  const targetOut = path.join(target, 'out');
  if (fs.existsSync(targetOut)) {
    fs.rmSync(targetOut, { recursive: true, force: true });
  }
  copyDir(path.join(__dirname, '../app/out'), targetOut);
  console.log('  ✓ Đã cập nhật out/ sạch sẽ 100%');

  // 2. Copy canvas-confetti & STT modules
  const extraPkgs = [
    'canvas-confetti',
    '@xenova',
    'onnxruntime-node',
    'onnxruntime-web',
    'onnxruntime-common',
    '@huggingface',
    'sharp'
  ];
  for (const pkg of extraPkgs) {
    const pkgSrc = path.join(__dirname, '../app/node_modules', pkg);
    const pkgDest = path.join(target, 'node_modules', pkg);
    if (fs.existsSync(pkgSrc)) {
      copyDir(pkgSrc, pkgDest);
      console.log(`  ✓ Đã cập nhật node_modules/${pkg}`);
    }
  }

  // 3. Copy models/ (Whisper model)
  const modelsSrc = path.join(__dirname, '../app/models');
  const modelsDest = path.join(target, 'models');
  if (fs.existsSync(modelsSrc)) {
    copyDir(modelsSrc, modelsDest);
    console.log('  ✓ Đã đồng bộ thư mục models/ (Whisper STT)');
  }

  // 3b. Copy modules/ (AI Upscaler & Watermark Cleaner)
  const modulesSrc = path.join(__dirname, '../app/modules');
  const modulesDest = path.join(target, 'modules');
  if (fs.existsSync(modulesSrc)) {
    copyDir(modulesSrc, modulesDest);
    console.log('  ✓ Đã đồng bộ thư mục modules/ (AI Upscaler & Watermark Cleaner)');
  }

  // 4. Update package.json
  const pkgPath = path.join(target, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.dependencies = pkg.dependencies || {};
    pkg.dependencies['canvas-confetti'] = '^1.9.4';
    pkg.dependencies['@xenova/transformers'] = '^2.17.2';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
    console.log('  ✓ Đã cập nhật package.json');
  }

  // 5. Copy Cap_Quyen_Ghi_O_Dia_D.bat tool
  const batSrc = path.join(__dirname, '../Cap_Quyen_Ghi_O_Dia_D.bat');
  if (fs.existsSync(batSrc)) {
    try {
      fs.copyFileSync(batSrc, path.join(target, 'Cap_Quyen_Ghi_O_Dia_D.bat'));
      const appRoot = path.join(target, '../../');
      if (fs.existsSync(appRoot)) {
        fs.copyFileSync(batSrc, path.join(appRoot, 'Cap_Quyen_Ghi_O_Dia_D.bat'));
      }
      console.log('  ✓ Đã đính kèm công cụ mở khóa quyền ổ đĩa: Cap_Quyen_Ghi_O_Dia_D.bat');
    } catch (_) {}
  }
}

console.log('🌟 ĐỒNG BỘ TOÀN BỘ CÁC BẢN EXE THÀNH CÔNG! 🌟');
