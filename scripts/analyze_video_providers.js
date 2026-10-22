const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
const code = fs.readFileSync(vsPath, 'utf8');

const rx = /(===|!==|==|!=)\s*["'](Grok|Veo3)["']/g;
let m;
while ((m = rx.exec(code)) !== null) {
  console.log(m.index, m[0], 'context:', code.substring(Math.max(0, m.index - 40), Math.min(code.length, m.index + 70)));
}
