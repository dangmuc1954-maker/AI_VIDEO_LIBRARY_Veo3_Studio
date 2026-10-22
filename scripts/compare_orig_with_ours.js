const fs = require('fs');
const path = require('path');

const origDir = 'extracted_original_20260912/out';
const ourDir = 'app/out';

function getFiles(dir, base = '') {
  let res = {};
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, f.name);
    if (f.isDirectory()) {
      Object.assign(res, getFiles(path.join(dir, f.name), rel));
    } else {
      res[rel] = fs.statSync(path.join(dir, f.name)).size;
    }
  }
  return res;
}

const origFiles = getFiles(origDir);
const ourFiles = getFiles(ourDir);

console.log('--- Missing in our app: ---');
for (const [f, s] of Object.entries(origFiles)) {
  if (!ourFiles[f]) console.log('Missing:', f, `(${s} bytes)`);
}

console.log('--- Size differences in common files: ---');
for (const [f, s] of Object.entries(origFiles)) {
  if (ourFiles[f] && ourFiles[f] !== s) {
    console.log('Diff:', f, `Orig: ${s} vs Ours: ${ourFiles[f]}`);
  }
}
