const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out');

function searchInFile(file, terms) {
  const content = fs.readFileSync(file, 'utf8');
  for (const t of terms) {
    let idx = 0;
    while ((idx = content.indexOf(t, idx)) !== -1) {
      console.log(`\n=== Found "${t}" in ${path.basename(file)} at ${idx} ===`);
      console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + t.length + 300)));
      idx += t.length;
    }
  }
}

searchInFile(path.join(basePath, 'renderer', 'assets', 'index-DqhuWq2K.js'), ['openMergeModalWithAssets', 'isMergeModalOpen', 'mergeModalInitialAssetIds', 'mergeVideos']);
searchInFile(path.join(basePath, 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js'), ['openMergeModalWithAssets', 'setIsMergeModalOpen', 'Biên tập']);
