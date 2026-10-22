const fs = require('fs');

const appMain = fs.readFileSync('app/out/main/index.js', 'utf8');
const origMain = fs.readFileSync('scratch/original_aiforge_out/out/main/index.js', 'utf8');

function getHandles(str, prefix) {
  const res = [];
  const regex = new RegExp(`\\.handle\\(\\s*["'](${prefix}[^"']+)["']`, 'g');
  let m;
  while ((m = regex.exec(str)) !== null) {
    res.push(m[1]);
  }
  return res;
}

console.log('App chat handles:', getHandles(appMain, 'chat:'));
console.log('Orig chat handles:', getHandles(origMain, 'chat:'));

console.log('\nApp workflow handles:', getHandles(appMain, 'workflow'));
console.log('Orig workflow handles:', getHandles(origMain, 'workflow'));
