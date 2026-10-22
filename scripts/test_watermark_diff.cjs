const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';
const assetDir = path.join(process.env.APPDATA || '', 'AI_VIDEO_LIBRARY_DATA', 'assets');

// Let's test Fs.removeImageWatermark on Scene 1 and Scene 2
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// We can inspect the candidate detections iP on Scene 1 vs Scene 2!
console.log('Testing Scene 1 vs Scene 2...');
