const fs = require('fs');

console.log('--- Kiểm tra logic pipeline Upscale & Capabilities ---');

// 1. Kiểm tra licenseCapabilities hook
const capCode = fs.readFileSync('app/out/renderer/assets/licenseCapabilities-HpsCBvbh.js', 'utf8');
console.log('1. licenseCapabilities hook return !0:', capCode.includes('return!0') && capCode.includes('allowed:!0'));

// 2. Kiểm tra backend main/index.js
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
console.log('2. missingCapabilityForJob bypassed:', mainCode.includes('missingCapabilityForJob(e,t){return void 0}'));
console.log('3. toStatusSnapshot capabilities Vg:', mainCode.includes('capabilities:Vg'));
console.log('4. Google Flow Image Upscale RPC SPrCad present:', mainCode.includes('SPrCad'));
console.log('5. Google Flow Video Upscale RPC p0UkFb present:', mainCode.includes('p0UkFb'));
console.log('6. Watermark removal Fs.removeImageWatermark present:', mainCode.includes('Fs.removeImageWatermark'));
console.log('7. Watermark removal Fs.removeVideoWatermarkFromBuffer present:', mainCode.includes('Fs.removeVideoWatermarkFromBuffer'));

// 3. Kiểm tra file installer standalone
const installerPath = 'dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe';
if (fs.existsSync(installerPath)) {
  const st = fs.statSync(installerPath);
  console.log(`8. File cài đặt ${installerPath}: ${(st.size / 1024 / 1024).toFixed(2)} MB, modified: ${st.mtime}`);
} else {
  console.log(`8. File cài đặt ${installerPath}: NOT FOUND`);
}
