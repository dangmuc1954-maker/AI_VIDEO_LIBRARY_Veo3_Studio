const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function searchMatches(term) {
  let pos = 0;
  while ((pos = content.indexOf(term, pos)) !== -1) {
    console.log(term, 'at', pos);
    console.log(content.slice(Math.max(0, pos - 50), pos + 150));
    pos += term.length;
  }
}
searchMatches('getNextRunnableJob');
searchMatches('getRunnableJob');
searchMatches('dequeue');
searchMatches('runNext');
