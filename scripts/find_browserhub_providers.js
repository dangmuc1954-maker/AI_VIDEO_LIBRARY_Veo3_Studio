const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

// Look for built-in or default providers array in BrowserHub
const searchTerms = ['ChatGPT', 'Minimax', 'Grok', 'Veo3', 'ElevenLabs'];
for (const term of searchTerms) {
  let idx = 0;
  while ((idx = content.indexOf(term, idx)) !== -1) {
    console.log(`Found ${term} at index ${idx}:`);
    console.log(content.slice(Math.max(0, idx - 150), Math.min(content.length, idx + 250)));
    console.log('----------------------------------------------------');
    idx += term.length;
    break; // just show first match
  }
}
