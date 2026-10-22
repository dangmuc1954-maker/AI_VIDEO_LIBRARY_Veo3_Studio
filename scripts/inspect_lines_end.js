const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-BZY_1pM8.js');
const code = fs.readFileSync(vsPath, 'utf8');

const lines = code.split('\n');
for (let i = 828; i < lines.length; i++) {
  console.log('L' + (i + 1) + ': ' + lines[i]);
}
