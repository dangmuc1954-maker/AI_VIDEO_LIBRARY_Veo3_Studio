const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/VideoFactoryStudio.js', 'utf8');

const p = content.indexOf('const hasRef = allRefIds.length > 0;');
console.log('Main Factory generateSingleVideo:');
console.log(content.substring(p, p + 2500));
