const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

function findDef(name) {
  let pos = 0;
  while ((pos = content.indexOf(name + "=", pos)) !== -1) {
    console.log(`Def ${name}= at`, pos);
    console.log(content.slice(pos, pos + 100));
    pos += name.length + 1;
  }
}
findDef('ss');
findDef('rs');
