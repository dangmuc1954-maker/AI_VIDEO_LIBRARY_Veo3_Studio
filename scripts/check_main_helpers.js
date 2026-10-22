const fs = require('fs');

const main = fs.readFileSync('app/out/main/index.js', 'utf8');

// Find where editAndMergeVideos calls ffmpeg and probe
const p = main.indexOf('async editAndMergeVideos(');
console.log('editAndMergeVideos slice:');
console.log(main.slice(p, p + 800));
