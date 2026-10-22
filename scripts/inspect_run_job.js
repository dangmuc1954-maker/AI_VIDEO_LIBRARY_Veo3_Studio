const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

// Find how queue worker claims and runs jobs
let pos = mainJs.indexOf('runJob(');
if (pos === -1) pos = mainJs.indexOf('executeJob(');
console.log('Found runJob/executeJob at:', pos);
if (pos !== -1) {
  console.log(mainJs.slice(pos - 100, pos + 800));
}
