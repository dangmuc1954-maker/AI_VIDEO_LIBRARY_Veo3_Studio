const fs = require('fs');
const path = require('path');

const preloadPath = path.join(__dirname, '..', 'app', 'out', 'preload', 'index.cjs');
const content = fs.readFileSync(preloadPath, 'utf8');

const idx = content.indexOf('assets:');
console.log('assets in preload at:', idx);
if (idx !== -1) {
  console.log(content.slice(idx - 50, idx + 800));
}
