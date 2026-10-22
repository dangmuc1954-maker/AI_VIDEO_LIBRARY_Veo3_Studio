const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const vIdx = code.indexOf('providerId:"veo3"');
console.log('--- VEO3 JOB PAYLOAD ---');
console.log(code.slice(vIdx, vIdx + 450));
console.log('Contains tts in veo3 payload?', code.slice(vIdx, vIdx + 450).includes('tts:'));
