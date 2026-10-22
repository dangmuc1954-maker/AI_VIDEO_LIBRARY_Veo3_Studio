const fs = require('fs');

const aiforgeMain = fs.readFileSync('C:/Users/admin/.gemini/antigravity-ide/brain/4d55b967-39a0-4765-aabf-ce3e4f1815af/scratch/aiforge_extracted/out/main/index.js', 'utf8');

const zuStart = aiforgeMain.indexOf('function zu(');
const zuEnd = aiforgeMain.indexOf('function Ku(', zuStart);
const aiforgeZu = aiforgeMain.slice(zuStart, zuEnd);

const nlStart = aiforgeMain.indexOf('function nl(');
const nlEnd = aiforgeMain.indexOf('function al(', nlStart);
const aiforgeNl = aiforgeMain.slice(nlStart, nlEnd);

fs.writeFileSync('scripts/aiforge_zu.js', aiforgeZu, 'utf8');
fs.writeFileSync('scripts/aiforge_nl.js', aiforgeNl, 'utf8');

console.log('Written aiforge_zu.js and aiforge_nl.js');
