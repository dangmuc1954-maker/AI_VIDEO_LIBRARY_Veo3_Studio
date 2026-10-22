const fs = require('fs');

const index = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

const p = index.indexOf('case"select-item":return{id:a,');
console.log(index.slice(p, p + 500));
