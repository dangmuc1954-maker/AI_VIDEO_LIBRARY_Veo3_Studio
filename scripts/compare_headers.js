const fs = require('fs');

const origCode = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const curCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

console.log('--- Original Header ---');
console.log(origCode.slice(0, 1500));

console.log('\n--- Current Header ---');
console.log(curCode.slice(0, 1500));
