const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');

// Find where showroomImage is rendered in JSX
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('showroomImage?.url') || l.includes('s.showroomImage') || l.includes('scene.showroomImage')) {
    console.log((idx+1) + ': ' + l.trim());
  }
});
