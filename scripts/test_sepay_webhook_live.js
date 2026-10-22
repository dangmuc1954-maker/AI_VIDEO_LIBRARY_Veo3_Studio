const http = require('http');

console.log('=== TEST SIMULATING SEPAY WEBHOOK POST REQUEST ===');

// 1. Create a test order first
const testOrderCode = 'AF' + Math.floor(100000 + Math.random() * 900000);
const db = require('../license_server/db');

const order = {
  orderCode: testOrderCode,
  planCode: 'basic',
  planName: 'Basic (1 Tháng)',
  planTier: 'pro',
  durationCode: '1M',
  durationDays: 30,
  amount: 120000,
  currency: 'VND',
  customerIdentifier: 'test_sepay@gmail.com',
  machineCode: 'HWID-SEPAY-TEST-999',
  transferContent: 'AIFORGE ' + testOrderCode,
  status: 'pending',
  createdAt: new Date().toISOString()
};
db.addOrder(order);
console.log(`[1] Created Pending Order: ${testOrderCode} (120,000 VND)`);

// 2. Simulate SePay sending webhook
const webhookPayload = JSON.stringify({
  id: 999999,
  gateway: 'BIDV',
  transactionDate: '2026-08-31 14:00:00',
  accountNumber: '96247HP2004',
  transferType: 'in',
  transferAmount: 120000,
  content: `AIFORGE ${testOrderCode} chuyen tien mua app`,
  description: `AIFORGE ${testOrderCode} chuyen tien mua app`
});

const req = http.request({
  hostname: '127.0.0.1',
  port: 8787,
  path: '/api/webhook/payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(webhookPayload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`[2] Webhook Response Status: ${res.statusCode}`);
    console.log(`    Response Body: ${data}`);

    // 3. Check order in DB
    const updated = db.findOrder(testOrderCode);
    console.log(`[3] Order in DB: status=${updated.status}, key=${updated.licenseKey}`);

    // 4. Check key in DB
    const key = db.findKey(updated.licenseKey);
    console.log(`[4] Generated Key in DB:`, key);

    if (updated.status === 'paid' && updated.licenseKey && key && key.status === 'active') {
      console.log('\n🎉 SEPAY WEBHOOK AUTO-KEY ISSUANCE TEST: PASSED 100%!');
    } else {
      console.log('\n❌ FAILED');
    }
  });
});

req.on('error', (err) => console.error('Request Error:', err.message));
req.write(webhookPayload);
req.end();
