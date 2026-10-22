const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

const start = content.indexOf('class MuseVideoRuntime');
const end = content.indexOf('class Ys');
console.log('MuseVideoRuntime length:', end - start);
console.log(content.slice(start, end));
