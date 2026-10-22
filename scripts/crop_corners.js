const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const f6 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\490933d3-2f25-4cc1-92a7-cd8146974e1d.jpg';
const f2 = 'C:\\Users\\admin\\AppData\\Roaming\\AI_VIDEO_LIBRARY_DATA\\assets\\239a0696-0a2c-4e36-a762-03cd4e8ffec3.jpg';

const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';

// Let's crop the bottom right corner (last 150x150 pixels) of both images
const out6 = path.join(os.tmpdir(), 'crop_f6.png');
const out2 = path.join(os.tmpdir(), 'crop_f2.png');

try {
  execSync(`"${ffmpeg}" -y -i "${f6}" -filter_complex "[0:v]crop=150:150:618:1226[v]" -map "[v]" "${out6}"`);
  execSync(`"${ffmpeg}" -y -i "${f2}" -filter_complex "[0:v]crop=150:150:618:1226[v]" -map "[v]" "${out2}"`);
  console.log('Cropped successfully!');
  console.log('f6 crop size:', fs.statSync(out6).size);
  console.log('f2 crop size:', fs.statSync(out2).size);
} catch (e) {
  console.error(e.message);
}
