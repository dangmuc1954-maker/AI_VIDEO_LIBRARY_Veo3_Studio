const fs = require('fs');
const origFile = 'extracted_aiforge_studio_new/out/main/index.js';
if (fs.existsSync(origFile)) {
  const code = fs.readFileSync(origFile, 'utf8');
  const pos = code.indexOf('fetchAccessToken(');
  console.log('Original fetchAccessToken:');
  console.log(code.slice(pos, pos + 1500));
} else {
  console.log('File not found:', origFile);
}
