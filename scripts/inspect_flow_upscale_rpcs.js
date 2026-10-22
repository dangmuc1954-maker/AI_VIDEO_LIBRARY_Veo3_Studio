const fs = require('fs');

const content = fs.readFileSync('app/out/main/index.js', 'utf8');

['executeFlowUpscaleImageRpc', 'executeFlowVideoUpscaleRpc'].forEach(fn => {
  let pos = content.indexOf(fn);
  if (pos !== -1) {
    console.log(`=== ${fn} at ${pos} ===`);
    console.log(content.slice(pos, pos + 1000));
  } else {
    console.log(`=== ${fn} NOT FOUND ===`);
  }
});
