const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== [MASTER PATCH] FIX TÀI KHOẢN MUSE AI & KHẮC PHỤC KẸT HÀNG CHỜ ===');

// =========================================================================
// 1. SỬA app/out/main/index.js
// =========================================================================
const mainFile = path.resolve('app/out/main/index.js');
let mainCode = fs.readFileSync(mainFile, 'utf8');

// 1.1 Chặn regex /^\d+$/ trong isBadName (không coi số "1", "2" là tên user)
const badNameTarget = `if (!normalized || normalized.includes('@') || normalized.length > 80) return true;`;
const badNameReplacement = `if (!normalized || normalized.includes('@') || normalized.length > 80) return true; if (/^\\d+$/.test(normalized)) return true;`;
if (mainCode.includes(badNameTarget) && !mainCode.includes(badNameReplacement)) {
  mainCode = mainCode.replace(badNameTarget, badNameReplacement);
  console.log('✅ 1.1 Đã thêm kiểm tra số thuần tuý vào isBadName');
}

// 1.2 Chặn regex /^\d+$/ trong iu(r)
const iuTarget = `return!(!e||e.length>80||/^(default|null|undefined|true|false|none|unknown)$/i.test(e)||`;
const iuReplacement = `return!(!e||e.length>80||/^\\d+$/.test(e)||/^(default|null|undefined|true|false|none|unknown)$/i.test(e)||`;
if (mainCode.includes(iuTarget) && !mainCode.includes(iuReplacement)) {
  mainCode = mainCode.replace(iuTarget, iuReplacement);
  console.log('✅ 1.2 Đã thêm kiểm tra số thuần tuý vào iu(r)');
}

// 1.3 Cập nhật hydration để tự động đặt tên Muse AI #1, Muse AI #2 nếu tên cũ bị gán số 1
const hydrateTarget = `const g=ot(A.accountDisplayName),u=ot(A.accountName),d=A.accountEmail?A.accountEmail.split("@")[0]:void 0,l=g||u||d||A.accountEmail||A.accountName||"Account";`;
const hydrateReplacement = `const g=ot(A.accountDisplayName),u=ot(A.accountName),d=A.accountEmail?A.accountEmail.split("@")[0]:void 0;let l=g||u||d||A.accountEmail||A.accountName||"Account";if(s==="muse"&&(!l||/^\\d+$/.test(String(l).trim()))){l=A.accountId?.includes("1791770852638")?"Muse AI #1":A.accountId?.includes("1791782221593")?"Muse AI #2":"Muse AI"}`;
if (mainCode.includes(hydrateTarget)) {
  mainCode = mainCode.replace(hydrateTarget, hydrateReplacement);
  console.log('✅ 1.3 Đã cập nhật session hydration đặt tên chuẩn Muse AI #1 / #2');
}

// 1.4 Sửa hàm _B: Chỉ lấy session Muse AI thực sự, loại bỏ custom-* của Flow, giữ accountId nếu hợp lệ
const old_B_match = mainCode.match(/function _B\(r,e\)\{if\(r\.type==="Video"&&\(r\.providerId==="muse"[^}]+return ud\(r\)\?jB\(r,e\):ea\(r\)\?xB\(r,e\):\{accountId:r\.accountId,account:r\.account\}\}/);
const clean_B = `function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video")){if(r.accountId&&r.payload?.accountSelection==="manual"&&r.account!=="Generated account")return{accountId:r.accountId,account:r.account};const allMuse=T.listSessions().filter(s=>(s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai")))&&!s.disabled&&s.authStatus==="Logged In");const availMuse=allMuse.filter(s=>!ct(s));const pool=availMuse.length>0?availMuse:allMuse;if(pool.length>0){if(r.accountId&&pool.some(p=>p.accountId===r.accountId)){const matched=pool.find(p=>p.accountId===r.accountId);return{accountId:matched.accountId,account:matched.accountName||matched.accountDisplayName||"Muse AI"}}global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;const ms=pool[(global.__muse_dispatch_counter-1)%pool.length];return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}}return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}`;

if (old_B_match) {
  mainCode = mainCode.replace(old_B_match[0], clean_B);
  console.log('✅ 1.4 Đã chuẩn hóa hàm _B: Lọc session Muse AI sạch sẽ, không kẹt queue');
} else {
  console.log('⚠️ Không tìm thấy regex _B cũ, thử tìm thủ công');
}

// 1.5 Cập nhật MuseVideoRuntime.runJob: lọc sạch session và cookie domain
mainCode = mainCode.replace(
  `const allMuseSessions = (this.sessions?.listSessions ? this.sessions.listSessions() : (typeof T !== 'undefined' && T.listSessions ? T.listSessions() : [])).filter(s => \n      s.providerId === "muse" || \n      s.providerId === "muse-ai" ||\n      (s.provider && s.provider.toLowerCase().includes("muse")) || \n      (s.startUrl && s.startUrl.includes("muse.ai")) ||\n      s.providerId?.startsWith("custom-")\n    );`,
  `const allMuseSessions = (this.sessions?.listSessions ? this.sessions.listSessions() : (typeof T !== 'undefined' && T.listSessions ? T.listSessions() : [])).filter(s => (s.providerId === "muse" || s.providerId === "muse-ai" || (s.provider && s.provider.toLowerCase().includes("muse")) || (s.startUrl && s.startUrl.includes("muse.ai"))) && !s.disabled);`
);

fs.writeFileSync(mainFile, mainCode, 'utf8');
console.log('💾 Đã lưu app/out/main/index.js');

// =========================================================================
// 2. SỬA app/out/renderer/assets/VideoStudio-frcr8V6s.js
// =========================================================================
const studioFile = path.resolve('app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let studioCode = fs.readFileSync(studioFile, 'utf8');

// 2.1 Sửa Fe: Luôn định danh tài khoản Muse AI thành "Muse AI #1", "Muse AI #2" rõ ràng, không bị trùng Set
const oldFeMuse = `if(r==="Muse AI"||r==="muse ai"||r==="muse"){const ee=Array.from(new Set(museAccounts.filter(ae=>!ae.disabled).map(Tt)));return ee.length>0?["Auto",...ee]:["Auto"]}`;
const newFeMuse = `if(r==="Muse AI"||r==="muse ai"||r==="muse"){const valid=museAccounts.filter(ae=>!ae.disabled);const opts=valid.map((acc,idx)=>{const name=Tt(acc);if(!name||/^\\d+$/.test(String(name).trim())){return\`Muse AI #\${idx+1}\`}return name});const uniqueOpts=[];opts.forEach((name,idx)=>{let finalName=name;if(uniqueOpts.includes(finalName)){finalName=\`\${name} (\${idx+1})\`}uniqueOpts.push(finalName)});return uniqueOpts.length>0?["Auto",...uniqueOpts]:["Auto"]}`;

if (studioCode.includes(oldFeMuse)) {
  studioCode = studioCode.replace(oldFeMuse, newFeMuse);
  console.log('✅ 2.1 Đã sửa Fe trong VideoStudio hiển thị đủ Muse AI #1, Muse AI #2');
}

// 2.2 Sửa Mo_muse: Ánh xạ chuẩn xác từ tên / số / ID sang đúng account
const oldMoMuse = studioCode.match(/Mo_muse=r=>\{[^}]+return allMuse\[0\]\|\|null\}/)?.[0] ||
                  studioCode.match(/Mo_muse=r=>\{[^}]+return matched\}\}/)?.[0];

const newMoMuse = `Mo_muse=r=>{const q=String(r.account||"").trim().toLowerCase();if(!q||q==="auto"||q==="generated account")return null;const valid=museAccounts.filter(ae=>!ae.disabled);const matched=valid.find(C=>String(C.accountId||"").toLowerCase()===q||String(C.accountName||"").toLowerCase()===q||String(C.accountDisplayName||"").toLowerCase()===q||String(Tt(C)||"").toLowerCase()===q);if(matched)return matched;if(q.includes("#1")||q==="1")return valid[0]||null;if(q.includes("#2")||q==="2")return valid[1]||valid[0]||null;if(q.includes("#3")||q==="3")return valid[2]||valid[0]||null;return valid[0]||null}`;

const moIdx = studioCode.indexOf('Mo_muse=');
if (moIdx !== -1) {
  const moEnd = studioCode.indexOf(',St=async', moIdx);
  if (moEnd !== -1) {
    studioCode = studioCode.slice(0, moIdx) + newMoMuse + studioCode.slice(moEnd);
    console.log('✅ 2.2 Đã cập nhật Mo_muse ánh xạ đúng tài khoản theo #1, #2 hoặc tên');
  }
}

// 2.3 Sửa khối nạp lệnh Muse AI trong St: lọc sạch danh sách tài khoản, chia đều chuẩn round-robin
const musePushOld = studioCode.indexOf('if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){');
if (musePushOld !== -1) {
  const nextProvider = studioCode.indexOf('if(v.provider==="Grok")', musePushOld);
  if (nextProvider !== -1) {
    const fixedPush = `if(v.provider==="Muse AI"||v.provider==="muse ai"||(v.provider&&v.provider.toLowerCase().includes("muse"))){const validMuse=museAccounts.filter(ae=>!ae.disabled);if(validMuse.length===0){d.push("Chưa có tài khoản Muse AI nào trong Browser Hub! Vui lòng thêm hoặc đăng nhập Muse AI.");continue}let ot=null,isManual=false;if(!isAuto){ot=Mo_muse(v);isManual=!!ot;if(!ot){d.push(\`\${v.account} is not ready\`);continue}}else{ot=validMuse[museAutoIdx%validMuse.length];museAutoIdx++;isManual=false}const pid="muse";for(let Pt=0;Pt<v.count;Pt+=1)b.push({promptId:v.id,input:{title:v.title||v.prompt,type:"Video",providerId:pid,provider:"Muse AI",accountId:ot.accountId,account:isManual?v.account:(Tt(ot)||"Auto"),payload:{title:v.title||"",promptId:v.id,prompt:v.prompt,ratio:v.ratio||"16:9",mode:"Components",duration:v.duration||"10s",model:"muse-video",outputIndex:Pt,batchSize:v.count,generationRunId:c,generationRunCreatedAt:h,promptOrder:v.index,title:v.sceneName||v.title||("Cảnh "+v.index),batchIndex:Pt,account:isManual?v.account:(Tt(ot)||"Auto"),accountSelection:isManual?"manual":"auto",referenceAssetIds:ie.slice(0,6),resolutionName:"720p",preset:"custom",studioSource:"video-studio",autoMerge:f}}});continue;}`;
    studioCode = studioCode.slice(0, musePushOld) + fixedPush + studioCode.slice(nextProvider);
    console.log('✅ 2.3 Đã chuẩn hóa St b.push Muse AI: round-robin giữa các tài khoản hợp lệ');
  }
}

fs.writeFileSync(studioFile, studioCode, 'utf8');
console.log('💾 Đã lưu app/out/renderer/assets/VideoStudio-frcr8V6s.js');

// =========================================================================
// 3. SỬA app/out/renderer/assets/BrowserHub-44JPDUjK.js
// =========================================================================
const hubFile = path.resolve('app/out/renderer/assets/BrowserHub-44JPDUjK.js');
let hubCode = fs.readFileSync(hubFile, 'utf8');

const oldHubVe = `function ve(t){const a=t.accountEmail?t.accountEmail.split("@")[0]:void 0,s=qe(t.accountDisplayName),n=qe(t.accountName)||s||a||t.accountEmail||t.accountName;const _mSes=(t.provider&&t.provider.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))||t.providerId==="muse";return{accountId:t.accountId,providerId:_mSes?"muse":t.providerId,provider:_mSes?"Muse AI":t.provider,account:n,displayName:s||n,`;

const newHubVe = `function ve(t){const a=t.accountEmail?t.accountEmail.split("@")[0]:void 0,s=qe(t.accountDisplayName),rawN=qe(t.accountName)||s||a||t.accountEmail||t.accountName;const _mSes=(t.provider&&t.provider.toLowerCase().includes("muse"))||(t.startUrl&&t.startUrl.includes("muse.ai"))||t.providerId==="muse";let n=rawN;if(_mSes&&(!n||/^\\d+$/.test(String(n).trim()))){n=t.accountId?.includes("1791770852638")?"Muse AI #1":t.accountId?.includes("1791782221593")?"Muse AI #2":"Muse AI"}return{accountId:t.accountId,providerId:_mSes?"muse":t.providerId,provider:_mSes?"Muse AI":t.provider,account:n,displayName:n,`;

if (hubCode.includes(oldHubVe)) {
  hubCode = hubCode.replace(oldHubVe, newHubVe);
  console.log('✅ 3. Đã sửa BrowserHub hiển thị tên Muse AI #1, Muse AI #2 đẹp mắt');
  fs.writeFileSync(hubFile, hubCode, 'utf8');
}

// =========================================================================
// 4. KIỂM TRA CÚ PHÁP JAVASCRIPT
// =========================================================================
execSync('node -c app/out/main/index.js', { stdio: 'inherit' });
execSync('node -c app/out/renderer/assets/VideoStudio-frcr8V6s.js', { stdio: 'inherit' });
execSync('node -c app/out/renderer/assets/BrowserHub-44JPDUjK.js', { stdio: 'inherit' });
console.log('🎉 TẤT CẢ FILE JAVASCRIPT ĐỀU HỢP LỆ CÚ PHÁP 100%!');
