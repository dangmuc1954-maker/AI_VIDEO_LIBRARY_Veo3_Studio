const fs = require('fs');
const code = fs.readFileSync('original_mn_exact.js', 'utf8');

const list = ['to', 'tr', '_e', 'xs', 'Ci', 'cs', 'ps', 'Js', 'ms', 'Jt', 'pr', 'Ho', 'Si', 'Ni', 'Qo', 'qo', 'Po', 'ji', 'it', 'Xs', 'ki', 'Cr', 'Pr', 'cr'];

list.forEach(name => {
  const matches = [];
  let pos = 0;
  while ((pos = code.indexOf(name, pos)) !== -1) {
    const prev = code[pos - 1];
    const next = code[pos + name.length];
    if (!/[a-zA-Z0-9_$]/.test(prev) && !/[a-zA-Z0-9_$]/.test(next)) {
      matches.push(code.slice(Math.max(0, pos - 15), Math.min(code.length, pos + name.length + 25)));
    }
    pos += name.length;
  }
  console.log(`${name} (${matches.length} uses):`, matches.slice(0, 3));
});
