const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = curMain.lastIndexOf('function nl(', 163184);
console.log('function nl( at', idx);
if (idx !== -1) {
  console.log(curMain.slice(idx, idx + 2500));
} else {
  // Tìm nl=
  const idx2 = curMain.lastIndexOf('nl=', 163184);
  console.log('nl= at', idx2);
  console.log(curMain.slice(idx2 - 50, idx2 + 2500));
}
