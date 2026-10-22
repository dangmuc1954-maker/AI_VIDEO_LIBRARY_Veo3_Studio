const fs = require('fs');

const zip3Vs = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Find the timeline strip rendering where clips are mapped
console.log('--- Searching in zip3 VideoStudio ---');
let pos = 0;
while ((pos = zip3Vs.indexOf('.map((', pos)) !== -1) {
  const snippet = zip3Vs.slice(pos, pos + 300);
  if (snippet.includes('clip') || snippet.includes('duration') || snippet.includes('transition')) {
    console.log(`zip3 pos ${pos}:`, snippet);
  }
  pos += 6;
}

console.log('--- Searching in our VideoStudio ---');
pos = 0;
while ((pos = ourVs.indexOf('.map((', pos)) !== -1) {
  const snippet = ourVs.slice(pos, pos + 300);
  if (snippet.includes('clip') || snippet.includes('duration') || snippet.includes('transition')) {
    console.log(`our pos ${pos}:`, snippet);
  }
  pos += 6;
}
