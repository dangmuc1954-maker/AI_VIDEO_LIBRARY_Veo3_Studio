const http = require('http');
const serverHandler = require('../vercel_server/api/index.js');

const server = http.createServer((req, res) => {
  serverHandler(req, res);
});

async function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8999,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data), raw: data });
        } catch(e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  server.listen(8999, '127.0.0.1', async () => {
    console.log('🚀 Test server running on http://127.0.0.1:8999');

    try {
      // -------------------------------------------------------------
      // TEST 1: BAN MÁY & CHẶN TUYỆT ĐỐI
      // -------------------------------------------------------------
      console.log('\n--- TEST 1: BAN MÁY TÍNH HWID ---');
      const testHwid = 'TEST-BAN-HWID-' + Date.now();

      // Ban machine
      const banRes = await request('POST', '/api/admin/machines/ban', { machineCode: testHwid, reason: 'Test Ban' }, { 'Authorization': 'admin' });
      console.log('1. Admin Ban Machine:', banRes.status, banRes.json?.message);

      // Banned machine tries to activate key
      const actBanned = await request('POST', '/v1/licenses/activate', { licenseKey: 'ANY-KEY', machineCode: testHwid });
      console.log('2. Banned Machine Activate:', actBanned.status, actBanned.json?.error?.code, '=>', actBanned.json?.error?.message);
      if (actBanned.status !== 403 || actBanned.json?.error?.code !== 'MACHINE_BANNED') {
        throw new Error('FAIL: Banned machine was not blocked on activate!');
      }

      // Banned machine tries to check-in
      const checkBanned = await request('POST', '/v1/licenses/check-in', { licenseKey: 'ANY-KEY', machineCode: testHwid });
      console.log('3. Banned Machine Check-In:', checkBanned.status, checkBanned.json?.error?.code);
      if (checkBanned.status !== 403 || checkBanned.json?.error?.code !== 'MACHINE_BANNED') {
        throw new Error('FAIL: Banned machine was not blocked on check-in!');
      }

      // Banned machine tries trial
      const trialBanned = await request('POST', '/v1/licenses/activate-trial', { machineCode: testHwid });
      console.log('4. Banned Machine Trial:', trialBanned.status, trialBanned.json?.error?.code);
      if (trialBanned.status !== 403) {
        throw new Error('FAIL: Banned machine was not blocked on trial!');
      }

      // Admin Unbans
      const unbanRes = await request('POST', '/api/admin/machines/unban', { machineCode: testHwid }, { 'Authorization': 'admin' });
      console.log('5. Admin Unban Machine:', unbanRes.status, unbanRes.json?.message);

      // -------------------------------------------------------------
      // TEST 2: ĐỔI MÁY (RESET HWID) -> NGỪNG GÓI TỨC THÌ TRÊN MÁY CŨ
      // -------------------------------------------------------------
      console.log('\n--- TEST 2: ĐỔI MÁY (RESET HWID) & GIẢI PHÓNG KEY ---');
      const machineA = 'HWID-MACHINE-AAA-' + Date.now();
      const machineB = 'HWID-MACHINE-BBB-' + Date.now();

      // Create a single-device key
      const genRes = await request('POST', '/api/admin/keys/generate', {
        planCode: 'basic',
        planName: 'Basic',
        planTier: 'pro',
        durationDays: 30,
        maxDevices: 1,
        count: 1
      }, { 'Authorization': 'admin' });
      const testKey = genRes.json.keys[0].key;
      console.log('1. Generated Key for 1 device:', testKey);

      // Machine A activates the key
      const actA = await request('POST', '/v1/licenses/activate', { licenseKey: testKey, machineCode: machineA });
      console.log('2. Machine A Activate:', actA.status, actA.json?.status?.state);
      if (actA.status !== 200 || !actA.json?.entitlementToken) throw new Error('FAIL: Machine A failed to activate');

      // Machine A checks in -> 200 OK
      const checkA1 = await request('POST', '/v1/licenses/check-in', { licenseKey: testKey, machineCode: machineA });
      console.log('3. Machine A Check-in before reset:', checkA1.status, checkA1.json?.valid);
      if (checkA1.status !== 200) throw new Error('FAIL: Machine A check-in failed');

      // Machine B tries to activate same key -> 409 limit reached
      const actB1 = await request('POST', '/v1/licenses/activate', { licenseKey: testKey, machineCode: machineB });
      console.log('4. Machine B tries to activate (conflict):', actB1.status, actB1.json?.error?.message);
      if (actB1.status !== 409) throw new Error('FAIL: Machine B was not rejected on device limit');

      // Admin clicks "ĐỔI MÁY" (Reset HWID for Machine A)
      const resetRes = await request('POST', '/api/admin/machines/reset-hwid', { machineCode: machineA }, { 'Authorization': 'admin' });
      console.log('5. Admin clicks ĐỔI MÁY for Machine A:', resetRes.status, resetRes.json?.message);

      // Machine A calls check-in now -> MUST BE 409 MACHINE_UNLINKED!
      const checkA2 = await request('POST', '/v1/licenses/check-in', { licenseKey: testKey, machineCode: machineA });
      console.log('6. Machine A Check-in after Admin resets HWID:', checkA2.status, checkA2.json?.error?.code, '=>', checkA2.json?.error?.message);
      if (checkA2.status !== 409 || checkA2.json?.error?.code !== 'MACHINE_UNLINKED') {
        throw new Error('FAIL: Machine A was not disconnected on check-in after reset!');
      }

      // Machine B activates the same key -> MUST BE 200 OK!
      const actB2 = await request('POST', '/v1/licenses/activate', { licenseKey: testKey, machineCode: machineB });
      console.log('7. Machine B activates freed key:', actB2.status, actB2.json?.status?.state);
      if (actB2.status !== 200 || !actB2.json?.entitlementToken) {
        throw new Error('FAIL: Machine B could not activate the freed key!');
      }

      console.log('\n🎉 TẤT CẢ CÁC BƯỚC TEST ĐỔI MÁY & BAN MÁY ĐỀU THÀNH CÔNG 100%! 🎉');
    } catch(err) {
      console.error('❌ TEST ERROR:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
})();
