const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const grokIdx = code.indexOf('providerId:"grok"');
console.log('--- GROK JOB CREATION (1000 chars) ---');
console.log(code.slice(grokIdx - 200, grokIdx + 800));

const veoIdx = code.indexOf('providerId:"veo3"');
console.log('\n--- VEO3 JOB CREATION (1000 chars) ---');
console.log(code.slice(veoIdx - 200, veoIdx + 800));
