const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const start = content.indexOf('const Xe=async()=>');
const end = content.indexOf('const Je=async()=>', start);

console.log('=== FULL Xe FUNCTION ===');
console.log(content.substring(start, end));
