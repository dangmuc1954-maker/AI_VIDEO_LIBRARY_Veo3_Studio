const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = main.indexOf('async editAndMergeVideos(');
const pWrite = main.indexOf('await this.writeAsset(', p);
console.log('writeAsset in editAndMergeVideos:');
if (pWrite !== -1) {
  console.log(main.slice(pWrite - 50, pWrite + 250));
}
