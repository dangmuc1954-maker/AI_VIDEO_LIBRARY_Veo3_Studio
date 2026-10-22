const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ffmpegBin = path.resolve('app/node_modules/ffmpeg-static/ffmpeg.exe');
const inputVideo = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/15173425-b2d0-42eb-a748-fe01e49d7826.mp4';
const outputVideo = path.resolve('scratch/test_delogo_out.mp4');

if (!fs.existsSync('scratch')) fs.mkdirSync('scratch', { recursive: true });

// 1. Probe video dimension
const probeCmd = `"${ffmpegBin}" -hide_banner -i "${inputVideo}"`;
let probeStderr = '';
try {
  execSync(probeCmd, { stdio: 'pipe' });
} catch (e) {
  probeStderr = e.stderr.toString();
}

const matchDim = probeStderr.match(/Stream[^\n]*Video:[^\n]*\b(\d{2,5})x(\d{2,5})\b/);
if (!matchDim) {
  console.error('Could not probe video dimension:', probeStderr);
  process.exit(1);
}

const width = parseInt(matchDim[1], 10);
const height = parseInt(matchDim[2], 10);
console.log(`Video dimension: ${width}x${height}`);

// Veo watermark position calculation:
// Watermark is at bottom-right corner.
// size s = round(min(w, h) / 15)
// For 720x1280 (portrait): s = 48, marginRight = 72 (or 96), marginBottom = 72 (or 96).
// For 1280x720 (landscape): s = 48, marginRight = 72, marginBottom = 72.
// For 1920x1080: s = 72, marginRight = 108, marginBottom = 108.
const s = Math.round(Math.min(width, height) / 15);
const margin = Math.round(s * 1.5);
// To cover both star and potential padding cleanly:
const boxW = Math.round(s * 1.3);
const boxH = Math.round(s * 1.3);
const x = width - margin - boxW + Math.round(s * 0.15);
const y = height - margin - boxH + Math.round(s * 0.15);

console.log(`Watermark ROI: x=${x}, y=${y}, w=${boxW}, h=${boxH}, s=${s}`);

const startTime = Date.now();
const filterStr = `delogo=x=${x}:y=${y}:w=${boxW}:h=${boxH}`;
const delogoCmd = `"${ffmpegBin}" -y -i "${inputVideo}" -filter_complex "[0:v]${filterStr}[v]" -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset veryfast -c:a copy "${outputVideo}"`;

console.log('Running delogo command...');
execSync(delogoCmd, { stdio: 'inherit' });
const durationMs = Date.now() - startTime;
console.log(`Delogo completed in ${durationMs}ms!`);
console.log('Output exists:', fs.existsSync(outputVideo), 'Size:', fs.statSync(outputVideo).size);
