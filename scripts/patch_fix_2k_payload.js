// scripts/patch_fix_2k_payload.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('💎 HOÀN THIỆN ĐỘ NÉT 2K NATIVE CHO ẢNH SHOWROOM & STUDIO ẢNH AI 💎');
console.log('======================================================================');

const targetRoots = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app'),
  path.join(__dirname, '../dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app')
];

// 1. Cập nhật VideoFactoryStudio.js
for (const root of targetRoots) {
  const vfPath = path.join(root, 'out/renderer/assets/VideoFactoryStudio.js');
  if (!fs.existsSync(vfPath)) continue;

  let vfCode = fs.readFileSync(vfPath, 'utf8');

  // Đảm bảo payload truyền chuẩn upsampleResolution: '2K'
  const oldPayloadSnippet = /removeWatermark: removeWatermark,[\s\S]*?upscale2k: imageResolution === '2k'/g;
  const newPayloadSnippet = `removeWatermark: removeWatermark,
              autoRemoveWatermark: removeWatermark,
              upsampleResolution: imageResolution === '2k' ? '2K' : 'Full HD',
              resolution: imageResolution === '2k' ? '2K' : 'Standard',
              quality: imageResolution === '2k' ? '2K' : 'Standard',
              imageResolution: imageResolution,
              upscale2k: imageResolution === '2k'`;

  if (oldPayloadSnippet.test(vfCode)) {
    vfCode = vfCode.replace(oldPayloadSnippet, newPayloadSnippet);
  }

  fs.writeFileSync(vfPath, vfCode, 'utf8');
  console.log('✅ Đã cập nhật VideoFactoryStudio.js tại:', vfPath);
}

// 2. Cập nhật google_flow_web_runner.js
for (const root of targetRoots) {
  const runnerPath = path.join(root, 'modules/google_flow_web_runner.js');
  if (!fs.existsSync(runnerPath)) continue;

  let rCode = fs.readFileSync(runnerPath, 'utf8');

  // Kiểm tra upscale2k bao gồm cả upsampleResolution === '2K'
  rCode = rCode.replace(
    /const shouldUpscale2k = job\.payload\?\.upscale2k === true \|\| job\.payload\?\.imageResolution === '2k' \|\| job\.payload\?\.resolution === '2k';/g,
    "const shouldUpscale2k = job.payload?.upscale2k === true || job.payload?.imageResolution === '2k' || job.payload?.upsampleResolution === '2K' || job.payload?.resolution === '2K';"
  );

  // Đảm bảo asset trả về có resolution: '2K' nếu được nâng nét
  if (!rCode.includes("resolution: shouldUpscale2k ? '2K' : 'Standard'")) {
    rCode = rCode.replace(
      "mimeType: 'image/png'",
      "mimeType: 'image/png',\n        resolution: shouldUpscale2k ? '2K' : 'Standard'"
    );
  }

  fs.writeFileSync(runnerPath, rCode, 'utf8');
  console.log('✅ Đã cập nhật google_flow_web_runner.js tại:', runnerPath);
}

// Kiểm tra AST
try {
  execSync('node -c app/out/renderer/assets/VideoFactoryStudio.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] VideoFactoryStudio.js AST Syntax 100% hợp lệ!');
} catch (e) {
  console.error('❌ [FAIL] VideoFactoryStudio.js AST Syntax lỗi!');
  process.exit(1);
}

console.log('\\n💎 HOÀN TẤT TÍCH HỢP 2K NATIVE VÀO PAYLOAD CỦA STUDIO ẢNH AI!');
