const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function searchAround(term) {
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log('=== ' + term + ' at ' + idx + ' ===');
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 400)));
    console.log('--------------------------------------------\n');
    idx += term.length;
  }
}

searchAround('refreshSessionForAutomation');
searchAround('prepareSessionForAutomation');
searchAround('createSessionFetch');
