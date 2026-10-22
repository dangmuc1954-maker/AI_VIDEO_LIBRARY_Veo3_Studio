const fs = require('fs');

const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const main = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('=== KIỂM TRA TOÀN DIỆN HỆ THỐNG HIỆU ỨNG CHUYỂN CẢNH ===');

// 1. Check 10 transitions list
const trans = ['none', 'dissolve', 'fade', 'fadeblack', 'slideleft', 'slideright', 'wipeleft', 'wiperight', 'circleopen', 'circleclose'];
let allTransInList = true;
for (const tr of trans) {
  if (!code.includes(`id:"${tr}"`)) {
    allTransInList = false;
    console.log('Missing transition in UI list:', tr);
  }
}
console.log('1. Danh sách 10 hiệu ứng chuẩn app gốc:', allTransInList ? '✅ ĐẦY ĐỦ 10/10' : '❌ THIẾU');

// 2. Check Timeline transition badges
const hasTimelineBadge = code.includes('Chuyển cảnh') && code.includes('group/cut');
console.log('2. Huy hiệu hiển thị hiệu ứng chuyển cảnh trên Timeline:', hasTimelineBadge ? '✅ ĐÃ KÍCH HOẠT' : '❌ CHƯA CÓ');

// 3. Check Live Player CSS transitions
const hasLivePlayerTrans = code.includes('clipPath') && code.includes('slideleft') && code.includes('wipeleft');
console.log('3. Hiệu ứng chuyển cảnh trực tiếp trong trình xem trước (Live Player):', hasLivePlayerTrans ? '✅ ĐÃ KÍCH HOẠT' : '❌ CHƯA CÓ');

// 4. Check Auto-Merge transition selector dropdown
const hasAutoMergeDropdown = code.includes('aiforge_auto_merge_transition') && code.includes('Hiệu ứng:');
console.log('4. Thanh chọn hiệu ứng chuyển cảnh khi ghép tự động:', hasAutoMergeDropdown ? '✅ ĐÃ KÍCH HOẠT' : '❌ CHƯA CÓ');

// 5. Check Backend ffmpeg xfade duration
const hasFfmpegXfade08 = main.includes('Math.min(.8,');
console.log('5. Backend ffmpeg xfade mượt mà (0.8s):', hasFfmpegXfade08 ? '✅ CHÍNH XÁC' : '❌ CHƯA CÓ');

// 6. Setup executable
const setupPath = 'dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe';
const exists = fs.existsSync(setupPath);
const size = exists ? (fs.statSync(setupPath).size / (1024 * 1024)).toFixed(1) + ' MB' : '0 MB';
console.log(`6. File cài đặt thương mại (${setupPath}):`, exists ? `✅ SẴN SÀNG (${size})` : '❌ CHƯA CÓ');
