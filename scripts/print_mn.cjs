const fs = require('fs');

const vs = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const p = vs.indexOf('function mn(');
console.log(vs.slice(p, p + 800));
