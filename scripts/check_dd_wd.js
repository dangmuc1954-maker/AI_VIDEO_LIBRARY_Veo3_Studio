const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

function findVarDef(name) {
  const reg = new RegExp(`(?:function\\s+${name}\\b|const\\s+${name}\\s*=|let\\s+${name}\\s*=|var\\s+${name}\\s*=)`, 'g');
  let m;
  console.log(`Def of ${name}:`);
  while ((m = reg.exec(content)) !== null) {
    console.log(m.index, content.slice(m.index, m.index + 120));
  }
}

findVarDef('Dd');
findVarDef('Wd');
