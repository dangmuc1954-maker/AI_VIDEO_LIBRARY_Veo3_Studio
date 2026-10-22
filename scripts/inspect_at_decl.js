const fs = require('fs');
const c = fs.readFileSync('app/out/renderer/assets/BrowserHub-BG_PFFrM.js', 'utf8');

const idx = c.indexOf('at&&e.jsxs("div",{className:"mb-4 rounded-md border border-red/25');
const sub = c.slice(Math.max(0, idx - 2500), idx);
console.log(sub);
