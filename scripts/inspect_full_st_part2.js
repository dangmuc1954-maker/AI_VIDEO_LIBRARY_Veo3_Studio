const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const idx = content.indexOf('St=async r=>{');
console.log(content.slice(idx + 2400, idx + 4500));
