const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/TTSStudio-C_2cGcBA.js', 'utf8');

console.log(content.substring(34000, 39000));
