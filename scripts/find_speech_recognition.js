const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('whisper', pos)) !== -1) {
  console.log('--- whisper in main at pos', pos, '---');
  console.log(content.substring(Math.max(0, pos - 50), Math.min(content.length, pos + 250)));
  pos += 7;
}

const renderers = fs.readdirSync('app/out/renderer/assets');
for (const rf of renderers) {
  if (rf.endsWith('.js')) {
    const rc = fs.readFileSync('app/out/renderer/assets/' + rf, 'utf8');
    if (rc.toLowerCase().includes('whisper') || rc.toLowerCase().includes('speech') || rc.toLowerCase().includes('transcri')) {
      console.log('Match in renderer:', rf);
      let rpos = 0;
      while ((rpos = rc.toLowerCase().indexOf('transcri', rpos)) !== -1) {
        console.log('  transcri at', rpos, ':', rc.substring(Math.max(0, rpos - 30), Math.min(rc.length, rpos + 100)));
        rpos += 8;
      }
    }
  }
}
