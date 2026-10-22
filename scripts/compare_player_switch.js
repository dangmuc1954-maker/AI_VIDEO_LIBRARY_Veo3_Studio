const fs = require('fs');

const zip3Vs = fs.readFileSync('scratch/zip3_source_app/resources/app/out/renderer/assets/VideoStudio-BZY_1pM8.js', 'utf8');
const ourVs = fs.readFileSync('app/out/renderer/assets/VideoStudio-frcr8V6s.js', 'utf8');

function findSnippet(code, query) {
  let pos = code.indexOf(query);
  if (pos === -1) return 'NOT FOUND';
  return code.slice(pos - 100, pos + 500);
}

console.log('=== ZIP3 player switch ===');
// Search for video switch in zip3
let idx1 = zip3Vs.indexOf('fromVid');
if (idx1 !== -1) {
  console.log('zip3 fromVid at', idx1, ':\n', zip3Vs.slice(idx1 - 100, idx1 + 600));
} else {
  console.log('zip3 does not have fromVid? Searching applyVidTransition or similar...');
  let idxT = zip3Vs.indexOf('applyVidTransition');
  console.log('applyVidTransition in zip3:', idxT);
}

console.log('=== OUR APP player switch ===');
let idx2 = ourVs.indexOf('fromVid');
if (idx2 !== -1) {
  console.log('our fromVid at', idx2, ':\n', ourVs.slice(idx2 - 100, idx2 + 600));
}
