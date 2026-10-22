const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const regex = /\.checkIn\(/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('--- At', m.index);
  console.log(content.slice(Math.max(0, m.index - 100), Math.min(content.length, m.index + 250)));
}
