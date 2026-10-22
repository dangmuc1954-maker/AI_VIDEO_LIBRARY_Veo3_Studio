const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

// Tìm khai báo At
let pos = 0;
while (true) {
  const idx = content.indexOf('const At=', pos);
  if (idx === -1) break;
  console.log('const At= at', idx, content.slice(idx, idx + 100));
  pos = idx + 1;
}

// Tìm các icon phổ biến như Mic, FileText, Play, Music, Wand, Sparkles
const iconsToFind = ['"Mic"', '"FileText"', '"Play"', '"Sparkles"', '"Volume2"', '"AudioLines"', '"Music"'];
for (const ic of iconsToFind) {
  let idx = content.indexOf(ic);
  if (idx !== -1 && idx < 50000) {
    console.log(`Icon ${ic} is at ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 40), idx + 60));
  }
}
