const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/accountUtils-D3T9h8tk.js', 'utf8');

const idxXT = content.indexOf('xt=');
const idxBT = content.indexOf('bt=');
console.log('xt def:', content.slice(Math.max(0, idxXT - 50), idxXT + 150));
console.log('bt def:', content.slice(Math.max(0, idxBT - 50), idxBT + 150));
