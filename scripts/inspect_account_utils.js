const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/accountUtils-D3T9h8tk.js', 'utf8');

const idxSS = content.indexOf('ss=');
const idxRS = content.indexOf('rs=');
console.log('ss def:', content.slice(Math.max(0, idxSS - 50), idxSS + 200));
console.log('rs def:', content.slice(Math.max(0, idxRS - 50), idxRS + 200));
