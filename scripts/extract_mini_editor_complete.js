const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Find start of helper functions before mn
// Around 84500 to 138000
const startIdx = videoStudio.lastIndexOf('const as=', 86000) !== -1 ? videoStudio.lastIndexOf('const as=', 86000) : 84000;
console.log('startIdx:', startIdx);
console.log('Snippet around start:', videoStudio.substring(startIdx, startIdx + 500));

// Find end of mn
const endIdx = videoStudio.indexOf('function oa()', 135000);
console.log('endIdx:', endIdx);

const completeCode = videoStudio.substring(startIdx, endIdx);
fs.writeFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/mini_editor_complete.js', completeCode);
console.log('Wrote mini_editor_complete.js, size:', completeCode.length);
