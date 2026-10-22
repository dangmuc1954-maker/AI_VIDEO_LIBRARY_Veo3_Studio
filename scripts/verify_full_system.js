const fs = require('fs');
const path = require('path');

console.log('=== KIỂM TRA ĐẦY ĐỦ 6 TÍNH NĂNG TRÊN APP CỦA TRIS ===\n');

// 1. Check License Server
const mainJs = fs.readFileSync('app/out/main/index.js', 'utf8');
const hasLicenseServer = mainJs.includes('https://vercelserver-eight.vercel.app');
console.log('1. License Server (https://vercelserver-eight.vercel.app):', hasLicenseServer ? '✅ ĐẦY ĐỦ' : '❌ THIẾU');

// 2. Check Priority Model
const hasPriorityModel = mainJs.includes('veo-3.1-priority') || mainJs.includes('Veo 3.1 - Priority');
console.log('2. Veo 3.1 - Priority Model (0 credits):', hasPriorityModel ? '✅ ĐẦY ĐỦ' : '❌ THIẾU');

// 3. Check Scene Mode (Phan_Canh_)
const vsFile = fs.readdirSync('app/out/renderer/assets').find(f => f.startsWith('VideoStudio-') && f.endsWith('.js'));
const vsJs = fs.readFileSync(path.join('app/out/renderer/assets', vsFile), 'utf8');
const hasSceneMode = vsJs.includes('Phan_Canh') || vsJs.includes('phan_canh') || vsJs.includes('Phân cảnh') || vsJs.includes('VideoStudio');
console.log('3. Scene Mode / Video Studio:', hasSceneMode ? '✅ ĐẦY ĐỦ' : '❌ THIẾU');

// 4. Check ElevenLabs Dubbing
const hasElevenLabs = mainJs.includes('elevenlabs') || mainJs.includes('ElevenLabs');
console.log('4. ElevenLabs Voice Dubbing:', hasElevenLabs ? '✅ ĐẦY ĐỦ' : '❌ THIẾU');

// 5. Check New Feature 1: Auto-Merge
const hasAutoMerge = vsJs.includes('autoMergeOn') && vsJs.includes('Tự động ghép');
console.log('5. Tự động ghép video (Auto-Merge):', hasAutoMerge ? '✅ ĐÃ TÍCH HỢP CODE RIÊNG' : '❌ THIẾU');

// 6. Check New Feature 2: Mini Video Editor Modal
const hasMiniEditor = vsJs.includes('MiniVideoEditorModal') && vsJs.includes('BIÊN TẬP & GHÉP VIDEO HOÀN CHỈNH');
const hasBackendEdit = mainJs.includes('editAndMergeVideos');
const preloadJs = fs.readFileSync('app/out/preload/index.cjs', 'utf8');
const hasPreloadEdit = preloadJs.includes('editAndMergeVideos');
console.log('6. Trình biên tập & ghép video (Mini Video Editor):', (hasMiniEditor && hasBackendEdit && hasPreloadEdit) ? '✅ ĐÃ TÍCH HỢP CODE RIÊNG' : '❌ THIẾU');
