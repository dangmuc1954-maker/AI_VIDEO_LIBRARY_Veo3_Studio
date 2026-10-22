const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

function searchOccurrences(code, term) {
  let idx = 0;
  let count = 0;
  while ((idx = code.indexOf(term, idx)) !== -1) {
    const start = Math.max(0, idx - 400);
    const end = Math.min(code.length, idx + term.length + 400);
    console.log(`=== OCCURRENCE #${count++} OF "${term}" ===`);
    console.log(code.substring(start, end));
    console.log('-------------------------------------------');
    idx += term.length;
  }
}

console.log('Searching VideoStudio for autoMergeSwitchLabel or openMergeModalButton:');
searchOccurrences(videoStudio, 'autoMergeSwitchLabel');
searchOccurrences(videoStudio, 'openMergeModalButton');
searchOccurrences(videoStudio, 'miniEditorTitle');
