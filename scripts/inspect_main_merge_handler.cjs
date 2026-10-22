const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../app/out/main/index.js');
const main = fs.readFileSync(mainPath, 'utf8');

const searchStr = 'name:"merged_video.mp4"';
const idx = main.indexOf(searchStr);
console.log('merged_video.mp4 pos:', idx);
if (idx !== -1) {
  console.log(main.substring(idx - 100, idx + 400));
}
