const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/StudioFailedBulkActions-Zv2NpUPy.js', 'utf8');

const pos = content.indexOf('function et(');
console.log('function et header:', content.slice(pos + 600, pos + 1600));
