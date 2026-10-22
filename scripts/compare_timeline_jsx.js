const fs = require('fs');

const zip3Vs = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

console.log('=== ZIP 3 TIMELINE SEGMENTS (pos 183072) ===');
console.log(zip3Vs.slice(183072, 183072 + 3500));

console.log('\n=== OUR APP TIMELINE SEGMENTS (pos 139841) ===');
console.log(ourVs.slice(139841, 139841 + 3500));
