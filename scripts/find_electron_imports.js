const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const r = /require\(['"]electron['"]\)/g;
let m;
while ((m = r.exec(content)) !== null) {
  console.log('require electron at', m.index, content.slice(Math.max(0, m.index - 50), m.index + 200));
}

// Also check webContents.on
const r2 = /webContents\.on\(/g;
while ((m = r2.exec(content)) !== null) {
  console.log('webContents.on at', m.index, content.slice(Math.max(0, m.index - 50), m.index + 200));
  break;
}
