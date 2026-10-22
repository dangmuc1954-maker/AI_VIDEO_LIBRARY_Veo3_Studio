const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('async editAndMergeVideos(');
console.log('editAndMergeVideos in main at', p);
if (p !== -1) {
  console.log(main.slice(p - 100, p + 200));
}

const p2 = main.indexOf('async mergeAudios(');
console.log('mergeAudios in main at', p2);
if (p2 !== -1) {
  console.log(main.slice(p2 - 100, p2 + 200));
}
