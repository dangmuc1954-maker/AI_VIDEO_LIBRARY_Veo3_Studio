const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const content = fs.readFileSync(file, 'utf8');

// Find where "Biên tập video" or "videoStudio.editVideo" or merge button is in VideoStudio
// Let's search for "🎬" or "editVideo" or "videoEditor" or whatever is in the JSX of the header
const terms = ['videoStudio.openMergeModal', 'videoStudio.edit', 'videoStudio.merge', 'openMergeModal', 'setIsMergeModalOpen', 'mergeModalInitialAssetIds'];
for (const term of terms) {
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`\nMatch for "${term}" at ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
    idx += term.length;
  }
}
