const fs = require('fs');

function checkFile(p) {
  if (!fs.existsSync(p)) return;
  const content = fs.readFileSync(p, 'utf8');
  const regex = /("label"|"title"|"name"):\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match[2].includes('Xưởng') || match[2].includes('Gia dụng') || match[2].includes('Thời trang') || match[2].includes('Studio')) {
      console.log(match[0]);
    }
  }
}

['app/out/renderer/assets/index-BS7vgKVV.js', 'app/out/renderer/assets/VideoFactoryStudio.js', 'app/out/renderer/assets/FittingRoomKocStudio.js'].forEach(checkFile);
