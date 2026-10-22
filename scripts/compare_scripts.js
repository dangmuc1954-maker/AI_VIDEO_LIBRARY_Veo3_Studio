const fs = require('fs');

const aiforgeNl = fs.readFileSync('scripts/aiforge_nl.js', 'utf8');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const curNlStart = curMain.indexOf('function nl(');
const curNlEnd = curMain.indexOf('function al(', curNlStart);
const curNl = curMain.slice(curNlStart, curNlEnd);

console.log('AIForge nl length:', aiforgeNl.length);
console.log('Current nl length:', curNl.length);

const aiforgeZu = fs.readFileSync('scripts/aiforge_zu.js', 'utf8');
const curZuStart = curMain.indexOf('function zu(');
const curZuEnd = curMain.indexOf('function Ku(', curZuStart);
const curZu = curMain.slice(curZuStart, curZuEnd);

console.log('AIForge zu length:', aiforgeZu.length);
console.log('Current zu length:', curZu.length);
