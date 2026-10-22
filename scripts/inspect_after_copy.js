const fs = require('fs');
const mainCode = fs.readFileSync('app/out/main/index.js', 'utf8');

const cIdx = mainCode.indexOf('copyFileSync(tVoiced');
console.log(mainCode.slice(cIdx, cIdx + 1500));
