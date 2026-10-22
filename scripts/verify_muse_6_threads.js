const fs = require('fs');
const path = require('path');

console.log('=== TEST VERIFICATION: MUSE AI 6-THREAD CONCURRENCY & AUTO-ACCOUNT SWITCHING ===');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// 1. Verify Category Concurrency Limit (ko = 500)
const catLimitCheck = mainCode.includes('if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return ko;');
console.log('1. Category Concurrency Limit is "ko" (500, not bottlenecked):', catLimitCheck ? '✅ PASS' : '❌ FAIL');

// 2. Verify Per-Slot Limit in Scheduler Sc (strictly 6)
const scLimitCheck = mainCode.includes('getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return 6;');
console.log('2. Scheduler Sc Per-Account Slot Limit is 6:', scLimitCheck ? '✅ PASS' : '❌ FAIL');

// 3. Verify _B Auto Account Switcher
const bCheck = mainCode.includes('function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"') &&
               mainCode.includes('Đang chạy tối đa 6 luồng/tài khoản Muse AI. Đang chờ slot trống...');
console.log('3. Scheduler _B Auto-Account Switcher is integrated:', bCheck ? '✅ PASS' : '❌ FAIL');

// 4. Verify VideoStudio Mo_muse
const vsCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const moCheck = vsCode.includes('if(!q||q==="auto")return null;') &&
                vsCode.includes('accountSelection:ot?"manual":"auto"');
console.log('4. VideoStudio Auto Mode preserves unpinned accountId:', moCheck ? '✅ PASS' : '❌ FAIL');

// 5. Verify VideoFactoryStudio
const vfsCode = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');
const vfsCheck = vfsCode.includes('Tự động đổi Acc (Tối đa 6 luồng/acc)') &&
                 vfsCode.includes('selectedVideoAccountId === \'auto\'');
console.log('5. VideoFactoryStudio Auto Mode Option & Logic:', vfsCheck ? '✅ PASS' : '❌ FAIL');

if (catLimitCheck && scLimitCheck && bCheck && moCheck && vfsCheck) {
  console.log('\n🎉 TẤT CẢ 5 HẠNG MỤC KIỂM TRA ĐỀU ĐẠT CHUẨN 100%!');
} else {
  console.error('\n❌ CÓ HẠNG MỤC CHƯA ĐẠT, KIỂM TRA LẠI!');
  process.exit(1);
}
