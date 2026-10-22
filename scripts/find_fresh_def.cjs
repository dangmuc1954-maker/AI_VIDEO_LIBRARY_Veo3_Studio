const fs = require('fs');
const content = fs.readFileSync('scripts/extracted/main_index.js', 'utf-8');

const regex = /withFreshEntitlement\s*\(|withFreshEntitlement\s*=/g;
let m;
while ((m = regex.exec(content)) !== null) {
  const start = Math.max(0, m.index - 200);
  const end = Math.min(content.length, m.index + 400);
  console.log('Def at:', m.index);
  console.log(content.substring(start, end));
  console.log('=============================');
}
