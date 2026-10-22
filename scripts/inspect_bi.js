const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const matches = [...content.matchAll(/function Bi\s*\(/g)];
console.log('Bi matches:', matches.length);
if (matches.length > 0) {
  const pos = matches[0].index;
  console.log('Bi content:', content.slice(pos, pos + 2500));
} else {
  // Tìm kiếm hàm map jobs
  const jobMapMatches = [...content.matchAll(/\.map\(\s*([a-zA-Z0-9_]+)\s*=>\s*\{[^}]*prompt/g)];
  console.log('jobMapMatches:', jobMapMatches.slice(0, 5).map(m => m[0]));
}
