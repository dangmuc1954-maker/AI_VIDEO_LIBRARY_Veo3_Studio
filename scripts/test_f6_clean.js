const fs = require('fs');
const path = require('path');
const os = require('os');

const f6 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\490933d3-2f25-4cc1-92a7-cd8146974e1d.jpg';
const f7 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\7d1b7b7d-4dd1-475f-b286-2022f1be3263.jpg';

const MediaCleaner = require('./app/modules/media_watermark_cleaner.cjs');
const cleaner = new MediaCleaner();

// Test both files
async function test() {
  const buf6 = fs.readFileSync(f6);
  const dims6 = await cleaner.probeDimensions(f6);
  console.log('Cảnh 6 dims:', dims6);
  const roi6 = cleaner.computeWatermarkRoi(dims6.width, dims6.height);
  console.log('Cảnh 6 ROI:', roi6);

  const _tIn = path.join(os.tmpdir(), 'debug_in_f6.jpg');
  const _tOut = path.join(os.tmpdir(), 'debug_out_f6.jpg');
  fs.writeFileSync(_tIn, buf6);
  const r = await cleaner.cleanMediaWatermark(_tIn, _tOut, { removeWatermark: true });
  console.log('cleanMediaWatermark result:', r);
}

test().catch(console.error);
