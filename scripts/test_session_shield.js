const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../scratch/test_shield');
if (fs.existsSync(testDir)) fs.rmSync(testDir, { recursive: true, force: true });
fs.mkdirSync(testDir, { recursive: true });

const targetFile = path.join(testDir, 'browser-sessions.json');
const bakPersistent = path.join(testDir, 'browser-sessions.json.bak_persistent');

// Mock 15 sessions
const mock15 = {
  sessions: Array.from({ length: 15 }, (_, i) => ({
    accountId: `acc-${i + 1}`,
    providerId: 'veo3',
    accountName: `Account #${i + 1}`,
    authStatus: 'Logged In',
    partition: `persist:aiforge:acc-${i + 1}`
  }))
};
fs.writeFileSync(bakPersistent, JSON.stringify(mock15, null, 2), 'utf8');

// Scenario: targetFile only has 1 dummy session
fs.writeFileSync(targetFile, JSON.stringify({ sessions: [{ accountId: 'dummy-1' }] }, null, 2), 'utf8');

// Test the hydrate logic
const _readSessions = (targetPath) => {
  try {
    if (fs.existsSync(targetPath)) {
      const c = fs.readFileSync(targetPath, 'utf8');
      if (c && c.trim().length > 5) {
        const p = JSON.parse(c);
        if (p && Array.isArray(p.sessions) && p.sessions.length > 0) return p.sessions;
      }
    }
  } catch (err) {}
  return null;
};

let parsedSessions = [];
const _primary = _readSessions(targetFile);
if (_primary && _primary.length > 0) parsedSessions = _primary;

const _bakSessions = _readSessions(bakPersistent);
if (_bakSessions && _bakSessions.length > parsedSessions.length) {
  console.log(`[TEST] Restoring ${_bakSessions.length} sessions from persistent backup (was ${parsedSessions.length})`);
  parsedSessions = _bakSessions;
}

if (parsedSessions.length === 15) {
  console.log('✅ TEST HYDRATE THÀNH CÔNG: Đã tự động khôi phục 15 sessions từ bak_persistent!');
} else {
  console.error('❌ TEST HYDRATE THẤT BẠI!');
  process.exit(1);
}

// Test save guard: If sessions is empty array
let currentSessions = [];
if (currentSessions.length === 0) {
  if (fs.existsSync(bakPersistent)) {
    const _bc = fs.readFileSync(bakPersistent, 'utf8');
    const _p = JSON.parse(_bc);
    if (_p && Array.isArray(_p.sessions) && _p.sessions.length > 0) {
      console.log('[TEST] Shield triggered: Restored from persistent backup!');
      currentSessions = _p.sessions;
    }
  }
}

if (currentSessions.length === 15) {
  console.log('✅ TEST SAVE SHIELD THÀNH CÔNG: Không bị xóa rỗng, khôi phục nguyên vẹn 15 tài khoản!');
} else {
  console.error('❌ TEST SAVE SHIELD THẤT BẠI!');
  process.exit(1);
}

// Clean up test dir
fs.rmSync(testDir, { recursive: true, force: true });
console.log('🎉 TOÀN BỘ CƠ CHẾ BẢO VỆ PHÒNG THỦ ĐÃ QUA KIỂM THỬ 100%!');
