const fs = require('fs');
const content = fs.readFileSync('scratch/shop_app_unpacked/out/renderer/assets/index-DqhuWq2K.js', 'utf8');

console.log('--- vE and gE in index-DqhuWq2K.js ---');
console.log(content.substring(784000, 785100));
