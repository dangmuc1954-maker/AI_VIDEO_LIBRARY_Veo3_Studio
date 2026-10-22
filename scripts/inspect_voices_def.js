const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WaveSurferPlayer-D-cjCZYq.js', 'utf8');

const start = content.indexOf('Ninh Đôn');
if (start !== -1) {
  const end = content.indexOf('];', start);
  console.log(content.slice(start - 50, end + 2));
}
