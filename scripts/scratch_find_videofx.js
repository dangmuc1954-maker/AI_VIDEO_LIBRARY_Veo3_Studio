const fs = require('fs');

const code = fs.readFileSync('temp_flow_bundle.js', 'utf8');

const term = 'VideoFxService';
let pos = 0;
while ((pos = code.indexOf(term, pos)) !== -1) {
  console.log(`\n=== Match for VideoFxService at ${pos} ===`);
  console.log(code.slice(Math.max(0, pos - 100), Math.min(code.length, pos + 300)));
  pos += term.length;
}
