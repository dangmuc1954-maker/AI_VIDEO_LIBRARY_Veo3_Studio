const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'main', 'index.js');
const preloadFile = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'preload', 'index.cjs');

console.log('Searching in main and preload...');

function search(file, terms) {
  console.log(`\n=== File: ${path.basename(file)} ===`);
  const content = fs.readFileSync(file, 'utf8');
  for (const t of terms) {
    let idx = 0;
    while ((idx = content.indexOf(t, idx)) !== -1) {
      console.log(`Found "${t}" at ${idx}:`);
      console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 400)));
      idx += t.length;
    }
  }
}

search(preloadFile, ['mergeVideos', 'editAndMergeVideos', 'assets:']);
search(mainFile, ['mergeVideos', 'editAndMergeVideos', 'merge-videos', 'edit-and-merge']);
