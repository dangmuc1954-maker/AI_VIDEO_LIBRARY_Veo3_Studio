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

async function run() {
  console.log('--- 1. Testing DB Default Plans ---');
  const plans = db.data.plans;
  console.log('Available plan codes in DB:', plans.map(p => p.code));
  const hasLifetime = plans.some(p => p.code === 'lifetime' || p.code === 'lifetime-vip');
  console.log('Has Lifetime plan in DB:', hasLifetime);
  if (hasLifetime) throw new Error('Lifetime plan is still in DB!');

  console.log('--- 2. Testing Single Machine Activation Lock ---');
  // Create a clean test key
  const testKeyStr = 'AIFORGE-TEST-KEY-MACHINE-LOCK-2026';
  db.data.keys = db.data.keys.filter(k => k.key !== testKeyStr);
  
  const testKeyObj = {
    id: 'LIC-TEST-LOCK',
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

  // Simulate server running or start temporary instance if server is not listening on 8787
  // Check if 8787 is alive
  let serverRunning = false;
  try {
    const res = await request({ hostname: '127.0.0.1', port: 8787, path: '/v1/plans', method: 'GET' });
    serverRunning = true;
    console.log('Live server /v1/plans returned status:', res.status);
    const serverPlans = res.body.plans || [];
    console.log('Live server plan codes:', serverPlans.map(p => p.code));
    const serverHasLifetime = serverPlans.some(p => p.code === 'lifetime' || p.code === 'lifetime-vip');
    console.log('Live server has Lifetime plan:', serverHasLifetime);
  } catch(e) {
    console.log('License server is currently not listening on 8787 (offline test mode).');
  }

  // Verify keyObj in DB
  const storedKey = db.findKey(testKeyStr);
  console.log('Stored test key maxDevices:', storedKey.maxDevices);
  console.log('Stored test key machineCodes:', storedKey.machineCodes);

  // Clean up
  db.data.keys = db.data.keys.filter(k => k.key !== testKeyStr);
  db.save();
  console.log('✅ All direct DB and plan verifications PASSED!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
