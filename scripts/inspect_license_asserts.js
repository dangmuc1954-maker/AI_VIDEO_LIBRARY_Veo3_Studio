const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

['assertCanCreateJob', 'assertCanRunJob', 'checkCanRunJobCached', 'assertCanResumeQueue'].forEach(fn => {
  let pos = mainJs.indexOf(fn);
  console.log(`=== ${fn} at ${pos} ===`);
  if (pos !== -1) {
    console.log(mainJs.slice(pos - 50, pos + 500));
  }
});
