const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf-8');

const m = content.match(/https?:\/\/[a-zA-Z0-9.-]+/g);
console.log('Domains in app/out/main/index.js:', [...new Set(m)]);

// Check where Wn() points:
const idxWn = content.indexOf('function Wn');
if (idxWn !== -1) {
  console.log('Wn function:', content.substring(idxWn, idxWn + 300));
}
