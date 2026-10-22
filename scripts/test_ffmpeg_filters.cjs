const { execSync } = require('child_process');
const fs = require('fs');

const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';
console.log('FFmpeg exists:', fs.existsSync(ffmpeg));
if (fs.existsSync(ffmpeg)) {
  const out = execSync(`"${ffmpeg}" -filters`).toString();
  console.log('Has delogo filter:', out.includes('delogo'));
}
