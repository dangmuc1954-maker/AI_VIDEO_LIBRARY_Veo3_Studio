const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');
const matches = content.match(/import\s*\{[^}]+\}\s*from\s*['"][^'"]+['"]/g);
console.log('Matches:', matches ? matches.slice(0, 5) : 'none');
if (!matches) {
  const imp = content.match(/import[^\n;]+/g);
  console.log('All imports:', imp ? imp.slice(0, 10) : 'none');
}
