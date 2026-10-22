const fs = require('fs');
const code = fs.readFileSync('./extracted_original/out/main/index.js', 'utf8');
const regex = /from\s*["']([^"']+)["']/g;
const imports = [];
let match;
while ((match = regex.exec(code)) !== null) {
  imports.push(match[1]);
}
console.log('All packages imported in out/main/index.js:');
console.log([...new Set(imports)]);
