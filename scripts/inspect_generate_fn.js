const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');

const genIdx = code.indexOf('const Xe=async');
if (genIdx !== -1) {
  console.log('--- Xe FUNCTION (3000 chars) ---');
  console.log(code.slice(genIdx, genIdx + 3000));
} else {
  // Find where Generate button calls Xe
  const btnIdx = code.indexOf('Generate ');
  console.log('--- Around Generate button ---');
  console.log(code.slice(btnIdx - 200, btnIdx + 200));
}
