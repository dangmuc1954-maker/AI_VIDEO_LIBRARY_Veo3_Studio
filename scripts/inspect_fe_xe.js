const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function showAround(query) {
  let idx = 0;
  while ((idx = content.indexOf(query, idx)) !== -1) {
    console.log('=== ' + query + ' at ' + idx + ' ===');
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
    idx += query.length;
  }
}

showAround('Xe=');
showAround('Fe=');
showAround('Fe.has(');
