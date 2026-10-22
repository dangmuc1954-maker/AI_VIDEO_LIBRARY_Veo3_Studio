const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idxDO = content.indexOf('Do(');
console.log('Do around 162623:');
console.log(content.slice(Math.max(0, 162623 - 200), 162623 + 200));

const idxHO = content.indexOf('ho=');
console.log('ho def:', content.slice(Math.max(0, idxHO - 50), idxHO + 200));
