const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out_backup_v1/renderer/assets/VideoStudio-BZY_1pM8.js');
const orig = fs.readFileSync(vsPath, 'utf8');

const qnIdx = orig.indexOf('function Qn(');
const qnCode = orig.substring(qnIdx);

const effectMatches = [...qnCode.matchAll(/h\.useEffect\s*\(/g)];
console.log('Total h.useEffect in Qn:', effectMatches.length);
effectMatches.forEach((m, i) => {
  console.log(`Effect ${i} at pos ${m.index}:`, qnCode.substring(m.index, m.index + 100));
});
