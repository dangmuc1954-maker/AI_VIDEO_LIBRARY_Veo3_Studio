const fs = require('fs');
const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');

const list = ['to', 'tr', '_e', 'xs', 'ps', 'Js', 'ms', 'Jt', 'pr', 'Po', 'it', 'Xs', 'Cr', 'Pr', 'cr', 'm', 'A', 'Ke', 'He', 'B', 'l', 'e'];

list.forEach(name => {
  // Check imports in orig
  const r = new RegExp('([a-zA-Z0-9_$]+)\\s+as\\s+' + name + '\\b');
  const m = orig.match(r);
  if (m) {
    console.log(`${name}: imported as alias of '${m[1]}'`);
  } else {
    const r2 = new RegExp('\\b' + name + '\\b\\s*,?');
    console.log(`${name}: not an alias, check imports`);
  }
});
