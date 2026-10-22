const fs = require('fs');
const path = require('path');

const curPath = path.resolve(__dirname, '../app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js');
const zip3Path = path.resolve(__dirname, '../scratch/zip3_analysis/extracted_app_files/resources/app/out/renderer/assets/WorkflowEditor-BFJj-KsD.js');

const curCode = fs.readFileSync(curPath, 'utf8');
const zip3Code = fs.readFileSync(zip3Path, 'utf8');

console.log('Cur WF length:', curCode.length);
console.log('Zip3 WF length:', zip3Code.length);

// Compare how Bóc kịch bản is rendered in both
const curBoc = curCode.indexOf('Bóc kịch bản ngay');
const zip3Boc = zip3Code.indexOf('Bóc kịch bản ngay');

console.log('Cur Bóc index:', curBoc);
console.log('Zip3 Bóc index:', zip3Boc);

if (curBoc !== -1 && zip3Boc !== -1) {
  console.log('\n--- Cur snippet ---');
  console.log(curCode.slice(curBoc - 200, curBoc + 300));

  console.log('\n--- Zip3 snippet ---');
  console.log(zip3Code.slice(zip3Boc - 200, zip3Boc + 300));
}
