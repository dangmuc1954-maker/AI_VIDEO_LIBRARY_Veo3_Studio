const fs = require('fs');
const raw = fs.readFileSync('test_raw.rgba');
const cleaned = fs.readFileSync('test_cleaned_pure_outline.rgba');

let diffCount = 0;
let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
const width = 1536, height = 2752;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (raw[idx] !== cleaned[idx] || raw[idx+1] !== cleaned[idx+1] || raw[idx+2] !== cleaned[idx+2]) {
      diffCount++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

console.log('Modified pixels count:', diffCount);
console.log('Bounding box of modifications:', { minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 });
