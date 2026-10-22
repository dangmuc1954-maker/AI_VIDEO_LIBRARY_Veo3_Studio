const fs = require('fs');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

// Find transition array in ourVs
const pTrans = ourVs.indexOf('transitionDissolve');
console.log('pTrans =', pTrans);
if (pTrans !== -1) {
  console.log('Transition array context:\n', ourVs.slice(pTrans - 100, pTrans + 500));
}

// Find tabs in ourVs
const pTab = ourVs.indexOf('transitions');
console.log('pTab =', pTab);
if (pTab !== -1) {
  console.log('Tab context:\n', ourVs.slice(pTab - 100, pTab + 200));
}
