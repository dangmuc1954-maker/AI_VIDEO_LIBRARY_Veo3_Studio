const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/StudioPrimitives-CEIXwDK6.js', 'utf8');

const end = content.slice(content.length - 1500);
console.log(end);
