const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = 'C:/Users/admin/AppData/Roaming/AI_VIDEO_LIBRARY_DATA/assets';
const files = fs.readdirSync(assetsDir);
const sorted = files.map(f => {
  const st = fs.statSync(path.join(assetsDir, f));
  return { name: f, time: st.mtimeMs, size: st.size, iso: new Date(st.mtimeMs).toLocaleTimeString() };
}).sort((a, b) => b.time - a.time);

console.log('Latest 5 assets:');
console.log(sorted.slice(0, 5));

const latestVideo = sorted.find(f => f.name.endsWith('.mp4'));
console.log('\nLatest video:', latestVideo);

if (latestVideo) {
  const p = path.join(assetsDir, latestVideo.name);
  try {
    const probe = execSync(`ffprobe -v error -show_entries stream=codec_type,codec_name -of json "${p}"`, { encoding: 'utf8' });
    console.log('Streams of latest video:');
    console.log(probe.trim());

    // Check volume
    const vol = execSync(`ffmpeg -i "${p}" -af "volumedetect" -vn -sn -dn -f null NUL`, { encoding: 'utf8', stderr: 'pipe' });
    console.log('Volume output:', vol);
  } catch (err) {
    console.log('Volume/Probe stderr:');
    console.log(err.stderr || err.message);
  }
}
