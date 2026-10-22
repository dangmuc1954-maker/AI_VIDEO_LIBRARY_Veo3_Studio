const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(targetFile, 'utf8');

console.log('[*] Bắt đầu áp dụng bản vá tối ưu hóa hàng đợi & tài khoản...');

// 1. Patch canRunJobSession: Bỏ chặn viewState === "Attaching"
const oldCanRun = 'canRunJobSession(e){if(!e)return!0;const t=this.sessions.find(A=>A.accountId===e);return!t||t.disabled===!1&&t.viewState!=="Needs Attention"&&t.viewState!=="Attaching"&&!ct(t)}';
const newCanRun = 'canRunJobSession(e){if(!e)return!0;const t=this.sessions.find(A=>A.accountId===e);return!t||t.disabled===!1&&t.viewState!=="Needs Attention"&&!ct(t)}';

if (code.includes(oldCanRun)) {
  code = code.replace(oldCanRun, newCanRun);
  console.log('  ✓ 1. Đã mở khóa canRunJobSession (bỏ chặn Attaching)');
} else {
  console.log('  ⚠️ 1. Không tìm thấy oldCanRun chính xác, kiểm tra lại.');
}

// 2. Patch muse_def: Bỏ /auth/i trong loginUrlPatterns
const oldMuseDef = 'muse_def={definition:{...muse_sc,loginUrlPatterns:[/login/i,/sign-in/i,/auth/i],readyUrlPatterns:[/muse\\.ai/i]}';
const newMuseDef = 'muse_def={definition:{...muse_sc,loginUrlPatterns:[/login/i,/sign-in/i],readyUrlPatterns:[/muse\\.ai/i]}';

if (code.includes(oldMuseDef)) {
  code = code.replace(oldMuseDef, newMuseDef);
  console.log('  ✓ 2. Đã sửa loginUrlPatterns của Muse AI (bỏ /auth/i)');
} else {
  console.log('  ⚠️ 2. Không tìm thấy oldMuseDef chính xác, kiểm tra lại.');
}

// 3. Patch applyPageSnapshot: Tự nhận diện Muse AI có cookie là Logged In
const oldSnap = 'if(t.authStatus==="Logged In"&&s==="Logged Out"){const isActualLogin=/accounts\\.google\\.com\\/(signin|ServiceLogin|identifier)|login|sign-?in/i.test(e.url);if(!isActualLogin||(e.cookieCount&&e.cookieCount>5)){s="Logged In"}}';
const newSnap = 'if(t.authStatus==="Logged In"&&s==="Logged Out"){const isActualLogin=/accounts\\.google\\.com\\/(signin|ServiceLogin|identifier)|login|sign-?in/i.test(e.url);if(!isActualLogin||(e.cookieCount&&e.cookieCount>5)){s="Logged In"}};if((t.providerId==="muse"||t.providerId==="muse-ai"||(e.url&&e.url.includes("muse.ai")))&&e.cookieCount&&e.cookieCount>0){s="Logged In"}';

if (code.includes(oldSnap)) {
  code = code.replace(oldSnap, newSnap);
  console.log('  ✓ 3. Đã bổ sung auto-recognize Logged In cho Muse AI trong applyPageSnapshot');
} else {
  console.log('  ⚠️ 3. Không tìm thấy oldSnap chính xác, kiểm tra lại.');
}

// 4. Patch _B: Nâng cấp bộ điều phối Muse AI linh hoạt 100%, không bao giờ kẹt rỗng
const oldB = 'function _B(r,e){if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video")){const allMuse=T.listSessions().filter(s=>(s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai")))&&!s.disabled&&s.authStatus==="Logged In");const availMuse=allMuse.filter(s=>!ct(s));const pool=availMuse.length>0?availMuse:allMuse;if(r.accountId&&pool.some(p=>p.accountId===r.accountId)){const matched=pool.find(p=>p.accountId===r.accountId);return{accountId:matched.accountId,account:matched.accountName||matched.accountDisplayName||"Muse AI"}}if(pool.length>0){global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;const ms=pool[(global.__muse_dispatch_counter-1)%pool.length];return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"}}}return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account}}';

const newB = `function _B(r,e){
  if(r.type==="Video"&&(r.providerId==="muse"||r.provider==="Muse AI"||(r.provider&&r.provider.toLowerCase().includes("muse"))||r.payload?.model==="muse-video")){
    const allMuse=T.listSessions().filter(s=>(s.providerId==="muse"||s.providerId==="muse-ai"||(s.provider&&s.provider.toLowerCase().includes("muse"))||(s.startUrl&&s.startUrl.includes("muse.ai"))||(s.currentUrl&&s.currentUrl.includes("muse.ai")))&&!s.disabled);
    const loggedMuse=allMuse.filter(s=>s.authStatus==="Logged In"||(s.cookieCount&&s.cookieCount>0));
    const availMuse=(loggedMuse.length>0?loggedMuse:allMuse).filter(s=>!ct(s));
    const pool=availMuse.length>0?availMuse:(loggedMuse.length>0?loggedMuse:allMuse);
    if(r.accountId&&pool.some(p=>p.accountId===r.accountId)){
      const matched=pool.find(p=>p.accountId===r.accountId);
      return{accountId:matched.accountId,account:matched.accountName||matched.accountDisplayName||"Muse AI"};
    }
    if(pool.length>0){
      global.__muse_dispatch_counter=(global.__muse_dispatch_counter||0)+1;
      const ms=pool[(global.__muse_dispatch_counter-1)%pool.length];
      return{accountId:ms.accountId,account:ms.accountName||ms.accountDisplayName||"Muse AI"};
    }
    if(r.accountId){
      return{accountId:r.accountId,account:r.account};
    }
    if(allMuse.length>0){
      return{accountId:allMuse[0].accountId,account:allMuse[0].accountName||allMuse[0].accountDisplayName||"Muse AI"};
    }
  }
  return ud(r)?jB(r,e):ea(r)?xB(r,e):{accountId:r.accountId,account:r.account};
}`.replace(/\n\s*/g, '');

if (code.includes(oldB)) {
  code = code.replace(oldB, newB);
  console.log('  ✓ 4. Đã nâng cấp bộ điều phối _B cho Muse AI');
} else {
  console.log('  ⚠️ 4. Không tìm thấy oldB chính xác, kiểm tra lại.');
}

// 5. Patch JB: Mở khóa claim job cho Muse AI & Google Flow, không để kẹt hàng đợi
const oldJB = 'function JB(r){return ce.canClaimQueueJobSync(r)?eo(r)?!r.accountId||!T.canRunJobSession(r.accountId)?!1:ta(r.accountId)?!0:(to(r.accountId,"claim"),!1):T.canRunJobSession(r.accountId):!1}';

const newJB = `function JB(r){
  if(!ce.canClaimQueueJobSync(r))return!1;
  if(r.providerId==="muse"||r.provider==="Muse AI"||r.payload?.model==="muse-video"||(r.provider&&r.provider.toLowerCase().includes("muse")))return!0;
  if(eo(r)){
    if(!r.accountId)return!0;
    if(!T.canRunJobSession(r.accountId))return!1;
    if(ta(r.accountId))return!0;
    to(r.accountId,"claim");
    return!0;
  }
  return T.canRunJobSession(r.accountId);
}`.replace(/\n\s*/g, '');

if (code.includes(oldJB)) {
  code = code.replace(oldJB, newJB);
  console.log('  ✓ 5. Đã nâng cấp JB function mở khóa Queue Worker');
} else {
  console.log('  ⚠️ 5. Không tìm thấy oldJB chính xác, kiểm tra lại.');
}

// Ghi đè file
fs.writeFileSync(targetFile, code, 'utf8');
console.log('✅ Đã ghi đè app/out/main/index.js thành công!');
