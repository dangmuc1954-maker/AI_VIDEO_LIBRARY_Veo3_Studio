const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MediaWatermarkCleaner = require('../app/modules/media_watermark_cleaner.cjs');

const cleaner = new MediaWatermarkCleaner();
const ffmpeg = cleaner.ffmpegPath;

const rawPath = path.join(__dirname, 'crop.raw');
const cropPng = path.join(__dirname, 'test_crop_b50.png');
execSync(`"${ffmpeg}" -y -i "${cropPng}" -f rawvideo -pix_fmt rgba "${rawPath}"`);
const raw = fs.readFileSync(rawPath);
const w = 300, h = 200;

// Sample points around x=180..220, y=80..120
console.log('Sample pixels near center:');
for (let y = 80; y <= 120; y += 10) {
  let line = '';
  for (let x = 180; x <= 220; x += 10) {
    const idx = (y * w + x) * 4;
    line += `(${raw[idx]},${raw[idx+1]},${raw[idx+2]}) `;
  }
  console.log(`y=${y}: ${line}`);
}

// Find maximum brightness
let maxB = 0, bestX = 0, bestY = 0;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const idx = (y * w + x) * 4;
    const b = (raw[idx] + raw[idx+1] + raw[idx+2]) / 3;
    if (b > maxB) {
      maxB = b; bestX = x; bestY = y;
    }
  }
}
console.log('Max brightness:', maxB, 'at x=', bestX, 'y=', bestY);
console.log('Absolute coordinates in 768x1376: x=', 468 + bestX, 'y=', 1176 + bestY);
if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
