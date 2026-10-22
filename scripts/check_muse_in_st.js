const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('if(v.provider==="Muse AI"');
console.log('Muse check pos in St:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 100, idx + 800));
} else {
  console.log('NOT FOUND! Searching for "Muse" in St:');
  const grokIdx = content.indexOf('v.provider==="Grok"');
  console.log(content.slice(grokIdx - 200, grokIdx + 600));
}
