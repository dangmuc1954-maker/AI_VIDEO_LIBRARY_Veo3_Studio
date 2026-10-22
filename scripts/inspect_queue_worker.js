const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

// Find QueueWorker definition
let pos = mainJs.indexOf('class QueueWorker');
if (pos === -1) pos = mainJs.indexOf('class oe');
if (pos === -1) {
  // search for pauseJobForLicense
  pos = mainJs.indexOf('pauseJobForLicense');
}
console.log('Found around pos:', pos);
if (pos !== -1) {
  console.log(mainJs.slice(pos - 100, pos + 1000));
}
