const https = require('https');

const body = JSON.stringify({
  licenseId: "cmtzknx2b011fq3015m1o7uvf",
  activationId: "cmtzknx2q011iq301iq6ptuda",
  machineCode: "eabcbaf26f837b00d571ea9929d9ce54872c1fd293816cd666ea86dc60e92f8c"
});

console.log('Trying checkin on aitoolforge.shop...');
const req = https.request('https://aitoolforge.shop/v1/license/checkin', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(body)
  }
}, res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode, 'Body:', d);
  });
});
req.on('error', e => console.error(e));
req.write(body);
req.end();
