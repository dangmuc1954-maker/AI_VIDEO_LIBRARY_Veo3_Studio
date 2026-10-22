const fs = require('fs');
const path = require('path');

const zip3Main = fs.readFileSync(path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/main/index.js'), 'utf8');

// Search for oa( or async function oa
const matches = [];
let idx = 0;
while ((idx = zip3Main.indexOf('async function oa(', idx)) !== -1) {
  console.log('oa definition at:', idx);
  console.log(zip3Main.slice(idx, idx + 400));
  idx += 15;
}
if (matches.length === 0) {
  // search for const oa = or let oa =
  const reg = /(?:const|let|var)\s+oa\s*=\s*(?:async)?\s*[\(\w]/g;
  let m;
  while ((m = reg.exec(zip3Main)) !== null) {
    console.log('oa var at:', m.index, zip3Main.slice(m.index, m.index + 300));
  }
}
