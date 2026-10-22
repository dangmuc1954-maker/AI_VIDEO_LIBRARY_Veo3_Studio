const https = require('https');
const crypto = require('crypto');

const randomMachineCode = crypto.randomBytes(32).toString('hex');
const randomInstallId = `install-${crypto.randomUUID()}`;
const customerIdentifier = `tris_${Date.now()}`;

function post(url, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body)
      }
    }, res => {
      let resData = '';
      res.on('data', c => resData += c);
      res.on('end', () => resolve({ status: res.statusCode, data: resData }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('Activating trial with customerIdentifier:', customerIdentifier);
  const act = await post('https://aitoolforge.shop/v1/trials/activate', {
    machineCode: randomMachineCode,
    planCode: 'pro',
    installId: randomInstallId,
    customerIdentifier: customerIdentifier,
    appVersion: '0.1.0-build.20260912124003'
  });
  console.log('Activate response:', act);
})();
