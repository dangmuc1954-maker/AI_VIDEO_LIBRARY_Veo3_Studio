const fs = require('fs');
const c = fs.readFileSync('app/out/renderer/assets/BrowserHub-BG_PFFrM.js', 'utf8');

const idx = c.indexOf('This account may fail active jobs');
const sub = c.slice(Math.max(0, idx - 800), idx);
console.log(sub);
