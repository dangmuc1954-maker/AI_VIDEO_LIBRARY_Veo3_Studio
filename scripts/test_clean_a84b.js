const fs = require('fs');
const path = require('path');

// Let's inspect removeImageWatermark
const file = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/a84b29da-779a-46da-8663-331067d2f729.jpg';
const buf = fs.readFileSync(file);

const Cleaner = require('../app/modules/media_watermark_cleaner.cjs');
const cleaner = new Cleaner();

console.log('Testing cleaner on a84b...');
cleaner.cleanMediaWatermark(file, 'C:/Users/admin/AppData/Local/Temp/test_a84b_clean.jpg', { removeWatermark: true })
  .then(res => {
    console.log('Cleaner result:', res);
  })
  .catch(err => {
    console.error('Cleaner error:', err);
  });
