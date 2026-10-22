const fs = require('fs');

const content = fs.readFileSync('app/out/renderer/assets/BrowserHub-44JPDUjK.js', 'utf8');

// Find function B or where icons are chosen
let idx = 0;
while ((idx = content.indexOf('provider==="', idx)) !== -1 || (idx = content.indexOf('provider.toLowerCase()', idx)) !== -1) {
  console.log('provider at', idx);
  console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  console.log('----------------------------------------------------');
  break;
}

// Let's find definition of B
idx = content.indexOf('function B(');
if (idx !== -1) {
  console.log('function B at', idx);
  console.log(content.slice(idx, idx + 600));
} else {
  // Let's search for provider icon mapping
  const matches = content.match(/ChatGPT.*?Minimax.*?Grok/g);
  console.log('Matches:', matches);
}
