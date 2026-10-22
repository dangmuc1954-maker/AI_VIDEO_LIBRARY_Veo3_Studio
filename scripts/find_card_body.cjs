const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const curCode = fs.readFileSync(curPath, 'utf8');

let pos = 0;
let occurrences = [];
while ((pos = curCode.indexOf('video-script-extract', pos)) !== -1) {
  occurrences.push(pos);
  pos += 20;
}

console.log('Occurrences of video-script-extract:', occurrences);

// The card body is usually the one around 400k
for (const p of occurrences) {
  if (p > 350000 && p < 500000) {
    console.log(`--- At pos ${p} ---`);
    console.log(curCode.slice(p - 100, p + 800));
  }
}
