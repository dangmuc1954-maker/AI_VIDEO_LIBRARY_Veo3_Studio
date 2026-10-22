const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const our = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

console.log('--- ORIG IMPORTS ---');
const origImports = orig.match(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g) || [];
origImports.forEach(x => console.log(x));

console.log('\n--- OUR IMPORTS ---');
const ourImports = our.match(/import\s*\{[^}]*\}\s*from\s*['"][^'"]*['"];?/g) || [];
ourImports.forEach(x => console.log(x));
