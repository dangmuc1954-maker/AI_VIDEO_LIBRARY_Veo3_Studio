const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

// Tìm provider Veo3 hoặc download video từ Veo 3
function findMatches(regex) {
  let m;
  while ((m = regex.exec(curMain)) !== null) {
    console.log('Match at', m.index, ':', curMain.slice(m.index, m.index + 200));
  }
}

console.log('=== Provider Veo3 / download video ===');
findMatches(/async\s+[a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]*video_url/g);
findMatches(/downloadVideo|fetchVideo|saveVideo/g);
findMatches(/veo3.*download/g);
findMatches(/GoogleFlow/g);
