const fs = require('fs');

const orig = fs.readFileSync('extracted_aiforge_studio_new/out/main/index.js', 'utf8');

const idx = orig.lastIndexOf('async function dm(', 742000);
console.log('--- dm function at ' + idx + ' ---');
console.log(orig.slice(idx, idx + 800));
