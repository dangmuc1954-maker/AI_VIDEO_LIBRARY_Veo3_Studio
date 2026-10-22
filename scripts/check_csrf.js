const https = require('https');

https.get('https://labs.google/fx/api/auth/csrf', res => {
  console.log('CSRF status:', res.statusCode);
  console.log('CSRF set-cookie:', res.headers['set-cookie']);
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log('CSRF body:', d);
  });
});
