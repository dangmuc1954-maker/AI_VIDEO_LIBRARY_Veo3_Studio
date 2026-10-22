const fs = require('fs');

const origMain = fs.readFileSync('extracted_original_20260912/out/main/index.js', 'utf8');
const ourMain = fs.readFileSync('app/out/main/index.js', 'utf8');

console.log('--- Checking upscaleImage in origMain ---');
let pos = 0;
while ((pos = origMain.indexOf('upscaleImage', pos)) !== -1) {
  console.log('pos', pos, ':', origMain.slice(Math.max(0, pos - 100), Math.min(origMain.length, pos + 300)));
  pos += 12;
}

console.log('--- Checking removeImageWatermark in origMain ---');
pos = 0;
while ((pos = origMain.indexOf('removeImageWatermark', pos)) !== -1) {
  console.log('pos', pos, ':', origMain.slice(Math.max(0, pos - 100), Math.min(origMain.length, pos + 300)));
  pos += 20;
}

console.log('--- Checking removeVideoWatermark in origMain ---');
pos = 0;
while ((pos = origMain.indexOf('removeVideoWatermark', pos)) !== -1) {
  console.log('pos', pos, ':', origMain.slice(Math.max(0, pos - 100), Math.min(origMain.length, pos + 300)));
  pos += 20;
}

console.log('--- Checking autoUpscale in origMain ---');
pos = 0;
while ((pos = origMain.indexOf('autoUpscale', pos)) !== -1) {
  console.log('pos', pos, ':', origMain.slice(Math.max(0, pos - 100), Math.min(origMain.length, pos + 300)));
  pos += 11;
}
