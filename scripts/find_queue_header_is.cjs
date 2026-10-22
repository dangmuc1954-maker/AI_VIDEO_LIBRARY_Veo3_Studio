const fs = require('fs');

const isCode = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');

// Search for promptQueue or similar
const p1 = isCode.indexOf('imageStudio.promptQueue');
console.log('p1:', p1);
if (p1 !== -1) {
  console.log(isCode.slice(p1 - 100, p1 + 500));
} else {
  // search for header with add prompt
  const p2 = isCode.indexOf('addBlankPrompt');
  console.log('p2:', p2);
  let pos = 0;
  while ((pos = isCode.indexOf('addBlankPrompt', pos)) !== -1) {
    console.log(isCode.slice(Math.max(0, pos - 100), pos + 200));
    console.log('---');
    pos += 14;
  }
}
