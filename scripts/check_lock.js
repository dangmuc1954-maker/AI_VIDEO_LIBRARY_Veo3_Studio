const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

const idx = mainJs.indexOf('requestSingleInstanceLock');
if (idx !== -1) {
  console.log('Context of requestSingleInstanceLock:');
  console.log(mainJs.slice(idx - 100, idx + 400));
} else {
  console.log('requestSingleInstanceLock not found.');
}
