const fs = require('fs');

const orig = fs.readFileSync('temp_original_main.js', 'utf8');
const our = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('Original length:', orig.length);
console.log('Our length:', our.length);

// What large sections exist in orig that are missing in our?
const markers = [
  'class vl', // AuthService
  'class Sl', // ProjectService
  'class bl', // VideoService
  'class Za', // BrowserView
  'function dm', // login bootstrap
  'function ZB', // manual login bootstrap
  'function zr', // auth warmup
  'isGoogleFlowUrl',
  'readyUrlPatterns',
  'loginUrlPatterns',
  'selectSessionCookie',
  'scoreSessionCookieDomain',
  'aisandbox-pa',
  'runVideoJob',
  'submitVideoWithCaptchaRetry'
];

for (const m of markers) {
  console.log(`Marker "${m}": orig has ${orig.includes(m)}, our has ${our.includes(m)}`);
}
