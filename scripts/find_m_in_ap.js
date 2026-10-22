const fs = require('fs');
const editor = fs.readFileSync('app/out/renderer/assets/WorkflowEditor-LHGC9K3C.js', 'utf8');

const apStart = 387564;
const apChunk = editor.slice(apStart, apStart + 35000);

const regex = /(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=/g;
let m;
const vars = [];
while ((m = regex.exec(apChunk)) !== null) {
  vars.push({ name: m[1], pos: m.index });
}
console.log('Variables defined in Ap:');
console.log(vars.filter(v => v.name === 'M' || v.name === 'f' || v.name === 'h' || v.name === 'U'));

// Tìm xem M(e.id) thì M là gì
console.log('\nSearch M in apChunk:');
let pos = 0;
while ((pos = apChunk.indexOf('M', pos)) !== -1) {
  const slice = apChunk.slice(Math.max(0, pos - 20), pos + 30);
  if (slice.includes('=') || slice.includes('M(')) {
    console.log(`M at ${pos}: ${slice.trim()}`);
  }
  pos += 1;
}
