const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const head = content.slice(0, 15000);
const matches = [...head.matchAll(/import\s*\{[^}]*\}\s*from\s*['\"][^'\"]+['\"]/g)];
for (const m of matches) {
  if (m[0].includes('J')) {
    console.log('Import with J:', m[0]);
  }
}
