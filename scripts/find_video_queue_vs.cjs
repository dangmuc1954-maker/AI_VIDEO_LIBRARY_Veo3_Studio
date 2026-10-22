const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Search for videoQueue or queue title
let pos = 0;
while ((pos = content.indexOf('videoQueue', pos)) !== -1) {
  console.log('videoQueue at', pos, ':');
  console.log(content.slice(Math.max(0, pos - 100), pos + 300));
  console.log('---');
  pos += 10;
}
