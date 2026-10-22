const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function showAround(pattern) {
  const idx = content.indexOf(pattern);
  if (idx !== -1) {
    console.log('=== ' + pattern + ' ===');
    console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 400)));
  }
}

showAround('Se.fromPartition');
showAround('fromPartition(');
