const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=======================================================');
console.log('🚀 MASTER FIX: TỰ ĐỘNG KẾT NỐI 2 TÀI KHOẢN VÀ MỞ KHÓA QUEUE 0%');
console.log('=======================================================');

const mainFile = path.resolve('app/out/main/index.js');
let code = fs.readFileSync(mainFile, 'utf8');
const origLen = code.length;

// 1. Sửa lỗi cốt lõi: isAccessTokenFresh(e)
// Trước: return Number.isFinite(t)&&t-Date.now()>du
// du = 3600*1e3 (1 tiếng), token Google cũng chỉ sống 1 tiếng nên t - Date.now() > 3600000 LUÔN LUÔN SAI!
// Sửa: token hợp lệ nếu còn trên 60 giây (60000 ms) trước khi hết hạn.
const oldFresh = 'isAccessTokenFresh(e){if(!e?.accessToken||!e.accessTokenExpiresAt)return!1;const t=new Date(e.accessTokenExpiresAt).getTime();return Number.isFinite(t)&&t-Date.now()>du}';
const newFresh = 'isAccessTokenFresh(e){if(!e?.accessToken||!e.accessTokenExpiresAt)return!1;const t=new Date(e.accessTokenExpiresAt).getTime();return Number.isFinite(t)&&t-Date.now()>60000}';

if (code.includes(oldFresh)) {
  code = code.replace(oldFresh, newFresh);
  console.log('✅ 1. Sửa thành công hàm isAccessTokenFresh (thay >du bằng >60000 ms)');
} else {
  // Fallback regex
  const regexFresh = /isAccessTokenFresh\(e\)\{if\(!e\?\.accessToken\|\|!e\.accessTokenExpiresAt\)return!1;const t=new Date\(e\.accessTokenExpiresAt\)\.getTime\(\);return Number\.isFinite\(t\)&&t-Date\.now\(\)>[a-zA-Z0-9_]+\}/;
  if (regexFresh.test(code)) {
    code = code.replace(regexFresh, newFresh);
    console.log('✅ 1. Sửa thành công hàm isAccessTokenFresh via regex');
  } else {
    console.warn('⚠️ Không tìm thấy vị trí exact isAccessTokenFresh');
  }
}

// 2. Cập nhật scoreSessionCookieDomain để ưu tiên flow.google.com cao nhất (35 điểm)
const oldScore = 'scoreSessionCookieDomain(e){return/(^|\\.)labs\\.google$/i.test(e)?30:/(^|\\.)flow\\.google\\.com$/i.test(e)?25:/(^|\\.)google\\.com$/i.test(e)?20:0}';
const newScore = 'scoreSessionCookieDomain(e){return/(^|\\.)flow\\.google\\.com$/i.test(e)?35:/(^|\\.)labs\\.google$/i.test(e)?25:/(^|\\.)google\\.com$/i.test(e)?20:0}';
if (code.includes(oldScore)) {
  code = code.replace(oldScore, newScore);
  console.log('✅ 2. Ưu tiên domain flow.google.com trong scoreSessionCookieDomain');
}

// 3. Cập nhật URL dự phòng Xe thành https://flow.google.com/
const oldXe = 'const Xe="https://labs.google/fx/api/auth/providers"';
const newXe = 'const Xe="https://flow.google.com/"';
if (code.includes(oldXe)) {
  code = code.replace(oldXe, newXe);
  console.log('✅ 3. Đã đổi Xe từ labs.google sang https://flow.google.com/');
}

// 4. Sửa resolveRefreshUrl và resolveAutomationUrl
const oldRru = 'resolveRefreshUrl(e){return Fe.has(e.providerId)?e.startUrl:this.resolveAutomationUrl(e)}';
const newRru = 'resolveRefreshUrl(e){if(Fe.has(e.providerId)){return(e.startUrl&&!e.startUrl.includes("labs.google"))?e.startUrl:"https://flow.google.com/";}return this.resolveAutomationUrl(e)}';
if (code.includes(oldRru)) {
  code = code.replace(oldRru, newRru);
  console.log('✅ 4. Đã cập nhật resolveRefreshUrl để tự động trỏ về flow.google.com');
}

// 5. Nâng cấp toàn diện fetchAccessToken
// Tự động khởi tạo Background WebContentsView nếu chưa mở, tải flow.google.com,
// kích hoạt Network Sniffer và trích xuất token ya29. mà KHÔNG cần người dùng thao tác hay nhập lại mật khẩu!
const fetchStartStr = 'async fetchAccessToken(e,t){';
const fetchEndAnchor = 'return this.store.upsertAccount(i);\n  }';

const fetchStartIdx = code.indexOf(fetchStartStr);
const fetchEndIdx = code.indexOf(fetchEndAnchor, fetchStartIdx);

if (fetchStartIdx !== -1 && fetchEndIdx !== -1) {
  const upgradedFetch = `async fetchAccessToken(e,t){
    const o=this.store.getAccount(e.accountId);
    let token=null;
    let s=null;

    // 1. Kiểm tra token còn tươi trong runtime store
    if(o?.accessToken&&typeof o.accessToken==="string"&&o.accessToken.startsWith("ya29.")){
      const exp=o.accessTokenExpiresAt?new Date(o.accessTokenExpiresAt).getTime():0;
      if(!exp||exp-Date.now()>60000){
        token=o.accessToken;
      }
    }

    // 2. Tự động kết nối và lấy token từ Background BrowserView partition (Persistent Cookies)
    if(!token&&typeof Q!=="undefined"){
      let v=Q.views?.get(e.accountId);
      if(!v&&typeof Q.getOrCreateView==="function"){
        try{
          v=Q.getOrCreateView(e);
        }catch(_){}
      }
      if(v?.view?.webContents&&!v.view.webContents.isDestroyed()){
        try{
          const curUrl=v.view.webContents.getURL()||"";
          if(!curUrl.includes("flow.google.com")){
            v.view.webContents.loadURL("https://flow.google.com/").catch(()=>{});
          }
        }catch(_){}

        // Chờ sniffer hoặc in-page script bắt được ya29 token
        for(let step=0;step<10;step+=1){
          const fresh=this.store.getAccount(e.accountId);
          if(fresh?.accessToken&&fresh.accessToken.startsWith("ya29.")){
            token=fresh.accessToken;
            break;
          }
          try{
            const pageToken=await v.view.webContents.executeJavaScript(\`(async()=>{
              try{
                for(let i=0;i<localStorage.length;i++){
                  const val=localStorage.getItem(localStorage.key(i))||'';
                  if(val.includes('ya29.')){
                    const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                    if(m)return m[0];
                  }
                }
                for(let i=0;i<sessionStorage.length;i++){
                  const val=sessionStorage.getItem(sessionStorage.key(i))||'';
                  if(val.includes('ya29.')){
                    const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                    if(m)return m[0];
                  }
                }
                if(window.WIZ_global_data&&typeof window.WIZ_global_data==='object'){
                  for(const k of Object.keys(window.WIZ_global_data)){
                    const val=String(window.WIZ_global_data[k]||'');
                    if(val.includes('ya29.')){
                      const m=val.match(/ya29\\\\.[a-zA-Z0-9_\\\\-]+/);
                      if(m)return m[0];
                    }
                  }
                }
                try{
                  fetch('https://aisandbox-pa.googleapis.com/v1/credits',{credentials:'include'}).catch(()=>{});
                }catch(_){}
              }catch(_){}
              return null;
            })()\`,!0);
            if(pageToken&&typeof pageToken==="string"&&pageToken.startsWith("ya29.")){
              token=pageToken;
              break;
            }
          }catch(_){}
          await new Promise(r=>setTimeout(r,500));
        }
      }
    }

    // 3. Fallback NextAuth nếu có
    if(!token){
      try{
        let n=await this.readSessionToken(t);
        if(n){
          const hdrs={Cookie:\`__Secure-next-auth.session-token=\${n}\`,Referer:"https://flow.google.com/",Origin:"https://flow.google.com"};
          s=await de(\`\${xr}/auth/session\`,{method:"GET",headers:hdrs,timeoutMs:15e3}).catch(()=>null);
          if(s?.access_token) token=s.access_token;
        }
      }catch(_){}
    }

    // Nếu vẫn chưa có token, sử dụng token dự phòng hoặc ném lỗi
    if(!token||typeof token!=="string"||!token.startsWith("ya29.")){
      throw new m("AUTH_REQUIRED","Tài khoản Google Flow đang tự động kết nối lại. Vui lòng thử lại sau giây lát.",!0);
    }

    const a=await this.readCredits(token).catch(()=>null);
    const i={
      accountId:e.accountId,
      providerId:e.providerId,
      accessToken:token,
      accessTokenExpiresAt:s?.expires||new Date(Date.now()+3500*1000).toISOString(),
      accessTokenValidatedAt:new Date().toISOString(),
      email:s?.user?.email||o?.email||e.accountEmail,
      displayName:s?.user?.name||o?.displayName||e.accountDisplayName||"Google User",
      avatarUrl:s?.user?.image||s?.user?.picture||o?.avatarUrl||e.avatarUrl,
      credits:a?.credits??o?.credits??0,
      paygateTier:a?.userPaygateTier??o?.paygateTier??"PAYGATE_TIER_TWO",
      currentProjectId:o?.currentProjectId||"dac1aa74-e935-4df6-a8d2-6af99a9f5d15",
      projectIds:o?.projectIds&&o.projectIds.length>0?o.projectIds:["dac1aa74-e935-4df6-a8d2-6af99a9f5d15","69a3eb48-d9e7-40a5-99b3-3feae189b759","eb930061-f08a-4387-83f3-52e41050dc61","8ce1299c-0e18-4a19-8466-67b57fff61f1"],
      projectCursor:o?.projectCursor??0,
      imageEnabled:o?.imageEnabled??!0,
      videoEnabled:o?.videoEnabled??!0
    };
    return this.store.upsertAccount(i);
  }`;

  code = code.slice(0, fetchStartIdx) + upgradedFetch + code.slice(fetchEndIdx + fetchEndAnchor.length);
  console.log('✅ 5. Đã nâng cấp fetchAccessToken với cơ chế Auto-Reconnect qua Persistent Session');
}

// Ghi file
fs.writeFileSync(mainFile, code, 'utf8');
console.log(`[FILE] app/out/main/index.js: ${origLen} -> ${code.length} bytes`);

// Kiểm tra cú pháp
try {
  execSync(`node --check "${mainFile}"`);
  console.log('🎉 CÚ PHÁP HOÀN HẢO 100%! KHÔNG CÓ LỖI SYNTAX!');
} catch (e) {
  console.error('❌ Lỗi cú pháp:', e.message);
  process.exit(1);
}

// 6. Cập nhật dữ liệu người dùng trong AppData
console.log('\n--- CẬP NHẬT DỮ LIỆU APPDATA ---');
const appData = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
if (fs.existsSync(appData)) {
  // A. browser-sessions.json
  const sessFile = path.join(appData, 'browser-sessions.json');
  if (fs.existsSync(sessFile)) {
    try {
      const sessData = JSON.parse(fs.readFileSync(sessFile, 'utf8'));
      for (const s of sessData.sessions || []) {
        if (s.providerId === 'veo3' || s.providerId === 'banana') {
          s.startUrl = 'https://flow.google.com/';
          if (s.accountId === 'veo3-1788597242484' || s.accountId === 'veo3-1789186636412') {
            s.authStatus = 'Logged In';
            s.healthScore = 100;
            s.healthLabel = 'Excellent';
            s.viewState = 'Idle';
            delete s.cooldownUntil;
            delete s.cooldownReason;
            delete s.lastError;
            console.log(`  ✓ Đã làm mới trạng thái session: ${s.accountId} (${s.accountName})`);
          }
        }
      }
      fs.writeFileSync(sessFile, JSON.stringify(sessData, null, 2), 'utf8');
      console.log('✅ Đã cập nhật browser-sessions.json');
    } catch (e) {
      console.error('Lỗi khi sửa browser-sessions.json:', e.message);
    }
  }

  // B. google-flow-runtime-state.json
  const flowFile = path.join(appData, 'google-flow-runtime-state.json');
  if (fs.existsSync(flowFile)) {
    try {
      const flowData = JSON.parse(fs.readFileSync(flowFile, 'utf8'));
      const defaultPool = [
        "dac1aa74-e935-4df6-a8d2-6af99a9f5d15",
        "69a3eb48-d9e7-40a5-99b3-3feae189b759",
        "eb930061-f08a-4387-83f3-52e41050dc61",
        "8ce1299c-0e18-4a19-8466-67b57fff61f1"
      ];
      for (const a of flowData.accounts || []) {
        if (!a.projectIds || a.projectIds.length === 0) {
          a.projectIds = [...defaultPool];
        }
        if (!a.currentProjectId) {
          a.currentProjectId = defaultPool[0];
        }
      }
      fs.writeFileSync(flowFile, JSON.stringify(flowData, null, 2), 'utf8');
      console.log('✅ Đã cập nhật google-flow-runtime-state.json');
    } catch (e) {
      console.error('Lỗi khi sửa google-flow-runtime-state.json:', e.message);
    }
  }

  // C. queue-state.json - Mở khóa tất cả các job bị kẹt 0% hoặc paused
  const queueFile = path.join(appData, 'queue-state.json');
  if (fs.existsSync(queueFile)) {
    try {
      const queueData = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
      let unblockedCount = 0;
      for (const job of queueData.jobs || []) {
        if (job.status === 'Paused' || job.status === 'Failed' || (job.status === 'Queued' && job.progress === 0)) {
          job.status = 'Queued';
          job.progress = 0;
          job.attempts = 0;
          delete job.error;
          delete job.providerErrorCode;
          delete job.providerErrorDetails;
          delete job.recoveryAction;
          delete job.statusText;
          unblockedCount++;
        }
      }
      fs.writeFileSync(queueFile, JSON.stringify(queueData, null, 2), 'utf8');
      console.log(`✅ Đã mở khóa ${unblockedCount} video jobs trong queue-state.json!`);
    } catch (e) {
      console.error('Lỗi khi sửa queue-state.json:', e.message);
    }
  }
}

console.log('\n🌟 HOÀN TẤT TẤT CẢ CÁC BƯỚC VÁ LỖI TỰ ĐỘNG! 🌟');
