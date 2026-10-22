const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('VideoStudio length:', content.length);

// Let's find preview item card component
// In preview, each card has status pills, video or error, prompt text
const idx = content.indexOf('videoBlankPromptWarning');
console.log('videoBlankPromptWarning at:', idx);

// Search for where preview cards are rendered:
const p1 = content.indexOf('filterRunning');
console.log('filterRunning at:', p1);

if (p1 !== -1) {
  console.log('Context around filterRunning:\n', content.slice(p1 - 200, p1 + 500));
}
