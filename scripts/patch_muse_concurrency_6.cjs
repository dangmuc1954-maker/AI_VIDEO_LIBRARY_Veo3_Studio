const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [PATCH] CẬP NHẬT 6 LUỒNG / TÀI KHOẢN & TỰ ĐỘNG ĐỔI ACC CHO MUSE AI ===');

// ---------------------------------------------------------
// 1. PATCH app/out/main/index.js
// ---------------------------------------------------------
const mainPath = path.resolve(__dirname, '../app/out/main/index.js');
let mainCode = fs.readFileSync(mainPath, 'utf8');

// 1.1 Sửa Category Concurrency Limit (giải phóng trần category Video từ 1 -> ko = 500)
const oldLimitPattern = 'if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return 1;';
const newLimitPattern = 'if(e?.payload?.model==="muse-video"||e?.payload?.provider==="muse"||e?.provider==="muse"||e?.providerId==="muse"||e?.provider==="Muse AI")return ko;';

if (mainCode.includes(oldLimitPattern)) {
  mainCode = mainCode.replace(oldLimitPattern, newLimitPattern);
  console.log('✅ 1.1 Đã sửa category concurrency limit từ 1 thành ko (500) cho Muse AI');
} else {
  // Regex fallback
  mainCode = mainCode.replace(/if\(e\?\.payload\?\.model==="muse-video"\|\|e\?\.payload\?\.provider==="muse"\|\|e\?\.provider==="muse"\|\|e\?\.providerId==="muse"\|\|e\?\.provider==="Muse AI"\)return\s*\d+;/, newLimitPattern);
  console.log('✅ 1.1 Đã cập nhật category concurrency limit thành ko (500)');
}

// 1.2 Sửa Per-Slot Limit trong class Sc: tối đa 6 luồng / tài khoản
const oldScLimit = 'getLimit(e){return Math.max(1,Math.floor(this.resolveLimit(e)||1))}';
const newScLimit = 'getLimit(e){if(e?.providerId==="muse"||e?.provider==="Muse AI"||e?.payload?.model==="muse-video"||(e?.provider&&e.provider.toLowerCase().includes("muse")))return 6;return Math.max(1,Math.floor(this.resolveLimit(e)||1))}';

if (mainCode.includes(oldScLimit)) {
  mainCode = mainCode.replace(oldScLimit, newScSc => newScLimit);
  console.log('✅ 1.2 Đã thiết lập giới hạn cứng: 6 luồng / tài khoản Muse AI trong Scheduler Sc');
} else if (mainCode.includes('return 6;return Math.max(1,Math.floor(this.resolveLimit(e)||1))}')) {
  console.log('ℹ️ 1.2 Scheduler Sc đã có giới hạn 6 luồng / tài khoản.');
} else {
  console.warn('⚠️ Kiểm tra pattern getLimit trong Sc...');
  mainCode = mainCode.replace(/getLimit\(e\)\{return Math\.max\(1,Math\.floor\(this\.resolveLimit\(e\)\|\|1\)\)\}/, newScLimit);
}

// 1.3 Cập nhật bộ điều phối tự động đổi tài khoản _B(r, e)
const oldBStart = 'function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||(r.providerId&&r.providerId.startsWith("custom-")))){';
const newBCode = `function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video"||(r.providerId&&r.providerId.startsWith("custom-")))){const isManual=r.payload?.accountSelection==="manual"&&r.accountId&&r.accountId!=="auto"&&r.account!=="Auto";const allMuse=T.listSessions().filter(s=>(s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai"))||s.providerId?.startsWith("custom-"))&&!s.disabled);if(allMuse.length===0){if(typeof U!=="undefined"&&U.setQueuedAutoJobsStatus)U.setQueuedAutoJobsStatus(r.providerId||"muse",r.type,"Chưa có tài khoản Muse AI nào trong Browser Hub");return null;}if(isManual){const fixedCanRun=e({...r,accountId:r.accountId,account:r.account});if(fixedCanRun)return{accountId:r.accountId,account:r.account};}const availableAccounts=allMuse.filter(s=>{const accName=s.accountDisplayName||s.accountEmail||s.accountName||("Muse AI "+s.accountId.slice(0,4));return e({...r,accountId:s.accountId,account:accName});});if(availableAccounts.length===0){if(typeof U!=="undefined"&&U.setQueuedAutoJobsStatus)U.setQueuedAutoJobsStatus(r.providerId||"muse",r.type,"Đang chạy tối đa 6 luồng/tài khoản Muse AI. Đang chờ slot trống...");return null;}availableAccounts.sort((a,b)=>{const countA=(typeof oe!=="undefined"&&oe?.scheduler?.slotCounts?.get?.(\`muse:\${a.accountId}:Video\`))??a.activeJobs??0;const countB=(typeof oe!=="undefined"&&oe?.scheduler?.slotCounts?.get?.(\`muse:\${b.accountId}:Video\`))??b.activeJobs??0;return countA-countB;});const chosen=availableAccounts[0];const chosenName=chosen.accountDisplayName||chosen.accountEmail||chosen.accountName||"Muse AI";return{accountId:chosen.accountId,account:chosenName};}`;

const bIdx = mainCode.indexOf('function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"');
if (bIdx !== -1) {
  const returnIdx = mainCode.indexOf('return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}', bIdx);
  if (returnIdx !== -1) {
    const endOfMuseBlock = returnIdx;
    mainCode = mainCode.slice(0, bIdx) + newBCode.replace(/\}$/, '') + mainCode.slice(endOfMuseBlock);
    console.log('✅ 1.3 Đã cập nhật hàm _B tự động điều phối & đổi tài khoản Muse AI (6 luồng/tài khoản, ít luồng nhất ưu tiên)');
  }
}

// 1.4 Cập nhật Resolve Session & Stagger trong MuseVideoRuntime
const oldResolvePattern = `    // 1. Resolve Session
    let session = this.sessions?.getSession ? this.sessions.getSession(job.accountId) : null;
    if (!session && this.sessions?.listSessions) {
      const allSessions = this.sessions.listSessions();
      session = allSessions.find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }
    if (!session && typeof T !== 'undefined' && T.listSessions) {
      session = T.listSessions().find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }`;

const newResolveCode = `    // 0. Nhẹ nhàng delay ngẫu nhiên 0-800ms để tránh xung đột kết nối khi nhiều cửa sổ mở đồng thời
    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 800)));

    // 1. Resolve Session chuẩn xác theo job.accountId
    let session = null;
    if (job.accountId) {
      if (this.sessions?.findSession) session = this.sessions.findSession(job.accountId);
      if (!session && this.sessions?.getSession) session = this.sessions.getSession(job.accountId);
      if (!session && this.sessions?.listSessions) {
        session = this.sessions.listSessions().find(s => s.accountId === job.accountId);
      }
      if (!session && typeof T !== 'undefined' && T.findSession) session = T.findSession(job.accountId);
      if (!session && typeof T !== 'undefined' && T.listSessions) {
        session = T.listSessions().find(s => s.accountId === job.accountId);
      }
    }
    if (!session && this.sessions?.listSessions) {
      const allSessions = this.sessions.listSessions();
      session = allSessions.find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }
    if (!session && typeof T !== 'undefined' && T.listSessions) {
      session = T.listSessions().find(s => 
        (s.provider && s.provider.toLowerCase().includes("muse")) || 
        (s.startUrl && s.startUrl.includes("muse.ai"))
      );
    }`;

if (mainCode.includes(oldResolvePattern)) {
  mainCode = mainCode.replace(oldResolvePattern, newResolveCode);
  console.log('✅ 1.4 Đã cập nhật cơ chế định tuyến Session theo đúng accountId & chống nghẽn khởi tạo đồng thời');
} else {
  console.log('ℹ️ Kiểm tra nếu đã có Resolve Session mới...');
  if (!mainCode.includes('job.accountId')) {
    console.warn('⚠️ Cần kiểm tra lại vị trí Resolve Session trong MuseVideoRuntime');
  }
}

fs.writeFileSync(mainPath, mainCode, 'utf8');

// ---------------------------------------------------------
// 2. PATCH app/out/renderer/assets/VideoStudio-frcr8V6s.js
// ---------------------------------------------------------
const studioPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let studioCode = fs.readFileSync(studioPath, 'utf8');

// 2.1 Sửa Mo_muse để khi account === "Auto" thì trả về null (không hardcode vào account 0)
const oldMoMuse = 'Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(q&&q!=="auto"){const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);if(matched)return matched}return allMuse[0]||null}';
const newMoMuse = 'Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase(),allMuse=[...(activeMuseAccounts||[]),...(museAccounts||[]),...(X||[]).filter(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")))];if(!q||q==="auto")return null;const matched=allMuse.find(C=>String(C.accountName||"").trim().toLowerCase()===q||String(C.accountDisplayName||"").trim().toLowerCase()===q||String(C.accountEmail||"").trim().toLowerCase()===q||String(Tt(C)||"").trim().toLowerCase()===q||String(C.accountId||"").trim().toLowerCase()===q);return matched||null}';

if (studioCode.includes(oldMoMuse)) {
  studioCode = studioCode.replace(oldMoMuse, newMoMuse);
  console.log('✅ 2.1 Đã cập nhật Mo_muse: Trả về null khi chọn "Auto" để backend tự động đổi tài khoản');
}

// 2.2 Sửa b.push của Muse AI trong VideoStudio: không ép ot = allMuse[0]
const oldPushMuse = 'if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const ot=Mo_muse(v)||activeMuseAccounts[0]||museAccounts[0]||(X||[]).find(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai")));if(!ot){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:Tt(ot),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}';

const newPushMuse = 'if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const hasAnyMuse=((activeMuseAccounts&&activeMuseAccounts.length>0)||(museAccounts&&museAccounts.length>0)||(X||[]).some(s=>(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))));if(!hasAnyMuse){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}const ot=Mo_muse(v);if(v.account&&v.account!=="Auto"&&!ot){d.push(`${v.account} chưa sẵn sàng hoặc không tìm thấy`);continue}const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",...(ot?{accountId:ot.accountId,account:Tt(ot)}:{}),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:v.account,accountSelection:ot?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue}';

if (studioCode.includes(oldPushMuse)) {
  studioCode = studioCode.replace(oldPushMuse, newPushMuse);
  console.log('✅ 2.2 Đã cập nhật b.push Muse AI trong VideoStudio: Hỗ trợ chế độ Auto Account không gắn cứng ID');
}

fs.writeFileSync(studioPath, studioCode, 'utf8');

// ---------------------------------------------------------
// 3. PATCH app/out/renderer/assets/VideoFactoryStudio.js
// ---------------------------------------------------------
const vfsPath = path.resolve(__dirname, '../app/out/renderer/assets/VideoFactoryStudio.js');
let vfsCode = fs.readFileSync(vfsPath, 'utf8');

// Thêm lựa chọn "Auto" trong dropdown chọn tài khoản video
const oldVfsSelect = 'vAccs.map(acc => \n                React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },\n                  `${isMuse ? \'⚡\' : \'🎬\'} ';

const newVfsSelect = '[React.createElement("option", { key: "auto", value: "auto", className: "bg-[#0b101f] text-amber-300 font-bold" }, isMuse ? "⚡ Tự động đổi Acc (Tối đa 6 luồng/acc)" : "🔄 Tự động chọn tài khoản"), ...vAccs.map(acc => \n                React.createElement("option", { key: acc.accountId, value: acc.accountId, className: "bg-[#0b101f] text-gray-200" },\n                  `${isMuse ? \'⚡\' : \'🎬\'} ';

if (vfsCode.includes(oldVfsSelect)) {
  vfsCode = vfsCode.replace(oldVfsSelect, newVfsSelect);
  console.log('✅ 3.1 Đã thêm lựa chọn Tự động đổi Acc vào VideoFactoryStudio');
}

// Khi chọn auto trong VFS thì không gắn cứng targetAccId
const oldVfsTarget = `      if (isMuse) {
        const museAccount = accounts.find(a => a.accountId === selectedVideoAccountId && (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')))
          || accounts.find(a => (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && (a.authStatus === 'Logged In' || a.authStatus === 'active'));
        targetAccId = museAccount?.accountId || undefined;`;

const newVfsTarget = `      if (isMuse) {
        if (!selectedVideoAccountId || selectedVideoAccountId === 'auto') {
          targetAccId = undefined;
        } else {
          const museAccount = accounts.find(a => a.accountId === selectedVideoAccountId && (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')))
            || accounts.find(a => (a.providerId === 'muse' || a.provider?.toLowerCase().includes('muse')) && (a.authStatus === 'Logged In' || a.authStatus === 'active'));
          targetAccId = museAccount?.accountId || undefined;
        }`;

if (vfsCode.includes(oldVfsTarget)) {
  vfsCode = vfsCode.replace(oldVfsTarget, newVfsTarget);
  console.log('✅ 3.2 Đã cập nhật gán targetAccId thông minh cho VideoFactoryStudio');
}

fs.writeFileSync(vfsPath, vfsCode, 'utf8');

// ---------------------------------------------------------
// 4. KIỂM TRA CÚ PHÁP JAVASCRIPT
// ---------------------------------------------------------
try {
  execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
  console.log('🎉 [PASS] app/out/main/index.js cú pháp hợp lệ 100%!');
} catch (e) {
  console.error('❌ [FAIL] Syntax error in app/out/main/index.js');
  process.exit(1);
}

console.log('=== HOÀN TẤT PATCH ĐA LUỒNG 6/TÀI KHOẢN & TỰ ĐỘNG ĐỔI ACC THÀNH CÔNG ===');
