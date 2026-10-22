const fs = require('fs');

const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find where provider definitions are located
let pos = 0;
while ((pos = mainCode.indexOf('id:"muse"', pos)) !== -1) {
  console.log('id:"muse" at', pos);
  console.log(mainCode.slice(Math.max(0, pos - 100), pos + 300));
  pos += 9;
}
if (pos === 0) {
  while ((pos = mainCode.indexOf('"muse"', pos)) !== -1) {
    const chunk = mainCode.slice(Math.max(0, pos - 100), pos + 200);
    if (chunk.includes('startUrl') || chunk.includes('name:')) {
      console.log('Chunk around "muse":', chunk);
    }
    pos += 6;
  }
}
