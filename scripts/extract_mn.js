const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const content = fs.readFileSync(file, 'utf8');

const mnStart = content.indexOf('const mn=({isOpen:s,onClose:r,initialAssetIds:n})=>{');
console.log('mnStart:', mnStart);

if (mnStart !== -1) {
  // Let's find where mn ends (next top-level const or function or export)
  const mnSlice = content.slice(mnStart, mnStart + 45000);
  // Find where mn ends
  fs.writeFileSync(path.join(__dirname, '..', 'original_video_editor_mn.js'), mnSlice);
  console.log('Wrote original_video_editor_mn.js, length:', mnSlice.length);
}
