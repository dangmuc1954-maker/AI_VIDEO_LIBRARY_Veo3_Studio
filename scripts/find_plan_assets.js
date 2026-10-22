const fs = require('fs');
const path = require('path');

const checkDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) continue;
    if (f.match(/plan|gold|silver|basic|trial|license|vip/i)) {
      console.log('Found asset:', full);
    }
  }
};

checkDir('app/out/renderer/assets');
checkDir('app/assets');
checkDir('assets');
