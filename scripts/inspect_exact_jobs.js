const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const grokStart = content.indexOf('providerId:"grok"');
const veoStart = content.indexOf('providerId:"veo3"');

console.log('=== GROK BLOCK ===');
console.log(content.substring(grokStart - 60, grokStart + 600));
console.log('\n=== VEO3 BLOCK ===');
console.log(content.substring(veoStart - 60, veoStart + 600));
