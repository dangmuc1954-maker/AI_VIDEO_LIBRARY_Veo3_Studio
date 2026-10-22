const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

// Find occurrences of tts
const regex = /tts/gi;
let match;
const matches = [];
while ((match = regex.exec(code)) !== null) {
  matches.push({
    index: match.index,
    snippet: code.slice(Math.max(0, match.index - 100), Math.min(code.length, match.index + 100))
  });
}

console.log(`Found ${matches.length} occurrences of 'tts':`);
matches.forEach((m, idx) => {
  console.log(`\n[${idx + 1}] at index ${m.index}:`);
  console.log(m.snippet);
});
