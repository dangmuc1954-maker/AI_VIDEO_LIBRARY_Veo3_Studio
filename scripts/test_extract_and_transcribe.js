const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
const video = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\81cd6e51-7ec4-4574-a1d7-d013b251fd35.mp4';
const outWav = path.join(__dirname, '../scratch/test_extracted.wav');
const outFlac = path.join(__dirname, '../scratch/test_extracted.flac');

if (!fs.existsSync(path.join(__dirname, '../scratch'))) {
  fs.mkdirSync(path.join(__dirname, '../scratch'), { recursive: true });
}

console.log('Extracting audio to WAV and FLAC...');
execSync(`"${ffmpeg}" -y -i "${video}" -vn -ar 16000 -ac 1 "${outWav}"`, { stdio: 'inherit' });
execSync(`"${ffmpeg}" -y -i "${video}" -vn -ar 16000 -ac 1 "${outFlac}"`, { stdio: 'inherit' });

console.log('WAV size:', fs.statSync(outWav).size);
console.log('FLAC size:', fs.statSync(outFlac).size);
