const https = require('https');

const machineCode = "eabcbaf26f837b00d571ea9929d9ce54872c1fd293816cd666ea86dc60e92f8c";
const installId = "install-b272c38b-cdac-48c1-9b99-df6ab4d37231";
const appVersion = "0.1.0-build.20260912124003";

function post(endpoint, payload) {
  return new Promise(resolve => {
    const body = JSON.stringify(payload);
    const req = https.request(`https://aitoolforge.shop${endpoint}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ error: e.message }));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('--- License Check-in ---');
  const r2 = await post('/v1/licenses/check-in', {
    licenseId: "cmtzknx2b011fq3015m1o7uvf",
    activationId: "cmtzknx2q011iq301iq6ptuda",
    machineCode,
    installId,
    appVersion
  });
  console.log(r2);
})();
