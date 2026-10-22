const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const regex = /options:\s*p\.provider\s*===/g;
let m;
while ((m = regex.exec(content)) !== null) {
  console.log(content.slice(m.index - 50, m.index + 200));
}
