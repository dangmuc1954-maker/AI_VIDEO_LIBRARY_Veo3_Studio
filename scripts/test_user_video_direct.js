const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ffmpeg = path.join(__dirname, '../app/node_modules/ffmpeg-static/ffmpeg.exe');
const videoPath = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\31a0165a-3b44-4445-b05a-84ea4f11be9e.mp4';
const outWav = path.join(__dirname, '../scratch/test_user_video.wav');

try {
  const probe = execSync(`"${ffmpeg}" -i "${videoPath}" 2>&1`, { encoding: 'utf8' });
  console.log('FFprobe output:\n', probe);
} catch (e) {
  console.log('Probe info:\n', e.stdout || e.message);
}

try {
  execSync(`"${ffmpeg}" -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${outWav}"`, { stdio: 'inherit' });
  console.log('Wav created. Exists:', fs.existsSync(outWav), 'Size:', fs.statSync(outWav).size);
} catch (e) {
  console.error('Extract failed:', e);
}
