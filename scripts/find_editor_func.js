const fs = require('fs');

const videoStudio = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/989bde5b-7b0e-4357-b6e0-e795ccef2b41/scratch/aiforge_out/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf-8');

// Find function that renders the mini editor modal
// In our previous search, miniEditorTitle was at index 104237
// Let's find where this function starts
let funcStart = videoStudio.lastIndexOf('function ', 104237);
console.log('Function starts around:', funcStart);
console.log(videoStudio.substring(funcStart, funcStart + 1500));

// Let's find where this function ends
let nextFunc = videoStudio.indexOf('function ', funcStart + 10);
console.log('Next function starts around:', nextFunc);
