const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Tìm các đoạn có promptId trong payload
const payloadMatches = [...content.matchAll(/payload:\s*\{[^}]*promptId/g)];
console.log('payloadMatches count:', payloadMatches.length);
for (const m of payloadMatches) {
  const start = Math.max(0, m.index - 100);
  const end = Math.min(content.length, m.index + 300);
  console.log('--- MATCH ---');
  console.log(content.slice(start, end));
}
