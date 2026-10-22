const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out_backup_v1/renderer/assets/VideoStudio-BZY_1pM8.js');
const orig = fs.readFileSync(vsPath, 'utf8');

const idx = orig.indexOf('Ke===ce.length?"Completed":"Ready"');
console.log(orig.substring(idx, idx + 800));
