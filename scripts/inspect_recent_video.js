const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegBin = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
console.log('Using FFmpeg:', ffmpegBin);

const video = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\81cd6e51-7ec4-4574-a1d7-d013b251fd35.mp4';
console.log('Video exists:', fs.existsSync(video));

try {
  const out = execSync(`"${ffmpegBin}" -i "${video}"`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  console.log('Probe output:', out);
} catch (e) {
  console.log('Probe stderr:\n', e.stderr);
}
