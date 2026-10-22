const https = require('https');

const urls = [
  'https://labs.google/fx',
  'https://labs.google/fx/',
  'https://labs.google/fx/api/auth/signin',
  'https://labs.google/fx/api/auth/providers',
  'https://labs.google/fx/api/auth/csrf',
  'https://labs.google/fx/tools',
  'https://labs.google/'
];

function check(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      console.log(url, '--> Status:', res.statusCode, 'Location:', res.headers.location || 'NONE');
      resolve();
    }).on('error', err => {
      console.log(url, '--> ERROR:', err.message);
      resolve();
    });
  });
}

(async () => {
  for (const u of urls) await check(u);
})();
