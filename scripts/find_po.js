const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

function findSnippet(query) {
  let pos = 0;
  while ((pos = content.indexOf(query, pos)) !== -1) {
    console.log('--- FOUND at', pos, '---');
    console.log(content.slice(Math.max(0, pos - 100), pos + 300));
    pos += query.length;
  }
}

console.log('=== SEARCHING Po ===');
findSnippet('Po=');

console.log('=== SEARCHING Ie ===');
findSnippet('Ie=');
