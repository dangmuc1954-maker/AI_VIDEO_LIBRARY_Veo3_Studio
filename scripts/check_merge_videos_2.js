const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('async mergeVideos(');
console.log(main.slice(p + 2200, p + 3200));
