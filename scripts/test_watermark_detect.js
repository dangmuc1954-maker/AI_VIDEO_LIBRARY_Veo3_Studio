const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find helper functions for watermark detection
// Let's extract the watermark detection logic from main/index.js
const file = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';

console.log('Testing reverse alpha detection on b50...');

// Decode b50 to RGBA raw
const rgbaPath = path.join(__dirname, 'test_b50.rgba');
execSync(`"${ffmpeg}" -y -i "${file}" -vcodec rawvideo -pix_fmt rgba "${rgbaPath}"`);
const rgbaBuf = fs.readFileSync(rgbaPath);
console.log('RGBA buffer size:', rgbaBuf.length, 'expected for 768x1376x4:', 768*1376*4);

