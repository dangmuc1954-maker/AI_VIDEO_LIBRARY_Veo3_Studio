const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(full));
    } else {
      results.push(path.relative(dir, full).replace(/\\/g, '/'));
    }
  });
  return results;
}

const origFiles = getFiles('scratch/original_aiforge_out/out');
const appFiles = getFiles('app/out');

console.log('Total files in original out:', origFiles.length);
console.log('Total files in app out:', appFiles.length);

const missingInApp = origFiles.filter(f => !appFiles.includes(f));
const extraInApp = appFiles.filter(f => !origFiles.includes(f));

console.log('\n--- Files only in Original (' + missingInApp.length + ') ---');
console.log(missingInApp.slice(0, 30));

console.log('\n--- Files only in App (' + extraInApp.length + ') ---');
console.log(extraInApp);
