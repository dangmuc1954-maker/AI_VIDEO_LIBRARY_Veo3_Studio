const fs = require('fs');
const code = fs.readFileSync('app/out/main/index.js', 'utf8');

const vsCode = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
console.log(vsCode.slice(69500, 71500));
