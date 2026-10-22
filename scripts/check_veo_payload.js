const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

let idx = 0;
while ((idx = code.indexOf('providerId:"veo3"', idx)) !== -1) {
  console.log('Veo3 submission snippet:');
  console.log(code.slice(idx - 50, idx + 450));
  idx += 15;
}
