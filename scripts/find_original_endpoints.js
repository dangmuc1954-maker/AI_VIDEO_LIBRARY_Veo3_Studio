const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

const regex = /https?:\/\/[a-zA-Z0-9\.\-_]+(?:\/[a-zA-Z0-9\.\-_\/%&=?]*)?/g;
const matches = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  if (m[0].includes('google') || m[0].includes('labs') || m[0].includes('fx') || m[0].includes('flow')) {
    matches.add(m[0]);
  }
}
console.log('Google endpoints in original app:');
for (const u of Array.from(matches).sort()) {
  console.log(u);
}
