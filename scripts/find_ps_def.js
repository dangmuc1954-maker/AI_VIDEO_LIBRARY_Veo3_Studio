const fs = require('fs');

const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

let pos = ourVs.indexOf('function Ps(');
if (pos === -1) pos = ourVs.indexOf('Ps=');
console.log('Ps definition:', ourVs.slice(pos - 50, pos + 400));
