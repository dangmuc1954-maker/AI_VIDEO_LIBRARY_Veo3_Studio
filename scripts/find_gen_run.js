const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

function searchAll(str, name) {
  let idx = 0;
  while ((idx = videoStudio.indexOf(str, idx)) !== -1) {
    console.log(`Found "${name}" at ${idx}:`);
    console.log(videoStudio.substring(Math.max(0, idx - 150), Math.min(videoStudio.length, idx + 250)));
    console.log('---');
    idx += str.length;
  }
}

searchAll('generationRunId', 'generationRunId');
searchAll('generationRunExpectedJobCount', 'generationRunExpectedJobCount');
