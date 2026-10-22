const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Let's search for "autoMerge" or "useVideoAutoMerge" or similar
const matches = [];
let idx = 0;
while ((idx = videoStudio.indexOf('autoMerge', idx)) !== -1) {
  matches.push(idx);
  idx += 'autoMerge'.length;
}

matches.forEach(i => {
  console.log(`Index ${i}:`);
  console.log(videoStudio.substring(Math.max(0, i - 150), Math.min(videoStudio.length, i + 200)));
  console.log('===');
});
