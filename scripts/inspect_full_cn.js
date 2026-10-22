const fs = require('fs');
const code = fs.readFileSync('extracted_original/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const cnIdx = code.indexOf('function cn(');
const cnEndIdx = code.indexOf('function ln(', cnIdx); // or whatever follows cn
console.log('cn length:', cnEndIdx !== -1 ? cnEndIdx - cnIdx : 5000);
console.log(code.slice(cnIdx, cnIdx + 3500));
