const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function extractAround(query, before = 300, after = 600) {
  let idx = 0;
  while ((idx = content.indexOf(query, idx)) !== -1) {
    console.log('=== MATCH FOR: ' + query + ' at ' + idx + ' ===');
    console.log(content.slice(Math.max(0, idx - before), Math.min(content.length, idx + query.length + after)));
    console.log('==================================================\n');
    idx += query.length;
  }
}

extractAround('isGoogleFlowUrl(');
extractAround('readSessionToken(');
extractAround('fetchAccessToken(e,t){');
extractAround('readCredits(e){');
extractAround('failProviderApiRecovery(e,t){');
extractAround('deferProviderApiRecovery(');
