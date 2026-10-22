const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function showAround(pattern) {
  const idx = content.indexOf(pattern);
  if (idx !== -1) {
    console.log('=== ' + pattern + ' ===');
    console.log(content.slice(idx, idx + 800));
  }
}

showAround('function su(');
showAround('function au(');
showAround('function fn(');
