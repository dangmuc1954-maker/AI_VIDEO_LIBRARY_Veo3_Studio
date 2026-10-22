const fs = require('fs');
const content = fs.readFileSync('C:/Users/admin/AppData/Local/Programs/AI VIDEO LIBRARY/resources/app/out/main/index.js', 'utf8');

const idx = content.indexOf('async authenticatedGenerateAudio(');
console.log(content.slice(idx, idx + 1500));
