const fs = require('fs');

const zip3Vs = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('=== ZIP3 Player Function (141500 - 143500) ===');
console.log(zip3Vs.slice(141500, 143500));

console.log('\n=== OUR APP Player Function (100500 - 102500) ===');
console.log(ourVs.slice(100500, 102500));
