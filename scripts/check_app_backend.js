const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, '..', 'app', 'out', 'main', 'index.js');
const preloadFile = path.join(__dirname, '..', 'app', 'out', 'preload', 'index.cjs');

function checkFile(file, terms) {
  console.log(`=== Checking ${path.basename(file)} ===`);
  const content = fs.readFileSync(file, 'utf8');
  for (const t of terms) {
    const has = content.includes(t);
    console.log(`Contains "${t}": ${has}`);
  }
}

checkFile(mainFile, ['mergeVideos', 'editAndMergeVideos', 'assets:mergeVideos', 'assets:editAndMergeVideos']);
checkFile(preloadFile, ['mergeVideos', 'editAndMergeVideos']);
