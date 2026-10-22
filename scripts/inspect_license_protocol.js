const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../extracted_original/out/main/index.js'), 'utf8');

console.log('--- SEARCHING FOR LICENSE HTTP CLIENT (ow) & VERIFIER (iw) ---');

const idxOw = mainJs.indexOf('class ow{');
if (idxOw !== -1) {
  console.log('--- CLASS ow (HTTP Client) ---');
  console.log(mainJs.slice(idxOw, idxOw + 3500));
}

const idxIw = mainJs.indexOf('class iw{');
if (idxIw !== -1) {
  console.log('\n--- CLASS iw (Verifier) ---');
  console.log(mainJs.slice(idxIw, idxIw + 2500));
}
