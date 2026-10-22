const fs = require('fs');

const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

console.log(index.slice(749500, 750600));
