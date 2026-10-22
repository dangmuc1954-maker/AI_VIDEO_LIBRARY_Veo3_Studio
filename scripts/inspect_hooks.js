const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Let's look before 145000, say 140000 to 145500
console.log('--- 140000 to 145500 ---');
console.log(videoStudio.substring(140000, 145500));
