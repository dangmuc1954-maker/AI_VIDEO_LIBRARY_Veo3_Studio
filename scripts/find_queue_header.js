const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const terms = ['Add row', 'Queue', 'addRow', 'searchPrompts', 'prompts', 'LỒNG TIẾNG'];
for (const t of terms) {
  let idx = 0;
  while ((idx = content.indexOf(t, idx)) !== -1) {
    console.log(`\nFound term "${t}" at index: ${idx}`);
    console.log(content.slice(Math.max(0, idx - 120), Math.min(content.length, idx + 250)));
    idx += t.length;
    if (idx > 200000) break;
  }
}
