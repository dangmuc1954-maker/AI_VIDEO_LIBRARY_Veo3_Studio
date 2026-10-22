const fs = require('fs');
const content = fs.readFileSync('app/out/main/index.js', 'utf8');

function showFunc(name) {
  const idx = content.indexOf(name);
  if (idx !== -1) {
    console.log('=== ' + name + ' ===');
    console.log(content.slice(Math.max(0, idx - 50), Math.min(content.length, idx + 1500)));
  }
}

showFunc('resolveAutomationUrl(');
showFunc('isUsableAutomationSurface(');
