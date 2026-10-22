const fs = require('fs');
const path = require('path');

const curMain = fs.readFileSync(path.resolve(__dirname, '../app/out/main/index.js'), 'utf8');
const zip3Main = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/main/index.js'), 'utf8');

console.log('Zip3 has VideoStudio?', zip3Main.includes('VideoStudio') || zip3Main.includes('delogo') || zip3Main.includes('upscale'));
console.log('Cur has delogo?', curMain.includes('delogo'));
console.log('Cur has upscale?', curMain.includes('upscale'));
console.log('Cur has boq?', curMain.includes('boq'));
console.log('Cur has license?', curMain.includes('license'));
