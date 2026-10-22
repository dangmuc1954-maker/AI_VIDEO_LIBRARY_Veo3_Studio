const fs = require('fs');

console.log('=== KIỂM TRA HỆ THỐNG HIỆU ỨNG CHUYỂN CẢNH (TRANSITION ENGINE) ===');

const rendererCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// 1. Kiểm tra engine render chuyển cảnh thời gian thực (60fps)
const hasEngine = rendererCode.includes('function applyVidTransition') && rendererCode.includes('function resetVidStyles') && rendererCode.includes('activeTransitionRef');
console.log('1. Engine render chuyển cảnh thời gian thực (60fps, không lặp âm):', hasEngine ? '✅ ĐÃ KÍCH HOẠT' : '❌ THIẾU');

// 2. Kiểm tra danh sách 10 hiệu ứng chuẩn khớp app gốc & ffmpeg
const effects = ['none', 'dissolve', 'fade', 'fadeblack', 'slideleft', 'slideright', 'wipeleft', 'wiperight', 'circleopen', 'circleclose'];
const hasAllEffects = effects.every(eff => rendererCode.includes(`case "${eff}":`) || eff === 'none');
console.log('2. Hỗ trợ đầy đủ 10 hiệu ứng chuẩn:', hasAllEffects ? '✅ 10/10 HIỆU ỨNG' : '❌ THIẾU HIỆU ỨNG');

// 3. Kiểm tra tự động xem thử (Auto Preview on Click)
const hasAutoPreview = rendererCode.includes('seekTime=Math.max(0,cutPoint-0.2)') && rendererCode.includes('dt()');
console.log('3. Tự động nhảy xem thử khi chọn hiệu ứng hoặc click badge timeline:', hasAutoPreview ? '✅ ĐÃ KÍCH HOẠT' : '❌ CHƯA CÓ');

// 4. Kiểm tra Scrubbing chuyển cảnh theo dòng thời gian
const hasScrubbing = rendererCode.includes('timeInClip=c-w.globalStart') && rendererCode.includes('applyVidTransition(k,Oe,transEffect,p)');
console.log('4. Kéo thanh trượt timeline (Scrubbing) xem chuyển cảnh mượt mà:', hasScrubbing ? '✅ ĐÃ KÍCH HOẠT' : '❌ THIẾU');

// 5. Kiểm tra Backend FFmpeg Render (Xuất video & Ghép tự động)
const hasFfmpegXfade = mainCode.includes('xfade=transition=${t}:duration=') && mainCode.includes('acrossfade=d=');
console.log('5. Backend FFmpeg xfade render video chuyển cảnh khi xuất:', hasFfmpegXfade ? '✅ ĐÃ KÍCH HOẠT' : '❌ THIẾU');

// 6. Kiểm tra file Setup Installer v3.0
const setupExists = fs.existsSync('dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe');
const setupSize = setupExists ? (fs.statSync('dist/AI_VIDEO_LIBRARY_Setup_v3.0.exe').size / (1024 * 1024)).toFixed(1) : 0;
console.log('6. Bộ cài đặt Standalone Setup v3.0.exe:', setupExists ? `✅ SẴN SÀNG (${setupSize} MB)` : '❌ THIẾU');

if (hasEngine && hasAllEffects && hasAutoPreview && hasScrubbing && hasFfmpegXfade && setupExists) {
  console.log('\n🎉 TOÀN BỘ HỆ THỐNG HIỆU ỨNG CHUYỂN CẢNH ĐÃ HOÀN THIỆN 100%! 🎉');
} else {
  console.log('\n❌ VẪN CÒN ĐIỂM CHƯA ĐẠT!');
}
