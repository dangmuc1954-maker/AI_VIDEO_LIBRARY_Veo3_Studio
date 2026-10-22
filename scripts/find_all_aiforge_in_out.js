const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      searchDir(full);
    } else if (full.endsWith('.js') || full.endsWith('.html') || full.endsWith('.json')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('AIForge Studio') || content.includes('AIForgeStudio')) {
        console.log('Match in file:', full);
        let idx = 0;
        while ((idx = content.indexOf('AIForge', idx)) !== -1) {
          console.log('  ->', content.slice(Math.max(0, idx - 40), Math.min(content.length, idx + 60)).replace(/\s+/g, ' '));
          idx += 7;
        }
      }
    }
  }
}

searchDir('app/out');
