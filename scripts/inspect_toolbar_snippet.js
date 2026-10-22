const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Find where the toolbar in VideoStudio is rendered
const idx = videoStudio.indexOf('autoMergeSwitchLabel');
console.log('Toolbar snippet (from -300 to +1500 chars around autoMergeSwitchLabel):');
console.log(videoStudio.substring(idx - 300, idx + 1500));
