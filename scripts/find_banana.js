const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('providerId: "banana"') || line.includes("providerId: 'banana'")) {
    console.log('=== Line ' + (idx + 1) + ' ===');
    for (let i = Math.max(0, idx - 3); i < Math.min(lines.length, idx + 25); i++) {
      console.log((i+1) + ': ' + lines[i]);
    }
  }
});
