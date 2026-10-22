const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
      searchDir(full);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.ts'))) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('providerId:"veo3"') || content.includes('provider:"Veo3"') || content.includes('veo3')) {
        console.log('Match in:', full);
      }
    }
  }
}

searchDir('app');
