const fs = require('fs');
const path = require('path');

const s1 = fs.readFileSync(path.join(__dirname, 'extracted/WorkflowStore.js'), 'utf-8');

// Search for fetch or api calls or backendUrl in s1
const matches = [];
let re = /fetch\(|axios|\/workflow-store|\/store|catalog|window\.electron/g;
let m;
while ((m = re.exec(s1)) !== null) {
  matches.push({
    idx: m.index,
    match: m[0],
    context: s1.substring(Math.max(0, m.index - 150), Math.min(s1.length, m.index + 200))
  });
}

console.log(`Found ${matches.length} matches:`);
matches.slice(0, 15).forEach((item, i) => {
  console.log(`[${i}] Match: ${item.match}`);
  console.log(item.context);
  console.log('-----------------------------------');
});
