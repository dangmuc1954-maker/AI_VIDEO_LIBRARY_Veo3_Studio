const fs = require('fs');
const ourIdx = fs.readFileSync('app/out/renderer/assets/index-8u8DZic4.js', 'utf8');

const ourImports = ['Se', 'h', 'e', 'ds', 'B', 'Ct', 'cs', 'ur', 'mr', 'ls', 'ue', 'us', 'ms', 'ps', 'xs', 'hs', 'pr', 'yt', 'fs', 'gs', 'ft', 'bs', 'Jt', 'vs'];

ourImports.forEach(tok => {
  const m = ourIdx.match(new RegExp('([a-zA-Z0-9_$]+)\\s+as\\s+' + tok + '\\b'));
  if (m) {
    console.log(`${tok} -> alias of ${m[1]}`);
  } else {
    console.log(`${tok} -> not alias`);
  }
});
