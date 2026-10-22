const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'original_mn_exact.js'), 'utf8');

// Find transition list in original_mn_exact.js
const transIdx = code.indexOf('10 HIỆU ỨNG') !== -1 ? code.indexOf('10 HIỆU ỨNG') : code.indexOf('transition');
console.log('Transition in code at:', transIdx);

// Find where transitions are defined or rendered
const transMatches = [...code.matchAll(/transition[A-Za-z0-9]+/g)].map(m => m[0]);
console.log('Transition matches in mn:', [...new Set(transMatches)]);
