const fs = require('fs');
const path = require('path');

function search(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) search(full);
    else if (f.endsWith('.js') || f.endsWith('.cjs')) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('ChatGPT') && txt.includes('Minimax')) {
        console.log('Match:', full);
        // Find where they are defined together
        const idx = txt.indexOf('ChatGPT');
        console.log('Context:', txt.slice(Math.max(0, idx - 100), Math.min(txt.length, idx + 300)));
        console.log('========================================================');
      }
    }
  }
}

search('app/out');
