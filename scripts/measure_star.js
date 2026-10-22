const fs = require('fs');
const rgba = fs.readFileSync('test_raw.rgba');
const width = 1536, height = 2752;

// Let's examine a 150x150 window around (1390, 2600):
// In this window, compute horizontal gradient gx and vertical gradient gy to see where the edges are.
const xStart = 1350, yStart = 2550;
const w = 150, h = 150;

let maxGrad = 0;
const edgePixels = [];

for (let y = yStart + 1; y < yStart + h - 1; y++) {
  for (let x = xStart + 1; x < xStart + w - 1; x++) {
    const idx = (y * width + x) * 4;
    const lum = (x_pos, y_pos) => {
      const i = (y_pos * width + x_pos) * 4;
      return rgba[i] * 0.2126 + rgba[i+1] * 0.7152 + rgba[i+2] * 0.0722;
    };
    const gx = lum(x+1, y) - lum(x-1, y);
    const gy = lum(x, y+1) - lum(x, y-1);
    const g = Math.sqrt(gx*gx + gy*gy);
    if (g > 15) {
      edgePixels.push({ x, y, g });
    }
  }
}

console.log('Found edge pixels with gradient > 15:', edgePixels.length);
if (edgePixels.length > 0) {
  let minX = 9999, maxX = -1, minY = 9999, maxY = -1;
  for (const p of edgePixels) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  console.log('Edge bounds:', { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY });
}
