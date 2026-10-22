const fs = require('fs');
const path = require('path');

// Let's test the fallback path in removeImageWatermark
const imgPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const bytes = fs.readFileSync(imgPath);

// Let's test what MediaWatermarkCleaner in app/modules/media_watermark_cleaner.cjs does on this file
const MediaWatermarkCleaner = require('../app/modules/media_watermark_cleaner.cjs');
const cleaner = new MediaWatermarkCleaner();

async function run() {
  const tmpIn = path.join(require('os').tmpdir(), 'test_in.jpg');
  const tmpOut = path.join(require('os').tmpdir(), 'test_out.jpg');
  fs.writeFileSync(tmpIn, bytes);

  console.log('Testing MediaWatermarkCleaner on b50f...');
  const res = await cleaner.cleanMediaWatermark(tmpIn, tmpOut, { removeWatermark: true });
  console.log('Result:', res);
  console.log('Output exists?', fs.existsSync(tmpOut), 'size:', fs.existsSync(tmpOut) ? fs.statSync(tmpOut).size : 0);

  // Now let's crop test_out.jpg to see if watermark is gone!
  const outCropClean = path.join(__dirname, 'test_crop_clean.png');
  const ffmpeg = cleaner.ffmpegPath;
  const { execSync } = require('child_process');
  execSync(`"${ffmpeg}" -y -i "${tmpOut}" -filter_complex crop=300:200:468:1176 "${outCropClean}"`);
  console.log('Cropped clean exists:', fs.existsSync(outCropClean));
}

run().catch(console.error);
