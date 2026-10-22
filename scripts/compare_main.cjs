const fs = require('fs');
const path = require('path');

const zip3MainPath = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/main/index.js');
const curMainPath = path.resolve(__dirname, '../app/out/main/index.js');

const zip3Main = fs.readFileSync(zip3MainPath, 'utf8');
const curMain = fs.readFileSync(curMainPath, 'utf8');

console.log('Zip3 main length:', zip3Main.length);
console.log('Current main length:', curMain.length);

// Let's check imports in zip3Main:
const zip3Imports = zip3Main.slice(0, 4800);
console.log('\n--- Zip3 First 400 chars ---');
console.log(zip3Main.slice(0, 400));

console.log('\n--- Cur First 400 chars ---');
console.log(curMain.slice(0, 400));
