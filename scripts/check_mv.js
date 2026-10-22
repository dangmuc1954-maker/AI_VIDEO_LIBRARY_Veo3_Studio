const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

const idx = content.indexOf('src:Mv');
console.log('src:Mv found at', idx);
const before = content.slice(Math.max(0, idx - 400), idx + 200);
console.log('Context:\n', before);

const mvDef = content.match(/[a-zA-Z0-9_$]*Mv\s*=[^;,]+/g);
console.log('Mv def:', mvDef);

const matches = [];
let re = /([a-zA-Z0-9_$]+)\s*=\s*["'][^"']*(?:icon|png|svg|app)[^"']*["']/g;
let m;
while ((m = re.exec(content)) !== null) {
  if (m[0].includes('Mv') || m[0].includes('app-icon') || m[0].includes('icon')) {
    matches.push(m[0]);
  }
}
console.log('Icon def matches:', matches);
