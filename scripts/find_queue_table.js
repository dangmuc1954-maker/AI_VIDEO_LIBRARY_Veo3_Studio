const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

const t1 = content.indexOf('promptId');
console.log('promptId at', t1);

// Find table headers or row rendering
const rowIdx = content.indexOf('table');
console.log('table occurrences:', rowIdx);

// Search for the queue table container
const matches = [];
let re = /className:\"([^\"]*overflow-x-auto[^\"]*)\"/g;
let m;
while ((m = re.exec(content)) !== null) {
  matches.push({ idx: m.index, cls: m[1] });
}
console.log('overflow-x-auto containers:', matches);
