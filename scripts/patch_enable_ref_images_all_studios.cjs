const fs = require('fs');
const path = require('path');
const acorn = require('./obfuscator/node_modules/acorn');

// 1. Patch StudioFailedBulkActions-Zv2NpUPy.js
const sfbPath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
let code = fs.readFileSync(sfbPath, 'utf8');

const targetStr = 'r==="video"&&e.jsxs("div",{className:"mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1a1438]/80 p-4 shadow-md"';
const replaceStr = 'r!=="tts"&&e.jsxs("div",{className:"mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#1a1438]/80 p-4 shadow-md"';

if (!code.includes(targetStr)) {
  console.error('❌ Could not find targetStr in StudioFailedBulkActions-Zv2NpUPy.js');
  process.exit(1);
}
code = code.replace(targetStr, replaceStr);

// Also update subtitle
code = code.replace(
  'r==="video"?"Tự động phân cảnh 1, 2, 3... & ghép ảnh tham chiếu chuẩn từng cảnh"',
  'r!=="tts"?"Tự động phân cảnh 1, 2, 3... & ghép ảnh tham chiếu chuẩn từng cảnh/ảnh"'
);
code = code.replace(
  'r==="video"?"Nhập hàng loạt Prompt kèm 3 chế độ nạp Ảnh Tham Chiếu (1-1, 1 cho tất cả, Theo tên cảnh)"',
  'r!=="tts"?"Nhập hàng loạt Prompt kèm 3 chế độ nạp Ảnh Tham Chiếu (1-1, 1 cho tất cả, Theo tên cảnh)"'
);

// Verify with Acorn
console.log('Validating StudioFailedBulkActions-Zv2NpUPy.js with Acorn...');
try {
  acorn.parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('✓ StudioFailedBulkActions-Zv2NpUPy.js is 100% syntactically valid JS!');
} catch (err) {
  console.error('❌ Syntax error in StudioFailedBulkActions-Zv2NpUPy.js:', err.message);
  process.exit(1);
}
fs.writeFileSync(sfbPath, code, 'utf8');
console.log('✓ Successfully updated StudioFailedBulkActions-Zv2NpUPy.js!');

// 2. Patch ImageStudio-4nmpUX3j.js to pass assets: S into Ns (Import modal)
const imgStudioPath = path.join(__dirname, '../app/out/renderer/assets/ImageStudio-4nmpUX3j.js');
let imgCode = fs.readFileSync(imgStudioPath, 'utf8');

const oldNs = 'studioType:"image"})';
const newNs = 'studioType:"image",assets:S})';

if (imgCode.includes(oldNs)) {
  imgCode = imgCode.replace(oldNs, newNs);
  console.log('Validating ImageStudio-4nmpUX3j.js with Acorn...');
  try {
    acorn.parse(imgCode, { ecmaVersion: 'latest', sourceType: 'module' });
    console.log('✓ ImageStudio-4nmpUX3j.js is 100% syntactically valid JS!');
    fs.writeFileSync(imgStudioPath, imgCode, 'utf8');
    console.log('✓ Successfully updated ImageStudio-4nmpUX3j.js!');
  } catch (err) {
    console.error('❌ Syntax error in ImageStudio-4nmpUX3j.js:', err.message);
    process.exit(1);
  }
} else {
  console.log('ℹ️ studioType:"image" already has assets or different pattern');
}

console.log('🌟 HOÀN TẤT BẬT 3 CHẾ ĐỘ ẢNH THAM CHIẾU CHO CẢ IMAGE STUDIO VÀ VIDEO STUDIO! 🌟');
