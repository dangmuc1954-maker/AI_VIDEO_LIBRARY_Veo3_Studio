const fs = require('fs');
const s = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// Search for addJob or generationRunId
let pos = 0;
while ((pos = s.indexOf('generationRunId', pos + 1)) !== -1) {
  console.log('generationRunId at', pos, ':');
  console.log(s.substring(Math.max(0, pos - 150), Math.min(s.length, pos + 250)));
}
