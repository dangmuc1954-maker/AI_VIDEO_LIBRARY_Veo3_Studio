const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

// Tìm chỗ Do (ffmpeg binary) được dùng trong curMain
let pos = 0;
while (true) {
  const idx = curMain.indexOf('await Do(', pos);
  if (idx === -1) break;
  console.log('await Do at', idx);
  console.log(curMain.slice(idx - 50, idx + 250));
  pos = idx + 1;
}
