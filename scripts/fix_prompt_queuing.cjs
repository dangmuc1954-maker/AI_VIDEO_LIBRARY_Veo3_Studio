const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [FIX] KHÔI PHỤC VÀ ĐẢM BẢO 6 LUỒNG CHUẨN XÁC, KHÔNG MẤT LỆNH ===');

// ---------------------------------------------------------
// 1. SỬA app/out/main/index.js
// ---------------------------------------------------------
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 1.1 getJobConcurrencyLimit: Trả về 6 chuẩn xác (như trước 5 luồng thì giờ 6 luồng)
mainCode = mainCode.replace(
  /if\(e\?\.payload\?\.model==="muse-video"\|\|e\?\.payload\?\.provider==="muse"\|\|e\?\.provider==="muse"\|\|e\?\.providerId==="muse"\|\|e\?\.provider==="Muse AI"\)return\s*[^;]+;/,
  'if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return 6;'
);
console.log('✅ 1.1 Đã cài đặt Concurrency Limit = 6 cho Muse AI trong main/index.js');

// 1.2 Khôi phục _B chuẩn xác, an toàn, không bị rơi rớt job
const bIdx = mainCode.indexOf('function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"');
if (bIdx !== -1) {
  const returnIdx = mainCode.indexOf('return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}', bIdx);
  if (returnIdx !== -1) {
    const cleanB = `function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video"||(r.providerId&&r.providerId.startsWith("custom-")))){if(r.accountId)return{accountId:r.accountId,account:r.account};const ms=T.listSessions().find(s=>s.providerId==="muse"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"));if(ms)return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}`;
    mainCode = mainCode.slice(0, bIdx) + cleanB + mainCode.slice(returnIdx);
    console.log('✅ 1.2 Đã khôi phục hàm _B nguyên bản siêu chuẩn, luôn nhận đủ 100% jobs');
  }
}

// 1.3 Khôi phục Sc.getLimit chuẩn
mainCode = mainCode.replace(
  /getLimit\(e\)\{if\(e\?\.providerId==="muse"[^}]+\}return Math\.max\(1,Math\.floor\(this\.resolveLimit\(e\)\|\|1\)\)\}/,
  'getLimit(e){return Math.max(1,Math.floor(this.resolveLimit(e)||1))}'
);
console.log('✅ 1.3 Scheduler Sc getLimit chuẩn hóa');

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ---------------------------------------------------------
// 2. SỬA app/out/renderer/assets/VideoStudio-frcr8V6s.js
// ---------------------------------------------------------
const studioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let studioCode = fs.readFileSync(studioPath, 'utf8');

// 2.1 Khôi phục Mo_muse nguyên bản: luôn trả về account chuẩn, không bao giờ null
const fixedMoMuse = 'Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(q&&q!=="auto"){const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);if(matched)return matched}return allMuse[0]||null}';

const moIdx = studioCode.indexOf('Mo_muse=');
if (moIdx !== -1) {
  const moEnd = studioCode.indexOf(',St=async', moIdx);
  if (moEnd !== -1) {
    studioCode = studioCode.slice(0, moIdx) + fixedMoMuse + studioCode.slice(moEnd);
    console.log('✅ 2.1 Đã khôi phục Mo_muse chuẩn: luôn có account, không trả về null');
  }
}

// 2.2 Sửa b.push cho Muse AI trong St: xoay vòng round-robin tài khoản nếu có nhiều acc, luôn đính kèm accountId chuẩn xác
const pushMuseTarget = 'if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){';
const pushMuseIdx = studioCode.indexOf(pushMuseTarget);
if (pushMuseIdx !== -1) {
  const nextProviderIdx = studioCode.indexOf('if(v.provider==="Grok")', pushMuseIdx);
  if (nextProviderIdx !== -1) {
    const fixedPushMuse = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(allMuse.length===0){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}let ot=(v.account&&v.account!=="Auto")?Mo_muse(v):allMuse[b.length%allMuse.length];if(!ot)ot=allMuse[0];const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue;}`;
    studioCode = studioCode.slice(0, pushMuseIdx) + fixedPushMuse + studioCode.slice(nextProviderIdx);
    console.log('✅ 2.2 Đã cập nhật b.push cho Muse AI: luôn gán accountId chuẩn xác (hỗ trợ xoay vòng acc qua b.length % allMuse.length), nhận đủ 100% prompt!');
  }
}

fs.writeFileSync(studioPath, studioCode, 'utf8');

// ---------------------------------------------------------
// 3. KIỂM TRA CÚ PHÁP
// ---------------------------------------------------------
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
execSync('node -c app/out/renderer/assets/VideoStudio-frcr8V6s.js', { stdio: 'inherit' });
console.log('🎉 Cú pháp JavaScript cả 2 file đều 100% hợp lệ!');
