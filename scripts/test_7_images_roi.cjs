const fs = require('fs');
const path = require('path');

// Extract Kt class and dependencies from app/out/main/index.js
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// The 7 image files from Tris's test
const assetDir = path.join(process.env.APPDATA || '', 'AI_VIDEO_LIBRARY_DATA', 'assets');
const files = [
  { scene: 1, file: '3931fcf1-ba86-4146-bad8-40c1887fd2c1.jpg' },
  { scene: 2, file: '06d56186-5562-4465-bcec-365abe5096c2.jpg' },
  { scene: 3, file: '690e22e5-f6b5-4a4a-889e-fcddd6e3036b.jpg' },
  { scene: 4, file: 'ad250d91-0cf2-4635-b34c-07f2ed7dda0f.jpg' },
  { scene: 5, file: '5f708360-fb12-4a7a-8cb8-5f6787fb4dea.jpg' },
  { scene: 6, file: '37902e73-bf5b-40b1-b261-6ee50d4b337f.jpg' },
  { scene: 7, file: '489e5f5f-6d01-4d17-b9c9-dfcb21abc081.jpg' }
];

console.log('Testing probeDimensions and aspect ratio of all 7 images:');
const Cleaner = require('./app/modules/media_watermark_cleaner.cjs');
const cleaner = new Cleaner();

(async () => {
  for (const item of files) {
    const p = path.join(assetDir, item.file);
    if (!fs.existsSync(p)) {
      console.log(`Scene ${item.scene}: File not found`);
      continue;
    }
    const dims = await cleaner.probeDimensions(p);
    const roi = cleaner.computeWatermarkRoi(dims.width, dims.height);
    console.log(`Scene ${item.scene} (${item.file}): ${dims.width}x${dims.height}, ROI:`, roi);
  }
})();
