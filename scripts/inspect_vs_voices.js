const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

// Find the select or dropdown in VideoStudio
const idx = code.indexOf('option');
let pos = 0;
const snippets = [];
while ((pos = code.indexOf('Ninh Đôn', pos)) !== -1) {
  snippets.push(code.slice(pos, pos + 500));
  pos += 10;
}
console.log('Occurrences of Ninh Đôn:', snippets.length);
snippets.forEach((s, i) => console.log(`\n[${i+1}]`, s));
