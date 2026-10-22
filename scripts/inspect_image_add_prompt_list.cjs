const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// Find where a= or addPromptList is called in ja
const jaIdx = s.indexOf('function ja(');
const jaCode = s.substring(jaIdx, jaIdx + 3000);
const m = jaCode.match(/(?:const|let|var|,)\s*a\s*=\s*[^,;]+/);
console.log('a in ja:', m ? m[0] : 'None');

// Also find where addPromptList is defined in the store
let pos = 0;
while ((pos = s.indexOf('addPromptList', pos + 1)) !== -1) {
  console.log('addPromptList at', pos, ':', s.substring(pos - 40, pos + 200));
}
