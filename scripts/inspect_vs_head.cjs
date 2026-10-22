const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

console.log('Beginning of VideoStudio file:');
console.log(code.substring(0, 500));
