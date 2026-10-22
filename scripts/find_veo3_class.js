const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

// Tìm class Ua hoặc new Ua("veo3"
const idx = curMain.indexOf('new Ua("veo3"');
console.log('new Ua("veo3" at', idx);
if (idx !== -1) {
  console.log(curMain.slice(idx - 100, idx + 300));
}

// Tìm class Ua
const classIdx = curMain.lastIndexOf('class Ua', idx);
console.log('class Ua at', classIdx);
if (classIdx !== -1) {
  console.log(curMain.slice(classIdx, classIdx + 1500));
}
