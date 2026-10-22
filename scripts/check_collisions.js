const fs = require('fs');
const code = fs.readFileSync('app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const origCode = code.slice(0, 113340); // before our injection

const ourIds = [
  'fo', 'dn', 'go', 'bo', '_s', 'vo', 'cn', 'zs', 'rt', 'Us', 'un', 'wo', 'jo', 'Ws', 'Ht', 'yo',
  'qe', 'Ci', 'cs', 'Ho', 'Si', 'Ni', 'Qo', 'qo', 'Po', 'ji', 'ki', '_e', 'Cr', 'Pr', 'Js', 'ms',
  'Jt', 'ps', 'it', 'Xs', 'us', 'VN_TRANSLATIONS', 'm', 'Ke', 'l', 'cr', 'A', 'He', 'mn'
];

ourIds.forEach(id => {
  const r = new RegExp('(?:const|function|let|var|class)\\s+' + id + '\\b');
  const m = origCode.match(r);
  if (m) {
    console.log('COLLISION:', id, '->', origCode.slice(m.index, m.index + 50));
  }
  // also check imports
  const rImp = new RegExp('([a-zA-Z0-9_$]+ as ' + id + '|\\b' + id + '\\b)[^}]*\\}from');
  const mImp = origCode.slice(0, 3000).match(rImp);
  if (mImp) {
    console.log('COLLISION (import):', id, '->', mImp[0]);
  }
});
