const fs = require('fs');
const installedMain = 'C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js';
const content = fs.readFileSync(installedMain, 'utf8');

let pos = 0;
while (true) {
  const idx = content.indexOf('transcribeVideoAudio', pos);
  if (idx === -1) break;
  console.log(`Found transcribeVideoAudio at ${idx}:`);
  console.log(content.slice(Math.max(0, idx - 40), idx + 200));
  pos = idx + 1;
}
