const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let p = 0;
let count = 0;
while ((p = content.indexOf('"veo3"', p)) !== -1 && count < 15) {
  console.log('veo3 at', p, ':', content.substring(Math.max(0, p - 60), p + 80));
  p += 6;
  count++;
}
