const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');

const idx = content.indexOf('<Outlet');
console.log('Outlet at', idx);
if (idx === -1) {
  const oIdx = content.indexOf('outlet');
  console.log('outlet at', oIdx);
}
// Find root layout
const rootLayout = content.indexOf('className:"flex h-screen');
console.log('flex h-screen at', rootLayout);
if (rootLayout !== -1) {
  console.log(content.slice(rootLayout - 50, rootLayout + 300));
}
