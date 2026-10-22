const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const m1 = content.indexOf('provider:"Muse AI"');
console.log('Muse AI dispatch context:');
console.log(content.slice(m1 - 100, m1 + 400));

const m2 = content.indexOf('providerId:"grok"');
console.log('\nGrok dispatch context:');
console.log(content.slice(m2 - 100, m2 + 400));

const m3 = content.indexOf('providerId:"veo3"');
console.log('\nVeo3 dispatch context:');
console.log(content.slice(m3 - 100, m3 + 400));
