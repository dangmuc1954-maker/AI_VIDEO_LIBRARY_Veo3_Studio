const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(targetPath, 'utf8');
console.log('[*] Original app/out/main/index.js length:', code.length);

// 1. Tối ưu cooldown: Không bao giờ khóa 15 phút gây tê liệt hệ thống
const oldCdCalc = 'const cdMs=this.getAccountCooldownMs(t)||(t.code==="RATE_LIMITED"?6e4:15*6e4);';
const newCdCalc = 'const cdMs=this.getAccountCooldownMs(t)||(t.code==="RATE_LIMITED"?3e4:5e3);';

if (code.includes(oldCdCalc)) {
  code = code.replace(oldCdCalc, newCdCalc);
  console.log('  ✓ Đã cập nhật phép tính cdMs tránh fallback 15 phút');
}

const oldGetCd = 'getAccountCooldownMs(e){if(!e)return 15*6e4;if(e.code==="RATE_LIMITED"||/rate[ _-]?limit|too many requests|429/i.test(e.message||""))return 6e4;if(e.code==="NETWORK")return 3e3+Math.floor(Math.random()*2001);if(e.code==="QUOTA_EXCEEDED"||e.code==="RESOURCE_EXHAUSTED"||/quota|exhausted|credit|hết quota|hạn mức/i.test(e.message||""))return 15*6e4;return 15*6e4}';
const newGetCd = 'getAccountCooldownMs(e){if(!e)return 5e3;if(e.code==="CHALLENGE_REQUIRED"||/unusual|xác minh/i.test(e.message||""))return 5e3;if(e.code==="RATE_LIMITED"||/rate[ _-]?limit|too many requests|429/i.test(e.message||""))return 3e4;if(e.code==="NETWORK")return 3e3+Math.floor(Math.random()*2001);if(e.code==="QUOTA_EXCEEDED"||e.code==="RESOURCE_EXHAUSTED"||/quota|exhausted|credit|hết quota|hạn mức/i.test(e.message||""))return 6e4;return 5e3}';

if (code.includes(oldGetCd)) {
  code = code.replace(oldGetCd, newGetCd);
  console.log('  ✓ Đã cập nhật getAccountCooldownMs: chỉ hạ nhiệt 5s thay vì 15 phút');
}

// 2. Tự động đóng Popup "Tools from creators like you" & đảm bảo view sẵn sàng
const oldEnsureView = `const n=!!(o&&this.isGoogleFlowUrl(o));let a=!1;if(n&&(a=await A.view.webContents.executeJavaScript("Boolean(window.WIZ_global_data?.SNlM0e)",!0).catch(()=>!1)),!n||!a){const s=Le;`;

const newEnsureView = `const n=!!(o&&this.isGoogleFlowUrl(o));let a=!1;if(n&&(a=await A.view.webContents.executeJavaScript("Boolean(window.WIZ_global_data?.SNlM0e)",!0).catch(()=>!1)),!n||!a){const s=Le;`;

// 3. Trong executeFlowImageRpc, trước khi chạy script, tự động tắt modal popup của Google Flow
const oldExecRpc = `const a=await this.ensureGoogleFlowViewReady(e,A),s=zu({params:t,rpcConfig:o});`;
const newExecRpc = `const a=await this.ensureGoogleFlowViewReady(e,A);try{await a.view.webContents.executeJavaScript("(()=>{const btns=Array.from(document.querySelectorAll('button,[role=button]'));const closeBtn=btns.find(b=>b.getAttribute('aria-label')==='Close'||b.getAttribute('aria-label')==='Đóng'||/close|đóng|explore/i.test(b.innerText||''));if(closeBtn)closeBtn.click();})()",!0)}catch(_){}const s=zu({params:t,rpcConfig:o});`;

if (code.includes(oldExecRpc)) {
  code = code.replace(oldExecRpc, newExecRpc);
  console.log('  ✓ Đã chèn logic tự động dismiss popup Google Flow trong executeFlowImageRpc');
}

fs.writeFileSync(targetPath, code, 'utf8');
console.log('[+] Đã lưu app/out/main/index.js thành công!');
