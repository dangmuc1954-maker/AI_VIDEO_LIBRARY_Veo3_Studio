const fs = require('fs');
const content = fs.readFileSync('temp_original_main.js', 'utf8');

function searchOriginal(query, maxMatches = 5) {
  let idx = 0;
  let count = 0;
  console.log('=== MATCHES FOR: ' + query + ' ===');
  while ((idx = content.indexOf(query, idx)) !== -1 && count < maxMatches) {
    console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 300)));
    console.log('------------------------------------\n');
    idx += query.length;
    count++;
  }
}

searchOriginal('veo_3');
searchOriginal('Lite (Lower Priority)');
searchOriginal('detectPageState');
searchOriginal('resolveAuthStatus');
searchOriginal('videoModels');
searchOriginal('userPaygateTier');
