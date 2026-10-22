const fs = require('fs');

const content = fs.readFileSync('extracted_original_20260912/out/main/index.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('jy(', pos)) !== -1) {
  console.log(`=== jy( at ${pos} ===`);
  console.log(content.slice(Math.max(0, pos - 200), Math.min(content.length, pos + 400)));
  pos += 3;
}
