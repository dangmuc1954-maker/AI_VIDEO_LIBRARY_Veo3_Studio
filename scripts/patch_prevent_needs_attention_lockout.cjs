const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../app/out/main/index.js');
let code = fs.readFileSync(targetPath, 'utf8');
console.log('[*] Original app/out/main/index.js length:', code.length);

// 1. In markJobRecoveryNeeded, never mark Logged In accounts as "Needs Attention" or "Poor"
const oldMarkRecovery = 'markJobRecoveryNeeded(e,t,A){this.sessions=this.sessions.map(o=>o.accountId!==e?o:{...o,viewState:"Needs Attention",healthScore:Math.min(o.healthScore,65),healthLabel:"Poor",';
const newMarkRecovery = 'markJobRecoveryNeeded(e,t,A){this.sessions=this.sessions.map(o=>o.accountId!==e?o:{...o,viewState:o.authStatus==="Logged In"?"Idle":"Needs Attention",healthScore:o.authStatus==="Logged In"?100:Math.min(o.healthScore,65),healthLabel:o.authStatus==="Logged In"?"Excellent":"Poor",';

if (code.includes(oldMarkRecovery)) {
  code = code.replace(oldMarkRecovery, newMarkRecovery);
  console.log('  ✓ Đã cập nhật markJobRecoveryNeeded để tài khoản Logged In luôn giữ trạng thái Idle & Excellent!');
} else {
  console.log('  [*] oldMarkRecovery pattern not found directly, checking...');
}

// 2. In listJobSessions, ensure Logged In accounts are never blocked by viewState
const oldListJobSessions = '&&o.viewState!=="Needs Attention"&&o.viewState!=="Attaching"&&';
const newListJobSessions = '&&(o.viewState!=="Needs Attention"||o.authStatus==="Logged In")&&o.viewState!=="Attaching"&&';

if (code.includes(oldListJobSessions)) {
  code = code.replaceAll(oldListJobSessions, newListJobSessions);
  console.log('  ✓ Đã cập nhật listJobSessions để tài khoản Logged In không bị block');
}

fs.writeFileSync(targetPath, code, 'utf8');
console.log('[+] Đã lưu app/out/main/index.js thành công!');
