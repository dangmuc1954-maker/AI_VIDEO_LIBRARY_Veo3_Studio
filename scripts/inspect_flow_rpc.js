const fs = require('fs');
const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

function showContext(kw, pad = 300) {
  console.log(`\n================ Context for: ${kw} ================`);
  let idx = 0;
  let count = 0;
  while ((idx = code.indexOf(kw, idx)) !== -1) {
    count++;
    const start = Math.max(0, idx - pad);
    const end = Math.min(code.length, idx + kw.length + pad);
    console.log(`--- [${count}] at index ${idx} ---`);
    console.log(code.substring(start, end));
    idx += kw.length;
    if (count >= 5) break;
  }
}

showContext('SAPISIDHASH');
showContext('Authorization');
showContext('batchexecute');
showContext('FlowService');
showContext('StreamGenerateContent');
showContext('GetCredits');
