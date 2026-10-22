const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🎨 ĐANG ÁP DỤNG GIAO DIỆN MỚI: AURORA MESH (CONCEPT 1) + STUDIO QUEUE (CONCEPT 2)');
console.log('======================================================================');

const baseDir = path.resolve(__dirname, '..');

// 1. Append custom modern theme CSS to index-CkYUhlHV.css
const cssPath = path.join(baseDir, 'app/out/renderer/assets/index-CkYUhlHV.css');
if (fs.existsSync(cssPath)) {
  let css = fs.readFileSync(cssPath, 'utf8');

  // Check if already injected
  const marker = '/* AI VIDEO LIBRARY - THEME AURORA + STUDIO QUEUE */';
  if (css.includes(marker)) {
    css = css.split(marker)[0];
  }

  const customThemeCss = `
${marker}
:root {
  --color-bg-primary: #070611;
  --color-bg-secondary: #131024;
  --color-bg-tertiary: #1b1732;
  --color-bg-hover: #221d40;
  --color-bg-active: #2c2552;
  --color-bg-sidebar: #0a0818;
  --color-bg-inspector: #131024;
  --color-bg-input: #0e0b1c;
  --color-bg-table-row-hover: rgba(124, 58, 237, 0.12);
  --color-border-primary: rgba(255, 255, 255, 0.08);
  --color-border-secondary: rgba(139, 92, 246, 0.25);
  --color-accent: #8b5cf6;
  --color-accent-hover: #a78bfa;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-text-muted: #94a3b8;
}

/* Global Aurora Mesh Background */
body {
  background-color: #070611 !important;
  background-image: 
    radial-gradient(circle at 8% 0%, rgba(139, 92, 246, 0.18) 0%, transparent 45%),
    radial-gradient(circle at 92% 12%, rgba(6, 182, 212, 0.14) 0%, transparent 40%),
    radial-gradient(circle at 85% 90%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
    radial-gradient(circle at 15% 85%, rgba(168, 85, 247, 0.10) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(15, 12, 28, 0.5) 0%, transparent 100%) !important;
  background-attachment: fixed !important;
  background-repeat: no-repeat !important;
  color: #f8fafc !important;
}

/* Studio Chrome Outer Wrapper - Dynamic Aurora Lighting */
.bg-\\[radial-gradient\\(circle_at_top_left\\,rgba\\(124\\,58\\,237\\,0\\.08\\)\\,transparent_30\\)\\,\\#06040c\\] {
  background-color: #070611 !important;
  background-image: 
    radial-gradient(ellipse at 12% 0%, rgba(139, 92, 246, 0.20) 0%, transparent 45%),
    radial-gradient(ellipse at 88% 8%, rgba(6, 182, 212, 0.15) 0%, transparent 40%),
    radial-gradient(ellipse at 80% 95%, rgba(99, 102, 241, 0.14) 0%, transparent 45%),
    radial-gradient(circle at 20% 90%, rgba(168, 85, 247, 0.10) 0%, transparent 50%),
    #070611 !important;
}

/* Top Navigation / Header Bar */
header.bg-\\[\\#06040c\\]\\/90 {
  background: rgba(10, 8, 22, 0.88) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35) !important;
}

/* Sidebar Styling: Cosmic Depth & Sleek Glass Border */
aside.w-56 {
  background: linear-gradient(180deg, #100d23 0%, #0a0818 55%, #060511 100%) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.45) !important;
}

/* Panel Headers & Tables Translucent Glass Backing */
.bg-bg-primary\\/35, .bg-bg-primary\\/25, .bg-bg-primary\\/45, .bg-bg-primary\\/55, .bg-bg-primary\\/65 {
  background-color: rgba(14, 12, 26, 0.78) !important;
  backdrop-filter: blur(14px) !important;
  -webkit-backdrop-filter: blur(14px) !important;
}

.bg-bg-secondary, .bg-bg-secondary\\/70, .bg-bg-secondary\\/60, .bg-bg-secondary\\/66, .bg-bg-secondary\\/72 {
  background-color: rgba(18, 15, 34, 0.85) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
}

/* Ultra-clean Borders */
.border-border-primary, .border-border-primary\\/70, .border-border-primary\\/80 {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* High Contrast Text */
.text-text-primary {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
}

.text-text-secondary {
  color: #cbd5e1 !important;
}

.text-text-muted {
  color: #94a3b8 !important;
}

/* Prompt rows in table: smooth hover & high readability */
tr:hover, [role="row"]:hover {
  background-color: rgba(139, 92, 246, 0.08) !important;
}

/* Video cards: rounded corners with subtle glow on hover */
article {
  border-radius: 12px !important;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

article:hover {
  border-color: rgba(139, 92, 246, 0.45) !important;
  box-shadow: 0 8px 30px -4px rgba(0, 0, 0, 0.65), 0 0 20px -2px rgba(124, 58, 237, 0.25) !important;
  transform: translateY(-2px);
}

/* Smooth Premium Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(7, 6, 17, 0.6);
}
::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.3);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 92, 246, 0.55);
}
`;

  css = css + customThemeCss;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('✅ Đã cập nhật custom theme CSS vào index-CkYUhlHV.css');
}

// 2. Patch StudioChrome-6FuChZhy.js
const chromePath = path.join(baseDir, 'app/out/renderer/assets/StudioChrome-6FuChZhy.js');
if (fs.existsSync(chromePath)) {
  let chrome = fs.readFileSync(chromePath, 'utf8');
  
  // Replace background gradient
  chrome = chrome.replace(
    'bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.08),transparent_30%),#06040c]',
    'bg-[radial-gradient(ellipse_at_12%_0%,rgba(139,92,246,0.18),transparent_45%),radial-gradient(ellipse_at_88%_8%,rgba(6,182,212,0.14),transparent_40%),radial-gradient(ellipse_at_80%_95%,rgba(99,102,241,0.12),transparent_45%),#070611]'
  );

  // Replace header background
  chrome = chrome.replace('bg-[#06040c]/90', 'bg-[#0a0816]/90 backdrop-blur-md');

  fs.writeFileSync(chromePath, chrome, 'utf8');
  console.log('✅ Đã cập nhật StudioChrome-6FuChZhy.js');
}

// 3. Patch BrowserHub-44JPDUjK.js
const hubPath = path.join(baseDir, 'app/out/renderer/assets/BrowserHub-44JPDUjK.js');
if (fs.existsSync(hubPath)) {
  let hub = fs.readFileSync(hubPath, 'utf8');
  hub = hub.replace(
    'bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_28%),#0c0a14]',
    'bg-[radial-gradient(ellipse_at_12%_0%,rgba(139,92,246,0.18),transparent_45%),radial-gradient(ellipse_at_88%_8%,rgba(6,182,212,0.14),transparent_40%),#070611]'
  );
  fs.writeFileSync(hubPath, hub, 'utf8');
  console.log('✅ Đã cập nhật BrowserHub-44JPDUjK.js');
}

// 4. Patch Sidebar in index-BS7vgKVV.js
const indexPath = path.join(baseDir, 'app/out/renderer/assets/index-BS7vgKVV.js');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  indexContent = indexContent.replace(
    'bg-linear-to-b from-[#0e0c1b] via-[#090714] to-[#06050e]',
    'bg-linear-to-b from-[#100d23] via-[#0a0818] to-[#060511]'
  );
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('✅ Đã cập nhật Sidebar gradient trong index-BS7vgKVV.js');
}

console.log('======================================================================');
console.log('🎉 ÁP DỤNG GIAO DIỆN MỚI THÀNH CÔNG RỰC RỠ!');
console.log('======================================================================');
