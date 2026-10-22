const fs = require('fs');
const path = require('path');

// Read the decoding and watermark detection logic from app/out/main/index.js
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find Fs definition
const idx = mainCode.indexOf('async removeImageWatermark(e,t){');
console.log('Found removeImageWatermark');

// Let's check what Fs actually is in main index.js
const fsIdx = mainCode.indexOf('Fs=new ');
console.log('Fs at:', fsIdx !== -1 ? mainCode.slice(fsIdx, fsIdx + 100) : 'not found');
