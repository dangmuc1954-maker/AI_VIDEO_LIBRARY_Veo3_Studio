const fs = require('fs');

const c = fs.readFileSync('app/out/main/index.js', 'utf8');

const regex = /handle\(\s*["']([^"']+)["']/g;
const handles = [];
let m;
while ((m = regex.exec(c)) !== null) {
  handles.push(m[1]);
}
console.log('IPC handles:', handles);
