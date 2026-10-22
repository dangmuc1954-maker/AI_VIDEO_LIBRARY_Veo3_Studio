const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

let pos = 0;
while (true) {
  const idx = curMain.indexOf('submitVideo(', pos);
  if (idx === -1) break;
  console.log('submitVideo( at', idx);
  console.log(curMain.slice(idx - 100, idx + 1000));
  pos = idx + 1;
}
