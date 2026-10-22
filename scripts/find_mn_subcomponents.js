const fs = require('fs');
const orig = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/VideoStudio-CbTMj2SN.js', 'utf8');
const ids = ['Ci', 'cs', 'Ho', 'Si', 'Ni', 'Qo', 'qo', 'ji', 'ki'];

ids.forEach(id => {
  let idx = orig.indexOf('const ' + id + '=');
  if (idx === -1) idx = orig.indexOf('function ' + id + '(');
  if (idx === -1) idx = orig.indexOf('let ' + id + '=');
  if (idx !== -1) {
    console.log(id, '->', orig.slice(idx, idx + 150));
  } else {
    console.log(id, '-> NOT FOUND as decl');
  }
});
