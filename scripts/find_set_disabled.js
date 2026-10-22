const fs = require('fs');
const c = fs.readFileSync('app/out/main/index.js', 'utf8');
const p = c.indexOf('setAccountDisabled(t,e)');
if (p !== -1) {
  console.log(c.slice(p - 100, p + 500));
} else {
  // search for setAccountDisabled
  let idx = 0;
  while ((idx = c.indexOf('setAccountDisabled', idx)) !== -1) {
    console.log('at', idx, ':', c.slice(idx - 50, idx + 200));
    idx += 18;
  }
}
