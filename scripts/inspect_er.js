const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js', 'utf8');

const matches = [...content.matchAll(/tt\s*=\s*/g)];
for (const m of matches) {
  console.log('tt= at', m.index);
  console.log(content.slice(m.index, m.index + 500));
}
