const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MediaWatermarkCleaner = require('../app/modules/media_watermark_cleaner.cjs');

const cleaner = new MediaWatermarkCleaner();
const ffmpeg = cleaner.ffmpegPath;
const p = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const outCrop = path.join(__dirname, 'test_crop_b50.png');

console.log('Using ffmpeg:', ffmpeg);
execSync(`"${ffmpeg}" -y -i "${p}" -filter_complex crop=300:200:468:1176 "${outCrop}"`);
console.log('Cropped successfully, exists:', fs.existsSync(outCrop), 'size:', fs.statSync(outCrop).size);
