const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const grokIdx = content.indexOf('providerId:"grok"');
console.log('Surrounding code (pos', grokIdx, '):');
console.log(content.substring(grokIdx - 600, grokIdx + 3000));
