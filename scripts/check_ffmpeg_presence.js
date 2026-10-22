const fs = require('fs');
const cp = require('child_process');

console.log('--- Checking ffmpeg in system & app paths ---');
const possibleFfmpegPaths = [
  'ffmpeg',
  'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe',
  'C:/Users/admin/AppData/Local/Programs/aiforge-studio/resources/app.asar.unpacked/node_modules/ffmpeg-static/ffmpeg.exe',
  'd:/dự án antigravity/AIForge_Veo3_Studio/app/node_modules/ffmpeg-static/ffmpeg.exe',
  'd:/dự án antigravity/AIForge_Veo3_Studio/dist/AI_VIDEO_LIBRARY_Khach_Hang_v3.0/resources/app/node_modules/ffmpeg-static/ffmpeg.exe'
];

possibleFfmpegPaths.forEach(p => {
  try {
    const res = cp.execSync(`"${p}" -version`, { stdio: 'pipe' }).toString().split('\n')[0];
    console.log('FOUND:', p, '->', res);
  } catch (e) {
    console.log('NOT FOUND or ERROR:', p, '->', e.message);
  }
});
