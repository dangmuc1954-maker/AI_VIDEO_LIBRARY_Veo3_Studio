const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const unPos = content.indexOf('function un(');
console.log(content.slice(unPos + 4000, unPos + 6000));
