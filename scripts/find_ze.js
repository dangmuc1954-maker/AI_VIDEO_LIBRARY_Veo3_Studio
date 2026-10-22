const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/StudioPrimitives-CEIXwDK6.js', 'utf8');

const idx = content.indexOf('function ze(');
console.log('function ze at', idx);
if (idx !== -1) {
  console.log(content.slice(idx, idx + 400));
} else {
  const cIdx = content.indexOf('ze=');
  console.log('ze= at', cIdx);
  console.log(content.slice(cIdx - 50, cIdx + 400));
}
