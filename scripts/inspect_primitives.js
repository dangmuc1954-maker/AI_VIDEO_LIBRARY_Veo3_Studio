const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/StudioPrimitives-CEIXwDK6.js', 'utf8');

console.log('StudioPrimitives length:', content.length);
console.log(content.slice(0, 1000));
