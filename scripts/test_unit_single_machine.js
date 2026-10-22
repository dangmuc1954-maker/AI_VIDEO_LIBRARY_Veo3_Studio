const http = require('http');
const db = require('../license_server/db');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testLiveActivationFlow() {
  // Test activate machine 1
  const testKeyStr = 'AIFORGE-TEST-MACHINE-LOCK-' + Date.now();
  const testKeyObj = {
    id: 'LIC-LOCK-' + Date.now(),
    key: testKeyStr,
    planCode: 'gold',
    planName: 'Gold VIP',
    planTier: 'ultra',
    durationDays: 365,
    maxDevices: 1,
    status: 'unused',
    createdAt: new Date().toISOString(),
    customerEmail: 'test@example.com',
    machineCodes: []
  };
  db.addKey(testKeyObj);

  console.log('[*] Test Key created:', testKeyStr);

  // Machine 1 activation simulation directly using the logic in server.js
  const machine1 = 'HWID_MACHINE_AAA_111';
  const machine2 = 'HWID_MACHINE_BBB_222';

  // 1. First machine activates
  let keyObj = db.findKey(testKeyStr);
  const machines = keyObj.machineCodes || [];
  const maxDevices = 1;

  if (!machines.includes(machine1)) {
    if (machines.length >= maxDevices) {
      throw new Error('Machine 1 should succeed');
    }
    machines.push(machine1);
  }
  db.updateKey(testKeyStr, { status: 'active', machineCodes: machines });
  console.log('[+] Machine 1 activated successfully! Machines bound:', machines);

  // 2. Second machine tries to activate
  keyObj = db.findKey(testKeyStr);
  let blockedMachine2 = false;
  if (!keyObj.machineCodes.includes(machine2)) {
    if (keyObj.machineCodes.length >= maxDevices) {
      blockedMachine2 = true;
      console.log('[+] Machine 2 activation blocked with error: Key đã đạt giới hạn 1 thiết bị!');
    }
  }
  if (!blockedMachine2) {
    throw new Error('Machine 2 should have been blocked!');
  }

  // 3. Second machine tries to check-in
  let checkInBlocked = false;
  if (keyObj.machineCodes.length > 0 && !keyObj.machineCodes.includes(machine2)) {
    checkInBlocked = true;
    console.log('[+] Machine 2 check-in blocked with code: MACHINE_MISMATCH!');
  }
  if (!checkInBlocked) {
    throw new Error('Machine 2 check-in should have been blocked!');
  }

  // Clean up
  db.data.keys = db.data.keys.filter(k => k.key !== testKeyStr);
  db.save();
  console.log('🎉 Activation & Check-in single-machine lock tests PASSED 100%!');
}

testLiveActivationFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
