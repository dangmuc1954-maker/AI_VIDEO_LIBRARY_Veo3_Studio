const fs = require('fs');
const origIdx = fs.readFileSync('extracted_aiforge_studio/out/renderer/assets/index-DqhuWq2K.js', 'utf8');

const tokens = ['Ke', 'He', 'B', 'l', 'e', 'm', 'A', 'tr', 'Js', 'ms', 'Po', 'Xs', 'cr'];
tokens.forEach(tok => {
  const m = origIdx.match(new RegExp('([a-zA-Z0-9_$]+)\\s+as\\s+' + tok + '\\b'));
  if (m) {
    console.log(`${tok} -> original name: ${m[1]}`);
  } else {
    console.log(`${tok} -> exported directly`);
  }
});
