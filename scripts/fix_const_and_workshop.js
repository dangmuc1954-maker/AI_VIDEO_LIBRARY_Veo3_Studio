const fs = require('fs');
const path = require('path');

// 1. SỬA LỖI ASSIGNMENT TO CONSTANT VARIABLE TRONG app/out/main/index.js
const mainFile = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainFile, 'utf8');

const oldDecl = 'a=o?.readyUrlPatterns.some(g=>g.test(e.url))||!1,s=A.resolveAuthStatus?.({snapshot:e,currentSession:t,loginUrl:n,readyUrl:a,challengeUrl:su(e.url)})??"Unknown";';
const newDecl = 'a=o?.readyUrlPatterns.some(g=>g.test(e.url))||!1;let s=A.resolveAuthStatus?.({snapshot:e,currentSession:t,loginUrl:n,readyUrl:a,challengeUrl:su(e.url)})??"Unknown";';

if (mainCode.includes(oldDecl)) {
  mainCode = mainCode.replace(oldDecl, newDecl);
  fs.writeFileSync(mainFile, mainCode, 'utf8');
  console.log('✅ 1. Đã sửa lỗi "Assignment to constant variable" trong main/index.js (chuyển const s sang let s)!');
} else {
  console.log('⚠️ 1. Không tìm thấy oldDecl trong main/index.js, hãy kiểm tra lại!');
}

// 2. SỬA XƯỞNG VIDEO (VideoFactoryStudio.js): Nhận diện tài khoản Muse AI & Veo3 linh hoạt
const vfFile = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let vfCode = fs.readFileSync(vfFile, 'utf8');

// 2a. Mở rộng bộ lọc valid accounts
const oldFilter = "(s.providerId === 'veo3' || s.providerId === 'banana' || s.providerId === 'muse' || (s.provider && s.provider.toLowerCase().includes('muse'))) && s.authStatus === 'Logged In'";
const newFilter = "(s.providerId === 'veo3' || s.providerId === 'banana' || s.providerId === 'muse' || (s.provider && s.provider.toLowerCase().includes('muse'))) && (s.authStatus === 'Logged In' || s.authStatus === 'active' || (s.providerId === 'muse' && !s.disabled))";

if (vfCode.includes(oldFilter)) {
  vfCode = vfCode.replace(oldFilter, newFilter);
  console.log('✅ 2a. Đã mở rộng bộ lọc tài khoản Xưởng để luôn nhận diện Muse AI mới đăng nhập!');
} else {
  console.log('⚠️ 2a. Không tìm thấy oldFilter trong VideoFactoryStudio.js');
}

// 2b. Hiển thị tên tài khoản đẹp mắt trong dropdown thay vì raw ID thô
const oldOption = '`${isMuse ? \'⚡\' : \'🎬\'} ${acc.accountEmail || acc.accountDisplayName || acc.accountId}`';
const newOption = '`${isMuse ? \'⚡\' : \'🎬\'} ${acc.accountName || acc.accountDisplayName || acc.accountEmail || (isMuse ? `Muse AI #${vAccs.indexOf(acc) + 1}` : `Veo 3 #${vAccs.indexOf(acc) + 1}`)}`';

if (vfCode.includes(oldOption)) {
  vfCode = vfCode.replace(oldOption, newOption);
  console.log('✅ 2b. Đã nâng cấp nhãn hiển thị Dropdown Xưởng (hiện Muse AI #1, Muse AI #2...)!');
} else {
  console.log('⚠️ 2b. Không tìm thấy oldOption trong VideoFactoryStudio.js');
}

fs.writeFileSync(vfFile, vfCode, 'utf8');
console.log('🎉 Hoàn tất sửa đổi!');
