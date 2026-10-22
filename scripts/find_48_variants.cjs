const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const regex = /"48[^"]*"/g;
const found = new Set();
let m;
while ((m = regex.exec(content)) !== null) {
  found.add(m[0]);
}
console.log('Unique 48 variants:', Array.from(found));
