const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const file = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const buf = fs.readFileSync(file);

// Let's test the entire removeImageWatermark function by extracting it from app/out/main/index.js
// Or testing its steps:
const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';

function decodeImageToRgba(ffmpegPath, buf) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, ["-hide_banner", "-f", "image2pipe", "-i", "pipe:0", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"]);
    const chunks = [];
    let stderr = "";
    proc.stdout.on("data", c => chunks.push(c));
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      const match = stderr.match(/Stream.*Video:.*,\s*(\d{3,4})x(\d{3,4})/i) || stderr.match(/,\s*(\d{3,4})x(\d{3,4})/);
      const width = match ? parseInt(match[1], 10) : 0;
      const height = match ? parseInt(match[2], 10) : 0;
      resolve({ width, height, rgba: Buffer.concat(chunks) });
    });
    proc.stdin.end(buf);
  });
}

decodeImageToRgba(ffmpeg, buf).then(res => {
  console.log('Decoded dimensions:', res.width, 'x', res.height);
  console.log('RGBA buffer length:', res.rgba.length, 'expected:', res.width * res.height * 4);
});
