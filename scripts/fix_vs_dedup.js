const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
let s = fs.readFileSync(p, 'utf8');

const targetPart2 = 'Me_muse=(Se?.provider==="Muse AI"||Se?.provider==="muse ai")&&Se.account==="Auto",';
while (s.includes(targetPart2 + targetPart2)) {
  s = s.replace(targetPart2 + targetPart2, targetPart2);
}

fs.writeFileSync(p, s, 'utf8');
console.log('✓ Successfully deduplicated Me_muse!');
