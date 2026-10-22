const fs = require('fs');
const main = fs.readFileSync('app/out/main/index.js', 'utf8');
const pStart = main.indexOf('async transcribeVideoAudio(');
const pEnd = main.indexOf('async mergeAudios(', pStart);
console.log(main.slice(pStart, pEnd));
