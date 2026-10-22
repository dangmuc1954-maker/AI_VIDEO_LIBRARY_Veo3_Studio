const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('async editAndMergeVideos(');
console.log(main.slice(p + 800, p + 1800));
