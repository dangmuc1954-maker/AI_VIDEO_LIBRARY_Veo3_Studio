const fs = require('fs');

const findEmojis = (file) => {
  const content = fs.readFileSync(file, 'utf8');
  console.log('--- ' + file + ' ---');
  ['👑', '💎', '⚡', '🎁', 'Crown', 'Diamond', 'Zap', 'Gift'].forEach(sym => {
    let idx = 0;
    while ((idx = content.indexOf(sym, idx)) !== -1) {
      console.log('Found ' + sym + ' at ' + idx + ': ' + content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 60)));
      idx += sym.length;
    }
  });
};

findEmojis('app/out/renderer/assets/index-BS7vgKVV.js');
findEmojis('app/out/renderer/assets/LicenseCenter-CK2ppPZf.js');
