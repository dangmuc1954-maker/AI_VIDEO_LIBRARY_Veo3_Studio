const fs = require('fs');

const code = fs.readFileSync('app/out/renderer/assets/ImageStudio-4nmpUX3j.js', 'utf8');
const p = code.indexOf('addBlankPrompt');
console.log('Code before addBlankPrompt:');
console.log(code.slice(p - 1500, p));
