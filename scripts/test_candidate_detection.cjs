const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// We can test if 48px detection works on Scene 2
console.log('Testing candidate detection...');
const imgPath = path.join(process.env.APPDATA || '', 'AI_VIDEO_LIBRARY_DATA', 'assets', '06d56186-5562-4465-bcec-365abe5096c2.jpg');
console.log('Target image exists:', fs.existsSync(imgPath));
