const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-8u8DZic4.js', 'utf8');

console.log(content.substring(845000, 848000));
