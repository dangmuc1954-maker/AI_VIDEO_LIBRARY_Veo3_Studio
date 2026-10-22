const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((l, idx) => {
  if (l.includes('handle') || l.includes('generate') || l.includes('Script') || l.includes('Video') || l.includes('Showroom') || l.includes('Prompt') || l.includes('referenceAsset')) {
    if (l.includes('const ') || l.includes('let ') || l.includes('function ') || l.includes('async ')) {
      console.log(`Line ${idx+1}: ${l.trim().substring(0, 120)}`);
    }
  }
});
