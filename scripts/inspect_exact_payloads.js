const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const grokIdx = code.indexOf('providerId:"grok"');
console.log('--- GROK SECTION ---');
console.log(code.slice(grokIdx - 50, grokIdx + 450));

const veoIdx = code.indexOf('providerId:"veo3"');
console.log('\n--- VEO3 SECTION ---');
console.log(code.slice(veoIdx - 50, veoIdx + 450));
