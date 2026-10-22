const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

// We can slice all watermark detector code from index.js
// Start around Hn or iP
const startPos = content.indexOf('function iP(');
// Find preceding helpers
const helperStart = content.lastIndexOf('function Hn(', startPos);
const endPos = content.indexOf('class Kt', startPos);

const detectorCode = content.substring(helperStart, endPos);

// Save to scratch script
const testScript = `
const fs = require('fs');
const { spawn } = require('child_process');

${detectorCode}

const ffmpeg = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/node_modules/ffmpeg-static/ffmpeg.exe';
const file = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/b50f5a36-8f6d-4402-9e55-000a350ff104.jpg';
const buf = fs.readFileSync(file);

function decodeImageToRgba(ffmpegPath, buf) {
  return new Promise((resolve, reject) => {
    const proc = spawn(ffmpegPath, ["-hide_banner", "-f", "image2pipe", "-i", "pipe:0", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"]);
    const chunks = [];
    let stderr = "";
    proc.stdout.on("data", c => chunks.push(c));
    proc.stderr.on("data", d => stderr += d.toString());
    proc.on("close", code => {
      const match = stderr.match(/Stream.*Video:.*,\\s*(\\d{3,4})x(\\d{3,4})/i) || stderr.match(/,\\s*(\\d{3,4})x(\\d{3,4})/);
      const width = match ? parseInt(match[1], 10) : 0;
      const height = match ? parseInt(match[2], 10) : 0;
      resolve({ width, height, rgba: Buffer.concat(chunks) });
    });
    proc.stdin.end(buf);
  });
}

decodeImageToRgba(ffmpeg, buf).then(res => {
  const detections = iP({ width: res.width, height: res.height, data: res.rgba });
  console.log('Detections count:', detections.length);
  detections.forEach((d, i) => {
    console.log('Detection', i, ':', { box: { x: d.x, y: d.y, size: d.size }, confidence: d.confidence, darkPolarity: d.darkPolarity });
  });
}).catch(err => {
  console.error('Error:', err);
});
`;

fs.writeFileSync('scripts/test_ip_b50.js', testScript);
console.log('Wrote scripts/test_ip_b50.js');
