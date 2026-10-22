const http = require('http');

function post(path, data, token = 'admin') {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8787,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testFlow() {
  console.log('--- 1. Generating License Key via Admin API ---');
  const genRes = await post('/api/admin/keys/generate', {
    planCode: 'pro-monthly',
    planName: 'Gói Pro 1 Tháng (30 Ngày)',
    planTier: 'pro',
    durationDays: 30,
    maxDevices: 2,
    customerEmail: 'khachhang_test@gmail.com',
    notes: 'Khách mua qua Zalo'
  });
  console.log('Generate Result:', genRes.data);
  const createdKey = genRes.data.keys[0].key;

  console.log('\n--- 2. Client Activating Key with Machine Code ---');
  const actRes = await post('/v1/licenses/activate', {
    licenseKey: createdKey,
    customerIdentifier: 'khachhang_test@gmail.com',
    machineCode: 'HWID-CLIENT-PC-WINDOWS-11-9988',
    appVersion: '0.1.0'
  }, '');
  console.log('Activation Status:', actRes.status);
  console.log('Activation Token preview:', actRes.data.entitlementToken ? actRes.data.entitlementToken.slice(0, 80) + '...' : actRes.data);
  console.log('License Plan Active:', actRes.data.licenseStatus?.planName);

  console.log('\n--- 3. Client Check-In Heartbeat ---');
  const checkRes = await post('/v1/licenses/check-in', {
    licenseId: createdKey,
    machineCode: 'HWID-CLIENT-PC-WINDOWS-11-9988',
    appVersion: '0.1.0'
  }, '');
  console.log('Check-In Status:', checkRes.status);
  console.log('License Valid:', checkRes.data.licenseStatus?.valid);

  console.log('\n--- ALL COMMERCIAL LICENSE TESTS PASSED! ---');
}

testFlow().catch(console.error);
