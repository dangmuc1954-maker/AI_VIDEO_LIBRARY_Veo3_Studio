const fs = require('fs');
const path = require('path');

const vsPath = path.join(__dirname, '../app/out/renderer/assets/VideoStudio-frcr8V6s.js');
const s = fs.readFileSync(vsPath, 'utf8');

const idx = s.indexOf('St=async');
console.log(s.substring(idx, idx + 2500));
