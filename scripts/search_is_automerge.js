const fs = require('fs');
const path = require('path');

const base = 'C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out';

function searchFile(filePath, term) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`[${path.basename(filePath)}] at ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 200), Math.min(content.length, idx + 400)));
    console.log('===');
    idx += term.length;
  }
}

searchFile(path.join(base, 'out/renderer/assets/VideoStudio-CbTMj2SN.js'), 'isAutoMergeEnabled');
searchFile(path.join(base, 'out/renderer/assets/index-DqhuWq2K.js'), 'isAutoMergeEnabled');
