const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const content = fs.readFileSync(file, 'utf8');

let idx = 0;
while ((idx = content.indexOf('isMergeModalOpen', idx)) !== -1) {
  console.log(`\n--- Match at ${idx} ---`);
  console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 300)));
  idx += 'isMergeModalOpen'.length;
}

// Also check where setIsMergeModalOpen is invoked in VideoStudio
idx = 0;
while ((idx = content.indexOf('setIsMergeModalOpen', idx)) !== -1) {
  console.log(`\n--- setIsMergeModalOpen at ${idx} ---`);
  console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 300)));
  idx += 'setIsMergeModalOpen'.length;
}
