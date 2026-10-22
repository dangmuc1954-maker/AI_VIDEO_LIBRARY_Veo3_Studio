const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js');
const code = fs.readFileSync(filePath, 'utf8');

const sIdx = code.indexOf('function Se(');
const eIdx = code.indexOf('const le={image:', sIdx);

console.log('Se starts at:', sIdx, 'ends at:', eIdx, 'length:', eIdx - sIdx);
fs.writeFileSync(path.join(__dirname, '../scratch/se_original.js'), code.substring(sIdx, eIdx), 'utf8');
console.log('Saved scratch/se_original.js');
