const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

function findSnippet(term, len = 600) {
  const idx = content.indexOf(term);
  console.log('=== SNIPPET FOR: ' + term + ' ===');
  if (idx !== -1) {
    console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + len)));
  } else {
    console.log('NOT FOUND');
  }
  console.log('------------------------------------\n');
}

findSnippet('/auth/session');
findSnippet('readSessionToken(');
findSnippet('readCredits(');
findSnippet('isGoogleFlowUrl(');
findSnippet('failProviderApiRecovery(');
findSnippet('deferProviderApiRecovery(');
