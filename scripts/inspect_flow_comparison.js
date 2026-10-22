const fs = require('fs');

const code = fs.readFileSync('app/out/main/index.js', 'utf8');

function findFunction(name) {
  const idx = code.indexOf(name);
  if (idx === -1) return null;
  return code.slice(Math.max(0, idx - 50), Math.min(code.length, idx + 1000));
}

console.log('--- executeFlowVideoRpc ---');
const idxVideo = code.indexOf('executeFlowVideoRpc(');
if (idxVideo !== -1) {
  console.log(code.slice(idxVideo, idxVideo + 1500));
}

console.log('\n--- executeFlowImageRpc ---');
const idxImg = code.indexOf('executeFlowImageRpc(');
if (idxImg !== -1) {
  console.log(code.slice(idxImg, idxImg + 1500));
}
