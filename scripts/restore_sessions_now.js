const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.env.APPDATA, 'AI_VIDEO_LIBRARY_DATA');
const targetFile = path.join(dataDir, 'browser-sessions.json');
const bakPersistent = path.join(dataDir, 'browser-sessions.json.bak_persistent');
const sourceTmp = path.join(dataDir, 'browser-sessions.json.6784.1791680281722.tmp');

if (!fs.existsSync(sourceTmp)) {
  console.error('❌ Không tìm thấy file sourceTmp:', sourceTmp);
  process.exit(1);
}

const raw = fs.readFileSync(sourceTmp, 'utf8');
const parsed = JSON.parse(raw);
console.log(`[*] Đã đọc thành công ${parsed.sessions.length} sessions từ file tmp!`);

// Write to browser-sessions.json
fs.writeFileSync(targetFile, JSON.stringify(parsed, null, 2), 'utf8');
console.log(`✅ Đã khôi phục browser-sessions.json (${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);

// Write to bak_persistent
fs.writeFileSync(bakPersistent, JSON.stringify(parsed, null, 2), 'utf8');
console.log(`✅ Đã tạo persistent backup: browser-sessions.json.bak_persistent`);

// Verify
const verified = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
console.log(`🎉 XÁC NHẬN: browser-sessions.json hiện có ${verified.sessions.length} tài khoản:`);
verified.sessions.forEach((s, idx) => {
  console.log(`   ${idx + 1}. [${s.providerId}] ${s.accountName} (${s.authStatus})`);
});
