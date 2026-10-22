const fs = require('fs');
const path = require('path');

const mainJs = fs.readFileSync(path.join(__dirname, '../app/out/main/index.js'), 'utf8');

const urlMatches = [...mainJs.matchAll(/https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/[a-zA-Z0-9_.~%!$&'()*+,;=:@/-]*)?/g)].map(m => m[0]);
const uniqueUrls = [...new Set(urlMatches)];

console.log('--- ALL EXTERNAL URLS IN MAIN PROCESS ---');
uniqueUrls.forEach(u => console.log('•', u));

console.log('\n--- SEARCHING IN RENDERER ASSETS ---');
const rendererDir = path.join(__dirname, '../app/out/renderer/assets');
fs.readdirSync(rendererDir).forEach(file => {
  if (file.endsWith('.js')) {
    const content = fs.readFileSync(path.join(rendererDir, file), 'utf8');
    const matches = [...content.matchAll(/https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?(?:\/[a-zA-Z0-9_.~%!$&'()*+,;=:@/-]*)?/g)].map(m => m[0]);
    const cleanMatches = matches.filter(u => !u.includes('w3.org') && !u.includes('schema.org') && !u.includes('react.dev') && !u.includes('fonts.'));
    if (cleanMatches.length > 0) {
      console.log(`\n[${file}]:`);
      [...new Set(cleanMatches)].forEach(u => console.log('  -', u));
    }
  }
});
