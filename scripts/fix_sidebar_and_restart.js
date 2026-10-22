const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======================================================================');
console.log('🔧 SỬA LỖI TRUNCATE TÊN APP & NÂNG CẤP SIDEBAR WIDTH SANG W-60');
console.log('======================================================================');

const baseDir = path.resolve(__dirname, '..');
const indexPath = path.join(baseDir, 'app/out/renderer/assets/index-BS7vgKVV.js');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');

  // 1. Change aside w-56 to w-60 (gives 16px extra width for perfect title fit)
  if (content.includes('w-56 h-screen')) {
    content = content.replace('w-56 h-screen', 'w-60 h-screen');
    console.log('  ✓ Đã mở rộng Sidebar sang w-60 (không bị cụt chữ)');
  }

  // 2. Make title font-extrabold text-[12.5px] and whitespace-nowrap (never truncate!)
  const oldTitlePattern = 'text-[13px] font-bold text-text-primary tracking-tight truncate leading-none",children:"AI VIDEO LIBRARY"';
  const newTitlePattern = 'text-[12.5px] font-extrabold text-text-primary tracking-tight whitespace-nowrap leading-none",children:"AI VIDEO LIBRARY"';
  if (content.includes(oldTitlePattern)) {
    content = content.replace(oldTitlePattern, newTitlePattern);
    console.log('  ✓ Đã bỏ truncate và căn chỉnh tiêu đề AI VIDEO LIBRARY hoàn hảo!');
  } else {
    // Check general pattern
    const regex = /text-\[13px\]\s+font-bold\s+text-text-primary\s+tracking-tight\s+truncate\s+leading-none",children:"AI VIDEO LIBRARY"/;
    if (regex.test(content)) {
      content = content.replace(regex, newTitlePattern);
      console.log('  ✓ Đã đổi tiêu đề bằng regex!');
    }
  }

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log('✅ Đã cập nhật xong file index-BS7vgKVV.js');
}

// 2. Update CSS for aside.w-60
const cssPath = path.join(baseDir, 'app/out/renderer/assets/index-CkYUhlHV.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');
  css = css.replace(/aside\.w-56/g, 'aside.w-60, aside.w-56, aside');
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ Đã cập nhật CSS hỗ trợ aside.w-60');
}

console.log('======================================================================');
console.log('🎉 SỬA LỖI HOÀN TẤT!');
console.log('======================================================================');
