const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const appData = process.env.APPDATA;
const wavPath = path.join(appData, 'AI_VIDEO_LIBRARY_DATA/assets/extracted_raw_f5102f2db893.wav');
const mp4Path = path.join(appData, 'AI_VIDEO_LIBRARY_DATA/assets/df6b4daf-b183-43be-b84d-1c91eb545efc.mp4');
const ffmpegPath = path.join(__dirname, '../extracted_original/node_modules/ffmpeg-static/ffmpeg.exe');

console.log('=== INSPECTING AUDIO OF GENERATED VIDEO ===');
try {
  // Check volume / sound level of wavPath using ffmpeg volumedetect
  const out = execFileSync(ffmpegPath, [
    '-i', wavPath,
    '-af', 'volumedetect',
    '-f', 'null',
    'NUL'
  ], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (e) {
  // ffmpeg outputs volumedetect to stderr
  console.log('Audio stats:\n', e.stderr);
}
