const fs = require('fs');
const path = require('path');

const base = 'C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out';

function searchWord(file, word) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf-8');
  let idx = 0;
  while ((idx = content.indexOf(word, idx)) !== -1) {
    console.log(`[${path.basename(file)}] at ${idx}:`);
    console.log(content.substring(Math.max(0, idx - 200), Math.min(content.length, idx + 300)));
    console.log('---');
    idx += word.length;
  }
}

searchWord(path.join(base, 'out/renderer/assets/VideoStudio-CbTMj2SN.js'), 'autoMerge');
searchWord(path.join(base, 'out/renderer/assets/VideoStudio-CbTMj2SN.js'), 'auto_merge');
searchWord(path.join(base, 'out/main/index.js'), 'autoMerge');
searchWord(path.join(base, 'out/main/index.js'), 'auto_merge');
searchWord(path.join(base, 'out/main/index.js'), 'video:merge');
searchWord(path.join(base, 'out/main/index.js'), 'video-merge');
