const fs = require('fs');
const path = require('path');

console.log('=== TEST 1: Verifying File Syntax ===');
try {
  require('../app/out/preload/index.cjs');
  console.log('✓ Preload syntax valid (CJS require)');
} catch (e) {
  // contextBridge is not in pure Node, but syntax errors would throw earlier
  if (e.message.includes('contextBridge') || e.message.includes('electron')) {
    console.log('✓ Preload syntax valid (Electron API referenced)');
  } else {
    console.error('Preload error:', e);
    process.exit(1);
  }
}

console.log('=== TEST 2: Verifying Main Index Patches ===');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');
const checks = [
  '/*__AIFORGE_AUTO_DELETE_TAG__*/',
  'assets:getAutoDeleteConfig',
  'assets:setAutoDeleteConfig',
  'assets:cancelAssetAutoDelete',
  '/*__AIFORGE_AUTO_DELETE_INIT__*/',
  'checkAndCleanExpiredAssets'
];
for (const chk of checks) {
  if (!mainCode.includes(chk)) {
    console.error('Missing in main index.js:', chk);
    process.exit(1);
  }
}
console.log('✓ All 6 backend components present in app/out/main/index.js');

console.log('=== TEST 3: Verifying Renderer Assets Patches ===');
const assetsCode = fs.readFileSync('app/out/renderer/assets/Assets-CjWyHlAk.js', 'utf8');
const assetChecks = [
  'autoDelMins',
  'handleAutoDelChange',
  'Tự động xóa tài nguyên',
  '⏱️ Tự xóa: 20 phút',
  'Tắt tự xóa'
];
for (const chk of assetChecks) {
  if (!assetsCode.includes(chk)) {
    console.error('Missing in Assets-CjWyHlAk.js:', chk);
    process.exit(1);
  }
}
console.log('✓ All UI components present in Assets-CjWyHlAk.js');

console.log('=== TEST 4: Verifying VideoStudio Patches ===');
const vsCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
if (!vsCode.includes('⏱️ Tự xóa:') || !vsCode.includes('onChangeAutoDelMins')) {
  console.error('Missing controls in VideoStudio-frcr8V6s.js');
  process.exit(1);
}
console.log('✓ VideoStudio controls present');

console.log('=== TEST 5: Verifying VideoFactoryStudio Patches ===');
const vfCode = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');
if (!vfCode.includes('⏱️ Tự xóa:') || !vfCode.includes('onChangeAutoDel')) {
  console.error('Missing controls in VideoFactoryStudio.js');
  process.exit(1);
}
console.log('✓ VideoFactoryStudio controls present');

console.log('\n🌟 ALL SYSTEM CHECKS PASSED 100%! 🌟');
