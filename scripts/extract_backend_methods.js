const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, '..', 'extracted_aiforge_studio', 'out', 'main', 'index.js');
const content = fs.readFileSync(mainFile, 'utf8');

const idx1 = content.indexOf('async mergeVideos(');
const idx2 = content.indexOf('async editAndMergeVideos(');

console.log('mergeVideos at:', idx1);
console.log(content.slice(idx1, idx1 + 2500));

console.log('\n===================\neditAndMergeVideos at:', idx2);
console.log(content.slice(idx2, idx2 + 3500));
