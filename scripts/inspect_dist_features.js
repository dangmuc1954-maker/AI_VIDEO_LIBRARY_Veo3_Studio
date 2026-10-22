const fs = require('fs');

const file = 'dist/AI_VIDEO_LIBRARY_Customer_Edition/resources/app/out/main/index.js';
const c = fs.readFileSync(file, 'utf8');

console.log('File size:', c.length);
console.log('Has elevenlabs:', c.includes('elevenlabs'));
console.log('Has Priority model:', c.includes('Priority'));
console.log('Has session_recovered:', c.includes('session_recovered'));
const startUrls = c.match(/startUrl:\s*["'][^"']+["']/g);
console.log('startUrls:', startUrls);

// Check if fetchAccessToken has session_recovered
const idx = c.indexOf('session_recovered');
console.log('session_recovered index:', idx);
