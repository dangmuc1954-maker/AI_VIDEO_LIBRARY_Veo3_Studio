const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Find the function or component containing miniEditorTitle
const idx = videoStudio.indexOf('miniEditorTitle');
console.log('miniEditorTitle is at index:', idx);

// Let's get 5000 characters before and 15000 characters after
const start = Math.max(0, idx - 3000);
const end = Math.min(videoStudio.length, idx + 15000);
fs.writeFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/mini_editor_dump.js', videoStudio.substring(start, end));
console.log('Wrote mini_editor_dump.js');
