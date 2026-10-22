const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = 0;
while (true) {
  const nextPos = s.indexOf('$r', pos + 1);
  if (nextPos === -1) break;
  // Check if it's a standalone identifier or JSX: e.jsx($r, ...)
  const snippet = s.substring(Math.max(0, nextPos - 30), Math.min(s.length, nextPos + 100));
  if (snippet.includes('jsx($r') || snippet.includes('jsxs($r') || snippet.includes('$r,')) {
    console.log('Match at pos:', nextPos);
    console.log(snippet);
    console.log('-------------------------');
  }
  pos = nextPos;
}
