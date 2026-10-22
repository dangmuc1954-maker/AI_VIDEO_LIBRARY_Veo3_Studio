const fs = require('fs');
const path = require('path');

const origFile = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'renderer', 'assets', 'VideoStudio-CbTMj2SN.js');
const code = fs.readFileSync(origFile, 'utf8');

const mnStart = 85378;
// Let's inspect 5000 characters before mnStart
console.log(code.slice(mnStart - 5000, mnStart));
