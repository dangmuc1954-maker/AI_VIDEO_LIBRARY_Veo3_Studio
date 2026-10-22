const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('f.imageAsset') || l.includes('frame.imageAsset')) {
    console.log((idx+1) + ': ' + l.trim());
  }
});
