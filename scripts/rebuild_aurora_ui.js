const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🚀 BẮT ĐẦU XÂY LẠI TOÀN BỘ GIAO DIỆN AURORA CYBER GLASS MỚI');
console.log('======================================================================');

const baseDir = path.resolve(__dirname, '..');

// 1. StudioChrome-6FuChZhy.js: Make chrome wrapper transparent so background glows through!
const chromePath = path.join(baseDir, 'app/out/renderer/assets/StudioChrome-6FuChZhy.js');
if (fs.existsSync(chromePath)) {
  let chrome = fs.readFileSync(chromePath, 'utf8');

  // Replace wrapper background
  chrome = chrome.replace(
    /bg-\[radial-gradient\([^\]]+\)\]/g,
    'bg-transparent'
  );
  chrome = chrome.replace(/#06040c/g, 'transparent');
  
  // Header: Glassmorphism with violet border
  chrome = chrome.replace(
    'bg-[#06040c]/90',
    'bg-[#0b091c]/85 backdrop-blur-xl border-b border-purple-500/25 shadow-lg shadow-black/40'
  );

  fs.writeFileSync(chromePath, chrome, 'utf8');
  console.log('  ✓ Đã cập nhật StudioChrome-6FuChZhy.js (trong suốt hóa lớp che phủ)');
}

// 2. StudioPrimitives-CEIXwDK6.js: Make sections (ze) Frosted Cyber Glass
const primPath = path.join(baseDir, 'app/out/renderer/assets/StudioPrimitives-CEIXwDK6.js');
if (fs.existsSync(primPath)) {
  let prim = fs.readFileSync(primPath, 'utf8');

  // Replace ze component styling
  const oldZe = 'section-accent overflow-hidden rounded-xl border border-border-primary bg-bg-secondary/95 shadow-xl shadow-black/30';
  const newZe = 'section-accent overflow-hidden rounded-2xl border border-purple-500/35 bg-[#0e0b1f]/85 backdrop-blur-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10';
  if (prim.includes(oldZe)) {
    prim = prim.replace(oldZe, newZe);
    console.log('  ✓ Đã cập nhật khung Section sang Frosted Cyber Glass');
  } else {
    // Regex replace
    prim = prim.replace(
      /section-accent\s+overflow-hidden\s+rounded-xl[^\"]+bg-bg-secondary\/95[^\"]+/,
      newZe
    );
    console.log('  ✓ Đã cập nhật khung Section bằng regex');
  }

  fs.writeFileSync(primPath, prim, 'utf8');
}

// 3. index-BS7vgKVV.js: Update Root Layout and Sidebar
const indexPath = path.join(baseDir, 'app/out/renderer/assets/index-BS7vgKVV.js');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');

  // Root layout div
  indexContent = indexContent.replace(
    'className:"flex h-screen bg-bg-primary overflow-hidden"',
    'className:"flex h-screen bg-radial-aurora overflow-hidden"'
  );

  // Sidebar styling
  indexContent = indexContent.replace(
    'w-60 h-screen bg-linear-to-b from-[#100d23] via-[#0a0818] to-[#060511] border-r border-border-primary/70',
    'w-60 h-screen bg-linear-to-b from-[#110e28]/95 via-[#0b081a]/95 to-[#060512] border-r border-purple-500/30 shadow-2xl shadow-black/60 backdrop-blur-xl'
  );

  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('  ✓ Đã cập nhật index-BS7vgKVV.js (Root Layout & Sidebar)');
}

// 4. index-CkYUhlHV.css: Pure, Rich, High-Contrast Cyber Aurora Glass CSS
const cssPath = path.join(baseDir, 'app/out/renderer/assets/index-CkYUhlHV.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  // Strip previous custom CSS if any
  const marker = '/* AI VIDEO LIBRARY - THEME AURORA + STUDIO QUEUE */';
  if (css.includes(marker)) {
    css = css.split(marker)[0];
  }
  const marker2 = '/* AI VIDEO LIBRARY - COMPLETE AURORA REBUILD */';
  if (css.includes(marker2)) {
    css = css.split(marker2)[0];
  }

  const vibrantTheme = `
${marker2}
/* ==========================================================================
   VIBRANT AURORA CYBER GLASS THEME (CONCEPT 1 + CONCEPT 2 REBUILD)
   ========================================================================== */

/* 1. Global Background Aurora Mesh */
html, body, #root, .bg-radial-aurora {
  background-color: #070611 !important;
  background-image: 
    radial-gradient(circle at 10% 5%, rgba(139, 92, 246, 0.32) 0%, transparent 48%),
    radial-gradient(circle at 90% 10%, rgba(6, 182, 212, 0.25) 0%, transparent 42%),
    radial-gradient(circle at 85% 90%, rgba(99, 102, 241, 0.22) 0%, transparent 48%),
    radial-gradient(circle at 15% 90%, rgba(168, 85, 247, 0.20) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(15, 12, 32, 0.82) 0%, #070611 100%) !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
  color: #ffffff !important;
}

/* 2. Main Studio Chrome Wrapper */
main {
  background: transparent !important;
}

/* 3. Section Containers (Hàng đợi & Kết quả xem trước) */
section.section-accent, [class*="section-accent"] {
  background: rgba(14, 11, 28, 0.85) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(139, 92, 246, 0.35) !important;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12) !important;
  border-radius: 16px !important;
}

/* Section Header Bar */
section.section-accent > div:first-child {
  background: rgba(22, 17, 44, 0.85) !important;
  border-bottom: 1px solid rgba(139, 92, 246, 0.28) !important;
}

/* 4. Queue Table Styling */
table thead, thead.sticky {
  background: rgba(24, 18, 50, 0.95) !important;
  backdrop-filter: blur(16px) !important;
  border-bottom: 1px solid rgba(139, 92, 246, 0.4) !important;
}

table thead th {
  color: #c4b5fd !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
}

table tbody tr {
  background: rgba(16, 12, 32, 0.72) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  transition: all 0.15s ease-in-out !important;
}

table tbody tr:hover {
  background: rgba(139, 92, 246, 0.22) !important;
}

/* Selected row */
table tbody tr.bg-accent\/\\[0\\.12\\] {
  background: rgba(139, 92, 246, 0.28) !important;
  box-shadow: inset 4px 0 0 #a855f7 !important;
}

/* 5. Video Preview Result Cards */
.aspect-square, article {
  border-radius: 14px !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
}

.aspect-square:hover, .group:hover .aspect-square, article:hover {
  border-color: rgba(168, 85, 247, 0.7) !important;
  box-shadow: 0 0 28px -2px rgba(139, 92, 246, 0.55), 0 14px 34px rgba(0, 0, 0, 0.75) !important;
  transform: translateY(-3px) scale(1.015) !important;
}

/* 6. Typography & Extreme Legibility */
.text-text-primary, h1, h2, h3, .font-semibold {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6) !important;
}

.text-text-secondary {
  color: #e2e8f0 !important;
}

.text-text-muted {
  color: #a5b4fc !important;
}

/* 7. Action Buttons & Glow */
button.bg-gradient-to-r {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.45) !important;
}

/* 8. Modern Custom Scrollbar */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-track {
  background: rgba(8, 6, 18, 0.7);
}
::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.4);
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(168, 85, 247, 0.7);
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
}
`;

  css = css + vibrantTheme;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('  ✓ Đã cập nhật index-CkYUhlHV.css (Vibrant Aurora Cyber Glass CSS)');
}

console.log('======================================================================');
console.log('🎉 XÂY LẠI GIAO DIỆN HOÀN TẤT THÀNH CÔNG RỰC RỠ!');
console.log('======================================================================');
