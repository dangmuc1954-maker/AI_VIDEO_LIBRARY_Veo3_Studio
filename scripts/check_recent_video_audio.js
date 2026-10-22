const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const videoPath = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets/8f6cbeef-e4c0-4b30-8f62-a400af898339.mp4';
const outWav = 'D:/dự án antigravity/AIForge_Veo3_Studio/scratch/test_extract.wav';

// Trích xuất audio
try {
  execSync(`ffmpeg -y -i "${videoPath}" -vn -ar 16000 -ac 1 "${outWav}"`, { stdio: 'inherit' });
  console.log('Wav file created, size:', fs.statSync(outWav).size);
} catch (e) {
  console.error('Extract error:', e.message);
}

// Kiểm tra âm lượng (volumedetect) của audio trong video
try {
  const volOutput = execSync(`ffmpeg -i "${videoPath}" -af "volumedetect" -vn -sn -dn -f null NUL`, { encoding: 'utf8', stderr: 'pipe' });
  console.log('Volume output:');
  console.log(volOutput);
} catch (e) {
  console.log('Volume stderr:');
  console.log(e.stderr || e.message);
}
