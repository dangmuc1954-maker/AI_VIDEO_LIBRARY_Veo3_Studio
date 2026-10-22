const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

function findDef(name) {
  let pos = 0;
  while ((pos = content.indexOf(name + '=', pos)) !== -1) {
    console.log(`Def ${name}= at`, pos);
    console.log(content.slice(pos, pos + 100));
    pos += name.length + 1;
  }
  const r = new RegExp(`\\b${name}\\s*=`, 'g');
  let m;
  while ((m = r.exec(content)) !== null) {
    console.log(`Regex ${name}= at`, m.index);
    console.log(content.slice(m.index, m.index + 100));
  }
}
findDef('Do');
findDef('ho');
