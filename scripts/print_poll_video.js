const fs = require('fs');
const curMain = fs.readFileSync('app/out/main/index.js', 'utf8');

const idx = curMain.indexOf('rpc-video-submit-project-retry');
console.log(curMain.slice(idx, idx + 4000));
