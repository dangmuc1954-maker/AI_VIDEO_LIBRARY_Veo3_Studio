const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const regex = /async\s+transcribeVideoAudio\s*\(/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log('Definition of transcribeVideoAudio at', m.index);
  console.log(content.slice(m.index, m.index + 200));
}
