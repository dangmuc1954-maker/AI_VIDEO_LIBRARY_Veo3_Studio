const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/accountUtils-D3T9h8tk.js', 'utf8');

const expIdx = content.lastIndexOf('export{');
console.log(content.slice(expIdx));
