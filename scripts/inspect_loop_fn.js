const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const loopIdx = code.indexOf('for(let Z=0;Z<f.count;Z+=1)');
console.log('--- LOOP FUNCTION (3000 chars) ---');
console.log(code.slice(loopIdx - 800, loopIdx + 2000));
