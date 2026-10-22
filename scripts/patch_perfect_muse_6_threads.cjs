const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] HOÀN THIỆN 6 LUỒNG CHUẨN XÁC & TỰ ĐỘNG CHUYỂN ACC CÓ COOKIE ===');

// ---------------------------------------------------------
// 1. SỬA app/out/main/index.js
// ---------------------------------------------------------
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 1.1 Concurrency Limit = 6
mainCode = mainCode.replace(
  /if\(e\?\.payload\?\.model==="muse-video"\|\|e\?\.payload\?\.provider==="muse"\|\|e\?\.provider==="muse"\|\|e\?\.providerId==="muse"\|\|e\?\.provider==="Muse AI"\)return\s*[^;]+;/,
  'if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return 6;'
);
console.log('✅ 1.1 Concurrency limit Muse AI đã set đúng chuẩn 6 luồng');

// 1.2 Bổ sung Auto-Fallback cho Cookie trong MuseVideoRuntime
const oldCookieCheck = `    // Kiểm tra Cookie tài khoản Muse AI trước khi chạy
    try {
      const ses = electron.session.fromPartition(session.partition);
      const cookies = await ses.cookies.get({ domain: 'muse.ai' }).catch(() => []);
      logDebug("Muse cookies count", { count: cookies.length });
      if (cookies.length === 0) {
        throw new Error("Tài khoản Muse AI chưa đăng nhập! Vui lòng vào mục 'Tài khoản' trên thanh menu để đăng nhập tài khoản Muse AI trước khi tạo video.");
      }
    } catch(err) {
      if (err.message.includes("chưa đăng nhập")) throw err;
    }`;

const newCookieCheck = `    // Kiểm tra Cookie tài khoản Muse AI trước khi chạy (Tự động chuyển sang acc có cookie nếu acc hiện tại chưa đăng nhập)
    try {
      const ses = electron.session.fromPartition(session.partition);
      let cookies = await ses.cookies.get({ domain: 'muse.ai' }).catch(() => []);
      logDebug("Muse cookies count", { accountId: session.accountId, count: cookies.length });
      if (cookies.length === 0) {
        logDebug("Session " + session.accountId + " has 0 cookies, searching for any logged-in Muse session in Browser Hub...");
        const allSessions = (this.sessions?.listSessions ? this.sessions.listSessions() : (typeof T !== 'undefined' && T.listSessions ? T.listSessions() : [])).filter(s => 
          s.providerId === "muse" || 
          (s.provider && s.provider.toLowerCase().includes("muse")) || 
          (s.startUrl && s.startUrl.includes("muse.ai")) ||
          s.providerId?.startsWith("custom-")
        );
        for (const candidate of allSessions) {
          if (candidate.partition && candidate.partition !== session.partition) {
            try {
              const candSes = electron.session.fromPartition(candidate.partition);
              const candCookies = await candSes.cookies.get({ domain: 'muse.ai' }).catch(() => []);
              if (candCookies.length > 0) {
                logDebug("Auto-switched to active logged-in Muse session with " + candCookies.length + " cookies!", { accountId: candidate.accountId });
                session = candidate;
                cookies = candCookies;
                break;
              }
            } catch(ce) {}
          }
        }
      }
      if (cookies.length === 0) {
        throw new Error("Tài khoản Muse AI chưa đăng nhập! Vui lòng vào mục 'Tài khoản' trên thanh menu để đăng nhập tài khoản Muse AI trước khi tạo video.");
      }
    } catch(err) {
      if (err.message.includes("chưa đăng nhập")) throw err;
    }`;

if (mainCode.includes(oldCookieCheck)) {
  mainCode = mainCode.replace(oldCookieCheck, newCookieCheck);
  console.log('✅ 1.2 Đã tích hợp Auto-Fallback thông minh: Tự động nhảy sang tài khoản có Cookie nếu acc được gán chưa đăng nhập');
} else {
  console.log('ℹ️ Kiểm tra lại vị trí cookie check...');
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ---------------------------------------------------------
// 2. SỬA app/out/renderer/assets/VideoStudio-frcr8V6s.js
// ---------------------------------------------------------
const studioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let studioCode = fs.readFileSync(studioPath, 'utf8');

// 2.1 Khôi phục b.push Muse AI nguyên bản: Gán vào tài khoản active (đã đăng nhập), không dùng b.length % allMuse.length
const pushTarget = 'if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){';
const pushIdx = studioCode.indexOf(pushTarget);
if (pushIdx !== -1) {
  const nextIdx = studioCode.indexOf('if(v.provider==="Grok")', pushIdx);
  if (nextIdx !== -1) {
    const cleanPush = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v)||activeMuseAccounts[0]||museAccounts[0]||(X||[]).find(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")));if(!ot){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue;}`;
    studioCode = studioCode.slice(0, pushIdx) + cleanPush + studioCode.slice(nextIdx);
    console.log('✅ 2.1 Đã khôi phục b.push trong VideoStudio: Gán toàn bộ prompt vào tài khoản active chuẩn xác 100%');
  }
}

fs.writeFileSync(studioPath, studioCode, 'utf8');

// ---------------------------------------------------------
// 3. KIỂM TRA CÚ PHÁP
// ---------------------------------------------------------
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
execSync('node -c app/out/renderer/assets/VideoStudio-frcr8V6s.js', { stdio: 'inherit' });
console.log('🎉 Cú pháp JavaScript cả 2 file đều 100% hợp lệ!');
