const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

function findFn(name) {
  const idx = content.indexOf(name);
  console.log('=== ' + name + ' ===');
  if (idx !== -1) {
    console.log(content.slice(idx, idx + 800));
  } else {
    console.log('NOT FOUND');
  }
}

findFn('runVideoJob(');
findFn('prepareRunJob(');
findFn('executeJob(');
findFn('executeVideoJob(');
