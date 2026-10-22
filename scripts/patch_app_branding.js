const fs = require('fs');
const path = require('path');

console.log('======================================================================');
console.log('🔄 ĐANG CẬP NHẬT TÊN VÀ ICON ỨNG DỤNG SANG AI VIDEO LIBRARY');
console.log('======================================================================');

const baseDir = path.resolve(__dirname, '..');
const b64Path = path.join(baseDir, 'scripts/robot_icon_base64.txt');
if (!fs.existsSync(b64Path)) {
  console.error('❌ Không tìm thấy file robot_icon_base64.txt');
  process.exit(1);
}

const robotB64 = fs.readFileSync(b64Path, 'utf8').trim();
console.log(`[*] Độ dài Base64 Icon Robot mới: ${robotB64.length}`);

// 1. Patch app/out/renderer/assets/index-BS7vgKVV.js
const indexPath = path.join(baseDir, 'app/out/renderer/assets/index-BS7vgKVV.js');
if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  const origLen = content.length;

  // Replace Mv
  const mvRegex = /Mv="data:image\/png;base64,[^"]+"/;
  if (mvRegex.test(content)) {
    content = content.replace(mvRegex, `Mv="${robotB64}"`);
    console.log('  ✓ Đã thay thế thành công biến Mv thành Icon Robot mới!');
  } else {
    console.warn('  ⚠️ Không tìm thấy regex Mv trong index-BS7vgKVV.js');
  }

  // Replace text
  const textReplacements = [
    { from: 'alt:"AIForge Studio"', to: 'alt:"AI VIDEO LIBRARY"' },
    { from: 'children:"AIForge Studio"', to: 'children:"AI VIDEO LIBRARY"' },
    { from: 'Chào mừng bạn đến với AIForge Studio', to: 'Chào mừng bạn đến với AI VIDEO LIBRARY' },
    { from: 'Welcome to AIForge Studio', to: 'Welcome to AI VIDEO LIBRARY' },
    { from: 'ứng dụng AIForge Studio', to: 'ứng dụng AI VIDEO LIBRARY' },
    { from: 'Phiên bản AIForge Studio ${n}', to: 'Phiên bản AI VIDEO LIBRARY ${n}' },
    { from: 'AIForge Studio version ${n}', to: 'AI VIDEO LIBRARY version ${n}' },
    { from: 'Bạn đang dùng AIForge Studio phiên bản', to: 'Bạn đang dùng AI VIDEO LIBRARY phiên bản' },
    { from: 'Bạn đang sử dụng AIForge Studio phiên bản', to: 'Bạn đang sử dụng AI VIDEO LIBRARY phiên bản' },
    { from: 'You are using AIForge Studio version', to: 'You are using AI VIDEO LIBRARY version' },
    { from: 'kích hoạt AIForgeStudio', to: 'kích hoạt AI VIDEO LIBRARY' },
    { from: 'thanh toán AIForgeStudio', to: 'thanh toán AI VIDEO LIBRARY' },
    { from: 'AIForge Studio khác', to: 'AI VIDEO LIBRARY khác' },
    { from: 'AIForge Studio!', to: 'AI VIDEO LIBRARY!' },
    { from: 'gói Workflow AIForge', to: 'gói Workflow AI VIDEO LIBRARY' },
    { from: 'No AIForge Workflow', to: 'No AI VIDEO LIBRARY Workflow' }
  ];

  for (const { from, to } of textReplacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      console.log(`  ✓ Đã đổi văn bản: "${from}" -> "${to}"`);
    }
  }

  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ Đã cập nhật xong index-BS7vgKVV.js (Diff size: ${content.length - origLen})`);
}

// 2. Patch LicenseCenter-CK2ppPZf.js
const licPath = path.join(baseDir, 'app/out/renderer/assets/LicenseCenter-CK2ppPZf.js');
if (fs.existsSync(licPath)) {
  let lic = fs.readFileSync(licPath, 'utf8');
  lic = lic.split('AIForgeStudio').join('AI VIDEO LIBRARY');
  lic = lic.split('AIForge Studio').join('AI VIDEO LIBRARY');
  fs.writeFileSync(licPath, lic, 'utf8');
  console.log('✅ Đã cập nhật LicenseCenter-CK2ppPZf.js');
}

// 3. Patch BrowserHub-44JPDUjK.js
const hubPath = path.join(baseDir, 'app/out/renderer/assets/BrowserHub-44JPDUjK.js');
if (fs.existsSync(hubPath)) {
  let hub = fs.readFileSync(hubPath, 'utf8');
  hub = hub.split('placeholder:"AIForge Studio"').join('placeholder:"AI VIDEO LIBRARY"');
  fs.writeFileSync(hubPath, hub, 'utf8');
  console.log('✅ Đã cập nhật BrowserHub-44JPDUjK.js');
}

// 4. Patch app/out/main/index.js
const mainPath = path.join(baseDir, 'app/out/main/index.js');
if (fs.existsSync(mainPath)) {
  let mainContent = fs.readFileSync(mainPath, 'utf8');
  mainContent = mainContent.split('Activate AIForgeStudio').join('Activate AI VIDEO LIBRARY');
  mainContent = mainContent.split('Update AIForgeStudio').join('Update AI VIDEO LIBRARY');
  fs.writeFileSync(mainPath, mainContent, 'utf8');
  console.log('✅ Đã cập nhật app/out/main/index.js');
}

console.log('======================================================================');
console.log('🎉 HOÀN TẤT CẬP NHẬT GIAO DIỆN & BRANDING CHO TOÀN BỘ APP!');
console.log('======================================================================');
