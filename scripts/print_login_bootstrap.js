const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

console.log('--- FIRST MANUAL LOGIN BOOTSTRAP in AIForge Studio ---');
console.log(orig.slice(741500, 744500));
