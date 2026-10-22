const fs = require('fs');
const content = fs.readFileSync('app/out/renderer/index.html', 'utf8');
console.log('index.html:', content);

const f1 = fs.readFileSync('app/out/renderer/assets/index-BS7vgKVV.js', 'utf8');
console.log('index-BS7vgKVV.js length:', f1.length);
// Check what routes or components are imported/defined
const importMatches = [...f1.matchAll(/import\([^)]+\)/g)].map(m => m[0]);
console.log('Dynamic imports:', importMatches.slice(0, 20));
