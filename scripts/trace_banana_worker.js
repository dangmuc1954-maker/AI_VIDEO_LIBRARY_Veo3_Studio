const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let p = 0;
while ((p = content.indexOf('"banana"', p)) !== -1) {
  const s = content.substring(p - 100, p + 200);
  if (s.includes('execute') || s.includes('run') || s.includes('provider') || s.includes('result')) {
    console.log('--- At ' + p + ' ---');
    console.log(s);
  }
  p += 8;
}
