const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

const idx = content.indexOf('class uI');
if (idx !== -1) {
  console.log(content.substring(idx, idx + 1500));
}
