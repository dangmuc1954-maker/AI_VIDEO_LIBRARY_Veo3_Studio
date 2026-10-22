const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = 38727; // where ic=[$d,Au,ou,ru,Vd] is
console.log('Context before ic:');
console.log(content.slice(Math.max(0, idx - 1200), idx + 200));
