const fs = require('fs');
const filePath = 'app/out/renderer/assets/VideoFactoryStudio.js';
let content = fs.readFileSync(filePath, 'utf8');

const old12 = `            autoRemoveWatermark: cs.removeWatermark,
            removeWatermark: cs.removeWatermark,
            upscale2k: cs.imageResolution === '2k',
            resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

const new12 = `            autoRemoveWatermark: cs.removeWatermark,
            removeWatermark: cs.removeWatermark,
            upsampleResolution: cs.imageResolution === '2k' ? '2K' : 'Full HD',
            resolution: cs.imageResolution === '2k' ? '2K' : 'Standard',
            quality: cs.imageResolution === '2k' ? '2K' : 'Standard',
            imageResolution: cs.imageResolution,
            upscale2k: cs.imageResolution === '2k',
            resolutionName: cs.imageResolution === '2k' ? "2K" : "1K",`;

let count = 0;
while (content.includes(old12)) {
  content = content.replace(old12, new12);
  count++;
}
console.log('Replaced', count, 'instances with 12 spaces');
fs.writeFileSync(filePath, content, 'utf8');
