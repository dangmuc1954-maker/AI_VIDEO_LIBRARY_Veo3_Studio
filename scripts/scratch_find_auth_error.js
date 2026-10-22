const fs = require('fs');
const path = require('path');

function searchInFile(filePath, term) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  let pos = 0;
  while ((pos = content.indexOf(term, pos)) !== -1) {
    console.log(`[${filePath} at ${pos}]:`);
    console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 250)));
    pos += term.length;
  }
}

searchInFile('app/out/main/index.js', 'authentication is no longer valid');
searchInFile('app/out/main/index.js', 'no longer valid');
searchInFile('app/out/main/index.js', 'AUTH_REQUIRED');
