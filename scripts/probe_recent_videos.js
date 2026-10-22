const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets';
const files = fs.readdirSync(assetsDir);
const sorted = files.map(f => {
  const st = fs.statSync(path.join(assetsDir, f));
  return { name: f, time: st.mtimeMs, size: st.size };
}).sort((a, b) => b.time - a.time);

console.log('Latest 10 assets:');
console.log(sorted.slice(0, 10));

// Kiểm tra 3 file video gần nhất xem có stream audio không bằng ffprobe
const videos = sorted.filter(f => f.name.endsWith('.mp4')).slice(0, 3);
console.log('\nAnalyzing latest videos:');
for (const v of videos) {
  const p = path.join(assetsDir, v.name);
  console.log(`\nVideo: ${v.name} (${(v.size / 1024 / 1024).toFixed(2)} MB)`);
  try {
    const probe = execSync(`ffprobe -v error -show_entries stream=codec_type,codec_name -of json "${p}"`, { encoding: 'utf8' });
    console.log('Streams:', probe.trim());
  } catch (err) {
    console.log('ffprobe error:', err.message);
  }
}
