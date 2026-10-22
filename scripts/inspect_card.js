const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('Grid context (48000 - 54000):');
const idx = content.indexOf('blankPrompt');
console.log('All blankPrompt indices:');
let pos = 0;
while ((pos = content.indexOf('blankPrompt', pos)) !== -1) {
  console.log('Found blankPrompt at', pos, ':', content.slice(Math.max(0, pos - 120), Math.min(content.length, pos + 120)));
  pos += 11;
}
