const https = require('https');

https.get('https://labs.google/fx/api/auth/providers', res => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('Providers:', d);
  });
});
