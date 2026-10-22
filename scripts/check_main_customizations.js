const fs = require('fs');

const appMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const keywords = [
  'vercel', 'license', 'trial', 'automerge', 'ffmpeg', 'veo3', 'elevenlabs',
  'AI VIDEO LIBRARY', 'aivideo-asset', 'machineId', 'checkIn'
];

keywords.forEach(kw => {
  let count = 0;
  let idx = 0;
  while ((idx = appMain.indexOf(kw, idx)) !== -1) {
    count++;
    idx += kw.length;
  }
  console.log(`${kw}: ${count} occurrences`);
});
