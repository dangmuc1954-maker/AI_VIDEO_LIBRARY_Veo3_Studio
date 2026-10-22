const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');
let pos = 0;
while ((pos = content.indexOf('"Full HD"', pos)) !== -1) {
  console.log(pos, content.slice(pos - 30, pos + 80));
  pos += 10;
}
