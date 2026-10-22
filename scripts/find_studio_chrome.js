const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('StudioChrome');
console.log('StudioChrome at', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 100));
}

const ret = content.slice(164750, 165500);
console.log('Return JSX:\n', ret);
