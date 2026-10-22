const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const regex2 = /readyUrlPatterns:\s*\[[^\]]+\]/g;
let m;
while ((m = regex2.exec(content)) !== null) {
  const start = Math.max(0, m.index - 80);
  const end = Math.min(content.length, m.index + m[0].length + 40);
  console.log(content.slice(start, end));
  console.log('===');
}
