const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

let idx = 0;
while ((idx = content.indexOf('providerId: "veo3"', idx)) !== -1 || (idx = content.indexOf('providerId:"veo3"', idx)) !== -1) {
  console.log('--- FOUND PROVIDER VEO3 AT ' + idx + ' ---');
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 600)));
  idx += 17;
}

// Also find loginUrl or startUrl
const idx2 = content.indexOf('https://labs.google/fx');
console.log('--- LABS.GOOGLE/FX AT ' + idx2 + ' ---');
console.log(content.slice(Math.max(0, idx2 - 50), Math.min(content.length, idx2 + 250)));
