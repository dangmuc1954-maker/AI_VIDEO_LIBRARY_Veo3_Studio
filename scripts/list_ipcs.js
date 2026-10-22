const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const regex = /\.handle\((["'][^"']+["'])/g;
const matches = [];
let m;
while ((m = regex.exec(c)) !== null) {
  matches.push(m[1]);
}
console.log('IPC handles:', matches);
